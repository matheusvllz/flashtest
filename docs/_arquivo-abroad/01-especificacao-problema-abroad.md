# Spec do Problema (Specify)

Status: ✅ **decidido (21/07), persona nichada em UMA só (22/07), 🔴 PIVÔ DE DOR EM DEFINITIVO (23/07), 🎯 AFINADO PELO COUNSELOR (23/07, tarde)** — Problema **3 (IA, educação e futuro do trabalho)** continua sendo o guarda-chuva, mas o ângulo mudou de **hábito de estudo (ENEM)** para **acesso e orientação à educação internacional**. Persona: **Liz** — 16–18 anos, **escola particular, renda familiar alta, tempo livre e hábito de estudo já formado** (tem tudo que deveria bastar), que quer **estudar no exterior e não sabe como nem por onde começar**. Não é falta de capacidade, dinheiro, tempo ou vontade; são **duas dores coladas**: falta de **MAPA** (não sabe o processo — quais provas, vistos, prazos, universidades, custos, nem em que ordem) e falta de **ORQUESTRAÇÃO** (aplicar é um projeto de 12–24 meses com ~13 frentes paralelas, hoje espalhado sem sistema). Retrato completo, anamnese, cena e gatilho emocional em **`14-persona-liz.md`**.

> **🎯 A causa-raiz, nomeada com precisão (afinamento de 23/07): a escola da Liz não oferece um _counselor_.** Nas escolas de elite lá fora (e nas internacionais no Brasil), todo aluno tem um **college counselor** — o orientador que abre a caixa-preta da aplicação internacional, lê o perfil, aponta as lacunas e diz o caminho. A escola particular brasileira comum **não oferece isso** — prepara pro vestibular/ENEM, não pra Common App, SAT, TOEFL, bolsa lá fora. A dor da Liz é, na raiz, **a ausência do counselor**: sem ele, o processo vira caixa-preta (falta de MAPA) e projeto de 2 anos sem ninguém segurando (falta de ORQUESTRAÇÃO). Isso reposiciona o produto de "mais uma plataforma" para **"o counselor que a sua escola não te deu"** — um papel concreto, reconhecível, que existe lá fora e falta aqui.

Dor nichada: **"não é falta de recurso — é a falta de um _counselor_, o orientador que abre um processo opaco e segura o projeto até o fim".** Tratamento (afinado 23/07): **um counselor de verdade para cada aluno, potencializado por IA.** A IA faz a anamnese, pontua/ranqueia o perfil (portfólio, documentação, prontidão de provas — TOEFL/SAT) e prepara o diagnóstico; o **counselor humano** lê esse diagnóstico, valida, personaliza o caminho e acompanha — e como a IA fez o trabalho pesado, **um counselor atende ~30 alunos/dia** em vez de poucos 1-a-1. É o que torna acessível o que só a elite tinha. Produto: **plataforma que dá um counselor (humano + IA) e centraliza a jornada de estudar fora**. Detalhes em `08-produto-e-estrategia.md`. Concorrente-chave: **consultorias de admissão (R$ 20–100 mil)** de um lado e **informação fragmentada grátis** (YouTube/fórum/EducationUSA) do outro — o produto é o meio-termo que não existe: **um counselor personalizado, por uma fração do preço.**

> **A persona anterior (João, aluno de ENEM sem constância) foi arquivada** em `14-persona-joao.md`. Ignorar toda referência a "constância", "aulas de 60s", "Flash Test" e "MEC" nesta fase — pertencem à dor antiga.

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
Ângulo (23/07, pós-pivô): acesso e ORIENTAÇÃO à educação internacional (não hábito de estudo)
Data da decisão: 21/07 (problema) · 22/07 (nicho em 1 persona) · 23/07 (PIVÔ de dor: Liz)
Persona final: Liz — 16-18 anos, escola particular, renda alta, tempo livre e hábito de
   estudo já formado. Ver `14-persona-liz.md`.
Dor específica (nichada): ela quer estudar fora e tem todos os recursos, mas não sabe por
   onde começar — nem quais provas, vistos, universidades, custos, nem em que ordem. Toda
   pesquisa termina em 14 abas e "é complicado demais, depois eu vejo". Falta MAPA (não sabe
   o processo) e ORQUESTRAÇÃO (um projeto de 1-2 anos com ~13 frentes, sem sistema).
Momento/ângulo de atuação: orientação/acesso (B2C premium) — dar o COUNSELOR que a escola
   não deu: abrir a caixa-preta e orquestrar o processo, não hábito nem conteúdo.
Solução em uma linha: um counselor de verdade pra cada aluno, potencializado por IA (a IA
   diagnostica e ranqueia o perfil; o counselor humano valida e guia; 1 counselor atende ~30
   alunos/dia porque a IA fez o trabalho pesado).
Dado principal de sustentação (Pesquisa confirma): o mercado de consultorias de admissão
   que cobra R$ 20-100 mil é a prova de que a dor move dinheiro; nº crescente de brasileiros
   buscando graduação/intercâmbio no exterior; % de escolas particulares BR sem college
   counselor. (Puxar 2-3 números com fonte antes do pitch.)
Por que escolhemos (vs. a dor anterior): dor com causa raiz clara e nomeável (não existe
   counselor na escola dela), persona que PODE PAGAR (negócio premium, não low ticket),
   incumbente caro a deslocar, e IA que resolve algo estrutural (diagnóstico + ranking +
   orquestração confiável) AMPLIANDO um humano — não fingindo substituí-lo.
```

## Perguntas em aberto

- [x] Qual problema? → 3 (IA/educação), ângulo acesso/orientação internacional
- [x] Qual persona nichada dentro dele? → Liz (`14-persona-liz.md`) — João arquivado
- [ ] Alguém do grupo tem proximidade real com essa dor (família, colega que estuda/estudou fora)?
- [ ] Objetivo desta pivô: pitch de sexta OU evoluir como venture além do Pre College? (define o plano — ver `08` Seção 9)
