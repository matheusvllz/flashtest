import {
  completeLacuna,
  defineLesson,
  encontreOErro,
  interpretacao,
  multiplaEscolha,
  parear,
  verdadeiroFalso,
} from "@/lib/lessons/define";

/**
 * Lição 04: Casos FACULTATIVOS de crase.
 * Contextos em que crase é opcional, aceita-se com ou sem.
 */
export const casosFacultativos = defineLesson({
  id: "crase-04-casos-facultativos",
  titulo: "Casos facultativos",
  descricao: "Situações onde crase pode estar ou não, ambas são corretas.",
  exercicios: [
    multiplaEscolha({
      pergunta: "Qual contexto permite crase OPCIONAL, sem obrigatoriedade absoluta?",
      opcoes: [
        "Antes de nome próprio de pessoa ou de pronome possessivo feminino",
        "Antes de substantivo feminino comum com artigo definido",
        "Antes de demonstrativo feminino",
      ],
      correta: 0,
      explicacao:
        'Nome de pessoa permite liberdade: "Vou a Maria" e "Vou à Maria" são ambos aceitos na norma culta. O mesmo vale antes de pronome possessivo feminino: "Fui a minha casa" ou "Fui à minha casa". Cidade já é outra história: lá a crase depende só de a cidade ter artigo fixo ou não, sem escolha do falante.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Posso escrever tanto "Entreguei para a Maria" quanto "Entreguei à Maria" sem estar errado.',
      verdadeiro: true,
      explicacao:
        "Com nome próprio de pessoa, crase é opcional. A presença ou ausência não caracteriza erro; é uma escolha estilística permitida pela norma. Alguns preferem com crase (mais formal), outros sem (mais coloquial).",
    }),
    completeLacuna({
      frase: "Dirijo carta___ Joana pedindo desculpas sinceras.",
      opcoes: ["a", "à"],
      correta: 1,
      explicacao:
        'Nome próprio feminino permite crase opcional. Aqui aceitarei "à Joana" como a resposta correta porque é mais formal, mas "a Joana" também estaria aceitável. A faculdade vem da natureza do nome próprio.',
    }),
    multiplaEscolha({
      pergunta:
        "Qual alternativa melhor explica por que nomes próprios femininos permitem crase opcional?",
      opcoes: [
        "Porque os nomes próprios não trazem consigo um artigo definido que se funda obrigatoriamente",
        "Porque os nomes próprios são palavras masculinas no fundo",
        "Porque a crase é proibida para nomes próprios de qualquer gênero",
      ],
      correta: 0,
      explicacao:
        'Nomes de pessoa (Maria, Joana) não vêm com artigo fixo na fala: dizemos "Maria chegou", mas o uso do artigo também é aceito em registro mais informal ("a Maria chegou"). Como o artigo não é obrigatório, a fusão com a preposição também não é, e a crase fica facultativa. Cuidado pra não confundir com cidade sem artigo nenhum, tipo Paris: ali não existe artigo pra se fundir, então não existe crase de jeito nenhum, não é uma questão de escolha.',
    }),
    parear({
      instrucao: "Combine cada frase com o tipo de contexto",
      pares: [
        {
          a: "Vou a Paris no verão.",
          b: "Sem crase (cidade sem artigo fixo, nunca opcional)",
        },
        {
          a: "Vou à escola todo dia.",
          b: "Crase obrigatória (substantivo comum feminino)",
        },
        {
          a: "Escrevo para a Maria frequentemente.",
          b: "Crase opcional (nome próprio feminino de pessoa)",
        },
      ],
      explicacao:
        "Três caixinhas diferentes: nome de pessoa cede espaço à preferência do falante, substantivo comum feminino com artigo é sempre crase obrigatória, e cidade sem artigo fixo, tipo Paris, nunca leva crase. Não confunda a terceira com a primeira: ali não há escolha nenhuma.",
    }),
    encontreOErro({
      frase: "Comprei um presente a escola para as crianças estudarem melhor.",
      // Tokenização: Comprei(0) um(1) presente(2) a(3) escola(4) para(5) as(6) crianças(7) estudarem(8) melhor(9)
      // "Escola" é substantivo feminino comum definido. Crase é OBRIGATÓRIA.
      // Deveria ser "à escola". Erro em "a(3)"
      erroIndex: 3,
      explicacao:
        'Aqui há erro de verdade: "escola" é substantivo comum feminino, não nome próprio. Crase é obrigatória, não facultativa. O correto é "Comprei um presente à escola". A faculdade vale só para nomes próprios.',
    }),
    verdadeiroFalso({
      afirmacao:
        'Ambas as formas "Vou a Maria" e "Vou à Maria" estão corretas porque nomes próprios femininos permitem crase opcional.',
      verdadeiro: true,
      explicacao:
        "Sim. Com nome próprio de pessoa, a crase é verdadeiramente facultativa. Nenhuma das duas é errada; é escolha do redator. Mas cuidado: essa liberdade NÃO vale para substantivos comuns femininos com artigo definido, nem para nome de cidade, que segue regra própria.",
    }),
    interpretacao({
      texto:
        'A crase facultativa é uma "zona cinzenta" da gramática, mas tem endereço certo: aparece com nome próprio de pessoa (Maria, Joana, Francisca) e com pronome possessivo feminino (minha, sua). Nesses casos, a ausência de artigo definido fixo permite que o falante escolha entre a crase ou sua omissão sem estar errado em nenhum lado. Cuidado pra não confundir com nome de cidade: ali a regra não é de escolha livre, é de costume da língua. Cidade que a língua sempre acompanha de artigo, tipo "a Bahia", pede crase obrigatória ("Fui à Bahia"). Cidade que nunca leva artigo, tipo Paris, nunca leva crase ("Fui a Paris"). Na escola, em prova oficial, a facultatividade vale só pra nome de pessoa e pronome possessivo, não pra nome de cidade.',
      pergunta: "Por que a crase é facultativa com nome próprio de pessoa?",
      opcoes: [
        "Porque o nome próprio não traz um artigo definido fixo que se funda obrigatoriamente com a preposição",
        "Porque qualquer palavra feminina pode optar por crase ou não",
        "Porque a crase é menos importante em nomes próprios do que em substantivos comuns",
      ],
      correta: 0,
      explicacao:
        'A faculdade existe exatamente porque falta o artigo definido fixo. "A Maria" não é construção natural em português padrão; "Maria" aparece sozinha. Logo, sem artigo definido obrigatório, sem fusão obrigatória com a preposição. Daí a crase ficar opcional, aqui, com nome de pessoa.',
    }),
    encontreOErro({
      frase: "Refiro-me a aquela princesa do conto de fadas infantil que todos conhecem.",
      // Tokenização: Refiro-me(0) a(1) aquela(2) princesa(3) do(4) conto(5) de(6) fadas(7) infantil(8) que(9) todos(10) conhecem(11)
      // "Aquela" é demonstrativo feminino. Crase OBRIGATÓRIA.
      // Deveria ser "àquela". Erro em "a(1)"
      erroIndex: 1,
      explicacao:
        'Crase obrigatória, não facultativa. Demonstrativo feminino "aquela" traz artigo feminino embutido. Com preposição "a" (de referir-se a), fica "àquela". A faculdade é só para nomes próprios, não vale aqui.',
    }),
  ],
});
