import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendWelcomeEmail } from "@/lib/email";
import { awardBecomeMemberPoints } from "@/lib/loyaltyServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Confirmação de pagamento vinda direto do Stripe — é o que deixa a
 *  cobrança "automática de verdade": ninguém no time precisa checar nada,
 *  o próprio Stripe avisa quando o dinheiro cai. Autenticado pela assinatura
 *  do webhook (STRIPE_WEBHOOK_SECRET), nunca por cookie de sessão. */
export async function POST(req: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET || !prisma) {
    return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  if (!signature) return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe webhook] assinatura inválida:", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const kind = session.metadata?.kind;

    // Anuidade de associado -> vira ativo automaticamente.
    if (kind === "membership") {
      const applicationId = session.metadata?.applicationId;
      if (applicationId) {
        const application = await prisma.membershipApplication.findUnique({
          where: { id: applicationId },
          select: { status: true, name: true, email: true, memberNumber: true },
        });
        // Idempotente: se já está ACTIVE (webhook duplicado/reenviado pelo
        // Stripe), não faz nada de novo.
        if (application && application.status !== "ACTIVE") {
          await prisma.membershipApplication.update({
            where: { id: applicationId },
            data: { status: "ACTIVE", paidAt: new Date(), stripeCheckoutSessionId: session.id },
          });
          if (!application.memberNumber) {
            try {
              await awardBecomeMemberPoints(applicationId);
            } catch (err) {
              console.error("[stripe webhook] erro ao conceder pontos de boas-vindas:", err);
            }
          }
          try {
            await sendWelcomeEmail(application.email, application.name);
          } catch (err) {
            console.error("[stripe webhook] erro ao enviar e-mail de boas-vindas:", err);
          }
        }
      }
    }

    // Inscrição paga em evento/missão -> cria a inscrição confirmada.
    if (kind === "event") {
      const eventId = session.metadata?.eventId;
      const applicationId = session.metadata?.applicationId;
      if (eventId && applicationId) {
        try {
          await prisma.eventRegistration.create({
            data: { eventId, applicationId, status: "CONFIRMED", stripeCheckoutSessionId: session.id },
          });
        } catch {
          // Já existe (webhook duplicado/reenviado) — idempotente, ignora.
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
