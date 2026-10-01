---
estado: aprovado
atualizado: 2026-09-30
canonico-de: [procedimentos de operação e incidente]
substitui: []
substituido-por: null
---

# Runbooks — o que fazer quando algo dá errado

> 46 T-13.4; spec 48 T-48.3.4. Ambientes e variáveis: [ambientes-e-deploy.md](ambientes-e-deploy.md). Neon: [ADR 0007](../decisoes/0007-integracao-neon.md). Segurança: [../seguranca/README.md](../seguranca/README.md). Todo comando que muda produção exige pedido do proprietário; nenhum teste roda na branch `production`.

## 0. Primeira olhada (sempre)

1. `curl -s https://focaedu.com/api/saude` — `{"ok":true,"banco":"ok"}` (contas ligadas), `{"ok":true,"contas":"desligadas"}` (modo de demonstração) ou `503 {"ok":false,"banco":"indisponivel"}`.
2. Logs da Vercel (duram 1 h no Hobby): procurar `[env]`, `tutor.*`, `retencao`, `nivel":"erro"`.
3. `audit_event` no banco guarda eventos de segurança por 6 meses (sem conteúdo).

## 1. Produção responde 500 nas funções de servidor

- **Sintoma (visto em 30/09/2026):** `/api/saude`, `/api/auth/ok` e rotas protegidas com 500; a landing abre.
- **Causa provável:** variável da Vercel vazia ou inválida (ex.: `OPENAI_API_KEY` criada vazia, `BETTER_AUTH_URL` sem `https://`, `BETTER_AUTH_SECRET` curto). Até a spec 48 D48-08 ser publicada, o `env()` lançava e derrubava toda função.
- **Agora:** apagar a variável vazia ou corrigir o valor no painel → redeploy. Com a correção D48-08 publicada, o app não cai mais: o log mostra `[env] variáveis inválidas ignoradas: <nomes>` e, se for variável de conta, as contas ficam desligadas.

## 2. Ligar as contas reais em produção (D48-07)

Pré-requisitos, nesta ordem: (a) um método de acesso funcionando em produção — Resend com `focaedu.com` verificado **ou** Google OAuth de produção; (b) esquema aplicado (`bun run db:neon verificar --branch production` → 1/1, 17 tabelas); (c) domínio primário decidido (apex ou `www`) e o mesmo em `BETTER_AUTH_URL` e no Google.
Então: `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET` (novo, ≥ 32), `BETTER_AUTH_URL`, e `AUTH_EMAIL_HABILITADO=true` + `RESEND_API_KEY` + `EMAIL_FROM` (se for o e-mail) ou `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` → redeploy → `/api/saude` deve dizer `"banco":"ok"` → criar **uma** conta real de verificação manual (do proprietário, não de teste automatizado). Quem estudou no modo de demonstração cai na tela de importação.

## 3. Migração de banco em produção

`bun run db:neon plano --branch production` → revisar o SQL de cada migração pendente (só aditiva; nada de `DROP`) → `bun run db:neon migrar --branch production --confirmar-producao` → `bun run db:neon verificar --branch production`. Antes, a mesma migração em `dev` e `bun run test:neon` verde.

## 4. Banco fora do ar ou dado perdido

- **Fora do ar:** `/api/saude` 503. O estudo continua no aparelho (local-first); a fila sobe quando o banco volta. Ver o status do Neon e a região `aws-sa-east-1`.
- **Restauração:** o Neon guarda o histórico de **6 h** no plano atual (`history_retention_seconds = 21600`). Restaurar = criar uma branch a partir de um instante anterior ao problema (`neon branches create --name restauro-AAAAMMDD --parent production@<ISO>`), conferir os dados nela, e só então decidir (com o proprietário) trocar a conexão ou copiar o necessário. **Nunca** "resetar" a `production`. RPO = a janela do plano (6 h); RTO estimado < 1 h. Ensaio pendente (46 T-13.3).

## 5. Rotação de segredo

- `BETTER_AUTH_SECRET`: trocar invalida todas as sessões (todo mundo entra de novo). Gerar com `openssl rand -hex 32`, trocar em Production, redeploy.
- `OPENAI_API_KEY`: revogar no painel da OpenAI, criar outra, trocar na Vercel. Sem chave, a Foca IA responde pelo fallback local; o estudo segue.
- `CRON_SECRET`: trocar na Vercel; o Vercel Cron passa o novo sozinho.
- Credencial do Neon: resetar a senha da role no painel do Neon e atualizar as duas `DATABASE_URL*`.
- Segredo vazado no Git: revogar primeiro, depois limpar; nunca reescrever histórico publicado sem decisão do proprietário (regra dura 2).

## 6. Foca IA: abuso, custo ou provedor fora

- **Custo subindo:** `AI_TETO_DIARIO_USD` menor (ou `0`, que deixa a IA indisponível sem derrubar nada) → redeploy. Conferir `ai_budget` do dia.
- **Abuso de uma conta:** a cota diária e o limite de 10/min já seguram; `audit_event` tipo `ia_cota_excedida` mostra quem bate no teto (por id). Bloqueio manual = `profile.tutor_desligado = true` para aquele `user_id`, por script, registrado.
- **OpenAI fora:** nada a fazer no app: falha técnica devolve a mensagem à cota (até 3 por dia) e responde pelo fallback local.
- **Conteúdo de risco:** o protocolo de autocuidado responde sem IA (CVV 188); eventos `ia_autocuidado` no `audit_event` (sem conteúdo).

## 7. Pedido do titular (LGPD art. 18)

- **Exportar:** o próprio aluno baixa em Perfil → Seus dados (1 por hora).
- **Excluir:** o próprio aluno exclui em Perfil → Seus dados (senha; cascata no banco; e-mail de confirmação; auditoria só com o hash do id). Pedido por outro canal: confirmar a identidade pelo e-mail da conta e excluir pela mesma rotina (`auth.api.deleteUser`), por script registrado. Backups somem com a janela do Neon (6 h).

## 8. Incidente de segurança com dado pessoal

1. Conter (revogar credencial, desligar a função afetada, `AI_TETO_DIARIO_USD=0` se for a IA).
2. Preservar evidência (logs da Vercel duram 1 h: copiar já; `audit_event`).
3. Avaliar o que vazou e de quem (lembrar: público majoritariamente adolescente).
4. Comunicação: a Resolução CD/ANPD nº 15/2024 prevê comunicar à ANPD e aos titulares incidente que possa causar risco ou dano relevante em até **3 dias úteis** do conhecimento — **confirmar com orientação jurídica** antes de agir. O encarregado e o e-mail de contato ainda não existem (spec 48 D48-06).
5. Registrar no `docs/seguranca/` e corrigir a causa.

## 9. Rotina de retenção (diária)

Vercel Cron `0 7 * * *` → `GET /api/cron/retencao` com `Authorization: Bearer <CRON_SECRET>` (sem segredo, 401). Apaga contas nunca verificadas com mais de 7 dias, `audit_event` > 6 meses, `ai_usage`/`ai_budget` > 90 dias, verificações vencidas e limites parados. Conferir no log `retencao` com as contagens. Só começa a rodar depois do deploy com `CRON_SECRET` configurado.
