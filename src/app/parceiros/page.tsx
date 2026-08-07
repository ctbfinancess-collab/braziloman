import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PartnersPage } from "@/components/PartnersPage";

// Sem isso, o Next tenta pré-renderizar essa página em tempo de BUILD (já que
// ela não usa cookies()/headers() como as páginas do painel, que ganham modo
// dinâmico automaticamente). No build do Railway o banco só é alcançável pelo
// hostname interno depois que o container sobe — durante o build ele não
// existe, então prisma.partner.findMany() falhava e derrubava o build inteiro.
export const dynamic = "force-dynamic";

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
