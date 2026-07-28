"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AdminLoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "err">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível entrar.");
        setStatus("err");
        return;
      }
      router.push("/admin/associados");
      router.refresh();
    } catch {
      setError("Não foi possível entrar.");
      setStatus("err");
    }
  }

  return (
    <section className="section">
      <div className="container reveal" style={{ maxWidth: 380 }}>
        <p className="section-eyebrow center">Administração</p>
        <h1 className="section-title center">Entrar</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <form className="contact-form mp-form" onSubmit={onSubmit} noValidate>
          <label>
            Senha de administrador
            <input type="password" name="password" required autoComplete="current-password" maxLength={200} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
            {status === "sending" ? "Entrando…" : "Entrar"}
          </button>
          {status === "err" && (
            <p className="form-note err" role="status" aria-live="polite">{error}</p>
          )}
        </form>
      </div>
    </section>
  );
}

type Application = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string | null;
  sector: string | null;
  country: string | null;
  phone: string | null;
  message: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

const statusLabel: Record<Application["status"], string> = {
  PENDING: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
};

export function AdminApplicationsList() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/applications");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao carregar.");
      return;
    }
    setApplications(json.applications);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setBusyId(id);
    await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setBusyId(null);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <section className="section">
      <div className="container reveal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="section-eyebrow">Administração</p>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Pedidos de Associação</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/admin/conteudo" className="btn btn-ghost">Conteúdo do site</Link>
            <button type="button" className="btn btn-ghost" onClick={logout}>Sair</button>
          </div>
        </div>
        <span className="about-flourish" aria-hidden="true" />

        {error && <p className="form-note err">{error}</p>}
        {!applications && !error && <p className="section-lead">Carregando…</p>}
        {applications && applications.length === 0 && (
          <p className="section-lead">Nenhum pedido de associação ainda.</p>
        )}

        <div style={{ display: "grid", gap: 20 }}>
          {applications?.map((a) => (
            <div key={a.id} className="about-section-card">
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 className="mp-subtitle mp-subtitle-tight" style={{ marginBottom: 4 }}>{a.name}</h3>
                  <p className="gov-role" style={{ marginBottom: 0 }}>{statusLabel[a.status]}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busyId === a.id || a.status === "APPROVED"}
                    onClick={() => updateStatus(a.id, "APPROVED")}
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busyId === a.id || a.status === "REJECTED"}
                    onClick={() => updateStatus(a.id, "REJECTED")}
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
              <p><b>E-mail:</b> {a.email}</p>
              <p><b>Empresa:</b> {a.company}</p>
              {a.role && <p><b>Cargo:</b> {a.role}</p>}
              {a.sector && <p><b>Setor:</b> {a.sector}</p>}
              {a.country && <p><b>País:</b> {a.country}</p>}
              {a.phone && <p><b>Telefone:</b> {a.phone}</p>}
              {a.message && <p><b>Mensagem:</b> {a.message}</p>}
              <p style={{ color: "var(--fg-dim)", fontSize: "0.82rem" }}>
                Enviado em {new Date(a.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
