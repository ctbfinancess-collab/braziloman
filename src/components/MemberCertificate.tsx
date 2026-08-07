"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useI18n } from "@/lib/i18n";
import { TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty";
import { Icon } from "./Icons";

/**
 * Botão "Baixar Certificado" — captura um certificado estilizado (oculto na tela)
 * como imagem e exporta em PDF. Reaproveita exatamente o mesmo padrão já usado em
 * AdminArea.tsx (onDownloadPdf: html2canvas -> jsPDF -> addImage paginado).
 */
export function MemberCertificate({
  name,
  company,
  tier,
  memberNumber,
  sinceYear,
}: {
  name: string;
  company: string;
  tier: LoyaltyTier;
  memberNumber: string;
  sinceYear: number | null;
}) {
  const { d } = useI18n();
  const t = d.memberArea.loyalty;
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  async function onDownload() {
    if (!ref.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#f5f2eb" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "px", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`certificado-associado-${name.replace(/\s+/g, "-")}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Fora da tela (não usa display:none, pois html2canvas não captura elementos ocultos assim). */}
      <div style={{ position: "fixed", left: -9999, top: 0 }} aria-hidden="true">
        <div ref={ref} className="loyalty-certificate">
          <span className="loyalty-certificate-seal" aria-hidden="true"><Icon name="seal" /></span>
          <p className="loyalty-certificate-brand">Câmara de Comércio Brasil–Omã</p>
          <h2 className="loyalty-certificate-title">Certificado de Associação</h2>
          <p className="loyalty-certificate-body">
            Certificamos que <strong>{company}</strong>, representada por <strong>{name}</strong>, é associada da Câmara
            de Comércio Brasil–Omã, no nível <strong>{TIER_NAMES[tier]}</strong> do Programa de Fidelidade.
          </p>
          <p className="loyalty-certificate-meta">Nº de associado: {memberNumber}</p>
          {sinceYear && <p className="loyalty-certificate-meta">Associado desde {sinceYear}</p>}
        </div>
      </div>
      <button type="button" className="btn btn-ghost" onClick={onDownload} disabled={loading}>
        {loading ? t.generatingCertificate : t.downloadCertificate}
      </button>
    </div>
  );
}
