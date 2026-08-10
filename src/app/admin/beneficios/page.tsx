import type { Metadata } from "next";
import { requireAnyAdmin } from "@/lib/adminAuth";
import { AdminBenefits } from "@/components/AdminBenefits";

export const metadata: Metadata = {
  title: "Administração — Parceiros & Benefícios",
  robots: { index: false, follow: false },
};

// Única página de /admin/* que a conta "Parceiros & Benefícios" (secretária)
// também acessa — por isso usa requireAnyAdmin() em vez de requireFullAdmin().
export default async function AdminBeneficiosPage() {
  await requireAnyAdmin();

  return <AdminBenefits />;
}
