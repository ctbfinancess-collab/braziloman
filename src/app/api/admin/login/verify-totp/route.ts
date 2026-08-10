import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { verifyTotpCode } from "@/lib/totp";
import { signAdminSession, verifyAdminTwoFaPending, ADMIN_COOKIE, adminCookieOptions } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Passo 2 do login com conta individual + 2FA: recebe o "pendingToken" (que
 *  prova que a senha já foi conferida) e o código de 6 dígitos do Authenticator. */
export async function POST(req: Request) {
  const ip = clientIp(req);

  // Só 6 dígitos possíveis (1M combinações) — limite bem mais rígido que o
  // login por senha, senão dá pra tentar força bruta num código só.
  const { ok } = rateLimit(`admin-verify-totp:${ip}`, { limit: 8, windowMs: 5 * 60_000 });
  if (!ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 }
    );
  }

  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { pendingToken, code } = (body ?? {}) as { pendingToken?: string; code?: string };
  if (!pendingToken || !code) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 422 });
  }

  const pending = await verifyAdminTwoFaPending(pendingToken);
  if (!pending) {
    return NextResponse.json({ error: "Sessão de login expirada. Entre com a senha novamente." }, { status: 401 });
  }

  const user = await prisma.adminUser.findUnique({ where: { id: pending.sub } });
  if (!user || !user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: "2FA não está mais ativo nessa conta." }, { status: 401 });
  }

  const valid = await verifyTotpCode(user.totpSecret, code);
  if (!valid) {
    return NextResponse.json({ error: "Código inválido." }, { status: 401 });
  }

  const token = await signAdminSession(user.id);
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}
