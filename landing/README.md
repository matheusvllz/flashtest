# Landing page do Foca

> **Regra de isolamento (permanente).** Esta pasta é uma aplicação independente. Ela **não é integrada ao aplicativo** (`src/`, rotas, `__root.tsx`, `styles.css`, config da raiz, deploy do app) até o proprietário do projeto pedir explicitamente: *"Agora integre a Landing Page ao aplicativo."* "Finalizar" ou "publicar" a landing não autorizam integração. Nada aqui importa de `../src` (`bun run check:isolation` garante).
>
> Spec: [`docs/40-plano-landing-page-marketing.md`](../docs/40-plano-landing-page-marketing.md). Registro: [`docs/41-registro-execucao-landing-page.md`](../docs/41-registro-execucao-landing-page.md).

Vite + React 19 + Tailwind v4, pré-renderizada em HTML estático (funciona sem JavaScript). Movimento em CSS, com GSAP carregado depois da primeira pintura. Sem analytics, sem cookies, sem requisições a terceiros.

## Rodar

```bash
cd landing
bun install
cp .env.example .env        # ajuste VITE_APP_URL se o app não estiver em :8080
bun run dev                 # http://localhost:4321
```

## Comandos

| Comando | O que faz |
|---|---|
| `bun run dev` | Servidor de desenvolvimento (porta 4321, não conflita com o app em 8080) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun test tests/unit` | Testes unitários (copy, links, isolamento, tokens, SEO) |
| `bun run build` | Build do cliente + build SSR + pré-render → `dist/` |
| `bun run preview` | Serve `dist/` em http://localhost:4322 |
| `bunx playwright test` | E2E (usa o preview) |
| `bun run check:isolation` | Falha se algo importa de fora de `landing/` |
| `bun run check:tokens` | Compara `src/styles/tokens.css` com o `src/styles.css` do app (só avisa) |
| `bun run sync:tokens` / `sync:brand` / `sync:fonts` | Recopia tokens, logos (e gera as versões leves) e fontes. Lê o app, escreve só aqui |
| `bun run shots` | Captura retratos reais do app (exige o app rodando em :8080) |
| `bun run og` | Gera `public/lp/og/og-landing.png` |
| `bun run lighthouse` | Lighthouse (3 rodadas mobile + 1 desktop, mediana) contra o preview em :4322 |

## Variáveis de ambiente (todas públicas)

| Variável | Uso |
|---|---|
| `VITE_APP_URL` | Onde o app está publicado. Todo "Começar agora" (`/quiz`) e "Entrar" (`/`) sai daqui |
| `VITE_SITE_URL` | URL pública da landing (canonical, og:url, sitemap). Vazio = sem canonical |
| `VITE_LP_INDEXABLE` | `true` só depois da aprovação da publicação. Padrão: `noindex` |

## O que a página faz e não faz

- Um único destino: `{VITE_APP_URL}/quiz` ("Começar agora"). "Entrar" vai para `{VITE_APP_URL}/`.
- Zero requisição a terceiros, zero cookie, zero analytics. Os eventos (`landing_view`, `hero_cta_click` etc.) são só `CustomEvent` local em `window` ("foca-lp:track"); um provedor futuro precisa de spec própria (público majoritariamente menor de idade).
- Os retratos de telas são capturas reais do app (`bun run shots`, com o app rodando em :8080); a questão da demo é copiada literal do banco do app (`src/content/demo-item.source.md`).
- Hidratação: o React só hidrata três ilhas ("Como funciona", demo e dúvidas; as duas últimas em chunks depois do `load`). Navbar e barra fixa são HTML com comportamento em `src/lib/chrome-dom.ts`; eventos locais em `src/lib/track-dom.ts`. O resto é HTML estático.
- Movimento: CSS no hero; GSAP + ScrollTrigger só no scroll, em chunk separado carregado depois do `load`. Tudo aparece sem JS e com `prefers-reduced-motion`.
- Segurança: `vercel.json` com cabeçalhos e CSP por `<meta>` com hash dos scripts inline (gerada no build). `noindex` até `VITE_LP_INDEXABLE=true`.

## Publicar (ação do proprietário, não da IA)

Projeto Vercel separado do app, com **Root Directory = `landing`**, install `bun install --frozen-lockfile`, build `bun run build`, output `dist`, e as três variáveis acima. O projeto Vercel do app não muda.

## Onde mora o quê

- Todo texto visível: `src/content/copy.ts` (nunca no JSX).
- Tokens do app (cópia): `src/styles/tokens.css`. Extensões de marketing: `src/styles/marketing-tokens.css`. Movimento: `src/styles/motion.css`.
- Retratos do produto: `public/lp/shots/` (gerados por `bun run shots`).
- Todo link para o app: `src/lib/app-url.ts`.
