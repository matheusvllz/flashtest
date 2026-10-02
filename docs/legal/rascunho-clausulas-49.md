---
estado: rascunho
atualizado: 2026-10-02
canonico-de: [cláusulas de planos, pagamento, vidas, anúncios, protetores, ranking e funções pagas para revisão jurídica]
substitui: []
substituido-por: null
---

# Cláusulas novas da spec 49 — rascunho para revisão jurídica

> **RASCUNHO PARA REVISÃO JURÍDICA (B-033). Nada aqui é texto final nem está publicado.** Redigido na T-49.3.8 a partir da [spec 49](../specs/49-planos-e-monetizacao/spec.md) (§0, §5.1 a §5.6, §5.9, §9 e §10), aprovada pelo proprietário em 02/10/2026. O texto que o aluno lê hoje está nos rascunhos renderizados em `/termos` e `/privacidade` (fonte em `src/content/legal/termos.ts` e `src/content/legal/privacidade.ts`), que **não foram alterados**: as cláusulas abaixo entram nesses arquivos depois da revisão, cada uma quando a entrega que a implementa for publicada (E1: planos e pagamento; E2: vidas, anúncios e protetores; E3: ranking e funções pagas).
>
> Convenções: o **texto proposto** está escrito como o aluno vai ler (você, frases curtas). Cada bloco termina com a **origem** na spec. Valor marcado **[proposta]** foi proposto pela spec ou por este rascunho e pode mudar na revisão. **Pendente de definição** significa que o dado não existe hoje e não pode ser inventado.

## 1. Fornecedor identificado (Decreto 7.962/2013, art. 2º)

**Texto proposto:**

- Razão social: **pendente de definição** (hoje o responsável é Matheus Vellozo Freire, pessoa física; muda quando houver CNPJ).
- CNPJ: **pendente de definição**.
- Endereço físico e eletrônico: **pendente de definição**.
- Canal de atendimento (cancelamento, reembolso, dúvidas sobre cobrança): **pendente de definição**.

**Origem:** spec 49 T-49.3.8 ("controlador ainda pessoa física até o CNPJ"); [monetizacao.md](../negocio/monetizacao.md) §5.1 e §5.4. A venda real (`PAGAMENTOS_HABILITADO` em produção) não liga sem estes quatro itens preenchidos.

## 2. Planos e o que cada um inclui

**Texto proposto (substitui o item "7. Planos" dos termos atuais):**

O Foca tem três planos:

| | Free | Basic | Pro |
|---|---|---|---|
| Preço mensal | Grátis | R$ 24,90 por mês | R$ 39,90 por mês |
| Preço anual | — | R$ 209,90 por ano (equivale a R$ 17,49 por mês) | R$ 329,90 por ano (equivale a R$ 27,49 por mês) |
| Anúncios | Sim | Não | Não |
| Vidas | 5 por dia | Ilimitadas | Ilimitadas |
| Trilha, lições, nivelamento, checagem, flashcards, progresso e sequência | Sim | Sim | Sim |
| Foca IA | 3 mensagens por dia | 15 mensagens e 3 fotos por dia, até 300 mensagens por mês | 30 mensagens e 8 fotos por dia, até 500 mensagens por mês |
| Protetores de sequência ganhos | 1 a cada 7 dias de estudo, até 2 guardados | O mesmo, mais 2 por mês, até 4 guardados | O mesmo, mais 5 por mês, até 7 guardados |
| Caderno de erros, cronograma até o ENEM, estudo sem internet | Não | Sim | Sim |
| Simulado ENEM cronometrado, "explica de outro jeito", treino de redação por partes | Não | Não | Sim |
| Corretor de redação por IA | Não | Não | 10 correções por mês |

- O plano vale para a conta em que foi contratado e é ativado pelo nosso servidor depois que o pagamento é confirmado.
- Uma função marcada como "em breve" na tela de planos ainda não está disponível e não faz parte do que você contrata hoje. Quando ela for lançada, passa a valer para o seu plano sem custo extra.
- O Foca é um apoio ao estudo. Nenhum plano garante aprovação, nota ou vaga.
- Se você cancelar ou deixar de pagar, volta ao Free com todo o seu estudo guardado. As funções pagas ficam fechadas, mas os dados delas (caderno, cronograma, redações corrigidas) continuam na sua conta.

**Origem:** D49-01, D49-07, D49-10; §5.1 (tabela e "cancelar nunca apaga progresso"); registro da 49 (benefício de entrega não publicada aparece como "em breve").

## 3. Pagamento, renovação e mudança de preço

**Texto proposto:**

- O pagamento é feito na página do **Asaas**, empresa de pagamentos que processa a cobrança em nosso nome. Os dados do cartão são digitados na página do Asaas e nunca passam pelo Foca.
- **Planos mensais:** cobrados no cartão de crédito, com renovação automática a cada mês na mesma data, até você cancelar.
- **Planos anuais:** você escolhe entre
  - cartão de crédito, com renovação automática a cada ano na mesma data, até você cancelar; ou
  - Pix, pago de uma vez, **sem renovação automática**. Ao fim dos 12 meses, a conta volta ao Free, a menos que você contrate de novo.
- Antes de pagar, a tela mostra o preço, a periodicidade, a data da próxima cobrança e como cancelar. Você recebe um recibo por e-mail a cada cobrança e um aviso por e-mail **3 dias antes** de cada renovação automática.
- **Mudança de preço:** se o preço do seu plano mudar, avisamos por e-mail e no app com pelo menos **30 dias** de antecedência [proposta], antes da cobrança com o preço novo. O preço novo só vale a partir da renovação seguinte ao aviso, e você pode cancelar antes dela sem custo.
- **Troca de plano:** para passar do Basic para o Pro, você contrata o Pro. O crédito proporcional do Basic não é calculado automaticamente: o atendimento resolve, pelo canal do item 1 [proposta].

**Origem:** §6 ("Antes de pagar"), T-49.3.2, T-49.3.6 (aviso 3 dias antes), §18 (troca de plano); registro da 49 (recorrente no cartão, Pix anual avulso de 12 meses); [monetizacao.md](../negocio/monetizacao.md) §5.2 item 3 e §5.4.

## 4. Quem pode pagar

**Texto proposto:**

- Só uma pessoa **maior de 18 anos** pode pagar. Antes do pagamento, quem paga declara: "Sou maior de idade e, se o aluno for menor, sou o responsável por ele".
- O aluno pode ter 17 anos. Nesse caso, quem paga é o responsável, e o plano vai para a conta do aluno.
- Os dados de quem paga (nome, CPF, e-mail, endereço e telefone quando o Asaas pedir, e os dados do cartão) são informados ao Asaas, que os trata para fazer a cobrança e emitir a nota fiscal. O Foca não guarda o CPF nem os dados do cartão. O Foca guarda só a identificação do cliente no Asaas e a data da declaração de maioridade.

**Origem:** D49-09; §6 ("Pagador"); §9 (primeira linha); §10 ("CPF em log"); registro da 49 (DV49-03: o Asaas exige endereço e telefone quando o cliente é criado antes).

## 5. Cancelamento

**Texto proposto:**

- Você cancela pelo app, em **Conta → Assinatura → Cancelar assinatura**, em até dois toques, sem precisar falar com ninguém. Você recebe a confirmação por e-mail.
- Depois do cancelamento, não há novas cobranças. O plano continua valendo **até o fim do período já pago** e depois a conta volta ao Free.
- Cancelar não apaga nada do seu estudo.

**Origem:** RF-4; §6 ("Conta → Assinatura"); T-49.3.5; [monetizacao.md](../negocio/monetizacao.md) §5.2 item 2.

## 6. Direito de arrependimento e reembolso

**Texto proposto:**

- Você pode desistir de qualquer compra em até **7 dias** depois do pagamento e recebe o valor **integral** de volta, pelo mesmo meio de pagamento (Código de Defesa do Consumidor, art. 49; Decreto 7.962/2013, art. 5º).
- Para planos, o pedido é feito no app, em **Conta → Assinatura → Pedir reembolso**, e o reembolso é automático. Ao reembolsar, o plano termina na hora e a conta volta ao Free, sem perder o estudo.
- O reembolso automático pelo app vale **uma vez por plano a cada 90 dias**. Se você já usou essa opção nesse período, o pedido de arrependimento dentro dos 7 dias continua garantido: ele é feito pelo canal de atendimento do item 1 e tem o mesmo resultado (valor integral de volta).
- Depois dos 7 dias, não há reembolso do período já pago. O cancelamento impede a próxima renovação, e o plano vale até o fim do período.
- Para protetores de sequência, veja o item 9.

**Origem:** RF-4; §10 ("Abuso de reembolso"); `src/server/pagamentos/acoes.ts` (limite de 90 dias); [monetizacao.md](../negocio/monetizacao.md) §5.2 itens 1 e 4. **Atenção na revisão:** o limite de 90 dias só pode limitar o caminho automático, nunca o direito do art. 49 (ver Pontos para o advogado, item 6).

## 7. Falta de pagamento e contestação (chargeback)

**Texto proposto:**

- **Falta de pagamento:** se a cobrança de uma renovação não for aprovada, avisamos por e-mail. O plano continua até o fim do período já pago. Se o pagamento não for regularizado até lá, a conta volta ao Free, **sem perder nada do estudo**.
- **Contestação no cartão (chargeback):** se uma cobrança for contestada junto ao banco ou à operadora do cartão, o plano ligado a ela termina quando a contestação é aberta, e os protetores comprados nessa cobrança que ainda não foram usados são retirados. A conta volta ao Free, sem perder o estudo. Se a contestação for resolvida a favor do Foca, o plano pode ser restabelecido pelo atendimento [proposta].

**Origem:** §5.1 ("deixar de pagar nunca apaga progresso"); §10 ("Chargeback"); T-49.3.3 (eventos `PAYMENT_OVERDUE`, `PAYMENT_CHARGEBACK_REQUESTED`); registro da 49 (assinatura "atrasada" vale até o fim do período pago).

## 8. Uso justo e limites diários da Foca IA

**Texto proposto (substitui o segundo parágrafo do item "4. A Foca IA" dos termos atuais):**

- A Foca IA tem limite por dia, que depende do plano: Free 3 mensagens; Basic 15 mensagens e 3 fotos; Pro 30 mensagens e 8 fotos. O limite volta a cada dia.
- Nos planos pagos vale também um **limite de uso justo por mês**: Basic até 300 mensagens e Pro até 500 mensagens. O "explica de outro jeito" e o treino de redação por partes usam mensagens dessa mesma cota.
- O corretor de redação do Pro tem 10 correções por mês, à parte das mensagens.
- Se o custo da Foca IA nos obrigar a mudar esses limites, avisamos os assinantes antes, pelo mesmo prazo do aviso de mudança de preço (item 3).
- Quando o serviço de IA está sobrecarregado ou indisponível, a Foca IA pode responder de forma limitada ou ficar fora do ar por um tempo. Os planos pagos têm reserva própria de uso, separada do Free.

**Origem:** D49-10; §5.1; §5.2 ("Leitura honesta", item 3: cota revista com aviso prévio); §5.9 (custo de IA das funções).

## 9. Protetores de sequência avulsos

**Texto proposto:**

- O protetor cobre automaticamente um dia sem estudo, para a sua sequência não zerar. Você descobre depois que ele foi usado, sem precisar fazer nada.
- Além dos protetores que você ganha estudando (e dos bônus do Basic e do Pro), você pode comprar pacotes: **1 por R$ 5,90**, **3 por R$ 12,90** ou **7 por R$ 24,90**.
- Cada plano tem um limite de protetores guardados: Free 2, Basic 4, Pro 7. A compra que passaria desse limite é bloqueada antes do pagamento.
- Protetores comprados não expiram. Se você voltar ao Free com mais protetores do que o limite do Free, eles continuam guardados até serem usados.
- Não vendemos o conserto de uma sequência que já zerou, dias de sequência nem pontos (XP).
- **Arrependimento:** em até 7 dias depois da compra, você recebe de volta o valor dos protetores **ainda não usados**, calculado pelo preço do pacote dividido pela quantidade [proposta].
- **Conta de aluno com menos de 18 anos** (pelo ano de nascimento): no máximo **2 compras avulsas por mês**, mesmo com o responsável pagando.
- Quem paga segue o item 4 (maior de 18).

**Origem:** D49-05; §5.5; T-49.7.3. A fórmula do valor proporcional não está na spec; é proposta deste rascunho.

## 10. Vidas no plano Free

**Texto proposto:**

- No Free, você tem **5 vidas por dia**. Cada resposta errada numa lição ou na prática da trilha usa 1 vida.
- Não usam vida: tocar em "Não sei", nivelamento, checagem, simulado, redação, flashcards, a Foca IA e revisar uma questão já respondida.
- As vidas voltam a 5 à meia-noite do seu fuso horário. Elas não se acumulam de um dia para o outro.
- Quando as vidas acabam, a questão em que isso aconteceu termina normalmente, com a explicação inteira. Depois, a lição pausa e guarda o ponto. Você pode assistir a um anúncio para ganhar 1 vida (uma vez por dia, só se quiser), ver os planos, revisar flashcards ou continuar no dia seguinte.
- As vidas nunca apagam o que você estudou. Respostas dadas sem internet depois de as vidas acabarem não são desfeitas.
- Basic e Pro não têm vidas.
- O saldo de vidas é decidido pelo nosso servidor.

**Origem:** D49-03, D49-04; §5.3; R-GAM-2 item 3 revisto (§5.11).

## 11. Anúncios no plano Free

**Texto proposto:**

- O plano Free mostra anúncios. Basic e Pro não mostram.
- Os anúncios aparecem só em lugares definidos: ao sair da tela de conclusão de uma lição (ou num quadro dentro dessa tela, abaixo do resultado) e, se você escolher, no botão "Assistir e ganhar 1 vida". Nunca aparecem no meio de uma lição ou questão, na explicação de um erro, na Foca IA, no nivelamento, nas telas de sequência, de conta ou de pagamento.
- Todo anúncio tem o rótulo "Publicidade" e pode ser fechado.
- Os anúncios são fornecidos pelo **Google Ad Manager**, do Google. Para todos os alunos, os anúncios são **não personalizados**: não usamos o seu estudo, o seu perfil nem o seu histórico para escolher anúncios. Para quem tem menos de 18 anos pelo ano de nascimento, o pedido de anúncio vai marcado como de menor de idade, e categorias sensíveis ficam bloqueadas.
- **Cookies de anúncio:** na primeira vez em que um anúncio apareceria, perguntamos se você aceita cookies de anúncio, com "Aceitar" e "Recusar" do mesmo tamanho e nada marcado antes. **Recusar não bloqueia nada do estudo.** Se você recusar, os anúncios aparecem num modo sem cookies; se esse modo não funcionar, você não vê anúncio (nem o que dá vida). Você pode mudar a escolha a qualquer momento em Conta.
- Nunca enviamos ao Google o seu nome, e-mail, idade exata, desempenho, conversas com a Foca IA nem dados da sua conta.
- O Google trata os dados técnicos do seu navegador que o próprio script de anúncio lê, conforme a política de privacidade dele.

**Origem:** D49-02, D49-03b, D49-04; §5.4; §6 ("Anúncios", "Consentimento"); §9 (dados ao Google e lista do que nunca vai); §10 ("Script de terceiro").

## 12. Ranking semanal (só maiores de 18)

**Texto proposto:**

- O ranking é **opcional** e começa **desligado**. Só pode entrar quem tem 18 anos ou mais pelo ano de nascimento informado no cadastro. Quem faz 18 anos neste ano confirma o dia e o mês na entrada; guardamos só a data em que a maioridade foi confirmada, não a data de nascimento.
- O ano de nascimento fica travado depois do cadastro e só muda pelo atendimento. Se a correção indicar menos de 18 anos, você sai do ranking na hora.
- Você participa com um **apelido** que você escolhe (de 3 a 20 caracteres, sem e-mail, telefone ou link, sem termos ofensivos). Nunca aparecem o seu nome, foto, e-mail ou cidade.
- Os outros participantes do seu grupo veem **só a sua posição, o seu apelido e os seus pontos da semana**. Não há perfil, mensagem, comentário, seguir ou convite.
- Os grupos têm até 30 pessoas por semana (de segunda a domingo). Os pontos contam os dias com estudo e os blocos concluídos na semana, nunca o tempo de uso.
- Você pode **sair a qualquer momento** em Conta. O apelido some do grupo na hora.
- **Denúncia de apelido:** qualquer participante pode denunciar um apelido. O apelido denunciado fica oculto até a revisão. Um apelido que viole estas regras pode ser removido e a participação suspensa [proposta].
- Quem tem menos de 18 anos não vê o ranking e nunca aparece nele.

**Origem:** D49-06; §5.6; §10 ("Apelido ofensivo", "Menor no ranking"); §12 (`ranking_participante`).

## 13. Funções pagas e corretor de redação

**Texto proposto:**

- As funções de cada plano estão no item 2. Elas aparecem fechadas, com um cadeado, para quem não tem o plano.
- **Simulado:** mostra acertos e desempenho por área. Não é a sua nota no ENEM.
- **Corretor de redação (Pro):** dá uma **estimativa** por competência (C1 a C5, de 0 a 200 cada), com a justificativa e o trecho que motivou cada ponto. A estimativa é feita por inteligência artificial, pode errar e **não é a nota oficial** do ENEM nem substitui a correção de um professor. Se você enviar uma foto, confira a transcrição antes da correção.
- **Seus textos de redação:** o texto e a correção ficam guardados na sua conta para você acompanhar a evolução. Para corrigir, o texto é enviado à OpenAI, que fornece o modelo de IA (veja a política de privacidade). Você pode **apagar** cada redação quando quiser, e todas são apagadas com a exclusão da conta.
- "Explica de outro jeito" e treino de redação só acrescentam explicação. A explicação oficial da questão não muda.
- Ao voltar ao Free, os dados das funções pagas continuam guardados. O caderno de erros fica visível só para leitura.

**Origem:** D49-07; §5.9; §9 (linhas de redação, caderno, cronograma e simulado); §18 ("Plano pago termina com caderno cheio").

## 14. Política de privacidade: o que muda

Trechos propostos para `src/content/legal/privacidade.ts`, cada um na entrega correspondente. Base: as linhas marcadas "spec 49" em [privacidade.md](../seguranca/privacidade.md) §3.2 e §4.

- **Resumo:** "Não vendemos dados, não mostramos publicidade e não usamos seus dados para anúncios" passa a ser: "Não vendemos dados. No plano Free, mostramos anúncios não personalizados, sem usar o seu estudo ou perfil para escolhê-los."
- **Item 3 (dados), acrescentar:**
  - Pagamento: identificação de cliente no Asaas, data da declaração de maioridade, assinaturas, cobranças e compras (valor, data, estado). O CPF, o endereço e os dados do cartão de quem paga ficam só com o Asaas.
  - Vidas do dia (plano Free), guardadas por 30 dias.
  - Escolha sobre cookies de anúncio.
  - Ranking (se você entrar): apelido, data em que a maioridade foi confirmada e participação semanal.
  - Funções pagas: caderno de erros, cronograma, simulados, textos de redação e correções.
- **Item 4 (bases legais), acrescentar:** cobrança por execução de contrato e obrigação legal (fiscal); ranking e cookies de anúncio por consentimento; a base dos anúncios sem cookies **depende da revisão jurídica** (ver Pontos para o advogado, item 4).
- **Item 6 (compartilhamento), acrescentar:** Asaas (pagamentos, no Brasil) e Google Ad Manager (anúncios do plano Free).
- **Item 8 (retenção), acrescentar:** dados de cobrança pelo prazo fiscal (a confirmar com o contador); vidas por 30 dias; apelido do ranking até 30 dias depois de você sair; redações até você apagar ou excluir a conta. Na exclusão de conta com assinatura ativa, a assinatura é cancelada no Asaas antes, e guardamos só o mínimo exigido pela lei fiscal, sem vínculo com o seu estudo.
- **Item 9 (cookies):** "Não usamos cookies de publicidade nem de análise" passa a ser: "No plano Free, com o seu consentimento, o Google pode usar cookies de anúncio. Recusar não bloqueia o estudo. Não usamos cookies de análise."
- **Item 10 (direitos), acrescentar:** revogar o consentimento de cookies de anúncio e sair do ranking, em Conta; apagar redações.

## 15. Pontos para o advogado

1. **ECA Digital (Lei 15.211/2025) e Decreto 12.880/2026, arts. 9º e 10.** As vidas, a sequência com protetores e o anúncio recompensado ("assistir e ganhar 1 vida") podem ser lidos como recompensa ligada ao uso ou como pressão e urgência fabricada. O produto foi desenhado para evitar isso (sem contagem regressiva, nenhuma oferta com a sequência em risco, recompensado só por toque e uma vez por dia, ranking por dias e blocos e nunca por tempo de uso, ranking desligado por padrão). Pedimos parecer sobre se esse desenho basta e se a venda de protetores a contas de 17 anos (com responsável pagando e limite de 2 compras por mês) é compatível com o art. 18, II. Também: se a microtransação muda a classificação indicativa (Decreto, art. 12 §2º IV) e como declará-la nos termos (art. 12 §4º, pendência 5 do [README](README.md)).
2. **Resolução Conanda 163/2014.** O público é majoritariamente adolescente. Anúncio não personalizado, com marcação de menor e categorias sensíveis bloqueadas, é suficiente diante da abusividade de publicidade dirigida a criança e adolescente? Há categorias que devemos bloquear além das sensíveis do Google? O anúncio recompensado (vida em troca de assistir) é aceitável para quem tem 17 anos?
3. **Controlador conjunto com o Google.** No Google Ad Manager, o Google atua como operador, controlador independente ou controlador conjunto em relação aos dados que o script lê no navegador? Qual contrato ou termo de tratamento de dados do Google precisa ser aceito e o que a política deve dizer.
4. **Base legal dos cookies de anúncio e do modo sem cookies.** A spec propõe consentimento para cookies e legítimo interesse para o modo "limited ads" sem cookies. Confirmar se o legítimo interesse é aceitável para dado de adolescente (LGPD art. 14, melhor interesse) e se o banner proposto (dois botões de mesmo peso, nada pré-marcado, revogável) atende o Guia de Cookies da ANPD.
5. **Retenção fiscal.** Prazo de guarda dos dados de cobrança no Foca e no Asaas (normalmente 5 anos, a confirmar com o contador) e o que pode ser mantido depois da exclusão da conta "sem vínculo com o estudo".
6. **Limite do reembolso automático (1 por plano a cada 90 dias).** Confirmar que limitar só o caminho automático, com o arrependimento garantido pelo atendimento, não restringe o art. 49 do CDC nem o art. 5º do Decreto 7.962/2013 ("meio tão fácil quanto o de contratar").
7. **Anual sem reembolso depois de 7 dias.** Reter o valor do anual (cartão ou Pix) depois do prazo de arrependimento pode ser considerado abusivo? Precisa de reembolso proporcional em algum caso?
8. **Arrependimento parcial dos protetores.** Devolver só o valor dos protetores não usados (fórmula proporcional deste rascunho) atende o art. 49, dado que o protetor usado é um serviço já prestado a pedido do consumidor?
9. **Chargeback.** Encerrar o plano quando a contestação é aberta (e não quando é decidida) é aceitável? O que dizer sobre a suspensão de novas compras em caso de contestação de má-fé?
10. **Aviso de mudança de preço e de cota.** Prazo mínimo (proposta: 30 dias) e forma (e-mail e app). Se a redução do uso justo da Foca IA conta como alteração unilateral (CDC art. 51, XIII) e exige o mesmo aviso.
11. **Funções "em breve".** Vender um plano cuja tabela mostra funções ainda não lançadas, com o aviso do item 2, é suficiente para afastar publicidade enganosa (CDC art. 37)?
12. **Quem paga.** A declaração de maioridade e de responsável (sem verificação documental além do CPF no Asaas) é suficiente para o Código Civil, art. 4º, I, e para o aluno de 17 anos?
13. **Ranking com autodeclaração de idade.** Confirmar que a autodeclaração pelo ano de nascimento, travado após o cadastro, é aceitável para um ranking entre adultos (ECA Digital art. 9º §1º; orientações preliminares da ANPD de 03/2026).
14. **Corretor de redação.** O rótulo "Estimativa da Foca IA, não é a nota oficial" e a cláusula do item 13 bastam para afastar a ideia de nota oficial? Há cuidado adicional com o envio do texto à OpenAI (transferência internacional, pendência 6 do [README](README.md))?
15. **Fornecedor identificado.** Os dados do item 1 precisam existir antes da primeira venda real. Com CNPJ, o controlador também muda (pessoa física para pessoa jurídica) e o aceite dos termos precisa ser renovado.
