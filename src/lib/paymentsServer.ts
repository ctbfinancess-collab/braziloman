import { stripe } from "./stripe";
import { prisma } from "./prisma";
import { SITE_URL } from "./email";
import { getMembershipPlan, type MembershipPlanId } from "./membershipPlans";
import { MEMBERSHIP_CONTRACT_VERSION } from "./membershipContract";

/**
 * Registra o aceite do Contrato de Associação (ver /contrato-associacao),
 * exigido antes de qualquer Checkout Session de anuidade — tanto no fluxo
 * "Escolha seu plano" quanto no botão "Pagar contribuição anual" (valor
 * negociado). `updateMany` com o `where` abaixo faz o registro ser
 * idempotente por versão: se o associado já aceitou a versão vigente do
 * contrato, a data original do aceite é preservada (não é sobrescrita a
 * cada nova tentativa de pagamento); se o contrato mudou de versão desde o
 * último aceite, um novo registro é gravado.
 */
export async function recordContractAcceptance(applicationId: string, ip: string | null): Promise<void> {
  if (!prisma) return;
  // `contractAcceptedVersion: { not: VERSION }` sozinho NÃO bate quando o
  // valor é NULL (semântica de NULL do SQL: `NULL <> 'x'` é desconhecido,
  // não verdadeiro) — por isso o OR explícito com `null` abaixo, senão o
  // primeiro aceite de todos nunca seria gravado.
  await prisma.membershipApplication.updateMany({
    where: {
      id: applicationId,
      OR: [{ contractAcceptedVersion: null }, { contractAcceptedVersion: { not: MEMBERSHIP_CONTRACT_VERSION } }],
    },
    data: { contractAcceptedAt: new Date(), contractAcceptedVersion: MEMBERSHIP_CONTRACT_VERSION, contractAcceptedIp: ip },
  });
}

/**
 * Cria (ou reaproveita) o Checkout Session da anuidade de um associado
 * aprovado, a partir do que já está gravado em `membershipCategory` /
 * `annualContribution`. Dois jeitos desses campos chegarem preenchidos:
 * 1) o admin define um valor negociado à mão ao aprovar (caso especial);
 * 2) o próprio associado escolhe um dos 3 planos fixos em /membro/escolher-plano
 *    (ver selectMembershipPlan abaixo, que preenche os campos e chama esta função).
 *
 * `annualContribution` é guardado em USD inteiros (não centavos) — é a moeda
 * de cobrança da Câmara. O Stripe sempre espera a menor unidade da moeda,
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
          currency: "usd",
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
 * Fluxo "Escolha seu plano": grava a categoria + preço do plano escolhido
 * (catálogo fixo em lib/membershipPlans.ts) na candidatura e, em seguida,
 * gera o Checkout Session — mesma função de cima, agora com os campos já
 * preenchidos.
 */
export async function selectMembershipPlan(
  applicationId: string,
  planId: MembershipPlanId
): Promise<{ url: string } | { error: string }> {
  if (!prisma) return { error: "Pagamento não configurado." };
  const plan = getMembershipPlan(planId);
  if (!plan) return { error: "Plano inválido." };

  const application = await prisma.membershipApplication.findUnique({
    where: { id: applicationId },
    select: { status: true },
  });
  if (!application) return { error: "Associado não encontrado." };
  if (application.status !== "APPROVED_PENDING_PAYMENT") {
    return { error: "Sua candidatura não está aguardando pagamento no momento." };
  }

  await prisma.membershipApplication.update({
    where: { id: applicationId },
    data: { membershipCategory: plan.name, annualContribution: plan.priceUsd },
  });

  const url = await createMembershipCheckoutSession(applicationId);
  if (!url) return { error: "Não foi possível gerar o link de pagamento." };
  return { url };
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
