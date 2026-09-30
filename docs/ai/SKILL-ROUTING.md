---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [roteamento de skills para Claude e Codex]
substitui: [versão de 22/09/2026 (só Claude)]
substituido-por: null
---

# Roteamento de skills — qual usar, quando é obrigatória e o que fazer sem ela

> Para Claude Code **e** Codex. Catálogo (o que existe, onde, para qual agente): [SKILLS.md](SKILLS.md) e [skills-registry.json](skills-registry.json). Fluxo SDD: [SDD-WORKFLOW.md](SDD-WORKFLOW.md). Skills são ferramentas: nenhuma prevalece sobre uma spec aprovada nem sobre o `AGENTS.md`.

## 1. Regras gerais

```text
PEDIDO → CLASSIFICAR (§2) → LER O CONTEXTO OBRIGATÓRIO → 1–3 SKILLS PRIMÁRIAS → EXECUTAR → 1 REVISÃO DA CLASSE → VERIFICAR CONTRA A SPEC
```

- **No máximo 3 primárias por tarefa**, só da classe dela; **1 revisão** no fim, sobre o diff.
- **Obrigatória** significa: obrigatória **quando disponível para o agente**. Se não estiver (plugin que não carregou, skill só do outro agente), a **alternativa** da coluna "Sem a skill" passa a ser obrigatória, e o registro anota "skill X indisponível; usei Y". Nunca afirmar que usou uma skill que não carregou.
- **Disponibilidade:**
  - **[repo]** skill do projeto: fonte em `.agents/skills/` (Codex) com espelho em `.claude/skills/` (Claude) — os dois agentes a veem;
  - **[C]** só Claude Code (skill do usuário ou embutida: `/code-review`, `/security-review`, `/simplify`; skills `design:*`);
  - **[C-plug]** plugin do projeto em `.claude/settings.json` — depende do host e pode não carregar numa sessão;
  - **[X]** só Codex (skills de sistema: `review-agent`, `openai-docs`).
- Nunca carregar juntas, sem motivo explícito, as cinco de design: `frontend-design`, `impeccable`, `design-taste-frontend`, `ui-ux-pro-max`, `web-design-guidelines`.
- Duas skills de processo concorrentes (Superpowers × Addy `agent-skills`) nunca na mesma etapa: escolha uma (§3).
- Skill carregada que não se aplica: diga por quê e não a siga.
- **OmniRoute MCP** (`.mcp.json`) não é skill nem entra no roteamento; só com pedido explícito, e nunca substitui a integração de IA do Foca.

## 2. Matriz operacional

| Tarefa e gatilho | Contexto obrigatório | Obrigatórias | Recomendadas | Opcionais | Ordem | Não usar quando | Revisão e validação | Evidência | Sem a skill |
|---|---|---|---|---|---|---|---|---|---|
| **Retomar / próxima tarefa** ("continue", "próxima", sessão nova) | `AGENTS.md` → `docs/ESTADO.md` → tarefa na spec → fim do registro | `foca-sdd` [repo] | — | — | ler → `git status` → verificar → executar | — | Checkpoint no `ESTADO.md` | ESTADO atualizado | [SDD-WORKFLOW.md](SDD-WORKFLOW.md) §4–§5 à mão |
| **Planejamento / spec nova** ("quero…", sem spec) | `docs/produto/estrategia.md`, `persona-joao.md`, `regras.md`, `funcionalidades.md` | `foca-sdd` | `superpowers:brainstorming` **ou** `agent-skills:interview-me` [C-plug] | `superpowers:writing-plans` [C-plug] | descobrir → `spec.md` → aprovação | Escopo já aprovado | Proprietário aprova | `spec.md` com estado | [templates/spec.md](templates/spec.md) |
| **Execução de spec** ("T-05.2") | Tarefa + dependências + contratos citados | `foca-sdd` | `superpowers:executing-plans` [C-plug] | `superpowers:subagent-driven-development` [C-plug] se as tarefas forem independentes | uma tarefa por vez | — | `spec-verifier` [C] / `.codex/agents/spec-verifier.toml` [X] | Critério → evidência | Checklist da tarefa |
| **Backend / API** (server function, rota de servidor, regra de negócio) | `docs/arquitetura/visao-geral.md`, `contratos.md`, `dados.md`, `docs/seguranca/README.md` | `foca-backend` [repo] (criada no 46 T-06.7) | `agent-skills:api-and-interface-design`, `superpowers:test-driven-development` [C-plug] | `tanstack-start` [C-plug] (referência; conferir o viés Cloudflare) | contrato → teste → código | UI pura | **L2** + `/code-review` [C] ou `review-agent` [X] | Testes de integração com 2 usuários | Documentação oficial (TanStack Start, Better Auth, Drizzle) + checklist L2 |
| **Banco / migração** | `docs/arquitetura/dados.md`, [ADR 0005](../decisoes/0005-stack-de-backend.md) | `foca-backend` | — | — | esquema → `db:generate` → revisar o SQL → `db:migrate` local → teste | — | SQL gerado revisado; reversível ou com plano de rollback | Migração versionada + teste | Documentação do Drizzle |
| **Autenticação / sessão / conta** | `docs/seguranca/modelo-de-ameacas.md`, `privacidade.md`, ADR 0005/0006 | `foca-backend` | `agent-skills:security-and-hardening` [C-plug] | — | ameaça → controle → teste | — | **L2 obrigatório** + testes de isolamento | Testes de ataque do modelo de ameaças | Checklist L2 + documentação do Better Auth |
| **Segurança L1** (toda mudança de código) | `docs/seguranca/README.md` §3 | — | — | — | — | — | Checklist L1 | Linha no registro | — |
| **Segurança L2** (auth, dado pessoal, IA, upload, dependência, headers, deploy) | + modelo de ameaças | `agent-skills:security-and-hardening` [C-plug] **ou** checklist L2 | `/security-review` [C] | `repo-security-review --pr` [C] | — | — | Achados classificados | Relatório no registro | Checklist L2 + `review-agent` [X] |
| **Segurança L3** (antes de abrir contas ou vender) | Tudo de `docs/seguranca/` | `repo-security-review` completo [C] | `/security-review` [C] | — | segredos → dependências → código → validação | — | Auditoria final | `docs/seguranca/auditorias/AAAA-MM-DD.md` | gitleaks + osv-scanner + semgrep à mão + revisão manual (Codex) |
| **UI nova** | `docs/DESIGN.md`, `docs/design/sistema-rabisco.md` (seção), `docs/design/mascote.md` | — | `vercel-react-best-practices` [repo]; `frontend-design` [C-plug] | `ui-ux-pro-max` [C-plug] (pesquisa) | implementar → revisar | Só backend | `web-design-guidelines` [repo] | E2E + capturas em 320/390/1280 | Seções do `DESIGN.md` + checklist de acessibilidade |
| **Refino de UI** ("parece genérica", "polir") | idem | — | `impeccable` [C-plug] (`critique` → `polish`) | `design-taste-frontend` [repo] (marketing) | crítica → polimento | Tela nova | `web-design-guidelines` | Antes/depois | `web-design-guidelines` |
| **UX / fluxo** (cadastro, importação, exclusão de conta) | `persona-joao.md`, `docs/copy/03-ux-writing.md`, `regras.md` | — | `better-writing` [repo] (texto) | `design:ux-copy` [C] | fluxo → estados (vazio, carregando, erro, sucesso) → texto | — | `web-design-guidelines` | E2E de todos os estados | `copy/03` §2 |
| **Acessibilidade** | `docs/PRODUCT.md` → Accessibility | `web-design-guidelines` [repo] em UI nova | `design:accessibility-review` [C] | `impeccable audit` [C-plug] | — | — | axe (`@axe-core/playwright`) nos E2E | Sem violação séria no axe | axe + teclado manual |
| **Motion** | `docs/design/sistema-rabisco.md` (movimento) | `motion-design` [repo] (intenção) | — | `gsap-*` [C-plug, desligado] **só** com spec aprovando GSAP | intenção → CSS | Sem intenção definida | `web-design-guidelines` (reduced motion) | `prefers-reduced-motion` testado | CSS existente em `styles.css` |
| **Copy de interface** | `docs/COPY.md` no nível do tamanho da tarefa | Pelo §2.1 | `better-writing` [repo] | — | — | Conteúdo pedagógico, prompt do tutor, `voz.ts` | Teste de voz | Linha no inventário `docs/copy/inventario.md` | Guia `COPY.md` |
| **Marketing** | `COPY.md` + `copy/01`, `06` + `PRODUCT.md` → Evidence | Pelo §2.1 | `ogilvy-copywriting` [repo] | pacote `marketing-skills` [C-plug, desligado] | §2.1 | Tela do app | `copy-editing` (obrigatória quando o pacote estiver ligado) | Afirmações dentro das permitidas | `copy/06` §3–§4 |
| **Texto legal** (termos, privacidade) | `docs/seguranca/privacidade.md`, `docs/legal/README.md`, fontes oficiais | — (nenhuma skill de copy altera substância jurídica) | `better-writing` **só** para clareza de frase, sem mudar o sentido | — | fatos do sistema → rascunho → pendências → revisão jurídica | Marketing, persuasão, `humanizer` | **Revisão jurídica humana antes de publicar** | Pendências listadas | — |
| **Conteúdo pedagógico** | `docs/copy/05-conteudo-pedagogico.md`, [decisão 0002](../decisoes/0002-questoes-oficiais-enem.md) | nenhuma de copy | — | — | — | Qualquer skill de escrita | Revisão factual | — | — |
| **Foca IA** (prompt, contexto, cota) | `docs/copy/04-foca-ia.md`, `contratos.md` (tutor), modelo de ameaças | — | — | — | — | `humanizer` no prompt; remover a regra anti-LaTeX | **L2** + `tests/unit/brand-voice.test.ts` | Testes de injeção e de cota | — |
| **Testes** | Critério da tarefa | — | `superpowers:test-driven-development` **ou** `agent-skills:test-driven-development` (uma) | agent `test-engineer` [C-plug] | teste falhando → código → verde | — | Suite completa da fase | Saída real dos comandos | Escrever o teste antes, à mão |
| **Depuração** | Reprodução do erro | `superpowers:systematic-debugging` [C-plug] | `agent-skills:debugging-and-error-recovery` [C-plug] | — | reproduzir → isolar → teste → corrigir | — | `/code-review` [C] / `review-agent` [X] | Teste de regressão | Reproduzir, isolar, escrever o teste que falha, corrigir — nesta ordem |
| **Refatoração** | Código e testes existentes | — | `agent-skills:code-simplification` [C-plug] | `/simplify` [C] | — | Mudança de comportamento | `/code-review` / `review-agent` | Testes verdes antes e depois | — |
| **Performance** | Regras de code splitting em `contratos.md` | — | `vercel-react-best-practices` [repo] | agent `web-performance-auditor` [C-plug] | medir → mudar → medir | — | Lighthouse (`scripts/marketing/lighthouse.ts`) | Números antes e depois | — |
| **Documentação / SDD** | [SDD-WORKFLOW.md](SDD-WORKFLOW.md), templates | — | `agent-skills:documentation-and-adrs` [C-plug] (formato) | `humanizer` [C-plug] só em doc para humanos, nunca em spec | — | — | `bun run docs:check` | Links sem erro | Templates |
| **Deploy / operação** | `docs/operacao/ambientes-e-deploy.md`, [ADR 0001](../decisoes/0001-hospedagem-vercel.md) | — | `agent-skills:shipping-and-launch` [C-plug] | — | — | Sem pedido do proprietário | Checklist de release | Registro do deploy | Checklist de `docs/operacao/` |
| **Memória** ("já fizemos isso?") | — | — | `claude-mem:mem-search` [C, se habilitado] | — | lembrar → conferir no código/spec | — | Confirmar no código atual | — | `git log`, `grep`, registros |

### Lacunas conhecidas (29/09/2026)

| Lacuna | Solução | Verificação |
|---|---|---|
| Nenhuma skill de backend, banco ou autenticação nos dois agentes | Skill local `foca-backend`, escrita **depois** que as convenções existirem (46 T-06.7) | O validador a encontra nos dois agentes; uma tarefa de backend a usa e o registro cita |
| Nenhuma skill de LGPD ou dados de menores | Não criar skill: a checklist vive em `docs/seguranca/privacidade.md`, e o `foca-sdd` manda lê-la quando a tarefa toca dado pessoal | `foca-sdd` contém a regra |
| Plugins do Claude dependem do host | A matriz sempre traz uma alternativa | — |
| Codex sem skills do projeto até 29/09/2026 | `.agents/skills/` como fonte + espelho em `.claude/skills/` + agente TOML (46 T-02.2, T-02.6) | Sessão do Codex lista as skills do projeto |
| Ferramentas do `repo-security-review` ausentes (gitleaks, osv-scanner, semgrep) | Instalação local (46 T-12.3) | `--version` de cada uma no registro |
| Nenhuma skill de Playwright ou de deploy na Vercel | Documentação oficial + `docs/operacao/` | — |

### 2.1 Escrita: níveis, ordem e orçamento

> Origem: [38](../historico/iniciativas/38-39-copy/38-plano-sistema-copy-e-skills.md). Guia de copy: [docs/COPY.md](../COPY.md). **Skill de escrita é ferramenta, não etapa obrigatória:** só roda quando traz algo que o guia não traz. Botão de duas palavras não passa por skill.

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

**Marketing sem ligar as 50 skills:** para uma revisão isolada, ler o `SKILL.md` direto do cache (`~/.claude/plugins/cache/marketingskills/marketing-skills/2.11.1/skills/copy-editing/SKILL.md`; caminho no registry → `cachePath`). Ligar o pacote (§4, "Ligar e desligar") só quando o trabalho usar várias skills dele.

**Pipelines resultantes:**

```text
Marketing ...... ogilvy-copywriting → copywriting → copy-editing → humanizer → teste de voz → checagem de UI/comprimento
UX writing ..... better-writing (escreve) → humanizer (só corpo de 2+ frases) → better-writing (revisão do diff)
Microcopy ...... padrão do guia → teste de voz
Foca (voz.ts) .. copy/04 → teste da Foca
Tutor .......... copy/04 → L2
Pedagógico ..... sem skill de copy → revisão factual
```


## 3. Sobreposições e como desempatar

| Sobreposição | Regra |
|---|---|
| **TDD:** `superpowers:test-driven-development` × `agent-skills:test-driven-development` | Superpowers quando a tarefa veio de um plano executado por Superpowers; Addy quando a tarefa é de engenharia avulsa. Nunca as duas. |
| **Plano:** `superpowers:writing-plans` × `agent-skills:planning-and-task-breakdown` × Addy `/plan` | Qualquer um serve para **pensar** o plano; o **arquivo** é sempre a seção de tarefas da spec. |
| **Spec:** `superpowers:brainstorming` × `agent-skills:spec-driven-development` × Addy `/spec` × `product-management:write-spec` (usuário) | Descoberta: brainstorming ou interview-me. Arquivo: `docs/specs/NN-tema/spec.md` no formato de [templates/spec.md](templates/spec.md). |
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


## 4. Orçamento de tokens (medido no Claude Code em 22/09/2026)

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

### Ligar e desligar pacotes do Claude sob demanda

```bash
# ligar só para você (settings.local.json, não versionado) e recarregar
claude plugin enable marketing-skills@marketingskills --scope local
# dentro da sessão: /reload-plugins   (ou abrir uma sessão nova)

# ao terminar
claude plugin disable marketing-skills@marketingskills --scope local
```

Mesmo padrão para `gsap-skills@gsap-skills`. Se o CLI não estiver no PATH (extensão do VS Code), use `/plugin` dentro da sessão. Sem religar, o agente ainda pode ler um `SKILL.md` específico direto do cache — caminho em `docs/ai/skills-registry.json` → `cachePath`.


## 5. Casos de teste do roteamento

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
| "Implemente a próxima spec" | execução de spec | [SDD-WORKFLOW.md](SDD-WORKFLOW.md) §5 → `executing-plans` → skills por `T-xx` → `spec-verifier` | inventar escopo se não houver spec aprovada |
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
