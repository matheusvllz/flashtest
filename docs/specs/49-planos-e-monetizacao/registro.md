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
