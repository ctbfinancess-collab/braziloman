import type { Metadata } from "next";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Câmara de Comércio Brasil–Omã.",
};

export default function ContatoPage() {
  return <Contact />;
}
