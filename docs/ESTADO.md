---
estado: em-execucao
atualizado: 2026-09-30
canonico-de: [estado atual, próxima tarefa]
---

# Estado do projeto — painel de retomada

> **Atualizar ao fim de cada tarefa** (checkpoint). Uma página só. Se este painel divergir de `git status`/`git log`, **pare e registre** a divergência antes de continuar ([ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md) §4).

## Iniciativa ativa

**48 — Backend integrado ao Neon, Foca IA em produção e funções que hoje são cosméticas** (vinculada à 46). Aprovada em 30/09/2026 pelo proprietário (escopo do pedido inteiro; sem commit, push nem deploy).
- Spec: [specs/48-integracao-e-evolucao/spec.md](specs/48-integracao-e-evolucao/spec.md) — decisões D48-01…D48-16, tarefas T-48.0.1…T-48.10.1
- Registro: [specs/48-integracao-e-evolucao/registro.md](specs/48-integracao-e-evolucao/registro.md)
- **Implementado e validado localmente (30/09, working tree, sem commit):** F0 (Neon: CLI, skills, MCP, branch `dev`, ADR 0007, ambiente que não derruba o app, migração e `test:neon`, domínio/URLs), F1 (isolamento de todas as funções, importação interrompida, conta/sync em 320 e 1280), **F2 Foca IA completa** (B-102, sessão/idade/consentimento, contexto no servidor, cotas e teto, foto, moderação e autocuidado, desligar no perfil, estados), F3 (exportar, excluir conta, retenção, runbooks), F4 (tópicos e plano funcionais, diagnóstico honesto), F5 (resultado da checagem, resultado visual do nivelamento), F6 (sequência com foguinho e proteção), F7 (telas secundárias no desktop), F8 (retomada, laço de navegação DV48-04, estados de salvamento), F9 (medição e uma correção de desempenho).
- **Validado em ambiente integrado:** Neon `dev` (branch temporária: 7 testes, inclusive concorrência de cota e de recompensa entre conexões reais) e esquema aplicado na `production` (1/1, 17 tabelas, sem dados).
- **Publicado:** nada desta iniciativa (sem commit, push nem deploy).
- **Produção hoje:** `/api/saude`, `/api/auth/ok` e `/trilha` respondem **500** (variável vazia ou inválida na Vercel derruba o `env()`; DV48-01). Corrigido no código (D48-08), **não publicado**.
- **Próximo passo:** decisão do proprietário sobre commit/deploy da correção D48-08; depois, os bloqueios abaixo (Resend ou Google para ligar as contas; chave da OpenAI para a T-48.2.8).

### Iniciativa base

**46 — Do protótipo ao produto** (SDD reorganizado, backend real, autenticação, segurança, documentos legais). Aprovada em 29/09/2026 com as decisões do §0.
- Spec: [specs/46-producao/spec.md](specs/46-producao/spec.md)
- Registro: [specs/46-producao/registro.md](specs/46-producao/registro.md)
- Branch: `producao-46` (commits locais autorizados; **sem push** sem pedido do proprietário)

## Onde estamos

- **Concluído:** F00–F04 (commits na branch) e F05–F07 (contas, guarda de rotas, sincronização com a conta, importação do estudo local) — evidência no [registro](specs/46-producao/registro.md). Estado de validação: **validado localmente** (PGlite, e-mail em arquivo). Nada validado em ambiente integrado: sem Neon, Google e Resend.
- **Pendências dentro de F05–F07:** resolvidas na 48 F1 (E2E em 320/1280, `isolamento.test.ts`, importação interrompida). Fica: `/conta` com perfil editável e lista de sessões.
- **Produção em modo de demonstração (D-15, temporário):** sem `DATABASE_URL`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL` na Vercel, o app entra com um botão local e o progresso fica só no aparelho. Configurar as três liga as contas reais sem mudar código.
- **Onboarding sem conta (D-16):** quiz, nivelamento e diagnóstico são abertos; a conta é pedida na hora de começar a estudar. Conta de teste **local**: `bun run conta:teste` (com `bun run dev` rodando) → `teste@foca.dev` / `foca-teste-123`.
- **Próxima fase:** F08 — Foca IA em produção (sessão e política de idade no tutor, contexto montado no servidor, cotas por plano — grátis 3 mensagens/dia, Pro 20 + 5 fotos —, teto global de custo, compressão de imagem, moderação, protocolo de autocuidado, consentimento do responsável aos 17).
- **Preparação solicitada em 30/09:** recomendar melhorias e, após a seleção do proprietário, preparar um prompt para o Opus planejar pelo SDD e executar. Prioridade solicitada para esse plano: conectar o projeto Neon `billowing-bread-71576526` e integrar o backend existente. Resolver no plano a diferença entre `auth: true` (Neon Auth gerenciado) e o Better Auth da ADR 0005. Nenhum comando Neon executado nesta preparação; funcionalidades adicionais aguardam seleção.
- **Copy (D-19):** "60 segundos"/"60s" permanece como bordão. Spec, B-051 e guias atualizados; nenhuma string do app alterada.
- **Landing (D-20):** todos os CTAs de começar levam ao quiz, mesmo com flags antigas salvas no aparelho; "Entrar" continua separado. Fluxo até cadastro no final validado localmente. Alterações D-19/D-20 presentes no working tree, sem commit nem publicação.

## Último checkpoint verde

- **48 completa (30/09, working tree, sem commit):** tipos ✅ · unitários **1381 pass / 0 fail** · lint 0 erros / 17 avisos · build e build `vercel` ✅ · docs:check ✅ · **E2E completo 540 passed / 0 failed / 73 skipped** · `test:neon` **7 pass**. Validado localmente (F1–F9) e em ambiente integrado (Neon). Nada publicado.
- **Conta de teste local nova:** `aluno.teste@foca.dev` / `foca-aluno-2026` (com `bun run dev`; criar outra: `CONTA_EMAIL=… CONTA_SENHA=… bun run conta:teste`). Em produção não há login possível até o deploy da correção D48-08 (500 em todas as rotas de autenticação).

- **Correção D-20 (working tree, 30/09):** tipos ✅ · unitários **1312 pass / 0 fail** · build ✅ · lint **0 erros / 17 avisos** · docs:check ✅ · E2E direcionados de landing, demo, conta, onboarding e nivelamento **87 passed / 0 failed / 1 skipped**. Entrada testada em 320/390/1280, incluindo flags legadas. Revisão `spec-verifier` sem divergência D-20. Validado localmente; não publicado. Esta rodada não substitui a suíte E2E completa abaixo.

- Última suíte completa verde registrada: D-15 (`fd1d4da`), branch `producao-46`: tipos ✅ · unitários 1312 pass / 0 fail · lint 0 erros · build ✅ · E2E 484 passed / 0 failed / 73 skipped. Evidências no registro; não reexecutadas na preparação documental.
- HEAD conferido em 30/09: `2b0584b` (D-16). Nessa revisão: tipos, unitários, lint e build verdes; E2E completo 483 passed / 3 failed / 73 skipped; teste de marca corrigido e 8/8, motion 22/22 em execução isolada. Não há nova execução completa verde registrada após D-16.

## Verificações manuais pedidas ao proprietário

1. **Codex:** abrir uma sessão nova do Codex na pasta do repo e perguntar "quais skills do projeto você enxerga e qual é a regra dura 7 do AGENTS.md?". Esperado: lista com `foca-sdd` e as demais de `.agents/skills`; resposta sobre a Foca IA só sob demanda. E: "você tem um agente spec-verifier?".
2. **Claude Code:** abrir uma sessão nova e pedir "resuma as regras duras do AGENTS.md". Esperado: as 11 regras (o `CLAUDE.md` as importa com `@AGENTS.md`).

## Bloqueios e o que depende do proprietário

| Item | Bloqueia | Dono |
|---|---|---|
| ~~Domínio~~ | **Resolvido em 30/09:** `focaedu.com` registrado e no ar (46 D-10 mantida como histórico) | — |
| Domínio primário na Vercel é o `www` (apex responde 308) | Usar `https://focaedu.com` como URL de auth e canonical sem redirecionamento (48 D48-05) | Proprietário (painel da Vercel) |
| Variáveis da Vercel: corrigir a vazia/inválida, ou autorizar o deploy da correção | Tirar a produção do 500 (48 DV48-01) | Proprietário |
| `focaedu.com` verificado na Resend (DNS na Cloudflare) | E-mail em produção: verificação, recuperação (48 T-48.0.8) | Proprietário |
| Caixas de correio (contato, privacidade, encarregado) | Textos legais finais; nenhum endereço publicado antes (48 D48-06) | Proprietário |
| Variáveis do Neon na Vercel e integração de previews | Contas reais em produção — só com um método de acesso pronto (48 D48-07, T-48.0.7) | Proprietário |
| Projeto no Google Cloud (OAuth) | Login com Google em produção (46 T-05.7, 48 T-48.0.8) | Proprietário |
| Chave da OpenAI | Foca IA real (sem ela, fallback local) (46 T-08.6, 48 T-48.2.8) | Proprietário |
| E-mail de contato de privacidade e encarregado | Textos legais finais (46 §H.5) | Proprietário |
| Revisão jurídica | Publicar termos e política; confirmar a política de idade | Proprietário (contratação) |

## Decisões pendentes do proprietário

Nenhuma bloqueando a fase atual. Pendências antigas (ex.: item oficial `oficial:2023:273a7d48`, iPhone no silencioso) estão no [backlog](produto/backlog.md), seção "Decisões do proprietário".
