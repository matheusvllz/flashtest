import { describe, expect, test } from "bun:test";
import {
  computeAdditiveFields,
  CURRENT_SCHEMA_VERSION,
  ensureBackup,
  parseStoredState,
} from "@/lib/state-migrations";

describe("parseStoredState — parse protegido (docs/20 §15.3, item 2)", () => {
  test("JSON inválido não lança — vira parsed=null com aviso", () => {
    const { parsed, warning } = parseStoredState("{ isso não é json");
    expect(parsed).toBeNull();
    expect(warning).not.toBeNull();
  });

  test("array na raiz não é aceito como estado (forma inesperada)", () => {
    const { parsed, warning } = parseStoredState("[1,2,3]");
    expect(parsed).toBeNull();
    expect(warning).not.toBeNull();
  });

  test("null na raiz não é aceito", () => {
    const { parsed } = parseStoredState("null");
    expect(parsed).toBeNull();
  });

  test("objeto válido passa direto, sem aviso", () => {
    const { parsed, warning } = parseStoredState('{"progress":{"xp":100}}');
    expect(parsed).toEqual({ progress: { xp: 100 } });
    expect(warning).toBeNull();
  });
});

describe("ensureBackup — nunca sobrescreve (docs/20 §15.3, item 4)", () => {
  test("cria o backup na primeira vez", () => {
    const store = new Map<string, string>();
    const criado = ensureBackup(
      '{"xp":1}',
      (k) => store.get(k) ?? null,
      (k, v) => store.set(k, v),
    );
    expect(criado).toBe(true);
    expect(store.get("foca.state.backup.before-learning-v4")).toBe('{"xp":1}');
  });

  test("não sobrescreve um backup já existente", () => {
    const store = new Map<string, string>([
      ["foca.state.backup.before-learning-v4", '{"xp":1,"original":true}'],
    ]);
    const criado = ensureBackup(
      '{"xp":999}',
      (k) => store.get(k) ?? null,
      (k, v) => store.set(k, v),
    );
    expect(criado).toBe(false);
    expect(store.get("foca.state.backup.before-learning-v4")).toBe('{"xp":1,"original":true}');
  });

  test("falha de escrita (quota) não lança", () => {
    const criado = ensureBackup(
      "{}",
      () => null,
      () => {
        throw new Error("QuotaExceededError");
      },
    );
    expect(criado).toBe(false);
  });
});

describe("computeAdditiveFields — schema v4 (docs/20 §15.2)", () => {
  test("estado nunca visto (parsed=null) recebe tudo vazio/default, schemaVersion atual", () => {
    const campos = computeAdditiveFields(null);
    expect(campos.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(campos.futureVersion).toBe(false);
    expect(campos.learning.activeSession).toBeNull();
    expect(campos.learning.recentAttempts).toEqual([]);
    expect(campos.examTargets).toEqual([]);
    expect(campos.showExamTips).toBe(true);
    expect(campos.activityDaysSinceFreezeAward).toBe(0);
    expect(campos.completedBlockIds).toEqual([]);
  });

  test("estado v3 (sem schemaVersion nem `learning`) migra pra v4 sem perder nada — campos novos vazios", () => {
    const v3 = { prefs: { sound: true }, progress: { xp: 250, streak: 7 } };
    const campos = computeAdditiveFields(v3);
    expect(campos.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(campos.learning).toEqual({
      activeSession: null,
      completedLessons: {},
      skillEvidence: {},
      reviewSchedule: {},
      recentAttempts: [],
      rewardLedger: {},
      tipHistory: [],
      // docs/25 §7.1/§7.6, T-02: campo aditivo novo, vazio até T-07 popular de verdade.
      celebratedChapterIds: [],
    });
  });

  test("preserva `activeSession` válida (com `stepIndex`, schema v5) através de um reload comum (docs/20 §8.1, A8)", () => {
    const comSessao = {
      learning: {
        activeSession: {
          id: "ls-1",
          contentId: "porcentagem-valor",
          contentVersion: 1,
          kind: "microlicao",
          stage: "checkpoint",
          blockIndex: 0,
          exerciseIndex: 0,
          exerciseIds: ["a", "b"],
          answers: { a: { correct: true } },
          presentedOrders: {},
          stepIndex: 2,
          startedAt: "2026-09-21T00:00:00.000Z",
          updatedAt: "2026-09-21T00:00:01.000Z",
          completedAt: null,
        },
      },
    };
    const campos = computeAdditiveFields(comSessao);
    expect(campos.learning.activeSession).toEqual(comSessao.learning.activeSession as never);
  });

  test("`activeSession` sem `stepIndex` (formato pré-T-08) é descartada, não preservada (docs/25 §7.6)", () => {
    const comSessaoAntiga = {
      learning: {
        activeSession: {
          id: "ls-1",
          contentId: "porcentagem-valor",
          contentVersion: 1,
          kind: "microlicao",
          stage: "checkpoint",
          blockIndex: 0,
          exerciseIndex: 0,
          exerciseIds: ["a", "b"],
          answers: { a: { correct: true } },
          presentedOrders: {},
          startedAt: "2026-09-21T00:00:00.000Z",
          updatedAt: "2026-09-21T00:00:01.000Z",
          completedAt: null,
        },
      },
    };
    const campos = computeAdditiveFields(comSessaoAntiga);
    expect(campos.learning.activeSession).toBeNull();
  });

  test("descarta `activeSession` com forma inválida em vez de lançar", () => {
    const corrompida = { learning: { activeSession: { id: 123, algoQuebrado: true } } };
    const campos = computeAdditiveFields(corrompida);
    expect(campos.learning.activeSession).toBeNull();
  });

  test("preserva `learning` já existente (segunda migração não apaga o que a primeira criou)", () => {
    const jaMigrado = {
      schemaVersion: 4,
      learning: {
        completedLessons: { "licao-1": { version: 1, completedAt: "2026-01-01" } },
        rewardLedger: { "onboarding-bonus": { key: "onboarding-bonus", awardedAt: "x", xp: 50 } },
      },
    };
    const campos = computeAdditiveFields(jaMigrado);
    expect(campos.learning.completedLessons).toEqual({
      "licao-1": { version: 1, completedAt: "2026-01-01" },
    });
    expect(campos.learning.rewardLedger).toEqual({
      "onboarding-bonus": { key: "onboarding-bonus", awardedAt: "x", xp: 50 },
    });
  });

  test("versão futura desconhecida NÃO é rebaixada pra a versão atual (docs/20 §15.3, item 10)", () => {
    const futuro = { schemaVersion: 99, progress: { xp: 5000 } };
    const campos = computeAdditiveFields(futuro);
    expect(campos.schemaVersion).toBe(99);
    expect(campos.futureVersion).toBe(true);
  });

  test("migração roda duas vezes seguidas e dá resultado idêntico (idempotência, item 10)", () => {
    const bruto = { prefs: { sound: false }, progress: { xp: 10 } };
    const primeira = computeAdditiveFields(bruto);
    // Simula persistir e reler: agora o objeto TEM os campos que a primeira migração calculou.
    const comCamposNovos = { ...bruto, schemaVersion: primeira.schemaVersion, learning: primeira.learning };
    const segunda = computeAdditiveFields(comCamposNovos);
    expect(segunda).toEqual(primeira);
  });

  test("campos com tipo errado no storage (ex.: examTargets não é array) caem pro default, não lançam", () => {
    const corrompido = { prefs: { examTargets: "não é array", showExamTips: "não é boolean" } };
    const campos = computeAdditiveFields(corrompido);
    expect(campos.examTargets).toEqual([]);
    expect(campos.showExamTips).toBe(true);
  });
});

describe("computeAdditiveFields — schema v5 (docs/25 §7.6, T-07)", () => {
  test("`activeSession` no formato v4 (sem `stepIndex`) é descartada — o resto de `learning` continua intacto", () => {
    const v4SemStepIndex = {
      schemaVersion: 4,
      learning: {
        activeSession: {
          id: "ls-1",
          contentId: "porcentagem-valor",
          contentVersion: 1,
          kind: "microlicao",
          stage: "checkpoint",
          blockIndex: 0,
          exerciseIndex: 0,
          exerciseIds: ["a", "b"],
          answers: { a: { correct: true } },
          presentedOrders: {},
          startedAt: "2026-09-21T00:00:00.000Z",
          updatedAt: "2026-09-21T00:00:01.000Z",
          completedAt: null,
          // sem stepIndex — sessão gravada pelo motor antigo (pré-T-08).
        },
        completedLessons: { "licao-1": { version: 1, completedAt: "2026-01-01", stars: 3, bestPct: 100 } },
        rewardLedger: { "onboarding:bonus": { key: "onboarding:bonus", awardedAt: "x", xp: 50 } },
      },
    };
    const campos = computeAdditiveFields(v4SemStepIndex);
    expect(campos.learning.activeSession).toBeNull();
    expect(campos.learning.completedLessons).toEqual({
      "licao-1": { version: 1, completedAt: "2026-01-01", stars: 3, bestPct: 100 },
    });
    expect(campos.learning.rewardLedger).toEqual({
      "onboarding:bonus": { key: "onboarding:bonus", awardedAt: "x", xp: 50 },
    });
  });

  test("`activeSession` no formato v5 (com `stepIndex` numérico) é preservada", () => {
    const v5ComStepIndex = {
      schemaVersion: 5,
      learning: {
        activeSession: {
          id: "ls-2",
          contentId: "citologia-membrana",
          contentVersion: 1,
          kind: "microlicao",
          stage: "practice",
          blockIndex: 0,
          exerciseIndex: 1,
          exerciseIds: ["a", "b", "c"],
          answers: { "0": { correct: true } },
          presentedOrders: { "1": ["x", "y"] },
          stepIndex: 3,
          startedAt: "2026-09-21T00:00:00.000Z",
          updatedAt: "2026-09-21T00:00:02.000Z",
          completedAt: null,
        },
      },
    };
    const campos = computeAdditiveFields(v5ComStepIndex);
    expect(campos.learning.activeSession).toEqual(v5ComStepIndex.learning.activeSession as never);
  });

  test("`celebratedChapterIds` e `trailSubjectId` sobrevivem a um round-trip de migração", () => {
    const comCampos = {
      schemaVersion: 5,
      learning: { celebratedChapterIds: ["bio-citologia", "mat-porcentagem"] },
      prefs: { trailSubjectId: "biologia" },
    };
    const campos = computeAdditiveFields(comCampos);
    expect(campos.learning.celebratedChapterIds).toEqual(["bio-citologia", "mat-porcentagem"]);
    expect(campos.trailSubjectId).toBe("biologia");

    // Simula persistir e reler — idempotente, nada se perde nem duplica.
    const relido = {
      ...comCampos,
      learning: { ...comCampos.learning, ...campos.learning },
      prefs: { ...comCampos.prefs, trailSubjectId: campos.trailSubjectId },
    };
    const segunda = computeAdditiveFields(relido);
    expect(segunda.learning.celebratedChapterIds).toEqual(["bio-citologia", "mat-porcentagem"]);
    expect(segunda.trailSubjectId).toBe("biologia");
  });

  test("sem `prefs.trailSubjectId` no storage, o campo vem `null` (default)", () => {
    const campos = computeAdditiveFields({ prefs: { name: "Ana" } });
    expect(campos.trailSubjectId).toBeNull();
  });

  test("`prefs.trailSubjectId` com tipo errado cai pro default `null`, não lança", () => {
    const campos = computeAdditiveFields({ prefs: { trailSubjectId: 123 } });
    expect(campos.trailSubjectId).toBeNull();
  });
});
