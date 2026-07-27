import type { Metadata } from "next";
import LaunchArticle from "@/components/LaunchArticle";

export const metadata: Metadata = {
  title: "Lançamento Oficial da Câmara de Comércio Brasil–Omã",
  description:
    "Fotos e vídeos da cerimônia de lançamento da Câmara de Comércio Brasil–Omã no Congresso Nacional, em Brasília.",
};

export default function LancamentoPage() {
  return <LaunchArticle />;
}
