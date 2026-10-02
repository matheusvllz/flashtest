---
estado: aprovado
atualizado: 2026-10-02
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
| Pagador **(spec 49 — vale quando a entrega for publicada; E1)** | nome, CPF, e-mail, endereço e telefone (quando o Asaas exige) e cartão: **só no Asaas** (operador), nunca no banco nem no log do Foca. No Foca: id do cliente no Asaas e data da declaração de maioridade (`cliente_pagamento`, sem CPF) | Cobrança e nota fiscal | Execução de contrato; obrigação legal (fiscal) | Asaas: prazo fiscal (a confirmar com o contador, normalmente 5 anos). Foca: enquanto houver assinatura ou compra + prazo fiscal |
| Assinaturas, cobranças e compras **(spec 49 — vale quando a entrega for publicada; E1)** | `assinatura`, `cobranca`, `compra`, `evento_pagamento` (sem o corpo do evento), `protetor_credito` | Liberar o plano, reembolso, suporte | Execução de contrato | Prazo fiscal; a exclusão de conta guarda só o mínimo fiscal, sem vínculo com o estudo |
| Vidas do dia **(spec 49 — vale quando a entrega for publicada; E2)** | `vidas_dia` (perdidas, ganha por anúncio) | Regra do plano Free | Execução de contrato | 30 dias |
| Consentimento de cookies de anúncio **(spec 49 — vale quando a entrega for publicada; E2)** | escolha e data em `consent` | Provar o consentimento | Consentimento | Enquanto a conta existir |
| Dados enviados ao Google Ad Manager **(spec 49 — vale quando a entrega for publicada; E2)** | o que o script do Google lê no navegador (lista exata a confirmar no spike, 49 T-49.6.1), pedido não personalizado e marcação de menor de 18. **Nunca:** nome, e-mail, idade exata, desempenho, conversa com a Foca IA, páginas de conta, segmentação com dado do aluno | Exibir anúncio não personalizado no Free | Consentimento (cookies) / legítimo interesse sem cookies (limited ads): **a revisão jurídica decide** | Política do Google. Papel do Google (operador ou controlador conjunto): a confirmar na revisão jurídica |
| Ranking **(spec 49 — vale quando a entrega for publicada; E3)** | apelido, `maior_desde`, participação e grupo da semana (`ranking_participante`, `ranking_grupo`); só maiores de 18 | Ranking semanal opcional | Consentimento (opt-in) | Até sair do ranking + 30 dias |
| Liga da semana **(spec 50 — E8; só coleta com a função ligada em produção)** | divisão atual, pausa e suspensão social (`ranking_participante.divisao`, `pausado`, `social_suspenso_em`), divisão do grupo (`ranking_grupo.divisao`), resultado semanal (`liga_resultado`: semana, divisão, posição, pontos, movimento); pontos **derivados do estudo** (dias, blocos e contagem de respostas pontuadas), nunca tempo de uso; só maiores de 18 | Liga semanal opcional | Consentimento (opt-in) | Até sair da liga + 30 dias (resultados saem com a participação); exportado; nenhuma tabela alimenta anúncio |
| Ofensiva com amigos **(spec 50 — E8; só coleta com a função ligada em produção)** | convite (`convite_amizade`: só o SHA-256 do código, criador, validade, uso), dupla (`amizade`: as duas contas, estado, quem pediu, datas), bloqueio (`bloqueio`: quem bloqueou, quem foi bloqueado, data); o outro lado vê só apelido, dias da dupla, recorde e se estudou hoje; sem contatos, chat, foto ou nome; só maiores de 18 nos dois lados | Ofensiva em dupla opcional | Consentimento (convite e aceite mútuo) | Convite: 7 dias; dupla encerrada: 30 dias; bloqueio: enquanto as duas contas existirem; correção de idade para menor encerra tudo na hora. Exporta as próprias duplas e bloqueios, sem id nem apelido do outro |
| Denúncias sociais **(spec 50 — E8; só coleta com a função ligada em produção)** | `denuncia`: autor, alvo, contexto (liga/amigos), motivo fixo (apelido, parece menor, outro), datas; sem texto livre | Moderação (oculta o apelido; "parece menor" suspende as funções sociais até a revisão) | Legítimo interesse e proteção de menores (ECA Digital) | 90 dias depois de resolvida; o autor exporta as próprias denúncias, sem o alvo |
| Redação **(spec 49 — vale quando a entrega for publicada; E3)** | texto, tema e correção (`redacao`); o texto vai à OpenAI (já operadora) | Corretor e treino de redação | Execução de contrato | Enquanto a conta existir; apagável pelo aluno. OpenAI: até 30 dias |
| Tarefas de escrita e avaliação da estimativa **(spec 50 — vale quando a entrega for publicada; E6)** | texto enviado em cada tarefa "Escreva", com a checagem automática e, no Pro, o comentário da Foca IA (`redacao` com `tipo = 'tarefa'` e `tarefa_id`); "Ajudou"/"Achei estranha" numa estimativa, só a escolha e a data (`redacao.avaliacao`, `avaliada_em`). Rascunho só no aparelho (`rascunhosDeEscrita` no store), nunca no servidor até o envio. Texto de Free e Basic **não** sai do Foca (sem IA e sem moderação); no Pro, o trecho vai à OpenAI (já operadora) para o comentário | Treino de redação para todos; comentário da IA no Pro; qualidade do corretor | Execução de contrato | Até o aluno apagar (o texto some, a contagem fica) ou excluir a conta; exportado; o rascunho some ao enviar ou ao sair da conta no aparelho. OpenAI: até 30 dias |
| Funções pagas **(spec 49 — vale quando a entrega for publicada; E3)** | caderno de erros, cronograma, simulados (`caderno_item`, `cronograma`, `simulado`) | Funções do Basic e do Pro | Execução de contrato | Enquanto a conta existir; preservados ao voltar ao Free |
| Simulados e reportes de questão **(spec 50 — F10)** | `simulado` (tipo, rótulo, questões, respostas, marcadas, tempo, resultado por área e habilidade; o mini da semana vale para todos os planos) e `questao_reporte` (questão, motivo fixo — texto, imagem, gabarito, outro —, data; sem texto livre). A retirada da questão (`questao_retirada`) não guarda quem reportou | Simulado e qualidade do banco de questões | Execução de contrato | Simulados: enquanto a conta existir. Reportes: 90 dias. Os dois são exportados e saem com a exclusão da conta |
| Teste "pular para cá" **(spec 50 — E7)** | `pulo_tentativa` (capítulo, dia, questões, lições do caminho, resultado e acertos); as respostas entram em `attempt` com fonte `pulo` | Pular para o próximo capítulo e agendar revisão do que foi pulado | Execução de contrato | Enquanto a conta existir; exportado; sai com a exclusão da conta |
| Pérolas, loja e cosméticos **(spec 50 — E3)** | livro de Pérolas (`perola_movimento`: quantidade, motivo, dia), itens obtidos (`inventario`), roupa e tema em uso (`cosmetico_equipado`); **derivados do estudo**, sem dado novo sobre a pessoa | Economia do app (nunca vendida por dinheiro) | Execução de contrato | Enquanto a conta existir; exportado; some com a conta |
| Combo do dia **(spec 50 — E1/E3)** | `combo_dia` (atual, maior, hora da última resposta) e o combo em cada tentativa (`attempt.combo`, `tentativa`, `assistida`, `pontuada`) | Recompensas do combo e lição perfeita | Execução de contrato | `combo_dia`: 30 dias; tentativas: como as demais |
| Lembrete diário por push **(spec 50 — E9; só coleta com a função ligada em produção)** | `push_assinatura`: endereço de push do aparelho (`endpoint`) e as chaves de criptografia do navegador (`p256dh`, `auth`), janela escolhida, dia do último lembrete, lembretes seguidos sem estudo, pausa e falhas de entrega. O endereço é identificador técnico do aparelho: nunca em log, nunca na exportação. A notificação não leva nome nem dado do aluno; passa pelo serviço de push do navegador (Google, Mozilla, Apple ou Microsoft) | Lembrete opcional, desligado por padrão, 1 por dia, só se o aluno ainda não estudou | Consentimento (opt-in no Perfil + permissão do navegador) | Até desligar, sair da conta no aparelho, o serviço de push recusar o endereço ou 30 dias sem poder entregar (pausado ou com falha); some com a conta. Exportado só "ligado, janela, pausa, último lembrete" |
| Ofensiva: meta e marcos **(spec 50 — E3)** | `meta_ofensiva` (alvo, início, cumprida/encerrada), `marco_ofensiva` (dias e data) | Meta escolhida pelo aluno e baú de marco | Execução de contrato | Enquanto a conta existir; exportado |
| Missões, desafio e conquistas **(spec 50 — E4)** | `missao_dia` (missão, progresso), `desafio_mes`, `conquista` | Metas de médio prazo | Execução de contrato | Missões: 90 dias; desafio e conquistas: enquanto a conta existir; exportados |

**Não coletamos:** data completa de nascimento, escola, cidade, telefone, foto de perfil, localização, contatos. **Não há** analytics, publicidade nem venda de dados. **Revista pela 49 (aprovada em 02/10/2026):** a publicidade não personalizada do plano Free entra com a entrega **E2** da 49 e só vale quando ela for publicada; analytics de terceiros e venda de dados continuam fora. As demais linhas marcadas "spec 49" acima (pagador só no Asaas, ranking, redações) seguem a mesma regra ([spec 49](../specs/49-planos-e-monetizacao/spec.md) §9; cláusulas em [rascunho-clausulas-49.md](../legal/rascunho-clausulas-49.md)). O telefone e o endereço do pagador, quando pedidos, são coletados pelo Asaas, não pelo Foca.

## 4. Operadores e transferência internacional

| Operador | Função | Região | Transferência internacional |
|---|---|---|---|
| Vercel | Hospedagem e funções | Função em `gru1` (São Paulo); plataforma nos EUA | Sim (plataforma, logs) |
| Neon | Banco de dados | `aws-sa-east-1` (São Paulo) | Não para os dados; a empresa é dos EUA |
| Resend | E-mail transacional | `sa-east-1` | A confirmar |
| Google | Login | Global | Sim |
| OpenAI | Foca IA | EUA (sem região na América do Sul) | Sim |
| YouTube | Vídeos incorporados | Global | Sim (política própria do Google) |
| Asaas **(spec 49 — vale quando a entrega for publicada; E1)** | Pagamentos (cliente, cobrança, nota fiscal) | Brasil | A confirmar |
| Google Ad Manager **(spec 49 — vale quando a entrega for publicada; E2)** | Anúncios não personalizados no Free | Global | Sim; papel do Google (operador ou controlador conjunto) a confirmar na revisão jurídica |

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
