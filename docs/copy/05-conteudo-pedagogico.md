# Conteúdo pedagógico: o que nenhuma skill de copy pode tocar

> Para quem é: qualquer agente que ache que um enunciado, uma explicação ou uma lição "podia ficar mais natural". Entrada: [../COPY.md](../COPY.md). Regra de fundo: **conteúdo pedagógico não é marketing copy, e humanizar nunca sacrifica precisão.**

## 1. O que é conteúdo pedagógico

| Caminho | O que tem |
|---|---|
| `src/content/**` (`banco/`, `items/`, `microlicoes/`, `oficial/`, `taxonomy/`, `trilhas/`, `curriculum*.ts`, `exam-tips.ts`) | Questões, alternativas, gabaritos, explicações, lições, taxonomia, trilhas de redação |
| `src/data/questions.ts` | Banco de questões original |
| Campos de lição: `explicacao`, `teach`, `tip`, `recap`, `enunciado`, alternativas, `fonte` | Texto que ensina ou que mede |
| `content-pipeline/**` | Geração e validação do acervo |

Fora do escopo deste arquivo: rótulos de interface **em volta** do conteúdo (título de passo, botão do player). Esses são copy de interface e seguem [03-ux-writing.md](03-ux-writing.md).

## 2. O que nenhuma skill de copy pode alterar

`better-writing`, `ogilvy-copywriting`, `copywriting`, `copy-editing` e `humanizer` **não** alteram:

- enunciado de questão, principalmente questão oficial;
- alternativas, sua ordem e sua letra;
- gabarito;
- fórmula, dado numérico, unidade, notação;
- conceito, definição, regra gramatical;
- citação, texto de apoio de terceiro e a atribuição de fonte;
- texto histórico;
- o sentido de qualquer explicação.

Nenhuma dessas skills foi feita para isso, e a chance de "melhorar" um texto trocando o significado é real: um advérbio removido muda a condição de uma regra; um travessão trocado muda a leitura de um enunciado; uma alternativa reescrita passa a ter outra resposta correta.

## 3. Questões oficiais do ENEM

Decisão registrada em [34](../decisoes/0002-questoes-oficiais-enem.md): o texto de questões do ENEM pode ser reproduzido **com o ano e "ENEM" visíveis junto ao enunciado, sempre**. Sem imagem, charge, gráfico ou mapa de terceiro. Outros vestibulares não foram aprovados.

- Nunca alterar enunciado nem alternativas de questão oficial. Só metadados (dificuldade, habilidade). Se um oficial precisar de mudança de texto, o caminho é `retirar` (rubrica do `36` §G.6).
- A atribuição visível é requisito, não enfeite: nenhuma mudança de interface a esconde.

## 4. O que uma skill de interface pode tocar

| Pode | Skill | Cuidado |
|---|---|---|
| Rótulos do player: "Começar", "Verificar", "Concluir lição", título do passo "Dica" | `better-writing` | Mesmo texto para o mesmo passo em todas as lições |
| Mensagens de estado em volta da lição (salvo, carregando, erro de pacote) | `better-writing` | — |
| Rótulo do papel da questão ("Checagem rápida", "Prática", "Desafio", "Revisão") | `better-writing` | O `role` no código não muda, só o rótulo |
| Texto do card de motivo ("Essa travou duas vezes…") | `better-writing` | Frase de motivo não é conteúdo pedagógico, mas cita o estado real do aluno: nunca inventar número |

## 5. Como revisar conteúdo pedagógico

Não é tarefa de copy. É revisão factual, com a rubrica e o processo do plano técnico:

- **Rubrica R1 a R8** (gabarito único e correto; explicação coerente; enunciado sem ambiguidade; distratores plausíveis; paralelismo de forma; mede a habilidade etiquetada; dificuldade coerente; português correto): [36](../historico/iniciativas/35-36-37-qualidade/36-plano-qualidade-pedagogica-ux-confiabilidade.md) §G.6. **DEPENDÊNCIA DO PLANO PRINCIPAL:** a rubrica e o relatório de lotes são do `36` Fase 7.
- Falha em R1 a R3 é bloqueante.
- Item alterado incrementa `version`. Nunca reescrever tentativa antiga. Nunca mudar a ordem das alternativas de item em uso.
- O acervo de redação legado (1.204 exercícios) não é revisado item a item por esse plano.

## 6. Regra prática para o agente

Se o pedido é "melhorar o texto de uma questão, lição ou explicação": **pare**. Não é tarefa de copy. Diga ao usuário que isso é revisão pedagógica, aponte a rubrica e pergunte se ele quer abrir um lote de revisão. Copy de interface em volta do conteúdo pode seguir normalmente.
