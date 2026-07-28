import type { Metadata } from "next";
import { ACamaraTabs, CompliancePage } from "@/components/ACamaraPage";

export const metadata: Metadata = {
  title: "Compliance",
  description: "Diretrizes de compliance da Câmara de Comércio Brasil–Omã.",
};

export default function ComplianceRoutePage() {
  return (
    <>
      <ACamaraTabs active="compliance" />
      <CompliancePage />
    </>
  );
}
