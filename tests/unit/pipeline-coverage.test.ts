import { describe, expect, test } from "bun:test";
import { computeCoverage, formatCoverageReport } from "../../scripts/content/coverage";

/**
 * Cobertura de conteúdo (docs/30 §19.2, Fase 9 F9.4) — catálogo de fixture,
 * sem tocar no catálogo real (o script em si já é exercitado como smoke
 * test via `bun run scripts/content/coverage.ts`).
 */

describe("computeCoverage", () => {
  test("ignora habilidades 'planejado'", () => {
    const cov = computeCoverage(
      [
        { id: "mat:a", status: "ativo" },
        { id: "mat:b", status: "planejado" },
      ],
      [],
      new Set(),
    );
    expect(cov.map((c) => c.skillId)).toEqual(["mat:a"]);
  });

  test("conta itens por dificuldade e por papel corretamente", () => {
    const cov = computeCoverage(
      [{ id: "mat:a", status: "ativo" }],
      [
        { skillId: "mat:a", difficulty: 2, roles: ["pratica"], validationStatus: "revisada-humano" },
        { skillId: "mat:a", difficulty: 2, roles: ["pratica", "revisao"], validationStatus: "revisada-humano" },
        { skillId: "mat:a", difficulty: 4, roles: ["desafio"], validationStatus: "verificada-ia" },
      ],
      new Set(),
    );
    expect(cov[0].itemsByDifficulty[2]).toBe(2);
    expect(cov[0].itemsByDifficulty[4]).toBe(1);
    expect(cov[0].itemsByRole.pratica).toBe(2);
    expect(cov[0].itemsByRole.revisao).toBe(1);
    expect(cov[0].itemsByRole.desafio).toBe(1);
  });

  test("só conta diagnóstico revisado quando papel inclui diagnostico E status é revisada-humano/oficial-conferida", () => {
    const cov = computeCoverage(
      [{ id: "mat:a", status: "ativo" }],
      [
        { skillId: "mat:a", difficulty: 2, roles: ["diagnostico"], validationStatus: "revisada-humano" },
        { skillId: "mat:a", difficulty: 2, roles: ["diagnostico"], validationStatus: "oficial-conferida" },
        { skillId: "mat:a", difficulty: 2, roles: ["diagnostico"], validationStatus: "verificada-ia" }, // não conta
        { skillId: "mat:a", difficulty: 2, roles: ["pratica"], validationStatus: "revisada-humano" }, // não é diagnostico
      ],
      new Set(),
    );
    expect(cov[0].diagnosticReviewed).toBe(2);
  });

  test("hasLesson reflete o set passado", () => {
    const cov = computeCoverage([{ id: "mat:a", status: "ativo" }], [], new Set(["mat:a"]));
    expect(cov[0].hasLesson).toBe(true);
  });

  test("habilidade sem nenhum item tem todos os contadores zerados", () => {
    const cov = computeCoverage([{ id: "mat:a", status: "ativo" }], [], new Set());
    expect(Object.values(cov[0].itemsByDifficulty).every((n) => n === 0)).toBe(true);
    expect(Object.values(cov[0].itemsByRole).every((n) => n === 0)).toBe(true);
  });
});

describe("formatCoverageReport", () => {
  test("lista habilidades sem aula E sem nenhum item", () => {
    const cov = computeCoverage(
      [
        { id: "mat:vazia", status: "ativo" },
        { id: "mat:com-aula", status: "ativo" },
      ],
      [],
      new Set(["mat:com-aula"]),
    );
    const relatorio = formatCoverageReport(cov);
    expect(relatorio).toContain("mat:vazia");
    expect(relatorio).not.toMatch(/1 habilidade\(s\).*mat:com-aula/);
  });

  test("gera uma tabela markdown com cabeçalho", () => {
    const cov = computeCoverage([{ id: "mat:a", status: "ativo" }], [], new Set());
    const relatorio = formatCoverageReport(cov);
    expect(relatorio).toContain("| Habilidade | Aula |");
    expect(relatorio).toContain("mat:a");
  });
});
