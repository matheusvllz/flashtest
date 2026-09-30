# UX writing, microcopy e glossário

> Para quem é: quem escreve ou revisa texto de interface (botão, erro, estado vazio, confirmação, rótulo, aria-label). Entrada: [../COPY.md](../COPY.md). Voz e tom: [02-voz-e-tom.md](02-voz-e-tom.md). Skill principal para este trabalho: `better-writing` ([SKILLS.md](../ai/SKILLS.md) §Q).
>
> Estado do código conferido em 28/09/2026, com o plano técnico `36` **em execução** e alterando `src/lib/copy.ts`. Chave citada aqui pode mudar ou ganhar irmãs. Conferir em `copy.ts` antes de copiar uma string.

## 1. Prioridades

1. **Clareza.** Quem lê entende sem contexto.
2. **Ação.** O texto diz o que fazer, ou o que aconteceu.
3. **Contexto.** Aparece perto de onde o problema ocorreu.
4. **Brevidade.** Tamanhos-alvo do `20` §7.1 ([02](02-voz-e-tom.md) §3.1).
5. **Personalidade.**

Personalidade que prejudica um dos quatro primeiros sai. A melhor mensagem de erro costuma ser o fluxo redesenhado para o erro não acontecer; se a mesma mensagem dispara para muita gente, o problema é de fluxo, não de redação.

## 2. Padrões por componente

Regras que o Foca adota da skill `better-writing`, em pt-BR: **verbo primeiro** no botão; confirmação **repete a consequência**; **um vocabulário por fluxo**; erro **diz como resolver**, junto de onde quebrou, sem "ops" e sem exclamação; estado vazio **orienta e aponta um próximo passo**; placeholder é exemplo, nunca rótulo; **nunca concatenar** frase em volta de variável (usar função de template com plural); uma regra de capitalização por tipo de elemento (maiúscula só na primeira palavra); link diz para onde vai.

A coluna "Canônico hoje" cita a chave de `COPY` quando existe e diz **"não existe"** quando o padrão ainda não tem string própria.

| Padrão | Regra e limite | Canônico hoje | Anti-padrão | Observação |
|---|---|---|---|---|
| **CTA principal** | Verbo + objeto; 1 a 4 palavras | `licao.comecar` "Começar" · `trilha.continuar` "Continuar" · `onboarding.ofertaCtaPrimario` "Fazer o nivelamento" | "Vamos lá!" · "Bora!!" · "OK" | Um CTA principal por tela |
| **CTA secundário** | Nomeia a alternativa, sem culpa | `onboarding.ofertaCtaSecundario` "Começar sem nivelamento" | "Não, obrigado" · "Prefiro não melhorar" | — |
| **Dispensar** | Curto e neutro | `checkpoint.agoraNao` e `nivelamento.cardTrilhaDispensar` "Agora não" | "Talvez depois" | Mesma palavra nos dois lugares: correto |
| **Voltar** | "Voltar" + destino | `jornada.voltarTrilha` "Voltar à trilha" · `trilha.irParaAtual` "Voltar para a lição atual" | "Voltar pra jornada" (`jornada.voltarJornada`) | Duas chaves para o mesmo destino, uma delas com "jornada" e "pra". Consolidar na migração |
| **Continuar** | Uma palavra, sempre "Continuar" | `feedback.continuar`, `licao.continuar`, `trilha.continuar`, `jornada.continuar` | Alternar com "Próximo" | Já consistente. Não introduzir "Próximo" |
| **Confirmar resposta** | Verbo da ação | `licao.verificar` "Verificar" | "Enviar resposta!" | — |
| **Confirmar saída ou ação destrutiva** | Título pergunta; botões repetem a consequência | `licao.sairTitulo` "Sair da lição?" · `sairMesmo` "Sair mesmo assim" · `sairFicar` "Continuar estudando" | "Sim" e "Não" · "OK" | Padrão a copiar. O corpo (`sairCorpo`) diz o que não se perde |
| **Cancelar** | Nomeia o que continua | `licao.sairFicar` "Continuar estudando" | "Cancelar" solto sobre ação de sair | — |
| **Tentar de novo** | Botão no infinitivo: "Tentar de novo" | `comum.tentarDeNovo` (do `36`, RU-3) · `trilha.tentarDeNovo` (mesmo texto, duplicada) | "Tentar novamente!" | Duas chaves com o mesmo texto: consolidar na migração |
| **Corpo do erro com ação** | Diz o que fazer; uma frase; imperativo **informal (D-2 decidida)** | `trilha.erroCorpo` "Tenta de novo. Seu progresso está salvo neste aparelho." · `jornada.erroPacoteCorpo` "Confere a internet e tenta de novo." · `tutor.falhaResposta` "Não consegui responder agora. Tente de novo." | "Ops! Algo deu errado." | Migrar `tutor.falhaResposta` para "Tenta de novo": ver [02](02-voz-e-tom.md) §3.3 |
| **Erro de rede** | Título curto, corpo com causa provável mais ação | `jornada.erroPacoteTitulo` "Não deu pra carregar agora." + `erroPacoteCorpo` | Culpar o aluno; inventar causa | Texto do `36` RU-3 |
| **Erro de campo** | Junto do campo; diz como corrigir | **Não existe** (o único campo de texto do quiz é o nome) | "Campo inválido" | Criar quando surgir campo com validação |
| **Erro de dados e persistência** | Sério; diz o que se perde e o que fazer | **Não existe ainda** (`36` RU-4, RU-5, RU-6, T-05.*) | Eufemismo; humor | **DEPENDÊNCIA DO PLANO PRINCIPAL** |
| **Aviso (warning)** | Uma linha; fato | `jornada.puladaSemItens` "Essa atividade ficou sem questões agora. Segui com a próxima." + `comum.fecharAviso` | Alarme; caixa alta | Texto do `36` RU-1 |
| **Carregando** | Diz o que acontece; termina com reticências de caractere único | `jornada.carregando` "Separando suas questões…" | "Aguarde…" · spinner sem texto | O `tutor.placeholder` usa três pontos (`...`) e as demais usam `…`. Uniformizar na migração |
| **Estado vazio** | Orienta e aponta um próximo passo | `trilha.tudoConcluido` + `trilha.praticar` · `jornada.semNada` | "Nada por aqui." | Padrão a copiar |
| **Bloqueado** | Diz o que libera, sem punição | `trilha.capituloBloqueado` "Conclua o capítulo anterior" · `estados.locked` "Bloqueada" | "Você ainda não pode" | — |
| **Desbloqueado** | Uma linha, fato | `trilha.revisaoAberta` "A revisão do capítulo está aberta." | Fogos | — |
| **Sucesso (resposta registrada)** | Neutro quando a resposta não é corrigida na hora | `licao.respostaRegistrada` "Resposta registrada." | "Mandou bem!" no nivelamento | Sem cor de certo ou errado no modo silencioso |
| **Lição concluída** | Resume o que foi feito | `licao.voceAprendeu` · `licao.concluir` "Concluir lição" · `licao.refazer` "Refazer lição" | "Parabéns, campeão!" | — |
| **Capítulo ou seção concluída** | Fato | `trilha.capituloConcluido` · `secaoConcluida` · `fechouLicoes(n)` | "Você é incrível" | `fechouLicoes(1)` produz "1 lições": falta plural. Ver abaixo |
| **Streak / sequência** | Número real, discreto | **Não existe chave.** `TrailHeader` monta "N dia(s)"; `aha.tsx` usa o rótulo "Sequência"; `voz.marco` tem as falas | "Não quebre sua sequência!" | Termo decidido (D-3): "sequência". Ver glossário |
| **Nivelamento: oferta** | Pergunta; explica o que é e que é opcional | `onboarding.ofertaTitulo` · `ofertaCorpo` · `ofertaCtaPrimario` · `ofertaCtaSecundario` · `ofertaRodape` | Obrigar; prometer resultado | `ofertaCorpo` cita "cerca de 10 minutos", **duração nunca medida** ([01](01-estrategia.md) §6). Vai para a auditoria |
| **Nivelamento: durante** | Instrução neutra | `nivelamento.duranteHint` | Dar dica; pressionar | — |
| **Nivelamento: resultado** | Descritivo, provisório, sem nota | `nivelamento.resultadoTitulo` · `resultadoCorpo` · faixas `faixaBaseConstrucao`, `faixaNoCaminho`, `faixaBaseFirme` | Nota, porcentagem, "nível N" | **DEPENDÊNCIA DO PLANO PRINCIPAL** (`36` T-06.1 refaz a tela) |
| **Diagnóstico e progresso** | Descreve evidência; usa faixa | `nivelamento.faixa*` · `trilha.metaHoje(feitas, meta)` "N/M hoje" | "Dominado", "Domínio" | `progress.tsx` e `SkillRow.tsx` ainda usam "Dominado" e "Domínio por habilidade" em literal JSX. Vai para a auditoria |
| **Motivo do plano** | Uma frase; fato do estado | `jornada.motivos.*` (14 chaves) | "Você precisa" | `motivos.revisao-devida` cita "Porcentagem" fixo no texto: só vale se a habilidade for essa. Auditoria |
| **aria-label de ícone** | Nome da ação, sem "botão" nem "ícone" | `tutor.abrirAriaLabel` · `fecharAriaLabel` · `enviarAriaLabel` · `questao.naoSeiAria` | "Botão de fechar" | Cuidado real: o Playwright casa nome acessível por **substring**. Um `aria-label` com "responder" colidiu com o botão "Responder" (`21` §2.4). Conferir colisão ao criar |
| **Contagem e plural** | Função de template com plural | `trilha.questoes(n)` · `trilha.fechouLicoes(n)` | Concatenar com `+`; `${n} questões` sem plural | As duas funções atuais não tratam n = 1 ("1 questões"). Auditoria |
| **Capitalização e separador** | Maiúscula só na primeira palavra; separador " · " | `trilha.capituloRotulo` "Seção 2 · Capítulo 3" | "Seção 2 — Capítulo 3" | — |
| **Placeholder** | Exemplo de formato, nunca o único rótulo | `tutor.placeholder` "Pergunta qualquer coisa..." | Placeholder como rótulo | — |
| **Sugestões do tutor** | Frases que o aluno diria | `tutor.sugestoesErro`, `sugestoesAjuda`, `sugestoesGeral` | Frases que o aluno não diria | Voz do aluno, primeira pessoa |

### 2.1 Revisão dos exemplos com `better-writing` (T-C5.3, 28/09/2026)

Revisão dos exemplos "Canônico hoje" e "Anti-padrão" da tabela acima, no formato do `review-output.md` da skill. **A voz de marca do Foca foi preservada** (princípio 1 da skill; `20` §7.1): "Não consegui responder agora" em primeira pessoa, "Segui com a próxima" e a linguagem informal ("pra", "Confere") não são achado, porque são voz intencional e clara. Nada foi alterado em `copy.ts` (este plano só documenta). Achados que dependem de mudar string vão para a auditoria e o plano de migração.

#### Vocabulário consistente
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `src/lib/copy.ts:110`, `:126` ("publicado") e `:181` (`semNada`, "disponível") | "…tudo o que está publicado" | "…tudo o que está disponível agora" | Dois estados vazios parecidos usam palavras diferentes. "Publicado" é termo de conteúdo interno, e o aluno não publica nada |
| MEDIUM | `:180` (`voltarJornada`) e `:192` (`voltarTrilha`) | "Voltar pra jornada" | "Voltar à trilha" (uma chave só) | Mesmo destino com dois nomes e "jornada" fora do glossário |
| LOW | `:224` × `:241`, `:242` | "Fazer o nivelamento" ao lado de "Fazer nivelamento" e "Refazer nivelamento" | Escolher uma forma para os três | Variação sem função. O texto de `:224` vem do `30` §12.2 (literal), então a escolha fica para o plano de migração |
| MEDIUM | `:29` (`abrirAriaLabel`) | "Abrir tutor de IA" | "Abrir a Foca" ou manter e decidir o termo | O nome visível é "Foca"; o aria-label diz "tutor de IA". Ver glossário |

#### Errar com instrução
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `:37`, `:128`, `:191` | "Tente de novo." · "Tenta de novo." · "Confere… e tenta de novo." | Informal nos três: "Tenta de novo." (D-2 decidida) | Mesma instrução em dois registros. Os três textos cumprem a regra de dizer o que fazer |

#### Plural e variável
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `:109`, `:114` | `${n} questões` → "1 questões"; `Você fechou ${n} lições.` → "1 lições" | Função com plural: "1 questão" e "2 questões"; "Você fechou 1 lição." | A skill manda template com plural. O caso n = 1 acontece na primeira lição |

#### Placeholders
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `:31` | "Pergunta qualquer coisa..." (três pontos) | Reticências de caractere único e, se couber, um exemplo de pergunta | Placeholder deve mostrar exemplo ou formato; as demais reticências do app usam `…` |

**Sem achado** (padrões que passam e entram como modelo): confirmação de saída (`sairTitulo`, `sairMesmo`, `sairFicar`), botões verbo-primeiro (`Começar`, `Verificar`, `Concluir lição`, `Refazer lição`), "Continuar" único nos quatro fluxos, estado vazio `tudoConcluido` com CTA "Praticar", erro de rede em `jornada.erroPacote*` (título mais ação), "Agora não" como dispensa neutra.

**Verificação.** Feita: leitura de cada chave citada contra `src/lib/copy.ts` (linhas acima) em 28/09/2026; comparação do vocabulário dos fluxos de lição, trilha, jornada, nivelamento e checkpoint; leitura dos templates de plural. **Não feita:** renderização das telas, quebra de linha em 320 px, leitor de tela, conferência de onde cada chave é usada. O `copy.ts` está sendo alterado pelo `36`, então os números de linha podem deslocar.

**Veredito: Needs changes.** Nenhum achado HIGH. Aplicação na migração de strings, depois do `36` Fase 10.

## 3. Glossário de produto

Cada termo tem um nome visível canônico, o que se evita, uma definição de uma linha e o **status**. Regras: **nunca renomear id no código** (`MicroLesson`, `ActivityKind`, `LessonStep`, chaves de `COPY`, rotas); só o rótulo visível muda. Termo novo entra aqui **antes** da string.

"Ocorrências" é a contagem aproximada de linhas com o termo em texto de interface (`routes`, `components`, `copy.ts`, `voz.ts`, `brand.ts`) em 28/09/2026. Inclui alguns literais que não chegam à tela.

| Termo visível | Evitar | Definição | Ocorrências | Status |
|---|---|---|---|---|
| **Matéria** | "disciplina", "área" para o mesmo conceito | Uma das 11 matérias do currículo | — | Consistente. "Área" é outra coisa: as áreas do ENEM no nivelamento |
| **Trilha** | "jornada" | O caminho de lições do aluno; nome da home | 52 | Consistente, salvo `jornada.voltarJornada` |
| **Seção** | — | Grupo de capítulos dentro da matéria | — | Consistente |
| **Capítulo** | — | Grupo de lições dentro da seção | — | Consistente |
| **Lição** | — | Uma unidade autoral, com passos e 4 a 8 questões | 17 | Consistente em `COPY.licao` |
| **Aula** | usar "lição" | (mesma coisa que lição, em outro texto) | 23 | **Inconsistente.** `trilha.kinds.aula` e `jornada.kinds.aula` dizem "Aula"; `licao.*` diz "lição". **Decidido (D-4, 28/09/2026): "lição".** |
| **Atividade** | — | Um item da jornada misturada (pode ser lição, prática, revisão, desafio, checagem, reforço) | 13 | Consistente. Usar para o item do plano, nunca como sinônimo de lição |
| **Passo** | — | Uma tela dentro da lição (ensino, dica, questão, resumo) | — | Uso interno |
| **Sessão** | evitar | — | 1 | `SessionCard` mostra "Sessão de hoje". Proposta: "Hoje" ou "Sua atividade de hoje" (auditoria) |
| **Questão** | — | Uma pergunta com alternativas | — | Consistente |
| **Prática** | — | Atividade de exercícios | — | Consistente |
| **Revisão** | — | Volta a algo já estudado; existe "revisão de capítulo" | 7 | Consistente |
| **Desafio** | — | Atividade mais difícil, oferecida quando a habilidade está firme | — | Consistente |
| **Checagem** | "Checkpoint" | Conjunto de questões misturadas, sem dica, que ajusta a trilha | 13 (Checkpoint) e 1 (Checagem) | **Inconsistente.** `checkpoint.tituloRota`, `introTitulo` e `jornada.kinds.checkpoint` dizem "Checkpoint"; `licao.roles.checkpoint` diz "Checagem rápida" (o `32` F7.7 já chamou "Checkpoint" de jargão). **Decidido (D-4, 28/09/2026): "Checagem".** |
| **Nivelamento** | "diagnóstico" para o mesmo fluxo | O conjunto de questões que estima o ponto de partida; ação opcional | 12 | Consistente na UI. `licao.roles.diagnostico` traz "Nivelamento" |
| **Diagnóstico** | usar só interno e no `36` | Resultado visual do nivelamento (nome do `36`) | 5 | Nome interno. Na UI, "Nivelamento" |
| **Lacuna** | — | Ponto em que o aluno está fraco | 10 | Só no `/aha` (heurística de perfil) e em sugestões do tutor. Não usar como resultado de medição enquanto for heurística |
| **Faixa** | "nível N", "nota" | Base em construção, No caminho ou Base firme | — | Consistente no nivelamento |
| **Domínio / Dominado** | "domina", "dominado" | Evitar como resultado. Usar faixa | 3 | **Fora do glossário e inconsistente com as faixas do nivelamento** (`20` §13; `36` RP-6). Ressalva da auditoria: o "Dominado" de `progress.tsx` já exige amostra mínima de 5 respostas e 80%, e o selo "Consistente" de `SkillRow` tem critério real, então o uso é cuidadoso; o problema é o vocabulário paralelo (A3-01). **DEPENDÊNCIA DO PLANO PRINCIPAL** na migração (`display.ts` é tocado pelo `36` T-06.1) |
| **Sequência** | "streak" na UI | Dias seguidos de estudo | 2 | Em código e documento, "streak". Na UI, `aha.tsx` usa "Sequência"; `TrailHeader` mostra só número e "dia(s)". **Decidido (D-3, 28/09/2026):** "sequência" |
| **Meta do dia** | — | Quantidade de atividades a fazer hoje | 8 | Consistente ("N/M hoje") |
| **XP** | — | Pontos de esforço | — | Termo do jogo; explicar na primeira ocorrência |
| **Foca** | — | O personagem e o tutor de IA | — | Nome próprio. Aparece como "Foca" e como "tutor de IA" (`tutor.abrirAriaLabel`) |
| **Tutor** | — | A conversa com a Foca, no balão | 14 | Usar "Foca" na fala do personagem, "tutor" só em aria-label e documento |
| **Jornada** | — | Termo técnico do plano adaptativo | 2 | **Não usar em texto para o aluno.** Sobrou em `jornada.voltarJornada`. Auditoria |

## 4. Manutenção

- **String nova:** entra em `src/lib/copy.ts` (falas da Foca em `voz.ts`), ganha linha no inventário [`21`](inventario.md) e passa pelo teste de voz ([02](02-voz-e-tom.md) §5) e por esta tabela.
- **Termo novo:** primeiro na seção 3, depois a string.
- **Mudar string marcada "revisado" no `21`:** só junto com a atualização do inventário.
- **Mudança de 1 rótulo:** pode dispensar skill. Erro, confirmação, estado vazio ou 2+ strings: `better-writing`.
- **Nunca** substituição global: o mesmo termo aparece em id, rota, teste e dado.
