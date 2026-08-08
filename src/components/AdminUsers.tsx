"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "./AdminLayout";
import { Icon } from "./Icons";

type AdminUserRow = { id: string; name: string; email: string; createdAt: string };
type FormState = { name: string; email: string; password: string };
const EMPTY_FORM: FormState = { name: "", email: "", password: "" };

/** Painel admin de Usuários — cria e remove contas individuais de administrador
 *  (login por e-mail + senha). Convive com a senha mestre compartilhada, que
 *  continua funcionando como acesso de reserva. */
export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao carregar.");
      return;
    }
    setUsers(json.users);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível criar o usuário.");
        return;
      }
      setForm(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Remover o acesso individual desse usuário? A senha mestre continua funcionando normalmente.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <AdminLayout
      active="usuarios"
      title="Usuários"
      lead="Contas individuais de acesso ao painel admin — além da senha mestre compartilhada, que continua funcionando normalmente."
      actions={<button type="button" className="btn btn-primary" onClick={() => setForm({ ...EMPTY_FORM })}><Icon name="plus" /> Novo usuário</button>}
    >
        {error && <p className="form-note err">{error}</p>}

        {form && (
          <form className="contact-form mp-form" onSubmit={onSave} style={{ marginBottom: 40, maxWidth: 480 }}>
            <h3 className="mp-form-title">Novo usuário</h3>
            <label>
              Nome
              <input type="text" required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              E-mail
              <input type="email" required maxLength={200} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Senha
              <input type="password" required minLength={6} maxLength={200} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </label>
            <p className="cp-chips-label" style={{ marginTop: -10 }}>Mínimo de 6 caracteres.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Criando…" : "Criar usuário"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
            </div>
          </form>
        )}

        {users === null ? (
          <p className="section-lead">Carregando…</p>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <Icon name="user" />
            <p>Nenhum usuário individual cadastrado ainda — o acesso segue funcionando pela senha mestre.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Criado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-table-person">
                        <span className="admin-table-avatar">{initials(u.name)}</span>
                        <span>
                          <strong>{u.name}</strong>
                          <small>{u.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <button type="button" className="btn btn-ghost" onClick={() => onDelete(u.id)}>Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </AdminLayout>
  );
}
