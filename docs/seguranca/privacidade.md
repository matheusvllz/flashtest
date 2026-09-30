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
| Conversa com a Foca IA (texto; foto não é guardada) | `tutor.messages` | Sem limite de tamanho hoje (46 T-08.2) |
| Cópias de backup brutas (com nome e e-mail) | `foca.state.backup.*` | Nunca apagadas hoje; apagadas após a importação (46 T-07.2) |

Enviado a terceiros hoje: à OpenAI, quando o aluno usa a Foca IA — primeiro nome, instituição e curso-alvo, etapa, lacunas, fatos de desempenho, a questão com gabarito e a escolha, o histórico da conversa e a foto (`src/components/TutorBubble.tsx:181-201`).

### 3.2 Depois do 46 (servidor — Neon, São Paulo)

| Categoria | Exemplos | Finalidade | Base legal proposta (a confirmar) | Retenção proposta |
|---|---|---|---|---|
| Conta | e-mail, hash da senha, vínculo Google | Acesso | Execução de contrato (art. 7º V) | Até a exclusão da conta |
| Perfil de estudo | nome, UF, etapa, curso-alvo, provas, preferências, plano | Personalizar o estudo | Execução de contrato | Até a exclusão |
| Faixa etária | ano de nascimento | Aplicar as regras de proteção | Obrigação legal / melhor interesse | Até a exclusão |
| Desempenho | respostas, conclusões, domínio estimado | Adaptar a próxima questão | Execução de contrato; melhor interesse | Até a exclusão |
| Aceites e consentimentos | versão dos termos e data; consentimento do responsável | Provar aceite e consentimento | Execução de contrato / consentimento | Até a exclusão (+ prazo legal a confirmar) |
| Uso de IA | contadores e custo (sem conteúdo) | Cota e custo | Legítimo interesse (a avaliar) | 90 dias |
| Conteúdo enviado à IA | mensagens, foto | Responder à dúvida | Execução de contrato + consentimento do responsável aos 17 | **Não guardado por nós**; OpenAI até 30 dias (monitoramento de abuso) |
| Segurança | eventos de login, IP truncado (/24 ou /48) | Prevenir abuso | Legítimo interesse | 6 meses (boa prática; o art. 15 do Marco Civil obriga pessoa jurídica) |
| Cookie de sessão | token de sessão | Manter o login | Essencial ao serviço | 30 dias com renovação |

**Não coletamos:** data completa de nascimento, escola, cidade, telefone, foto de perfil, localização, contatos. **Não há** analytics, publicidade nem venda de dados.

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
| Acesso e portabilidade | "Baixar meus dados" em `/conta` (JSON) | 46 T-09.1 |
| Correção | Edição do perfil em `/conta` | 46 T-05.5 |
| Eliminação | "Excluir conta" em `/conta` (imediata; backups expiram no prazo de restauração do Neon) | 46 T-09.2 |
| Revogação de consentimento | Em `/conta` | 46 T-11.4 |
| Informação | Política de privacidade | 46 F11 |

## 6. Checklist para quem mexe em dado pessoal

- [ ] O dado está na tabela 3.2 (ou a tabela foi atualizada nesta mesma entrega, com finalidade, base e retenção)?
- [ ] É o mínimo necessário para a finalidade?
- [ ] Não aparece em log, URL, mensagem de erro nem em `VITE_*`?
- [ ] Entra na exportação e sai na exclusão?
- [ ] Se vai para um operador novo, ele está na tabela 4?
