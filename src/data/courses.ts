/**
 * Cursos oferecidos como alvo no quiz de entrada. Agrupados por área para o seletor
 * ficar navegável sem virar uma lista de 200 itens.
 */
export const COURSES_BY_AREA: Record<string, string[]> = {
  "Negócios e Economia": [
    "Administração",
    "Economia",
    "Ciências Contábeis",
    "Negócios Internacionais",
    "Empreendedorismo",
    "Marketing",
    "Gestão de Recursos Humanos",
    "Logística",
  ],
  "Exatas e Engenharias": [
    "Engenharia Civil",
    "Engenharia de Computação",
    "Engenharia de Produção",
    "Engenharia Elétrica",
    "Engenharia Mecânica",
    "Engenharia Química",
    "Engenharia Aeronáutica",
    "Engenharia Ambiental",
    "Ciência da Computação",
    "Ciência de Dados",
    "Sistemas de Informação",
    "Matemática",
    "Física",
    "Estatística",
  ],
  Saúde: [
    "Medicina",
    "Enfermagem",
    "Odontologia",
    "Farmácia",
    "Fisioterapia",
    "Nutrição",
    "Psicologia",
    "Biomedicina",
    "Veterinária",
    "Educação Física",
  ],
  "Humanas e Sociais": [
    "Direito",
    "Relações Internacionais",
    "Jornalismo",
    "Publicidade e Propaganda",
    "Pedagogia",
    "História",
    "Geografia",
    "Letras",
    "Filosofia",
    "Sociologia",
    "Serviço Social",
    "Ciências Políticas",
  ],
  "Artes e Design": [
    "Arquitetura e Urbanismo",
    "Design Gráfico",
    "Design de Produto",
    "Moda",
    "Cinema e Audiovisual",
    "Artes Visuais",
    "Música",
    "Teatro",
  ],
  "Ciências Naturais e Agrárias": [
    "Biologia",
    "Química",
    "Agronomia",
    "Zootecnia",
    "Geologia",
    "Oceanografia",
    "Ciências Ambientais",
  ],
};

export const COURSES = Object.values(COURSES_BY_AREA).flat();

/** Área de um curso — usada como legenda no seletor. */
export const AREA_OF: Record<string, string> = Object.fromEntries(
  Object.entries(COURSES_BY_AREA).flatMap(([area, list]) => list.map((c) => [c, area])),
);
