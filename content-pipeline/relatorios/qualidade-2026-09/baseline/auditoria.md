# Auditoria de qualidade do acervo

Gerado por `scripts/content/auditar-qualidade.ts` (docs/36 T-07.1). Determinístico: sem data, ordenado por id. O detalhe por item e a lista de ids de cada estrato estão em `auditoria.json` e `estratos.json`, na mesma pasta.

## Acervo de pacote (`src/content/banco/`)

- Itens: **755** (retirados: 0); aulas de pacote: 48; itens com papel `diagnostico`: 178.

### Por origem

| chave | n |
|---|---:|
| ia-validada | 737 |
| oficial | 18 |

### Por `reviewKind`

| chave | n |
|---|---:|
| (ausente) | 755 |

### Por matéria

| chave | n |
|---|---:|
| bio | 89 |
| fil | 42 |
| fis | 48 |
| geo | 57 |
| his | 56 |
| ing | 26 |
| lit | 34 |
| mat | 193 |
| por | 96 |
| qui | 44 |
| red | 24 |
| soc | 46 |

### Por dificuldade

| chave | n |
|---|---:|
| 1 | 122 |
| 2 | 103 |
| 3 | 316 |
| 4 | 213 |
| 5 | 1 |

## Forma das alternativas (§G.7)

| grupo | itens | correta estritamente a mais longa | razão p50 | razão p90 | ≥ 1,5 | ≥ 2,0 | ≥ 3,0 | incorretas com absolutismo | itens com travessão |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| pacote (todos) | 755 | 393 (52.053%) | 1.04 | 2.097 | 202 | 89 | 19 | 193 | 21 |
| origem ia-validada | 737 | 391 (53.053%) | 1.062 | 2.119 | 202 | 89 | 19 | 189 | 21 |
| origem oficial | 18 | 2 (11.111%) | 0.916 | 1.017 | 0 | 0 | 0 | 4 | 0 |
| matéria bio | 89 | 61 (68.539%) | 1.354 | 2.72 | 40 | 24 | 7 | 34 | 16 |
| matéria fil | 42 | 33 (78.571%) | 1.241 | 1.96 | 11 | 4 | 0 | 27 | 2 |
| matéria fis | 48 | 2 (4.167%) | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| matéria geo | 57 | 52 (91.228%) | 1.429 | 1.998 | 26 | 6 | 2 | 32 | 0 |
| matéria his | 56 | 51 (91.071%) | 1.617 | 2.407 | 31 | 19 | 1 | 27 | 1 |
| matéria ing | 26 | 24 (92.308%) | 1.282 | 1.713 | 6 | 0 | 0 | 4 | 0 |
| matéria lit | 34 | 29 (85.294%) | 1.346 | 1.925 | 11 | 4 | 1 | 10 | 0 |
| matéria mat | 193 | 11 (5.699%) | 1 | 1 | 3 | 0 | 0 | 0 | 0 |
| matéria por | 96 | 61 (63.542%) | 1.25 | 2.612 | 32 | 18 | 7 | 19 | 0 |
| matéria qui | 44 | 5 (11.364%) | 1 | 1.014 | 2 | 1 | 0 | 0 | 0 |
| matéria red | 24 | 21 (87.5%) | 1.537 | 2.418 | 12 | 5 | 0 | 18 | 2 |
| matéria soc | 46 | 43 (93.478%) | 1.579 | 2.285 | 28 | 8 | 1 | 22 | 0 |

### Avisos por regra (severidade)

| chave | n |
|---|---:|
| absolutismo-distratores:media | 39 |
| dispersao-tamanhos:info | 34 |
| explicacao-cita-alternativa-errada:alta | 4 |
| tamanho-correta-maior:alta | 89 |
| tamanho-correta-maior:media | 113 |
| tamanho-correta-menor:media | 1 |
| travessao-alternativa:media | 21 |

- `explicacao-cita-alternativa-errada`: 4 item(ns).
- `quase-duplicata` (bigramas ≥ 0.4, mesma habilidade): 6 par(es).
- `posicao-lote` por arquivo: 0 arquivo(s) acima de 40 %.

## Estratos de revisão (§G.6)

Marcas sobrepostas (um item pode ter várias):

| chave | n |
|---|---:|
| 2 | 63 |
| 3 | 377 |
| 1e | 178 |
| 1a | 89 |
| 1b | 128 |
| 1c | 21 |
| 1d | 4 |

Estrato principal (exclusivo, ordem 1e → 1a → 1b → 1c → 1d → 2 → 3):

| chave | n |
|---|---:|
| 2 | 63 |
| 3 | 377 |
| 1e | 178 |
| 1a | 63 |
| 1b | 69 |
| 1c | 5 |
| 1d | 0 |

- Estrato 1 (união de 1a–1e): **315** ids · estrato 2: **63** · estrato 3: **377**.
- Amostra sugerida (30 % por matéria, mín. 5 / 5 % por matéria, mín. 3): médio 43 · baixo 41.

Estrato 1 por matéria:

| chave | n |
|---|---:|
| bio | 54 |
| fil | 22 |
| fis | 10 |
| geo | 29 |
| his | 37 |
| ing | 8 |
| lit | 15 |
| mat | 40 |
| por | 48 |
| qui | 11 |
| red | 16 |
| soc | 25 |

## Cobertura

- Habilidades ativas: 65; sem aula: 9; com menos de 3 itens de revisão: 10.

## Legado (informativo, fora da revisão item a item)

| grupo | itens | correta estritamente a mais longa | razão p50 | razão p90 | ≥ 1,5 | ≥ 2,0 | ≥ 3,0 | incorretas com absolutismo | itens com travessão |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| trilhas legadas (335 MC) | 335 | 229 (68.358%) | 1.216 | 2.011 | 102 | 39 | 5 | 75 | 0 |
| banco geral (59 questões) | 59 | 15 (25.424%) | 1 | 1.242 | 4 | 1 | 0 | 1 | 0 |
