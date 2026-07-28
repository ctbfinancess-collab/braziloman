import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMemberId } from "@/lib/memberAuth";
import { uploadDocument, getDocumentSignedUrl, isDocumentStorageEnabled } from "@/lib/media";
import type { DocumentEntry } from "@/lib/candidateSchemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB

/** Envia (ou substitui) um documento de uma vaga específica do checklist. */
export async function POST(req: Request) {
  const memberId = await getMemberId();
  if (!memberId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
  if (!isDocumentStorageEnabled()) {
    return NextResponse.json({ error: "Upload de documentos não configurado" }, { status: 503 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const docKey = form.get("docKey");
  const label = form.get("label");

  if (!(file instanceof File) || typeof docKey !== "string" || typeof label !== "string") {
    return NextResponse.json({ error: "Dados do formulário inválidos" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande (máx. 15MB)" }, { status: 413 });
  }

  let storageKey: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    storageKey = await uploadDocument(buffer, file.type, memberId);
  } catch (err) {
    console.error("[member/document] erro no upload:", err);
    const message = err instanceof Error ? err.message : "Erro ao enviar arquivo";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const application = await prisma.membershipApplication.findUnique({
    where: { id: memberId },
    select: { documents: true },
  });
  const existing = ((application?.documents as DocumentEntry[] | null) ?? []) as DocumentEntry[];

  const entry: DocumentEntry = {
    key: docKey,
    label,
    storageKey,
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
  };
  const next = [...existing.filter((d) => d.key !== docKey), entry];

  await prisma.membershipApplication.update({
    where: { id: memberId },
    data: { documents: next },
  });

  const url = await getDocumentSignedUrl(storageKey).catch(() => "");
  return NextResponse.json({ ok: true, document: { ...entry, url } });
}
