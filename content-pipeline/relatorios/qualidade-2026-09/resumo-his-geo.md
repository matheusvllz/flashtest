# Resumo da revisão editorial: história e geografia (T-07.3 e T-07.4)

Revisor: `ia-delegada:sonnet` (revisão feita por modelo, por delegação; não é revisão humana). Data: 2026-09-28. Registro por id em `lote-his-geo-01.json` a `lote-his-geo-07.json` (cada um com o `.md` de resumo). Escopo: `src/content/banco/his/`, `src/content/banco/geo/` e os 18 itens de `src/content/banco/oficial/` (estes só com metadado).

## Cobertura

| Lote | Conteúdo | Ids |
|---|---|---:|
| 01 | estrato 1e (diagnóstico), his e geo | 21 |
| 02 | estrato 1e, 18 oficiais (só metadado) | 18 |
| 03 | estrato 1a/1b/1c (his e geo, restante) | 21 |
| 04 | idem | 21 |
| 05 | amostra sugerida dos estratos 2 (10) e 3 (6) | 16 |
| 06 | expansão do estrato 2 e 3, geo | 16 |
| 07 | expansão do estrato 3, his e geo | 15 |

- Estrato 1 (união 1a-1e): 63 itens gerados de his/geo mais os 18 oficiais = **81 ids, 100% com decisão por id**.
- Estratos 2 e 3: a amostra do §G.6 (10 no médio e 6 no baixo) teve **100% de ação diferente de manter**, muito acima do limiar de 20%. Por isso a regra de expansão foi aplicada: **100% dos estratos 2 e 3 de his e geo** (19 + 28 = 47 ids). Todos os 110 itens gerados de his/geo têm decisão (110 de 110 alterados).
- Total de linhas nos relatórios: 128 (110 gerados + 18 oficiais).

## Contagens por ação (um item pode ter várias)

| Ação | Itens |
|---|---:|
| melhorar-alternativas | 109 |
| revisar-explicacao | 36 |
| melhorar-enunciado | 11 |
| reclassificar (só dificuldade) | 8 |
| corrigir (erro factual de texto; gabarito inalterado) | 3 |
| retirar | 1 |
| manter | 18 (17 oficiais e 1 gerado, `gen:his:guerra-fria-bipolaridade:015b0ad6`) |
| substituir | 0 |

Nota: 17 oficiais ficaram em `manter` (sem alteração de arquivo) e 1 foi retirado; dos gerados, 1 ficou em `manter`. Itens alterados no banco: **110** gerados + 1 oficial retirado (`version` +1 e `reviewNote` em todos).

## Itens retirados

- `oficial:2023:273a7d48` (ENEM 2023, juros compostos com parcela no ato): **gabarito D conferido** (resolvi antes do gabarito: 21,5%), mas a **explicação tem a equação errada** ("600(1+i)^2 + 600(1+i) - 900(1+i)^2 = 0" omite o termo 600 e levaria a 1+i = 2). Como oficial não pode ter texto alterado, a regra manda `retirar` (`retired: true`, `version` 2, `reviewNote` `his-geo-lote-02`). Nenhuma aula referencia o item. **Decisão para o orquestrador:** a explicação é texto do Foca, não do Inep; se autorizar editar só a explicação, dá para reativar o item com este texto (conferido): "O valor financiado é 1500 x 1,2 = 1800, em 3 parcelas de 600. A 1a é paga no ato, então o saldo a financiar é 1500 - 600 = 900, pago em duas parcelas de 600, em 30 e 60 dias. Com x = 1/(1+i): 600x + 600x^2 = 900, isto é, 2x^2 + 2x - 3 = 0, e x = (-2 + raiz de 28)/4 = (-2 + 5,29)/4 = 0,8225. Então 1+i = 1,2158 e i = 21,5%." Reativar é remover `retired` e trocar a explicação.

## Gabarito corrigido

**Nenhum.** Em todos os 128 itens meu gabarito coincidiu com o do banco (R1). Não houve divergência, então não foi preciso pedir segunda solução a subagente. Ressalva de método: nos lotes 06 e 07 (amostras e expansões, itens de conteúdo básico) usei a listagem que já trazia o gabarito e a explicação junto do enunciado; nos lotes 01 a 05 resolvi antes de ver o gabarito. Os itens do 06 e 07 são de recordação direta e não geraram dúvida, mas o R1 nesses dois lotes não foi cego.

## Correções factuais (gabarito preservado, texto corrigido)

- `gen:his:brasil-colonia-economia-sociedade:5f65e97c`: a correta dizia que "fidalgos leais" recebiam sesmarias e que o beneficiário "fornecia produtos para a Coroa"; agora descreve o regime (posses para cultivar, obrigação de produzir, retomada pela Coroa) e a explicação cita o dízimo.
- `gen:his:era-vargas-politica-economia:da44d210`: chamava a Revolução de 1930 de "golpe militar liderado por Getúlio"; agora "movimento armado da Aliança Liberal, apoiado por militares e oligarquias dissidentes".
- `gen:his:era-vargas-politica-economia:cd9762a0`: a explicação citava o "Palácio do Planalto" como sede do poder nos anos 1930-40 (o Planalto é de 1960; a sede era o Palácio do Catete).

Outros erros factuais e de coerência corrigidos dentro de `melhorar-enunciado`/`revisar-explicacao`: explicação de `ditadura-militar-contexto:b2b9ab1c` dizia que Tancredo foi eleito diretamente (foi pelo Colégio Eleitoral); `1b0db310` explicava o AI-5 em pergunta sobre os primeiros atos (AI-1); `1aa87534` confundia Bandung com o Movimento dos Não Alinhados; `d548d765` listava "descentralização do poder" como fator de perda de legitimidade; `6778686b` tinha enunciado e explicação contraditórios sobre a população mestiça; `97eb9db3` e `3806cbbf` com imprecisões sobre dízimo e sesmarias; `ffba4a00` chamava de "decretos legislativos" o que era "decretos com força de lei"; `6f80c43a` tinha meia-risca em 4 alternativas e um nome de período inexistente ("Governo de Transição 1945-1951"); `cc4c9592` tinha um distrator historicamente verdadeiro (a França enviou tropas à Coreia).

## Reclassificações de dificuldade (só metadado; nenhuma em item diagnóstico)

`geo:meio-ambiente-impactos:02ee8f7d`, `4e4a686a`, `967551c7` (4 para 3); `geo:urbanizacao-processos:74f6685a` (4 para 3); `geo:climatologia-fenomenos:334ac333` (4 para 3); `his:brasil-colonia-economia-sociedade:8b4a1c3a` (4 para 3); `his:guerra-fria-bipolaridade:0fd2ad2d` e `5ae280de` (1 para 2). A `difficulty` do passo dentro da aula (`steps[].difficulty`) não deriva da meta e não foi alterada; as aulas (`lessons`) ficaram byte a byte iguais (verificado). Item diagnóstico com dificuldade discutível e mantida: `gen:his:guerra-fria-bipolaridade:015b0ad6` (d3 para um item de recordação; não mexi para não alterar as faixas do pool diagnóstico).

## Pedidos de lote (substituir)

Nenhum. Não houve item com falha R1 a R3 que exigisse item novo. Não foi criado `pedidos-de-lote-his-geo.md`.

## Exceções propostas a `excecoes-qualidade.json`

Nenhuma. Depois da revisão, nenhum item de his/geo tem razão de tamanho >= 2,0, absolutismo em 2 ou mais distratores ou travessão em alternativa; nenhuma exceção foi necessária. (O único aviso de forma restante nos oficiais é o de absolutismo em 1 oficial, de texto que não posso alterar; a regra `absolutismo-distratores` exige 2 ou mais, então não dispara.)

## Métricas antes e depois (medidas com `scripts/content/qualidade-forma.ts`)

| Grupo | Itens | Correta estritamente a mais longa | Razão >= 2,0 | Distratores com absolutismo (>= 2) | Itens com travessão |
|---|---:|---|---:|---:|---:|
| his + geo antes | 110 | 102 (92,7%) | 25 | 16 | 1 |
| his + geo depois | 110 | **32 (29,1%)** | **0** | **0** | **0** |
| his antes / depois | 55 | 51 (92,7%) / 13 (23,6%) | 19 / 0 | 5 / 0 | 1 / 0 |
| geo antes / depois | 55 | 51 (92,7%) / 19 (34,5%) | 6 / 0 | 11 / 0 | 0 / 0 |
| oficiais (18) antes / depois | 18 | 2 (11,1%) / 2 (11,1%) | 0 / 0 | 1 / 1 | 0 / 0 |

Cuidado com o efeito contrário: a primeira versão da revisão deixou a correta como a mais longa em 0% dos itens (viés inverso, "a mais longa é sempre errada"). Um passe seguinte enxugou distratores em 33 itens de diferença mínima (1 a 3 caracteres) até chegar a 29,1%, perto do acaso de 25% com 4 alternativas. A correta é a estritamente mais curta em 10 de 110 itens (9%). A posição do gabarito de cada item não mudou (nenhuma alternativa foi reordenada).

## Validação e integridade

- `validateExercise` em todos os 110 itens alterados: 0 inválidos, 0 avisos de severidade alta.
- Verificação por script (cópia original em scratchpad contra o banco atual): só os 110 itens gerados e o oficial retirado mudaram; índice da correta igual em todos; `version` +1 e `reviewNote` `his-geo-lote-NN` em todos os alterados; `status` e `reviewKind` intactos; `lessons` idênticas; nenhum travessão; nenhuma letra citada na explicação.
- `bun test tests/unit/pipeline-validate.test.ts`: 43 passam, 5 falham. As 5 falhas são de itens de **biologia** (`gen:bio:*`) usados como positivos do docs/35 e já revisados por outro revisor (a razão, o absolutismo e o travessão que o teste espera deixaram de existir por causa da revisão). Não são de his/geo. O teste precisa ser atualizado pelo orquestrador (por exemplo, com fixtures fixas em vez de ler os ids do acervo).
- Não rodei build, `build-packs`, suíte completa nem playwright. Os derivados (`src/content/banco/itens-gerados.ts`, `aulas-geradas.ts`, `public/content/`) **precisam ser regenerados** pelo orquestrador.

## Arquivos alterados por esta revisão

- `src/content/banco/his/` (4 arquivos) e `src/content/banco/geo/` (4 arquivos).
- `src/content/banco/oficial/`: os 7 arquivos foram regravados pelo script, mas só `2023-mat.json` mudou de conteúdo (item `273a7d48` retirado); os outros ficaram idênticos byte a byte.
- `content-pipeline/relatorios/qualidade-2026-09/lote-his-geo-01` a `07` (`.json` e `.md`) e este resumo.
