import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { getTier } from "@/lib/loyalty";
import { memberCanAccessBenefit, isBenefitRedemptionBlocked, type BenefitEligibility, type BenefitFrequency } from "@/lib/benefits";
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
      frequency: true,
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

  // "Usar benefício" (a ação que dispara e-mail com o cupom) respeita a
  // frequência configurada no benefício — nunca só no botão do front-end. A
  // checagem + criação roda dentro de UMA transação serializable: se dois
  // cliques (ou duas chamadas diretas na API) chegarem ao mesmo tempo, o
  // Postgres derruba um dos dois com erro de serialização — tratado abaixo
  // como "bloqueado", nunca como duplicidade. "view"/"coupon" continuam sem
  // limite, só alimentam estatística de acesso.
  if (parsed.data.action === "use") {
    let blockedAt: Date | null = null;
    try {
      await prisma.$transaction(
        async (tx) => {
          const lastUse = await tx.benefitRedemption.findFirst({
            where: { benefitId: parsed.data.benefitId, applicationId: session.sub, action: "use" },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          });
          if (isBenefitRedemptionBlocked(benefit.frequency as BenefitFrequency, lastUse?.createdAt ?? null)) {
            blockedAt = lastUse!.createdAt;
            return;
          }
          await tx.benefitRedemption.create({
            data: { benefitId: parsed.data.benefitId, applicationId: session.sub, action: "use" },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch {
      // Conflito de serialização (perdeu a corrida pro outro clique/chamada
      // simultânea) — trata como "já utilizado agora mesmo", sem 2º e-mail.
      blockedAt = new Date();
    }
    if (blockedAt) {
      // Benefício já utilizado (dentro da janela permitida) — não reenvia
      // e-mail, só informa quando foi o último resgate.
      return NextResponse.json({ ok: true, blocked: true, lastUsedAt: (blockedAt as Date).toISOString() });
    }
  } else {
    await prisma.benefitRedemption.create({
      data: { benefitId: parsed.data.benefitId, applicationId: session.sub, action: parsed.data.action },
    });
  }

  // "Usar benefício" é o momento em que o associado realmente se compromete a
  // aproveitar a oferta — manda o cupom/link por e-mail (comprovante) e avisa
  // a Câmara internamente. "view"/"coupon" não disparam e-mail, só "use". E só
  // dispara aqui, DEPOIS da checagem de frequência acima — nunca num resgate repetido.
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
    return NextResponse.json({ ok: true, blocked: false });
  }

  return NextResponse.json({ ok: true });
}
