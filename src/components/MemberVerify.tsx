"use client";

import { useI18n } from "@/lib/i18n";
import { MemberDigitalCard } from "./MemberDigitalCard";
import type { LoyaltyTier } from "@/lib/loyalty";

export function VerifyMemberResult({
  company,
  tier,
  memberNumber,
  sinceYear,
}: {
  company: string;
  tier: LoyaltyTier;
  memberNumber: string;
  sinceYear: number | null;
}) {
  const { d } = useI18n();
  const t = d.memberArea.loyalty.verify;

  return (
    <section className="section">
      <div className="container reveal" style={{ maxWidth: 480, textAlign: "center" }}>
        <p className="section-eyebrow">{t.eyebrow}</p>
        <h1 className="section-title" style={{ marginBottom: 24 }}>{company}</h1>
        <MemberDigitalCard tier={tier} company={company} memberNumber={memberNumber} sinceYear={sinceYear} />
        {sinceYear && (
          <p className="section-lead" style={{ marginTop: 24 }}>
            {t.activeSince.replace("{year}", String(sinceYear))}
          </p>
        )}
      </div>
    </section>
  );
}

export function VerifyMemberNotFound() {
  const { d } = useI18n();
  const t = d.memberArea.loyalty.verify;

  return (
    <section className="section">
      <div className="container reveal" style={{ maxWidth: 480, textAlign: "center" }}>
        <p className="section-eyebrow">{t.eyebrow}</p>
        <h1 className="section-title">{t.notFoundTitle}</h1>
        <p className="section-lead">{t.notFoundLead}</p>
      </div>
    </section>
  );
}
