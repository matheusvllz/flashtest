---
estado: aprovado
atualizado: 2026-10-02
canonico-de: [mascote, expressoes da Foca, icone da marca]
substitui: []
substituido-por: null
---

# A Foca: mascote, expressões e ícone da marca

> **Como usar.** Este é o documento canônico sobre **onde a Foca aparece, com que expressão e com que regra**. Ele consolida o que estava no `15` §3–§5 (atualizado em 29/09/2026), no `44` §1 e §6 e no `45` §5, conferido contra o código. A origem de cada regra aparece como `(NN §x)`; os números de documento são permanentes. **A voz das falas não mora aqui:** texto da Foca e do tutor segue o [COPY.md](../COPY.md) e o [copy/04-foca-ia.md](../copy/04-foca-ia.md). Em conflito entre este arquivo e o código, o código é o fato e a divergência vai para o registro da iniciativa ativa.

## 1. A regra dura

Esta regra vale sobre qualquer mapeamento, fala ou peça de marketing (15 §3; 20 §7.1; 44 I-5):

1. **Cobra o comportamento, nunca a pessoa.** O comportamento é mutável; a identidade não. Cobrar a pessoa gera vergonha, e vergonha gera desinstalação (15 §3.1).
2. **A volta nunca tem cobrança.** Quem retorna depois de sumir é recebido, sem menção à ausência (15 §3.2; `copy/04` §2.2, item 3).
3. **Nunca sobre o resultado.** Errar é o produto funcionando. Quem errou 10 de 10 fez tudo certo aos olhos da Foca (15 §3.3).

Superado e fora de uso: o arquétipo "cobradora afetuosa" do `15` §0, as linhas de "streak em risco" do `15` §7 e a expressão `cobrando` como cobrança. Desde o `20` §7.1 a Foca **não cobra** ninguém; o `15` §4–§5 foi reescrito nesse sentido (`copy/04` §2).

## 2. Onde a Foca aparece

Regra de ouro: **a Foca aparece em transições emocionais, não como decoração** (15 §4).

| Momento | Presença | Origem |
|---|---|---|
| Entrada do app (`/app`, porta do produto) | Grande, `neutra` | 44 §3; `src/routes/app.tsx:32` |
| Aha do onboarding (`/aha`) | Grande, `surpresa` | 15 §4; `src/routes/aha.tsx:58` |
| Folha de feedback depois de responder | Pequena, conforme o resultado (§4) | 45 §5; `src/components/lessons/FeedbackSheet.tsx:96` |
| Fim de lição/aula | Média, conforme o desempenho | 15 §4; `src/components/lessons/CelebracaoAula.tsx:70-71` |
| Retorno depois de dias parado | Média, `acolhedora` | 15 §3.2; `src/components/learning/TrailHeader.tsx:19` |
| Estados vazios e 404 | Pequena, `entediada` | 15 §4; `src/components/ds/EmptyState.tsx:24`, `src/routes/__root.tsx:53` |
| Falha do app ou do conteúdo | `desapontada` | 44 §6; `src/routes/__root.tsx:76`, `src/components/learning/path/TrailError.tsx:26` |
| Foca IA (botão e cabeçalho do painel) | Pequena, `neutra` | 45 §5; `src/components/TutorBubble.tsx:265,282` |
| Painel da marca no onboarding e no login (≥ 1024 px) | `acolhedora` | 44 §5; `src/components/EntryShell.tsx:28` |
| **Cabeçalho de tela comum** | **Ausente** | 15 §4 |
| **Durante a questão** | **Ausente**: nada compete com o enunciado | 15 §4 **Revista pela 50 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 50](../specs/50-gamificacao-e-pratica/spec.md) que a implementa for publicada; ver 50 §0.2. |

Na landing, as telas do app refeitas em HTML usam a mesma expressão do app (motivo e tutor `neutra`, folha de erro `acolhedora`), e a demo segue o resultado (acerto `orgulhosa`, erro `acolhedora`, "Não sei" `neutra`) (45 §5; `src/marketing/components/app/screens.tsx`, `src/marketing/sections/TryOne.tsx:125`).

Notificações não existem hoje (46 §A.2). Se um dia existirem, valem as regras do §1 e as de `design/gamificacao-e-som.md` §7. **Revista pela 50 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 50](../specs/50-gamificacao-e-pratica/spec.md) que a implementa for publicada; ver 50 §0.2 e §5.8.

## 3. As 8 expressões oficiais

Arte entregue em 29/09/2026. Os nomes são oficiais e são a chave do registro `src/lib/brand/foca-expressions.ts` (`FOCA_EXPRESSIONS`, linhas 15–24), conferidos: `neutra`, `acolhedora`, `orgulhosa`, `empolgada`, `surpresa`, `entediada`, `desapontada`, `cobrando` (44 I-3). A proporção da cabeça nunca muda; mudam olhos, boca e vibrissas (15 §5).

**Padrão e fallback: `neutra`.** Valor desconhecido cai nela e nunca quebra a tela (`FOCA_EXPRESSION_DEFAULT` e `focaExpression()`, `foca-expressions.ts:29,87-89`).

| Expressão | Significado | Usar | Evitar |
|---|---|---|---|
| `neutra` | Presença calma, atenta | Padrão; `/app`; tutor; "Não sei"; introdução de lição; confirmar saída da lição | Picos emocionais em que outra diz mais |
| `acolhedora` | Tá tudo bem, vamos junto | **Erro de questão**; fim de lição com desempenho baixo; retorno depois de dias parado; painel da marca no onboarding e no login | Qualquer traço de cobrança. É a única expressão proibida de carregar cobrança |
| `orgulhosa` | Satisfação com o que o aluno fez | Acerto; fim de lição bom; meta do dia fechada; recap; sessão de hoje concluída | Antes de o aluno fazer algo (elogio vazio) |
| `empolgada` | Energia de marco | 100 % na lição; marco de sequência; capítulo concluído | Acerto comum (vira ruído); contexto de dificuldade |
| `surpresa` | Descoberta boa | Aha do onboarding; acerto difícil | Depois de erro (soa "nossa, errou isso?") |
| `entediada` | Humor leve de tela vazia | Estados vazios; 404 | Explicação, dificuldade, suporte, erro do aluno |
| `desapontada` | Algo deu errado **do nosso lado** | Falha do app ou do conteúdo (erro da raiz, trilha que não carregou) | Erro de questão, "Não sei", sair da lição, ausência, desempenho |
| `cobrando` | Olhar semicerrado de personagem | **Nenhum fluxo do aluno.** Só humor explícito, combinado com o guia de copy (ex.: peça de marketing brincando com a própria Foca) | Ausência, sequência, resultado, erro, lembretes |

Fontes: 15 §5 (tabela de 29/09/2026), 44 §6, 45 §5 e `FOCA_EXPRESSION_INFO` (`foca-expressions.ts:40-81`), que traz o mesmo conteúdo em forma de dado.

### 3.1 Mapeamento semântico no app

| Momento | Expressão | Onde (conferido) |
|---|---|---|
| Errou uma questão | `acolhedora` | `FeedbackSheet.tsx:96` |
| "Não sei" | `neutra` | `FeedbackSheet.tsx:96` |
| Acertou | `orgulhosa` | `FeedbackSheet.tsx:96` |
| Fim de lição: 100 % ou marco de sequência / ≥ 70 % / abaixo | `empolgada` / `orgulhosa` / `acolhedora` | `CelebracaoAula.tsx:69-71` |
| Capítulo concluído | `empolgada` | `ChapterCompleteSheet.tsx:33` |
| Recap de lição | `orgulhosa` | `RecapStepView.tsx:48` |
| Confirmar saída da lição | `neutra` (sair não é falha) | `LessonPlayer.tsx:361`, `MicroLessonPlayer.tsx:245` |
| Saudação da trilha: retorno (≥ 2 dias parado) / meta fechada / padrão | `acolhedora` / `orgulhosa` / `neutra` | `TrailHeader.tsx:19-21` |
| Falha do app | `desapontada` | `__root.tsx:76`, `TrailError.tsx:26` |
| Vazio, 404 | `entediada` | `EmptyState.tsx:24`, `__root.tsx:53` |

## 4. Erro nunca é punição (I-5)

**Regra permanente (44 I-5, 29/09/2026):** depois de errar, a Foca nunca aparece decepcionada, brava ou cobrando. A expressão é `acolhedora` (erro) ou `neutra` ("Não sei"). `desapontada` só aparece quando a falha é do app; `cobrando` não aparece em fluxo do aluno (15 §5; `foca-expressions.ts:8-9`).

Conferência de 29/09/2026: `desapontada` só é usada em `src/routes/__root.tsx:76` (erro da raiz) e em `src/components/learning/path/TrailError.tsx:26` (trilha que falhou); `cobrando` não é usada em nenhum arquivo de `src/` fora do registro. Não existe teste unitário que trave essa regra; quem mudar uma expressão confere com `grep -rn '"desapontada"\|"cobrando"' src`.

## 5. Ícone da marca (I-4)

**Regra permanente (44 I-4, 29/09/2026):** quando a marca aparece só como ícone (favicon, ícone de app/PWA, atalho, apple-touch, og do produto), ela é a **logo oficial sobre o azul oficial `--mar`**, lido do token, nunca um azul parecido. As expressões da mascote são contextuais e **nunca** substituem esse ícone.

- A logo oficial é a **Foca de frente colorida** (`src/assets/branding/foca/Logo Oficial.png`). Contornos e a pose de lado são variações de apoio (44 §6; 45 §6).
- Ícones gerados em `public/branding/foca/`: `favicon-16/32/48.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `og-image.png`; e `public/favicon.ico` (45 §6; listagem de 29/09/2026).
- `public/site.webmanifest` sai do mesmo gerador: `start_url: /app`, `scope: /`, `display: standalone`, cores do token `--neve` (`#f6f5f1`) (44 §7).
- Pendência do proprietário: a arte de referência "Logo Oficial Fundo Azul.png" usa a pose de lado; os ícones usam a de frente. Trocar é uma linha no gerador (45 §6, §10).

## 6. `FocaMark`: o único componente que desenha a Foca

`src/components/brand/FocaMark.tsx`. Nenhum componente monta caminho de imagem da Foca à mão (`foca-expressions.ts:4`).

| Prop | Efeito |
|---|---|
| sem `expression` | A **logo oficial** (`focaLogoSrc`, `/branding/foca/foca-color-{96,320}`) |
| `expression` | Uma das 8 expressões (`focaExpressionSrc`); só vale com `variant="color"` |
| `variant` | `color` (padrão), `line-light`, `line-dark` (contorno para marca d'água, um por tema) |
| `size` | Lado em px; até 48 px usa o derivado de 96, acima usa o de 320 (`foca-expressions.ts:92-96`) |
| `motion` | `pop`, `float`, `breathe` ou `none` (padrão). Nunca rotação **Revista pela 50 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 50](../specs/50-gamificacao-e-pratica/spec.md) que a implementa for publicada; ver 50 §0.2. |
| `decorative` | `true` tira a imagem da árvore de acessibilidade (quando o texto ao lado já diz o que ela diz) |
| `forma` | `cabeca` (padrão: tudo acima, sem mudança) ou `corpo` (a Foca de corpo inteiro, §6.1; spec 50 §5.8.2) |
| `pose` | Só no corpo: `parada`, `aceno`, `pulo`, `palmas`, `cauda`, `dormindo` (§6.1) |
| `roupa` | Só no corpo: `bone`, `oculos`, `cachecol`, `fone`, `mochila`, `coroa-conchas`. A cabeça, a logo e o ícone **nunca** recebem roupa |

Comportamentos garantidos pelo componente:

- Sempre quadrada; nunca esticada nem rotacionada (`FocaMark.tsx:3`).
- WebP com PNG de reserva via `<picture>` (`FocaMark.tsx:131-136`).
- Se a imagem falhar, a `<img>` fica `visibility: hidden` e mantém a caixa: o layout não pula e não aparece ícone quebrado; a checagem roda também depois da hidratação (`FocaMark.tsx:98-106`) (36 T-08.6).
- **Troca de expressão com a Foca na tela: "piscar".** A cabeça achata no eixo Y, a arte troca no fundo do movimento e volta com `--ease-bounce`. Nunca crossfade entre duas cabeças, nunca rotação. Com `prefers-reduced-motion`, a troca é direta (15 §5; 44 §6). No código: a arte troca aos 90 ms (`MEIO_PISCAR`, `FocaMark.tsx:43`); a animação `.foca-piscar` dura 220 ms e achata para `scale(1.03, 0.9)`, ou seja 10 % no eixo Y (`src/styles.css`, `@keyframes foca-piscar` e `.foca-piscar`, linhas 1072–1091 em 02/10/2026; citar pelo seletor, o número de linha muda). A landing usa a mesma troca (`lp-piscar`/`piscar()` do GSAP) (45 §7).

Para a Foca com fala ao lado, usar `FocaSays` (`src/components/brand/FocaSays.tsx`), que recebe `slot` de `voz.ts` e `expression`.

### 6.1 Forma corpo: a Foca de corpo inteiro (spec 50 §5.8)

**Estado (02/10/2026):** implementada (T-50.3.1, T-50.3.3, T-50.3.5) e **aguardando a aprovação do dono** da pose estática (portão T-50.3.2). Os momentos da §5.8.4 (T-50.3.4) ainda não estão ligados em nenhuma tela; até lá, nenhum fluxo usa `forma="corpo"`.

**Como chega à tela.** Sempre por `<FocaMark forma="corpo" />` (R-MASC-3: o `FocaMark` continua o único ponto que desenha a Foca). O corpo mora em `src/components/brand/FocaCorpo.tsx` e é carregado sob demanda (`import()`, chunk próprio de ≈ 4 KB gzip no build de 02/10), com uma reserva do mesmo tamanho enquanto chega: o layout não pula. A raiz e a landing nunca o importam (regra dura 9; teste em `tests/unit/foca-corpo.test.ts`). Regras puras (expressões, poses, roupas, aparelho fraco) em `src/lib/brand/foca-corpo.ts`.

**Desenho.** SVG vetorial redesenhado a partir da arte original (`src/assets/branding/foca/corpo/foca-corpo-original.jpg`), no mesmo sistema de coordenadas dela, em formas chapadas e cores dos tokens `--foca-pele`, `--foca-pele-escura`, `--foca-barriga`, `--foca-tinta`, `--foca-lingua`, `--foca-branco` (iguais no claro e no escuro: a mascote não muda de cor com o tema). Prancha de comparação: [`brand/foca-corpo-prancha.html`](brand/foca-corpo-prancha.html) (original × SVG em 64/120/200 px, claro e escuro, expressões, poses e roupas), gerada por `bun scripts/design/prancha-foca.ts`, com prévias PNG em `brand/previas/`.

**Partes articuladas** (`data-parte` no SVG; "direita" é a de quem olha a tela):

| Parte | Mexe? | Articulação |
|---|---|---|
| `figura` (o grupo inteiro) | Respira (escala 1 → 1,02) e pula (sobe e achata). **Nunca gira** | base, no centro |
| `nadadeira-esq`, `nadadeira-dir` | Giram (aceno, palmas) | o ombro, onde a nadadeira entra no corpo; a raiz fica sob o corpo |
| `cauda` | Gira (abanar) | a base da cauda, colada no corpo |
| `olho-esq`, `olho-dir` | Piscam (`scaleY`) | o centro do olho |
| `corpo`, `barriga`, `cabeca`, `manchas`, `focinho`, `boca`, `lingua` | Não (trocam com a expressão) | — |

**Rostos.** O corpo tem as 5 expressões de momento (`neutra`, `acolhedora`, `orgulhosa`, `empolgada`, `surpresa`), desenhadas como as da cabeça (§3), e o estado **`dormindo`** (olhos fechados em arco, boca pequena, "z" subindo). **Não existem no corpo** `desapontada`, `cobrando` nem `entediada`: o `FocaMark` manda essas para `neutra`. A pose `dormindo` fecha os olhos seja qual for a expressão. A `empolgada` é a arte original com um segundo brilho nos olhos.

**Poses e movimento** (§5.8.3; CSS em `src/styles/foca-corpo.css`, importado no fim de `src/styles.css`):

| Pose | Movimento | Duração | Easing |
|---|---|---|---|
| `parada` | Respiração: escala 1 → 1,02 | ciclo 3,2 s, só visível | `ease-in-out` |
| (todas com olhos abertos) | Piscar: olhos `scaleY` 1 → 0,1 → 1, intervalo aleatório 4–7 s | 180 ms | `ease-in`, volta com `--ease-bounce` |
| `aceno` | Nadadeira direita até 25°, 2 vezes | 2 × 900 ms | `ease-out` |
| `pulo` | Antecipa achatando, sobe 12 px, achata na queda `scale(1.04, 0.94)` | 600 ms | `--ease-bounce` |
| `palmas` | As duas nadadeiras sobem juntas (28°), 2 vezes | 2 × 300 ms | `ease-in-out` |
| `cauda` | Cauda até 20°, 3 vezes | 3 × 800 ms | `ease-in-out` |
| `dormindo` | Respiração lenta e três "z" subindo e sumindo | ciclo 4 s | `linear` |

Regras garantidas pelo componente e pelo CSS: só `transform` e `opacity`; a Foca inteira nunca gira, só as partes; nada anima antes de hidratar nem fora da tela (IntersectionObserver) nem com a aba oculta; **no máximo uma Foca animada por vez** (a segunda que montar fica parada); aparelho fraco (`navigator.deviceMemory` ≤ 2 ou `hardwareConcurrency` ≤ 4) e `prefers-reduced-motion` mostram só a pose final, parada, e trocam a expressão direto. A troca de expressão com o corpo na tela é a mesma do §6: pisca e troca o rosto no fundo da piscada. O "z" usa o grafite da interface (`--abismo`), que acompanha o tema.

**Roupas** (T-50.3.5; catálogo em `FOCA_ROUPAS`, sem preço — a economia é da loja): `bone` (Boné), `oculos` (Óculos), `cachecol` (Cachecol), `fone` (Fone), `mochila` (Mochila), `coroa-conchas` (Coroa de conchas). Camadas SVG em `src/components/brand/roupas/RoupaFoca.tsx`, ancoradas na cabeça ou no pescoço (a mochila tem também a bolsa atrás do corpo). Cores: `--foca-roupa-azul`, `--foca-roupa-ouro`, `--foca-tinta`, `--foca-branco` e, na coroa e no emblema do boné, `--perola`/`--perola-brilho`. Uma roupa por vez; id desconhecido não quebra (a Foca sai sem roupa).

**Momentos** (spec 50 §5.8.4, **proposta**, ligados na T-50.3.4):

| Momento | Forma e pose | Expressão |
|---|---|---|
| Fim de lição | corpo, `palmas` | `orgulhosa` |
| Lição perfeita | corpo, `pulo` + `palmas` | `empolgada` |
| Combo 5 e 10 (no feedback) | **cabeça** 48 px, `pop` | `empolgada` / `orgulhosa` |
| Acender a ofensiva | corpo, `cauda` | `empolgada` |
| Marco de ofensiva e baú | corpo, `pulo` | `empolgada` |
| Subir de nível | corpo, `aceno` | `orgulhosa` |
| Volta depois de pausa (R-VOZ-4) | corpo, `aceno` | `acolhedora` |
| Nada para revisar hoje (estado vazio) | corpo, `dormindo` | — |
| Loja (provador de roupas) | corpo, `parada` | `neutra` |
| Retrospectiva e cartões de compartilhar | corpo, `parada` | `orgulhosa` |

O que não muda (§5.8.5): erro nunca mostra `desapontada` nem `cobrando`; "Não sei" é `neutra`; a Foca continua **ausente antes da resposta**, na checagem e no simulado; nenhuma fala nova fora de `voz.ts`.

## 7. Assets e gerador

| O quê | Onde |
|---|---|
| Originais das logos | `src/assets/branding/foca/` (`Logo Oficial.png`, variações de contorno e de lado, 2 SVGs vetorizados) |
| Originais das expressões | `src/assets/branding/foca/expressoes/<nome>.png` (8 arquivos, 1254 px) |
| Derivados das expressões | `public/branding/foca/expressoes/<nome>-{96,320}.{webp,png}` (32 arquivos) |
| Derivados da logo e ícones | `public/branding/foca/` |
| Original do corpo inteiro (02/10/2026) | `src/assets/branding/foca/corpo/foca-corpo-original.jpg` (referência; o app usa o SVG de `FocaCorpo.tsx`, sem PNG) |
| Prancha do corpo e prévias | `docs/design/brand/foca-corpo-prancha.html`, `docs/design/brand/previas/foca-corpo-*.png` (`bun scripts/design/prancha-foca.ts`) |
| Gerador único | `bun scripts/gerar-marca.ts` (bun + sharp), rodado da raiz |

Regras do gerador (`scripts/gerar-marca.ts:1-8`):

- Cores **nunca digitadas no script**: vêm dos tokens de `src/styles.css` (`--mar` e `--neve` do `:root`, `--neve` do `.dark`). Se um token sumir, o script falha.
- Nunca esticar, rotacionar ou recolorir: a arte é recortada pela caixa de alfa e centralizada num quadrado.
- Nada é pré-carregado no app; só a expressão que aparece é baixada (44 §6).
- Ao trocar uma arte: substituir o original, rodar o gerador, conferir com `tests/unit/brand-assets.test.ts` (confere que todo asset que o `FocaMark` monta existe e é quadrado, e que o `<head>` referencia os ícones).

## 8. Voz das falas (fora deste documento)

- Falas curtas da mascote: `src/lib/voz.ts` (`fala(slot)`), nunca texto fixo numa tela. Escolhidas no evento e guardadas, nunca sorteadas no render (20 §4.1).
- Regras, slots, tamanho e o "teste da Foca": [copy/04-foca-ia.md](../copy/04-foca-ia.md) §2. Persona do tutor: `copy/04` §3 e `src/lib/tutor-prompt.ts` (mudança no prompt é revisão L2).
- Humor: no máximo um por sessão, sempre sobre a Foca ser um bicho de pedra, nunca dentro de uma explicação (15 §6; 20 §7.1; `copy/04` §2).

## 9. Pendências conhecidas

- Validação com alunos reais de como a voz e as expressões são recebidas: nunca feita (15 §9; 08 §8).
- Pose do ícone (frente ou lado): decisão do proprietário (45 §10).
- Presença da Foca em notificações: só se houver notificações (15 §9).
