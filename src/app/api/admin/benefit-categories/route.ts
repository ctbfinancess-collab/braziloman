import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  order: z.number().int().optional(),
});

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const categories = await prisma.benefitCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { partners: true } } },
  });
  return NextResponse.json({ categories });
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

  try {
    const category = await prisma.benefitCategory.create({
      data: { name: parsed.data.name, order: parsed.data.order ?? 0 },
    });
    return NextResponse.json({ ok: true, category });
  } catch {
    return NextResponse.json({ error: "Já existe uma categoria com esse nome." }, { status: 409 });
  }
}
