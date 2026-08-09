import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
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
    const category = await prisma.benefitCategory.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ ok: true, category });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}

/** Só apaga se não houver nenhum parceiro usando a categoria — evita deixar
 *  parceiros "órfãos" sem categoria. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;
  const inUse = await prisma.benefitPartner.count({ where: { categoryId: id } });
  if (inUse > 0) {
    return NextResponse.json(
      { error: `Categoria em uso por ${inUse} parceiro(s) — mude a categoria deles antes de excluir.` },
      { status: 409 }
    );
  }

  try {
    await prisma.benefitCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}
