import type { Metadata } from "next";
import MissaoArticle from "@/components/MissaoArticle";

export const metadata: Metadata = {
  title: "Missão Empresarial Brasil–Omã",
  description:
    "A Câmara organiza a próxima Missão Empresarial Brasil–Omã, com agendas estratégicas em Brasília e Mascate para empresários, investidores e representantes institucionais.",
};

export default function MissaoEmpresarialPage() {
  return <MissaoArticle />;
}
