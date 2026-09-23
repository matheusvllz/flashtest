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

(preenchido durante a execução)

## 3. Decisões tomadas durante a execução

(preenchido durante a execução)

## 4. O que existe por checkpoint

(preenchido durante a execução)

## 5. Critérios RF/HG/DG — evidência

(preenchido em T-28)

## 6. Achados das 5 rodadas de revisão (T-28)

(preenchido em T-28)

## 7. Teste no celular (T-27)

Pendente do usuário.

## 8. Limitações explícitas

(preenchido no fim)
