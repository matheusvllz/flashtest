/**
 * drizzle-kit (docs/specs/46-producao T-04.3). `bun run db:generate` gera o SQL versionado em
 * `drizzle/` a partir de `src/server/db/schema`; revise o SQL antes de aplicar.
 * `bun run db:migrate` aplica pela conexão DIRETA (`DATABASE_URL_UNPOOLED`), nunca pelo pooler.
 * Local (PGlite) as migrações são aplicadas sozinhas na primeira conexão (`src/server/db/client.ts`).
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
  strict: true,
});
