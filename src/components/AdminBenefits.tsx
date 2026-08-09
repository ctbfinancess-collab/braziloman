"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "./AdminLayout";
import { Icon } from "./Icons";
import { BENEFIT_TYPES, BENEFIT_TYPE_LABELS, ELIGIBILITY_OPTIONS, ELIGIBILITY_LABELS, type BenefitType, type BenefitEligibility } from "@/lib/benefits";

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
  featured: boolean;
  status: string;
  order: number;
  _count: { redemptions: number };
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
  featured: boolean;
  status: "active" | "inactive";
  order: string;
};

const EMPTY_BENEFIT_FORM: BenefitForm = {
  id: null, partnerId: "", title: "", type: "PERCENT_DISCOUNT", description: "", rules: "",
  validFrom: "", validUntil: "", couponCode: "", redeemUrl: "", eligibility: "ALL",
  featured: false, status: "active", order: "0",
};

type Tab = "partners" | "benefits" | "categories";

/** Painel admin do módulo "Parceiros & Benefícios" — marketplace exclusivo
 *  dentro da Área do Associado. Curadoria manual, sem integração externa. */
export function AdminBenefits() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("partners");
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [benefits, setBenefits] = useState<BenefitRow[] | null>(null);
  const [redemptionsThisMonth, setRedemptionsThisMonth] = useState(0);
  const [error, setError] = useState("");

  const [partnerForm, setPartnerForm] = useState<PartnerForm | null>(null);
  const [benefitForm, setBenefitForm] = useState<BenefitForm | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const loadAll = useCallback(async () => {
    const [catsRes, partnersRes, benefitsRes] = await Promise.all([
      fetch("/api/admin/benefit-categories"),
      fetch("/api/admin/benefit-partners"),
      fetch("/api/admin/benefits"),
    ]);
    if (catsRes.status === 401) {
      router.push("/admin/login");
      return;
    }
    const catsJson = await catsRes.json();
    const partnersJson = await partnersRes.json();
    const benefitsJson = await benefitsRes.json();
    if (!catsRes.ok || !partnersRes.ok || !benefitsRes.ok) {
      setError("Erro ao carregar.");
      return;
    }
    setCategories(catsJson.categories);
    setPartners(partnersJson.partners);
    setBenefits(benefitsJson.benefits);
    setRedemptionsThisMonth(benefitsJson.redemptionsThisMonth ?? 0);
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
      featured: b.featured, status: b.status as "active" | "inactive", order: String(b.order),
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label>Cupom/código (se houver)
                  <input type="text" maxLength={120} value={benefitForm.couponCode} onChange={(e) => setBenefitForm({ ...benefitForm, couponCode: e.target.value })} />
                </label>
                <label>Link de resgate (se necessário)
                  <input type="url" maxLength={500} placeholder="https://…" value={benefitForm.redeemUrl} onChange={(e) => setBenefitForm({ ...benefitForm, redeemUrl: e.target.value })} />
                </label>
              </div>
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
                <thead><tr><th>Benefício</th><th>Parceiro</th><th>Tipo</th><th>Nível</th><th>Resgates</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {benefits.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.title}</strong>{b.featured && <span className="admin-badge tone-warning" style={{ marginLeft: 8 }}>Destaque</span>}</td>
                      <td>{b.partner.name}</td>
                      <td>{BENEFIT_TYPE_LABELS[b.type]}</td>
                      <td>{ELIGIBILITY_LABELS[b.eligibility]}</td>
                      <td>{b._count.redemptions}</td>
                      <td><span className={`admin-badge tone-${b.status === "active" ? "positive" : "neutral"}`}>{b.status === "active" ? "Ativo" : "Inativo"}</span></td>
                      <td>
                        <button type="button" className="btn btn-ghost" onClick={() => openEditBenefit(b)}>Editar</button>{" "}
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
    </AdminLayout>
  );
}
