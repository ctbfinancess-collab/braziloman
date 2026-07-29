"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  WIZARD_STEPS,
  COMPLIANCE_QUESTIONS,
  DOCUMENT_SLOTS_BR,
  DOCUMENT_SLOTS_FOREIGN,
  type PersonalData,
  type CompanyData,
  type BusinessProfile,
  type ComplianceAnswer,
  type DocumentEntry,
} from "@/lib/candidateSchemas";

type UploadedDoc = DocumentEntry & { url: string };

type AppData = {
  status: string;
  wizardStep: number;
  personalData: PersonalData | null;
  companyData: CompanyData | null;
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="wiz-field">
      {label}
      {children}
    </label>
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
}: {
  docKey: string;
  label: string;
  existing?: UploadedDoc;
  onUploaded: (doc: UploadedDoc) => void;
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
        </span>
      ) : (
        <span className="wiz-upload-pending">Nenhum arquivo enviado</span>
      )}
      <label className="wiz-upload-btn">
        {uploading ? "Enviando…" : existing ? "Substituir arquivo" : "Anexar arquivo"}
        <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={onFile} disabled={uploading} />
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
  const [data, setData] = useState<Partial<PersonalData>>(initial ?? {});
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof PersonalData>(key: K, value: PersonalData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const result = await onSave({ ...data, authorizedRepresentative: Boolean(data.authorizedRepresentative) });
    if (!result.ok) {
      setError(result.error || "Não foi possível salvar. Confira os campos.");
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
        <Field label="RG, passaporte ou Emirates ID">
          <input required value={data.idDocument ?? ""} onChange={(e) => set("idDocument", e.target.value)} />
        </Field>
        <Field label="Cargo">
          <input required value={data.role ?? ""} onChange={(e) => set("role", e.target.value)} />
        </Field>
        <Field label="Telefone">
          <input required value={data.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
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
      </div>
      <Field label="Endereço">
        <input required value={data.address ?? ""} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <Field label="Vínculo com a empresa">
        <input required value={data.companyRelationship ?? ""} onChange={(e) => set("companyRelationship", e.target.value)} />
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
export function CompanyStep({
  initial,
  onNext,
  onSave = (data) => saveStep(2, data),
  submitLabel,
}: {
  initial: CompanyData | null;
  onNext: () => void;
  onSave?: StepSaveFn;
  submitLabel?: string;
}) {
  const [data, setData] = useState<Partial<CompanyData>>(initial ?? { entityType: "br" });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof CompanyData>(key: K, value: CompanyData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const result = await onSave(data);
    if (!result.ok) {
      setError(result.error || "Não foi possível salvar. Confira os campos.");
      setStatus("error");
      return;
    }
    onNext();
  }

  return (
    <form className="contact-form wiz-form" onSubmit={onSubmit} noValidate>
      <h2 className="mp-subtitle">Dados da empresa</h2>
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
          <input required value={data.legalNature ?? ""} onChange={(e) => set("legalNature", e.target.value)} />
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
      <Field label="Países onde opera (opcional)">
        <input value={data.countriesOfOperation ?? ""} onChange={(e) => set("countriesOfOperation", e.target.value)} />
      </Field>
      <Field label="Filiais e empresas relacionadas (opcional)">
        <input value={data.affiliates ?? ""} onChange={(e) => set("affiliates", e.target.value)} />
      </Field>
      <Field label="Nome dos administradores">
        <textarea required rows={2} value={data.administrators ?? ""} onChange={(e) => set("administrators", e.target.value)} />
      </Field>
      <Field label="Quadro societário">
        <textarea required rows={2} value={data.shareholderStructure ?? ""} onChange={(e) => set("shareholderStructure", e.target.value)} />
      </Field>
      <Field label="Beneficiários finais">
        <textarea required rows={2} value={data.beneficialOwners ?? ""} onChange={(e) => set("beneficialOwners", e.target.value)} />
      </Field>
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
      setError(result.error || "Não foi possível salvar. Confira os campos.");
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
      <Field label="Produtos comercializados (opcional)">
        <input value={data.tradedProducts ?? ""} onChange={(e) => set("tradedProducts", e.target.value)} />
      </Field>
      <Field label="Interesse no Brasil">
        <textarea required rows={2} value={data.interestInBrazil ?? ""} onChange={(e) => set("interestInBrazil", e.target.value)} />
      </Field>
      <Field label="Interesse em Omã">
        <textarea required rows={2} value={data.interestInOman ?? ""} onChange={(e) => set("interestInOman", e.target.value)} />
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
      <Field label="Intenção de investimento (opcional)">
        <input value={data.investmentIntention ?? ""} onChange={(e) => set("investmentIntention", e.target.value)} />
      </Field>
      <Field label="Expectativa em relação à Câmara">
        <textarea required rows={2} value={data.expectationFromChamber ?? ""} onChange={(e) => set("expectationFromChamber", e.target.value)} />
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
      <div className="wiz-grid" style={{ marginTop: 16 }}>
        <Field label="Prazo estimado para iniciar operações (opcional)">
          <input value={data.estimatedTimeline ?? ""} onChange={(e) => set("estimatedTimeline", e.target.value)} />
        </Field>
        <Field label="Valor estimado do projeto (opcional)">
          <input value={data.estimatedProjectValue ?? ""} onChange={(e) => set("estimatedProjectValue", e.target.value)} />
        </Field>
      </div>
      <Field label="Principais dificuldades encontradas (opcional)">
        <textarea rows={2} value={data.mainDifficulties ?? ""} onChange={(e) => set("mainDifficulties", e.target.value)} />
      </Field>
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
      map[q.key] = existing ?? { key: q.key, answer: "no", explanation: "", documentKey: "" };
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
      <p className="section-lead" style={{ marginBottom: 20 }}>Perguntas de resposta obrigatória. Se responder "Sim", explique e anexe um documento, se aplicável.</p>
      {COMPLIANCE_QUESTIONS.map((q) => {
        const a = answers[q.key];
        return (
          <div className="wiz-compliance-item" key={q.key}>
            <p className="wiz-compliance-question">{q.label}</p>
            <YesNo value={a.answer === "yes"} onChange={(v) => update(q.key, { answer: v ? "yes" : "no" })} />
            {a.answer === "yes" && (
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
}: {
  entityType: "br" | "foreign";
  initial: UploadedDoc[] | null;
  onNext: () => void;
  onSave?: StepSaveFn;
  submitLabel?: string;
}) {
  const [docs, setDocs] = useState<Record<string, UploadedDoc>>(() => {
    const map: Record<string, UploadedDoc> = {};
    for (const d of initial ?? []) map[d.key] = d;
    return map;
  });
  const slots = entityType === "foreign" ? DOCUMENT_SLOTS_FOREIGN : DOCUMENT_SLOTS_BR;

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
            <span className="wiz-doc-label">{slot.label}{slot.key === "powerOfAttorney" ? " (quando aplicável)" : ""}</span>
            <DocUploadButton
              docKey={slot.key}
              label={slot.label}
              existing={docs[slot.key]}
              onUploaded={(doc) => setDocs((d) => ({ ...d, [slot.key]: doc }))}
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
];

function DeclarationsStep({ initial, onNext }: { initial: Record<string, unknown> | null; onNext: () => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const [key] of DECLARATION_ITEMS) map[key] = Boolean(initial?.[key]);
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
      setError(result.error || "Confirme todos os itens e informe seu nome e cargo.");
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
      <div className="wiz-grid" style={{ marginTop: 16 }}>
        <Field label="Nome (assinatura eletrônica)">
          <input required value={signatureName} onChange={(e) => setSignatureName(e.target.value)} />
        </Field>
        <Field label="Cargo">
          <input required value={signatureRole} onChange={(e) => setSignatureRole(e.target.value)} />
        </Field>
      </div>
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
        {step === 2 && <CompanyStep initial={data.companyData} onNext={() => { setStep(3); load(); }} />}
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
