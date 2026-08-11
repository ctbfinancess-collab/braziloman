import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Contrato de Associação",
  description: "Termos e condições do vínculo associativo pago com a Câmara de Comércio Brasil–Omã.",
  robots: { index: false, follow: false },
};

export default function MembershipContractPage() {
  return <LegalPage docKey="membershipContract" />;
}
