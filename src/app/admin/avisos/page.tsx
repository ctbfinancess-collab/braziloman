import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession, ADMIN_COOKIE } from "@/lib/session";
import { AdminNotices } from "@/components/AdminNotices";

export const metadata: Metadata = {
  title: "Administração — Avisos Institucionais",
  robots: { index: false, follow: false },
};

export default async function AdminNoticesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;

  if (!session) redirect("/admin/login");

  return <AdminNotices />;
}
