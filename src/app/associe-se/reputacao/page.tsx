import type { Metadata } from "next";
import { MembershipNumberedSection } from "@/components/MembershipPage";
import { ACamaraTabs } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Reputação",
  description: "Fortaleça a presença institucional da sua empresa com a Câmara de Comércio Brasil–Omã.",
};

export default function ReputacaoPage() {
  return (
    <>
      <ACamaraTabs active="reputation" />
      <MembershipNumberedSection index={0} />
    </>
  );
}
