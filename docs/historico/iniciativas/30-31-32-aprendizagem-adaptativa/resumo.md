---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [30, 31, 32]
---
# 30–32 — Aprendizagem adaptativa: resumo de encerramento

## O que mudou

- Taxonomia de habilidades com grafo de pré-requisitos (Fase 2; documento gerado `docs/33`) e catálogo de itens com metadados (Fase 3).
- Schema local v6 com eventos e migração com backup (`CURRENT_SCHEMA_VERSION = 6` em `src/lib/state-migrations.ts`).
- Modelo de Mastery e Confidence separado, com `ALGO_VERSION` (`src/lib/adaptive/model.ts`, `confidence.ts`, `constants.ts`), primeiro em modo sombra e depois ligado.
- Sinais ampliados e botão "Não sei" como sinal distinto e não punitivo (Fase 6); explicação em camadas e Foca IA com contexto pedagógico limitado (Fase 7).
- Motor adaptativo (`src/lib/adaptive/{candidates,planner,scoring,journey}.ts`), mix atual/revisão/desafio numa janela de 10, e a tela `/debug` (Fase 8).
- Pipeline de conteúdo com IA (`content-pipeline/`, `scripts/content/`), 18 questões oficiais do ENEM com parâmetros do Inep 2023 (Fase 10, decisão em `docs/34`) e conteúdo em escala: 755 itens e 48 aulas geradas (Fase 11).
- Jornada única na home e modo foco (Fase 12); nivelamento adaptativo opcional por CAT em `/nivelamento` (Fase 13); checkpoints da trilha (Fase 14).
- As 9 flags de `FeatureFlags` ligadas uma por vez, com suíte verde entre cada (F15.1).

## Decisões relevantes

- Plano aprovado em 23/09/2026; prevalece sobre o `25` §6.6 e o `20` §13 com `jornadaAdaptativa` ligada (32, decisão 1).
- Reproduzir questões oficiais do ENEM com ano e atribuição visíveis, sem imagem de terceiro (32, decisão 2; `docs/34`).
- iPhone no silencioso respeita a chave até o usuário decidir (32, decisão 3, pendente).
- Onda 0/1 rodadas em Modo A (orquestração por agentes), com revisão item a item delegada pelo usuário (32, Fase 11). O `36` reclassificou essa revisão como `ia-delegada`.
- `enemSkills` (H1–H30) não preenchido por falta da Matriz do Inep; nada inventado (32, Divergências).

## Evidência

- 32 F15.2 (27/09/2026, todas as flags ligadas): `bunx tsc --noEmit` limpo; `bun test tests/unit` **811 pass / 0 fail** (77 arquivos); `bunx playwright test` **82 pass / 0 fail** (chromium + narrow); `bun run build` ok. Linha de base F0.2: 290 / 55.
- F15.4: revisão de segurança L2 com 0 Critical, 0 High, 0 Medium, 27 Low (`.security-review/final-report.md`, fora do Git).
- F15.5: `spec-verifier` contra G1–G16; F15.3: 5 bugs de celular real corrigidos em 28/09/2026.

## Limitações e o que não foi feito

- **A Fase 1 (áudio e háptico) nunca rodou**: sem `getAudioDiagnostics()`, sem `tests/unit/haptics.test.ts`; G11 e G12 sem evidência (32 F15.5).
- G4 (70/20/10 em janela de 20) investigado sem conclusão (32 F15.5); o `36` trocou o critério por cota mínima de revisão em janela de 10 (G-8).
- G7 (checkpoint recalibra) não estava ligado ao vivo; **fechado depois pelo `36`** (G-9, `checkpoint.spec.ts`).
- AC-11.2 quase lá: 9 habilidades sem aula e 6 com revisão incompleta; AC-10.2 com 1 ano de parâmetros do Inep, não 3.
- Checklist F15.3 de aparelho físico não preenchido.

## Regras que continuam valendo

Extraídas no T-01.3 (`46` §D.4): `30` §9–§13 (Mastery, `ALGO_VERSION`, motor com janela de 10, nivelamento CAT, checkpoints) → `docs/arquitetura/contratos.md` e `docs/produto/regras.md`; `30` §19 (pipeline) → `docs/arquitetura/`; `docs/34` → ADR `0002`; `docs/33` → `docs/arquitetura/taxonomia-habilidades.md`.

## Verificação de encerramento

- **(a) Registro × tarefas:** o `32` tem seção para as Fases 0 e 2–15. A **Fase 1 não tem seção**, mas tem status explícito no F15.5 ("nunca rodou nesta execução", pendência real). F11.4 (itens da Onda 1) e F11.7 (relatório de cobertura) não aparecem pelo ID; o conteúdo está em "Onda 1 rodada de verdade" e na tabela AC-11.x. F15.3 fica sem itens marcados. Toda tarefa tem status; a Fase 1 não executada vai para o backlog. Divergência: o `CLAUDE.md` diz "Fases 0–15 implementadas".
- **(b) Contratos no código:**
  1. `src/lib/adaptive/constants.ts:9`: `export const ALGO_VERSION = 1;`
  2. `src/lib/adaptive/constants.ts:112`: `export const JANELA_MIX = 10;` (`:149-150`: `REVISAO_MIN_JANELA = 2`, `REVISAO_MIN_JANELA_ATRASO = 3`, do `36`).
  3. `src/lib/features.ts:53` (`nivelamento: boolean;`) e `:93` (`nivelamento: true,`); também `:72` `masteryModel: "on"`, `:89` `jornadaAdaptativa: true`, `:99` `checkpointsTrilha: true`.
- **(c) Números de teste:** 811 unitários / 82 E2E (32 F15.2).
- **(d) Pendências → backlog:** Fase 1 inteira (diagnóstico de áudio, háptico honesto, matriz de aparelho); checklist F15.3; decisão 3 (silencioso do iPhone); H1–H30 da Matriz do Inep; mais anos de parâmetros; 9 habilidades sem aula e 6 com revisão incompleta; E2E de tutor com rede bloqueada (G13, parcial); flags testadas uma a uma (G15); revisão `web-design-guidelines` (G16); achados Low da F15.4 (O-001 proxy do tutor sem limite, O-002, A-003 consentimento, O-003, O-004, A-004, A-005 cabeçalhos, A-006); o O-001 reaparece como IA-1 no `46` §A.4.

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [30-plano-aprendizagem-adaptativa.md](30-plano-aprendizagem-adaptativa.md)
- [31-plano-execucao-aprendizagem-adaptativa.md](31-plano-execucao-aprendizagem-adaptativa.md)
- [32-registro-execucao-aprendizagem-adaptativa.md](32-registro-execucao-aprendizagem-adaptativa.md)
- O `33` (taxonomia, gerado) vive em [../../../arquitetura/taxonomia-habilidades.md](../../../arquitetura/taxonomia-habilidades.md) e o `34` virou a decisão [../../../decisoes/0002-questoes-oficiais-enem.md](../../../decisoes/0002-questoes-oficiais-enem.md).
