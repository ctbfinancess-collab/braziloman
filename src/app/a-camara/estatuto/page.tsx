import type { Metadata } from "next";
import { ACamaraTabs, StatutePage } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Estatuto",
  description: "Estatuto Social da Câmara de Comércio Brasil–Omã.",
};

export default function EstatutoPage() {
  return (
    <>
      <ACamaraTabs active="statute" />
      <StatutePage />
    </>
  );
}
