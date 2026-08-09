import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MemberPrivilegesPublic, type PublicBenefit } from "@/components/MemberPrivilegesPublic";

// Sem isso o Next tenta pré-renderizar em tempo de build (banco só é
// alcançável depois que o container sobe no Railway) — mesmo motivo do
// /parceiros, ver comentário lá.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Member Privileges",
  description:
    "Uma seleção exclusiva de benefícios, experiências e condições especiais oferecidas pelos parceiros da Câmara de Comércio Brasil–Omã aos seus associados.",
};

export default async function MemberPrivilegesPage() {
  const rows = prisma
    ? await prisma.benefit.findMany({
        where: {
          status: "active",
          partner: { status: "active" },
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        include: { partner: { include: { category: true } } },
      })
    : [];

  const benefits: PublicBenefit[] = rows.map((b) => ({
    id: b.id,
    title: b.title,
    type: b.type,
    eligibility: b.eligibility,
    featured: b.featured,
    createdAt: b.createdAt.toISOString(),
    partner: {
      id: b.partner.id,
      name: b.partner.name,
      logoUrl: b.partner.logoUrl,
      category: b.partner.category.name,
      country: b.partner.country,
      city: b.partner.city,
    },
  }));

  return <MemberPrivilegesPublic benefits={benefits} />;
}
