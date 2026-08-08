import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const notices = await prisma.chamberNotice.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ notices });
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  important: z.boolean().optional(),
  imageUrl: z.string().max(500).optional().nullable(),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const notice = await prisma.chamberNotice.create({
    data: {
      title: parsed.data.title,
      message: parsed.data.message,
      important: parsed.data.important ?? false,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
  return NextResponse.json({ ok: true, notice });
}
