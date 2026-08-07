import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/memberDashboard";
import { getTier, getTierProgress, TIER_BENEFITS, TIER_NAMES, getActionLabel, getActionIcon } from "@/lib/loyalty";
import { DashboardRewards } from "@/components/MemberDashboardPages";

export const metadata: Metadata = {
  title: "Rewards",
  robots: { index: false, follow: false },
};

export default async function DashboardRewardsPage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);
  const progress = getTierProgress(member.pointsTotal);
  const benefits = TIER_BENEFITS[tier];

  const activity = member.loyaltyTransactions.map((tx) => ({
    id: tx.id,
    icon: getActionIcon(tx.actionId),
    labelPt: tx.actionId === "CUSTOM" && tx.note ? tx.note : getActionLabel(tx.actionId, "pt"),
    labelEn: tx.actionId === "CUSTOM" && tx.note ? tx.note : getActionLabel(tx.actionId, "en"),
    points: tx.points,
    createdAt: tx.createdAt,
  }));

  return (
    <DashboardRewards
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
      sinceYear={null}
      validUntil={null}
      qrDataUrl={null}
      pointsTotal={member.pointsTotal}
      progress={progress}
      benefits={benefits}
      activity={activity}
    />
  );
}
