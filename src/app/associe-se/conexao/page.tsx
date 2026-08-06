import type { Metadata } from "next";
import { MembershipNumberedSection } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Conexão",
  description: "Amplie sua rede de negócios e parceiros entre Brasil e Omã.",
};

export default function ConexaoPage() {
  return (
    <>
      <MembershipNumberedSection index={2} />
    </>
  );
}
