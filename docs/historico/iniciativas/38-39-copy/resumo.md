---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [38, 39]
---
# 38–39 — Sistema de copy e roteamento das skills de escrita: resumo de encerramento

## O que mudou

- Plano só de documentação e de instalação de skills; nenhum arquivo de `src/`, `tests/`, `content-pipeline/`, `public/` ou `scripts/` foi alterado por ele (39, CS-19).
- `docs/COPY.md` como entrada única (Quick Context, níveis de leitura por tamanho de tarefa, mapa "pergunta → onde", checklist).
- `docs/copy/`: `01-estrategia.md` (persona, estados do aluno com sinal no código, problema → mecanismo → resultado, posicionamento), `02-voz-e-tom.md` (tabela do `20` §7.1 citada literalmente e 5 extensões), `03-ux-writing.md` (30 padrões por componente, glossário de 26 termos), `04-foca-ia.md`, `05-conteudo-pedagogico.md`, `06-marketing.md`.
- Auditoria da copy atual sem aplicar nada: `docs/copy/auditoria-2026-09-28.md` (106 linhas de tabela, 72 itens de ação: 20 alta, 28 média, 24 baixa).
- Skills `better-writing` e `ogilvy-copywriting` instaladas em `.claude/skills/` com `npx skills@1.7.0`, auditadas contra o clone (sem código executável), registradas em `skills-lock.json` e `.claude/skills-registry.json`.
- `docs/ai/SKILL-ROUTING.md` com 7 classes de escrita e o §2.1 (níveis, ordem, orçamento, pipelines); `docs/ai/SKILLS.md` com as seções Q/R e as skills avaliadas e recusadas; registry com 20 rotas.
- `CLAUDE.md`, `AGENTS.md`, `foca-sdd`, `00-README`, `PRODUCT.md`, `DESIGN.md` e notas de precedência em `09`, `13`, `15`, `20` §7.1 e `21`.

## Decisões relevantes

- 39 §4: D-1 frase de posicionamento mantida (usuário); D-2 imperativo informal ("Tenta", "Confere"), invertendo a recomendação do `38`; D-3 "sequência" para streak; D-4 "lição" e "checagem" no lugar de "aula" e "Checkpoint"; D-5 humor da foca na pedra continua; P-1 `offline` e `premium` marcadas como demonstração; P-2 fim de aula com duas famílias de fala sem julgamento.
- Nenhuma skill de copy altera conteúdo pedagógico (`copy/05`; `SKILL-ROUTING` §2.1).
- O `15` deixa de ser guia de escrita; fica só como histórico do arquétipo e da biblioteca visual (`38`, cabeçalho).

## Evidência

- 39 C9: `node scripts/validate-skills.mjs` → `OK — 0 FAIL, 3 warn` (avisos de colisão de nome preexistentes); registry com 20 classes de rota; `bun test tests/unit/brand-voice.test.ts` **10 pass, 0 fail**; 209 links conferidos; `COPY.md` com 101 linhas (limite 130).
- `spec-verifier`: CS-1…CS-20 cumpridos, 17 perguntas do §X.3 com resposta, 9 casos do §Q.5 com rota única.

## Limitações e o que não foi feito

- Nenhuma string do app foi migrada; a aplicação das decisões é outro plano (39 §5).
- Carregamento das duas skills novas numa sessão nova não verificado; leitura de qualidade frase a frase de `copy/04`–`06` não feita (39 C9).

## Regras que continuam valendo

Já vivem em `docs/COPY.md` e `docs/copy/` (canônicos que ficam no lugar, `46` §C.5). Extraídas no T-01.3: `20` §7.1 como norma de origem → `docs/produto/regras.md`, com ponteiro para `COPY.md`; afirmações permitidas de marketing → ver resumo 40–43.

## Verificação de encerramento

- **(a) Registro × tarefas:** 39 §3 marca C0–C9 como concluídas. 16 dos 31 IDs `T-C*` do `38` aparecem pelo número; os demais (T-C3.2, T-C5.x, T-C6.x, T-C7.2–T-C7.4, T-C8.x, T-C9.x) estão cobertos pelo status da fase e pelos artefatos citados. Nenhuma fase sem status.
- **(b) Contratos no código:**
  1. `docs/COPY.md` existe (103 linhas hoje; eram 101 no registro).
  2. `docs/copy/` contém `01-estrategia.md` a `06-marketing.md` e `auditoria-2026-09-28.md`.
  3. `.claude/skills/better-writing/SKILL.md:2` (`name: better-writing`) e `.claude/skills-registry.json:347` (`"id": "better-writing"`); `.claude/skills/ogilvy-copywriting/` presente.
- **(c) Números de teste:** validador 0 FAIL / 3 warn; `brand-voice.test.ts` 10 pass (39 C9).
- **(d) Pendências → backlog:** plano de migração das strings (aplicar D-1…D-5, P-1, P-2 e a auditoria); reauditoria das áreas dependentes do `36` (T-05.*, T-06.*, T-08.7, T-09.*); testes novos de `brand-voice.test.ts`; DEP-2…DEP-9 do `38` §V.3; `COPY.onboarding.ofertaCorpo` promete "cerca de 10 minutos"; `offline.tsx` afirma sincronização que não existe; conferir as skills numa sessão nova.

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [38-plano-sistema-copy-e-skills.md](38-plano-sistema-copy-e-skills.md)
- [39-registro-execucao-copy.md](39-registro-execucao-copy.md)
