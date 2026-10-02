/**
 * Corretor e treino de redação (spec 49 §5.9, T-49.9.7 e T-49.9.8) — parte pura, sem servidor nem store.
 *
 * - O corretor devolve uma ESTIMATIVA por competência (C1–C5, 0–200 em passos de 40), com justificativa e o trecho do
 *   próprio texto que motivou a nota. Trecho que não está no texto do aluno é descartado (a IA não inventa citação).
 *   Rótulo fixo na tela: "Estimativa da Foca IA, não é a nota oficial".
 * - O treino por partes tem um tema da semana (temas de treino escritos pelo Foca, não temas oficiais) e quatro
 *   partes. Sem chave da IA, o comentário vem de uma checagem simples e diz que é automático.
 */
import { z } from "zod";
import { COPY } from "@/lib/copy";

export const NOTAS_POR_COMPETENCIA = [0, 40, 80, 120, 160, 200] as const;
export const TEXTO_MIN = 400;
export const TEXTO_MAX = 5000;
export const TEMA_MAX = 200;
export const PARTE_MIN = 20;
export const PARTE_MAX = 1500;

/** Versão da rubrica; muda quando o professor externo revisar o texto (B-040). */
export const VERSAO_RUBRICA = 1;

export interface CompetenciaCorrigida {
  c: 1 | 2 | 3 | 4 | 5;
  nota: number;
  justificativa: string;
  trecho: string | null;
}

export interface Correcao {
  competencias: CompetenciaCorrigida[];
  total: number;
  comentario: string;
}

const esquemaBruto = z.object({
  competencias: z
    .array(
      z.object({
        c: z.coerce.number().int().min(1).max(5),
        nota: z.coerce.number().min(0).max(200),
        justificativa: z.string().min(1).max(1200),
        trecho: z.string().max(600).nullish(),
      }),
    )
    .min(5)
    .max(5),
  comentario: z.string().max(1500).default(""),
});

function notaValida(n: number): number {
  return NOTAS_POR_COMPETENCIA.reduce((melhor, x) => (Math.abs(x - n) < Math.abs(melhor - n) ? x : melhor), 0);
}

function normalizar(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Lê a resposta da IA. `null` = resposta fora do formato (o servidor devolve a correção à cota e avisa). */
export function lerCorrecao(resposta: string, textoDoAluno: string): Correcao | null {
  const inicio = resposta.indexOf("{");
  const fim = resposta.lastIndexOf("}");
  if (inicio < 0 || fim <= inicio) return null;
  let bruto: unknown;
  try {
    bruto = JSON.parse(resposta.slice(inicio, fim + 1));
  } catch {
    return null;
  }
  const r = esquemaBruto.safeParse(bruto);
  if (!r.success) return null;
  const vistas = new Set(r.data.competencias.map((c) => c.c));
  if (vistas.size !== 5) return null;
  const texto = normalizar(textoDoAluno);
  const competencias = r.data.competencias
    .map((c) => {
      const trecho = c.trecho?.trim() ? c.trecho.trim() : null;
      return {
        c: c.c as CompetenciaCorrigida["c"],
        nota: notaValida(c.nota),
        justificativa: c.justificativa.trim(),
        trecho: trecho && texto.includes(normalizar(trecho)) ? trecho : null,
      };
    })
    .sort((a, b) => a.c - b.c);
  return { competencias, total: competencias.reduce((s, c) => s + c.nota, 0), comentario: r.data.comentario.trim() };
}

export const SISTEMA_CORRETOR = `Você é a Foca IA, corretora de treino de redação do ENEM para estudantes brasileiros.
Avalie o texto pelas cinco competências da matriz do ENEM:
C1 domínio da norma-padrão da língua escrita;
C2 compreensão da proposta e uso de repertório para desenvolver o tema em texto dissertativo-argumentativo;
C3 seleção e organização de informações, fatos e opiniões em defesa de um ponto de vista;
C4 conhecimento dos mecanismos linguísticos de coesão;
C5 proposta de intervenção que respeite os direitos humanos, com agente, ação, meio, finalidade e detalhamento.
Cada competência vale 0, 40, 80, 120, 160 ou 200.
Regras:
- Responda SÓ com um JSON: {"competencias":[{"c":1,"nota":0,"justificativa":"...","trecho":"..."}, ... 5 itens],"comentario":"..."}.
- "trecho" é uma frase copiada EXATAMENTE do texto do aluno que motivou a nota (ou null).
- Justificativa curta (até 3 frases), em português claro, falando com o aluno por "você", sem ironia e sem humilhar.
- Nunca invente citação, autor, lei, dado ou número. Não reescreva o texto do aluno inteiro.
- Se o texto fugir totalmente do tema ou não for dissertativo-argumentativo, diga isso nas justificativas.
- O "comentario" diz o ponto mais forte e a próxima coisa a melhorar, em até 3 frases.`;

export function mensagemDoCorretor(tema: string, texto: string): string {
  return `Tema: ${tema}\n\nTexto do aluno:\n${texto}`;
}

/* ----------------------------------------------------------------- treino por partes --- */

export type ParteDoTreino = "tese" | "argumento" | "repertorio" | "proposta";
export const PARTES_DO_TREINO: readonly ParteDoTreino[] = ["tese", "argumento", "repertorio", "proposta"];

/** Temas de treino (escritos pelo Foca no formato do ENEM; não são temas oficiais nem previsão de prova). */
export const TEMAS_DE_TREINO: readonly string[] = [
  "Os desafios para ampliar o acesso à leitura entre jovens no Brasil",
  "Caminhos para reduzir o desperdício de alimentos no Brasil",
  "Os impactos do excesso de telas na saúde mental de adolescentes",
  "Desafios para a valorização do trabalho de cuidado no Brasil",
  "A importância da educação financeira para os jovens brasileiros",
  "Caminhos para combater a desinformação nas redes sociais",
  "Desafios para garantir a mobilidade urbana nas grandes cidades brasileiras",
  "A persistência da evasão escolar no ensino médio brasileiro",
];

/** Segunda-feira da semana de `dia` (AAAA-MM-DD). */
export function segundaDaSemana(dia: string): string {
  const d = new Date(`${dia}T12:00:00Z`);
  const desloc = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - desloc);
  return d.toISOString().slice(0, 10);
}

export function temaDaSemana(dia: string): string {
  const semanas = Math.floor(Date.parse(`${segundaDaSemana(dia)}T12:00:00Z`) / (7 * 86_400_000));
  return TEMAS_DE_TREINO[((semanas % TEMAS_DE_TREINO.length) + TEMAS_DE_TREINO.length) % TEMAS_DE_TREINO.length];
}

const PEDIDO_DA_PARTE: Record<ParteDoTreino, string> = {
  tese: "a TESE (o ponto de vista que o texto vai defender, numa ou duas frases)",
  argumento: "UM ARGUMENTO que sustenta a tese (com explicação de causa ou consequência)",
  repertorio: "o REPERTÓRIO (uma referência de fora do texto e como ela se liga ao tema)",
  proposta: "a PROPOSTA DE INTERVENÇÃO (agente, ação, meio, finalidade e detalhamento)",
};

export function sistemaDoTreino(parte: ParteDoTreino, tema: string): string {
  return `Você é a Foca IA, treinando redação do ENEM com um estudante. Tema de treino: "${tema}".
O aluno escreveu só ${PEDIDO_DA_PARTE[parte]}. Comente SÓ essa parte, em até 5 frases, falando por "você":
1) o que já funciona; 2) o que falta ou está vago; 3) uma pergunta ou dica concreta para reescrever.
Nunca invente citação, autor, lei, dado ou número; se sugerir repertório, sugira o TIPO de fonte (por exemplo, "um dado de pesquisa oficial sobre…") sem inventar o conteúdo.
Não escreva a parte pelo aluno. Sem ironia, sem nota.`;
}

const ELEMENTOS_DA_PROPOSTA: { nome: keyof typeof COPY.redacaoIa.automaticos.elementos; sinais: RegExp }[] = [
  { nome: "agente", sinais: /\b(governo|estado|minist[ée]rio|escolas?|m[íi]dia|fam[íi]lias?|sociedade|ongs?|prefeituras?|congresso|empresas?)\b/i },
  { nome: "acao", sinais: /\b(deve|devem|precisa|precisam|cabe|caber[áa]|promover|criar|ampliar|investir|realizar|implementar)\b/i },
  { nome: "meio", sinais: /\b(por meio de|mediante|atrav[ée]s de|por interm[ée]dio de|com o uso de|via)\b/i },
  { nome: "finalidade", sinais: /\b(a fim de|para que|com o objetivo de|com a finalidade de|visando|para)\b/i },
  { nome: "detalhamento", sinais: /,\s*(que|o qual|a qual|como|por exemplo)\b|\bpor exemplo\b/i },
];

/** Comentário sem IA (sem chave configurada): checagem simples, sempre marcada como automática na tela. */
export function comentarioLocal(parte: ParteDoTreino, texto: string): string {
  const t = texto.trim();
  const frases = t.split(/[.!?]+/).filter((f) => f.trim().length > 0).length;
  const c = COPY.redacaoIa.automaticos;
  switch (parte) {
    case "tese":
      return frases > 2 ? c.teseLonga : c.tese;
    case "argumento":
      return /\b(porque|pois|j[áa] que|uma vez que|visto que|dessa forma|por isso|consequentemente|logo)\b/i.test(t)
        ? c.argumentoComConector
        : c.argumentoSemConector;
    case "repertorio":
      return frases < 2 ? c.repertorioCurto : c.repertorio;
    case "proposta": {
      const faltam = ELEMENTOS_DA_PROPOSTA.filter((e) => !e.sinais.test(t)).map((e) => c.elementos[e.nome]);
      return faltam.length === 0 ? c.propostaCompleta : c.propostaFaltam(faltam.join(", "));
    }
  }
}
