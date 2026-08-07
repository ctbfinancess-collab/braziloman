"use client";

import { TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty";
import { Icon } from "./Icons";

/**
 * Cartão digital do associado — visual muda por nível (Gold/Black/Platinum),
 * ecoando os cartões físicos (mockup Gold/Black/Platinum). Usado tanto no painel
 * privado do associado (com QR Code) quanto na página pública de verificação
 * (sem QR — a própria página de verificação É o destino do QR).
 */
export function MemberDigitalCard({
  tier,
  company,
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
  return (
    <div className={`loyalty-card tier-${tier.toLowerCase()}`}>
      <span className="loyalty-card-seal" aria-hidden="true"><Icon name="seal" /></span>
      <p className="loyalty-card-brand">CÂMARA DE COMÉRCIO BRASIL–OMÃ</p>
      <p className="loyalty-card-tier">{TIER_NAMES[tier]} Member</p>
      <p className="loyalty-card-number">Nº {memberNumber}</p>
      {sinceYear && <p className="loyalty-card-since">Associado desde {sinceYear}</p>}
      {qrDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="loyalty-card-qr" src={qrDataUrl} alt="QR Code de verificação do associado" />
      )}
      <p className="loyalty-card-company">{company}</p>
    </div>
  );
}
