# AGENTS.md — Foca

Entrada única para qualquer agente (Codex lê este arquivo; o Claude Code o importa pelo `CLAUDE.md`). Curto de propósito: as regras detalhadas vivem em `docs/`, uma fonte por assunto — mapa em [docs/README.md](docs/README.md).

## O produto

App web mobile-first de preparação para o ENEM em aulas curtas (4–8 questões por lição da trilha), com um motor adaptativo que decide a próxima questão e uma tutora de IA (a Foca IA) sob demanda. O diferencial é constância e personalização, não mais conteúdo ([docs/produto/estrategia.md](docs/produto/estrategia.md) §0). Toda feature se testa contra a persona João ([docs/produto/persona-joao.md](docs/produto/persona-joao.md) §0).

## Antes de qualquer tarefa

1. Leia [docs/ESTADO.md](docs/ESTADO.md): iniciativa ativa, tarefa em curso, próximo passo, bloqueios.
2. Leia só a seção da spec ativa que a tarefa cita e o fim do registro dela.
3. Escolha as skills pela matriz em [docs/ai/SKILL-ROUTING.md](docs/ai/SKILL-ROUTING.md). Skill nenhuma prevalece sobre uma spec aprovada nem sobre este arquivo.
4. Ao terminar: teste, revise, verifique contra os critérios, registre a evidência e atualize o `ESTADO.md` (checkpoint). Fluxo completo: [docs/ai/SDD-WORKFLOW.md](docs/ai/SDD-WORKFLOW.md).

Se `ESTADO.md` divergir do `git status`/`git log`, pare e registre a divergência. Se não houver tarefa aprovada pendente, pergunte — não invente escopo.

## Regras duras

1. **Segredos só no servidor.** Nunca `VITE_*` para segredo; nunca segredo no repositório nem em log. `.env` é ignorado; `.env.example` só tem nomes.
2. **Git.** Nunca reescrever histórico publicado (sem force-push, rebase, amend ou squash de commit enviado). Commit, push, PR e deploy só com pedido explícito do proprietário — push em `main` dispara deploy de produção na Vercel.
3. **Um só store no cliente:** `src/lib/store.ts` (`useSyncExternalStore` + `localStorage`, chave `foca.state.v3`). Nunca criar um segundo mecanismo de estado; a sincronização com o servidor é extensão dele. Mudança de schema = migração aditiva e testada em `src/lib/state-migrations.ts`.
4. **Nunca editar `src/routeTree.gen.ts`** (gerado).
5. **Identidade e recompensas vêm do servidor.** Nenhuma função de servidor aceita id de usuário do cliente; XP, streak, conclusões, cotas e aceite legal não são decididos pelo navegador ([docs/seguranca/README.md](docs/seguranca/README.md)).
6. **Dados pessoais e menores.** Público majoritariamente adolescente. Coleta nova só com spec que a autorize e linha em [docs/seguranca/privacidade.md](docs/seguranca/privacidade.md). Sem analytics externo sem spec própria.
7. **Foca IA só sob demanda.** Errar uma questão nunca abre nem envia mensagem ao tutor automaticamente.
8. **Conteúdo pedagógico é protegido.** Nenhuma ferramenta de escrita altera enunciado, alternativa, gabarito, fórmula, dado, citação ou texto de questão oficial ([docs/copy/05-conteudo-pedagogico.md](docs/copy/05-conteudo-pedagogico.md)).
9. **Code splitting não regride:** a raiz (`src/routes/__root.tsx`) não importa store, `AppShell` nem conteúdo; arquivo de rota não exporta nada além de `Route`; componentes pesados de pending/error via `lazyRouteComponent`. Senão a landing baixa o produto inteiro ([docs/arquitetura/contratos.md](docs/arquitetura/contratos.md)).
10. **Dependência nova só com spec aprovada**, versão fixada.
11. **Nada de teste destrutivo ou de carga contra produção ou serviços de terceiros.**

## Stack e comandos

TanStack Start + TanStack Router (rotas por arquivo em `src/routes/`), React 19, Vite 8, Nitro, Tailwind CSS v4 + shadcn/ui (`src/components/ui/`), **bun** (nunca npm/yarn). Hospedagem na Vercel ([docs/decisoes/0001-hospedagem-vercel.md](docs/decisoes/0001-hospedagem-vercel.md)). Arquitetura: [docs/arquitetura/visao-geral.md](docs/arquitetura/visao-geral.md).

```bash
bun install && bun run dev      # http://localhost:8080
bunx tsc --noEmit                # tipos
bun test tests/unit              # unitários
bunx playwright test             # E2E (sobe o dev server)
bun run build                    # build de produção
bun run lint                     # ESLint
bun run docs:check               # links e caminhos da documentação
```

Gate de toda tarefa que muda código: tipos, unitários e build verdes; E2E quando tocar UI ou fluxo; saída real registrada.

## Onde estão as coisas

| Assunto | Fonte |
|---|---|
| Regras de produto em vigor | [docs/produto/regras.md](docs/produto/regras.md) |
| Contratos de código (jornada, nivelamento, recompensa, feedback, tutor) | [docs/arquitetura/contratos.md](docs/arquitetura/contratos.md) |
| Design system (tokens em `src/styles.css`) | [docs/DESIGN.md](docs/DESIGN.md) → [docs/design/sistema-rabisco.md](docs/design/sistema-rabisco.md) |
| Mascote (sempre `<FocaMark />`; erro nunca mostra `desapontada` nem `cobrando`) | [docs/design/mascote.md](docs/design/mascote.md) |
| Texto que o aluno lê | [docs/COPY.md](docs/COPY.md) antes de mudar qualquer string; strings em `src/lib/copy.ts`, falas da Foca em `src/lib/voz.ts`, inventário em [docs/copy/inventario.md](docs/copy/inventario.md); skills de escrita só pelo roteamento em [docs/ai/SKILL-ROUTING.md](docs/ai/SKILL-ROUTING.md) §2.1 |
| Segurança e níveis de revisão (L1/L2/L3) | [docs/seguranca/README.md](docs/seguranca/README.md) |
| Decisões | [docs/decisoes/](docs/decisoes/README.md) |
| Histórico (IDs `docs/NN` citados no código → caminho atual) | [docs/historico/README.md](docs/historico/README.md) |

**Tokens de marca:** todo token novo vai em `:root` e `.dark` como variável base (`--abismo`, `--mar`…) referenciada por `--color-*` no `@theme inline`; nunca hex literal no `@theme inline` (a classe gerada ignoraria o dark mode).

**IDs de documento são permanentes:** `docs/36 §x` num comentário de código continua válido depois que o documento foi arquivado; o caminho atual está no mapa do histórico.

## Ferramentas independentes (fora do app)

- `automacao-instagram/` — agente de conteúdo do Instagram (`package.json`, testes e `.env` próprios). Nada dali entra em `src/`, no build ou no `package.json` da raiz; o app não importa nada dela. Instruções: [automacao-instagram/AGENTE.md](automacao-instagram/AGENTE.md). Publicar exige pedido explícito para um conteúdo identificado.
- `content-pipeline/` — pipeline offline de geração e revisão de questões, usado por `scripts/content/*`; `src/` não importa dele (teste `tests/unit/pipeline-boundary.test.ts`).
- `edição Videos/` — edição de vídeo local, fora do Git.
