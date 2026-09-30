---
estado: aprovado
atualizado: 2026-09-29
decidido-por: proprietário (23/09/2026; plano Hobby confirmado em 29/09/2026)
substituido-por: null
---

# 0001 — O Foca é hospedado na Vercel, com um só build e um só deploy

## Contexto

O app é SSR (TanStack Start + Nitro) e tem uma server function (Foca IA) que usa segredo no servidor. Em 23/09/2026 o deploy na Vercel publicava `dist/` sem `index.html`, porque o `vite.config.ts` forçava o preset Netlify; o site Netlify antigo servia outro projeto (27 §14.1–§14.2).

## Opções consideradas

| Opção | A favor | Contra |
|---|---|---|
| Vercel | Projeto `foca3/foca` já recebe push do GitHub; preset `vercel` nativo do Nitro; página oficial de TanStack Start (vercel.com/docs/frameworks/full-stack/tanstack-start, 22/09/2026) | Hobby é "non-commercial personal use only" (Fair Use Guidelines, 14/09/2026) |
| Netlify | Já usado antes | Site antigo servia outro projeto; o proprietário não pretende mais usar |
| GitHub Pages | Grátis | Estático: sem função de servidor, o tutor e o SSR quebram |

## Decisão

Vercel, preset do Nitro escolhido por ambiente. **No plano Hobby por enquanto** (decisão do proprietário, 29/09/2026). Função na região `gru1` (São Paulo) quando o backend entrar (46 §E.1). A Netlify sai do projeto (46 F03).

## Consequências

- **Antes de vender**, o plano precisa ser Pro (US$ 20/mês por assento, docs da Vercel de 15/09/2026). Registrado em `docs/produto/lancamento.md`.
- No Hobby: logs de execução duram 1 hora, 1 região de função, cron diário, 1 regra de rate limit no firewall. Por isso os eventos de segurança ficam também no banco (46 §E.8).
- Push em `main` dispara deploy de produção: trabalho em branch, push só com pedido do proprietário.

## Origem

27 §14; 46 §0 (D-11), §E.1.
