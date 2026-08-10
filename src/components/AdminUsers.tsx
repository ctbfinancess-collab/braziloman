"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "./AdminLayout";
import { Icon } from "./Icons";

type AdminRole = "FULL" | "PARTNERS_BENEFITS";
type AdminUserRow = { id: string; name: string; email: string; role: AdminRole; createdAt: string };
type FormState = { id: string | null; name: string; email: string; password: string; role: AdminRole };
const EMPTY_FORM: FormState = { id: null, name: "", email: "", password: "", role: "FULL" };
const ROLE_LABELS: Record<AdminRole, string> = {
  FULL: "Administrador completo",
  PARTNERS_BENEFITS: "Secretária — só Parceiros & Benefícios",
};

/** Autenticação em duas etapas (2FA) da conta que está logada AGORA — não
 *  é gerenciável por outra pessoa, cada um ativa a própria (precisa escanear
 *  o QR code com o próprio celular). Some inteiramente pra quem entrou com
 *  a senha mestre, já que 2FA só existe pra contas individuais. */
export function MyTwoFactorCard() {
  const [state, setState] = useState<"loading" | "unavailable" | "disabled" | "enabling" | "enabled">("loading");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/me/totp");
    if (!res.ok) {
      setState("unavailable");
      return;
    }
    const json = await res.json();
    setState(json.enabled ? "enabled" : "disabled");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onStartSetup() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/me/totp", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível gerar o QR code.");
        return;
      }
      setQrDataUrl(json.qrDataUrl);
      setSecret(json.secret);
      setState("enabling");
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/me/totp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Código inválido.");
        return;
      }
      setCode("");
      setState("enabled");
    } finally {
      setBusy(false);
    }
  }

  async function onDisable(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/me/totp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Código inválido.");
        return;
      }
      setCode("");
      setDisabling(false);
      setState("disabled");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading" || state === "unavailable") return null;

  return (
    <div className="admin-2fa-card">
      <div className="admin-2fa-card-head">
        <div>
          <h3>Autenticação em duas etapas (2FA)</h3>
          <p>Protege a sua conta individual com um código do Google Authenticator, Authy ou similar, além da senha.</p>
        </div>
        {state === "enabled" && <span className="admin-badge tone-positive">Ativado</span>}
        {state === "disabled" && <span className="admin-badge tone-neutral">Desativado</span>}
      </div>

      {state === "disabled" && (
        <button type="button" className="btn btn-primary" onClick={onStartSetup} disabled={busy}>
          {busy ? "Gerando…" : "Ativar 2FA"}
        </button>
      )}

      {state === "enabling" && (
        <div className="admin-2fa-setup">
          <ol>
            <li>Abra o Google Authenticator (ou similar) e escaneie o QR code:</li>
          </ol>
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR code do 2FA" className="admin-2fa-qr" />
          )}
          {secret && <p className="admin-2fa-secret">Não consegue escanear? Digite manualmente: <code>{secret}</code></p>}
          <form onSubmit={onConfirm} className="admin-2fa-confirm-form">
            <label>
              Código gerado pelo app
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Confirmando…" : "Confirmar e ativar"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setState("disabled"); setCode(""); setError(""); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {state === "enabled" && !disabling && (
        <button type="button" className="btn btn-ghost" onClick={() => setDisabling(true)}>Desativar 2FA</button>
      )}

      {state === "enabled" && disabling && (
        <form onSubmit={onDisable} className="admin-2fa-confirm-form">
          <label>
            Confirme com o código atual do app pra desativar
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Desativando…" : "Confirmar desativação"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setDisabling(false); setCode(""); setError(""); }}>Cancelar</button>
          </div>
        </form>
      )}

      {error && <p className="form-note err">{error}</p>}
    </div>
  );
}

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

  function openEdit(u: AdminUserRow) {
    setError("");
    setForm({ id: u.id, name: u.name, email: u.email, password: "", role: u.role });
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const editing = Boolean(form.id);
      const payload = editing
        ? { name: form.name, email: form.email, role: form.role, ...(form.password ? { password: form.password } : {}) }
        : { name: form.name, email: form.email, password: form.password, role: form.role };
      const res = await fetch(editing ? `/api/admin/users/${form.id}` : "/api/admin/users", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível salvar o usuário.");
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
        <MyTwoFactorCard />

        {error && <p className="form-note err">{error}</p>}

        {form && (
          <form className="contact-form mp-form" onSubmit={onSave} style={{ marginBottom: 40, maxWidth: 480 }}>
            <h3 className="mp-form-title">{form.id ? "Editar usuário" : "Novo usuário"}</h3>
            <label>
              Nome
              <input type="text" required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              E-mail
              <input type="email" required maxLength={200} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              {form.id ? "Nova senha (opcional)" : "Senha"}
              <input
                type="password"
                required={!form.id}
                minLength={6}
                maxLength={200}
                placeholder={form.id ? "Deixe em branco pra manter a senha atual" : undefined}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <p className="cp-chips-label" style={{ marginTop: -10 }}>Mínimo de 6 caracteres.</p>
            <label>
              Nível de acesso
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}>
                <option value="FULL">{ROLE_LABELS.FULL}</option>
                <option value="PARTNERS_BENEFITS">{ROLE_LABELS.PARTNERS_BENEFITS}</option>
              </select>
            </label>
            <p className="cp-chips-label" style={{ marginTop: -10 }}>
              &ldquo;Secretária&rdquo; só enxerga a tela de Parceiros & Benefícios (parceiros, benefícios, categorias, captação) — não vê pedidos de associação, usuários nem o resto do painel.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Salvando…" : form.id ? "Salvar" : "Criar usuário"}</button>
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
                  <th>Nível de acesso</th>
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
                    <td>
                      <span className={`admin-badge tone-${u.role === "FULL" ? "positive" : "neutral"}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <button type="button" className="btn btn-ghost" onClick={() => openEdit(u)}>Editar</button>{" "}
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
