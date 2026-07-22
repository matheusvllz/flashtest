export type Subject = { id: string; name: string; topics: { id: string; name: string }[] };

export const SUBJECTS: Subject[] = [
  { id: "mat", name: "Matemática", topics: [
    { id: "arit", name: "Aritmética" }, { id: "razao", name: "Razão e proporção" },
    { id: "porc", name: "Porcentagem" }, { id: "eq", name: "Equações" },
    { id: "f1", name: "Função do primeiro grau" }, { id: "f2", name: "Função do segundo grau" },
    { id: "fexp", name: "Função exponencial" }, { id: "log", name: "Logaritmos" },
    { id: "geoplana", name: "Geometria plana" }, { id: "geoesp", name: "Geometria espacial" },
    { id: "trig", name: "Trigonometria" }, { id: "prob", name: "Probabilidade" },
    { id: "estat", name: "Estatística" }, { id: "comb", name: "Análise combinatória" },
  ]},
  { id: "por", name: "Português", topics: [
    { id: "interp", name: "Interpretação de texto" }, { id: "gram", name: "Gramática" },
    { id: "orto", name: "Ortografia" }, { id: "pont", name: "Pontuação" },
    { id: "classes", name: "Classes gramaticais" }, { id: "conc", name: "Concordância" },
    { id: "reg", name: "Regência" }, { id: "crase", name: "Crase" },
    { id: "fig", name: "Figuras de linguagem" }, { id: "var", name: "Variação linguística" },
  ]},
  { id: "lit", name: "Literatura", topics: [
    { id: "esc", name: "Escolas literárias" }, { id: "mod", name: "Modernismo" },
    { id: "rom", name: "Romantismo" }, { id: "rea", name: "Realismo" }, { id: "nat", name: "Naturalismo" },
    { id: "par", name: "Parnasianismo" }, { id: "sim", name: "Simbolismo" },
    { id: "cont", name: "Literatura contemporânea" }, { id: "obr", name: "Interpretação de obras" },
  ]},
  { id: "red", name: "Redação", topics: [
    { id: "diss", name: "Estrutura dissertativo-argumentativa" }, { id: "intro", name: "Introdução" },
    { id: "desen", name: "Desenvolvimento" }, { id: "concl", name: "Conclusão" },
    { id: "rep", name: "Repertório sociocultural" }, { id: "coes", name: "Coesão e coerência" },
    { id: "comp", name: "Competências do ENEM" }, { id: "interv", name: "Proposta de intervenção" },
    { id: "gramr", name: "Correção gramatical" },
  ]},
  { id: "fis", name: "Física", topics: [
    { id: "cin", name: "Cinemática" }, { id: "din", name: "Dinâmica" },
    { id: "trab", name: "Trabalho e energia" }, { id: "grav", name: "Gravitação" },
    { id: "hidro", name: "Hidrostática" }, { id: "termo", name: "Termologia" },
    { id: "ond", name: "Ondulatória" }, { id: "opt", name: "Óptica" },
    { id: "elet", name: "Eletricidade" }, { id: "magn", name: "Magnetismo" },
  ]},
  { id: "qui", name: "Química", topics: [
    { id: "geral", name: "Química geral" }, { id: "atom", name: "Estrutura atômica" },
    { id: "tab", name: "Tabela periódica" }, { id: "lig", name: "Ligações químicas" },
    { id: "inorg", name: "Funções inorgânicas" }, { id: "est", name: "Estequiometria" },
    { id: "sol", name: "Soluções" }, { id: "termq", name: "Termoquímica" },
    { id: "cinq", name: "Cinética química" }, { id: "eq", name: "Equilíbrio químico" },
    { id: "eletr", name: "Eletroquímica" }, { id: "org", name: "Química orgânica" },
  ]},
  { id: "bio", name: "Biologia", topics: [
    { id: "cit", name: "Citologia" }, { id: "gen", name: "Genética" },
    { id: "evo", name: "Evolução" }, { id: "eco", name: "Ecologia" },
    { id: "fis", name: "Fisiologia humana" }, { id: "bot", name: "Botânica" },
    { id: "zoo", name: "Zoologia" }, { id: "micro", name: "Microbiologia" },
    { id: "biot", name: "Biotecnologia" }, { id: "imu", name: "Imunologia" },
  ]},
  { id: "his", name: "História", topics: [
    { id: "ant", name: "História Antiga" }, { id: "med", name: "História Medieval" },
    { id: "mod", name: "História Moderna" }, { id: "cont", name: "História Contemporânea" },
    { id: "bcol", name: "Brasil Colônia" }, { id: "bimp", name: "Brasil Império" },
    { id: "brep", name: "Brasil República" }, { id: "var", name: "Era Vargas" },
    { id: "dit", name: "Ditadura militar" }, { id: "gm", name: "Guerras mundiais" },
    { id: "gf", name: "Guerra Fria" },
  ]},
  { id: "geo", name: "Geografia", topics: [
    { id: "cart", name: "Cartografia" }, { id: "fis", name: "Geografia física" },
    { id: "cli", name: "Climatologia" }, { id: "geopol", name: "Geopolítica" },
    { id: "glob", name: "Globalização" }, { id: "urb", name: "Urbanização" },
    { id: "pop", name: "População" }, { id: "eco", name: "Economia" },
    { id: "agro", name: "Agropecuária" }, { id: "ind", name: "Indústria" },
    { id: "amb", name: "Meio ambiente" }, { id: "bra", name: "Geografia do Brasil" },
  ]},
  { id: "fil", name: "Filosofia", topics: [
    { id: "ant", name: "Filosofia antiga" }, { id: "med", name: "Filosofia medieval" },
    { id: "mod", name: "Filosofia moderna" }, { id: "cont", name: "Filosofia contemporânea" },
    { id: "eti", name: "Ética" }, { id: "pol", name: "Política" },
    { id: "epis", name: "Epistemologia" }, { id: "log", name: "Lógica" },
  ]},
  { id: "soc", name: "Sociologia", topics: [
    { id: "cul", name: "Cultura" }, { id: "soc", name: "Sociedade" },
    { id: "trab", name: "Trabalho" }, { id: "des", name: "Desigualdade social" },
    { id: "mov", name: "Movimentos sociais" }, { id: "cid", name: "Cidadania" },
    { id: "pol", name: "Política" }, { id: "glob", name: "Globalização" },
    { id: "aut", name: "Autores clássicos" },
  ]},
  { id: "ing", name: "Inglês", topics: [
    { id: "interp", name: "Interpretação de texto" }, { id: "voc", name: "Vocabulário" },
    { id: "verbs", name: "Tempos verbais" }, { id: "pron", name: "Pronomes" },
    { id: "con", name: "Conectivos" }, { id: "phr", name: "Phrasal verbs" },
    { id: "fals", name: "Falsos cognatos" }, { id: "graf", name: "Leitura de gráficos e anúncios" },
  ]},
];

export const SUBJECT_MAP = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));
