import { describe, expect, test } from "bun:test";
import {
  computeAdditiveFields,
  CURRENT_SCHEMA_VERSION,
  ensureBackup,
  parseStoredState,
} from "@/lib/state-migrations";
import { learningStateVazio } from "@/lib/learning/types";

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
    const campos = computeAdditiveFields(null, "2026-09-21");
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
    const campos = computeAdditiveFields(v3, "2026-09-21");
    expect(campos.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    // docs/25 §7.1/§7.6 + docs/30 §21.1 (schema v6, Fase 4 do docs/31):
    // `learningStateVazio()` é a mesma fonte que `computeAdditiveFields` usa
    // — comparar contra ela em vez de repetir a forma à mão evita este teste
    // ficar desatualizado a cada campo aditivo novo.
    expect(campos.learning).toEqual(learningStateVazio());
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
    const campos = computeAdditiveFields(comSessao, "2026-09-21");
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
    const campos = computeAdditiveFields(comSessaoAntiga, "2026-09-21");
    expect(campos.learning.activeSession).toBeNull();
  });

  test("descarta `activeSession` com forma inválida em vez de lançar", () => {
    const corrompida = { learning: { activeSession: { id: 123, algoQuebrado: true } } };
    const campos = computeAdditiveFields(corrompida, "2026-09-21");
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
    const campos = computeAdditiveFields(jaMigrado, "2026-09-21");
    expect(campos.learning.completedLessons).toEqual({
      "licao-1": { version: 1, completedAt: "2026-01-01" },
    });
    expect(campos.learning.rewardLedger).toEqual({
      "onboarding-bonus": { key: "onboarding-bonus", awardedAt: "x", xp: 50 },
    });
  });

  test("versão futura desconhecida NÃO é rebaixada pra a versão atual (docs/20 §15.3, item 10)", () => {
    const futuro = { schemaVersion: 99, progress: { xp: 5000 } };
    const campos = computeAdditiveFields(futuro, "2026-09-21");
    expect(campos.schemaVersion).toBe(99);
    expect(campos.futureVersion).toBe(true);
  });

  test("migração roda duas vezes seguidas e dá resultado idêntico (idempotência, item 10)", () => {
    const bruto = { prefs: { sound: false }, progress: { xp: 10 } };
    const primeira = computeAdditiveFields(bruto, "2026-09-21");
    // Simula persistir e reler: agora o objeto TEM os campos que a primeira migração calculou.
    const comCamposNovos = { ...bruto, schemaVersion: primeira.schemaVersion, learning: primeira.learning };
    const segunda = computeAdditiveFields(comCamposNovos, "2026-09-21");
    expect(segunda).toEqual(primeira);
  });

  test("campos com tipo errado no storage (ex.: examTargets não é array) caem pro default, não lançam", () => {
    const corrompido = { prefs: { examTargets: "não é array", showExamTips: "não é boolean" } };
    const campos = computeAdditiveFields(corrompido, "2026-09-21");
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
    const campos = computeAdditiveFields(v4SemStepIndex, "2026-09-21");
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
    const campos = computeAdditiveFields(v5ComStepIndex, "2026-09-21");
    expect(campos.learning.activeSession).toEqual(v5ComStepIndex.learning.activeSession as never);
  });

  test("`celebratedChapterIds` e `trailSubjectId` sobrevivem a um round-trip de migração", () => {
    const comCampos = {
      schemaVersion: 5,
      learning: { celebratedChapterIds: ["bio-citologia", "mat-porcentagem"] },
      prefs: { trailSubjectId: "biologia" },
    };
    const campos = computeAdditiveFields(comCampos, "2026-09-21");
    expect(campos.learning.celebratedChapterIds).toEqual(["bio-citologia", "mat-porcentagem"]);
    expect(campos.trailSubjectId).toBe("biologia");

    // Simula persistir e reler — idempotente, nada se perde nem duplica.
    const relido = {
      ...comCampos,
      learning: { ...comCampos.learning, ...campos.learning },
      prefs: { ...comCampos.prefs, trailSubjectId: campos.trailSubjectId },
    };
    const segunda = computeAdditiveFields(relido, "2026-09-21");
    expect(segunda.learning.celebratedChapterIds).toEqual(["bio-citologia", "mat-porcentagem"]);
    expect(segunda.trailSubjectId).toBe("biologia");
  });

  test("sem `prefs.trailSubjectId` no storage, o campo vem `null` (default)", () => {
    const campos = computeAdditiveFields({ prefs: { name: "Ana" } }, "2026-09-21");
    expect(campos.trailSubjectId).toBeNull();
  });

  test("`prefs.trailSubjectId` com tipo errado cai pro default `null`, não lança", () => {
    const campos = computeAdditiveFields({ prefs: { trailSubjectId: 123 } }, "2026-09-21");
    expect(campos.trailSubjectId).toBeNull();
  });
});

describe("computeAdditiveFields — schema v6 (docs/30 §21.1, Fase 4 do docs/31)", () => {
  test("prefs novos sem storage prévio: foco vazio, minutos derivados de dailyLessons, easySubjects vazio", () => {
    const campos = computeAdditiveFields({ prefs: { dailyLessons: 3 } }, "2026-09-21");
    expect(campos.studyFocus).toEqual({ mode: "todas", subjectIds: [], areas: [] });
    expect(campos.easySubjects).toEqual([]);
    expect(campos.dailyMinutes).toBe(10); // dailyLessons 3 -> 10 min (docs/30 §21.1)
  });

  test("dailyMinutes já válido no storage é preservado tal qual", () => {
    const campos = computeAdditiveFields({ prefs: { dailyMinutes: 30 } }, "2026-09-21");
    expect(campos.dailyMinutes).toBe(30);
  });

  test("dailyMinutes fora da lista fechada (ex.: 12) cai pro derivado de dailyLessons, não passa o valor inválido adiante", () => {
    const campos = computeAdditiveFields({ prefs: { dailyMinutes: 12, dailyLessons: 1 } }, "2026-09-21");
    expect(campos.dailyMinutes).toBe(5);
  });

  test("studyFocus com forma válida é preservado", () => {
    const campos = computeAdditiveFields(
      { prefs: { studyFocus: { mode: "areas", subjectIds: [], areas: ["MT", "CN"] } } },
      "2026-09-21",
    );
    expect(campos.studyFocus).toEqual({ mode: "areas", subjectIds: [], areas: ["MT", "CN"] });
  });

  test("studyFocus com mode inválido cai pro default, não lança", () => {
    const campos = computeAdditiveFields({ prefs: { studyFocus: { mode: "qualquer-coisa" } } }, "2026-09-21");
    expect(campos.studyFocus.mode).toBe("todas");
  });

  test("onboardingVersion: quem já tinha `onboarded: true` sem o campo vira versão 1 (fluxo antigo)", () => {
    const campos = computeAdditiveFields({ onboarded: true, prefs: {} }, "2026-09-21");
    expect(campos.onboardingVersion).toBe(1);
  });

  test("onboardingVersion: sem `onboarded` (usuário realmente novo) vira versão 2 (fluxo novo)", () => {
    const campos = computeAdditiveFields({ prefs: {} }, "2026-09-21");
    expect(campos.onboardingVersion).toBe(2);
  });

  test("onboardingVersion já gravado no storage é preservado", () => {
    const campos = computeAdditiveFields({ onboarded: true, prefs: { onboardingVersion: 1 } }, "2026-09-21");
    expect(campos.onboardingVersion).toBe(1);
  });

  test("learning.journey com forma inválida cai pra vazia (nunca trava o boot)", () => {
    const campos = computeAdditiveFields({ learning: { journey: { committed: "não é array" } } }, "2026-09-21");
    expect(campos.learning.journey).toEqual({
      committed: [],
      upcoming: [],
      history: [],
      activeActivity: null,
      sinceCheckpoint: 0,
      lastCheckpointDate: null,
      planVersion: 0,
    });
  });

  test("learning.journey com forma válida é preservada", () => {
    const journeyValida = {
      committed: [{ id: "atv-1", kind: "pratica", subjectId: "mat", skillIds: ["mat:porcentagem-valor"] }],
      upcoming: [],
      history: [],
      activeActivity: null,
      sinceCheckpoint: 4,
      lastCheckpointDate: "2026-09-20",
      planVersion: 1,
    };
    const campos = computeAdditiveFields({ learning: { journey: journeyValida } }, "2026-09-21");
    expect(campos.learning.journey).toEqual(journeyValida);
  });

  test("learning.placement com forma inválida vira null (regra diferente da jornada — docs/30 §21.1)", () => {
    const campos = computeAdditiveFields({ learning: { placement: { status: "estado-que-nao-existe" } } }, "2026-09-21");
    expect(campos.learning.placement).toBeNull();
  });

  test("learning.placement com forma válida é preservado", () => {
    const placementValido = {
      status: "concluido",
      startedAt: "2026-09-20T10:00:00.000Z",
      finishedAt: "2026-09-20T10:10:00.000Z",
      areas: {},
      seed: "abc123",
    };
    const campos = computeAdditiveFields({ learning: { placement: placementValido } }, "2026-09-21");
    expect(campos.learning.placement).toEqual(placementValido);
  });

  test("learning.focusSession EXPIRADA (expiresOn < hoje) some na carga", () => {
    const focusOntem = { subjectIds: ["mat"], startedAt: "2026-09-20T10:00:00.000Z", expiresOn: "2026-09-20" };
    const campos = computeAdditiveFields({ learning: { focusSession: focusOntem } }, "2026-09-21");
    expect(campos.learning.focusSession).toBeNull();
  });

  test("learning.focusSession ainda válida hoje é preservada", () => {
    const focusHoje = { subjectIds: ["mat"], startedAt: "2026-09-21T10:00:00.000Z", expiresOn: "2026-09-21" };
    const campos = computeAdditiveFields({ learning: { focusSession: focusHoje } }, "2026-09-21");
    expect(campos.learning.focusSession).toEqual(focusHoje);
  });

  test("learning.events: mantém só os últimos 300 mesmo se o storage tiver mais (defesa dupla com o limite do store)", () => {
    const muitosEventos = Array.from({ length: 305 }, (_, i) => ({
      type: "plan-fallback",
      at: "2026-09-21T10:00:00.000Z",
      localDate: "2026-09-21",
      meta: { i },
    }));
    const campos = computeAdditiveFields({ learning: { events: muitosEventos } }, "2026-09-21");
    expect(campos.learning.events).toHaveLength(300);
  });
});

describe("computeAdditiveFields — campos opcionais do plano 36 (docs/36 §H, T-01.1) — sem bump de schema", () => {
  test("schemaVersion continua 6 (o plano 36 não muda o schema)", () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(6);
  });

  test("journey v6 com os campos novos (seq, challengeEligible, focusSignature, startedAt, attemptKey, localDate) passa intacta", () => {
    const journey = {
      committed: [{ id: "atv-1", kind: "pratica", subjectId: "mat", skillIds: ["mat:porcentagem-valor"] }],
      upcoming: [],
      history: [
        {
          activityId: "atv-0",
          kind: "pratica",
          skillIds: ["mat:porcentagem-valor"],
          subjectId: "mat",
          completedAt: "2026-10-01T12:00:00.000Z",
          scorePct: 80,
          attemptKey: "atv-0@2026-10-01T11:58:00.000Z",
          localDate: "2026-10-01",
        },
      ],
      activeActivity: {
        id: "atv-1",
        kind: "pratica",
        subjectId: "mat",
        skillIds: ["mat:porcentagem-valor"],
        itemIds: ["q10", "q21"],
        startedAt: "2026-10-01T12:05:00.000Z",
      },
      sinceCheckpoint: 1,
      lastCheckpointDate: null,
      planVersion: 2,
      seq: 7,
      challengeEligible: { "mat:porcentagem-valor": "2026-10-08" },
      focusSignature: "materias:mat:|",
    };
    const campos = computeAdditiveFields({ learning: { journey } }, "2026-10-01");
    expect(campos.learning.journey).toEqual(journey);
  });

  test("placement v6 com appliedAt/appliedVersion mantém os campos (load() não os descarta)", () => {
    const placement = {
      status: "concluido",
      startedAt: "2026-10-01T10:00:00.000Z",
      finishedAt: "2026-10-01T10:10:00.000Z",
      areas: {},
      seed: "abc123",
      appliedAt: "2026-10-01T10:10:05.000Z",
      appliedVersion: 1,
    };
    const campos = computeAdditiveFields({ learning: { placement } }, "2026-10-01");
    expect(campos.learning.placement).toEqual(placement);
    expect(campos.learning.placement?.appliedAt).toBe("2026-10-01T10:10:05.000Z");
  });

  test("v6 SEM os campos novos continua válida (defaults na leitura, nada é inventado no estado)", () => {
    const journey = {
      committed: [],
      upcoming: [],
      history: [],
      activeActivity: null,
      sinceCheckpoint: 0,
      lastCheckpointDate: null,
      planVersion: 1,
    };
    const placement = { status: "concluido", startedAt: "a", finishedAt: "b", areas: {}, seed: "s" };
    const campos = computeAdditiveFields({ learning: { journey, placement } }, "2026-10-01");
    expect(campos.learning.journey).toEqual(journey);
    expect("seq" in campos.learning.journey).toBe(false);
    expect(campos.learning.placement).toEqual(placement);
    expect("appliedAt" in campos.learning.placement!).toBe(false);
  });

  test("eventos dos tipos novos (activity-skipped, placement-applied, checkpoint-recalibrated) sobrevivem ao parse", () => {
    const events = (["activity-skipped", "placement-applied", "checkpoint-recalibrated"] as const).map((type) => ({
      type,
      at: "2026-10-01T12:00:00.000Z",
      localDate: "2026-10-01",
    }));
    const campos = computeAdditiveFields({ learning: { events } }, "2026-10-01");
    expect(campos.learning.events.map((e) => e.type)).toEqual(["activity-skipped", "placement-applied", "checkpoint-recalibrated"]);
  });
});
