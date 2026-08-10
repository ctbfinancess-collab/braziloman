import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isFullAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  logoUrl: z.string().max(500).optional().nullable(),
  sector: z.string().max(120).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  order: z.number().int().optional(),
});

/** Lista todos os parceiros (admin) — mesma ordem exibida na página pública. */
export async function GET() {
  if (!(await isFullAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const partners = await prisma.partner.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return NextResponse.json({ partners });
}

export async function POST(req: Request) {
  if (!(await isFullAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const partner = await prisma.partner.create({
    data: {
      name: parsed.data.name,
      logoUrl: parsed.data.logoUrl || null,
      sector: parsed.data.sector || null,
      website: parsed.data.website || null,
      order: parsed.data.order ?? 0,
    },
  });

  return NextResponse.json({ ok: true, partner });
}
