# Foca

App web mobile-first de preparação para o ENEM em **aulas curtas** (4–8 questões por lição), com um motor adaptativo que decide a próxima questão e uma tutora de IA (a Foca IA) que o aluno chama quando quiser. O diferencial é **constância e personalização**, não mais conteúdo.

- **Para agentes (Claude Code, Codex):** comece por [AGENTS.md](AGENTS.md).
- **Documentação:** [docs/README.md](docs/README.md) (mapa) e [docs/ESTADO.md](docs/ESTADO.md) (o que está em andamento).

## Estado

O app de estudo funciona de ponta a ponta no navegador, com o progresso guardado **só no aparelho**. Conta de verdade (e-mail e Google), banco de dados, sincronização entre aparelhos, proteção da Foca IA e documentos legais estão em implementação — [docs/specs/46-producao/](docs/specs/46-producao/spec.md). O que é real, local ou simulado hoje: [docs/produto/funcionalidades.md](docs/produto/funcionalidades.md).

## Rodar localmente

Requer [Bun](https://bun.sh) — **não use npm, yarn ou pnpm** (gerariam um lockfile paralelo).

```sh
git clone https://github.com/matheusvllz/flashtest.git foca
cd foca
bun install
cp .env.example .env   # OPENAI_API_KEY é opcional: sem ela, a Foca IA usa um fallback local
bun run dev            # http://localhost:8080
```

## Verificar

```sh
bunx tsc --noEmit                    # tipos
bun test tests/unit                  # testes unitários
bunx playwright install chromium     # só na primeira vez
bunx playwright test                 # testes end-to-end (sobe o servidor de desenvolvimento)
bun run build                        # build de produção
bun run lint:ci                      # ESLint (sem as regras de formatação)
bun run docs:check                   # links e caminhos da documentação
bun run skills:check                 # skills e agentes (Claude Code e Codex)
```

Build de produção servido localmente (para testar como na Vercel):

```sh
NITRO_PRESET=node-server bun run build
PORT=3100 node .output/server/index.mjs
```

## Deploy

Hospedagem na **Vercel**, conectada a este repositório: cada push em `main` gera um deploy de produção. Por isso, **push só com decisão do proprietário**. Detalhes (preset do Nitro por ambiente, variáveis, proteção de preview, limites do plano): [docs/operacao/ambientes-e-deploy.md](docs/operacao/ambientes-e-deploy.md) e [decisão 0001](docs/decisoes/0001-hospedagem-vercel.md).

## Stack

TanStack Start + TanStack Router (rotas por arquivo em `src/routes/`), React 19, Vite 8, Nitro, Tailwind CSS v4 + shadcn/ui, Bun. Arquitetura: [docs/arquitetura/visao-geral.md](docs/arquitetura/visao-geral.md).

## Ferramentas no mesmo repositório (fora do app)

- `automacao-instagram/` — produção de conteúdo do Instagram, com dependências próprias.
- `content-pipeline/` — pipeline offline de geração e revisão de questões.
