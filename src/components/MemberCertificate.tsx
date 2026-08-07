"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useI18n } from "@/lib/i18n";
import { TIER_NAMES, formatMemberNumber, type LoyaltyTier } from "@/lib/loyalty";

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
 *
 * Todo o texto sobreposto é centralizado com flexbox (nunca com
 * `transform: translate(-50%,-50%)`) — o html2canvas nem sempre respeita
 * transforms de posicionamento, o que já causou QR code e textos desalinhados
 * no PDF exportado mesmo com a prévia na tela parecendo correta.
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
  const displayNumber = formatMemberNumber(memberNumber);

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

  const valueBoxStyle: React.CSSProperties = {
    position: "absolute",
    top: 825,
    height: 55,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const valueTextStyle: React.CSSProperties = {
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
      {/* Prévia visível na página — posições em % (não em px), responsiva como o cartão digital. */}
      <div className="member-cert-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="member-cert-preview-img" src="/loyalty/certificate.jpg" alt="" />
        <span className="member-cert-patch member-cert-patch-company" aria-hidden="true" />
        <span className="member-cert-value-company">{company}</span>

        <span className="member-cert-patch member-cert-patch-value member-cert-patch-date" aria-hidden="true" />
        <span className="member-cert-value-row member-cert-value-date">{formatDate(memberSince)}</span>

        <span className="member-cert-patch member-cert-patch-value member-cert-patch-number" aria-hidden="true" />
        <span className="member-cert-value-row member-cert-value-number">{displayNumber}</span>

        <span className="member-cert-patch member-cert-patch-value member-cert-patch-category" aria-hidden="true" />
        <span className="member-cert-value-row member-cert-value-category">{TIER_NAMES[tier]}</span>

        {qrDataUrl && (
          <>
            <span className="member-cert-qr-patch" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="member-cert-qr-img" src={qrDataUrl} alt="QR Code de verificação do associado" />
          </>
        )}
      </div>

      {/* Fora da tela (não usa display:none, pois html2canvas não captura elementos ocultos assim) —
          usada só para gerar o PDF em resolução total; a prévia visível é a versão acima. */}
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
              left: 380,
              top: 490,
              width: 720,
              height: 85,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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

          <div style={{ position: "absolute", left: 200, top: 825, width: 280, height: 55, background: PATCH_COLOR }} />
          <div style={{ ...valueBoxStyle, left: 200, width: 280 }}>
            <span style={valueTextStyle}>{formatDate(memberSince)}</span>
          </div>

          <div style={{ position: "absolute", left: 480, top: 825, width: 240, height: 55, background: PATCH_COLOR }} />
          <div style={{ ...valueBoxStyle, left: 480, width: 240 }}>
            <span style={valueTextStyle}>{displayNumber}</span>
          </div>

          <div style={{ position: "absolute", left: 760, top: 825, width: 180, height: 55, background: PATCH_COLOR }} />
          <div style={{ ...valueBoxStyle, left: 760, width: 180 }}>
            <span style={valueTextStyle}>{TIER_NAMES[tier]}</span>
          </div>

          {qrDataUrl && (
            <>
              <div style={{ position: "absolute", left: 1052, top: 749, width: 130, height: 130, background: "#fff" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt=""
                style={{
                  position: "absolute",
                  left: 1052,
                  top: 749,
                  width: 130,
                  height: 130,
                  padding: 10,
                  boxSizing: "border-box",
                  objectFit: "contain",
                }}
              />
            </>
          )}
        </div>
      </div>
      <button type="button" className="btn btn-ghost" style={{ marginTop: 24 }} onClick={onDownload} disabled={loading}>
        {loading ? t.generatingCertificate : t.downloadCertificate}
      </button>
    </div>
  );
}
