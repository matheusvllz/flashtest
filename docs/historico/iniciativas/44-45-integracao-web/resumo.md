---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [44, 45]
---
# 44–45 — Produto web integrado (landing + app + desktop + Foca oficial): resumo de encerramento

## O que mudou

- `landing/` incorporada em `src/marketing/` e removida: um build, um deploy, um `package.json` (45 §2).
- Rotas: `/` é a landing (SSR, indexável, `src/routes/index.tsx`); `/app` é a porta do produto (com conta → `HOME_ROUTE`, sem → `/quiz`; `start_url` do PWA); `/welcome` redireciona para `/`.
- Code splitting: a raiz deixou de importar store, `AppShell` e conteúdo; `pendingComponent`/`errorComponent` da `/trilha` com `lazyRouteComponent`; `pickQuestionsAdaptive` saiu da rota para `src/lib/study/escolher-questoes.ts`. A landing caiu de 418 para 202 kB gz (45 §3).
- Desktop de primeira classe: tokens `--wide-col`, `--side-col`, `--tutor-painel`, `--nav-rail` 232 em ≥ 1280; `desk-split`/`desk-aside`/`desk-colunas`; `EntryShell` nas telas de entrada; Foca IA como painel lateral em ≥ 1024; atalhos de questão em `src/hooks/useAtalhosDeQuestao.ts` (45 §4).
- As 8 expressões oficiais: originais em `src/assets/branding/foca/expressoes/`, registro em `src/lib/brand/foca-expressions.ts`, `FocaMark` com `<picture>` e o "piscar"; gerador único `scripts/gerar-marca.ts` (substitui `gerar-logos-foca.ps1`) (45 §5).
- Ícones sobre `--mar`, `public/site.webmanifest`, fontes locais sem Google Fonts, cabeçalhos de segurança no `vercel.json` (45 §6).

## Decisões relevantes

- `44` §1: I-1 (landing como porta de entrada, um site), I-2 (desktop de primeira classe), I-3 (as 8 expressões entram no produto), I-4 (ícone = logo oficial sobre o azul `--mar`, regra permanente), I-5 (errar nunca mostra decepção nem cobrança).
- Mapeamento de expressões por momento (45 §5): erro → `acolhedora`; falha do app → `desapontada`; sair da lição → `neutra`; `cobrando` sem uso com o aluno.
- Ícones com a Foca de frente, embora a referência entregue use a de lado; trocar é uma linha no gerador (45 §6).
- Aceito o custo de performance mobile da landing integrada (98 → 81) em troca da navegação SPA contínua (45 §9).

## Evidência

- 45 §8 (29/09/2026): `bunx tsc --noEmit` 0 erros; `bun test tests/unit` **1238 passando, 0 falhando** (inclui 68 da landing em `tests/unit/marketing/`); E2E da landing contra o build de produção **202 passando, 0 falhando, 43 puladas**; E2E do app **263 passando, 31 puladas, 2 falhas intermitentes** (depois 40 de 40 com `--repeat-each=4`); builds netlify, vercel e node-server passam; Lighthouse da landing mobile 81 / 100 / 100 / 100 (LCP 3,7 s), desktop 100 em tudo.

## Limitações e o que não foi feito

- Performance mobile da landing abaixo do alvo do `40` G-18 (≥ 90) depois da integração (45 §9).
- Telas de lista secundárias (redação, flashcards, plano, ranking, tópicos) sem grade própria no desktop (45 §10).
- Sem celular físico, leitor de tela nem instalação do PWA num Android real; sem service worker (45 §6, §10).

## Regras que continuam valendo

Extraídas no T-01.3 (`46` §D.4): `44` §3 (code splitting, não pode regredir) e §4–§7 (desktop, ícone, PWA) → `docs/arquitetura/contratos.md` e `docs/DESIGN.md`; `44` I-4/I-5 → `docs/design/mascote.md`; tabela de expressões → `docs/design/mascote.md` (junto do `15` §5).

## Verificação de encerramento

- **(a) Registro × tarefas:** os 9 passos do `44` §10 têm registro no `45`: assets e ícones (§5–§6), registro e `FocaMark` (§5), landing e rotas (§2–§3), fontes, metadados e manifest (§6), desktop (§4), expressões nos fluxos (§5), testes (§8), revisão visual e Lighthouse (§8), SDD e `CLAUDE.md` (cabeçalho). Nenhum passo sem status.
- **(b) Contratos no código:**
  1. `src/routes/app.tsx:13` (`createFileRoute("/app")`) e `:26` (`navigate({ to: s.authed && s.onboarded ? HOME_ROUTE : "/quiz", replace: true })`); `src/routes/index.tsx:2` importa `Landing` de `@/marketing/Landing`.
  2. `src/routes/trilha.tsx:48-49`: `pendingComponent: lazyRouteComponent(...TrailSkeleton)` e `errorComponent: lazyRouteComponent(...TrailError)`.
  3. `src/lib/brand/foca-expressions.ts:15` (`export const FOCA_EXPRESSIONS = [`), `:29` (`FOCA_EXPRESSION_DEFAULT ... = "neutra"`), `:40` (`FOCA_EXPRESSION_INFO`).
- **(c) Números de teste:** 1238 unitários; 202 E2E da landing; 263 E2E do app com 2 intermitentes (45 §8).
- **(d) Pendências → backlog:** domínio e `VITE_SITE_URL` (canonical, sitemap); `OPENAI_API_KEY` ou `TEXTO_COM_FOTO = false`; pose do ícone (frente ou lado); copy do produto fora do guia ("60 segundos" em `voz.ts`, "Sem e-mail, sem senha", "Meta diária 3 aulas de 60s"); recuperar performance mobile da landing (CSS crítico, dividir CSS global, ilhas); grade de desktop nas telas secundárias; verificação manual e PWA real; E2E intermitentes sob carga (`a11y-dialogs`, `lessons`).

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [44-plano-integracao-produto-web.md](44-plano-integracao-produto-web.md)
- [45-registro-execucao-integracao.md](45-registro-execucao-integracao.md)
