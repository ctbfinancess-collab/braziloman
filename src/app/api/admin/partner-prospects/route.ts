import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";
import { PROSPECT_STATUSES } from "@/lib/benefits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  companyName: z.string().min(1).max(200),
  category: z.string().max(120).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  contactName: z.string().max(160).optional().nullable(),
  contactEmail: z.string().max(200).optional().nullable(),
  contactPhone: z.string().max(60).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  status: z.enum(PROSPECT_STATUSES).optional(),
});

/** Funil de captação — quadro de trabalho da equipe, ainda não é um parceiro
 *  real (ver BenefitPartner). */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const prospects = await prisma.partnerProspect.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ prospects });
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

  const prospect = await prisma.partnerProspect.create({
    data: {
      companyName: parsed.data.companyName,
      category: parsed.data.category || null,
      country: parsed.data.country || null,
      city: parsed.data.city || null,
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone || null,
      website: parsed.data.website || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status ?? "PROSPECTED",
    },
  });

  return NextResponse.json({ ok: true, prospect });
}
