import type { Metadata } from "next";
import { Membership } from "@/components/Sections";
import { MembershipTabs, MembershipHero, MembershipClosing } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Associe-se",
  description:
    "Torne-se membro da Câmara e acesse uma rede exclusiva de negócios, inteligência de mercado e segurança jurídica entre o Brasil e Omã.",
};

export default function AssocieSePage() {
  return (
    <>
      <MembershipTabs active="home" />
      <Membership />
      <MembershipHero />
      <MembershipClosing />
    </>
  );
}
