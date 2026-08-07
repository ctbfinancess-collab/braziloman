import type { Metadata } from "next";
import QRCode from "qrcode";
import { requireActiveMember } from "@/lib/memberDashboard";
import { SITE_URL } from "@/lib/email";
import { getTier, getTierProgress, TIER_BENEFITS, TIER_NAMES, getActionLabel, getActionIcon } from "@/lib/loyalty";
import { DashboardHome } from "@/components/MemberDashboardPages";

export const metadata: Metadata = {
  title: "Painel do Associado",
  robots: { index: false, follow: false },
};

export default async function DashboardHomePage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);
  const progress = getTierProgress(member.pointsTotal);
  const benefits = TIER_BENEFITS[tier];

  const sinceYear = member.memberSince ? new Date(member.memberSince).getFullYear() : null;
  let validUntil: string | null = null;
  if (member.memberSince) {
    const d = new Date(member.memberSince);
    d.setFullYear(d.getFullYear() + 1);
    validUntil = d.toISOString();
  }

  const qrDataUrl = member.memberNumber
    ? await QRCode.toDataURL(`${SITE_URL}/membro/verificar/${member.memberNumber}`, { margin: 1, width: 200 })
    : null;

  const activity = member.loyaltyTransactions.map((tx) => ({
    id: tx.id,
    icon: getActionIcon(tx.actionId),
    labelPt: tx.actionId === "CUSTOM" && tx.note ? tx.note : getActionLabel(tx.actionId, "pt"),
    labelEn: tx.actionId === "CUSTOM" && tx.note ? tx.note : getActionLabel(tx.actionId, "en"),
    points: tx.points,
    createdAt: tx.createdAt,
  }));

  return (
    <DashboardHome
      member={{
        name: member.name,
        email: member.email,
        company: member.company,
        role: member.role,
        sector: member.sector,
        country: member.country,
        phone: member.phone,
        createdAt: member.createdAt,
      }}
      tier={tier}
      tierName={TIER_NAMES[tier]}
      memberNumber={member.memberNumber!}
      sinceYear={sinceYear}
      validUntil={validUntil}
      qrDataUrl={qrDataUrl}
      pointsTotal={member.pointsTotal}
      progress={progress}
      benefits={benefits}
      activity={activity}
    />
  );
}
