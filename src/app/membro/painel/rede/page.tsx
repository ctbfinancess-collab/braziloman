import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireActiveMember } from "@/lib/memberDashboard";
import { getTier } from "@/lib/loyalty";
import { DashboardNetwork } from "@/components/MemberDashboardPages";

export const metadata: Metadata = {
  title: "Rede de Associados",
  robots: { index: false, follow: false },
};

export default async function DashboardNetworkPage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);

  const rows = prisma
    ? await prisma.membershipApplication.findMany({
        where: { status: { in: ["ACTIVE", "APPROVED"] }, id: { not: member.id } },
        select: { company: true, sector: true, pointsTotal: true },
        orderBy: { company: "asc" },
      })
    : [];

  return (
    <DashboardNetwork
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
      members={rows}
    />
  );
}
