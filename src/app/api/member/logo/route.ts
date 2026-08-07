import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { uploadMedia, isMediaEnabled } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB

/** Upload da logo da empresa pelo próprio associado — usado tanto no Portal do
 *  Candidato (cadastro) quanto em "Meu Perfil". Qualquer sessão de membro válida
 *  pode enviar (não exige status ACTIVE), já que o cadastro ainda está em
 *  andamento na primeira vez que isso é usado. */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
  if (!isMediaEnabled()) return NextResponse.json({ error: "Upload de imagem não configurado" }, { status: 503 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Arquivo muito grande (máx. 4MB)" }, { status: 413 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadMedia(buffer, file.type);
    await prisma.membershipApplication.update({ where: { id: session.sub }, data: { logoUrl: url } });
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("[member/logo] erro no upload:", err);
    const message = err instanceof Error ? err.message : "Erro ao enviar arquivo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Remove a logo cadastrada. */
export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  await prisma.membershipApplication.update({ where: { id: session.sub }, data: { logoUrl: null } });
  return NextResponse.json({ ok: true });
}
