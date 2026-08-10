import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminUsers } from "@/components/AdminUsers";

export const metadata: Metadata = {
  title: "Administração — Usuários",
  robots: { index: false, follow: false },
};

export default async function AdminUsuariosPage() {
  await requireFullAdmin();

  return <AdminUsers />;
}
