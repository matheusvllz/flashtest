---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [20, 21, 22]
---
# 20–22 — Correção dos bugs e evolução para microaprendizado: resumo de encerramento

## O que mudou

- Os 5 bugs da auditoria corrigidos: frase de feedback instável, tutor abrindo sozinho, redação sem som, alternativas transparentes e avanço duplo (22 §1, Fase 1).
- Máquina de resposta compartilhada: `src/hooks/useExerciseSession.ts` e `src/lib/feedback/*` (snapshot `AnswerFeedback` criado uma vez em `createFeedback`).
- Tutor só sob demanda, com contexto da questão (`openTutorWithContext` em `src/lib/store.ts`); persona sem sarcasmo nem cobrança; `src/lib/copy.ts` iniciado e inventário de copy no `21`.
- Motor de áudio novo em `src/lib/audio/{engine,identity}.ts` (unlock por gesto, cancelamento, expiração); `src/lib/sfx.ts` aposentado (continua no disco como fachada sem uso).
- Schema v4 aditivo (`state-migrations.ts`), IDs estáveis de exercício, `curriculum.ts`, `adapters.ts`, `selectors.ts`.
- 6 microlições piloto com `MicroLessonPlayer` e a rota `/learn/$lessonId`; `review.ts` (evidência e agenda); 8 dicas de vestibular (`tips.ts`).
- `/trilha` com estado dos nós em texto; `recommend.ts` determinístico; teto de XP por questão e bônus de onboarding único.
- Flags `microlicoes`, `trilhaAprendizado`, `dicasVestibular`, `recomendacaoAdaptativa` ligadas em 21/09/2026 (22 §5).

## Decisões relevantes

- Feedback imutável e tutor manual como contrato (`20` §4–§5; critérios A1/A2 em 22 §4).
- Migração de estado aditiva e de mão única; desligar flag não apaga dado (`20` §15.3; 22 §5).
- Piloto de seis lições antes de ampliar conteúdo (`20` §1; 22 §6).
- O `21` separa copy funcional de conteúdo pedagógico: a revisão de voz não tocou enunciado nem explicação (`21` §1).

## Evidência

- 22 §2: `bun test tests/unit` **136 testes, 0 falhas, 1.920 `expect()`**; `bun run test:e2e` **20 testes, 0 falhas**; typecheck, build e ESLint limpos a cada fase.
- 22 §4: A1, A2, A4–A14 com teste citado; A3 e A15 parciais.
- Dois bugs reais achados pelos testes e corrigidos (hidratação em `useLearningSession`, `activeSession` zerada na migração), 22 §2.

## Limitações e o que não foi feito

- Sem dispositivo físico, sem escuta humana da identidade sonora, sem observação de participante real, sem medição de tempo de leitura, sem revisão pedagógica externa, sem leitor de tela nem zoom 200% (22 §3).

## Regras que continuam valendo

Extraídas no T-01.3 (`46` §C.5 e §D.4): `20` §4, §5, §6.4, §7.1, §14.2, §15.3 → `docs/produto/regras.md`, `docs/arquitetura/contratos.md` e `docs/design/gamificacao-e-som.md`. A voz (`20` §7.1) já tem guia em `docs/COPY.md` e `docs/copy/`.

## Verificação de encerramento

- **(a) Registro × tarefas:** o `22` §1 cobre as Fases 0–12 do `20` §16, uma linha por fase. Nenhuma fase sem status. Divergência documental: o cabeçalho do `20` ainda diz "PLANEJADO, NÃO IMPLEMENTADO" (linha 5); o `CLAUDE.md` e o `00-README` já dizem implementado.
- **(b) Contratos no código:**
  1. `src/lib/feedback/types.ts:12-15`: "Snapshot imutável de uma resposta — criado UMA vez em `createFeedback`"; `src/lib/feedback/create-feedback.ts:20`: `export function createFeedback(`.
  2. `src/lib/store.ts:1581`: `export function openTutorWithContext(`, chamado sob demanda em `src/components/learning/MicroLessonPlayer.tsx:141` e `src/components/lessons/LessonPlayer.tsx:172`.
  3. `src/hooks/useExerciseSession.ts:14`: `export function useExerciseSession()`; `src/lib/audio/engine.ts` e `identity.ts` são o motor de som (sem import ativo de `src/lib/sfx.ts`, conforme o comentário do próprio arquivo).
- **(c) Números de teste:** 136 unitários / 20 E2E (22 §2). O `26` §1.3 registrou 137 no baseline seguinte e anotou a diferença sem investigar.
- **(d) Pendências → backlog:** A3 (7 formatos em sequência) e A15 (congelamento além de 60 dias) parciais (22 §4); diagnóstico real de conhecimento, UI de revisão espaçada, desafio de capítulo, conquistas, simulado, backend, ampliação de conteúdo com revisão externa (22 §6); verificação manual de 22 §3; remover `src/lib/sfx.ts` sem uso.

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [20-plano-evolucao-aprendizagem.md](20-plano-evolucao-aprendizagem.md)
- [22-validacao-piloto-aprendizagem.md](22-validacao-piloto-aprendizagem.md)
- O `21` (inventário de copy) continua vivo como [../../../copy/inventario.md](../../../copy/inventario.md).
