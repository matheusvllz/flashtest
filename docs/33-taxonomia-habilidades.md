# 33 — Taxonomia de habilidades (gerado)

**Não editar à mão.** Gerado por `scripts/content/taxonomy-doc.ts` a partir de `src/content/taxonomy/` (docs/30 §8, docs/31 Fase 2). Rodar `bun scripts/content/taxonomy-doc.ts` depois de mudar a taxonomia.

**Total:** 67 habilidades declaradas, **65 ativas** (as demais são `planejado`, sem conteúdo ainda — o motor adaptativo as ignora).

✅ = ativo · ⏳ = planejado

**Pendência conhecida (registrada em docs/32):** a coluna "Matriz ENEM" (`enemSkills`, referência aos códigos H1–H30 da Matriz de Referência do Inep por área) não foi preenchida nesta rodada — preencher os códigos exatos sem a fonte primária em mãos seria inventar dado, o que os documentos normativos (docs/20 §13, docs/30) proíbem. Preencher na Fase 10 (F10.3), consultando a Matriz de Referência do Inep diretamente.

## Linguagens, Códigos e suas Tecnologias (LC)

| Status | Habilidade | Matéria | Nome | Core | Incidência | Nível | Pré-requisitos | Matriz ENEM |
|---|---|---|---|---|---|---|---|---|
| ✅ | `ing:interpretacao-texto-curto` | Inglês | Interpretar um texto curto em inglês (anúncio, tira, notícia) | não | 2 | base | — | _não preenchido_ |
| ✅ | `ing:vocabulario-contexto` | Inglês | Deduzir o sentido de uma palavra desconhecida pelo contexto | não | 2 | base | — | _não preenchido_ |
| ✅ | `lit:caracteristicas-escolas-literarias` | Literatura | Reconhecer características de uma escola literária num trecho | não | 2 | base | — | _não preenchido_ |
| ✅ | `lit:interpretacao-texto-literario` | Literatura | Interpretar um trecho de obra literária no contexto da prova | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `lit:modernismo-fases-brasil` | Literatura | Diferenciar as fases do Modernismo brasileiro | não | 2 | intermediario | `lit:caracteristicas-escolas-literarias` | _não preenchido_ |
| ✅ | `por:classes-gramaticais-identificacao` | Português | Identificar a classe gramatical de uma palavra pelo contexto | sim | 2 | base | — | _não preenchido_ |
| ✅ | `por:concordancia-verbal-nominal` | Português | Aplicar concordância verbal e nominal em casos do dia a dia da prova | sim | 3 | base | — | _não preenchido_ |
| ✅ | `por:crase-casos-proibidos` | Português | Reconhecer os casos em que a crase é proibida | não | 3 | intermediario | `por:crase-regra-basica` | _não preenchido_ |
| ✅ | `por:crase-regra-basica` | Português | Aplicar a regra geral de crase (a + a = à) | sim | 3 | base | — | _não preenchido_ |
| ✅ | `por:formacao-palavras-processos` | Português | Reconhecer processos de formação de palavras (derivação, composição) | não | 1 | intermediario | `por:classes-gramaticais-identificacao` | _não preenchido_ |
| ✅ | `por:interpretacao-ideia-principal` | Português | Identificar a ideia principal e a intenção de um texto | sim | 3 | base | — | _não preenchido_ |
| ✅ | `por:ortografia-acentuacao` | Português | Aplicar as regras de acentuação gráfica | sim | 2 | base | — | _não preenchido_ |
| ✅ | `por:pontuacao-virgula-regras` | Português | Decidir onde a vírgula é obrigatória, proibida ou opcional | sim | 3 | base | — | _não preenchido_ |
| ✅ | `por:regencia-verbal-nominal` | Português | Identificar a regência correta de verbos e nomes comuns na prova | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `por:sentido-figuras-linguagem` | Português | Reconhecer figuras de linguagem e seu efeito de sentido no texto | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `por:sintaxe-periodo-composto` | Português | Classificar orações coordenadas e subordinadas num período composto | não | 2 | avancado | `por:sintaxe-termos-oracao` | _não preenchido_ |
| ✅ | `por:sintaxe-termos-oracao` | Português | Identificar sujeito, predicado e complementos de uma oração | sim | 2 | intermediario | `por:classes-gramaticais-identificacao` | _não preenchido_ |
| ✅ | `por:tempos-verbais-emprego` | Português | Empregar o tempo e o modo verbal adequados ao contexto | não | 2 | intermediario | `por:classes-gramaticais-identificacao` | _não preenchido_ |

## Matemática e suas Tecnologias (MT)

| Status | Habilidade | Matéria | Nome | Core | Incidência | Nível | Pré-requisitos | Matriz ENEM |
|---|---|---|---|---|---|---|---|---|
| ⏳ | `mat:analise-combinatoria-contagem` | Matemática | Contar agrupamentos com o princípio multiplicativo | não | 2 | avancado | `mat:probabilidade-evento-simples` | _não preenchido_ |
| ✅ | `mat:area-perimetro-figuras-planas` | Matemática | Calcular área e perímetro de figuras planas compostas | sim | 3 | base | `mat:operacoes-fundamentais` | _não preenchido_ |
| ✅ | `mat:equacao-primeiro-grau` | Matemática | Resolver equação do primeiro grau com uma incógnita | sim | 2 | base | `mat:operacoes-fundamentais` | _não preenchido_ |
| ✅ | `mat:funcao-afim-grafico` | Matemática | Interpretar o gráfico e a lei de uma função do primeiro grau | sim | 3 | intermediario | `mat:equacao-primeiro-grau` | _não preenchido_ |
| ✅ | `mat:funcao-exponencial-crescimento` | Matemática | Modelar crescimento ou decaimento exponencial num contexto | não | 2 | avancado | `mat:funcao-afim-grafico`, `mat:porcentagem-fator-multiplicativo` | _não preenchido_ |
| ✅ | `mat:funcao-quadratica-vertice` | Matemática | Encontrar o vértice e as raízes de uma função do segundo grau | não | 2 | intermediario | `mat:funcao-afim-grafico` | _não preenchido_ |
| ✅ | `mat:leitura-grafico-tabela` | Matemática | Ler e comparar dados apresentados em gráfico ou tabela | sim | 3 | base | — | _não preenchido_ |
| ⏳ | `mat:logaritmo-propriedades` | Matemática | Aplicar propriedades de logaritmo para resolver equação exponencial | não | 1 | avancado | `mat:funcao-exponencial-crescimento` | _não preenchido_ |
| ✅ | `mat:media-mediana-moda` | Matemática | Calcular média, mediana e moda de um conjunto de dados | sim | 3 | base | `mat:leitura-grafico-tabela` | _não preenchido_ |
| ✅ | `mat:operacoes-fundamentais` | Matemática | Resolver expressões numéricas com as quatro operações e potenciação | sim | 2 | base | — | _não preenchido_ |
| ✅ | `mat:porcentagem-conceito` | Matemática | Entender porcentagem como fração de 100 | sim | 3 | base | `mat:razao-proporcao` | _não preenchido_ |
| ✅ | `mat:porcentagem-fator-multiplicativo` | Matemática | Aplicar fator multiplicativo em aumento e desconto percentual | não | 3 | intermediario | `mat:porcentagem-valor` | _não preenchido_ |
| ✅ | `mat:porcentagem-valor` | Matemática | Calcular X% de um valor | sim | 3 | base | `mat:porcentagem-conceito` | _não preenchido_ |
| ✅ | `mat:probabilidade-evento-simples` | Matemática | Calcular a probabilidade de um evento simples | sim | 3 | intermediario | `mat:razao-proporcao` | _não preenchido_ |
| ✅ | `mat:razao-proporcao` | Matemática | Resolver problema com razão, proporção e regra de três simples | sim | 3 | base | `mat:operacoes-fundamentais` | _não preenchido_ |
| ✅ | `mat:trigonometria-triangulo-retangulo` | Matemática | Usar seno, cosseno e tangente para achar lado ou ângulo | não | 2 | intermediario | `mat:area-perimetro-figuras-planas` | _não preenchido_ |
| ✅ | `mat:volume-solidos-geometricos` | Matemática | Calcular volume de prismas, cilindros e outros sólidos | não | 2 | intermediario | `mat:area-perimetro-figuras-planas` | _não preenchido_ |

## Ciências da Natureza e suas Tecnologias (CN)

| Status | Habilidade | Matéria | Nome | Core | Incidência | Nível | Pré-requisitos | Matriz ENEM |
|---|---|---|---|---|---|---|---|---|
| ✅ | `bio:ecologia-relacoes-ecossistema` | Biologia | Identificar relações ecológicas e fluxo de energia num ecossistema | sim | 3 | base | — | _não preenchido_ |
| ✅ | `bio:evolucao-selecao-natural` | Biologia | Explicar um fenômeno evolutivo pela seleção natural | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `bio:fisiologia-humana-sistemas` | Biologia | Relacionar órgão e função num sistema do corpo humano | não | 2 | base | — | _não preenchido_ |
| ✅ | `bio:genetica-leis-mendel` | Biologia | Resolver cruzamento genético com as leis de Mendel | sim | 3 | intermediario | — | _não preenchido_ |
| ✅ | `bio:membrana-estrutura` | Biologia | Descrever a estrutura da membrana plasmática (mosaico fluido) | sim | 2 | base | — | _não preenchido_ |
| ✅ | `bio:membrana-funcao` | Biologia | Explicar o transporte de substâncias através da membrana | não | 2 | intermediario | `bio:membrana-estrutura` | _não preenchido_ |
| ✅ | `bio:organelas-funcao` | Biologia | Relacionar cada organela citoplasmática à sua função | não | 2 | intermediario | `bio:membrana-estrutura` | _não preenchido_ |
| ✅ | `fis:cinematica-movimento-uniforme` | Física | Resolver problema de movimento uniforme com a função horária | sim | 3 | base | `mat:funcao-afim-grafico` | _não preenchido_ |
| ✅ | `fis:dinamica-leis-newton` | Física | Aplicar as leis de Newton para achar força ou aceleração | sim | 2 | intermediario | `fis:cinematica-movimento-uniforme` | _não preenchido_ |
| ✅ | `fis:eletricidade-circuitos-basicos` | Física | Calcular corrente, tensão e resistência num circuito simples | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `fis:energia-trabalho-conservacao` | Física | Aplicar a conservação de energia mecânica num problema | não | 2 | intermediario | `fis:dinamica-leis-newton` | _não preenchido_ |
| ✅ | `qui:estequiometria-calculo-mols` | Química | Calcular quantidade de matéria numa reação balanceada | sim | 3 | intermediario | `qui:estrutura-atomica-modelos` | _não preenchido_ |
| ✅ | `qui:estrutura-atomica-modelos` | Química | Identificar prótons, nêutrons e elétrons a partir do número atômico e de massa | sim | 2 | base | — | _não preenchido_ |
| ✅ | `qui:quimica-organica-funcoes` | Química | Reconhecer as principais funções orgânicas numa molécula | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `qui:tabela-periodica-propriedades` | Química | Prever propriedades periódicas (raio, eletronegatividade) pela posição na tabela | não | 2 | intermediario | `qui:estrutura-atomica-modelos` | _não preenchido_ |

## Ciências Humanas e suas Tecnologias (CH)

| Status | Habilidade | Matéria | Nome | Core | Incidência | Nível | Pré-requisitos | Matriz ENEM |
|---|---|---|---|---|---|---|---|---|
| ✅ | `fil:epistemologia-conhecimento` | Filosofia | Diferenciar racionalismo e empirismo na origem do conhecimento | não | 1 | avancado | — | _não preenchido_ |
| ✅ | `fil:etica-correntes-filosoficas` | Filosofia | Distinguir correntes éticas (deontologia, consequencialismo) num dilema | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `fil:politica-poder-estado` | Filosofia | Relacionar um conceito de poder e Estado a um pensador da política | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `geo:climatologia-fenomenos` | Geografia | Explicar um fenômeno climático (El Niño, efeito estufa, chuva ácida) | não | 2 | base | — | _não preenchido_ |
| ✅ | `geo:geopolitica-globalizacao` | Geografia | Analisar um conflito ou bloco econômico à luz da geopolítica atual | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `geo:meio-ambiente-impactos` | Geografia | Avaliar impacto ambiental de uma atividade humana | sim | 3 | base | — | _não preenchido_ |
| ✅ | `geo:urbanizacao-processos` | Geografia | Relacionar processo de urbanização a um problema social ou ambiental | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `his:brasil-colonia-economia-sociedade` | História | Explicar a organização econômica e social do Brasil Colônia | não | 2 | base | — | _não preenchido_ |
| ✅ | `his:ditadura-militar-contexto` | História | Contextualizar causas e consequências da ditadura militar brasileira | sim | 3 | intermediario | — | _não preenchido_ |
| ✅ | `his:era-vargas-politica-economia` | História | Relacionar as fases da Era Vargas às suas políticas | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `his:guerra-fria-bipolaridade` | História | Explicar a lógica bipolar da Guerra Fria num evento histórico | não | 2 | intermediario | — | _não preenchido_ |
| ✅ | `soc:cultura-identidade-sociedade` | Sociologia | Analisar um traço cultural como construção social, não natural | não | 2 | base | — | _não preenchido_ |
| ✅ | `soc:desigualdade-social-estrutura` | Sociologia | Explicar uma forma de desigualdade social com conceito sociológico | sim | 3 | base | — | _não preenchido_ |
| ✅ | `soc:movimentos-sociais-cidadania` | Sociologia | Relacionar um movimento social a uma pauta de cidadania | não | 2 | intermediario | — | _não preenchido_ |

## Redação (RED)

| Status | Habilidade | Matéria | Nome | Core | Incidência | Nível | Pré-requisitos | Matriz ENEM |
|---|---|---|---|---|---|---|---|---|
| ✅ | `red:argumentacao-repertorio` | Redação | Construir argumento com repertório sociocultural pertinente | não | 3 | intermediario | `red:estrutura-dissertativo-argumentativa` | _não preenchido_ |
| ✅ | `red:competencias-avaliacao-enem` | Redação | Reconhecer o que cada competência do ENEM avalia numa redação | não | 3 | intermediario | `red:estrutura-dissertativo-argumentativa` | _não preenchido_ |
| ✅ | `red:estrutura-dissertativo-argumentativa` | Redação | Estruturar um texto dissertativo-argumentativo nos moldes do ENEM | sim | 3 | base | — | _não preenchido_ |

