import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a Câmara de Comércio Brasil–Omã coleta, usa e protege seus dados pessoais.",
};

export default function PrivacyPolicyPage() {
  return <LegalPage docKey="privacyPolicy" />;
}
