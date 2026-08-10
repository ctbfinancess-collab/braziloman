import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminApplicationsList } from "@/components/AdminArea";

export const metadata: Metadata = {
  title: "Administração — Pedidos de Associação",
  robots: { index: false, follow: false },
};

export default async function AdminAssociadosPage() {
  await requireFullAdmin();

  return <AdminApplicationsList />;
}
