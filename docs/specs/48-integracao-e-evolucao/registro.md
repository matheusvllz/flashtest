---
estado: em-execucao
atualizado: 2026-09-30
iniciativa: 48
---

# 48 — Integração com o Neon e evolução do produto: registro de execução

> O que de fato aconteceu. Estados de validação: **implementado** · **validado localmente** · **validado em ambiente integrado** · **publicado**.

## Linha de base (30/09/2026)

- Branch `producao-46`, HEAD `2b0584b`. Working tree com D-19/D-20 e trabalho da `automacao-instagram/` não commitados (preservados, não tocados). `ESTADO.md` confere com o Git.
- Última suíte completa verde registrada: D-15 (46). Rodada direcionada D-20: 87 passed. Unitários 1312/0.

## Inspeção do estado real (30/09/2026)

| Item | Fato verificado | Como |
|---|---|---|
| Projeto Neon | `billowing-bread-71576526` ("foca"), `aws-sa-east-1`, Postgres 18, retenção de histórico 6 h, sem lista de IPs, criado 30/09 22:52 UTC; uma branch, `production` (padrão, **não protegida**, vazia) | `neon projects get`, `neon branches list` (somente leitura) |
| Produção | `https://focaedu.com` → **308** → `https://www.focaedu.com/`; `/`, `/quiz`, `/login` 200; **`/api/saude`, `/api/auth/ok`, `/trilha` 500** (página "Isso aqui não carregou") | `curl` |
| Deploy em produção | `fd1d4da` (D-15), 30/09 09:47 UTC | GitHub Deployments API |
| DNS | Cloudflare; apex A → Vercel; `www` CNAME → Vercel; **sem MX, SPF, DMARC ou DKIM da Resend** | `nslookup` (8.8.8.8) |
| Vercel CLI | Não instalada, sem token: variáveis e logs da Vercel não são visíveis daqui | — |

### Causa do 500 em produção (DV48-01)

- O mesmo build (`VERCEL=1 bun run build`), executado localmente pelo handler da função (`.vercel/output/functions/__server.func/index.mjs`) com `NODE_ENV=production VERCEL_ENV=production`:
  - sem variáveis: `/api/saude` 200 `{"ok":true,"contas":"desligadas"}`, `/api/auth/ok` 503, `/trilha` 307 → `/login?volta=%2Ftrilha` (correto);
  - com `DATABASE_URL` da branch `dev` (como a integração Neon faria): igual, contas desligadas;
  - com `BETTER_AUTH_URL=focaedu.com`: **500** nas três, `Error: [env] variáveis de ambiente inválidas — BETTER_AUTH_URL: Invalid URL`;
  - com `OPENAI_API_KEY=` (vazia): **500**, `OPENAI_API_KEY: Too small`.
- Conclusão: alguma variável da Vercel de produção está vazia ou inválida, e `env()` derruba toda função. Qual delas não dá para saber sem o painel. Correção de código no T-48.0.3; publicar depende do proprietário.

## Por tarefa

### T-48.0.1 — Spec, registro e painel
- **Feito:** `spec.md` (decisões D48-01…D48-16, tarefas, dependências, critérios), este registro, `specs/README.md` (48 ativa; próximo livre 49), `ESTADO.md`, backlog.

### T-48.0.2 — Ferramentas Neon
- **CLI:** `bun add -g neon@7.0.1` (global, fora do repositório). `neon auth` (login no navegador, feito pelo proprietário) → perfil `DEFAULT` com conta, credenciais em `~/.config/neon/credentials.json` (fora do repo).
- **Skills (pedido do proprietário, seguindo `https://neon.com/.well-known/agent-skills/neon/SKILL.md`):** não havia nenhuma skill nem MCP da Neon no projeto. `neon skills -s neon -s neon-postgres -s neon-postgres-branches --agent claude-code --agent codex -y` → `.agents/skills/{neon,neon-postgres,neon-postgres-branches}` + 3 entradas no `skills-lock.json`. A CLI criou **symlinks absolutos** em `.claude/skills/`; trocados por cópia com `bun scripts/agents/sincronizar-skills.ts` (convenção do projeto). Entradas `neon` e `neon-mcp` no `skills-registry.json` (commit upstream `b8250e6`), tabela do `SKILLS.md` regenerada, seção "T. Neon" escrita. `neon-auth`, `neon-functions`, `neon-object-storage` e `neon-ai-gateway` **não** instaladas (D48-01, D48-02).
- **MCP:** `neon mcp --oauth --project --agent claude-code --agent codex --project-id billowing-bread-71576526 -y` → servidor `Neon` (`https://mcp.neon.tech/mcp?projectId=billowing-bread-71576526`) em `.mcp.json` (o `omniroute` foi preservado; só a formatação do arquivo mudou) e em `.codex/config.toml` (novo). Sem chave no repositório; o login acontece no cliente MCP no primeiro uso.
- **Branch `dev`:** `neon branches create --name dev --parent production` → `br-square-surf-b6syp33y`, endpoint `read_write` em `aws-sa-east-1`. Conexões (pooled e direta) gravadas só em `.env.neon-dev` (ignorado pelo Git, conferido com `git check-ignore`), nunca impressas.
- **Não executados, de propósito:** `neon config init`, `neon.ts` com `auth: true` e `neon deploy` (D48-01/D48-02); `neon link` (puxaria o `.env` de production para o diretório).
- **Evidência:** `node scripts/validate-skills.mjs` → `OK — 0 FAIL, 3 warn` (avisos preexistentes de claude-mem e nome duplicado); `bun scripts/agents/tabela-skills.ts --checar` → em dia; `bun run docs:check` → nenhum link quebrado.

### T-48.0.3 — Ambiente que não derruba o app (L2)
- **Feito:** `src/server/env.ts` lê só as chaves do esquema, com espaços removidos e vazio como ausente. Num ambiente implantado, campo inválido é descartado com `console.warn("[env] variáveis inválidas ignoradas: <nomes>")` (nunca o valor) e o resto segue; variável de conta ausente ou inválida desliga as contas (modo de demonstração). Em desenvolvimento, inválida continua sendo erro claro. Campo novo `variaveisInvalidas`. `BETTER_AUTH_URL` sem barra no fim.
- **Evidência:** teste escrito antes (vermelho: 1 pass / 6 fail), depois `tests/unit/servidor/env.test.ts` **8 pass**; `auth.test.ts` verde. Build `VERCEL=1 bun run build` + handler da função executado localmente: `BETTER_AUTH_URL=focaedu.com` e `OPENAI_API_KEY=` (vazia), que antes davam **500** nas três rotas, agora dão `/api/saude` 200 `{"ok":true,"contas":"desligadas"}`, `/api/auth/ok` 503, `/trilha` 307 → `/login?volta=%2Ftrilha`.
- **Estado de validação:** validado localmente (build `vercel`). **Não publicado:** a produção continua com 500 até um deploy (pedido do proprietário) **ou** até a variável inválida ser corrigida no painel da Vercel.
- **L2:** nenhum valor de variável em log ou resposta; `/api/saude` não revela quais variáveis faltam.

### T-48.0.4 — Migrações e suíte no Neon `dev` (L2)
- **Feito:** `scripts/db/neon.ts` (`plano`, `verificar`, `migrar`, `testar`; conexão obtida da CLI e nunca impressa; `production` exige `--confirmar-producao`; não apaga nada); `bancoDeTeste(url?)` e `ambiente(url?)` aceitam um Postgres real; `tests/neon/integracao.test.ts` (6 testes, fora de `tests/unit`, pulam sem `FOCA_TESTE_NEON_URL`); scripts `db:neon` e `test:neon`; `scripts/db/resetar-local.ts` (DV48-02: o `db:reset:local` do `package.json` apontava para um arquivo inexistente; só apaga `.data/pglite`, recusa banco remoto — criado, não executado).
- **Evidência:**
  - `bun scripts/db/neon.ts plano --branch dev` → `0000_inicial`; `migrar --branch production` → `recusado: … exige --confirmar-producao` (exit 2).
  - `migrar --branch dev` → `aplicadas 0000_inicial`; `verificar --branch dev` → `Postgres 18.6`, `migrações aplicadas: 1/1`, 17 tabelas (`account, ai_budget, ai_usage, attempt, audit_event, completion, consent, data_import, learning_doc, legal_acceptance, profile, rate_limit, session, study_day, user, verification, xp_ledger`).
  - `bun scripts/db/neon.ts testar` → branch `teste-20261001002001` (filha de `dev`, expira 02:20 UTC) → **6 pass, 0 fail** (20,8 s): tabelas, cadastro → verificação → login → sessão com o Better Auth sobre o Neon, isolamento A/B, 6 envios paralelos do mesmo aluno (XP 15, não 90), teto diário com 6 lotes paralelos (≤ 60 pagas), importação idempotente. Isso fecha a 46 DV-11 (concorrência entre conexões reais).
  - Sem a variável, `bun test tests/neon` → todos pulados (não entra no CI por acidente).
- **Estado de validação:** **validado em ambiente integrado** (Neon `dev`/branch temporária). `production` intocada.

### T-48.0.5 — Domínio e URLs
- **Feito:** `origensConfiaveis()` (apex + `www` do mesmo domínio + `AUTH_TRUSTED_ORIGINS` válidas) usado no Better Auth; `vercel.json` `regions: ["gru1"]`; `SITE_URL` padrão `https://focaedu.com` no build de produção (sem `VITE_SITE_URL`); `public/sitemap.xml` e linha `Sitemap:` no `robots.txt`; `docs/operacao/ambientes-e-deploy.md` reescrito nas partes de ambiente, variáveis, migração, domínio/e-mail/OAuth (estado verificado) e lista por ambiente; 46 D-10 anotada como resolvida (compra do domínio), mantida como histórico.
- **Evidência:** `env.test.ts` + teste de origens (apex↔www, extra válida, extra malformada ignorada, localhost sem irmã); `tests/unit/marketing` verde; `bun run docs:check` verde.
- **Pendências (proprietário):** domínio primário na Vercel (hoje `www`); Resend; caixas de correio; Google OAuth (§6 do `ambientes-e-deploy.md`).

### Checkpoint F0 (30/09/2026)
- `bunx tsc --noEmit` ✅ · `bun test tests/unit` **1320 pass, 0 fail** (103 arquivos) · ESLint nos arquivos novos sem erro · `docs:check` ✅ · `validate-skills` 0 FAIL.

## F1 — Pendências da 46 (F05–F07)

### T-48.1.1 — Isolamento de todas as funções de servidor (L2)
- **Feito:** a lógica que estava embutida em quatro handlers foi para `src/server/` (o molde da skill `foca-backend`): `estudo/documento.ts` (`estadoDoAluno`, `salvarDocumentoDoAluno`) e `conta/dados.ts` (`exportarDadosDoAluno`, `focaIALigada`, `gravarFocaIA`); os handlers só chamam. `tests/unit/servidor/isolamento.test.ts`: (1) inventário de **todas** as `createServerFn` de `src/` (12) com a prova de cada uma — função nova sem linha faz o teste falhar; (2) regra estática: quem abre o banco tira o aluno de `exigirSessao`/`sessaoAtual` e nenhum contrato de entrada tem `userId`; (3) duas contas: eventos, documento (B não lê, não sobrescreve, o conflito só revela a revisão de B), importação, perfil, exportação (a de A não contém e-mail, id nem documento de B), preferência da Foca IA e contexto do tutor (o desempenho de B não aparece no prompt de A).
- **Evidência:** `bun test tests/unit/servidor/isolamento.test.ts` → **9 pass**.
- **Estado:** validado localmente (PGlite). Isolamento com conexões reais também no `tests/neon` (A/B).

### T-48.1.2 — Importação interrompida
- **Feito:** teste com um banco que derruba a transação na 4ª escrita (depois de já ter gravado respostas dentro dela): nada fica gravado (XP 0, nenhum dia); repetir com o banco normal aplica tudo uma vez; uma terceira vez é "repetida".
- **Evidência:** `tests/unit/servidor/importar.test.ts` → **8 pass**.

## F2 — Foca IA em produção (46 F08)

Skills: `foca-backend` (molde, checklist L2), `better-writing` (estados e erros), revisão L2 por subagente somente leitura.

### T-48.2.1 — Histórico (B-102)
- **Feito:** `mensagensParaEnviar` (últimas 20, começando pelo aluno) no cliente e no servidor; o zod recusa mais de 20; o store guarda 40 (`pushTutorMessage` apara; `normalizarMensagensDoTutor` apara e filtra o que vem do `localStorage`, inclusive de outra aba). Constante do store conferida contra a do contrato por teste.
- **Evidência:** `tutor-validation.test.ts` (conversa de 61 mensagens vira pedido válido de ≤ 20); `tutor-store.test.ts` (300 mensagens → 40; histórico malformado aparado); E2E `tutor.spec.ts` "B-102": 300 mensagens semeadas no aparelho → o tutor responde, nenhum aviso de falha, o aparelho fica com 40 e o pedido não leva a mensagem mais antiga.

### T-48.2.2 — Sessão, idade e consentimento (L2)
- **Feito:** `askTutor` (`src/lib/tutor.ts`) confere origem, sessão e limite de 10/min; `responderTutor` exige sessão (sem ela, `sem-sessao`, equivalente ao 401) e, abaixo de `TUTOR_IDADE_SEM_CONSENTIMENTO` (18), consentimento `responsavel_foca_ia` concedido e não revogado (sem ele, `consentimento`, equivalente ao 403). Sem ano conhecido, trata como menor. Modo de demonstração: resposta local, nunca a OpenAI.
- **Pendente (DV48-03):** o **fluxo de pedir a autorização ao responsável** (e-mail ao responsável, página de autorização, registro em `consent`) é a 46 T-11.4 e depende do e-mail em produção (D48-06) e da revisão jurídica do texto. Hoje o aluno de 17 anos vê o aviso honesto de que o pedido ainda não está disponível.
- **Evidência:** `tutor.test.ts` "acesso": sem sessão, 17 sem e com consentimento, consentimento revogado, consentimento de A não vale para B, 18+, desligado.

### T-48.2.3 — Contexto no servidor (L2; B-101)
- **Feito:** contrato `src/lib/tutor-contrato.ts` (mensagens, `foco` com `itemId`/resposta crua/ordem exibida, `modo`, `foto`); `context`/`pedagogy`/`image` antigos descartados pelo zod. `src/server/tutor/contexto.ts`: questão resolvida pelo índice de conteúdo com correção recalculada (`checkAnswer`), ordem exibida só se for permutação dos blocos reais, rótulo de matéria pelo item, perfil do banco **sem o primeiro nome** (46 D-18) e saneado/entre aspas (revisão L2), desempenho contado no banco (30 dias) e sequência pelo agregado oficial, contexto pedagógico com `buildPedagogicalContext` sobre o documento sincronizado (sem a ordem exibida guardada no documento). O foco do balão passou a carregar `itemId`, resposta crua e ordem exibida (`focusFromExercise`, `/study` com letra → índice como na DV-14, `LessonPlayer` com o id do exercício da trilha). O núcleo da chamada foi para `src/server/tutor/ia.ts` (protegido pelo `importProtection`) e devolve o `usage`.
- **Evidência:** `tutor.test.ts` "contexto": enunciado do conteúdo no prompt, "ACERTOU"/"ERROU" pelo gabarito, campo hostil do cliente não aparece, sem "O aluno se chama", item inexistente não quebra, 60 mensagens → ≤ 20 para a IA. `tests/unit/brand-voice.test.ts` verde (suíte completa).

### T-48.2.4 — Cotas e teto (L2)
- **Feito:** `src/server/tutor/cota.ts`: leitura sem trava antes da moderação (`cotaDisponivel`), reserva em transação com o perfil travado (`for update`), grátis 3/dia com foto contando como mensagem, pro 20 + 5 fotos, teto global diário pelo `usage` e preço configurável (`AI_PRECO_ENTRADA_USD_MTOK` = 1, `AI_PRECO_SAIDA_USD_MTOK` = 8 — **padrões conservadores e provisórios**, a confirmar pelo proprietário na tabela de preços da OpenAI). Falha técnica: custo real (se a API devolveu o uso) ou estimado entra no teto; a cota volta no máximo 3 vezes por dia por aluno.
- **Evidência:** `tutor.test.ts` "cotas": 3/dia e a 4ª `limite`, foto conta, 6 simultâneos com cota 3 → 3, teto atingido → `indisponivel` sem IA, custo em `ai_usage` e `ai_budget`, falha devolve, sem chave não gasta, cota por aluno. **No Neon (conexões reais):** 8 reservas simultâneas com cota 3 → exatamente 3 (`tests/neon`, 7 pass).

### T-48.2.5 — Foto (L2; B-103)
- **Feito:** `src/lib/tutor-foto.ts` comprime no cliente (lado maior 1.600 px, JPEG 0,8, cai para 0,6/0,45 se passar de 2 MiB; aceita até 15 MB brutos; fundo branco para PNG transparente). `src/server/tutor/imagem.ts`: base64 válido, ≤ 2 MiB depois de decodificar, tipo pelos bytes mágicos igual ao declarado.
- **Evidência:** `tutor.test.ts` "foto": texto disfarçado de JPEG e PNG declarado como JPEG recusados sem chamar a IA.

### T-48.2.6 — Salvaguardas (L2)
- **Feito:** `src/server/tutor/moderacao.ts`: sinal local de autolesão em português **antes de tudo, inclusive no modo de demonstração** (achado da revisão L2), depois `omni-moderation-latest` (texto e foto); autolesão → `COPY.tutor.autocuidado` (CVV 188, chat em cvv.org.br, SAMU 192) sem IA e sem gastar cota; outra categoria → `recusado`. Aviso de IA sempre visível no painel. "Foca IA ligada/desligada" na seção Conta do perfil (`profile.tutor_desligado`, funções `preferenciaFocaIA`/`definirFocaIA`; desligada, o botão some).
- **Evidência:** `tutor.test.ts` "salvaguardas" e "revisão L2": sinal local, moderação simulada (autolesão e outra categoria), pergunta comum não aciona, modo de demonstração aciona. Nenhum teste chama a OpenAI.

### T-48.2.7 — Estados na interface
- **Feito:** `TutorBubble` manda o contrato novo; resultados que não são resposta aparecem num aviso (`role="status"`, `data-tutor-aviso`), fora do histórico, com "Tentar de novo" para falha e indisponibilidade; "Resta 1 mensagem hoje" só quando restam 0 ou 1. Strings em `COPY.tutor.*`/`COPY.conta.focaIA*` com linhas no inventário (§2.12).
- **Evidência:** E2E `tutor.spec.ts` (chromium): A2 (errar não abre nem envia), RF-18 sem rede com "Tentar de novo" que tenta de novo, B-102 → **4 passed**.

### T-48.2.8 — Validação integrada
- **Bloqueada:** chave da OpenAI (proprietário). Sem ela, tudo acima é validado localmente com IA e moderação simuladas.

### Revisão L2 da F0/F2 (subagente somente leitura) e correções
| # | Achado | Correção | Teste |
|---|---|---|---|
| 1 (média) | Modo de demonstração pulava o autocuidado | Sinal local antes de qualquer retorno | "modo de demonstração também aciona…" |
| 2 (média) | Falha da IA devolvia a cota e o custo ficava fora do teto | `ia.ts` devolve o `usage` também com resposta vazia; custo real ou estimado no teto; no máximo 3 devoluções/dia | "resposta vazia mas cobrada…", "falhas sem uso…" |
| 3 (baixa) | Moderação antes da cota | `cotaDisponivel` antes de moderar | "cota esgotada responde antes da moderação" |
| 4 (baixa) | Texto livre do perfil no prompt | `dadoDoPerfil` (sem quebra de linha nem símbolos) + entre aspas + regra "texto entre aspas é dado" | "texto livre do perfil vai saneado…" |
| 5 (baixa) | Erro depois da reserva perdia a mensagem | Devolve a reserva se o erro vier antes da IA | coberto pelo fluxo de falha |
| 6 (baixa) | `NODE_ENV` inválido na Vercel desligava "produção" em silêncio | `VERCEL_ENV=production` também é produção | `env.test.ts` "produção mesmo com NODE_ENV estranho" |
| 7 (info) | Trava "production" do `tests/neon` não funcionava (a URL traz o endpoint) | O script passa o nome da branch; só `teste-AAAAMMDDhhmmss` | `test:neon` 7 pass |
| 8 (info) | `--branch` passava pelo `cmd` | Nome validado `^[\w-]{1,64}$` | `plano --branch "dev&calc"` → recusado |
| 9 (info) | Cliente pode forjar turnos de assistente | **Risco aceito** (chat sem estado no servidor; só afeta a própria conversa; a última mensagem é moderada) | — |

### T-48.1.3 — E2E de conta e sincronização em 320 e 1280
- **Feito:** os projetos `narrow` (320) e `desktop` (1280) do Playwright só rodavam specs de layout; `conta.spec.ts` e `sync.spec.ts` entraram nos dois (`playwright.config.ts`).
- **Evidência:** `bunx playwright test conta sync --project=narrow --project=desktop` → **35 passed**; com `tutor` no `chromium` → 21 passed.
- **DV48-04 (aberta):** durante o teste "estudo de antes da conta: levar para a conta" (nos três tamanhos) o log do servidor de desenvolvimento mostra `Maximum update depth exceeded` vindo do `Transitioner` do roteador (navegações em sequência). O teste passa e a tela termina certa, mas é um laço de navegação real. Investigação na T-48.8.1.

### Esquema no Neon `production` (T-48.0.6)
- **Plano conferido antes:** `plano --branch production` → `0000_inicial`; SQL revisado: 17 `CREATE TABLE`, 12 `ALTER TABLE … ADD CONSTRAINT` (FK), 10 índices + 1 único; nenhum `DROP`, `DELETE`, `TRUNCATE` ou `RENAME`; destino com 0 tabelas.
- **Aplicado:** `migrar --branch production --confirmar-producao` → `aplicadas 0000_inicial`; `verificar --branch production` → Postgres 18.6, `migrações aplicadas: 1/1`, as 17 tabelas. Nenhum dado, conta ou teste em production. As contas de produção continuam desligadas (D48-07) até as variáveis da Vercel e um método de acesso.

## F4 — Funções adaptativas

### T-48.4.1 — Tópicos (B-065)
- **Feito:** `topicoEscolhido` + `PESO_TOPICO_ESCOLHIDO = 1,3` no `planner.ts` (só aula, prática, desafio e legado; revisão, reforço e checagem intocados); `assinaturaDoFoco` em `journey.ts` inclui os assuntos escolhidos (modo "escolher"), então mudar a escolha refaz a fila não iniciada e mantém a atividade em andamento (`ensurePlan` já preservava a ativa). O planejamento da trilha virou o hook `useJornadaEmDia` (usado pela trilha e pelo plano — um planejador só). `/topics` com strings em `COPY.topicos`, efeito explicado por modo, aviso de que a atividade começada não muda, `aria-pressed`/`radio`, estado vazio que aponta para a seção da própria tela (antes mandava ao `/quiz`). As escolhas já viajam no `learning_doc` (prefs).
- **Evidência:** `tests/unit/topicos-planejamento.test.ts` **6 pass** (assunto escolhido aparece mais cedo e não menos vezes; "recomendar"/"pular" ignoram; revisão devida continua na frente; assinatura muda com a escolha e não muda sem ela); planejador, jornada e pontuação existentes: 69 pass; E2E `plano-topicos.spec.ts` (escolher → efeito explicado → assinatura persistida com `|t:mat=prob`).

### T-48.4.2 — Plano (B-066)
- **Feito:** `/plan` é uma visão do plano do motor: atividade atual (a ativa ou `committed[0]`) com título, matéria, minutos, motivo e o mesmo link da trilha (`hrefForActivity` + `startJourneyActivity` quando é aula/legado); fila na ordem do motor; feitas hoje pelo `journey.history`; meta do dia (blocos, R-GAM-4 — a meta tem função: é o anel da trilha); semana real; prioridades reais (sem o "Matemática, Física, Português" de enfeite) com link para `/topics`. Removidos "N aulas de 60s, montadas pelas suas lacunas", "5 flashcards", "1 videoaula" e o link para `/study`. Desktop em duas colunas.
- **Evidência:** E2E `plano-topicos.spec.ts` nos três tamanhos: nenhum texto fixo antigo, a primeira atividade é a mesma da trilha, fila não vazia, sem rolagem horizontal, o CTA abre `/atividade|/learn|/redacao` → **7 passed** (com tópicos).

### T-48.4.3 — Diagnóstico (B-068)
- **Feito:** `/aha` deixou de mostrar "3 lacunas" com selo de severidade e barra de "severidade" (vinham de `computeGaps` sobre o perfil). Agora: "Medido no nivelamento" (cartões de faixa do resultado do nivelamento) só se o nivelamento foi aplicado; "O que você contou" (matérias declaradas) rotulado como declaração; para quem pulou, a frase honesta e "Fazer o nivelamento agora". A sequência "Dia 1" inventada (`streak || 1`) saiu. A fala da Foca no slot `aha` ("Três lacunas. Achei em 40 segundos.") foi trocada por falas que não afirmam medição (sem skill de escrita, `voz.ts`). A sugestão do tutor "Quais são minhas lacunas?" virou "Por onde eu começo?".
- **Evidência:** E2E `diagnostico.spec.ts` (sem nivelamento: nenhum "Lacuna/Severidade/Três lacunas", declaração rotulada, link de nivelamento; com nivelamento: medida, a confirmar e não medida distintas, sem `%` nem θ) → 2 passed; `onboarding`, `brand`, `placement` verdes (34 + 11).

## F5 — Resultados

### T-48.5.1 — Resultado da checagem (B-069)
- **Feito:** `resultadoDaChecagem` (regra D48-13) em `checkpoint.ts`; retrato do Domínio antes da primeira resposta guardado uma vez na atividade em andamento (`masteryAntes`, campo opcional; `guardarDominioAntesDaChecagem`); `CheckpointResult.tsx` (linha por habilidade, rótulo em texto + ícone de forma diferente, frase do que muda: revisão amanhã / desafio liberado / segue igual, XP, um CTA); `MicroLessonPlayer` aceita `conclusao` (tela própria); "Checkpoint" virou "Checagem" na tela.
- **Evidência:** `adaptive-checkpoint.test.ts` +3 (Subiu/Firme/Vale revisar; superestimada → revisão amanhã; subestimada → desafio; sem retrato não inventa "Subiu") → 8 pass; E2E `checkpoint.spec.ts` (tela "Checagem feita", linha "revisar" quando houve superestimação, frase "A revisão de … vem amanhã.", sem `%`, Continuar → trilha) + `journey-start.spec.ts` → **33 passed**.
- **Contrato:** C-CKP-5 muda (a tela dedicada existe) — atualizado em `contratos.md`.

### T-48.5.2 — Resultado visual do nivelamento (B-070)
- **Achado:** o indicador de 3 segmentos já existia (o B-070 dizia "só texto"). Faltava distinguir os estados por forma: agora **medida** = segmento cheio; **evidência insuficiente** = segmento listrado + "(a confirmar)"; **não medida** = cartão com selo "Não medida" e segmentos tracejados (antes, só uma frase). Legenda das faixas uma vez por tela. `aria-label` por área mantido.
- **Evidência:** `placement.spec.ts` atualizado ao contrato novo (4 cartões, estados por `data-estado`) → **11 passed**; captura em 390 conferida.

## F6 — Sequência

### T-48.6.1 — Foguinho e proteção (D48-14)
- **Feito:** token `--brasa` (#d9480f claro, 3,9:1 sobre o fundo; #ff8a3d escuro, ≥ 6,2:1) em `:root`/`.dark` com `--color-brasa` no `@theme inline`; `IndicadorSequencia.tsx` no topo da trilha (fogo laranja estático — cheio se já estudou hoje —, "N dias", escudo com as proteções); ao tocar, folha com dias, hoje, proteções "N de 2", dia coberto por proteção (últimos 7 dias), como funciona, recorde como meta depois de pausa e a fonte dos números ("Confirmado com a sua conta" / "Atualizando com a sua conta" / "Contado neste aparelho"). Regra: `diaProtegido` em `recompensas.ts` (mesma função no app e no servidor) e no agregado da sincronização (campo aditivo); `sequenciaConfirmadaEm` marcado quando o servidor confirma. Nenhuma regra de ganho ou perda mudou; sem animação; nenhum texto de perda.
- **Evidência:** `recompensas.test.ts` +3 (dia protegido, dois dias parados não registram, virada de mês/ano) e suítes de recompensa/sincronização → 69 pass; `indicador-sequencia.test.ts` **6 pass** (fonte honesta dos números, proteção recente, volta depois de pausa); E2E `sequencia.spec.ts` + `trail-home.spec.ts` em 390 e 320 → **7 passed**.

## F7 — Desktop

### T-48.7.1 — Telas secundárias (B-074)
- **Feito:** `layout="wide"` + `desk-split` (o painel de contexto fica à direita e preso ao rolar; no celular, a ordem de sempre): plano (fila à esquerda; meta, semana e prioridades à direita), tópicos (assuntos em grade de 2 colunas; prioridades e modo à direita), flashcards (cartão maior no centro, filtros à direita, avaliação em uma linha do "Não lembrei" ao "Fácil"), redação (trilhas em 2 colunas; resumo e "continuar" à direita), ranking (lista à esquerda; posição à direita). No ranking, o aviso "Turma de demonstração: os outros nomes são fictícios" saiu do rodapé para junto da posição; nenhum dado novo.
- **Evidência:** capturas reais em 320, 390 e 1280 de trilha, plano, tópicos, flashcards, redação e ranking (conferidas; sem rolagem horizontal); E2E de plano/tópicos nos três tamanhos.
- **Pendência:** o ranking fictício ainda está no bundle de produção (46 T-10.1/T-10.3, fora desta tarefa: só layout foi autorizado).

## F8 — Retomada e salvamento

### T-48.8.1 — Retomada
- **Auditoria:** já cobertos por E2E existentes — mesmos itens e mesmo `startedAt` depois de recarregar (RF-2), recarregar na celebração não duplica histórico, bloco nem XP (RF-6), atividade sem conteúdo é descartada com aviso e volta à trilha (RF-3), aula e lição legada não são reoferecidas depois de concluídas; aparelho compartilhado: o estado de outra conta é apagado antes de aparecer (46 T-07.2, `sync.spec.ts`).
- **Corrigido:** (1) depois de recarregar no meio da checagem, a tela de entrada aparecia de novo — agora a checagem com retrato gravado entra direto na questão; (2) **DV48-04 resolvida:** laço de navegação ao levar o progresso para a conta — o gancho da conta (montado na tela anterior durante a transição) redirecionava de novo para `/importar-progresso`, aninhando `volta=` (54 erros "Maximum update depth" numa execução instrumentada). Guarda no `useContaNoAparelho` (não redireciona estando na própria tela) e a importação nunca volta para si mesma.
- **Evidência:** `journey-start.spec.ts` + teste novo (recarregar depois de confirmar uma resposta: mesmo `stepIndex`, mesmas respostas, nenhuma tentativa duplicada); `checkpoint.spec.ts` + teste novo (recarregar no meio da checagem: sem tela de entrada, mesmo retrato) → **35 passed**; `sync.spec.ts` com regressão do laço (URL sem `volta` aninhado, nenhum erro de página) → **8 passed**, log com **0** ocorrências de "Maximum update depth" (antes: 108 e 192 nas rodadas da T-48.1.3).

### T-48.8.2 — Estados de salvamento (D48-15)
- **Feito:** o motor marca `enviando`/`falhou` e a hora da confirmação do servidor no status de execução do store (o mesmo mecanismo do aviso de persistência, sem estado novo); `estadoDeSalvamento` deriva `aparelho` / `aguardando` / `sem-conexao` / `sincronizado` / `falhou` — "sincronizado" só com fila vazia **e** confirmação do servidor. `EstadoSalvamento` no perfil (sempre) e no topo da trilha (só falha ou sem conexão), com "Tentar agora". A frase antiga "Seu estudo está salvo na conta." (mostrada com a fila vazia, sem confirmação) saiu da tela.
- **Evidência:** `estado-salvamento.test.ts` **6 pass**; `sync.spec.ts` (servidor fora → "falhou", "salvo neste aparelho", botão "Tentar agora", nunca "Sincronizado") e `conta.spec.ts` → **18 passed**.

## F9 — Desempenho
- Medição e correção em [desempenho.md](desempenho.md): ferramenta `scripts/desempenho/medir.ts` (sem dependência nova), cenário fixo (390 px, CPU 4×, 4G lenta, build de produção com brotli), linha de base de landing, quiz, trilha e aula. Correção medida: o bootstrap do modelo deixou de baixar itens e lições quando não há nada a reprocessar — `/quiz` com perfil salvo e sem respostas: **396 KB → 206 KB** de JS (−48%). Tabela geral dentro do ruído; **nenhuma melhoria de FCP/LCP declarada**. Achados registrados: B-165 (texto das lições de redação no caminho da trilha, 158 KB) e B-166 (tarefas longas na landing).
- **Evidência:** `mastery-bootstrap.test.ts` + teste de equivalência (o atalho só vale quando o bootstrap daria `{}`) → 19 pass.

## F3 — Conta, privacidade e operação

### T-48.3.1 — Exportar
- **Feito:** a função `exportarDados` já existia (46) sem tela; agora "Baixar meus dados" na seção "Seus dados" do perfil (só com conta real) baixa o JSON; limite de 1 por hora com mensagem própria. Lógica em `src/server/conta/dados.ts` (isolamento provado na T-48.1.1).
- **Evidência:** E2E `conta-dados.spec.ts`: arquivo `foca-meus-dados-AAAA-MM-DD.json` com o e-mail da conta e sem senha, token ou hash; axe sem violação séria.

### T-48.3.2 — Excluir conta
- **Feito:** `deleteUser` do Better Auth com `afterDelete`: auditoria `conta_excluida` só com o hash do id (`src/server/conta/exclusao.ts`) e o e-mail de confirmação (modelo existente). Os dados saem em cascata (toda tabela do aluno tem FK `on delete cascade`). Tela com confirmação que repete a consequência, senha (Google: sessão recente), limpeza do aparelho.
- **Evidência:** `exclusao.test.ts` **2 pass** (nenhuma linha do aluno em nenhuma tabela com `user_id`, o outro aluno intacto, auditoria com hash, e-mail enviado; senha errada não exclui; login falha depois; o mesmo e-mail recomeça limpo); E2E `conta-dados.spec.ts` → **3 passed** (com o setup).

### T-48.3.3 — Retenção
- **Feito:** `src/server/conta/retencao.ts` (contas nunca verificadas > 7 dias, `audit_event` > 6 meses, `ai_usage`/`ai_budget` > 90 dias, verificações vencidas, limites parados > 1 dia); rota `GET /api/cron/retencao` com `Authorization: Bearer <CRON_SECRET>` comparado em tempo constante; `vercel.json` `crons` diário (`0 7 * * *`).
- **Evidência:** `retencao.test.ts` **1 pass** com relógio simulado (nada some antes do prazo; depois, só o que a política manda); build de produção local: a rota responde **401** sem segredo e com segredo errado. Só roda depois do deploy com `CRON_SECRET`.

### T-48.3.4 — Runbooks e saúde
- **Feito:** [../../operacao/runbooks.md](../../operacao/runbooks.md): primeira olhada, 500 em produção, ligar as contas (D48-07), migração em produção, banco fora/restauração (janela de 6 h do Neon; nunca resetar a `production`), rotação de segredos, Foca IA (custo, abuso, provedor fora, autocuidado), pedidos do titular, incidente com dado pessoal (prazo da Resolução CD/ANPD nº 15/2024 a confirmar com o jurídico), retenção. `/api/saude` já existia.
- **Pendente:** ensaio real de restauração (46 T-13.3) — exige decisão do proprietário sobre quando criar a branch de restauro.

## Verificação (`spec-verifier`, somente leitura) e correções

- Unitários pontuais rodados pelo verificador: 83 + 62 pass, 0 fail. Requisitos RF-1…RF-15 cumpridos; decisões cumpridas exceto as bloqueadas externamente (D48-06, D48-07).
- **Corrigido depois do relatório:**
  - "Sincronizado com a conta" só com confirmação do servidor **nesta página** (uma confirmação guardada de antes de recarregar não vale) e falha ao salvar o documento de planejamento com a fila vazia aparece como "falhou" (`estadoDeSalvamento`; `estado-salvamento.test.ts` agora 8 pass);
  - chaves de copy sem uso que diziam "salvo na conta" (`syncEmDia`, `syncPendente`) removidas; "Checkpoint" restante no `COPY.jornada` virou "Checagem"; inventário §2.6 atualizado;
  - linha do `diaProtegido` em `privacidade.md` (dado derivado, não é coleta nova).
- **Divergências registradas:**
  | ID | O quê | Decisão |
  |---|---|---|
  | DV48-03 | Fluxo do responsável (consentimento aos 17) não implementado | Depende do e-mail em produção e da revisão jurídica (46 T-11.4); o aluno vê o aviso honesto |
  | DV48-05 | A spec nomeava o campo `ultimaProtecaoEm`; o código usa `diaProtegido` | Mesmo significado (o último dia parado coberto por proteção); a spec fica como referência histórica |
  | DV48-06 | A linha de base de desempenho é a árvore da 48 antes da T-48.9.2, não o estado anterior à 48 | "Nenhuma piora contra o estado anterior à 48" não está provado; as medições dizem só o que mediram |
- **Fica em aberto (não autorizado ou fora do escopo):** `/offline` (código anterior à 48) ainda tem um "Sincronizar agora" simulado e é aberto pelo perfil — já no B-064 (46 T-10.1); id de atividade desconhecido volta à trilha sem aviso (só o conteúdo removido mostra aviso) — anotado para a próxima rodada de retomada; E2E de redação, flashcards e ranking nos três tamanhos (só capturas conferidas).

## Login de teste (pedido do proprietário, 30/09/2026)

- **Local:** a conta `teste@foca.dev` entrava pela API; o script `scripts/dev/criar-conta-teste.ts` passou a aceitar `CONTA_EMAIL`/`CONTA_SENHA`. Conta nova criada **só no banco local**: `aluno.teste@foca.dev` / `foca-aluno-2026`. Testada **pela tela** (Playwright, 390 px): `/login` → e-mail e senha → `/trilha`, nenhum erro de página nem 5xx.
- **Produção (`www.focaedu.com`):** não existe conta de teste possível — o banco não está configurado (modo de demonstração) e, além disso, **todas** as rotas de autenticação respondem 500 (`/api/auth/get-session`, `/api/auth/sign-in/email`, `/api/saude`; DV48-01). A tela de login, sem conseguir ler a configuração, caía num formulário de e-mail e senha que sempre falhava.
- **Corrigido na tela:** `/login` e `/cadastro` agora dizem "Não deu para carregar a entrada agora…" com "Tentar de novo" quando a configuração não carrega (E2E novo em `conta.spec.ts`; conta 12 passed). Em produção, o login volta a funcionar (entrada de demonstração) só com o deploy da correção D48-08 ou corrigindo a variável inválida na Vercel. Contas reais em produção dependem de D48-07.

## T-48.10.1 — Regressão final (30/09/2026, working tree, sem commit)

- `bunx tsc --noEmit` ✅ · `bun test tests/unit` **1381 pass, 0 fail** (110 arquivos) · `bun run lint:ci` **0 erros, 17 avisos** (os mesmos de antes da 48) · `bun run build` ✅ · `VERCEL=1 bun run build` ✅ · `bun run docs:check` ✅ · `validate-skills` 0 FAIL.
- **E2E completo** (`bunx playwright test`, todos os projetos, servidor de desenvolvimento com PGlite): **540 passed, 0 failed, 73 skipped** (os mesmos 73 pulados da última rodada completa da 46), 13,1 min, **0** ocorrências de "Maximum update depth". Depois dela, rodadas direcionadas das correções do verificador e do login: `sync` + `conta` + `conta-dados` + `sequencia` 22 passed; `conta` 12 passed.
- `test:neon` (branch temporária filha de `dev`): **7 pass**.

## Estado de validação da entrega

| Camada | Estado |
|---|---|
| F0 (Neon, ambiente, domínio) | Validado em ambiente integrado (Neon `dev` e esquema na `production`); correção do 500 validada localmente, **não publicada** |
| F1, F2, F3, F4, F5, F6, F7, F8, F9 | Validado localmente |
| T-48.0.7, T-48.0.8, T-48.2.8 | Bloqueadas: proprietário (variáveis da Vercel, Resend/Google, chave da OpenAI) |
| Publicação | Nada publicado: sem commit, push nem deploy |

## 01/10/2026 — Publicação autorizada, login pelo Google e bloqueio da Vercel

Pedidos do proprietário (01/10): "autorizar o commit e o deploy da correção"; manter o Better Auth atual e configurar o login pelo Google (escolha registrada depois de apresentar o impacto do Neon Auth: em produção ele também exige cliente Google próprio e SMTP próprio, não tem ganchos de servidor para a idade mínima e os termos, e os testes locais passariam a depender do Neon); publicar a 48 inteira junto com o Google.

- **DV48-07 — Neon Auth não adotado (de novo):** a ADR 0007 continua valendo; o proprietário escolheu manter o login atual depois de ver o impacto.
- **Correção D48-08 publicada na `main`** (`6353b38`, só `env.ts` + teste, montada em cima da `main` sem mexer no working tree; testada numa cópia isolada: tipos ✅, build `vercel` ✅, os 3 cenários que davam 500 → 200/503/307). **O deploy falhou na Vercel em 4 s**: a Vercel passou a bloquear `@tanstack/react-start@1.168.26` ("Vulnerable TanStack Start package detected … XSS"). Produção ficou no deploy anterior.
- **CI do GitHub:** falha preexistente (já no `fd1d4da`): o `docs:check` roda antes do build e acusa caminhos de `public/content/` (gerado). Não bloqueia a Vercel; anotado para corrigir (rodar o `build-packs` antes ou ignorar caminhos gerados).
- **DV48-08 — atualização de dependência por segurança:** `@tanstack/react-start` 1.168.26 → **1.168.60**, `@tanstack/react-router` 1.170.16 → **1.170.41**, `@tanstack/router-plugin` 1.168.18 → **1.168.42** (versões fixas, `--exact`; publicadas há mais de 24 h, como pede o `bunfig.toml`). Justificativa: bloqueio da Vercel por XSS na versão anterior. Ajustes de tipo exigidos pela versão nova, sem mudança de comportamento: retorno do `beforeLoad` da raiz anotado (`Guarda`, serializável) e `errorComponent` com `error: unknown`. A raiz continua sem importar store nem AppShell.
- **Causa do 500 confirmada:** a única variável da Vercel era `OPENAI_API_KEY`, **vazia** (Production e Preview). Removida.
- **Variáveis de produção configuradas pela CLI da Vercel** (valores lidos de arquivo e nunca exibidos): `DATABASE_URL` (pooled) e `DATABASE_URL_UNPOOLED` da branch `production` do Neon, `BETTER_AUTH_SECRET` (novo, 64 hex), `BETTER_AUTH_URL=https://www.focaedu.com` (o domínio primário atual na Vercel), `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (cliente "Aplicativo da Web" criado pelo proprietário, origens e retornos de apex, `www` e `localhost:8080`), `AUTH_EMAIL_HABILITADO=false` (sem Resend ainda), `CRON_SECRET`. Valem a partir do próximo deploy: com elas, as contas reais ligam com **login só pelo Google** (D48-07 satisfeita).
- **Commits locais:** `2fc0690` (D-19/D-20), `68abe9d` (spec 48), `b13e148` (merge da correção da `main`). `automacao-instagram/` e a skill `foca-social` ficaram de fora (trabalho em andamento em outra frente).
- **Alerta registrado ao proprietário:** os termos e a política ainda são rascunho (sem revisão jurídica), público majoritariamente adolescente; o segredo do Google foi colado no chat — recomendada a rotação depois que tudo estiver funcionando.
- **Publicação da 48 inteira (01/10):** `382a359` (atualização do TanStack, DV48-08) e os commits acima enviados para a `main` (`6353b38..382a359`). Antes do envio: tipos ✅, unitários ✅, lint 0 erros, build e build `vercel` ✅, E2E completo **542 passed / 1 instável / 73 skipped** (o movimento da landing, 22/22 isolado). Deploy da Vercel `foca-88os7m6b3` **Ready** em 31 s.
- **Verificação em produção (01/10, só leitura, nenhuma conta criada):** `/api/saude` → `{"ok":true,"banco":"ok"}` · `/`, `/quiz`, `/login`, `/api/auth/ok`, `/api/auth/get-session` → 200 · `/trilha` sem sessão → 307 para `/login?volta=%2Ftrilha` · `/api/cron/retencao` sem segredo → 401 · `POST /api/auth/sign-in/social` (Google) devolve URL de `accounts.google.com` com o `client_id` certo e `redirect_uri=https://www.focaedu.com/api/auth/callback/google` · `/login` em 390 px mostra "Continuar com o Google" e "Criar conta", sem a mensagem de acesso indisponível. Estado: **validado em produção** até o redirecionamento ao Google; o login completo depende de o proprietário publicar a tela de consentimento (hoje só usuários de teste do Google entram) e testar com a própria conta.

## 01/10/2026 (noite) — E-mail pela Resend, sincronização quebrada em produção e chama da sequência

Pedidos do proprietário: "Fiz tudo do resend, agora faça tudo que tem que fazer dele"; login pelo Google funcionou, "mas não tá sincronizando com o servidor"; sequência "mais chamativa igual ao Duolingo… com o número dentro do fogo… quando não tá com a sequência em dia, o fogo fica cinza"; planos, preços, checkout e o que falta para vender (anúncios quando houver app nas lojas).

- **Resend (T-48.0.8):** chave guardada em `.env.resend` (ignorado pelo Git; chave só de envio — a API recusa listar domínios). Domínio conferido com um envio para o endereço de teste da própria Resend (`delivered@resend.dev`, aceito → `focaedu.com` verificado), sem destinatário real. Vercel (Production, valores lidos de arquivo, nunca exibidos): `RESEND_API_KEY`, `EMAIL_FROM="Foca <nao-responda@focaedu.com>"`, `AUTH_EMAIL_HABILITADO=true` (substituiu o `false`). Vale a partir do próximo deploy. A chave foi colada no chat: rotação recomendada.
- **D48-17 — causa da sincronização quebrada (validada pelos logs de produção):** `vercel logs --since 24h` (CLI 62.1.0, só leitura) mostrou toda chamada `POST /_serverFn/…` de envio de eventos com `erro_interno` → `ENOENT: no such file or directory, scandir '/var/task/src/content/banco'`. `src/server/estudo/conteudo.ts` testava `typeof import.meta.glob`, que é sempre `undefined` no build (o Vite só substitui a chamada), e caía na leitura do disco — que existe no desenvolvimento e nos testes, por isso nada local pegou. Correção: chamar `import.meta.glob(...)` dentro de `try` (no `bun test` a chamada lança e cai no disco). Conferido no bundle da Vercel: `carregarDoBundle` agora tem os pacotes embutidos (`Object.assign({"/src/content/banco/bio/…": …})`).
- **Evidência da correção num servidor de produção sem `src/`:** `bun run build` → `.output` copiado para uma pasta temporária só com `drizzle/` (sem `src/`), `node .output/server/index.mjs` (PGlite isolado) → `/api/saude` ok e `sync.spec.ts` (narrow) **8 passed**, nenhum `ENOENT` no log do servidor. Estado: validado localmente num build de produção; em produção, depois do deploy. O que o aluno estudou desde o login ficou na fila do aparelho e sobe no primeiro ciclo depois do deploy.
- **D48-18 — chama da sequência:** `ChamaSequencia.tsx` (SVG próprio, número dentro, 50 px no topo, 64 px na folha), acesa/cinza por `estudouHoje`, escudo das proteções no canto de cima, pulo único ao acender. Tokens novos `--chama-*` em `:root` e `.dark` (contrastes medidos: número 8,4:1 e 6,8:1 no claro; 11,5:1 e 4,9:1 no escuro; aresta da chama apagada 4,2:1 sobre o cartão). Capturas em 390 px (2×), claro e escuro, acesa e apagada, inclusive 128 dias e a folha. E2E: `sequencia.spec.ts` + teste novo da chama cinza; `trail-home.spec.ts` passou a conferir a chama e o rótulo acessível em vez do texto "N dias".
- **Verificação:** `tsc` ✅ · unitários **1381 pass / 0 fail** (o teste do CSS compilado precisa do build com os tokens novos) · `lint:ci` 0 erros / 17 avisos · build e build `vercel` ✅ · docs:check ✅ · E2E direcionados: sequência + trilha + layout **89 passed / 30 skipped**, checkpoint + caminho da trilha **28 passed**.
- **E2E completo:** **543 passed / 1 failed / 73 skipped** (13,3 min). A falha (`landing.spec.ts:78`, lp-mobile, erro de console) passou **3/3** isolada — provável recarga do servidor de desenvolvimento enquanto o `conteudo.ts` antigo era restaurado para provar que o teste novo `bundle-servidor.test.ts` falha sem a correção (falhou: 1 pass / 1 fail; com a correção, 2 pass).
- **Monetização:** `docs/negocio/monetizacao.md` (aguardando aprovação; planos, gateway Asaas/Mercado Pago, passo a passo, o que falta, anúncios). Achado: `AI_TETO_DIARIO_USD=1` cobre ~120 mensagens/dia somando todos os alunos — redimensionar antes de vender e antes de cadastrar a chave da OpenAI.
- **Publicação:** nada publicado; aguarda pedido do proprietário.
