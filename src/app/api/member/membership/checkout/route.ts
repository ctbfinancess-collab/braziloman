import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { createMembershipCheckoutSession } from "@/lib/paymentsServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Gera (ou regenera) o link de pagamento da anuidade do próprio associado —
 *  usado pelo botão "Pagar agora" no painel, pro caso do link do e-mail já
 *  ter expirado (sessões do Stripe valem 24h). */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const url = await createMembershipCheckoutSession(session.sub);
  if (!url) {
    return NextResponse.json(
      { error: "Não foi possível gerar o link de pagamento. Fale com a Câmara." },
      { status: 400 }
    );
  }
  return NextResponse.json({ url });
}
