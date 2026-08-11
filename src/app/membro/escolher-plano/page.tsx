import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { MEMBERSHIP_CONTRACT_VERSION } from "@/lib/membershipContract";
import { ChoosePlanPage } from "@/components/ChoosePlanPage";

export const metadata: Metadata = {
  title: "Escolha seu plano",
  robots: { index: false, follow: false },
};

export default async function EscolherPlanoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) redirect("/membro/login");

  const application = prisma
    ? await prisma.membershipApplication.findUnique({
        where: { id: session.sub },
        select: { name: true, status: true, membershipCategory: true, annualContribution: true, contractAcceptedVersion: true },
      })
    : null;
  if (!application) redirect("/membro/login");

  // Já ativo — não faz sentido escolher plano de novo.
  if (application.status === "ACTIVE" || application.status === "APPROVED") {
    redirect("/membro/painel/inicio");
  }
  // Ainda não chegou nessa etapa (ou já tem valor negociado à mão pelo admin,
  // que usa o botão "Pagar contribuição anual" direto) — manda pra tela de
  // status, que explica a situação certa.
  if (application.status !== "APPROVED_PENDING_PAYMENT" || application.annualContribution) {
    redirect("/membro/painel");
  }

  const initialAccepted = application.contractAcceptedVersion === MEMBERSHIP_CONTRACT_VERSION;
  return <ChoosePlanPage name={application.name} initialAccepted={initialAccepted} />;
}
