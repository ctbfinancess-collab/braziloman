import type { Metadata } from "next";
import { About } from "@/components/Sections";
import { ACamaraTabs } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "A Câmara",
  description:
    "Conheça a CTB — Câmara de Comércio Brasil–Omã: missão, princípios e governança de uma associação civil sem fins lucrativos.",
};

export default function ACamaraPage() {
  return (
    <>
      <ACamaraTabs active="home" />
      <About />
    </>
  );
}
