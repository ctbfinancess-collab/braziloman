import { stripe } from "./stripe";
import { prisma } from "./prisma";
import { SITE_URL } from "./email";

/**
 * Cria (ou reaproveita) o Checkout Session da anuidade de um associado
 * aprovado. Chamado automaticamente quando o admin marca a candidatura como
 * "Aprovado — aguardando pagamento", e também sob demanda pelo próprio
 * associado (botão "Pagar agora" no painel, caso o link do e-mail já tenha
 * expirado — sessões do Stripe valem 24h).
 *
 * `annualContribution` é guardado em REAIS inteiros (não centavos) — ver
 * comentário no schema. O Stripe sempre espera a menor unidade da moeda,
 * por isso o × 100 aqui.
 */
export async function createMembershipCheckoutSession(applicationId: string): Promise<string | null> {
  if (!stripe || !prisma) return null;

  const application = await prisma.membershipApplication.findUnique({
    where: { id: applicationId },
    select: { email: true, name: true, membershipCategory: true, annualContribution: true, status: true },
  });
  if (!application || !application.annualContribution || application.annualContribution <= 0) return null;
  // Só faz sentido cobrar quem está mesmo esperando pagamento — evita gerar
  // link de cobrança pra alguém já ativo ou ainda em análise.
  if (application.status !== "APPROVED_PENDING_PAYMENT") return null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: application.email,
    line_items: [
      {
        price_data: {
          currency: "brl",
          unit_amount: Math.round(application.annualContribution * 100),
          product_data: {
            name: `Anuidade de associado — ${application.membershipCategory || "Câmara de Comércio Brasil–Omã"}`,
            description: "Contribuição anual — Câmara de Comércio Brasil–Omã",
          },
        },
        quantity: 1,
      },
    ],
    metadata: { kind: "membership", applicationId },
    success_url: `${SITE_URL}/membro/painel?pagamento=sucesso`,
    cancel_url: `${SITE_URL}/membro/painel?pagamento=cancelado`,
  });

  await prisma.membershipApplication.update({
    where: { id: applicationId },
    data: { stripeCheckoutSessionId: session.id },
  });

  return session.url;
}

/**
 * Cria o Checkout Session de uma inscrição paga em evento/missão. A linha de
 * EventRegistration em si só nasce depois, no webhook, quando o pagamento é
 * confirmado de verdade — nunca fica um registro "pendente" solto no banco.
 */
export async function createEventCheckoutSession(
  eventId: string,
  applicationId: string
): Promise<{ url: string } | { error: string }> {
  if (!stripe || !prisma) return { error: "Pagamento não configurado." };

  const [event, application, existing] = await Promise.all([
    prisma.chamberEvent.findUnique({ where: { id: eventId } }),
    prisma.membershipApplication.findUnique({ where: { id: applicationId }, select: { email: true, name: true } }),
    prisma.eventRegistration.findUnique({ where: { eventId_applicationId: { eventId, applicationId } } }),
  ]);
  if (!event) return { error: "Evento não encontrado." };
  if (!application) return { error: "Associado não encontrado." };
  if (existing && existing.status === "CONFIRMED") return { error: "Você já está inscrito neste evento." };
  if (!event.priceCents || event.priceCents <= 0) return { error: "Este evento é gratuito — use a inscrição normal." };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: application.email,
    line_items: [
      {
        price_data: {
          currency: event.currency.toLowerCase(),
          unit_amount: event.priceCents,
          product_data: {
            name: event.title,
            description: `Inscrição — ${event.kind === "MISSAO" ? "Missão Empresarial" : "Evento"} da Câmara de Comércio Brasil–Omã`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { kind: "event", eventId, applicationId },
    success_url: `${SITE_URL}/membro/painel/eventos?pagamento=sucesso`,
    cancel_url: `${SITE_URL}/membro/painel/eventos?pagamento=cancelado`,
  });

  if (!session.url) return { error: "Não foi possível gerar o link de pagamento." };
  return { url: session.url };
}
