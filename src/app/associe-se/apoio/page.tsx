import type { Metadata } from "next";
import { MembershipNumberedSection } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Apoio",
  description: "Acesse oportunidades entre Brasil e Omã com o apoio da Câmara de Comércio.",
};

export default function ApoioPage() {
  return (
    <>
      <MembershipNumberedSection index={1} />
    </>
  );
}
