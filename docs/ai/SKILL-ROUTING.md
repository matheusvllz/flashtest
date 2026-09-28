# Roteamento de skills — qual ferramenta usar, e quantas

> Para quem é: o agente decidindo o que carregar antes de agir. Catálogo completo em [SKILLS.md](SKILLS.md); fluxo SDD em [SDD-WORKFLOW.md](SDD-WORKFLOW.md). Versão legível por máquina: [`.claude/skills-registry.json`](../../.claude/skills-registry.json) (`routes`).

## 1. Regra de ouro: progressive disclosure

```text
PEDIDO → CLASSIFICAR (§2) → LER A SPEC RELEVANTE → CARREGAR 1–3 SKILLS PRIMÁRIAS → EXECUTAR → 1 REVISÃO DA CLASSE → VERIFICAR CONTRA A SPEC
```

- **Primárias:** no máximo 3 por tarefa, só da classe dela.
- **Revisão:** só no fim, sobre o diff, só a da classe.
- **Referência** (UI UX Pro Max, SecondSky, claude-mem): consulta pontual, não "carregar e seguir".
- **OmniRoute MCP** (`.mcp.json`, catálogo completo em [SKILLS.md](SKILLS.md) §P) não é skill nem faz parte do roteamento acima — é ferramenta MCP externa, só invocada se o usuário pedir uma `omniroute_*` explicitamente. **Nunca** usar como substituto da integração de IA do Foca (`src/lib/tutor.ts`, OpenAI via `fetch` direto) sem spec aprovada.
- Nunca carregar juntas, sem motivo explícito, as cinco de design: `frontend-design`, `impeccable`, `design-taste-frontend`, `ui-ux-pro-max`, `web-design-guidelines`.
- Duas skills de processo concorrentes (Superpowers × Addy) nunca na mesma etapa: escolha uma (§4).
- Skill carregada que não se aplica: diga por quê e não a siga.
- **Nomes:** skills de plugin aparecem com namespace `plugin:skill` — `impeccable:impeccable`, `frontend-design:frontend-design`, `humanizer:humanizer`, `tanstack-start:tanstack-start`, `ui-ux-pro-max:ui-ux-pro-max`, `agent-skills:<skill>`, `superpowers:<skill>`. As tabelas abaixo abreviam quando não há ambiguidade. Skills locais (`motion-design`, `web-design-guidelines`, `vercel-react-best-practices`, `design-taste-frontend`, `redesign-existing-projects`, `repo-security-review`, `foca-sdd`) não têm prefixo. Os comandos do Addy aparecem como skills (`agent-skills:review`, `agent-skills:spec`…).

## 2. Classificação da tarefa

| Classe | Sinais no pedido | Primárias | Revisão no fim | Nunca |
|---|---|---|---|---|
| **spec** — requisito novo/ambíguo | "quero que…", "nova feature", "e se…", não existe spec | `superpowers:brainstorming` ou `agent-skills:interview-me` → escrever em `docs/NN-plano-*.md` ([SPEC-TEMPLATE.md](SPEC-TEMPLATE.md)) | usuário aprova | codar antes da spec aprovada |
| **execução de spec** | "implemente a spec/próxima spec", "T-07" | `superpowers:executing-plans` (ou `subagent-driven-development` se as tarefas forem independentes) + as skills indicadas em cada `T-xx` | `superpowers:verification-before-completion` + agent `spec-verifier` | pular tarefa, reordenar sem registrar |
| **UI nova** | "crie uma tela", "novo componente", "redesign" (com spec) | `frontend-design` · `vercel-react-best-practices` durante a implementação · `ui-ux-pro-max` só se precisar pesquisar padrão | `web-design-guidelines` | taste, marketing |
| **refino de UI** | "parece genérica", "polir", "hierarquia", "espaçamento" | `impeccable` (`critique` → `polish`/`layout`/`typeset`) | `web-design-guidelines` | frontend-design junto |
| **auditoria de UI / a11y** | "revise a UI", "acessibilidade", "checar contraste" | `web-design-guidelines` (+ `impeccable audit` se pedirem profundidade) | — | editar durante a auditoria sem pedido |
| **motion** | "animação", "transição", "microinteração", "celebração" | `motion-design` (intenção) → implementação em CSS (`styles.css`, `anim-*`) · `gsap-*` **só** com spec aprovando GSAP | `web-design-guidelines` (reduced motion) | escolher GSAP antes da intenção |
| **engenharia / refactor** | "refatore", "simplifique", "extraia", "organize" | `agent-skills:code-simplification` ou `incremental-implementation` + `test-driven-development` (uma das duas versões) | `agent-skills:code-review-and-quality` | design, marketing |
| **bug** | erro, stack trace, "quebrou", comportamento diferente do esperado | `superpowers:systematic-debugging` → teste que reproduz → correção | `code-review-and-quality` | corrigir sem reproduzir |
| **performance** | "lento", "bundle", "re-render", "trava" | `vercel-react-best-practices` + `agent-skills:performance-optimization` | agent `web-performance-auditor` | regras de Next.js |
| **framework** | erro de TanStack Start/Router, Tailwind v4, shadcn, dark mode | `tanstack-start` / `tanstack-router` / `tailwind-v4-shadcn` (referência) | — | seguir viés Cloudflare do `tanstack-start` sem conferir |
| **segurança** | IA/prompt, dados do aluno, upload, deps, deploy, "release" | ver níveis L1/L2/L3 em [SDD-WORKFLOW.md](SDD-WORKFLOW.md) §6 | `repo-security-review --pr` (L2) / completo (L3) | auditoria completa a cada mudança pequena |
| **copy do app** | texto que o aluno lê dentro do app | `docs/20` §7.1 + `src/lib/copy.ts` + inventário `21` (não é skill) | `humanizer` (amostra = copy aprovada do `21`) | substituição global, mexer em conteúdo pedagógico |
| **marketing / growth** | landing, CRO, onboarding de conversão, SEO, ASO, lançamento, retenção | **ligar o pacote** (§6) → `product-marketing` (contexto já existe) → a skill do objetivo (`cro`, `copywriting`, `onboarding`, `seo-audit`, `aso`, `launch`, `churn-prevention`…) · `design-taste-frontend` se houver página | `humanizer` → revisão de marca (`docs/20` §7.1) | tracking/analytics externo sem spec; prova social inventada |
| **docs** | registro de execução, README, ADR | `agent-skills:documentation-and-adrs` (formato) — o **conteúdo** segue o SDD | `humanizer` só em doc para humanos, nunca em spec | — |
| **memória** | "já fizemos isso?", "como resolvemos X?" | `claude-mem:mem-search` | confirmar no código/spec atual | tratar lembrança como fato |

## 3. Matriz de responsabilidade

| Ferramenta | Papel no Foca | Cria? | Revisa? | Decide produto? |
|---|---|---|---|---|
| SDD / spec (`docs/`) | Fonte da verdade | — | — | **Sim** |
| Superpowers | Processo: descoberta, plano, execução, debug, verificação | processo | verificação | Não |
| Addy Agent Skills | Engenharia por domínio | código | code review, segurança, perf | Não |
| Frontend Design | Criação/direção de UI **dentro** do Rabisco na Margem | UI | — | Não |
| UI UX Pro Max | Base de conhecimento de UX consultável | — | — | Não |
| Taste | Anti-template em **superfícies de marketing** | LP | LP | Não |
| Impeccable | Crítica, polimento, acabamento de UI existente | ajustes | **Sim** | Não |
| Web Design Guidelines | Auditoria (a11y, semântica, foco, formulários) | — | **Sim** | Não |
| React Best Practices | Performance e padrões React | código | **Sim** | Não |
| Motion Design | Direção de movimento (por quê, o quê, quando, quanto) | intenção | — | Não |
| GSAP Skills | Implementação GSAP, só com spec | código | — | Não |
| Marketing Skills | Growth, copy, CRO, SEO/ASO | copy/estratégia | — | Não |
| Humanizer | Acabamento textual | — | **Sim** | Não |
| Repo Security Review | Segurança L2/L3 | — | **Sim** | Não |
| claude-mem | Memória entre sessões | — | — | Não |
| SecondSky | Referência de TanStack e Tailwind v4 | — | — | Não |

## 4. Overlaps e como desempatar

| Sobreposição | Regra |
|---|---|
| **TDD:** `superpowers:test-driven-development` × `agent-skills:test-driven-development` | Superpowers quando a tarefa veio de um plano executado por Superpowers; Addy quando a tarefa é de engenharia avulsa. Nunca as duas. |
| **Plano:** `superpowers:writing-plans` × `agent-skills:planning-and-task-breakdown` × Addy `/plan` | Qualquer um serve para **pensar** o plano; o **arquivo** é sempre a seção de tarefas da spec. |
| **Spec:** `superpowers:brainstorming` × `agent-skills:spec-driven-development` × Addy `/spec` × `product-management:write-spec` (usuário) | Descoberta: brainstorming ou interview-me. Arquivo: `docs/NN-plano-*.md` no formato do [SPEC-TEMPLATE.md](SPEC-TEMPLATE.md). |
| **Debug:** `superpowers:systematic-debugging` × `agent-skills:debugging-and-error-recovery` × `engineering:debug` (usuário) | Superpowers por padrão. |
| **Code review:** `agent-skills:code-review-and-quality` × `superpowers:requesting-code-review` × `/code-review` nativo × `engineering:code-review` (usuário) | `/code-review` nativo para revisão de diff pedida pelo usuário; `code-review-and-quality` como etapa 7 do SDD. |
| **Criar UI:** `frontend-design` × `impeccable` × `design-taste-frontend` | App → `frontend-design`. Marketing/LP → `design-taste-frontend`. Existente → `impeccable`. |
| **Auditar UI:** `web-design-guidelines` × `impeccable audit` × `design:accessibility-review` (usuário) × UI UX Pro Max | `web-design-guidelines` primeiro (barato, `arquivo:linha`); Impeccable para crítica de design. |
| **Motion:** `motion-design` × `impeccable animate` × UI UX Pro Max (Animation/GSAP presets) | `motion-design` decide; implementação em CSS existente. |
| **Design system:** `ui-ux-pro-max:design-system` × `design:design-system` (usuário) × `impeccable document` | Nenhum cria sistema novo: o sistema é `docs/DESIGN.md` + `styles.css`. |
| **Copy:** Humanizer × Marketing `copy-editing` × `design:ux-copy` (usuário) | Voz do `20` §7.1 manda; Humanizer só no fim. |
| **Segurança:** `repo-security-review` × Addy `security-and-hardening`/`security-auditor` × `/security-review` nativo | L1: `/security-review` ou o review normal. L2: Addy + `repo-security-review --pr`. L3: completo. |
| **Memória:** claude-mem × memória nativa do Claude Code | Fatos duráveis → `docs/`. Memória é pista. |

## 5. Orçamento de tokens

Medido com `claude plugin details` em 22/09/2026 (descrições que entram em **toda** sessão):

| Pacote | Sempre-ativo | Estado |
|---|---|---|
| Marketing Skills (50) | ~13,6k | desativado |
| Addy Agent Skills (25 + 9 comandos) | ~3,6k | ativo |
| claude-mem (usuário) | ~2k + observações injetadas | ativo |
| Superpowers | ~0,8k + ~1,1k do hook | ativo |
| GSAP (8) | ~1,1k | desativado |
| UI UX Pro Max (7) | ~1,1k | ativo |
| Impeccable | ~0,5k | ativo |
| SecondSky (3) | ~0,4k | ativo |
| Humanizer, Frontend Design, locais (6) | ~0,8k | ativo |

- Custo **ao invocar** varia de ~1k (`requesting-code-review`) a ~12k (`subagent-driven-development`). Carregar uma skill é uma decisão, não um reflexo.
- Referências longas dentro das skills (ex.: `repo-security-review/references/*`, `vercel-react-best-practices/rules/*`, CSVs do UI UX Pro Max) são lidas **por arquivo, quando necessárias** — nunca a pasta inteira.
- Documentos do SDD são grandes (`18`, `20`, `25` passam de 100 KB): ler por seção (`grep -n "^## "` e depois o trecho), não inteiros, salvo quando a spec em execução pede leitura integral.

## 6. Ligar e desligar pacotes sob demanda

```bash
# ligar só para você (settings.local.json, não versionado) e recarregar
claude plugin enable marketing-skills@marketingskills --scope local
# dentro da sessão: /reload-plugins   (ou abrir uma sessão nova)

# ao terminar
claude plugin disable marketing-skills@marketingskills --scope local
```

Mesmo padrão para `gsap-skills@gsap-skills`. Se o CLI não estiver no PATH (extensão do VS Code), use `/plugin` dentro da sessão. Sem religar, o agente ainda pode ler um `SKILL.md` específico direto do cache — caminho em `.claude/skills-registry.json` → `cachePath`.

## 7. Casos de teste do roteamento

Validação conceitual: para cada pedido, a rota esperada segundo §2. Revisar esta tabela quando uma skill for adicionada ou removida.

| Pedido | Classe | Rota esperada | Não deve carregar |
|---|---|---|---|
| "Melhore a tela de login" | refino de UI (tela existe: `src/routes/login.tsx`) | spec? (se mudar comportamento) → `impeccable critique/polish` · `vercel-react-best-practices` se mexer em código → `web-design-guidelines` no review | marketing, taste, gsap |
| "Crie uma nova tela" | UI nova | spec → `frontend-design` → `vercel-react-best-practices` → `ui-ux-pro-max` só se pesquisar → `web-design-guidelines` | taste (é app, não LP) |
| "Essa tela parece genérica" | refino de UI | `impeccable` (`critique`) | frontend-design + taste juntos |
| "Faça uma animação de progresso mais satisfatória" | motion | `motion-design` → CSS em `styles.css` (`anim-bump`, `--ease-bounce`) → `web-design-guidelines` (reduced motion) | gsap (sem spec), marketing |
| "Quero scroll cinematográfico" | motion + dependência nova | `motion-design` → **spec aprovando GSAP** → ligar `gsap-skills` → `gsap-scrolltrigger`/`gsap-react` → `web-design-guidelines` | implementar antes da spec |
| "A landing está convertendo pouco" | marketing | ligar pacote → `product-marketing` (contexto) → `cro` → `analytics` (só medição autorizada) → `copywriting` → `design-taste-frontend` se refizer a página → `humanizer` no fim | analytics externo sem spec; prova social inventada |
| "Escreva copy da landing page" | marketing | ligar pacote → `copywriting` → `cro` → validação de voz (`20` §7.1) → `humanizer` | inventar números/depoimentos |
| "Melhore onboarding" | marketing + UI | spec → ligar pacote → `onboarding` → `frontend-design` → `humanizer` → `web-design-guidelines` | quebrar a regra "sem cobrança no retorno" (`15` §3.2) |
| "Refatore isso" | engenharia | `agent-skills:code-simplification` + `test-driven-development` → `code-review-and-quality` | **nenhuma** skill de design ou marketing |
| "Página está lenta" | performance | `vercel-react-best-practices` + `agent-skills:performance-optimization` → `web-performance-auditor` | regras de Next.js |
| "Vamos lançar essa feature" | verificação + segurança | `superpowers:verification-before-completion` contra a spec → testes (etapa 6) → L2/L3 conforme o que mudou → `agent-skills:shipping-and-launch` | push/merge sem pedido |
| "Implemente a próxima spec" | execução de spec | [SDD-WORKFLOW.md](SDD-WORKFLOW.md) §4 → `executing-plans` → skills por `T-xx` → `spec-verifier` | inventar escopo se não houver spec aprovada |
| "O tutor está respondendo errado" | bug + IA (L2) | `systematic-debugging` → `tutor-core.ts`/`tutor-prompt.ts` → teste → L2 | abrir o tutor automaticamente ao errar (proibido pelo `20`) |
