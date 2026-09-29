# Estratégia de copy: persona, estados, JTBD, mecanismo e posicionamento

> Para quem é: quem vai escrever ou revisar texto do Foca e precisa saber **para quem** fala, **o que o produto realmente faz** e **o que não pode prometer**. Entrada do sistema: [../COPY.md](../COPY.md). Origem: [../38-plano-sistema-copy-e-skills.md](../38-plano-sistema-copy-e-skills.md).
>
> Este arquivo **resume e organiza**; não substitui as fontes. Onde divergir do `14`, do `08` ou do código, a fonte vence e este arquivo está desatualizado. Onde a fonte não existe, a linha está marcada **[lacuna]**. Nada aqui foi preenchido por inferência.
>
> Estado do produto conferido em 28/09/2026 sobre `76a7b70`, com o plano técnico `36` em execução. O que o `36` ainda vai corrigir está marcado **DEPENDÊNCIA DO PLANO PRINCIPAL**.

## 1. Persona

Uma persona só, **João** ([14](../14-persona-joao.md)). Ela vale como critério de decisão: toda frase passa pelo teste "isso resolve o João, ou um estudante genérico?" (`14` §0).

| Campo | Resumo | Fonte |
|---|---|---|
| Idade e situação | 16 a 19 anos, ensino médio ou pré-vestibular | `14` §1 |
| Objetivo declarado | Passar no vestibular ou ir bem no ENEM para um curso e uma faculdade específicos | `14` §1 |
| Objetivo real, não declarado | Parar de se sentir atrasado | `14` §1 |
| Provas | ENEM, e a prova que o aluno escolher no onboarding (`quiz.tsx`: passos `exam`, `target`, `course`) | `14` §1; código |
| Tempo | Fragmentado: intervalo de aula, ônibus, fila, antes de dormir. Blocos longos são raros | `14` §4 |
| Atenção | Curta e disputada. O app compete com o feed, não com o caderno | `14` §4 |
| Dor central | O custo de começar é alto demais, e ele não sabe onde está fraco, então toda sessão abre com uma decisão paralisante ("por onde eu começo?") | `14` §3 |
| O que a dor **não** é | Falta de conteúdo, de método, de capacidade ou de ferramenta | `14` §3 |
| Procrastinação e culpa | Recomeça toda segunda; quarta já não abre; a culpa não o faz voltar, faz evitar | `14` §2, §4 |
| Excesso de conteúdo | Tem YouTube, apostila, o app do MEC. Adicionar conteúdo não move nada | `14` §1, §3 |
| Expectativa em relação ao app | Caber em pouco tempo, contar de verdade para o vestibular, mostrar progresso visível | `14` §5 |
| Barreiras de retenção | Cada recomeço abandonado encarece o próximo; três apps de estudo já baixados e largados em dois dias | `14` §2, §3 |
| Dinheiro | Pouco. O concorrente que ele conhece é gratuito | `14` §1, §4 |

**Cortado do resumo** por não orientar copy: objeções da banca, modelo de negócio e riscos de pitch (`14` §9–§10).

**[lacuna] Nenhuma entrevista estruturada com aluno real foi feita** (`PRODUCT.md` → Evidence on Hand; `14` §10). A persona é uma hipótese de trabalho bem fundamentada, não um dado validado. Não escrever "os alunos dizem que…" nem citar depoimento. Não atribuir ao João gosto, gíria ou hábito que o `14` não registra.

## 2. Estados do aluno

O tom muda com o estado; a voz não. Só entra estado que o app consegue identificar com dado real, ou que o tutor identifica pela conversa. A coluna "sinal" cita o campo do código conferido em 28/09/2026 (o nome pode mudar com o `36`).

| Estado | Sinal real | A copy faz | A copy nunca faz |
|---|---|---|---|
| Começando | `prefs.onboarded === false`; `progress.lastStudyDate === null` (primeira atividade de sempre) | Pede o mínimo, explica **por que** pede cada dado, um CTA por tela | Tutorial longo; promessa de resultado |
| Sem direção | `learning.placement === null` ou `placement.status !== "concluido"`; entradas do `skillModel` com `source` só de `prior-*` | Oferece o nivelamento como **opcional**; o app escolhe o próximo passo | Pressionar a fazer o nivelamento; chamar de "obrigatório" |
| Em ritmo | `progress.streak` ≥ 2; meta do dia batida | Confirma curto, com o número real | Festa a cada ação; pressão para "não quebrar" |
| Voltando depois de ausência | `diasDesde(progress.lastStudyDate)` ≥ 2; `streakFreezes` consumido | Vai direto ao próximo passo; se o congelamento cobriu o dia, dizer só o fato | Culpa, contagem de dias perdidos, "sentimos sua falta", "você sumiu" |
| Travado num tópico | Motivos `reforco-erros`, `reforco-nao-sei` ou `reforco-ajuda` no plano (`COPY.jornada.motivos`); erros em `learning.recentAttempts` na mesma habilidade | Nomeia o ponto concreto e oferece "Explicar melhor" como opção | "Você é ruim em X"; abrir o tutor sozinho (proibido pelo `20`) |
| Perto da prova | `prefs.examTargets[].examDate` preenchida (o onboarding tem o passo "Data da prova", opcional) | Prioriza o que falta, com tom calmo e factual | Contagem regressiva ansiosa; "corre que dá tempo" |
| Frustrado | **Só o tutor detecta**, pela conversa. **[sem sinal no código — só vale para o tutor]** | Direto e acolhedor, humor zero (`15` §6) | Piada; "calma"; minimizar |
| Forte ou fraco num conteúdo | Faixas por área e habilidade (Base em construção, No caminho, Base firme) a partir do `skillModel` | Descreve evidência ("acertou 4 das últimas 5") | "Você domina"; nota; "nível N"; porcentagem no diagnóstico (`36` RP-6) |
| Perto de concluir capítulo ou seção | Capítulo concluído; nó de revisão liberado (`COPY.trilha.capituloConcluido`, `revisaoAberta`) | Uma linha do que foi feito | Efeito de vitória maior que a tarefa |

## 3. Jobs to be done

O principal é o do `14` §5, mantido literal. Os demais derivam de funcionalidades que existem.

| Tipo | Job | O que atende (fonte) |
|---|---|---|
| Funcional (principal) | "Quando eu tenho 2 minutos livres e bate a sensação de que estou ficando pra trás, eu quero fazer alguma coisa que conte de verdade pro meu vestibular, pra eu sentir que hoje eu não perdi o dia." | Jornada e trilha com um CTA "Continuar" (`25`, `30` §14) |
| Funcional | Quando abro o app sem saber o que estudar, quero que ele diga o próximo passo e por quê, para não gastar energia planejando | Planner com `ReasonCode`, frase de motivo no card (`COPY.jornada.motivos`) |
| Funcional | Quando erro uma questão, quero entender onde errei sem me sentir burro, para não repetir | Feedback imutável; "Ver resolução", "Explicar melhor", tutor sob demanda (`20`; `21` §2) |
| Funcional | Quando não sei a resposta, quero dizer isso em vez de chutar, para o app ajustar o que me mostra | Botão "Não sei" (`30` §16.1; `COPY.questao.naoSei`) |
| Emocional | Quando volto depois de dias parado, quero recomeçar sem encarar o quanto atrasei | Retorno sem cobrança (`15` §3.2); congelamento de streak (`16` §6; `store.ts`, `streakFreezes`) |
| Emocional | Quando termino, quero ver que avancei de verdade, não um número inventado | Faixas por habilidade; progresso por matéria (`/progress`); meta do dia |
| Social | **[lacuna]** O ranking é mock e a tela diz isso. Não há job social validado. Não inventar | `ranking.tsx` (mock) |

## 4. Problema, mecanismo e resultado

Só entra mecanismo que **existe no código** ou tem spec aprovada. A coluna "Estado" diz o que foi conferido e o que ainda pende.

| Problema do João | Mecanismo do Foca | Resultado que a copy pode prometer | Estado (28/09/2026) |
|---|---|---|---|
| Não sabe por onde começar | Modelo por habilidade + planner que escolhe as próximas atividades e diz o motivo; nivelamento adaptativo opcional | "O próximo passo já vem escolhido, e você vê por quê." | Planner e motivos implementados (`30` §14, `32` Fase 12, flag `jornadaAdaptativa` ligada). **DEPENDÊNCIA DO PLANO PRINCIPAL:** o `36` T-03.* corrige o nivelamento, que hoje não aplica priors nem muda a fila (achado C1/B3). **Não prometer "o nivelamento muda a sua trilha"** antes disso. O CTA "Continuar" de prática/revisão/desafio também tem bug de retorno à Home (achado C2/B2, `36` T-02.*) |
| Estudar parece grande demais para o tempo que ele tem | Atividades curtas (lição de 4 a 8 questões; atividade da jornada) e meta diária pequena | "Dá para fazer uma atividade no intervalo." Sem número de segundos ou minutos | Implementado. **A duração real nunca foi medida** (`26` §8: sem teste em dispositivo físico nem observação de aluno). `COPY.jornada.minutos(n)` mostra "~N min" a partir de estimativa do plano, não de medição |
| Não sabe onde está fraco | Faixas por área e habilidade calculadas das respostas | "Você vê onde a base já está firme e onde ainda não." | Faixas implementadas. O `/aha` do onboarding ainda usa **heurística sobre o perfil declarado** (`gaps.ts`), não questão respondida. **Não prometer** "a IA descobriu suas lacunas" no onboarding |
| Esquece o que estudou | Revisão espaçada por habilidade (`learning.reviewSchedule`, atualizado em `recordLearningAttempt`) e revisão de capítulo | "O que você estudou volta na hora de revisar." | Implementado (`store.ts`; motivos `revisao-devida` e `revisao-atrasada`) |
| Erra e desanima | Feedback que explica, "Não sei", explicação em camadas, tutor sob demanda | "Errar mostra o que revisar." | Implementado (`32` Fases 6 e 7). O tutor nunca abre sozinho |
| Quebra a sequência e larga | Streak com congelamento automático (até 2, 1 a cada 7 dias de atividade); retorno sem cobrança | "Parou uns dias? Continua de onde estava." | Implementado (`store.ts`, `streakFreezes`, `activityDaysSinceFreezeAward`) |
| Tem conteúdo de sobra e nenhuma ordem | Currículo em matéria, seção, capítulo e lição, mais a jornada misturada | "Uma ordem para estudar, em vez de mais material." | Implementado (`25`, `30` §14) |

**Contra o MEC Enem:** ele tem conteúdo completo e correção de redação, de graça. O Foca não compete em conteúdo (`08` §0, §10). O que ele oferece é a ordem, o acompanhamento do que o aluno acerta e erra e o recomeço barato. **Contra o ChatGPT direto:** o Foca tem currículo, estado do aluno e uma decisão sobre o que estudar a seguir (`08` §10).

## 5. Proposta de valor e posicionamento

### 5.1 Estrutura

| Campo | Texto | Fonte |
|---|---|---|
| Público | Aluno do ensino médio ou pré-vestibular que se prepara para o ENEM e estuda no celular, em tempo picado | `14` §1 |
| Problema | O custo de começar e não saber onde está fraco. Não é falta de conteúdo | `14` §3; `08` §0 |
| Promessa | Um próximo passo claro, que cabe no intervalo e conta para a prova | `14` §5 |
| Mecanismo | Seção 4, só o que existe | `30`, `32` |
| Benefício | Estudar um pouco por dia sem precisar planejar, vendo o que avançou | `14` §6 |
| Diferença | O MEC Enem entrega conteúdo. O Foca escolhe a ordem, acompanha o que o aluno acerta e erra e torna o recomeço barato | `08` §10 |

"Duolingo para o ENEM" pode servir como explicação **interna** da mecânica. **Não usar em copy**: substitui a identidade do produto pela de outro.

### 5.2 A frase atual e seus problemas

Frase vigente (`08` §1, repetida em `PRODUCT.md`): *"Não é mais aula. É o hábito que te aprova. 60 segundos por dia."*

| # | Problema |
|---|---|
| P5 | **"60 segundos" promete uma duração que o produto não entrega.** A unidade real é uma lição de 4 a 8 questões ou uma atividade da jornada. O `36` RU-20 já tira "60 segundos" da tagline |
| P6 | **"O hábito que te aprova" promete aprovação.** Não há dado de retenção nem aluno aprovado (`PRODUCT.md` → Evidence on Hand) |
| P7 | **A construção "Não é X. É Y." é um dos padrões de texto artificial** que o guia de voz lista (`02-voz-e-tom.md` §4) |

### 5.3 Diagnóstico com a Ogilvy (T-C3.3, 28/09/2026)

Perguntas 1 a 4 e 6 da `ogilvy-copywriting`, respondidas só com o que o Foca comprova.

1. **Posicionamento.** Um app de preparação para o ENEM que escolhe a próxima atividade e diz por quê, feito para quem estuda em tempo picado e trava na hora de decidir por onde começar. Segmentação por mentalidade, não por idade: quem já tentou cronograma e largou, quem rejeita videoaula de 50 minutos, quer parar de se sentir atrasado.
2. **Promessa única.** "O próximo passo já está escolhido." Benefício, não recurso; o produto entrega hoje (planner com motivo). Aprovação, nota e constância **não** entram: nenhum dado sustenta.
3. **Big idea.** Recomeçar custa quase nada, porque a decisão já vem tomada. Simples, e é a tese do `14` §6.
4. **Leitor.** João (seção 1). Inteligente, pouco tempo, cético com "mais um app".
6. **Prova.** A Ogilvy manda carregar de fatos e cita depoimento como recurso forte. No Foca vale só o que existe: o **próprio produto em ação** (a frase de motivo do card, as faixas por habilidade), e os fatos verificáveis do que ele faz. **Depoimento, número de alunos e taxa de retenção não existem** e não podem ser inventados. Essa é uma regra do Foca que vale sobre a skill (`SKILLS.md` §R).

### 5.4 Opções de frase de posicionamento — **D-1 decidida: frase atual mantida (28/09/2026)**

**DECIDIDO em 28/09/2026: o usuário manteve a frase atual por enquanto.** As três opções abaixo ficam registradas como alternativas, sem aplicação; a frase atual continua valendo e os problemas P5 a P7 (§5.2) seguem abertos. O usuário pode reabrir a decisão escolhendo uma delas. Cada opção passou por: não promete aprovação, retenção ou duração; não usa "Não é X. É Y."; só afirma o que a seção 4 comprova.

| # | Opção | Por que serve | Ressalva |
|---|---|---|---|
| 1 | "Estudo curto, todo dia, na ordem que o seu progresso pede." | Alinha com a tagline do `36` RU-20 ("Estudo curto, todo dia."); fala do mecanismo real | "Todo dia" descreve o uso pretendido, não um resultado garantido. Manter como convite, não como promessa |
| 2 | "O Foca escolhe o próximo passo. Você só precisa de um intervalo." | Promessa única, direta, com o benefício de esforço mínimo | "Escolhe o próximo passo" só é inteiramente verdade depois do `36` T-02 (bug do CTA) e T-03 (nivelamento). **DEPENDÊNCIA DO PLANO PRINCIPAL** para uso em marketing |
| 3 | "Para quem estuda no intervalo: o Foca escolhe a próxima atividade e mostra por quê." | Nomeia o público (regra de título da Ogilvy), traz um fato que dá para mostrar na tela e não faz promessa de resultado | Mais longa; adequada a título de landing ou descrição de loja, não a tagline |

**Descartada:** "Menos tempo decidindo o que estudar. Mais dias estudando." A segunda metade é uma promessa de retenção que ninguém mediu.

**Passadas "Prove It" e "Especificidade" do `copy-editing`** (Corey Haines 2.0.0, lido do cache, 28/09/2026), sobre as três opções:

- *Prove It:* cada afirmação tem lastro na seção 4 ou está marcada. Opção 1 ("na ordem que o seu progresso pede") apoia-se no planner e no `skillModel`; "todo dia" fica como convite. Opção 2 só entra em marketing depois do `36` T-02/T-03. Opção 3 ("mostra por quê") apoia-se em `COPY.jornada.motivos`, que existe.
- *Especificidade:* "curto" é vago, e a passada pede número. A única medida que o produto comprova é **"4 a 8 questões" por lição** (`25`). **Duração em minutos continua proibida** (nunca medida). Em descrição de loja ou landing, preferir "atividades de 4 a 8 questões" a "estudo curto" assim que a lição tiver esse formato em todas as matérias; conferir antes de publicar.

Ao decidir, o usuário atualiza `PRODUCT.md` → Positioning e `08` §1 (a atualização das duas fontes só depois do `36` T-10.3, DEP-1).

## 6. O que a copy nunca promete

Nada disso existe ou foi medido. Aparece aqui para ser **evitado**, e só aqui (a checagem automática do plano ignora esta seção).

- Aprovação, vaga, nota prevista ou "você vai passar".
- "Estude X% mais rápido", ganho de desempenho, ou qualquer número de resultado.
- "A IA que te conhece melhor que você" ou "descobre suas lacunas" no onboarding (a heurística do `/aha` não é isso).
- Número de alunos, depoimento, "aprovado", "milhares".
- Preço ou plano pago (`08` §11: nunca fechado).
- Duração em segundos ou minutos como fato (nunca medida).
- "O nivelamento muda a sua trilha" antes do `36` T-03.
- Ranking real ou comparação com outros alunos (o ranking é mock e a tela diz isso).
- Retenção: "você vai voltar amanhã", "crie o hábito em N dias".
