import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/memberDashboard";
import { getTier } from "@/lib/loyalty";
import { DashboardSettings } from "@/components/MemberDashboardPages";

export const metadata: Metadata = {
  title: "Configurações",
  robots: { index: false, follow: false },
};

export default async function DashboardSettingsPage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);

  return (
    <DashboardSettings
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
    />
  );
}
