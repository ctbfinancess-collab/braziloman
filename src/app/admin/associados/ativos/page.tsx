import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { AdminApplicationsList, ACTIVE_STATUSES } from "@/components/AdminArea";

export const metadata: Metadata = {
  title: "Administração — Associados Ativos",
  robots: { index: false, follow: false },
};

export default async function AdminAssociadosAtivosPage() {
  await requireFullAdmin();

  return (
    <AdminApplicationsList
      navKey="ativos"
      pageTitle="Associados Ativos"
      pageLead="Associados com associação ativa ou aprovada."
      statusFilter={ACTIVE_STATUSES}
    />
  );
}
