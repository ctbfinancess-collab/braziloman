import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireMember() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  return session?.sub ?? null;
}

/** Associado se inscreve em um evento/missão ("Inscrever-me"). Idempotente: se já
 *  existe uma inscrição cancelada, reativa; se já está confirmada, não faz nada. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const applicationId = await requireMember();
  if (!applicationId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id: eventId } = await params;
  const event = await prisma.chamberEvent.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  // Evento pago não passa por aqui — usa /checkout, que só cria a inscrição
  // depois que o Stripe confirma o pagamento (ver /api/webhooks/stripe).
  // Checagem no servidor mesmo que a tela já esconda o botão certo, pra
  // nunca dar pra "furar" a cobrança chamando a API direto.
  if (event.priceCents && event.priceCents > 0) {
    return NextResponse.json({ error: "Este evento é pago — use o link de pagamento." }, { status: 400 });
  }

  const registration = await prisma.eventRegistration.upsert({
    where: { eventId_applicationId: { eventId, applicationId } },
    update: { status: "CONFIRMED" },
    create: { eventId, applicationId, status: "CONFIRMED" },
  });

  return NextResponse.json({ ok: true, registration });
}

/** Associado cancela a própria inscrição — só permitido enquanto o evento/missão
 *  ainda não aconteceu. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const applicationId = await requireMember();
  if (!applicationId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id: eventId } = await params;
  const event = await prisma.chamberEvent.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  if (event.date.getTime() < Date.now()) {
    return NextResponse.json({ error: "Não é possível cancelar um compromisso que já aconteceu." }, { status: 400 });
  }

  await prisma.eventRegistration.updateMany({
    where: { eventId, applicationId },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}
