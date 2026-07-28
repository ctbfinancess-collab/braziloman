import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { membershipSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

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
  const { ok } = rateLimit(`membership:${ip}`, { limit: 5, windowMs: 60_000 });
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

  const parsed = membershipSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { website, password, confirmPassword: _confirmPassword, ...data } = parsed.data;

  // 3) Honeypot: se preenchido, finge sucesso (não vaza que detectamos o bot).
  if (website) return NextResponse.json({ ok: true });

  // 4) Persiste se houver banco; caso contrário, apenas registra em log.
  try {
    if (prisma) {
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.membershipApplication.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          company: data.company,
          role: data.role || null,
          sector: data.sector || null,
          country: data.country || null,
          phone: data.phone || null,
          message: data.message || null,
        },
      });
    } else {
      console.info("[membership] (sem banco) novo pedido de associação:", {
        name: data.name,
        email: data.email,
        company: data.company,
      });
    }
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Já existe um cadastro com este e-mail." },
        { status: 409 }
      );
    }
    console.error("[membership] erro ao salvar:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
