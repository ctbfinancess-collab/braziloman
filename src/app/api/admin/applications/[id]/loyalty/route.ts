import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isFullAdmin } from "@/lib/adminAuth";
import { getActionById, LOYALTY_CUSTOM_ACTION_ID, type LoyaltyActionId } from "@/lib/loyalty";
import { awardLoyaltyPoints } from "@/lib/loyaltyServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const awardSchema = z.object({
  actionId: z.string().min(1),
  points: z.number().int().min(-10_000).max(10_000).optional(),
  note: z.string().max(500).optional().nullable(),
});

/** Admin concede pontos manualmente a um associado (ação do catálogo ou avulsa). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isFullAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = awardSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const app = await prisma.membershipApplication.findUnique({ where: { id }, select: { status: true } });
  if (!app) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  if (app.status !== "ACTIVE" && app.status !== "APPROVED") {
    return NextResponse.json({ error: "Associado não está ativo" }, { status: 400 });
  }

  let points: number;
  if (parsed.data.actionId === LOYALTY_CUSTOM_ACTION_ID) {
    if (!parsed.data.points || !parsed.data.note?.trim()) {
      return NextResponse.json({ error: "Ação personalizada requer pontos e observação" }, { status: 422 });
    }
    points = parsed.data.points;
  } else {
    const action = getActionById(parsed.data.actionId);
    // "TORNAR_SE_ASSOCIADO" é automática — nunca lançada manualmente por aqui.
    if (!action || action.automatic) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
    points = action.points; // servidor é autoritativo — nunca confia em pontos vindos do cliente para ações do catálogo
  }

  // Já validado acima: ou é "CUSTOM", ou é um id de ação existente e não-automática do catálogo.
  const actionId = parsed.data.actionId as LoyaltyActionId | "CUSTOM";
  await awardLoyaltyPoints({ applicationId: id, actionId, points, note: parsed.data.note ?? null });
  return NextResponse.json({ ok: true });
}
