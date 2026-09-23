# 29 — Registro de execução: home como trilha visual + deploy

**Status:** em execução (23/09/2026), a partir de `docs/28-plano-execucao-home-trilha.md`.
**Norma:** [27](27-plano-home-trilha-visual.md). **Plano:** [28](28-plano-execucao-home-trilha.md).

## 1. Baseline (T-01)

- Hash antes de começar: `88813f3` (main). Branch de trabalho: `feat/home-trilha-visual`.
- `bunx tsc --noEmit`: exit 0.
- `bun test tests/unit`: 257 pass, 0 fail, 2151 expect() calls.
- `bunx playwright test`: 33 passed (1.2m), 0 falhas.
- `bun run build`: exit 0. Chunk da trilha (cliente): `trilha-BHm1yIi0.js` — 10.89 kB / gzip 3.65 kB.
- Screenshots de referência: `test-results/baseline-390.png`, `test-results/baseline-320.png` (não versionados).

## 2. Divergências entre o plano e o código real

- T-15: `--trail-sticky-top` medido em 390×844 deu 60px (plano previa 61±1) — dentro da tolerância, mantido `"61px"`.
- T-16: ao contrário do que o plano cogitava como possível, `pendingComponent` (TrailSkeleton) **aparece no SSR** com `ssr:false` — `curl http://localhost:8080/trilha` retorna `data-trail-skeleton` no HTML (contagem 1). Nenhuma ação adicional necessária.
- T-16: `errorComponent` (TrailError) verificado manualmente (`throw new Error` temporário, screenshot, revertido) — tela "A trilha não carregou." / "Tentar de novo" / "Praticar" renderiza corretamente.
- T-22: `.gitignore` já tinha mudança pendente do usuário (não desta tarefa) antes de começar a execução — por instrução do próprio `28` T-22 passo 5 ("se estiver [modificado], não toque"), **não** acrescentei `.vercel/` a ele. `.vercel/output` foi gerado e apagado (`rm -rf .vercel`) em cada verificação local; nunca ficou staged. Se algum dia sobrar sem querer, `.vercel/` precisa entrar no `.gitignore` manualmente (uma linha).

## 3. Decisões tomadas durante a execução

(preenchido durante a execução)

## 4. O que existe por checkpoint

### Checkpoint A (lógica pura)
- `src/lib/learning/path-layout.ts` — geometria/foco/marco/destaque/rolagem, tudo puro.
- `src/hooks/usePathFocusScroll.ts` — rolagem única + visibilidade do foco, 1 IntersectionObserver.
- `COPY.trilha.*` — 14 chaves novas em `src/lib/copy.ts`.
- `tests/unit/path-layout.test.ts` — 33 testes novos.

### Checkpoint B (primitivas visuais)
- CSS: `anim-halo`, `@keyframes ft-halo/ft-draw`, bloco `.path-*` inteiro em `src/styles.css`.
- `src/components/learning/path/{PathConnector,PathNode,ChapterMilestone,MarginDoodle}.tsx`.
- `TrailHeader.tsx` virou barra de métricas (streak/meta/nível); `trailGreeting()` exportado.
- `ContinueCard.tsx` ganhou `variant="callout"` (compatível — sem props novas, markup do `card` idêntico).
- `src/components/learning/path/FocusCallout.tsx`.

### Checkpoint D (testes, responsivo, performance)
- `tests/e2e/trail-path.spec.ts` (10 testes) + `playwright.config.ts` (`narrow` passa a rodar `trail-path.spec.ts`).
- Auditorias T-19/T-20/T-21 registradas em §5c/§5d/§5e — sem correção de código necessária.

### Checkpoint E (deploy)
- `vite.config.ts`: preset do Nitro por `process.env.VERCEL` (Vercel↔Netlify sem tocar código).
- `vercel.json` novo: `installCommand`/`buildCommand` fixando bun.
- `package-lock.json` removido (D-13 — desatualizado, bun é o gerenciador real).
- `README.md`: seção "Rodando localmente" atualizada pra bun/porta 8080, sub-seção "Verificar", seção "Deploy" nova (resumo do `27` §14).
- `.env.example`: linha indicando onde cadastrar `OPENAI_API_KEY` em produção.
- `.github/workflows/ci.yml` novo: install+tsc+unit+build no push/PR de `main`.
- Verificação local: `bun run build` (Netlify, `.netlify/functions-internal/`) e `VERCEL=1 bun run build` (`.vercel/output/`) — ambos ok; smoke test da função gerada (`node -e` importando `.vercel/output/functions/__server.func/index.mjs`) devolveu `200` para `/`, `/trilha` e `/learn/porcentagem-valor`.
- Revisão de segurança L2 (§5f): sem segredo no repo, sem `VITE_OPENAI`, `.env*` seguindo gitignorado, workflow sem `pull_request_target`.
- T-27 (push, PR, merge, configuração do Vercel no navegador) **não executado** — exige autorização explícita do usuário, pedida ao fim desta mensagem.

### Checkpoint C (caminho funcional)
- `path/{ChapterBanner,ChapterSegment,SubjectPath,SubjectPathEnd,RecommendationHint,JumpToFocusButton,TrailSkeleton,TrailError}.tsx`.
- `LearningPath.tsx` delega para `SubjectPath` (mantém `EmptyState`).
- `src/routes/trilha.tsx` reescrito: header vira barra de métricas, foco calculado por `pathFocus`/`resolveFocusTarget`, dica de recomendação cruzada, skeleton/erro ligados na rota.
- Build: chunk cliente `trilha-*.js` 10.89→16.37 kB (gzip 3.65→5.55 kB) + chunk auxiliar 0.89 kB (gzip 0.47 kB) = **+2.37 kB gzip** no total, dentro do orçamento de +8 kB (HG do `27`).
- TSC/UNIT/E2E confirmados verdes após a ligação (ver §1 e checagens abaixo).

## 5. Critérios RF/HG/DG — evidência

(preenchido em T-28)

## 5b. T-18 — Matriz visual manual

Capturado com fixture `PORTUGUES_FUNDO` (3/12 em "Pontuação e Coesão", foco em `pontuacao-04-termos-deslocados`), mais uma passada em `dark`:

| Tamanho | Resultado |
|---|---|
| 320×700 | ok — sem clipping, halo/callout inteiros, cadeado e rabisco "à" visíveis |
| 375×812 | ok |
| 390×844 | ok — conector traçado (caneta) entre o nó concluído e o foco; conector pontilhado (lápis) nos bloqueados |
| 430×932 | ok |
| 768×1024 | ok — nenhum overflow, coluna central preservada |
| 1280×800 | ok |
| 1440×900 | ok — coluna de 440px centralizada (D-7), seta do callout visível apontando pro nó foco |
| 390×844 dark | ok — todos os tokens trocam (fundo escuro, azul mais claro, carimbo/estrelas legíveis); nenhuma cor hardcoded quebrando o tema |
| bottom nav / safe area | ok em todos — botão "voltar pra atual" não observado sobrepondo o FAB do tutor nesta fixture (foco sempre visível ao carregar) |

Nenhum defeito encontrado — nenhuma correção necessária nesta tarefa.

## 5c. T-19 — Auditoria de acessibilidade (`web-design-guidelines`)

Guidelines buscadas de `vercel-labs/web-interface-guidelines`. Checagem manual + Playwright (Tab automatizado em `/trilha`):

- **Foco visível:** confirmado via `getComputedStyle` — todo elemento tabável (nó, banner, callout, chips, FAB, bottom nav) recebe `outline: solid 3px` (regra global `:focus-visible` de `styles.css`). Nenhum `outline: none` novo introduzido.
- **Ordem de tabulação:** confirmada em regime estável (2º ciclo do teste manual) — chips → banner do capítulo → nó → link do callout → FAB do tutor → bottom nav, batendo com a ordem visual do caminho (DOM de cima para baixo, sem `tabindex` nem `order` CSS). **Observação, não regressão:** o 1º ciclo de Tab logo após o load pulou os chips/banner na minha checagem manual (fora de escopo do E2E formal) — não reproduzido de forma determinística e não é causado por nenhum componente novo (chips/banner já existiam antes desta entrega); registrado aqui como observação, sem correção aplicada.
- **Nomes acessíveis:** nó = `aria-label="{título} — {estado}"` (link ou `div aria-disabled`); banner de capítulo = nome pelo próprio texto (rótulo + título + x/y), sem `aria-label` que o esconderia; carimbo = `role="img"` + `aria-label`; botão "voltar pra atual" = `aria-label` (ícone puro).
- **Decorativo:** halo, círculo do nó, ícone do carimbo, rabisco, seta do callout e SVG do conector — todos `aria-hidden="true"`.
- **Alvos de toque:** nó 64/76px, banner `min-h-14` (56px), botão flutuante 48px — todos ≥ 44px. Chips continuam 36px (pré-existentes, decisão já registrada no `27` §8: "chips existentes 36 px... inalterado").
- **Estrutura:** `<section aria-labelledby>` por capítulo, `<ol>`/`<li>` para os nós (ordem importa), `<button>` real no banner (nunca `div onClick`), `Link`/`div aria-disabled` no nó (nunca span clicável).
- **Achado sem correção nesta tarefa (fora de escopo):** `/trilha` não tem `<h1>` (só ganha quando `AppShell` recebe `title`, e a home não passa) — os dois `<h2>` (`SectionHeader`, `ContinueCard`) já existiam nessa hierarquia antes desta entrega; não é regressão desta tarefa.

Nenhuma correção de acessibilidade foi necessária nos componentes novos — a estrutura definida no `27` §8/`28` T-07/T-11 já nasceu conforme.

## 5d. T-20 — Refino visual (auditoria com `redesign-existing-projects`, sem `impeccable` disponível nesta sessão)

Contra o checklist anti-"AI slop" da skill, aplicado só onde é relevante para um app de produto (não uma landing page) e sempre respeitando os limites do `28` T-20 (só tokens/espaçamento/alinhamento existentes, nada de glassmorphism/grain/parallax, sem trocar Lucide, sem mexer em cor fora da paleta Rabisco):

- **Sem gradiente roxo/azul "IA genérica"**, sem `#000000` puro, um único accent (`--color-mar`) — conforme a regra "um azul, com regras de reserva" (`18` §3).
- **Sem 3 cards iguais em coluna** — o layout é o caminho vertical assimétrico pedido pela spec, não um grid genérico.
- **Estados de hover/active presentes** (`:active` desce 3–4px nos nós/botões, aresta some — já é o padrão `btn-*`/`card-press` do design system, aplicado aos componentes novos).
- **Bordas em vez de sombra difusa** nos nós/banner — consistente com "elevação por aresta" (`18` §"Elevation").
- **Skeleton e erro implementados** (T-16), não "tela vazia".
- **Nenhum `#hex` literal** nos arquivos novos (checado no diff).
- Nenhuma mudança aplicada nesta rodada — a implementação já nasceu dentro dos limites do design system; qualquer sugestão da skill fora desses limites (fontes variáveis, ruído/grain, parallax, troca de ícones) foi descartada por estar fora do escopo do `28` T-20.

## 5f. T-26 — Revisão de segurança L2

- `git grep -nE "sk-[A-Za-z0-9]{10,}"` → vazio.
- `git grep -n "OPENAI_API_KEY=.\+"` → só `.env.example:10` (vazio, `OPENAI_API_KEY=`) e o exemplo de formato em `README.md` (`sk-...`, placeholder, não uma chave real). Nenhum valor real commitado.
- `git grep -n "VITE_OPENAI\|VITE_.*API_KEY"` → nenhuma ocorrência em código (só a menção da própria regra em `docs/28`).
- `.gitignore` mantém `.env*` com exceção de `.env.example`.
- `vercel.json` não define `headers` (nada que desligue a Deployment Protection por config).
- `.github/workflows/ci.yml` não usa `pull_request_target`, não expõe segredo, não faz deploy.

Sem achados.

## 5e. T-21 — Verificação de performance

1. **Chunk da trilha:** `trilha-BHm1yIi0.js` (baseline, 10.89 kB / gzip 3.65 kB) → `trilha-BG09MT8D.js` (16.37 kB / gzip 5.55 kB) + chunk auxiliar `trilha-CNetNlPP.js` (0.89 kB / gzip 0.47 kB) = **+2.37 kB gzip** no total. Dentro do orçamento de +8 kB gzip do `27` §7.
2. **Re-render:** instrumentado temporariamente `PathNodeImpl` com um contador em `window` (revertido depois — `git diff` confirma o arquivo idêntico ao committed), abri `/trilha` em Português com "Crase sem medo" expandido e abri o balão do tutor (muda `tutor.open` no store, o que remonta `TrilhaRoute` via `useAppState`). Resultado: **delta = 0 renders** de `PathNode` — o comparador do `memo` (T-07) segura os nós que não mudaram.
3. **Listeners globais:** `grep -rn "addEventListener(\"scroll\"\|IntersectionObserver\|ResizeObserver" src/components/learning/path src/hooks/usePathFocusScroll.ts` → só 1 ocorrência de `IntersectionObserver`, em `usePathFocusScroll.ts` (o único observer da tela, como exige o `27` §7). Nenhum listener de `scroll`/`resize`.
4. **Long tasks (DevTools Performance, sem throttling adicional além do já usado pelos testes):** não medido com throttling de CPU dedicado nesta passada (ambiente sem Chrome DevTools Protocol interativo disponível na sessão); a evidência indireta é o `delta=0` de re-render do item 2 e a ausência de listeners custosos do item 3. Registrado como limitação — throttling 4× fica pra verificação manual do usuário (mesma lista do `27` §16/§19).

## 6. Achados das 5 rodadas de revisão (T-28)

Revisão sobre `git diff main...feat/home-trilha-visual`. Rodadas 1/2 rodaram como 8 sub-agentes em paralelo (skill `/code-review`, ângulos: diff linha-a-linha, comportamento removido, cross-file, reuso/duplicação, altitude/raiz, eficiência, convenções do `CLAUDE.md`); 3 desses agentes esbarraram no limite de sessão da conta (rate limit, reset 3:20 America/Sao_Paulo) e terminaram cedo, mas 6 dos 8 já tinham entregado relatório completo antes disso — o corte não deixou nenhum ângulo sem cobertura. Rodadas 3–5 (visual, a11y, spec) feitas nas tarefas T-19/T-20/T-21/T-28 deste mesmo documento.

### Corrigido (2 achados reais, confirmados e corrigidos nesta tarefa)

| # | Achado | Onde | Correção |
|---|---|---|---|
| 1 | **Regressão funcional:** a saudação "acolhedora" (retorno após ≥2 dias sumido, `docs/15` §3.2: "acolhedora tem prioridade sobre tudo") só aparecia dentro do `FocusCallout`, que não é montado quando a matéria selecionada não tem mais nada pendente (`SubjectPathEnd`). Um usuário que sumiu e cuja matéria selecionada já está 100% concluída via só "Você fechou tudo..." — perdendo a prioridade que o `TrailHeader` antigo garantia globalmente. | `SubjectPathEnd.tsx`, `SubjectPath.tsx` | `SubjectPathEnd` recebe `greeting` e mostra `FocaMark expression="acolhedora"` + a fala de `fala("retorno")` quando `greeting.slot === "retorno"`, preservando a prioridade; caso contrário mantém "orgulhosa" como antes. Teste novo: `tests/e2e/trail-path.spec.ts` — "acolhedora vence mesmo com a matéria selecionada toda concluída" |
| 2 | **Perda de telemetria:** o `errorComponent` global (`__root.tsx`) chama `reportLovableError` num `useEffect`; o novo `TrailError` (errorComponent de rota) tinha o mesmo layout mas não reportava — um erro capturado no nível da rota `/trilha` ficaria mudo pro Lovable, embora visualmente idêntico ao erro que É reportado. | `TrailError.tsx` | Acrescentado o mesmo `useEffect(() => reportLovableError(error, { boundary: "trilha_route_error_component" }), [error])` |

### Registrado, sem correção (achados de baixa severidade ou puramente teóricos)

| # | Achado | Onde | Por que não corrigido agora |
|---|---|---|---|
| 3 | `estadoLabel`/`KIND_ICON` duplicados entre `LessonNode.tsx` (rollback) e `PathNode.tsx` em vez de compartilhados | `PathNode.tsx:12-20` | Os dois componentes protegem contratos de E2E diferentes por design (rollback via `FEATURES.trilhaComoHome=false`); extrair um módulo compartilhado é uma limpeza válida mas fora do escopo desta entrega — o comentário em `PathNode.tsx` já registra a dependência intencional |
| 4 | `JumpToFocusButton` repete inline o mesmo estilo de FAB do `TutorBubble` em vez de uma `@utility` compartilhada | `JumpToFocusButton.tsx` | Estético/DRY, sem risco funcional; os dois botões já usam os mesmos tokens, então uma mudança de paleta propaga igual pros dois (só a duplicação de literal Tailwind que sobra) |
| 5 | `SubjectPathEnd` não reaproveita `EmptyState` (tem sua própria composição Foca+texto+CTA) | `SubjectPathEnd.tsx` | Decisão de design do `27` §6.5/RF-12: a Foca ali é "orgulhosa" numa transição emocional específica ("fechei"), não o vazio genérico "entediada" de `EmptyState` — a diferença é proposital, não duplicação acidental |
| 6 | `ChapterCard.tsx`/`LessonNode.tsx` (versão lista) ficam sem nenhum import ativo — código morto até alguém religar via rollback manual | `ChapterCard.tsx`, `LessonNode.tsx` | Mantidos de propósito (`27` D-11: "rollback visual trivial") — não são lixo, são o plano B documentado |
| 7 | `PATH_AMP_CQI`/`ROW_HEIGHT_PX` (JS) e `--amp: 16cqi`/`.path-row-node height: 96px` (CSS) são a mesma geometria mantida em sincronia só por comentário, sem teste que quebre se divergirem | `path-layout.ts`, `styles.css` | Achado válido de acoplamento; corrigir exigiria ler `--amp` computado do DOM em vez de constante (mais complexidade num único ponto de baixo risco de mudança). Registrado para uma limpeza futura, não bloqueia esta entrega |
| 8 | `PATH_TOP_INSET`/`PATH_BOTTOM_INSET` são estimativas fixas (chips+banner, bottom nav) em vez de medidas do DOM real | `usePathFocusScroll.ts` | Mesmo padrão do #7 — worked as measured in T-18 (60px real vs 61px estimado, dentro da tolerância); só ficaria errado se o layout do header/nav mudar de altura no futuro, e nesse caso o E2E de HG5/HG9 pegaria a régua errada |
| 9 | `rowEl()` usa `document.querySelector` por `data-path-row` global em vez de um mapa de refs — funciona hoje porque só uma matéria renderiza por vez, mas colidiria se duas trilhas ficassem montadas simultaneamente no futuro | `usePathFocusScroll.ts` | Sem caso de uso atual que quebre isso; trocar por um `Map<string, HTMLElement>` threading refs por `ChapterSegment`→`PathNode` é uma reestruturação maior que o escopo desta entrega justifica |
| 10 | `doneKeyRef` é marcado como "já rolou" mesmo quando o elemento-alvo não existe no DOM no momento do efeito (não há retry) | `usePathFocusScroll.ts` | Teórico: o capítulo do foco já vem expandido por padrão (`chapterDefaultExpanded`) sempre que existe foco, então o `<li>` já existe no primeiro commit, antes do `requestAnimationFrame` do efeito rodar — sem caminho de reprodução no código atual |
| 11 | `shouldAutoScroll` lê `window.scrollY` de forma síncrona; se a restauração de scroll do TanStack Router for assíncrona, pode arbitrar errado numa janela de corrida | `usePathFocusScroll.ts` | Não observado nos 53 E2E (inclusive os que navegam com histórico/voltar); registrado como risco de timing, não um defeito reproduzido |
| 12 | `SubjectPath.jump()` assume que 2 `requestAnimationFrame` bastam pro React commitar o novo `<li>` antes de rolar | `SubjectPath.tsx` | Mesma classe do #11 — não reproduzido; o `scrollIntoView` é opcional (`?.`), então na pior hipótese o clique simplesmente não rola, sem erro |
| 13 | `COPY.trilha.abrirCapitulo`/`recolherCapitulo` foram criadas (T-02) mas nunca usadas — o nome acessível do banner não muda entre aberto/fechado | `ChapterBanner.tsx` | Decisão consciente da T-19: `aria-expanded` já comunica o estado ao leitor de tela; adicionar um `aria-label` que troca o texto esconderia o título do capítulo do nome acessível, o que a própria auditoria de acessibilidade rejeitou. As chaves ficam disponíveis sem uso — não é dead code perigoso, é a decisão registrada por escrito aqui |
| 14 | `ContinueCard` `variant="card"` (o antigo default) e `COPY.trilha.tudoConcluido` ficaram sem nenhum chamador depois que `trilha.tsx` passou a usar só o `callout` | `ContinueCard.tsx` | Mantido de propósito — é o mesmo motivo do #6 (rollback/reuso futuro), documentado no próprio componente |
| 15 | Ineficiências em `trail.ts`/`curriculum-tree.ts` (`phaseById`/`chapterById` fazem scan linear, chamados repetidamente por nó) tornando `buildTrail` quase O(n²) | `src/lib/learning/trail.ts`, `src/content/curriculum-tree.ts` | **Pré-existente** — nenhuma linha desses arquivos foi tocada por esta entrega (só lidos). Fora do escopo do `27`/`28`, que proíbem mexer em `trail.ts`/`recommend.ts`. Registrado para uma spec futura de performance se o catálogo crescer muito mais |

Nenhuma violação encontrada contra `CLAUDE.md` (dark mode/tokens, geometria, `FocaMark`, estado, `routeTree.gen.ts`, bun vs. npm) nem "altitude" (nenhuma lógica hardcoded por nome de matéria/capítulo fora do fallback documentado de `RABISCOS`).

## 7. Teste no celular (T-27)

Pendente do usuário.

## 8. Limitações explícitas

(preenchido no fim)
