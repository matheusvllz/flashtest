> **Arquivado em 29/09/2026 (decisão 0004).** Documento histórico: o cabeçalho e o "estado" abaixo descrevem o momento em que foi escrito, não o estado atual. O que continua valendo foi extraído para os documentos canônicos ([docs/README.md](../../../README.md)); resumo e contexto: [resumo.md](resumo.md).

# 45 — Registro: integração da landing, desktop de primeira classe e sistema oficial da Foca

> Norma: [44-plano-integracao-produto-web.md](44-plano-integracao-produto-web.md). Executado em 29/09/2026 (Opus 5.5), no mesmo turno do pedido, sem commit.
>
> **Estado:** `LANDING PAGE: INTEGRATED` · `INTEGRAÇÃO COM O APP: AUTHORIZED / IMPLEMENTED`. A regra de isolamento do `CLAUDE.md`, do `40` §22 e do `42`/`43` foi **revogada pelo proprietário** (pedido de 29/09/2026).

## 1. Auditoria (antes)

| Área | Achado |
|---|---|
| Arquitetura | Dois produtos: `landing/` (Vite próprio, pré-render, deploy próprio) e o app TanStack Start. `/` do app era um splash ("Foca 60 segundos.") e `/welcome` era a "landing" antiga, com copy proibida pelo `copy/06` §5 |
| Desktop | Toda tela era uma coluna de 600 px no centro com o `NavRail` de 96 px; em 1440 e 1920 px, dois terços da tela vazios (capturas em 1366, 1440 e 1920) |
| Teclado | Nenhum atalho nas questões |
| Foca IA | Folha de baixo também no desktop, cobrindo a questão |
| Mascote | `FocaMark` já tipado com os 8 nomes, mas toda expressão caía na arte neutra (as artes não existiam); erro de questão usava `neutra`, sair da lição usava `desapontada` |
| Ícones | Favicon, apple-touch e PWA sobre grafite `#3A3A3C`; sem manifest |
| Fontes | App no Google Fonts (requisição a terceiros); landing autohospedada |
| Peso | Ao integrar a primeira vez, a landing baixava **418 kB gz** de JS/CSS: a raiz importava o store, o `AppShell` e, por eles, o conteúdo do produto |

## 2. Arquitetura e rotas

- `landing/` foi **incorporada** a `src/marketing/` (seções, componentes, conteúdo, movimento, CSS) e a pasta foi removida. Um build (`bun run build`), um deploy (o mesmo projeto Vercel), um `package.json`.
- Rotas: `/` landing (SSR, indexável) · `/app` porta do produto (logado → `/trilha`; senão → `/quiz`; `start_url` do PWA) · `/welcome` → redirect para `/` · demais rotas sem mudança de URL.
- CTAs: "Começar grátis" → `/quiz`; "Entrar" → `/login`; quem tem conta neste aparelho (`authed && onboarded` no estado salvo) vê **"Continuar estudando" → `/app`** depois da hidratação, sem redirecionamento. Todos são `<Link>` do roteador (transição dentro do SPA, prefetch por intenção).
- Links antigos para `/welcome` (quiz, perfil, login) apontam para `/`.
- Login: "Começar em 60s" → "Começar grátis"; "Continue sua jornada" (fora do glossário) → "Seu próximo passo está guardado".

## 3. Code splitting (o que custou achar)

| Causa | Correção |
|---|---|
| A raiz importava `store` (áudio), `AppShell` (erro/404) e `PersistenceBanner` | Preferência de som lida do armazenamento; páginas de erro com uma coluna simples; banner com `lazy()` e só fora da landing |
| `/trilha` com `pendingComponent`/`errorComponent` estáticos (o divisor não os separa) importando `AppShell` | `lazyRouteComponent` |
| `routes/study.tsx` exportava `pickQuestionsAdaptive` (o divisor mantém qualquer export no JS inicial) | Movida para `src/lib/study/escolher-questoes.ts` |
| O app baixava os sons no primeiro toque também na landing | O destravamento de áudio ignora a rota `/` |

Resultado (build de produção, 390 px): a landing baixa **202 kB gz** (156 kB antes do `load`; o GSAP, 46 kB, depois), contra 418 kB na primeira integração. Quem abre `/trilha` não baixa o CSS nem o GSAP da landing. O preço estrutural da integração é o React + roteador no JS inicial da landing (~88 kB gz), que a landing isolada adiava.

## 4. Desktop de primeira classe

Tokens novos em `src/styles.css` (§4 do `44`): `--wide-col` (880/1000/1120), `--side-col`, `--tutor-painel`; `--app-col` 680 e `--reading-col` 720 em ≥ 1280; `--nav-rail` 232 em ≥ 1280. Utilitários `desk-split`/`desk-main`/`desk-aside`, `desk-grid`, `desk-colunas`; `col-max-w` respeita `--sheet-col` (folhas ficam na largura do app numa tela larga).

| Tela | Desktop |
|---|---|
| Navegação | `NavRail` 96 px (1024–1279) e barra lateral de 232 px com a logo oficial e rótulos (≥ 1280) |
| Trilha | Duas colunas: sessão de hoje e caminho no centro; **painel "Seu dia"** preso à direita com o cabeçalho (sequência, meta, nível) e o convite ao nivelamento. Mesmo DOM do celular |
| Progresso, perfil | Coluna larga com cartões em duas colunas (`desk-colunas`) |
| Onboarding, login, recuperar senha | `EntryShell`: painel da marca à esquerda (Foca **acolhedora**, promessa do produto, pauta) e o formulário à direita; formulário primeiro no DOM |
| Questões (Praticar, lição, microlição, nivelamento) | Coluna de leitura de 720 px; **atalhos**: `1`–`5` ou `A`–`E` escolhem, `Enter` confirma/continua (`useAtalhosDeQuestao`, opções por `role="radio"`/`data-opcao`, ação por `data-acao-principal`); `Esc` segue com os diálogos |
| Foca IA | **Painel lateral direito** de altura total em ≥ 1024; a coluna abre espaço (`html[data-tutor]`), a questão continua à vista. Só abre sob demanda (sem mudança de regra) |
| Hover | `btn-outline`, `btn-ghost`, `card-press` e alternativas com hover só em `@media (hover: hover)` |

Abaixo de 1024 px, nada muda (conferido em 390 px: trilha, progresso, perfil, onboarding, login, tutor).

## 5. Sistema oficial da Foca

- **Originais** em `src/assets/branding/foca/expressoes/<nome>.png` (1254 px, entrega de 29/09/2026). **Gerador único** `scripts/gerar-marca.ts` (bun + sharp; substitui `gerar-logos-foca.ps1`): recorta pela caixa de alfa, gera 96 e 320 px em **WebP e PNG**, lê as cores do `src/styles.css`.
- **Registro** `src/lib/brand/foca-expressions.ts`: os 8 nomes oficiais, significado, quando usar e quando evitar, `focaExpression()` (valor desconhecido → `neutra`), caminhos. `FocaMark` usa `<picture>` (WebP + PNG) e anima a troca de expressão com o "piscar" (achata no eixo Y e troca no fundo do movimento; sem crossfade, sem rotação; direto com movimento reduzido). Sem expressão, o `FocaMark` é a **logo oficial**.
- **Mapeamento no app** (tabela completa no `15` §5):

| Momento | Expressão |
|---|---|
| Errou uma questão (folha de feedback, tela de fim com desempenho baixo) | **acolhedora** (era `neutra`) |
| "Não sei" | neutra |
| Acertou, fim de lição bom, sessão concluída | orgulhosa |
| 100 %, marco de sequência, capítulo concluído | empolgada |
| Aha do onboarding | surpresa |
| Vazio, 404 | entediada |
| O app ou o conteúdo falhou (erro da raiz, trilha que não carregou) | **desapontada** (era `entediada`) |
| Confirmar saída da lição | **neutra** (era `desapontada`: sair não é falha) |
| Tutor (botão e cabeçalho), `/app` | neutra |
| Painel da marca no onboarding e no login | acolhedora |
| `cobrando` | não usada em nenhum fluxo do aluno |

- **Na landing:** telas do app com a mesma expressão do app (motivo e tutor `neutra`, folha de erro `acolhedora`); demo com o resultado (acerto `orgulhosa`, erro `acolhedora`, "Não sei" `neutra`); na história, a Foca do cartão de faixa pisca de `neutra` para `orgulhosa` quando a faixa chega; no recomeço, `neutra` → `acolhedora` quando o congelamento cobre o dia; no fechamento, `neutra` → `acolhedora` quando a folha aparece (`FocaTroca`).

## 6. Ícone da marca, PWA e metadados

- Regra permanente (I-4): ícone institucional = **logo oficial sobre `--mar`** (#2E6BFF, lido do token pelo gerador). Gerados: `favicon.ico` (16/32/48), `favicon-16/32/48.png`, `apple-touch-icon` 180, `icon-192`, `icon-512`, `icon-maskable-512` (cabeça em 58 % do lado, dentro da zona segura), `og-image` do produto.
- A arte de referência entregue ("Logo Oficial Fundo Azul.png") usa a pose de lado; o SDD define a oficial como a Foca de frente, então os ícones usam a de frente. Trocar é uma linha no gerador, se o proprietário preferir a de lado.
- `public/site.webmanifest` (gerado): `start_url: /app`, `scope: /`, `display: standalone`, cores do token `--neve`. Sem service worker (offline real é outro plano).
- Head da raiz: `noindex, nofollow` para o produto, manifest, ícones, preload da fonte de título, **sem Google Fonts** (fontes em `public/fonts/`). A rota `/` sobrescreve: `index, follow`, título, descrição, Open Graph (`/og/og-landing.png`, refeita com a logo oficial), JSON-LD; canonical com `VITE_SITE_URL`. `robots.txt` liberado; sitemap quando houver domínio.
- `vercel.json` ganhou os cabeçalhos de segurança da landing (nosniff, referrer, permissions, `frame-ancestors 'none'`) e cache longo para `/fonts`.

## 7. Motion

A landing mantém a linguagem do `42` §6 (GSAP só nela, em chunk depois do `load`). O app continua com motion de CSS. O que é comum: easing e durações da marca, o botão que afunda pela aresta e o **"piscar" da Foca**, a mesma troca de expressão nos dois lados (`.foca-piscar` no app, `lp-piscar` e `piscar()` do GSAP na landing). Nenhum scrollytelling dentro do produto. Na navegação entre as duas partes, o `boot` da landing limpa ScrollTrigger, observadores e as classes que põe no `<html>`.

## 8. Testes

| Verificação | Resultado |
|---|---|
| `bunx tsc --noEmit` | 0 erros |
| `bun test tests/unit` | **1238 passando**, 0 falhando (inclui os 68 da landing em `tests/unit/marketing/`, reescritos para o head da rota, o `vercel.json` da raiz e os destinos internos; `brand-assets` lê o registro de expressões e confere WebP e PNG) |
| E2E da landing (`tests/e2e/marketing`, projetos `lp-*` em 320/390/768/1280/1440) contra o **build de produção** (`LP_BASE_URL=http://localhost:3100`) | Primeira rodada: 201 passando e 1 falha (navbar em duas linhas a 360 px), corrigida com logo de 30 px e `gap-x-2`. **Rodada final (build refeito): 202 passando, 0 falhando**, 43 puladas por desenho (teste restrito a um projeto) |
| E2E do app (`chromium`, `desktop`, `narrow`, servidor de dev) | Primeira rodada: 246 passando; as 19 falhas eram contratos mudados de propósito (porta `/app`, tokens de desktop, head da landing, assets WebP) e foram atualizadas. **Rodada final: 263 passando, 31 puladas, 2 falhas intermitentes** (timeout de `page.goto` em `a11y-dialogs` e um erro de console em `lessons`, os dois com o servidor de dev sob carga). Rodados de novo sozinhos e depois com `--repeat-each=4` e 6 workers: 40 de 40 passando |
| `bun run build` (preset netlify), `VERCEL=1 bun run build` (preset vercel) e `NITRO_PRESET=node-server bun run build` | Os três passam |
| Lighthouse, landing, build de produção atrás de proxy com brotli (`scripts/marketing/proxy-comprimido.ts`, simula a compressão da Vercel) | **Mobile 81** / A11y 100 / BP 100 / SEO 100 (FCP 2,9 s, LCP 3,7 s, CLS 0, TBT 67 ms) · **Desktop 100** / 100 / 100 / 100 (LCP 0,6 s) |
| Revisão visual | Landing em 360, 390, 430, 768, 1024, 1366, 1440, 1920; app em 390, 1366, 1440 e 1920 (trilha, praticar, atividade, progresso, perfil, onboarding, login, tutor aberto); atalho `2` conferido no navegador; console sem erros |

## 9. O que ficou pior, e por quê

- **Performance mobile da landing: 98 → 81.** A landing isolada tinha 2,8 kB de JS inicial e CSS inline; integrada, ela hidrata com o React e o roteador do app e carrega o CSS global do app (17 kB br), que disputam banda com o CSS e a fonte do título no 4G simulado. É o custo de uma navegação SPA contínua entre landing e produto. Caminhos para recuperar, se o proprietário quiser: CSS crítico inline na rota `/`, dividir o CSS global por área, ou servir `/` como página estática e hidratar só as ilhas.

## 10. Pendências

- **Usuário:** domínio e `VITE_SITE_URL` (canonical, sitemap); `OPENAI_API_KEY` no app (sem ela, desligar `TEXTO_COM_FOTO` em `src/marketing/sections/Errou.tsx`); decidir a pose do ícone (frente, como está, ou lado, como a referência).
- **Copy do produto ainda fora do guia** (migração do `36` Fase 10, não desta etapa): falas com "60 segundos" em `voz.ts`, "Sem e-mail, sem senha" no onboarding, "Meta diária 3 aulas de 60s" no perfil.
- **Manual:** celular físico, leitor de tela, instalação do PWA num Android real.
- Telas de lista secundárias (redação, flashcards, plano, ranking, tópicos) ficaram na coluna de 680 px com a barra lateral; não ganharam grade própria.
