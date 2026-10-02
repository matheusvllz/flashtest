---
estado: aprovado
atualizado: 2026-10-02
iniciativa: 49
substitui: [docs/negocio/monetizacao.md §2.2, §2.5, §2.6 e §8 (decisões 1, 5 e 6), regras R-ESC-3, R-ESC-4, R-ESC-7, R-PRIV-3 (publicidade), R-GAM-2 itens 3 e 4, R-GAM-3 ("nunca custa dinheiro"), R-GAM-5, R-MKT-4, 48 D48-16]
substituido-por: null
---

# 49 — Planos, assinaturas, vidas, anúncios, ranking 18+, funções pagas e correções de entrada

**Aprovação:** **aprovada pelo proprietário em 02/10/2026** ("aprovo a spec"), com todas as propostas como escritas (preços anuais, protetores, 5 vidas, cotas da Foca IA, regras do ranking). As decisões de produto do §0 foram dadas pelo proprietário em 01/10/2026 ("Free: gratuito, com anúncios e vidas limitadas. Basic: R$ 24,90 por mês, com vidas ilimitadas. Pro: R$ 39,90 por mês…"; "autorizo a venda de protetores avulsos"; "quero permitir [ranking] para usuários maiores de idade"; "Minha autorização altera as regras internas do produto"). A execução de código espera a preparação manual do proprietário onde houver dependência (§15).
**Vinculada a:** 46 (produção) e 48 (integração). Base: [docs/negocio/monetizacao.md](../../negocio/monetizacao.md) (pesquisa de 01/10).
**Prevalece sobre:** os itens listados em `substitui` acima; nada mais.
**Preparação manual do proprietário:** [preparacao.md](preparacao.md) (contas, sandbox, credenciais e webhooks). **Nenhuma tarefa de código começa antes da aprovação desta spec e do F0 concluído.**

## Como a IA implementadora deve usar este documento

1. Ler `docs/ESTADO.md`, esta spec (a seção da tarefa) e o fim do `registro.md` desta pasta. Fluxo: [SDD-WORKFLOW.md](../../ai/SDD-WORKFLOW.md).
2. Executar as entregas **na ordem** (§13): E1 → E2 → E3. Dentro de cada fase, as tarefas na ordem numerada. Cada tarefa deixa o projeto compilando (`bunx tsc --noEmit`), `bun test tests/unit` verde e, se tocar UI, `bunx playwright test` verde.
3. Nada de dinheiro real nesta iniciativa até o proprietário pedir explicitamente (D49-08): só sandbox do Asaas e anúncios de teste.
4. Não tomar decisão de arquitetura por conta própria. Divergência entre spec e código → `DV49-xx` no `registro.md`, seguindo a intenção daqui.
5. Skills por tarefa: matriz de [SKILL-ROUTING.md](../../ai/SKILL-ROUTING.md); carregar só as indicadas.

## 0. Decisões (01/10/2026)

Legenda: **[dono]** decidido pelo proprietário nesta data; **[proposta]** valor ou regra proposta por esta spec, que vale quando ele aprovar a spec.

| ID | Decisão | Motivo e consequência |
|---|---|---|
| D49-01 | **Três planos:** Free (grátis, com anúncios e vidas), **Basic R$ 24,90/mês** e **Pro R$ 39,90/mês** (vidas ilimitadas nos dois) [dono]. **Anuais [proposta]: Basic R$ 209,90/ano** (R$ 17,49/mês, 29,8% de desconto) e **Pro R$ 329,90/ano** (R$ 27,49/mês, 31,1% de desconto) | Tabela e viabilidade em §5.1–§5.2. O passe "até o ENEM" do `monetizacao.md` sai: o anual cobre o mesmo caso com renovação opcional |
| D49-02 | **Anúncios só no Free** [dono]; Basic e Pro sem anúncio. Dois formatos [proposta]: **intersticial** ao sair da tela de conclusão de uma lição (no máximo 1 a cada 10 min, regra do próprio Google) e **recompensado** opcional para ganhar 1 vida. O intersticial web do Google só dispara no clique de um link e o funcionamento numa SPA não está confirmado: T-49.6.1 testa antes; se não funcionar, a reserva é um **retângulo 300×250 dentro da própria tela de conclusão**, abaixo do resultado (nunca janela por cima). Nunca na landing, no onboarding, no quiz, no nivelamento, dentro de lição ou questão, no feedback de erro, na Foca IA, nas telas de sequência, de conta ou de pagamento. Sem banner | §5.4. Público adolescente: anúncio **não personalizado para todos** (D49-03b) |
| D49-03 | **Vidas no Free** substituem qualquer limite de lições [dono]. **5 vidas por dia** [proposta, justificativa em §5.3], renovadas à meia-noite do fuso do aluno, sem acúmulo. Errar uma questão de lição ou prática custa 1 vida; **"Não sei", nivelamento, checagem, simulado, redação e Foca IA não custam**. Sem vidas, a lição pausa no fim do feedback da questão (a explicação é sempre mostrada inteira) e o aluno escolhe: anúncio recompensado (+1, uma vez por dia), ver planos, revisar flashcards (não custam vida) ou voltar amanhã | Revoga R-GAM-2 item 3, R-GAM-5 e R-ESC-7 (vidas) para o Free. Vidas decididas **no servidor** (regra dura 5) |
| D49-03b | **Anúncio não personalizado para todos os alunos**, com marcação de menor de idade para quem tem menos de 18 pelo ano de nascimento [proposta] | ECA Digital e LGPD art. 14 proíbem perfilamento de menor para publicidade; separar adulto de menor só por autodeclaração não é confiável. Custa eCPM menor (§5.2) |
| D49-04 | **Anúncio recompensado: +1 vida por dia**, no máximo uma vez por dia [dono], só quando o aluno toca "Assistir e ganhar 1 vida" (nunca automático, nunca em contagem) [proposta] | §5.4. **Exceção declarada à regra dura 5:** na web o Google não oferece verificação de servidor (SSV é só do AdMob); o navegador avisa que o anúncio terminou e o **servidor concede a vida**, limitada a 1 por dia por conta. O risco (uma vida a mais por dia) é aceito; no app das lojas, SSV obrigatório |
| D49-05 | **Protetores de sequência à venda** [dono]. Por plano [proposta]: Free ganha 1 a cada 7 dias (como hoje), estoque máximo 2; **Basic** ganha o mesmo + **2 por mês**, estoque máximo **4**; **Pro** ganha o mesmo + **5 por mês**, estoque máximo **7**. **Avulsos** [proposta]: 1 por R$ 5,90 · 3 por R$ 12,90 · 7 por R$ 24,90 (o Asaas não cobra menos de R$ 5 por cobrança; §5.5); nunca acima do estoque máximo do plano; uso continua automático (R-GAM-3: "descobre depois, sem gerenciar"). **Consertar uma sequência já quebrada não é vendido** | Revoga R-GAM-3 "nunca custa dinheiro" e R-GAM-2 item 4 só para protetor comprado antes do dia parado. Nenhuma oferta de protetor aparece quando a sequência está em risco (§5.5) |
| D49-06 | **Ranking real só para maiores de 18** [dono]. Entrada opcional, com **apelido** (nunca nome, foto ou e-mail), sem mensagem entre alunos, grupos semanais de até 30 por XP da semana. Elegibilidade [proposta]: idade ≥ 18 pelo **ano de nascimento do cadastro, travado** (mudar só pelo suporte); quem nasceu no ano limítrofe confirma dia e mês na entrada, e o servidor guarda só "maior desde", não a data. Ordenação por **dias com estudo e blocos concluídos na semana**, nunca por tempo de uso (Decreto 12.880/2026 art. 9º). Menor nunca entra, nunca vê o ranking e nunca aparece numa consulta (filtro no servidor) | §5.6. A lei não exige verificação forte para ranking; a ANPD considera a autodeclaração de baixa confiança, aceitável em baixo risco. Revoga R-ESC-4 e 48 D48-16 para adultos. O ranking fictício sai do bundle de produção |
| D49-07 | **Seis funções pagas aprovadas** [dono, 01/10]: (1) simulado ENEM cronometrado — Pro; (2) caderno de erros inteligente — Basic e Pro; (3) cronograma até o ENEM — Basic e Pro; (4) "explica de outro jeito" — Pro; (6) estudo sem internet — Basic e Pro; (7) treino de redação por partes — Pro. Mais o **corretor de redação por IA** — Pro [dono, 01/10]. **Fora:** relatório semanal para o responsável (ideia 5, não aprovada) | Lista recuperada de `monetizacao.md` §2.6. A divisão por plano é a da proposta de 01/10, ajustada em §5.1 |
| D49-08 | **Pagamento pelo Asaas, só em sandbox nesta iniciativa** [proposta, segue `monetizacao.md` §3.3]. Plano **derivado no servidor** de uma assinatura válida. Checkout hospedado (o cartão nunca passa pelo Foca). `PAGAMENTOS_HABILITADO=false` em produção até o proprietário pedir a venda real | Nenhuma cobrança real, nenhuma conta paga contratada nesta fase (pedido do proprietário) |
| D49-09 | **Quem paga é maior de 18**, com nome e CPF do pagador e a declaração "sou maior de idade e, se o aluno for menor, sou o responsável" [proposta] | Código Civil art. 4º I; `monetizacao.md` §5.3. CPF é dado novo (§9) |
| D49-10 | **Foca IA por plano** [proposta]: Free 3 mensagens/dia; Basic 15 mensagens + 3 fotos/dia (uso justo 300 mensagens/mês); Pro 30 mensagens + 8 fotos/dia (uso justo 500/mês). **Teto global separado por plano**: o Free nunca consome a reserva de quem paga | O teto atual (US$ 1/dia para todos) derruba o tutor dos pagantes (`monetizacao.md` §2.4) |
| D49-11 | **Nivelamento em todos os planos, com 30 questões fixas**, avisado antes de começar ("São 30 questões, cerca de 25 minutos"), retomável, sem custo de vida e sem anúncio [dono, 01/10] | Hoje para entre 12 e 24 itens (`src/lib/adaptive/constants.ts:180-183`). Com 30 fixas, o aviso é verdadeiro. Exige banco suficiente por área (T-49.4.1) |
| D49-12 | **Entrada: "Criar conta" leva ao quiz antes de criar a conta**, tanto no `/login` quanto no cadastro pelo Google; conta Google nova sem onboarding vai para o quiz depois do retorno do Google [dono, 01/10] | Coerente com 46 D-16 (onboarding sem conta) e 46 D-20 (CTAs levam ao quiz) |
| D49-13 | **Perfil com conta é conta de verdade:** nome e e-mail vêm da conta; "Resetar demonstração" só existe no modo de demonstração (sem conta) [dono, 01/10] | Hoje `profile.tsx:61` lê `prefs.name` local (vazio para quem entrou pelo Google) e `:315` mostra o reset a todos |
| D49-14 | **Bug de rolagem da landing no navegador do Instagram:** reproduzir, medir e corrigir antes de qualquer outra mudança na landing, sem presumir a causa (F1) [dono] | §5.7 |
| D49-15 | **Entregas em três fases publicáveis** [proposta]: E1 (correções + fundação de planos e checkout em sandbox), E2 (vidas, anúncios, protetores), E3 (ranking 18+ e funções pagas) | §13. Cada entrega fica atrás de flag e pode ser desligada sem perder dado |
| D49-16 | **Exigências externas são verificadas à parte** da autorização do dono: ECA Digital, LGPD, CDC, políticas do Google (anúncios) e do Asaas, e das lojas (para depois). Onde houver conflito, prevalece a exigência externa e a tarefa registra a adaptação | §10, §19. Revisão jurídica (B-033) antes de ligar dinheiro real ou anúncio real |

## 1. Contexto

- **Produção (01/10):** `main` = `4d56f7d`, focaedu.com com contas reais (Google e e-mail pela Resend), banco Neon, sincronização corrigida (48 D48-17) e chama de sequência nova (D48-18). Foca IA no fallback local (sem chave da OpenAI).
- **Plano hoje:** `profile.plano` (`'gratis' | 'pro'`, `src/server/db/schema/estudo.ts:36-37,54`) existe, ninguém o altera; só a cota da Foca IA o lê (`src/server/tutor/cota.ts:46-47,69-71`). `/premium` é uma simulação local com "teste de 24 h" e benefícios que não existem (`src/routes/premium.tsx:12-31,45,62-75`).
- **Ranking:** `/ranking` mostra uma turma fictícia e **está no bundle de produção** (`src/routes/ranking.tsx:5`, `src/data/ranking.ts`), com links em `progress.tsx:127` e `dashboard.tsx:192` (48 registro).
- **Sequência:** regra única em `src/lib/recompensas.ts:15-18,92-117` (+1 proteção a cada 7 dias, máximo 2), duplicada no cliente em `store.ts:819-822`; o servidor deriva de `study_day` (`sincronizar.ts:57,206`).
- **Respostas:** o servidor recorrige cada resposta (`sincronizar.ts:90-123`); "Não sei" chega como `null`. Não existe custo por erro.
- **Nivelamento:** adaptativo, 4–6 itens por área e no máximo 24 (`constants.ts:180-183`).
- **Landing:** GSAP 3.15 com ScrollTrigger (`src/marketing/motion/scroll.ts`), seção presa por `position: sticky` com altura em `svh` (`marketing.css:618-627`), `scroll-behavior: smooth` (`:170-178`), CTA fixo mobile (`:929-952`, `chrome-dom.ts:22-71`). Os E2E rodam só em Chrome desktop; nenhum emula navegador interno de app.
- **CSP:** parcial (`vercel.json:17-22`, sem `script-src`). Teste E2E proíbe requisição para fora da origem na landing (`landing.spec.ts:78`).

## 2. Problema

1. O Foca não tem receita e tem custo crescente (Vercel Pro, Neon, OpenAI). O dono quer cobrir custos e crescer com três planos, anúncios e itens avulsos.
2. Regras internas antigas proíbem vidas, anúncios, venda de proteção e ranking. O dono as revogou; o SDD precisa refletir isso sem contradição e sem esquecer as exigências externas (menores, consumidor, plataformas).
3. Quatro problemas de uso reais (01/10): rolagem que "teleporta" na landing dentro do Instagram; "Criar conta" pula o quiz; perfil mostra "Sem nome" e "Resetar demonstração" para quem tem conta; nivelamento curto demais para posicionar bem.

**Teste do João** ([persona](../../produto/persona-joao.md) §0, §9): o João não tem dinheiro. O Free precisa continuar entregando o loop inteiro (aula, aha, progresso). Por isso: 5 vidas (não 3), "Não sei" não custa vida, flashcards livres, anúncio opcional para +1 vida, nivelamento e checagem livres. O risco de as vidas o expulsarem está em §19 e é medido (§9).

## 3. Objetivos

- Vender Basic e Pro (mensal e anual) e protetores avulsos com o plano e os itens decididos **só no servidor**, testados de ponta a ponta no sandbox do Asaas.
- Free com vidas e anúncios que não interrompem o estudo no meio de uma questão.
- Ranking semanal opcional só para adultos.
- As seis funções pagas e o corretor de redação, cada uma atrás de flag.
- Corrigir a entrada (quiz antes da conta), o perfil, o nivelamento (30 questões) e a rolagem da landing no Instagram.
- SDD sem contradição: regras revogadas registradas, regras externas respeitadas.

## 4. Não objetivos

- **Cobrança real, conta Asaas de produção, CNPJ, Vercel Pro, anúncio real veiculado.** Ficam para depois de um pedido explícito do dono (preparacao.md §9).
- App nas lojas (App Store, Play Store), compra dentro do app e AdMob: iniciativa própria. O modelo de dados já guarda a **origem** da assinatura (web, Apple, Google).
- Relatório semanal para o responsável (não aprovado).
- Moedas, gemas, baús, recompensa aleatória, multiplicadores e "consertar sequência" pagos (continuam proibidos: R-GAM-2 itens 1, 2, 5, 6 e 7 seguem valendo).
- Ligas com promoção e rebaixamento no ranking (versão 1 é grupo semanal simples).
- Analytics de terceiros. O SDK de anúncio é o único terceiro novo, com escopo restrito (§9).
- Mudar enunciado, alternativa, gabarito ou explicação de questão (regra dura 8). O corretor e o "explica de outro jeito" só acrescentam.

## 5. Requisitos funcionais

### 5.1 Planos e benefícios

| | **Free** | **Basic** | **Pro** |
|---|---|---|---|
| Mensal | R$ 0 | **R$ 24,90** | **R$ 39,90** |
| Anual (total · por mês · desconto sobre 12 mensais) | — | **R$ 209,90** · R$ 17,49 · 29,8% (12 × R$ 24,90 = R$ 298,80) | **R$ 329,90** · R$ 27,49 · 31,1% (12 × R$ 39,90 = R$ 478,80) |
| **Anúncios** | Sim (intersticial depois de lição; recompensado opcional) | **Não** | **Não** |
| **Vidas** | 5 por dia, +1 por anúncio (1×/dia) | **Ilimitadas** | **Ilimitadas** |
| Trilha adaptativa, lições, nivelamento (30 questões), checagem, flashcards, progresso, sequência | ✓ | ✓ | ✓ |
| Foca IA | 3 mensagens/dia | 15 mensagens + 3 fotos/dia (uso justo 300/mês) | 30 mensagens + 8 fotos/dia (uso justo 500/mês) |
| Protetores de sequência | 1 a cada 7 dias, estoque até 2 | + 2 por mês, estoque até 4 | + 5 por mês, estoque até 7 |
| Protetores avulsos (compra) | ✓ (pagador maior de 18) | ✓ | ✓ |
| Ranking semanal (só maiores de 18, opcional) | ✓ | ✓ | ✓ |
| (2) Caderno de erros inteligente | — | ✓ | ✓ |
| (3) Cronograma até o ENEM | — | ✓ | ✓ |
| (6) Estudo sem internet | — | ✓ | ✓ |
| (1) Simulado ENEM cronometrado | — | — | ✓ |
| (4) "Explica de outro jeito" (gasta da cota da Foca IA) | — | — | ✓ |
| (7) Treino de redação por partes | — | — | ✓ |
| **Corretor de redação por IA** (5 competências) | — | — | ✓ 10 correções/mês |
| Prioridade quando o teto global da Foca IA aperta | — | reserva própria | reserva própria |

O que justifica a diferença de R$ 15 entre Basic e Pro: o corretor e o treino de redação, o simulado, o "explica de outro jeito", o dobro da Foca IA e mais protetores. Cancelar ou deixar de pagar **nunca apaga progresso**: o aluno volta ao Free com tudo o que estudou; funções pagas ficam visíveis mas fechadas, com os dados preservados (caderno, cronograma, redações corrigidas).

### 5.2 Viabilidade (estimativa explícita; não presume que o preço basta)

**Hipóteses** (todas a medir no uso real; o servidor já registra `cost_micros` por aluno e dia em `ai_usage`):

| Item | Valor usado | Fonte |
|---|---|---|
| Mensagem da Foca IA | R$ 0,043 típica (5.000 tokens de entrada + 400 de saída a US$ 1/US$ 8 por milhão) · R$ 0,067 no pior caso | `monetizacao.md` §2.3; preço do disjuntor em `env.ts:59-60`; câmbio R$ 5,20 |
| Foto | +R$ 0,05 (conservador) | idem |
| Correção de redação | R$ 0,15 (cerca de 3.000 tokens de entrada com a rubrica + 1.500 de saída) | estimativa desta spec |
| Asaas | cartão R$ 0,49 + 2,99%; Pix R$ 1,99; notificações do Asaas **desligadas** (custariam R$ 0,99 por cobrança) | [preços Asaas](https://www.asaas.com/precos-e-taxas), consulta 01/10/2026 |
| Imposto | 6% (ME no Simples, Anexo III) como custo variável; no MEI o DAS é fixo (R$ 86,05/mês) e o limite é R$ 81 mil/ano | `monetizacao.md` §5.1. **Risco:** Anexo V (15,5%) se o CNAE for de software |
| Custos fixos/mês | Vercel Pro R$ 104 · Neon R$ 100 · domínio R$ 5 · DAS R$ 86 = **R$ 295** (MEI). Como ME: + contador R$ 300, sem DAS = **R$ 509** | estimativas; o Neon Launch é por uso |
| Anúncio | R$ 0,18 por aluno ativo diário por mês (1 intersticial/dia a eCPM de US$ 1,50 e recompensado em 30% dos dias a US$ 2,50, **os dois cortados pela metade** por serem não personalizados) | eCPM de mercados "tier 3" ([RevenueLab 2026](https://www.revenuelab.fyi/blog/admob-ecpm-benchmarks-2026)); o Brasil não aparece separado |

**Margem por assinante, por mês** (preço − taxa − imposto − IA):

| Plano | Uso leve | Uso médio | Uso pesado | Pior caso dentro da cota |
|---|---|---|---|---|
| Basic R$ 24,90 (cartão) | R$ 19,34 (78%), 2 mensagens/dia | **R$ 14,97 (60%)**, 5/dia | R$ 7,02 (28%), 10/dia | IA R$ 24,60 → **prejuízo de ~R$ 2,40** |
| Pro R$ 39,90 (cartão) | R$ 31,15 (78%), 3/dia e 2 redações | **R$ 23,10 (58%)**, 8/dia e 6 redações | R$ 8,82 (22%), 16/dia e 10 redações | IA R$ 47,00 → **prejuízo de ~R$ 11** |
| Basic anual R$ 209,90 | taxa de R$ 1,99 (Pix) ou R$ 6,77 (cartão) por ano | ≈ R$ 11,30/mês no uso médio | | |
| Pro anual R$ 329,90 | taxa de R$ 1,99 (Pix) ou R$ 10,35 (cartão) por ano | ≈ R$ 13,70/mês no uso médio | | |

**O plano Free custa mais do que os anúncios rendem.** Cada aluno ativo do Free que usa em média 1 mensagem da Foca IA por dia custa R$ 1,29/mês; com 0,5 mensagem, R$ 0,64. Os anúncios rendem cerca de R$ 0,18. Quem paga a diferença são os assinantes.

**Cenários** (MEI, fixos de R$ 295/mês, 70% Basic e 30% Pro, uso médio, Free com 1 mensagem/dia em média, alunos ativos por dia ≈ 30% dos ativos no mês):

| Alunos ativos/dia | Conversão (% dos ativos no mês) | Assinantes | Resultado/mês |
|---|---|---|---|
| 200 | 1% | 7 | **−R$ 395** |
| 200 | 3% | 20 | **−R$ 163** |
| 1.000 | 1% | 33 | **−R$ 823** |
| 1.000 | 3% | 100 | **+R$ 365** |
| 5.000 | 1% | 167 | **−R$ 2.905** |
| 5.000 | 3% | 500 | **+R$ 3.005** (passa do limite do MEI: vira ME, +6% e contador) |

**Leitura honesta:**
1. Os preços cobrem os custos **só com conversão perto de 2,5% a 3% dos ativos no mês** (referência de mercado para freemium: 2% a 5%; o Foca ainda não mediu nada). Abaixo disso, crescer aumenta o prejuízo, porque o custo do Free é por aluno.
2. A alavanca mais forte não é o preço: é **o uso médio da Foca IA no Free**. Com 0,5 mensagem/dia em vez de 1, o ponto de equilíbrio cai para cerca de 1,3% (a 1.000 alunos ativos por dia, 43 assinantes).
3. Proteções embutidas: uso justo mensal escrito nos termos (D49-10), teto global separado por plano e revisão semanal do custo real por plano nas primeiras 4 semanas (T-49.3.9). Se o percentil 95 do custo de IA de um plano passar de 50% do preço líquido, a cota é revista com aviso prévio aos assinantes.
4. **Gatilho de revisão:** depois de 8 semanas vendendo, se a conversão ficar abaixo de 2%, a spec seguinte revê a cota da Foca IA no Free antes de mexer no preço.
5. Fora da conta, a orçar antes de vender: revisão jurídica (B-033), certificado digital para NFS-e se o município exigir, e as lojas (Apple US$ 99/ano, Google US$ 25 uma vez; comissões de 15% a 26%).

### 5.3 Vidas (Free)

**3 ou 5 vidas? Escolha: 5.** Uma lição tem de 4 a 8 questões, e a meta diária pode chegar a 3 blocos (R-GAM-4). Um aluno que erra 30% das questões (comum no começo de um assunto novo) gasta 5 vidas em cerca de 16 questões, o que dá de 2 a 3 lições: o suficiente para cumprir a meta. Com 3 vidas, ele para em cerca de 10 questões (1 a 2 lições), e a meta fica fora de alcance justamente para quem mais precisa. O diferencial do Foca é a constância (estratégia §0); 3 vidas transformariam o Free numa vitrine. Com 5, o limite pega só quem estuda muito além da meta, que é quem tem mais motivo para assinar.

| Regra | Definição |
|---|---|
| Quantidade | 5 por dia; nunca acumula além de 5 (a vida do anúncio pode levar a 6 só naquele dia) |
| Renovação | Volta a 5 à **meia-noite do fuso do aluno** (`profile.timezone`, padrão `America/Sao_Paulo`). Sem contagem regressiva (Decreto 12.880/2026 art. 10: sem urgência fabricada); a tela diz só "As vidas voltam amanhã" |
| Custa 1 vida | Resposta **errada** em lição, prática da jornada e `/study` |
| Não custa | "Não sei" (premia a honestidade, que melhora o diagnóstico), nivelamento, checagem, simulado, redação, flashcards, Foca IA, revisão de questão já respondida |
| Quando acabam | A questão em que a última vida foi perdida termina normalmente: feedback e explicação inteiros. Depois, a lição pausa e salva o ponto. Uma folha oferece **Assistir e ganhar 1 vida** (se ainda não usado hoje), **Ver planos**, **Revisar flashcards** e **Voltar amanhã**. Nenhuma opção é pré-selecionada, e fechar é sempre possível |
| Retomar | No dia seguinte, ou com vida nova, a lição continua da questão seguinte |
| Fonte da verdade | **Servidor.** Cada evento `resposta` errado de aluno Free baixa a vida no servidor (`sincronizar.ts`), que devolve o saldo no agregado. O cliente mostra o saldo e bloqueia por conta própria só para não deixar responder sem vida enquanto está online |
| Offline | O aparelho segue a própria cópia do saldo. Ao sincronizar, o servidor aplica as respostas em ordem; respostas dadas depois de zerar **não são desfeitas** (estudo nunca é apagado), só o saldo fica em 0 até a renovação |
| Mudança de plano | Ao virar Basic ou Pro, as vidas somem na hora. Ao voltar ao Free, o dia começa com 5 |
| Sem conta | Quiz e nivelamento, que são abertos (46 D-16), não usam vidas. A lição já exige conta |

Tom: errar continua **sem punição de tom** (R-MASC-2 segue valendo): a Foca em `acolhedora`, nunca `desapontada` ou `cobrando`; perder a vida não toca som além do som de erro que já existe (C-SOM); nenhum texto como "você perdeu", "cuidado" ou "só resta 1".

### 5.4 Anúncios (Free)

| Item | Definição |
|---|---|
| Quem vê | Só aluno logado no plano Free, dentro do app (rotas do `AppShell`). **Nunca** na landing (`/`), quiz, cadastro, login, onboarding, nivelamento, termos e privacidade |
| Onde nunca | Dentro de lição ou questão, no feedback de erro, na Foca IA, nas folhas de sequência e de vidas (exceto o botão opcional do recompensado), no checkout, em `/conta`, em notificação |
| Formato 1: intersticial | Ao sair da **tela de conclusão de uma lição** para a trilha. Frequência: nunca depois da primeira lição do dia, no máximo 1 a cada 2 lições, no máximo 3 por dia, respeitando o mínimo do Google (1 a cada 10 min). Fechar visível. Se o Google não exibir numa SPA (T-49.6.1), usa a reserva |
| Reserva do formato 1 | Retângulo 300×250 dentro da tela de conclusão, abaixo do resultado e do botão de continuar, com o rótulo "Publicidade". Espaço reservado (sem pulo de layout) |
| Formato 2: recompensado | Só pelo botão "Assistir e ganhar 1 vida" na folha de vidas. Opt-in explícito (política do Google), uma vez por dia. A vida é concedida pelo **servidor** depois do evento `rewardedSlotGranted` (o Google exige 5 s de exibição). Se o anúncio não carregar (`defineOutOfPageSlot` devolve `null`), a opção some com "Anúncio indisponível agora" e o aluno não perde nada |
| Banner fixo | **Não** (pulo de layout, desempenho e o estudo como foco) |
| Personalização | **Não personalizado para todos** (`setPrivacySettings({ nonPersonalizedAds: true })`) e **`tagForAgeTreatment: 2`** para quem tem menos de 18 pelo ano de nascimento. Categorias sensíveis bloqueadas no Ad Manager |
| Consentimento de cookies | Folha de consentimento só para quem é Free, na primeira vez em que um anúncio apareceria, com "Aceitar" e "Recusar" do mesmo peso, nada pré-marcado (Guia de cookies da ANPD). **Recusar não bloqueia nada**: carrega o GPT em modo "limited ads", sem cookies; se o modo não funcionar, não há anúncio para esse aluno (nem o recompensado). Revogável em `/conta` |
| Integração | Google Ad Manager para pequenas empresas (gratuito; exige conta AdSense e revisão do site), com o Google Publisher Tag (`securepubads.g.doubleclick.net/tag/js/gpt.js`) carregado **sob demanda**, só para Free, por um adaptador em `src/lib/anuncios/` com provedor `falso` em desenvolvimento e E2E. Nenhum pacote npm novo |
| Desempenho | O script do GPT nunca entra no bundle nem na landing; carrega em idle depois que a tela de conclusão aparece. Sem impacto no caminho da questão |
| App das lojas (depois) | AdMob com SSV, mesma regra de lugares e frequência |

### 5.5 Protetores de sequência

| Regra | Definição |
|---|---|
| Ganho | Igual para todos: +1 a cada 7 dias com estudo (R-GAM-3) |
| Bônus do plano | Basic +2 e Pro +5 **por mês de assinatura** (no anual, todo mês na data de aniversário), creditados pelo servidor |
| Estoque máximo | Free 2 · Basic 4 · Pro 7. Ganho e bônus que passariam do máximo não são guardados (sem texto de perda) |
| Avulsos | **1 por R$ 5,90 · 3 por R$ 12,90 (R$ 4,30 cada) · 7 por R$ 24,90 (R$ 3,56 cada).** O Asaas não cobra menos de R$ 5 por cobrança. A compra que passaria do estoque máximo é **bloqueada antes do pagamento**. Comprados não expiram; ao voltar ao Free, o estoque acima do máximo do Free fica guardado até ser usado, e novos ganhos só entram quando couberem |
| Uso | Automático, como hoje: cobre um dia parado, e o aluno descobre depois (R-GAM-3) |
| O que não se vende | Consertar uma sequência que já quebrou; dias de sequência; XP |
| Onde a compra aparece | Na folha da sequência (seção "Proteções") e na tela de planos. **Nunca** num aviso de "sua sequência vai quebrar", em notificação ou com contagem (Decreto 12.880/2026 art. 10, II: pressão emocional ou urgência fabricada) |
| Quem paga | Maior de 18 (D49-09). Conta com menos de 18 pelo ano de nascimento: no máximo 2 compras avulsas por mês [proposta], como proteção ao adolescente (ECA Digital art. 18, II) |
| Arrependimento | 7 dias, integral, só pelos protetores **ainda não usados** |
| Margem | Líquido depois de taxa e imposto: 1 por R$ 5,90 → R$ 3,56 (Pix) / R$ 4,88 (cartão); 3 por R$ 12,90 → R$ 10,14 / R$ 11,25; 7 por R$ 24,90 → R$ 21,42 / R$ 22,18 |

### 5.6 Ranking (só maiores de 18)

| Regra | Definição |
|---|---|
| Quem entra | Conta com idade ≥ 18 pelo ano de nascimento **travado** (mudar só pelo suporte). Quem faz 18 neste ano confirma dia e mês na entrada; o servidor grava só `maior_desde` (data em que a maioridade foi confirmada), nunca a data de nascimento |
| Entrada | Opcional e desligada por padrão (ECA Digital art. 7º: configuração mais protetiva). A tela de entrada explica o que os outros veem e como sair |
| Identidade | **Apelido** escolhido pelo aluno e moderado (lista de termos proibidos, 3 a 20 caracteres, sem e-mail, telefone ou link). Sem foto, sem perfil clicável, sem nome real, sem cidade |
| Grupo | Até 30 participantes por semana (segunda a domingo, fuso de São Paulo), formados por ordem de entrada na semana |
| Pontuação | Dias com estudo na semana × 100 + blocos concluídos × 10, com no máximo 5 blocos contados por dia. **Nunca tempo de uso** (Decreto 12.880/2026 art. 9º) e nunca XP bruto (que premia maratona) |
| O que aparece | Posição, apelido e pontos. Para o próprio aluno: "Você está em 12º". Nunca "você é o último", nunca destaque para quem caiu (R-GAM-2 item 5 continua valendo) |
| Sem | Mensagem, comentário, seguir, convite, notificação de "você caiu", promoção e rebaixamento |
| Menor de 18 | Não vê a entrada nem o conteúdo (`/ranking` mostra "O ranking é para maiores de 18"), e o servidor nunca o inclui numa consulta. Quem corrigir o ano de nascimento pelo suporte para menos de 18 sai do ranking na hora |
| Sair | A qualquer momento, em `/conta`; o apelido some do grupo na hora |
| Fixture | O ranking fictício (`src/data/ranking.ts`) sai do bundle de produção e fica só para testes e desenvolvimento |

Base externa: a lei não exige verificação forte de idade para um ranking (ECA Digital art. 9º §1º só veda a autodeclaração para conteúdo impróprio); a ANPD trata a autodeclaração como de baixa confiança, aceitável em ambiente de baixo risco (orientações preliminares, 03/2026). Verificação por CPF (Serpro) custa, exige e-CNPJ e coletaria CPF do aluno: desproporcional agora.

### 5.7 Bug de rolagem da landing no navegador do Instagram

**Sintoma (dono, 01/10):** no navegador do Instagram, depois de certo ponto da landing, ao inverter a direção da rolagem a página "teleporta" para cima ou para baixo.

**Hipóteses a testar (nenhuma é presumida):**

| # | Hipótese | Por que é plausível | Como confirmar ou descartar |
|---|---|---|---|
| H1 | A barra do Instagram muda a altura da janela ao inverter a rolagem e o ScrollTrigger recalcula (`refresh`) as posições | `ignoreMobileResize` só ignora mudanças de até 25% da altura (GreenSock, fórum GSAP, 09/11/2023); `scroll.ts:64` usa só essa opção | O overlay mostra `innerHeight`, `visualViewport.height` e cada `refresh`: o pulo coincide com o `refresh`? |
| H2 | `svh` muda dentro do WKWebView do Instagram, e com ela a altura de `.lp-story` (`100svh + cenas × 70svh`, `marketing.css:618-627`) | Em WKWebView, as unidades dependem de o app informar os insets (WWDC22); se o Instagram redimensiona o quadro, svh muda junto (não confirmado) | O overlay mostra a altura calculada de `.lp-story` antes e depois de inverter |
| H3 | As condições de altura do `gsap.matchMedia` (`min-height: 560px`/`620px`) ligam e desligam o modo história | `scroll.ts:81-84`; a limpeza tira `lp-story-on` e a seção encolhe | O overlay registra a troca de `lp-story-on` |
| H4 | `scroll-behavior: smooth` (`marketing.css:176`) interage com a correção de posição | Rolagem suave durante um ajuste de posição | Desligar só no Instagram e comparar |
| H5 | Scroll anchoring (`overflow-anchor: auto`, ligado por padrão no WebKit do Safari 27) corrige a posição quando algo acima muda de altura | WebKit, 17/09/2026; `overflow-anchor` não aparece em `src/` | `overflow-anchor: none` na `.lp-story` e comparar |
| H6 | A troca de fonte tardia (`lp-fonts-late`, `boot.ts:33-35`) refaz o layout depois do `refresh` | Muda alturas de texto depois do carregamento | O overlay registra a troca e o `refresh` de `document.fonts.ready` |
| H7 | A barra fixa (`.lp-sticky`, `transform` + `inert`) ou o `position: sticky` da navbar | Bug aberto do iOS 26 com sticky e barra que some (fórum da Apple, 09/2025) | Desligar a barra fixa no Instagram e comparar |

**Reproduzir e validar:**
1. **Overlay de diagnóstico** só em preview, ligado por `?diagnostico-rolagem=1` (sem dependência nova): mostra e guarda numa lista copiável `scrollY`, `innerHeight`, `visualViewport.height`, altura de `.lp-story`, cada `ScrollTrigger.refresh`, troca de `lp-story-on`, `resize` e `orientationchange`, com horário.
2. **Aparelhos reais:** iPhone (iOS atual) e Android (WebView atual), Instagram atualizado. O link do preview vai por DM para a própria conta e é aberto pelo navegador do Instagram. O Web Inspector não conecta no Instagram (WKWebView não inspecionável desde o iOS 16.4; a WebView do Android só se o app permitir), por isso o overlay.
3. **Roteiro manual** ([preparacao.md](preparacao.md), Passo 10): rolar até a história, inverter três vezes em cada cena, ir até o fim, voltar ao topo; anotar se houve pulo e copiar o log.
4. **E2E de emulação** (**NOVO** `tests/e2e/marketing/rolagem-inapp.spec.ts`): user agent com "Instagram", viewport 390×844 que alterna a altura (844 ↔ 760, como uma barra) a cada inversão de direção. Afirma que `scrollY` nunca salta mais que a distância rolada + 120 px e que `lp-story-on` não alterna.
5. **Correção:** a que os dados apontarem. Candidatas, da menor para a maior: tirar `resize` de `autoRefreshEvents` em toque e recalcular só em `orientationchange`; travar em px, no carregamento, a altura das seções que definem a rolagem (`--lp-vh`); decidir as condições de altura do `matchMedia` uma vez só; `overflow-anchor: none`; sem rolagem suave no Instagram; em último caso, layout empilhado (sem modo história) no navegador do Instagram.
6. **Pronto quando:** o roteiro manual passa sem pulo nos dois aparelhos (gravação de tela no registro), o E2E de emulação passa e os E2E de motion, a11y e landing continuam verdes.

### 5.8 Entrada, perfil e nivelamento

**Entrada (D49-12):**
- Em `/login`, "Criar conta" leva a `/quiz` (onboarding), e a conta é pedida no fim, como nos CTAs da landing (46 D-20). O cadastro só aparece direto para quem já fez o quiz neste aparelho.
- Conta Google **nova** volta do Google para `/cadastro/completar` (idade e termos) e depois para `/quiz` se o onboarding não foi feito; conta Google existente com onboarding feito vai para `/trilha`. Vale também para quem toca "Continuar com o Google" na tela de login sem ter conta.
- O quiz feito antes de entrar vai para a conta (importação da 46 T-07).

**Perfil (D49-13):**
- Nome e e-mail exibidos vêm **da conta** (sessão do servidor), não de `prefs.name` (`profile.tsx:61`). Se o aluno informou um nome no quiz, ele vira o nome de exibição e é salvo na conta (`profile.firstName`).
- Editar o nome no perfil grava no servidor.
- "Resetar demonstração" (`profile.tsx:315`) só aparece no modo de demonstração (sem conta). Com conta, as ações são "Sair" e "Excluir conta" (já existentes em `SecaoConta`/`DadosDaConta`).
- O cartão do perfil mostra o plano ("Free", "Basic", "Pro") vindo do servidor e leva a `/planos`.
- `/premium` sai e redireciona para `/planos`. O `premiumTrial` do store deixa de ser usado (migração aditiva que só ignora o campo).

**Nivelamento (D49-11):**
- **30 questões fixas**, em todos os planos, sem vidas e sem anúncio. Distribuição: 9 em cada área prioritária e 6 em cada área normal (2 + 2 áreas = 30), redistribuída para somar 30 quando uma área não tiver itens elegíveis suficientes. Sem parada antecipada: a escolha do próximo item continua adaptativa (por θ), só o número é fixo.
- Antes de começar: "São 30 questões, cerca de 25 minutos. Dá para pausar e continuar depois. Se não souber, toque em 'Não sei'." Barra "Questão N de 30".
- Pausa e retomada salvas (store e sincronização).
- **Pré-condição de conteúdo:** cada área precisa de pelo menos 12 itens elegíveis e revisados no banco de nivelamento (`placement-pool.ts`). A T-49.4.1 conta o banco antes; se faltar, a tarefa para e registra a lacuna (B-040/B-045), sem inventar questão nem usar item não revisado.

### 5.9 Funções pagas (D49-07)

| # | Função | Plano | Comportamento | Custo de IA |
|---|---|---|---|---|
| 2 | Caderno de erros inteligente | Basic, Pro | Toda resposta errada entra no caderno. Revisão espaçada (1, 3, 7 e 14 dias) escolhida pelo motor; a questão volta na jornada como revisão. Tela `/caderno` com a explicação oficial e, se o aluno tocar, reexplicação da Foca IA. Duas revisões certas seguidas tiram a questão do caderno | Só a reexplicação pedida (cota normal) |
| 3 | Cronograma até o ENEM | Basic, Pro | O aluno informa dias por semana e minutos por dia; o motor distribui as áreas por peso e lacuna até a data da prova (configurável; padrão: primeiro domingo de novembro do ano-alvo, com o aviso "data estimada" até o INEP publicar). Reorganiza quando ele falta ou adianta. Estende `/plan` | Nenhum |
| 6 | Estudo sem internet | Basic, Pro | "Baixar a semana": service worker com cache das lições da fila comprometida e dos próximos 7 dias (B-072). As respostas já entram na fila de sincronização. Substitui a página `/offline` atual, que é só um marcador (`offline.tsx:27-30`) | Nenhum |
| 1 | Simulado ENEM cronometrado | Pro | 45 questões (uma área) ou 90 (um dia de prova), cronômetro opcional e pausa. Só itens revisados (B-040, B-041). Relatório por habilidade e "o que revisar", que alimenta a jornada. Mostra acertos e desempenho por área, **nunca "sua nota no ENEM"** | Nenhum |
| 4 | "Explica de outro jeito" | Pro | Depois do feedback de uma questão, três botões: passo a passo, exemplo do dia a dia, "o que a questão pediu". Abre a Foca IA **só pelo toque** (regra dura 7), com o pedido já escrito. A explicação oficial não muda (regra dura 8) | 1 mensagem da cota |
| 7 | Treino de redação por partes | Pro | Tema da semana; o aluno escreve tese, um argumento, repertório e proposta de intervenção (5 elementos) em etapas, com comentário da IA em cada uma. Repertório sugerido nunca inventa citação nem dado (copy/05) | 1 mensagem por parte |
| — | Corretor de redação por IA | Pro | Texto digitado (ou foto, com a transcrição conferida pelo aluno antes). Estimativa por competência (C1–C5, 0–200 cada), com justificativa e o trecho que motivou cada ponto. Rótulo fixo "Estimativa da Foca IA, não é a nota oficial". 10 por mês. **Rubrica revisada por professor externo antes de ligar** (B-040) | cerca de R$ 0,15 por correção |

### 5.10 Requisitos com critério

| ID | Requisito | Critério verificável |
|---|---|---|
| RF-1 | Plano decidido só pelo servidor | Nenhuma função de servidor aceita plano vindo do cliente; teste de isolamento: aluno A não ativa plano em B; trocar o store local para "pro" não libera nada |
| RF-2 | Checkout hospedado do Asaas (sandbox) para Basic, Pro, anuais e pacotes de protetores | E2E no sandbox: comprar Basic mensal com cartão de teste → plano Basic no servidor em até 60 s depois do webhook |
| RF-3 | Webhook idempotente e autenticado | Token errado → 401 sem efeito; mesmo evento 2× → um efeito; eventos fora de ordem → estado final correto; o servidor consulta a cobrança na API antes de agir |
| RF-4 | Cancelar e arrependimento | Cancelar em `/conta` em até 2 toques; dentro de 7 dias, reembolso integral automático; depois, o plano vale até o fim do período |
| RF-5 | Vidas do Free no servidor | Erro de aluno Free baixa 1 vida no servidor; "Não sei" não baixa; Basic/Pro nunca baixam; renova à meia-noite do fuso |
| RF-6 | Sem vidas: pausa depois do feedback | A explicação aparece inteira; a lição retoma do ponto salvo |
| RF-7 | Recompensado dá 1 vida, 1× por dia | Segunda concessão no mesmo dia → recusada pelo servidor |
| RF-8 | Anúncios só no Free e só nos lugares permitidos | E2E: nenhum pedido ao domínio do Google em landing, lição, feedback, Foca IA, nivelamento e checkout; nenhum pedido para Basic/Pro |
| RF-9 | Consentimento de cookies de anúncio | Recusar não bloqueia estudo; aceitar e recusar com o mesmo peso; revogável |
| RF-10 | Protetores por plano e avulsos | Bônus mensal creditado; compra acima do estoque bloqueada antes do pagamento; uso automático continua |
| RF-11 | Ranking só para maiores | Conta de 17 anos: `/ranking` não lista ninguém e a API recusa a entrada; adulto entra com apelido e sai a qualquer momento |
| RF-12 | Funções pagas e corretor por plano | Cada função atrás de flag, fechada para quem não tem o plano, com dados preservados ao cancelar |
| RF-13 | Rolagem no Instagram | §5.7 item 6 |
| RF-14 | "Criar conta" passa pelo quiz; Google novo vai ao quiz | E2E dos dois caminhos |
| RF-15 | Perfil com dados da conta; sem "Resetar demonstração" com conta | E2E com conta de e-mail e com conta Google simulada |
| RF-16 | Nivelamento com 30 questões, avisado e retomável | E2E: aviso visível, "Questão N de 30", pausa e retomada, 30 respostas antes do resultado |
| RF-17 | Termos e privacidade com as cláusulas de venda, anúncio e ranking | Rascunho atualizado e marcado para revisão jurídica (B-033) |

### 5.11 Regras do produto revistas (D49-15, D49-16)

A autorização do dono (01/10) muda as regras internas. Ao aprovar esta spec, a T-49.0.2 aplica o texto novo em [regras.md](../../produto/regras.md) e nos documentos citados. Até lá, cada regra tem uma nota apontando para cá.

| Regra | Hoje | Passa a ser |
|---|---|---|
| R-ESC-3 Pagamento | Fora do escopo | Basic e Pro (mensal e anual) e protetores avulsos pelo Asaas; plano derivado no servidor (D49-01, D49-08) |
| R-ESC-4 Ranking | Ranking real fora; demonstrativo como fixture | Ranking semanal real, opcional, só para maiores de 18, com apelido (D49-06). O demonstrativo continua só como fixture |
| R-ESC-7 Sem economia de jogo | Sem vidas, moedas, gemas, energia, baú… | **Vidas só no Free** (D49-03) e **protetores avulsos** de conteúdo conhecido (D49-05). Continuam proibidos: moedas, gemas, energia, baú, multiplicador aleatório, compra de XP ou de dias |
| R-GAM-2 item 3 | "Nada de bloquear estudo como punição (vidas)" | No Free, as vidas pausam **novas questões de lição** depois de 5 erros no dia; nunca apagam progresso, nunca cortam o feedback e nunca bloqueiam flashcards, nivelamento, checagem e Foca IA |
| R-GAM-2 item 4 | "Não se vende recuperação de sequência" | Vende-se **proteção antecipada** (protetor); **consertar sequência já quebrada continua proibido**. Nenhuma oferta no momento em que a sequência está em risco |
| R-GAM-2 item 5 | Ranking mostra a turma, nunca "você é o pior" | Continua, aplicado ao ranking real de adultos |
| R-GAM-3 Sequência | "Nunca custa dinheiro" | A sequência nunca custa dinheiro para continuar; protetores **podem** ser comprados antes, e o plano dá bônus. O resto da regra (uso automático, sem drama ao quebrar) continua |
| R-GAM-5 Mecânicas recusadas | Vidas/corações recusados | Vidas aceitas só no Free (D49-03); gemas/moeda e recompensa variável continuam recusadas |
| R-PRIV-3 | "Não há analytics nem publicidade" | Há **publicidade não personalizada** no Free pelo Google Ad Manager, com consentimento de cookies; continua sem analytics de terceiros |
| R-MKT-4 Landing | Proibidos preço, plano pago, Premium, "sem anúncios" | Permitidos preço e nomes dos planos **só quando `PAGAMENTOS_HABILITADO` estiver ligado em produção**; continuam proibidos "grátis para sempre", "100% grátis" e urgência falsa |
| 48 D48-16 | Ranking só layout | Substituída pela D49-06 |
| `monetizacao.md` §2.2, §2.5, §8 (1, 5, 6) | Grátis/Pro, passe, sem anúncios | Substituídos por D49-01, D49-02, D49-10 |

Continuam valendo, sem mudança: R-GAM-2 itens 1, 2, 6 e 7; R-MASC-2 (erro nunca é punição de tom); regra dura 7 (Foca IA só sob demanda); regra dura 8 (conteúdo pedagógico protegido); C-SOM (sem som de derrota).

## 6. Requisitos de UX

- **Tela de planos (`/planos`, NOVA, substitui `/premium`):** três colunas no desktop e cartões empilhados no celular, com o Basic como padrão destacado (não o Pro). Alternância mensal/anual com o total anual e o equivalente mensal escritos por extenso. Antes de pagar: preço, periodicidade, data da próxima cobrança, "cancele quando quiser em Conta", arrependimento de 7 dias, e quem pode pagar (maior de 18). Um CTA primário por cartão. Sem contagem regressiva, sem "últimas vagas", sem pré-seleção do anual.
- **Checkout:** o servidor cria a sessão e o navegador vai para a página do Asaas. Na volta (`/planos/retorno`), estados: "Confirmando seu pagamento…" (até o webhook), "Pronto, seu plano Basic está ativo", "O pagamento não foi aprovado" (com tentar de novo) e "Pix gerado: o plano ativa assim que o pagamento cair".
- **Pagador:** formulário curto antes do checkout (nome, CPF, e-mail) com a declaração de maioridade; o CPF vai direto ao Asaas e não é guardado pelo Foca (§9).
- **Conta → Assinatura:** plano, estado, próxima cobrança ou fim do período, "Cancelar assinatura" (2 toques), "Pedir reembolso" (só nos 7 dias), recibos (link do Asaas).
- **Vidas:** um indicador de coração com o número no topo da lição e na trilha, só no Free. Toque: folha explicando a regra. Sem vidas: a folha do §5.3. Copy pelo [COPY.md](../../COPY.md); strings novas em `src/lib/copy.ts` e no inventário. A Foca na folha de vidas em `acolhedora`.
- **Anúncios:** rótulo "Publicidade" sempre; fechar sempre visível; nada de anúncio que simule botão do app.
- **Consentimento:** folha simples com dois botões de mesmo peso, link para a política.
- **Protetores:** seção na folha da sequência com o estoque ("3 de 4"), a regra do plano e "Comprar protetores", que abre os três pacotes e avisa quando o estoque está cheio.
- **Ranking:** tela de entrada (o que os outros veem, apelido, sair a qualquer momento); lista do grupo com o próprio aluno destacado; sem setas de "caiu".
- **Funções pagas fechadas:** aparecem com um cadeado discreto e uma linha do que fazem; tocar leva a `/planos` com o plano certo marcado. Nunca interrompem o estudo para vender.
- **Nivelamento:** tela de abertura com as 30 questões e o tempo, contador "Questão N de 30", "Pausar" sempre visível.
- **Perfil:** nome da conta, e-mail, plano; sem "Resetar demonstração" com conta.
- **Movimento:** o coração perdido some com 200 ms de fade (`prefers-reduced-motion`: sem movimento, só o número muda). Nada pisca.
- Capturas em 320, 390 e 1280, claro e escuro, de cada tela nova.

## 7. Requisitos de performance

- Nenhuma requisição nova no caminho da questão: a vida é baixada no evento de resposta que já vai para o servidor.
- GPT nunca no bundle, nunca na landing; carregado em idle só para Free. A landing continua sem nenhuma requisição externa (`landing.spec.ts:78`).
- Service worker do estudo sem internet: registrado só para Basic e Pro, depois do primeiro carregamento; cache por versão; nunca intercepta `/api/*` nem `/_serverFn/*`.
- Bundle das rotas novas por `lazyRouteComponent`; a raiz não importa nada de planos, anúncios ou ranking (regra dura 9). Teto: +15 kB gzip no chunk do AppShell.

## 8. Requisitos de acessibilidade

Alvos ≥ 44 px; foco visível; cor nunca é o único sinal (o número de vidas sempre escrito); `aria-live="polite"` para "Você tem 3 vidas"; folhas com foco preso e Esc para fechar; anúncio com rótulo legível e fechar alcançável por teclado; tabela de planos navegável por leitor de tela (cabeçalhos de coluna); 320 px sem rolagem horizontal; reduced motion respeitado.

## 9. Analytics e dados

**Métricas, todas no próprio banco, sem terceiros:** assinaturas novas, ativas, canceladas, reembolsadas e com chargeback por produto; conversão agregada por semana (assinantes novos ÷ ativos na semana); custo de IA por plano (`ai_usage`); vidas zeradas por dia (contagem agregada, para medir o risco de o Free expulsar o João); anúncios exibidos (contador agregado diário por formato, sem identificador). Script `scripts/negocio/painel.ts` (NOVO) imprime o painel semanal.

**Dados novos** (linhas em [privacidade.md](../../seguranca/privacidade.md) §3.2, na T-49.3.8):

| Dado | Onde | Finalidade | Base legal proposta | Retenção proposta |
|---|---|---|---|---|
| Nome, CPF e e-mail do pagador | **Só no Asaas** (operador); o Foca guarda o id do cliente no Asaas e a data da declaração de maioridade | Cobrança e nota fiscal | Execução de contrato; obrigação legal (fiscal) | Asaas: pelo prazo fiscal (a confirmar com o contador, normalmente 5 anos). Foca: enquanto houver assinatura ou compra + prazo fiscal |
| Assinaturas, cobranças e compras | Banco do Foca | Liberar o plano, reembolso, suporte | Execução de contrato | Prazo fiscal; a exclusão de conta guarda só o mínimo fiscal, sem vínculo com o estudo |
| Vidas do dia | Banco do Foca | Regra do Free | Execução de contrato | 30 dias |
| Consentimento de cookies de anúncio | `consent` | Prova do consentimento | Consentimento | Enquanto a conta existir |
| Dados enviados ao Google Ad Manager | Navegador → Google (operador/controlador conjunto: a confirmar na revisão jurídica) | Exibir anúncio não personalizado | Consentimento (cookies) / legítimo interesse sem cookies (limited ads) — **a revisão jurídica decide** | Política do Google |
| Apelido do ranking, `maior_desde`, participação | Banco do Foca | Ranking | Consentimento (opt-in) | Até sair do ranking + 30 dias |
| Texto de redação e correções | Banco do Foca; texto enviado à OpenAI (já operadora) | Corretor e treino | Execução de contrato | Enquanto a conta existir; apagável pelo aluno |
| Caderno, cronograma, simulados | Banco do Foca | Funções pagas | Execução de contrato | Enquanto a conta existir |

Nunca vai para a rede de anúncios: nome, e-mail, idade exata, desempenho, conversa com a Foca IA, páginas de conta. Nenhum par chave-valor de segmentação com dado do aluno.

Store: migração aditiva em `src/lib/state-migrations.ts` (cache de `plano`, `vidas`, consentimento de anúncio, progresso do nivelamento de 30), testada.

## 10. Implicações de segurança

**Nível L3** ([seguranca/README.md](../../seguranca/README.md)): dinheiro, identidade, menores, script de terceiro. Revisão L3 obrigatória antes de ligar `PAGAMENTOS_HABILITADO` ou `ANUNCIOS_HABILITADO` em produção.

| Ameaça | Controle |
|---|---|
| Webhook forjado ou repetido | Token no cabeçalho `asaas-access-token` comparado em tempo constante; `id` do evento gravado antes de agir (único); o servidor **consulta a cobrança na API do Asaas** e age pelo que ela diz, não pelo corpo; resposta 200 rápida |
| Preço adulterado | Preço e produto vêm do catálogo do servidor (`src/lib/planos.ts`); o cliente só manda o código do produto |
| Plano vindo do cliente | Nenhuma função aceita plano; `planoDoAluno()` lê a assinatura válida (regra dura 5) |
| IDOR | `userId` só da sessão; `externalReference` é o id interno da compra, que o servidor liga ao aluno |
| Abuso do recompensado | 1 vida por dia por conta, no servidor; limite de taxa por conta e IP. Risco residual (sem SSV na web) aceito |
| Abuso de reembolso | Reembolso automático 1 vez por produto a cada 90 dias; depois, pelo suporte |
| Chargeback | Revoga o plano no evento; protetores comprados e não usados são retirados |
| Script de terceiro (GPT) | Carregado só no Free, só nas rotas do app; CSP passa a ter `script-src` com `'self'`, os hashes dos scripts inline e `securepubads.g.doubleclick.net`, `pagead2.googlesyndication.com` (lista exata validada no spike, primeiro em Report-Only, 46 T-12.1); `frame-src` para os domínios de anúncio; nunca nas rotas de conta e checkout |
| CPF em log | O CPF nunca toca log nem banco do Foca; `log()` já recusa campos sensíveis (`http.ts`), e a lista ganha `cpf` |
| Apelido ofensivo ou com contato | Moderação por lista e regex (e-mail, telefone, link); denúncia simples ("reportar apelido") que oculta até revisão |
| Menor no ranking | Filtro no servidor em toda consulta (idade pelo ano travado + `maior_desde`) |
| Segredos | `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN` só no servidor, nunca `VITE_*`, nunca em log; unidades de anúncio (públicas por natureza) vêm de uma função de configuração do servidor |

## 11. Arquitetura proposta

**Compartilhado (cliente e servidor):**
- **NOVO** `src/lib/planos.ts`: catálogo versionado (`PLANOS`, `PRODUTOS` com preço em centavos, periodicidade e benefícios), `beneficiosDo(plano)`, `estoqueMaximoDeProtetores(plano)`, `VIDAS_POR_DIA = 5`.
- `src/lib/recompensas.ts`: `avancarSequencia`/`sequenciaDosDias` passam a aceitar créditos extras de protetor por data (bônus e compras) e o estoque máximo do plano, mantendo a regra atual quando não houver créditos (mesma função no app e no servidor).
- **NOVO** `src/lib/vidas.ts`: saldo do dia a partir de (perdidas, ganhas por anúncio), puro e testável.
- **NOVO** `src/lib/ranking.ts`: pontuação da semana e elegibilidade por idade.

**Servidor:**
- **NOVO** `src/server/planos/plano.ts`: `planoDoAluno(db, userId)` pela assinatura válida; atualiza `profile.plano` como cópia.
- **NOVO** `src/server/pagamentos/asaas.ts` (adaptador por `fetch`, sem SDK: clientes, checkouts, cobranças, assinaturas, reembolso, cancelamento) e `src/server/pagamentos/falso.ts` (provedor de teste para unitários e E2E).
- **NOVO** `src/server/pagamentos/processar.ts`: máquina de estados da assinatura e da compra a partir dos eventos.
- **NOVO** `src/routes/api/pagamentos/webhook.ts`.
- **NOVO** `src/lib/api/planos.ts`: funções de servidor `meuPlano`, `iniciarCheckout(produto, pagador)`, `cancelarAssinatura`, `pedirReembolso`, `comprarProtetores(pacote)`.
- `src/server/estudo/sincronizar.ts`: evento `resposta` errado de aluno Free baixa a vida; agregado devolve `vidas`, `plano`, `protetores`.
- **NOVO** `src/server/anuncios/recompensa.ts` + `concederVidaDeAnuncio` e `configAnuncios` (unidades, flag, consentimento).
- **NOVO** `src/server/ranking/*` + `entrarNoRanking`, `sairDoRanking`, `meuGrupo`.
- `src/server/tutor/cota.ts`: cota e teto por plano (Free, Basic, Pro), uso justo mensal.
- **NOVO** `src/server/redacao/corretor.ts` (prompt com a rubrica versionada, saída validada por zod), `src/server/estudo/caderno.ts`, `cronograma.ts`, `simulado.ts`.
- `src/server/email/`: modelos de recibo, renovação, falha, cancelamento e reembolso.

**Cliente:**
- **NOVAS** rotas `src/routes/planos.tsx`, `planos.retorno.tsx`, `caderno.tsx`, `simulado.tsx`, `simulado.$id.tsx`, `redacao.corretor.tsx`; reescritas: `ranking.tsx`, `profile.tsx`, `nivelamento.tsx`, `login.tsx`, `offline.tsx`; `premium.tsx` vira redirecionamento. Cada arquivo de rota exporta só `Route` (regra dura 9).
- **NOVOS** componentes: `IndicadorVidas`, `FolhaSemVidas`, `FolhaConsentimentoAnuncio`, `AnuncioIntersticial`/`AnuncioRetangulo`, `CartaoPlano`, `SecaoAssinatura`, `FuncaoFechada`, `ExplicaDeOutroJeito`.
- **NOVO** `src/lib/anuncios/` (adaptador `gam` e `falso`, carregamento sob demanda do GPT).
- `src/lib/store.ts`: cache de `plano`, `vidas` e consentimento (aplicados do agregado do servidor), bloqueio local de resposta sem vida, nivelamento de 30.
- **NOVO** `public/sw.js` + registro em `src/lib/offline/` (só Basic e Pro).
- Landing: `src/marketing/motion/scroll.ts`, `marketing.css`, `boot.ts` conforme a correção que os dados apontarem (F1); **NOVO** `src/lib/diagnostico-rolagem.ts` (só com o parâmetro, só em preview).

## 12. Modelo de dados / migração

Migração aditiva `drizzle/0001_planos.sql` (gerada por `bun run db:generate`, aplicada no `dev` e depois na `production` por `bun run db:migrate`; nunca destrutiva):

| Tabela | Colunas principais | Observação |
|---|---|---|
| `profile` (alterada) | `plano` com check `('gratis','basic','pro')` | Cópia derivada; a fonte é `assinatura` |
| `assinatura` (NOVA) | id, user_id, provedor (`asaas`/`apple`/`google`), origem (`web`/`apple`/`google`), id_externo, produto, estado (`pendente`/`ativa`/`atrasada`/`cancelada`/`reembolsada`/`expirada`), inicio, valido_ate, cancelada_em, reembolsavel_ate | único (provedor, id_externo) |
| `cobranca` (NOVA) | id, user_id, provedor, id_externo, assinatura_id?, compra_id?, valor_centavos, metodo, estado, pago_em, reembolsado_em | único (provedor, id_externo) |
| `cliente_pagamento` (NOVA) | user_id, provedor, id_cliente_externo, declarou_maioridade_em | **sem CPF** |
| `compra` (NOVA) | id, user_id, produto, quantidade, estado, criada_em, creditada_em | id = `externalReference` |
| `evento_pagamento` (NOVA) | provedor, id_evento (PK composta), tipo, recebido_em, processado_em, resultado | idempotência; sem corpo do evento |
| `protetor_credito` (NOVA) | user_id, chave (PK composta), quantidade, motivo (`bonus_plano`/`compra`/`estorno`), local_date | ganhos de 7 dias continuam derivados de `study_day` |
| `vidas_dia` (NOVA) | user_id, local_date (PK), perdidas, ganhas_anuncio (0–1), atualizado_em | limpeza depois de 30 dias |
| `ranking_participante` (NOVA) | user_id (PK), apelido (único, sem diferenciar maiúsculas), maior_desde, entrou_em, saiu_em, oculto_por_denuncia | |
| `ranking_grupo` (NOVA) | semana, user_id (PK composta), grupo | formado na primeira entrada da semana |
| `caderno_item` (NOVA) | user_id, item_id (PK), entrou_em, proxima_revisao, acertos_seguidos, estado | |
| `cronograma` (NOVA) | user_id (PK), dias_semana, minutos_dia, data_prova, versao, gerado_em | |
| `simulado` (NOVA) | id, user_id, tipo, area?, itens (jsonb de ids), iniciado_em, concluido_em, resultado (jsonb) | respostas vão para `attempt` com fonte `simulado` |
| `redacao` (NOVA) | id, user_id, tema, texto, correcao (jsonb), versao_rubrica, criada_em | apagável pelo aluno |
| `ai_budget` (alterada) | chave passa a ser (dia, grupo) com grupo `free`/`pagos` | teto separado (D49-10) |

Testes de migração: `tests/neon` com os novos índices únicos e a concorrência de `vidas_dia` (duas respostas erradas simultâneas baixam 2) e de `evento_pagamento` (dois webhooks iguais simultâneos → um efeito).

## 13. Compatibilidade e rollout

**Flags** (servidor, `env.ts`; padrão desligado em produção): `PAGAMENTOS_HABILITADO`, `VIDAS_HABILITADO`, `ANUNCIOS_HABILITADO` (+ `ANUNCIOS_PROVEDOR=falso|gam`), `RANKING_HABILITADO`, e por função em `src/lib/features.ts` (`caderno`, `cronograma`, `semInternet`, `simulado`, `explicaOutroJeito`, `treinoRedacao`, `corretorRedacao`). Desligar uma flag esconde a função **sem apagar dado**; assinaturas ativas continuam valendo mesmo com `PAGAMENTOS_HABILITADO=false` (só a venda nova para).

**Entregas:**
- **E1** — F1 (rolagem, entrada, perfil), F4 (nivelamento 30), F2 e F3 (planos e checkout no sandbox). Publicável com a venda desligada.
- **E2** — F5 (vidas), F6 (anúncios), F7 (protetores). Vidas e anúncios só ligam juntos com a venda (sem plano pago à venda, vidas seriam punição sem saída).
- **E3** — F8 (ranking) e F9 (funções pagas).

**Ligar dinheiro real** (fora desta iniciativa, por pedido explícito): CNPJ, conta Asaas de produção, Vercel Pro, termos revisados, chave e webhook de produção, primeira venda controlada pelo próprio dono com reembolso ([preparacao.md](preparacao.md), "Pendências pagas").

## 14. Tarefas

Formato: **T-49.F.N — Título (tamanho P/M/G, nível de segurança)**. Aceite e verificação em cada uma; skills pela matriz.

### F0 — Aprovação e preparação (sem código)
- **T-49.0.1 — Aprovação (dono).** Ler a spec e o tutorial; aprovar ou ajustar os valores marcados [proposta]. Aceite: "aprovado" registrado com data.
- **T-49.0.2 — Regras revistas (P).** Na aprovação: nota "aprovada em 02/10/2026" em cada regra afetada (`regras.md`, `contratos.md` C-XP-6, `funcionalidades.md`, `gamificacao-e-som.md`, `privacidade.md`, 48 D48-16, `monetizacao.md`). **O texto novo de cada regra entra quando a entrega que a implementa for publicada** (E1: R-ESC-3, R-MKT-4; E2: R-ESC-7, R-GAM-2 itens 3 e 4, R-GAM-3, R-GAM-5, R-PRIV-3; E3: R-ESC-4, D48-16), para o documento nunca descrever como vigente algo que o app ainda não faz. Aceite: nenhuma regra contradiz a spec sem nota; `bun run docs:check` verde.
- **T-49.0.3 — Preview com banco e sandbox (P, L2).** Variáveis de Preview na Vercel (Neon `dev`, `ASAAS_*` do sandbox, `PAGAMENTOS_HABILITADO=true` só em Preview) e acesso do webhook ao preview ([preparacao.md](preparacao.md), Passos 2, 3 e 5). Aceite: `/api/saude` do preview com `banco: ok`; webhook de teste do Asaas chega ao preview.
- **T-49.0.4 — Checklist do dono conferido (P).** Cada item do [preparacao.md](preparacao.md) marcado como feito ou pendente no registro.

### F1 — Correções de entrada (E1)
- **T-49.1.1 — Diagnóstico da rolagem no Instagram (M).** Overlay `?diagnostico-rolagem=1` (só preview) e E2E de emulação (§5.7). Aceite: logs dos dois aparelhos anexados ao registro, com a hipótese confirmada ou descartada uma a uma.
- **T-49.1.2 — Correção da rolagem (M).** A correção mínima que os dados apontarem. Aceite: §5.7 item 6.
- **T-49.1.3 — "Criar conta" passa pelo quiz; Google novo vai ao quiz (M, L2).** `login.tsx`, guarda de rotas e o retorno do Google. Aceite: RF-14.
- **T-49.1.4 — Perfil com dados da conta (P).** `profile.tsx` lê a sessão; reset só no modo de demonstração; nome editável salvo no servidor. Aceite: RF-15.

### F2 — Fundação dos planos (E1)
- **T-49.2.1 — Catálogo de planos e benefícios (P).** `src/lib/planos.ts` + testes. Aceite: preços e benefícios do §5.1 num único lugar.
- **T-49.2.2 — Migração 0001 (M, L2).** Tabelas do §12. Aceite: aplicada no PGlite e na branch `dev`; `test:neon` verde.
- **T-49.2.3 — Plano derivado no servidor (M, L3).** `planoDoAluno`, plano no agregado e na sessão. Aceite: RF-1.
- **T-49.2.4 — Foca IA por plano e teto separado (M, L2).** `cota.ts`, `env.ts`. Aceite: Free 3, Basic 15+3, Pro 30+8; uso justo mensal; o Free esgotar o teto não derruba os pagantes.
- **T-49.2.5 — Flags (P).** §13.

### F3 — Checkout e assinaturas no sandbox (E1)
- **T-49.3.1 — Adaptador Asaas e provedor falso (M, L3).** Aceite: unitários com `fetch` simulado para cliente, checkout, cobrança, reembolso e cancelamento.
- **T-49.3.2 — Iniciar checkout (M, L3).** Pagador (nome, CPF, e-mail, declaração) → cliente no Asaas (notificações desligadas) → checkout (cartão recorrente para mensal e anual; Pix para anual e pacotes) com `externalReference` interno e URLs de retorno. Aceite: preço só do catálogo; CPF fora de banco e log.
- **T-49.3.3 — Webhook (G, L3).** Eventos: `CHECKOUT_PAID`, `PAYMENT_CONFIRMED` (cartão ativa), `PAYMENT_RECEIVED` (Pix ativa), `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED`, `PAYMENT_CHARGEBACK_REQUESTED`, `PAYMENT_DELETED`, `SUBSCRIPTION_INACTIVATED`/`_DELETED`/`_UPDATED`. Aceite: RF-3.
- **T-49.3.4 — `/planos` e retorno (M).** §6. Aceite: E2E com provedor falso nos três tamanhos; `/premium` redireciona.
- **T-49.3.5 — Gerenciar assinatura (M, L3).** Cancelar, reembolso nos 7 dias, recibos. Aceite: RF-4.
- **T-49.3.6 — E-mails pela Resend (P).** Recibo, renovação (3 dias antes), falha, cancelamento, reembolso. Aceite: unitários da caixa de saída.
- **T-49.3.7 — Ponta a ponta no sandbox (M).** Roteiro do [preparacao.md](preparacao.md), Passo 6 executado no preview: Basic mensal com cartão aprovado, cartão recusado, Pro anual com Pix confirmado pela interface do sandbox, cancelamento e reembolso. Aceite: evidência no registro.
- **T-49.3.8 — Termos, privacidade e landing (P, L2).** Cláusulas de venda, anúncio, vidas e ranking no rascunho (`docs/legal/`), linhas do §9 em `privacidade.md`, controlador ainda pessoa física até o CNPJ; R-MKT-4 aplicada atrás da flag. Aceite: RF-17; nada publicado como versão final sem revisão jurídica.
- **T-49.3.9 — Painel interno de custo e conversão (P).** `scripts/negocio/painel.ts` (§9), pronto antes da primeira venda. Aceite: imprime o painel da semana a partir do banco, sem dado pessoal.

### F4 — Nivelamento de 30 questões (E1)
- **T-49.4.1 — Banco suficiente? (P).** Contar itens elegíveis e revisados por área e matéria. Aceite: tabela no registro; se alguma área tiver menos de 12, parar e registrar a lacuna.
- **T-49.4.2 — 30 fixas, aviso e retomada (M).** `constants.ts`, `placement.ts`, `nivelamento.tsx`; C-NIV (§12) e C-MOD atualizados em `contratos.md`. Aceite: RF-16; unitários da distribuição (9/9/6/6 e redistribuição).

### F5 — Vidas (E2)
- **T-49.5.1 — Vidas no servidor (M, L3).** `vidas_dia`, baixa no evento `resposta`, renovação pelo fuso, saldo no agregado. Aceite: RF-5; concorrência em `tests/neon`.
- **T-49.5.2 — Vidas na interface (M).** Indicador, pausa depois do feedback, folha sem vidas, retomada. Aceite: RF-6; E2E 320/390/1280.
- **T-49.5.3 — Offline e sincronização (M).** Aceite: respostas offline depois de zerar não são apagadas; saldo correto depois de sincronizar.

### F6 — Anúncios (E2)
- **T-49.6.1 — Spike do GPT numa SPA (P).** Com as unidades de exemplo do Google (`/22639388115/rewarded_web_example`, a confirmar na documentação no dia) e a conta de teste do dono: o intersticial dispara no `<Link>` do TanStack? O recompensado funciona no iPhone e no Android? Quais domínios a CSP precisa? Aceite: decisão registrada (intersticial ou retângulo) com evidência.
- **T-49.6.2 — Adaptador e consentimento (M, L3).** `src/lib/anuncios/`, folha de consentimento, `consent`, modo limited ads. Aceite: RF-9; o GPT só é pedido para Free e só depois do consentimento (ou em limited ads).
- **T-49.6.3 — Intersticial ou retângulo na conclusão (M).** Frequência do §5.4. Aceite: RF-8.
- **T-49.6.4 — Recompensado e concessão no servidor (M, L3).** Aceite: RF-7.
- **T-49.6.5 — CSP e privacidade (P, L3).** CSP em Report-Only, depois aplicada; política atualizada. Aceite: nenhum erro de CSP no app; landing sem requisição externa.

### F7 — Protetores (E2)
- **T-49.7.1 — Regra com créditos (M, L2).** `recompensas.ts` com créditos e estoque por plano, igual no app e no servidor. Aceite: unitários (sem créditos = regra antiga; estoque máximo; downgrade mantém o estoque).
- **T-49.7.2 — Bônus do plano (P).** Crédito mensal no aniversário. Aceite: idempotente por mês.
- **T-49.7.3 — Compra avulsa (M, L3).** Pacotes, bloqueio acima do estoque, limite para menor, arrependimento só dos não usados. Aceite: RF-10; E2E com provedor falso.

### F8 — Ranking 18+ (E3)
- **T-49.8.1 — Servidor (M, L3).** Elegibilidade, apelido moderado, grupos semanais, pontuação, denúncia. Aceite: RF-11; isolamento (menor nunca aparece).
- **T-49.8.2 — Interface (M).** Entrada, grupo, sair. Aceite: E2E adulto e menor.
- **T-49.8.3 — Fixture fora do bundle (P).** Aceite: o bundle de produção não contém os nomes fictícios (46 T-10.3).

### F9 — Funções pagas (E3)
- **T-49.9.1 — Caderno de erros (M).**
- **T-49.9.2 — Cronograma até o ENEM (M).**
- **T-49.9.3 — Estudo sem internet (G, L2).** Service worker; B-072.
- **T-49.9.5 — Simulado cronometrado (G).** Pré-condição: itens revisados suficientes (B-040, B-041); se faltar, a tarefa para e registra.
- **T-49.9.6 — "Explica de outro jeito" (P, L2).**
- **T-49.9.7 — Corretor de redação (G, L2).** Pré-condição: rubrica revisada por professor externo.
- **T-49.9.8 — Treino de redação por partes (M, L2).**
Aceite de cada uma: RF-12, E2E da função aberta para o plano certo e fechada para os outros, dados preservados ao cancelar.

### F10 — Fechamento
- **T-49.10.1 — Revisão L3, verificação e registro.** `/security-review` no diff, `spec-verifier` contra RF e G49, registro e `ESTADO.md`.

## 15. Dependências entre tarefas

```text
T-49.0.1 ─┬─ T-49.0.2
          ├─ F1 (independente; pode começar primeiro)
          ├─ F4 (independente; depende só de T-49.4.1)
          └─ T-49.0.3 ─ F2 ─ F3 ─┬─ F5 ─┐
                                 ├─ F6 ─┼─ (E2 liga junto com a venda)
                                 └─ F7 ─┘
                                 F3 ─ F8, F9
T-49.6.1 antes de T-49.6.3/6.4 · T-49.4.1 antes de T-49.4.2 · B-040 antes de T-49.9.5 e T-49.9.7
F10 por último em cada entrega
```

## 16. Critérios de aceite globais

| ID | Critério | Como verificar |
|---|---|---|
| G49-1 | Nenhuma cobrança real; nada pago contratado pelo agente | Registro; variáveis de produção sem `ASAAS_API_KEY` de produção |
| G49-2 | Plano, vidas, protetores, prêmio do anúncio e ranking decididos no servidor | Testes de isolamento e de adulteração do store |
| G49-3 | Anúncio só no Free e só nos lugares permitidos; landing sem requisição externa | E2E RF-8 e `landing.spec.ts:78` |
| G49-4 | Nenhuma oferta com urgência, contagem regressiva ou pressão na sequência | Revisão de copy + E2E sem texto proibido (lista em `brand-voice.test.ts`) |
| G49-5 | Menor nunca aparece no ranking nem vê o ranking | E2E e teste de servidor |
| G49-6 | Cancelar nunca apaga progresso | E2E: assinar → estudar → cancelar → progresso intacto |
| G49-7 | Rolagem da landing no Instagram sem pulo | §5.7 item 6 |
| G49-8 | Gates: tipos, unitários, lint, build, E2E completo, docs:check, `test:neon` | Saída real no registro |
| G49-9 | Revisão L3 sem achado alto aberto | Relatório resumido em `docs/seguranca/auditorias/` |

## 17. Testes

- **Unitários:** catálogo; plano derivado; máquina de estados de assinatura e compra (todos os eventos, fora de ordem, repetidos); adaptador Asaas com `fetch` simulado; vidas (renovação por fuso, "Não sei", plano pago); sequência com créditos; ranking (pontuação, elegibilidade no ano limítrofe, moderação); cota por plano e teto separado; distribuição do nivelamento; corretor (validação da saída).
- **E2E** (com provedor falso de pagamento e de anúncio; projetos `chromium`, `narrow` 320 e `desktop` 1280): planos e retorno; gerenciar assinatura; vidas (zerar, pausar, retomar, anúncio, flashcards livres); consentimento; lugares dos anúncios; protetores; ranking adulto e menor; funções abertas e fechadas; perfil; "Criar conta" → quiz; Google novo → quiz (retorno simulado); nivelamento de 30; rolagem com emulação do Instagram.
- **Integração (`tests/neon`, branch temporária):** migração, unicidade, concorrência de vidas e de webhook.
- **Sandbox (manual guiado, T-49.3.7):** roteiro do [preparacao.md](preparacao.md), Passo 6.
- **Manual em aparelho:** rolagem no Instagram (iPhone e Android); recompensado no celular.

## 18. Edge cases

- Webhook chega antes da volta do checkout, ou nunca chega (o retorno consulta o servidor por até 60 s e depois diz "ainda confirmando; avisamos por e-mail").
- Pix gerado e não pago: compra expira (checkout de 10 a 1.440 min) sem efeito.
- Troca de Basic para Pro no meio do mês: nova assinatura Pro; a Basic é cancelada com crédito proporcional **não** automático na v1 (o suporte resolve) [proposta]; o plano mostrado é o maior válido.
- Duas abas comprando ao mesmo tempo: um checkout por produto por vez por aluno.
- Aluno muda o fuso para ganhar vidas: o fuso só muda uma vez a cada 7 dias.
- Offline com vidas zeradas: segue §5.3.
- Recompensado concedido e o aluno fecha a aba antes da resposta do servidor: o servidor concede pelo pedido que chegou; o aparelho pega no próximo agregado.
- Conta excluída com assinatura ativa: cancela no Asaas antes de apagar; mantém o mínimo fiscal sem vínculo com o estudo.
- Aluno de 17 que faz 18 durante a semana: pode entrar no ranking no dia seguinte à confirmação.
- Apelido igual a outro: recusado com sugestão.
- Nivelamento interrompido no meio: retoma da questão seguinte; sem vidas e sem anúncio.
- Plano pago termina com caderno cheio: caderno fica visível só para leitura.

## 19. Riscos

| Risco | Efeito | Mitigação |
|---|---|---|
| Vidas e anúncios afastam o João | Menos constância, menos conversão | 5 vidas, "Não sei" livre, flashcards livres, sem anúncio no meio da lição; medir vidas zeradas por dia (§9) e revisar em 4 semanas |
| ECA Digital: vidas, sequência e recompensado lidos como "recompensa por tempo de uso" ou pressão (Decreto 12.880 arts. 9º e 10) | Multa de até 10% do faturamento ou R$ 50 milhões | Sem contagem, sem urgência, sem oferta na sequência em risco, opt-in em tudo, configuração protetiva por padrão; **revisão jurídica antes de ligar** (B-033) |
| Microtransação pesa na classificação indicativa (Decreto art. 12 §2º IV) | Classificação mais alta | Limite de compras para menor; registrar na avaliação de conformidade (46 T-11.2) |
| Intersticial do Google não funciona numa SPA | Formato 1 sem receita | Retângulo na tela de conclusão (T-49.6.1) |
| Recompensado sem SSV na web | Abuso de 1 vida/dia | Limite no servidor; aceito |
| Conversão abaixo de 2,5% | Prejuízo crescente com o uso | Gatilho de revisão (§5.2) |
| Custo de IA do Pro pesado | Prejuízo por assinante | Uso justo mensal; teto por plano; painel semanal |
| Anexo V do Simples (software) | Imposto de 15,5% | Contador decide o CNAE antes de vender |
| Banco de nivelamento insuficiente para 30 | Aviso falso ou itens repetidos | T-49.4.1 para e registra |
| Corretor dá nota enganosa | Aluno confia numa estimativa ruim | Rótulo fixo, rubrica revisada por professor, justificativa por trecho |
| Script de anúncio quebra a CSP ou o desempenho | Página lenta ou insegura | Só Free, sob demanda, CSP em Report-Only antes |
| Webhook do sandbox não alcança o preview (proteção da Vercel) | Teste ponta a ponta travado | [preparacao.md](preparacao.md), Passo 2 (bypass de automação ou túnel local) |

## 20. Checklist final

- [ ] Spec aprovada pelo dono (data registrada)
- [ ] [preparacao.md](preparacao.md) conferido (T-49.0.4)
- [ ] Todos os `T-49.*` com evidência
- [ ] Todos os `G49-*` com evidência
- [ ] `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`, `bun run lint`, `bun run docs:check`, `bun run test:neon`
- [ ] Revisão L3 resumida em `docs/seguranca/auditorias/`
- [ ] `registro.md` escrito; `docs/ESTADO.md`, `docs/specs/README.md` e `docs/produto/backlog.md` atualizados
