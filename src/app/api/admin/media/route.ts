import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { uploadMedia, isMediaEnabled } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE_IMAGE = 8 * 1024 * 1024; // 8MB
const MAX_SIZE_VIDEO = 120 * 1024 * 1024; // 120MB

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isMediaEnabled()) {
    return NextResponse.json({ error: "Upload de mídia não configurado" }, { status: 503 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }
  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? MAX_SIZE_VIDEO : MAX_SIZE_IMAGE;
  if (file.size > maxSize) {
    const label = isVideo ? "120MB" : "8MB";
    return NextResponse.json({ error: `Arquivo muito grande (máx. ${label})` }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadMedia(buffer, file.type);
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("[admin/media] erro no upload:", err);
    const message = err instanceof Error ? err.message : "Erro ao enviar arquivo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
