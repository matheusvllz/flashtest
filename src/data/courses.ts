/**
 * Catálogo de cursos oferecidos como alvo no quiz de entrada e no Perfil
 * (docs/36 §F.7, RU-40): 82 cursos em 13 grupos, cada um com `id` estável e
 * sinônimos para a busca ("ads", "vet", "computacao"...).
 *
 * O `name` dos 59 cursos que já existiam NÃO muda: é o valor literal gravado em
 * `prefs.targetCourse` (compatibilidade com estados salvos, `tutor-prompt.ts`,
 * `aha.tsx`). O curso nunca é usado para prever nota de corte nem para inferir a
 * área da prova — é só uma preferência declarada pelo aluno.
 */

/** Grupos na ordem de exibição (§F.7). */
export const COURSE_GROUPS = [
  { id: "saude", name: "Saúde" },
  { id: "engenharias", name: "Engenharias" },
  { id: "computacao-tecnologia", name: "Computação e Tecnologia" },
  { id: "exatas", name: "Exatas" },
  { id: "biologicas-natureza", name: "Biológicas e Natureza" },
  { id: "agrarias-ambientais", name: "Agrárias e Ambientais" },
  { id: "humanas", name: "Humanas" },
  { id: "sociais-aplicadas-direito", name: "Sociais Aplicadas e Direito" },
  { id: "comunicacao", name: "Comunicação" },
  { id: "negocios-gestao", name: "Negócios e Gestão" },
  { id: "educacao-licenciaturas", name: "Educação e Licenciaturas" },
  { id: "artes", name: "Artes" },
  { id: "arquitetura-design", name: "Arquitetura e Design" },
] as const;

export type CourseGroupId = (typeof COURSE_GROUPS)[number]["id"];

export interface CourseDef {
  /** Slug estável do nome (sem acento, minúsculo, hífens). */
  id: string;
  /** Nome exibido e gravado em `prefs.targetCourse`. */
  name: string;
  group: CourseGroupId;
  /** Termos alternativos da busca (comparados sem acento e sem caixa). */
  synonyms: string[];
}

function slug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function c(group: CourseGroupId, name: string, synonyms: string[] = []): CourseDef {
  return { id: slug(name), name, group, synonyms };
}

export const COURSES_CATALOG: CourseDef[] = [
  // Saúde
  c("saude", "Medicina", ["med"]),
  c("saude", "Enfermagem"),
  c("saude", "Odontologia"),
  c("saude", "Farmácia"),
  c("saude", "Fisioterapia"),
  c("saude", "Nutrição"),
  c("saude", "Psicologia", ["psico"]),
  c("saude", "Biomedicina"),
  c("saude", "Veterinária", ["medicina veterinaria", "vet"]),
  c("saude", "Educação Física", ["ed fisica", "licenciatura em educacao fisica"]),
  c("saude", "Fonoaudiologia"),
  c("saude", "Terapia Ocupacional"),
  c("saude", "Radiologia"),
  // Engenharias
  c("engenharias", "Engenharia Civil"),
  c("engenharias", "Engenharia de Computação", ["eng comp"]),
  c("engenharias", "Engenharia de Produção"),
  c("engenharias", "Engenharia Elétrica"),
  c("engenharias", "Engenharia Mecânica"),
  c("engenharias", "Engenharia Química"),
  c("engenharias", "Engenharia Aeronáutica"),
  c("engenharias", "Engenharia Ambiental"),
  c("engenharias", "Engenharia de Software"),
  c("engenharias", "Engenharia Biomédica"),
  c("engenharias", "Engenharia de Alimentos"),
  c("engenharias", "Engenharia Florestal"),
  // Computação e Tecnologia
  c("computacao-tecnologia", "Ciência da Computação", ["cc", "computacao", "programacao", "ti"]),
  c("computacao-tecnologia", "Ciência de Dados"),
  c("computacao-tecnologia", "Sistemas de Informação", ["si", "ti"]),
  c("computacao-tecnologia", "Análise e Desenvolvimento de Sistemas", ["ads", "programacao"]),
  c("computacao-tecnologia", "Segurança da Informação"),
  c("computacao-tecnologia", "Jogos Digitais", ["games", "design de games"]),
  // Exatas
  c("exatas", "Matemática"),
  c("exatas", "Física"),
  c("exatas", "Estatística"),
  c("exatas", "Química"),
  // Biológicas e Natureza
  c("biologicas-natureza", "Biologia"),
  c("biologicas-natureza", "Geologia"),
  c("biologicas-natureza", "Oceanografia"),
  c("biologicas-natureza", "Ciências Biológicas"),
  // Agrárias e Ambientais
  c("agrarias-ambientais", "Agronomia"),
  c("agrarias-ambientais", "Zootecnia"),
  c("agrarias-ambientais", "Ciências Ambientais"),
  // Humanas
  c("humanas", "História"),
  c("humanas", "Geografia"),
  c("humanas", "Letras", ["portugues", "ingles", "licenciatura em letras"]),
  c("humanas", "Filosofia"),
  c("humanas", "Sociologia"),
  c("humanas", "Antropologia"),
  c("humanas", "Arqueologia"),
  // Sociais Aplicadas e Direito
  c("sociais-aplicadas-direito", "Direito", ["advocacia"]),
  c("sociais-aplicadas-direito", "Relações Internacionais", ["ri"]),
  c("sociais-aplicadas-direito", "Serviço Social"),
  c("sociais-aplicadas-direito", "Ciências Políticas"),
  c("sociais-aplicadas-direito", "Turismo"),
  c("sociais-aplicadas-direito", "Biblioteconomia"),
  c("sociais-aplicadas-direito", "Gestão Pública"),
  // Comunicação
  c("comunicacao", "Jornalismo"),
  c("comunicacao", "Publicidade e Propaganda", ["publicidade", "pp"]),
  c("comunicacao", "Cinema e Audiovisual"),
  c("comunicacao", "Relações Públicas"),
  c("comunicacao", "Produção Multimídia"),
  // Negócios e Gestão
  c("negocios-gestao", "Administração", ["adm"]),
  c("negocios-gestao", "Economia"),
  c("negocios-gestao", "Ciências Contábeis"),
  c("negocios-gestao", "Negócios Internacionais"),
  c("negocios-gestao", "Empreendedorismo"),
  c("negocios-gestao", "Marketing"),
  c("negocios-gestao", "Gestão de Recursos Humanos"),
  c("negocios-gestao", "Logística"),
  // Educação e Licenciaturas
  c("educacao-licenciaturas", "Pedagogia"),
  c("educacao-licenciaturas", "Licenciatura em Matemática"),
  c("educacao-licenciaturas", "Educação Especial"),
  // Artes
  c("artes", "Artes Visuais"),
  c("artes", "Música"),
  c("artes", "Teatro"),
  c("artes", "Moda"),
  c("artes", "Dança"),
  c("artes", "Gastronomia"),
  // Arquitetura e Design
  c("arquitetura-design", "Arquitetura e Urbanismo", ["arquitetura"]),
  c("arquitetura-design", "Design Gráfico"),
  c("arquitetura-design", "Design de Produto"),
  c("arquitetura-design", "Design de Interiores"),
];

/** Nomes de todos os cursos, na ordem do catálogo (derivado — importadores antigos continuam funcionando). */
export const COURSES: string[] = COURSES_CATALOG.map((x) => x.name);

const NOME_DO_GRUPO = Object.fromEntries(COURSE_GROUPS.map((g) => [g.id, g.name])) as Record<CourseGroupId, string>;

/** Nome do grupo de um curso (legenda no seletor). */
export const AREA_OF: Record<string, string> = Object.fromEntries(
  COURSES_CATALOG.map((x) => [x.name, NOME_DO_GRUPO[x.group]]),
);

/** Cursos de um grupo, na ordem do catálogo. */
export function coursesOfGroup(group: CourseGroupId): CourseDef[] {
  return COURSES_CATALOG.filter((x) => x.group === group);
}
