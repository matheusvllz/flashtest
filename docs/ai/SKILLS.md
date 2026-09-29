# Skills, plugins e ferramentas de agente do Foca

> Para quem é: agentes que trabalham no Foca e quem mantém o repo. Instalado e auditado em 22/09/2026 (Claude Code 2.1.280, Windows 11). **Skills são ferramentas auxiliares: nunca prevalecem sobre a spec** — ver a hierarquia em [SDD-WORKFLOW.md](SDD-WORKFLOW.md) §1. Qual usar em cada caso: [SKILL-ROUTING.md](SKILL-ROUTING.md). Versão legível por máquina: [`.claude/skills-registry.json`](../../.claude/skills-registry.json).

## 1. Visão geral

Cinco tipos de integração, cada um instalado pelo método oficial do seu upstream:

| Tipo | O que é | Onde vive | Versionado no repo? |
|---|---|---|---|
| **CLAUDE CODE PLUGINS** (escopo de projeto) | Pacotes com skills/agents/hooks/commands vindos de um marketplace | Declarados em `.claude/settings.json` (`extraKnownMarketplaces` + `enabledPlugins`); código baixado em `~/.claude/plugins/cache/` | Só a declaração. Cada pessoa que abrir o repo e **confiar na pasta** recebe o pedido de instalação |
| **LOCAL PROJECT SKILLS** | Pastas `SKILL.md` copiadas para o projeto | `.claude/skills/<nome>/` + `skills-lock.json` (hash) na raiz | Sim, inteiras |
| **EXTERNAL TOOLING** | Binários/CLIs de que uma skill depende | Máquina do dev | Não — instruções abaixo |
| **REFERENCE LIBRARIES** | Conteúdo consultado sob demanda (CSV, referências) dentro de uma skill | Dentro da skill | Conforme a skill |
| **PROJECT MCP SERVERS** | Servidor MCP externo (não é uma skill — não tem `SKILL.md`) registrado só para este projeto | `.mcp.json` na raiz (`mcpServers`) | Sim, o `.mcp.json` inteiro |

| # | Ferramenta | Tipo | Estado padrão | Custo sempre-ativo* | Prioridade |
|---|---|---|---|---|---|
| A | Superpowers | Plugin | ativo | ~840 tok + ~1,1k injetados no início da sessão | Primary (workflow) |
| B | Addy Osmani Agent Skills | Plugin | ativo | ~3,6k tok | Specialist (engenharia) |
| C | Frontend Design | Plugin | ativo | ~80 tok | Primary (UI nova) |
| D | Impeccable | Plugin (+ hooks) | ativo | ~530 tok | Review (acabamento) |
| E | UI UX Pro Max | Plugin | ativo | ~1,1k tok | Reference |
| F | Taste (2 de 13 skills) | Local | ativo | ~120 tok | Specialist (só marketing/LP) |
| G | Web Design Guidelines | Local | ativo | ~60 tok | Review (auditoria) |
| H | React Best Practices | Local | ativo | ~100 tok | Specialist |
| I | GSAP Skills | Plugin | **desativado** | ~1,1k tok | Specialist (sob demanda) |
| J | Motion Design | Local | ativo | ~110 tok | Primary (direção de motion) |
| K | Marketing Skills | Plugin | **desativado** | ~13,6k tok | Primary (sob demanda) |
| L | Humanizer | Plugin | ativo | ~150 tok | Review (texto) |
| M | Repo Security Review | Local | ativo | ~200 tok | Review (L2/L3) |
| N | claude-mem | Plugin (escopo **usuário**) | ativo | ~2k tok + contexto injetado | Reference (memória) |
| O | SecondSky (3 de 145) | Plugin | ativo | ~390 tok | Reference |
| P | OmniRoute MCP | MCP server (projeto) | ativo | 0 (só via `npx` sob demanda) | Reference (ferramenta externa, sob demanda) |
| Q | Better Writing (`boraoztunc/skills`) | Local | ativo | ~160 tok (estimativa) | Primary (escrita de interface) |
| R | Ogilvy Copywriting (`boraoztunc/skills`) | Local | ativo | ~100 tok (estimativa) | Specialist (só marketing/posicionamento) |

\* Medido com `claude plugin details <plugin>` (descrições de skills que entram em toda sessão). Skills locais: estimativa pelo tamanho da descrição. O custo **ao invocar** (corpo da skill) é pago só quando ela é usada. Total ativo por padrão: ~11–12k tokens (~+260 com Q e R, 28/09/2026); com Marketing e GSAP ligados, ~26k. Ver [SKILL-ROUTING.md](SKILL-ROUTING.md) §5.

Estes plugins convivem com outros **já instalados no escopo de usuário** desta máquina (sincronizados do claude.ai: `engineering:*`, `design:*`, `marketing:*`, `product-management:*` etc.). Eles não fazem parte da configuração do projeto e não foram alterados. Quando um deles e uma ferramenta daqui cobrirem a mesma coisa, o roteamento indica qual usar.

---

## A. Superpowers

**Source:** https://github.com/obra/superpowers (distribuído pelo marketplace do autor, https://github.com/obra/superpowers-marketplace)
**Installation method:** plugin oficial — `claude plugin marketplace add obra/superpowers-marketplace --scope project` + `claude plugin install superpowers@superpowers-marketplace --scope project` (README do upstream, opção "superpowers-marketplace").
**Installed location:** `.claude/settings.json` → `superpowers@superpowers-marketplace`; cache `~/.claude/plugins/cache/superpowers-marketplace/superpowers/6.4.1/`
**Version / commit:** 6.4.1 — `5bf4e78011075bcfc0dc295f0724994cd123ee71` (22/09/2026)
**Skills (15):** `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`, `writing-skills`, `using-superpowers`, `diagnosing-superpowers`.
**Hooks:** `SessionStart` injeta o conteúdo inteiro de `using-superpowers` (~1,1k tokens) em toda sessão. Auditado: só lê o próprio `SKILL.md`, sem rede.
**Purpose:** disciplina de processo — descobrir requisito antes de codar, plano antes de execução, TDD, debugging sistemático, verificação antes de declarar pronto, execução por subagentes.
**Use when:** descoberta de requisitos sem spec (`brainstorming`); bug sem causa óbvia (`systematic-debugging`); execução de plano longo com subagentes; antes de dizer "pronto" (`verification-before-completion`).
**Do not use when:** já existe spec aprovada que responde a pergunta (não rebrainstormar); para escolher onde gravar spec/plano (usar o SDD — ver overrides em [SDD-WORKFLOW.md](SDD-WORKFLOW.md) §5).
**Related skills:** Addy (`spec-driven-development`, `planning-and-task-breakdown`, `debugging-and-error-recovery`).
**Possible overlap:** forte com Addy em TDD, planejamento, debugging e code review — ver [SKILL-ROUTING.md](SKILL-ROUTING.md) §4. O `using-superpowers` diz "se há 1% de chance de uma skill se aplicar, use-a" e "brainstorm antes de entrar em plan mode"; no Foca isso é limitado pelo próprio upstream ("instruções do usuário, CLAUDE.md e AGENTS.md prevalecem") e pelo `CLAUDE.md`. Escreve em `docs/superpowers/` e faz commit por padrão — **sobrescrito** pelo SDD.
**Priority:** Primary (processo).

## B. Addy Osmani Agent Skills

**Source:** https://github.com/addyosmani/agent-skills
**Installation method:** plugin — `claude plugin marketplace add https://github.com/addyosmani/agent-skills.git --scope project` + `claude plugin install agent-skills@addy-agent-skills --scope project`. Precisou do contorno documentado no README para Windows sem chave SSH do GitHub (reescrever `git@github.com:` → `https://github.com/`), aplicado **só no ambiente do comando** (`GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=url.https://github.com/.insteadOf GIT_CONFIG_VALUE_0=git@github.com:`), sem alterar o `git config --global`. Ver §Problemas.
**Installed location:** `.claude/settings.json` → `agent-skills@addy-agent-skills`; cache `~/.claude/plugins/cache/addy-agent-skills/agent-skills/0.6.10/`
**Version / commit:** 0.6.10 — `dc27a9c2e13721158157632de61b4106c6c2a2a1`
**Skills (25):** `spec-driven-development`, `planning-and-task-breakdown`, `incremental-implementation`, `test-driven-development`, `code-review-and-quality`, `code-simplification`, `debugging-and-error-recovery`, `api-and-interface-design`, `frontend-ui-engineering`, `performance-optimization`, `security-and-hardening`, `browser-testing-with-devtools`, `ci-cd-and-automation`, `context-engineering`, `constraint-driven-development`, `doubt-driven-development`, `deprecation-and-migration`, `documentation-and-adrs`, `git-workflow-and-versioning`, `idea-refine`, `interview-me`, `observability-and-instrumentation`, `shipping-and-launch`, `source-driven-development`, `using-agent-skills`.
**Commands (9):** `/spec`, `/plan`, `/build`, `/test`, `/review`, `/ship`, `/code-simplify`, `/constraints`, `/webperf` — use a forma com namespace (`/agent-skills:review`) para não colidir com comandos nativos.
**Agents (4):** `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor`.
**Hooks:** o repo tem scripts em `hooks/`, mas o `plugin.json` não os registra — nenhum hook ativo.
**Purpose:** práticas de engenharia sênior por domínio (API, frontend, performance, segurança, simplificação, shipping).
**Use when:** a tarefa é de um domínio de engenharia específico — carregar **a** skill do domínio, não o pacote.
**Do not use when:** para gerar `SPEC.md` ou `tasks/` (sobrescrito pelo SDD); para decidir visual.
**Related skills:** Superpowers, React Best Practices, Repo Security Review.
**Possible overlap:** Superpowers (TDD, planejamento, debug, review); `code-review` nativo e `engineering:code-review`; `/review` nativo.
**Priority:** Specialist.

## C. Frontend Design (Anthropic)

**Source:** https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design
**Installation method:** plugin — `claude plugin marketplace add anthropics/claude-code --scope project --sparse .claude-plugin plugins` (checkout parcial: o repo inteiro é grande) + `claude plugin install frontend-design@claude-code-plugins --scope project`.
**Installed location:** `.claude/settings.json` → `frontend-design@claude-code-plugins`; cache `~/.claude/plugins/cache/claude-code-plugins/frontend-design/1.1.0/`
**Version / commit:** 1.1.0 — `56f36532530f88b572854538d685fcf781141e8c`
**Skills (1):** `frontend-design`.
**Purpose:** direção de arte e qualidade de criação de interface; evitar estética genérica de IA.
**Use when:** tela nova, redesign aprovado em spec, componente visualmente relevante.
**Do not use when:** ajuste pequeno em tela existente (vai de Impeccable `polish`); quando a skill empurrar para "escolhas estéticas ousadas" que contrariem `docs/DESIGN.md` — no Foca a direção de arte já está decidida (Rabisco na Margem); a skill atua **dentro** dela.
**Related skills:** Impeccable, UI UX Pro Max, Taste.
**Possible overlap:** Taste (`design-taste-frontend`) e Impeccable (modo criação). Também existe `frontend-design` no SecondSky — **não instalado** para evitar nome duplicado.
**Priority:** Primary (criação).

## D. Impeccable

**Source:** https://github.com/pbakaus/impeccable
**Installation method:** plugin — `claude plugin marketplace add pbakaus/impeccable --scope project` + `claude plugin install impeccable@impeccable --scope project` (README, seção de marketplace do Claude Code). O instalador alternativo `npx impeccable install` **não** foi usado: ele copiaria a skill para `.claude/skills/` e o hook para `.claude/settings.local.json`, duplicando o plugin.
**Installed location:** `.claude/settings.json` → `impeccable@impeccable`; cache `~/.claude/plugins/cache/impeccable/impeccable/4.3.1/`
**Version / commit:** 4.3.1 — `e0881d2de397d5e9761d7b35ff5017d8f5ebf69b`
**Skills (1):** `impeccable`, com 24 subcomandos (`/impeccable critique`, `audit`, `polish`, `layout`, `typeset`, `animate`, `clarify`, `distill`, `harden`, `onboard`, `init`, `document`, `doctor`…). **Agents (4):** `impeccable-asset-producer`, `impeccable-documenter`, `impeccable-finish-reviewer`, `impeccable-manual-edit-applier`.
**Hooks (2):** `PostToolUse` em `Edit|Write` (5s) e `Stop` (30s, "design deep pass") rodam o detector de anti-padrões do Impeccable sobre arquivos de UI editados.
**Engine:** binário nativo baixado **uma vez** de `https://github.com/pbakaus/impeccable/releases/download/engine-v0.1.5/` para `~/.impeccable/bin/0.1.5/`, com verificação SHA-256 que falha fechado. Faz checagem de atualização em `https://impeccable.style` (desligável com `IMPECCABLE_NO_UPDATE_CHECK=1`). Hooks desligáveis com `IMPECCABLE_HOOK_DISABLED=1`.
**Contexto:** lê `docs/PRODUCT.md` e `docs/DESIGN.md` (o Impeccable procura na raiz, em `docs/` e em `.agents/context/`). **Não rodar `init` nem `document` para recriar esses arquivos na raiz.**
**Purpose:** crítica, auditoria, polimento e acabamento de interface existente.
**Use when:** "essa tela parece genérica", acabamento pós-implementação, hierarquia, tipografia, espaçamento, consistência.
**Do not use when:** backend; decisão de produto; redesign de identidade sem spec.
**Related skills:** Frontend Design, Web Design Guidelines, Taste.
**Possible overlap:** a descrição da skill é muito ampla ("design, redesign, critique, audit, polish… animate… UX copy") e compete pelo gatilho com Frontend Design, Motion Design, Web Design Guidelines e Humanizer. No Foca o papel dela é **refinamento** — ver [SKILL-ROUTING.md](SKILL-ROUTING.md).
**Priority:** Review.

## E. UI UX Pro Max

**Source:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
**Installation method:** plugin — `claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill --scope project` + `claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill --scope project` (README, opção marketplace).
**Installed location:** `.claude/settings.json` → `ui-ux-pro-max@ui-ux-pro-max-skill`; cache `~/.claude/plugins/cache/ui-ux-pro-max-skill/ui-ux-pro-max/2.13.0/`
**Version / commit:** 2.13.0 — `dcc40ff5133ef78276117db0cc34e7b83cc8aeba`
**Skills (7):** `ui-ux-pro-max`, `design`, `design-system`, `ui-styling`, `brand`, `banner-design`, `slides`.
**Dependência externa:** Python 3 para `scripts/search.py` (busca nos CSVs). Nesta máquina `python` não está no PATH (só o alias da Microsoft Store), mas `py -3` (Python 3.13.6) funciona — é o fallback que a própria skill documenta. Sem Python, `references/quick-reference.md` e `references/pro-rules.md` continuam utilizáveis.
**Purpose:** base consultável de conhecimento de UI/UX (estilos, paletas, tipografia, 119 guidelines de UX, charts, ícones, stacks).
**Use when:** pesquisa pontual para embasar uma decisão ("qual padrão de navegação para X?", "regra de UX para Y").
**Do not use when:** para escolher paleta, fonte ou estilo do Foca (já decididos em `docs/DESIGN.md`); `--design-system --persist` (criaria `design-system/` concorrente); as skills `brand`, `banner-design` e `slides` não têm uso no app.
**Related skills:** Frontend Design, Web Design Guidelines.
**Possible overlap:** `design-system` tem o mesmo nome curto de `design:design-system` (plugin de usuário) — são namespaces diferentes. `brand` sobrepõe `docs/brand/`.
**Priority:** Reference.

## F. Taste

**Source:** https://github.com/Leonxlnx/taste-skill
**Installation method:** skill local via o CLI documentado no README — `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend --skill redesign-existing-projects -a claude-code --copy -y` (`skills@1.7.0`, com `DISABLE_TELEMETRY=1 DO_NOT_TRACK=1`). O repo também tem manifest de plugin, mas ele instalaria as 13 skills de uma vez.
**Installed location:** `.claude/skills/design-taste-frontend/`, `.claude/skills/redesign-existing-projects/`; hash em `skills-lock.json`
**Version / commit:** `a6153b39e495b8d62666f33f6a7019fcba3b777f` (sem tag)
**Skills instaladas (nome real do frontmatter → pasta upstream):** `design-taste-frontend` (`skills/taste-skill/`), `redesign-existing-projects` (`skills/redesign-skill/`).
**Não instaladas (11), e por quê:** `design-taste-frontend-v1` (versão antiga), `gpt-taste`, `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`, `stitch-design-taste` (presets estéticos que brigariam com a identidade fixa do Foca), `brandkit` (marca já decidida), `image-to-code`, `imagegen-frontend-web`, `imagegen-frontend-mobile` (fluxo de geração de imagem fora do escopo), `full-output-enforcement` (altera comportamento geral do agente).
**Purpose:** reduzir cara de template em superfícies de marketing.
**Use when:** landing page, LP do link da bio (`docs/brand/`), página de campanha — superfícies **Persuade**.
**Do not use when:** UI do app. A própria skill diz: "Not dashboards, not data tables, not multi-step product UI." Nunca adotar o stack padrão dela (biblioteca Motion, fontes Geist/Satoshi) no lugar dos tokens do Foca.
**Related skills:** Frontend Design, Impeccable, Marketing Skills (`cro`, `copywriting`).
**Possible overlap:** Frontend Design (criação) e Impeccable (crítica).
**Priority:** Specialist.

## G. Web Design Guidelines (Vercel)

**Source:** https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
**Installation method:** skill local — `npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a claude-code --copy -y` (README da Vercel).
**Installed location:** `.claude/skills/web-design-guidelines/`
**Version / commit:** 1.0.0 — `063bee94c3f4df8453406c830b0a7df0f2860278`
**Purpose:** auditoria de UI contra as Web Interface Guidelines (acessibilidade, HTML semântico, teclado, foco, formulários, animação, dark mode…), com achados em `arquivo:linha`.
**Nota:** busca as regras em tempo de execução em `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` (exige rede e WebFetch).
**Use when:** depois de implementar ou alterar UI, sobre os arquivos tocados.
**Do not use when:** para criar ou redesenhar.
**Related skills:** Impeccable (`audit`), `design:accessibility-review` (usuário).
**Possible overlap:** Impeccable `audit`, UI UX Pro Max (regras de UX).
**Priority:** Review.

## H. React Best Practices (Vercel)

**Source:** https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices
**Installation method:** skill local — `npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -a claude-code --copy -y`. O nome real da skill é `vercel-react-best-practices` (a pasta upstream é `react-best-practices`).
**Installed location:** `.claude/skills/vercel-react-best-practices/` (inclui `rules/` e `AGENTS.md`; o `metadata.json` do upstream não é copiado pelo CLI)
**Version / commit:** 1.0.0 — `063bee94c3f4df8453406c830b0a7df0f2860278`
**Purpose:** 70 regras de performance React em 8 categorias (waterfalls, bundle, server, client fetching, re-render…).
**Use when:** escrever ou revisar componente React; lentidão; bundle. O Foca é React 19 + TanStack Start.
**Do not use when:** regras específicas de Next.js (App Router, `next/*`, RSC do Next) — **o Foca não usa Next.js**; ignorar essas regras.
**Related skills:** Addy `performance-optimization`, SecondSky `tanstack-start`.
**Possible overlap:** Addy `performance-optimization` (mais amplo, não React-específico).
**Priority:** Specialist.

## I. GSAP Skills

**Source:** https://github.com/greensock/gsap-skills
**Installation method:** plugin — `claude plugin marketplace add greensock/gsap-skills --scope project` + `claude plugin install gsap-skills@gsap-skills --scope project` (README: marketplace no Claude Code).
**Installed location:** `.claude/settings.json` → `gsap-skills@gsap-skills` (**`false` — desativado por padrão**); cache `~/.claude/plugins/cache/gsap-skills/gsap-skills/1.0.0/`
**Version / commit:** 1.0.0 — `aed9cfd3277740755f6bfc1155c7aa645403b760`
**Skills (8):** `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-frameworks`, `gsap-performance`, `gsap-utils`.
**Por que desativado:** o Foca não tem GSAP. Motion hoje é CSS (`styles.css` + `tw-animate-css`) e o `25` proíbe biblioteca de UI nova sem decisão. Ligar custaria ~1,1k tokens por sessão sem uso.
**Use when:** uma spec aprovar GSAP (timelines, ScrollTrigger, Flip, morph) — ex.: landing com scroll cinematográfico. Ligar com `claude plugin enable gsap-skills@gsap-skills --scope local` e reiniciar a sessão (ou `/reload-plugins`).
**Do not use when:** animação simples que CSS resolve; antes de a Motion Design definir a intenção.
**Related skills:** Motion Design (decide), UI UX Pro Max (17 presets GSAP como referência).
**Possible overlap:** nenhum de implementação no projeto.
**Priority:** Specialist (sob demanda).

## J. Motion Design (LottieFiles)

**Source:** https://github.com/LottieFiles/motion-design-skill
**Installation method:** skill local — `npx skills add LottieFiles/motion-design-skill --skill motion-design -a claude-code --copy -y` (README).
**Installed location:** `.claude/skills/motion-design/` (`director/`, `patterns/`, `reference/`)
**Version / commit:** 1.0.0 — `f9a8a041b85185ee4881b3471d3415e939aac772`
**Purpose:** direção de movimento — por que algo se move, o quê, quando, com que duração/easing e que emoção comunica — antes de qualquer implementação.
**Use when:** qualquer animação, transição, microinteração, feedback de acerto/erro, celebração, loading.
**Do not use when:** para justificar animação que viole `16` §5 / `docs/DESIGN.md` (nada > 300ms em transição de tela, `prefers-reduced-motion` obrigatório).
**Related skills:** GSAP (implementação avançada), Impeccable `animate`.
**Possible overlap:** Impeccable `animate`; UI UX Pro Max (categoria Animation).
**Priority:** Primary (direção).

## K. Marketing Skills (Corey Haines)

**Source:** https://github.com/coreyhaines31/marketingskills
**Installation method:** plugin — `claude plugin marketplace add coreyhaines31/marketingskills --scope project` + `claude plugin install marketing-skills@marketingskills --scope project` (README, "Claude Code plugin").
**Installed location:** `.claude/settings.json` → `marketing-skills@marketingskills` (**`false` — desativado por padrão**); cache `~/.claude/plugins/cache/marketingskills/marketing-skills/2.11.1/`
**Version / commit:** 2.11.1 — `5b2c0007766c6a1cf1d53fd8fc73e979e0821022`
**Skills (50):** `product-marketing`, `copywriting`, `copy-editing`, `cro`, `signup`, `onboarding`, `paywalls`, `popups`, `churn-prevention`, `referrals`, `pricing`, `offers`, `launch`, `analytics`, `ab-testing`, `attribution`, `seo-audit`, `ai-seo`, `programmatic-seo`, `schema`, `site-architecture`, `aso`, `content-strategy`, `social`, `video`, `image`, `ads`, `ad-creative`, `emails`, `sms`, `cold-email`, `customer-research`, `competitors`, `competitor-profiling`, `marketing-psychology`, `marketing-plan`, `marketing-ideas`, `marketing-loops`, `marketing-council`, `lead-magnets`, `free-tools`, `community-marketing`, `co-marketing`, `influencer-marketing`, `public-relations`, `events`, `directory-submissions`, `prospecting`, `revops`, `sales-enablement`.
**Contexto:** as skills leem `.agents/product-marketing.md`, que existe e **aponta para `docs/PRODUCT.md`** (não duplica).
**Por que desativado:** é o maior custo fixo da instalação (~13,6k tokens por sessão, 50 descrições longas). O Foca está em fase de engenharia de produto. **Ligar quando a tarefa for de marketing:** `claude plugin enable marketing-skills@marketingskills --scope local` e reiniciar a sessão (ou `/reload-plugins`); desligar depois com `disable`. Sem religar, um agente pode ler o `SKILL.md` direto do cache (caminho no registry).
**Use when:** posicionamento, copy de landing, CRO, onboarding, retenção, SEO/ASO, lançamento.
**Do not use when:** UI do app sem objetivo de conversão; qualquer sugestão de tracking/pixel/analytics externo sem spec (`20` §14, §22); qualquer prova social, métrica ou preço que não exista (`docs/PRODUCT.md` → Evidence on Hand).
**Related skills:** Humanizer (acabamento), Taste (LP), `marketing:*` (plugins de usuário).
**Possible overlap:** plugins de usuário `marketing:seo-audit`, `marketing:content-creation`, `small-business:seo-ai-visibility` etc. Dentro do projeto, preferir este pacote.
**Canônicas para escrita de marketing (`38`, 28/09/2026):** `copywriting` (2.0.2) e `copy-editing` (2.0.0) deste pacote são as versões usadas. As cópias do `boraoztunc/skills` (1.0.0, forks antigos das mesmas skills) foram avaliadas e **não instaladas** (ver "Avaliadas e não instaladas" abaixo).
**Usar sem ligar as 50 skills:** para uma revisão isolada, ler o `SKILL.md` direto do cache — `~/.claude/plugins/cache/marketingskills/marketing-skills/2.11.1/skills/copy-editing/SKILL.md` (ou `copywriting`); caminho no registry → `cachePath`. Ligar o pacote inteiro só para trabalho de marketing com várias skills.
**Priority:** Primary (sob demanda).

## L. Humanizer

**Source:** https://github.com/blader/humanizer
**Installation method:** plugin — `claude plugin marketplace add blader/humanizer --scope project` + `claude plugin install humanizer@humanizer --scope project` (README).
**Installed location:** `.claude/settings.json` → `humanizer@humanizer`; cache `~/.claude/plugins/cache/humanizer/humanizer/3.0.0/`
**Version / commit:** 3.0.0 — `9862685f575c65a8247f90369951df1b3416e3d6`
**Purpose:** reescrever texto com padrões de escrita artificial sem mudar o que ele diz.
**Use when:** último passo de copy de marketing, onboarding, notificação, e-mail, doc para humanos.
**Do not use when:** código, comentário técnico, spec, JSON/schema, conteúdo pedagógico (enunciado, gabarito, explicação), prompt do tutor.
**Conflito resolvido com a spec:** o `20` §7.1 afirma que **não existe lista de palavras que prove autoria por IA** e proíbe tratar travessão como detector; o Humanizer manda remover todo travessão "a menos que a amostra do autor use". No Foca: (1) a **amostra do autor** é a copy aprovada no `21` §2 (que usa travessão); (2) nenhuma string marcada "revisado" no `21` muda sem atualizar o inventário; (3) é checklist editorial, não detector; (4) as regras de voz do `20` §7.1 prevalecem. O Humanizer foi escrito para inglês; em pt-BR aplicar só os padrões estruturais (§1–§5 da skill), não as listas de palavras.
**Related skills:** Marketing `copywriting`/`copy-editing`, `design:ux-copy` (usuário).
**Papel desde o `38` (28/09/2026):** único revisor anti-escrita-artificial do projeto, **só em texto de 2+ frases** (marketing, corpo de onboarding, estado vazio longo, doc para humanos). Nunca em rótulo/botão, `voz.ts`, prompt do tutor, conteúdo pedagógico, spec ou código. Microcopy e erro vão para `better-writing` (§Q).
**Comparação com Stop Slop (`boraoztunc/skills`, avaliada e não instalada em 28/09/2026):** as duas removem padrões de texto de IA, mas o método difere. O Humanizer tem 25 padrões ordenados por força (os "fracos sozinhos" só contam em conjunto), deixa a amostra do autor mandar (inclusive no travessão), manda conferir fato/número/citação adicionados ou perdidos e tem seção "quando não agir". O Stop Slop usa regras absolutas — cortar **todo** advérbio, **toda** voz passiva, **todo** travessão, listas de três, frase iniciada por pronome interrogativo — e uma nota de 1 a 10 em cinco dimensões, sem amostra do autor e sem checagem de fato. Em pt-BR e em microcopy isso remove texto correto ("Resposta registrada." é passiva; "Só falta uma." tem advérbio) e contradiz o `20` §7.1. Decisão: um revisor só, o Humanizer. Dois padrões que o Stop Slop nomeia bem — "agência falsa" (objeto fazendo ação de pessoa: "a decisão emerge") e "narrador de longe" — entram no checklist pt-BR de `docs/copy/02-voz-e-tom.md`, sem depender da skill.
**Possible overlap:** `humanize-writing` do SecondSky — **não instalado**.
**Priority:** Review.

## M. Repo Security Review (Consensys)

**Source:** https://github.com/Consensys/repo-security-review
**Installation method:** o README manda `git clone` em `~/.claude/skills/` (global). Aqui, cópia **verbatim** do upstream auditado para o projeto (`SKILL.md`, `README.md`, `references/`, `scripts/`) — mesma estrutura de skill, local ao projeto. Atualizar = copiar de novo a partir de um SHA novo e registrar. **`scripts/setup.sh` não foi executado** (ver §Segurança).
**Installed location:** `.claude/skills/repo-security-review/`
**Version / commit:** `5172196eae085659ecc680ebc03ed4b435e5313e` (maturity: experimental)
**Purpose:** revisão de segurança em 7 fases (segredos, arquitetura/ameaças, CVEs de dependência, OWASP, validação, relatório) ou modo `--pr` só sobre o diff.
**Use when:** nível L2 (modo `--pr`) e L3 (completo) — ver [SDD-WORKFLOW.md](SDD-WORKFLOW.md) §6.
**Do not use when:** a cada mudança pequena (é caro: várias fases com subagentes).
**Saída:** `.security-review/` na raiz (gitignorado).
**EXTERNAL TOOLING necessário (nenhum instalado nesta máquina):** `gitleaks`, `osv-scanner`, `semgrep`, `jq` (recomendados); `docker` presente (só para `--runtime`). Sem eles, as fases correspondentes degradam, mas o pipeline não aborta. Instalação manual no Windows sugerida: `winget install Gitleaks.Gitleaks`, `winget install Google.OSVScanner`, `winget install jqlang.jq`, `py -3 -m pip install --user semgrep` (conferir os IDs em `winget search` antes).
**Related skills:** Addy `security-and-hardening` + agent `security-auditor`; `/security-review` nativo; `engineering:code-review` (usuário).
**Possible overlap:** `/security-review` nativo (revisão rápida do diff) — usar para L1/L2 rápido; este para L2 profundo e L3.
**Priority:** Review.

## N. claude-mem

**Source:** https://github.com/thedotmack/claude-mem
**Installation method:** plugin — já estava instalado no **escopo de usuário** antes desta tarefa (`/plugin marketplace add thedotmack/claude-mem` + `/plugin install claude-mem`). Não foi reinstalado nem movido para o projeto: ele roda um worker local e hooks globais, e uma segunda instalação em escopo de projeto duplicaria os hooks.
**Installed location:** `~/.claude/settings.json` → `claude-mem@thedotmack`; cache `~/.claude/plugins/cache/thedotmack/claude-mem/13.25.3/`; dados em `~/.claude-mem/`
**Version / commit:** 13.25.3 — `4520de9e0f8d6cdc20597520e383d8b51d93137f` (= HEAD do upstream em 22/09/2026)
**Componentes:** 20 skills, 7 hooks (Setup, SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop…), 1 servidor MCP de busca, worker em `localhost:37777`.
**Purpose:** continuidade entre sessões — observações e resumos de sessões anteriores, buscáveis.
**Use when:** "já resolvemos isso?", retomar trabalho, achar decisão antiga (`mem-search`, `smart_search`).
**Do not use when:** para substituir leitura da spec/código atuais. **Código e spec atuais > memória.**
**Custo:** por padrão injeta até 50 observações + 10 sessões no início de cada sessão (`CLAUDE_MEM_CONTEXT_OBSERVATIONS=50`, `CLAUDE_MEM_CONTEXT_SESSION_COUNT=10`). Recomendação (não aplicada, porque `~/.claude-mem/settings.json` é global e afeta outros projetos): reduzir para 15–20 observações e 3–5 sessões se o contexto inicial pesar.
**Related skills:** auto-memory nativa do Claude Code (`~/.claude/projects/.../memory/`).
**Possible overlap:** a memória nativa do Claude Code também persiste fatos entre sessões. Regra: fatos de projeto duráveis vão para `docs/`, não para memória.
**Priority:** Reference.

## O. SecondSky Claude Skills

**Source:** https://github.com/secondsky/claude-skills
**Installation method:** plugins individuais — `claude plugin marketplace add secondsky/claude-skills --scope project` + `claude plugin install <nome>@claude-skills --scope project` (README: "install individual skills").
**Installed location:** `.claude/settings.json`; cache `~/.claude/plugins/cache/claude-skills/<nome>/3.9.0/`
**Version / commit:** 3.9.0 — `a0994f733b66aa62c47c9abc6f486652c6a16571`
**Escolhidas (3 de 145) e por quê:**
- `tanstack-start` — o framework do Foca (server functions, SSR). **Atenção:** a skill é escrita para TanStack Start "RC" com viés de deploy em Cloudflare Workers; o Foca usa a versão estável (`@tanstack/react-start` 1.168) com Nitro e deploy no Netlify. Confirmar qualquer API na doc oficial antes de aplicar.
- `tanstack-router` — roteamento file-based (`src/routes/`); lembrar que `routeTree.gen.ts` nunca se edita.
- `tailwind-v4-shadcn` — exatamente o stack de estilo (Tailwind v4, `@theme inline`, shadcn/ui, dark mode por variável CSS — o bug documentado no `CLAUDE.md`).
**Avaliadas e recusadas:** `bun` (28 skills, maioria irrelevante — Nuxt, SvelteKit, Redis — e hooks que interceptam comandos bash); `playwright` (instala npm + Chromium sozinho no primeiro uso e sobrepõe a suíte E2E existente); `tanstack-query` (só o provider é usado); `zod` e `react-hook-form-zod` (só no scaffold shadcn, não usados em `src/`); `frontend-design`, `react-best-practices`, `humanize-writing`, `motion`, `code-review`, `systematic-debugging` (duplicariam ferramentas já instaladas); Cloudflare/Nuxt/Vue/WordPress (fora do stack).
**Use when:** dúvida de API/erro específico de TanStack Start/Router ou Tailwind v4 + shadcn.
**Do not use when:** para escolher arquitetura nova (é spec).
**Priority:** Reference.

## P. OmniRoute MCP

**O que é (não é uma skill):** [OmniRoute](https://github.com/diegosouzapw/OmniRoute) é um gateway de IA standalone — servidor Node/Bun com CLI, Docker e app desktop próprios, que unifica ~357 provedores de LLM (roteamento, fallback, cache, compressão RTK/Caveman) atrás de um endpoint compatível com OpenAI. Não tem `SKILL.md`, não segue a estrutura de skill do Claude Code; o que ele expõe e que interessa aqui é um **servidor MCP com ~110 ferramentas** (`omniroute_*`: saúde/quota, `route_request`, `web_search`, `web_fetch`, memória, cache, compressão, pool de proxies…).
**Source:** https://github.com/diegosouzapw/OmniRoute (pacote npm `omniroute`, `bin/omniroute.mjs`).
**Installation method:** registrado como **servidor MCP de escopo de projeto** via `.mcp.json` na raiz, transporte `stdio`, executado sob demanda via `npx -y omniroute --mcp` (sem instalação global, sem clonar o repositório para dentro do Foca — o repo upstream é um monorepo grande e não pertence ao código do app).
**Installed location:** [`.mcp.json`](../../.mcp.json) na raiz do projeto.
**Version / commit:** não fixado (`npx -y omniroute` sempre baixa a versão mais recente do npm na hora de invocar; auditado a partir do commit `HEAD` do upstream em 23/09/2026, `v3.8.51`).
**Purpose:** ferramenta MCP **externa ao agente**, não integrada ao runtime do app Foca. Serve só para o próprio Claude Code ter acesso a essas ~110 ferramentas (roteamento entre provedores de IA, busca web, etc.) quando uma tarefa pedir explicitamente.
**Use when:** o usuário pede algo que precise de uma das ferramentas `omniroute_*` diretamente (ex.: buscar na web via `omniroute_web_search`, testar roteamento entre provedores) — nunca por padrão.
**Do not use when:** **não é a integração de IA do produto.** A IA do Foca é OpenAI via `fetch` direto em `src/lib/tutor.ts`/`tutor-core.ts` (ver `CLAUDE.md` → Stack real) — decisão intencional (runtime de worker, sem SDK/dependência Node pesada). Trocar essa integração pelo OmniRoute (ou por qualquer gateway) é mudança de arquitetura e exige spec aprovada em `docs/NN-plano-*.md`, não uma instalação de ferramenta. Também não usar para gerar credenciais, rodar o gateway completo (Docker/dashboard) ou qualquer coisa que exija chaves de provedor — nada disso está configurado.
**Primeira execução:** `npx -y omniroute --mcp` baixa o pacote do registro npm público na primeira chamada (precisa de rede); chamadas seguintes usam o cache do npx.
**Related skills:** nenhuma — é uma ferramenta externa, não compete com skills de engenharia/design.
**Priority:** Reference (sob demanda explícita).

## Q. Better Writing (`boraoztunc/skills`)

**Source:** https://github.com/boraoztunc/skills/tree/main/better-writing. Upstream original: https://github.com/jakubkrehel/skills (`skills/better-writing`, MIT, Jakub Krehel). A cópia do `boraoztunc` foi vendorizada antes de uma reescrita do upstream e **difere do HEAD atual dele** (`267330e`): é mais completa na estrutura e traz o `review-output.md`. Ficou a do `boraoztunc`, no commit fixado.
**Installation method:** skill local — `DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx skills@1.7.0 add https://github.com/boraoztunc/skills --skill better-writing --skill ogilvy-copywriting -a claude-code --copy -y` (instala as duas, Q e R, de uma vez).
**Installed location:** `.claude/skills/better-writing/` (`SKILL.md`, `review-output.md`); hash em `skills-lock.json`.
**Version / commit:** `645553ca7622570479e330cc089c65fcf34e0ba8` (15/08/2026, sem tag). Pré-instalação (28/09/2026): clone fora do repo, 3 arquivos entre as duas skills, nenhum script, hook, `package.json` ou chamada de rede; `diff -r` clone × instalado sem diferença.
**License:** MIT (`LICENSE-jakubkrehel` no repo `boraoztunc`; a pasta da skill não traz arquivo de licença e não foi criado nenhum).
**Local modifications:** nenhuma. Adaptações ao Foca ficam **aqui**, nunca nos arquivos da skill (facilita `update`).
**Purpose:** escrever e revisar texto de interface — rótulo de botão e link, erro, confirmação, estado vazio, placeholder, onboarding de uso, notificação, capitalização.
**Use when (REQUIRED):** mensagem de erro, confirmação (principalmente destrutiva ou de saída), estado vazio, tela ou fluxo novo, qualquer mudança em 2+ strings de interface. **RECOMMENDED:** auditoria de copy (`docs/copy/auditoria-*.md`, uma chamada por área). **OPTIONAL:** ajuste de 1 rótulo (o padrão do guia costuma bastar).
**Do not use when:** conteúdo pedagógico (enunciado, alternativa, gabarito, explicação); prompt do tutor; falas da mascote em `voz.ts` (a regra "sem humor" da skill vale para mensagem de sistema, não para a Foca); copy de marketing de persuasão; mudança de um único rótulo.
**Inputs esperados:** `docs/COPY.md` (Quick Context), `docs/copy/03-ux-writing.md` §2–§3, a(s) string(s) com `arquivo:linha` ou chave `COPY.x.y`, o estado/gatilho, o limite de palavras (`20` §7.1).
**Outputs esperados:** tabela de achados no formato de `review-output.md` (Severity · Location · Before · After · Why) + verificação + veredito (Block / Needs changes / Approve). Na escrita, a(s) string(s) proposta(s) já no glossário do Foca.
**Dependencies:** nenhuma skill antes. A skill cita `better-typography`, `better-accessibility` e `better-layout`, **que não estão instaladas** — ignorar essas remissões (a11y e semântica ficam com `web-design-guidelines`).
**Adaptação ao Foca:** exemplos em inglês valem como princípio, aplicar em pt-BR; "tap/click" → "toque"/"clique"; "sentence case" = maiúscula só na primeira palavra; a voz de marca do Foca (`20` §7.1) é a "established voice" que a skill manda preservar; a ordem de prioridade do Foca (clareza, ação, contexto, brevidade, personalidade) vale sobre qualquer outra.
**Related skills:** `humanizer` (só depois, se houver 2+ frases), `web-design-guidelines` (a11y), `marketing-skills:copy-editing` (só marketing).
**Possible overlap:** Humanizer (polimento de prosa), Impeccable (modo UX copy), `design:ux-copy` (usuário, não reproduzível). Regra: `better-writing` para interface, Humanizer para prosa, Impeccable e `design:ux-copy` não entram na rota de copy.
**Exemplos no Foca:** (1) erro de pacote "Não deu pra carregar agora." + "Tentar de novo" (`36` RU-3) — checar que o corpo diz o que fazer; (2) modal "Sair da lição?" — botões repetem a consequência ("Sair mesmo assim" / "Continuar estudando", já cumpre); (3) `COPY.trilha.tudoConcluido` — estado vazio com próximo passo ("Praticar"), já cumpre; (4) padronizar "Tente/Tenta/Tentar de novo" como vocabulário de fluxo.
**Priority:** Primary (escrita de interface).

## R. Ogilvy Copywriting (`boraoztunc/skills`)

**Source:** https://github.com/boraoztunc/skills/tree/main/ogilvy (pasta `ogilvy/`; o `name` no frontmatter é `ogilvy-copywriting`, e a pasta instalada segue o `name`). Compilação do mantenedor a partir de livros de David Ogilvy; sem upstream anterior; `license: MIT` no frontmatter.
**Installation method:** o mesmo comando da seção Q (uma instalação, duas skills).
**Installed location:** `.claude/skills/ogilvy-copywriting/SKILL.md` (arquivo único); hash em `skills-lock.json`.
**Version / commit:** `645553ca7622570479e330cc089c65fcf34e0ba8`. Mesma auditoria pré-instalação da seção Q.
**License:** MIT (declarada no frontmatter).
**Local modifications:** nenhuma.
**Purpose:** estratégia de mensagem — posicionamento (o que faz e para quem), promessa única, big idea, regras de título, fatos acima de adjetivos, dez perguntas diagnósticas.
**Use when (RECOMMENDED):** posicionamento, proposta de valor, hero/título de landing, descrição de OG/loja de apps. **OPTIONAL:** campanha, post.
**Do not use when (DO NOT USE):** qualquer tela do app, feedback, texto do tutor, conteúdo pedagógico, microcopy. Não gera a página inteira (isso é do `copywriting`).
**Inputs esperados:** `docs/copy/01-estrategia.md` (persona, problema→mecanismo→resultado, posicionamento), `docs/copy/06-marketing.md`, `docs/PRODUCT.md` → Evidence on Hand.
**Outputs esperados:** respostas às dez perguntas diagnósticas, uma promessa, 3–5 opções de título com a promessa. Não a página.
**Dependencies:** ler persona e Evidence on Hand antes. Depois dela: `marketing-skills:copywriting` (rascunho) → `copy-editing` (revisão).
**Regras de conflito com o Foca (valem sobre a skill):** "testimonials work" e "long copy sells" **não** autorizam depoimento inventado nem texto longo na UI (`PRODUCT.md` → Evidence on Hand); "brand name in the headline" é opcional; as regras de TV, foto e "avoid animation for adults" não se aplicam ao app; nenhuma big idea vira promessa que o produto não cumpre (`docs/copy/01` §4).
**Related skills:** `marketing-skills:copywriting`, `copy-editing`, `product-marketing` (contexto, não estratégia), Humanizer (depois do rascunho).
**Possible overlap:** `copywriting` do Corey — sobreposição parcial, mas Ogilvy atua **antes** (decide posicionamento e promessa) e o `copywriting` escreve depois.
**Exemplos no Foca:** (1) gerar as três opções de frase de posicionamento (decisão D-1 do `38`); (2) título de uma futura landing com a promessa "próximo passo claro" e um fato verificável; (3) revisar `BRAND.description` depois que o `36` T-08.7 terminar.
**Priority:** Specialist (só marketing/posicionamento).

## Avaliadas e não instaladas — `boraoztunc/skills` (28/09/2026, commit `645553c`)

Registradas para que nenhum agente reavalie a mesma decisão sem contexto. Repositório com 72 pastas de skill; leitura integral das cinco candidatas prioritárias e triagem das demais.

| Skill | Motivo |
|---|---|
| `copywriting`, `copy-editing` | Forks 1.0.0 do `coreyhaines31/marketingskills`; o Foca já tem a 2.0.2 e a 2.0.0 do upstream original (K) |
| `stop-slop` | Mesma função do Humanizer, com regras absolutas que em pt-BR e microcopy removem texto correto e contradizem o `20` §7.1 (comparação em L) |
| `page-cro`, `content-strategy`, `seo-audit`, `programmatic-seo`, `schema-markup`, `competitor-alternatives`, `analytics-tracking` | Forks antigos de skills do pacote Marketing já instalado; `analytics-tracking` também conflita com `20` §14/§22 |
| `landing-page`, `pricing-page` | Sobrepõem `cro`/`design-taste-frontend`; não há preço definido (`08` §11) |
| `product-proof-saas` | Reavaliar se uma landing com demo da IA for especificada |
| `better-accessibility`, `better-colors`, `better-layout`, `better-typography`, `better-ui`, `better-interface`, `interface-review` | Fora do escopo de copy; candidatas a um plano de design; sobrepõem `web-design-guidelines` e Impeccable |
| `frontend-design`, `impeccable`, `web-design-guidelines`, `vercel-react-best-practices` | Já instaladas a partir do upstream original |
| Presets visuais e efeitos: `visual-style-presets`, `glass-dark-ui`, `skeuomorphic-ui`, `mesh-gradient-dark-blue-clean`, `liquid-metal-border`, `beam-glow-states`, `webgl-laser`, `thinking-orbs`, `shaders-cursor-ripples` (dependência paga), `progressive-blur`, `reveal-hover-effect`, `staggered-word-reveal`, `container-lines`, `framed-grid-layout`, `corner-diagonals`, `css-border-gradient`, `beautiful-shadows`, `apple-design`, `emil-design-eng`, `documentary-brutalist-agency`, `editorial-portfolio-chapters`, `minimal-zine-poster` | Brigam com a identidade Rabisco fixa (mesmo motivo da recusa de 11 skills do Taste) |
| HyperFrames e adaptadores: `hyperframes`, `hyperframes-cli`, `hyperframes-media`, `hyperframes-registry`, `remotion-to-hyperframes`, `website-to-hyperframes`, `contribute-catalog`, `gsap`, `animejs`, `waapi`, `css-animations`, `lottie`, `three`, `typegpu`, `tailwind` | Sem uso no app; HyperFrames já existe no escopo de usuário desta máquina |
| `tailwind-v4`, `app-store-screenshots`, `service-booking-flow`, `operational-enterprise-ai`, `conductor-rewrite-performance`, `linear-local-first-architecture`, `adversarial-review` | Fora do produto ou duplicam ferramentas de engenharia já instaladas (SecondSky cobre Tailwind v4) |

---

## Problemas conhecidos e configuração manual

| Item | Problema | Situação |
|---|---|---|
| Addy Agent Skills | O marketplace aponta o plugin para `github` e o Claude Code clona via SSH; nesta máquina não há chave de host do GitHub → "Host key verification failed". | Instalado com reescrita SSH→HTTPS só no ambiente do comando. **Cada nova máquina/colega vai bater no mesmo erro** ao aceitar o plugin: usar o contorno do README (`git config --global url."https://github.com/".insteadOf git@github.com:`) ou configurar SSH. |
| Repo Security Review | `setup.sh` instala globalmente via `curl \| tar` em `/usr/local/bin`, `pip --break-system-packages` e `sudo apt`; no Windows/Git Bash baixaria artefatos com o nome de SO errado. README usa `<your-org>` como placeholder na URL de clone. | Não executado. Ferramentas externas ausentes — instalação manual (ver M). |
| UI UX Pro Max | Precisa de Python; `python` não está no PATH. | `py -3` funciona (fallback previsto pela skill). |
| Superpowers | `claude plugin details` informa "no model context cost" para o hook de SessionStart, mas o hook injeta ~1,1k tokens. | Documentado; considerado no custo. |
| Impeccable | Primeiro uso baixa um binário (rede). Hooks rodam em toda edição de UI e no Stop (até 30s). | Aceito (download verificado por SHA-256). Desligar hooks: `IMPECCABLE_HOOK_DISABLED=1`. |
| Marketing / GSAP | Desativados por padrão. | Ligar sob demanda (ver K, I). |
| `claude plugin validate` | Todos passaram. Três avisos cosméticos no upstream, ignorados pelo Claude Code: UI UX Pro Max (campo `id` desconhecido), GSAP (`author` ausente no marketplace), Marketing (`metadata.repository` desconhecido). | Nenhuma ação. |
| Plugins de projeto em geral | `extraKnownMarketplaces`/`enabledPlugins` só valem depois que a pessoa **confia na pasta**; não carregam em sessão na nuvem (docs do Claude Code). | Esperado. |
| Nomes de skill | Nesta máquina já há dezenas de skills de usuário (plugins sincronizados do claude.ai), e a listagem de skills do Claude Code passou a omitir descrições de parte delas. Mais skills = roteamento automático pior. | Motivo principal do roteamento explícito em [SKILL-ROUTING.md](SKILL-ROUTING.md) e dos pacotes desativados. |

## Segurança das próprias skills (auditoria de 22/09/2026)

Antes de instalar, cada upstream foi clonado e lido: manifests (`plugin.json`, `marketplace.json`), `hooks.json`, `package.json` (scripts de install), `.mcp.json`, shell scripts e downloads.

- **Sem install hooks de npm** em nenhum plugin instalado.
- **Hooks ativos:** Superpowers (SessionStart, leitura local) e Impeccable (PostToolUse/Stop, binário próprio). claude-mem (preexistente) tem 7.
- **Downloads de executável:** só o engine do Impeccable (release do GitHub do próprio autor, SHA-256).
- **Rede em tempo de uso:** Web Design Guidelines (busca regras no GitHub da Vercel), Impeccable (checagem de update), claude-mem (worker local).
- **Telemetria:** o CLI `skills` (usado para instalar as skills locais) envia um evento de instalação — foi rodado com `DISABLE_TELEMETRY=1 DO_NOT_TRACK=1`. Repita isso ao atualizar.
- **Acesso a segredos:** nenhum plugin lê `.env`. O Impeccable detecta `OPENAI_API_KEY` no ambiente só para anunciar geração de imagem.

## Como atualizar

| Tipo | Comando | Depois |
|---|---|---|
| Plugin | `claude plugin marketplace update <marketplace>` e `claude plugin update <plugin>@<marketplace>` | Reauditar diff de hooks/scripts; atualizar versão/commit aqui e no registry |
| Skill local (Vercel, LottieFiles, Taste) | `DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx skills@latest update -p` | Conferir diff em `.claude/skills/` e `skills-lock.json` |
| Skills locais do `boraoztunc` (Q, R) | Clonar o repo **fora** do projeto, `git diff 645553c..HEAD -- better-writing ogilvy` e ler; reinstalar com o comando da seção Q (ou `skills update -p`); `diff -r` clone × `.claude/skills/` | Atualizar commit aqui e no registry; nunca editar os `SKILL.md` — adaptações ficam nas seções Q/R |
| Repo Security Review | Clonar upstream, ler o diff, copiar `SKILL.md README.md references scripts` por cima | Atualizar commit aqui e no registry |
| Verificação | `node scripts/validate-skills.mjs` | Deve terminar sem `FAIL` |
