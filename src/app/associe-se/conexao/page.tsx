import type { Metadata } from "next";
import { MembershipTabs, MembershipNumberedSection } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Conexão",
  description: "Amplie sua rede de negócios e parceiros entre Brasil e Omã.",
};

export default function ConexaoPage() {
  return (
    <>
      <MembershipTabs active="connection" />
      <MembershipNumberedSection index={2} />
    </>
  );
}
