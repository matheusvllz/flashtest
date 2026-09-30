/**
 * Rate limit das funções do Foca (docs/seguranca/modelo-de-ameacas.md T1/T8; ADR 0005: sem Redis).
 * Janela fixa em Postgres, na mesma tabela `rate_limit` do Better Auth, com chaves prefixadas
 * `foca:` para não colidir. Uma única instrução atômica (upsert) por verificação: funciona com
 * várias instâncias serverless ao mesmo tempo.
 */
import { sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Banco } from "./db/client";
import { rateLimit } from "./db/schema";
import { ErroApp } from "./http";

/**
 * Conta mais uma chamada de `chave` na janela de `janelaSeg` segundos. Passou de `maximo`,
 * lança 429. Devolve quantas chamadas a janela já tem.
 */
export async function limitar(db: Banco, chave: string, janelaSeg: number, maximo: number, agora = Date.now()): Promise<number> {
  const k = `foca:${chave}`;
  const inicioJanela = agora - janelaSeg * 1000;
  const [linha] = await db
    .insert(rateLimit)
    .values({ id: randomUUID(), key: k, count: 1, lastRequest: agora })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        // Janela vencida: recomeça em 1; senão soma. `last_request` guarda o início da janela.
        count: sql`case when ${rateLimit.lastRequest} < ${inicioJanela} then 1 else ${rateLimit.count} + 1 end`,
        lastRequest: sql`case when ${rateLimit.lastRequest} < ${inicioJanela} then ${agora} else ${rateLimit.lastRequest} end`,
      },
    })
    .returning({ count: rateLimit.count });
  const n = linha?.count ?? 1;
  if (n > maximo) throw new ErroApp(429, "LIMITE_EXCEDIDO");
  return n;
}
