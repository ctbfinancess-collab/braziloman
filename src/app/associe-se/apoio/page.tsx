import type { Metadata } from "next";
import { MembershipTabs, MembershipNumberedSection } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Apoio",
  description: "Acesse oportunidades entre Brasil e Omã com o apoio da Câmara de Comércio.",
};

export default function ApoioPage() {
  return (
    <>
      <MembershipTabs active="support" />
      <MembershipNumberedSection index={1} />
    </>
  );
}
