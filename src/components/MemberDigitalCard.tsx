"use client";

import { useState } from "react";
import { type LoyaltyTier } from "@/lib/loyalty";

// "?v=2" força o navegador a buscar a imagem nova em vez de usar uma cópia antiga
// já guardada em cache (o verso mudou de arte, mas manteve o mesmo nome de arquivo).
const CARD_ASSETS: Record<LoyaltyTier, { front: string; back: string }> = {
  GOLD: { front: "/loyalty/gold-front.jpg", back: "/loyalty/gold-back.jpg?v=2" },
  BLACK: { front: "/loyalty/black-front.jpg", back: "/loyalty/black-back.jpg?v=2" },
  PLATINUM: { front: "/loyalty/platinum-front.jpg", back: "/loyalty/platinum-back.jpg?v=2" },
};

// Cor do texto gravado e da "mancha" que cobre o número/ano de exemplo da arte
// original, amostradas diretamente de cada cartão. Gold e Platinum usam texto
// preto para imitar o relevo gravado do metal (como "MEMBER SINCE" na própria
// arte); Black mantém o dourado claro, legível sobre o fundo escuro.
const TEXT_COLOR: Record<LoyaltyTier, string> = {
  GOLD: "#1a1408",
  BLACK: "#e8dc8a",
  PLATINUM: "#1a1a1c",
};
const PATCH_COLOR: Record<LoyaltyTier, string> = {
  GOLD: "#b0914f",
  BLACK: "#0a0908",
  PLATINUM: "#5f5f60",
};

/**
 * Cartão digital do associado — usa as artes reais (Gold/Black/Platinum,
 * frente e verso) fornecidas pela Câmara. Ano e número de associado são
 * sobrepostos na frente (cobrindo o "2026"/"000123" de exemplo da arte);
 * o QR Code real é sobreposto no verso, no lugar do QR de exemplo.
 * Clicar no cartão vira entre frente e verso.
 */
export function MemberDigitalCard({
  tier,
  memberNumber,
  sinceYear,
  qrDataUrl,
}: {
  tier: LoyaltyTier;
  company: string;
  memberNumber: string;
  sinceYear: number | null;
  qrDataUrl?: string | null;
}) {
  const [showBack, setShowBack] = useState(false);
  const assets = CARD_ASSETS[tier];
  const textColor = TEXT_COLOR[tier];
  const patchColor = PATCH_COLOR[tier];

  return (
    <div>
      <button
        type="button"
        className={`loyalty-card tier-${tier.toLowerCase()}`}
        onClick={() => setShowBack((v) => !v)}
        aria-label={showBack ? "Ver frente do cartão" : "Ver verso do cartão"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="loyalty-card-img" src={showBack ? assets.back : assets.front} alt="" />

        {!showBack && (
          <>
            <span
              className="loyalty-card-patch loyalty-card-patch-year"
              style={{ backgroundColor: patchColor, ["--patch-glow" as string]: patchColor }}
              aria-hidden="true"
            />
            <span className="loyalty-card-value loyalty-card-value-year" style={{ color: textColor }}>
              {sinceYear ?? "—"}
            </span>
            <span
              className="loyalty-card-patch loyalty-card-patch-number"
              style={{ backgroundColor: patchColor, ["--patch-glow" as string]: patchColor }}
              aria-hidden="true"
            />
            <span className="loyalty-card-value loyalty-card-value-number" style={{ color: textColor }}>
              Nº {memberNumber}
            </span>
          </>
        )}

        {showBack && qrDataUrl && (
          <>
            <span className="loyalty-card-qr-patch" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="loyalty-card-qr" src={qrDataUrl} alt="QR Code de verificação do associado" />
          </>
        )}
      </button>
      <p className="loyalty-card-flip-hint">Toque no cartão para ver {showBack ? "a frente" : "o verso"}</p>
    </div>
  );
}
