import type { Metadata } from "next";
import { MembershipNumberedSection } from "@/components/MembershipPage";
import { ACamaraTabs } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Conexão",
  description: "Amplie sua rede de negócios e parceiros entre Brasil e Omã.",
};

export default function ConexaoPage() {
  return (
    <>
      <ACamaraTabs active="connection" />
      <MembershipNumberedSection index={2} />
    </>
  );
}
