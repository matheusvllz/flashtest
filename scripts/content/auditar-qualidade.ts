#!/usr/bin/env bun
/**
 * Auditoria de qualidade do acervo (docs/36 T-07.1, §G.6/§G.7, RP-7) — só LEITURA do repo:
 * varre todo `src/content/banco/**\/*.json` e, numa seção separada e INFORMATIVA, as questões de
 * múltipla escolha das trilhas legadas (`src/content/trilhas`) e do banco geral
 * (`src/data/questions.ts`). Calcula as métricas de forma de §G.7, o inventário por
 * origem/área/matéria/habilidade/dificuldade/papel/status/`reviewKind`, a cobertura (habilidades
 * sem aula; habilidades com < 3 itens de revisão) e atribui cada item de pacote a um ESTRATO de
 * revisão (§G.6). Determinístico: ordenado por id, sem carimbo de data — rodar 2× dá bytes iguais.
 *
 * Não é importado por `src/` (respeita `pipeline-boundary.test.ts`) e não chama modelo nenhum.
 *
 * Uso:
 *   bun scripts/content/auditar-qualidade.ts                                 # só imprime o resumo
 *   bun scripts/content/auditar-qualidade.ts --out <pasta>                   # grava auditoria.json, estratos.json, auditoria.md
 *   bun scripts/content/auditar-qualidade.ts --out <pasta> --banco <dir>     # (testes) lê outro diretório de banco
 */
import type { Exercise } from "@/lib/lessons/types";
import { rotulaAfirmacoes } from "./verify";
import {
  avisoPosicaoLote,
  avisosDeForma,
  bigramas,
  jaccardBigramas,
  LIMIAR_QUASE_DUPLICATA,
  metricasForma,
  r3,
  type MetricasForma,
} from "./qualidade-forma";

export type Estrato = "1e" | "1a" | "1b" | "1c" | "1d" | "2" | "3";
/** Ordem de prioridade da revisão (§G.6: "1e → 1a → 1b/1c/1d → 2 → 3"): o estrato PRINCIPAL é o primeiro que casar. */
export const ORDEM_ESTRATOS: Estrato[] = ["1e", "1a", "1b", "1c", "1d", "2", "3"];

/** Os 4 exemplos reais do `docs/35` §7.1 (estrato 1d). */
export const EXEMPLOS_35: string[] = [
  "gen:bio:membrana-estrutura:6553a1bf",
  "gen:bio:membrana-estrutura:5ae4f57c",
  "gen:bio:ecologia-relacoes-ecossistema:b9bc002a",
  "gen:bio:organelas-funcao:a655cd73",
];

export interface EntradaEstrato {
  id: string;
  diagnostico: boolean;
  metricas: MetricasForma | null;
}

export interface ClassificacaoEstrato {
  /** Todas as marcas que o item tem (pode ter várias). */
  marcas: Estrato[];
  principal: Estrato;
}

/** Atribui as marcas de estrato de §G.6 e o principal (o de maior prioridade). Pura. */
export function classificarEstrato(e: EntradaEstrato): ClassificacaoEstrato {
  const m = e.metricas;
  const marcas = new Set<Estrato>();
  if (e.diagnostico) marcas.add("1e");
  if (m && m.razaoMaior !== null && m.razaoMaior >= 2.0) marcas.add("1a");
  if (m && m.corretaMaisLongaEstrita && m.incorretasComAbsolutismo >= 1) marcas.add("1b");
  if (m && m.alternativasComTravessao > 0) marcas.add("1c");
  if (EXEMPLOS_35.includes(e.id)) marcas.add("1d");
  const alto = ["1a", "1b", "1c", "1d", "1e"].some((s) => marcas.has(s as Estrato));
  if (!alto && m && m.corretaMaisLongaEstrita && m.razaoMaior !== null && m.razaoMaior >= 1.5) marcas.add("2");
  if (marcas.size === 0) marcas.add("3");
  const ordenadas = ORDEM_ESTRATOS.filter((s) => marcas.has(s));
  return { marcas: ordenadas, principal: ordenadas[0] };
}

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Amostra sugerida (§G.6) de um estrato, por matéria: `max(minimo, ceil(taxa · n))`, escolhida por
 * hash do id (determinística e independente da ordem de entrada). Devolve ids ordenados.
 */
export function amostraPorMateria(
  itens: Array<{ id: string; subjectId: string }>,
  taxa: number,
  minimo: number,
): string[] {
  const porMateria = new Map<string, string[]>();
  for (const i of itens) porMateria.set(i.subjectId, [...(porMateria.get(i.subjectId) ?? []), i.id]);
  const out: string[] = [];
  for (const ids of porMateria.values()) {
    const alvo = Math.min(ids.length, Math.max(minimo, Math.ceil(taxa * ids.length)));
    out.push(...[...ids].sort((a, b) => fnv1a(`qualidade-2026-09:${a}`) - fnv1a(`qualidade-2026-09:${b}`)).slice(0, alvo));
  }
  return out.sort();
}

export function percentil(valores: number[], p: number): number | null {
  if (valores.length === 0) return null;
  const v = [...valores].sort((a, b) => a - b);
  // Interpolação linear (mesmo critério do percentil de planilha).
  const pos = (v.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return r3(v[lo] + (v[hi] - v[lo]) * (pos - lo));
}

/** Estatística de forma de um conjunto de alternativas (usado por pacote, trilhas e banco geral). */
export interface ResumoForma {
  n: number;
  corretaMaisLongaEstrita: number;
  corretaMaisLongaEstritaPct: number | null;
  razaoMaiorP50: number | null;
  razaoMaiorP90: number | null;
  razaoMaiorP95: number | null;
  razaoMaiorP99: number | null;
  razaoMaiorGe1_5: number;
  razaoMaiorGe2_0: number;
  razaoMaiorGe3_0: number;
  razaoMenorLe0_4: number;
  incorretasComAbsolutismo: number;
  incorretasTotal: number;
  corretasComAbsolutismo: number;
  itensComAlternativaComTravessao: number;
  alternativasComTravessao: number;
}

export function resumirForma(entradas: Array<{ m: MetricasForma | null; nOpcoes: number }>): ResumoForma {
  const medidas = entradas.filter((e): e is { m: MetricasForma; nOpcoes: number } => e.m !== null);
  const ms = medidas.map((e) => e.m);
  const razoes = ms.map((m) => m.razaoMaior).filter((r): r is number => r !== null);
  const estrita = ms.filter((m) => m.corretaMaisLongaEstrita).length;
  return {
    n: ms.length,
    corretaMaisLongaEstrita: estrita,
    corretaMaisLongaEstritaPct: ms.length ? r3((estrita / ms.length) * 100) : null,
    razaoMaiorP50: percentil(razoes, 0.5),
    razaoMaiorP90: percentil(razoes, 0.9),
    razaoMaiorP95: percentil(razoes, 0.95),
    razaoMaiorP99: percentil(razoes, 0.99),
    razaoMaiorGe1_5: razoes.filter((r) => r >= 1.5).length,
    razaoMaiorGe2_0: razoes.filter((r) => r >= 2.0).length,
    razaoMaiorGe3_0: razoes.filter((r) => r >= 3.0).length,
    razaoMenorLe0_4: ms.filter((m) => m.razaoMenor !== null && m.razaoMenor <= 0.4).length,
    incorretasComAbsolutismo: ms.reduce((a, m) => a + m.incorretasComAbsolutismo, 0),
    incorretasTotal: medidas.reduce((a, e) => a + (e.nOpcoes - 1), 0),
    corretasComAbsolutismo: ms.filter((m) => m.corretaTemAbsolutismo).length,
    itensComAlternativaComTravessao: ms.filter((m) => m.alternativasComTravessao > 0).length,
    alternativasComTravessao: ms.reduce((a, m) => a + m.alternativasComTravessao, 0),
  };
}

interface ItemJson {
  id: string;
  exercise: Exercise;
  meta: {
    skillIds: string[];
    difficulty: number;
    roles: string[];
    source: { kind: string };
    validation: { status: string; reviewKind?: string; reviewNote?: string };
  };
  retired?: boolean;
}

export interface ItemAuditado {
  id: string;
  arquivo: string;
  subjectId: string;
  area: string | null;
  skillId: string | null;
  difficulty: number;
  roles: string[];
  origem: string;
  status: string;
  reviewKind: string | null;
  tipo: string;
  nOpcoes: number;
  correta: number | null;
  retired: boolean;
  metricas: {
    lenCorreta: number;
    maiorIncorreta: number;
    menorIncorreta: number;
    razaoMaior: number | null;
    razaoMenor: number | null;
    cv: number;
    corretaMaisLongaEstrita: boolean;
    corretaTemAbsolutismo: boolean;
    incorretasComAbsolutismo: number;
    alternativasComTravessao: number;
  } | null;
  /** Regras de `avisosDeForma` (por item) com severidade, ex.: `tamanho-correta-maior:alta`. */
  avisos: string[];
  estratos: Estrato[];
  estratoPrincipal: Estrato;
}

function contar<T>(itens: T[], chave: (i: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const i of itens) {
    const k = chave(i);
    out[k] = (out[k] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b, "pt", { numeric: true })));
}

function opcoesDe(ex: Exercise): { opcoes: string[]; correta: number } | null {
  if (ex.type === "multipla-escolha" || ex.type === "interpretacao" || ex.type === "complete-lacuna") {
    return { opcoes: ex.opcoes, correta: ex.correta };
  }
  return null;
}

function enunciadoDe(ex: Exercise): string {
  switch (ex.type) {
    case "multipla-escolha":
    case "interpretacao":
      return ex.pergunta;
    case "complete-lacuna":
    case "encontre-o-erro":
      return ex.frase;
    case "ordenar":
      return ex.blocos.join(" ");
    case "verdadeiro-falso":
      return ex.afirmacao;
    case "parear":
      return ex.pares.map((p) => p.a).join(" ");
  }
}

function achaJson(dir: string, fs: typeof import("node:fs"), path: typeof import("node:path")): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const nome of fs.readdirSync(dir)) {
    const full = path.join(dir, nome);
    if (fs.statSync(full).isDirectory()) out.push(...achaJson(full, fs, path));
    else if (nome.endsWith(".json")) out.push(full);
  }
  return out.sort();
}

export interface OpcoesAuditoria {
  bancoDir: string;
}

export interface ResultadoAuditoria {
  auditoria: Record<string, unknown>;
  estratos: Record<string, unknown>;
  markdown: string;
}

export async function auditar(opts: OpcoesAuditoria): Promise<ResultadoAuditoria> {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { activeSkills, SKILL_MAP } = await import("@/content/taxonomy");
  const { areaOfSubject } = await import("@/content/taxonomy/areas");
  const { lessonForSkill } = await import("@/lib/adaptive/candidates");
  const { itemIndex } = await import("@/content/items");
  const { TRILHAS } = await import("@/content/trilhas");
  const { QUESTIONS } = await import("@/data/questions");

  // ---- 1. Itens de pacote (fonte: os JSON do banco, não o índice gerado) ----
  const arquivos = achaJson(opts.bancoDir, fs, path);
  const itens: ItemAuditado[] = [];
  const aulasPorSkill = new Set<string>();
  let aulasDePacote = 0;
  const enunciadosPorId = new Map<string, string>();
  for (const arquivo of arquivos) {
    const json = JSON.parse(fs.readFileSync(arquivo, "utf-8")) as { subjectId: string; items?: ItemJson[]; lessons?: Array<{ skillIds: string[] }> };
    const rel = path.relative(opts.bancoDir, arquivo).replace(/\\/g, "/");
    for (const l of json.lessons ?? []) {
      aulasDePacote++;
      for (const s of l.skillIds) aulasPorSkill.add(s);
    }
    for (const it of json.items ?? []) {
      const oc = opcoesDe(it.exercise);
      const metricas = oc ? metricasForma(oc.opcoes, oc.correta) : null;
      const diagnostico = it.meta.roles.includes("diagnostico");
      const cls = classificarEstrato({ id: it.id, diagnostico, metricas });
      const ignorarLetras = it.exercise.type === "multipla-escolha" && rotulaAfirmacoes(it.exercise);
      const avisos = oc
        ? avisosDeForma(oc.opcoes, oc.correta, it.exercise.explicacao, { ignorarLetras }).map((a) => `${a.regra}:${a.severidade}`)
        : [];
      enunciadosPorId.set(it.id, enunciadoDe(it.exercise));
      itens.push({
        id: it.id,
        arquivo: `src/content/banco/${rel}`,
        subjectId: json.subjectId,
        area: areaOfSubject(json.subjectId) ?? null,
        skillId: it.meta.skillIds[0] ?? null,
        difficulty: it.meta.difficulty,
        roles: [...it.meta.roles].sort(),
        origem: it.meta.source.kind,
        status: it.meta.validation.status,
        reviewKind: it.meta.validation.reviewKind ?? null,
        tipo: it.exercise.type,
        nOpcoes: oc?.opcoes.length ?? 0,
        correta: oc?.correta ?? null,
        retired: it.retired === true,
        metricas: metricas
          ? {
              lenCorreta: metricas.lenCorreta,
              maiorIncorreta: metricas.maiorIncorreta,
              menorIncorreta: metricas.menorIncorreta,
              razaoMaior: r3(metricas.razaoMaior),
              razaoMenor: r3(metricas.razaoMenor),
              cv: r3(metricas.cv) ?? 0,
              corretaMaisLongaEstrita: metricas.corretaMaisLongaEstrita,
              corretaTemAbsolutismo: metricas.corretaTemAbsolutismo,
              incorretasComAbsolutismo: metricas.incorretasComAbsolutismo,
              alternativasComTravessao: metricas.alternativasComTravessao,
            }
          : null,
        avisos,
        estratos: cls.marcas,
        estratoPrincipal: cls.principal,
      });
    }
  }
  itens.sort((a, b) => a.id.localeCompare(b.id));

  const ativos = itens.filter((i) => !i.retired);
  const metricasDe = (i: ItemAuditado): MetricasForma | null => {
    const oc = i.metricas;
    if (!oc) return null;
    return {
      lenCorreta: oc.lenCorreta,
      maiorIncorreta: oc.maiorIncorreta,
      menorIncorreta: oc.menorIncorreta,
      razaoMaior: oc.razaoMaior,
      razaoMenor: oc.razaoMenor,
      cv: oc.cv,
      corretaMaisLongaEstrita: oc.corretaMaisLongaEstrita,
      corretaTemAbsolutismo: oc.corretaTemAbsolutismo,
      incorretasComAbsolutismo: oc.incorretasComAbsolutismo,
      alternativasComTravessao: oc.alternativasComTravessao,
    };
  };

  function resumo(lista: ItemAuditado[]): ResumoForma {
    return resumirForma(lista.map((i) => ({ m: metricasDe(i), nOpcoes: i.nOpcoes })));
  }

  const resumoPacote = resumo(ativos);
  const resumoPorOrigem = Object.fromEntries(
    Object.entries(agrupar(ativos, (i) => i.origem)).map(([k, v]) => [k, resumo(v)]),
  );
  const resumoPorMateria = Object.fromEntries(
    Object.entries(agrupar(ativos, (i) => i.subjectId)).map(([k, v]) => [k, resumo(v)]),
  );

  // ---- posição do gabarito (posicao-lote): por matéria e por arquivo ----
  const posicaoPorMateria: Record<string, { n: number; distribuicao: Record<string, number>; aviso: string | null }> = {};
  for (const [materia, lista] of Object.entries(agrupar(ativos, (i) => i.subjectId))) {
    const cs = lista.filter((i) => i.correta !== null).map((i) => i.correta as number);
    posicaoPorMateria[materia] = {
      n: cs.length,
      distribuicao: contar(cs, (c) => "ABCDE"[c]),
      aviso: avisoPosicaoLote(cs)?.detalhe ?? null,
    };
  }
  const avisosPosicaoArquivo: string[] = [];
  for (const [arq, lista] of Object.entries(agrupar(ativos, (i) => i.arquivo))) {
    const a = avisoPosicaoLote(lista.filter((i) => i.correta !== null).map((i) => i.correta as number));
    if (a) avisosPosicaoArquivo.push(`${arq}: ${a.detalhe}`);
  }

  // ---- quase-duplicata (bigramas ≥ 0,4, mesma habilidade), pares únicos ----
  const porSkill = agrupar(ativos.filter((i) => i.skillId), (i) => i.skillId as string);
  const pares: Array<{ a: string; b: string; skillId: string; similaridade: number }> = [];
  for (const [skillId, lista] of Object.entries(porSkill)) {
    const grams = lista.map((i) => bigramas(enunciadosPorId.get(i.id) ?? ""));
    for (let x = 0; x < lista.length; x++) {
      for (let y = x + 1; y < lista.length; y++) {
        const s = jaccardBigramas(grams[x], grams[y]);
        if (s >= LIMIAR_QUASE_DUPLICATA) pares.push({ a: lista[x].id, b: lista[y].id, skillId, similaridade: r3(s) as number });
      }
    }
  }
  pares.sort((p, q) => q.similaridade - p.similaridade || p.a.localeCompare(q.a));

  // ---- contagens do inventário ----
  const contagens = {
    itensTotal: itens.length,
    itensAposRetiradas: ativos.length,
    retirados: itens.length - ativos.length,
    arquivos: arquivos.length,
    aulasDePacote,
    porOrigem: contar(itens, (i) => i.origem),
    porArea: contar(itens, (i) => i.area ?? "(sem área)"),
    porMateria: contar(itens, (i) => i.subjectId),
    porHabilidade: contar(itens, (i) => i.skillId ?? "(sem habilidade)"),
    porDificuldade: contar(itens, (i) => String(i.difficulty)),
    porPapel: contar(itens.flatMap((i) => i.roles.map((r) => ({ r }))), (x) => x.r),
    itensComPapelDiagnostico: itens.filter((i) => i.roles.includes("diagnostico")).length,
    porStatus: contar(itens, (i) => i.status),
    porReviewKind: contar(itens, (i) => i.reviewKind ?? "(ausente)"),
    porTipo: contar(itens, (i) => i.tipo),
    porNumeroDeOpcoes: contar(itens, (i) => String(i.nOpcoes)),
  };

  const avisosPorRegra = contar(
    ativos.flatMap((i) => i.avisos.map((a) => ({ a }))),
    (x) => x.a,
  );
  const explicacaoCitaErrada = ativos.filter((i) => i.avisos.includes("explicacao-cita-alternativa-errada:alta")).map((i) => i.id);

  // ---- estratos ----
  const porEstratoMarca: Record<string, string[]> = {};
  for (const e of ORDEM_ESTRATOS) porEstratoMarca[e] = ativos.filter((i) => i.estratos.includes(e)).map((i) => i.id);
  const porEstratoPrincipal: Record<string, string[]> = {};
  for (const e of ORDEM_ESTRATOS) porEstratoPrincipal[e] = ativos.filter((i) => i.estratoPrincipal === e).map((i) => i.id);
  const estrato1 = ativos.filter((i) => i.estratos.some((s) => ["1a", "1b", "1c", "1d", "1e"].includes(s)));
  const medio = ativos.filter((i) => i.estratoPrincipal === "2");
  const baixo = ativos.filter((i) => i.estratoPrincipal === "3");
  const estratosResumo = {
    marcasSobrepostas: Object.fromEntries(ORDEM_ESTRATOS.map((e) => [e, porEstratoMarca[e].length])),
    principalExclusivo: Object.fromEntries(ORDEM_ESTRATOS.map((e) => [e, porEstratoPrincipal[e].length])),
    estrato1Uniao: estrato1.length,
    estrato2: medio.length,
    estrato3: baixo.length,
    estrato1PorMateria: contar(estrato1, (i) => i.subjectId),
    estrato2PorMateria: contar(medio, (i) => i.subjectId),
    estrato3PorMateria: contar(baixo, (i) => i.subjectId),
    amostraSugeridaMedio: amostraPorMateria(medio, 0.3, 5).length,
    amostraSugeridaBaixo: amostraPorMateria(baixo, 0.05, 3).length,
  };

  // ---- legado: MC das trilhas e do banco geral (informativo) ----
  const trilhasMc = TRILHAS.flatMap((t) => t.licoes.flatMap((l) => l.exercicios)).filter(
    (e): e is Extract<Exercise, { type: "multipla-escolha" }> => e.type === "multipla-escolha",
  );
  const trilhasTotalExercicios = TRILHAS.reduce((n, t) => n + t.licoes.reduce((m, l) => m + l.exercicios.length, 0), 0);
  const trilhas = {
    licoes: TRILHAS.reduce((n, t) => n + t.licoes.length, 0),
    exerciciosTotal: trilhasTotalExercicios,
    multiplaEscolha: trilhasMc.length,
    forma: resumirForma(trilhasMc.map((e) => ({ m: metricasForma(e.opcoes, e.correta), nOpcoes: e.opcoes.length }))),
  };
  const bancoGeral = {
    questoes: QUESTIONS.length,
    forma: resumirForma(
      QUESTIONS.map((q) => ({
        m: metricasForma(
          q.alternatives.map((a) => a.text),
          Math.max(0, q.alternatives.findIndex((a) => a.key === q.correct)),
        ),
        nOpcoes: q.alternatives.length,
      })),
    ),
  };

  // ---- cobertura ----
  const ativas = activeSkills();
  const semAula = ativas.filter((s) => !lessonForSkill(s.id) && !aulasPorSkill.has(s.id)).map((s) => s.id).sort();
  const revisaoPorSkill = new Map<string, number>();
  for (const e of itemIndex()) {
    if (!e.roles.includes("revisao") || (e as { retired?: boolean }).retired) continue;
    for (const s of e.skills) revisaoPorSkill.set(s, (revisaoPorSkill.get(s) ?? 0) + 1);
  }
  const poucaRevisao = ativas
    .filter((s) => (revisaoPorSkill.get(s.id) ?? 0) < 3)
    .map((s) => ({ skillId: s.id, itensDeRevisao: revisaoPorSkill.get(s.id) ?? 0 }))
    .sort((a, b) => a.skillId.localeCompare(b.skillId));
  const cobertura = {
    habilidadesAtivas: ativas.length,
    habilidadesSemAula: semAula.length,
    semAula,
    habilidadesComMenosDe3ItensDeRevisao: poucaRevisao.length,
    poucaRevisao,
    habilidadesDoPacoteForaDaTaxonomia: [...new Set(ativos.map((i) => i.skillId).filter((s): s is string => !!s && !SKILL_MAP[s]))].sort(),
  };

  const auditoria = {
    versao: 1,
    fonte: "src/content/banco/**/*.json (pacote); src/content/trilhas e src/data/questions.ts (legado, informativo)",
    definicoes: {
      len: "caracteres após trim e colapso de espaços",
      razaoMaior: "len(correta) / max(len(incorretas))",
      corretaMaisLongaEstrita: "len(correta) > len(toda incorreta)",
      estratos: "1a razão ≥ 2,0 · 1b correta estritamente a mais longa e ≥ 1 distrator com absolutismo · 1c travessão em alternativa · 1d exemplos do docs/35 · 1e papel diagnostico · 2 correta a mais longa com razão 1,5–2,0 fora do estrato 1 · 3 restante",
    },
    contagens,
    formaPacote: resumoPacote,
    formaPorOrigem: resumoPorOrigem,
    formaPorMateria: resumoPorMateria,
    posicaoDoGabaritoPorMateria: posicaoPorMateria,
    posicaoDoGabaritoAvisosPorArquivo: avisosPosicaoArquivo.sort(),
    avisosDeFormaPorRegra: avisosPorRegra,
    explicacaoCitaAlternativaErrada: { total: explicacaoCitaErrada.length, ids: explicacaoCitaErrada },
    quaseDuplicatas: { limiar: LIMIAR_QUASE_DUPLICATA, total: pares.length, pares },
    estratos: estratosResumo,
    cobertura,
    legado: { trilhas, bancoGeral },
    itens,
  };

  const estratos = {
    versao: 1,
    resumo: estratosResumo,
    /** Ids com a marca (sobrepostos: um item pode estar em 1a e 1e). */
    marcas: porEstratoMarca,
    /** Ids pelo estrato PRINCIPAL (exclusivo; soma = itens ativos). */
    principal: porEstratoPrincipal,
    /** Amostras sugeridas (T-07.4): médio 30 % por matéria (mín. 5); baixo 5 % por matéria (mín. 3); ordem por hash do id. */
    amostraSugerida: {
      medio: amostraPorMateria(medio, 0.3, 5),
      baixo: amostraPorMateria(baixo, 0.05, 3),
    },
  };

  return { auditoria, estratos, markdown: formatarMarkdown(auditoria as unknown as AuditoriaMd) };
}

/** JSON legível com uma linha por item em `itens` (o arquivo cai de ~750 KB para ~250 KB e o diff continua útil). */
export function serializarAuditoria(auditoria: Record<string, unknown>): string {
  const { itens, ...resto } = auditoria as { itens: unknown[] } & Record<string, unknown>;
  const base = JSON.stringify(resto, null, 2);
  return `${base.slice(0, -2)},\n  "itens": [\n${itens.map((i) => `    ${JSON.stringify(i)}`).join(",\n")}\n  ]\n}\n`;
}

function agrupar<T>(itens: T[], chave: (i: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const i of itens) (out[chave(i)] ??= []).push(i);
  return out;
}

interface AuditoriaMd {
  contagens: Record<string, unknown> & { itensTotal: number; retirados: number; aulasDePacote: number; itensComPapelDiagnostico: number };
  formaPacote: ResumoForma;
  formaPorOrigem: Record<string, ResumoForma>;
  formaPorMateria: Record<string, ResumoForma>;
  avisosDeFormaPorRegra: Record<string, number>;
  explicacaoCitaAlternativaErrada: { total: number };
  quaseDuplicatas: { total: number; limiar: number };
  posicaoDoGabaritoAvisosPorArquivo: string[];
  estratos: {
    marcasSobrepostas: Record<string, number>;
    principalExclusivo: Record<string, number>;
    estrato1Uniao: number;
    estrato2: number;
    estrato3: number;
    estrato1PorMateria: Record<string, number>;
    estrato2PorMateria: Record<string, number>;
    estrato3PorMateria: Record<string, number>;
    amostraSugeridaMedio: number;
    amostraSugeridaBaixo: number;
  };
  cobertura: { habilidadesAtivas: number; habilidadesSemAula: number; habilidadesComMenosDe3ItensDeRevisao: number };
  legado: { trilhas: { multiplaEscolha: number; forma: ResumoForma }; bancoGeral: { questoes: number; forma: ResumoForma } };
}

function tabela(obj: Record<string, unknown>): string {
  return ["| chave | n |", "|---|---:|", ...Object.entries(obj).map(([k, v]) => `| ${k} | ${v} |`)].join("\n");
}

function linhaForma(nome: string, f: ResumoForma): string {
  return `| ${nome} | ${f.n} | ${f.corretaMaisLongaEstrita} (${f.corretaMaisLongaEstritaPct ?? "-"}%) | ${f.razaoMaiorP50 ?? "-"} | ${f.razaoMaiorP90 ?? "-"} | ${f.razaoMaiorGe1_5} | ${f.razaoMaiorGe2_0} | ${f.razaoMaiorGe3_0} | ${f.incorretasComAbsolutismo} | ${f.itensComAlternativaComTravessao} |`;
}

export function formatarMarkdown(a: AuditoriaMd): string {
  const cab = "| grupo | itens | correta estritamente a mais longa | razão p50 | razão p90 | ≥ 1,5 | ≥ 2,0 | ≥ 3,0 | incorretas com absolutismo | itens com travessão |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|";
  const est = a.estratos;
  return [
    "# Auditoria de qualidade do acervo",
    "",
    "Gerado por `scripts/content/auditar-qualidade.ts` (docs/36 T-07.1). Determinístico: sem data, ordenado por id. O detalhe por item e a lista de ids de cada estrato estão em `auditoria.json` e `estratos.json`, na mesma pasta.",
    "",
    "## Acervo de pacote (`src/content/banco/`)",
    "",
    `- Itens: **${a.contagens.itensTotal}** (retirados: ${a.contagens.retirados}); aulas de pacote: ${a.contagens.aulasDePacote}; itens com papel \`diagnostico\`: ${a.contagens.itensComPapelDiagnostico}.`,
    "",
    "### Por origem",
    "",
    tabela(a.contagens.porOrigem as Record<string, unknown>),
    "",
    "### Por `reviewKind`",
    "",
    tabela(a.contagens.porReviewKind as Record<string, unknown>),
    "",
    "### Por matéria",
    "",
    tabela(a.contagens.porMateria as Record<string, unknown>),
    "",
    "### Por dificuldade",
    "",
    tabela(a.contagens.porDificuldade as Record<string, unknown>),
    "",
    "## Forma das alternativas (§G.7)",
    "",
    cab,
    linhaForma("pacote (todos)", a.formaPacote),
    ...Object.entries(a.formaPorOrigem).map(([k, v]) => linhaForma(`origem ${k}`, v)),
    ...Object.entries(a.formaPorMateria).map(([k, v]) => linhaForma(`matéria ${k}`, v)),
    "",
    "### Avisos por regra (severidade)",
    "",
    tabela(a.avisosDeFormaPorRegra),
    "",
    `- \`explicacao-cita-alternativa-errada\`: ${a.explicacaoCitaAlternativaErrada.total} item(ns).`,
    `- \`quase-duplicata\` (bigramas ≥ ${a.quaseDuplicatas.limiar}, mesma habilidade): ${a.quaseDuplicatas.total} par(es).`,
    `- \`posicao-lote\` por arquivo: ${a.posicaoDoGabaritoAvisosPorArquivo.length} arquivo(s) acima de 40 %.`,
    "",
    "## Estratos de revisão (§G.6)",
    "",
    "Marcas sobrepostas (um item pode ter várias):",
    "",
    tabela(est.marcasSobrepostas),
    "",
    "Estrato principal (exclusivo, ordem 1e → 1a → 1b → 1c → 1d → 2 → 3):",
    "",
    tabela(est.principalExclusivo),
    "",
    `- Estrato 1 (união de 1a–1e): **${est.estrato1Uniao}** ids · estrato 2: **${est.estrato2}** · estrato 3: **${est.estrato3}**.`,
    `- Amostra sugerida (30 % por matéria, mín. 5 / 5 % por matéria, mín. 3): médio ${est.amostraSugeridaMedio} · baixo ${est.amostraSugeridaBaixo}.`,
    "",
    "Estrato 1 por matéria:",
    "",
    tabela(est.estrato1PorMateria),
    "",
    "## Cobertura",
    "",
    `- Habilidades ativas: ${a.cobertura.habilidadesAtivas}; sem aula: ${a.cobertura.habilidadesSemAula}; com menos de 3 itens de revisão: ${a.cobertura.habilidadesComMenosDe3ItensDeRevisao}.`,
    "",
    "## Legado (informativo, fora da revisão item a item)",
    "",
    cab,
    linhaForma(`trilhas legadas (${a.legado.trilhas.multiplaEscolha} MC)`, a.legado.trilhas.forma),
    linhaForma(`banco geral (${a.legado.bancoGeral.questoes} questões)`, a.legado.bancoGeral.forma),
    "",
  ].join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (nome: string) => {
    const i = args.indexOf(nome);
    if (i >= 0 && args[i + 1] && !args[i + 1].startsWith("--")) return args[i + 1];
    return args.find((a) => a.startsWith(`${nome}=`))?.split("=")[1];
  };
  const out = arg("--out");
  const bancoDir = arg("--banco") ?? "src/content/banco";
  const { auditoria, estratos, markdown } = await auditar({ bancoDir });

  if (out) {
    const { mkdirSync, writeFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, "auditoria.json"), serializarAuditoria(auditoria), "utf-8");
    writeFileSync(join(out, "estratos.json"), `${JSON.stringify(estratos, null, 2)}\n`, "utf-8");
    writeFileSync(join(out, "auditoria.md"), markdown, "utf-8");
    console.log(`[auditar-qualidade] gravado em ${out}/ (auditoria.json, estratos.json, auditoria.md)`);
  }
  const a = auditoria as unknown as AuditoriaMd;
  console.log(`[auditar-qualidade] itens: ${a.contagens.itensTotal}; correta estritamente a mais longa: ${a.formaPacote.corretaMaisLongaEstrita} (${a.formaPacote.corretaMaisLongaEstritaPct}%); razão ≥ 2,0: ${a.formaPacote.razaoMaiorGe2_0}`);
  console.log(`[auditar-qualidade] estrato 1 (união): ${a.estratos.estrato1Uniao}; estrato 2: ${a.estratos.estrato2}; estrato 3: ${a.estratos.estrato3}`);
}

if (import.meta.main) {
  await main();
}
