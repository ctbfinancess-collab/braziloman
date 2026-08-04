import type { Metadata } from "next";
import { ACamaraTabs, PolicyDocumentPage } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Código de Ética e Conduta",
  description: "Princípios e padrões de conduta da Câmara de Comércio Brasil–Omã.",
};

export default function CodigoDeEticaPage() {
  return (
    <>
      <ACamaraTabs active="compliance" />
      <PolicyDocumentPage docKey="codeOfEthics" />
    </>
  );
}
