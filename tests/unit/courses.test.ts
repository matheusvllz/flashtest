import { describe, expect, test } from "bun:test";
import { AREA_OF, COURSE_GROUPS, COURSES, COURSES_CATALOG, coursesOfGroup } from "@/data/courses";
import { buscarCursos, normalizar } from "@/lib/courses-search";

/**
 * Catálogo de cursos e busca (docs/36 §F.7, T-09.1, RU-40, G-19).
 * Falhas que estes testes pegam: curso antigo renomeado (quebra `prefs.targetCourse`
 * salvo), grupo vazio, id duplicado, busca sensível a acento/caixa, ordem sem critério.
 */

// Os 59 nomes do catálogo anterior à T-09.1 — NÃO podem mudar (valor literal gravado no estado do aluno).
const NOMES_ANTIGOS = [
  "Administração", "Economia", "Ciências Contábeis", "Negócios Internacionais", "Empreendedorismo",
  "Marketing", "Gestão de Recursos Humanos", "Logística",
  "Engenharia Civil", "Engenharia de Computação", "Engenharia de Produção", "Engenharia Elétrica",
  "Engenharia Mecânica", "Engenharia Química", "Engenharia Aeronáutica", "Engenharia Ambiental",
  "Ciência da Computação", "Ciência de Dados", "Sistemas de Informação", "Matemática", "Física", "Estatística",
  "Medicina", "Enfermagem", "Odontologia", "Farmácia", "Fisioterapia", "Nutrição", "Psicologia",
  "Biomedicina", "Veterinária", "Educação Física",
  "Direito", "Relações Internacionais", "Jornalismo", "Publicidade e Propaganda", "Pedagogia", "História",
  "Geografia", "Letras", "Filosofia", "Sociologia", "Serviço Social", "Ciências Políticas",
  "Arquitetura e Urbanismo", "Design Gráfico", "Design de Produto", "Moda", "Cinema e Audiovisual",
  "Artes Visuais", "Música", "Teatro",
  "Biologia", "Química", "Agronomia", "Zootecnia", "Geologia", "Oceanografia", "Ciências Ambientais",
];

describe("catálogo de cursos (RU-40)", () => {
  test("são 82 cursos em 13 grupos, todos com curso dentro", () => {
    expect(COURSES_CATALOG.length).toBe(82);
    expect(COURSES.length).toBe(82);
    expect(COURSE_GROUPS.length).toBe(13);
    for (const g of COURSE_GROUPS) expect(coursesOfGroup(g.id).length).toBeGreaterThan(0);
    // todo curso aponta para um grupo que existe
    const ids = new Set<string>(COURSE_GROUPS.map((g) => g.id));
    for (const x of COURSES_CATALOG) expect(ids.has(x.group)).toBe(true);
  });

  test("os grupos aparecem na ordem do contrato (§F.7)", () => {
    expect(COURSE_GROUPS.map((g) => g.name)).toEqual([
      "Saúde", "Engenharias", "Computação e Tecnologia", "Exatas", "Biológicas e Natureza",
      "Agrárias e Ambientais", "Humanas", "Sociais Aplicadas e Direito", "Comunicação",
      "Negócios e Gestão", "Educação e Licenciaturas", "Artes", "Arquitetura e Design",
    ]);
  });

  test("nomes e ids são únicos; id é slug estável", () => {
    expect(new Set(COURSES_CATALOG.map((x) => x.name)).size).toBe(82);
    expect(new Set(COURSES_CATALOG.map((x) => x.id)).size).toBe(82);
    for (const x of COURSES_CATALOG) expect(x.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(COURSES_CATALOG.find((x) => x.name === "Ciência da Computação")?.id).toBe("ciencia-da-computacao");
  });

  test("os 59 nomes antigos continuam presentes, sem renomear (compatibilidade de prefs.targetCourse)", () => {
    expect(NOMES_ANTIGOS.length).toBe(59);
    for (const nome of NOMES_ANTIGOS) expect(COURSES).toContain(nome);
  });

  test("AREA_OF devolve o nome do grupo novo; nomes de fora do catálogo não têm área", () => {
    expect(AREA_OF["Medicina"]).toBe("Saúde");
    expect(AREA_OF["Engenharia de Software"]).toBe("Engenharias");
    expect(AREA_OF["Design de Interiores"]).toBe("Arquitetura e Design");
    expect(AREA_OF["Ainda não decidi"]).toBeUndefined();
  });

  test("Saúde tem 13 cursos (10 antigos + 3 novos) e 'Medicina Veterinária' não é curso novo", () => {
    expect(coursesOfGroup("saude").length).toBe(13);
    expect(COURSES).not.toContain("Medicina Veterinária");
    expect(COURSES).not.toContain("Design de Games");
  });
});

describe("busca de curso (RU-40, RA-5)", () => {
  const nomes = (q: string) => buscarCursos(q).map((x) => x.name);

  test("normalizar tira acento, caixa e espaços das pontas", () => {
    expect(normalizar("  Ciência da Computação ")).toBe("ciencia da computacao");
    expect(normalizar("ÁGUA")).toBe("agua");
  });

  test('"computacao" acha Ciência da Computação e Engenharia de Computação, sem acento', () => {
    const r = nomes("computacao");
    expect(r).toContain("Ciência da Computação");
    expect(r).toContain("Engenharia de Computação");
    expect(r.length).toBe(2);
    expect(nomes("computação")).toEqual(r);
  });

  test('sinônimo "ads" acha Análise e Desenvolvimento de Sistemas', () => {
    expect(nomes("ads")[0]).toBe("Análise e Desenvolvimento de Sistemas");
  });

  test('"VET" (maiúsculas) acha Veterinária primeiro; "medicina veterinaria" também', () => {
    expect(nomes("VET")[0]).toBe("Veterinária");
    expect(nomes("Medicina Veterinária")).toContain("Veterinária");
    expect(nomes("medicina veterinaria")[0]).toBe("Veterinária");
  });

  test("sinônimos do contrato: games, adm, psico, arquitetura, ed fisica, portugues", () => {
    expect(nomes("games")).toEqual(["Jogos Digitais"]);
    expect(nomes("design de games")).toContain("Jogos Digitais");
    expect(nomes("adm")[0]).toBe("Administração");
    expect(nomes("psico")[0]).toBe("Psicologia");
    expect(nomes("arquitetura")[0]).toBe("Arquitetura e Urbanismo");
    expect(nomes("ed fisica")).toEqual(["Educação Física"]);
    expect(nomes("portugues")).toEqual(["Letras"]);
    expect(nomes("licenciatura em letras")).toEqual(["Letras"]);
  });

  test("ordem: começa-com antes de contém; ambos presentes", () => {
    // "quimica": "Química" (Exatas) começa; "Engenharia Química" só contém.
    const r = nomes("quimica");
    expect(r.indexOf("Química")).toBeGreaterThanOrEqual(0);
    expect(r.indexOf("Engenharia Química")).toBeGreaterThanOrEqual(0);
    expect(r.indexOf("Química")).toBeLessThan(r.indexOf("Engenharia Química"));
    // "matematica": "Matemática" antes de "Licenciatura em Matemática".
    const m = nomes("matematica");
    expect(m.indexOf("Matemática")).toBeLessThan(m.indexOf("Licenciatura em Matemática"));
  });

  test("igual ao termo vem antes de só começar com ele", () => {
    const r = nomes("ti");
    expect(r.slice(0, 2).sort()).toEqual(["Ciência da Computação", "Sistemas de Informação"].sort());
  });

  test("busca vazia ou em branco devolve lista vazia (o componente mostra os grupos)", () => {
    expect(buscarCursos("")).toEqual([]);
    expect(buscarCursos("   ")).toEqual([]);
  });

  test("texto inexistente devolve lista vazia; sem limite de 12 quando há muitos resultados", () => {
    expect(buscarCursos("xyzabc")).toEqual([]);
    // "a" casa com quase tudo — não pode haver corte em 12
    expect(buscarCursos("a").length).toBeGreaterThan(12);
  });
});
