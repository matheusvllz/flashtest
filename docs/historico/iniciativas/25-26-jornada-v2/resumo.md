---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [25, 26]
---
# 25–26 — Jornada de Aprendizado V2: resumo de encerramento

## O que mudou

- Hierarquia matéria → seção → capítulo → lição em `CURRICULUM_TREE` (`src/content/curriculum-tree.ts`); revisão sintética de capítulo em `src/lib/learning/chapter-review.ts` (descarta capítulo com menos de 4 itens).
- Lição como sequência de passos: `LessonStep` (`intro`/`teach`/`tip`/`question`/`recap`) e união `MicroLessonV1 | MicroLessonV2` em `src/lib/learning/types.ts`; validação v2 em `validate.ts`.
- Schema local v5 (hoje v6, desde o `30`), migração aditiva.
- Motor orientado a passos (`src/hooks/useLearningSession.ts`, `src/lib/learning/session-logic.ts`) e player com uma view por passo em `src/components/learning/steps/`.
- 6 lições piloto convertidas para v2, cada uma com `pratica-3` e `desafio` novos (12 exercícios novos).
- `buildTrail` puro em `src/lib/learning/trail.ts`; `/trilha` virou a home (`FEATURES.trilhaComoHome`, `HOME_ROUTE`); as 134 lições de redação entraram como capítulos legados.
- Nav com 4 itens (`NAV_ITEMS_V2`: Aprender, Praticar, Progresso, Perfil); `dashboard.tsx` mantido como rollback.
- `ChapterCompleteSheet.tsx` idempotente com `reviewTarget`; destaque de desbloqueio em `LessonNode`.

## Decisões relevantes

- O desafio de `porcentagem-valor` não reusou `q21` (juros compostos, tópico não ensinado); desafio autoral novo (26 §3.1).
- Correção de overclaim em `crase-quando-usar:revisao-1` (26 §3.2).
- Gap de wiring do `reviewTarget` encontrado e fechado (26 §3.3).
- `prerequisiteChapterIds` implementado, mas sem conteúdo publicado que o exercite (26 §3.4).
- Nos assuntos cobertos, o `25` prevaleceu sobre o `20`, o `18` §13 e o `CLAUDE.md` (`25` §6.7).

## Evidência

- 26 §4 (22/09/2026): `bunx tsc --noEmit` exit 0; `bun test tests/unit` **257 testes, 0 falhas, 2151 `expect()`** (22 arquivos); `bunx playwright test` **33 passaram** (projetos `chromium` e `narrow` 320×700); `bun run build` ok.
- 26 §6: G1–G13 com teste citado; G12 parcial.

## Limitações e o que não foi feito

- Sem dispositivo físico, leitor de tela, zoom 200%, observação de participante real ou medição de tempo de leitura (26 §5).
- Sem revisão pedagógica externa dos 12 exercícios e das 6 dicas novas (26 §5).
- ESLint rodado só nos arquivos do plano; performance de `buildTrail` medida em Bun, não no navegador (26 §5).

## Regras que continuam valendo

Extraídas no T-01.3 (`46` §D.4, contratos de aprendizagem): `25` §6.2–§6.6 (tipos de nó, composição de lição, progressão, XP) → `docs/produto/regras.md` e `docs/arquitetura/contratos.md`. O rollback por flag (26 §7) vai para `docs/arquitetura/contratos.md`.

## Verificação de encerramento

- **(a) Registro × tarefas:** 26 §2 cobre T-01…T-28 por fase (T-01 na §1; T-02…T-27 auditadas no código; T-28 na §4). Nenhuma tarefa sem status. T-25 (edge cases) marcada como coberta pela suíte, sem conferência linha a linha (26 §2). Divergência documental: o cabeçalho do `25` ainda diz "PLANEJADO, NÃO IMPLEMENTADO" (linha 5).
- **(b) Contratos no código:**
  1. `src/content/curriculum-tree.ts:248`: `export const CURRICULUM_TREE: Curriculum = comAulasGeradas(`.
  2. `src/lib/learning/types.ts:268`: `export type LessonStep = IntroStep | TeachStep | TipStep | QuestionStep | RecapStep;` (tipos em `:238-263`).
  3. `src/components/AppShell.tsx:64`: `export const NAV_ITEMS_V2 = [`; `:71` escolhe por `FEATURES.trilhaComoHome`; `src/lib/features.ts:63` (`trilhaComoHome: true`) e `:125` (`HOME_ROUTE`).
- **(c) Números de teste:** 257 unitários / 33 E2E (26 §4.2–§4.3).
- **(d) Pendências → backlog:** revisão pedagógica externa do conteúdo v2; ampliar o v2 além das 6 lições; testar `prerequisiteChapterIds` com conteúdo real; verificação manual (aparelho, leitor de tela, zoom, participante); diagnóstico real, UI de revisão espaçada, simulado, backend (26 §8). Remover `dashboard.tsx`/`NAV_ITEMS_V1` depois do backend (`46` §C.6).

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [25-plano-jornada-aprendizado-v2.md](25-plano-jornada-aprendizado-v2.md)
- [26-registro-execucao-jornada-v2.md](26-registro-execucao-jornada-v2.md)
