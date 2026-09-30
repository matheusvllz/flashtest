---
name: foca-sdd
description: Ponto de entrada para trabalhar no Foca (Claude Code e Codex) — retomar o projeto depois de uma troca de sessão, "continue", "próxima tarefa", executar uma tarefa aprovada ("T-05.2"), criar feature, alterar tela, fluxo, dados, backend ou copy. Lê o painel docs/ESTADO.md, localiza a spec ativa, aplica o fluxo SDD e diz quais skills usar (e a alternativa quando uma skill não está disponível). Use antes de qualquer skill de processo, design ou marketing.
---

# Foca — SDD primeiro

Você está no repo do Foca. **A spec aprovada e os documentos canônicos em `docs/` são a fonte da verdade**; skills são ferramentas. Regras duras: `AGENTS.md`.

## 1. Retomar (≤ 4 leituras)

1. `AGENTS.md` (já carregado).
2. `docs/ESTADO.md` — iniciativa ativa, tarefa em curso, próximo passo, bloqueios, último checkpoint verde.
3. A tarefa na spec ativa (`docs/specs/NN-tema/spec.md` ou `tarefas.md`): **só a seção dela** e os contratos que ela cita. Arquivos grandes: `grep -n "^## \|^### \|^\*\*T-"` e ler o trecho.
4. As últimas entradas de `docs/specs/NN-tema/registro.md`.

Depois: `git status` e `git log -5`. Bate com o checkpoint do `ESTADO.md`? Se tocou código, rode `bunx tsc --noEmit` e `bun test tests/unit`. **Divergência = parar e registrar**, não consertar às cegas.

## 2. Qual é a tarefa

- **Há tarefa aprovada pendente** no `ESTADO.md`: execute a primeira `pendente` sem dependência aberta e sem bloqueio.
- **Não há, ou o pedido é novo** e muda comportamento, dados, UX ou escopo: escreva uma spec em `docs/specs/NN-tema/spec.md` (modelo `docs/ai/templates/spec.md`; próximo número em `docs/specs/README.md`) e **peça aprovação** antes de codar. Item do backlog não é tarefa aprovada.
- **Tarefa trivial** (typo, ajuste de um arquivo sem mudança de comportamento): faça, teste e registre no commit.
- Dúvida sobre escopo de produto: **pergunte**. Não invente.

## 3. Contexto por tipo de tarefa (só o necessário)

| Tarefa | Ler |
|---|---|
| Jornada, nivelamento, lição, recompensa, feedback, tutor | `docs/arquitetura/contratos.md` (seção) |
| Backend, conta, dados, sincronização | `docs/arquitetura/visao-geral.md` → `contratos.md` → `dados.md` → `docs/seguranca/README.md` (L2) |
| **Qualquer dado pessoal** (coleta, exibição, log, exportação) | `docs/seguranca/privacidade.md` — obrigatório |
| Tela ou componente | `docs/DESIGN.md` → `docs/design/sistema-rabisco.md` (seção) → `docs/design/mascote.md` se a Foca aparece |
| Texto que o aluno lê | `docs/COPY.md` no nível do tamanho da tarefa → `docs/ai/SKILL-ROUTING.md` §2.1 |
| Conteúdo pedagógico | `docs/copy/05-conteudo-pedagogico.md`, `docs/arquitetura/conteudo.md` — nenhuma skill de copy |
| Produto (o quê/por quê) | `docs/produto/estrategia.md` §0–§1, `persona-joao.md` §0, `regras.md`, `funcionalidades.md` |

Comentário de código que cita `docs/NN §x`: o ID é permanente; o caminho atual está em `docs/historico/README.md`.

## 4. Skills

Classifique a tarefa na matriz de `docs/ai/SKILL-ROUTING.md` §2 e carregue **no máximo 3 primárias + 1 revisão**. Se a skill indicada não estiver disponível neste agente (plugin que não carregou, skill só do outro agente), use a coluna "Sem a skill" e anote no registro — nunca diga que usou uma skill que não carregou.

## 5. Overrides (valem mais que o padrão de qualquer skill)

- Spec, tarefas e registro: `docs/specs/NN-tema/` — **nunca** `SPEC.md`, `tasks/`, `docs/superpowers/`.
- Produto e design: `docs/PRODUCT.md`, `docs/DESIGN.md` — nunca na raiz.
- Sem commit, push, merge ou worktree sem autorização do proprietário. Nunca reescrever histórico publicado.
- Sem dependência nova (SDK, analytics, biblioteca) sem spec aprovada. Sem analytics externo.
- Errar uma questão nunca abre nem envia mensagem ao tutor automaticamente.
- Nenhuma skill de copy em conteúdo pedagógico.

## 6. Fechar o ciclo (checkpoint)

1. Testes com saída real: `bunx tsc --noEmit` · `bun test tests/unit` · `bunx playwright test` (se tocou UI ou fluxo) · `bun run build` · `bun run lint` · `bun run docs:check` (se tocou documentação).
2. Uma revisão da classe da tarefa sobre o diff, no nível de segurança certo (`docs/seguranca/README.md`: L1 sempre; L2 em auth, dado pessoal, IA, dependência, deploy).
3. Cada critério de aceite comparado com evidência (`spec-verifier` no Claude; `.codex/agents/spec-verifier.toml` no Codex). Sem evidência = não cumprido.
4. Registrar no `registro.md` (feito, evidência, divergências, estado de validação: implementado · validado localmente · validado em ambiente integrado · publicado); atualizar `docs/ESTADO.md` e, se sobrar pendência, `docs/produto/backlog.md`.
5. Relatar ao usuário o que foi feito, o que foi testado e o que não foi.

Fluxo completo: `docs/ai/SDD-WORKFLOW.md`.
