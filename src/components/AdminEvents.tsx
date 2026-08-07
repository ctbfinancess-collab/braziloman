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
};

const KIND_LABEL: Record<EventKind, string> = { EVENTO: "Evento", MISSAO: "Missão empresarial" };

type FormState = {
  id: string | null;
  kind: EventKind;
  title: string;
  description: string;
  date: string;
  location: string;
};

const EMPTY_FORM: FormState = { id: null, kind: "EVENTO", title: "", description: "", date: "", location: "" };

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
    });
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
              <div key={ev.id} className="about-section-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 0 }}>
                <div>
                  <p className="cp-chips-label" style={{ marginBottom: 4 }}>
                    {KIND_LABEL[ev.kind]} · {new Date(ev.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </p>
                  <p style={{ fontWeight: 600, margin: 0 }}>{ev.title}</p>
                  {ev.location && <p style={{ margin: "4px 0 0", color: "var(--fg-muted)", fontSize: "0.9rem" }}>{ev.location}</p>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => openEdit(ev)}>Editar</button>
                  <button type="button" className="btn btn-ghost" onClick={() => onDelete(ev.id)}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
