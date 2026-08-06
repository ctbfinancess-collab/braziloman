import type { Metadata } from "next";
import { MembershipUnderstand } from "@/components/MembershipPage";
import { ACamaraTabs } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Entenda a Associação",
  description: "Entenda o que significa ser associado à Câmara de Comércio Brasil–Omã.",
};

export default function EntendaPage() {
  return (
    <>
      <ACamaraTabs active="understand" />
      <MembershipUnderstand />
    </>
  );
}
