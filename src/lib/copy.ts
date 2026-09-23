/**
 * Copy funcional centralizada (docs/20 §7.2, Fase 3) — textos de INTERFACE
 * (botão, rótulo, placeholder, mensagem de estado/erro), por ID. Diferente de
 * `voz.ts`: aqui não tem personalidade nem sorteio, é o texto funcional que
 * qualquer usuário vê sempre igual. Regras de tom da seção 7 do `20` valem
 * pra cá também — sem emoji em controle/erro, sem exclamação dupla.
 *
 * Cobertura desta primeira passada (Fase 3): feedback de resposta e o balão
 * do tutor — as duas superfícies que as Fases 1/2 já tinham em mãos. O resto
 * do app ainda não foi migrado pra cá; ver
 * docs/21-brand-voice-e-inventario-copy.md pro inventário completo e o que
 * falta. Não declarar cobertura maior do que a registrada lá.
 */
export const COPY = {
  feedback: {
    verResolucao: "Ver resolução",
    ocultarResolucao: "Ocultar resolução",
    explicarMelhor: "Explicar melhor",
    continuar: "Continuar",
    verResultado: "Ver resultado",
  },
  tutor: {
    nome: "Foca",
    abrirAriaLabel: "Abrir tutor de IA",
    fecharAriaLabel: "Fechar tutor",
    placeholder: "Pergunta qualquer coisa...",
    anexarAriaLabel: "Anexar foto de questão",
    removerFotoAriaLabel: "Remover foto",
    fotoAnexada: "Foto anexada",
    enviarAriaLabel: "Enviar",
    /** docs/20 §7.1, exemplo de recuperação de rede — mesma frase, sem culpar o aluno nem inventar causa. */
    falhaResposta: "Não consegui responder agora. Tente de novo.",
    saudacaoComFoco: (topic: string) => `Sobre essa questão de ${topic} — o que travou?`,
    saudacaoSemFoco: "Me pergunta o que quiser sobre seus estudos. Também leio foto de questão.",
    fotoSemTexto: "Me ajuda com essa questão da foto.",
    falandoSobre: (topic: string, subjectName: string) => `Falando sobre: ${topic} · ${subjectName}`,
    sugestoesErro: [
      "Por que minha resposta está errada?",
      "Explica de forma mais simples",
      "Me dá outra parecida",
    ],
    sugestoesAjuda: ["Me dá uma dica", "O que devo observar no enunciado?", "Explica de forma mais simples"],
    sugestoesGeral: ["Quais são minhas lacunas?", "Como estou indo?", "O que eu estudo agora?"],
  },
  /** Player de lição passo a passo (docs/25 §12.2/§18 T-10). */
  licao: {
    comecar: "Começar",
    continuar: "Continuar",
    verificar: "Verificar",
    concluir: "Concluir lição",
    dica: "Dica",
    sair: "Sair da lição",
    sairTitulo: "Sair da lição?",
    sairCorpo:
      "Seu progresso nesta lição fica salvo — você retoma de onde parou na próxima vez.",
    sairFicar: "Continuar estudando",
    sairMesmo: "Sair mesmo assim",
    voceAprendeu: "Você aprendeu",
    refazer: "Refazer lição",
    roles: {
      checkpoint: "Checkpoint",
      pratica: "Prática",
      desafio: "Desafio",
      revisao: "Revisão",
    },
  },
  /** Trilha/home e nó/capítulo/seção (docs/25 §12.1/§18 T-16 — copy centralizada aqui desde T-10). */
  trilha: {
    continuar: "Continuar",
    comecarAqui: "Começar por aqui",
    secao: (n: number) => `Seção ${n}`,
    estados: {
      completed: "Concluída",
      "completed-review": "Concluída · revisão sugerida",
      "in-progress": "Em andamento",
      current: "Continuar daqui",
      available: "Disponível",
      locked: "Bloqueada",
    },
    kinds: {
      aula: "Aula",
      pratica: "Prática",
      revisao: "Revisão do capítulo",
    },
    capituloBloqueado: "Conclua o capítulo anterior",
    questoes: (n: number) => `${n} questões`,
    tudoConcluido: "Você concluiu tudo o que está publicado. Que tal praticar?",
    praticar: "Praticar",
    capituloConcluido: "Capítulo concluído",
    secaoConcluida: "Seção concluída",
    fechouLicoes: (n: number) => `Você fechou ${n} lições.`,
    revisaoAberta: "A revisão do capítulo está aberta.",
    fazerRevisao: "Fazer a revisão",
    // Trilha visual (docs/27 §6.6)
    capituloRotulo: (secao: number, cap: number) => `Seção ${secao} · Capítulo ${cap}`,
    proximaNestaMateria: "Próxima nesta matéria",
    recomenda: (titulo: string, materia: string) => `A Foca recomenda: ${titulo} · ${materia}`,
    irParaAtual: "Voltar para a lição atual",
    carimboPendente: (feitas: number, total: number) => `Carimbo do capítulo · ${feitas}/${total}`,
    carimboConcluido: "Capítulo concluído",
    estrelas: (n: number, max: number) => `${n} de ${max} estrelas`,
    metaHoje: (feitas: number, meta: number) => `${feitas}/${meta} hoje`,
    fimDaMateria: (materia: string) => `Você fechou tudo o que está publicado em ${materia}.`,
    erroTitulo: "A trilha não carregou.",
    erroCorpo: "Tenta de novo. Seu progresso está salvo neste aparelho.",
    tentarDeNovo: "Tentar de novo",
    abrirCapitulo: (titulo: string) => `Abrir ${titulo}`,
    recolherCapitulo: (titulo: string) => `Recolher ${titulo}`,
  },
} as const;
