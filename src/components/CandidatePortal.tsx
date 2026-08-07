"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogoUploader } from "./LogoUploader";
import {
  WIZARD_STEPS,
  COMPLIANCE_QUESTIONS,
  DOCUMENT_SLOTS_BR,
  DOCUMENT_SLOTS_FOREIGN,
  DOCUMENT_STATUS_OPTIONS,
  ROLE_OPTIONS,
  LANGUAGE_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  OMAN_RELATIONSHIP_TYPES,
  LEGAL_NATURE_OPTIONS,
  COMPANY_CERTIFICATION_OPTIONS,
  CURRENCY_OPTIONS,
  CONSOLIDATED_REVENUE_RANGES,
  MAIN_GOALS_OPTIONS,
  TARGET_MARKETS_OPTIONS,
  PRODUCT_CATEGORIES,
  PRODUCT_CERTIFICATIONS_OPTIONS,
  COMMERCIAL_SITUATION_OPTIONS,
  MATCHMAKING_TYPES_OPTIONS,
  PROJECT_TIMELINE_OPTIONS,
  PROJECT_SCALE_OPTIONS,
  PROJECT_FINANCIAL_RANGE_OPTIONS,
  PROJECT_STAGE_OPTIONS,
  NEXT_12M_GOALS_OPTIONS,
  PRIORITY_URGENCY_OPTIONS,
  CHALLENGE_GROUPS,
  CHAMBER_SUPPORT_AREAS_OPTIONS,
  type PersonalData,
  type CompanyData,
  type AdministratorEntry,
  type ShareholderEntry,
  type BeneficialOwnerEntry,
  type BusinessProfile,
  type ComplianceAnswer,
  type DocumentEntry,
} from "@/lib/candidateSchemas";

type UploadedDoc = DocumentEntry & { url: string };

type AppData = {
  status: string;
  wizardStep: number;
  logoUrl: string | null;
  personalData: PersonalData | null;
  companyData: (CompanyData & Record<string, unknown>) | null;
  businessProfile: (BusinessProfile & Record<string, unknown>) | null;
  complianceAnswers: (ComplianceAnswer & { documentSignedUrl?: string })[] | null;
  documents: UploadedDoc[] | null;
  declarations: Record<string, unknown> | null;
};

async function saveStep(step: number, data: unknown): Promise<{ ok: boolean; error?: string; issues?: unknown }> {
  const res = await fetch("/api/member/application", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step, data }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: json.error, issues: json.issues };
  return { ok: true };
}

/** Converte o flatten() do Zod em uma mensagem legível, trocando as chaves em inglês pelo rótulo em PT do campo. */
function formatIssues(issues: unknown, labels: Record<string, string>): string | null {
  if (!issues || typeof issues !== "object") return null;
  const flat = issues as { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
  const parts: string[] = [];
  if (flat.fieldErrors) {
    for (const [key, msgs] of Object.entries(flat.fieldErrors)) {
      if (!msgs || msgs.length === 0) continue;
      parts.push(`${labels[key] ?? key}: ${msgs[0]}`);
    }
  }
  if (flat.formErrors?.length) parts.push(...flat.formErrors);
  return parts.length ? parts.join(" · ") : null;
}

const PERSONAL_LABELS: Record<string, string> = {
  fullName: "Nome completo",
  nationality: "Nacionalidade",
  birthDate: "Data de nascimento",
  taxId: "CPF ou documento estrangeiro",
  idDocument: "RG, CPF, passaporte ou documento de identidade",
  role: "Cargo / Relação com a empresa",
  phone: "Telefone",
  whatsapp: "WhatsApp",
  email: "E-mail",
  address: "Endereço",
  residenceCountry: "País de residência",
  linkedin: "Currículo ou LinkedIn",
  authorizedRepresentative: "Autorização de representação",
};

const COMPANY_LABELS: Record<string, string> = {
  entityType: "Tipo de empresa",
  legalName: "Razão social",
  tradeName: "Nome comercial",
  registrationNumber: "CNPJ ou registro estrangeiro",
  foundingDate: "Data de constituição",
  countryHQ: "País da sede",
  cityHQ: "Cidade da sede",
  address: "Endereço completo",
  website: "Site",
  phone: "Telefone",
  institutionalEmail: "E-mail institucional",
  legalNature: "Natureza jurídica",
  shareCapital: "Capital social",
  employeeCount: "Número de empregados",
  sectors: "Setores de atuação",
  productsServices: "Produtos e serviços",
  countriesOfOperation: "Países onde opera",
  affiliates: "Filiais e empresas relacionadas",
  administrators: "Nome dos administradores",
  shareholderStructure: "Quadro societário",
  beneficialOwners: "Beneficiários finais",
};

const PROFILE_LABELS: Record<string, string> = {
  annualRevenueRange: "Faturamento anual (faixa)",
  mainMarkets: "Principais mercados",
  importExportVolume: "Volume de importação/exportação",
  interestInBrazil: "Interesse no Brasil",
  sectorsOfInterest: "Setores de interesse",
  membershipGoal: "Objetivo da associação",
  partnershipType: "Tipo de parceria procurada",
  expectationFromChamber: "O que faria esta associação ser um sucesso",
  mainDifficulties: "Principais dificuldades encontradas",
  productCategories: "Categoria do produto",
  productDescription: "Descrição do produto",
  omanProjectDescription: "O que você pretende fazer em Omã",
};

const DECLARATION_LABELS: Record<string, string> = {
  confirmTruthfulInfo: "Declaração: informações verdadeiras",
  confirmAuthorized: "Declaração: autorização para representar a empresa",
  confirmWillUpdate: "Declaração: comunicar mudanças cadastrais",
  acceptsIntegrityChecks: "Declaração: verificações de integridade",
  acceptsDataProcessing: "Declaração: tratamento de dados",
  knowsCodeOfEthics: "Declaração: código de ética",
  acceptsStatute: "Declaração: estatuto e regras",
  understandsDecision: "Declaração: entendimento sobre a decisão",
  confirmDataUpdate: "Declaração: manter dados atualizados",
  confirmComplementaryDocs: "Declaração: ciência sobre documentos complementares",
  confirmNoBrokerageObligation: "Declaração: ciência sobre não obrigação de intermediação",
  signatureName: "Nome (assinatura eletrônica)",
  signatureRole: "Cargo",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="wiz-field">
      {label}
      {children}
    </label>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder ?? "Selecione…"}</option>
      {options.map((o) => (
        <option value={o} key={o}>{o}</option>
      ))}
    </select>
  );
}

function CheckboxGroup({
  options,
  selected,
  onChange,
  max,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  function toggle(opt: string) {
    const has = selected.includes(opt);
    if (has) {
      onChange(selected.filter((o) => o !== opt));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, opt]);
    }
  }
  return (
    <div className="wiz-checkbox-grid">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        const disabled = Boolean(max) && !checked && selected.length >= (max as number);
        return (
          <label className={`wiz-check${disabled ? " wiz-check-disabled" : ""}`} key={opt}>
            <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(opt)} />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

function LinkPreview({ value }: { value?: string }) {
  if (!value || !value.trim()) return null;
  const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return (
    <span className="wiz-field-link">
      <a href={href} target="_blank" rel="noreferrer">Abrir link ↗</a>
    </span>
  );
}

function YesNo({ value, onChange }: { value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <div className="wiz-yesno">
      <label>
        <input type="radio" checked={value === true} onChange={() => onChange(true)} /> Sim
      </label>
      <label>
        <input type="radio" checked={value === false} onChange={() => onChange(false)} /> Não
      </label>
    </div>
  );
}

function DocUploadButton({
  docKey,
  label,
  existing,
  onUploaded,
  statusEditable,
  onStatusChange,
}: {
  docKey: string;
  label: string;
  existing?: UploadedDoc;
  onUploaded: (doc: UploadedDoc) => void;
  statusEditable?: boolean;
  onStatusChange?: (status: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("docKey", docKey);
      form.append("label", label);
      const res = await fetch("/api/member/document", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      onUploaded(json.document);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const statusLabel = DOCUMENT_STATUS_OPTIONS.find((s) => s.value === (existing?.status ?? "sent"))?.label ?? "Enviado";

  return (
    <div className="wiz-upload">
      {existing ? (
        <span className="wiz-upload-ok">
          ✓ {existing.fileName}{" "}
          {existing.url && (
            <a href={existing.url} target="_blank" rel="noreferrer">
              ver
            </a>
          )}
          {statusEditable ? (
            <select
              className="wiz-doc-status-select"
              value={existing.status ?? "sent"}
              onChange={(e) => onStatusChange?.(e.target.value)}
            >
              {DOCUMENT_STATUS_OPTIONS.map((s) => (
                <option value={s.value} key={s.value}>{s.label}</option>
              ))}
            </select>
          ) : (
            <span className={`wiz-doc-status-pill wiz-doc-status-${existing.status ?? "sent"}`}>{statusLabel}</span>
          )}
        </span>
      ) : (
        <span className="wiz-upload-pending">Nenhum arquivo enviado</span>
      )}
      <label className="wiz-upload-btn">
        {uploading ? "Enviando…" : existing ? "Substituir arquivo" : "Anexar arquivo"}
        <input
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.zip"
          style={{ display: "none" }}
          onChange={onFile}
          disabled={uploading}
        />
      </label>
      {error && <span className="form-note err">{error}</span>}
    </div>
  );
}

function StepNav({ current, maxReached, onGo }: { current: number; maxReached: number; onGo: (n: number) => void }) {
  return (
    <ol className="wiz-nav">
      {WIZARD_STEPS.map((s) => (
        <li
          key={s.step}
          className={`wiz-nav-item${s.step === current ? " active" : ""}${s.step <= maxReached ? " reached" : ""}`}
        >
          <button type="button" disabled={s.step > maxReached} onClick={() => onGo(s.step)}>
            <span className="wiz-nav-num">{s.step}</span>
            {s.label}
          </button>
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Etapa 1 — Dados pessoais
// ---------------------------------------------------------------------------
type StepSaveFn = (data: unknown) => Promise<{ ok: boolean; error?: string; issues?: unknown }>;

export function PersonalStep({
  initial,
  onNext,
  onSave = (data) => saveStep(1, data),
  submitLabel,
}: {
  initial: PersonalData | null;
  onNext: () => void;
  onSave?: StepSaveFn;
  submitLabel?: string;
}) {
  type PersonalFormState = Partial<Omit<PersonalData, "authorizedRepresentative">> & {
    authorizedRepresentative?: boolean;
  };
  const [data, setData] = useState<PersonalFormState>(initial ?? {});
  const [roleOther, setRoleOther] = useState(
    initial && !ROLE_OPTIONS.includes(initial.role as (typeof ROLE_OPTIONS)[number]) ? initial.role : ""
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof PersonalFormState>(key: K, value: PersonalFormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  const roleIsOther = data.role === "Outro" || (Boolean(data.role) && !ROLE_OPTIONS.includes(data.role as (typeof ROLE_OPTIONS)[number]));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const payload = {
      ...data,
      role: roleIsOther ? roleOther : data.role,
      authorizedRepresentative: Boolean(data.authorizedRepresentative),
    };
    const result = await onSave(payload);
    if (!result.ok) {
      setError(formatIssues(result.issues, PERSONAL_LABELS) || result.error || "Não foi possível salvar. Confira os campos.");
      setStatus("error");
      return;
    }
    onNext();
  }

  return (
    <form className="contact-form wiz-form" onSubmit={onSubmit} noValidate>
      <h2 className="mp-subtitle">Dados do responsável</h2>
      <div className="wiz-grid">
        <Field label="Nome completo">
          <input required value={data.fullName ?? ""} onChange={(e) => set("fullName", e.target.value)} />
        </Field>
        <Field label="Nacionalidade">
          <input required value={data.nationality ?? ""} onChange={(e) => set("nationality", e.target.value)} />
        </Field>
        <Field label="Data de nascimento">
          <input type="date" required value={data.birthDate ?? ""} onChange={(e) => set("birthDate", e.target.value)} />
        </Field>
        <Field label="CPF ou documento estrangeiro">
          <input required value={data.taxId ?? ""} onChange={(e) => set("taxId", e.target.value)} />
        </Field>
        <Field label="RG, CPF, passaporte ou documento de identidade">
          <input required value={data.idDocument ?? ""} onChange={(e) => set("idDocument", e.target.value)} />
        </Field>
        <Field label="Cargo / Relação com a empresa">
          <SelectField value={ROLE_OPTIONS.includes(data.role as (typeof ROLE_OPTIONS)[number]) ? (data.role ?? "") : (data.role ? "Outro" : "")} onChange={(v) => set("role", v)} options={ROLE_OPTIONS} />
          {roleIsOther && (
            <input
              style={{ marginTop: 8 }}
              placeholder="Especifique o cargo"
              value={roleOther}
              onChange={(e) => setRoleOther(e.target.value)}
            />
          )}
        </Field>
        <Field label="Telefone">
          <input required value={data.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="WhatsApp (opcional)">
          <input
            value={data.sameWhatsappAsPhone ? (data.phone ?? "") : (data.whatsapp ?? "")}
            disabled={Boolean(data.sameWhatsappAsPhone)}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
          <label className="wiz-check" style={{ marginTop: 6 }}>
            <input
              type="checkbox"
              checked={Boolean(data.sameWhatsappAsPhone)}
              onChange={(e) => set("sameWhatsappAsPhone", e.target.checked)}
            />
            Mesmo telefone informado
          </label>
        </Field>
        <Field label="E-mail">
          <input type="email" required value={data.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="País de residência">
          <input required value={data.residenceCountry ?? ""} onChange={(e) => set("residenceCountry", e.target.value)} />
        </Field>
        <Field label="Currículo ou LinkedIn (opcional)">
          <input value={data.linkedin ?? ""} onChange={(e) => set("linkedin", e.target.value)} />
          <LinkPreview value={data.linkedin} />
        </Field>
        <Field label="Idioma preferencial">
          <select value={data.preferredLanguage ?? ""} onChange={(e) => set("preferredLanguage", e.target.value as PersonalFormState["preferredLanguage"])}>
            <option value="">Selecione…</option>
            {LANGUAGE_OPTIONS.map((l) => (
              <option value={l.value} key={l.value}>{l.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Forma preferencial de contato">
          <select value={data.preferredContactMethod ?? ""} onChange={(e) => set("preferredContactMethod", e.target.value as PersonalFormState["preferredContactMethod"])}>
            <option value="">Selecione…</option>
            {CONTACT_METHOD_OPTIONS.map((c) => (
              <option value={c.value} key={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Endereço">
        <input required value={data.address ?? ""} onChange={(e) => set("address", e.target.value)} />
      </Field>

      <Field label="Já possui relacionamento com Omã?">
        <YesNo value={data.hasOmanRelationship} onChange={(v) => set("hasOmanRelationship", v)} />
      </Field>
      {data.hasOmanRelationship && (
        <div className="wiz-grid">
          <Field label="Quem?">
            <select value={data.omanRelationshipType ?? ""} onChange={(e) => set("omanRelationshipType", e.target.value as PersonalFormState["omanRelationshipType"])}>
              <option value="">Selecione…</option>
              {OMAN_RELATIONSHIP_TYPES.map((t) => (
                <option value={t.value} key={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Nome">
            <input value={data.omanRelationshipWho ?? ""} onChange={(e) => set("omanRelationshipWho", e.target.value)} />
          </Field>
        </div>
      )}

      <Field label="Foi indicado por algum membro da Câmara? (opcional)">
        <input
          placeholder="Nome de quem indicou"
          value={data.referredBy ?? ""}
          onChange={(e) => set("referredBy", e.target.value)}
        />
      </Field>

      <label className="wiz-check">
        <input
          type="checkbox"
          required
          checked={Boolean(data.authorizedRepresentative)}
          onChange={(e) => set("authorizedRepresentative", e.target.checked)}
        />
        Declaro que estou autorizado(a) a representar a empresa neste cadastro.
      </label>
      {status === "error" && <p className="form-note err">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
        {status === "saving" ? "Salvando…" : submitLabel ?? "Salvar e continuar"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Etapa 2 — Dados da empresa
// ---------------------------------------------------------------------------
function AdministratorsTable({ rows, onChange }: { rows: AdministratorEntry[]; onChange: (rows: AdministratorEntry[]) => void }) {
  function update(i: number, patch: Partial<AdministratorEntry>) {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  return (
    <div className="wiz-table">
      {rows.map((row, i) => (
        <div className="wiz-table-row wiz-table-row-3" key={i}>
          <input placeholder="Nome" value={row.name ?? ""} onChange={(e) => update(i, { name: e.target.value })} />
          <input placeholder="CPF/Passaporte" value={row.document ?? ""} onChange={(e) => update(i, { document: e.target.value })} />
          <input placeholder="Cargo" value={row.role ?? ""} onChange={(e) => update(i, { role: e.target.value })} />
          <button type="button" className="wiz-table-remove" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost wiz-table-add" onClick={() => onChange([...rows, { name: "", document: "", role: "" }])}>
        + Adicionar administrador
      </button>
    </div>
  );
}

function ShareholdersTable({ rows, onChange }: { rows: ShareholderEntry[]; onChange: (rows: ShareholderEntry[]) => void }) {
  function update(i: number, patch: Partial<ShareholderEntry>) {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  return (
    <div className="wiz-table">
      {rows.map((row, i) => (
        <div className="wiz-table-row wiz-table-row-3" key={i}>
          <input placeholder="Sócio" value={row.name ?? ""} onChange={(e) => update(i, { name: e.target.value })} />
          <input placeholder="Participação (%)" value={row.stake ?? ""} onChange={(e) => update(i, { stake: e.target.value })} />
          <input placeholder="Nacionalidade" value={row.nationality ?? ""} onChange={(e) => update(i, { nationality: e.target.value })} />
          <button type="button" className="wiz-table-remove" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost wiz-table-add" onClick={() => onChange([...rows, { name: "", stake: "", nationality: "" }])}>
        + Adicionar sócio
      </button>
    </div>
  );
}

function BeneficialOwnersTable({ rows, onChange }: { rows: BeneficialOwnerEntry[]; onChange: (rows: BeneficialOwnerEntry[]) => void }) {
  function update(i: number, patch: Partial<BeneficialOwnerEntry>) {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  return (
    <div className="wiz-table">
      {rows.map((row, i) => (
        <div className="wiz-table-row-block" key={i}>
          <div className="wiz-table-row wiz-table-row-3">
            <input placeholder="Nome" value={row.name ?? ""} onChange={(e) => update(i, { name: e.target.value })} />
            <input placeholder="Participação (%)" value={row.stake ?? ""} onChange={(e) => update(i, { stake: e.target.value })} />
            <label className="wiz-check">
              <input type="checkbox" checked={Boolean(row.hasRelatedCompany)} onChange={(e) => update(i, { hasRelatedCompany: e.target.checked })} />
              Possui vínculo com outra empresa?
            </label>
            <button type="button" className="wiz-table-remove" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>✕</button>
          </div>
          {row.hasRelatedCompany && (
            <input
              placeholder="Empresa relacionada"
              value={row.relatedCompany ?? ""}
              onChange={(e) => update(i, { relatedCompany: e.target.value })}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      ))}
      <button type="button" className="btn btn-ghost wiz-table-add" onClick={() => onChange([...rows, { name: "", stake: "", hasRelatedCompany: false, relatedCompany: "" }])}>
        + Adicionar beneficiário final
      </button>
    </div>
  );
}

export function CompanyStep({
  initial,
  logoUrl = null,
  showLogoUpload = false,
  onNext,
  onSave = (data) => saveStep(2, data),
  submitLabel,
}: {
  initial: CompanyData | null;
  logoUrl?: string | null;
  /** Só true no fluxo real do próprio candidato — a mesma etapa é reaproveitada
   *  na visão do admin (edição de candidatura), onde não faz sentido oferecer
   *  upload (o admin não tem sessão de associado pra autenticar o envio). */
  showLogoUpload?: boolean;
  onNext: () => void;
  onSave?: StepSaveFn;
  submitLabel?: string;
}) {
  const [data, setData] = useState<Partial<CompanyData>>(initial ?? { entityType: "br" });
  const [legalNatureOther, setLegalNatureOther] = useState(
    initial && !LEGAL_NATURE_OPTIONS.includes(initial.legalNature as (typeof LEGAL_NATURE_OPTIONS)[number]) ? initial.legalNature : ""
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof CompanyData>(key: K, value: CompanyData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  const legalNatureIsOther = data.legalNature === "Outro" || (Boolean(data.legalNature) && !LEGAL_NATURE_OPTIONS.includes(data.legalNature as (typeof LEGAL_NATURE_OPTIONS)[number]));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const payload = { ...data, legalNature: legalNatureIsOther ? legalNatureOther : data.legalNature };
    const result = await onSave(payload);
    if (!result.ok) {
      setError(formatIssues(result.issues, COMPANY_LABELS) || result.error || "Não foi possível salvar. Confira os campos.");
      setStatus("error");
      return;
    }
    onNext();
  }

  const certs = data.certificationTypes ?? [];

  return (
    <form className="contact-form wiz-form" onSubmit={onSubmit} noValidate>
      <h2 className="mp-subtitle">Dados da empresa</h2>
      {showLogoUpload && (
        <div style={{ marginBottom: 8 }}>
          <LogoUploader initialUrl={logoUrl} />
        </div>
      )}
      <Field label="Tipo de empresa">
        <select value={data.entityType ?? "br"} onChange={(e) => set("entityType", e.target.value as "br" | "foreign")}>
          <option value="br">Empresa brasileira</option>
          <option value="foreign">Empresa estrangeira</option>
        </select>
      </Field>
      <div className="wiz-grid">
        <Field label="Razão social">
          <input required value={data.legalName ?? ""} onChange={(e) => set("legalName", e.target.value)} />
        </Field>
        <Field label="Nome comercial (opcional)">
          <input value={data.tradeName ?? ""} onChange={(e) => set("tradeName", e.target.value)} />
        </Field>
        <Field label={data.entityType === "foreign" ? "Registro estrangeiro" : "CNPJ"}>
          <input required value={data.registrationNumber ?? ""} onChange={(e) => set("registrationNumber", e.target.value)} />
        </Field>
        <Field label="Data de constituição">
          <input type="date" required value={data.foundingDate ?? ""} onChange={(e) => set("foundingDate", e.target.value)} />
        </Field>
        <Field label="País da sede">
          <input required value={data.countryHQ ?? ""} onChange={(e) => set("countryHQ", e.target.value)} />
        </Field>
        <Field label="Cidade da sede">
          <input required value={data.cityHQ ?? ""} onChange={(e) => set("cityHQ", e.target.value)} />
        </Field>
        <Field label="Site (opcional)">
          <input value={data.website ?? ""} onChange={(e) => set("website", e.target.value)} />
          <LinkPreview value={data.website} />
        </Field>
        <Field label="Telefone">
          <input required value={data.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="E-mail institucional">
          <input type="email" required value={data.institutionalEmail ?? ""} onChange={(e) => set("institutionalEmail", e.target.value)} />
        </Field>
        <Field label="Natureza jurídica">
          <SelectField value={LEGAL_NATURE_OPTIONS.includes(data.legalNature as (typeof LEGAL_NATURE_OPTIONS)[number]) ? (data.legalNature ?? "") : (data.legalNature ? "Outro" : "")} onChange={(v) => set("legalNature", v)} options={LEGAL_NATURE_OPTIONS} />
          {legalNatureIsOther && (
            <input style={{ marginTop: 8 }} placeholder="Especifique" value={legalNatureOther} onChange={(e) => setLegalNatureOther(e.target.value)} />
          )}
        </Field>
        <Field label="Capital social (opcional)">
          <input value={data.shareCapital ?? ""} onChange={(e) => set("shareCapital", e.target.value)} />
        </Field>
        <Field label="Número de empregados (opcional)">
          <input value={data.employeeCount ?? ""} onChange={(e) => set("employeeCount", e.target.value)} />
        </Field>
      </div>
      <Field label="Endereço completo">
        <input required value={data.address ?? ""} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <Field label="Setores de atuação">
        <input required value={data.sectors ?? ""} onChange={(e) => set("sectors", e.target.value)} />
      </Field>
      <Field label="Produtos e serviços">
        <textarea required rows={3} value={data.productsServices ?? ""} onChange={(e) => set("productsServices", e.target.value)} />
      </Field>
      <div className="wiz-grid">
        <Field label="Países onde opera (opcional)">
          <input value={data.countriesOfOperation ?? ""} onChange={(e) => set("countriesOfOperation", e.target.value)} />
        </Field>
        <Field label="Quantidade de países onde atua (opcional)">
          <input value={data.countriesOfOperationCount ?? ""} onChange={(e) => set("countriesOfOperationCount", e.target.value)} />
        </Field>
      </div>
      <Field label="Filiais e empresas relacionadas (opcional)">
        <input value={data.affiliates ?? ""} onChange={(e) => set("affiliates", e.target.value)} />
      </Field>

      <Field label="Nome dos administradores">
        <AdministratorsTable rows={data.administrators ?? []} onChange={(rows) => set("administrators", rows)} />
      </Field>
      <Field label="Quadro societário">
        <ShareholdersTable rows={data.shareholderStructure ?? []} onChange={(rows) => set("shareholderStructure", rows)} />
      </Field>
      <Field label="Beneficiários finais">
        <BeneficialOwnersTable rows={data.beneficialOwners ?? []} onChange={(rows) => set("beneficialOwners", rows)} />
      </Field>

      <h2 className="mp-subtitle" style={{ marginTop: 32 }}>Estrutura e perfil corporativo</h2>
      <Field label="Empresa pertence a grupo econômico?">
        <YesNo value={data.belongsToEconomicGroup} onChange={(v) => set("belongsToEconomicGroup", v)} />
      </Field>
      {data.belongsToEconomicGroup && (
        <Field label="Nome do grupo">
          <input value={data.economicGroupName ?? ""} onChange={(e) => set("economicGroupName", e.target.value)} />
        </Field>
      )}
      <div className="wiz-bool-grid">
        <label className="wiz-check">
          <input type="checkbox" checked={Boolean(data.hasSubsidiaries)} onChange={(e) => set("hasSubsidiaries", e.target.checked)} />
          Possui subsidiárias?
        </label>
        <label className="wiz-check">
          <input type="checkbox" checked={Boolean(data.hasInternationalOperations)} onChange={(e) => set("hasInternationalOperations", e.target.checked)} />
          Possui operações internacionais?
        </label>
        <label className="wiz-check">
          <input type="checkbox" checked={Boolean(data.isFamilyBusiness)} onChange={(e) => set("isFamilyBusiness", e.target.checked)} />
          Empresa familiar?
        </label>
        <label className="wiz-check">
          <input type="checkbox" checked={Boolean(data.hasBoardOfDirectors)} onChange={(e) => set("hasBoardOfDirectors", e.target.checked)} />
          Possui conselho de administração?
        </label>
      </div>

      <Field label="Possui certificações?">
        <CheckboxGroup options={COMPANY_CERTIFICATION_OPTIONS} selected={certs} onChange={(v) => set("certificationTypes", v)} />
      </Field>

      <div className="wiz-grid">
        <Field label="Ano de início da internacionalização (opcional)">
          <input value={data.internationalizationStartYear ?? ""} onChange={(e) => set("internationalizationStartYear", e.target.value)} />
        </Field>
        <Field label="Receita anual consolidada (opcional)">
          <SelectField value={data.consolidatedAnnualRevenueRange ?? ""} onChange={(v) => set("consolidatedAnnualRevenueRange", v)} options={CONSOLIDATED_REVENUE_RANGES} />
        </Field>
        <Field label="Moeda do faturamento (opcional)">
          <SelectField value={data.revenueCurrency ?? ""} onChange={(v) => set("revenueCurrency", v as CompanyData["revenueCurrency"])} options={CURRENCY_OPTIONS} />
        </Field>
      </div>

      {status === "error" && <p className="form-note err">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
        {status === "saving" ? "Salvando…" : submitLabel ?? "Salvar e continuar"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Etapa 3 — Perfil comercial + diagnóstico de internacionalização
// ---------------------------------------------------------------------------
export function ProfileStep({
  initial,
  onNext,
  onSave = (data) => saveStep(3, data),
  submitLabel,
}: {
  initial: BusinessProfile | null;
  onNext: () => void;
  onSave?: StepSaveFn;
  submitLabel?: string;
}) {
  const [data, setData] = useState<Partial<BusinessProfile>>(initial ?? {});
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  const boolFields: [keyof BusinessProfile, string][] = [
    ["publicTenderParticipation", "Participa de licitações"],
    ["financingNeed", "Precisa de financiamento"],
    ["interestInTradeMissions", "Interesse em missões empresariais"],
    ["interestInMatchmaking", "Interesse em matchmaking"],
    ["exportsOrImports", "Já exporta ou importa"],
    ["hasForeignTradeDept", "Possui departamento de comércio exterior"],
    ["hasCertifications", "Possui certificações"],
    ["knowsTargetMarketLaw", "Conhece a legislação do mercado pretendido"],
    ["hasLocalDistributor", "Possui distribuidor ou parceiro local"],
    ["needsRegulatorySupport", "Necessita de apoio regulatório"],
    ["needsLogistics", "Necessita de logística"],
    ["needsFinancing", "Necessita de financiamento para expansão"],
    ["needsMarketResearch", "Precisa de estudos de mercado"],
    ["plansToOpenBranch", "Pretende abrir empresa ou filial"],
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const payload = { ...data };
    for (const [key] of boolFields) {
      (payload as Record<string, unknown>)[key] = Boolean((data as Record<string, unknown>)[key]);
    }
    const result = await onSave(payload);
    if (!result.ok) {
      setError(formatIssues(result.issues, PROFILE_LABELS) || result.error || "Não foi possível salvar. Confira os campos.");
      setStatus("error");
      return;
    }
    onNext();
  }

  return (
    <form className="contact-form wiz-form" onSubmit={onSubmit} noValidate>
      <h2 className="mp-subtitle">Perfil econômico e comercial</h2>
      <Field label="Faturamento anual (faixa)">
        <input required value={data.annualRevenueRange ?? ""} onChange={(e) => set("annualRevenueRange", e.target.value)} />
      </Field>
      <Field label="Principais mercados (opcional)">
        <input value={data.mainMarkets ?? ""} onChange={(e) => set("mainMarkets", e.target.value)} />
      </Field>
      <Field label="Volume de importação/exportação (opcional)">
        <input value={data.importExportVolume ?? ""} onChange={(e) => set("importExportVolume", e.target.value)} />
      </Field>
      <Field label="Interesse no Brasil">
        <textarea required rows={2} value={data.interestInBrazil ?? ""} onChange={(e) => set("interestInBrazil", e.target.value)} />
      </Field>
      <Field label="Setores de interesse (opcional)">
        <input value={data.sectorsOfInterest ?? ""} onChange={(e) => set("sectorsOfInterest", e.target.value)} />
      </Field>
      <Field label="Objetivo da associação">
        <textarea required rows={2} value={data.membershipGoal ?? ""} onChange={(e) => set("membershipGoal", e.target.value)} />
      </Field>
      <Field label="Tipo de parceria procurada (opcional)">
        <input value={data.partnershipType ?? ""} onChange={(e) => set("partnershipType", e.target.value)} />
      </Field>
      <Field label="O que faria esta associação ser um sucesso para sua empresa?">
        <textarea required rows={2} value={data.expectationFromChamber ?? ""} onChange={(e) => set("expectationFromChamber", e.target.value)} />
      </Field>

      <h2 className="mp-subtitle" style={{ marginTop: 32 }}>Objetivos e mercados</h2>
      <Field label="Objetivo principal ao ingressar na Câmara (selecione até 3)">
        <CheckboxGroup options={MAIN_GOALS_OPTIONS} selected={data.mainGoals ?? []} onChange={(v) => set("mainGoals", v)} max={3} />
      </Field>
      <Field label="Mercado-alvo: onde deseja atuar?">
        <CheckboxGroup options={TARGET_MARKETS_OPTIONS} selected={data.targetMarkets ?? []} onChange={(v) => set("targetMarkets", v)} />
      </Field>

      <h2 className="mp-subtitle" style={{ marginTop: 32 }}>Produtos</h2>
      <Field label="Categoria do produto (múltipla seleção)">
        <CheckboxGroup options={PRODUCT_CATEGORIES} selected={data.productCategories ?? []} onChange={(v) => set("productCategories", v)} />
      </Field>
      <Field label="Sub categoria (opcional)">
        <input value={data.productSubcategory ?? ""} onChange={(e) => set("productSubcategory", e.target.value)} />
      </Field>
      <Field label="Descrição do produto">
        <textarea
          required
          rows={3}
          placeholder='Ex.: "Produzimos softwares bancários para instituições financeiras, incluindo core banking, onboarding digital, PIX, Open Finance e soluções antifraude."'
          value={data.productDescription ?? ""}
          onChange={(e) => set("productDescription", e.target.value)}
        />
      </Field>
      <Field label="Produtos estratégicos — prioridade para internacionalização (opcional)">
        <input value={data.strategicProducts ?? ""} onChange={(e) => set("strategicProducts", e.target.value)} />
      </Field>
      <div className="wiz-grid">
        <Field label="Marca comercial (opcional)">
          <input value={data.commercialBrand ?? ""} onChange={(e) => set("commercialBrand", e.target.value)} />
        </Field>
        <Field label="Código NCM/HS (opcional)">
          <input value={data.ncmHsCode ?? ""} onChange={(e) => set("ncmHsCode", e.target.value)} />
        </Field>
      </div>
      <Field label="Produto possui certificações? (opcional)">
        <CheckboxGroup options={PRODUCT_CERTIFICATIONS_OPTIONS} selected={data.productCertifications ?? []} onChange={(v) => set("productCertifications", v)} />
      </Field>
      <Field label="Situação comercial (opcional)">
        <CheckboxGroup options={COMMERCIAL_SITUATION_OPTIONS} selected={data.commercialSituation ?? []} onChange={(v) => set("commercialSituation", v)} />
      </Field>
      <div className="wiz-grid">
        <Field label="Capacidade de produção mensal (opcional)">
          <input value={data.monthlyProductionCapacity ?? ""} onChange={(e) => set("monthlyProductionCapacity", e.target.value)} />
        </Field>
        <Field label="Capacidade de produção anual (opcional)">
          <input value={data.annualProductionCapacity ?? ""} onChange={(e) => set("annualProductionCapacity", e.target.value)} />
        </Field>
        <Field label="Unidade (kg, toneladas, litros...) (opcional)">
          <input value={data.productionUnit ?? ""} onChange={(e) => set("productionUnit", e.target.value)} />
        </Field>
      </div>

      <h2 className="mp-subtitle" style={{ marginTop: 32 }}>Exportação e importação</h2>
      <div className="wiz-grid">
        <Field label="Há quantos anos exporta? (opcional)">
          <input value={data.exportYears ?? ""} onChange={(e) => set("exportYears", e.target.value)} />
        </Field>
        <Field label="Para quais países exporta? (opcional)">
          <input value={data.exportCountries ?? ""} onChange={(e) => set("exportCountries", e.target.value)} />
        </Field>
        <Field label="Volume anual de exportação (opcional)">
          <input value={data.exportAnnualVolume ?? ""} onChange={(e) => set("exportAnnualVolume", e.target.value)} />
        </Field>
        <Field label="Quais produtos importa? (opcional)">
          <input value={data.importProducts ?? ""} onChange={(e) => set("importProducts", e.target.value)} />
        </Field>
        <Field label="Origem da importação (opcional)">
          <input value={data.importOrigin ?? ""} onChange={(e) => set("importOrigin", e.target.value)} />
        </Field>
      </div>

      <h2 className="mp-subtitle" style={{ marginTop: 32 }}>Inteligência comercial e matchmaking</h2>
      <div className="wiz-grid">
        <Field label="Quem é seu concorrente? (opcional)">
          <input value={data.mainCompetitors ?? ""} onChange={(e) => set("mainCompetitors", e.target.value)} />
        </Field>
        <Field label="Quem considera referência no setor? (opcional)">
          <input value={data.referenceCompanies ?? ""} onChange={(e) => set("referenceCompanies", e.target.value)} />
        </Field>
        <Field label="Quais empresas gostaria de conhecer? (opcional)">
          <input value={data.companiesToMeet ?? ""} onChange={(e) => set("companiesToMeet", e.target.value)} />
        </Field>
      </div>
      <Field label="Que tipo de empresa procura (matchmaking)?">
        <CheckboxGroup options={MATCHMAKING_TYPES_OPTIONS} selected={data.matchmakingTypes ?? []} onChange={(v) => set("matchmakingTypes", v)} />
      </Field>

      <h2 className="mp-subtitle" style={{ marginTop: 32 }}>Projeto Omã</h2>
      <Field label="O que você pretende fazer em Omã?">
        <textarea required rows={4} value={data.omanProjectDescription ?? ""} onChange={(e) => set("omanProjectDescription", e.target.value)} />
      </Field>
      <div className="wiz-grid">
        <Field label="Quando pretende iniciar seu projeto relacionado a Omã?">
          <SelectField value={data.projectStartTimeline ?? ""} onChange={(v) => set("projectStartTimeline", v)} options={PROJECT_TIMELINE_OPTIONS} />
        </Field>
        <Field label="Qual o porte do projeto que pretende desenvolver em Omã?">
          <SelectField value={data.projectScale ?? ""} onChange={(v) => set("projectScale", v)} options={PROJECT_SCALE_OPTIONS} />
        </Field>
        <Field label="Dimensão financeira estimada do projeto">
          <SelectField value={data.projectFinancialRange ?? ""} onChange={(v) => set("projectFinancialRange", v)} options={PROJECT_FINANCIAL_RANGE_OPTIONS} />
        </Field>
        <Field label="Em qual fase sua empresa se encontra em relação ao mercado de Omã?">
          <SelectField value={data.projectStage ?? ""} onChange={(v) => set("projectStage", v)} options={PROJECT_STAGE_OPTIONS} />
        </Field>
        <Field label="Qual a urgência (prioridade)?">
          <SelectField value={data.priorityUrgency ?? ""} onChange={(v) => set("priorityUrgency", v)} options={PRIORITY_URGENCY_OPTIONS} />
        </Field>
      </div>
      <Field label="Objetivo para os próximos 12 meses após a associação (até 3)">
        <CheckboxGroup options={NEXT_12M_GOALS_OPTIONS} selected={data.next12MonthsGoals ?? []} onChange={(v) => set("next12MonthsGoals", v)} max={3} />
      </Field>

      <h2 className="mp-subtitle" style={{ marginTop: 32 }}>Dificuldades ou desafios esperados no mercado de Omã</h2>
      {CHALLENGE_GROUPS.map((group) => (
        <div key={group.group} style={{ marginBottom: 16 }}>
          <p className="wiz-compliance-question">{group.group}</p>
          <CheckboxGroup
            options={group.items}
            selected={data.expectedChallenges ?? []}
            onChange={(v) => {
              const others = (data.expectedChallenges ?? []).filter((i) => !(group.items as readonly string[]).includes(i));
              set("expectedChallenges", [...others, ...v]);
            }}
          />
        </div>
      ))}
      <Field label="Outro desafio (especifique, opcional)">
        <textarea rows={2} value={data.mainDifficulties ?? ""} onChange={(e) => set("mainDifficulties", e.target.value)} />
      </Field>

      <Field label="Em qual dessas áreas você espera maior apoio da Câmara? (até 3)">
        <CheckboxGroup options={CHAMBER_SUPPORT_AREAS_OPTIONS} selected={data.chamberSupportAreas ?? []} onChange={(v) => set("chamberSupportAreas", v)} max={3} />
      </Field>

      <h2 className="mp-subtitle" style={{ marginTop: 32 }}>Diagnóstico de internacionalização</h2>
      <div className="wiz-bool-grid">
        {boolFields.map(([key, label]) => (
          <label className="wiz-check" key={key}>
            <input
              type="checkbox"
              checked={Boolean((data as Record<string, unknown>)[key])}
              onChange={(e) => set(key, e.target.checked as never)}
            />
            {label}
          </label>
        ))}
      </div>

      {status === "error" && <p className="form-note err">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
        {status === "saving" ? "Salvando…" : submitLabel ?? "Salvar e continuar"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Etapa 4 — Compliance e integridade
// ---------------------------------------------------------------------------
type ComplianceAnswerWithUrl = ComplianceAnswer & { documentSignedUrl?: string };

export function ComplianceStep({
  initial,
  onNext,
  onSave = (data) => saveStep(4, data),
  submitLabel,
}: {
  initial: ComplianceAnswerWithUrl[] | null;
  onNext: () => void;
  onSave?: StepSaveFn;
  submitLabel?: string;
}) {
  const [answers, setAnswers] = useState<Record<string, ComplianceAnswerWithUrl>>(() => {
    const map: Record<string, ComplianceAnswerWithUrl> = {};
    for (const q of COMPLIANCE_QUESTIONS) {
      const existing = initial?.find((a) => a.key === q.key);
      map[q.key] = existing ?? { key: q.key, answer: "no", explanation: "", documentKey: "", selectedOptions: [] };
    }
    return map;
  });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  function update(key: string, patch: Partial<ComplianceAnswerWithUrl>) {
    setAnswers((a) => ({ ...a, [key]: { ...a[key], ...patch } }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const result = await onSave(Object.values(answers));
    if (!result.ok) {
      setError(result.error || "Não foi possível salvar.");
      setStatus("error");
      return;
    }
    onNext();
  }

  return (
    <form className="contact-form wiz-form" onSubmit={onSubmit} noValidate>
      <h2 className="mp-subtitle">Compliance e integridade</h2>
      <p className="section-lead" style={{ marginBottom: 20 }}>Perguntas de resposta obrigatória. Se responder "Sim", complete as informações adicionais e anexe um documento, se aplicável.</p>
      {COMPLIANCE_QUESTIONS.map((q) => {
        const a = answers[q.key];
        return (
          <div className="wiz-compliance-item" key={q.key}>
            <p className="wiz-compliance-question">{q.label}</p>
            <YesNo value={a.answer === "yes"} onChange={(v) => update(q.key, { answer: v ? "yes" : "no" })} />
            {a.answer === "yes" && (
              <>
                {q.revealType === "checklist" && q.checklistOptions.length > 0 && (
                  <CheckboxGroup
                    options={q.checklistOptions}
                    selected={a.selectedOptions ?? []}
                    onChange={(v) => update(q.key, { selectedOptions: v })}
                  />
                )}
                {q.revealType === "text" && (
                  <input
                    placeholder={q.textLabel || "Especifique"}
                    value={a.explanation ?? ""}
                    onChange={(e) => update(q.key, { explanation: e.target.value })}
                  />
                )}
                {q.revealType === "explanation" && (
                  <>
                    <textarea
                      placeholder="Explique"
                      rows={2}
                      value={a.explanation ?? ""}
                      onChange={(e) => update(q.key, { explanation: e.target.value })}
                    />
                    <DocUploadButton
                      docKey={`compliance-${q.key}`}
                      label={q.label}
                      existing={
                        a.documentKey
                          ? { key: q.key, label: q.label, storageKey: a.documentKey, url: a.documentSignedUrl ?? "" }
                          : undefined
                      }
                      onUploaded={(doc) => update(q.key, { documentKey: doc.storageKey, documentSignedUrl: doc.url })}
                    />
                  </>
                )}
              </>
            )}
          </div>
        );
      })}
      {status === "error" && <p className="form-note err">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
        {status === "saving" ? "Salvando…" : submitLabel ?? "Salvar e continuar"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Etapa 5 — Documentos
// ---------------------------------------------------------------------------
export function DocumentsStep({
  entityType,
  initial,
  onNext,
  onSave = (data) => saveStep(5, data),
  submitLabel,
  statusEditable,
}: {
  entityType: "br" | "foreign";
  initial: UploadedDoc[] | null;
  onNext: () => void;
  onSave?: StepSaveFn;
  submitLabel?: string;
  statusEditable?: boolean;
}) {
  const [docs, setDocs] = useState<Record<string, UploadedDoc>>(() => {
    const map: Record<string, UploadedDoc> = {};
    for (const d of initial ?? []) map[d.key] = d;
    return map;
  });
  const slots = entityType === "foreign" ? DOCUMENT_SLOTS_FOREIGN : DOCUMENT_SLOTS_BR;

  async function persist(next: Record<string, UploadedDoc>) {
    setDocs(next);
    if (statusEditable) await onSave(Object.values(next));
  }

  async function onContinue(e: React.FormEvent) {
    e.preventDefault();
    await onSave(Object.values(docs));
    onNext();
  }

  return (
    <form className="contact-form wiz-form" onSubmit={onContinue} noValidate>
      <h2 className="mp-subtitle">Documentos ({entityType === "foreign" ? "empresa estrangeira" : "empresa brasileira"})</h2>
      <div className="wiz-doc-list">
        {slots.map((slot) => (
          <div className="wiz-doc-row" key={slot.key}>
            <span className="wiz-doc-label">{slot.label}</span>
            <DocUploadButton
              docKey={slot.key}
              label={slot.label}
              existing={docs[slot.key]}
              onUploaded={(doc) => setDocs((d) => ({ ...d, [slot.key]: doc }))}
              statusEditable={statusEditable}
              onStatusChange={(s) => persist({ ...docs, [slot.key]: { ...docs[slot.key], status: s as UploadedDoc["status"] } })}
            />
          </div>
        ))}
      </div>
      <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }}>
        {submitLabel ?? "Continuar"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Etapa 6 — Declarações finais + assinatura
// ---------------------------------------------------------------------------
const DECLARATION_ITEMS: [string, string][] = [
  ["confirmTruthfulInfo", "As informações prestadas são verdadeiras."],
  ["confirmAuthorized", "Estou autorizado(a) a representar a empresa."],
  ["confirmWillUpdate", "Comunicarei mudanças cadastrais à Câmara."],
  ["acceptsIntegrityChecks", "Aceito verificações de integridade."],
  ["acceptsDataProcessing", "Autorizo o tratamento dos meus dados."],
  ["knowsCodeOfEthics", "Conheço o código de ética da Câmara."],
  ["acceptsStatute", "Aceito o estatuto e as regras da Câmara."],
  ["understandsDecision", "Compreendo que a candidatura pode ser aprovada, recusada ou condicionada."],
  ["confirmDataUpdate", "Declaro que manterei as informações cadastrais da empresa atualizadas e comunicarei qualquer alteração relevante."],
  ["confirmComplementaryDocs", "Estou ciente de que a Câmara poderá solicitar documentos complementares ou esclarecimentos durante a análise da candidatura."],
  ["confirmNoBrokerageObligation", "Estou ciente de que a aprovação da candidatura não gera obrigação de intermediação comercial, garantia de negócios ou investimentos por parte da Câmara."],
];

const OPTIONAL_CONSENT_ITEMS: [string, string][] = [
  ["consentsDataSharing", "Autorizo a Câmara a compartilhar as informações institucionais da minha empresa com potenciais parceiros comerciais, investidores e instituições públicas ou privadas, exclusivamente para fins de promoção de negócios, observadas a LGPD e demais normas aplicáveis."],
  ["consentsMarketingComms", "Autorizo o recebimento de oportunidades de negócios, missões empresariais, rodadas de negócios, estudos de mercado, eventos e demais comunicações institucionais da Câmara."],
];

function DeclarationsStep({ initial, onNext }: { initial: Record<string, unknown> | null; onNext: () => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const [key] of [...DECLARATION_ITEMS, ...OPTIONAL_CONSENT_ITEMS]) map[key] = Boolean(initial?.[key]);
    return map;
  });
  const [signatureName, setSignatureName] = useState((initial?.signatureName as string) ?? "");
  const [signatureRole, setSignatureRole] = useState((initial?.signatureRole as string) ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const result = await saveStep(6, { ...checks, signatureName, signatureRole });
    if (!result.ok) {
      setError(
        formatIssues(result.issues, DECLARATION_LABELS) ||
          result.error ||
          "Confirme todos os itens e informe seu nome e cargo."
      );
      setStatus("error");
      return;
    }
    onNext();
  }

  return (
    <form className="contact-form wiz-form" onSubmit={onSubmit} noValidate>
      <h2 className="mp-subtitle">Declarações finais</h2>
      {DECLARATION_ITEMS.map(([key, label]) => (
        <label className="wiz-check" key={key}>
          <input
            type="checkbox"
            required
            checked={checks[key] ?? false}
            onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
          />
          {label}
        </label>
      ))}

      <p className="wiz-compliance-question" style={{ marginTop: 20 }}>Autorizações adicionais (opcionais)</p>
      {OPTIONAL_CONSENT_ITEMS.map(([key, label]) => (
        <label className="wiz-check" key={key}>
          <input
            type="checkbox"
            checked={checks[key] ?? false}
            onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
          />
          {label}
        </label>
      ))}

      <div className="wiz-grid" style={{ marginTop: 16 }}>
        <Field label="Nome (assinatura eletrônica)">
          <input required value={signatureName} onChange={(e) => setSignatureName(e.target.value)} />
        </Field>
        <Field label="Cargo">
          <input required value={signatureRole} onChange={(e) => setSignatureRole(e.target.value)} />
        </Field>
      </div>
      <p className="wiz-signature-note">
        Ao salvar, a data, hora e o endereço IP desta assinatura serão registrados automaticamente pelo sistema.
      </p>
      {status === "error" && <p className="form-note err">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
        {status === "saving" ? "Salvando…" : "Salvar e continuar"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Etapa 7 — Revisão e envio
// ---------------------------------------------------------------------------
function ReviewStep({ data }: { data: AppData }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "ok">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const declarations = data.declarations as { signatureName?: string; signatureRole?: string } | null;

  async function onSubmitFinal() {
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/member/application/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureName: declarations?.signatureName,
          signatureRole: declarations?.signatureRole,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.details ? json.details.join(" · ") : json.error || "Não foi possível enviar.");
        setStatus("error");
        return;
      }
      setStatus("ok");
      router.refresh();
    } catch {
      setErrorMsg("Não foi possível enviar. Tente novamente.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="wiz-form">
        <h2 className="mp-subtitle">Candidatura enviada!</h2>
        <p className="section-lead">Sua candidatura está agora em análise de compliance. Vamos avisar por e-mail sobre qualquer atualização.</p>
      </div>
    );
  }

  return (
    <div className="wiz-form">
      <h2 className="mp-subtitle">Revisão e envio</h2>
      <p className="section-lead" style={{ marginBottom: 20 }}>
        Confira se preencheu todas as etapas anteriores. Ao enviar, sua candidatura entra em análise de compliance e não poderá mais ser editada até uma eventual solicitação de informações adicionais.
      </p>
      <ul className="why-list about-why-list">
        <li><b>Responsável:</b> {data.personalData?.fullName || "—"}</li>
        <li><b>Empresa:</b> {data.companyData?.legalName || "—"}</li>
        <li><b>Assinatura:</b> {declarations?.signatureName || "—"} ({declarations?.signatureRole || "—"})</li>
      </ul>
      {status === "error" && <p className="form-note err">{errorMsg}</p>}
      <button type="button" className="btn btn-primary" onClick={onSubmitFinal} disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Enviar candidatura"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function CandidatePortal() {
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [step, setStep] = useState(1);
  const [loadStatus, setLoadStatus] = useState<"loading" | "idle" | "error">("loading");

  const load = useCallback(async () => {
    const res = await fetch("/api/member/application");
    if (res.status === 401) {
      router.push("/membro/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setLoadStatus("error");
      return;
    }
    setData(json.application);
    setStep(Math.min(json.application.wizardStep, 7));
    setLoadStatus("idle");
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadStatus === "loading" || !data) {
    return (
      <section className="section">
        <div className="container reveal">
          <p className="section-lead">Carregando…</p>
        </div>
      </section>
    );
  }

  const maxReached = Math.max(data.wizardStep, step);

  return (
    <section className="section">
      <div className="container reveal">
        <p className="section-eyebrow center">Portal do Candidato</p>
        <h1 className="section-title center">Complete sua candidatura</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />

        <StepNav current={step} maxReached={maxReached} onGo={setStep} />

        {step === 1 && <PersonalStep initial={data.personalData} onNext={() => { setStep(2); load(); }} />}
        {step === 2 && <CompanyStep initial={data.companyData} logoUrl={data.logoUrl} showLogoUpload onNext={() => { setStep(3); load(); }} />}
        {step === 3 && <ProfileStep initial={data.businessProfile} onNext={() => { setStep(4); load(); }} />}
        {step === 4 && <ComplianceStep initial={data.complianceAnswers} onNext={() => { setStep(5); load(); }} />}
        {step === 5 && (
          <DocumentsStep
            entityType={data.companyData?.entityType ?? "br"}
            initial={data.documents}
            onNext={() => { setStep(6); load(); }}
          />
        )}
        {step === 6 && <DeclarationsStep initial={data.declarations} onNext={() => { setStep(7); load(); }} />}
        {step === 7 && <ReviewStep data={data} />}
      </div>
    </section>
  );
}
