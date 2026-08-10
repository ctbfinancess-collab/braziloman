import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminApplicationsList, INACTIVE_STATUSES } from "@/components/AdminArea";

export const metadata: Metadata = {
  title: "Administração — Associados Inativos",
  robots: { index: false, follow: false },
};

export default async function AdminAssociadosInativosPage() {
  await requireFullAdmin();

  return (
    <AdminApplicationsList
      navKey="inativos"
      pageTitle="Associados Inativos"
      pageLead="Associações recusadas ou suspensas."
      statusFilter={INACTIVE_STATUSES}
    />
  );
}
