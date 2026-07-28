import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession, ADMIN_COOKIE } from "@/lib/session";
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
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;

  if (!session) redirect("/admin/login");

  const { id } = await params;
  return <AdminApplicationDetail id={id} />;
}
