import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";
import { BENEFIT_TYPES, ELIGIBILITY_OPTIONS } from "@/lib/benefits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  partnerId: z.string().min(1).optional(),
  title: z.string().min(1).max(200).optional(),
  type: z.enum(BENEFIT_TYPES).optional(),
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const { validFrom, validUntil, ...rest } = parsed.data;
  try {
    const benefit = await prisma.benefit.update({
      where: { id },
      data: {
        ...rest,
        ...(validFrom !== undefined ? { validFrom: validFrom ? new Date(validFrom) : null } : {}),
        ...(validUntil !== undefined ? { validUntil: validUntil ? new Date(validUntil) : null } : {}),
      },
      include: { partner: { include: { category: true } } },
    });
    return NextResponse.json({ ok: true, benefit });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;
  try {
    await prisma.benefit.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}
