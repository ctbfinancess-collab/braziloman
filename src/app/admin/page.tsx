import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Administração — Painel Geral",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await requireFullAdmin();

  return <AdminDashboard />;
}
