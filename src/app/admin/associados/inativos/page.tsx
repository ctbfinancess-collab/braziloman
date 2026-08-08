import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession, ADMIN_COOKIE } from "@/lib/session";
import { AdminApplicationsList, INACTIVE_STATUSES } from "@/components/AdminArea";

export const metadata: Metadata = {
  title: "Administração — Associados Inativos",
  robots: { index: false, follow: false },
};

export default async function AdminAssociadosInativosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;

  if (!session) redirect("/admin/login");

  return (
    <AdminApplicationsList
      navKey="inativos"
      pageTitle="Associados Inativos"
      pageLead="Associações recusadas ou suspensas."
      statusFilter={INACTIVE_STATUSES}
    />
  );
}
