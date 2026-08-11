import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { MEMBERSHIP_CONTRACT_VERSION } from "@/lib/membershipContract";
import { MembershipContractPage } from "@/components/MembershipContractPage";

export const metadata: Metadata = {
  title: "Contrato de Associação",
  description: "Termos e condições do vínculo associativo pago com a Câmara de Comércio Brasil–Omã.",
  robots: { index: false, follow: false },
};

export default async function ContratoAssociacaoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;

  // Só mostra a caixinha de aceite pra quem está de fato aguardando
  // pagamento — visitantes comuns (ex: link no rodapé, se um dia existir)
  // ou associados já ativos só veem o texto, sem nada pra aceitar aqui.
  let showAcceptance = false;
  let alreadyAccepted = false;
  if (session && prisma) {
    const application = await prisma.membershipApplication.findUnique({
      where: { id: session.sub },
      select: { status: true, contractAcceptedVersion: true },
    });
    if (application && application.status === "APPROVED_PENDING_PAYMENT") {
      showAcceptance = true;
      alreadyAccepted = application.contractAcceptedVersion === MEMBERSHIP_CONTRACT_VERSION;
    }
  }

  return <MembershipContractPage showAcceptance={showAcceptance} initialAccepted={alreadyAccepted} />;
}
