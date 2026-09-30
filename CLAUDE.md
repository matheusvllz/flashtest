@AGENTS.md

# Específico do Claude Code

O `AGENTS.md` acima é a fonte das regras e vale igual para o Claude e o Codex. Aqui fica só o que é próprio do Claude Code.

## Skills e agentes

- **Entrada:** a skill `foca-sdd` (retomar, próxima tarefa, qual skill usar). Matriz de skills com alternativa para quando uma skill não estiver disponível: [docs/ai/SKILL-ROUTING.md](docs/ai/SKILL-ROUTING.md). Catálogo (o que existe, onde, para qual agente): [docs/ai/SKILLS.md](docs/ai/SKILLS.md) e [docs/ai/skills-registry.json](docs/ai/skills-registry.json).
- **Onde ficam:** as skills do projeto têm a fonte em `.agents/skills/` (é onde o Codex as descobre) e um espelho gerado em `.claude/skills/` (onde o Claude as descobre). Edite a fonte e rode `bun scripts/agents/sincronizar-skills.ts`; o validador (`node scripts/validate-skills.mjs`) falha se o espelho divergir. Skills só do Claude (ex.: `repo-security-review`) vivem apenas em `.claude/skills/`.
- **Plugins do projeto** (`.claude/settings.json`: superpowers, agent-skills, impeccable, humanizer, tanstack-*, frontend-design, ui-ux-pro-max) dependem do host e podem não carregar numa sessão. Se a skill indicada não estiver disponível, use a alternativa da matriz e anote no registro.
- **Subagentes:** `spec-verifier` (somente leitura) confere uma entrega contra a spec antes de declarar pronto; `foca-social` produz conteúdo do Instagram dentro de `automacao-instagram/`. Dois subagentes nunca editam o mesmo arquivo ao mesmo tempo. O relatório de um subagente não aparece para o usuário: repasse o que importa.
- **Revisões embutidas:** `/code-review` (diff), `/security-review` (segurança do diff), `/simplify` (qualidade).

## Onde as ferramentas escrevem (prevalece sobre o padrão de qualquer skill)

- Spec, plano e registro: `docs/specs/NN-tema/` (`spec.md`, `tarefas.md`, `registro.md`) — nunca `SPEC.md`, `tasks/` ou `docs/superpowers/`.
- Contexto de produto e design: `docs/PRODUCT.md` e `docs/DESIGN.md` — nunca na raiz.
- Relatórios do `repo-security-review`: `.security-review/` (ignorado); o resumo vai para `docs/seguranca/auditorias/`.

## Memória

A memória persistente é pista, não fato: código e spec atuais vencem. Uma lembrança que cite arquivo, função ou flag precisa ser conferida antes de virar recomendação.
