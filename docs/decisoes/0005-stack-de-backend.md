---
estado: aprovado
atualizado: 2026-09-29
decidido-por: proprietário (29/09/2026, D-06 do 46)
substituido-por: null
---

# 0005 — Backend: Neon Postgres (São Paulo) + Drizzle + Better Auth + Resend, sem Redis no início

## Contexto

O Foca não tinha backend: login simulado, progresso só no `localStorage`, recompensas adulteráveis e o endpoint da IA aberto (46 §A.2–§A.4). O público é majoritariamente adolescente, o que pede dados no Brasil e o mínimo de fornecedores.

## Opções consideradas

Detalhe e fontes oficiais (consultadas em 29/09/2026) em 46 §E.1.

| Área | Escolhida | Descartadas e por quê |
|---|---|---|
| Banco | **Neon Postgres**, `aws-sa-east-1`, conectado pelo Marketplace da Vercel (modo Neon-managed: banco por preview, apagado com a branch) | Supabase (a vantagem é a plataforma, que não usaríamos; o grátis pausa após 1 semana); Turso (não é Postgres) |
| ORM e migrações | **Drizzle ORM** + drizzle-kit (`generate` + `migrate`, SQL versionado) | — |
| Autenticação | **Better Auth** (biblioteca; dados no nosso Postgres; integração oficial com TanStack Start) | Clerk (dados de menores fora do Brasil, custo por usuário); Supabase Auth (amarra ao Supabase); Auth.js (fraco em e-mail e senha) |
| E-mail | **Resend**, envio de `sa-east-1` com domínio verificado | — |
| Rate limit e cotas | **Postgres** (armazenamento `database` do Better Auth + contadores atômicos) | Upstash Redis (um fornecedor a mais sem necessidade comprovada; pode entrar depois) |

## Decisão

A tabela acima. Função da Vercel em `gru1`. Nenhum serviço distribuído além disso (sem fila, worker ou microserviço).

## Consequências

- Os dados de conta e de estudo ficam em São Paulo; fora do Brasil ficam só a plataforma da Vercel e a OpenAI (transferência internacional, 46 §H).
- **Sem domínio, não há e-mail em produção** (a Resend exige domínio verificado): o login por e-mail fica desligado em produção até o domínio existir (D-10).
- Desenvolvimento e testes usam PGlite (Postgres em processo) ou Postgres local; a compatibilidade é provada no 46 T-04.2 antes de construir em cima.
- Trocar de fornecedor de banco é barato (Postgres puro, `pg_dump`); trocar de biblioteca de auth exige migração de tabelas de sessão e conta.

## Origem

46 §E; decisão D-06.
