/**
 * Operação do banco no Neon (spec 48 T-48.0.4, T-48.0.6; ADR 0007). Usa a CLI `neon` já autenticada
 * (`neon auth`) para obter as conexões — elas nunca são impressas nem gravadas por este script.
 *
 *   bun scripts/db/neon.ts plano     --branch dev        # migrações pendentes (somente leitura)
 *   bun scripts/db/neon.ts verificar --branch dev        # tabelas e migrações aplicadas (somente leitura)
 *   bun scripts/db/neon.ts migrar    --branch dev        # aplica drizzle/ pela conexão direta
 *   bun scripts/db/neon.ts migrar    --branch production --confirmar-producao
 *   bun scripts/db/neon.ts testar                        # branch temporária (filha de dev, expira em 2 h),
 *                                                        # migra e roda tests/neon contra ela
 *
 * Regras: nunca rodar teste nem criar dado na `production` (spec 48 D48-03); migração só aditiva (revisar o SQL);
 * este script não apaga branch nem tabela. A branch temporária expira sozinha (`--expires-at`).
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const PROJETO = "billowing-bread-71576526";
const RAIZ = resolve(import.meta.dir, "..", "..");
const PASTA = join(RAIZ, "drizzle");

const [comando, ...resto] = process.argv.slice(2);
const opcao = (nome: string) => {
  const i = resto.indexOf(`--${nome}`);
  return i >= 0 ? resto[i + 1] : undefined;
};
const tem = (nome: string) => resto.includes(`--${nome}`);

function neon(args: string[]): string {
  const r = spawnSync("neon", [...args, "--project-id", PROJETO], {
    encoding: "utf8",
    shell: process.platform === "win32",
    env: { ...process.env, NO_UPDATE_NOTIFIER: "1" },
  });
  if (r.status !== 0) {
    // stderr da CLI não traz segredo, mas nunca repassamos stdout (pode conter a conexão).
    throw new Error(`neon ${args[0]} ${args[1] ?? ""} falhou: ${(r.stderr || "").trim().slice(0, 300)}`);
  }
  return r.stdout.trim();
}

/** Nome de branch seguro para a linha de comando (no Windows a CLI roda pelo `cmd`). */
function branchValida(b: string | undefined): string | undefined {
  return b && /^[\w-]{1,64}$/.test(b) ? b : undefined;
}

function conexao(branch: string, pooled: boolean): string {
  if (!branchValida(branch)) throw new Error("nome de branch inválido");
  const url = neon(["connection-string", branch, ...(pooled ? ["--pooled"] : [])]);
  if (!/^postgres(ql)?:\/\//.test(url)) throw new Error("a CLI não devolveu uma conexão Postgres");
  return url;
}

interface Entrada {
  tag: string;
  when: number;
}
const diario = (): Entrada[] => JSON.parse(readFileSync(join(PASTA, "meta", "_journal.json"), "utf8")).entries;

async function comPool<T>(url: string, f: (q: (sql: string) => Promise<Record<string, unknown>[]>) => Promise<T>): Promise<T> {
  const { Pool } = await import("@neondatabase/serverless");
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    return await f(async (sql) => (await pool.query(sql)).rows as Record<string, unknown>[]);
  } finally {
    await pool.end();
  }
}

async function aplicadas(url: string): Promise<number[]> {
  return comPool(url, async (q) => {
    const [existe] = await q(`select to_regclass('drizzle.__drizzle_migrations') is not null as ok`);
    if (!existe?.ok) return [];
    return (await q(`select created_at from drizzle.__drizzle_migrations order by created_at`)).map((r) => Number(r.created_at));
  });
}

async function pendentes(url: string): Promise<Entrada[]> {
  const feitas = new Set(await aplicadas(url));
  return diario().filter((e) => !feitas.has(e.when));
}

async function migrar(branch: string): Promise<void> {
  const url = conexao(branch, false); // direta, nunca o pooler
  const falta = await pendentes(url);
  console.log(`branch ${branch}: ${falta.length} migração(ões) pendente(s)${falta.length ? ": " + falta.map((e) => e.tag).join(", ") : ""}`);
  if (!falta.length) return;
  const { Pool } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-serverless");
  const { migrate } = await import("drizzle-orm/neon-serverless/migrator");
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    await migrate(drizzle({ client: pool }), { migrationsFolder: PASTA });
  } finally {
    await pool.end();
  }
  console.log(`branch ${branch}: aplicadas ${falta.map((e) => e.tag).join(", ")}`);
}

async function verificar(branch: string): Promise<void> {
  const url = conexao(branch, false);
  const resumo = await comPool(url, async (q) => {
    const tabelas = (await q(`select table_name from information_schema.tables where table_schema = 'public' order by 1`)).map((r) => String(r.table_name));
    const versao = String((await q(`select current_setting('server_version') as v`))[0]?.v ?? "?");
    return { tabelas, versao };
  });
  const feitas = await aplicadas(url);
  const falta = diario().filter((e) => !feitas.includes(e.when));
  console.log(`branch ${branch} · Postgres ${resumo.versao}`);
  console.log(`migrações aplicadas: ${feitas.length}/${diario().length}${falta.length ? ` (pendentes: ${falta.map((e) => e.tag).join(", ")})` : ""}`);
  console.log(`tabelas em public (${resumo.tabelas.length}): ${resumo.tabelas.join(", ")}`);
}

async function testar(): Promise<number> {
  const nome = `teste-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}`;
  const expira = new Date(Date.now() + 2 * 3600_000).toISOString().replace(/\.\d+Z$/, "Z");
  neon(["branches", "create", "--name", nome, "--parent", "dev", "--expires-at", expira, "--no-secrets", "-o", "json"]);
  console.log(`branch temporária ${nome} (filha de dev, expira ${expira})`);
  await migrar(nome);
  const r = spawnSync("bun", ["test", "tests/neon"], {
    cwd: RAIZ,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, FOCA_TESTE_NEON_URL: conexao(nome, true), FOCA_TESTE_NEON_BRANCH: nome },
  });
  return r.status ?? 1;
}

async function principal(): Promise<number> {
  if (comando === "testar") return testar();
  const branch = branchValida(opcao("branch"));
  if (!branch || !["plano", "verificar", "migrar"].includes(comando ?? "")) {
    console.error("uso: bun scripts/db/neon.ts <plano|verificar|migrar> --branch <nome> | testar");
    return 2;
  }
  if (comando === "migrar" && branch === "production" && !tem("confirmar-producao")) {
    console.error("recusado: migrar a production exige --confirmar-producao (rode `plano --branch production` antes)");
    return 2;
  }
  if (comando === "plano") {
    const falta = await pendentes(conexao(branch, false));
    console.log(`branch ${branch}: ${falta.length ? falta.map((e) => e.tag).join(", ") : "nenhuma migração pendente"}`);
    for (const e of falta) console.log(`  drizzle/${e.tag}.sql`);
    return 0;
  }
  if (comando === "verificar") await verificar(branch);
  else await migrar(branch);
  return 0;
}

principal().then(
  (c) => process.exit(c),
  (e) => {
    console.error(String(e instanceof Error ? e.message : e).replace(/postgres(ql)?:\/\/\S+/g, "<conexão>"));
    process.exit(1);
  },
);
