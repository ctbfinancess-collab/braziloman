"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";
import { BENEFIT_TYPE_LABELS, type BenefitType, type BenefitEligibility } from "@/lib/benefits";

export type PublicBenefit = {
  id: string;
  title: string;
  type: BenefitType;
  eligibility: BenefitEligibility;
  featured: boolean;
  createdAt: string;
  partner: {
    id: string;
    name: string;
    logoUrl: string | null;
    category: string;
    country: string;
    city: string | null;
  };
};

const ACTIVE_STATUSES = ["ACTIVE", "APPROVED"];

function PublicBenefitCard({ b, seal, viewLabel, onView }: { b: PublicBenefit; seal: string; viewLabel: string; onView: (b: PublicBenefit) => void }) {
  return (
    <div className="benefit-card">
      <div className="benefit-card-head">
        {b.partner.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.partner.logoUrl} alt="" className="benefit-card-logo" />
        ) : (
          <span className="benefit-card-logo benefit-card-logo-placeholder">{b.partner.name.slice(0, 2).toUpperCase()}</span>
        )}
        <div>
          <p className="benefit-card-partner">{b.partner.name}</p>
          <p className="benefit-card-meta">{b.partner.category} · {b.partner.country}</p>
        </div>
      </div>
      <span className="benefit-card-seal">{seal}</span>
      <p className="benefit-card-title">{b.title}</p>
      <button type="button" className="btn btn-ghost benefit-card-btn" onClick={() => onView(b)}>
        {viewLabel} <Icon name="arrowright" />
      </button>
    </div>
  );
}

/** Vitrine PÚBLICA do "Member Privileges" — mesmos dados de BenefitPartner/
 *  Benefit já cadastrados no admin (nunca duplica cadastro), só que sem
 *  nenhum detalhe sensível (cupom, link de resgate, regras). Quem não é
 *  associado ativo vê um convite pra entrar/associar-se; quem já é, vai
 *  direto pro benefício dentro da Área do Associado. */
export function MemberPrivilegesPublic({ benefits }: { benefits: PublicBenefit[] }) {
  const { d } = useI18n();
  const t = d.memberPrivileges;
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [gateOpen, setGateOpen] = useState(false);
  const [isActiveMember, setIsActiveMember] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/member/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        setIsActiveMember(Boolean(json?.member && ACTIVE_STATUSES.includes(json.member.status)));
      })
      .catch(() => {
        if (!cancelled) setIsActiveMember(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => Array.from(new Set(benefits.map((b) => b.partner.category))).sort(), [benefits]);
  const countries = useMemo(() => Array.from(new Set(benefits.map((b) => b.partner.country))).sort(), [benefits]);
  const cities = useMemo(() => Array.from(new Set(benefits.map((b) => b.partner.city).filter((c): c is string => !!c))).sort(), [benefits]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return benefits.filter((b) => {
      if (term && !b.partner.name.toLowerCase().includes(term)) return false;
      if (category && b.partner.category !== category) return false;
      if (country && b.partner.country !== country) return false;
      if (city && b.partner.city !== city) return false;
      if (type && b.type !== type) return false;
      return true;
    });
  }, [benefits, search, category, country, city, type]);

  const featured = useMemo(() => filtered.filter((b) => b.featured).slice(0, 4), [filtered]);
  const newest = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
    [filtered]
  );
  const byCategory = useMemo(() => {
    const map = new Map<string, PublicBenefit[]>();
    for (const b of filtered) {
      const list = map.get(b.partner.category) ?? [];
      list.push(b);
      map.set(b.partner.category, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);
  const byCountry = useMemo(() => {
    const map = new Map<string, PublicBenefit[]>();
    for (const b of filtered) {
      const list = map.get(b.partner.country) ?? [];
      list.push(b);
      map.set(b.partner.country, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  function onView(b: PublicBenefit) {
    if (isActiveMember) {
      router.push(`/membro/painel/beneficios?open=${b.id}`);
      return;
    }
    setGateOpen(true);
  }

  return (
    <section className="section">
      <div className="container reveal">
        <p className="section-eyebrow center">{t.eyebrow}</p>
        <h1 className="section-title center">{t.title}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead center" style={{ maxWidth: 640, margin: "0 auto 40px" }}>{t.lead}</p>

        <div className="benefits-toolbar">
          <div className="benefits-search">
            <Icon name="search" />
            <input type="text" placeholder={t.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t.filterCategory}: {t.filterAll}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">{t.filterCountry}: {t.filterAll}</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {cities.length > 0 && (
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">{t.filterCity}: {t.filterAll}</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{t.filterType}: {t.filterAll}</option>
            {Object.entries(BENEFIT_TYPE_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="section-lead center" style={{ margin: "40px 0" }}>{t.empty}</p>
        ) : (
          <>
            {featured.length > 0 && (
              <section className="benefits-section">
                <h2 className="mp-subtitle mp-subtitle-tight">{t.featuredTitle}</h2>
                <div className="benefits-grid">{featured.map((b) => <PublicBenefitCard key={b.id} b={b} seal={t.seal} viewLabel={t.viewButton} onView={onView} />)}</div>
              </section>
            )}
            {newest.length > 0 && (
              <section className="benefits-section">
                <h2 className="mp-subtitle mp-subtitle-tight">{t.newTitle}</h2>
                <div className="benefits-grid">{newest.map((b) => <PublicBenefitCard key={b.id} b={b} seal={t.seal} viewLabel={t.viewButton} onView={onView} />)}</div>
              </section>
            )}
            <section className="benefits-section">
              <h2 className="mp-subtitle mp-subtitle-tight">{t.byCategoryTitle}</h2>
              {byCategory.map(([c, list]) => (
                <div key={c} className="benefits-country-group">
                  <p className="benefits-country-label">{c}</p>
                  <div className="benefits-grid">{list.map((b) => <PublicBenefitCard key={b.id} b={b} seal={t.seal} viewLabel={t.viewButton} onView={onView} />)}</div>
                </div>
              ))}
            </section>
            <section className="benefits-section">
              <h2 className="mp-subtitle mp-subtitle-tight">{t.byCountryTitle}</h2>
              {byCountry.map(([c, list]) => (
                <div key={c} className="benefits-country-group">
                  <p className="benefits-country-label">{c}</p>
                  <div className="benefits-grid">{list.map((b) => <PublicBenefitCard key={b.id} b={b} seal={t.seal} viewLabel={t.viewButton} onView={onView} />)}</div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>

      {gateOpen && (
        <div className="benefit-modal-overlay" onClick={() => setGateOpen(false)}>
          <div className="benefit-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="benefit-modal-close" onClick={() => setGateOpen(false)} aria-label={t.gateClose}>
              <Icon name="close" />
            </button>
            <span className="benefit-card-seal" style={{ marginBottom: 14 }}>{t.seal}</span>
            <h2 className="benefit-modal-title" style={{ marginTop: 0 }}>{t.gateTitle}</h2>
            <p className="benefit-modal-text">{t.gateText}</p>
            <Link href="/membro/login" className="btn btn-primary benefit-modal-redeem">{t.gateLoginButton}</Link>
            <Link href="/associe-se" className="btn btn-ghost benefit-modal-redeem" style={{ marginTop: 10 }}>{t.gateJoinButton}</Link>
          </div>
        </div>
      )}
    </section>
  );
}
