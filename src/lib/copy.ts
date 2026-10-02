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
    /** "Explica de outro jeito" (spec 49 §5.9 item 4, Pro): abre a Foca IA só no toque, com o pedido já escrito. */
    outroJeito: {
      titulo: "Explica de outro jeito",
      passo: "Passo a passo",
      exemplo: "Exemplo do dia a dia",
      pedido: "O que a questão pediu",
      pedidos: {
        passo: "Me explica essa questão passo a passo, um passo de cada vez.",
        exemplo: "Me explica essa questão com um exemplo do dia a dia.",
        pedido: "O que essa questão estava pedindo? Me ajuda a entender o comando.",
      },
    },
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
    /** Combo (spec 50 §5.1.2): selo depois da resposta certa. Zerar nunca tem texto. */
    combo: {
      seguidas: (n: number) => `${n} seguidas`,
      vidaDeVolta: "+1 vida",
    },
    /** Revisão de erros no fim (spec 50 §5.1.4). */
    revisaoErros: {
      titulo: (n: number) => `Rever o que errou (${n})`,
      corpo: "Não custa vida e não muda sua nota. A explicação aparece depois de cada resposta.",
      rever: "Rever",
      verResultado: "Ver resultado",
      contador: (i: number, n: number) => `Revisão ${i} de ${n}`,
    },
    /** Cartões do fim da lição (spec 50 §5.1.7). Precisão sem porcentagem (R-VOZ-7). */
    cartoes: {
      xp: "XP",
      bonusCombo: (n: number) => `+${n} do combo`,
      deprimeira: "De primeira",
      deprimeiraValor: (a: number, total: number) => `${a} de ${total}`,
      tempo: "Tempo",
      maiorCombo: "Maior combo",
      naRevisao: (a: number, n: number) => `Na revisão: ${a} de ${n}`,
    },
    /** Momento principal do fim (spec 50 §5.12.3) e selos dos outros acontecimentos. */
    momentos: {
      especial: "Marco especial",
      marco: (dias: number) => `${dias} dias seguidos`,
      nivel: (n: number) => `Nível ${n}`,
      conquista: "Conquista nova",
      "meta-ofensiva": "Meta de ofensiva cumprida",
      perfeita: "Lição perfeita",
      capitulo: "Capítulo concluído",
      "meta-dia": "Meta do dia feita",
      missoes: "Missões do dia feitas",
      "ofensiva-acesa": "Ofensiva acesa",
      licao: "Lição concluída",
      tambem: "Também",
    },
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
    /**
     * Imagens e tabelas do enunciado (spec 50 §5.9.3, T-50.9.2). "Gire o celular para ver melhor" é o texto
     * literal da spec. Nenhum nome acessível aqui contém "Verificar", "Continuar" ou "responder" (o Playwright
     * casa por substring).
     */
    ampliarImagem: "Ampliar imagem",
    /** Nome do botão que envolve a imagem: o `alt` vem junto, para o leitor de tela saber o que vai ampliar. */
    ampliarImagemDe: (alt: string) => `Ampliar imagem: ${alt}`,
    verDescricao: "Ver descrição",
    esconderDescricao: "Esconder descrição",
    descricaoAutomatica: "Descrição gerada automaticamente.",
    gireOCelular: "Gire o celular para ver melhor",
    tabelaSemLegenda: "Tabela da questão",
    tabelaRolar: "Role para o lado para ver a tabela inteira.",
    visualizadorTitulo: "Imagem da questão",
    visualizadorDica: "Use + e − para ampliar ou reduzir, 0 para voltar ao tamanho normal e as setas para mover a imagem.",
    fechar: "Fechar",
    diminuirZoom: "Diminuir zoom",
    aumentarZoom: "Aumentar zoom",
    zoomAtual: (nivel: string) => `Zoom ${nivel}`,
  },
  /**
   * Página `/creditos` (spec 50 §5.9.2 "Créditos", decisão 0008, T-50.9.7). Texto de interface, não jurídico:
   * diz de onde vêm as questões, a licença do INEP com a citação literal do rodapé oficial e como pedir retirada.
   */
  creditos: {
    tituloPagina: "Créditos e fontes — Foca",
    descricaoPagina: "De onde vêm as questões do Foca, a licença das provas do INEP e como pedir a retirada de uma questão.",
    voltar: "← Voltar",
    titulo: "Créditos e fontes",
    resumo: "De onde vêm as questões do Foca e como cada fonte aparece no app.",
    inep: {
      titulo: "Questões do ENEM, ENEM PPL e ENCCEJA",
      origem:
        "Essas questões são do INEP, o instituto do Ministério da Educação que aplica as provas. O Foca reproduz cada uma como está na prova, sem adaptar enunciado, alternativas, imagens ou gabarito.",
      credito: "Cada questão mostra a prova e o ano, como “ENEM 2022”.",
      licencaAntes: "A página oficial de provas e gabaritos do INEP informa:",
      licencaCitacao:
        "Todo o conteúdo deste site está publicado sob a licença Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada",
      licencaDepois:
        "Essa licença, a CC BY-ND 3.0, permite reproduzir com crédito à fonte e não permite adaptar. Por isso o texto das provas fica igual ao original.",
      terceiros:
        "Textos, imagens e gráficos de outros autores que aparecem dentro das provas mantêm o crédito impresso no original, como “Disponível em…”.",
      linkProvas: "Provas e gabaritos no site do INEP",
      urlProvas: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos",
      linkLicenca: "Licença CC BY-ND 3.0",
      urlLicenca: "https://creativecommons.org/licenses/by-nd/3.0/deed.pt_BR",
    },
    foca: {
      titulo: "Questões do Foca",
      texto:
        "As demais questões são autorais: o Foca escreve com ajuda de inteligência artificial, e a revisão também é feita por inteligência artificial.",
    },
    retirada: {
      titulo: "Pedir a retirada de uma questão",
      texto:
        "Achou um erro numa questão ou é autor de um material usado nela? O caminho vai ser o botão “Reportar problema nesta questão”, que aparece depois que você responde.",
      emBreve: "Esse botão chega numa próxima versão do app.",
    },
    novaAba: "(abre em outra aba)",
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
  /** Planos e assinatura (spec 49 §6). Preços e quantidades vêm do catálogo (`src/lib/planos.ts`), nunca digitados. */
  planos: {
    titulo: "Planos",
    mensal: "Mensal",
    anual: "Anual",
    porMes: (preco: string) => `${preco} por mês`,
    porAno: (preco: string) => `${preco} por ano`,
    equivaleA: (preco: string, desconto: string) => `Equivale a ${preco} por mês, ${desconto} a menos que 12 mensais.`,
    seuPlano: "Seu plano",
    gratis: "Grátis",
    assinar: (plano: string) => `Assinar ${plano}`,
    emBreve: "em breve",
    vendaDesligada: "A assinatura ainda não está disponível. Seu estudo continua igual no Free.",
    erroCarregar: "Não deu para carregar os planos agora. Tente de novo.",
    tentarDeNovo: "Tentar de novo",
    antesDePagar: "Antes de pagar",
    resumoMensal: (plano: string, preco: string) => `${plano}: ${preco} por mês, renova sozinho todo mês.`,
    resumoAnualCartao: (plano: string, preco: string) => `${plano}: ${preco} por ano, renova sozinho todo ano.`,
    resumoAnualPix: (plano: string, preco: string) => `${plano}: ${preco} uma vez, vale 12 meses e não renova.`,
    cancelarQuandoQuiser: "Dá para cancelar quando quiser, em Perfil, sem perder o que você estudou.",
    arrependimento: "Nos primeiros 7 dias, o reembolso é integral.",
    quemPaga: "Quem paga precisa ter 18 anos ou mais.",
    declaracao: "Tenho 18 anos ou mais. Se o aluno for menor de idade, sou o responsável por ele.",
    declaracaoFalta: "Para continuar, confirme a declaração acima.",
    metodo: "Como pagar",
    metodoCartao: "Cartão (renova todo ano)",
    metodoPix: "Pix (12 meses, não renova)",
    irAoPagamento: "Ir para o pagamento",
    indo: "Abrindo o pagamento…",
    pagamentoNoAsaas: "O pagamento é feito no Asaas. O Foca não vê o número do seu cartão.",
    erroCheckout: "Não deu para abrir o pagamento agora. Tente de novo em instantes.",
    jaAssinante: "Você já tem este plano.",
    beneficios: {
      essencial: "Trilha, nivelamento, checagem e flashcards",
      iaDia: (n: number) => (n === 1 ? "Foca IA: 1 mensagem por dia" : `Foca IA: ${n} mensagens por dia`),
      iaDiaFotos: (n: number, f: number) => `Foca IA: ${n} mensagens e ${f} fotos por dia`,
      protetores: (estoque: number) => `Protetores de sequência: até ${estoque} guardados`,
      protetoresBonus: (bonus: number, estoque: number) => `+${bonus} protetores por mês, até ${estoque} guardados`,
      vidas: (n: number) => `${n} vidas por dia`,
      comAnuncios: "Com anúncios",
      semAnunciosVidas: "Sem anúncios e com vidas ilimitadas",
      tudoDoFree: "Tudo do Free",
      tudoDoBasic: "Tudo do Basic",
      funcoesBasic: "Caderno de erros, cronograma até o ENEM e estudo sem internet",
      corretor: (n: number) => `Corretor de redação: ${n} por mês`,
      funcoesPro: "Explica de outro jeito e treino de redação por partes",
      simulados: "Simulados cronometrados",
    },
    retorno: {
      confirmando: "Confirmando seu pagamento…",
      pronto: (plano: string) => `Pronto, seu plano ${plano} está ativo.`,
      irParaTrilha: "Ir para a trilha",
      recusado: "O pagamento não foi aprovado. Nada foi cobrado.",
      cancelado: "Pagamento cancelado. Nada foi cobrado.",
      expirado: "O tempo para pagar acabou. Dá para começar de novo.",
      demorando: "Ainda estamos confirmando. Quando cair, o plano ativa sozinho e avisamos por e-mail.",
      voltarAosPlanos: "Voltar aos planos",
      simularAprovado: "Simular pagamento aprovado",
      simularRecusado: "Simular pagamento recusado",
      simulacao: "Ambiente de teste: o pagamento é simulado.",
    },
    assinatura: {
      titulo: "Assinatura",
      planoAtual: (plano: string) => `Plano ${plano}`,
      renovaEm: (data: string) => `Renova em ${data}.`,
      valeAte: (data: string) => `Vale até ${data}.`,
      atrasada: "O último pagamento não caiu. O plano continua até o fim do período.",
      verPlanos: "Ver planos",
      cancelar: "Cancelar assinatura",
      cancelarConfirma: "Cancelar a renovação? Você continua com o plano até o fim do período pago.",
      cancelarSim: "Sim, cancelar",
      cancelarNao: "Manter",
      cancelado: (data: string) => `Cancelada. Você continua com o plano até ${data}.`,
      reembolso: "Pedir reembolso",
      reembolsoConfirma: "Pedir o reembolso integral? A conta volta ao Free na hora, com tudo o que você estudou.",
      reembolsoSim: "Sim, pedir reembolso",
      reembolsoFeito: "Reembolso pedido. A conta voltou ao Free.",
      reembolsoSuporte: "Este reembolso precisa passar pelo suporte.",
      foraDoPrazo: "O prazo de 7 dias para o reembolso integral já passou.",
      erro: "Não deu para concluir agora. Tente de novo.",
    },
  },
  /** Ranking semanal só para maiores de 18 (spec 49 D49-06, §5.6). Nunca "você é o último", nunca "caiu". */
  ranking: {
    titulo: "Ranking da semana",
    desligado: "O ranking ainda não está disponível.",
    menor: "O ranking é para maiores de 18. O resto do Foca continua igual para você.",
    entrarTitulo: "Quer entrar no ranking da semana?",
    explica:
      "Os outros participantes veem só o seu apelido e os seus pontos da semana. Não há mensagens nem perfil. Dá para sair quando quiser.",
    comoPontua: "Cada dia com estudo vale 100 pontos e cada bloco concluído vale 10, até 5 blocos por dia.",
    apelido: "Seu apelido",
    apelidoAjuda: "De 3 a 20 caracteres. Sem nome completo, telefone ou link.",
    nascimento: "Como você faz 18 este ano, confirme o dia e o mês do seu aniversário. Não guardamos essa data.",
    dia: "Dia",
    mes: "Mês",
    entrar: "Entrar no ranking",
    sair: "Sair do ranking",
    voce: "Você",
    posicao: (n: number) => `${n}º`,
    pontos: (n: number) => (n === 1 ? "1 ponto" : `${n} pontos`),
    suaPosicao: (n: number) => `Você está em ${n}º nesta semana.`,
    denunciar: "Reportar apelido",
    denunciado: "Apelido reportado. Ele fica oculto até a revisão.",
    problemas: {
      tamanho: "O apelido precisa ter de 3 a 20 caracteres.",
      caracteres: "Use só letras, números, espaço, ponto, hífen ou sublinhado.",
      contato: "O apelido não pode ter telefone, e-mail ou link.",
      ofensivo: "Escolha outro apelido.",
      repetido: "Esse apelido já está em uso.",
    },
    erro: "Não deu para carregar o ranking agora. Tente de novo.",
  },
  /** Caderno de erros (spec 49 §5.9 item 2): Basic e Pro. Errar nunca é tratado como falha (R-MASC-2). */
  caderno: {
    titulo: "Caderno de erros",
    explica: "As questões que você errou voltam aqui em 1, 3, 7 e 14 dias. Acertou duas vezes seguidas, ela sai do caderno.",
    paraHoje: (n: number) => (n === 0 ? "Nada para revisar hoje." : n === 1 ? "1 questão para revisar hoje." : `${n} questões para revisar hoje.`),
    revisarAgora: "Revisar agora",
    vazio: "Seu caderno está vazio. Quando errar uma questão, ela aparece aqui para você revisar com calma.",
    proxima: (dia: string) => `Volta em ${dia}`,
    hoje: "Para hoje",
    verExplicacao: "Ver explicação",
    ocultarExplicacao: "Ocultar explicação",
    reexplicar: "Pedir para a Foca IA explicar",
    pedidoReexplicar: "Errei essa questão antes. Me explica de novo, de um jeito diferente.",
    entrar: "Entrar",
    indisponivel: "Esta questão não está disponível agora.",
    fechadoTitulo: "Caderno de erros",
    fechado: "Com o Basic ou o Pro, as questões que você errou voltam na hora certa para você revisar.",
    somenteLeitura: "Questões guardadas no seu caderno (só para leitura)",
    verPlanos: "Ver planos",
    semConta: "Entre na sua conta para usar o caderno de erros.",
    erro: "Não deu para abrir o caderno agora. Tente de novo.",
    carregando: "Abrindo seu caderno…",
    revisaoTitulo: "Revisão do caderno",
    revisaoIntro: "Questões que você errou antes. Sem pressa: é aqui que elas viram acerto.",
    revisaoRecap: "Revisão feita. As que você acertou voltam mais tarde; as outras, amanhã.",
    revisaoPronta: (c: number, t: number) => `Você acertou ${c} de ${t}.`,
    voltar: "Voltar ao caderno",
    link: "Caderno de erros",
  },
  /** Corretor e treino de redação (spec 49 §5.9): Pro. Estimativa, nunca "sua nota no ENEM". */
  redacaoIa: {
    corretorTitulo: "Corretor de redação",
    treinoTitulo: "Treino por partes",
    rotulo: "Estimativa da Foca IA, não é a nota oficial.",
    fechado: "O corretor e o treino por partes fazem parte do Pro.",
    verPlanos: "Ver planos",
    desligado: "Esta função ainda não está disponível.",
    indisponivel: "A Foca IA não está disponível agora. Seu texto não foi enviado.",
    consentimento: "Para usar a Foca IA, seu responsável precisa autorizar primeiro. Veja em Perfil.",
    iaDesligada: "Você desligou a Foca IA no Perfil. Ligue de novo para usar esta função.",
    recusado: "Não deu para avaliar esse texto. Reescreva sem conteúdo ofensivo e tente de novo.",
    limiteMes: "Você usou as correções deste mês. Elas voltam no dia 1º.",
    limiteIa: "Suas mensagens da Foca IA de hoje acabaram. Amanhã tem mais.",
    falha: "A correção não saiu desta vez e não contou no seu mês. Tente de novo.",
    erro: "Não deu para carregar agora. Tente de novo.",
    semConta: "Entre na sua conta para usar esta função.",
    entrar: "Entrar",
    restantes: (n: number) => (n === 1 ? "1 correção restante neste mês." : `${n} correções restantes neste mês.`),
    tema: "Tema",
    temaAjuda: "Escreva o tema da proposta que você usou.",
    texto: "Sua redação",
    textoAjuda: (min: number, max: number) => `De ${min} a ${max} caracteres. Digite o texto como escreveu.`,
    contador: (n: number) => `${n} caracteres`,
    corrigir: "Pedir correção",
    corrigindo: "Corrigindo… pode levar até um minuto.",
    total: (n: number) => `Estimativa total: ${n} de 1000`,
    competencia: (c: number) => `Competência ${c}`,
    nota: (n: number) => `${n} de 200`,
    trecho: "Trecho que motivou:",
    comentario: "Para a próxima",
    historico: "Correções anteriores",
    abrir: "Ver",
    apagar: "Apagar",
    apagado: "Texto apagado.",
    novaCorrecao: "Nova correção",
    voltar: "Voltar",
    temaDaSemana: "Tema de treino da semana",
    temaAviso: "Tema escrito pelo Foca para treinar. Não é tema oficial nem previsão de prova.",
    partes: {
      tese: { titulo: "Tese", pedido: "Em uma ou duas frases, qual é o seu ponto de vista sobre o tema?" },
      argumento: { titulo: "Argumento", pedido: "Escreva um argumento que defenda a sua tese, explicando a causa ou a consequência." },
      repertorio: { titulo: "Repertório", pedido: "Traga uma referência de fora (fato, obra, conceito) e diga como ela se liga ao tema." },
      proposta: { titulo: "Proposta de intervenção", pedido: "Quem faz, o que faz, como, para quê, e um detalhe a mais." },
    },
    enviarParte: "Pedir comentário",
    reescrever: "Reescrever",
    automatico: "Comentário automático (sem a Foca IA).",
    /** Comentário automático do treino por partes, quando não há chave da IA (DV49-12). */
    automaticos: {
      tese: "Confira se a frase deixa claro o que você defende sobre o tema, e não só o assunto. Uma boa tese responde: qual é o problema e por que ele acontece?",
      teseLonga: "Sua tese está longa. Tente dizer o ponto de vista em uma ou duas frases, sem ainda dar os argumentos.",
      argumentoComConector: "Você ligou causa e consequência, bom sinal. Confira se o argumento se conecta à tese e termina mostrando por que isso importa.",
      argumentoSemConector: 'Faltou mostrar a relação de causa ou consequência. Use um conector como "porque", "já que" ou "por isso" para explicar o seu argumento.',
      repertorioCurto: "Além de citar a referência, explique em uma frase como ela se liga ao tema. Repertório sem ligação com o argumento perde força.",
      repertorio: "Confira se a referência é verdadeira e conhecida, e se você explicou como ela ajuda a defender a sua tese.",
      propostaCompleta: "Os cinco elementos parecem estar aí. Releia e veja se cada um está claro e ligado ao problema que você discutiu.",
      propostaFaltam: (faltam: string) => `Pode faltar: ${faltam}. Uma proposta completa diz quem faz, o que faz, como, para quê e um detalhe a mais.`,
      elementos: {
        agente: "agente (quem faz)",
        acao: "ação (o que faz)",
        meio: "meio (como faz)",
        finalidade: "finalidade (para quê)",
        detalhamento: "detalhamento",
      },
    },
    gastaMensagem: "Cada comentário usa 1 mensagem da Foca IA.",
    feita: "Comentada",
    link: "Corretor e treino",
  },
  /** Estudo sem internet (spec 49 §5.9 item 6): Basic e Pro. */
  offline: {
    titulo: "Estudar sem internet",
    online: "Você está com internet",
    onlineExplica: "Tudo funciona normalmente.",
    semRede: "Você está sem internet",
    semRedeExplica: "Se você baixou a semana, as lições continuam. A Foca IA, o caderno e a conta voltam com a internet.",
    baixarTitulo: "Baixar a semana",
    baixarExplica: "Guarda no aparelho as lições da sua fila e o conteúdo dos próximos dias. O que você responder sem internet sobe sozinho quando ela voltar.",
    baixar: "Baixar a semana",
    atualizar: "Atualizar o que está baixado",
    baixando: "Baixando…",
    pronto: (n: number) => (n === 1 ? "Pronto: 1 arquivo guardado." : `Pronto: ${n} arquivos guardados.`),
    jaBaixado: "A semana está baixada neste aparelho.",
    remover: "Apagar o que foi baixado",
    erro: "Não deu para baixar agora. Confira a internet e tente de novo.",
    fechado: "Com o Basic ou o Pro, você baixa a semana e estuda sem internet.",
    verPlanos: "Ver planos",
    semConta: "Entre na sua conta para baixar lições.",
    naoSuporta: "Este navegador não permite guardar lições para estudar sem internet.",
    syncTitulo: "Respostas guardadas",
    pendentes: (n: number) => (n === 0 ? "Tudo enviado." : n === 1 ? "1 resposta esperando a internet." : `${n} respostas esperando a internet.`),
    enviarAgora: "Enviar agora",
    enviando: "Enviando…",
  },
  /** Cronograma até o ENEM (spec 49 §5.9 item 3): Basic e Pro, estende /plan. */
  cronograma: {
    titulo: "Cronograma até o ENEM",
    fechado: "Com o Basic ou o Pro, você diz quantos dias e minutos tem, e o Foca divide a semana entre as áreas até a prova.",
    verPlanos: "Ver planos",
    configurar: "Montar meu cronograma",
    editar: "Mudar",
    dias: "Dias de estudo por semana",
    minutos: "Minutos por dia",
    dataProva: "Data da prova",
    dataEstimada: "Data estimada: o INEP ainda não publicou a data oficial.",
    salvar: "Salvar cronograma",
    salvo: "Cronograma salvo.",
    faltam: (d: number) => (d === 0 ? "A prova é hoje." : d === 1 ? "Falta 1 dia para a prova." : `Faltam ${d} dias para a prova.`),
    meta: (feitos: number, meta: number) => `Nesta semana: ${feitos} de ${meta} blocos.`,
    semanaFeita: "A meta desta semana está feita. O que vier agora é bônus.",
    proximos: "O que falta nesta semana",
    blocos: (n: number) => (n === 1 ? "1 bloco" : `${n} blocos`),
    redacao: "Redação",
    erro: "Não deu para carregar o cronograma agora.",
    erroSalvar: "Não deu para salvar. Tente de novo.",
  },
  /** Protetores avulsos (spec 49 D49-05, §5.5): só na folha da sequência e na tela de planos; nunca com urgência. */
  protetores: {
    comprar: "Comprar protetores",
    titulo: "Protetores de sequência",
    explica: (max: number) => `Cada protetor cobre um dia parado, sozinho. Seu plano guarda até ${max}.`,
    pacote: (n: number, preco: string) => (n === 1 ? `1 protetor por ${preco}` : `${n} protetores por ${preco}`),
    naoCabe: "Não cabe no seu estoque agora.",
    estoqueCheio: "Seu estoque está cheio.",
    limiteMenor: "Este mês já teve as compras avulsas permitidas para a sua conta.",
    vendaDesligada: "A compra de protetores ainda não está disponível.",
    retornoPronto: "Pronto, os protetores entraram no seu estoque.",
  },
  /** Vidas do Free (spec 49 D49-03, §5.3). Sem culpa: nada de "você perdeu", "cuidado" ou contagem regressiva. */
  vidas: {
    aria: (n: number) => (n === 1 ? "1 vida hoje. Ver como funciona" : `${n} vidas hoje. Ver como funciona`),
    titulo: "Vidas",
    regra: "No plano Free, errar uma questão de lição custa 1 vida. Não sei, nivelamento, checagem e flashcards não custam. As vidas voltam amanhã.",
    ilimitadas: "Nos planos Basic e Pro, as vidas são ilimitadas.",
    semVidasTitulo: "Suas vidas de hoje acabaram",
    semVidasCorpo: "Elas voltam amanhã. O que você já estudou está salvo.",
    assistir: "Assistir e ganhar 1 vida",
    anuncioIndisponivel: "Anúncio indisponível agora.",
    ganhou: "Pronto, você ganhou 1 vida.",
    verPlanos: "Ver planos",
    flashcards: "Revisar flashcards",
    voltarAmanha: "Voltar amanhã",
  },
  /** Anúncios do Free (spec 49 §5.4) e o consentimento de cookies (Guia de cookies da ANPD): dois botões do mesmo peso. */
  anuncios: {
    rotulo: "Publicidade",
    cookiesTitulo: "Cookies de anúncios",
    cookiesCorpo:
      "No plano Free aparecem anúncios. Eles nunca usam o que você estuda. Você aceita cookies de anúncios? Se recusar, os anúncios aparecem sem cookies e nada muda no seu estudo.",
    aceitar: "Aceitar",
    recusar: "Recusar",
    preferencia: "Cookies de anúncios",
    preferenciaAceito: "Aceitos",
    preferenciaRecusado: "Recusados",
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
    /** Som no iPhone (spec 50 D50-15). */
    somNoSilencioso: "Tocar no modo silencioso",
    somNoSilenciosoAjuda: "No iPhone, o modo silencioso desliga os sons do app. Ligue aqui para ouvir mesmo assim.",
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
  /** Ofensiva (spec 50 §5.2): meta escolhida, calendário e marcos. Sem contagem regressiva, sem texto de perda. */
  ofensiva: {
    meta: {
      titulo: "Meta de ofensiva",
      escolha: "Quer uma meta de ofensiva?",
      explica: "Escolha quantos dias seguidos quer estudar. Ao chegar lá, você ganha Pérolas. Dá para trocar quando quiser.",
      opcao: (dias: number) => `${dias} dias`,
      recompensa: (perolas: number) => `+${perolas} Pérolas`,
      ativa: (dias: number) => `Meta: ${dias} dias seguidos`,
      progresso: (feitos: number, alvo: number, perolas: number) => `${feitos} de ${alvo} dias. Ao chegar, +${perolas} Pérolas.`,
      trocar: "Trocar ou parar a meta",
      cumprida: (dias: number) => `Meta de ${dias} dias cumprida`,
      erro: "Não deu para salvar a meta agora. Tente de novo.",
    },
    calendario: {
      titulo: "Calendário da ofensiva",
      anterior: "Mês anterior",
      seguinte: "Mês seguinte",
      semana: ["D", "S", "T", "Q", "Q", "S", "S"],
      diaAria: (dia: number, estado: "estudou" | "protegido" | "sem" | "futuro") =>
        estado === "estudou"
          ? `Dia ${dia}: estudou`
          : estado === "protegido"
            ? `Dia ${dia}: coberto por protetor`
            : estado === "futuro"
              ? `Dia ${dia}`
              : `Dia ${dia}: sem estudo`,
      carregando: "Carregando o calendário…",
    },
    marco: {
      titulo: (dias: number) => `${dias} dias seguidos`,
      bau: "Baú do marco",
      conteudo: "Dentro do baú:",
      perolas: (n: number) => `${n} Pérolas`,
      abrir: "Abrir o baú",
      aberto: "Já está na sua conta.",
      compartilhar: "Compartilhar",
      salvarImagem: "Salvar imagem",
      cartaoTexto: (dias: number) => `${dias} dias seguidos estudando com o Foca`,
    },
  },
  /** Pérolas (spec 50 §5.3): ganhas aprendendo, nunca vendidas. */
  perolas: {
    nome: "Pérolas",
    saldoAria: (n: number) => (n === 1 ? "1 Pérola" : `${n} Pérolas`),
    titulo: "Suas Pérolas",
    comoGanhar: "Você ganha Pérolas concluindo lições, acertando de primeira, cumprindo missões e metas. Elas não se compram com dinheiro.",
    aConfirmar: "a confirmar",
    historico: "Últimos 90 dias",
    historicoVazio: "Ainda não há movimento. Conclua uma lição para ganhar as primeiras.",
    irLoja: "Ir à loja",
    motivos: {
      bloco: "Bloco concluído",
      perfeita: "Lição perfeita",
      missao: "Missão do dia",
      "missoes-completas": "As 3 missões do dia",
      "meta-ofensiva": "Meta de ofensiva",
      marco: "Marco de ofensiva",
      conquista: "Conquista",
      desafio: "Desafio do mês",
      nivel: "Subiu de nível",
      simulado: "Simulado completo",
      compra: "Loja",
    },
    ganhou: (n: number) => `+${n} Pérolas`,
    carregando: "Carregando…",
    erro: "Não deu para carregar suas Pérolas agora.",
  },
  /** Loja (spec 50 §5.3.3): nada de aprendizagem à venda; nada pré-selecionado; sem urgência. */
  loja: {
    titulo: "Loja",
    explica: "Troque Pérolas por proteção, vidas e estilo. Nada aqui muda o que você aprende nem a sua posição.",
    comprar: "Trocar",
    comprando: "Trocando…",
    preco: (n: number) => `${n} Pérolas`,
    temJa: "Você já tem",
    equipar: "Usar",
    equipado: "Em uso",
    tirar: "Tirar",
    semConta: "Entre na sua conta para usar a loja.",
    offline: "A loja precisa de internet.",
    secoes: { protecao: "Proteção e vidas", roupas: "Roupas da Foca", temas: "Temas da trilha" },
    itens: {
      protetor: { nome: "Protetor de ofensiva", desc: "Cobre um dia sem estudo, sozinho." },
      "recarga-vidas": { nome: "Recarga de vidas", desc: "Suas vidas voltam a 5. Uma vez por dia." },
      "roupa:bone": { nome: "Boné", desc: "" },
      "roupa:oculos": { nome: "Óculos", desc: "" },
      "roupa:cachecol": { nome: "Cachecol", desc: "" },
      "roupa:fone": { nome: "Fone", desc: "" },
      "roupa:mochila": { nome: "Mochila", desc: "" },
      "roupa:coroa-conchas": { nome: "Coroa de conchas", desc: "" },
      "tema:coral": { nome: "Coral", desc: "" },
      "tema:recife": { nome: "Recife", desc: "" },
      "tema:noite-no-mar": { nome: "Noite no mar", desc: "" },
    },
    recusas: {
      ITEM_DESCONHECIDO: "Esse item não está na loja.",
      SALDO_INSUFICIENTE: "Faltam Pérolas para esse item.",
      ESTOQUE_CHEIO: "Seus protetores já estão no máximo do seu plano.",
      SEM_VIDAS_NO_PLANO: "Seu plano não usa vidas.",
      VIDAS_CHEIAS: "Suas vidas já estão cheias.",
      RECARGA_JA_USADA_HOJE: "A recarga de hoje já foi usada.",
      JA_POSSUI: "Você já tem esse item.",
      PEROLAS_DESLIGADAS: "A loja está fechada agora.",
      erro: "Não deu para trocar agora. Tente de novo.",
    },
    pronto: "Pronto.",
  },
  /** Missões, desafio do mês e conquistas (spec 50 §5.4). Sem contagem regressiva; nada por tempo de uso. */
  missoes: {
    titulo: "Missões",
    hoje: "Missões de hoje",
    explica: "Três missões por dia, trocam sozinhas amanhã. Cada uma vale 10 Pérolas; as três juntas, mais 10.",
    feita: "Feita",
    progresso: (feito: number, alvo: number) => `${feito} de ${alvo}`,
    textos: {
      "fazer-1": "Conclua 1 bloco de estudo",
      "fazer-2": "Conclua 2 blocos de estudo",
      "combo-3": "Acerte 3 seguidas",
      "combo-5": "Acerte 5 seguidas",
      perfeita: "Faça uma lição perfeita",
      "revisao-trilha": "Faça a revisão sugerida da trilha",
      "pratica-LC": "Responda 4 questões de Linguagens",
      "pratica-CH": "Responda 4 questões de Ciências Humanas",
      "pratica-CN": "Responda 4 questões de Ciências da Natureza",
      "pratica-MT": "Responda 4 questões de Matemática",
      "caderno-3": "Revise 3 questões do caderno",
      "escrita-1": "Escreva um trecho de redação",
      "mini-semana": "Faça o mini-simulado da semana",
      "flashcards-1": "Revise um lote de flashcards",
    } as Record<string, string>,
    desafio: {
      titulo: "Desafio do mês",
      texto: (alvo: number) => `Conclua ${alvo} missões neste mês e ganhe a medalha do mês e 150 Pérolas.`,
      feito: "Medalha do mês conquistada.",
    },
    conquistas: "Conquistas",
    medalhas: "Medalhas",
    semMedalha: "As medalhas dos desafios do mês aparecem aqui.",
    obtida: "Conquistada",
    desligadas: "As missões estão pausadas agora.",
    semConta: "Entre na sua conta para ver as missões.",
    carregando: "Carregando as missões…",
    erro: "Não deu para carregar as missões agora.",
    social: "Liga e amigos",
  },
  conquistas: {
    "primeira-licao": { nome: "Primeira lição", criterio: "Conclua sua primeira lição." },
    "licoes-10": { nome: "10 lições", criterio: "Conclua 10 lições." },
    "licoes-50": { nome: "50 lições", criterio: "Conclua 50 lições." },
    "licoes-200": { nome: "200 lições", criterio: "Conclua 200 lições." },
    "ofensiva-7": { nome: "Uma semana seguida", criterio: "Chegue a 7 dias seguidos." },
    "ofensiva-30": { nome: "Um mês seguido", criterio: "Chegue a 30 dias seguidos." },
    "ofensiva-100": { nome: "100 dias", criterio: "Chegue a 100 dias seguidos." },
    "ofensiva-365": { nome: "Um ano", criterio: "Chegue a 365 dias seguidos." },
    "perfeitas-5": { nome: "5 lições perfeitas", criterio: "Faça 5 lições perfeitas." },
    "perfeitas-25": { nome: "25 lições perfeitas", criterio: "Faça 25 lições perfeitas." },
    "combo-10": { nome: "10 seguidas", criterio: "Acerte 10 questões seguidas." },
    "primeiro-simulado": { nome: "Primeiro simulado", criterio: "Termine um simulado." },
    "simulado-90": { nome: "Dia de prova", criterio: "Termine um simulado de 90 questões." },
    "escritas-10": { nome: "10 textos", criterio: "Escreva 10 tarefas de redação." },
    "primeira-estimativa": { nome: "Primeira estimativa", criterio: "Receba uma estimativa de redação." },
    "quatro-areas": { nome: "As 4 áreas", criterio: "Pratique as 4 áreas do ENEM na mesma semana." },
    "caderno-20": { nome: "Caderno em dia", criterio: "Resolva 20 questões do caderno de erros." },
    "nivel-5": { nome: "Nível 5", criterio: "Chegue ao nível 5." },
    "nivel-10": { nome: "Nível 10", criterio: "Chegue ao nível 10." },
  } as Record<string, { nome: string; criterio: string }>,
  /** Praticar (spec 50 §5.7.2). */
  praticar: {
    titulo: "Praticar",
    revisaoRapida: { titulo: "Revisão rápida", texto: "Duas questões escolhidas para você." },
    errosRecentes: { titulo: "Rever erros recentes", texto: "As questões que você errou nos últimos dias. Não custa vida." },
    erros: {
      titulo: "Erros recentes",
      intro: "As questões que você errou nos últimos 7 dias. Aqui não custa vida e não muda sua nota.",
      recap: "Revisão feita. O que você errou de novo continua na lista.",
      vazio: "Nenhum erro nos últimos 7 dias. Quando houver, eles aparecem aqui.",
      voltar: "Voltar para Praticar",
    },
    caderno: { titulo: "Caderno de erros", texto: "O que você errou volta no dia certo." },
    flashcards: { titulo: "Flashcards", texto: "Fórmulas e conceitos para fixar." },
    mini: { titulo: "Mini-simulado da semana", texto: "15 questões do ENEM, nível prova." },
    simulados: { titulo: "Simulados", texto: "Provas do ENEM e simulados nível ENEM." },
    materias: { titulo: "Praticar por matéria", texto: "Escolha o assunto." },
    emBreve: "Em breve",
    noPlano: (plano: string) => `No plano ${plano}`,
  },
  /** Retrospectiva pós-ENEM (spec 50 §5.7.3): sem nota, sem previsão, sem comparação com outros. */
  retrospectiva: {
    titulo: (ano: number) => `Seu ano no Foca ${ano}`,
    link: "Seu ano no Foca",
    fechada: (dia: string) => `A retrospectiva abre depois do ENEM, em ${dia}.`,
    dias: (n: number) => (n === 1 ? "1 dia com estudo" : `${n} dias com estudo`),
    licoes: (n: number) => (n === 1 ? "1 lição concluída" : `${n} lições concluídas`),
    questoes: (n: number) => (n === 1 ? "1 questão respondida" : `${n} questões respondidas`),
    ofensiva: (n: number) => `Maior ofensiva: ${n} ${n === 1 ? "dia" : "dias"}`,
    areas: "Onde você mais praticou",
    redacoes: (n: number) => (n === 1 ? "1 texto escrito" : `${n} textos escritos`),
    simulados: (n: number) => (n === 1 ? "1 simulado feito" : `${n} simulados feitos`),
    fecho: "Isso é o que você construiu. O resultado do ENEM sai pelo INEP; este resumo é só do seu caminho até lá.",
    nomesAreas: { LC: "Linguagens", CH: "Ciências Humanas", CN: "Ciências da Natureza", MT: "Matemática" },
    carregando: "Montando o seu ano…",
    erro: "Não deu para montar a retrospectiva agora.",
  },
  /** Atalhos do Perfil depois da navegação em 5 abas (spec 50 §5.11.2). */
  perfilAtalhos: {
    progresso: "Seu progresso",
  },
  /** Navegação em 5 abas (spec 50 §5.11). */
  abas: {
    trilha: "Trilha",
    praticar: "Praticar",
    redacao: "Redação",
    missoes: "Missões",
    perfil: "Perfil",
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
