> **Arquivado em 29/09/2026 (decisão 0004).** Documento histórico: o cabeçalho e o "estado" abaixo descrevem o momento em que foi escrito, não o estado atual. O que continua valendo foi extraído para os documentos canônicos ([docs/README.md](../../../README.md)); resumo e contexto: [resumo.md](resumo.md).

# 44 — Integração da landing ao app, desktop de primeira classe e sistema oficial da Foca

> **Status:** plano de trabalho escrito e executado na mesma rodada (pedido do usuário de 29/09/2026: "integrar oficialmente a Landing Page ao produto Foca [...] execute-o integralmente nesta mesma tarefa"). Registro: [45-registro-execucao-integracao.md](45-registro-execucao-integracao.md).
>
> **Autorização:** o pedido **revoga a regra de isolamento** do `CLAUDE.md`, do `40` §22 e do `42`/`43`. Estado novo: `LANDING PAGE: INTEGRATED` · `INTEGRAÇÃO COM O APP: AUTHORIZED / IMPLEMENTED`.
>
> **O que continua valendo:** `40`/`42` para copy, afirmações permitidas, movimento e acessibilidade da landing; `36` para layout, diálogos e persistência do app; `20` §7.1 e `15` §3 (a Foca nunca cobra nem culpa); `copy/` para todo texto.

## 1. Decisões do usuário (29/09/2026)

| ID | Decisão |
|---|---|
| I-1 | A landing deixa de ser isolada e vira a porta de entrada do produto (um só site, um só build, um só deploy) |
| I-2 | Desktop passa a ser primeira classe no app (não "coluna de celular no meio da tela") |
| I-3 | As 8 expressões oficiais entregues (`acolhedora`, `entediada`, `surpresa`, `desapontada`, `empolgada`, `orgulhosa`, `cobrando`, `neutra`) entram no design system com nomes preservados |
| I-4 | **Regra de marca:** quando a marca aparece só como ícone (favicon, ícone de app, PWA, atalho), é a **logo oficial sobre o azul oficial do design system** (token `--mar`). Expressões da mascote são contextuais e nunca substituem esse ícone |
| I-5 | Erro nunca é punição: nenhuma expressão de decepção ou cobrança depois de errar |

## 2. Auditoria (resumo; detalhe no `45` §1)

| Parte | Veredito | Por quê |
|---|---|---|
| App TanStack Start (rotas, store, motor adaptativo, testes) | **KEEP** | Sólido e testado; nada é reescrito |
| `/` (splash "Foca 60 segundos.") | **REPLACE** | Vira a landing; a decisão "logado → trilha / novo → entrada" vai para `/app` |
| `/welcome` | **REMOVE (redireciona para `/`)** | Era a landing antiga do app, com copy proibida ("60 segundos", "Não é X. É Y.") |
| `landing/` (app Vite separado) | **MERGE** | Código vai para `src/marketing/`; `tokens.css`/`utilities.css` (cópias do app) somem; testes migram para `tests/` |
| Fontes do Google Fonts no app | **REPLACE** | Autohospedadas (as mesmas woff2 da landing): sem requisição a terceiros, preload da fonte de título |
| `FocaMark` com prop `expression` | **IMPROVE** | Já tipado com os 8 nomes, mas toda expressão caía na arte neutra; passa a ler um registro central com a arte real, WebP e fallback |
| Ícones (favicon, apple-touch, 192/512) sobre grafite `#3A3A3C` | **REPLACE** | Regra I-4: azul oficial, lido do token `--mar` no gerador |
| Manifest PWA | **ADD** | Não existia; ícones e cores saem dos tokens |
| Layout desktop do app (`--app-col` 600 px + `NavRail` 96 px) | **IMPROVE** | Base boa (tokens de `36` §F.6), mas toda tela é uma coluna estreita com as laterais vazias |
| Balão do tutor (folha de baixo) | **ADAPT** | No desktop vira painel lateral direito; mesma lógica e as mesmas regras (abre só sob demanda) |
| Motion da landing (GSAP) | **KEEP** | Só na rota `/`, em chunk próprio; o app continua com motion CSS funcional |

## 3. Arquitetura e rotas

| Rota | O que é | SSR | Indexável |
|---|---|---|---|
| `/` | Landing (marketing) | **sim** (HTML completo para SEO e primeira pintura) | sim |
| `/app` | Entrada do produto: logado e com onboarding → `HOME_ROUTE` (`/trilha`); senão → `/quiz` | não | não |
| `/quiz` | Onboarding ("Começar grátis") | não | não |
| `/login`, `/forgot`, `/signup`, `/onboarding` | Entrar e redirects legados | não | não |
| `/welcome` | Redirect para `/` | — | — |
| `/trilha`, `/study`, `/progress`, `/profile`, `/atividade/$id`, `/nivelamento`, ... | Produto, sem mudança de URL | não | não |

- **Por que não `/app/*` para tudo:** as rotas do produto já são URLs estáveis (deep links, testes, Lovable); renomear todas não traz ganho. `/app` é só a porta.
- **CTA da landing:** "Começar grátis" → `/quiz`; "Entrar" → `/login`. Para quem já tem conta neste aparelho (`authed && onboarded`), os CTAs trocam para **"Continuar estudando" → `/app`** depois da hidratação, sem redirecionar a landing.
- **Navegação interna:** CTAs viram `<Link>` do roteador (transição dentro do SPA, com prefetch por intenção).
- **Code splitting:** a landing é um chunk de rota; o GSAP continua em import dinâmico depois do `load`; o CSS de marketing (`src/marketing/styles/*.css`) só entra pela rota `/` (link no `head` da rota). Quem abre `/trilha` não baixa nada disso.

## 4. Design system compartilhado

- **Um só conjunto de tokens:** `src/styles.css`. A landing usa os mesmos tokens de cor, raio, easing e as mesmas fontes; o `marketing.css` só acrescenta a escala tipográfica de marketing, o container e as peças da landing (antes `@utility`, agora classes simples, porque o arquivo não passa pelo Tailwind da rota).
- **Tokens novos (layout desktop):** `--nav-rail` passa a 232 px em ≥ 1280 (barra lateral com rótulos); `--wide-col` (conteúdo de telas com painel lateral, até 1120 px); `--side-col` (painel de contexto, 320 px); `--reading-col` sobe para 720 px em ≥ 1280.
- **Fontes:** `@font-face` autohospedadas em `public/fonts/` (Space Grotesk, Plus Jakarta Sans, Space Mono); Caveat (anotações à mão) só no CSS de marketing.

## 5. Desktop (produto)

Estratégia: **três faixas por composição**, não por aparelho — `< 768` (coluna do celular, sem mudança), `768–1023` (coluna mais larga, bottom nav), `≥ 1024` (navegação lateral + composição de desktop). Em `≥ 1280` a navegação ganha rótulos e as telas com contexto ganham o painel lateral.

| Tela | Desktop |
|---|---|
| Trilha (`/trilha`) | Duas colunas: caminho e sessão de hoje no centro; **painel de contexto fixo** à direita com o que já existe (sequência, meta do dia, nível, convite ao nivelamento, matéria atual). Nada novo para "preencher espaço" |
| Praticar, atividade, lições, nivelamento (questões) | Coluna de leitura mais larga (720 px), enunciado maior, **atalhos de teclado** (1–5 / A–E escolhem, Enter verifica e continua, Esc fecha folhas), hover nas alternativas. A questão continua sozinha no centro: foco |
| Foca IA (`TutorBubble`) | **Painel lateral direito** em ≥ 1024 (não cobre a questão); folha de baixo continua no celular. Só abre sob demanda |
| Progresso, perfil, redação, flashcards, plano, ranking | Coluna larga com grade de 2 colunas onde a tela é lista de cartões |
| Onboarding (`/quiz`), login | **Painel da marca** à esquerda em ≥ 1024 (Foca acolhedora + a frase do produto) e o formulário à direita |
| Navegação | `NavRail` 96 px em 1024–1279; **barra lateral** com logo e rótulos em ≥ 1280 |

Hover, foco e estado ativo em todo controle (`@media (hover: hover)` para não grudar no toque).

## 6. Sistema oficial da Foca

- **Registro central:** `src/lib/brand/foca-expressions.ts` com as 8 expressões (nome oficial = chave), caminhos dos derivados, significado, quando usar e quando evitar. `FocaMark` e a landing leem dele; valor desconhecido cai em `neutra` (fallback documentado).
- **Assets:** originais em `src/assets/branding/foca/expressoes/<nome>.png` (1254 px); derivados em `public/branding/foca/expressoes/<nome>-{96,320}.{webp,png}` (WebP servido por `<picture>`, PNG de reserva). Nada é pré-carregado; só a expressão que aparece.
- **Gerador:** `scripts/gerar-marca.ts` (bun + sharp) substitui o `.ps1`: lê as cores do `src/styles.css`, gera expressões, ícones e manifest.
- **Mapeamento semântico** (tabela oficial no `15` §5 e no `45`): erro → `acolhedora`; acerto → `orgulhosa`; "Não sei" → `neutra`; marco → `empolgada`; aha → `surpresa`; vazio e 404 → `entediada`; falha do app (não do aluno) → `desapontada`; `cobrando` **não é usada** em fluxo do aluno (só humor explícito e nunca sobre ausência ou resultado).
- **Motion de troca:** "piscar" (a cabeça achata 8 % no eixo Y por 90 ms, a arte troca no fundo do piscar, volta com `--ease-bounce`); nunca rotação, nunca crossfade entre duas cabeças.

## 7. Ícone da marca, PWA e metadados

- Ícones sobre `--mar` (#2E6BFF no claro): `favicon.ico` (16/32/48), `favicon-16/32/48.png`, `apple-touch-icon` 180, `icon-192`, `icon-512`, `icon-maskable-512` (logo dentro dos 80 % seguros). `og-image` do app também sobre o azul.
- `site.webmanifest`: nome, `short_name`, `start_url: /app`, `scope: /`, `display: standalone`, `background_color`/`theme_color` do token `--neve`, ícones. Sem service worker nesta etapa (offline real é outro plano).
- Metadados: raiz = `noindex` (produto); `/` sobrescreve com `index, follow`, título, descrição, Open Graph, JSON-LD e canonical (com `VITE_SITE_URL`). `robots.txt` liberado; sitemap só quando o domínio existir.

## 8. Motion compartilhado

Mesma assinatura (`--ease-out`, `--ease-bounce`, 180/320/560 ms, botão que afunda pela aresta). A landing é cinematográfica (GSAP, scroll); o app é funcional (CSS, feedback e transição de estado). Nenhum scrollytelling dentro do produto. A troca de expressão ("piscar") é a peça comum às duas.

## 9. Qualidade e deploy

- Build único (`bun run build`, preset Vercel) e o mesmo `vercel.json`, com os cabeçalhos de segurança que eram da landing.
- Testes: unitários e E2E da landing migram para `tests/` (rodando contra o servidor do app); os do app continuam. Lighthouse na `/`. Revisão visual em 360, 390, 430, 768, 1024, 1366, 1440 e 1920.

## 10. Ordem

1. Assets da Foca e ícones · 2. Registro e `FocaMark` · 3. Landing em `src/marketing/` e rotas · 4. Fontes, metadados, manifest · 5. Desktop (navegação, trilha, questões, tutor, telas de lista, onboarding e login) · 6. Expressões nos fluxos · 7. Testes migrados e do app · 8. Revisão visual e Lighthouse · 9. SDD, `CLAUDE.md`, memória.
