// One-off generator: renders the 4 compliance policy documents (PT + EN) onto the
// official CTB letterhead and writes static PDFs into public/documentos/.
// Run with: node --experimental-strip-types scripts/gen-policy-pdfs.mjs
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { content } from "../src/lib/content.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LETTERHEAD_PATH = path.join(ROOT, "assets/branding/papel-timbrado-offwhite.pdf");
const OUT_DIR = path.join(ROOT, "public/documentos");

const GOLD = rgb(0x96 / 255, 0x71 / 255, 0x2c / 255);
const INK = rgb(0x20 / 255, 0x1b / 255, 0x13 / 255);
const MUTED = rgb(0x57 / 255, 0x4f / 255, 0x40 / 255);

const A4_WIDTH = 595.276;
const A4_HEIGHT = 841.89;

const MARGIN_LEFT = 92;
const MARGIN_RIGHT = 70;
const TOP_START = 205; // distance from top edge where body content starts
const BOTTOM_LIMIT = 135; // distance from bottom edge reserved for footer/watermark

const DOCS = [
  { key: "codeOfEthics", file: "codigo-de-etica" },
  { key: "complianceProgram", file: "politica-de-compliance" },
  { key: "admissionPolicy", file: "admissao-de-associados" },
  { key: "amlKyc", file: "aml-kyc" },
];

function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function generate(locale, docKey, outFile) {
  const letterheadBytes = fs.readFileSync(LETTERHEAD_PATH);
  const letterheadDoc = await PDFDocument.load(letterheadBytes);

  const out = await PDFDocument.create();
  const [templatePage] = await out.embedPdf(letterheadDoc, [0]);
  const fontRegular = await out.embedFont(StandardFonts.TimesRoman);
  const fontBold = await out.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await out.embedFont(StandardFonts.TimesRomanItalic);

  // Normalize to standard A4 regardless of the template's native page size
  // (letterhead exports have varied — e.g. design-tool px treated as pt).
  const pageWidth = A4_WIDTH;
  const pageHeight = A4_HEIGHT;
  const maxWidth = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;

  const doc = content[locale].acamaraPage.policyDocuments[docKey];

  let page = out.addPage([pageWidth, pageHeight]);
  page.drawPage(templatePage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  let cursorY = pageHeight - TOP_START;

  function newPage() {
    page = out.addPage([pageWidth, pageHeight]);
    page.drawPage(templatePage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
    cursorY = pageHeight - TOP_START;
  }

  function ensureSpace(needed) {
    if (cursorY - needed < BOTTOM_LIMIT) newPage();
  }

  function drawParagraphLines(lines, opts) {
    const { font, size, color, gap } = opts;
    for (const line of lines) {
      ensureSpace(size + 4);
      page.drawText(line, { x: MARGIN_LEFT, y: cursorY, size, font, color });
      cursorY -= size + 4;
    }
    cursorY -= gap;
  }

  // Title
  const titleSize = 19;
  const titleLines = wrapText(doc.title, fontBold, titleSize, maxWidth);
  drawParagraphLines(titleLines, { font: fontBold, size: titleSize, color: GOLD, gap: 4 });

  // Gold rule under title
  ensureSpace(14);
  page.drawLine({
    start: { x: MARGIN_LEFT, y: cursorY + 6 },
    end: { x: MARGIN_LEFT + 80, y: cursorY + 6 },
    thickness: 1.4,
    color: GOLD,
  });
  cursorY -= 14;

  // Intro
  const introLines = wrapText(doc.intro, fontRegular, 11, maxWidth);
  drawParagraphLines(introLines, { font: fontRegular, size: 11, color: INK, gap: 14 });

  // Sections
  for (const section of doc.sections) {
    ensureSpace(14 + 12);
    const hLines = wrapText(section.h, fontBold, 12.5, maxWidth);
    drawParagraphLines(hLines, { font: fontBold, size: 12.5, color: INK, gap: 4 });
    const pLines = wrapText(section.p, fontRegular, 10.5, maxWidth);
    drawParagraphLines(pLines, { font: fontRegular, size: 10.5, color: MUTED, gap: 14 });
  }

  // Footer note
  if (doc.footer) {
    ensureSpace(20);
    cursorY -= 6;
    const footerLines = wrapText(doc.footer, fontItalic, 9.5, maxWidth);
    drawParagraphLines(footerLines, { font: fontItalic, size: 9.5, color: MUTED, gap: 0 });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const bytes = await out.save();
  fs.writeFileSync(path.join(OUT_DIR, outFile), bytes);
  console.log("wrote", outFile);
}

for (const { key, file } of DOCS) {
  await generate("pt", key, `${file}-pt.pdf`);
  await generate("en", key, `${file}-en.pdf`);
}
