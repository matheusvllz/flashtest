# Pipeline de conteúdo com IA

Pipeline **offline**, fora do app (docs/30 §19, Fase 9 do docs/31). Transforma um plano de lote em conteúdo publicado em `src/content/banco/<materia>/<skillId>.json`, passando por gerador → crítico → solucionador independente (sem gabarito) → verificador/escalonamento → Humanizer com guarda de invariantes → validação → amostra humana → publicação.

**Status (28/09/2026, docs/32 e docs/37):** o pipeline **já rodou de verdade**. As Ondas 0 e 1 rodaram em 25–27/09/2026 em **Modo A** (subagentes do Claude Code por estágio; nenhum lote real usou o Modo B): 737 itens de IA publicados, mais 18 questões oficiais do ENEM 2023 (`import-official-items.ts`), somam **755 itens de pacote**; 48 aulas geradas (`aulas.ts`); pool diagnóstico promovido (`promover-diagnostico.ts`: CH 45, CN 42, LC 44, MT 40). O Modo B (`run-stage.ts`/`publish.ts`) tem teste de integração ponta a ponta contra servidor HTTP falso (`tests/unit/pipeline-e2e.test.ts`) e continua disponível. A "revisão humana" desses itens foi **delegada pelo usuário** e feita por modelo (docs/32 L349, F11.5/F11.6) — por isso o campo `reviewKind` (ver "Qualidade do acervo"). Em 28/09/2026 uma rodada de qualidade (`docs/36` Fase 7) revisou 665 itens por matéria (`ia-delegada`), retirou 3 e baixou a "correta estritamente a mais longa" de 52 % para 18,6 % (`relatorios/qualidade-2026-09/`). Continua sem revisão humana item a item.

**OmniRoute tentado e descartado neste ambiente (25/09/2026):** o usuário pediu pra tentar o gateway keyless OmniRoute pro Modo B antes de cair pro Modo A. Depois de ~50 min entre pesquisa e 3 tentativas de instalação (`npx`, e 2× `npm install -g`), o pacote provou ser um app Next.js completo (editor Monaco, embeddings via `@huggingface/transformers`), não o gateway leve anunciado — e a extração do `dist/` falhou de forma consistente no Windows (`ENOTEMPTY`/`EPERM`). Ver `docs/32` Fase 11 pro detalhe. **Modo A continua sendo o caminho recomendado neste ambiente.**

## Estágios (docs/30 §19.2)

```
0 PLANEJAR    coverage.ts + plan-batch.ts  → 01-plano.json
1 GERAR       (barato) item/aula em JSON estrito
2 CRITICAR    (barato) checklist de qualidade → aprova | corrige | rejeita
3 RESOLVER    (barato, família DIFERENTE do gerador) resolve SEM ver o gabarito
4 VERIFICAR   (determinístico, verify.ts) compara gabarito × resposta independente
4b ESCALAR    (Sonnet) só quando 4 discorda — julga, ou (raro) modelo forte decide
5 HUMANIZAR   (barato) só explicação/ensino — humanize-guard.ts descarta se mudar invariante
6 VALIDAR     (determinístico, validate.ts) campos e tipos à mão (sem zod), regras de item e avisos de forma
7 AMOSTRAR    humano revisa 10% do lote (mín. 10) + 100% do que passou por 4b
7b REVISAR    (Sonnet, só Modo A, sem script) revisão completa item a item contra enunciado e gabarito, veredito aprova/corrige/reprova; na Onda 1 substituiu a amostra de 10% (100% dos itens, revisão delegada pelo usuário, docs/32 F11.5). Também foi usada na varredura retroativa dos itens publicados antes dela existir
8 PUBLICAR    publish.ts grava em src/content/banco/, idempotente
```

## Dois modos de execução (mesmos arquivos, mesmos contratos)

### Modo A — agentes do Claude Code (recomendado, sem chave no repo)

Um orquestrador (você, ou um comando/skill futuro) lança um subagente por estágio, `model: haiku` para os estágios 1/2/3/5 e `model: sonnet` para o 4b, cada um lendo o JSONL do estágio anterior em `content-pipeline/lotes/<loteId>/` e escrevendo o seguinte. O prompt do orquestrador:

> Leia `content-pipeline/lotes/<loteId>/01-plano.json`. Para cada candidato, rode os estágios na ordem (§19.2), usando o prompt de `content-pipeline/prompts/<estagio>.md` como instrução do subagente daquele estágio. Escreva cada estágio como uma linha JSONL em `0N-<estagio>.jsonl`, no formato `Candidate` (`scripts/content/pipeline-types.ts`). Nunca deixe o solucionador (estágio 3) ver o gabarito do gerador. Pare e reporte se a taxa de conflito no estágio 4 passar de 15%.

### Modo B — script contra endpoint compatível com a API da OpenAI

```bash
bun scripts/content/plan-batch.ts --lote=onda1-01 --max=24 > content-pipeline/lotes/onda1-01/01-plano.json
bun scripts/content/run-stage.ts --lote=onda1-01 --estagio=gerar --concurrency=4 --budget-tokens=200000
bun scripts/content/run-stage.ts --lote=onda1-01 --estagio=criticar
bun scripts/content/run-stage.ts --lote=onda1-01 --estagio=resolver   # já roda verificação (4) e escalonamento (4b) por dentro
bun scripts/content/run-stage.ts --lote=onda1-01 --estagio=humanizar
bun scripts/content/publish.ts --lote=onda1-01                        # valida, escreve a amostra em 08-amostra.md e o relatório
# ler content-pipeline/lotes/onda1-01/08-amostra.md, revisar, preencher content-pipeline/lotes/onda1-01/08-amostra-verdicts.json
bun scripts/content/publish.ts --lote=onda1-01 --amostra-aprovada     # publica de verdade em src/content/banco/
```

`run-stage.ts` chama `POST ${CONTENT_LLM_BASE_URL}/chat/completions` (variáveis em `.env`, ver `.env.example` — inclui `CONTENT_LLM_MODEL_<ESTAGIO>` por estágio) e retoma sozinho de onde parou se interrompido (idempotente por `candidateId`). `plan-batch.ts` já inclui uma cota de itens papel `"diagnostico"` por habilidade (`META_ONDA_1.diagnostico`, achado real ao ligar o pipeline nesta sessão — sem isso a Onda 1 nunca alimentaria o pool que o nivelamento/checkpoint precisam, docs/30 §12.3/§13.2).

Parâmetros oficiais do Inep (docs/30 §12.4, Fase 10) — separado deste fluxo, mas usa o mesmo `.env`:

```bash
bun scripts/content/import-inep-params.ts --csv=<caminho do CSV de parâmetros> --ano=2019
bun scripts/content/incidence.ts   # relatório de incidência sugerida, NUNCA aplica à taxonomia sozinho
bun scripts/content/import-official-items.ts --input=<json de itens já transcritos>  # confere gabarito por 2ª fonte antes de publicar
```

## Contratos de arquivo

```
content-pipeline/
  prompts/*.md          instrução de cada estágio (versionado)
  schemas/*.json         gerado por schema-export.ts (versionado, sem diff quando os tipos não mudam)
  lotes/<loteId>/         GITIGNORED — dados brutos de um lote
    01-plano.json 02-gerado.jsonl 03-critica.jsonl 04-solucao.jsonl
    05-verificacao.jsonl 06-humanizado.jsonl 07-validacao.json 08-amostra.md 09-publicado.json
  relatorios/<loteId>.md  versionado — métricas do lote (docs/30 §19.6)
  relatorios/qualidade-2026-09/  versionado — auditoria de forma (baseline/ e final/), revisão editorial por grupo de matérias (lote-*.json e .md, resumo-*.md); docs/36 Fase 7
  excecoes-qualidade.json  versionado — falsos positivos conhecidos dos avisos de forma (docs/36 T-07.2)
scripts/content/
  coverage.ts plan-batch.ts run-stage.ts verify.ts humanize-guard.ts
  validate.ts publish.ts schema-export.ts pipeline-types.ts lote-io.ts
  build-packs.ts (Fase 3) import-inep-params.ts incidence.ts import-official-items.ts (Fase 10)
  aulas.ts (Fase 11 F11.3) promover-diagnostico.ts (Fase 11 F11.6)
  auditar-qualidade.ts qualidade-forma.ts marcar-proveniencia.ts (docs/36 Fase 7)
```

### Aulas geradas (F11.3, docs/30 §21.3)

`scripts/content/aulas.ts` é um orquestrador à parte do fluxo item-a-item acima — as QUESTÕES de uma aula são sempre itens já PUBLICADOS e revisados daquela habilidade (nunca item novo sem passar pelos estágios 2-7b); o LLM só escreve o ENSINO (intro/teach/tip/recap).

```
bun scripts/content/aulas.ts preparar --dir=content-pipeline/lotes/aulas   # escolhe questões por habilidade, escreve _preparo-N.json
# um agente/LLM lê content-pipeline/prompts/gerar-aula.md + _preparo-N.json, escreve _ensino-N.json
bun scripts/content/aulas.ts montar   --dir=content-pipeline/lotes/aulas   # valida com validateLessonSteps + checagens de texto (travessão/LaTeX/rascunho), escreve _aulas.json
# opcional: um agente revisa _aulas.json item a item contra o gabarito real, escreve _revisao-aulas-*.json (aprova/corrige/reprova)
bun scripts/content/aulas.ts publicar --dir=content-pipeline/lotes/aulas   # grava `lessons` nos arquivos do banco
```

### Pool diagnóstico (F11.6, docs/30 §12.3/§13.2)

`bun scripts/content/promover-diagnostico.ts [--dry-run] [--por-area=N]` — promove itens `revisada-humano` já publicados a papel `"diagnostico"` até cada área (CH/CN/LC/MT) atingir o mínimo (≥12 itens, ≥3 por faixa de dificuldade, ≥5 habilidades distintas), priorizando as habilidades menos representadas no pool.

### Qualidade do acervo (docs/36 Fase 7)

- **`status` × `reviewKind`.** `revisada-humano` significa **"aprovado no portão de revisão"** (é o que o pool filtra); **quem revisou** está em `meta.validation.reviewKind` (`humano` · `ia-delegada` · `gabarito-oficial` · `autoria-legada`; ausente = desconhecido). Nos 737 itens gerados o portão foi a revisão completa por modelo (Sonnet, delegada pelo usuário, `docs/32` L349) mais amostra, então `reviewKind = "ia-delegada"`; nos 18 oficiais, `"gabarito-oficial"`. Renomear o `status` despublicaria itens; por isso só se acrescenta o campo. `meta.validation.reviewNote` guarda o id do lote de revisão de qualidade que decidiu sobre o item.
- `bun scripts/content/marcar-proveniencia.ts [--check]` — acrescenta `reviewKind` aos JSON (idempotente; nunca sobrescreve valor existente; `publish.ts` e `import-official-items.ts` já gravam o campo em item novo).
- `bun scripts/content/auditar-qualidade.ts --out <pasta>` — só leitura: métricas de forma (razão de tamanho correta/maior incorreta, absolutismo, travessão, posição do gabarito, quase-duplicata), inventário por origem/área/matéria/habilidade/dificuldade/papel/status/`reviewKind`, cobertura e os **estratos de revisão** (`docs/36` §G.6). Grava `auditoria.json`, `estratos.json` e `auditoria.md`; determinístico (2 execuções = mesmos bytes). Linha de base em `relatorios/qualidade-2026-09/baseline/`.
- **Warnings de forma** em `validate.ts` (`{ regra, severidade, detalhe }`, nunca bloqueiam `ok`): `tamanho-correta-maior` (≥ 2,0 alta; 1,5–2,0 média), `tamanho-correta-menor` (≤ 0,4), `dispersao-tamanhos` (CV > 0,6), `absolutismo-distratores`, `travessao-alternativa`, `quase-duplicata` (bigramas ≥ 0,4), `explicacao-cita-alternativa-errada` (alta) e, por lote, `posicao-lote`. Aviso **alto** só publica com o `aprova` explícito do item em `08-amostra-verdicts.json` (a aprovação do lote por amostra não basta). Falso positivo conhecido (ex.: resposta numérica longa com unidade) registra-se em `content-pipeline/excecoes-qualidade.json` (`{ id, regra, motivo, registradoEm }`); a exceção aparece no relatório do lote, não some.
- **Item retirado:** `"retired": true` no item do JSON (ao lado de `id`/`exercise`/`meta`; o `build-packs` copia pro índice leve). Sai de pools, seleção, checkpoint e aulas novas (`aulas.ts` não escolhe), mas continua resolvível por id (tentativas antigas e aulas publicadas que o referenciam não quebram). `status` não muda.
- **Rodada editorial de 28/09/2026 (T-07.3/T-07.4).** Quatro revisores por grupo de matérias (`ia-delegada:sonnet`, delegação do docs/32 L349; **não é revisão humana** e `reviewKind` continua `ia-delegada`) deram decisão registrada por id em 665 itens (estratos 1–3 de `docs/36` §G.6, com expansão a 100 % onde a taxa de ação passou de 20 %): 3 itens `retired` (2 gerados e o oficial `oficial:2023:273a7d48`, cuja explicação escrita pelo Foca tinha uma equação errada — decisão do usuário pendente sobre editar só a explicação), 8 itens de história/geografia com dificuldade reclassificada (e o `irt` recalculado por `irtFromDifficulty`) e 4 itens de `por:interpretacao-ideia-principal` que passaram de d4 para d3 (`b` 0,8 → 0; merece conferência, é a maior mudança no modelo desta rodada). Nenhuma alternativa foi reordenada e nenhum gabarito mudou. Propostas não aplicadas (~27 reclassificações em matemática, 12 em biologia, 3 trocas de habilidade em itens diagnósticos) estão nos `resumo-*.md`.
- `bun scripts/content/build-packs.ts --root <dir>` constrói tudo dentro de `<dir>` (`banco/` de entrada; saídas em `public-content/`, `aulas-geradas.ts`, `itens-gerados.ts`) sem tocar o banco real — é o que `tests/unit/build-packs.test.ts` usa. `publish.ts` preserva as `lessons` do arquivo de banco ao republicar itens.

## Segurança

- Chaves só em `.env` local, nunca versionadas.
- `run-stage.ts` nunca loga a chave nem o corpo inteiro de uma resposta de erro.
- `scripts/content/**` nunca é importado por `src/` — checado em `tests/unit/pipeline-boundary.test.ts`.
- Enunciado/conteúdo é tratado como DADO nos prompts, nunca como instrução.

## Bloqueio automático

Um lote com taxa de conflito no estágio 4 acima de 15%, ou reprovação na amostra humana acima de 5%, **bloqueia a onda** até revisar o prompt do estágio 1/2 — não segue pra publicação sozinho.
