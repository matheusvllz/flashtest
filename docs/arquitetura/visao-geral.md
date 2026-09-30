---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [arquitetura atual, stack, build, rotas, fronteiras entre modulos]
substitui: []
substituido-por: null
---

# Arquitetura: visão geral (estado implementado em 29/09/2026)

> **Como usar.** Este documento descreve a arquitetura **como ela existe hoje**, antes do backend do plano `46`. É o mapa: stack, build, deploy, pastas, rotas, estado, servidor, conteúdo e fronteiras. Os contratos normativos (jornada, conclusão, recompensa, feedback, tutor) ficam em [contratos.md](contratos.md); o sistema de conteúdo em [conteudo.md](conteudo.md). Origem de cada regra como `(NN §x)`; os números de documento são permanentes. Toda afirmação sobre código cita o arquivo; se o código mudar, este texto muda na mesma entrega (46 §C.3).

## 1. Stack e versões

Versões **instaladas** (lidas de `node_modules/*/package.json` em 29/09/2026; o `package.json` declara faixas):

| Peça | Versão | Observação |
|---|---|---|
| TanStack Start (`@tanstack/react-start`) | 1.168.26 | SSR, server functions, entrada de servidor |
| TanStack Router / router-plugin | 1.170.16 / 1.168.18 | Rotas por arquivo em `src/routes/` |
| React / React DOM | 19.2.5 | |
| Vite | 8.0.16 | |
| Nitro | 3.0.260603-beta | Só no build; gera a saída por preset |
| Tailwind CSS / `@tailwindcss/vite` | 4.2.4 | Tokens em `src/styles.css` (`@theme inline`) |
| TypeScript | 5.9.3 | `tsconfig.json`: `strict`, alias `@/*` → `src/*` |
| TanStack Query | 5.101.1 | `QueryClient` no contexto do roteador (`src/router.tsx`) |
| zod | 3.25.76 | |
| GSAP | 3.15.0 | Só na landing, em import dinâmico |
| Playwright | 1.63.0 | E2E (`@axe-core/playwright` 4.13.0 para acessibilidade) |
| sharp | 0.35.5 | Só no gerador de marca (`scripts/gerar-marca.ts`) |
| ESLint | 9.39.4 | `bun run lint` |
| Bun | 1.4.2 | Gerenciador e executor de scripts e testes unitários (`bun.lock`) |

Componentes de interface: shadcn/ui em `src/components/ui/` (46 arquivos, Radix por baixo).

## 2. Build

- `vite.config.ts` **não usa o Vite direto**: importa `defineConfig` de `@lovable.dev/vite-tanstack-config` 2.7.7 (`vite.config.ts:7`), que monta tailwind, tsconfig-paths, `tanstackStart` com `importProtection` (bloqueia `**/server/**` e `server-only` no cliente), nitro só no build, plugin React, alias `@`, dedupe, `lightningcss` e o servidor de desenvolvimento em `host "::"`, porta 8080 (46 §A.1). O pacote vem de um registry privado da Lovable e tem exceção própria em `bunfig.toml`. **O plano 46 F03 (T-03.1/T-03.2) substitui esse wrapper por uma configuração explícita e remove a dependência.**
- Configuração própria no arquivo: entrada de servidor em `src/server.ts` (`tanstackStart.server.entry: "server"`) e o preset do Nitro (`vite.config.ts:10-22`).
- **Preset do Nitro:** `NITRO_PRESET ?? (VERCEL ? "vercel" : "netlify")` (`vite.config.ts:21`). Na Vercel sai `vercel` (`.vercel/output`); fora dela, `netlify` (inclusive no CI e nos builds locais); `NITRO_PRESET=node-server` gera `.output/server/index.mjs`, usado para testar o build de produção (`PORT=3100 node .output/server/index.mjs`) (44 §9; 45 §8).
- Scripts (`package.json`): `predev` e `prebuild` rodam `bun scripts/content/build-packs.ts` (pacotes de conteúdo, §8); `dev` = `vite dev`; `build` = `vite build`; `test:unit` = `bun test tests/unit`; `test:e2e` = `playwright test`; `lint` = `eslint .`.
- `src/routeTree.gen.ts` é gerado pelo plugin do roteador. Nunca editar à mão.

## 3. Deploy e CI

- **Vercel** (`vercel.json`): `bun install --frozen-lockfile` e `bun run build`; cabeçalhos de segurança em todas as rotas (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP só com `frame-ancestors 'none'; base-uri 'self'; object-src 'none'`); cache imutável de 1 ano em `/fonts/*` e cache de 1 dia em `/branding/*`. Plano Hobby (46 D-11).
- `netlify.toml` ainda existe (com `npm run build`), resquício de hospedagem anterior; o 46 F03 o remove.
- **CI** (`.github/workflows/ci.yml`): em push para `main` e em pull request, com Node 22 e Bun 1.4.2: `bun install --frozen-lockfile`, `bunx tsc --noEmit`, `bun test tests/unit`, `bun run build`. **Não roda lint nem E2E.**
- Segredos: `.env` na raiz, gitignorado (`.env*` com exceção de `.env.example`). Hoje a única variável do app é `OPENAI_API_KEY`, lida só no servidor; `CONTENT_LLM_*` é do pipeline offline (`.env.example`). `VITE_SITE_URL` (opcional) alimenta canonical e metadados da landing (`src/marketing/config.ts:5`). Nada secreto pode ter prefixo `VITE_`.

## 4. Mapa de `src/`

| Caminho | Responsabilidade |
|---|---|
| `src/routes/` | Uma rota por arquivo (TanStack Router). `__root.tsx` é o documento raiz |
| `src/router.tsx` | Cria o roteador com `QueryClient` no contexto |
| `src/server.ts` | Entrada de servidor: carrega o `server-entry` do Start e troca 500 engolido pelo h3 por uma página de erro |
| `src/start.ts` | `createStart` com um middleware que transforma exceção de SSR em página de erro 500 |
| `src/styles.css` | Tokens de design (claro e `.dark`), utilitários, animações, layout de desktop |
| `src/components/` | `AppShell` (coluna + navegação), `NavRail`, `EntryShell`, `TutorBubble`, `PersistenceBanner`; `brand/` (FocaMark, FocaSays), `ds/` (peças do design system), `learning/` (trilha, jornada, passos de lição), `lessons/` (players e exercícios), `onboarding/`, `progress/`, `ui/` (shadcn) |
| `src/hooks/` | `useLearningSession`, `useExerciseSession`, `usePlacementReconciliation`, `useDialogA11y`, `useAtalhosDeQuestao`, `usePathFocusScroll`, `use-mobile` |
| `src/lib/store.ts` | **Único** estado do cliente (§6) |
| `src/lib/state-migrations.ts` | Migrações do schema local |
| `src/lib/adaptive/` | Motor adaptativo: modelo (θ, Mastery, Confidence), classificação, candidatos, pontuação, planejador, seleção de itens, nivelamento (CAT), checkpoint, trace (30 §9–§13) |
| `src/lib/learning/` | Tipos e lógica de lição, passos, trilha, revisão, recomendação, dicas, montagem de tentativa |
| `src/lib/lessons/` | Motor das lições de redação legadas (registro, tipos, foco do tutor) |
| `src/lib/content/` | `repository.ts` (baixa manifest e pacotes) e `preload.ts` |
| `src/lib/audio/` | `engine.ts` e `identity.ts` (identidade sonora v2) |
| `src/lib/feedback/` | Criação e despacho do feedback de resposta e de fechamento |
| `src/lib/study/` | `escolher-questoes.ts` (seleção do `/study`, fora do arquivo de rota por causa do code splitting) |
| `src/lib/brand/` | `foca-expressions.ts` (registro das 8 expressões) |
| `src/lib/` (soltos) | `features.ts` (flags), `copy.ts` (textos funcionais), `voz.ts` (falas da Foca), `gaps.ts` (lacunas por heurística), `haptics.ts`, `tutor*.ts` (§7), `lovable-error-reporting.ts` (sai no 46 T-03.2), `sfx.ts` (fachada histórica sem uso) |
| `src/content/` | Conteúdo embarcado: `trilhas/`, `microlicoes/`, `items/` (índice de itens), `taxonomy/`, `banco/` (fonte dos pacotes), `oficial/`, `curriculum*.ts`, `exam-tips.ts`, `exercise-ids.ts` ([conteudo.md](conteudo.md)) |
| `src/data/` | Dados mockados tipados: `questions.ts`, `subjects.ts`, `universities.ts`, `courses.ts`, `exams.ts`, `ranking.ts` |
| `src/marketing/` | Landing: `Landing.tsx`, `sections/`, `components/`, `content/` (`copy.ts`, `app-screens.ts`, `seo.ts`), `motion/` (GSAP), `styles/marketing.css` |
| `src/assets/branding/` | Originais da marca (entrada do gerador) |

## 5. Rotas

| Rota | O que é | SSR |
|---|---|---|
| `/` | Landing (marketing), indexável (`src/routes/index.tsx`) | sim |
| `/app` | Porta do produto: `authed && onboarded` → `HOME_ROUTE`; senão → `/quiz`. É o `start_url` do PWA (`src/routes/app.tsx:26`) | não |
| `/trilha` | Home do produto (`HOME_ROUTE` com `FEATURES.trilhaComoHome`, `src/lib/features.ts`) | não |
| `/study`, `/atividade/$activityId`, `/learn/$lessonId`, `/redacao`, `/redacao/$licaoId`, `/nivelamento` | Estudo | não |
| `/progress`, `/profile`, `/flashcards`, `/plan`, `/topics`, `/ranking`, `/video/$id`, `/premium`, `/offline` | Demais telas do produto (várias simuladas, ver 46 §A.2) | não |
| `/quiz`, `/aha`, `/login`, `/forgot` | Onboarding e entrada | não |
| `/debug` | Ferramenta interna (em produção só com `?debug=1`) | não |
| `/dashboard` | Home antiga, mantida como rollback atrás da flag | não |
| `/welcome` | Redireciona para `/` | — |
| `/signup`, `/onboarding` | Redirecionam para `/quiz` | — |

- 25 dos 28 arquivos de rota declaram `ssr: false`; os outros são `__root.tsx`, `index.tsx` (landing) e `welcome.tsx` (redirect).
- Navegação do produto: 4 itens (Aprender, Praticar, Progresso, Perfil) na barra inferior abaixo de 1024 px e no `NavRail` a partir de 1024 px (barra lateral com rótulos em ≥ 1280) (25 §6.2; 44 §5).
- **Não há guarda de rota.** "Logado" é o booleano `authed` no armazenamento local, e só `/app` o consulta (46 §A.2).
- Landing: CTA "Começar grátis" → `/quiz`; "Entrar" → `/login`; com conta no aparelho, "Continuar estudando" → `/app`. A landing nunca redireciona (44 §3).

## 6. Estado do cliente

- **Um único store:** `src/lib/store.ts` (`useSyncExternalStore` + `localStorage`). Não criar mecanismo paralelo; toda feature nova estende este store (46 §B.2).
- Chave `foca.state.v3` (`store.ts:181`), schema interno **v6** (`CURRENT_SCHEMA_VERSION`, `state-migrations.ts:24`), regravado inteiro a cada `setState`. A chave antiga `flashtest.state.v2` é lida uma vez como fallback (`store.ts:182`).
- Migrações aditivas em `state-migrations.ts`, com backups únicos `foca.state.backup.before-learning-v4` e `foca.state.backup.before-v6` (linhas 25–27). JSON ilegível é copiado para `foca.state.corrupt.<ISO>` (`store.ts:342`).
- Falha de gravação nunca é anunciada como salva (`PersistenceBanner`); entre abas, o evento `storage` faz a aba adotar o estado mais novo (`store.ts:655`) (36).
- Flags em `src/lib/features.ts` (`BASE_FEATURES`); override local só em desenvolvimento ou com `?debug=1` (`localStorage["foca.flags"]`).
- Modelo de dados local detalhado e a evolução para o servidor: `arquitetura/dados.md` (46 §C.2).

## 7. Servidor

Hoje o único código de servidor é o tutor (46 §A.2):

- `src/lib/tutor.ts`: só o transporte, `askTutor = createServerFn({ method: "POST" })` com `.inputValidator(validateTutorRequest)` (`tutor.ts:15-17`).
- `src/lib/tutor-core.ts`: a lógica, sem importar nada do TanStack (testável fora do transporte): validação (até 40 mensagens de até 4.000 caracteres; imagem PNG, JPEG ou WebP até 5 MiB), chamada `fetch` à API de chat da OpenAI com o modelo `gpt-5.4-mini`, timeout de 12 s e queda para o fallback local (`tutor-core.ts:22-67, 162, 210`).
- `src/lib/tutor-prompt.ts`: `buildSystemPrompt` (persona e regra anti-LaTeX) e `localFallback`.
- `src/lib/tutor-context.ts`: `buildPedagogicalContext`, o contexto pedagógico que o cliente monta; não é importado por `store.ts` nem por `TutorBubble.tsx`.
- Defeitos conhecidos (endpoint sem autenticação nem limite, contexto do cliente sem validação no prompt, histórico que passa de 40 mensagens): 46 §A.4 (IA-1 a IA-5).
- `src/server.ts` e `src/start.ts` só tratam erro de SSR (§4).

## 8. Pacotes de conteúdo

- O banco gerado vive em `src/content/banco/<materia>/*.json` (versionado). `scripts/content/build-packs.ts` roda em `predev`/`prebuild` e escreve `public/content/v1/manifest.json` + um JSON por matéria com hash no nome (`<materia>.<hash>.json`), mais os índices leves `src/content/banco/itens-gerados.ts` e `aulas-geradas.ts`. `public/content/` é gitignorado.
- `src/lib/content/repository.ts` baixa o manifest e os pacotes sob demanda (prazo de 8 s, nova tentativa em chamada posterior, dedupe) (36 T-05.4).
- Detalhe: [conteudo.md](conteudo.md).

## 9. Code splitting (resumo)

Regra que não pode regredir (44 §3; 45 §3): a landing não pode baixar o produto.

- A raiz (`__root.tsx`) não importa o store, o `AppShell` nem conteúdo; o `PersistenceBanner` entra com `lazy()` e só fora da landing (`__root.tsx:24-29`).
- Arquivo de rota não exporta nada além de `Route` (conferido: todos os arquivos `.tsx` de `src/routes/` têm um único `export`).
- `pendingComponent`/`errorComponent` pesados usam `lazyRouteComponent` (ex.: `src/routes/trilha.tsx:48-49`).
- O CSS de marketing entra só pela rota `/`; o GSAP é import dinâmico depois do `load`; o áudio não destrava na `/`.
- `store.ts` não importa `@/content/{items,microlicoes,trilhas,taxonomy}` (`tests/unit/store-bundle-boundary.test.ts`).

Lista normativa completa: [contratos.md](contratos.md).

## 10. Ferramentas independentes e fronteiras

| Pasta | O que é | Fronteira |
|---|---|---|
| `content-pipeline/` | Pipeline offline de conteúdo com IA (prompts, schemas, relatórios; `lotes/` gitignorado) | Usada por `scripts/content/*`; nada de `src/` importa `scripts/content` (`tests/unit/pipeline-boundary.test.ts`) |
| `scripts/` | `content/` (pipeline e build de pacotes), `gerar-marca.ts`, `marketing/` (Lighthouse, proxy comprimido, capturas), `foca_sound/` (QA de áudio, Python) | Rodam fora do app |
| `automacao-instagram/` | Agente de conteúdo do Instagram, com `package.json`, testes e `.env` próprios | Só **lê** marca, copy e assets do repo; nada dela entra em `src/`, no build ou no deploy (`automacao-instagram/AGENTE.md`) |
| `edição Videos/` | Pasta de edição de vídeo com `CLAUDE.md` próprio ("não é projeto versionado") | Nenhuma. Não rastreada; ainda fora do `.gitignore`, que o 46 D-05 manda incluir (junto com `Claude outputs/`) |

Limites dos guardas atuais: `pipeline-boundary.test.ts` confere só imports de `scripts/content` em `src/`; não há teste equivalente para `automacao-instagram/` ou `edição Videos/`, e o `eslint .` passa por dentro dessas pastas (46 §A.8).

## 11. Testes

- **Unitários** (`bun test tests/unit`): 96 arquivos `*.test.ts`, com `tests/unit/marketing/` (landing) e `tests/unit/helpers/`. Cobrem motor adaptativo, store e migrações, conteúdo e pipeline, tutor, marca, copy, contraste e tokens.
- **E2E** (Playwright, `tests/e2e/`, 31 specs, 5 deles em `tests/e2e/marketing/`). Servidor: `bun run dev` na porta 8080 (reaproveitado se já estiver rodando). Projetos em `playwright.config.ts`:

| Projeto | Viewport | O que roda |
|---|---|---|
| `chromium` | 390×844 | Todo o app, exceto `marketing/` |
| `desktop` | 1280×800 | `layout.spec.ts` |
| `narrow` | 320×700 | `trail-home`, `lesson-v2`, `trail-path`, `layout` |
| `lp-narrow`, `lp-mobile`, `lp-tablet`, `lp-desktop`, `lp-wide` | 320×700, 390×844, 768×1024, 1280×800, 1440×900 | `marketing/*.spec.ts`; `LP_BASE_URL` aponta para o build de produção |

- Verificação típica antes de entregar: `bunx tsc --noEmit`, `bun test tests/unit`, `bun run build`; E2E conforme a área tocada.
- Não há teste em aparelho físico, leitor de tela real nem escuta de áudio (37 §5).

## 12. Evolução planejada (46)

- **Backend:** Postgres gerenciado (Neon, `sa-east-1`) com Drizzle, módulos de servidor em `src/server/**`, server functions com middleware de sessão, CSRF, rate limit e validação zod (46 §E.1, §E.2, §E.5).
- **Autenticação:** Better Auth com e-mail e senha verificados e Google, sessões revogáveis, e o estudo passando a exigir conta (46 §E.3; D-07, D-08, D-10).
- **Sincronização:** *local-first*, com outbox no mesmo store (schema v7 aditivo), `sync.push`/`sync.pull` e o servidor como autoridade de XP, sequência e conclusões; o conteúdo continua estático (46 §E.4).
- **Foca IA:** exige conta, contexto montado no servidor, cota por plano e teto global de custo, salvaguardas para menores (46 §E.7; D-12).
- **Legal:** termos e política versionados em `src/content/legal/` (a criar), aceite registrado, avaliação do ECA Digital (46 §H; F11).
