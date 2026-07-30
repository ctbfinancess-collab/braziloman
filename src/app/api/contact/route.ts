import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { sendNewContactMessageEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  // 1) Rate limit por IP.
  const { ok } = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  // 2) Parse + validação.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { website, ...data } = parsed.data;

  // 3) Honeypot: se preenchido, finge sucesso (não vaza que detectamos o bot).
  if (website) return NextResponse.json({ ok: true });

  // 4) Persiste se houver banco; caso contrário, apenas registra em log.
  try {
    if (prisma) {
      await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          company: data.company || null,
          message: data.message,
          locale: data.locale ?? "pt",
          ip,
        },
      });
    } else {
      console.info("[contact] (sem banco) nova mensagem:", {
        name: data.name,
        email: data.email,
        company: data.company,
      });
    }
  } catch (err) {
    console.error("[contact] erro ao salvar:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

  try {
    await sendNewContactMessageEmail({
      name: data.name,
      email: data.email,
      company: data.company,
      message: data.message,
    });
  } catch (err) {
    console.error("[contact] erro ao enviar e-mail de notificação:", err);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
