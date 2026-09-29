# Auditoria de qualidade do acervo

Gerado por `scripts/content/auditar-qualidade.ts` (docs/36 T-07.1). Determinístico: sem data, ordenado por id. O detalhe por item e a lista de ids de cada estrato estão em `auditoria.json` e `estratos.json`, na mesma pasta.

## Acervo de pacote (`src/content/banco/`)

- Itens: **755** (retirados: 3); aulas de pacote: 48; itens com papel `diagnostico`: 178.

### Por origem

| chave | n |
|---|---:|
| ia-validada | 737 |
| oficial | 18 |

### Por `reviewKind`

| chave | n |
|---|---:|
| gabarito-oficial | 18 |
| ia-delegada | 737 |

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
| 1 | 120 |
| 2 | 105 |
| 3 | 326 |
| 4 | 203 |
| 5 | 1 |

## Forma das alternativas (§G.7)

| grupo | itens | correta estritamente a mais longa | razão p50 | razão p90 | ≥ 1,5 | ≥ 2,0 | ≥ 3,0 | incorretas com absolutismo | itens com travessão |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| pacote (todos) | 752 | 140 (18.617%) | 0.989 | 1.052 | 1 | 0 | 0 | 32 | 0 |
| origem ia-validada | 735 | 138 (18.776%) | 0.989 | 1.052 | 1 | 0 | 0 | 28 | 0 |
| origem oficial | 17 | 2 (11.765%) | 0.886 | 1.022 | 0 | 0 | 0 | 4 | 0 |
| matéria bio | 89 | 28 (31.461%) | 0.989 | 1.128 | 0 | 0 | 0 | 6 | 0 |
| matéria fil | 42 | 14 (33.333%) | 0.955 | 1.07 | 0 | 0 | 0 | 11 | 0 |
| matéria fis | 48 | 2 (4.167%) | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| matéria geo | 57 | 20 (35.088%) | 0.95 | 1.071 | 0 | 0 | 0 | 0 | 0 |
| matéria his | 56 | 13 (23.214%) | 0.94 | 1.029 | 0 | 0 | 0 | 0 | 0 |
| matéria ing | 26 | 5 (19.231%) | 0.962 | 1.035 | 0 | 0 | 0 | 1 | 0 |
| matéria lit | 34 | 6 (17.647%) | 0.933 | 1.03 | 0 | 0 | 0 | 0 | 0 |
| matéria mat | 192 | 9 (4.688%) | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| matéria por | 95 | 23 (24.211%) | 0.946 | 1.105 | 0 | 0 | 0 | 4 | 0 |
| matéria qui | 44 | 4 (9.091%) | 0.986 | 1 | 0 | 0 | 0 | 0 | 0 |
| matéria red | 23 | 3 (13.043%) | 0.958 | 1.009 | 0 | 0 | 0 | 1 | 0 |
| matéria soc | 46 | 13 (28.261%) | 0.982 | 1.063 | 0 | 0 | 0 | 9 | 0 |

### Avisos por regra (severidade)

| chave | n |
|---|---:|
| absolutismo-distratores:media | 1 |
| tamanho-correta-maior:media | 1 |
| tamanho-correta-menor:media | 1 |

- `explicacao-cita-alternativa-errada`: 0 item(ns).
- `quase-duplicata` (bigramas ≥ 0.4, mesma habilidade): 6 par(es).
- `posicao-lote` por arquivo: 0 arquivo(s) acima de 40 %.

## Estratos de revisão (§G.6)

Marcas sobrepostas (um item pode ter várias):

| chave | n |
|---|---:|
| 2 | 1 |
| 3 | 570 |
| 1e | 177 |
| 1a | 0 |
| 1b | 7 |
| 1c | 0 |
| 1d | 4 |

Estrato principal (exclusivo, ordem 1e → 1a → 1b → 1c → 1d → 2 → 3):

| chave | n |
|---|---:|
| 2 | 1 |
| 3 | 570 |
| 1e | 177 |
| 1a | 0 |
| 1b | 3 |
| 1c | 0 |
| 1d | 1 |

- Estrato 1 (união de 1a–1e): **181** ids · estrato 2: **1** · estrato 3: **570**.
- Amostra sugerida (30 % por matéria, mín. 5 / 5 % por matéria, mín. 3): médio 1 · baixo 43.

Estrato 1 por matéria:

| chave | n |
|---|---:|
| bio | 23 |
| fil | 12 |
| fis | 10 |
| geo | 12 |
| his | 12 |
| ing | 6 |
| lit | 8 |
| mat | 39 |
| por | 30 |
| qui | 10 |
| red | 7 |
| soc | 12 |

## Cobertura

- Habilidades ativas: 65; sem aula: 9; com menos de 3 itens de revisão: 10.

## Legado (informativo, fora da revisão item a item)

| grupo | itens | correta estritamente a mais longa | razão p50 | razão p90 | ≥ 1,5 | ≥ 2,0 | ≥ 3,0 | incorretas com absolutismo | itens com travessão |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| trilhas legadas (335 MC) | 335 | 229 (68.358%) | 1.216 | 2.011 | 102 | 39 | 5 | 75 | 0 |
| banco geral (59 questões) | 59 | 15 (25.424%) | 1 | 1.242 | 4 | 1 | 0 | 1 | 0 |
