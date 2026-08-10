import type { Metadata } from "next";
import { requireAnyAdmin } from "@/lib/adminAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { MyTwoFactorCard } from "@/components/AdminUsers";

export const metadata: Metadata = {
  title: "Administração — Minha Conta",
  robots: { index: false, follow: false },
};

// Só o cartão de 2FA self-service (não a lista de usuários, que é
// FULL-only) — é a única forma da conta "Parceiros & Benefícios" (secretária)
// ativar a própria autenticação em duas etapas, já que /admin/usuarios está
// fora do alcance dela.
export default async function AdminContaPage() {
  await requireAnyAdmin();

  return (
    <AdminLayout active="conta" title="Minha Conta" lead="Segurança da sua própria conta de acesso ao painel.">
      <MyTwoFactorCard />
    </AdminLayout>
  );
}
