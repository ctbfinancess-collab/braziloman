"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "./AdminLayout";
import { Icon } from "./Icons";
import {
  BENEFIT_TYPES, BENEFIT_TYPE_LABELS, ELIGIBILITY_OPTIONS, ELIGIBILITY_LABELS,
  BENEFIT_FREQUENCIES, BENEFIT_FREQUENCY_LABELS,
  PROSPECT_STATUSES, PROSPECT_STATUS_LABELS,
  type BenefitType, type BenefitEligibility, type BenefitFrequency, type ProspectStatus,
} from "@/lib/benefits";

type Category = { id: string; name: string; order: number; _count: { partners: number } };

type Partner = {
  id: string;
  name: string;
  logoUrl: string | null;
  categoryId: string;
  category: { id: string; name: string };
  country: string;
  city: string | null;
  website: string | null;
  instagram: string | null;
  whatsapp: string | null;
  contactEmail: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  status: string;
  order: number;
  _count: { benefits: number };
};

type BenefitRow = {
  id: string;
  partnerId: string;
  partner: { id: string; name: string; category: { name: string } };
  title: string;
  type: BenefitType;
  description: string | null;
  rules: string | null;
  validFrom: string | null;
  validUntil: string | null;
  couponCode: string | null;
  redeemUrl: string | null;
  eligibility: BenefitEligibility;
  frequency: BenefitFrequency;
  featured: boolean;
  status: string;
  order: number;
  _count: { redemptions: number };
  /// Resgates de verdade ("Usar benefício") e quantos associados distintos —
  /// calculados no servidor, ver GET /api/admin/benefits.
  usesCount: number;
  uniqueUsersCount: number;
};

type PartnerForm = {
  id: string | null;
  name: string;
  logoUrl: string;
  categoryId: string;
  country: string;
  city: string;
  website: string;
  instagram: string;
  whatsapp: string;
  contactEmail: string;
  shortDescription: string;
  fullDescription: string;
  status: "active" | "inactive";
  order: string;
};

const EMPTY_PARTNER_FORM: PartnerForm = {
  id: null, name: "", logoUrl: "", categoryId: "", country: "", city: "", website: "",
  instagram: "", whatsapp: "", contactEmail: "", shortDescription: "", fullDescription: "",
  status: "active", order: "0",
};

type BenefitForm = {
  id: string | null;
  partnerId: string;
  title: string;
  type: BenefitType;
  description: string;
  rules: string;
  validFrom: string;
  validUntil: string;
  couponCode: string;
  redeemUrl: string;
  eligibility: BenefitEligibility;
  frequency: BenefitFrequency;
  featured: boolean;
  status: "active" | "inactive";
  order: string;
};

const EMPTY_BENEFIT_FORM: BenefitForm = {
  id: null, partnerId: "", title: "", type: "PERCENT_DISCOUNT", description: "", rules: "",
  validFrom: "", validUntil: "", couponCode: "", redeemUrl: "", eligibility: "ALL",
  frequency: "SINGLE_USE", featured: false, status: "active", order: "0",
};

type Prospect = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  category: string | null;
  country: string | null;
  city: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  notes: string | null;
  status: ProspectStatus;
  order: number;
  lastProposalSentAt: string | null;
  proposalsSentCount: number;
};

type ProspectForm = {
  id: string | null;
  companyName: string;
  logoUrl: string;
  category: string;
  country: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  notes: string;
  status: ProspectStatus;
};

const EMPTY_PROSPECT_FORM: ProspectForm = {
  id: null, companyName: "", logoUrl: "", category: "", country: "", city: "", contactName: "",
  contactEmail: "", contactPhone: "", website: "", notes: "", status: "PROSPECTED",
};

// Mesmo assunto/texto do modelo oficial de e-mail em src/lib/email.ts — só
// pra mostrar aqui no admin (nunca importar lib/email.ts num componente
// client, ela usa a chave do Resend). Se o texto do e-mail mudar lá, atualizar
// aqui também.
const OFFICIAL_PROPOSAL_SUBJECT: Record<"pt" | "en", string> = {
  pt: "Convite para Parceria Institucional — Member Privileges | Câmara de Comércio Brasil-Omã",
  en: "Institutional Partnership Invitation — Member Privileges | Brazil–Oman Chamber of Commerce",
};
const OFFICIAL_PROPOSAL_PREVIEW: Record<"pt" | "en", string> = {
  pt: `À [Nome da empresa],

A Câmara de Comércio Brasil-Omã tem a satisfação de convidar [Nome da empresa] a integrar o Member Privileges, programa de benefícios exclusivos destinado aos associados da Câmara.

O programa reúne empresas selecionadas de diferentes segmentos, no Brasil, em Omã e internacionalmente. A parceria não tem custo de adesão — a empresa só concede uma condição especial aos associados.

UMA PARCERIA SIMPLES, EXCLUSIVA E DE VALOR
A empresa parceira define livremente o benefício: desconto, upgrade, cortesia, experiência VIP, condição comercial diferenciada ou outra vantagem exclusiva.

A CÂMARA OFERECE
A empresa e seu benefício são apresentados no Member Privileges, com logo, descrição, benefício, localização e condições — reservado aos associados ativos.

Gostaríamos de ter [Nome da empresa] entre nossos parceiros. Pra seguir, é só responder com: benefício oferecido, condições/restrições, validade e contato responsável.`,
  en: `To [Company Name],

The Brazil–Oman Chamber of Commerce is pleased to invite [Company Name] to join Member Privileges, an exclusive benefits program for the Chamber's members.

The program brings together selected companies from different sectors, in Brazil, Oman and internationally. The partnership has no membership cost — the company just grants a special condition to members.

A SIMPLE, EXCLUSIVE AND VALUABLE PARTNERSHIP
The partner company freely defines the benefit: discount, upgrade, courtesy, VIP experience, special commercial condition or another exclusive advantage.

THE CHAMBER OFFERS
The company and its benefit are featured in Member Privileges, with logo, description, benefit, location and terms — reserved for active members.

We would love to have [Company Name] among our partners. To move forward, simply reply with: benefit offered, conditions/restrictions, validity, and the responsible contact.`,
};

type Tab = "partners" | "benefits" | "categories" | "prospects";

/** Painel admin do módulo "Parceiros & Benefícios" — marketplace exclusivo
 *  dentro da Área do Associado. Curadoria manual, sem integração externa. */
export function AdminBenefits() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("partners");
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [benefits, setBenefits] = useState<BenefitRow[] | null>(null);
  const [prospects, setProspects] = useState<Prospect[] | null>(null);
  const [redemptionsThisMonth, setRedemptionsThisMonth] = useState(0);
  const [error, setError] = useState("");

  const [partnerForm, setPartnerForm] = useState<PartnerForm | null>(null);
  const [benefitForm, setBenefitForm] = useState<BenefitForm | null>(null);
  const [prospectForm, setProspectForm] = useState<ProspectForm | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [historyBenefit, setHistoryBenefit] = useState<BenefitRow | null>(null);
  const [historyRows, setHistoryRows] = useState<
    { id: string; createdAt: string; memberName: string; memberCompany: string }[] | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProspectLogo, setUploadingProspectLogo] = useState(false);
  const [selectedProspectIds, setSelectedProspectIds] = useState<Set<string>>(new Set());
  const [proposalForm, setProposalForm] = useState<{
    template: "official" | "custom";
    language: "pt" | "en";
    subject: string;
    message: string;
    imageUrl: string;
    attachmentUrl: string;
    attachmentFilename: string;
  } | null>(null);
  const [uploadingProposalImage, setUploadingProposalImage] = useState(false);
  const [uploadingProposalAttachment, setUploadingProposalAttachment] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [proposalResult, setProposalResult] = useState<{ sentCount: number; skippedNoEmail: string[]; failedNames: string[] } | null>(null);

  const loadAll = useCallback(async () => {
    const [catsRes, partnersRes, benefitsRes, prospectsRes] = await Promise.all([
      fetch("/api/admin/benefit-categories"),
      fetch("/api/admin/benefit-partners"),
      fetch("/api/admin/benefits"),
      fetch("/api/admin/partner-prospects"),
    ]);
    if (catsRes.status === 401) {
      router.push("/admin/login");
      return;
    }
    const catsJson = await catsRes.json();
    const partnersJson = await partnersRes.json();
    const benefitsJson = await benefitsRes.json();
    const prospectsJson = await prospectsRes.json();
    if (!catsRes.ok || !partnersRes.ok || !benefitsRes.ok || !prospectsRes.ok) {
      setError("Erro ao carregar.");
      return;
    }
    setCategories(catsJson.categories);
    setPartners(partnersJson.partners);
    setBenefits(benefitsJson.benefits);
    setRedemptionsThisMonth(benefitsJson.redemptionsThisMonth ?? 0);
    setProspects(prospectsJson.prospects);
  }, [router]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const stats = useMemo(() => {
    if (!partners || !benefits) return null;
    const partnersAtivos = partners.filter((p) => p.status === "active").length;
    const beneficiosAtivos = benefits.filter((b) => b.status === "active").length;
    const maisAcessados = [...benefits]
      .filter((b) => b._count.redemptions > 0)
      .sort((a, b) => b._count.redemptions - a._count.redemptions)
      .slice(0, 5);
    const porPais = new Map<string, number>();
    for (const p of partners) porPais.set(p.country, (porPais.get(p.country) ?? 0) + 1);
    const porCategoria = new Map<string, number>();
    for (const p of partners) porCategoria.set(p.category.name, (porCategoria.get(p.category.name) ?? 0) + 1);
    return { partnersAtivos, beneficiosAtivos, maisAcessados, porPais, porCategoria };
  }, [partners, benefits]);

  // ---------- Parceiros ----------
  function openNewPartner() {
    setPartnerForm({ ...EMPTY_PARTNER_FORM, categoryId: categories?.[0]?.id ?? "", order: String((partners?.length ?? 0) * 10) });
  }
  function openEditPartner(p: Partner) {
    setPartnerForm({
      id: p.id, name: p.name, logoUrl: p.logoUrl || "", categoryId: p.categoryId,
      country: p.country, city: p.city || "", website: p.website || "", instagram: p.instagram || "",
      whatsapp: p.whatsapp || "", contactEmail: p.contactEmail || "", shortDescription: p.shortDescription || "",
      fullDescription: p.fullDescription || "", status: p.status as "active" | "inactive", order: String(p.order),
    });
  }
  async function onUploadPartnerLogo(file: File) {
    setUploadingLogo(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      setPartnerForm((f) => (f ? { ...f, logoUrl: json.url } : f));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload da logo.");
    } finally {
      setUploadingLogo(false);
    }
  }
  async function onSavePartner(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!partnerForm) return;
    setSaving(true);
    setError("");
    try {
      const order = parseInt(partnerForm.order, 10);
      const payload = {
        name: partnerForm.name,
        logoUrl: partnerForm.logoUrl || null,
        categoryId: partnerForm.categoryId,
        country: partnerForm.country,
        city: partnerForm.city || null,
        website: partnerForm.website || null,
        instagram: partnerForm.instagram || null,
        whatsapp: partnerForm.whatsapp || null,
        contactEmail: partnerForm.contactEmail || null,
        shortDescription: partnerForm.shortDescription || null,
        fullDescription: partnerForm.fullDescription || null,
        status: partnerForm.status,
        order: Number.isFinite(order) ? order : 0,
      };
      const res = await fetch(partnerForm.id ? `/api/admin/benefit-partners/${partnerForm.id}` : "/api/admin/benefit-partners", {
        method: partnerForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível salvar.");
        return;
      }
      setPartnerForm(null);
      await loadAll();
    } finally {
      setSaving(false);
    }
  }
  async function onDeletePartner(id: string) {
    if (!confirm("Remover este parceiro? Os benefícios dele também serão removidos.")) return;
    const res = await fetch(`/api/admin/benefit-partners/${id}`, { method: "DELETE" });
    if (res.ok) await loadAll();
  }

  // ---------- Benefícios ----------
  function openNewBenefit() {
    setBenefitForm({ ...EMPTY_BENEFIT_FORM, partnerId: partners?.[0]?.id ?? "", order: String((benefits?.length ?? 0) * 10) });
  }
  function openEditBenefit(b: BenefitRow) {
    setBenefitForm({
      id: b.id, partnerId: b.partnerId, title: b.title, type: b.type,
      description: b.description || "", rules: b.rules || "",
      validFrom: b.validFrom ? b.validFrom.slice(0, 10) : "", validUntil: b.validUntil ? b.validUntil.slice(0, 10) : "",
      couponCode: b.couponCode || "", redeemUrl: b.redeemUrl || "", eligibility: b.eligibility,
      frequency: b.frequency, featured: b.featured, status: b.status as "active" | "inactive", order: String(b.order),
    });
  }
  async function onSaveBenefit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!benefitForm) return;
    setSaving(true);
    setError("");
    try {
      const order = parseInt(benefitForm.order, 10);
      const payload = {
        partnerId: benefitForm.partnerId,
        title: benefitForm.title,
        type: benefitForm.type,
        description: benefitForm.description || null,
        rules: benefitForm.rules || null,
        validFrom: benefitForm.validFrom ? new Date(benefitForm.validFrom).toISOString() : null,
        validUntil: benefitForm.validUntil ? new Date(benefitForm.validUntil).toISOString() : null,
        couponCode: benefitForm.couponCode || null,
        redeemUrl: benefitForm.redeemUrl || null,
        eligibility: benefitForm.eligibility,
        frequency: benefitForm.frequency,
        featured: benefitForm.featured,
        status: benefitForm.status,
        order: Number.isFinite(order) ? order : 0,
      };
      const res = await fetch(benefitForm.id ? `/api/admin/benefits/${benefitForm.id}` : "/api/admin/benefits", {
        method: benefitForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível salvar.");
        return;
      }
      setBenefitForm(null);
      await loadAll();
    } finally {
      setSaving(false);
    }
  }
  async function onDeleteBenefit(id: string) {
    if (!confirm("Remover este benefício?")) return;
    const res = await fetch(`/api/admin/benefits/${id}`, { method: "DELETE" });
    if (res.ok) await loadAll();
  }
  async function openHistory(b: BenefitRow) {
    setHistoryBenefit(b);
    setHistoryRows(null);
    try {
      const res = await fetch(`/api/admin/benefits/${b.id}/redemptions`);
      const json = await res.json();
      setHistoryRows(res.ok ? json.redemptions : []);
    } catch {
      setHistoryRows([]);
    }
  }

  // ---------- Categorias ----------
  async function onAddCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/benefit-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), order: (categories?.length ?? 0) * 10 }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível criar a categoria.");
        return;
      }
      setNewCategoryName("");
      await loadAll();
    } finally {
      setSaving(false);
    }
  }
  async function onDeleteCategory(id: string) {
    if (!confirm("Remover essa categoria?")) return;
    const res = await fetch(`/api/admin/benefit-categories/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Não foi possível remover.");
      return;
    }
    await loadAll();
  }

  // ---------- Captação de Parceiros ----------
  function openNewProspect() {
    setProspectForm({ ...EMPTY_PROSPECT_FORM });
  }
  function openEditProspect(p: Prospect) {
    setProspectForm({
      id: p.id, companyName: p.companyName, logoUrl: p.logoUrl || "", category: p.category || "", country: p.country || "",
      city: p.city || "", contactName: p.contactName || "", contactEmail: p.contactEmail || "",
      contactPhone: p.contactPhone || "", website: p.website || "", notes: p.notes || "", status: p.status,
    });
  }
  async function onUploadProspectLogo(file: File) {
    setUploadingProspectLogo(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      setProspectForm((f) => (f ? { ...f, logoUrl: json.url } : f));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload da imagem.");
    } finally {
      setUploadingProspectLogo(false);
    }
  }
  async function onSaveProspect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prospectForm) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        companyName: prospectForm.companyName,
        logoUrl: prospectForm.logoUrl || null,
        category: prospectForm.category || null,
        country: prospectForm.country || null,
        city: prospectForm.city || null,
        contactName: prospectForm.contactName || null,
        contactEmail: prospectForm.contactEmail || null,
        contactPhone: prospectForm.contactPhone || null,
        website: prospectForm.website || null,
        notes: prospectForm.notes || null,
        status: prospectForm.status,
      };
      const res = await fetch(prospectForm.id ? `/api/admin/partner-prospects/${prospectForm.id}` : "/api/admin/partner-prospects", {
        method: prospectForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível salvar.");
        return;
      }
      setProspectForm(null);
      await loadAll();
    } finally {
      setSaving(false);
    }
  }
  async function onChangeProspectStatus(id: string, status: ProspectStatus) {
    setProspects((prev) => prev?.map((p) => (p.id === id ? { ...p, status } : p)) ?? prev);
    await fetch(`/api/admin/partner-prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }
  async function onDeleteProspect(id: string) {
    if (!confirm("Remover esse prospect do funil?")) return;
    const res = await fetch(`/api/admin/partner-prospects/${id}`, { method: "DELETE" });
    if (res.ok) await loadAll();
  }
  function toggleProspectSelected(id: string) {
    setSelectedProspectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function openProposalForm() {
    setProposalResult(null);
    setProposalForm({ template: "official", language: "pt", subject: OFFICIAL_PROPOSAL_SUBJECT.pt, message: "", imageUrl: "", attachmentUrl: "", attachmentFilename: "" });
  }
  async function onUploadProposalImage(file: File) {
    setUploadingProposalImage(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      setProposalForm((f) => (f ? { ...f, imageUrl: json.url } : f));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload da imagem.");
    } finally {
      setUploadingProposalImage(false);
    }
  }
  async function onUploadProposalAttachment(file: File) {
    setUploadingProposalAttachment(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      setProposalForm((f) => (f ? { ...f, attachmentUrl: json.url, attachmentFilename: file.name } : f));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload do PDF.");
    } finally {
      setUploadingProposalAttachment(false);
    }
  }
  async function onSendProposal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!proposalForm || selectedProspectIds.size === 0) return;
    setSendingProposal(true);
    setError("");
    try {
      const res = await fetch("/api/admin/partner-prospects/send-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectIds: Array.from(selectedProspectIds),
          template: proposalForm.template,
          language: proposalForm.language,
          subject: proposalForm.subject,
          message: proposalForm.message,
          imageUrl: proposalForm.imageUrl || null,
          attachmentUrl: proposalForm.attachmentUrl || null,
          attachmentFilename: proposalForm.attachmentFilename || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Não foi possível enviar.");
        return;
      }
      setProposalResult({ sentCount: json.sentCount, skippedNoEmail: json.skippedNoEmail, failedNames: json.failedNames });
      setProposalForm(null);
      setSelectedProspectIds(new Set());
      await loadAll();
    } finally {
      setSendingProposal(false);
    }
  }

  return (
    <AdminLayout
      active="beneficios"
      title="Parceiros & Benefícios"
      lead="Marketplace exclusivo de benefícios pra associados — 100% dentro da Área do Associado, sem redirecionar pra sites externos ou clubes de terceiros."
      actions={
        tab === "partners" ? (
          <button type="button" className="btn btn-primary" onClick={openNewPartner}><Icon name="plus" /> Novo Parceiro</button>
        ) : tab === "benefits" ? (
          <button type="button" className="btn btn-primary" onClick={openNewBenefit} disabled={!partners?.length}><Icon name="plus" /> Novo Benefício</button>
        ) : tab === "prospects" ? (
          <button type="button" className="btn btn-primary" onClick={openNewProspect}><Icon name="plus" /> Novo Prospect</button>
        ) : null
      }
    >
      {error && <p className="form-note err">{error}</p>}

      {stats && (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-positive"><Icon name="briefcase" /></span>
            <div>
              <p className="admin-stat-value">{stats.partnersAtivos}</p>
              <p className="admin-stat-label">Parceiros Ativos</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-neutral"><Icon name="ticket" /></span>
            <div>
              <p className="admin-stat-value">{stats.beneficiosAtivos}</p>
              <p className="admin-stat-label">Benefícios Ativos</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-info"><Icon name="trending" /></span>
            <div>
              <p className="admin-stat-value">{redemptionsThisMonth}</p>
              <p className="admin-stat-label">Resgates Este Mês</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-warning"><Icon name="globe" /></span>
            <div>
              <p className="admin-stat-value">{stats.porPais.size}</p>
              <p className="admin-stat-label">Países</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-neutral"><Icon name="grid" /></span>
            <div>
              <p className="admin-stat-value">{categories?.length ?? 0}</p>
              <p className="admin-stat-label">Categorias</p>
            </div>
          </div>
        </div>
      )}

      {stats && stats.maisAcessados.length > 0 && (
        <div className="admin-report-card" style={{ marginBottom: 28 }}>
          <h3 className="mp-subtitle mp-subtitle-tight" style={{ marginTop: 0 }}>Benefícios mais acessados</h3>
          {stats.maisAcessados.map((b) => (
            <div className="admin-report-row" key={b.id}>
              <span className="admin-report-row-label" style={{ width: 200 }} title={`${b.title} (${b.partner.name})`}>{b.title}</span>
              <div className="admin-report-row-bar"><div style={{ width: `${Math.min(100, (b._count.redemptions / stats.maisAcessados[0]._count.redemptions) * 100)}%` }} /></div>
              <span className="admin-report-row-value">{b._count.redemptions}</span>
            </div>
          ))}
        </div>
      )}

      <div className="admin-tabs">
        <button type="button" className={tab === "partners" ? "active" : ""} onClick={() => setTab("partners")}>Parceiros ({partners?.length ?? 0})</button>
        <button type="button" className={tab === "benefits" ? "active" : ""} onClick={() => setTab("benefits")}>Benefícios ({benefits?.length ?? 0})</button>
        <button type="button" className={tab === "categories" ? "active" : ""} onClick={() => setTab("categories")}>Categorias ({categories?.length ?? 0})</button>
        <button type="button" className={tab === "prospects" ? "active" : ""} onClick={() => setTab("prospects")}>Captação ({prospects?.length ?? 0})</button>
      </div>

      {tab === "partners" && (
        <>
          {partnerForm && (
            <form className="contact-form mp-form" onSubmit={onSavePartner} style={{ marginBottom: 32, maxWidth: 620 }}>
              <h3 className="mp-form-title">{partnerForm.id ? "Editar parceiro" : "Novo parceiro"}</h3>
              <label>Nome da empresa
                <input type="text" required maxLength={200} value={partnerForm.name} onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })} />
              </label>
              <label>Categoria
                <select required value={partnerForm.categoryId} onChange={(e) => setPartnerForm({ ...partnerForm, categoryId: e.target.value })}>
                  <option value="" disabled>Selecione…</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>País
                  <input type="text" required maxLength={120} value={partnerForm.country} onChange={(e) => setPartnerForm({ ...partnerForm, country: e.target.value })} />
                </label>
                <label>Cidade
                  <input type="text" maxLength={120} value={partnerForm.city} onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })} />
                </label>
              </div>
              <label>Site
                <input type="url" maxLength={300} placeholder="https://…" value={partnerForm.website} onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>Instagram
                  <input type="text" maxLength={300} placeholder="@empresa" value={partnerForm.instagram} onChange={(e) => setPartnerForm({ ...partnerForm, instagram: e.target.value })} />
                </label>
                <label>Telefone/WhatsApp
                  <input type="text" maxLength={60} value={partnerForm.whatsapp} onChange={(e) => setPartnerForm({ ...partnerForm, whatsapp: e.target.value })} />
                </label>
              </div>
              <label>E-mail de contato
                <input type="email" maxLength={200} value={partnerForm.contactEmail} onChange={(e) => setPartnerForm({ ...partnerForm, contactEmail: e.target.value })} />
              </label>
              <label>Descrição curta
                <input type="text" maxLength={300} value={partnerForm.shortDescription} onChange={(e) => setPartnerForm({ ...partnerForm, shortDescription: e.target.value })} />
              </label>
              <label>Descrição completa
                <textarea rows={3} maxLength={4000} value={partnerForm.fullDescription} onChange={(e) => setPartnerForm({ ...partnerForm, fullDescription: e.target.value })} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>Status
                  <select value={partnerForm.status} onChange={(e) => setPartnerForm({ ...partnerForm, status: e.target.value as "active" | "inactive" })}>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </label>
                <label>Ordem de exibição
                  <input type="number" value={partnerForm.order} onChange={(e) => setPartnerForm({ ...partnerForm, order: e.target.value })} />
                </label>
              </div>
              <label>Logomarca
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadPartnerLogo(f); }} />
              </label>
              {uploadingLogo && <p className="cp-chips-label">Enviando logo…</p>}
              {partnerForm.logoUrl && (
                <div style={{ marginTop: -8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={partnerForm.logoUrl} alt="" style={{ width: 88, height: 88, objectFit: "contain", borderRadius: 6, border: "1px solid var(--border)", background: "#fff" }} />
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setPartnerForm(null)}>Cancelar</button>
              </div>
            </form>
          )}

          {partners === null ? (
            <p className="section-lead">Carregando…</p>
          ) : partners.length === 0 ? (
            <div className="admin-empty"><Icon name="briefcase" /><p>Nenhum parceiro cadastrado ainda.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Parceiro</th><th>Categoria</th><th>País</th><th>Benefícios</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-table-person">
                          {p.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.logoUrl} alt="" className="admin-table-avatar" style={{ objectFit: "contain", background: "#fff" }} />
                          ) : (
                            <span className="admin-table-avatar">{p.name.slice(0, 2).toUpperCase()}</span>
                          )}
                          <span><strong>{p.name}</strong>{p.city && <small>{p.city}</small>}</span>
                        </div>
                      </td>
                      <td>{p.category.name}</td>
                      <td>{p.country}</td>
                      <td>{p._count.benefits}</td>
                      <td><span className={`admin-badge tone-${p.status === "active" ? "positive" : "neutral"}`}>{p.status === "active" ? "Ativo" : "Inativo"}</span></td>
                      <td>
                        <button type="button" className="btn btn-ghost" onClick={() => openEditPartner(p)}>Editar</button>{" "}
                        <button type="button" className="btn btn-ghost" onClick={() => onDeletePartner(p.id)}>Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "benefits" && (
        <>
          {!partners?.length && <p className="form-note">Cadastre um parceiro antes de criar benefícios.</p>}
          {benefitForm && (
            <form className="contact-form mp-form" onSubmit={onSaveBenefit} style={{ marginBottom: 32, maxWidth: 620 }}>
              <h3 className="mp-form-title">{benefitForm.id ? "Editar benefício" : "Novo benefício"}</h3>
              <label>Parceiro
                <select required value={benefitForm.partnerId} onChange={(e) => setBenefitForm({ ...benefitForm, partnerId: e.target.value })}>
                  <option value="" disabled>Selecione…</option>
                  {partners?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label>Benefício oferecido
                <input type="text" required maxLength={200} placeholder="Ex.: 20% de desconto em diárias" value={benefitForm.title} onChange={(e) => setBenefitForm({ ...benefitForm, title: e.target.value })} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>Tipo de benefício
                  <select value={benefitForm.type} onChange={(e) => setBenefitForm({ ...benefitForm, type: e.target.value as BenefitType })}>
                    {BENEFIT_TYPES.map((t) => <option key={t} value={t}>{BENEFIT_TYPE_LABELS[t]}</option>)}
                  </select>
                </label>
                <label>Nível elegível
                  <select value={benefitForm.eligibility} onChange={(e) => setBenefitForm({ ...benefitForm, eligibility: e.target.value as BenefitEligibility })}>
                    {ELIGIBILITY_OPTIONS.map((o) => <option key={o} value={o}>{ELIGIBILITY_LABELS[o]}</option>)}
                  </select>
                </label>
              </div>
              <label>Descrição completa
                <textarea rows={3} maxLength={4000} value={benefitForm.description} onChange={(e) => setBenefitForm({ ...benefitForm, description: e.target.value })} />
              </label>
              <label>Regras de utilização
                <textarea rows={2} maxLength={2000} value={benefitForm.rules} onChange={(e) => setBenefitForm({ ...benefitForm, rules: e.target.value })} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>Validade inicial
                  <input type="date" value={benefitForm.validFrom} onChange={(e) => setBenefitForm({ ...benefitForm, validFrom: e.target.value })} />
                </label>
                <label>Validade final
                  <input type="date" value={benefitForm.validUntil} onChange={(e) => setBenefitForm({ ...benefitForm, validUntil: e.target.value })} />
                </label>
              </div>
              <p className="cp-chips-label" style={{ marginTop: -10 }}>Depois da validade final, o benefício some sozinho pro associado e da vitrine pública — mesmo com status Ativo. Não precisa desativar na mão.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>Cupom/código (se houver)
                  <input type="text" maxLength={120} value={benefitForm.couponCode} onChange={(e) => setBenefitForm({ ...benefitForm, couponCode: e.target.value })} />
                </label>
                <label>Link de resgate (se necessário)
                  <input type="url" maxLength={500} placeholder="https://…" value={benefitForm.redeemUrl} onChange={(e) => setBenefitForm({ ...benefitForm, redeemUrl: e.target.value })} />
                </label>
              </div>
              <label>Frequência de uso
                <select value={benefitForm.frequency} onChange={(e) => setBenefitForm({ ...benefitForm, frequency: e.target.value as BenefitFrequency })}>
                  {BENEFIT_FREQUENCIES.map((f) => <option key={f} value={f}>{BENEFIT_FREQUENCY_LABELS[f]}</option>)}
                </select>
              </label>
              <p className="cp-chips-label" style={{ marginTop: -10 }}>Controla quantas vezes o mesmo associado pode clicar em &quot;Usar benefício&quot; (o que dispara o e-mail com o cupom). &quot;Uso único&quot; é o padrão — use as outras opções só pra benefícios recorrentes (ex.: desconto toda vez que for ao parceiro).</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <label>Status
                  <select value={benefitForm.status} onChange={(e) => setBenefitForm({ ...benefitForm, status: e.target.value as "active" | "inactive" })}>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </label>
                <label>Ordem
                  <input type="number" value={benefitForm.order} onChange={(e) => setBenefitForm({ ...benefitForm, order: e.target.value })} />
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
                  <input type="checkbox" checked={benefitForm.featured} onChange={(e) => setBenefitForm({ ...benefitForm, featured: e.target.checked })} style={{ width: "auto" }} />
                  Destaque
                </label>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setBenefitForm(null)}>Cancelar</button>
              </div>
            </form>
          )}

          {benefits === null ? (
            <p className="section-lead">Carregando…</p>
          ) : benefits.length === 0 ? (
            <div className="admin-empty"><Icon name="ticket" /><p>Nenhum benefício cadastrado ainda.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Benefício</th><th>Parceiro</th><th>Tipo</th><th>Nível</th><th>Frequência</th><th>Resgates</th><th>Associados únicos</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {benefits.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.title}</strong>{b.featured && <span className="admin-badge tone-warning" style={{ marginLeft: 8 }}>Destaque</span>}</td>
                      <td>{b.partner.name}</td>
                      <td>{BENEFIT_TYPE_LABELS[b.type]}</td>
                      <td>{ELIGIBILITY_LABELS[b.eligibility]}</td>
                      <td>{BENEFIT_FREQUENCY_LABELS[b.frequency]}</td>
                      <td>{b.usesCount}</td>
                      <td>{b.uniqueUsersCount}</td>
                      <td><span className={`admin-badge tone-${b.status === "active" ? "positive" : "neutral"}`}>{b.status === "active" ? "Ativo" : "Inativo"}</span></td>
                      <td>
                        <button type="button" className="btn btn-ghost" onClick={() => openEditBenefit(b)}>Editar</button>{" "}
                        <button type="button" className="btn btn-ghost" onClick={() => openHistory(b)}>Histórico</button>{" "}
                        <button type="button" className="btn btn-ghost" onClick={() => onDeleteBenefit(b.id)}>Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "categories" && (
        <>
          <form className="contact-form mp-form" onSubmit={onAddCategory} style={{ marginBottom: 28, maxWidth: 420 }}>
            <label>Nova categoria
              <input type="text" maxLength={120} placeholder="Ex.: Wellness" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={saving || !newCategoryName.trim()}>Adicionar</button>
          </form>

          {categories === null ? (
            <p className="section-lead">Carregando…</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Categoria</th><th>Parceiros</th><th>Ações</th></tr></thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c._count.partners}</td>
                      <td><button type="button" className="btn btn-ghost" onClick={() => onDeleteCategory(c.id)}>Remover</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "prospects" && (
        <>
          <p className="section-lead" style={{ marginTop: 0, marginBottom: 24 }}>
            Funil de negociação com empresas que ainda não são parceiras — mude o status direto no card conforme a conversa avança.
            Quando a parceria virar realidade, cadastre normalmente em <strong>Parceiros</strong>.
          </p>

          <div className="prospect-bulk-bar">
            <span>
              {selectedProspectIds.size === 0
                ? "Marque as empresas na lista abaixo pra enviar uma proposta em massa."
                : `${selectedProspectIds.size} empresa${selectedProspectIds.size > 1 ? "s" : ""} selecionada${selectedProspectIds.size > 1 ? "s" : ""}.`}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {selectedProspectIds.size > 0 && (
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedProspectIds(new Set())}>Limpar seleção</button>
              )}
              <button type="button" className="btn btn-primary" disabled={selectedProspectIds.size === 0} onClick={openProposalForm}>
                <Icon name="mail" /> Enviar proposta por e-mail
              </button>
            </div>
          </div>

          {proposalResult && (
            <div className="admin-empty" style={{ marginBottom: 24, textAlign: "left" }}>
              <p><strong>{proposalResult.sentCount}</strong> proposta{proposalResult.sentCount !== 1 ? "s" : ""} enviada{proposalResult.sentCount !== 1 ? "s" : ""} com sucesso.</p>
              {proposalResult.skippedNoEmail.length > 0 && (
                <p>Sem e-mail cadastrado (não recebeu): {proposalResult.skippedNoEmail.join(", ")}.</p>
              )}
              {proposalResult.failedNames.length > 0 && (
                <p>Falha no envio: {proposalResult.failedNames.join(", ")}.</p>
              )}
            </div>
          )}

          {proposalForm && (
            <form className="contact-form mp-form" onSubmit={onSendProposal} style={{ marginBottom: 32, maxWidth: 620 }}>
              <h3 className="mp-form-title">Enviar proposta por e-mail ({selectedProspectIds.size} empresa{selectedProspectIds.size > 1 ? "s" : ""})</h3>

              <div className="prospect-template-toggle">
                <label className={proposalForm.template === "official" ? "active" : ""}>
                  <input
                    type="radio"
                    name="proposal-template"
                    checked={proposalForm.template === "official"}
                    onChange={() => setProposalForm({ ...proposalForm, template: "official", subject: OFFICIAL_PROPOSAL_SUBJECT[proposalForm.language] })}
                  />
                  Modelo oficial (Convite Member Privileges)
                </label>
                <label className={proposalForm.template === "custom" ? "active" : ""}>
                  <input
                    type="radio"
                    name="proposal-template"
                    checked={proposalForm.template === "custom"}
                    onChange={() =>
                      setProposalForm({
                        ...proposalForm,
                        template: "custom",
                        subject: Object.values(OFFICIAL_PROPOSAL_SUBJECT).includes(proposalForm.subject) ? "" : proposalForm.subject,
                      })
                    }
                  />
                  Mensagem personalizada
                </label>
              </div>

              <div className="prospect-template-toggle">
                <label className={proposalForm.language === "pt" ? "active" : ""}>
                  <input
                    type="radio"
                    name="proposal-language"
                    checked={proposalForm.language === "pt"}
                    onChange={() =>
                      setProposalForm({
                        ...proposalForm,
                        language: "pt",
                        subject: proposalForm.template === "official" ? OFFICIAL_PROPOSAL_SUBJECT.pt : proposalForm.subject,
                      })
                    }
                  />
                  Português
                </label>
                <label className={proposalForm.language === "en" ? "active" : ""}>
                  <input
                    type="radio"
                    name="proposal-language"
                    checked={proposalForm.language === "en"}
                    onChange={() =>
                      setProposalForm({
                        ...proposalForm,
                        language: "en",
                        subject: proposalForm.template === "official" ? OFFICIAL_PROPOSAL_SUBJECT.en : proposalForm.subject,
                      })
                    }
                  />
                  English (captação no exterior)
                </label>
              </div>

              <label>Assunto
                <input type="text" required maxLength={200} placeholder="Ex.: Proposta de parceria — Câmara Brasil–Omã" value={proposalForm.subject} onChange={(e) => setProposalForm({ ...proposalForm, subject: e.target.value })} />
              </label>

              {proposalForm.template === "official" ? (
                <>
                  <div className="prospect-template-preview">
                    <p className="cp-chips-label" style={{ marginTop: 0 }}>Pré-visualização do texto fixo (enviado com o nome de cada empresa no lugar de &ldquo;[Nome da empresa]&rdquo;):</p>
                    <pre>{OFFICIAL_PROPOSAL_PREVIEW[proposalForm.language]}</pre>
                  </div>
                  <label>Observação adicional (opcional)
                    <textarea rows={3} maxLength={2000} placeholder="Um parágrafo extra, só se quiser acrescentar algo específico daquele contato." value={proposalForm.message} onChange={(e) => setProposalForm({ ...proposalForm, message: e.target.value })} />
                  </label>
                </>
              ) : (
                <label>Mensagem
                  <textarea rows={8} required maxLength={8000} placeholder="Escreva a proposta — cada empresa recebe com uma saudação personalizada com o próprio nome." value={proposalForm.message} onChange={(e) => setProposalForm({ ...proposalForm, message: e.target.value })} />
                </label>
              )}

              <label>Imagem/banner (opcional)
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadProposalImage(f); }} />
              </label>
              {uploadingProposalImage && <p className="cp-chips-label">Enviando imagem…</p>}
              {proposalForm.imageUrl && (
                <div style={{ marginTop: -8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proposalForm.imageUrl} alt="" style={{ width: "100%", maxWidth: 320, borderRadius: 6, border: "1px solid var(--border)" }} />
                </div>
              )}

              <label>Anexar PDF (opcional)
                <input type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadProposalAttachment(f); }} />
              </label>
              {uploadingProposalAttachment && <p className="cp-chips-label">Enviando PDF…</p>}
              {proposalForm.attachmentUrl && <p className="cp-chips-label">Anexado: {proposalForm.attachmentFilename}</p>}
              <p className="cp-chips-label" style={{ marginTop: -10 }}>
                Só quem tem e-mail de contato cadastrado recebe.
                {proposalForm.attachmentUrl && " Com anexo, o envio é um por um (mais lento que sem anexo, mas cada empresa continua com o texto personalizado)."}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={sendingProposal}>{sendingProposal ? "Enviando…" : `Enviar para ${selectedProspectIds.size}`}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setProposalForm(null)}>Cancelar</button>
              </div>
            </form>
          )}

          {prospectForm && (
            <form className="contact-form mp-form" onSubmit={onSaveProspect} style={{ marginBottom: 32, maxWidth: 560 }}>
              <h3 className="mp-form-title">{prospectForm.id ? "Editar prospect" : "Novo prospect"}</h3>
              <label>Nome da empresa
                <input type="text" required maxLength={200} value={prospectForm.companyName} onChange={(e) => setProspectForm({ ...prospectForm, companyName: e.target.value })} />
              </label>
              <label>Logo/imagem da empresa (opcional)
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadProspectLogo(f); }} />
              </label>
              {uploadingProspectLogo && <p className="cp-chips-label">Enviando imagem…</p>}
              {prospectForm.logoUrl && (
                <div style={{ marginTop: -8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={prospectForm.logoUrl} alt="" style={{ width: 88, height: 88, objectFit: "contain", borderRadius: 6, border: "1px solid var(--border)", background: "#fff" }} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>Categoria (opcional)
                  <input type="text" maxLength={120} placeholder="Ex.: Hotéis & Resorts" value={prospectForm.category} onChange={(e) => setProspectForm({ ...prospectForm, category: e.target.value })} />
                </label>
                <label>Status
                  <select value={prospectForm.status} onChange={(e) => setProspectForm({ ...prospectForm, status: e.target.value as ProspectStatus })}>
                    {PROSPECT_STATUSES.map((s) => <option key={s} value={s}>{PROSPECT_STATUS_LABELS[s]}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>País
                  <input type="text" maxLength={120} value={prospectForm.country} onChange={(e) => setProspectForm({ ...prospectForm, country: e.target.value })} />
                </label>
                <label>Cidade
                  <input type="text" maxLength={120} value={prospectForm.city} onChange={(e) => setProspectForm({ ...prospectForm, city: e.target.value })} />
                </label>
              </div>
              <label>Site
                <input type="url" maxLength={300} placeholder="https://…" value={prospectForm.website} onChange={(e) => setProspectForm({ ...prospectForm, website: e.target.value })} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>Pessoa de contato
                  <input type="text" maxLength={160} value={prospectForm.contactName} onChange={(e) => setProspectForm({ ...prospectForm, contactName: e.target.value })} />
                </label>
                <label>Telefone/WhatsApp
                  <input type="text" maxLength={60} value={prospectForm.contactPhone} onChange={(e) => setProspectForm({ ...prospectForm, contactPhone: e.target.value })} />
                </label>
              </div>
              <label>E-mail de contato
                <input type="email" maxLength={200} value={prospectForm.contactEmail} onChange={(e) => setProspectForm({ ...prospectForm, contactEmail: e.target.value })} />
              </label>
              <label>Anotações
                <textarea rows={3} maxLength={4000} placeholder="Histórico da negociação, próximos passos…" value={prospectForm.notes} onChange={(e) => setProspectForm({ ...prospectForm, notes: e.target.value })} />
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setProspectForm(null)}>Cancelar</button>
              </div>
            </form>
          )}

          {prospects === null ? (
            <p className="section-lead">Carregando…</p>
          ) : prospects.length === 0 ? (
            <div className="admin-empty"><Icon name="userplus" /><p>Nenhum prospect cadastrado ainda.</p></div>
          ) : (
            <div className="prospect-board">
              {PROSPECT_STATUSES.map((status) => {
                const items = prospects.filter((p) => p.status === status);
                return (
                  <div className="prospect-column" key={status}>
                    <p className="prospect-column-head">{PROSPECT_STATUS_LABELS[status]} <span>{items.length}</span></p>
                    {items.map((p) => (
                      <div className={`prospect-card${selectedProspectIds.has(p.id) ? " selected" : ""}`} key={p.id}>
                        <div className="prospect-card-head">
                          <label className="prospect-card-check">
                            <input type="checkbox" checked={selectedProspectIds.has(p.id)} onChange={() => toggleProspectSelected(p.id)} />
                          </label>
                          {p.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.logoUrl} alt="" className="prospect-card-logo" />
                          ) : (
                            <span className="prospect-card-logo prospect-card-logo-placeholder">{p.companyName.slice(0, 2).toUpperCase()}</span>
                          )}
                          <p className="prospect-card-name">{p.companyName}</p>
                        </div>
                        {(p.category || p.country) && (
                          <p className="prospect-card-meta">{[p.category, p.city, p.country].filter(Boolean).join(" · ")}</p>
                        )}
                        {p.contactName && <p className="prospect-card-contact">{p.contactName}</p>}
                        {p.contactEmail && <p className="prospect-card-contact">{p.contactEmail}</p>}
                        {p.contactPhone && <p className="prospect-card-contact">{p.contactPhone}</p>}
                        {p.notes && <p className="prospect-card-notes">{p.notes}</p>}
                        {p.lastProposalSentAt && (
                          <p className="prospect-card-proposal">
                            <Icon name="mail" /> Proposta enviada em {new Date(p.lastProposalSentAt).toLocaleDateString("pt-BR")}
                            {p.proposalsSentCount > 1 ? ` (${p.proposalsSentCount}x)` : ""}
                          </p>
                        )}
                        <select
                          className="prospect-card-status"
                          value={p.status}
                          onChange={(e) => onChangeProspectStatus(p.id, e.target.value as ProspectStatus)}
                        >
                          {PROSPECT_STATUSES.map((s) => <option key={s} value={s}>{PROSPECT_STATUS_LABELS[s]}</option>)}
                        </select>
                        <div className="prospect-card-actions">
                          <button type="button" className="btn btn-ghost" onClick={() => openEditProspect(p)}>Editar</button>
                          <button type="button" className="btn btn-ghost" onClick={() => onDeleteProspect(p.id)}>Remover</button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <p className="prospect-column-empty">—</p>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {historyBenefit && (
        <div className="benefit-modal-overlay" onClick={() => setHistoryBenefit(null)}>
          <div className="benefit-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="benefit-modal-close" onClick={() => setHistoryBenefit(null)} aria-label="Fechar">
              <Icon name="close" />
            </button>
            <h2 className="benefit-modal-title" style={{ marginTop: 0 }}>Histórico de resgates</h2>
            <p className="benefit-modal-text">
              {historyBenefit.title} · {historyBenefit.partner.name} — {BENEFIT_FREQUENCY_LABELS[historyBenefit.frequency]}
            </p>
            {historyRows === null ? (
              <p className="section-lead">Carregando…</p>
            ) : historyRows.length === 0 ? (
              <p className="section-lead">Nenhum resgate registrado ainda.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Associado</th><th>Empresa</th><th>Data e hora</th></tr></thead>
                  <tbody>
                    {historyRows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.memberName}</td>
                        <td>{r.memberCompany}</td>
                        <td>{new Date(r.createdAt).toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
