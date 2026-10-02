---
estado: em-execucao
atualizado: 2026-10-02
iniciativa: 49
---

# 49 — Planos, assinaturas, vidas, anúncios, ranking 18+, funções pagas e correções de entrada: registro de execução

> O que de fato aconteceu. Cada tarefa registra o que foi feito, a **evidência real** (comando e saída) e as divergências entre spec e código (`DV49-x`). Nenhuma afirmação sem evidência. Estados de validação: **implementado** · **validado localmente** · **validado em ambiente integrado** · **publicado**.

## Linha de base

Última suíte completa verde antes da 49 (48, 01/10/2026, working tree das D48-17/D48-18): tipos ✅ · unitários 1381 pass / 0 fail · lint 0 erros / 17 avisos · build e build `vercel` ✅ · E2E 543 passed / 1 instável (passou 3/3 isolado) / 73 skipped. Produção: `main` = `df46bc6` (ads.txt), deploy da Vercel com status success.

## Divergências spec × código

| ID | Onde | O que a spec diz | O que o código faz | Decisão |
|---|---|---|---|---|
| DV49-01 | `src/server/auth/index.ts` (Better Auth `additionalFields` com `input: true`) | Ano de nascimento "travado" (D49-06) e aceite registrado | **Falha de segurança em produção:** `POST /api/auth/update-user` aceitava `birthYear`, `termsVersion` e `privacyVersion` vindos do aluno (reproduzido em teste: 2006 → 1990). Burlava a idade mínima, o aceite sem registro e, no futuro, o ranking 18+ | Gancho `databaseHooks.user.update.before` recusa (400 `CAMPO_PROTEGIDO`) qualquer atualização pelo Better Auth que traga esses campos; o cadastro e o /cadastro/completar gravam pelo Drizzle e não passam pelo gancho. Testes em `tests/unit/servidor/auth.test.ts`. Publicar o quanto antes |
| DV49-03 | D49-09, §6 (pagador), T-49.3.2 | O Foca pede nome, CPF e e-mail do pagador e cria o cliente no Asaas antes do checkout | O checkout do Asaas com `customer` exige endereço completo e telefone do cliente (sandbox, 02/10: `O campo phone/address/addressNumber/postalCode/province/city deve existir`). Sem `customer`, o próprio Asaas pede os dados do pagador na página hospedada (`link` `https://sandbox.asaas.com/checkoutSession/show/{id}`) | **O Foca não pede CPF nem endereço:** só a declaração de maioridade antes de ir ao Asaas; o pagador preenche os dados na página do Asaas (operador). Menos dado pessoal no Foca. A ligação com o aluno é pelo `externalReference` do checkout (id interno da compra), a confirmar com um pagamento de teste na T-49.3.3 |
| DV49-02 | §5.7 item 1 | Painel de diagnóstico "só em preview" | Vale com o parâmetro em qualquer domínio, inclusive produção | O teste é no navegador do Instagram: o preview exigiria mandar o segredo da Vercel por mensagem do app. O painel não coleta nem envia nada e só carrega com `?diagnostico-rolagem=1` (teste garante que sem o parâmetro nada é baixado) |

## Por tarefa

### 01/10/2026 — Preparação antes da aprovação

- **Spec e tutorial escritos** a partir das decisões do proprietário de 01/10 (planos, anúncios, vidas, protetores, ranking 18+, seis funções pagas, bug do Instagram) e dos pedidos do mesmo dia (perfil, "Criar conta" → quiz, Google novo → quiz, nivelamento de 30). Pesquisas: código (mapa de rolagem, planos, schema, respostas, sequência, ranking, idade, regras) e externa (GPT recompensado/intersticial na web, TFAT, ANPD/cookies, ECA Digital e Decreto 12.880/2026, Serpro, lojas, Asaas sandbox e eventos, ScrollTrigger no Instagram), com fontes e datas na spec.
- **Preparação do proprietário já feita** (tutorial [preparacao.md](preparacao.md)):
  - Passo 1: conta sandbox do Asaas criada; `.env.asaas-sandbox` (ignorado pelo Git) com `ASAAS_API_URL`, `ASAAS_API_KEY` (166 caracteres, conferida sem exibir), `ASAAS_WEBHOOK_TOKEN` (48, gerado pelo agente) e `VERCEL_BYPASS_PREVIEW` (32, gerado pelo agente).
  - Passo 2: segredo de bypass cadastrado na Vercel pela API (`PATCH /v1/projects/{id}/protection-bypass`, HTTP 200, nota `webhook-asaas`, igual ao do arquivo; nenhum segredo impresso).
  - Passo 4.2: URI de redirecionamento do preview previsto (`https://foca-git-spec-49-foca3.vercel.app/api/auth/callback/google`) adicionada pelo proprietário. O painel do Google não mostra "Origens JavaScript autorizadas" e não precisa (login pelo servidor); tutorial corrigido.
  - Passo 5: webhook do Asaas configurado pelo proprietário com a URL do preview e o token (copiados para a área de transferência pelo agente, sem passar pelo chat). Só funciona depois que o preview existir (T-49.0.3).
  - Passo 8: AdSense criado; **`public/ads.txt` publicado** com autorização do proprietário (`df46bc6`, teste em `seo.test.ts`), servido em `www.focaedu.com/ads.txt` e `focaedu.com/ads.txt` (200, `text/plain`).
  - Passo 9: Ad Manager aceitou o cadastro ("You're eligible to sign up"), mas **só abre depois da aprovação da conta do AdSense**, que está em análise. Risco anotado: a política de privacidade ainda diz "não mostramos publicidade".
  - Branding do Google (publicação do login): links oficiais passados ao proprietário (`/privacidade` e `/termos` no ar, ambos "rascunho em revisão jurídica", contato "pendente de definição").
- **Não incluído por decisão do proprietário:** troca das chaves expostas no chat (Google, Resend, chave do sandbox do Asaas).

### 02/10/2026 — Aprovação (T-49.0.1) e regras revistas (T-49.0.2)

- **T-49.0.1:** proprietário: "aprovo a spec". Todas as propostas aprovadas como escritas. Spec e tutorial em `estado: aprovado`; índice de specs atualizado.
- **T-49.0.2:** nota "Revista pela 49 (aprovada em 02/10/2026)" em R-ESC-3, R-ESC-4, R-ESC-7, R-PRIV-3, R-GAM-2, R-GAM-3, R-GAM-5, R-MKT-4 (`regras.md`), em `gamificacao-e-som.md` (2 trechos), `funcionalidades.md` (ranking), `privacidade.md` (publicidade), `contratos.md` C-XP-6 e 48 D48-16. A spec passou a dizer que o **texto novo** de cada regra entra quando a entrega que a implementa for publicada (E1, E2, E3), para os documentos não descreverem como vigente o que o app ainda não faz. Evidência: `bun run docs:check` — nenhum link ou caminho quebrado.
- **Estado de validação:** documentação; nada de código.

### 02/10/2026 — Execução da E1 (parte 1)

- **T-49.0.3 — Preview com banco e sandbox (feito):** branch `spec-49` (`6657221`) enviada ao GitHub com pedido do proprietário. 14 variáveis só em Preview e só para a branch `spec-49` (banco: branch `dev` do Neon; `BETTER_AUTH_SECRET` novo; `BETTER_AUTH_URL` do preview; Google; Resend; Asaas sandbox; `PAGAMENTOS_HABILITADO=true`; `ANUNCIOS_PROVEDOR=falso`), lidas de arquivo sem exibir. Erro encontrado e corrigido: o `.env.neon-dev` guarda as URLs **entre aspas simples**, que foram junto para a Vercel (banco "indisponível"); trocadas pelo valor sem aspas. Evidência: `/api/saude` do preview (com o cabeçalho de bypass) → `{"ok":true,"banco":"ok"}`; sem bypass → 302 (protegido); login Google do preview → `accounts.google.com` com `redirect_uri=https://foca-git-spec-49-foca3.vercel.app/api/auth/callback/google`. A rota do webhook ainda não existe (F3).
- **T-49.4.1 — Banco do nivelamento (feito):** itens elegíveis e revisados com todos os pacotes carregados (`carregarPacotesReais`): LC 40 (18 habilidades), MT 34 (15), CN 38 (15), CH 41 (14). Todas acima de 12: segue.
- **T-49.4.2 — Nivelamento de 30 (feito):** `PLACEMENT_TOTAL_ITENS = 30`, `cotasDoNivelamento` (peso 1,5/1, maior resto, limitado ao pool), sem parada por SE quando há `cotas`; estado sem cotas segue a regra antiga e recebe cotas na rota (`cotasParaRetomar`, nunca abaixo do respondido). Abertura "São 30 questões" (tempo 30 × 50 s ≈ 25 min), "Questão N de 30", "Começar nivelamento". `ofertaCorpo` e `medirExplica` passaram de "umas 20" para "30 questões". Contrato C-NIV-2 e inventário de copy atualizados. Evidência: `placement-cotas.test.ts` (9/9/6/6; 8/8/7/7; 1 área = 30; pool curto; retomada; 30 respostas sem parar por SE; antigo ≤ 24) e suítes de nivelamento → **65 pass**; E2E `placement`, `onboarding`, `diagnostico` → **29 passed** (CAT real de 30 itens); `layout` do nivelamento em 320 → passed. Captura da abertura e da 1ª questão a 390 px.
- **T-49.1.4 — Perfil com dados da conta (feito):** nome e e-mail da sessão do servidor; `prefs.name` preenchido com o primeiro nome da conta quando vazio; nome editável (folha, mínimo 2 letras, `authClient.updateUser`, sessão recarregada); "Resetar demonstração" só sem conta. Ao testar a edição do nome achei a **DV49-01** (acima). Evidência: `perfil-conta.spec.ts` 2 passed; `layout` /profile em 320 → passed depois de mover o `truncate` para um `span` (a área de toque ampliada era cortada); `auth.test.ts` +2 (campos protegidos recusados; troca de nome funciona) → servidor **82 pass**.
- **T-49.1.3 — Entrada pelo quiz (feito):** `/login` "Criar conta" → `/quiz` sem onboarding no aparelho (senão `/cadastro`); `/cadastro/completar` de conta nova sem onboarding → `/quiz` (conta antiga que só reaceita segue para o destino). Evidência: `entrada-quiz.spec.ts` **3 passed** (inclui conta criada sem ano, como a do Google); `conta`, `onboarding`, `sync` → **35 passed**.
- **T-49.1.1 — Diagnóstico da rolagem (feito; aguarda o teste em aparelho):** painel `src/lib/diagnostico-rolagem.ts` (módulo à parte, só com `?diagnostico-rolagem=1`; DV49-02) com `scrollY`, `innerHeight`, `visualViewport`, altura da história e do documento, modo, cada `ScrollTrigger.refresh`/`refreshInit` (eventos novos de `scroll.ts`), troca de classe do `<html>`, `resize`, `orientationchange`, inversões e pulos (≥ meia tela num evento), com "Copiar diagnóstico". E2E de emulação `rolagem-inapp.spec.ts` (UA do Instagram, toque, altura 844 ↔ 760 a cada inversão): **passou no Chromium — o pulo não se reproduz na emulação**; a causa precisa do teste real (Passo 10). Landing + motion + emulação no lp-mobile → **24 passed** (sem o parâmetro, nada é baixado).
- **T-49.1.2 — Correção da rolagem:** bloqueada até os diagnósticos do iPhone e do Android.
