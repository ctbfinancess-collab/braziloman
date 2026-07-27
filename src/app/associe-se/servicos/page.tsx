import type { Metadata } from "next";
import { MembershipTabs, MembershipExtra } from "@/components/MembershipPage";

export const metadata: Metadata = {
  title: "Serviços ao Associado",
  description: "Uma estrutura preparada para apoiar a jornada do associado da Câmara de Comércio Brasil–Omã.",
};

export default function ServicosPage() {
  return (
    <>
      <MembershipTabs active="extra" />
      <MembershipExtra />
    </>
  );
}
