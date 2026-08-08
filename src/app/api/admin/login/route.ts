import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminLoginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { signAdminSession, signAdminTwoFaPending, ADMIN_COOKIE, adminCookieOptions } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  const { ok } = rateLimit(`admin-login:${ip}`, { limit: 6, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Informe a senha" }, { status: 422 });
  }

  // Login por conta individual (e-mail + senha), cadastrada em Usuários.
  if (parsed.data.email) {
    if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
    const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    // Conta com 2FA ativo: senha confere, mas a sessão só é liberada depois
    // do código do Authenticator (ver /api/admin/login/verify-totp).
    if (user.totpEnabled) {
      const pendingToken = await signAdminTwoFaPending(user.id);
      return NextResponse.json({ needsTotp: true, pendingToken });
    }

    const token = await signAdminSession(user.id);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
    return res;
  }

  // Login "mestre" — senha única compartilhada (ADMIN_PASSWORD).
  if (!env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Login de administrador não configurado (ADMIN_PASSWORD ausente)." },
      { status: 503 }
    );
  }
  if (parsed.data.password !== env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const token = await signAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}
