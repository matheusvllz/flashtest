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
  /** Textos reutilizáveis entre telas (docs/36 T-02.2; RU-3). */
  comum: {
    tentarDeNovo: "Tentar de novo",
    fecharAviso: "Fechar aviso",
    ok: "Ok",
  },
  /** Avisos de persistência local (docs/36 T-05.1/T-05.3; RU-4, RU-5, RU-6). Nunca prometem sincronização nem "salvo" quando não foi. */
  persistencia: {
    falhaAoSalvar: "Não consegui salvar neste aparelho. O que você fez agora pode se perder se fechar o app.",
    storageRecuperado: "Não consegui ler seu progresso salvo. Guardei uma cópia e comecei do zero neste aparelho.",
    versaoFutura:
      "Seus dados são de uma versão mais nova do app. Recarregue a página para atualizar. Até lá, nada do que você fizer aqui fica salvo.",
  },
  feedback: {
    verResolucao: "Ver resolução",
    ocultarResolucao: "Ocultar resolução",
    explicarMelhor: "Explicar melhor",
    continuar: "Continuar",
    verResultado: "Ver resultado",
    /** Atribuição de item oficial na folha (docs/34, docs/36 RP-10): ano + prova, sem enfeite. */
    fonteOficial: (fonte: string) => `Questão do ${fonte}`,
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
    /** Nível 3 da explicação em camadas (docs/30 §17, Fase 7) — mensagem auto-enviada quando o aluno pede pra IA ensinar do zero em vez de só apontar o erro. */
    ensinarDoZero: "Me ensina isso do começo.",
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
    /** Variante sem promessa (docs/36 RF-14): usada quando a gravação local não está ok. */
    sairCorpoSemSalvo:
      "Não consegui guardar seu avanço. Se sair agora, talvez você precise recomeçar esta lição.",
    /** Confirmação de saída da lição legada (`LessonPlayer`): a lição não grava pela metade. */
    sairCorpoLegado:
      "O progresso desta lição não fica salvo pela metade — você recomeça do zero na próxima vez.",
    sairCorpoLegadoSemSalvo: "Se sair agora, você recomeça esta lição do zero na próxima vez.",
    sairFicar: "Continuar estudando",
    sairMesmo: "Sair mesmo assim",
    voceAprendeu: "Você aprendeu",
    refazer: "Refazer lição",
    /** Modo silencioso — nivelamento (Fase 13) e checkpoint (Fase 14): sem cor de certo/errado, sem explicação, só confirma que a resposta contou. */
    respostaRegistrada: "Resposta registrada.",
    roles: {
      /** Fase 7 F7.7 (docs/30 §17): "Checkpoint" era jargão de produto sem sentido pro aluno — trocado por um rótulo em português comum. */
      checkpoint: "Checagem rápida",
      pratica: "Prática",
      desafio: "Desafio",
      revisao: "Revisão",
      diagnostico: "Nivelamento",
    },
  },
  /**
   * Questão — botão "Não sei" (docs/30 §16.1, Fase 6). `naoSeiAria` evita a
   * palavra "responder" de propósito: `getByRole` do Playwright casa nome
   * acessível por SUBSTRING (case-insensitive) por padrão, e um `aria-label`
   * contendo "responder" colide com `getByRole("button", { name:
   * "Responder" })` — achado real, quebrava `tutor.spec.ts`/`feedback.spec.ts`
   * quando a flag `botaoNaoSei` ligou (docs/32).
   */
  questao: {
    naoSei: "Não sei",
    naoSeiAria: "Não sei a resposta desta questão",
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
    /** Variante sem promessa (docs/36 RF-14): usada quando a gravação local não está ok. */
    erroCorpoSemSalvo: "Tenta de novo.",
    tentarDeNovo: "Tentar de novo",
    abrirCapitulo: (titulo: string) => `Abrir ${titulo}`,
    recolherCapitulo: (titulo: string) => `Recolher ${titulo}`,
  },
  /**
   * Jornada única (docs/30 §14, Fase 12 F12.9) — home com plano misturado
   * atrás de `FEATURES.jornadaAdaptativa`. `motivos` é o mapa `ReasonCode →
   * texto` do card "Sessão de hoje" (docs/30 §14.2): número no texto só
   * quando vem do estado (nunca inventado aqui, são só as frases fixas em
   * volta), sem "você domina", sem cobrança (docs/20 §7.1). Revisão de tom
   * feita à mão nesta rodada (mesmo critério que a Fase 7 já registrou em
   * F7.5 — autorrevisão direta contra `20` §7.1, não o pipeline completo do
   * Humanizer) — os 9 exemplos do `30` §14.2 foram copiados verbatim; os 5
   * códigos que a tabela não cobre (`revisao-atrasada`, `reforco-ajuda`,
   * `prioridade-aluno`, `checkpoint`, `confirmar-fundamento`) são novos,
   * seguindo o mesmo tom.
   */
  jornada: {
    motivos: {
      "revisao-devida": "Porcentagem foi bem semana passada. Hoje é um bom dia pra conferir se ficou.",
      "revisao-atrasada": "Já faz um tempo que você não revisa isso. Vamos recuperar antes que esfrie.",
      consolidar: "Você foi bem nesse assunto. Antes de avançar, mais umas questões pra firmar.",
      "nova-habilidade": "Assunto novo. Começa com uma aula curta.",
      "reforco-erros": "Essa travou duas vezes. Vamos por partes, com calma.",
      "reforco-nao-sei": "Você marcou 'não sei' aqui. Uma aula rápida resolve isso.",
      "reforco-ajuda": "Você pediu ajuda aqui outras vezes. Uma prática guiada ajuda a firmar.",
      desafio: "Isso está firme. Topa uma mais difícil?",
      "equilibrio-area": "Faz uns dias sem essa área. Uma questão pra variar.",
      retomar: "Vamos de onde você parou?",
      "prioridade-aluno": "Você marcou isso como prioridade.",
      checkpoint: "Hora de conferir como estão as últimas habilidades.",
      "confirmar-fundamento": "Rápido: só pra confirmar que esse fundamento está firme.",
      fallback: "Próxima lição da sua trilha.",
    },
    /** Rótulo de tipo por `ActivityKind` (distinto de `COPY.licao.roles`, que é o papel da questão DENTRO de uma aula). */
    kinds: {
      aula: "Aula",
      pratica: "Prática",
      revisao: "Revisão",
      desafio: "Desafio",
      checkpoint: "Checkpoint",
      legado: "Prática",
      reforco: "Reforço",
    },
    /** Estado do nó no caminho da jornada — texto explícito, não só ícone (docs/31 F12.4, critério de acessibilidade). */
    atual: "Atual",
    aSeguir: "A seguir",
    minutos: (n: number) => `~${n} min`,
    comecar: "Começar",
    continuar: "Continuar",
    verMapa: "Ver mapa das matérias",
    voltarJornada: "Voltar pra jornada",
    semNada: "Você passou por tudo que está disponível agora. Revisões voltam conforme as datas.",
    checkpointConcluido: "Checkpoint concluído",
    checkpointPendente: "Checkpoint",
    recap: "Por agora é isso — seu progresso já está salvo.",
    /** Variante sem promessa (docs/36 RF-14): usada quando a gravação local não está ok. */
    recapSemSalvo: "Por agora é isso.",
    /** Atividade descartada por falta de questões (docs/36 RU-1) — aviso de uma linha na Home. */
    puladaSemItens: "Essa atividade ficou sem questões agora. Segui com a próxima.",
    /** Carregando a atividade por mais de 400 ms (docs/36 RU-2). */
    carregando: "Separando suas questões…",
    /** Pacote de conteúdo indisponível (docs/36 RU-3). */
    erroPacoteTitulo: "Não deu pra carregar agora.",
    erroPacoteCorpo: "Confere a internet e tenta de novo.",
    voltarTrilha: "Voltar à trilha",
    /** Próxima atividade da fila no card da Home (docs/36 RU-12, T-06.2). */
    depois: (titulo: string) => `Depois: ${titulo}`,
  },
  /** Modo foco (docs/30 §15, Fase 12 F12.9/F12.5). */
  foco: {
    titulo: "Foco de estudo",
    linhaTodas: "Todas as matérias",
    linhaFoco: (materias: string) => `Foco: ${materias}`,
    mudar: "Mudar",
    todasAsMaterias: "Todas as matérias",
    soHoje: "Só hoje",
    daquiPraFrente: "Daqui pra frente",
    voltarATodas: "Voltar a todas",
    emBreve: "Em breve",
    ritmoTitulo: "Foco e ritmo",
    minutosPorDia: "Minutos por dia",
  },
  /** Passos novos do onboarding + oferta de nivelamento (docs/30 §12.1/§12.2, Fase 13 F13.1/F13.2/F13.8). */
  onboarding: {
    blocoVoce: "Você",
    blocoSuaProva: "Sua prova",
    blocoSeuRitmo: "Seu ritmo",
    examTitulo: "Qual prova você está estudando pra fazer?",
    outroVestibular: "Outro vestibular",
    dataProva: "Data da prova",
    euSeiAData: "Eu sei a data",
    aindaNaoSeiData: "Ainda não sei",
    tempoTitulo: "Quanto tempo por dia você consegue estudar?",
    tempoHint: "Dá pra mudar isso depois, no Perfil.",
    focoTitulo: "Quer focar em alguma matéria?",
    escolherMaterias: "Escolher matérias",
    ofertaTitulo: "Quer começar no seu nível?",
    ofertaCorpo: "São umas 20 questões, cerca de 10 minutos. Com isso a trilha já começa mais perto do que você precisa.",
    ofertaCtaPrimario: "Fazer o nivelamento",
    ofertaCtaSecundario: "Começar sem nivelamento",
    ofertaRodape: "Dá pra fazer depois, pelo Perfil.",
  },
  /** Seleção de curso (docs/36 §F.7, T-09.2/T-09.3, RU-40, RA-5). Textos do contrato; a contagem é anunciada por `aria-live`. */
  cursos: {
    rotuloBusca: "Curso",
    placeholderBusca: "Buscar pelo nome",
    areasAriaLabel: "Áreas",
    escolhaUmaArea: "Escolha uma área ou busque pelo nome.",
    naoAchei: "Não achei esse curso.",
    usarTexto: (texto: string) => `Usar “${texto}”`,
    aindaNaoDecidi: "Ainda não decidi",
    escolhido: (curso: string) => `Escolhido: ${curso}`,
    contagem: (n: number) => (n === 1 ? "1 curso" : `${n} cursos`),
    perfilRotulo: "Curso pretendido",
    perfilMudar: "Mudar",
    perfilSheetTitulo: "Curso pretendido",
  },
  /** Nivelamento adaptativo — CAT (docs/30 §12.3/§12.5, Fase 13 F13.4/F13.6/F13.8). */
  nivelamento: {
    tituloRota: "Nivelamento",
    duranteHint: "Sem dica nesta parte. Se não souber, toque em Não sei. Isso também ajuda a ajustar a trilha.",
    naoSei: "Não sei",
    pausarEContinuar: "Pausar e continuar depois",
    /** Resultado (docs/36 §F.5, RU-10) — o "Pronto." inicial é o que os E2E esperam. */
    resultadoTitulo: "Pronto. Sua trilha foi ajustada.",
    resultadoCorpo: "Isso é um ponto de partida, não uma nota. Muda conforme você estuda.",
    /** Nenhuma área medida (todas com θ̂ nulo): o corpo troca (docs/36 §F.5, "sem respostas"). */
    resultadoSemDados:
      "Não tivemos questões suficientes para medir agora. Sua trilha começa pelo básico e se ajusta enquanto você estuda.",
    faixaBaseConstrucao: "Base em construção",
    faixaNoCaminho: "No caminho",
    faixaBaseFirme: "Base firme",
    /** Precisão pela SE da ÁREA (docs/36 §F.5) — nunca a SE numérica. */
    precisaoFirme: "Estimativa firme",
    precisaoInicial: "Estimativa inicial",
    precisaoPoucas: "Poucas questões. Vamos confirmar estudando.",
    questoesRespondidas: (n: number) => (n === 1 ? "1 questão" : `${n} questões`),
    /** `aria-label` do indicador de faixa: "{Área}: {faixa}. {precisão}." (a cor nunca é o único sinal). */
    faixaAriaLabel: (area: string, faixa: string, precisao: string) =>
      `${area}: ${faixa}. ${precisao.replace(/\.$/, "")}.`,
    porOndeComecamos: "Por onde começamos",
    primeiraAtividade: (titulo: string) => `Sua primeira atividade: ${titulo}`,
    areaNaoMedida: (area: string) => `Ainda não temos questões suficientes de ${area} para medir.`,
    ctaIrParaTrilha: "Ir para a trilha",
    /** Aplicando o resultado do nivelamento, antes do resultado aparecer (docs/36 RU-11, T-03.3). */
    aplicando: "Montando sua trilha…",
    fazerNivelamento: "Fazer nivelamento",
    refazerNivelamento: "Refazer nivelamento",
    continuarNivelamento: "Continuar nivelamento",
    cardTrilhaTitulo: "Quer ajustar a trilha ao seu nível?",
    cardTrilhaDispensar: "Agora não",
  },
  /** Checkpoint periódico da trilha (docs/30 §13, Fase 14 F14.4/F14.5). */
  checkpoint: {
    tituloRota: "Checkpoint",
    introTitulo: "Checkpoint",
    introCorpo: "Questões misturadas, sem dica. Serve pra ajustar o que vem a seguir na sua trilha.",
    comecar: "Começar",
    agoraNao: "Agora não",
  },
} as const;

/**
 * Escolhe entre a frase que afirma "salvo" e a neutra (docs/36 RF-14, G-15):
 * só `"ok"` (a última gravação local deu certo) autoriza a promessa. Qualquer
 * outro status (`falhou`, `versao-futura`) usa a variante sem promessa. Recebe
 * o status como string para não importar o store aqui (copy.ts é folha).
 */
export function textoSePersistiu(persist: string, salvo: string, neutro: string): string {
  return persist === "ok" ? salvo : neutro;
}
