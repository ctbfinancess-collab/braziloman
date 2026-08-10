import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminNotices } from "@/components/AdminNotices";

export const metadata: Metadata = {
  title: "Administração — Avisos Institucionais",
  robots: { index: false, follow: false },
};

export default async function AdminNoticesPage() {
  await requireFullAdmin();

  return <AdminNotices />;
}
