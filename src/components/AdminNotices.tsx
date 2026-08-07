"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Notice = { id: string; title: string; message: string; important: boolean; createdAt: string };

/** Painel admin de Avisos institucionais — cria e remove os avisos que aparecem
 *  no sino de notificações do Painel do Associado. */
export function AdminNotices() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<{ title: string; message: string; important: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/notices");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao carregar.");
      return;
    }
    setNotices(json.notices);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    if (!confirm("Remover este aviso?")) return;
    const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  return (
    <section className="section">
      <div className="container reveal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="section-eyebrow">Administração</p>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Avisos Institucionais</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/associados" className="btn btn-ghost">Pedidos de associação</Link>
            <Link href="/admin/eventos" className="btn btn-ghost">Eventos e Missões</Link>
            <Link href="/admin/parceiros" className="btn btn-ghost">Parceiros</Link>
            <button type="button" className="btn btn-primary" onClick={() => setForm({ title: "", message: "", important: false })}>+ Novo aviso</button>
            <button type="button" className="btn btn-ghost" onClick={logout}>Sair</button>
          </div>
        </div>
        <span className="about-flourish" aria-hidden="true" />

        {error && <p className="form-note err">{error}</p>}

        {form && (
          <form className="contact-form mp-form" onSubmit={onSave} style={{ marginBottom: 40, maxWidth: 560 }}>
            <h3 className="mp-form-title">Novo aviso</h3>
            <label>
              Título
              <input type="text" required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>
              Mensagem
              <textarea rows={4} required maxLength={2000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </label>
            <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={form.important} onChange={(e) => setForm({ ...form, important: e.target.checked })} style={{ width: "auto" }} />
              Marcar como importante
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Salvando…" : "Publicar"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
            </div>
          </form>
        )}

        {notices === null ? (
          <p className="section-lead">Carregando…</p>
        ) : notices.length === 0 ? (
          <p className="section-lead">Nenhum aviso publicado ainda.</p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {notices.map((n) => (
              <div key={n.id} className="about-section-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 0 }}>
                <div>
                  <p className="cp-chips-label" style={{ marginBottom: 4 }}>
                    {n.important ? "Importante · " : ""}{new Date(n.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  <p style={{ fontWeight: 600, margin: 0 }}>{n.title}</p>
                  <p style={{ margin: "4px 0 0", color: "var(--fg-muted)", fontSize: "0.9rem" }}>{n.message}</p>
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => onDelete(n.id)}>Remover</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
