import { describe, expect, test } from "bun:test";
import { SKILL_MAP } from "@/content/taxonomy";
import { assinaturaDoFoco } from "@/lib/adaptive/journey";
import { planNext, topicoEscolhido } from "@/lib/adaptive/planner";
import { learningStateVazio } from "@/lib/learning/types";
import type { AppState } from "@/lib/store";

/**
 * Tópicos escolhidos em /topics influenciam o plano (spec 48 T-48.4.1, D48-10, RF-10; B-065). Preferência, não
 * filtro: revisão devida continua na frente.
 */
type Estado = Pick<AppState, "prefs" | "learning" | "progress">;
const HOJE = "2026-09-30";

function estado(prefs: Partial<AppState["prefs"]> = {}): Estado {
  return {
    prefs: {
      name: "Ana",
      level: "",
      targetInstitution: "",
      targetCourse: "",
      difficultSubjects: [],
      easySubjects: [],
      dailyMinutes: 10,
      studyFocus: { mode: "materias", subjectIds: ["mat"], areas: [] },
      examTargets: [],
      selectedTopics: {},
      topicMode: null,
      ...prefs,
    } as unknown as AppState["prefs"],
    learning: learningStateVazio(),
    progress: { bySubject: {}, lessons: {}, today: { date: HOJE, completedBlockIds: [] } } as unknown as AppState["progress"],
  };
}

const topicoDe = (skillId: string) => SKILL_MAP[skillId]?.topicId;

/** Um assunto de Matemática que aparece no plano neutro, mas não em primeiro lugar. */
function assuntoDoMeioDoPlano(): string {
  const neutro = planNext(estado(), HOJE, "s", { n: 16 });
  const topicos = neutro.map((a) => topicoDe(a.skillIds[0])).filter(Boolean) as string[];
  const candidato = topicos.find((t) => t !== topicos[0]);
  if (!candidato) throw new Error("plano neutro sem variedade de assuntos");
  return candidato;
}

describe("tópicos escolhidos no planejador", () => {
  test("escolher um assunto o traz para mais cedo no plano", () => {
    const assunto = assuntoDoMeioDoPlano();
    const neutro = planNext(estado(), HOJE, "s", { n: 16 });
    const comEscolha = planNext(estado({ topicMode: "chose", selectedTopics: { mat: [assunto] } }), HOJE, "s", { n: 16 });
    const primeiro = (plano: typeof neutro) => plano.findIndex((a) => topicoDe(a.skillIds[0]) === assunto);
    const contagem = (plano: typeof neutro) => plano.filter((a) => topicoDe(a.skillIds[0]) === assunto).length;
    expect(primeiro(comEscolha)).toBeGreaterThanOrEqual(0);
    expect(primeiro(comEscolha)).toBeLessThan(primeiro(neutro));
    expect(contagem(comEscolha)).toBeGreaterThanOrEqual(contagem(neutro));
  });

  test("modo 'recomendar' ou 'pular' ignora as escolhas guardadas", () => {
    const assunto = assuntoDoMeioDoPlano();
    const neutro = planNext(estado(), HOJE, "s", { n: 12 }).map((a) => a.id);
    for (const modo of ["recommend", "skip"] as const) {
      const p = planNext(estado({ topicMode: modo, selectedTopics: { mat: [assunto] } }), HOJE, "s", { n: 12 }).map((a) => a.id);
      expect(p).toEqual(neutro);
    }
  });

  test("revisão devida continua na frente do assunto escolhido", () => {
    const neutro = planNext(estado(), HOJE, "s", { n: 16 });
    const assunto = assuntoDoMeioDoPlano();
    // Uma habilidade de OUTRO assunto, já estudada, com revisão vencida.
    const outra = neutro.map((a) => a.skillIds[0]).find((id) => topicoDe(id) && topicoDe(id) !== assunto);
    if (!outra) throw new Error("sem habilidade de outro assunto");
    const s = estado({ topicMode: "chose", selectedTopics: { mat: [assunto] } });
    s.learning.skillModel[outra] = {
      skillId: outra,
      theta: 0.5,
      sigma: 0.6,
      nEff: 4,
      difficultiesSeen: [2, 3],
      recent: [1, 1, 0, 1],
      independentShare: 0.9,
      lastEvidenceDate: "2026-09-20",
      lapses: 0,
      dontKnowRecent: 0,
      helpHeavyRecent: 0,
      source: "evidencia",
      algoVersion: 1,
      updatedAt: "2026-09-20",
    };
    s.learning.skillEvidence[outra] = {
      skillId: outra,
      distinctExerciseIds: ["a", "b", "c", "d"],
      distinctLocalDates: ["2026-09-18", "2026-09-20"],
      lastFiveCorrect: [true, true, false, true],
      hasReviewCorrectAfter24h: false,
    };
    s.learning.reviewSchedule[outra] = { skillId: outra, intervalDays: 3, dueDate: "2026-09-27", lastResult: "correct" };
    const plano = planNext(s, HOJE, "s", { n: 16 });
    const revisao = plano.findIndex((a) => a.kind === "revisao" && a.skillIds[0] === outra);
    const escolhido = plano.findIndex((a) => topicoDe(a.skillIds[0]) === assunto);
    expect(revisao).toBeGreaterThanOrEqual(0);
    expect(revisao).toBeLessThan(escolhido);
  });

  test("topicoEscolhido só vale no modo 'escolher'", () => {
    const sk = { subjectId: "mat", topicId: "prob" };
    expect(topicoEscolhido(sk, estado({ topicMode: "chose", selectedTopics: { mat: ["prob"] } }))).toBe(true);
    expect(topicoEscolhido(sk, estado({ topicMode: "recommend", selectedTopics: { mat: ["prob"] } }))).toBe(false);
    expect(topicoEscolhido(sk, estado({ topicMode: "chose", selectedTopics: { mat: ["porc"] } }))).toBe(false);
  });
});

describe("assinatura do foco", () => {
  test("mudar os assuntos escolhidos muda a assinatura (a fila não iniciada é refeita); a ordem não importa", () => {
    const a = assinaturaDoFoco(estado({ topicMode: "chose", selectedTopics: { mat: ["prob", "porc"] } }));
    const b = assinaturaDoFoco(estado({ topicMode: "chose", selectedTopics: { mat: ["porc", "prob"] } }));
    const c = assinaturaDoFoco(estado({ topicMode: "chose", selectedTopics: { mat: ["prob"] } }));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  test("fora do modo 'escolher' (ou sem escolha), a assinatura é a mesma de antes — sem replanejar à toa", () => {
    const antes = assinaturaDoFoco(estado());
    expect(assinaturaDoFoco(estado({ topicMode: "recommend", selectedTopics: { mat: ["prob"] } }))).toBe(antes);
    expect(assinaturaDoFoco(estado({ topicMode: "chose", selectedTopics: { mat: [] } }))).toBe(antes);
    expect(antes).toBe("materias:mat:|");
  });
});
