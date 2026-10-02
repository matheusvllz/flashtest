/**
 * "Pular para cá" (spec 50 §5.7.1, T-50.12.1) — regras PURAS, as mesmas no aparelho (nó da trilha) e no servidor
 * (que decide de verdade). Nada aqui lê o store, o banco ou o relógio: tudo chega por parâmetro.
 *
 * Onde aparece: na matéria (a "trilha" do mapa), a posição do aluno é o primeiro capítulo ainda não concluído; o alvo
 * é o primeiro capítulo depois dele que o aluno ainda não tocou (nenhuma lição feita). O caminho são os capítulos da
 * posição até o alvo, e as lições dele que faltam são as que ficam "Puladas" se o teste passar. Nunca na redação.
 *
 * Por que "não tocou" e não "bloqueado": no conteúdo publicado nenhum capítulo tem pré-requisito de capítulo
 * (`prerequisiteChapterIds` é sempre `[]`, docs/20 §11), então nada fica bloqueado de verdade. Os capítulos à frente da
 * posição são os ainda fechados na ordem do caminho; o primeiro deles é o alvo.
 */
import type { CurriculumChapter, CurriculumSubject } from "@/content/curriculum-tree";

export const PULO = {
  MIN_ITENS: 6,
  MAX_ITENS: 10,
  /** Acertos de primeira, em %. */
  ACERTO_MINIMO_PCT: 80,
  /** XP fixo do teste aprovado, uma vez por capítulo (C-XP). */
  XP: 20,
  TESTES_POR_DIA: 3,
  /** Habilidade pulada sem questão no teste ganha uma revisão em até N dias (R-PROD-7). */
  DIAS_PARA_CHECAGEM: 3,
} as const;

/** Matérias sem "pular para cá" (redação não é avaliada por múltipla escolha). */
export const MATERIAS_SEM_PULO: ReadonlySet<string> = new Set(["red"]);

export type TipoDeLicao = "micro" | "redacao";

export interface LicaoDoCaminho {
  id: string;
  tipo: TipoDeLicao;
  capituloId: string;
}

export interface AlvoDoPulo {
  subjectId: string;
  capituloId: string;
  /** Capítulos do caminho (da posição do aluno até antes do alvo), na ordem. */
  caminho: string[];
  /** Lições do caminho ainda não feitas — as que ficam "Puladas" se o teste passar. */
  licoes: LicaoDoCaminho[];
  /** Habilidades do caminho e do alvo, sem repetir, na ordem do caminho. */
  habilidades: string[];
}

function capitulosEmOrdem(subject: CurriculumSubject): CurriculumChapter[] {
  return subject.sections.flatMap((s) => s.chapters);
}

/** O alvo do "pular para cá" nesta matéria, ou `null` quando não há (trilha feita, último capítulo, redação). */
export function alvoDoPulo(subject: CurriculumSubject, concluida: (lessonId: string) => boolean): AlvoDoPulo | null {
  if (MATERIAS_SEM_PULO.has(subject.id)) return null;
  const caps = capitulosEmOrdem(subject).filter((c) => c.lessonIds.length > 0);
  const posicao = caps.findIndex((c) => !c.lessonIds.every(concluida));
  if (posicao < 0) return null;
  let alvo = -1;
  for (let j = posicao + 1; j < caps.length; j++) {
    if (!caps[j].lessonIds.some(concluida)) {
      alvo = j;
      break;
    }
  }
  if (alvo < 0) return null;
  const caminho = caps.slice(posicao, alvo);
  const licoes = caminho.flatMap((c) =>
    c.lessonIds.filter((id) => !concluida(id)).map((id) => ({ id, tipo: (c.trilhaId ? "redacao" : "micro") as TipoDeLicao, capituloId: c.id })),
  );
  const habilidades = [...new Set([...caminho, caps[alvo]].flatMap((c) => c.skillIds ?? []))];
  return { subjectId: subject.id, capituloId: caps[alvo].id, caminho: caminho.map((c) => c.id), licoes, habilidades };
}

/* ------------------------------------------------------------ composição */

export interface ItemDoPool {
  id: string;
  /** [0] = habilidade principal. */
  skills: string[];
  difficulty: number;
}

export interface ItemDoTeste {
  itemId: string;
  /** A habilidade que este item mede no teste (a que ele cobre na composição). */
  skillId: string;
}

export interface ComposicaoDoPulo {
  itens: ItemDoTeste[];
  /** Habilidades do caminho sem questão inédita (ou além do teto de 10): não mudam e ganham uma revisão agendada. */
  semQuestao: string[];
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
 * Monta o teste: 1 item inédito por habilidade (o de habilidade principal igual vem antes), até 10 habilidades; depois
 * completa, uma habilidade por vez, até 2 por habilidade coberta, entre 6 e 10 itens. Menos de 6 possíveis: `null`.
 * `pool` já vem filtrado pelo chamador (papel prática/desafio, não retirado, não gerado). Ordem: do mais fácil ao mais
 * difícil. Determinística pela semente.
 */
export function comporTestePulo(
  habilidades: string[],
  pool: ItemDoPool[],
  vistos: ReadonlySet<string>,
  semente: string,
): ComposicaoDoPulo | null {
  const ineditos = pool.filter((i) => !vistos.has(i.id));
  const usados = new Set<string>();
  const escolhidos: (ItemDoTeste & { difficulty: number })[] = [];
  const candidatos = (h: string) =>
    ineditos
      .filter((i) => !usados.has(i.id) && i.skills.includes(h))
      .sort((a, b) => Number(b.skills[0] === h) - Number(a.skills[0] === h) || fnv1a(`${semente}:${a.id}`) - fnv1a(`${semente}:${b.id}`));
  const pegar = (h: string): boolean => {
    const [i] = candidatos(h);
    if (!i) return false;
    usados.add(i.id);
    escolhidos.push({ itemId: i.id, skillId: h, difficulty: i.difficulty });
    return true;
  };

  const cobertas: string[] = [];
  const semQuestao: string[] = [];
  for (const h of habilidades) {
    if (cobertas.length < PULO.MAX_ITENS && pegar(h)) cobertas.push(h);
    else semQuestao.push(h);
  }
  if (cobertas.length === 0) return null;

  const alvo = Math.min(PULO.MAX_ITENS, Math.max(PULO.MIN_ITENS, cobertas.length * 2));
  let andou = true;
  while (escolhidos.length < alvo && andou) {
    andou = false;
    for (const h of cobertas) {
      if (escolhidos.length >= alvo) break;
      if (pegar(h)) andou = true;
    }
  }
  if (escolhidos.length < PULO.MIN_ITENS) return null;

  escolhidos.sort((a, b) => a.difficulty - b.difficulty || fnv1a(`${semente}:${a.itemId}`) - fnv1a(`${semente}:${b.itemId}`));
  return { itens: escolhidos.map(({ itemId, skillId }) => ({ itemId, skillId })), semQuestao };
}

/* ------------------------------------------------------------ avaliação */

export interface AvaliacaoDoPulo {
  passou: boolean;
  acertos: number;
  total: number;
  /** Habilidades do teste com algum erro, as zeradas primeiro (o "Vale revisar" da tela). */
  valeRevisar: string[];
}

/** Passa com acertos de primeira ≥ 80% e nenhuma habilidade do teste com 0 acertos. Resposta ausente = erro. */
export function avaliarPulo(itens: ItemDoTeste[], corretas: ReadonlyMap<string, boolean>): AvaliacaoDoPulo {
  const por = new Map<string, { acertos: number; total: number }>();
  let acertos = 0;
  for (const i of itens) {
    const certo = corretas.get(i.itemId) === true;
    if (certo) acertos += 1;
    const h = por.get(i.skillId) ?? { acertos: 0, total: 0 };
    h.total += 1;
    if (certo) h.acertos += 1;
    por.set(i.skillId, h);
  }
  const total = itens.length;
  const zerada = [...por.values()].some((h) => h.acertos === 0);
  const passou = total > 0 && acertos * 100 >= PULO.ACERTO_MINIMO_PCT * total && !zerada;
  const valeRevisar = [...por.entries()]
    .filter(([, h]) => h.acertos < h.total)
    .sort(([, a], [, b]) => a.acertos / a.total - b.acertos / b.total)
    .map(([id]) => id);
  return { passou, acertos, total, valeRevisar };
}

/* ------------------------------------------------------------ limites */

export type BloqueioDoPulo = "CAPITULO_HOJE" | "LIMITE_DO_DIA";

/**
 * Limites do dia (no servidor): 1 tentativa por capítulo e 3 testes. `hoje` = testes começados hoje. O teste começado
 * e não terminado do mesmo capítulo não bloqueia: é a retomada dele (as mesmas questões).
 */
export function bloqueioDoPulo(hoje: { capituloId: string; concluido: boolean }[], capituloId: string): BloqueioDoPulo | null {
  const doCapitulo = hoje.find((t) => t.capituloId === capituloId);
  if (doCapitulo) return doCapitulo.concluido ? "CAPITULO_HOJE" : null;
  return hoje.length >= PULO.TESTES_POR_DIA ? "LIMITE_DO_DIA" : null;
}
