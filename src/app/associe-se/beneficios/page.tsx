import type { Metadata } from "next";
import { MembershipOverview } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Benefícios de ser associado",
  description: "Conheça os principais benefícios de ser associado à Câmara de Comércio Brasil–Omã.",
};

export default function BeneficiosPage() {
  return (
    <>
      <MembershipOverview />
    </>
  );
}
