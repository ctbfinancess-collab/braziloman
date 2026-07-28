import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { signPasswordResetToken } from "@/lib/session";
import { sendPasswordResetEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const { ok } = rateLimit(`forgot-password:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 422 });
  }

  // Sempre responde com a mesma mensagem genérica, exista ou não a conta —
  // evita revelar quais e-mails estão cadastrados.
  const genericResponse = NextResponse.json({ ok: true });

  if (!prisma) return genericResponse;

  const application = await prisma.membershipApplication.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  if (application?.passwordHash) {
    try {
      const token = await signPasswordResetToken(application.id);
      const resetUrl = `https://www.brasilomanchamber.org/membro/redefinir-senha?token=${token}`;
      await sendPasswordResetEmail(application.email, application.name, resetUrl);
    } catch (err) {
      console.error("[forgot-password] erro ao enviar e-mail:", err);
    }
  }

  return genericResponse;
}
