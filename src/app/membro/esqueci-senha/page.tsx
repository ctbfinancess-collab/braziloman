import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/MemberArea";

export const metadata: Metadata = {
  title: "Esqueci minha senha — Área do Membro",
  description: "Redefina a senha da sua conta de associado da Câmara de Comércio Brasil–Omã.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
