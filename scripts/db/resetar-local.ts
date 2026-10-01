/**
 * Zera o banco LOCAL de desenvolvimento (PGlite em `.data/pglite`), para começar do esquema limpo
 * (docs/specs/46-producao T-04.3; o script era citado no package.json e não existia — spec 48 DV48-02).
 *
 *   bun run db:reset:local
 *
 * Só apaga a pasta do PGlite. Recusa se `DATABASE_URL` apontar para um Postgres de verdade (Neon ou outro):
 * este script nunca toca banco remoto. A caixa de saída de e-mail (`.data/emails/`) fica.
 */
import { existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const url = process.env.DATABASE_URL?.trim();
if (url && !url.startsWith("pglite:")) {
  console.error("recusado: DATABASE_URL aponta para um Postgres remoto; este script só zera o PGlite local");
  process.exit(2);
}
const raiz = resolve(import.meta.dir, "..", "..");
const alvo = url ? resolve(raiz, url.slice("pglite:".length)) : join(raiz, ".data", "pglite");
if (!alvo.startsWith(join(raiz, ".data"))) {
  console.error("recusado: o banco local precisa estar dentro de .data/");
  process.exit(2);
}
if (!existsSync(alvo)) {
  console.log(`nada a apagar (${alvo} não existe)`);
} else {
  rmSync(alvo, { recursive: true, force: true });
  console.log(`banco local apagado: ${alvo}. Ele é recriado e migrado na próxima requisição do bun run dev.`);
}
