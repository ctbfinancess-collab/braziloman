import type { Metadata } from "next";
import { About } from "@/components/Sections";

export const metadata: Metadata = {
  title: "A Câmara",
  description:
    "Conheça a CTB — Câmara de Comércio Brasil–Omã: missão, princípios e governança de uma associação civil sem fins lucrativos.",
};

export default function ACamaraPage() {
  return <About />;
}
