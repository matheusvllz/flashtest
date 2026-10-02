---
estado: aprovado
atualizado: 2026-10-02
canonico-de: [sistema de conteudo, pacotes, versoes de item, reviewKind, itens retirados, questoes oficiais, pipeline de conteudo]
substitui: []
substituido-por: null
---

# Sistema de conteúdo

> **Como usar.** Documento canônico de **onde o conteúdo pedagógico mora, como ele é identificado, versionado, empacotado, validado e revisado**. Consolida o `30` §8, §19 e §21.3, o `34` e o `36` §G, conferidos contra o código em 29/09/2026 (contagens feitas nos arquivos). Origem de cada regra como `(NN §x)`; os números de documento são permanentes. Regras editoriais de texto pedagógico (enunciado, alternativa, gabarito, explicação) ficam em [copy/05-conteudo-pedagogico.md](../copy/05-conteudo-pedagogico.md); nenhuma skill de copy altera conteúdo pedagógico. Arquitetura geral: [visao-geral.md](visao-geral.md).

## 1. Fontes

| Fonte | Onde | Tamanho (29/09/2026) | Observação |
|---|---|---|---|
| Banco geral legado | `src/data/questions.ts` | 59 questões (`q1`…`q59`; o arquivo tem 60 ocorrências de `statement:` porque uma é a declaração do tipo `Question`, conferido em 02/10/2026, DV50-05) | Usado pelo `/study`; gabarito distribuído entre A–E |
| Trilhas de redação e português | `src/content/trilhas/` | 15 trilhas, 134 lições, 1.204 exercícios | Motor em `src/lib/lessons/`; entram na trilha como capítulos legados (25 §6.2). Ordem de desbloqueio = ordem de `TRILHAS` (`trilhas/index.ts`) |
| Microlições autorais | `src/content/microlicoes/{biologia,matematica,portugues}/` | 6 microlições, 38 exercícios (`mc:*`) | Formato `MicroLessonV2` com passos (25) |
| Banco gerado (pipeline) | `src/content/banco/<materia>/<skillId>.json` | 737 itens de IA em 12 matérias | Versionado; é a entrada dos pacotes (§3) |
| Questões oficiais | `src/content/banco/oficial/<ano>-<materia>.json` e imagens em `src/content/banco/oficial/img/<ano>/` | ver contagem no §7.1 (ENEM 2019–2025, sem 2021; 18 transcritas à mão em 2023 + as do importador do INEP) | Texto oficial, regras do §7 |
| Aulas geradas | dentro dos JSON do banco | 48 aulas | Índice em `src/content/banco/aulas-geradas.ts` |
| Parâmetros do Inep | `src/content/oficial/inep-parametros.json` | 379 registros | **Nada em `src/` lê**; só `scripts/content/incidence.ts` (§6) |
| Taxonomia | `src/content/taxonomy/` | 67 habilidades, 65 ativas | §5 |
| Estrutura do currículo | `src/content/curriculum.ts`, `curriculum-tree.ts` | — | `CURRICULUM_TREE`: matéria → seção → capítulo → lição (25) |
| Dicas de vestibular | `src/content/exam-tips.ts` | — | (20 §10) |

Pacotes somam 1.661 itens (737 gerados + 924 oficiais: 18 transcritas de 2023 + 906 do importador do INEP, 02/10/2026) e 48 aulas em 12 matérias (`public/content/v1/manifest.json`).

## 2. Identidade e versão de item

- **Legado:** id estável por fórmula (`src/content/exercise-ids.ts`): banco geral usa o próprio `id` (`q1`); trilha usa `<lessonId>:<índice do exercício>`. `EXERCISE_IDS` cobre os 1.263 legados (59 + 1.204); a versão começa em 1 (`exercise-ids.ts:26-28`). Reordenar exercícios dentro de uma lição ou renomear `lesson.id` muda a identidade; é regra de processo, não garantia do arquivo (20 §9).
- **Microlição:** ids `mc:*` declarados na própria meta (`src/content/items/meta/microlicoes.ts`).
- **Pacote:** `gen:<materia>:<skillId>:<hash>` para itens gerados; `oficial:<ano>:<hash>` para oficiais.
- **Versão:** `ItemMeta.version` sobe em mudança editorial relevante (em 29/09/2026: 360 itens de pacote em `version` 1 e 395 em `version` 2; os 906 oficiais do importador entram em `version` 1). A tentativa guarda `Attempt.exerciseVersion` (`src/lib/learning/types.ts:41`); tentativa antiga nunca é reescrita, e o replay usa a meta atual (36 §G.6).
- **Ordem das alternativas não muda** em revisão: quebraria `presentedOrders` de sessões ativas e letras citadas na explicação. Reescrever o texto de uma alternativa mantém o índice da correta (36 §G.6).

## 3. Índice de itens (`src/content/items/`)

- `itemMetaOf(id)` resolve a meta de qualquer item, nesta ordem: microlição → banco geral → trilha → pacote → padrão de segurança (`items/index.ts`). Nunca lança; item sem habilidade recebe `skillIds: []` e fica fora do modelo.
- O índice reúne `EXERCISE_IDS` (1.263), as metas de microlição (38) e o índice leve dos pacotes (1.661): 2.962 ids.
- `ItemMeta` (`items/types.ts`): `id`, `version`, `skillIds` (a primeira é a principal; no máximo 3), `difficulty` 1–5, `irt {a, b, c, source}`, `roles` (`pratica` | `revisao` | `desafio` | `diagnostico`), `estimatedSeconds`, `dontKnowAllowed`, `source {kind, exam?, year?, ref?, generatedBy?}`, `validation {status, reviewer?, reviewKind?, reviewNote?}`, `examProfiles`.
- **Índice leve dos pacotes** (`src/content/banco/itens-gerados.ts`, gerado): por item, `id`, matéria, habilidades, dificuldade, `a/b/c`, papéis, `status`, `source` (só quando não é `ia-validada`) e `retired` (só quando `true`). O motor escolhe o item antes do pacote carregar; o texto chega com `ensureSubjects` (30 §21.3).
- `itemDisponivel(id)`: falso para item retirado e para item de pacote cujo pacote não está em memória. A seleção usa isso, e pacote que não carregou vira "só conteúdo embarcado" sem tela quebrada.

## 4. Pacotes e manifest

- `scripts/content/build-packs.ts` roda em `predev` e `prebuild` (`package.json`). Lê `src/content/banco/**` e escreve:
  - `public/content/v1/<materia>.<hash>.json`, um pacote por matéria (`ContentPackage {version, subjectId, items[], lessons[]}`);
  - `public/content/v1/manifest.json` (`ContentManifest {version, generatedAt, subjects: {<materia>: {path, hash, itemCount, lessonCount}}}`);
  - os índices `src/content/banco/itens-gerados.ts` e `aulas-geradas.ts`. **Nunca editar à mão.**
- **Hash por arquivo:** SHA-256 do JSON, 10 primeiros caracteres (`build-packs.ts:94-95`), no nome do arquivo. Conteúdo novo = nome novo = cache invalidado sem query string.
- **Versão da pasta:** `v1` é a versão do formato (`MANIFEST_PATH = "/content/v1/manifest.json"`, `src/lib/content/repository.ts:14`). Mudança incompatível de formato pede `v2`, não sobrescrita.
- `public/content/` é gitignorado; banco vazio gera manifest vazio sem quebrar o build.
- Carregamento: `repository.ts` com prazo de 8 s por requisição, dedupe de pedidos simultâneos, sem laço de nova tentativa; uma falha não fica gravada e a próxima chamada tenta de novo (36 T-05.4). Só `repository.ts` busca pacotes; rota nenhuma importa pacote direto (`items/package.ts`).

## 5. Taxonomia

- Fonte: `src/content/taxonomy/` (`areas.ts`, `skills/<materia>.ts`, `validate.ts`). 67 habilidades declaradas, 65 `ativo`; as `planejado` são ignoradas pelo motor.
- Documento gerado: `docs/arquitetura/taxonomia-habilidades.md`, escrito por `bun scripts/content/taxonomy-doc.ts` (caminho fixo em `taxonomy-doc.ts:13`). Nunca editar à mão; rodar o script depois de mudar a taxonomia. (46 §C.2 prevê mover a saída para `docs/arquitetura/taxonomia-habilidades.md`; até essa tarefa, o `33` continua sendo a saída.)

## 6. Dificuldade e IRT

**Três escalas, que não se unificam** (36 §G.2):

| Escala | Onde | Faixa | Uso |
|---|---|---|---|
| Editorial | `ItemMeta.difficulty` | 1–5 | Seleção por papel, promoção a diagnóstico; define `b` |
| Relativa à aula | `QuestionStep.difficulty` (`StepDifficulty`) | 1–3 | Validação de progressão da aula (não-decrescente, começa em 1, termina em ≥ 2). Derivada da editorial **e da posição**: 1→2→3 não prova aumento cognitivo |
| Modelo | `irt.a/b/c`, θ | contínua | CAT, `selectItems`, probabilidade prevista |

**`irtFromDifficulty`** (`src/content/items/irt.ts`): `a = 1`; `b` ∈ {−1,6; −0,8; 0; 0,8; 1,6} para dificuldade 1–5; `c` = probabilidade de chute pelo formato (1/nº de opções em múltipla escolha, lacuna e interpretação; 0,5 em verdadeiro ou falso; até 0,1 em encontre o erro; 0,05 em ordenar e parear). `source` continua `"estimado"` (36 §G.3).

- Itens de pacote que tinham o padrão de publicação (`a=1, b=0, c=0.2`) foram recalculados **na fonte** por `scripts/content/recalibrar-irt-dificuldade.ts` (`--check` só relata); o índice leve carrega esses `a/b/c`.
- Oficiais recebem o mesmo tratamento. Os parâmetros do Inep **não** entram no modelo: a escala Inep não foi ligada à do modelo e `calibrarB` nunca foi validado (decisão, não pendência) (36 §G.3).
- **Nunca afirmar "TRI validada"** em UI, docs ou pitch: são estimativas editoriais; nenhum item foi calibrado por dados de resposta (36 §G.2).

## 7. Questões oficiais (34)

Decisão de negócio do proprietário (23/09/2026), sem parecer jurídico formal; risco assumido conscientemente (34).

- **Permitido:** texto de questões do **ENEM** de qualquer edição, literal. Texto de apoio de terceiros dentro da questão entra como citação, com a fonte original quando o Inep a informa.
- **Obrigatório:** o ano e "ENEM" aparecem junto ao enunciado, na tela, sempre (`Exercise.fonte`, gravado como `ENEM <ano>` por `exercicioComAtribuicao`, `scripts/content/import-official-items.ts:113-114`). Nas telas com folha de feedback, a atribuição aparece também ali ("Questão do ENEM 2023", `atribuicaoOficial`, `src/content/items/atribuicao.ts`) (36 RP-10).
- **Imagens (decisão [0008](../decisoes/0008-questoes-com-imagem-e-fontes.md), revê esta linha da 0002):** figuras, gráficos, mapas e tabelas das provas do INEP entram, recortados do PDF sem retoque, com o crédito impresso preservado. Continuam **proibidos**: provas de outros vestibulares (Fuvest, Unicamp, Cebraspe e outras continuam só autorais "no estilo", sem alegar origem) e APIs comunitárias de questões como fonte.
- **Texto oficial nunca é alterado.** Revisão pode mudar só metadados (dificuldade, habilidade); se o texto precisar mudar, o item é retirado (36 §G.6).
- Fonte dos dados: microdados abertos e PDFs do Inep; nunca baixar nem versionar o arquivo de respostas de participantes (34; `src/content/oficial/README.md`).

### 7.1 Importador do INEP (spec 50 §5.9.2, T-50.9.3–9.6)

`bun run content:importar-inep -- --ano <ano>[,<ano>] [--dia 1|2] [--seco] [--relatorio]` (`content-pipeline/oficial/importar-inep.ts`; operação em [content-pipeline/README.md](../../content-pipeline/README.md)). Offline; nada em `src/` importa o pipeline.

- **Fonte:** lista versionada `content-pipeline/oficial/inep/provas.json` (ENEM regular, aplicação principal, um caderno por dia; 2023 usa o caderno 8 rosa no 2º dia, de onde vieram as 18 transcritas), com o sha256 de cada PDF.
- **Ferramenta:** `pdfjs-dist` (devDependency, versão fixada) — texto no bun; páginas desenhadas a 4× no Chromium do Playwright, recorte em WebP ≤ 80 KB até 1200 px.
- **Validação por questão:** 5 alternativas, gabarito oficial presente e não anulado, texto legível, sem caractere inválido, similaridade ≥ 0,97 entre o texto montado e o da página, alternativas sem símbolo desenhado nem fração em dois andares, figura citada e encontrada, mídia no contrato de `validarMidia`. Falhou → "não importada" com motivo no relatório (`content-pipeline/oficial/relatorios/<ano>-d<dia>.json`, versionado; `.html` com a amostra de 10% e o recorte ao lado).
- **Formato gerado:** id `oficial:<ano>:<hash8 de ref+pergunta>`, `exercise.fonte: "ENEM <ano>"`, `meta.source.ref` "ENEM \<ano\> · \<n\>º dia · caderno \<n\> \<cor\> · questão \<n\>", `validation {status: "oficial-conferida", reviewKind: "gabarito-oficial", reviewer: "importador-inep"}`, `difficulty` 3, `irt` por `irtFromDifficulty`. Habilidade por palavras-chave da área (só id ativo; confiança no relatório — "baixa" cai na habilidade geral da área e merece revisão).
- **Explicação pendente:** item importado sai com a frase fixa "Gabarito oficial: alternativa X. Peça para a Foca IA explicar o raciocínio." e `meta.explicacaoPendente: true` (campo opcional de `ItemMeta`), até a explicação gerada e marcada como IA existir (T-50.9.5).
- **Alt:** "Imagem da questão \<n\> do ENEM \<ano\> (descrição em revisão)", `altAutomatico: true`; quando a figura tem texto extraível, `descricao` "Texto na imagem: …", recusada se citar a alternativa correta ou uma letra.
- **Itens transcritos antes** (`reviewer: "solucionador-independente"`, as 18 de 2023) nunca são reescritos: o importador só compara texto e gabarito no relatório (gabarito igual nas 18; texto difere só em aspas tipográficas, parênteses que a transcrição pôs no crédito e quebras de verso).
- **Resultado (02/10/2026):** 906 importadas + 18 mantidas = 924 oficiais; por prova (dia 1 / dia 2): 2019 87/71, 2020 86/59, 2021 0/0, 2022 80/65, 2023 81+8/58+10, 2024 90/71, 2025 88/70. 257 com imagem (inclui recortes de fórmula), 16 com alternativa-imagem, 22 com tabela HTML. Classificação de habilidade: 232 alta, 444 média, 230 baixa. O dia 1 passa de 89% das elegíveis em todos os anos, exceto 2021; o dia 2 fica entre 67% e 80%, com o motivo de cada questão no relatório (fórmula, fração, recorte incompleto). Os itens do importador entram com papéis `pratica` e `revisao`, sem `diagnostico`, até a revisão da habilidade.
- **Fora:** espanhol (sem habilidade na taxonomia); ENEM 2021 inteiro (PDFs com fonte sem mapa Unicode: só com OCR); questões com fórmula nas alternativas, fração em dois andares nas alternativas, figura que cobre várias alternativas, recorte suspeito.

### 7.2 Imagens, tabelas e marcadores no item (spec 50 §5.9.3)

- `ExerciseImage {url, alt, credito?, largura?, altura?, descricao?, altAutomatico?}`; `largura`/`altura` obrigatórias em item oficial. `ExerciseTable {legenda?, cabecalho, linhas}`.
- `exercise.imagens[]`, `exercise.tabelas[]` e, na múltipla escolha, `opcoesImagem[]` (mesmo tamanho de `opcoes`; alternativa só-imagem tem `opcoes[i]` = "Alternativa X (imagem)"). `imagem` (uma só, acima do enunciado) segue por compatibilidade.
- Posição: `[[imagem:N]]` / `[[tabela:N]]` em linha própria dentro de `pergunta`/`texto` (`src/lib/lessons/marcadores.ts`); mídia sem marcador vai acima do enunciado. Trecho de fórmula que não sai em texto vira recorte (imagem do trecho) no lugar.
- Url local `/content/img/<ano>/<nome>.webp` (regra `imagem-local`; `sem-imagem-externa` continua). O `build-packs` copia `src/content/banco/oficial/img/**` para `public/content/img/` com o hash do conteúdo no nome e reescreve as urls nos pacotes; `vercel.json` serve `/content/img/(.*)` com `Cache-Control: public, max-age=31536000, immutable`. Imagem citada que não existe quebra o build.

## 8. Proveniência da revisão (`reviewKind`)

`validation.status` diz se o item **passou no portão** de revisão (é o que o pool filtra); `reviewKind` diz **quem** revisou. Os dois ficam separados de propósito: renomear `status` despublicaria itens (36 §G.5).

| `reviewKind` | Significado | Itens hoje |
|---|---|---|
| `ia-delegada` | Revisão feita por modelo, por delegação do proprietário, completa ou por amostra. **Não é revisão humana** | 737 (todos os gerados) |
| `gabarito-oficial` | Item oficial com gabarito conferido contra a fonte | 924 (oficiais: 18 transcritas, `reviewer: "solucionador-independente"`; 906 do importador, `reviewer: "importador-inep"`) |
| `autoria-legada` | Conteúdo autoral das trilhas antigas, revisado na autoria (22/26) | metas das trilhas (`items/meta/trilhas.ts:63`) |
| `humano` | Uma pessoa leu e aprovou | 0 |
| ausente | Desconhecido | banco geral e microlições (metas sem o campo) |

- Os 737 gerados têm `status: "revisada-humano"` porque o veredito da revisão delegada entrou como aprovação; o `reviewKind` corrige a leitura (36 §G.5). Marcação por `scripts/content/marcar-proveniencia.ts` (idempotente; nunca sobrescreve valor existente).
- Copy e documentos nunca dizem que o acervo foi revisado por humanos (`PRODUCT.md` → Evidence on Hand).

## 9. Itens retirados (`retired`)

- Campo opcional `retired: true` no item do pacote e no índice leve (36 §G.6). O JSON e o `status` ficam como estavam.
- Efeito: sai de pools, seleção, checkpoint e aulas novas (`itemRetirado`/`itemDisponivel`, `items/index.ts`), mas `resolveExercise` continua resolvendo, e tentativa antiga, sessão ativa e aula que o citam não quebram. Aula gerada que referenciava item retirado teve a referência trocada por item da mesma habilidade e dificuldade quando havia.
- Retirados hoje (3):
  - `gen:por:pontuacao-virgula-regras:199c1dc3`: gabarito contestável;
  - `gen:red:competencias-avaliacao-enem:a5d3abda`: enunciado ambíguo;
  - `oficial:2023:273a7d48`: gabarito D confere, mas a explicação escrita pelo Foca tinha uma equação errada. **Decisão do proprietário pendente:** autorizar editar só a explicação para reativar (texto corrigido proposto em `content-pipeline/relatorios/qualidade-2026-09/resumo-his-geo.md`) (37 §"Fase 7 — revisão editorial"; 34).

## 10. Validadores

Todos rodam fora do app. Nada em `src/` importa `scripts/content` (`tests/unit/pipeline-boundary.test.ts`).

| Script | Papel | Bloqueia? |
|---|---|---|
| `scripts/content/validate.ts` | Portão de publicação: campos e tipos à mão (sem zod), gabarito no intervalo, alternativas distintas, sem LaTeX, sem imagem externa, habilidade ativa, duplicata por 5-gramas; mais os avisos de forma | `issues` bloqueiam; avisos não (30 §19.5) |
| `scripts/content/qualidade-forma.ts` | Funções puras dos sinais de forma (36 §G.7): `tamanho-correta-maior` (≥ 2,0 alta; 1,5–2,0 média), `tamanho-correta-menor` (≤ 0,4), `dispersao-tamanhos`, `absolutismo-distratores`, `travessao-alternativa`, `posicao-lote`, `quase-duplicata` (Jaccard de bigramas ≥ 0,4), `explicacao-cita-alternativa-errada` | Não: são **avisos** com severidade `alta`/`media`/`info` |
| `scripts/content/auditar-qualidade.ts` | Auditoria só de leitura de todo o acervo: métricas de forma, inventário por origem, área, habilidade, dificuldade, papel, status e `reviewKind`, cobertura, estratos de revisão. Determinística | Não |

- Exceções de aviso registradas por id e regra em `content-pipeline/excecoes-qualidade.json` (`{id, regra, motivo, registradoEm}`).
- Rubrica editorial R1–R8 (gabarito único, explicação coerente, enunciado sem ambiguidade, distratores plausíveis, paralelismo de forma, habilidade medida, dificuldade coerente, português correto); falha em R1–R3 bloqueia (36 §G.6).
- Resultado da rodada de 28/09/2026: 665 itens revisados (`ia-delegada`), 3 retirados, "correta estritamente a mais longa" de 52 % para 18,6 % (`content-pipeline/relatorios/qualidade-2026-09/`). Os 1.204 exercícios legados ficaram fora da revisão item a item.

## 11. Pipeline de conteúdo

Offline, fora do app (30 §19.1). Operação: [content-pipeline/README.md](../../content-pipeline/README.md). Chaves `CONTENT_LLM_*` ficam no `.env` de quem roda, nunca no bundle nem na Vercel.

Estágios (30 §19.2): 0 planejar (`coverage.ts`, `plan-batch.ts`) → 1 gerar → 2 criticar → 3 resolver **sem ver o gabarito**, de preferência com modelo de outra família → 4 verificar (determinístico) → 4b escalar só em conflito → 5 humanizar só explicação e ensino, com `humanize-guard.ts` descartando a versão que mude número, fórmula, nome, data, alternativa, gabarito, termo técnico ou negação (30 §19.4) → 6 validar → 7 amostrar → 8 publicar (`publish.ts`, idempotente, em `src/content/banco/`).

**Portões** (30 §19.2, §19.6):

- Solução independente e gabarito precisam concordar com confiança ≥ 0,8; senão, escalonamento.
- Amostra humana de 10 % do lote (mínimo 10) e 100 % do que passou por 4b; reprovação > 5 % devolve o lote ao estágio 2.
- Conflito no estágio 4 > 15 % ou reprovação > 5 % bloqueia a onda até revisar o prompt.
- Na prática das Ondas 0 e 1, a amostra humana foi substituída pela revisão completa delegada (7b, Sonnet), por decisão do proprietário (32 F11.5; `content-pipeline/README.md`).

Dois modos com os mesmos arquivos: **Modo A** (subagentes do Claude Code por estágio, sem chave no repo; o usado de fato) e **Modo B** (`run-stage.ts` contra endpoint compatível com a API da OpenAI; testado em `tests/unit/pipeline-e2e.test.ts`) (30 §19.3).

## 12. Depois do plano 46: o que fica estático

**Todo o conteúdo continua estático** (46 §E.4): banco de questões, pacotes `public/content/v1/`, lições, trilhas de redação, taxonomia, cursos e universidades. Não há conteúdo no banco de dados, salvo se um dia houver autoria dinâmica (fora do escopo).

O servidor **importa o mesmo índice de itens** (`src/content/items`) para validar tentativas: aceita a tentativa só se `item_id`/`item_version` existirem no índice e **recalcula a correção pelo gabarito**, sem confiar no cliente (46 §E.2, §E.4).

Recomendação (não está escrita no 46): toda mudança de gabarito ou de texto de um item deve vir com `version` nova, porque o servidor vai validar pelo par `item_id`/`item_version`.
