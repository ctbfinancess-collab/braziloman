import type { Metadata } from "next";
import { MembershipTabs, MembershipUnderstand } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Entenda a Associação",
  description: "Entenda o que significa ser associado à Câmara de Comércio Brasil–Omã.",
};

export default function EntendaPage() {
  return (
    <>
      <MembershipTabs active="understand" />
      <MembershipUnderstand />
    </>
  );
}
