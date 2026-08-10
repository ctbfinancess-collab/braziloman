import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do site e do aplicativo da Câmara de Comércio Brasil–Omã.",
};

export default function TermsOfUsePage() {
  return <LegalPage docKey="termsOfUse" />;
}
