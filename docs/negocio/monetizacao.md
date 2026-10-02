---
estado: aguardando-aprovacao
atualizado: 2026-10-01
canonico-de: [planos, preços, pagamento e monetização (proposta)]
substitui: []
substituido-por: null
---

# Monetização — planos, preços, pagamento e o que falta para vender

> **01/10/2026:** as decisões do proprietário sobre planos (Free com anúncios e vidas, Basic R$ 24,90, Pro R$ 39,90), anúncios, protetores avulsos e ranking 18+ estão na [spec 49](../specs/49-planos-e-monetizacao/spec.md) §0, que **substitui** os §2.2, §2.5, §2.6 (divisão por plano) e as decisões 1, 5 e 6 do §8 deste documento. A pesquisa (concorrência, gateways, fiscal, consumidor, menores, lojas) continua valendo como base.

> **Documento de decisão. Não autoriza implementar nada.** Cobrança real, anúncios, SDK novo e dependência nova só entram com uma spec aprovada (proposta: `docs/specs/49-pagamentos/`, a criar). As regras de negócio que já valem estão em [../produto/estrategia.md](../produto/estrategia.md) (§11), [../produto/regras.md](../produto/regras.md) e [../produto/lancamento.md](../produto/lancamento.md). Este arquivo junta pesquisa de mercado e um guia prático. Os números externos foram consultados em **01/10/2026**, com a fonte ao lado. Quando um número não pôde ser confirmado na página oficial, isso está dito.

## 0. Resumo em uma tela

- **Planos:** Grátis (o estudo inteiro + Foca IA 3 mensagens/dia) · **Pro mensal R$ 19,90** · **Passe Pro até o ENEM 2027 R$ 179,90** (lançamento: R$ 149,90). O Pro de hoje é "mais Foca IA" (20 mensagens + 5 fotos por dia). O estudo nunca fica atrás de paywall.
- **Gateway:** **Asaas** como principal e **Mercado Pago** como reserva. Para app web não existe "terminal de pagamento": a venda é feita num checkout no próprio site.
- **Antes da primeira venda:** CNPJ (MEI pode servir, a confirmar com contador), plano Pro da Vercel, termos com cláusulas de venda revisados por advogado, caixa de e-mail de suporte, teto de custo da IA recalculado e a spec 49 implementada (webhook assinado e idempotente, plano decidido no servidor).
- **Anúncios:** recomendação é **não usar** agora, nem no lançamento nas lojas. A receita estimada é pequena, o público é adolescente e as regras do projeto proíbem publicidade sem spec (§7).

## 1. O que já está decidido no repositório

| Item | Onde | Situação |
|---|---|---|
| Cotas: grátis até 3 mensagens/dia (foto conta como mensagem); Pro 20 mensagens + 5 fotos/dia | 46 D-12; `src/server/tutor/cota.ts`; `AI_COTA_*` em `src/server/env.ts` | Implementado. Ninguém é Pro: o campo `profile.plano` só muda no servidor e não existe cobrança |
| Teto global de custo da IA por dia | `AI_TETO_DIARIO_USD`, padrão **US$ 1/dia** | Implementado. **Precisa subir antes de vender** (§2.4) |
| Preço usado no disjuntor | `AI_PRECO_ENTRADA_USD_MTOK=1`, `AI_PRECO_SAIDA_USD_MTOK=8` | Conservador de propósito. Modelo `gpt-5.4-mini`, até 600 tokens de saída (`src/server/tutor/ia.ts`) |
| Modelo de negócio | [estrategia.md](../produto/estrategia.md) §11 | B2C freemium de ticket baixo. O grátis entrega o ciclo completo e o pago é "mais IA por aluno". Preço nunca fechado |
| Linhas que não se cruzam | [regras.md](../produto/regras.md) R-GAM-2 | Sem loot box, sem vidas, **sem vender recuperação de sequência**, sem bloquear estudo como punição |
| Landing | regras.md R-MKT-4 | Hoje proíbe preço, "plano pago", "Premium" e "sem anúncios". **Mostrar preço exige mudar essa regra na spec 49** |
| Publicidade e analytics | regras.md R-ESC-5, R-PRIV-3; [seguranca/README.md](../seguranca/README.md) | Proibidos sem spec própria |
| Idade | [ADR 0006](../decisoes/0006-conta-obrigatoria-e-idade.md) | Conta a partir de 17 anos; Foca IA aos 17 só com consentimento do responsável |
| Controlador | [privacidade.md](../seguranca/privacidade.md) §1 | Matheus Vellozo Freire, **pessoa física**. Nenhum CNPJ citado no repositório |
| Tela `/premium` | `src/routes/premium.tsx` | Simulada (teste de 24 h no aparelho, "Preço a definir"). Lista benefícios que não existem ("Sem anúncios", "Videoaulas completas"). Precisa ser substituída, não reaproveitada |

## 2. Planos e preços

### 2.1 Concorrência (preços públicos em 01/10/2026)

| Produto | Oferta | Preço | Fonte |
|---|---|---|---|
| Descomplica Super Intensivo Enem | 6, 12+3 ou 18 meses; inclui 30 correções de redação/mês, "assistente IA" e aulas ao vivo | 12× R$ 49,90 (6 m) · 12× R$ 54,90 (15 m) · 18× R$ 39,90 | [descomplica.com.br/assinatura](https://descomplica.com.br/assinatura/) |
| Professor Ferretto | 2 meses ou 14 meses; "tutor de IA 24h", 4 correções/mês | 4× R$ 49,90 (Pix R$ 199,60) · 12× R$ 59,90 (Pix R$ 682,86); garantia de 7 dias | [professorferretto.com.br](https://www.professorferretto.com.br/) |
| Stoodi ENEM | 12 meses; "Tutor IA" e correção de redação | 12× R$ 69,90 (de 12× R$ 139,90) | [stoodi.com.br/planos/stoodi-enem](https://stoodi.com.br/planos/stoodi-enem/) |
| Aprova Total | "Completo até o Enem 2027" (até 31/12/2027) · "até o Enem 2026" | 12× R$ 112,43 ou R$ 1.349,10 · 6× R$ 89,10 ou R$ 481,14 | Busca no site oficial (página bloqueou leitura direta); **não confirmado na página** |
| Proenem | Turma Intensiva (6 meses) · Método PRO (12 meses) | 12× R$ 19,90 (R$ 204,30 à vista) · 12× R$ 29,90 (R$ 306,85) | [proenem.com.br](https://proenem.com.br/) |
| Me Salva! | Mensal e anual | R$ 34,90/mês e R$ 418,90/ano segundo fonte secundária; **não confirmado** (site não respondeu) | Busca, 01/10/2026 |
| Poliedro online | Turma online com aulas ao vivo | Preço não é público (consultor/WhatsApp) | [Blog Poliedro](https://cursopoliedro.com.br/blog/descubra-quanto-custa-estudar-no-poliedro-curso/), atualizado em 26/09/2024 |
| Explicaê | — | Não encontrado | — |
| Duolingo Super (app de hábito) | Individual | R$ 14,99/mês ou R$ 179,90/ano; Max (IA) R$ 399,90/ano. Fontes secundárias ([Fast Company Brasil](https://fastcompanybrasil.com/news/duolingo-lanca-recursos-de-ia-em-plano-max-veja-quanto-custa-no-brasil/), [TechTudo, 05/2025](https://www.techtudo.com.br/guia/2025/05/planos-do-duolingo-compare-precos-e-veja-se-a-assinatura-vale-a-pena-edapps.ghtml)) | — |

**O que a tabela mostra:** cursinho online custa entre R$ 20 e R$ 70 por mês em pacotes de 6 a 15 meses, e quase todos já anunciam "tutor de IA". O Pro do Foca, hoje, entrega só **mais Foca IA**. Não há correção de redação, videoaula própria nem simulado. Por isso o preço fica abaixo do cursinho mais barato e perto do Duolingo Super: o produto vendido é constância e ajuda sob demanda, não conteúdo (estrategia.md §0).

### 2.2 Estrutura proposta

| Plano | Preço | Cobrança | O que entra (só funções que existem) |
|---|---|---|---|
| **Grátis** | R$ 0 | — | Trilha adaptativa, lições, nivelamento, praticar, redação (trilhas e exercícios), flashcards, progresso, sequência com proteção, Foca IA **3 mensagens/dia** (foto conta como uma) |
| **Pro mensal** | **R$ 19,90/mês** | Cartão com renovação automática. Pix mensal **sem renovação automática** (cobrança enviada por e-mail a cada mês) até haver Pix Automático | Tudo do grátis + Foca IA **20 mensagens + 5 fotos/dia** |
| **Passe Pro até o ENEM 2027** | **R$ 179,90** à vista (Pix ou cartão 1×). Lançamento: **R$ 149,90** com prazo ou quantidade definidos e publicados | Pagamento único, **sem renovação**. Vale até 31/12/2027 (a data do ENEM 2027 ainda não saiu) | Igual ao Pro mensal |

Por que essa estrutura:
- **Passe único com Pix** é o produto para quem não tem cartão. O aluno de 17 a 19 anos costuma pagar com o Pix ou o cartão de um responsável, e um pagamento único sem renovação é mais fácil de pedir em casa e mais fácil de explicar.
- **Sazonalidade.** O ENEM 2026 acontece em **8 e 15/11/2026** ([Agência Brasil, 05/2026](https://agenciabrasil.ebc.com.br/educacao/noticia/2026-05/enem-2026-inscricoes-comecam-na-segunda-provas-serao-em-novembro)). Faltam cinco semanas, então vender agora para o ENEM 2026 rende pouco. A janela boa é a turma do ENEM 2027: de dezembro a março (volta às aulas) e de novo depois das inscrições (maio/junho). Um passe "até o ENEM 2027" vendido em janeiro cobre cerca de 11 meses.
- **R$ 179,90** equivale a 9 mensalidades e fica no preço anual do Duolingo Super. Os R$ 149,90 de lançamento cobrem o caso médio (tabela 2.3) e ainda ficam abaixo de qualquer cursinho da tabela.
- **Sem teste grátis de Pro.** O próprio plano grátis já mostra a Foca IA, e o direito de arrependimento de 7 dias (§5.2) funciona como garantia.
- **Não entra no Pro:** recuperar sequência, vidas, XP ou qualquer coisa de R-GAM-2. Também não entra "sem anúncios", porque não há anúncios.

### 2.3 Custo da IA e margem estimada

Hipóteses (conferir com uso real; o servidor já mede `cost_micros` por aluno e por dia em `ai_usage`, sem precisar de analytics):
- Preço configurado no disjuntor: US$ 1 por milhão de tokens de entrada e US$ 8 de saída. O preço público do `gpt-5.4-mini` aparece como US$ 0,75 / US$ 4,50 em fontes secundárias ([pricepertoken](https://pricepertoken.com/pricing-page/model/openai-gpt-5.4-mini), consulta em 01/10/2026; a página da OpenAI bloqueou leitura). Com o preço real, o custo cai cerca de 30% a 40%.
- Mensagem típica: cerca de 5.000 tokens de entrada (prompt de sistema, contexto do servidor e até 20 mensagens de histórico) e 400 de saída, o que dá **US$ 0,0082**. Pior caso: 8.000 e 600 (o teto de saída), **US$ 0,0128**. Foto: cerca de +1.500 tokens de entrada (estimativa). A moderação (`omni-moderation-latest`) é documentada como gratuita, mas isso não foi reconferido.
- Câmbio: R$ 5,20 por dólar (o dólar fechou a R$ 5,17 em 30/09/2026, [InfoMoney](https://www.infomoney.com.br/mercados/dolar-hoje-abertura-fechamento-comercial-turismo-25092026/)).

| Uso de um assinante Pro por mês | Custo de IA |
|---|---|
| Leve: 50 mensagens | R$ 2,15 |
| Médio: 150 mensagens | R$ 6,45 |
| Pesado: 300 mensagens (10/dia todo dia) | R$ 12,90 |
| Teto da cota: 600 mensagens com tokens no máximo + 150 fotos | **R$ 41,40** |

| Margem por venda | Pro mensal R$ 19,90 (cartão) | Passe R$ 149,90 (Pix, 11 meses de uso) |
|---|---|---|
| Taxa do gateway (Asaas, §3) | R$ 1,09 (R$ 0,49 + 2,99%) | R$ 1,99 |
| Imposto (ME no Simples, Anexo III inicial 6%; no MEI o imposto é fixo, §5.1) | R$ 1,19 | R$ 8,99 |
| Sobra antes da IA | R$ 17,62 | R$ 138,92 |
| Uso leve | R$ 15,47 (78%) | R$ 115,27 (77%) |
| Uso médio | R$ 11,17 (56%) | R$ 67,97 (45%) |
| Uso pesado | R$ 4,72 (24%) | **−R$ 2,98** |
| Teto da cota | **−R$ 23,78** | prejuízo |

Leitura honesta:
- No uso leve e no médio, a margem é saudável. **Um assinante que usa a cota inteira todo dia dá prejuízo** com os preços conservadores, e ainda dá prejuízo com o preço real (cerca de R$ 27 por mês de IA). Na prática, quase ninguém usa 20 mensagens por dia, mas isso ainda não foi medido.
- O que reduz o risco sem mudar o produto: (1) **cache de prompt** da OpenAI. O cache é automático em prompts longos, e o prompt de sistema fixo, enviado primeiro, passaria a custar 10% na entrada; isso precisa ser verificado na spec. (2) Acompanhar o custo real por assinante nas primeiras 4 semanas pelo próprio `ai_usage`. (3) Se o percentil 95 passar de R$ 10 por mês, discutir um teto mensal de custo por assinante, **escrito nos termos** (limite escondido não é aceitável).
- Custos fixos mensais (estimativa, orçar antes): Vercel Pro US$ 20 por assento (ADR 0001), Neon Launch por uso, DAS do MEI R$ 86,05 ou contador da ME, e-mail. Algo entre **R$ 300 e R$ 700 por mês**. Com uso médio, o ponto de equilíbrio fica entre 30 e 60 assinantes mensais.

### 2.4 Ajustes que vêm junto com a venda

- **`AI_TETO_DIARIO_USD` = US$ 1** cobre cerca de 120 mensagens por dia no total. Dez assinantes mandando 12 mensagens por dia já esgotam o teto e o tutor sai do ar para todos, inclusive para quem pagou. Antes de vender, o teto precisa ser dimensionado pelo número de assinantes (sugestão: US$ 0,15 por assinante ativo por dia + folga para o grátis) e revisto toda semana no começo.
- O disjuntor global não pode punir quem pagou. Fica para a spec decidir se o Pro tem uma reserva própria dentro do teto.

### 2.5 Três planos: Free, Basic e Pro (pedido do proprietário em 01/10, a decidir na spec 49)

O proprietário pediu três planos: **Free** com menos funções e **5 a 10 lições por dia**; **Basic** com mais Foca IA e algumas funções; **Pro** com **todas** as funções, inclusive **corretor de redação por IA** e a Foca IA com mais limite. Esta seção substitui a 2.2 se for aprovada. Preços são proposta; custos usam a tabela 2.3 (R$ 0,043 por mensagem típica).

| | **Free** | **Basic** | **Pro** |
|---|---|---|---|
| Preço proposto | R$ 0 | **R$ 14,90/mês** | **R$ 29,90/mês** · passe até o ENEM 2027 **R$ 249,90** |
| Lições por dia | **até 6** (o dobro da meta padrão de 3) | sem teto | sem teto |
| Foca IA | 3 mensagens/dia | 10 mensagens + 2 fotos/dia | 25 mensagens + 8 fotos/dia (uso justo com teto mensal nos termos) |
| Trilha, nivelamento, checagem, flashcards, sequência | ✓ | ✓ | ✓ |
| Caderno de erros inteligente (ideia 2) | — | ✓ | ✓ |
| Cronograma até o ENEM (ideia 3) | — | ✓ | ✓ |
| Estudo sem internet (ideia 6) | — | ✓ | ✓ |
| **Corretor de redação por IA** (5 competências) | — | — | ✓ 8 correções/mês |
| Simulados, "explica de outro jeito", treino de redação por partes, relatório para o responsável, áudio (ideias 1, 4, 5, 7) | — | — | ✓ |

**Cuidados que vêm junto:**
- **Teto de lições do Free.** A estratégia (§11) e a persona (§9) dizem que o grátis entrega o loop inteiro e que o pago não é "mais conteúdo". Um teto **acima da meta diária** preserva o loop: quem estuda a meta nunca vê o limite. O teto nunca interrompe uma lição no meio (conta ao começar a 7ª), não some com o progresso, e depois dele flashcards e revisão continuam livres. Sugestão: 6, não 5 (5 fica perto demais da meta de 3 de quem aumenta a meta).
- **Custo da Foca IA.** Quem usa a cota inteira todo dia custa ~R$ 13/mês no Basic (10 × 30 × R$ 0,043) e ~R$ 32/mês no Pro, contra R$ 29,90. A maioria usa bem menos, mas o Pro precisa de um teto mensal de uso justo escrito nos termos, e o teto global (`AI_TETO_DIARIO_USD`) precisa crescer antes de vender.
- **Corretor de redação.** Custo estimado ~US$ 0,02 por correção de texto digitado (cerca de R$ 0,10); foto de redação manuscrita custa mais e erra mais na transcrição, por isso o aluno confere o texto transcrito antes de corrigir. A nota é **estimativa por competência**, nunca "sua nota no ENEM". Precisa de revisão pedagógica externa da rubrica (B-040) antes de lançar.
- **Nunca à venda:** proteção de sequência, XP, vidas ou recuperar sequência (R-GAM-2, R-GAM-3: "nunca custa dinheiro"); ranking com outros alunos; anúncio (§7).

### 2.6 Sete ideias de funções só do pago

Todas são "mais IA e mais personalização por aluno", não mais conteúdo, como a estratégia pede. Nenhuma abre a Foca IA sozinha (regra dura 7): tudo é por toque do aluno.

1. **Simulado ENEM cronometrado** (Pro). Prova de 45 ou 90 questões no ritmo do dia de prova, com relatório por habilidade e a lista do que revisar, que vira a próxima semana da trilha. Usa só itens revisados (B-040, B-041). Mostra desempenho por área, sem prometer nota do ENEM. Já está no backlog (B-075).
2. **Caderno de erros inteligente** (Basic e Pro). Cada questão errada entra num caderno que volta em revisão espaçada no dia certo, com a explicação da questão e, se o aluno pedir, uma reexplicação da Foca IA. O motor adaptativo já sabe o que o aluno erra; o caderno torna isso visível e acionável.
3. **Cronograma até o ENEM** (Basic e Pro). O aluno diz quantos dias por semana e quanto tempo tem; o motor monta o plano semana a semana até a prova, por área e peso, e reorganiza sozinho quando ele falta ou adianta. Estende o `/plan` que a 48 tornou real.
4. **"Explica de outro jeito"** (Pro). Depois do feedback de uma questão, três botões: passo a passo, com um exemplo do dia a dia, ou "o que a questão pediu" (como ler o comando). A explicação oficial não muda (regra dura 8); a IA só acrescenta. Gasta da cota da Foca IA.
5. **Relatório semanal para o responsável** (Pro). E-mail de domingo (Resend) com dias estudados, tempo e o que melhorou, sem conversa com a IA e sem dado sensível. É o que convence quem paga, que costuma ser o responsável. Só com o consentimento do aluno e o fluxo de responsável da 46 (T-11.4), e linha nova em `privacidade.md`.
6. **Estudo sem internet** (Basic e Pro). Baixar a semana da trilha no Wi-Fi e estudar no ônibus sem gastar dados; as respostas sobem quando a conexão volta (a fila de sincronização já faz isso). Combina com a persona, que tem pacote de dados curto.
7. **Treino de redação por partes** (Pro). Antes do texto inteiro, o aluno treina cada peça com um tema da semana: tese, um parágrafo de argumento, repertório e proposta de intervenção com os cinco elementos. A Foca IA comenta cada parte; o corretor avalia o texto final. Repertório sugerido nunca inventa citação nem dado (copy/05).

Ficaram de fora de propósito: vender proteção de sequência (proibido), ranking entre alunos (48 D48-16, ECA Digital) e "sem anúncios" (não há anúncio).

## 3. Checkout e gateway

### 3.1 "Terminal de pagamento"

Terminal (POS, a "maquininha") é para venda presencial com cartão físico. **Um app web não precisa de maquininha.** O equivalente é um destes três:
1. **Link de pagamento:** uma página do gateway com o valor fixo. Dá para vender no mesmo dia, mas o servidor do Foca não sabe quem pagou, a menos que o webhook seja integrado (§6).
2. **Checkout hospedado:** o app cria a cobrança pela API, manda o aluno para a página do gateway e recebe o webhook. **É o recomendado.** Os dados de cartão nunca passam pelo servidor do Foca.
3. **Checkout transparente:** formulário de cartão dentro do app. Dá mais trabalho e traz mais escopo de segurança (PCI). Não compensa agora.

Maquininha só faria sentido para vender presencialmente (feira, escola). Não é o caso.

### 3.2 Comparativo (taxas de tabela em 01/10/2026; negociáveis com volume)

| | Pix | Cartão à vista | Assinatura recorrente | Pix Automático | Aceita CPF? | NFS-e | Cartão cai em | API e webhooks |
|---|---|---|---|---|---|---|---|---|
| **Asaas** ([preços](https://www.asaas.com/precos-e-taxas)) | R$ 1,99 (R$ 0,99 nos 3 primeiros meses) | R$ 0,49 + 2,99% (1,99% promocional) | Nativa (cartão, Pix e boleto por ciclo) | Sim, só para PJ. Segundo o blog do Asaas, exige CNPJ ativo há 6 meses e CNAE compatível (lido pela busca, não confirmado na página) | **Sim** (a NFS-e e o Pix Automático exigem PJ) | Sim, R$ 0,49 por nota (só PJ) | D+32 ([central do Asaas](https://central.ajuda.asaas.com/hc/pt-br/articles/32058732034715-Em-quanto-tempo-o-dinheiro-entra-na-minha-conta-Asaas-ap%C3%B3s-o-meu-cliente-pagar-uma-cobran%C3%A7a)); antecipação a 1,25% ao mês | Boa. Sandbox separado, webhook com `authToken` próprio, `id` de evento para idempotência, eventos guardados por 14 dias ([docs](https://docs.asaas.com/docs/sobre-os-webhooks)) |
| **Mercado Pago** | 0,99% online (fonte secundária; página oficial bloqueou leitura) | 4,98% na hora · 4,49% em 14 dias · 3,99% em 30 dias (Checkout Pro/Transparente, fontes secundárias) | API de assinaturas (`preapproval`); a documentação lista cartão, saldo, Pix e boleto ([docs](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview)) | Anunciado em textos de 2026; disponibilidade na API **não confirmada** | **Sim** | Não emite | Conforme o prazo escolhido | Madura. Sandbox com usuários de teste, webhooks assinados |
| **Stripe** ([preços BR](https://stripe.com/br/pricing)) | 1,19%, **só por convite** | 3,99% + R$ 0,39 | Billing (+0,7% do volume) | Sim na API desde 22/04/2026 ([changelog](https://docs.stripe.com/changelog/dahlia/2026-04-22/pix-recurring-payments-support)), mas depende do Pix liberado | **Sim** (conta "Individual" com CPF; novas exigências de verificação em 2026, [suporte](https://support.stripe.com/questions/2026-updates-to-brazil-verification-requirements)) | Não (precisa de serviço à parte) | Repasses configuráveis | A melhor do grupo, com portal do cliente para cancelar |
| **Efí** ([tarifas](https://sejaefi.com.br/tarifas)) | 1,19% via API | 3,49% | Assinaturas (cartão e boleto) | R$ 3,50 por cobrança ([Efí](https://sejaefi.com.br/blog/qual-custo-do-pix), atualizado em 23/09/2026) | **Sim** (conta "Efí Pro", PF para quem não tem CNPJ) | Não confirmado | Até 31 dias | Completa (23 endpoints de Pix Automático). A API Pix usa certificado próprio, o que dá mais trabalho |
| **Pagar.me** (Stone) ([site](https://www.pagar.me/)) | 0,99% | 4,19% (D+1, "a partir de") | Sim | Não confirmado | **Não** (CNPJ ou MEI) | Não | D+1 no plano anunciado | Madura |
| **AbacatePay** ([preços](https://www.abacatepay.com/pricing)) | R$ 0,80 | 3,5% + R$ 0,60 (fonte secundária) | Pix e cartão, semanal a anual | Não confirmado | **Não**: exige CNPJ em produção (MEI aceito) | Não nativa | Pix na hora | Simples e bem avaliada por desenvolvedores; empresa jovem |
| Hotmart · Kiwify · Eduzz (só alternativa) | Hotmart 9,9% + taxa fixa (R$ 1 a R$ 2,49) · Kiwify 8,99% + R$ 2,49 · Eduzz 4,99% a 9,9% ([comparativo 2026](https://www.freelasemcrise.com.br/blog/hotmart-kiwify-eduzz-comparativo), secundário) | idem | Sim | — | Sim | A nota da venda continua com o produtor (confirmar) | Varia | Webhooks existem, mas o checkout e o cliente ficam na plataforma |

Custo por venda nos dois produtos propostos:

| | Pro R$ 19,90 no cartão | Passe R$ 149,90 no Pix |
|---|---|---|
| Asaas | R$ 1,09 | R$ 1,99 |
| Mercado Pago (D30 / na hora) | R$ 0,79 / R$ 0,99 | R$ 1,48 |
| Stripe (com Billing) | R$ 1,32 | R$ 1,78 (se o Pix for liberado) |
| Efí | R$ 0,69 (recebe em 31 dias) | R$ 1,78 |
| AbacatePay | R$ 1,30 | R$ 0,80 |
| Kiwify | R$ 4,28 | R$ 15,97 |

### 3.3 Recomendação

**Principal: Asaas.**
1. Aceita CPF hoje, então a integração pode começar no sandbox antes do CNPJ, e migra para PJ sem trocar de fornecedor.
2. Tem assinatura recorrente nativa com cartão, Pix e boleto, e **emite NFS-e integrada**. Isso tira um fornecedor e um passo manual da operação de um fundador solo.
3. A taxa fixa do Pix (R$ 1,99) é barata no passe (1,3%) e o cartão recorrente sai por cerca de 5,5% no Pro mensal.
4. Os webhooks são fáceis de verificar: token próprio no cabeçalho `asaas-access-token`, `id` de evento para idempotência e reenvio automático.
5. Tem Pix Automático quando houver CNPJ elegível, o que fecha a lacuna do aluno sem cartão no plano mensal.

**Reserva: Mercado Pago.** Também aceita CPF, é uma marca em que o responsável confia e muita gente já tem saldo ou conta lá. Tem a taxa de Pix mais baixa e API de assinaturas. Perde no cartão (de 3,99% a 4,98%) e não emite nota. Se o Asaas recusar a conta ou o CNAE, troca-se o adaptador do servidor, não o produto.

**Por que não os outros agora:** Stripe tem a melhor API, mas o Pix ainda é só por convite para contas brasileiras, e sem Pix o produto perde o público sem cartão. Pagar.me e AbacatePay exigem CNPJ e não emitem nota. A Efí cobra R$ 3,50 por Pix Automático (17,6% de R$ 19,90) e a API Pix exige certificado. As plataformas de infoproduto custam de 3 a 8 vezes mais por venda e tiram o checkout do Foca. Só fariam sentido para vender antes da integração existir, com ativação manual do Pro, e mesmo isso precisaria de spec.

## 4. Passo a passo: criar e conectar a conta no Asaas

> Para o dono, em linguagem simples. Chave de API é senha: nunca vai para o chat, para o repositório nem para variável `VITE_*`.

**A. Ambiente de teste (pode começar já, sem CNPJ)**
1. Crie uma conta em **sandbox.asaas.com**. É um ambiente separado, sem dinheiro de verdade e sem análise de documentos. Clientes, cobranças, chaves e configurações do sandbox não valem na produção, e o contrário também ([docs](https://docs.asaas.com/docs/sandbox-1)).
2. Gere a chave de teste: menu do usuário → **Integrações** → **Gerar nova chave de API**. Dê um nome ("foca-dev"). A chave aparece **uma vez só**: copie direto para o gerenciador de senhas ([docs](https://docs.asaas.com/docs/chaves-de-api)).
3. Entregue a chave ao ambiente local por `.env` (ignorado pelo Git) ou cadastre na Vercel só no ambiente **Preview**. O agente nunca precisa ver o valor.
4. O webhook de teste aponta para a URL de um deploy de preview (definida na spec). Guarde o token do webhook gerado pelo Asaas no mesmo lugar da chave.
5. No sandbox dá para simular o pagamento de uma cobrança, inclusive com cartões de teste. É assim que o fluxo inteiro é testado antes de qualquer venda.

**B. Produção (depois do CNPJ e da spec 49 pronta)**
1. Abra o CNPJ (§5.1) e a conta em **asaas.com** como **pessoa jurídica**, com o CNPJ.
2. Verificação (KYC): envie o documento com foto, a selfie e os dados da empresa (no MEI, o CCMEI). Espere a aprovação. A chave de produção só funciona com a conta aprovada.
3. Dados bancários: cadastre uma conta **no nome do CNPJ** para transferir o saldo (o Asaas tem conta digital própria; transferências por Pix para PJ têm 30 gratuitas por mês).
4. Nota fiscal: em **Notas fiscais**, preencha os dados municipais (inscrição municipal, código de serviço do CNAE escolhido, alíquota de ISS). Em alguns municípios é preciso certificado digital. Faça com o contador.
5. Gere a chave de **produção** (nome "foca-producao", com data de validade) e cadastre na Vercel **só em Production**, como variável sensível.
6. Webhook de produção: **Integrações → Webhooks**, URL **`https://www.focaedu.com/api/pagamentos/webhook` (a criar)**, eventos de cobrança e de assinatura, token próprio (nunca a chave de API como token). Se a fila pausar depois de 15 falhas seguidas, os eventos ficam guardados por 14 dias.
7. Primeira venda real de baixo valor feita pelo próprio dono, com reembolso em seguida, para conferir o caminho inteiro: cobrança, webhook, plano Pro, nota e e-mail.

**Variáveis de ambiente do servidor (nomes propostos; a spec confirma)**

| Nome | Conteúdo | Onde |
|---|---|---|
| `PAGAMENTOS_HABILITADO` | liga/desliga a venda (padrão desligado, como `AUTH_EMAIL_HABILITADO`) | Servidor |
| `ASAAS_API_URL` | `https://api-sandbox.asaas.com/v3` no teste, `https://api.asaas.com/v3` na produção | Servidor |
| `ASAAS_API_KEY` | chave de API (segredo) | Servidor, por ambiente |
| `ASAAS_WEBHOOK_TOKEN` | token conferido no cabeçalho `asaas-access-token` (segredo) | Servidor, por ambiente |

Preços e planos ficam no código versionado (ou numa tabela), não em variável de ambiente: mudar preço é decisão registrada, não configuração silenciosa.

## 5. O que falta para vender de verdade

Ordem sugerida. **[dono]** = decisão, conta ou contratação do proprietário. **[agente]** = documentação ou código, sempre com spec aprovada. **[ext]** = profissional externo.

### 5.1 Jurídico e fiscal

1. **[dono] Decidir a forma de vender.** Vender como pessoa física é possível (carnê-leão, imposto de renda progressivo até 27,5%), mas é caro, dificulta a nota fiscal e fecha portas no gateway (NFS-e e Pix Automático do Asaas são só para PJ). **Recomendação: abrir CNPJ.**
2. **[dono + ext] MEI ou ME.**
   - **MEI:** a ocupação "Instrutor(a) de cursos preparatórios independente" (CNAE **8599-6/05**, cursos preparatórios para concursos e vestibulares, o que inclui ENEM) está entre as permitidas ao MEI no Anexo XI da Resolução CGSN 140/2018 ([gov.br, atividades permitidas](https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas/i)). Desenvolvimento e licenciamento de software **não** são permitidos ao MEI ([Contabilizei](https://www.contabilizei.com.br/contabilidade-online/profissional-de-ti-pode-ser-mei/)). **Risco:** uma assinatura de app com IA pode ser lida como software (SaaS) e não como curso. Se o contador concordar que 8599-6/05 descreve a atividade, o MEI serve para começar. Custo em 2026: DAS de **R$ 86,05/mês** para serviços ([Agência Brasil, 01/2026](https://agenciabrasil.ebc.com.br/economia/noticia/2026-01/recolhimento-do-mei-sobe-para-r-8105-em-2026)). Limite de faturamento de **R$ 81 mil por ano** (cerca de R$ 6.750 por mês, ou 340 assinaturas mensais). Há projetos para subir esse limite, sem aprovação até agora ([Contabilizei](https://www.contabilizei.com.br/contabilidade-online/faturamento-mei-2026/)).
   - **ME no Simples Nacional:** quando passar do limite ou se o contador preferir um CNAE de software. Ensino (8599-6/05) costuma ficar no **Anexo III** (alíquota inicial de 6%). Software e SaaS (por exemplo 6311-9/00 ou 6203-1/00) costumam ficar no **Anexo V** (15,5% inicial), e só caem para o Anexo III se a folha, incluindo o pró-labore, for de pelo menos 28% da receita (**fator R**) ([Agilize, tabela 2026](https://artigos.agilize.com.br/tabela-anexos-simples-nacional-2026/)). A partir de 01/2027, CBS e IBS (reforma tributária) entram para quem é do Simples ([Receita Federal, 08/2026](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/agosto/simples-nacional-nfs-e-nacional-sera-obrigatoria-para-me-e-epp-a-partir-de-1o-de-novembro-de-2026)).
3. **[dono] Conta PJ** no nome do CNPJ, separada da pessoal.
4. **[dono + ext] NFS-e.** O MEI já usa a NFS-e de padrão nacional desde 09/2023. Para ME e EPP do Simples, a Resolução CGSN 191/2026 tornou o Emissor Nacional obrigatório **a partir de 01/11/2026** ([Receita Federal, 14/08/2026](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/agosto/simples-nacional-nfs-e-nacional-sera-obrigatoria-para-me-e-epp-a-partir-de-1o-de-novembro-de-2026)). Confirmar com o contador se a emissão automática do Asaas cobre o seu município pelo padrão nacional.
5. **[ext] Contador.** O MEI não é obrigado a ter, mas vale uma consulta para o CNAE, o ISS do município, o MEI contra a ME e a reforma de 2027. A ME precisa de contador.
6. **[dono] Atualizar o controlador** nos documentos legais quando o CNPJ existir. Hoje está como pessoa física ([privacidade.md](../seguranca/privacidade.md) §1).

### 5.2 Consumidor

1. **Arrependimento de 7 dias** (CDC art. 49 e Decreto 7.962/2013 art. 5). Na compra online, o consumidor pode desistir em até 7 dias e recebe tudo de volta, pelo mesmo meio de pagamento, com uma forma de desistir tão fácil quanto a de comprar. Isso vale para serviço digital ([Ministério da Justiça](https://www.gov.br/mj/pt-br/assuntos/noticias/consumidor-tem-direito-ao-arrependimento-em-compras-on-line); [Conjur, 05/2025](https://conjur.com.br/2025-mai-25/direito-de-arrependimento-em-servicos-digitais-posso-cancelar-streaming-curso-online-ou-app/)). **[agente]** reembolso integral automático dentro de 7 dias, pelo app.
2. **Cancelamento fácil.** Não há lei federal nova de 2025 ou 2026 específica para cancelamento de assinatura online. Há projetos (por exemplo o PL 4.983/2026), e a prática jurídica consolidada é cancelar pelo mesmo canal da contratação, sem obstáculo. O Decreto 11.034/2022 (SAC 24 horas) vale para serviços regulados, não diretamente para um app. **Recomendação:** "Cancelar assinatura" em `/conta`, com no máximo dois toques, sem tela de retenção que atrapalhe e com confirmação por e-mail.
3. **Renovação automática informada:** antes de pagar, mostrar preço, periodicidade, data da próxima cobrança e como cancelar. Recibo por e-mail a cada cobrança. No passe, deixar claro que **não renova**.
4. **Política de reembolso (proposta):** 7 dias, integral e sem perguntas. Depois disso, o cancelamento interrompe a próxima renovação e o Pro vale até o fim do período pago. No passe, depois dos 7 dias, reembolso só por exceção no suporte. Quem decide se reter um passe longo sem reembolso é abusivo é o advogado.
5. **Cancelar nunca apaga progresso.** O aluno volta ao grátis com tudo o que estudou (coerente com R-GAM-2: estudo não é bloqueado como punição).

### 5.3 Menores de idade

1. **Capacidade civil.** Quem tem entre 16 e 18 anos é relativamente incapaz (Código Civil, art. 4º, I). Um contrato de assinatura feito sozinho por alguém de 17 anos pode ser anulado. O app aceita contas a partir de 17 anos (ADR 0006). **Proposta:** quem paga é sempre **maior de 18**. O checkout pede nome e CPF do pagador (o Asaas exige CPF ou CNPJ do cliente, [docs](https://docs.asaas.com/docs/criando-um-cliente)) e a declaração "sou maior de idade e, se o aluno for menor, sou o responsável". O plano vai para a conta do aluno.
2. **Dado novo:** CPF e nome do pagador, histórico de cobranças e a guarda fiscal (prazo a confirmar com o contador, normalmente 5 anos). Isso entra como linha em [privacidade.md](../seguranca/privacidade.md) e o Asaas entra como operador, na mesma entrega da spec 49. A exclusão de conta precisa guardar só o mínimo fiscal.
3. **LGPD art. 14:** o tratamento de dados de criança e adolescente segue o melhor interesse. A cobrança usa o mínimo e nunca serve para perfilamento.
4. **ECA Digital (Lei 15.211/2025, em vigor desde 17/03/2026, regulamentada pelo Decreto 12.880/2026).** Vale para serviço com acesso provável de menores, que é o caso do Foca. Proíbe loot boxes em jogos e o uso de dados de menores de 18 para publicidade comercial e perfilamento, e exige configurações que coíbam o uso compulsivo ([Senado, 20/03/2026](https://www12.senado.leg.br/noticias/materias/2026/03/20/eca-digital-o-que-cabe-as-empresas-as-familias-e-ao-estado)). A vinculação de conta ao responsável vale para usuários de até 16 anos (art. 24), o que hoje fica fora do Foca (17+). Multa de até 10% do faturamento ou até R$ 50 milhões por infração (art. 35, [IBDTec](https://www.ibdtec.com.br/post/eca-digital-lei-15211-2025-obrigacoes-prazos)). Para a venda, isso significa: **nenhuma oferta de Pro com urgência artificial, contagem regressiva ou pressão na sequência**, e o paywall aparece só quando o aluno pediu ajuda e a cota acabou.
5. **[ext]** A avaliação de conformidade (46 T-11.2) precisa incluir a venda.

### 5.4 Termos de uso e privacidade

Hoje não existe versão publicada; o que há é rascunho com pendências ([legal/README.md](../legal/README.md)). **[agente]** redige as cláusulas de venda e **[ext]** o advogado revisa:
- planos, preços, o que cada um inclui e o que acontece quando a cota acaba;
- renovação automática, data da cobrança, aviso de mudança de preço com antecedência;
- arrependimento de 7 dias, cancelamento, reembolso e chargeback;
- quem paga (maior de 18 ou responsável), dados do pagador e o gateway como operador;
- inadimplência: volta ao grátis sem perder progresso;
- fornecedor identificado (razão social, CNPJ, endereço e canal de atendimento, exigidos pelo Decreto 7.962/2013 art. 2º). Nada disso está definido hoje.

### 5.5 Produto e código (tudo depende da spec 49 aprovada)

1. **[agente] Escrever a spec 49** a partir deste documento e das decisões do §8: dependência nova (SDK ou `fetch` direto, versão fixada), segurança nível L3 (dinheiro e identidade) e riscos.
2. **[agente] Dados:** tabela de assinaturas (aluno, provedor, id externo, produto, estado, válido até, **origem**: web, Apple ou Google, já prevendo as lojas) e tabela de eventos de pagamento processados (idempotência). Migração aditiva. `profile.plano` passa a ser **derivado** da assinatura válida, sempre no servidor (regra dura 5).
3. **[agente] Webhook** em `src/routes/api/pagamentos/webhook.ts` (a criar): confere o token em tempo constante, grava o `id` do evento antes de agir, **consulta a cobrança na API do Asaas** em vez de confiar no corpo, responde 200 rápido e trata reembolso, chargeback, atraso e cancelamento. Nenhuma função aceita id de aluno vindo do cliente.
4. **[agente] Tela de planos**, substituindo `/premium`, com preço, renovação e arrependimento visíveis. Texto pelo roteamento de copy ([COPY.md](../COPY.md)).
5. **[agente] Paywall na cota que já existe.** Quando a Foca IA responde `COTA_ESGOTADA` a um pedido do aluno, o balão mostra o Pro como opção, sem abrir nada sozinho (regra dura 7) e sem bloquear o estudo.
6. **[agente] "Gerenciar assinatura"** em `/conta`: estado, próxima cobrança, cancelar, reembolso dentro de 7 dias, recibos.
7. **[agente] E-mails transacionais pela Resend:** recibo, aviso de renovação, falha de pagamento, cancelamento confirmado e fim do passe. O domínio `focaedu.com` foi verificado na Resend em 01/10 (48, registro), e o remetente `nao-responda@focaedu.com` já está configurado.
8. **[agente] Teto da IA** redimensionado (§2.4) e cache de prompt avaliado.
9. **[agente] Landing:** mudar R-MKT-4 na spec para permitir preço e "Pro".
10. **[agente] Testes:** webhook repetido, fora de ordem, com token errado, reembolso, troca de mensal para passe e E2E do checkout no sandbox. Depois, revisão de segurança L3.

### 5.6 Operação

1. **[dono] Vercel Pro antes da primeira venda.** O Hobby é só para uso não comercial ([ADR 0001](../decisoes/0001-hospedagem-vercel.md)).
2. **[dono] Suporte:** criar uma caixa de e-mail real no domínio (o endereço é decisão do dono; nenhum endereço `@focaedu.com` existe ainda, 48 D48-06) e publicar nos termos. WhatsApp é opcional e entra na política de privacidade como outro operador ([lancamento.md](../produto/lancamento.md)).
3. **[agente] Métricas sem analytics externo:** contar no próprio banco assinaturas ativas, novas, canceladas, reembolsadas e custo de IA por assinante (`ai_usage`). Para medir conversão do paywall, um contador agregado no servidor, sem identificador, definido na spec (R-ESC-5).
4. **[dono] Preço de lançamento:** com data ou quantidade publicadas e sem contagem regressiva falsa.
5. **[dono]** Teste com alunos reais antes de investir em divulgação. A tese de retenção ainda não foi validada (estrategia.md §10).

## 6. Fluxo de uma venda (como o servidor decide o plano)

1. O aluno, logado, escolhe o plano. O **servidor** cria o cliente e a cobrança (ou assinatura) no Asaas, ligada ao `userId` da sessão, e devolve o link do checkout.
2. O pagador (maior de 18) paga com Pix ou cartão na página do Asaas.
3. O Asaas chama o webhook. O servidor confere o token, registra o evento, consulta a cobrança na API e grava a assinatura válida.
4. A cota da Foca IA lê o plano no servidor (`cota.ts` já faz isso por `profile.plano`). O navegador nunca diz que é Pro.
5. Reembolso, chargeback ou fim do período: um novo evento muda o estado, e o plano volta ao grátis no fim do período pago.

## 7. Anúncios (quando houver app na App Store e na Play Store)

O dono pretende ter anúncios no app das lojas. Esta seção avalia a ideia. Hoje as regras do projeto dizem "não há analytics nem publicidade" (R-PRIV-3) e proíbem analytics externo sem spec (R-ESC-5). **Um SDK de anúncio é coleta nova de dados por terceiro.** Ele precisa de spec própria, de linha em [privacidade.md](../seguranca/privacidade.md) (operador, finalidade, base legal, transferência internacional) e de revisão jurídica.

### 7.1 O modelo "grátis com anúncio, assinatura sem anúncio"

- O Duolingo é o exemplo clássico, e mesmo nele a receita vem da assinatura. Em 2025, as assinaturas foram **84,2%** da receita (US$ 873,4 milhões de US$ 1.037,6 milhões). Os anúncios estão dentro dos outros 15,8%, junto com o Duolingo English Test e compras no app ([10-K 2025 do Duolingo](https://www.sec.gov/Archives/edgar/data/1562088/000162828026012494/duol-20251231.htm)).
- **Para o Foca:** anúncio interrompe uma aula curta, que é exatamente o que sustenta a constância. Também associa a marca a ofertas que não controlamos, num público de 17 a 19 anos. Se algum dia existir, **nunca** aparece dentro da questão ou da lição, no feedback de erro, na Foca IA, no onboarding e nivelamento, nas telas de sequência e recompensa, nem em notificação. O único lugar defensável é uma tela neutra depois de terminar uma sessão, com fechar visível (R-GAM-2, item 7).
- **Formato recompensado** ("assista e ganhe mais uma mensagem da Foca IA") não é recomendado. Ele troca atenção de adolescente por recurso de estudo e chega perto da "ansiedade monetizada" que o projeto proíbe.

### 7.2 Receita realista no Brasil

- O eCPM (receita por mil exibições) no Brasil é baixo. Para mercados como Brasil, Índia e Indonésia, um agregado de 2025 e 2026 (AdMob, AppLovin, ironSource, Unity) dá: vídeo recompensado de US$ 2 a 3, intersticial de US$ 1 a 2, banner adaptativo de US$ 0,08 a 0,14 ([RevenueLab, 2026](https://www.revenuelab.fyi/blog/admob-ecpm-benchmarks-2026)). Esse agregado não separa o Brasil.
- Conta de exemplo: um intersticial por sessão, uma sessão por dia, eCPM de US$ 1,50, dá cerca de **R$ 0,23 por usuário ativo diário por mês**. Mil usuários ativos por dia rendem cerca de **R$ 230 por mês**, o mesmo que uns 13 assinantes do Pro mensal. Com anúncio não personalizado (obrigatório para menores de 18, §7.3) o eCPM tende a cair, mas quanto não foi medido.
- **Conclusão:** só faz diferença com dezenas de milhares de usuários ativos por dia, e o custo em constância, marca e conformidade aparece desde o primeiro.

### 7.3 Redes e restrições para adolescentes

- **Redes:** AdMob (Google); AppLovin MAX (mediação de várias redes); Unity Ads (voltada a jogos); Meta Audience Network (as regras para menores não foram pesquisadas em detalhe). Cada uma é um SDK nativo com coleta própria de identificadores do aparelho.
- **Google (AdMob):** para usuários com menos de 18 anos, anúncio personalizado é proibido mesmo com consentimento, e categorias sensíveis são bloqueadas ([AdMob, proteções para adolescentes](https://support.google.com/admob/answer/12171027?hl=en)). O app marca cada pedido conforme a idade (a marcação antiga TFUA/TFCD foi substituída por TFAT, [AdMob](https://support.google.com/admob/answer/6219315?hl=en)). O Foca tem o ano de nascimento, então sabe quando marcar.
- **Google Play:** o público-alvo é declarado no Play Console. A política de Famílias (SDKs de anúncio autocertificados, sem anúncio por interesse) vale quando o público inclui crianças, o que não é o caso de um app 17+ ([Play Console](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)). O programa de SDKs autocertificados não aceitava novos candidatos na consulta.
- **Apple:** o rastreamento e o identificador de publicidade (IDFA) exigem o pedido do App Tracking Transparency. A categoria Kids (sem anúncio de terceiros) é para crianças e não se aplica a um app 17+ ([diretrizes 1.3 e 5.1.4](https://developer.apple.com/app-store/review/guidelines/)).
- **LGPD art. 14 e ECA Digital:** perfilamento e uso de dados de menor para publicidade comercial são proibidos (§5.3). **Fica permitido, em tese:** anúncio contextual e não personalizado, sem identificador para rastreamento, com criativos adequados à idade. **Não fica permitido:** anúncio por interesse ou remarketing para menores, compartilhar o comportamento de estudo com rede de anúncio, recompensa por assistir que pressione o adolescente.

### 7.4 Lojas: taxas e venda dentro do app

- **Apple no Brasil** (acordo com o CADE; vale a partir do iOS 26.5): compra no app paga **21% + 5%** de processamento; o Small Business Program paga 10%; assinatura paga 10% depois do primeiro ano. Link para comprar no site paga 15% (10% no Small Business ou em assinatura depois do primeiro ano) sobre compras feitas até 7 dias depois do toque. **Para usuários com menos de 18 anos, o app não pode oferecer link para compra no site**, e pagamento alternativo dentro do app precisa de barreira parental ([Apple, mudanças no Brasil](https://developer.apple.com/support/app-distribution-in-brazil/); [9to5Mac, 18/06/2026](https://9to5mac.com/2026/06/18/apple-announces-major-app-store-changes-for-brazil-including-alternative-app-marketplaces/)). Pela diretriz 3.1.3(b), o app pode liberar uma assinatura comprada no site **desde que ela também esteja à venda como compra no app**.
- **Google Play:** hoje cerca de 15% em assinaturas, e "99% dos desenvolvedores" pagam até 15% ([Play Console](https://support.google.com/googleplay/android-developer/answer/11131145?hl=pt-BR)). Um modelo novo (10% de serviço + 5% se usar o faturamento do Google, links externos permitidos) começou em 30/06/2026 nos EUA, no Reino Unido e no EEE, com expansão anunciada sem data para o Brasil ([Android Developers Blog, 06/2026](https://android-developers.googleblog.com/2026/06/play-expanded-billing.html)).
- **Efeito na escolha de agora:** nenhum. O que importa é **o plano vir do servidor**, com a assinatura registrando a **origem** (web, Apple ou Google). Quem compra no site entra no app pelo login e já é Pro. Quando houver loja, entram os avisos de servidor da Apple e do Google como novos adaptadores, sem trocar o Asaas. Como o público inclui menores de 18 e a Apple bloqueia o link externo para eles, o app iOS provavelmente vai precisar de compra no app e da comissão da loja.

### 7.5 Caminho técnico (alto nível)

- **Android:** PWA empacotado como TWA (Bubblewrap ou PWABuilder), com Digital Asset Links e cobrança pelo Play Billing via Digital Goods API, se houver venda no app. Falta o service worker (B-072).
- **iOS:** casca nativa (Capacitor) com recursos nativos de verdade. Um site embrulhado costuma ser recusado pela diretriz 4.2 (funcionalidade mínima). Venda pelo StoreKit; um serviço como RevenueCat ajudaria, mas é dependência nova e exige spec.
- Cada loja é uma iniciativa própria (lancamento.md: APK e Play Store são [fut]).

## 8. Decisões que o dono precisa tomar

| # | Decisão | Recomendação |
|---|---|---|
| 1 | Planos e preços | Grátis · Pro mensal **R$ 19,90** · Passe até o ENEM 2027 **R$ 179,90** (lançamento R$ 149,90). Lançar entre dezembro e janeiro, mirando o ENEM 2027 |
| 2 | Forma jurídica | **Abrir CNPJ.** MEI com CNAE 8599-6/05, se o contador validar; senão ME no Simples |
| 3 | Gateway | **Asaas** principal, **Mercado Pago** reserva. Começar no sandbox já |
| 4 | Quem paga | Só maior de 18 (o aluno adulto ou o responsável), com CPF do pagador |
| 5 | Cota do Pro e custo | Manter 20 mensagens + 5 fotos, subir o teto global antes de vender, medir o custo real por 4 semanas e decidir um teto mensal por assinante, escrito nos termos, se o percentil 95 passar de R$ 10 |
| 6 | Anúncios | **Não** no web e não no lançamento nas lojas. Reavaliar com spec própria só com escala grande e, se houver, só contextual e não personalizado, fora de toda superfície de estudo e da Foca IA |
| 7 | Infra e suporte | Vercel Pro e uma caixa de e-mail real de suporte antes da primeira venda; advogado para termos e privacidade |

## 9. Próximo passo proposto

1. **Dono:** responder às decisões do §8, criar a conta no sandbox do Asaas e marcar a conversa com um contador (CNAE e MEI).
2. **Agente:** com as decisões registradas, redigir `docs/specs/49-pagamentos/spec.md` (a criar) seguindo o §5.5, em estado `aguardando-aprovacao`. Nenhum código antes da aprovação.
3. Implementação e teste ponta a ponta no sandbox. Depois CNPJ, conta de produção, termos revisados e publicados, e a primeira venda controlada.

## Fontes (consultadas em 01/10/2026; data da publicação quando informada)

- Asaas: [preços e taxas](https://www.asaas.com/precos-e-taxas) · [prazo do cartão](https://central.ajuda.asaas.com/hc/pt-br/articles/32058732034715-Em-quanto-tempo-o-dinheiro-entra-na-minha-conta-Asaas-ap%C3%B3s-o-meu-cliente-pagar-uma-cobran%C3%A7a) · [webhooks](https://docs.asaas.com/docs/sobre-os-webhooks) · [chaves de API](https://docs.asaas.com/docs/chaves-de-api) · [sandbox](https://docs.asaas.com/docs/sandbox-1) · [Pix Automático](https://docs.asaas.com/docs/pix-automatico) · [blog: Pix Automático](https://blog.asaas.com/release/pix-automatico/) (requisitos lidos pela busca)
- Mercado Pago: [assinaturas](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview) · taxas por fontes secundárias ([SellSync, 2026](https://sellsync.ai/pt/blog/taxa-mercado-pago-2026-guia-completo/))
- Stripe: [preços Brasil](https://stripe.com/br/pricing) · [Pix Automático](https://docs.stripe.com/payments/pix/pix-automatico) · [changelog 22/04/2026](https://docs.stripe.com/changelog/dahlia/2026-04-22/pix-recurring-payments-support) · [verificação 2026](https://support.stripe.com/questions/2026-updates-to-brazil-verification-requirements)
- Efí: [tarifas](https://sejaefi.com.br/tarifas) · [Pix Automático](https://sejaefi.com.br/efi-pay/pix-automatico) · [custo do Pix, 23/09/2026](https://sejaefi.com.br/blog/qual-custo-do-pix) · [Efí Pro](https://sejaefi.com.br/efi-bank/efi-pro)
- Pagar.me: [site](https://www.pagar.me/) · AbacatePay: [preços](https://www.abacatepay.com/pricing) · [SaaS](https://www.abacatepay.com/para/saas) · [glossário (CNPJ)](https://docs.abacatepay.com/pages/glossario)
- Infoprodutos: [Hotmart, Kiwify ou Eduzz, 2026](https://www.freelasemcrise.com.br/blog/hotmart-kiwify-eduzz-comparativo)
- Concorrentes: [Descomplica](https://descomplica.com.br/assinatura/) · [Professor Ferretto](https://www.professorferretto.com.br/) · [Stoodi](https://stoodi.com.br/planos/stoodi-enem/) · [Proenem](https://proenem.com.br/) · [Aprova Total](https://aprovatotal.com.br/lp/enem/) (leitura direta bloqueada) · [Poliedro, 26/09/2024](https://cursopoliedro.com.br/blog/descubra-quanto-custa-estudar-no-poliedro-curso/) · Duolingo: [Fast Company Brasil](https://fastcompanybrasil.com/news/duolingo-lanca-recursos-de-ia-em-plano-max-veja-quanto-custa-no-brasil/), [TechTudo, 05/2025](https://www.techtudo.com.br/guia/2025/05/planos-do-duolingo-compare-precos-e-veja-se-a-assinatura-vale-a-pena-edapps.ghtml), [10-K 2025](https://www.sec.gov/Archives/edgar/data/1562088/000162828026012494/duol-20251231.htm)
- IA e câmbio: [GPT-5.4 mini, pricepertoken](https://pricepertoken.com/pricing-page/model/openai-gpt-5.4-mini) · [dólar em 30/09/2026, InfoMoney](https://www.infomoney.com.br/mercados/dolar-hoje-abertura-fechamento-comercial-turismo-25092026/)
- ENEM: [Agência Brasil, 05/2026](https://agenciabrasil.ebc.com.br/educacao/noticia/2026-05/enem-2026-inscricoes-comecam-na-segunda-provas-serao-em-novembro)
- Fiscal: [MEI, atividades permitidas (gov.br)](https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas/i) · [Anexo XI da Res. CGSN 140/2018](https://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=64455) · [CNAE 8599-6/05 no MEI](https://www.qipu.com.br/mei/profissoes/instrutor-de-cursos-preparatorios/) · [TI no MEI](https://www.contabilizei.com.br/contabilidade-online/profissional-de-ti-pode-ser-mei/) · [DAS 2026, Agência Brasil 01/2026](https://agenciabrasil.ebc.com.br/economia/noticia/2026-01/recolhimento-do-mei-sobe-para-r-8105-em-2026) · [limite do MEI 2026](https://www.contabilizei.com.br/contabilidade-online/faturamento-mei-2026/) · [anexos do Simples 2026](https://artigos.agilize.com.br/tabela-anexos-simples-nacional-2026/) · [NFS-e nacional para ME/EPP, Receita 14/08/2026](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/agosto/simples-nacional-nfs-e-nacional-sera-obrigatoria-para-me-e-epp-a-partir-de-1o-de-novembro-de-2026)
- Consumidor: [Ministério da Justiça, arrependimento](https://www.gov.br/mj/pt-br/assuntos/noticias/consumidor-tem-direito-ao-arrependimento-em-compras-on-line) · [Conjur, 25/05/2025](https://conjur.com.br/2025-mai-25/direito-de-arrependimento-em-servicos-digitais-posso-cancelar-streaming-curso-online-ou-app/)
- Menores: [Senado, ECA Digital, 20/03/2026](https://www12.senado.leg.br/noticias/materias/2026/03/20/eca-digital-o-que-cabe-as-empresas-as-familias-e-ao-estado) · [Lei 15.211/2025 (Planalto)](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm) · [sanções, IBDTec](https://www.ibdtec.com.br/post/eca-digital-lei-15211-2025-obrigacoes-prazos)
- Anúncios e lojas: [AdMob, proteções para adolescentes](https://support.google.com/admob/answer/12171027?hl=en) · [AdMob, marcação por idade](https://support.google.com/admob/answer/6219315?hl=en) · [Play, Famílias](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en) · [Play, taxa de serviço](https://support.google.com/googleplay/android-developer/answer/11131145?hl=pt-BR) · [Android Developers Blog, 06/2026](https://android-developers.googleblog.com/2026/06/play-expanded-billing.html) · [Apple, iOS no Brasil](https://developer.apple.com/support/app-distribution-in-brazil/) · [Apple, diretrizes](https://developer.apple.com/app-store/review/guidelines/) · [9to5Mac, 18/06/2026](https://9to5mac.com/2026/06/18/apple-announces-major-app-store-changes-for-brazil-including-alternative-app-marketplaces/) · [eCPM, RevenueLab 2026](https://www.revenuelab.fyi/blog/admob-ecpm-benchmarks-2026)
