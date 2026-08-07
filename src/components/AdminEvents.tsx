"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type EventKind = "EVENTO" | "MISSAO";

type ChamberEvent = {
  id: string;
  kind: EventKind;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  imageUrl: string | null;
};

const KIND_LABEL: Record<EventKind, string> = { EVENTO: "Evento", MISSAO: "Missão empresarial" };

type FormState = {
  id: string | null;
  kind: EventKind;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
};

const EMPTY_FORM: FormState = { id: null, kind: "EVENTO", title: "", description: "", date: "", location: "", imageUrl: "" };

type Registration = {
  id: string;
  status: "CONFIRMED" | "CANCELLED";
  application: { id: string; name: string; company: string; email: string };
};

/** Painel admin de Eventos e Missões — lista, cria, edita e remove (usado nas
 *  páginas /admin/eventos e /membro/painel/eventos e /missoes lêem os mesmos dados). */
export function AdminEvents() {
  const [events, setEvents] = useState<ChamberEvent[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/events");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao carregar.");
      return;
    }
    setEvents(json.events);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function openNew() {
    setForm({ ...EMPTY_FORM });
  }

  function openEdit(ev: ChamberEvent) {
    setForm({
      id: ev.id,
      kind: ev.kind,
      title: ev.title,
      description: ev.description || "",
      date: ev.date.slice(0, 10),
      location: ev.location || "",
      imageUrl: ev.imageUrl || "",
    });
  }

  const [uploadingImage, setUploadingImage] = useState(false);

  async function onUploadImage(file: File) {
    setUploadingImage(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      setForm((f) => (f ? { ...f, imageUrl: json.url } : f));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload da imagem.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        kind: form.kind,
        title: form.title,
        description: form.description || null,
        date: form.date,
        location: form.location || null,
        imageUrl: form.imageUrl || null,
      };
      const res = await fetch(form.id ? `/api/admin/events/${form.id}` : "/api/admin/events", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível salvar.");
        return;
      }
      setForm(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Remover este item? Essa ação não pode ser desfeita.")) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[] | null>(null);

  async function toggleRegistrations(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setRegistrations(null);
    const res = await fetch(`/api/admin/events/${id}/registrations`);
    const json = await res.json();
    if (res.ok) setRegistrations(json.registrations);
  }

  async function updateRegistration(eventId: string, registrationId: string, status: "CONFIRMED" | "CANCELLED") {
    const res = await fetch(`/api/admin/events/${eventId}/registrations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId, status }),
    });
    if (res.ok) {
      const refreshed = await fetch(`/api/admin/events/${eventId}/registrations`);
      const json = await refreshed.json();
      if (refreshed.ok) setRegistrations(json.registrations);
    }
  }

  return (
    <section className="section">
      <div className="container reveal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="section-eyebrow">Administração</p>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Eventos e Missões</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/associados" className="btn btn-ghost">Pedidos de associação</Link>
            <Link href="/admin/avisos" className="btn btn-ghost">Avisos</Link>
            <button type="button" className="btn btn-primary" onClick={openNew}>+ Novo</button>
            <button type="button" className="btn btn-ghost" onClick={logout}>Sair</button>
          </div>
        </div>
        <span className="about-flourish" aria-hidden="true" />

        {error && <p className="form-note err">{error}</p>}

        {form && (
          <form className="contact-form mp-form" onSubmit={onSave} style={{ marginBottom: 40, maxWidth: 560 }}>
            <h3 className="mp-form-title">{form.id ? "Editar item" : "Novo item"}</h3>
            <label>
              Tipo
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as EventKind })}>
                <option value="EVENTO">Evento</option>
                <option value="MISSAO">Missão empresarial</option>
              </select>
            </label>
            <label>
              Título
              <input type="text" required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>
              Data
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label>
              Local
              <input type="text" maxLength={200} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </label>
            <label>
              Descrição
              <textarea rows={4} maxLength={4000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label>
              Imagem (card/propaganda)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadImage(file);
                }}
              />
            </label>
            {uploadingImage && <p className="cp-chips-label">Enviando imagem…</p>}
            {form.imageUrl && (
              <div style={{ marginTop: -8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="" style={{ width: "100%", maxWidth: 280, borderRadius: 6, border: "1px solid var(--border)" }} />
                <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setForm({ ...form, imageUrl: "" })}>
                  Remover imagem
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
            </div>
          </form>
        )}

        {events === null ? (
          <p className="section-lead">Carregando…</p>
        ) : events.length === 0 ? (
          <p className="section-lead">Nenhum evento ou missão cadastrado ainda.</p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {events.map((ev) => (
              <div key={ev.id} className="about-section-card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {ev.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ev.imageUrl} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)", flexShrink: 0 }} />
                    )}
                    <div>
                      <p className="cp-chips-label" style={{ marginBottom: 4 }}>
                        {KIND_LABEL[ev.kind]} · {new Date(ev.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                      </p>
                      <p style={{ fontWeight: 600, margin: 0 }}>{ev.title}</p>
                      {ev.location && <p style={{ margin: "4px 0 0", color: "var(--fg-muted)", fontSize: "0.9rem" }}>{ev.location}</p>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => toggleRegistrations(ev.id)}>
                      {expandedId === ev.id ? "Ocultar inscritos" : "Ver inscritos"}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => openEdit(ev)}>Editar</button>
                    <button type="button" className="btn btn-ghost" onClick={() => onDelete(ev.id)}>Remover</button>
                  </div>
                </div>

                {expandedId === ev.id && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                    {registrations === null ? (
                      <p className="cp-chips-label">Carregando inscritos…</p>
                    ) : registrations.length === 0 ? (
                      <p className="cp-chips-label">Nenhum associado inscrito ainda.</p>
                    ) : (
                      <div style={{ display: "grid", gap: 10 }}>
                        {registrations.map((r) => (
                          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 600 }}>{r.application.company}</p>
                              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--fg-muted)" }}>{r.application.name} · {r.application.email}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span className={`loyalty-tier-badge${r.status === "CONFIRMED" ? "" : " tier-black"}`}>
                                {r.status === "CONFIRMED" ? "Confirmado" : "Cancelado"}
                              </span>
                              {r.status === "CONFIRMED" ? (
                                <button type="button" className="btn btn-ghost" onClick={() => updateRegistration(ev.id, r.id, "CANCELLED")}>Cancelar</button>
                              ) : (
                                <button type="button" className="btn btn-ghost" onClick={() => updateRegistration(ev.id, r.id, "CONFIRMED")}>Confirmar</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
