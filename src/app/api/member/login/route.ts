import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { memberLoginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { signMemberSession, MEMBER_COOKIE, memberCookieOptions } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  const { ok } = rateLimit(`member-login:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  if (!prisma) {
    return NextResponse.json(
      { error: "Login indisponível: banco de dados não configurado." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = memberLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, password } = parsed.data;

  const application = await prisma.membershipApplication.findUnique({
    where: { email },
  });

  if (!application || !application.passwordHash) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const validPassword = await bcrypt.compare(password, application.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  if (application.status === "PENDING") {
    return NextResponse.json(
      { error: "Sua associação ainda está em análise. Avisaremos por e-mail assim que for aprovada." },
      { status: 403 }
    );
  }
  if (application.status === "REJECTED") {
    return NextResponse.json(
      { error: "Sua solicitação de associação não foi aprovada. Entre em contato para mais informações." },
      { status: 403 }
    );
  }

  const token = await signMemberSession(application.id);

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(MEMBER_COOKIE, token, memberCookieOptions);
  return res;
}
