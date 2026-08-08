import type { Metadata } from "next";
import GalleryArticle from "@/components/GalleryArticle";

export const metadata: Metadata = {
  title: "Galeria de Fotos e Vídeos",
  description:
    "Fotos e vídeos das atividades, eventos e bastidores da Câmara de Comércio Brasil–Omã.",
};

export default function GaleriaPage() {
  return <GalleryArticle />;
}
