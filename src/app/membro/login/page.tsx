import type { Metadata } from "next";
import { Suspense } from "react";
import { MemberLoginForm } from "@/components/MemberArea";
import { hasGoogleLogin } from "@/lib/env";

export const metadata: Metadata = {
  title: "Entrar — Área do Membro",
  description: "Acesse sua conta de associado da Câmara de Comércio Brasil–Omã.",
  robots: { index: false, follow: false },
};

export default function MemberLoginPage() {
  return (
    <Suspense>
      <MemberLoginForm googleEnabled={hasGoogleLogin} />
    </Suspense>
  );
}
