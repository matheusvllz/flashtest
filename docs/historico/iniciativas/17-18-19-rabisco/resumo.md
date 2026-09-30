---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [17, 18, 19]
---
# 17–19 — Identidade visual (Ártica → Rabisco na Margem): resumo de encerramento

## O que mudou

- O `17` (20/09/2026) tirou a marca Flash Test do código: `FocaMark` como único ponto que renderiza a logo (`src/components/brand/FocaMark.tsx`), fim do ícone `Bolt`, logo `flashtest-logo.png` removida, chave do estado renomeada para `foca.state.v3` com leitura única de `flashtest.state.v2` (`src/lib/store.ts:181-182`). A paleta Ártica que ele aplicou foi substituída horas depois pelo `18`.
- O `18` trocou a paleta pela direção Rabisco na Margem: tokens base em `:root`/`.dark` (`--abismo`, `--mar`, `--neve`…) referenciados por `--color-*` em `@theme inline` (`src/styles.css`), fontes Space Grotesk / Plus Jakarta Sans / Space Mono, raios por papel e elevação por aresta.
- Componentes globais (`btn-*`, `card-soft`/`card-press`, `chip`, `input-ds`, `surface-pauta`, `sheet`) e os 6 componentes de `src/components/ds/*`.
- Mascote e voz: `FocaMark` com `expression`/`motion`, `FocaSays`, falas em `src/lib/voz.ts` (as 8 expressões ficaram com arte neutra até 29/09).
- `AppShell` sem Foca no header e nav com pílula ativa; som sintetizado (`sfx.ts`) e háptico (`haptics.ts`), depois substituídos pelo `20`/`24`.
- Store com registro honesto: `activityDays`, `bestStreak`, `streakFreezes`, `today`, `nivelDeXp`, `setPrefs`, `registrarAulaConcluida` (19 §1, §3.3).
- As 17 rotas, `TutorBubble`, `LessonPlayer`, os 7 exercícios, `CelebracaoAula` e `FeedbackSheet` na nova identidade, com dark mode (`prefs.theme`).

## Decisões relevantes

- D1–D7 do `18` §14 aplicadas no padrão do plano, nenhuma revertida (19 §2).
- Tokens de marca em duas camadas (variável base + `--color-X: var(--X)`), depois do bug crítico de dark mode em classes geradas pelo Tailwind v4 (19 §3.1). Virou regra do `CLAUDE.md`.
- `suppressHydrationWarning` só no `<html>` para o script de tema (19 §3.2).
- `today.lessons` conta aulas concluídas, não questões (19 §3.3).

## Evidência

- 19 §1: `bunx tsc --noEmit`, `bun run build` e `bunx eslint` nos arquivos de cada fase limpos a cada fase, mais conferência visual em Chrome headless na Golden Path e em dark mode. Nesta época não havia suíte de testes unitários nem E2E; o registro não traz contagem de testes.
- 19 §6: checklist do `18` §17 declarado marcado com evidência.

## Limitações e o que não foi feito

- Arte final das 8 expressões (resolvida depois, `44`/`45`).
- Congelamento de sequência sem registro por data (19 §5).
- Lint da base quebrado por CRLF e `.netlify/` fora do `ignores` do ESLint (19 §3.4, §4).

## Regras que continuam valendo

Extraídas no T-01.3 (`46` §D.4, grupo Design): paleta, geometria e dark mode (`18` §6–§8, §12.4) → `docs/design/sistema-rabisco.md` (o próprio `18`, movido) e `docs/DESIGN.md`; mascote (`15` §3–§5) → `docs/design/mascote.md`.

## Verificação de encerramento

- **(a) Registro × tarefas:** o `19` cobre as Fases 0–12 do `18` §15 (19 §1). O `17` **não tem registro próprio**: o cabeçalho dele ainda diz "pronto para executar" e o checklist §15 está desmarcado. A execução está atestada só em bloco (cabeçalho do `18`, `18` §15 Fase 0 "as ~47 mudanças do `17`", `00-README` linha 44). Os resultados que sobreviveram ao `18` foram conferidos no código (abaixo e em `store.ts:181-182`; `grep -rn "\bBolt\b" src` vazio; `public/flashtest-logo.png` ausente). Encerrado com ressalva: o resultado visual do `17` foi substituído de propósito pelo `18`.
- **(b) Contratos no código:**
  1. `src/styles.css:128-129`: `--abismo: #3a3a3c` e `--mar: #2e6bff` em `:root`; `src/styles.css:211-212`: redefinidos em `.dark`.
  2. `src/styles.css:51-52`: `--color-abismo: var(--abismo)` e `--color-mar: var(--mar)` em `@theme inline` (a indireção do 19 §3.1).
  3. `src/components/brand/FocaMark.tsx:72`: `export function FocaMark(` como ponto único da logo.
- **(c) Números de teste:** nenhum, só comandos limpos (19 §1). Não há número atual aqui; a linha de base do `46` é registrada à parte.
- **(d) Pendências → backlog:** congelamento por data (19 §5); `eslint.config.js` sem `.netlify` (19 §3.4, hoje coberto pelo `46` §C.6); débito de CRLF do lint (19 §4).

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [17-plano-migracao-visual-foca.md](17-plano-migracao-visual-foca.md)
- [19-registro-execucao-rabisco.md](19-registro-execucao-rabisco.md)
- O `18` (norma do design system) continua vivo como [../../../design/sistema-rabisco.md](../../../design/sistema-rabisco.md); só a Parte IV (fases) é histórica.
