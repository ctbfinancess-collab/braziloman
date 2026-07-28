import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/MemberArea";

export const metadata: Metadata = {
  title: "Redefinir senha — Área do Membro",
  description: "Escolha uma nova senha para sua conta de associado da Câmara de Comércio Brasil–Omã.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token ?? null} />;
}
