import type { Trilha } from "@/lib/lessons/types";
import { LICOES as pontuacao } from "./pontuacao/manifest";
import { LICOES as fonologiaOrtografia } from "./fonologia-ortografia/manifest";
import { LICOES as crase } from "./crase/manifest";
import { LICOES as concordancia } from "./concordancia/manifest";
import { LICOES as regenciaColocacao } from "./regencia-colocacao/manifest";
import { LICOES as classes1 } from "./classes-1/manifest";
import { LICOES as verbo } from "./verbo/manifest";
import { LICOES as classes2Formacao } from "./classes-2-formacao/manifest";
import { LICOES as sintaxe1 } from "./sintaxe-1/manifest";
import { LICOES as sintaxe2 } from "./sintaxe-2/manifest";
import { LICOES as semantica } from "./semantica/manifest";
import { LICOES as interpretacao } from "./interpretacao/manifest";
import { LICOES as redacaoEstrutura } from "./redacao-estrutura/manifest";
import { LICOES as redacaoArgumentacao } from "./redacao-argumentacao/manifest";
import { LICOES as redacaoCompetencias } from "./redacao-competencias/manifest";

/**
 * Trilhas do micro-treino de redação (SDD 12, D3).
 *
 * A ordem do array É a ordem de desbloqueio, e ela é deliberada: os três
 * blocos de **redação** vêm primeiro porque são o pilar que o pitch demonstra;
 * a **base** de língua portuguesa vem depois, como o alicerce que sustenta a
 * nota nas competências 1 e 4. Quem abre o app pela primeira vez (o QR code do
 * pitch) cai direto na estrutura da dissertação, não em fonologia.
 */
export const TRILHAS: Trilha[] = [
  {
    id: "redacao-estrutura",
    nome: "Estrutura da Dissertação",
    descricao: "Introdução, desenvolvimento e a proposta de intervenção: o esqueleto da nota 1000.",
    eixo: "redacao",
    examProfile: "enem",
    licoes: redacaoEstrutura,
  },
  {
    id: "redacao-argumentacao",
    nome: "Argumentação e Repertório",
    descricao: "Argumento sólido e repertório legitimado: a alma da competência 3.",
    eixo: "redacao",
    examProfile: "enem",
    licoes: redacaoArgumentacao,
  },
  {
    id: "redacao-competencias",
    nome: "As 5 Competências na banca",
    descricao: "O que cada corretor procura, competência por competência, sem mistério.",
    eixo: "redacao",
    examProfile: "enem",
    licoes: redacaoCompetencias,
  },
  {
    id: "pontuacao",
    nome: "Pontuação e Coesão",
    descricao: "Vírgulas, conectivos e a costura do texto que valem pontos na competência 4.",
    eixo: "base",
    examProfile: "enem",
    licoes: pontuacao,
  },
  {
    id: "interpretacao",
    nome: "Interpretação de Texto ENEM",
    descricao: "O assunto número 1 do ENEM: ler nas entrelinhas, inferir e não cair em pegadinha.",
    eixo: "base",
    examProfile: "enem",
    licoes: interpretacao,
  },
  {
    id: "crase",
    nome: "Crase sem medo",
    descricao: "A fusão mais temida da prova, domada regra por regra.",
    eixo: "base",
    examProfile: "enem",
    licoes: crase,
  },
  {
    id: "concordancia",
    nome: "Concordância",
    descricao: "Verbo e nome combinando sempre: os casos que a banca adora cobrar.",
    eixo: "base",
    examProfile: "enem",
    licoes: concordancia,
  },
  {
    id: "fonologia-ortografia",
    nome: "Fonologia, Acentuação e Ortografia",
    descricao:
      "Som, sílaba e escrita sem medo: acentos, porquês e as palavras que derrubam todo mundo.",
    eixo: "base",
    examProfile: "enem",
    licoes: fonologiaOrtografia,
  },
  {
    id: "regencia-colocacao",
    nome: "Regência e Colocação",
    descricao: "Quem rege o quê, e onde o pronome mora: assistir A, visar A, obedecer A.",
    eixo: "base",
    examProfile: "enem",
    licoes: regenciaColocacao,
  },
  {
    id: "classes-1",
    nome: "Classes de Palavras I",
    descricao: "Substantivo, adjetivo, pronome e companhia: a matéria-prima de toda frase.",
    eixo: "base",
    examProfile: "enem",
    licoes: classes1,
  },
  {
    id: "verbo",
    nome: "O Verbo",
    descricao: "Tempos, modos e vozes: o motor da frase, dominado de ponta a ponta.",
    eixo: "base",
    examProfile: "enem",
    licoes: verbo,
  },
  {
    id: "classes-2-formacao",
    nome: "Classes de Palavras II e Formação",
    descricao: "Advérbio, conjunção, preposição e como as palavras nascem umas das outras.",
    eixo: "base",
    examProfile: "enem",
    licoes: classes2Formacao,
  },
  {
    id: "sintaxe-1",
    nome: "Sintaxe do Período Simples",
    descricao: "Sujeito, predicado e cada termo no seu devido lugar.",
    eixo: "base",
    examProfile: "enem",
    licoes: sintaxe1,
  },
  {
    id: "sintaxe-2",
    nome: "Período Composto",
    descricao:
      "Coordenação, subordinação e a morfossintaxe do QUE: a arquitetura das frases longas.",
    eixo: "base",
    examProfile: "enem",
    licoes: sintaxe2,
  },
  {
    id: "semantica",
    nome: "Semântica e Estilística",
    descricao: "Sentido, figuras de linguagem e variação: o bloco que mais cai na prova.",
    eixo: "base",
    examProfile: "enem",
    licoes: semantica,
  },
];

export function trilhaById(id: string): Trilha | undefined {
  return TRILHAS.find((t) => t.id === id);
}

export function lessonById(
  licaoId: string,
): { trilha: Trilha; lesson: Trilha["licoes"][number] } | null {
  for (const trilha of TRILHAS) {
    const lesson = trilha.licoes.find((l) => l.id === licaoId);
    if (lesson) return { trilha, lesson };
  }
  return null;
}

/** Lista achatada na ordem de desbloqueio — usada pelo "continuar de onde parou". */
export function allLessonsInOrder(): Array<{ trilha: Trilha; lesson: Trilha["licoes"][number] }> {
  return TRILHAS.flatMap((trilha) => trilha.licoes.map((lesson) => ({ trilha, lesson })));
}

export const TOTAL_LICOES = TRILHAS.reduce((n, t) => n + t.licoes.length, 0);
