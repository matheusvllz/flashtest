/**
 * Conexão com o banco (docs/specs/46-producao T-04.3; ADR 0005).
 *
 * - `pglite:memoria` → Postgres em processo, em memória (testes).
 * - `pglite:<pasta>` → Postgres em processo, gravado em disco (desenvolvimento local; `.data/` é ignorado pelo Git).
 * - `postgres://…` / `postgresql://…` → Neon (preview e produção), pelo driver serverless com Pool
 *   (WebSocket), que suporta transação interativa.
 *
 * No PGlite as migrações de `drizzle/` são aplicadas na primeira conexão; em preview e produção elas
 * rodam fora do app, pela conexão direta (`bun run db:migrate`, docs/operacao/ambientes-e-deploy.md §5).
 */
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { env } from "../env";
import * as schema from "./schema";

export type Banco = PgDatabase<PgQueryResultHKT, typeof schema>;

let conexao: Promise<Banco> | undefined;

async function abrir(url: string): Promise<Banco> {
  if (url.startsWith("pglite:")) {
    const alvo = url.slice("pglite:".length);
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const emMemoria = alvo === "memoria" || alvo === "";
    if (!emMemoria) await mkdir(dirname(alvo), { recursive: true });
    const cliente = emMemoria ? new PGlite() : new PGlite(alvo);
    const db = drizzle(cliente, { schema });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    return db as unknown as Banco;
  }
  if (/^postgres(ql)?:\/\//.test(url)) {
    const { Pool } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-serverless");
    return drizzle({ client: new Pool({ connectionString: url }), schema }) as unknown as Banco;
  }
  throw new Error("[db] DATABASE_URL não reconhecida (esperado pglite:… ou postgres://…)");
}

/** A conexão do processo (criada na primeira chamada). */
export function banco(): Promise<Banco> {
  conexao ??= abrir(env().DATABASE_URL);
  return conexao;
}

/** Só para testes: abre um banco novo, isolado (PGlite em memória, migrado). */
export async function bancoDeTeste(): Promise<Banco> {
  return abrir("pglite:memoria");
}

/** Só para testes: troca a conexão do processo (ex.: por um `bancoDeTeste()`). */
export function definirBanco(db: Banco | undefined): void {
  conexao = db ? Promise.resolve(db) : undefined;
}
