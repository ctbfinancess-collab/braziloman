"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useI18n } from "@/lib/i18n";
import { TIER_NAMES, type LoyaltyTier } from "@/lib/loyalty";

// Dimensões naturais da arte (public/loyalty/certificate.jpg) — o nó capturado
// pelo html2canvas usa esse tamanho fixo em pixels, então as posições abaixo
// (extraídas por amostragem de pixel da arte original) não precisam ser
// responsivas como no cartão digital.
const CERT_WIDTH = 1484;
const CERT_HEIGHT = 1060;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd} / ${mm} / ${d.getFullYear()}`;
}

/**
 * Botão "Baixar Certificado" — captura a arte real do certificado (oculta na
 * tela) com nome da empresa, data de associação, número de associado e
 * categoria sobrepostos dinamicamente, e exporta em PDF. Reaproveita o mesmo
 * padrão de AdminArea.tsx (onDownloadPdf: html2canvas -> jsPDF -> addImage).
 */
export function MemberCertificate({
  name,
  company,
  tier,
  memberNumber,
  memberSince,
  qrDataUrl,
}: {
  name: string;
  company: string;
  tier: LoyaltyTier;
  memberNumber: string;
  memberSince: string | null;
  qrDataUrl?: string | null;
}) {
  const { d } = useI18n();
  const t = d.memberArea.loyalty;
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  async function onDownload() {
    if (!ref.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#000000" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "px", format: "a4", orientation: "landscape" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * scale;
      const imgHeight = canvas.height * scale;
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`certificado-associado-${name.replace(/\s+/g, "-")}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  // Cor de fundo da arte na região dos dados de exemplo (quase preto sólido),
  // amostrada da própria arte — usada para "apagar" o texto de exemplo
  // (nome/data/número/categoria fictícios) antes de escrever os dados reais.
  const PATCH_COLOR = "#0a0a09";

  const valuePatchStyle: React.CSSProperties = {
    position: "absolute",
    top: 825,
    height: 55,
    background: PATCH_COLOR,
  };
  const valueStyle: React.CSSProperties = {
    position: "absolute",
    top: 850,
    transform: "translate(-50%, -50%)",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: 700,
    fontSize: 26,
    letterSpacing: 1,
    color: "#fdfaf3",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };

  return (
    <div>
      {/* Fora da tela (não usa display:none, pois html2canvas não captura elementos ocultos assim). */}
      <div style={{ position: "fixed", left: -9999, top: 0 }} aria-hidden="true">
        <div
          ref={ref}
          style={{
            position: "relative",
            width: CERT_WIDTH,
            height: CERT_HEIGHT,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/loyalty/certificate.jpg"
            alt=""
            style={{ position: "absolute", left: 0, top: 0, width: CERT_WIDTH, height: CERT_HEIGHT }}
          />
          <div style={{ position: "absolute", left: 380, top: 490, width: 720, height: 85, background: PATCH_COLOR }} />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 529,
              transform: "translate(-50%, -50%)",
              maxWidth: 1100,
              textAlign: "center",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: "#f3ede1",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {company}
          </div>

          <div style={{ ...valuePatchStyle, left: 200, width: 280 }} />
          <div style={{ ...valueStyle, left: 356 }}>{formatDate(memberSince)}</div>

          <div style={{ ...valuePatchStyle, left: 480, width: 240 }} />
          <div style={{ ...valueStyle, left: 587 }}>CCBO-{memberNumber}</div>

          <div style={{ ...valuePatchStyle, left: 760, width: 180 }} />
          <div style={{ ...valueStyle, left: 849 }}>{TIER_NAMES[tier]}</div>

          {qrDataUrl && (
            <>
              <div style={{ position: "absolute", left: 1052, top: 749, width: 130, height: 130, background: "#fff" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt=""
                style={{
                  position: "absolute",
                  left: 1117,
                  top: 814,
                  transform: "translate(-50%, -50%)",
                  width: 115,
                  height: 115,
                  objectFit: "contain",
                }}
              />
            </>
          )}
        </div>
      </div>
      <button type="button" className="btn btn-ghost" onClick={onDownload} disabled={loading}>
        {loading ? t.generatingCertificate : t.downloadCertificate}
      </button>
    </div>
  );
}
