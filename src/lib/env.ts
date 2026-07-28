import { z } from "zod";

/**
 * Validação das variáveis de ambiente no servidor.
 * Falha cedo e de forma clara se algo obrigatório estiver ausente.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Opcional em dev/preview: sem banco, o formulário apenas registra em log.
  DATABASE_URL: z.string().url().optional(),
  // Área do Membro: obrigatórias em produção para login funcionar (ver lib/session.ts).
  SESSION_SECRET: z.string().min(16).optional(),
  ADMIN_PASSWORD: z.string().min(6).optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export const hasDatabase = Boolean(env.DATABASE_URL);
