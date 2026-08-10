import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { createEventCheckoutSession } from "@/lib/paymentsServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Gera o link de pagamento (Stripe) de um evento/missão pago. A inscrição em
 *  si só é criada depois, pelo webhook, quando o pagamento é confirmado —
 *  ver /api/webhooks/stripe. Eventos gratuitos continuam usando
 *  /api/member/events/[id]/register normalmente. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id: eventId } = await params;
  const result = await createEventCheckoutSession(eventId, session.sub);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
