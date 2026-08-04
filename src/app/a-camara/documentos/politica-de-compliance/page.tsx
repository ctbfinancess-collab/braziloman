import type { Metadata } from "next";
import { ACamaraTabs, PolicyDocumentPage } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Política de Compliance",
  description: "Estrutura do Programa de Integridade da Câmara de Comércio Brasil–Omã.",
};

export default function PoliticaDeCompliancePage() {
  return (
    <>
      <ACamaraTabs active="compliance" />
      <PolicyDocumentPage docKey="complianceProgram" />
    </>
  );
}
