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
 * docs/copy/inventario.md pro inventário completo e o que
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
    sugestoesGeral: ["Por onde eu começo?", "Como estou indo?", "O que eu estudo agora?"],
    /** Nível 3 da explicação em camadas (docs/30 §17, Fase 7) — mensagem auto-enviada quando o aluno pede pra IA ensinar do zero em vez de só apontar o erro. */
    ensinarDoZero: "Me ensina isso do começo.",
    /** Estados do pedido (spec 48 T-48.2.7). */
    avisoIA: "A Foca IA é uma inteligência artificial e pode errar. Confira com a explicação da questão.",
    restantes: (n: number) => (n === 0 ? "Essa foi a última mensagem de hoje." : n === 1 ? "Resta 1 mensagem hoje." : `Restam ${n} mensagens hoje.`),
    limite: "Você usou as mensagens de hoje com a Foca IA. Amanhã elas voltam. As questões e as explicações continuam liberadas.",
    indisponivel: "A Foca IA está indisponível agora. Seu estudo segue normal, com a explicação de cada questão.",
    consentimento:
      "Aos 17 anos, a Foca IA precisa da autorização de um responsável, e esse pedido ainda não está disponível no app. As explicações de cada questão continuam aqui.",
    desligado: "Você desligou a Foca IA. Para usar de novo, ligue em Perfil.",
    recusado: "Não consigo ajudar com isso. Pergunta sobre a questão ou sobre seus estudos.",
    semSessao: "Entre na sua conta para falar com a Foca IA.",
    fotoInvalida: "Não consegui ler essa foto. Envie uma imagem JPEG, PNG ou WebP.",
    fotoGrande: "Essa foto é grande demais. Escolha uma imagem de até 15 MB.",
    tentarDeNovo: "Tentar de novo",
    /** Protocolo de autocuidado (46 §E.7.5): não segue a conversa e não passa pela IA. Texto também usado no servidor. */
    autocuidado:
      "Parece que você está passando por um momento muito difícil, e isso importa mais que qualquer questão agora. Você não precisa lidar com isso sozinho: ligue 188 (CVV, gratuito, 24 horas) ou converse pelo chat em cvv.org.br. Se estiver em perigo agora, ligue 192 (SAMU).",
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
  /** Painel da marca nas telas de entrada no desktop (docs/44 §5, `EntryShell`). Mesma promessa da landing (F-1). */
  entrada: {
    painelTitulo: "O próximo passo já vem escolhido.",
    painelCorpo: "Você conta qual é a sua prova e o Foca monta o ponto de partida. Depois, é abrir e seguir.",
  },
  /**
   * Conta: cadastro, login, verificação, senha e cadastro completo (docs/specs/46-producao T-05.4; decisão 0006).
   * Erros dizem como resolver, sem culpa; nenhuma mensagem revela se um e-mail tem conta (anti-enumeração).
   */
  conta: {
    voltar: "Voltar",
    email: "E-mail",
    emailExemplo: "voce@email.com",
    senha: "Senha",
    senhaDica: "Pelo menos 8 caracteres.",
    mostrarSenha: "Mostrar senha",
    ocultarSenha: "Ocultar senha",
    nome: "Primeiro nome",
    anoNascimento: "Ano de nascimento",
    anoExemplo: "2007",
    ou: "ou",
    google: "Continuar com o Google",
    aceiteAntes: "Li e aceito os",
    termos: "Termos de uso",
    aceiteMeio: "e a",
    privacidade: "Política de privacidade",

    entrarTitulo: "Entrar",
    entrarSubtitulo: "Seu progresso fica guardado na sua conta.",
    entrarBotao: "Entrar",
    entrando: "Entrando…",
    esqueciSenha: "Esqueci minha senha",
    semConta: "Ainda não tem conta?",
    criarConta: "Criar conta",

    criarTitulo: "Criar sua conta",
    criarSubtitulo: "Com a conta, o que você estudar fica salvo e continua em qualquer aparelho.",
    criarBotao: "Criar conta",
    criando: "Criando conta…",
    jaTemConta: "Já tem conta?",
    /** Topo do quiz de perfil (D-16). */
    quizJaTemConta: "Já tem uma conta?",
    emailDesligado: "Por enquanto, o acesso é pela conta do Google.",

    verificarTitulo: "Confirme seu e-mail",
    verificarCorpo: (email: string) => `Mandamos um link para ${email}. Abra o e-mail e use o link para ativar sua conta.`,
    verificarCorpoSemEmail: "Mandamos um link para o seu e-mail. Abra o e-mail e use o link para ativar sua conta.",
    verificarDica: "Não chegou em alguns minutos? Veja a caixa de spam ou peça outro link.",
    reenviar: "Mandar outro link",
    reenviado: "Mandamos outro link.",
    irParaLogin: "Ir para o login",

    esqueciTitulo: "Redefinir senha",
    esqueciSubtitulo: "Digite o e-mail da sua conta. Mandamos um link para você criar uma senha nova.",
    esqueciBotao: "Mandar link",
    esqueciEnviado: "Se esse e-mail tiver uma conta no Foca, o link chega em alguns minutos. Veja também a caixa de spam.",

    redefinirTitulo: "Criar nova senha",
    novaSenha: "Nova senha",
    redefinirBotao: "Salvar nova senha",
    redefinido: "Senha trocada. Entre com a senha nova.",
    linkInvalido: "Esse link expirou ou já foi usado.",
    pedirOutroLink: "Pedir outro link",

    completarTitulo: "Falta pouco",
    completarSubtitulo: "Para liberar o estudo, precisamos do seu ano de nascimento e do seu aceite dos termos.",
    reaceiteTitulo: "Os termos mudaram",
    reaceiteSubtitulo: "Leia a versão nova e aceite para continuar estudando.",
    completarBotao: "Continuar",
    salvando: "Salvando…",
    idadeMinimaTitulo: "O Foca ainda não é para você",
    idadeMinimaCorpo: (idade: number) =>
      `Por enquanto, o Foca é só para quem tem ${idade} anos ou mais. Não guardamos os dados que você informou.`,
    voltarAoInicio: "Voltar ao início",

    sair: "Sair",
    saindo: "Saindo…",
    sairDeTodos: "Sair de todos os aparelhos",
    contaTitulo: "Conta",
    demoCorpo: "Por enquanto, seu progresso fica salvo só neste aparelho.",
    demoBotao: "Entrar e estudar",
    syncDemonstracao: "Por enquanto, seu progresso fica salvo só neste aparelho.",
    /** Preferência da Foca IA (spec 48 T-48.2.6). */
    focaIA: (ligada: boolean) => (ligada ? "Foca IA ligada" : "Foca IA desligada"),
    focaIAExplica: "Desligada, o botão da Foca IA some e ela não responde. Você pode ligar de novo aqui.",
    /** Seus dados (spec 48 T-48.3.1/T-48.3.2): exportar e excluir. Exclusão: tom sério, consequência no botão. */
    /** Configuração de acesso não carregou (servidor fora ou com erro). */
    acessoIndisponivel: "Não deu para carregar a entrada agora. Confira a internet e tente de novo em instantes.",
    tentarDeNovo: "Tentar de novo",
    dadosTitulo: "Seus dados",
    exportar: "Baixar meus dados",
    exportando: "Preparando…",
    exportarLimite: "Você já baixou seus dados há pouco. Tente de novo daqui a uma hora.",
    excluir: "Excluir conta",
    excluirTitulo: "Excluir sua conta?",
    excluirCorpo: "Isso apaga sua conta e todo o estudo salvo nela, sem volta. O que está só neste aparelho também sai.",
    excluirSenhaRotulo: "Senha",
    excluirSenhaDica: "Se você entrou com o Google, deixe em branco.",
    excluirConfirmar: "Excluir minha conta",
    excluindo: "Excluindo…",
    excluirSenhaErrada: "Senha incorreta. Confira e tente de novo.",
    sairPendente: "Parte do seu estudo ainda não chegou à conta. Se sair agora, essa parte se perde neste aparelho.",
    sairMesmoAssim: "Sair mesmo assim",
    ficar: "Continuar na conta",

    importarTitulo: "Levar seu progresso para a conta?",
    importarCorpo:
      "Você estudou neste aparelho antes de criar a conta. Levando, esse estudo fica salvo na conta e aparece em qualquer aparelho.",
    importarResumo: (respostas: number, licoes: number) =>
      [
        respostas === 1 ? "1 resposta" : `${respostas} respostas`,
        licoes === 1 ? "1 lição concluída" : `${licoes} lições concluídas`,
      ].join(" · "),
    importarBotao: "Levar para a conta",
    importando: "Levando…",
    comecarDoZero: "Começar do zero",
    comecarDoZeroAviso: "Isso apaga o estudo deste aparelho. A conta começa sem progresso.",
    comecarDoZeroConfirmar: "Apagar e começar do zero",
    cancelar: "Cancelar",
    decidirDepois: "Decidir depois",

    erros: {
      emailVazio: "Digite seu e-mail.",
      emailInvalido: "Confira o e-mail: ele precisa ter @ e um domínio, como voce@email.com.",
      senhaVazia: "Digite sua senha.",
      senhaCurta: "Use uma senha com pelo menos 8 caracteres.",
      nomeVazio: "Digite seu primeiro nome.",
      anoInvalido: "Digite o ano com quatro números, como 2007.",
      aceite: "Para continuar, aceite os termos de uso e a política de privacidade.",
      credenciais: "E-mail ou senha incorretos.",
      emailNaoVerificado: "Confirme seu e-mail antes de entrar. O link está na sua caixa de entrada.",
      muitasTentativas: "Muitas tentativas seguidas. Espere um minuto e tente de novo.",
      rede: "Sem conexão com o Foca. Confira a internet e tente de novo.",
      generico: "Não deu certo agora. Tente de novo em instantes.",
    },
  },
  /** Cabeçalho do perfil com conta (spec 49 D49-13): nome e e-mail vêm da conta. */
  perfil: {
    semNome: "Sem nome",
    editarNome: "Editar nome",
    nomeRotulo: "Seu nome",
    nomeAjuda: "É como o Foca vai te chamar.",
    salvar: "Salvar",
    salvando: "Salvando…",
    nomeErro: "Não deu para salvar o nome agora. Tente de novo.",
    nomeCurto: "Escreva pelo menos 2 letras.",
  },
  trilha: {
    /** aria-label do painel de contexto da trilha no desktop (docs/44 §5). */
    painelContexto: "Seu dia",
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
  /** `/topics` (spec 48 T-48.4.1, D48-10): as escolhas mudam o plano; a tela diz como. */
  topicos: {
    titulo: "Assuntos por matéria",
    prioritariasTitulo: "Matérias prioritárias",
    prioritariasCorpo: "Marque as matérias em que você tem mais dificuldade. Elas pesam mais na hora de montar suas próximas atividades.",
    modoTitulo: "Como você quer estudar?",
    modoCorpo: "Escolha assuntos específicos ou deixe a Foca recomendar.",
    modos: {
      chose: "Quero escolher os assuntos",
      recommend: "Prefiro que a Foca recomende",
      skip: "Pular por enquanto",
    },
    efeito: {
      chose:
        "Os assuntos marcados aparecem mais cedo nas aulas e práticas novas. Revisões no prazo continuam vindo antes, para você não esquecer o que já aprendeu.",
      recommend: "A Foca escolhe pelo que você já sabe, pelo que está para revisar e pelo que mais cai no ENEM.",
      skip: "Sem preferência de assunto por enquanto. A trilha segue o que você já sabe e o que está para revisar.",
    },
    andamento: "A atividade que você já começou continua igual. A mudança vale a partir da próxima.",
    semPrioritarias: "Marque uma matéria prioritária acima para escolher os assuntos dela.",
    selecionarTodos: "Selecionar todos",
    removerTodos: "Remover todos",
    escolhidos: (n: number) => (n === 0 ? "Nenhum assunto marcado" : n === 1 ? "1 assunto marcado" : `${n} assuntos marcados`),
  },
  /**
   * Sequência e proteção (spec 48 T-48.6.1, D48-14). Só descreve a regra R-GAM-3 que já existe: sem culpa, sem ameaça,
   * sem contagem regressiva. Termo do produto: "sequência" (nunca "streak" na tela, R-VOZ-8).
   */
  sequencia: {
    titulo: "Sua sequência",
    dias: (n: number) => (n === 0 ? "A sequência começa no próximo estudo" : n === 1 ? "1 dia seguido" : `${n} dias seguidos`),
    hojeFeito: "Hoje já tem estudo.",
    hojeAinda: "Hoje ainda não teve estudo.",
    voltando: (recorde: number) => `Bom te ver de volta. Seu recorde é de ${recorde} dias, e dá para chegar lá de novo.`,
    protecoes: (n: number, max: number) => `Proteções guardadas: ${n} de ${max}`,
    protecaoUsada: (data: string) => `Uma proteção cobriu o dia ${data}.`,
    comoFunciona:
      "A cada 7 dias com estudo você ganha uma proteção, até 2. Se ficar um dia sem estudar, uma proteção cobre esse dia sozinha e a sequência continua.",
    fonte: {
      confirmada: "Confirmado com a sua conta.",
      atualizando: "Atualizando com a sua conta.",
      aparelho: "Contado neste aparelho.",
    },
    botaoAria: (dias: number, hoje: boolean, protecoes: number) =>
      `Sequência de ${dias} ${dias === 1 ? "dia" : "dias"}. ${hoje ? "Hoje já tem estudo" : "Hoje ainda não teve estudo"}. ${protecoes === 1 ? "1 proteção guardada" : `${protecoes} proteções guardadas`}. Ver detalhes`,
  },
  /** Onde está o estudo (spec 48 T-48.8.2, D48-15): nunca diz "na conta" antes de o servidor confirmar. */
  salvamento: {
    aparelho: "Salvo neste aparelho.",
    aguardando: "Salvo neste aparelho, aguardando sincronização com a conta.",
    "sem-conexao": "Sem conexão. Seu estudo está salvo neste aparelho e vai para a conta quando a conexão voltar.",
    sincronizado: "Sincronizado com a conta.",
    falhou: "Não deu para sincronizar agora. Seu estudo continua salvo neste aparelho.",
    tentarAgora: "Tentar agora",
    tentando: "Tentando…",
  },
  /** `/plan` (spec 48 T-48.4.2, D48-11): visão do plano do motor, sem tarefa fixa. */
  plano: {
    titulo: "Meu plano",
    hoje: "Agora",
    metaHoje: (feitos: number, meta: number) => `Meta de hoje: ${feitos} de ${meta}`,
    vazio: "Seu plano aparece aqui depois que a trilha monta as primeiras atividades.",
    irParaTrilha: "Abrir a trilha",
    depois: "Depois",
    depoisExplica: "A ordem muda conforme você estuda: o que você acerta e erra decide o que vem a seguir.",
    feitoHoje: "Feito hoje",
    nadaHoje: "Nada concluído hoje ainda.",
    ritmoTitulo: "Meta do dia",
    ritmoCorpo: "Quantas atividades por dia? Cada lição, prática ou revisão concluída conta uma.",
    semanaTitulo: "Esta semana",
    semanaMeta: (dias: number) => (dias === 1 ? "Meta: 1 dia" : `Meta: ${dias} dias`),
    diaAria: (iso: string, feito: boolean) => `${iso}: ${feito ? "estudou" : "sem estudo"}`,
    prioridadesTitulo: "Prioridades",
    semPrioridades: "Nenhuma matéria prioritária. A trilha segue o que você já sabe e o que está para revisar.",
    assuntos: (lista: string) => `Assuntos escolhidos: ${lista}`,
    ajustarPrioridades: "Ajustar prioridades",
  },
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
      checkpoint: "Checagem",
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
    checkpointConcluido: "Checagem concluída",
    checkpointPendente: "Checagem",
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
    ofertaCorpo: "São 30 questões, cerca de 25 minutos, e dá para pausar no meio. Com isso a trilha já começa mais perto do que você precisa.",
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
    /** Abertura antes da 1ª questão (spec 49 D49-11): o número é sempre o total real das cotas. */
    introTitulo: (n: number) => `São ${n} questões`,
    introCorpo: (minutos: number) =>
      `Leva cerca de ${minutos} minutos. Elas mostram o seu nível em cada área, para a trilha começar no lugar certo. Dá para pausar e continuar depois.`,
    introNaoSei: "Sem dica nesta parte. Se não souber, toque em Não sei: isso também ajuda a acertar o nível.",
    introCta: "Começar nivelamento",
    progresso: (n: number, total: number) => `Questão ${n} de ${total}`,
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
    /** Resultado visual (spec 48 T-48.5.2, B-070): estados distintos por texto e forma. */
    naoMedida: "Não medida",
    faixaAConfirmar: (faixa: string) => `${faixa} (a confirmar)`,
    legendaFaixas: (faixas: string[]) => `Faixas, da esquerda para a direita: ${faixas.join(" · ")}.`,
  },
  /**
   * Diagnóstico de partida em `/aha` (spec 48 T-48.4.3, D48-12; B-068): mostra o que foi MEDIDO no nivelamento e o
   * que o aluno DISSE no perfil, sem confundir os dois e sem selo de severidade inventado.
   */
  diagnostico: {
    rotulo: "Ponto de partida",
    titulo: (nome: string) => (nome ? `Seu ponto de partida, ${nome}.` : "Seu ponto de partida."),
    semMedicao:
      "Você pulou o nivelamento, então ainda não medimos o que você sabe. A trilha começa pelo que você contou no perfil e se ajusta a cada resposta.",
    comMedicao: "Isso é o que o nivelamento mediu. É um ponto de partida, não uma nota.",
    medidoTitulo: "Medido no nivelamento",
    declaradoTitulo: "O que você contou",
    dificuldades: (lista: string) => `Mais dificuldade em: ${lista}.`,
    facilidades: (lista: string) => `Vai bem em: ${lista}.`,
    nadaDeclarado: "Você não marcou matérias com mais ou menos facilidade.",
    declaradoNota: "Isso é o que você disse, não uma medição. Serve para a trilha decidir por onde começar.",
    alvo: (curso: string, faculdade: string) =>
      curso && faculdade ? `Objetivo: ${curso} em ${faculdade}.` : curso ? `Objetivo: ${curso}.` : faculdade ? `Objetivo: ${faculdade}.` : "",
    medirAgora: "Fazer o nivelamento agora",
    medirExplica: "São 30 questões, sem dica. Mostra em que faixa você está em cada área.",
    entrar: "Entrar no meu plano",
    xpInicial: "XP inicial",
  },
  /** Checkpoint periódico da trilha (docs/30 §13, Fase 14 F14.4/F14.5). */
  checkpoint: {
    tituloRota: "Checagem",
    introTitulo: "Checagem",
    introCorpo: "Questões misturadas, sem dica. Serve pra ajustar o que vem a seguir na sua trilha.",
    comecar: "Começar",
    agoraNao: "Agora não",
    /** Resultado (30 §13.5; spec 48 T-48.5.1, D48-13): por habilidade, sem número. */
    resultadoTitulo: "Checagem feita",
    resultadoCorpo: "Comparado com antes da checagem, em cada assunto que caiu:",
    rotulos: { subiu: "Subiu", firme: "Firme", revisar: "Vale revisar" },
    revisaoAmanha: (habilidade: string) => `A revisão de ${habilidade} vem amanhã.`,
    desafioLiberado: (habilidade: string) => `Um desafio de ${habilidade} fica liberado.`,
    nadaMuda: "Sua trilha segue no mesmo ritmo.",
    semRespostas: "Você saiu antes de responder. Nada mudou na sua trilha.",
    xp: (n: number) => `+${n} XP`,
    continuar: "Continuar",
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
