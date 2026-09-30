> **Arquivado em 29/09/2026 (decisão 0004).** Documento histórico: o cabeçalho e o "estado" abaixo descrevem o momento em que foi escrito, não o estado atual. O que continua valendo foi extraído para os documentos canônicos ([docs/README.md](../../../README.md)); resumo e contexto: [resumo.md](resumo.md).

# 30 — Aprendizagem adaptativa: plano mestre da grande atualização

**Status:** escrito em 23/09/2026, **aprovado pelo usuário em 23/09/2026** — em execução. Ver [32 — Registro de execução](32-registro-execucao-aprendizagem-adaptativa.md) para o que já foi feito.
**Execução:** as fases, tarefas, Context Packs e prompts de executor estão em [31 — Plano de execução](31-plano-execucao-aprendizagem-adaptativa.md). Este `30` é a norma (o quê e por quê); o `31` é o como.
**Prevalece sobre:** `25` §6.6 na regra "uma matéria por vez nos chips, sem mistura" (a jornada passa a misturar matérias; o mapa por matéria continua existindo como vista secundária); `20` §13 na lista de prioridades de `recommendNext` (substituída pelo motor da §11 deste documento quando a flag `jornadaAdaptativa` estiver ligada); `20` §4.2 só no esclarecimento da §16.3 (um toque em "Me ensina do começo" equivale a tocar numa sugestão). Todo o resto do `20`, `25` e `27` continua valendo: feedback imutável, tutor nunca automático, som por evento, ledger de XP, evidência honesta, identidade visual Rabisco na Margem, sem economia (baú, moeda, vidas).

---

## Como a IA implementadora deve usar este documento

1. Não implementar a partir deste arquivo sozinho. Abrir o `31`, escolher a fase liberada no grafo de dependências (`31` §2) e ler o **Context Pack** dela. O Context Pack cita as seções deste `30` que a fase precisa; ler só essas.
2. As fórmulas, limites e contratos daqui são normativos. Se o código real divergir do que este documento descreve como "estado atual", registrar a divergência no registro de execução (`docs/historico/iniciativas/30-31-32-aprendizagem-adaptativa/32-registro-execucao-aprendizagem-adaptativa.md`, a criar na Fase 0) e seguir a intenção descrita.
3. Constantes numéricas (pesos, limiares, prazos) ficam num único arquivo por módulo e podem ser recalibradas **só** com teste de cenário atualizado e registro no `32`. Não "ajustar até o teste passar".
4. Regras que valem acima de qualquer fase: segredo só no servidor (nunca `VITE_*`); sem analytics externo e sem coleta nova de dado pessoal de aluno (`20` §14.2); errar nunca abre o tutor sozinho; histórico Git publicado nunca é reescrito (Lovable); nenhuma dependência nova sem estar listada aqui.

---

## Índice

1. Resumo executivo
2. Estado atual do sistema (arquitetura real)
3. Problemas encontrados
4. Objetivos
5. Não objetivos
6. Princípios de produto
7. Modelo pedagógico
8. Taxonomia de conteúdo
9. Sistema de Mastery
10. Sistema de Confidence
11. Motor adaptativo
12. Nivelamento (placement)
13. Checkpoints da trilha
14. Trilha principal (jornada única)
15. Modo foco
16. Experiência da questão ("Não sei" e explicação em camadas)
17. Contexto pedagógico da Foca IA
18. Expansão de conteúdo
19. Pipeline de conteúdo com IA
20. Áudio e háptico
21. Mudanças de dados ("banco")
22. Mudanças de frontend
23. Mudanças de backend
24. Estratégia de migração
25. Feature flags
26. Estratégia de testes
27. Analytics local e observabilidade
28. Riscos
29. Estratégia de custo
30. Roteiro completo de implementação
31. Glossário (nomes que colidem)
32. Revisão crítica do próprio plano

---

## 1. Resumo executivo

O Foca hoje é uma trilha curricular estática com um bom motor de lição por passos, um registro honesto de evidência por habilidade e pouquíssimo conteúdo: 6 microlições autorais em 3 matérias, 3 revisões sintéticas de capítulo, 134 lições legadas de Português/Redação e 59 questões avulsas. A "personalização" é uma lista fixa de prioridades (`recommendNext`) e a home mostra **uma matéria por vez**. Só as microlições gravam tentativas; `/study` e as lições legadas não alimentam nenhum modelo do aluno.

Esta atualização transforma isso numa plataforma adaptativa sem jogar fora o que funciona:

- **Currículo e motor separados.** O currículo ganha um grafo de habilidades com pré-requisitos (`src/content/taxonomy/`). Um motor puro e determinístico (`src/lib/adaptive/`) decide *quando*, *quanto* e *em que dificuldade*, navegando dentro do currículo. Ele nunca pula fundamento sem evidência.
- **Mastery e Confidence por habilidade, separados.** Mastery (0–100) é a chance estimada de acertar uma questão média daquela habilidade, atualizada por um modelo inspirado em TRI (3PL com escorregão, atualização estilo Elo/Glicko). Confidence (0–100) mede quanta evidência sustenta esse número (quantidade, diversidade, datas, independência, retenção, recência). Mastery só cai com evidência; o tempo derruba a Confidence e agenda revisão.
- **Uma jornada única e misturada** na home, com proporção pedagógica 70/20/10 (nível atual / revisão / desafio), foco opcional em matérias (permanente ou só por hoje) e o mapa por matéria mantido como vista secundária.
- **Nivelamento adaptativo opcional** (≈20 itens, ≈10 min, EAP com prior normal) e **checkpoints** a cada 15–25 atividades, sem ajuda, que recalibram o modelo. *(Nota 28/09/2026, `36` §B.3 K13: o teto real é 24 itens — `PLACEMENT_MAX_ITENS_TOTAL = 24`; o mínimo para medir uma área é 4 itens elegíveis; "≥ 12" era critério de rollout, cumprido com 40–45 itens diagnósticos por área.)*
- **"Não sei"** como sinal próprio e **explicação em três camadas** (curta → detalhada → Foca IA já com contexto pedagógico).
- **Conteúdo em escala via pipeline com portões**: gerador → crítico → solucionador independente (sem gabarito) → verificador → validação automática → amostragem humana. Modelos baratos fazem o volume; modelos fortes só resolvem conflito. Conteúdo sai como pacotes JSON estáticos carregados sob demanda, fora do bundle JS.
- **Áudio**: o motor já é centralizado (`src/lib/audio/engine.ts`) e os WAVs **são** publicados corretamente no build Vercel (verificado em 23/09/2026). As causas prováveis do silêncio em produção são de tempo e de ativação por gesto (prazo de 300 ms que inclui download/decodificação/`resume()`, desbloqueio só em `pointerdown`), e a correção começa por instrumentar e reproduzir no aparelho. **Háptico**: `navigator.vibrate` não existe no iOS; o plano cria detecção de capacidade e uma interface pronta para um adaptador nativo futuro.

Tudo continua local-first (store em `localStorage`, sem banco remoto), funciona sem IA e sem rede para o conteúdo já embarcado, e fica atrás de feature flags com rollback que não apaga dado.

São 16 fases (0–15) com 120 tarefas no `31`. A ordem obrigatória é taxonomia → schema → pipeline → validação → motor → conteúdo em escala. Áudio/háptico (Fase 1) pode começar em paralelo desde já.

---

## 2. Estado atual do sistema (arquitetura real)

Auditoria feita em 23/09/2026 lendo o código (não as specs). Linha de base: `bun test tests/unit` → **290 pass / 0 fail** (rodado nesta auditoria); `docs/29` registra 55 E2E verdes.

### 2.1 Tecnologias

| Camada | O que existe | Onde |
|---|---|---|
| Framework | TanStack Start + TanStack Router file-based, React 19, SSR (Nitro 3) | `src/routes/`, `src/router.tsx`, `vite.config.ts` |
| Build | Vite 8, bun, `@lovable.dev/vite-tanstack-config`; preset Nitro `vercel` quando `VERCEL=1`, senão `netlify` | `vite.config.ts`, `vercel.json` |
| UI | Tailwind v4 (tokens em `src/styles.css`), shadcn/ui (46 componentes), lucide | `src/components/ui/`, `src/components/ds/` |
| Estado | Store único `useSyncExternalStore` + `localStorage` chave `foca.state.v3`, `schemaVersion` 5, backup `foca.state.backup.before-learning-v4` | `src/lib/store.ts`, `src/lib/state-migrations.ts` |
| Validação | `zod` já é dependência (não usada no conteúdo hoje) | `package.json` |
| IA | OpenAI `gpt-5.4-mini` via `fetch` numa server function, fallback local, 12 s de timeout, validação de payload | `src/lib/tutor.ts`, `tutor-core.ts`, `tutor-prompt.ts` |
| Áudio | Web Audio, 12 WAVs aprovados (608 KB) em `public/sfx/v2/`, cache por evento, prazo de expiração | `src/lib/audio/engine.ts`, `identity.ts` |
| Háptico | `navigator.vibrate` com preferência `prefs.haptics` | `src/lib/haptics.ts` |
| Testes | `bun test tests/unit` (23 arquivos), Playwright (projetos `chromium` 390×844 e `narrow` 320×700) | `tests/`, `playwright.config.ts` |
| Deploy | GitHub `matheusvllz/flashtest` → Vercel (time `foca3`, projeto `foca`). Pendências do usuário: desligar Deployment Protection, cadastrar `OPENAI_API_KEY`, testar em celular (`29` §7) | `vercel.json` |

Não há banco de dados, autenticação real, service worker, manifest PWA nem analytics. `login()` só liga uma flag.

### 2.2 Conteúdo atual

| Fonte | Volume | Formato | Metadado pedagógico |
|---|---|---|---|
| Banco geral `src/data/questions.ts` | 59 questões, 11 matérias (mat 12, fis 7, bio 6, por 6, qui 6, geo 5, his 5, ing 4, fil 3, lit 3, soc 2) | `Question`: enunciado, 5 alternativas, gabarito, `difficulty` Fácil/Médio/Difícil, `topic` **como nome livre** (não id), dica, explicação, passo a passo, sugestão de flashcard e vídeo | Sem habilidade, sem fonte. `category: "ENEM"` em 55 delas, mas são autorais (nenhuma cita prova/ano) |
| Microlições `src/content/microlicoes/` | 6 lições v2 (porcentagem ×2, crase ×2, citologia ×2), ~42 exercícios locais | `MicroLessonV2` com `steps[]` (intro/teach/tip/question/recap), 4–8 questões com `difficulty` 1–3 e `role` | `skillIds` **por lição** (8 habilidades no total, formato `materia:slug`) |
| Revisões sintéticas | 3 (uma por capítulo micro) | Geradas por `buildChapterReview` a partir de `reviewExerciseIds` | Herdam `skillIds` |
| Trilhas legadas `src/content/trilhas/` | 15 trilhas, 134 lições, 1.204 exercícios (Português e Redação) | `Lesson` com `exercicios: Exercise[]` (7 tipos) | Nenhum: sem habilidade, sem dificuldade |
| Árvore `src/content/curriculum-tree.ts` | 4 matérias (mat, por, red, bio), 3 capítulos micro + 15 capítulos legados | matéria → seção → capítulo → lição | Capítulo não declara habilidades |
| Matérias/tópicos `src/data/subjects.ts` | 11 matérias, ~120 tópicos | id + nome | Sem área ENEM, sem pré-requisito |
| Dicas `src/content/exam-tips.ts`, provas `src/data/exams.ts` | ENEM e PAS/UnB | `ExamTip` | — |

Identidade de exercício: `src/content/exercise-ids.ts` congela `q<n>` (banco geral) e `<lessonId>:<índice>` (trilhas). `resolveExercise` (`src/content/microlicoes/index.ts`) procura em exercícios locais → banco geral (via `questionToExercise`) → trilhas legadas, e lança se não achar. Toda a validação de conteúdo roda **na carga do módulo** (`assertContentValid`, `validateCurriculumTree`, `validateMicroLessons`).

Bundle: o chunk `trilhas-*.js` já tem **578 KB** (build de 23/09/2026) e o `index-*.js` 322 KB. Conteúdo em escala não cabe no bundle.

### 2.3 Fluxo atual da trilha

1. `/` hidrata o store e redireciona: sem onboarding → `/welcome` → `/quiz` → `/aha` → `/trilha`.
2. `/trilha` (`src/routes/trilha.tsx:60-175`) chama `buildTrail(s, hojeISO())` (`src/lib/learning/trail.ts:385`): recomendação por `recommendNext` sobre as fases ordenadas com a matéria selecionada primeiro, depois árvore inteira. Renderiza `TrailHeader` → `SubjectChips` → `RecommendationHint` → `LearningPath` que mostra **só a matéria selecionada** (`SubjectPath`, caminho em zigue-zague do `27`).
3. Nó micro → `/learn/$lessonId` → `MicroLessonPlayer` + `useLearningSession` (motor por passos, retomada, `recordLearningAttempt` em `src/hooks/useLearningSession.ts:188`).
4. Nó legado → `/redacao/$licaoId` → `LessonPlayer` + `useExerciseSession` → `completeLesson` (estrelas, XP). **Não grava tentativa.**
5. "Praticar" `/study` → `pickQuestions` (`src/routes/study.tsx:41-50`): 2 questões não feitas, ordenadas por lacuna declarada → matéria difícil → resto, sem aleatoriedade. `registrarResposta` atualiza `progress.bySubject/byTopic` e XP. **Não grava tentativa.**

### 2.4 Entidades e dados persistidos (`AppState`, `src/lib/store.ts:116-138`)

- `prefs`: nome, nível escolar, UF, faculdade/curso-alvo, `difficultSubjects` (nomes), `dailyLessons`, `sound`, `haptics`, `theme`, `examTargets[]` (com `examDate?`), `showExamTips`, `trailSubjectId`.
- `progress`: contadores globais, `bySubject`/`byTopic` (só de `/study`), `lessons` (legado), flashcards com agenda própria, XP, streak honesto com congelamento, `activityDays`, `today.completedBlockIds`.
- `learning` (`src/lib/learning/types.ts:120-133`): `activeSession`, `completedLessons`, `skillEvidence`, `reviewSchedule` (escada 1/3/7/14 dias, só atualizada por tentativas `role: "revisao"`), `recentAttempts` (≤500), `rewardLedger`, `tipHistory`, `celebratedChapterIds`.
- `quiz`: respostas (sempre `[]` hoje) e `gaps` heurísticas (`src/lib/gaps.ts`).
- `tutor`: histórico de mensagens (persistido), foco (não persistido).

`Attempt` já tem `role`, `hintUsed`, `tutorUsed`, `firstSubmission`, `durationMs` — mas `hintUsed`/`tutorUsed` são sempre `false` e `durationMs` sempre `0`; `skillIds` vem da lição inteira, não do item.

### 2.5 Progressão e evidência

- `skillEvidenceState` (`src/lib/learning/review.ts:121`): "consistente" exige 5 itens distintos, 2 datas, 4 dos últimos 5 certos e uma revisão correta depois de 24 h. Checkpoint de lição e tentativa assistida não contam. É o critério A10 do `20` e continua valendo.
- `/progress` mostra faixas por matéria a partir de `progress.bySubject` (só `/study`), com "Pouca evidência" abaixo de 5 respostas.
- XP: ledger idempotente; microlição e lição legada 10/20/30 por estrelas (limiares 70/90); questão geral teto 15 (errada 5).

### 2.6 Foca IA

Balão global (`TutorBubble`, montado no `AppShell` e nos players). Abre só por ação explícita. Contexto (`TutorBubble.tsx:143-151`): nome, faculdade/curso, nível, `quiz.gaps`, `performanceFacts(s)` (contagens de `progress.bySubject`) e a questão em foco (enunciado, alternativas, gabarito, resposta dada, explicação). Não sabe habilidade, histórico de erro, "não sei", nem qual explicação o aluno já viu.

### 2.7 Onboarding

`/quiz` tem 6 passos de perfil (`name, level, state, target, course, subjects`) e chama `completeQuiz([], computeGaps([], difficultSubjects))`: **nenhuma questão de conteúdo**. As "lacunas" do `/aha` vêm só das matérias declaradas difíceis e dos primeiros tópicos do banco. O `CLAUDE.md` ainda descreve "3 questões de conteúdo real" — isso é histórico.

### 2.8 Som e háptico

- `engine.ts`: `AudioContext` criado no primeiro `pointerdown`/`keydown` capturado em `__root.tsx:154-163`, que também pré-carrega os 12 WAVs em paralelo. `playFeedbackSound` tem prazo total de **300 ms** (`engine.ts:127-128`) contando `resume()`, download, decodificação e fila; `playClosingSound` 500 ms. Qualquer falha é silenciosa. Testes E2E cobrem o motor **em dev (localhost)**, onde download é instantâneo.
- Build Vercel verificado em 23/09/2026 (`VERCEL=1 bun run build`): `.vercel/output/static/sfx/v2/` contém os 12 WAVs e o `config.json` serve o filesystem antes de cair no SSR. **Caminho e empacotamento não são a causa.**
- Háptico: `navigator.vibrate` (inexistente no iOS Safari). Sem detecção exposta à UI: o toggle aparece igual para quem não tem suporte.

### 2.9 Comportamento mobile

`PhoneFrame` + `AppShell` com bottom nav de 4 itens e `env(safe-area-inset-bottom)`. E2E no projeto `narrow` (320×700) só para 3 specs. Sem teste em aparelho físico (limitação registrada em `22`, `26`, `29`).

### 2.10 Sistemas reaproveitáveis (não reconstruir)

| Sistema | Reaproveitamento nesta atualização |
|---|---|
| `useLearningSession` + `MicroLessonPlayer` + `stepsOf` | Tocam qualquer sequência de passos. Sessões dinâmicas (prática, revisão, desafio, checkpoint, nivelamento) viram `MicroLessonV2` sintética, como `buildChapterReview` já faz |
| `buildChapterReview` | Padrão para sessão sintética |
| `Exercise` + registry de 7 tipos | Formato único de item; nenhum tipo novo nesta atualização |
| `exercise-ids.ts` + `resolveExercise` | Identidade estável; ganha uma quarta fonte (pacotes) |
| `recordLearningAttempt` + `Attempt` | Continua sendo o log de eventos de resposta; ganha campos aditivos |
| `skillEvidence` + `skillEvidenceState` | Entra no cálculo de Confidence e segue como selo "consistente" |
| `reviewSchedule` | Continua sendo **a** agenda de revisão (escada estendida) |
| `rewardLedger` | Idempotência de XP das atividades novas |
| `state-migrations.ts` | Migração v5→v6 aditiva no mesmo padrão |
| `FEATURES` | Flags novas no mesmo arquivo |
| Caminho visual do `27` (`PathNode`, `PathConnector`, `path-layout`) | Desenha a jornada |
| `FeedbackSheet` | Recebe as camadas de explicação e a variante "não sei" |
| `openTutorWithContext` + `TutorFocus` | Recebe o contexto pedagógico |
| Motor de áudio e `dispatch-feedback.ts` | Corrigidos, não reescritos |

---

## 3. Problemas encontrados

| # | Problema | Evidência | Efeito |
|---|---|---|---|
| P1 | Conteúdo mínimo para uma trilha longa | §2.2 | Qualquer algoritmo adaptativo fica sem o que escolher |
| P2 | Só microlição grava tentativa | `recordLearningAttempt` tem um único chamador (`useLearningSession.ts:188`) | `/study` e 134 lições legadas não informam o modelo |
| P3 | Habilidade por lição, não por item | `useLearningSession.ts:188` usa `lesson.skillIds` | Um erro de "fator multiplicativo" conta contra "conceito de porcentagem" |
| P4 | Sem dificuldade utilizável nos itens | Banco geral tem rótulo textual; trilhas nada | Não dá para mirar dificuldade |
| P5 | `hintUsed`/`tutorUsed`/`durationMs` sempre falsos/zero | `useLearningSession.ts` | Ajuda não é descontada da evidência |
| P6 | Home mostra uma matéria por vez | `LearningPath` renderiza só `defaultSubjectId`; regra `25` §6.6 | Sensação de mini-trilhas; o aluno escolhe sozinho o que estudar |
| P7 | Recomendação é lista fixa | `recommend.ts` | Não considera nível, prova, equilíbrio, desafio |
| P8 | Onboarding não mede nada | `quiz.tsx` → `completeQuiz([])` | Lacunas do `/aha` são declaradas, não medidas |
| P9 | Nenhuma medida de incerteza | Só o selo binário "consistente" | Não diferencia "parece saber" de "sabe com evidência" |
| P10 | Tutor sem situação pedagógica | §2.6 | Explica sem saber o histórico da habilidade |
| P11 | Topic do banco geral é nome livre | `questions.ts` `topic: "Função do segundo grau"` | Não liga com `subjects.ts` nem com habilidade |
| P12 | Validação de conteúdo na carga do módulo | `microlicoes/index.ts` | Com milhares de itens, custo de boot e bundle |
| P13 | Som depende de prazo curto medido só em localhost | §2.8 | Primeiro som (ou todos, em rede lenta/iOS) some sem aviso |
| P14 | Desbloqueio de áudio em `pointerdown` | `__root.tsx` | Em toque, `pointerdown` não é ativação de usuário no Chrome/Safari; o `resume()` real só acontece no clique da resposta |
| P15 | Háptico sem detecção de suporte | `haptics.ts` | No iPhone o toggle promete algo que não existe |
| P16 | Rótulo "Checkpoint" já é usado para a checagem dentro da lição | `COPY.licao.roles.checkpoint` | Colide com o checkpoint periódico pedido |
| P17 | `.vercel/` fora do `.gitignore` | `.gitignore` | Um build local com `VERCEL=1` deixa artefato não rastreado |

---

## 4. Objetivos

| ID | Objetivo | Medida verificável |
|---|---|---|
| O1 | Aluno vê na home uma sessão recomendada, com motivo e tempo | E2E: home mostra CTA único, motivo em texto, estimativa em minutos |
| O2 | Jornada única mistura matérias sem parecer aleatória | Teste de motor: em 30 atividades simuladas, nenhuma sequência de 3 da mesma matéria; toda atividade tem `reason` |
| O3 | Mastery e Confidence por habilidade, independentes | Testes de cenário A–G (§26.3) dentro das faixas esperadas |
| O4 | Adaptação conservadora 70/20/10 | Teste de motor: em janela de 20 atividades, 60–80% nível atual, 15–30% revisão, ≤15% desafio. *Nota 28/09/2026 (`36` K12): a regra operacional é a janela móvel de 10 (`JANELA_MIX = 10`); esta validação de 20 significa medir duas janelas consecutivas de 10 num plano de 20, não é outra regra.* |
| O5 | Currículo protegido | Teste: habilidade com pré-requisito sem evidência nunca é introduzida; `core` nunca é pulada sem confirmação |
| O6 | Nivelamento opcional e adaptativo | E2E: pular funciona; fazer gera estimativas por área e por habilidade medida |
| O7 | Checkpoints periódicos recalibram | Teste: checkpoint com erros em habilidade "forte" reduz Mastery e agenda revisão |
| O8 | "Não sei" como sinal próprio | Teste: gera tentativa `response: "dont-know"`, feedback neutro, efeito menor que erro com chute |
| O9 | Explicação em camadas e IA com contexto | E2E: três níveis; nível 3 abre o balão com contexto pedagógico sem o aluno repetir a questão |
| O10 | Conteúdo em escala com qualidade | Onda 1: ≥60 habilidades, cada uma com ≥1 aula e ≥12 itens; 0 item publicado sem passar pelos portões |
| O11 | Som funciona em produção | Checklist em Chrome Android e Safari iOS físicos + diagnóstico mostra 0 descarte por prazo em rede 4G |
| O12 | Háptico honesto | Toggle informa "não disponível" quando não há suporte; nenhum erro de console |
| O13 | Funciona sem IA e com falha do motor | Teste: exceção no planner cai no fallback determinístico; sem chave OpenAI tudo segue |
| O14 | Nada quebra para quem já usa | Migração v5→v6 idempotente; XP, streak, lições concluídas preservados; flags desligáveis sem perda |

---

## 5. Não objetivos

- **Banco de dados remoto, autenticação real, sincronização entre dispositivos.** Continua local-first. O modelo de dados fica pronto para sincronizar (§21.6), mas escolher fornecedor é decisão futura.
- **Geração de questão por IA em tempo de uso.** A IA gera conteúdo **offline**, no pipeline, com portões. Em tempo de uso, "dinâmico" é seleção e sequência, não texto novo (mesma regra do `25` §4).
- **Prever nota do ENEM.** Proibido pelo `20` §13. Nada de "sua nota seria 680". O nivelamento dá faixas e estimativas por habilidade.
- **Afirmar TRI oficial.** O modelo é *inspirado em TRI*. Só itens com parâmetros públicos do Inep usam parâmetros calibrados, e mesmo assim a escala interna não é a escala do ENEM.
- **Novo tipo de exercício.** Os 7 tipos atuais bastam.
- **Economia de jogo** (baú, moeda, vidas, multiplicador aleatório) — mantém `27` §4.
- **Reescrever as 134 lições legadas em formato v2.** Elas ganham metadados (habilidade, dificuldade), não reescrita.
- **Redação avaliada por IA** (correção de texto livre). Fora de escopo; o pilar de redação segue como está.
- **PWA/service worker, Capacitor, app nativo.** Só a interface do háptico fica pronta para isso.
- **Unificar `/study` com a jornada.** "Praticar" continua existindo; passa a gravar tentativas e a escolher questões pelo modelo quando a flag estiver ligada, sem mudar de rota.
- **Painel de observabilidade para o usuário final.** O diagnóstico é de desenvolvimento.

---

## 6. Princípios de produto

1. **Teste do João** (`14`): cada decisão responde "o que eu estudo agora, e por quê" para alguém sem sistema de estudo, sem dinheiro e com atenção curta. Sessões de 5–15 min.
2. **Constância e direção, não volume** (`08` §0): o conteúdo cresce para abastecer a jornada, não para virar biblioteca.
3. **Honestidade de medida**: número só aparece com evidência mínima; "Ainda medindo" é uma resposta válida. Nunca "Você domina isso" com pouca evidência.
4. **O motor explica**: toda atividade tem um motivo em linguagem simples, gerado por regra, nunca "a IA descobriu".
5. **Conservador por padrão**: na dúvida, consolidar antes de avançar. Fundamento nunca é pulado sem confirmação.
6. **Sem culpa**: errar e dizer "não sei" são dados, não falhas. Voz do `20` §7.1.
7. **IA no centro, com rede de segurança** (`00`): a IA gera conteúdo com verificação e explica com contexto; a decisão pedagógica em tempo real é regra transparente e testável.
8. **Incremental**: cada fase entrega algo testável atrás de flag, sem reescrever o que funciona.

---

## 7. Modelo pedagógico

### 7.1 Unidades

| Unidade | O que é | Implementação |
|---|---|---|
| **Habilidade** | O que o aluno precisa conseguir fazer ("calcular X% de um valor"). Unidade de Mastery, Confidence e revisão | `SkillDef` (§8) |
| **Aula** | Microlição v2 que ensina 1–2 habilidades: intro → ensino intercalado com 4–8 questões → recap | `MicroLessonV2` existente |
| **Atividade** | Unidade da jornada: aula, prática, revisão, desafio, checkpoint ou lição legada | `PlannedActivity` (§11.6) |
| **Item** | Uma questão com metadado | `Exercise` + `ItemMeta` (§8.4) |

### 7.2 Ciclo de uma habilidade

```text
bloqueada (pré-requisito sem evidência)
  → nova (pré-requisitos ok)            → AULA (ensino + checagem rápida + prática guiada)
  → em aprendizado                       → PRÁTICA (itens com p≈0,70)
  → consolidando (Mastery≥70, Conf<60)   → PRÁTICA/REVISÃO espaçada
  → firme (Mastery≥75, Conf≥50)          → DESAFIO ocasional (p≈0,50) + REVISÃO na data
  → instável (erro em revisão/checkpoint) → REFORÇO (itens p≈0,80 + explicação) e agenda reinicia
```

Essas "fases" são rótulos derivados de Mastery/Confidence/agenda, não um campo gravado. O motor decide a próxima atividade a partir deles (§11).

### 7.3 Papéis de questão (mantidos do `20` §9, com dois ajustes)

| Papel (`role`) | Onde | Ajuda | Conta para Mastery | Peso |
|---|---|---|---|---|
| `checkpoint` (checagem dentro da aula) | 1ª questão da aula | livre | Sim, com peso baixo (compreensão imediata) | 0,5 |
| `pratica` | aula, prática | dica/tutor opcionais | Sim | 1,0 (0,3 se assistida) |
| `revisao` | revisão | responder antes de ver explicação | Sim; conta retenção se ≥24 h | 1,0 |
| `desafio` | desafio | explicação depois | Sim | 1,0 |
| `diagnostico` | nivelamento **e** checkpoint da trilha | nenhuma | Sim | 1,2 |

Ajuste 1: a checagem dentro da aula passa a contar para Mastery com peso 0,5 (hoje não conta para evidência). Ela **continua sem contar** para o selo "consistente" e para Confidence (regra A10 do `20` preservada).
Ajuste 2: `diagnostico`, que já existe no tipo e nunca foi usado, passa a ser o papel do nivelamento e do checkpoint da trilha.

### 7.4 Proporção 70/20/10

Princípio, não cota rígida: numa janela móvel de 10 atividades, ~70% no nível atual (aula nova ou prática com p≈0,70), ~20% revisão/consolidação, ~10% desafio. Revisão atrasada há mais de 3 dias pode subir a fatia de revisão até 35%. Desafio nunca passa de 2 em 10.

### 7.5 Fundamento pedagógico e limites

Recuperação ativa, espaçamento e exemplo resolvido antes da prática têm sustentação em pesquisa ([IES Practice Guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)), já citada no `20` §13. Isso não garante ganho para esta implementação sem medir. O modelo de Mastery é heurístico, inspirado em TRI; não é psicometria validada.

---

## 8. Taxonomia de conteúdo

### 8.1 Hierarquia

```text
Área ENEM (LC · MT · CN · CH · RED)
  └ Matéria (ids existentes de src/data/subjects.ts)
      └ Tema (topic ids existentes de subjects.ts)
          └ Habilidade Foca (SkillDef — a unidade do modelo)
              ├ prerequisites: SkillDef.id[]   (grafo acíclico)
              ├ enemSkills: "MT:H16" …          (referência à Matriz do Inep, opcional)
              └ tags: subtema livre             (sem entidade própria)
```

Decisões:

- **"Competência" não vira entidade.** A Matriz de Referência do ENEM organiza competências de área e habilidades H1–H30; guardar só a referência `enemSkills` na habilidade Foca basta para estatística e para cruzar com os microdados do Inep. Criar a entidade seria complexidade sem consumidor.
- **Subtema é `tags`**, não nível da árvore.
- **A árvore `CURRICULUM_TREE` (matéria → seção → capítulo → lição) continua como organização de apresentação** do mapa por matéria. Capítulo ganha `skillIds?: string[]` (as habilidades que ensina). A habilidade é a ligação entre currículo, itens e modelo.
- **Id de habilidade mantém o formato já usado**: `<subjectId>:<slug>` (ex.: `mat:porcentagem-valor`). As 8 habilidades existentes continuam com o mesmo id.
- **Redação** tem área própria `RED`; o nivelamento não mede redação (texto livre).

### 8.2 `SkillDef`

```ts
// NOVO ARQUIVO PROPOSTO: src/content/taxonomy/types.ts
export type EnemArea = "LC" | "MT" | "CN" | "CH" | "RED";

export interface SkillDef {
  id: string;                 // "mat:porcentagem-valor"
  subjectId: string;          // id em SUBJECTS
  topicId: string;            // id de tópico em SUBJECTS[].topics
  area: EnemArea;
  name: string;               // "Calcular X% de um valor" — curto, para UI
  description?: string;       // 1 frase, para o tutor e para o pipeline
  prerequisites: string[];    // ids de SkillDef; DAG validado
  enemSkills?: string[];      // "MT:H16" — Matriz de Referência do Inep
  core: boolean;              // fundamento: nunca pulado sem confirmação (§11.4)
  incidence: 1 | 2 | 3;       // relevância para a prova (3 = alta)
  level: "base" | "intermediario" | "avancado";
  status: "ativo" | "planejado"; // "planejado" = sem conteúdo; o motor ignora
  tags?: string[];
}
```

Mapa matéria → área (fixo em `src/content/taxonomy/areas.ts`): `mat`→MT; `por`, `lit`, `ing`→LC; `red`→RED; `fis`, `qui`, `bio`→CN; `his`, `geo`, `fil`, `soc`→CH.

### 8.3 Arquivos de taxonomia

```text
src/content/taxonomy/          (NOVA PASTA PROPOSTA)
  types.ts                     SkillDef, EnemArea
  areas.ts                     SUBJECT_AREA, nomes das áreas
  skills/<subjectId>.ts        SKILLS_<MATERIA>: SkillDef[]  (um arquivo por matéria)
  index.ts                     SKILLS, SKILL_MAP, skillsOfSubject(), topologicalOrder()
  validate.ts                  validateTaxonomy(): ciclo, pré-requisito inexistente, topicId inválido, duplicata
```

Taxonomia é pequena (centenas de entradas, poucos KB) e fica **no bundle**. Itens e aulas geradas vão para pacotes (§21.3).

### 8.4 Metadados de item (`ItemMeta`)

Os 1.204 exercícios legados, as 59 questões e os exercícios das microlições **não são editados em massa**. O metadado vive num arquivo lateral indexado pelo id estável.

```ts
// NOVO ARQUIVO PROPOSTO: src/content/items/types.ts
export type ItemSourceKind = "autoral" | "ia-validada" | "oficial" | "adaptada-de-oficial";
export type ItemValidationStatus =
  | "gerada"            // saiu do gerador; nunca publicada
  | "verificada-ia"     // passou crítico + solucionador + verificador + validação automática
  | "revisada-humano"   // amostra humana aprovou o lote e este item
  | "oficial-conferida";// item oficial com gabarito conferido contra a fonte

export interface ItemIrt {
  a: number; b: number; c: number;
  source: "estimado" | "inep" | "calibrado-foca";
  year?: number;
}

export interface ItemMeta {
  id: string;                     // mesmo espaço de ids de EXERCISE_IDS
  version: number;
  skillIds: string[];             // [0] = habilidade principal; no máximo 3
  difficulty: 1 | 2 | 3 | 4 | 5;  // editorial
  irt: ItemIrt;
  roles: Array<"pratica" | "revisao" | "desafio" | "diagnostico">;
  estimatedSeconds: number;
  dontKnowAllowed: boolean;       // padrão true
  explanationLayers?: { detalhada?: string; passos?: string[] };
  commonMistakes?: Array<{ optionIndex?: number; text: string }>;
  source: {
    kind: ItemSourceKind;
    exam?: string; year?: number; ref?: string; // ex. "ENEM 2019 · caderno azul · q. 142"
    license?: string;
    generatedBy?: string;         // ex. "pipeline@v1:haiku-4.5"
  };
  validation: { status: ItemValidationStatus; reviewedAt?: string; reviewer?: string };
  examProfiles: string[];         // ["enem"], ["enem","pas-unb"]
}
```

Regras:

- Dificuldade editorial → parâmetros estimados (fonte `"estimado"`): `b` = {1: −1,6; 2: −0,8; 3: 0; 4: 0,8; 5: 1,6}; `a` = 1,0; `c` por formato: múltipla escolha/lacuna/interpretação = 1/nº de opções; verdadeiro-falso = 0,5; encontre-o-erro = min(0,1; 1/nº de palavras); ordenar/parear = 0,05.
- Mapeamento das fontes existentes: banco geral Fácil/Médio/Difícil → 2/3/4; passo de microlição `difficulty` 1/2/3 → 1/2/3 (`role: "desafio"` → +1); trilha legada → classificada no pipeline (padrão 2 até classificar).
- Só itens `revisada-humano` ou `oficial-conferida` entram em nivelamento e checkpoint. Itens `verificada-ia` entram em prática, revisão e desafio.
- Item sem `ItemMeta` (conteúdo antigo ainda não classificado) usa o padrão: habilidade da lição, dificuldade 2, papéis prática/revisão.

---

## 9. Sistema de Mastery

### 9.1 Definição

**Mastery(h)** ∈ [0, 100] é a probabilidade estimada, em %, de o aluno acertar sem chute uma questão **de dificuldade média** (b = 0) da habilidade h, sem ajuda. É derivada de uma habilidade latente θ (escala logit) com incerteza σ.

```text
Mastery = round(100 · logistic(θ − 0))        logistic(x) = 1/(1+e^−x)
```

Interpretação para a UI e para o tutor: "72%" quer dizer "numa questão média disso, a chance estimada de acerto é 72%". Não é nota, não é percentual de acerto.

### 9.2 Probabilidade de acerto de um item (3PL com escorregão)

```text
p₂(θ, item) = logistic(a · (θ − b))                  // sem chute
p(θ, item)  = c + (1 − c − s) · p₂                   // com chute c e escorregão s = 0,10
```

### 9.3 Estado por habilidade

```ts
// NOVO em src/lib/learning/types.ts (aditivo)
export interface SkillModelEntry {
  skillId: string;
  theta: number;              // logit, limitado a [−4, 4]
  sigma: number;              // incerteza (desvio-padrão), [SIGMA_MIN, SIGMA0]
  nEff: number;               // soma dos pesos de evidência
  difficultiesSeen: number[]; // conjunto de dificuldades 1–5 já respondidas (independentes)
  recent: Array<0 | 1 | 2>;   // últimos 8: 1 certo, 0 errado, 2 "não sei"
  independentShare: number;   // média móvel exponencial (α = 0,2) de "sem ajuda"
  lastEvidenceDate: string | null; // YYYY-MM-DD local
  lapses: number;             // erro em revisão/checkpoint depois de Mastery ≥ 70
  dontKnowRecent: number;     // decai 1 por dia sem "não sei"
  helpHeavyRecent: number;    // aberturas de camada 3 nos últimos 7 dias (contador com data)
  source: "evidencia" | "prior-nivelamento" | "prior-materia";
  algoVersion: number;
  updatedAt: string;          // ISO
}
```

`skillEvidence` (existente) continua guardando itens e datas distintos; o modelo lê de lá em vez de duplicar. Para limitar o tamanho, `distinctExerciseIds` passa a guardar os últimos 50 e `distinctLocalDates` os últimos 20 (aditivo e seguro: os critérios de "consistente" usam no máximo 5 e 2).

### 9.4 Atualização (algoritmo v1)

```text
CONSTANTES (src/lib/adaptive/constants.ts)
  THETA_PRIOR = −0,7   SIGMA0 = 1,2   SIGMA_MIN = 0,25   SLIP = 0,10
  DRIFT_Q = 0,003 por dia    MAX_STEP = 0,6    K_MIN = 0,25   K_SPAN = 0,95
  PESOS: pratica 1,0 · revisao 1,0 · desafio 1,0 · diagnostico 1,2 · checkpoint-de-aula 0,5
         assistida (dica/tutor ANTES de responder) × 0,3 · "não sei" 0,8

updateSkill(entry | vazio, attempt, item, today):
  e = entry ?? { theta: prior(), sigma: SIGMA0, nEff: 0, … }
  // 1. incerteza cresce com o tempo sem evidência (esquecimento possível, não afirmado)
  d = diasEntre(e.lastEvidenceDate, today)
  e.sigma = min(SIGMA0, sqrt(e.sigma² + DRIFT_Q · d))
  // 2. probabilidade prevista
  if attempt.response == "dont-know":
     obs = 0 ;  p = (1 − SLIP) · logistic(a·(θ−b))   // sem chute: "não sei" não é chute errado
  else:
     obs = attempt.correct ? 1 : 0 ;  p = c + (1 − c − SLIP) · logistic(a·(θ−b))
  w = pesoDoPapel(attempt.role) × (attempt.assisted ? 0,3 : 1) × (dontKnow ? 0,8 : 1)
  // 3. passo tipo Elo com ganho proporcional à incerteza
  K = K_MIN + K_SPAN · (e.sigma / SIGMA0)
  Δ = clamp(K · w · (obs − p), −MAX_STEP, +MAX_STEP)
  e.theta = clamp(e.theta + Δ, −4, 4)
  // 4. incerteza encolhe com a informação do item (Fisher 2PL)
  p2 = logistic(a·(θ_antes − b))
  e.sigma = max(SIGMA_MIN, 1 / sqrt(1/e.sigma² + w · a² · p2 · (1 − p2)))
  // 5. contadores
  e.nEff += w ; atualizar recent, difficultiesSeen (se independente), independentShare,
  lastEvidenceDate = today ; lapses += (role ∈ {revisao, diagnostico} && !obs && mastery_antes ≥ 70) ? 1 : 0
  e.algoVersion = ALGO_VERSION ; e.updatedAt = agora
```

Item com várias habilidades: a principal recebe peso w; cada secundária recebe w × 0,4.

**Prior de uma habilidade sem evidência**, na ordem: estimativa do nivelamento para a habilidade → estimativa da área/matéria do nivelamento (σ = max(0,9; SE + 0,3)) → θ da matéria calculado das tentativas legadas de `/study` com encolhimento (§24.3) → `THETA_PRIOR`.

**Mastery só muda com evidência.** O tempo sem estudo aumenta σ (e derruba Confidence, §10), mas não mexe em θ. Esquecimento aparece quando o aluno erra uma revisão ou checkpoint: aí θ cai, `lapses` sobe e a agenda reinicia. Isso atende "não ficar 95 para sempre se o aluno demonstrar esquecimento" sem rotular esquecimento por inferência (`20` §11).

### 9.5 Números de referência (conferidos à mão com as constantes acima)

| Sequência a partir do prior (θ = −0,7, σ = 1,2) | Mastery depois |
|---|---|
| 1 acerto fácil (dif. 1, múltipla escolha de 5, c = 0,2) | ≈ 42 |
| 2 acertos fáceis | ≈ 48 |
| + 1 acerto médio (dif. 3) | ≈ 60 |
| + 1 acerto difícil (dif. 4) | ≈ 71 |
| Depois disso, 1 erro num item fácil | ≈ 57 (passo limitado por `MAX_STEP` = 0,6) |

Conta do primeiro passo, para o executor conferir a implementação: p₂ = logistic(−0,7 + 1,6) = 0,711; p = 0,2 + 0,7 · 0,711 = 0,698; K = 0,25 + 0,95 · 1 = 1,2; Δ = 1,2 · (1 − 0,698) = 0,363 → θ = −0,337 → Mastery 41,6; σ = 1/√(1/1,44 + 0,711·0,289) = 1,054.

Com dois acertos fáceis a Mastery fica perto de 50, não de 72: itens fáceis dizem pouco sobre o desempenho numa questão média, e é exatamente essa a diferença entre "aparentemente sabe" e "sabe com evidência".

O teste de unidade confere faixas (±5), não casas decimais, para que recalibração futura mude constantes e cenários juntos.

### 9.6 Versionamento e recalibração

- `ALGO_VERSION = 1` em `src/lib/adaptive/constants.ts`. Cada `SkillModelEntry` guarda a versão que o calculou.
- Mudou a fórmula ou constante? Incrementar `ALGO_VERSION`. Na carga, se alguma entrada tiver versão menor, o store **recalcula replayando** `learning.recentAttempts` (até 500, em ordem) sobre o prior atual. O que não estiver nas tentativas recentes (histórico podado) permanece como prior da matéria.
- Recalibração de itens (`irt.source = "calibrado-foca"`) exige dados de muitos alunos, portanto backend. Fica **FUTURA**; o formato já suporta.

> **Nota (28/09/2026, `36` RP-5/T-04.1):** o plano da jornada tem versão própria, `PLANNER_VERSION = 2` (`adaptive/constants.ts`). Mudança de regra de plano incrementa `PLANNER_VERSION` (1 replano por conta, preservando a atividade iniciada) sem tocar `ALGO_VERSION`, que continua 1 e só muda com fórmula/constante do modelo. Antes do `36`, `ensurePlan` e `commitPlan` comparavam `ALGO_VERSION`.

### 9.7 Casos extremos

| Caso | Tratamento |
|---|---|
| Aluno novo | Sem entrada; Mastery exibida como "Ainda medindo" até Confidence ≥ 25 |
| Só "não sei" | θ desce devagar (peso 0,8, sem chute); `dontKnowRecent` alto aciona aula de reforço, não mais prática |
| Acertos seguidos em itens fáceis | Mastery sobe pouco (itens fáceis informam pouco sobre o nível médio) e Confidence fica baixa (pouca diversidade de dificuldade) |
| Chute em massa (acerta ~20%) | θ fica baixo; itens de p alto passam a ser escolhidos; checkpoint detecta |
| Tentativa repetida do mesmo item no mesmo dia | Conta para θ com peso × 0,5 e não conta como item distinto (`20` §9) |
| Item sem metadado | Padrão da §8.4 |
| Versão futura do algoritmo no storage | Não recalcula para trás; usa como está (mesma regra da migração) |

---

## 10. Sistema de Confidence

### 10.1 Definição e diferença

**Confidence(h)** ∈ [0, 100] mede quanta evidência independente, diversa e recente sustenta a Mastery de h. Mastery responde "quanto sabe"; Confidence responde "quanto dá para confiar nisso". São calculadas separadamente e usadas separadamente: o motor exige as duas para avançar; a UI só mostra Mastery quando Confidence ≥ 25.

Confidence é **derivada** (calculada na leitura a partir de `skillModel` + `skillEvidence` + `reviewSchedule`), não gravada, para nunca ficar dessincronizada.

### 10.2 Fórmula v1

```text
quantidade   Q = 1 − e^(−nEff / 4)
diversidade  D = 0,4·min(1, itensDistintos/5) + 0,3·min(1, datasDistintas/3) + 0,3·min(1, dificuldadesVistas/3)
retenção     R = hasReviewCorrectAfter24h OU checkpoint correto ≥ 3 dias depois da 1ª evidência ? 1,0 : 0,75
recência     T = d ≤ 7 ? 1 : e^(−(d − 7)/60)          d = dias desde a última evidência
estabilidade S = 1 − 0,3 · volatilidade               volatilidade = trocas certo↔errado nos últimos 6 resultados ÷ (n − 1)
independência I = 0,6 + 0,4 · independentShare

Confidence = round(100 · Q · (0,4 + 0,6·D) · R · T · S · I)
```

### 10.3 Valores de referência

| Situação | Q | D | R | T | S | I | Confidence |
|---|---|---|---|---|---|---|---|
| 2 acertos fáceis no mesmo dia, sem ajuda | 0,39 | 0,36 | 0,75 | 1 | 1 | 1 | ≈ 18 |
| 5 itens, 2 datas, 2 dificuldades, revisão ok, 4/5 certos | 0,71 | 0,80 | 1 | 1 | 0,85 | 1 | ≈ 53 |
| 12 itens, 4 datas, 3 dificuldades, estável | 0,95 | 1 | 1 | 1 | 0,94 | 1 | ≈ 89 |
| O mesmo aluno, 67 dias sem estudar a habilidade | | | | 0,37 | | | ≈ 33 |
| Mesmo volume, metade com dica/tutor | | | | | | 0,8 | ×0,8 |

### 10.4 Faixas de exibição

| Confidence | Rótulo | Mostra Mastery? |
|---|---|---|
| 0–24 | "Ainda medindo" | Não |
| 25–49 | "Pouca evidência" | Sim, com o rótulo |
| 50–74 | "Evidência razoável" | Sim |
| ≥ 75 | "Boa evidência" | Sim |

O selo "Consistente" continua exigindo `skillEvidenceState === "consistente"` (A10 do `20`). "Dominado" só aparece com Mastery ≥ 80 **e** Confidence ≥ 75 **e** selo consistente.

### 10.5 Como Confidence freia a progressão

- Introduzir uma habilidade exige cada pré-requisito com (aula concluída) ou (Mastery ≥ 60 **e** Confidence ≥ 30).
- Desafio exige Mastery ≥ 75 **e** Confidence ≥ 50.
- Marcar uma aula como opcional (aluno já sabe) exige Mastery ≥ 80 **e** Confidence ≥ 60 vindos de nivelamento/checkpoint; habilidade `core` ainda recebe uma prática curta de confirmação (3 itens).

### 10.6 Casos extremos e testes

Confidence nunca passa de 100, nunca é negativa, é 0 sem entrada. Evidência só de checagem de aula (`role: "checkpoint"`) não sobe Confidence. "Não sei" conta em Q (é evidência honesta) mas não em "dificuldades vistas". Testes em `tests/unit/confidence.test.ts` cobrem cada linha da §10.3 e estes casos.

---

## 11. Motor adaptativo

### 11.1 Fronteira

```text
CURRÍCULO (dados)                           MOTOR (funções puras)
src/content/taxonomy/  ─ o que aprender,    src/lib/adaptive/
src/content/curriculum-tree.ts  pré-req.     ├ model.ts       Mastery/Confidence (§9–10)
src/content/items/ + pacotes ─ itens         ├ candidates.ts  quem é elegível
                                             ├ scoring.ts     quanto vale agora
                                             ├ planner.ts     sequência + proporção + checkpoint
                                             ├ select-items.ts quais itens, em que dificuldade
                                             ├ fallback.ts    plano determinístico sem modelo
                                             └ trace.ts       por que escolheu (debug)
```

Regras de fronteira: o motor não importa React nem o store (recebe `AppState` e catálogo por parâmetro); relógio e semente são injetados; nenhuma chamada de IA ou de rede; mesmo estado + mesma data + mesma semente = mesmo plano.

### 11.2 Estado derivado por habilidade

```text
classify(skill):
  se status == "planejado" ou sem conteúdo            → IGNORAR
  se algum pré-requisito não satisfeito               → BLOQUEADA
  se sem evidência e aula não concluída               → NOVA
  se erros distintos ≥ 2 em 7 dias OU dontKnowRecent ≥ 2 OU helpHeavyRecent ≥ 2 → REFORÇO
  se reviewSchedule.dueDate ≤ hoje                    → DEVIDA (pode acumular com os de baixo)
  se Mastery ≥ 75 e Confidence ≥ 50                    → FIRME
  senão                                               → EM_APRENDIZADO
prerequisitoSatisfeito(p) = aulaDeP concluída OU (Mastery(p) ≥ 60 E Confidence(p) ≥ 30) OU p.status == "planejado"
```

### 11.3 Candidatos

| Estado | Atividade candidata | Itens | p-alvo |
|---|---|---|---|
| NOVA | Aula da habilidade (se existir); senão prática introdutória com itens dif. ≤ 2 | aula: os da aula; prática: 4 | 0,80 |
| EM_APRENDIZADO | Prática | 5 | 0,70 |
| DEVIDA | Revisão | 4, preferindo itens não vistos ou vistos há ≥ 7 dias | 0,80 |
| FIRME | Desafio | 3, dificuldade ≥ 4 | 0,50 |
| REFORÇO | Aula de novo (só passos de ensino + 2 questões) se existir; senão prática fácil com explicação detalhada aberta | 4 | 0,85 |
| Lição legada | Lição da trilha legada mapeada para a habilidade, se NOVA/EM_APRENDIZADO e desbloqueada na ordem da trilha | os da lição | — |

### 11.4 Pontuação

```text
score = 0,30·necessidade + 0,20·objetivo + 0,15·urgênciaRevisão + 0,15·ordemCurricular + 0,10·equilíbrio + 0,10·variedade

necessidade      = NOVA ? 0,8 : (1 − Mastery/100) · (Confidence < 60 ? 1 : 0,7)
objetivo         = normaliza( pesoMatéria × incidência/3 )
                   pesoMatéria: prioritária/difícil 1,5 · normal 1,0 · "vou bem" 0,8 · fora do foco → descartada
urgênciaRevisão  = DEVIDA ? min(1; 0,5 + 0,1·diasDeAtraso) : 0
ordemCurricular  = 1 − posição da habilidade na ordem topológica da matéria ÷ total (só NOVA)
equilíbrio       = déficit da área nas últimas 20 atividades vs. fatia-alvo (proporcional ao objetivo)
variedade        = mesma matéria que a anterior ? 0 : mesma que a penúltima ? 0,5 : 1
```

Restrições duras (aplicadas antes da pontuação): nunca a mesma habilidade duas vezes seguidas, exceto aula → prática da mesma habilidade; no máximo 2 atividades seguidas da mesma matéria; toda aula de habilidade X é seguida por uma prática de X em até 2 posições; desafio no máximo 2 a cada 10; habilidade `core` com Mastery alta vinda só de prior **nunca** vira "aula opcional" sem prática de confirmação.

### 11.5 Proporção e sequência

```text
planNext(state, catalog, today, seed, n = 8):
  janela = últimas 10 atividades concluídas (learning.journey.history)
  plano = []
  enquanto |plano| < n:
    if deveInserirCheckpoint(state, janela ⊕ plano): plano.push(checkpoint(...)) ; continue
    cands = candidatos(state) − restrições(janela ⊕ plano)
    déficit = {atual: 0,7, revisão: 0,2, desafio: 0,1} − fatias(janela ⊕ plano)
    para c em cands: c.score += 0,25 · max(0, déficit[bucket(c)])
    revisão atrasada > 3 dias: bucket revisão pode ir até 0,35
    escolhido = argmax(score); empate → skillId lexical → hash(seed, skillId)
    plano.push(escolhido)
  return plano (cada item com reason[] e scoreBreakdown)
```

**Estabilidade visual:** as 3 próximas atividades ficam "comprometidas" em `learning.journey.committed` e só mudam se ficarem inválidas (conteúdo removido, habilidade bloqueada). O resto é "a seguir" e é replanejado a cada atividade concluída. A trilha não se reembaralha na frente do aluno.

> **Nota (28/09/2026, `36` RF-8/RP-3, T-02.7/T-04.3):** "só mudam se ficarem inválidas" virou contrato de implementação: a reposição preenche só as vagas, as comprometidas válidas mantêm a ordem e a atividade iniciada nunca sai do topo por replano. Substituem tudo (menos a iniciada): aplicação do nivelamento, mudança de foco, `PLANNER_VERSION` nova, comprometida inválida. O mix ganhou cota mínima de revisão por janela de 10 (≥ 2; ≥ 3 se atrasada > 3 dias) e teto duro de 3 revisões por janela (35 %) — `37` D-26.

### 11.6 Contratos

```ts
// NOVO ARQUIVO PROPOSTO: src/lib/adaptive/types.ts
export type ActivityKind = "aula" | "pratica" | "revisao" | "desafio" | "checkpoint" | "legado" | "reforco";
export type ReasonCode =
  | "retomar" | "nova-habilidade" | "consolidar" | "revisao-devida" | "revisao-atrasada"
  | "desafio" | "reforco-erros" | "reforco-nao-sei" | "reforco-ajuda" | "equilibrio-area"
  | "prioridade-aluno" | "checkpoint" | "confirmar-fundamento" | "fallback";

export interface PlannedActivity {
  id: string;                    // "atv-<data>-<hash>" estável dentro do plano
  kind: ActivityKind;
  skillIds: string[];
  subjectId: string;
  lessonId?: string;             // aula/legado/reforço
  itemIds?: string[];            // pratica/revisao/desafio/checkpoint — escolhidos na hora de COMEÇAR (§11.7)
  targetP?: number;
  estimatedMinutes: number;
  reasons: ReasonCode[];
  score: number;
  scoreBreakdown: Record<string, number>;
}

export interface JourneyPlan {
  generatedAt: string;
  algoVersion: number;
  activities: PlannedActivity[];
  fallback: boolean;
}
```

### 11.7 Seleção de itens

Na hora de **começar** uma atividade (não no planejamento, para usar o estado mais recente):

```text
selectItems(skill, n, targetP, state, catalog, seed):
  pool = itens com skillIds[0] == skill (depois secundárias), papel compatível, status permitido para o papel
  excluir: vistos hoje; vistos nos últimos 3 dias (revisão); já na sessão
  bAlvo = θ − ln(targetP' / (1 − targetP')) / a      targetP' = (targetP − c)/(1 − c − SLIP)
  ordenar por |b − bAlvo|; pegar os 3n mais próximos; escolher n com hash(seed) ("randomesque")
  ordem de apresentação: dificuldade crescente
  pool insuficiente → completar com habilidade vizinha do mesmo tema; ainda insuficiente → reduzir n (mín. 2) e registrar trace "pool-curto"
```

### 11.8 Fallback determinístico

`planWithFallback` envolve `planNext` em `try/catch`. Em exceção, pacote de conteúdo indisponível ou flag desligada, devolve o plano do `fallback.ts`: a próxima lição de `buildTrail().continueTarget` (motor atual, intocado) seguida das próximas lições na ordem da árvore, com `reason: "fallback"`. Registra um evento local `plan-fallback`. O aluno sempre tem o que estudar.

### 11.9 Desempenho

Planejar é O(habilidades + itens candidatos). Meta: < 20 ms para 500 habilidades e 6.000 itens no índice, medido em teste (mesma técnica do `26`, que mediu `buildTrail` em 0,225 ms). O plano é recalculado só em: carga da home, conclusão de atividade, mudança de foco. Nunca no render.

### 11.10 Como "Praticar" (`/study`) usa o motor

Com `jornadaAdaptativa` ligada, `pickQuestions` passa a pedir `selectItems` para a habilidade de maior pontuação entre EM_APRENDIZADO/DEVIDA do banco geral, mantendo `LESSON_SIZE = 2`. Com a flag desligada, o comportamento atual continua.

---

## 12. Nivelamento (placement)

> **Nota (28/09/2026, `36` RF-10…RF-13, Fase 3):** o nivelamento termina por qualquer caminho (última resposta, teto de área, orçamento, pool insuficiente) aplicando os priors **uma vez** (`placement.appliedAt`, hook `usePlacementReconciliation`, com reparo de contas concluídas sem aplicar). Retomar depois de reload reproduz o mesmo θ̂/SE da execução contínua (reconstituição por `placementItemsById`), e refazer preserva a evidência medida. O resultado (§12.5) segue o contrato de tela do `36` §F.5: faixa por área medida, precisão pela SE da área, nenhuma nota nem porcentagem.

### 12.1 Posição no fluxo

```text
/welcome → /quiz (perfil, agora em 3 blocos curtos) → oferta de nivelamento
   ├ "Fazer o nivelamento" → /nivelamento → resultado → /trilha
   └ "Começar sem nivelamento" → /aha (lacunas declaradas, como hoje) → /trilha
Perfil e card na home: "Fazer nivelamento" disponível depois, a qualquer momento (até concluir um)
```

### 12.2 Perguntas antes do teste (UX progressiva)

Mantém os 6 passos atuais e acrescenta 3 telas curtas, agrupadas em blocos no indicador de progresso ("Você", "Sua prova", "Seu ritmo"):

| Bloco | Tela | Campo | Obrigatório |
|---|---|---|---|
| Você | nome, nível (existentes) | `prefs.name`, `prefs.level` | sim |
| Sua prova | **nova**: qual prova + data | `prefs.examTargets[0]` (ENEM, PAS/UnB com etapa, "outro vestibular" → só ENEM como perfil de conteúdo) + `examDate` opcional com "ainda não sei" | prova sim, data não |
| Sua prova | UF, faculdade, curso (existentes) | — | como hoje |
| Seu ritmo | matérias difíceis (existente) + seção recolhida "Alguma você já manda bem?" na mesma tela | `difficultSubjects`, **novo** `easySubjects` | difíceis sim, fáceis não |
| Seu ritmo | **nova**: tempo por dia (5 / 10 / 15 / 20 / 30 min) | **novo** `prefs.dailyMinutes` | sim (padrão 10) |
| Seu ritmo | **nova**: foco (Todas as matérias / Escolher matérias) | **novo** `prefs.studyFocus` | sim (padrão todas) |

### 12.3 Algoritmo (CAT com EAP)

```text
escopo = áreas incluídas pelo foco (todas → LC, MT, CN, CH; RED fora)
orçamento: até 24 itens e ~10 min no total; por área 4–6 itens (prioritárias até 6)
pool elegível: itens com papel "diagnostico" e status revisada-humano/oficial-conferida

para cada área (ordem: prioritárias primeiro):
  prior θ ~ Normal(−0,3; 1,0), grade de −4 a 4 passo 0,2 (41 pontos)
  1º item: b mais próximo de 0, habilidade de maior incidência da área
  repetir:
    θ̂, SE = EAP(posterior)      // média e dp da posterior na grade
    próximo = entre os elegíveis não usados, top 3 por informação de Fisher 3PL em θ̂,
              com balanceamento (habilidade ainda não usada na área; alternar matérias da área);
              escolhe 1 dos 3 por hash(seed)
    parar se SE ≤ 0,45 OU itens da área == máximo OU orçamento esgotado
saída:
  por área: θ̂, SE
  por habilidade medida diretamente: aplica updateSkill (papel diagnostico, peso 1,2) partindo do prior da área
  habilidades não medidas da área: prior θ = θ̂_área (ou da matéria, se ≥ 2 itens nela), σ = max(0,9; SE + 0,3),
                                   source = "prior-nivelamento", nEff = 0 → Confidence 0 ("Ainda medindo")
```

Sem feedback por item, sem dica, sem tutor. "Não sei" permitido. Pode sair a qualquer momento: o que foi respondido conta; o estado parcial fica em `learning.placement` e pode ser retomado.

### 12.4 TRI real vs. modelo interno

| | TRI calibrada | Modelo interno do Foca |
|---|---|---|
| Parâmetros | Estimados pelo Inep a partir de milhões de respostas | Estimados a partir da dificuldade editorial (§8.4) |
| Onde existem | Microdados do ENEM: arquivo `ITENS_PROVA_<ano>.csv` com `CO_HABILIDADE`, `TX_GABARITO`, `NU_PARAM_A/B/C` ([Inep — microdados](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem)) | `ItemMeta.irt` com `source: "estimado"` |
| Uso no Foca | Itens oficiais importados (Fase 10) usam os parâmetros do Inep; o resultado é marcado como "estimativa baseada em parâmetros oficiais" | Todo o resto |
| O que **não** fazemos | Converter θ para a escala de nota do ENEM (média 500) ou exibir nota | — |

Se a decisão jurídica (§18.4) não liberar texto de questão oficial, os parâmetros do Inep ainda servem para calibrar a **distribuição** de dificuldade por habilidade da Matriz (qual b é típico de H16 de Matemática), ajustando os `b` estimados dos itens autorais. Isso usa dado aberto sem reproduzir prova.

### 12.5 Resultado para o aluno

Tela de resultado: uma linha por área medida com faixa em palavras ("Base em construção", "No caminho", "Base firme") e até 3 habilidades medidas com Mastery e rótulo de Confidence. Nada de "Nível 7", nada de nota. Texto de abertura (passou pelo Humanizer, voz do `20` §7.1): "Pronto. Isso é um ponto de partida, e ele fica mais preciso conforme você estuda."

---

## 13. Checkpoints da trilha

### 13.1 Quando

```text
deveInserirCheckpoint(state, janela):
  n = atividades concluídas desde o último checkpoint (ou desde o nivelamento/início)
  limite = (Confidence média das habilidades praticadas desde o último < 40 OU ≥ 4 habilidades novas) ? 15 : 20
  inserir se n ≥ limite E habilidades distintas praticadas desde o último ≥ 3
          E nenhum checkpoint concluído hoje E atividades totais ≥ 6
  forçar se n ≥ 25 (ainda respeitando 1 por dia)
```

### 13.2 Composição (6–8 itens)

~60% habilidades praticadas desde o último checkpoint, ~30% habilidades antigas DEVIDAS ou com `lapses > 0`, ~10% um item de esticada (p≈0,5) numa habilidade FIRME. Dificuldade escolhida para p≈0,65 em cada habilidade. Só itens `revisada-humano`/`oficial-conferida` e não vistos nos últimos 14 dias; se o pool for curto, aceita `verificada-ia` não vistos e registra no trace.

### 13.3 Durante

Sem dica, sem tutor, sem feedback certo/errado por item (só "Resposta registrada" e avançar), "Não sei" permitido, sem som de acerto/erro (som só no fim). Pode sair: respostas dadas contam; o checkpoint volta a ser oferecido depois.

### 13.4 Recalibração

Cada resposta atualiza o modelo com papel `diagnostico` (peso 1,2). Além disso:

- **Superestimação**: previu p ≥ 0,8 e errou → antecipa `reviewSchedule` da habilidade para amanhã e marca `lapses`.
- **Subestimação**: previu p ≤ 0,4 e acertou → a habilidade fica elegível a desafio no próximo plano.
- **Inconsistência**: 2+ habilidades do mesmo tema com resultado oposto ao previsto → trace `inconsistencia` (só debug).

### 13.5 Resultado

Tela curta: por habilidade, "Subiu", "Firme" ou "Vale revisar" (sem percentuais quando Confidence < 25), e uma frase do que muda ("Amanhã a gente revisa Funções"). XP fixo de 20 por checkpoint concluído, independente de acerto (ledger `checkpoint:<id>`). Conta como 1 bloco do dia.

### 13.6 Nome

Na UI: **"Checkpoint"**. A checagem dentro da aula, que hoje também se chama "Checkpoint" (`COPY.licao.roles.checkpoint`), passa a se chamar **"Checagem rápida"** (atualizar `copy.ts` e o inventário do `21`). No código, o papel da questão dentro da aula continua `"checkpoint"` (não renomear dado persistido); o checkpoint da trilha é `ActivityKind "checkpoint"` com papel `"diagnostico"`. Ver §31.

---

## 14. Trilha principal (jornada única)

### 14.1 O que o aluno vê em `/trilha`

Hierarquia (de cima para baixo), preservando o `27`:

1. `TrailHeader` (existente): saudação por `voz.ts`, streak, meta.
2. **Card "Sessão de hoje"** (substitui o `RecommendationHint` quando a flag está ligada): título da próxima atividade, matéria, motivo em uma frase, "~12 min" (soma das atividades até `dailyMinutes`), CTA único "Continuar" (ou "Começar").
3. **Linha de foco**: "Todas as matérias" ou "Foco: Matemática, Física" com botão "Mudar" (abre a folha de foco, §15).
4. **Caminho** (componentes do `27`): últimas ~6 atividades concluídas (histórico, compactas), o nó atual destacado, as 3 comprometidas, e as "a seguir" em traço mais leve. Cada nó mostra rótulo de matéria em texto (não cor: a paleta só tem um accent) e ícone do tipo (aula, prática, revisão, desafio, checkpoint). Checkpoint vira um marco (reaproveita o carimbo `ChapterMilestone`).
5. No fim do caminho visível: "Ver mapa das matérias" → mapa por matéria (a trilha atual do `25`/`27`, intacta, como vista secundária).

Com a flag desligada, `/trilha` é exatamente a de hoje.

### 14.2 Exemplos de motivo (copy candidata; passou pelo Humanizer, amostra = copy aprovada do `21`)

| `ReasonCode` | Texto |
|---|---|
| `revisao-devida` | "Porcentagem foi bem semana passada. Hoje é um bom dia pra conferir se ficou." |
| `consolidar` | "Você foi bem em funções. Antes de avançar, mais três questões pra firmar." |
| `nova-habilidade` | "Assunto novo: razão e proporção. Começa com uma aula curta." |
| `reforco-erros` | "Essa travou duas vezes. Vamos por partes, com calma." |
| `reforco-nao-sei` | "Você marcou 'não sei' aqui. Uma aula rápida resolve isso." |
| `desafio` | "Crase está firme. Topa uma mais difícil?" |
| `equilibrio-area` | "Faz uns dias sem Humanas. Uma de História pra variar." |
| `retomar` | "Vamos de onde você parou?" (texto já aprovado) |
| `fallback` | "Próxima lição da sua trilha." |

Regras: número no texto só se vier do estado (nunca inventado); nada de "você domina"; humor no máximo uma vez por sessão (`20` §7.1).

### 14.3 Estado persistido da jornada

```ts
// NOVO em src/lib/learning/types.ts (aditivo)
export interface JourneyState {
  committed: PlannedActivity[];       // até 3
  upcoming: PlannedActivity[];        // até 5, provisórias
  history: Array<{ activityId: string; kind: ActivityKind; skillIds: string[]; subjectId: string;
                   completedAt: string; scorePct: number | null }>; // limitado a 200
  activeActivity: PlannedActivity | null;  // com itemIds já escolhidos
  sinceCheckpoint: number;
  lastCheckpointDate: string | null;
  planVersion: number;
}
```

### 14.4 Execução das atividades

| Kind | Rota | Player |
|---|---|---|
| aula / reforço | `/learn/$lessonId` (existente) | `MicroLessonPlayer` |
| legado | `/redacao/$licaoId` (existente) | `LessonPlayer` |
| prática / revisão / desafio / checkpoint | **NOVA** `/atividade/$activityId` | `MicroLessonPlayer` com uma `MicroLessonV2` sintética montada por `buildActivityLesson(activity)` e `mode: "atividade"` ou `"checkpoint"` |

`useLearningSession` ganha um parâmetro de estratégia de conclusão (`onComplete`) para não gravar sessão sintética em `completedLessons`: atividade conclui via `completeJourneyActivity(activityId, correct, total)`, que paga XP pelo ledger `atividade:<id>` (10/20/30 por faixa; revisão 5 fixo, `20` §12; checkpoint 20 fixo), registra bloco do dia e move a atividade para `history`.

### 14.5 "Infinita"

A jornada nunca termina enquanto houver habilidade ativa com conteúdo: quando tudo o que é elegível estiver FIRME, o motor alterna revisão espaçada e desafio. Se não houver nada elegível (conteúdo esgotado), o card diz isso com honestidade e oferece o mapa das matérias ("Você passou por tudo que está disponível agora. Revisões voltam conforme as datas.").

---

## 15. Modo foco

| | Preferência permanente | Sessão de foco temporária |
|---|---|---|
| Onde se define | Onboarding (§12.2), Perfil, folha de foco da home ("Daqui pra frente") | Folha de foco da home ("Só hoje") |
| Campo | `prefs.studyFocus = { mode: "todas" \| "materias" \| "areas"; subjectIds; areas }` | `learning.focusSession = { subjectIds; startedAt; expiresOn (fim do dia local) }` |
| Efeito no motor | Filtra candidatos às matérias do foco; ajusta pesos de objetivo | Sobrepõe a permanente até expirar |
| Revisões fora do foco | Não aparecem (o aluno escolheu estudar só aquilo); ficam acumuladas | Adiadas até 3 dias; depois disso, **uma** revisão fora do foco pode entrar com motivo explícito ("Uma revisão rápida de Biologia que está vencida") |
| Progresso geral | Nada é apagado; Mastery/Confidence de matérias fora do foco só envelhecem (Confidence cai) | Idem |

Folha de foco (componente `BottomSheet` existente): lista de matérias como chips agrupados por área, atalhos por área ("Ciências da Natureza", "Humanas", "Linguagens", "Matemática"), escolha "Só hoje" / "Daqui pra frente", botão "Voltar a todas". `prefs.trailSubjectId` (chips do mapa por matéria) continua existindo só para o mapa; não afeta a jornada.

---

## 16. Experiência da questão

### 16.1 Botão "Não sei"

- **Onde**: `QuestionStepView` (aulas e atividades), `/study`, `LessonPlayer` legado, nivelamento e checkpoint. Aparece quando `ItemMeta.dontKnowAllowed !== false`. Visual: botão de texto secundário abaixo das alternativas, alvo ≥ 44 px, nunca competindo com "Verificar".
- **Evento**: grava `Attempt` com `response: "dont-know"`, `correct: false`, `answer: null`.
- **Feedback**: variante neutra da `FeedbackSheet` (fundo `cards`, sem vermelho, sem som de erro, sem vibração de erro): "Tudo bem. Veja como resolve:" + alternativa correta destacada + explicação curta. No checkpoint/nivelamento, só "Resposta registrada".
- **Modelo**: §9.4 (sem chute, peso 0,8). `dontKnowRecent` alto leva o motor a oferecer aula de reforço.
- **XP**: igual a erro (5 no banco geral; faixa de estrelas conta como não acerto). Não pagar menos do que um chute errado, para não incentivar chute.
- **Compatibilidade**: `answer: null` já é serializável; `useLearningSession` ganha `dontKnow()` ao lado de `submit()`. Tentativas antigas sem `response` são lidas como `"answered"`.

### 16.2 Explicação em camadas

| Camada | Rótulo | Conteúdo | Quando aparece |
|---|---|---|---|
| 1 | "Por que essa resposta?" | `explicacao` do item (existente, 25–55 palavras) | Aberta de cara no erro e no "não sei" (mantém o `20`: explicação curta precede prática); recolhida no acerto |
| 2 | "Ainda não entendi" | `ItemMeta.explanationLayers.detalhada` ou `passos`; no banco geral, o `stepByStep` já existente | Botão depois da camada 1, só se houver conteúdo de camada 2 |
| 3 | "Me ensina do começo" | Abre a Foca IA com contexto pedagógico e já envia o pedido | Botão depois da camada 2 (ou depois da 1 quando não houver 2) |

"Explicar melhor" (hoje só no erro) é substituído pela escada. "Perguntar à Foca" antes de responder continua existindo em `/study`. A camada alcançada é gravada na tentativa (`helpLevel`), e abrir a camada 3 conta para `helpHeavyRecent`.

### 16.3 Esclarecimento da regra do tutor

O `20` §4.2 diz que o tutor só chama a API quando o aluno digita ou toca numa sugestão. Tocar em "Me ensina do começo" é um pedido explícito com o mesmo efeito de tocar numa sugestão; por isso o balão abre e **envia** a mensagem "Me ensina do começo". Errar continua sem abrir nada.

### 16.4 Sem IA

Se a chamada falhar ou não houver chave, a camada 3 mostra o fallback local expandido: a camada 2 (se houver), o nome do pré-requisito mais fraco e um link para a aula dele.

---

## 17. Contexto pedagógico da Foca IA

### 17.1 Contrato

```ts
// NOVO em src/lib/tutor-prompt.ts (aditivo em TutorContext)
export type PedagogicalContext = {
  skillName: string;
  subjectName: string;
  topicName: string;
  mastery: number | null;          // null quando Confidence < 25
  confidenceLabel: "ainda medindo" | "pouca evidência" | "evidência razoável" | "boa evidência";
  recentErrors: Array<{ statement: string; chosen: string | null; correct: string }>; // ≤ 2, enunciado ≤ 240 caracteres
  dontKnowRecent: number;
  explanationSeen: "nenhuma" | "curta" | "detalhada";
  weakPrerequisites: string[];     // nomes, ≤ 3
  examName: string | null;
  mode: "ensinar-do-zero" | "duvida";
};
// TutorContext ganha: pedagogy?: PedagogicalContext
```

Montado por **NOVO ARQUIVO PROPOSTO** `src/lib/tutor-context.ts` (`buildPedagogicalContext(state, focus, catalog)`, função pura, sem React).

### 17.2 Prompt

`buildSystemPrompt` ganha a seção "SITUAÇÃO PEDAGÓGICA" (só quando `pedagogy` existe) e, no modo `ensinar-do-zero`: começar pelo pré-requisito mais fraco com uma pergunta curta de checagem; não repetir a explicação que o aluno já viu (usar outro caminho: exemplo concreto, analogia, passo a passo); no máximo 6 frases por resposta nesse modo; nunca entregar o gabarito de questão ainda não respondida. As regras existentes (anti-LaTeX, números só do contexto, sem cobrança) continuam.

### 17.3 Tamanho e segurança

- Limites: 2 erros recentes, 3 pré-requisitos, strings cortadas em 240 caracteres, `pedagogy` serializado ≤ 2.000 caracteres. `validateTutorRequest` (servidor) valida e rejeita acima disso (nível L2 de segurança, `ai/SDD-WORKFLOW.md` §6).
- Conteúdo do aluno e enunciado são dados, não instruções (`20` §14.2).
- `performanceFacts` passa a usar agregados por matéria do modelo (quando `masteryModel === "on"`), com números calculados pelo app.

---

## 18. Expansão de conteúdo

### 18.1 Metas por onda

| Onda | Habilidades ativas | Por habilidade | Total aproximado | Quando |
|---|---|---|---|---|
| 0 — piloto do pipeline | 2 (porcentagem) | +12 itens | 24 itens | Fase 11, antes de escalar |
| 1 — fundamentos ENEM | ~60 (≈15 por área, maior incidência; inclui as 8 existentes) | 1 aula v2 + ≥12 itens (4 fáceis, 4 médios, 4 difíceis) + 4 de revisão | ~60 aulas, ~960 itens | Fase 11 |
| 2 — cobertura | ~150 | idem | ~150 aulas, ~2.400 itens | FUTURA, mesmo pipeline |
| 3 — profundidade | ~350 | idem + desafios | ~5.000+ itens | FUTURA |

Incidência para priorizar a Onda 1: contagem de itens por habilidade da Matriz nos microdados do Inep (`CO_HABILIDADE` por ano), cruzada com `enemSkills` da taxonomia.

### 18.2 Reaproveitamento antes de gerar

1. As 134 lições legadas ganham `skillIds` e dificuldade por item (classificação no pipeline, estágio "classificar") e passam a abastecer as habilidades de Português/Redação.
2. As 59 questões ganham `ItemMeta` (habilidade + dificuldade a partir do rótulo) e entram no pool.
3. Os ~42 exercícios das microlições ganham `ItemMeta` por item (corrige P3).
4. Só depois disso o relatório de cobertura (`scripts/content/coverage.ts`) diz o que falta gerar.

### 18.3 Formato das aulas geradas

Mesmas regras v2 do `25` §6.5 (validadas por `validateLessonSteps`): 1 intro, ≥ 2 passos de ensino, ≤ 4 ensino, ≤ 220 palavras de ensino, 4–8 questões com dificuldade 1→2→3 sem cair, 1º passo-questão é checagem rápida, recap. Mais: 1 exemplo resolvido, ligação explícita com a prova ("No ENEM isso aparece como…") só quando verificada, analogia opcional.

### 18.4 Questões oficiais — decisão sobre fonte e direitos

| Material | Situação | Decisão deste plano |
|---|---|---|
| Microdados do ENEM (parâmetros TRI, habilidade, gabarito por item) | Dados abertos do Inep | **Usar**, com atribuição, para calibração e incidência (Fase 10) |
| Texto das questões do ENEM | A Lei 9.610/98, art. 8º, IV, exclui "atos oficiais" de proteção, e há projetos que se apoiam nisso; algumas questões trazem texto/imagem de apoio de terceiros | **APROVADO pelo usuário em 23/09/2026** (decisão de negócio, sem parecer jurídico formal — risco aceito pelo dono do produto): reproduzir texto de questões do ENEM de anos anteriores, fáceis e difíceis, **sempre com atribuição do ano e do vestibular** (ex.: "ENEM 2019", exibida junto ao enunciado, mesmo padrão de `ExerciseImage.credito`). Continua valendo: sem imagem/charge/gráfico de terceiros (ver linha "Imagens" abaixo) — o texto de apoio de terceiros dentro do enunciado (ex. trecho de reportagem) é transcrito como citação, com a fonte original citada quando o Inep a informa |
| Provas de outros vestibulares (Fuvest, Unicamp, Cebraspe/PAS) | Produzidas por fundações/bancas, sem o argumento de ato oficial — decisão do usuário cobriu só o ENEM | **Não reproduzir.** Itens autorais "no estilo" com `examProfiles` e sem alegar origem |
| APIs comunitárias de questões (ex.: enem.dev) | Licença e disponibilidade incertas | Não depender |
| Imagens | Toda imagem de item (gerado ou oficial) é autoral (SVG controlado ou diagrama do catálogo existente) | Sem imagem de terceiros mesmo em item oficial — item oficial cuja resolução dependa de imagem de terceiro fica de fora da importação, registrado como "requer imagem — não importado" |

**Decisão registrada** (não é mais futura): reproduzir texto de questões do ENEM, com atribuição de ano e vestibular. Ver `docs/decisoes/0002-questoes-oficiais-enem.md` (Fase 10) para o registro formal e `docs/32` §"Decisões do usuário".

---

## 19. Pipeline de conteúdo com IA

### 19.1 Onde roda

Offline, em tempo de desenvolvimento, **fora do app**. Nada de `scripts/content/` é importado por `src/`. Chaves de API ficam no `.env` de quem roda o pipeline (`CONTENT_LLM_*`), nunca no bundle nem no Vercel. A IA do produto (tutor, OpenAI via `fetch`) não muda.

### 19.2 Estágios

```text
0 PLANEJAR     coverage.ts lê taxonomia + catálogo → lote: [{skillId, dificuldade, papel, quantidade}]
1 GERAR        (barato)  item/aula em JSON, schema estrito, SEM alterar o formato Exercise
2 CRITICAR     (barato)  checklist: ambiguidade, distratores plausíveis, alinhamento à habilidade, nível, clareza,
                         viés, dado inventado → aprova | corrige | rejeita
3 RESOLVER     (barato, modelo de FAMÍLIA DIFERENTE do gerador, quando possível) recebe enunciado + alternativas
               SEM gabarito, resolve com raciocínio, devolve índice + confiança
4 VERIFICAR    (determinístico) compara gabarito gerado × resposta independente
               iguais e confiança ≥ 0,8 → segue ; diferentes ou confiança baixa → 4b
4b ESCALAR     (Sonnet) resolve de novo e julga; ainda conflito → (modelo forte) decide ou rejeita; registra
5 HUMANIZAR    (barato, skill Humanizer) só em explicacao/explanationLayers/ensino; guarda de invariantes (§19.4)
6 VALIDAR      (determinístico) zod + validateMicroLessons/validateLessonSteps + regras de item (§19.5)
7 AMOSTRAR     humano revisa 10% do lote (mín. 10 itens) + 100% dos que passaram por 4b; reprovação > 5% → lote volta ao 2
8 PUBLICAR     grava em src/content/banco/<materia>/<habilidade>.json com validation.status e source.generatedBy
```

### 19.3 Contratos de arquivo (qualquer executor serve)

```text
content-pipeline/                     (NOVA PASTA PROPOSTA, versionada; lotes brutos em .gitignore)
  prompts/gerar-item.md  gerar-aula.md  criticar.md  resolver.md  escalar.md  classificar.md  humanizar.md
  schemas/                            JSON Schema gerado do zod (fonte única: src/content/items/schema.ts)
  lotes/<loteId>/                     (gitignored) 01-plano.json 02-gerado.jsonl 03-critica.jsonl
                                      04-solucao.jsonl 05-verificacao.jsonl 06-humanizado.jsonl 07-validacao.json
                                      08-amostra.md 09-publicado.json
  relatorios/<loteId>.md              (versionado) métricas do lote
scripts/content/                      (NOVA PASTA PROPOSTA)
  coverage.ts  plan-batch.ts  run-stage.ts  verify.ts  humanize-guard.ts  validate.ts  publish.ts  build-packs.ts
```

Dois modos de execução com os mesmos arquivos:

- **Modo A — agentes do Claude Code**: um orquestrador lança subagentes por estágio (`model: haiku` para 1/2/3/5, `sonnet` para 4b), cada um lê o JSONL do estágio anterior e escreve o seguinte. Não precisa de chave no repo.
- **Modo B — script**: `run-stage.ts` chama um endpoint compatível com a API da OpenAI configurado por `CONTENT_LLM_BASE_URL`/`CONTENT_LLM_API_KEY`/`CONTENT_LLM_MODEL_<ESTAGIO>`. Pode ser o gateway OmniRoute (roteamento e fallback entre provedores, cache), a Anthropic ou a OpenAI direto. O OmniRoute entra **só aqui**, como ferramenta de desenvolvimento; não é integração do app (`ai/SKILLS.md` §P continua valendo).

### 19.4 Humanizer com guarda de invariantes

O Humanizer muda a forma, nunca o conteúdo. `humanize-guard.ts` compara antes/depois e **descarta a versão humanizada** se mudar qualquer um destes: números e unidades (regex de dígitos, frações, %, símbolos), fórmulas (sequências com operadores `= + − × ÷ / ^ √`), nomes próprios e datas, alternativas, índice do gabarito, termos técnicos da lista da habilidade, negações ("não", "nunca", "exceto"). Nunca roda em enunciado nem em alternativa. Em spec (`docs/`) não se usa Humanizer (`ai/SKILL-ROUTING.md` §2).

### 19.5 Validação automática de item

Zod do `ItemMeta` + do `Exercise`; gabarito dentro do intervalo; alternativas distintas (normalizadas); enunciado 15–120 palavras (interpretação até 250); explicação 25–80 palavras; nenhuma alternativa "todas/nenhuma das anteriores"; sem LaTeX; sem "segundo o texto" sem texto; habilidade existe e está `ativo`; nenhum `imagem.url` externo (só diagrama do catálogo controlado ou SVG autoral em `public/content/`); dificuldade coerente com a solução (passos do solucionador ≤ 2 → dif. ≤ 2, heurística só de alerta); duplicata semântica simples (normalização + Jaccard de 5-gramas > 0,6 com item existente da mesma habilidade → rejeita).

### 19.6 Métricas por lote (relatório)

Taxa de rejeição por estágio, taxa de conflito no 4, taxa de reprovação na amostra humana, tokens por estágio, custo estimado. Um lote com conflito > 15% ou reprovação humana > 5% bloqueia a onda até revisar o prompt.

---

## 20. Áudio e háptico

### 20.1 Diagnóstico (hipóteses, por ordem de probabilidade)

| # | Hipótese | Por que é provável | Como confirmar |
|---|---|---|---|
| H1 | Prazo de 300 ms estoura no primeiro som (ou sempre, em rede lenta/iOS): o prazo inclui `resume()`, download e decodificação | Em dev o download é instantâneo; em produção os 12 WAVs (608 KB) saem juntos no primeiro toque; no iOS o `resume()` da sessão de áudio pode levar centenas de ms | Diagnóstico com motivo de descarte (`expired-loading`, `expired-resume`) em aparelho real |
| H2 | Desbloqueio em `pointerdown`: em toque, não é ativação de usuário para Chrome/Safari, então o contexto nasce suspenso; só o clique de "Verificar" consegue retomar | Regra de ativação dos navegadores (ativação vem de `pointerup`/`touchend`/`click`/`keydown`) | Estado do `AudioContext` logo depois do primeiro toque |
| H3 | iPhone no modo silencioso: Web Audio segue a chave de silencioso | Comportamento do iOS | Testar com a chave ligada/desligada |
| H4 | Estado `interrupted` no iOS (ligação, outra aba) nunca é tratado | `play` exige `state === "running"` | Diagnóstico |
| H5 | Versão testada não era a atual (404 do Vercel antes de 23/09, ou o Netlify antigo que serve o Abroad) | `29` §7 | Confirmar a URL e o commit testados |
| ~~H6~~ | ~~Caminho/asset ausente no build~~ | **Descartada**: build Vercel inclui `/sfx/v2/*.wav` (§2.8) | — |

### 20.2 Correção (no motor existente, sem reescrita)

1. `getAudioDiagnostics()`: estado do contexto, buffers carregados, último descarte com motivo, tempos de `resume`/fetch/decode. Exposto no painel de debug (§27).
2. Desbloqueio também em `pointerup`, `touchend` e `click` (captura), chamando `resume()` dentro do handler; `pointerdown` continua só pré-aquecendo.
3. Pré-carga priorizada: `resposta-correta` e `resposta-incorreta` primeiro, o resto depois; pré-carga também ao montar rotas de estudo.
4. Política de prazo em duas partes: orçamento de preparação (resume + load) de até 900 ms **só** enquanto o som ainda não tocou nenhuma vez depois do desbloqueio; em regime normal, 300 ms como hoje. Valores finais vêm da medição em aparelho (Fase 1), registrados no `32`.
5. Tratar `interrupted`/`suspended` tentando `resume()` no próximo gesto.
6. iOS e chave de silencioso: **decisão do usuário**. Recomendação: respeitar a chave (padrão atual) e dizer isso no Perfil ("No iPhone, o som segue a chave de silencioso"). A alternativa (`navigator.audioSession.type = "playback"`, onde existir) toca mesmo no silencioso, o que atrapalha quem estuda em sala.
7. `vercel.json`: `Cache-Control: public, max-age=31536000, immutable` para `/sfx/v2/(.*)` (caminho já versionado).
8. `.vercel` no `.gitignore` (P17).

### 20.3 Háptico

`src/lib/haptics.ts` vira uma pequena interface (sem dependência nova):

```ts
export interface HapticsAdapter { id: "web-vibrate" | "none" | "native"; supported(): boolean; play(p: PadraoHaptico): void }
export function hapticsSupport(): "web-vibrate" | "none"
```

- Web: `navigator.vibrate` só com `typeof navigator.vibrate === "function"` e ativação de usuário (`navigator.userActivation?.hasBeenActive !== false`), sempre em `try/catch`.
- iOS Safari: sem suporte. O toggle do Perfil fica desabilitado com "Seu aparelho não vibra pelo navegador".
- Android: o sistema pode desligar vibração (modo silencioso, economia de bateria) sem o navegador avisar; não há detecção possível, e a UI não promete.
- Futuro (PWA/Capacitor/nativo): um `native` adapter registrado no boot, sem mudar chamadores. **FUTURA**, sem dependência agora.

---

## 21. Mudanças de dados ("banco")

Não existe banco de dados. "Banco" aqui é (a) o catálogo de conteúdo versionado e (b) o estado local do aluno.

### 21.1 Estado do aluno — schema v6 (aditivo sobre `foca.state.v3`)

| Caminho | Tipo | Padrão | Observação |
|---|---|---|---|
| `schemaVersion` | number | 6 | `CURRENT_SCHEMA_VERSION` |
| `prefs.studyFocus` | `{ mode; subjectIds; areas }` | `{ mode: "todas", subjectIds: [], areas: [] }` | |
| `prefs.easySubjects` | `string[]` (ids) | `[]` | |
| `prefs.dailyMinutes` | `5 \| 10 \| 15 \| 20 \| 30` | derivado: `dailyLessons ≤ 1 → 5`, `2–3 → 10`, `≥ 4 → 15` | |
| `prefs.onboardingVersion` | number | 1 (existente) / 2 (novo fluxo) | Para oferecer o nivelamento a quem já usa |
| `learning.skillModel` | `Record<skillId, SkillModelEntry>` | `{}` + bootstrap (§24) | |
| `learning.journey` | `JourneyState` | vazio | |
| `learning.placement` | `PlacementState \| null` | `null` | itens usados, respostas, θ por área, status |
| `learning.focusSession` | `FocusSession \| null` | `null` | |
| `learning.events` | `LearningEvent[]` | `[]` | limite 300 |
| `learning.modelMeta` | `{ algoVersion; bootstrappedAt }` | preenchido na migração | |
| `Attempt.response` | `"answered" \| "dont-know"` | ausente = answered | aditivo |
| `Attempt.helpLevel` | `0 \| 1 \| 2 \| 3` | 0 | camada de explicação alcançada depois de responder |
| `Attempt.assisted` | boolean | `hintUsed \|\| tutorUsed` | dica/tutor ANTES de responder |
| `Attempt.itemDifficulty` | 1–5 | do `ItemMeta` | congelado na tentativa |
| `Attempt.predictedP` | number | — | para diagnóstico de calibração |
| `Attempt.source` | `"microlicao" \| "estudo" \| "legado" \| "atividade" \| "nivelamento" \| "checkpoint"` | — | |
| `LearningSessionKind` | + `"atividade" \| "nivelamento" \| "checkpoint-trilha"` | — | |
| `ReviewScheduleEntry.intervalDays` | escada 1/3/7/14/**30/60** | — | união estendida |
| `skillEvidence.distinctExerciseIds` | limite 50 (novo) | — | poda segura |
| `skillEvidence.distinctLocalDates` | limite 20 (novo) | — | poda segura |

Orçamento de armazenamento: 400 habilidades × ~600 B + 500 tentativas × ~350 B + jornada/eventos ≈ 0,5 MB. Teste garante que um estado "pesado" sintético serializa em < 1 MB (limite prático do `localStorage` é ~5 MB).

### 21.2 Regras de gravação

- Tentativa → modelo → agenda → evidência numa única `setState` (mesma transação que `recordLearningAttempt` já faz).
- Confidence nunca é gravada (derivada).
- Plano da jornada gravado só em conclusão/mudança de foco, não no render.

### 21.3 Catálogo de conteúdo em pacotes

```text
Fonte (versionada):  src/content/banco/<materia>/<habilidade>.json   itens + ItemMeta + aulas geradas
Build:               scripts/content/build-packs.ts (roda em predev e prebuild)
Saída (gitignored):  public/content/v1/index.json            ~60 B por item: id, skill, dif, b, papéis, status
                     public/content/v1/<materia>.json        texto completo dos itens e aulas da matéria
Runtime:             src/lib/content/repository.ts  ensureSubjects(ids) → fetch + memória; resolveExercise ganha 4ª fonte
```

- O conteúdo existente em TypeScript (microlições, trilhas, banco geral) **fica onde está** e continua síncrono. Só conteúdo novo do pipeline vai para pacotes.
- Antes de abrir uma atividade, o planner chama `ensureSubjects` para as matérias dela; o player continua síncrono porque o pacote já está em memória.
- Pacote não carregou → o motor planeja só com conteúdo embarcado (fallback) e registra `plan-fallback`.
- Validação pesada (zod, regras de conteúdo) roda no `build-packs.ts` e nos testes; em runtime, só checagem leve de forma.
- `index.json` para 6.000 itens ≈ 360 KB bruto, ~70 KB gzip; baixado uma vez, com cache HTTP por hash de conteúdo no nome (`index.<hash>.json` referenciado por um `manifest.json` pequeno).
- **Aulas em pacote.** A árvore de currículo e a validação dela são síncronas e rodam na carga do módulo; aula gerada mora em pacote (assíncrono). A ponte: `build-packs.ts` gera também **NOVO** `src/content/banco/aulas-geradas.ts` (versionado, regenerado pelo script, com teste de sincronia) listando `{ lessonId, chapterId, subjectId, skillIds }`. `validateCurriculumTree` aceita esses ids como "declarados, carregados sob demanda"; `phaseById` consulta o catálogo embarcado e depois o repositório; `/learn/$lessonId` chama `ensureSubjects` antes de renderizar quando o id é de aula gerada; o mapa das matérias carrega o pacote da matéria selecionada ao montar (nó sem pacote carregado aparece como "carregando", nunca some).

### 21.4 Eventos

`LearningEvent { type; at; localDate; skillId?; activityId?; meta? }`, tipos: `activity-started`, `activity-completed`, `explanation-expanded` (meta: nível), `ai-help-opened`, `checkpoint-completed`, `placement-completed`, `focus-changed`, `plan-fallback`. Resposta, "não sei" e ajuda já estão em `Attempt` — não duplicar como evento. Limite 300, local, sem envio.

### 21.5 Privacidade

Nada novo sai do aparelho além do que o tutor já envia, e o tutor passa a receber só o `PedagogicalContext` limitado (§17.3). Sem analytics externo. Sem dado sensível novo: tempo por dia, prova e foco são preferências de estudo.

### 21.6 Pronto para sincronizar (FUTURA)

Entidades já separadas como seriam no remoto: preferências, tentativas (append-only, com id), `skillModel` (agregado recalculável por replay), agenda, ledger (chave única), jornada. Quando houver backend, `Attempt` é a fonte e o resto é derivável.

---

## 22. Mudanças de frontend

| Área | Arquivos existentes | Novos (PROPOSTOS) |
|---|---|---|
| Home/jornada | `src/routes/trilha.tsx`, `TrailHeader.tsx`, `path/*`, `ContinueCard.tsx`, `SubjectChips.tsx` | `src/components/learning/journey/SessionCard.tsx`, `JourneyPath.tsx`, `FocusLine.tsx`, `FocusSheet.tsx` |
| Atividade dinâmica | `MicroLessonPlayer.tsx`, `useLearningSession.ts` | `src/routes/atividade.$activityId.tsx`, `src/lib/adaptive/activity-lesson.ts` |
| Questão | `QuestionStepView.tsx`, `FeedbackSheet.tsx`, `study.tsx`, `LessonPlayer.tsx` | `src/components/learning/DontKnowButton.tsx`, `ExplanationLadder.tsx` |
| Onboarding | `src/routes/quiz.tsx`, `aha.tsx` | `src/routes/nivelamento.tsx`, `src/components/onboarding/ExamStep.tsx`, `TimeStep.tsx`, `FocusStep.tsx`, `PlacementOffer.tsx`, `PlacementResult.tsx` |
| Checkpoint | — | `src/components/learning/CheckpointIntro.tsx`, `CheckpointResult.tsx` |
| Progresso | `src/routes/progress.tsx` | `src/components/progress/SkillRow.tsx` |
| Perfil | `src/routes/profile.tsx` | seção "Foco e ritmo", "Refazer nivelamento", nota de som no iOS, háptico com suporte detectado |
| Debug | — | `src/routes/debug.tsx` (só com `?debug=1` ou `import.meta.env.DEV`) |
| Copy | `src/lib/copy.ts`, `docs/21` | blocos `COPY.jornada`, `COPY.foco`, `COPY.nivelamento`, `COPY.checkpoint`, `COPY.questao` |

Regras de UI: um CTA primário por tela (`18` §3); Mar é o único accent (matéria por texto/ícone, não cor); alvo ≥ 44 px; 320 px sem rolagem horizontal; `prefers-reduced-motion`; foco visível; `aria-live` no feedback; a Foca só onde o `15` §4 permite (não durante a questão, não no checkpoint).

---

## 23. Mudanças de backend

Mínimas, de propósito:

- `src/lib/tutor-core.ts`: `validateTutorRequest` valida `context.pedagogy` (tamanhos, tipos); nada mais muda no transporte.
- `src/lib/tutor-prompt.ts`: seção "SITUAÇÃO PEDAGÓGICA" e modo `ensinar-do-zero`; `localFallback` com o caminho de camada 3.
- `vercel.json`: header de cache para `/sfx/v2/*` e `/content/v1/*` com hash.
- Nenhuma server function nova. Pacotes de conteúdo são estáticos.

---

## 24. Estratégia de migração

### 24.1 v5 → v6 (em `src/lib/state-migrations.ts`, mesmo padrão)

1. Parse protegido (existente).
2. Backup `foca.state.backup.before-v6` uma única vez (não sobrescrever).
3. Campos aditivos com padrão (§21.1). `dailyMinutes` derivado de `dailyLessons`.
4. `onboardingVersion = 1` para quem já tem `onboarded: true` (vê um card "Quer ajustar a trilha ao seu nível?" na home, dispensável).
5. `skillModel` por **replay** de `learning.recentAttempts` em ordem, com `ALGO_VERSION` atual e metadado de item quando existir.
6. Prior por matéria para quem tem `progress.bySubject` (§24.3), marcado `source: "prior-materia"`, `nEff = 0`.
7. Lições legadas concluídas: contam como "aula concluída" para pré-requisito (currículo), **não** como evidência de Mastery (`20` §15.3 item 7).
8. XP, streak, ledger, flashcards, `completedLessons`, `progress.lessons`, `activeSession` intocados.
9. Idempotência: rodar duas vezes = mesmo resultado. Versão futura não é sobrescrita.

### 24.2 Replay de algoritmo

Na carga, se `modelMeta.algoVersion < ALGO_VERSION`: recalcula `skillModel` por replay (§9.6). Custo: 500 tentativas × O(habilidades por tentativa) — < 10 ms.

### 24.3 Prior de matéria a partir de `/study`

```text
para matéria m com bySubject[m].answered = n, correct = k:
  taxa = (k + 1) / (n + 2)              // Laplace
  θ_m  = clamp(logit(taxa) − 0,3, −2, 2) // -0,3 porque o banco geral é majoritariamente médio/fácil
  para cada habilidade ativa de m sem entrada: theta = θ_m, sigma = 1,0, nEff = 0, source = "prior-materia"
```

---

## 25. Feature flags

Em `src/lib/features.ts` (mesmo arquivo, mesmo padrão), com override local para teste em aparelho: `localStorage["foca.flags"]` (JSON parcial), lido só se `?debug=1` estiver na URL ou em dev.

| Flag | Valores | Controla | Rollback |
|---|---|---|---|
| `masteryModel` | `"off" \| "shadow" \| "on"` | `shadow`: calcula e mostra só no debug; `on`: UI e motor usam | Volta a `shadow`; dados ficam |
| `sinaisAmpliados` | boolean | `/study` e `LessonPlayer` gravam tentativas | Para de gravar; nada é apagado |
| `botaoNaoSei` | boolean | Botão e variante neutra | Some o botão |
| `explicacaoEmCamadas` | boolean | Escada de explicação | Volta a "Explicar melhor" |
| `contextoPedagogicoIA` | boolean | `pedagogy` no tutor | Tutor volta ao contexto atual |
| `pacotesConteudo` | boolean | Carrega `public/content/v1` | Só conteúdo embarcado |
| `jornadaAdaptativa` | boolean | Home com jornada, `/atividade`, `/study` pelo motor | Home volta à trilha por matéria |
| `nivelamento` | boolean | Oferta no onboarding/perfil/home | Some a oferta; resultado salvo continua como prior |
| `checkpointsTrilha` | boolean | Inserção de checkpoint no plano | Planner não insere |
| `audioDiagnostico` | boolean | Coleta de diagnóstico de áudio | — |

Rollout gradual por porcentagem de usuários exige backend: **FUTURA**. Hoje, "rollout" = ligar flag por build, com shadow antes de `on`.

---

## 26. Estratégia de testes

### 26.1 Camadas

| Camada | Ferramenta | Foco |
|---|---|---|
| Unidade | `bun test tests/unit` | modelo, confidence, candidatos, pontuação, planner, seleção, fallback, migração, placement (EAP), checkpoint, contexto do tutor, guarda do Humanizer, validação de item |
| Cenário (simulação) | `bun test tests/unit/sim-*.test.ts` | alunos fictícios A–G percorrendo 30–60 atividades com respostas sorteadas por um θ "verdadeiro" e semente fixa |
| Integração | unidade com store real em memória | tentativa → modelo → agenda → plano numa transação |
| E2E | Playwright `chromium` + `narrow` | home com jornada, atividade, "não sei", camadas, nivelamento, checkpoint, foco, flags desligadas |
| Conteúdo | `scripts/content/validate.ts` em CI | todo JSON do banco válido; cobertura mínima por habilidade ativa |
| Regressão | suíte existente (290 unit + 55 E2E) | tudo verde a cada fase |
| Áudio | unidade com `AudioContext` falso + E2E com rede lenta (`page.route` com atraso) + checklist manual em aparelho | motivos de descarte, prazo, desbloqueio |
| Desempenho | unidade | planner < 20 ms (500 habilidades/6.000 itens), migração < 50 ms, estado pesado < 1 MB |
| Mobile | `narrow` + manual (Chrome Android, Safari iOS) | toque, safe area, teclado, folhas |

### 26.2 Simulador

**NOVO ARQUIVO PROPOSTO** `tests/unit/helpers/simulated-student.ts`: dado um θ verdadeiro por habilidade, responde itens com a probabilidade 3PL do item (semente fixa), com opções de "usa muita ajuda", "marca não sei quando p < 0,3", "esquece" (θ verdadeiro cai depois de N dias simulados).

### 26.3 Alunos fictícios e reação esperada

| Aluno | Perfil | Reação esperada do sistema (asserções) |
|---|---|---|
| A | Muito bom em Matemática (θ = 1,5) | Em 20 atividades de MT: Mastery média ≥ 70; ≥ 1 desafio; aulas `core` recebem prática de confirmação; nenhuma habilidade pulada com Confidence < 60 |
| B | Fraco em Matemática (θ = −1,5) | Itens escolhidos com p previsto ≥ 0,65; nenhum desafio; ≥ 1 reforço; Mastery não sobe acima de 50 |
| C | Bom, poucos dados (4 acertos em 1 dia) | Mastery 55–75, Confidence ≤ 40; motor não oferece desafio; próxima atividade da habilidade é prática ou revisão |
| D | Erra conteúdo antigo depois de semanas | Depois de 40 dias simulados sem a habilidade: Confidence cai ≥ 40%, Mastery não muda; erro na revisão reduz Mastery, `lapses` = 1, agenda volta a 1 dia |
| E | Marca "não sei" | 2 "não sei" na mesma habilidade → próxima atividade dela é `reforco` com motivo `reforco-nao-sei`; queda de θ menor que 2 erros com chute |
| F | Usa muita ajuda | 5 acertos assistidos: Confidence ≤ 60% da de 5 acertos independentes; `helpHeavyRecent` ≥ 2 → reforço |
| G | Faz nivelamento | Termina em ≤ 24 itens; SE ≤ 0,45 em ≥ 2 áreas ou máximo por área atingido; habilidades medidas com Confidence > 0; não medidas com "Ainda medindo" |
| H | Foco temporário em Física | Plano só com Física no dia; revisão vencida de outra matéria entra só depois de 3 dias de atraso, com motivo |
| I | Estado v5 antigo | Migração preserva XP/streak/lições; replay gera modelo; rodar 2× = mesmo resultado |

---

## 27. Analytics local e observabilidade

- **Sem analytics externo** (`20` §14.2). Tudo local.
- `trace.ts`: cada plano gera um `DecisionTrace` em memória (anel de 20): candidatos, estados derivados, pontuação por fator, restrições aplicadas, motivo final, fallback. Exemplo de linha no painel:

```text
Atividade: Prática · Funções (mat:funcao-afim-grafico)
Motivo: consolidar + equilíbrio-area
Score 0,82 = necessidade 0,21 · objetivo 0,17 · ordem 0,12 · equilíbrio 0,09 · variedade 0,10 · déficit(atual) +0,13
Mastery 64 · Confidence 41 (Q 0,78 D 0,62 R 0,75 T 1 S 0,85 I 1) · p-alvo 0,70 · b-alvo −0,21
```

- `src/routes/debug.tsx` (acesso: `?debug=1` ou dev): abas Plano, Habilidades (tabela Mastery/Confidence/σ/nEff/agenda), Tentativas recentes, Áudio (`getAudioDiagnostics`), Flags (com override). Botão "Exportar JSON" (arquivo local, para anexar a um bug).
- Calibração: comparar `predictedP` médio × taxa real de acerto em faixas (0–0,2, …, 0,8–1) no painel. Diferença > 0,15 numa faixa com ≥ 20 tentativas é sinal de recalibrar constantes.

---

## 28. Riscos

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | Conteúdo gerado com erro factual ou gabarito errado | Média | Alto | Solucionador independente de outra família, escalonamento, amostra humana, itens IA fora de nivelamento/checkpoint, versão por item para corrigir |
| R2 | Motor oscilante ou "estranho" (trilha pula de assunto) | Média | Alto | 3 atividades comprometidas, restrições duras, trace, shadow mode, simulador |
| R3 | Mastery mal calibrada (constantes chutadas) | Alta | Médio | Faixas, Confidence como freio, painel de calibração, replay por `ALGO_VERSION` |
| R4 | Pouco conteúdo na hora de ligar a jornada | Alta | Alto | `jornadaAdaptativa` só liga depois da Onda 1 cobrir ≥ 3 áreas; fallback para trilha atual |
| R5 | Migração corrompe estado de quem já usa | Baixa | Alto | Backup antes de v6, aditiva, idempotente, teste com fixtures v3/v4/v5 |
| R6 | `localStorage` cheio | Baixa | Médio | Limites e teste de orçamento; `persist()` já trata falha |
| R7 | Direitos autorais de questão oficial | Baixa (risco aceito pelo usuário para o ENEM; outros vestibulares continuam sem reprodução) | Médio | Atribuição obrigatória (ano + "ENEM") em todo item importado; sem imagem/charge de terceiro; decisão registrada em `docs/34` |
| R8 | Som continua falhando em algum iPhone | Média | Baixo | Diagnóstico, checklist em aparelho, som nunca é requisito para estudar |
| R9 | Lovable/sync quebrar com scripts `predev`/`prebuild` | Média | Médio | Testar no Lovable antes de ligar; pacotes com fallback se ausentes |
| R10 | Custo do pipeline sair do controle | Média | Médio | Modelos baratos por padrão, escalonamento só por conflito, métricas por lote, orçamento por onda |
| R11 | Aluno vê números e se desanima | Média | Médio | Faixas em palavras, sem número abaixo de Confidence 25, voz sem cobrança |
| R12 | Onboarding fica longo | Média | Médio | 3 telas novas, nivelamento opcional, pulável a qualquer momento |
| R13 | Executor barato toma decisão de arquitetura | Média | Médio | Context Pack com "não pode mudar", tarefas pequenas, `spec-verifier` por fase |

---

## 29. Estratégia de custo

| Onde | Modelo | Justificativa |
|---|---|---|
| Classificar 1.204 exercícios legados + 59 questões (habilidade, dificuldade) | HAIKU / barato | Tarefa de rótulo com lista fechada; amostra de 5% revisada |
| Gerar itens e aulas | HAIKU / barato | Volume; o gabarito é conferido depois |
| Criticar | HAIKU / barato | Checklist |
| Solucionar sem gabarito | barato de **outra família** (ex.: mini da OpenAI via OmniRoute/endpoint) | Erros menos correlacionados com o gerador |
| Escalar conflitos (~5–15% dos itens) | SONNET | Julgamento |
| Conflito persistente, aula de habilidade difícil | MODELO FORTE | Raro |
| Humanizar explicações | HAIKU / barato + guarda determinística | Forma, não conteúdo |
| Tutor do app | `gpt-5.4-mini` (sem mudança) | Já medido no `12`; contexto limitado a ~2.000 caracteres a mais |

Estimativa de tokens por item publicado (ordem de grandeza, para planejar orçamento; preços mudam, calcular na hora com a tabela vigente): gerar ~1,5k saída, criticar ~0,8k, resolver ~1k, humanizar ~0,4k; escalonamento ~2k em ~10% dos itens. Onda 1 (~960 itens + 60 aulas) ≈ 5–6 milhões de tokens no total, a maior parte em modelo barato.

Custo do app em runtime: zero novo para o motor (local). Tutor: +~500 tokens de entrada por chamada com contexto pedagógico.

---

## 30. Roteiro completo de implementação

Detalhe de cada fase no `31`. Resumo:

| Fase | Nome | Tipo | Depende de | Modelo principal |
|---|---|---|---|---|
| 0 | Linha de base, registro e decisões | BLOQUEANTE | — | SONNET |
| 1 | Áudio e háptico | PARALELIZÁVEL (começa já) | 0 | SONNET (diagnóstico: FORTE se H1–H4 não explicarem) |
| 2 | Taxonomia de habilidades | BLOQUEANTE | 0 | SONNET + HAIKU (rascunho de listas) |
| 3 | Catálogo de itens e metadados | BLOQUEANTE | 2 | SONNET + HAIKU (classificação) |
| 4 | Schema v6, eventos e migração | BLOQUEANTE | 2 | SONNET |
| 5 | Mastery e Confidence (shadow) | BLOQUEANTE | 3, 4 | FORTE (revisão) + SONNET |
| 6 | Captura de sinais e "Não sei" | BLOQUEANTE | 4, 5 | SONNET |
| 7 | Explicação em camadas e Foca IA contextual | PARALELIZÁVEL | 6 | SONNET |
| 8 | Motor adaptativo e observabilidade | BLOQUEANTE | 5, 6 | FORTE (algoritmo) + SONNET |
| 9 | Pipeline de conteúdo com IA | PARALELIZÁVEL (com 4–8) | 2, 3 | SONNET |
| 10 | Fontes oficiais, parâmetros do Inep e questões oficiais do ENEM | PARALELIZÁVEL | 3 | SONNET + HAIKU |
| 11 | Conteúdo em escala (Ondas 0 e 1) | BLOQUEANTE para ligar 12–14 | 9 | HAIKU/SONNET/FORTE conforme estágio |
| 12 | Jornada única e modo foco | BLOQUEANTE | 8 (e 11 para ligar a flag) | SONNET |
| 13 | Onboarding e nivelamento adaptativo | PARALELIZÁVEL com 14 | 5, 8, 11 | FORTE (CAT) + SONNET |
| 14 | Checkpoints da trilha | PARALELIZÁVEL com 13 | 8, 12 | SONNET |
| 15 | Rollout, regressão e registro | BLOQUEANTE (final) | todas | SONNET |
| — | Ondas 2 e 3 de conteúdo | FUTURA | 11 | pipeline |
| — | Backend, sync, calibração com dados reais, adaptador háptico nativo | FUTURA | decisão | — |

```text
0 ──┬── 1 (áudio/háptico, independente)
    └── 2 ──┬── 3 ──┬── 5 ── 6 ──┬── 7
            │       │            └── 8 ── 12 ──┬── 13
            └── 4 ──┘                          └── 14
            3 ── 9 ── 11 (Ondas 0–1) ─────────► libera flags de 12/13/14
            0 ── 10 (dados oficiais Inep + questões oficiais do ENEM, aprovado)
            todas ── 15
```

---

## 31. Glossário (nomes que colidem)

| Termo | Significado aqui | Nome no código |
|---|---|---|
| Checagem rápida | 1ª questão da aula, logo depois do ensino (hoje rotulada "Checkpoint") | `role: "checkpoint"` (não renomear) |
| Checkpoint | Avaliação periódica da trilha, sem ajuda | `ActivityKind "checkpoint"`, `role: "diagnostico"`, sessão `"checkpoint-trilha"` |
| Nivelamento | Teste adaptativo inicial, opcional | rota `/nivelamento`, sessão `"nivelamento"`, `role: "diagnostico"` |
| Trilha / jornada | A sequência única misturada na home | `learning.journey`, `JourneyPath` |
| Mapa das matérias | A trilha por matéria do `25`/`27` | `buildTrail`, `SubjectPath` (intactos) |
| Aula | Microlição v2 | `MicroLessonV2` |
| Atividade | Unidade da jornada | `PlannedActivity` |
| Habilidade | Unidade do modelo | `SkillDef`, `skillId` |
| Mastery / Confidence | §9 / §10 | `mastery()` / `confidence()` em `src/lib/adaptive/model.ts` |

---

## 32. Revisão crítica do próprio plano

Perguntas do pedido original, respondidas depois de reler o plano inteiro:

| Pergunta | Resposta e correção aplicada |
|---|---|
| Estou duplicando algo que já existe? | A primeira versão criava agenda própria no `skillModel`. **Corrigido**: `reviewSchedule` continua sendo a única agenda (escada estendida), `skillEvidence` alimenta Confidence, e Confidence é derivada, não gravada. Sessões dinâmicas usam `MicroLessonV2` sintética + player existente, como `buildChapterReview`, em vez de um player novo. |
| Estou destruindo arquitetura boa? | Não: `buildTrail`, `SubjectPath` e `recommendNext` ficam intactos como mapa por matéria e fallback. Conteúdo em TS continua síncrono; só conteúdo novo vai para pacotes. |
| Alguma fase depende de algo não planejado? | Nivelamento dependia de itens com papel `diagnostico` revisados por humano, que só existem depois da Onda 1. **Corrigido**: Fase 13 depende da 11 e tem limiar mínimo de pool (≥ 12 itens elegíveis por área) antes de ligar a flag. A seleção de itens do motor depende de `ItemMeta` para o conteúdo antigo: **coberto** na Fase 3 com padrão para item sem metadado. |
| Alguma regra adaptativa prejudica o aprendizado? | Pular aula por nivelamento podia remover fundamento. **Corrigido**: `core` sempre recebe prática de confirmação; "aula opcional" exige Confidence ≥ 60 de evidência diagnóstica, não prior. Checkpoint podia virar punição: XP fixo e sem feedback de erro durante. |
| Mastery e Confidence estão separados? | Sim: fórmulas, dados e usos diferentes; Confidence não usa σ para não contar a mesma coisa duas vezes. |
| Escala sem ficar complexo? | Sem banco, sem fila, sem event sourcing: `Attempt` já é o log; agregados recalculáveis por replay. Pacotes JSON estáticos resolvem bundle sem servidor. |
| Um modelo barato consegue executar? | As tarefas do `31` têm arquivos, contratos, pseudocódigo, testes e critérios. As partes de julgamento (constantes do modelo, CAT, diagnóstico de áudio) estão marcadas FORTE. |
| Migração perigosa? | Aditiva, com backup e replay; nenhuma remoção de campo; teste com fixtures reais das versões 3–5. |
| Pode quebrar produção? | Tudo atrás de flag; `predev`/`prebuild` com pacotes ausentes não quebra o app (fallback); build testado com preset Vercel antes de ligar. |
| Conteúdo gerado tem validação suficiente? | Sete portões, dois deles determinísticos, e itens de IA não entram em nivelamento/checkpoint sem revisão humana. |
| Funciona sem IA? | Motor, nivelamento e checkpoint são locais. Tutor tem fallback. Pipeline é offline. |
| Mobile continua bom? | Folhas reaproveitam `BottomSheet`; E2E `narrow` estendido às telas novas; teste em aparelho é critério da Fase 15. |
| Áudio vai funcionar em produção? | Só com evidência de aparelho. O plano começa por instrumentar e reproduzir (Fase 1), não por "consertar no escuro". |
| Dá para debugar? | Trace por decisão, painel de debug, exportação de estado, painel de calibração. |
| Abstração prematura? | Adaptador háptico nativo ficou só como interface (sem implementação). Rollout percentual e calibração por dados reais ficaram FUTURA. "Competência" como entidade foi descartada. |

Decisões que ficavam com o usuário:

1. ~~Questões oficiais~~ — **decidido em 23/09/2026**: reproduzir texto de questões do ENEM de anos anteriores (fáceis e difíceis), sempre com o ano e o vestibular citados junto ao enunciado. Sem parecer jurídico formal; risco aceito pelo dono do produto. §18.4 e `docs/34` atualizados.
2. **iPhone no silencioso**: ainda em aberto. Adotando o padrão recomendado (respeitar a chave) até o usuário dizer o contrário — ver §20.2 item 6.
3. ~~Aprovar este plano~~ — **aprovado em 23/09/2026.** Passa a prevalecer sobre o `25` §6.6 (uma matéria por vez) nos assuntos que cobre, conforme o cabeçalho deste documento.
