import type { Metadata } from "next";
import { MembershipTabs, MembershipNumberedSection } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Expansão",
  description: "Desenvolva os negócios da sua empresa entre Brasil e Omã.",
};

export default function ExpansaoPage() {
  return (
    <>
      <MembershipTabs active="expansion" />
      <MembershipNumberedSection index={3} />
    </>
  );
}
