/**
 * Cria o Google Forms da pesquisa Abroad automaticamente.
 *
 * COMO USAR (2 minutos):
 * 1. Acesse https://script.google.com
 * 2. Clique em "Novo projeto"
 * 3. Apague o conteúdo padrão e cole este arquivo inteiro
 * 4. Clique em "Executar" (▶) com a função criarFormularioAbroad selecionada
 * 5. Na primeira vez, o Google vai pedir autorização — permita (é a sua própria conta)
 * 6. Veja o resultado em "Execução" no rodapé, ou em Exibir > Registros (Logs):
 *    vai aparecer o link de edição e o link público do formulário
 *
 * Baseado em: 19-copy-lp-instagram-e-pesquisa-abroad.md (Parte B), v2 enxuta.
 */
function criarFormularioAbroad() {
  var form = FormApp.create('Estudar fora: por onde você começaria?');

  form.setDescription(
    '3 minutinhos, anônimo (só o email no fim, se quiser)\n' +
    'A gente tá construindo o Abroad, um app que ajuda quem quer estudar fora a saber o próximo passo\n' +
    'Quer entender como isso é pra você hoje, não tem resposta certa'
  );

  form.setConfirmationMessage(
    'Valeu de verdade\n' +
    'Cada resposta ajuda a gente a abrir essa caixa-preta pra quem nunca teve o mapa 💙'
  );

  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);

  // 1
  form.addMultipleChoiceItem()
    .setTitle('Você já pensou em estudar fora do Brasil?')
    .setChoiceValues([
      'Sim, é um objetivo real',
      'Já passou pela minha cabeça',
      'Não, mas consideraria se fosse mais fácil',
      'Não é pra mim'
    ])
    .setRequired(true);

  // 2
  form.addScaleItem()
    .setTitle('O quanto você sente que sabe COMO fazer isso acontecer?')
    .setBounds(1, 5)
    .setLabels('não faço ideia', 'sei bem o caminho')
    .setRequired(true);

  // 3
  form.addMultipleChoiceItem()
    .setTitle('Você já tentou pesquisar como? O que rolou?')
    .setChoiceValues([
      'Me perdi de tanta informação',
      'Achei coisa demais e contraditória, não soube em quem confiar',
      'Descobri uns pedaços, mas não a ordem',
      'Achei um caminho claro',
      'Nunca pesquisei a fundo'
    ])
    .setRequired(true);

  // 4
  form.addCheckboxItem()
    .setTitle('O que MAIS te trava?')
    .setHelpText('Marque até 3')
    .setChoiceValues([
      'Não sei por onde começar',
      'Não sei quais provas preciso fazer',
      'Não sei quanto custa de verdade',
      'Não sei se tem bolsa pra mim',
      'Acho caro demais',
      'Parece coisa de quem já tem contato',
      'Não sei se eu daria conta',
      'Não tenho paciência de organizar tudo'
    ])
    .setRequired(true);

  // 5
  form.addMultipleChoiceItem()
    .setTitle('Como você tocaria isso hoje?')
    .setChoiceValues([
      'Não faço ideia',
      'Uma planilha minha',
      'Perguntaria pra quem já fez',
      'Contrataria uma agência',
      'Usaria o ChatGPT',
      'Outro'
    ])
    .setRequired(true);

  // 6
  form.addMultipleChoiceItem()
    .setTitle('Você conhece alguém que estudou fora e poderia te orientar?')
    .setChoiceValues([
      'Sim, alguém próximo',
      'Sim, mas distante',
      'Não'
    ])
    .setRequired(true);

  // 7
  form.addMultipleChoiceItem()
    .setTitle('Você sabe quanto custa uma consultoria de intercâmbio?')
    .setChoiceValues([
      'Não faço ideia',
      'Menos de R$ 5 mil',
      'Entre R$ 5 e 20 mil',
      'R$ 20 mil ou mais',
      'Sei que é caro, mas não o valor'
    ])
    .setRequired(true);

  // 8
  form.addMultipleChoiceItem()
    .setTitle('Mesmo podendo pagar tudo, você buscaria bolsa?')
    .setChoiceValues([
      'Com certeza, pelo mérito e pra abater o custo',
      'Talvez',
      'Não me importaria'
    ])
    .setRequired(true);

  // 9
  form.addScaleItem()
    .setTitle('Um app que te dá um diagnóstico, recomenda faculdades e diz o próximo passo, tudo num lugar. O quanto ajudaria?')
    .setBounds(1, 5)
    .setLabels('não ajudaria', 'ajudaria muito')
    .setRequired(true);

  // 10
  form.addMultipleChoiceItem()
    .setTitle('Quanto você (ou sua família) pagaria por isso?')
    .setChoiceValues([
      'Só usaria de graça',
      'Até R$ 20/mês',
      'R$ 20 a 50/mês',
      'R$ 50 a 150/mês',
      'Um valor único de algumas centenas',
      'Depende do resultado'
    ])
    .setRequired(true);

  // 11
  form.addMultipleChoiceItem()
    .setTitle('Em que ano da escola você está?')
    .setChoiceValues([
      '1º ano do EM',
      '2º ano',
      '3º ano',
      'Já terminei',
      'Outro'
    ])
    .setRequired(true);

  // 12
  form.addMultipleChoiceItem()
    .setTitle('Seu inglês hoje?')
    .setChoiceValues([
      'Básico',
      'Intermediário',
      'Avançado',
      'Fluente'
    ])
    .setRequired(true);

  // 13
  form.addTextItem()
    .setTitle('(Opcional) Quer testar o Abroad antes de todo mundo? Deixa seu email')
    .setRequired(false);

  Logger.log('Formulário criado com sucesso.');
  Logger.log('Link de EDIÇÃO (só pra vocês, o time): ' + form.getEditUrl());
  Logger.log('Link PÚBLICO (esse vai no botão da LP / bio do Instagram): ' + form.getPublishedUrl());
}
