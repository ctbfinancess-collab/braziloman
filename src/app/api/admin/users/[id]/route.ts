import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isFullAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().max(200).optional(),
  // Em branco = mantém a senha atual (o formulário de edição manda vazio
  // quando o admin não quer trocar a senha nessa vez).
  password: z.string().max(200).optional(),
  role: z.enum(["FULL", "PARTNERS_BENEFITS"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isFullAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  if (parsed.data.password && parsed.data.password.length < 6) {
    return NextResponse.json({ error: "Senha precisa ter pelo menos 6 caracteres." }, { status: 422 });
  }

  const { password, email, ...rest } = parsed.data;
  if (email) {
    const normalized = email.toLowerCase();
    const existing = await prisma.adminUser.findUnique({ where: { email: normalized } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Já existe um usuário com esse e-mail." }, { status: 409 });
    }
  }

  try {
    const user = await prisma.adminUser.update({
      where: { id },
      data: {
        ...rest,
        ...(email ? { email: email.toLowerCase() } : {}),
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isFullAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;
  try {
    await prisma.adminUser.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
}
