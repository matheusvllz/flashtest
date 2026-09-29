# Resumo da revisão: por, red, lit, ing (docs/36 T-07.3 e T-07.4)

Revisor: ia-delegada:sonnet (autorização delegada de `docs/32` L349). Não é revisão humana. Data: 28/09/2026. Relatórios por lote: `lote-por-red-lit-ing-01.json` a `-10.json` (+ `.md`), 176 linhas, uma por item, sem id repetido nem faltando.

## Escopo e cobertura

Os 176 itens de `src/content/banco/{por,red,lit,ing}/` (92 + 24 + 34 + 26; nenhum oficial nessas pastas) têm decisão por id. O estrato 1 (83 ids: 1e diagnóstico 47, 1a, 1b, 1c) foi revisado inteiro, na ordem 1e, 1a, 1b, 1c (lotes 01 a 04). Sem itens do estrato 1d nas 4 matérias.

| Estrato | Ids | Amostra mínima (§G.6) | Taxa de ação na amostra | Resultado |
|---|---:|---|---|---|
| 2 (médio) | 24 | 17 (por 5, red 3, lit 4, ing 5; lote 05) | 17 de 17 (100 %) | expandido para 100 %: lote 07 com os 7 restantes |
| 3 (baixo) | 69 | 12 (3 por matéria; lote 06) | 7 de 12 (58 %); por 1/3, red 3/3, lit 2/3, ing 1/3, todos acima de 20 % | expandido para 100 % nas 4 matérias: lotes 08, 09 e 10 com os 57 restantes |

"Ação" = qualquer ação diferente de `manter`. Taxa de ação por lote: 01 16/25, 02 22/25, 03 25/25, 04 8/8, 05 17/17, 06 7/12, 07 7/7, 08 12/25, 09 14/25, 10 2/7.

## Contagem por ação

Um item pode ter mais de uma ação. 176 itens: 130 alterados (`meta.version` +1 e `reviewNote` = id do lote) e 46 só com `manter`.

| Ação | Itens |
|---|---:|
| manter (só isso) | 46 |
| melhorar-alternativas | 123 |
| revisar-explicacao | 30 |
| melhorar-enunciado | 19 |
| reclassificar | 4 |
| substituir (pedido de lote; item mantido ou retirado) | 3 |
| retirar | 2 |
| corrigir (gabarito) | 0 |

Alterados por estrato: 1e 35/47, 1a 19/19, 1b 16/16, 1c 1/1, 2 24/24, 3 35/69. Alterados por matéria: por 59/92, red 22/24, lit 30/34, ing 19/26. Dos 47 itens diagnósticos, 35 tiveram texto alterado (só alternativas, enunciado ou explicação; nenhum papel, status ou elegibilidade mudou).

## Ids retirados (`retired: true`, JSON mantido)

- `gen:por:pontuacao-virgula-regras:199c1dc3`. R1 com divergência: gabarito C ("Não; usar ponto e vírgula"). Minha solução: "Sim" (D, ou A, embora A chame "portanto" de advérbio). Segunda solução independente (subagente que recebeu só enunciado e alternativas): B ("ponto antes de portanto"). As duas discordam do gabarito e também entre si, então pela regra do plano não há correção segura. Além disso, C justifica com "coordenada aditiva, não conclusiva" (falso, "portanto" é conclusivo) e o enunciado mistura "porque" com "portanto" e omite o pronome ("considerava-a"). Não é diagnóstico nem estava em aula.
- `gen:red:competencias-avaliacao-enem:a5d3abda`. R3 e R6: fragmento de uma frase com aposto não permite dizer qual competência é "primariamente" avaliada; C1 (alternativa D) era tão defensável quanto C4 (gabarito A), e a explicação justificava C4 com argumentos frágeis. Estava em `reviewExerciseIds` da aula `aula-red-competencias-avaliacao-enem`: a referência foi trocada por `gen:red:competencias-avaliacao-enem:88ab874e` (mesma habilidade, dificuldade 4, contra 3 do retirado, não retirado, não diagnóstico, ainda fora da aula). `validateLessonSteps` sem problemas. Único caso do escopo; nenhuma aula ficou com item retirado sem substituto.

## Gabarito corrigido

Nenhum. Minha solução independente (feita antes de ver o gabarito) bateu com o gabarito em 174 dos 176 itens; divergiu no `199c1dc3` (retirado, ver acima) e no `a5d3abda` não deu para chegar a uma resposta única (retirado). O índice da resposta correta não mudou em nenhum item, e nenhuma alternativa foi reordenada (verificado contra `git show HEAD:` para os 176: `correta` e número de opções idênticos).

## Correções de conteúdo além da forma (R2, R3, R6, R8)

Erros factuais ou de enunciado que a revisão corrigiu mantendo o gabarito:

- `por:concordancia-verbal-nominal:05966e98` (diagnóstico): "alegres" tem a mesma forma nos dois gêneros e a explicação citava "alegras e alegros"; trocado por "satisfeitos".
- `por:pontuacao-virgula-regras:11103178` (diagnóstico): a explicação dizia que a vírgula antes do "e" final é opcional em português e que as duas formas valem, o que contradizia a alternativa B; enunciado passou a "são os seguintes:".
- `por:sintaxe-termos-oracao:6e7431b8` (diagnóstico): distrator que não existia na frase; `c6beb080` (diagnóstico): dois complementos tratados como um e sujeitos que não estão na frase; `6d1fcdcc` (diagnóstico): passou a pedir o "predicado completo".
- `por:sentido-figuras-linguagem:a04475d4` (diagnóstico), `5e544870` e `62962bf5`: R3 (mais de uma figura defensável; "Explique seu efeito" em múltipla escolha).
- `por:concordancia-verbal-nominal:c97ae91c`: duas alternativas com o mesmo veredito (R3). `por:regencia-verbal-nominal:c9c21607`: enunciado "Qual é o erro" contra alternativas "Não há erro".
- `por:sintaxe-periodo-composto:d1db6ac3` e `7544d6a2`: rótulos imprecisos e enunciado pedindo mais do que a correta respondia.
- `por:pontuacao-virgula-regras:d702199c`, `1a7516c9`, `be6a1ebd`: alternativas que citavam vírgulas inexistentes no trecho, "onde", explicação com regra imprecisa.
- `lit:modernismo-fases-brasil:7fd7ad69`, `6266aea1`: afirmação discutível sobre a Primeira Guerra Mundial e a industrialização; `lit:caracteristicas-escolas-literarias:3960ba72`: explicação com "Modernismo português"; `7820341c`: alternativa de Concretismo também descrevia "experimentação radical".
- `red:competencias-avaliacao-enem:4ced543f`, `1fedf343`: concordância errada na correta, "A opção 3" na explicação; `red:argumentacao-repertorio:1e8211b1`: dado inventado agora declarado hipotético.
- `ing:interpretacao-texto-curto:e1c6de58` (um dos 4 do D-43): a explicação deixou de citar letras e passou a citar o conteúdo. `lit:interpretacao-texto-literario:3236476e`: explicação citava "vazio" onde o texto diz "vazia".
- Vazamento de metadado na explicação (R8): "nível 3" (`lit:...:2821d052`), "dificuldade 4" (`lit:...:1f8b45bb`, `lit:...:2625b28e`), "nível 4" (`por:...:e7fd2a93`), removidos.
- R6 (mede a habilidade etiquetada): `lit:caracteristicas-escolas-literarias:2821d052` mede ambientação e não escola literária (mantido, virou pedido de lote); `1f8b45bb` (leitura alegórica de Macunaíma) e `b768dedd` (figura de linguagem, com habilidade `por:sentido-figuras-linguagem` dentro do arquivo de lit) ficaram como observação, sem mudança.

## Reclassificação de dificuldade

4 itens de `por:interpretacao-ideia-principal` (`085f4890`, `5c83c19e`, `ce8fb679`, `f0414c1a`) foram de 4 para 3 (R7: ideia principal de parágrafo curto é um passo de leitura), com `irt.b` de 0,8 para 0 (o valor padrão da faixa, `source` continua `estimado`). Papel `desafio` mantido.

## Pedidos de lote e exceções

3 pedidos em `pedidos-de-lote-por-red-lit-ing.md` (dois viraram itens retirados; um item ficou mantido).
Exceções propostas a `excecoes-qualidade.json`: nenhuma. Depois da revisão, nenhum item ativo das 4 matérias tem aviso de severidade alta ou média; os únicos itens com razão ≥ 1,5 ou 2,0 que restam são o `199c1dc3` (razão 2,70, retirado, sem exceção porque saiu de circulação) e nenhum outro. O item `b768dedd` (correta de uma palavra, "Personificação", 14 caracteres contra 9 e 10, razão 1,40) fica abaixo do limiar de aviso.

## Métrica "correta estritamente a mais longa" e formato, antes e depois

Medida com `scripts/content/qualidade-forma.ts` (`metricasForma`), nos 176 itens (o "antes" vem de `baseline/auditoria.json`, filtrado para as mesmas 4 matérias sem oficiais; o "depois" foi recalculado do JSON atual, retirados incluídos).

| Grupo | Itens | Mais longa antes | Mais longa depois | Razão ≥ 1,5 antes/depois | Razão ≥ 2,0 antes/depois | Incorretas com absolutismo antes/depois | Travessão antes/depois |
|---|---:|---|---|---|---|---|---|
| por | 92 | 61 (66,3 %) | 24 (26,1 %) | 32 / 1 | 18 / 1 | 19 / 4 | 0 / 0 |
| red | 24 | 21 (87,5 %) | 4 (16,7 %) | 12 / 0 | 5 / 0 | 18 / 2 | 2 / 0 |
| lit | 34 | 29 (85,3 %) | 6 (17,6 %) | 11 / 0 | 4 / 0 | 10 / 0 | 0 / 0 |
| ing | 26 | 24 (92,3 %) | 5 (19,2 %) | 6 / 0 | 0 / 0 | 4 / 1 | 0 / 0 |
| **Total** | **176** | **135 (76,7 %)** | **39 (22,2 %)** | **61 / 1** | **27 / 1** | **51 / 7** | **2 / 0** |

O único item que resta com razão ≥ 1,5 e ≥ 2,0 é o retirado `199c1dc3` (não reescrito de propósito). Os 7 absolutismos que sobram estão em itens em que a correta também tem absolutismo, ou são 1 só distrator, e não geram aviso. Metas de §O G-12: 100 % do estrato 1 com decisão (83/83); nenhum item com razão ≥ 2,0 sem decisão registrada (27 de 27 têm ação, ou retirada); taxa "mais longa" nas 4 matérias de 76,7 % para 22,2 %.

## Validação feita

- `validateExercise` (scripts/content/validate.ts) em cada item alterado, antes e depois: nenhuma regra de bloqueio nova; as regras de forma (`tamanho-correta-maior`, `tamanho-correta-menor`, `absolutismo-distratores`, `travessao-alternativa`, `explicacao-cita-alternativa-errada`) sem aviso nos itens ativos.
- `validateLessonSteps` em todas as aulas das 4 matérias depois de cada lote (`fixlessons.ts` descartável): sem problemas. Uma única troca de referência (ver retirados).
- Comparação com `git show HEAD:` de cada arquivo: `correta`, número de opções e `status` iguais nos 176; `exercise` de item sem `reviewNote` de lote idêntico ao de HEAD; chaves de cada arquivo e formato (`JSON.stringify(x, null, 2)` + quebra de linha) preservados; só o arquivo `red-competencias-avaliacao-enem.json` teve `lessons` alterado (a troca de referência). Nenhum travessão nos textos alterados.
- Não rodei `bun run build`, `build-packs`, testes completos nem Playwright: o orquestrador roda o build e a regressão. Os derivados (`itens-gerados.ts`, `aulas-geradas.ts`, `public/content`) ainda não refletem estas edições, e `itens-gerados.ts` precisará marcar `retired` nos 2 itens.

## Dificuldades encontradas

- Os itens de humanas e linguagens tinham a correta como a maior alternativa por construção (correta com 100 a 200 caracteres contra distratores de 20 a 60, muitas vezes absurdos). Igualar o tamanho exigiu reescrever distratores com um erro conceitual real, e não só cortar a correta, o que deu mais trabalho do que uma edição de forma.
- Itens de resposta de uma palavra (classes gramaticais, tempos verbais, formação de palavras, vocabulário em inglês) não têm pista de tamanho e foram mantidos.
- Item em que o gabarito era contestável (`199c1dc3`) não podia ser corrigido sem mudar o índice da correta; como as duas soluções independentes discordaram entre si, foi retirado.
- Os 4 itens `interpretacao-ideia-principal` de dificuldade 4 não exigiam raciocínio de nível 4; a reclassificação para 3 é a decisão de maior impacto no modelo adaptativo desta rodada e merece conferência do orquestrador.
- A revisão é de IA delegada sobre o próprio banco gerado por IA; ela pega erro de forma e de conteúdo evidente, mas não substitui revisão pedagógica humana, e o `reviewKind` dos itens continua `ia-delegada`.

## Arquivos alterados

- `src/content/banco/por/*.json` (13 arquivos), `red/*.json` (3), `lit/*.json` (3), `ing/*.json` (2). Os 21 arquivos têm item alterado; as demais chaves (`lessons`, `subjectId`) foram preservadas, e o que já estava diferente de HEAD por fases anteriores (`reviewKind` da T-07.5, promoção de diagnóstico) não foi tocado.
- `content-pipeline/relatorios/qualidade-2026-09/lote-por-red-lit-ing-01..10.json` e `.md`, `pedidos-de-lote-por-red-lit-ing.md`, `resumo-por-red-lit-ing.md`.
- Nenhum outro arquivo do repositório foi editado; scripts de trabalho ficaram no scratchpad.
