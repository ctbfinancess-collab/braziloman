import type { Metadata } from "next";
import { MembershipExtra } from "@/components/MembershipPage";
import { ACamaraTabs } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Serviços ao Associado",
  description: "Uma estrutura preparada para apoiar a jornada do associado da Câmara de Comércio Brasil–Omã.",
};

export default function ServicosPage() {
  return (
    <>
      <ACamaraTabs active="extra" />
      <MembershipExtra />
    </>
  );
}
