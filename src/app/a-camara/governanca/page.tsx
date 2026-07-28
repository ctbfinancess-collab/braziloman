import type { Metadata } from "next";
import { ACamaraTabs, GovernancePage } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Governança",
  description:
    "Conheça a estrutura de governança da Câmara de Comércio Brasil–Omã: Diretoria Executiva, Conselho Consultivo Internacional e Comitês.",
};

export default function GovernancaPage() {
  return (
    <>
      <ACamaraTabs active="governance" />
      <GovernancePage />
    </>
  );
}
