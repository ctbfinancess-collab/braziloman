import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminApplicationDetail } from "@/components/AdminArea";

export const metadata: Metadata = {
  title: "Administração — Detalhe da Candidatura",
  robots: { index: false, follow: false },
};

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireFullAdmin();

  const { id } = await params;
  return <AdminApplicationDetail id={id} />;
}
