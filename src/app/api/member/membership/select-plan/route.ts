import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { selectMembershipPlan } from "@/lib/paymentsServer";
import { MEMBERSHIP_PLANS } from "@/lib/membershipPlans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  planId: z.enum(MEMBERSHIP_PLANS.map((p) => p.id) as [string, ...string[]]),
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
  if (!parsed.success) return NextResponse.json({ error: "Plano inválido" }, { status: 422 });

  const result = await selectMembershipPlan(session.sub, parsed.data.planId as (typeof MEMBERSHIP_PLANS)[number]["id"]);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
