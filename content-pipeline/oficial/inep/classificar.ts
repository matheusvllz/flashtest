/**
 * Classificação automática de questão oficial numa habilidade da taxonomia (`src/content/taxonomy`).
 * Heurística por área (número da questão) e palavras-chave do enunciado e das alternativas. Nunca inventa id:
 * só devolve habilidade que existe e está ativa; sem pista, cai na habilidade geral da área com confiança
 * "baixa" (registrada no relatório para revisão).
 */
import { SKILL_MAP } from "@/content/taxonomy";
import type { Idioma } from "./tipos";

export type Confianca = "alta" | "media" | "baixa";

export interface Classificacao {
  skillId: string;
  confianca: Confianca;
  pistas: string[];
}

type Regra = { skill: string; termos: RegExp[] };

/** Termo no começo de palavra (o `\b` do JS não entende letra acentuada). */
const R = (...termos: string[]) =>
  termos.map(
    (t) => new RegExp(`(?<![\\p{L}\\p{N}])${t.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`, "iu"),
  );

const LC: Regra[] = [
  {
    skill: "por:sentido-figuras-linguagem",
    termos: R(
      "metáfora",
      "metonímia",
      "ironia",
      "figura de linguagem",
      "sentido figurado",
      "hipérbole",
      "personificação",
      "eufemismo",
      "antítese",
      "paradoxo",
    ),
  },
  {
    skill: "lit:caracteristicas-escolas-literarias",
    termos: R(
      "romantismo",
      "realismo",
      "naturalismo",
      "parnasian",
      "simbolismo",
      "barroco",
      "arcadismo",
      "escola literária",
      "estética literária",
    ),
  },
  {
    skill: "lit:modernismo-fases-brasil",
    termos: R("modernis", "semana de arte moderna", "geração de 45", "antropofag"),
  },
  {
    skill: "lit:interpretacao-texto-literario",
    termos: R(
      "poema",
      "poeta",
      "verso",
      "estrofe",
      "romance",
      "narrador",
      "personagem",
      "conto",
      "crônica",
      "literári",
      "eu lírico",
    ),
  },
  { skill: "por:concordancia-verbal-nominal", termos: R("concordância") },
  { skill: "por:regencia-verbal-nominal", termos: R("regência") },
  { skill: "por:crase-regra-basica", termos: R("crase", "acento grave") },
  {
    skill: "por:pontuacao-virgula-regras",
    termos: R("vírgula", "pontuação", "travessão", "aspas", "dois-pontos", "ponto e vírgula"),
  },
  {
    skill: "por:formacao-palavras-processos",
    termos: R("neologismo", "sufixo", "prefixo", "formação de palavras", "composição", "derivação"),
  },
  {
    skill: "por:tempos-verbais-emprego",
    termos: R(
      "tempo verbal",
      "forma verbal",
      "pretérito",
      "futuro do",
      "modo imperativo",
      "modo subjuntivo",
    ),
  },
  {
    skill: "por:sintaxe-periodo-composto",
    termos: R(
      "oração subordinada",
      "oração coordenada",
      "conjunção",
      "conectivo",
      "período composto",
      "articulador",
    ),
  },
  {
    skill: "por:classes-gramaticais-identificacao",
    termos: R("pronome", "advérbio", "adjetivo", "substantivo", "preposição", "classe gramatical"),
  },
  { skill: "por:ortografia-acentuacao", termos: R("ortografia", "acentuação", "grafia") },
];

const CH: Regra[] = [
  {
    skill: "fil:etica-correntes-filosoficas",
    termos: R(
      "ética",
      "moral",
      "virtude",
      "Aristóteles",
      "Kant",
      "Nietzsche",
      "Epicuro",
      "estoic",
      "utilitaris",
      "Sartre",
      "existencialis",
    ),
  },
  {
    skill: "fil:politica-poder-estado",
    termos: R(
      "Hobbes",
      "Locke",
      "Rousseau",
      "Maquiavel",
      "contrato social",
      "estado de natureza",
      "soberan",
      "Montesquieu",
      "Hannah Arendt",
      "Platão",
    ),
  },
  {
    skill: "fil:epistemologia-conhecimento",
    termos: R(
      "Descartes",
      "Hume",
      "empiris",
      "racionalis",
      "conhecimento",
      "Bacon",
      "método científico",
      "Sócrates",
      "filósof",
    ),
  },
  {
    skill: "soc:desigualdade-social-estrutura",
    termos: R(
      "desigualdade",
      "classe social",
      "pobreza",
      "renda",
      "estratifica",
      "Marx",
      "trabalhador",
    ),
  },
  {
    skill: "soc:movimentos-sociais-cidadania",
    termos: R(
      "movimento social",
      "movimentos sociais",
      "cidadania",
      "direitos",
      "democracia",
      "participação política",
      "sufrágio",
      "voto",
    ),
  },
  {
    skill: "soc:cultura-identidade-sociedade",
    termos: R(
      "cultura",
      "identidade",
      "indígena",
      "quilombola",
      "etnia",
      "Durkheim",
      "Weber",
      "sociólog",
      "patrimônio",
    ),
  },
  {
    skill: "his:ditadura-militar-contexto",
    termos: R("ditadura", "regime militar", "AI-5", "1964", "golpe militar", "anistia"),
  },
  {
    skill: "his:era-vargas-politica-economia",
    termos: R("Vargas", "Estado Novo", "1930", "CLT", "trabalhismo"),
  },
  {
    skill: "his:guerra-fria-bipolaridade",
    termos: R("Guerra Fria", "União Soviética", "URSS", "socialis", "comunis", "Muro de Berlim"),
  },
  {
    skill: "his:brasil-colonia-economia-sociedade",
    termos: R(
      "colônia",
      "colonial",
      "escravi",
      "engenho",
      "metrópole",
      "capitania",
      "jesuíta",
      "bandeirante",
      "império",
      "monarquia",
      "século XVI",
      "século XVII",
      "século XVIII",
      "século XIX",
      "medieval",
      "feudal",
      "Idade Média",
      "revolução",
      "república",
    ),
  },
  {
    skill: "geo:climatologia-fenomenos",
    termos: R(
      "clima",
      "chuva",
      "precipitação",
      "temperatura",
      "massa de ar",
      "El Niño",
      "atmosfer",
      "relevo",
      "erosão",
      "solo",
      "rocha",
      "bacia hidrográfica",
      "rio",
    ),
  },
  {
    skill: "geo:urbanizacao-processos",
    termos: R(
      "urbaniza",
      "cidade",
      "metrópole",
      "urbano",
      "periferia",
      "favela",
      "migração",
      "êxodo",
    ),
  },
  {
    skill: "geo:meio-ambiente-impactos",
    termos: R(
      "ambiental",
      "desmatamento",
      "poluição",
      "impacto",
      "sustentab",
      "aquecimento",
      "efeito estufa",
      "agricultura",
      "agronegócio",
      "energia",
      "biocombust",
    ),
  },
  {
    skill: "geo:geopolitica-globalizacao",
    termos: R(
      "globaliza",
      "geopolít",
      "território",
      "fronteira",
      "conflito",
      "comércio internacional",
      "multinacional",
      "bloco econômico",
      "Mercosul",
    ),
  },
];

const CN: Regra[] = [
  {
    skill: "bio:genetica-leis-mendel",
    termos: R(
      "gene",
      "genétic",
      "alelo",
      "herança",
      "cromossom",
      "DNA",
      "hereditár",
      "genótipo",
      "fenótipo",
    ),
  },
  {
    skill: "bio:evolucao-selecao-natural",
    termos: R("evolu", "seleção natural", "Darwin", "Lamarck", "adaptação", "especiação"),
  },
  {
    skill: "bio:ecologia-relacoes-ecossistema",
    termos: R(
      "ecossistema",
      "cadeia alimentar",
      "teia alimentar",
      "população",
      "comunidade",
      "bioma",
      "espécie",
      "predador",
      "parasit",
      "mutualis",
      "ecológic",
    ),
  },
  {
    skill: "bio:fisiologia-humana-sistemas",
    termos: R(
      "sangue",
      "hormônio",
      "órgão",
      "sistema nervoso",
      "digest",
      "respiração",
      "vacina",
      "imun",
      "doença",
      "vírus",
      "bactéria",
      "músculo",
      "rim",
    ),
  },
  {
    skill: "bio:organelas-funcao",
    termos: R(
      "organela",
      "mitocôndria",
      "cloroplasto",
      "ribossomo",
      "célula",
      "celular",
      "fotossíntese",
    ),
  },
  {
    skill: "qui:quimica-organica-funcoes",
    termos: R(
      "orgânic",
      "hidrocarboneto",
      "álcool",
      "éster",
      "ácido carboxílico",
      "cetona",
      "aldeído",
      "amina",
      "polímero",
      "isômero",
    ),
  },
  {
    skill: "qui:estequiometria-calculo-mols",
    termos: R("mol", "massa molar", "estequiom", "concentração", "g/mol", "mol/L", "rendimento"),
  },
  {
    skill: "qui:tabela-periodica-propriedades",
    termos: R(
      "tabela periódica",
      "eletronegativ",
      "raio atômico",
      "família",
      "ligação iônica",
      "ligação covalente",
    ),
  },
  {
    skill: "qui:estrutura-atomica-modelos",
    termos: R("átomo", "elétron", "próton", "nêutron", "isótopo", "modelo atômico", "radioativ"),
  },
  {
    skill: "fis:eletricidade-circuitos-basicos",
    termos: R(
      "circuito",
      "corrente elétrica",
      "resistor",
      "resistência",
      "tensão",
      "voltagem",
      "lâmpada",
      "potência elétrica",
      "ohm",
    ),
  },
  {
    skill: "fis:dinamica-leis-newton",
    termos: R("força", "atrito", "Newton", "aceleração", "massa", "peso", "inércia"),
  },
  {
    skill: "fis:energia-trabalho-conservacao",
    termos: R(
      "energia cinética",
      "energia potencial",
      "trabalho",
      "conservação da energia",
      "potência",
      "rendimento",
      "calor",
      "térmic",
    ),
  },
  {
    skill: "fis:cinematica-movimento-uniforme",
    termos: R("velocidade", "km/h", "m/s", "deslocamento", "movimento uniforme", "trajetória"),
  },
];

const MT: Regra[] = [
  {
    skill: "mat:probabilidade-evento-simples",
    termos: R("probabilidade", "sorteio", "chance", "aleatoriamente"),
  },
  {
    skill: "mat:analise-combinatoria-contagem",
    termos: R(
      "combinações",
      "anagrama",
      "maneiras distintas",
      "modos distintos",
      "possibilidades",
      "arranjo",
      "permutação",
    ),
  },
  { skill: "mat:media-mediana-moda", termos: R("média", "mediana", "moda", "desvio padrão") },
  {
    skill: "mat:porcentagem-fator-multiplicativo",
    termos: R("aumento de", "desconto de", "reajuste", "acréscimo de", "redução de"),
  },
  { skill: "mat:porcentagem-valor", termos: [/%/, ...R("por cento", "porcentagem", "percentual")] },
  {
    skill: "mat:volume-solidos-geometricos",
    termos: R(
      "volume",
      "cilindro",
      "cubo",
      "prisma",
      "esfera",
      "cone",
      "pirâmide",
      "paralelepípedo",
      "litro",
      "m³",
      "cm³",
    ),
  },
  {
    skill: "mat:area-perimetro-figuras-planas",
    termos: R(
      "área",
      "perímetro",
      "retângulo",
      "quadrado",
      "círculo",
      "circunferência",
      "m²",
      "cm²",
      "hexágono",
      "terreno",
    ),
  },
  {
    skill: "mat:trigonometria-triangulo-retangulo",
    termos: R("seno", "cosseno", "tangente", "ângulo", "triângulo retângulo", "hipotenusa"),
  },
  {
    skill: "mat:funcao-quadratica-vertice",
    termos: R("parábola", "quadrática", "vértice", "segundo grau"),
  },
  {
    skill: "mat:funcao-exponencial-crescimento",
    termos: R("exponencial", "dobra a cada", "meia-vida"),
  },
  { skill: "mat:logaritmo-propriedades", termos: R("logaritmo", "log ") },
  {
    skill: "mat:funcao-afim-grafico",
    termos: R("função afim", "função linear", "taxa de variação", "reta"),
  },
  { skill: "mat:leitura-grafico-tabela", termos: R("gráfico", "tabela", "quadro", "infográfico") },
  {
    skill: "mat:razao-proporcao",
    termos: R("razão", "proporção", "escala", "proporcional", "regra de três", "velocidade média"),
  },
  { skill: "mat:equacao-primeiro-grau", termos: R("equação", "incógnita") },
];

const PADRAO: Record<string, string> = {
  LC: "por:interpretacao-ideia-principal",
  CH: "geo:geopolitica-globalizacao",
  CN: "bio:ecologia-relacoes-ecossistema",
  MT: "mat:operacoes-fundamentais",
};

export function areaDaQuestao(numero: number): "LC" | "CH" | "CN" | "MT" {
  if (numero <= 45) return "LC";
  if (numero <= 90) return "CH";
  if (numero <= 135) return "CN";
  return "MT";
}

function ativa(id: string): boolean {
  return SKILL_MAP[id]?.status === "ativo";
}

export function classificar(numero: number, texto: string, idioma?: Idioma): Classificacao {
  if (idioma === "ingles") {
    const vocab = /\b(the (word|expression|term)|palavra|expressão|termo)\b/i.test(texto);
    const skill = vocab ? "ing:vocabulario-contexto" : "ing:interpretacao-texto-curto";
    return { skillId: skill, confianca: "media", pistas: ["questão de inglês"] };
  }
  const area = areaDaQuestao(numero);
  const regras = { LC, CH, CN, MT }[area];
  let melhor: { skill: string; n: number; pistas: string[] } | null = null;
  for (const r of regras) {
    if (!ativa(r.skill)) continue;
    const pistas = r.termos
      .filter((t) => t.test(texto))
      .map((t) => t.source.replace(/^\(\?<!\[\\p\{L\}\\p\{N\}\]\)/, ""));
    if (pistas.length && (!melhor || pistas.length > melhor.n))
      melhor = { skill: r.skill, n: pistas.length, pistas };
  }
  if (melhor)
    return {
      skillId: melhor.skill,
      confianca: melhor.n >= 2 ? "alta" : "media",
      pistas: melhor.pistas,
    };
  return { skillId: PADRAO[area], confianca: "baixa", pistas: [] };
}
