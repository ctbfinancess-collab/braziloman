import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isAdmin } from "@/lib/adminAuth";
import { env, hasEmail } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DIAGNÓSTICO TEMPORÁRIO — não faz parte do produto. Testa o envio de
 *  e-mail via Resend e devolve o erro de verdade (sem o try/catch silencioso
 *  usado no resto do site), pra investigar por que um e-mail não chegou.
 *  Também reenvia manualmente o cupom de um resgate específico. Remover
 *  depois de usar. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: { to?: string; benefitId?: string; applicationId?: string } = {};
  try {
    body = await req.json();
  } catch {
    // sem corpo, usa padrão abaixo
  }

  if (!hasEmail) {
    return NextResponse.json({ hasEmail: false, note: "RESEND_API_KEY não configurada no ambiente." });
  }
  const resend = new Resend(env.RESEND_API_KEY);

  // Modo "reenviar cupom de verdade" — reproduz exatamente o e-mail que a
  // rota de resgate manda, mas devolve o erro real do Resend em vez de
  // engolir silenciosamente.
  if (body.benefitId && body.applicationId) {
    if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
    const [application, benefit] = await Promise.all([
      prisma.membershipApplication.findUnique({ where: { id: body.applicationId }, select: { name: true, email: true } }),
      prisma.benefit.findUnique({
        where: { id: body.benefitId },
        select: { title: true, description: true, couponCode: true, redeemUrl: true, rules: true, validUntil: true, partner: { select: { name: true } } },
      }),
    ]);
    if (!application || !benefit) return NextResponse.json({ error: "Associado ou benefício não encontrado." }, { status: 404 });

    const result = await resend.emails.send({
      from: "Câmara de Comércio Brasil–Omã <contact@brasilomanchamber.org>",
      to: application.email,
      subject: `Seu cupom: ${benefit.title} — ${benefit.partner.name}`,
      html: `<p>Olá, ${application.name}! Cupom: <strong>${benefit.couponCode ?? "—"}</strong> (${benefit.title}, ${benefit.partner.name}).</p>`,
    });
    return NextResponse.json({ mode: "resend-coupon", to: application.email, result });
  }

  const to = body.to || "contact@brasilomanchamber.org";
  const result = await resend.emails.send({
    from: "Câmara de Comércio Brasil–Omã <contact@brasilomanchamber.org>",
    to,
    subject: "[Diagnóstico] Teste de envio",
    html: "<p>E-mail de teste do diagnóstico de envio.</p>",
  });

  return NextResponse.json({ hasEmail: true, to, result });
}
