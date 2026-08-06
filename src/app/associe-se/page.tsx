import type { Metadata } from "next";
import { Membership } from "@/components/Sections";
import { MembershipHero, MembershipClosing } from "@/components/MembershipPage";
import { ACamaraTabs } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Associe-se",
  description:
    "Torne-se membro da Câmara e acesse uma rede exclusiva de negócios, inteligência de mercado e segurança jurídica entre o Brasil e Omã.",
};

export default function AssocieSePage() {
  return (
    <>
      <ACamaraTabs active="" />
      <Membership />
      <MembershipHero />
      <MembershipClosing />
    </>
  );
}
