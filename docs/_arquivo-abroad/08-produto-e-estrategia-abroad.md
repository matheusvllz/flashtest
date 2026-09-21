# 08 — Produto & Estratégia (Plataforma de aplicação para estudar no exterior)

Status: 🟢 **pivô aplicado (23/07) · 🎯 afinado pelo counselor (23/07, tarde)** — o projeto trocou de dor em definitivo. Sai o app de estudo ENEM (Flash Test); entra **um _counselor_ (orientador de admissão internacional) para cada aluno, potencializado por IA**, dentro de uma **plataforma que centraliza toda a jornada de quem quer estudar no exterior**, para a persona **Liz** (`14-persona-liz.md`). **Nome definido: Abroad (23/07)**; design system entregue (`Abroad Design System.html`). Pitch continua sendo uma **landing page de 3 min** terminando em "ver demonstração". Ver Seção 0 (avisos) e Seção 7 (MVP).
Data: 23/07/2026 · autor: sócio (Claude)

> **🎯 Afinação de 23/07 (tarde) — a tese central agora tem nome: o _counselor_.** Fonte: transcrição de áudio do fundador. A causa-raiz da dor da Liz é que **a escola dela não oferece um college counselor** (papel que existe nas escolas de elite/internacionais e falta na escola particular BR comum). O Abroad **dá esse counselor** — humano, potencializado por IA. **A IA não substitui o counselor; ela o amplia:** faz a anamnese, pontua/ranqueia o perfil (portfólio, documentação 0–10, prontidão de provas TOEFL/SAT), aponta lacunas e monta o diagnóstico; o **counselor humano** valida, personaliza o caminho e acompanha; e porque a IA fez o trabalho pesado, **um counselor atende ~30 alunos/dia** em vez de poucos 1-a-1 — é isso que torna acessível o que só a elite tinha. Onde este arquivo dizia "a IA faz o papel do consultor", leia **"a IA amplia o counselor"**. Impactos propagados: definição de produto (Seção 1), estratégia de IA (Seção 6), diferenciação (Seção 10), modelo de negócio (Seção 11) e time (Seção 8).

> Este arquivo é a fonte de verdade do produto. Fecha `01` (problema) e `02` (plano de solução), e alimenta `04` (pitch). Leia junto com `14-persona-liz.md` (a pessoa), `15-guia-de-copy` (a voz) e `07-insumos-aulas.md` (frameworks).

> **Herança da fase anterior:** os arquivos `09`–`13` descrevem o produto/protótipo ANTIGO (Flash Test / ENEM) e **não** foram reescritos nesta rodada. Não use conteúdo de produto deles como referência para o novo escopo — use este `08`. Eles serão refeitos junto com a nova marca.

---

## 0. Aviso de sócio (leia antes de tudo)

Quatro coisas que eu, como sócio, coloco na mesa **antes** de vocês se apaixonarem pela ideia:

1. **O maior risco NÃO é técnico — é precisão de informação de altíssimo risco.** Diferente do produto anterior (onde errar não machucava ninguém), aqui **um prazo de aplicação errado, um requisito de visto desatualizado ou uma recomendação de prova equivocada pode custar à Liz um ano — ou o sonho inteiro.** Todo o desenho abaixo assume isto: dado de **fonte oficial datada**, "confirme na fonte oficial" nos itens críticos (visto, prazos, requisitos), e humano no circuito onde o erro é caro. Se o pitch de vocês tratar a IA como oráculo infalível de prazos, a banca (com razão) derruba. A confiabilidade é diferencial, não detalhe.

2. **O concorrente não é de graça — é caro e exclusivo, e isso é uma boa notícia.** Quem resolve isso hoje são as **consultorias de admissão internacional (R$ 20 mil a R$ 100 mil+)** — inacessíveis pra maioria — ou a **informação fragmentada e grátis** (YouTube, fórum, EducationUSA, sites de universidade) — que ninguém consegue montar em um caminho confiável sozinho. Não existe o meio-termo: personalizado como a consultoria, acessível como a internet. **Esse vão é o produto.** Isso também significa que a Liz **pode e vai pagar** (renda alta) — o negócio é premium, não low ticket (o oposto do João). Ver Seção 11.

3. **"Isso não é só ChatGPT + Google?" vai ser a primeira pergunta da banca.** Tenham a resposta pronta e no centro do pitch: ChatGPT **alucina prazo e requisito** e **não guarda estado**; Google é **fragmentado e genérico**. O valor é um **processo personalizado, confiável e orquestrado** de um projeto de 12–24 meses, com um co-piloto que lembra prazos e recalibra a rota. Nenhum dos dois faz isso. Ver Seção 10.

4. **Escopo é o inimigo — de novo, e pior.** São **13 módulos** na visão completa (Seção 1). É impossível construir os 13 de verdade no prazo. O trabalho de sócio aqui é **escolher 2–3 módulos-herói pro MVP** que provam a tese e cabem na demo, e deixar os outros 10 como visão/mock. Ver Seção 7. Quem tentar mostrar os 13 funcionando entrega 13 coisas rasas e zero "wow".

---

## 1. Definição do produto

**O que é:** **um _counselor_ (orientador de admissão internacional) para cada aluno, potencializado por IA**, dentro de uma plataforma (mobile-first + web) que **centraliza, num único ambiente, toda a jornada de quem quer estudar no exterior** — do diagnóstico de perfil até a orientação de visto. A **IA** faz a anamnese, pontua/ranqueia o perfil daquele aluno, aponta lacunas, recomenda universidades realistas e orquestra as dezenas de tarefas ao longo de 1–2 anos, dizendo sempre **qual é o próximo passo e por quê**; o **counselor humano** lê o diagnóstico pronto, valida, personaliza e acompanha nos momentos de julgamento. É o counselor que as escolas de elite dão a cada aluno — e que a escola particular brasileira comum não oferece — agora acessível porque a IA faz um counselor render por ~30 alunos/dia.

**Os 13 módulos da visão completa** (o que a plataforma centraliza):

| # | Módulo | Resolve qual dor | O que faz |
|---|---|---|---|
| 1 | **Diagnóstico de perfil** | Mapa | Lê notas, interesses, objetivo e orçamento e devolve um retrato do candidato |
| 2 | **Pontos fortes e lacunas** | Mapa | Aponta o que já pesa a favor e o que falta construir pra chegar no alvo |
| 3 | **Recomendação de universidades** | Mapa | Match perfil × requisito × custo × chance real de admissão |
| 4 | **Comparação de custos e requisitos** | Mapa | Lado a lado de mensalidade, custo de vida, provas exigidas, prazos |
| 5 | **Planejamento de tarefas** | Orquestração | Transforma o processo num cronograma de tarefas com prazos |
| 6 | **Controle de documentos** | Orquestração | Checklist e cofre do que precisa reunir (histórico, cartas, passaporte…) |
| 7 | **Busca de bolsas** | Mapa + Orquestração | Encontra bolsas compatíveis com o perfil e acompanha prazos |
| 8 | **Construção de currículo** | Execução | Monta o currículo/CV no padrão que universidades estrangeiras esperam |
| 9 | **Mentoria para redações** | Execução | Orienta a redação de admissão (essay/personal statement) competência a competência |
| 10 | **Projetos extracurriculares** | Execução | Ajuda a planejar/registrar atividades que fortalecem a aplicação |
| 11 | **Preparação para entrevistas** | Execução | Simula e treina a entrevista de admissão/visto |
| 12 | **Planejamento financeiro** | Mapa | Estima o custo total e monta o plano de como financiar (bolsa + família) |
| 13 | **Orientação para visto** | Mapa + Orquestração | Guia o processo de visto de estudante, com prazos e documentos |

Os 13 penduram nas **duas dores da anamnese** (`14-persona-liz.md`, Seção 4): **MAPA** (não sabe o processo) e **ORQUESTRAÇÃO** (não consegue segurar um projeto de 2 anos com 13 frentes). Nenhum módulo entra se não servir a uma das duas.

**Para quem é:** **Liz** (persona única, ver `14-persona-liz.md`) — 16–18 anos, escola particular, **renda familiar alta, tempo livre e hábito de estudo** (tem tudo que deveria bastar), que quer estudar fora e **não sabe por onde começar**: quais provas, qual visto, quais universidades, quanto custa, se há bolsa, o que estudar, em que ordem. Toda noite de pesquisa termina em 14 abas abertas e "é complicado demais, depois eu vejo".

**Qual problema resolve — e por que é o problema certo:** o problema real de Liz **não é falta de capacidade, de dinheiro, de tempo ou de vontade** — é falta de **mapa** e de **orquestração** de um processo **opaco e fragmentado.** Existe informação infinita; o que falta é um **caminho ordenado, confiável e personalizado**, e um sistema que segure o projeto inteiro até o fim. Todo concorrente ou é caro demais (consultoria) ou genérico demais (internet). Ninguém resolve bem "me diga meu próximo passo e segure o processo comigo".

**Por que é relevante (dado — confirmar com Pesquisa antes do pitch):** o próprio mercado de consultorias de admissão que cobram dezenas de milhares de reais é a prova de que a dor **move dinheiro**; o número de brasileiros que buscam graduação/intercâmbio no exterior é crescente. *(Ação de Pesquisa: puxar 2–3 números com fonte — volume de estudantes brasileiros no exterior, ticket médio de consultoria, crescimento do segmento. Não inventar TAM sem lastro.)*

**Proposta de valor:**
> Para o jovem que quer estudar fora, tem os recursos, mas se afoga num processo opaco e não sabe por onde começar — na raiz, porque a escola dele nunca ofereceu um counselor,
> o **Abroad** dá um **counselor** (orientador de admissão internacional) para cada aluno, potencializado por IA, dentro de uma plataforma que centraliza toda a jornada num só lugar
> — a IA faz a anamnese, pontua o perfil e monta o mapa; o counselor humano valida e diz o próximo passo, da escolha da universidade ao visto —
> diferente de consultorias caríssimas (inacessíveis) e da informação solta na internet (fragmentada e não confiável),
> porque entrega o que só a elite tinha — um counselor personalizado — por uma fração do preço, já que a IA faz um counselor atender ~30 alunos/dia.

**Frase de posicionamento (a mais curta):**
> **"Estudar fora não é pra quem tem contato. É pra quem tem um counselor."**
> *(variante mantida como sub-mensagem: "…é pra quem tem um plano." — usar a de "counselor" quando o público entende o termo; a de "plano" no primeiro contato mais frio. Ver `15`.)*

**Nome:** **Abroad** (definido 23/07). Design system entregue (`Abroad Design System.html`, raiz do projeto) — o "A" em serifa orbitado por um avião, Navy/Bordô/Gold/Cream, Cormorant Garamond + Space Grotesk + Space Mono. A própria marca já se define como "mentoria para estudar no exterior" — coerente com o counselor.

**Por que Liz escolheria isso em vez das alternativas:** a consultoria custa R$ 20–100 mil e é engessada; a internet é grátis mas fragmentada, genérica e não confiável (e o ChatGPT alucina prazo). O Abroad é o meio-termo que não existe — personalizado, confiável, ordenado e acessível.

---

## 2. Experiência do usuário (jornada completa)

**Entrada / primeiro acesso (0–30s):** Liz abre a plataforma pela primeira vez, vinda de um anúncio ou indicação. Sem formulário longo — cai direto no **diagnóstico de perfil**, embalado como "vamos montar seu mapa", não como cadastro chato.

**Diagnóstico de perfil — "o quiz que monta seu mapa" (2–3 min):** uma sequência de perguntas rápidas (formato conversa, uma por tela) que capta: objetivo (país/área de interesse), momento escolar (ano/notas), nível de inglês, orçamento/apetite de bolsa, e o que ela já sabe/tem. Ela acha que está "criando o perfil"; a IA já está calibrando o diagnóstico, as lacunas e a primeira recomendação de universidades. Zero formulário burocrático.

**Aha Moment (aos ~3 min) — o equivalente ao "mapa de lacunas" do João, agora pra estudar fora:** ao fim do diagnóstico, uma tela que abre a caixa-preta pela primeira vez:
> *"Pronto. Com o seu perfil, pra [objetivo dela] o seu caminho tem 5 grandes etapas. Você está na etapa 1. Seu próximo passo, hoje, é: [ex.: agendar o teste de inglês]. Três universidades realistas pro seu perfil e bolso: [A, B, C]. E aqui está o que cada uma exige e custa."*
**O aha é:** "em 3 minutos, esse app transformou 14 abas de confusão num caminho com um primeiro passo claro — e me disse que é possível pra mim." Esse é o momento de valor percebido antes de qualquer paywall.

**O ambiente único (o dia a dia da jornada):** depois do diagnóstico, Liz entra no **painel que centraliza tudo** — as etapas do processo, as tarefas com prazo, os documentos, as universidades salvas, as bolsas compatíveis, o progresso das redações. É o oposto das 14 abas: um lugar só que **mostra onde ela está, o que vem agora e o que está atrasado.**

**O próximo passo sempre visível (o coração da orquestração):** em qualquer momento, a plataforma responde a única pergunta que paralisa Liz — *"o que eu faço agora?"* — com **um** próximo passo priorizado (não uma lista de 40 coisas), explicando por que é esse. A IA prioriza por proximidade de prazo × impacto na aplicação × pré-requisito.

**A IA como co-piloto (contínua, sempre à mão):** um assistente sempre acessível que (a) responde dúvidas do processo puxando o perfil dela ("preciso de SAT pra essas 3?"), (b) mentora a redação de admissão, (c) explica requisito/visto **sempre com a fonte oficial datada e um "confirme aqui"**, e (d) recalibra o plano quando algo muda (nota nova, prazo alterado, universidade adicionada). A IA é a mão que monta o mapa e prioriza — o co-piloto é a interface visível dela.

**Progressão:** o painel mostra as etapas do processo se preenchendo, tarefas concluídas, redações evoluindo, universidades com status de aplicação. A prova visível de que o projeto **está andando** é o antídoto contra o "depois eu vejo".

**Nota de sócio sobre confiabilidade na jornada:** todo item crítico (prazo, requisito, regra de visto) aparece com **data da informação + link pra fonte oficial + aviso pra confirmar**. Isso não é burocracia — é o que separa o Abroad do ChatGPT que chuta. Mostrar isso na demo é ponto forte, não fraqueza.

---

## 3. Arquitetura do produto (telas) — avaliada criticamente

Não construir os 13 módulos. Cortar pro essencial que prova a tese e cabe na demo:

| Tela / módulo | Entra no MVP? | Por quê |
|---|---|---|
| **Diagnóstico de perfil (quiz → mapa)** | ✅ núcleo | É onde mora o aha. Prova "isso me conhece" em 3 min. |
| **Tela do aha: caminho + próximo passo + 3 universidades** | ✅ núcleo | O "wow": a caixa-preta virando caminho ordenado. |
| **Painel único da jornada (etapas + tarefas + prazos)** | ✅ | A prova visível da orquestração (vs. 14 abas). |
| **Recomendação de universidades + comparação de custo/requisito** | ✅ (versão simples) | Diferencial concreto e reconhecível; alimenta o aha. |
| **Co-piloto de IA (dúvidas + próximo passo + fonte oficial)** | ✅ versão simples | O wow de IA ao vivo + o diferencial de confiabilidade. |
| **Mentoria de redação (essay)** | 🟡 1 exemplo na demo | Módulo forte; mostrar 1 interação, não construir o motor completo. |
| **Busca de bolsas** | 🟡 mock | Mostrar como saída da IA; não construir o crawler agora. |
| **Controle de documentos / checklist** | 🟡 mock | Mostrar a tela; não precisa persistir de verdade. |
| **Currículo / extracurriculares / entrevista / financeiro / visto** | 🟡 visão/mock | Aparecem no painel como etapas; um ou dois com tela ilustrativa. |
| **Cadastro/login real** | ❌ cortar | A tela de "criar perfil" existe (é o diagnóstico); autenticação real, não. |

**Regra:** ~4–5 telas precisam **funcionar de verdade** (diagnóstico, tela do aha, painel da jornada, recomendação/comparação de universidades, co-piloto com 1 chamada de IA ao vivo). O resto é mock ou visão. **Um módulo-herói de execução** (mentoria de redação OU busca de bolsas) mostrado em profundidade vale mais que os 13 rasos.

---

## 4. O processo, concretamente (o que a plataforma ordena)

O núcleo de valor é transformar a névoa num **caminho com etapas e sequência.** Uma versão de referência do caminho (a IA personaliza por perfil/país):

1. **Definir alvo** — país(es), área, nível (graduação), apetite de bolsa e orçamento.
2. **Diagnóstico** — perfil acadêmico, nível de inglês, pontos fortes e lacunas vs. o alvo.
3. **Provas** — descobrir e agendar o que o alvo exige (ex.: SAT/ACT, TOEFL/IELTS/Duolingo English Test) — *com prazo e fonte oficial.*
4. **Lista de universidades** — reach / match / safety, com custo, requisito e chance realista.
5. **Bolsas & financeiro** — bolsas compatíveis + plano de como pagar o resto.
6. **Aplicação** — redação(ões) de admissão, currículo, cartas de recomendação, extracurriculares, documentos.
7. **Envio & prazos** — montar e enviar cada aplicação dentro do prazo (early/regular).
8. **Entrevista** — preparar, se houver.
9. **Visto & pós-admissão** — visto de estudante, moradia, chegada — *item crítico, sempre com fonte oficial.*

**Diferença de "pesquisar no Google" (frase pro pitch):** "O Google te dá 2 milhões de resultados na ordem que ele quer. O Abroad te dá **o próximo passo** — o seu, agora — e segura o processo inteiro até você embarcar."

**Mecânica concreta da orquestração:**
- **Caminho adaptativo, não checklist fixo.** A sequência se recalcula pelo perfil (país, prazo, o que já está pronto), não é a mesma lista pra todo mundo.
- **Priorização por prazo × impacto × pré-requisito:** o "próximo passo" é sempre o de maior valor agora, não o próximo da lista.
- **Prazos vivos:** provas, bolsas e aplicações têm data; a plataforma avisa o que está próximo e o que atrasou.
- **Confiabilidade embutida:** itens críticos com fonte oficial datada + "confirme aqui". A IA acelera; a fonte oficial decide nos itens que matam a aplicação.

---

## 5. Módulo-herói de execução — a Mentoria de Redação (candidato a diferencial da demo)

**Insight de posicionamento:** a redação de admissão (personal statement / essay) é onde a maioria dos candidatos brasileiros mais se perde — não existe equivalente no vestibular, é cultural, e é decisiva. Consultorias cobram caro exatamente por isso. É território de alto valor e reconhecível.

**Mecânica principal:** a IA orienta a redação **por partes/competências** (encontrar o tema pessoal, estruturar, mostrar em vez de contar, revisar tom) — não "escreve por ela" (isso seria desonesto e detectável), mas atua como o mentor que só quem paga consultoria tinha. Feedback específico, competência a competência.

**Por que IA e não regra fixa:** avaliar se um relato pessoal é **autêntico, específico e alinhado ao que aquela universidade valoriza** depende de compreensão semântica — regra fixa não faz; é exatamente onde o LLM agrega. *Guardrail:* o produto **orienta e revisa**, deixando claro que o texto é dela — tanto por ética quanto porque universidades penalizam texto de IA.

**Alternativa de módulo-herói:** se o time preferir, **busca de bolsas** é o outro forte candidato (alto valor percebido, "quanto disso eu consigo de graça?"). Escolher **um** dos dois pra mostrar em profundidade na demo.

---

## 6. IA — estratégia em 3 horizontes

> **Enquadramento (afinação 23/07): a IA amplia o counselor, não o substitui.** Dois beneficiários da mesma IA: (a) **a Liz** — co-piloto sempre à mão que diagnostica, prioriza e mentora; (b) **o counselor** — que recebe da IA o perfil já pontuado/ranqueado de cada aluno e por isso atende ~30/dia. O "wow de IA" da demo é o lado da Liz (anamnese → score → mapa em 3 min); o "wow de negócio" é o lado do counselor (a fila de 30 alunos pré-diagnosticada — ver Seção 11 e o **counselor cockpit** em `18`/`21`).

Para cada item: *por que precisa de IA e não de regra tradicional*, e *o que acontece se errar* (crítico neste produto).

### MVP / PITCH (dá pra fazer no prazo e impressiona)
- **Diagnóstico de perfil → mapa + próximo passo** — a IA lê as respostas (objetivo, notas, inglês, orçamento) e devolve diagnóstico, lacunas e **o próximo passo priorizado**, em linguagem humana. *Por que IA:* transformar "notas X + objetivo Y + orçamento Z" em "seu caminho tem 5 etapas, você está na 1, faça isto agora" é interpretação, não cálculo fixo. **É o wow de IA mais convincente da demo.** *Se errar:* recomendação é sugestão revisável, não decisão irreversível — e itens de prazo/requisito vêm com fonte oficial.
- **Recomendação de universidades (match)** — a IA cruza perfil × requisito × custo × chance realista e sugere reach/match/safety. *Por que IA:* é ranqueamento personalizado multivariável, não filtro de planilha. *Se errar:* sempre mostrar o porquê + deixar Liz ajustar; nunca prometer admissão.
- **Co-piloto que responde dúvidas do processo** — puxa o perfil dela pra responder "preciso de SAT?", "qual o prazo?", "tem bolsa pra brasileiro?". *Por que IA:* resposta personalizada ao caso dela, não FAQ genérico. *Se errar (itens críticos):* **fonte oficial datada + "confirme aqui"** — a IA aponta, a fonte confirma.
- **Mentoria de redação (1 interação na demo)** — feedback específico numa parte da redação. *Por que IA:* avaliar autenticidade/alinhamento é semântico. *Se errar:* é orientação, ela decide.

### VERSÃO 1 (pós-lançamento)
- Busca de bolsas ativa (crawler + match) com acompanhamento de prazo.
- Controle de documentos com lembretes e validação de checklist por universidade.
- Planejamento financeiro dinâmico (custo total × bolsa × plano de pagamento).
- Preparação de entrevista com simulação por voz.

### VISÃO FUTURA (moat de verdade)
- **Motor de recomendação que melhora com dados de milhares de aplicações** — quando muitos alunos aplicam, o sistema aprende **quais perfis entram em quais universidades com quais bolsas**, calibrando "chance realista" com dado real, não estimativa. *Isto é o moat:* não é copiável só olhando a UI; depende de dados que só acumulam com uso.
- Alertas proativos de mudança de prazo/requisito/regra de visto (monitoramento das fontes oficiais).
- Comunidade/mentores (alunos que já entraram) como camada humana sobre a IA.

**Regra de sócio pra banca:** para *cada* uso de IA, saibam responder "o que a IA decide/gera/classifica, com que dado, e o que acontece se ela errar". E, neste produto especificamente, "como vocês garantem que um prazo/requisito/visto não sai errado". Se não souberem, a IA é cosmética **e** perigosa.

---

## 7. MVP para o pitch

**Precisa FUNCIONAR de verdade (~4–5 coisas):**
1. **Diagnóstico de perfil** (o "quiz que monta o mapa") — perguntas reais que alimentam a recomendação (cadastro em si é mock).
2. **Tela do aha** — caminho em etapas + próximo passo + 3 universidades realistas com custo/requisito (dados curados de verdade pra ~3–5 universidades).
3. **Painel único da jornada** — etapas + tarefas com prazo + status (semeado, mas parece vivo).
4. **Uma** chamada de IA ao vivo: o co-piloto respondendo uma dúvida real do processo puxando o perfil (com a fonte oficial aparecendo) **ou** a micro-mentoria de redação — é o wow de IA.
5. **Recomendação/comparação de universidades** funcionando (mesmo com banco pequeno curado).

**Precisa só PARECER funcional (mock):** busca de bolsas, controle de documentos, currículo, extracurriculares, entrevista, financeiro, visto (aparecem como etapas do painel), autenticação real.

**Pode ser MOCKADO:** login/cadastro (fake — mas o diagnóstico dentro dele é real), banco "completo" de universidades (são ~3–5 de verdade, curadas com dado oficial), respostas do diagnóstico roteirizadas pra cair no caminho que a demo quer mostrar.

**CORTAR do MVP:** pagamento, cadastro real, crawler de bolsas de verdade, base completa de universidades, versão multi-país completa. Foco em **1 jornada linda** (ex.: graduação nos EUA) num fluxo só.

**Onde a demo mora:** este Golden Path é o que abre quando alguém clica **"ver demonstração"** no fim da landing page do pitch (ver `04`). A LP é a apresentação; o protótipo é o clímax.

**Golden Path da demo (≤ 90s dentro do pitch de 3 min):**
1. (15s) Abre → "vamos montar seu mapa" (cadastro mock).
2. (25s) Diagnóstico de perfil em formato conversa — objetivo + notas + inglês + orçamento (o apresentador destaca: "isso não é cadastro, é a IA já montando o caminho dela").
3. (20s) **Tela do aha:** "seu caminho tem 5 etapas, você está na 1, próximo passo é X" + 3 universidades realistas com custo/requisito (aqui o apresentador para: "em 3 minutos, 14 abas viraram um caminho com primeiro passo").
4. (20s) **Co-piloto ao vivo:** Liz pergunta algo real ("preciso de SAT pra essas?") → IA responde puxando o perfil **e mostra a fonte oficial datada** (o apresentador: "isso é IA personalizada — e repara: no item crítico, ela te manda confirmar na fonte oficial, não chuta como o ChatGPT"). Se sobrar fôlego: 1 toque de wow com a **micro-mentoria de redação**.
5. (10s) **Painel da jornada:** as 13 frentes num lugar só, com prazos — "isso é o que hoje são 14 abas e uma planilha".
6. (10s) Fecha com a frase de posicionamento + o número da dor (preço da consultoria vs. o nosso).

**⚠️ Orçamento de 3 minutos:** LP faz o contexto (dor + solução + número) em ~60–75s, demo ~90s, fecho ~15s. Cronometrar impiedosamente; cortar passos (redação, painel) se estourar. Melhor demo curta e limpa que corrida.

**Plano B obrigatório:** gravar um screen-capture do Golden Path na véspera. Se a IA ao vivo cair, roda o vídeo embutido na própria LP. Nunca depender de wi-fi da sala + API na hora H sem backup.

---

## 8. Divisão do time (7 integrantes)

Papéis a **reconfirmar após a pivô** — a mudança de produto muda o que cada frente entrega. Base herdada (revisar na reunião de realinhamento):

| Pessoa | Papel | Responsabilidade no NOVO produto | Prioridade |
|---|---|---|---|
| **Matheus Mister** (Líder) | Pitch + narrativa | Dono do **pitch de 3 min** e da **landing page**; storytelling com Liz como protagonista; Q&A (principalmente "não é só ChatGPT?" e "e a precisão?") | 🔴 crítica |
| **Vellozo** | Dev + Design | App shell: diagnóstico, tela do aha, painel da jornada, recomendação de universidades, co-piloto; **construir a LP** com o design system Abroad (já entregue); **+ Fase 4: presença do counselor + counselor cockpit** (`20` §3.2 / `21`) | 🔴 crítica |
| **Leonardo** | Dev / IA | Camada de IA: anamnese→score/ranking→mapa, match de universidades, co-piloto com fonte oficial, micro-mentoria de redação; **+ com Nicolas: modelar a alavanca de IA (30 alunos/counselor/dia) que sustenta a DRE** | 🔴 crítica |
| **Nicolas** | Finanças | **Com Leonardo (pedido do fundador):** levantar custo de counselor + custo de plataforma/IA → DRE + 3 cenários + preço ancorado na consultoria, payback, LTV; a alavanca central é alunos-por-counselor/dia × preço (Seção 11) | 🔴 crítica |
| **Duda** | Marketing | GTM, aquisição do perfil Liz, mensagem; apoiar copy da LP | 🟡 alta |
| **Liz** (integrante) | Branding | Marca Abroad ✅ já entregue (`Abroad Design System.html`); agora candidata a **Pesquisa/Validação** | 🟡 alta |
| **Mateus Cenoura** | *(a confirmar)* | Candidato a **Conteúdo/Curadoria** (dados reais das universidades) ou **Pesquisa** | ⚠️ definir |

### ⚠️ Flags de sócio pós-pivô

1. **Conteúdo & curadoria vira CAMINHO CRÍTICO e mais difícil que antes.** Alguém precisa curar **dados reais e datados de ~3–5 universidades** (requisitos, custo, provas, prazos) + escrever o diagnóstico + preparar a interação de redação da demo. **Aqui o dado precisa ser verdadeiro e ter fonte** (o produto inteiro se vende como confiável) — não dá pra inventar. Sem isso, os devs travam **e** o diferencial de confiabilidade cai por terra.
2. **Pesquisa & validação:** 5–8 conversas com jovens do perfil Liz (ou pais) → 2–3 citações fortes + números do mercado (ticket de consultoria, volume de estudantes no exterior). A banca vai perguntar "como validaram a dor?".
3. **Timing (o maior risco não-técnico):** ver Seção 9 — a pivô é tardíssima; o escopo tem que ser brutalmente pequeno.

**Anti-retrabalho:** uma única fonte de verdade dos dados de universidade (planilha curada → devs, com **fonte e data em cada célula**). Um único design system (o novo, quando a Liz entregar) antes de qualquer tela e na LP.

---

## 9. Plano de execução — ⚠️ leitura de timing do sócio

**Aviso duro e honesto:** pela data do ambiente (23/07, quinta — véspera do Pitch Day de sexta 24/07), esta pivô está chegando **na última janela útil** da semana do Pre College. Trocar a dor inteira a menos de 24h do pitch é de altíssimo risco pra entregar um protótipo novo funcional. Como sócio, preciso colocar duas leituras na mesa:

- **Se o objetivo é o pitch de sexta:** não dá pra construir os 13 módulos nem um protótipo novo robusto. O caminho realista é **1 fluxo lindo e curto** — diagnóstico → tela do aha → co-piloto com 1 chamada de IA → painel — e o resto no discurso/mock, com **vídeo backup gravado**. Escopo mínimo, execução limpa, narrativa forte. Melhor uma coisa que funciona de verdade que dez pela metade.
- **Se o objetivo é o projeto além do Pre College** (evoluir isso como venture real): então a pivô faz todo sentido e o prazo de sexta deixa de ser a régua — planejamos em semanas, não horas. **Me confirmem qual dos dois é o alvo**, porque muda tudo no plano abaixo.

**Plano enxuto (assumindo pitch curto + evolução depois):**
- **Agora:** reunião de realinhamento (30 min) — confirmar objetivo (sexta vs. venture), travar os 2–3 módulos-herói, dar dono a Conteúdo (dados reais de ~3–5 universidades **com fonte**) e Pesquisa.
- **Conteúdo/Pesquisa arrancam em paralelo:** curadoria dos dados datados + 5–8 conversas de validação.
- **Devs:** subir o esqueleto (diagnóstico + tela do aha com dados dummy) e testar 1 chamada de LLM isolada (diagnóstico→próximo passo).
- **Marca:** ✅ resolvida — Abroad entregue (`Abroad Design System.html`) e já aplicada no protótipo (`20`). LP usa os mesmos tokens.
- **Véspera do pitch:** congelar build, **gravar vídeo backup**, ensaiar 3× cronometrado em 3 min, treinar Q&A ("não é só ChatGPT?" + "e a precisão?").

---

## 10. Estratégia de diferenciação (o teste ácido)

**"Por que isso não é só ChatGPT + Google + uma planilha?"**

Resposta honesta e forte:

ChatGPT, Google e planilha são **três coisas separadas que não se falam.** O ChatGPT é reativo, **alucina prazo e requisito**, e não guarda o estado da sua aplicação. O Google te dá 2 milhões de resultados fragmentados, genéricos e em ordem aleatória. A planilha organiza, mas não sabe o processo por você nem recalibra.

O Abroad é **um sistema único** onde quatro coisas são governadas pelo *mesmo* modelo do **seu** perfil e objetivo:
1. **O counselor** (um orientador humano de verdade no circuito — o ChatGPT não tem; é a resposta mais curta e forte a "isso é só ChatGPT?").
2. **O mapa** (as etapas do seu caminho, na sua ordem, pra sua realidade — não uma lista genérica).
3. **A orquestração** (as 13 frentes num lugar só, com prazos vivos e o próximo passo sempre priorizado).
4. **A confiabilidade** (itens críticos com fonte oficial datada — a IA aponta, a fonte confirma; não é chute).

O ChatGPT espera você perguntar e chuta; o Abroad **decide o próximo passo** e mostra a fonte. O Google é estático e disperso; o Abroad é um caminho vivo. A consultoria faz tudo isso — por R$ 20–100 mil; o Abroad faz por uma fração.

**Sendo crítico comigo mesmo:** a *interface* (um painel bonito) é copiável — não é moat. O moat real, que eu venderia com honestidade à banca, é: (a) o **motor de recomendação que melhora com dados de milhares de aplicações** (quais perfis entram onde, com qual bolsa — não replicável só olhando as telas), e (b) a **base curada, datada e confiável** de requisitos/prazos/custos, que é cara de manter e é exatamente o que falta na internet solta. E o **wedge de posicionamento** — "o que só a elite tinha, por uma fração" — é o que nos tira da briga contra a informação grátis e contra a consultoria cara ao mesmo tempo.

Se a banca apertar em "isso é defensável?", a resposta madura: "no dia 1, não pela tecnologia — pelo foco em um job-to-be-done que ninguém serve bem (mapa + orquestração confiável e acessível). Com escala, sim, pelos dados de admissão e pela base curada." Mais convincente que fingir um moat técnico que não existe.

---

## 11. Modelo de negócio

**Formato:** SaaS + serviço premium (counselor humano potencializado por IA), B2C premium. (B2B com escolas particulares — "o counselor que sua escola não tem, como serviço" — é expansão futura óbvia, não pitch.)

**A alavanca econômica central (a tese da afinação 23/07):** o produto tem um **custo humano real** (o counselor) — o que normalmente derruba a margem de qualquer serviço de mentoria e é por que consultoria custa R$ 20–100 mil. **A IA quebra essa equação:** ao fazer a anamnese, o score/ranking e o diagnóstico, ela tira do counselor o trabalho pesado, de modo que **um counselor rende por ~30 alunos/dia** em vez de poucos 1-a-1. É isso que transforma um serviço caro de elite num produto acessível com economia parecida com a de software. **O número 30/dia é o coração da DRE** — não um detalhe.

> **Nota de sócio — sobre o "não importa o preço":** internamente, ótimo (confiança de que o produto é diferenciado e vende). **No pitch, não use isso.** A banca VAI perguntar preço e unidade econômica, e a história inteira depende do número (custo do counselor ÷ alunos/dia = custo por aluno; preço = fração da consultoria). Não competimos por ser baratos — mas temos que **mostrar o número**, porque a mágica da alavanca de IA É o argumento.

**Estrutura de preço + tiering (hipótese, Nicolas+Leonardo fecham com números):**
- **Camada FREE / entrada (counselor de IA puro):** anamnese + score/ranking + primeiro mapa e próximo passo, **sem counselor humano** — escala infinita, custo marginal só de IA. É o aha que prova valor antes do paywall e o funil de aquisição.
- **Assinatura da jornada (IA + toques de counselor):** recorrente ao longo dos 12–24 meses (ex.: dezenas a poucas centenas de reais/mês) — jornada longa favorece LTV alto e retenção natural (ela não larga no meio).
- **Camada PREMIUM com counselor humano:** revisão de perfil/redação, plano personalizado e acompanhamento ao vivo por um counselor — ticket mais alto, ainda muito abaixo da consultoria. É onde moram a margem, a confiança nos itens de alto risco e o "humano no circuito". O tiering resolve a tensão **margem-de-serviço vs. escala-de-software**: IA-only escala, o humano diferencia.
- **Âncora de comunicação:** "consultoria: R$ 20–100 mil por um counselor. Abroad: um counselor por uma fração, no seu tempo." *(Nicolas: confirmar faixas reais de consultoria pra ancorar sem exagero.)*

**Por que alguém paga em vez de usar a internet grátis:** a internet dá informação; não dá um counselor, mapa personalizado, orquestração confiável nem próximo passo. E o custo de errar (perder um ano, um prazo, uma bolsa) é altíssimo — pagar por um orientador e por confiabilidade tem ROI óbvio.

**DRE + 3 cenários — AÇÃO Nicolas + Leonardo (juntos, como o fundador pediu):**
1. **Custo de um counselor** (R$/hora ou salário) e quantos alunos ele atende/dia **com** a IA (validar a hipótese de ~30) → **custo por aluno atendido**.
2. **Custo de plataforma/IA** (chamadas de LLM por aluno, curadoria/manutenção da base confiável) — o CPV que não é o counselor.
3. **Preço** por camada, ancorado na consultoria (R$ 20–100 mil) — provar que somos 10–50× mais baratos e ainda margem positiva.
4. **DRE simplificado + 3 cenários** (otimista/realista/pessimista, `02`/`07`) girando as duas alavancas: **alunos por counselor/dia** e **preço**. Payback deve caber em poucos meses de assinatura dado o ticket. Sensibilidade-chave: quanto a margem melhora conforme a IA sobe os 30/dia.

---

## 12. Conclusão executiva

**O PRODUTO EM UMA FRASE:** o **counselor que sua escola não te deu** — um orientador de admissão internacional para cada aluno, potencializado por IA, que transforma a caixa-preta de estudar fora num caminho com próximo passo claro, por uma fração do preço de uma consultoria.

**O PRINCIPAL PROBLEMA:** o jovem que quer estudar fora e tem os recursos (dinheiro, tempo, notas) **não sofre por falta de capacidade — sofre porque a escola dele não oferece um counselor**, e sem ele o processo vira caixa-preta (falta de mapa) e projeto de 2 anos sem ninguém segurando (falta de orquestração).

**A PRINCIPAL INOVAÇÃO:** **a IA amplia um counselor humano** — faz a anamnese, pontua/ranqueia o perfil e monta o diagnóstico, de modo que um counselor atende ~30 alunos/dia (o que torna acessível o que só a elite tinha), enquanto o humano valida e guia e os itens críticos ficam atrelados à fonte oficial datada.

**O PRINCIPAL DIFERENCIAL:** "um counselor de verdade + IA, por uma fração da consultoria" — tem humano no circuito (o ChatGPT não tem) e confiabilidade (fonte oficial nos itens que matam a aplicação).

**O MVP DO PITCH:** landing page (3 min) terminando em "ver demonstração" → 1 jornada linda: diagnóstico → tela do aha (caminho + próximo passo + 3 universidades) → co-piloto de IA ao vivo com fonte oficial → painel da jornada. Vídeo backup.

**O QUE CONSTRUIR AGORA:** ~4–5 telas de verdade (diagnóstico, aha, painel, recomendação de universidades, co-piloto com 1 chamada de IA) + dados curados e **datados** de ~3–5 universidades + escolher 1 módulo-herói de execução (redação ou bolsas).

**O QUE NÃO CONSTRUIR AGORA:** os 13 módulos funcionais, pagamento, autenticação real, crawler de bolsas, base completa de universidades, multi-país completo.

**A DIVISÃO DOS 7:** reconfirmar pós-pivô (Seção 8). Buracos críticos: **Conteúdo/curadoria com fonte** (caminho crítico e mais difícil agora) e **Pesquisa/Validação**.

**O PRÓXIMO PASSO IMEDIATO (agora):** reunião de realinhamento pra (1) **confirmar o objetivo — pitch de sexta OU venture além do Pre College** (muda todo o plano — Seção 9), (2) travar os 2–3 módulos-herói e o Golden Path dentro dos 3 min, (3) dar dono a Conteúdo (dados reais datados) e Pesquisa, (4) **Nicolas + Leonardo fecharem a DRE do counselor** (custo de counselor + IA + alavanca de 30/dia + preço — §11), (5) **Fase 4 do protótipo: counselor visível + cockpit** (`20` §3.2 / `21`). Marca ✅ já entregue.
