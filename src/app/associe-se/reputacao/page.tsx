import type { Metadata } from "next";
import { MembershipNumberedSection } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Reputação",
  description: "Fortaleça a presença institucional da sua empresa com a Câmara de Comércio Brasil–Omã.",
};

export default function ReputacaoPage() {
  return (
    <>
      <MembershipNumberedSection index={0} />
    </>
  );
}
