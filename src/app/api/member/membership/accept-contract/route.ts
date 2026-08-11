import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { recordContractAcceptance } from "@/lib/paymentsServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Chamado pela própria página do contrato (/contrato-associacao) quando o
 *  associado marca a caixinha e clica em "Aceitar e voltar" — registra o
 *  aceite ali mesmo, sem gerar Checkout Session (isso continua acontecendo
 *  só em /escolher-plano ou no botão "Pagar contribuição anual", que também
 *  re-validam acceptedTerms antes de cobrar). */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  await recordContractAcceptance(session.sub, ip);
  return NextResponse.json({ ok: true });
}
