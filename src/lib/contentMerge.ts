/**
 * Utilidades puras de mesclagem/diff de conteúdo — sem dependências de servidor,
 * podem ser importadas tanto no servidor (lib/contentOverrides.ts) quanto no
 * cliente (components/ContentEditor.tsx).
 */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Tree = Record<string, Json>;

/**
 * Mescla um override por cima de um valor padrão.
 * Arrays são substituídos por inteiro (não mescla item a item);
 * objetos são mesclados chave a chave; valores primitivos são substituídos.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (Array.isArray(override)) return override as T;
  if (
    override !== null &&
    typeof override === "object" &&
    base !== null &&
    typeof base === "object" &&
    !Array.isArray(base)
  ) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const key of Object.keys(override as Record<string, unknown>)) {
      out[key] = deepMerge((base as Record<string, unknown>)[key], (override as Record<string, unknown>)[key]);
    }
    return out as T;
  }
  return override as T;
}

/** Diferença mínima entre "draft" (estado editado no admin) e "base" (padrão de content.ts). */
export function computeDiff(base: unknown, draft: unknown): Json | undefined {
  if (Array.isArray(draft)) {
    return JSON.stringify(base) === JSON.stringify(draft) ? undefined : (draft as Json);
  }
  if (draft !== null && typeof draft === "object") {
    const out: Tree = {};
    for (const key of Object.keys(draft as Record<string, unknown>)) {
      const d = computeDiff(
        base !== null && typeof base === "object" ? (base as Record<string, unknown>)[key] : undefined,
        (draft as Record<string, unknown>)[key]
      );
      if (d !== undefined) out[key] = d;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return base === draft ? undefined : (draft as Json);
}
