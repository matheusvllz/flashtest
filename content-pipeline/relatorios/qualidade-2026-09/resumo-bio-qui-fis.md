# Resumo da revisão editorial: bio, qui, fis (docs/36 T-07.3 e T-07.4)

Revisor: `ia-delegada:sonnet` (revisão delegada, autorização de `docs/32` L349). Não houve revisão humana. Data: 28/09/2026. Registro auditável: `lote-bio-qui-fis-01..04.json` (mais o `.md` de cada lote), `pedidos-de-lote-bio-qui-fis.md`. `reviewNote` dos itens alterados: `bio-qui-fis-lote-NN`.

## Cobertura

- Escopo: 87 ids, todos com linha de decisão (4 lotes de 25, 25, 25 e 12).
  - Estrato 1: 71 ids (1e diagnóstico 38, 1a 18, 1b 13, 1c 2; os 4 exemplos do `docs/35` (1d), todos de bio, já estão contados em 1e e 1a). Cobertura 100%.
  - Estrato 2: 7 ids (bio 6, qui 1). A amostra sugerida de bio (5) teve ação em 5/5, acima de 20%, então expandiu para 100% do estrato-matéria (o 6º, `a2f24d07`). qui só tem 1 item no estrato.
  - Estrato 3: 9 ids (3 por matéria; 5% com mínimo 3). Ação em 0/9 (todos `manter`), abaixo de 20%: sem expansão. Os outros 90 itens do estrato 3 (bio 26, fis 35, qui 29) não foram lidos.
- Itens oficiais (`oficial/`) não foram tocados; 4 dos 75 ids de estrato 1 de bio/qui/fis em `estratos.json` são oficiais e ficaram fora (a lista tem 75, o escopo próprio, 71).

## Contagens por ação (87 itens; um item pode ter várias ações)

| Ação | Itens |
|---|---:|
| manter (sem mudança) | 30 |
| manter com pedido de substituição | 1 |
| melhorar-alternativas | 53 |
| melhorar-enunciado | 10 |
| revisar-explicacao | 4 |
| corrigir (gabarito) | 0 |
| reclassificar | 0 |
| retirar | 0 |
| substituir (pedido de lote) | 1 |

- Itens alterados (`version` + 1 e `reviewNote`): 56 de 87 (bio 50 de 60, qui 5 de 14, fis 1 de 13). Dos 38 itens diagnóstico revisados, 16 foram alterados.
- Nenhuma alteração em `correta`, ordem das alternativas, `status`, `reviewKind`, papéis ou demais metadados (verificado item a item contra o snapshot anterior; `lessons` idênticas em todos os arquivos).

## Retirados e gabarito corrigido

- Retirados: nenhum. Não houve falha R1 a R3 que impedisse conserto.
- Gabarito corrigido: nenhum. Todas as 87 resoluções independentes (feitas antes de ler o gabarito) coincidiram com o gabarito; portanto não foi preciso pedir segunda solução a subagente.
- Correções factuais/numéricas sem mudar o gabarito:
  - `bio:ecologia-relacoes-ecossistema:7cfdb954`: o enunciado misturava biomassa em kg com energia e a explicação chamava 10.000 kg de energia. Reescrito em unidades de energia (regra dos 10%).
  - `bio:ecologia-relacoes-ecossistema:a74260f8`: a alternativa correta dizia que as fixadoras convertem N2 em nitrato (fixação dá amônia; o nitrato vem da nitrificação). Reescrita com os dois passos.
  - `fis:energia-trabalho-conservacao:34d44ba9`: 60 raiz de 2 = 84,85 J arredonda para 84,9 J, não 84,8 J. Alternativa B e explicação corrigidas.
  - `bio:membrana-estrutura:56c9c3a0`: o distrator D ("aminoácidos hidrofílicos em contato com a água") era verdadeiro para as extremidades da proteína, ameaçando o gabarito único (R1 marcado como atenção). Trocado por inversão inequívoca.
  - `bio:evolucao-selecao-natural:bdbf1036`: o distrator "bicos médios evoluem" era defensável num clima que oscila; trocado por erro inequívoco.
  - `bio:evolucao-selecao-natural:b5a116d5`: o enunciado não dizia o fundo (solo escuro) contra o qual a pelagem clara é mais visível; acrescentado.
  - `qui:tabela-periodica-propriedades:8344c458`: "terminada em 4s²" é ambígua (transição do 4º período); enunciado passou a dar a configuração completa (cálcio).
  - `qui:quimica-organica-funcoes:4cd6558d`: "alcóol" (grafia), "funções alcóol" e uma frase interna ("habilidade crítica no nível 2") na explicação.
  - `bio:membrana-funcao:16cd90e6`: o enunciado falava de "íons intracelulares" sem nomeá-los.

## Pedidos de lote (substituir)

`pedidos-de-lote-bio-qui-fis.md`: 1 pedido. `fis:energia-trabalho-conservacao:a29fb360` (diagnóstico) resolve por Newton e cinemática, não por conservação de energia (R6). Mantido, sem alteração, porque o gabarito está certo; pede-se 1 item novo de conservação de energia mecânica, dificuldade 3, papel diagnostico.

## Propostas que dependem do orquestrador (não aplicadas)

1. Reclassificar habilidade (R6), porque mexer em `skillIds` de item diagnóstico altera pool e aulas em paralelo à revisão de outras matérias:
   - `bio:genetica-leis-mendel:5511b43e` (fatores evolutivos) e `bio:genetica-leis-mendel:ff5f7daf` (Hardy-Weinberg) para `bio:evolucao-selecao-natural`;
   - `fis:energia-trabalho-conservacao:a29fb360` para `fis:dinamica-leis-newton` (se o pedido de lote for atendido, o item novo cobre a lacuna).
2. Reclassificar dificuldade (R7), não aplicada porque `irt.b` é estimado/calibrado a partir da dificuldade e os itens diagnóstico compõem o pool: dificuldade alta demais em `bio:ecologia-relacoes-ecossistema:7cfdb954` (4), `bio:membrana-funcao:30d14b26` (4), `fis:cinematica-movimento-uniforme:5e750ddb` (4), `bio:ecologia-relacoes-ecossistema:982399ed` (4), `bio:genetica-leis-mendel:32d614e4` (4), `qui:estequiometria-calculo-mols:4fc40e66` (4), `qui:estrutura-atomica-modelos:a9308d80` (4, uma subtração), e 3 (recordação direta) em `bio:fisiologia-humana-sistemas:0a79e08a`, `bio:organelas-funcao:ed4dd112`, `fis:cinematica-movimento-uniforme:a70d832f`; baixa em `bio:membrana-funcao:c0fab581` (1).
3. Exceções a `excecoes-qualidade.json`: nenhuma necessária. Depois da revisão nenhum item das três matérias acusa `tamanho-correta-maior` (razão ≥ 1,5), `absolutismo-distratores` nem `travessao-alternativa`.
4. Testes: 5 testes de `tests/unit/pipeline-validate.test.ts` ("positivos (ids do docs/35 §7.1)") leem do banco real os ids `6553a1bf`, `5ae4f57c`, `b9bc002a`, `a655cd73` e esperam o defeito de forma que agora está corrigido; eles falham (verificado rodando o arquivo). Precisam de fixture congelada com o texto antigo. Derivados (`itens-gerados.ts` etc.) precisam de `build-packs` (não rodei).

## Métrica "correta estritamente a mais longa" (medida com `qualidade-forma.ts`, itens não retirados)

| Matéria | Antes | Depois |
|---|---|---|
| bio | 60/86 = 69,8% | 27/86 = 31,4% |
| qui | 5/43 = 11,6% | 4/43 = 9,3% |
| fis | 2/48 = 4,2% | 2/48 = 4,2% |
| total | 67/177 = 37,9% | 33/177 = 18,6% |

Demais sinais (mesma medição):

| Sinal | Antes | Depois |
|---|---|---|
| razão ≥ 2,0 | bio 24, qui 1, fis 0 | 0 |
| razão ≥ 1,5 | bio 40, qui 2, fis 0 | 0 |
| ≥ 2 incorretas com absolutismo e a correta sem | bio 4 | 0 |
| itens com travessão em alternativa | bio 16 | 0 |

Os números de bio incluem itens do estrato 3 não lidos (que nunca tiveram esses sinais). Em qui e fis quase não havia problema de forma (matemática de alternativas numéricas); não distorci itens só para mudar número, e a queda de qui (11,6% para 9,3%) vem só de `f2f2c956`, cuja correta deixou de ser a mais longa.

## Dificuldades encontradas

- Os itens de bio dependem de "correta mais longa por justificativa": reescrever mantendo o índice da correta exigiu redigir distratores plausíveis (lamarckismo, causa invertida, inversão de propriedade) no mesmo formato de frase; alguns distratores originais eram frases sem sentido ou contradiziam o enunciado (por exemplo `3646a34e`, `1b398a65`) e foram trocados, o que conta como melhoria de R4 além de R5.
- Ainda há itens em que a correta é ligeiramente a mais longa (razão de 1,02 a 1,17), sem pista relevante.
- Não foi possível medir a atribuição de dificuldade e habilidade sem mexer em `irt`/pool; por isso as propostas acima.
- A pasta de scratchpad é compartilhada com os outros revisores; usei um subdiretório próprio (`bqf/`).
