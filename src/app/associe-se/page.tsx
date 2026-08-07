import type { Metadata } from "next";
import { Membership, MembershipLevels, MembershipPricing, MembershipNetworkBand, MembershipHowItWorks, MembershipFAQ } from "@/components/Sections";
import { MembershipHero, MembershipClosing } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Associe-se",
  description:
    "Torne-se membro da Câmara e acesse uma rede exclusiva de negócios, inteligência de mercado e segurança jurídica entre o Brasil e Omã.",
};

export default function AssocieSePage() {
  return (
    <>
      <Membership />
      <MembershipLevels />
      <MembershipPricing />
      <MembershipNetworkBand />
      <MembershipHowItWorks />
      <MembershipFAQ />
      <MembershipHero />
      <MembershipClosing />
    </>
  );
}
