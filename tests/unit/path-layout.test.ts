import { describe, expect, test } from "bun:test";
import type { TrailChapter, TrailModel, TrailNode, TrailSubject } from "@/lib/learning/trail";
import {
  buildChapterRows,
  captionSide,
  chapterDefaultExpanded,
  chapterMilestone,
  connectorPathD,
  doodleFor,
  highlightPlan,
  isComfortablyVisible,
  pathFocus,
  pathK,
  resolveFocusTarget,
  shouldAutoScroll,
} from "@/lib/learning/path-layout";

function node(id: string, status: TrailNode["status"], extra: Partial<TrailNode> = {}): TrailNode {
  return {
    id,
    status,
    source: "micro",
    kind: "aula",
    title: id,
    questionCount: 4,
    reviewDue: false,
    href: { to: "/learn/$lessonId", params: { lessonId: id } },
    ...extra,
  };
}

function chapter(id: string, nodes: TrailNode[], status: TrailChapter["status"] = "available"): TrailChapter {
  const core = nodes.filter((n) => n.kind !== "revisao");
  return {
    id,
    title: id,
    nodes,
    status,
    containsCurrent: nodes.some((n) => n.status === "current"),
    completedCount: core.filter((n) => n.status === "completed").length,
    totalCount: core.length,
  };
}

function subject(id: string, chapters: TrailChapter[]): TrailSubject {
  return {
    id,
    name: id,
    completedCount: 0,
    totalCount: 0,
    sections: [
      { id: `${id}-s1`, index: 1, title: "S1", chapters, completedCount: 0, totalCount: 0, status: "available" },
    ],
  };
}

function model(subjects: TrailSubject[], currentLessonId: string | null = null): TrailModel {
  return { subjects, continueTarget: null, currentLessonId, defaultSubjectId: subjects[0]?.id ?? "" };
}

describe("pathK", () => {
  test("padrão de 8 posições, cíclico", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8].map(pathK)).toEqual([0, -0.5, -1, -0.5, 0, 0.5, 1, 0.5, 0]);
  });
  test("índice negativo também é cíclico", () => {
    expect(pathK(-1)).toBe(0.5);
  });
});

describe("captionSide", () => {
  test("k > 0 fica à esquerda; k <= 0 fica à direita", () => {
    expect(captionSide(0)).toBe("right");
    expect(captionSide(-1)).toBe("right");
    expect(captionSide(0.5)).toBe("left");
  });
});

describe("connectorPathD", () => {
  test("gera o path esperado entre dois k", () => {
    expect(connectorPathD(0, -1)).toBe("M 50 0 C 50 48, 34 48, 34 96");
  });
});

describe("pathFocus", () => {
  test("currentLessonId dentro da matéria vira foco global", () => {
    const s = subject("mat", [chapter("c1", [node("a", "current"), node("b", "locked")])]);
    const m = model([s], "a");
    expect(pathFocus(m, "mat")).toEqual({ nodeId: "a", scope: "global" });
  });

  test("sem current na matéria, primeiro disponível/em-andamento vira foco subject", () => {
    const s = subject("por", [chapter("c1", [node("a", "completed"), node("b", "available"), node("c", "locked")])]);
    const m = model([s], "outra-materia-lesson");
    expect(pathFocus(m, "por")).toEqual({ nodeId: "b", scope: "subject" });
  });

  test("só revisão pendente vira foco", () => {
    const s = subject("bio", [
      chapter("c1", [node("a", "completed"), node("rev", "available", { kind: "revisao" })]),
    ]);
    const m = model([s]);
    expect(pathFocus(m, "bio")).toEqual({ nodeId: "rev", scope: "subject" });
  });

  test("tudo concluído -> null", () => {
    const s = subject("bio", [chapter("c1", [node("a", "completed")])]);
    expect(pathFocus(model([s]), "bio")).toBeNull();
  });

  test("matéria inexistente -> null", () => {
    expect(pathFocus(model([subject("mat", [])]), "xyz")).toBeNull();
  });
});

describe("resolveFocusTarget", () => {
  test("escopo global devolve o mesmo continueTarget", () => {
    const s = subject("mat", [chapter("c1", [node("a", "current")])]);
    const m: TrailModel = {
      subjects: [s],
      currentLessonId: "a",
      defaultSubjectId: "mat",
      continueTarget: {
        lessonId: "a",
        source: "micro",
        title: "A",
        chapterTitle: "C1",
        sectionTitle: "S1",
        subjectId: "mat",
        href: { to: "/learn/$lessonId", params: { lessonId: "a" } },
        reason: "next-lesson",
        explanation: "explicação real",
        firstTime: false,
      },
    };
    const focus = pathFocus(m, "mat")!;
    const target = resolveFocusTarget(m, s, focus);
    expect(target).toBe(m.continueTarget);
  });

  test("escopo subject monta alvo com explanation vazia e href do nó", () => {
    const s = subject("por", [chapter("c1", [node("b", "available")])]);
    const m = model([s]);
    const focus = pathFocus(m, "por")!;
    const target = resolveFocusTarget(m, s, focus)!;
    expect(target.lessonId).toBe("b");
    expect(target.explanation).toBe("");
    expect(target.href).toEqual({ to: "/learn/$lessonId", params: { lessonId: "b" } });
  });

  test("focus null -> null", () => {
    const s = subject("mat", []);
    expect(resolveFocusTarget(model([s]), s, null)).toBeNull();
  });
});

describe("chapterDefaultExpanded", () => {
  test("locked nunca expande", () => {
    expect(chapterDefaultExpanded(chapter("c1", [], "locked"), "a")).toBe(false);
  });
  test("in-progress sempre expande", () => {
    expect(chapterDefaultExpanded(chapter("c1", [], "in-progress"), null)).toBe(true);
  });
  test("contém o foco -> expande", () => {
    const c = chapter("c1", [node("a", "available")]);
    expect(chapterDefaultExpanded(c, "a")).toBe(true);
  });
  test("contém o highlight -> expande", () => {
    const c = chapter("c1", [node("a", "completed")]);
    expect(chapterDefaultExpanded(c, null, "a")).toBe(true);
  });
  test("completed sem foco/highlight -> não expande", () => {
    const c = chapter("c1", [node("a", "completed")], "completed");
    expect(chapterDefaultExpanded(c, null)).toBe(false);
  });
});

describe("chapterMilestone", () => {
  test("soma estrelas dos nós concluídos, ignora revisão no denominador", () => {
    const c = chapter(
      "c1",
      [
        node("a", "completed", { stars: 3 }),
        node("b", "completed", { stars: 2 }),
        node("c", "available"),
        node("rev", "completed", { kind: "revisao", stars: 3 }),
      ],
      "in-progress",
    );
    const m = chapterMilestone(c);
    expect(m).toEqual({ done: false, completed: 2, total: 3, stars: 5, maxStars: 9 });
  });
});

describe("doodleFor", () => {
  test("só na linha 4 do ciclo de 8", () => {
    expect(doodleFor("mat", 0, 4)).toBe("%");
    expect(doodleFor("mat", 0, 3)).toBeNull();
  });
  test("matéria sem glifo cai no default", () => {
    expect(doodleFor("xyz", 0, 4)).toBe("*");
  });
  test("avança o índice do glifo com chapterIndex/rowIndex", () => {
    expect(doodleFor("mat", 0, 12)).toBe("x²");
  });
});

describe("highlightPlan", () => {
  test("próximo disponível vira secundário", () => {
    const c = chapter("c1", [node("a", "completed"), node("b", "available")]);
    expect(highlightPlan(c, "a")).toEqual({ primaryId: "a", secondaryId: "b" });
  });
  test("próximo bloqueado não vira secundário", () => {
    const c = chapter("c1", [node("a", "completed"), node("b", "locked")]);
    expect(highlightPlan(c, "a")).toEqual({ primaryId: "a", secondaryId: undefined });
  });
  test("id inexistente -> objeto vazio", () => {
    const c = chapter("c1", [node("a", "completed")]);
    expect(highlightPlan(c, "z")).toEqual({});
  });
  test("sem highlightId -> objeto vazio", () => {
    const c = chapter("c1", [node("a", "completed")]);
    expect(highlightPlan(c)).toEqual({});
  });
});

describe("buildChapterRows", () => {
  test("foco no meio: linha seguinte sem conector, carimbo com conector traced pelo status do último nó", () => {
    const c = chapter("c1", [node("a", "completed"), node("b", "available"), node("c", "locked")]);
    const rows = buildChapterRows(c, "b", "mat", 0);
    expect(rows).toHaveLength(4);
    expect(rows[0].connector).toBeNull();
    expect(rows[0].type).toBe("node");
    expect(rows[1].connector).not.toBeNull(); // conector entra normalmente na linha do foco
    expect(rows[2].connector).toBeNull(); // linha seguinte ao foco: sem conector (callout fica no lugar)
    const milestone = rows[3];
    expect(milestone.type).toBe("milestone");
    expect(milestone.connector).toEqual({ fromK: pathK(2), toK: 0, traced: false });
  });

  test("foco no último nó: carimbo sem conector", () => {
    const c = chapter("c1", [node("a", "completed"), node("b", "available")]);
    const rows = buildChapterRows(c, "b", "mat", 0);
    const milestone = rows[rows.length - 1];
    expect(milestone.type).toBe("milestone");
    expect(milestone.connector).toBeNull();
  });
});

describe("shouldAutoScroll", () => {
  test("mesma chave já rolada -> false", () => {
    expect(shouldAutoScroll({ scrollY: 0, hasHighlight: false, doneKey: "a|b", key: "a|b" })).toBe(false);
  });
  test("scrollY restaurado sem destaque -> false", () => {
    expect(shouldAutoScroll({ scrollY: 300, hasHighlight: false, doneKey: null, key: "a|b" })).toBe(false);
  });
  test("scrollY restaurado com destaque -> true", () => {
    expect(shouldAutoScroll({ scrollY: 300, hasHighlight: true, doneKey: null, key: "a|b" })).toBe(true);
  });
  test("scrollY zero -> true", () => {
    expect(shouldAutoScroll({ scrollY: 0, hasHighlight: false, doneKey: null, key: "a|b" })).toBe(true);
  });
});

describe("isComfortablyVisible", () => {
  test("dentro dos insets -> true", () => {
    expect(isComfortablyVisible({ top: 130, bottom: 600 }, { height: 844, topInset: 120, bottomInset: 80 })).toBe(
      true,
    );
  });
  test("fora dos insets -> false", () => {
    expect(isComfortablyVisible({ top: 130, bottom: 800 }, { height: 844, topInset: 120, bottomInset: 80 })).toBe(
      false,
    );
  });
});
