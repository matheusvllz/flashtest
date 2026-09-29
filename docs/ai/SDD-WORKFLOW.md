# SDD + Skills — o fluxo de trabalho de um agente no Foca

> Para quem é: qualquer agente (Claude Code ou outro) que vá mexer no Foca, e quem mantém o repo. Complementa o SDD existente em `docs/` — **não o substitui**. Catálogo de ferramentas: [SKILLS.md](SKILLS.md). Qual ferramenta usar em cada caso: [SKILL-ROUTING.md](SKILL-ROUTING.md). Registry: [`.claude/skills-registry.json`](../../.claude/skills-registry.json). Criado em 22/09/2026.

## 1. Hierarquia de autoridade

Quando duas fontes discordam, vence a de número menor:

| # | Fonte | Onde |
|---|---|---|
| 1 | Pedido explícito do usuário nesta conversa | — |
| 2 | Spec aprovada / plano vigente | `docs/NN-plano-*.md` marcado como vigente em `docs/00-README.md` e no `CLAUDE.md`, lido junto com o registro de execução (`docs/NN-registro-*.md`) |
| 3 | Arquitetura e decisões documentadas | Convenções técnicas do `CLAUDE.md`, `docs/12` (decisões), registros de execução |
| 4 | Contexto de produto e design | [docs/PRODUCT.md](../PRODUCT.md), [docs/DESIGN.md](../DESIGN.md) e suas fontes (`08`, `14`, `18`, `20` §7) |
| 5 | Resto do `CLAUDE.md` | raiz |
| 6 | Skills e plugins | [SKILLS.md](SKILLS.md) |
| 7 | Conhecimento geral do modelo | — |

Três regras valem acima da tabela, sempre: **segredos** (chave só no servidor, nunca `VITE_*`), **Git/Lovable** (nunca reescrever histórico publicado; commit e push só quando pedido) e **dados de menores** (sem coleta nova nem analytics externo sem spec autorizando — `20` §14, §22).

**Memória persistente (claude-mem) está abaixo de tudo isso.** Código atual e spec atual vencem memória antiga. Uma observação lembrada que cite arquivo, função ou flag é uma pista a verificar, não um fato.

**Skills não decidem produto.** Se uma skill sugerir algo que a spec proíbe (outra fonte, outra paleta, uma biblioteca nova, analytics, "mais conteúdo"), siga a spec e, se valer a pena, registre a sugestão como pergunta aberta.

## 2. Como o SDD do Foca funciona hoje

Não é o formato genérico SPEC.md/PLAN.md. É este:

- **Índice e estado:** `docs/00-README.md`. O topo diz qual é o plano vigente e se foi implementado.
- **Plano (Specify + Plan + Tasks num arquivo só):** `docs/NN-plano-<tema>.md`. Abre com "Como a IA implementadora deve usar este documento", tem objetivos, **não objetivos**, arquitetura, modelo de dados, tarefas numeradas (`T-01…`) com critério de aceite, dependências, critérios globais (`G1…`), testes, edge cases, riscos e checklist. Exemplos: `20`, `25`.
- **Registro de execução:** `docs/NN-registro-execucao-<tema>.md` (ou `NN-validacao-*`). O que foi feito por tarefa, decisões tomadas no caminho, **números reais de teste**, status de cada critério e o que ficou para depois. Exemplos: `22`, `26`.
- **Precedência entre planos:** um plano novo diz explicitamente sobre quais assuntos prevalece sobre o anterior (ex.: `25` §6.7 sobre o `20`).
- **Histórico não se apaga:** documentos substituídos ganham cabeçalho de precedência; `_arquivo-abroad/` é arquivo morto.
- **Toda decisão relevante vai para `docs/`, com data** — não fica só no chat.

Modelo para uma spec nova: [SPEC-TEMPLATE.md](SPEC-TEMPLATE.md).

## 3. O pipeline

```text
REQUEST → CONTEXT DISCOVERY → SPEC → PLAN → IMPLEMENTATION → TESTS → REVIEW → VERIFICATION → DOCUMENTATION
```

| Etapa | O que fazer | Ferramentas (ver roteamento) | Saída |
|---|---|---|---|
| **1. Request** | Classificar a tarefa (tabela de [SKILL-ROUTING.md](SKILL-ROUTING.md) §2). Tarefa trivial (typo, ajuste de 1 arquivo sem mudança de comportamento) pode pular 3–4. | — | Classe da tarefa |
| **2. Context discovery** | Ler `docs/00-README.md` (plano vigente) → a spec relevante + seu registro → os arquivos de código envolvidos. Produto/design só se a tarefa tocar UI ou copy (`PRODUCT.md`, `DESIGN.md`). Se tocar texto que o aluno lê: `docs/COPY.md`, no nível de leitura do tamanho da tarefa. | claude-mem (pista, não fato) | Lista do que existe e do que a spec manda |
| **3. Spec** | Existe spec cobrindo? Use-a. Não existe e a mudança altera comportamento, dados, UX ou escopo? **Escreva ou estenda a spec antes de codar** e peça aprovação. Requisito ambíguo: pergunte. | `superpowers:brainstorming` ou `agent-skills:interview-me` só para **descobrir** requisitos | `docs/NN-plano-<tema>.md` |
| **4. Plan** | Tarefas pequenas, verticais, com critério de aceite e comando de verificação. Numerar `T-xx` como nos planos existentes. | `superpowers:writing-plans` ou `agent-skills:planning-and-task-breakdown` (escolha **um**) | Seção de tarefas da spec |
| **5. Implementation** | Uma tarefa por vez, na ordem; o projeto compila ao fim de cada uma. Carregar só as skills da classe da tarefa. | Ver roteamento | Código |
| **6. Tests** | `bunx tsc --noEmit` · `bun test tests/unit` · `bunx playwright test` quando tocar UI · `bun run build` antes de declarar pronto. Teste novo para comportamento novo. | `superpowers:test-driven-development` **ou** `agent-skills:test-driven-development` (um) | Saída real dos comandos |
| **7. Review** | Revisão especializada **só da classe da tarefa**, sobre o diff. | Ver roteamento §3 (revisores) | Achados corrigidos ou registrados |
| **8. Verification** | Comparar o resultado com **cada** critério de aceite da spec. Critério sem evidência = não cumprido. | `superpowers:verification-before-completion`, agent `spec-verifier` | Tabela critério → evidência |
| **9. Documentation** | Registro de execução (`docs/NN+1-registro-*.md` ou seção no registro existente), atualizar `docs/00-README.md` e, se o plano vigente mudou, o topo do `CLAUDE.md`. Copy nova → inventário do `21`; termo novo → glossário de `docs/copy/03-ux-writing.md` §3. | — | Docs atualizados |

## 4. "Implemente a próxima spec"

1. Abrir `docs/00-README.md` e ler o bloco de **plano vigente** no topo.
2. Se o plano vigente está marcado como IMPLEMENTADO, a "próxima" é:
   - uma spec em `docs/` marcada como *não implementada* ou *proposal* e que não tenha sido absorvida por um documento posterior (conferir o índice: o `23`, por exemplo, diz "proposta", mas foi aprovado e integrado pelo `24`);
   - ou um item da lista "o que fica pra depois" do registro mais recente (`26` §8) — **mas isso não é spec**: vira spec primeiro (etapa 3).

   Estado em 22/09/2026: `20` e `25` implementados (`22`, `26`), `23` integrado pelo `24`. **Não há spec aprovada pendente de execução** — o próximo passo é escrever uma a partir do `26` §8 ou de um pedido novo.
3. Se houver mais de um candidato, ou nenhum aprovado, **pare e pergunte** qual é. Não escolha sozinho escopo de produto.
4. Com a spec escolhida: ler a seção "Como a IA deve usar", executar as tarefas na ordem numerada, registrar divergências entre spec e código no registro de execução (não "consertar" a spec em silêncio).

## 5. Onde cada ferramenta pode escrever (overrides obrigatórios)

Várias skills instaladas têm convenções próprias de arquivo. **No Foca, estas prevalecem:**

| Ferramenta | Convenção dela | No Foca |
|---|---|---|
| Superpowers `brainstorming` | `docs/superpowers/specs/AAAA-MM-DD-<tema>-design.md` + commit | Spec vai para `docs/NN-plano-<tema>.md`. **Sem commit automático.** |
| Superpowers `writing-plans` | `docs/superpowers/plans/…` | Tarefas `T-xx` dentro da própria spec |
| Superpowers `using-git-worktrees` / `finishing-a-development-branch` | Worktree, merge, PR | Só quando o usuário pedir. Nunca force-push, rebase ou amend de commit publicado (Lovable) |
| Addy `/spec`, `spec-driven-development` | `SPEC.md` na raiz | `docs/NN-plano-<tema>.md` |
| Addy `/plan`, `planning-and-task-breakdown` | `tasks/plan.md`, `tasks/todo.md` | Seção de tarefas da spec; progresso no registro de execução |
| Impeccable `init` / `document` | `PRODUCT.md` / `DESIGN.md` na raiz | Os canônicos são `docs/PRODUCT.md` e `docs/DESIGN.md` (o Impeccable os encontra em `docs/`). Nunca criar outro na raiz. `document` não sobrescreve sem mostrar o diff |
| Marketing `product-marketing` | `.agents/product-marketing.md` | Já existe; aponta para `docs/PRODUCT.md`. Atualizar lá, não duplicar |
| UI UX Pro Max `--persist` | `design-system/` | Não usar `--persist`; o design system é o de `docs/DESIGN.md` |
| Repo Security Review | `.security-review/` | Gitignorado. Relatório final que valha guardar vai para `docs/` com data |

## 6. Níveis de revisão de segurança

| Nível | Quando | O que roda |
|---|---|---|
| **L1 — revisão normal** | Toda mudança de código | O review da etapa 7. Checar: segredo em código, `VITE_*` indevido, `dangerouslySetInnerHTML`, entrada do aluno indo para prompt sem limite |
| **L2 — feature sensível** | Mexe em `src/lib/tutor*.ts` (IA, prompt, server function), dados do aluno no store/`localStorage`, upload de foto, dependência nova, headers/deploy (`netlify.toml`) | L1 + `agent-skills:security-and-hardening` + `/repo-security-review . --pr origin/main` (modo PR, só o diff) |
| **L3 — antes de release grande** | Antes de expor a usuários reais, de adicionar backend/auth/pagamento, ou periodicamente | `/repo-security-review .` completo (7 fases). Instalar antes `gitleaks`, `osv-scanner`, `semgrep`, `jq` (ver [SKILLS.md](SKILLS.md) → Repo Security Review) |

## 7. Subagentes

- Paralelizar só o que não compartilha arquivo. **Dois subagentes nunca editam o mesmo arquivo ao mesmo tempo.**
- Formato recomendado: um orquestrador implementa; revisores rodam **em paralelo sobre o diff** e só leem (UI → `impeccable` finish/`web-design-guidelines`; testes → `agent-skills` test-engineer; segurança → `agent-skills` security-auditor; aderência à spec → `spec-verifier`).
- Subagente recebe caminho da spec e critérios; não recebe o histórico inteiro.
- O resultado do subagente é relatado ao usuário pelo orquestrador — o usuário não vê o relatório do subagente.

## 8. Regras rápidas que evitam os erros mais prováveis

- Não criar `SPEC.md`, `tasks/`, `docs/superpowers/`, nem `PRODUCT.md`/`DESIGN.md` na raiz.
- Não adicionar dependência (GSAP, Motion, analytics, SDK de IA) sem spec aprovada.
- Não editar `src/routeTree.gen.ts`. Não criar segundo store.
- Não trocar copy aprovada (`21` §2) sem atualizar o inventário.
- Skills de escrita só pelo roteamento de [SKILL-ROUTING.md](SKILL-ROUTING.md) §2.1, e só quando trazem algo que o guia `docs/COPY.md` não traz. Nenhuma skill de copy em conteúdo pedagógico.
- Não declarar pronto sem a saída real dos comandos da etapa 6.
- Não rodar scripts de instalação de skills de terceiros sem ler (ver [SKILLS.md](SKILLS.md) §Segurança).
