# 29 — Registro de execução: home como trilha visual + deploy

**Status:** em execução (23/09/2026), a partir de `docs/28-plano-execucao-home-trilha.md`.
**Norma:** [27](27-plano-home-trilha-visual.md). **Plano:** [28](28-plano-execucao-home-trilha.md).

## 1. Baseline (T-01)

- Hash antes de começar: `88813f3` (main). Branch de trabalho: `feat/home-trilha-visual`.
- `bunx tsc --noEmit`: exit 0.
- `bun test tests/unit`: 257 pass, 0 fail, 2151 expect() calls.
- `bunx playwright test`: 33 passed (1.2m), 0 falhas.
- `bun run build`: exit 0. Chunk da trilha (cliente): `trilha-BHm1yIi0.js` — 10.89 kB / gzip 3.65 kB.
- Screenshots de referência: `test-results/baseline-390.png`, `test-results/baseline-320.png` (não versionados).

## 2. Divergências entre o plano e o código real

- T-15: `--trail-sticky-top` medido em 390×844 deu 60px (plano previa 61±1) — dentro da tolerância, mantido `"61px"`.
- T-16: ao contrário do que o plano cogitava como possível, `pendingComponent` (TrailSkeleton) **aparece no SSR** com `ssr:false` — `curl http://localhost:8080/trilha` retorna `data-trail-skeleton` no HTML (contagem 1). Nenhuma ação adicional necessária.
- T-16: `errorComponent` (TrailError) verificado manualmente (`throw new Error` temporário, screenshot, revertido) — tela "A trilha não carregou." / "Tentar de novo" / "Praticar" renderiza corretamente.

## 3. Decisões tomadas durante a execução

(preenchido durante a execução)

## 4. O que existe por checkpoint

### Checkpoint A (lógica pura)
- `src/lib/learning/path-layout.ts` — geometria/foco/marco/destaque/rolagem, tudo puro.
- `src/hooks/usePathFocusScroll.ts` — rolagem única + visibilidade do foco, 1 IntersectionObserver.
- `COPY.trilha.*` — 14 chaves novas em `src/lib/copy.ts`.
- `tests/unit/path-layout.test.ts` — 33 testes novos.

### Checkpoint B (primitivas visuais)
- CSS: `anim-halo`, `@keyframes ft-halo/ft-draw`, bloco `.path-*` inteiro em `src/styles.css`.
- `src/components/learning/path/{PathConnector,PathNode,ChapterMilestone,MarginDoodle}.tsx`.
- `TrailHeader.tsx` virou barra de métricas (streak/meta/nível); `trailGreeting()` exportado.
- `ContinueCard.tsx` ganhou `variant="callout"` (compatível — sem props novas, markup do `card` idêntico).
- `src/components/learning/path/FocusCallout.tsx`.

### Checkpoint C (caminho funcional)
- `path/{ChapterBanner,ChapterSegment,SubjectPath,SubjectPathEnd,RecommendationHint,JumpToFocusButton,TrailSkeleton,TrailError}.tsx`.
- `LearningPath.tsx` delega para `SubjectPath` (mantém `EmptyState`).
- `src/routes/trilha.tsx` reescrito: header vira barra de métricas, foco calculado por `pathFocus`/`resolveFocusTarget`, dica de recomendação cruzada, skeleton/erro ligados na rota.
- Build: chunk cliente `trilha-*.js` 10.89→16.37 kB (gzip 3.65→5.55 kB) + chunk auxiliar 0.89 kB (gzip 0.47 kB) = **+2.37 kB gzip** no total, dentro do orçamento de +8 kB (HG do `27`).
- TSC/UNIT/E2E confirmados verdes após a ligação (ver §1 e checagens abaixo).

## 5. Critérios RF/HG/DG — evidência

(preenchido em T-28)

## 6. Achados das 5 rodadas de revisão (T-28)

(preenchido em T-28)

## 7. Teste no celular (T-27)

Pendente do usuário.

## 8. Limitações explícitas

(preenchido no fim)
