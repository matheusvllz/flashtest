# Resumo da revisao editorial: mat, fil, soc (docs/36 T-07.3 e T-07.4)

Revisor: `ia-delegada:sonnet` (revisao delegada por IA, nao humana). Registro por id em `lote-mat-fil-soc-01.json` a `lote-mat-fil-soc-11.json` (mais o `.md` curto de cada lote). Diretorios: `src/content/banco/mat/`, `fil/`, `soc/`. Os oficiais (`banco/oficial/`) nao foram tocados.

## Cobertura

- Itens proprios revisados: **274 de 274** (mat 187, fil 42, soc 45). Os 7 itens oficiais que a auditoria conta em mat/soc ficam fora do escopo.
- Estrato 1 (risco alto): **80 de 80**, na ordem 1e (diagnostico) -> 1a -> 1b/1c/1d (fil 22, mat 34, soc 24).
- Estratos 2 e 3: a amostra minima do §G.6 (estrato 2: 10 itens; estrato 3: 10 itens) deu taxa de acao de 100 % e 50 % (≥ 20 %). Por isso a regra de expansao foi aplicada e **os dois estratos foram revisados a 100 %**: estrato 2 = 13 itens (mat 3, fil 2, soc 8), estrato 3 = 181 itens (mat 150, fil 18, soc 13).
- Taxa de acao (≠ manter) por estrato/materia: estrato 1: fil 21/22, soc 24/24, mat 1/34; estrato 2: fil 2/2, soc 8/8, mat 3/3; estrato 3: fil 15/18, soc 13/13, mat 12/150.
- Itens alterados: **99** (fil 38, soc 45, mat 16). Mantidos: 175. Cada item alterado teve `meta.version + 1` e `meta.validation.reviewNote = mat-fil-soc-NN`.

## Contagens por acao (um item pode ter mais de uma)

| acao | itens |
|---|---:|
| melhorar-alternativas | 85 |
| revisar-explicacao | 28 |
| melhorar-enunciado | 17 |
| manter | 175 |
| corrigir (gabarito) | 0 |
| reclassificar | 0 (ver propostas abaixo) |
| substituir | 0 |
| retirar | 0 |

## Gabarito, retiradas e segunda solucao

- **Nenhum gabarito estava errado.** Resolvi os 274 itens antes de ver o gabarito (R1) e todos bateram. Por isso nao houve `corrigir`, nem segunda solucao por subagente, nem `retirar`. **Ids retirados: nenhum. Ids com gabarito corrigido: nenhum.**
- Nenhuma alternativa foi reordenada: o indice da correta ficou igual em todos os 274 itens (verificado por script contra o snapshot anterior). As `lessons` dos 21 arquivos ficaram byte a byte iguais e passam em `validateLessonSteps` (0 problemas); como nada foi retirado, nao houve troca de referencia.
- Foram, porem, achados defeitos de enunciado/chave que fariam o aluno errar sem culpa (R3/R6), corrigidos como `melhorar-enunciado` sem mudar o gabarito:
  - `gen:mat:media-mediana-moda:b12defc3`: a media ponderada (7,5) e a media simples (7,5) davam o mesmo numero, entao quem ignorava os pesos acertava. Notas trocadas para 7, 5, 10, 7 (pesos iguais): ponderada 7,5, simples 7,25.
  - `gen:mat:probabilidade-evento-simples:16817e9d`: a alternativa A (`10/49 ≈ 20%`) tambem arredondava para 20 %, e o enunciado nao dizia que cada pessoa ganha so um premio. Enunciado explicito, A virou `9/49 ≈ 18%`.
  - `gen:mat:operacoes-fundamentais:8661883f`: "o dobro do segundo dia" e "total vendido" eram ambiguos (bruto x liquido de devolucoes). Agora fala em vendas liquidas.
  - `gen:mat:porcentagem-fator-multiplicativo:5a470c25` (cashback sem base), `gen:mat:volume-solidos-geometricos:7a5cef55` (raio do cone nao dito), `gen:mat:funcao-exponencial-crescimento:0fa02fd8` e `gen:mat:leitura-grafico-tabela:27204e3e` (resposta arredondada sem o enunciado pedir arredondamento).
  - fil/soc: `fil:epistemologia-conhecimento:cb459baa` (Sim/Nao sem dizer de qual posicao), `f1789440` (concordancia de genero), `99f8d7e3` ("filosofo medieval" x racionalismo, 1a pessoa), `fil:etica-correntes-filosoficas:57662da2` (enunciado entregava a resposta e reduzia deontologia a "cumprir a lei"), `23e4d067` (enunciado dizia "responderiam diferentemente" e a explicacao dizia que chegam ao mesmo resultado), `fil:politica-poder-estado:65fbb645` (ambiguidade com Montesquieu), `soc:movimentos-sociais-cidadania:436b80ae`, `soc:cultura-identidade-sociedade:bc242bf9` (enunciado entregava a resposta).
  - Erros factuais em explicacao/alternativa: "Racionalismo transcendental de Kant" (106b8cff), "Apenas racionalismo explica..." (528a85d9, c12ddbda), "Nietzschianismo" e "Nihilismo" como posicoes epistemologicas (e9ae0d53, 99f8d7e3), Nozick com direitos "irrevogaveis/absolutos" (0e52a560), "desigualdade de deficiencia" (7ae09e91, trocado por "modelo social da deficiencia").
- As 3 ocorrencias de `explicacao-cita-alternativa-errada` de fil (D-43) foram reescritas citando o conteudo em vez da letra: `fil:epistemologia-conhecimento:adc93b2a`, `fil:etica-correntes-filosoficas:57662da2`, `fil:politica-poder-estado:9193018a` (e a de `fil:epistemologia-conhecimento:de36e59c`, que citava "a opcao C" mesmo batendo com o gabarito, foi reescrita por precaucao).
- Frases sobre a incidencia de conteudo na prova ("comum no ENEM", "cai bastante", "base pra analise de dados no ENEM") sem fonte foram removidas de 5 explicacoes de mat.

## Metrica "correta estritamente a mais longa" (medida com `qualidade-forma.ts`, antes = snapshot anterior a revisao)

| materia | itens | antes | depois |
|---|---:|---:|---:|
| fil | 42 | 33 (78,6 %) | 14 (33,3 %) |
| soc | 45 | 43 (95,6 %) | 13 (28,9 %) |
| mat | 187 | 11 (5,9 %) | 9 (4,8 %) |
| total das 3 | 274 | 87 (31,8 %) | 36 (13,1 %) |

Em fil e soc a meta (≤ 35 %) foi cumprida sem encurtar so a correta: os distratores ganharam o mesmo nivel de detalhe (frases soltas como "Desigualdade biologica inevitavel" viraram posicoes reais, cada uma ligada a um erro conceitual nomeavel). Em mat os 9 restantes sao falsos positivos (alternativas numericas com virgula/1 digito a mais, ou tamanhos iguais com empate).

Outras metricas (mesmo criterio, 274 itens): razao de tamanho ≥ 2,0: 12 -> 0; ≥ 1,5: 42 -> 1; avisos por regra antes -> depois: tamanho-correta-maior alta 12 -> 0, media 30 -> 1; explicacao-cita-alternativa-errada 3 -> 0; travessao-alternativa 2 -> 0; absolutismo-distratores 9 -> 0; dispersao-tamanhos 3 -> 0. **Nenhum item com razao ≥ 2,0 ficou sem decisao; nao restou nenhum.** O unico aviso que sobra em mat e o falso positivo abaixo.

## Excecoes propostas a `excecoes-qualidade.json` (NAO editei o arquivo)

Falsos positivos de tamanho em alternativa numerica (a regra nao pode distorcer o numero):

| id | regra | motivo |
|---|---|---|
| `gen:mat:leitura-grafico-tabela:a5bf2bb5` | `tamanho-correta-maior` | media 587,5 contra 600, 625, 575: a virgula faz a correta ter 5 caracteres contra 3 (razao 1,67); distratores plausiveis de 3 digitos, forma correta. |
| `gen:mat:area-perimetro-figuras-planas:bbcb8fa3` | `tamanho-correta-maior` (se a regra passar a olhar o limiar 1,25) | area 93,42 contra 75, 108, 54: unico decimal (razao 1,29, abaixo do limiar atual de 1,5, so registro). |
| `gen:mat:media-mediana-moda:7e67f83f` | `tamanho-correta-maior` (idem) | media 0,86 contra 1, 1,5, 2: numero decimal legitimo. |

## Propostas de reclassificacao NAO aplicadas (27 itens, marca R7 = "atencao")

Decidi nao alterar `meta.difficulty` porque (a) o IRT (`b`) deriva da dificuldade (`recalibrar-irt-dificuldade.ts`) e mudar so o metadado deixaria `b` incoerente, e (b) os itens de diagnostico entram na faixa do pool (`promover-diagnostico.ts`/`placement-pool.ts`), que nao pude testar sem rodar a suite. Sugestao para o orquestrador ou uma rodada propria, junto com nova recalibracao do IRT: papel `desafio` com raciocinio de 1 a 2 passos e `d4` (`fa7ed58e`, `b772152d`, `2b117e63`, `5ce21896`, `ba769842`, `8c43a8e4`, `0ff20b34`, `9c653674`, `24964185`, `8104d44b`, `ea2b96c3`, `52dfb70b`, `817137a4`, `db3e60e4`, `6a0dd917`, `8e713ef1`, `93377f55`, `627f6ca6`, `7c7f3b59`, `bc242bf9`) e itens de diagnostico marcados `d3` que pedem 1 passo: `d028af55`, `98c820b2` (moda, seria d1), `566eeda2`, `c97f9c78`, `fccf556c`, `bb7b56d2`; `a7452ba9` (soc, d1) e o unico proposto para cima (pede o conceito de habitus). Detalhe e sugestao de nivel em `motivo` de cada linha dos lotes.

## Quase-duplicatas de template em mat (informativo, mantidas)

`34e28219`/`656e826a` (idade: triplo + soma), `86c19d4d`/`fa7ed58e` (soma + diferenca), `b6c700dd`/`bf45e5b4` (25 % de 80, mesma conta e numeros: os dois quase identicos), `863645fc`/`5a4b5ef8` (dois descontos sucessivos). Nao retirei porque nenhum tem defeito R1-R3 e cada um ainda soma pratica; se a banca de revisao quiser enxugar, os candidatos naturais sao `bf45e5b4` ou `b6c700dd`.

## Pedidos de lote

Nenhum `substituir` foi necessario. Ver `pedidos-de-lote-mat-fil-soc.md`.

## Dificuldades encontradas

- A regra de tamanho quase nao dispara em mat (correta mais longa em ~6 %), como o plano previu; o trabalho la foi de conferencia de conta, e os defeitos achados foram de enunciado (ambiguidade, arredondamento, chave que aceita dois raciocinios), nao de gabarito.
- Em fil/soc o problema real era mais amplo que o tamanho: alternativas incorretas eram frases absurdas ("Ausencia de direitos para ninguem", "Jornadas infinitas como natural") que a correta so precisava nao ser absurda para vencer. Igualar o tamanho sem trocar isso teria sido cosmetico; por isso quase toda alteracao trocou o distrator por uma posicao/conceito real.
- O validador limita a explicacao a 80 palavras; varias explicacoes precisaram ser enxugadas ao reescrever.
- Nao rodei build, `build-packs`, suite completa nem playwright (outros revisores editam em paralelo). Validei cada item alterado com `validateExercise` (sem erros) e as 21 listas de `lessons` com `validateLessonSteps` (0 problemas).

## Arquivos alterados

- `src/content/banco/mat/`: `mat-funcao-exponencial-crescimento.json`, `mat-leitura-grafico-tabela.json`, `mat-media-mediana-moda.json`, `mat-operacoes-fundamentais.json`, `mat-porcentagem-fator-multiplicativo.json`, `mat-porcentagem-valor.json`, `mat-probabilidade-evento-simples.json`, `mat-trigonometria-triangulo-retangulo.json`, `mat-volume-solidos-geometricos.json`.
- `src/content/banco/fil/`: os 3 arquivos. `src/content/banco/soc/`: os 3 arquivos.
- Relatorios: `lote-mat-fil-soc-01..11.json` e `.md`, este resumo e `pedidos-de-lote-mat-fil-soc.md`.
- Derivados (`itens-gerados.ts`, `aulas-geradas.ts`, `public/content/`) **nao** foram regenerados: rodar `bun scripts/content/build-packs.ts` no fim.
