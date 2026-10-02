---
estado: em-execucao
atualizado: 2026-10-02
canonico-de: [estado atual, próxima tarefa]
---

# Estado do projeto — painel de retomada

> **Atualizar ao fim de cada tarefa** (checkpoint). Uma página só. Se este painel divergir de `git status`/`git log`, **pare e registre** a divergência antes de continuar ([ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md) §4).

## Iniciativa ativa

**49 — Planos, assinaturas, vidas, anúncios, ranking 18+, funções pagas e correções de entrada.** **Aprovada em 02/10/2026** pelo proprietário ("aprovo a spec"), com todas as propostas como escritas.
- Spec: [specs/49-planos-e-monetizacao/spec.md](specs/49-planos-e-monetizacao/spec.md) — decisões D49-01…D49-16, entregas E1 → E2 → E3, tarefas T-49.0.1…T-49.10.1
- Tutorial do proprietário: [specs/49-planos-e-monetizacao/preparacao.md](specs/49-planos-e-monetizacao/preparacao.md)
- Registro: [specs/49-planos-e-monetizacao/registro.md](specs/49-planos-e-monetizacao/registro.md)
- **Feito:** T-49.0.1 (aprovação) e T-49.0.2 (notas nas regras revistas; o texto novo entra por entrega publicada). Preparação: Asaas sandbox e credenciais em `.env.asaas-sandbox`, bypass da Vercel, webhook do Asaas e URI do Google para o preview, `ads.txt` publicado (`df46bc6`).
- **Feito (branch `spec-49`, preview `https://foca-git-spec-49-foca3.vercel.app`; nada disso está na `main`, exceto o que foi publicado em `9337ce4`):**
  - **E1:** preview (T-49.0.3), diagnóstico da rolagem (T-49.1.1), perfil com dados da conta, "Criar conta" e Google novo pelo quiz, nivelamento de 30 (T-49.1.3, T-49.1.4, T-49.4.1, T-49.4.2), catálogo (T-49.2.1); F2 (plano no servidor, migração 0001, cota da Foca IA por plano) e F3 (checkout do Asaas sandbox, webhook idempotente, assinatura, cancelar, reembolso, tela de planos).
  - **E2:** vidas do Free, anúncios não personalizados com consentimento e provedor falso, protetores por plano e avulsos (F5–F7; migração 0002).
  - **E3:** ranking 18+ (F8) e funções pagas (F9): caderno de erros, cronograma, estudo sem internet, explica de outro jeito, corretor de redação (desligado até a rubrica: DV49-08) e treino por partes (migração 0003). **Simulado parado** por falta de itens revisados (DV49-09, B-168).
  - Migrações 0001–0003 aplicadas **só** na branch `dev` do Neon.
- **Bloqueios do proprietário:** T-49.1.2 (correção da rolagem) espera o teste no Instagram (iPhone e Android, link `https://www.focaedu.com/?diagnostico-rolagem=1`); pagamento de teste na página do Asaas (reCAPTCHA) e chave Pix no sandbox (tutorial 1.4); AdSense em análise (o Ad Manager só abre depois); chave da OpenAI; revisão jurídica das cláusulas (`docs/legal/rascunho-clausulas-49.md`); rubrica do corretor (B-169); CNPJ e Vercel Pro antes de vender de verdade; e-mail de suporte (passo 7); publicar o login com Google (passo 4.1).
- **Publicado em 02/10 (`main` = `9c96afa`):** E1–E3, com as migrações 0001–0003 aplicadas em produção antes do deploy. Em produção as funções novas estão **desligadas por configuração** (nenhuma variável de venda, vidas, anúncios, ranking ou corretor): ninguém assina e nada novo é coletado.
- **Próximo passo:** ligar a venda e as funções em produção, uma por vez e só com pedido do proprietário, depois dos bloqueios abaixo; trocar os textos legais com a revisão jurídica; T-49.1.2 quando chegarem os diagnósticos da rolagem.
- **Produção:** `origin/main` = `ac9bf85` (02/10; o código publicado é o de `9c96afa`, o último commit é só documentação): spec 49 E1–E3 com as funções novas desligadas por configuração. (Trechos acima com "nada disso está na `main`" e "`main` = `9c96afa`" são de momentos anteriores: DV50-01.) Contas com Google e e-mail; Foca IA em fallback local.

### Em execução (nova)

**50 — Lição viva, Pérolas, ofensiva, missões, Foca animada, simulado, redação por tarefas, social 18+, lembretes, navegação e som no celular.** **Aprovada em 02/10/2026** ("Aprovo a Spec"; "Pode fazer todas as entregas"), com §21 respondido (imagens: risco aceito; rótulo "Foca IA"; vestibulares: só INEP por enquanto). Em execução na branch local `spec-50` (sem commit, push ou deploy sem pedido).
- Spec: [specs/50-gamificacao-e-pratica/spec.md](specs/50-gamificacao-e-pratica/spec.md) — decisões D50-01…16, entregas E1–E9, matriz de cobertura dos 31 itens (§22), decisões que ainda dependem do dono (§21)
- Tarefas: [specs/50-gamificacao-e-pratica/tarefas.md](specs/50-gamificacao-e-pratica/tarefas.md) · Registro: [specs/50-gamificacao-e-pratica/registro.md](specs/50-gamificacao-e-pratica/registro.md) (divergências DV50-01…10)
- **Próximo passo:** T-50.0.2…T-50.0.5 e a E1 (som e lição), na ordem de `tarefas.md`.

### Iniciativa anterior

**48 — Backend integrado ao Neon, Foca IA em produção e funções que eram cosméticas** — publicada (registro: [specs/48-integracao-e-evolucao/registro.md](specs/48-integracao-e-evolucao/registro.md)). Pendentes: chave da OpenAI (T-48.2.8) com o teto global redimensionado (agora pela 49 D49-10), previews com banco próprio (T-48.0.7, agora pela T-49.0.3).

### Iniciativa base

**46 — Do protótipo ao produto** (SDD reorganizado, backend real, autenticação, segurança, documentos legais). Aprovada em 29/09/2026 com as decisões do §0.
- Spec: [specs/46-producao/spec.md](specs/46-producao/spec.md)
- Registro: [specs/46-producao/registro.md](specs/46-producao/registro.md)
- Branch: `producao-46` (enviada para a `main` em 01/10 com autorização; a branch em si não foi enviada ao `origin`)

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

- **49 E1–E3 (02/10, branch `spec-49`):** tipos ✅ · unitários **1471 pass / 0 fail** · lint 0 erros / 17 avisos · build e build `vercel` ✅ · docs:check ✅ · `test:neon` 7 pass (branch `dev`) · **E2E completo 561 passed / 0 failed / 82 skipped** · `spec-verifier` rodado e achados corrigidos (registro da 49). Validado localmente; não publicado.

- **Publicação da 48 (01/10, `382a359`):** tipos ✅ · unitários ✅ · lint 0 erros · build e build `vercel` ✅ · E2E completo **542 passed / 1 instável / 73 skipped** · produção: `/api/saude` banco ok, rotas 200/307/401 esperadas, Google redireciona com o `client_id` e o retorno certos. CI do GitHub falha no `docs:check` por caminhos gerados de `public/content/` (preexistente, não bloqueia a Vercel).
- **48 completa (30/09, working tree, sem commit):** tipos ✅ · unitários **1381 pass / 0 fail** · lint 0 erros / 17 avisos · build e build `vercel` ✅ · docs:check ✅ · **E2E completo 540 passed / 0 failed / 73 skipped** · `test:neon` **7 pass**. Validado localmente (F1–F9) e em ambiente integrado (Neon). Nada publicado.
- **Conta de teste local nova:** `aluno.teste@foca.dev` / `foca-aluno-2026` (com `bun run dev`; criar outra: `CONTA_EMAIL=… CONTA_SENHA=… bun run conta:teste`). Em produção, nenhuma conta de teste é criada: o acesso é pelo Google.

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
| ~~`focaedu.com` verificado na Resend~~ | **Resolvido em 01/10:** domínio verificado e variáveis na Vercel; liga no próximo deploy | — |
| Caixas de correio (contato, privacidade, encarregado) | Textos legais finais; nenhum endereço publicado antes (48 D48-06) | Proprietário |
| Publicar a tela de consentimento do Google (Google Auth Platform → Público → Publicar app) | Login com Google para qualquer aluno; hoje só usuários de teste (46 T-05.7, 48 T-48.0.8) | Proprietário |
| Rotacionar o segredo do cliente Google e a chave da Resend (os dois foram colados no chat) | Higiene de segredo; depois atualizar `GOOGLE_CLIENT_SECRET` e `RESEND_API_KEY` na Vercel | Proprietário + agente |
| Integração de previews da Vercel com branches do Neon | Previews com banco próprio (48 T-48.0.7) | Proprietário |
| CI do GitHub: `docs:check` acusa caminhos gerados de `public/content/` | CI verde (não bloqueia a Vercel) | Agente, com pedido |
| Chave da OpenAI | Foca IA real (sem ela, fallback local) (46 T-08.6, 48 T-48.2.8) | Proprietário |
| E-mail de contato de privacidade e encarregado | Textos legais finais (46 §H.5) | Proprietário |
| Revisão jurídica | Publicar termos e política; confirmar a política de idade | Proprietário (contratação) |

## Decisões pendentes do proprietário

Nenhuma bloqueando a fase atual. Pendências antigas (ex.: item oficial `oficial:2023:273a7d48`, iPhone no silencioso) estão no [backlog](produto/backlog.md), seção "Decisões do proprietário".
