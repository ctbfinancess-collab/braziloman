import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireActiveMember } from "@/lib/memberDashboard";
import { getTier } from "@/lib/loyalty";
import { DashboardMissions } from "@/components/MemberDashboardPages";

export const metadata: Metadata = {
  title: "Missões",
  robots: { index: false, follow: false },
};

export default async function DashboardMissionsPage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);

  const rows = prisma
    ? await prisma.chamberEvent.findMany({
        where: { kind: "MISSAO" },
        orderBy: { date: "asc" },
        include: { registrations: { where: { applicationId: member.id, status: "CONFIRMED" } } },
      })
    : [];
  const missions = rows.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date.toISOString(),
    location: e.location,
    imageUrl: e.imageUrl,
    priceCents: e.priceCents,
    currency: e.currency,
    registered: e.registrations.length > 0,
  }));

  return (
    <DashboardMissions
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
      missions={missions}
    />
  );
}
