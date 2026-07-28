"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function MemberLoginForm() {
  const { d } = useI18n();
  const t = d.memberArea.login;
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
      const res = await fetch("/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t.genericError);
        setStatus("err");
        return;
      }
      router.push("/membro/painel");
      router.refresh();
    } catch {
      setError(t.genericError);
      setStatus("err");
    }
  }

  return (
    <section className="section">
      <div className="container reveal" style={{ maxWidth: 420 }}>
        <p className="section-eyebrow center">{t.eyebrow}</p>
        <h1 className="section-title center">{t.title}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead mp-lead-center">{t.lead}</p>

        <form className="contact-form mp-form" onSubmit={onSubmit} noValidate>
          <label>
            {t.email}
            <input type="email" name="email" required autoComplete="email" maxLength={160} />
          </label>
          <label>
            {t.password}
            <input type="password" name="password" required autoComplete="current-password" maxLength={72} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
            {status === "sending" ? t.submitting : t.submit}
          </button>
          {status === "err" && (
            <p className="form-note err" role="status" aria-live="polite">{error}</p>
          )}
        </form>

        <p className="mp-lead-center" style={{ marginTop: 14, fontSize: "0.9rem" }}>
          <Link href="/membro/esqueci-senha" className="launch-back" style={{ display: "inline" }}>{t.forgotLink}</Link>
        </p>
        <p className="mp-lead-center" style={{ marginTop: 10, fontSize: "0.9rem" }}>
          {t.noAccount} <Link href="/associe-se#mp-form" className="launch-back" style={{ display: "inline" }}>{t.applyLink}</Link>
        </p>
      </div>
    </section>
  );
}

export function ForgotPasswordForm() {
  const { d } = useI18n();
  const t = d.memberArea.forgotPassword;
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/member/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error || t.genericError);
        setStatus("err");
        return;
      }
      setStatus("ok");
    } catch {
      setError(t.genericError);
      setStatus("err");
    }
  }

  return (
    <section className="section">
      <div className="container reveal" style={{ maxWidth: 420 }}>
        <p className="section-eyebrow center">{t.eyebrow}</p>
        <h1 className="section-title center">{t.title}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead mp-lead-center">{t.lead}</p>

        {status === "ok" ? (
          <p className="form-note" role="status" aria-live="polite">{t.success}</p>
        ) : (
          <form className="contact-form mp-form" onSubmit={onSubmit} noValidate>
            <label>
              {t.email}
              <input type="email" name="email" required autoComplete="email" maxLength={160} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
              {status === "sending" ? t.submitting : t.submit}
            </button>
            {status === "err" && (
              <p className="form-note err" role="status" aria-live="polite">{error}</p>
            )}
          </form>
        )}

        <p className="mp-lead-center" style={{ marginTop: 24, fontSize: "0.9rem" }}>
          <Link href="/membro/login" className="launch-back" style={{ display: "inline" }}>{t.backToLogin}</Link>
        </p>
      </div>
    </section>
  );
}

export function ResetPasswordForm({ token }: { token: string | null }) {
  const { d } = useI18n();
  const t = d.memberArea.resetPassword;
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/member/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const firstIssue = json?.issues && Object.values(json.issues as Record<string, string[]>)[0]?.[0];
        setError(firstIssue || json?.error || t.genericError);
        setStatus("err");
        return;
      }
      setStatus("ok");
      form.reset();
    } catch {
      setError(t.genericError);
      setStatus("err");
    }
  }

  if (!token) {
    return (
      <section className="section">
        <div className="container reveal" style={{ maxWidth: 420 }}>
          <p className="section-eyebrow center">{t.eyebrow}</p>
          <h1 className="section-title center">{t.title}</h1>
          <span className="about-flourish mp-flourish-center" aria-hidden="true" />
          <p className="form-note err" style={{ textAlign: "center" }}>{t.invalidToken}</p>
          <p className="mp-lead-center" style={{ marginTop: 24, fontSize: "0.9rem" }}>
            <Link href="/membro/esqueci-senha" className="launch-back" style={{ display: "inline" }}>{t.requestNewLink}</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container reveal" style={{ maxWidth: 420 }}>
        <p className="section-eyebrow center">{t.eyebrow}</p>
        <h1 className="section-title center">{t.title}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead mp-lead-center">{t.lead}</p>

        {status === "ok" ? (
          <>
            <p className="form-note" role="status" aria-live="polite">{t.success}</p>
            <p className="mp-lead-center" style={{ marginTop: 24, fontSize: "0.9rem" }}>
              <Link href="/membro/login" className="launch-back" style={{ display: "inline" }}>{t.goToLogin}</Link>
            </p>
          </>
        ) : (
          <form className="contact-form mp-form" onSubmit={onSubmit} noValidate>
            <label>
              {t.password}
              <input type="password" name="password" required minLength={8} maxLength={72} autoComplete="new-password" />
            </label>
            <label>
              {t.confirmPassword}
              <input type="password" name="confirmPassword" required minLength={8} maxLength={72} autoComplete="new-password" />
            </label>
            <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
              {status === "sending" ? t.submitting : t.submit}
            </button>
            {status === "err" && (
              <p className="form-note err" role="status" aria-live="polite">{error}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export function LogoutButton() {
  const { d } = useI18n();
  const t = d.memberArea.panel;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    await fetch("/api/member/logout", { method: "POST" });
    router.push("/membro/login");
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={onLogout} disabled={loading}>
      {t.logout}
    </button>
  );
}

type MemberData = {
  name: string;
  email: string;
  company: string;
  role: string | null;
  sector: string | null;
  country: string | null;
  phone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export function MemberPanel({ member }: { member: MemberData }) {
  const { d } = useI18n();
  const t = d.memberArea.panel;
  const statusLabel =
    member.status === "APPROVED" ? t.statusApproved : member.status === "REJECTED" ? t.statusRejected : t.statusPending;
  const statusClass =
    member.status === "APPROVED" ? "gov-role" : member.status === "REJECTED" ? "form-note err" : "form-note";

  const rows: [string, string | null][] = [
    [t.fields.name, member.name],
    [t.fields.email, member.email],
    [t.fields.company, member.company],
    [t.fields.role, member.role],
    [t.fields.sector, member.sector],
    [t.fields.country, member.country],
    [t.fields.phone, member.phone],
    [t.fields.since, new Date(member.createdAt).toLocaleDateString()],
  ];

  return (
    <section className="section">
      <div className="container reveal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="section-eyebrow">{t.eyebrow}</p>
            <h1 className="section-title" style={{ marginBottom: 0 }}>{t.title}</h1>
          </div>
          <LogoutButton />
        </div>
        <span className="about-flourish" aria-hidden="true" />

        <div className="about-section-card" style={{ maxWidth: 640 }}>
          <p className="cp-chips-label">{t.statusLabel}</p>
          <p className={statusClass} style={{ marginBottom: 20 }}>{statusLabel}</p>
          <ul className="why-list about-why-list">
            {rows.map(([label, value]) => (
              <li key={label}><b>{label}:</b> {value || "—"}</li>
            ))}
          </ul>
        </div>

        <p className="partnership-block-lead">{t.comingSoon}</p>
      </div>
    </section>
  );
}
