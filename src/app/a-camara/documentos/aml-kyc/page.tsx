import type { Metadata } from "next";
import { ACamaraTabs, PolicyDocumentPage } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Política AML/KYC",
  description: "Diretrizes de prevenção à lavagem de dinheiro e conhecimento de associados da Câmara de Comércio Brasil–Omã.",
};

export default function AmlKycPage() {
  return (
    <>
      <ACamaraTabs active="compliance" />
      <PolicyDocumentPage docKey="amlKyc" />
    </>
  );
}
