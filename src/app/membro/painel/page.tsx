import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { MemberStatusScreen } from "@/components/MemberArea";
import { CandidatePortal } from "@/components/CandidatePortal";

export const metadata: Metadata = {
  title: "Painel do Associado",
  robots: { index: false, follow: false },
};

const EDITABLE_STATUSES = new Set(["INCOMPLETE", "AWAITING_DOCUMENTS", "INFO_REQUESTED"]);
const ACTIVE_STATUSES = new Set(["ACTIVE", "APPROVED"]);

const memberSelect = {
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
  loyaltyTransactions: {
    orderBy: { createdAt: "desc" as const },
    take: 10,
    select: { id: true, actionId: true, points: true, note: true, createdAt: true, source: true },
  },
} as const;

export default async function MemberPanelPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;

  if (!session) redirect("/membro/login");

  const application = prisma
    ? await prisma.membershipApplication.findUnique({ where: { id: session.sub }, select: memberSelect })
    : null;

  if (!application) redirect("/membro/login");

  if (EDITABLE_STATUSES.has(application.status)) {
    return <CandidatePortal />;
  }

  // Associados ativos têm um painel dedicado (menu lateral, cartão, rewards…).
  if (ACTIVE_STATUSES.has(application.status)) {
    redirect("/membro/painel/inicio");
  }

  const member = {
    ...application,
    createdAt: application.createdAt.toISOString(),
    memberSince: application.memberSince ? application.memberSince.toISOString() : null,
    loyaltyTransactions: application.loyaltyTransactions.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
  };

  return <MemberStatusScreen member={member} />;
}
