---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [35, 36, 37]
---
# 35–37 — Qualidade pedagógica, UX e confiabilidade: resumo de encerramento

## O que mudou

- Jornada: a rota `/atividade/$activityId` é dona da seleção de itens; atividade sem questões suficientes é descartada com aviso; conclusão idempotente pela chave de tentativa (`attemptKey`, contador `seq`); a reposição preenche só as vagas (`src/lib/store.ts`, `src/lib/adaptive/journey.ts`).
- Versões separadas: `PLANNER_VERSION = 2` (plano) e `ALGO_VERSION = 1` (modelo); cota mínima de revisão numa janela móvel de 10; checkpoint recalibra (`src/lib/adaptive/constants.ts`, `checkpoint.ts`).
- Nivelamento com finalização única por qualquer caminho (`placement.appliedAt`, `src/hooks/usePlacementReconciliation.ts`), retomada igual à execução contínua, resultado por faixa e precisão pela SE, sem nota nem porcentagem; `irt` dos itens de pacote por `irtFromDifficulty` (`src/content/items/irt.ts`).
- Persistência: falha de gravação nunca aparece como "salvo" (`src/components/PersistenceBanner.tsx`, D-77); duas abas adotam o estado mais novo; JSON ilegível copiado para `foca.state.corrupt.<ISO>`; pacotes com nova tentativa e dedupe; tutor sem rede não trava o estudo.
- Layout: tokens `--app-col`/`--reading-col`/`--path-col`/`--nav-rail`, `NavRail` a partir de 1024 px, `--scrim`, tokens `--on-*`, diálogos com trap de foco (`src/hooks/useDialogA11y.ts`), alvos ≥ 44 px.
- Cursos: 82 em 13 grupos com busca (`src/components/onboarding/CourseStep.tsx`, também no Perfil).
- Conteúdo: validador de qualidade (`scripts/content/auditar-qualidade.ts`), `reviewKind` (737 `ia-delegada`, 18 `gabarito-oficial`), item `retired: true`; revisão editorial delegada de 665 itens, 3 retirados.
- Logo oficial trocada a pedido do usuário em 28 e 29/09/2026 (37, seções "Troca do logo").

## Decisões relevantes

- Plano aprovado em 28/09/2026; prevalece sobre `30`/`31` nos contratos de fila, finalização do nivelamento e versão do plano, e sobre `27` D-7 e `18` (`PhoneFrame` 440) só em ≥ 768 px (`36`, cabeçalho).
- Sem subir o schema: campos novos opcionais (`36` §H).
- 82 divergências plano × código registradas (37 §2, D-1…D-82). Destaques: D-77 (frases de "salvo" condicionais), D-78 (fila sem repetição), D-79 (guarda idempotente por `sessionStartedAt`), D-56/D-81 (aviso de hidratação de `/trilha` mantido por decisão de arquitetura).
- A revisão do acervo é `ia-delegada`, não humana (37, "Fase 7 — revisão editorial").
- O `35` é o prompt de handoff do Codex que originou o `36`; não é spec.

## Evidência

- 37 §3, Fase 10, T-10.1 (28/09/2026): `bunx tsc --noEmit` exit 0; `bun test tests/unit` **1185 pass, 0 fail**, 8731 expect, 92 arquivos; `bun run build` exit 0; `css-tokens.test.ts` 9 pass; E2E em 3 projetos **266 passed, 30 skipped por desenho, 0 failed** (296). Linha de base T-00.2: 811 unitários / 68 E2E chromium.
- 37 §4: G-1…G-20 com evidência; G-4, G-5, G-11, G-14, G-17, G-18, G-19 parciais.
- T-10.2: `spec-verifier` 13 cumpridos / 6 parciais / 1 não cumprido **antes** dos ajustes, sem segunda passada; segurança L2 com 0 Critical/High/Medium e 2 Low.
- Auditoria do banco: "correta estritamente a mais longa" 140/755 (18,62 %, era 52,05 %).

## Limitações e o que não foi feito

- Verificação manual do §L.4 toda em aberto: aparelho físico, leitor de tela, áudio/háptico, legibilidade em 1280/1440 (37 §5).
- Sem revisão humana item a item; os 1.204 exercícios legados de redação seguem sem revisão pedagógica externa.

## Regras que continuam valendo

Extraídas no T-01.3 (`46` §D.4): `36` RF-2…RF-18 (atividade, `attemptKey`, `seq`, reposição, finalização única do nivelamento, persistência) → `docs/arquitetura/contratos.md`; `36` §G (`reviewKind`, `retired`, validadores) → `docs/arquitetura/` e `docs/produto/regras.md`; tokens de layout → `docs/DESIGN.md`.

## Verificação de encerramento

- **(a) Registro × tarefas:** os 56 IDs de tarefa do `36` (T-00.1…T-10.4) aparecem todos no `37` (comparação por `grep -oE "T-[0-9]{2}\.[0-9]+"`, 56 × 56). Toda tarefa tem status; a T-10.4 está parcial porque depende da verificação humana. Cabeçalho do `36` segue "em execução" (37, T-10.3, "Não feito").
- **(b) Contratos no código:**
  1. `src/lib/adaptive/constants.ts:208`: `export const PLANNER_VERSION = 2;`
  2. `src/lib/store.ts:1832-1833`: `const attemptKey = attemptKeyOf(activity);` e `const ledgerKey = activity.startedAt ? \`atividade:${attemptKey}\` : ...` (função em `:1644`; campo em `src/lib/learning/types.ts:386`).
  3. `src/hooks/usePlacementReconciliation.ts:27`: `const pendente = FEATURES.nivelamento && placement?.status === "concluido" && !placement.appliedAt;`
- **(c) Números de teste:** 1185 unitários / 266 E2E passados (37 T-10.1).
- **(d) Pendências → backlog:** verificação manual (37 §5); item oficial `oficial:2023:273a7d48` (decisão do usuário); recomendação D-002 (`validateTutorRequest`); aviso de hidratação de `/trilha` (A3); "Salvo!" de flashcards e `/study`; segunda passada do `spec-verifier`; arte em alta da logo; propostas editoriais não aplicadas (~27 reclassificações em mat, 11+1 em bio); 9 habilidades sem aula. (O achado 1 da linha de base, `bun test` sujando `itens-gerados.ts`, foi tratado na T-07.6, D-50.)

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [35-prompt-claude-code-atualizacao-qualidade.md](35-prompt-claude-code-atualizacao-qualidade.md)
- [36-plano-qualidade-pedagogica-ux-confiabilidade.md](36-plano-qualidade-pedagogica-ux-confiabilidade.md)
- [37-registro-execucao-qualidade.md](37-registro-execucao-qualidade.md)
