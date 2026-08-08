import type { Metadata } from "next";
import { Suspense } from "react";
import { MemberLoginForm } from "@/components/MemberArea";
import { hasGoogleLogin } from "@/lib/env";

// Força renderização dinâmica (a cada request, não uma vez só no build) —
// no Railway, variáveis de ambiente adicionadas depois do último deploy só
// ficam disponíveis em runtime, não durante o build. Uma página estática
// "congela" hasGoogleLogin do jeito que estava no momento do build.
export const dynamic = "force-dynamic";

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
