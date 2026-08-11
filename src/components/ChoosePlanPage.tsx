"use client";

import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";
import { MEMBERSHIP_PLANS, MEMBERSHIP_PLANS_NOTICE, VISIBLE_BENEFITS_COUNT, type MembershipPlanId } from "@/lib/membershipPlans";

/** Ícone do placeholder de imagem institucional de cada plano — provisório,
 *  até a Câmara enviar as três fotos reais (ver imageHint em membershipPlans.ts). */
const PLAN_PLACEHOLDER_ICON: Record<MembershipPlanId, string> = {
  empresarial: "handshake",
  corporativo: "globetech",
  estrategico: "plane",
};

/** Página "Escolha seu plano" — passo entre a aprovação da candidatura e o
 *  pagamento. Catálogo fixo (lib/membershipPlans.ts): três categorias com
 *  preço em USD, sem nenhuma relação com o Programa de Fidelidade
 *  (Gold/Black/Platinum são só de pontos, ver lib/loyalty.ts). */
export function ChoosePlanPage({ initialAccepted }: { initialAccepted: boolean }) {
  const { lang } = useI18n();
  const [loadingPlan, setLoadingPlan] = useState<MembershipPlanId | null>(null);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(initialAccepted);
  // Cada card expande/recolhe os benefícios "extras" sozinho, sem recarregar
  // a página nem abrir modal — chave é o id do plano.
  const [expanded, setExpanded] = useState<Record<MembershipPlanId, boolean>>({
    empresarial: false,
    corporativo: false,
    estrategico: false,
  });

  async function onChoose(planId: MembershipPlanId) {
    if (!accepted) {
      setError(
        lang === "pt"
          ? "Você precisa aceitar o Contrato de Associação para continuar."
          : "You need to accept the Membership Agreement to continue."
      );
      return;
    }
    setLoadingPlan(planId);
    setError("");
    try {
      const res = await fetch("/api/member/membership/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, acceptedTerms: accepted }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.assign(json.url);
        return;
      }
      setError(json.error || "Não foi possível continuar para o pagamento.");
    } catch {
      setError("Não foi possível continuar para o pagamento.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <section className="section">
      <div className="container reveal">
        <p className="section-eyebrow center">
          {lang === "pt" ? "Escolha sua categoria de associação" : "Choose your membership category"}
        </p>
        <h1 className="section-title center">
          {lang === "pt"
            ? "Conecte sua empresa ao ecossistema de negócios Brasil–Omã"
            : "Connect your company to the Brazil–Oman business ecosystem"}
        </h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead center" style={{ maxWidth: 660, margin: "0 auto 40px" }}>
          {lang === "pt"
            ? "Três categorias de associação, com diferentes níveis de suporte para empresas que desejam desenvolver negócios, estabelecer operações e ampliar sua presença entre os dois países."
            : "Three membership categories, with different levels of support for companies looking to grow business, establish operations and expand their presence between the two countries."}
        </p>

        <div style={{ maxWidth: 620, margin: "0 auto 32px" }}>
          <label className="wiz-check">
            <input type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); if (e.target.checked) setError(""); }} />
            {lang === "pt" ? (
              <span>
                Li e aceito o{" "}
                <a href="/contrato-associacao" style={{ color: "var(--gold-light)", textDecoration: "underline" }}>
                  Contrato de Associação
                </a>
                , incluindo os termos de cobrança, renovação e cancelamento da anuidade.
              </span>
            ) : (
              <span>
                I have read and accept the{" "}
                <a href="/contrato-associacao" style={{ color: "var(--gold-light)", textDecoration: "underline" }}>
                  Membership Agreement
                </a>
                , including its dues billing, renewal and cancellation terms.
              </span>
            )}
          </label>
        </div>

        {error && <p className="form-note err center" style={{ maxWidth: 480, margin: "0 auto 24px" }}>{error}</p>}

        <div className="plan-grid">
          {MEMBERSHIP_PLANS.map((plan) => (
            <div className="plan-card" key={plan.id}>
              <p className="plan-card-name">{plan.name}</p>

              {/* Foto real quando já tiver uma (imageSrc); senão, placeholder
                  elegante com ícone até a Câmara enviar (ver membershipPlans.ts). */}
              <div
                className={`plan-card-image${plan.imageSrc ? " has-photo" : ""}`}
                title={lang === "pt" ? plan.imageHint.pt : plan.imageHint.en}
              >
                {plan.imageSrc ? (
                  <Image
                    src={plan.imageSrc}
                    alt={lang === "pt" ? plan.imageHint.pt : plan.imageHint.en}
                    fill
                    sizes="(max-width: 700px) 100vw, 340px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <Icon name={PLAN_PLACEHOLDER_ICON[plan.id]} />
                )}
              </div>

              <p className="plan-card-tagline">{lang === "pt" ? plan.tagline.pt : plan.tagline.en}</p>
              <p className="plan-card-price">
                US$ {plan.priceUsd.toLocaleString("en-US")}
                <span>/{lang === "pt" ? "ano" : "year"}</span>
              </p>
              {plan.inheritsLabel && (
                <p className="plan-card-inherits">{lang === "pt" ? plan.inheritsLabel.pt : plan.inheritsLabel.en}</p>
              )}
              {(() => {
                const visible = plan.benefits.slice(0, VISIBLE_BENEFITS_COUNT);
                const hidden = plan.benefits.slice(VISIBLE_BENEFITS_COUNT);
                const isOpen = expanded[plan.id];
                return (
                  <div className="plan-card-benefits-wrap">
                    <ul className="plan-card-benefits">
                      {visible.map((b) => (
                        <li key={b.pt}>
                          <Icon name="check" /> {lang === "pt" ? b.pt : b.en}
                        </li>
                      ))}
                    </ul>
                    {hidden.length > 0 && (
                      <>
                        <div className={`plan-card-benefits-collapse${isOpen ? " is-open" : ""}`}>
                          <ul className="plan-card-benefits">
                            {hidden.map((b) => (
                              <li key={b.pt}>
                                <Icon name="check" /> {lang === "pt" ? b.pt : b.en}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          type="button"
                          className="plan-card-toggle"
                          onClick={() => setExpanded((prev) => ({ ...prev, [plan.id]: !prev[plan.id] }))}
                        >
                          {isOpen
                            ? (lang === "pt" ? "Ocultar benefícios ↑" : "Hide benefits ↑")
                            : (lang === "pt" ? "Ver todos os benefícios ↓" : "See all benefits ↓")}
                        </button>
                      </>
                    )}
                  </div>
                );
              })()}
              <button
                type="button"
                className="btn btn-primary plan-card-btn"
                disabled={loadingPlan !== null || !accepted}
                onClick={() => onChoose(plan.id)}
              >
                {loadingPlan === plan.id
                  ? lang === "pt" ? "Gerando pagamento…" : "Generating payment…"
                  : lang === "pt"
                    ? `Escolher ${plan.shortLabel.pt}`
                    : `Choose ${plan.shortLabel.en}`}
              </button>
            </div>
          ))}
        </div>

        <div className="plan-notice">
          <p className="plan-notice-title">{lang === "pt" ? MEMBERSHIP_PLANS_NOTICE.title.pt : MEMBERSHIP_PLANS_NOTICE.title.en}</p>
          {MEMBERSHIP_PLANS_NOTICE.paragraphs.map((p) => (
            <p className="plan-notice-text" key={p.pt}>{lang === "pt" ? p.pt : p.en}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
