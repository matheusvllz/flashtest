---
estado: aprovado
atualizado: 2026-09-30
decidido-por: proprietário (30/09/2026, escopo da spec 48) + responsável técnico (opções de ferramenta)
substituido-por: null
---

# 0007 — Integração com o Neon: Better Auth próprio, sem `neon.ts`, branches separadas

## Contexto

O proprietário criou o projeto Neon `billowing-bread-71576526` (branch `production`) e enviou o roteiro da Neon: instalar a CLI, skills e MCP, vincular a branch `production`, criar `neon.ts` com `auth: true` e rodar `neon deploy`. O Foca já tem autenticação própria com Better Auth no nosso Postgres ([ADR 0005](0005-stack-de-backend.md)).

## Opções consideradas

| Opção | Prós | Contras |
|---|---|---|
| A. `auth: true` (Neon Auth, Better Auth gerenciado) **substituindo** o nosso | Menos código de auth para manter | Migração de usuários, sessões e telas; perde o controle de idade, aceite legal e rate limit já testados; sem motivo concreto |
| B. `auth: true` **junto** do nosso | — | Duas identidades e dois cookies; risco de sessão divergente; viola o princípio de um sistema por responsabilidade |
| C. **Neon só como Postgres**, sem `neon.ts` (escolhida) | Nada muda no código de auth; zero dependência nova | Política de branch fica em comandos e documentação, não em código |
| D. `neon.ts` com `auth: false` só para política de branch | Política versionada | Exige `@neon/config` sem ganho atual; Functions/Storage/Gateway indisponíveis em `aws-sa-east-1` |

## Decisão

Opção C (spec 48, D48-01…D48-04):
- Better Auth próprio continua a única identidade. `auth: true` não é ligado.
- Sem `neon.ts` e sem `neon deploy` por enquanto.
- Branches: `production` (produção; nada de testes nela), `dev` (integração; recriável a partir de `production`), previews pela integração Vercel ↔ Neon quando o proprietário a ligar.
- Migrações pelo drizzle-kit/migrador do projeto, pela conexão **direta**; o script do projeto recusa `production` sem confirmação explícita.
- Ferramentas de agente: CLI `neon@7.0.1` global; skills `neon`, `neon-postgres`, `neon-postgres-branches`; MCP do Neon em escopo de projeto com OAuth (sem chave no repositório).

## Consequências

- Nenhuma mudança na autenticação, nas tabelas de sessão ou nos testes de auth.
- Trocar de ideia depois (Neon Auth) exige nova ADR com plano de migração de usuários.
- Variáveis por ambiente: [../operacao/ambientes-e-deploy.md](../operacao/ambientes-e-deploy.md).

## Origem

Spec 48 §0; skill oficial `neon` ("Do not replace working Better Auth … unless the user asks").
