import type { Metadata } from "next";
import { Services } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Atuação",
  description:
    "Fomento, conectividade e segurança jurídica: como a CTB atua para viabilizar negócios entre Brasil e Omã.",
};

export default function AtuacaoPage() {
  return <Services />;
}
