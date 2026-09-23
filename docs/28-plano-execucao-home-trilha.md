# 28 — Home como trilha visual + deploy: plano de execução (para a IA executora)

**Status:** rascunho — só executar depois que o usuário aprovar o [27](27-plano-home-trilha-visual.md). Escrito em 23/09/2026 a partir do código em `main` = `88813f3`.
**Norma:** o `27` decide **o quê** e **por quê**. Este arquivo decide **como** e **em que ordem**. Se os dois divergirem, o `27` vence; registre a divergência.
**Registro de execução a criar no fim:** `docs/29-registro-execucao-home-trilha.md`.

---

## 0. Como usar este documento

1. Leia, nesta ordem: este arquivo inteiro → `docs/27-plano-home-trilha-visual.md` inteiro → `CLAUDE.md` → `AGENTS.md` → `docs/DESIGN.md` → `docs/26-registro-execucao-jornada-v2.md` §1–§3 → `docs/ai/SKILL-ROUTING.md` §1–§2.
2. Execute as tarefas **T-01 → T-29 na ordem**. Não pule, não reordene, não junte tarefas.
3. Cada tarefa tem: Objetivo · Por quê · Arquivos para ler · Arquivos para alterar/criar · Depende de · Skills · Instruções · Contrato (API) · Casos de borda · Responsivo · Acessibilidade · Teste · Verificação · Aceite · **Não faça**.
4. Ao fim de cada **Checkpoint** (A–F): rode os comandos do checkpoint, leia o `git diff` inteiro, corrija o que estiver fora do escopo, e só então faça o commit do checkpoint (§3).
5. Código dentro deste documento é **contrato**: nomes de arquivo, componente, prop, classe CSS, atributo `data-*` e string de UI devem ser **exatamente** os escritos (os testes dependem deles). Você pode melhorar a implementação interna desde que o contrato e os critérios de aceite fiquem iguais.
6. Encontrou o código diferente do que este plano descreve? Corrija **o mínimo** para seguir a intenção, anote em "Divergências" do registro `29` (arquivo, linha, o que o plano dizia, o que você fez) e siga. **Nunca** mude requisito de produto por conta própria.
7. Ambiente: Windows, repositório com `core.autocrlf=true`. Use **bun** (nunca npm/yarn/pnpm). O servidor de dev sobe em `http://localhost:8080` (`bun run dev`); o Playwright sobe sozinho.

### 0.1 Comandos de verificação (use sempre estes, com a saída real)

| Nome | Comando | Baseline em 23/09/2026 |
|---|---|---|
| TSC | `bunx tsc --noEmit` | exit 0 |
| UNIT | `bun test tests/unit` | 257 pass, 0 fail |
| E2E | `bunx playwright test` | 33 pass (registro `26`) — confirmar em T-01 |
| BUILD | `bun run build` | ok (preset netlify) |
| LINT-ARQ | `bunx eslint <arquivos tocados> --rule "prettier/prettier: off"` | — (lint global está quebrado: ver `27` §16; **não** rode `eslint .`, demora > 3 min e falha por CRLF) |
| FMT-NOVOS | `bunx prettier --write <arquivos NOVOS>` | só em arquivo novo; nunca em arquivo existente inteiro |

### 0.2 Regras que nunca se quebram

- Não editar `src/routeTree.gen.ts`.
- Não criar segundo store, não mexer no schema (`foca.state.v3`, v5), não mudar `trail.ts`/`recommend.ts`/`store.ts` (só **ler**).
- Não adicionar dependência. Não usar GSAP/Framer Motion. Não adicionar analytics.
- Não usar hex literal em componente novo; só tokens (`bg-mar`, `var(--color-mar)`…). `white` (palavra-chave) é aceito só onde o código atual já usa `text-white`.
- Não criar baú, moeda, gema, vida, energia, recompensa aleatória (`16` §9).
- A Foca só nos lugares do `27` §6.5.
- Errar questão nunca abre o tutor (regra do `20`, não é tocada aqui).
- Nada de `git add -A` / `git add .`: há mudanças não commitadas do usuário que não são desta tarefa (`.agents/`, `.claude/`, `docs/ai/`, `docs/DESIGN.md`, `docs/PRODUCT.md`, `CLAUDE.md`, `.gitignore`, `.prettierignore`, `scripts/validate-skills.mjs`, `skills-lock.json`). Adicione arquivos **pelo caminho**.
- Nunca `push --force`, `rebase`, `amend` de commit publicado (Lovable).
- Push e deploy só em T-27, **com autorização explícita do usuário**.

---

## 1. Mapa rápido do que existe (para não reinventar)

| Precisa de… | Use (não recrie) |
|---|---|
| Modelo da trilha | `buildTrail(s, hojeISO())` → `TrailModel` (`src/lib/learning/trail.ts`) |
| Tipos | `TrailModel`, `TrailSubject`, `TrailSection`, `TrailChapter`, `TrailNode`, `TrailNodeStatus`, `TrailNodeKind`, `ContinueTarget`, `TrailHref` (mesmo arquivo) |
| Estado global | `useAppState()`, `atividadeHoje`, `diasSemAtividade`, `nivelDeXp`, `setTrailSubject`, `hojeISO` (`src/lib/store.ts`) |
| Mascote | `FocaMark` (`src/components/brand/FocaMark.tsx`), `FocaSays` (`src/components/brand/FocaSays.tsx`) |
| Falas | `fala(slot)` via `FocaSays slot=` — nunca texto hardcoded de personalidade |
| Copy funcional | `COPY.trilha.*` (`src/lib/copy.ts`) |
| Componentes DS | `EmptyState`, `GoalRing`, `ProgressBar`, `BottomSheet` (`src/components/ds/`) |
| Trilha atual | `SubjectChips`, `SectionHeader`, `ChapterCompleteSheet`, `ContinueCard`, `TrailHeader`, `LearningPath` (`src/components/learning/`) |
| Utilidades CSS | `btn-primary`, `btn-outline`, `btn-ghost`, `card-soft`, `card-press`, `chip`, `chip-on`, `ds-label`, `skeleton`, `mark-texto`, `anim-pop-in`, `anim-breathe` (`src/styles.css`) |
| Ícones | `lucide-react`: `BookOpen`, `PenLine`, `RotateCcw`, `Check`, `Lock`, `Star`, `Stamp`, `ChevronDown`, `ArrowUp`, `ArrowDown`, `ArrowRight` |
| `cn()` | `src/lib/utils.ts` |

Mapa de ids reais (para testes):

| Capítulo | Nós em ordem |
|---|---|
| `mat-porcentagem` (micro) | `porcentagem-valor`, `porcentagem-aumento-desconto`, `revisao--mat-porcentagem` |
| `por-crase` (micro) | `crase-quando-usar`, `crase-proibida`, `revisao--por-crase` |
| `bio-citologia` (micro) | `citologia-membrana`, `citologia-organelas`, `revisao--bio-citologia` |
| `crase` (legado, "Crase sem medo") | `crase-01-a-regra-de-ouro` … `crase-06-crase-pronome-relativo` (6) |
| `concordancia` (legado) | `concordancia-01-verbal-simples-composto`, `-02-sujeito-posposto-coletivo`, `-03-expressoes-partitivas-porcentagem`, `-04-particula-se`, `-05-verbos-impessoais`, `-06-ser-expressoes-quantidade`, `-07-concordancia-nominal`, `-08-anexo-obrigado-meio-bastante`, `-09-proibido-necessario` |
| `regencia-colocacao` (legado) | `regencia-colocacao-01-regencia-verbal`, `-02-regencia-nominal`, `-03-dupla-regencia`, `-04-proclise`, `-05-enclise-mesoclise`, `-06-colocacao-tempos-compostos` |
| `pontuacao` (legado) | `pontuacao-01-virgula-no-aposto`, `-02-virgula-nas-enumeracoes`, `-03-vocativo`, `-04-termos-deslocados`, … (12) |

Ordem das matérias: `mat`, `por`, `red`, `bio`. Seção `por-gramatica`: `por-crase`, `crase`, `concordancia`, `regencia-colocacao`, `pontuacao`.

---

## 2. Skill routing (resumo)

Carregue **só** as skills da tarefa (1–3 primárias + no máximo 1 de revisão). Se uma skill de plugin não estiver disponível na sua sessão (os plugins estão habilitados em `.claude/settings.json`, mas podem não carregar), use o substituto indicado e registre no `29`.

| Fase | Primárias | Revisão | Substituto se faltar |
|---|---|---|---|
| Processo geral | `superpowers:executing-plans` (uma vez, no início) | `superpowers:verification-before-completion` (em cada checkpoint) | seguir §0 deste arquivo |
| Lógica pura (T-03, T-04) | `superpowers:test-driven-development` | — | escrever teste antes, ver falhar, implementar |
| CSS/motion (T-05) | `motion-design` (local) | `web-design-guidelines` (local) | — |
| Componentes (T-06…T-16) | `frontend-design:frontend-design` + `vercel-react-best-practices` (local) | `web-design-guidelines` (local) | `docs/DESIGN.md` + `redesign-existing-projects` (local) só como checklist anti-genérico |
| Testes E2E (T-17, T-18) | `superpowers:test-driven-development` | — | — |
| A11y (T-19) | `web-design-guidelines` | — | — |
| Refino visual (T-20) | `impeccable:impeccable` (`critique` → `polish`) | `web-design-guidelines` | `redesign-existing-projects` em modo auditoria (sem reescrever) |
| Performance (T-21) | `vercel-react-best-practices` + `agent-skills:performance-optimization` | — | só `vercel-react-best-practices` |
| Deploy (T-22…T-27) | `tanstack-start:tanstack-start` (referência; **ignore o viés Cloudflare**) + `agent-skills:ci-cd-and-automation` | `agent-skills:security-and-hardening` + `repo-security-review --pr` (L2) | `repo-security-review` (local) |
| Revisões finais (T-28) | ver T-28 (5 rodadas, uma skill por rodada) | agent `spec-verifier` | — |
| Registro (T-29) | `agent-skills:documentation-and-adrs` (formato) | — | seguir o formato do `26` |

**Não carregue** nesta iniciativa: `design-taste-frontend` (é para landing page), `ui-ux-pro-max` (só consulta pontual se travar num padrão), marketing, GSAP, `hyperframes*`.

---

## 3. Estratégia de Git

- Antes de T-01: `git switch -c feat/home-trilha-visual` (a partir de `main`).
- Um commit por checkpoint (6 commits), só com os arquivos do checkpoint, adicionados pelo caminho. Mensagem em português, no estilo do repositório, terminando com a linha de coautoria que o ambiente indicar (hoje: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` — use a do **seu** ambiente).

| Checkpoint | Mensagem sugerida (1ª linha) | Arquivos |
|---|---|---|
| A | `feat(trilha): lógica pura do caminho visual e copy (docs/27)` | `docs/27-…`, `docs/28-…`, `docs/00-README.md`, `src/lib/copy.ts`, `src/lib/learning/path-layout.ts`, `src/hooks/usePathFocusScroll.ts`, `tests/unit/path-layout.test.ts` |
| B | `feat(trilha): primitivas do caminho — nó, conector, carimbo, rabisco` | `src/styles.css`, `src/components/learning/path/{PathConnector,PathNode,ChapterMilestone,MarginDoodle}.tsx`, `TrailHeader.tsx`, `ContinueCard.tsx`, `path/FocusCallout.tsx` |
| C | `feat(trilha): home desenhada como caminho com foco, marcos e rolagem` | `path/{ChapterBanner,ChapterSegment,SubjectPath,SubjectPathEnd,RecommendationHint,JumpToFocusButton,TrailSkeleton,TrailError}.tsx`, `LearningPath.tsx`, `src/routes/trilha.tsx` |
| D | `test(trilha): E2E do caminho, matriz de viewports e acabamento` | `tests/e2e/trail-path.spec.ts`, `playwright.config.ts`, ajustes de T-19/T-20/T-21 |
| E | `fix(deploy): preset do Nitro por ambiente, Vercel e CI` | `vite.config.ts`, `vercel.json`, `.github/workflows/ci.yml`, `package-lock.json` (remoção), `README.md`, `.env.example` |
| F | `docs: registro de execução da home em trilha (docs/29)` | `docs/29-…`, `docs/00-README.md`, `docs/21-…`, `docs/DESIGN.md` (só a linha de componentes) |

- `git status` antes de cada commit: se aparecer arquivo de fora da lista, **não** adicione.
- Sem push até T-27.

---

## 4. Checkpoints

| Checkpoint | Tarefas | Comandos ao fim | Commit |
|---|---|---|---|
| **A — Base e lógica pura** | T-01…T-04 | TSC, UNIT | sim |
| **B — Primitivas visuais** | T-05…T-10 | TSC, UNIT, E2E (tudo tem que continuar verde: nada foi ligado ainda na rota) | sim |
| **C — Caminho funcional** | T-11…T-16 | TSC, UNIT, E2E, BUILD | sim |
| **D — Testes, responsivo, acabamento** | T-17…T-21 | TSC, UNIT, E2E, BUILD | sim |
| **E — Deploy** | T-22…T-27 | TSC, UNIT, BUILD, `VERCEL=1 bun run build` | sim (T-27 só com autorização) |
| **F — QA e registro** | T-28, T-29 | todos | sim |

---

# CHECKPOINT A — Base e lógica pura

## T-01 — Baseline

- **Objetivo:** registrar o estado real antes de mexer.
- **Por quê:** sem baseline não há como provar que nada quebrou (HG11).
- **Arquivos para ler:** `package.json`, `playwright.config.ts`, `docs/26-registro-execucao-jornada-v2.md` §4.
- **Alterar/criar:** nada no código. Crie `docs/29-registro-execucao-home-trilha.md` só com o cabeçalho e uma seção "Baseline".
- **Depende de:** aprovação do `27`.
- **Skills:** `superpowers:executing-plans` (carregue uma vez aqui).
- **Instruções:**
  1. `git status` e `git log --oneline -1` — anote o hash.
  2. `git switch -c feat/home-trilha-visual`.
  3. Rode TSC, UNIT, E2E, BUILD. Anote exit code e contagens.
  4. Anote o tamanho do chunk da trilha: `ls -la dist/assets | grep -i trilha` (tamanho em bytes do `trilha-*.js`).
  5. Tire screenshots da `/trilha` atual para comparação (não comitar):
     `bunx playwright screenshot --viewport-size=390,844 http://localhost:8080/trilha test-results/baseline-390.png` (com o dev server rodando) e o mesmo com `320,700`.
- **Teste/Verificação:** os comandos acima.
- **Aceite:** `29` tem a seção Baseline com hash, 4 resultados e tamanho do chunk.
- **Não faça:** "consertar" nada que falhar na baseline sem registrar. Se o E2E da baseline falhar, **pare** e relate ao usuário.

## T-02 — Copy nova

- **Objetivo:** centralizar todas as strings novas antes de usá-las.
- **Por quê:** regra do repo — texto funcional mora em `src/lib/copy.ts` (`docs/20` §7.2).
- **Ler:** `src/lib/copy.ts`, `27` §6.6.
- **Alterar:** `src/lib/copy.ts` (dentro de `COPY.trilha`, depois de `fazerRevisao`).
- **Skills:** nenhuma.
- **Instruções:** acrescente exatamente:

```ts
    // Trilha visual (docs/27 §6.6)
    capituloRotulo: (secao: number, cap: number) => `Seção ${secao} · Capítulo ${cap}`,
    proximaNestaMateria: "Próxima nesta matéria",
    recomenda: (titulo: string, materia: string) => `A Foca recomenda: ${titulo} · ${materia}`,
    irParaAtual: "Voltar para a lição atual",
    carimboPendente: (feitas: number, total: number) => `Carimbo do capítulo · ${feitas}/${total}`,
    carimboConcluido: "Capítulo concluído",
    estrelas: (n: number, max: number) => `${n} de ${max} estrelas`,
    metaHoje: (feitas: number, meta: number) => `${feitas}/${meta} hoje`,
    fimDaMateria: (materia: string) => `Você fechou tudo o que está publicado em ${materia}.`,
    erroTitulo: "A trilha não carregou.",
    erroCorpo: "Tenta de novo. Seu progresso está salvo neste aparelho.",
    tentarDeNovo: "Tentar de novo",
    abrirCapitulo: (titulo: string) => `Abrir ${titulo}`,
    recolherCapitulo: (titulo: string) => `Recolher ${titulo}`,
```

- **Verificação:** TSC; `bun test tests/unit/brand-voice.test.ts` (se ele varrer `copy.ts` e reclamar de alguma string, ajuste só a string e registre).
- **Aceite:** TSC verde; nenhuma string existente alterada.
- **Não faça:** mudar textos existentes; usar exclamação dupla ou emoji.

## T-03 — `path-layout.ts` (lógica pura) + testes

- **Objetivo:** toda decisão de layout/foco/marco numa função pura testada.
- **Por quê:** componentes ficam burros; a IA não "decide" nada dentro do JSX; RF-1, RF-2, RF-6, RF-8, RF-14 viram testáveis.
- **Ler:** `src/lib/learning/trail.ts` (tipos e `buildTrail`), `src/components/learning/ChapterCard.tsx` (lógica de destaque atual, linhas 32–40), `27` §11.2.
- **Criar:** `src/lib/learning/path-layout.ts`, `tests/unit/path-layout.test.ts`.
- **Depende de:** T-02.
- **Skills:** `superpowers:test-driven-development`.
- **Instruções:** escreva primeiro o teste (seção "Teste"), rode, veja falhar, então implemente exatamente este contrato:

```ts
// src/lib/learning/path-layout.ts
import type {
  ContinueTarget, TrailChapter, TrailModel, TrailNode, TrailSection, TrailSubject,
} from "./trail";

/**
 * Geometria e foco da trilha visual (docs/27 §11.2). Tudo puro: nada de DOM,
 * nada de store — os componentes de `components/learning/path/` só renderizam
 * o que sai daqui.
 */

/** Deslocamento X em múltiplos da amplitude, reiniciando a cada capítulo (RF-1). */
export const PATH_PATTERN = [0, -0.5, -1, -0.5, 0, 0.5, 1, 0.5] as const;
/** Amplitude em % da largura do <ol> (cqi). Igual ao `--amp: 16cqi` de styles.css. */
export const PATH_AMP_CQI = 16;
/** Altura de cada linha do caminho. Igual ao `.path-row-node { height: 96px }`. */
export const ROW_HEIGHT_PX = 96;

export function pathK(index: number): number {
  const i = ((Math.trunc(index) % PATH_PATTERN.length) + PATH_PATTERN.length) % PATH_PATTERN.length;
  return PATH_PATTERN[i];
}

/** Lado da legenda: oposto ao deslocamento; centro fica à direita. */
export function captionSide(k: number): "left" | "right" {
  return k > 0 ? "left" : "right";
}

function xOf(k: number): number {
  return 50 + PATH_AMP_CQI * k;
}

/** `d` do SVG do conector (viewBox 0 0 100 96, preserveAspectRatio none). */
export function connectorPathD(fromK: number, toK: number): string {
  const a = xOf(fromK);
  const b = xOf(toK);
  return `M ${a} 0 C ${a} 48, ${b} 48, ${b} 96`;
}

export interface PathFocus {
  nodeId: string;
  /** "global" = é o `currentLessonId` da recomendação; "subject" = próximo desta matéria. */
  scope: "global" | "subject";
}

function* nodesOf(subject: TrailSubject): Generator<{ node: TrailNode; chapter: TrailChapter; section: TrailSection }> {
  for (const section of subject.sections) {
    for (const chapter of section.chapters) {
      for (const node of chapter.nodes) yield { node, chapter, section };
    }
  }
}

/** RF-2 — ver docs/27 §11.2 para a ordem das regras. */
export function pathFocus(model: TrailModel, subjectId: string): PathFocus | null {
  const subject = model.subjects.find((s) => s.id === subjectId);
  if (!subject) return null;
  const current = model.currentLessonId;
  if (current) {
    for (const { node } of nodesOf(subject)) {
      if (node.id === current) return { nodeId: current, scope: "global" };
    }
  }
  for (const { node } of nodesOf(subject)) {
    if (node.kind !== "revisao" && (node.status === "in-progress" || node.status === "available")) {
      return { nodeId: node.id, scope: "subject" };
    }
  }
  for (const { node } of nodesOf(subject)) {
    if (node.kind === "revisao" && node.status === "available") return { nodeId: node.id, scope: "subject" };
  }
  return null;
}

/** Alvo do callout: o `continueTarget` global, ou um alvo montado do próprio nó (foco "subject"). */
export function resolveFocusTarget(
  model: TrailModel,
  subject: TrailSubject,
  focus: PathFocus | null,
): ContinueTarget | null {
  if (!focus) return null;
  if (focus.scope === "global" && model.continueTarget?.lessonId === focus.nodeId) {
    return model.continueTarget;
  }
  for (const { node, chapter, section } of nodesOf(subject)) {
    if (node.id !== focus.nodeId) continue;
    return {
      lessonId: node.id,
      source: node.source,
      title: node.title,
      chapterTitle: chapter.title,
      sectionTitle: section.title,
      subjectId: subject.id,
      href: node.href,
      reason: "legacy-next",
      explanation: "",
      firstTime: false,
    };
  }
  return null;
}

/** RF-8. */
export function chapterDefaultExpanded(
  chapter: TrailChapter,
  focusId: string | null,
  highlightId?: string,
): boolean {
  if (chapter.status === "locked") return false;
  if (chapter.status === "in-progress") return true;
  return chapter.nodes.some((n) => n.id === focusId || (highlightId !== undefined && n.id === highlightId));
}

export interface ChapterMilestoneData {
  done: boolean;
  completed: number;
  total: number;
  stars: number;
  maxStars: number;
}

/** RF-6 — revisão não conta (docs/25 §7.5). */
export function chapterMilestone(chapter: TrailChapter): ChapterMilestoneData {
  const core = chapter.nodes.filter((n) => n.kind !== "revisao");
  const stars = core.reduce((sum, n) => sum + (n.status === "completed" ? (n.stars ?? 0) : 0), 0);
  return {
    done: chapter.status === "completed",
    completed: chapter.completedCount,
    total: chapter.totalCount,
    stars,
    maxStars: core.length * 3,
  };
}

export const RABISCOS: Record<string, readonly string[]> = {
  mat: ["%", "x²", "π", "÷"],
  por: ["à", "“ ”", "ç", "?!"],
  red: ["¶", "§", "C5", "…"],
  bio: ["DNA", "ATP", "O₂", "2n"],
  default: ["*", "~", "✓"],
};

/** Um rabisco a cada 8 linhas, na linha de índice 4 do ciclo (k = 0, margem esquerda livre). */
export function doodleFor(subjectId: string, chapterIndex: number, rowIndex: number): string | null {
  if (rowIndex % PATH_PATTERN.length !== 4) return null;
  const glifos = RABISCOS[subjectId] ?? RABISCOS.default;
  return glifos[(chapterIndex + Math.floor(rowIndex / PATH_PATTERN.length)) % glifos.length];
}

/** RF-14 — mesma regra que `ChapterCard` já usava: o nó destacado e o seguinte, se liberado. */
export function highlightPlan(
  chapter: TrailChapter,
  highlightId?: string,
): { primaryId?: string; secondaryId?: string } {
  if (!highlightId) return {};
  const i = chapter.nodes.findIndex((n) => n.id === highlightId);
  if (i < 0) return {};
  const next = chapter.nodes[i + 1];
  const secondaryId = next && (next.status === "current" || next.status === "available") ? next.id : undefined;
  return { primaryId: highlightId, secondaryId };
}

export interface PathConnectorData {
  fromK: number;
  toK: number;
  traced: boolean;
}

export type PathRow =
  | {
      type: "node";
      key: string;
      node: TrailNode;
      index: number;
      k: number;
      isFocus: boolean;
      connector: PathConnectorData | null;
      doodle: string | null;
    }
  | {
      type: "milestone";
      key: string;
      k: 0;
      connector: PathConnectorData | null;
      milestone: ChapterMilestoneData;
    };

export function buildChapterRows(
  chapter: TrailChapter,
  focusId: string | null,
  subjectId: string,
  chapterIndex: number,
): PathRow[] {
  const rows: PathRow[] = [];
  chapter.nodes.forEach((node, index) => {
    const k = pathK(index);
    const prev = index > 0 ? chapter.nodes[index - 1] : undefined;
    const prevIsFocus = prev !== undefined && prev.id === focusId;
    rows.push({
      type: "node",
      key: node.id,
      node,
      index,
      k,
      isFocus: node.id === focusId,
      connector:
        prev && !prevIsFocus ? { fromK: pathK(index - 1), toK: k, traced: prev.status === "completed" } : null,
      doodle: doodleFor(subjectId, chapterIndex, index),
    });
  });
  const last = chapter.nodes[chapter.nodes.length - 1];
  const lastIsFocus = last !== undefined && last.id === focusId;
  rows.push({
    type: "milestone",
    key: `${chapter.id}::carimbo`,
    k: 0,
    connector:
      last && !lastIsFocus
        ? { fromK: pathK(chapter.nodes.length - 1), toK: 0, traced: last.status === "completed" }
        : null,
    milestone: chapterMilestone(chapter),
  });
  return rows;
}

/* ---------------------------------------------------- rolagem (usado por usePathFocusScroll) */

/** RF-9: rola só uma vez por chave; sem destaque, respeita posição restaurada pelo router. */
export function shouldAutoScroll(p: {
  scrollY: number;
  hasHighlight: boolean;
  doneKey: string | null;
  key: string;
}): boolean {
  if (p.doneKey === p.key) return false;
  if (!p.hasHighlight && p.scrollY > 4) return false;
  return true;
}

/** Bloco inteiro visível entre o topo fixo (chips + banner) e a bottom nav. */
export function isComfortablyVisible(
  rect: { top: number; bottom: number },
  viewport: { height: number; topInset: number; bottomInset: number },
): boolean {
  return rect.top >= viewport.topInset && rect.bottom <= viewport.height - viewport.bottomInset;
}
```

- **Contrato de dados:** entradas vêm de `buildTrail`; nenhuma função lê store ou DOM.
- **Casos de borda (todos precisam de teste):** capítulo com 1 nó; foco no último nó (carimbo sem conector); foco no meio (linha seguinte sem conector); `highlightId` inexistente; matéria inexistente em `pathFocus`; matéria sem pendências (`null`); matéria só-legado (foco `"subject"`); revisão como único pendente.
- **Teste** — `tests/unit/path-layout.test.ts` (use `bun:test`, como os outros testes do diretório). Monte fixtures à mão:

```ts
import { describe, expect, test } from "bun:test";
import type { TrailChapter, TrailModel, TrailNode, TrailSubject } from "@/lib/learning/trail";
import {
  PATH_PATTERN, buildChapterRows, captionSide, chapterDefaultExpanded, chapterMilestone,
  connectorPathD, doodleFor, highlightPlan, isComfortablyVisible, pathFocus, pathK,
  resolveFocusTarget, shouldAutoScroll,
} from "@/lib/learning/path-layout";

function node(id: string, status: TrailNode["status"], extra: Partial<TrailNode> = {}): TrailNode {
  return {
    id, status, source: "micro", kind: "aula", title: id, questionCount: 4, reviewDue: false,
    href: { to: "/learn/$lessonId", params: { lessonId: id } }, ...extra,
  };
}
function chapter(id: string, nodes: TrailNode[], status: TrailChapter["status"] = "available"): TrailChapter {
  const core = nodes.filter((n) => n.kind !== "revisao");
  return {
    id, title: id, nodes, status, containsCurrent: nodes.some((n) => n.status === "current"),
    completedCount: core.filter((n) => n.status === "completed").length, totalCount: core.length,
  };
}
function subject(id: string, chapters: TrailChapter[]): TrailSubject {
  return {
    id, name: id, completedCount: 0, totalCount: 0,
    sections: [{ id: `${id}-s1`, index: 1, title: "S1", chapters, completedCount: 0, totalCount: 0, status: "available" }],
  };
}
```

  Casos mínimos (um `test` cada):
  1. `pathK(0..8)` = `0,-0.5,-1,-0.5,0,0.5,1,0.5,0`; `pathK(-1)` = `0.5`.
  2. `captionSide(0)` = right, `(-1)` = right, `(0.5)` = left.
  3. `connectorPathD(0, -1)` = `"M 50 0 C 50 48, 34 48, 34 96"`.
  4. `pathFocus` global: `currentLessonId` dentro da matéria → `{scope:"global"}`.
  5. `pathFocus` subject: `currentLessonId` de outra matéria; matéria com `[completed, available, locked]` → o `available`, `scope:"subject"`.
  6. `pathFocus` só revisão pendente → revisão; tudo concluído → `null`; matéria inexistente → `null`.
  7. `resolveFocusTarget` global devolve o mesmo objeto `model.continueTarget`; subject devolve `href` do nó e `explanation: ""`.
  8. `chapterDefaultExpanded`: com foco → true; com highlight → true; `in-progress` → true; `completed` sem foco → false; `locked` com foco → false.
  9. `chapterMilestone`: 3 aulas (2 concluídas com 3 e 2 estrelas) + 1 revisão concluída com 3 → `{stars:5, maxStars:9, completed:2, total:3}`.
  10. `doodleFor("mat", 0, 4)` = `"%"`; `doodleFor("mat",0,3)` = `null`; `doodleFor("xyz",0,4)` = `"*"`; `doodleFor("mat",0,12)` = `"x²"`.
  11. `highlightPlan`: próximo `available` vira secundário; próximo `locked` não; id inexistente → `{}`.
  12. `buildChapterRows` com foco no índice 1 de 3: linha 0 sem conector; linha 1 com conector; linha 2 **sem** conector; carimbo com conector `traced` = status do último `completed`; `rows.length === 4`; última é `milestone`.
  13. `buildChapterRows` com foco no último nó: carimbo sem conector.
  14. `shouldAutoScroll`: mesma chave → false; `scrollY 300` sem destaque → false; `scrollY 300` com destaque → true; `scrollY 0` → true.
  15. `isComfortablyVisible`: `{top:130,bottom:600}` em `{height:844, topInset:120, bottomInset:80}` → true; `bottom:800` → false.
- **Verificação:** `bun test tests/unit/path-layout.test.ts`, depois UNIT inteiro e TSC.
- **Aceite:** ≥ 15 testes novos verdes; UNIT total = 257 + novos, 0 falhas.
- **Não faça:** importar React, `window`, `document` ou o store neste arquivo; mudar `trail.ts`.

## T-04 — Hook `usePathFocusScroll`

- **Objetivo:** rolagem única até o foco (RF-9) e visibilidade do foco para o botão (RF-10), com **um** `IntersectionObserver`.
- **Por quê:** isolar efeitos de DOM num lugar; evitar rolagem repetida a cada render.
- **Ler:** `src/router.tsx` (`scrollRestoration: true`), `src/components/TutorBubble.tsx:213` (posição do FAB), T-03.
- **Criar:** `src/hooks/usePathFocusScroll.ts`.
- **Depende de:** T-03.
- **Skills:** `vercel-react-best-practices` (regras `rerender-dependencies`, `client-passive-event-listeners`, `rerender-use-ref-transient-values`).
- **Instruções / contrato:**

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { isComfortablyVisible, shouldAutoScroll } from "@/lib/learning/path-layout";

/** Altura do que fica fixo no topo (chips ≈ 61px + banner do capítulo ≈ 64px). */
export const PATH_TOP_INSET = 128;
/** Bottom nav (64px) + folga. */
export const PATH_BOTTOM_INSET = 88;

function rowEl(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-path-row="${CSS.escape(id)}"]`);
}
function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function usePathFocusScroll({
  subjectId,
  focusId,
  highlightId,
  focusRendered,
}: {
  subjectId: string;
  focusId: string | null;
  highlightId?: string;
  /** false quando o capítulo do foco está recolhido (o <li> não existe no DOM). */
  focusRendered: boolean;
}): { focusOffscreen: boolean; focusAbove: boolean; scrollToFocus: () => void } {
  const doneKeyRef = useRef<string | null>(null);
  const [focusOffscreen, setFocusOffscreen] = useState(false);
  const [focusAbove, setFocusAbove] = useState(false);

  // (1) Rolagem de entrada — uma vez por (matéria, alvo).
  useEffect(() => {
    const target = highlightId ?? focusId;
    if (!target) return;
    const key = `${subjectId}|${target}`;
    if (!shouldAutoScroll({ scrollY: window.scrollY, hasHighlight: Boolean(highlightId), doneKey: doneKeyRef.current, key })) {
      doneKeyRef.current = key; // posição restaurada pelo router vence; não tenta de novo
      return;
    }
    const raf = requestAnimationFrame(() => {
      doneKeyRef.current = key;
      const el = rowEl(target);
      if (!el) return;
      const ok = isComfortablyVisible(el.getBoundingClientRect(), {
        height: window.innerHeight, topInset: PATH_TOP_INSET, bottomInset: PATH_BOTTOM_INSET,
      });
      if (!ok) el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [subjectId, focusId, highlightId]);

  // (2) Visibilidade do foco — um observer, só no <li> do foco.
  useEffect(() => {
    if (!focusId || !focusRendered) {
      setFocusOffscreen(Boolean(focusId)); // foco existe mas capítulo recolhido → mostra o botão
      setFocusAbove(false);
      return;
    }
    const el = rowEl(focusId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setFocusOffscreen(!entry.isIntersecting);
        setFocusAbove(entry.boundingClientRect.top < 0);
      },
      { rootMargin: `-${PATH_TOP_INSET}px 0px -${PATH_BOTTOM_INSET}px 0px`, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [focusId, focusRendered]);

  const scrollToFocus = useCallback(() => {
    if (!focusId) return;
    rowEl(focusId)?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [focusId]);

  return { focusOffscreen, focusAbove, scrollToFocus };
}
```

- **Casos de borda:** `CSS.escape` existe em todos os navegadores-alvo; ids têm acentos (`pontuacao-05-entre-orações`) — por isso `CSS.escape`. Sem `IntersectionObserver` (teste unitário/SSR): não quebra.
- **Teste:** a lógica testável já está em T-03 (`shouldAutoScroll`, `isComfortablyVisible`); o hook é coberto pelo E2E de T-17.
- **Verificação:** TSC.
- **Aceite:** TSC verde; nenhum listener de `scroll`/`resize` no arquivo.
- **Não faça:** `window.addEventListener("scroll", …)`; rolar dentro de `useLayoutEffect`; rolar sem a checagem de chave.

### Fim do Checkpoint A

TSC, UNIT → `git diff` → commit A (§3). Registre no `29`.

---

# CHECKPOINT B — Primitivas visuais

## T-05 — CSS do caminho (`styles.css`)

- **Objetivo:** todas as regras visuais do caminho num bloco, só com tokens.
- **Por quê:** geometria com `cqi` + `var(--k)` evita medir em JS; estados por `data-*` evitam `className` gigante; dark mode automático.
- **Ler:** `src/styles.css` (tokens `:root`/`.dark`, `@utility anim-*`, bloco `prefers-reduced-motion`), `27` §6.4, §6.8, §11.5, `docs/DESIGN.md` (Elevation, Shapes).
- **Alterar:** `src/styles.css` — cole o bloco abaixo **no fim do arquivo**, e o `@utility anim-halo` + os dois `@keyframes` logo **depois** de `@utility anim-float-in` (fica junto das outras animações; o bloco de reduced motion, que vem antes no arquivo, já cobre tudo porque usa `*`).
- **Skills:** `motion-design` (já decidido no `27` §6.8 — só confira), revisão `web-design-guidelines`.

```css
/* Trilha visual — halo do nó foco e traço do conector (docs/27 §6.8). */
@keyframes ft-halo {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.25;
  }
}
@keyframes ft-draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@utility anim-halo {
  animation: ft-halo 2.4s ease-in-out infinite;
}
```

```css
/* ------------------------------------------------------------------
   Trilha visual (docs/27 §11.5, docs/28 T-05). Geometria em unidades de
   container: o <ol class="path-list"> é o container; --amp é a amplitude
   do zigue-zague; cada linha define --k (−1…1), --k-abs e --node-half.
   ------------------------------------------------------------------ */
@layer components {
  .path-margin {
    position: relative;
  }
  /* A "margem do caderno": linha de lápis à esquerda do caminho. */
  .path-margin::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: -8px;
    width: 2px;
    background: var(--color-gelo);
    pointer-events: none;
  }

  .path-list {
    container-type: inline-size;
    --amp: 16cqi;
    position: relative;
    list-style: none;
    margin: 0;
    padding: 12px 0 8px;
  }
  .path-row {
    position: relative;
  }
  .path-row-node {
    position: relative;
    height: 96px;
  }

  /* Âncora do nó: centralizada e deslocada por --k. É o <a>/<div> interativo. */
  .path-node-anchor {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    border-radius: 999px;
    transform: translate(calc(-50% + var(--amp) * var(--k)), -50%);
    -webkit-tap-highlight-color: transparent;
  }

  .path-node {
    position: relative;
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    border-radius: 999px;
    background: var(--color-cards);
    border: 2px solid var(--color-abismo);
    color: var(--color-abismo);
    box-shadow: 0 4px 0 var(--color-gelo);
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease;
  }
  a.path-node-anchor:active .path-node {
    transform: translateY(4px);
    box-shadow: none;
  }
  [data-status="completed"] > .path-node {
    background: var(--color-mar);
    border-color: var(--color-mar);
    color: white;
    box-shadow: 0 4px 0 var(--color-mar-fundo);
  }
  [data-status="in-progress"] > .path-node {
    border-color: var(--color-mar);
    color: var(--color-mar-fundo);
  }
  [data-status="locked"] > .path-node {
    background: var(--color-gelo);
    border: 2px dashed var(--color-pelo);
    color: var(--color-nevoa);
    box-shadow: none;
  }
  [data-focus="true"] > .path-node {
    width: 76px;
    height: 76px;
    background: var(--color-cards);
    border: 4px solid var(--color-mar);
    color: var(--color-mar-fundo);
    box-shadow: 0 4px 0 var(--color-mar-fundo);
  }
  /* Revisão = checkpoint: anel duplo, mesmo formato. */
  [data-kind="revisao"] > .path-node {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }

  /* Halo "é aqui" — anel fora do nó; só ele anima (transform/opacity). */
  .path-halo {
    position: absolute;
    inset: -12px;
    border-radius: 999px;
    border: 3px solid var(--color-mar);
    opacity: 0.45;
    pointer-events: none;
  }

  /* Legenda ao lado do nó: largura = espaço livre daquele lado. */
  .path-caption {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: calc(50cqi + var(--amp) * var(--k-abs) - var(--node-half) - 16px);
    max-width: 180px;
    pointer-events: none;
  }
  .path-caption[data-side="right"] {
    left: calc(100% + 12px);
    text-align: left;
  }
  .path-caption[data-side="left"] {
    right: calc(100% + 12px);
    text-align: right;
  }

  /* Conector: SVG que sobe do centro da linha anterior ao centro desta. */
  .path-connector {
    position: absolute;
    left: 0;
    top: -48px;
    width: 100%;
    height: 96px;
    overflow: visible;
    z-index: 0;
    pointer-events: none;
  }
  .path-connector path {
    fill: none;
    stroke: var(--color-pelo);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 0.015 0.05;
    vector-effect: non-scaling-stroke;
  }
  .path-connector--traced path {
    stroke: var(--color-mar);
    stroke-dasharray: none;
    opacity: 0.55;
  }
  .path-connector--draw path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: ft-draw 0.4s var(--ease-out) 0.12s forwards;
  }

  /* Carimbo do capítulo (marco). */
  .path-milestone {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 72px;
    height: 72px;
    border-radius: 999px;
    transform: translate(-50%, -50%);
    border: 2px dashed var(--color-pelo);
    color: var(--color-nevoa);
    background: var(--color-neve);
  }
  .path-milestone[data-done="true"] {
    border: 2px solid var(--color-abismo);
    background: var(--color-recompensa);
    color: var(--color-abismo);
  }

  /* Callout do foco: seta apontando para o nó (--pointer-k vem da linha). */
  .path-callout-pointer {
    position: absolute;
    top: -9px;
    left: calc(50% + var(--amp) * var(--pointer-k, 0));
    width: 16px;
    height: 16px;
    transform: translateX(-50%) rotate(45deg);
    background: var(--color-cards);
    border-left: 2px solid var(--color-mar);
    border-top: 2px solid var(--color-mar);
  }

  /* Rabisco de margem: decorativo, lápis claro. */
  .path-doodle {
    position: absolute;
    top: 50%;
    left: 4%;
    transform: translateY(-50%) rotate(-8deg);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 1;
    color: var(--color-pelo);
    pointer-events: none;
    user-select: none;
  }
}
```

- **Responsivo (conferido por conta):** `--amp` = 16% da largura do `<ol>`: 320 px → `<ol>` 280 → 45 px; 375 → 335 → 54 px; 390 → 350 → 56 px; 440 (máximo do `PhoneFrame`, inclusive no desktop) → 400 → 64 px. Legenda à direita com k=0 em 320: `140 − 32 − 16 = 92 px`; em 390: `175 − 48 = 127 px`. Nó mais à esquerda (k=−1) em 320: centro em 95 px → borda em 63 px, dentro do `<ol>`.
- **Acessibilidade:** reduced motion: o bloco global zera a duração; `.path-halo` fica estático com `opacity: .45`; `ft-draw` com `forwards` termina traçado.
- **Verificação:** BUILD (o Tailwind v4 precisa compilar o `@layer components`); abra `/trilha` no dev — nada muda ainda (classes não usadas).
- **Aceite:** build verde; `grep -n "#[0-9a-fA-F]\{3,6\}" ` no bloco novo = vazio.
- **Não faça:** mexer em tokens existentes; animar `box-shadow`, `width`, `height` ou `top`; hex.

## T-06 — `PathConnector`

- **Criar:** `src/components/learning/path/PathConnector.tsx`.
- **Depende de:** T-03, T-05. **Skills:** `frontend-design:frontend-design`, `vercel-react-best-practices` (`rendering-svg-precision`, `rendering-hoist-jsx`).

```tsx
import { memo } from "react";
import { connectorPathD } from "@/lib/learning/path-layout";
import { cn } from "@/lib/utils";

/** Traço entre dois nós (docs/27 §6.4): caneta sólida se o anterior foi concluído; lápis pontilhado se não. */
export const PathConnector = memo(function PathConnector({
  fromK,
  toK,
  traced,
  draw = false,
}: {
  fromK: number;
  toK: number;
  traced: boolean;
  /** true só no conector recém-liberado ao voltar de uma lição (RF-14). */
  draw?: boolean;
}) {
  return (
    <svg
      className={cn("path-connector", traced && "path-connector--traced", draw && "path-connector--draw")}
      viewBox="0 0 100 96"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={connectorPathD(fromK, toK)} pathLength={1} />
    </svg>
  );
});
```

- **Aceite:** TSC. **Não faça:** medir o DOM; usar `stroke` com cor fixa.

## T-07 — `PathNode`

- **Objetivo:** o nó circular com legenda, estados do `27` §6.4, link ou div.
- **Ler:** `src/components/learning/LessonNode.tsx` (copie `estadoLabel` e o padrão de `aria-label`), `27` §6.4.
- **Criar:** `src/components/learning/path/PathNode.tsx`.
- **Depende de:** T-05. **Skills:** `frontend-design:frontend-design`, `vercel-react-best-practices` (`rerender-memo`). **Revisão:** `web-design-guidelines`.
- **Contrato:**

```tsx
import { memo, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Check, Lock, PenLine, RotateCcw, Star } from "lucide-react";
import { COPY } from "@/lib/copy";
import { captionSide } from "@/lib/learning/path-layout";
import type { TrailNode } from "@/lib/learning/trail";
import { cn } from "@/lib/utils";

const KIND_ICON = { aula: BookOpen, pratica: PenLine, revisao: RotateCcw } as const;

/** Mesmo texto de estado do LessonNode (contrato dos E2E: "Disponível", "Bloqueada", "Continuar daqui"…). */
export function estadoLabel(node: TrailNode): string { /* copiar de LessonNode.tsx sem mudar */ }

interface PathNodeProps {
  node: TrailNode;
  k: number;
  isFocus: boolean;
  highlight?: boolean;
  highlightDelayMs?: number;
}

function PathNodeImpl({ node, k, isFocus, highlight = false, highlightDelayMs }: PathNodeProps) {
  const estado = estadoLabel(node);
  const locked = node.status === "locked";
  const Icon = locked ? Lock : node.status === "completed" ? (node.reviewDue ? RotateCcw : Check) : KIND_ICON[node.kind];
  const side = captionSide(k);
  const ariaLabel = `${node.title} — ${estado}`;

  const circle = (
    <span
      className={cn("path-node", highlight && "anim-pop-in")}
      style={highlight && highlightDelayMs ? { animationDelay: `${highlightDelayMs}ms` } : undefined}
      aria-hidden="true"
    >
      {isFocus && <span className="path-halo anim-halo" />}
      <Icon size={isFocus ? 30 : 26} strokeWidth={2.4} />
    </span>
  );

  const caption = (
    <span className="path-caption" data-side={side}>
      {!isFocus && (
        <span className={cn("block font-display text-sm font-bold leading-tight line-clamp-2", locked ? "text-nevoa" : "text-abismo")}>
          {node.title}
        </span>
      )}
      <span className={cn("mt-0.5 block text-xs font-semibold", isFocus ? "text-mar-fundo" : "text-nevoa")}>
        {estado}
      </span>
      {node.status === "completed" && node.stars !== undefined && (
        <span className={cn("mt-1 flex gap-0.5", side === "left" && "justify-end")} aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <Star key={n} size={12} className={n <= (node.stars ?? 0) ? "fill-recompensa text-recompensa" : "text-gelo"} />
          ))}
        </span>
      )}
    </span>
  );

  const common = {
    className: "path-node-anchor",
    "data-path-node": node.id,
    "data-status": node.status,
    "data-focus": isFocus ? "true" : "false",
    "data-kind": node.kind,
    "aria-label": ariaLabel,
  } as const;

  if (locked) {
    return (
      <div {...common} aria-disabled="true">
        {circle}
        {caption}
      </div>
    );
  }
  return (
    <Link {...node.href} {...common}>
      {circle}
      {caption}
    </Link>
  );
}

/** memo com comparador: buildTrail recria objetos a cada mudança do store (docs/27 §7). */
export const PathNode = memo(PathNodeImpl, (a, b) =>
  a.k === b.k &&
  a.isFocus === b.isFocus &&
  a.highlight === b.highlight &&
  a.highlightDelayMs === b.highlightDelayMs &&
  a.node.id === b.node.id &&
  a.node.status === b.node.status &&
  a.node.stars === b.node.stars &&
  a.node.reviewDue === b.node.reviewDue &&
  a.node.title === b.node.title,
);
```

  O `<li>` pai (T-12) define `style={{ "--k": k, "--k-abs": Math.abs(k), "--node-half": isFocus ? "38px" : "32px" } as CSSProperties}` — por isso `CSSProperties` fica importado aqui só se você extrair um helper `rowStyle(k, isFocus)`; exporte-o deste arquivo:

```tsx
export function rowStyle(k: number, isFocus: boolean): CSSProperties {
  return { "--k": k, "--k-abs": Math.abs(k), "--node-half": isFocus ? "38px" : "32px" } as CSSProperties;
}
```

- **Casos de borda:** `stars` indefinido; título de 40+ caracteres (`line-clamp-2`); foco `available` (matéria só-legado) mostra "Disponível" em `text-mar-fundo`; revisão bloqueada (anel duplo cinza).
- **Responsivo:** nenhum breakpoint — a legenda se ajusta pela largura calculada em CSS.
- **Acessibilidade:** o `aria-label` é o nome acessível completo; o círculo e as estrelas são `aria-hidden`; `rounded-full` na âncora faz o outline de foco seguir o círculo; alvo 64/76 px.
- **Verificação:** TSC.
- **Aceite:** TSC; o componente não lê store.
- **Não faça:** botão dentro de link; `onClick` para navegar (use `Link`); texto de estado diferente do `LessonNode`.

## T-08 — `ChapterMilestone` e `MarginDoodle`

- **Criar:** `src/components/learning/path/ChapterMilestone.tsx`, `src/components/learning/path/MarginDoodle.tsx`.
- **Depende de:** T-03, T-05. **Skills:** `frontend-design:frontend-design`.

```tsx
// ChapterMilestone.tsx
import { Stamp } from "lucide-react";
import { COPY } from "@/lib/copy";
import type { ChapterMilestoneData } from "@/lib/learning/path-layout";

/** Carimbo do capítulo (RF-6). Marco determinístico — nunca baú, nunca sorteio (docs/16 §9). */
export function ChapterMilestone({ m }: { m: ChapterMilestoneData }) {
  const label = m.done
    ? `${COPY.trilha.carimboConcluido}, ${COPY.trilha.estrelas(m.stars, m.maxStars)}`
    : COPY.trilha.carimboPendente(m.completed, m.total);
  return (
    <>
      <span className="path-milestone" data-done={m.done ? "true" : "false"} role="img" aria-label={label}>
        <Stamp size={28} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="path-caption" data-side="right" style={{ left: "calc(50% + 48px)" }} aria-hidden="true">
        <span className="block font-display text-sm font-bold text-abismo">
          {m.done ? COPY.trilha.carimboConcluido : COPY.trilha.carimboPendente(m.completed, m.total)}
        </span>
        {m.done && (
          <span className="mt-0.5 block font-mono text-xs font-bold text-nevoa">
            ★ {m.stars}/{m.maxStars}
          </span>
        )}
      </span>
    </>
  );
}
```

  Nota: a legenda do carimbo é posicionada relativa à linha (não a uma âncora), daí o `left` inline; a linha do carimbo usa `rowStyle(0, false)` para `--k-abs`/`--node-half` existirem.

```tsx
// MarginDoodle.tsx
/** Rabisco de margem (docs/27 §11.4). Decorativo: fora da árvore de acessibilidade. */
export function MarginDoodle({ glyph }: { glyph: string }) {
  return (
    <span className="path-doodle" aria-hidden="true">
      {glyph}
    </span>
  );
}
```

- **Aceite:** TSC. **Não faça:** usar a Foca no carimbo; cor amarela como texto (o amarelo é fundo com texto `abismo`).

## T-09 — `TrailHeader` vira barra de métricas + `trailGreeting`

- **Objetivo:** topo enxuto (RF-16) e a lógica de saudação exportada para o callout.
- **Ler:** `src/components/learning/TrailHeader.tsx`, `src/components/ds/GoalRing.tsx`, `tests/e2e/trail-home.spec.ts` (asserções `/Nível \d/` e `/\d+ dias?$/`).
- **Alterar:** `src/components/learning/TrailHeader.tsx`.
- **Depende de:** T-02. **Skills:** `frontend-design:frontend-design`.
- **Contrato:**

```tsx
import { GoalRing } from "@/components/ds/GoalRing";
import { ProgressBar } from "@/components/ds/ProgressBar";
import type { FocaExpression } from "@/components/brand/FocaMark";
import { COPY } from "@/lib/copy";
import { atividadeHoje, diasSemAtividade, nivelDeXp, type AppState } from "@/lib/store";
import type { VozSlot } from "@/lib/voz";

/** Mesma regra de antes (docs/15 §3.2): acolhedora > meta fechada > bom dia. Agora usada pelo callout do foco. */
export function trailGreeting(s: AppState): { slot: VozSlot; expression: FocaExpression } {
  const hoje = atividadeHoje(s);
  const metaFechada = hoje.completedBlockIds.length >= s.prefs.dailyLessons;
  if (diasSemAtividade(s) >= 2) return { slot: "retorno", expression: "acolhedora" };
  if (metaFechada) return { slot: "meta", expression: "orgulhosa" };
  return { slot: "bomdia", expression: "neutra" };
}

export function TrailHeader({ s }: { s: AppState }) {
  const hoje = atividadeHoje(s);
  const goal = s.prefs.dailyLessons;
  const done = hoje.completedBlockIds.length;
  const nivel = nivelDeXp(s.progress.xp);
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 font-mono text-sm font-bold text-abismo">
        <span className="mark-texto">{s.progress.streak}</span> {s.progress.streak === 1 ? "dia" : "dias"}
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <GoalRing value={done} max={goal} size={40} />
        <span className="hidden font-mono text-xs font-bold text-nevoa min-[360px]:inline">
          {COPY.trilha.metaHoje(Math.min(done, goal), goal)}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        {/* mesmo bloco "Nível N · atual/proximo" + ProgressBar do arquivo atual, sem mudar textos */}
      </div>
    </div>
  );
}
```

- **Casos de borda:** `streak 0` → "0 dias"; `goal` 1; nível no máximo (`proximo` 0 → mesma lógica atual `|| nivel.atual`).
- **Responsivo:** 320 px: some o "x/y hoje"; a barra de nível encolhe (`min-w-0 flex-1`).
- **Acessibilidade:** `GoalRing` já tem semântica própria (confira; se não tiver `aria-label`, **não** adicione aqui — registre como achado para T-19).
- **Teste:** E2E existente `trail-home.spec.ts` (a) — confirme que o texto do streak continua casando com `/\d+ dias?$/` (o `textContent` do span é `"5 dias"`).
- **Aceite:** TSC; `FocaSays` não é mais importado aqui.
- **Não faça:** adicionar XP total, moeda, energia, ícone de fogo; tornar sticky.

## T-10 — `ContinueCard` variante callout + `FocusCallout`

- **Objetivo:** reaproveitar o card existente como callout ancorado ao nó foco (D-4), com a Foca dentro.
- **Ler:** `src/components/learning/ContinueCard.tsx`, `src/components/brand/FocaSays.tsx`, E2E `trail-home.spec.ts` (b) e `trilha.spec.ts` (heading, link "Continuar" exato).
- **Alterar:** `ContinueCard.tsx`. **Criar:** `src/components/learning/path/FocusCallout.tsx`.
- **Depende de:** T-05, T-09. **Skills:** `frontend-design:frontend-design`, `vercel-react-best-practices`.
- **Contrato do `ContinueCard` (compatível com o uso atual — sem props novas ele renderiza igual a hoje):**

```tsx
export function ContinueCard({
  target,
  variant = "card",
  label,
  pointerK,
  lead,
}: {
  target: ContinueTarget | null;
  variant?: "card" | "callout";
  /** Sobrescreve "Continuar"/"Começar por aqui" (ex.: "Próxima nesta matéria"). */
  label?: string;
  /** Só no callout: posição X do nó (mesmo `k` da linha) para a seta. */
  pointerK?: number;
  /** Só no callout: conteúdo acima do rótulo (a fala da Foca). */
  lead?: ReactNode;
})
```

  - `target === null` → mesmo `EmptyState` de hoje (só no `variant="card"`; no callout, `return null`).
  - `variant="card"`: markup atual, sem mudança.
  - `variant="callout"`: raiz `<div className="card-soft relative p-4" style={{ borderColor: "var(--color-mar)", "--pointer-k": pointerK ?? 0 } as CSSProperties}>`, primeiro filho `<span className="path-callout-pointer" aria-hidden="true" />`, depois `lead` (se houver) dentro de `<div className="mb-3">`, depois o mesmo conteúdo do card (rótulo `ds-label`, `h2` com título — **mantenha `h2`**, o E2E procura `heading`), linha "Capítulo › Seção · Tipo · N questões", explicação (se não vazia), e o `Link {...target.href} className="btn-primary mt-4 w-full"` com texto **exatamente** `COPY.trilha.continuar`.
  - Rótulo: `label ?? (target.firstTime ? COPY.trilha.comecarAqui : COPY.trilha.continuar)`.
  - `h2` no callout usa `text-lg` (no card continua `text-[22px]` — não mude o card).

```tsx
// FocusCallout.tsx
import { FocaSays } from "@/components/brand/FocaSays";
import type { FocaExpression } from "@/components/brand/FocaMark";
import { ContinueCard } from "@/components/learning/ContinueCard";
import { COPY } from "@/lib/copy";
import type { PathFocus } from "@/lib/learning/path-layout";
import type { ContinueTarget } from "@/lib/learning/trail";
import type { VozSlot } from "@/lib/voz";

/** Foca + CTA logo abaixo do nó foco (docs/27 D-4, §6.5). Única Foca do <main>. */
export function FocusCallout({
  target,
  focus,
  pointerK,
  greeting,
}: {
  target: ContinueTarget;
  focus: PathFocus;
  pointerK: number;
  greeting: { slot: VozSlot; expression: FocaExpression };
}) {
  return (
    <div className="px-1 pb-4 pt-3 anim-float-in">
      <ContinueCard
        target={target}
        variant="callout"
        pointerK={pointerK}
        label={focus.scope === "subject" ? COPY.trilha.proximaNestaMateria : undefined}
        lead={<FocaSays slot={greeting.slot} expression={greeting.expression} compact motion="none" />}
      />
    </div>
  );
}
```

- **Casos de borda:** `explanation` vazio (foco "subject") → linha omitida (já é assim); título longo quebra em 2–3 linhas (ok).
- **Responsivo:** callout ocupa a largura do `<ol>`; seta segue `--amp`, que é herdado do `<ol>` (o callout fica **dentro** do `<ol>`).
- **Acessibilidade:** um único link primário; a Foca é `decorative` dentro do `FocaSays` (confira; se não for, passe `decorative` pela API existente sem alterar o `FocaSays`).
- **Verificação:** TSC; E2E inteiro ainda verde (a rota ainda usa o card antigo).
- **Aceite:** `ContinueCard` sem props novas renderiza byte a byte o mesmo markup de antes (compare no diff).
- **Não faça:** criar um segundo componente de "continuar"; mudar o texto do botão.

### Fim do Checkpoint B

TSC, UNIT, E2E (tudo verde — nada novo está ligado ainda) → diff → commit B.

---

# CHECKPOINT C — Caminho funcional

## T-11 — `ChapterBanner`

- **Objetivo:** cabeçalho de capítulo sticky que expande/recolhe (RF-7).
- **Ler:** `src/components/learning/ChapterCard.tsx` (estados `locked`/aberto, textos), `tests/e2e/trilha.spec.ts` ("Crase sem medo" clicável por texto exato).
- **Criar:** `src/components/learning/path/ChapterBanner.tsx`.
- **Depende de:** T-02, T-05. **Skills:** `frontend-design:frontend-design`. **Revisão:** `web-design-guidelines`.

```tsx
import { ChevronDown, Lock, Stamp } from "lucide-react";
import { COPY } from "@/lib/copy";
import type { TrailChapter } from "@/lib/learning/trail";
import { cn } from "@/lib/utils";

export function ChapterBanner({
  chapter,
  sectionIndex,
  chapterNumber,
  expanded,
  onToggle,
  listId,
}: {
  chapter: TrailChapter;
  sectionIndex: number;
  chapterNumber: number;
  expanded: boolean;
  onToggle: () => void;
  /** id do <ol> controlado (aria-controls). */
  listId: string;
}) {
  const titleId = `cap-${chapter.id}`;
  const locked = chapter.status === "locked";
  const done = chapter.status === "completed";
  const body = (
    <>
      <span className="min-w-0 flex-1 text-left">
        <span className="ds-label block">{COPY.trilha.capituloRotulo(sectionIndex, chapterNumber)}</span>
        <span id={titleId} className="mt-0.5 block font-display text-base font-bold leading-tight text-abismo">
          {chapter.title}
        </span>
        {locked && (
          <span className="mt-1 flex items-center gap-1.5 text-xs text-nevoa">
            <Lock size={12} aria-hidden="true" /> {COPY.trilha.capituloBloqueado}
          </span>
        )}
      </span>
      {done && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-abismo bg-recompensa text-abismo" aria-hidden="true">
          <Stamp size={14} />
        </span>
      )}
      <span className="shrink-0 font-mono text-xs font-bold text-nevoa">
        {chapter.completedCount}/{chapter.totalCount}
      </span>
      {!locked && (
        <ChevronDown size={18} aria-hidden="true" className={cn("shrink-0 text-nevoa transition-transform duration-200", expanded && "rotate-180")} />
      )}
    </>
  );
  return (
    <div className="sticky z-[5] -mx-1 bg-neve/95 px-1 py-2 backdrop-blur" style={{ top: "var(--trail-sticky-top)" }}>
      {locked ? (
        <div className="card-soft flex min-h-14 w-full items-center gap-3 px-4 py-3">{body}</div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={listId}
          className="card-press flex min-h-14 w-full items-center gap-3 px-4 py-3"
        >
          {body}
        </button>
      )}
    </div>
  );
}
```

- **Acessibilidade:** botão com `aria-expanded` + `aria-controls`; nome acessível = texto do botão (rótulo + título + x/y) — por isso **não** coloque `aria-label` no botão (o E2E clica pelo texto do título).
- **Aceite:** TSC.
- **Não faça:** sticky por JS; esconder o título atrás de `aria-label`.

## T-12 — `ChapterSegment`

- **Objetivo:** um capítulo = banner + `<ol>` de linhas geradas por `buildChapterRows`.
- **Ler:** T-03 (`buildChapterRows`, `highlightPlan`), T-06/07/08/10/11.
- **Criar:** `src/components/learning/path/ChapterSegment.tsx`.
- **Depende de:** T-03, T-06, T-07, T-08, T-10, T-11. **Skills:** `frontend-design:frontend-design`, `vercel-react-best-practices` (`rerender-no-inline-components`, `rendering-conditional-render`).

```tsx
import { Fragment, useMemo } from "react";
import { ChapterBanner } from "./ChapterBanner";
import { ChapterMilestone } from "./ChapterMilestone";
import { FocusCallout } from "./FocusCallout";
import { MarginDoodle } from "./MarginDoodle";
import { PathConnector } from "./PathConnector";
import { PathNode, rowStyle } from "./PathNode";
import type { FocaExpression } from "@/components/brand/FocaMark";
import { buildChapterRows, highlightPlan, type PathFocus } from "@/lib/learning/path-layout";
import type { ContinueTarget, TrailChapter } from "@/lib/learning/trail";
import type { VozSlot } from "@/lib/voz";

export function ChapterSegment({
  chapter, sectionIndex, chapterNumber, chapterIndex, subjectId,
  expanded, onToggle, focus, focusTarget, greeting, highlightId,
}: {
  chapter: TrailChapter;
  sectionIndex: number;
  /** 1-based dentro da seção (rótulo). */
  chapterNumber: number;
  /** 0-based na matéria inteira (rabiscos). */
  chapterIndex: number;
  subjectId: string;
  expanded: boolean;
  onToggle: () => void;
  focus: PathFocus | null;
  focusTarget: ContinueTarget | null;
  greeting: { slot: VozSlot; expression: FocaExpression };
  highlightId?: string;
}) {
  const focusId = focus?.nodeId ?? null;
  const rows = useMemo(
    () => buildChapterRows(chapter, focusId, subjectId, chapterIndex),
    [chapter, focusId, subjectId, chapterIndex],
  );
  const { primaryId, secondaryId } = highlightPlan(chapter, highlightId);
  const listId = `lista-${chapter.id}`;

  return (
    <section aria-labelledby={`cap-${chapter.id}`} className="relative mt-3">
      <ChapterBanner chapter={chapter} sectionIndex={sectionIndex} chapterNumber={chapterNumber}
        expanded={expanded} onToggle={onToggle} listId={listId} />
      {expanded ? (
        <ol id={listId} className="path-list" aria-label={chapter.title}>
          {rows.map((row) =>
            row.type === "node" ? (
              <li key={row.key} className="path-row" data-path-row={row.node.id} style={rowStyle(row.k, row.isFocus)}>
                <div className="path-row-node">
                  {row.connector ? (
                    <PathConnector {...row.connector} draw={row.node.id === secondaryId} />
                  ) : null}
                  {row.doodle ? <MarginDoodle glyph={row.doodle} /> : null}
                  <PathNode
                    node={row.node}
                    k={row.k}
                    isFocus={row.isFocus}
                    highlight={row.node.id === primaryId || row.node.id === secondaryId}
                    highlightDelayMs={row.node.id === secondaryId ? 200 : undefined}
                  />
                </div>
                {row.isFocus && focus && focusTarget ? (
                  <FocusCallout target={focusTarget} focus={focus} pointerK={row.k} greeting={greeting} />
                ) : null}
              </li>
            ) : (
              <li key={row.key} className="path-row" style={rowStyle(0, false)}>
                <div className="path-row-node">
                  {row.connector ? <PathConnector {...row.connector} /> : null}
                  <ChapterMilestone m={row.milestone} />
                </div>
              </li>
            ),
          )}
        </ol>
      ) : null}
    </section>
  );
}
```

  Observação: o callout fica **dentro do `<li>` do foco**, depois do `.path-row-node` — por isso o `<li>` do foco (`data-path-row`) é o "bloco" que a rolagem mira (nó + callout juntos), e a linha seguinte não tem conector (T-03).
- **Casos de borda:** `expanded=false` → só o banner; foco sem `focusTarget` (não deveria ocorrer) → sem callout, nó ainda com halo.
- **Aceite:** TSC. **Não faça:** `Fragment` sem `key`; calcular `k` no JSX.

## T-13 — `SubjectPathEnd`, `RecommendationHint`, `JumpToFocusButton`

- **Criar:** os três arquivos em `src/components/learning/path/`.
- **Depende de:** T-02, T-04. **Skills:** `frontend-design:frontend-design`. **Revisão:** `web-design-guidelines`.

```tsx
// SubjectPathEnd.tsx — RF-12
import { Link } from "@tanstack/react-router";
import { FocaMark } from "@/components/brand/FocaMark";
import { COPY } from "@/lib/copy";
export function SubjectPathEnd({ subjectName }: { subjectName: string }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 px-4 text-center">
      <FocaMark expression="orgulhosa" size={72} decorative motion="pop" />
      <p className="font-display text-lg font-bold text-abismo">{COPY.trilha.fimDaMateria(subjectName)}</p>
      <Link to="/study" className="btn-outline">{COPY.trilha.praticar}</Link>
    </div>
  );
}
```

```tsx
// RecommendationHint.tsx — RF-11 (secundário: link de texto, nunca btn-primary)
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { COPY } from "@/lib/copy";
import type { ContinueTarget } from "@/lib/learning/trail";
export function RecommendationHint({ target, subjectName }: { target: ContinueTarget; subjectName: string }) {
  return (
    <Link {...target.href}
      className="mt-3 flex min-h-11 items-center gap-2 rounded-lg border-2 border-dashed border-gelo px-3 py-2 text-sm font-semibold text-mar-fundo">
      <span className="min-w-0 flex-1">{COPY.trilha.recomenda(target.title, subjectName)}</span>
      <ArrowRight size={16} aria-hidden="true" className="shrink-0" />
    </Link>
  );
}
```

```tsx
// JumpToFocusButton.tsx — RF-10 (canto esquerdo; o direito é do FAB do tutor)
import { ArrowDown, ArrowUp } from "lucide-react";
import { COPY } from "@/lib/copy";
export function JumpToFocusButton({ above, onJump }: { above: boolean; onJump: () => void }) {
  const Icon = above ? ArrowUp : ArrowDown;
  return (
    <button type="button" onClick={onJump} aria-label={COPY.trilha.irParaAtual}
      className="anim-pop-in fixed bottom-24 left-[max(1rem,calc(50%-13.75rem+1rem))] z-30 grid h-12 w-12 place-items-center rounded-full border-2 border-gelo bg-cards text-mar-fundo shadow-[0_3px_0_var(--color-gelo)] active:translate-y-[3px] active:shadow-none">
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}
```

- **Responsivo:** botão fixo espelha o FAB do tutor (`TutorBubble.tsx:213`): mesma fórmula com `left`; em 320 fica a 16 px da borda.
- **Aceite:** TSC. **Não faça:** colocar o botão à direita; usar `btn-primary` na dica.

## T-14 — `SubjectPath` + `LearningPath`

- **Objetivo:** montar a matéria inteira e ligar a rolagem.
- **Ler:** `src/components/learning/LearningPath.tsx` (contrato do `EmptyState`), `SectionHeader.tsx`.
- **Criar:** `src/components/learning/path/SubjectPath.tsx`. **Alterar:** `LearningPath.tsx`.
- **Depende de:** T-04, T-12, T-13. **Skills:** `frontend-design:frontend-design`, `vercel-react-best-practices` (`rerender-derived-state-no-effect`, `rerender-functional-setstate`).
- **Contrato:**

```tsx
// SubjectPath.tsx
export function SubjectPath({
  subject, focus, focusTarget, greeting, highlightId,
}: {
  subject: TrailSubject;               // já filtrado para seções com capítulos
  focus: PathFocus | null;
  focusTarget: ContinueTarget | null;
  greeting: { slot: VozSlot; expression: FocaExpression };
  highlightId?: string;
}) {
  // Só os toques do usuário ficam em estado; o padrão é derivado a cada render (RF-8).
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isExpanded = (c: TrailChapter) => toggled[c.id] ?? chapterDefaultExpanded(c, focus?.nodeId ?? null, highlightId);

  const focusChapter = focus ? findChapterOfNode(subject, focus.nodeId) : undefined; // helper local
  const focusRendered = focusChapter ? isExpanded(focusChapter) : false;
  const { focusOffscreen, focusAbove, scrollToFocus } = usePathFocusScroll({
    subjectId: subject.id, focusId: focus?.nodeId ?? null, highlightId, focusRendered,
  });

  function jump() {
    if (focusChapter && !focusRendered) {
      setToggled((t) => ({ ...t, [focusChapter.id]: true }));
      requestAnimationFrame(() => requestAnimationFrame(scrollToFocus)); // espera o <li> existir
      return;
    }
    scrollToFocus();
  }

  let chapterIndex = 0;
  return (
    <div className="path-margin">
      {subject.sections.map((section) => (
        <Fragment key={section.id}>
          <div className="mt-6 first:mt-2"><SectionHeader section={section} /></div>
          {section.chapters.map((chapter, i) => (
            <ChapterSegment key={chapter.id} chapter={chapter} sectionIndex={section.index}
              chapterNumber={i + 1} chapterIndex={chapterIndex++} subjectId={subject.id}
              expanded={isExpanded(chapter)}
              onToggle={() => setToggled((t) => ({ ...t, [chapter.id]: !isExpanded(chapter) }))}
              focus={focus} focusTarget={focusTarget} greeting={greeting} highlightId={highlightId} />
          ))}
        </Fragment>
      ))}
      {focus ? null : <SubjectPathEnd subjectName={subject.name} />}
      {focus && focusOffscreen ? <JumpToFocusButton above={focusAbove} onJump={jump} /> : null}
    </div>
  );
}
```

  `LearningPath.tsx` — nova assinatura (mantém o `EmptyState` e o filtro de seções vazias):

```tsx
export function LearningPath({ model, selectedSubjectId, highlightId, focus, focusTarget, greeting }: {
  model: TrailModel; selectedSubjectId: string; highlightId?: string;
  focus: PathFocus | null; focusTarget: ContinueTarget | null;
  greeting: { slot: VozSlot; expression: FocaExpression };
}) {
  const subject = model.subjects.find((s) => s.id === selectedSubjectId);
  const sections = subject?.sections.filter((sec) => sec.chapters.length > 0) ?? [];
  if (!subject || sections.length === 0) return <EmptyState text="Nada publicado nesta matéria ainda." />;
  return (
    <SubjectPath key={subject.id} subject={{ ...subject, sections }} focus={focus}
      focusTarget={focusTarget} greeting={greeting} highlightId={highlightId} />
  );
}
```

  `key={subject.id}`: trocar de chip remonta e zera os toques (RF-8 vale de novo para a matéria nova).
- **Casos de borda:** matéria com 1 seção; `focus` num capítulo que o usuário recolheu → botão aparece (T-04) e `jump` reabre.
- **Aceite:** TSC. **Não faça:** `useEffect` para sincronizar `expanded` com props; guardar o padrão em estado.

## T-15 — Ligar em `/trilha`

- **Objetivo:** nova composição da home (`27` §6.2, §11.3).
- **Ler:** `src/routes/trilha.tsx` inteiro (efeitos a–d **ficam como estão**).
- **Alterar:** `src/routes/trilha.tsx`.
- **Depende de:** T-09, T-14. **Skills:** `frontend-design:frontend-design`, `vercel-react-best-practices`. **Revisão:** `web-design-guidelines`.
- **Instruções:**
  1. Mantenha: `buildTrail` em `useMemo`, `selectedSubjectId`, os 4 efeitos (meta, `?concluida`, `?capitulo`, sessão órfã), `closeChapterSheet`, `ChapterCompleteSheet`.
  2. Acrescente depois de `selectedSubjectId`:

```tsx
const focus = useMemo(() => pathFocus(model, selectedSubjectId), [model, selectedSubjectId]);
const subject = model.subjects.find((x) => x.id === selectedSubjectId);
const focusTarget = useMemo(
  () => (subject ? resolveFocusTarget(model, subject, focus) : null),
  [model, subject, focus],
);
const greeting = trailGreeting(s);
const target = model.continueTarget;
const hintSubjectName = target ? model.subjects.find((x) => x.id === target.subjectId)?.name : undefined;
const showHint = Boolean(target && hintSubjectName && target.subjectId !== selectedSubjectId && focus?.scope !== "global");
```

  3. Troque o JSX de retorno por:

```tsx
<AppShell>
  <div className="bg-neve px-5 pb-3 pt-6">
    <TrailHeader s={s} />
  </div>
  <SubjectChips subjects={model.subjects} selectedId={selectedSubjectId} onSelect={setTrailSubject} />
  <div className="bg-neve px-5 pb-6" style={{ "--trail-sticky-top": "61px" } as CSSProperties}>
    {showHint && target && hintSubjectName ? (
      <RecommendationHint target={target} subjectName={hintSubjectName} />
    ) : null}
    <LearningPath model={model} selectedSubjectId={selectedSubjectId} highlightId={search.concluida}
      focus={focus} focusTarget={focusTarget} greeting={greeting} />
  </div>
  {chapterDoSheet && ( /* ChapterCompleteSheet exatamente como hoje */ )}
</AppShell>
```

  4. Remova os imports que ficaram sem uso (`ContinueCard` sai da rota; ele é usado pelo `FocusCallout`).
  5. Meça a altura real dos chips: no navegador em 390 px, `document.querySelector('[aria-pressed]').parentElement.getBoundingClientRect().height`. Se não for 61 ± 1, ajuste `--trail-sticky-top` para o valor medido (arredonde para cima) e registre.
- **Teste:** rode o E2E inteiro. Esperado: tudo verde. Se falhar, compare com os contratos do `27` §13 — o erro está na implementação, não no teste. Único ajuste de teste permitido nesta tarefa: nenhum.
- **Aceite:** TSC, UNIT, E2E verdes; `/trilha` mostra o caminho.
- **Não faça:** apagar `ChapterCard.tsx`/`LessonNode.tsx`; mexer nos efeitos existentes; tornar o `TrailHeader` sticky.

## T-16 — Skeleton e erro da rota

- **Criar:** `src/components/learning/path/TrailSkeleton.tsx`, `src/components/learning/path/TrailError.tsx`. **Alterar:** `src/routes/trilha.tsx` (`pendingComponent`, `errorComponent`).
- **Depende de:** T-15. **Skills:** `frontend-design:frontend-design`.

```tsx
// TrailSkeleton.tsx — mesma forma da trilha, sem spinner (docs/27 §6.7)
import { PhoneFrame } from "@/components/AppShell";
import { pathK, rowStyle } from "...";   // rowStyle vem de ./PathNode
export function TrailSkeleton() {
  return (
    <PhoneFrame>
      <div data-trail-skeleton className="px-5 pt-6" aria-busy="true" aria-label="Carregando a trilha">
        <div className="flex items-center gap-3">
          <span className="skeleton h-5 w-16" /><span className="skeleton h-10 w-10 rounded-full" /><span className="skeleton h-3 flex-1" />
        </div>
        <div className="mt-5 flex gap-2">{[0, 1, 2, 3].map((i) => <span key={i} className="skeleton h-9 w-24 rounded-full" />)}</div>
        <span className="skeleton mt-6 block h-16 w-full" />
        <ol className="path-list" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="path-row" style={rowStyle(pathK(i), false)}>
              <div className="path-row-node">
                <span className="path-node-anchor"><span className="skeleton block h-16 w-16 rounded-full" /></span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PhoneFrame>
  );
}
```

```tsx
// TrailError.tsx
import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
// Foca "entediada" 96 + COPY.trilha.erroTitulo (h1) + erroCorpo + btn-primary tentarDeNovo
// (onClick: router.invalidate(); reset()) + Link btn-ghost "/study" COPY.trilha.praticar.
// Mesma estrutura visual do ErrorComponent de src/routes/__root.tsx (copie o layout, não o texto).
```

  Na rota: `pendingComponent: TrailSkeleton, errorComponent: TrailError`.
- **Verificação do skeleton:** com o dev rodando, `curl -s http://localhost:8080/trilha | grep -c data-trail-skeleton`. Resultado `≥ 1` → skeleton aparece no HTML do servidor. Resultado `0` → registre no `29` ("TanStack Start não renderiza `pendingComponent` no SSR com `ssr:false` nesta versão") e **mantenha** o componente (ele ainda cobre pendência no cliente). Não troque `ssr: false`.
- **Verificação do erro:** temporariamente (não comitar) lance `throw new Error("teste")` no topo de `TrailRoute`, abra `/trilha`, confirme a tela de erro, remova.
- **Aceite:** TSC; E2E verde; dois registros no `29`.
- **Não faça:** spinner; mudar `ssr`.

### Fim do Checkpoint C

TSC, UNIT, E2E, BUILD → leia o diff inteiro → abra `/trilha` em 390×844 e 320×700 e compare com os screenshots de T-01 → commit C.

---

# CHECKPOINT D — Testes, responsivo, acabamento

## T-17 — E2E do caminho

- **Criar:** `tests/e2e/trail-path.spec.ts`. **Alterar:** `playwright.config.ts` (projeto `narrow`: acrescente `"**/trail-path.spec.ts"` ao `testMatch`).
- **Depende de:** Checkpoint C. **Skills:** `superpowers:test-driven-development`.
- **Fixtures** (semear via `page.addInitScript`, como `trail-home.spec.ts`):

```ts
const BASE = {
  authed: true, onboarded: true, schemaVersion: 5,
  prefs: { name: "Ana", sound: false, haptics: false, theme: "light", dailyLessons: 3 },
  quiz: { answers: [], gaps: [], completedAt: "2026-01-01T00:00:00.000Z" },
  tutor: { open: false, messages: [], focus: null },
  premiumTrial: { active: false, startedAt: null }, offline: { downloaded: false },
};
const feito = (id: string) => ({ lessonId: id, stars: 3, bestPct: 100, completedAt: "2026-09-01T12:00:00.000Z" });
const microFeito = { version: 2, completedAt: "2026-09-01T12:00:00.000Z", stars: 3, bestPct: 100 };

/** Português avançado: micro de crase + crase/concordância/regência concluídos, pontuação 3/12. Foco local = pontuacao-04. */
const PORTUGUES_FUNDO = {
  ...BASE,
  prefs: { ...BASE.prefs, trailSubjectId: "por" },
  progress: {
    xp: 900, streak: 4,
    lessons: Object.fromEntries([ /* 6 ids de crase, 9 de concordancia, 6 de regencia-colocacao,
      pontuacao-01-virgula-no-aposto, pontuacao-02-virgula-nas-enumeracoes, pontuacao-03-vocativo */ ].map((id) => [id, feito(id)])),
  },
  learning: { completedLessons: { "crase-quando-usar": microFeito, "crase-proibida": microFeito, "revisao--por-crase": microFeito } },
};
/** Biologia inteira concluída → fim de matéria; foco global fica em Matemática. */
const BIOLOGIA_FIM = {
  ...BASE,
  prefs: { ...BASE.prefs, trailSubjectId: "bio" },
  progress: { xp: 200, streak: 1 },
  learning: { completedLessons: { "citologia-membrana": microFeito, "citologia-organelas": microFeito, "revisao--bio-citologia": microFeito } },
};
```

  Use os ids completos da tabela da §1. Se a migração recusar algum campo (confira `src/lib/state-migrations.ts`), complete a fixture — não mude a migração.
- **Testes (um `test` cada):**
  1. **HG2** estado limpo em `/trilha`: `await expect(page.locator(".btn-primary:visible")).toHaveCount(1)`.
  2. **HG3** estado limpo (Matemática, 3 nós): centros X de `[data-path-node]` 0,1,2 estritamente decrescentes (k 0, −0.5, −1); o centro do nó 0 a ≤ 2 px do centro do `<ol>`.
  3. **HG4** Português, expandir "Crase sem medo": `page.locator('a[data-status="locked"]')` tem 0; `page.locator('div[data-status="locked"][aria-disabled="true"]')` > 0; todo `[data-path-node]` visível tem `aria-label` que casa `/ — (Concluída|Concluída · revisão sugerida|Em andamento|Continuar daqui|Disponível|Bloqueada)$/`.
  4. **HG5** `PORTUGUES_FUNDO`: `await expect(page.locator('[data-path-row="pontuacao-04-termos-deslocados"]')).toBeInViewport()`; `scrollY > 0`; texto "Próxima nesta matéria" visível; link com texto começando "A Foca recomenda:" visível. Depois: `page.evaluate(() => window.scrollTo(0, 0))`, espere 300 ms, clique em `getByText("Crase sem medo", { exact: true })`, espere 600 ms, `scrollY < 50` (não rolou de novo).
  5. **HG6** continuação do 4 (ou novo com a mesma fixture, rolando ao topo): botão `getByRole("button", { name: "Voltar para a lição atual" })` visível → clicar → o `<li>` do foco `toBeInViewport()`.
  6. **HG7** para cada largura `[320, 375, 390, 430, 768, 1280, 1440]` (altura 900): `setViewportSize`, `goto("/trilha")` com `PORTUGUES_FUNDO`, esperar `[data-path-node]`, `expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)`.
  7. **HG8** `page.emulateMedia({ reducedMotion: "reduce" })` antes do `goto`; `getComputedStyle(document.querySelector(".path-halo")).animationIterationCount === "1"`.
  8. **HG9** estado limpo: `page.locator('main img[src*="/branding/foca/"]')` com contagem ≤ 1.
  9. **HG12** semeie `learning.completedLessons["porcentagem-valor"]` e abra `/trilha?concluida=porcentagem-valor`: `[data-path-node="porcentagem-valor"] .path-node` tem classe `anim-pop-in`; existe `.path-connector--draw` dentro de `[data-path-row="porcentagem-aumento-desconto"]`.
  10. **RF-12/RF-6** `BIOLOGIA_FIM`: texto "Você fechou tudo o que está publicado em Biologia." visível; `getByRole("img", { name: /Capítulo concluído/ })` visível (o capítulo concluído está recolhido: **clique** no banner "Citologia" antes); link "A Foca recomenda:" visível.
- **Verificação:** `bunx playwright test tests/e2e/trail-path.spec.ts` (ambos os projetos), depois E2E inteiro.
- **Aceite:** 10 testes novos verdes nos dois projetos onde se aplicam; nenhum teste antigo alterado.
- **Não faça:** `waitForTimeout` para esperar a rolagem terminar em vez de `toBeInViewport` (as esperas fixas acima são só para provar que **não** houve rolagem); `test.skip`.

## T-18 — Matriz visual manual

- **Objetivo:** olho humano/IA nos tamanhos do pedido.
- **Instruções:** com o dev rodando e `PORTUGUES_FUNDO` + estado limpo, capture `375x812`, `390x844`, `430x932`, `768x1024`, `1280x800`, `1440x900` (e `320x700`) — Playwright script descartável em `test-results/` ou `bunx playwright screenshot` depois de semear o storage. Para cada imagem, confira e registre no `29` uma linha: clipping de legenda · nó cortado · callout inteiro · banner sticky não cobre o nó · bottom nav e safe area · botão "voltar" não sobrepõe o FAB · dark mode (repita 390 com `theme: "dark"`).
- **Skills:** nenhuma (é inspeção).
- **Aceite:** tabela no `29` com 8 linhas (7 tamanhos + dark), cada uma "ok" ou o defeito + a correção feita.
- **Não faça:** "melhorar" o design aqui — só corrigir defeito objetivo (sobreposição, corte, overflow).

## T-19 — Auditoria de acessibilidade

- **Skills:** `web-design-guidelines` (aplique sobre `src/components/learning/path/*`, `TrailHeader.tsx`, `ContinueCard.tsx`, `src/routes/trilha.tsx`).
- **Checar e corrigir:** ordem de foco por teclado (Tab percorre banner → nós → callout na ordem do caminho); `:focus-visible` visível no nó (círculo) e no banner; alvos ≥ 44 px; contraste de `text-nevoa` (≥ 12 px) e de `text-mar-fundo` sobre `bg-cards`/`bg-neve` claro e escuro; nomes acessíveis (banner pelo texto, nó pelo `aria-label`, carimbo `role=img`); `aria-hidden` em todo decorativo (halo, rabisco, estrelas, seta do callout); leitor de tela: navegue com o Narrator do Windows por um capítulo e registre como soa.
- **Aceite:** achados listados no `29` com `arquivo:linha` e correção; nenhum achado de severidade alta aberto.
- **Não faça:** trocar a estrutura (`section`/`ol`/`li`) definida no `27` §8.

## T-20 — Refino visual (dentro da spec)

- **Skills:** `impeccable:impeccable` → `critique` na `/trilha` (screenshots de T-18) → `polish`. Revisão: `web-design-guidelines`.
- **Pode mudar:** espaçamentos (múltiplos de 4 px), pesos/tamanhos de fonte **da escala do `DESIGN.md`**, alinhamentos, tamanho de ícone, opacidade do conector traçado (0.45–0.7), tamanho do rabisco (1.25–1.75 rem).
- **Não pode mudar:** cores fora dos tokens, tamanhos de nó (64/76), padrão do zigue-zague, onde a Foca aparece, textos, estrutura, nada do §15 do `27`. Qualquer sugestão da skill fora disso vira nota "sugestão não aplicada" no `29`.
- **Checklist anti-clone:** nenhum verde, nenhuma moeda 3D, nenhum baú, nenhuma etiqueta "START", nenhum personagem espalhado. Se algo lembrar o Duolingo literalmente, registre e corrija dentro dos limites acima.
- **Aceite:** antes/depois no `29`; E2E verde.

## T-21 — Verificação de performance

- **Skills:** `vercel-react-best-practices` + `agent-skills:performance-optimization`.
- **Instruções:**
  1. BUILD e compare o chunk `trilha-*.js` com o de T-01 → diferença ≤ +8 kB **gzip** (use o número "gzip" que o Vite imprime). Registre.
  2. React DevTools Profiler (ou `console.count` temporário dentro de `PathNodeImpl`, **removido depois**): abra `/trilha` em Português com dois capítulos abertos, abra e feche o tutor (muda o store) — `PathNodeImpl` não deve renderizar de novo para nós que não mudaram. Se renderizar, corrija o comparador de T-07.
  3. `grep -rn "addEventListener(\"scroll\"\|new IntersectionObserver\|ResizeObserver" src/components/learning/path src/hooks/usePathFocusScroll.ts` → só um `IntersectionObserver`.
  4. DevTools → Performance, 4× CPU throttling, rolar a trilha de Português com 3 capítulos abertos: sem long task > 50 ms atribuída à trilha (registre o maior valor visto).
- **Aceite:** 4 números no `29`.

### Fim do Checkpoint D

TSC, UNIT, E2E, BUILD → diff → commit D.

---

# CHECKPOINT E — Deploy

Contexto obrigatório: ler o `27` §14 inteiro antes de começar.

## T-22 — Preset do Nitro por ambiente

- **Alterar:** `vite.config.ts`.
- **Skills:** `tanstack-start:tanstack-start` (referência; ignore o viés Cloudflare), revisão L2 em T-26.
- **Instruções:** troque `nitro: { preset: "netlify" }` e o comentário acima dele por:

```ts
  // Hospedagem (docs/27 §14): o Vercel define VERCEL=1 no build → Build Output
  // API (.vercel/output) com a função SSR que também serve o tutor. Fora do
  // Vercel continua gerando para Netlify. Sem isso o Vercel publicava `dist/`,
  // que não tem index.html num app SSR → 404 em todas as rotas.
  nitro: { preset: process.env.VERCEL ? "vercel" : "netlify" },
```

- **Verificação:**
  1. TSC (se `process` não tiver tipo em `vite.config.ts`, registre e use `globalThis.process?.env?.VERCEL` com o cast mínimo).
  2. `bun run build` → existe `.netlify/functions-internal/`.
  3. `VERCEL=1 bun run build` (PowerShell: `$env:VERCEL="1"; bun run build; Remove-Item Env:VERCEL`) → existe `.vercel/output/config.json` e `.vercel/output/functions/__server.func/`.
  4. Smoke da função gerada (Node 22+), a partir da raiz:
     `node -e "import('./.vercel/output/functions/__server.func/index.mjs').then(async m=>{for(const p of ['/','/trilha','/learn/porcentagem-valor']){const r=await m.default.fetch(new Request('http://x'+p));console.log(p,r.status)}})"` → três `200`.
  5. Apague `.vercel/` depois (e confira que `.vercel` **não** entra no commit — acrescente `.vercel/` ao `.gitignore` só se o arquivo já não estiver modificado pelo usuário; se estiver, **não** toque e registre).
- **Aceite:** DG1.
- **Não faça:** trocar o preset padrão de fora do Vercel; mexer em `tanstackStart.server.entry`.

## T-23 — `vercel.json`

- **Criar:** `vercel.json` na raiz:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "bun install --frozen-lockfile",
  "buildCommand": "bun run build"
}
```

- **Por quê:** fixa bun (evita o `package-lock.json` velho) e o build. Não declare `outputDirectory` nem `framework`: com `.vercel/output` presente o Vercel usa a Build Output API.
- **Aceite:** JSON válido (`bun -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8'))"`).

## T-24 — Lockfile, README, `.env.example`

- **Instruções:**
  1. `git rm package-lock.json` (D-13).
  2. `README.md`: leia inteiro. Garanta uma seção "Rodar localmente" com exatamente: `git clone https://github.com/matheusvllz/flashtest.git` · `cd flashtest` · `bun install` · `cp .env.example .env` (opcional: `OPENAI_API_KEY`) · `bun run dev` → `http://localhost:8080`; "Verificar": TSC, UNIT, E2E (`bunx playwright install chromium` na primeira vez), BUILD; e uma seção "Deploy" resumindo o `27` §14.3–§14.4 (Vercel conectado ao GitHub; `OPENAI_API_KEY` nas variáveis de ambiente do projeto; proteção de deploy desligada para produção; Netlify ainda possível sem mudar código). Não reescreva o resto do README.
  3. `.env.example`: mantenha o conteúdo; acrescente uma linha de comentário: `# Em produção (Vercel): Settings → Environment Variables → OPENAI_API_KEY (Production e Preview).`
- **Aceite:** `bun install --frozen-lockfile` passa sem `package-lock.json`.
- **Não faça:** escrever qualquer chave real; mudar `bunfig.toml`.

## T-25 — CI no GitHub Actions

- **Criar:** `.github/workflows/ci.yml`. **Skills:** `agent-skills:ci-cd-and-automation`.

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.4.2
      - run: bun install --frozen-lockfile
      - run: bunx tsc --noEmit
      - run: bun test tests/unit
      - run: bun run build
```

- **Por quê:** D-14 — valida o que quebra deploy; sem deploy no CI (o Vercel já faz); lint e E2E fora por ora (`27` §16).
- **Aceite:** YAML válido; roda verde depois do push (verificado em T-27).
- **Não faça:** colocar segredo no workflow; adicionar etapa de deploy.

## T-26 — Revisão de segurança L2

- **Skills:** `agent-skills:security-and-hardening` + `repo-security-review` (modo PR: `/repo-security-review . --pr main`).
- **Checar:** nenhum segredo (`git grep -nE "sk-[A-Za-z0-9]{10,}|OPENAI_API_KEY=.+"` só pode achar `.env.example` vazio); nenhum `VITE_OPENAI`; `vercel.json` sem headers que desliguem proteção; workflow sem `pull_request_target`; `.env*` continua no `.gitignore`.
- **Aceite:** seção "Segurança L2" no `29` com o resultado.

## T-27 — Publicar (exige autorização do usuário)

- **Antes de qualquer push:** pare e peça ao usuário, em uma mensagem, autorização para: (a) `git push -u origin feat/home-trilha-visual`; (b) abrir PR para `main`; (c) depois do PR verde, fazer merge em `main` (isso sincroniza com o Lovable e dispara o deploy de produção no Vercel). Sem "sim" explícito, pare aqui e entregue o resto.
- **Passos manuais do usuário no painel do Vercel** (liste-os para ele exatamente assim; você não tem acesso):
  1. `vercel.com` → time **foca3** → projeto **foca** → **Settings → Deployment Protection** → "Vercel Authentication": trocar para **"Only Preview Deployments"** (ou desligar). Sem isso, o celular vê a tela de login do Vercel.
  2. **Settings → Environment Variables** → `OPENAI_API_KEY` (Production e Preview). Opcional: sem ela o tutor usa o fallback.
  3. **Settings → Build and Deployment**: "Framework Preset" pode ficar automático; os comandos vêm do `vercel.json`. Node.js 22.x ou 24.x.
  4. Depois do merge: **Deployments** → o deploy de produção → "Visit". O domínio de produção fica em **Settings → Domains** (ex.: `foca-foca3.vercel.app`, que já existe e hoje está protegido).
  5. Se ainda der 404: abra o log do build e confira a linha `Generated .vercel/output/nitro.json`. Se não aparecer, `VERCEL` não chegou ao build — registre e, como plano B, defina a variável de ambiente `NITRO_PRESET=vercel` no projeto **e** troque a linha de T-22 para `process.env.VERCEL || process.env.NITRO_PRESET === "vercel"`.
- **Verificação (depois do deploy):**
  - `curl -sI https://<dominio>/` → `200` (não `302` para `vercel.com/sso-api`).
  - `curl -s https://<dominio>/trilha | grep -c "<html"` → 1; `curl -sI https://<dominio>/branding/foca/icon-192.png` → 200; `curl -sI https://<dominio>/sfx/v2/resposta-correta.wav` → 200.
  - `gh run list --limit 3` → CI verde.
- **Teste no celular (checklist para o usuário, registrar respostas no `29`):** Chrome Android e Safari iPhone — abrir a URL; passar pelo quiz; `/trilha` mostra o foco sem rolar; tocar num nó abre a lição; voltar destaca o nó; **puxar para recarregar em `/trilha` e em `/learn/porcentagem-valor`** (refresh de rota); rolar a trilha longa (Português); botão "voltar para a lição atual"; bottom nav não cobre conteúdo e respeita o notch/home indicator; sons tocam após o primeiro toque; tutor responde (ou fallback). Instalar na tela inicial é opcional.
- **Aceite:** DG2, DG3, DG4 com evidência (DG3/DG4 dependem do usuário — se ele não fizer agora, marque "pendente do usuário" e não declare concluído).
- **Não faça:** `vercel deploy` pela CLI com credenciais que você não tem; push sem autorização; force-push.

### Fim do Checkpoint E

TSC, UNIT, BUILD, `VERCEL=1` BUILD → diff → commit E (antes do push de T-27).

---

# CHECKPOINT F — QA e registro

## T-28 — Cinco rodadas de revisão (uma skill por rodada)

Rode sobre `git diff main...HEAD`. Em cada rodada: liste achados no `29`, corrija os que forem defeito dentro do escopo, rode TSC/UNIT/E2E de novo.

| Rodada | Skill | Foco |
|---|---|---|
| 1 — Engenharia | `agent-skills:code-review-and-quality` | clareza, duplicação (há dois "continuar"? não pode), código morto, nomes, tipos, erros |
| 2 — React | `vercel-react-best-practices` | re-render, memo/comparador, efeitos, deps, listeners |
| 3 — Visual | `impeccable:impeccable` (`audit`) | hierarquia, ritmo, identidade Foca, anti-clone |
| 4 — UX/a11y | `web-design-guidelines` | semântica, foco, toque, reduced motion, 320 px |
| 5 — Spec | agent `spec-verifier` com `docs/27-plano-home-trilha-visual.md` e os ids `RF-1…RF-16`, `HG1…HG13`, `DG1…DG5` | cada critério com evidência; sem evidência = não cumprido |

- **Aceite:** tabela de critérios no `29` com coluna "evidência" (comando + saída, ou arquivo:linha, ou screenshot).

## T-29 — Registro de execução e índice

- **Criar/fechar:** `docs/29-registro-execucao-home-trilha.md` no formato do `26`: status, baseline, o que existe por checkpoint, divergências, decisões tomadas, números reais (TSC/UNIT/E2E/BUILD antes e depois, tamanho do chunk), tabela RF/HG/DG com evidência, achados das 5 rodadas, resultado do teste no celular (ou "pendente do usuário"), limitações explícitas e o que fica para depois (`27` §16).
- **Alterar:** `docs/00-README.md` (linha do `27`/`28` passa a "implementado — ver `29`"; acrescente o `29` na tabela); `docs/21-brand-voice-e-inventario-copy.md` (inventário das 14 chaves novas de `COPY.trilha`); `docs/DESIGN.md` só na lista "Use o que existe antes de criar" (acrescentar `src/components/learning/path/` e as classes `path-*`).
- **Não faça:** editar o `CLAUDE.md` sem pedido do usuário (sugira no relato final a linha a acrescentar).
- **Aceite:** checklist do `27` §20 todo marcado com evidência, exceto itens explicitamente pendentes do usuário.

### Fim do Checkpoint F

Todos os comandos → commit F → relato final ao usuário: o que foi feito, o que foi testado (com números), o que não foi, a URL (se publicada) e os passos manuais restantes.

---

## 5. Árvore de dependências

```
T-01 → T-02 → T-03 → T-04 ─────────────────────────────┐
              T-03 → T-05 → T-06, T-07, T-08            │
              T-02 → T-09 → T-10 (usa T-05)             │
T-02,T-05 → T-11                                       │
T-03,T-06,T-07,T-08,T-10,T-11 → T-12                    │
T-02,T-04 → T-13                                        │
T-04,T-12,T-13 → T-14 → T-15 → T-16                     │
C → T-17 → T-18 → T-19 → T-20 → T-21                    │
D → T-22 → T-23 → T-24 → T-25 → T-26 → T-27             │
E → T-28 → T-29 ←───────────────────────────────────────┘
```

## 6. Riscos para a IA executora (e o que fazer)

| Sintoma | Causa provável | Ação |
|---|---|---|
| Legenda cortada ou rolagem horizontal em 320 | `--k-abs`/`--node-half` não definidos no `<li>` | confira `rowStyle` em todo `<li>`, inclusive o do carimbo |
| Conector aparece deslocado do nó | `viewBox`/`preserveAspectRatio` alterados, ou `--amp` ≠ `PATH_AMP_CQI` | manter `0 0 100 96` + `none` e 16 nos dois lugares |
| Página rola sozinha ao expandir capítulo | chave de rolagem não guardada | `doneKeyRef` é setado mesmo quando não rola |
| E2E "link Continuar exato" pega dois elementos | outro link com texto "Continuar" | só o callout tem esse texto; dica usa "A Foca recomenda: …" |
| "Crase sem medo" não expande ao clicar | título escondido atrás de `aria-label` ou banner não é `button` | seguir T-11 à risca |
| Halo continua animando com reduced motion | animação aplicada via `style` inline | usar a classe `anim-halo` |
| Dark mode com cor errada | hex literal ou `bg-white` | só tokens |
| 404 no Vercel depois de T-22 | `VERCEL` ausente no build | T-27 passo 5 |

---

## EXECUTION HANDOFF

Copie o bloco abaixo como primeira mensagem para a IA executora.

```text
Você é o agente executor da iniciativa "Home como trilha visual + deploy público" do app Foca
(repositório em c:\Users\mathe\Documents\foca, TanStack Start + React 19 + Tailwind v4, gerenciador bun,
Windows). A especificação já foi pensada e aprovada. Seu trabalho é EXECUTAR, não redesenhar nem replanejar.

LEIA PRIMEIRO, NESTA ORDEM (inteiros, antes de tocar em qualquer arquivo):
1. docs/28-plano-execucao-home-trilha.md  ← seu roteiro; comece pela §0
2. docs/27-plano-home-trilha-visual.md     ← a norma (o quê e por quê); vence o 28 se divergirem
3. CLAUDE.md e AGENTS.md
4. docs/DESIGN.md
5. docs/26-registro-execucao-jornada-v2.md §1–§3
6. docs/ai/SKILL-ROUTING.md §1–§2
Depois invoque a skill `foca-sdd` e, uma vez, `superpowers:executing-plans` (se não existir na sua sessão,
siga a §0 do 28).

COMO EXECUTAR:
- Execute T-01 → T-29 na ordem. Uma tarefa por vez. Não pule, não reordene, não junte tarefas.
- Para cada tarefa, carregue SÓ as skills listadas nela (1–3 primárias + no máximo 1 de revisão). Nunca
  carregue juntas frontend-design, impeccable, design-taste-frontend, ui-ux-pro-max e web-design-guidelines.
  Skill de plugin indisponível → use o substituto da §2 do 28 e registre.
- Nomes de arquivo, componente, prop, classe CSS, atributo data-* e string de UI escritos no 28 são
  contrato: use exatamente. Os testes dependem deles.
- Critérios de aceite não são opcionais. Uma tarefa só termina quando o "Aceite" dela tem evidência real
  (saída de comando, arquivo:linha ou screenshot). "Deve funcionar" não é evidência.
- Ao fim de cada checkpoint (A–F): rode os comandos da tabela §4, leia o git diff inteiro, remova qualquer
  coisa fora do escopo, e faça UM commit só com os arquivos do checkpoint, adicionados pelo caminho
  (nunca git add -A / git add .). Há mudanças não commitadas do usuário no repo que NÃO são suas.
- Trabalhe na branch feat/home-trilha-visual. Sem push, sem PR, sem merge até T-27 — e em T-27 PARE e
  peça autorização explícita ao usuário antes de qualquer push.

SE O CÓDIGO NÃO BATER COM O PLANO:
- Corrija o mínimo necessário para cumprir a intenção descrita, registre a divergência em
  docs/29-registro-execucao-home-trilha.md (arquivo, linha, o que o plano dizia, o que você fez) e siga.
- Nunca mude requisito de produto, texto de UI, cor, onde a Foca aparece, tamanho de nó, padrão do
  zigue-zague ou plataforma de deploy por conta própria. Na dúvida, pergunte ao usuário.
- Se um teste existente falhar, o defeito está na sua implementação até prova em contrário. Não edite
  teste antigo para passar.

PROIBIDO:
- Editar src/routeTree.gen.ts; mexer em store.ts, trail.ts, recommend.ts ou no schema do localStorage.
- Adicionar dependência (GSAP, Framer Motion, virtualização, analytics…).
- Hex literal em componente; bg-white; cor fora dos tokens de src/styles.css.
- Baú, moeda, gema, vida, energia, recompensa aleatória, etiqueta "START", verde de marca, qualquer asset
  ou ícone do Duolingo. O resultado deve parecer Foca ("Rabisco na Margem"), não um clone.
- Rodar `eslint .` (demora e falha por CRLF — use o LINT-ARQ da §0.1); prettier em arquivo existente inteiro.
- Force-push, rebase, amend de commit publicado (o repo sincroniza com o Lovable).
- Declarar pronto sem rodar: bunx tsc --noEmit · bun test tests/unit · bunx playwright test · bun run build.

NO FIM:
- Rode as 5 rodadas de revisão de T-28 (uma skill por rodada, a última com o agent spec-verifier contra
  RF-1…RF-16, HG1…HG13, DG1…DG5 do 27).
- Escreva o registro docs/29 (formato do 26) e atualize docs/00-README.md, docs/21 e docs/DESIGN.md
  conforme T-29.
- Relate ao usuário, em português: o que foi feito, os números reais dos testes antes/depois, o que NÃO
  foi testado (ex.: celular físico), a URL pública se o deploy foi autorizado e feito, e a lista exata dos
  passos manuais que ainda dependem dele no painel do Vercel (T-27).
```
