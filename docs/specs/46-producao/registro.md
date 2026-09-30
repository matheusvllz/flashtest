---
estado: em-execucao
atualizado: 2026-09-29
iniciativa: 46
id: 47
---

# 46 — Registro de execução (ID 47)

**Norma:** [spec.md](spec.md) (aprovada em 29/09/2026; decisões do proprietário no §0, que prevalecem sobre o resto da spec).
**Branch:** `producao-46` (commits locais autorizados, sem push — D-03).
**Regra:** cada tarefa registra o que foi feito, a evidência (comando e saída real) e as divergências entre spec e código. Estados de validação: **implementado** · **validado localmente** · **validado em ambiente integrado** · **publicado**.

## Commits

| Commit | Conteúdo |
|---|---|
| `9109d8f` | Trabalho preexistente (automação do Instagram, foca-social, remoção dos arquivos Abroad e Flash Test — D-02/D-05) |
| (ver `git log`) | F01 + F02: reorganização do SDD, instruções e skills para Claude e Codex |

## Linha de base (T-00.1, 29/09/2026, HEAD `9109d8f`)

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `bunx tsc --noEmit` | ✅ rc=0 |
| Unitários | `bun test tests/unit` | ❌ 1240 pass, **2 fail** (96 arquivos, 1242 testes) — ambos em `tests/unit/css-tokens.test.ts`, ver DV-01 |
| Lint | `bun run lint` | **Não concluiu**: mais de 1 h e 30 min varrendo os bundles de build em `.vercel/output` e `.netlify/`, que o `eslint.config.js` não ignora (só `dist`, `.output`, `.vinxi`). O processo não pôde ser interrompido nesta sessão (permissão negada para encerrar o processo). Linha de base de lint refeita no T-03.3, com as pastas de build ignoradas — ver DV-02 |
| Build (preset padrão = netlify) | `bun run build` | pendente (atrás do lint no mesmo processo) |
| Build `node-server` | `NITRO_PRESET=node-server bun run build` | ✅ rc=0 (rodado depois das mudanças de F01/F02, que não tocam código do app) |
| E2E | `bunx playwright test` | pendente (atrás do lint no mesmo processo) |

## Divergências spec × código

| ID | Onde | O que se esperava | O que existe | Decisão |
|---|---|---|---|---|
| DV-01 | `tests/unit/css-tokens.test.ts` | Testes de "CSS compilado" verdes (registro 45: 1238 unitários passando) | Falham quando `dist/assets/styles-*.css` existe: as variáveis `--lp-*` da landing ficam em `marketing-*.css` (bundle separado desde o 44), que o teste não lê. No CI o teste é **pulado** (os unitários rodam antes do build, sem `dist/`), por isso a falha estava latente | Lacuna de teste, não bug do app. Corrigir no T-03.1: o teste passa a ler todos os CSS compilados e também `.output/public/assets` (com o preset padrão `node-server` não há `dist/`) |
| DV-02 | `eslint.config.js` | `bun run lint` rápido | Varre `.vercel/`, `.netlify/`, `automacao-instagram/`, `edição Videos/` | T-03.3 |
| DV-03 | 46 §C.5 × migração | 17 e 23 iam para `fundacao/`; 35 para `fundacao/` | Ficaram na pasta da iniciativa (`17-18-19-rabisco/`, `23-24-identidade-sonora/`, `35-36-37-qualidade/`) — o documento fica junto do resumo da iniciativa que o explica | Registrado; mapa de IDs em `docs/historico/README.md` |
| DV-04 | Plano 17 | Encerrar só com registro próprio | O 17 não tem registro próprio; a execução é atestada pelo 18 (Fase 0) e o que sobreviveu dele foi conferido no código (`store.ts:181-182`) | Encerrado com ressalva (o 18 substituiu a paleta Ártica no mesmo dia) |
| DV-05 | Regras duplicadas | 46 §D.4: "cada regra aparece uma vez" | Os agentes de extração escreveram em paralelo: `regras.md`/`contratos.md` e `design/mascote.md`, `design/gamificacao-e-som.md`, `arquitetura/conteudo.md` repetem alguns tópicos (XP, som, mascote, conteúdo) | Precedência declarada: em conflito, os IDs `C-*`/`R-*` de `contratos.md`/`regras.md` vencem. Deduplicação → backlog (P2) |
| DV-06 | Planos arquivados | Cabeçalhos com o estado real | `20`/`25` dizem "PLANEJADO, NÃO IMPLEMENTADO", `27`/`28` "rascunho", `17` "pronto para executar", `36`/`30`/`31` "em execução" | Não reescrevemos histórico: cada arquivo arquivado ganhou uma faixa "Arquivado em 29/09/2026" no topo, e o estado real está no `resumo.md` |
| DV-07 | Contratos × código (achados da extração) | — | Meta diária padrão 3 (doc diz 1, `store.ts:238`); meta contada de dois jeitos (`completedBlockIds` × `today.lessons`); "Dominado" em `progress.tsx:55-61` fora da regra de domínio; "Checkpoint" ainda na interface (`copy.ts:195`); XP de checkpoint gravado como `atividade:` (`store.ts:1805,1833`), `CHECKPOINT_XP` sem uso; limites do tutor no servidor 5/10/500 × 2/3/240 no cliente; itens do áudio da Fase 1 do 31 inexistentes; `vercel.json` sem cache imutável para `/sfx`; `reviewKind` ausente nas metas do banco geral e das microlições; override `foca.flags` ativo em produção com `?debug=1` | Registrados em `docs/arquitetura/contratos.md` §19 e `docs/produto/regras.md` §11; itens de produto → backlog |

## F00 — Preparação

### T-00.1 — Linha de base
Ver a tabela acima. Build com preset padrão e E2E ficaram atrás do lint no mesmo processo; serão registrados quando concluírem (ou refeitos no gate da F03).

### T-00.2 — Trabalho local preexistente
- Versionado à parte em `9109d8f`: `automacao-instagram/` (verificada antes: `.env` ignorado pelo `.gitignore` próprio, `.env.example` sem valores, nenhum token nos 118 arquivos de texto por busca de padrões `EAA…`, `sk-…`, `access_token=…`, `Bearer …`), `foca-social` (agente e skill), alterações de `CLAUDE.md`, índice, `docs/ai/*`, `docs/copy/06`, registry, e as exclusões confirmadas pelo proprietário.
- `edição Videos/` e `Claude outputs/` continuam não rastreados; ignorados no T-03.3 (sem apagar).
- **Estado:** concluída.

### T-00.3 — Branch
- `producao-46` criada a partir de `main` (`3307b22`). `main` intocada. **Estado:** concluída.

## F01 — Reorganização do SDD

### T-01.1 — Esqueleto, estados e templates
- Árvore do §C.2 criada; modelos em `docs/ai/templates/` (`spec.md` — o antigo `SPEC-TEMPLATE.md` movido e reescrito —, `tarefas.md`, `registro.md`, `adr.md`, `resumo.md`); estados e transições em `docs/ai/SDD-WORKFLOW.md` §3. **Estado:** concluída.

### T-01.2 — Encerramento das iniciativas concluídas
- 10 resumos em `docs/historico/iniciativas/*/resumo.md`, cada um com a checklist (a)–(d): registro × tarefas, 3 contratos conferidos no código com arquivo:linha (ex.: `ALGO_VERSION = 1` em `src/lib/adaptive/constants.ts:9`; `PLANNER_VERSION = 2` em `:208`; `JANELA_MIX = 10` em `:112`; `openTutorWithContext` em `src/lib/store.ts:1581`; `CURRICULUM_TREE` em `src/content/curriculum-tree.ts:248`; 12 WAVs, 608208 bytes, em `public/sfx/v2/`), últimos números de teste como registrados, pendências.
- Todas encerradas; o 17 com a ressalva DV-04. **Estado:** concluída.

### T-01.3 — Regras vigentes extraídas
- `docs/produto/regras.md` (83 regras R-*), `docs/arquitetura/contratos.md` (131 contratos C-*, verificados no código onde barato), `docs/design/mascote.md`, `docs/design/gamificacao-e-som.md`, `docs/arquitetura/visao-geral.md`, `docs/arquitetura/conteudo.md`. Cada regra cita a origem `(NN §x)`.
- Critério "cada regra uma vez": **não cumprido integralmente** (DV-05). Amostragem por `spec-verifier`: pendente (fica para o T-14.2).
- **Estado:** concluída com pendência.

### T-01.4 — Backlog consolidado
- `docs/produto/backlog.md`: 88 itens ativos (24 P0, 21 P1, 43 P2) em 8 áreas, 15 encerrados; duplicatas fundidas; itens que o 46 implementa marcados "planejado → 46 T-x". **Estado:** concluída.

### T-01.5 — Inventário de funcionalidades
- `docs/produto/funcionalidades.md`: as 27 rotas de `src/routes/` + `__root.tsx` + 18 funcionalidades sem rota; conferido por script que toda rota aparece. **Estado:** concluída.

### T-01.6 — Movimentos e mapa histórico
- `scripts/docs/migrar-2026-09.ts --aplicar`: **97 arquivos movidos com `git mv`**, 142 links recalculados, 347 menções literais de caminho atualizadas (inclusive as chaves com barra invertida dos JSON de hashes de áudio). Mapa ID → caminho em `docs/historico/README.md` (IDs 00–47). ADRs `0001` (Vercel), `0002` (← 34), `0003` (← 24), `0004` (SDD), `0005` (stack de backend), `0006` (conta e idade).
- Faixa "Arquivado em 29/09/2026" no topo dos 38 documentos históricos (DV-06); frontmatter nos canônicos movidos (08, 14, 18, 21, 24, 34).
- Correções depois da migração: o script também normalizou `./x` → `x` em 4 arquivos de uma skill de terceiros (`vercel-react-best-practices`) — **revertidos byte a byte** a partir do HEAD, porque o hash deles está no `skills-lock.json`; e reescreveu 2 exemplos dentro de código inline no plano 38 — restaurados do HEAD. O extrator de links passou a ignorar código inline.
- **Estado:** concluída.

### T-01.7 — Referências dependentes
- Caminhos lidos em execução atualizados pela migração e conferidos:
  - `scripts/content/taxonomy-doc.ts:13` → `bun scripts/content/taxonomy-doc.ts` regenerou `docs/arquitetura/taxonomia-habilidades.md` **idêntico** (rename puro no `git diff -M`);
  - `tests/unit/audio.test.ts:21` → `bun test tests/unit/audio.test.ts`: 9 pass, 0 fail;
  - `scripts/foca_sound/*.py` → `py -3 scripts/foca_sound/verify.py --integrated` roda e encontra os arquivos nos caminhos novos (o campo `existing_files_unchanged: false` compara com um retrato do `src/` de 21/09 e já era falso antes da migração);
  - registry `contextFiles` e `scripts/validate-skills.mjs` → validador OK.
- `automacao-instagram/`: só os `.md` (AGENTE, estratégia, índice de referências) foram atualizados; o código dela lê `docs/DESIGN.md`, `docs/COPY.md` e `docs/PRODUCT.md`, que não mudaram de lugar.
- **Estado:** concluída.

### T-01.8 — Verificador de links e caminhos
- `scripts/docs/verificar-links.ts` + `bun run docs:check` + `tests/unit/docs-e-skills.test.ts` (entra no CI com os unitários). Confere links relativos, âncoras (fora do histórico), caminhos entre crases nos documentos vivos (com exceções explícitas: histórico, specs e modelos, skills, placeholders, menções marcadas "(a criar)"/"não existe") e o catálogo de skills.
- Evidência: antes da migração, 210 problemas; depois das correções, `docs:check — nenhum link ou caminho quebrado.` **Estado:** concluída.

### T-01.9 — Substituições do §B.4
- `PRODUCT.md`, `produto/estrategia.md`, `produto/regras.md` (§12) e os novos `AGENTS.md`/`CLAUDE.md` marcam como substituídas pela 46 as regras "cadastro mock é intencional", "sem backend/banco/autenticação", "coleta de dados de menores não autorizada" (agora: só a listada em `seguranca/privacidade.md`) e a regra da Lovable. `grep "mock intencional"` fora do histórico só encontra ocorrências marcadas como substituídas. **Estado:** concluída.

**Gate F01:** `bun run docs:check` ✅ · `bunx tsc --noEmit` ✅ · `bun test tests/unit` 1243 pass / 2 fail (DV-01, preexistentes) · `NITRO_PRESET=node-server bun run build` ✅.

## F02 — Instruções e skills

### T-02.1 — `AGENTS.md` canônico e `CLAUDE.md` enxuto
- `AGENTS.md`: produto, fluxo de retomada, 11 regras duras, stack e comandos, onde estão as coisas, ferramentas independentes — **6,5 KB** (limite do Codex: 32 KiB). `CLAUDE.md`: `@AGENTS.md` + só o específico do Claude (skills, plugins, subagentes, onde as ferramentas escrevem, memória) — de 27 KB para 2,3 KB.
- **Verificação em sessão nova: pendente.** Nem `claude` nem `codex` estão no PATH desta máquina (Git Bash). Verificação manual pedida ao proprietário (ver `docs/ESTADO.md`).
- **Estado:** implementada; validação pendente (manual).

### T-02.2 — Skills canônicas em `.agents/skills/` com espelho
- 9 skills movidas com `git mv` para `.agents/skills/` (foca-sdd, foca-social, better-writing, design-taste-frontend, motion-design, ogilvy-copywriting, redesign-existing-projects, vercel-react-best-practices, web-design-guidelines); espelho em `.claude/skills/` por `scripts/agents/sincronizar-skills.ts` (cópia; symlink no Windows exige modo desenvolvedor). `repo-security-review` fica só em `.claude/skills/` (depende de modelos e da ferramenta Agent do Claude).
- `node scripts/validate-skills.mjs`: `OK — 0 FAIL, 3 warn` (avisos preexistentes: versão do claude-mem, nome `test-driven-development` em dois plugins).
- **Estado:** implementada; a listagem das skills numa sessão do Codex é verificação manual pendente.

### T-02.3 — Um catálogo para os dois agentes
- `.claude/skills-registry.json` → `docs/ai/skills-registry.json` (`git mv`), com `agents`, `canonicalDir`, `availability` e `codexAlternative`; `contextFiles` atualizados (inclui `AGENTS.md` e `docs/ESTADO.md`); precedência reescrita. Tabela "skills por agente" do `docs/ai/SKILLS.md` gerada do catálogo (`scripts/agents/tabela-skills.ts`), conferida no teste unitário. Scripts `skills:sync` e `skills:check` no `package.json`. **Estado:** concluída.

### T-02.4 — Matriz operacional
- `docs/ai/SKILL-ROUTING.md` reescrito: regras gerais, disponibilidade por agente, matriz com 26 tipos de tarefa (contexto, obrigatórias, recomendadas, opcionais, ordem, quando não usar, revisão, evidência, alternativa sem a skill), lacunas conhecidas; o §2.1 de escrita, as sobreposições, o orçamento de tokens e os casos de teste foram mantidos. **Estado:** concluída.

### T-02.5 — `SDD-WORKFLOW.md` e `foca-sdd`
- Reescritos: hierarquia, onde fica cada coisa, estados e transições, checklist de encerramento, retomar (≤ 4 leituras), próxima tarefa, pipeline, subagentes, onde as ferramentas escrevem. `spec-verifier` do Claude atualizado para a nova convenção.
- Teste de mesa em sessão nova: pendente (manual, junto do T-02.1). **Estado:** implementada.

### T-02.6 — Agente verificador para o Codex
- `.codex/agents/spec-verifier.toml` (`name`, `description`, `sandbox_mode = "read-only"`, `developer_instructions` iguais às do Claude); o validador confere os campos obrigatórios. Reconhecimento numa sessão do Codex: pendente (manual). **Estado:** implementada.

### T-02.7 — `.mcp.json`
- Pendente (vai com a F03).

**Gate F02:** `node scripts/validate-skills.mjs` ✅ · `bun run docs:check` ✅ · `bun scripts/agents/sincronizar-skills.ts --checar` ✅ · `bun scripts/agents/tabela-skills.ts --checar` ✅ · sessões novas do Claude e do Codex: **pendentes (manual)**.

## F03 — Build e repositório sem Lovable e Netlify

### T-03.1 — `vite.config.ts` sem o wrapper
- Configuração explícita com os mesmos plugins e opções do wrapper fora do sandbox (lidos em `node_modules/@lovable.dev/vite-tanstack-config/dist/index.js:505-640`): `tailwindcss()`, `tsConfigPaths`, `tanstackStart` com `server.entry: "server"` e **`importProtection`** (`**/server/**` e `server-only` bloqueados no cliente), `nitro` só no build, `viteReact()`, alias `@`, `dedupe`, `optimizeDeps`, `css.transformer: "lightningcss"`, servidor em `::`/8080 com `awaitWriteFinish`. Fora do sandbox, os plugins da Lovable (bridge, hmr-gate, proxy de assets, loggers de erro do dev server) não faziam nada — saíram. Devtools do TanStack (só em modo development, sem uso no código) também saíram.
- Preset padrão fora da Vercel: `netlify` → **`node-server`**.
- `lightningcss@1.32.0` declarado como devDependency (a mesma versão que já vinha como transitiva).
- **Evidência de equivalência:** `NITRO_PRESET=node-server bun run build` antes e depois → os 91 arquivos de `.output/public/assets` com os **mesmos nomes com hash e os mesmos tamanhos** (JS total 1.754.941 bytes antes e depois; `styles-BOTdZqk7.css` 109.686 e `marketing-DXCFTi6n.css` 25.808 bytes nos dois), `.output/server` com 3.272.994 bytes nos dois.
- DV-01 corrigida: `tests/unit/css-tokens.test.ts` passa a ler o CSS do build mais recente (`.output`, `.vercel` ou `dist`) e a considerar as variáveis declaradas nos outros CSS do build (`marketing-*.css`). No CI, os unitários passam a rodar **depois** do build, para esses testes não ficarem pulados. Resultado: 9 pass, 0 fail.
- `VERCEL=1 bun run build`: pendente — espera terminar o lint da linha de base, que ainda está lendo `.vercel/`.
- **Estado:** implementada; validada localmente (build `node-server`, unitários, E2E — ver o gate).

### T-03.2 — Dependência e resquícios
- `bun remove @lovable.dev/vite-tanstack-config` (sai do `bun.lock` a única entrada do registry privado da Lovable); `bunfig.toml`: `minimumReleaseAgeExcludes = []` (as 6 exceções `@lovable.dev/*` saíram; a guarda de 24 h continua).
- `src/lib/lovable-error-reporting.ts` → `src/lib/error-reporting.ts` (`reportarErro`: console, linha estruturada com boundary, rota e mensagem, sem dado pessoal); `__root.tsx` e `TrailError.tsx` atualizados.
- `git grep -i lovable` fora de `docs/historico`, specs e do comentário explicativo do `vite.config.ts`: nenhuma ocorrência em código. **Estado:** concluída.

### T-03.3 — Netlify, `.gitignore`, ESLint
- `netlify.toml` removido; blocos Wrangler/Cloudflare e Netlify saem do `.gitignore`; entram `.data/` (banco local), `/edição Videos/` e `/Claude outputs/` (D-05, sem apagar as pastas).
- `eslint.config.js` passa a ignorar artefatos de build (`.vercel`, `.netlify`, `.nitro`, `.tanstack`, `public/content`, relatórios do Playwright) e as ferramentas independentes. **`bun run lint` passou de mais de 1 h 30 min para 43 s.**
- **Linha de base real do lint:** 29.081 problemas, dos quais 29.062 são formatação Prettier corrigível automaticamente (dívida conhecida). Sem as regras do Prettier: 3 erros e 17 avisos. Os 3 erros foram corrigidos (`prefer-const` em `src/content/taxonomy/validate.ts:188`; expressão solta em `src/marketing/lib/chrome-dom.ts:46`; `no-empty-pattern` em `tests/e2e/marketing/responsive.spec.ts:15` — mantido o `{}` com exceção comentada, porque o Playwright exige desestruturação no primeiro argumento). Novo script `lint:ci` (sem Prettier): **0 erros, 17 avisos**. A formatação em massa fica no backlog (commit separado, para não misturar com esta iniciativa).
- **Estado:** concluída.

### T-03.4 — Lovable
- O proprietário não tem mais conta (D-04): `.lovable/project.json` removido; o bloco `LOVABLE:BEGIN/END` já tinha saído do `AGENTS.md` novo (T-02.1). **Estado:** concluída.

### T-03.5 — Scripts de marketing
- `scripts/marketing/og-image.ts`: caminhos da landing integrada (`src/marketing/content/copy`, tokens do `:root` de `src/styles.css`, `public/fonts/`, `public/branding/foca/`, saída em `public/og/og-landing.png`). **Executado com sucesso** (`og OK: public/og/og-landing.png 1200x630`, imagem conferida visualmente); a imagem gerada difere em bytes da publicada (35.190 × 33.279), por isso a publicada foi **restaurada** — regenerar a arte não é escopo desta tarefa.
- `scripts/marketing/css-blocks.ts`: caminho do `src/styles.css` corrigido (apontava para fora do repo).
- `scripts/marketing/capturar-telas.ts`: raiz corrigida (`scripts/` → raiz do repo). Execução não verificada (precisa do app rodando e grava retratos em `assets-src/`).
- Scripts `shots` e `og` no `package.json`. **Estado:** concluída (captura: implementada, não executada).

### T-03.6 — README e CI
- `README.md` reescrito (Foca, Bun, verificação, build local, deploy, ferramentas no repo).
- CI: `tsc` → `lint:ci` → `docs:check` → `build` → unitários (depois do build). O validador de skills fica fora do CI porque confere plugins instalados na máquina do Claude; o espelho de skills e a tabela do catálogo são conferidos pelo teste unitário `docs-e-skills.test.ts`. **Estado:** implementada (o CI só roda no GitHub depois de um push, que é decisão do proprietário).

### T-02.7 — `.mcp.json` (feito junto da F03)
- `omniroute@3.8.50`, fixado. A versão mais nova (3.8.51) foi publicada há menos de 24 h e ficaria fora da guarda `minimumReleaseAge` do projeto. **Estado:** concluída.

### T-03.7 — Artefatos locais
- Removidos `dist/` (saída do preset Netlify) e `.tanstack/tmp`. `.netlify/` e `.vercel/output` ficam até o lint antigo terminar (ele ainda os lê). **Estado:** parcial.

### Gate F03 (30/09/2026)
- `bunx tsc --noEmit` ✅ · `bun test tests/unit` **1245 pass, 0 fail** (97 arquivos; os testes de CSS compilado agora rodam) · `bun run lint:ci` 0 erros, 17 avisos · `bun run docs:check` ✅ · `NITRO_PRESET=node-server bun run build` ✅ (saída idêntica à de antes) · `VERCEL=1 bun run build` ✅ (gerou `.vercel/output/functions/__server.func`, Build Output API v3, Nitro 3.0.260603-beta).
- **E2E completo** (`bunx playwright test`, 541 testes): **461 passed, 7 failed, 73 skipped** (os pulados são por desenho). A rodada competiu com outra execução da suíte (a linha de base em segundo plano reusou o mesmo servidor de desenvolvimento, `reuseExistingServer: true`): 3 falhas foram `ENOENT` em `test-results/` (as duas execuções escreviam na mesma pasta) e 3 foram timeouts.
- **Reexecução isolada** dos 4 arquivos com falha (`a11y-dialogs`, `layout`, `placement`, `trail-path`), já com `optimizeDeps.ignoreOutdatedRequests: true` (opção do wrapper antigo, restaurada): **121 passed, 1 failed, 30 skipped**. A falha restante (`a11y-dialogs.spec.ts:107`, primeira navegação a `/trilha` num servidor de desenvolvimento frio: erro de streaming do React no SSR) **também acontece no commit anterior à troca do build** (`92e5963`, conferido num worktree temporário com `bun install --frozen-lockfile`) → preexistente, não é regressão; no build de produção `/trilha` responde 200 com HTML completo. Registrada no backlog B-022.
- A execução da linha de base que ficou em segundo plano (T-00.1) **não vale como evidência**: o lint dela terminou com erro depois de 1 h 40 min porque um arquivo que ele ia ler foi removido no T-03.2; os builds dela já rodaram com a configuração nova; e o E2E dela perdeu o servidor no meio (51 `ERR_CONNECTION_REFUSED`).
