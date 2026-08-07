import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireActiveMember } from "@/lib/memberDashboard";
import { getTier } from "@/lib/loyalty";
import { DashboardEvents } from "@/components/MemberDashboardPages";

export const metadata: Metadata = {
  title: "Eventos",
  robots: { index: false, follow: false },
};

export default async function DashboardEventsPage() {
  const member = await requireActiveMember();
  const tier = getTier(member.pointsTotal);

  const rows = prisma
    ? await prisma.chamberEvent.findMany({
        where: { kind: "EVENTO" },
        orderBy: { date: "asc" },
        include: { registrations: { where: { applicationId: member.id, status: "CONFIRMED" } } },
      })
    : [];
  const events = rows.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date.toISOString(),
    location: e.location,
    imageUrl: e.imageUrl,
    priceCents: e.priceCents,
    registered: e.registrations.length > 0,
  }));

  return (
    <DashboardEvents
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
      events={events}
    />
  );
}
