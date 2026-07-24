import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env, hasDatabase } from "./env";

/**
 * Cliente Prisma como singleton (evita múltiplas conexões no dev / hot reload).
 * Prisma 7 usa driver adapter (pg) — a conexão é passada no construtor.
 * Retorna null quando não há DATABASE_URL: o site funciona sem banco.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient | null = hasDatabase
  ? globalForPrisma.prisma ?? createClient()
  : null;

if (hasDatabase && env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
