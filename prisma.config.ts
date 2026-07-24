import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Configuração do Prisma 7.
 * A URL de conexão (usada por migrations) fica aqui, lida de DATABASE_URL.
 * Em runtime, o cliente usa o driver adapter (ver src/lib/prisma.ts).
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
