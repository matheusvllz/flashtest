/**
 * Tarefas "Escreva" das três trilhas de redação (spec 50 §5.10.1, T-50.11.2). CONTEÚDO AUTORAL do Foca: os temas são
 * de treino (`TEMAS_DE_TREINO`, nunca tema oficial nem previsão de prova), e os trechos dados e os textos-modelo foram
 * escritos para treino. Repertório só verificável e dito pela ideia (Constituição de 1988, ECA, Política Nacional de
 * Resíduos Sólidos, Paulo Freire); nenhum número, pesquisa ou citação atribuída a fonte real. Nenhuma questão oficial
 * foi tocada. Validador: `validarCatalogoDeEscrita` (`src/lib/escrita.ts`), rodado em `tests/unit/escrita.test.ts`.
 *
 * Revisão factual e pedagógica do dono pendente antes da publicação (registro da E6).
 */
import type { WritingTask } from "@/lib/lessons/types";

const COMPLETO = { min: 400, max: 5000 };

export const TAREFAS_DE_ESCRITA: readonly WritingTask[] = [
  /* ---------------------------------------------------------- Estrutura da Dissertação --- */
  {
    id: "estrutura-introducao",
    trilhaId: "redacao-estrutura",
    depoisDe: "redacao-estrutura-02-introducao-contextualizacao-tese",
    titulo: "Escreva a introdução com tese",
    modo: "trecho",
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Escreva a introdução de uma redação sobre o tema abaixo, terminando com a sua tese.",
      tema: "Caminhos para reduzir o desperdício de alimentos no Brasil",
      instrucao:
        "Em um parágrafo de 3 a 5 frases: apresente o assunto (contextualização), mostre o problema e feche com a tese, o ponto de vista que o texto vai defender. Se quiser, anuncie os dois argumentos.",
      limites: { min: 150, max: 1200 },
    },
    modelo: {
      texto:
        "No Brasil, a Constituição de 1988 inclui a alimentação entre os direitos sociais, o que pressupõe que a comida chegue à mesa de quem precisa. Na prática, porém, uma parte dos alimentos produzidos se perde no caminho entre a lavoura e o prato, enquanto muitas famílias ainda convivem com a fome. Esse contraste persiste, sobretudo, por causa da falta de estrutura no transporte e no armazenamento e da pouca informação do consumidor sobre como aproveitar melhor o que compra.",
      comentarios: [
        "A primeira frase contextualiza com um repertório verificável (a alimentação como direito social na Constituição) em vez de abrir com uma frase genérica.",
        "A segunda frase apresenta o problema como um contraste: comida se perde enquanto há fome.",
        "A tese fecha o parágrafo e já anuncia os dois argumentos (estrutura e informação), que viram os dois parágrafos de desenvolvimento.",
      ],
    },
  },
  {
    id: "estrutura-desenvolvimento",
    trilhaId: "redacao-estrutura",
    depoisDe: "redacao-estrutura-03-desenvolvimento-topico-frasal-progressao",
    titulo: "Escreva um parágrafo de desenvolvimento",
    modo: "trecho",
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Escreva um parágrafo de desenvolvimento para o tema abaixo, a partir da tese dada.",
      tema: "Caminhos para reduzir o desperdício de alimentos no Brasil",
      instrucao:
        "Escolha um dos dois argumentos da tese. Comece com um tópico frasal (a ideia do parágrafo), explique a causa ou a consequência, traga um exemplo ou repertório e feche ligando de volta à tese.",
      textoDeApoio: {
        rotulo: "Tese da introdução",
        texto:
          "O desperdício de alimentos no Brasil persiste por causa da falta de estrutura no transporte e no armazenamento e da pouca informação do consumidor.",
      },
      limites: { min: 250, max: 1500 },
    },
    modelo: {
      texto:
        "Em primeiro lugar, a falta de estrutura no transporte e no armazenamento faz com que muitos alimentos se estraguem antes de chegar ao consumidor. Frutas e verduras, por exemplo, são perecíveis e, quando viajam longas distâncias em caminhões sem refrigeração ou ficam em armazéns inadequados, perdem qualidade rapidamente. Essa perda não é só econômica: o produtor deixa de vender, o preço sobe para quem compra e a comida que poderia alimentar alguém vai para o lixo. Dessa forma, enquanto o caminho entre o campo e a cidade não for planejado para conservar os alimentos, o desperdício continuará começando muito antes da cozinha.",
      comentarios: [
        "“Em primeiro lugar” liga o parágrafo à tese e anuncia o primeiro argumento; o tópico frasal diz a ideia central logo de cara.",
        "O exemplo (frutas e verduras perecíveis) é de conhecimento geral: não precisa de número inventado para convencer.",
        "A última frase fecha o parágrafo voltando ao problema, com “Dessa forma”, sem abrir assunto novo.",
      ],
    },
  },
  {
    id: "estrutura-conclusao",
    trilhaId: "redacao-estrutura",
    depoisDe: "redacao-estrutura-04-conclusao-proposta-intervencao",
    titulo: "Escreva a conclusão com proposta (5 elementos)",
    modo: "trecho",
    checaProposta: true,
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Escreva a conclusão com uma proposta de intervenção completa para o tema abaixo.",
      tema: "Caminhos para reduzir o desperdício de alimentos no Brasil",
      instrucao:
        "Retome o problema em uma frase e proponha uma solução com os 5 elementos: agente (quem faz), ação (o que faz), meio (como faz), finalidade (para quê) e detalhamento (um detalhe a mais sobre um deles). A proposta precisa responder aos argumentos do texto.",
      textoDeApoio: {
        rotulo: "Argumentos do texto",
        texto:
          "1. Falta estrutura de transporte e armazenamento, e muitos alimentos estragam no caminho. 2. Falta informação ao consumidor sobre como comprar, guardar e aproveitar a comida.",
      },
      limites: { min: 200, max: 1500 },
    },
    modelo: {
      texto:
        "Portanto, reduzir o desperdício exige agir tanto no caminho dos alimentos quanto na casa de quem os consome. Para isso, o Ministério da Agricultura deve ampliar a rede de armazéns refrigerados, especialmente perto das regiões produtoras, por meio de parcerias com cooperativas de agricultores, a fim de que frutas e verduras cheguem às cidades em bom estado. Além disso, as escolas devem incluir oficinas de aproveitamento integral dos alimentos, com receitas que usam cascas e talos, para que os estudantes levem esse hábito para as suas famílias. Assim, a comida produzida no país terá mais chance de chegar ao prato, e não ao lixo.",
      comentarios: [
        "Agente: o Ministério da Agricultura (e, na segunda proposta, as escolas). Ação: ampliar armazéns refrigerados. Meio: parcerias com cooperativas. Finalidade: que os alimentos cheguem em bom estado.",
        "O detalhamento aparece em “especialmente perto das regiões produtoras” e em “com receitas que usam cascas e talos”: um detalhe a mais que deixa a proposta concreta.",
        "Cada proposta responde a um argumento do desenvolvimento; a conclusão não inventa um problema novo.",
      ],
    },
  },
  {
    id: "estrutura-texto-completo",
    trilhaId: "redacao-estrutura",
    depoisDe: "redacao-estrutura-07-fuga-tema-tangenciamento",
    titulo: "Texto completo",
    modo: "completo",
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Escreva uma redação completa, do tipo dissertativo-argumentativo, sobre o tema abaixo.",
      tema: "Os desafios para ampliar o acesso à leitura entre jovens no Brasil",
      instrucao:
        "Use 4 parágrafos: introdução com tese, dois de desenvolvimento (um argumento em cada) e conclusão com proposta de intervenção completa. Mire entre 20 e 30 linhas.",
      limites: COMPLETO,
    },
    modelo: {
      texto: [
        "A Constituição de 1988 afirma que a educação é direito de todos e dever do Estado e da família. A leitura é parte central desse direito, porque amplia o vocabulário e a compreensão do mundo. Mesmo assim, muitos adolescentes brasileiros leem pouco fora das obrigações escolares. Esse cenário se explica, principalmente, pelo acesso desigual aos livros e pela forma como a leitura costuma ser apresentada na escola.",
        "Em primeiro lugar, o acesso aos livros não é igual em todo o país. Em muitos bairros e cidades pequenas, não há biblioteca pública por perto, e a escola, quando tem sala de leitura, nem sempre a abre fora do horário das aulas. Além disso, o preço de um livro novo pesa no orçamento de muitas famílias. Assim, o jovem que mais precisaria deles para ampliar o seu repertório é justamente o que encontra mais barreiras.",
        "Em segundo lugar, a leitura muitas vezes chega ao estudante apenas como obrigação. Quando a obra aparece só como matéria de prova, com fichas e perguntas de resposta única, o aluno aprende a associar ler a ser cobrado, e não a descobrir histórias e ideias. O educador Paulo Freire defendia que a leitura do mundo precede a leitura da palavra, isto é, que ler ganha sentido quando se liga à vida de quem lê. Desse modo, uma escola que não conversa com os interesses dos jovens acaba afastando-os das obras.",
        "Portanto, ampliar o hábito de ler entre os jovens exige aproximar os livros de quem está longe deles e mudar a forma de apresentá-los. Para isso, as prefeituras devem abrir as salas de leitura das escolas públicas também nos fins de semana, por meio de convênios com bibliotecas comunitárias, a fim de que os estudantes tenham um lugar perto de casa para ler e pegar obras emprestadas. Além disso, as escolas precisam criar clubes em que os próprios alunos escolham parte das obras, por exemplo entre quadrinhos, poesia e romances, para que ler deixe de ser só tarefa e passe a ser escolha. Assim, o direito à educação ficará mais próximo de todos.",
      ].join("\n"),
      comentarios: [
        "A introdução usa um repertório verificável (a educação como direito de todos na Constituição) e termina com a tese, que anuncia os dois argumentos.",
        "Cada parágrafo de desenvolvimento começa com um conector de ordem (“Em primeiro lugar”, “Em segundo lugar”) e defende um argumento só.",
        "O repertório do terceiro parágrafo (Paulo Freire) não fica solto: a frase seguinte explica como ele se liga ao argumento.",
        "A conclusão retoma a tese e traz duas propostas, cada uma respondendo a um argumento, com agente, ação, meio, finalidade e detalhamento.",
      ],
    },
  },

  /* ---------------------------------------------------------- Argumentação e Repertório --- */
  {
    id: "argumentacao-complete-paragrafo",
    trilhaId: "redacao-argumentacao",
    depoisDe: "redacao-argumentacao-01-tipos-argumento",
    titulo: "Complete o parágrafo",
    modo: "trecho",
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Complete o parágrafo a partir do tópico frasal dado.",
      tema: "Os impactos do excesso de telas na saúde mental de adolescentes",
      instrucao:
        "Continue o parágrafo com 3 ou 4 frases: explique por que isso acontece (causa), mostre uma consequência para a saúde ou para os estudos e feche ligando ao tema. Não repita o tópico frasal: comece a partir dele.",
      textoDeApoio: {
        rotulo: "Tópico frasal (início do parágrafo)",
        texto: "O uso excessivo de telas prejudica o sono de muitos adolescentes.",
      },
      limites: { min: 150, max: 1200 },
    },
    modelo: {
      texto:
        "Isso acontece porque o celular costuma acompanhar o jovem até a cama, e cada notificação ou vídeo novo convida a ficar acordado mais alguns minutos. Como resultado, a noite fica mais curta, e o estudante chega à escola cansado, com mais dificuldade de prestar atenção e de lembrar o que estudou. Com o tempo, dormir pouco também afeta o humor e deixa o dia mais pesado. Dessa forma, o excesso de telas não fica restrito ao momento em que se usa o aparelho: ele se estende ao dia seguinte e à saúde mental do adolescente.",
      comentarios: [
        "“Isso acontece porque” liga a continuação ao tópico frasal e já entra na causa.",
        "“Como resultado” marca a consequência; o exemplo (cansaço e atenção na escola) é do dia a dia, sem número inventado.",
        "A frase final volta ao tema (saúde mental), fechando o parágrafo.",
      ],
    },
  },
  {
    id: "argumentacao-repertorio",
    trilhaId: "redacao-argumentacao",
    depoisDe: "redacao-argumentacao-03-costurar-repertorio",
    titulo: "Escreva o repertório e ligue ao tema",
    modo: "trecho",
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Escreva um trecho com um repertório e mostre como ele se liga ao tema.",
      tema: "A importância da educação financeira para os jovens brasileiros",
      instrucao:
        "Em 3 a 5 frases: apresente um repertório que você conheça bem (uma lei, um livro, um filme, um conceito, um fato histórico), diga o que ele mostra e explique como isso ajuda a defender um ponto de vista sobre o tema. Não invente dado nem citação: se não tiver certeza do número ou da frase exata, fale da ideia.",
      limites: { min: 150, max: 1200 },
    },
    modelo: {
      texto:
        "O Estatuto da Criança e do Adolescente, de 1990, trata crianças e adolescentes como pessoas em desenvolvimento, que precisam de proteção e de preparo para a vida adulta. Ensinar a lidar com o dinheiro faz parte desse preparo: o jovem que aprende a planejar gastos, a comparar preços e a desconfiar de crédito fácil chega à vida adulta mais protegido contra dívidas. Assim, a educação financeira é uma forma de cumprir, na prática, a ideia de proteção que o próprio Estatuto defende.",
      comentarios: [
        "O repertório é verificável e foi dito com cuidado: o trecho fala da ideia do Estatuto (proteção a quem está em desenvolvimento), sem inventar artigo nem citação.",
        "A segunda frase é a ponte: explica por que o repertório tem a ver com educação financeira.",
        "A última frase usa o repertório para defender um ponto de vista, em vez de deixá-lo como enfeite.",
      ],
    },
  },
  {
    id: "argumentacao-coesao",
    trilhaId: "redacao-argumentacao",
    depoisDe: "redacao-argumentacao-06-coesao-paragrafos",
    titulo: "Reescreva o trecho com mais coesão",
    modo: "trecho",
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Reescreva o trecho abaixo com mais coesão.",
      tema: "Caminhos para combater a desinformação nas redes sociais",
      instrucao:
        "Mantenha as ideias, mas ligue as frases com conectivos (causa, consequência, adição), troque as repetições de “as notícias falsas” e “as pessoas” por pronomes ou sinônimos e feche com uma frase que diga por que isso importa.",
      textoDeApoio: {
        rotulo: "Trecho para reescrever (frases soltas, escrito pelo Foca)",
        texto:
          "As notícias falsas se espalham rápido. As pessoas compartilham sem ler. As notícias falsas parecem verdadeiras. As notícias falsas causam medo. As pessoas tomam decisões erradas. Isso é um problema.",
      },
      limites: { min: 120, max: 1200 },
    },
    modelo: {
      texto:
        "As notícias falsas se espalham rapidamente, sobretudo porque muitas pessoas as compartilham sem ler além do título. Além disso, esses conteúdos costumam imitar a aparência de reportagens verdadeiras, o que dificulta desconfiar deles. Como provocam medo, acabam levando os leitores a tomar decisões erradas, por exemplo, sobre a própria saúde. Por isso, a desinformação não fica presa à internet: ela tem efeitos concretos na vida de quem é enganado.",
      comentarios: [
        "Os conectivos mostram a relação entre as ideias: causa (“porque”, “Como”), adição (“Além disso”) e conclusão (“Por isso”).",
        "As repetições sumiram: “as notícias falsas” virou “esses conteúdos” e “as”; “as pessoas” virou “os leitores”.",
        "A última frase faz o que o trecho original não fazia: diz por que o problema importa.",
      ],
    },
  },
  {
    id: "argumentacao-texto-completo",
    trilhaId: "redacao-argumentacao",
    depoisDe: "redacao-argumentacao-06-coesao-paragrafos",
    titulo: "Texto completo",
    modo: "completo",
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Escreva uma redação completa, do tipo dissertativo-argumentativo, sobre o tema abaixo.",
      tema: "O combate ao bullying nas escolas brasileiras",
      instrucao:
        "Defenda um ponto de vista com dois argumentos bem desenvolvidos, use pelo menos um repertório que você conheça bem e ligue os parágrafos com conectivos. Feche com uma proposta de intervenção completa.",
      limites: COMPLETO,
    },
    modelo: {
      texto: [
        "A Constituição de 1988 coloca a dignidade da pessoa humana entre os fundamentos da República, e a escola deveria ser um dos primeiros lugares em que esse princípio é vivido. No entanto, o bullying, a agressão repetida contra um mesmo estudante, ainda faz parte da rotina de muitas escolas brasileiras. Esse problema persiste porque costuma ser tratado como brincadeira e porque a escola nem sempre sabe como agir quando ele acontece.",
        "Em primeiro lugar, a banalização das agressões faz com que elas se repitam. Apelidos ofensivos, exclusão de grupos e piadas sobre a aparência de alguém muitas vezes são vistos como parte normal da adolescência, tanto por quem pratica quanto por quem assiste. Como ninguém reage, o agressor entende que pode continuar, e a vítima passa a acreditar que o problema é ela. Dessa forma, o silêncio coletivo transforma uma violência séria em hábito.",
        "Além disso, embora uma lei federal de 2015 já preveja o combate à intimidação sistemática nas escolas, muitas delas ainda não têm um caminho claro para lidar com os casos. Quando o estudante agredido procura ajuda e ouve apenas que deve ignorar, ele aprende que contar não adianta. Punições isoladas, sem conversa, também raramente mudam quem agride. Por isso, sem um plano conhecido por todos, cada caso depende da boa vontade de um professor, e muitos ficam sem resposta.",
        "Portanto, enfrentar o bullying exige quebrar o silêncio e dar às escolas um plano de ação. Para isso, as secretarias de educação devem criar protocolos de atendimento aos casos, por meio da formação dos professores e de um canal de denúncia que preserve a identidade de quem relata, a fim de que nenhum estudante agredido fique sem resposta. Ademais, as escolas precisam promover rodas de conversa com as turmas e as famílias, especialmente no início do ano letivo, para que as agressões deixem de ser vistas como brincadeira. Assim, a dignidade prevista na Constituição poderá ser vivida também no pátio e na sala de aula.",
      ].join("\n"),
      comentarios: [
        "A introdução define o problema (agressão repetida) para não tangenciar o tema e anuncia os dois argumentos na tese.",
        "O segundo parágrafo explica o mecanismo (ninguém reage, o agressor continua) em vez de só afirmar que o bullying é ruim.",
        "O repertório legal do terceiro parágrafo é dito pela ideia, sem número de lei nem citação inventada, e serve ao argumento: a lei existe, falta o caminho na escola.",
        "A conclusão volta à Constituição citada na introdução, fechando o texto em círculo, e as duas propostas respondem aos dois argumentos.",
      ],
    },
  },

  /* ---------------------------------------------------------- As 5 Competências na banca --- */
  {
    id: "competencias-desvios-c1",
    trilhaId: "redacao-competencias",
    depoisDe: "redacao-competencias-01-c1-norma-culta-sob-pressao",
    titulo: "Reescreva o trecho corrigindo os desvios (C1)",
    modo: "trecho",
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Reescreva o trecho abaixo corrigindo os desvios da norma-padrão.",
      tema: "Caminhos para ampliar a doação de sangue no Brasil",
      instrucao:
        "O trecho tem 5 desvios: uma vírgula entre sujeito e verbo, uma troca de “mas” por “mais”, um erro de concordância, um de regência e um uso errado de “aonde”. Reescreva o trecho inteiro corrigindo-os, sem mudar as ideias.",
      textoDeApoio: {
        rotulo: "Trecho com desvios (escrito pelo Foca para treino)",
        texto:
          "A doação de sangue, é um gesto simples mais que salva vidas. Muitas pessoas tem medo de agulha ou acham que o processo demora muito, por isso, nunca foram em um hemocentro. Se mais gente soubesse que a doação é segura, haveria menos falta de sangue nos hospitais, aonde ele é usado todos os dias.",
      },
      limites: { min: 120, max: 1200 },
    },
    modelo: {
      texto:
        "A doação de sangue é um gesto simples, mas que salva vidas. Muitas pessoas têm medo de agulha ou acham que o processo demora muito e, por isso, nunca foram a um hemocentro. Se mais gente soubesse que a doação é segura, haveria menos falta de sangue nos hospitais, onde ele é usado todos os dias.",
      comentarios: [
        "A vírgula entre sujeito e verbo saiu: “A doação de sangue é”. E “mais” (quantidade) virou “mas” (oposição), com vírgula antes.",
        "“Muitas pessoas têm”: com sujeito no plural, o verbo “ter” leva acento circunflexo.",
        "Na norma-padrão, quem vai, vai a algum lugar: “foram a um hemocentro”. E “aonde” só acompanha verbo de movimento; aqui o certo é “onde”.",
      ],
    },
  },
  {
    id: "competencias-proposta-dh",
    trilhaId: "redacao-competencias",
    depoisDe: "redacao-competencias-05-c5-proposta-detalhada",
    titulo: "Escreva a proposta respeitando os direitos humanos (C5)",
    modo: "trecho",
    checaProposta: true,
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Escreva uma nova proposta de intervenção para o problema abaixo, respeitando os direitos humanos.",
      tema: "Desafios para a segurança no trânsito das cidades brasileiras",
      instrucao:
        "A proposta dada desrespeita os direitos humanos: expõe pessoas à humilhação e tira um direito para sempre. Escreva outra para o mesmo problema (acidentes causados por quem dirige depois de beber), com os 5 elementos: agente, ação, meio, finalidade e detalhamento.",
      textoDeApoio: {
        rotulo: "Proposta que desrespeita os direitos humanos (escrita pelo Foca para treino)",
        texto:
          "Para acabar com os acidentes, os motoristas flagrados dirigindo depois de beber deveriam ter o rosto divulgado na televisão e ser proibidos para sempre de trabalhar.",
      },
      limites: { min: 200, max: 1500 },
    },
    modelo: {
      texto:
        "Portanto, é preciso reduzir os acidentes causados pela mistura de álcool e direção sem abrir mão dos direitos de ninguém. Para isso, os departamentos de trânsito devem ampliar as blitze educativas nos fins de semana, por meio de parcerias com bares e casas de show, que podem oferecer, por exemplo, transporte por aplicativo com desconto, a fim de que quem bebeu tenha uma alternativa segura para voltar para casa. Além disso, as autoescolas precisam incluir nas aulas relatos de vítimas e de famílias, para que os futuros motoristas entendam o risco antes de pegar o volante.",
      comentarios: [
        "A proposta trata o motorista como alguém a ser orientado e responsabilizado pela lei, não humilhado: respeitar os direitos humanos é condição para não zerar a C5.",
        "Agente (departamentos de trânsito), ação (ampliar blitze educativas), meio (parcerias com bares e casas de show), finalidade (alternativa segura para voltar) e detalhamento (transporte por aplicativo com desconto).",
        "Uma segunda proposta curta, com agente, ação e finalidade, reforça a primeira sem repetir a mesma estrutura.",
      ],
    },
  },
  {
    id: "competencias-conclusao-desconectada",
    trilhaId: "redacao-competencias",
    depoisDe: "redacao-competencias-06-casos-banca-anula-derruba",
    titulo: "Reescreva a conclusão desconectada",
    modo: "trecho",
    checaProposta: true,
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Reescreva a conclusão abaixo para que ela responda aos argumentos do texto.",
      tema: "A importância da vacinação para a saúde coletiva no Brasil",
      instrucao:
        "A conclusão dada não fala de vacinação nem responde aos argumentos. Reescreva: retome o problema e proponha soluções ligadas aos dois argumentos, com os 5 elementos da proposta.",
      textoDeApoio: {
        rotulo: "Argumentos do texto e a conclusão desconectada (escritos pelo Foca para treino)",
        texto:
          "Argumentos: 1. Boatos sobre vacinas circulam nas redes e geram medo. 2. O horário dos postos de saúde dificulta a vida de quem trabalha. Conclusão escrita: Portanto, a saúde é muito importante e todos devem cuidar dela. O governo deve construir mais hospitais para que as pessoas sejam bem atendidas.",
      },
      limites: { min: 200, max: 1500 },
    },
    modelo: {
      texto:
        "Portanto, ampliar a vacinação depende de combater o medo e de facilitar o caminho até o posto. Para isso, o Ministério da Saúde deve produzir campanhas nas redes sociais com profissionais de saúde respondendo às dúvidas mais comuns, como a segurança das vacinas, por meio de vídeos curtos e linguagem simples, a fim de desmentir os boatos que afastam as famílias das vacinas. Além disso, as prefeituras devem abrir postos de vacinação em horário estendido e aos sábados, para que quem trabalha durante a semana também consiga se vacinar. Assim, a proteção coletiva deixará de depender da sorte de cada um.",
      comentarios: [
        "A primeira frase retoma o tema (vacinação) e resume os dois problemas do texto: medo e acesso.",
        "Cada proposta responde a um argumento: campanhas contra os boatos e horário estendido para quem trabalha.",
        "A conclusão original falava de saúde em geral e de hospitais: solução genérica, desligada do que foi discutido, enfraquece a C5 e a coerência do texto.",
      ],
    },
  },
  {
    id: "competencias-texto-completo",
    trilhaId: "redacao-competencias",
    depoisDe: "redacao-competencias-06-casos-banca-anula-derruba",
    titulo: "Texto completo",
    modo: "completo",
    autoria: "foca",
    exercicio: {
      type: "escrita",
      enunciado: "Escreva uma redação completa, do tipo dissertativo-argumentativo, sobre o tema abaixo.",
      tema: "Caminhos para reduzir o lixo plástico no Brasil",
      instrucao:
        "Escreva pensando nas cinco competências: norma-padrão (C1), tema e estrutura (C2), argumentos organizados (C3), conectivos variados (C4) e proposta completa que respeite os direitos humanos (C5).",
      limites: COMPLETO,
    },
    modelo: {
      texto: [
        "O plástico mudou a vida moderna: é barato, leve e está em quase tudo o que se compra. O mesmo material que facilita o dia a dia, porém, demora muito tempo para se decompor e, quando descartado de forma errada, acaba em rios, praias e no mar. No Brasil, o acúmulo desse lixo continua por dois motivos principais: o consumo de descartáveis como hábito e a coleta seletiva ainda limitada em muitas cidades.",
        "Em primeiro lugar, o uso de descartáveis virou hábito. Copos, canudos, sacolas e embalagens individuais são usados por poucos minutos e jogados fora, quase sempre sem que ninguém pense para onde vão. Como o custo ambiental não aparece no preço, a escolha mais prática parece também a mais barata. Dessa forma, o problema começa antes do lixo: começa na decisão de compra, repetida todos os dias por muita gente.",
        "Além disso, mesmo quem separa o lixo nem sempre encontra para onde levá-lo. Em muitos municípios, a coleta seletiva não chega a todos os bairros, e as cooperativas de catadores, que fazem boa parte da triagem do material reciclável, trabalham com pouca estrutura. A Política Nacional de Resíduos Sólidos, de 2010, prevê a responsabilidade compartilhada entre governo, empresas e consumidores pelo destino desses resíduos, mas essa divisão de tarefas ainda não funciona plenamente na prática. Por isso, parte do plástico que poderia voltar à indústria termina em lixões ou na natureza.",
        "Portanto, reduzir o lixo plástico exige mudar o hábito de consumo e fortalecer a reciclagem. Para isso, as prefeituras devem ampliar a coleta seletiva a todos os bairros, por meio de contratos com cooperativas de catadores que incluam equipamentos e pagamento justo pelo serviço, a fim de que o material separado nas casas chegue de fato à reciclagem. Ao mesmo tempo, as escolas podem promover campanhas de troca de descartáveis por objetos reutilizáveis, como garrafas e sacolas de pano, para que os estudantes levem o hábito para casa. Assim, o plástico continuará útil sem se transformar em herança para as próximas gerações.",
      ].join("\n"),
      comentarios: [
        "C1: frases completas, pontuação cuidadosa e vocabulário formal, sem gíria.",
        "C2 e C3: o tema é tratado com o recorte pedido (lixo plástico, no Brasil), e cada parágrafo de desenvolvimento defende um argumento da tese.",
        "C4: conectivos variados entre os parágrafos e dentro deles (“porém”, “Em primeiro lugar”, “Além disso”, “Por isso”, “Portanto”).",
        "C5: a primeira proposta tem agente, ação, meio, finalidade e detalhamento; a segunda responde ao primeiro argumento (o hábito de consumo).",
      ],
    },
  },
];

export function tarefaDeEscrita(id: string): WritingTask | null {
  return TAREFAS_DE_ESCRITA.find((t) => t.id === id) ?? null;
}

/** Tarefas que aparecem depois de uma lição, na ordem do catálogo. */
export function tarefasDepoisDe(licaoId: string): WritingTask[] {
  return TAREFAS_DE_ESCRITA.filter((t) => t.depoisDe === licaoId);
}
