import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";
import { BENEFIT_TYPES, ELIGIBILITY_OPTIONS } from "@/lib/benefits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  partnerId: z.string().min(1),
  title: z.string().min(1).max(200),
  type: z.enum(BENEFIT_TYPES),
  description: z.string().max(4000).optional().nullable(),
  rules: z.string().max(2000).optional().nullable(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  couponCode: z.string().max(120).optional().nullable(),
  redeemUrl: z.string().max(500).optional().nullable(),
  eligibility: z.enum(ELIGIBILITY_OPTIONS).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  order: z.number().int().optional(),
});

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const benefits = await prisma.benefit.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { partner: { include: { category: true } }, _count: { select: { redemptions: true } } },
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const redemptionsThisMonth = await prisma.benefitRedemption.count({
    where: { createdAt: { gte: monthStart }, action: { in: ["use", "coupon"] } },
  });

  return NextResponse.json({ benefits, redemptionsThisMonth });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const benefit = await prisma.benefit.create({
    data: {
      partnerId: parsed.data.partnerId,
      title: parsed.data.title,
      type: parsed.data.type,
      description: parsed.data.description || null,
      rules: parsed.data.rules || null,
      validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : null,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
      couponCode: parsed.data.couponCode || null,
      redeemUrl: parsed.data.redeemUrl || null,
      eligibility: parsed.data.eligibility ?? "ALL",
      featured: parsed.data.featured ?? false,
      status: parsed.data.status ?? "active",
      order: parsed.data.order ?? 0,
    },
    include: { partner: { include: { category: true } } },
  });

  return NextResponse.json({ ok: true, benefit });
}
