import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  logoUrl: z.string().max(500).optional().nullable(),
  categoryId: z.string().min(1),
  country: z.string().min(1).max(120),
  city: z.string().max(120).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  instagram: z.string().max(300).optional().nullable(),
  whatsapp: z.string().max(60).optional().nullable(),
  contactEmail: z.string().max(200).optional().nullable(),
  shortDescription: z.string().max(300).optional().nullable(),
  fullDescription: z.string().max(4000).optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
  order: z.number().int().optional(),
});

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const partners = await prisma.benefitPartner.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { category: true, _count: { select: { benefits: true } } },
  });
  return NextResponse.json({ partners });
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

  const partner = await prisma.benefitPartner.create({
    data: {
      name: parsed.data.name,
      logoUrl: parsed.data.logoUrl || null,
      categoryId: parsed.data.categoryId,
      country: parsed.data.country,
      city: parsed.data.city || null,
      website: parsed.data.website || null,
      instagram: parsed.data.instagram || null,
      whatsapp: parsed.data.whatsapp || null,
      contactEmail: parsed.data.contactEmail || null,
      shortDescription: parsed.data.shortDescription || null,
      fullDescription: parsed.data.fullDescription || null,
      status: parsed.data.status ?? "active",
      order: parsed.data.order ?? 0,
    },
    include: { category: true },
  });

  return NextResponse.json({ ok: true, partner });
}
