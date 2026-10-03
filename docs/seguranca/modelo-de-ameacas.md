---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [modelo de ameaças]
substitui: []
substituido-por: null
---

# Modelo de ameaças do Foca

> Base: 46 §F. Atualizar sempre que mudar autenticação, sessão, dados pessoais, fornecedor, Foca IA ou deploy. Controles e testes marcados "(46 T-x)" são implementados naquela tarefa; a coluna "Estado" diz o que já existe.

## 1. Ativos

1. Contas e sessões dos alunos.
2. Dados pessoais de adolescentes a partir de 17 anos (perfil, desempenho) — [privacidade.md](privacidade.md).
3. Integridade de XP, streak e conclusões (pesam mais quando houver ranking real, indicação ou pagamento).
4. Orçamento de IA e a chave da OpenAI.
5. Credenciais de banco, e-mail e OAuth.
6. Disponibilidade do estudo.
7. Reputação e conformidade (LGPD, ECA Digital).

## 2. Agentes de ameaça

Aluno curioso que edita o `localStorage` ou chama a API direto · bot que usa o endpoint de IA de graça · ataque de credenciais (senha reutilizada, força bruta) · sequestro de conta por vínculo de identidade · pessoa com acesso ao mesmo aparelho · dependência maliciosa · vazamento acidental (log, repositório, variável `VITE_*`) · erro operacional (migração, restauração).

## 3. Ameaças, controles e verificação

| # | Ameaça | Controle | Verificação | Estado |
|---|---|---|---|---|
| T1 | Força bruta ou senha reutilizada no login | Rate limit do Better Auth em banco (3 tentativas por 10 s em `/sign-in/email`) + regras por IP e por e-mail; hash scrypt; mensagem genérica | Teste de integração: a 4ª tentativa recebe 429 (46 T-05.8) | planejado |
| T2 | Enumeração de contas (cadastro, login, recuperação) | Respostas iguais; o cadastro com verificação não revela e-mail existente | Teste compara as respostas (46 T-05.8) | planejado |
| T3 | Sequestro por pré-cadastro com o e-mail da vítima + Google | Vínculo implícito só com e-mail verificado dos dois lados; sem `trustedProviders`; senha inutilizável até verificar | Teste do cenário (46 T-05.8) | planejado |
| T4 | Roubo de sessão | Cookie `HttpOnly`/`Secure`/`SameSite=Lax`; revogação; redefinição de senha revoga tudo; CSP | Testes de flags e de revogação (46 T-05.8, T-12.1) | planejado |
| T5 | CSRF em server functions | Checagem de `Origin` + SameSite; só POST muda estado | `Origin` estranho recebe 403 (46 T-04.5) | planejado |
| T6 | Acesso entre alunos (IDOR) | `userId` só da sessão; nenhuma função aceita id de usuário | Suíte de isolamento com duas contas em todas as funções (46 T-06.6) | planejado |
| T7 | Adulteração de XP, streak ou conclusão | Servidor recalcula; ledger idempotente; janelas de data; importação com teto | Testes de adulteração (46 T-06.2, T-07.1) | planejado. **Spec 50 (02/10/2026):** recompensas novas (Pérolas, missões, meta, marcos, liga) só com evidência no servidor; risco aceito: o gabarito dos pacotes é público, então um script consegue "estudar" de mentira dentro dos tetos diários, inclusive passar no "pular para cá" (até 3 testes por dia, 20 XP por capítulo, lições marcadas como puladas sem XP); flashcards não deixam tentativa (DV50-20) |
| T8 | Abuso de custo da Foca IA | Conta obrigatória (D-07), cota por plano (grátis 3/dia), teto global diário, limite de tamanho | Testes de cota e de teto (46 T-08.3) | **implementado e validado localmente (48 F2):** sessão, cota por plano com perfil travado, teto global, 10/min por aluno; concorrência validada no Neon (`tests/neon`). Teto global pode passar do limite em no máximo o custo das chamadas simultâneas |
| T9 | Injeção de prompt pelo contexto | Contexto montado no servidor; conteúdo do aluno tratado como dado; saída renderizada como texto puro | Testes com payloads (46 T-08.2) | **implementado e validado localmente (48 F2):** o cliente manda só mensagens, item, resposta crua e modo; `context`/`pedagogy` do cliente são descartados; ordem exibida só vale se for permutação dos blocos reais (`tests/unit/servidor/tutor.test.ts`) |
| T10 | XSS | Sem `dangerouslySetInnerHTML` com conteúdo de usuário ou IA; CSP com `script-src` restrito, primeiro em *report-only* | Grep + CSP sem violações (46 T-12.1) | parcial (React escapa por padrão; CSP atual só tem `frame-ancestors`, `base-uri`, `object-src`) |
| T11 | SSRF | O servidor só busca uma URL vinda do aluno no envio do lembrete (spec 50 E9): o endereço de push é aceito só em HTTPS, porta padrão, sem usuário e só nos serviços de push conhecidos (FCM, Mozilla, Apple, Windows), conferido no `zod` e de novo ao gravar; a foto é data URL validada pelo conteúdo | `tests/unit/servidor/lembretes.test.ts` (endereços recusados) | ok (02/10/2026) |
| T12 | Segredo vazado | Só no servidor; `src/server/env.ts` com zod; varredura do bundle do cliente; gitleaks | Teste de build (46 T-04.4, T-12.4) | parcial (`OPENAI_API_KEY` só no servidor hoje) |
| T13 | Dependência maliciosa | `bunfig.toml` `minimumReleaseAge` (24 h); lockfile congelado; osv-scanner; `.mcp.json` com versão fixa | Relatório do osv (46 T-12.3) | parcial (`.mcp.json` roda `npx -y omniroute` sem versão) |
| T14 | Aparelho compartilhado | Logout apaga o cache da conta; importação de estado antigo só com escolha explícita e nunca de estado vinculado a outra conta | E2E (46 T-07.2) | **aberto hoje: logout só zera `authed`; nome, e-mail e progresso ficam** (`src/lib/store.ts:1990`) |
| T15 | Log com dado pessoal | Logger sem campos de conteúdo; teste que falha se aparecer e-mail num log | Teste do logger (46 T-04.5) | ok hoje (o tutor não loga o corpo) |
| T16 | Perda de dados | Backups do Neon; ensaio de restauração; migrações revisadas | Registro do ensaio (46 T-13.3) | parcial: Neon `aws-sa-east-1` existe (retenção de 6 h no plano atual); ensaio de restauração pendente (48 T-48.3.4) |
| T17 | Função administrativa exposta | Sem painel; `/debug` e o override `foca.flags` desligados em produção; manutenção por script com credencial separada | E2E em modo produção (46 T-10.1) | **aberto hoje: `/debug` abre em produção com `?debug=1`** |
| T18 | Conteúdo nocivo para adolescentes na Foca IA | Moderação da entrada; protocolo de autolesão com recursos de apoio (CVV 188); prompt com limites; aviso de IA; opção de desligar o tutor | Testes com entradas de risco (46 T-08.5) | **implementado e validado localmente (48 F2):** sinal local + moderação simulada nos testes; protocolo CVV 188; aviso de IA; desligar no perfil. Moderação real só com a chave (48 T-48.2.8) |

## 4. Fora do modelo (por enquanto)

- Pagamento e fraude financeira (não há cobrança).
- Painel administrativo (não existe).
- Ataques de negação de serviço volumétricos: dependem da proteção da Vercel; no Hobby há 1 regra de rate limit no firewall (ADR 0001).

## 5. Testes proibidos

Nada de teste destrutivo ou de carga contra produção nem contra serviços de terceiros (OpenAI, Google, Resend, Neon). Carga só em preview, com limite e aviso ao proprietário.
