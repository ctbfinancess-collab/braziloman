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
  // E-mails transacionais (Resend): sem a chave, o site funciona normalmente,
  // só não envia e-mails automáticos (ver lib/email.ts).
  RESEND_API_KEY: z.string().optional(),
  // Armazenamento de mídia (Cloudflare R2, compatível com S3). Sem essas
  // variáveis, o upload de imagens no painel de conteúdo fica desabilitado.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),
  // Bucket privado (sem domínio público) para documentos sensíveis do Portal
  // do Candidato — acesso só via link assinado de curta duração.
  R2_DOCUMENTS_BUCKET: z.string().optional(),
  // Resumo de compliance por IA (Claude). Sem a chave, o botão "Gerar resumo
  // com IA" no admin apenas avisa que não está configurado.
  ANTHROPIC_API_KEY: z.string().optional(),
  // Login com Google (Área do Membro). Sem essas variáveis, o botão
  // "Continuar com Google" fica escondido — ver console.cloud.google.com
  // (APIs & Services > Credentials > OAuth client ID > Web application).
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export const hasDatabase = Boolean(env.DATABASE_URL);
export const hasEmail = Boolean(env.RESEND_API_KEY);
export const hasMedia = Boolean(
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET && env.R2_PUBLIC_URL
);
export const hasDocumentStorage = Boolean(
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_DOCUMENTS_BUCKET
);
export const hasAiSummary = Boolean(env.ANTHROPIC_API_KEY);
export const hasGoogleLogin = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
