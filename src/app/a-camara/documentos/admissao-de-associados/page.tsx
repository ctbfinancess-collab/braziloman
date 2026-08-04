import type { Metadata } from "next";
import { ACamaraTabs, PolicyDocumentPage } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Política de Admissão de Associados",
  description: "Critérios, documentação e etapas do processo de admissão à Câmara de Comércio Brasil–Omã.",
};

export default function AdmissaoDeAssociadosPage() {
  return (
    <>
      <ACamaraTabs active="compliance" />
      <PolicyDocumentPage docKey="admissionPolicy" />
    </>
  );
}
