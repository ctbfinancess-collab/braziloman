import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { getTier } from "@/lib/loyalty";
import { memberCanAccessBenefit, type BenefitEligibility } from "@/lib/benefits";
import { sendBenefitCouponEmail, sendBenefitRedeemedAdminEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  benefitId: z.string().min(1),
  action: z.enum(["view", "use", "coupon"]),
});

/** Registra um clique em "Ver benefício"/"Usar benefício"/"Gerar cupom" — só
 *  associado ativo, e só se ele realmente tem elegibilidade pro benefício
 *  (checado de novo aqui, no servidor — nunca confia só no filtro da tela). */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const application = await prisma.membershipApplication.findUnique({
    where: { id: session.sub },
    select: { status: true, pointsTotal: true, name: true, email: true, company: true },
  });
  if (!application || !["ACTIVE", "APPROVED"].includes(application.status)) {
    return NextResponse.json({ error: "Associação inativa." }, { status: 403 });
  }

  const benefit = await prisma.benefit.findUnique({
    where: { id: parsed.data.benefitId },
    select: {
      status: true,
      eligibility: true,
      title: true,
      description: true,
      rules: true,
      couponCode: true,
      redeemUrl: true,
      validUntil: true,
      partner: { select: { name: true } },
    },
  });
  if (!benefit || benefit.status !== "active") {
    return NextResponse.json({ error: "Benefício não encontrado." }, { status: 404 });
  }
  const tier = getTier(application.pointsTotal);
  if (!memberCanAccessBenefit(tier, benefit.eligibility as BenefitEligibility)) {
    return NextResponse.json({ error: "Esse benefício não está disponível pro seu nível." }, { status: 403 });
  }

  await prisma.benefitRedemption.create({
    data: { benefitId: parsed.data.benefitId, applicationId: session.sub, action: parsed.data.action },
  });

  // "Usar benefício" é o momento em que o associado realmente se compromete a
  // aproveitar a oferta — manda o cupom/link por e-mail (comprovante) e avisa
  // a Câmara internamente. "view"/"coupon" não disparam e-mail, só "use".
  if (parsed.data.action === "use") {
    try {
      await Promise.all([
        sendBenefitCouponEmail(application.email, application.name, {
          partnerName: benefit.partner.name,
          benefitTitle: benefit.title,
          description: benefit.description,
          couponCode: benefit.couponCode,
          redeemUrl: benefit.redeemUrl,
          rules: benefit.rules,
          validUntil: benefit.validUntil,
        }),
        sendBenefitRedeemedAdminEmail({
          memberName: application.name,
          memberCompany: application.company,
          partnerName: benefit.partner.name,
          benefitTitle: benefit.title,
        }),
      ]);
    } catch {
      // e-mail é um "extra" aqui — nunca derruba a confirmação do resgate.
    }
  }

  return NextResponse.json({ ok: true });
}
