---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [27, 28, 29]
---
# 27–29 — Home como trilha visual e deploy público: resumo de encerramento

## O que mudou

- Lógica pura do caminho em `src/lib/learning/path-layout.ts` (zigue-zague `pathK`, foco `pathFocus`, marcos, expansão padrão, rolagem) e hook `src/hooks/usePathFocusScroll.ts` (uma rolagem, um IntersectionObserver).
- Componentes em `src/components/learning/path/`: `PathNode`, `PathConnector`, `ChapterBanner` (sticky por CSS), `ChapterSegment`, `ChapterMilestone`, `SubjectPath`, `SubjectPathEnd`, `FocusCallout`, `RecommendationHint`, `JumpToFocusButton`, `MarginDoodle`, `TrailSkeleton`, `TrailError`.
- `TrailHeader` virou barra de métricas (sequência, meta, nível); `ContinueCard` ganhou `variant="callout"`; 14 chaves `COPY.trilha.*`.
- `src/routes/trilha.tsx` reescrito com foco calculado, dica de matéria cruzada, skeleton e erro na rota.
- CSS `.path-*`, `anim-halo`, `ft-halo`/`ft-draw` em `src/styles.css`.
- Deploy: preset do Nitro por ambiente em `vite.config.ts`, `vercel.json` com bun, `package-lock.json` removido, CI em `.github/workflows/ci.yml` (tsc, unitários, build), README atualizado.
- PR #1 mergeado em `main` (`cab594c`) com autorização; produção na Vercel sem o 404 anterior (29 §7).

## Decisões relevantes

- D-1…D-14 do `27` §15 mantidas sem exceção (29 §3): sem baú/moedas/vidas; callout abaixo do nó foco; desktop em 440 px (D-7, depois substituída em ≥ 768 px pelo `36` §F.6); sem animação de entrada no scroll; preset por `VERCEL`; CI sem lint e sem E2E.
- Hospedagem na Vercel em vez do Netlify (`27` §14); pelo `46` §C.5 vira a ADR `0001`.
- Os 2 achados reais da revisão T-28 foram corrigidos no ato (29 §6).

## Evidência

- 29 §1 (números finais depois de T-28): `bunx tsc --noEmit` exit 0; `bun test tests/unit` **290 pass / 0 fail** (257 + 33 de `path-layout.test.ts`); `bunx playwright test` **55 pass / 0 fail**; `bun run build` ok; chunk da trilha +2,37 kB gzip (orçamento +8 kB).
- 29 §5: RF-1…RF-16 e HG1…HG13 com evidência; DG1, DG2 (CI verde, run 35838521481) e DG5 cumpridos.

## Limitações e o que não foi feito

- DG3/DG4 (URL pública sem login, tutor em produção) dependem do painel da Vercel: Deployment Protection e `OPENAI_API_KEY` (29 §7).
- Teste em celular físico não feito; long tasks sem throttling de CPU dedicado; revisão `impeccable` não concluída no formato completo (29 §8).
- Preview do Netlify (`papaya-muffin-3d5c6f`) falhando, fora do caminho de produção (29 §7).

## Regras que continuam valendo

Extraídas no T-01.3: hospedagem (`27` §14) → `docs/arquitetura/` e ADR `0001`; regras visuais do caminho → `docs/DESIGN.md`. Os contratos de domínio da trilha continuam sendo os do `25`.

## Verificação de encerramento

- **(a) Registro × tarefas:** o `29` cobre T-01…T-29 por checkpoint (A–E e C; T-18/T-19/T-20/T-21/T-26/T-27/T-28 em seções próprias). T-03…T-14, T-17, T-23 e T-25 aparecem pelo conteúdo, não pelo ID. Nenhuma tarefa sem status; T-27 parcial por depender do usuário. Divergência documental: os cabeçalhos do `27` e do `28` ainda dizem "rascunho — aguardando aprovação".
- **(b) Contratos no código:**
  1. `src/lib/learning/path-layout.ts:23`: `export function pathK(index: number): number` (zigue-zague) e `:61`: `export function pathFocus(`.
  2. `src/routes/trilha.tsx:48-49`: `pendingComponent`/`errorComponent` com `TrailSkeleton`/`TrailError` (hoje via `lazyRouteComponent`, mudança do `44`).
  3. `vite.config.ts:21`: `nitro: { preset: process.env.NITRO_PRESET ?? (process.env.VERCEL ? "vercel" : "netlify") }`; `vercel.json:3-4`: `installCommand`/`buildCommand` com bun.
- **(c) Números de teste:** 290 unitários / 55 E2E (29 §1).
- **(d) Pendências → backlog:** Deployment Protection e `OPENAI_API_KEY` na Vercel; checklist de celular do `28` T-27; desligar ou corrigir o preview do Netlify; `phaseById`/`chapterById` com busca linear em `trail.ts`/`curriculum-tree.ts` (29 §6, item 15); lint da base (CRLF).

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [27-plano-home-trilha-visual.md](27-plano-home-trilha-visual.md)
- [28-plano-execucao-home-trilha.md](28-plano-execucao-home-trilha.md)
- [29-registro-execucao-home-trilha.md](29-registro-execucao-home-trilha.md)
