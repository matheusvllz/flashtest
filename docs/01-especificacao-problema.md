# Spec do Problema (Specify)

Status: ✅ **decidido (21/07) · persona nichada em UMA só (22/07) · linha Flash Test restaurada (20/09/2026)** — Problema **3 (IA, educação e futuro do trabalho)**, no ângulo de **hábito e direção de estudo**. Persona: **João** — 16–19 anos, ensino médio/pré-vestibular, nativo de TikTok/Reels, com conteúdo de sobra (YouTube, cursinho, apostila, MEC Enem de graça) e **sem constância**. Não é falta de material nem de vontade: estudar virou uma tarefa grande demais pra caber num intervalo de aula ou numa fila de ônibus, e ele não sabe o que estudar **agora**. Retrato completo, anamnese, cena e gatilho emocional em **`14-persona-joao.md`**.

Dor nichada: **"não é falta de conteúdo — é falta de constância e de saber onde estou fraco".** Tratamento: **aulas de 60 segundos** (1–2 questões por vez, feedback imediato) com uma **IA que aprende a lacuna de cada aluno e decide a próxima questão**. Produto: **Flash Test** — detalhes em `08-produto-e-estrategia.md`. Concorrente-chave: **MEC Enem** (app do governo, grátis, com conteúdo + correção de redação) — por isso o produto **não compete em conteúdo**, compete em **constância e personalização**.

> **Nota de histórico (20/09/2026).** Entre 23 e 24/07/2026 este arquivo foi reescrito para outra dor — o **Abroad** (estudar no exterior, persona Liz, produto "counselor humano + IA"). Esse pivô foi **revertido**: a linha viva do projeto voltou a ser o Flash Test. A versão Abroad está preservada, íntegra, em `_arquivo-abroad/01-especificacao-problema-abroad.md`.

## O fio condutor comum

Os 3 problemas do guia "Problemáticas conectadas" nascem da mesma força macro: a digitalização acelerada da vida brasileira.

- 83% das transações bancárias no Brasil ocorrem por canais digitais (2025)
- 93% dos brasileiros já usam Pix como meio de pagamento
- 9h13 é o tempo médio diário diante de telas
- R$ 50,1 bi previstos em investimento dos bancos em tecnologia em 2026

Efeito: quem tem letramento digital ganha autonomia; quem não tem fica vulnerável; quem está se formando agora precisa acompanhar uma tecnologia que muda mais rápido que o currículo.

## As 3 opções

### 1. Envelhecimento e autonomia digital
*"A vida migrou para telas mais rápido do que a autonomia para usá-las."*

- 15,6% da população tinha 60+ em 2023 (era 8,7% em 2000); 33 mi de idosos em 2023 (dobro de 2000); projeção IBGE de 37,8% em 2070.
- Uso de internet por 60+ cresceu 25 p.p. entre 2019–2024 (PNAD TIC); 87,9% dos idosos que usam internet acessam todo dia.
- Acesso ≠ letramento/confiança/autonomia digital (estudo SciELO).
- Personas candidatas: **idoso autônomo** (usa smartphone mas teme Pix/links de banco), **família cuidadora** (resolve burocracia digital dos pais/avós pelo WhatsApp), **prestador de serviço** (farmácia/banco/clínica atendendo públicos com fluência digital desigual).
- Provocações do guia: qual serviço digital específico (bancário, saúde, documentos, comunicação, compras)? Produto para o idoso usar sozinho ou para a família usar em nome dele? Como a IA reduz a distância sem substituir a relação humana? B2C, B2B ou B2G?

### 2. Golpes digitais e crise de confiança
*"A mesma facilidade que conecta bilhões de transações abre a porta para milhões de fraudes."*

- 24% dos brasileiros (16+) foram vítimas de golpe digital nos últimos 12 meses (~40,85 mi de pessoas — DataSenado).
- Estelionato cresceu 408% entre 2018–2024; ~4 golpes/minuto em 2024 (2,2 mi casos).
- 1º sem. 2025: falsa venda 174 mil casos (+314%); falsa central/falso funcionário 139 mil (+195,7%); golpe do WhatsApp 73 mil ocorrências (Febraban).
- Custo médio de uma violação de dados no Brasil: R$ 7,19 mi em 2025 (+6,5% vs. 2024 — IBM).
- Personas candidatas: **pessoa comum** (recebe mensagens suspeitas todo dia, perdeu a referência do que é verdadeiro), **pequeno negócio** (sofre falsa venda/chargeback sem estrutura de segurança), **instituição** (banco/escola/clínica/órgão público que precisa proteger clientes).
- Provocações do guia: atuar antes (prevenção/educação), durante (detecção em tempo real) ou depois (recuperação/suporte à vítima)? Pessoa física, pequeno negócio ou instituição? Como a IA detecta padrão de fraude sem gerar falso positivo em excesso? Como reconstruir confiança (a dor é emocional, não só financeira)?

### 3. IA, educação e futuro do trabalho
*"A tecnologia que aprende a aprender chega antes do currículo, do gestor e da regulação."*

- 59% das crianças/adolescentes usam IA generativa para pesquisa escolar; 68% entre 15–17 anos usam IA para estudar (TIC Kids Online 2025).
- 37% dos estudantes e 43% dos professores já usam IA generativa, mais no ensino médio (TIC Educação 2024).
- UNESCO: a dinâmica pedagógica deixa de ser professor-estudante e passa a ser professor-IA-estudante; poucos países têm programa nacional de formação docente para isso.
- Mercado de trabalho até 2030 (WEF Future of Jobs 2025): 22% dos empregos afetados por tendências estruturais, 170 mi de vagas criadas, 92 mi deslocadas, ~40% das competências mudam, 63% dos empregadores veem lacuna de habilidades como barreira.
- OIT: IA tende mais a complementar/transformar ocupações do que destruí-las; efeito maior é na qualidade, intensidade e autonomia do trabalho.
- Personas candidatas: **estudante** (usa IA pra tudo e não sabe mais o que aprendeu de verdade), **professor** (precisa avaliar/orientar sem virar "polícia de detecção de IA"), **gestor de RH** (precisa contratar/treinar/reter num mercado que muda a cada 18 meses).
- Provocações do guia: atuar em aprendizagem, avaliação, orientação vocacional, formação profissional ou reconversão de carreira? A solução usa IA para ensinar sobre IA, ou usa IA para ensinar outra coisa? Como medir aprendizado real quando a resposta está a um prompt de distância? Atacar pelo lado da instituição, do indivíduo ou de uma camada intermediária (professores/gestores)?

## Critério de decisão sugerido (do próprio guia)

> "Escolha o problema que você escutaria com atenção mesmo sem estar num programa. O que você já viu acontecer com alguém próximo? Onde você sente que existe uma dor real que ninguém está resolvendo bem?"

Na prática, eu sugiro decidir cruzando 3 filtros:
1. **Energia real** — qual dor o grupo tem curiosidade genuína de investigar (vai sustentar o ritmo até sexta)?
2. **Nicho acessível** — qual persona vocês conseguem realmente ouvir/entrevistar nesta semana (mesmo que informalmente)?
3. **IA de verdade** — em qual dos 3 é mais fácil desenhar uma solução onde a IA resolve algo estrutural, não decorativo?

## Template a preencher após a decisão

```
Problema escolhido: 3 — IA, educação e futuro do trabalho
Ângulo: hábito e direção de estudo (não "mais conteúdo")
Data da decisão: 21/07 (problema) · 22/07 (nicho em 1 persona)
Persona final: João — 16-19 anos, ensino médio/pré-vestibular, nativo de TikTok/Reels,
   com acesso de sobra a conteúdo e nenhuma constância. Ver `14-persona-joao.md`.
Dor específica (nichada): ele já tem YouTube, cursinho, apostila e o MEC Enem de graça.
   O que falta não é material — é sentar todo dia e saber exatamente o que estudar naquele
   momento. Começa forte na segunda, sai da rotina na quarta, na sexta já está vendo outra
   coisa. Falta CONSTÂNCIA (o hábito não gruda) e DIREÇÃO (não sabe onde está fraco).
Momento/ângulo de atuação: hábito + roteamento de conteúdo (B2C, low ticket/freemium) —
   dar o empurrão diário e a próxima questão certa, não mais uma biblioteca de aulas.
Solução em uma linha: aulas de 60 segundos (1-2 questões), feedback imediato, e uma IA que
   aprende o que o aluno erra pra decidir a próxima questão e explicar o erro na hora.
Dado principal de sustentação: 9h13 é o tempo médio diário diante de telas no Brasil; 68%
   dos jovens de 15-17 anos já usam IA para estudar e 59% das crianças/adolescentes usam IA
   generativa para pesquisa escolar (TIC Kids Online 2025); 37% dos estudantes e 43% dos
   professores já usam IA generativa (TIC Educação 2024).
Por que escolhemos: dor universal na persona, IA com papel estrutural (roteamento +
   diagnóstico + explicação do erro, não chatbot decorativo), e um incumbente GRÁTIS
   (MEC Enem) que prova que conteúdo não é o gargalo — o gargalo é a constância.
```

## Perguntas em aberto

- [x] Qual problema? → 3 (IA/educação), ângulo hábito e direção de estudo
- [x] Qual persona nichada dentro dele? → João (`14-persona-joao.md`)
- [ ] Ouvir 5–10 alunos de pré-vestibular reais e transcrever as falas — Pesquisa/Validação segue sem dono (`08` Seção 8)
- [ ] Fechar a curadoria das questões reais de vestibular (caminho crítico do protótipo — `08` Seção 8)
