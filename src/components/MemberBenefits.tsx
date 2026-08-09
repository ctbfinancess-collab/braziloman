"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";
import { MemberDashboardShell } from "./MemberDashboardShell";
import { TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty";
import { BENEFIT_TYPE_LABELS, ELIGIBILITY_LABELS, type BenefitType, type BenefitEligibility } from "@/lib/benefits";

type ProfileFields = {
  name: string;
  email: string;
  company: string;
  role: string | null;
  sector: string | null;
  country: string | null;
  phone: string | null;
  createdAt: string;
};

export type BenefitItem = {
  id: string;
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
  createdAt: string;
  eligible: boolean;
  /// Data do resgate mais recente que ainda está dentro da janela de
  /// frequência do benefício (uso único já consumido, ou ainda dentro do
  /// dia/semana/mês configurado) — null quando o associado pode resgatar agora.
  alreadyUsedAt: string | null;
  partner: {
    id: string;
    name: string;
    logoUrl: string | null;
    category: string;
    country: string;
    city: string | null;
  };
};

function useDashboardText() {
  const { d, lang } = useI18n();
  return { t: d.memberArea.dashboard, lang };
}

function fmtDate(iso: string | null, lang: "pt" | "en"): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US");
}

async function logRedemption(benefitId: string, action: "view" | "use" | "coupon") {
  try {
    await fetch("/api/member/benefits/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benefitId, action }),
    });
  } catch {
    // silencioso — não bloqueia a navegação do associado por causa de log
  }
}

/// "Usar benefício" precisa da resposta (ao contrário de view/coupon, que só
/// registram estatística): o servidor pode responder "blocked" quando a
/// frequência de uso do benefício (uso único, 1x/dia etc.) já foi consumida.
async function redeemUse(benefitId: string): Promise<{ blocked: boolean; lastUsedAt?: string } | null> {
  try {
    const res = await fetch("/api/member/benefits/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benefitId, action: "use" }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function BenefitCard({ b, t, onOpen }: { b: BenefitItem; t: ReturnType<typeof useDashboardText>["t"]; onOpen: (b: BenefitItem) => void }) {
  return (
    <div className={`benefit-card${b.eligible ? "" : " locked"}`}>
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
      <span className="benefit-card-seal">{t.benefitsSeal}</span>
      <p className="benefit-card-title">{b.title}</p>
      {!b.eligible && (
        <p className="benefit-card-locked-note">
          <Icon name="lock" /> {t.benefitsLocked} {TIER_NAMES[b.eligibility as LoyaltyTier] ?? ELIGIBILITY_LABELS[b.eligibility]}
        </p>
      )}
      <button type="button" className="btn btn-ghost benefit-card-btn" disabled={!b.eligible} onClick={() => onOpen(b)}>
        {t.benefitsViewButton} <Icon name="arrowright" />
      </button>
    </div>
  );
}

/// Estado visual do botão de resgate depois de uma tentativa de "Usar
/// benefício" — "new" (resgate novo, e-mail enviado agora) ou "already"
/// (já estava/ficou fora da janela de uso, com a data do último resgate).
function UseResultNote({
  result,
  t,
  lang,
}: {
  result: { status: "new" } | { status: "already"; usedAt: string | null };
  t: ReturnType<typeof useDashboardText>["t"];
  lang: "pt" | "en";
}) {
  if (result.status === "new") {
    return <p className="benefit-modal-confirmed"><Icon name="check" /> {t.benefitsUseConfirmed}</p>;
  }
  return (
    <div className="benefit-modal-confirmed-box">
      <p className="benefit-modal-confirmed"><Icon name="check" /> {t.benefitsAlreadyUsedText}</p>
      {result.usedAt && <p className="benefit-modal-used-date">{t.benefitsUsedOnLabel} {fmtDate(result.usedAt, lang)}</p>}
    </div>
  );
}

export function MemberBenefits({ member, tier, benefits }: { member: ProfileFields; tier: LoyaltyTier; benefits: BenefitItem[] }) {
  const { t, lang } = useDashboardText();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  // Deep link vindo da vitrine pública (/member-privileges) — associado ativo
  // clica em "Ver benefício" lá e cai aqui já com o benefício aberto.
  const [active, setActive] = useState<BenefitItem | null>(() => {
    const openId = searchParams.get("open");
    return openId ? (benefits.find((b) => b.id === openId) ?? null) : null;
  });
  const [copied, setCopied] = useState(false);
  // "new": acabou de resgatar agora (mostra o aviso de e-mail enviado).
  // "already": já estava (ou ficou, na tentativa) fora da janela de uso —
  // mostra "✓ Benefício utilizado" + a data, sem reenviar e-mail. Nasce
  // preenchido quando o deep link (?open=) aponta pra um benefício que esse
  // associado já usou — nunca deixa o botão nascer clicável nesse caso.
  const [useResult, setUseResult] = useState<{ status: "new" } | { status: "already"; usedAt: string | null } | null>(() => {
    const openId = searchParams.get("open");
    const b = openId ? benefits.find((x) => x.id === openId) : null;
    return b?.alreadyUsedAt ? { status: "already", usedAt: b.alreadyUsedAt } : null;
  });

  const categories = useMemo(() => Array.from(new Set(benefits.map((b) => b.partner.category))).sort(), [benefits]);
  const countries = useMemo(() => Array.from(new Set(benefits.map((b) => b.partner.country))).sort(), [benefits]);
  const cities = useMemo(() => Array.from(new Set(benefits.map((b) => b.partner.city).filter((c): c is string => !!c))).sort(), [benefits]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return benefits.filter((b) => {
      if (term && !b.partner.name.toLowerCase().includes(term) && !b.title.toLowerCase().includes(term)) return false;
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
  const byCountry = useMemo(() => {
    const map = new Map<string, BenefitItem[]>();
    for (const b of filtered) {
      const list = map.get(b.partner.country) ?? [];
      list.push(b);
      map.set(b.partner.country, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  function openBenefit(b: BenefitItem) {
    setActive(b);
    setCopied(false);
    setUseResult(b.alreadyUsedAt ? { status: "already", usedAt: b.alreadyUsedAt } : null);
    logRedemption(b.id, "view");
  }

  async function onCopyCode(code: string, benefitId: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      logRedemption(benefitId, "coupon");
    } catch {
      // clipboard indisponível — ignora
    }
  }

  async function onUseBenefit(benefitId: string) {
    const result = await redeemUse(benefitId);
    if (result?.blocked) {
      setUseResult({ status: "already", usedAt: result.lastUsedAt ?? null });
    } else {
      // Sucesso (ou falha de rede) — sempre dá uma resposta visual: nunca
      // deixa o clique sem reação (era exatamente o bug reportado antes).
      setUseResult({ status: "new" });
    }
  }

  return (
    <MemberDashboardShell member={member} tier={tier} title={t.benefitsTitle} subtitle={t.benefitsLead}>
      <div className="dash-grid-single">
        <div className="dash-card">
          <div className="benefits-toolbar">
            <div className="benefits-search">
              <Icon name="search" />
              <input type="text" placeholder={t.benefitsSearchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t.benefitsFilterCategory}: {t.benefitsFilterAll}</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">{t.benefitsFilterCountry}: {t.benefitsFilterAll}</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {cities.length > 0 && (
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">{t.benefitsFilterCity}: {t.benefitsFilterAll}</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">{t.benefitsFilterType}: {t.benefitsFilterAll}</option>
              {Object.entries(BENEFIT_TYPE_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="section-lead" style={{ margin: "24px 0 0" }}>{t.benefitsEmpty}</p>
          ) : (
            <>
              {featured.length > 0 && (
                <section className="benefits-section">
                  <h2 className="mp-subtitle mp-subtitle-tight">{t.benefitsFeaturedTitle}</h2>
                  <div className="benefits-grid">{featured.map((b) => <BenefitCard key={b.id} b={b} t={t} onOpen={openBenefit} />)}</div>
                </section>
              )}
              {newest.length > 0 && (
                <section className="benefits-section">
                  <h2 className="mp-subtitle mp-subtitle-tight">{t.benefitsNewTitle}</h2>
                  <div className="benefits-grid">{newest.map((b) => <BenefitCard key={b.id} b={b} t={t} onOpen={openBenefit} />)}</div>
                </section>
              )}
              <section className="benefits-section">
                <h2 className="mp-subtitle mp-subtitle-tight">{t.benefitsByCountryTitle}</h2>
                {byCountry.map(([c, list]) => (
                  <div key={c} className="benefits-country-group">
                    <p className="benefits-country-label">{c}</p>
                    <div className="benefits-grid">{list.map((b) => <BenefitCard key={b.id} b={b} t={t} onOpen={openBenefit} />)}</div>
                  </div>
                ))}
              </section>
            </>
          )}
        </div>
      </div>

      {active && (
        <div className="benefit-modal-overlay" onClick={() => setActive(null)}>
          <div className="benefit-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="benefit-modal-close" onClick={() => setActive(null)} aria-label={t.benefitsClose}>
              <Icon name="close" />
            </button>
            <div className="benefit-card-head">
              {active.partner.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.partner.logoUrl} alt="" className="benefit-card-logo" />
              ) : (
                <span className="benefit-card-logo benefit-card-logo-placeholder">{active.partner.name.slice(0, 2).toUpperCase()}</span>
              )}
              <div>
                <p className="benefit-card-partner">{active.partner.name}</p>
                <p className="benefit-card-meta">{active.partner.category} · {active.partner.city ? `${active.partner.city}, ` : ""}{active.partner.country}</p>
              </div>
            </div>
            <h2 className="benefit-modal-title">{active.title}</h2>
            {active.description && <p className="benefit-modal-text">{active.description}</p>}

            {!active.eligible && (
              <p className="benefit-modal-notice">
                <Icon name="lock" /> {t.benefitsEligibilityNotice} {TIER_NAMES[active.eligibility as LoyaltyTier] ?? ELIGIBILITY_LABELS[active.eligibility]}.
              </p>
            )}

            {active.rules && (
              <>
                <p className="benefit-modal-label">{t.benefitsRulesTitle}</p>
                <p className="benefit-modal-text">{active.rules}</p>
              </>
            )}

            {(active.validFrom || active.validUntil) && (
              <>
                <p className="benefit-modal-label">{t.benefitsValidityTitle}</p>
                <p className="benefit-modal-text">{fmtDate(active.validFrom, lang)} — {fmtDate(active.validUntil, lang)}</p>
              </>
            )}

            {active.eligible && active.couponCode && (
              <>
                <p className="benefit-modal-label">{t.benefitsCouponLabel}</p>
                <div className="benefit-modal-coupon">
                  <code>{active.couponCode}</code>
                  <button type="button" className="btn btn-ghost" onClick={() => onCopyCode(active.couponCode!, active.id)}>
                    {copied ? t.benefitsCopied : t.benefitsCopyCode}
                  </button>
                </div>
              </>
            )}

            {active.eligible && active.redeemUrl && (
              <>
                <a
                  href={active.redeemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary benefit-modal-redeem"
                  onClick={() => onUseBenefit(active.id)}
                >
                  {t.benefitsRedeemButton} <Icon name="arrowright" />
                </a>
                {useResult && <UseResultNote result={useResult} t={t} lang={lang} />}
              </>
            )}
            {active.eligible && !active.redeemUrl && (
              useResult ? (
                <UseResultNote result={useResult} t={t} lang={lang} />
              ) : (
                <button type="button" className="btn btn-primary benefit-modal-redeem" onClick={() => onUseBenefit(active.id)}>
                  {t.benefitsUseButton}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </MemberDashboardShell>
  );
}
