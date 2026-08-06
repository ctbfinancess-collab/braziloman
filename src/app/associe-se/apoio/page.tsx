import type { Metadata } from "next";
import { MembershipNumberedSection } from "@/components/MembershipPage";
import { ACamaraTabs } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Apoio",
  description: "Acesse oportunidades entre Brasil e Omã com o apoio da Câmara de Comércio.",
};

export default function ApoioPage() {
  return (
    <>
      <ACamaraTabs active="support" />
      <MembershipNumberedSection index={1} />
    </>
  );
}
