/**
 * Turma mockada do ranking semanal (SDD 12, D3 §3).
 *
 * É mock deliberado — não existe backend, e a regra de escopo do `CLAUDE.md`
 * diz que ranking pode ser mock. O que precisa ser bom aqui é a **verossimilhança**:
 * nomes brasileiros plausíveis, XP com espaçamento irregular (ranking real não
 * tem degraus redondos) e um pelotão apertado em volta do aluno, para que
 * "faltam 40 XP para subir uma posição" seja verdade na tela.
 */

export type Colega = {
  id: string;
  nome: string;
  xp: number;
  streak: number;
  /** Iniciais do avatar. */
  iniciais: string;
};

export const TURMA: Colega[] = [
  { id: "c1", nome: "Beatriz Antunes", xp: 1480, streak: 23, iniciais: "BA" },
  { id: "c2", nome: "Kauã Ribeiro", xp: 1325, streak: 19, iniciais: "KR" },
  { id: "c3", nome: "Letícia Nakamura", xp: 1197, streak: 15, iniciais: "LN" },
  { id: "c4", nome: "Davi Monteiro", xp: 1064, streak: 12, iniciais: "DM" },
  { id: "c5", nome: "Sophia Vasconcelos", xp: 928, streak: 11, iniciais: "SV" },
  { id: "c6", nome: "Enzo Carvalho", xp: 815, streak: 9, iniciais: "EC" },
  { id: "c7", nome: "Manuela Prado", xp: 702, streak: 8, iniciais: "MP" },
  { id: "c8", nome: "Arthur Bastos", xp: 640, streak: 7, iniciais: "AB" },
  { id: "c9", nome: "Isabela Fontes", xp: 574, streak: 6, iniciais: "IF" },
  { id: "c10", nome: "Miguel Tavares", xp: 495, streak: 5, iniciais: "MT" },
  { id: "c11", nome: "Helena Siqueira", xp: 431, streak: 5, iniciais: "HS" },
  { id: "c12", nome: "Théo Aguiar", xp: 388, streak: 4, iniciais: "TA" },
  { id: "c13", nome: "Alice Rezende", xp: 322, streak: 4, iniciais: "AR" },
  { id: "c14", nome: "Bernardo Lins", xp: 265, streak: 3, iniciais: "BL" },
  { id: "c15", nome: "Cecília Moraes", xp: 198, streak: 3, iniciais: "CM" },
  { id: "c16", nome: "Gael Pontes", xp: 154, streak: 2, iniciais: "GP" },
  { id: "c17", nome: "Lorena Batista", xp: 96, streak: 2, iniciais: "LB" },
  { id: "c18", nome: "Noah Guimarães", xp: 52, streak: 1, iniciais: "NG" },
];

/** Liga da semana — o rótulo que dá sentido ao ranking sem inventar backend. */
export const LIGA = {
  nome: "Liga Ouro",
  descricao: "Os 5 primeiros sobem de liga no domingo.",
  sobeAte: 5,
  caiApartirDe: 15,
};
