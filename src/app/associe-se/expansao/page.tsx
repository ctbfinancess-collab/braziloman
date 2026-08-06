import type { Metadata } from "next";
import { MembershipNumberedSection } from "@/components/MembershipPage";
import { ACamaraTabs } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Expansão",
  description: "Desenvolva os negócios da sua empresa entre Brasil e Omã.",
};

export default function ExpansaoPage() {
  return (
    <>
      <ACamaraTabs active="expansion" />
      <MembershipNumberedSection index={3} />
    </>
  );
}
