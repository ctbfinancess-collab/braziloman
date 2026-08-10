import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFullAdmin } from "@/lib/adminAuth";
import { content } from "@/lib/content";
import { computeDiff, invalidateContentCache } from "@/lib/contentOverrides";
import type { Json } from "@/lib/contentMerge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Retorna os padrões (content.ts) e o efetivo (padrões + substituições) para o editor. */
export async function GET() {
  if (!(await isFullAdmin())) {
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
  if (!(await isFullAdmin())) {
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

  const { pt, en, section } = (body ?? {}) as { pt?: unknown; en?: unknown; section?: string };

  if (section) {
    // Salva só a seção informada, preservando as substituições já salvas nas outras.
    const row = await prisma.siteContent.findUnique({ where: { id: "singleton" } });
    const existing = (row?.data ?? {}) as { pt?: Record<string, Json>; en?: Record<string, Json> };

    const sectionDiffPt = computeDiff((content.pt as Record<string, unknown>)[section], pt);
    const sectionDiffEn = computeDiff((content.en as Record<string, unknown>)[section], en);

    const nextPt: Record<string, Json> = { ...(existing.pt ?? {}) };
    const nextEn: Record<string, Json> = { ...(existing.en ?? {}) };
    if (sectionDiffPt === undefined) delete nextPt[section];
    else nextPt[section] = sectionDiffPt;
    if (sectionDiffEn === undefined) delete nextEn[section];
    else nextEn[section] = sectionDiffEn;

    await prisma.siteContent.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", data: { pt: nextPt, en: nextEn } },
      update: { data: { pt: nextPt, en: nextEn } },
    });

    invalidateContentCache();
    return NextResponse.json({ ok: true });
  }

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
  if (!(await isFullAdmin())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
  }

  await prisma.siteContent.deleteMany({ where: { id: "singleton" } });
  invalidateContentCache();

  return NextResponse.json({ ok: true });
}
