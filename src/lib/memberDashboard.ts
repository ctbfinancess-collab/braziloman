// Helper compartilhado pelas páginas do novo Painel do Associado
// (/membro/painel/inicio, /perfil, /certificado, /carteirinha, /rewards).
// Cada uma dessas páginas só existe para associados ACTIVE/APPROVED — candidaturas
// em outros status são tratadas em /membro/painel (CandidatePortal / MemberStatusScreen).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "./session";
import { awardBecomeMemberPoints } from "./loyaltyServer";

export const memberDashboardSelect = {
  id: true,
  name: true,
  email: true,
  company: true,
  role: true,
  sector: true,
  country: true,
  phone: true,
  status: true,
  createdAt: true,
  membershipCategory: true,
  annualContribution: true,
  memberNumber: true,
  memberSince: true,
  pointsTotal: true,
  documents: true,
  logoUrl: true,
  loyaltyTransactions: {
    orderBy: { createdAt: "desc" as const },
    take: 10,
    select: { id: true, actionId: true, points: true, note: true, createdAt: true, source: true },
  },
} as const;

/**
 * Autentica a sessão do associado e garante que o status é ACTIVE/APPROVED,
 * redirecionando para /membro/login (sem sessão) ou /membro/painel (status
 * ainda não ativo — essa rota decide a tela certa). Também faz o backfill
 * preguiçoso de memberNumber/pontos, igual ao /membro/painel original.
 */
export async function requireActiveMember() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) redirect("/membro/login");

  let application = prisma
    ? await prisma.membershipApplication.findUnique({ where: { id: session.sub }, select: memberDashboardSelect })
    : null;
  if (!application) redirect("/membro/login");
  if (application.status !== "ACTIVE" && application.status !== "APPROVED") redirect("/membro/painel");

  if (prisma && !application.memberNumber) {
    await awardBecomeMemberPoints(session.sub);
    application = await prisma.membershipApplication.findUnique({ where: { id: session.sub }, select: memberDashboardSelect });
    if (!application) redirect("/membro/login");
  }

  return {
    ...application,
    createdAt: application.createdAt.toISOString(),
    memberSince: application.memberSince ? application.memberSince.toISOString() : null,
    loyaltyTransactions: application.loyaltyTransactions.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
  };
}
