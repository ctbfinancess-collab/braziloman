import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";
import { content } from "@/lib/content";
import { computeDiff, invalidateContentCache } from "@/lib/contentOverrides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Retorna os padrões (content.ts) e o efetivo (padrões + substituições) para o editor. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
  }

  const row = await prisma.siteContent.findUnique({ where: { id: "singleton" } });
  const overrides = (row?.data ?? {}) as { pt?: unknown; en?: unknown };

  return NextResponse.json({
    defaults: content,
    overrides: { pt: overrides.pt ?? {}, en: overrides.en ?? {} },
  });
}

/** Recebe a árvore completa editada (pt+en) e salva só a diferença em relação aos padrões. */
export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { pt, en } = (body ?? {}) as { pt?: unknown; en?: unknown };

  const diffPt = computeDiff(content.pt, pt ?? content.pt);
  const diffEn = computeDiff(content.en, en ?? content.en);

  await prisma.siteContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", data: { pt: diffPt ?? {}, en: diffEn ?? {} } },
    update: { data: { pt: diffPt ?? {}, en: diffEn ?? {} } },
  });

  invalidateContentCache();

  return NextResponse.json({ ok: true });
}

/** Restaura tudo para os padrões (apaga todas as substituições). */
export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
  }

  await prisma.siteContent.deleteMany({ where: { id: "singleton" } });
  invalidateContentCache();

  return NextResponse.json({ ok: true });
}
