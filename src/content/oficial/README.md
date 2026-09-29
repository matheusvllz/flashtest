# Parâmetros oficiais do Inep (docs/30 §12.4, Fase 10)

Só números/códigos — sem dado pessoal, sem reprodução de enunciado (isso é `src/content/banco/oficial/`, F10.5). Nunca versionar microdados de PARTICIPANTES, só o arquivo de itens.

## Importações

- 2023: 5526 linha(s) do CSV importada(s) (o mesmo item aparece repetido entre cadernos/versões de prova), 24 pulada(s) (sem parâmetro publicado) — de `C:/Users/mathe/AppData/Local/Temp/claude/c--Users-mathe-Documents-foca/4f7525e5-6eeb-42d9-ba90-ae195243ac18/scratchpad/inep/ITENS_PROVA_2023.csv`, em 2026-09-25. Fonte: [microdados abertos do Inep](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem).

## O que o arquivo realmente guarda (docs/36 T-07.5)

- **`inep-parametros.json` tem 379 registros** (1 por `ano + coItem`; a importação funde por essa chave, então importar de novo não duplica). O "5526" das linhas acima é a contagem de **linhas do CSV**, não de questões: itens repetidos entre cadernos contam várias vezes. Nem os 379 são questões utilizáveis — são só parâmetros numéricos; o texto das 18 questões oficiais em uso está em `src/content/banco/oficial/`.
- **Nada em `src/` lê este arquivo.** Os parâmetros não entram no modelo (o `irt` dos itens oficiais é `source: "estimado"`, derivado da dificuldade editorial — `docs/36` §G.3); só o script `scripts/content/incidence.ts` o usa, para incidência por habilidade.
