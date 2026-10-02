---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [inventário de dados pessoais, finalidades, retenção, menores]
substitui: []
substituido-por: null
---

# Privacidade — inventário de dados, finalidades e retenção

> **Leitura obrigatória para qualquer tarefa que colete, exiba, registre, exporte ou apague dado pessoal.** Base: 46 §E.2, §H. Versão 1 (antes do backend): descreve o que existe hoje e o que o 46 vai criar. A versão 2 é refeita sobre o código implementado (46 T-11.1). **As bases legais são propostas e precisam de confirmação jurídica.** Nenhum dado novo entra sem linha aqui.

## 1. Controlador e contato

| Item | Valor | Estado |
|---|---|---|
| Controlador | Matheus Vellozo Freire (pessoa física) | Definido pelo proprietário em 29/09/2026 |
| Contato de privacidade (e-mail) | — | **Pendente** |
| Encarregado (Res. CD/ANPD 18/2024) | — | **Pendente.** Dados de adolescentes tornam o tratamento de alto risco (Res. 2/2022 art. 4), o que afasta a dispensa de agente de pequeno porte |

## 2. Público e idade

- Conta a partir de **17 anos** (`MIN_ACCOUNT_AGE`), idade autodeclarada pelo ano de nascimento ([ADR 0006](../decisoes/0006-conta-obrigatoria-e-idade.md)). Estudar exige conta; quem tem menos de 17 não usa o app.
- Foca IA: 18+ direto; aos 17, só com consentimento do responsável registrado (contrato da OpenAI §3.3(c)).
- ECA Digital (Lei 15.211/2025) e LGPD art. 14: melhor interesse, proteção máxima por padrão, sem perfilamento para publicidade. Avaliação completa em 46 T-11.2.

## 3. Inventário

### 3.1 Hoje (só no aparelho, `localStorage` `foca.state.v3`)

| Dado | Onde | Observação |
|---|---|---|
| Primeiro nome, UF, etapa escolar, instituição e curso-alvo, provas e datas | `prefs` | Vindos do onboarding (`/quiz`) |
| E-mail | `prefs.email` | Só do login simulado; sai do cliente no 46 |
| Progresso, respostas, domínio estimado, XP, streak | `progress`, `learning` | — |
| Conversa com a Foca IA (texto; foto não é guardada) | `tutor.messages` | As 40 mensagens mais recentes (48 D48-09); não sincronizada com a conta |
| Cópias de backup brutas (com nome e e-mail) | `foca.state.backup.*` | Nunca apagadas hoje; apagadas após a importação (46 T-07.2) |

Enviado a terceiros: à OpenAI, só quando o aluno envia uma mensagem à Foca IA (48 F2, montado no servidor em `src/server/tutor/contexto.ts`): instituição e curso-alvo, etapa, contagens de desempenho dos últimos 30 dias, sequência, o contexto pedagógico da habilidade (números do motor), a questão com gabarito e a escolha, as últimas 20 mensagens e a foto comprimida. **O primeiro nome não vai** (46 D-18). A mensagem e a foto também passam pela moderação da OpenAI (`omni-moderation-latest`). Em modo de demonstração ou sem chave, nada é enviado.

### 3.2 Depois do 46 (servidor — Neon, São Paulo)

| Categoria | Exemplos | Finalidade | Base legal proposta (a confirmar) | Retenção proposta |
|---|---|---|---|---|
| Conta | e-mail, hash da senha, vínculo Google | Acesso | Execução de contrato (art. 7º V) | Até a exclusão da conta |
| Perfil de estudo | nome, UF, etapa, curso-alvo, provas, preferências, plano | Personalizar o estudo | Execução de contrato | Até a exclusão |
| Faixa etária | ano de nascimento | Aplicar as regras de proteção | Obrigação legal / melhor interesse | Até a exclusão |
| Desempenho | respostas, conclusões, domínio estimado | Adaptar a próxima questão | Execução de contrato; melhor interesse | Até a exclusão |
| Aceites e consentimentos | versão dos termos e data; consentimento do responsável | Provar aceite e consentimento | Execução de contrato / consentimento | Até a exclusão (+ prazo legal a confirmar) |
| Uso de IA | contadores e custo (sem conteúdo): `ai_usage`, `ai_budget`; eventos `ia_cota_excedida` e `ia_autocuidado` (sem conteúdo) em `audit_event` | Cota, custo e segurança | Legítimo interesse (a avaliar) | 90 dias (`audit_event`: 6 meses) |
| Dia coberto por proteção da sequência | `progress.diaProtegido` (aparelho) e agregado da sincronização; **derivado** dos dias de estudo, não é coleta nova | Mostrar a regra da sequência ao aluno (48 D48-14) | Execução de contrato | Recalculado; some com a conta |
| Preferência da Foca IA | `profile.tutor_desligado` | Respeitar a escolha de não usar a IA | Execução de contrato | Até a exclusão |
| Conteúdo enviado à IA | mensagens, foto | Responder à dúvida | Execução de contrato + consentimento do responsável aos 17 | **Não guardado por nós**; OpenAI até 30 dias (monitoramento de abuso) |
| Segurança | eventos de login, IP truncado (/24 ou /48) | Prevenir abuso | Legítimo interesse | 6 meses (boa prática; o art. 15 do Marco Civil obriga pessoa jurídica) |
| Cookie de sessão | token de sessão | Manter o login | Essencial ao serviço | 30 dias com renovação |

**Não coletamos:** data completa de nascimento, escola, cidade, telefone, foto de perfil, localização, contatos. **Não há** analytics, publicidade nem venda de dados. **Revista pela 49 (aprovada em 02/10/2026):** publicidade não personalizada no plano Free, CPF do pagador só no Asaas, apelido do ranking e redações entram como linhas novas na T-49.3.8, quando a entrega correspondente for publicada ([spec 49](../specs/49-planos-e-monetizacao/spec.md) §9).

## 4. Operadores e transferência internacional

| Operador | Função | Região | Transferência internacional |
|---|---|---|---|
| Vercel | Hospedagem e funções | Função em `gru1` (São Paulo); plataforma nos EUA | Sim (plataforma, logs) |
| Neon | Banco de dados | `aws-sa-east-1` (São Paulo) | Não para os dados; a empresa é dos EUA |
| Resend | E-mail transacional | `sa-east-1` | A confirmar |
| Google | Login | Global | Sim |
| OpenAI | Foca IA | EUA (sem região na América do Sul) | Sim |
| YouTube | Vídeos incorporados | Global | Sim (política própria do Google) |

Cláusulas-padrão da ANPD (Res. 19/2024) com cada operador: **não verificado**; pendência jurídica (46 §H.5).

## 5. Direitos do titular (como o sistema atende)

| Direito (LGPD art. 18) | Como | Tarefa |
|---|---|---|
| Acesso e portabilidade | "Baixar meus dados" em Perfil → Seus dados (JSON; 1 por hora) — **implementado** | 46 T-09.1; 48 T-48.3.1 |
| Correção | Edição do perfil em `/conta` | 46 T-05.5 |
| Eliminação | "Excluir conta" em Perfil → Seus dados (senha; imediata, em cascata; e-mail de confirmação; auditoria só com o hash do id; o histórico do Neon expira em 6 h no plano atual) — **implementado** | 46 T-09.2; 48 T-48.3.2 |
| Retenção automática | Rotina diária (Vercel Cron, `/api/cron/retencao`): contas nunca verificadas em 7 dias, `audit_event` em 6 meses, uso de IA em 90 dias — **implementado, roda após o deploy com `CRON_SECRET`** | 46 T-09.3; 48 T-48.3.3 |
| Revogação de consentimento | Em `/conta` (pendente: fluxo do responsável) | 46 T-11.4 |
| Oposição ao uso da IA | "Foca IA ligada/desligada" na seção Conta | 48 T-48.2.6 |
| Informação | Política de privacidade | 46 F11 |

## 6. Checklist para quem mexe em dado pessoal

- [ ] O dado está na tabela 3.2 (ou a tabela foi atualizada nesta mesma entrega, com finalidade, base e retenção)?
- [ ] É o mínimo necessário para a finalidade?
- [ ] Não aparece em log, URL, mensagem de erro nem em `VITE_*`?
- [ ] Entra na exportação e sai na exclusão?
- [ ] Se vai para um operador novo, ele está na tabela 4?
