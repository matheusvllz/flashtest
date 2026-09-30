> **Arquivado em 29/09/2026 (decisão 0004).** Documento histórico: o cabeçalho e o "estado" abaixo descrevem o momento em que foi escrito, não o estado atual. O que continua valendo foi extraído para os documentos canônicos ([docs/README.md](../../../README.md)); resumo e contexto: [resumo.md](resumo.md).

# 36 — Qualidade pedagógica, UX e confiabilidade: plano de implementação

**Status:** **aprovado em 28/09/2026** pelo usuário (confirmação explícita na conversa: "poe aprovar") — em execução; registro em `docs/historico/iniciativas/35-36-37-qualidade/37-registro-execucao-qualidade.md`. Rascunho original de 28/09/2026.
**Autor:** Claude Code (Opus), a partir do prompt de handoff [35](35-prompt-claude-code-atualizacao-qualidade.md) preparado pelo Codex. Executor previsto: Sonnet, em outra sessão, depois da aprovação.
**Linha de base:** checkout `76a7b70` (main), working tree limpo exceto `docs/35` (não rastreado).
**Prevalece sobre (quando aprovado):**
- `30` §11.5/§14 e `31` F12 no **contrato de início/conclusão de atividade** e de **reposição da fila** (este plano fixa o proprietário da seleção de itens e a preservação das comprometidas — §J Fase 2).
- `30` §12 e `31` F13 no **contrato de finalização do nivelamento** (Fase 3).
- `30` §9.6 na **política de versão**: separa `ALGO_VERSION` (modelo) de `PLANNER_VERSION` (plano) (Fase 4).
- `27` D-7 / O5, `18` §8 (`PhoneFrame` 440) e `DESIGN.md` "PhoneFrame com largura máxima de 440px" **só no layout ≥ 768 px** (Fase 8). Mobile continua idêntico.
- `CLAUDE.md` "sem versão web": não se aplica a este plano — o app já roda em navegador; o que muda é o layout em telas largas, não o escopo do produto.
- Nada mais. Feedback imutável, tutor manual, voz (`20` §7.1), identidade Rabisco (`18`/`19`), ledger, migração aditiva e regras de Git/Lovable continuam valendo sem alteração.

## Como a IA executora deve usar este documento

1. Ler este documento inteiro. Depois `../CLAUDE.md`, `../AGENTS.md`, [ai/SDD-WORKFLOW.md](../../../ai/SDD-WORKFLOW.md) e o registro de execução deste plano (`docs/historico/iniciativas/35-36-37-qualidade/37-registro-execucao-qualidade.md`, criado na T-00.1). **Não assumir que uma tarefa está pendente sem conferir o `37`.**
2. Executar **na ordem de §P** (fases e tarefas). Cada tarefa termina com `bunx tsc --noEmit` exit 0 e `bun test tests/unit` verde; se tocar UI, o subconjunto E2E da tarefa verde.
3. Não tomar decisão de arquitetura. Toda escolha está fechada em §F/§G/§H/§J. Divergência entre este plano e o código → registrar no `37` (seção "Divergências") e seguir a **intenção** descrita no requisito (RF/RU/RP/RA).
4. Carregar só as skills indicadas em cada tarefa (§3 abaixo). Nenhuma skill prevalece sobre este plano.
5. Sem commit/push/merge/worktree/branch sem pedido explícito do usuário. Nunca reescrever histórico publicado (Lovable). Nunca editar `src/routeTree.gen.ts` à mão.
6. Sem dependência nova. Nenhuma tarefa deste plano precisa de uma.
7. Rodar geração de conteúdo paga (API) está **fora** deste plano. A revisão de conteúdo da Fase 7 é feita pelo próprio executor lendo os itens (autorização delegada de `32` L349), não por lotes novos.

### Legenda de evidência usada no documento

| Marca | Significa |
|---|---|
| **[nav]** | Reproduzido em Chromium headless nesta sessão (28/09/2026), storage sintético isolado, dev server local, sem alterar código |
| **[sim]** | Reproduzido chamando o motor puro com dados sintéticos (script descartável fora do repo) |
| **[cód]** | Confirmado por leitura de código (arquivo:linha citado) |
| **[reg]** | Afirmado em registro/spec, não reverificado |
| **[hip]** | Hipótese ainda não reproduzida — a tarefa começa reproduzindo |

---

## 0. Linha de base desta sessão (28/09/2026)

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `bunx tsc --noEmit` | exit 0 |
| Unitários | `bun test tests/unit` | **811 pass, 0 fail, 3.657 expect, 77 arquivos** (1,17 s). O runner lista 78 arquivos em `tests/unit/` porque um é helper. Saída inclui logs esperados do teste de pipeline (`[resolver] BLOQUEIO: taxa de conflito 50.0%` — fixture proposital) |
| Build | `bun run build` | exit 0; CSS em `dist/assets/styles-*.css`; gera `.netlify/functions-internal/` (ignorado pelo Git) |
| CSS compilado | grep em `dist/assets/styles-*.css` | `--color-mar`, `--color-success`, `--color-error`, `--color-cards`, `--color-recompensa`, `--color-gelo` **presentes hoje** como `var(--X)`; `--success`/`--cards` com valores claro/escuro. A presença dos aliases depende de haver uma classe Tailwind que os use — é frágil (ver B1) |
| E2E | não rodei a suíte inteira. Scripts de reprodução próprios (fora do repo) contra `bun run dev` | ver D |
| Git | `git status --short` antes/depois | só `?? docs/35-…` e, depois desta sessão, `?? docs/36-…`. Observação: `bun run dev`/`build` executam `predev`/`prebuild` = `scripts/content/build-packs.ts`, que reescreve `src/content/banco/itens-gerados.ts` e `public/content/v1/`; nesta sessão o resultado foi byte-idêntico (tree limpo), mas **o executor deve checar `git status` depois de cada build** |

Números de registros antigos (257/33, 136/20, 82 E2E…) são históricos; não usar como evidência.

## 1. Inventário de skills (verificado nesta sessão)

| Skill | Catalogada (`skills-registry.json`/`SKILLS.md`) | Instalada | Habilitada (`.claude/settings.json`) | **Carregável nesta sessão** | Uso neste plano |
|---|---|---|---|---|---|
| `foca-sdd` | sim | `.claude/skills/foca-sdd/` | projeto | **sim — carregada** | toda fase (precedência, formato) |
| `web-design-guidelines` | sim | `.claude/skills/` | projeto | sim | Fase 8 (revisão a11y formal, G16 do `32`) |
| `vercel-react-best-practices` | sim | `.claude/skills/` | projeto | sim | Fases 2 e 8 (re-render/efeitos; ignorar regras só de Next/RSC) |
| `design-taste-frontend`, `redesign-existing-projects`, `motion-design` | sim | `.claude/skills/` | projeto | sim | **não usar** (risco de redesenhar identidade). `motion-design` só se T-08.x tocar animação — não toca |
| `repo-security-review` | sim | `.claude/skills/` | projeto | sim | Fase 10, modo `--pr` sobre o diff (L2) |
| Superpowers 6.4.1 (`systematic-debugging`, `writing-plans`, `verification-before-completion`, `test-driven-development`…) | sim | cache `~/.claude/plugins/cache/superpowers-marketplace/superpowers/6.4.1/skills/` | `true` | **não** (não aparece na lista de skills desta sessão) | Fases 2–3 (`systematic-debugging`), Fase 10 (`verification-before-completion`). Alternativa se continuar indisponível: ler o `SKILL.md` pelo `cachePath` do registry (SKILL-ROUTING §6) ou usar o agente `spec-verifier` do repo |
| `impeccable` | sim | cache | `true` | não | Fase 8 (crítica desktop). Alternativa: `web-design-guidelines` + `docs/18` |
| `humanizer` | sim | cache | `true` | não | Fases 6/9 (copy nova). Alternativa: checklist de voz `20` §7.1 aplicado à mão |
| `agent-skills` (Addy) | sim | cache | `true` | não | não necessária |
| `tailwind-v4-shadcn`, `tanstack-start/router` | sim | cache | `true` | não | Fase 8 (tokens/`@theme inline`) — alternativa: memória do projeto "Tokens `@theme inline`" + `CLAUDE.md` §Design system |
| Marketing, GSAP | sim | cache | **`false`** | não | nunca |

Para este planejamento: `foca-sdd` (carregada). `writing-plans` **não** foi carregada (indisponível na sessão) — o formato segue `docs/ai/templates/spec.md` + o formato `T-XX` pedido no `35` §18, que prevalecem de qualquer forma. `systematic-debugging` não carregada; o método (reproduzir → rastrear → causa → teste que falha) foi aplicado à mão nos achados [nav]/[sim].

---

## A. Executive Summary

**O que existe.** Um app local-first (TanStack Start + React 19, store único em `localStorage`, schema v6) com jornada adaptativa ligada por padrão (9 flags `true`/`"on"` em `src/lib/features.ts`), nivelamento CAT real (pool diagnóstico ~40–45 itens por área, `32` L376–385 [reg]), 755 itens de pacote + 59 do banco geral + 1.204 exercícios legados de redação + microlições autorais, 48 aulas geradas, modelo Mastery/Confidence inspirado em TRI, DS Rabisco coerente em claro/escuro. A base de testes é grande (811 unitários verdes) — mas **testes verdes coexistem com bugs de fluxo reproduzidos**, porque os E2E entram pela URL do player, não pelo CTA real, e checam presença de dado, não efeito.

**O que falha — confirmado nesta sessão:**

| # | Falha | Evidência | Impacto no aluno |
|---|---|---|---|
| C1/B3 | Terminar o nivelamento pela última resposta **não aplica priors nem invalida a jornada**. 24 respostas → `status "concluido"` → mesma fila de 3 antes/depois; `skillModel` só com 24 entradas `evidencia`, **0** `prior-nivelamento` | [nav] + [cód] `nivelamento.tsx:117,136` | "Fiz o teste e nada mudou" |
| C2/B2 | CTA "Continuar" da Home **e** nó atual do caminho, para prática/revisão/desafio/checkpoint, voltam para `/trilha` sem abrir questão; `activeActivity` fica setada **sem `itemIds`** — e continua assim (loop) | [nav] card e nó + [cód] `SessionCard.tsx:93`, `JourneyPath.tsx:119`, `atividade.$activityId.tsx:81-86,138` | Jornada inteira travada no primeiro item dinâmico |
| C4a/B2 | Capítulo legado (redação) é oferecido **de novo** depois de concluído: o candidato lê `learning.completedLessons`, a conclusão grava em `progress.lessons` | [sim] (`crase-01-a-regra-de-ouro` repetida) + [cód] `candidates.ts:55-58,149` | "Concluí e ele me manda a mesma lição" |
| C3 | Retomar o nivelamento após reload **perde as respostas anteriores no θ̂/SE**: mesma sequência, θ̂ −0,663/SE 0,769 contínuo vs −0,815/0,839 com reload | [sim] + [cód] `nivelamento.tsx:89`, `placement.ts:193-198` | Estimativa errada, parada tardia |
| C4c | Reforço de aula já concluída é marcado como "feito" ao voltar à Home sem estudar | [cód] `store.ts:1482-1506` | Progresso falso |
| C4d | `completeJourneyActivity` só é idempotente no XP; histórico, `sinceCheckpoint`, bloco do dia e evento duplicam | [cód] `store.ts:1414-1473` | Checkpoint antecipado, meta diária inflada |
| C4e | Id de atividade `atv-<dia>-hash(seed=dia:skill:posição)` pode **colidir** com uma já concluída no mesmo dia → ledger não paga XP da segunda | [cód] `planner.ts:282` [hip] de ocorrência | XP perdido silenciosamente |
| C4f | Reposição da fila recalcula as 3 comprometidas (não só a vaga) | [cód] `journey.ts:43-51` | Card muda "sozinho" (contraria `30` §11.5) |
| B1 | Folha de feedback transparente | **Corrigido e reconfirmado** [nav]: fundo computado opaco (alfa 1) claro/escuro, 390/1280 | — (falta teste de regressão que cheque CSS computado) |
| B4 | Véu branco no escuro | **Corrigido e reconfirmado** [nav]: scrim `oklab(0 0 0 / 0.4)` nos dois temas | — (falta a11y do diálogo: **foco escapa** após Tab [nav]) |
| C5 | Falha de `localStorage` é engolida (`setState` ignora `persist()`); sem listener `storage` (abas se sobrescrevem) | [cód] `store.ts:457-462` | Aluno acha que salvou |
| — | `ALGO_VERSION` dispara replay do modelo a partir de `recentAttempts`, e **respostas de nivelamento não estão lá** → qualquer bump futuro apagaria o efeito do nivelamento | [cód] `store.ts:298-320`, `bootstrap.ts:108-112` | Risco latente de perder o diagnóstico |

**O que precisa evoluir** (requisitos em §F): diagnóstico visual honesto; priors do nivelamento influenciando de fato a ordem (hoje NOVA tem necessidade fixa 0,8 e prior tem `nEff 0` → nenhum efeito); mix 70/20/10 que não é dominado por NOVA quando há revisão devida (G4); recalibração pós-checkpoint integrada (G7); portões editoriais para pista de tamanho/posição e proveniência honesta da revisão; desktop que não seja "celular no meio do monitor"; descoberta de cursos; a11y dos diálogos.

**Prioridades:** (1) fluxo que trava/mente sobre progresso (Fases 1–3, 5); (2) adaptação perceptível e correta (Fase 4, 6); (3) conteúdo (Fase 7); (4) DS/desktop/a11y/cursos (Fases 8–9); (5) documentação (Fase 10).

**Limites.** Sem backend, sem autenticação real, sem sync entre dispositivos, sem nova arte de logo (não existe nenhuma além dos 6 PNGs oficiais — §12.1), sem geração paga, sem previsão de nota ENEM, sem analytics externo. Hardware físico, leitor de tela real e áudio/háptico ficam como verificação manual separada (§L.4).

---

## B. Current Architecture

### B.1 Stack e fronteiras reais

| Camada | Fato (verificado) |
|---|---|
| Framework | TanStack Start + React 19 + TanStack Router file-based; **todas** as rotas exceto `__root.tsx` são `ssr: false`; hidratação relevante só no `__root` (script de tema em `<head>`, `__root.tsx:125-141`) e `PhoneFrame` (`md:border-x`, aviso de hidratação registrado em `32` L522) |
| Build | Vite 8 + Bun; `predev`/`prebuild` = `bun scripts/content/build-packs.ts` (gera `src/content/banco/aulas-geradas.ts`, `itens-gerados.ts`, `public/content/v1/`) |
| Estado | `src/lib/store.ts`: `useSyncExternalStore`, `structuredClone(state)` a **cada** `setState` (`:458`), `localStorage["foca.state.v3"]`, `schemaVersion 6` (`state-migrations.ts:24`). Chave ≠ versão. Legado `flashtest.state.v2` lido uma vez (`:333-339`). Backups `foca.state.backup.before-learning-v4` e `…before-v6` (write-once) |
| Migração | `computeAdditiveFields` (`state-migrations.ts:243-293`): passe único aditivo; `parseJourney`/`parsePlacement` **preservam campos extras** (`return v as …`, `:148`, `:166`) → campos opcionais novos sobrevivem sem bump de schema e também sobrevivem a rollback de código |
| React Query | `QueryClient` criado (`router.tsx:6`), provider no `__root`; **zero** `useQuery`/`useMutation` em `src`. Nenhum bug deste plano envolve cache de query |
| Rede | (1) tutor: `src/lib/tutor.ts` (`askTutor`, server fn) → `tutor-core.ts`, OpenAI via `fetch`, 12 s, fallback local; (2) **pacotes de conteúdo**: `src/lib/content/repository.ts` (`manifest.json` + pacotes por matéria de `public/content/v1/`, timeout 8 s); (3) áudio (`public/sfx`). A frase "só a IA usa rede" (`CLAUDE.md` L54) está desatualizada |
| `sessionStorage` | `voz.ts:88-117` (última fala por slot) e `redacao.index.tsx:26-39` (contagem anterior p/ animação de desbloqueio) — apresentação, nunca progresso |
| Flags | `BASE_FEATURES` (`features.ts:58-100`): todas `true`/`"on"`. Override `localStorage["foca.flags"]` só em `DEV` ou `?debug=1`, lido **uma vez** no load do módulo |
| Fronteira de bundle | `store.ts` não importa `@/content/items|microlicoes|trilhas|taxonomy` (`store-bundle-boundary.test.ts:18-31`, regex estático). `src` não importa `scripts/content` (`pipeline-boundary.test.ts`). O teste **não** proíbe `@/lib/adaptive/journey`/`index` apesar do comentário em `store.ts:1346` — a Fase 1 fecha esse buraco |

### B.2 Fontes de verdade por conceito

| Conceito | Fonte canônica | Escritor(es) | Leitores relevantes |
|---|---|---|---|
| Microlição concluída (autoral **e** gerada) | `learning.completedLessons[lessonId]` (`MicroLessonCompletion {version, completedAt, stars, bestPct}`) | `completeMicroLesson` (`store.ts:686`) | planner (`planner.ts:203-204` — **só autoral** via `lessonForSkill`), `classify.prerequisiteSatisfied`, `syncJourneyWithCompletions`, trilha |
| Lição legada (redação) concluída | `progress.lessons[lessonId]` (`LessonProgress {…, completedAt}`) | `completeLesson` (`store.ts:641`) | `fallback.ts:57` ✅, `syncJourneyWithCompletions` ✅, **`legacyCandidateForSkill` ❌ (lê `completedLessons`)** |
| Atividade dinâmica concluída | `learning.journey.history[]` + ledger `atividade:<id>` | `completeJourneyActivity` | Home, checkpoint (`sinceCheckpoint`), mix (`JANELA_MIX`) |
| Sessão do player | `learning.activeSession` | `useLearningSession` | retomada de aula |
| Atividade em curso | `learning.journey.activeActivity` | `setActiveActivity` (Home **e** rota), `completeJourneyActivity`, `syncJourneyWithCompletions` | rota `/atividade`, sync |
| Recompensa | `learning.rewardLedger` (XP) + `progress.xp` | ações de conclusão | — |
| Evidência por habilidade | `learning.skillModel` (θ, σ, `nEff`, `source`) + `skillEvidence` + `recentAttempts` (500) | `recordLearningAttempt`, `submitPlacementResponse`, `finishPlacement`, bootstrap | classify/scoring/Confidence |
| Agenda | `learning.reviewSchedule` | `recordLearningAttempt` | classify (`DEVIDA`) |
| Dia/streak | `progress.today`, `activityDays`, `streak` | `registrarAtividade` (`store.ts:516-563`, sem idempotência própria) | Home, meta |
| Nivelamento | `learning.placement` (`PlacementState {status, startedAt, finishedAt, areas{itemIds,responses,theta,se,done}, seed}`) | `beginPlacement`, `submitPlacementResponse`, `setPlacementState`, `abandonPlacement` | rota, resultado |

### B.3 Conflitos documentais e decisão

| # | Conflito | Fontes (seção/linha, data) | Evidência no código | Decisão | Docs a atualizar (Fase 10) | Impacto no executor |
|---|---|---|---|---|---|---|
| K1 | Schema v5 vs v6 | `CLAUDE.md` L17, L87 ("v5"), 22/09; `32` L106 (v6), 24–28/09 | `CURRENT_SCHEMA_VERSION = 6` | v6 é o atual; este plano **não sobe** schema (§H) | `CLAUDE.md` bloco Jornada V2 (nota "v6 desde o `30`") | nenhum bump; campos opcionais |
| K2 | "1–2 questões por vez" vs aula v2 de 4–8 | `CLAUDE.md` L45, `00-README` L48, `PRODUCT` L22 vs `25` §6.5 L196, `30` §7.1 L256 | `validateLessonSteps` impõe 4–8; `/study` `LESSON_SIZE = 2` | Três contratos coexistem e continuam: aula v2 (4–8), `/study` (2), atividade dinâmica (n do candidato), legado (fixo). Frase "1–2 questões" vira "aulas curtas" | `PRODUCT` §Produto, `00-README` L48, `CLAUDE.md` "O produto em uma frase" | não aplicar 4–8 fora de aula v2 |
| K3 | "Não há pool diagnóstico / flags desligadas" | `32` L29, L218, L292, L308, L408, L434, L455, L479, L494 (24–26/09); `placement-pool.ts` comentário L10; `content-pipeline/README` L5 | pool ~40–45/área [reg]; flags `true` | Estado atual = pool existe, flags ligadas (`32` F15.1, 27/09). Trechos antigos ficam como histórico com nota "superado por F15.1" | `32` (notas inline), `placement-pool.ts` comentário (T-03.6), `content-pipeline/README` §status | não repetir "sem pool" |
| K4 | Home de uma matéria vs jornada misturada | `25` §6.6 L156 vs `30` L5, §14.1 | `trilha.tsx` `mostrarJornada` | Jornada misturada é a home com a flag; mapa por matéria é vista secundária (`?vista=mapa`) e rollback. Não remover | nenhum | preservar `LearningPath` |
| K5 | DS Rabisco vs Ártica/"Flash Test" | `09`, `docs/design/brand/Flash Test - design System.html` vs `18`/`19` | tokens Rabisco em `styles.css` | Rabisco vigente | nenhum | não usar `09` |
| K6 | Desktop 440 px | `27` D-7 L469, O5 L51; `18` L301, L552, L800; `DESIGN.md` L121; `CLAUDE.md` L101 "sem versão web" | `PhoneFrame max-w-[440px]` + 3 offsets `13.75rem` | **Este plano prevalece em ≥ 768 px** (pedido explícito atual, `35` §12.3). Mobile idêntico. "Sem versão web" = sem produto web separado; continua verdade | `DESIGN.md` §layout, `18` nota de precedência, `27` D-7 nota | Fase 8 |
| K7 | Flexibilidade pedagógica vs validadores | `35` §8.1 vs `validateLessonSteps` (`25` L196) | validador impõe dificuldade não-decrescente e 4–8 | **Não** afrouxar o validador de aula v2. Exceções vivem em contratos separados que já existem (atividade dinâmica, `/study`). Nenhuma exceção "só na UI" | nenhum | §G.2 |
| K8 | `revisada-humano` sem humano item a item | `32` L323, L349 (delegação 27/09: "Pode decidir sozinho essa parte… Essa promoção de itens eu aprovo") | 737 itens `revisada-humano`, `reviewer` = ver §G.5 | Preservar a autorização. Registrar a modalidade real num campo **novo** `reviewKind` sem renomear o enum nem despublicar | `content-pipeline/README`, `33` via gerador, `34` nota | Fase 7 |
| K9 | Autorização de questões oficiais | `34` L9 (texto ENEM ok com ano+prova), L15-21 (sem imagens de terceiros, sem outras bancas) | 18 itens `oficial-conferida` | Manter exatamente o escopo do `34`. Nada de expandir | nenhum | Fase 7 checa atribuição em todos consumidores |
| K10 | Tutor automático histórico | `CLAUDE.md` L77 vs L23, `20` §4.2 | tutor só manual (`20` A2) | Manual. Parágrafo histórico ganha "(removido pelo `20`)" | `CLAUDE.md` Development 2 | nenhum |
| K11 | "Só a IA usa rede" | `CLAUDE.md` L54 | `repository.ts` faz fetch | Corrigir o texto | `CLAUDE.md` Stack | — |
| K12 | Janela do mix 10 vs 20 | `30` §7.4 L288, §11.5 L641 (10) vs §4 O4 L206, §11.4 L631, `31` G4 L2125 (20) | `JANELA_MIX = 10` | Regra operacional = janela móvel de **10**. Validação (G4 do `31`) = medir **duas janelas consecutivas de 10** num plano de 20 — não é outra regra | `30` §4 O4 nota, `31` G4 nota | T-04.3 |
| K13 | Nivelamento "≈20 itens" vs 24; "≥12 elegíveis" vs "<4" | `30` L64, L744; L1400 vs `31` L1832 | `PLACEMENT_MAX_ITENS_TOTAL = 24`; mínimo `PLACEMENT_MIN_ITENS_ELEGIVEIS_AREA = 4` | 24 é o teto; 4 é o mínimo para medir uma área; "≥12" era critério de rollout (cumprido: 40–45) | `30` §1 nota | — |
| K14 | `BottomSheet` `bg-abismo/40` | `18` L770 | `bg-black/40` (28/09) | Preto fixo é funcional (scrim não inverte). Vira token `--scrim` definido em `:root`/`.dark` com o mesmo valor (T-08.4) | `18` §componentes | — |
| K15 | `00-README` diz `20` "não implementado" (L54) e `34` "falta arquivo real" (L79) | 21/09, 25/09 | implementado / importado | Corrigir texto | `00-README` | — |
| K16 | `brand.ts` "Foca 60 segundos"/"te cobra todo dia" | `brand.ts:28-33` vs voz `20` §7.1 ("sem cobrança", "retorno sem culpa") e aula v2 | usado em `<title>`/OG | Copy nova (§F RU-20) | `21` inventário | T-08.7 |

---

## C. Current User Flow

### C.1 Fluxo ponta a ponta (estado atual, com a flag `jornadaAdaptativa` ligada)

| # | Transição | Chamador → função | Mutação / persistência | Cache / rede | Navegação / fallback | Teste existente |
|---|---|---|---|---|---|---|
| 1 | Boot/hidratação | `index.tsx` → `hydrate()` (`store.ts:477`) → `load()` | lê `foca.state.v3` (ou legado), `computeAdditiveFields`, backups write-once, `persist()` se versão não-futura; agenda `bootstrapModel` por `import()` se `modelMeta.algoVersion < ALGO_VERSION` (`:298-320`) | — | JSON inválido → `defaultState` **sem** regravar (o bruto fica até a 1ª mutação) | `state-migrations.test.ts`, `state-migration.spec.ts` |
| 2 | Tema | script inline `DARK_MODE_SCRIPT` (`__root.tsx:125-134`) lê `prefs.theme` do storage | — | — | `auto` não reage a mudança do SO em runtime | — |
| 3 | Entrada local | `welcome` → `/quiz` (signup/onboarding redirecionam) | `completeQuiz` (ledger `onboarding:bonus`) | — | — | `onboarding.spec.ts` |
| 4 | Perfil declarado | `quiz.tsx` `STEPS` = name/level/exam/state/target/course/subjects/time/focus | `setState` direto em `prefs` | — | — | `onboarding.spec.ts` |
| 5 | Oferta de nivelamento | `PlacementOffer` (novo, `onboardingVersion 2`); card em `/trilha` para `onboardingVersion 1` (dispensa 30 dias) | evento `placement-card-dismissed` | — | pular → `/aha` (lacunas heurísticas de `gaps.ts`) | `placement.spec.ts` (parcial) |
| 6 | Nivelamento | `/nivelamento` → `carregarTodosOsPacotes()` → `beginPlacement(seed)` → a cada render `pickPlacementItem` → `setPlacementState`; resposta → `submitPlacementResponse(scope, itemsShownRef.current, item, correct, dontKnow)` | cada resposta: `advancePlacement` + `updateSkill` (papel diagnóstico, `source: evidencia`); **se `placementConcluido` → `status: "concluido"` na mesma transação** (`store.ts:1176-1186`) | `itemsShownRef = new Map()` por montagem (`nivelamento.tsx:89`) | ver C1 | `placement.test.ts`, `store-placement-actions.test.ts`, `placement.spec.ts` |
| 7 | Aplicar priors + invalidar | efeito `nivelamento.tsx:126-155`, **só** no ramo "em andamento e seletor sem item" → `applyPlacement` → `finishPlacement` → `invalidateJourneyPlan` | substitui `skillModel`; esvazia `committed`/`upcoming` | — | **não roda** no término normal (C1) | nenhum que detecte |
| 8 | Resultado | `PlacementResultView` (`nivelamento.tsx:264-300`): faixa textual por área do escopo | — | — | "Ir para a trilha" | `placement.spec.ts` (só "Pronto.") |
| 9 | Home | `/trilha` monta: (d) limpa sessão órfã; (e) `syncJourneyWithCompletions()` uma vez; efeito `ensurePlan(s, hoje, hoje, {forceReplan: focusMudou})` → `commitPlan` a cada mudança de `s` | `committed` (3), `upcoming` (5), `planVersion` | `buildTrail(s)` refeito a cada mudança de `s` (`trilha.tsx:94-98`) | `SessionCard` + `FocusLine` + `JourneyPath`; `?vista=mapa` → `LearningPath` | `journey.spec.ts`, `trail-*.spec.ts`, `trilha.spec.ts` |
| 10 | Iniciar atividade | `SessionCard` `<Link onClick={() => setActiveActivity(current)}>` (`:93`); `JourneyPath` idem (`:119`) → `hrefFor` → `navigationTargetFor` | `activeActivity = current` (**sem `itemIds`**) + evento `activity-started` | — | aula → `/learn/$id`; legado → `/redacao/$id`; resto → `/atividade/$id` | nenhum entra pelo CTA |
| 11a | Aula | `/learn/$lessonId` → `MicroLessonPlayer` → `useLearningSession` → `completeMicroLesson` | `completedLessons[id]`, XP por diferença de estrelas, `registrarAtividade` | pacote se aula gerada | volta à Home; sync (9e) move para histórico | `lesson-v2.spec.ts`, `microlicoes.spec.ts` |
| 11b | Legado | `/redacao/$licaoId` → `LessonPlayer` → `completeLesson` | `progress.lessons[id]` | — | idem | `lessons.spec.ts` |
| 11c | Dinâmica | `/atividade/$activityId` (`:49-103`): se `activeActivity.id === id` → **ramo retomada** com `ativa.itemIds ?? []`; senão, se `committed[0].id === id` → `carregarPacotesPara` → `selectItemsForActivity` → `setActiveActivity(comItens)` | `activeActivity` com `itemIds` | `carregarPacotesPara` (8 s) | `buildActivityLesson` com < 2 itens lança → `AtividadeFalhou` → `/trilha` (**loop**, C2) | `journey.spec.ts` entra por `page.goto` (ramo seleção) |
| 12 | Conclusão dinâmica | `MicroLessonPlayer onComplete` → `completeJourneyActivity(travada, c, t)` | XP (ledger `atividade:<id>`), bloco do dia, `history.push`, `sinceCheckpoint`, pop de `committed[0]`, limpa `activeActivity`, evento | — | `ensurePlan` no próximo render da Home repõe (recalcula as 3) | `journey.spec.ts` (histórico + ledger) |
| 13 | Resposta individual | player → `recordLearningAttempt` (sem dedupe por `attempt.id`, `store.ts:970-1010`) | `skillModel`, `recentAttempts` (500), `skillEvidence`, `reviewSchedule` | — | — | `record-learning-attempt.test.ts` |

### C.2 Variações

- **Novo com nivelamento:** 3→4→5→6→7 (falha C1)→8→9. Se passou pela Home antes, a Home continua com o plano pré-nivelamento; se não passou, o primeiro plano usa as 24 evidências diretas, sem priors das não medidas.
- **Novo sem nivelamento:** 4→5 (pular)→`/aha`→9. Priors por matéria (`bootstrap.priorPorMateria`, `source: prior-materia`).
- **Antigo (`onboardingVersion 1`) sem placement:** card em `/trilha`; se fizer, idem C1.
- **Placement concluído e não aplicado** (todos que terminaram pela última resposta): nada o repara hoje. Fase 3 trata.
- **Mapa (`?vista=mapa`):** `LearningPath` + `buildTrail`; conclusão por `completedLessons`/`progress.lessons`; desbloqueio sequencial (`isLessonUnlocked` para legado). Não passa pela jornada.
- **Praticar (`/study`):** `LESSON_SIZE = 2`, `pickQuestionsAdaptive`, `registrarResposta` (ledger `questao-geral:<id>`). Fora da jornada.
- **Flags desligadas** (`?debug=1` + `foca.flags`): Home = `LearningPath`; `/atividade` e `/nivelamento` redirecionam para `/trilha`. Dados preservados.

---

## D. Confirmed Bugs

Gravidade: **S1** bloqueia estudo ou mente sobre progresso; **S2** degrada adaptação/UX relevante; **S3** menor.

### B1 — Explicação transparente
- **Status:** corrigido anteriormente (`32` L620, 28/09) e **reconfirmado** [nav]. S2 se regredir.
- **Reprodução desta sessão:** `/learn/porcentagem-valor`, responder, Verificar; `getComputedStyle([role=status].sheet)`: claro `color(srgb 0.918 0.962 0.936)` (alfa 1), escuro `color(srgb 0.161 0.203 0.170)` (alfa 1), `opacity 1`, `position: sticky`, largura 390 (mobile) / 438 (desktop 1280). `elementsFromPoint` sobre a folha só devolve elementos da própria folha.
- **Não verificado nesta sessão:** variante "Não sei" (`.sheet` → `var(--color-cards)`), `/study`, `LessonPlayer` legado, os 7 formatos, explicação longa expandida.
- **Causa original:** `color-mix` sobre alias `--color-success` removido pelo Lightning CSS quando nenhuma classe o usa. Hoje os aliases aparecem no CSS compilado porque classes os usam — **proteção acidental**. Outros `color-mix(… var(--color-recompensa) …)` inline seguem o padrão frágil (`profile.tsx:248-249`, `premium.tsx:39-40`, `dashboard.tsx:217-218`); `SessionCard.tsx:50,76` usa `var(--color-mar)` inline.
- **Falta:** E2E que mede o **fundo computado da folha** (não a opacidade das alternativas) em 3 variantes × 2 temas × 3 fluxos; teste de build que falha se um `var(--color-*)` usado em `style`/`color-mix` não existir no CSS compilado.
- **Correção:** T-08.3, T-08.10.

### B2 — Conclui, ganha streak, próxima inacessível
- **Status:** **confirmado**, três causas independentes. A correção de 28/09 (`32` L621) resolveu só "aula/legado nunca sai de `committed`".
  1. **C2 (S1)** — atividade dinâmica iniciada pela Home nunca abre [nav]. Card **e** nó: `href=/atividade/atv-test-pratica`; após o clique a URL volta a `/trilha`, `activeActivity.id = atv-test-pratica`, `itemIds = undefined`, 0 radios. Todo clique seguinte repete (a rota cai sempre no ramo "retomada" com zero itens).
  2. **C4a (S1 para redação via jornada)** — [sim] `legacyCandidateForSkill("por:crase-regra-basica", …)` devolve `crase-01-a-regra-de-ouro` antes **e** depois de concluída (a conclusão vai para `progress.lessons`, que o candidato não lê). A sync move a atividade para o histórico; a próxima reposição recoloca a mesma lição.
  3. **C4b (S2, [cód])** — aula **gerada** concluída não conta no planner (`planner.ts:200-204` usa `lessonForSkill`, só autorais). Se a aula não gerou `nEff > 0`, a habilidade segue `NOVA` e a mesma aula volta; pré-requisito cuja aula é gerada só se satisfaz por M ≥ 60 e C ≥ 30.
- **Streak avança** em todos os casos (`registrarAtividade` roda na conclusão) — daí "ganhei streak e nada andou".
- **Arquivos:** `SessionCard.tsx:93`, `JourneyPath.tsx:119`, `atividade.$activityId.tsx:61-99,138`, `candidates.ts:55-58,141-159`, `planner.ts:200-204`, `store.ts:1482-1506`.
- **Teste que falta:** E2E pelo **CTA** e pelo **nó** para cada família (aula embarcada, aula de pacote, legado, prática, revisão, desafio, checkpoint, reforço com e sem aula) terminando em "Home oferece outra atividade válida".
- **Correção:** T-02.1…T-02.7.

### B3 = C1 — Nivelamento não muda a trilha
- **Status:** **confirmado** [nav]. S1.
- **Reprodução:** storage sintético onboarded, escuro, 390×844, flags padrão. `/trilha` → `committed = [atv-2026-09-28-3616336216, …-4204321288, …-2282652181]`; `/nivelamento` → 24 respostas (primeira alternativa); no resultado `placement.status "concluido"`, `committed` idêntica, `skillModel` = `{evidencia: 24}` (zero `prior-nivelamento`); "Ir para a trilha" → `committed` idêntica.
- **Causa:** `submitPlacementResponse` fecha o status (`store.ts:1176-1186`); a rota deriva `emAndamento = status !== "concluido"` (`nivelamento.tsx:117`); o efeito sai em `if (!emAndamento || !escolha) return` (`:136`); `applyPlacement`/`finishPlacement`/`invalidateJourneyPlan` só existem no ramo "em andamento sem próximo item" (`:143-153`), que só ocorre quando o **pool** acaba antes do teto.
- **Agravante 1 (C3):** mesmo quando o ramo roda, `itemsShownRef` só tem os itens da montagem atual.
- **Agravante 2 ([cód]+dados):** os 755 itens de pacote têm `irt = {a:1, b:0, c:0.2, source:"estimado"}` (default de `scripts/content/publish.ts:102`; oficiais idem em `import-official-items.ts` L116-138). Informação de Fisher idêntica em todo item → a seleção "por informação" degenera em hash + balanceamento; θ̂ reflete só a proporção de acertos contra itens de b = 0. O CAT funciona, mas não se adapta em dificuldade. O mesmo vale para `selectItems` por `targetP` nas atividades.
- **Agravante 3 ([cód]):** mesmo aplicados, priors têm `nEff 0` → a habilidade segue `NOVA` com `necessidade` fixa 0,8 (`scoring.ts:52-53`) → **o prior não muda a ordem**. Só as ≤ 24 habilidades medidas diretamente mudam de estado.
- **Teste que falta:** E2E fila pré-existente → CAT completo → `placement.appliedAt` presente, entradas `prior-nivelamento` presentes, fila diferente com motivo coerente; unitário com dois perfis controlados.
- **Correção:** T-03.1…T-03.6, T-04.1, T-04.2.

### B4 — Véu esbranquiçado em dark mode
- **Status:** corrigido anteriormente (`32` L623) e **reconfirmado** [nav]: scrim `oklab(0 0 0 / 0.4)` nos dois temas; painel `rgb(38,37,35)` no escuro, `#fff` no claro. S3.
- **Achado novo relacionado [nav] (S2, a11y):** com "Sair da lição?" aberta, 4× Tab leva o foco a `BUTTON "Sair da lição"` **atrás** do diálogo. `BottomSheet` também não devolve foco ao disparador, não trava scroll do fundo, não torna o fundo inerte (grep sem `inert`/`createPortal`/`body.style`).
- **Correção:** T-08.4 (token `--scrim`), T-08.5 (a11y do diálogo).

### C3 — Retomada do CAT perde contexto
- **Status:** **confirmado** no motor [sim] + caminho de código [cód]; não reproduzido no navegador.
- **Reprodução:** pool sintético de 12 itens (a 1,2; b −1,5…+1,8; c 0,2), `seed-fixa`, respostas alternadas. Contínuo, após 6 respostas: θ̂ −0,663 / SE 0,769. Com o mapa recriado vazio antes da 4ª resposta: −0,815 / 0,839. Mesmos itens escolhidos; só a estimativa diverge.
- **Causa:** `recordPlacementResponse` descarta em silêncio respostas cujo item não está em `itemsById` (`placement.ts:193-198`); a rota recria o mapa vazio (`nivelamento.tsx:89`); `applyPlacement` agrupa por matéria pelo mesmo mapa (`placement-pool.ts:69-76`).
- **Correção:** T-03.2.

### C4 — Divergências de fonte de conclusão

| Sub | Status | Grav. | Evidência | Tarefa |
|---|---|---|---|---|
| a. legado lê fonte errada | confirmado [sim] | S1 | acima | T-02.4 |
| b. aula gerada não conta no planner | confirmado [cód]; ocorrência depende de `nEff` | S2 | `planner.ts:200-204` vs `candidates.ts:41-46` | T-02.4 |
| c. sync por mera existência (reforço de aula já concluída vira "feito" ao voltar sem estudar) | confirmado [cód] | S2 | `store.ts:1486-1487` | T-02.3 |
| d. idempotência só no XP (histórico, `sinceCheckpoint`, bloco do dia, evento duplicam) | confirmado [cód]; única proteção é `completingRef` por montagem (`useLearningSession.ts:311-313`) | S2 | `store.ts:1430-1449` | T-02.5 |
| e. colisão de id `atv-<dia>-hash(dia:skill:posição)` com atividade já concluída no mesmo dia → ledger não paga a 2ª | provável [cód] | S2 | `planner.ts:282` | T-02.6 |
| f. reposição recalcula as 3 comprometidas | confirmado [cód] | S2 | `journey.ts:43-51` (contraria `30` §11.5 L654) | T-02.7 |

### C5 — Persistência local
- `setState` ignora o retorno de `persist()` (`store.ts:457-462`) — confirmado [cód]; nenhuma UI avisa. S2.
- Sem listener `storage` — confirmado (grep). Duas abas: a última escrita apaga a outra. S3.
- JSON inválido: roda com `defaultState` sem avisar; a primeira mutação **sobrescreve** o bruto (backup write-once só existe se gravado antes). S2.
- Versão futura: `load` não persiste, mas o primeiro `setState` grava com `schemaVersion` futuro e a forma de `learning` desta versão — pode descartar campos da versão futura (rollback de código). S3.
- **Correção:** T-05.1…T-05.3.

### C6 — Pendências do `32`, reavaliadas

| Pendência | Evidência atual | Decisão |
|---|---|---|
| G7 `recalibrar` sem integração | só `checkpoint.ts:201-213` + teste | integrar (T-04.4) |
| G4 mix dominado por NOVA | `BONUS_DEFICIT 0,25 × déficit ≤ 0,2` = ≤ 0,05 contra necessidade 0,8 | cota mínima de revisão (T-04.3) |
| Modo B `finalAnswer` | **resolvido no código**: `run-stage.ts:531-538` grava `finalAnswer` em `correta`; conferência de 1.045 candidatos: os 13 casos em que o juiz corrigiu estão certos. O bug que sobrou é outro: o fix `rotulaAfirmacoes` (`32` L365) **não está no repo** | fechar a pendência no `32`; portar `rotulaAfirmacoes` (T-07.6) |
| 1.204 legados sem classificação fina | `meta/trilhas.ts`: dificuldade 2, b −0,8, `reviewer: autoria-legada-nivel-capitulo` | não entram no pool diagnóstico (status não elegível — já é assim); revisão item a item fora deste plano, com critério em §G.6 |
| Lacunas de cobertura | 9 habilidades sem aula, 6 com 2–3 itens de revisão (`32` L393-397) | re-medir em T-07.1; expansão exige geração → fora deste plano |
| Áudio/háptico, checklist F15.3, tutor offline, a11y formal | nunca executados | a11y formal entra (T-08.9); tutor offline entra (T-05.5); hardware/áudio/leitor de tela = verificação manual separada (§L.4) |

### C7 — Outras hipóteses auditadas

| Hipótese | Resultado | Tarefa |
|---|---|---|
| Manifest com falha fica em cache para sempre | confirmado [cód] `repository.ts:36-49` (promessa resolve `null` e é guardada) | T-05.4 |
| Pacote sem dedupe em voo | confirmado [cód] (só o manifest é deduplicado) | T-05.4 |
| Checkpoint compara `completedAt` UTC com `lastCheckpointDate` local | confirmado [cód] `adaptive/index.ts:65` — erro perto da meia-noite em UTC−3 | T-04.4 |
| `selectItemsForActivity` ignora o tamanho planejado (`n = itemIds?.length \|\| 4`) e devolve `[]` sem `targetP` | confirmado [cód] `adaptive/index.ts:69-73` | T-02.1 |
| "Só hoje" expira com app aberto | [hip] `focusSession` só é podado no `load` | T-02.8 |
| Foco mudado fora da Home (`/profile` → `FocusSheet`) não força replano | [cód] `lastFocusSignatureRef` começa `null` a cada montagem de `/trilha` → a mudança feita em `/profile` nunca é vista como "mudou" | T-02.8 |
| `submitPlacementResponse` sem guarda contra duplo envio ou envio após concluir | confirmado [cód] `store.ts:1150-1156` | T-03.1 |
| `recordLearningAttempt` sem dedupe por `attempt.id` | confirmado [cód] | T-02.5 |
| `publish.ts` apaga `lessons` ao republicar num arquivo com aulas (grava só `{subjectId, items}`) | confirmado [cód] `publish.ts:327` | T-07.6 |
| `metaFromRef` marca item oficial como `ia-validada` | confirmado [cód] `content/items/index.ts:40-54` | T-07.5 |
| Atribuição oficial não aparece em `FeedbackSheet`; `source.ref` não aparece em lugar nenhum | confirmado [cód]; aparece em `QuestionStepView.tsx:85` e `Interpret.tsx:15-16` | T-07.5 |
| Aviso de hidratação no `PhoneFrame` (`md:border-x`) | [reg] `32` L522 | T-08.1 |
| `aha.tsx:47` usa `FocaMark variant="line-dark"` fixo também no tema escuro | confirmado [cód] | T-08.6 |
| Busca de curso sensível a acento; perfil não permite editar curso apesar de "dá pra mudar depois" | confirmado [cód] `quiz.tsx:322,331`; `profile.tsx` sem campo | T-09.* |
| Projeto Playwright `chromium` roda em **1280×720** (o spread de `devices["Desktop Chrome"]` sobrescreve o `use.viewport` 390×844) | confirmado [cód] `playwright.config.ts:20,23` | T-01.4 |
| `journey.spec.ts` resemeia o storage em toda navegação completa (`addInitScript` incondicional) | confirmado [cód] | T-01.4 |
| `tests/unit/build-packs.test.ts` escreve fixture em `src/content/banco/__teste_build_packs__` real e roda o script real (suja `itens-gerados.ts` durante o teste) | confirmado (auditoria) | T-07.6 |
| Bump de `ALGO_VERSION` apaga o efeito do nivelamento (replay só de `recentAttempts`) | confirmado [cód] `store.ts:298-320`, `bootstrap.ts:108-112` | T-04.1 |

---

## E. Additional Problems Found

**Dívidas técnicas (causa de bugs):**
- E1. Duas ações separadas (`finishPlacement` + `invalidateJourneyPlan`) em sequência — interrupção entre elas deixa estado intermediário. Fase 3 consolida numa transação.
- E2. `structuredClone` do estado inteiro em **cada** `setState`; `buildTrail(s)` refeito a cada mudança de `s` em `/trilha`. Não medido como lento; T-05.6 mede antes de otimizar.
- E3. `store-bundle-boundary.test.ts` não proíbe `@/lib/adaptive/journey|index|placement-pool` apesar dos comentários. T-01.3.
- E4. `recalibrar`, `calibrarB` (`irt.ts:64-76`) e `getAudioDiagnostics` existem sem consumidor. Só `recalibrar` entra neste plano.
- E5. Comentários desatualizados em `placement-pool.ts:9-16` ("zero itens diagnóstico") e `incidence: 2` fixo com `TODO(Fase 11)` (`:40`). T-03.6.

**Qualidade de conteúdo (auditoria por script descartável sobre todos os JSON de `src/content/banco/`):**
- E6. **Pista de tamanho sistemática:** a correta é estritamente a mais longa em 391/737 itens gerados (53,1 %; acaso ≈ 25 %) — concentrada em Humanas/Linguagens (soc 43/46, red 21/24, ing 24/26, geo 52/57, his 51/56, lit 29/34), limpa em números (mat 11/193, fis 2/48, qui 5/44). Oficiais: 2/18. Razão correta/maior incorreta: p50 1,04, p90 2,09, p95 2,48, p99 3,52; ≥ 1,5× em 202, ≥ 2× em 89, ≥ 3× em 19. Legado de trilhas: 229/335 MC (68 %).
- E7. **Absolutismos como pista:** 189 de 2.211 incorretas com nunca/sempre/apenas/todas vs 11 de 737 corretas.
- E8. **Posição:** equilibrada (A 198, B 187, C 191, D 177, E 2) por `balancearPosicaoGabarito`. Não é problema.
- E9. **Duplicatas:** 0 exatas; 6 pares com bigrama ≥ 0,4, todos templates de matemática. Warning informativo, não bloqueio.
- E10. Travessão em 21 alternativas de itens gerados (a varredura anterior só olhou enunciado/explicação).
- E11. **IRT:** b = 0 em todos (§D B3). `src/content/oficial/inep-parametros.json` tem **379** registros de 2023 (o README do diretório diz "5526 importados" — linhas do CSV, por caderno); nada em `src/` lê esse arquivo.
- E12. Escalas: microlições usam b {1:−1,6, 2:0, 3:0,8} (`meta/microlicoes.ts:31`) sobre a escala 1–3 da aula; `irtFromDifficulty` usa b {−1,6, −0,8, 0, 0,8, 1,6} sobre 1–5. Documentar (§G.2), não unificar.
- E13. Os 4 exemplos do `35` §7.1 estão confirmados como problemáticos (três com correta explicativa vs distratores-espantalho; `a655cd73` com pergunta no singular e resposta-lista de três estruturas, uma não membranosa). **Nenhum erro de gabarito.**

**Melhorias (não bugs):** diagnóstico visual (RU-10), desktop (RU-30), cursos (RU-40), copy de marca (K16).

**Comportamento intencional (não mexer):** `/study` com 2 questões; "Não sei" sem punição visual; tutor só manual; mapa por matéria como vista secundária; jornada "infinita" com card vazio + "Ver mapa" quando não há candidato; XP de replay = só diferença de faixa; posição do gabarito balanceada por hash.

---

## F. Target Behavior

### F.1 Teste do João (`14` §0)

João estuda no celular, no ônibus, com pouco tempo e pouca paciência para app que "não anda". Tudo aqui passa por três perguntas dele: **"Eu toco em Continuar e começo a estudar?"**, **"O que eu fiz mudou alguma coisa?"**, **"Posso confiar que o que eu fiz ficou salvo?"**. Desktop e cursos entram porque ele também usa o computador da escola e escolhe curso uma vez — não são o centro.

### F.2 Requisitos funcionais — fluxo e dados

| ID | Requisito | Critério verificável | Bugs | Tarefa |
|---|---|---|---|---|
| RF-1 | Toda atividade de `committed[0]` abre pelo CTA do card **e** pelo nó atual, em qualquer família, sem depender de URL direta | E2E: clicar CTA e nó → aula/legado mostram o 1º passo; dinâmica mostra ≥ 1 radio em ≤ 10 s | B2, C2 | T-02.1, T-02.2 |
| RF-2 | Estados de atividade definidos e únicos: **comprometida** (em `committed`, sem `startedAt`); **iniciada** (`activeActivity` com `startedAt`); **pronta para retomar** (iniciada **e** — se dinâmica — `itemIds.length ≥ 2`; se aula/legado — `lessonId`). A seleção de itens tem **um** proprietário: a rota `/atividade/$activityId` | unitário do estado; E2E reload no meio da atividade mantém os mesmos `itemIds` | C2 | T-02.1 |
| RF-3 | Atividade dinâmica sem itens suficientes (< 2) é **descartada** do topo, sem XP, sem histórico, com evento `activity-skipped`; a Home repõe e mostra aviso de uma linha. Nunca loop Home→atividade→Home | E2E com pool vazio: 1 aviso, próxima atividade diferente | C2 | T-02.2 |
| RF-4 | Conclusão só conta se aconteceu **depois** do início da atividade (`completedAt ≥ startedAt`); atividade iniciada antes deste plano (sem `startedAt`) mantém a regra antiga | unitário: reforço de aula já concluída + voltar sem estudar → continua em `committed` | C4c | T-02.3 |
| RF-5 | Conclusão de lição legada é lida de `progress.lessons`; conclusão de aula (autoral **ou** gerada) de `learning.completedLessons`, em **todos** os leitores (candidato, classificação, pré-requisito, sync, fallback) | unitário: concluir 1ª lição legada → candidato devolve a 2ª; aula gerada concluída → não reaparece como `aula` | B2, C4a, C4b | T-02.4 |
| RF-6 | Concluir a mesma tentativa duas vezes (clique duplo, re-render, remontagem, reload na tela de resultado) não duplica XP, bloco do dia, histórico, `sinceCheckpoint`, evento nem tentativa de resposta | unitário chamando 2× cada ação; E2E reload na celebração | C4d | T-02.5 |
| RF-7 | Id de atividade não colide com atividade já concluída (inclui um contador monotônico da jornada) | unitário: completar, replanejar no mesmo dia com a mesma habilidade na posição 0 → id diferente, XP pago | C4e | T-02.6 |
| RF-8 | Repor a fila preenche **só** as vagas: comprometidas ainda válidas ficam na mesma ordem; a atividade iniciada nunca sai do topo por replano. Exceções que substituem tudo (menos a iniciada): aplicação do nivelamento, mudança de foco, `PLANNER_VERSION` nova, comprometida inválida | unitário por exceção; E2E card não muda após voltar da aula exceto a vaga concluída | C4f | T-02.7 |
| RF-9 | Mudança de foco feita fora da Home força replano na próxima montagem da Home; foco "só hoje" expirado some sem recarregar o app | unitário + E2E `/profile` → `/trilha` | C7 | T-02.8 |
| RF-10 | Terminar o nivelamento **por qualquer caminho** (última resposta, teto de área, orçamento, pool insuficiente) aplica priors **uma vez**, grava `placement.appliedAt`, invalida a fila preservando a iniciada, e isso sobrevive a reload a qualquer momento | E2E CAT completo; unitário de cada caminho; unitário de interrupção entre "concluído" e "aplicado" | C1, B3 | T-03.1, T-03.3 |
| RF-11 | Conta com placement `concluido` sem `appliedAt` (todas as que terminaram desde 28/09) é reparada automaticamente na próxima abertura de `/trilha` ou `/nivelamento`, sem apagar evidência | unitário/E2E com storage "concluído não aplicado" | C1 | T-03.3 |
| RF-12 | Retomar o nivelamento depois de reload produz o **mesmo** θ̂/SE que a execução contínua para a mesma sequência | unitário (motor + reconstituição) | C3 | T-03.2 |
| RF-13 | Refazer o nivelamento não apaga evidência medida antes (`source: evidencia`) e substitui só priors | unitário | — | T-03.4 |
| RF-14 | Falha de gravação no `localStorage` nunca é anunciada como salvo: o app mostra aviso persistente e oferece "Tentar de novo" | unitário do store; E2E com `setItem` sabotado | C5 | T-05.1 |
| RF-15 | Duas abas: a aba em segundo plano adota o estado gravado pela outra (evento `storage`) antes da próxima mutação; nunca sobrescreve progresso mais novo | unitário com evento sintético; E2E 2 páginas no mesmo contexto | C5 | T-05.2 |
| RF-16 | JSON inválido no storage: o bruto é copiado para `foca.state.corrupt.<ISO>` **antes** de qualquer escrita; o aluno vê aviso uma vez | unitário | C5 | T-05.3 |
| RF-17 | Manifest/pacote com falha pode ser tentado de novo na mesma sessão; pacote não é baixado 2× em paralelo | unitário `content-repository.test.ts` | C7 | T-05.4 |
| RF-18 | Tutor com rede bloqueada não trava estudo nem correção | E2E com `page.route('**/_serverFn/**', abort)` | G13 | T-05.5 |

### F.3 Requisitos pedagógicos

| ID | Requisito | Critério | Tarefa |
|---|---|---|---|
| RP-1 | Priors do nivelamento mudam a **ordem** entre habilidades NOVA: dentro de uma área medida, a mais fraca vem antes; nenhuma pula a aula por prior (aula opcional continua exigindo evidência, `30` §10.5) | unitário: dois perfis controlados (mesmo foco/seed/data) produzem primeiras 3 atividades diferentes, e a diferença favorece a área de θ̂ menor | T-04.2 |
| RP-2 | Parâmetros IRT dos itens de pacote refletem a dificuldade editorial (`irtFromDifficulty`), com proveniência `source: "estimado"`; nenhum item com `b = 0` por default de publicação | teste de catálogo: distribuição de `b` por dificuldade = mapa de `irt.ts`; nenhum `a=1,b=0,c=0.2` restante fora de d3 com 4 opções | T-04.2 |
| RP-3 | Mix: com revisão devida disponível, cada janela de 10 tem ≥ 2 revisões (≥ 3 se atrasada > 3 dias, teto 35 %); desafio ≤ 2 em 10; sem revisão devida, 100 % "atual" é correto e documentado | simulação `sim-engine` com 4 perfis (iniciante, backlog, estabelecido atrasado, alto M baixa C) | T-04.3 |
| RP-4 | Checkpoint concluído recalibra: superestimadas → revisão antecipada para amanhã; subestimadas → elegíveis a desafio no próximo plano (sinal expira em 7 dias) | unitário + E2E checkpoint | T-04.4 |
| RP-5 | Nenhuma mudança de fórmula/constante do **modelo** (Mastery/Confidence). `ALGO_VERSION` continua 1. Mudanças de **plano** usam `PLANNER_VERSION` | teste: `ALGO_VERSION === 1`; `planVersion` antigo → 1 replano | T-04.1 |
| RP-6 | Resultado do nivelamento só mostra o que foi medido: faixa por área medida, precisão pela SE, nenhuma nota, porcentagem, ranking ou "nível N" | E2E: nenhum `/\d+ ?%/`, `/nível \d/i`, `/nota/i` na tela | T-06.1 |
| RP-7 | Itens com pista forte de forma (tamanho, absolutismo, travessão) são revisados por estrato com decisão registrada por id; nenhum gabarito muda sem solução independente | relatório `content-pipeline/relatorios/qualidade-2026-09/` com 1 decisão por id revisado | T-07.3, T-07.4 |
| RP-8 | Validador acusa pista de forma como **warning** (não bloqueio) com severidade e exceção registrável | testes positivos/negativos/falsos positivos em `pipeline-validate.test.ts` | T-07.2 |
| RP-9 | Proveniência honesta da revisão: cada item diz **como** foi revisado (`reviewKind`) sem mudar `status` nem elegibilidade | teste de catálogo: 737 com `reviewKind: "ia-delegada"`, 18 `oficial-conferida` com `reviewKind: "gabarito-oficial"` | T-07.5 |
| RP-10 | Atribuição oficial (ano + prova) visível em todo consumidor que mostra item oficial: aula, atividade, nivelamento, checkpoint, revisão; e na folha de feedback | E2E com item oficial em atividade | T-07.5 |

### F.4 Requisitos de UX e copy

Voz de `20` §7.1 (colega direto, sem culpa, sem exclamação em série, botão 1–4 palavras). Strings novas vão para `src/lib/copy.ts` e para o inventário `21`. A Foca aparece só onde `15` §4 já permite.

| ID | Requisito | Copy proposta (final, pode ser ajustada só por `humanizer` sem mudar sentido) | Tarefa |
|---|---|---|---|
| RU-1 | Atividade descartada por falta de questões | "Essa atividade ficou sem questões agora. Segui com a próxima." | T-02.2 |
| RU-2 | Carregando atividade (> 400 ms) | "Separando suas questões…" (texto, sem spinner infinito; após 10 s vira RU-3) | T-02.2 |
| RU-3 | Pacote indisponível | Título "Não deu pra carregar agora." Corpo "Confere a internet e tenta de novo." Botões "Tentar de novo" (primário) / "Voltar à trilha" | T-02.2, T-05.4 |
| RU-4 | Falha ao salvar | Faixa fixa no topo do `AppShell`: "Não consegui salvar neste aparelho. O que você fez agora pode se perder se fechar o app." Botão "Tentar de novo" | T-05.1 |
| RU-5 | Storage corrompido recuperado | Uma vez: "Não consegui ler seu progresso salvo. Guardei uma cópia e comecei do zero neste aparelho." | T-05.3 |
| RU-6 | Dados de versão mais nova do app | "Seus dados são de uma versão mais nova do app. Recarregue a página para atualizar. Até lá, nada do que você fizer aqui fica salvo." | T-05.1 |
| RU-10 | Resultado do nivelamento (substitui `PlacementResultView`) | ver §F.5 | T-06.1 |
| RU-11 | Aplicando nivelamento (≤ 1 s típico) | "Montando sua trilha…" | T-03.3 |
| RU-12 | Card da Home explica **por que** a atividade (`activityReasonText`) e o próximo passo ("Depois: {título da 2ª}") | "Depois: {título}" em `text-xs text-nevoa` | T-06.2 |
| RU-20 | `BRAND.tagline`/`description` sem "60 segundos"/"te cobra" | tagline "Estudo curto, todo dia." · description "Preparação para o ENEM em aulas curtas. A Foca acompanha o que você já sabe e escolhe o próximo passo." | T-08.7 |
| RU-30 | Layout desktop | §F.6 | T-08.1, T-08.2 |
| RU-40 | Seleção de curso | §F.7 | T-09.* |

### F.5 Resultado do nivelamento (RU-10) — contrato de tela

Hierarquia (de cima para baixo, uma coluna, um CTA primário):
1. `h1` **"Pronto. Sua trilha foi ajustada."** (mantém "Pronto." no início — os E2E atuais esperam esse texto).
2. Corpo: "Isso é um ponto de partida, não uma nota. Muda conforme você estuda."
3. Um card por área **do escopo**, na ordem do escopo:
   - Nome da área (`AREA_NAMES`), `text-sm font-bold`.
   - **Área medida** (θ̂ ≠ null): indicador de 3 segmentos horizontais iguais rotulados, da esquerda para a direita, "Base em construção" · "No caminho" · "Base firme" (limiares atuais de `faixaDaArea`: θ̂ < −0,5; < 0,7; ≥ 0,7). Segmento ativo `bg-mar`, demais `bg-gelo`; o rótulo do ativo em texto ao lado (cor nunca é o único sinal). Elemento com `role="img"` e `aria-label="{Área}: {faixa}. {precisão}."`.
   - Linha de precisão pela **SE da área** (não é Confidence de habilidade): SE ≤ 0,45 → "Estimativa firme"; 0,45 < SE ≤ 0,70 → "Estimativa inicial"; SE > 0,70 → "Poucas questões. Vamos confirmar estudando." + "{n} questões".
   - **Área não medida** (θ̂ null — pool insuficiente, fora do escopo por foco, ou abandonada antes): sem indicador, texto `COPY.nivelamento.areaNaoMedida(área)` já existente.
4. **"Por onde começamos"** (só se houver dado): primeira atividade de `committed` depois da aplicação — "Sua primeira atividade: {activityTitle}" + `activityReasonText`. Se a jornada estiver desligada ou `committed` vazio, a seção não aparece.
5. CTA primário "Começar" → navega para o alvo de `committed[0]` usando o **mesmo** caminho do card (RF-1). Sem CTA secundário.

Estados: *aplicando* (RU-11, antes de `appliedAt`); *sem respostas* (todas as áreas não medidas → corpo troca para "Não tivemos questões suficientes para medir agora. Sua trilha começa pelo básico e se ajusta enquanto você estuda."); *parcial/abandonado* (só aparece se o aluno pedir "Ver resultado" depois de pausar — fora de escopo; abandono continua voltando para retomar); *refeito* (igual ao normal; a evidência antiga não aparece).

Não mostrar: porcentagem, θ, SE numérica, nota prevista, comparação com outros, habilidades individuais.

### F.6 Layout responsivo (RU-30) — contrato

Tokens novos em `src/styles.css` `:root` (não dependem de tema):

| Token | < 768 px | 768–1023 px | ≥ 1024 px |
|---|---|---|---|
| `--app-col` (coluna das telas com `AppShell` e `PhoneFrame`) | 440px | 560px | 600px |
| `--reading-col` (players imersivos: aula, legado, atividade, nivelamento, quiz) | 440px | 560px | 640px |
| `--path-col` (caminho zigue-zague `JourneyPath`/`LearningPath`) | 440px | 440px | 440px |
| `--nav-rail` | 0 | 0 | 96px |

Regras:
- **< 768 px: nada muda visualmente** (valores iguais aos de hoje). Isso é o gate de regressão do mobile.
- `PhoneFrame`: `max-w-[var(--app-col)]` (players passam `variant="reading"` → `--reading-col`). Borda lateral `gelo` em ≥ 768 px via CSS (media query no `@utility`, não classe condicional em JS).
- **≥ 1024 px:** `BottomNav` some (`lg:hidden`) e aparece `NavRail` (**NOVO**): coluna fixa à esquerda, largura `--nav-rail`, os mesmos 4 itens (`NAV_ITEMS_V2`, ou V1 com a flag desligada), ícone + rótulo, `aria-label="Principal"`, `aria-current="page"`. A coluna de conteúdo centraliza no espaço à direita do rail (`lg:pl-[var(--nav-rail)]` no wrapper). `main` troca `pb-32` por `lg:pb-12`.
- Elementos fixos ancorados à coluna usam o token, nunca `13.75rem`: `calc(50% - var(--app-col) / 2 + 1rem)` (FAB do tutor, `JumpToFocusButton`); em ≥ 1024 somar metade do rail. O `bottom-24` do FAB vira `bottom-24 lg:bottom-8`.
- Rodapés fixos (`quiz.tsx:122`, `aha.tsx:130`) e `BottomNav`: `max-w-[var(--app-col)]`.
- `BottomSheet` e painel do tutor: `max-w-[var(--app-col)]` (ou `--reading-col` quando abertos num player), ancorados embaixo em todas as larguras. Sem variante de modal central — um componente só.
- Caminho da trilha: container `max-w-[var(--path-col)] mx-auto` dentro da coluna (o layout em zigue-zague de `path-layout.ts` é calibrado para 440; alargar exigiria refazer a geometria — fora de escopo).
- Leitura: enunciado e ensino limitados a `max-w-[65ch]` dentro de `--reading-col`.
- Teclado/hover: `NavRail` com foco visível; `:hover` só adiciona realce de fundo (`bg-gelo/60`) em itens de nav e cards clicáveis — nunca muda layout.
- Zoom 200 % em 1280 px equivale a 640 px CSS → cai no layout < 768 (mobile), que já é o testado.

### F.7 Seleção de curso (RU-40) — contrato

- **Catálogo** (`src/data/courses.ts`): `CourseDef { id: string; name: string; group: CourseGroupId; synonyms: string[] }`. `name` dos 59 cursos atuais **não muda** (compatibilidade de `prefs.targetCourse`). 13 grupos, nesta ordem de exibição: Saúde · Engenharias · Computação e Tecnologia · Exatas · Biológicas e Natureza · Agrárias e Ambientais · Humanas · Sociais Aplicadas e Direito · Comunicação · Negócios e Gestão · Educação e Licenciaturas · Artes · Arquitetura e Design.
- Redistribuição dos 59 atuais: **Saúde** Medicina, Enfermagem, Odontologia, Farmácia, Fisioterapia, Nutrição, Psicologia, Biomedicina, Veterinária, Educação Física · **Engenharias** as 8 "Engenharia …" · **Computação e Tecnologia** Ciência da Computação, Ciência de Dados, Sistemas de Informação · **Exatas** Matemática, Física, Estatística, Química · **Biológicas e Natureza** Biologia, Geologia, Oceanografia · **Agrárias e Ambientais** Agronomia, Zootecnia, Ciências Ambientais · **Humanas** História, Geografia, Letras, Filosofia, Sociologia · **Sociais Aplicadas e Direito** Direito, Relações Internacionais, Serviço Social, Ciências Políticas · **Comunicação** Jornalismo, Publicidade e Propaganda, Cinema e Audiovisual · **Negócios e Gestão** Administração, Economia, Ciências Contábeis, Negócios Internacionais, Empreendedorismo, Marketing, Gestão de Recursos Humanos, Logística · **Educação e Licenciaturas** Pedagogia · **Artes** Artes Visuais, Música, Teatro, Moda · **Arquitetura e Design** Arquitetura e Urbanismo, Design Gráfico, Design de Produto.
- Acréscimos (23 → total 82), com grupo: **Saúde** Fonoaudiologia, Terapia Ocupacional, Radiologia · **Engenharias** Engenharia de Software, Engenharia Biomédica, Engenharia de Alimentos, Engenharia Florestal · **Computação e Tecnologia** Análise e Desenvolvimento de Sistemas, Segurança da Informação, Jogos Digitais · **Biológicas e Natureza** Ciências Biológicas · **Humanas** Antropologia, Arqueologia · **Sociais Aplicadas e Direito** Turismo, Biblioteconomia, Gestão Pública · **Comunicação** Relações Públicas, Produção Multimídia · **Educação e Licenciaturas** Licenciatura em Matemática, Educação Especial · **Artes** Dança, Gastronomia · **Arquitetura e Design** Design de Interiores. "Medicina Veterinária", "Design de Games", "Licenciatura em Letras" e "Licenciatura em Educação Física" **não** são cursos novos — entram como sinônimos (abaixo).
- Sinônimos mínimos (busca): Medicina ["med"], Medicina Veterinária → Veterinária ["medicina veterinaria", "vet"], Ciência da Computação ["cc", "computacao", "programacao", "ti"], Sistemas de Informação ["si", "ti"], Análise e Desenvolvimento de Sistemas ["ads", "programacao"], Jogos Digitais ["games", "design de games"], Publicidade e Propaganda ["publicidade", "pp"], Relações Internacionais ["ri"], Educação Física ["ed fisica", "licenciatura em educacao fisica"], Letras ["portugues", "ingles", "licenciatura em letras"], Arquitetura e Urbanismo ["arquitetura"], Direito ["advocacia"], Psicologia ["psico"], Engenharia de Computação ["eng comp"], Administração ["adm"].
- **Busca**: normaliza entrada e alvo com `normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim()`; casa por `includes` no nome **ou** em qualquer sinônimo; ordena: começa-com antes de contém; sem limite de 12 quando há busca (lista rola).
- **Sem busca**: mostra os 13 grupos como chips (`chip`, `aria-pressed`); nenhum grupo selecionado → texto "Escolha uma área ou busque pelo nome." e **nenhuma** lista (sem viés para o primeiro grupo); grupo selecionado → todos os cursos do grupo.
- **Nenhum resultado**: "Não achei esse curso." + botão "Usar “{texto}”" que grava o texto (≤ 60 caracteres, trim) como `targetCourse`.
- "Ainda não decidi" continua (valor literal existente, lido por `tutor-prompt.ts:72` e `aha.tsx:59`).
- Seleção mantém destaque durante a busca; teclado: input com `<label>` visível "Curso", resultados são `button type="button"`, Enter no input com exatamente 1 resultado seleciona.
- **Editar depois**: `/profile` ganha linha "Curso pretendido: {valor}" com botão "Mudar" que abre o mesmo componente numa `BottomSheet`.
- **Valor salvo desconhecido** (não está no catálogo e não é "Ainda não decidi"): mostrado como está; a busca abre vazia.
- Nunca usar curso para prever nota de corte ou inferir área de prova.

### F.8 Não objetivos

- Backend, conta real, sincronização entre dispositivos, PWA/manifest de instalação (não existe e não é pedido — o `manifest.json` de `public/content/v1` é índice de conteúdo).
- Arte nova de logo ou das 8 expressões (não existe asset novo; §G.8).
- Gerar conteúdo novo (lotes), importar outras bancas ou imagens de terceiros, importar parâmetros Inep para o modelo (exige ligação de escalas não validada — §G.3).
- Trocar o modelo Mastery/Confidence, a fórmula de Confidence ou as faixas de exibição.
- Previsão de nota ENEM, ranking real, analytics externo.
- Redesenhar a trilha em zigue-zague para larguras maiores.
- Tela própria de resultado de checkpoint (`CheckpointResult`, pendência do `32` L509) — o efeito da recalibração entra, a tela não.
- Revisão item a item dos 1.204 exercícios legados.
- Reformatar/lintar o repositório inteiro.

---

## G. Pedagogical Architecture

### G.1 O que é preservado

- Modelo de `30` §9–§10 inteiro: θ por habilidade com prior N(−0,7; 1,2), 3PL com escorregão 0,10, pesos por papel (diagnóstico 1,2; checagem de aula 0,5; assistida ×0,3; "Não sei" 0,8), Mastery = round(100·logistic(θ)), Confidence = Q·(0,4+0,6D)·R·T·S·I, faixas 0–24/25–49/50–74/≥75, "Dominado" = M ≥ 80 **e** C ≥ 75 **e** consistência, desafio exige M ≥ 75 e C ≥ 50, pré-requisito = aula concluída ou (M ≥ 60 e C ≥ 30), aula opcional = evidência com M ≥ 80 e C ≥ 60.
- Priors de nivelamento: `nEff 0`, Confidence 0, `source: prior-nivelamento`, σ = max(0,9; SE + 0,3). Não viram evidência.
- CAT (`30` §12.3): até 24 itens, 4–6 por área, EAP em grade −4…4 passo 0,2, top-3 por Fisher com hash da seed, parada por SE ≤ 0,45/teto/orçamento. **Não** ordenar o CAT de fácil a difícil.
- Ajuda antes de responder reduz independência; "Não sei" é sinal separado; evidência de uma habilidade não se espalha para a área (só prior por matéria, com `nEff 0`).
- Tempo sem estudar reduz Confidence (fator R), nunca Mastery — a UI não diz "você esqueceu".

### G.2 Três escalas de dificuldade (documentar, não unificar)

| Escala | Onde | Faixa | Uso | Relação |
|---|---|---|---|---|
| Editorial | `ItemMeta.difficulty` | 1–5 | seleção por papel (`minDifficulty`/`maxDifficulty`), promoção a diagnóstico por faixas | → `irtFromDifficulty` define `b` (após T-04.2) |
| Relativa à aula | `QuestionStep.difficulty` | 1–3 | validação de progressão da aula (`validateLessonSteps`: não-decrescente, começa em 1, termina ≥ 2) | derivada por `dificuldadeNaAula` (`aulas.ts:37-42`) a partir da editorial **e da posição** — por isso um rótulo 1→2→3 **não prova** aumento cognitivo |
| Modelo | `irt.a/b/c`, θ, `targetP` | contínua | CAT, `selectItems`, `predictedP` | `source` diz a proveniência: `estimado` (default ou por dificuldade), `inep` (parâmetro oficial), `calibrado-foca` (dados de resposta — não existe ainda) |

Não afirmar em lugar nenhum (UI, docs, pitch) que o sistema é "TRI validada": parâmetros são estimativas editoriais; nenhum item foi calibrado por dados de resposta.

### G.3 IRT dos itens (T-04.2)

- Itens de pacote com o default de publicação (`a=1, b=0, c=0.2, source "estimado"` e **sem** `calibratedFrom`) recebem `irtFromDifficulty(difficulty, nOpcoes)` (`src/content/items/irt.ts`): b ∈ {−1,6; −0,8; 0; 0,8; 1,6}, a = 1, c = 1/nOpções. `source` continua `"estimado"`. Aplicado **na fonte** (JSON em `src/content/banco/**`) por script novo e determinístico, e o default de `publish.ts:102` passa a chamar a mesma função — para não reintroduzir o problema.
- Oficiais (18) recebem o mesmo tratamento. Os parâmetros Inep de `inep-parametros.json` **não** são importados para o modelo: a escala Inep (θ da população ENEM) não foi ligada à escala do modelo (prior N(−0,7; 1,2)) e `calibrarB` nunca foi validado — misturar as duas faria os oficiais parecerem artificialmente difíceis. Registrado como decisão, não pendência.
- Efeito colateral aceito: θ̂ de nivelamentos já feitos foram estimados contra b = 0; não são recalculados (as respostas continuam salvas; o reparo de RF-11 usa o `irt` **atual** do catálogo ao aplicar priors — documentado no registro).

### G.4 Planejamento (T-04.1…T-04.4)

- **Versão:** `PLANNER_VERSION = 2` (novo, `adaptive/constants.ts`). `journey.planVersion` passa a ser comparado com `PLANNER_VERSION` em `ensurePlan` e gravado por `commitPlan`. `ALGO_VERSION` fica 1 e continua controlando só o replay do modelo. Motivo: bump de `ALGO_VERSION` dispara `bootstrapModel`, que reconstrói o modelo só de `recentAttempts` e **perderia as respostas do nivelamento** (que não viram `Attempt`). Proteção adicional: `bootstrapModel` passa a **mesclar** — entradas do modelo atual para habilidades que o replay não tocou são mantidas quando `source` é `evidencia` ou `prior-nivelamento` (só `prior-materia` é recalculado).
- **Necessidade de NOVA com prior de nivelamento** (`scoring.ts necessidade`): `source === "prior-nivelamento"` → `clamp(0,55 + 0,5 × (1 − m/100), 0,55, 0,95)` com m = Mastery do prior; demais NOVA mantêm 0,8. Ex.: θ −1,5 (m ≈ 18) → 0,95; θ 0 (m 50) → 0,80; θ 1,0 (m ≈ 73) → 0,685. Efeito: dentro das habilidades novas, as de área fraca sobem; área forte desce, mas nunca abaixo de 0,55 (continua aparecendo — sem salto de fundamento). Classificação e escolha de aula **não mudam**.
- **Mix (G4):** mantém `MIX_ALVO` 70/20/10 e `JANELA_MIX = 10`. Acrescenta uma **cota mínima** antes da ordenação por score: seja `r` = revisões na janela móvel (últimas 10 do histórico + plano parcial); se existe candidato `DEVIDA` e `r < ceil(alvoRevisao × 10) − 1` (alvo 0,2 → mínimo 1 a cada janela em qualquer ponto; com atraso > 3 dias alvo 0,35 → mínimo 3), a posição é preenchida pelo melhor candidato de revisão. Desafio: se já há 2 na janela, candidatos `desafio` são excluídos (restrição dura, já prevista em `30` §11.5). Tolerância de validação: janela de 10 com revisão devida disponível tem ≥ 2 revisões e ≤ 4; desafio ≤ 2. Sem revisão devida, 100 % "atual" é o comportamento esperado (iniciante).
- **Checkpoint (G7):** ao concluir um checkpoint, a rota `/atividade` calcula `recalibrar(respostas)` com `predictedP` das tentativas da sessão e chama a ação nova `applyCheckpointRecalibration({antecipar: skillIds, desafio: skillIds, at})`: `reviewSchedule[skill].dueDate = amanhã` (só antecipa; nunca adia) e `journey.challengeEligible[skill] = até` (7 dias). `candidateForSkill` em `FIRME` já produz desafio; para `EM_APRENDIZADO` com sinal de desafio válido e M ≥ 60, gera `desafio` com `minDifficulty 3` em vez de prática — no máximo 1 por plano. O checkpoint passa a filtrar histórico por `localDate` derivada (não `completedAt.slice(0,10)`).

### G.5 Proveniência da revisão (T-07.5)

Situação real (auditoria): `validation.reviewer` = "revisao-completa-7b (Sonnet, delegada pelo usuário) + amostra lida pelo orquestrador" em 583 itens; "amostra" em 154; "solucionador-independente" nos 18 oficiais. `status` = `revisada-humano` nos 737 porque o veredito 7b entrou como "aprova" (`publish.ts isPublishable`).

Decisão:
- **Não** renomear `ItemValidationStatus` nem trocar `status` (renomear despublicaria 737 itens do pool, que filtra por status, e reinterpretaria a autorização de `32` L349).
- Novo campo opcional `ItemValidation.reviewKind?: "humano" | "ia-delegada" | "gabarito-oficial" | "autoria-legada"`. Preenchido por script: `reviewer` contém "delegada" ou "amostra" → `"ia-delegada"`; `oficial-conferida` → `"gabarito-oficial"`; metas de trilhas legadas → `"autoria-legada"` (em código, `meta/trilhas.ts`). Ausente = desconhecido.
- `ItemValidation.reviewNote?: string` para o registro de decisões da Fase 7 (id do relatório).
- Elegibilidade diagnóstica **não muda** (status + papel). O `content-pipeline/README` e o `33` (pelo gerador) passam a dizer "revisada-humano = aprovada no portão de revisão; `reviewKind` diz quem revisou".
- `metaFromRef` deixa de fixar `ia-validada` e lê o `source` do ref.

### G.6 Rubrica editorial e estratégia do acervo (T-07.1…T-07.4)

**Rubrica** (cada item recebe as 8 marcas; "falha" em R1–R3 = bloqueante):

| # | Critério | Como verificar |
|---|---|---|
| R1 | Gabarito único e correto | solução independente pelo revisor antes de olhar o gabarito; divergência → escalar (2ª solução) |
| R2 | Explicação correta e coerente com o gabarito | leitura; números conferidos |
| R3 | Enunciado sem ambiguidade (número/gênero/escopo batem com a resposta) | leitura |
| R4 | Distratores plausíveis, cada um ligado a um erro conceitual real | nomear o erro de cada distrator |
| R5 | Paralelismo de forma (tamanho, detalhe, sintaxe) — sem pista de tamanho/absolutismo | métrica T-07.2 + leitura |
| R6 | Mede a habilidade etiquetada | comparar com `33` |
| R7 | Dificuldade editorial coerente com o raciocínio exigido (não com o tamanho do texto) | passos de solução |
| R8 | Português correto, carga de leitura proporcional, sem travessão/LaTeX | validador + leitura |

**Estratos e amostra** (acervo de pacote, 755):
1. **Risco alto — revisão completa (100 %)**: (a) razão de tamanho ≥ 2,0 (89); (b) correta estritamente a mais longa **e** ≥ 1 distrator com absolutismo (a medir; estimativa < 150); (c) travessão em alternativa (21); (d) os 4 exemplos do `35`; (e) todos os 178 com papel `diagnostico` (entram no nivelamento e no checkpoint — erro aqui contamina o modelo). União esperada ≈ 300 ids.
2. **Risco médio — amostra estratificada**: correta mais longa com razão 1,5–2,0 (≈ 113): 30 % por matéria, mínimo 5 por matéria; se a taxa de ação (qualquer ação ≠ manter) no lote ≥ 20 %, expandir para 100 % daquele estrato-matéria.
3. **Risco baixo**: o restante — amostra de 5 % por matéria (mínimo 3), mesma regra de expansão.
- Ordem: 1e (diagnóstico) → 1a → 1b/1c/1d → 2 → 3. Lotes de 25 ids por matéria.
- **Ações** (múltiplas por item): `manter`, `corrigir` (erro factual/gabarito — exige R1 com 2 soluções concordantes), `reclassificar` (dificuldade/habilidade), `melhorar-alternativas`, `melhorar-enunciado`, `revisar-explicacao`, `substituir` (item novo — **fora deste plano**, vira pedido de lote), `retirar` (sai de circulação).
- **Saída auditável**: `content-pipeline/relatorios/qualidade-2026-09/lote-NN.json` (**NOVO**) com, por id: `{id, arquivo, versaoAntes, versaoDepois, estrato, metricas, marcas: {R1..R8}, acoes[], motivo, revisor: "ia-delegada:sonnet", revisadoEm, afetaDiagnostico: bool}` + `resumo.md` por lote. O executor revisa lendo os JSON; a autorização de `32` L349 cobre essa revisão delegada — **não** pedir revisão humana ao usuário.
- **Compatibilidade**: item alterado incrementa `version` (a meta já tem `version`); `Attempt.exerciseVersion` preserva a tentativa antiga — o replay usa a meta atual (comportamento existente); nunca reescrever tentativa. Item `retirar`: mantém o JSON com `status` inalterado e `retired: true` (**campo novo opcional em `GeneratedItemRef`/JSON**); `itemDisponivel`/pools/`selectItems` excluem `retired`; `resolveExercise` continua resolvendo (histórico, sessão ativa e aulas que o referenciam não quebram). Aula gerada que referencia item retirado: o script de revisão lista e **troca** a referência por outro item da mesma habilidade/dificuldade não retirado; se não houver, registra e mantém.
- Mudança de ordem de alternativas: **proibida** nesta revisão (quebraria `presentedOrders` de sessões ativas e letras citadas na explicação). Reescrever texto de alternativa mantém o índice da correta.
- Oficiais: nunca alterar enunciado/alternativas; só metadados (dificuldade, habilidade). Se um oficial precisar de mudança de texto, `retirar`.
- Legado (1.204): fora da revisão item a item; recebem só a métrica de T-07.2 no relatório (informativo).

### G.7 Validadores (T-07.2) — sinais novos

Todos **warnings** (não bloqueiam publicação), com `severidade: "alta" | "media" | "info"` e exceção registrável por id em `content-pipeline/excecoes-qualidade.json` (**NOVO**, `{id, regra, motivo, registradoEm}`).

| Regra | Fórmula | Limiar inicial (justificativa: distribuição medida) | Severidade |
|---|---|---|---|
| `tamanho-correta-maior` | `len(correta) / max(len(incorretas))`, `len` = caracteres após trim e colapso de espaços | ≥ 2,0 (p90 = 2,09) | alta; 1,5–2,0 média (p75 aprox.) |
| `tamanho-correta-menor` | `len(correta) / min(len(incorretas))` | ≤ 0,4 (min observado 0,12; raro) | media |
| `dispersao-tamanhos` | coef. de variação dos comprimentos | > 0,6 | info |
| `absolutismo-distratores` | ≥ 2 incorretas contendo `\b(nunca|sempre|apenas|somente|todas?|todos|nenhum[a]?|jamais)\b` e a correta sem | — | media |
| `travessao-alternativa` | `—` ou `–` em alternativa | — | media (regra editorial) |
| `posicao-lote` | num lote, proporção de gabarito numa posição > 40 % (≥ 20 itens) | — | info |
| `quase-duplicata` | Jaccard de bigramas ≥ 0,4 com item da mesma habilidade (hoje só 5-gramas > 0,6 é bloqueio) | 0,4 | info |
| `explicacao-cita-alternativa-errada` | explicação menciona "letra X"/"alternativa X" ≠ gabarito | — | alta |

Testes com exemplos positivos (os ids do `35` §7.1), negativos (item de matemática com correta curta) e falsos positivos conhecidos (correta numérica longa legítima, ex. unidades) registrados como exceção.

### G.8 Marca e assets (T-08.6)

Inventário verificado: 6 PNGs originais 2000×2000 em `src/assets/branding/foca/` (color on-white/transparent; line-dark on-white/transparent; line-light on-black/transparent), derivados em `public/branding/foca/` gerados por `scripts/gerar-logos-foca.ps1` (todos do commit `4faf4d1`). As 8 expressões em `public/branding/foca/expressoes/*` são **a mesma arte neutra** (o script cai no fallback porque `src/assets/branding/foca/expressoes/` não existe). **Não existe logo mais recente** no repo, nos docs ou no histórico (o único outro material é `docs/design/brand/Flash Test - …html`, marca anterior). Dependência externa: arte final das expressões (`18` D5) — **não bloqueia** nenhuma fase; o plano só consolida o uso.

| Superfície | Componente | Asset atual | Canônico | Ação | Teste |
|---|---|---|---|---|---|
| favicon/ícones | `__root.tsx` head | `favicon.ico`, `icon-192`, `apple-touch-icon` | igual | manter | `audio-assets`-like check de 200 (T-08.10) |
| OG | `__root.tsx` | `og-image.png` + `BRAND.tagline` | igual; copy RU-20 | trocar copy | unitário `brand-voice.test.ts` |
| Splash `/` | `FocaMark` 144 float | `neutra-320` | igual | manter | — |
| welcome/login/forgot | `FocaMark`/`BrandMark` | `neutra-96/320` | igual | manter | — |
| `/aha` herói | `FocaMark variant="line-dark"` 280 | `foca-line-dark-720` (escuro sobre escuro no tema dark) | `line-light` no `.dark` | variante por tema via `<picture>`/CSS (`dark:hidden`/`hidden dark:block`) | E2E dark screenshot/contraste |
| tutor FAB/painel, feedback, celebração, sheets, trilha | `FocaMark` com `expression` | fallback neutro | igual | manter; `FocaMark` ganha `onError` → esconde a imagem (não quebra layout) | unitário render |
| 404/erro | `FocaMark` entediada | `neutra-320` | igual | manter | — |

Sem manifest PWA (não existe e não é criado).

---

## H. Data Model Changes

**Sem bump de `schemaVersion` (fica 6).** Justificativa: todos os campos abaixo são opcionais, têm default na leitura, e os parsers existentes preservam campos extras (`parseJourney` e `parsePlacement` devolvem o objeto original; `learning.events` é só fatiado). Código antigo (rollback) lê e **mantém** esses campos. Um bump para 7 faria o código atual tratar dados novos como "versão futura" num rollback (bootstrap desligado, gravação com forma desta versão) — risco maior que o benefício.

| Campo (arquivo do tipo) | Tipo | Default na leitura | Escritor | Leitores | Limite / idempotência | Rollback |
|---|---|---|---|---|---|---|
| `PlannedActivity.startedAt` (`adaptive/types.ts`) | `string` ISO | ausente = "atividade de antes do plano 36" | `startJourneyActivity` (store) | `syncJourneyWithCompletions`, `completeJourneyActivity`, rota `/atividade` | gravado uma vez por tentativa; reentrar na mesma atividade iniciada **não** reescreve | ignorado pelo código antigo |
| `PlannedActivity.itemIds` (existe) | `string[]` | — | **só** a rota `/atividade/$activityId` | player | ≥ 2 para "pronta" | — |
| `JourneyHistoryEntry.attemptKey` (`learning/types.ts`) | `string` = `${activityId}@${startedAt ?? "sem-inicio"}` | ausente em entradas antigas | `completeJourneyActivity`, `syncJourneyWithCompletions` | as mesmas (guarda) | única no histórico | ignorado |
| `JourneyHistoryEntry.localDate` | `YYYY-MM-DD` local | ausente → derivar de `completedAt` em fuso local | idem | `selectItemsForActivity` (checkpoint), mix | — | ignorado |
| `JourneyState.seq` | `number` | `history.length` | `completeJourneyActivity`, `syncJourneyWithCompletions`, `discardJourneyActivity` (+1 cada) | planner (id da atividade) | monotônico, nunca diminui | ignorado |
| `JourneyState.challengeEligible` | `Record<skillId, YYYY-MM-DD>` (validade) | `{}` | `applyCheckpointRecalibration` | `candidateForSkill` | expira na data; podado ao gravar | ignorado |
| `JourneyState.focusSignature` | `string` (`modo:materias:areas\|sessao`) | ausente → não força replano na 1ª vez | `commitPlan` | `/trilha` (detecta mudança de foco feita em qualquer tela) | — | ignorado |
| `PlacementState.appliedAt` (`learning/types.ts`) | `string \| null` | ausente = `null` | `applyPlacementOutcome` | `usePlacementReconciliation`, resultado | guarda de idempotência | código antigo não repara (comportamento de hoje) |
| `PlacementState.appliedVersion` | `number` (= `PLACEMENT_APPLY_VERSION = 1`) | ausente | idem | reconciliação | reaplicar se < versão atual (futuro) | ignorado |
| `ItemValidation.reviewKind` (`content/items/types.ts`) | `"humano" \| "ia-delegada" \| "gabarito-oficial" \| "autoria-legada"` | ausente = desconhecido | script `scripts/content/marcar-proveniencia.ts` (**NOVO**) nos JSON; `meta/trilhas.ts` em código | docs/relatórios, debug | — | ignorado |
| `ItemValidation.reviewNote` | `string` (id do lote de revisão) | ausente | revisão Fase 7 | auditoria | — | ignorado |
| item JSON `retired` + `GeneratedItemRef.retired` (`content/items/package.ts`) | `boolean` | `false` | revisão Fase 7 | `itemDisponivel`, pools, `selectItems`, `composeCheckpoint`, `aulas.ts` | item continua resolvível | código antigo volta a servir o item (aceitável: não quebra) |
| `irt` dos itens de pacote | `ItemIrt` | — | `scripts/content/recalibrar-irt-dificuldade.ts` (**NOVO**) | CAT, `selectItems`, `predictedP` | idempotente: só toca o default `{1,0,0.2,estimado}` sem `calibratedFrom` | reverter via Git do JSON |
| `PLANNER_VERSION` (`adaptive/constants.ts`) | `2` | — | `commitPlan` | `ensurePlan` | 1 replano por conta | planVersion 2 ≠ `ALGO_VERSION` 1 do código antigo → 1 replano, sem perda |
| Estado de persistência (runtime, **não** persistido) | `"ok" \| "falhou"` | `"ok"` | `setState`/`retryPersist` | `PersistenceBanner` (**NOVO**) | — | — |
| `localStorage["foca.state.corrupt.<ISO>"]` | string bruta | — | `load()` | nenhum (recuperação manual) | máx. 1 por carga | — |
| Tipos de evento (`LearningEventType`) | + `"activity-skipped"`, `"placement-applied"`, `"checkpoint-recalibrated"` | — | ações novas | debug | anel de 300 | ignorado |

Dados derivados não persistidos: `lessonIdsForSkill`, `placementItemsById`, estado "pronta para retomar".

---

## I. SDD Changes (feitas na Fase 10, T-10.3 — não antes)

| Documento | Mudança | Motivo |
|---|---|---|
| `docs/README.md` | bloco "plano vigente" aponta `36` (quando aprovado) e `37`; corrigir L48 ("1–2 questões"), L54 (`20` implementado), L79 (`34` importado), L109 (contagem de conteúdo) | K2, K15 |
| `CLAUDE.md` | topo: novo bloco "Plano vigente — 36" (norma) + `37` (registro), mantendo `30`/`31`/`32` como anterior; schema v6; "aulas curtas" em vez de "1–2 questões"; Stack: pacotes de conteúdo também usam rede; Development 2: "(gatilho automático removido pelo `20`)"; `PhoneFrame` 440 só no mobile | K1, K2, K6, K10, K11 |
| `docs/PRODUCT.md` | capacidades atuais (jornada adaptativa, nivelamento, diagnóstico visual, desktop); evidência atualizada; "Platform: web (mobile-first, layout desktop desde o `36`)" | K2, K6 |
| `docs/DESIGN.md` | seção layout: tokens `--app-col`/`--reading-col`/`--path-col`/`--nav-rail`, `NavRail`, `--scrim` | K6, K14 |
| `docs/18` | nota de precedência no §8 (PhoneFrame) e §componentes (`BottomSheet` scrim) apontando para o `36` | K6, K14 |
| `docs/27` | nota em D-7/O5: "substituída em ≥ 768 px pelo `36` §F.6" | K6 |
| `docs/30` | notas curtas (sem reescrever): §1 L64 (24 itens), §4 O4 (janela de validação = 2×10), §9.6 (`PLANNER_VERSION` separado), §11.5 (reposição preserva comprometidas — contrato do `36` RF-8), §12 (finalização do `36` RF-10) | K12, K13 |
| `docs/31` | nota em G4 (janela) e F12/F13 (contratos substituídos pelo `36`) | K12 |
| `docs/32` | notas inline "superado por F15.1 (27/09)" nas linhas L29, L218, L292, L308, L408, L434, L455, L479, L494; fechar a pendência "Modo B `finalAnswer`" com a evidência de §D C6 | K3, C6 |
| `docs/21` | inventário: strings novas (RU-1…RU-5, RU-10…RU-12, RU-20, cursos) | voz |
| `docs/34` | nota: atribuição agora também na folha de feedback; parâmetros Inep não entram no modelo (§G.3) | RP-10 |
| `content-pipeline/README.md` | status real (Onda 1 rodou); estágio 7b documentado; `reviewKind`; validador de qualidade; tirar "zod-like" | K3, K8 |
| `src/content/oficial/README.md` | "5526 linhas do CSV → 379 itens únicos" | E11 |
| `docs/33` | regenerar pelo gerador existente se `reviewKind` entrar na tabela — nunca à mão | K8 |
| `docs/historico/iniciativas/35-36-37-qualidade/37-registro-execucao-qualidade.md` (**NOVO**) | criado na T-00.1; preenchido por tarefa | registro |

Não apagar histórico; não marcar auditorias antigas (`11`) como atuais.

---

## J. Implementation Phases

Ordem topológica (justificativa: bugs S1 de fluxo primeiro; contratos de dados antes de consumidores; placement depende da infraestrutura de início/invalidação da Fase 2; o ajuste do planner depende do placement aplicar priors; conteúdo depende do `irt` corrigido; UI visual por último para não retrabalhar telas que as fases de fluxo alteram):

```
F0 → F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → F9 → F10
                 └─(F5 é independente de F3/F4; pode rodar depois de F2 se o executor quiser, mas a ordem acima é a oficial)
```

Formato de cada tarefa: ver `35` §18. "Comando" = o que precisa passar no checkpoint da tarefa; a regressão completa roda nos gates de fase.

### Fase 0 — Linha de base e registro

**Objetivo:** executor começa de um estado conhecido e registra tudo. **Valor ao aluno:** nenhum direto (proteção).
**Context Pack:** este documento §0, §1; `docs/ai/SDD-WORKFLOW.md`; `package.json` scripts.

**T-00.1 — Criar o registro de execução**
- Arquivos: criar `docs/historico/iniciativas/35-36-37-qualidade/37-registro-execucao-qualidade.md` (**NOVO**).
- Esperado: seções "Linha de base", "Divergências", "Por fase" (uma subseção por fase, vazia), "Critérios globais" (tabela G-1…G-20 de §O com status ⬜).
- Aceitação: Given plano aprovado, When o executor começa, Then o `37` existe com a data de início e o commit base.
- Checkpoint: arquivo existe.

**T-00.2 — Rodar e registrar a linha de base**
- Comandos: `git status --short`; `bunx tsc --noEmit`; `bun test tests/unit`; `bunx playwright test --project=chromium`; `bun run build`; `git status --short` de novo.
- Registrar no `37`: data, commit, exit codes, contagens (pass/fail), tempo, e qualquer arquivo sujo depois do build (esperado: nenhum).
- Se algum E2E já falhar na linha de base: registrar como **pré-existente** com o nome do teste; não corrigir fora da tarefa dona.
- Checkpoint: números registrados.

**Gate F0:** `37` com linha de base.

### Fase 1 — Contratos, fixtures e harness de teste

**Objetivo:** tipos/constantes opcionais no lugar e testes que conseguem **falhar** nos bugs. **Valor:** impede que os bugs voltem.
**Context Pack:** §H; `src/lib/adaptive/types.ts`; `src/lib/learning/types.ts` (`JourneyState` L392-402, `PlacementState` L437-444, `JourneyHistoryEntry` L378-385); `src/lib/adaptive/constants.ts`; `tests/e2e/journey.spec.ts` L1-60; `tests/e2e/placement.spec.ts` L1-73; `playwright.config.ts`; `tests/unit/store-bundle-boundary.test.ts`.

**T-01.1 — Tipos e constantes opcionais**
- Requisitos: RF-2, RF-6, RF-7, RF-10, RP-4, RP-5.
- Arquivos (alterar): `src/lib/adaptive/types.ts` (`PlannedActivity.startedAt?`), `src/lib/learning/types.ts` (`JourneyHistoryEntry.attemptKey?`, `.localDate?`; `JourneyState.seq?`, `.challengeEligible?`; `PlacementState.appliedAt?`, `.appliedVersion?`; `LearningEventType` + 3 tipos), `src/lib/adaptive/constants.ts` (`PLANNER_VERSION = 2`, `PLACEMENT_APPLY_VERSION = 1`, `DESAFIO_SINAL_DIAS = 7`).
- Contrato: todos opcionais; nenhum leitor existente muda nesta tarefa.
- Compatibilidade: sem mudança em `state-migrations.ts` (parsers já preservam). Acrescentar teste em `tests/unit/state-migrations.test.ts`: estado v6 com os campos novos passa por `computeAdditiveFields` e os mantém; estado v6 sem eles continua válido.
- Testes: `bun test tests/unit/state-migrations.test.ts` verde; `bunx tsc --noEmit`.
- Aceitação: Given storage v6 com `placement.appliedAt = "2026-10-01T…"`, When `load()`, Then o campo continua lá.
- Skills: nenhuma.

**T-01.2 — Helpers de E2E e fixtures reais**
- Arquivos: criar `tests/e2e/helpers/estado.ts` (**NOVO** — confirmar que `tests/e2e/helpers/` existe; existe na linha de base). Funções: `seedOnce(page, estado)` (só semeia se `foca.state.v3` ausente — padrão de `placement.spec.ts:67-73`), `lerEstado(page)`, `USUARIO_ONBOARDED` (cópia do objeto usado hoje), `comAtividades(kinds[])` (gera `committed` com ids fixos, `planVersion: PLANNER_VERSION`), `comPlacementConcluidoNaoAplicado()`, `comLicaoLegadaConcluida(lessonId)`, `comAulaConcluida(lessonId, completedAt)`.
- Mudança: `journey.spec.ts` passa a usar `seedOnce` em **todos** os testes (hoje `addInitScript` incondicional em L98-101, L111-114, L181-184, L216-219).
- Testes: `bunx playwright test tests/e2e/journey.spec.ts --project=chromium` verde (mesmos testes, novo helper).
- Aceitação: um `page.reload()` depois de uma mutação preserva a mutação.

**T-01.3 — Fronteira de bundle cobre o que os comentários prometem**
- Arquivo: `tests/unit/store-bundle-boundary.test.ts`: acrescentar proibições em `src/lib/store.ts` para `@/lib/adaptive/journey`, `@/lib/adaptive/index`, `@/lib/adaptive"` (barrel), `@/lib/adaptive/placement-pool`, `@/lib/adaptive/candidates`, `@/lib/adaptive/planner`, `@/content/curriculum-tree`, `@/content/banco`.
- Esperado hoje: passa (store não importa nada disso — confirmar rodando). Se falhar, registrar divergência e **não** mexer no store nesta tarefa.
- Comando: `bun test tests/unit/store-bundle-boundary.test.ts`.

**T-01.4 — Projeto Playwright mobile de verdade**
- Arquivo: `playwright.config.ts`: projeto `chromium` passa a `{ ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } }` (o global já diz 390×844 — o spread o anulava); novo projeto `desktop` (`viewport 1280×800`, `testMatch` = specs marcados em §L como "desktop"); `narrow` mantém 320×700 e ganha os specs novos de layout.
- Risco: testes hoje verdes em 1280 podem falhar em 390 (overflow, alvos). Rodar `bunx playwright test --project=chromium` e **registrar** falhas novas no `37` como achados; corrigir só as causadas por layout real, na Fase 8 (T-08.x), marcando `test.fixme` com referência à tarefa até lá. Nunca remover assertiva.
- Comando: `bunx playwright test --project=chromium` (resultado registrado).
- Skills: nenhuma.

**T-01.5 — Testes que falham hoje (vermelhos intencionais)**
- Arquivos (novos testes, marcados `test.fail()` no Playwright / `test.todo` não serve — usar `test.failing` do Bun; cada um cita a tarefa que o deixa verde):
  - `tests/e2e/journey-start.spec.ts` (**NOVO**): CTA do card e nó atual com `comAtividades(["pratica","pratica","pratica"])` → espera radio visível (falha hoje: C2). Dona: T-02.1.
  - `tests/e2e/placement.spec.ts`: novo teste "término normal aplica e replaneja": semear, abrir `/trilha`, guardar `committed`, fazer CAT, esperar `placement.appliedAt` e `committed` ≠ anterior **ou** motivo `nova-habilidade` coerente com áreas medidas; conferir ≥ 1 entrada `prior-nivelamento` (falha hoje: C1). Dona: T-03.3.
  - `tests/unit/adaptive-candidates.test.ts`: legado concluído em `progress.lessons` → próxima lição (falha hoje: C4a). Dona: T-02.4.
  - `tests/unit/store-journey-actions.test.ts`: `completeJourneyActivity` 2× → histórico com 1 entrada, `sinceCheckpoint` +1 (falha: C4d). Dona: T-02.5.
  - `tests/unit/placement.test.ts`: retomada com mapa reconstituído = contínuo (falha: C3 — usar o roteiro de §D C3). Dona: T-03.2.
- Checkpoint: `bun test tests/unit` verde (os `failing` contam como passando enquanto falham); E2E com `test.fail()` verdes.
- **Regra:** a tarefa dona troca `failing`/`fail` pelo teste normal. Se um desses começar a passar antes da tarefa dona, o executor investiga (sinal de premissa errada) e registra.

**Gate F1:** `bunx tsc --noEmit`; `bun test tests/unit`; `bunx playwright test tests/e2e/journey.spec.ts tests/e2e/journey-start.spec.ts tests/e2e/placement.spec.ts --project=chromium`. Registro no `37`.

### Fase 2 — Início, conclusão, idempotência e reposição da jornada

**Objetivo:** tocar em "Continuar" sempre começa a estudar; concluir sempre avança; nada duplica. **Valor:** fim do "travou" (B2/C2/C4).
**Context Pack:** §F.2 RF-1…RF-9; `src/components/learning/journey/SessionCard.tsx`, `JourneyPath.tsx`; `src/routes/atividade.$activityId.tsx`; `src/routes/trilha.tsx` L150-210; `src/lib/adaptive/journey.ts`; `src/lib/adaptive/candidates.ts`; `src/lib/adaptive/planner.ts` L190-300; `src/lib/adaptive/index.ts` L56-75; `src/lib/store.ts` L641-711, L1340-1506; `src/lib/adaptive/activity-lesson.ts`; `docs/30` §11.5, §11.7, §14.4.
**Skills:** `vercel-react-best-practices` (efeitos/estado derivado nas rotas) — só regras de React, não de Next. `systematic-debugging` se algum teste vermelho não ficar verde pela causa esperada (ver §1 para disponibilidade).

**T-02.1 — Proprietário único da seleção de itens; estados de atividade**
- Requisitos: RF-1, RF-2; bugs C2, C7 (`selectItemsForActivity`).
- Depende de: T-01.1, T-01.5.
- Arquivos: `src/lib/store.ts` (nova ação `startJourneyActivity`; `setActiveActivity` fica como alias depreciado que chama a nova — remover usos), `src/components/learning/journey/SessionCard.tsx`, `src/components/learning/journey/JourneyPath.tsx`, `src/routes/atividade.$activityId.tsx`, `src/lib/adaptive/journey.ts` (novo `isReadyToResume`), `src/lib/adaptive/index.ts` (`selectItemsForActivity`).
- Comportamento atual: Home marca `activeActivity` sem itens; rota trata como retomada e falha (§D B2.1).
- Contrato:
  ```ts
  // store.ts — ação "burra"
  export function startJourneyActivity(activity: PlannedActivity): PlannedActivity
  // Dentro de um único setState:
  //  atual = s.learning.journey.activeActivity
  //  se atual?.id === activity.id:
  //     mescla { ...atual, ...activity, startedAt: atual.startedAt ?? agoraISO } (nunca troca startedAt; itemIds do argumento só entram se atual.itemIds vazio)
  //  senão: activeActivity = { ...activity, startedAt: agoraISO }
  //  evento "activity-started" SÓ quando não havia startedAt
  //  retorna a atividade gravada
  // journey.ts — pura
  export function isReadyToResume(a: PlannedActivity): boolean
  //  needsItemSelection(a) ? (a.itemIds?.length ?? 0) >= 2 : Boolean(a.lessonId)
  ```
- Mudança:
  - `SessionCard`/`JourneyPath`: `onClick` chama `startJourneyActivity(current)` **somente** quando `navigationTargetFor(current).kind !== "atividade"` (aula/legado precisam do marcador para a sync). Para dinâmicas, o link só navega.
  - Rota `/atividade/$activityId` (efeito atual L49-103): `candidata` = `ativa` se `ativa.id === activityId`, senão `committed[0]` se bater; se `candidata` e `isReadyToResume(candidata)` → retomada (carrega pacotes dos `itemIds`); senão → carrega pacotes da habilidade → `selectItemsForActivity` → `startJourneyActivity({ ...candidata, itemIds })` → trava.
  - `selectItemsForActivity`: `n` = `activity.itemIds?.length || ITENS_POR_TIPO[activity.kind]` onde `ITENS_POR_TIPO` usa as constantes `ITENS_POR_ATIVIDADE` já existentes (introducao/pratica/revisao/desafio/reforco); sem `targetP` usa `P_ALVO_POR_ATIVIDADE` do tipo em vez de devolver `[]`.
- Compatibilidade: storage com `activeActivity` dinâmica sem itens (todos que tocaram o card desde 28/09) → `isReadyToResume` falso → seleciona agora → corrige sozinho no próximo clique.
- Testes: `journey-start.spec.ts` (T-01.5) passa a verde (tirar `test.fail`), com: CTA e nó; asserção de UI (radio visível) **e** de estado (`activeActivity.itemIds.length ≥ 2`, `startedAt` definido); reload no meio da 2ª questão → mesmos `itemIds`. Unitário `tests/unit/journey.test.ts`: `isReadyToResume` para os 7 `kind`. Unitário `store-journey-actions.test.ts`: `startJourneyActivity` 2× preserva `startedAt` e emite 1 evento.
- Comandos: `bun test tests/unit/journey.test.ts tests/unit/store-journey-actions.test.ts tests/unit/adaptive-select-items.test.ts`; `bunx playwright test tests/e2e/journey-start.spec.ts tests/e2e/journey.spec.ts --project=chromium`.
- Aceitação: Given `committed[0]` de prática sem itens, When o aluno toca "Continuar", Then a 1ª questão aparece e `activeActivity.itemIds` tem ≥ 2 ids; When recarrega, Then os mesmos ids.
- Riscos: StrictMode duplo no efeito (registrado em `32`) — manter o padrão `cancelado`/`resolvidaRef` existente.

**T-02.2 — Atividade sem questões: descartar, avisar, nunca repetir; estados de carregamento/erro**
- Requisitos: RF-3; RU-1, RU-2, RU-3.
- Depende de: T-02.1.
- Arquivos: `src/lib/store.ts` (nova `discardJourneyActivity(id: string, reason: "sem-itens" | "conteudo-removido")`), `src/routes/atividade.$activityId.tsx` (`AtividadeFalhou`, novo estado de carregamento/erro), `src/routes/trilha.tsx` (search `?pulada=1` → aviso), `src/lib/copy.ts` (`COPY.jornada.puladaSemItens`, `COPY.jornada.carregando`, `COPY.jornada.erroPacoteTitulo/Corpo`, `COPY.comum.tentarDeNovo`, `COPY.jornada.voltarTrilha`).
- Contrato `discardJourneyActivity`: um `setState`: remove de `committed` e de `activeActivity` se o id bater; `seq += 1`; evento `activity-skipped` com `meta.reason`; **não** mexe em XP, histórico, `sinceCheckpoint`, bloco do dia.
- Mudança: se `carregarPacotesPara` resolve e `selectItemsForActivity` devolve < 2 ids → `discardJourneyActivity(id, "sem-itens")` → `navigate({ to: "/trilha", search: { pulada: "1" }, replace: true })`. Se `carregarPacotesPara` devolve `false` (falha de rede/timeout) → **não** descarta; mostra RU-3 com "Tentar de novo" (re-executa o efeito) e "Voltar à trilha". Enquanto carrega > 400 ms mostra RU-2 (texto em `PhoneFrame`, `role="status"`).
- `validateSearch` de `/trilha` ganha `pulada?: "1"`; o aviso aparece uma vez (limpa o search com `replace` ao fechar ou em 6 s).
- Testes: E2E `journey-start.spec.ts`: habilidade sem itens elegíveis (fixture `comAtividades` com skill de pool vazio — usar uma habilidade com 0 itens no catálogo; o executor escolhe via `itemIndex()` e registra qual) → volta com aviso, `committed[0].id` diferente, sem nova entrada no histórico; E2E com `page.route("**/content/v1/**", r => r.abort())` → RU-3 visível, "Tentar de novo" após liberar a rota abre a questão.
- Aceitação: Given pool vazio, When toca "Continuar", Then vê o aviso e a próxima atividade, e tocar de novo não repete a descartada.

**T-02.3 — Sincronização só conta conclusão desta tentativa**
- Requisitos: RF-4. Bug: C4c.
- Depende de: T-02.1.
- Arquivos: `src/lib/store.ts` `syncJourneyWithCompletions`.
- Contrato: `concluida` = existe registro de conclusão **e** (`ativa.startedAt` ausente **ou** `registro.completedAt >= ativa.startedAt`). Registro: `progress.lessons[id]` para `legado`; `learning.completedLessons[id]` para `aula`/`reforco`. Ao mover para histórico: `attemptKey`, `localDate` (hoje local), `seq += 1`.
- Observação: `completeMicroLesson`/`completeLesson` já sobrescrevem `completedAt` a cada conclusão (replay) → um reforço concluído agora tem `completedAt` novo. Confirmar lendo `store.ts:655-665,698-703`.
- Testes: `store-journey-actions.test.ts`: (a) aula concluída ontem + reforço iniciado hoje + sync sem estudar → continua ativa; (b) concluir o reforço → sai; (c) `activeActivity` sem `startedAt` → regra antiga.
- Aceitação: Given reforço de aula já feita, When o aluno abre e volta sem terminar, Then a Home mostra o mesmo reforço.

**T-02.4 — Fontes de conclusão corretas no planner**
- Requisitos: RF-5. Bugs: C4a, C4b, B2.
- Depende de: T-01.5.
- Arquivos: `src/lib/adaptive/candidates.ts` (novo `lessonIdsForSkill(skillId): string[]` = autoral(es) + gerada(s) quando `FEATURES.pacotesConteudo`; `legacyCandidateForSkill(skillId, state, progressLessons: Record<string, unknown>)`; `nextLegacyLesson` recebe `progressLessons`), `src/lib/adaptive/planner.ts` L197-214 (pré-requisito e `aulaConcluida` via `lessonIdsForSkill`; chamada do legado passa `s.progress.lessons`), `src/lib/adaptive/index.ts` (exportar `lessonIdsForSkill`), testes.
- Contrato: `lessonIdsForSkill` ordena autoral primeiro; `lessonIdForSkill` continua devolvendo o primeiro (sem mudança de comportamento para quem já usa).
- Testes: `adaptive-candidates.test.ts` (tirar `failing`): 1ª legada concluída em `progress.lessons` → candidato = 2ª; trilha toda concluída → `null`. `adaptive-planner.test.ts`: habilidade com só aula gerada concluída e `nEff 0` → nenhum candidato `aula` para ela; pré-requisito com aula gerada concluída → dependente não `BLOQUEADA`. Garantir que o pacote da aula gerada está "carregado" no teste pelo mesmo mecanismo de `curriculum-tree-geradas.test.ts`.
- Aceitação: Given a 1ª lição de crase concluída pelo legado, When a Home repõe, Then não propõe a mesma lição.

**T-02.5 — Idempotência de todos os efeitos de conclusão**
- Requisitos: RF-6. Bug: C4d.
- Depende de: T-02.1, T-02.3.
- Arquivos: `src/lib/store.ts` (`completeJourneyActivity`, `recordLearningAttempt`), `src/hooks/useLearningSession.ts` (conferir `completingRef`, sem mudança se correto).
- Contrato `completeJourneyActivity(activity, correct, total)` → `{ xpAwarded, stars, alreadyCompleted: boolean }`:
  ```
  attemptKey = `${activity.id}@${activity.startedAt ?? "sem-inicio"}`
  ledgerKey  = activity.startedAt ? `atividade:${attemptKey}` : `atividade:${activity.id}`   // chave antiga preservada p/ tentativas antigas
  setState(s => {
    if (s.learning.journey.history.some(h => h.attemptKey === attemptKey)) { alreadyCompleted = true; limpa activeActivity/committed[0] se ainda apontarem p/ id; return s }
    XP pelo ledger (como hoje, mas lendo jaPago DENTRO do mutator)
    registrarAtividade; history.push({... attemptKey, localDate}); seq += 1; sinceCheckpoint (como hoje); pop committed; limpa ativa; evento
  })
  ```
  `recordLearningAttempt(attempt)`: se `recentAttempts` já contém `attempt.id` → no-op (antes de qualquer efeito).
- Testes: `store-journey-actions.test.ts` (tirar `failing`): 2× mesma atividade → 1 histórico, `sinceCheckpoint` +1, `today.completedBlockIds` +1, 1 evento `activity-completed`, XP uma vez; `record-learning-attempt.test.ts`: mesmo `attempt.id` 2× → 1 entrada. E2E `journey-start.spec.ts`: concluir prática, recarregar na celebração, clicar "Continuar" → histórico com 1 entrada.
- Aceitação: Given uma prática concluída, When a tela de conclusão é recarregada e o botão é tocado de novo, Then XP, histórico e meta do dia contam uma vez.

**T-02.6 — Id de atividade sem colisão**
- Requisitos: RF-7. Bug: C4e.
- Depende de: T-02.5.
- Arquivos: `src/lib/adaptive/planner.ts:282`.
- Mudança: `id = atv-${today}-${fnv1a(`${seed}:${skillId}:${posição}:${seqBase}`)}` com `seqBase = s.learning.journey.seq ?? s.learning.journey.history.length`. Estável entre renders (seq só muda em conclusão/descarte) → a guarda `semMudanca` de `ensurePlan` continua funcionando.
- Testes: `adaptive-planner.test.ts`: plano → concluir 1ª (seq+1) → replano no mesmo dia escolhendo a mesma habilidade na posição 0 → id diferente; dois planos seguidos sem conclusão → ids iguais.

**T-02.7 — Reposição preserva comprometidas e a iniciada**
- Requisitos: RF-8. Bug: C4f.
- Depende de: T-02.1, T-02.6.
- Arquivos: `src/lib/adaptive/journey.ts` (`ensurePlan`, novo `isStillValid`), `src/lib/store.ts` (`invalidateJourneyPlan` preserva a iniciada), `src/routes/trilha.tsx` (sem mudança de chamada).
- Contrato:
  ```ts
  export function isStillValid(a: PlannedActivity, s, today): boolean
  // falso se: matéria fora do foco efetivo (prefs.studyFocus/focusSession);
  //           aula cujo lessonId não resolve (phaseById nem IDS_AULAS_GERADAS);
  //           legado já concluído em progress.lessons;
  //           kind "aula" NÃO iniciada (sem startedAt) cuja aula já consta em completedLessons (o aluno a fez pelo mapa).
  //           ("reforco" aponta de propósito para aula já concluída — nunca é invalidado por isso.)
  // ensurePlan(s, today, seed, { forceReplan, motivo? }):
  //   ativa = s.learning.journey.activeActivity
  //   precisa = forceReplan || committed.length < 3 || planVersion !== PLANNER_VERSION || committed.some(a => !isStillValid(a))
  //   se !precisa → null
  //   plano = planWithFallback(... n: 8)
  //   base = forceReplan || planVersion !== PLANNER_VERSION
  //            ? (ativa && isStillValid(ativa) ? [ativa] : [])
  //            : committed.filter(a => isStillValid(a))           // mantém ordem
  //   novas = plano.activities.filter(p => !base.some(b => b.skillIds[0] === p.skillIds[0] && b.kind === p.kind))
  //   committed' = [...base, ...novas].slice(0, 3); upcoming' = [...base, ...novas].slice(3, 8)
  //   semMudanca (como hoje, comparando ids) → null
  ```
  `invalidateJourneyPlan()`: `committed = ativa ? [ativa] : []`, `upcoming = []`.
- Testes: `journey.test.ts`: (a) 3 comprometidas, conclui a 1ª → as 2 restantes ficam nas posições 0-1 e só a 3ª é nova; (b) `forceReplan` com ativa → ativa no topo; (c) comprometida de matéria fora do novo foco → removida; (d) `planVersion 1` → replano completo preservando ativa; (e) loop guard: foco estreito com 1 candidato → segunda chamada devolve `null`.
- E2E `journey-start.spec.ts`: após concluir a 1ª, o título do card = título que era a 2ª antes.
- Aceitação: Given fila A,B,C, When A é concluída, Then a Home mostra B e "Depois: C".

**T-02.8 — Foco alterado fora da Home e "só hoje" expirado**
- Requisitos: RF-9.
- Depende de: T-02.7.
- Arquivos: `src/lib/learning/types.ts` (`JourneyState.focusSignature?`, §H), `src/lib/store.ts` (`commitPlan(committed, upcoming, focusSignature)` grava), `src/routes/trilha.tsx` (compara a assinatura atual com a **persistida** em vez de `lastFocusSignatureRef`), `src/lib/store.ts` (`clearExpiredFocusSession()` chamado no efeito da Home e no `visibilitychange`).
- Mudança: `focusMudou = persisted !== undefined && persisted !== atual`. Primeira execução sem assinatura persistida grava sem forçar.
- Testes: E2E `focus.spec.ts`: mudar foco em `/profile`, voltar a `/trilha` → `committed` só de matérias do foco; unitário do relógio com `focusSession` de ontem → limpa.

**Gate F2:** `bunx tsc --noEmit`; `bun test tests/unit`; `bunx playwright test tests/e2e/journey*.spec.ts tests/e2e/focus.spec.ts tests/e2e/lesson-v2.spec.ts tests/e2e/lessons.spec.ts tests/e2e/microlicoes.spec.ts tests/e2e/checkpoint.spec.ts tests/e2e/trail-home.spec.ts tests/e2e/trilha.spec.ts --project=chromium`; os mesmos com `--project=narrow` quando o spec estiver no `testMatch`. Registrar no `37`.

### Fase 3 — Nivelamento: finalização única, reparo e retomada

**Objetivo:** fazer o teste muda a trilha, sempre, uma vez. **Valor:** B3/C1/C3.
**Context Pack:** §F.2 RF-10…RF-13; §G.1; `src/routes/nivelamento.tsx` (inteiro, 307 linhas); `src/lib/adaptive/placement.ts` L170-281; `src/lib/adaptive/placement-pool.ts` (inteiro); `src/lib/store.ts` L1100-1210; `src/lib/content/preload.ts`; `docs/30` §12.3; `docs/31` L1817-1867.
**Skills:** `systematic-debugging` (se disponível) na T-03.3.

**T-03.1 — Guardas em `submitPlacementResponse`**
- Arquivos: `src/lib/store.ts`.
- Contrato: no-op se `placement` ausente, `status === "concluido"`, ou `item.id` já está em `placement.areas[item.area].itemIds`. Continua fechando `status: "concluido"` + evento `placement-completed` como hoje (o **fechamento** do status fica aqui; a **aplicação** passa a ser da T-03.3).
- Testes: `store-placement-actions.test.ts`: duplo envio do mesmo item → 1 resposta; envio após concluir → nada muda.

**T-03.2 — Reconstituir o mapa de itens (C3)**
- Arquivos: `src/lib/adaptive/placement-pool.ts` (nova `placementItemsById(placement: PlacementState): { byId: Map<string, PlacementPoolItem>; ausentes: string[] }`), `src/routes/nivelamento.tsx`.
- Contrato: percorre `placement.areas[*].itemIds`; resolve cada id primeiro no pool diagnóstico da área (`poolDiagnosticoDaArea`), senão por `itemMetaOf` + `SKILL_MAP` (item que deixou de ser diagnóstico ou foi retirado continua com `irt`/`subjectId`/`skillId` da meta atual); id que nem a meta resolve → `ausentes`.
- Rota: quando `pacotesProntos` e `placement` existe, `itemsShownRef.current` = `placementItemsById(placement).byId` mesclado com os já mostrados (uma vez por montagem, antes do primeiro `pickPlacementItem`).
- Testes: `placement.test.ts` (tirar `failing`): roteiro de §D C3 com reconstituição → θ̂/SE idênticos ao contínuo (tolerância 1e-9); `placement-pool.test.ts`: id inexistente vai para `ausentes` e não quebra.

**T-03.3 — Finalização idempotente e reparo (C1, RF-10, RF-11)**
- Depende de: T-02.7 (`invalidateJourneyPlan` preserva ativa), T-03.1, T-03.2.
- Arquivos: `src/lib/adaptive/placement-pool.ts` (nova `computePlacementOutcome`), `src/lib/store.ts` (nova `applyPlacementOutcome`; `finishPlacement` fica, marcada `@deprecated`, sem chamadores), `src/hooks/usePlacementReconciliation.ts` (**NOVO**), `src/routes/nivelamento.tsx`, `src/routes/trilha.tsx`, `src/lib/copy.ts` (`COPY.nivelamento.aplicando`).
- Contrato:
  ```ts
  // placement-pool.ts (content-aware; nunca importado pelo store)
  export function computePlacementOutcome(p: PlacementState, skillModel: Record<string, SkillModelEntry>, today: string):
    { skillModel: Record<string, SkillModelEntry>; ausentes: string[] }
  //  = applyPlacement(p, skillModel, placementItemsById(p).byId, today)
  // store.ts
  export function applyPlacementOutcome(o: { skillModel: Record<string, SkillModelEntry>; appliedAt: string }): boolean
  //  setState: const p = s.learning.placement
  //    if (!p || p.status !== "concluido" || p.appliedAt) return s   // idempotente, reconfere estado FRESCO
  //    s.learning.skillModel = mesclar(o.skillModel, s.learning.skillModel)  // nunca sobrescreve entrada "evidencia" mais nova (updatedAt maior) do que a do outcome
  //    p.appliedAt = o.appliedAt; p.appliedVersion = PLACEMENT_APPLY_VERSION
  //    journey: committed = ativa ? [ativa] : []; upcoming = []
  //    evento "placement-applied"
  //  retorna true se aplicou
  // usePlacementReconciliation(): { aplicando: boolean }
  //  useEffect: se FEATURES.nivelamento && placement?.status === "concluido" && !placement.appliedAt:
  //    aplicando = true; await carregarTodosOsPacotes(); if cancelado return;
  //    const o = computePlacementOutcome(getState().learning.placement!, getState().learning.skillModel, hojeISO());
  //    applyPlacementOutcome({ skillModel: o.skillModel, appliedAt: new Date().toISOString() }); aplicando = false
  //    ausentes > 0 → recordEvent("placement-applied", { meta: { ausentes: n } }) já incluso
  ```
- Rota `/nivelamento`: remove o ramo `applyPlacement/finishPlacement/invalidateJourneyPlan` do efeito (L143-153). Quando o seletor fica sem item com status ainda "em-andamento" (pool insuficiente) → `setPlacementState({ ...estado, status: "concluido", finishedAt })` **e só**; o hook aplica. Tela: `status concluido && !appliedAt` → RU-11; `appliedAt` → resultado (T-06.1 troca o visual; até lá o atual).
- `/trilha`: chama `usePlacementReconciliation()` no topo; enquanto `aplicando`, o `SessionCard` mostra o esqueleto existente (`TrailPathSkeleton`), não o plano velho.
- Ordem de efeitos na `/trilha`: reconciliação → sync → `ensurePlan`. `ensurePlan` não roda enquanto `aplicando` (evita plano com modelo velho).
- Compatibilidade: contas com placement concluído antes deste plano (sem `appliedAt`) são reparadas uma vez (RF-11). Contas cujo placement antigo **foi** aplicado pelo ramo raro (pool insuficiente) também não têm `appliedAt` → reaplicar é seguro: `applyPlacement` não sobrescreve `evidencia`, e reescreve priors com os mesmos valores (com `irt` do catálogo atual).
- Testes:
  - unitário `store-placement-actions.test.ts`: aplicar 2× → segunda devolve `false`, `skillModel` igual; aplicar com `status "em-andamento"` → `false`; ativa preservada.
  - unitário `placement-pool.test.ts`: `computePlacementOutcome` com placement de 2 áreas → habilidades não medidas dessas áreas com `source: prior-nivelamento`, `nEff 0`; habilidades de área não medida sem mudança.
  - E2E `placement.spec.ts` (tirar `test.fail`): término normal; **interrupção**: semear `comPlacementConcluidoNaoAplicado()` + fila → abrir `/trilha` → `appliedAt` definido, `committed` recomposta, evento `placement-applied`.
- Aceitação: Given uma fila e um CAT terminado pela última resposta, When "Começar"/"Ir para a trilha", Then `appliedAt` existe, há priors, e a fila foi recomposta com a atividade iniciada (se houver) no topo.

**T-03.4 — Refazer preserva evidência**
- Arquivos: testes só (o comportamento já deveria valer por `applyPlacement` não sobrescrever `evidencia`); se falhar, corrigir em `placement-pool.ts`.
- Teste: `placement-pool.test.ts`: skill medida no 1º placement (evidencia) + 2º placement que não a mede → entrada intacta; prior do 1º placement para skill não medida no 2º → substituído pelo prior do 2º.

**T-03.5 — Efeito causal observável (perfis controlados)**
- Depende de: T-03.3, T-04.2 (necessidade com prior) — **esta tarefa roda depois da T-04.2**, mas pertence à Fase 3 por tema; o executor a faz ao fim da Fase 4 (anotado em §P).
- Arquivo: `tests/unit/placement-effect.test.ts` (**NOVO**).
- Teste: mesmo foco (todas as áreas), mesma data/seed, catálogo real carregado (padrão de `sim-placement.test.ts`); perfil A = acerta tudo em MT e erra tudo em LC; perfil B = o inverso. Aplicar outcome e planejar 8. Asserções: (1) as filas diferem; (2) em A, a 1ª atividade de LC aparece antes da 1ª de MT entre as NOVA; em B o contrário; (3) nenhuma atividade `aula` foi trocada por `pratica` por causa de prior (aula opcional exige evidência). Não exigir diferença em **todas** as posições.

**T-03.6 — Comentários e textos do pool**
- Arquivos: `src/lib/adaptive/placement-pool.ts` L9-16, L40 (comentário "zero itens"; `incidence: 2` com `TODO(Fase 11)` → explicar que é constante por falta de dado de incidência por item, sem TODO morto).
- Sem teste (comentário). Checkpoint: `bunx tsc --noEmit`.

**Gate F3:** `bunx tsc --noEmit`; `bun test tests/unit`; `bunx playwright test tests/e2e/placement.spec.ts tests/e2e/journey*.spec.ts tests/e2e/onboarding.spec.ts --project=chromium`.

### Fase 4 — Modelo, planner, IRT e checkpoint

**Objetivo:** a adaptação usa o que o aluno mostrou. **Valor:** prior muda a ordem; revisão aparece quando devida; checkpoint tem consequência.
**Context Pack:** §G.2–§G.4; `src/lib/adaptive/scoring.ts`; `constants.ts`; `planner.ts` L180-300; `checkpoint.ts`; `bootstrap.ts`; `src/content/items/irt.ts`; `scripts/content/publish.ts` L90-110; `scripts/content/import-official-items.ts` L110-140; `tests/unit/sim-engine.test.ts`; `docs/30` §7.4, §9.6, §11, §13.

**T-04.1 — `PLANNER_VERSION` separado e bootstrap que não apaga nivelamento**
- Requisitos: RP-5.
- Arquivos: `src/lib/adaptive/journey.ts` (compara com `PLANNER_VERSION`), `src/lib/store.ts` (`commitPlan` grava `PLANNER_VERSION`), `src/lib/adaptive/bootstrap.ts` (`bootstrapModel` mescla: entradas existentes com `source` `evidencia`/`prior-nivelamento` de habilidades não tocadas pelo replay são mantidas), testes.
- Testes: `journey.test.ts`: `planVersion 1` → replano (uma vez), depois `null`. `mastery-bootstrap.test.ts`: modelo com entrada `prior-nivelamento` + replay vazio → entrada mantida; entrada `prior-materia` → recalculada. Asserção `ALGO_VERSION === 1` (guarda de RP-5).

**T-04.2 — Necessidade de NOVA com prior e IRT por dificuldade**
- Requisitos: RP-1, RP-2.
- Arquivos: `src/lib/adaptive/scoring.ts` (`necessidade(state, m, c, source?)`), chamador em `planner.ts`; `scripts/content/recalibrar-irt-dificuldade.ts` (**NOVO**), `scripts/content/publish.ts:102` (default = `irtFromDifficulty(meta.difficulty, nOpcoes)`), `scripts/content/import-official-items.ts` (mesmo default), os JSON de `src/content/banco/**` (gerados pelo script — **fonte editorial**, commitáveis), testes.
- Script: lê cada JSON, para cada item com `irt` exatamente `{a:1,b:0,c:0.2,source:"estimado"}` e sem `calibratedFrom` → substitui por `irtFromDifficulty`; preserva o resto byte a byte (mesma indentação de 2 espaços e ordem de chaves — conferir com `git diff --stat` que só `irt` mudou); imprime contagem por dificuldade. `--check` = só relata.
- Depois do script: `bun run build` regenera `itens-gerados.ts`/pacotes (derivados).
- Testes: `irt-calibration.test.ts` ou novo `tests/unit/catalog-irt.test.ts` (**NOVO**): nenhum item de pacote com o default antigo exceto os que o mapa leva a b = 0 (d3); b por dificuldade = mapa. `adaptive-scoring.test.ts`: `necessidade` com prior θ −1,5 > 0,8 > prior θ 1,0; sem prior = 0,8. `placement.test.ts`/`sim-placement.test.ts`: atualizar expectativas numéricas que dependiam de b = 0 **registrando no `37`** cada número alterado e o motivo.
- Risco: testes de simulação com números fixos mudam. Regra: só atualizar a expectativa se a nova for explicada por b ≠ 0; se não for explicável, parar e registrar.

**T-04.3 — Cota mínima de revisão e teto de desafio (G4)**
- Requisitos: RP-3.
- Arquivos: `src/lib/adaptive/planner.ts` (seleção por posição, L240-270), `constants.ts` (`REVISAO_MIN_JANELA = 2`, `REVISAO_MIN_JANELA_ATRASO = 3`, `DESAFIO_MAX_JANELA = 2`), `tests/unit/sim-engine.test.ts` (4 perfis), `tests/unit/adaptive-planner.test.ts`.
- Algoritmo (por posição, antes do sort por score):
  ```
  janela = últimas 10 do histórico (por localDate/ordem) + plano parcial
  revisoesNaJanela = count(kind === "revisao")
  existeDevida = candidatos.some(c => c.kind === "revisao")
  minimo = (alguma revisão devida atrasada > 3 dias) ? REVISAO_MIN_JANELA_ATRASO : REVISAO_MIN_JANELA
  se existeDevida && revisoesNaJanela < minimo && últimaDaJanela.kind !== "revisao":
      escolhido = melhor candidato kind "revisao" (pelo score)      // pula o sort geral nesta posição
  desafiosNaJanela >= DESAFIO_MAX_JANELA → remove candidatos "desafio" antes de escolher
  ```
  Regra simples fechada: **se `existeDevida` e `revisoesNaJanela < minimo`, a posição atual recebe a melhor revisão sempre que a posição anterior não foi revisão** (intercala; nunca 2 revisões forçadas seguidas).
- Testes: `sim-engine.test.ts`: (1) iniciante sem revisões devidas → 100 % atual em 20 (esperado e documentado); (2) backlog com 6 devidas → cada janela de 10 tem 2–4 revisões; (3) estabelecido com atraso > 3 dias → ≥ 3 em 10, ≤ 35 %; (4) alto M e baixa C → nenhum desafio (C < 50) — desafio ≤ 2 em 10 em todos.

**T-04.4 — Recalibração pós-checkpoint (G7) e datas locais**
- Requisitos: RP-4; C7 (data UTC).
- Arquivos: `src/lib/store.ts` (nova `applyCheckpointRecalibration({ antecipar, desafio, today })`), `src/routes/atividade.$activityId.tsx` (no `onComplete` de checkpoint: montar `RecalibrarInput[]` das tentativas desta sessão — `recentAttempts` filtradas por `sessionId` da sessão do player — e chamar `recalibrar` + ação), `src/lib/adaptive/candidates.ts` (EM_APRENDIZADO + `challengeEligible[skill] >= today` + M ≥ 60 → `desafio` `minDifficulty 3`, máx. 1 por plano — contador no planner), `src/lib/adaptive/index.ts` L62-66 (filtro por `h.localDate ?? hojeISO(new Date(h.completedAt))` — `hojeISO(d)` já existe em `store.ts:189` e devolve a data local; importar só a função, `store.ts` não importa `adaptive/index`, sem ciclo).
- Contrato `applyCheckpointRecalibration`: `reviewSchedule[s].dueDate = min(atual, amanhã)` para `antecipar`; `journey.challengeEligible[s] = today + 7 dias` para `desafio`; poda entradas vencidas; evento `checkpoint-recalibrated`. Idempotente (mínimo/sobrescrita com mesmo valor).
- Testes: `checkpoint-compose.test.ts` (integração com store), `adaptive-candidates.test.ts` (sinal de desafio), E2E `checkpoint.spec.ts`: completar checkpoint errando item de habilidade com `predictedP` alto → `reviewSchedule[skill].dueDate` = amanhã.

**T-03.5 roda aqui** (ver Fase 3).

**Gate F4:** `bunx tsc --noEmit`; `bun test tests/unit`; `bun run build` + `git status` (só os JSON do banco e derivados esperados); `bunx playwright test tests/e2e/placement.spec.ts tests/e2e/checkpoint.spec.ts tests/e2e/journey*.spec.ts --project=chromium`.

### Fase 5 — Persistência, rede e robustez

**Objetivo:** o app nunca finge que salvou e se recupera de rede ruim. **Valor:** confiança no progresso.
**Context Pack:** §F.2 RF-14…RF-18; `src/lib/store.ts` L320-500; `src/lib/state-migrations.ts` L24-67, L243-293; `src/lib/content/repository.ts` (inteiro); `src/components/TutorBubble.tsx`; `src/routes/__root.tsx`; `tests/unit/content-repository.test.ts`, `storage-budget.test.ts`, `tutor-*.test.ts`; `tests/e2e/tutor.spec.ts`.

**T-05.1 — Falha de gravação visível**
- Arquivos: `src/lib/store.ts` (estado de runtime `persistStatus: "ok" | "falhou" | "versao-futura"` com assinantes próprios, `usePersistStatus()`, `retryPersist(): boolean`; `setState` usa o retorno de `persist()`), `src/components/PersistenceBanner.tsx` (**NOVO**), `src/routes/__root.tsx` (renderiza o banner acima do `Outlet`), `src/lib/copy.ts` (RU-4, RU-6).
- Contrato: `persist()` falhou → `persistStatus = "falhou"`; próxima gravação bem-sucedida (automática ou `retryPersist`) → `"ok"` e o banner some. Banner: `role="alert"`, fixo no topo da coluna (`max-w-[var(--app-col)]` depois da Fase 8; antes, 440), botão "Tentar de novo" (`type="button"`, ≥ 44 px).
- RU-6 (versão futura): "Seus dados são de uma versão mais nova do app. Recarregue a página para atualizar. Até lá, nada do que você fizer aqui fica salvo." — e `setState` **não** grava enquanto `futureVersion` (corrige C5 "versão futura").
- Testes: unitário `store-persist.test.ts` (**NOVO**, `localStorage` falso cujo `setItem` lança) — status muda, estado em memória correto, `retryPersist` volta a "ok"; E2E `state-migration.spec.ts`: `addInitScript` sabota `Storage.prototype.setItem` → responder uma questão → banner visível; nenhuma tela diz "salvo".

**T-05.2 — Duas abas**
- Arquivos: `src/lib/store.ts` (`hydrate()` registra `window.addEventListener("storage", …)` uma vez).
- Contrato: evento com `key === KEY` e `newValue` não nulo → `parseStoredState` + `computeAdditiveFields` → substitui `state` **sem** gravar → notifica. `newValue` nulo (outra aba limpou) → ignora. Garantia documentada: cada aba adota a última gravação da outra antes da sua próxima mutação; um player aberto em duas abas ao mesmo tempo continua sendo "última escrita vence" para a sessão do player (aceito, registrado no `37`).
- Testes: unitário com `StorageEvent` sintético; E2E dois `page` no mesmo `context`: concluir aula na aba 1 → aba 2 (`/trilha`) mostra a conclusão sem reload, e uma mutação na aba 2 não apaga a conclusão.

**T-05.3 — JSON corrompido e versão futura sem perda silenciosa**
- Arquivos: `src/lib/store.ts` `load()`, `src/lib/copy.ts` (RU-5).
- Contrato: `parseStoredState` devolveu `null` com bruto não vazio → `localStorage.setItem("foca.state.corrupt." + ISO, bruto)` (try/catch) **antes** de qualquer gravação; flag de runtime `recuperouCorrompido = true` → banner RU-5 uma vez (mesmo componente da T-05.1, variante informativa, com "Ok").
- Testes: `state-migrations.test.ts`/`store-persist.test.ts`: bruto `"{quebrado"` → cópia existe, estado default, primeira mutação grava na chave principal.

**T-05.4 — Manifest e pacotes: retry e dedupe**
- Arquivos: `src/lib/content/repository.ts`.
- Contrato: `manifestPromise` só é mantido se resolveu com manifest válido; `null` → zera para permitir nova tentativa (sem retry automático em laço; a próxima chamada de `ensureSubjects` tenta de novo). `ensureSubjects` guarda um `Map<subjectId, Promise<boolean>>` em voo; chamadas concorrentes reusam; ao resolver, remove do mapa. Timeout continua 8 s; `AbortController` passa a abortar o `fetch` no timeout.
- Testes: `content-repository.test.ts`: 1ª chamada falha (fetch mock), 2ª sucesso → pacote carregado; 2 chamadas concorrentes → 1 fetch por arquivo.

**T-05.5 — Tutor sem rede não trava o estudo (G13)**
- Arquivos: `tests/e2e/tutor.spec.ts` (novo teste).
- Teste: `page.route("**/_serverFn/**", r => r.abort())` (conferir o padrão de URL da server function no dev antes; registrar o padrão usado) → errar questão (tutor **não** abre sozinho), tocar "Explicar melhor", enviar → aparece fallback local (`localFallback`), "Continuar" funciona e a próxima questão abre. Nenhuma mudança de código esperada; se falhar, corrigir em `TutorBubble.tsx`/`tutor.ts` sem mudar o comportamento manual.

**T-05.6 — Medir antes de otimizar**
- Arquivos: `tests/unit/adaptive-perf.test.ts` (acrescentar medições), `docs/37`.
- Medir (Bun, máquina do executor, 20 repetições, p50/p95): (a) `setState` no estado máximo (500 tentativas, 300 eventos, 200 históricos, 65 habilidades) — clone + `JSON.stringify` + `setItem` falso; (b) `buildTrail` com catálogo carregado; (c) `ensurePlan` com catálogo carregado. Registrar.
- **Regra de decisão:** se (a) p95 > 8 ms **ou** (b) p95 > 8 ms → aplicar a otimização pré-decidida: `useMemo` de `buildTrail` em `trilha.tsx` passa a depender de `[s.learning.completedLessons, s.progress.lessons, s.learning.skillModel, s.learning.celebratedChapterIds, s.prefs.trailSubjectId, pacotesVersao]` em vez de `s`. Nenhuma outra otimização neste plano. Abaixo dos limiares: só registrar.
- Benchmark de Bun **não** prova fluidez em celular (registrar essa ressalva).

**Gate F5:** `bunx tsc --noEmit`; `bun test tests/unit`; `bunx playwright test tests/e2e/state-migration.spec.ts tests/e2e/tutor.spec.ts tests/e2e/journey-start.spec.ts --project=chromium`.

### Fase 6 — Diagnóstico visual e Home clara

**Objetivo:** o aluno vê o que o teste mediu e o que vem agora. **Valor:** RU-10, RU-12, RP-6.
**Context Pack:** §F.4, §F.5; `src/routes/nivelamento.tsx` L164-307; `src/components/learning/journey/SessionCard.tsx`; `src/lib/adaptive/activity-lesson.ts` (`activityTitle`, `activityReasonText`); `src/lib/copy.ts` bloco `nivelamento`/`jornada`; `docs/20` §7.1; `docs/18` (tokens, `card-press`, `btn-primary`); `docs/15` §4.
**Skills:** `humanizer` (se disponível; senão checklist de `20` §7.1) só nas strings; `web-design-guidelines` para a revisão da tela.

**T-06.1 — Tela de resultado do nivelamento**
- Arquivos: `src/components/learning/PlacementResult.tsx` (**NOVO**), `src/routes/nivelamento.tsx` (substitui `PlacementResultView` pelo novo componente; `faixaDaArea` migra para `src/lib/adaptive/display.ts` como `faixaDaAreaPlacement(theta)` + `precisaoDaArea(se)`), `src/lib/copy.ts`.
- Contrato de dados: props `{ placement: PlacementState; scope: PlacementScope; primeira: PlannedActivity | null; onComecar: () => void }`. `primeira` = `getState().learning.journey.committed[0]` **depois** de `ensurePlan` ter rodado — a rota chama `ensurePlan(forceReplan: false)` + `commitPlan` logo após `appliedAt` (a fila foi esvaziada pela aplicação, então `ensurePlan` replaneja). Com `jornadaAdaptativa` desligada → `primeira = null`.
- `onComecar` = mesma navegação do card (`hrefFor` + `startJourneyActivity` para aula/legado) — extrair `hrefFor` de `SessionCard.tsx` para `src/lib/adaptive/journey.ts` como `hrefForActivity` (compartilhado por card, nó e resultado).
- Visual e copy: exatamente §F.5. Indicador: 3 `div` `h-2 flex-1 rounded-[6px]` (marcador 6 px, `18`), gap 4 px; ativo `bg-mar`, demais `bg-gelo`.
- Testes: `placement.spec.ts`: após CAT, tela contém "Pronto. Sua trilha foi ajustada.", ≥ 1 `role="img"` com `aria-label` de área, nenhum texto `/\d+ ?%|nível \d|nota/i`; "Começar" abre a atividade (UI de questão ou 1º passo de aula). Unitário `skill-display.test.ts`: `precisaoDaArea` nos 3 limiares e `null`.

**T-06.2 — Card da Home: "Depois:" e estados**
- Arquivos: `SessionCard.tsx` (linha "Depois: {activityTitle(committed[1])}" quando existir; troca `style={{ borderColor: "var(--color-mar)" }}` por classe `border-mar`), `src/routes/trilha.tsx` (aviso `?pulada`, esqueleto enquanto `aplicando`).
- Estados cobertos: carregando (esqueleto), aplicando nivelamento (esqueleto + RU-11), vazio (existente `semNada`), atividade iniciada (rótulo "Continuar" — já existe via histórico; manter), pulada (RU-1).
- Testes: `trail-home.spec.ts`/`journey.spec.ts`: "Depois:" visível com 2+ comprometidas; um único `.btn-primary` (regra existente).

**Gate F6:** `bunx tsc --noEmit`; `bun test tests/unit`; `bunx playwright test tests/e2e/placement.spec.ts tests/e2e/journey*.spec.ts tests/e2e/trail-home.spec.ts --project=chromium --project=narrow` (narrow onde couber).

### Fase 7 — Qualidade do banco de questões

**Objetivo:** o aluno progride porque aprendeu, não porque achou a alternativa mais longa. **Valor:** RP-7…RP-10.
**Context Pack:** §G.5–§G.7; `scripts/content/validate.ts`, `verify.ts`, `publish.ts`, `build-packs.ts`, `aulas.ts`, `promover-diagnostico.ts`, `import-official-items.ts`; `src/content/items/{index,types,package,irt}.ts`, `meta/trilhas.ts`; `src/components/learning/steps/QuestionStepView.tsx` L80-90; `src/components/lessons/FeedbackSheet.tsx`; `content-pipeline/README.md`, `prompts/gerar-item.md`; `docs/34`; `docs/32` L306-404.
**Skills:** nenhuma de UI. `humanizer` **não** é usado em enunciado/alternativa/gabarito (só em explicação, e com `humanize-guard.ts`).

**T-07.1 — Script de auditoria e linha de base de qualidade**
- Arquivos: `scripts/content/auditar-qualidade.ts` (**NOVO**; não importado por `src/` — respeita `pipeline-boundary.test.ts`), `content-pipeline/relatorios/qualidade-2026-09/linha-de-base.json` + `.md` (**NOVOS**).
- Faz: para todo item de `src/content/banco/**/*.json` e, em seção separada e informativa, MC de `src/content/trilhas` e `src/data/questions.ts`: as métricas de §G.7, contagem por origem/área/matéria/habilidade/dificuldade/papel/status/`reviewKind`, cobertura (habilidades sem aula; habilidades com < 3 itens de revisão) e a atribuição de cada item a um **estrato** de §G.6. Determinístico (ordenado por id).
- Aceitação: números da linha de base batem com §E (E6–E10) ± itens alterados desde então; qualquer divergência registrada no `37`.
- Comando: `bun scripts/content/auditar-qualidade.ts --out content-pipeline/relatorios/qualidade-2026-09/linha-de-base`.

**T-07.2 — Warnings de qualidade no validador**
- Arquivos: `scripts/content/validate.ts` (novas regras de §G.7 como `warnings` com `severidade`), `content-pipeline/excecoes-qualidade.json` (**NOVO**, `[]`), `tests/unit/pipeline-validate.test.ts`, `content-pipeline/prompts/gerar-item.md` e `criticar.md` (acrescentar: "alternativas com tamanho e nível de detalhe parecidos; nenhuma pista de absolutismo; sem travessão").
- Contrato: `validateExercise` continua devolvendo `{ ok, issues, warnings }`; `ok` **não** muda por warning. Warning traz `{ regra, severidade, detalhe }`. Exceção registrada (id+regra) suprime o warning e aparece no relatório como "exceção".
- Testes: positivos (os 4 ids do `35`), negativos (item MT com correta curta), falso positivo (alternativas numéricas com unidade) coberto por exceção.
- `publish.ts`: warnings de severidade "alta" entram no relatório do lote e exigem aprovação explícita no portão (`isPublishable` passa a exigir `aprova` humano/ia-delegada quando há warning alto — não aprova por amostra).

**T-07.5 — Proveniência, atribuição e `metaFromRef`**
- Arquivos: `src/content/items/types.ts` (`reviewKind?`, `reviewNote?`), `scripts/content/marcar-proveniencia.ts` (**NOVO**, idempotente, `--check`), JSON de `src/content/banco/**` (resultado), `src/content/items/meta/trilhas.ts` (`reviewKind: "autoria-legada"`), `src/content/items/index.ts` `metaFromRef` (lê `source` do ref), `src/components/lessons/FeedbackSheet.tsx` (prop opcional `fonte?: string` renderizada como `text-[11px] text-nevoa` abaixo do título: "Questão do {fonte}"), chamadores do `FeedbackSheet` que conhecem o exercício (`QuestionStepView.tsx`, `LessonPlayer.tsx`), `src/content/oficial/README.md` (379 vs 5526).
- Testes: `official-items.test.ts`: os 18 com `reviewKind: "gabarito-oficial"`, `source.kind "oficial"` na meta resolvida; `item-meta.test.ts`: 737 `ia-delegada`; E2E `feedback.spec.ts`: atividade com item oficial → "ENEM 2023" visível no enunciado **e** na folha.

**T-07.6 — Correções do pipeline e suporte a retirada**
- Arquivos: `scripts/content/verify.ts` (portar `rotulaAfirmacoes`: não remapear rótulos "(A)/(B)…" que marcam afirmações dentro do enunciado; testes com o caso), `scripts/content/publish.ts:327` (ler o arquivo existente e preservar `lessons` ao gravar), `tests/unit/build-packs.test.ts` (fixture em diretório temporário via parâmetro de raiz do script — acrescentar `--root` a `build-packs.ts` se não existir; **nunca** escrever em `src/content/banco` real), `src/content/items/package.ts` (`retired?: boolean`), `src/lib/content/repository.ts`/`itemDisponivel` (exclui `retired` de pools/seleção, mantém em `resolveExercise`), `src/lib/adaptive/select-items.ts`, `checkpoint.ts` (idem), `scripts/content/aulas.ts` (não escolher `retired`).
- Testes: `pipeline-publish.test.ts` (lessons preservadas), `pipeline-verify.test.ts` (afirmações rotuladas), `adaptive-select-items.test.ts` e `placement-pool.test.ts` (item `retired` fora do pool, `resolveExercise` ainda resolve), `build-packs.test.ts` (roda sem sujar `git status`).

**T-07.3 — Revisão dos estratos de risco alto**
- Depende de: T-07.1, T-07.2, T-07.5, T-07.6, T-04.2.
- Arquivos: JSON de `src/content/banco/**` (itens alterados, `version + 1`, `validation.reviewNote`), `content-pipeline/relatorios/qualidade-2026-09/lote-NN.json|.md` (**NOVOS**).
- Processo (executor, sem API paga): para cada lote de ≤ 25 ids na ordem 1e → 1a → 1b/1c/1d: resolver o item **antes** de ler o gabarito (R1); aplicar R2–R8; decidir ações; editar o JSON; rodar `validateExercise` no item; registrar a linha do relatório. Divergência de gabarito → segunda solução independente (subagente com só enunciado+alternativas); se as duas discordarem do gabarito e concordarem entre si → `corrigir`; se discordarem entre si → `retirar` (não adivinhar).
- Regras: não reordenar alternativas; manter o índice da correta; oficiais só metadado; `substituir` vira linha em `content-pipeline/relatorios/qualidade-2026-09/pedidos-de-lote.md` (**NOVO**) e o item fica `retirar` se tiver falha R1–R3, senão `manter` com warning registrado.
- Aula gerada que referencia item `retirar`: trocar a referência por item da mesma habilidade, dificuldade ±1, não retirado, não diagnóstico (regra de `aulas.ts escolherQuestoes`); rodar `validateLessonSteps` na aula; sem substituto → registrar e manter.
- Depois de cada 4 lotes: `bun run build` + `bun test tests/unit` + `git status` (só JSON do banco, derivados e relatórios).
- Checkpoint de parada/retomada: o relatório de lote é a fonte da verdade do que foi feito; retomar pelo primeiro id sem linha em nenhum `lote-*.json`.
- Aceitação: 100 % dos ids do estrato 1 com decisão; taxa "correta estritamente a mais longa" nos itens gerados ≤ 35 % (de 53,1 %) e nenhum item com razão ≥ 2,0 sem decisão registrada (ação ou exceção justificada).

**T-07.4 — Amostras dos estratos médio e baixo**
- Igual à T-07.3, com as regras de amostra e expansão de §G.6. Aceitação: todos os estratos-matéria com amostra mínima decidida; expansões registradas.

**Gate F7:** `bun scripts/content/auditar-qualidade.ts --out …/final` (registrar antes/depois); `bun test tests/unit`; `bun run build`; `bunx playwright test tests/e2e/placement.spec.ts tests/e2e/feedback.spec.ts tests/e2e/lesson-v2.spec.ts tests/e2e/journey*.spec.ts --project=chromium`; `git status` limpo de derivados inesperados.

### Fase 8 — Design System, desktop, dark mode e acessibilidade

**Objetivo:** mesma identidade em qualquer tela, acessível. **Valor:** RU-30, RA-*.
**Context Pack:** §F.6, §G.8; `src/styles.css` (tokens L12-143, utilitários L173-600); `src/components/AppShell.tsx`; `src/components/ds/BottomSheet.tsx`; `src/components/TutorBubble.tsx` L230-390; `src/components/learning/path/JumpToFocusButton.tsx`; `src/routes/quiz.tsx` L110-130; `src/routes/aha.tsx` L40-135; `src/components/brand/FocaMark.tsx`; `src/lib/brand.ts`; `docs/18` §3, §6, §8; `docs/DESIGN.md`; memória do projeto sobre `@theme inline` (usar variável base em `style`).
**Skills:** `web-design-guidelines` (primária — T-08.5, T-08.9), `vercel-react-best-practices` (T-08.5 foco/efeitos), `impeccable` só como crítica final (se disponível). Nunca `design-taste-frontend`/`redesign-existing-projects`.

**Requisitos de acessibilidade (RA):**

| ID | Requisito | Verificação |
|---|---|---|
| RA-1 | Diálogos (`BottomSheet`, painel do tutor): `role="dialog"`, `aria-modal`, rótulo, foco inicial no título, **foco contido** (Tab/Shift+Tab circulam dentro), Escape fecha, foco **volta ao disparador**, fundo `inert`, scroll do fundo travado | E2E teclado |
| RA-2 | Alvos interativos ≥ 44×44 px (área de toque; o visual do `chip` pode continuar 36 px com área expandida) | E2E mede `getBoundingClientRect` + área expandida |
| RA-3 | Todo `<button>` fora de formulário tem `type="button"`; ícones sem texto têm `aria-label` | lint de grep em teste unitário |
| RA-4 | Contraste texto/fundo ≥ 4,5:1 (≥ 3:1 para texto ≥ 18,66 px bold e para bordas de controle) nos dois temas, para os pares de token usados | unitário que calcula contraste dos tokens |
| RA-5 | Busca de curso com `<label>`; resultados anunciados (`aria-live="polite"` com contagem) | E2E |
| RA-6 | `prefers-reduced-motion` respeitado (já existe globalmente) — nada novo anima sem passar por ele | revisão |
| RA-7 | Zoom 200 % e 320 px sem scroll horizontal e sem CTA coberto | E2E |

**T-08.1 — Tokens de layout e `PhoneFrame`**
- Arquivos: `src/styles.css` (`:root` tokens de §F.6 com media queries), `src/components/AppShell.tsx` (`PhoneFrame` com `variant?: "app" | "reading"`; borda lateral ≥ 768 via utilitário CSS `@utility frame-border` com media query, em vez de `md:border-x` em classe), rotas imersivas passam `variant="reading"`: `learn.$lessonId.tsx`, `redacao.$licaoId.tsx`, `atividade.$activityId.tsx`, `nivelamento.tsx`, `quiz.tsx`, `aha.tsx`, `MicroLessonPlayer.tsx`, `LessonPlayer.tsx`.
- Gate de regressão: screenshot/medições em 390 px idênticas às da linha de base (largura da coluna 440 → ainda 390 útil; `getBoundingClientRect` dos elementos principais igual ± 1 px).
- Investigar o aviso de hidratação (`32` L522): reproduzir no dev com console aberto; se persistir depois da troca de classe por utilitário CSS, registrar causa real no `37` (não suprimir o aviso).

**T-08.2 — `NavRail`, elementos fixos e folhas ancorados à coluna**
- Arquivos: `src/components/NavRail.tsx` (**NOVO**; reusa `NAV_ITEMS_V2`/`V1` exportados de `AppShell.tsx`), `AppShell.tsx` (`BottomNav` `lg:hidden`, wrapper `lg:pl-[var(--nav-rail)]`, `main` `lg:pb-12`), `TutorBubble.tsx:238,246` (FAB e painel com `--app-col`/`--nav-rail`), `JumpToFocusButton.tsx:12`, `quiz.tsx:122`, `aha.tsx:130`, `ds/BottomSheet.tsx:50`, `JourneyPath.tsx`/`LearningPath.tsx` (container `max-w-[var(--path-col)] mx-auto`).
- Proibido: qualquer `13.75rem` restante (teste de grep).
- Testes: `tests/e2e/layout.spec.ts` (**NOVO**, projetos `chromium` 390 e `desktop` 1280 + parametrização 320/360/440/768/1024/1440 via `setViewportSize`): sem scroll horizontal; `BottomNav` visível < 1024 e `NavRail` ≥ 1024 (um dos dois, nunca ambos); FAB do tutor dentro da coluna e sem cobrir o CTA primário; folha aberta com largura = coluna; caminho da trilha ≤ 440 px.

**T-08.3 — Nenhum `var(--color-*)` em `style` inline**
- Arquivos: `SessionCard.tsx:50,76`, `redacao.index.tsx:80,194`, `ranking.tsx:58-62`, `profile.tsx:248-249`, `premium.tsx:39-40`, `plan.tsx:54,125`, `dashboard.tsx:115,217-218`, `ds/GoalRing.tsx:30,38`, `learning/ContinueCard.tsx:63,81`; e as sombras arbitrárias `shadow-[…var(--color-gelo)]` (`topics.tsx:74`, `TutorBubble.tsx:238`, `JumpToFocusButton.tsx:12`, `exercises/Reorder.tsx:58,81`, `exercises/MatchPairs.tsx:88`) → variável base (`var(--mar)`, `var(--alert)`, `var(--gelo)`…) ou classe Tailwind equivalente.
- Teste: `tests/unit/css-tokens.test.ts` (**NOVO**): (1) grep em `src/**/*.tsx` falha se achar `var(--color-` dentro de `style=` ou de `[...]` arbitrário; (2) se existir `dist/assets/*.css` (rodar depois de `bun run build` no gate), toda variável base referenciada em `src` existe no CSS compilado com valor em `:root` e em `.dark`.

**T-08.4 — Token `--scrim`**
- Arquivos: `src/styles.css` (`:root { --scrim: rgb(0 0 0 / 0.4) }` e `.dark { --scrim: rgb(0 0 0 / 0.55) }` — escuro um pouco mais denso para separar painel `#262523` de fundo `#1c1b18`), `BottomSheet.tsx:45` (`style={{ background: "var(--scrim)" }}` ou `@utility scrim`).
- Teste: E2E computa o fundo do scrim nos dois temas: preto com alfa 0,4 / 0,55; nunca claro.

**T-08.5 — Diálogos acessíveis**
- Arquivos: `src/components/ds/BottomSheet.tsx`, `src/components/TutorBubble.tsx` (painel), novo hook `src/hooks/useDialogA11y.ts` (**NOVO**: guarda `document.activeElement` ao abrir; foco no título; trap de Tab dentro do painel; Escape; ao fechar devolve foco ao elemento guardado se ainda estiver no DOM; `inert` no irmão do portal/elemento raiz do app (`#root` filho ≠ painel) e `overflow: hidden` no `body` enquanto aberto; limpeza no unmount).
- Decisão: sem biblioteca nova. As primitivas Radix (`src/components/ui/dialog.tsx`) existem mas não são usadas no app; adotá-las mudaria o DOM/estilo de 4 folhas — o hook é menor e mantém o visual. Painel do tutor: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no título "Foca", Escape fecha, **sem** scrim novo (continua como hoje visualmente).
- Testes: `tests/e2e/a11y-dialogs.spec.ts` (**NOVO**): abrir "Sair da lição?" → 10× Tab → foco sempre dentro; Escape → foco volta ao botão "Sair da lição"; fundo não rola; mesmo roteiro para `FocusSheet`, `ChapterCompleteSheet` e painel do tutor.

**T-08.6 — Marca: variante por tema e fallback**
- Arquivos: `src/routes/aha.tsx:47` (renderiza `line-dark` em claro e `line-light` em escuro: dois `FocaMark` com `className="dark:hidden"` / `"hidden dark:block"`), `src/components/brand/FocaMark.tsx` (`onError` → `visibility: hidden` na `<img>`; mantém caixa de tamanho).
- Teste: E2E `/aha` no escuro → imagem visível é a `foca-line-light-720.png`.

**T-08.7 — Copy de marca**
- Arquivos: `src/lib/brand.ts` (RU-20), `docs/21` (inventário, na T-10.3), `tests/unit/brand-voice.test.ts` (acrescentar: `BRAND` não contém "60 segundos" nem "cobra").

**T-08.8 — Alvos, `type` e rótulos**
- Arquivos: `study.tsx:369-375` ("Fechar dica"), `TutorBubble.tsx:340-346` (remover foto), `FeedbackSheet.tsx:98` ("ver resolução"), `nivelamento.tsx:252` (pausar), `styles.css` `chip` (área expandida `::after { inset: -4px }` para chegar a 44), todos os `<button>` sem `type` em `src/routes` e `src/components` (exceto `ui/`) → `type="button"`.
- Teste: `tests/unit/a11y-static.test.ts` (**NOVO**): grep de `<button` sem `type=` em `src/routes|src/components` (fora de `ui/`) = 0. E2E `layout.spec.ts`: alvos listados ≥ 44 px.

**T-08.9 — Revisão formal de acessibilidade e contraste (G16 do `32`)**
- Arquivos: `tests/unit/contrast.test.ts` (**NOVO**: lê os hex de `:root`/`.dark` em `styles.css` e verifica os pares: abismo/neve, abismo/cards, nevoa/neve, nevoa/cards, mar/neve (borda ≥ 3), branco/mar (texto do `btn-primary`), success-texto/cards, error/cards, abismo sobre `color-mix(success 10%, cards)` e `color-mix(error 10%, cards)` — calcular a mistura), `docs/37` (resultado da revisão).
- Processo: carregar `web-design-guidelines` (buscar as regras atuais, como a skill manda) e revisar: `/trilha`, player de aula, atividade, nivelamento + resultado, `/progress`, `/profile`, `/quiz` (curso), folhas. Registrar achados com arquivo:linha; corrigir os de severidade alta **nesta** tarefa; demais viram lista no `37`.
- Se algum par de token falhar contraste: **não** trocar o token de marca sem registrar; propor ajuste no `37` e aplicar só se o valor novo continuar dentro da paleta de `18` §6.1 (ex.: escurecer `--nevoa` claro). Mudança de hex de marca exige nota no `18`.

**T-08.10 — Regressão visual computada (B1/B4 permanentes)**
- Arquivos: `tests/e2e/feedback.spec.ts` (novos casos): para `/learn` (aula), `/atividade` (dinâmica), `/study`, `/redacao/$id` (legado) × acerto/erro/"Não sei" × claro/escuro: `getComputedStyle` da folha → alfa do fundo = 1; `elementsFromPoint` no centro da folha retorna só descendentes da folha; explicação expandida continua legível (folha rola ou cresce sem cobrir o botão "Continuar").
- Gate de build: `bun run build` → `bun test tests/unit/css-tokens.test.ts`.

**Gate F8:** `bunx tsc --noEmit`; `bun test tests/unit`; `bun run build` + `css-tokens.test.ts`; `bunx playwright test` (todos os projetos); `git status`.

### Fase 9 — Cursos: descoberta e cobertura

**Objetivo:** achar o próprio curso em segundos, sem viés de lista. **Valor:** RU-40.
**Context Pack:** §F.7; `src/data/courses.ts`; `src/routes/quiz.tsx` L318-400; `src/routes/profile.tsx`; `src/routes/aha.tsx:59`; `src/lib/tutor-prompt.ts:72`; `tests/e2e/onboarding.spec.ts`.

**T-09.1 — Catálogo com grupos, ids e sinônimos**
- Arquivos: `src/data/courses.ts` (`COURSE_GROUPS`, `COURSES_CATALOG: CourseDef[]`; `COURSES` e `AREA_OF` continuam exportados, derivados, para não quebrar importadores; `AREA_OF[nome]` = nome do grupo novo), `src/lib/courses-search.ts` (**NOVO**: `normalizar`, `buscarCursos(q): CourseDef[]`).
- Testes: `tests/unit/courses.test.ts` (**NOVO**): 82 cursos, 13 grupos não vazios, nomes únicos, os 59 nomes antigos presentes; busca "computacao" → Ciência da Computação e Engenharia de Computação; "ads" → Análise e Desenvolvimento de Sistemas; "VET" → Veterinária; ordenação começa-com antes de contém.

**T-09.2 — Componente de seleção**
- Arquivos: `src/components/onboarding/CourseStep.tsx` (**NOVO**, extraído de `quiz.tsx` e reescrito pelo contrato §F.7), `src/routes/quiz.tsx` (usa o componente; `TargetStep` mantém o `slice(0,12)` — fora de escopo, registrado), `src/lib/copy.ts`.
- Testes: `onboarding.spec.ts`: sem busca nenhuma lista aparece e 13 chips; tocar "Saúde" lista 13 cursos; buscar "psico" → Psicologia; buscar texto inexistente → "Usar “…”" grava o texto; teclado (Tab até o input, digitar, Enter com 1 resultado) seleciona.

**T-09.3 — Editar curso depois**
- Arquivos: `src/routes/profile.tsx` (linha "Curso pretendido" + "Mudar" → `BottomSheet` com `CourseStep` em modo `onSelect` que fecha a folha, sem `onNext`).
- Testes: E2E `/profile` → mudar curso → reload → valor novo; valor legado desconhecido aparece como está.

**Gate F9:** `bunx tsc --noEmit`; `bun test tests/unit`; `bunx playwright test tests/e2e/onboarding.spec.ts tests/e2e/layout.spec.ts --project=chromium --project=narrow`.

### Fase 10 — Regressão, verificação e documentação

**Context Pack:** §O, §L, §I; `docs/ai/SDD-WORKFLOW.md` §6 (níveis de segurança).
**Skills:** `verification-before-completion` (se disponível) ou agente `spec-verifier`; `repo-security-review` modo `--pr` sobre o diff (L2: toca store e storage; não toca tutor/segredo).

**T-10.1 — Regressão completa**
- Comandos, nesta ordem, com saída registrada no `37`: `git status --short`; `bunx tsc --noEmit`; `bun test tests/unit`; `bun run build`; `bun test tests/unit/css-tokens.test.ts`; `bunx playwright test` (todos os projetos); `git status --short`.
- Lint: `bunx eslint $(git diff --name-only 76a7b70 -- 'src/**/*.ts' 'src/**/*.tsx' 'scripts/**/*.ts' 'tests/**/*.ts')` — só arquivos tocados (há ruído histórico de CRLF no Windows, `32` L427). Critério: nenhum **erro** de lint em arquivo tocado; avisos registrados. Não reformatar arquivos alheios nem rodar `--fix` global.

**T-10.2 — Verificação contra critérios e revisão de segurança**
- Rodar o agente `spec-verifier` com `docs/36-…` e os ids G-1…G-20. Critério sem evidência = não cumprido.
- `repo-security-review --pr` sobre o diff; achados High/Critical corrigidos antes de fechar.

**T-10.3 — Atualizações SDD**
- Aplicar a tabela §I. Rodar o gerador do `33` se `reviewKind` entrar lá (procurar o gerador — `scripts/content/` — antes; se não houver saída de `reviewKind` no `33`, não mexer).

**T-10.4 — Registro final e checklist manual**
- `37`: tabela G-1…G-20 com evidência (comando + resultado ou arquivo:linha), divergências, números finais de teste, o que **não** foi feito, e a lista de verificação manual de §L.4 com status ⬜ (não marcar sem evidência humana).

---

## K. File-by-File Plan

Legenda: **F** = fonte, **G** = gerado (nunca editar à mão), **NOVO** = não existe na linha de base. Todos os caminhos sem NOVO foram conferidos no filesystem em 28/09/2026.

| Arquivo | Responsabilidade | Mudança | Tarefa | Consumidores | Teste | Motivo |
|---|---|---|---|---|---|---|
| `src/lib/adaptive/types.ts` F | tipos do motor | `startedAt?` | T-01.1 | journey, rotas | tsc | RF-2 |
| `src/lib/learning/types.ts` F | tipos do estado | campos opcionais §H | T-01.1, T-02.8 | store, migrações | `state-migrations.test.ts` | §H |
| `src/lib/adaptive/constants.ts` F | constantes | `PLANNER_VERSION`, `PLACEMENT_APPLY_VERSION`, cotas de mix, `DESAFIO_SINAL_DIAS` | T-01.1, T-04.3 | planner, journey, store | unit | RP-3, RP-5 |
| `src/lib/store.ts` F | estado central | `startJourneyActivity`, `discardJourneyActivity`, `applyPlacementOutcome`, `applyCheckpointRecalibration`, `clearExpiredFocusSession`, `retryPersist`, `usePersistStatus`; idempotência em `completeJourneyActivity`/`recordLearningAttempt`/`submitPlacementResponse`; `syncJourneyWithCompletions` por `startedAt`; `invalidateJourneyPlan` preserva ativa; `commitPlan` grava `PLANNER_VERSION` e `focusSignature`; `setState` usa retorno de `persist`; listener `storage`; cópia de JSON corrompido | F2, F3, F4, F5 | todo o app | `store-*.test.ts`, `store-persist.test.ts` NOVO | C1–C5 |
| `src/lib/state-migrations.ts` F | migração | **sem mudança** (parsers já preservam) — só testes | T-01.1 | store | `state-migrations.test.ts` | §H |
| `src/lib/adaptive/journey.ts` F | orquestração pura | `ensurePlan` preserva; `isStillValid`; `isReadyToResume`; `hrefForActivity`; compara `PLANNER_VERSION` | T-02.1, T-02.7, T-04.1, T-06.1 | trilha, card, nó, resultado | `journey.test.ts` | RF-1, RF-8 |
| `src/lib/adaptive/candidates.ts` F | candidatos | `lessonIdsForSkill`; legado lê `progress.lessons`; sinal de desafio | T-02.4, T-04.4 | planner | `adaptive-candidates.test.ts` | C4a/b, RP-4 |
| `src/lib/adaptive/planner.ts` F | plano | pré-requisito/aula via `lessonIdsForSkill`; id com `seq`; cota de revisão/teto de desafio | T-02.4, T-02.6, T-04.3 | index/journey | `adaptive-planner.test.ts`, `sim-engine.test.ts` | C4, RP-3 |
| `src/lib/adaptive/scoring.ts` F | score | necessidade de NOVA com prior | T-04.2 | planner | `adaptive-scoring.test.ts` | RP-1 |
| `src/lib/adaptive/index.ts` F | fachada | `selectItemsForActivity` (n por tipo, `targetP` default, data local do checkpoint); export `lessonIdsForSkill` | T-02.1, T-04.4 | rota atividade | `adaptive-select-items.test.ts` | C2, C7 |
| `src/lib/adaptive/checkpoint.ts` F | checkpoint | exclui `retired` | T-07.6 | index | `checkpoint-compose.test.ts` | G.6 |
| `src/lib/adaptive/select-items.ts` F | seleção | exclui `retired` | T-07.6 | index, study | `adaptive-select-items.test.ts` | G.6 |
| `src/lib/adaptive/bootstrap.ts` F | replay | mescla preservando nivelamento | T-04.1 | store | `mastery-bootstrap.test.ts` | risco ALGO |
| `src/lib/adaptive/placement-pool.ts` F | pool + aplicação | `placementItemsById`, `computePlacementOutcome`, comentários | T-03.2, T-03.3, T-03.6 | rota, hook | `placement-pool.test.ts` | C1, C3 |
| `src/lib/adaptive/display.ts` F | textos de exibição | `faixaDaAreaPlacement`, `precisaoDaArea` | T-06.1 | resultado | `skill-display.test.ts` | RU-10 |
| `src/hooks/usePlacementReconciliation.ts` **NOVO** | dono da aplicação do placement | — | T-03.3 | `/trilha`, `/nivelamento` | E2E placement | RF-10/11 |
| `src/hooks/useDialogA11y.ts` **NOVO** | a11y de diálogo | — | T-08.5 | BottomSheet, TutorBubble | `a11y-dialogs.spec.ts` | RA-1 |
| `src/routes/atividade.$activityId.tsx` F | rota de atividade | dono da seleção; descarte; carregando/erro; recalibração de checkpoint | T-02.1, T-02.2, T-04.4 | — | `journey-start.spec.ts` | C2, G7 |
| `src/routes/nivelamento.tsx` F | CAT | mapa reconstituído; sem aplicação própria; resultado novo; alvo 44 px | T-03.2, T-03.3, T-06.1, T-08.8 | — | `placement.spec.ts` | C1, C3 |
| `src/routes/trilha.tsx` F | Home | reconciliação; `?pulada`; assinatura de foco persistida; esqueleto; (memo condicional T-05.6) | T-02.2, T-02.8, T-03.3, T-06.2 | — | `journey*.spec.ts`, `focus.spec.ts` | RF-3, RF-9 |
| `src/routes/__root.tsx` F | raiz | `PersistenceBanner` | T-05.1 | — | `state-migration.spec.ts` | RF-14 |
| `src/routes/quiz.tsx` F | onboarding | usa `CourseStep` novo; `variant="reading"` | T-09.2, T-08.1 | — | `onboarding.spec.ts` | RU-40 |
| `src/routes/profile.tsx` F | perfil | editar curso; `color-mix` inline → base | T-09.3, T-08.3 | — | E2E | RU-40 |
| `src/routes/aha.tsx` F | lacunas | variante de marca por tema; rodapé com token | T-08.6, T-08.2 | — | E2E | G.8 |
| `src/routes/study.tsx` F | Praticar | alvo "Fechar dica" | T-08.8 | — | `layout.spec.ts` | RA-2 |
| `src/routes/{learn.$lessonId,redacao.$licaoId}.tsx` F | players | `variant="reading"` | T-08.1 | — | layout | RU-30 |
| `src/routes/{redacao.index,ranking,premium,plan,dashboard,topics}.tsx` F | telas secundárias | `var(--color-*)` inline → base | T-08.3 | — | `css-tokens.test.ts` | B1 |
| `src/components/AppShell.tsx` F | shell | `PhoneFrame variant`, `BottomNav` com token, `NavRail` | T-08.1, T-08.2 | todas as rotas | `layout.spec.ts` | RU-30 |
| `src/components/NavRail.tsx` **NOVO** | nav ≥ 1024 | — | T-08.2 | AppShell | `layout.spec.ts` | RU-30 |
| `src/components/PersistenceBanner.tsx` **NOVO** | aviso de gravação | — | T-05.1, T-05.3 | `__root` | E2E | RF-14/16 |
| `src/components/learning/PlacementResult.tsx` **NOVO** | resultado do CAT | — | T-06.1 | nivelamento | `placement.spec.ts` | RU-10 |
| `src/components/onboarding/CourseStep.tsx` **NOVO** | seleção de curso | — | T-09.2 | quiz, profile | `onboarding.spec.ts` | RU-40 |
| `src/components/learning/journey/SessionCard.tsx` F | card | start só p/ aula/legado; "Depois:"; classe em vez de style | T-02.1, T-06.2, T-08.3 | trilha | `journey-start.spec.ts` | C2 |
| `src/components/learning/journey/JourneyPath.tsx` F | caminho | start só p/ aula/legado; container `--path-col` | T-02.1, T-08.2 | trilha | idem | C2 |
| `src/components/learning/LearningPath.tsx` F | mapa | container `--path-col` | T-08.2 | trilha | `trail-path.spec.ts` | RU-30 |
| `src/components/learning/path/JumpToFocusButton.tsx` F | botão flutuante | offset por token | T-08.2, T-08.3 | mapa | layout | RU-30 |
| `src/components/TutorBubble.tsx` F | tutor | FAB/painel por token; `role=dialog`; alvo remover foto | T-08.2, T-08.5, T-08.8 | AppShell, players | `tutor.spec.ts`, a11y | RA-1 |
| `src/components/ds/BottomSheet.tsx` F | folha | `--scrim`; `useDialogA11y`; largura por token | T-08.2, T-08.4, T-08.5 | 4 folhas | `a11y-dialogs.spec.ts` | B4, RA-1 |
| `src/components/lessons/FeedbackSheet.tsx` F | feedback | `fonte?`; alvo "ver resolução" | T-07.5, T-08.8 | 3 players | `feedback.spec.ts` | RP-10 |
| `src/components/learning/steps/QuestionStepView.tsx` F | questão | passa `fonte` à folha | T-07.5 | players | idem | RP-10 |
| `src/components/lessons/LessonPlayer.tsx` F | legado | passa `fonte`; `variant` | T-07.5, T-08.1 | redação | `lessons.spec.ts` | RP-10 |
| `src/components/learning/MicroLessonPlayer.tsx` F | player | `variant="reading"` | T-08.1 | learn, atividade | `lesson-v2.spec.ts` | RU-30 |
| `src/components/brand/FocaMark.tsx` F | marca | `onError` | T-08.6 | 30+ usos | unit render | G.8 |
| `src/components/ds/GoalRing.tsx`, `learning/ContinueCard.tsx`, `lessons/exercises/{Reorder,MatchPairs}.tsx` F | DS | tokens base | T-08.3 | — | `css-tokens.test.ts` | B1 |
| `src/styles.css` F | tokens | `--app-col`, `--reading-col`, `--path-col`, `--nav-rail`, `--scrim`, `frame-border`, área de toque do `chip` | T-08.1, T-08.4, T-08.8 | tudo | `css-tokens`, `contrast` | RU-30, RA |
| `src/lib/copy.ts` F | strings | RU-1…RU-6, RU-10…RU-12, cursos | F2, F3, F5, F6, F9 | telas | `brand-voice.test.ts` | voz |
| `src/lib/brand.ts` F | marca | tagline/description | T-08.7 | `__root` | `brand-voice.test.ts` | K16 |
| `src/lib/content/repository.ts` F | pacotes | retry do manifest, dedupe, abort, `retired` | T-05.4, T-07.6 | preload, rotas | `content-repository.test.ts` | C7 |
| `src/lib/courses-search.ts` **NOVO** | busca | — | T-09.1 | CourseStep | `courses.test.ts` NOVO | RU-40 |
| `src/data/courses.ts` F | catálogo | grupos/ids/sinônimos | T-09.1 | quiz, profile | `courses.test.ts` | RU-40 |
| `src/content/items/types.ts`, `package.ts`, `index.ts`, `meta/trilhas.ts` F | metadados | `reviewKind`, `reviewNote`, `retired`, `metaFromRef` | T-07.5, T-07.6 | motor | `item-meta.test.ts`, `official-items.test.ts` | RP-9 |
| `src/content/banco/**/*.json` F (editorial) | itens | `irt` por dificuldade; `reviewKind`; revisão | T-04.2, T-07.5, T-07.3/4 | build-packs | `catalog-irt.test.ts` NOVO | RP-2, RP-7 |
| `src/content/banco/aulas-geradas.ts`, `itens-gerados.ts`, `public/content/v1/**` **G** | índices/pacotes | regenerados por `bun run build`/`dev` | após T-04.2, T-07.* | app | build | — |
| `src/content/oficial/README.md` F | doc | 379 vs 5526 | T-07.5 | — | — | E11 |
| `scripts/content/validate.ts` F | validador | warnings §G.7 | T-07.2 | pipeline | `pipeline-validate.test.ts` | RP-8 |
| `scripts/content/verify.ts` F | verificação | `rotulaAfirmacoes` | T-07.6 | run-stage | `pipeline-verify.test.ts` | C6 |
| `scripts/content/publish.ts` F | publicação | default `irtFromDifficulty`; preserva `lessons`; portão com warning alto | T-04.2, T-07.2, T-07.6 | pipeline | `pipeline-publish.test.ts` | E11, C7 |
| `scripts/content/import-official-items.ts` F | import oficial | default `irtFromDifficulty` | T-04.2 | — | `official-items.test.ts` | E11 |
| `scripts/content/build-packs.ts` F | empacotar | `--root` para teste isolado | T-07.6 | predev/prebuild | `build-packs.test.ts` | C7 |
| `scripts/content/aulas.ts` F | aulas | não escolhe `retired` | T-07.6 | — | `pipeline-aulas.test.ts` | G.6 |
| `scripts/content/recalibrar-irt-dificuldade.ts` **NOVO** | migração editorial de `irt` | — | T-04.2 | — | `catalog-irt.test.ts` | RP-2 |
| `scripts/content/marcar-proveniencia.ts` **NOVO** | `reviewKind` | — | T-07.5 | — | `item-meta.test.ts` | RP-9 |
| `scripts/content/auditar-qualidade.ts` **NOVO** | auditoria | — | T-07.1 | — | relatório determinístico | RP-7 |
| `content-pipeline/excecoes-qualidade.json` **NOVO** | exceções | — | T-07.2 | validate | unit | RP-8 |
| `content-pipeline/relatorios/qualidade-2026-09/*` **NOVO** | relatórios | — | T-07.1, T-07.3, T-07.4 | auditoria | — | RP-7 |
| `content-pipeline/prompts/gerar-item.md`, `criticar.md` F | prompts | paralelismo de alternativas | T-07.2 | lotes futuros | — | RP-8 |
| `content-pipeline/README.md` F | doc | status real, 7b, `reviewKind` | T-10.3 | — | — | K3, K8 |
| `playwright.config.ts` F | E2E | `chromium` 390×844; projeto `desktop`; `narrow` com specs de layout | T-01.4 | — | — | C7 |
| `tests/e2e/helpers/estado.ts` **NOVO** | fixtures | — | T-01.2 | specs | — | persistência |
| `tests/e2e/journey-start.spec.ts` **NOVO** | início/conclusão real | — | T-01.5, F2 | — | — | B2/C2 |
| `tests/e2e/layout.spec.ts` **NOVO** | responsivo | — | T-08.2 | — | — | RU-30 |
| `tests/e2e/a11y-dialogs.spec.ts` **NOVO** | diálogos | — | T-08.5 | — | — | RA-1 |
| `tests/e2e/{journey,placement,feedback,focus,checkpoint,state-migration,tutor,onboarding,trail-home}.spec.ts` F | E2E existentes | casos novos | várias | — | — | — |
| `tests/unit/{store-persist,placement-effect,catalog-irt,css-tokens,a11y-static,contrast,courses}.test.ts` **NOVOS** | unitários | — | várias | — | — | — |
| `tests/unit/{state-migrations,store-journey-actions,store-placement-actions,journey,adaptive-candidates,adaptive-planner,adaptive-scoring,adaptive-select-items,placement,placement-pool,mastery-bootstrap,sim-engine,checkpoint-compose,record-learning-attempt,content-repository,pipeline-validate,pipeline-verify,pipeline-publish,pipeline-aulas,build-packs,official-items,item-meta,skill-display,brand-voice,store-bundle-boundary,adaptive-perf}.test.ts` F | unitários existentes | casos novos | várias | — | — | — |
| `docs/historico/iniciativas/35-36-37-qualidade/37-registro-execucao-qualidade.md` **NOVO** | registro | — | T-00.1…T-10.4 | — | — | SDD |
| `docs/{00-README,PRODUCT,DESIGN,18,21,27,30,31,32,34}.md`, `CLAUDE.md` F | docs | §I | T-10.3 | — | — | SDD |

**Preservado de propósito (não tocar):** `src/routeTree.gen.ts`; `src/lib/tutor*.ts` (exceto se T-05.5 falhar); `src/lib/adaptive/model.ts`, `confidence.ts` (fórmulas); `validateLessonSteps`; `LESSON_SIZE`; `dashboard.tsx` salvo a troca de token; `src/components/ui/*`; `src/assets/branding/foca/*` e `scripts/gerar-logos-foca.ps1`; `package.json`/`bun.lock` (sem dependência nova).

---

## L. Tests

### L.1 Linha de base executada nesta sessão

Ver §0. E2E completo e `narrow` **não** rodados aqui; o executor roda na T-00.2.

### L.2 Matriz requisito × teste

| Requisito | Teste (arquivo) | Existente/NOVO | Dados | Comando | Esperado |
|---|---|---|---|---|---|
| RF-1/RF-2 (C2) | `journey-start.spec.ts` "card abre prática", "nó abre prática", "reload mantém itens"; `journey.test.ts` `isReadyToResume` | NOVO / existente+caso | `comAtividades(["pratica"×3])` | `bunx playwright test tests/e2e/journey-start.spec.ts --project=chromium` | radio visível; `itemIds ≥ 2`; mesmos ids após reload |
| RF-1 famílias | `journey-start.spec.ts` "aula embarcada", "aula de pacote", "legado", "revisão", "desafio", "checkpoint (Começar)", "reforço com aula", "reforço sem aula" | NOVO | fixtures por `kind` (ids reais escolhidos pelo executor via catálogo, registrados) | idem | 1º passo/radio visível em ≤ 10 s |
| RF-3 | `journey-start.spec.ts` "sem itens descarta" | NOVO | skill sem itens | idem | aviso RU-1; próxima diferente; histórico inalterado |
| RF-4 | `store-journey-actions.test.ts` | existente+caso | aula concluída ontem | `bun test tests/unit/store-journey-actions.test.ts` | segue ativa |
| RF-5 | `adaptive-candidates.test.ts`, `adaptive-planner.test.ts` | existente+caso | `progress.lessons` / aula gerada | `bun test tests/unit/adaptive-*.test.ts` | 2ª lição; sem aula repetida |
| RF-6 | `store-journey-actions.test.ts`, `record-learning-attempt.test.ts`, `journey-start.spec.ts` "reload na celebração" | existente+caso / NOVO | — | unit + E2E | 1 histórico, 1 bloco, 1 XP |
| RF-7 | `adaptive-planner.test.ts` | caso | — | unit | ids diferentes |
| RF-8 | `journey.test.ts`, `journey-start.spec.ts` "card mostra a 2ª" | caso / NOVO | — | unit + E2E | B no topo, "Depois: C" |
| RF-9 | `focus.spec.ts`, unit relógio | caso | foco via `/profile` | E2E | fila no foco |
| RF-10 | `placement.spec.ts` "término normal", `store-placement-actions.test.ts` | caso | `USUARIO_ONBOARDED` | `bunx playwright test tests/e2e/placement.spec.ts` | `appliedAt`, priors, fila nova |
| RF-11 | `placement.spec.ts` "reparo" | caso | `comPlacementConcluidoNaoAplicado()` | idem | aplicado na 1ª abertura de `/trilha` |
| RF-12 | `placement.test.ts` | caso | roteiro §D C3 | unit | θ̂/SE iguais |
| RF-13 | `placement-pool.test.ts` | caso | 2 placements | unit | evidência intacta |
| RF-14 | `store-persist.test.ts`, `state-migration.spec.ts` | NOVO / caso | `setItem` que lança | unit + E2E | banner, sem "salvo" |
| RF-15 | `store-persist.test.ts`, E2E 2 páginas | NOVO | — | unit + E2E | adoção sem perda |
| RF-16 | `store-persist.test.ts` | NOVO | `"{quebrado"` | unit | cópia `corrupt.*` |
| RF-17 | `content-repository.test.ts` | caso | fetch mock | unit | retry e 1 fetch |
| RF-18 | `tutor.spec.ts` | caso | rota abortada | E2E | estudo continua; tutor não abre sozinho |
| RP-1 | `placement-effect.test.ts`, `adaptive-scoring.test.ts` | NOVO / caso | perfis A/B | unit | filas diferentes na direção esperada |
| RP-2 | `catalog-irt.test.ts` | NOVO | catálogo | unit | b = mapa |
| RP-3 | `sim-engine.test.ts` | caso | 4 perfis | unit | cotas |
| RP-4 | `checkpoint-compose.test.ts`, `checkpoint.spec.ts` | caso | `predictedP` alto + erro | unit + E2E | revisão amanhã |
| RP-5 | `journey.test.ts`, `mastery-bootstrap.test.ts` | caso | planVersion 1 | unit | 1 replano; nivelamento preservado |
| RP-6 | `placement.spec.ts` | caso | CAT | E2E | sem %/nível/nota |
| RP-7 | relatórios `lote-*.json` + `auditar-qualidade.ts` | NOVO | acervo | script | decisões por id; métricas-alvo |
| RP-8 | `pipeline-validate.test.ts` | caso | ids do `35` | unit | warnings certos |
| RP-9 | `item-meta.test.ts`, `official-items.test.ts` | caso | catálogo | unit | `reviewKind` |
| RP-10 | `feedback.spec.ts` | caso | item oficial | E2E | "ENEM 2023" no enunciado e na folha |
| RU-10/12 | `placement.spec.ts`, `trail-home.spec.ts` | caso | — | E2E | textos §F |
| RU-30 | `layout.spec.ts` | NOVO | 320…1440 | `bunx playwright test tests/e2e/layout.spec.ts --project=chromium --project=desktop --project=narrow` | sem scroll-x; nav certa; FAB sem cobrir CTA |
| RU-40 | `courses.test.ts`, `onboarding.spec.ts` | NOVO / caso | — | unit + E2E | busca e grupos |
| RA-1 | `a11y-dialogs.spec.ts` | NOVO | 4 folhas + tutor | E2E | foco contido e devolvido |
| RA-2/3 | `a11y-static.test.ts`, `layout.spec.ts` | NOVO | — | unit + E2E | 0 botões sem `type`; alvos ≥ 44 |
| RA-4 | `contrast.test.ts` | NOVO | tokens | unit | pares ≥ limiar |
| B1 | `feedback.spec.ts` (computado), `css-tokens.test.ts` | caso / NOVO | 4 fluxos × 3 × 2 | E2E + unit pós-build | alfa 1 |
| B4 | `a11y-dialogs.spec.ts` (scrim) | NOVO | 2 temas | E2E | preto 0,4/0,55 |
| Rollback | `journey.spec.ts` "flag desligada", `placement.spec.ts` "flag desligada" | existentes | `foca.flags` | E2E | mapa/redirect; dados intactos |
| Fronteiras | `store-bundle-boundary.test.ts`, `pipeline-boundary.test.ts` | existente+caso | — | unit | verde |

**Regras para todo teste novo:** fixture realista (estado que o app poderia ter gravado); asserção de **UI e de estado**; `seedOnce` sempre que houver reload/navegação completa; nunca remover asserção para acomodar regressão; cada teste cita no nome ou comentário o requisito (RF/RP/RU/RA) e a falha que detecta.

### L.3 Gates por fase

Ver o "Gate" no fim de cada fase em §J. Regressão completa: T-10.1.

### L.4 Verificação manual (status separado — não fingir evidência)

| Item | Como | Quem pode fornecer |
|---|---|---|
| Safari iOS e Chrome Android físicos: fluxo C1/C2 corrigido, folha de feedback, scrim | celular real, tema claro e escuro | usuário |
| Leitor de tela (VoiceOver/TalkBack): diálogos, resultado do nivelamento, busca de curso | celular real | usuário |
| Áudio/háptico (Fase 1 do `31`, nunca rodada) | celular real, modo silencioso | usuário — fora do escopo de correção deste plano |
| Legibilidade subjetiva do desktop em 1280/1440 | navegador | usuário |

---

## M. Migration / Compatibility

| Situação | Comportamento após este plano |
|---|---|
| Usuário novo | nada especial; campos novos nascem no primeiro uso |
| v3/v4/v5 no storage | `computeAdditiveFields` como hoje → v6; campos novos ausentes = default |
| v6 sem campos novos | defaults de §H; `planVersion 1 ≠ PLANNER_VERSION 2` → **um** replano preservando a iniciada |
| `activeActivity` dinâmica sem `itemIds` (tocou o card desde 28/09) | `isReadyToResume` falso → seleciona no próximo clique (auto-reparo) |
| `activeActivity` aula/legado sem `startedAt` | sync pela regra antiga (existência) |
| Histórico sem `attemptKey` | não participa da guarda (só tentativas novas); ledger antigo `atividade:<id>` preservado |
| Placement `concluido` sem `appliedAt` | reparado uma vez por `usePlacementReconciliation` |
| Placement `em-andamento`/`abandonado` | retomada com mapa reconstituído (C3 corrigido) |
| Itens com `irt` default | trocados na fonte (T-04.2); tentativas antigas não são reinterpretadas (o replay usa a meta atual, comportamento existente; `ALGO_VERSION` não muda, então não há replay) |
| Item revisado (`version+1`) | `Attempt.exerciseVersion` antigo fica; sessão ativa com o item continua (índice da correta e ordem de alternativas não mudam) |
| Item `retired` | some de pools/seleção; resolvível para histórico, sessão ativa e aula que ainda o referencie |
| `prefs.targetCourse` antigo | nomes antigos não mudam; desconhecido é mostrado como está |
| Storage cheio/bloqueado | banner RU-4; estado em memória segue correto; nenhum "salvo" |
| JSON corrompido | cópia `foca.state.corrupt.<ISO>` + RU-5 |
| Versão futura | não grava (RU-6) |
| Duas abas | adoção por evento `storage` |
| Flags desligadas | Home = mapa; `/atividade`/`/nivelamento` redirecionam; nada é apagado; reconciliação do placement não roda com `nivelamento` desligada |
| Rollback de código para `76a7b70` | campos novos preservados pelos parsers antigos e ignorados; `planVersion 2` ≠ `ALGO_VERSION 1` antigo → 1 replano; itens com `irt` novo continuam válidos; `retired` ignorado (item volta a circular — aceitável). Nenhuma perda de progresso |

Sem backend: nenhuma garantia entre dispositivos, origens ou após limpar dados do navegador — a copy nunca promete isso.

---

## N. Risks

| # | Risco | Prob. | Impacto | Evidência | Mitigação |
|---|---|---|---|---|---|
| N1 | T-04.2 (b por dificuldade) muda números de testes de simulação e a sensação do CAT | alta | médio | 755 itens com b = 0 hoje | regra de atualização de expectativa só com explicação; registrar cada número no `37`; `placement-effect.test.ts` como juiz de comportamento |
| N2 | Pool diagnóstico concentrado em d3 (ex.: CN d2 4, d3 34, d4 4) limita a adaptação do CAT mesmo com b correto | alta | médio | tabela do pool (auditoria) | registrar como limitação; T-07.3 revisa os 178 diagnósticos primeiro; ampliar faixas exige lote novo (fora) |
| N3 | Reposição preservando comprometidas (T-02.7) reabre o loop de commit do F12.5 | média | alto | `journey.ts:53-68` | manter `semMudanca`; teste (e) de T-02.7 |
| N4 | `startedAt` comparado com `completedAt` em fusos/relógio do aparelho alterado | baixa | médio | ISO UTC em ambos | comparar ISO UTC (mesma fonte `new Date().toISOString()`); relógio para trás → regra cai no "não concluído", aluno conclui de novo (sem perda) |
| N5 | `inert` + trap quebra algum fluxo existente (tutor dentro de player, checkpoint sem tutor) | média | médio | nenhum diálogo usa hoje | `a11y-dialogs.spec.ts` + rodar `tutor.spec.ts`, `lesson-v2.spec.ts` no gate F8 |
| N6 | Mudar o projeto `chromium` para 390 revela falhas antigas mascaradas pelo 1280 | alta | baixo | config | registrar como achado; `test.fixme` com tarefa dona; nunca apagar asserção |
| N7 | Revisão de conteúdo por IA (mesma família de modelo que gerou) tem erros correlacionados | média | alto | geração Haiku, revisão Sonnet | R1 com solução antes de ver gabarito; divergência → 2ª solução independente; dúvida → `retirar`, nunca adivinhar; honestidade em `reviewKind` |
| N8 | `retired` deixa aula gerada com < 4 questões | baixa | médio | 44 aulas com 5 questões | troca por item irmão; sem substituto → manter item e registrar |
| N9 | Desktop: `NavRail` + coluna larga desalinham folhas/FAB em algum ponto não listado | média | médio | 3 offsets `13.75rem` achados | teste de grep proibindo `13.75rem`/`440px` fora dos tokens; `layout.spec.ts` em 7 larguras |
| N10 | `useMemo` seletivo de `buildTrail` (se acionado) esquece dependência → trilha desatualizada | média | alto | T-05.6 | só aplicar se o limiar for excedido; lista de dependências fechada no plano; E2E de trilha no gate |
| N11 | Listener `storage` substitui estado enquanto um player está no meio | baixa | médio | — | player lê `activeSession` do store; aceito "última escrita vence" para duas abas no mesmo player; registrado |
| N12 | Contraste de token falhar e exigir mudar hex de marca | média | médio | `--nevoa #737075` sobre `#f6f5f1` ≈ 4,6:1 (limite) | regra de T-08.9: só ajuste dentro da paleta e com nota no `18` |
| N13 | Dependência externa: arte final das 8 expressões | certa | baixo | fallback neutro | não bloqueia; nada a fazer neste plano |
| N14 | Build regenera arquivos derivados e suja o tree | média | baixo | `predev`/`prebuild` | `git status` em todo gate; T-07.6 isola o teste de `build-packs` |

---

## O. Acceptance Criteria

### O.1 Globais

| ID | Critério | Como verificar | Requisitos |
|---|---|---|---|
| G-1 | Pelo CTA e pelo nó, toda família de atividade abre conteúdo | `journey-start.spec.ts` verde | RF-1, RF-2 |
| G-2 | Concluir qualquer família avança a fila; a Home oferece outra atividade válida; nenhuma lição concluída reaparece como nova | `journey-start.spec.ts`, unit candidatos | RF-3…RF-5, RF-8 |
| G-3 | Conclusão idempotente em todos os efeitos | unit + E2E reload | RF-6, RF-7 |
| G-4 | Nivelamento terminado por qualquer caminho aplica priors uma vez, recompõe a fila e sobrevive a reload; contas antigas reparadas | `placement.spec.ts` (2 casos), unit | RF-10, RF-11 |
| G-5 | Retomada do nivelamento = execução contínua | unit | RF-12 |
| G-6 | Perfis controlados diferentes → filas diferentes na direção pedagógica esperada, sem pular aula por prior | `placement-effect.test.ts` | RP-1 |
| G-7 | Nenhum item de pacote com `irt` default; b segue a dificuldade | `catalog-irt.test.ts` | RP-2 |
| G-8 | Mix com revisão devida: 2–4 revisões por janela de 10; desafio ≤ 2 | `sim-engine.test.ts` | RP-3 |
| G-9 | Checkpoint recalibra revisão/desafio | unit + `checkpoint.spec.ts` | RP-4 |
| G-10 | `ALGO_VERSION` inalterado; bootstrap preserva nivelamento | unit | RP-5 |
| G-11 | Resultado do nivelamento conforme §F.5 | `placement.spec.ts` | RP-6, RU-10 |
| G-12 | 100 % do estrato de risco alto com decisão por id; correta-mais-longa ≤ 35 % nos gerados; 0 itens ≥ 2,0 sem decisão | relatórios + `auditar-qualidade.ts` | RP-7 |
| G-13 | Validador com warnings de §G.7 e testes positivos/negativos/falsos positivos | `pipeline-validate.test.ts` | RP-8 |
| G-14 | `reviewKind` honesto; atribuição oficial em todos os consumidores e na folha | unit + `feedback.spec.ts` | RP-9, RP-10 |
| G-15 | Falha de gravação/JSON corrompido/versão futura/duas abas tratados sem perda silenciosa | `store-persist.test.ts` + E2E | RF-14…RF-16 |
| G-16 | Pacote/manifest com retry e dedupe; tutor offline não trava estudo | unit + `tutor.spec.ts` | RF-17, RF-18 |
| G-17 | Layout: < 768 idêntico ao de hoje; ≥ 1024 com `NavRail`; sem scroll-x de 320 a 1440 e em zoom 200 %; nada de `13.75rem`/`var(--color-*)` inline | `layout.spec.ts`, `css-tokens.test.ts` | RU-30, B1 |
| G-18 | Diálogos acessíveis; alvos ≥ 44; `type` em botões; contraste dos pares | `a11y-dialogs.spec.ts`, `a11y-static.test.ts`, `contrast.test.ts`, revisão `web-design-guidelines` no `37` | RA-1…RA-7 |
| G-19 | Cursos: 82 em 13 grupos, busca sem acento com sinônimos, editar no perfil, valor legado preservado | `courses.test.ts`, `onboarding.spec.ts` | RU-40 |
| G-20 | Regressão completa verde; docs de §I atualizados; `37` com evidência de G-1…G-19; nada de "tudo pronto" sem evidência | T-10.1…T-10.4 | todos |

### O.2 Preservação (não pode regredir)

Feedback imutável por tentativa; tutor só manual (errar não abre nem envia); "Não sei" sem punição visual; XP de replay = diferença de faixa; mapa por matéria e fluxo legado de redação funcionais; flags desligadas = comportamento anterior sem perda; `/study` com 2 questões; mobile < 768 px visualmente igual; identidade Rabisco e `FocaMark` como único ponto de logo; fronteiras de bundle; nenhum segredo no cliente.

### O.3 O que este plano **não** cumpre (explícito)

Validação em dispositivo físico, leitor de tela real e áudio/háptico (§L.4); arte final das expressões; ampliação de cobertura de conteúdo (9 habilidades sem aula) e novos itens diagnósticos por faixa; importação de parâmetros Inep; tela própria de resultado de checkpoint; revisão item a item dos 1.204 legados.

---

## P. Execution Checklist for Sonnet

**Antes de começar:** plano com status "aprovado em DD/MM/AAAA" (se não, **parar**). Ler este documento, `CLAUDE.md`, `AGENTS.md`, `docs/ai/SDD-WORKFLOW.md`. Conferir `docs/37` para saber onde parar/retomar.

**Retomada:** a última tarefa com "✅ + evidência" no `37` é o ponto de partida; tarefa "em andamento" é refeita do início do seu contrato (todas são idempotentes em código; scripts de conteúdo têm `--check`). Revisão de conteúdo retoma pelo primeiro id sem linha nos `lote-*.json`.

1. **F0** T-00.1 → T-00.2. Gate F0.
2. **F1** T-01.1 → T-01.2 → T-01.3 → T-01.4 → T-01.5. Gate F1.
3. **F2** T-02.1 → T-02.2 → T-02.3 → T-02.4 → T-02.5 → T-02.6 → T-02.7 → T-02.8. Gate F2.
4. **F3** T-03.1 → T-03.2 → T-03.3 → T-03.4 → T-03.6 (T-03.5 vai para o fim da F4). Gate F3.
5. **F4** T-04.1 → T-04.2 (script `--check`, depois aplicar, depois `bun run build`) → T-03.5 → T-04.3 → T-04.4. Gate F4.
6. **F5** T-05.1 → T-05.2 → T-05.3 → T-05.4 → T-05.5 → T-05.6. Gate F5.
7. **F6** T-06.1 → T-06.2. Gate F6.
8. **F7** T-07.1 → T-07.2 → T-07.5 → T-07.6 → T-07.3 → T-07.4. Gate F7.
9. **F8** T-08.1 → T-08.2 → T-08.3 → T-08.4 → T-08.5 → T-08.6 → T-08.7 → T-08.8 → T-08.9 → T-08.10. Gate F8.
10. **F9** T-09.1 → T-09.2 → T-09.3. Gate F9.
11. **F10** T-10.1 → T-10.2 → T-10.3 → T-10.4.

Em cada tarefa: (a) ler o Context Pack da fase; (b) escrever/ajustar o teste que falha; (c) implementar o contrato; (d) rodar o comando da tarefa; (e) registrar no `37` (arquivos, comando, resultado, divergências). Commit só se o usuário pedir.

---

### READY FOR SONNET EXECUTION

> Significa "pronto para o executor", **não** "autorizado". Executar só depois de o usuário aprovar este documento.

**1. Ordem exata das fases e tarefas**

F0: T-00.1, T-00.2 → F1: T-01.1, T-01.2, T-01.3, T-01.4, T-01.5 → F2: T-02.1, T-02.2, T-02.3, T-02.4, T-02.5, T-02.6, T-02.7, T-02.8 → F3: T-03.1, T-03.2, T-03.3, T-03.4, T-03.6 → F4: T-04.1, T-04.2, T-03.5, T-04.3, T-04.4 → F5: T-05.1, T-05.2, T-05.3, T-05.4, T-05.5, T-05.6 → F6: T-06.1, T-06.2 → F7: T-07.1, T-07.2, T-07.5, T-07.6, T-07.3, T-07.4 → F8: T-08.1 … T-08.10 (em ordem) → F9: T-09.1, T-09.2, T-09.3 → F10: T-10.1, T-10.2, T-10.3, T-10.4.

**2. Arquivos envolvidos**

- *Fontes existentes a alterar:* os marcados F em §K (store, tipos, constantes, motor adaptativo, rotas `atividade`, `nivelamento`, `trilha`, `__root`, `quiz`, `profile`, `aha`, `study`, players, `AppShell`, `SessionCard`, `JourneyPath`, `LearningPath`, `JumpToFocusButton`, `TutorBubble`, `BottomSheet`, `FeedbackSheet`, `QuestionStepView`, `LessonPlayer`, `MicroLessonPlayer`, `FocaMark`, `GoalRing`, `ContinueCard`, `Reorder`, `MatchPairs`, telas secundárias com token inline, `styles.css`, `copy.ts`, `brand.ts`, `repository.ts`, `courses.ts`, metadados de itens, scripts de conteúdo, JSON editoriais do banco, `playwright.config.ts`, testes existentes, docs de §I).
- *Novos:* `docs/historico/iniciativas/35-36-37-qualidade/37-registro-execucao-qualidade.md`; `src/hooks/usePlacementReconciliation.ts`; `src/hooks/useDialogA11y.ts`; `src/components/NavRail.tsx`; `src/components/PersistenceBanner.tsx`; `src/components/learning/PlacementResult.tsx`; `src/components/onboarding/CourseStep.tsx`; `src/lib/courses-search.ts`; `scripts/content/recalibrar-irt-dificuldade.ts`; `scripts/content/marcar-proveniencia.ts`; `scripts/content/auditar-qualidade.ts`; `content-pipeline/excecoes-qualidade.json`; `content-pipeline/relatorios/qualidade-2026-09/*`; `tests/e2e/helpers/estado.ts`; `tests/e2e/{journey-start,layout,a11y-dialogs}.spec.ts`; `tests/unit/{store-persist,placement-effect,catalog-irt,css-tokens,a11y-static,contrast,courses}.test.ts`.
- *Gerados (nunca à mão; regenerar com `bun run build`):* `src/content/banco/aulas-geradas.ts`, `src/content/banco/itens-gerados.ts`, `public/content/v1/**`, `src/routeTree.gen.ts` (se uma rota nova surgir — nenhuma é prevista).

**3. Testes obrigatórios por gate**

- Toda tarefa: `bunx tsc --noEmit` (exit 0) e `bun test tests/unit` (0 fail).
- Gates: listados no fim de cada fase em §J, com os specs e projetos exatos. Fixtures: `tests/e2e/helpers/estado.ts` (`USUARIO_ONBOARDED`, `comAtividades`, `comPlacementConcluidoNaoAplicado`, `comLicaoLegadaConcluida`, `comAulaConcluida`) com `seedOnce`; roteiro sintético de C3 (§D); perfis A/B de T-03.5; 4 perfis de T-04.3.
- Final (T-10.1): `bunx tsc --noEmit`; `bun test tests/unit`; `bun run build`; `bun test tests/unit/css-tokens.test.ts`; `bunx playwright test` (projetos `chromium` 390×844, `desktop` 1280×800, `narrow` 320×700) — **todos verdes**, sem `test.fail`/`failing` remanescentes dos criados na T-01.5.

**4. Migrations**

- **Sem bump de `schemaVersion`** (fica 6) — justificativa em §H: campos opcionais com default, parsers preservam extras, rollback seguro.
- Migração de **plano**: `PLANNER_VERSION 2` provoca um replano por conta preservando a atividade iniciada.
- Migração **editorial** (dados de conteúdo, não do aluno): `recalibrar-irt-dificuldade.ts` e `marcar-proveniencia.ts`, idempotentes, com `--check`; rollback = Git dos JSON.
- Reparo de dados do aluno: `usePlacementReconciliation` (placement concluído sem `appliedAt`), idempotente por guarda no mutator; nunca sobrescreve evidência.
- Preservados sempre: XP, streak, conclusões, melhor desempenho, preferências, sessões, respostas/ordens, histórico, evidências, agenda, ledger.

**5. Dependências entre fases (contratos produzidos → consumidos)**

- F1 produz tipos opcionais, `PLANNER_VERSION`, helpers de fixture e testes vermelhos → todas as fases.
- F2 produz `startJourneyActivity`, `isReadyToResume`, `hrefForActivity` (F6), `invalidateJourneyPlan` preservando ativa (F3), `seq` (F2/F4), `ensurePlan` preservador (F3/F4).
- F3 produz `appliedAt`, `computePlacementOutcome`, `placementItemsById`, `usePlacementReconciliation` → F4 (T-03.5), F6 (resultado).
- F4 produz `irt` por dificuldade (F7 revisa sobre ele), necessidade com prior, cota de mix, `applyCheckpointRecalibration`.
- F5 produz `persistStatus`/banner (F8 posiciona com token).
- F7 produz `retired`, `reviewKind`, `fonte` na folha.
- F8 produz tokens de layout (F9 usa no `BottomSheet` do perfil).
- Retomada: ver §P "Retomada".

**6. Pontos que NÃO podem ser alterados**

- Tutor estritamente manual; feedback imutável por tentativa; "Não sei" sem punição.
- Fórmulas e constantes de Mastery/Confidence; `ALGO_VERSION = 1`; faixas de exibição; regras de aula opcional/pré-requisito/desafio.
- `validateLessonSteps` e `LESSON_SIZE = 2`.
- Ordem das alternativas e índice da correta de itens publicados; enunciado/alternativas de itens oficiais; escopo de fontes do `34`.
- Status `revisada-humano`/`oficial-conferida` e a elegibilidade do pool (só se acrescenta `reviewKind`).
- Store único (`src/lib/store.ts`), chave `foca.state.v3`, sem segundo mecanismo de estado; fronteiras de bundle (`store` sem conteúdo; `src` sem `scripts/content`).
- Stack (TanStack/React/Tailwind v4/Bun), sem dependência nova; identidade Rabisco, `FocaMark` como único logo, sem arte nova; mobile < 768 px visualmente igual.
- `src/routeTree.gen.ts` à mão; derivados à mão.
- Git/Lovable: sem force-push, rebase, amend ou squash de publicados; sem commit/push/branch/worktree sem pedido.
- Sem analytics externo, sem coleta nova de dados, sem geração paga de conteúdo.

**7. Critérios finais de conclusão**

G-1 a G-20 (§O.1) todos com evidência registrada no `docs/37` (comando + resultado ou arquivo:linha); preservações de §O.2 verificadas pela regressão completa; §O.3 declarado no `37` como não feito; checklist manual de §L.4 listado com status ⬜ (não marcado sem evidência humana).

**Dependência externa pendente:** apenas a arte final das 8 expressões da Foca (`18` D5) — **não bloqueia nenhuma fase**. Nenhuma fase está bloqueada.
