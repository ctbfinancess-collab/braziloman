"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Partner = {
  id: string;
  name: string;
  logoUrl: string | null;
  sector: string | null;
  website: string | null;
  order: number;
};

type FormState = {
  id: string | null;
  name: string;
  logoUrl: string;
  sector: string;
  website: string;
  order: string;
};

const EMPTY_FORM: FormState = { id: null, name: "", logoUrl: "", sector: "", website: "", order: "0" };

/** Painel admin de Parceiros — lista, cria, edita e remove os parceiros exibidos
 *  na página pública /parceiros. Curadoria 100% manual: nunca puxa automaticamente
 *  da base de associados, pra nunca sugerir uma parceria que não existe de verdade. */
export function AdminPartners() {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/partners");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao carregar.");
      return;
    }
    setPartners(json.partners);
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
    setForm({ ...EMPTY_FORM, order: String((partners?.length ?? 0) * 10) });
  }

  function openEdit(p: Partner) {
    setForm({
      id: p.id,
      name: p.name,
      logoUrl: p.logoUrl || "",
      sector: p.sector || "",
      website: p.website || "",
      order: String(p.order),
    });
  }

  const [uploadingLogo, setUploadingLogo] = useState(false);

  async function onUploadLogo(file: File) {
    setUploadingLogo(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      setForm((f) => (f ? { ...f, logoUrl: json.url } : f));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload da logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const order = parseInt(form.order, 10);
      const payload = {
        name: form.name,
        logoUrl: form.logoUrl || null,
        sector: form.sector || null,
        website: form.website || null,
        order: Number.isFinite(order) ? order : 0,
      };
      const res = await fetch(form.id ? `/api/admin/partners/${form.id}` : "/api/admin/partners", {
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
    if (!confirm("Remover este parceiro? Ele deixa de aparecer na página pública.")) return;
    const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  return (
    <section className="section">
      <div className="container reveal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="section-eyebrow">Administração</p>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Parceiros e Associados</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/associados" className="btn btn-ghost">Pedidos de associação</Link>
            <Link href="/admin/eventos" className="btn btn-ghost">Eventos e Missões</Link>
            <Link href="/admin/avisos" className="btn btn-ghost">Avisos</Link>
            <button type="button" className="btn btn-primary" onClick={openNew}>+ Novo</button>
            <button type="button" className="btn btn-ghost" onClick={logout}>Sair</button>
          </div>
        </div>
        <span className="about-flourish" aria-hidden="true" />
        <p className="section-lead" style={{ marginTop: -12, marginBottom: 32 }}>
          Aparece na página pública <strong>brasilomanchamber.org/parceiros</strong>. Cadastre só parceiros
          reais e confirmados — nunca use logo de empresa sem uma parceria de fato combinada com ela.
        </p>

        {error && <p className="form-note err">{error}</p>}

        {form && (
          <form className="contact-form mp-form" onSubmit={onSave} style={{ marginBottom: 40, maxWidth: 560 }}>
            <h3 className="mp-form-title">{form.id ? "Editar parceiro" : "Novo parceiro"}</h3>
            <label>
              Nome da empresa
              <input type="text" required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Setor
              <input type="text" maxLength={120} placeholder="Ex.: Logística, Energia, Tecnologia…" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
            </label>
            <label>
              Site (opcional)
              <input type="url" maxLength={300} placeholder="https://…" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </label>
            <label>
              Ordem de exibição
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </label>
            <p className="cp-chips-label" style={{ marginTop: -10 }}>Números menores aparecem primeiro no grid.</p>
            <label>
              Logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadLogo(file);
                }}
              />
            </label>
            {uploadingLogo && <p className="cp-chips-label">Enviando logo…</p>}
            {form.logoUrl && (
              <div style={{ marginTop: -8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logoUrl} alt="" style={{ width: 96, height: 96, objectFit: "contain", borderRadius: 6, border: "1px solid var(--border)", background: "#fff" }} />
                <button type="button" className="btn btn-ghost" style={{ marginTop: 8, display: "block" }} onClick={() => setForm({ ...form, logoUrl: "" })}>
                  Remover logo
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
            </div>
          </form>
        )}

        {partners === null ? (
          <p className="section-lead">Carregando…</p>
        ) : partners.length === 0 ? (
          <p className="section-lead">Nenhum parceiro cadastrado ainda.</p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {partners.map((p) => (
              <div key={p.id} className="about-section-card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {p.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logoUrl} alt="" style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 6, border: "1px solid var(--border)", background: "#fff", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 6, border: "1px solid var(--border)", flexShrink: 0 }} />
                    )}
                    <div>
                      <p className="cp-chips-label" style={{ marginBottom: 4 }}>Ordem {p.order}{p.sector ? ` · ${p.sector}` : ""}</p>
                      <p style={{ fontWeight: 600, margin: 0 }}>{p.name}</p>
                      {p.website && <p style={{ margin: "4px 0 0", color: "var(--fg-muted)", fontSize: "0.85rem" }}>{p.website}</p>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => openEdit(p)}>Editar</button>
                    <button type="button" className="btn btn-ghost" onClick={() => onDelete(p.id)}>Remover</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
