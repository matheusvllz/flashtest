---
estado: em-execucao
atualizado: 2026-09-30
iniciativa: 48
substitui: []
substituido-por: null
---

# 48 — Backend integrado ao Neon, Foca IA em produção e funções que hoje são cosméticas

**Aprovação:** 30/09/2026, pelo proprietário, por escrito na conversa: "O escopo descrito aqui está aprovado: registre as decisões, detalhe tarefas e critérios de aceite e avance na implementação". O escopo aprovado é o pedido inteiro (Neon e integração, domínio, Foca IA completa, `/topics`, `/plan`, diagnóstico, resultados de checagem e nivelamento, sequência, telas no desktop, retomada, salvamento e desempenho). **Não** aprova: commit, push, PR, merge, deploy na Vercel, planos comerciais, cobrança, coleta de dado nova além da descrita aqui, fornecedor novo, analytics externo, service worker ou modo offline completo.
**Vinculada a:** [46 — Do protótipo ao produto](../46-producao/spec.md). A 48 executa as fases da 46 que dependem da integração (T-04.7, F08, pendências de F05–F07, partes de F09, F12 e F13) e acrescenta o que a 46 não cobria (B-065, B-066, B-068, B-069, B-070, B-074, sequência, retomada, salvamento, desempenho). Onde as duas falam do mesmo assunto, a 46 continua valendo, salvo o que a §0 abaixo muda.
**Prevalece sobre:** 46 D-10 só na parte "domínio mais tarde" (o domínio existe; o e-mail continua desligado até a verificação na Resend); 46 T-10.1 nos itens `/plan` e `/topics` ("corrigir ou ocultar" vira "corrigir"); contrato C-CKP-5 (a tela dedicada passa a existir).

## Como a IA implementadora deve usar este documento

1. Ler `docs/ESTADO.md`, a seção da tarefa aqui e o fim do [registro](registro.md). Fluxo: [SDD-WORKFLOW.md](../../ai/SDD-WORKFLOW.md).
2. Executar pela ordem do §15. Cada tarefa termina compilando, com `bun test tests/unit` verde e, se tocar UI ou fluxo, E2E do fluxo alterado.
3. Divergência entre esta spec e o código: registrar (`DV48-xx`) e seguir a intenção.
4. Banco de testes: **nunca** a branch `production` do Neon. Integração usa a branch `dev`; testes automáticos usam PGlite.

## 0. Decisões (30/09/2026)

| ID | Decisão | Motivo e consequência |
|---|---|---|
| D48-01 | **Better Auth próprio continua sendo a única identidade** (ADR 0005). `auth: true` do Neon **não** é ligado | `auth: true` provisiona o Neon Auth (Better Auth gerenciado pela Neon, com tabelas e sessões próprias). Ligar os dois criaria duas identidades e dois cookies de sessão. A própria skill oficial da Neon orienta manter um Better Auth que já funciona. Migrar exigiria nova decisão do proprietário; não há motivo concreto para isso hoje |
| D48-02 | `neon.ts` / `neon config init` / `neon deploy` **não adotados agora** | Sem `auth`, não sobra nada a declarar: Functions, Object Storage e AI Gateway estão fora da arquitetura aprovada **e** indisponíveis em `aws-sa-east-1` (skill `neon`, "Region availability"). Adotar o arquivo exigiria a dependência `@neon/config` sem ganho. Branches e migrações são feitas pela CLI e pelo drizzle-kit. Reavaliar se surgir política de branch que valha versionar |
| D48-03 | Branches do Neon: `production` (padrão, produção), `dev` (integração e testes manuais; pode ser recriada a partir de `production`), previews pela integração Vercel ↔ Neon quando o proprietário ligar | "Vincular production não autoriza rodar suítes nela." Nenhum teste, conta de teste ou script de semeadura toca `production` |
| D48-04 | Região confirmada: Neon `aws-sa-east-1` (Postgres 18); função da Vercel em `gru1` (`vercel.json` `regions`) | Coerente com ADR 0005. A região da função só muda no próximo deploy |
| D48-05 | Domínio de produção: **`https://focaedu.com`** (registrado e no ar; DNS na Cloudflare). A pendência de compra da 46 D-10 está **resolvida** | Fato verificado em 30/09: o apex responde **308 → `https://www.focaedu.com/`** (domínio primário configurado na Vercel é o `www`). Para a URL oficial ser o apex, o proprietário troca o domínio primário na Vercel; até lá, `BETTER_AUTH_URL` precisa ser o host que o aluno realmente usa e as duas origens ficam em `AUTH_TRUSTED_ORIGINS` |
| D48-06 | E-mail: **sem caixa de correio e sem domínio de envio verificados** | Verificado em 30/09: `focaedu.com` não tem MX, SPF, DMARC nem DKIM da Resend. Logo, nenhum endereço `@focaedu.com` é publicado como contato (jurídico ou privacidade) até o proprietário confirmar a caixa. `AUTH_EMAIL_HABILITADO` segue desligado em produção |
| D48-07 | **Contas reais em produção só com um método de acesso funcionando** (e-mail verificado na Resend **ou** Google OAuth de produção) | Sem isso, ligar as três variáveis deixaria o aluno sem como entrar. Até lá, produção continua no modo de demonstração (46 D-15). O esquema pode ser aplicado no banco `production` antes (migração aditiva, tabelas vazias) |
| D48-08 | A validação de ambiente **não derruba o app** por variável vazia ou inválida | Incidente verificado em 30/09: em produção, `/api/saude`, `/api/auth/ok` e `/trilha` respondem **500**. Reproduzido com o build `vercel`: basta uma variável opcional vazia (ex.: `OPENAI_API_KEY=""`) ou inválida (ex.: `BETTER_AUTH_URL` sem `https://`) para toda função de servidor cair. Correção no T-48.0.3: vazio = ausente; opcional inválida = ignorada com aviso (só o nome); variável de conta inválida = contas desligadas (modo de demonstração), nunca 500 |
| D48-09 | Histórico do tutor: o cliente envia as **20 últimas** mensagens (46 §E.7); o servidor aceita até 20 e recusa acima disso; o aparelho guarda **as 40 últimas** | Corrige B-102 nas duas pontas. Conversas antigas maiores são aparadas na leitura (campo existente, sem subir o schema) |
| D48-10 | **Tópicos** pesam no planejador como preferência, nunca como filtro | Habilidade de subtópico escolhido ganha peso `PESO_TOPICO_ESCOLHIDO = 1,3` na pontuação de aula, prática e desafio. Revisão devida, reforço, checkpoint e pré-requisito fraco **não** são afetados (a evidência de aprendizagem vence a preferência). Modo "recomendado" ou "pular" = sem peso. Mudar a escolha invalida só a fila não iniciada (`focusSignature`), preservando a atividade em andamento |
| D48-11 | `/plan` é **uma visão** do plano do motor (`journey.committed` + `upcoming`) e do histórico do dia | Sem lista própria, sem quantidade fixa. "Meta diária" só aparece se tiver função (R-GAM-4: unidade = bloco); caso contrário sai |
| D48-12 | Diagnóstico honesto | Áreas com nivelamento aplicado mostram a faixa (C-NIV-8). Sem medição: "Ainda sem medição"; dificuldades declaradas no quiz aparecem como "Você disse que…", **sem** selo de severidade. Quem pula o nivelamento vê o convite para fazê-lo depois e a trilha começa pelo que o perfil indica, dito como ponto de partida |
| D48-13 | Resultado da checagem por habilidade (30 §13.5; 31 Fase 14) | ΔDomínio ≥ +5 → "Subiu"; \|Δ\| < 5 → "Firme"; Δ ≤ −5 **ou** erro com probabilidade prevista ≥ 0,8 → "Vale revisar". Sem número na tela. Uma frase do que muda (revisão antecipada, desafio liberado). XP fixo de 20 (C-XP-4) |
| D48-14 | Sequência: **nenhuma regra nova** (R-GAM-3) | A tela passa a mostrar o que a regra já faz: dias, estudou hoje, proteções guardadas (0–2), dia coberto por proteção, recorde como meta ao voltar. A data em que uma proteção foi usada vira campo aditivo (`ultimaProtecaoEm`) calculado pela mesma regra no app e no servidor. Ícone de fogo laranja com token novo `--brasa` (claro e escuro) |
| D48-15 | Estados de salvamento vêm do motor de sincronização | "Salvo neste aparelho" (sem conta ou modo de demonstração), "Aguardando sincronização" (fila com itens), "Sincronizado com a conta" (fila vazia **e** última troca confirmada pelo servidor), "Não deu para sincronizar" (última tentativa falhou; botão "Tentar agora"). Nada aparece dentro da atividade; aviso só na trilha e no perfil |
| D48-16 | Ranking: **só layout** | O ranking fictício continua só em desenvolvimento (46 T-10.1/T-10.3). Nenhuma exposição social de alunos. **Substituída pela 49 D49-06 (aprovada em 02/10/2026)** quando a entrega E3 for publicada: ranking real só para maiores de 18 |
| D48-17 | Conteúdo de pacote **embutido no servidor** (01/10, defeito de produção) | O servidor recorrige cada resposta com os pacotes de `src/content/banco/**`. Eles entram no bundle pela chamada `import.meta.glob(...)` (o Vite só troca a chamada; testar `typeof import.meta.glob` dava sempre falso no build e a produção lia um disco que não existe → toda sincronização falhava com `ENOENT`). Nada de conteúdo lido do disco em produção |
| D48-18 | Sequência mais visível (01/10, pedido do proprietário) | Chama própria (`ChamaSequencia.tsx`) com o **número dentro**, ~50 px no topo da trilha e 64 px na folha. **Acesa** (laranja `--brasa`, miolo `--chama-miolo`) quando hoje já tem estudo; **cinza** (`--chama-apagada*`) quando ainda não tem — sem texto de perda, o número continua. Um único pulo (`ft-bump`) quando acende com a tela aberta; nada em loop; respeita `prefers-reduced-motion`. Substitui a regra visual de D48-14 ("só ícone, estático"); a R-GAM-3 não muda |

## 1. Contexto

A 46 entregou backend, contas e sincronização **validados localmente** (PGlite, e-mail em arquivo); a produção roda em modo de demonstração (46 D-15). Em 30/09 o proprietário criou o projeto Neon `billowing-bread-71576526` (branch `production`) e registrou `focaedu.com`. Várias telas do app ainda são cosméticas: `/topics` grava escolhas que nada lê (`topics.tsx:94-130`); `/plan` mostra tarefas fixas ("5 flashcards", "1 videoaula", `plan.tsx:32-40`); o diagnóstico do `/aha` vem de heurística sobre o perfil (`gaps.ts:11`); a checagem termina na tela genérica (C-CKP-5); a sequência não mostra a proteção (`streakFreezes` não aparece na UI); o tutor quebra depois de 40 mensagens (B-102).

## 2. Problema

- Teste do João: ele escolhe tópicos e nada muda; abre o plano e vê "1 videoaula" que não existe; vê "lacuna alta" em algo que nunca foi medido; termina uma checagem e não sabe o que melhorou; conversa com a Foca IA por uns dias e ela para de responder. Isso quebra a confiança que sustenta a constância (estratégia §0).
- Produção está com 500 nas funções de servidor (D48-08).

## 3. Objetivos

1. Backend conectado ao Neon real (branch `dev`), migrações aplicadas e verificadas, operação documentada, produção pronta para ligar as contas assim que houver método de acesso.
2. Foca IA de produção (46 F08) com B-102 corrigido.
3. Tópicos, plano e diagnóstico funcionais sobre o motor existente.
4. Resultados de checagem e nivelamento que mostram avanço com honestidade.
5. Sequência visível, telas secundárias no desktop, retomada e salvamento compreensíveis, desempenho medido.

## 4. Não objetivos

Neon Auth; Neon Functions, Storage ou AI Gateway; planos pagos, cobrança, troca de plano; ranking real ou perfil público; service worker/PWA offline; analytics externo; dependência nova sem justificativa nesta spec (nenhuma prevista); mudar regra de XP, sequência ou proteção; alterar conteúdo pedagógico; publicar no app ou na Vercel.

## 5. Requisitos funcionais

| ID | Requisito | Critério verificável |
|---|---|---|
| RF-1 | App falha de forma segura com ambiente incompleto ou inválido | Teste: `OPENAI_API_KEY=""`, `BETTER_AUTH_URL=focaedu.com`, `BETTER_AUTH_SECRET` curto → nenhuma rota responde 500 por isso; `/api/saude` diz o modo; log cita só nomes |
| RF-2 | Migrações aplicadas no Neon `dev` e o servidor funciona contra ele | `db:migrate` na `dev` (saída registrada); suíte `test:neon` (opt-in) verde contra a `dev`, incluindo concorrência entre conexões (DV-11 da 46) |
| RF-3 | Isolamento entre alunos em **todas** as funções de servidor | `tests/unit/servidor/isolamento.test.ts` percorre a lista de funções exportadas; a lista é conferida contra o código (teste falha se surgir função nova fora da suíte) |
| RF-4 | Tutor só com sessão, idade e consentimento | 401 sem sessão; 403 abaixo de `TUTOR_IDADE_SEM_CONSENTIMENTO` sem consentimento; modo de demonstração mantém o fallback local sem chamar a OpenAI |
| RF-5 | Contexto do tutor montado no servidor | O cliente envia só `mensagens`, `itemId`, `alternativa` e `foco`; campos antigos (`context`, `pedagogy`) são ignorados (teste de injeção) |
| RF-6 | Histórico do tutor não quebra (B-102) | Conversa de 60 mensagens: o cliente envia 20, o servidor responde, o `localStorage` guarda 40 |
| RF-7 | Cotas e teto de custo | Grátis 3/dia (foto conta como mensagem); pro 20 + 5 fotos; teto global diário; duas chamadas simultâneas não passam do limite |
| RF-8 | Foto | Compressão no cliente (lado maior 1.600 px, JPEG ~0,8); servidor recusa > 2 MiB e tipo falso pelo conteúdo (bytes mágicos) |
| RF-9 | Salvaguardas | Moderação simulada nos testes; protocolo de autocuidado (CVV 188) sem seguir a conversa; aviso de IA visível; desligar o tutor no perfil |
| RF-10 | Tópicos influenciam o plano | Teste do planejador: com subtópico escolhido, a primeira aula/prática nova é desse subtópico quando não há revisão devida; com revisão devida, a revisão vem antes |
| RF-11 | Plano real | `/plan` lista as atividades de `committed`/`upcoming` com o título e o link de `hrefForActivity`; conclusão do dia aparece; nenhum texto fixo de quantidade |
| RF-12 | Diagnóstico honesto | Sem nivelamento, nenhuma severidade aparece; com nivelamento, faixa por área igual à do resultado |
| RF-13 | Resultado da checagem | `CheckpointResult` com linha por habilidade e rótulo pela regra D48-13; teste unitário da classificação |
| RF-14 | Resultado visual do nivelamento | Medida, não medida e evidência insuficiente distintas por texto e forma (não só cor); sem número |
| RF-15 | Sequência | Indicador com fogo, dias, "hoje" feito ou não, proteções, dia protegido; valor do servidor quando a fila está vazia; "atualizando" quando há fila |
| RF-16 | Desktop | Redação, flashcards, plano, tópicos e ranking com layout próprio em ≥ 1024 px; nada quebra em 320 |
| RF-17 | Retomada | Recarregar no meio da atividade volta à mesma questão com as respostas confirmadas; atividade indisponível leva à trilha com aviso; resposta, conclusão e XP não duplicam |
| RF-18 | Estados de salvamento | Os quatro estados da D48-15, com teste do motor e E2E |
| RF-19 | Desempenho | Medição antes/depois em cenário fixo (390 px, CPU 4×, rede 4G lenta) em landing, quiz, trilha e atividade; nenhuma piora; melhoria só declarada com número |

## 6. Requisitos de UX

- Copy nova em `src/lib/copy.ts` com linha no [inventário](../../copy/inventario.md); termos do produto: "checagem", "nivelamento", "faixa", "sequência" (nunca "streak" na tela, R-VOZ-8). Skill `better-writing` pelo roteamento §2.1; falas da Foca em `voz.ts` sem skill de escrita.
- Estados obrigatórios em toda tela nova: carregando, vazio, erro com nova tentativa, sucesso.
- Sequência: sem culpa, ameaça, contagem regressiva de perda ou animação constante. Volta depois de pausa: acolhimento + recorde como meta (R-GAM-3).
- Tutor: limite atingido, indisponível e nova tentativa com texto claro; o estudo nunca trava.

## 7. Requisitos de performance

Nenhuma requisição nova no caminho da questão. Code splitting preservado (regra dura 9): a raiz continua sem store, `AppShell` e conteúdo; teste do `45` verde. Bundle inicial de `/` sem aumento; rotas do app sem aumento acima de 5 kB gzip por tarefa sem justificativa no registro.

## 8. Requisitos de acessibilidade

Alvos ≥ 44 px; cor nunca é o único sinal (faixas, sequência, estados de salvamento têm texto); `aria-live` educado para mudança de estado de salvamento; `prefers-reduced-motion` respeitado; 320 px sem rolagem horizontal; axe sem violação séria nas telas novas.

## 9. Analytics e dados

Nenhum analytics externo. Dado novo: `consent` (já previsto na 46 §E.2, finalidade `responsavel_foca_ia`), `ai_usage`/`ai_budget` (já no esquema), `profile.tutor_desligado` (preferência, sem dado pessoal novo), `ultimaProtecaoEm` (derivado dos dias de estudo). Preferências de tópicos passam a sincronizar dentro do `learning_doc` (já é dado do aluno, sem coleta nova). Tudo entra em `docs/seguranca/privacidade.md`.

## 10. Implicações de segurança

L2 em F0, F1, F2 e F3 (auth, dado pessoal, IA, deploy). L1 no resto. Ameaças do `modelo-de-ameacas.md`: T1–T4 (auth), T7 (adulteração de recompensa), IA (injeção, custo, conteúdo de risco). Nenhum segredo em log, em `VITE_*` ou no repositório; conexão do Neon `dev` só em `.env.neon-dev` (ignorado). MCP da Neon no repositório só com a URL (OAuth no cliente).

## 11. Arquitetura proposta (resumo)

- `src/server/env.ts`: leitura por campo, vazio → ausente, inválido → descartado com aviso; contas desligadas se faltar ou for inválida variável de conta.
- `scripts/db/` (**NOVO**): `migrar-neon.ts` (aplica `drizzle/` numa URL explícita, recusa `production` sem `--confirmar-producao`), `verificar-neon.ts` (lista tabelas e migrações aplicadas, somente leitura).
- `tests/neon/` (**NOVO**, fora de `tests/unit`): suíte opt-in contra a `dev` (`bun run test:neon`).
- Tutor: `src/lib/tutor.ts` vira função com sessão; `src/server/tutor/` (**NOVO**: `contexto.ts`, `cota.ts`, `moderacao.ts`, `imagem.ts`); `TutorBubble` envia o contrato novo e mostra os estados.
- Planejador: peso de tópico em `planner.ts`/`scoring.ts` (constante em `constants.ts`).
- Telas: `plan.tsx`, `topics.tsx`, `aha.tsx`, `CheckpointResult.tsx` (**NOVO**), `PlacementResult.tsx`, `IndicadorSequencia.tsx` (**NOVO**), `EstadoSalvamento.tsx` (**NOVO**).
- Motor de sincronização: estado observável (`useEstadoDaSync`).

## 12. Modelo de dados / migração

- Postgres: `profile.tutor_desligado boolean default false` (aditiva). `consent`, `ai_usage`, `ai_budget` já existem (`drizzle/0000_inicial.sql`); conferir colunas na T-48.2.2.
- Store: só campos opcionais novos, normalizados na leitura (padrão do `36`): `tutor.messages` aparado; `progress.ultimaProtecaoEm?`. Sem subir o schema.
- Agregado da sincronização: `ultimaProtecaoEm` aditivo.

## 13. Compatibilidade e rollout

Produção continua em modo de demonstração até D48-07. Tudo funciona nos dois modos: no de demonstração, tutor com fallback local, salvamento "neste aparelho", sequência local.

## 14. Tarefas

Estado inicial de todas: `pendente`, salvo indicação. Tamanho: P/M/G.

### F0 — Neon, ambiente e domínio

**T-48.0.1 — Spec, registro e painel (P)** — esta spec, `registro.md`, `ESTADO.md`, `specs/README.md`, backlog. Aceite: `docs:check` verde.

**T-48.0.2 — Ferramentas Neon e decisão (P)** — CLI `neon@7.0.1` global (Bun), skills `neon`/`neon-postgres`/`neon-postgres-branches`, MCP do Neon em escopo de projeto (OAuth, fixado no projeto), branch `dev`; ADR 0007 com D48-01…D48-04. Aceite: `node scripts/validate-skills.mjs` 0 FAIL; ADR com alternativas.

**T-48.0.3 — Ambiente que não derruba o app (P, L2)** — D48-08. Aceite: RF-1 com testes em `tests/unit/servidor/env.test.ts`; reprodução com o build `vercel` antes/depois registrada. Publicar a correção depende de pedido do proprietário.

**T-48.0.4 — Migrações e suíte no Neon `dev` (M, L2)** — `scripts/db/migrar-neon.ts`, `verificar-neon.ts`, `tests/neon/*.test.ts`, script `test:neon`. Aceite: RF-2; saída real registrada; nenhuma conexão com `production` nos testes (o script recusa).

**T-48.0.5 — Domínio e URLs (P)** — D48-05/06: `VITE_SITE_URL` padrão de produção, `AUTH_TRUSTED_ORIGINS` com apex e `www`, `vercel.json` `regions: ["gru1"]`, `docs/operacao/ambientes-e-deploy.md` com a tabela por ambiente (produção, preview, desenvolvimento) e a checagem de Resend e Google; textos legais sem e-mail inventado. Aceite: `seo.test.ts` com canonical do domínio; docs atualizados; bloqueios antigos de domínio fechados no ESTADO e na 46.

**T-48.0.6 — Esquema no Neon `production` (P, L2)** — depois do congelamento do esquema desta spec (fim da F2): conferir destino, listar o plano (migrações pendentes), aplicar só migrações aditivas, verificar com `verificar-neon.ts` (somente leitura). Sem dados, sem contas, sem testes. Aceite: saída registrada.

**T-48.0.7 — Variáveis na Vercel (P, bloqueada: proprietário)** — lista exata por ambiente no `ambientes-e-deploy.md`. Desbloqueia com acesso do proprietário ao painel.

**T-48.0.8 — Resend e Google OAuth (P, bloqueada: proprietário)** — registros DNS da Resend na Cloudflare (sem mexer nos registros do site), cliente OAuth de produção com origem e retorno exatos. Desbloqueia D48-07.

### F1 — Pendências da 46 (F05–F07)

**T-48.1.1 — `isolamento.test.ts` (M, L2)** — RF-3 (46 T-06.6).
**T-48.1.2 — Importação interrompida (P)** — falha forçada no meio da transação → nada gravado; repetir aplica tudo (46 T-07.1).
**T-48.1.3 — E2E de conta e sincronização em 320 e 1280 (P)** — `conta.spec.ts` e `sync.spec.ts` nos projetos `narrow` e `desktop` (46 T-05.4, T-07.4).

### F2 — Foca IA em produção (46 F08)

**T-48.2.1 — Histórico (P)** — D48-09, RF-6 (B-102).
**T-48.2.2 — Sessão, idade e consentimento (M, L2)** — RF-4 (46 T-08.1). Consentimento do responsável: estado e convite; o envio do e-mail ao responsável depende do e-mail em produção (D48-06).
**T-48.2.3 — Contexto no servidor (M, L2)** — RF-5 (46 T-08.2); `brand-voice.test.ts` verde.
**T-48.2.4 — Cotas e teto (M, L2)** — RF-7 (46 T-08.3); valores de `env` (D-12).
**T-48.2.5 — Foto (P, L2)** — RF-8 (46 T-08.4).
**T-48.2.6 — Salvaguardas (M, L2)** — RF-9 (46 T-08.5).
**T-48.2.7 — Estados na interface (P)** — limite, indisponível, nova tentativa; E2E do tutor.
**T-48.2.8 — Validação integrada (P, bloqueada: chave da OpenAI)** — 46 T-08.6.

### F3 — Conta, privacidade e operação (46 F09, F12, F13)

**T-48.3.1 — Exportar dados (P, L2)** — 46 T-09.1.
**T-48.3.2 — Excluir conta (M, L2)** — 46 T-09.2.
**T-48.3.3 — Retenção (P)** — 46 T-09.3 (cron protegido por `CRON_SECRET`).
**T-48.3.4 — Runbooks e saúde (P)** — 46 T-13.4/T-13.5 com o Neon real.

### F4 — Funções adaptativas

**T-48.4.1 — Tópicos (M)** — D48-10, RF-10; texto que explica o efeito; sincroniza no `learning_doc`.
**T-48.4.2 — Plano (M)** — D48-11, RF-11.
**T-48.4.3 — Diagnóstico (M)** — D48-12, RF-12.

### F5 — Resultados

**T-48.5.1 — Resultado da checagem (M)** — D48-13, RF-13; contrato C-CKP-5 atualizado.
**T-48.5.2 — Resultado visual do nivelamento (P)** — RF-14; C-NIV-8 preservado.

### F6 — Sequência

**T-48.6.1 — Indicador de sequência e proteção (M)** — D48-14, RF-15; token `--brasa` em `:root` e `.dark`.

### F7 — Desktop

**T-48.7.1 — Telas secundárias (M)** — RF-16 (B-074); capturas 320/390/1280.

### F8 — Retomada e salvamento

**T-48.8.1 — Auditoria e correções de retomada (M)** — RF-17.
**T-48.8.2 — Estados de salvamento (M)** — D48-15, RF-18.

### F9 — Desempenho

**T-48.9.1 — Medição de base (P)** — RF-19, cenário fixo, números em `docs/specs/48-integracao-e-evolucao/desempenho.md`.
**T-48.9.2 — Correções medidas (M)** — só com antes/depois.

### F10 — Fechamento

**T-48.10.1 — Regressão completa, `spec-verifier`, registro e ESTADO (P)**.

## 15. Dependências entre tarefas

```text
0.1 → 0.2 → 0.3 → 0.4 → 0.5
0.4 → 1.1, 1.2 ; 1.3 independente
2.1 independente (cliente) ; 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 ; 2.x → 0.6
0.7, 0.8, 2.8 bloqueadas (proprietário)
3.x depois de 2.x
4.1 → 4.2 → 4.3 ; 5.1, 5.2 independentes ; 6.1 depois de 8.2 (usa o estado da sync) ou com um stub
7.1 depois de 4.2 (plano) ; 8.1 independente ; 9.1 antes de 9.2 ; 10.1 por último
```

## 16. Critérios de aceite globais

| ID | Critério | Como verificar |
|---|---|---|
| G48-1 | Nenhuma rota de servidor responde 500 por configuração | RF-1 + build `vercel` local |
| G48-2 | Esquema aplicado e verificado no Neon (`dev`; `production` sem dados) | Saída de `verificar-neon.ts` |
| G48-3 | Isolamento de todas as funções | `isolamento.test.ts` |
| G48-4 | Foca IA: sessão, cota, teto, contexto no servidor, histórico, foto, salvaguardas | Testes da F2 |
| G48-5 | Nenhuma tela cosmética entre `/topics`, `/plan`, `/aha` | RF-10…12 + E2E |
| G48-6 | Resultados de checagem e nivelamento sem número inventado | RF-13, RF-14 |
| G48-7 | Sequência e salvamento refletem o servidor | RF-15, RF-18 |
| G48-8 | Desktop e 320 px | Capturas e E2E nos 3 tamanhos |
| G48-9 | Desempenho com antes/depois | `desempenho.md` |
| G48-10 | Gates: tipos, unitários, lint, build, E2E dos fluxos alterados, docs | Saídas reais no registro |

## 17. Testes

Unitários e de integração (PGlite) para tudo que é regra; `tests/neon` opt-in contra a `dev`; E2E nos fluxos alterados nos projetos `narrow`, `chromium` e `desktop`. Nenhum teste chama a OpenAI nem a Resend de verdade.

## 18. Edge cases

Variável com espaços; `BETTER_AUTH_URL` com barra no fim; aparelho com conversa de 300 mensagens; foto HEIC renomeada para `.jpg`; dois cliques no envio do tutor; teto de custo atingido no meio do dia; checagem sem nenhuma resposta (saiu no começo); nivelamento pulado e refeito; troca de tópicos com atividade em andamento; sequência com fila de sincronização pendente e servidor discordando; recarregar durante "Verificar"; conteúdo atualizado que remove o item em andamento; aparelho compartilhado entre duas contas.

## 19. Riscos

| Risco | Mitigação |
|---|---|
| Ligar contas em produção sem método de acesso | D48-07; checagem no runbook |
| Teste acidental na `production` | Script recusa; `.env.neon-dev` só com a `dev` |
| Custo da IA | Teto global padrão US$ 1/dia (D-12) |
| Planejador mudar o comportamento pedagógico além do pedido | Peso só em candidatos novos; testes do motor existentes verdes |
| Performance: medição local não representa o celular real | Registrar a limitação; cenário fixo e repetível |

## 20. Checklist final

- [ ] Todas as `T-48.*` com evidência ou bloqueio com dono
- [ ] Todos os `G48-*` com evidência
- [ ] Gates do `AGENTS.md`
- [ ] `registro.md`, `ESTADO.md`, `specs/README.md`, backlog atualizados
