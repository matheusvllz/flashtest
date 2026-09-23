# 27 — Home como trilha visual + deploy público: especificação

**Status:** rascunho — aguardando aprovação do usuário (23/09/2026). Nada deste documento foi implementado.
**Prevalece sobre:** `25` §12.1 (layout da trilha/home) **apenas** no que diz respeito à apresentação visual de `/trilha`. Toda a lógica de domínio do `25` (árvore, regras de estado dos nós §6.3, tipos de nó §6.4, progressão §6.6, recomendação, schema v5) continua valendo e **não muda**. Também atualiza a decisão de hospedagem registrada no commit `31d7dff` (Netlify) — ver §14.
**Plano executável:** [28 — Plano de execução](28-plano-execucao-home-trilha.md). Este `27` é a norma (o quê e por quê); o `28` é a sequência de tarefas (como), escrita para uma IA executora.

---

## 1. Contexto

A Jornada V2 (`25`, implementada e registrada no `26`) fez de `/trilha` a home e montou o modelo de domínio certo: `buildTrail()` (`src/lib/learning/trail.ts:376`) devolve `TrailModel { subjects[ sections[ chapters[ nodes ] ] ], continueTarget, currentLessonId, defaultSubjectId }`, com status de nó `completed | in-progress | current | available | locked` e tipos `aula | pratica | revisao`.

A **apresentação** desse modelo, porém, é uma lista administrativa:

| Hoje (arquivo) | O que renderiza |
|---|---|
| `src/routes/trilha.tsx` | hero `surface-pauta` com `TrailHeader` + `ContinueCard`; `SubjectChips` sticky; `LearningPath` |
| `src/components/learning/TrailHeader.tsx` | `FocaSays compact` + "N dias" + `GoalRing 56` + barra de nível |
| `src/components/learning/ContinueCard.tsx` | card com "Continuar"/"Começar por aqui", título `h2`, `btn-primary` |
| `src/components/learning/LearningPath.tsx` | seções → `ChapterCard` |
| `src/components/learning/ChapterCard.tsx` | acordeão (`aria-expanded`) com lista vertical de `LessonNode` numa margem `border-l-2` |
| `src/components/learning/LessonNode.tsx` | linha: marcador 40px + título + "Aula · 6 questões · Disponível" |

Números reais do conteúdo publicado (medidos em 23/09/2026 com `CURRICULUM_TREE`):

| Matéria | Seções | Capítulos | Nós (com revisões) | Observação |
|---|---|---|---|---|
| Matemática (`mat`) | 1 | 1 (micro) | 3 | 2 lições + revisão |
| Português (`por`) | 4 | 13 (1 micro + 12 legado) | 117 | maior matéria |
| Redação (`red`) | 1 | 3 (legado) | 19 | |
| Biologia (`bio`) | 1 | 1 (micro) | 3 | |

Todos os capítulos têm `prerequisiteChapterIds = []` — **vários capítulos ficam abertos ao mesmo tempo**; bloqueio real só existe *dentro* do capítulo (pré-requisito de lição micro / ordem sequencial legada). E `currentLessonId` só aponta para lição **micro** (`fasesNaOrdemDaArvore` pula capítulos legados), então numa matéria só-legado pode não existir nó "atual".

## 2. Problema

1. **"O que eu faço agora?" não tem resposta visual imediata.** O único sinal é o `ContinueCard` no topo; na lista, o nó atual é uma linha entre linhas iguais (marcador 40px com `anim-breathe`). Não há sensação de caminho, de onde estou nem do que vem depois.
2. **A tela parece painel, não jornada.** Acordeões + linhas de texto = tela de configurações. O `18` §3 pede "papel, não painel".
3. **Marcos existem nos dados mas não aparecem.** Conclusão de capítulo, estrelas somadas e a revisão de capítulo existem no store; a trilha não os mostra como marcos.
4. **Numa matéria só-legado (Redação, e Português depois das microlições) não existe foco.** O card de continuar pode apontar para outra matéria, e a trilha selecionada fica sem "comece aqui".
5. **Deploy:** não existe hoje uma URL pública HTTPS que sirva o Foca atual (§14).

Teste do João (`14`): o João abre o app no ônibus com 60 segundos de disposição. Ele precisa ver *onde parou* e *um botão* em 1–2 segundos, sem ler lista. Isso é o que esta spec resolve — não "mais conteúdo".

## 3. Objetivos

- O1 — Em ≤ 2 s de tela, sem rolar, o aluno identifica: o nó onde está (maior, com halo), o CTA de continuar, o que já concluiu (preenchido + check) e o que vem depois (contorno / cadeado).
- O2 — A trilha é um caminho vertical em zigue-zague **orientado por dados** (`nodes.map`), igual para 3 ou 117 nós.
- O3 — Marcos determinísticos e reais: carimbo de capítulo (concluído / pendente, com estrelas somadas), revisão de capítulo como checkpoint, cabeçalho de seção.
- O4 — Identidade Foca "Rabisco na Margem": caneta azul traça o que foi feito, grafite/lápis esboça o que falta, rabiscos temáticos na margem, a Foca só onde há transição emocional.
- O5 — Mobile-first de 320 a 440 px; desktop mantém a coluna central de 440 px (decisão D-7).
- O6 — Rolagem até o nó atual ao entrar, sem brigar com a restauração de scroll do router e sem repetir a cada render.
- O7 — URL pública HTTPS do Foca atual, abrindo no celular sem login, com refresh de rota funcionando.

## 4. Não objetivos

- Não muda **nenhuma** regra de domínio: estados, desbloqueio, recomendação, XP, estrelas, schema do store (`foca.state.v3`, v5) — tudo igual ao `25`.
- Não cria economia: **sem baú, sem moeda, sem gemas, sem vidas, sem recompensa aleatória** (`16` §7, §9). "Recompensa" na trilha = marco determinístico já existente nos dados.
- Não cria novos tipos de nó (`desafio`, `checkpoint`, `boss`, `recompensa`) — o `25` §6.4 os deixou de fora por falta de conteúdo e regra; o mapeamento visual (§6.3) cobre o pedido sem inventar tipo.
- Não cria hierarquia "unidade/fase" nova: a nomenclatura do `25` (Matéria → Seção → Capítulo → Lição → passos) é mantida. "Unidade" do pedido = **Capítulo** na UI.
- Não adiciona dependência (sem GSAP, sem Framer Motion, sem lib de virtualização, sem analytics).
- Não muda o `PhoneFrame`, a bottom nav, o tutor, o player de lição, `/redacao`, `/study`, `/progress`.
- Não troca a arte da Foca (as 8 expressões ainda são o fallback neutro — `src/assets/branding/foca/README.md`).
- Não corrige o lint da base inteira (débito registrado em §16).

## 5. Requisitos funcionais

| ID | Requisito | Critério verificável |
|---|---|---|
| RF-1 | A trilha da matéria selecionada é desenhada como caminho vertical: um nó circular por lição, deslocado no eixo X pelo padrão fixo `[0, -0.5, -1, -0.5, 0, 0.5, 1, 0.5]` × amplitude, reiniciando em cada capítulo | teste unitário de `pathK`; E2E mede `boundingBox().x` dos 5 primeiros nós e confere a sequência |
| RF-2 | Nó **foco** = `model.currentLessonId` se pertencer à matéria selecionada; senão, o primeiro nó `in-progress`/`available` da matéria, na ordem da árvore; senão, nenhum | unitário de `pathFocus()` com 4 cenários (§11.2) |
| RF-3 | O nó foco é o maior da tela (76 px vs 64 px), tem halo e, logo abaixo dele, o **callout de continuar** com o único `btn-primary` da tela | E2E: exatamente 1 `.btn-primary` visível em `/trilha` |
| RF-4 | Todo nó mostra o estado em **texto visível** ao lado (legenda) e no `aria-label` `"{título} — {estado}"` (mantém A12 do `20` e o contrato dos E2E atuais) | E2E existentes de `trilha.spec.ts` passam |
| RF-5 | Nó `locked` não é link (`div aria-disabled="true"`), tem cadeado e contorno tracejado | E2E: nenhum `a` com `data-status="locked"` |
| RF-6 | Cada capítulo expandido termina num **carimbo** (marco) não interativo: pendente (tracejado, "Carimbo do capítulo · x/y") ou concluído (fundo marca-texto, "Capítulo concluído" + estrelas somadas / máximas) | unitário de `chapterMilestone()`; E2E com capítulo concluído semeado |
| RF-7 | Cabeçalho do capítulo ("Seção N · Capítulo M", título, x/y) é **sticky** dentro do próprio segmento (CSS, sem JS) e é o botão de expandir/recolher (`aria-expanded`) | E2E: clicar no título de um capítulo recolhido o expande (contrato de `trilha.spec.ts`) |
| RF-8 | Capítulo expandido por padrão ⇔ contém o foco **ou** o nó destacado (`?concluida=`) **ou** está `in-progress`; demais recolhidos | unitário de `chapterDefaultExpanded()` |
| RF-9 | Ao entrar em `/trilha`, se o bloco do foco (nó + callout) não estiver inteiro na viewport útil, a página rola até ele **uma vez** por par (matéria, foco); com `?concluida=` o alvo é o nó destacado; se o router restaurou uma posição (`scrollY > 4`) e não há `?concluida=`, não rola | E2E `trail-path.spec.ts` (§17) |
| RF-10 | Botão "Voltar para a lição atual" aparece quando o foco sai da viewport, com seta para cima/baixo conforme a posição, e rola até ele | E2E |
| RF-11 | Se o foco global (`continueTarget`) está em **outra** matéria, aparece acima da trilha uma dica secundária (link de texto, não botão primário): "A Foca recomenda: {título} · {matéria}" | E2E com Biologia selecionada e foco em Matemática |
| RF-12 | Matéria sem nada pendente mostra o fim de trilha: Foca `orgulhosa` + "Você fechou tudo o que está publicado em {matéria}." + `btn-outline` "Praticar" → `/study` | E2E com matéria semeada como concluída |
| RF-13 | Matéria sem conteúdo continua caindo no `EmptyState` existente | unitário/E2E existente (`LearningPath` T-25 g) |
| RF-14 | Voltar de uma lição (`?concluida=`) destaca o nó concluído (pop), o próximo nó liberado (pop com 200 ms de atraso — comportamento atual do `ChapterCard`) e traça o conector entre eles | E2E: classe `anim-pop-in` no nó e `path-connector--draw` no conector |
| RF-15 | Celebração de capítulo (`ChapterCompleteSheet`, `?capitulo=`) e meta diária continuam exatamente como hoje | `chapter-complete.spec.ts` passa sem mudança |
| RF-16 | Topo enxuto só com métricas que o store sustenta: sequência (`progress.streak`), meta do dia (`GoalRing`, `completedBlockIds/dailyLessons`), nível + XP (`nivelDeXp`). Nada de energia, moeda, vidas | revisão de código + E2E existente ("Nível N", "N dias") |

## 6. Requisitos de UX

### 6.1 Princípios extraídos das referências (e o que o Foca faz com cada um)

As três capturas do Duolingo anexadas ao pedido foram usadas **só** como referência estrutural:

| Princípio observado | Como aparece na referência | Tradução Foca |
|---|---|---|
| Caminho vertical com ritmo lateral | nós deslizam em curva suave esquerda↔direita, nunca aleatório | padrão fixo de 8 posições, amplitude em % da largura (RF-1) |
| "Você está aqui" inconfundível | nó atual com anel e etiqueta "START" | nó foco 76 px + halo "respirando" + callout com a Foca e o CTA **abaixo** do nó (zona do polegar) |
| Feito vs. por fazer | feitos = cor cheia + check; futuros = cinza + cadeado | feitos = tinta de caneta (`bg-mar` + check) e conector sólido; por fazer = contorno de grafite; bloqueado = papel `gelo`, cadeado, borda tracejada, conector pontilhado de lápis |
| Marco à frente | baú e troféu lateral ligados ao caminho | **carimbo do capítulo** no fim de cada capítulo (determinístico; sem baú, `16` §9) e o nó de revisão como checkpoint |
| Contexto fixo | faixa "Seção 2, Unidade 6" no topo | cabeçalho do capítulo sticky dentro do segmento |
| Personagem e cenário | mascote e objetos espalhados | **rabiscos de margem** temáticos por matéria (%, x², à, ¶…), em lápis claro; a Foca **uma vez**, no callout (a transição "retomar") — nunca espalhada (`15` §4) |
| Atalho de volta | botão ↑ no canto | botão "Voltar para a lição atual" à esquerda (o canto direito é do FAB do tutor) |

O que **não** vem da referência: formato 3D de moeda, verde, baús, cones/obras, ícones proprietários, etiqueta "START", barra de gemas/vidas.

### 6.2 Estrutura da tela (de cima para baixo)

```
┌ TrailHeader (vira barra de métricas, NÃO sticky) ───────────────┐
│  [▮ 5 dias]   (◔) 1/3 hoje      Nível 3 ▬▬▬▬▬▭ 120/200         │
├ SubjectChips (sticky top-0, já existe) ─────────────────────────┤
│  (Matemática 0/3) (Português 4/117) (Redação 0/19) (Biologia)   │
└──────────────────────────────────────────────────────────────────┘
   RecommendationHint (só se o foco global estiver em outra matéria)
   ─ SEÇÃO 1 ─ Números e proporção ▬▬▭▭ 1/2      (SectionHeader, existe)
 ┌ ChapterBanner (sticky dentro do segmento) ───────────────────┐
 │ SEÇÃO 1 · CAPÍTULO 1   Porcentagem              1/2      ⌄   │
 └──────────────────────────────────────────────────────────────┘
 %                (✓)  O que é porcentagem · Concluída ★★☆
                   ┊ (conector sólido — caneta)
          (◎)  ← nó foco 76px, halo
   ┌ callout ──────────────────────────────────────────────────┐
   │ (foca) "Bom dia. Uma lição e você fecha a meta."           │
   │ CONTINUAR                                                   │
   │ Aumento e desconto percentual                               │
   │ Porcentagem › Números e proporção · Aula · 6 questões       │
   │ [            Continuar            ]  ← único btn-primary    │
   └────────────────────────────────────────────────────────────┘
                (↻) Revisão · Porcentagem · Bloqueada
                   ┊ (pontilhado — lápis)
                [carimbo] Carimbo do capítulo · 1/2
```

### 6.3 Mapeamento domínio → visual (não cria tipo novo)

| Dado real | Componente visual | Observação |
|---|---|---|
| `TrailNode.kind === "aula"` | nó lição, ícone `BookOpen` | igual ao `25` §6.4 |
| `TrailNode.kind === "pratica"` | nó prática, ícone `PenLine` | inclui todas as lições legadas de redação/português |
| `TrailNode.kind === "revisao"` | nó **checkpoint**: mesmo círculo, anel duplo (borda + `outline` 2px com offset 3px), ícone `RotateCcw`, legenda "Revisão do capítulo" | opcional/bônus, não conta no x/y (`25` §7.5) |
| capítulo terminado (`isChapterCompleted`) | **carimbo** do capítulo (`ChapterMilestone`) | "recompensa" = marco; cor marca-texto permitida em marco (`DESIGN.md` Colors) |
| estrelas por lição (`completedLessons[id].stars` / `progress.lessons[id].stars`) | 3 estrelinhas na legenda do nó concluído; soma no carimbo | já existe |
| seção | `SectionHeader` existente como divisor não-sticky | já existe |
| `?concluida=` | destaque pop + traço do conector | RF-14 |
| `?capitulo=` | `ChapterCompleteSheet` | sem mudança |

### 6.4 Estados do nó (visual + texto + interação)

Precedência de status é a do `25` §6.3 (não muda). "Foco" é uma camada **por cima** do status (RF-2): um nó foco pode ter status `current`, `in-progress` ou `available` (este último no caso de matéria só-legado).

| Estado | Círculo (64 px; foco 76 px) | Ícone | Legenda visível (`text-xs`) | Interação |
|---|---|---|---|---|
| `completed` | `bg-mar`, texto branco, aresta `0 4px 0 var(--color-mar-fundo)` | `Check` (ou `RotateCcw` se `reviewDue`) | título + "Concluída" (ou "Concluída · revisão sugerida") + ★★☆ | `Link` |
| foco (`current`/`in-progress`/`available`) | `bg-cards`, borda 4px `mar`, aresta `mar-fundo`, **halo** (anel 3px `mar` a 35%, 10px fora, `anim-halo`) | ícone do tipo em `mar-fundo` | só o estado ("Continuar daqui" / "Em andamento" / "Disponível") — o título está no callout | `Link` |
| `in-progress` (sem foco) | `bg-cards`, borda 2px `mar`, aresta `gelo` | ícone do tipo em `mar-fundo` | título + "Em andamento" | `Link` |
| `current` sem foco | não ocorre (só existe um `current`, e ele é sempre foco quando está na matéria) | — | — | — |
| `available` | `bg-cards`, borda 2px `abismo`, aresta `gelo` | ícone do tipo em `abismo` | título + "Disponível" | `Link` |
| `locked` | `bg-gelo`, borda 2px **tracejada** `pelo`, sem aresta | `Lock` em `nevoa` | título (`text-nevoa`) + "Bloqueada" | `div aria-disabled="true"`, sem hover/active |

Estado nunca depende só de cor: ícone + legenda textual + `aria-label` + borda (sólida/tracejada) mudam juntos.

### 6.5 Onde a Foca aparece nesta tela (`15` §4)

| Lugar | Expressão | Regra |
|---|---|---|
| Callout do foco | a do `TrailHeader` atual: `acolhedora` se `diasSemAtividade ≥ 2`; `orgulhosa` se meta fechada; senão `neutra` — fala via `fala(slot)` (`retorno` / `meta` / `bomdia`) | move a `FocaSays compact` do topo para o callout — **não duplica** |
| `RecommendationHint` sem foco na matéria | nenhuma | texto simples |
| Fim de trilha da matéria (RF-12) | `orgulhosa`, 72 px | transição emocional "fechei" |
| Matéria vazia | `entediada` (o `EmptyState` já faz) | inalterado |
| `ChapterCompleteSheet` | `empolgada` (já faz) | inalterado |

Nunca mais de uma Foca visível no `<main>` ao mesmo tempo (a folha de baixo fica fora do `<main>`).

### 6.6 Copy nova (voz `20` §7.1; entra em `src/lib/copy.ts` → `COPY.trilha` e no inventário `21`)

| Chave | Texto |
|---|---|
| `capituloRotulo(secao, cap)` | `Seção ${secao} · Capítulo ${cap}` |
| `proximaNestaMateria` | `Próxima nesta matéria` |
| `recomenda(titulo, materia)` | `A Foca recomenda: ${titulo} · ${materia}` |
| `irParaAtual` | `Voltar para a lição atual` |
| `carimboPendente(feitas, total)` | `Carimbo do capítulo · ${feitas}/${total}` |
| `carimboConcluido` | `Capítulo concluído` |
| `estrelas(n, max)` | `${n} de ${max} estrelas` (só `aria-label`) |
| `metaHoje(feitas, meta)` | `${feitas}/${meta} hoje` |
| `fimDaMateria(materia)` | `Você fechou tudo o que está publicado em ${materia}.` |
| `erroTitulo` | `A trilha não carregou.` |
| `erroCorpo` | `Tenta de novo. Seu progresso está salvo neste aparelho.` |
| `tentarDeNovo` | `Tentar de novo` |
| `abrirCapitulo(titulo)` / `fecharCapitulo(titulo)` | `Abrir ${titulo}` / `Recolher ${titulo}` (só `aria-label` quando necessário) |
| `rabiscos` | glifos por matéria (§11.4) — decorativos, `aria-hidden` |

Strings existentes reaproveitadas sem mudança: `COPY.trilha.continuar`, `comecarAqui`, `estados.*`, `kinds.*`, `capituloBloqueado`, `questoes`, `praticar`, `secao`.

### 6.7 Estados da tela

| Estado | Quando | O que aparece |
|---|---|---|
| **Carregando** | a rota é `ssr: false`: entre o HTML do servidor e a hidratação no celular | `TrailSkeleton` como `pendingComponent` da rota: barra de métricas + 4 chips + 6 círculos no mesmo zigue-zague (`skeleton`), sem spinner. Se o TanStack Start não renderizar o `pendingComponent` no SSR com `ssr:false`, registrar a divergência no registro de execução e seguir (o estado do store é síncrono — `hydrate()` lê `localStorage` —, então não há carregamento de dados depois da hidratação) |
| **Erro** | exceção ao montar o modelo/tela | `errorComponent` da rota: Foca `entediada` + `erroTitulo` + `erroCorpo` + `btn-primary` "Tentar de novo" (`router.invalidate(); reset()`) + `btn-ghost` "Praticar" |
| **Vazio (matéria sem conteúdo)** | `LearningPath` já trata | `EmptyState` existente |
| **Fim da matéria** | nada pendente na matéria | RF-12 |
| **Primeira vez** | nenhuma lição concluída | callout com rótulo "Começar por aqui" (já é assim no `ContinueCard`) |
| **Retorno após sumir** | `diasSemAtividade ≥ 2` | Foca `acolhedora` no callout, sem cobrança |
| **Offline** | o conteúdo da trilha é empacotado no bundle e o estado é local | não se aplica à trilha. O único recurso de rede é o tutor, que já tem fallback local |

### 6.8 Movimento (direção via skill `motion-design`; implementação em CSS)

Personalidade única: **"papel brincalhão"** — `--ease-out` (`cubic-bezier(0.2,0.8,0.2,1)`) para 80% dos movimentos, `--ease-bounce` só para o "pop" de conquista. Paleta de durações: **180 ms** (toque), **260 ms** (mudança de estado), **400 ms** (traço/celebração). Nada acima de 400 ms fora do halo ambiente (`16` §5: transições ≤ 300 ms; o traço de 400 ms não é transição de tela).

| Elemento | Intenção | Gatilho | Propriedades | Duração / easing | Reduced motion |
|---|---|---|---|---|---|
| Halo do nó foco | "é aqui" (camada ambiente) | contínuo, só no foco | `transform: scale(1→1.08)` + `opacity (.55→.25)` do anel (não do nó) | 2.4 s, `ease-in-out`, infinito | parado (regra global de `styles.css`) — o anel continua visível, estático |
| Toque em nó | resposta tátil | `:active` | `translateY(4px)` + aresta some | 80 ms `ease` (padrão `btn-*`) | igual (não é animação) |
| Nó recém-concluído | "fechou" | `?concluida=` | `anim-pop-in` existente (scale .82→1 + opacity) | existente | cor/ícone já comunicam |
| Próximo nó liberado | "abriu o próximo" | `?concluida=`, 200 ms depois | `anim-pop-in` com `animationDelay: 200ms` (já existe no `ChapterCard`) | existente | idem |
| Conector recém-traçado | "a caneta passou aqui" | `?concluida=` | `stroke-dashoffset 1→0` (`pathLength=1`) | 400 ms, `--ease-out`, 120 ms de atraso | conector aparece já traçado |
| Expandir capítulo | continuidade | clique no cabeçalho | chevron `rotate(180deg)` (já existe); lista **sem** animação de altura | 180 ms | — |
| Botão "voltar para a atual" | aparecer sem roubar atenção | foco sai da viewport | `anim-pop-in` existente | existente | aparece sem movimento |
| Rolagem até o foco | orientação | entrada na tela (RF-9) / clique no botão | `scrollIntoView({ block: "center" })` | `behavior: "smooth"`; `"auto"` com reduced motion | salto instantâneo |
| Entrada de elementos ao rolar | — | — | **não existe** (decisão D-9: animar 117 nós no scroll é ruído) | — | — |

Regra do "1/3": no retorno de lição, no máximo 3 coisas se movem (nó concluído, conector, próximo nó), escalonadas em 0/120/200 ms, total < 600 ms.

## 7. Requisitos de performance

- Sem dependência nova; sem aumento do bundle de `/trilha` acima de **+8 kB gzip** em relação ao build atual (`trilha-*.js`; medir antes/depois pela saída de `bun run build`).
- DOM limitado pelos capítulos recolhidos: só capítulos expandidos renderizam nós (RF-8). Pior caso realista: Português com 1–2 capítulos abertos ≈ 25 nós.
- `buildTrail` continua em `useMemo([s])`. O `PathNode` é `memo` com **comparador próprio** (`id`, `status`, `stars`, `reviewDue`, `isFocus`, `k`, `highlight`, `highlightDelayMs`) — o `memo` atual do `LessonNode` não segura nada porque `buildTrail` recria os objetos a cada mudança do store (regra `rerender-memo` da skill `vercel-react-best-practices`).
- No máximo **um** `IntersectionObserver` na tela (o do botão "voltar para a atual", observando só o nó foco). Cabeçalho sticky é CSS puro.
- Nenhum listener de `scroll`. Nenhum `ResizeObserver`. Amplitude do zigue-zague em unidade de container (`cqi`), não medida em JS.
- `content-visibility: auto` **não** é usado nas linhas: a contenção de pintura cortaria o conector SVG, que sobe 48 px acima da linha (decisão D-10).
- Rabiscos são texto (glifos) — nenhuma imagem nova. Nenhum asset novo.
- Halo anima só `transform`/`opacity` (composição na GPU); nenhum `box-shadow` animado.

## 8. Requisitos de acessibilidade

- Cada nó interativo é um `<a>` (TanStack `Link`) com `aria-label="{título} — {estado}"`; bloqueado é `div aria-disabled="true"` com o mesmo `aria-label`.
- Estrutura: cada capítulo é `<section aria-labelledby>`; os nós ficam num `<ol>` (ordem importa); carimbo é `<li>` com `role="img"` + `aria-label` ("Carimbo do capítulo · 1/2" / "Capítulo concluído, 14 de 18 estrelas").
- Ordem de tabulação = ordem do caminho (DOM de cima para baixo), independente do deslocamento X.
- Alvo de toque ≥ 44 px: nó 64/76 px; cabeçalho de capítulo ≥ 56 px; botão "voltar" 48 px; chips existentes 36 px de altura com área horizontal ampla (inalterado).
- Foco visível: o `:focus-visible` global (outline 3px `ring`) vale para o nó; o `Link` do nó recebe `rounded-full` para o outline acompanhar o círculo.
- Contraste: legendas em `text-nevoa` só em 12 px+ (regra do `DESIGN.md`); título de nó em `text-abismo` (exceto bloqueado). Glifos de margem são decorativos (`aria-hidden`).
- `prefers-reduced-motion`: regra global de `styles.css` + `behavior: "auto"` no `scrollIntoView` (§6.8).
- 320 px sem rolagem horizontal (projeto Playwright `narrow`).

## 9. Analytics e dados

- **Nenhum analytics externo, nenhum evento novo coletado, nenhuma chave nova no store.** A tela só **lê** o que já existe (`AppState` via `useAppState()`); as únicas escritas são as que já existem hoje (`setTrailSubject`, `marcarMetaCelebrada`, `markChapterCelebrated`, `setActiveLearningSession(null)` na limpeza de sessão órfã).
- Fonte de cada dado exibido:

| Dado na tela | Fonte |
|---|---|
| estrutura, status, foco global | `buildTrail(s, hojeISO())` (`trail.ts`) |
| foco da matéria | `pathFocus(model, subjectId)` (**novo**, puro, `path-layout.ts`) |
| estrelas por lição | `TrailNode.stars` |
| carimbo | `chapterMilestone(chapter)` (**novo**, puro) sobre `TrailChapter` |
| sequência | `s.progress.streak` |
| meta do dia | `atividadeHoje(s).completedBlockIds.length` / `s.prefs.dailyLessons` |
| nível/XP | `nivelDeXp(s.progress.xp)` |

- Se no futuro houver medição, eventos candidatos (NÃO implementar agora; exigem spec própria, `20` §14/§22): `trilha_aberta`, `continuar_tocado {origem: callout|dica}`, `capitulo_expandido`, `voltar_para_atual`.

## 10. Implicações de segurança

- UI da trilha: **L1** (sem entrada do aluno, sem `dangerouslySetInnerHTML`, sem rede).
- Deploy (§14): **L2** — muda `vite.config.ts`, adiciona `vercel.json` e workflow de CI. Revisão L2 do `SDD-WORKFLOW` §6: nenhum segredo no repo, `OPENAI_API_KEY` só como variável de ambiente do servidor no provedor, nunca `VITE_*`.

## 11. Arquitetura proposta

### 11.1 Arquivos

| Arquivo | Ação |
|---|---|
| `src/lib/learning/path-layout.ts` | **NOVO ARQUIVO** — funções puras de layout/foco/marco (testáveis sem DOM) |
| `src/hooks/usePathFocusScroll.ts` | **NOVO ARQUIVO** — rolagem única até o foco + visibilidade do foco (um observer) |
| `src/components/learning/path/SubjectPath.tsx` | **NOVO ARQUIVO** — corpo da trilha de uma matéria (seções → segmentos → fim) |
| `src/components/learning/path/ChapterSegment.tsx` | **NOVO ARQUIVO** — cabeçalho sticky + `<ol>` de linhas |
| `src/components/learning/path/ChapterBanner.tsx` | **NOVO ARQUIVO** — botão de expandir, "Seção N · Capítulo M", x/y, mini-carimbo |
| `src/components/learning/path/PathNode.tsx` | **NOVO ARQUIVO** — círculo + legenda; substitui `LessonNode` na home |
| `src/components/learning/path/PathConnector.tsx` | **NOVO ARQUIVO** — SVG entre dois nós |
| `src/components/learning/path/ChapterMilestone.tsx` | **NOVO ARQUIVO** — carimbo |
| `src/components/learning/path/FocusCallout.tsx` | **NOVO ARQUIVO** — Foca + `ContinueCard variant="callout"` |
| `src/components/learning/path/MarginDoodle.tsx` | **NOVO ARQUIVO** — glifo de margem |
| `src/components/learning/path/JumpToFocusButton.tsx` | **NOVO ARQUIVO** — botão flutuante |
| `src/components/learning/path/RecommendationHint.tsx` | **NOVO ARQUIVO** — dica de foco em outra matéria |
| `src/components/learning/path/SubjectPathEnd.tsx` | **NOVO ARQUIVO** — fim da matéria |
| `src/components/learning/path/TrailSkeleton.tsx` | **NOVO ARQUIVO** — skeleton da rota |
| `src/components/learning/path/TrailError.tsx` | **NOVO ARQUIVO** — erro da rota |
| `src/components/learning/TrailHeader.tsx` | alterar: vira barra de métricas; exporta `trailGreeting(s)` |
| `src/components/learning/ContinueCard.tsx` | alterar: props `variant`, `label`, `pointerK` |
| `src/components/learning/LearningPath.tsx` | alterar: delega para `SubjectPath` (mantém o `EmptyState`) |
| `src/routes/trilha.tsx` | alterar: nova composição, `pendingComponent`, `errorComponent` |
| `src/lib/copy.ts` | alterar: chaves do §6.6 |
| `src/styles.css` | alterar: `anim-halo`, classes `path-*` (§11.5) |
| `src/components/learning/ChapterCard.tsx`, `LessonNode.tsx` | **não apagar** nesta entrega (rollback visual trivial; ver §13). Deixam de ser usados pela home |
| `vite.config.ts`, `vercel.json` (**NOVO**), `.github/workflows/ci.yml` (**NOVO**), `package-lock.json` (remover), `.env.example`, `README.md` | deploy (§14) |

### 11.2 Contratos puros (`path-layout.ts`)

```ts
export const PATH_PATTERN = [0, -0.5, -1, -0.5, 0, 0.5, 1, 0.5] as const;
/** Amplitude em % da largura do <ol> (unidade cqi). 16 → 45px a 320, 64px a 440. */
export const PATH_AMP_CQI = 16;
export const ROW_HEIGHT_PX = 96;

pathK(index: number): number                          // PATH_PATTERN[index mod 8], index ≥ 0
captionSide(k: number): "left" | "right"              // k > 0 → "left"; senão "right"
connectorPathD(fromK: number, toK: number): string    // "M {50+16·fromK} 0 C {50+16·fromK} 48, {50+16·toK} 48, {50+16·toK} 96"

pathFocus(model: TrailModel, subjectId: string):
  { nodeId: string; scope: "global" | "subject" } | null
  // 1. model.currentLessonId existe e algum nó da matéria tem esse id → { id, "global" }
  // 2. senão, 1º nó da matéria (ordem seções→capítulos→nós) com status "in-progress" ou "available"
  //    e kind !== "revisao" → { id, "subject" }
  // 3. senão, 1º nó "revisao" com status "available" → { id, "subject" }
  // 4. senão null

chapterDefaultExpanded(chapter: TrailChapter, focusId: string | null, highlightId?: string): boolean
  // chapter.status !== "locked" && (nós contêm focusId || nós contêm highlightId || chapter.status === "in-progress")

chapterMilestone(chapter: TrailChapter):
  { done: boolean; completed: number; total: number; stars: number; maxStars: number }
  // done = chapter.status === "completed"; stars = soma de node.stars dos nós kind!=="revisao" concluídos;
  // maxStars = 3 * total

doodleFor(subjectId: string, chapterIndex: number, rowIndex: number): string | null
  // só quando rowIndex % 8 === 4; glifo = RABISCOS[subjectId] ?? RABISCOS.default,
  // índice (chapterIndex + floor(rowIndex / 8)) mod tamanho

buildChapterRows(chapter: TrailChapter, focusId: string | null, subjectId: string, chapterIndex: number): PathRow[]
  // uma linha "node" por nó (k = pathK(i)), depois 1 linha "milestone" (k = 0)
  // connector da linha i: null se i === 0; null se a linha anterior é a do foco (o callout fica entre elas);
  //   senão { fromK: k(i-1), toK: k(i), traced: nó(i-1).status === "completed" }
  // isFocus = node.id === focusId

type PathRow =
  | { type: "node"; key: string; node: TrailNode; index: number; k: number; isFocus: boolean;
      connector: { fromK: number; toK: number; traced: boolean } | null; doodle: string | null }
  | { type: "milestone"; key: string; k: 0; connector: {...} | null; milestone: ReturnType<typeof chapterMilestone> }

focusTargetFromNode(node, chapter, section, subject): ContinueTarget
  // para foco de escopo "subject" (não há ContinueTarget global pra ele):
  // { lessonId: node.id, source: node.source, title: node.title, chapterTitle: chapter.title,
  //   sectionTitle: section.title, subjectId: subject.id, href: node.href,
  //   reason: "legacy-next", explanation: "", firstTime: false }
```

### 11.3 Composição

```tsx
// src/routes/trilha.tsx (esqueleto)
<AppShell>
  <div className="bg-neve px-5 pt-6 pb-3"><TrailHeader s={s} /></div>
  <SubjectChips … />                                   {/* existente, sticky top-0 */}
  <div className="trail-page bg-neve px-5 pb-6" style={{ "--trail-sticky-top": "61px" }}>
    {hint && <RecommendationHint target={model.continueTarget} subjectName=… />}
    <LearningPath model={model} selectedSubjectId={…} highlightId={search.concluida} s={s} />
  </div>
  {chapterDoSheet && <ChapterCompleteSheet … />}      {/* existente */}
</AppShell>

// LearningPath → (vazio? EmptyState) : <SubjectPath subject focus highlightId greeting continueTarget />
// SubjectPath:
<div className="path-margin relative">
  {subject.sections.filter(sec => sec.chapters.length).map(section => (
    <Fragment key={section.id}>
      <SectionHeader section={section} />
      {section.chapters.map((chapter, ci) => (
        <ChapterSegment key={chapter.id} chapter={chapter} section={section} chapterNumber={ci + 1}
          subjectId={subject.id} focus={focus} focusTarget={…} greeting={…} highlightId={…} />
      ))}
    </Fragment>
  ))}
  {!focus && <SubjectPathEnd subjectName={subject.name} />}
  {focus && <JumpToFocusButton focusId={focus.nodeId} visible={…} onJump={…} />}
</div>

// ChapterSegment:
<section aria-labelledby={`cap-${chapter.id}`} className="relative mt-4">
  <ChapterBanner … expanded={aberto} onToggle={…} />
  {aberto && (
    <ol className="path-list" aria-label={chapter.title}>
      {rows.map(row => row.type === "node"
        ? <Fragment key={row.key}>
            <li className="path-row" data-k={row.k}>
              {row.connector && <PathConnector {...row.connector} draw={…} />}
              {row.doodle && <MarginDoodle glyph={row.doodle} />}
              <PathNode node={row.node} k={row.k} isFocus={row.isFocus} highlight=… highlightDelayMs=… />
            </li>
            {row.isFocus && <li className="path-callout-row"><FocusCallout … pointerK={row.k} /></li>}
          </Fragment>
        : <li key={row.key} className="path-row">…<ChapterMilestone … /></li>)}
    </ol>
  )}
</section>
```

### 11.4 Rabiscos de margem (glifos, `aria-hidden`)

```ts
export const RABISCOS: Record<string, readonly string[]> = {
  mat: ["%", "x²", "π", "÷"],
  por: ["à", "“ ”", "ç", "?!"],
  red: ["¶", "§", "C5", "…"],
  bio: ["DNA", "ATP", "O₂", "2n"],
  default: ["*", "~", "✓"],
};
```

Render: `font-display text-2xl font-bold text-pelo`, `rotate(-8deg)` (rotação é permitida em rabisco; proibida só no mascote), posição `left: 6%` na linha (a legenda de linhas com `k = 0` fica à direita, então a margem esquerda está livre). Em `dark`, `--pelo` já tem valor escuro.

### 11.5 CSS novo em `src/styles.css`

Só variáveis existentes (`--color-*`, `--ease-*`, `--radius*`). Nenhum hex novo. Classes (bloco completo no `28`, T-05): `path-list` (`container-type: inline-size; --amp: 16cqi`), `path-row` (altura 96px, `position: relative`), `path-node` + `[data-status]` + `[data-focus]`, `path-halo` + `anim-halo`, `path-connector` (+ `--traced`, `--draw`), `path-margin` (linha de margem em `gelo`), `@keyframes ft-halo`, `@keyframes ft-draw`.

## 12. Modelo de dados / migração

Não se aplica — nenhuma chave, tipo persistido ou migração nova. `TrailModel`/`TrailNode` não mudam; `path-layout.ts` só deriva.

## 13. Compatibilidade e rollout

- Sem nova flag: a mudança é só de apresentação da mesma rota. Rollback = reverter os commits das Fases 2–5 do `28`; `ChapterCard`/`LessonNode` ficam no código justamente para isso.
- `FEATURES.trilhaComoHome = false` continua funcionando (volta ao dashboard; nada aqui depende da flag).
- Contratos de E2E preservados de propósito (texto "Nível N", "N dias", "Começar por aqui", `h2` com o título, link exato "Continuar" com `href` da lição, chips com `aria-pressed`, clique no título do capítulo expande, "Disponível"/"Bloqueada" visíveis, `aria-label` "{título} — {estado}", link "Revisão · {capítulo}"). Se algum E2E existente precisar mudar, a tarefa do `28` que o toca diz exatamente qual asserção e por quê.

## 14. Deploy — diagnóstico e decisão

### 14.1 O que foi verificado em 23/09/2026

| Evidência | Resultado |
|---|---|
| `git remote` | `github.com/matheusvllz/flashtest` (público), `main` = `origin/main` = `88813f3` |
| GitHub Deployments API | 1 deploy **Production** do **Vercel** (`vercel[bot]`) para `88813f3`, estado "success", URL `foca-c771tr76i-foca3.vercel.app` (time `foca3`, projeto `foca`) |
| `curl` na URL do Vercel | **302 para `vercel.com/sso-api`** — Proteção de Deploy (Vercel Authentication) ligada: no celular sem login no Vercel, aparece a tela de login do Vercel |
| `vite.config.ts` | `nitro: { preset: "netlify" }` fixo (commit `31d7dff`) |
| `bun run build` (igual ao que o Vercel roda) | `dist/` contém só `_headers`, `_redirects`, `assets/`, `branding/`, `sfx/`, `favicon.ico` — **sem `index.html`**; o servidor SSR vai para `.netlify/functions-internal/` |
| Build com preset `vercel` (config temporária, apagada depois) | gera `.vercel/output/` (Build Output API v3): `static/` + função `__server.func` (Node 24) + rota `/(.*) → /__server`. Executada localmente: `/` 200, `/trilha` 200, `/learn/abc` 200 com HTML do Foca |
| `flashtest-enem.netlify.app` (URL do commit `31d7dff`) | responde 200, mas serve o **Abroad** ("Abroad — Estudar fora…"), não o Foca; `/trilha` dá 404 |
| GitHub Pages | desligado (`has_pages: false`) |
| Lockfiles | `bun.lock` (atual) **e** `package-lock.json` parado em 22/07 (sem `@playwright/test`) |
| CI | não existe `.github/` |
| Variáveis de ambiente lidas | só `OPENAI_API_KEY` (`src/lib/tutor-core.ts:133`, servidor) |

### 14.2 Causa

**Confirmada por reprodução local (o log do Vercel não pôde ser lido: sem CLI e com proteção SSO):** o Vercel instala e roda `vite build`, mas o `vite.config.ts` manda o Nitro gerar saída para **Netlify**. Não existe `.vercel/output`, então o Vercel publica o diretório de saída do preset Vite (`dist/`), que não tem `index.html` porque o app é SSR (TanStack Start). Resultado: `404: NOT_FOUND` em todas as rotas, inclusive `/`. Somam-se: (a) a proteção SSO do Vercel, que mostra login do Vercel a quem abre o link no celular; (b) o único link Netlify conhecido hoje serve outro projeto.

### 14.3 Plataforma escolhida

**Vercel**, conectado ao repo GitHub que já existe. Motivos: o app **precisa de servidor** (o tutor é uma server function que chama a OpenAI com chave secreta, e o shell HTML é SSR), então **GitHub Pages está descartado** (estático, sem função — o tutor e qualquer rota quebrariam); o projeto Vercel `foca3/foca` já recebe push do GitHub; o Nitro tem preset `vercel` nativo, validado localmente. O preset passa a ser escolhido por ambiente — `process.env.VERCEL ? "vercel" : "netlify"` — para que um site Netlify continue possível sem editar código (D-12).

### 14.4 Variáveis de ambiente

| Variável | Onde | Obrigatória? | Observação |
|---|---|---|---|
| `OPENAI_API_KEY` | Vercel → Settings → Environment Variables (Production e Preview) | não — sem ela o tutor usa o fallback local | nunca `VITE_`; nunca no repo |
| `VERCEL` | definida pelo próprio Vercel | automática | decide o preset do Nitro |

## 15. Decisões fechadas

| ID | Decisão | Motivo |
|---|---|---|
| D-1 | Não criar tipos de nó; "checkpoint" = revisão, "recompensa" = carimbo de capítulo | `25` §6.4; `16` §7/§9 |
| D-2 | Sem baú, moedas, gemas, vidas, energia | `16` §7/§9 |
| D-3 | Foco da matéria (RF-2) cobre matérias só-legado | problema 4 do §2 |
| D-4 | Callout **abaixo** do nó foco, com a Foca dentro | zona do polegar; a Foca fica na transição "retomar"; uma Foca só |
| D-5 | `TrailHeader` vira barra de métricas não-sticky | só os chips ficam fixos; economiza altura no celular |
| D-6 | Cabeçalho de capítulo sticky por CSS dentro do segmento | zero JS; contexto sempre visível |
| D-7 | Desktop mantém a coluna de 440 px, sem barras laterais | `PhoneFrame`, bottom nav e FAB são 440 px em todo o app; não há conteúdo real para laterais (sem ligas, sem missões); consistência > espaço |
| D-8 | Capítulos concluídos e não iniciados ficam recolhidos por padrão | reduz rolagem e DOM; o carimbo no cabeçalho mantém a sensação de jornada |
| D-9 | Nada de animação de entrada no scroll | ruído com dezenas de nós; `motion-design` 1/3 |
| D-10 | Sem `content-visibility` nas linhas | contenção de pintura cortaria o conector |
| D-11 | `ChapterCard`/`LessonNode` ficam no código | rollback |
| D-12 | Preset do Nitro por ambiente (`VERCEL`) | Vercel agora, Netlify possível |
| D-13 | Remover `package-lock.json` | desatualizado e conflitante; bun é o gerenciador (`CLAUDE.md`) |
| D-14 | CI roda `tsc`, testes unitários e build; lint fora até o débito da §16 ser pago; E2E fora do CI por ora | lint da base falha hoje (CRLF + formatação); E2E precisa de navegador e servidor, fica local |

## 16. Débitos registrados (fora do escopo)

- **Lint:** `bunx eslint src` falha na base com ~29 mil erros, quase todos `prettier/prettier` "Delete ␍" (checkout Windows com `core.autocrlf=true`) mais drift de formatação real; `bunx eslint .` passa de 3 min porque não ignora `.netlify/`, `.tanstack/`, `test-results/`. Correção proposta (spec própria): `.gitattributes` com `* text=auto eol=lf`, ignorar pastas geradas no `eslint.config.js`, `prettier --write` num commit isolado.
- Arte real das 8 expressões da Foca.
- E2E no CI.

## 17. Critérios de aceite globais

| ID | Critério | Como verificar |
|---|---|---|
| HG1 | Em 390×844 **e** 320×700, ao abrir `/trilha` (estado limpo), o nó foco e o link "Continuar" estão na viewport sem interação | E2E `trail-home.spec.ts` (já existe, roda nos 2 projetos) + `trail-path.spec.ts` |
| HG2 | Exatamente 1 `.btn-primary` visível em `/trilha` sem folha aberta | E2E |
| HG3 | Zigue-zague: posições X dos nós seguem `PATH_PATTERN` | unitário + E2E (`boundingBox`) |
| HG4 | Todo nó tem estado em texto visível e `aria-label` "{título} — {estado}"; nó bloqueado não é link | E2E |
| HG5 | Usuário semeado no meio de Português (capítulo "Crase sem medo" 3/6 concluído) cai com o foco na viewport; recolher/expandir outro capítulo depois **não** rola de novo | E2E |
| HG6 | Botão "Voltar para a lição atual" aparece ao rolar para longe e traz o foco de volta | E2E |
| HG7 | Sem rolagem horizontal em 320, 375, 390, 430, 768, 1280 e 1440 de largura | E2E (loop de viewports) |
| HG8 | `prefers-reduced-motion: reduce` → halo sem animação (`animationIterationCount` "1") e rolagem sem `smooth` | E2E com `emulateMedia` |
| HG9 | No máximo 1 imagem da Foca dentro de `<main>` | E2E |
| HG10 | Nenhum hex literal e nenhuma dependência nova nos arquivos tocados | `git diff` + `grep -nE "#[0-9a-fA-F]{3,6}\b" src/components/learning/path` vazio; `package.json` sem novas deps |
| HG11 | Suite existente intacta: `bunx tsc --noEmit`, `bun test tests/unit` (257 + novos), `bunx playwright test` (33 + novos), `bun run build` | saída real no registro |
| HG12 | Retorno de lição: nó concluído e próximo nó com pop; conector traçado | E2E |
| HG13 | Carregando/erro/fim de matéria implementados conforme §6.7 | E2E (fim) + revisão de código (erro) + curl do HTML do servidor (skeleton) |
| DG1 | `VERCEL=1 bun run build` gera `.vercel/output/config.json`; `bun run build` sem a variável continua gerando `.netlify/` | comando + `ls` |
| DG2 | Workflow de CI verde no GitHub no commit final | `gh run list` |
| DG3 | URL pública HTTPS abre `/` e `/trilha` (inclusive com refresh) num celular **sem login no Vercel**; assets e sons carregam | manual pelo usuário (Chrome Android + Safari iOS), registrado |
| DG4 | Tutor responde (com chave) ou cai no fallback (sem chave) em produção | manual |
| DG5 | Nenhum segredo no repositório | `git grep -n "sk-"` vazio; revisão L2 |

## 18. Edge cases

| Caso | Comportamento |
|---|---|
| Matéria com 1 nó | 1 linha (k=0) + carimbo; sem conector |
| Foco é o último nó do capítulo | callout abaixo dele; linha do carimbo sem conector |
| Foco é uma revisão | halo + callout normais; rótulo do tipo "Revisão do capítulo" |
| `currentLessonId` em outra matéria e a matéria selecionada sem pendências | sem foco local → `SubjectPathEnd` + `RecommendationHint` |
| `?concluida=` de lição de outra matéria | o efeito existente troca a matéria selecionada (`trilha.tsx` efeito b) antes de destacar |
| `?concluida=` com id inexistente | ignora destaque; comportamento normal |
| Capítulo `locked` (não existe hoje, mas o código suporta) | cabeçalho com cadeado, não expande |
| Título longo (ex.: "Fonologia, Acentuação e Ortografia") | legenda com `line-clamp-2`; título completo continua no `aria-label` |
| 320 px com legenda à esquerda | largura da legenda calculada pelo espaço livre do lado (`50cqi + amp·|k| − raio − 16px`, máx. 180 px) — conta no `28`, T-05 |
| Dark mode | só tokens; conector/halo via `var()` |
| Sessão ativa órfã | limpeza existente (efeito d de `trilha.tsx`) mantida |
| Zoom 200% | layout em `cqi` escala; conferir manualmente (fora do E2E) |
| Voltar pelo botão do navegador | `scrollRestoration` do router restaura; RF-9 não rola por cima |

## 19. Riscos

| Risco | Mitigação |
|---|---|
| E2E existentes quebrarem por mudança de DOM | contratos listados em §13; tarefas do `28` citam as asserções afetadas |
| Callout fora da viewport a 320×700 | alvo da rolagem é o bloco nó+callout (`data-path-focus-block`), não só o nó |
| `pendingComponent` não aparecer no SSR com `ssr:false` | tarefa marcada como verificável; se falhar, registrar e seguir (não bloqueia) |
| Vercel ignorar `.vercel/output` e servir `dist` mesmo assim | `vercel.json` fixa build/install; verificação DG3; plano B: Framework Preset "Other" no painel |
| Proteção SSO continuar ligada | passo manual explícito no `28` (T-27) |
| IA executora "melhorar" o design por conta própria | `28` proíbe decisões fora desta spec; divergência vai para o registro |
| Lint quebrado mascarar erro real | CI roda `tsc`; lint pontual nos arquivos tocados com `--rule 'prettier/prettier: off'` |

## 20. Checklist final

- [ ] Todos os `T-xx` do `28` com evidência
- [ ] Todos os `HG*` e `DG*` com evidência (DG3/DG4 pelo usuário)
- [ ] `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`
- [ ] Registro de execução `29-registro-execucao-home-trilha.md` escrito; `docs/00-README.md` atualizado
