import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { MemberPanel, MemberStatusScreen } from "@/components/MemberArea";
import { CandidatePortal } from "@/components/CandidatePortal";

export const metadata: Metadata = {
  title: "Painel do Associado",
  robots: { index: false, follow: false },
};

const EDITABLE_STATUSES = new Set(["INCOMPLETE", "AWAITING_DOCUMENTS", "INFO_REQUESTED"]);
const ACTIVE_STATUSES = new Set(["ACTIVE", "APPROVED"]);

export default async function MemberPanelPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;

  if (!session) redirect("/membro/login");

  const application = prisma
    ? await prisma.membershipApplication.findUnique({
        where: { id: session.sub },
        select: {
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
        },
      })
    : null;

  if (!application) redirect("/membro/login");

  if (EDITABLE_STATUSES.has(application.status)) {
    return <CandidatePortal />;
  }

  const member = {
    ...application,
    createdAt: application.createdAt.toISOString(),
  };

  if (ACTIVE_STATUSES.has(application.status)) {
    return <MemberPanel member={member} />;
  }

  return <MemberStatusScreen member={member} />;
}
