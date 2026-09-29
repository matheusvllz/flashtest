# Voz e tom

> Para quem é: quem escreve ou revisa qualquer texto que o aluno lê. Entrada: [../COPY.md](../COPY.md). Estratégia (para quem falamos): [01-estrategia.md](01-estrategia.md). Padrões por componente: [03-ux-writing.md](03-ux-writing.md).
>
> **Norma de origem: [`20` §7.1](../20-plano-evolucao-aprendizagem.md).** Este arquivo a incorpora e a estende, sem contradizer. A tabela da seção 3.1 é citação literal. Onde este arquivo estender o `20`, está marcado **(estende o `20`)**. Se algum ponto parecer contradizer o `20` §7.1, o `20` vence.
>
> Este documento segue o que prescreve: os exemplos "NÃO" são os únicos lugares onde os padrões proibidos aparecem.

## 1. Voz

**Colega de estudo atento e direto, que entende a dificuldade sem dramatizar.** Não é professor dando sermão, coach nem adolescente performático (`20` §7.1). A voz é uma só; o tom muda com o contexto (seção 2).

Cinco atributos. Cada um tem significado, exemplo que passa, exemplo que não passa e limite. Os exemplos "SIM" vêm de texto já aprovado no [`21`](../21-brand-voice-e-inventario-copy.md) §2 sempre que existe.

| Atributo | Significado | SIM | NÃO | Limite |
|---|---|---|---|---|
| **Direta** | Diz o que é, em palavra comum | "Conclua o capítulo anterior" (`COPY.trilha.capituloBloqueado`) · "Resposta registrada." | "Parabéns pela excelente resposta!" | Direta não vira ríspida. Num erro, a frase diz o que mudar, sem seca |
| **Próxima** | Fala como colega, com "você", sem hierarquia | "Vamos de onde você parou?" (`COPY.jornada.motivos.retomar`) | "Prezado estudante" · "MANDOU DEMAISSS 🔥🔥🔥" | Sem gíria forçada, sem imitar adolescente, sem tom de coach |
| **Calma** | Entende a dificuldade sem dramatizar | "Essa travou duas vezes. Vamos por partes, com calma." (`motivos.reforco-erros`) | "Não desista dos seus sonhos!" | Não minimiza ("é fácil") nem infla ("isso é crucial para a sua aprovação") |
| **Honesta** | Só afirma o que o dado mostra | "Isso é um ponto de partida, e ele fica mais preciso conforme você estuda." (`COPY.nivelamento.resultadoCorpo`) | "Você domina porcentagem!" depois de uma resposta certa | Número só quando vem do estado do aluno. Nunca inventar |
| **Leve** | Humor raro, sobre a Foca ou a situação | "Feito. Eu volto pra minha pedra." (fala de meta, no fim do momento) | Piada sobre o erro, a capacidade ou a ausência do aluno | No máximo uma vez por sessão. Nunca em erro técnico, confirmação, explicação, frustração ou retorno |

## 2. Matriz de tom

A voz permanece reconhecível. O tom muda conforme o contexto. "Texto de hoje" cita a chave real quando existe (28/09/2026; o `36` está acrescentando chaves). Onde a linha diz **auditar**, o texto atual tem resíduo do arquétipo antigo e entra na auditoria (`docs/copy/auditoria-*.md`), não é corrigido por este documento.

| Contexto | Tom | Pode | Não pode | Direção | Texto de hoje |
|---|---|---|---|---|---|
| Acerto | Curto, confirma | 2 a 7 palavras; dado específico se houver | Exagero; minimizar o acerto | "Isso. Resposta certa." · "Boa. É por aí." | `voz.acertou` (**auditar**: "Tá vendo? Não era tão difícil.", "Boa. Não se acostuma.") |
| Erro | Calmo, aponta o ponto | Dizer o que muda na resposta | Julgar; ironizar o erro | "Vamos por partes." · "O detalhe está aqui." | `voz.errou` (**auditar**: "Essa aí pega muita gente. Inclusive você, agora.") |
| Erro repetido na mesma habilidade | Concreto, oferece ajuda | Nomear o passo; oferecer "Explicar melhor" | "De novo?"; abrir o tutor sozinho (proibido no `20`) | "Essa parte ainda está pegando. Quer ver outro exemplo?" | `COPY.jornada.motivos.reforco-erros` |
| Questão difícil ou desafio | Honesto, sem susto | Avisar que é mais difícil | "Só os melhores acertam" | "Esta é mais difícil que as anteriores." | `COPY.licao.roles.desafio` ("Desafio"); `motivos.desafio` ("Topa uma mais difícil?") |
| "Não sei" | Neutro, segue adiante | Mostrar o caminho | Consolar demais; tratar como erro | "Sem problema. Olha o caminho:" | `voz.naosei` |
| Conclusão de lição | Resume o que aprendeu | Um fato do que foi feito | Festa genérica | "Você aprendeu: …" | `COPY.licao.voceAprendeu` |
| Fim de aula (fala da Foca) | Curto, sem julgar o desempenho | Reconhecer que o aluno apareceu | "Placar feio"; comparar com o dia anterior | "Fechou por hoje." | `voz.fimbom` e `voz.fimruim` (**auditar**: "Foi mal hoje.", "Placar feio.") |
| Streak: dia novo e marco | Discreto; o marco pode ter uma linha editorial | O número real | Culpa; ameaça de perda; "não esperava" | "7 dias seguidos." | `voz.marco` (**auditar**: "30 dias. Sinceramente, não esperava.") |
| Retorno depois de ausência | Acolhedor, sem citar a ausência | Ir direto ao próximo passo | Contar dias perdidos; "sentimos sua falta"; "sumiu" | "Vamos de onde você parou?" | `voz.retorno`, `motivos.retomar` (revisar `retorno[0]`: "Desfocou uns dias") |
| Nivelamento, durante | Neutro, instrução | Explicar o "Não sei" | Dar dica; pressionar | Texto literal já aprovado | `COPY.nivelamento.duranteHint` |
| Nivelamento, resultado | Descritivo e provisório | Faixa por área; "ponto de partida" | Nota, porcentagem, "nível N", ranking (`36` RP-6) | Texto literal já aprovado | `COPY.nivelamento.resultadoTitulo` e `resultadoCorpo`. **DEPENDÊNCIA DO PLANO PRINCIPAL** (`36` T-06.1 refaz a tela) |
| Área sem medida | Factual, sem culpa | Dizer por que não foi medida | Sugerir que o aluno falhou | Texto literal já aprovado | `COPY.nivelamento.areaNaoMedida(área)` |
| Carregando | Informativo, curto | Dizer o que está acontecendo | "Aguarde…" sem contexto; humor | "Separando suas questões…" | `COPY.jornada.carregando` (`36` RU-2) |
| Falha de rede | Calmo, com ação | Causa provável mais ação | "Ops!"; culpar o aluno | "Não deu pra carregar agora." | `COPY.jornada.erroPacoteTitulo` e `erroPacoteCorpo` (`36` RU-3); `COPY.tutor.falhaResposta` |
| Erro técnico ou de dados | Sério e explícito | Dizer o que se perde e o que fazer | Humor; eufemismo | Texto literal do plano técnico | `36` RU-4, RU-5, RU-6 (`persistência`; **DEPENDÊNCIA DO PLANO PRINCIPAL**) |
| Confirmação (sair, apagar) | Neutro; repete a consequência | Botão que nomeia a ação | "Sim" e "Não"; "OK" | "Sair da lição?" com "Sair mesmo assim" e "Continuar estudando" | `COPY.licao.sairTitulo`, `sairMesmo`, `sairFicar` |
| Bloqueado | Informativo, sem punição | Dizer o que libera | "Você ainda não pode" | "Conclua o capítulo anterior" | `COPY.trilha.capituloBloqueado` |
| Desbloqueado | Discreto, uma linha | Dizer o que abriu | Fogos em tudo | "A revisão do capítulo está aberta." | `COPY.trilha.revisaoAberta` |
| Onboarding | Direto, pouco texto | Explicar por que pede cada dado | Promessa de resultado | "Quer começar no seu nível?" | `COPY.onboarding.ofertaTitulo` e demais |
| Revisão | Neutro e útil | Dizer por que voltou | "Você esqueceu" | Frase de motivo do planner | `COPY.jornada.motivos.revisao-devida` (**auditar**: cita "Porcentagem" fixo no texto) |
| Foca IA | Ver [04-foca-ia.md](04-foca-ia.md) | — | — | — | `src/lib/tutor-prompt.ts` |
| Marketing | Mais energia, mesma honestidade | Benefício concreto; verbo de ação | Promessa que o produto não demonstra; prova inventada | Ver [06-marketing.md](06-marketing.md) | `src/lib/brand.ts` (**do plano técnico `36` T-08.7**) |

## 3. Regras de humor, emoji, exclamação, tamanho e registro

### 3.1 Citação literal do `20` §7.1

| Aspecto | Regra |
|---|---|
| Vocabulário | Palavras comuns, verbos concretos, termos técnicos explicados quando necessários |
| Informalidade | "Você", "vamos", frases naturais; sem gíria forçada |
| Humor | No máximo uma ocorrência por sessão; sobre a mascote/situação, nunca capacidade do aluno |
| Emoji | Não usar em controles, erros, explicações ou alertas; excepcional em celebração editorial |
| Exclamações | Sem sequência de exclamações; celebrar não exige exclamar |
| Correção | Dizer o que muda na resposta, não julgar o aluno |
| Acerto | Confirmar de modo curto; valorizar progresso específico quando houver dado |
| Retorno | Convidar a retomar sem culpa, ameaça ou cobrança pela ausência |
| Tutor | Resposta inicial de até quatro frases; detalhar se pedido; sem piada obrigatória |

**Tamanhos-alvo (`20` §7.1):** botão 1 a 4 palavras · feedback 2 a 7 · fala decorativa até 14 · explicação curta 25 a 55 · card de ensino 15 a 35. São diretrizes de edição, nunca truncamento de conteúdo pedagógico.

### 3.2 Extensões deste guia (estendem o `20`)

1. **Humor nunca aparece em:** erro técnico, confirmação destrutiva, explicação de conteúdo, resposta a aluno frustrado, retorno depois de ausência.
2. **"Celebração editorial"**, o único lugar onde o emoji é excepcional, tem definição fechada: fim de capítulo e marco de streak. Nada além disso. Mesmo ali, no máximo um, e a frase tem que funcionar sem ele.
3. **O humor tem um assunto só:** a Foca ser um bicho que vive numa pedra. Piada sobre o aluno, a prova ou o estudo fica de fora.
4. **Número só de estado.** Se o texto tem número ("4 das últimas 5"), ele vem do estado do aluno por função de template, nunca digitado no texto (`COPY.jornada` já faz assim).
5. **Um único registro por flow.** Um fluxo não alterna "Continuar" e "Próximo", nem "Tente" e "Tenta".

### 3.3 Registro gramatical

- **Você**, sempre. Nada de "o usuário", "o aluno" ou "prezado".
- **Botão:** infinitivo, começando pelo verbo, maiúscula só na primeira palavra: "Tentar de novo", "Fazer a revisão", "Sair mesmo assim".
- **Título e rótulo:** maiúscula só na primeira palavra.
- **Imperativo em frase de corpo: informal (D-2, decidida em 28/09/2026 por delegação do usuário).** Usar a forma que o aluno diria: "Tenta de novo", "Confere a internet", "Olha o caminho", "Me pergunta". Motivo: o código já é majoritariamente informal (`COPY.trilha.erroCorpo`, `COPY.jornada.erroPacoteCorpo` do `36` RU-3, "Olha o caminho", "Me pergunta"), e "Tente" e "Confira" soam como caixa de erro para quem tem 16 a 19 anos. **Efeito na copy atual, para a migração:** `COPY.tutor.falhaResposta` ("Tente de novo") passa a "Tenta de novo" e `voz.naosei` ("Veja como resolve") passa a "Olha como resolve". O exemplo literal "Tente de novo." do `20` §7.1 é exemplo de direção, não regra de registro; esta decisão o supera nesse ponto. Botões continuam no infinitivo ("Tentar de novo").

### 3.4 Glossário de voz

Palavras e construções que o Foca evita, com o substituto. O glossário de **produto** (nomes de coisas) está em [03-ux-writing.md](03-ux-writing.md) §3.

| Evitar | Usar |
|---|---|
| "domina", "dominado", "você domina" | "acertou N de M", faixa ("Base firme"), ou o fato |
| "jornada" em texto para o aluno | "trilha", "hoje", ou o nome da coisa |
| "incrível", "sensacional", "excelente" | o fato que justifica o elogio |
| "desbloqueie seu potencial" | cortar |
| "estamos aqui por você" | cortar |
| "sentimos sua falta", "você sumiu" | ir direto ao próximo passo |
| "conquista" para tarefa comum | "concluída", "feita" |

## 4. Padrões de texto artificial (pt-BR)

> **Checklist editorial, não detector.** O `20` §7.1 é explícito: nenhuma lista de palavras prova autoria por IA, e um travessão, uma frase correta ou um emoji isolados não autorizam concluir nada (Reinhart et al., *Linguistic variation and large language models*). O problema é editorial: texto genérico, entusiasmo constante, repetição e explicação que não ajuda. Usar os padrões abaixo para achar esses defeitos, e agir quando **vários** aparecem juntos ou quando um deles esconde falta de informação.
>
> A copy aprovada do `21` §2 é a "amostra do autor": ela usa travessão em alguns textos, e isso fica. O problema é o travessão como conector de toda frase, não o sinal.

| Padrão | Exemplo que não passa | Por que pesa | Direção |
|---|---|---|---|
| **"Não é X. É Y."** e "Mais do que X, Y" | "Não é mais aula. É o hábito que te aprova." | Encena importância em vez de dar um fato; aparece na frase de posicionamento atual | Dizer Y direto e com um fato |
| **Motivação genérica repetida** | "Você está no caminho certo." "Cada passo conta." "Continue assim!" "Acredite em você." | Serve a qualquer aluno em qualquer momento, então não diz nada | Valorizar algo específico ou não dizer nada |
| **Palavra-tema em copy de produto** | "Sua jornada de transformação para desbloquear seu potencial" | Vocabulário de anúncio que não descreve nada | O nome da coisa: trilha, lição, revisão |
| **Trincas por reflexo** | "Rápido, fácil e eficiente." | Três itens porque soa completo, não porque há três | Dois itens, ou um, ou o fato |
| **Frase de efeito no fim do bloco** | "E isso muda tudo." | Repete o ponto com peso de fechamento | Terminar quando a informação acaba |
| **Adjetivo de elogio sem fato** | "Excelente resposta!" | Elogio que não informa | "Resposta certa." ou o dado |
| **Anúncio antes do conteúdo** | "Vamos lá:" "Olha só que interessante:" | Gasta a atenção do aluno antes do ponto | Começar pelo ponto |
| **Agência falsa** | "A decisão emerge." "Os dados dizem que você travou." | Atribui a um objeto uma ação de pessoa e esconde quem decide | Dizer quem faz: "O Foca escolheu essa atividade porque…" |
| **Narrador de longe** | "Muita gente trava aqui." (como abertura de tudo) | Fala sobre o aluno em vez de com ele | "Essa parte pegou. Vamos por partes." |
| **Travessão em série** | Uma frase com dois travessões abrindo e fechando aparte, em todo parágrafo | Deixa de escolher a relação entre as ideias | Ponto, vírgula ou dois-pontos. Um travessão ocasional é normal |
| **Título que repete a primeira frase** | "Progresso" seguido de "Seu progresso é…" | Não acrescenta | Um dos dois |
| **CTA perfeito demais** | "Comece sua transformação hoje mesmo!" | Promete mais do que o botão faz | Verbo mais objeto: "Fazer o nivelamento" |
| **Negrito decorativo** (docs e marketing) | Todo item de lista com rótulo em negrito | Ênfase sem hierarquia | Negrito só onde o leitor precisa achar algo |

## 5. Teste de voz

Seis perguntas, na ordem. Uma resposta ruim já barra a frase.

1. **Está claro sem contexto?** Quem lê só essa frase entende o que aconteceu ou o que fazer?
2. **Diz o que fazer ou o que aconteceu?** Ou só enfeita?
3. **Cabe no tamanho-alvo?** (seção 3.1) E cabe em 320 px de largura?
4. **Afirma algo que o dado não mostra?** Domínio, prazo, resultado, número.
5. **Julga a pessoa, cobra ausência ou minimiza o erro?**
6. **Soaria natural dito por um colega de turma atento?**

Para as **falas da Foca**, vale também o teste da própria Foca em [04-foca-ia.md](04-foca-ia.md) §2. O teste da §8 do `15` está superado onde pede "cobrança" e "sarcasmo".
