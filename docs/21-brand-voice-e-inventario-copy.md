# 21 — Brand voice: inventário de copy e registro da Fase 3

Execução: 21/09/2026. Fase 3 de [20-plano-evolucao-aprendizagem.md](20-plano-evolucao-aprendizagem.md) — não confundir com revisão pedagógica de conteúdo (enunciados/explicações dos 1.204 exercícios e 59 questões seguem **fora** desta passada; ver seção 4).

## 1. O que este documento é (e o que não é)

É o inventário de superfícies com texto voltado ao usuário, com status por linha: **revisado** (aplicado nesta Fase 3, com evidência abaixo), **pendente** (existe, ainda não passou pela seção 7 do `20`) ou **n/a** (não é copy funcional/de marca — ex.: nome de variável, conteúdo pedagógico versionado à parte).

Não é uma declaração de que todo o app já fala a nova voz. Onde este documento diz "pendente", o texto atual pode ainda carregar tom de documentação antiga (sarcasmo, "cobrança", entusiasmo genérico) — tratar como **não verificado**, não como aprovado por omissão.

## 2. Revisado nesta Fase 3 — com evidência

| ID | Arquivo/componente | Estado/gatilho | Texto antes | Texto depois | Revisão |
|---|---|---|---|---|---|
| tutor.persona | `src/lib/tutor-prompt.ts` (`buildSystemPrompt`) | Todo turno do tutor de IA | "seca, sarcástica, cômica (...) cobra disciplina do aluno" | "colega de estudo atento e direto (...) humor, no máximo uma vez, nunca sobre a capacidade do aluno" | Teste `tests/unit/brand-voice.test.ts` |
| tutor.ausencia | `src/lib/tutor-prompt.ts` | Regra dura do prompt | "Você só implica com ausência, nunca com erro" (cobrança permitida por ausência) | "Ausência também não gera cobrança: se o aluno sumiu e voltou, receba sem puxar o assunto" | Mesmo teste |
| voz.errou[3] | `src/lib/voz.ts` (slot `errou`) | 4ª variação ao errar uma questão | "Anotado. Vou te cobrar essa de novo semana que vem." | "Marquei aqui. Bora ver onde travou." | Teste `tests/unit/brand-voice.test.ts` — nenhuma fala de `errou` contém "cobrar" |
| feedback.* | `src/components/lessons/FeedbackSheet.tsx` | Botões "Ver/Ocultar resolução", "Explicar melhor", "Continuar"/"Ver resultado" | Strings soltas no componente | Centralizadas em `src/lib/copy.ts` → `COPY.feedback.*` | Revisão manual — mesmo texto, só a fonte mudou; nenhuma mudança de significado |
| tutor.ui.* | `src/components/TutorBubble.tsx` | Header, aria-labels, placeholder, saudação, sugestões, erro de rede | Strings soltas no componente | Centralizadas em `COPY.tutor.*`; erro de rede alinhado ao exemplo literal do `20 §7.1` ("Não consegui responder agora. Tente de novo.") | Revisão manual + `tests/e2e/tutor.spec.ts` (fluxo continua funcionando) |
| tutor.contexto | `src/components/TutorBubble.tsx` (seleção de sugestões) | Decidir se mostra sugestões de "erro" ou "ajuda" | Inferia por `focus.chosen && focus.chosen !== focus.correct` (frágil pra resposta composta) | Usa `focus.answered`/`focus.wasCorrect`, a mesma correção já aplicada em `tutor-prompt.ts` na Fase 1 | Revisão manual, consistente com `tests/unit/tutor-focus.test.ts` |

`src/lib/copy.ts` documentava no topo, até a Fase 3 do `20`, que cobria só estas duas superfícies. O `25` (T-10/T-16) estendeu `COPY` com mais dois blocos — registrados abaixo, mesma granularidade e mesmo padrão de evidência desta seção. Não adicionar string nova em `copy.ts` sem atualizar este inventário.

### 2.1 `COPY.licao.*` — player de lição passo a passo (docs/25 T-10, T-28)

| Chave | Texto | Uso | Revisão |
|---|---|---|---|
| `comecar` | "Começar" | Botão que inicia a lição, primeiro passo (`intro`) | `tests/e2e/lesson-v2.spec.ts` (`getByRole("button", { name: "Começar" })`) |
| `continuar` | "Continuar" | Botão de avanço entre passos de ensino (`teach`/`tip`/`recap`) | Mesmo spec |
| `verificar` | "Verificar" | Botão que confirma resposta de uma questão | Mesmo spec |
| `concluir` | "Concluir lição" | Botão do último passo | `tests/e2e/chapter-complete.spec.ts` (percorre até concluir) |
| `dica` | "Dica" | Rótulo do passo `tip` | n/a — não tem asserção de texto própria; conferido por leitura de `TipStepView.tsx` |
| `sair` | "Sair da lição" | CTA de saída no header do player | `tests/e2e/lesson-v2.spec.ts` (fluxo completo passa pelo header) |
| `sairTitulo` | "Sair da lição?" | Título do modal de confirmação de saída | Revisão manual — nenhum E2E clica em "Sair" no meio da lição ainda; **pendente de teste**, não de revisão de tom |
| `sairCorpo` | "Seu progresso nesta lição fica salvo — você retoma de onde parou na próxima vez." | Corpo do modal de saída | Mesma ressalva — revisão de tom feita, sem E2E dedicado |
| `sairFicar` | "Continuar estudando" | Botão que cancela a saída | Mesma ressalva |
| `sairMesmo` | "Sair mesmo assim" | Botão que confirma a saída | Mesma ressalva |
| `voceAprendeu` | "Você aprendeu" | Título da tela de conclusão (resume o que a lição ensinou, G8/`25` §20) | `tests/e2e/chapter-complete.spec.ts` percorre a tela de conclusão; não asserta esse texto literal — **verificação parcial** |
| `refazer` | "Refazer lição" | Botão pós-conclusão | Revisão manual |
| `roles.checkpoint`/`.pratica`/`.desafio`/`.revisao` | "Checkpoint"/"Prática"/"Desafio"/"Revisão" | Rótulo do tipo de questão dentro do passo `question` | Revisão manual + `tests/unit/validate-v2.test.ts` (valida os `role` em si, não o rótulo em português) |

Tom conferido contra as mesmas regras da seção 7 do `20` que já valiam pro resto de `copy.ts`: sem emoji, sem exclamação dupla, sem cobrança ("Seu progresso... fica salvo" é factual, não ameaça perder nada). Nenhuma string aqui foi testada por `brand-voice.test.ts` especificamente — esse teste cobre `voz.ts`/`tutor-prompt.ts`, não `copy.ts` ainda (mesma lacuna que já existia pro bloco `feedback`/`tutor` antes desta atualização).

### 2.2 `COPY.trilha.*` — home/trilha, nó/capítulo/seção (docs/25 T-16, T-28)

| Chave | Texto | Uso | Revisão |
|---|---|---|---|
| `continuar` | "Continuar" | CTA único do card de continuar (G2) | `tests/e2e/trail-home.spec.ts` (`getByRole("link", { name: "Continuar", exact: true })`) |
| `comecarAqui` | "Começar por aqui" | Rótulo pequeno do card quando é a 1ª lição do aluno | Mesmo spec |
| `secao(n)` | "Seção N" | Cabeçalho de seção | `tests/e2e/trilha.spec.ts` (percorre seções) |
| `estados.completed` | "Concluída" | Rótulo textual de nó concluído (G3 — trilha nunca depende só de cor) | `tests/e2e/trilha.spec.ts` ("mostra nós com rótulo textual de estado") |
| `estados["completed-review"]` | "Concluída · revisão sugerida" | Nó concluído com revisão de capítulo disponível | `tests/e2e/chapter-complete.spec.ts` (nó "Revisão" fica `Disponível` após concluir capítulo) — cobre o estado da revisão em si, não necessariamente esta string composta |
| `estados["in-progress"]` | "Em andamento" | Nó com sessão ativa não concluída | Revisão manual |
| `estados.current` | "Continuar daqui" | Nó recomendado agora | `tests/e2e/trail-home.spec.ts`/`trilha.spec.ts` |
| `estados.available` | "Disponível" | Nó desbloqueado, não iniciado | `tests/e2e/trilha.spec.ts`, `chapter-complete.spec.ts` |
| `estados.locked` | "Bloqueada" | Nó bloqueado | `tests/e2e/trilha.spec.ts` ("URL direta pra uma lição bloqueada respeita a mesma regra do nó") |
| `kinds.aula`/`.pratica`/`.revisao` | "Aula"/"Prática"/"Revisão do capítulo" | Tipo de nó | Revisão manual |
| `capituloBloqueado` | "Conclua o capítulo anterior" | Mensagem quando um capítulo inteiro está bloqueado | Revisão manual — sem E2E dedicado (nenhum capítulo publicado tem pré-requisito de capítulo hoje, ver `docs/26` §3.4) |
| `questoes(n)` | "N questões" | Contagem no card/nó | Revisão manual |
| `tudoConcluido` | "Você concluiu tudo o que está publicado. Que tal praticar?" | Estado vazio quando não há recomendação (`efetiva === "none"`) | Revisão manual — factual, não cobra do aluno |
| `praticar` | "Praticar" | CTA do estado `tudoConcluido` | Revisão manual |
| `capituloConcluido` | "Capítulo concluído" | Título da folha (`ChapterCompleteSheet`) | `tests/e2e/chapter-complete.spec.ts` |
| `secaoConcluida` | "Seção concluída" | Título quando a seção inteira fecha | Revisão manual — sem E2E dedicado (specs cobrem fechamento de capítulo, não de seção completa) |
| `fechouLicoes(n)` | "Você fechou N lições." | Corpo da folha | `tests/e2e/chapter-complete.spec.ts` percorre a folha; não asserta esse texto literal |
| `revisaoAberta` | "A revisão do capítulo está aberta." | Aviso na folha quando há revisão disponível | Mesmo spec — cobre o comportamento (nó de revisão fica disponível), não necessariamente esta string exata |
| `fazerRevisao` | "Fazer a revisão" | CTA da folha pra revisão (via `reviewTarget`, ver `docs/26` §3.3) | Mesmo spec |

Igual ao bloco `licao`: tom conferido manualmente contra a seção 7 do `20` (sem cobrança — `tudoConcluido` e `capituloBloqueado` descrevem estado, não repreendem o aluno), sem regressão automatizada de tom em `brand-voice.test.ts` ainda. Marcar como **revisado com evidência de comportamento** (os E2E citados percorrem os fluxos que usam essas strings), não como **revisado com evidência de tom testada automaticamente** — essa distinção já valia pros blocos `feedback`/`tutor` na seção 2 original e continua valendo aqui.

## 3. Pendente — inventariado, não revisado

Levantamento por arquivo (não por string individual — a granularidade da seção 2 é o padrão a aplicar quando cada um destes for revisado). Nenhum destes foi confirmado livre de tom incompatível; tratar como não verificado.

| Área | Arquivos | Observação |
|---|---|---|
| Rotas de entrada | `welcome.tsx`, `quiz.tsx`, `aha.tsx`, `onboarding.tsx`/`signup.tsx` (redirects) | `aha.tsx` usa o slot `voz.aha`, não revisado nesta passada |
| Casca/navegação | `src/components/AppShell.tsx`, bottom nav | Rótulos curtos (Início/Estudar/Redação/Progresso/Perfil) — baixo risco de tom, mas não conferidos |
| Dashboard e progresso | `dashboard.tsx`, `progress.tsx`, `plan.tsx`, `topics.tsx` | Usa `atividadeHoje`, metas e lacunas — textos de estado (vazio/meta) não conferidos |
| Flashcards | `flashcards.tsx` | Tem bug de fila conhecido (docs/20 §2.5), fora do escopo desta fase; copy não revisada |
| Ranking | `ranking.tsx` | Precisa deixar claro que a turma é fictícia (já documentado como requisito em `CLAUDE.md`) — não conferido se o texto atual cumpre isso |
| Redação (mapa) | `redacao.index.tsx` | Mapa da trilha, 15 trilhas — copy de card/estado não conferida |
| Perfil/config | `profile.tsx`, `premium.tsx`, `login.tsx`, `forgot.tsx`, `offline.tsx` | `premium.tsx`/`offline.tsx` são demonstrativos — checar se o texto já avisa isso (regra de escopo do `CLAUDE.md`) |
| Vídeo | `video.$id.tsx` | Baixo volume de copy |
| Estados globais | `src/routes/__root.tsx` (`ErrorComponent`), `src/components/ds/EmptyState.tsx`, slots `voz.vazio`/`voz.404`/`voz.bomdia`/`voz.retorno`/`voz.meta`/`voz.nivel`/`voz.marco`/`voz.fimbom`/`voz.fimruim` | `errou`/`acertou` (os dois slots usados no loop de resposta corrigido na Fase 1/3) foram conferidos; os outros 8 slots de `voz.ts` não passaram pelo teste de tom desta fase — `retorno` já é o slot mais vigiado historicamente (`docs/15` §3.2) e não tem indício de cobrança numa leitura rápida, mas não tem teste de regressão ainda |
| Notificações locais | Não localizadas nesta busca — se existirem (push/local), não foram inventariadas |
| Acessibilidade | `aria-label`s espalhados pelo app fora de `FeedbackSheet`/`TutorBubble` | Não auditados nesta fase |
| Landing (`docs/brand/`) | Fora de `src/` | Não tocado — é conteúdo de marketing, não copy do app rodando |

## 4. Conteúdo pedagógico — explicitamente fora desta fase

`src/data/questions.ts` (59 questões) e `src/content/trilhas/` (134 lições, 1.204 exercícios) **não foram revisados nesta passada**, exceto a correção pontual de gabarito ambíguo em `q2` feita na Fase 1 (`docs/20` §2.5) — que é correção factual, não copy. O `20` §7.2 é explícito: revisão pedagógica é lote separado, com teste de gabarito, não substituição em massa. Nenhum enunciado/explicação foi reescrito aqui.

## 5. `docs/15`/`docs/16` — já apontavam pro `20`

Ambos os documentos já tinham nota de precedência para `docs/20` (adicionada na autoria do plano, 21/09/2026) — não precisaram de edição nesta Fase 3. `docs/15` §3.3 já previa "nunca cobra sobre o resultado" antes mesmo do `20`; a linha de `voz.errou` corrigida na seção 2 deste documento violava a própria regra antiga, não só a nova.

## 6. Próximos passos (não executados aqui)

- Revisar por lote as áreas da seção 3, começando por dashboard/progresso (maior tráfego pós-onboarding) e pelos 8 slots de `voz.ts` ainda não testados.
- Expandir `tests/unit/brand-voice.test.ts` conforme cada área for revisada, no mesmo padrão (grep de termos proibidos + leitura manual).
- Auditoria de acessibilidade dos `aria-label`s fora de `FeedbackSheet`/`TutorBubble`.
- Confirmar com o time se `ranking.tsx`/`premium.tsx`/`offline.tsx` deixam claro que são demonstrativos (regra de escopo do `CLAUDE.md`).
