---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [fluxo de trabalho de agentes, estados de documentos e tarefas]
substitui: [versão de 22/09/2026 (convenção docs/NN-plano-*.md na raiz)]
substituido-por: null
---

# SDD — como agentes trabalham no Foca

> Para Claude Code, Codex e quem mantém o repositório. A convenção foi aprovada em 29/09/2026 ([decisão 0004](../decisoes/0004-organizacao-do-sdd.md)). Matriz de skills: [SKILL-ROUTING.md](SKILL-ROUTING.md). Catálogo: [SKILLS.md](SKILLS.md).

## 1. Hierarquia de autoridade

Quando duas fontes discordam, vence a de número menor:

| # | Fonte |
|---|---|
| 1 | Pedido explícito do proprietário na conversa |
| 2 | Spec aprovada e ativa (`docs/specs/NN-tema/spec.md`) |
| 3 | Documentos canônicos (`docs/produto/`, `docs/arquitetura/`, `docs/design/`, `docs/copy/`, `docs/seguranca/`, `docs/operacao/`) e decisões (`docs/decisoes/`) |
| 4 | `AGENTS.md` (resto) e `CLAUDE.md` |
| 5 | Skills e plugins |
| 6 | Conhecimento geral do modelo |

Acima da tabela, sempre: segredos, Git, dados de menores e conteúdo pedagógico protegido ([../../AGENTS.md](../../AGENTS.md) → Regras duras). Memória persistente é pista, não fato. Planos arquivados em `docs/historico/` são consulta de detalhe: se contradizem um documento canônico, o canônico vence.

## 2. Onde fica cada coisa

| Tipo | Caminho | Modelo |
|---|---|---|
| Iniciativa (spec + tarefas + registro) | `docs/specs/NN-tema/` | [templates/spec.md](templates/spec.md), [tarefas.md](templates/tarefas.md), [registro.md](templates/registro.md) |
| Decisão | `docs/decisoes/NNNN-tema.md` | [templates/adr.md](templates/adr.md) |
| Encerramento | `docs/historico/iniciativas/NN-…/resumo.md` | [templates/resumo.md](templates/resumo.md) |
| Regras e contratos vigentes | `docs/produto/regras.md`, `docs/arquitetura/contratos.md`, `docs/design/*` | — |
| Pendências | `docs/produto/backlog.md` | — |
| Painel de retomada | `docs/ESTADO.md` | — |

**Numeração:** `NN` é o próximo número livre ([../specs/README.md](../specs/README.md)) e é **permanente**, mesmo depois de arquivado. Nunca renumerar.

**Nunca** criar `SPEC.md`, `tasks/`, `docs/superpowers/`, `PRODUCT.md`/`DESIGN.md` na raiz, nem outro índice paralelo.

**Frontmatter** de todo documento canônico ou de spec:

```yaml
---
estado: aprovado
atualizado: AAAA-MM-DD
canonico-de: [assunto]      # só em documentos canônicos
substitui: []
substituido-por: null
---
```

## 3. Estados e transições

### Documentos e specs

| Estado | Significado | Vai para | Quem move, com que evidência |
|---|---|---|---|
| `rascunho` | Em escrita | `aguardando-aprovacao` | Agente, com as seções obrigatórias preenchidas |
| `aguardando-aprovacao` | Pronto para decidir | `aprovado` ou `rascunho` | **Proprietário, por escrito**; registrar a data e o escopo aprovado |
| `aprovado` | Autorizado, não iniciado | `em-execucao` | Agente, ao iniciar a primeira tarefa |
| `em-execucao` | Há tarefa em andamento | `bloqueado`, `concluido` | Agente |
| `bloqueado` | Não avança sem algo externo | `em-execucao` | Precisa de motivo e dono |
| `concluido` | Todo critério global com evidência, ou com pendência levada ao backlog | `arquivado` | Agente, depois da verificação (`spec-verifier`) |
| `substituido` | Outro documento assumiu o assunto | `arquivado` | Registrar `substituido-por` |
| `arquivado` | Em `docs/historico/` com resumo | — | — |

### Tarefas (`T-FF.n`)

| Estado | Regra |
|---|---|
| `pendente` → `em-andamento` | Só com as dependências `concluida` |
| `bloqueada` | Motivo, dono e o que desbloqueia |
| `concluida` | Critério de aceite com evidência (comando e saída, arquivo, captura) |
| `cancelada` / `adiada` | Motivo; `adiada` vira item do backlog |

### Encerrar uma iniciativa (checklist)

1. O registro cobre todas as tarefas; os testes passam; contratos-chave conferidos no código.
2. Regras e contratos que continuam valendo extraídos para os canônicos, cada um com a origem `(NN §x)`.
3. Pendências levadas ao backlog, com origem.
4. `resumo.md` escrito (o que mudou, decisões, evidência, limitações).
5. Pasta movida para `docs/historico/iniciativas/` com `git mv`; mapa de IDs atualizado; `bun run docs:check` verde.

## 4. Retomar o projeto (≤ 4 leituras)

1. `AGENTS.md` (carrega sozinho).
2. [../ESTADO.md](../ESTADO.md): iniciativa ativa, tarefa em curso, próximo passo, bloqueios, último checkpoint verde.
3. A tarefa na spec ativa: só a seção dela e os contratos que ela cita.
4. As últimas entradas do `registro.md`.

Depois: `git status` e `git log -5`. O repositório bate com o checkpoint? Se tocou código, rode `bunx tsc --noEmit` e `bun test tests/unit` antes de continuar. **Se não bater, pare e registre a divergência** — não "conserte" às cegas.

## 5. Executar a próxima tarefa aprovada

1. No `ESTADO.md`, a primeira tarefa `pendente` sem dependência aberta e sem bloqueio. Se não houver, **pare e pergunte**. Uma pendência do backlog não é tarefa aprovada: vira spec primeiro.
2. Carregue as skills que a [matriz](SKILL-ROUTING.md) indica para o tipo da tarefa (no máximo 3 primárias + 1 revisão).
3. Implemente, uma tarefa por vez; o projeto compila ao fim de cada uma.
4. Teste com saída real; revise na classe da tarefa (e no nível de segurança: [../seguranca/README.md](../seguranca/README.md)).
5. **Checkpoint:** estado da tarefa + evidência no registro; `ESTADO.md` atualizado (próxima tarefa, último comando verde, commit); pendências no backlog; commit local se autorizado.

Uma tarefa que depende de credencial ou ação externa fica `bloqueada` com dono; siga com o trabalho independente.

## 6. Pipeline

```text
PEDIDO → CONTEXTO (ESTADO + spec) → SPEC (se não existe, escrever e pedir aprovação) → TAREFAS → IMPLEMENTAÇÃO → TESTES → REVISÃO → VERIFICAÇÃO → REGISTRO + CHECKPOINT
```

- **Tarefa trivial** (typo, ajuste de um arquivo sem mudança de comportamento) pode pular spec e tarefas; o registro fica no commit.
- **Mudança de comportamento, dados, UX ou escopo sem spec** → escrever a spec antes de codar e pedir aprovação.
- **Testes:** `bunx tsc --noEmit` · `bun test tests/unit` · `bunx playwright test` (se tocou UI ou fluxo) · `bun run build` · `bun run lint` · `bun run docs:check` (se tocou documentação). Teste novo para comportamento novo.
- **Verificação:** cada critério de aceite comparado com evidência (`spec-verifier` no Claude; `.codex/agents/spec-verifier.toml` no Codex). Critério sem evidência = não cumprido.
- **Estados de validação** a declarar em toda entrega: implementado · validado localmente · validado em ambiente integrado · publicado.
- **Texto do aluno:** strings novas em `src/lib/copy.ts` com linha no [inventário](../copy/inventario.md); termo novo no glossário de `docs/copy/03-ux-writing.md` §3.

## 7. Subagentes

- Paralelize só o que não compartilha arquivo. Dois subagentes nunca editam o mesmo arquivo ao mesmo tempo.
- Um orquestrador implementa; revisores rodam sobre o diff e só leem.
- O subagente recebe o caminho da spec e os critérios, não o histórico inteiro.
- O usuário não vê o relatório do subagente: o orquestrador repassa o que importa.

## 8. Onde as ferramentas escrevem (prevalece sobre o padrão de qualquer skill)

| Ferramenta | Convenção dela | No Foca |
|---|---|---|
| Superpowers `brainstorming` / `writing-plans` | `docs/superpowers/…` + commit | `docs/specs/NN-tema/`; sem commit automático |
| Addy `spec-driven-development` / `planning-and-task-breakdown` | `SPEC.md`, `tasks/` | `docs/specs/NN-tema/` |
| Impeccable `init` / `document` | `PRODUCT.md`/`DESIGN.md` na raiz | `docs/PRODUCT.md`, `docs/DESIGN.md`; nunca sobrescrever sem mostrar o diff |
| Marketing `product-marketing` | `.agents/product-marketing.md` | Já existe; aponta para `docs/PRODUCT.md` |
| UI UX Pro Max `--persist` | `design-system/` | Não usar `--persist` |
| Repo Security Review | `.security-review/` | Ignorado pelo Git; resumo em `docs/seguranca/auditorias/` |
| Worktrees, merge, PR | — | Só a pedido do proprietário |
