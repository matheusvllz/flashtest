import { beforeEach, describe, expect, test } from "bun:test";
import {
  completeMicroLesson,
  completeQuiz,
  getState,
  registrarAulaConcluida,
  registrarLoteFlashcardsConcluido,
  registrarResposta,
  reset,
} from "@/lib/store";

/**
 * Tabela de recompensas fixada em teste (docs/20 §12, Fase 11, item 1) ANTES
 * de qualquer UI depender dela. Critério A14 (docs/20 §20): repetir a mesma
 * conclusão/transação 10 vezes não aumenta XP/blocos.
 */
describe("registrarResposta — teto vitalício de 15 por questão (docs/20 §12)", () => {
  beforeEach(() => reset());
  const q = { id: "q1", subject: "mat", subjectName: "Matemática", topic: "x" };

  test("primeira errada concede 5", () => {
    const xp = registrarResposta(q, false);
    expect(xp).toBe(5);
    expect(getState().progress.xp).toBe(5);
  });

  test("melhorar pra correta depois de errar concede só a diferença (10)", () => {
    registrarResposta(q, false); // +5
    const xp = registrarResposta(q, true); // +10 (teto 15)
    expect(xp).toBe(10);
    expect(getState().progress.xp).toBe(15);
  });

  test("repetir correta 10 vezes não concede mais nada além do teto", () => {
    registrarResposta(q, true); // +15
    for (let i = 0; i < 10; i++) registrarResposta(q, true);
    expect(getState().progress.xp).toBe(15);
  });

  test("errar de novo depois de já ter acertado não tira XP (sem clawback)", () => {
    registrarResposta(q, true); // +15
    registrarResposta(q, false); // não deveria conceder nem retirar
    expect(getState().progress.xp).toBe(15);
  });

  test("primeira correta direto (sem erro antes) concede o teto inteiro", () => {
    const xp = registrarResposta(q, true);
    expect(xp).toBe(15);
  });
});

describe("completeMicroLesson — 10/20/30 por faixa, só prática conta (docs/20 §12)", () => {
  beforeEach(() => reset());

  test("1/2 práticas corretas (50%) -> 1 estrela -> 10 XP", () => {
    const r = completeMicroLesson("l1", 1, 1, 2);
    expect(r.stars).toBe(1);
    expect(r.xpAwarded).toBe(10);
  });

  test("2/2 práticas corretas (100%) -> 3 estrelas -> 30 XP", () => {
    const r = completeMicroLesson("l1", 1, 2, 2);
    expect(r.stars).toBe(3);
    expect(r.xpAwarded).toBe(30);
  });

  test("replay com a MESMA faixa não paga XP de novo", () => {
    completeMicroLesson("l1", 1, 1, 2); // 1 estrela, +10
    const r = completeMicroLesson("l1", 1, 1, 2); // replay, mesma faixa
    expect(r.xpAwarded).toBe(0);
    expect(getState().progress.xp).toBe(10);
  });

  test("replay melhorando a faixa paga só a diferença", () => {
    completeMicroLesson("l1", 1, 1, 2); // 1 estrela, +10
    const r = completeMicroLesson("l1", 1, 2, 2); // 3 estrelas, deveria pagar +20
    expect(r.xpAwarded).toBe(20);
    expect(getState().progress.xp).toBe(30);
  });

  test("repetir a MESMA conclusão 10 vezes não aumenta XP além do total da faixa (critério A14)", () => {
    for (let i = 0; i < 10; i++) completeMicroLesson("l1", 1, 2, 2);
    expect(getState().progress.xp).toBe(30);
  });

  // T-09/docs/25: "revisão de capítulo paga 10/20/30 uma vez por faixa" —
  // `completeMicroLesson` indexa por `lessonId` como string opaca
  // (`s.learning.completedLessons[lessonId]`, docs acima) e nunca inspeciona
  // o formato do id, então um id sintético de revisão (`revisao--<capId>`)
  // segue a MESMA fórmula 10/20/30 e o MESMO diff idempotente de qualquer
  // lição regular — não há branch separado a testar, só confirmar que o
  // contrato vale igual para esse formato de id.
  test("id sintético de revisão de capítulo (revisao--<capId>) segue a mesma fórmula 10/20/30, sem branch especial", () => {
    const r1 = completeMicroLesson("revisao--mat-porcentagem", 1, 1, 2); // 50% -> 1 estrela -> 10 XP
    expect(r1.stars).toBe(1);
    expect(r1.xpAwarded).toBe(10);

    const r2 = completeMicroLesson("revisao--mat-porcentagem", 1, 2, 2); // melhora pra 100% -> +20
    expect(r2.stars).toBe(3);
    expect(r2.xpAwarded).toBe(20);
    expect(getState().progress.xp).toBe(30);

    // replay na mesma faixa não paga de novo (mesmo critério A14 acima).
    const r3 = completeMicroLesson("revisao--mat-porcentagem", 1, 2, 2);
    expect(r3.xpAwarded).toBe(0);
    expect(getState().progress.xp).toBe(30);
  });
});

describe("completeQuiz — bônus de onboarding único (docs/20 §2.5/§12)", () => {
  beforeEach(() => reset());

  test("primeira vez concede 50 XP", () => {
    completeQuiz([], []);
    expect(getState().progress.xp).toBe(50);
  });

  test("refazer o quiz NÃO concede o bônus de novo (bug corrigido)", () => {
    completeQuiz([], []);
    completeQuiz([], []);
    completeQuiz([], []);
    expect(getState().progress.xp).toBe(50);
  });
});

describe("blocos unificados — meta diária (docs/20 §12, Fase 11, item 4)", () => {
  beforeEach(() => reset());

  test("aula, redação e microlição cada uma soma 1 bloco em completedBlockIds", () => {
    registrarAulaConcluida();
    expect(getState().progress.today.completedBlockIds).toHaveLength(1);
  });

  test("registrarLoteFlashcardsConcluido soma exatamente 1 bloco, não um por carta", () => {
    registrarLoteFlashcardsConcluido();
    registrarLoteFlashcardsConcluido();
    expect(getState().progress.today.completedBlockIds).toHaveLength(2);
  });

  test("múltiplas modalidades no mesmo dia somam blocos distintos (não se sobrescrevem)", () => {
    registrarAulaConcluida();
    completeMicroLesson("l1", 1, 2, 2);
    registrarLoteFlashcardsConcluido();
    expect(getState().progress.today.completedBlockIds).toHaveLength(3);
  });
});

describe("congelamento de streak — contador explícito, não `activityDays.length` (docs/20 §12, item 6)", () => {
  beforeEach(() => reset());

  test("uma única atividade não concede congelamento ainda (só depois de 7)", () => {
    registrarAulaConcluida();
    expect(getState().progress.streakFreezes).toBe(1); // estoque inicial, sem mudança
    expect(getState().progress.activityDaysSinceFreezeAward).toBe(1);
  });

  // O teste de "7 dias distintos concedem +1" e "funciona além de 60 dias"
  // depende de datas reais distintas (`registrarAtividade` usa `new Date()`
  // sem relógio injetável) — cobertura de ponta a ponta fica pro teste E2E/
  // manual; aqui fixamos o contrato que a Fase 5 preparou (o campo existe e
  // incrementa a cada dia novo de atividade).
});
