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
- **Nomes:** skills de plugin aparecem com namespace `plugin:skill` — `impeccable:impeccable`, `frontend-design:frontend-design`, `humanizer:humanizer`, `tanstack-start:tanstack-start`, `ui-ux-pro-max:ui-ux-pro-max`, `agent-skills:<skill>`, `superpowers:<skill>`. As tabelas abaixo abreviam quando não há ambiguidade. Skills locais (`motion-design`, `web-design-guidelines`, `vercel-react-best-practices`, `design-taste-frontend`, `redesign-existing-projects`, `repo-security-review`, `foca-sdd`, `foca-social`, `better-writing`, `ogilvy-copywriting`) não têm prefixo. Os comandos do Addy aparecem como skills (`agent-skills:review`, `agent-skills:spec`…).

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
| **microcopy** — rótulo, botão, aria-label, 1 frase | "muda esse botão", "texto do toast" | `docs/COPY.md` (Quick Context) + a linha do padrão em `docs/copy/03` §2. **Nenhuma skill** para 1 rótulo; `better-writing` se forem 2+ strings ou erro/confirmação/estado vazio | autorrevisão com o teste de voz (`COPY.md`) | Humanizer em rótulo; mais de 1 skill; substituição global |
| **UX writing** — tela ou fluxo novo, erro, estado vazio, onboarding de uso | "tela nova", "mensagem de erro", "onboarding" | `COPY.md` + `docs/copy/01` §1–2, `02`, `03` → `better-writing` (escreve) → `humanizer` só em corpo de 2+ frases | `better-writing` no formato de revisão, sobre o diff | skills do pacote Marketing em tela do app; conteúdo pedagógico |
| **fala da Foca** (`voz.ts`) | "fala da mascote", "mensagem de marco" | `COPY.md` + `docs/copy/04` §2 + `15` §4 (onde a Foca aparece). Sem skill | teste de voz + teste da Foca (`docs/copy/04`) | Humanizer (achata o humor), `better-writing`, Ogilvy |
| **Foca IA** (`tutor-prompt.ts`) | "o tutor responde…", "persona do tutor" | `COPY.md` + `docs/copy/04` + `20` §7.1 (linha Tutor). Sem skill de escrita: é prompt + L2 | L2 (`SDD-WORKFLOW` §6) + `tests/unit/brand-voice.test.ts` | Humanizer no prompt; remover a regra anti-LaTeX |
| **conteúdo pedagógico** | enunciado, alternativa, gabarito, explicação, lição | `docs/copy/05` + rubrica do `36` §G.6. **Nenhuma skill de copy** | revisão factual (`36` Fase 7) | qualquer skill de escrita em enunciado/alternativa/gabarito/fórmula/citação; "melhorar o texto" de questão oficial (`34`) |
| **marketing** — landing, hero, OG, loja, post, campanha | "landing", "headline", "descrição", "post" | `COPY.md` + `docs/copy/01`, `06` + `PRODUCT.md` → Evidence on Hand → **ligar o pacote** (§6) ou ler do cache → `product-marketing` (contexto) → `ogilvy-copywriting` (estratégia) → `copywriting` (rascunho) · `design-taste-frontend` se houver página | `copy-editing` (**obrigatória**) → `humanizer` (recomendada) → teste de voz | prova social, número ou preço inventados; analytics externo sem spec; `better-writing` |
| **posicionamento** — proposta de valor, tagline | "como explicar o Foca", "tagline" | `docs/copy/01` inteiro → `ogilvy-copywriting`. Só ler `copy/01` §5 se a pergunta for "qual é a nossa proposta?" | `copy-editing` (passadas "Prove It" e "Especificidade") + aprovação do usuário | trocar a frase de posicionamento sem aprovação (decisão D-1 do `38`) |
| **docs** | registro de execução, README, ADR | `agent-skills:documentation-and-adrs` (formato) — o **conteúdo** segue o SDD | `humanizer` só em doc para humanos, nunca em spec | — |
| **memória** | "já fizemos isso?", "como resolvemos X?" | `claude-mem:mem-search` | confirmar no código/spec atual | tratar lembrança como fato |

### 2.1 Escrita: níveis, ordem e orçamento

> Origem: [38](../38-plano-sistema-copy-e-skills.md). Guia de copy: [docs/COPY.md](../COPY.md). **Skill de escrita é ferramenta, não etapa obrigatória:** só roda quando traz algo que o guia não traz. Botão de duas palavras não passa por skill.

**Níveis por skill** (REQUIRED = deve; RECOMMENDED = normalmente, salvo motivo claro; OPTIONAL = quando ajudar; DO NOT USE = prejudica):

| Skill | REQUIRED | RECOMMENDED | OPTIONAL | DO NOT USE |
|---|---|---|---|---|
| `better-writing` | erro, confirmação, estado vazio, tela/fluxo novo, 2+ strings de interface | auditoria de copy (uma chamada por área) | ajuste de 1 rótulo | conteúdo pedagógico, prompt do tutor, `voz.ts`, marketing de persuasão |
| `ogilvy-copywriting` | — | posicionamento, proposta de valor, hero/título, descrição de OG/loja | campanha, post | UI do app, feedback, tutor, pedagógico, microcopy |
| `marketing-skills:copywriting` | rascunho de página de marketing | onboarding **de conversão** (fora do app) | e-mail, post | microcopy, UI do app, tutor, pedagógico |
| `marketing-skills:copy-editing` | revisão de todo texto de marketing antes de publicar | revisão de `docs/copy/01` (posicionamento) | — | microcopy e UI do app (usar `better-writing`), pedagógico |
| `marketing-skills:product-marketing` | antes de qualquer skill do pacote (contexto) | — | — | — |
| `humanizer` | — | marketing, corpo de onboarding com 2+ frases, estado vazio com 2+ frases, doc para humanos | falas longas do tutor citadas como exemplo em guia | rótulo/botão, `voz.ts`, prompt do tutor, conteúdo pedagógico, spec, código |

**Ordem e orçamento por tamanho de tarefa:**

| Tamanho | Ler | Skills, em ordem | Teto |
|---|---|---|---|
| Mudança mínima (1 rótulo, tooltip, aria) | `COPY.md` (Quick Context) + linha do padrão | nenhuma | ~3k tokens de leitura |
| Erro / confirmação / estado vazio | Quick Context → padrão em `copy/03` §2 | `better-writing` → (2+ frases) `humanizer` | 1 skill + 1 revisão |
| Tela ou fluxo novo | Quick Context → `copy/01` §1–2 → `copy/02` → `copy/03` | `better-writing` (escreve) → `humanizer` (corpo) → `better-writing` (revisão do diff) | 2 skills |
| Landing / página de marketing | `copy/01` → `copy/06` → `copy/02` → `PRODUCT.md` Evidence → este §2.1 | `product-marketing` → `ogilvy-copywriting` (estratégia) → `copywriting` (rascunho) → `copy-editing` (sete passadas; painel de especialistas só em lançamento) → `humanizer` → teste de voz → checagem de UI/comprimento | 4 skills — o teto do sistema |
| Foca IA / fala da Foca | `copy/01` §1 → `copy/02` → `copy/04` | nenhuma de escrita | L2 obrigatório no prompt |
| Conteúdo pedagógico | `copy/05` | nenhuma de copy | revisão factual |

**Marketing sem ligar as 50 skills:** para uma revisão isolada, ler o `SKILL.md` direto do cache (`~/.claude/plugins/cache/marketingskills/marketing-skills/2.11.1/skills/copy-editing/SKILL.md`; caminho no registry → `cachePath`). Ligar o pacote (§6) só quando o trabalho usar várias skills dele.

**Pipelines resultantes:**

```text
Marketing ...... ogilvy-copywriting → copywriting → copy-editing → humanizer → teste de voz → checagem de UI/comprimento
UX writing ..... better-writing (escreve) → humanizer (só corpo de 2+ frases) → better-writing (revisão do diff)
Microcopy ...... padrão do guia → teste de voz
Foca (voz.ts) .. copy/04 → teste da Foca
Tutor .......... copy/04 → L2
Pedagógico ..... sem skill de copy → revisão factual
```

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
| Humanizer | Acabamento anti-artificialidade (texto de 2+ frases) | — | **Sim** | Não |
| Better Writing | Escrita e revisão de texto de interface | texto de interface | **Sim** | Não |
| Ogilvy Copywriting | Estratégia de mensagem (só marketing/posicionamento) | promessa, título | — | Não |
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
| **Copy de interface:** `better-writing` × Humanizer × Impeccable (modo UX copy) × `design:ux-copy` (usuário) | Voz do `20` §7.1 manda. `better-writing` escreve e revisa texto de interface; Humanizer só em prosa de 2+ frases, no fim; Impeccable e `design:ux-copy` não entram na rota de copy. |
| **Copy de marketing:** `ogilvy-copywriting` × `marketing-skills:copywriting` × `copy-editing` × Humanizer | Ogilvy decide posicionamento e promessa, `copywriting` escreve, `copy-editing` revisa, Humanizer polindo no fim. Nunca as quatro sobre o mesmo rótulo. |
| **Anti-artificialidade:** Humanizer × Stop Slop (não instalada) × `humanize-writing` do SecondSky (não instalada) | Humanizer é o único. Comparação em [SKILLS.md](SKILLS.md) §L. |
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
| Humanizer, Frontend Design, locais (8, com Better Writing e Ogilvy — estimativa) | ~1,1k | ativo |

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
| "Escreva copy da landing page" | marketing (§2.1) | ler `docs/COPY.md` + `copy/01`, `06` → `product-marketing` → `ogilvy-copywriting` (estratégia) → `copywriting` (rascunho) → `cro` só se a estrutura da página for o problema → `copy-editing` (obrigatória) → `humanizer` → teste de voz | inventar números/depoimentos; `better-writing` |
| "Melhore onboarding" | **depende de qual onboarding.** Texto do onboarding **dentro do app** (`quiz`, `aha`, oferta de nivelamento): UX writing. Onboarding **de conversão** (tela pública, e-mails): marketing | Dentro do app: spec (se mudar fluxo) → `docs/COPY.md` → `better-writing` → `humanizer` só em corpo de 2+ frases → `frontend-design` se mudar a tela → `web-design-guidelines`. De conversão: rota de marketing (§2.1), ligando o pacote e usando `onboarding` | quebrar a regra "sem cobrança no retorno" (`15` §3.2); `ogilvy-copywriting` dentro do app |
| "Refatore isso" | engenharia | `agent-skills:code-simplification` + `test-driven-development` → `code-review-and-quality` | **nenhuma** skill de design ou marketing |
| "Página está lenta" | performance | `vercel-react-best-practices` + `agent-skills:performance-optimization` → `web-performance-auditor` | regras de Next.js |
| "Vamos lançar essa feature" | verificação + segurança | `superpowers:verification-before-completion` contra a spec → testes (etapa 6) → L2/L3 conforme o que mudou → `agent-skills:shipping-and-launch` | push/merge sem pedido |
| "Implemente a próxima spec" | execução de spec | [SDD-WORKFLOW.md](SDD-WORKFLOW.md) §4 → `executing-plans` → skills por `T-xx` → `spec-verifier` | inventar escopo se não houver spec aprovada |
| "O tutor está respondendo errado" | bug + IA (L2) | `systematic-debugging` → `tutor-core.ts`/`tutor-prompt.ts` → teste → L2 | abrir o tutor automaticamente ao errar (proibido pelo `20`) |
| "Troque o texto do botão Continuar da lição" | microcopy | Quick Context → padrão "continuar" | qualquer skill |
| "Reescreva a mensagem de erro do pacote que não carrega" | UX writing | `better-writing` | Humanizer, marketing |
| "Crie a copy da tela de resultado do nivelamento" | UX writing (**dependência do `36` T-06.1**, que define o contrato da tela) | `better-writing` → Humanizer só no corpo | Ogilvy, copywriting |
| "Escreva uma fala nova da Foca para o marco de 50 dias" | fala da Foca | `docs/copy/04` §2 | Humanizer, better-writing |
| "Escreva a headline da landing" | marketing | `ogilvy-copywriting` → `copywriting` → `copy-editing` → Humanizer | better-writing |
| "Melhore a explicação da questão 12" | conteúdo pedagógico | `docs/copy/05` → revisão factual | toda skill de copy |
| "O tutor está muito formal" | Foca IA | `docs/copy/04` → L2 | Humanizer no prompt |
| "Revise toda a copy do app" | UX writing em modo auditoria (relatório, sem aplicar) | `docs/COPY.md` → `better-writing` em modo revisão, uma chamada por área → relatório em `docs/copy/auditoria-*.md` | reescrever sem plano aprovado; Humanizer em rótulo |
| "Qual é a nossa proposta de valor?" | posicionamento (pergunta) | ler `docs/copy/01` §5, sem skill | — |
