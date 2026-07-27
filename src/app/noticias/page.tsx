import type { Metadata } from "next";
import { News } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Notícias",
  description: "Acompanhe as principais iniciativas, eventos e oportunidades que conectam o Brasil e Omã.",
};

export default function NoticiasPage() {
  return <News />;
}
