import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

/** Troca de senha para o associado já logado (diferente do fluxo "esqueci minha senha", que usa token por e-mail). */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { ok } = rateLimit(`member-change-password:${session.sub}`, { limit: 6, windowMs: 60_000 });
  if (!ok) return NextResponse.json({ error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const application = await prisma.membershipApplication.findUnique({
    where: { id: session.sub },
    select: { passwordHash: true },
  });
  if (!application?.passwordHash) return NextResponse.json({ error: "Não foi possível alterar a senha." }, { status: 400 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, application.passwordHash);
  if (!valid) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.membershipApplication.update({ where: { id: session.sub }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
