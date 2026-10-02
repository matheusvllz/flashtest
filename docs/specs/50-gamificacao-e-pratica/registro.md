---
estado: em-execucao
atualizado: 2026-10-02
iniciativa: 50
---

# 50 — Gamificação, prática, Foca animada e social 18+: registro de execução

> O que de fato aconteceu. Cada tarefa registra o que foi feito, a **evidência real** (comando e saída) e as divergências entre spec e código (`DV50-x`). Nenhuma afirmação sem evidência. Estados de validação: **implementado** · **validado localmente** · **validado em ambiente integrado** · **publicado** · **habilitado em produção**.

## Linha de base

Ainda não medida: nenhum código mudou nesta etapa. A linha de base é a T-50.0.5, depois da aprovação.

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `bunx tsc --noEmit` | a medir (T-50.0.5) |
| Unitários | `bun test tests/unit` | a medir. Último registrado: 1471 pass / 0 fail (49, 02/10, antes da publicação) |
| Lint | `bun run lint` | a medir. Último registrado: 0 erros / 17 avisos (49) |
| E2E | `bunx playwright test` | a medir. Último registrado: 561 passed / 0 failed / 82 skipped (49) |
| Build | `bun run build`, `VERCEL=1 bun run build` | a medir. Últimos registrados: verdes (49) |
| Documentação | `bun run docs:check` | rodado nesta etapa (abaixo) |

## Divergências encontradas no planejamento

| ID | Onde | O que um diz | O que o outro mostra | Decisão |
|---|---|---|---|---|
| DV50-01 | `docs/ESTADO.md` × `git log` | Trechos de momentos diferentes: "nada disso está na `main`", "`main` = `9c96afa`" | E1–E3 publicadas; `HEAD` da `spec-49` e da `main` publicada = `ac9bf85` (o último commit é só documentação; o código publicado é o de `9c96afa`) | Painel corrigido nesta etapa só no que reflete o planejamento e o hash; nenhuma afirmação de implementação nova |
| DV50-02 | `docs/specs/README.md` | 49 "aprovado (02/10/2026)", sem registro | 49 executada e publicada (E1–E3), funções desligadas em produção | Índice atualizado para `em-execucao` com link do registro |
| DV50-03 | 49 `spec.md` D49-06 × §5.6 × `src/lib/ranking.ts:43-45` | D49-06: "grupos semanais de até 30 por XP da semana" | §5.6 e o código: dias × 100 + blocos × 10 | A 50 mantém a pontuação do §5.6 e do código (sem XP bruto, sem tempo) |
| DV50-04 | 49 `registro.md` DV49-09 × banco | "Itens com revisão humana: MT 25, CN 31, CH 15" | `reviewKind: "humano"` = 0 no banco; 737 `ia-delegada` + 18 oficiais | Base da contagem incerta; a 50 não depende dela (simulado com oficiais importados, §5.9.1) |
| DV50-05 | `docs/arquitetura/conteudo.md:17` × `src/data/questions.ts` | Banco legado com 59 questões | 60 ocorrências de `statement:` | Conferir na T-50.9.1 |
| DV50-06 | `docs/design/mascote.md` e `docs/design/gamificacao-e-som.md` | Citam `styles.css:1008-1027` e `:695-703` | Regras hoje em `styles.css:1034-1049` e `:721-728` | Corrigir as referências na T-50.3.6 e na T-50.1.5 |
| DV50-07 | Arte de corpo inteiro | O dono anexou na conversa de 02/10 | Não está no repositório (só cabeça de frente, de lado e 8 expressões) | T-50.0.4 salva o original |
| DV50-08 | C-SOM-6 ("primeiro uso com aviso de como desligar") | Contrato | Não conferido no código nesta etapa | Conferir na T-50.1.4 |
| DV50-09 | R-GAM-4 × `store.ts` (DV-1 conhecida) | Meta inicial de 1 bloco | Padrão `dailyLessons: 3` | Missão "fazer" usa a meta configurada do aluno (§5.4.1); a divergência continua no backlog |
| DV50-10 | `git status` | — | Alterações locais de outros trabalhos em `.agents/skills/foca-social/`, `.claude/agents/foca-social.md`, `.claude/skills/foca-social/` e `automacao-instagram/` | Preservadas; nada desta etapa as toca |

## Por tarefa

### 02/10/2026 — Planejamento (sem código de produto)

- **Pedido do dono:** transformar a proposta de 02/10 (30 itens) + ofensiva com amigos num plano SDD completo, com as decisões 1–6 da conversa; sem implementar, sem commit, sem publicar.
- **Feito:** `spec.md` (decisões D50-01…16, regras revistas com referência exata, premissas verificadas, requisitos, arquitetura, dados, rollout em E1–E9, matriz de cobertura dos 31 itens), `tarefas.md` (F0–F16) e este registro. Índice das specs e `ESTADO.md` atualizados só para refletir o planejamento.
- **Auditoria do código (só leitura, 3 subagentes Explore):** lição e recompensas, vidas, sincronização, som e háptico; ofensiva, missões, navegação, mascote, ranking, notificações e trilha; banco de questões, imagens, simulado, redação, planos e custos da IA. Fatos usados na spec com `arquivo:linha` (§1).
- **Verificação externa (1 subagente, fontes oficiais baixadas):** Lei 15.211/2025 e Decreto 12.880/2026 (planalto.gov.br), FAQ ANPD/MJSP/Secom de 30/07/2026, orientações preliminares da ANPD sobre aferição de idade, LGPD art. 14, Lei 9.610/98, página "Provas e gabaritos" do INEP (CC BY-ND 3.0), caderno do ENEM 2023 (59 créditos de terceiros no 1º dia), WebKit (push no iOS) e Chrome for Developers (Notification Triggers encerrada). Matéria do Estadão de 01/08/2026 sobre o Duolingo confirmada por republicação (original atrás de paywall). Guia definitivo da ANPD sobre aferição de idade não localizado.
- **Skills:** `foca-sdd` (carregada). `superpowers:brainstorming` não usada: a direção já estava decidida pelo dono. `superpowers:writing-plans` e `agent-skills:planning-and-task-breakdown` não carregadas: plano escrito direto no modelo do repositório (`docs/ai/templates/`).
- **Evidência:** `bun run docs:check` → "nenhum link ou caminho quebrado". Toda tarefa citada na spec existe em `tarefas.md` (conferência por script). Nenhum teste de código rodado: nada de código mudou.
- **Estado de validação:** documento; nenhuma implementação.

## Critérios globais

| ID | Critério | Evidência | Status |
|---|---|---|---|
| G1–G11 | §16 da spec | — | pendente (nada implementado) |

## O que não foi feito e por quê

- Nenhum código, migração, variável, commit, push ou deploy: o pedido desta etapa é só o planejamento.
- Linha de base de testes não medida: nenhum código mudou; fica para a T-50.0.5.
- Decisão 0008 não escrita: depende da aprovação (T-50.0.3).
- Arte de corpo inteiro não salva: depende da aprovação (T-50.0.4).
