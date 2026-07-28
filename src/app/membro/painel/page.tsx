import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { MemberPanel } from "@/components/MemberArea";

export const metadata: Metadata = {
  title: "Painel do Associado",
  robots: { index: false, follow: false },
};

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
        },
      })
    : null;

  if (!application) redirect("/membro/login");

  return (
    <MemberPanel
      member={{
        ...application,
        createdAt: application.createdAt.toISOString(),
      }}
    />
  );
}
