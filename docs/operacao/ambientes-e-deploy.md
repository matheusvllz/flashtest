---
estado: aprovado
atualizado: 2026-09-30
canonico-de: [ambientes, variáveis, deploy]
substitui: []
substituido-por: null
---

# Ambientes, variáveis e deploy

> Hospedagem: Vercel, plano Hobby por enquanto ([ADR 0001](../decisoes/0001-hospedagem-vercel.md)). Backend: [ADR 0005](../decisoes/0005-stack-de-backend.md); Neon: [ADR 0007](../decisoes/0007-integracao-neon.md). Domínio de produção: **`https://focaedu.com`** (spec 48 D48-05). Esta página é atualizada em toda mudança de ambiente, variável ou fornecedor. Runbooks: [runbooks.md](runbooks.md) (46 T-13.4; spec 48 T-48.3.4).

## 1. Como o build e o deploy funcionam hoje

- **Um build, um deploy.** `bun run build` roda `scripts/content/build-packs.ts` (prebuild, gera `public/content/v1/`) e `vite build`.
- **Preset do Nitro por ambiente** (`vite.config.ts`): `NITRO_PRESET` se definido; senão `vercel` quando `VERCEL=1` (a Vercel define sozinha); senão, fora da Vercel, o padrão passa a ser `node-server` (46 T-03.1; antes era `netlify`).
- **Build local de produção:** `NITRO_PRESET=node-server bun run build` e `PORT=3100 node .output/server/index.mjs`. Para medir como a Vercel comprime: `bun scripts/marketing/proxy-comprimido.ts` (porta 3200).
- **Deploy:** push na `main` do GitHub dispara o deploy de produção na Vercel (projeto `foca3/foca`). Branches geram previews. **Push só com pedido do proprietário.**
- **CI** (`.github/workflows/ci.yml`): `bun install --frozen-lockfile`, `bunx tsc --noEmit`, `bun test tests/unit`, `bun run build` (lint, `docs:check` e validador de skills entram no 46 T-03.6).

## 2. Ambientes

| Ambiente | Banco | E-mail | Google | Segredos |
|---|---|---|---|---|
| Local | PGlite (arquivo em `.data/`) ou Postgres local | Caixa de saída em arquivo (`.data/emails/`) | Cliente OAuth de desenvolvimento (opcional) | `.env` local (ignorado pelo Git) |
| Teste (unit, integração, E2E) | PGlite em memória, esquema novo por arquivo | Caixa de saída em memória | Fluxo simulado **só no ambiente de teste** | Valores de teste |
| Integração (agente/manual) | Neon `dev` (`br-square-surf-b6syp33y`, filha de `production`); testes em branch temporária filha de `dev` que expira em 2 h (`bun run test:neon`) | Caixa de saída | — | `.env.neon-dev` local (ignorado pelo Git) |
| Preview (Vercel) | Branch do Neon por preview (integração Vercel ↔ Neon, a ligar pelo proprietário) | Caixa de saída ou Resend com destinatários restritos | Só num alias fixo de staging (o Google exige URL exata) | Variáveis `Preview` |
| Produção | Neon `production` (projeto `billowing-bread-71576526`, `aws-sa-east-1`, Postgres 18) — **nunca** testes nem contas de teste | Resend com `focaedu.com` verificado (**pendente**: sem registros DNS da Resend em 30/09) | Cliente de produção (**pendente**) | Variáveis `Production` |

A proteção de preview (Vercel Authentication) continua ligada.

**Modo de demonstração (D-15):** num ambiente implantado (build de produção ou qualquer ambiente da Vercel) sem `DATABASE_URL`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`, ou com alguma delas inválida, as contas ficam desligadas e "Entrar" é local. `/api/saude` responde `{ "ok": true, "contas": "desligadas" }`. Variável vazia conta como ausente; opcional inválida é ignorada com aviso no log (só o nome). O app nunca responde 500 por configuração (spec 48 D48-08).

**Quando ligar as contas em produção (D48-07):** só quando houver um método de acesso funcionando lá: e-mail (Resend verificado + `AUTH_EMAIL_HABILITADO=true`) **ou** Google OAuth de produção. Antes disso, ligar as três variáveis deixaria o aluno sem como entrar.

**Conta de teste local:** com `bun run dev` rodando, `bun run conta:teste` cria (ou confere) `teste@foca.dev` / `foca-teste-123` no banco local, pela API real (cadastro → link lido de `.data/emails/` → e-mail confirmado). O script recusa qualquer endereço que não seja `localhost`; em produção não existe essa conta.

## 3. Variáveis

Nunca com prefixo `VITE_` (entraria no bundle do navegador), exceto as públicas listadas.

| Variável | Onde | Obrigatória | Observação |
|---|---|---|---|
| `OPENAI_API_KEY` | Servidor | Não (sem ela, fallback local) | Chave ainda a providenciar pelo proprietário. **Não criar vazia** |
| `DATABASE_URL` | Servidor | Sim, a partir do 46 F04 | URL com pooler; injetada pela integração do Neon |
| `DATABASE_URL_UNPOOLED` | Migrações | Sim, a partir do 46 F04 | Conexão direta, só para migração (`bun run db:neon migrar --branch <nome>`) |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Servidor | Sim, a partir do 46 F05 | Segredo aleatório por ambiente (≥ 32 caracteres, `openssl rand -hex 32`). URL **com** `https://`, do host que o aluno usa (hoje a Vercel redireciona `focaedu.com` → `www.focaedu.com`; ver §6) |
| `AUTH_TRUSTED_ORIGINS` | Servidor | Não | Origens extras. Apex e `www` do mesmo domínio já entram sozinhos |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Servidor | Para login Google | Um par por ambiente |
| `RESEND_API_KEY`, `EMAIL_FROM` | Servidor | Para e-mail em produção | Depende da verificação de `focaedu.com` na Resend; remetente sugerido `Foca <nao-responda@focaedu.com>` (só depois de verificado) |
| `AUTH_EMAIL_HABILITADO` | Servidor | Não | `false` em produção até o domínio estar verificado na Resend (D-10, D48-06) |
| `CRON_SECRET` | Servidor | Para as rotinas de retenção | ≥ 16 caracteres |
| `MIN_ACCOUNT_AGE` | Servidor | Não (padrão 17) | D-08 |
| `AI_COTA_GRATIS_MENSAGENS`, `AI_COTA_PRO_MENSAGENS`, `AI_COTA_PRO_FOTOS`, `AI_TETO_DIARIO_USD` | Servidor | Não (padrões 3, 20, 5, 1) | D-12 |
| `VITE_SITE_URL`, `VITE_LP_INDEXABLE` | Público (landing) | Não | Sem `VITE_SITE_URL`, o build de produção usa `https://focaedu.com` no canonical (`src/marketing/config.ts`); `public/sitemap.xml` e `robots.txt` apontam para o domínio |

Validação em `src/server/env.ts` (46 T-04.4; comportamento seguro da spec 48 D48-08).

## 4. Região e limites (Hobby)

- Função na região `gru1` (São Paulo), em `vercel.json` (`regions`, spec 48 T-48.0.5; vale a partir do próximo deploy). Banco em `aws-sa-east-1`.
- Logs de execução duram 1 hora; eventos de segurança ficam também em `audit_event` no banco.
- Cron só diário (suficiente para as rotinas de retenção).
- 1 regra de rate limit no firewall.
- **Hobby é só uso não comercial:** migrar para Pro antes de vender.

## 5. Migrações de banco no deploy (46 T-13.2)

- Ferramenta: `bun run db:neon <plano|verificar|migrar> --branch <nome>` (`scripts/db/neon.ts`; usa a CLI `neon` autenticada e nunca imprime a conexão). `plano` e `verificar` são só leitura.
- Integração: `bun run test:neon` cria uma branch temporária filha de `dev` (expira em 2 h), migra e roda `tests/neon/`.
- Preview: migração contra a branch do Neon do preview (quando a integração estiver ligada).
- Produção: passo manual: `plano --branch production`, revisar o SQL, `migrar --branch production --confirmar-producao`, `verificar --branch production`. Nunca automático no push. Só migração aditiva.

## 6. Domínio, e-mail e OAuth (estado verificado em 30/09/2026)

| Item | Estado | O que falta (dono: proprietário) |
|---|---|---|
| `focaedu.com` no ar | Sim. DNS na Cloudflare; apex e `www` apontam para a Vercel | — |
| Domínio primário | A Vercel redireciona **apex → `www`** (308) | Se a URL oficial é `https://focaedu.com`: em Vercel → Settings → Domains, marcar o apex como primário (e `www` redirecionando para ele). Senão, usar `https://www.focaedu.com` em `BETTER_AUTH_URL` e no Google |
| Envio pela Resend | **Não configurado**: sem SPF, DKIM (`resend._domainkey`) ou registros de `send.` | Adicionar `focaedu.com` na Resend (região `sa-east-1`) e criar na Cloudflare **só** os registros que ela pedir. Não alterar os registros A/CNAME do site |
| Caixa de correio (contato, privacidade, encarregado) | **Nenhuma**: `focaedu.com` não tem MX | Decidir e criar as caixas. Nenhum endereço é publicado nos textos legais antes disso |
| Google OAuth | Não verificável daqui | Cliente OAuth "Aplicativo da Web" de produção: origem JavaScript `https://focaedu.com` e `https://www.focaedu.com`; URI de redirecionamento `https://<host de BETTER_AUTH_URL>/api/auth/callback/google`; tela de consentimento com os links de `/termos` e `/privacidade` |

## 7. Variáveis por ambiente (lista para o painel da Vercel)

| Variável | Production | Preview | Development (local) |
|---|---|---|---|
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Branch `production` (pooled / direta). **Só junto com as outras duas de conta e um método de acesso pronto (D48-07)** | Branch do preview (integração) | Vazio (PGlite) ou `.env.neon-dev` |
| `BETTER_AUTH_SECRET` | Segredo próprio | Segredo próprio (diferente) | Vazio (padrão de desenvolvimento) |
| `BETTER_AUTH_URL` | `https://focaedu.com` (ou o `www`, conforme o domínio primário) | URL do alias de staging | Vazio (`http://localhost:8080`) |
| `AUTH_EMAIL_HABILITADO` | `true` só depois da Resend verificada | `false` ou caixa de saída | Vazio |
| `RESEND_API_KEY`, `EMAIL_FROM` | Depois da verificação | Opcional | Vazio |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Cliente de produção | Cliente de staging | Opcional |
| `OPENAI_API_KEY` | Quando houver chave (**não criar vazia**) | Idem | Opcional |
| `CRON_SECRET` | Segredo próprio | — | — |

Variável criada vazia ou inválida não derruba mais o app, mas é ignorada: confira o log de inicialização (`[env] variáveis inválidas ignoradas: …`).
