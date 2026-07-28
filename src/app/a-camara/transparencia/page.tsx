import type { Metadata } from "next";
import { ACamaraTabs, TransparencyPage } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Transparência",
  description: "Transparência institucional da Câmara de Comércio Brasil–Omã.",
};

export default function TransparenciaPage() {
  return (
    <>
      <ACamaraTabs active="transparency" />
      <TransparencyPage />
    </>
  );
}
