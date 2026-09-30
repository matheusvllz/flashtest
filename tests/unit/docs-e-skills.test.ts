/**
 * Guarda da organização do SDD (docs/specs/46-producao, T-01.8 e T-02.2/T-02.3):
 * nenhum link ou caminho quebrado na documentação, o espelho das skills igual à
 * fonte e a tabela de skills por agente em dia com o catálogo.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { divergencias } from "../../scripts/agents/sincronizar-skills";
import { gerarTabela } from "../../scripts/agents/tabela-skills";
import { verificar } from "../../scripts/docs/verificar-links";

describe("documentação", () => {
  test("nenhum link ou caminho quebrado (bun run docs:check)", () => {
    const problemas = verificar().map((p) => `${p.arquivo}:${p.linha} [${p.tipo}] ${p.detalhe}`);
    expect(problemas).toEqual([]);
  });
});

describe("skills para Claude e Codex", () => {
  test(".claude/skills espelha .agents/skills (bun run skills:sync)", () => {
    expect(divergencias()).toEqual([]);
  });

  test("a tabela de docs/ai/SKILLS.md está em dia com o catálogo (bun run skills:sync)", () => {
    const doc = readFileSync("docs/ai/SKILLS.md", "utf8").replace(/\r\n/g, "\n");
    expect(doc).toContain(gerarTabela());
  });
});
