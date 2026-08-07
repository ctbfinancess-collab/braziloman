import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PartnersPage } from "@/components/PartnersPage";

export const metadata: Metadata = {
  title: "Parceiros e Associados",
  description:
    "Conheça os parceiros e associados que fazem parte da rede Brasil–Omã e impulsionam negócios entre os dois países.",
};

export default async function ParceirosPage() {
  const rows = prisma
    ? await prisma.partner.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true, logoUrl: true, sector: true, website: true },
      })
    : [];

  return <PartnersPage partners={rows} />;
}
