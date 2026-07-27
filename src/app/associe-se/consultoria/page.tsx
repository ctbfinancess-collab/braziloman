import type { Metadata } from "next";
import { MembershipTabs } from "@/components/MembershipPage";
import {
  ConsultingHero,
  ConsultingSolutionsIntro,
  ConsultingBlocks,
  ConsultingClosing,
  ConsultingForm,
} from "@/components/ConsultingPage";

export const metadata: Metadata = {
  title: "Consultoria Internacional",
  description:
    "Inteligência estratégica para negócios entre Brasil, Omã e o Golfo — consultoria especializada da Câmara de Comércio Brasil–Omã.",
};

export default function ConsultoriaPage() {
  return (
    <>
      <MembershipTabs active="consulting" />
      <ConsultingHero />
      <ConsultingSolutionsIntro />
      <ConsultingBlocks />
      <ConsultingClosing />
      <ConsultingForm />
    </>
  );
}
