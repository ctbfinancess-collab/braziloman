import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { SITE_URL } from "@/lib/email";
import { awardBecomeMemberPoints } from "@/lib/loyaltyServer";
import { MemberPanel, MemberStatusScreen } from "@/components/MemberArea";
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

  let application = prisma
    ? await prisma.membershipApplication.findUnique({ where: { id: session.sub }, select: memberSelect })
    : null;

  if (!application) redirect("/membro/login");

  if (EDITABLE_STATUSES.has(application.status)) {
    return <CandidatePortal />;
  }

  const isActiveMember = ACTIVE_STATUSES.has(application.status);

  // Backfill preguiçoso: associados que já eram ativos antes do Programa de
  // Fidelidade existir ainda não têm memberNumber/pontos — concede na primeira
  // vez que essa pessoa abre o próprio painel.
  if (isActiveMember && prisma && !application.memberNumber) {
    await awardBecomeMemberPoints(session.sub);
    application = await prisma.membershipApplication.findUnique({ where: { id: session.sub }, select: memberSelect });
    if (!application) redirect("/membro/login");
  }

  const member = {
    ...application,
    createdAt: application.createdAt.toISOString(),
    memberSince: application.memberSince ? application.memberSince.toISOString() : null,
    loyaltyTransactions: application.loyaltyTransactions.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
  };

  if (isActiveMember) {
    const qrDataUrl = member.memberNumber
      ? await QRCode.toDataURL(`${SITE_URL}/membro/verificar/${member.memberNumber}`, { margin: 1, width: 240 })
      : null;
    return <MemberPanel member={member} qrDataUrl={qrDataUrl} />;
  }

  return <MemberStatusScreen member={member} />;
}
