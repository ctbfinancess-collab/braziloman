import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isAdmin } from "@/lib/adminAuth";
import { env, hasEmail } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DIAGNÓSTICO TEMPORÁRIO — não faz parte do produto. Testa o envio de
 *  e-mail via Resend e devolve o erro de verdade (sem o try/catch silencioso
 *  usado no resto do site), pra investigar por que um e-mail não chegou.
 *  Remover depois de usar. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: { to?: string } = {};
  try {
    body = await req.json();
  } catch {
    // sem corpo, usa padrão abaixo
  }
  const to = body.to || "contact@brasilomanchamber.org";

  if (!hasEmail) {
    return NextResponse.json({ hasEmail: false, note: "RESEND_API_KEY não configurada no ambiente." });
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: "Câmara de Comércio Brasil–Omã <contact@brasilomanchamber.org>",
    to,
    subject: "[Diagnóstico] Teste de envio",
    html: "<p>E-mail de teste do diagnóstico de envio.</p>",
  });

  return NextResponse.json({ hasEmail: true, to, result });
}
