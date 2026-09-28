import type { ItemMeta } from "../types";

/**
 * Metadado por item dos ~38 exercícios locais das 6 microlições autorais
 * (docs/30 §8.4, Fase 3 T-3.3 — corrige P3: habilidade por ITEM, não por
 * lição inteira). `role`/`difficulty` copiados de `steps[]` em
 * `src/content/microlicoes/{materia}/*.ts` (checkpoint/prática/desafio) ou
 * de `reviewExerciseIds` (revisão) — não são um chute; são exatamente os
 * valores já declarados no conteúdo. `skillId` escolhido pela habilidade
 * mais específica que o próprio texto do exercício testa dentro do par de
 * habilidades da lição (ex.: "checkpoint" de porcentagem-valor testa o
 * CONCEITO de porcentagem; "pratica-2" já pede o VALOR calculado).
 */

const AUTORAL_REVISADO: Pick<ItemMeta, "source" | "validation" | "dontKnowAllowed"> = {
  source: { kind: "autoral" },
  validation: { status: "revisada-humano", reviewer: "autoria-legada" },
  dontKnowAllowed: true,
};

function item(
  id: string,
  skillId: string,
  difficulty: 1 | 2 | 3,
  roles: ItemMeta["roles"],
): ItemMeta {
  return {
    id,
    version: 1,
    skillIds: [skillId],
    difficulty,
    irt: { a: 1.0, b: { 1: -1.6, 2: 0, 3: 0.8 }[difficulty], c: difficulty <= 2 ? 0.25 : 0.2, source: "estimado" },
    roles,
    estimatedSeconds: { 1: 30, 2: 45, 3: 60 }[difficulty],
    examProfiles: ["enem"],
    ...AUTORAL_REVISADO,
  };
}

export const ITEM_META_MICROLICOES: Record<string, ItemMeta> = Object.fromEntries(
  [
    // --- mat:porcentagem-valor ---
    item("mc:porcentagem-valor:checkpoint", "mat:porcentagem-conceito", 1, ["pratica"]),
    item("mc:porcentagem-valor:pratica-2", "mat:porcentagem-valor", 2, ["pratica", "revisao"]),
    item("mc:porcentagem-valor:pratica-3", "mat:porcentagem-valor", 2, ["pratica", "revisao"]),
    item("mc:porcentagem-valor:desafio", "mat:porcentagem-valor", 3, ["desafio"]),
    item("mc:porcentagem-valor:revisao-1", "mat:porcentagem-conceito", 2, ["revisao"]),
    item("mc:porcentagem-valor:revisao-2", "mat:porcentagem-valor", 2, ["revisao"]),
    // --- mat:porcentagem-aumento-desconto ---
    item("mc:porcentagem-aumento-desconto:checkpoint", "mat:porcentagem-fator-multiplicativo", 1, ["pratica"]),
    item("mc:porcentagem-aumento-desconto:pratica-1", "mat:porcentagem-fator-multiplicativo", 1, [
      "pratica",
      "revisao",
    ]),
    item("mc:porcentagem-aumento-desconto:pratica-2", "mat:porcentagem-fator-multiplicativo", 2, [
      "pratica",
      "revisao",
    ]),
    item("mc:porcentagem-aumento-desconto:pratica-3", "mat:porcentagem-fator-multiplicativo", 2, [
      "pratica",
      "revisao",
    ]),
    item("mc:porcentagem-aumento-desconto:desafio", "mat:porcentagem-fator-multiplicativo", 3, ["desafio"]),
    item("mc:porcentagem-aumento-desconto:revisao-1", "mat:porcentagem-fator-multiplicativo", 2, ["revisao"]),
    item("mc:porcentagem-aumento-desconto:revisao-2", "mat:porcentagem-fator-multiplicativo", 2, ["revisao"]),
    // --- por:crase-quando-usar ---
    item("mc:crase-quando-usar:checkpoint", "por:crase-regra-basica", 1, ["pratica"]),
    item("mc:crase-quando-usar:pratica-2", "por:crase-regra-basica", 2, ["pratica", "revisao"]),
    item("mc:crase-quando-usar:pratica-3", "por:crase-regra-basica", 2, ["pratica", "revisao"]),
    item("mc:crase-quando-usar:desafio", "por:crase-regra-basica", 3, ["desafio"]),
    item("mc:crase-quando-usar:revisao-1", "por:crase-regra-basica", 2, ["revisao"]),
    item("mc:crase-quando-usar:revisao-2", "por:crase-regra-basica", 2, ["revisao"]),
    // --- por:crase-proibida ---
    item("mc:crase-proibida:checkpoint", "por:crase-casos-proibidos", 1, ["pratica"]),
    item("mc:crase-proibida:pratica-1", "por:crase-casos-proibidos", 1, ["pratica", "revisao"]),
    item("mc:crase-proibida:pratica-2", "por:crase-casos-proibidos", 2, ["pratica", "revisao"]),
    item("mc:crase-proibida:pratica-3", "por:crase-casos-proibidos", 2, ["pratica", "revisao"]),
    item("mc:crase-proibida:desafio", "por:crase-casos-proibidos", 3, ["desafio"]),
    item("mc:crase-proibida:revisao-1", "por:crase-casos-proibidos", 2, ["revisao"]),
    item("mc:crase-proibida:revisao-2", "por:crase-casos-proibidos", 2, ["revisao"]),
    // --- bio:citologia-membrana ---
    item("mc:citologia-membrana:checkpoint", "bio:membrana-estrutura", 1, ["pratica"]),
    item("mc:citologia-membrana:pratica-1", "bio:membrana-estrutura", 1, ["pratica", "revisao"]),
    item("mc:citologia-membrana:pratica-2", "bio:membrana-funcao", 2, ["pratica", "revisao"]),
    item("mc:citologia-membrana:pratica-3", "bio:membrana-funcao", 2, ["pratica", "revisao"]),
    item("mc:citologia-membrana:desafio", "bio:membrana-funcao", 3, ["desafio"]),
    item("mc:citologia-membrana:revisao-1", "bio:membrana-estrutura", 2, ["revisao"]),
    item("mc:citologia-membrana:revisao-2", "bio:membrana-funcao", 2, ["revisao"]),
    // --- bio:citologia-organelas ---
    item("mc:citologia-organelas:checkpoint", "bio:organelas-funcao", 1, ["pratica"]),
    item("mc:citologia-organelas:pratica-3", "bio:organelas-funcao", 2, ["pratica", "revisao"]),
    item("mc:citologia-organelas:desafio", "bio:organelas-funcao", 3, ["desafio"]),
    item("mc:citologia-organelas:revisao-1", "bio:organelas-funcao", 2, ["revisao"]),
    item("mc:citologia-organelas:revisao-2", "bio:organelas-funcao", 2, ["revisao"]),
  ].map((m) => [m.id, m]),
);
