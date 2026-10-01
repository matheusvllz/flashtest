---
estado: em-execucao
atualizado: 2026-09-30
iniciativa: 48
---

# 48 — Desempenho no celular: medição (T-48.9.1) e correções (T-48.9.2)

## Cenário (fixo e repetível)

- Ferramenta: `bun scripts/desempenho/medir.ts --url=http://localhost:3200 --runs=3` (Playwright + CDP; sem dependência nova).
- Build de **produção** local: `NITRO_PRESET=node-server bun run build`, `PORT=3100 NODE_ENV=production node .output/server/index.mjs`, compressão brotli pelo `scripts/marketing/proxy-comprimido.ts` (porta 3200), como a Vercel faz na borda. Sem variáveis de conta (modo de demonstração; entrada pelo cookie `foca_demo=1`).
- 390×844, toque, DPR 2, **CPU 4× mais lenta**, **rede "4G lenta"** (150 ms, 1,6 Mbit/s de descida, 750 kbit/s de subida), cache vazio, mediana de 3.
- Métricas: FCP, LCP, JS transferido (bytes comprimidos de scripts), total transferido, soma das tarefas longas (parte acima de 50 ms) até a rede ficar ociosa + 1,5 s; na aula de 60 s, latência de uma interação (toque na alternativa + "Responder" até o feedback aparecer).

**Limitações:** emulação num desktop não é um celular real (memória, GPU e rede variam); os números servem para comparar antes e depois **no mesmo cenário**, não como valor absoluto. Arquivos brutos: [desempenho-antes.json](desempenho-antes.json), [desempenho-depois.json](desempenho-depois.json).

## Linha de base (30/09/2026, working tree da 48 antes da T-48.9.2)

| Rota | FCP | LCP | JS | Total | Tarefas longas | Interação |
|---|---|---|---|---|---|---|
| Landing `/` | 1.328 ms | 2.036 ms | 174 KB | 330 KB | 884 ms | — |
| Quiz `/quiz` (aparelho novo) | 2.728 ms | 2.728 ms | 207 KB | 290 KB | 87 ms | — |
| Trilha `/trilha` | 3.380 ms | 3.380 ms | 424 KB | 522 KB | 238 ms | — |
| Aula de 60 s `/study` | 3.552 ms | 3.552 ms | 415 KB | 507 KB | 263 ms | 231 ms |

### Gargalos encontrados

1. **Conteúdo de redação baixado por quem não vai usá-lo.** `trilhas-*.js` tem **158 KB comprimidos** (o texto de todas as lições de redação e base de português). Ao abrir o app, o store dispara o *bootstrap* do modelo adaptativo (`agendarBootstrapAdaptativo` → `import("@/lib/adaptive/bootstrap")` → itens → `exercise-ids` → trilhas) **sempre que a versão do modelo está desatualizada — inclusive sem nenhuma resposta para reprocessar**. Medido com o estado de um aluno que já tem o perfil salvo e nenhuma resposta: o `/quiz` baixava **396 KB** de JS.
2. **A trilha precisa do conteúdo de redação para desenhar a tela inicial** (14 módulos importam `@/content/trilhas`, inclusive o planejador). Separar metadados (ids, títulos, contagem e habilidades por exercício) do texto dos exercícios tiraria ~150 KB do caminho da trilha, mas mexe no motor adaptativo e no índice de itens: **registrado como pendência (B-165 abaixo), não feito aqui**.
3. **Tarefas longas na landing** (~850–880 ms somados com CPU 4×), na hidratação da página de marketing. Não investigado a fundo nesta rodada.
4. Rotas do app são renderizadas só no cliente (estado no `localStorage`, por desenho): o FCP é o tempo de baixar o JS da rota.

## Correção feita (T-48.9.2)

- `semNadaParaReprocessar` + atalho em `agendarBootstrapAdaptativo` (`src/lib/store.ts`): sem tentativas, sem modelo e sem acertos legados por matéria, o resultado do bootstrap seria `{}` (teste de equivalência em `tests/unit/mastery-bootstrap.test.ts`), então só a versão do modelo é marcada — sem baixar itens nem lições.

| Cenário | Antes | Depois |
|---|---|---|
| `/quiz` com perfil salvo e nenhuma resposta (JS transferido, rede ociosa) | **396 KB** em 21 scripts | **206 KB** em 16 scripts (−48%) |

Medição completa depois da correção (mesmo cenário; aparelho novo):

| Rota | FCP | LCP | JS | Total | Tarefas longas | Interação |
|---|---|---|---|---|---|---|
| Landing `/` | 1.348 ms | 1.968 ms | 174 KB | 330 KB | 850 ms | — |
| Quiz `/quiz` | 2.640 ms | 2.640 ms | 208 KB | 290 KB | 81 ms | — |
| Trilha `/trilha` | 3.364 ms | 3.364 ms | 423 KB | 521 KB | 250 ms | — |
| Aula de 60 s `/study` | 3.524 ms | 3.524 ms | 414 KB | 506 KB | 263 ms | 207 ms |

**Leitura honesta:** no aparelho novo (sem estado salvo) o quiz já não disparava o bootstrap, por isso a tabela geral fica dentro do ruído (±3%). O ganho é para quem volta ao quiz/landing com perfil salvo e sem respostas. **Nenhuma melhoria de FCP/LCP é declarada.**

## Pendências registradas

- **B-165** — separar metadados de lições de redação do texto dos exercícios (`trilhas-*.js`, 158 KB comprimidos no caminho da trilha). Exige mexer no índice de itens e no planejador; precisa de tarefa própria com testes do motor.
- **B-166** — investigar as tarefas longas da landing (~850 ms com CPU 4×) com perfil de desempenho.
