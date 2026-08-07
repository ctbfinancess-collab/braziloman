"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";

export function MemberLoginForm() {
  const { d } = useI18n();
  const t = d.memberArea.login;
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "err">("idle");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <section className="section member-login-section">
      <div className="container reveal member-login-grid">
        <div className="member-login-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="member-login-hero-map" src="/hero-map-dots.png" alt="" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="member-login-hero-seal" src="/hero-seal.png" alt="" aria-hidden="true" />
          <div className="member-login-hero-content">
            <p className="section-eyebrow">{t.eyebrow}</p>
            <h1 className="member-login-hero-title">
              <span>{t.heroTitleLine1}</span>
              <span className="member-login-hero-title-gold">{t.heroTitleLine2}</span>
            </h1>
            <span className="about-flourish" aria-hidden="true" />
            <p className="member-login-hero-lead">{t.heroLead}</p>
            <div className="member-login-features">
              {t.features.map((f) => (
                <div className="member-login-feature" key={f.label}>
                  <Icon name={f.icon} />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="member-login-card-col">
          <div className="member-login-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="member-login-seal" src="/logo-ctb-transparent.png" alt="" aria-hidden="true" />
            <h2 className="member-login-card-title">{t.title}</h2>
            <span className="about-flourish mp-flourish-center" aria-hidden="true" />
            <p className="member-login-card-lead">{t.lead}</p>

            <form className="member-login-form" onSubmit={onSubmit} noValidate>
              <label className="member-login-label">
                {t.email}
                <div className="member-login-input-wrap">
                  <Icon name="user" />
                  <input type="email" name="email" placeholder={t.emailPlaceholder} required autoComplete="email" maxLength={160} />
                </div>
              </label>
              <label className="member-login-label">
                {t.password}
                <div className="member-login-input-wrap">
                  <Icon name="lock" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="current-password"
                    maxLength={72}
                  />
                  <button
                    type="button"
                    className="member-login-eye-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <Icon name={showPassword ? "eyeoff" : "eye"} />
                  </button>
                </div>
              </label>

              <div className="member-login-forgot">
                <Link href="/membro/esqueci-senha" className="launch-back" style={{ display: "inline" }}>{t.forgotLink}</Link>
              </div>

              <button type="submit" className="btn btn-primary member-login-submit" disabled={status === "sending"}>
                {status === "sending" ? t.submitting : t.submit}
              </button>
              {status === "err" && (
                <p className="form-note err" role="status" aria-live="polite">{error}</p>
              )}
            </form>
          </div>

          <div className="member-login-cta">
            <span className="member-login-cta-icon" aria-hidden="true"><Icon name="question" /></span>
            <div className="member-login-cta-text">
              <strong>{t.noAccount}</strong>
              <p>{t.noAccountLead}</p>
            </div>
            <Link href="/associe-se#mp-form" className="btn btn-ghost member-login-cta-btn">
              {t.applyLink} <Icon name="arrowright" />
            </Link>
          </div>
        </div>
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

export type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "INCOMPLETE"
  | "AWAITING_DOCUMENTS"
  | "UNDER_REVIEW"
  | "INFO_REQUESTED"
  | "CONDITIONALLY_APPROVED"
  | "APPROVED_PENDING_PAYMENT"
  | "ACTIVE"
  | "REJECTED"
  | "SUSPENDED";

type LoyaltyTransactionData = {
  id: string;
  actionId: string;
  points: number;
  note: string | null;
  createdAt: string;
  source: string;
};

export type MemberData = {
  name: string;
  email: string;
  company: string;
  role: string | null;
  sector: string | null;
  country: string | null;
  phone: string | null;
  status: ApplicationStatus;
  createdAt: string;
  membershipCategory?: string | null;
  annualContribution?: number | null;
  complianceNotes?: string | null;
  memberNumber: string | null;
  memberSince: string | null;
  pointsTotal: number;
  loyaltyTransactions: LoyaltyTransactionData[];
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Em análise",
  APPROVED: "Aprovado",
  INCOMPLETE: "Cadastro incompleto",
  AWAITING_DOCUMENTS: "Aguardando documentos",
  UNDER_REVIEW: "Em análise de compliance",
  INFO_REQUESTED: "Informações adicionais solicitadas",
  CONDITIONALLY_APPROVED: "Aprovado condicionalmente",
  APPROVED_PENDING_PAYMENT: "Aprovado — aguardando pagamento",
  ACTIVE: "Associado ativo",
  REJECTED: "Não aprovado",
  SUSPENDED: "Associação suspensa",
};

/** Tela exibida quando a candidatura não está mais editável, mas também ainda não é associado ativo. */
const STATUS_TONE: Partial<Record<ApplicationStatus, "positive" | "warning" | "negative">> = {
  CONDITIONALLY_APPROVED: "positive",
  APPROVED_PENDING_PAYMENT: "positive",
  UNDER_REVIEW: "warning",
  PENDING: "warning",
  REJECTED: "negative",
  SUSPENDED: "negative",
};
const STATUS_ICON: Record<"positive" | "warning" | "negative", string> = {
  positive: "shieldcheck",
  warning: "clock",
  negative: "question",
};

export function MemberStatusScreen({ member }: { member: MemberData }) {
  const { d } = useI18n();
  const t = d.memberArea.statusScreen;
  const statusLabel = STATUS_LABELS[member.status] ?? member.status;
  const tone = STATUS_TONE[member.status] ?? "warning";

  const messages: Partial<Record<ApplicationStatus, string>> = {
    UNDER_REVIEW: "Sua candidatura está em análise de compliance pela nossa equipe. Avisaremos por e-mail assim que houver uma atualização.",
    CONDITIONALLY_APPROVED: "Sua candidatura foi aprovada com condições. Nossa equipe vai entrar em contato com os próximos passos.",
    APPROVED_PENDING_PAYMENT: "Sua candidatura foi aprovada! Falta finalizar sua associação com o pagamento da contribuição anual — nossa equipe vai entrar em contato para combinar a forma de pagamento.",
    REJECTED: "Sua candidatura não foi aprovada neste momento. Se tiver dúvidas, entre em contato conosco.",
    SUSPENDED: "Sua associação está suspensa no momento. Entre em contato com a Câmara para mais informações.",
    PENDING: "Sua candidatura está em análise.",
  };

  return (
    <section className="status-hero">
      <div className="status-hero-overlay" aria-hidden="true" />
      <div className="container status-hero-inner">
        <div className="status-hero-top">
          <div>
            <p className="section-eyebrow status-hero-eyebrow">{t.eyebrow}</p>
            <h1 className="section-title status-hero-title">{t.title}</h1>
          </div>
          <LogoutButton />
        </div>
        <span className="about-flourish status-hero-flourish" aria-hidden="true" />

        <div className={`status-card tone-${tone}`}>
          <span className="status-card-icon"><Icon name={STATUS_ICON[tone]} /></span>
          <div className="status-card-body">
            <p className="cp-chips-label">{t.statusLabel}</p>
            <p className="status-card-value">{statusLabel}</p>
            <p className="status-card-lead">{messages[member.status] ?? "Acompanhe sua candidatura por aqui."}</p>
          </div>
        </div>

        {(member.membershipCategory || member.annualContribution != null) && (
          <div className="status-card status-card-secondary">
            {member.membershipCategory && (
              <div className="status-card-row">
                <span className="status-card-icon small"><Icon name="user" /></span>
                <div>
                  <p className="cp-chips-label">{t.categoryLabel}</p>
                  <p className="status-card-row-value">{member.membershipCategory}</p>
                </div>
              </div>
            )}
            {member.annualContribution != null && (
              <div className="status-card-row">
                <span className="status-card-icon small"><Icon name="creditcard" /></span>
                <div>
                  <p className="cp-chips-label">{t.contributionLabel}</p>
                  <p className="status-card-row-value">R$ {member.annualContribution.toLocaleString("pt-BR")}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="status-features">
          {t.features.map((f) => (
            <div className="status-feature" key={f.h}>
              <span className="status-feature-icon"><Icon name={f.icon} /></span>
              <div>
                <strong>{f.h}</strong>
                <span>{f.p}</span>
              </div>
            </div>
          ))}
        </div>

        <footer className="dash-motto status-hero-motto">
          <span className="dash-motto-line" aria-hidden="true" />
          <span>UNIÃO E PROSPERIDADE | الوحدة والازدهار ✦</span>
          <span className="dash-motto-line" aria-hidden="true" />
        </footer>
      </div>
    </section>
  );
}
