---
estado: em-execucao
atualizado: 2026-09-30
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
| `92e5963` | F01 + F02: reorganização do SDD, instruções e skills para Claude e Codex |
| `8a631c3` | F03: build e repositório sem Lovable e Netlify |
| `acd62df` | F04: fundação do backend (banco, autenticação, sincronização no servidor) |
| (ver `git log -1`) | F05–F07: contas e telas de acesso, guarda de rotas, outbox e motor de sincronização, vínculo do aparelho, importação; skill `foca-backend` (T-06.7) |

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

## F04 — Fundação do backend (30/09/2026)

### T-04.1 — ADRs e documentos-base
- ADRs 0005 (stack) e 0006 (conta e idade); `arquitetura/dados.md`; `seguranca/modelo-de-ameacas.md` (T1–T18, com o estado de cada controle); `seguranca/privacidade.md` v1; `operacao/ambientes-e-deploy.md`. **Estado:** concluída.

### T-04.2 — Prova técnica
- Num projeto isolado no scratchpad (sem tocar o `node_modules` do app), com as versões exatas: better-auth 1.7.6 + @better-auth/drizzle-adapter 1.7.6 + drizzle-orm 0.45.3 + drizzle-kit 0.31.11 + PGlite 0.5.8. Esquema gerado por `npx auth@1.7.6 generate`, migração por `drizzle-kit generate`, aplicada no PGlite. Resultados: cadastro → login antes de verificar **403** → verificação → login **200** com cookie `HttpOnly; SameSite=Lax` → sessão lida; 4ª tentativa de login em 10 s **429**; e-mail inexistente e senha errada com **resposta idêntica**; cadastro repetido responde igual a um novo.
- Não testado na prova: Google, vínculo de contas, Neon (sem credenciais).
- **Estado:** concluída.

### T-04.3 — Banco e migrações
- `src/server/db/schema/{auth,estudo,index}.ts` (17 tabelas; toda tabela de aluno com `ON DELETE CASCADE`; `audit_event` sem FK de propósito), `src/server/db/client.ts` (PGlite `pglite:memoria`/`pglite:<pasta>` com migração automática; Neon por `@neondatabase/serverless` Pool), `drizzle.config.ts`, migração `drizzle/0000_inicial.sql` (revisada: PKs, uniques, checks de plano/UF/nome/XP, FKs em cascata), scripts `db:generate`, `db:migrate`.
- **Estado:** concluída (validada localmente com PGlite; Neon pendente de credencial — T-04.7).

### T-04.4 — Variáveis e segredos
- `src/server/env.ts` (zod; produção sem `DATABASE_URL`, `BETTER_AUTH_SECRET` ou `BETTER_AUTH_URL` não inicia; padrões seguros só em desenvolvimento e teste; e-mail desligado em produção por padrão — D-10).
- Varredura do bundle do navegador depois do build: nenhuma ocorrência de `drizzle-orm`, `@electric-sql/pglite`, `BETTER_AUTH_SECRET`, `drizzleAdapter`, `neondatabase` ou `scrypt` em `.output/public/assets/`. (O teste automatizado dessa varredura fica para o T-12.4.)
- **Estado:** concluída.

### T-04.5 — Convenções de servidor
- `src/server/http.ts`: `ErroApp`, `sessaoAtual`/`exigirSessao` (id só da sessão), `checarOrigem` (CSRF por `Sec-Fetch-Site`/`Origin`), `respostaDeErro` (sem stack), `log` estruturado que omite campos com nome sensível; `src/server/limite.ts`: rate limit atômico em Postgres (tabela `rate_limit`, chaves `foca:`).
- **Estado:** implementada; testes automatizados do CSRF das funções do Foca e do logger ficam para o T-12.4 (o CSRF das rotas do Better Auth foi conferido: origem estranha → **403 `INVALID_ORIGIN`** no build de produção).

### T-04.6 — Infraestrutura de testes
- `tests/unit/servidor/ajuda.ts`: banco PGlite em memória migrado por teste, autenticação real do Foca, caixa de saída de e-mail, `alunoVerificado()`.
- **Estado:** concluída para unitários/integração; o helper de E2E com sessão real vem com as telas (F05).

### T-04.7 — Provisionamento externo
- **Bloqueada:** conta Neon e integração na Vercel dependem do proprietário.

### Divergências e decisões técnicas desta fase
| ID | O quê | Decisão |
|---|---|---|
| DV-08 | Better Auth usa zod 4; o projeto tinha zod 3.25 na raiz e o bundle do servidor resolveu `zod` para ela (`(void 0) is not a function` em `z.looseObject`) | Projeto passa a zod **4.6.5** (a mesma do Better Auth, uma cópia só). Nenhum código antigo do app usava zod; os novos foram ajustados (`z.record(chave, valor)`) |
| DV-09 | PGlite embutido no bundle do servidor não achava seus arquivos `.wasm/.data` | `nitro.traceDeps: ["@electric-sql/pglite*"]` (o pacote vai inteiro para `.output/server/node_modules`). Custo: a função da Vercel leva o PGlite sem usar (31 MB no total; limite 250 MB) |
| DV-10 | Com verificação de e-mail ligada, o Better Auth responde sucesso sintético a qualquer falha de cadastro (anti-enumeração), inclusive à recusa por idade | A regra vale no servidor (conta não é criada nem recebe e-mail — testado); o formulário confere a idade antes de enviar e mostra a mensagem explícita |
| DV-11 | O teste de concorrência roda no PGlite (uma conexão só) | Não exercita `FOR UPDATE` entre conexões diferentes; validar no Neon (ambiente integrado) |

### Evidência (30/09/2026)
- `bunx tsc --noEmit` ✅ · `bun test tests/unit` **1276 pass, 0 fail** (100 arquivos; inclui `servidor/auth.test.ts` 9 testes e `servidor/sincronizar.test.ts` 13 testes contra PGlite real) · `NITRO_PRESET=node-server bun run build` ✅ · `VERCEL=1 bun run build` ✅ (função com 31 MB).
- **Build de produção servido localmente** (`NODE_ENV=production`, PGlite em disco): `/api/saude` **200** `{"ok":true,"banco":"ok"}` (banco criado e migrado na primeira requisição); `/api/auth/ok` **200**; login com senha errada **401** com mensagem genérica; login e cadastro vindos de outra origem **403**.
- Estado de validação: **validado localmente**. Nada validado em ambiente integrado (sem Neon, sem Google, sem Resend).

## F05 — Contas e autenticação (30/09/2026)

### T-05.1 / T-05.2 / T-05.3 — Identidade, Better Auth e e-mail
- `src/server/auth/index.ts`: Better Auth com e-mail e senha verificados (desligável por `AUTH_EMAIL_HABILITADO`), Google quando há credenciais, sessão de 30 dias com renovação diária, redefinição revoga sessões, vínculo de contas sem provedor "confiável", rate limit em banco com regras por rota, cookies seguros em HTTPS, ano de nascimento e versões dos termos como campos do usuário, hook que recusa idade abaixo de `MIN_ACCOUNT_AGE` e aceite fora da versão vigente. Rotas `/api/auth/$` e `/api/saude`.
- `src/server/email/`: envio (memória em teste, arquivo em `.data/emails/` no desenvolvimento, Resend por `fetch` com domínio) e os 4 modelos (verificação, redefinição, conta excluída, consentimento do responsável), revisados com `better-writing` contra `docs/COPY.md`.
- **Estado:** implementado e validado localmente. Produção bloqueada por Resend + domínio (D-10).

### T-05.4 — Telas de acesso
- `/login`, `/cadastro`, `/cadastro/completar` (ano de nascimento e aceite; também o reaceite quando a versão dos documentos muda), `/verificar-email`, `/esqueci-a-senha`, `/redefinir-senha`; `/signup` → `/cadastro`, `/forgot` → `/esqueci-a-senha`. Peças em `src/components/conta/` (rótulo visível, erro por `aria-describedby`, alvos ≥ 44 px). Copy em `COPY.conta` e no inventário (`docs/copy/inventario.md` §2.11). Nenhuma mensagem revela se o e-mail tem conta.
- **Estado:** implementado e validado localmente (`tests/e2e/conta.spec.ts`). **Pendente:** os E2E dos 5 fluxos nos 3 tamanhos (320/390/1280) — hoje rodam só no projeto `chromium`.

### T-05.5 — Sessão no app e área da conta
- `src/lib/api/sessao.ts` (`obterSessao`, leve e sem zod, porque a raiz o importa) e `src/lib/sessao.ts` (cache de 1 min; `destinoSeguro` contra redirecionamento aberto). Seção "Conta" no perfil (`SecaoConta`): e-mail, estado da sincronização, sair, sair de todos os aparelhos.
- **Divergência:** a spec pede `/conta` com perfil editável e lista de sessões; por ora é a seção no `/profile` (sair e sair de todos). Perfil editável e lista de sessões → F09, junto de exportar e excluir.

### T-05.6 — Rotas de estudo exigem conta
- Guarda "negar por padrão" no `beforeLoad` da raiz (`ROTAS_PUBLICAS` em `src/lib/sessao.ts`): sem sessão → `/login?volta=`; sem cadastro completo → `/cadastro/completar`. A raiz continua sem importar store nem AppShell (teste do `45` verde).
- **DV-12 — sem schema v7:** a spec pedia migração v6 → v7 para `account`/`outbox`/`deviceId`. Ficou um campo **opcional** `account` no schema v6 (o padrão do `36`: campo novo opcional não sobe o schema), normalizado na leitura (`normalizarConta`: formato inválido vira "sem conta"). Motivo: não há dado existente a migrar, e um schema novo travaria abas antigas abertas (proteção de versão futura) sem ganho. `authed` continua um indicador local (a landing o lê); quem decide o acesso é a sessão.
- **DV-13 — sessão sem rede:** a guarda consultava o servidor a cada navegação (cache de 1 min); sem rede, a consulta falhava e a tela caía no erro da raiz ("Isso aqui não carregou"). Achado pelo E2E de falha de rede. Correção: sem rede, `sessao()` segue com a última sessão confirmada nesta aba (ou a da primeira carga, que o servidor já validou). É seguro porque a guarda só controla a navegação: toda função de servidor confere a sessão de novo.

### T-05.7 — Google OAuth
- **Bloqueada** (proprietário: projeto no Google Cloud + domínio). O código só liga o Google quando `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` existem.

### T-05.8 — Testes de autenticação
- `tests/unit/servidor/auth.test.ts` (10: cadastro, verificação, senha errada, idade mínima sem criar conta nem e-mail, aceite fora da versão, rate limit ligado em produção mesmo com a chave de desligar, revogação na redefinição, origem cruzada, anti-enumeração) e `tests/e2e/conta.spec.ts` (9).

## F06 — Dados de estudo no servidor e sincronização (30/09/2026)

### T-06.1 / T-06.2 / T-06.3 — Esquema, regras e API
- Tabelas de estudo em `src/server/db/schema/estudo.ts` (FK com cascata em tudo o que é do aluno). Regras puras em `src/lib/recompensas.ts`, a mesma fonte para app e servidor. `src/server/estudo/sincronizar.ts`: correção pelo gabarito (`checkAnswer`), livro de XP com teto por chave, teto diário de 60 atividades pagas, sequência pelos dias, janela de datas, transação com o perfil travado. Funções de servidor em `src/lib/api/estudo.ts` (enviar eventos, obter estado, salvar documento com revisão otimista e limite de 512 KB).
- **Divergência:** a spec nomeia `src/server/estudo/regras.ts`; as regras ficaram em `src/lib/recompensas.ts` (puras, sem dependência de servidor) para o app e o servidor usarem literalmente a mesma função.

### T-06.4 — Outbox no store
- **Um store só.** `src/lib/store.ts` ganhou `account` (`userId`, `outbox`, `docRev`, `docAssinatura`, `aparelhoId`). As ações que já existiam enfileiram eventos: `recordLearningAttempt` (resposta, com a fonte pela origem da tentativa), `completeLesson`/`completeMicroLesson` (lição), `completeJourneyActivity` (atividade, com a `attemptKey` da tentativa), `registrarAulaConcluida`/`registrarLoteFlashcardsConcluido` (bloco) e o bônus de entrada ao vincular. Sem conta vinculada nada é enfileirado. Teto de 1000 eventos. Nenhuma regra pedagógica mudou.
- Motor em `src/lib/sync/motor.ts`, montado pelo `AppShell` via `useContaNoAparelho` (`src/lib/sync/vinculo.ts`): lotes de até 200, espera crescente de 1 s a 5 min, tira da fila o que o servidor aplicou ou recusou, puxa agregado e documento no login, ao voltar à aba, ao reconectar e a cada 5 min. O agregado do servidor (XP, sequência, congelamentos) substitui o local quando a fila está vazia.
- Aviso de sincronização atrasada na seção Conta do perfil.
- **DV-14 — resposta da aula de 60 s em letra:** o `/study` grava a alternativa como letra ("B"), e o contrato leva o índice. Sem conversão, toda resposta certa chegaria ao servidor como "Não sei" (5 XP em vez de 15). O store converte letra → índice (A = 0), na mesma ordem de `questionToExercise`; um teste confere que o banco inteiro está em ordem A–E.
- **DV-15 — respostas de atividade da trilha registradas como `microlicao`:** o `useLearningSession` fixava a origem, então o servidor não acharia as respostas da atividade e recusaria a conclusão (`ATIVIDADE_SEM_RESPOSTAS`). A origem agora segue o `mode` do player (`atividade`/`checkpoint`). Nenhuma regra do app lê essa origem (conferido por busca).
- **DV-16 — E2E antigos com o motor pausado:** os E2E que já existiam usam uma conta de teste compartilhada e semeiam estado local sem conta. Para eles, a sessão de teste leva `foca.sync.pausadaDev=1` (chave lida **só** no servidor de desenvolvimento, `import.meta.env.DEV`) e a pergunta da importação adiada; senão o XP e o documento de um teste entrariam no outro. A sincronização tem E2E próprios, com contas separadas e o motor ligado.

### T-06.5 — Multiaparelho
- Documento de planejamento com revisão otimista: aparelho novo adota o documento do servidor; aparelho com mudança local ainda não salva não é sobrescrito (a próxima gravação daqui vence; fatos e recompensas estão no servidor de qualquer forma). E2E "dois aparelhos".

### T-06.6 / T-06.7
- **Parcial:** isolamento testado em `sincronizar.test.ts` e `importar.test.ts` (A não lê nem altera B). A suíte `isolamento.test.ts` cobrindo **todas** as funções de servidor ainda não existe → pendente, junto de F08/F09, que trazem mais funções.
- **T-06.7 concluída:** skill `foca-backend` em `.agents/skills/foca-backend/` (espelhada em `.claude/skills/`, registrada no `skills-registry.json`, tabela do `SKILLS.md` regenerada) com as convenções que existem no código: molde da função de servidor, recompensas e sincronização, migração, autenticação, testes com duas contas e checklist L2. `node scripts/validate-skills.mjs` → 0 FAIL; a skill aparece nos dois agentes. O critério "uma tarefa seguinte a usa e o registro cita" fica para a F08.

## F07 — Migração do estado local (30/09/2026)

### T-07.1 — Contrato de importação
- `src/lib/sync/importacao.ts` (zod, limites) e `src/server/estudo/importar.ts`: transação única, idempotente por `importId`, correção pelo gabarito, XP recalculado com teto no XP que o aparelho mostrava, datas entre 2026-01-01 e agora, `origin = import`. 7 testes (envio duplo, XP adulterado, gabarito, datas impossíveis, isolamento, lista acima do limite). **Pendente:** teste que interrompa a transação no meio (a transação garante o "tudo ou nada", mas não há teste disso).

### T-07.2 — Vínculo do aparelho
- O estado local pertence a uma conta (`account.userId`). A raiz informa a conta da sessão (`src/lib/conta/usuario-da-sessao.ts`, módulo mínimo, porque a raiz não importa o store) antes de qualquer tela ler o store. Se o estado salvo é de **outra** conta, ele é apagado antes de aparecer, junto dos backups e das cópias corrompidas. Na navegação no cliente (entrar com outra conta com o app aberto), a reconciliação acontece na hora.
- Sair (`logout`) apaga o aparelho inteiro (D-14). Antes, a seção Conta tenta mandar a fila; se algo ficou, pede confirmação ("Sair mesmo assim" / "Continuar na conta").
- Estudo de antes da conta **não** é vinculado em silêncio: vai para a tela de escolha.

### T-07.3 — Tela de escolha
- `/importar-progresso`: resumo (respostas, lições), "Levar para a conta", "Começar do zero" (com confirmação que repete a consequência) e "Decidir depois" (adia por um dia; o estudo segue só no aparelho). Falha de rede mostra o erro e deixa tentar de novo. Axe sem violação séria nem crítica (E2E).

### T-07.4 — Fluxo completo
- `tests/e2e/sync.spec.ts` (8): dois aparelhos; aparelho compartilhado; sair apaga e entrar de novo traz o progresso; sem conexão o estudo fica na fila e sobe quando a conexão volta; sair com fila pendente pede confirmação; importar; começar do zero. **Pendente:** rodar nos 3 projetos Playwright (hoje só `chromium`).

### Evidência F05–F07 (30/09/2026)
- `bunx tsc --noEmit` ✅ · `bun test tests/unit` **1311 pass, 0 fail** (103 arquivos; novos: `store-conta.test.ts` com 27 testes de outbox, vínculo, aparelho compartilhado, agregado, documento, importação e saída) · `bun run lint:ci` 0 erros (17 avisos preexistentes) · `bun run docs:check` ✅ · `bun run build` ✅ · `node scripts/validate-skills.mjs` 0 FAIL.
- **E2E completo** (`bunx playwright test`, servidor de desenvolvimento, PGlite, e-mail em arquivo): **484 passed, 0 failed, 73 skipped** (os mesmos pulados de antes). Uma rodada anterior teve 3 falhas (`audio.spec.ts:9`, `trail-path.spec.ts:230` e `:290` no `narrow`) causadas por edição de código durante a execução (recarga do Vite); as três passaram isoladas e na rodada completa seguinte, sem edição.
- `tests/e2e/sync.spec.ts`: **8/8** (rodado de novo depois do último ajuste — documento com as 200 tentativas mais recentes).
- Estado de validação: **validado localmente**. Não validado em ambiente integrado (Neon, Google, Resend) nem publicado.

## D-15 — Modo de demonstração para publicar sem o backend configurado (30/09/2026)

Pedido do proprietário: publicar na `main` com "um login falso por enquanto". Avisado antes de que, sem banco, segredo e e-mail na Vercel, a versão com contas deixaria a produção sem nenhum jeito de entrar.

- **Servidor:** `env()` não derruba mais o processo quando faltam `DATABASE_URL`, `BETTER_AUTH_SECRET` ou `BETTER_AUTH_URL` num ambiente implantado (build de produção ou qualquer ambiente da Vercel, inclusive preview): liga `contasAtivas = false` (aviso no log com os **nomes** das variáveis). Nesse modo `banco()` recusa (nunca abre PGlite em disco na produção), `sessaoAtual()` devolve `null`, `/api/auth/*` responde 503 `CONTAS_DESLIGADAS` e `/api/saude` responde `{ ok: true, contas: "desligadas" }`.
- **Sessão:** `obterSessao` devolve `modo: "demonstracao"` e considera "entrou" quem tem o cookie `foca_demo=1` (não é credencial: não abre dado nenhum no servidor, e só vale com as contas desligadas).
- **Telas:** `/login` e `/cadastro` viram a entrada local (`EntradaDemonstracao`): texto "Por enquanto, seu progresso fica salvo só neste aparelho." e o botão "Entrar e estudar", sem campo de e-mail nem de senha. A seção Conta mostra o mesmo aviso, esconde "Sair de todos os aparelhos", e "Sair" só encerra a entrada local, **mantendo** o progresso (como antes das contas). O motor de sincronização não faz nada sem conta vinculada.
- **Quando as contas forem ligadas** (as três variáveis na Vercel): nada muda no código. O cookie deixa de valer, a guarda pede o login real, e o progresso local de quem estudou no modo de demonstração cai na tela de importação.
- **Testes:** `auth.test.ts` + 1 (produção sem as variáveis → contas desligadas, `banco()` recusa, sessão nula). **Build de produção servido localmente sem as variáveis** (`NODE_ENV=production`, porta 3100): `/api/saude` 200 `{"ok":true,"contas":"desligadas"}`, `/api/auth/ok` 503, `/` 200, `/trilha` 307 → `/login?volta=%2Ftrilha`; no navegador (Playwright, 390 px): entrada local sem campo de senha → trilha → questão respondida com XP local → recarregar mantém a entrada → Sair volta à landing com o progresso intacto → `/trilha` pede entrar de novo; nenhum erro de página.
- **Regressão depois da D-15:** `bunx tsc --noEmit` ✅ · `bun test tests/unit` **1312 pass, 0 fail** · `bun run lint:ci` 0 erros · `bun run build` ✅ · `VERCEL=1 bun run build` ✅ · `bunx playwright test` **484 passed, 0 failed, 73 skipped** (servidor de desenvolvimento, contas ligadas).
- **Publicação:** `main` avançada (fast-forward) até este commit e enviada ao GitHub a pedido do proprietário ("pode publicar na main"), o que dispara o deploy de produção na Vercel. Estado: **publicado** em modo de demonstração; contas reais **não** validadas em ambiente integrado.

## Retomada documental — divergência do checkpoint (30/09/2026)

- Na conferência exigida pelo `AGENTS.md`, `git status --short` estava limpo, a branch era `producao-46` e o HEAD `2b0584b` (D-16), precedido de `fd1d4da` (D-15). O `ESTADO.md` ainda identificava F05–F07 como último commit e última validação.
- Divergência registrada antes de prosseguir. Reconciliação documental com as evidências de D-15/D-16 deste registro, sem executar novamente nem declarar verdes os testes completos da D-16. Nenhuma implementação iniciada nesta retomada.

## D-16 — Conta só depois das perguntas; "Já tem uma conta? Entrar" no quiz (30/09/2026)

Pedido do proprietário: "a criação de contas viesse somente depois das perguntas do quiz, para ficar melhor pro público, e em cima, no quiz, ter um botãozinho com 'já tem uma conta? entrar'"; e "uma conta de login teste".

- **Antes:** a conta era pedida logo depois dos 9 passos do perfil; o nivelamento (as questões de verdade) e o diagnóstico já exigiam conta.
- **Agora:** `/nivelamento` e `/aha` entraram em `ROTAS_PUBLICAS`; o quiz segue direto para eles. A conta é pedida quando o aluno vai estudar: "Entrar no meu plano" no diagnóstico (`irParaEstudo`, `src/lib/conta/entrada.ts`) e "Começar"/"Pausar e continuar depois" no nivelamento → `/cadastro?volta=/trilha`. No nivelamento a sessão é conferida na montagem e o clique segue síncrono: numa primeira versão, a espera pela sessão no clique deixava o plano ser refeito e a atividade clicada deixava de existir (achado pelo `placement.spec.ts`, corrigido antes do registro). O que foi respondido no onboarding não conta como "estudo de antes da conta" e vai para a conta sem a tela de importação.
- **Topo do quiz:** link "Já tem uma conta? Entrar" → `/login`, no lugar da marca, só para quem ainda não entrou (com sessão, a marca volta). Alvo ≥ 44 px.
- **Conta de teste:** `bun run conta:teste` (`scripts/dev/criar-conta-teste.ts`) cria `teste@foca.dev` / `foca-teste-123` no banco **local**, pela API real; recusa qualquer endereço que não seja `localhost`. Rodado: criou a conta, a segunda execução confirmou o login, e `FOCA_URL=https://exemplo.com` foi recusado. Em produção (modo de demonstração) não há conta: "Entrar e estudar" basta.
- **Testes:** `conta.spec.ts` + 2 (link do quiz leva ao login; quiz → diagnóstico sem conta → "Entrar no meu plano" → `/cadastro?volta=%2Ftrilha`). `conta` + `onboarding` + `placement`: 37/37.
- **Regressão:** `bun test tests/unit` 1312 pass / 0 fail · `bun run lint:ci` 0 erros · `bun run build` ✅ · `bunx tsc --noEmit` ✅ · `bunx playwright test` **483 passed, 3 failed, 73 skipped**. As 3 falhas: `brand.spec.ts:55` procurava "Entrar no meu plano" como **link** (agora é botão, porque confere a sessão antes de seguir) → teste ajustado, `brand.spec.ts` 8/8; `marketing/motion.spec.ts` (lp-tablet `:41`, lp-wide `:74`) passaram isoladas (22/22), a mesma instabilidade de carga da landing já vista antes.

## D-19 — Preservar o bordão e preparar a próxima seleção de escopo (30/09/2026)

- Pedido explícito: manter "60 segundos" como bordão e atualizar o SDD; receber recomendações antes do prompt para o Opus planejar e executar.
- Decisão aplicada na spec (§0 e T-10.2), no B-051 e nos guias COPY, copy/01 e copy/06. O aceite deixou de exigir ausência da expressão. Promessas funcionais falsas continuam no escopo de revisão; nenhuma string do app foi alterada.
- ESTADO reconciliado com o Git e as evidências já registradas; preparação do prompt anotada. Projeto Neon informado: billowing-bread-71576526, branch solicitada production. Nenhum login, instalação, migração ou deploy executado nesta tarefa. A compatibilidade de Neon Auth gerenciado com a ADR 0005 deve ser resolvida no plano; as melhorias adicionais aguardam seleção do proprietário.
- Validação documental: `bun run docs:check` → "nenhum link ou caminho quebrado"; `git diff --check` sem erro de whitespace. Revisão do diff: bordão preservado na decisão e no aceite, backlog coerente, histórico de testes distinguido da revisão atual. Sem mudança de código, não foram reexecutados tipos, unitários, E2E ou build. Estado: documentação atualizada localmente; sem commit, push ou publicação.

## D-20 — Landing começa pelo quiz (30/09/2026)

- Pedido do proprietário: o link da landing estava levando ao login; deve começar pelo quiz e pedir conta somente no final. Critérios registrados na spec antes de alterar o código.
- Causa reproduzida: `authed: true` e `onboarded: true` antigos no localStorage faziam `useContaNoAparelho` trocar todos os CTAs por "Continuar estudando" → `/app`; sem sessão, `/app` levava ao login. E2E novo antes da correção: expected `/quiz`, received `/app`.
- Correção: CTAs de começar sempre `/quiz`; link separado "Entrar" permanece `/login`. Removidos o hook de leitura do storage e o rótulo condicional. `/app` mantém o comportamento de entrada do PWA. Contrato C-WEB-1 e inventário de copy atualizados. D-16 preservada (nivelamento/diagnóstico antes do cadastro).
- E2E: `bunx playwright test tests/e2e/marketing/landing.spec.ts tests/e2e/marketing/demo.spec.ts tests/e2e/conta.spec.ts tests/e2e/onboarding.spec.ts tests/e2e/placement.spec.ts --project=lp-narrow --project=lp-mobile --project=lp-desktop --project=chromium --workers=2` → **87 passed, 0 failed, 1 skipped** (3,5 min; caso de barra mobile não aplicável no desktop). Cliques reais com aparelho novo/flags legadas em 320/390/1280; landing → quiz → diagnóstico → cadastro; nivelamento e conta reais locais. Há aviso React durante testes de nivelamento, fora do código alterado; nenhuma falha nesses testes. Não é uma execução de toda a suíte E2E do repositório.
- Gates: `bunx tsc --noEmit` ✅; `bun run build` ✅; `bun run lint:ci` **0 erros, 17 avisos**; `bun run docs:check` ✅. Baseline unitária 1312/0; primeira execução após a mudança 1311/1 por expectativa antiga de `/app` em `marketing/app-url.test.ts`, atualizada para D-20. **Rodada final `bun test tests/unit`: 1312 pass, 0 fail, 9127 expect() calls, 102 arquivos (64,19 s).**
- Revisão L1 e web-design-guidelines sobre o diff: navegação continua por Link, sem novo estado, dependência, dado pessoal, segredo ou alteração de conteúdo pedagógico; raiz e routeTree gerado intactos, landing sem store/AppShell. `spec-verifier` confirmou critérios D-20 e preservação do code splitting; resultado final do fluxo até cadastro confirmado pelo log E2E após a revisão.
- Estado: validado localmente, sem commit, push ou deploy. Nenhuma integração Neon/produção validada nesta correção. A seleção das melhorias e o prompt para o Opus continuam pendentes da escolha do proprietário.
