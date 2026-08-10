import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminContactMessagesList } from "@/components/AdminArea";

export const metadata: Metadata = {
  title: "Administração — Mensagens de Contato",
  robots: { index: false, follow: false },
};

export default async function AdminMensagensPage() {
  await requireFullAdmin();

  return <AdminContactMessagesList />;
}
