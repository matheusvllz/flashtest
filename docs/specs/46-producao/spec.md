# 46 — Do protótipo ao produto: SDD reorganizado, backend real, autenticação, segurança e documentos legais

**Estado:** aprovado em 29/09/2026 pelo proprietário, com as decisões do §0 (que prevalecem sobre o texto original onde divergirem). Em execução — ver o registro `47-registro-execucao-producao.md`.
**Autor:** Claude Code (responsável técnico), a pedido do proprietário.

## 0. Decisões do proprietário (29/09/2026) — prevalecem sobre o resto deste documento

| ID | Decisão | Consequência aplicada neste plano |
|---|---|---|
| D-01 | Nova organização do SDD **aprovada** | F01/F02 executam o §C e o §D |
| D-02 | Exclusões de `docs/_arquivo-abroad/` e dos HTML "Flash Test" **intencionais**: projetos antigos, não devem ficar no projeto | Commitadas em `9109d8f`. As referências a eles são removidas (não "arquivadas") |
| D-03 | Commits locais na branch `producao-46` **autorizados**, sem push | Um commit por tarefa ou fase |
| D-04 | Lovable: **pode deletar**, o proprietário não tem mais a conta | T-03.4 sem ação externa |
| D-05 | `automacao-instagram/` **versionada** | Commitada em `9109d8f`. `edição Videos/` e `Claude outputs/` seguem o padrão recomendado: ignorados pelo Git, sem apagar |
| D-06 | Neon + Drizzle + Better Auth + Resend **aprovados** | §E |
| D-07 | **O estudo exige conta** (evita abuso). **Não há modo convidado** | Rotas de estudo exigem sessão. O onboarding de perfil pode ser respondido antes do cadastro, mas estudar, nivelar e usar a Foca IA só com conta. A importação de estado local (§G) passa a servir só para quem já tem progresso no aparelho de antes desta mudança |
| D-08 | Idade: **opção A** — conta a partir de 17 anos; Foca IA aos 17 com consentimento do responsável, 18+ direto | Com D-07, **quem tem menos de 17 anos não usa o app**. Idade mínima configurável (`MIN_ACCOUNT_AGE`) para a revisão jurídica mudar sem refazer código |
| D-09 | Controlador: **Matheus Vellozo Freire** (pessoa física) | Pendentes: e-mail de contato de privacidade e encarregado. Pessoa física: o art. 15 do Marco Civil (guarda obrigatória de 6 meses) não se aplica pelo caput; a guarda de `audit_event` por 6 meses fica como boa prática |
| D-10 | Domínio **mais tarde**, não agora | Sem domínio não há e-mail em produção (Resend exige domínio). E-mail + senha, verificação e recuperação ficam implementados e testados localmente, **desligados em produção** por configuração (`AUTH_EMAIL_HABILITADO`). Em produção, o primeiro login possível é o Google (tela de consentimento em modo teste até o domínio) |
| D-11 | **Vercel Hobby** por enquanto | Bloqueador para **vender** (Hobby é só uso não comercial), não para desenvolver. Região `gru1` continua possível (Hobby permite 1 região). Cron só diário (suficiente). Logs de 1 h, por isso os eventos de segurança ficam em `audit_event` |
| D-12 | IA por API, chave **ainda a providenciar**. Cotas por plano: **grátis = no máximo 3 mensagens por dia**; **pro = 20 mensagens + 5 fotos por dia** | Cota por plano configurável (`AI_COTA_GRATIS_MENSAGENS=3`, `AI_COTA_PRO_MENSAGENS=20`, `AI_COTA_PRO_FOTOS=5`). No grátis, uma foto conta como uma das 3 mensagens. Todo aluno começa no plano grátis (pagamento está fora do escopo); o campo `plano` existe no perfil para o futuro. Teto global de custo configurável, padrão conservador de US$ 1/dia até o proprietário definir. Sem chave, o tutor usa o fallback local, como hoje |
| D-15 | (30/09/2026) Publicar na `main` agora, com um **login falso por enquanto**, até o backend de produção ser configurado | **Temporária.** Sem `DATABASE_URL`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL` em produção, as contas ficam desligadas e o app roda em **modo de demonstração**: "Entrar" é local (cookie `foca_demo`, sem e-mail nem senha — nenhum formulário recolhe senha que não seria usada), o progresso fica só no aparelho, sem sincronização, e sair mantém o progresso (como antes das contas). Suspende, nesse modo, a D-07 (estudo exige conta **real**), a D-08 (idade) e o aceite legal no cadastro. Quando as três variáveis existirem, as contas reais ligam sozinhas: o cookie deixa de valer, a guarda pede o login real e o progresso local vai para a tela de importação |
| D-13…D-18 | Não bloqueantes, sem objeção | Padrões do §L adotados |
**Prevalece sobre (quando aprovado):** as regras "cadastro/login mock é intencional", "sem backend, sem banco, sem autenticação real" e "backend e sincronização não autorizados" (`CLAUDE.md` → Stack real e Regras de escopo; `docs/PRODUCT.md` → Capabilities and Constraints; `20` §15.1 e §22); a convenção de arquivos do SDD (`docs/ai/SDD-WORKFLOW.md` §2, `docs/ai/templates/spec.md`). A lista completa está no §B.4. **Não prevalece** sobre nenhuma regra pedagógica, de voz, de marca ou de acessibilidade já vigente.

> **Como ler.** As seções A a M seguem o formato pedido. As tarefas executáveis estão no §J. O que depende de você está no §L. "Fato" aparece com arquivo e linha ou com uma fonte oficial e data. "Estimativa" e "recomendação" vêm sempre marcadas.

## Como a IA implementadora deve usar este documento

1. Só execute depois que o proprietário escrever que aprova. Aprovar o plano **não** autoriza gasto, contratação, publicação, push nem mudança em produção (§L).
2. Execute as fases na ordem do §J. Dentro de uma fase, siga a ordem numerada, salvo quando a tarefa disser que é independente.
3. Cada tarefa termina com o app compilando e os testes da fase verdes. Registre a evidência no registro de execução (`47-registro-execucao-producao.md` até a F01; depois `docs/specs/46-producao/registro.md`).
4. Uma tarefa que depende de credencial ou de ação externa fica em **bloqueado**, com o motivo e o dono. Siga com o trabalho independente.
5. Quando o código divergir deste plano, registre a divergência (D-xx) no registro e siga a intenção do requisito. Não altere a spec em silêncio.

---

## A. Diagnóstico do estado atual

Tudo foi investigado no checkout de 29/09/2026 (`main`, HEAD `3307b22`), somente em leitura.

### A.1 Stack e build (fatos)

| Item | Estado | Evidência |
|---|---|---|
| Framework | TanStack Start 1.168.26, TanStack Router 1.170.16, React 19.2.5, Vite 8.0.16, Nitro 3.0.260603-beta, Bun 1.4.2 | `node_modules/*/package.json` |
| Build | `vite.config.ts` **não usa Vite direto**: importa `defineConfig` de `@lovable.dev/vite-tanstack-config` 2.7.7, instalado de um registry privado da Lovable | `vite.config.ts:7`, `bun.lock:243` |
| O que o wrapper da Lovable faz fora do sandbox | Adiciona tailwind, tsconfig-paths, tanstackStart com `importProtection` (bloqueia `**/server/**` e `server-only` no cliente), nitro só no build, plugin-react, alias `@`, dedupe de React/Query, `optimizeDeps`, `css.transformer: lightningcss`, `define` de `VITE_*`, servidor `host "::"`/porta 8080 e devtools no modo development. **Os plugins de sandbox (bridge, hmr-gate, proxy de assets, diagnóstico de build) ficam inertes fora da Lovable.** Não há `lovable-tagger` nem telemetria própria | `node_modules/@lovable.dev/vite-tanstack-config/dist/index.js:37-640` |
| Preset do Nitro | `NITRO_PRESET ?? (VERCEL ? "vercel" : "netlify")`. O CI e os builds locais saem com o preset **netlify** | `vite.config.ts:21`; `dist/` e `.netlify/` locais |
| Deploy | Vercel (`vercel.json`: bun, headers de segurança parciais). `netlify.toml` ainda existe, com `npm run build` | `vercel.json`, `netlify.toml` |
| CI | GitHub Actions: `tsc`, `bun test tests/unit`, `bun run build`. Não roda lint nem E2E | `.github/workflows/ci.yml` |
| Resto da Lovable | `.lovable/project.json`; bloco `LOVABLE:BEGIN/END` no `AGENTS.md`; `src/lib/lovable-error-reporting.ts` (usado por `__root.tsx:14,70` e `TrailError.tsx:6,21`, no-op fora do editor); exceção `@lovable.dev/*` em `bunfig.toml:7` | arquivos citados |

### A.2 Produto: o que é real, local, simulado ou incompleto (fatos)

**Não existe backend.** O único código de servidor é a server function do tutor (`src/lib/tutor.ts:15`). Estar "logado" é o booleano `authed` no `localStorage` (`src/lib/store.ts:151`). Só `/app` consulta esse booleano (`src/routes/app.tsx:26`). Nenhuma rota tem guarda.

| Funcionalidade | Classe | Observação |
|---|---|---|
| Landing `/` (SSR) | Real e operacional | Publicação em domínio próprio não verificada |
| Onboarding `/quiz` (9 passos) | Local, sem sincronização | `completeQuiz([], …)`: as lacunas saem de uma heurística sobre o perfil declarado (`src/lib/gaps.ts`) |
| Nivelamento, trilha/jornada, `/atividade`, `/learn`, `/redacao`, `/study` | Real e operacional; local, sem sincronização | Conteúdo em pacotes estáticos (`public/content/v1/`) |
| Flashcards, progresso, domínio | Local, sem sincronização | — |
| Streak, XP, congelamentos | Local e **adulterável** | Calculados com o relógio do aparelho (`store.ts:691-738`); ledger de XP sem limite de tamanho |
| Foca IA (texto e foto) | Depende de serviço externo (OpenAI) | Fallback local em erro ou timeout de 12 s |
| Login `/login` | **Simulado** | Aceita qualquer e-mail e senha e descarta a senha. O botão Google é `alert("em breve")` (`login.tsx:80`) |
| "Esqueci a senha" `/forgot` | **Simulado** | Não envia nada |
| Logout | **Incompleto** | Só zera `authed`. Nome, e-mail e progresso continuam no aparelho (`store.ts:1990`) |
| Ranking `/ranking` | **Simulado** | 18 alunos fictícios (`src/data/ranking.ts`); a tela diz "Turma de demonstração" |
| Premium `/premium` | **Simulado** | Flag de trial de 24 h; "Preço a definir" |
| Offline `/offline` | **Simulado** | "Sincronizar agora" é um `setTimeout` de 1,5 s (`offline.tsx:30-36`) |
| Plano `/plan` | Local, em parte cosmético | A tarefa de vídeo aponta sempre para o vídeo da q1 |
| Tópicos `/topics` | **Incompleto** | `selectedTopics` é gravado e ninguém lê |
| Vídeo `/video/$id` | Depende de serviço externo (YouTube) | 10 IDs fixos no código |
| PWA | Incompleto | Tem manifest; não tem service worker |
| Notificações | Não existem | — |
| Perfil `/profile` | Local | Nome não editável; "Termos de uso", "Política de privacidade" e "Meta diária" não fazem nada (`profile.tsx:300-301`); "Resetar demonstração" (`:313`) |
| `/debug` | Ferramenta interna | Abre em produção com `?debug=1` |
| `/dashboard` | Rollback atrás de flag | Inalcançável com `trilhaComoHome` ligada |

### A.3 Estado local (fatos)

- Um único blob JSON na chave `foca.state.v3`, schema interno **v6** (`state-migrations.ts:24`), regravado inteiro a cada `setState`.
- Há duas cópias de backup brutas que nunca são apagadas: `foca.state.backup.before-learning-v4` e `…before-v6`. Ambas contêm nome e e-mail.
- Cópias corrompidas vão para `foca.state.corrupt.<ISO>`.
- Entre abas, vale a última gravação (`store.ts:576-599`).
- **Dados pessoais no aparelho:** primeiro nome, e-mail (só do login simulado), UF, etapa escolar, instituição e curso-alvo, datas de prova. Não são coletados: idade, escola, cidade, telefone, foto.
- **Não têm limite de tamanho:** `learning.rewardLedger` e `tutor.messages`.

### A.4 Foca IA (fatos e defeitos encontrados)

| # | Achado | Evidência | Gravidade (estimativa) |
|---|---|---|---|
| IA-1 | Endpoint sem autenticação e sem limite de uso: qualquer um que faça POST gasta a chave da OpenAI | `tutor.ts:15`; sem rate limit no código | Alta assim que houver chave em produção |
| IA-2 | O `context` (nome, curso, lacunas, desempenho) chega do cliente sem validação e entra no prompt de sistema, o que abre caminho para injeção de prompt | `tutor-core.ts:162-203`; pendência D-002 do `37` §5 | Média |
| IA-3 | O histórico persistido não é aparado. Depois de 40 mensagens, toda requisição falha na validação do servidor e o tutor quebra para sempre naquele aparelho | `tutor-core.ts` (1–40 mensagens) × `TutorBubble.tsx:181-201` (envia tudo) | Média (bug confirmado por leitura, ainda não reproduzido) |
| IA-4 | A foto vai sem compressão, até 5 MiB em base64 (cerca de 6,7 MB por requisição) | `TutorBubble.tsx:215-236` | Baixa/média |
| IA-5 | O Contrato de Serviços da OpenAI (§3.3(c)) proíbe permitir que **menores usem os serviços sem consentimento dos pais ou responsáveis**. Hoje o tutor está aberto a qualquer idade | OSA Online v.010126; público de 16–19 anos (`14`) | **Contratual/legal — decisão D-08** |

### A.5 SDD e documentação (fatos)

- `docs/` tem 46 documentos numerados, 22.723 linhas só nos `.md` da raiz e de `ai/` e `copy/`. Os maiores têm 1.000–2.150 linhas (`31`, `28`, `36`, `30`, `40`, `20`, `25`).
- O `docs/README.md` tem **sete blocos "plano vigente/anterior" sobrepostos** (`36`, `30`, `25`, `27`, `20`, `44`, som). A tabela de arquivos está fora de ordem e não tem linha para o `24`.
- **Cabeçalhos desatualizados:** `20` e `25` dizem "PLANEJADO, NÃO IMPLEMENTADO"; `27`/`28` dizem "rascunho"; `17` diz "pronto para executar"; `30`/`31`/`36` dizem "em execução"; `40:8` ainda traz a regra de isolamento revogada. Todos já foram implementados.
- **Regras vigentes espalhadas:** cerca de 63 regras ou contratos ainda valem e vivem só dentro de planos concluídos. Exemplos: feedback imutável (`20` §4.1), tutor só sob demanda (`20` §4.2), idempotência por `attemptKey` (`36` RF-6), code splitting (`44` §3), questões oficiais (`34`).
- **Links quebrados** (a exclusão local ainda não foi commitada): `_arquivo-abroad/` é citado em `CLAUDE.md:69`, `00-README:39,107,111`, `ai/SDD-WORKFLOW.md:33` e em mais 8 docs; os dois HTML "Flash Test" são citados em 10 docs.
- **Referências que quebram em execução se os arquivos mudarem de lugar:**
  - `scripts/content/taxonomy-doc.ts:13` (escreve o `33`);
  - `tests/unit/audio.test.ts:21` (lê `docs/design/audio/v2/wav/`);
  - `scripts/foca_sound/*.py` e as chaves de `baseline-hashes.json`/`original-audit.json`;
  - `contextFiles` do `.claude/skills-registry.json`, validado por `scripts/validate-skills.mjs:75`;
  - `automacao-instagram/ferramentas/lib/paths.ts:33` e `marca/sincronizar.ts:108-109`, que leem `docs/DESIGN.md`, `docs/COPY.md` e `docs/PRODUCT.md`.
- **Citações em comentários:** cerca de 290 arquivos de código citam `docs/NN §x`. Mudar arquivos de lugar não quebra nada, mas renumerar tornaria essas citações falsas (§C.3).

### A.6 Agentes e skills (fatos)

- **O Codex não enxerga nada do projeto além do `AGENTS.md`, de 641 bytes** (bloco Lovable + 1 linha de copy). Não existe `.agents/skills/` nem `.codex/`. As 10 skills do repo, o `spec-verifier` e o `CLAUDE.md` são invisíveis para ele. Isso foi confirmado numa transcrição real do Codex em `~/.codex/sessions/2026/09/29/`.
- **O Claude Code não lê o `AGENTS.md`**, porque existe um `CLAUDE.md` e ele não importa `@AGENTS.md` (documentação oficial do Claude Code, memória). Hoje não se perde nada, porque o `CLAUDE.md` repete o conteúdo.
- **Plugins do projeto** (superpowers, agent-skills, impeccable, humanizer, tanstack-*, ui-ux-pro-max, frontend-design) estão habilitados em `.claude/settings.json`, mas **não carregaram nesta sessão**. A disponibilidade depende do host. O `SKILL-ROUTING.md` trata essas skills como sempre presentes.
- **Lacunas reais:** não há skill de banco, Postgres, autenticação ou sessões; nem de LGPD, privacidade ou dados de menores; nem de Playwright ou de deploy na Vercel. Para o Codex, só existem `review-agent` e `openai-docs`.
- **Riscos de cadeia de suprimento:** `.mcp.json` roda `npx -y omniroute` sem versão fixa (e não conectou nesta sessão); o `repo-security-review` depende de gitleaks, osv-scanner e semgrep, que não estão instalados (`docs/ai/SKILLS.md` §M).

### A.7 Alterações locais preexistentes (preservar)

`git status` mostra trabalho que **não é deste plano**:

- **Modificados, sem commit:** `CLAUDE.md` (+4, seção Instagram), `docs/README.md` (+2), `docs/ai/SKILLS.md` (+9, §S foca-social), `docs/ai/SKILL-ROUTING.md` (1 linha), `docs/copy/06-marketing.md` (+1) e `.claude/skills-registry.json` (+24).
- **Excluídos, sem commit:** 15 arquivos de `docs/_arquivo-abroad/` e 2 HTML "Flash Test" em `docs/design/brand/`. Estavam intactos desde `4faf4d1` (21/09) e ainda estão no HEAD `3307b22`, então dá para recuperá-los.
- **Não rastreados:** `automacao-instagram/`, `.claude/agents/foca-social.md`, `.claude/skills/foca-social/`, `Claude outputs/` e `edição Videos/`.

Não se sabe se as exclusões foram intencionais. A decisão fica com você (D-02).

### A.8 Ferramentas independentes (fronteiras confirmadas)

| Pasta | Situação | Fronteira com o app |
|---|---|---|
| `content-pipeline/` | Rastreada, 124 arquivos; `lotes/` ignorado | Usada por `scripts/content/*` e por testes; `src/` não importa dela (`tests/unit/pipeline-boundary.test.ts:23`) |
| `automacao-instagram/` | Não rastreada; tem `package.json`, `bun.lock` e `.gitignore` próprios (`node_modules`, `.env` e logs ignorados) | Só **lê** o repo (`ferramentas/lib/paths.ts:10-34`); nada do app a importa |
| `edição Videos/` | Não rastreada; tem `CLAUDE.md` próprio, que diz "não é projeto versionado" | Só citada em comentários |
| `Claude outputs/` | Não rastreada; rascunho **diferente** do `docs/design/brand/foca-design-system-2026-09-28.html` | Nenhuma |

Observação: `eslint .` passa por dentro de `automacao-instagram/` e `edição Videos/`, que o `eslint.config.js` não ignora.

---

## B. Objetivos, limites e fora do escopo

### B.1 Objetivos

1. Um SDD em que um agente, Claude ou Codex, saiba em até **três leituras** o que é o produto, o que vale, o que está aprovado e qual é a próxima tarefa (§C, §D).
2. Build e repositório sem dependência da Lovable ou da Netlify, com o mesmo comportamento no Vercel (§J F03).
3. **Contas reais**: cadastro com e-mail e senha verificados, login com Google, recuperação de acesso e sessões revogáveis. Os dados de estudo ficam no servidor e sincronizam entre aparelhos, e o servidor é a autoridade sobre recompensas (§E).
4. Migração segura do progresso local para a conta (§G).
5. Foca IA protegida: exige conta, tem cota, teto de custo, contexto montado no servidor e salvaguardas para menores (§E.7).
6. Segurança como critério de aceite, com modelo de ameaças e auditoria final com evidência (§F).
7. Termos de uso e política de privacidade em PT-BR, coerentes com o que foi implementado. Pendências jurídicas ficam explícitas, e nada é publicado como final enquanto houver pendência (§H).
8. A checklist de lançamento do proprietário documentada e organizada (§I).

### B.2 Limites

- Não trocar de framework. TanStack Start + Vite + Nitro continuam (§E.1).
- Um só store no cliente (`src/lib/store.ts`). A sincronização é uma **extensão** dele, não um segundo mecanismo de estado.
- Conteúdo pedagógico, voz, identidade visual, acessibilidade e comportamento da jornada adaptativa são preservados. Nenhuma regra dos `20`/`25`/`30`/`36`/`44` muda por causa do backend.
- Sem commit, push, deploy, gasto ou contratação sem a sua autorização explícita (D-03, §L).
- Nada de teste destrutivo contra produção nem contra serviços de terceiros.

### B.3 Fora do escopo desta implementação

- Pagamentos e checkout, planos, afiliados, indicação com recompensa, APK, Play Store, suporte por WhatsApp, tutoriais e marketing: ficam documentados na checklist (§I), sem implementação.
- Ranking real entre alunos, notificações, painel de responsáveis (vínculo de conta de responsável, controle de tempo de uso) e revisão humana do acervo.
- Correção de redação por IA e simulado completo.
- Painel administrativo com interface.
- Analytics externo. Continua proibido sem uma spec própria (`20` §14, §22).

### B.4 Regras antigas que este plano substitui (quando aprovado)

| Regra antiga | Onde | Passa a valer |
|---|---|---|
| "`login()`/`logout()` só ligam uma flag local — é intencional (cadastro é mock no MVP)" | `CLAUDE.md` → Stack real | Contas reais (§E.3); estudar exige conta (§0, D-07) |
| "Sem autenticação real, sem pagamento…" | `CLAUDE.md` → Regras de escopo; `PRODUCT.md` → Constraints | Autenticação real está no escopo; pagamento continua fora |
| "Estado atual: protótipo funcional, sem backend; login e cadastro são mock intencional" | `PRODUCT.md` → Product Purpose | Descrição atualizada na F01/F14 |
| "Backend e sincronização… não estão autorizados automaticamente" | `20` §15.1, §15.4, §22 | Autorizados por este plano, nos limites do §E |
| "Coleta adicional de dados de menores não está autorizada" | `20` §22; `SDD-WORKFLOW` §1; `PRODUCT.md` | Autoriza **somente** a coleta listada no §E.2/§H.2 (e-mail, faixa etária, consentimentos, dados de estudo). Qualquer outra coleta continua proibida sem spec |
| Convenção `docs/NN-plano-<tema>.md` + `NN-registro-*` soltos em `docs/` | `SDD-WORKFLOW` §2; `SPEC-TEMPLATE` | Nova convenção do §D.1 |
| "Repo conectado ao Lovable" | `AGENTS.md`, `CLAUDE.md` → Git/Lovable | Regra geral de Git (§D.1.6) sem a Lovable, depois da desconexão (D-04) |

---

## C. Árvore proposta e mapa das mudanças

### C.1 Princípios

1. **Uma fonte canônica por assunto** (tabela C.2). Os resumos apontam para ela e não a repetem.
2. **O que vale hoje fica separado de como se chegou aqui.** Os documentos canônicos descrevem o estado atual. Planos e registros concluídos vão para `historico/`, cada um com um resumo curto.
3. **Número é identidade permanente.** `46` continua sendo `46` depois de arquivado. As cerca de 290 citações `docs/NN §x` nos comentários continuam válidas, e o mapa ID → caminho fica em `docs/historico/README.md`. Nada é renumerado.
4. **Caminhos lidos por ferramentas ficam estáveis:** `docs/PRODUCT.md`, `docs/DESIGN.md` e `docs/COPY.md` (lidos pelo Impeccable, pelas skills de marketing e pela automação do Instagram) e `docs/copy/`.
5. **Pouca burocracia:** uma iniciativa pequena cabe num só `spec.md`. Os arquivos separados só existem quando o tamanho pede.

### C.2 Árvore proposta

```text
AGENTS.md                     ENTRADA para qualquer agente (Codex lê; Claude importa). ≤ 12 KB
CLAUDE.md                     "@AGENTS.md" + só o que é específico do Claude Code
README.md                     Humanos: o que é, como rodar, testar e publicar
.agents/
  skills/                     Skills do projeto (fonte canônica; o Codex descobre aqui)
  product-marketing.md        (mantido; contexto das skills de marketing)
.claude/
  skills/                     Espelho gerado de .agents/skills + skills só do Claude
  agents/                     spec-verifier, foca-social (Claude)
  settings.json               plugins do projeto (mantido)
.codex/
  agents/spec-verifier.toml   Mesmo papel do spec-verifier, para o Codex
docs/
  README.md                   MAPA: onde está cada assunto + leitura mínima por tipo de tarefa
  ESTADO.md                   PAINEL VIVO (1 página): iniciativa ativa, próxima tarefa,
                              bloqueios, decisões pendentes, último checkpoint verde
  PRODUCT.md  DESIGN.md  COPY.md   (caminhos mantidos; resumos canônicos para agentes)
  produto/
    estrategia.md             ← 08 (definição, IA em 3 horizontes, diferenciação, negócio)
    persona-joao.md           ← 14
    regras.md                 NOVO — regras de produto vigentes, cada uma com a origem
    funcionalidades.md        NOVO — inventário: função → estado (real/local/simulada…) → spec
    backlog.md                NOVO — pendências reais, com origem, prioridade e dependência
    lancamento.md             NOVO — checklist de lançamento do proprietário (§I)
  arquitetura/
    visao-geral.md            NOVO — stack, rotas, módulos, fronteiras, code splitting, build
    contratos.md              NOVO — contratos vigentes (jornada, nivelamento, conclusão,
                              recompensa, feedback, tutor, API do servidor)
    dados.md                  NOVO — estado local (v6→v7) e modelo do servidor (Postgres)
    conteudo.md               NOVO — pacotes, versões, reviewKind, retired, oficial (←34)
    taxonomia-habilidades.md  ← 33 (gerado; o script passa a escrever aqui)
  design/
    sistema-rabisco.md        ← 18 (norma do design system; as fases ficam marcadas históricas)
    mascote.md                NOVO — ←15 §3–§5 + 44 §6 (onde a Foca aparece, 8 expressões)
    gamificacao-e-som.md      NOVO — ←16 §5/§6/§9 + 20 §5/§6 + 24
    brand/                    ← docs/design/brand/
    audio/                    ← docs/design/audio/v2/ (v2/) e docs/design/audio/candidatos/ (candidatos/)
  copy/                       (mantido) 01–06 + inventario.md (←21) + auditoria-2026-09-28.md
  seguranca/
    README.md                 NOVO — política, níveis L1/L2/L3, checklist por tipo de mudança
    modelo-de-ameacas.md      NOVO (§F)
    privacidade.md            NOVO — inventário de dados, finalidades, bases, retenção, menores
    auditorias/               relatórios com data (resumo; o bruto fica em .security-review/)
  operacao/
    ambientes-e-deploy.md     NOVO — local/teste/preview/produção, variáveis, segredos, CI, Vercel
    runbooks.md               NOVO — incidente, restauração, rotação de segredo, abuso de IA
  legal/
    README.md                 NOVO — versões publicadas, pendências jurídicas, histórico de mudanças
                              (o texto canônico vive em src/content/legal/, §H.4)
  decisoes/
    README.md                 NOVO — índice das decisões (ADR)
    0001-hospedagem-vercel.md …  NOVO — decisões curtas: contexto, opções, escolha, consequências
  specs/
    README.md                 NOVO — specs ativas e seus estados
    46-producao/              ESTE PLANO depois de aprovado: spec.md, tarefas.md, registro.md
  ai/
    SDD-WORKFLOW.md           reescrito: estados, retomar, próxima tarefa, checkpoints
    SKILL-ROUTING.md          reescrito: matriz operacional (§D.3)
    SKILLS.md                 enxugado: catálogo (o que existe, onde, para qual agente)
    skills-registry.json      ← .claude/skills-registry.json (um catálogo só, para os dois agentes)
    templates/                spec.md, tarefas.md, registro.md, adr.md, resumo.md
  historico/
    README.md                 MAPA ID → caminho + resumo de 1 parágrafo por iniciativa encerrada
    fundacao/                 00-constituicao, 01–04, 07, 09–13, 17, 23, 35 (origem e pitch)
    iniciativas/NN-tema/      plano(s) + registro + resumo.md de cada iniciativa concluída
    00-README-2026-09.md      o índice antigo, preservado
```

### C.3 Responsabilidade de cada área

| Área | Responde a | Quem atualiza e quando |
|---|---|---|
| `AGENTS.md` | "Quais são as regras duras e por onde começo?" | Só quando muda uma regra dura ou um caminho de entrada |
| `docs/README.md` | "Onde está X?" | Quando nasce ou morre uma área |
| `docs/ESTADO.md` | "O que está em andamento e qual é a próxima tarefa?" | **Ao fim de cada tarefa** (checkpoint) |
| `produto/` | O quê e por quê; regras de produto; backlog; lançamento | Em decisões de produto e no encerramento de uma iniciativa |
| `arquitetura/` | Como funciona hoje; contratos; dados | Na mesma entrega que muda o contrato |
| `design/`, `copy/` | Como parece e como fala | Idem |
| `seguranca/`, `legal/` | Riscos, controles, dados pessoais, texto legal | Toda mudança que toque dado pessoal, autenticação, IA ou fornecedor |
| `operacao/` | Como rodar, publicar e recuperar | Toda mudança de ambiente, variável ou fornecedor |
| `decisoes/` | Por que escolhemos X | Uma ADR por decisão técnica ou de produto relevante |
| `specs/` | O que foi aprovado para fazer agora | Enquanto a iniciativa estiver ativa |
| `historico/` | Como chegamos aqui | No encerramento de uma iniciativa |
| `ai/` | Como agentes trabalham aqui | Quando muda o fluxo ou uma skill |

### C.4 Fonte canônica por assunto

| Assunto | Fonte canônica | Resumos que apontam para ela |
|---|---|---|
| Regras duras para agentes | `AGENTS.md` | `CLAUDE.md` (importa) |
| Estado e próxima tarefa | `docs/ESTADO.md` | `docs/README.md` |
| Produto e posicionamento | `produto/estrategia.md` | `PRODUCT.md` |
| Persona | `produto/persona-joao.md` | `PRODUCT.md`, `copy/01` |
| Regras de produto vigentes | `produto/regras.md` | `PRODUCT.md` |
| Estado de cada funcionalidade | `produto/funcionalidades.md` | `PRODUCT.md` |
| Pendências | `produto/backlog.md` | `ESTADO.md` (só as da iniciativa ativa) |
| Contratos de código | `arquitetura/contratos.md` + tipos em `src/` | Comentários `docs/NN` (históricos) |
| Modelo de dados | `arquitetura/dados.md` + `src/server/db/schema.ts` + migrações | — |
| Design system | `src/styles.css` > `design/sistema-rabisco.md` | `DESIGN.md` |
| Voz e copy | `20` §7.1 (norma de origem) → `COPY.md` e `copy/` | `PRODUCT.md` |
| Texto legal | `src/content/legal/*` (versionado) | `legal/README.md` |
| Dados pessoais e retenção | `seguranca/privacidade.md` | Política de privacidade |
| Skills: o que existe | `ai/skills-registry.json` | `ai/SKILLS.md` (tabela gerada) |
| Skills: quando usar | `ai/SKILL-ROUTING.md` | `foca-sdd` |

### C.5 Tabela de migração (caminho atual → ação → caminho futuro)

Legenda da ação: **mover** (`git mv`, preserva o histórico) · **extrair** (as regras vigentes vão para o documento canônico com a origem citada; o original é arquivado) · **reescrever** · **criar** · **manter** · **remover** (§C.6).

| Caminho atual | Ação | Caminho futuro | Justificativa | Referências afetadas |
|---|---|---|---|---|
| `AGENTS.md` | reescrever | `AGENTS.md` | Hoje o Codex só recebe 641 bytes | Nenhuma quebra; o `CLAUDE.md` passa a importá-lo |
| `CLAUDE.md` | reescrever (≤ 150 linhas) | `CLAUDE.md` | Tem 27 KB e repete histórico; o Codex não o lê | Skills e agentes citam seções dele |
| `README.md` | reescrever | `README.md` | Diz "Flash Test", `npm`, Netlify | — |
| `docs/README.md` | mover + criar | `docs/historico/00-README-2026-09.md`; novo `docs/README.md` + `docs/ESTADO.md` | Sete blocos "vigentes" sobrepostos | `CLAUDE.md`, `foca-sdd`, `spec-verifier`, `SDD-WORKFLOW`, registry `contextFiles`, cerca de 20 docs |
| `docs/historico/fundacao/00-constituicao.md`, `01`, `02`, `03`, `04`, `07` | mover | `docs/historico/fundacao/` | Contexto Pre College encerrado. A regra "IA no centro" vai para `produto/regras.md` | Cerca de 25 links internos |
| `docs/produto/estrategia.md` | mover + atualizar o cabeçalho | `docs/produto/estrategia.md` | Continua sendo a fonte de produto; §8 e §9 marcadas históricas | `CLAUDE.md`, `.agents/product-marketing.md`, `PRODUCT.md`, cerca de 9 docs |
| `docs/09`, `10`, `11`, `12`, `13`, `17`, `23`, `35` | mover | `docs/historico/fundacao/` | Históricos ou substituídos (`09`→`18`, `23`→`24`, `35`→`36`) | Cerca de 40 links internos; comentários em `src/` (só o `09`, 2) |
| `docs/produto/persona-joao.md` | mover | `docs/produto/persona-joao.md` | Vigente | `.agents/product-marketing.md`, `automacao-instagram/*.md` (texto), 11 docs |
| `docs/historico/fundacao/15-mascote-e-voz.md` | extrair §3–§5 → `design/mascote.md`; mover o resto | `docs/historico/fundacao/15-…` | Só §3–§5 ainda valem (`44` L7); §6–§8 foram substituídas por `copy/04` | 14 arquivos em `src/`+`tests` (comentários), `automacao-instagram/AGENTE.md` (texto) |
| `docs/historico/fundacao/16-gamificacao-e-dopamina.md` | extrair §5, §6, §9 → `design/gamificacao-e-som.md` e `produto/regras.md` | `historico/fundacao/` | Parcialmente substituído por `20` §5/§6/§12 | 6 comentários |
| `docs/design/sistema-rabisco.md` | mover + marcar as fases como históricas | `docs/design/sistema-rabisco.md` | É a norma do design system (26 citações em `src/`) | `CLAUDE.md`, `DESIGN.md`, `src/styles.css:36`, `src/lib/brand.ts:2` (comentários) |
| `docs/19` | mover | `historico/iniciativas/18-rabisco/registro.md` | Registro concluído | 6 links |
| `docs/20` + `22` | extrair (§4, §5, §6.4, §7.1, §14.2, §15.3) → `produto/regras.md`, `arquitetura/contratos.md`, `design/gamificacao-e-som.md`; mover | `historico/iniciativas/20-aprendizagem/{plano,registro,resumo}.md` | É a norma com mais citações (92). As regras continuam valendo fora do plano | 84 comentários em `src/`/`tests` (continuam válidos pelo ID) |
| `docs/copy/inventario.md` | mover | `docs/copy/inventario.md` | É inventário vivo | `src/lib/copy.ts` (comentários), `spec-verifier`, registry |
| `docs/24` | virar ADR | `docs/decisoes/0003-identidade-sonora-v2.md` | É uma decisão | 3 links |
| `docs/25`+`26`, `27`+`28`+`29`, `30`+`31`+`32`, `36`+`37`, `38`+`39`, `40`+`41`, `42`+`43`, `44`+`45` | extrair as regras vigentes (lista do §D.4) → canônicos; mover | `historico/iniciativas/NN-tema/` + `resumo.md` | Implementados; pendências vão para o backlog (T-01.4) | Muitos comentários (válidos pelo ID); `content-pipeline/README.md`, `src/content/*/README.md` (texto) |
| `docs/arquitetura/taxonomia-habilidades.md` | mover | `docs/arquitetura/taxonomia-habilidades.md` | Gerado; é referência de arquitetura | **`scripts/content/taxonomy-doc.ts:13` (execução)** |
| `docs/decisoes/0002-questoes-oficiais-enem.md` | mover | `docs/decisoes/0002-questoes-oficiais-enem.md` | É uma decisão | 8 comentários, registry |
| `docs/PRODUCT.md`, `DESIGN.md`, `COPY.md` | manter o caminho; atualizar o conteúdo | (iguais) | Lidos por ferramentas | — |
| `docs/copy/*` | manter | (iguais) | Estável e referenciado pelo código de marketing | — |
| `docs/design/brand/` | mover | `docs/design/brand/` | Agrupar o design | `CLAUDE.md`, `src/assets/branding/foca/README.md`, `automacao-instagram/marca/INDICE-REFERENCIAS.md` (texto) |
| `docs/design/audio/v2/`, `docs/design/audio/candidatos/` | mover | `docs/design/audio/v2/`, `docs/design/audio/candidatos/` | Mídia na raiz de `docs/` | **`tests/unit/audio.test.ts:21`, `scripts/foca_sound/{audit,generate,alternatives,verify}.py`, chaves de `baseline-hashes.json`/`original-audit.json` (execução)** |
| `docs/ai/templates/spec.md` | substituir | `docs/ai/templates/*.md` | Nova convenção | `foca-sdd`, registry |
| `docs/ai/SDD-WORKFLOW.md`, `SKILL-ROUTING.md`, `SKILLS.md` | reescrever | (iguais) | §D | registry `contextFiles`, `.gitignore`/`.prettierignore` (comentários) |
| `.claude/skills-registry.json` | mover + ampliar (disponibilidade por agente) | `docs/ai/skills-registry.json` | Um catálogo para os dois agentes | **`scripts/validate-skills.mjs` (execução)**, docs `ai/` |
| `.claude/skills/{foca-sdd, better-writing, …}` (9 próprias ou de terceiros compatíveis) | mover para a fonte canônica + espelho | `.agents/skills/` → espelho gerado em `.claude/skills/` | O Codex só descobre em `.agents/skills` | `skills-lock.json`, `validate-skills.mjs` |
| `.claude/skills/repo-security-review` | manter só no Claude | (igual) | Usa modelos e a ferramenta Agent do Claude | registry (marca `claude-only`) |
| `.claude/agents/spec-verifier.md` | manter + criar o equivalente | `.codex/agents/spec-verifier.toml` | O Codex não lê `.claude/agents` | — |
| `docs/_arquivo-abroad/` (excluído localmente) | decidir (D-02) | registrar no `historico/README.md` como recuperar (`git show 3307b22:docs/_arquivo-abroad/<arquivo>`) | Links já estão quebrados | 13 docs + `CLAUDE.md` |
| `docs/design/brand/Flash Test - *.html` (excluídos localmente) | decidir (D-02) | idem | idem | 10 docs |

### C.6 Limpeza de arquivos e dependências (fora de `docs/`)

| Candidato | Classe | Motivo e evidência | Impacto e cuidado |
|---|---|---|---|
| `@lovable.dev/vite-tanstack-config` (devDep) | **Migrar antes de remover** | É o build (§A.1). Os plugins úteis são pacotes públicos já instalados | Reescrever `vite.config.ts` preservando `importProtection` (segurança), alias, dedupe, `lightningcss` (declarar como devDep direta), porta 8080 (usada por `playwright.config.ts`, `README`, `capturar-telas.ts`). Verificar build, E2E, SSR, server function e o preset `vercel` (T-03.1) |
| `src/lib/lovable-error-reporting.ts` | **Migrar antes de remover** | No-op fora do editor da Lovable | Trocar por `src/lib/error-reporting.ts` (console estruturado + ponto de extensão para observabilidade) |
| `netlify.toml`; ramo `"netlify"` do preset | **Remover** (depois do T-03.1) | O deploy é na Vercel; o default netlify gera `dist/` e `.netlify/` à toa | Padrão fora da Vercel passa a ser `node-server` (já usado para medir a landing) |
| `.lovable/project.json`; bloco Lovable no `AGENTS.md`; `bunfig.toml:7` | **Migrar antes de remover** (depende da D-04) | Só faz sentido com o projeto conectado | Primeiro você desconecta o repositório no painel da Lovable, depois removemos |
| Blocos Wrangler/Cloudflare e Netlify no `.gitignore` | **Remover** | Sobras | Nenhum |
| `dist/`, `.netlify/`, `.vercel/output`, `.tanstack/tmp`, `test-results/` | **Remover (local)** | Artefatos ignorados pelo Git | Só libera disco; regeneráveis |
| `.security-review/` (24 relatórios, 2,4 MB) | **Arquivar** | Pode ter achados sensíveis; já ignorado | Manter fora do Git; o resumo que valer a pena vai para `docs/seguranca/auditorias/` |
| `Claude outputs/foca-design-system.html` | **Investigar** | Rascunho não rastreado, diferente do canônico | Recomendação: mover para fora do repo ou ignorar (D-05) |
| `edição Videos/` | **Manter** (fora do Git) | O `CLAUDE.md` dela diz "não é projeto versionado" | Adicionar ao `.gitignore` e ao `ignores` do ESLint |
| `automacao-instagram/` | **Manter** | Ferramenta independente, com `.gitignore` próprio | Versionar como pasta independente (D-05) e ignorar no ESLint raiz; nenhuma mudança de fronteira |
| `content-pipeline/` | **Manter** | Usado por scripts e testes | Nenhum |
| `scripts/marketing/og-image.ts`, `css-blocks.ts`, `capturar-telas.ts` | **Investigar/corrigir** | Caminhos quebrados depois da integração (`og-image.ts:9-12`, `css-blocks.ts:6`, `capturar-telas.ts:16`); `bun run shots` citado mas inexistente | Corrigir e registrar o script, ou remover com registro (T-03.5) |
| `.mcp.json` (`npx -y omniroute`) | **Investigar** | Sem versão fixa (cadeia de suprimento); não conectou | Recomendação: fixar a versão (D-17) |
| `.vscode/extensions.json` | **Manter** | Recomenda a extensão do Codex, que você usa | — |
| `src/routes/dashboard.tsx`, `NAV_ITEMS_V1` | **Manter** por ora | Caminho de rollback documentado (`25`) | Vai para o backlog: remover depois que o backend estabilizar |
| `src/data/ranking.ts` | **Migrar** | Turma fictícia | Sai dos fluxos de produção (T-10.1); fica como fixture de desenvolvimento |

---

## D. Regras do novo SDD e matriz de skills

### D.1 Convenção (decisão explícita deste plano, D-01)

1. **Iniciativa** = um trabalho aprovado com objetivo próprio. Ela vive em `docs/specs/NN-tema/`:
   - `spec.md` (obrigatório): contexto, objetivos, não objetivos, requisitos, contratos, critérios globais `G-x`. Uma iniciativa pequena põe as tarefas aqui mesmo.
   - `tarefas.md` (opcional): tarefas `T-FF.n` com estado e evidência.
   - `registro.md` (obrigatório ao iniciar a execução): o que foi feito, divergências `D-x`, números reais de teste, decisões.
2. **NN** é o próximo número livre, **permanente**. Um documento arquivado mantém o número.
3. **Decisão** = ADR curta em `docs/decisoes/NNNN-tema.md`: contexto, opções, escolha, consequências, data e quem decidiu.
4. **Encerramento de iniciativa** (T-01.2 define a checklist):
   - conferir o registro contra o código e os testes;
   - extrair regras e contratos para os canônicos;
   - levar as pendências ao backlog;
   - escrever `resumo.md` (o que mudou, decisões, evidência, limitações);
   - mover para `historico/iniciativas/`.
   Um plano arquivado deixa de ser leitura obrigatória. Continua sendo consulta de detalhe.
5. **Cabeçalho** de todo documento canônico ou de spec (frontmatter YAML):
   ```yaml
   ---
   estado: aprovado          # ver D.2
   atualizado: 2026-09-29
   canonico-de: [regras de produto]   # só em documentos canônicos
   substitui: []                       # IDs ou caminhos
   substituido-por: null
   ---
   ```
6. **Git:**
   - Nunca reescrever histórico publicado (sem force-push nem rebase ou amend de commit enviado). A regra continua depois da Lovable porque o push para `main` dispara o deploy na Vercel.
   - Commit, push, PR e deploy só com pedido explícito.
7. **Quem decide o quê:** agentes decidem questões técnicas reversíveis e de baixo risco, e registram. Produto, marca, gasto, dado pessoal, fornecedor e texto legal são do proprietário.

### D.2 Estados e transições

**Documentos e specs**

| Estado | Significado | Transição permitida para | Quem move e com que evidência |
|---|---|---|---|
| `rascunho` | Em escrita | `aguardando-aprovacao` | Agente, quando todas as seções obrigatórias estiverem preenchidas |
| `aguardando-aprovacao` | Pronto para decidir | `aprovado`, `rascunho` (ajustes) | Proprietário, por escrito; registrar a data e o escopo aprovado |
| `aprovado` | Autorizado, ainda não iniciado | `em-execucao` | Agente, ao iniciar a primeira tarefa |
| `em-execucao` | Há tarefa em andamento | `bloqueado`, `concluido` | Agente |
| `bloqueado` | Não avança sem algo externo | `em-execucao` | Precisa de motivo e de dono (você, fornecedor, decisão) |
| `concluido` | Todos os `G-x` têm evidência ou pendência registrada no backlog | `arquivado` | Agente, depois da verificação (spec-verifier) |
| `substituido` | Outro documento assumiu o assunto | `arquivado` | Registrar `substituido-por` |
| `arquivado` | Em `historico/`, com resumo | — | — |

**Tarefas**

| Estado | Regra |
|---|---|
| `pendente` → `em-andamento` | Só com as dependências `concluida` |
| `bloqueada` | Motivo, dono e o que desbloqueia |
| `concluida` | Critério de aceite com evidência (comando e saída, arquivo, captura) |
| `cancelada` / `adiada` | Motivo; `adiada` vira item de backlog |

### D.3 Matriz operacional de skills

**Disponibilidade:**
- **[repo]** = skill do repo, que depois do T-02.2 fica visível no Claude e no Codex.
- **[C]** = só Claude.
- **[C-plug]** = plugin habilitado no projeto; a disponibilidade depende do host e não carregou nesta sessão.
- **[X]** = só Codex.

**Regra de obrigatoriedade.** "Obrigatória" vale quando a skill está disponível. Quando não está, a **alternativa** passa a ser obrigatória, e o registro anota "skill X indisponível; usei Y".

**Limites que continuam valendo:**
- no máximo 3 skills primárias e 1 de revisão por tarefa;
- nunca as cinco de design juntas;
- nenhuma skill de copy em conteúdo pedagógico.

| Tarefa e gatilho | Contexto obrigatório | Obrigatórias | Recomendadas | Opcionais | Ordem | Não usar quando | Revisão e validação | Evidência | Sem a skill |
|---|---|---|---|---|---|---|---|---|---|
| **Retomar / próxima tarefa** ("continue", "próxima", troca de sessão) | `AGENTS.md` → `ESTADO.md` → tarefa na spec → fim do `registro.md` | `foca-sdd` [repo] | — | — | ler → `git status` → verificar → executar | — | Checkpoint no `ESTADO.md` | ESTADO atualizado | Seguir o §D.5 à mão |
| **Planejamento / spec nova** ("quero…", sem spec) | `produto/estrategia.md`, `persona-joao.md`, `regras.md`, `funcionalidades.md` | `foca-sdd` | `superpowers:brainstorming` ou `agent-skills:interview-me` [C-plug] (uma só) | `superpowers:writing-plans` [C-plug] | descobrir → escrever `spec.md` → aprovação | Escopo já aprovado | Proprietário aprova | `spec.md` com estado | Template `ai/templates/spec.md` |
| **Execução de spec** ("T-05.2") | Tarefa + dependências + contratos citados | `foca-sdd` | `superpowers:executing-plans` [C-plug] | `subagent-driven-development` [C-plug] se as tarefas forem independentes | 1 tarefa por vez | — | `spec-verifier` [C] / `.codex/agents/spec-verifier` [X] | Critério → evidência | Checklist da tarefa |
| **Backend / API** (server fn, rota de servidor, regra de negócio) | `arquitetura/visao-geral.md`, `contratos.md`, `dados.md`, `seguranca/README.md` | `foca-backend` [repo] (criada no T-06.7) | `agent-skills:api-and-interface-design` [C-plug]; `superpowers:test-driven-development` [C-plug] | `tanstack-start` [C-plug] (referência, conferir o viés Cloudflare) | contrato → teste → código | UI pura | L2 (§F.4) + `/code-review` [C] ou `review-agent` [X] | Testes de integração com 2 usuários | Documentação oficial (TanStack, Better Auth, Drizzle) + checklist do `seguranca/README.md` |
| **Banco / migração** | `dados.md`, ADR do banco | `foca-backend` | — | — | esquema → `db:generate` → revisar o SQL → `db:migrate` local → teste | — | Revisar o SQL gerado; migração reversível ou plano de rollback | Migração versionada + teste | Documentação do Drizzle |
| **Autenticação / sessão / conta** | `seguranca/modelo-de-ameacas.md`, `privacidade.md`, ADR de auth | `foca-backend` | `agent-skills:security-and-hardening` [C-plug] | — | ameaça → controle → teste | — | **L2 obrigatório** + testes de isolamento | Testes de ataque (§F.5) | Checklist de auth do `seguranca/README.md` + documentação do Better Auth |
| **Segurança L1** (toda mudança de código) | `seguranca/README.md` | — | — | — | — | — | Checklist L1 | Linha no registro | — |
| **Segurança L2** (auth, dado pessoal, IA, upload, dependência, headers, deploy) | + modelo de ameaças | `agent-skills:security-and-hardening` [C-plug] **ou** checklist L2 | `/security-review` [C] | `repo-security-review --pr` [C] | — | — | Achados classificados (§F.6) | Relatório no registro | Checklist L2 + `review-agent` [X] |
| **Segurança L3** (antes de expor contas ou de vender) | Tudo de `seguranca/` | `repo-security-review` completo [C] | `/security-review` [C] | — | segredos → dependências → código → validação | — | Auditoria final (T-12.5) | `docs/seguranca/auditorias/AAAA-MM-DD.md` | gitleaks + osv-scanner + semgrep à mão + revisão manual (Codex) |
| **Frontend / UI nova** | `DESIGN.md`, `design/sistema-rabisco.md` (seção), `mascote.md` | — | `vercel-react-best-practices` [repo]; `frontend-design` [C-plug] | `ui-ux-pro-max` [C-plug] (pesquisa) | implementar → revisar | Só backend | `web-design-guidelines` [repo] | E2E + capturas 320/390/1280 | Seções do `DESIGN.md` + checklist a11y |
| **Refino de UI** | idem | — | `impeccable` [C-plug] | `design-taste-frontend` [repo] | critique → polish | Tela nova (usar a linha acima) | `web-design-guidelines` | Antes/depois | `web-design-guidelines` |
| **UX / fluxo** (cadastro, importação, exclusão de conta) | `persona-joao.md`, `copy/03`, `regras.md` | — | `better-writing` [repo] (texto) | `design:ux-copy` [C] | fluxo → estados (vazio, erro, sucesso) → texto | — | `web-design-guidelines` | E2E de todos os estados | `copy/03` §2 |
| **Acessibilidade** | `PRODUCT.md` → Accessibility | `web-design-guidelines` [repo] em UI nova | `design:accessibility-review` [C] | — | — | — | axe (`@axe-core/playwright`) nos E2E | Relatório do axe sem violações sérias | axe + teclado manual |
| **Copy de interface** | `COPY.md` (nível pela tarefa), `copy/03` | Pelo `SKILL-ROUTING` §2.1 | `better-writing` | — | — | Conteúdo pedagógico, prompt do tutor, `voz.ts` | Teste de voz | Inventário `copy/inventario.md` | Guia `COPY.md` |
| **Texto legal** (termos, privacidade) | `seguranca/privacidade.md`, `legal/README.md`, fontes oficiais | — (nenhuma skill de copy altera substância jurídica) | `better-writing` **só** para clareza de frase, sem mudar o sentido | — | fatos do sistema → rascunho → pendências → revisão jurídica | Marketing, persuasão | **Revisão jurídica humana obrigatória antes de publicar** | Pendências listadas | — |
| **Conteúdo pedagógico** | `copy/05`, `decisoes/0002` | nenhuma de copy | — | — | — | — | Revisão factual | — | — |
| **Foca IA (prompt, cota, contexto)** | `copy/04`, `contratos.md` (tutor), `modelo-de-ameacas.md` | — | — | — | — | Humanizer no prompt | L2 + `tests/unit/brand-voice.test.ts` | Testes de injeção e cota | — |
| **Testes** | Critério da tarefa | — | `superpowers:test-driven-development` **ou** `agent-skills:test-driven-development` (uma) | agent `test-engineer` [C-plug] | teste falhando → código → verde | — | Suite completa da fase | Saída real dos comandos | Escrever o teste antes, à mão |
| **Depuração** | Reprodução | `superpowers:systematic-debugging` [C-plug] | `agent-skills:debugging-and-error-recovery` [C-plug] | — | reproduzir → isolar → teste → corrigir | — | `/code-review` | Teste de regressão | Checklist de depuração do `SDD-WORKFLOW` |
| **Refatoração** | Código e testes existentes | — | `agent-skills:code-simplification` [C-plug] | `/simplify` [C] | — | Mudança de comportamento | `/code-review` / `review-agent` | Testes verdes antes e depois | — |
| **Performance** | `44`/`45` resumo (code splitting) | — | `vercel-react-best-practices` [repo] | agent `web-performance-auditor` [C-plug] | medir → mudar → medir | — | Lighthouse (`scripts/marketing/lighthouse.ts`) | Números antes e depois | — |
| **Documentação / SDD** | `ai/SDD-WORKFLOW.md`, templates | — | `agent-skills:documentation-and-adrs` [C-plug] (formato) | — | — | — | `bun run docs:check` (links) | Links sem erro | Templates |
| **Deploy / operação** | `operacao/ambientes-e-deploy.md` | — | `agent-skills:shipping-and-launch` [C-plug] | — | — | Sem pedido do proprietário | Checklist de release | Registro do deploy | Checklist do `operacao/` |

**Lacunas e solução verificável**

| Lacuna | Proposta | Verificação |
|---|---|---|
| Nenhuma skill de backend, banco ou auth, para os dois agentes | Criar a skill local `foca-backend` **depois** que as convenções existirem (T-06.7), com o padrão real: server fn + sessão, Drizzle, migrações, erros, teste com 2 usuários | `validate-skills` a encontra nos dois agentes; uma tarefa de backend a usa e o registro cita |
| Nenhuma skill de LGPD ou menores | **Não criar skill.** A checklist vive em `seguranca/privacidade.md` e o `foca-sdd` manda lê-la quando a tarefa toca dado pessoal | O `foca-sdd` contém a regra; o spec-verifier checa |
| Plugins do Claude dependem do host | A matriz sempre traz uma alternativa | — |
| Codex sem skills do projeto | `.agents/skills/` canônica + espelho para `.claude/skills` (T-02.2) + agente TOML (T-02.6) | Sessão do Codex lista as skills do projeto (registrar a transcrição) |
| Ferramentas do `repo-security-review` ausentes | Instalar gitleaks, osv-scanner e semgrep como ferramentas locais (T-12.3, depois da aprovação) | `--version` de cada uma no registro |

### D.4 Regras vigentes que saem dos planos para os canônicos (T-01.3)

A lista completa (63 itens) está no inventário da investigação e vira `produto/regras.md` + `arquitetura/contratos.md` + `design/*`. Cada regra leva a origem (`20 §4.1`). Grupos:

- **Produto e voz:** `20` §7.1, `14` §0, `00-constituicao` ("IA no centro"), `16` §9 (linhas que não se cruzam), `15` §3/§4.
- **Contratos de aprendizagem:** `20` §4–§6 (feedback imutável, tutor só sob demanda, intensidades, áudio); `25` §6.2–§6.6 (nós, composição de lição, progressão, XP); `30` §9–§13 (Mastery, `ALGO_VERSION`, motor 70/20/10 com janela de 10, nivelamento CAT, checkpoints); `36` RF-2…RF-18 (atividade, `attemptKey`, `seq`, reposição, finalização única do nivelamento, persistência).
- **Arquitetura e web:** `44` §3 (code splitting, que não pode regredir), `44` §4–§7 (desktop, ícone, PWA), `27` §14 (hospedagem).
- **Conteúdo:** `34` (questões oficiais), `36` §G (reviewKind, retired, validadores), `30` §19 (pipeline).
- **Design:** `18` §6–§8 e §12.4 (paleta, geometria, dark mode), `44` I-4/I-5.
- **Marketing:** `40` §9.2/§9.4 + `42` U-1…U-5 (afirmações permitidas).

**Critério de aceite da extração:** cada regra dos 63 itens aparece exatamente uma vez num canônico, com a origem. O spec-verifier confere por amostragem de 20 regras contra o plano de origem.

### D.5 Fluxos mínimos para agentes

**Retomar o projeto (≤ 4 leituras)**
1. `AGENTS.md`, que carrega sozinho.
2. `docs/ESTADO.md`: iniciativa ativa, tarefa em curso, próximo passo, bloqueios, último checkpoint verde (commit e comandos).
3. A tarefa na spec ativa: só a seção dela e os contratos que ela cita.
4. As últimas entradas do `registro.md`.

Depois: `git status` e `git log -5`, para conferir se o repositório bate com o checkpoint. Se tocou código, rodar `bunx tsc --noEmit` e `bun test tests/unit` antes de continuar. **Divergência entre ESTADO e repositório = parar e registrar**, nunca "consertar" às cegas.

**Executar a próxima tarefa aprovada**
1. No `ESTADO.md`, a primeira tarefa `pendente` sem dependência aberta e sem bloqueio. Se não houver, **parar e perguntar**.
2. Carregar as skills que a matriz indica para o tipo da tarefa.
3. Implementar, testar e revisar.
4. Checkpoint:
   - estado da tarefa + evidência no `registro.md`;
   - `ESTADO.md` (próxima tarefa, comandos verdes);
   - backlog, se sobrar pendência.

**Checkpoint obrigatório** ao fim de cada tarefa e antes de qualquer pausa longa. É ele que permite trocar de sessão sem perder o fio.

---

## E. Arquitetura recomendada de backend, autenticação e dados

### E.1 Alternativas comparadas (fontes oficiais consultadas em 29/09/2026)

**Banco**

| Critério | **Neon Postgres** (recomendado) | Supabase | Turso |
|---|---|---|---|
| Tipo | Postgres gerenciado, serverless | Postgres + plataforma (auth, storage, realtime) | SQLite/libSQL |
| Região Brasil | `aws-sa-east-1` (São Paulo), fixa na criação | `sa-east-1` | — (não pesquisado a fundo) |
| Plano gratuito | 0,5 GB/projeto, 100 CU-h/mês, restauração de 6 h, dorme após 5 min | 500 MB, **pausa depois de 1 semana sem uso**, sem backup | 5 GB |
| Entrada paga | Launch: por uso (US$ 0,106/CU-h, US$ 0,35/GB-mês), restauração até 7 dias | Pro: US$ 25/mês, backup diário de 7 dias | US$ 4,99/mês |
| Vercel | Integração no Marketplace; **banco por preview** automático | Integração existe | — |
| Portabilidade | Postgres puro (pg_dump) | Postgres + dependência dos serviços dela | SQLite |
| Por que sim ou não | Postgres padrão, branch por preview, custo inicial baixo, sem aprisionamento | Bom, mas a vantagem é a plataforma, que não vamos usar; plano grátis pausa | Não é Postgres; ecossistema de auth menor |

**Autenticação**

| Critério | **Better Auth** (recomendado) | Clerk | Supabase Auth | Auth.js |
|---|---|---|---|---|
| Onde ficam os dados | **No nosso Postgres (Brasil)** | Na Clerk (EUA, sem escolha de região; fonte secundária) | No Postgres do Supabase | No nosso banco |
| TanStack Start | Integração oficial (`tanstackStartCookies`, handler em `src/routes/api/auth/$.ts`) | SDK oficial | Via SDK JS | Exemplo oficial; o projeto "agora faz parte do Better Auth" |
| E-mail + senha, verificação, redefinição | Nativo (scrypt; resposta igual para e-mail existente ou não) | Nativo | Nativo (exige SMTP próprio) | Fraco |
| Google | Nativo | Nativo | Nativo | Nativo |
| Sessões revogáveis | Sim (listar, revogar, revogar as outras) | Sim | Sim | Limitado |
| Rate limit | Embutido; armazenamento `database` para serverless | Gerenciado | Gerenciado | Não |
| Custo | Biblioteca, R$ 0 | Grátis até 50 mil usuários retidos; depois US$ 25/mês + excedente | Incluído no Supabase | Biblioteca |
| Risco | Somos responsáveis pela configuração | Dados de menores fora do Brasil, dependência de fornecedor | Amarra ao Supabase | Maturidade em senha |

**Recomendação (D-06):**
- Neon (sa-east-1, conta Neon ligada à Vercel pelo Marketplace no modo "Neon-managed", que apaga o banco do preview quando a branch é apagada).
- Drizzle ORM 0.45 + drizzle-kit.
- Better Auth 1.7.
- Resend para e-mail, enviando de `sa-east-1` com domínio verificado.
- **Sem Redis no início:** o rate limit do Better Auth e as cotas de IA ficam no Postgres, com contadores atômicos. Upstash e o WAF da Vercel entram se o volume ou o abuso pedirem (alternativas no §K).
- Função da Vercel na região `gru1` (São Paulo).

**Por que não algo distribuído:** um app, um banco, um provedor de e-mail. Não há fila, worker nem microserviço. Rotinas de retenção rodam em Vercel Cron.

### E.2 Modelo de dados (Postgres)

Convenções:
- ids `uuid`, gerados pelo cliente quando o registro nasce offline (idempotência);
- `created_at`/`updated_at` em `timestamptz`;
- `user_id` em toda tabela de dado do aluno, com `ON DELETE CASCADE`;
- toda consulta filtra por `user_id` na camada de servidor (§E.5).

| Tabela | Colunas principais | Restrições e índices | Observação |
|---|---|---|---|
| `user`, `session`, `account`, `verification` | Do Better Auth (geradas por `npx auth@latest generate`) | `user.email` único; `session.token` único; índice `session.user_id` | `account` guarda o hash da senha e o vínculo com o Google |
| `profile` | `user_id` PK/FK, `plano` (`gratis` \| `pro`, padrão `gratis` — D-12; só o servidor altera), `first_name` (≤ 40), `birth_year` (smallint), `age_band` (`adulto` \| `17` \| … derivado), `level`, `residence_state` (UF), `target_course`, `target_institution`, `exam_targets` jsonb, `study_prefs` jsonb (minutos, foco, matérias), `onboarding_version`, `onboarded_at` | `check` de UF e faixa de `birth_year` | **Minimização:** sem data completa de nascimento, escola, cidade ou telefone |
| `legal_acceptance` | `id`, `user_id`, `document` (`termos` \| `privacidade`), `version`, `accepted_at` | único (`user_id`, `document`, `version`) | Aceite contratual; sem IP (minimização) |
| `consent` | `id`, `user_id`, `purpose` (ex.: `responsavel_foca_ia`), `granted_by` (`titular` \| `responsavel`), `guardian_email_hash`, `granted_at`, `revoked_at` | índice (`user_id`, `purpose`) | Consentimentos específicos, separados do aceite (§H.4) |
| `attempt` | `id` uuid (cliente), `user_id`, `item_id`, `item_version`, `skill_ids` text[], `role`, `answer`, `correct` (**recalculado no servidor**), `source`, `duration_ms`, `answered_at`, `local_date`, `activity_attempt_key`, `origin` (`live` \| `import`) | PK (`user_id`, `id`); índices (`user_id`, `answered_at`), (`user_id`, `item_id`) | Fonte dos fatos de aprendizagem |
| `completion` | `user_id`, `key` (ex.: `atividade:<attemptKey>`, `licao:<id>@v`), `kind`, `completed_at`, `origin` | PK (`user_id`, `key`) | Conclusão idempotente (contrato `36` RF-6) |
| `xp_ledger` | `user_id`, `key`, `xp` (smallint, `check 0..100`), `reason`, `created_at` | PK (`user_id`, `key`) | O servidor calcula o XP pelas regras do `25` §6.2/`36`; o cliente nunca informa o valor |
| `study_day` | `user_id`, `local_date`, `tz` | PK (`user_id`, `local_date`) | Streak e congelamentos são derivados (regra `41` V-4) |
| `learning_doc` | `user_id` PK, `rev` int, `schema_version`, `doc` jsonb (jornada, nivelamento, `skillModel`, revisão, flashcards, dicas, sessão ativa) com limite de tamanho (ex.: 512 KB), `updated_at` | concorrência otimista por `rev` | Estado de planejamento do motor adaptativo. **Não é autoridade para recompensa** |
| `data_import` | `id` (import_id), `user_id`, `device_id_hash`, `status`, `summary` jsonb, `created_at` | único (`user_id`, `id`) | Idempotência da migração (§G) |
| `ai_usage` | `user_id`, `day`, `messages`, `images`, `input_tokens`, `output_tokens`, `cost_micros` | PK (`user_id`, `day`) | Cota e custo; **o conteúdo do chat não é guardado** (D-13) |
| `ai_budget` | `day` PK, `cost_micros` | — | Teto global diário (disjuntor) |
| `rate_limit` | do Better Auth (`key`, `count`, `last_request`) + as nossas chaves | PK `key` | Janela fixa, em Postgres |
| `audit_event` | `id`, `user_id` nullable, `type` (login, falha de login, troca de senha, exclusão, exportação, importação, cota excedida), `request_id`, `ip_prefix` (/24 ou /48), `created_at` | índice (`created_at`) | Sem conteúdo; retenção de 6 meses (§F, §H) |

**Migrações:** SQL versionado em `drizzle/` (`drizzle-kit generate`), revisado à mão e aplicado com `drizzle-kit migrate` pela conexão **direta** (não o pooler). Toda migração precisa ser aditiva ou ter plano de reversão escrito. Uma migração destrutiva exige uma tarefa própria.

### E.3 Identidade, conta, onboarding e sessões

**Conta obrigatória (§0, D-07 — decisão do proprietário):** não há modo convidado. A landing e o onboarding de perfil (`/quiz`) continuam públicos, e as respostas do onboarding ficam no aparelho até o cadastro, quando são copiadas para o `profile`. Toda rota de estudo (`/trilha`, `/atividade`, `/learn`, `/study`, `/nivelamento`, `/flashcards`, `/redacao`, `/progress`, `/plan`, `/topics`, `/profile`, `/aha`) exige sessão: sem ela, o aluno vai para `/cadastro` (ou `/login`), com volta para onde estava. Quem tem menos de `MIN_ACCOUNT_AGE` (17) não cria conta e, portanto, não usa o app (D-08).

**Cadastro:**
- e-mail + senha (8–128 caracteres; o Better Auth aplica scrypt), ou Google;
- ano de nascimento, que dá a faixa etária (§H.3, D-08);
- aceite dos termos e da política vigentes (versão registrada);
- o perfil do onboarding (`/quiz`) é copiado para o `profile`.

**Verificação de e-mail:** obrigatória antes do login por senha (`requireEmailVerification`). Link com validade curta. Reenvio limitado por rate limit. Uma conta criada pelo Google já vem verificada.

**Recuperação:** link de redefinição por e-mail. A resposta é igual exista ou não a conta. A redefinição revoga todas as sessões (`revokeSessionsOnPasswordReset`).

**Vínculo com o Google:** implícito só quando o e-mail do Google é verificado **e** a conta local já está verificada. Sem `trustedProviders`, o que evita o sequestro por pré-cadastro com o e-mail de outra pessoa. O teste está no §F.5.

**Sessões:**
- cookie `HttpOnly`, `Secure`, `SameSite=Lax`, com prefixo `__Secure-` em produção;
- 30 dias com renovação diária (D-14; o padrão da biblioteca é 7 dias);
- em `/conta`, listar e revogar sessões e "sair de todos os aparelhos";
- logout revoga a sessão no servidor e **apaga o cache local daquela conta** no aparelho.

**Autorização:** toda função de servidor que lê ou escreve dado do aluno começa com `requireSession()`, que devolve o `userId`. **Nenhum id de usuário chega do cliente.** Não há função administrativa no app. Correções manuais são feitas por script, com credencial separada, e registradas (§F).

**Rotas:**
- `/api/auth/$` (handler do Better Auth);
- `/login`, `/cadastro`, `/verificar-email`, `/esqueci-a-senha`, `/redefinir-senha`, `/conta`, `/termos`, `/privacidade`;
- `/signup` passa a redirecionar para `/cadastro`; `/forgot` para `/esqueci-a-senha`.

Todos os nomes finais passam pela revisão de copy.

**Code splitting (regra do `44` §3):** a raiz não importa a sessão, o store nem o `AppShell`. A sessão é lida dentro das rotas do produto (`beforeLoad`/loader), e a landing continua sem baixar o produto.

### E.4 Dados de estudo e sincronização

**Princípio:** *local-first* com o servidor como autoridade dos fatos e das recompensas.

- O motor adaptativo continua rodando no cliente (latência, uso offline). É o mesmo código de `src/lib/adaptive`.
- O servidor guarda os **fatos** (tentativas, conclusões, dias de estudo) e **calcula** XP, streak e congelamentos.
- O documento de planejamento (`learning_doc`) é sincronizado como estado do aluno. Adulterá-lo só prejudica o próprio aluno, porque não concede recompensa.

**Protocolo:**

1. **Outbox dentro do store.** As ações que já existem (`registrarResposta`, `completeJourneyActivity`, `completeMicroLesson`, `completeLesson`, revisão de flashcard, mudança de preferência, `applyPlacement`) passam a também enfileirar um evento com `id` uuid. O schema local sobe para **v7**, de forma aditiva: `account { userId, linkedAt, lastSyncAt, outbox[], docRev }`.
2. **`sync.push`** (server fn, POST). Recebe um lote de até 200 eventos e 256 KB, valida com zod e aplica **numa transação por lote**:
   - a tentativa só é aceita se `item_id`/`item_version` existirem no índice de conteúdo do servidor;
   - `correct` é recalculado pelo gabarito;
   - `answered_at` é aceito dentro de uma janela (não no futuro além de 5 min; não antes da criação da conta, salvo importação);
   - conclusões entram por chave única;
   - o XP é calculado pela regra;
   - o `study_day` é aceito só se `local_date` estiver a ±1 dia da data do servidor no fuso do aluno.
   A resposta traz o agregado oficial (XP, streak, congelamentos, conclusões) e os ids aplicados ou rejeitados, com o motivo.
3. **`sync.pull`** (no login, ao voltar ao app e a cada N minutos com a aba visível). Devolve o agregado oficial e o `learning_doc` + `rev`.
4. **Conflitos:**
   - fatos são só adicionados; uma repetição é deduplicada pelo id;
   - `learning_doc` usa `rev`: uma gravação com `rev` velho é rejeitada, o cliente recebe o atual e **reaplica** as ações pendentes da outbox (o planejador já é reconstruível pelas tentativas, contrato `ALGO_VERSION`/replay do `30` §9.6);
   - XP e streak locais são **sempre sobrescritos** pelo servidor.
5. **Falhas de rede:**
   - a outbox persiste;
   - nova tentativa com backoff exponencial (1 s … 5 min);
   - um aviso discreto quando a sincronização estiver atrasada há mais de 24 h, no padrão do `PersistenceBanner`;
   - o estudo nunca trava por falta de rede (regra `36` RF-18).

**Validado no servidor:** XP, streak, congelamentos, conclusões, correção de resposta, existência e versão do item, cotas de IA, aceite legal, faixa etária e tamanho de tudo.

**Continua estático:** banco de questões, pacotes `public/content/v1/`, lições, trilhas de redação, taxonomia, cursos e universidades. O servidor importa o mesmo índice de itens para validar (`src/content/items`). Conteúdo no banco só se houver autoria dinâmica (fora do escopo).

### E.5 Contratos de API, validação e erros

- **Transporte:** `createServerFn` do TanStack Start para chamadas do app e rota de servidor só para `/api/auth/$` e `/api/saude`. Módulos de servidor ficam em `src/server/**` (bloqueados no cliente pelo `importProtection`, preservado no T-03.1).
- **Middleware comum:**
  - `requestId`;
  - checagem de `Origin`/`Sec-Fetch-Site` em toda chamada que muda estado (CSRF);
  - sessão;
  - rate limit;
  - validação zod;
  - mapa de erros tipados → código HTTP + mensagem de copy.
  Nunca vaza stack nem SQL.
- **Idempotência:** todo evento tem id do cliente; importação tem `import_id`; exclusão de conta é repetível.
- **Concorrência:** operações de recompensa de um mesmo aluno serializadas com `SELECT … FOR UPDATE` na linha do perfil, dentro da transação.
- **Limites:** corpo ≤ 256 KB (≤ 6 MB só no tutor com foto), strings com teto, arrays com teto, jsonb com teto.

### E.6 Exportação, exclusão e encerramento

- **Exportar** (`/conta` → "Baixar meus dados"): JSON gerado no servidor com perfil, aceites, consentimentos, tentativas, conclusões, ledger, dias de estudo, `learning_doc` e uso de IA (sem conteúdo). Não inclui hashes, tokens nem sessões. Rate limit de 1 por hora.
- **Excluir conta:**
  - reautenticação recente;
  - exclusão imediata em cascata (`deleteUser` do Better Auth + `ON DELETE CASCADE`);
  - sessões revogadas;
  - cache local limpo;
  - e-mail de confirmação;
  - `audit_event` guardado só com o hash do id.
  Os backups do Neon expiram no prazo de restauração (6 h no plano gratuito, até 7 dias no Launch). A política de privacidade diz isso.
- **Contas nunca verificadas:** apagadas em 7 dias (Vercel Cron).

### E.7 Foca IA em produção

1. **Exige conta** (como todo o estudo, D-07) e respeita a política de idade e consentimento (D-08) e a cota do plano (D-12). **O fallback local continua para falha técnica ou ausência de chave**, não para contornar cota.
2. **Contexto montado no servidor** a partir do `profile`, dos agregados e do item (buscado pelo `item_id` no índice de conteúdo). O cliente envia só: mensagens (as últimas 20, até 4.000 caracteres cada), `itemId`, alternativa escolhida e o foco pedagógico validado. Resolve IA-2/D-002 e IA-3.
3. **Cota por aluno por dia, por plano (D-12):** grátis = no máximo 3 mensagens por dia (uma foto conta como mensagem); pro = 20 mensagens + 5 fotos por dia. Todo aluno começa no grátis (pagamento está fora do escopo; o campo `plano` do perfil existe para o futuro). **Teto global de custo por dia** (padrão conservador de US$ 1/dia até o proprietário definir), calculado pelo `usage` que a OpenAI devolve: acima dele, o tutor responde com o aviso de indisponibilidade e o estudo segue.
4. **Foto:** compressão no cliente (lado maior 1.600 px, JPEG ~0,8); limite de 2 MiB no servidor; nunca guardada.
5. **Salvaguardas:**
   - moderação da entrada com `omni-moderation-latest` (gratuita), D-16;
   - protocolo de autolesão que responde com recursos de apoio (CVV 188) e não segue a conversa (ECA Digital, Lei 15.211/2025 art. 17 §4 IX; Decreto 12.880/2026 art. 11);
   - aviso visível de que a Foca IA é uma inteligência artificial;
   - opção de desligar o tutor em `/conta` (art. 17 §4 VIII).
6. **Dados enviados à OpenAI:** primeiro nome (opcional; recomendação: não enviar), curso-alvo, agregados, questão e mensagens. Pela política de dados da API, o conteúdo não é usado para treino e os logs de abuso ficam até 30 dias. Isso é transferência internacional (§H).
7. **Logs:** sem o conteúdo da conversa; só status, latência, tokens e `requestId`.

### E.8 Observabilidade, backups e operação

- **Logs estruturados** (JSON) com `requestId`, rota, status e duração. Sem e-mail, sem conteúdo e sem token. Os logs da Vercel duram 1 h no Hobby e 1 dia no Pro, por isso os eventos de segurança ficam também em `audit_event`.
- **Saúde:** `/api/saude` (banco alcançável, versão do build), sem dado sensível.
- **Erros no cliente:** `src/lib/error-reporting.ts` (console). Um rastreador externo (Sentry ou similar) é decisão futura, por envolver dado de menores (fora do escopo).
- **Backup e restauração:**
  - restauração do Neon (6 h no gratuito, até 7 dias no Launch; recomendação: Launch antes de ter alunos reais);
  - ensaio de restauração numa branch (T-13.3);
  - RPO e RTO documentados. Estimativa: RPO = janela do plano; RTO < 1 h.
- **Ambientes:**

| Ambiente | Banco | E-mail | Google | Segredos |
|---|---|---|---|---|
| Local | PGlite (arquivo `.data/`) ou Postgres local | Caixa de saída em arquivo (`.data/emails/`) | Cliente OAuth de desenvolvimento (opcional) | `.env` local |
| Teste (unit/integração/E2E) | PGlite em memória, esquema novo por arquivo | Caixa de saída em memória | Não (fluxo simulado **só no ambiente de teste**) | Valores de teste |
| Preview (Vercel) | Branch do Neon por preview | Resend com destinatários restritos ou caixa de saída | Só num alias fixo de staging (o Google exige URL exata) | Variáveis `Preview` |
| Produção | Neon `main` (sa-east-1) | Resend (domínio verificado, sa-east-1) | Cliente de produção | Variáveis `Production` |

A proteção de preview (Vercel Authentication) continua ligada nos previews.

---

## F. Modelo de ameaças e plano de segurança

### F.1 Ativos

1. Contas e sessões.
2. Dados pessoais de adolescentes (perfil, desempenho).
3. Integridade de XP, streak e conclusões (que importam mais quando houver ranking real, indicação ou pagamento).
4. Orçamento de IA e a chave da OpenAI.
5. Credenciais de banco, e-mail e OAuth.
6. Disponibilidade do estudo.
7. Reputação e conformidade (LGPD, ECA Digital).

### F.2 Agentes de ameaça

- aluno curioso que edita o `localStorage` ou chama a API;
- bot ou pessoa que usa o endpoint de IA sem pagar;
- ataque de credenciais (reutilização de senha, força bruta);
- sequestro de conta por vínculo de identidade;
- pessoa com acesso ao mesmo aparelho;
- dependência maliciosa;
- vazamento acidental (log, repositório, variável `VITE_*`);
- erro operacional (migração, restauração).

### F.3 Ameaças e controles

| # | Ameaça | Controle | Verificação |
|---|---|---|---|
| T1 | Força bruta ou reutilização de senha no login | Rate limit do Better Auth em banco (3 tentativas por 10 s em `/sign-in/email`, mais regras próprias por IP e por e-mail); scrypt; mensagem genérica | Teste de integração: a 4ª tentativa recebe 429 |
| T2 | Enumeração de contas (cadastro, login, recuperação) | Respostas e tempos iguais; o cadastro com verificação não revela e-mail existente | Teste compara as respostas |
| T3 | Sequestro por pré-cadastro com o e-mail da vítima + Google | Vínculo implícito só com as duas partes verificadas; sem `trustedProviders`; senha inutilizável até verificar | Teste do cenário |
| T4 | Roubo de sessão | Cookie `HttpOnly`/`Secure`/`SameSite=Lax`; revogação; redefinição revoga tudo; CSP | Teste de flags; teste de revogação |
| T5 | CSRF em server functions | Checagem de `Origin` + SameSite; só POST muda estado | Teste com `Origin` estranho recebe 403 |
| T6 | IDOR / acesso entre alunos | `userId` só da sessão; nenhuma rota aceita id de usuário; teste A×B em **todas** as funções | Suíte `isolamento.test.ts` |
| T7 | Adulteração de XP, streak ou conclusão | O servidor recalcula; ledger idempotente; janelas de data; importação com teto | Testes de adulteração |
| T8 | Abuso de custo da IA | Conta obrigatória, cota diária, teto global, limite de tamanho, rate limit por IP para anônimos (401) | Testes de cota e de teto |
| T9 | Injeção de prompt pelo contexto | Contexto montado no servidor; conteúdo do aluno tratado como dado; saída renderizada como texto puro (já é assim) | Testes com payloads |
| T10 | XSS | React sem `dangerouslySetInnerHTML` em conteúdo de usuário (auditar); CSP com `script-src` restrito (primeiro em modo *report-only*) | Grep + CSP em produção sem violações por 7 dias |
| T11 | SSRF | O servidor nunca busca URL vinda do usuário; a foto é data URL validada pelo tipo real | Revisão do código |
| T12 | Segredo vazado | Só no servidor; `env.ts` com zod; varredura do bundle do cliente por nomes e valores de segredo; gitleaks | Teste de build |
| T13 | Dependência maliciosa | `bunfig.toml` `minimumReleaseAge` (24 h, mantido); lockfile congelado; osv-scanner; `.mcp.json` com versão fixa | Relatório do osv |
| T14 | Aparelho compartilhado | Logout apaga o cache da conta; importação de estado antigo só com escolha explícita e nunca de estado vinculado a outra conta | E2E |
| T15 | Log com dado pessoal | Logger sem campos de conteúdo; teste que falha se aparecer e-mail num log | Teste do logger |
| T16 | Perda de dados | Backups do Neon; ensaio de restauração; migrações revisadas | Registro do ensaio |
| T17 | Função administrativa exposta | Não há painel; `/debug` desligado em produção; script de manutenção com credencial separada | E2E em modo produção |
| T18 | Conteúdo nocivo para adolescentes na IA | Moderação, protocolo de autolesão, prompt com limites, aviso de IA | Testes com entradas de risco |

### F.4 Níveis de revisão (substituem o `SDD-WORKFLOW` §6)

- **L1:** toda mudança de código.
- **L2:** auth, sessão, dado pessoal, IA, upload, dependência, headers, deploy.
- **L3:** antes de ligar contas em produção e antes de vender.

### F.5 Testes de segurança obrigatórios

- Duas contas (A e B): cada função de servidor, chamada com a sessão de A e dados de B, falha, e nada vaza no erro.
- Cenários T1–T9, T14 e T15 automatizados.
- Cabeçalhos de produção checados no build local e no preview.
- **Nada de teste destrutivo ou de carga contra produção nem contra serviços de terceiros.** Carga só no preview, com limite.

### F.6 Auditoria final e classificação

A auditoria final (T-12.5) usa `repo-security-review` completo e `/security-review`. Cada achado é classificado como:
- **vulnerabilidade confirmada** (reproduzida);
- **suspeita** (não reproduzida);
- **risco aceito** (com motivo e dono);
- **limitação de validação** (o que não deu para testar e por quê).

Não se declara "seguro"; declara-se o que foi verificado.

### F.7 Resposta a incidentes (runbook no T-13.4)

Conter, avaliar e registrar. Comunicar a ANPD e os titulares em **3 dias úteis** quando houver risco ou dano relevante; o prazo dobra para agente de pequeno porte. Dado de adolescente é critério de relevância (Res. CD/ANPD 15/2024). Manter o registro de incidentes por 5 anos.

---

## G. Estratégia de migração dos dados locais

1. **O que importar** (validado com zod contra o schema v6, com tetos):
   - `profile` (nome, UF, etapa, curso e instituição-alvo, provas, preferências);
   - `learning.recentAttempts` (≤ 500);
   - `learning.completedLessons`;
   - `journey.history` (≤ 200) e conclusões por `attemptKey`;
   - `progress.lessons` (redação);
   - `progress.activityDays` (≤ 60);
   - flashcards;
   - `learning_doc` (jornada, nivelamento, `skillModel`, revisão).
   **Não importa:** `tutor.messages`, backups, `events`, `premiumTrial`, `offline`, `authed`.
2. **Recompensas não são importadas como número.** O servidor recalcula o XP a partir das conclusões e tentativas importadas, pelas regras vigentes, com teto (sugestão: o XP recalculado nunca passa do XP que o aparelho mostrava, e toda entrada leva `origin=import`). O streak é recalculado pelos `activityDays`. Assim, o `localStorage` manipulado não vira autoridade.
3. **Associar à conta certa (aparelho compartilhado):**
   - na primeira importação, o estado local ganha `account.userId`;
   - estado local já vinculado a **outra** conta nunca é oferecido para importação: a pessoa começa do zero na conta nova, e o cache da outra conta não aparece;
   - estado local **sem vínculo** (progresso anterior à exigência de conta) só é importado depois de uma **escolha explícita** numa tela com o resumo ("12 lições, 340 XP, 5 dias — levar para a sua conta?"), com as opções "Levar", "Começar do zero" e "Decidir depois";
   - depois do logout, o aparelho não guarda dados da conta: o cache é apagado e o app volta para a tela de entrada (D-14).
4. **Idempotência e falha parcial:**
   - `import_id` = hash de (`device_id` aleatório local + `schemaVersion` + tamanho + última data);
   - a importação roda **numa única transação**;
   - uma repetição com o mesmo `import_id` devolve o mesmo resultado;
   - falha de rede no meio = nada gravado e o cliente tenta de novo;
   - um estado com versão futura desconhecida é recusado com mensagem clara.
5. **Experiência durante a transição:**
   - o estudo continua funcionando localmente o tempo todo;
   - a importação acontece em segundo plano, com indicação de progresso;
   - se falhar, o dado local fica intacto e há um botão para tentar de novo;
   - o schema v7 é aditivo, então voltar para uma versão anterior do app não perde dado.
6. **Limpeza das cópias antigas:** depois de uma importação bem-sucedida, as cópias `foca.state.backup.*` (que contêm nome e e-mail) são apagadas do aparelho. Se não houver importação, continuam como estão.

---

## H. Documentos legais: plano e informações faltantes

### H.1 Base legal consultada (fontes oficiais, 29/09/2026)

| Fonte | O que importa aqui |
|---|---|
| LGPD, Lei 13.709/2018, art. 14 | Melhor interesse; criança (< 12) exige consentimento específico de um dos pais (§1); não condicionar o uso a dados além do necessário (§4); informação simples (§6) |
| Enunciado CD/ANPD nº 1/2023 | Dados de crianças e adolescentes podem usar as bases do art. 7º ou 11, se prevalecer o melhor interesse |
| **Lei 15.211/2025 (ECA Digital)**, em vigor desde 17/03/2026; Decreto 12.880/2026 | Serviço "direcionado a" ou "de acesso provável por" adolescentes: proteção máxima por padrão (arts. 3, 7); evitar uso compulsivo, incluindo "recompensas pelo tempo de uso" (art. 17 §4 II; Decreto art. 9); controle de recomendação personalizada (art. 17 §4 V); revisão e possibilidade de desligar IA não essencial (art. 17 §4 VIII); agente conversacional com transparência e salvaguardas (Decreto art. 11); **contas de usuários "de até 16 anos" vinculadas à conta de um responsável** (art. 24; o alcance fora de redes sociais ainda não está claro); canal de denúncia (art. 28); termos com classificação indicativa (Decreto art. 12 §4); proibido perfilamento para publicidade (arts. 22, 26) |
| Res. CD/ANPD 2/2022 | Agente de pequeno porte dispensado de encarregado, **exceto** em tratamento de alto risco (dados de adolescentes + larga escala ou efeito significativo) |
| Res. CD/ANPD 18/2024 | Identidade e contato do encarregado publicados em destaque |
| Res. CD/ANPD 19/2024 | Transferência internacional (EUA não é adequado): cláusulas-padrão da ANPD sem alteração, ou outra base do art. 33 |
| Res. CD/ANPD 15/2024 | Incidentes: 3 dias úteis; registro por 5 anos |
| Marco Civil, Lei 12.965/2014, art. 15 | Guarda de registros de acesso por 6 meses para **pessoa jurídica** com fins econômicos |
| CDC, Lei 8.078/1990, arts. 49, 51, 54 | Contrato de adesão claro e legível; cláusulas abusivas nulas; arrependimento de 7 dias (quando houver cobrança) |
| OpenAI Services Agreement §3.3(c) e o guia de API para menores de 18 | Menores só com consentimento dos pais ou responsáveis; menores de 13 exigem retenção zero |

### H.2 Inventário de dados (base dos textos, refeito sobre o sistema implementado no T-11.1)

| Categoria | Exemplos | Finalidade | Base legal proposta (**a confirmar juridicamente**) | Retenção proposta |
|---|---|---|---|---|
| Conta | e-mail, hash de senha, vínculo Google | Acesso | Execução de contrato (art. 7º V) | Até a exclusão da conta |
| Perfil de estudo | nome, UF, etapa, curso-alvo, provas, preferências | Personalizar o estudo | Execução de contrato | Até a exclusão |
| Faixa etária | ano de nascimento | Regras de proteção a menores | Obrigação legal / melhor interesse | Até a exclusão |
| Desempenho | respostas, conclusões, domínio estimado | Adaptar a próxima questão | Execução de contrato; melhor interesse | Até a exclusão |
| Uso de IA | contadores e custos (sem conteúdo) | Cota e custo | Legítimo interesse (**a avaliar**) | 90 dias |
| Conteúdo enviado à IA | mensagens, foto | Responder à dúvida | Execução de contrato + consentimento do responsável quando menor (OSA) | Não guardado por nós; OpenAI até 30 dias |
| Segurança | eventos de login, IP truncado | Prevenir abuso e cumprir o Marco Civil | Legítimo interesse / obrigação legal | 6 meses |
| Aparelho (localStorage) | progresso, preferências | Funcionar offline | Execução de contrato | Até a pessoa apagar |
| Cookies | cookie de sessão (essencial) | Manter o login | Essencial ao serviço | 30 dias |

**Fornecedores (operadores):**
- Vercel (hospedagem, EUA/global, função em São Paulo);
- Neon (banco, São Paulo);
- Resend (e-mail, São Paulo);
- Google (login);
- OpenAI (IA, EUA, sem região na América do Sul);
- YouTube (vídeos incorporados; política própria).

**Não há analytics nem publicidade.**

### H.3 Idade: o que muda na arquitetura (D-08)

As opções a seguir são de produto e jurídicas. Nenhuma é decisão técnica.

| Opção | Contas | Foca IA | Esforço | Risco jurídico (a avaliar por advogado) |
|---|---|---|---|---|
| **A (escolhida em 29/09/2026, D-08)** | 17+ criam conta; abaixo de 17 **não usam o app** (com D-07 não há modo convidado) | 18+ direto; 17 anos com consentimento do responsável por e-mail (fluxo leve: link, registro em `consent`) | Médio | Menor. Evita o art. 24 (vínculo de conta até 16) até haver interpretação; cumpre o OSA |
| B | 13+ com vínculo de responsável e ferramentas de supervisão (tempo de uso, configurações) | Com consentimento | **Alto**: painel do responsável, fora deste plano | Cumpre mais do ECA Digital, mas é uma iniciativa própria |
| C | Só 18+ | 18+ | Baixo | Menor risco, mas exclui boa parte da persona João (16–19) |

**Observações:**
- A autodeclaração do ano de nascimento é aceitável para serviço sem conteúdo impróprio; o ECA Digital proíbe autodeclaração só para conteúdo impróprio (art. 9). Isso ainda precisa de confirmação jurídica diante dos guias da ANPD em consulta.
- O código implementa **faixas configuráveis** (`MIN_ACCOUNT_AGE`, `TUTOR_GUARDIAN_UNDER`), para que a decisão jurídica mude um valor e não a arquitetura.

### H.4 Rotas, versões e aceite

- **Texto canônico:** `src/content/legal/termos.v1.md` e `privacidade.v1.md`, com versão e data de vigência. A renderização fica nas rotas `/termos` e `/privacidade` (SSR, indexáveis, sem depender do store).
- **Onde os links aparecem:**
  - rodapé da landing;
  - tela de cadastro;
  - `/conta`;
  - as linhas hoje mortas do perfil (`profile.tsx:300-301`).
- **Aceite contratual × consentimento:**
  - o aceite dos termos e a ciência da política ficam em `legal_acceptance`;
  - consentimentos específicos e revogáveis (responsável para a Foca IA; e-mails de novidades, se um dia existirem) ficam em `consent`, com a opção de revogar em `/conta`.
- **Mudança material** gera uma nova versão e pede novo aceite no próximo login. Correção de digitação não gera versão nova.
- **Publicação:** enquanto existir pendência do §H.5, os textos ficam marcados como **rascunho** e o cadastro em produção fica **desligado** pela flag `contasHabilitadas`. Nenhum placeholder é publicado como documento final.

### H.5 Informações que faltam (só você ou um advogado pode fornecer)

1. **Quem é o controlador:** pessoa física ou jurídica (CNPJ, MEI ou empresa), nome ou razão social, endereço para notificações.
2. **Contato de privacidade e encarregado** (nome e e-mail publicados, Res. 18/2024), ou a justificativa de dispensa (improvável: dados de adolescentes).
3. **Foro e lei aplicável; canal de atendimento** (e-mail de suporte; WhatsApp está na checklist).
4. **Decisão sobre idade** (D-08) e **classificação indicativa** declarada.
5. **Cláusulas-padrão da ANPD** com Vercel, OpenAI e Resend (verificar se os DPAs as incluem; não verificado), ou outra base para a transferência internacional.
6. **Retenções finais** e aprovação dos prazos do §H.2.
7. **Avaliação de impacto** (ECA Digital art. 16 e Decreto art. 47; RIPD da LGPD), feita ou revisada por profissional.
8. **Revisão jurídica** dos dois textos antes da publicação.

---

## I. Checklist de lançamento (documentação, não implementação)

**Legenda:**
- **[impl]** = parte desta implementação (tarefa citada);
- **[dec]** = decisão sua;
- **[ext]** = configuração externa;
- **[fut]** = etapa futura.

**Classe:** 🟥 bloqueia lançar (contas abertas ao público) · 🟧 bloqueia vender · 🟩 melhoria posterior.

**Itens marcados [x]** são declarações do proprietário. A coluna "Verificação" diz o que foi possível conferir.

### I.1 Site e produto

| Item (do proprietário) | Estado declarado | Tipo | Classe | Depende de | Critério de conclusão | Verificação independente |
|---|---|---|---|---|---|---|
| Terminar de fazer o aplicativo | [ ] | [impl] parcial + [fut] | 🟥 | Este plano (F04–F14) + backlog | Critérios G-x do §M cumpridos; backlog P0 vazio | — |
| Decidir planos | [ ] | [dec] | 🟧 | Custos de IA medidos (T-08.3), `08` §11 | Documento de planos aprovado | — |
| Conectar plataforma de pagamentos e checkout | [ ] | [fut] | 🟧 | Planos, CNPJ, termos de venda (CDC art. 49) | Spec própria aprovada e implementada | — |
| Suporte para afiliados | [ ] | [fut] | 🟩 | Pagamentos | Spec própria | — |
| Área exclusiva para afiliados | [ ] | [fut] | 🟩 | Afiliados | Spec própria | — |
| "Quer ser afiliado? Veja como funciona" | [ ] | [fut] | 🟩 | Afiliados | Página publicada | — |
| Indicação com recompensa por recomendar amigos | [ ] | [fut] | 🟩 | Contas reais (este plano), antifraude, avaliação de ECA Digital (recompensa para menor) | Spec própria | — |
| Landing page | **[x]** | — | — | — | — | Implementada e testada no build local (`45`: E2E, Lighthouse). Publicação em domínio próprio **não verificada**; `VITE_SITE_URL`/`VITE_LP_INDEXABLE` pendentes |
| Suporte e contato por WhatsApp | [ ] | [dec] + [ext] | 🟧 | Número comercial; política de privacidade (o WhatsApp é outro operador) | Canal publicado e citado nos termos | — |
| Login com banco de dados e Google | [ ] | **[impl]** F04–F07 + [ext] (Neon, Google Cloud, Resend) | 🟥 | D-06, D-10 (domínio), credenciais | T-05.x e T-06.x concluídos + validado em preview | — |
| Domínio | [ ] | [dec] + [ext] | 🟥 | Registro (registro.br para `.com.br`) | DNS apontado para a Vercel; e-mail (SPF/DKIM) configurado | — |
| Termos de uso e política de privacidade | [ ] | **[impl]** F11 + [ext] revisão jurídica | 🟥 | §H.5 | Textos finais publicados em `/termos` e `/privacidade`, com versão | — |
| Suporte com tutoriais | [ ] | [fut] | 🟩 | Produto estável | Central de ajuda publicada | — |
| App APK | [ ] | [fut] | 🟩 | PWA com service worker (backlog) ou TWA | Spec própria | — |
| Publicar na Play Store | [ ] | [fut] + [ext] | 🟩 | APK, conta de desenvolvedor, política de dados da loja | App aprovado | — |

### I.2 Instagram e distribuição

| Item | Estado declarado | Tipo | Classe | Critério | Verificação independente |
|---|---|---|---|---|---|
| Automação para criar publicações a partir do Claude | **[x]** | — | — | — | A ferramenta existe em `automacao-instagram/` (não rastreada), com 3 exemplos prontos (`docs/copy/06`, 29/09) |
| Destaques | **[x]** | — | — | — | Não verificável pelo repositório |
| Um post por dia | **[x]** | — | — | — | **Divergência a confirmar:** `docs/copy/06-marketing.md` (29/09) registra "nenhum post publicado". Estado mantido como declarado |
| Um story por dia | **[x]** | — | — | — | Não verificável pelo repositório |
| Reels com sua participação, editados com ajuda do Claude | [ ] | [dec] + [fut] | 🟩 | Reels publicados | `edição Videos/` existe (fora do Git) |
| Post "Quem somos e o que fazemos" | [ ] | [fut] | 🟩 | Publicado; sem promessa fora do `PRODUCT.md` → Evidence | — |
| Posts fixados | [ ] | [fut] | 🟩 | 3 posts fixados | — |
| Distribuir os mesmos reels no TikTok e YouTube Shorts | [ ] | [fut] + [ext] | 🟩 | Contas e rotina | — |

### I.3 Itens adicionais (recomendações minhas, não pedidos seus)

| Item | Tipo | Classe | Por quê |
|---|---|---|---|
| Definir quem é o controlador (CPF ou CNPJ) | [dec] | 🟥 | Pré-requisito dos textos legais (§H.5) |
| Encarregado ou canal de privacidade publicado | [dec] + [ext] | 🟥 | Res. ANPD 18/2024; dados de adolescentes |
| Vercel Pro | [ext] | 🟥 lançar / 🟧 vender | Hobby é "non-commercial personal use only" (Vercel Fair Use, 14/09/2026) |
| Orçamento e teto de IA definidos | [dec] | 🟥 | Custo sem limite (IA-1) |
| Neon Launch (restauração de 7 dias) | [ext] | 🟥 | Restauração de 6 h é curta para dados reais |
| Auditoria de segurança L3 sem vulnerabilidade confirmada aberta | [impl] T-12.5 | 🟥 | — |
| Avaliação de conformidade com o ECA Digital (streak, XP, recomendação, IA) | [impl] T-11.2 + [ext] jurídico | 🟥 | Lei em vigor desde 17/03/2026 |
| Teste em aparelho físico e com leitor de tela | [ext] (você) | 🟥 | Pendente desde o `22` (`37` §5) |
| Entrevistas ou teste com 5+ alunos reais | [dec] | 🟧 | Nenhuma validação com o João real (`08` §8) |
| Medir retorno no dia seguinte (métrica da tese), com privacidade | [fut] | 🟧 | `PRODUCT.md` → Métricas |
| Nota fiscal / regime tributário | [ext] | 🟧 | Vender |
| Revisão humana amostral do acervo de questões | [fut] | 🟧 | 755 itens revisados só por IA (`37`) |
| Service worker (offline real) | [fut] | 🟩 | Pré-requisito provável do APK/TWA |

A checklist completa vai para `docs/produto/lancamento.md` na F01, e cada item [impl] aponta para a sua tarefa.

---

## J. Etapas de implementação (fases e tarefas)

**Formato de cada tarefa:** **Resultado** · **Depende** · **Arquivos** · **Skills** (pela matriz §D.3; "—" = só a checklist da classe) · **Aceite** · **Verificação** · **Risco/reversão** · **Externo**.

**Esforço (estimativa relativa, não é prazo):** P = pequeno, M = médio, G = grande.

**Verificação padrão ao fim de cada fase ("gate")**, com a saída real registrada:
- `bunx tsc --noEmit`
- `bun test tests/unit`
- `bunx playwright test`, quando a fase toca UI ou fluxo
- `bun run build`
- `bun run lint`, a partir da F03

### F00 — Preparação e linha de base

**T-00.1 — Linha de base (P)**
- **Resultado:** números atuais de tsc, unit, E2E (projetos `chromium`, `desktop`, `narrow`, `lp-*`), build (preset padrão e `VERCEL=1`) e lint, registrados no `47-registro-execucao-producao.md` (novo).
- **Depende:** aprovação.
- **Arquivos:** só o registro.
- **Skills:** `foca-sdd`.
- **Aceite:** saídas reais registradas. Falha preexistente registrada como tal, não corrigida escondida.
- **Verificação:** os comandos acima.
- **Risco/reversão:** nenhum.
- **Externo:** —

**T-00.2 — Preservar o trabalho local preexistente (P)**
- **Resultado:** as alterações do §A.7 estão classificadas e tratadas conforme D-02 e D-05. Recomendação: as mudanças de `foca-social` e da automação entram num **commit próprio, separado**, antes da reorganização (se você autorizar, D-03). As exclusões seguem a D-02.
- **Depende:** T-00.1, D-02, D-03, D-05.
- **Arquivos:** nenhum código.
- **Aceite:** `git status` limpo de itens "sem dono", ou cada item com destino registrado.
- **Verificação:** `git status`, `git diff --stat`.
- **Risco/reversão:** perder trabalho do usuário. Mitigação: nada é restaurado nem descartado sem a D-02. As exclusões podem ser revertidas por `git checkout 3307b22 -- <caminho>`.
- **Externo:** —

**T-00.3 — Branch de trabalho (P)**
- **Resultado:** uma branch local `producao-46`, com um commit por tarefa ou fase (se a D-03 autorizar). Sem push.
- **Depende:** D-03.
- **Aceite:** a branch existe; `main` intocada.
- **Verificação:** `git branch`.
- **Risco/reversão:** —
- **Externo:** —

### F01 — Reorganização do SDD

**T-01.1 — Esqueleto, estados e templates (P)**
- **Resultado:** diretórios do §C.2 criados; `docs/ai/templates/{spec,tarefas,registro,adr,resumo}.md`; convenção de frontmatter e estados (§D.1, §D.2) escrita em `docs/ai/SDD-WORKFLOW.md` (versão preliminar, finalizada no T-02.5).
- **Depende:** F00.
- **Skills:** `foca-sdd`.
- **Aceite:** os templates têm todas as seções obrigatórias, e "não se aplica — motivo" continua sendo a regra.
- **Verificação:** revisão + `docs:check` (T-01.8).
- **Externo:** —

**T-01.2 — Conferir e encerrar as iniciativas concluídas (M)**
- **Resultado:** para cada grupo (`17–19`, `20/22`, `23/24`, `25/26`, `27–29`, `30–32`, `36/37`, `38/39`, `40–43`, `44/45`), aplicar a checklist:
  - (a) o registro cobre todas as tarefas;
  - (b) os testes da linha de base estão verdes;
  - (c) 3 contratos-chave conferidos no código por grep ou teste (ex.: `PLANNER_VERSION = 2`, `ALGO_VERSION = 1`, `attemptKey`);
  - (d) as pendências foram listadas.
  Escrever um `resumo.md` por grupo (o que mudou, decisões, evidência, limitações). Se a conferência falhar, a iniciativa **não** é encerrada e a divergência vai para o registro.
- **Depende:** T-01.1.
- **Skills:** `foca-sdd`; `spec-verifier` por amostragem.
- **Aceite:** 10 resumos, cada um com evidência citada.
- **Verificação:** leitura + comandos de grep registrados.
- **Externo:** —

**T-01.3 — Extrair as regras vigentes (G)**
- **Resultado:**
  - `produto/regras.md`, `arquitetura/contratos.md`, `design/mascote.md`, `design/gamificacao-e-som.md`;
  - atualização do `DESIGN.md` e do `PRODUCT.md`;
  - as 63 regras do §D.4, cada uma com a origem.
  O texto normativo é **citado, não reescrito** quando for contrato.
- **Depende:** T-01.2.
- **Skills:** `foca-sdd`; `agent-skills:documentation-and-adrs` (se disponível).
- **Aceite:** cada regra aparece uma vez; amostra de 20 conferida pelo spec-verifier contra a origem, sem divergência de sentido.
- **Verificação:** relatório do spec-verifier.
- **Risco/reversão:** perder nuance. Mitigação: o plano de origem continua acessível pelo ID.
- **Externo:** —

**T-01.4 — Backlog consolidado (M)**
- **Resultado:** `produto/backlog.md` com todas as pendências reais, cada uma com origem, prioridade (P0/P1/P2), dependência e dono. Fontes: `37` §5, `45` §10, `32`, `26` §8, `22` §6, `39` §5, `41` §9, `43` §9, `15` §9, `16` §11, "O que está em aberto" do `00-README`, e os achados novos (IA-1…IA-5, scripts de marketing quebrados, ESLint fora do escopo, `selectedTopics` sem uso, `/plan` fixo, IDs de vídeo, service worker).
- **Depende:** T-01.2.
- **Aceite:** nenhuma pendência dos registros fica fora; itens duplicados foram fundidos.
- **Verificação:** grep dos marcadores de pendência dos registros × backlog.
- **Externo:** —

**T-01.5 — Inventário de funcionalidades (P)**
- **Resultado:** `produto/funcionalidades.md` com a tabela do §A.2 + a spec responsável + o tratamento para produção.
- **Depende:** T-01.1.
- **Aceite:** cada rota de `src/routes/` aparece.
- **Verificação:** script que compara a lista de rotas com o documento.
- **Externo:** —

**T-01.6 — Mover documentos e criar o mapa histórico (M)**
- **Resultado:** execução da tabela do §C.5 com `git mv`; `historico/README.md` com o mapa ID → caminho, o resumo de cada iniciativa e como recuperar o que foi excluído (D-02); novo `docs/README.md`; `docs/ESTADO.md`; `decisoes/` com as ADRs 0001 (Vercel), 0002 (questões oficiais), 0003 (identidade sonora v2) e 0004 (esta reorganização).
- **Depende:** T-01.3, T-01.4.
- **Aceite:** nenhum arquivo perdido (contagem antes e depois); cada ID de 00 a 46 aparece no mapa.
- **Verificação:** `git status` (renames detectados) + script de contagem.
- **Risco/reversão:** reversível com `git mv` inverso.
- **Externo:** —

**T-01.7 — Atualizar as referências dependentes (M)**
- **Resultado:**
  - caminhos lidos em execução: `scripts/content/taxonomy-doc.ts:13`, `tests/unit/audio.test.ts:21`, `scripts/foca_sound/*.py`, as chaves JSON de hashes de áudio, `contextFiles` do registry e `scripts/validate-skills.mjs`;
  - links em todos os `.md` do repo (docs, READMEs de `src/content/*`, `content-pipeline/README.md`, `.agents/product-marketing.md`, `automacao-instagram/*.md`);
  - comentários de configuração com caminho (`.gitignore`, `.prettierignore`, `playwright.config.ts`, `.env.example`).
  Na automação, **só os `.md`**. O código dela lê caminhos que não mudam.
- **Depende:** T-01.6.
- **Aceite:** `docs:check` sem link quebrado; `bun run content:taxonomy` (ou o comando atual) escreve no novo caminho; o teste de áudio passa; `python scripts/foca_sound/verify.py` passa.
- **Verificação:** os comandos citados.
- **Risco/reversão:** quebrar o teste de áudio (reverter o caminho).
- **Externo:** —

**T-01.8 — Verificador de links e caminhos (P)**
- **Resultado:** `scripts/docs/verificar-links.ts`: links relativos em `.md`, âncoras de título, caminhos citados em crase que parecem arquivos do repo, `contextFiles` do registry. Script `docs:check` no `package.json` e um teste unitário que o executa (entra no CI).
- **Depende:** T-01.6.
- **Aceite:** falha com um link quebrado de propósito; passa no repo.
- **Verificação:** `bun run docs:check`.
- **Externo:** —

**T-01.9 — Aplicar as substituições do §B.4 nos documentos (P)**
- **Resultado:** as regras antigas ("mock intencional", "sem backend" etc.) marcadas como substituídas pelo `46`, com remissão, no `PRODUCT.md`, no `AGENTS.md`/`CLAUDE.md` novos e em `produto/regras.md`. O texto final do estado do produto só muda quando cada funcionalidade existir de fato (F14).
- **Depende:** T-01.3.
- **Aceite:** grep por "mock intencional" / "sem autenticação real" só encontra ocorrências marcadas como históricas ou substituídas.
- **Verificação:** grep.
- **Externo:** —

**Gate F01:** `docs:check` verde; tsc, unit e build verdes; `ESTADO.md` aponta para a F02.

### F02 — Instruções e skills para Claude e Codex

**T-02.1 — `AGENTS.md` canônico e `CLAUDE.md` enxuto (M)**
- **Resultado:**
  - `AGENTS.md` (≤ 12 KB): produto em 3 linhas; comandos; regras duras (segredos, Git, um store, `routeTree.gen.ts`, dados de menores, conteúdo pedagógico, tutor sob demanda, code splitting); o fluxo retomar/próxima tarefa; os caminhos canônicos; as fronteiras das ferramentas independentes.
  - `CLAUDE.md` = `@AGENTS.md` + o específico do Claude (skills e plugins, subagentes, `spec-verifier`).
  - Sem histórico.
- **Depende:** F01.
- **Skills:** `foca-sdd`.
- **Aceite:** o Claude carrega o conteúdo do `AGENTS.md` (conferir com `/memory` ou numa sessão nova); o Codex recebe o `AGENTS.md` completo (transcrição da sessão registrada); o tamanho está abaixo do limite de 32 KiB do Codex.
- **Verificação:** duas sessões novas, registradas.
- **Externo:** você abrir uma sessão do Codex, se eu não puder rodá-lo daqui.

**T-02.2 — Skills canônicas em `.agents/skills/` com espelho (M)**
- **Resultado:** as skills próprias e de terceiros compatíveis passam a ter `.agents/skills/` como fonte. `scripts/agents/sincronizar-skills.ts` gera o espelho em `.claude/skills/` (cópia, porque symlink no Windows exige modo desenvolvedor). O `validate-skills` falha se houver divergência. Skills só do Claude (`repo-security-review`) ficam marcadas. `skills-lock.json` atualizado.
- **Depende:** T-02.1.
- **Aceite:** o Codex lista `foca-sdd` e as demais; o Claude continua listando; alterar a cópia sem sincronizar faz o validador falhar.
- **Verificação:** `node scripts/validate-skills.mjs` + sessão do Codex.
- **Risco/reversão:** as skills existentes têm frontmatter compatível (confirmado); reverter = remover `.agents/skills`.
- **Externo:** —

**T-02.3 — Um catálogo para os dois agentes (P)**
- **Resultado:** `docs/ai/skills-registry.json` com `agentes: ["claude","codex"]`, `disponibilidade` (repo, usuário, plugin dependente do host) e `alternativa` por skill; `SKILLS.md` com a tabela gerada entre marcadores; `validate-skills` no CI.
- **Depende:** T-02.2.
- **Aceite:** nenhuma skill citada no `SKILL-ROUTING` fica fora do registry; nenhuma do registry deixa de existir no disco (ou está marcada como dependente de host).
- **Verificação:** o validador.
- **Externo:** —

**T-02.4 — Matriz operacional (M)**
- **Resultado:** `docs/ai/SKILL-ROUTING.md` reescrito a partir do §D.3, mantendo o §2.1 de escrita, que já funciona.
- **Depende:** T-02.3.
- **Aceite:** as 20 classes da matriz estão presentes; cada uma tem uma alternativa sem skill.
- **Verificação:** revisão + o validador.
- **Externo:** —

**T-02.5 — `SDD-WORKFLOW.md` e `foca-sdd` reescritos (M)**
- **Resultado:** estados, retomar, próxima tarefa, checkpoints, níveis L1–L3 e a regra de leitura mínima. `foca-sdd` passa a ser o ponto de entrada para os dois agentes.
- **Depende:** T-02.4.
- **Aceite:** um teste de mesa, "retomar a partir do `ESTADO.md`" em sessão nova, chega à tarefa certa em ≤ 4 leituras (registrado).
- **Externo:** —

**T-02.6 — Agente verificador para o Codex (P)**
- **Resultado:** `.codex/agents/spec-verifier.toml` com as mesmas instruções (somente leitura).
- **Depende:** T-02.5.
- **Aceite:** o Codex reconhece o agente (transcrição).
- **Externo:** sessão do Codex.

**T-02.7 — `.mcp.json` (P)**
- **Resultado:** versão fixada, ou removido (D-17).
- **Aceite:** não sobra `npx -y` sem versão.
- **Externo:** —

**Gate F02:** validador e `docs:check` verdes; sessões novas do Claude e do Codex registradas.

### F03 — Build e repositório sem Lovable e Netlify

**T-03.1 — `vite.config.ts` sem o wrapper (M)**
- **Resultado:** config explícito com:
  - `tailwindcss()`;
  - `tanstackStart({ server: { entry: "server" }, importProtection: { behavior: "error", client: { files: ["**/server/**"], specifiers: ["server-only"] } } })`;
  - `nitro({ preset: NITRO_PRESET ?? (VERCEL ? "vercel" : "node-server") })`, só no build;
  - `viteReact()`;
  - alias `@`; `resolve.dedupe`; `optimizeDeps`; `css.transformer: "lightningcss"` (+ `lightningcss` como devDependency direta);
  - `server: { host: "::", port: 8080 }`;
  - o `define` de `VITE_*` do Vite padrão (conferir `src/marketing/config.ts:2`).
  Os devtools saem (não são usados).
- **Depende:** F02.
- **Skills:** `tanstack-start` [C-plug] como referência (conferir o viés Cloudflare) + a documentação oficial da Vercel e do Nitro.
- **Aceite:**
  - tsc, unit, E2E e build (padrão e `VERCEL=1`) iguais à linha de base;
  - `.vercel/output` gerado;
  - a server function do tutor responde no build `node-server`;
  - tamanho do JS inicial da landing ≤ linha de base + 2 %;
  - importar `src/server/x` no cliente falha o build (teste criado).
- **Verificação:** os comandos + `scripts/marketing/lighthouse.ts` contra o build local.
- **Risco/reversão:** diferença sutil de CSS ou SSR. Reverter = restaurar o arquivo e a dependência (um commit).
- **Externo:** —

**T-03.2 — Remover a dependência e os resquícios (P)**
- **Resultado:** remover `@lovable.dev/vite-tanstack-config`; remover `bunfig.toml:7`; `bun.lock` regenerado sem o registry privado; `lovable-error-reporting` substituído por `src/lib/error-reporting.ts`.
- **Depende:** T-03.1.
- **Aceite:** grep `lovable` em `src/`, `package.json` e `bun.lock` = 0; os erros de rota continuam indo para o console.
- **Verificação:** grep + E2E de erro de trilha.
- **Externo:** —

**T-03.3 — Netlify e `.gitignore` (P)**
- **Resultado:** remover `netlify.toml` e as menções em configuração; limpar o `.gitignore` (Wrangler, Netlify); ignorar `edição Videos/` e `Claude outputs/` (D-05); ESLint ignora `automacao-instagram/` e `edição Videos/`.
- **Depende:** T-03.1.
- **Aceite:** `bun run lint` passa só no escopo do app.
- **Externo:** —

**T-03.4 — Desconectar a Lovable (P)**
- **Resultado:** depois da sua ação no painel da Lovable (D-04), remover `.lovable/` e o bloco `LOVABLE` (já fora do `AGENTS.md` novo).
- **Depende:** D-04.
- **Aceite:** o repositório não cita a Lovable fora de `historico/`.
- **Externo:** **você** desconecta o repositório na Lovable.

**T-03.5 — Scripts de marketing (P)**
- **Resultado:** `og-image.ts`, `css-blocks.ts` e `capturar-telas.ts` com os caminhos corrigidos e `shots` registrado no `package.json`, ou removidos com registro, se estiverem obsoletos.
- **Aceite:** cada script restante roda sem erro.
- **Externo:** —

**T-03.6 — README e CI (P)**
- **Resultado:** `README.md` reescrito (bun, Vercel, variáveis, testes); o CI ganha `lint`, `docs:check` e `validate-skills`.
- **Aceite:** o CI roda verde localmente (`act` não é necessário; rodar os mesmos comandos).
- **Externo:** o CI só roda no GitHub depois de um push, que é seu (D-03).

**T-03.7 — Artefatos locais (P)**
- **Resultado:** remover `dist/`, `.netlify/`, `.vercel/output`, `.tanstack/tmp` e `test-results/` (todos ignorados pelo Git).
- **Aceite:** o build os recria quando necessário.
- **Externo:** —

**Gate F03:** tudo igual à linha de base; zero Lovable e Netlify fora de `historico/`.

### F04 — Fundação do backend

**T-04.1 — ADRs e documentos-base (M)**
- **Resultado:**
  - ADRs de banco, auth, e-mail, rate limit e região (a partir do §E.1);
  - `arquitetura/visao-geral.md` (backend) e `arquitetura/dados.md`;
  - `seguranca/modelo-de-ameacas.md` (§F) e `seguranca/privacidade.md` (§H.2, versão 1);
  - `operacao/ambientes-e-deploy.md`.
- **Depende:** F03, D-06.
- **Skills:** `foca-sdd`.
- **Aceite:** cada ADR tem alternativas, escolha e consequências; o modelo de ameaças cobre T1–T18.
- **Externo:** —

**T-04.2 — Prova técnica verificada (M)**
- **Resultado:** numa branch descartável, provar que funcionam juntos:
  - TanStack Start 1.168 + Better Auth 1.7 (`tanstackStartCookies`, handler `/api/auth/$`) + Drizzle 0.45;
  - PGlite local + driver Neon (`neon-serverless` para transação interativa) no preset `vercel` e no `node-server`;
  - o padrão de import de `src/server/**` com o `importProtection`.
  Versões e armadilhas registradas.
- **Depende:** T-04.1.
- **Skills:** documentação oficial; `superpowers:systematic-debugging` se algo falhar.
- **Aceite:** cadastro, login e sessão funcionando em teste de integração com PGlite; o build `vercel` gera a função.
- **Risco/reversão:** incompatibilidade de versões. Plano B: Postgres local em Docker para desenvolvimento e teste; ou Auth.js (registrar numa ADR).
- **Externo:** —

**T-04.3 — Camada de banco e migrações (M)**
- **Resultado:** `src/server/db/{client,schema}.ts`, `drizzle.config.ts`, `drizzle/` (SQL versionado), scripts `db:generate`, `db:migrate` e `db:reset:local`; um cliente por ambiente (`DATABASE_URL`: `pglite:` ou `postgres://`).
- **Depende:** T-04.2.
- **Skills:** `foca-backend` (ainda não existe; seguir a documentação).
- **Aceite:** a migração inicial aplica do zero e é idempotente; o CI roda as migrações em PGlite.
- **Verificação:** `bun run db:migrate` + teste.
- **Externo:** —

**T-04.4 — Variáveis e segredos (P)**
- **Resultado:** `src/server/env.ts` (zod, falha ao iniciar se faltar variável); `.env.example` atualizado; teste de build que varre `.output/public` e `.vercel/output/static` por nomes e valores de segredo e por `VITE_` fora da lista permitida.
- **Aceite:** o teste falha com um segredo plantado.
- **Externo:** —

**T-04.5 — Convenções de servidor (M)**
- **Resultado:** middleware (`requestId`, checagem de Origin, sessão, rate limit, zod, mapa de erros); `src/server/log.ts` sem dado pessoal; erros tipados. Tudo testado.
- **Depende:** T-04.3.
- **Skills:** `agent-skills:api-and-interface-design` [C-plug] se disponível.
- **Aceite:** testes de `Origin` inválido (403), corpo grande demais (413) e erro interno (500 sem stack).
- **Externo:** —

**T-04.6 — Infraestrutura de testes (M)**
- **Resultado:** testes de integração com PGlite (esquema novo por arquivo); fábricas de "aluno A" e "aluno B"; caixa de saída de e-mail em memória; helper de E2E que cria uma sessão real pelo fluxo de teste; o `playwright.config.ts` sobe o servidor com PGlite.
- **Aceite:** os E2E atuais seguem verdes com um helper que cria sessão de teste (as rotas de estudo passam a exigir conta); um E2E novo cria conta e faz login.
- **Externo:** —

**T-04.7 — Provisionamento externo (P, bloqueável)**
- **Resultado:** projeto Neon em `aws-sa-east-1` pelo Marketplace da Vercel (modo Neon-managed); a função em `gru1` (`vercel.json` `regions`); variáveis por ambiente.
- **Depende:** D-06, D-11.
- **Aceite:** um preview conecta no banco da própria branch (`/api/saude`).
- **Externo:** **você** cria as contas e autoriza a integração. Pode ter custo (§K).

**Gate F04:** migrações, testes de integração e build verdes.

### F05 — Identidade e autenticação

**T-05.1 — Esquema de identidade (P)**
- **Resultado:** tabelas do Better Auth (geradas) + `profile`, `legal_acceptance`, `consent`, `rate_limit`, `audit_event`; migração.
- **Depende:** F04.
- **Aceite:** as restrições do §E.2 estão presentes e testadas.
- **Externo:** —

**T-05.2 — Configuração do Better Auth (M)**
- **Resultado:** e-mail e senha (`requireEmailVerification`, `revokeSessionsOnPasswordReset`); Google; sessão de 30 dias com `updateAge` de 1 dia; cookies seguros; rate limit em banco com as regras do §F; vínculo de contas seguro (§E.3); `deleteUser` com reautenticação; `trustedOrigins` por ambiente.
- **Skills:** `foca-backend` (documentação); **L2**.
- **Aceite:** testes T1–T4 do §F.
- **Externo:** —

**T-05.3 — Envio de e-mail (P)**
- **Resultado:** `src/server/email/` com implementação de desenvolvimento e teste (caixa de saída) e de produção (Resend); modelos em PT-BR para verificação, redefinição e exclusão.
- **Skills:** `better-writing` (texto dos e-mails).
- **Aceite:** o E2E lê o link da caixa de saída.
- **Externo:** Resend + domínio verificado (D-10). **Sem domínio, a produção fica bloqueada;** o local e o teste funcionam.

**T-05.4 — Telas de acesso (G)**
- **Resultado:** `/login`, `/cadastro` (ano de nascimento, aceite legal, faixa etária pela D-08), `/verificar-email`, `/esqueci-a-senha`, `/redefinir-senha`; redirecionamentos das rotas antigas; estados de carregando, erro, sucesso e sem rede; mensagens que não enumeram contas.
- **Skills:** `better-writing` → `web-design-guidelines`; `vercel-react-best-practices`.
- **Aceite:**
  - E2E dos 5 fluxos em 320/390/1280;
  - axe sem violação séria;
  - alvos ≥ 44 px;
  - copy no inventário;
  - `/` sem baixar o produto (teste do `45` continua verde).
- **Externo:** —

**T-05.5 — Sessão no app e área da conta (M)**
- **Resultado:** leitura da sessão nas rotas do produto (sem importar na raiz); `/conta` (perfil editável, sessões, sair, sair de todos); logout que revoga e limpa o cache da conta.
- **Aceite:** E2E de logout em aparelho compartilhado (T14).
- **Externo:** —

**T-05.6 — Rotas de estudo exigem conta e schema local v7 (M)**
- **Resultado:** guarda de sessão nas rotas de estudo (§E.3) sem importar sessão na raiz (regra de code splitting); migração aditiva v6 → v7 (`account`, `outbox`, `deviceId`); `authed` passa a significar "tem sessão" (derivado do servidor) e `onboarded` continua local; o perfil do onboarding é enviado no cadastro; testes de migração no padrão de `state-migrations.ts` (idempotente, versão futura bloqueia).
- **Aceite:** sem sessão, cada rota de estudo leva a `/cadastro` e volta depois do login (E2E); landing e `/quiz` continuam públicos; migração 2× idêntica; o teste de code splitting do `45` continua verde.
- **Externo:** —

**T-05.7 — Google OAuth (P, bloqueável)**
- **Resultado:** clientes OAuth (desenvolvimento, staging, produção) e URIs de redirecionamento; tela de consentimento com nome, logo e links legais.
- **Aceite:** login com Google validado manualmente no preview de staging e registrado como "validado em ambiente integrado".
- **Externo:** **você** cria o projeto no Google Cloud; precisa do domínio para a tela de consentimento com links legais.

**T-05.8 — Testes de autenticação (M)**
- **Resultado:** integração (cadastro, verificação, login, senha errada, redefinição, revogação, expiração, vínculo seguro, enumeração, rate limit) + E2E (cadastro → verificação → login → logout; duas contas).
- **Skills:** `superpowers:test-driven-development` [C-plug] ou a alternativa.
- **Aceite:** todos verdes; os cenários do §F.5 cobertos.
- **Externo:** —

**Gate F05:** gate padrão + os testes de segurança de auth.

### F06 — Dados de estudo no servidor e sincronização

**T-06.1 — Esquema de estudo (M)**
- **Resultado:** `attempt`, `completion`, `xp_ledger`, `study_day`, `learning_doc`, `ai_usage`, `ai_budget`, `data_import`, com as restrições e índices do §E.2.
- **Depende:** F05.
- **Externo:** —

**T-06.2 — Regras de negócio no servidor (G)**
- **Resultado:** `src/server/estudo/regras.ts`: XP (reaproveitando as funções puras existentes quando possível, sem duplicar a regra), streak e congelamentos com fuso, correção pelo gabarito do índice de conteúdo, janelas de data, tetos.
- **Skills:** `foca-backend`; TDD.
- **Aceite:** os testes de recompensa atuais (`rewards`, `store-*`) rodam também contra a regra do servidor, com o mesmo resultado; testes de adulteração (T7).
- **Externo:** —

**T-06.3 — API de sincronização (G)**
- **Resultado:** `sync.push` e `sync.pull` (§E.4) com contratos zod, limites, idempotência e transação.
- **Skills:** `foca-backend`; **L2**.
- **Aceite:** repetição do mesmo lote = mesmo resultado; lote parcialmente inválido = aplica os válidos e devolve os motivos; `rev` desatualizado = 409 com o documento atual.
- **Externo:** —

**T-06.4 — Outbox no store (G)**
- **Resultado:** as ações existentes enfileiram eventos; envio com backoff; o agregado do servidor sobrescreve o XP e o streak locais; aviso de sincronização atrasada; nenhuma mudança de comportamento pedagógico.
- **Skills:** `vercel-react-best-practices`; `better-writing` (aviso).
- **Aceite:**
  - todos os testes pedagógicos existentes continuam verdes;
  - E2E offline → online sincroniza;
  - o store continua sendo um só (sem segundo mecanismo).
- **Externo:** —

**T-06.5 — Multiaparelho (M)**
- **Resultado:** `pull` no login, no foco e periodicamente; conflitos resolvidos (§E.4).
- **Aceite:** E2E com dois contextos de navegador da mesma conta: o progresso feito em um aparece no outro, e XP e streak batem com o servidor.
- **Externo:** —

**T-06.6 — Isolamento entre alunos (M)**
- **Resultado:** suíte `isolamento.test.ts` cobrindo **todas** as server functions com duas contas.
- **Aceite:** nenhuma chamada de A lê ou altera B; as mensagens de erro não revelam existência.
- **Externo:** —

**T-06.7 — Skill `foca-backend` (P)**
- **Resultado:** a skill do projeto em `.agents/skills/foca-backend/` (espelhada no Claude), com as convenções efetivamente implementadas.
- **Aceite:** o validador encontra a skill nos dois agentes; uma tarefa seguinte a usa e o registro cita.
- **Externo:** —

**Gate F06:** gate padrão + suíte de isolamento + E2E multiaparelho.

### F07 — Migração do estado local

**T-07.1 — Contrato de importação (M)**
- **Resultado:** `import.run`: validação do v6/v7, tetos, recálculo de recompensas, `origin=import`, transação única, `import_id` (§G).
- **Skills:** `foca-backend`; **L2**.
- **Aceite:** testes de envio duplo, queda no meio, XP adulterado, payload enorme, versão futura e estado de outra conta.
- **Externo:** —

**T-07.2 — Vínculo do aparelho (P)**
- **Resultado:** `account.userId` no estado local; bloqueio de importação cruzada; cache por conta apagado no logout; apagar os backups antigos depois do sucesso.
- **Aceite:** E2E de aparelho compartilhado (A importa, sai; B entra e não vê nada de A nem pode importar).
- **Externo:** —

**T-07.3 — Tela de escolha (M)**
- **Resultado:** a tela com o resumo e as três opções (§G.3); estados de progresso e de falha com nova tentativa.
- **Skills:** `better-writing` → `web-design-guidelines`.
- **Aceite:** E2E dos três caminhos; axe.
- **Externo:** —

**T-07.4 — Fluxo completo (P)**
- **Resultado:** E2E ponta a ponta: aparelho com progresso antigo (estado v6 semeado) → cria conta → importa → faz login noutro aparelho → vê o progresso → sai → entra de novo e o progresso persiste.
- **Aceite:** verde nos 3 projetos Playwright.
- **Externo:** —

**Gate F07:** gate padrão.

### F08 — Foca IA em produção

**T-08.1 — Tutor exige conta e política de idade (P)**
- **Resultado:** `askTutor` com `requireSession`, faixa etária e consentimento (D-08); anônimo recebe 401; aluno de 17 anos sem consentimento recebe o convite para pedir o consentimento do responsável.
- **Skills:** **L2**; `better-writing`.
- **Aceite:** testes 401 e 403; E2E do aluno de 17 anos sem consentimento.
- **Externo:** —

**T-08.2 — Contexto montado no servidor (M)**
- **Resultado:** o cliente envia só mensagens, `itemId`, alternativa e foco validado; o servidor monta o resto. O `tutor-prompt.ts` mantém a persona e a regra anti-LaTeX. O histórico é aparado para 20 mensagens (corrige o IA-3).
- **Skills:** L2 + `tests/unit/brand-voice.test.ts`.
- **Aceite:** testes de injeção pelos campos antigos (ignorados); teste de 60 mensagens sem quebra.
- **Externo:** —

**T-08.3 — Cotas e teto de custo (M)**
- **Resultado:** `ai_usage` e `ai_budget`; custo pelo `usage` da resposta e pela tabela de preço configurável; disjuntor diário; mensagem de cota esgotada.
- **Skills:** `better-writing`.
- **Aceite:** testes de cota, teto e concorrência (duas chamadas simultâneas não passam do limite).
- **Externo:** D-12.

**T-08.4 — Foto e limites (P)**
- **Resultado:** compressão no cliente; limite de 2 MiB no servidor; tipo verificado pelo conteúdo.
- **Aceite:** teste com arquivo disfarçado (tipo falso) recusado.
- **Externo:** —

**T-08.5 — Salvaguardas (M)**
- **Resultado:** moderação (D-16); protocolo de autolesão com recursos de apoio; aviso de IA; opção de desligar o tutor em `/conta`.
- **Skills:** `copy/04` (sem skill de escrita na fala); **L2**.
- **Aceite:** testes com entradas de risco (usando o endpoint de moderação num modo simulado nos testes; nenhum teste chama a OpenAI de verdade no CI).
- **Externo:** —

**T-08.6 — Validação integrada (P, bloqueável)**
- **Resultado:** tutor real no preview, com a chave em `Preview`; custo medido em N conversas de teste (registrado).
- **Aceite:** registro "validado em ambiente integrado", com custo por mensagem medido.
- **Externo:** **você** cadastra a `OPENAI_API_KEY` por ambiente e define o orçamento.

**Gate F08:** gate padrão + testes da IA.

### F09 — Conta, privacidade e retenção

**T-09.1 — Exportar dados (P)**
- **Resultado:** JSON do §E.6.
- **Aceite:** a exportação do aluno A não contém nada de B; o esquema da exportação está documentado.
- **Externo:** —

**T-09.2 — Excluir conta (M)**
- **Resultado:** reautenticação, cascata, sessões, cache local, e-mail de confirmação.
- **Aceite:** depois da exclusão, nenhuma linha do usuário (teste por tabela); login falha; uma nova conta com o mesmo e-mail começa limpa.
- **Externo:** —

**T-09.3 — Rotinas de retenção (P)**
- **Resultado:** Vercel Cron diário: contas não verificadas (7 dias), `audit_event` (6 meses), `ai_usage` (90 dias), `rate_limit` expirado.
- **Aceite:** teste da rotina com relógio simulado; a rota do cron é protegida por segredo.
- **Externo:** —

**Gate F09:** gate padrão.

### F10 — Saída do modo demonstração

**T-10.1 — Fluxos de produção sem demonstração (M)**
- **Resultado:**
  - ranking fictício oculto em produção (D-15), mantido como fixture de desenvolvimento;
  - `/premium` e `/offline` fora de produção até haver spec;
  - "Resetar demonstração" → "Apagar dados deste aparelho", com confirmação;
  - `/debug` desligado em produção;
  - linhas mortas do perfil ligadas (Termos, Privacidade) ou removidas (Meta diária, se não houver função);
  - `/plan` e `/topics` revisados (corrigir ou ocultar o que é cosmético, registrando no backlog).
- **Skills:** `better-writing`; `web-design-guidelines`.
- **Aceite:** um E2E em modo produção prova que nenhuma rota de demonstração é alcançável pela navegação; o inventário de funcionalidades está atualizado.
- **Externo:** —

**T-10.2 — Textos que prometem o que não existe (P)**
- **Resultado:** "Sem e-mail, sem senha" (onboarding), "60 segundos" em `voz.ts`, "Meta diária 3 aulas de 60s" (`45` §10), revisados pelo `COPY.md`.
- **Skills:** pelo §2.1 (fala da Foca: sem skill).
- **Aceite:** grep sem as frases; inventário atualizado.
- **Externo:** —

**T-10.3 — Fixtures isoladas (P)**
- **Resultado:** dados fictícios só em `tests/fixtures` ou atrás de `import.meta.env.DEV`.
- **Aceite:** o bundle de produção não contém os nomes fictícios do ranking.
- **Externo:** —

**Gate F10:** gate padrão.

### F11 — Documentos legais e conformidade

**T-11.1 — Inventário final de dados (P)**
- **Resultado:** `seguranca/privacidade.md` v2, refeito sobre o código implementado (tabelas, campos, logs, fornecedores, cookies).
- **Aceite:** cada coluna com dado pessoal do esquema aparece no inventário (script compara).
- **Externo:** —

**T-11.2 — Rascunhos dos textos + avaliação do ECA Digital (G)**
- **Resultado:** termos e política em PT-BR claro (sem marketing); lista de pendências (§H.5); `legal/avaliacao-eca-digital.md` (gamificação, recomendação, IA, supervisão, canal de denúncia: o que está coberto, o que não está, o que depende de decisão).
- **Skills:** nenhuma de persuasão; `better-writing` só para clareza de frase.
- **Aceite:** nenhuma afirmação sem correspondência no código (checada item a item); nenhum dado inventado; as pendências estão marcadas.
- **Externo:** —

**T-11.3 — Rotas, versões e aceite (M)**
- **Resultado:** `/termos` e `/privacidade`; links na landing, no cadastro, em `/conta` e no perfil; `legal_acceptance`; novo aceite em mudança material; selo de "rascunho" enquanto houver pendência; flag `contasHabilitadas` desligada em produção até a publicação final.
- **Aceite:** E2E dos links e do aceite; a landing continua sem baixar o produto.
- **Externo:** —

**T-11.4 — Consentimento do responsável para a Foca IA (M, se a D-08 = A)**
- **Resultado:** e-mail ao responsável com um link de consentimento de uso único, registro em `consent`, revogação.
- **Aceite:** E2E pela caixa de saída; revogar bloqueia o tutor.
- **Externo:** domínio e Resend.

**T-11.5 — Entrega para revisão jurídica (P)**
- **Resultado:** um pacote para o advogado (textos, inventário, avaliação do ECA Digital, pendências, fontes).
- **Aceite:** entregue a você.
- **Externo:** **revisão jurídica** (contratação sua).

**Gate F11:** gate padrão.

### F12 — Segurança transversal e auditoria

**T-12.1 — Cabeçalhos (M)**
- **Resultado:** CSP completa primeiro em `Content-Security-Policy-Report-Only` (compatível com o script de tema pré-pintura e a hidratação, via hash ou nonce), depois obrigatória; HSTS no domínio próprio; COOP.
- **Aceite:** o build local e o preview sem violação nas rotas principais; o teste `tests/unit/marketing/deploy.test.ts` atualizado.
- **Externo:** —

**T-12.2 — Limites de uso (P)**
- **Resultado:** regras de rate limit revisadas por rota; regra do WAF da Vercel por IP para `/api/auth/*` e para o tutor (1 regra no Hobby; mais no Pro).
- **Aceite:** testes de limite.
- **Externo:** configurar o WAF (você, ou eu com acesso autorizado).

**T-12.3 — Ferramentas de auditoria (P)**
- **Resultado:** gitleaks, osv-scanner e semgrep instalados localmente; versões registradas.
- **Aceite:** cada uma roda no repositório.
- **Externo:** instalação na sua máquina (autorizada pela aprovação; sem custo).

**T-12.4 — Revisão de logs e segredos (P)**
- **Resultado:** varredura por dado pessoal nos logs; teste do logger; gitleaks no histórico.
- **Aceite:** zero segredo; logger testado.
- **Externo:** —

**T-12.5 — Auditoria L3 (M)**
- **Resultado:** `repo-security-review` completo + `/security-review`; achados classificados (§F.6); correções das vulnerabilidades confirmadas; `docs/seguranca/auditorias/AAAA-MM-DD.md`.
- **Aceite:** nenhuma vulnerabilidade confirmada de gravidade alta ou crítica aberta; o restante com dono e decisão.
- **Externo:** —

**Gate F12:** gate padrão + auditoria.

### F13 — Operação

**T-13.1 — Ambientes na Vercel (P, bloqueável)**
- **Resultado:** variáveis por ambiente; proteção de preview; alias de staging para o OAuth; região `gru1`; plano Pro (D-11).
- **Aceite:** o preview e a staging sobem com `/api/saude` verde.
- **Externo:** **você** (painel da Vercel, cobrança).

**T-13.2 — Migrações no deploy (M)**
- **Resultado:** estratégia escrita e implementada. Recomendação: no preview, `db:migrate` no build contra a branch do Neon; em produção, um passo manual e protegido (script com confirmação) antes da promoção, nunca automático no push. `operacao/ambientes-e-deploy.md` atualizado.
- **Aceite:** ensaio no preview registrado.
- **Externo:** —

**T-13.3 — Backup e restauração (P, bloqueável)**
- **Resultado:** ensaio de restauração do Neon numa branch; RPO e RTO medidos.
- **Aceite:** registro com os tempos.
- **Externo:** conta do Neon.

**T-13.4 — Runbooks (P)**
- **Resultado:** `operacao/runbooks.md` cobrindo incidente (com o prazo da ANPD), rotação de segredos, restauração, exclusão manual a pedido do titular, abuso de IA, OpenAI fora do ar, banco fora do ar.
- **Aceite:** cada runbook tem passos testáveis.
- **Externo:** —

**T-13.5 — Saúde e logs (P)**
- **Resultado:** `/api/saude`; logger ligado nas funções; `audit_event` gravado nos eventos do §E.2.
- **Aceite:** teste do endpoint (sem dado sensível).
- **Externo:** —

**Gate F13:** gate padrão.

### F14 — Regressão final, verificação e registro

**T-14.1 — Regressão completa (M)**
- **Resultado:** gate padrão + lint + `docs:check` + validador de skills + testes de segurança; duas contas; isolamento; migração; falhas de rede; persistência depois de novo login; os três projetos Playwright; Lighthouse da landing (sem piora acima de 3 pontos contra a linha de base).
- **Aceite:** todos verdes, ou falhas registradas com o motivo.
- **Externo:** —

**T-14.2 — Verificação contra a spec (P)**
- **Resultado:** `spec-verifier` sobre os G-1…G-20.
- **Aceite:** tabela critério → evidência; sem evidência = não cumprido.
- **Externo:** —

**T-14.3 — Registro e entrega (P)**
- **Resultado:**
  - `registro.md` final;
  - `ESTADO.md`, `funcionalidades.md`, `backlog.md` e `lancamento.md` atualizados;
  - `PRODUCT.md` com o estado novo;
  - relatório ao proprietário com os 7 pontos pedidos, distinguindo implementado, validado localmente, validado em ambiente integrado e publicado.
- **Externo:** —

---

## K. Riscos, dependências externas, custos e alternativas

### K.1 Riscos

| Risco | Probabilidade (estimativa) | Impacto | Mitigação | Alternativa |
|---|---|---|---|---|
| Incompatibilidade Better Auth × TanStack Start 1.168 × Nitro beta | Média | Alto | Prova técnica T-04.2 antes de tudo | Auth.js ou Clerk (ADR nova) |
| Nitro 3 beta mudar de comportamento | Média | Médio | Versão fixada (já está); atualizar só com teste | — |
| PGlite divergir do Postgres real | Baixa/média | Médio | Testes críticos também no preview (Neon) | Postgres em Docker |
| Interpretação do ECA Digital (art. 24) mais ampla que a opção A | Média | Alto (regulatório) | Faixas configuráveis; revisão jurídica antes de abrir contas | Opção B (painel de responsável) como iniciativa própria |
| Custo de IA acima do previsto | Média | Médio | Cota + teto diário + medição (T-08.6) | Modelo mais barato ou cota menor |
| Reorganização quebrar referências | Média | Baixo | `docs:check` + testes de execução + `git mv` | Reverter o commit da fase |
| Sincronização criar regressão pedagógica | Média | Alto | Os testes pedagógicos existentes (~1.150) rodam sem mudança; o motor fica no cliente | Flag para desligar a sincronização |
| Sem domínio: e-mail e OAuth bloqueados | Alta hoje | Alto | Desenvolvimento e teste seguem com a caixa de saída local | Login só com Google primeiro (ainda precisa de domínio para a tela de consentimento) |
| Push em `main` dispara deploy | Certa | Médio | Trabalho em branch; push só com pedido | — |

### K.2 Dependências externas (todas exigem ação sua)

Desconectar a Lovable; domínio; contas na Vercel (Pro), no Neon, na Resend e no Google Cloud; `OPENAI_API_KEY` por ambiente; revisão jurídica; dados do controlador; teste em aparelho físico.

### K.3 Custos mensais estimados (preços oficiais consultados em 29/09/2026; **estimativas**, não orçamento)

| Item | Início (dezenas de alunos) | Observação |
|---|---|---|
| Vercel Pro | US$ 20/mês (1 assento, inclui US$ 20 de uso) | Obrigatório para uso comercial |
| Neon | Free: US$ 0; Launch: ~US$ 3–15/mês (estimativa por uso) | Launch recomendado antes de ter alunos reais (restauração de 7 dias) |
| Resend | US$ 0 (3.000 e-mails/mês, 100/dia) | Pro: US$ 20/mês para 50 mil |
| Google OAuth | US$ 0 | — |
| OpenAI `gpt-5.4-mini` | US$ 0,75/M tokens de entrada, US$ 4,50/M de saída. **Estimativa:** cerca de US$ 0,005 por mensagem sem foto (≈3,5 mil tokens de entrada + 600 de saída); aluno no teto de 20 mensagens/dia ≈ US$ 3/mês | Teto global definido por você (D-12) |
| Domínio `.com.br` | Custo anual baixo (**valor a confirmar no registro.br**) | — |
| Revisão jurídica | **Sem estimativa** (depende do profissional) | — |

### K.4 Alternativas descartadas (resumo)

- Supabase: bom, mas a vantagem é a plataforma, que não vamos usar, e o plano grátis pausa.
- Clerk: dados de menores fora do Brasil, custo por usuário.
- Firebase: não é Postgres, com aprisionamento maior.
- Upstash no início: um fornecedor a mais sem necessidade comprovada.
- Trocar de framework: nenhuma necessidade comprovada.

---

## L. Decisões que preciso que você aprove

**Bloqueantes** (mudam arquitetura, escopo, custo, privacidade ou operação):

| ID | Decisão | Minha recomendação |
|---|---|---|
| D-01 | Nova convenção do SDD (árvore §C.2, estados §D.2, número permanente, specs em pastas) | Aprovar |
| D-02 | Exclusões locais sem commit de `docs/_arquivo-abroad/` (15) e dos 2 HTML "Flash Test" | Manter excluídos, recuperáveis por `git show 3307b22:<caminho>`, com registro no `historico/README.md` |
| D-03 | Commits locais numa branch `producao-46` durante a execução, **sem push** (push, PR e deploy continuam pedido seu) | Autorizar |
| D-04 | Encerrar a Lovable: você desconecta no painel; eu removo o pacote e as sobras | Aprovar |
| D-05 | `automacao-instagram/` versionada no repo como pasta independente; `edição Videos/` e `Claude outputs/` ignorados | Aprovar |
| D-06 | Stack: Neon (sa-east-1) + Drizzle + Better Auth + Resend, sem Redis no início; Vercel na região `gru1` | Aprovar |
| D-07 | Continuar permitindo estudar sem conta (modo convidado, dados só no aparelho); a conta serve para sincronizar e usar a Foca IA | Aprovar — **decidido diferente: o estudo exige conta (§0)** |
| D-08 | Política de idade (§H.3): A, B ou C | **A**, sujeita à revisão jurídica |
| D-09 | Dados do controlador e do contato de privacidade (§H.5) | Informação sua; sem ela, os textos legais ficam em rascunho |
| D-10 | Registrar um domínio | Registrar agora: bloqueia e-mail, OAuth e textos legais |
| D-11 | Vercel Pro antes de abrir contas ao público | Aprovar (US$ 20/mês) |
| D-12 | Orçamento de IA: teto mensal e cota diária por aluno | Teto de US$ 30/mês no início; 20 mensagens e 5 fotos por dia |

**Não bloqueantes** (sigo a recomendação se você não disser nada):

| ID | Decisão | Padrão |
|---|---|---|
| D-13 | Histórico do chat da Foca IA | Só no aparelho; o servidor guarda só contadores |
| D-14 | Duração da sessão | 30 dias com renovação; logout apaga o cache da conta no aparelho |
| D-15 | Ranking fictício | Oculto em produção até existir ranking real |
| D-16 | Moderação da entrada da Foca IA | Ligada (gratuita) |
| D-17 | `.mcp.json` (omniroute) | Fixar a versão |
| D-18 | Primeiro nome enviado à OpenAI | Não enviar |

**Aprovar este plano não autoriza:** gastos, contratações, criação de contas em fornecedores em seu nome, push, deploy ou mudança em produção. Cada uma dessas pede autorização específica no momento em que for necessária.

---

## M. Critérios para considerar a entrega concluída

| ID | Critério | Verificação |
|---|---|---|
| G-1 | Um agente novo (Claude **e** Codex) chega à próxima tarefa em ≤ 4 leituras | Sessões registradas (T-02.5) |
| G-2 | Zero link ou caminho quebrado no repo | `bun run docs:check` |
| G-3 | Cada assunto tem uma fonte canônica; nenhum plano concluído é leitura obrigatória | Revisão do `docs/README.md` + `AGENTS.md` |
| G-4 | Zero Lovable e Netlify fora de `historico/`; build, SSR e server functions iguais à linha de base | grep + gate F03 |
| G-5 | Cadastro com verificação, login por senha e Google, recuperação e logout funcionam | E2E + validação integrada do Google (T-05.7) |
| G-6 | Sessões revogáveis; redefinição revoga tudo; cookies com as flags corretas | Testes T4 |
| G-7 | Nenhum aluno lê ou altera dado de outro | Suíte de isolamento (T-06.6) |
| G-8 | XP, streak e conclusões calculados no servidor; `localStorage` adulterado não altera recompensa | Testes T7 |
| G-9 | Progresso sincroniza entre dois aparelhos e persiste depois de novo login | E2E (T-06.5, T-07.4) |
| G-10 | Importação local → conta é idempotente, validada, escolhida explicitamente e segura em aparelho compartilhado | Testes do T-07.x |
| G-11 | Foca IA exige conta, respeita cota e teto, monta o contexto no servidor e não quebra depois de 40 mensagens | Testes do T-08.x |
| G-12 | Exportação e exclusão de conta funcionam e não deixam linha do usuário | Testes do T-09.x |
| G-13 | Nenhum fluxo de demonstração alcançável em produção | E2E em modo produção (T-10.1) |
| G-14 | Termos e política coerentes com o código, versionados, com aceite registrado; pendências jurídicas explícitas; nada publicado como final com pendência | T-11.x + checklist item a item |
| G-15 | Auditoria L3 sem vulnerabilidade confirmada alta ou crítica aberta; achados classificados | Relatório (T-12.5) |
| G-16 | Nenhum segredo no bundle, no Git ou em log | Teste de build + gitleaks + teste do logger |
| G-17 | Comportamento pedagógico, visual e de acessibilidade preservado | Todos os testes pré-existentes verdes; axe; Lighthouse da landing sem piora acima de 3 pontos |
| G-18 | Ambientes isolados (dados e segredos) e restauração ensaiada | T-13.x |
| G-19 | Checklist de lançamento atualizada com estados honestos e dependências | `produto/lancamento.md` |
| G-20 | Cada entrega rotulada como implementado, validado localmente, validado em ambiente integrado ou publicado | Registro final |

**Explicitamente fora do "concluído":** o MVP comercial completo (pagamentos, planos, afiliados, APK, loja, suporte), o painel de responsáveis, a validação com alunos reais e a revisão humana do acervo. O backend concluído **não** significa que o produto esteja pronto para vender. O relatório final dirá isso com clareza.
