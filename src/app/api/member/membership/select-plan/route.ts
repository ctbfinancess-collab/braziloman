import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { selectMembershipPlan, recordContractAcceptance } from "@/lib/paymentsServer";
import { MEMBERSHIP_PLANS } from "@/lib/membershipPlans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  planId: z.enum(MEMBERSHIP_PLANS.map((p) => p.id) as [string, ...string[]]),
  // Exigido pela tela "Escolha seu plano": caixa de aceite do Contrato de
  // Associação (ver /contrato-associacao), obrigatória antes de gerar
  // qualquer cobrança — literal(true) recusa `false`/ausente de propósito.
  acceptedTerms: z.literal(true),
});

/** Página "Escolha seu plano" chama isto ao clicar em "Continuar para
 *  pagamento" — grava a categoria/preço escolhidos e devolve o link do
 *  Stripe Checkout pra redirecionar. */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const acceptedTermsFailed = parsed.error.issues.some((i) => i.path[0] === "acceptedTerms");
    return NextResponse.json(
      { error: acceptedTermsFailed ? "Você precisa aceitar o Contrato de Associação para continuar." : "Plano inválido" },
      { status: 422 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  await recordContractAcceptance(session.sub, ip);

  const result = await selectMembershipPlan(session.sub, parsed.data.planId as (typeof MEMBERSHIP_PLANS)[number]["id"]);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
