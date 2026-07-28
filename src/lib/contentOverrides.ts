import { prisma } from "./prisma";
import { content } from "./content";
import { deepMerge } from "./contentMerge";

export { computeDiff } from "./contentMerge";

type ContentTree = typeof content;

let cache: { value: ContentTree; expiresAt: number } | null = null;
const CACHE_MS = 15_000;

/** Conteúdo efetivo (padrões de content.ts + substituições salvas pelo admin). */
export async function getEffectiveContent(): Promise<ContentTree> {
  if (!prisma) return content;
  if (cache && cache.expiresAt > Date.now()) return cache.value;

  try {
    const row = await prisma.siteContent.findUnique({ where: { id: "singleton" } });
    const overrides = (row?.data ?? {}) as { pt?: unknown; en?: unknown };
    const value: ContentTree = {
      pt: deepMerge(content.pt, overrides.pt),
      en: deepMerge(content.en, overrides.en),
    };
    cache = { value, expiresAt: Date.now() + CACHE_MS };
    return value;
  } catch (err) {
    console.error("[contentOverrides] erro ao carregar substituições:", err);
    return content;
  }
}

export function invalidateContentCache() {
  cache = null;
}
