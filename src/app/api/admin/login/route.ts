import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";
import { env } from "@/lib/env";
import { signAdminSession, ADMIN_COOKIE, adminCookieOptions } from "@/lib/session";

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

  if (!env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Login de administrador não configurado (ADMIN_PASSWORD ausente)." },
      { status: 503 }
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

  if (parsed.data.password !== env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const token = await signAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}
