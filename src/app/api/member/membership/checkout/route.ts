import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { createMembershipCheckoutSession, recordContractAcceptance } from "@/lib/paymentsServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Gera (ou regenera) o link de pagamento da anuidade do próprio associado —
 *  usado pelo botão "Pagar contribuição anual" no painel (caso do valor
 *  negociado à mão pelo admin), inclusive pro caso do link do e-mail já ter
 *  expirado (sessões do Stripe valem 24h). Exige a caixa de aceite do
 *  Contrato de Associação marcada, mesma regra do fluxo "Escolha seu plano". */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // corpo vazio é aceitável — tratado como acceptedTerms ausente abaixo
  }
  const acceptedTerms = Boolean(body && typeof body === "object" && "acceptedTerms" in body && (body as { acceptedTerms?: unknown }).acceptedTerms === true);
  if (!acceptedTerms) {
    return NextResponse.json({ error: "Você precisa aceitar o Contrato de Associação para continuar." }, { status: 422 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  await recordContractAcceptance(session.sub, ip);

  const url = await createMembershipCheckoutSession(session.sub);
  if (!url) {
    return NextResponse.json(
      { error: "Não foi possível gerar o link de pagamento. Fale com a Câmara." },
      { status: 400 }
    );
  }
  return NextResponse.json({ url });
}
