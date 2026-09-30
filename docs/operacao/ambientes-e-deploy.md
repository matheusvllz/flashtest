---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [ambientes, variáveis, deploy]
substitui: []
substituido-por: null
---

# Ambientes, variáveis e deploy

> Hospedagem: Vercel, plano Hobby por enquanto ([ADR 0001](../decisoes/0001-hospedagem-vercel.md)). Backend: [ADR 0005](../decisoes/0005-stack-de-backend.md). Esta página é atualizada em toda mudança de ambiente, variável ou fornecedor. Runbooks: `docs/operacao/runbooks.md` (a criar, 46 T-13.4).

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
| Preview (Vercel) | Branch do Neon por preview (integração Neon-managed) | Caixa de saída ou Resend com destinatários restritos | Só num alias fixo de staging (o Google exige URL exata) | Variáveis `Preview` |
| Produção | Neon `main` (`aws-sa-east-1`) | Resend com domínio verificado (**bloqueado até haver domínio**) | Cliente de produção | Variáveis `Production` |

A proteção de preview (Vercel Authentication) continua ligada.

## 3. Variáveis

Nunca com prefixo `VITE_` (entraria no bundle do navegador), exceto as públicas listadas.

| Variável | Onde | Obrigatória | Observação |
|---|---|---|---|
| `OPENAI_API_KEY` | Servidor | Não (sem ela, fallback local) | Chave ainda a providenciar pelo proprietário |
| `DATABASE_URL` | Servidor | Sim, a partir do 46 F04 | URL com pooler; injetada pela integração do Neon |
| `DATABASE_URL_UNPOOLED` | Migrações | Sim, a partir do 46 F04 | Conexão direta, só para `drizzle-kit migrate` |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Servidor | Sim, a partir do 46 F05 | Segredo aleatório por ambiente |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Servidor | Para login Google | Um par por ambiente |
| `RESEND_API_KEY`, `EMAIL_FROM` | Servidor | Para e-mail em produção | Depende do domínio |
| `AUTH_EMAIL_HABILITADO` | Servidor | Não | `false` em produção até haver domínio (D-10) |
| `MIN_ACCOUNT_AGE` | Servidor | Não (padrão 17) | D-08 |
| `AI_COTA_GRATIS_MENSAGENS`, `AI_COTA_PRO_MENSAGENS`, `AI_COTA_PRO_FOTOS`, `AI_TETO_DIARIO_USD` | Servidor | Não (padrões 3, 20, 5, 1) | D-12 |
| `VITE_SITE_URL`, `VITE_LP_INDEXABLE` | Público (landing) | Não | Canonical/sitemap e indexação; dependem do domínio |

Os nomes finais e a validação ficam em `src/server/env.ts` (a criar, 46 T-04.4), que falha ao iniciar se faltar variável obrigatória.

## 4. Região e limites (Hobby)

- Função na região `gru1` (São Paulo), a configurar em `vercel.json` quando o banco entrar (46 T-04.7).
- Logs de execução duram 1 hora; eventos de segurança ficam também em `audit_event` no banco.
- Cron só diário (suficiente para as rotinas de retenção).
- 1 regra de rate limit no firewall.
- **Hobby é só uso não comercial:** migrar para Pro antes de vender.

## 5. Migrações de banco no deploy (46 T-13.2)

- Preview: `db:migrate` no build, contra a branch do Neon do preview.
- Produção: passo manual e protegido antes da promoção (script com confirmação); nunca automático no push.
