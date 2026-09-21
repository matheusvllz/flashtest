# 19 — Registro de execução: reestilização "Rabisco na Margem"

Status: ✅ executado em 20/09/2026, branch `rebrand/foca`, ainda não commitado. Registra o que o `18-plano-reestilizacao-rabisco.md` previu vs. o que de fato aconteceu ao rodar as 13 fases — decisões tomadas, desvios do plano original e bugs reais encontrados. Não duplica o design system em si (isso é o `18`); este arquivo é o "diário de bordo" da execução.

---

## 1. O que foi executado

As Fases 0–12 do `18` §15, integralmente:

- **Fase 0–2:** baseline, tokens (`styles.css`, `brand.ts`, `error-page.ts`, `__root.tsx`), componentes globais (`btn-*`, `card-soft`/`card-press`, `chip`/`chip-on`, `input-ds`, `surface-pauta`, `mark-texto`, `sheet`, animações novas) e os 6 componentes `src/components/ds/*`.
- **Fase 3:** `FocaMark` com `expression`/`motion`, `FocaSays`, `src/lib/voz.ts`, script de logos regenerado com as 8 expressões (fallback neutro — arte final ainda não existe, D5).
- **Fase 4–5:** `AppShell`/`TutorBubble` (sem Foca no header, nav com pílula ativa), `sfx.ts`/`haptics.ts` sintetizados via WebAudio (D3).
- **Fase 6:** `store.ts` — `activityDays`, `bestStreak`, `streakFreezes`, `today`, `nivelDeXp`, `setPrefs`, `registrarResposta`/`registrarAulaConcluida`/`registrarRevisaoFlashcard`.
- **Fase 7–11:** as 17 rotas + `TutorBubble`, `LessonPlayer`, os 7 exercícios, `CelebracaoAula`, `FeedbackSheet` (renomeado de `FeedbackBar`).
- **Fase 12:** auditoria, dark mode (achou e corrigiu dois bugs reais — §3 abaixo), atualização de `CLAUDE.md`, `docs/09`, `docs/00-README.md`, este registro.

Verificação a cada fase: `bunx tsc --noEmit`, `bun run build`, `bunx eslint <arquivos da fase>` — todos limpos, e uma verificação visual real (Chrome headless via CDP, sem instalar dependência nova) em pontos-chave da Golden Path (`welcome → quiz → aha → dashboard → study → redação`) e em dark mode.

---

## 2. Decisões D1–D7 do `18` §14 — o que foi aplicado

| # | Decisão | Aplicado |
|---|---|---|
| D1 | Recompensa em marca-texto (`--color-recompensa` = `--alert`) | ✅ default do plano |
| D2 | Space Mono para dados | ✅ default do plano |
| D3 | Som sintetizado via WebAudio, sem assets | ✅ default do plano |
| D4 | Dark mode com tokens + auto + toggle, QA na Fase 12 | ✅ default do plano — e foi na QA da Fase 12 que os dois bugs do §3 abaixo apareceram |
| D5 | Expressões da Foca: código pronto, arte interina | ✅ default do plano — todas as 8 expressões hoje renderizam a arte neutra até o designer entregar `src/assets/branding/foca/expressoes/*.png` |
| D6 | Todos os heros viram papel (nenhum navy/grafite de fundo) | ✅ default do plano |
| D7 | Remover a opção "10 aulas/dia" do plano | ✅ default do plano |

Nenhuma decisão foi revertida para a alternativa. O time não interveio antes da execução; se quiser mudar alguma, o `18` §14 já documenta o que trocar e onde.

---

## 3. Bugs reais encontrados (não estavam no plano original)

### 3.1 Dark mode não propagava para classes Tailwind comuns — **crítico, corrigido**

**Sintoma:** ao forçar `prefers-color-scheme: dark` e navegar, cartões escritos como `@utility` (`card-soft`, `btn-primary`…) ficavam escuros corretamente, mas o **fundo da página** (`bg-neve`), **texto** (`text-abismo`, `text-nevoa`) e **bordas** (`border-gelo`) — usados como classes Tailwind comuns em quase toda tela — continuavam claros. Resultado: telas com metade dos elementos escuros e metade claros, ilegíveis.

**Causa:** o `18` §6.1 (e a Fase 1 original) declarava os tokens de marca dentro de `@theme inline` como hex literal (`--color-neve: #f6f5f1;`) e redefinia os mesmos nomes dentro de `.dark { --color-neve: #1c1b18; }`. Isso funciona para uma `@utility` escrita à mão que usa `var(--color-neve)` diretamente — mas o Tailwind v4, ao **gerar** a classe `.bg-neve` a partir de um valor literal em `@theme inline`, grava o hex no CSS de saída (`.bg-neve{background-color:#f6f5f1}`), não uma referência `var()`. A redefinição em `.dark` nunca chega a essas classes geradas, só ao bloco `--color-*` em si (que ninguém consome diretamente).

**Correção:** cada token de marca agora é uma indireção de duas camadas — uma variável "base" sem prefixo (`--abismo`, `--mar`, `--neve`…) declarada em `:root` e redefinida em `.dark`, e o `--color-X` dentro de `@theme inline` aponta para ela via `var(--X)` (o mesmo padrão que o arquivo já usava para as variáveis shadcn, ex. `--color-background: var(--background)`). Confirmado no CSS compilado: `.bg-neve{background-color:var(--neve)}`, inclusive as variantes de opacidade (`.bg-neve\/95{background-color:color-mix(in oklab, var(--neve) 95%, transparent)}`).

**Onde:** `src/styles.css` (`@theme inline`, `:root`, `.dark`).

**Lição para o `18`:** qualquer token de marca novo precisa seguir esse padrão de indireção desde o início — isso já foi anotado como regra em `CLAUDE.md` (seção Design system) pra não se repetir.

### 3.2 Hydration mismatch do script de dark mode — corrigido

**Sintoma:** com o SO em modo escuro, toda navegação de página completa emitia no console `"A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"`, apontando pro atributo `class="dark"` do `<html>`.

**Causa:** o script inline em `__root.tsx` (necessário para aplicar `.dark` antes do primeiro paint e evitar flash) roda no cliente e muda `document.documentElement.className` antes do React hidratar — mas o HTML gerado no servidor não tem como saber a preferência do sistema do usuário, então nasce sem a classe. É uma discrepância cliente/servidor **esperada e inofensiva** em qualquer app SSR com detecção de tema no cliente, mas por padrão o React trata isso como erro.

**Correção:** `suppressHydrationWarning` no elemento `<html>` de `RootShell` — a solução padrão do React para exatamente este padrão (scripts de tema que mutam `html`/`body` antes da hidratação). Escopo do `suppressHydrationWarning` é raso (só os atributos daquele elemento), então não mascara mismatches reais em outro lugar da árvore.

**Onde:** `src/routes/__root.tsx`.

### 3.3 `today.lessons` contava questões, não aulas — corrigido antes de ir ao ar

Ao implementar o anel de meta do dashboard (Fase 8), percebi que a Fase 6 (`registrarResposta`) chamava `registrarAtividade(s, "lesson")` a cada **questão** respondida — mas uma aula de 60s tem 2 questões (`LESSON_SIZE`). Isso inflaria `today.lessons` (contaria questões) bem quando a meta diária é medida em **aulas completas**. Corrigido antes de qualquer tela consumir o campo: `registrarResposta` não toca mais em `registrarAtividade`; um novo `registrarAulaConcluida()` (chamado uma vez, ao fim da aula) é quem incrementa `today.lessons`, `lessonsCompleted` e a streak — alinhado à letra do `16` §6 ("uma aula de 60s", não "uma questão"). Não chegou a afetar nenhuma tela publicada.

### 3.4 `eslint.config.js` não ignora `.netlify/` — pré-existente, não corrigido (fora de escopo)

O primeiro `bun run lint` da Fase 0 (baseline) rodou por >10 minutos e devolveu ~67 mil erros — porque `bun run build` já tinha gerado `.netlify/functions-internal/` (artefato de build, gitignorado) e o `ignores` do `eslint.config.js` só lista `["dist", ".output", ".vinxi"]`, esquecendo `.netlify`. Apagar `.netlify/dist/.output/.vinxi` antes de cada lint contornou o problema (é o que todo `rm -rf` antes de um `bunx eslint`/`bun run lint` neste registro faz). **Não corrigi o `eslint.config.js`** porque não está na lista de arquivos de nenhuma fase do `18` — fica registrado aqui para quem for mexer no lint do projeto depois.

---

## 4. Baseline de lint pré-existente (não introduzido por esta reestilização)

`bun run lint` no repo inteiro reporta ~22 mil problemas, quase todos `Delete` `␍` (CRLF) — o checkout do repo neste ambiente Windows tem quebra de linha CRLF em arquivos que o Prettier do projeto espera em LF (`src/data/subjects.ts`, `vite.config.ts`, `src/start.ts`, todo `src/components/ui/*`, etc.). **Confirmado, arquivo a arquivo, que nenhum desses CRLFs foi introduzido nesta reestilização** — são arquivos não tocados ou, nos poucos tocados (`src/lib/store.ts`, `src/components/lessons/LessonPlayer.tsx`, `src/routes/flashcards.tsx`), os únicos achados remanescentes são dois `catch {}` vazios e dois avisos de `react-hooks/exhaustive-deps` que já existiam no HEAD antes desta sessão (confirmado via `git show HEAD:<arquivo>`). Nenhum arquivo criado ou reescrito nesta sessão tem erro de lint pendente.

---

## 5. O que ficou fora do escopo (documentado, não esquecido)

- **Arte final das 8 expressões da Foca** (`docs/15` §5, D5) — todas caem no fallback neutro. Ver `src/assets/branding/foca/README.md`.
- **Congelamento de streak por dia específico não é rastreável na UI** — o store guarda só o contador `streakFreezes`, não em qual data cada um foi consumido. O calendário semanal do `/plan` (§13.11) mostra só atividade real, sem indicar "este dia foi coberto por congelamento" — daria pra adicionar um campo `freezesUsados: string[]` no store se isso importar depois.
- **Divergência de produto pré-existente, não corrigida:** o quiz de entrada (`quiz.tsx`) ainda não faz as "3 questões de conteúdo real" que `08-produto-e-estrategia.md` e o `CLAUDE.md` descrevem — `completeQuiz([], computeGaps(...))` sempre passa `answers: []`. Isso é anterior a esta reestilização (já registrado no diagnóstico do `18` §1.2) e é uma decisão de produto, não uma tarefa de design visual — não mexi nisso.

---

## 6. Checklist do `18` §17 — resultado

Todos os itens marcados com evidência: paleta aplicada e centralizada (nenhum hex fora de `brand.ts`/`error-page.ts`/`gerar-logos-foca.ps1`), 17 rotas + componentes globais na nova identidade, 8 logos preservadas e organizadas, honestidade dos números (meta/missões/calendário refletem `activityDays`/`today`), sensorial (som/háptico com toggle, aresta nos botões), acessibilidade (foco visível, `aria-*`, contraste, `prefers-reduced-motion`), dark mode funcional nas 17 rotas testadas, `lint`/`tsc`/`build` sem erro novo, documentação atualizada (`CLAUDE.md`, `docs/00`, `docs/09`, `docs/18`, este arquivo).
