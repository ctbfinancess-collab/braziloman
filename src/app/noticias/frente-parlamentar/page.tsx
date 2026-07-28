import type { Metadata } from "next";
import FrenteParlamentarArticle from "@/components/FrenteParlamentarArticle";

export const metadata: Metadata = {
  title: "Frente Parlamentar Brasil–Omã",
  description:
    "Proposta de criação da Frente Parlamentar Brasil–Omã, de iniciativa do Deputado Federal Bibo Nunes, em tramitação no Congresso Nacional.",
};

export default function FrenteParlamentarPage() {
  return <FrenteParlamentarArticle />;
}
