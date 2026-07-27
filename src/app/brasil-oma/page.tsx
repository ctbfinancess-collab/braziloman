import type { Metadata } from "next";
import { Countries, Partnership, InstitutionalVideo } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Brasil & Omã",
  description:
    "Duas economias complementares: Brasil e Omã. Fluxos comerciais, sinergia estratégica e o vídeo institucional da CTB.",
};

export default function BrasilOmaPage() {
  return (
    <>
      <Countries />
      <Partnership />
      <InstitutionalVideo />
    </>
  );
}
