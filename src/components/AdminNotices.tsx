"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "./AdminLayout";
import { Icon } from "./Icons";

type Notice = { id: string; title: string; message: string; important: boolean; imageUrl: string | null; createdAt: string };
type FormState = { title: string; message: string; important: boolean; imageUrl: string };
const EMPTY_FORM: FormState = { title: "", message: "", important: false, imageUrl: "" };

/** Painel admin de Avisos institucionais — cria e remove os avisos que aparecem
 *  no sino de notificações do Painel do Associado. */
export function AdminNotices() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null }),
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
    <AdminLayout
      active="avisos"
      title="Comunicados"
      lead="Avisos institucionais exibidos no sino de notificações do Painel do Associado."
      actions={<button type="button" className="btn btn-primary" onClick={() => setForm({ ...EMPTY_FORM })}><Icon name="plus" /> Novo aviso</button>}
    >
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
            <label>
              Imagem (opcional)
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
                <button type="button" className="btn btn-ghost" style={{ marginTop: 8, display: "block" }} onClick={() => setForm({ ...form, imageUrl: "" })}>
                  Remover imagem
                </button>
              </div>
            )}
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
          <div className="admin-empty">
            <Icon name="megaphone" />
            <p>Nenhum aviso publicado ainda.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {notices.map((n) => (
              <div key={n.id} className="about-section-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 0 }}>
                <div style={{ display: "flex", gap: 16 }}>
                  {n.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.imageUrl} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)", flexShrink: 0 }} />
                  )}
                  <div>
                    <p className="cp-chips-label" style={{ marginBottom: 4 }}>
                      {n.important ? "Importante · " : ""}{new Date(n.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{n.title}</p>
                    <p style={{ margin: "4px 0 0", color: "var(--fg-muted)", fontSize: "0.9rem" }}>{n.message}</p>
                  </div>
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => onDelete(n.id)}>Remover</button>
              </div>
            ))}
          </div>
        )}
    </AdminLayout>
  );
}
