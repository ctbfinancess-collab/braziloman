import type { Metadata } from "next";
import { MemberLoginForm } from "@/components/MemberArea";

export const metadata: Metadata = {
  title: "Entrar — Área do Membro",
  description: "Acesse sua conta de associado da Câmara de Comércio Brasil–Omã.",
  robots: { index: false, follow: false },
};

export default function MemberLoginPage() {
  return <MemberLoginForm />;
}
