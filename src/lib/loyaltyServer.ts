// Programa de Fidelidade — funções server-only que gravam no banco.
// Nunca importar este arquivo de um componente de cliente.
import { prisma } from "./prisma";
import { LOYALTY_ACTIONS, type LoyaltyActionId } from "./loyalty";

const BECOME_MEMBER_ACTION = LOYALTY_ACTIONS.find((a) => a.id === "TORNAR_SE_ASSOCIADO")!;

/**
 * Concede os pontos de "Tornar-se associado" e atribui o número de associado —
 * idempotente: só age se `memberNumber` ainda for null. Chamar sempre que uma
 * candidatura chega (ou já está) em ACTIVE/APPROVED, tanto no fluxo de aprovação
 * quanto como "backfill" preguiçoso para associados que já eram ativos antes
 * desse programa existir.
 */
export async function awardBecomeMemberPoints(applicationId: string): Promise<void> {
  if (!prisma) return;
  await prisma.$transaction(async (tx) => {
    const app = await tx.membershipApplication.findUnique({
      where: { id: applicationId },
      select: { memberNumber: true },
    });
    if (!app || app.memberNumber) return;

    const now = new Date();
    const count = await tx.membershipApplication.count({ where: { memberNumber: { not: null } } });
    const memberNumber = `CTB-${now.getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    await tx.membershipApplication.update({
      where: { id: applicationId },
      data: {
        memberNumber,
        memberSince: now,
        pointsTotal: { increment: BECOME_MEMBER_ACTION.points },
        loyaltyTransactions: {
          create: { actionId: BECOME_MEMBER_ACTION.id, points: BECOME_MEMBER_ACTION.points, source: "system" },
        },
      },
    });
  });
}

/** Concede pontos manualmente (ação do catálogo ou lançamento avulso "CUSTOM"). */
export async function awardLoyaltyPoints(params: {
  applicationId: string;
  actionId: LoyaltyActionId | "CUSTOM";
  points: number;
  note?: string | null;
}): Promise<void> {
  if (!prisma) throw new Error("Banco de dados indisponível");
  await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        applicationId: params.applicationId,
        actionId: params.actionId,
        points: params.points,
        note: params.note ?? null,
        source: "admin",
      },
    }),
    prisma.membershipApplication.update({
      where: { id: params.applicationId },
      data: { pointsTotal: { increment: params.points } },
    }),
  ]);
}
