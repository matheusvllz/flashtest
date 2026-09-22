# 22 — Validação do piloto de aprendizagem: registro de execução

Execução: 21/09/2026, numa única sessão contínua, seguindo [20-plano-evolucao-aprendizagem.md](20-plano-evolucao-aprendizagem.md) do zero até a Fase 12. Este documento é o registro exigido pelo `20` (Fase 12, item 9): "registrar o que foi implementado e o que segue futuro; atualizar índice SDD sem marcar roadmap inteiro como pronto."

**Este documento não substitui o `20`.** Ele registra evidência de execução; o `20` continua sendo a especificação normativa.

## 1. O que foi implementado (Fases 0–12)

| Fase | Entregue |
|---|---|
| 0 | Baseline (typecheck/build/lint), `playwright.config.ts`, fixtures, reprodução dos 5 bugs |
| 1 | Os 5 bugs corrigidos: frase instável, IA abrindo sozinha, redação sem som, alternativas transparentes, avanço duplo |
| 2 | `useExerciseSession`, `src/lib/feedback/*` — máquina de resposta compartilhada pelos dois players |
| 3 | Persona do tutor e `voz.errou` sem sarcasmo/cobrança; `src/lib/copy.ts` (parcial — feedback + tutor); inventário em `docs/21` |
| 4 | `src/lib/audio/*` — motor novo com unlock/cancelamento/expiração real; `sfx.ts` aposentado |
| 5 | Schema v4 (`state-migrations.ts`), `exercise-ids.ts`, `curriculum.ts`, `adapters.ts`, `selectors.ts`; bug real corrigido: splash não hidratava antes do redirect |
| 6 | 6 microlições reais (Biologia/Matemática/Português), `MicroLessonPlayer`, rota `/learn/$lessonId` |
| 7 | `review.ts` (evidência/agenda), flashcards com 3 bugs de fila corrigidos, payload do tutor validado de verdade |
| 8 | `tips.ts`, 8 dicas curadas, controle de perfil de vestibular em `/profile` |
| 9 | `/trilha`, nós com estado em texto, URL direta respeita bloqueio |
| 10 | `recommend.ts` — recomendação determinística, mesmo resultado pro dashboard e pro início de sessão |
| 11 | Teto de XP por questão, bônus de onboarding único, blocos unificados, congelamento por contador explícito, XP de microlição por estrela |
| 12 | Flags ligadas, este registro |

## 2. Testes executados — evidência real, não estimativa

- **Unitários:** `bun test tests/unit` — **136 testes, 0 falhas, 1.920 `expect()`** (comando real, saída capturada nesta sessão). Cobrem: migração de estado (parse, backup, versão futura, idempotência), identidade de conteúdo (todas as 59 questões + todos os exercícios de trilha validados individualmente), motor de áudio (prioridade, partitura), revisão/evidência (critério A10), dicas (critério A11), recomendação (critério A13), tabela de recompensas (critério A14), brand voice (regressão de tom).
- **E2E:** `bun run test:e2e` (Playwright, Chromium real, gesto de usuário real) — **20 testes, 0 falhas**, rodados repetidamente a cada fase, não só no final. Cobrem: A1 (frase estável), A2 (tutor manual), A5/B4 (contraste), B5 (clique duplo), A7/A8 (microlição completa e retomada), A9 (flashcards), A11 (dicas), A12 (trilha/bloqueio), migração de estado num navegador real com `localStorage` de verdade.
- **Typecheck/build/lint:** limpos a cada fase — `bunx tsc --noEmit`, `bun run build`, `bunx eslint` (filtrando CRLF, ruído pré-existente do Windows já documentado desde a Fase 0).

Dois bugs REAIS foram encontrados pelos próprios testes durante a implementação (não hipotéticos, corrigidos e re-testados):
1. `useLearningSession` lia `getState()` sem hidratar — mesma causa-raiz do bug do splash da Fase 5, numa rota diferente.
2. `computeAdditiveFields` zerava `learning.activeSession` em toda migração — quebrava a retomada de microlição que a própria Fase 6 dependia.

## 3. O que este ambiente NÃO conseguiu validar — limitação real, não omissão

- **Nenhum teste em dispositivo físico.** Áudio, háptico e toque foram testados em Chromium desktop headless via Playwright — real, mas não prova comportamento em iOS Safari/Android real (docs/20 §19.2 exige isso explicitamente).
- **Nenhuma escuta humana da identidade sonora.** O piloto exploratório de 8 participantes (docs/20 §6.3) não aconteceu — os parâmetros de `identity.ts` são a primeira implementação fiel à especificação, não uma assinatura validada por ouvido.
- **Nenhuma observação de participante real** concluindo uma lição, pedindo ajuda ou retomando sessão sem explicação prévia da UI (docs/20 §12, item 4). A UX foi validada por mim executando os fluxos, não por um estudante real sem contexto.
- **Nenhuma medição de tempo real de leitura** — as estimativas de 30–90s de ensino são as metas de design (docs/20 §8.1), não medidas em pessoas.
- **Revisão pedagógica por especialista externo não aconteceu** para as 6 microlições nem para as 8 dicas de vestibular — são revisão própria na autoria, com fonte citada, não validação por um professor da área (registrado desde `docs/21`).
- **Zoom 200%, `prefers-reduced-motion`, leitor de tela real** (NVDA/VoiceOver) não foram testados manualmente — os componentes seguem o contrato de acessibilidade da Fase 1 (rótulo textual, foco visível, `aria-live`), mas isso é revisão de código, não teste assistido real.

## 4. Critérios objetivos (docs/20 §20) — status

| Critério | Status | Evidência |
|---|---|---|
| A1 — Feedback imutável | ✅ | E2E `feedback.spec.ts` |
| A2 — Tutor manual | ✅ | E2E `tutor.spec.ts` |
| A3 — Contexto correto (7 formatos) | Parcial | Fase 1 cobre múltipla-escolha/verdadeiro-falso/microlição; não há teste automatizado passando pelos 7 formatos de `content/trilhas/` em sequência |
| A4 — Som consistente | ✅ | E2E `audio.spec.ts`, sem prova de dispositivo |
| A5 — Legibilidade | ✅ (Chromium) | E2E `feedback.spec.ts`; sem zoom/leitor de tela reais |
| A6 — Áudio controlável | ✅ | Unitário `audio.test.ts` + E2E, sem prova de dispositivo |
| A7 — Microlição completa | ✅ | Unitário `microlicoes.test.ts` (144 asserts) + E2E |
| A8 — Retomada sem duplicação | ✅ | E2E `microlicoes.spec.ts` |
| A9 — Revisão e flashcards | ✅ | E2E `flashcards.spec.ts` |
| A10 — Evidência honesta | ✅ | Unitário `review.test.ts` |
| A11 — Dicas não intrusivas | ✅ | Unitário `tips.test.ts` + E2E `exam-tips.spec.ts` |
| A12 — Trilha consistente | ✅ | E2E `trilha.spec.ts` |
| A13 — Recomendação explicável | ✅ | Unitário `recommend.test.ts` |
| A14 — XP/blocos idempotentes | ✅ | Unitário `rewards.test.ts` |
| A15 — Migração/meta/streak | Parcial | Migração e meta cobertos; congelamento além de 60 dias não tem teste automatizado (depende de datas reais não injetáveis — documentado em `rewards.test.ts`) |

Nenhum critério foi marcado ✅ sem o comando/arquivo de teste que sustenta a marca.

## 5. Rollout

Flags em `src/lib/features.ts` ligadas em 21/09/2026: `microlicoes`, `trilhaAprendizado`, `dicasVestibular`, `recomendacaoAdaptativa`. Rollback = trocar de volta pra `false`: esconde a entrada do dashboard pra `/trilha`, mas **não apaga nenhum dado** — `/study`, `/redacao` e `/flashcards` continuam exatamente como estavam, e o schema v4 é aditivo (reverter a flag não reverte a migração, que é uma via de mão única segura por design — ver `docs/20 §15.3`).

## 6. O que fica pra depois — não fabricado aqui

- Diagnóstico real de conhecimento (o `/quiz` continua sendo perfil declarado, não medição).
- Revisão espaçada com UI própria (o motor de `review.ts` existe e está testado; não há tela dedicada de "sessão de revisão" ainda).
- Desafio opcional de capítulo, conquistas/badges, simulado completo.
- Backend/sincronização entre dispositivos — continua tudo local.
- Expansão do conteúdo além das 6 microlições piloto — exige curadoria e revisão pedagógica externa antes de escalar (docs/20 §1: "piloto de seis lições antes de ampliar").
