import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminPartners } from "@/components/AdminPartners";

export const metadata: Metadata = {
  title: "Administração — Parceiros e Associados",
  robots: { index: false, follow: false },
};

export default async function AdminPartnersPage() {
  await requireFullAdmin();

  return <AdminPartners />;
}
