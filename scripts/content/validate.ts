/**
 * Validação automática de item (docs/30 §19.5, Fase 9 do docs/31 F9.8).
 * Sem zod (nenhum schema zod existe pra `ItemMeta`/`Exercise` neste repo —
 * divergência já registrada na Fase 3, `docs/32`): validação de forma leve
 * (campos obrigatórios presentes/tipo certo) em vez de um schema formal.
 * Aulas usam `validateLessonSteps`/`validateCurriculumTree` já existentes
 * (docs/25 §6.5) — não reimplementados aqui.
 */
import type { Exercise, ExerciseImage } from "@/lib/lessons/types";
import { marcadoresDe, semMarcadores } from "@/lib/lessons/marcadores";
import { rotulaAfirmacoes } from "./verify";
import {
  avisoQuaseDuplicata,
  avisosDeForma,
  bigramas,
  filtrarExcecoes,
  jaccardBigramas,
  type AvisoQualidade,
  type ExcecaoQualidade,
  type Severidade,
} from "./qualidade-forma";

export interface ValidationIssue {
  rule: string;
  message: string;
}

/**
 * Alerta (docs/30 §19.5: "heurística só de alerta"; docs/36 §G.7) — nunca bloqueia `ok`. Traz
 * `{ regra, severidade, detalhe }` (docs/36 T-07.2) e mantém `rule`/`message` (= `regra`/`detalhe`)
 * pra quem já lia o formato antigo.
 */
export interface ValidationWarning extends ValidationIssue {
  regra: string;
  severidade: Severidade;
  detalhe: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  /** Alertas — nunca bloqueiam `ok`. Os de severidade "alta" exigem aprovação explícita em `publish.ts`. */
  warnings: ValidationWarning[];
  /** Alertas cobertos por uma exceção registrada em `excecoes-qualidade.json` (id + regra) — saem de `warnings` e aparecem no relatório. */
  excecoes: ValidationWarning[];
}

function comoAviso(a: AvisoQualidade): ValidationWarning {
  return { rule: a.regra, message: a.detalhe, regra: a.regra, severidade: a.severidade, detalhe: a.detalhe };
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
      return { texto: semMarcadores(ex.pergunta), limiteMax: 120 };
    case "interpretacao":
      return { texto: `${semMarcadores(ex.texto)} ${semMarcadores(ex.pergunta)}`, limiteMax: 250 };
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
  /** Id final do item (`generatedItemId`) — só usado pra casar exceções registradas. */
  itemId?: string;
  /** Conteúdo de `content-pipeline/excecoes-qualidade.json` (docs/36 §G.7). */
  excecoes?: ExcecaoQualidade[];
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

/** Pasta pública das imagens de questão (spec 50 §5.9.3): `build-packs` copia `src/content/banco/oficial/img/`. */
export const PREFIXO_IMAGEM_LOCAL = "/content/img/";

export interface OpcoesMidia {
  /** Item oficial: `largura`/`altura` passam a ser obrigatórias (sem pulo de layout). */
  oficial?: boolean;
}

function checarImagem(img: ExerciseImage, onde: string, opts: OpcoesMidia): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (typeof img?.url !== "string" || !img.url.startsWith("/")) {
    issues.push({ rule: "sem-imagem-externa", message: `${onde}.url não é um caminho controlado: "${img?.url}"` });
  } else if (!img.url.startsWith(PREFIXO_IMAGEM_LOCAL)) {
    issues.push({ rule: "imagem-local", message: `${onde}.url fora de ${PREFIXO_IMAGEM_LOCAL}: "${img.url}"` });
  }
  if (typeof img?.alt !== "string" || img.alt.trim().length < 5) {
    issues.push({ rule: "imagem-alt", message: `${onde} sem texto alternativo (alt obrigatório, 5+ caracteres)` });
  }
  const dimensaoOk = (n: unknown) => typeof n === "number" && Number.isInteger(n) && n > 0;
  if (opts.oficial && (!dimensaoOk(img?.largura) || !dimensaoOk(img?.altura))) {
    issues.push({ rule: "imagem-dimensoes", message: `${onde} sem largura/altura inteiras (obrigatórias em item oficial)` });
  } else if ((img?.largura !== undefined || img?.altura !== undefined) && (!dimensaoOk(img.largura) || !dimensaoOk(img.altura))) {
    issues.push({ rule: "imagem-dimensoes", message: `${onde} com largura/altura inválidas` });
  }
  return issues;
}

/**
 * Mídia do exercício (spec 50 §5.9.3): imagens com alt e caminho local, dimensões em item oficial, tabelas
 * retangulares, marcadores `[[imagem:N]]`/`[[tabela:N]]` em linha própria apontando para índices que existem
 * (cada um citado no máximo uma vez) e `opcoesImagem` do mesmo tamanho de `opcoes`.
 */
export function validarMidia(ex: Exercise, opts: OpcoesMidia = {}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const imagens = ex.imagens ?? [];
  const tabelas = ex.tabelas ?? [];
  if (ex.imagens !== undefined && !Array.isArray(ex.imagens)) issues.push({ rule: "imagens-lista", message: "imagens não é uma lista" });
  if (ex.tabelas !== undefined && !Array.isArray(ex.tabelas)) issues.push({ rule: "tabelas-lista", message: "tabelas não é uma lista" });
  imagens.forEach((img, i) => issues.push(...checarImagem(img, `imagens[${i}]`, opts)));
  if (ex.imagem && opts.oficial) issues.push(...checarImagem(ex.imagem, "imagem", opts));

  tabelas.forEach((t, i) => {
    if (!Array.isArray(t?.cabecalho) || t.cabecalho.length === 0 || !Array.isArray(t.linhas) || t.linhas.length === 0) {
      issues.push({ rule: "tabela-forma", message: `tabelas[${i}] sem cabeçalho ou sem linhas` });
      return;
    }
    t.linhas.forEach((linha, j) => {
      if (!Array.isArray(linha) || linha.length !== t.cabecalho.length) {
        issues.push({ rule: "tabela-forma", message: `tabelas[${i}].linhas[${j}] com ${linha?.length} células (cabeçalho tem ${t.cabecalho.length})` });
      }
    });
  });

  const textos: string[] = [];
  if (ex.type === "multipla-escolha") textos.push(ex.pergunta);
  if (ex.type === "interpretacao") textos.push(ex.texto, ex.pergunta);
  const vistos = new Set<string>();
  for (const texto of textos) {
    for (const m of marcadoresDe(texto ?? "")) {
      const chave = `${m.tipo}:${m.indice}`;
      const total = m.tipo === "imagem" ? imagens.length : tabelas.length;
      if (!m.linhaPropria) issues.push({ rule: "marcador-linha", message: `[[${chave}]] precisa ficar numa linha só dele` });
      if (m.indice >= total) issues.push({ rule: "marcador-indice", message: `[[${chave}]] aponta para ${m.tipo} inexistente (há ${total})` });
      if (vistos.has(chave)) issues.push({ rule: "marcador-repetido", message: `[[${chave}]] aparece mais de uma vez` });
      vistos.add(chave);
    }
  }

  if (ex.type === "multipla-escolha" && ex.opcoesImagem !== undefined) {
    if (!Array.isArray(ex.opcoesImagem) || ex.opcoesImagem.length !== ex.opcoes.length) {
      issues.push({ rule: "opcoes-imagem-tamanho", message: `opcoesImagem tem ${ex.opcoesImagem?.length} posições (opcoes tem ${ex.opcoes.length})` });
    } else {
      ex.opcoesImagem.forEach((img, i) => {
        if (img === null) return;
        issues.push(...checarImagem(img, `opcoesImagem[${i}]`, opts));
        if (!ex.opcoes[i]?.trim()) issues.push({ rule: "opcoes-imagem-rotulo", message: `opcoes[${i}] vazia: alternativa-imagem precisa do rótulo "Alternativa X (imagem)"` });
      });
    }
  }
  return issues;
}

export function validateExercise(ex: Exercise, skillId: string, ctx: ValidateContext): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];

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

  // Imagens, tabelas, marcadores e alternativas-imagem (spec 50 §5.9.3).
  issues.push(...validarMidia(ex));

  // Dificuldade coerente com a solução (heurística — só alerta).
  if (ctx.solutionSteps !== undefined && ctx.solutionSteps <= 2) {
    warnings.push(
      comoAviso({ regra: "dificuldade-coerente", severidade: "info", detalhe: `solução em ${ctx.solutionSteps} passo(s) — considere dificuldade ≤ 2` }),
    );
  }

  // Sinais de FORMA (docs/36 T-07.2, §G.7): pista de tamanho, absolutismo, travessão, letra citada na explicação. Só alerta.
  const avisosDeQualidade: AvisoQualidade[] = opcoesInfo
    ? avisosDeForma(opcoesInfo.opcoes, opcoesInfo.correta, ex.explicacao, {
        ignorarLetras: ex.type === "multipla-escolha" && rotulaAfirmacoes(ex),
      })
    : [];

  // Duplicata semântica (Jaccard de 5-gramas > 0,6 com item existente da mesma habilidade).
  const gramsNovo = fiveGrams(enunciado);
  const existentes = ctx.existingStatementsBySkill(skillId);
  let bloqueadoPorDuplicata = false;
  for (const existente of existentes) {
    const similaridade = jaccard(gramsNovo, fiveGrams(existente));
    if (similaridade > LIMIAR_DUPLICATA) {
      issues.push({ rule: "duplicata-semantica", message: `similaridade de ${(similaridade * 100).toFixed(0)}% com item existente da mesma habilidade` });
      bloqueadoPorDuplicata = true;
      break;
    }
  }
  // Abaixo do bloqueio (5-gramas > 0,6) mas parecido (bigramas ≥ 0,4): só informa (§G.7 `quase-duplicata`).
  if (!bloqueadoPorDuplicata && existentes.length > 0) {
    const bigramasNovo = bigramas(enunciado);
    const maior = Math.max(...existentes.map((e) => jaccardBigramas(bigramasNovo, bigramas(e))));
    const aviso = avisoQuaseDuplicata(maior);
    if (aviso) avisosDeQualidade.push(aviso);
  }

  const { avisos: valem, excecoes } = filtrarExcecoes(ctx.itemId, avisosDeQualidade, ctx.excecoes);
  warnings.push(...valem.map(comoAviso));

  return { ok: issues.length === 0, issues, warnings, excecoes: excecoes.map(comoAviso) };
}
