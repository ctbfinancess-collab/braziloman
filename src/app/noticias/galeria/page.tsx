import type { Metadata } from "next";
import GalleryArticle from "@/components/GalleryArticle";

export const metadata: Metadata = {
  title: "Câmara de Comércio na Mídia",
  description:
    "Fotos, vídeos e a Câmara de Comércio Brasil–Omã na imprensa nacional e internacional.",
};

export default function GaleriaPage() {
  return <GalleryArticle />;
}
