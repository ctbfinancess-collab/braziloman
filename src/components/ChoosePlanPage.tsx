"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";
import { MEMBERSHIP_PLANS, type MembershipPlanId } from "@/lib/membershipPlans";

/** Página "Escolha seu plano" — passo entre a aprovação da candidatura e o
 *  pagamento. Catálogo fixo (lib/membershipPlans.ts): três categorias com
 *  preço em USD, sem nenhuma relação com o Programa de Fidelidade
 *  (Gold/Black/Platinum são só de pontos, ver lib/loyalty.ts). */
export function ChoosePlanPage({ name, initialAccepted }: { name: string; initialAccepted: boolean }) {
  const { lang } = useI18n();
  const [loadingPlan, setLoadingPlan] = useState<MembershipPlanId | null>(null);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(initialAccepted);

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
        <p className="section-eyebrow center">{lang === "pt" ? "Concluir associação" : "Complete your membership"}</p>
        <h1 className="section-title center">{lang === "pt" ? "Escolha seu plano" : "Choose your plan"}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead center" style={{ maxWidth: 620, margin: "0 auto 40px" }}>
          {lang === "pt"
            ? `Parabéns, ${name}! Sua candidatura foi aprovada. Escolha abaixo o plano de associação e finalize com o pagamento — processado com segurança pelo Stripe.`
            : `Congratulations, ${name}! Your application was approved. Choose your membership plan below and finish with payment — securely processed by Stripe.`}
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
              <p className="plan-card-tagline">{lang === "pt" ? plan.tagline.pt : plan.tagline.en}</p>
              <p className="plan-card-price">
                US$ {plan.priceUsd.toLocaleString("en-US")}
                <span>/{lang === "pt" ? "ano" : "year"}</span>
              </p>
              <ul className="plan-card-benefits">
                {plan.benefits.map((b) => (
                  <li key={b.pt}>
                    <Icon name="check" /> {lang === "pt" ? b.pt : b.en}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-primary plan-card-btn"
                disabled={loadingPlan !== null || !accepted}
                onClick={() => onChoose(plan.id)}
              >
                {loadingPlan === plan.id
                  ? lang === "pt" ? "Gerando pagamento…" : "Generating payment…"
                  : lang === "pt" ? "Continuar para pagamento" : "Continue to payment"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
