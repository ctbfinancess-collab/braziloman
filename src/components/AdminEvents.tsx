"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "./AdminLayout";
import { AdminArticleImages } from "./AdminArticleImages";
import { Icon } from "./Icons";

type EventKind = "EVENTO" | "MISSAO";
type EventCurrency = "BRL" | "USD";

type ChamberEvent = {
  id: string;
  kind: EventKind;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  currency: EventCurrency;
};

const KIND_LABEL: Record<EventKind, string> = { EVENTO: "Evento", MISSAO: "Missão empresarial" };
const CURRENCY_LABEL: Record<EventCurrency, string> = { BRL: "R$ — Real", USD: "US$ — Dólar" };

type FormState = {
  id: string | null;
  kind: EventKind;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  /** Valor como texto, do jeito que o admin digitou (ex.: "150", "50.000", "1.500,90") — convertido pra centavos só ao salvar. */
  price: string;
  currency: EventCurrency;
};

const EMPTY_FORM: FormState = { id: null, kind: "EVENTO", title: "", description: "", date: "", location: "", imageUrl: "", price: "", currency: "BRL" };

/**
 * Interpreta valores digitados em formato brasileiro (ponto de milhar, vírgula
 * decimal — ex.: "50.000" = cinquenta mil) OU americano (vírgula de milhar,
 * ponto decimal — ex.: "1,500.00"), sem depender do admin escolher um formato.
 * Regra: o ÚLTIMO separador só é tratado como decimal se tiver exatamente 2
 * dígitos depois dele; senão é milhar e é descartado. Retorna centavos.
 */
function parsePriceInput(raw: string): number | null {
  const s = raw.trim().replace(/[^\d.,]/g, "");
  if (!s) return null;

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  const lastSepIdx = Math.max(lastComma, lastDot);

  let intPart: string;
  let decPart: string;
  if (lastSepIdx !== -1 && s.length - lastSepIdx - 1 === 2) {
    intPart = s.slice(0, lastSepIdx).replace(/[.,]/g, "");
    decPart = s.slice(lastSepIdx + 1);
  } else {
    intPart = s.replace(/[.,]/g, "");
    decPart = "00";
  }
  if (!intPart) return null;

  const cents = parseInt(intPart, 10) * 100 + parseInt(decPart, 10);
  return Number.isFinite(cents) ? cents : null;
}

function formatPriceLabel(cents: number | null, currency: EventCurrency) {
  if (!cents) return "Gratuito";
  return (cents / 100).toLocaleString(currency === "USD" ? "en-US" : "pt-BR", { style: "currency", currency });
}

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
      price: ev.priceCents ? (ev.priceCents / 100).toFixed(2) : "",
      currency: ev.currency,
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
      const priceCents = form.price.trim() ? parsePriceInput(form.price) : null;
      if (form.price.trim() && (priceCents === null || priceCents < 0)) {
        setError("Valor da inscrição inválido.");
        return;
      }
      const payload = {
        kind: form.kind,
        title: form.title,
        description: form.description || null,
        date: form.date,
        location: form.location || null,
        imageUrl: form.imageUrl || null,
        priceCents,
        currency: form.currency,
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
    <AdminLayout
      active="eventos"
      title="Eventos e Missões"
      lead="Cadastre eventos e missões empresariais e acompanhe as inscrições dos associados."
      actions={<button type="button" className="btn btn-primary" onClick={openNew}><Icon name="plus" /> Novo</button>}
    >
        {error && <p className="form-note err">{error}</p>}

        <AdminArticleImages />

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
            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ flex: 2 }}>
                Valor da inscrição
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Deixe em branco se for gratuito"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label style={{ flex: 1 }}>
                Moeda
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as EventCurrency })}>
                  {(Object.keys(CURRENCY_LABEL) as EventCurrency[]).map((c) => (
                    <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>
                  ))}
                </select>
              </label>
            </div>
            {form.price.trim() && (
              <p className="cp-chips-label" style={{ marginTop: -10 }}>
                {parsePriceInput(form.price) !== null
                  ? `Isso será salvo como ${formatPriceLabel(parsePriceInput(form.price), form.currency)}`
                  : "Valor não reconhecido — use só números."}
              </p>
            )}
            <p className="cp-chips-label" style={{ marginTop: -10 }}>
              Campo pronto para a cobrança automática via Stripe (ainda não integrada) — por enquanto é só informativo pro associado.
              Sem conversão automática: escolha diretamente a moeda em que a inscrição será cobrada.
            </p>
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
                      <p style={{ margin: "4px 0 0", color: "var(--fg-muted)", fontSize: "0.9rem" }}>{formatPriceLabel(ev.priceCents, ev.currency)}</p>
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
    </AdminLayout>
  );
}
