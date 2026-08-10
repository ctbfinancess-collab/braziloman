import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminEvents } from "@/components/AdminEvents";

export const metadata: Metadata = {
  title: "Administração — Eventos e Missões",
  robots: { index: false, follow: false },
};

export default async function AdminEventsPage() {
  await requireFullAdmin();

  return <AdminEvents />;
}
