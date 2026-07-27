import type { Metadata } from "next";
import { Ecosystem } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Ecossistema",
  description:
    "Uma estrutura global integrada: CTB Holdings, CTBX Venture, OmanBrasil e Fundação Wahibi.",
};

export default function EcossistemaPage() {
  return <Ecosystem />;
}
