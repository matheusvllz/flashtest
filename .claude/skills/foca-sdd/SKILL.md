---
name: foca-sdd
description: Ponto de entrada para qualquer mudança de comportamento no Foca — implementar spec ("implemente a próxima spec", "execute o plano", "T-07"), criar feature, alterar tela, fluxo, dados ou copy. Localiza a spec vigente em docs/, aplica o fluxo SDD do projeto e diz quais skills carregar. Use antes de brainstorming, writing-plans, spec-driven-development ou qualquer skill de design/marketing.
---

# Foca — SDD primeiro

Você está no repo do Foca. Aqui **a spec em `docs/` é a fonte da verdade**; skills são ferramentas. Siga isto antes de carregar qualquer outra skill.

## 1. Localize a spec (não pule)

1. Leia o bloco de **plano vigente** no topo de `docs/00-README.md`.
2. Se a tarefa toca algo que um plano já entregou, leia o **registro de execução** dele primeiro (`22` para o `20`, `26` para o `25`), depois a seção relevante do plano. Leia specs grandes por seção (`grep -n "^## "`), não inteiras.
3. Pedido de "próxima spec": siga `docs/ai/SDD-WORKFLOW.md` §4. Se não houver spec aprovada pendente, **pare e pergunte** — não invente escopo.
4. Não existe spec e a mudança altera comportamento, dados, UX ou escopo? Escreva uma em `docs/NN-plano-<tema>.md` usando `docs/ai/SPEC-TEMPLATE.md` e peça aprovação antes de codar.

## 2. Escolha as skills

Classifique a tarefa em `docs/ai/SKILL-ROUTING.md` §2 e carregue **no máximo 3 primárias** + **1 revisão** no fim. Nunca as cinco de design juntas. Marketing e GSAP estão desativados por padrão (ver §6 do roteamento).

## 3. Overrides (valem mais que o padrão das skills)

- Spec e plano vão para `docs/NN-plano-<tema>.md` — **nunca** `SPEC.md`, `tasks/`, `docs/superpowers/`.
- Contexto de produto/design: `docs/PRODUCT.md` e `docs/DESIGN.md` — nunca criar outros na raiz.
- Sem commit, push, merge ou worktree sem pedido. Nunca reescrever histórico publicado (Lovable).
- Sem dependência nova (GSAP, Motion, analytics, SDK) sem spec aprovada. Sem analytics externo nem coleta de dados de menores.
- Errar uma questão nunca abre nem envia mensagem ao tutor automaticamente.
- Copy: voz de `docs/20` §7.1; strings em `src/lib/copy.ts` + inventário `docs/21`.

## 4. Feche o ciclo

1. Testes com saída real: `bunx tsc --noEmit` · `bun test tests/unit` · `bunx playwright test` (se tocou UI) · `bun run build`.
2. Uma revisão da classe da tarefa, sobre o diff.
3. Verifique cada critério de aceite da spec (agent `spec-verifier` ou `superpowers:verification-before-completion`). Critério sem evidência = não cumprido.
4. Registre: registro de execução em `docs/`, `docs/00-README.md` atualizado. Relate ao usuário o que foi feito, o que foi testado e o que não foi.

Detalhes: `docs/ai/SDD-WORKFLOW.md`. Catálogo: `docs/ai/SKILLS.md`.
