import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/memberDashboard";
import { getTier } from "@/lib/loyalty";
import { DashboardProfile } from "@/components/MemberDashboardPages";

export const metadata: Metadata = {
  title: "Meu Perfil",
  robots: { index: false, follow: false },
};

export default async function DashboardProfilePage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);

  return (
    <DashboardProfile
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
      logoUrl={member.logoUrl}
    />
  );
}
