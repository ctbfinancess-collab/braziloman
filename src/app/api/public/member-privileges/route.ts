import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vitrine PÚBLICA do "Member Privileges" — sem autenticação, mas NUNCA expõe
 * o que é exclusivo da Área do Associado: sem cupom, sem link de resgate, sem
 * regras/condições, sem estatística de uso. Só o suficiente pra visitante ver
 * que existe o benefício e quem é o parceiro — os detalhes ficam trancados
 * atrás do login (ver /api/member/benefits e a própria Área do Associado).
 */
export async function GET() {
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const rows = await prisma.benefit.findMany({
    where: {
      status: "active",
      partner: { status: "active" },
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
    },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    include: { partner: { include: { category: true } } },
  });

  const benefits = rows.map((b) => ({
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

  return NextResponse.json({ benefits });
}
