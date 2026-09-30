---
estado: em-execucao
atualizado: 2026-09-30
canonico-de: [estado atual, próxima tarefa]
---

# Estado do projeto — painel de retomada

> **Atualizar ao fim de cada tarefa** (checkpoint). Uma página só. Se este painel divergir de `git status`/`git log`, **pare e registre** a divergência antes de continuar ([ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md) §4).

## Iniciativa ativa

**46 — Do protótipo ao produto** (SDD reorganizado, backend real, autenticação, segurança, documentos legais). Aprovada em 29/09/2026 com as decisões do §0.
- Spec: [specs/46-producao/spec.md](specs/46-producao/spec.md)
- Registro: [specs/46-producao/registro.md](specs/46-producao/registro.md)
- Branch: `producao-46` (commits locais autorizados; **sem push** sem pedido do proprietário)

## Onde estamos

- **Concluído:** F00–F04 (commits na branch) e F05–F07 (contas, guarda de rotas, sincronização com a conta, importação do estudo local) — evidência no [registro](specs/46-producao/registro.md). Estado de validação: **validado localmente** (PGlite, e-mail em arquivo). Nada validado em ambiente integrado: sem Neon, Google e Resend.
- **Pendências dentro de F05–F07** (no registro): E2E de conta e de sincronização só no projeto `chromium` (faltam 320/1280); suíte `isolamento.test.ts` de todas as funções de servidor (T-06.6); teste de queda no meio da importação; `/conta` com perfil editável e lista de sessões (vai com a F09).
- **Produção em modo de demonstração (D-15, temporário):** sem `DATABASE_URL`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL` na Vercel, o app entra com um botão local e o progresso fica só no aparelho. Configurar as três liga as contas reais sem mudar código.
- **Próxima fase:** F08 — Foca IA em produção (sessão e política de idade no tutor, contexto montado no servidor, cotas por plano — grátis 3 mensagens/dia, Pro 20 + 5 fotos —, teto global de custo, compressão de imagem, moderação, protocolo de autocuidado, consentimento do responsável aos 17).

## Último checkpoint verde

- Branch `producao-46`, commit da F05–F07 (ver `git log -1`).
- `bunx tsc --noEmit` ✅ · `bun test tests/unit` 1311 pass / 0 fail · `bun run lint:ci` 0 erros · `bun run docs:check` ✅ · `bun run build` ✅ · `bunx playwright test` 484 passed / 0 failed / 73 skipped.

## Verificações manuais pedidas ao proprietário

1. **Codex:** abrir uma sessão nova do Codex na pasta do repo e perguntar "quais skills do projeto você enxerga e qual é a regra dura 7 do AGENTS.md?". Esperado: lista com `foca-sdd` e as demais de `.agents/skills`; resposta sobre a Foca IA só sob demanda. E: "você tem um agente spec-verifier?".
2. **Claude Code:** abrir uma sessão nova e pedir "resuma as regras duras do AGENTS.md". Esperado: as 11 regras (o `CLAUDE.md` as importa com `@AGENTS.md`).

## Bloqueios e o que depende do proprietário

| Item | Bloqueia | Dono |
|---|---|---|
| Domínio (compra mais tarde) | E-mail em produção (verificação, recuperação), URLs finais dos textos legais, tela de consentimento do Google publicada | Proprietário |
| Conta Neon + integração na Vercel | Banco em preview/produção (46 T-04.7) | Proprietário |
| Projeto no Google Cloud (OAuth) | Login com Google validado em ambiente integrado (46 T-05.7) | Proprietário |
| Chave da OpenAI | Foca IA real (sem ela, fallback local) (46 T-08.6) | Proprietário |
| E-mail de contato de privacidade e encarregado | Textos legais finais (46 §H.5) | Proprietário |
| Revisão jurídica | Publicar termos e política; confirmar a política de idade | Proprietário (contratação) |

## Decisões pendentes do proprietário

Nenhuma bloqueando a fase atual. Pendências antigas (ex.: item oficial `oficial:2023:273a7d48`, iPhone no silencioso) estão no [backlog](produto/backlog.md), seção "Decisões do proprietário".
