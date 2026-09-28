/**
 * Validação automática de item (docs/30 §19.5, Fase 9 do docs/31 F9.8).
 * Sem zod (nenhum schema zod existe pra `ItemMeta`/`Exercise` neste repo —
 * divergência já registrada na Fase 3, `docs/32`): validação de forma leve
 * (campos obrigatórios presentes/tipo certo) em vez de um schema formal.
 * Aulas usam `validateLessonSteps`/`validateCurriculumTree` já existentes
 * (docs/25 §6.5) — não reimplementados aqui.
 */
import type { Exercise } from "@/lib/lessons/types";

export interface ValidationIssue {
  rule: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  /** Alertas (docs/30 §19.5: "heurística só de alerta") — nunca bloqueiam `ok`. */
  warnings: ValidationIssue[];
}

function contarPalavras(texto: string): number {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function opcoesDoExercicio(ex: Exercise): { opcoes: string[]; correta: number } | null {
  switch (ex.type) {
    case "multipla-escolha":
    case "complete-lacuna":
    case "interpretacao":
      return { opcoes: ex.opcoes, correta: ex.correta };
    default:
      return null;
  }
}

function enunciadoDoExercicio(ex: Exercise): { texto: string; limiteMax: number } {
  switch (ex.type) {
    case "multipla-escolha":
      return { texto: ex.pergunta, limiteMax: 120 };
    case "interpretacao":
      return { texto: `${ex.texto} ${ex.pergunta}`, limiteMax: 250 };
    case "complete-lacuna":
      return { texto: ex.frase, limiteMax: 120 };
    case "encontre-o-erro":
      return { texto: ex.frase, limiteMax: 120 };
    case "ordenar":
      return { texto: ex.blocos.join(" "), limiteMax: 120 };
    case "verdadeiro-falso":
      return { texto: ex.afirmacao, limiteMax: 120 };
    case "parear":
      return { texto: ex.pares.map((p) => `${p.a} ${p.b}`).join(" "), limiteMax: 120 };
  }
}

const ALTERNATIVAS_PROIBIDAS = ["todas as anteriores", "nenhuma das anteriores", "todas as alternativas"];
// `(?<!R)`: "de R$ 2000 pra R$ 3041,75" não é `$...$` de LaTeX (falso positivo real, aula de exponencial).
const RE_LATEX = /\\\(|\\\[|(?<!R)\$[^$]+(?<!R)\$/;
const RE_TODAS_NENHUMA = /^(todas|nenhuma)\b.{0,20}\b(anteriores|acima|alternativas|opcoes)\b/;
const RE_PREFIXO_LETRA = /^\s*\(?[A-Ea-e]\)\s/;
const RE_RASCUNHO =/\b(espera[,.!]|deixe(-me)? (eu )?recalcular|recalculando|hmm+|na verdade,? errei|corrigindo:)/i;

export interface ValidateContext {
  /** `SKILL_MAP` (ou fatia) — pra checar existência/status da habilidade. */
  skillExists: (skillId: string) => boolean;
  skillActive: (skillId: string) => boolean;
  /** Enunciados normalizados de itens já publicados da MESMA habilidade — pra duplicata semântica. */
  existingStatementsBySkill: (skillId: string) => string[];
  /** Passos que o solucionador usou pra resolver (se disponível) — heurística de dificuldade coerente. */
  solutionSteps?: number;
}

/** 5-gramas de palavras normalizadas, pra similaridade de Jaccard. */
function fiveGrams(texto: string): Set<string> {
  const palavras = normalizar(texto).split(/\s+/).filter(Boolean);
  const grams = new Set<string>();
  for (let i = 0; i + 5 <= palavras.length; i++) grams.add(palavras.slice(i, i + 5).join(" "));
  if (grams.size === 0 && palavras.length > 0) grams.add(palavras.join(" "));
  return grams;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersecao = 0;
  for (const g of a) if (b.has(g)) intersecao++;
  const uniao = a.size + b.size - intersecao;
  return uniao === 0 ? 0 : intersecao / uniao;
}

export const LIMIAR_DUPLICATA = 0.6;

export function validateExercise(ex: Exercise, skillId: string, ctx: ValidateContext): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Habilidade existe e está ativa.
  if (!ctx.skillExists(skillId)) issues.push({ rule: "habilidade-existe", message: `habilidade "${skillId}" não existe na taxonomia` });
  else if (!ctx.skillActive(skillId)) issues.push({ rule: "habilidade-ativa", message: `habilidade "${skillId}" não está ativa` });

  // Gabarito dentro do intervalo + alternativas distintas + proibidas.
  const opcoesInfo = opcoesDoExercicio(ex);
  if (opcoesInfo) {
    const { opcoes, correta } = opcoesInfo;
    if (correta < 0 || correta >= opcoes.length) {
      issues.push({ rule: "gabarito-no-intervalo", message: `índice do gabarito (${correta}) fora do intervalo de opções (0-${opcoes.length - 1})` });
    }
    // Sem tirar acento: em questão de crase, "a" e "à" SÃO alternativas diferentes.
    const normalizadas = opcoes.map((o) => o.toLowerCase().replace(/\s+/g, " ").trim());
    if (new Set(normalizadas).size !== normalizadas.length) {
      issues.push({ rule: "alternativas-distintas", message: "há alternativas duplicadas (normalizadas)" });
    }
    for (const opcao of opcoes) {
      // "Todas as acima", "Nenhuma das opções" etc. (achado real, lote onda1-12) — não só a forma exata.
      if (ALTERNATIVAS_PROIBIDAS.includes(normalizar(opcao)) || RE_TODAS_NENHUMA.test(normalizar(opcao))) {
        issues.push({ rule: "sem-todas-nenhuma", message: `alternativa proibida: "${opcao}"` });
      }
      // "A) feliz" — a letra vem da posição na tela; embutida no texto fica errada depois do
      // rebalanceamento de posição (achado real, lote rep-03: 160 alternativas assim).
      if (RE_PREFIXO_LETRA.test(opcao)) {
        issues.push({ rule: "sem-prefixo-letra", message: `alternativa com letra embutida: "${opcao}"` });
      }
    }
  }

  // Enunciado: contagem de palavras.
  const { texto: enunciado, limiteMax } = enunciadoDoExercicio(ex);
  const palavrasEnunciado = contarPalavras(enunciado);
  if (palavrasEnunciado < 15 || palavrasEnunciado > limiteMax) {
    issues.push({ rule: "tamanho-enunciado", message: `enunciado com ${palavrasEnunciado} palavras (esperado 15-${limiteMax})` });
  }

  // Explicação: contagem de palavras.
  const palavrasExplicacao = contarPalavras(ex.explicacao);
  if (palavrasExplicacao < 25 || palavrasExplicacao > 80) {
    issues.push({ rule: "tamanho-explicacao", message: `explicação com ${palavrasExplicacao} palavras (esperado 25-80)` });
  }

  // Sem LaTeX.
  if (RE_LATEX.test(enunciado) || RE_LATEX.test(ex.explicacao)) {
    issues.push({ rule: "sem-latex", message: "contém notação LaTeX (\\(, \\[ ou $...$) — o balão/player renderiza texto puro" });
  }

  // Rascunho do modelo vazando na explicação (achado real, lote onda1-14: "Espera...", "Deixe recalcular").
  if (RE_RASCUNHO.test(ex.explicacao)) {
    issues.push({ rule: "sem-rascunho", message: "explicação tem rascunho do gerador (\"espera\", \"recalcular\"...) — não é texto pro aluno" });
  }

  // "Segundo o texto" sem texto de apoio.
  if (ex.type !== "interpretacao" && /segundo o texto/i.test(enunciado)) {
    issues.push({ rule: "segundo-o-texto-sem-texto", message: "menciona 'segundo o texto' sem ter texto de apoio (só 'interpretacao' tem)" });
  }

  // Imagem sem URL externa.
  if (ex.imagem && !ex.imagem.url.startsWith("/")) {
    issues.push({ rule: "sem-imagem-externa", message: `imagem.url não é um caminho controlado: "${ex.imagem.url}"` });
  }

  // Dificuldade coerente com a solução (heurística — só alerta).
  if (ctx.solutionSteps !== undefined && ctx.solutionSteps <= 2) {
    warnings.push({ rule: "dificuldade-coerente", message: `solução em ${ctx.solutionSteps} passo(s) — considere dificuldade ≤ 2` });
  }

  // Duplicata semântica (Jaccard de 5-gramas > 0,6 com item existente da mesma habilidade).
  const gramsNovo = fiveGrams(enunciado);
  for (const existente of ctx.existingStatementsBySkill(skillId)) {
    const similaridade = jaccard(gramsNovo, fiveGrams(existente));
    if (similaridade > LIMIAR_DUPLICATA) {
      issues.push({ rule: "duplicata-semantica", message: `similaridade de ${(similaridade * 100).toFixed(0)}% com item existente da mesma habilidade` });
      break;
    }
  }

  return { ok: issues.length === 0, issues, warnings };
}
