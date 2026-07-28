import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/AdminArea";

export const metadata: Metadata = {
  title: "Administração — Entrar",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
