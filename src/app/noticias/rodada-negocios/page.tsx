import type { Metadata } from "next";
import RodadaNegociosArticle from "@/components/RodadaNegociosArticle";

export const metadata: Metadata = {
  title: "Rodada de Negócios Exclusiva",
  description:
    "Rodada de negócios exclusiva com membros do Governo de Omã e instituições financeiras, em Brasília.",
};

export default function RodadaNegociosPage() {
  return <RodadaNegociosArticle />;
}
