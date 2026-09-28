import { describe, expect, test } from "bun:test";
import type { SkillDef } from "@/content/taxonomy/types";
import { topologicalOrder, validateTaxonomy } from "@/content/taxonomy/validate";
import { SKILLS, SKILL_MAP, activeSkills, skillsOfSubject } from "@/content/taxonomy/index";
import { MICROLICOES } from "@/content/microlicoes";

function skill(overrides: Partial<SkillDef> & { id: string; subjectId: string; topicId: string }): SkillDef {
  return {
    area: "MT",
    name: "Habilidade de teste",
    prerequisites: [],
    core: false,
    incidence: 2,
    level: "base",
    status: "ativo",
    ...overrides,
  };
}

describe("validateTaxonomy", () => {
  test("taxonomia mínima válida não gera problema", () => {
    const skills = [
      skill({ id: "mat:a", subjectId: "mat", topicId: "arit" }),
      skill({ id: "mat:b", subjectId: "mat", topicId: "arit", prerequisites: ["mat:a"] }),
    ];
    expect(validateTaxonomy(skills)).toEqual([]);
  });

  test("detecta id duplicado", () => {
    const skills = [
      skill({ id: "mat:a", subjectId: "mat", topicId: "arit" }),
      skill({ id: "mat:a", subjectId: "mat", topicId: "arit" }),
    ];
    expect(validateTaxonomy(skills).some((i) => i.code === "id-duplicado")).toBe(true);
  });

  test("detecta formato de id inválido", () => {
    const skills = [skill({ id: "MAT_a", subjectId: "mat", topicId: "arit" })];
    expect(validateTaxonomy(skills).some((i) => i.code === "id-formato-invalido")).toBe(true);
  });

  test("detecta prefixo que não bate com subjectId", () => {
    const skills = [skill({ id: "por:a", subjectId: "mat", topicId: "arit" })];
    expect(validateTaxonomy(skills).some((i) => i.code === "prefixo-nao-bate-materia")).toBe(true);
  });

  test("detecta matéria inexistente", () => {
    const skills = [skill({ id: "xx:a", subjectId: "xx", topicId: "arit" })];
    expect(validateTaxonomy(skills).some((i) => i.code === "materia-inexistente")).toBe(true);
  });

  test("detecta tópico inexistente", () => {
    const skills = [skill({ id: "mat:a", subjectId: "mat", topicId: "nao-existe" })];
    expect(validateTaxonomy(skills).some((i) => i.code === "topico-inexistente")).toBe(true);
  });

  test("detecta area que não bate com a matéria", () => {
    const skills = [skill({ id: "mat:a", subjectId: "mat", topicId: "arit", area: "LC" })];
    expect(validateTaxonomy(skills).some((i) => i.code === "area-nao-bate")).toBe(true);
  });

  test("detecta pré-requisito inexistente", () => {
    const skills = [skill({ id: "mat:a", subjectId: "mat", topicId: "arit", prerequisites: ["mat:fantasma"] })];
    expect(validateTaxonomy(skills).some((i) => i.code === "pre-requisito-inexistente")).toBe(true);
  });

  test("detecta ciclo de pré-requisitos", () => {
    const skills = [
      skill({ id: "mat:a", subjectId: "mat", topicId: "arit", prerequisites: ["mat:b"] }),
      skill({ id: "mat:b", subjectId: "mat", topicId: "arit", prerequisites: ["mat:a"] }),
    ];
    const issues = validateTaxonomy(skills);
    expect(issues.some((i) => i.code === "ciclo")).toBe(true);
  });

  test("ciclo mais longo (3 nós) também é detectado", () => {
    const skills = [
      skill({ id: "mat:a", subjectId: "mat", topicId: "arit", prerequisites: ["mat:c"] }),
      skill({ id: "mat:b", subjectId: "mat", topicId: "arit", prerequisites: ["mat:a"] }),
      skill({ id: "mat:c", subjectId: "mat", topicId: "arit", prerequisites: ["mat:b"] }),
    ];
    expect(validateTaxonomy(skills).some((i) => i.code === "ciclo")).toBe(true);
  });

  test("habilidade ativa dependendo de core planejada é reprovada", () => {
    const skills = [
      skill({ id: "mat:base", subjectId: "mat", topicId: "arit", core: true, status: "planejado" }),
      skill({ id: "mat:avancada", subjectId: "mat", topicId: "arit", prerequisites: ["mat:base"], status: "ativo" }),
    ];
    expect(validateTaxonomy(skills).some((i) => i.code === "core-planejada-bloqueia-ativa")).toBe(true);
  });

  test("habilidade ativa dependendo de core ATIVA não é reprovada", () => {
    const skills = [
      skill({ id: "mat:base", subjectId: "mat", topicId: "arit", core: true, status: "ativo" }),
      skill({ id: "mat:avancada", subjectId: "mat", topicId: "arit", prerequisites: ["mat:base"], status: "ativo" }),
    ];
    expect(validateTaxonomy(skills).some((i) => i.code === "core-planejada-bloqueia-ativa")).toBe(false);
  });

  test("pré-requisito entre matérias é permitido", () => {
    const skills = [
      skill({ id: "mat:funcao-afim", subjectId: "mat", topicId: "f1" }),
      skill({
        id: "fis:mru",
        subjectId: "fis",
        topicId: "cin",
        area: "CN",
        prerequisites: ["mat:funcao-afim"],
      }),
    ];
    expect(validateTaxonomy(skills)).toEqual([]);
  });
});

describe("topologicalOrder", () => {
  test("pré-requisito sempre vem antes de quem depende dele", () => {
    const skills = [
      skill({ id: "mat:c", subjectId: "mat", topicId: "arit", prerequisites: ["mat:b"] }),
      skill({ id: "mat:a", subjectId: "mat", topicId: "arit" }),
      skill({ id: "mat:b", subjectId: "mat", topicId: "arit", prerequisites: ["mat:a"] }),
    ];
    const order = topologicalOrder(skills, "mat").map((s) => s.id);
    expect(order.indexOf("mat:a")).toBeLessThan(order.indexOf("mat:b"));
    expect(order.indexOf("mat:b")).toBeLessThan(order.indexOf("mat:c"));
  });

  test("desempate por posição do tópico, depois por id", () => {
    const skills = [
      skill({ id: "mat:z-razao", subjectId: "mat", topicId: "razao" }),
      skill({ id: "mat:a-arit", subjectId: "mat", topicId: "arit" }),
      skill({ id: "mat:b-arit", subjectId: "mat", topicId: "arit" }),
    ];
    const order = topologicalOrder(skills, "mat").map((s) => s.id);
    // "arit" vem antes de "razao" em SUBJECTS.mat.topics; dentro de "arit", ordem lexical.
    expect(order).toEqual(["mat:a-arit", "mat:b-arit", "mat:z-razao"]);
  });

  test("é determinística (mesma entrada, mesma saída)", () => {
    const skills = [
      skill({ id: "mat:c", subjectId: "mat", topicId: "arit", prerequisites: ["mat:b"] }),
      skill({ id: "mat:a", subjectId: "mat", topicId: "arit" }),
      skill({ id: "mat:b", subjectId: "mat", topicId: "arit", prerequisites: ["mat:a"] }),
    ];
    const o1 = topologicalOrder(skills, "mat").map((s) => s.id);
    const o2 = topologicalOrder(skills, "mat").map((s) => s.id);
    expect(o1).toEqual(o2);
  });
});

describe("taxonomia publicada (src/content/taxonomy)", () => {
  test("carrega sem lançar e sem problemas de validação", () => {
    expect(SKILLS.length).toBeGreaterThan(0);
  });

  test("toda skillId usada pelas microlições existe em SKILL_MAP", () => {
    const usadas = new Set(MICROLICOES.flatMap((l) => l.skillIds));
    for (const id of usadas) {
      expect(SKILL_MAP[id], `skillId "${id}" usada por uma microlição não está na taxonomia`).toBeDefined();
    }
  });

  test("entre 55 e 70 habilidades ativas", () => {
    const n = activeSkills().length;
    expect(n).toBeGreaterThanOrEqual(55);
    expect(n).toBeLessThanOrEqual(70);
  });

  test("áreas LC/MT/CN/CH têm pelo menos 12 habilidades ativas cada", () => {
    const porArea: Record<string, number> = {};
    for (const s of activeSkills()) porArea[s.area] = (porArea[s.area] ?? 0) + 1;
    for (const area of ["LC", "MT", "CN", "CH"] as const) {
      expect(porArea[area] ?? 0, `área ${area} tem poucas habilidades ativas`).toBeGreaterThanOrEqual(12);
    }
  });

  test("skillsOfSubject devolve só habilidades da matéria pedida", () => {
    for (const s of skillsOfSubject("mat")) {
      expect(s.subjectId).toBe("mat");
    }
  });
});
