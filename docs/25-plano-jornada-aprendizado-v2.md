# 25 — Jornada de Aprendizado V2: plano de implementação

Investigação e decisões: 21/09/2026. Versão da especificação: 1.0.

**Status: PLANEJADO, NÃO IMPLEMENTADO.** Este documento é a fonte única de verdade para a próxima IA implementar a reestruturação da experiência principal de aprendizado do Foca. Nenhum arquivo de código foi alterado ao escrevê-lo. Toda tarefa abaixo é futura; todo caminho marcado **NOVO ARQUIVO** ainda não existe.

Este plano **estende** o que [20-plano-evolucao-aprendizagem.md](20-plano-evolucao-aprendizagem.md) especificou e [22-validacao-piloto-aprendizagem.md](22-validacao-piloto-aprendizagem.md) registrou como entregue. Ele não desfaz nada do `20`; onde muda uma regra do `20`, diz explicitamente (§6.7). Nos assuntos cobertos aqui, este documento prevalece sobre `20`, `18` §13 e `CLAUDE.md`.

## Como a IA implementadora deve usar este documento

1. Ler este documento inteiro. Depois ler `../CLAUDE.md`, `../AGENTS.md`, `22-validacao-piloto-aprendizagem.md` (o que existe) e `18-plano-reestilizacao-rabisco.md` §5–§8 (design system).
2. Executar as tarefas **na ordem numerada** (T-01 → T-28). Cada tarefa deixa o projeto compilando (`bunx tsc --noEmit`), com `bun test tests/unit` verde e — quando a tarefa toca UI — `bunx playwright test` verde (ou com os specs explicitamente marcados para atualização naquela tarefa).
3. Não tomar decisões de arquitetura por conta própria. Se algo aqui contradisser o código real (o código pode ter mudado depois de 21/09/2026), registrar a divergência em `docs/26-registro-execucao-jornada-v2.md` (NOVO ARQUIVO, criado em T-28) e seguir a intenção descrita.
4. Não editar `src/routeTree.gen.ts` à mão (o plugin do router regenera). Não criar segundo store, backend, banco, nova dependência de IA nem nova biblioteca de UI.
5. Não reescrever histórico Git publicado (Lovable). Commits só no escopo autorizado.
6. Pseudocódigo aqui é contrato de comportamento, não código pronto. Manter nomes de arquivos, funções, tipos e strings de UI exatamente como escritos, porque os testes E2E e unitários deste plano os referenciam.
7. Regra inegociável preservada do `20`: **errar uma questão nunca abre nem envia mensagem ao tutor de IA automaticamente.** Só o CTA explícito abre o balão; só o envio do aluno chama a API.

### Vocabulário (mapeamento obrigatório)

| Termo do pedido | Nome no código | Nome na UI (pt-BR) |
|---|---|---|
| Curso / objetivo | `Curriculum.courseId` (`"enem"`) | — (não aparece) |
| Matéria | `CurriculumSubject` (`id` = `SUBJECTS[].id`) | Matéria (chips: "Matemática", "Português"…) |
| Seção | `CurriculumSection` | "Seção N · Título" |
| Capítulo | `CurriculumChapter` | "Capítulo" (card colapsável) |
| Fase | `MicroLesson` (tipo existente, estendido) | "Lição" |
| Blocos de aprendizado | `LessonStep` (novo) | — (o aluno vê "passos") |
| Questão | `QuestionStep` → `Exercise` (motor existente) | "Questão 3/6" |
| Nó da trilha | `TrailNode` (novo) | — |

Decisão: o tipo `MicroLesson` **não é renomeado** para `Phase`. Renomear tocaria ~20 arquivos e todos os testes sem ganho funcional; o risco para uma IA implementadora é maior que o benefício. Na UI a unidade se chama "Lição", como já se chama hoje ("Lição concluída", "Sair da lição").

---

## 1. Contexto

O Foca tem hoje três sistemas de estudo que não conversam entre si e nenhum deles é "o coração" do app:

- `/study` — a aula de 60s: 2 questões do banco geral (`src/data/questions.ts`, 59 itens), sem ensino, sem trilha.
- `/redacao` — micro-treino de redação: 15 trilhas, 134 lições, 1.204 exercícios em 7 formatos (`src/content/trilhas/`), tocadas por `LessonPlayer`. Só questões, 8–13 por lição, sem explicação antes, sem retomada no meio.
- `/trilha` + `/learn/$lessonId` — 6 microlições piloto (`src/content/microlicoes/`), cada uma com 1–3 blocos de ensino, 1 checkpoint e 2 práticas (3 questões), tocadas por `MicroLessonPlayer`. Agrupadas só por matéria; sem seção nem capítulo.

A home (`/dashboard`) tem 8 blocos competindo (meta, Foca, streak/nível, "Aula de hoje", missões, redação, trilha, ranking/flashcards, plano, premium). A bottom nav tem 5 itens, dois deles ("Estudar" e "Redação") sendo pilares paralelos.

## 2. Problemas atuais identificados

| # | Problema | Evidência no código |
|---|---|---|
| P1 | Fases curtas demais: microlição = 3 questões; aula de 60s = 2 questões | `useLearningSession.ts` (`exerciseSequence = [checkpoint, ...practice]`), `study.tsx` (`LESSON_SIZE = 2`) |
| P2 | Ensino e prática não se intercalam: todos os blocos primeiro, depois todas as questões | `MicroLessonPlayer.tsx` (`TeachingStage` renderiza `lesson.blocks` de uma vez, depois `ExerciseStage`) |
| P3 | Sem dificuldade progressiva: nenhum metadado de dificuldade nas microlições | `MicroLesson` em `src/lib/learning/types.ts` não tem campo de dificuldade por questão |
| P4 | Sem seção/capítulo: a trilha agrupa por matéria | `LearningPath.tsx` (`porMateria`), `curriculum.ts` (só `subjects[].topicIds`) |
| P5 | Três "próximos passos" diferentes na home: "Aula de hoje", "Treino de redação", "Trilha de aprendizado" | `dashboard.tsx` linhas 128–200 |
| P6 | Player de microlição só aceita resposta por índice (`number`), não usa `presentedOrders`, não oferece o tutor | `useLearningSession.ts#submit(answerValue: number)`, `salvar({ presentedOrders: {} })`, `ExerciseStage` sem `onAskTutor` |
| P7 | Redação e microlições têm progresso e desbloqueio em campos diferentes | `progress.lessons` vs `learning.completedLessons`; `isLessonUnlocked` vs `microLessonNodeState` |
| P8 | Nenhum momento de progressão ao fechar capítulo/seção | Não existe entidade capítulo; som `capitulo-desbloqueado` existe em `identity.ts` mas nunca dispara (docs/24) |
| P9 | Tela de conclusão da microlição não diz o que o aluno aprendeu, só estrelas + XP | `MicroLessonPlayer.tsx` bloco `stage === "completed"` |
| P10 | `/redacao` tem uma tela de mapa própria, paralela à trilha | `redacao.index.tsx` (`TrilhaCard`) |

## 3. Objetivos

1. A trilha (`/trilha`) vira a **tela inicial** e o elemento dominante: "aqui é onde eu estudo, este é meu progresso, este é o próximo passo".
2. Hierarquia explícita **Matéria → Seção → Capítulo → Lição → Passos → Questões**, com seções e capítulos visíveis na trilha.
3. Lição = **sequência de passos intercalados** (intro, ensino, questão, exemplo, questão, dica, questão mais difícil, recap), com **4–8 questões** e dificuldade não decrescente.
4. Os 7 formatos de exercício do motor existente funcionam dentro da lição, com ordem apresentada persistida (retomada fiel).
5. Conclusão de lição, capítulo e seção geram momento de progresso claro, reaproveitando `CelebracaoAula`, `XpChip`, `FocaMark`, som e háptico existentes.
6. Conteúdo legado (134 lições de redação, 59 questões, 6 microlições v1) continua funcionando sem reescrita em massa; progresso salvo é preservado.
7. Home e navegação reorganizadas: 4 itens no nav, um único "Continuar".
8. Tudo mobile-first, dark mode, reduced motion, 320–440 px, alvos de toque ≥ 44 px.

## 4. Não objetivos

- Geração de conteúdo por IA em runtime (não existe hoje e continua não existindo — docs/20 §1: "conteúdo versionado e revisado; IA apenas sob demanda"). A §10 define apenas um formato de autoria e a validação.
- Reescrever editorialmente as 134 lições de redação no formato v2. Elas entram na trilha como nós do tipo "Prática" e continuam sendo tocadas pelo `LessonPlayer` existente.
- Unificar `/study` (aula de 60s) com a trilha. `/study` vira "Praticar" no nav e permanece como está.
- Backend, autenticação real, sincronização, ranking real, simulado, diagnóstico real, conquistas/badges.
- Arte final das 8 expressões da Foca (continua no fallback neutro — docs/18 D5).
- Virtualização de lista (desnecessária: a maior matéria — Português — tem 118 nós, mas só os capítulos abertos renderizam nós; ver §17).

## 5. Arquitetura atual relevante

### 5.1 Conteúdo e motor

| Peça | Arquivo | O que faz hoje |
|---|---|---|
| Union de exercícios (7 formatos) + builders + `checkAnswer` + `shuffled` | `src/lib/lessons/types.ts`, `src/lib/lessons/define.ts` | Correção pura, validação na carga (throw) |
| Registry tipo → view | `src/lib/lessons/registry.ts`, `src/components/lessons/exercises/*.tsx` | `exerciseViewFor(type)` devolve o componente; contrato `ExerciseViewProps { exercise, answer, onAnswer, checked, shownBlocks? }` |
| Microlição v1 | `src/lib/learning/types.ts` (`MicroLesson`, `LessonBlock`), `src/content/microlicoes/*` | `blocks[]` + `checkpointExerciseId` + `practiceExerciseIds[2]` + `reviewExerciseIds[2]` + `recap` |
| Catálogo | `src/content/microlicoes/index.ts` | `MICROLICOES` (publicadas), `microLessonById`, `resolveExercise(id)` (local ou `QUESTIONS` via `questionToExercise`), validação na carga |
| Validação | `src/lib/learning/validate.ts` | `validateMicroLessons` exige exatamente 2 práticas + 2 revisões, pré-requisitos acíclicos |
| Currículo | `src/content/curriculum.ts` | Índice matéria → tópicos + ids das trilhas; **sem capítulos** |
| IDs estáveis | `src/content/exercise-ids.ts` | `q1…` para banco geral; `${lessonId}:${index}` para trilhas |
| Trilhas de redação | `src/content/trilhas/index.ts` (`TRILHAS`, `lessonById`, `allLessonsInOrder`, `TOTAL_LICOES`) | 15 `Trilha { id, nome, descricao, eixo, licoes[] }` |

### 5.2 Estado

`src/lib/store.ts`, chave `foca.state.v3`, `schemaVersion: 4` (migração em `src/lib/state-migrations.ts`). Campos relevantes:

- `progress.lessons: Record<lessonId, LessonProgress{stars,bestPct,completedAt}>` — conclusão das lições de redação (legado).
- `learning.completedLessons: Record<lessonId, MicroLessonCompletion{version,stars,bestPct,completedAt}>` — conclusão de microlições.
- `learning.activeSession: LearningSession | null` — `{ id, contentId, contentVersion, kind, stage, blockIndex, exerciseIndex, exerciseIds, answers, presentedOrders, startedAt, updatedAt, completedAt }`. `presentedOrders` existe mas nunca é preenchido.
- `learning.recentAttempts`, `skillEvidence`, `reviewSchedule`, `rewardLedger`, `tipHistory` — populados pelas Fases 7/8/11 do `20`.
- Ações: `completeMicroLesson(id, version, correct, total)` (10/20/30 XP por faixa 70/90, paga só a diferença), `completeLesson(id, correct, total)` (legado, mesma fórmula, grava em `progress.lessons`), `recordLearningAttempt`, `setActiveLearningSession`, `registrarAtividade` (streak/meta por bloco).

### 5.3 Fluxo e UI

- `useExerciseSession` (`src/hooks/useExerciseSession.ts`): máquina `answering → feedback → advancing` de UMA resposta, usada por `study.tsx` e `LessonPlayer.tsx`.
- `useLearningSession` (`src/hooks/useLearningSession.ts`): máquina da microlição inteira (`teaching → checkpoint → practice → recap → completed`), persiste em `activeSession`, registra tentativa, paga XP na conclusão.
- `MicroLessonPlayer.tsx`: `TeachingStage` (todos os blocos + botão "Testar o que aprendi") → `ExerciseStage` (view do registry + "Verificar" + `FeedbackSheet`) → `RecapStage` (recap + `ExamTipCard` + "Concluir lição") → tela de conclusão inline.
- `FeedbackSheet` (`src/components/lessons/FeedbackSheet.tsx`): folha de feedback compartilhada; `onAskTutor` opcional só no erro. `CelebracaoAula` (`src/components/lessons/CelebracaoAula.tsx`): tela de fechamento compartilhada.
- Trilha: `LearningPath.tsx` (agrupa por matéria) → `ChapterCard.tsx` (colapsável por matéria) → `LessonNode.tsx` (link ou div bloqueada). Estados: `microLessonNodeState` em `src/lib/learning/selectors.ts` (4 dimensões independentes: availability/completion/evidence/review).
- Recomendação: `recommendNext` em `src/lib/learning/recommend.ts` (sessão ativa > remediação > revisão devida > próxima lição > none). Usada só pelo card do dashboard.
- Navegação: `AppShell.tsx` (`NAV_ITEMS` 5 itens, `BottomNav`, `TutorBubble` global, `PhoneFrame` 440 px). Players usam `PhoneFrame` (sem nav).
- Splash `index.tsx` → `/welcome` ou `/dashboard`. `/onboarding` e `/signup` são redirects (`beforeLoad` + `throw redirect`).
- Som: `src/lib/audio/engine.ts` (`playFeedbackSound`, `playClosingSound` com prioridade `PRIORIDADE_FECHAMENTO`); eventos `capitulo-desbloqueado`, `conquista`, `acerto-consecutivo` existem sem disparo. Despacho via `src/lib/feedback/dispatch-feedback.ts`.
- Testes: `bun test tests/unit` (137), `bunx playwright test` (25, Chromium 390×844, `webServer` em `http://localhost:8080`).

### 5.4 IA (para não haver dúvida)

`src/lib/tutor.ts` (server function) → `src/lib/tutor-core.ts` (`generateTutorReply`, OpenAI `gpt-5.4-mini`, `fetch` direto, timeout 12 s, fallback local) → `src/lib/tutor-prompt.ts` (`buildSystemPrompt`, `TutorFocus`). **Não há nenhum código que gere lição ou questão por IA.** Não há schema JSON de lição no servidor. Toda "geração" é autoria offline em arquivos `.ts`.

## 6. Arquitetura proposta

### 6.1 Visão

```
CURRICULUM_TREE (src/content/curriculum-tree.ts)           ← NOVO: matéria → seção → capítulo → lessonIds
   │
   ├─ capítulo "micro"  → lessonIds apontam para ALL_PHASES (microlições v1/v2 + revisões sintéticas)
   └─ capítulo "legado" → trilhaId aponta para TRILHAS (lições de redação, tocadas pelo LessonPlayer)

ALL_PHASES = MICROLICOES (v1 normalizadas + v2) ∪ CHAPTER_REVIEWS (sintéticas)
   └─ stepsOf(lesson): LessonStep[]                          ← NOVO: normalização v1 → passos

buildTrail(state) → TrailModel { subjects[ sections[ chapters[ nodes ] ] ], continue }   ← NOVO: modelo puro da trilha

/trilha (home)  → LearningPath → SectionHeader → ChapterCard → LessonNode
/learn/$id      → MicroLessonPlayer (reescrito, passo a passo) → CelebracaoAula → /trilha?concluida=&capitulo=
/redacao/$id    → LessonPlayer (existente) → CelebracaoAula → /trilha?concluida=&capitulo=
```

### 6.2 Decisões fechadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Unidade de conteúdo | `MicroLesson` vira união discriminada `MicroLessonV1 | MicroLessonV2`; v2 declara `steps[]` | v1 continua compilando com uma linha nova (`chapterId`); v2 é o formato de agora em diante |
| Compatibilidade de conteúdo | **Normalização na carga** (`stepsOf`) — o motor só consome `LessonStep[]` | Zero reescrita dos 6 arquivos v1 na Fase 1; adapter é função pura testável |
| Compatibilidade de estado | Schema **v5 aditivo** na mesma chave `foca.state.v3`; sessão ativa sem `stepIndex` é descartada na migração | Única perda possível: uma lição piloto pela metade; XP/conclusões intactos |
| Hierarquia | Árvore declarativa `CURRICULUM_TREE` separada de `CURRICULUM` (índice existente) | Não quebra `assertContentValid`/testes atuais |
| Legado de redação | Entra na trilha como capítulos do tipo "legado" (nó "Prática"), tocado pelo `LessonPlayer` existente; conclusão continua em `progress.lessons` | Uma trilha só, sem migrar 1.204 exercícios nem duplicar progresso |
| Revisão de capítulo | Nó sintético `revisao--<chapterId>` gerado dos `reviewExerciseIds` das lições do capítulo (mín. 4, máx. 8 questões), opcional, desbloqueia ao concluir o capítulo | Usa conteúdo que já existe (30 itens de revisão hoje sem uso) |
| Home | `/trilha` é a home; `/dashboard` vira redirect (sob flag `FEATURES.trilhaComoHome`) | Uma tela só responde "onde estudo / progresso / próximo passo" |
| Nav | 4 itens: Aprender (`/trilha`), Praticar (`/study`), Progresso (`/progress`), Perfil (`/profile`); tutor continua FAB global | Redação deixa de ser destino paralelo — está dentro da trilha |
| "Atual" na trilha | O nó da recomendação (`recommendNext`) quando ela aponta para lição não concluída; matéria selecionada nos chips tem prioridade na ordem | Card "Continuar" e nó "atual" nunca divergem (docs/20 §13 item 3) |
| Trilha por matéria | Chips de matéria no topo (sticky); a trilha mostra **uma matéria por vez** | ENEM tem 4+ matérias; uma lista única misturaria assuntos e ficaria infinita |
| XP | Sem mudança de economia: `completeMicroLesson` 10/20/30 por faixa 70/90; revisão de capítulo idem (é o "desafio opcional de capítulo" do `20` §12) | Idempotência já testada (A14) |
| Performance | Sem virtualização; chips por matéria + capítulos colapsados por padrão (exceto o atual) + `useMemo` do modelo + `React.memo` no nó | Maior matéria tem 118 nós (115 legados + 2 micro + 1 revisão), mas só os capítulos abertos renderizam nós; DOM leve |

### 6.3 Regras de estado dos nós (definitivas)

```
locked      = capítulo bloqueado (prerequisiteChapterIds não concluídos)
              OU lição com prerequisiteLessonIds não concluídos (micro)
              OU !isLessonUnlocked (legado)
completed   = micro: learning.completedLessons[id] existe
              legado: progress.lessons[id] existe
in-progress = micro: learning.activeSession?.contentId === id && completedAt === null && !completed
current     = id === trail.continue.lessonId && !completed
available   = o resto
Precedência de avaliação: locked → completed → in-progress → current → available.
```

Dimensões extras (mostradas como texto secundário, não como status): `reviewDue` (de `microLessonNodeState().review === "due"`), `stars`.

### 6.4 Tipos de nó

| `TrailNodeKind` | Quando | Rótulo UI | Ícone (lucide) |
|---|---|---|---|
| `aula` | Microlição com ≥ 1 passo `teach` | "Aula" | `BookOpen` |
| `pratica` | Lição legada de redação (só questões) ou microlição sem `teach` | "Prática" | `PenLine` |
| `revisao` | Nó sintético de revisão de capítulo | "Revisão do capítulo" | `RotateCcw` |

Não usados nesta entrega (registrado para não reabrir): `desafio`, `checkpoint`, `simulado`, `recompensa`. Motivo: não há conteúdo nem regra de XP separada; docs/20 §22 os lista como evolução.

### 6.5 Passos de uma lição (`LessonStep`)

| `kind` | Campos | Render | CTA |
|---|---|---|---|
| `intro` | `title`, `body` (objetivo) | Foca `neutra` 56 + título + objetivo em balão | "Começar" |
| `teach` | `block: LessonBlock` (concept / worked-example / comparison / diagram — tipos existentes) | `LearningBlockView` existente | "Continuar" |
| `tip` | `title?`, `body` | Foca `neutra` 40 + balão curto (≤ 35 palavras) | "Continuar" |
| `question` | `exerciseId`, `role: "checkpoint" \| "pratica" \| "desafio" \| "revisao"`, `difficulty: 1 \| 2 \| 3` | View do registry + "Verificar" → `FeedbackSheet` | "Verificar" / "Continuar" |
| `recap` | `body` | Foca `orgulhosa` 72 + recap + `ExamTipCard` | "Concluir lição" |

Regra de composição de uma lição v2 (validada em T-04): começa com 1 `intro`, termina com 1 `recap`; `steps[1]` é `teach`; 4–8 `question`; ≥ 2 `teach`; no máximo 3 `question` seguidas; dificuldades das questões nunca decrescem; primeira questão `difficulty: 1` e `role: "checkpoint"`; última questão `difficulty ≥ 2`; ≥ 3 questões pontuadas (role ≠ checkpoint).

### 6.6 Regras de progressão

- **Lição concluída** = `completeMicroLesson` (micro) ou `completeLesson` (legado) executado. Nota: estrelas por questões pontuadas (`role !== "checkpoint"`), limiares 70/90 existentes.
- **Capítulo concluído** = todas as `lessonIds` do capítulo concluídas (a revisão sintética **não** conta para isso; ela é bônus).
- **Seção concluída** = todos os capítulos concluídos.
- **Desbloqueio**: dentro do capítulo, `prerequisiteLessonIds` (micro) / ordem sequencial (legado). Entre capítulos, `prerequisiteChapterIds` (vazio no piloto = todos abertos). Concluir não exige 100 %.
- **Celebração de capítulo**: uma vez por capítulo (`learning.celebratedChapterIds`), como `BottomSheet` na trilha ao voltar, som `capitulo-desbloqueado` disparado no evento de conclusão (não na montagem da folha). Seção concluída usa a mesma folha com título diferente e som `recompensa-especial`.

### 6.7 O que muda em relação ao `20` (registro normativo)

| Regra do `20` | Agora |
|---|---|
| §8.1: "até três blocos explicativos e ~100 palavras de ensino" | v2: até 4 passos `teach` e ≤ 220 palavras somadas de ensino (intro + teach + tip), porque o ensino agora se intercala com 4–8 questões. v1 mantém 100. |
| §8.1: "duas questões de prática" / `validateMicroLessons` exige exatamente 2 práticas | v2: 4–8 questões com dificuldade progressiva; v1 continua com a regra antiga |
| §11: trilha agrupada por matéria/capítulo colapsável | Matéria (chips) → seção → capítulo colapsável → nó |
| §14.1: `/learn/$lessonId` com "sequência ensino/checkpoint/prática/recap" | Sequência definida por `steps[]` |
| §12: "desafio opcional de capítulo com três questões" | Revisão de capítulo com 4–8 questões dos `reviewExerciseIds`, 10/20/30 XP |
| Dashboard como home (`18` §13.5) | `/trilha` como home; `/dashboard` redirect sob flag |

Tudo o mais do `20` (feedback imutável, tutor manual, som por evento, ledger, evidência, dicas, migração) permanece.

## 7. Modelo de dados

### 7.1 `src/lib/learning/types.ts` — alterações

```ts
// ADICIONAR
export type StepDifficulty = 1 | 2 | 3;
export type QuestionStepRole = "checkpoint" | "pratica" | "desafio" | "revisao";

export interface IntroStep { kind: "intro"; title: string; body: string }
export interface TeachStep { kind: "teach"; block: LessonBlock }
export interface TipStep { kind: "tip"; title?: string; body: string }
export interface QuestionStep {
  kind: "question";
  exerciseId: string;
  role: QuestionStepRole;
  difficulty: StepDifficulty;
}
export interface RecapStep { kind: "recap"; body: string }
export type LessonStep = IntroStep | TeachStep | TipStep | QuestionStep | RecapStep;

// SUBSTITUIR a interface MicroLesson por:
interface MicroLessonBase {
  id: string;
  version: number;
  subjectId: string;
  topicId: string;
  /** NOVO — id de CurriculumChapter em curriculum-tree.ts. Obrigatório. */
  chapterId: string;
  title: string;
  objective: string;
  skillIds: string[];
  prerequisiteLessonIds: string[];
  examProfileIds: string[];
  status: LessonStatus;
  estimatedTeachingSeconds: number;
  estimatedPracticeSeconds: number;
  /** Itens usados SÓ pela revisão sintética do capítulo. Exatamente 2 em lições autorais; [] em revisões sintéticas. */
  reviewExerciseIds: string[];
  recap: string;
  sources: string[];
  reviewedAt: string | null;
}
export interface MicroLessonV1 extends MicroLessonBase {
  format?: 1;
  blocks: LessonBlock[];
  checkpointExerciseId: string;
  practiceExerciseIds: string[];
}
export interface MicroLessonV2 extends MicroLessonBase {
  format: 2;
  steps: LessonStep[];
}
export type MicroLesson = MicroLessonV1 | MicroLessonV2;

// LearningSession: ADICIONAR
//   stepIndex: number;   // índice em stepsOf(lesson); answers/presentedOrders passam a ser chaveados por String(stepIndex)
// LearningState: ADICIONAR
//   celebratedChapterIds: string[];
// learningStateVazio(): incluir celebratedChapterIds: []
```

`LessonStage` continua existindo; passa a ser **derivado** do passo atual (`stageOfStep`, §7.3) e gravado em `activeSession.stage` só para compatibilidade de leitura.

### 7.2 `src/content/curriculum-tree.ts` — NOVO ARQUIVO

```ts
export interface CurriculumChapter {
  id: string;                    // ex.: "mat-porcentagem" | id da trilha legada (ex.: "crase")
  title: string;
  description?: string;
  /** Preenchido à mão para capítulos "micro"; derivado de TRILHAS para "legado" (buildLegacyChapter). */
  lessonIds: string[];
  /** Presente = capítulo legado tocado pelo LessonPlayer. */
  trilhaId?: string;
  prerequisiteChapterIds: string[];
}
export interface CurriculumSection { id: string; title: string; chapters: CurriculumChapter[] }
export interface CurriculumSubject { id: string; name: string; sections: CurriculumSection[] } // id/name = SUBJECTS
export interface Curriculum { courseId: "enem"; subjects: CurriculumSubject[] }
export const CURRICULUM_TREE: Curriculum;
/** Ids de todas as lições micro na ordem da árvore (matéria → seção → capítulo → lição). */
export const TRAIL_ORDER: string[];
export function chapterById(id: string): CurriculumChapter | undefined;
export function chapterOfLesson(lessonId: string): CurriculumChapter | undefined;
export function sectionOfChapter(chapterId: string): { subject: CurriculumSubject; section: CurriculumSection; index: number } | undefined;
```

Conteúdo obrigatório da árvore (ordem = ordem de exibição):

```
mat "Matemática"
  sec "mat-numeros" "Números e proporção"
    cap "mat-porcentagem" "Porcentagem"  lessonIds: ["porcentagem-valor","porcentagem-aumento-desconto"]
por "Português"
  sec "por-gramatica" "Gramática essencial"
    cap "por-crase" "Crase"             lessonIds: ["crase-quando-usar","crase-proibida"]
    legado trilhaId "crase"             (título = trilha.nome)
    legado trilhaId "concordancia"
    legado trilhaId "regencia-colocacao"
    legado trilhaId "pontuacao"
  sec "por-palavras" "Palavras e sons"
    legado "fonologia-ortografia", "classes-1", "verbo", "classes-2-formacao"
  sec "por-sintaxe" "Sintaxe"
    legado "sintaxe-1", "sintaxe-2"
  sec "por-leitura" "Sentido e leitura"
    legado "semantica", "interpretacao"
red "Redação"
  sec "red-dissertacao" "Dissertação ENEM"
    legado "redacao-estrutura", "redacao-argumentacao", "redacao-competencias"
bio "Biologia"
  sec "bio-celula" "A célula"
    cap "bio-citologia" "Citologia"     lessonIds: ["citologia-membrana","citologia-organelas"]
```

Todos os `prerequisiteChapterIds` são `[]` nesta entrega (docs/20 §11: "introduções acessíveis"). `buildLegacyChapter(trilhaId)` lê `trilhaById(trilhaId)` e preenche `id = trilhaId`, `title = trilha.nome`, `description = trilha.descricao`, `lessonIds = trilha.licoes.map(l => l.id)`, `trilhaId`.

### 7.3 `src/lib/learning/steps.ts` — NOVO ARQUIVO

```ts
export function stepsOf(lesson: MicroLesson): LessonStep[]
// v2: garante 1 intro no início e 1 recap no fim (insere de title/objective/recap se ausentes); devolve cópia.
// v1: [
//   { kind:"intro", title: lesson.title, body: lesson.objective },
//   ...lesson.blocks.map(block => ({ kind:"teach", block })),
//   { kind:"question", exerciseId: lesson.checkpointExerciseId, role:"checkpoint", difficulty:1 },
//   ...lesson.practiceExerciseIds.map(id => ({ kind:"question", exerciseId:id, role:"pratica", difficulty:2 })),
//   { kind:"recap", body: lesson.recap },
// ]
export function questionSteps(steps: LessonStep[]): Array<{ step: QuestionStep; stepIndex: number }>
export function scoredQuestionSteps(steps): mesmo, filtrando role !== "checkpoint"
export function stageOfStep(step: LessonStep): LessonStage
// intro|teach|tip → "teaching"; question checkpoint → "checkpoint"; question outros → "practice"; recap → "recap"
export function nodeKindOf(lesson: MicroLesson): "aula" | "pratica" | "revisao"
// id começa com "revisao--" → "revisao"; stepsOf(lesson).some(kind==="teach") → "aula"; senão "pratica"
export function isV2(lesson: MicroLesson): lesson is MicroLessonV2  // lesson.format === 2
export function teachingWordCount(steps): number  // soma de palavras de intro.body, teach (todos os textos do block), tip.body
```

### 7.4 `src/lib/learning/chapter-review.ts` — NOVO ARQUIVO

```ts
export const REVIEW_ID_PREFIX = "revisao--";
export function reviewLessonId(chapterId: string): string   // `${REVIEW_ID_PREFIX}${chapterId}`
export function isReviewLessonId(id: string): boolean
export function buildChapterReview(chapter: CurriculumChapter, lessons: MicroLesson[]): MicroLessonV2 | null
// lessons = as lições do capítulo, na ordem de chapter.lessonIds (ignorar ids não encontrados)
// ids = lessons.flatMap(l => l.reviewExerciseIds) sem duplicatas, em ordem; se ids.length < 4 → null; senão ids = ids.slice(0, 8)
// devolve {
//   id: reviewLessonId(chapter.id), version: 1, format: 2,
//   subjectId/topicId: da primeira lição, chapterId: chapter.id,
//   title: `Revisão · ${chapter.title}`,
//   objective: "Fixar o que você viu neste capítulo respondendo sem consultar a explicação antes.",
//   skillIds: união ordenada das skillIds, prerequisiteLessonIds: chapter.lessonIds (cópia),
//   examProfileIds: união, status: "published",
//   estimatedTeachingSeconds: 0, estimatedPracticeSeconds: 30 * ids.length,
//   reviewExerciseIds: [], sources: união, reviewedAt: max(reviewedAt) ou null,
//   recap: "Revisão feita. Se alguma questão travou, a lição correspondente continua aberta na trilha.",
//   steps: [ intro{title, body: objective}, ...ids.map(id => question{id, role:"revisao", difficulty:2}), recap{body: recap} ]
// }
```

Sem ensino dentro da revisão: é recuperação, não reexposição (docs/20 §9: "responder antes de ver explicação").

### 7.5 `src/lib/learning/trail.ts` — NOVO ARQUIVO

```ts
export type TrailNodeKind = "aula" | "pratica" | "revisao";
export type TrailNodeStatus = "completed" | "in-progress" | "current" | "available" | "locked";
export type TrailHref =
  | { to: "/learn/$lessonId"; params: { lessonId: string } }
  | { to: "/redacao/$licaoId"; params: { licaoId: string } };

export interface TrailNode {
  id: string; source: "micro" | "legado"; kind: TrailNodeKind; status: TrailNodeStatus;
  title: string; questionCount: number; stars?: 1 | 2 | 3; reviewDue: boolean; href: TrailHref;
}
export interface TrailChapter {
  id: string; title: string; description?: string; nodes: TrailNode[];
  completedCount: number; totalCount: number;           // sem o nó de revisão
  status: "locked" | "available" | "in-progress" | "completed"; containsCurrent: boolean;
}
export interface TrailSection { id: string; index: number; title: string; chapters: TrailChapter[]; completedCount: number; totalCount: number; status: TrailChapter["status"] }
export interface TrailSubject { id: string; name: string; sections: TrailSection[]; completedCount: number; totalCount: number }
export interface ContinueTarget {
  lessonId: string; source: "micro" | "legado"; title: string; chapterTitle: string; sectionTitle: string;
  subjectId: string; href: TrailHref; reason: RecommendationReason | "legacy-next"; explanation: string; firstTime: boolean;
}
export interface TrailModel { subjects: TrailSubject[]; continueTarget: ContinueTarget | null; currentLessonId: string | null; defaultSubjectId: string }

export function buildTrail(s: AppState, hojeISO: string): TrailModel
export function isTrailLessonLocked(lessonId: string, s: AppState): boolean   // usa a mesma regra do nó; para deep link
export function isChapterCompleted(chapter: CurriculumChapter, s: AppState): boolean
export function isSectionCompleted(section: CurriculumSection, s: AppState): boolean
export function phasesOrderedForSubject(subjectId: string | null): MicroLesson[]  // lições da matéria primeiro (ordem TRAIL_ORDER), depois o resto na ordem TRAIL_ORDER; inclui revisões sintéticas na posição do fim do capítulo
```

`buildTrail`:

1. `ordered = phasesOrderedForSubject(s.prefs.trailSubjectId)`.
2. `rec = recommendNext({ activeSession, lessons: ordered, recentAttempts, reviewSchedule, s, hojeISO, remediationAlreadyOfferedThisSession: false })`.
3. Se `rec.lessonId` existe mas `phaseById(rec.lessonId)` **não** existe (conteúdo removido) **ou** `isTrailLessonLocked(rec.lessonId, s)` é `true` (capítulo com pré-requisito não concluído — `microLessonNodeState` só olha pré-requisitos de lição, não de capítulo) → tratar como `reason: "none"`.
4. `continueTarget`: se `rec.reason !== "none"` → alvo micro; senão → `allLessonsInOrder().find(({lesson}) => !s.progress.lessons[lesson.id])` como `reason: "legacy-next"`, explanation `"Próxima lição de ${trilha.nome}."`; se nada → `null`.
5. `currentLessonId = continueTarget && !isCompleted(continueTarget) ? continueTarget.lessonId : null`.
6. Monta `subjects` percorrendo `CURRICULUM_TREE`; para cada capítulo: nós micro (`chapter.lessonIds` → `phaseById`) + nó de revisão (`phaseById(reviewLessonId(chapter.id))`, se existir) ou nós legados (`trilhaById(chapter.trilhaId).licoes`). Status conforme §6.3. `chapter.status`: `locked` se prerequisiteChapterIds não concluídos; `completed` se `isChapterCompleted`; `in-progress` se algum nó `completed`/`in-progress` e não completo; senão `available`.
7. `defaultSubjectId = s.prefs.trailSubjectId ?? continueTarget?.subjectId ?? CURRICULUM_TREE.subjects[0].id`.

### 7.6 Schema v5 (`src/lib/state-migrations.ts`, `src/lib/store.ts`)

- `CURRENT_SCHEMA_VERSION = 5`. `BACKUP_KEY` inalterado (o backup é pré-v4; não criar segundo backup).
- `parseActiveSession`: além da forma atual, exigir `typeof v.stepIndex === "number"`; caso contrário devolver `null` (sessão do motor antigo é descartada — decisão §6.2).
- `computeAdditiveFields`: `celebratedChapterIds: arrayOr(learningRaw.celebratedChapterIds, [])`; `trailSubjectId: typeof prefs.trailSubjectId === "string" ? prefs.trailSubjectId : null`.
- `Prefs`: `trailSubjectId: string | null` (default `null`).
- Ações novas em `store.ts`: `setTrailSubject(subjectId: string | null)`, `markChapterCelebrated(chapterId: string)` (push se ausente).
- Versão futura (`schemaVersion > 5`) continua não sendo rebaixada.

## 8. Fluxo da trilha

```
/ (splash) ──hydrate──► authed&&onboarded ? /trilha : /welcome
/trilha
  ├─ TrailHeader: FocaSays (bomdia|retorno|meta) · streak "N dias" · GoalRing(meta) · barra de nível
  ├─ ContinueCard: "Continuar" | "Começar por aqui" → título · capítulo › seção · explicação → CTA (único btn-primary)
  ├─ Chips de matéria (sticky): setTrailSubject(id)
  └─ Para a matéria selecionada:
       SectionHeader "SEÇÃO 1 · Números e proporção · 2/3"
         ChapterCard "Porcentagem" (aberto se containsCurrent ou in-progress; colapsado se completed/locked/available)
           LessonNode ● Concluída ★★☆ · Aula · 6 questões
           LessonNode ◉ Continuar daqui · Aula · 5 questões      ← current (anim-breathe)
           LessonNode ○ Disponível
           LessonNode ⊘ Bloqueada (div, aria-disabled)
           LessonNode ↻ Revisão do capítulo (revisao) — bloqueada até o capítulo fechar
  Search params: ?concluida=<lessonId>  → nó ganha anim-pop-in e o capítulo dele abre; matéria selecionada = a dele
                 ?capitulo=<chapterId>  → se chapterId ∉ celebratedChapterIds → ChapterCompleteSheet; ao fechar → markChapterCelebrated
```

Regras de UI da trilha: um `btn-primary` por viewport (o do ContinueCard); nós são `Link` (44 px mínimo, `min-h-14`); nó bloqueado é `div` com `aria-disabled` e rótulo textual; nada de zig-zag, nada de ícones do Duolingo. A identidade visual é o **caderno com margem**: uma linha vertical (`border-l-2 border-mar/40`) à esquerda dos nós dentro do capítulo — "Rabisco na Margem" —, marcadores redondos de 40 px sobre ela.

## 9. Fluxo da lição (`/learn/$lessonId`)

```
rota: phaseById(id) ?? EmptyState("Essa lição não existe…") 
      isTrailLessonLocked(id, s) → EmptyState("bloqueada", CTA "Ver a trilha")
      <MicroLessonPlayer key={lesson.id} lesson={lesson} />

player:
  header: [X sair] [ProgressBar value=stepIndex max=steps.length-1] [contador "3/6" só em question]
          linha abaixo: ds-label "Capítulo › Lição" (truncado)
  corpo: switch(step.kind)
    intro    → IntroStepView  → next()
    teach    → TeachStepView  → next()
    tip      → TipStepView    → next()
    question → QuestionStepView: View do registry (answer, onAnswer, checked, shownBlocks=presentedOrders[stepIndex])
               não respondida: btn "Verificar" (disabled sem resposta completa)
               respondida:     FeedbackSheet(feedback, isLast=última questão pontuada?, onContinue=advance, onAskTutor=abre tutor com focusFromExercise)
    recap    → RecapStepView (recap + ExamTipCard) → complete()
  completed → CelebracaoAula(estrelas, xp, streak, nivel, aprendizado=lesson.objective, primario "Continuar" → /trilha?concluida=&capitulo=)
  sair: BottomSheet existente ("Seu progresso fica salvo") → navigate /trilha
```

Máquina do passo (`useLearningSession`):

```
next():      guarda advancingRef; só em intro|teach|tip; stepIndex+1; se o novo passo é question e não há presentedOrders[novo] → gerar; salvar()
submit(a):   guarda submittingRef; só em question sem feedback; correct = checkAnswer(exercise, a, presentedOrders[stepIndex]);
             fb = createFeedback({ exerciseId, correct, explanation }); dispatchAnswerFeedback(fb);
             recordLearningAttempt({ role: step.role, answer: a, presentedOrder, ... });
             answers[String(stepIndex)] = fb; salvar()
advance():   guarda; só em question com feedback; stepIndex+1; gerar presentedOrder se necessário; answer=null; libera submittingRef; salvar()
complete():  guarda; só em recap; corretas = scoredQuestionSteps.filter(answers[i]?.correct).length; total = scoredQuestionSteps.length;
             antes = getState(); result = completeMicroLesson(id, version, corretas, total); depois = getState();
             eventos = level-up? marco-streak? streak-diario? meta-diaria? + (isChapterCompleted(antes)==false && isChapterCompleted(depois) ? "capitulo-desbloqueado") + (seção idem ? "recompensa-especial")
             dispatchClosingFeedback(eventos); setActiveLearningSession(null); stage=completed; devolve { chapterCompleted, sectionCompleted }
```

Resposta "completa" para habilitar Verificar: `number` para índice; para `ordenar` `answer.length === blocos.length`; para `parear` `answer.length === pares.length` (mesma regra que `LessonPlayer` já aplica via `answer === null`; o array parcial é tratado como incompleto — docs/20 §18 "array de resposta incompleto").

## 10. Integração com geração de conteúdo

Não há geração em runtime (§5.4). O que este plano entrega:

1. **Formato de autoria v2** (`MicroLessonV2`, §7.1) em arquivos `src/content/microlicoes/<materia>/<capitulo>.ts`, com `EXERCICIOS` locais construídos pelos builders de `define.ts` e `LICOES: MicroLesson[]`.
2. **Resolução de exercício ampliada**: `resolveExercise(id)` passa a resolver também IDs de trilha legada `${lessonId}:${index}` (via `lessonById` de `src/content/trilhas`), para reaproveitar os 1.204 exercícios nos 7 formatos dentro de lições v2 (docs/20 §9: reuso exige revisão; a revisão é a escolha consciente do autor ao referenciar o ID).
3. **Validação na carga** (`validateMicroLessons`, T-04) cobrindo: questão repetida na lição, alternativa repetida, lição curta demais (< 4 questões em v2), explicação vazia/curta, enunciado duplicado no catálogo, dificuldade inconsistente, `chapterId` inexistente, referência quebrada, ciclo de pré-requisito.
4. **Prompt de autoria offline (não runtime)** — Apêndice A. Serve para um humano ou IA rascunhar uma lição v2 fora do app; o resultado é colado num `.ts`, passa pelos builders e pela validação, e recebe revisão antes de `status: "reviewed"`. Não adicionar nenhuma rota/servidor para isso.

## 11. Compatibilidade com legado

| Dado legado | Estratégia | Onde |
|---|---|---|
| 6 microlições v1 (`blocks` + checkpoint + 2 práticas) | Continuam válidas como `MicroLessonV1`; `stepsOf` normaliza. **Mas** T-13 converte as 6 para v2 (objetivo P1/P2). O suporte v1 fica para conteúdo futuro e para os fixtures de teste | `steps.ts` |
| 134 lições de redação (`Trilha`/`Lesson`) | Sem migração de formato; entram na trilha como capítulos legados; player `LessonPlayer` inalterado; progresso em `progress.lessons` | `curriculum-tree.ts`, `trail.ts` |
| 59 questões do banco geral | Inalteradas; referenciáveis por `q<N>` em v2 (já funciona via `questionToExercise`) | `adapters.ts` |
| `learning.activeSession` do motor antigo (sem `stepIndex`) | Descartada na migração v5 (única perda: uma microlição piloto pela metade) | `state-migrations.ts` |
| `learning.completedLessons` / `progress.lessons` | Preservados byte a byte; conclusão com `version` antiga continua contando | `store.ts#load` (já preserva) |
| `progress.xp`, streak, ledger, evidências, revisão, dicas | Intocados | — |
| `/dashboard`, `/redacao` (URLs salvas/links) | `/dashboard` redireciona para `/trilha` (sob flag); `/redacao` continua existindo (mapa legado), só sai do nav | `dashboard.tsx`, `AppShell.tsx` |
| Testes existentes que passam por `/dashboard` e "Testar o que aprendi" | Atualizados em T-27 (lista exata lá) | `tests/e2e/*` |

## 12. UX/UI proposta

### 12.1 Trilha (home)

- Fundo `bg-neve`; hero com `surface-pauta` como no dashboard atual (mesma classe), contendo `TrailHeader` e `ContinueCard`.
- `TrailHeader`: linha 1 = `FocaSays compact` (slot `retorno` com `acolhedora` se `diasSemAtividade ≥ 2`; `meta`/`orgulhosa` se meta fechada; senão `bomdia`/`neutra` — lógica idêntica à do dashboard atual). Linha 2 = `font-mono` "N dias" · `GoalRing size={56}` · barra de nível (`ProgressBar size="sm"`, rótulo "Nível N · atual/proximo"). Efeito de celebração da meta (`dispatchClosingFeedback(["meta-diaria"])` + `marcarMetaCelebrada`) migra do dashboard para a rota `/trilha`, com o mesmo guard.
- `ContinueCard`: `card-soft` com `borderColor: var(--color-mar)` (padrão do "Aula de hoje" atual). Conteúdo: `ds-label` "Continuar" (ou "Começar por aqui" quando `firstTime`, isto é, nenhuma lição concluída em `learning.completedLessons` nem `progress.lessons`); `h2` título da lição (font-display 22/700); linha `text-xs text-nevoa` "Capítulo › Seção · Aula · N questões"; linha `text-xs text-nevoa` com `explanation` da recomendação; `Link` `btn-primary w-full` "Continuar". Se `continueTarget === null` → `EmptyState` com texto "Você concluiu tudo o que está publicado. Que tal praticar?" e CTA "Praticar" → `/study`.
- Chips de matéria: `div.sticky top-0 z-10 bg-neve/95 backdrop-blur` com `chip`/`chip-on` (classes existentes), `aria-pressed`, rolagem horizontal com `overflow-x-auto` e `scroll-snap-type: x mandatory` se não couber. Ordem = `CURRICULUM_TREE.subjects`. Cada chip mostra `name` e, à direita, `completedCount/totalCount` em `font-mono text-[11px]`.
- `SectionHeader`: `ds-label` "SEÇÃO {index}" + `h2` título (font-display 18/700) + `font-mono text-xs` `completed/total` + `ProgressBar size="sm"`. Seção `completed` mostra `Check` verde (`text-success`) ao lado do número — verde só aqui porque é conclusão real, não decorativo (docs/18 §6.1 permite "concluído").
- `ChapterCard`: `card-soft overflow-hidden`; botão de cabeçalho (`aria-expanded`) com título (font-display 14/700), `completed/total`, `ChevronDown` rotacionando; capítulo `locked` mostra `Lock` e texto "Conclua o capítulo anterior" — sem `opacity` no texto (docs/20 §4.4). Corpo: lista de `LessonNode` com a margem (`border-l-2 border-mar/40 ml-5 pl-4`).
- `LessonNode` (40 px marcador + texto + chevron, `min-h-14`, `gap-3`):

| status | marcador | texto de estado (`text-xs text-nevoa`) | interação |
|---|---|---|---|
| `completed` | `bg-mar text-white` + `Check` (ou `RotateCcw` se `reviewDue`) | "Concluída" / "Concluída · revisão sugerida" + estrelas (`Star` 14, `fill-recompensa`) | `Link` |
| `in-progress` | `border-2 border-mar bg-mar/12` + ícone do kind | "Em andamento" | `Link` |
| `current` | `border-[3px] border-mar bg-cards anim-breathe` + ícone do kind | "Continuar daqui" | `Link` |
| `available` | `border-2 border-abismo bg-cards` + ícone do kind | "Disponível" | `Link` |
| `locked` | `bg-gelo text-nevoa` + `Lock` | "Bloqueada" | `div aria-disabled` |

  Linha principal: título (font-display 14/700, `text-abismo`; `text-nevoa` só em `locked`). Linha secundária: `{rótulo do kind} · {questionCount} questões · {estado}`. `aria-label` = `${title} — ${estado}`.

### 12.2 Lição

- Header sticky (`bg-neve/95 backdrop-blur`, `border-b-2 border-gelo`): botão X 44 px (`aria-label="Sair da lição"`), `ProgressBar size="md"` (`label="Progresso da lição"`), contador `font-mono text-xs` `"{n}/{total}"` visível só em passos `question` (n = índice da questão atual entre as questões, 1-based). Segunda linha: `ds-label` truncado `"{chapter.title} › {lesson.title}"`.
- Corpo com `px-5 py-6 flex-1`, `anim-slide-up` na troca de passo (`key={stepIndex}`); `anim-shake` no container quando resposta errada (já existe).
- Rodapé: CTA `btn-primary w-full` fixo na zona do polegar (`sticky bottom-0`, `pb-[max(1.25rem,env(safe-area-inset-bottom))]`). Em `question` respondida, o rodapé é a `FeedbackSheet` existente (já sticky).
- Mascote: `intro` (Foca `neutra` 56, balão com objetivo via `FocaSays text=`), `tip` (Foca `neutra` 40 + balão), `recap` (Foca `orgulhosa` 72, existente), `FeedbackSheet` (existente, 40), `CelebracaoAula` (existente, 120). **Nunca** em `teach` nem em `question` (docs/15 §4).
- Copy nova centralizada em `src/lib/copy.ts` → `COPY.licao.*` e `COPY.trilha.*` (T-10/T-16) e inventariada em docs/21 (T-28).

### 12.3 Conclusão

`CelebracaoAula` ganha prop opcional `aprendizado?: string`; quando presente, renderiza abaixo do título um bloco `card-soft p-4 text-left` com `ds-label` "Você aprendeu" e o texto (`text-[14px] text-abismo`). Título continua vindo de `fala("fimbom"|"fimruim")`. Estrelas, `XpChip`, streak e nível como hoje. `primario = { label: "Continuar", to: "/trilha", search }`; `secundario = { label: "Refazer lição", onClick: replay }` (replay: `setActiveLearningSession(null)` + remontar o player via `key`).

### 12.4 Capítulo/seção concluídos

`ChapterCompleteSheet` (`BottomSheet` existente): ícone `FocaMark expression="empolgada" size={56}`; título "Capítulo concluído" (ou "Seção concluída"); corpo: nome do capítulo, "Você fechou {n} lições." e, se houver nó de revisão, "A revisão do capítulo está aberta."; CTA `btn-primary` "Continuar" (fecha a folha; se `continueTarget` for a revisão, o texto vira "Fazer a revisão" e navega). Sem som na montagem (o som saiu em `complete()`).

### 12.5 Navegação

`NAV_ITEMS` v2: `[{to:"/trilha", label:"Aprender", icon: BookOpen}, {to:"/study", label:"Praticar", icon: Zap}, {to:"/progress", label:"Progresso", icon: TrendingUp}, {to:"/profile", label:"Perfil", icon: User}]`, `grid-cols-4`. `isNavActive`: `/redacao` e `/redacao/*` ativam "Aprender" (`pathname.startsWith("/redacao") → "/trilha"`). `voltar()` fallback → `/trilha`.

### 12.6 `/progress` absorve os atalhos do dashboard

Adicionar no topo de `progress.tsx`, abaixo dos 3 `StatTile`, a grade 2 colunas com os `card-press` "Ranking da semana" (`/ranking`) e "N flashcards" (`/flashcards`) copiados do dashboard. Remover nada do que já existe lá. "Missões de hoje" do dashboard é descartado (redundante com `GoalRing`). "Meu plano" e "Teste premium" já existem em `/profile`.

## 13. Componentes afetados

| Arquivo | Ação |
|---|---|
| `src/lib/learning/types.ts` | Alterar (§7.1) |
| `src/lib/learning/steps.ts` | NOVO |
| `src/lib/learning/chapter-review.ts` | NOVO |
| `src/lib/learning/trail.ts` | NOVO |
| `src/lib/learning/validate.ts` | Alterar (regras v2, árvore) |
| `src/lib/learning/selectors.ts` | Sem mudança (`microLessonNodeState` e `nextAvailableMicroLesson` são reutilizados por `trail.ts`) |
| `src/lib/learning/recommend.ts` | Sem mudança de assinatura; os chamadores passam a lista já ordenada por matéria (`phasesOrderedForSubject`) |
| `src/lib/learning/adapters.ts` | Adicionar `trilhaExerciseById` |
| `src/content/curriculum-tree.ts` | NOVO |
| `src/content/microlicoes/index.ts` | Alterar (`ALL_PHASES`, `CHAPTER_REVIEWS`, `phaseById`, `resolveExercise` ampliado, ordenação) |
| `src/content/microlicoes/{biologia/citologia,matematica/porcentagem,portugues/crase}.ts` | Alterar (v2) |
| `src/lib/state-migrations.ts`, `src/lib/store.ts` | Alterar (v5) |
| `src/lib/features.ts` | Adicionar `trilhaComoHome` |
| `src/lib/copy.ts` | Adicionar `licao`, `trilha` |
| `src/hooks/useLearningSession.ts` | Reescrever |
| `src/components/learning/MicroLessonPlayer.tsx` | Reescrever |
| `src/components/learning/steps/{IntroStepView,TeachStepView,TipStepView,QuestionStepView,RecapStepView}.tsx` | NOVOS |
| `src/components/learning/LessonHeader.tsx` | NOVO |
| `src/components/learning/{LearningPath,ChapterCard,LessonNode}.tsx` | Reescrever |
| `src/components/learning/{TrailHeader,ContinueCard,SectionHeader,SubjectChips,ChapterCompleteSheet}.tsx` | NOVOS |
| `src/components/lessons/CelebracaoAula.tsx` | Adicionar prop `aprendizado` |
| `src/components/lessons/LessonPlayer.tsx` | Alterar saídas para `/trilha` + evento de capítulo |
| `src/components/brand/FocaSays.tsx` | Adicionar prop `text?` |
| `src/components/AppShell.tsx` | Nav v2 sob flag |
| `src/routes/trilha.tsx` | Reescrever |
| `src/routes/learn.$lessonId.tsx` | Alterar (lookup + lock) |
| `src/routes/dashboard.tsx` | Redirect sob flag |
| `src/routes/{index,login,aha,premium,study,progress}.tsx`, `src/routes/redacao.$licaoId.tsx` | Links `/dashboard` → `/trilha`; `/progress` recebe atalhos |
| `tests/unit/*`, `tests/e2e/*` | Ver T-26/T-27 |
| `docs/00-README.md`, `docs/21`, `docs/26` (NOVO), `CLAUDE.md` | T-28 |

## 14. Backend afetado

Nenhum. A única server function (`askTutor`) não muda. Nenhuma variável de ambiente nova.

## 15. Banco/schema afetado

Não há banco. Schema local: v4 → v5, aditivo (§7.6). Nenhuma chave de `localStorage` nova.

## 16. Plano de migration

Executado em `store.ts#load()` via `computeAdditiveFields` (já existe):

1. Ler `foca.state.v3` (fallback `flashtest.state.v2`), parse protegido — inalterado.
2. `ensureBackup` — inalterado (só cria `foca.state.backup.before-learning-v4` se não existir).
3. Campos v5: `learning.celebratedChapterIds` (default `[]`), `prefs.trailSubjectId` (default `null`), `activeSession` válida só com `stepIndex` numérico.
4. `schemaVersion = 5` se o existente ≤ 5; versão futura preservada.
5. Gravar de volta (comportamento atual). Idempotente: rodar duas vezes dá o mesmo objeto (teste em T-07).

Rollback: `FEATURES.trilhaComoHome = false` restaura dashboard/nav antigos; dados v5 são ignorados pelo código antigo sem erro (campos extras não quebram `load`). Não há como "des-descartar" uma `activeSession` v4 — aceito (§6.2).

## 17. Estratégia de rollout

- Flag nova `FEATURES.trilhaComoHome` (default `true` ao final de T-28, `false` durante T-01…T-19 para o dashboard antigo seguir funcionando enquanto a trilha é construída). A rota `/trilha` e o player novo **não** ficam atrás de flag: substituem o existente.
- Ordem de release: modelo + motor + player (T-02…T-14) → trilha (T-15…T-19) → home/nav (T-20…T-22) → gamificação e polimento (T-23…T-28).
- Performance: sem virtualização. Limites reais: Português tem 12 capítulos legados (115 lições: crase 6, concordância 9, regência 6, pontuação 12, fonologia 13, classes I 9, verbo 9, classes II 9, sintaxe I 12, sintaxe II 9, semântica 11, interpretação 10) + 1 capítulo micro (2 lições + 1 revisão); Redação tem 19 (7+6+6). A tela renderiza só a matéria selecionada e só os nós dos capítulos abertos (por padrão 1). Medir em T-28 com `performance.now()` no `useMemo` de `buildTrail` (< 5 ms em desktop) e registrar.

## 18. Plano detalhado de implementação

Formato de cada tarefa: Objetivo · Arquivos · Estado atual · Alteração · Tipos/assinaturas · Fluxo · Dependências · Critérios de aceite · Testes · Depende de / Bloqueia.

---

### FASE 0 — Preparação

#### T-01 — Baseline e leitura

**Objetivo:** garantir ponto de partida verde e registrar o estado.
**Arquivos:** nenhum alterado. Criar `docs/26-registro-execucao-jornada-v2.md` (NOVO) com a seção "Baseline".
**Alteração:** rodar `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`; anotar contagens e falhas preexistentes (ruído CRLF do ESLint é conhecido — docs/22 §2). Anotar `git status`.
**Critérios de aceite:** baseline registrado com números reais. Nenhum arquivo de código tocado.
**Depende de:** nenhuma. **Bloqueia:** todas.

---

### FASE 1 — Modelo de dados

#### T-02 — Tipos de passo e união `MicroLesson`

**Objetivo:** introduzir `LessonStep`, `MicroLessonV1 | MicroLessonV2`, `chapterId` e a normalização.
**Arquivos:** `src/lib/learning/types.ts` (alterar), `src/lib/learning/steps.ts` (NOVO), `src/content/microlicoes/biologia/citologia.ts`, `matematica/porcentagem.ts`, `portugues/crase.ts` (adicionar `chapterId` em cada lição), `tests/unit/learning-node-state.test.ts` e `tests/unit/recommend.test.ts` (fixtures ganham `chapterId`).
**Estado atual:** `MicroLesson` é interface única com `blocks/checkpointExerciseId/practiceExerciseIds`.
**Alteração:** exatamente o bloco de tipos da §7.1 e as funções da §7.3. `chapterId` das 6 lições: citologia → `"bio-citologia"`; porcentagem → `"mat-porcentagem"`; crase → `"por-crase"`. `LearningSession` ganha `stepIndex: number` (tipo apenas; leitura/escrita em T-07/T-08). `LearningState` ganha `celebratedChapterIds: string[]` e `learningStateVazio()` o inclui.
**Fluxo:** `stepsOf(v1)` → 1 intro + N teach + 1 checkpoint + 2 práticas + 1 recap.
**Dependências:** `useLearningSession.ts` e `MicroLessonPlayer.tsx` ainda leem `lesson.blocks`, `lesson.checkpointExerciseId` e `lesson.practiceExerciseIds`; com a união, o TypeScript passa a rejeitar esses acessos. Solução temporária obrigatória nesta tarefa (as 6 lições continuam v1 até T-13): nos três pontos (`useLearningSession.ts` → `exerciseSequence`; `MicroLessonPlayer.tsx` → `progressoAtual` e `TeachingStage`) escrever `const v1 = lesson as MicroLessonV1;` com o comentário `// TODO T-08: substituir por stepsOf(lesson)` e usar `v1.` no lugar de `lesson.`. T-08 remove os três casts ao reescrever o motor e o player.
**Critérios de aceite:** `bunx tsc --noEmit` limpo; `bun test tests/unit` verde; `stepsOf` de cada uma das 6 lições devolve 1 intro, ≥ 1 teach, 3 questions (1 checkpoint + 2 pratica), 1 recap, nessa ordem.
**Testes:** `tests/unit/steps.test.ts` (NOVO): v1 normaliza na ordem; v2 sem intro/recap ganha ambos; v2 com intro/recap não duplica; `questionSteps`/`scoredQuestionSteps` contam certo; `stageOfStep` mapeia os 5 casos; `nodeKindOf` para v1 com blocks = "aula", v2 sem teach = "pratica", id `revisao--x` = "revisao"; `teachingWordCount` soma intro+teach+tip e ignora questões.
**Depende de:** T-01. **Bloqueia:** T-03…T-08.

#### T-03 — `resolveExercise` resolve IDs de trilha legada

**Objetivo:** permitir que uma lição v2 referencie qualquer um dos 1.204 exercícios de `src/content/trilhas/`.
**Arquivos:** `src/lib/learning/adapters.ts` (adicionar), `src/content/microlicoes/index.ts` (alterar `resolveExercise`).
**Estado atual:** `resolveExercise` tenta `EXERCICIOS_LOCAIS`, depois `QUESTIONS` por `q.id`; lança se não achar.
**Alteração:** em `adapters.ts`: `export function trilhaExerciseById(id: string): Exercise | undefined` — se `id` casa `/^(.+):(\d+)$/`, `lessonById(grupo1)` de `@/content/trilhas`, devolve `lesson.exercicios[Number(grupo2)]` (ou `undefined`). Em `resolveExercise`: ordem local → banco geral → `trilhaExerciseById` → throw.
**Critérios de aceite:** `resolveExercise("crase-01-a-regra-de-ouro:0")` devolve o exercício de múltipla escolha "O que é crase?"; id com índice fora do array lança; `bun test tests/unit` verde.
**Testes:** adicionar 3 casos em `tests/unit/microlicoes.test.ts`.
**Depende de:** T-02. **Bloqueia:** T-13.

#### T-04 — Validação v2

**Objetivo:** impedir que lição curta, repetida, mal graduada ou vazia chegue ao aluno.
**Arquivos:** `src/lib/learning/validate.ts` (alterar `validateMicroLessons`, adicionar `validateLessonSteps`, `validateExerciseQuality`, `validateCurriculumTree`).
**Estado atual:** `validateMicroLessons` exige 2 práticas/2 revisões, pré-requisitos existentes e acíclicos, referências resolvíveis.
**Alteração** — `validateMicroLessons(licoes, resolveExercise, chapterIds: Set<string>)` (novo 3º parâmetro; chamador em `microlicoes/index.ts` passa `new Set(todos os CurriculumChapter.id)`), issues com `code`:

| code | Regra |
|---|---|
| `licao-capitulo-inexistente` | `chapterId ∉ chapterIds` |
| `licao-revisao-invalida` | `reviewExerciseIds.length !== 2` para lições autorais (id sem prefixo `revisao--`); `!== 0` para sintéticas |
| `licao-pratica-invalida` | só v1: `practiceExerciseIds.length !== 2` |
| `steps-intro-recap` | v2: `steps[0].kind !== "intro"` ou `steps[last].kind !== "recap"` ou mais de um de cada |
| `steps-primeiro-ensino` | v2 autoral: `steps[1].kind !== "teach"` (revisões sintéticas isentas) |
| `steps-questoes-quantidade` | v2: questões < 4 ou > 8 |
| `steps-ensino-quantidade` | v2 autoral: passos `teach` < 2 |
| `steps-questoes-seguidas` | v2: mais de 3 `question` consecutivas |
| `steps-dificuldade` | v2: dificuldade decresce em algum par consecutivo; primeira ≠ 1 (autoral); última < 2 |
| `steps-checkpoint` | v2 autoral: primeira questão `role !== "checkpoint"`; ou questões pontuadas < 3 |
| `steps-exercicio-repetido` | mesmo `exerciseId` em duas questões da lição, ou em `steps` e em `reviewExerciseIds` |
| `steps-palavras-ensino` | v2: `teachingWordCount > 220`; v1: soma dos textos de `blocks` > 100 (regra do `20`, agora verificada) |
| `exercicio-alternativa-repetida` | exercício resolvido com `opcoes` (multipla-escolha, complete-lacuna, interpretacao) tendo dois textos iguais após `trim().toLowerCase()` |
| `exercicio-explicacao-curta` | `explicacao.trim().length < 20` |
| `catalogo-enunciado-duplicado` | dois `exerciseId` distintos entre os **locais** das microlições com o mesmo enunciado normalizado (`pergunta`/`afirmacao`/`frase`, `trim().toLowerCase()`) |
| (existentes) | `licao-id-duplicado`, `licao-sem-skill`, `prerequisito-quebrado`, `prerequisito-ciclico`, `exercicio-nao-resolve` |

`validateCurriculumTree(tree, lessonIds: Set<string>, trilhaIds: Set<string>)`: ids de subject/section/chapter únicos; `subject.id ∈ SUBJECT_MAP`; capítulo micro sem `trilhaId` deve ter `lessonIds.length ≥ 1` e cada id ∈ `lessonIds`; capítulo legado deve ter `trilhaId ∈ trilhaIds`; `prerequisiteChapterIds` existentes e acíclicos; uma lição não pode aparecer em dois capítulos; toda lição do catálogo deve aparecer em algum capítulo (`licao-fora-da-arvore`).
**Critérios de aceite:** todas as regras têm teste positivo e negativo; catálogo atual (6 lições v1) continua válido.
**Testes:** `tests/unit/validate-v2.test.ts` (NOVO) com um fixture v2 mínimo válido e uma mutação por regra.
**Depende de:** T-02. **Bloqueia:** T-05, T-13.

#### T-05 — Árvore de currículo e ordenação do catálogo

**Objetivo:** materializar matéria → seção → capítulo.
**Arquivos:** `src/content/curriculum-tree.ts` (NOVO, §7.2), `src/content/microlicoes/index.ts` (alterar), `src/lib/learning/validate.ts` (chamar `validateCurriculumTree`).
**Estado atual:** `MICROLICOES` na ordem de concatenação dos arquivos (citologia, porcentagem, crase).
**Alteração:** em `index.ts`: `MICROLICOES = TODAS_AS_LICOES.filter(status !== "draft")` ordenada por `TRAIL_ORDER.indexOf(id)` (ids fora de `TRAIL_ORDER` vão para o fim e disparam `licao-fora-da-arvore`). Exportar `phaseById(id)` = busca em `ALL_PHASES` (T-06 completa `ALL_PHASES`; até lá `ALL_PHASES = MICROLICOES`). Manter `microLessonById` como alias de `phaseById` (chamadores existentes continuam compilando). Validar árvore na carga junto com o resto.
**Critérios de aceite:** `TRAIL_ORDER` = `["porcentagem-valor","porcentagem-aumento-desconto","crase-quando-usar","crase-proibida","citologia-membrana","citologia-organelas"]`; `MICROLICOES.map(l => l.id)` igual; `chapterOfLesson("crase-proibida").id === "por-crase"`; `sectionOfChapter("crase").section.id === "por-gramatica"`; todos os 15 `trilhaId` das trilhas aparecem exatamente uma vez.
**Testes:** `tests/unit/curriculum-tree.test.ts` (NOVO). Atualizar `tests/unit/microlicoes.test.ts` se assumir ordem antiga.
**Depende de:** T-04. **Bloqueia:** T-06, T-15.

#### T-06 — Revisão sintética de capítulo

**Objetivo:** criar o nó "Revisão do capítulo" a partir dos `reviewExerciseIds`.
**Arquivos:** `src/lib/learning/chapter-review.ts` (NOVO, §7.4), `src/content/microlicoes/index.ts` (`CHAPTER_REVIEWS`, `ALL_PHASES`).
**Alteração:** `CHAPTER_REVIEWS = capítulos micro da árvore .map(c => buildChapterReview(c, lições do capítulo)).filter(Boolean)`; `ALL_PHASES = [...MICROLICOES, ...CHAPTER_REVIEWS]`; validar `CHAPTER_REVIEWS` com `validateMicroLessons` (regras de sintética). `phaseById` busca em `ALL_PHASES`.
**Critérios de aceite:** três revisões existem (`revisao--mat-porcentagem`, `revisao--por-crase`, `revisao--bio-citologia`), cada uma com 4 questões `role: "revisao"`, `prerequisiteLessonIds` = as 2 lições do capítulo, `reviewExerciseIds: []`, `nodeKindOf === "revisao"`; um capítulo fictício com 1 lição (2 itens) devolve `null`.
**Testes:** `tests/unit/chapter-review.test.ts` (NOVO).
**Depende de:** T-05. **Bloqueia:** T-15.

---

### FASE 2 — Estado e compatibilidade

#### T-07 — Schema v5

**Objetivo:** persistir `stepIndex`, `celebratedChapterIds`, `trailSubjectId` sem perder nada.
**Arquivos:** `src/lib/state-migrations.ts`, `src/lib/store.ts`, `tests/unit/state-migrations.test.ts`, `tests/e2e/state-migration.spec.ts` (linha `expect(atualParsed.schemaVersion).toBe(4)` → `5`).
**Alteração:** exatamente §7.6. Em `store.ts`: `Prefs.trailSubjectId`, default `null` em `defaultState`, preencher em `load()` a partir de `aditivos.trailSubjectId`; `learning` já vem inteiro de `aditivos.learning`. Ações `setTrailSubject`, `markChapterCelebrated`.
**Critérios de aceite:** fixture v4 com `activeSession` sem `stepIndex` → `activeSession === null` e resto intacto; fixture v5 → preservada; XP/conclusões/ledger iguais antes e depois; dupla migração idêntica; `schemaVersion 99` preservado.
**Testes:** adicionar 4 casos em `state-migrations.test.ts`; ajustar os que fixam `4`.
**Depende de:** T-02. **Bloqueia:** T-08.

---

### FASE 3 — Motor da lição

#### T-08 — `useLearningSession` orientado a passos

**Objetivo:** motor único que percorre `stepsOf(lesson)`, aceita os 7 formatos, persiste ordem apresentada e retoma sem duplicar.
**Arquivos:** `src/hooks/useLearningSession.ts` (reescrever). Remover os `as MicroLessonV1` de T-02.
**Estado atual:** §5.3.
**Alteração:** implementar a máquina da §9. Detalhes obrigatórios:
- `const steps = useMemo(() => stepsOf(lesson), [lesson])`.
- Estado: `stepIndex`, `answers: Record<string, AnswerFeedback>`, `presentedOrders: Record<string, string[]>`, `answer: ExerciseAnswer | null`, `xpAwarded`, `stars`, `completion: { chapterCompleted, sectionCompleted } | null`; refs `submittingRef`, `advancingRef`, `completingRef`.
- Retomada: `hydrate().learning.activeSession` válida se `kind === "microlicao" && contentId === lesson.id && contentVersion === lesson.version && completedAt === null && typeof stepIndex === "number" && stepIndex < steps.length`; senão começa em 0.
- `gerarOrdem(stepIndex)`: para exercício `ordenar` → `shuffled(blocos)`; `parear` → `shuffled(pares.map(p => p.b))`; até 3 reembaralhamentos se sair igual ao original (mesma regra de `LessonPlayer`); outros tipos → não grava.
- `salvar()` grava `{ id, contentId, contentVersion, kind:"microlicao", stage: stageOfStep(step), stepIndex, blockIndex: 0, exerciseIndex: índice da questão atual entre questionSteps (ou -1), exerciseIds: questionSteps.map(exerciseId), answers, presentedOrders, startedAt, updatedAt, completedAt }`.
- `recordLearningAttempt`: `role = step.role`, `answer`, `presentedOrder: presentedOrders[String(stepIndex)]`, `exerciseVersion: stableExerciseId(exerciseId)?.version ?? 1`, resto como hoje.
- `isAnswerComplete(exercise, answer)`: `number` → true; `ordenar` → `answer.length === blocos.length`; `parear` → `answer.length === pares.length`.
- Retorno do hook: `{ steps, stepIndex, step, questionNumber, questionTotal, answer, setAnswer, feedback, presentedOrder, canVerify, next, submit, advance, complete, xpAwarded, stars, completion, isLastScoredQuestion }`.
- Extrair a lógica pura do hook para `src/lib/learning/session-logic.ts` (NOVO), sem React: `nextStepIndex(steps, stepIndex): number | null` (null no último), `isAnswerComplete(exercise, answer): boolean`, `scoreOf(steps, answers): { correct: number; total: number }` (só questões pontuadas), `presentedOrderFor(exercise, shuffle = shuffled): string[] | undefined`. O hook só chama essas funções e cuida de `useState`/refs/`salvar()`.
**Critérios de aceite:** uma lição v1 (`citologia-membrana`) e a v2 de fixture de `validate-v2.test.ts` são percorríveis do passo 0 ao `completed` pelo hook (verificado por E2E em T-27 e pelos testes unitários de `session-logic`). Reload em qualquer passo restaura `stepIndex`, resposta, frase e ordem (A8). Clique duplo não duplica tentativa nem avanço. Checkpoint não conta para estrelas.
**Testes:** `tests/unit/session-logic.test.ts` (NOVO): `scoreOf` ignora checkpoint; `isAnswerComplete` nos 7 tipos; `presentedOrderFor` nunca devolve ordem idêntica quando há ≥ 2 itens diferentes (com `shuffle` injetado); `nextStepIndex` para no último.
**Depende de:** T-07. **Bloqueia:** T-09, T-11.

#### T-09 — Conclusão: pontuação, capítulo e seção

**Objetivo:** fechar a lição uma vez, com XP idempotente e detecção de capítulo/seção concluídos.
**Arquivos:** `src/hooks/useLearningSession.ts` (`complete()`), `src/lib/learning/trail.ts` (só `isChapterCompleted`/`isSectionCompleted` nesta tarefa — o resto em T-15), `src/lib/store.ts` (sem mudança de `completeMicroLesson`).
**Alteração:** `complete()` conforme §9. `isChapterCompleted(chapter, s)`: micro → todo `lessonIds` ∈ `s.learning.completedLessons`; legado → todo `trilhaById(trilhaId).licoes[].id` ∈ `s.progress.lessons`. `isSectionCompleted` = todos os capítulos.
**Critérios de aceite:** concluir `porcentagem-valor` e depois `porcentagem-aumento-desconto` → na segunda, `completion.chapterCompleted === true` e o som escolhido é `capitulo-desbloqueado` (prioridade acima de `conclusao-licao`, abaixo de `level-up`); repetir a lição não devolve `chapterCompleted` de novo (já estava concluído antes). Seção com 1 capítulo → `sectionCompleted` junto → som `recompensa-especial`.
**Testes:** `tests/unit/trail-completion.test.ts` (NOVO) para `isChapterCompleted`/`isSectionCompleted` com estados sintéticos (micro e legado). `tests/unit/rewards.test.ts`: caso "revisão de capítulo paga 10/20/30 uma vez por faixa".
**Depende de:** T-08. **Bloqueia:** T-12, T-23.

---

### FASE 4 — Player

#### T-10 — Componentes de passo e copy

**Objetivo:** um componente por `kind`, sem lógica de estado dentro.
**Arquivos:** NOVOS `src/components/learning/steps/IntroStepView.tsx`, `TeachStepView.tsx`, `TipStepView.tsx`, `QuestionStepView.tsx`, `RecapStepView.tsx`; `src/components/brand/FocaSays.tsx` (prop `text?: string` — quando presente, usa o texto em vez de `fala(slot)`; `slot` vira opcional); `src/lib/copy.ts`.
**Alteração:**
- `IntroStepView({ step, onNext })`: `FocaSays text={step.body} expression="neutra" size={56}` + `h2` `step.title` + botão `btn-primary w-full` `COPY.licao.comecar`.
- `TeachStepView({ step, onNext })`: `LearningBlockView block={step.block}` + botão `COPY.licao.continuar`.
- `TipStepView({ step, onNext })`: `ds-label` `step.title ?? COPY.licao.dica` + `FocaSays text={step.body} size={40} compact` + botão.
- `QuestionStepView({ step, exercise, answer, onAnswer, presentedOrder, feedback, canVerify, onVerify, onContinue, onAskTutor, isLast, questionNumber, questionTotal })`: `ds-label` `{rótulo do role}` (`checkpoint` → "Checkpoint", `pratica` → "Prática", `desafio` → "Desafio", `revisao` → "Revisão"); `exercise.imagem` renderizada como em `LessonPlayer` (copiar o `<figure>`); `View = exerciseViewFor(exercise.type)`; botão "Verificar" `disabled={!canVerify}` com classe `btn-primary w-full` (o `:disabled` da utility já cuida da opacidade — **não** adicionar `opacity-40` manual); após feedback, `FeedbackSheet` com `onAskTutor` **sempre** passado (ela só mostra no erro).
- `RecapStepView({ lesson, onComplete })`: mover o `RecapStage` atual para cá sem mudança (dica de prova inclusa).
- `COPY.licao = { comecar: "Começar", continuar: "Continuar", verificar: "Verificar", concluir: "Concluir lição", dica: "Dica", sair: "Sair da lição", sairTitulo: "Sair da lição?", sairCorpo: "Seu progresso nesta lição fica salvo — você retoma de onde parou na próxima vez.", sairFicar: "Continuar estudando", sairMesmo: "Sair mesmo assim", voceAprendeu: "Você aprendeu", refazer: "Refazer lição", roles: { checkpoint: "Checkpoint", pratica: "Prática", desafio: "Desafio", revisao: "Revisão" } }`.
**Critérios de aceite:** componentes renderizam sem store (só props); `FocaSays` sem `text` continua idêntico ao atual (testes de brand voice verdes).
**Depende de:** T-02. **Bloqueia:** T-11.

#### T-11 — `MicroLessonPlayer` reescrito

**Objetivo:** player passo a passo com header contextual e tutor manual.
**Arquivos:** `src/components/learning/MicroLessonPlayer.tsx` (reescrever), `src/components/learning/LessonHeader.tsx` (NOVO), `src/lib/lessons/tutor-focus.ts` (reutilizar `focusFromExercise`; passar `subjectName`/`topic` corretos — ver abaixo).
**Alteração:**
- `LessonHeader({ onExit, value, max, counter?: string, breadcrumb: string })` conforme §12.2.
- Corpo: `switch (session.step.kind)` → componente de T-10. `key={session.stepIndex}` no container para reativar `anim-slide-up`.
- Tutor: `onAskTutor = () => openTutorWithContext(focus)` onde `focus = focusFromExercise(exercise, answer, lesson.id, lesson.title, chapter.title, session.stepIndex, presentedOrder, feedback.correct)` **e** sobrescrever `subjectName: SUBJECT_MAP[lesson.subjectId].name`, `topic: \`${chapter.title} · ${lesson.title}\``, `questionId: step.exerciseId` (id estável, docs/20 §4.2.9). Montar `<TutorBubble />` no player (como `LessonPlayer` faz), porque `PhoneFrame` não o inclui.
- Saída: `BottomSheet` atual com textos de `COPY.licao`; "Sair mesmo assim" → `navigate({ to: "/trilha" })`.
- Conclusão: T-12.
**Critérios de aceite:** lição v1 (`citologia-membrana`) e v2 (após T-13) percorríveis do início ao fim; contador "n/total" aparece só em questões; breadcrumb mostra "Citologia › Membrana…"; errar não abre o tutor; "Explicar melhor" abre o balão com o enunciado certo e zero requisições até enviar (A2 continua).
**Testes:** E2E em T-27.
**Depende de:** T-08, T-10. **Bloqueia:** T-12.

#### T-12 — Tela de conclusão e retorno à trilha

**Objetivo:** fechar com "o que você aprendeu" e voltar para a trilha destacando o avanço.
**Arquivos:** `src/components/lessons/CelebracaoAula.tsx` (prop `aprendizado?: string`; `CelebracaoAcao` ganha `search?: Record<string, string>` repassado ao `Link`), `src/components/learning/MicroLessonPlayer.tsx` (bloco `completed`), `src/routes/learn.$lessonId.tsx` (usar `phaseById` e `isTrailLessonLocked`; CTAs para `/trilha`).
**Alteração:** no estado `completed` renderizar `CelebracaoAula` com `acertos = corretas pontuadas`, `total = pontuadas`, `estrelas = session.stars`, `xpGanho = session.xpAwarded`, `streakAtual/streakMudou/nivelSubiu/nivelAtual` como `LessonPlayer` calcula (capturar `antes`/`depois` em `complete()`), `aprendizado = lesson.objective`, `primario = { label: "Continuar", to: "/trilha", search: { concluida: lesson.id, ...(completion.chapterCompleted ? { capitulo: lesson.chapterId } : {}) } }`, `secundario = { label: COPY.licao.refazer, onClick: replay }`.
**Critérios de aceite:** tela mostra estrelas, XP, "Você aprendeu" com o objetivo, e "Continuar" leva a `/trilha?concluida=<id>`; "Refazer lição" reinicia do passo 0 sem pagar XP de novo (A14).
**Depende de:** T-09, T-11. **Bloqueia:** T-18.

---

### FASE 5 — Conteúdo v2

#### T-13 — Converter as 6 lições piloto para v2

**Objetivo:** cumprir 4–8 questões intercaladas com ensino e dificuldade progressiva.
**Arquivos:** `src/content/microlicoes/matematica/porcentagem.ts`, `biologia/citologia.ts`, `portugues/crase.ts`.
**Regras de autoria (obrigatórias):**
- Manter `id`, `version` (subir para `2`), `skillIds`, `prerequisiteLessonIds`, `reviewExerciseIds` (os 2 atuais, intocados), `sources`, `recap`. `format: 2`, remover `blocks/checkpointExerciseId/practiceExerciseIds`, adicionar `steps`.
- Reaproveitar os blocos e exercícios existentes; **criar** por lição 2 exercícios novos (ids `mc:<lessonId>:pratica-3`, `mc:<lessonId>:desafio`) e 1 `tip`. Onde indicado, reaproveitar itens do banco/trilhas pelos ids listados.
- Novos exercícios só nos tipos `multiplaEscolha`, `verdadeiroFalso`, `completeLacuna`, `interpretacao` (todos expõem `role="radio"`; o helper E2E de T-27 depende disso). 4 opções em múltipla escolha, gabarito distribuído, explicação ≥ 20 caracteres que diz **por que** a correta está certa. Sem emoji, sem exclamação dupla, sem cobrança (docs/20 §7).
- `estimatedPracticeSeconds` = 30 × nº de questões; `estimatedTeachingSeconds` entre 30 e 90; `reviewedAt: "2026-09-21"` (ou data da execução); `status: "reviewed"` com a mesma ressalva de docs/22 (sem revisão pedagógica externa).

Esqueleto obrigatório (mesma forma para as 6; substituir os `<…>`):

```
1 intro   { title: <title>, body: <objective> }
2 teach   { block: <bloco concept existente> }
3 question{ <checkpoint existente>, role: "checkpoint", difficulty: 1 }
4 teach   { block: <bloco worked-example existente (ou comparison)> }
5 question{ <pratica-1 existente>, role: "pratica", difficulty: 1 }
6 question{ <pratica-2 existente>, role: "pratica", difficulty: 2 }
7 tip     { body: <erro comum do tema em ≤ 35 palavras> }
8 teach   { block: <3º bloco existente, se houver (diagram/comparison)> }   ← omitir se a lição v1 só tinha 2 blocos
9 question{ "mc:<id>:pratica-3" NOVO, role: "pratica", difficulty: 2 }
10 question{ "mc:<id>:desafio" NOVO ou id de banco/trilha, role: "desafio", difficulty: 3 }   ← contextualizada (ENEM)
11 recap  { body: <recap> }
```

Resultado: 5 questões (4 pontuadas), 2–3 `teach`, 1 `tip`. Ids sugeridos para o passo 10 (usar se o enunciado couber no objetivo; senão autorar): `porcentagem-valor` → `"q21"` (juros compostos — verificar se cabe; se não, autorar); `crase-quando-usar` → `"crase-01-a-regra-de-ouro:2"` (completar lacuna "Estou indo___ festa"); `crase-proibida` → item de `crase-02-casos-proibidos:<n>` que seja múltipla escolha/lacuna/V-F; `citologia-*` e `porcentagem-aumento-desconto` → autorar.
**Critérios de aceite:** `validateMicroLessons` sem issues; `stepsOf` de cada lição tem 5 questões e ≥ 2 teach; `teachingWordCount ≤ 220`; `bun test tests/unit` verde após T-14.
**Testes:** T-14.
**Depende de:** T-03, T-04. **Bloqueia:** T-14, T-27.

#### T-14 — Atualizar testes de conteúdo

**Arquivos:** `tests/unit/microlicoes.test.ts` (trocar "checkpoint + 2 práticas + 2 revisões = 5 posições (30)" por: cada lição `MICROLICOES` tem 4–8 questões via `questionSteps(stepsOf(l))`, `reviewExerciseIds.length === 2`, e o total de questões nas 6 lições é 30; "toda referência resolve" itera `questionSteps` + `reviewExerciseIds`; estimativas: ensino 30–90 só para `MICROLICOES`, não para `CHAPTER_REVIEWS`), `tests/unit/content-identity.test.ts` (se contar exercícios locais, ajustar o número), `tests/unit/learning-node-state.test.ts`/`recommend.test.ts` (fixtures v1 continuam válidas).
**Critérios de aceite:** `bun test tests/unit` verde; nenhuma asserção de contagem "mágica" sem comentário explicando a origem do número.
**Depende de:** T-13. **Bloqueia:** T-27.

---

### FASE 6 — Trilha

#### T-15 — Modelo da trilha (`trail.ts`)

**Objetivo:** função pura que devolve tudo o que a tela precisa.
**Arquivos:** `src/lib/learning/trail.ts` (completar §7.5), `src/lib/learning/selectors.ts` (sem mudança de API), `src/lib/learning/recommend.ts` (sem mudança).
**Alteração:** implementar `buildTrail`, `isTrailLessonLocked`, `phasesOrderedForSubject` conforme §7.5 e §6.3. `questionCount` micro = `questionSteps(stepsOf(l)).length`; legado = `lesson.exercicios.length`. `stars` micro = `completedLessons[id]?.stars`; legado = `progress.lessons[id]?.stars`. `title` legado = `lesson.titulo`.
**Critérios de aceite:** com estado vazio e `trailSubjectId: null`, `continueTarget.lessonId === "porcentagem-valor"`, `currentLessonId` idem, `defaultSubjectId === "mat"`; com `trailSubjectId: "bio"`, `continueTarget.lessonId === "citologia-membrana"`; com as 6 micro concluídas e revisões concluídas, `continueTarget.reason === "legacy-next"` apontando para a 1ª lição de `redacao-estrutura`; com tudo concluído (micro + 134 legadas), `continueTarget === null`; nó `revisao--mat-porcentagem` é `locked` até as 2 lições fecharem e `available` depois; capítulo legado `crase` tem 6 nós, o 1º `available`, os outros `locked`; `activeSession` para `crase-quando-usar` → nó `in-progress` e `continueTarget.reason === "resume-session"`; `activeSession` para id inexistente → ignorada (`reason` cai para o próximo).
**Testes:** `tests/unit/trail.test.ts` (NOVO) cobrindo cada critério acima com estados sintéticos (construir `AppState` via `learningStateVazio()` + `progress` mínimo, como `learning-node-state.test.ts` faz).
**Depende de:** T-06, T-09. **Bloqueia:** T-16, T-18.

#### T-16 — Nó, capítulo, seção

**Arquivos:** `src/components/learning/LessonNode.tsx` (reescrever: props `{ node: TrailNode; highlight?: boolean }`), `ChapterCard.tsx` (reescrever: props `{ chapter: TrailChapter; defaultOpen: boolean; highlightId?: string }`), `SectionHeader.tsx` (NOVO: props `{ section: TrailSection }`), `src/lib/copy.ts` (`COPY.trilha`).
**Alteração:** conforme §12.1. `LessonNode` é `React.memo`. `highlight` aplica `anim-pop-in` no marcador (usado pelo `?concluida`). `ChapterCard` `locked` mostra cabeçalho sem corpo e sem `aria-expanded`.
`COPY.trilha = { continuar: "Continuar", comecarAqui: "Começar por aqui", secao: (n: number) => \`Seção ${n}\`, estados: { completed: "Concluída", "completed-review": "Concluída · revisão sugerida", "in-progress": "Em andamento", current: "Continuar daqui", available: "Disponível", locked: "Bloqueada" }, kinds: { aula: "Aula", pratica: "Prática", revisao: "Revisão do capítulo" }, capituloBloqueado: "Conclua o capítulo anterior", questoes: (n: number) => \`${n} questões\`, tudoConcluido: "Você concluiu tudo o que está publicado. Que tal praticar?", praticar: "Praticar", capituloConcluido: "Capítulo concluído", secaoConcluida: "Seção concluída", fechouLicoes: (n: number) => \`Você fechou ${n} lições.\`, revisaoAberta: "A revisão do capítulo está aberta.", fazerRevisao: "Fazer a revisão" }`.
**Critérios de aceite:** cada status renderiza rótulo textual correto; nó bloqueado não é link; `aria-label` presente; alvo ≥ 44 px (`min-h-14`); dark mode sem hex literal (só tokens).
**Depende de:** T-15. **Bloqueia:** T-18.

#### T-17 — `TrailHeader` e `ContinueCard`

**Arquivos:** `src/components/learning/TrailHeader.tsx` (NOVO), `ContinueCard.tsx` (NOVO), `SubjectChips.tsx` (NOVO).
**Alteração:** conforme §12.1. `TrailHeader({ s })` copia a lógica de `foca`/`nivel`/`streak`/`GoalRing` de `dashboard.tsx`. `ContinueCard({ target: ContinueTarget | null })`. `SubjectChips({ subjects: TrailSubject[]; selectedId; onSelect })`.
**Critérios de aceite:** `ContinueCard` com `target.firstTime` mostra "Começar por aqui"; com `null` mostra o `EmptyState` com CTA "Praticar" → `/study`; chips têm `aria-pressed`.
**Depende de:** T-16. **Bloqueia:** T-18.

#### T-18 — `LearningPath` e rota `/trilha`

**Arquivos:** `src/components/learning/LearningPath.tsx` (reescrever), `src/routes/trilha.tsx` (reescrever), `src/components/learning/ChapterCompleteSheet.tsx` (NOVO, §12.4).
**Alteração:**
- `trilha.tsx`: `createFileRoute("/trilha")({ component, ssr: false, validateSearch: (raw) => ({ concluida: typeof raw.concluida === "string" ? raw.concluida : undefined, capitulo: typeof raw.capitulo === "string" ? raw.capitulo : undefined }) })`. `AppShell` **sem** `title` (hero próprio). Efeitos: (a) meta diária (migrado do dashboard); (b) se `search.concluida` e a lição existe e `s.prefs.trailSubjectId !== subjectId` → `setTrailSubject(subjectId)` uma vez; (c) se `search.capitulo` e `!celebratedChapterIds.includes(capitulo)` → `sheetOpen = true`; ao fechar → `markChapterCelebrated(capitulo)` e `navigate({ to: "/trilha", search: {}, replace: true })`. (d) se `s.learning.activeSession` aponta para id sem `phaseById` → `setActiveLearningSession(null)` (guardado por `useRef` para rodar uma vez).
- `LearningPath({ model, selectedSubjectId, highlightId })`: renderiza `SectionHeader` + `ChapterCard` da matéria selecionada; `defaultOpen = chapter.containsCurrent || chapter.status === "in-progress" || chapter.nodes.some(n => n.id === highlightId)`.
- `const model = useMemo(() => buildTrail(s, hojeISO()), [s])` na rota (o `s` muda por referência a cada `setState`, o que é o desejado).
**Critérios de aceite:** `/trilha` renderiza header, card "Continuar", chips e a matéria da recomendação; trocar chip persiste em `prefs.trailSubjectId` após reload; `?concluida=` abre o capítulo certo com o nó em pop-in; `?capitulo=` abre a folha uma vez e nunca mais para o mesmo capítulo; catálogo vazio (simular `ALL_PHASES = []` em teste unitário de `buildTrail`) não quebra a tela.
**Depende de:** T-12, T-15, T-16, T-17. **Bloqueia:** T-19, T-20.

#### T-19 — Legado aponta para a trilha

**Arquivos:** `src/components/lessons/LessonPlayer.tsx`, `src/routes/redacao.$licaoId.tsx`, `src/routes/redacao.index.tsx`.
**Alteração:** em `LessonPlayer.next()` (ramo de conclusão): capturar `antes = getState()` já existe; calcular `chapter = chapterById(trilha.id)`; `capituloFechou = chapter && !isChapterCompleted(chapter, antes) && isChapterCompleted(chapter, depois)`; se sim, `eventos.push("capitulo-desbloqueado")`; `primario = { label: "Voltar à trilha", to: "/trilha", search: { concluida: lesson.id, ...(capituloFechou ? { capitulo: trilha.id } : {}) } }`. "Sair mesmo assim" → `/trilha`. `redacao.$licaoId.tsx` EmptyState CTA → `/trilha`. `redacao.index.tsx`: manter a tela (mapa legado), adicionar no topo um `Link` `btn-ghost` "Ver na trilha" → `/trilha`.
**Critérios de aceite:** concluir a última lição de `redacao-estrutura` abre a folha de capítulo na trilha; `/redacao` continua acessível por URL.
**Depende de:** T-18. **Bloqueia:** T-27.

---

### FASE 7 — Home e navegação

#### T-20 — `/trilha` como home

**Arquivos:** `src/lib/features.ts` (`trilhaComoHome: boolean`, iniciar `false`), `src/routes/dashboard.tsx` (adicionar `beforeLoad: () => { if (FEATURES.trilhaComoHome) throw redirect({ to: "/trilha" }) }` mantendo o componente), `src/routes/index.tsx` (`navigate({ to: FEATURES.trilhaComoHome ? "/trilha" : "/dashboard" })`), `src/routes/login.tsx`, `src/routes/aha.tsx`, `src/routes/premium.tsx`, `src/routes/study.tsx` (X e "Fechar por hoje"), `src/components/learning/MicroLessonPlayer.tsx`, `src/routes/learn.$lessonId.tsx` — todos os `"/dashboard"` viram uma constante `HOME_ROUTE` exportada de `src/lib/features.ts` (`FEATURES.trilhaComoHome ? "/trilha" : "/dashboard"`).
**Critérios de aceite:** com a flag `true`, `/dashboard` redireciona; com `false`, dashboard antigo intacto. `grep -rn '"/dashboard"' src` só encontra `dashboard.tsx`, `features.ts` e `AppShell.tsx` (nav v1).
**Depende de:** T-18. **Bloqueia:** T-21.

#### T-21 — Bottom nav v2 e `/progress`

**Arquivos:** `src/components/AppShell.tsx`, `src/routes/progress.tsx`.
**Alteração:** `NAV_ITEMS_V1` (atual) e `NAV_ITEMS_V2` (§12.5); `const NAV_ITEMS = FEATURES.trilhaComoHome ? NAV_ITEMS_V2 : NAV_ITEMS_V1`; `grid-cols-${NAV_ITEMS.length}` → usar classes fixas `grid-cols-4`/`grid-cols-5` por condição (Tailwind não gera classes dinâmicas). `isNavActive` com o caso `/redacao`. `voltar()` fallback `HOME_ROUTE`. `progress.tsx` conforme §12.6.
**Critérios de aceite:** 4 itens de 64 px, ativo com pílula `bg-mar/12`; em `/redacao` "Aprender" fica ativo; `/progress` mostra os dois atalhos.
**Depende de:** T-20. **Bloqueia:** T-22.

#### T-22 — Ligar a flag

**Arquivos:** `src/lib/features.ts` (`trilhaComoHome: true`).
**Critérios de aceite:** splash → `/trilha`; E2E de T-27 verdes.
**Depende de:** T-21, T-27 (os testes precisam existir antes de ligar em definitivo; ligar temporariamente para rodá-los é permitido). **Bloqueia:** T-28.

---

### FASE 8 — Gamificação e conclusão de capítulo/seção

#### T-23 — `ChapterCompleteSheet`

**Arquivos:** `src/components/learning/ChapterCompleteSheet.tsx` (NOVO), `src/routes/trilha.tsx` (já integra em T-18).
**Alteração:** §12.4. Props `{ open, chapter: TrailChapter, sectionCompleted: boolean, reviewTarget?: TrailHref, onClose }`.
**Critérios de aceite:** folha aparece uma vez por capítulo; fechar grava `celebratedChapterIds`; reload não reabre; `Escape` fecha; foco vai para o título (comportamento do `BottomSheet`).
**Depende de:** T-18. **Bloqueia:** T-27.

#### T-24 — Destaque do avanço na trilha

**Arquivos:** `src/components/learning/LessonNode.tsx`, `ChapterCard.tsx`.
**Alteração:** nó com `highlight` → marcador `anim-pop-in`; o nó **seguinte** ao destacado (primeiro `current`/`available` do mesmo capítulo) recebe `anim-pop-in` com `animationDelay: 200ms` (desbloqueio visível). Sem som (já tocou no `complete()`).
**Critérios de aceite:** ao voltar de uma lição, o nó concluído e o próximo animam uma vez; com `prefers-reduced-motion` nada se move (bloco global de `styles.css` já zera).
**Depende de:** T-18. **Bloqueia:** T-27.

---

### FASE 9 — Estados e edge cases

#### T-25 — Tabela de edge cases implementada

**Arquivos:** os já citados; nenhum novo.
**Alteração:** garantir cada linha da §22. Pontos que exigem código explícito:
- Lição despublicada/removida com sessão ativa → T-18 (d).
- `contentVersion` diferente → sessão ignorada, lição recomeça (já é assim); conclusão antiga continua contando.
- Deep link bloqueado → `isTrailLessonLocked` na rota (T-12).
- `localStorage` indisponível → `persist()` devolve `false` (já); a lição continua em memória; nada novo.
- Sem rede → nenhuma chamada obrigatória; `TutorBubble` já tem fallback.
- Meia-noite durante a lição → `completeMicroLesson` usa `registrarAtividade` com data da conclusão (já).
- Catálogo vazio → `ContinueCard` `null` + seções vazias mostram `EmptyState` (`LearningPath` com 0 seções na matéria selecionada renderiza `EmptyState text="Nada publicado nesta matéria ainda."`).
**Critérios de aceite:** cada caso da §22 tem teste unitário ou E2E apontado na coluna "Teste".
**Depende de:** T-18…T-24. **Bloqueia:** T-27.

---

### FASE 10 — Testes e acabamento

#### T-26 — Unitários

Arquivos NOVOS já listados: `steps.test.ts`, `validate-v2.test.ts`, `curriculum-tree.test.ts`, `chapter-review.test.ts`, `session-logic.test.ts`, `trail-completion.test.ts`, `trail.test.ts`. Alterados: `state-migrations.test.ts`, `microlicoes.test.ts`, `rewards.test.ts`, `learning-node-state.test.ts`, `recommend.test.ts` (fixtures com `chapterId`; caso "lista ordenada por matéria muda a próxima lição"), `content-identity.test.ts`.
**Critérios de aceite:** `bun test tests/unit` verde; contagem final registrada em docs/26.
**Depende de:** T-02…T-25 conforme cada arquivo.

#### T-27 — E2E

**Arquivos:** `tests/e2e/helpers/licao.ts` (NOVO): `export async function percorrerLicao(page, { acertar?: boolean })` — loop: se botão "Começar" visível → clicar; senão se "Verificar" visível → clicar `[role="radio"]` `.first()` (ou `.nth(gabarito)` quando `acertar` e o teste conhece o índice) e "Verificar", esperar `[role="status"]`, clicar `/Continuar|Ver resultado/`; senão se "Continuar" visível (teach/tip) → clicar; senão se "Concluir lição" visível → clicar e sair do loop. Timeout de 15 s por passo.
Atualizar: `microlicoes.spec.ts` (usar o helper; asserções de XP: com `acertar` nas 4 pontuadas → "+30 XP"; o teste A8 reload continua, mas o passo de referência é a 1ª questão após o intro e o teach), `exam-tips.spec.ts` (helper), `trilha.spec.ts` (`/dashboard` → esperar URL `/trilha` e texto "Continuar"; "6 nós" → chips + capítulo "Porcentagem" aberto com "Continuar daqui"; deep link bloqueado idem; conclusão desbloqueia idem), `state-migration.spec.ts` (`/dashboard` → `/trilha`; `schemaVersion 5`; a heading "Ana" não existe mais na home → esperar `getByText("Continuar")`), `audio-assets.spec.ts` (`a[href="/dashboard"]` → `a[href="/trilha"]`).
Novos specs: `trail-home.spec.ts` (splash → `/trilha`; header com meta; card Continuar aponta para `porcentagem-valor`; trocar chip para "Biologia" e recarregar mantém), `lesson-v2.spec.ts` (percorre `porcentagem-valor` v2: conta 5 `[role="status"]` ao longo do caminho; contador "1/5"…"5/5"; breadcrumb "Porcentagem › O que é porcentagem"; errar não abre o balão — `page.locator('[aria-label="Fechar tutor"]')` ausente após 3 s; "Explicar melhor" abre com zero requisições a `/_serverFn/`), `chapter-complete.spec.ts` (concluir as 2 lições de Porcentagem → folha "Capítulo concluído" → fechar → reload → folha não reaparece → nó "Revisão · Porcentagem" `Disponível`), `nav.spec.ts` (4 itens; em `/redacao` "Aprender" com `aria-current="page"`).
**Critérios de aceite:** `bunx playwright test` verde em Chromium 390×844; rodar também com `viewport 320×700` nos specs `trail-home` e `lesson-v2` (projeto extra `narrow` em `playwright.config.ts`) sem CTA cortado (`toBeInViewport`).
**Depende de:** T-13…T-25.

#### T-28 — Registro, docs e acabamento

**Arquivos:** `docs/26-registro-execucao-jornada-v2.md` (NOVO: baseline, o que foi feito por tarefa, comandos e números reais, divergências, limitações — mesmo formato de docs/22), `docs/21-brand-voice-e-inventario-copy.md` (adicionar linhas para `COPY.licao.*` e `COPY.trilha.*`), `docs/00-README.md` (status do `25`), `CLAUDE.md` (parágrafo "Plano vigente" apontando para `25` + `26`; nav e home descritos), `src/lib/features.ts` (flag `true`).
Acabamento obrigatório: rodar `bunx tsc --noEmit`, `bun run build`, `bunx eslint` nos arquivos tocados; conferir dark mode das telas novas manualmente no navegador (`/profile` → "Escuro"); conferir 320 px; conferir `prefers-reduced-motion` via DevTools; medir `buildTrail` (§17).
**Critérios de aceite:** docs/26 existe com evidência real (não estimada); README e CLAUDE.md apontam para 25/26; nenhuma referência a "Testar o que aprendi" restante em `src/` ou `tests/`.
**Depende de:** T-22, T-26, T-27.

## 19. Dependências entre tarefas

```
T-01
 └─ T-02 ─┬─ T-03 ──────────────┐
          ├─ T-04 ─ T-05 ─ T-06 ┼──────────────► T-15 ─ T-16 ─ T-17 ─┐
          ├─ T-07 ─ T-08 ─ T-09 ┤                                     ├─ T-18 ─ T-19
          └─ T-10 ─────── T-11 ─┴─ T-12 ─────────────────────────────┘     │
                         T-13 (após T-03, T-04) ─ T-14                    ├─ T-20 ─ T-21 ─ T-22
                                                                           ├─ T-23, T-24 ─ T-25
                                                                           └─ T-26, T-27 ─ T-28
```

Ordem linear recomendada: T-01, T-02, T-03, T-04, T-05, T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19, T-20, T-21, T-23, T-24, T-25, T-26, T-27, T-22, T-28.

## 20. Critérios de aceite globais

| ID | Critério | Verificação |
|---|---|---|
| G1 | `/trilha` é a primeira tela pós-onboarding e responde "onde estudo / progresso / próximo passo" acima da dobra em 390×844 | E2E `trail-home` |
| G2 | Um único `btn-primary` no viewport da trilha ("Continuar") | inspeção + E2E (`getByRole("link", {name:"Continuar"})` count 1) |
| G3 | Seções e capítulos visíveis; capítulo colapsa; nó tem rótulo textual de estado | E2E `trilha` |
| G4 | Cada lição v2 tem 4–8 questões intercaladas com ≥ 2 passos de ensino e dificuldade não decrescente | unit `validate-v2`, `microlicoes` |
| G5 | Os 7 formatos funcionam no player novo com ordem apresentada persistida | unit `session-logic` + E2E A8 |
| G6 | Errar não abre o tutor; CTA abre; só o envio chama a API | E2E `lesson-v2` (zero `/_serverFn/`) |
| G7 | Retomada após reload/saída mantém passo, resposta, frase e ordem; XP não duplica | E2E `microlicoes` A8, unit `rewards` |
| G8 | Conclusão mostra estrelas, XP, "Você aprendeu"; capítulo fechado gera folha uma vez e som `capitulo-desbloqueado` | E2E `chapter-complete`, unit `trail-completion` |
| G9 | Conteúdo legado: 134 lições na trilha, tocáveis, progresso preservado | E2E `trilha` (capítulo "Estrutura da Dissertação" com 7 nós) |
| G10 | Migração v4→v5 preserva XP/conclusões; sessão antiga descartada sem erro | unit + E2E `state-migration` |
| G11 | Nav com 4 itens; `/dashboard` redireciona; rollback por flag | E2E `nav` |
| G12 | Mobile: 320–440 px sem scroll horizontal, alvos ≥ 44 px, safe-area no rodapé, dark mode sem hex literal novo | inspeção + projeto `narrow` |
| G13 | `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build` verdes | docs/26 |

## 21. Testes

Resumo dos arquivos (todos citados nas tarefas):

| Arquivo | Novo/alterado | Cobre |
|---|---|---|
| `tests/unit/steps.test.ts` | novo | normalização, contagens, stage, kind, palavras |
| `tests/unit/validate-v2.test.ts` | novo | as 16 regras da T-04 + árvore |
| `tests/unit/curriculum-tree.test.ts` | novo | ordem, lookup, 15 trilhas |
| `tests/unit/chapter-review.test.ts` | novo | 3 revisões, `null` com < 4 |
| `tests/unit/session-logic.test.ts` | novo | pontuação, resposta completa, ordem apresentada |
| `tests/unit/trail-completion.test.ts` | novo | capítulo/seção micro e legado |
| `tests/unit/trail.test.ts` | novo | status de nós, continue, matéria, legado, sessão inválida |
| `tests/unit/{state-migrations,microlicoes,rewards,learning-node-state,recommend,content-identity}.test.ts` | alterado | v5, v2, XP revisão, fixtures |
| `tests/e2e/helpers/licao.ts` | novo | percorrer lição |
| `tests/e2e/{trail-home,lesson-v2,chapter-complete,nav}.spec.ts` | novos | G1, G2, G6, G8, G11 |
| `tests/e2e/{microlicoes,exam-tips,trilha,state-migration,audio-assets}.spec.ts` | alterados | fluxo v2, `/trilha` |
| `playwright.config.ts` | alterado | projeto `narrow` 320×700 |

Comandos: `bun test tests/unit` · `bunx playwright test` · `bunx tsc --noEmit` · `bun run build`. Nenhum teste usa chave de API.

## 22. Edge cases

| Caso | Comportamento definido | Onde | Teste |
|---|---|---|---|
| Loading | Rotas `ssr: false`, conteúdo síncrono em memória; sem spinner; `hydrate()` antes de qualquer decisão | `trilha.tsx`, `index.tsx` | E2E `trail-home` |
| Primeira utilização | Card "Começar por aqui" → `porcentagem-valor`; matéria "Matemática" selecionada; capítulo aberto | `trail.ts` | unit `trail`, E2E |
| Usuário sem curso/matéria | `trailSubjectId: null` → matéria da recomendação | `trail.ts` | unit |
| Progresso antigo (v3/v4) | Migração aditiva; conclusões e XP intactos; sessão v4 descartada | `state-migrations.ts` | unit + E2E |
| Lição em andamento | Nó `in-progress`; Continuar → `resume-session`; player retoma no passo salvo | `trail.ts`, `useLearningSession` | E2E A8 |
| Lição concluída | Nó `completed` + estrelas; pode refazer; XP só pela diferença de faixa | store | unit `rewards` |
| Lição bloqueada | Nó `div aria-disabled`; deep link → EmptyState "bloqueada" | `LessonNode`, `learn.$lessonId` | E2E `trilha` |
| Capítulo concluído | Folha uma vez; revisão desbloqueia; som no evento | `ChapterCompleteSheet` | E2E `chapter-complete` |
| Seção concluída | Mesma folha, título "Seção concluída", som `recompensa-especial` | idem | unit `trail-completion` |
| Erro de API (tutor) | Fallback local existente; lição não depende | `tutor-core.ts` | E2E `tutor` (existente) |
| Conteúdo incompleto/inválido | `throw` na carga com `code` legível (nunca chega ao aluno) | `validate.ts` | unit `validate-v2` |
| Questão inválida (referência quebrada) | `exercicio-nao-resolve` na carga | idem | unit |
| Perda de conexão | Nenhuma rede obrigatória; sfx silencioso | engine | — |
| Refresh durante a lição | Restaura passo/resposta/frase/ordem; sem som/XP repetido | `useLearningSession` | E2E A8 |
| Saída no meio | Sessão salva; folha "Sair da lição?"; volta a `/trilha` | player | E2E `lesson-v2` |
| Retomada posterior (dias depois) | Igual a refresh; `updatedAt` só informativo | idem | unit `trail` |
| Conteúdo legado | Capítulos legados com `LessonPlayer`; sem retomada no meio (regra antiga mantida e dita na folha de saída existente) | `trail.ts`, `LessonPlayer` | E2E `trilha` |
| Lição removida do catálogo | Conclusão ignorada nas contagens; sessão ativa limpa uma vez; recomendação pula | `trilha.tsx` (d), `trail.ts` | unit `trail` |
| Versão de conteúdo mudou | Sessão antiga ignorada; conclusão antiga conta | `useLearningSession` | unit |
| Tudo concluído | Card vira EmptyState com "Praticar" | `ContinueCard` | unit `trail` |
| Clique duplo em Verificar/Continuar/Concluir | Uma tentativa/avanço/conclusão (refs síncronas) | hook | E2E A8 |
| Storage cheio | `persist()` false, sessão em memória, sem crash | store | unit existente |
| Reduced motion | Sem breathe/pop/shake; estados continuam textuais | `styles.css` | inspeção |
| Duas abas | Comportamento atual (última escrita vence); não prometido | — | — |

## 23. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Conteúdo v2 autoral (12 exercícios + 6 dicas novos) sem revisão pedagógica externa | Erro de gabarito chega ao aluno | Regras de autoria da T-13, validação de alternativas/explicação, ressalva explícita em docs/26 (mesma de docs/22) |
| Reescrita do motor (`useLearningSession`) regredir A7/A8/A14 | Duplicação de XP, perda de retomada | Lógica pura em `session-logic.ts` com unit; E2E A8 mantido; ledger/diff de faixa inalterados no store |
| Trilha com 115 lições legadas de Português ficar pesada/longa | Percepção de "lista infinita" | Uma matéria por vez, capítulos colapsados, `React.memo`, medição em T-28 |
| Descartar `activeSession` v4 na migração | Perder uma lição pela metade em quem estava no meio no dia do deploy | Aceito e documentado; XP/conclusão não são afetados |
| Testes E2E antigos acoplados a "Testar o que aprendi" e `/dashboard` | Suíte vermelha durante a implementação | Lista exata de specs a atualizar em T-27; flag só liga em T-22 após E2E verdes |
| Dois "atuais" (card vs nó) divergirem | Confusão do "próximo passo" | Uma única fonte: `buildTrail().continueTarget` alimenta card e status `current` |
| Tailwind não gerar classe dinâmica (`grid-cols-${n}`) | Nav quebrado | Classes literais condicionais (T-21) |
| `FocaSays` com `text` reintroduzir sorteio no render | Regressão B1 | `text` é prop; `fala()` continua em `useState` inicial |
| Duplicar `TutorBubble` (AppShell + player) | Dois balões | Player usa `PhoneFrame`, não `AppShell` (padrão do `LessonPlayer`) |

## 24. Checklist final

### Antes de codificar
- [ ] T-01 executado e registrado em docs/26.
- [ ] Este documento, `22`, `CLAUDE.md` e `18` §5–§8 lidos.

### Modelo e conteúdo
- [ ] `LessonStep`, `MicroLessonV1 | MicroLessonV2`, `chapterId` (T-02).
- [ ] `stepsOf` normaliza v1; `resolveExercise` resolve trilha (T-02/T-03).
- [ ] 16 regras de validação v2 + árvore com teste positivo/negativo (T-04).
- [ ] `CURRICULUM_TREE` com 4 matérias, 7 seções, 3 capítulos micro + 15 legados (T-05).
- [ ] 3 revisões sintéticas (T-06).
- [ ] 6 lições v2 com 5 questões cada, 30 no total, ≤ 220 palavras de ensino (T-13/T-14).

### Estado e motor
- [ ] Schema v5, sessão v4 descartada, dupla migração idêntica (T-07).
- [ ] Motor por passos, 7 formatos, `presentedOrders`, guardas (T-08).
- [ ] Conclusão com capítulo/seção e som por prioridade (T-09).

### UI
- [ ] 5 views de passo + `FocaSays text` + `COPY.licao` (T-10).
- [ ] Player com header contextual, tutor manual, saída (T-11).
- [ ] Conclusão com "Você aprendeu" e retorno com `?concluida` (T-12).
- [ ] `trail.ts` puro e testado (T-15); nó/capítulo/seção (T-16); header/continuar/chips (T-17); rota (T-18); legado (T-19).
- [ ] Home = `/trilha`, nav 4 itens, `/progress` com atalhos, flag (T-20…T-22).
- [ ] Folha de capítulo idempotente e destaque do avanço (T-23/T-24).

### Qualidade
- [ ] Edge cases da §22 cobertos (T-25).
- [ ] Unitários e E2E verdes com números reais (T-26/T-27).
- [ ] docs/26, docs/21, README, CLAUDE.md atualizados; dark mode, 320 px, reduced motion conferidos (T-28).
- [ ] Nenhuma chamada de IA nova; tutor continua manual.
- [ ] Nenhum histórico Git reescrito.

**Decisões pendentes:** nenhuma bloqueante. As duas escolhas que um humano pode querer rever depois — (1) a divisão das 12 trilhas legadas de Português em 4 seções (§7.2) e (2) o texto das 6 dicas e 12 exercícios novos (T-13) — estão decididas aqui com valores concretos; revisar não bloqueia implementar.

---

## Apêndice A — Prompt de autoria offline de lição v2 (não é código; não vai para o runtime)

Uso: um humano cola este prompt num LLM, revisa a saída, transcreve para `src/content/microlicoes/<materia>/<capitulo>.ts` usando os builders de `define.ts`, roda `bun test tests/unit` (a validação de carga roda junto) e só então marca `status: "reviewed"`.

```
Você vai escrever UMA lição de estudo para o ENEM no formato abaixo. Responda só com JSON válido.

Contexto: matéria "<nome>", capítulo "<título>", objetivo da lição: "<uma frase>", habilidades: [<skillIds>].
Voz: colega de estudo direto e respeitoso; sem emoji; sem exclamação dupla; sem cobrança; português do Brasil.

Estrutura obrigatória (nesta ordem):
1. intro { title, body(objetivo, ≤ 30 palavras) }
2. teach { block: concept { title, body ≤ 60 palavras } }
3. question { role "checkpoint", difficulty 1 }
4. teach { block: worked-example { title, problem, steps[2-4], result } }
5. question { role "pratica", difficulty 1 }
6. question { role "pratica", difficulty 2 }
7. tip { body ≤ 35 palavras sobre o erro mais comum }
8. (opcional) teach { block: comparison { title, left{label,body}, right{label,body} } }
9. question { role "pratica", difficulty 2 }
10. question { role "desafio", difficulty 3, contextualizada como o ENEM cobra }
11. recap { body ≤ 30 palavras }

Cada question é um objeto { type: "multipla-escolha" | "verdadeiro-falso" | "complete-lacuna", ... } com:
- multipla-escolha: pergunta, opcoes[4] (todas distintas), correta (índice 0-3), explicacao (≥ 20 caracteres, diz POR QUE a correta está certa)
- verdadeiro-falso: afirmacao (≥ 10 caracteres), verdadeiro (boolean), explicacao
- complete-lacuna: frase com exatamente um "___", opcoes[3-4], correta, explicacao
Regras: nenhuma pergunta repetida; gabaritos distribuídos (não use sempre o índice 0); soma das palavras de intro+teach+tip ≤ 220; dificuldade nunca diminui de uma questão para a próxima.
Também devolva reviewExerciseIds: 2 questões extras (multipla-escolha ou verdadeiro-falso) para a revisão do capítulo, diferentes das anteriores.
```

A saída passa obrigatoriamente por: builders (`multiplaEscolha`, `verdadeiroFalso`, `completeLacuna`), `validateMicroLessons` (T-04), leitura humana do gabarito. Sem esses três passos, o `status` fica `"draft"` e a lição não entra em `MICROLICOES`.
