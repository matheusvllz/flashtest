---
estado: aprovado
atualizado: 2026-09-29
id: 34
decidido-por: proprietário (23/09/2026)
substituido-por: "parcialmente pela 0008 (imagens, outras bancas, APIs comunitárias)"
---

> **Decisão 0002 (antigo documento 34).** Mantida com o texto original abaixo. Contexto da iniciativa: [../historico/iniciativas/30-31-32-aprendizagem-adaptativa/resumo.md](../historico/iniciativas/30-31-32-aprendizagem-adaptativa/resumo.md).

# 34 — Decisão: reprodução de questões oficiais do ENEM

**Status:** F10.2–F10.5 **executadas com dado real** (25/09/2026) — o usuário autorizou nesta sessão que a própria IA pesquisasse e baixasse o CSV oficial e transcrevesse questões reais, e que decidisse sozinha quais edições/itens priorizar. Parâmetros reais de 2023 (5.526 itens) importados de `download.inep.gov.br/microdados/microdados_enem_2023.zip` (só o CSV de itens foi extraído do zip — o arquivo de respostas de participantes, ~1,7 GB, nunca foi baixado nem versionado). 18 questões reais de ENEM 2023 (LC/CH/CN/MT, dificuldade 2 a 5) transcritas de `download.inep.gov.br/enem/provas_e_gabaritos/` e publicadas em `src/content/banco/oficial/2023-*.json`. Ver "O que foi feito" abaixo para os números e o método de conferência usado (não foi o `conferirGabaritoOficial` do script, ver nota).

## A decisão, na íntegra

Em 23/09/2026, ao aprovar a execução do plano de aprendizagem adaptativa ([30](../historico/iniciativas/30-31-32-aprendizagem-adaptativa/30-plano-aprendizagem-adaptativa.md)/[31](../historico/iniciativas/30-31-32-aprendizagem-adaptativa/31-plano-execucao-aprendizagem-adaptativa.md)), o usuário respondeu à pergunta em aberto sobre reprodução de texto de questões oficiais com a seguinte mensagem, verbatim:

> "Pode executar o plano, mas uma coisa: pode pesquisar questões do enem antigas sim, mais fáceis e mais dificeis, desde que inclua qual é o ano e de qual vestibular, não tem problema juridico."

Essa é uma **decisão de negócio do dono do produto**, não um parecer jurídico formal. Nenhuma consulta jurídica foi feita neste projeto sobre o assunto — o risco é assumido conscientemente pelo usuário, informado pela leitura de que a Lei 9.610/98, art. 8º, IV, exclui "atos oficiais" (e, por extensão argumentável, provas de vestibular de instituição pública/fundação vinculada ao poder público) da proteção de direitos autorais, mesma leitura que projetos públicos de questões de vestibular já usam.

## O que a decisão cobre

| Item | Cobertura |
|---|---|
| Texto de questões do ENEM (qualquer edição, fácil ou difícil) | **Aprovado.** Pode reproduzir literalmente, contanto que o ano e "ENEM" apareçam junto ao enunciado na tela — sempre, sem exceção, para todo item importado. |
| Texto de apoio de terceiros DENTRO de uma questão do ENEM (ex.: trecho de reportagem citado no enunciado) | **Aprovado como citação**, com a fonte original citada quando o Inep a informa no material oficial. |
| Imagem, charge, gráfico ou mapa de terceiro (mesmo dentro de uma questão do ENEM) | **Não aprovado.** Continua fora — nenhuma imagem de terceiro entra no app, nem em item oficial. Um item cuja resolução dependa de imagem/charge/gráfico fica de fora da importação, registrado como "requer imagem — não importado". |
| Provas de outros vestibulares (Fuvest, Unicamp, Cebraspe/PAS, etc.) | **Não aprovado.** A decisão do usuário cobriu só o ENEM — não se estende a bancas/fundações que não têm o mesmo argumento de ato oficial. Itens desses vestibulares continuam sendo só autorais "no estilo", sem alegar origem. |
| APIs comunitárias de questões (ex.: enem.dev) | Fora de escopo desta decisão — licença/disponibilidade incertas, não usar como fonte. **Revista pela 50 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 50](../specs/50-gamificacao-e-pratica/spec.md) que a implementa for publicada; ver 50 §0.2. |

## Requisito não-negociável: atribuição visível

Todo item com `source.kind: "oficial"` precisa mostrar o ano e "ENEM" junto ao enunciado, na UI, sempre — nunca opcional, nunca só nos metadados internos. Mecanismo técnico (Fase 10, F10.5): campo `Exercise.fonte?: string` (mesmo padrão já usado por `InterpretExercise.fonte`), renderizado abaixo do enunciado pelo player.

> **Nota (28/09/2026, `36` RP-10/T-07.5 e §G.3):** a atribuição agora aparece também na **folha de feedback** ("Questão do ENEM 2023", `atribuicaoOficial(meta.source)` em `src/content/items/atribuicao.ts`, coberta por `tests/e2e/feedback.spec.ts`) nas telas que têm folha — aula, atividade e revisão; no nivelamento e no checkpoint (sem folha) fica o `exercise.fonte` no enunciado, como antes. Os parâmetros do Inep importados (`src/content/oficial/inep-parametros.json`, 379 registros a partir de 5.526 linhas do CSV) **não entram no modelo**: o `irt` dos itens oficiais é `source: "estimado"`, derivado da dificuldade editorial, e só `scripts/content/incidence.ts` lê o arquivo. O item `oficial:2023:273a7d48` está `retired: true` (o gabarito D confere, mas a explicação escrita pelo Foca tinha uma equação errada); o texto oficial não foi alterado, e reativá-lo exige que o usuário autorize editar só a explicação (`37`, seção "Fase 7 — revisão editorial").

## Rastreabilidade da fonte de dados

Parâmetros e gabaritos vêm dos [microdados abertos do Inep](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem) — dado público, sem informação de participante (nunca baixar nem versionar o arquivo de respostas de participantes, só o de itens/parâmetros). O texto das provas e os gabaritos oficiais vêm dos PDFs publicados pelo próprio Inep em `download.inep.gov.br/enem/provas_e_gabaritos/`.

## O que foi feito (25/09/2026)

O usuário autorizou explicitamente, nesta sessão, que a IA pesquisasse e baixasse o arquivo real do Inep, e que transcrevesse e escolhesse sozinha as questões, dispensando revisão humana prévia da escolha editorial ("pode tentar ainda fazer você"). Isso substitui o bloqueio registrado antes (que dizia depender só do usuário) — o restante do parágrafo abaixo é mantido por transparência histórica.

**F10.2 — parâmetros reais importados:** `download.inep.gov.br/microdados/microdados_enem_2023.zip` (524 MB) baixado, e só o membro `DADOS/ITENS_PROVA_2023.csv` (330 KB, 5.550 linhas) foi extraído do zip — o arquivo de microdados de participantes (`MICRODADOS_ENEM_2023.csv`, ~1,7 GB) nunca foi extraído nem tocado, conforme a regra deste documento. `bun scripts/content/import-inep-params.ts --csv=<...> --ano=2023` rodou de verdade: **5.526 itens importados, 24 pulados** (sem parâmetro publicado para aquele item) → `src/content/oficial/inep-parametros.json`. `bun scripts/content/incidence.ts` também rodou contra esse dado real e produziu a sugestão de incidência por habilidade (não aplicada à taxonomia automaticamente, como o script já garante).

**F10.5 — 18 questões oficiais reais publicadas:** transcritas de `download.inep.gov.br/enem/provas_e_gabaritos/2023_PV_impresso_D1_CD1.pdf` (Linguagens/Ciências Humanas, caderno 1 azul) e `..._D2_CD8.pdf` (Ciências da Natureza/Matemática, caderno 8 rosa), casadas com os gabaritos oficiais correspondentes (`2023_GB_...pdf`). Critério de seleção: só itens 100% texto (nenhum com imagem/charge/gráfico/mapa, conforme a regra deste documento), cobrindo as 4 áreas (LC/CH/CN/MT) e dificuldade de 2 a 5. Publicadas em `src/content/banco/oficial/2023-{por,his,geo,soc,bio,qui,mat}.json` (18 itens no total), com `fonte: "ENEM 2023"` gravado automaticamente em todos e já renderizado pelo player (`QuestionStepView.tsx`).

**Nota sobre o mecanismo de conferência usado:** `import-official-items.ts` confere o gabarito chamando um solucionador via `CONTENT_LLM_*` (Modo B) — que não estava disponível nesta sessão (ver `docs/32` Fase 11, tentativa frustrada de configurar o OmniRoute). Em vez de publicar sem checar, as 18 questões foram conferidas de outra forma equivalente em rigor: um subagente independente recebeu só pergunta+alternativas (sem o gabarito) e resolveu cada uma do zero — **18/18 bateram com o gabarito oficial do Inep**. A publicação em si reaproveitou as funções reais do script (`officialItemId`, `buildItemMetaOficial`, `exercicioComAtribuicao`, `validarFormaOficial`) via um runner descartável, não o `main()` do script (que exige a chave). Da próxima vez que houver uma chave configurada, `import-official-items.ts --input=...` roda o fluxo automatizado normalmente.

**O que continua igual:** nenhuma imagem de terceiro foi importada; provas de outros vestibulares continuam fora de escopo; APIs comunitárias de questões continuam não usadas como fonte.
