import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getTier } from "@/lib/loyalty";
import { VerifyMemberResult, VerifyMemberNotFound } from "@/components/MemberVerify";

export const metadata: Metadata = {
  title: "Verificação de Associado",
  robots: { index: false, follow: false },
};

/**
 * Página pública (sem autenticação) para onde aponta o QR Code do cartão digital.
 * Mostra só o mínimo necessário para confirmar que o associado é legítimo —
 * empresa, nível e desde quando é associado. Nunca nome pessoal, e-mail ou
 * telefone (o select abaixo nem sequer os busca no banco).
 */
export default async function VerifyMemberPage({ params }: { params: Promise<{ memberNumber: string }> }) {
  const { memberNumber } = await params;

  const application = prisma
    ? await prisma.membershipApplication.findUnique({
        where: { memberNumber },
        select: { company: true, status: true, memberSince: true, pointsTotal: true },
      })
    : null;

  const isValid = application && (application.status === "ACTIVE" || application.status === "APPROVED");
  if (!application || !isValid) {
    return <VerifyMemberNotFound />;
  }

  return (
    <VerifyMemberResult
      company={application.company}
      tier={getTier(application.pointsTotal)}
      memberNumber={memberNumber}
      sinceYear={application.memberSince ? new Date(application.memberSince).getFullYear() : null}
    />
  );
}
