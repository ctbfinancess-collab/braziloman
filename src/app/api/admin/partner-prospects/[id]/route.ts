import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";
import { PROSPECT_STATUSES } from "@/lib/benefits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  category: z.string().max(120).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  contactName: z.string().max(160).optional().nullable(),
  contactEmail: z.string().max(200).optional().nullable(),
  contactPhone: z.string().max(60).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  status: z.enum(PROSPECT_STATUSES).optional(),
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

  try {
    const prospect = await prisma.partnerProspect.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ ok: true, prospect });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;
  try {
    await prisma.partnerProspect.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}
