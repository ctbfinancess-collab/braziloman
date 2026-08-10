import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { ContentEditor } from "@/components/ContentEditor";

export const metadata: Metadata = {
  title: "Administração — Conteúdo do Site",
  robots: { index: false, follow: false },
};

export default async function AdminConteudoPage() {
  await requireFullAdmin();

  return <ContentEditor />;
}
