import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

/**
 * Guarda arquitetural (docs/32, Fase 5 — achado real corrigido na mesma
 * sessão): `src/lib/store.ts` é importado por `AppShell` e por isso por
 * quase toda rota. Se ele voltar a importar diretamente qualquer módulo de
 * `@/content/{items,microlicoes,trilhas,taxonomy}`, o catálogo inteiro de
 * conteúdo (15 trilhas, ~580 KB minificados) entra no chunk compartilhado
 * de toda tela em vez de ficar isolado nas rotas que realmente precisam
 * dele — a mesma regressão de bundle já encontrada e corrigida aqui.
 *
 * Checagem estática e barata (grep no texto-fonte), não uma análise real de
 * grafo de módulos — suficiente pra pegar o erro óbvio (import direto) sem
 * o custo de rodar o bundler dentro do teste.
 */

const PROIBIDOS = [
  /from\s+["']@\/content\/items["']/,
  /from\s+["']@\/content\/items\//,
  /from\s+["']@\/content\/microlicoes["']/,
  /from\s+["']@\/content\/trilhas["']/,
  /from\s+["']@\/content\/taxonomy["']/,
];

test("src/lib/store.ts não importa módulos de conteúdo pesado (docs/30 §21.3, achado da Fase 5)", () => {
  const fonte = readFileSync("src/lib/store.ts", "utf-8");
  for (const padrao of PROIBIDOS) {
    expect(padrao.test(fonte), `store.ts não pode importar de ${padrao}`).toBe(false);
  }
});

describe("mesma regra pros outros arquivos importados por AppShell", () => {
  test("AppShell.tsx não importa @/content/trilhas nem @/content/microlicoes diretamente", () => {
    const fonte = readFileSync("src/components/AppShell.tsx", "utf-8");
    expect(/from\s+["']@\/content\/(trilhas|microlicoes)["']/.test(fonte)).toBe(false);
  });
});
