"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import DOMPurify from "dompurify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type {
  PersonalData,
  CompanyData,
  BusinessProfile,
  ComplianceAnswer,
  DocumentEntry,
} from "@/lib/candidateSchemas";
import { COMPLIANCE_QUESTIONS } from "@/lib/candidateSchemas";
import { PersonalStep, CompanyStep, ProfileStep, ComplianceStep, DocumentsStep } from "@/components/CandidatePortal";
import { LOYALTY_ACTIONS, LOYALTY_CUSTOM_ACTION_ID, getActionLabel, getTier, TIER_NAMES } from "@/lib/loyalty";

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

type ApplicationStatus =
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
  status: ApplicationStatus;
  createdAt: string;
};

const statusLabel: Record<ApplicationStatus, string> = {
  PENDING: "Em análise (legado)",
  APPROVED: "Aprovado (legado)",
  INCOMPLETE: "Cadastro incompleto",
  AWAITING_DOCUMENTS: "Aguardando documentos",
  UNDER_REVIEW: "Em análise de compliance",
  INFO_REQUESTED: "Informações solicitadas",
  CONDITIONALLY_APPROVED: "Aprovado condicionalmente",
  APPROVED_PENDING_PAYMENT: "Aprovado — aguardando pagamento",
  ACTIVE: "Associado ativo",
  REJECTED: "Não aprovado",
  SUSPENDED: "Suspenso",
};

export function AdminApplicationsList() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState("");
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
            <Link href="/admin/mensagens" className="btn btn-ghost">Mensagens de contato</Link>
            <Link href="/admin/conteudo" className="btn btn-ghost">Conteúdo do site</Link>
            <Link href="/admin/eventos" className="btn btn-ghost">Eventos e Missões</Link>
            <Link href="/admin/avisos" className="btn btn-ghost">Avisos</Link>
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
                  <Link href={`/admin/associados/${a.id}`} className="btn btn-primary">
                    Ver detalhes
                  </Link>
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

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  createdAt: string;
};

export function AdminContactMessagesList() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/contact-messages");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao carregar.");
      return;
    }
    setMessages(json.messages);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="section">
      <div className="container reveal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="section-eyebrow">Administração</p>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Mensagens de Contato</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/admin/associados" className="btn btn-ghost">Pedidos de associação</Link>
          </div>
        </div>
        <span className="about-flourish" aria-hidden="true" />

        {error && <p className="form-note err">{error}</p>}
        {!messages && !error && <p className="section-lead">Carregando…</p>}
        {messages && messages.length === 0 && (
          <p className="section-lead">Nenhuma mensagem recebida ainda.</p>
        )}

        <div style={{ display: "grid", gap: 20 }}>
          {messages?.map((m) => (
            <div key={m.id} className="about-section-card">
              <h3 className="mp-subtitle mp-subtitle-tight" style={{ marginBottom: 4 }}>{m.name}</h3>
              <p><b>E-mail:</b> {m.email}</p>
              {m.company && <p><b>Empresa:</b> {m.company}</p>}
              <p style={{ whiteSpace: "pre-wrap" }}><b>Mensagem:</b> {m.message}</p>
              <p style={{ color: "var(--fg-dim)", fontSize: "0.82rem" }}>
                Enviado em {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type FullApplication = Application & {
  wizardStep: number;
  personalData: PersonalData | null;
  companyData: CompanyData | null;
  businessProfile: (BusinessProfile & Record<string, unknown>) | null;
  complianceAnswers: (ComplianceAnswer & { documentSignedUrl?: string })[] | null;
  documents: (DocumentEntry & { url: string })[] | null;
  declarations: Record<string, unknown> | null;
  riskLevel: string | null;
  complianceNotes: string | null;
  membershipCategory: string | null;
  annualContribution: number | null;
  aiSummary: string | null;
  aiSummaryGeneratedAt: string | null;
  memberNumber: string | null;
  memberSince: string | null;
  pointsTotal: number;
  loyaltyTransactions: { id: string; actionId: string; points: number; note: string | null; createdAt: string; source: string }[];
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  "INCOMPLETE",
  "AWAITING_DOCUMENTS",
  "UNDER_REVIEW",
  "INFO_REQUESTED",
  "CONDITIONALLY_APPROVED",
  "APPROVED_PENDING_PAYMENT",
  "ACTIVE",
  "REJECTED",
  "SUSPENDED",
];

// Candidaturas enviadas por uma versão mais antiga do Portal do Candidato salvaram
// esses campos como texto livre (string), não como lista estruturada — aceitar os
// dois formatos aqui evita que o detalhe da candidatura quebre pra registros antigos.
function renderPeopleList(
  rows: { name: string; [key: string]: unknown }[] | string | undefined,
  fields: string[]
): React.ReactNode {
  if (!rows) return null;
  if (typeof rows === "string") {
    // O texto é exibido dentro de um <p> (ver Row abaixo) — usa pre-line em vez de
    // <p> por linha para preservar as quebras sem aninhar blocos inválidos.
    return <span style={{ whiteSpace: "pre-line" }}>{rows}</span>;
  }
  if (rows.length === 0) return null;
  return (
    <ul className="why-list about-why-list">
      {rows.map((r, i) => (
        <li key={i}>{[r.name, ...fields.map((f) => r[f]).filter(Boolean)].join(" — ")}</li>
      ))}
    </ul>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return <p><b>{label}:</b> {value}</p>;
}

function renderMarkdown(text: string): string {
  const html = marked.parse(text, { async: false }) as string;
  return DOMPurify.sanitize(html);
}

export function AdminApplicationDetail({ id }: { id: string }) {
  const router = useRouter();
  const [app, setApp] = useState<FullApplication | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("INCOMPLETE");
  const [riskLevel, setRiskLevel] = useState("");
  const [complianceNotes, setComplianceNotes] = useState("");
  const [membershipCategory, setMembershipCategory] = useState("");
  const [annualContribution, setAnnualContribution] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [editingSection, setEditingSection] = useState<
    "personal" | "company" | "profile" | "compliance" | "documents" | null
  >(null);
  const [loyaltyActionId, setLoyaltyActionId] = useState<string>(LOYALTY_ACTIONS.find((a) => !a.automatic)?.id ?? "");
  const [customPoints, setCustomPoints] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [awarding, setAwarding] = useState(false);
  const [awardError, setAwardError] = useState("");

  function adminFieldSave(
    field: "personalData" | "companyData" | "businessProfile" | "complianceAnswers" | "documents"
  ) {
    return async (data: unknown) => {
      const res = await fetch(`/api/admin/applications/${id}/data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, data }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: json.error, issues: json.issues };
      return { ok: true };
    };
  }

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/applications/${id}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao carregar.");
      return;
    }
    const a: FullApplication = json.application;
    setApp(a);
    setStatus(a.status);
    setRiskLevel(a.riskLevel ?? "");
    setComplianceNotes(a.complianceNotes ?? "");
    setMembershipCategory(a.membershipCategory ?? "");
    setAnnualContribution(a.annualContribution != null ? String(a.annualContribution) : "");
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSave(statusOverride?: ApplicationStatus) {
    const nextStatus = statusOverride ?? status;
    setSaving(true);
    setSaved(false);
    setSaveError("");
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        riskLevel: riskLevel || null,
        complianceNotes: complianceNotes || null,
        membershipCategory: membershipCategory || null,
        annualContribution: annualContribution ? Number(annualContribution) : null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus(nextStatus);
      setSaved(true);
      await load();
      setTimeout(() => setSaved(false), 2500);
    } else {
      const json = await res.json().catch(() => ({}));
      setSaveError(json.error || `Não foi possível salvar (HTTP ${res.status}). Confira se a contribuição está entre 1.000 e 1.000.000.`);
    }
  }

  async function onAwardPoints() {
    setAwarding(true);
    setAwardError("");
    const isCustom = loyaltyActionId === LOYALTY_CUSTOM_ACTION_ID;
    const res = await fetch(`/api/admin/applications/${id}/loyalty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionId: loyaltyActionId,
        points: isCustom ? Number(customPoints) : undefined,
        note: isCustom ? customNote : undefined,
      }),
    });
    setAwarding(false);
    if (res.ok) {
      setCustomPoints("");
      setCustomNote("");
      await load();
    } else {
      const json = await res.json().catch(() => ({}));
      setAwardError(json.error || `Não foi possível conceder os pontos (HTTP ${res.status}).`);
    }
  }

  async function onGenerateAiSummary() {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch(`/api/admin/applications/${id}/ai-summary`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAiError(json.error || `Não foi possível gerar o resumo (HTTP ${res.status}).`);
        return;
      }
      await load();
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Não foi possível gerar o resumo.");
    } finally {
      setAiLoading(false);
    }
  }

  async function onDownloadPdf() {
    if (!summaryRef.current || !app) return;
    setPdfLoading(true);
    const el = summaryRef.current;
    const prevMaxHeight = el.style.maxHeight;
    const prevOverflow = el.style.overflowY;
    try {
      // A caixa tem altura limitada com rolagem na tela; pra capturar o
      // conteúdo inteiro (não só o que está visível), removemos o limite
      // temporariamente antes de gerar a imagem.
      el.style.maxHeight = "none";
      el.style.overflowY = "visible";
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#f5f2eb" });
      el.style.maxHeight = prevMaxHeight;
      el.style.overflowY = prevOverflow;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "px", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`resumo-compliance-${app.name.replace(/\s+/g, "-")}.pdf`);
    } finally {
      el.style.maxHeight = prevMaxHeight;
      el.style.overflowY = prevOverflow;
      setPdfLoading(false);
    }
  }

  if (error) return <section className="section"><div className="container reveal"><p className="form-note err">{error}</p></div></section>;
  if (!app) return <section className="section"><div className="container reveal"><p className="section-lead">Carregando…</p></div></section>;

  const p = app.personalData;
  const c = app.companyData;
  const b = app.businessProfile;

  return (
    <section className="section">
      <div className="container reveal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="section-eyebrow">Administração</p>
            <h1 className="section-title" style={{ marginBottom: 0 }}>{app.name}</h1>
            <p className="gov-role" style={{ marginBottom: 0 }}>{statusLabel[app.status]}</p>
          </div>
          <Link href="/admin/associados" className="btn btn-ghost">Voltar à lista</Link>
        </div>
        <span className="about-flourish" aria-hidden="true" />

        <div className="about-section-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <h3 className="mp-subtitle mp-subtitle-tight" style={{ marginBottom: 0 }}>Resumo de triagem (IA)</h3>
            <div style={{ display: "flex", gap: 8 }}>
              {app.aiSummary && (
                <button type="button" className="btn btn-ghost" onClick={onDownloadPdf} disabled={pdfLoading}>
                  {pdfLoading ? "Gerando PDF…" : "Baixar PDF"}
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={onGenerateAiSummary} disabled={aiLoading}>
                {aiLoading ? "Gerando…" : app.aiSummary ? "Regenerar resumo" : "Gerar resumo com IA"}
              </button>
            </div>
          </div>
          {aiError && <p className="form-note err">{aiError}</p>}
          {app.aiSummary ? (
            <>
              <div ref={summaryRef} className="ai-summary-box" dangerouslySetInnerHTML={{ __html: renderMarkdown(app.aiSummary) }} />
              {app.aiSummaryGeneratedAt && (
                <p style={{ color: "var(--fg-dim)", fontSize: "0.78rem", marginTop: 10 }}>
                  Gerado em {new Date(app.aiSummaryGeneratedAt).toLocaleString()} — é só um apoio à leitura, a decisão é sempre sua.
                </p>
              )}
            </>
          ) : (
            <p className="section-lead" style={{ margin: "10px 0 0" }}>
              Nenhum resumo gerado ainda. Ele é criado automaticamente quando o candidato envia a candidatura completa, ou clique acima para gerar agora.
            </p>
          )}
        </div>

        <div className="about-section-card">
          <h3 className="mp-subtitle mp-subtitle-tight">Ações rápidas</h3>
          <p className="section-lead" style={{ marginBottom: 14 }}>
            Aprovar/rejeitar aqui já salva e envia o e-mail correspondente na hora. Use os campos abaixo se quiser ajustar risco, categoria ou notas antes.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => onSave("APPROVED_PENDING_PAYMENT")}>
              Aprovar (aguardando pagamento)
            </button>
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => onSave("ACTIVE")}>
              Marcar como associado ativo
            </button>
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => onSave("INFO_REQUESTED")}>
              Solicitar informações
            </button>
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => onSave("REJECTED")}>
              Rejeitar
            </button>
          </div>
        </div>

        {(app.status === "ACTIVE" || app.status === "APPROVED") && (
          <div className="about-section-card">
            <h3 className="mp-subtitle mp-subtitle-tight">Programa de Fidelidade</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
              <span className={`loyalty-tier-badge tier-${getTier(app.pointsTotal).toLowerCase()}`}>
                {TIER_NAMES[getTier(app.pointsTotal)]}
              </span>
              <p style={{ margin: 0 }}><b>Pontos:</b> {app.pointsTotal.toLocaleString("pt-BR")}</p>
              {app.memberNumber && <p style={{ margin: 0 }}><b>Nº de associado:</b> {app.memberNumber}</p>}
              {app.memberSince && (
                <p style={{ margin: 0 }}><b>Associado desde:</b> {new Date(app.memberSince).toLocaleDateString()}</p>
              )}
            </div>

            <div className="wiz-grid">
              <label className="wiz-field">
                Ação
                <select value={loyaltyActionId} onChange={(e) => setLoyaltyActionId(e.target.value)}>
                  {LOYALTY_ACTIONS.filter((a) => !a.automatic).map((a) => (
                    <option key={a.id} value={a.id}>{a.labelPt} (+{a.points})</option>
                  ))}
                  <option value={LOYALTY_CUSTOM_ACTION_ID}>Ação personalizada</option>
                </select>
              </label>
              {loyaltyActionId === LOYALTY_CUSTOM_ACTION_ID && (
                <>
                  <label className="wiz-field">
                    Pontos
                    <input
                      type="number"
                      value={customPoints}
                      onChange={(e) => setCustomPoints(e.target.value)}
                      placeholder="Ex: 250"
                    />
                  </label>
                  <label className="wiz-field" style={{ gridColumn: "1 / -1" }}>
                    Observação
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Ex: Palestra especial no fórum de investimentos"
                    />
                  </label>
                </>
              )}
            </div>
            {awardError && <p className="form-note err">{awardError}</p>}
            <button type="button" className="btn btn-ghost" disabled={awarding} onClick={onAwardPoints} style={{ marginTop: 10 }}>
              {awarding ? "Concedendo…" : "Conceder pontos"}
            </button>

            {app.loyaltyTransactions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p className="cp-chips-label">Atividade recente</p>
                <div className="loyalty-activity-list">
                  {app.loyaltyTransactions.map((tx) => (
                    <div className="loyalty-activity-item" key={tx.id}>
                      <span>{tx.actionId === "CUSTOM" && tx.note ? tx.note : getActionLabel(tx.actionId, "pt")}</span>
                      <span className="loyalty-activity-points">+{tx.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="about-section-card">
          <h3 className="mp-subtitle mp-subtitle-tight">Análise detalhada (etapa {app.wizardStep}/7)</h3>
          <div className="wiz-grid">
            <label className="wiz-field">
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
            </label>
            <label className="wiz-field">
              Classificação de risco
              <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                <option value="">—</option>
                <option value="LOW">Baixo</option>
                <option value="MEDIUM">Médio</option>
                <option value="HIGH">Alto</option>
              </select>
            </label>
            <label className="wiz-field">
              Categoria de associação
              <select value={membershipCategory} onChange={(e) => setMembershipCategory(e.target.value)}>
                <option value="">—</option>
                <option value="Associado Empresarial">Associado Empresarial</option>
                <option value="Associado Corporativo">Associado Corporativo</option>
                <option value="Associado Estratégico">Associado Estratégico</option>
              </select>
            </label>
            <label className="wiz-field">
              Contribuição anual (R$) — entre 1.000 e 1.000.000
              <input
                type="number"
                min={1000}
                max={1000000}
                step={100}
                value={annualContribution}
                onChange={(e) => setAnnualContribution(e.target.value)}
              />
            </label>
          </div>
          <label className="wiz-field" style={{ marginTop: 12 }}>
            Notas internas / pedido de informações
            <textarea rows={3} value={complianceNotes} onChange={(e) => setComplianceNotes(e.target.value)} />
          </label>
          <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => onSave()} disabled={saving}>
            {saving ? "Salvando…" : "Salvar análise"}
          </button>
          {saved && <span className="form-note" style={{ marginLeft: 12, color: "var(--gold)" }}>Salvo — e-mail enviado se o status mudou.</span>}
          {saveError && <p className="form-note err">{saveError}</p>}
        </div>

        {p && (
          <div className="about-section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="mp-subtitle mp-subtitle-tight" style={{ marginBottom: 0 }}>Dados do responsável</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingSection(editingSection === "personal" ? null : "personal")}>
                {editingSection === "personal" ? "Cancelar" : "Editar"}
              </button>
            </div>
            {editingSection === "personal" ? (
              <PersonalStep
                initial={p}
                onSave={adminFieldSave("personalData")}
                onNext={() => { setEditingSection(null); load(); }}
                submitLabel="Salvar alterações"
              />
            ) : (
              <>
                <Row label="Nome" value={p.fullName} />
                <Row label="Nacionalidade" value={p.nationality} />
                <Row label="Data de nascimento" value={p.birthDate} />
                <Row label="CPF/documento" value={p.taxId} />
                <Row label="RG/passaporte/Emirates ID" value={p.idDocument} />
                <Row label="Cargo / Relação com a empresa" value={p.role} />
                <Row label="Telefone" value={p.phone} />
                <Row label="WhatsApp" value={p.whatsapp} />
                <Row label="E-mail" value={p.email} />
                <Row label="Endereço" value={p.address} />
                <Row label="País de residência" value={p.residenceCountry} />
                <Row label="LinkedIn/currículo" value={p.linkedin} />
                <Row label="Já possui relacionamento com Omã" value={p.hasOmanRelationship ? `Sim — ${p.omanRelationshipWho ?? ""}` : "Não"} />
                <Row label="Indicado por" value={p.referredBy} />
                <Row label="Autorizado a representar" value={p.authorizedRepresentative ? "Sim" : "Não"} />
              </>
            )}
          </div>
        )}

        {c && (
          <div className="about-section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="mp-subtitle mp-subtitle-tight" style={{ marginBottom: 0 }}>Dados da empresa</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingSection(editingSection === "company" ? null : "company")}>
                {editingSection === "company" ? "Cancelar" : "Editar"}
              </button>
            </div>
            {editingSection === "company" ? (
              <CompanyStep
                initial={c}
                onSave={adminFieldSave("companyData")}
                onNext={() => { setEditingSection(null); load(); }}
                submitLabel="Salvar alterações"
              />
            ) : (
              <>
                <Row label="Tipo" value={c.entityType === "foreign" ? "Estrangeira" : "Brasileira"} />
                <Row label="Razão social" value={c.legalName} />
                <Row label="Nome comercial" value={c.tradeName} />
                <Row label={c.entityType === "foreign" ? "Registro" : "CNPJ"} value={c.registrationNumber} />
                <Row label="Constituição" value={c.foundingDate} />
                <Row label="Sede" value={`${c.cityHQ}, ${c.countryHQ}`} />
                <Row label="Endereço" value={c.address} />
                <Row label="Site" value={c.website} />
                <Row label="Telefone" value={c.phone} />
                <Row label="E-mail institucional" value={c.institutionalEmail} />
                <Row label="Natureza jurídica" value={c.legalNature} />
                <Row label="Capital social" value={c.shareCapital} />
                <Row label="Funcionários" value={c.employeeCount} />
                <Row label="Setores" value={c.sectors} />
                <Row label="Produtos e serviços" value={c.productsServices} />
                <Row label="Países onde opera" value={c.countriesOfOperation} />
                <Row label="Filiais" value={c.affiliates} />
                <Row label="Administradores" value={renderPeopleList(c.administrators, ["document", "role"])} />
                <Row label="Quadro societário" value={renderPeopleList(c.shareholderStructure, ["stake", "nationality"])} />
                <Row label="Beneficiários finais" value={renderPeopleList(c.beneficialOwners, ["stake", "relatedCompany"])} />
                <Row label="Grupo econômico" value={c.belongsToEconomicGroup ? (c.economicGroupName as string) || "Sim" : undefined} />
                <Row label="Certificações" value={(c.certificationTypes as string[] | undefined)?.join(", ")} />
                <Row label="Receita anual consolidada" value={c.consolidatedAnnualRevenueRange ? `${c.consolidatedAnnualRevenueRange} (${c.revenueCurrency ?? ""})` : undefined} />
              </>
            )}
          </div>
        )}

        {b && (
          <div className="about-section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="mp-subtitle mp-subtitle-tight" style={{ marginBottom: 0 }}>Perfil comercial e diagnóstico</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingSection(editingSection === "profile" ? null : "profile")}>
                {editingSection === "profile" ? "Cancelar" : "Editar"}
              </button>
            </div>
            {editingSection === "profile" ? (
              <ProfileStep
                initial={b}
                onSave={adminFieldSave("businessProfile")}
                onNext={() => { setEditingSection(null); load(); }}
                submitLabel="Salvar alterações"
              />
            ) : (
              <>
                <Row label="Faturamento anual" value={b.annualRevenueRange} />
                <Row label="Principais mercados" value={b.mainMarkets as string} />
                <Row label="Interesse no Brasil" value={b.interestInBrazil} />
                <Row label="O que pretende fazer em Omã" value={b.omanProjectDescription as string} />
                <Row label="Objetivo da associação" value={b.membershipGoal} />
                <Row label="O que faria a associação ser um sucesso" value={b.expectationFromChamber} />
                <Row label="Categorias de produto" value={(b.productCategories as string[] | undefined)?.join(", ")} />
                <Row label="Descrição do produto" value={b.productDescription as string} />
                <Row label="Objetivo principal na Câmara" value={(b.mainGoals as string[] | undefined)?.join(", ")} />
                <Row label="Mercado-alvo" value={(b.targetMarkets as string[] | undefined)?.join(", ")} />
                <Row label="Já exporta/importa" value={b.exportsOrImports ? "Sim" : "Não"} />
                <Row label="Precisa de financiamento" value={b.needsFinancing ? "Sim" : "Não"} />
                <Row label="Pretende abrir filial" value={b.plansToOpenBranch ? "Sim" : "Não"} />
                <Row label="Desafios esperados" value={(b.expectedChallenges as string[] | undefined)?.join(", ")} />
                <Row label="Áreas de apoio esperado" value={(b.chamberSupportAreas as string[] | undefined)?.join(", ")} />
                <Row label="Outras dificuldades" value={b.mainDifficulties as string} />
              </>
            )}
          </div>
        )}

        {app.complianceAnswers && app.complianceAnswers.length > 0 && (
          <div className="about-section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="mp-subtitle mp-subtitle-tight" style={{ marginBottom: 0 }}>Compliance e integridade</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingSection(editingSection === "compliance" ? null : "compliance")}>
                {editingSection === "compliance" ? "Cancelar" : "Editar"}
              </button>
            </div>
            {editingSection === "compliance" ? (
              <ComplianceStep
                initial={app.complianceAnswers}
                onSave={adminFieldSave("complianceAnswers")}
                onNext={() => { setEditingSection(null); load(); }}
                submitLabel="Salvar alterações"
              />
            ) : (
              app.complianceAnswers.map((a) => {
                const q = COMPLIANCE_QUESTIONS.find((q) => q.key === a.key);
                return (
                  <div key={a.key} style={{ marginBottom: 12 }}>
                    <p style={{ marginBottom: 2 }}>
                      <b>{q?.label ?? a.key}:</b> {a.answer === "yes" ? "Sim" : "Não"}
                    </p>
                    {a.explanation && <p style={{ marginTop: 0, color: "var(--fg-muted)" }}>{a.explanation}</p>}
                    {a.documentSignedUrl && <a href={a.documentSignedUrl} target="_blank" rel="noreferrer">Ver anexo</a>}
                  </div>
                );
              })
            )}
          </div>
        )}

        {app.documents && app.documents.length > 0 && (
          <div className="about-section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="mp-subtitle mp-subtitle-tight" style={{ marginBottom: 0 }}>Documentos enviados</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingSection(editingSection === "documents" ? null : "documents")}>
                {editingSection === "documents" ? "Cancelar" : "Editar"}
              </button>
            </div>
            {editingSection === "documents" ? (
              <DocumentsStep
                entityType={c?.entityType ?? "br"}
                initial={app.documents}
                onSave={adminFieldSave("documents")}
                onNext={() => { setEditingSection(null); load(); }}
                submitLabel="Salvar alterações"
              />
            ) : (
              <ul className="why-list about-why-list">
                {app.documents.map((d) => (
                  <li key={d.key}>
                    <b>{d.label}:</b>{" "}
                    {d.url ? <a href={d.url} target="_blank" rel="noreferrer">{d.fileName || "ver arquivo"}</a> : "—"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {app.declarations && (
          <div className="about-section-card">
            <h3 className="mp-subtitle mp-subtitle-tight">Declarações e assinatura</h3>
            <Row label="Assinado por" value={app.declarations.signatureName as string} />
            <Row label="Cargo" value={app.declarations.signatureRole as string} />
            <Row label="Data" value={app.declarations.signatureDate ? new Date(app.declarations.signatureDate as string).toLocaleString() : undefined} />
            <Row label="IP" value={app.declarations.signatureIp as string} />
          </div>
        )}
      </div>
    </section>
  );
}
