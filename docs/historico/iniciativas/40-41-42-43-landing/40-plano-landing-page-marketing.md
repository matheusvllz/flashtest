> **Arquivado em 29/09/2026 (decisão 0004).** Documento histórico: o cabeçalho e o "estado" abaixo descrevem o momento em que foi escrito, não o estado atual. O que continua valendo foi extraído para os documentos canônicos ([docs/README.md](../../../README.md)); resumo e contexto: [resumo.md](resumo.md).

# 40 — Landing page de marketing do Foca: plano de implementação (isolada do app)

**Status:** **APROVADO pelo usuário em 28/09/2026 e EXECUTADO por Sonnet 5.5 em 28 e 29/09/2026 (F0 a F17): ver [41](41-registro-execucao-landing-page.md).** Escrito em 28/09/2026 por Opus 5.5. A pasta `landing/` existe, isolada e não publicada; a integração com o app continua bloqueada.
**Estado da feature:** `LANDING PAGE: INTEGRATED` (29/09/2026, [`44`](../44-45-integracao-web/44-plano-integracao-produto-web.md)/[`45`](../44-45-integracao-web/45-registro-execucao-integracao.md): a landing é a rota `/` do app e a regra de isolamento da §22 foi revogada pelo proprietário). Antes: `V2 IMPLEMENTED / ISOLATED / NOT PUBLISHED` (29/09/2026: a segunda direção criativa do [`42`](42-plano-landing-v2-direcao-criativa.md) prevalece sobre este plano na arquitetura de seções §11, no mapa de movimento §13.3, no "sem pin" §13.1, no CTA, nos retratos §14 e nas afirmações F-4/F-15; registro em [`43`](43-registro-execucao-landing-v2.md)) · `INTEGRAÇÃO COM O APP: BLOCKED UNTIL EXPLICIT USER REQUEST`
**Prevalece sobre:** nada no app. Nos assuntos de **landing pública**, detalha (sem contradizer) `docs/copy/06-marketing.md` e `docs/copy/01-estrategia.md`. Onde este plano e o `copy/01` §4/§6 divergirem sobre o que pode ser prometido, **o `copy/01` vence** até ser atualizado.
**Registro de execução:** `docs/historico/iniciativas/40-41-42-43-landing/41-registro-execucao-landing-page.md` (criado pelo executor na Fase 0; ainda não existe).

> **Regra permanente (vale para qualquer IA, em qualquer sessão):** a landing page de marketing vive isolada em `landing/` e **não é integrada ao aplicativo** (`src/`, rotas, `__root.tsx`, `styles.css`, `vite.config.ts`, `package.json` da raiz, deploy do app) até o proprietário do projeto pedir explicitamente, com palavras equivalentes a *"Agora integre a Landing Page ao aplicativo."* "Terminar", "finalizar", "publicar" ou "deixar pronta" a landing **não** autorizam integração. A §22 descreve a integração futura só para não fechar portas — **DO NOT EXECUTE.**

---

## Sumário

- [Como a IA implementadora deve usar este documento](#como-a-ia-implementadora-deve-usar-este-documento)
- [1. Contexto](#1-contexto) · [2. Auditoria (o que foi lido e o que se concluiu)](#2-auditoria-o-que-foi-lido-e-o-que-se-concluiu) · [3. Problema e tese da página](#3-problema-e-tese-da-página)
- [4. Objetivos](#4-objetivos) · [5. Não objetivos](#5-não-objetivos)
- [6. Análise da persona para a landing](#6-análise-da-persona-para-a-landing) · [7. Matriz de objeções](#7-matriz-de-objeções) · [8. Funil psicológico](#8-funil-psicológico)
- [9. Estratégia de mensagem e copy v0](#9-estratégia-de-mensagem-e-copy-v0) · [10. Freemium: o que pode e o que não pode ser dito](#10-freemium-o-que-pode-e-o-que-não-pode-ser-dito)
- [11. Arquitetura da informação (seção a seção)](#11-arquitetura-da-informação-seção-a-seção)
- [12. Direção visual e Marketing Design Tokens](#12-direção-visual-e-marketing-design-tokens) · [13. Sistema de movimento](#13-sistema-de-movimento)
- [14. Como o produto é mostrado (retratos reais e demo interativa)](#14-como-o-produto-é-mostrado-retratos-reais-e-demo-interativa)
- [15. Arquitetura técnica isolada](#15-arquitetura-técnica-isolada) · [16. Performance](#16-performance) · [17. Acessibilidade](#17-acessibilidade) · [18. SEO](#18-seo) · [19. Analytics e CRO](#19-analytics-e-cro) · [20. Segurança](#20-segurança)
- [21. Skills: quais, quando, de onde](#21-skills-quais-quando-de-onde)
- [22. Integração futura — DO NOT EXECUTE](#22-integração-futura--do-not-execute)
- [23. Fases e tarefas](#23-fases-e-tarefas) · [24. Revisões de design](#24-revisões-de-design) · [25. Critérios de aceite globais](#25-critérios-de-aceite-globais)
- [26. Testes](#26-testes) · [27. Edge cases](#27-edge-cases) · [28. Riscos](#28-riscos) · [29. Dependências e decisões pendentes](#29-dependências-e-decisões-pendentes)
- [30. SONNET 5.5 EXECUTION HANDOFF](#30-sonnet-55-execution-handoff)

---

## Como a IA implementadora deve usar este documento

1. **Não comece sem aprovação.** O topo deste arquivo precisa dizer "aprovado em DD/MM/AAAA" (escrito pelo usuário ou a pedido dele). Se ainda disser "rascunho", pare e pergunte.
2. Ler este documento inteiro, depois `../CLAUDE.md`, `../AGENTS.md` e [ai/SDD-WORKFLOW.md](../../../ai/SDD-WORKFLOW.md). A §30 é o roteiro operacional; as seções 6–22 são a norma que ele executa.
3. Executar as fases **na ordem** (§23). Cada fase termina com `landing/` compilando (`bun run typecheck` dentro de `landing/`) e os testes da landing verdes.
4. **Opus decidiu a estratégia; você executa.** Cada fase tem "Decisões já tomadas" (não reabrir) e "Decisões permitidas ao executor" (pequenas, locais). Qualquer coisa fora disso: registrar em `docs/41` como divergência e seguir a intenção descrita; se bloquear, perguntar.
5. **Escopo de escrita:** só `landing/**` e os documentos listados na §15.9. Nada em `src/`, `public/`, `tests/`, `scripts/`, `content-pipeline/`, arquivos de config da raiz. Arquivos do app podem ser **lidos** (e copiados para dentro de `landing/` onde o plano manda), nunca editados.
6. O repo tem **muito trabalho em paralelo não commitado** (≈330 entradas no `git status` em 28/09/2026, incluindo `src/styles.css`, `FocaMark.tsx`, `brand.ts` e os PNGs da marca). Não faça commit, branch, stash, checkout, reset, `git add` nem push. Nunca "limpe" arquivos que não são seus.
7. Carregar skills **só** como a §21 manda, fase a fase. `better-writing` e `frontend-design` não são usadas neste plano.

---

## 1. Contexto

- **Não existe landing pública do Foca.** A "landing" de fato é `src/routes/welcome.tsx`, com promessas que o produto não sustenta ("60 segundos", "A IA mapeia suas lacunas") — `docs/copy/06` §5. O material em `docs/13` e a LP do link da bio são da marca Flash Test (históricos).
- O app é TanStack Start + React 19 + Vite 8 + Tailwind v4, bun, deploy no Vercel (preset `vercel`) e Netlify. Identidade visual: **Rabisco na Margem** (`docs/DESIGN.md`, `docs/18`, `docs/design/brand/foca-rabisco-branding.md`, referência visual `docs/design/brand/foca-design-system-2026-09-28.html` com os logos novos de 28/09).
- A tagline vigente do site (`src/lib/brand.ts`, `36` RU-20, feito): **"Estudo curto, todo dia."**; descrição: **"Preparação para o ENEM em aulas curtas. A Foca acompanha o que você já sabe e escolhe o próximo passo."**
- A frase de posicionamento do `08` §1 ("Não é mais aula. É o hábito que te aprova. 60 segundos por dia.") **foi mantida pelo usuário por enquanto** (D-1, 28/09), mas tem três problemas registrados (promete aprovação, promete duração, usa o padrão "Não é X. É Y.") — `copy/01` §5.2. **A landing não a usa.** A promessa-guia da landing é a que a própria análise Ogilvy do `copy/01` §5.3 escolheu: **"O próximo passo já está escolhido."** (ver D-LP-2 na §29).
- Plano `36` (qualidade): T-02 (bug do "Continuar") e T-03 (nivelamento que aplica priors e muda a fila) **concluídos**; Fase 10 (migração de strings e docs) **não iniciada**. Consequência: telas do app ainda mostram strings antigas em alguns lugares ("Checkpoint" em vez de "Checagem", "60 segundos" na welcome/splash). Os retratos do produto (§14) evitam essas telas.

## 2. Auditoria (o que foi lido e o que se concluiu)

**Documentos lidos:** `CLAUDE.md`, `AGENTS.md`, `docs/README.md`, `docs/ai/SDD-WORKFLOW.md`, `docs/ai/SKILL-ROUTING.md`, `docs/ai/SKILLS.md`, `docs/ai/templates/spec.md`, `.claude/skills-registry.json`, `.claude/settings.json`, `skills-lock.json`, `.agents/product-marketing.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/COPY.md`, `docs/copy/01`, `02`, `03` §3, `04`, `06`, `docs/08`, `docs/13` (histórico), `docs/14`, `docs/15` §4–§5, `docs/16`, `docs/18` §2–§8, `docs/design/brand/foca-rabisco-branding.md`, `docs/design/brand/foca-design-system-2026-09-28.html`, `docs/27`, `docs/30`/`32` (por seção), `docs/36`/`37` (status), `docs/39`; skills locais `design-taste-frontend`, `motion-design`, `foca-sdd`. **Código lido:** `package.json`, `vite.config.ts`, `vercel.json`, `netlify.toml`, `bunfig.toml`, `tsconfig.json`, `eslint.config.js`, `.gitignore`, `playwright.config.ts`, `src/routes/{__root,index,welcome,premium,login}.tsx`, `src/styles.css` (tokens e utilities), `src/components/brand/FocaMark.tsx`, `src/lib/{brand,voz,copy}.ts` (chaves), inventário de `public/branding/foca/` e `src/assets/branding/foca/`, `tests/` (estrutura).

**Conclusões que mudam o plano:**

| # | Achado | Consequência |
|---|---|---|
| A-1 | `@lovable.dev/vite-tanstack-config` injeta TanStack Start, nitro, Tailwind, alias `@` e força porta 8080 em qualquer build que o importe | A landing usa **Vite puro** com config própria. Nunca importar a config do Lovable |
| A-2 | Repo não é monorepo (sem `workspaces`). `tsconfig.json` da raiz inclui só `src/**`; `bun test tests/unit` só olha `tests/unit`; Tailwind do app só escaneia `../src`; CI roda `tsc`, `bun test tests/unit`, `bun run build` na raiz | Uma pasta `landing/` **independente** (package.json, lockfile, tsconfig e testes próprios) não afeta nenhum desses. `eslint .` da raiz vai enxergar `landing/` (não roda no CI) — aceito, sem editar a config da raiz (R-5) |
| A-3 | `src/styles.css`, `FocaMark.tsx`, `brand.ts` e todos os PNGs da marca estão sendo alterados em paralelo agora | A landing trabalha com **cópias versionadas** (snapshot) de tokens e assets, com script de sincronização e teste de deriva. Importar ao vivo de `../src` é proibido |
| A-4 | `__root.tsx` hidrata o store, desbloqueia áudio e monta o banner de persistência em toda rota | A landing **não pode ser rota do app** agora (arrastaria store/áudio para a página pública) |
| A-5 | Fluxo real de entrada: `/` (splash 1,1s) → `/welcome` → `/quiz` (9 passos, sem e-mail e sem senha) → oferta de nivelamento → `/aha` ou `/nivelamento` → `/trilha` | CTA primário leva direto para **`{APP_URL}/quiz`** (pula a welcome, que tem copy desatualizada). "Entrar" leva a `{APP_URL}/` (usuário que já estudou naquele aparelho cai na trilha) |
| A-6 | Não há GSAP, Lottie, Motion nem analytics no projeto; o SDD exige spec aprovada para qualquer um (`SDD-WORKFLOW` §8; `DESIGN.md`) | **Este plano é a spec** que pede aprovação de GSAP **somente dentro de `landing/`**. Lottie e Motion: não entram (§13.6). Analytics externo: não entra (§19) |
| A-7 | As 8 expressões da Foca **não têm arte final** (todas renderizam a neutra) | Nenhuma seção depende de expressão. A Foca aparece em **duas** poses: cor neutra e contorno. Sem storytelling com "Foca triste/feliz" |
| A-8 | Mastery/Confidence são internos; a UI mostra **faixas** ("Base em construção", "No caminho", "Base firme") e, em `/progress`, "Domínio" só com evidência | A landing fala em **faixas** e "o que já firmou". Nunca "Mastery", "domina", porcentagem ou nível |
| A-9 | Ausências: nenhum depoimento, nenhum dado de retenção, nenhum aluno aprovado, preço nunca definido, duração nunca medida, áudio/háptico nunca testados em aparelho físico, tutor em produção depende de `OPENAI_API_KEY` ainda pendente no Vercel | Sem prova social, sem números, sem preço, sem minutos, sem som na página. A confiança vem de **mostrar o produto real** e de **honestidade explícita** (§9.4) |
| A-10 | `copy/06` §4 e `copy/01` §6 ainda proíbem "o nivelamento muda a sua trilha" "até o `36` T-03"; o T-03 foi concluído mas os docs não foram atualizados | A landing usa uma formulação que já era verdadeira antes do T-03 ("o ponto de partida sai das suas respostas"). Atualizar o `copy/01` é trabalho do `36` T-10.3, não deste plano (DEP-3) |

## 3. Problema e tese da página

**Problema da página:** João chega (link da bio, busca, indicação) com a mente de quem "já baixou três apps de estudo e usou dois dias cada" (`14` §3). Tem conteúdo sobrando e pouco dinheiro. Qualquer página que prometa "mais conteúdo", "aprovação" ou "revolução" ele já viu e ignora.

**Tese:** a página vence se, em poucos segundos, João entender que o Foca **tira dele a decisão que trava** ("por onde eu começo?") e **torna o recomeço barato**, e se o custo de testar parecer quase zero (sem e-mail, sem senha, sem pagar para começar). A página não argumenta com números; ela **mostra o app decidindo**, com o motivo à vista.

**Teste do João (`14` §0):** cada seção da §11 declara a pergunta do João que ela responde. Seção sem pergunta sai.

## 4. Objetivos

| ID | Objetivo |
|---|---|
| O-1 | Levar João a tocar em **"Começar agora"** → `{APP_URL}/quiz`. Uma ação principal, repetida no máximo 4 vezes (§11, CTA map) |
| O-2 | Hero que passa no **teste de 5 segundos**: categoria (preparação para o ENEM), benefício (o próximo passo já está escolhido), público (quem estuda no intervalo), ação (Começar agora) |
| O-3 | Mostrar o **produto real** funcionando: trilha/atividade com motivo, lição por passos, "Não sei", explicação em camadas, faixas, revisão, sequência com congelamento |
| O-4 | Responder as objeções validadas da §7 sem inventar prova |
| O-5 | Página inconfundivelmente Foca (caderno rabiscado), que não pareça template nem página gerada por IA (§24, R-3 e R-8) |
| O-6 | Rodar, testar, pré-visualizar e publicar **isoladamente** em `landing/`, com zero alteração no app |
| O-7 | Lighthouse mobile ≥ 90 em Performance e 100 em Acessibilidade, Boas práticas e SEO; CLS < 0,05; LCP < 2,5 s em 4G simulado |
| O-8 | Arquitetura pronta para integração futura sem reescrever (§22) |

## 5. Não objetivos

- Integrar a landing ao app, mudar rotas, `__root.tsx`, `welcome.tsx`, `index.tsx`, `brand.ts`, `styles.css` ou o deploy do app.
- Corrigir a copy do app (welcome/splash "60 segundos", "Checkpoint"): é o `36` Fase 10.
- Página de preço, planos, checkout, "Premium" (preço nunca definido — `08` §11; `premium.tsx` é demonstração, decisão P-1).
- Depoimentos, contadores de alunos, logos de escolas, notas, "aprovados", selos, avaliações de loja.
- Blog, páginas internas, termos de uso e política de privacidade reais (ver DEP-5), cadastro de e-mail/lista de espera, formulário.
- Analytics externo, pixel, cookie, fingerprint, A/B test com serviço externo.
- Lottie, Motion (framer), Three.js, vídeo, som na página.
- Dark mode com botão de alternância (o tema segue o sistema; §12.7).
- Loja de apps (não existe app nativo).
- Mudar a frase de posicionamento do `08` §1 (decisão D-1 do usuário).

## 6. Análise da persona para a landing

Fonte: `14` e `copy/01` §1–§3. Hipótese de trabalho, **sem entrevista** — nada de "os alunos dizem".

| Dimensão | João (o que a fonte registra) | O que isso manda na página |
|---|---|---|
| O que diz que quer | Passar no vestibular/ENEM para um curso específico (`14` §1) | Não prometer aprovação. Pode citar "sua prova e seu curso" como dado que o app usa (é o que o `/quiz` pergunta) |
| O que realmente quer | **Parar de se sentir atrasado.** Fechar o dia pensando "pelo menos hoje eu fiz alguma coisa" (`14` §1, §6) | Tom de **alívio**, não de ambição. Nada de "conquiste sua vaga" |
| Dor central | Decidir por onde começar paralisa; não sabe onde está fraco (`14` §3) | Promessa-guia: **"O próximo passo já está escolhido."** Prova: o card de atividade com o motivo |
| O que a dor não é | Falta de conteúdo, de método, de capacidade, de ferramenta (`14` §3) | Não vender conteúdo. Uma seção reconhece que ele já tem material (§11 S-6) |
| Como estuda hoje | Cronograma de domingo que cai na quarta; videoaula longa demais para começar; tempo picado (`14` §2, §4) | Seção "A cena" (S-2) com a semana. Atividades curtas "que cabem no intervalo" (sem minutos) |
| Por que procrastina | O custo de recomeçar sobe a cada abandono; a culpa o faz evitar (`14` §2, §4) | Seção de recomeço **sem culpa** (S-5). Nunca cobrar, nunca dramatizar |
| Relação com apps | Já baixou três, usou dois dias cada (`14` §3); cético com "mais um app" | Honestidade como ativo (§9.4): dizer o que o Foca **não** faz. Mostrar o produto em vez de adjetivos |
| Dinheiro | Pouco; o concorrente dele é grátis (`14` §1, §9) | Reduzir risco: sem e-mail, sem senha, sem pagar para começar (§10) |
| Onde está | Celular, entre uma coisa e outra; atenção disputada com o feed (`14` §4) | Mobile-first de verdade; CTA acima da dobra em 390×844; página curta o bastante para ler no ônibus |
| Nível de consciência do problema | Alto: ele sabe que não mantém o ritmo (sente a culpa) | Não gastar a página explicando que procrastinar é ruim. Uma seção curta de reconhecimento basta |
| Nível de consciência da solução | Baixo/cético: conhece "app de questões" e "videoaula", não conhece "app que escolhe a ordem" | O miolo da página é **mostrar o mecanismo** (S-3, S-4) |
| Gatilho para testar | Custo quase zero + ver que o app decide por ele | CTA com microcopy de risco zero e demo interativa (S-4) |

**Jobs (`copy/01` §3) que a página vende:** o principal ("quando tenho 2 minutos livres e bate a sensação de que estou ficando pra trás, quero fazer algo que conte de verdade…"), "quando abro sem saber o que estudar, quero que ele diga o próximo passo e por quê", "quando erro, quero entender sem me sentir burro", "quando não sei, quero dizer isso em vez de chutar", "quando volto depois de dias parado, quero recomeçar sem encarar o quanto atrasei".

## 7. Matriz de objeções

Só entram objeções com lastro no `14` §7 ou deduzidas diretamente dele/do `08` §10. As marcadas **[inferida]** são inferência declarada, não dado.

| Objeção | Origem psicológica | Resposta estratégica | Seção | Formato visual | Ângulo de copy |
|---|---|---|---|---|---|
| "Nem sei por onde começar." (`14` §7) | Paralisia de escolha | O app escolhe e mostra o motivo | S-1 Hero, S-3 | Retrato do card de atividade com a frase de motivo destacada por marca-texto desenhado | "O próximo passo já está escolhido." |
| "Agora não dá tempo de fazer direito." (`14` §7) | "Direito" parece grande | Unidade pequena, com fim | S-3 (passo 3), FAQ | Lição de 4 a 8 questões; "dá para fazer uma atividade no intervalo" | Tamanho concreto, **sem minutos** |
| "Já tentei, não funcionou." (`14` §7) | Custo de recomeço acumulado | Recomeço barato, sem sermão, sequência com congelamento | S-5 | Calendário com o dia coberto pelo congelamento | "Parou uns dias? Continua de onde estava." |
| "Isso aqui é só mais um app." (`14` §7) | Ceticismo aprendido | Mostrar o mecanismo real; dizer o que não prometemos | S-3, S-4, S-7 | Retratos reais + demo jogável + bloco de honestidade | Fatos verificáveis, zero adjetivo |
| "Já tenho YouTube / apostila / o app oficial." (`08` §10) | "Conteúdo resolve" | Concordar: continue usando; o Foca cuida da ordem | S-6 | Duas colunas "o que você já tem" × "o que o Foca faz com isso" | Respeito ao material dele; sem denegrir ninguém |
| "Não quero pagar." (`14` §9) | Baixo ticket | Começar não custa nada; não pede cartão (D-LP-1) | Microcopy do CTA, FAQ | Linha de risco sob cada CTA | Fato curto, sem "grátis para sempre" |
| "Não quero criar conta / dar e-mail." [inferida de `14` §8, "formulário é atrito"] | Atrito | Sem e-mail e sem senha | Microcopy, S-3 passo 1, FAQ | — | Fato |
| "Tenho vergonha de errar / sou ruim nisso." [inferida de `14` §3 e dos jobs de erro] | Medo de se sentir burro | "Não sei" em toda questão; explicação na hora; faixa "Base em construção" sem julgamento | S-3 passo 4, S-4, FAQ | Botão "Não sei" funcionando na demo | "Errar mostra o que revisar." |
| "Tem gente muito mais adiantada que eu." (`14` §7) | Comparação | **Não responder com ranking** (é mock). A página simplesmente não compara ninguém | — | — | Ausência deliberada |
| "Já faço cursinho." [inferida] | Redundância | O Foca não substitui a aula; organiza o que praticar e revisar entre aulas | FAQ | — | Honesto sobre o limite |
| "Meus dados vão para onde?" [inferida; público menor de idade] | Desconfiança | O progresso fica no aparelho; a página não coleta nada | FAQ, rodapé | — | Fato, incluindo a limitação (trocar de celular não leva o progresso) |

## 8. Funil psicológico

Adaptado ao João: o gatilho é alívio, então a página **baixa a temperatura** em vez de subir.

```text
S-1 HERO .............. "Ah, é um app de ENEM que decide o que eu estudo agora."        (categoria + promessa + risco zero)
S-2 A CENA ............ "Isso sou eu no domingo e na quarta."                           (reconhecimento, sem culpa)
S-3 COMO FUNCIONA ..... "Entendi: eu abro, ele escolhe, mostra o porquê, e o que eu     (compreensão pelo mecanismo real)
                         estudei volta."
S-4 TENTA UMA ......... "Eu mesmo toquei e vi como funciona."                           (desejo por experiência, não por promessa)
S-5 PAROU UNS DIAS? ... "Se eu largar, voltar não vai doer."                            (remove o medo nº 1 dele)
S-6 O QUE JÁ TEM ...... "Não é para trocar meu material. Faz sentido."                  (objeção de conteúdo)
S-7 A FOCA E O QUE NÃO  "Eles não estão me enrolando."                                   (confiança por honestidade)
    PROMETEMOS
S-8 DÚVIDAS ........... "Sem pagar, sem e-mail, o progresso fica aqui."                (redução de risco)
S-9 FECHAMENTO ........ "Vou testar."                                                   (ação)
```

## 9. Estratégia de mensagem e copy v0

### 9.1 Plataforma de mensagem (decidida — não reabrir sem aprovação)

| Campo | Texto |
|---|---|
| Público | Quem se prepara para o ENEM e estuda no celular, em tempo picado |
| Promessa única | **O próximo passo já está escolhido.** (`copy/01` §5.3) |
| Big idea | Recomeçar custa quase nada, porque a decisão já vem tomada |
| Mecanismo que prova | Atividade com a frase de motivo; lição de 4 a 8 questões; "Não sei"; explicação na hora; faixas por habilidade; revisão que volta; sequência com congelamento |
| Diferença | Material ele já tem. O Foca escolhe a ordem, acompanha o que ele acerta e erra e torna o recomeço barato (`copy/01` §5.1) |
| Tom | `copy/02`, matriz "Marketing": mais energia que a interface, mesma honestidade. Colega de estudo atento e direto. Imperativo informal no corpo ("Tenta", "Olha"); botão no infinitivo |
| Assinatura de humor | **Uma** linha da Foca na página inteira, sobre ela viver numa pedra (`copy/04` §3.3; D-5). Fica no fechamento (S-9) |

### 9.2 Regras de copy específicas da landing (somam-se às dez proibições do `COPY.md`)

1. **Zero travessão** (— e –) em qualquer texto visível, `alt` e `aria-label` da landing (`design-taste-frontend` §9.G). Use ponto, vírgula, dois-pontos ou parênteses. (Os docs do projeto continuam podendo usar travessão; a landing não.)
2. Proibido na landing: "60 segundos", qualquer duração em segundos/minutos, "aprova", "aprovação", "vaga", "nota", "%", "domina", "Mastery", "IA que descobre suas lacunas", "revolucion", "incrível", "transforme", "potencialize", "desbloqueie", "jornada", "grátis para sempre", "garantido", "milhares", "Duolingo".
3. Proibido o padrão "Não é X. É Y." e variações ("Mais do que X, Y"; "não é sobre X").
4. Eyebrows (rótulo pequeno em caixa alta acima de título): **no máximo 3** na página (hero conta como 1).
5. Números só de fato do produto listado em §9.4. Nunca número de pessoas.
6. Todas as strings em `landing/src/content/copy.ts` (§15.5). Nenhum texto visível hardcoded no JSX.
7. Nomes de concorrentes não aparecem. Diz-se "videoaula", "apostila", "app oficial".
8. Termos do glossário (`copy/03` §3): trilha, lição, atividade, revisão, checagem, nivelamento, faixa, sequência, Foca. "Aula" só em "videoaula". "Streak" nunca.

### 9.3 Copy v0 (rascunho do Opus — base obrigatória das passadas da Fase 13)

> O executor **refina** estas strings pelo pipeline da §21 (clareza, concisão, voz, CRO). Não pode: mudar a promessa, acrescentar afirmação fora da §9.4, trocar o H1 por um que não esteja na lista de candidatos, acrescentar seção. Toda troca de sentido vai para `docs/41` com o porquê.

**Navegação:** logo "Foca" (link para `#topo`) · "Como funciona" (`#como-funciona`) · "Dúvidas" (`#duvidas`) · "Entrar" (`{APP_URL}/`) · botão **"Começar agora"**.

**S-1 Hero**
- Eyebrow: `Preparação para o ENEM`
- **H1 (escolhido):** `Você abre. O próximo passo já está escolhido.`
- Candidatos aprovados para teste futuro (só estes): H1-B `Para quem estuda no intervalo: o Foca escolhe a próxima atividade e mostra por quê.` (`copy/01` §5.4 opção 3) · H1-C `Chega de decidir por onde começar. O Foca escolhe o próximo passo.`
- Subtítulo (≤ 22 palavras): `O Foca acompanha o que você acerta e erra e escolhe o que estudar agora. Atividades curtas, que cabem no intervalo.`
- CTA: `Começar agora`
- Microcopy de risco (sob o CTA): `Sem e-mail e sem senha. Começar não custa nada.` *(depende de D-LP-1)*
- Anotação de margem no retrato (fonte manuscrita, grafite): `o motivo vem junto`

**S-2 A cena** (sem id de navegação)
- H2: `Domingo você monta o cronograma. Na quarta, ele já ficou pra trás.`
- Semana (5 células): `Dom` "cronograma novo" · `Seg` "feito" · `Ter` "metade" · `Qua` "hoje não dá" · `Qui` "segunda eu recomeço"
- Corpo: `Material você já tem de sobra. O que pesa é decidir por onde começar toda vez e voltar depois de parar.`
- Ponte: `O Foca tira essas duas decisões da sua frente.`

**S-3 Como funciona** (`id="como-funciona"`)
- H2: `Como o Foca escolhe o que vem agora`
- Passo 1 — título `Conta o que você vai prestar` · corpo `Prova, curso e as matérias que pesam pra você. Sem e-mail e sem senha.`
- Passo 2 — `Se quiser, faz um nivelamento` · `É opcional e tem botão "Não sei". O resultado mostra onde a base está firme e onde ainda está em construção. É um ponto de partida, e fica mais preciso conforme você estuda.` *(última frase = string aprovada `COPY.nivelamento.resultadoCorpo`)*
- Passo 3 — `Abre e o próximo passo está ali` · `Cada atividade vem com o motivo: assunto novo, revisão na hora certa, uma parte que travou. Lições de 4 a 8 questões.`
- Passo 4 — `Errou? Você vê onde` · `A explicação aparece na hora. Se não bastar, "Explicar melhor" chama a Foca. Não sabe? Toca em "Não sei" em vez de chutar.`
- Passo 5 — `O que você estudou volta` · `Na hora de revisar, o assunto aparece de novo. E cada habilidade mostra em que faixa está: Base em construção, No caminho ou Base firme.`

**S-4 Tenta uma** (`id="tenta-uma"`)
- H2: `Tenta uma.`
- Sub: `Uma questão de verdade, do jeito que ela aparece no app.`
- Botões internos: rótulos **iguais aos do app** (`COPY.questao.naoSei` = "Não sei"; verificar = `COPY.*.verificar` = "Verificar"; "Ver resolução"; o executor confere em `src/lib/copy.ts` no momento da Fase 9 e copia literal)
- Depois de responder: `No app, essa resposta já entra na conta do que você sabe e muda o que vem depois.`
- CTA: `Começar agora` (mesmo rótulo; mesma intenção)

**S-5 Parou uns dias?**
- H2: `Parou uns dias? Continua de onde estava.`
- Corpo: `A sequência tem congelamento: a cada 7 dias de estudo você ganha um, e dá pra guardar até 2. Quando você volta, o app vai direto pro próximo passo.`

**S-6 O que você já tem**
- H2: `Continua usando o que você já usa.`
- Coluna "O que você já tem": `Videoaula para entender` · `Apostila com a matéria toda` · `App oficial de graça`
- Coluna "O que o Foca faz com o seu tempo": `Escolhe o que estudar hoje` · `Traz de volta o que está na hora de revisar` · `Mostra onde a base já firmou`

**S-7 A Foca, e o que a gente não promete**
- H2: `A Foca explica quando você pede.`
- Corpo: `Ela não abre sozinha quando você erra. Você chama, pergunta do seu jeito e pode mandar a foto de uma questão.` *(depende de V-1)*
- Bloco "O que o Foca não faz" (3 linhas, lista): `Não promete nota nem aprovação.` · `Não te compara com outros alunos.` · `Não cobra quando você some.`

**S-8 Dúvidas** (`id="duvidas"`) — perguntas nesta ordem:
1. `Precisa pagar?` → `Não. Hoje você usa o Foca sem pagar nada e sem cartão.` *(D-LP-1)*
2. `Preciso criar conta?` → `Não precisa de e-mail nem de senha. Você responde umas perguntas sobre sua prova e já começa.`
3. `Onde fica meu progresso?` → `Neste aparelho, no navegador. Se você trocar de celular ou limpar os dados do navegador, o progresso não vai junto.`
4. `Quanto cabe numa lição?` → `De 4 a 8 questões. Dá pra fazer uma no intervalo e parar quando quiser.`
5. `Já faço cursinho. Serve pra mim?` → `Serve pra escolher o que praticar entre uma aula e outra e pra revisar o que já viu. O Foca não substitui a aula.`
6. `E se eu estiver muito mal numa matéria?` → `Tem faixa pra isso: Base em construção. O app começa pelo que falta, com lições curtas e o "Não sei" sempre liberado.`
7. `Tem redação?` → *(texto depende de V-3; se o conteúdo de redação estiver acessível na trilha)* `Tem exercícios de redação separados por habilidade, no mesmo formato curto.`
8. `O Foca tem ligação com o MEC ou o INEP?` → `Não. O Foca é um projeto independente de preparação para o ENEM.`

**S-9 Fechamento**
- H2: `O próximo passo já está escolhido.`
- Corpo: `Falta só você abrir.`
- CTA: `Começar agora` · microcopy igual à do hero
- Fala da Foca (balão, a única linha de humor da página): `Enquanto isso, eu volto pra minha pedra.`

**Rodapé:** marca · `Preparação para o ENEM` · links `Como funciona`, `Dúvidas`, `Entrar` · `O Foca não tem vínculo com o INEP nem com o MEC.` · `© 2026 Foca` · (termos/privacidade: DEP-5 — **não** criar links para páginas que não existem).

### 9.4 Afirmações permitidas (lista fechada)

Cada afirmação da página precisa estar aqui. Coluna "fonte" é a evidência; coluna "estado" diz se precisa verificação antes de publicar.

| # | Afirmação | Fonte | Estado |
|---|---|---|---|
| F-1 | O próximo passo vem escolhido, com o motivo à vista | `copy/01` §4; `COPY.jornada.motivos`; `32` F12 | ✅ |
| F-2 | Atividades curtas, que cabem no intervalo (sem duração) | `copy/06` §3 | ✅ |
| F-3 | Lição de 4 a 8 questões | `25`; `copy/06` §3 | ✅ (conferir V-2) |
| F-4 | Sem e-mail e sem senha para começar | `/quiz`, `CLAUDE.md` | ✅ |
| F-5 | Começar não custa nada / sem cartão | Não existe cobrança no produto | ⚠️ D-LP-1 |
| F-6 | Nivelamento opcional, com "Não sei", resultado em faixas, ponto de partida | `36` T-03/T-06.1 ✅; `COPY.nivelamento` | ✅ |
| F-7 | "Não sei" em toda questão | `32` F6 | ✅ |
| F-8 | Explicação na hora; "Ver resolução"; "Explicar melhor" chama a Foca | `32` F7 (divergência F7.1 registrada: estes são os rótulos reais) | ✅ |
| F-9 | A Foca não abre sozinha quando você erra | `20`; `copy/04` §3 | ✅ |
| F-10 | Pode mandar foto de questão para a Foca | `08` §6 H1; `COPY.tutor.saudacaoSemFoco` | ⚠️ V-1 (chave de IA em produção) |
| F-11 | O que você estudou volta na hora de revisar | `copy/01` §4 | ✅ |
| F-12 | Faixas: Base em construção, No caminho, Base firme | `copy/03` §3 | ✅ |
| F-13 | Sequência com congelamento: 1 a cada 7 dias de atividade, até 2 guardados | `16` §6; `store.ts` | ✅ (conferir V-4) |
| F-14 | Ao voltar, o app vai direto ao próximo passo | `copy/02` matriz "Retorno" | ✅ |
| F-15 | Progresso fica no aparelho; trocar de celular não leva junto | Arquitetura local-first (`CLAUDE.md`) | ✅ |
| F-16 | Não compara com outros alunos | Ranking é mock; a landing não o mostra | ✅ |
| F-17 | Exercícios de redação no mesmo formato curto | `26` §2 (capítulos legados) | ⚠️ V-3 |
| F-18 | Sem vínculo com INEP/MEC | Fato | ✅ |

## 10. Freemium: o que pode e o que não pode ser dito

- **Documentado:** o modelo é B2C freemium/low ticket, "freemium obrigatório", e "o free precisa entregar o loop inteiro" (`08` §11; `14` §9). **Não documentado:** o que será pago, preço, quando. `premium.tsx` é demonstração (P-1).
- **A página não tem seção de preço.** Motivo: não há preço, e uma seção "Grátis × Premium" sem conteúdo real viraria promessa ("o gratuito sempre terá X") que ninguém decidiu. O risco é tratado na **microcopy do CTA** e na FAQ 1.
- **Pode:** "Começar não custa nada", "Hoje você usa sem pagar nada e sem cartão" — verdade hoje, porque não existe cobrança. **Não pode:** "grátis para sempre", "100% grátis", "plano gratuito", "Premium", qualquer preço, "sem anúncios".
- **Dependência D-LP-1 (usuário):** confirmar que a página pode dizer "Começar não custa nada" e "Hoje você usa sem pagar nada". Se o usuário não confirmar antes da publicação, trocar a microcopy por `Sem e-mail e sem senha.` e tirar a FAQ 1. A implementação segue com as duas versões em `copy.ts` (`riscoComPreco` / `riscoSemPreco`) e uma flag `LP_FALA_DE_PRECO` em `landing/src/config.ts` (default `true`), para a troca ser uma linha.

## 11. Arquitetura da informação (seção a seção)

Ordem decidida. Nenhuma seção nova sem aprovação. Largura de referência: mobile 390, tablet 768, desktop 1280 (container máx. 1200).

**Mapa de CTA (máximo 4 botões "Começar agora" na página + 1 na navbar + 1 sticky no mobile):** navbar (compacto) · S-1 hero · S-4 depois da demo · S-9 fechamento. Sticky mobile aparece só entre o fim do hero e o início de S-9. Nenhum outro botão primário (azul) na página. "Entrar" é link de texto.

**Famílias de layout (nenhuma repetida em seções vizinhas):** split assimétrico (S-1), faixa horizontal de calendário (S-2), texto rolando ao lado de celular fixo (S-3), cartão de exercício centrado (S-4), calendário semanal com legenda lateral (S-5), duas colunas contrastadas em folha (S-6), conversa + lista curta (S-7), acordeão estreito (S-8), folha grande centrada com a Foca (S-9).

---

### S-0 — Navbar

| Campo | Especificação |
|---|---|
| Objetivo psicológico | Orientação mínima e saída para quem já usa |
| Pergunta | "Onde eu clico?" |
| Conteúdo | Logo (FocaMark contorno 28 px + "Foca" em Space Grotesk 700 20px) · links âncora "Como funciona", "Dúvidas" · link "Entrar" · botão compacto "Começar agora" (`btn-primary` com altura 44 px) |
| Visual | Fundo transparente sobre o papel no topo; ao rolar 8 px, ganha fundo `neve` 92% + borda inferior 2px `gelo` (sem blur, sem sombra) |
| Componentes | `Navbar`, `LogoLink`, `CtaButton size="compact"` |
| Motion | Troca de fundo 180 ms `--lp-ease`; nenhuma animação de entrada |
| Trigger | Sentinela de 8 px no topo (IntersectionObserver), nunca `scroll` listener |
| Desktop | Uma linha, altura 72 px; links centrais; "Entrar" + CTA à direita |
| Mobile (< 768) | Altura 56 px; logo à esquerda; à direita só "Entrar" (texto) e CTA compacto. **Sem menu hambúrguer** (dois links âncora não justificam) |
| Assets | `foca-line-*` (claro/escuro) |
| Skills | `design-taste-frontend` (nav em uma linha, ≤ 80 px) |
| Critério | Uma linha em 1280 e em 320; foco visível em todos os itens; `aria-label="Principal"` no `<nav>` |

### S-1 — Hero

| Campo | Especificação |
|---|---|
| Objetivo psicológico | Reconhecimento imediato da categoria + promessa + risco zero |
| Pergunta | "O que é isso e por que eu ligaria?" |
| Objeção | "Nem sei por onde começar"; "mais um app" |
| Mensagem principal / secundária | H1 + subtítulo (§9.3) |
| Copy angle | Alívio: a decisão já foi tomada |
| Conteúdo | Eyebrow, H1, subtítulo, CTA, microcopy de risco; retrato do celular com o **card de atividade da trilha mostrando a frase de motivo**; anotação de margem "o motivo vem junto" com seta de lápis; a Foca (cor, neutra) apoiada na borda do celular |
| Visual | Papel `neve` com **pauta** (`surface-pauta` adaptada, §12.4) só atrás da coluna do celular. H1 em `--lp-display-xl`. Uma palavra do H1 ("escolhido") com **marca-texto** desenhado (§12.5) — é o único marca-texto da dobra |
| Componentes | `Hero`, `PhoneFrame`, `ProductShot`, `MarginNote`, `PencilArrow`, `HighlightStroke`, `CtaButton`, `RiskNote`, `FocaMark` (local) |
| Motion | Entrada em CSS (funciona sem JS): linhas do H1 sobem 16 px com máscara, stagger 80 ms (total ≤ 400 ms); celular sobe 24 px + opacidade, 560 ms, atraso 120 ms; marca-texto se desenha (scaleX 0→1, origem à esquerda) 420 ms após 520 ms; seta de lápis desenha (stroke-dashoffset) 480 ms após 700 ms; retângulo de destaque sobre a frase de motivo no retrato acende 320 ms após 900 ms. Foca: `pop` 320 ms após 600 ms. Tudo zerado em `prefers-reduced-motion` |
| Trigger | Carregamento da página (CSS). Nada depende de GSAP no hero |
| CTA | "Começar agora" → `appUrl('/quiz')`, evento `hero_cta_click` |
| Desktop (≥ 1024) | Grid 12 colunas: texto nas colunas 1–6 (alinhado à esquerda; H1 com `max-width: 14ch`, 2–3 linhas), celular nas colunas 8–12 com a Foca saindo pela borda esquerda do aparelho; altura `min-h-[100dvh]` limitada a 880 px; padding topo ≤ 96 px |
| Tablet (768–1023) | Texto em cima (máx. 36rem), celular abaixo à direita com 70% da largura |
| Mobile (< 768) | Ordem: eyebrow, H1 (3 linhas, ≈ 38 px), subtítulo, CTA largura total, microcopy, celular **cortado pela metade** (mostra o topo com o card), a Foca com 88 px. CTA precisa ficar inteiro acima da dobra em 390×844 e 360×740 |
| Assets | Retrato `hero-atividade` claro/escuro (§14.2), `foca-color-320.png`, contorno, SVG de seta e marca-texto (§12.5) |
| Skills | `design-taste-frontend` (§14 pre-flight "Hero fits the viewport", "Hero stack discipline"), `ogilvy-copywriting` (H1), `motion-design` (entrada) |
| Dependências | D-LP-1 (microcopy), D-LP-2 (H1), retrato da Fase 6 |
| Critério | Teste de 5 segundos (§26.3) passa; CTA acima da dobra nos 3 viewports; LCP é o H1 ou o retrato (pré-carregado) |

### S-2 — A cena

| Campo | Especificação |
|---|---|
| Objetivo psicológico | "Isso sou eu" — reconhecimento sem culpa |
| Pergunta | "Eles entendem como eu estudo?" |
| Objeção | "Já tentei, não funcionou" (planta a resposta de S-5) |
| Conteúdo | H2, faixa de 5 dias (Dom→Qui) como página de agenda: cada dia com uma anotação manuscrita curta; Seg com check de lápis; Ter com check pela metade; Qua e Qui vazios com borda tracejada (padrão "ainda não rabiscado" do `18` §5). Corpo e ponte |
| Visual | Faixa sobre `cards` com borda 2px `gelo`, raio 20. Sem vermelho, sem ícone triste. Ritmo: muito espaço vazio acima e abaixo (é a respiração da página) |
| Componentes | `WeekStrip`, `DayCell`, `PencilCheck` |
| Motion | Ao entrar 40% na viewport: os checks de Seg e Ter se desenham (stroke 360 ms, stagger 120 ms). Qua/Qui não animam (a ausência é o ponto). Nada de loop |
| Trigger | ScrollTrigger `once: true`, `start: "top 70%"` (ou IntersectionObserver se GSAP ainda não carregou) |
| CTA | Nenhum |
| Desktop | H2 à esquerda em 7 colunas; faixa ocupa 10 colunas deslocada para a direita (assimetria); corpo abaixo da faixa, 6 colunas |
| Mobile | H2 em 2–3 linhas; faixa com 5 células de 56–64 px lado a lado (cabe em 320 com gap 6); anotações em 2 linhas curtas; se não couber em 320, anotação some e fica só o dia + ícone (anotação vira `aria-label`) |
| Assets | SVGs de check (desenhados como traço de lápis; §12.5) |
| Skills | `design-taste-frontend`, `humanizer` (corpo, na Fase 13) |
| Critério | Nenhuma palavra de culpa ("fracasso", "desistiu", "preguiça"); passa no teste de voz |

### S-3 — Como funciona (seção memorável: scrollytelling)

| Campo | Especificação |
|---|---|
| Objetivo psicológico | Compreensão pelo mecanismo; "ele decide por mim, e mostra por quê" |
| Pergunta | "Como isso funciona na prática?" |
| Objeções | "Por onde começo", "não tenho tempo", "tenho vergonha de errar", "mais um app" |
| Conteúdo | H2 + 5 passos (§9.3). Cada passo tem um retrato real (§14.2): `quiz-prova`, `nivelamento-resultado`, `atividade-motivo`, `feedback-explicar`, `faixas-progresso` |
| Visual | **Margem de caderno:** uma linha vertical na borda esquerda do bloco de texto que se preenche de **azul-caneta** conforme o leitor avança (é progresso real de leitura → uso permitido do azul). Cada passo tem um marcador de nó igual ao da trilha (círculo 20 px: tracejado → preenchido com check quando lido). Isso cita literalmente a trilha do app |
| Componentes | `HowItWorks`, `StoryStep`, `StickyPhone`, `ShotStack`, `MarginProgress`, `StepNode` |
| Motion (desktop ≥ 1024) | Celular em `position: sticky` (top 12vh) na coluna direita; os 5 passos rolam em fluxo normal na esquerda, cada um com `min-height: 70vh`. **Sem pin, sem scroll-jacking, sem snap.** Quando um passo cruza 50% da viewport, ele vira ativo: o retrato do celular troca com **wipe de papel** (o novo entra com `clip-path: inset(100% 0 0 0) → inset(0)`, 420 ms, `--lp-ease`, o antigo fica embaixo), o nó do passo se preenche (220 ms), o texto ativo sobe a opacidade de .45 → 1. A linha da margem acompanha o scroll (`scrub: 0.3`, `scaleY`). Retratos de todos os passos já estão no DOM (empilhados), só o ativo visível |
| Motion (mobile/tablet < 1024) | **Sem sticky.** Cada passo vira um bloco: nó + título + corpo + retrato recortado (60% da altura do celular, mostrando a parte que importa, §14.3). Reveal simples ao entrar (sobe 16 px + opacidade, 320 ms). A linha de margem vira um trilho vertical fixo à esquerda dos nós, que se preenche por passo (não por pixel) |
| Trigger | ScrollTrigger por passo (`start: "top center"`, `end: "bottom center"`, `onToggle`); um ScrollTrigger scrub para a linha. Com GSAP ainda não carregado ou reduced motion: todos os passos com opacidade 1, retrato do passo embutido abaixo do texto (layout mobile) |
| CTA | Nenhum dentro da seção (a demo vem logo depois) |
| Desktop | Grid 12: texto colunas 1–5, celular colunas 7–11; H2 acima, 8 colunas |
| Mobile | Descrito acima; retratos com `aspect-ratio` fixo para zero CLS |
| Assets | 5 retratos × claro/escuro × 2 larguras (§14.2) |
| Skills | `motion-design` (intenção e ritmo), GSAP `gsap-scrolltrigger`, `gsap-react`, `gsap-performance` (do cache), `design-taste-frontend` §5 (motivação do movimento) |
| Dependências | Fase 6 (retratos), Fase 10 (GSAP) |
| Critério | Conteúdo 100% legível sem JS e com reduced motion; teclado percorre os passos em ordem; nenhum `scroll` listener; 60 fps no Chrome com CPU 4× mais lenta (§16) |

### S-4 — Tenta uma (demo interativa)

| Campo | Especificação |
|---|---|
| Objetivo psicológico | Desejo por experiência: "eu toquei e funcionou" |
| Pergunta | "Como é usar de verdade?" |
| Objeções | "Mais um app", "tenho vergonha de errar" |
| Conteúdo | Um exercício de múltipla escolha **real** do banco (critérios de escolha em §14.4), com as alternativas, botão "Não sei", botão "Verificar", folha de feedback com a explicação original, "Ver resolução" se existir no item. Depois da resposta: linha "No app, essa resposta já entra na conta…" + CTA |
| Visual | Cartão central (`cards`, borda 2 px, raio 28 = "folha"), largura máx. 560 px, sobre papel com pauta. Alternativas no padrão do app (borda 2 px, seleção com borda azul + peso 600, `rounded-lg`). Feedback **com as cores de acerto/erro** (único lugar da página onde verde/vermelho aparecem, porque é feedback de resposta — regra do `DESIGN.md`) + ícone + palavra |
| Componentes | `TryOneDemo`, `ChoiceOption`, `DontKnowButton`, `FeedbackPanel`, `CtaButton` |
| Motion | Toque na alternativa: 80 ms (`btn` press). Feedback sobe 280 ms (`slide-up`). Erro: shake 180 ms/4 px (valores do app). Acerto: pop do ícone 320 ms. Sem confete, sem XP inventado |
| Trigger | Interação do usuário |
| CTA | "Começar agora" (sempre visível abaixo do cartão; depois da resposta, a linha "No app, essa resposta…" aparece logo acima dele). Evento `demo_cta_click` |
| Desktop / Mobile | Mesmo componente; no mobile, largura total com gutter 20 px; botões de 52 px |
| Estados | inicial · alternativa selecionada · verificado certo · verificado errado · "Não sei" (neutro: sem vermelho, mostra o caminho) · resolução aberta · "Tentar outra vez" (reinicia) |
| Assets | JSON do item copiado (§14.4) |
| Skills | `design-taste-frontend` (estados), `vercel-react-best-practices` (estado local, sem re-render desnecessário) |
| Critério | Funciona só com teclado; `aria-live="polite"` anuncia o resultado; texto do item idêntico ao original (sem skill de copy — `copy/05`) |

### S-5 — Parou uns dias?

| Campo | Especificação |
|---|---|
| Objetivo psicológico | Tirar o medo do recomeço |
| Pergunta | "E quando eu largar?" |
| Objeção | "Já tentei, não funcionou" |
| Conteúdo | H2, corpo, calendário de 7 dias em mono (Space Mono): 4 dias com marca de estudo, 1 dia coberto pelo congelamento (ícone de floco em grafite + rótulo "congelamento"), 2 dias adiante. Um chip de **sequência** em marca-texto com número vindo de dado ilustrativo fixo |
| Visual | Calendário à direita num cartão; texto à esquerda. Marca-texto só no chip da sequência (é recompensa → uso permitido) |
| Componentes | `ComebackCalendar`, `StreakChip` |
| Motion | Ao entrar: os dias se preenchem em cascata (30 ms, total < 250 ms); o dia congelado recebe o floco com pop 320 ms; o chip dá um `bump` (220 ms). Uma vez só |
| Trigger | ScrollTrigger `once`, `top 70%` |
| Mobile | Texto em cima, calendário abaixo com 7 colunas de 38–44 px |
| Nota de honestidade | O número do chip é ilustrativo e **não pode** ser apresentado como dado de aluno; o calendário é um diagrama, com `aria-label` "Exemplo de semana com um dia coberto pelo congelamento" |
| Skills | `motion-design` |
| Critério | Nenhuma menção a dias perdidos, "sumiu", "sentimos sua falta" |

### S-6 — O que você já tem

| Campo | Especificação |
|---|---|
| Objetivo psicológico | Respeitar o que ele já usa; reposicionar o Foca como ordem, não material |
| Pergunta | "Por que não só YouTube/apostila/app oficial?" |
| Conteúdo | H2 + duas colunas (§9.3) |
| Visual | Uma folha grande (`cards`, raio 28) dividida por uma linha tracejada vertical (como a dobra do caderno). Coluna esquerda em grafite neutro com ícones de contorno; coluna direita com três marcadores de nó da trilha (preenchidos). **Sem** tabela de ✓/✗, sem barras comparativas |
| Motion | Nenhuma além do reveal padrão (a seção é informativa: deixar parada) |
| Mobile | Colunas empilhadas; linha tracejada vira horizontal |
| Skills | `ogilvy-copywriting` (ângulo), `design-taste-frontend` (§9.F: sem tabela comparativa com barras) |
| Critério | Nenhum concorrente citado por nome; nada que denigra o material dele |

### S-7 — A Foca, e o que a gente não promete

| Campo | Especificação |
|---|---|
| Objetivo psicológico | Confiança pela honestidade |
| Pergunta | "Qual é a pegadinha?" / "Essa IA vai me encher?" |
| Conteúdo | Esquerda: retrato real do balão da Foca aberto (§14.2 `tutor-balao`); direita: H2, corpo, bloco "O que o Foca não faz" (3 linhas) |
| Visual | O bloco "não faz" usa riscado de lápis (texto normal, com um traço grafite passando por um ícone de X — nada de vermelho). É o momento "rabisco na margem" mais literal da página |
| Motion | Os três riscos se desenham ao entrar (stroke 300 ms, stagger 100 ms) |
| Dependência | V-1: se a chave de IA de produção não estiver configurada quando a página for publicada, a frase sobre foto sai e o retrato usa a resposta de fallback local (que é real) |
| Mobile | Retrato acima, texto abaixo |
| Critério | Nenhuma afirmação sobre "IA que entende você" ou "personalizada" além da §9.4 |

### S-8 — Dúvidas

| Campo | Especificação |
|---|---|
| Objetivo psicológico | Redução de risco final |
| Pergunta | "Tem letra miúda?" |
| Conteúdo | 7–8 perguntas (§9.3), em `<details>/<summary>` nativo (funciona sem JS), primeira fechada |
| Visual | Coluna estreita (máx. 720 px), cada item separado só por espaço + borda inferior 2 px `gelo` (uma borda, não duas — `design-taste-frontend` §9.F) |
| Motion | Abertura: altura com `interpolate-size`/`::details-content` quando suportado; fallback instantâneo. Chevron gira 180° em 180 ms |
| Evento | `faq_open` com o id da pergunta |
| Critério | Cada resposta ≤ 35 palavras; nenhuma resposta promete o futuro |

### S-9 — Fechamento

| Campo | Especificação |
|---|---|
| Objetivo psicológico | Ação, com leveza |
| Conteúdo | H2, corpo, CTA, microcopy, a Foca (cor, 120 px) com balão da única fala de humor |
| Visual | "Folha em branco": cartão grande centrado (raio 28) com pauta leve, muito espaço; o H2 com o mesmo marca-texto do hero sobre "escolhido" (rima visual de abertura e fechamento) |
| Motion | Foca `float-in` 400 ms ao entrar; balão aparece 220 ms depois; marca-texto desenha |
| Evento | `final_cta_click` |
| Mobile | Cartão com margem de 20 px; CTA largura total |

### S-10 — Rodapé

Conteúdo da §9.3. Fundo `neve`, borda superior 2 px `gelo`, texto `nevoa` ≥ 13 px. Sem ícones de redes (não existem perfis). Sem versão, sem cidade, sem hora (`design-taste-frontend` §9.F).

### Sticky CTA mobile

Barra fixa inferior (< 768 px) com fundo `cards`, borda superior 2 px `gelo`, `padding-bottom: env(safe-area-inset-bottom)`, contendo só o botão "Começar agora" largura total (48 px). Aparece quando o CTA do hero sai da viewport; some quando o CTA de S-9 entra ou quando o teclado virtual está aberto; nunca cobre o `<details>` aberto em foco (se o foco estiver dentro de S-8, some). Evento `sticky_cta_click`. Reserva de espaço no fim da página para não cobrir o rodapé.

## 12. Direção visual e Marketing Design Tokens

### 12.1 Leitura de design (declaração exigida pela `design-taste-frontend` §0.B)

> *Reading this as:* landing de consumo para estudantes de 16–19 anos, com a linguagem "caderno rabiscado" do Rabisco na Margem, apoiada no design system próprio do Foca (tokens de `src/styles.css`) sobre Tailwind v4, com movimento contido e motivado.

**Dials:** `DESIGN_VARIANCE: 6` · `MOTION_INTENSITY: 5` · `VISUAL_DENSITY: 3`. Motivo: público jovem e marca com personalidade pede assimetria e rabisco (variância acima do "calmo"), mas o `16`/`18` mandam recompensa proporcional e "tédio produtivo" (movimento abaixo do padrão de landing 6–8); densidade baixa porque o João lê no celular, com pressa.

### 12.2 Precedência sobre a skill de design

Onde a `design-taste-frontend` e o Foca divergem, **o Foca vence**:

| A skill diz | No Foca |
|---|---|
| Fundo creme `#f6f5f1`/`#f7f5f1` é paleta banida | É o **papel da marca** (`--neve`), decidido pelo usuário. Mantém |
| Evitar `lucide-react` | O app já usa `lucide-react`; uma família por projeto → **lucide** na landing, `strokeWidth={2}` |
| Animação padrão com Motion (`motion/react`) | Motion não entra. CSS + GSAP (aprovado por esta spec) |
| Fontes Geist/Satoshi | Space Grotesk, Plus Jakarta Sans, Space Mono (brand). Caveat só como anotação de margem (§12.3) |
| "Nunca div-based fake UI" | Concordamos: o produto aparece por **retratos reais** e por um **componente real jogável** (§14). Nada de mockup de retângulos |
| Emoji desencorajado | Concordamos (e o `copy/02` proíbe em título/CTA) |
| Travessão banido | Concordamos na landing (§9.2 regra 1) |
| Dark mode obrigatório | Concordamos: tokens `.dark` existem; a página segue `prefers-color-scheme` (§12.7) |

### 12.3 Tipografia de marketing

Escala nova, só para a landing (o app mantém a dele). Tokens em `landing/src/styles/marketing-tokens.css`:

| Token | Valor | Uso |
|---|---|---|
| `--lp-display-xl` | `clamp(2.375rem, 1.55rem + 3.4vw, 4.75rem)` / line-height 1.02 / tracking -0.03em / Space Grotesk 700 | H1 do hero e H2 do fechamento |
| `--lp-display-l` | `clamp(1.875rem, 1.4rem + 2vw, 3.25rem)` / 1.06 / -0.025em | H2 de seção |
| `--lp-title` | `clamp(1.1875rem, 1.1rem + .4vw, 1.5rem)` / 1.25 / Space Grotesk 700 | Títulos de passo, perguntas da FAQ |
| `--lp-lead` | `clamp(1.0625rem, 1rem + .3vw, 1.25rem)` / 1.55 / Plus Jakarta 500 | Subtítulo do hero, corpo de destaque |
| `--lp-body` | `1rem` / 1.6 / Plus Jakarta 400 | Corpo |
| `--lp-small` | `0.875rem` / 1.45 / Plus Jakarta 500 | Microcopy de risco, rodapé (nunca abaixo de 13 px) |
| `--lp-label` | `0.75rem` / 1.33 / Space Grotesk 700 / 0.1em / caixa alta / cor `mar-fundo` | Eyebrow (máx. 3 na página) |
| `--lp-data` | Space Mono 700, `tabular-nums` | Calendário, chip de sequência, "4 a 8" |
| `--lp-hand` | Caveat 600, `clamp(1.25rem, 1.1rem + .5vw, 1.625rem)`, cor `abismo` | **Só** anotações de margem: máximo 3 na página (hero, S-3, S-9 opcional). Nunca informação que não esteja também no texto; `aria-hidden="true"` quando repetir texto visível |

Largura de medida: parágrafos com `max-width: 60ch`; H1 com `max-width: 14ch` no desktop.

### 12.4 Cor, superfície e textura

- **Tokens de cor:** exatamente os do app (claro e `.dark`), copiados para `landing/src/styles/tokens.css` (§15.4). Nenhuma cor nova.
- **Regras de reserva valem na íntegra** (`DESIGN.md`): azul-caneta só em CTA, foco, seleção e progresso (inclui a linha de progresso de S-3); marca-texto só como fundo com texto grafite, e na landing só em: palavra-chave do H1 e do H2 de fechamento (mesma palavra), chip de sequência de S-5; verde/vermelho só no feedback de S-4; grafite nunca como fundo grande.
- **Pauta** (`--lp-pauta`): `repeating-linear-gradient(to bottom, transparent 0 27px, color-mix(in oklab, var(--gelo) 60%, transparent) 27px 28px)`; usada só atrás do celular do hero, atrás do cartão de S-4 e dentro da folha de S-9.
- **Tracejado** para "ainda não feito": dias vazios de S-2, nós não lidos de S-3.
- **Rabisco** (SVG de traço, §12.5): em grafite (`abismo`) por padrão; **nunca** azul decorativo.
- Sem gradiente, sem glow, sem glassmorphism, sem ruído/grão, sem ilustração de fundo além da Foca.

### 12.5 Elementos de assinatura (desenhados à mão como SVG de traço)

Todos em `landing/src/components/doodles/`, cada um um `<svg>` com `path` de traço (`stroke-linecap: round`, `stroke-width` 2.5–3), `vector-effect: non-scaling-stroke`, animáveis por `stroke-dasharray/offset`. Autoria: o executor desenha os paths à mão (curvas irregulares, "feitas com lápis"), **não** usa ícones de biblioteca para isso — a regra "sem SVG à mão" da skill vale para **ícones**, e estes são rabiscos de marca, não ícones.

| Elemento | Onde | Descrição |
|---|---|---|
| `HighlightStroke` | H1 hero, H2 S-9 | Faixa de marca-texto inclinada −1,5° atrás da palavra (reusa a ideia do `mark-texto` do app), desenhada por `scaleX` |
| `PencilArrow` | Hero | Seta curva de lápis da anotação até o card do retrato |
| `PencilCheck` | S-2, S-3 | Check irregular |
| `PencilStrike` | S-7 | Risco horizontal sobre o X |
| `MarginRule` | S-3 | Linha vertical da margem (a que se preenche de azul) |

### 12.6 Geometria, espaço e grid

- Raios: os do app (marcador 6, botão 16, cartão 20, folha 28, pílula). `rounded-[Npx]` proibido.
- Elevação: por aresta, igual ao app. Nenhuma sombra difusa na página, inclusive na barra sticky (que usa só borda superior).
- Container: `--lp-container: 1200px`; gutter `20px` (< 768), `32px` (768–1279), `40px` (≥ 1280).
- Espaço vertical de seção: `--lp-section-y: clamp(72px, 9vw, 144px)`; entre título de seção e conteúdo: `clamp(24px, 3vw, 40px)`.
- Grid desktop de 12 colunas, gap 24 px. Mobile: coluna única.
- Z-index documentado em `landing/src/lib/z.ts`: `nav 30`, `sticky-cta 40`, `skip-link 50`. Nada mais.

### 12.7 Tema

`prefers-color-scheme` decide (sem botão). O `index.html` pré-renderizado aplica `.dark` no `<html>` por um script inline minúsculo antes da pintura (lendo só `matchMedia`), e escuta mudança. Retratos do produto trocam por `<picture>` com `media="(prefers-color-scheme: dark)"`. A página inteira fica num tema só (sem seção invertida).

### 12.8 Marketing Design Tokens — registro

Extensões permitidas **só em `landing/`**: `--lp-display-xl`, `--lp-display-l`, `--lp-title`, `--lp-lead`, `--lp-body`, `--lp-small`, `--lp-label`, `--lp-data`, `--lp-hand`, `--lp-container`, `--lp-section-y`, `--lp-pauta`, tokens de movimento `--lp-*` (§13.2), a fonte Caveat como anotação. Nenhuma delas volta para o app sem spec. Na Fase 17, o executor acrescenta uma linha de ponteiro em `docs/DESIGN.md` ("Marketing Design Tokens da landing: `docs/40` §12.8") — só essa linha.

## 13. Sistema de movimento

### 13.1 Princípios

1. **Movimento explica ou dá personalidade; nunca enfeita.** Cada animação da página está na tabela §13.3 com uma frase de motivo. Animação fora da tabela não entra.
2. **Personalidade: "rabisco".** Entradas curtas que parecem traço sendo feito (desenho de linha, máscara que revela), com a curva de entrada do app. Recompensa (chip de sequência, feedback de acerto) usa o `bounce` do app. Nada elástico além disso.
3. **Uma vez só.** Nenhum loop infinito na página (nem na Foca). Reveals com `once`.
4. **Sem sequestro de rolagem:** sem pin, sem snap, sem smooth-scroll de biblioteca, sem velocidade alterada. O único efeito ligado ao scroll em tempo real é a linha de margem de S-3.
5. **Conteúdo visível sem JS.** Estados iniciais "escondidos" só existem com a classe `html.lp-motion`, aplicada por script inline antes da pintura **e** apenas se `prefers-reduced-motion: no-preference`. Se o JS falhar, nada fica invisível.
6. **Orçamento:** no máximo 1/3 dos elementos visíveis em movimento ao mesmo tempo; stagger total ≤ 400 ms; nada de transição acima de 600 ms, exceto a linha de margem (acompanha o scroll).

### 13.2 Tokens de movimento (`landing/src/styles/motion.css`)

| Token | Valor | Uso |
|---|---|---|
| `--lp-ease` | `cubic-bezier(.2,.8,.2,1)` (= `--ease-out` do app) | 80% das animações |
| `--lp-ease-bounce` | `cubic-bezier(.34,1.56,.64,1)` (= app) | Recompensa, Foca `pop` |
| `--lp-ease-in` | `cubic-bezier(.4,0,1,1)` | Saídas (raras) |
| `--lp-dur-quick` | `180ms` | Hover, troca de fundo da nav, chevron |
| `--lp-dur-std` | `320ms` | Reveals, pop, feedback |
| `--lp-dur-slow` | `560ms` | Entrada do celular do hero |
| `--lp-draw` | `420ms` | Desenho de traço (marca-texto, seta, check) |
| `--lp-rise` | `16px` | Distância padrão de subida (24 px só no celular do hero) |
| `--lp-stagger` | `80ms` | Linhas do H1, itens |

Botões e alternativas herdam o comportamento de pressão do app (`btn-primary`: desce 4 px no `:active`, 80 ms).

### 13.3 Mapa de animações (fechado)

| # | Onde | O quê | Motivo (uma frase) | Implementação |
|---|---|---|---|---|
| M-1 | Hero | Linhas do H1 sobem com máscara | Hierarquia: o H1 chega primeiro | CSS keyframes, `html.lp-motion` |
| M-2 | Hero | Celular sobe | O produto é o segundo elemento a ler | CSS |
| M-3 | Hero, S-9 | Marca-texto se desenha na palavra "escolhido" | Aponta a promessa com o gesto da marca | CSS `scaleX` |
| M-4 | Hero | Seta de lápis + destaque na frase de motivo | Mostra onde está a prova da promessa | CSS stroke |
| M-5 | Hero, S-9 | Foca aparece (`pop` / `float-in`) | A mascote "entra em cena" uma vez, como no app | CSS (utilities do app copiadas) |
| M-6 | S-2 | Checks de Seg e Ter se desenham | Narrativa: o cronograma vai se esvaziando | GSAP ScrollTrigger `once` (fallback IO) |
| M-7 | S-3 | Linha da margem preenche em azul | Progresso real da leitura, citando a trilha | GSAP `scrub` |
| M-8 | S-3 | Troca de retrato por wipe de papel + nó preenche | Transição de estado: um passo leva ao próximo | GSAP `onToggle` + CSS `clip-path` |
| M-9 | S-4 | Feedback sobe, shake/pop | Feedback de ação, igual ao app | CSS |
| M-10 | S-5 | Dias preenchem, floco aparece, chip dá bump | Mostra o congelamento cobrindo o dia | GSAP `once` |
| M-11 | S-7 | Riscos de lápis nas 3 linhas | Personalidade: "rabiscamos o que não prometemos" | GSAP `once` |
| M-12 | Todas | Reveal padrão de bloco (sobe 16 px + opacidade) | Ritmo de leitura | `ScrollTrigger.batch` (fallback: visível) |
| M-13 | Nav, FAQ, botões | Hover/press/chevron | Feedback de interação | CSS |

Proibido: parallax, marquee, texto letra a letra, cursor customizado, contagem animada de números, tilt 3D, magnetismo, qualquer loop.

### 13.4 GSAP (aprovado por esta spec, somente em `landing/`)

- Pacotes: `gsap` e `@gsap/react` (hook `useGSAP`). Plugins: só `ScrollTrigger` (vem no pacote `gsap`). `SplitText` **não** é usado (M-1 é por linhas definidas no markup, sem dividir texto).
- **Carregamento tardio:** GSAP é importado dinamicamente (`import('./motion/scroll')`) depois do `load` da janela via `requestIdleCallback` (fallback `setTimeout 200`). O hero nunca depende dele. Chunk separado, ≤ 45 kB gz.
- Registro dentro de um único módulo `landing/src/motion/scroll.ts` com `gsap.registerPlugin(ScrollTrigger)`; toda criação dentro de `gsap.matchMedia()` com as condições `(prefers-reduced-motion: no-preference)` e `(min-width: 1024px)` / `(max-width: 1023px)`; limpeza com `ctx.revert()` / `mm.revert()`.
- Só `transform`, `opacity`, `clip-path` e `stroke-dashoffset`. Nunca `top/left/width/height`.
- `ScrollTrigger.refresh()` depois de fontes carregadas (`document.fonts.ready`) e de imagens do S-3 decodificadas.
- Fallback sem GSAP (bloqueado, falhou, reduced motion): IntersectionObserver aplica os estados finais; tudo visível.

### 13.5 `prefers-reduced-motion`

Sem `lp-motion` → nenhum estado inicial escondido; M-1…M-13 viram estados finais instantâneos; troca de retrato em S-3 vira troca direta (sem wipe) ou, abaixo de 1024, o layout empilhado; feedback de S-4 mantém cor, ícone e texto sem shake. Teste obrigatório na Fase 15/16 (§26.2).

### 13.6 Lottie e Motion: decisão

- **Lottie: não entra nesta versão.** Não existe nenhum arquivo Lottie da Foca, a arte de expressões ainda não existe (A-7), e o player (~60–250 kB) pesaria mais que a página inteira. Se o designer entregar animações da Foca, abrir decisão nova (DEP-6) com `@lottiefiles/dotlottie-web` carregado sob demanda.
- **Motion (framer): não entra.** Um motor de animação por projeto; GSAP cobre o scroll e CSS cobre o resto.

## 14. Como o produto é mostrado (retratos reais e demo interativa)

### 14.1 Decisão

O produto aparece de dois jeitos, ambos reais:

1. **Retratos:** capturas de tela do app de verdade, geradas por script (Playwright) contra o servidor de desenvolvimento do app com estado semeado, em claro e escuro. Nada desenhado com `<div>`.
2. **Demo jogável (S-4):** um componente da landing que reproduz a interação de uma questão com o conteúdo original de um item real e os rótulos reais do app, usando as mesmas utilities visuais (copiadas).

Motivo: o prompt pede "mostrar o Foca funcionando" com fidelidade ao produto; a `design-taste-frontend` bane UI falsa. Retrato real + componente real atende os dois. **Não** importar componentes de `src/` (acoplaria a landing a código que está mudando agora e ao store).

### 14.2 Lista de retratos (Fase 6)

Viewport 390×844, `deviceScaleFactor: 3`, recorte da área útil (sem barra do navegador). Exportar AVIF + WebP em 2 larguras (360 e 720 px de largura efetiva; o recorte vertical varia) e PNG mestre fora do build (em `landing/assets-src/shots/`, versionado? **não**: PNG mestre é gitignorado; só os derivados otimizados entram em `landing/public/lp/shots/`).

| ID | Tela / estado | Usado em | Observações |
|---|---|---|---|
| `hero-atividade` | `/trilha` com `jornadaAdaptativa`, card da atividade atual mostrando a frase de motivo "Essa travou duas vezes. Vamos por partes, com calma." (`reforco-erros`) | S-1 | Preferir estado em que o "~N min" não apareça ou fique fora do recorte (duração não medida) |
| `quiz-prova` | `/quiz`, passo "exam" ou "course" | S-3 p1 | Sem nome digitado de pessoa real; se o passo "name" aparecer, usar "Luan" |
| `nivelamento-resultado` | `/nivelamento` resultado (T-06.1): título, faixas por área, "Por onde começamos" | S-3 p2 | Sem %, sem nota (a tela já não mostra) |
| `atividade-motivo` | Card de atividade com outro motivo ("Assunto novo. Começa com uma aula curta." ou "Já faz um tempo que você não revisa isso…") | S-3 p3 | **Nunca** o motivo `revisao-devida` (bug do "Porcentagem" fixo) |
| `feedback-explicar` | Lição, questão respondida errada, folha de feedback aberta com explicação e o botão "Explicar melhor" visível; alternativa: botão "Não sei" visível antes da resposta | S-3 p4 | Escolher item sem imagem de terceiro |
| `faixas-progresso` | `/progress` com faixas por habilidade (Base em construção / No caminho / Base firme) | S-3 p5 | Recortar para que "Domínio" com número não domine; se aparecer "%", recortar fora ou escolher estado com "Ainda medindo" |
| `tutor-balao` | Balão da Foca aberto com uma resposta (com chave: resposta real; sem chave: fallback local) | S-7 | Nunca simular uma resposta; usar a que o app produzir |

**Telas proibidas em retrato:** `/welcome` e `/` (copy "60 segundos"), qualquer tela com "Checkpoint" visível, `/ranking` (mock), `/premium` (demonstração), `/offline` (promete sincronização que não existe).

### 14.3 Script de captura

`landing/scripts/capture-product-shots.ts` (Playwright, roda com o dev server do app **já iniciado pelo usuário ou pelo executor** em `:8080`; o script **não** inicia nem altera o app):
- Semeia `localStorage["foca.state.v3"]` via `addInitScript` com estados construídos no próprio script (inspirados em `tests/e2e/helpers/estado.ts`, que é só **lido** como referência — nunca importado).
- Para cada ID: navega, espera `networkidle` + fontes, força tema (`.dark` via `prefs.theme` no estado), captura PNG, recorta.
- Pós-processa com `sharp` (devDependency da landing) para AVIF (q 55) e WebP (q 72) nas duas larguras; grava `landing/public/lp/shots/<id>-<tema>-<w>.{avif,webp}` e um `landing/src/content/shots.ts` gerado com `width`, `height` e `alt`.
- `alt` de cada retrato é escrito à mão em `copy.ts` descrevendo o que a tela mostra (ex.: "Tela do Foca com a próxima atividade e o motivo: essa travou duas vezes, vamos por partes").
- Idempotente; recaptura com um comando (`bun run shots`) quando o `36` Fase 10 migrar as strings.

### 14.4 Item da demo (S-4)

- Fonte: `src/content/banco/**` (leitura). Critérios: múltipla escolha, **não oficial** (evita regra de atribuição do `34`), sem imagem, enunciado ≤ 60 palavras, explicação curta presente, dificuldade baixa ou média, matéria de alta identificação (Matemática: porcentagem; ou Linguagens: interpretação curta). Registrar o caminho e o id em `docs/41`.
- Copiar o JSON **literal** para `landing/src/content/demo-item.json` com um cabeçalho em `demo-item.source.md` (origem, data, hash). **Nenhuma skill de copy toca esse conteúdo** (`copy/05`).
- Se o item tiver resolução em camadas, mostrar "Ver resolução" com o texto original; "Explicar melhor" **não** aparece na demo (chamaria a IA; a landing não chama IA).

## 15. Arquitetura técnica isolada

### 15.1 Decisão

**Aplicação Vite independente em `landing/` na raiz do repositório**, com `package.json`, `bun.lock`, `bunfig.toml`, `tsconfig.json`, `vite.config.ts`, testes e deploy próprios. Nenhum arquivo da raiz é alterado. Nenhum import de `../src`, `@/` ou `../../`.

Alternativas descartadas:

| Alternativa | Por que não |
|---|---|
| Rota `/` ou `/landing` dentro de `src/routes` | Viola "não integrar"; `__root.tsx` hidrata store/áudio (A-4); colidiria com o trabalho paralelo em `__root`/rotas |
| Workspace bun na raiz | Exige editar o `package.json` e o `bun.lock` da raiz (infra do app) |
| Repositório separado | Perde o SDD e os tokens próximos; a integração futura fica mais cara |
| Branch separada | O working tree tem ≈330 mudanças não commitadas de outra sessão; branch agora arrastaria tudo. Decisão de git fica com o usuário (§29 D-LP-4) |
| Astro / Next | Nova stack; a integração futura com TanStack Start fica mais difícil. React + Vite mantém os componentes portáveis |

### 15.2 Stack da landing

| Peça | Escolha |
|---|---|
| Build | `vite` (mesma major do app, 8.x) + `@vitejs/plugin-react` |
| UI | `react`/`react-dom` 19.2 (mesma do app) |
| CSS | `tailwindcss` 4 + `@tailwindcss/vite`, com `@import "tailwindcss" source(none); @source "./src";` |
| Movimento | CSS + `gsap` + `@gsap/react` (carregamento tardio) |
| Ícones | `lucide-react` (mesma família do app) |
| Fontes | Self-host: `@fontsource-variable/space-grotesk`, `@fontsource-variable/plus-jakarta-sans`, `@fontsource/space-mono` (peso 700), `@fontsource/caveat` (peso 600), só subset `latin`. Sem Google Fonts (evita requisição a terceiro para público menor de idade e melhora LCP) |
| Pré-render | Vite SSR build de `src/entry-server.tsx` + `scripts/prerender.ts` que grava o HTML em `dist/index.html`; o cliente usa `hydrateRoot` |
| Testes | `bun test` (unitários) + `@playwright/test` + `@axe-core/playwright` |
| Imagens | `sharp` (dev, só no script de captura) |

Todas as dependências respeitam o `minimumReleaseAge = 86400` (copiar o `bunfig.toml` da raiz para `landing/bunfig.toml`, sem as exceções do Lovable). Versões fixadas com `^` na major atual; registrar as versões instaladas em `docs/41`.

### 15.3 Estrutura de diretórios

```text
landing/
  README.md                      # como rodar, testar, pré-visualizar, publicar; regra de isolamento no topo
  package.json                   # "name": "foca-landing", "private": true
  bun.lock
  bunfig.toml                    # cópia do da raiz (minimumReleaseAge)
  tsconfig.json                  # strict, "include": ["src", "scripts", "tests"], sem paths para ../src
  vite.config.ts                 # vite puro: react(), tailwindcss(); build.assetsDir "lp-assets"; server.port 4321
  playwright.config.ts           # webServer: bun run preview (porta 4322), projetos mobile/narrow/tablet/desktop
  vercel.json                    # buildCommand/outputDirectory/headers da landing
  index.html                     # template com marcador <!--app-html--> e <!--head-->
  .env.example                   # VITE_APP_URL=http://localhost:8080 ; VITE_SITE_URL= ; VITE_LP_INDEXABLE=false
  public/
    lp/
      brand/                     # cópia dos PNGs da Foca (sync-brand-assets)
      shots/                     # retratos otimizados (capture-product-shots)
      og/og-landing.png          # 1200x630 (make-og-image)
    favicon.ico, icon-192.png, apple-touch-icon.png, robots.txt, sitemap.xml (gerado)
  src/
    main.tsx                     # hydrateRoot + agenda carregamento do motion
    entry-server.tsx             # renderToString(<Landing />)
    Landing.tsx                  # compõe as seções na ordem da §11
    config.ts                    # APP_URL, SITE_URL, INDEXABLE, LP_FALA_DE_PRECO
    content/
      copy.ts                    # TODAS as strings visíveis, alt e aria (tipadas)
      faq.ts                     # perguntas/respostas (derivado de copy.ts)
      seo.ts                     # title, description, og, json-ld
      shots.ts                   # gerado pelo script de captura
      demo-item.json, demo-item.source.md
    sections/                    # Navbar, Hero, TheScene, HowItWorks, TryOne, Comeback, WhatYouHave, FocaAndHonesty, Faq, Closing, Footer, StickyCta
    components/                  # CtaButton, RiskNote, PhoneFrame, ProductShot, MarginNote, StepNode, FocaMark (local), SpeechBubble, ChoiceOption, FeedbackPanel, WeekStrip, ComebackCalendar, StreakChip
      doodles/                   # HighlightStroke, PencilArrow, PencilCheck, PencilStrike, MarginRule
    motion/
      boot.ts                    # decide html.lp-motion (inline no index.html também)
      scroll.ts                  # GSAP + ScrollTrigger (import dinâmico)
      reveal-fallback.ts         # IntersectionObserver sem GSAP
    lib/
      app-url.ts                 # appUrl(path) — único jeito de montar link para o app
      track.ts                   # barramento de eventos local (§19)
      z.ts                       # escala de z-index
    styles/
      index.css                  # @import tailwind, tokens, marketing-tokens, motion, utilities
      tokens.css                 # SNAPSHOT de :root/.dark/@theme inline do app (§15.4)
      utilities.css              # SNAPSHOT das @utility usadas (btn-primary, card-soft, chip, surface-pauta, mark-texto, anim-*)
      marketing-tokens.css       # §12.3, §12.6
      motion.css                 # §13.2 + keyframes da landing
  scripts/
    prerender.ts
    sync-brand-assets.ts         # copia public/branding/foca/** (leitura) -> landing/public/lp/brand/
    check-token-drift.ts         # compara tokens.css com src/styles.css (leitura) e avisa
    capture-product-shots.ts     # §14.3
    make-og-image.ts             # renderiza um HTML local com Playwright -> PNG 1200x630
    check-isolation.ts           # falha se algum arquivo em landing/src importar fora de landing/
  tests/
    unit/                        # copy-rules, app-url, isolation, token-drift, seo
    e2e/                         # landing.spec.ts, a11y.spec.ts, motion.spec.ts, responsive.spec.ts
```

### 15.4 Tokens e utilities: snapshot, não import

- `tokens.css`: cópia **literal** dos blocos `@theme inline`, `:root` e `.dark` de `src/styles.css`, com cabeçalho `/* SNAPSHOT de src/styles.css em <data> (<hash curto do arquivo>). Não editar valores aqui: rode bun run sync:tokens. */`. Mantém a regra do `DESIGN.md` (variável base em `:root` e `.dark`, `--color-*` referenciando `var()`).
- `utilities.css`: cópia literal só das `@utility` que a landing usa (`btn-primary`, `btn-ghost`, `card-soft`, `chip`, `surface-pauta`, `mark-texto`, `ds-label`, `anim-pop-in`, `anim-slide-up`, `anim-shake`, `anim-bump`, `anim-float-in`) e dos `@keyframes` correspondentes, mais o bloco de `prefers-reduced-motion`.
- `check-token-drift.ts` (e o teste `tests/unit/token-drift.test.ts`): lê `../src/styles.css` só para comparar nomes e valores das variáveis; **avisa** (não falha) se divergir, listando a diferença. Motivo: o app está mudando agora; a landing escolhe quando sincronizar.
- Assets: `sync-brand-assets.ts` copia `public/branding/foca/{foca-color-*,foca-line-*,icon-*,apple-touch-icon}.png` e `expressoes/neutra-*.png` para `landing/public/lp/brand/`. Rodar na Fase 6 e registrar o hash dos arquivos em `docs/41` (a arte está sendo trocada em paralelo; conferir visualmente se é a Foca nova de 28/09).
- `FocaMark` local: reimplementação mínima (≤ 40 linhas) com as mesmas props visuais relevantes (`size`, `variant`, `motion`, `decorative`), apontando para `/lp/brand/`. Nunca esticar, nunca rotacionar.

### 15.5 Copy no código

`landing/src/content/copy.ts` exporta um objeto `LP` tipado (`as const`) com uma chave por seção (`nav`, `hero`, `cena`, `comoFunciona`, `tentaUma`, `recomeco`, `jaTem`, `foca`, `faq`, `fechamento`, `rodape`, `meta`, `alt`, `aria`). Componentes recebem strings por prop ou importam `LP`. Nenhum texto visível literal em `.tsx` (verificado por `tests/unit/copy-rules.test.ts`, que também aplica a lista proibida da §9.2 e procura `—`/`–`).

### 15.6 Links para o app

`appUrl(path)` em `lib/app-url.ts`: `new URL(path, config.APP_URL).toString()`. `APP_URL` vem de `import.meta.env.VITE_APP_URL` (valor público, não é segredo — o app não tem segredo no client), padrão `http://localhost:8080`. Todos os links para o app passam por ela (teste unitário). Destinos: CTA → `/quiz`; "Entrar" → `/`.

### 15.7 Rodar, testar, pré-visualizar, publicar

```bash
cd landing
bun install
bun run dev            # http://localhost:4321 (não conflita com o app em :8080)
bun run typecheck      # tsc --noEmit
bun test tests/unit
bun run build          # vite build (client) + vite build --ssr + prerender -> dist/
bun run preview        # serve dist/ em :4322
bunx playwright test   # usa o preview
bun run shots          # exige o app rodando em :8080 (captura retratos)
bun run og             # gera o og-landing.png
bun run sync:brand && bun run sync:tokens
bun run check:isolation
bun run lighthouse     # bunx lighthouse http://localhost:4322 --preset=... (sem dependência instalada)
```

**Publicar (ação do usuário, não do executor — DG-1):** criar um projeto Vercel separado (ex.: `foca-landing`) apontando para este repo com **Root Directory = `landing`**, framework "Vite", install `bun install --frozen-lockfile`, build `bun run build`, output `dist`, variáveis `VITE_APP_URL` (URL pública do app), `VITE_SITE_URL`, `VITE_LP_INDEXABLE` (`false` até o usuário aprovar a publicação). O projeto Vercel do app não muda. `landing/vercel.json` só define headers (cache imutável para `/lp-assets/*` e `/lp/*`, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restritiva).

### 15.8 Como evitar mexer no app por acidente

1. Escopo de escrita da §15.9, repetido no topo de cada fase da §23.
2. `bun run check:isolation` (Fase 4+): falha se `landing/src` ou `landing/tests` importar caminho que resolva fora de `landing/`.
3. Antes e depois de cada fase: `git status --porcelain -- . ':(exclude)landing' ':(exclude)docs/historico/iniciativas/40-41-42-43-landing/40-plano-landing-page-marketing.md' ':(exclude)docs/historico/iniciativas/40-41-42-43-landing/41-registro-execucao-landing-page.md'` salvo em arquivo temporário no scratchpad; comparar. Diferença **causada pelo executor** = parar e desfazer só a mudança dele. (Mudanças de outra sessão aparecem também; o executor não as toca e registra "mudança externa observada".)
4. Nenhum comando na raiz que escreva: sem `bun install`/`bun add` na raiz, sem `bun run build` na raiz durante a execução (gera `dist/` do app; os testes da raiz só rodam se o usuário pedir).

### 15.9 Escopo de escrita (whitelist)

- `landing/**` (tudo, exceto `landing/node_modules` gerenciado pelo bun).
- `docs/historico/iniciativas/40-41-42-43-landing/41-registro-execucao-landing-page.md` (criar e manter).
- `docs/historico/iniciativas/40-41-42-43-landing/40-plano-landing-page-marketing.md`: **só** o campo de status e marcações de checklist, se o usuário pedir.
- Fase 17: uma linha de ponteiro em `docs/DESIGN.md`; uma linha na tabela de superfícies de `docs/copy/06-marketing.md` §2 ("Landing pública | `landing/` | Isolada, não publicada | `docs/40`"); atualização do status em `docs/README.md` e no bloco da landing em `CLAUDE.md`.

**Nunca:** `src/**`, `public/**`, `tests/**`, `scripts/**`, `content-pipeline/**`, `package.json`, `bun.lock`, `bunfig.toml`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `playwright.config.ts`, `vercel.json`, `netlify.toml`, `.github/**`, `.claude/settings*.json`, `.gitignore` da raiz. (O `.gitignore` da raiz já ignora `node_modules` e `dist` em qualquer nível; `landing/.gitignore` próprio cobre `assets-src/`, `.env`, `test-results`, `playwright-report`.)

## 16. Performance

| Alvo | Valor | Como |
|---|---|---|
| Lighthouse mobile (preview local, 4G simulado, Moto G Power) | Perf ≥ 90 · A11y 100 · BP 100 · SEO 100 (SEO medido com `VITE_LP_INDEXABLE=true` num build de teste) | `bun run lighthouse`, 3 execuções, mediana registrada em `docs/41` |
| LCP | < 2,5 s (meta interna 2,0 s) | HTML pré-renderizado; H1 em fonte pré-carregada; retrato do hero com `<link rel="preload" as="image" imagesrcset=… fetchpriority="high">` |
| CLS | < 0,05 | `width`/`height`/`aspect-ratio` em todo retrato; fontes com `font-display: swap` + fallback com métricas ajustadas (`size-adjust`, `ascent-override` no `@font-face` de fallback); nada injetado acima do conteúdo |
| INP | < 200 ms | Demo com estado local simples; nada pesado no clique |
| JS inicial (gz) | ≤ 75 kB | React + página; GSAP fora do caminho crítico |
| Chunk de movimento (gz) | ≤ 45 kB | `gsap` + `ScrollTrigger` + `scroll.ts` |
| CSS (gz) | ≤ 20 kB | Tailwind só com `@source "./src"` |
| Fontes | ≤ 4 arquivos woff2 no primeiro carregamento (Space Grotesk variável, Plus Jakarta variável, Space Mono 700 só quando S-5 entra, Caveat só quando a primeira anotação entra) | `preload` só do Space Grotesk e Plus Jakarta; Mono e Caveat sem preload |
| Imagens | Retratos AVIF/WebP com `srcset` 360w/720w e `sizes` corretos; tudo abaixo da dobra com `loading="lazy" decoding="async"`; PNG da Foca em 96/320 conforme o tamanho |
| Scroll | 60 fps com CPU 4× lenta no Chrome DevTools durante S-3 | Só `transform/opacity/clip-path`; `will-change` só durante a troca; retratos decodificados antes (`img.decode()`) |

Skills: `vercel-react-best-practices` (regras de React; **ignorar as de Next.js**), `agent-skills:performance-optimization`, revisão pelo agente `web-performance-auditor` (§21).

## 17. Acessibilidade

Alvo declarado para a landing: **WCAG 2.2 AA**.

- HTML semântico: `<header>`, `<nav aria-label="Principal">`, `<main id="conteudo">`, uma `<section aria-labelledby>` por seção, `<footer>`. **Um `<h1>`**; H2 por seção; H3 nos passos e perguntas; sem pular níveis.
- Link "Pular para o conteúdo" como primeiro foco.
- Foco visível: `outline` 3 px `mar`, offset 2 (igual ao app), inclusive em `<summary>` e alternativas da demo.
- Contraste AA em claro e escuro (texto `nevoa` ≥ 13 px sobre `neve`; branco sobre `mar` passa 4,5:1 — conferir com a ferramenta na Fase 16).
- Alvos de toque ≥ 44×44 (CTA 52, compacto 44).
- Cor nunca é o único sinal (feedback da demo com ícone + palavra; nós de S-3 com check + estado em `aria-current="step"`).
- Demo: alternativas como `radiogroup` (ou botões com `aria-pressed`), "Verificar" desabilitado até escolher (com `aria-disabled` e explicação), resultado em região `aria-live="polite"`, foco move para o título do feedback.
- `alt` descritivo em todo retrato (em `copy.ts`); rabiscos e a Foca decorativa com `aria-hidden="true"`/`alt=""`; anotações manuscritas que repetem texto com `aria-hidden`.
- Reduced motion completo (§13.5). Sem autoplay de nada. Sem som.
- Zoom 200% e texto 200% sem perda (sem `overflow: hidden` que corte texto).
- Idioma `pt-BR` no `<html>`.
- Sticky CTA não prende o foco nem cobre elemento focado.

Revisão: `web-design-guidelines` + `@axe-core/playwright` em claro e escuro + passagem manual de teclado (§26).

## 18. SEO

| Item | Valor |
|---|---|
| `<title>` | `Foca: preparação para o ENEM que cabe no intervalo` (≤ 60 caracteres; sem travessão) |
| `meta description` | `O Foca escolhe o próximo passo dos seus estudos para o ENEM e mostra por quê. Atividades curtas, sem e-mail e sem senha para começar.` (≤ 160) *(ajustar se D-LP-1 mudar)* |
| `robots` | `noindex, nofollow` enquanto `VITE_LP_INDEXABLE=false` (padrão). `index, follow` só depois de o usuário aprovar a publicação |
| `canonical` | `${VITE_SITE_URL}/` quando `VITE_SITE_URL` estiver definido; senão, omitido (domínio ainda não decidido — DEP-4) |
| Open Graph | `og:type website`, `og:locale pt_BR`, `og:site_name Foca`, título, descrição, `og:image` `/lp/og/og-landing.png` 1200×630 com `og:image:alt` |
| Twitter/X | `summary_large_image` com os mesmos campos |
| Imagem de compartilhamento | Gerada por `scripts/make-og-image.ts`: papel com pauta, H1 da landing, a Foca contorno e o retrato `hero-atividade` recortado. Sem texto além do H1 e "Foca" |
| Favicon | Cópias dos ícones do app (`favicon.ico`, `icon-192`, `apple-touch-icon`) |
| Dados estruturados | JSON-LD com `WebSite` (`name`, `url`, `inLanguage: pt-BR`) e `Organization` (`name: Foca`, `logo`). **Sem** `Offer`/preço, **sem** `AggregateRating`, **sem** `FAQPage` (rich result restrito a sites governamentais/saúde; não vale o risco de parecer spam) |
| Estrutura | H1 único com "ENEM" presente no eyebrow e no título; H2 descritivos; âncoras com texto útil |
| `robots.txt` / `sitemap.xml` | Gerados no build: `robots.txt` com `Disallow: /` enquanto não indexável; `sitemap.xml` só com `/` quando indexável |
| Palavras | Sem keyword stuffing. "ENEM" aparece no eyebrow, `title`, `description` e onde for natural |

Skills: marketing `seo-audit` e `schema` (lidas do cache) na Fase 12.

## 19. Analytics e CRO

**Nada é enviado para fora.** Público majoritariamente menor de idade; analytics externo e coleta de dados não estão autorizados (`20` §14, §22; `copy/06` §7 item 7). A landing não usa cookie, `localStorage` (exceto o que o navegador fizer sozinho), pixel nem fingerprint.

**Barramento local (`lib/track.ts`):** `track(evento, props?)` despacha `window.dispatchEvent(new CustomEvent('foca-lp:track', { detail }))` e, em dev, `console.debug`. Props permitidas: id de seção, id de pergunta, id de CTA, viewport (`mobile|tablet|desktop`). **Proibido:** qualquer identificador de pessoa, texto digitado, IP, user agent completo, timestamp enviado para servidor.

| Evento | Quando |
|---|---|
| `landing_view` | Hidratação concluída |
| `section_view` | Cada seção cruza 50% da viewport pela primeira vez (`section`) |
| `hero_cta_click`, `nav_cta_click`, `demo_cta_click`, `final_cta_click`, `sticky_cta_click` | Clique no "Começar agora" (`cta`) |
| `nav_login_click` | "Entrar" |
| `nav_anchor_click` | Âncoras (`target`) |
| `demo_answer` | Resposta na demo (`resultado: certa|errada|nao_sei`) |
| `demo_resolution_open` | "Ver resolução" |
| `faq_open` | Pergunta aberta (`id`) |

`signup_start` e `pricing_view` do prompt **não existem** aqui: não há cadastro na landing (o começo acontece no app) nem seção de preço. A integração com um provedor (ex.: medição agregada sem cookie) é decisão futura com spec própria (DEP-7); a interface já está pronta para receber um "listener" sem tocar nas seções.

**Critério de CRO por seção:** cada seção da §11 declara a pergunta do João que responde. Na Revisão 7 (§24), qualquer seção cuja retirada não aumente dúvida ou objeção é **candidata a corte** e vai para decisão do usuário, não é cortada em silêncio.

## 20. Segurança

- Nível **L2** do `SDD-WORKFLOW` §6 (dependências novas + configuração de deploy), sem dados de aluno e sem IA.
- Sem segredos: só variáveis `VITE_*` públicas (URL do app, URL do site, flag de indexação). Nenhuma chave de IA.
- Sem `dangerouslySetInnerHTML` exceto o JSON-LD e o script inline de tema/motion gerados no prerender a partir de constantes (sem entrada de usuário).
- Headers do `landing/vercel.json` (§15.7). CSP: `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'sha256-<hash do script inline>'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'` — o hash do script inline é calculado no prerender.
- Revisão na Fase 17: `agent-skills:security-and-hardening` sobre `landing/` + `bun audit` (ou `osv-scanner` se instalado) nas dependências da landing. `repo-security-review --pr` completo **não** é necessário (sem superfície de dados); registrar essa decisão.

## 21. Skills: quais, quando, de onde

Regras do projeto que valem aqui: no máximo 3 primárias por fase + 1 revisão; skills nunca vencem esta spec; `better-writing` **não** é usada (rota de marketing proíbe); `frontend-design` **não** é usada (é skill do app); `ui-ux-pro-max` só como consulta pontual e sem `--persist`; `impeccable` nunca com `init`/`document`.

**Pacotes desligados:** Marketing Skills e GSAP Skills estão desligados em `.claude/settings.json`. **Não ligar** (mudaria a configuração e exigiria reiniciar a sessão). Ler o `SKILL.md` direto do cache, como o `SKILL-ROUTING` §2.1/§6 permite:

| Skill | Caminho do `SKILL.md` |
|---|---|
| `product-marketing` | `C:\Users\mathe\.claude\plugins\cache\marketingskills\marketing-skills\2.11.1\skills\product-marketing\SKILL.md` |
| `copywriting` | `…\marketing-skills\2.11.1\skills\copywriting\SKILL.md` |
| `copy-editing` | `…\marketing-skills\2.11.1\skills\copy-editing\SKILL.md` |
| `cro` | `…\marketing-skills\2.11.1\skills\cro\SKILL.md` |
| `seo-audit` | `…\marketing-skills\2.11.1\skills\seo-audit\SKILL.md` |
| `schema` | `…\marketing-skills\2.11.1\skills\schema\SKILL.md` |
| `gsap-core` | `C:\Users\mathe\.claude\plugins\cache\gsap-skills\gsap-skills\1.0.0\skills\gsap-core\SKILL.md` |
| `gsap-scrolltrigger` | `…\gsap-skills\1.0.0\skills\gsap-scrolltrigger\SKILL.md` |
| `gsap-react` | `…\gsap-skills\1.0.0\skills\gsap-react\SKILL.md` |
| `gsap-performance` | `…\gsap-skills\1.0.0\skills\gsap-performance\SKILL.md` |
| `humanizer` | invocável: `humanizer:humanizer` (plugin ligado) |
| `performance-optimization` | invocável: `agent-skills:performance-optimization`; agente `web-performance-auditor` |

`product-marketing` lê `.agents/product-marketing.md`, que manda ler `docs/PRODUCT.md` primeiro — seguir; **não** reescrever `.agents/product-marketing.md`.

**Mapa por fase** (P = primária, R = revisão, C = consulta pontual):

| Fase | Skills | Uso concreto |
|---|---|---|
| F2 Contexto | `product-marketing` (P, cache) | Confirmar o contexto a partir de `docs/PRODUCT.md`; registrar em `docs/41` o que a skill pediria e o Foca não tem (prova social, preço) |
| F3 Plataforma de copy | `ogilvy-copywriting` (P) | Validar a §9.1 e o H1 com as perguntas 1–4 e 6 da skill; **não** criar promessa nova; overrides do `SKILLS.md` §R (sem depoimento, sem texto longo) |
| F7 Esqueleto | `design-taste-frontend` (P) | Declarar o "Design Read" e os dials da §12.1; aplicar §3.E, §4.7, §9 aos layouts |
| F8 Seções | `design-taste-frontend` (P), `vercel-react-best-practices` (P) | Composição de cada seção pela §11; componentes React limpos, sem re-render inútil |
| F9 Demo | `vercel-react-best-practices` (P) | Estado local, acessibilidade da interação |
| F10 Movimento | `motion-design` (P) → `gsap-react`, `gsap-scrolltrigger` (P, cache) · C: `gsap-core`, `gsap-performance` | `motion-design` valida intenção/durações contra §13 **antes** de escrever GSAP; depois as skills GSAP para `useGSAP`, `matchMedia`, limpeza, `batch`, `refresh` |
| F11 Responsivo | `design-taste-frontend` (P, §3.E/§4.7) | Colapsos explícitos por breakpoint |
| F12 SEO | `seo-audit`, `schema` (P, cache) | Conferir a §18; nada de FAQPage/Offer |
| F13 Copy | `copywriting` (P, cache) → `copy-editing` (R obrigatória, sete passadas) → `humanizer:humanizer` (corpo de 2+ frases) | Pipeline da §23 F13 |
| F14 Performance | `agent-skills:performance-optimization` (P) · R: agente `web-performance-auditor` | Orçamentos da §16 |
| F15 Acessibilidade | `web-design-guidelines` (R) · C: `design:accessibility-review` | Auditoria com `arquivo:linha` |
| F16 CRO | `cro` (P, cache) | Revisão 7 da §24; sugestões de corte vão ao usuário |
| F17 Polimento/QA | `impeccable:impeccable` em modo `critique` (R, só relatório) + pré-voo §14 da `design-taste-frontend` · segurança: `agent-skills:security-and-hardening` | Achados corrigidos ou registrados |
| Verificação final | agente `spec-verifier` | Critérios G-1…G-24 |

## 22. Integração futura — DO NOT EXECUTE

> **Não executar nada desta seção sem o pedido explícito "Agora integre a Landing Page ao aplicativo."** Ela existe só para que as decisões de hoje não fechem essas portas.

**Topologias possíveis (decidir no dia):**

1. **Domínio único com proxy:** `foca.com` serve a landing (projeto `foca-landing`); `foca.com/app/*` (e rotas do app) via rewrite para o projeto do app. Exige o app funcionar sob um `basepath` (`/app`) no TanStack Router e revisar os caminhos absolutos do app (`/branding`, `/content`, `/sfx`).
2. **Subdomínio:** `foca.com` = landing; `app.foca.com` = app. Zero mudança no app; só `VITE_APP_URL`.
3. **Landing como rota pública do app:** mover `landing/src/sections` e `components` para `src/` como rota `/` com layout próprio que **não** hidrata store/áudio (exige separar o `__root.tsx` em layout público e layout do app) e mover o app de `/` para `/app` ou manter o splash em outra rota.

**Decisões de hoje que protegem essas opções:**

- Todo link para o app passa por `appUrl()` → trocar topologia = trocar uma variável.
- Assets da landing sob `/lp/` e `/lp-assets/` → não colidem com `/branding`, `/content`, `/sfx`, `/assets` do app num mesmo domínio.
- Componentes React puros, sem dependência de roteador ou store; copy num arquivo só → portáveis para uma rota do TanStack Start.
- Tokens da landing são os do app (snapshot) → na integração, o snapshot é apagado e a landing passa a usar `src/styles.css`; `marketing-tokens.css` vira um arquivo importado só pela rota pública.
- Pré-render estático hoje ≈ SSR da rota amanhã (mesmos componentes).

**Checklist da integração (para o futuro):** spec nova numerada; decidir topologia; migrar tokens; migrar retratos para `public/`; decidir SEO/canonical definitivo; testes E2E da raiz passam a cobrir a rota pública; atualizar `docs/40` e o status no `CLAUDE.md`.

## 23. Fases e tarefas

Formato de cada fase: **Objetivo · Ler · Pode modificar · Não pode modificar · Skills · Passos · Decisões já tomadas · Decisões permitidas · Saída · Critério de aceite · Testes · Erros prováveis · Validar antes de continuar.** "Não pode modificar" é sempre, no mínimo, a lista "Nunca" da §15.9; abaixo só aparece o que é específico.

### F0 — Reconhecimento e linha de base (somente leitura + criar o registro)

- **Objetivo:** confirmar que o repo está como esta spec descreve e abrir `docs/41`.
- **Ler:** `git status --short | head -100`, `git log --oneline -3`, `package.json`, `vite.config.ts`, `src/styles.css` (cabeçalho e tokens), `src/lib/brand.ts`, `ls public/branding/foca -R`.
- **Pode modificar:** `docs/historico/iniciativas/40-41-42-43-landing/41-registro-execucao-landing-page.md` (criar).
- **Skills:** nenhuma.
- **Passos:** (1) confirmar status "aprovado" no topo deste doc; (2) salvar o snapshot de `git status --porcelain` fora de `landing/` no scratchpad; (3) conferir A-1…A-10 da §2 e anotar qualquer diferença; (4) criar `docs/41` com seções: Estado inicial, Fases (uma por fase), Decisões do executor, Divergências, Mudanças externas observadas, Números de teste, Critérios G com evidência, Pendências.
- **Decisões já tomadas:** tudo da §15.
- **Decisões permitidas:** formato interno do `docs/41`.
- **Saída:** `docs/41` criado com o estado inicial.
- **Critério de aceite:** registro existe; diferenças da §2 anotadas.
- **Erros prováveis:** assumir que `landing/` pode existir de outra tentativa — se existir, **parar e perguntar**.
- **Validar:** nenhum arquivo além do `docs/41` mudou por sua causa.

### F1 — Leitura obrigatória do SDD (Context Pack)

- **Objetivo:** carregar o contexto mínimo que esta spec pressupõe.
- **Ler (nesta ordem):** este doc inteiro; `docs/COPY.md`; `docs/copy/01-estrategia.md`; `docs/copy/06-marketing.md`; `docs/copy/02-voz-e-tom.md`; `docs/copy/04-foca-ia.md` §3; `docs/copy/05-conteudo-pedagogico.md`; `docs/PRODUCT.md`; `docs/DESIGN.md`; `docs/produto/persona-joao.md`; `docs/historico/fundacao/16-gamificacao-e-dopamina.md` §5–§9; `docs/design/sistema-rabisco.md` §3, §5, §6.6, §8; `docs/design/brand/foca-rabisco-branding.md`; abrir `docs/design/brand/foca-design-system-2026-09-28.html` (referência visual dos logos).
- **Pode modificar:** `docs/41`.
- **Saída:** em `docs/41`, uma lista curta "restrições que vou seguir" (≤ 15 itens) nas suas palavras.
- **Critério de aceite:** a lista cobre: afirmações permitidas (§9.4), proibições (§9.2), reservas de cor, onde a Foca aparece, reduced motion, escopo de escrita.

### F2 — Contexto de marketing e mapa de skills

- **Objetivo:** alinhar o contexto de marketing sem criar nada novo.
- **Ler:** `.agents/product-marketing.md`; `product-marketing` do cache; `docs/ai/SKILL-ROUTING.md` §2.1; §21 desta spec.
- **Skills:** `product-marketing` (P, cache).
- **Passos:** ler a skill; responder as perguntas dela **só** com o que `docs/PRODUCT.md` e a §9.4 comprovam; marcar como "não existe" prova social, preço, métricas.
- **Decisões já tomadas:** nenhuma prova social; nenhum preço.
- **Saída:** seção "Contexto de marketing" em `docs/41` (≤ 30 linhas).
- **Critério de aceite:** nada no contexto contradiz a §9.4.
- **Erros prováveis:** a skill sugerir depoimentos, garantia, urgência ou contador — registrar como "não aplicável: regra do Foca".

### F3 — Plataforma de copy e H1

- **Objetivo:** travar a estratégia antes do código.
- **Skills:** `ogilvy-copywriting` (P).
- **Passos:** (1) rodar as perguntas 1–4 e 6 da Ogilvy sobre a §9.1; (2) avaliar os três H1 da §9.3 pelo teste "poderia ser qualquer SaaS?" (§26.4) e pelo teste do João; (3) manter o H1 escolhido salvo se falhar num teste objetivo — nesse caso, usar o H1-B e registrar; (4) redigir 2 variações do subtítulo dentro das regras; escolher uma.
- **Decisões já tomadas:** promessa, big idea, estrutura de seções, o H1 e a lista de candidatos.
- **Decisões permitidas:** escolher entre os candidatos listados; ajustes de palavra no subtítulo e corpos que não mudem sentido.
- **Saída:** `landing/` ainda não existe; a copy validada vai para `docs/41` §"Copy v1" (tabela seção → string).
- **Critério de aceite:** toda string mapeada para uma linha F-x da §9.4.

### F4 — Scaffold isolado

- **Objetivo:** app Vite vazio, isolado, compilando.
- **Pode modificar:** `landing/**`, `docs/41`.
- **Skills:** nenhuma (tarefa mecânica); consulta: `tailwind-v4-shadcn:tailwind-v4-shadcn` só se o Tailwind v4 não compilar.
- **Passos:** (1) criar `landing/` com a estrutura da §15.3 (pastas vazias onde couber); (2) `package.json` com scripts da §15.7 e dependências da §15.2; (3) copiar `bunfig.toml` da raiz sem as exceções do Lovable; (4) `cd landing && bun install`; (5) `vite.config.ts` puro (`@vitejs/plugin-react`, `@tailwindcss/vite`, `server.port: 4321`, `preview.port: 4322`, `build.assetsDir: 'lp-assets'`); (6) `tsconfig.json` strict sem paths para fora; (7) `index.html` com `lang="pt-BR"`, marcadores de prerender, script inline de tema + `lp-motion`; (8) `Landing.tsx` com um `<h1>` provisório; (9) `entry-server.tsx` + `scripts/prerender.ts`; (10) `check-isolation.ts` + teste; (11) `landing/.gitignore`; (12) `README.md` com a regra de isolamento no topo.
- **Decisões já tomadas:** stack, portas, estrutura, fontes self-hosted.
- **Decisões permitidas:** versões exatas (major atual), nomes de scripts auxiliares.
- **Saída:** `bun run dev`, `typecheck`, `build`, `preview` funcionando.
- **Critério de aceite:** `dist/index.html` contém o `<h1>` já no HTML (pré-render); nenhum arquivo fora de `landing/` e `docs/41` mudou.
- **Testes:** `bun run typecheck`, `bun test tests/unit` (isolation), `bun run build`.
- **Erros prováveis:** importar `@lovable.dev/vite-tanstack-config` (proibido); rodar `bun install` na raiz; `@source` apontando para `../src`.
- **Validar:** comparar `git status` fora de `landing/` com o snapshot da F0.

### F5 — Tokens, utilities, fontes e base de estilos

- **Objetivo:** a landing "fala" o design system do Foca.
- **Ler:** `src/styles.css` (tokens, `@utility` listadas na §15.4, keyframes, bloco reduced motion).
- **Passos:** (1) `tokens.css` e `utilities.css` como snapshot literal com cabeçalho; (2) `check-token-drift.ts` + teste (avisa); (3) `marketing-tokens.css` (§12.3, §12.6) e `motion.css` (§13.2); (4) `@font-face` via fontsource, só `latin`, com fallback de métricas; (5) `index.css` compondo tudo; (6) página de verificação temporária em `dev` mostrando escala tipográfica, cores claro/escuro, botões (remover antes da F8).
- **Decisões já tomadas:** nenhuma cor nova; escala da §12.3.
- **Decisões permitidas:** valores de `size-adjust` do fallback.
- **Critério de aceite:** mesmas cores do app em claro/escuro (conferência lado a lado com `docs/design/brand/foca-design-system-2026-09-28.html`); nenhuma requisição a `fonts.googleapis.com` (verificar na aba de rede).
- **Erros prováveis:** hex literal no `@theme inline` (quebra dark mode — `DESIGN.md`); esquecer o par `.dark` de um token.

### F6 — Assets: marca e retratos do produto

- **Objetivo:** ter todos os ativos reais.
- **Passos:** (1) `sync-brand-assets.ts` e rodar; registrar hashes e **olhar** os PNGs (a Foca nova de 28/09 está lá?); (2) escrever `capture-product-shots.ts` (§14.3); (3) pedir ao usuário para iniciar o app (`bun run dev` na raiz) **ou** iniciar em segundo plano sem editar nada da raiz; (4) capturar os 7 retratos × 2 temas; (5) revisar cada retrato contra a lista de proibições da §14.2; (6) `make-og-image.ts` (pode rodar na F12); (7) escrever os `alt` em `copy.ts`.
- **Decisões já tomadas:** lista de retratos e telas proibidas.
- **Decisões permitidas:** qual motivo exato aparece em `atividade-motivo`; recorte vertical de cada retrato.
- **Critério de aceite:** nenhum retrato mostra "60 segundos", "Checkpoint", `%` como resultado, ranking, premium, nome de pessoa real; todos existem em claro e escuro, AVIF+WebP, 2 larguras; `shots.ts` gerado com dimensões.
- **Erros prováveis:** semear estado com schema antigo (o store está na v6+; ler `src/lib/store.ts`/`state-migrations.ts` só para saber a forma, sem alterar); tutor sem chave mostrar erro em vez do fallback — nesse caso usar o fallback e registrar.
- **Validar:** abrir cada imagem.

### F7 — Esqueleto da página (wireframe em código, sem movimento)

- **Objetivo:** a narrativa inteira de pé, em HTML semântico, com a copy v1, legível sem estilo refinado.
- **Skills:** `design-taste-frontend` (P).
- **Passos:** (1) declarar Design Read e dials em `docs/41`; (2) criar todas as seções da §11 na ordem, com a copy de `copy.ts`, landmarks e headings; (3) CTAs via `appUrl`; (4) retratos com `<picture>` e dimensões; (5) FAQ com `<details>`; (6) pré-render funcionando.
- **Critério de aceite:** a página inteira é lida em sequência sem CSS de marketing e faz sentido (teste de narrativa, §24 Revisão 1); 1 `<h1>`; ordem das seções = §11.
- **Testes:** E2E `landing.spec.ts` (estrutura, links, âncoras).

### F8 — Construção visual das seções

- **Objetivo:** cada seção como especificada na §11 e §12.
- **Skills:** `design-taste-frontend` (P), `vercel-react-best-practices` (P).
- **Passos por seção:** layout desktop → tablet → mobile; componentes da §15.3; doodles SVG (§12.5); reservas de cor; estados de hover/foco. Ordem: S-0, S-1, S-9, S-10 (as pontas), depois S-3, S-2, S-4 (visual; lógica na F9), S-5, S-6, S-7, S-8, sticky CTA.
- **Decisões já tomadas:** famílias de layout, onde marca-texto/azul/verde/vermelho aparecem, raios, grid.
- **Decisões permitidas:** espaçamentos finos dentro dos tokens, curvas exatas dos doodles, posição fina da Foca no hero.
- **Critério de aceite:** checklist de cada seção da §11 ("Critério"); pré-voo parcial da `design-taste-frontend` §14 (itens de layout, cor, forma, eyebrows ≤ 3, sem travessão).
- **Erros prováveis:** três cartões iguais lado a lado (banido); azul em ícone decorativo; grafite como fundo grande; Foca no cabeçalho.

### F9 — Demo interativa (S-4)

- **Objetivo:** a questão real jogável.
- **Ler:** `src/lib/copy.ts` (chaves `questao`, `licao`, feedback) para copiar os rótulos literais; o item escolhido.
- **Skills:** `vercel-react-best-practices` (P).
- **Passos:** escolher item (§14.4) e registrar; copiar JSON; implementar estados da §11 S-4; acessibilidade da §17; eventos `demo_*`.
- **Critério de aceite:** todos os estados funcionam com mouse, toque e teclado; texto do item idêntico ao original (diff); nenhuma chamada de rede.
- **Testes:** E2E cobrindo certa, errada, "Não sei", resolução, reinício.

### F10 — Sistema de movimento

- **Objetivo:** §13 implementada, e nada além dela.
- **Skills:** `motion-design` (P) primeiro; depois `gsap-react` e `gsap-scrolltrigger` (P, cache); consultas `gsap-core`, `gsap-performance`.
- **Passos:** (1) com `motion-design`, conferir cada linha M-1…M-13 (emoção, duração, easing, 1/3) e registrar ajustes **dentro** dos tokens; (2) CSS: M-1…M-5, M-9, M-13; (3) `motion/scroll.ts` com import dinâmico pós-`load`, `gsap.matchMedia`, M-6…M-8, M-10…M-12; (4) `reveal-fallback.ts`; (5) `html.lp-motion` só com `no-preference`; (6) `ScrollTrigger.refresh()` após fontes e imagens.
- **Decisões já tomadas:** sem pin, sem snap, sem SplitText, sem loop, sem parallax.
- **Decisões permitidas:** `start` exato de cada gatilho (dentro de 60–80%), `scrub` da margem (0.2–0.5).
- **Critério de aceite:** com JS desligado e com reduced motion, todo conteúdo visível; nenhum `addEventListener('scroll')`; chunk de movimento separado e ≤ 45 kB gz.
- **Testes:** `motion.spec.ts` (reduced motion → nada com `opacity: 0`; JS bloqueado → conteúdo visível).
- **Erros prováveis:** criar ScrollTrigger fora do `useGSAP`/`matchMedia` e vazar no hot reload; animar `height`; `start: "top top"` com pin (não há pin).

### F11 — Mobile e responsividade

- **Objetivo:** premium em 320, 360, 390, 768, 1024, 1280, 1440.
- **Skills:** `design-taste-frontend` (P).
- **Passos:** revisar cada seção nos 7 larguras; sticky CTA; S-3 empilhado; teclado virtual; `min-h-[100dvh]`; `safe-area`.
- **Critério de aceite:** sem rolagem horizontal em nenhum viewport; CTA do hero acima da dobra em 390×844 e 360×740; alvos ≥ 44 px; textos sem quebra feia (sem viúva de uma palavra no H1: usar `text-wrap: balance` nos títulos e `pretty` nos corpos).
- **Testes:** `responsive.spec.ts` com projetos `narrow` 320×700, `mobile` 390×844, `tablet` 768×1024, `desktop` 1280×800, `wide` 1440×900; screenshots de referência salvas em `landing/test-results` (não versionadas).

### F12 — SEO, compartilhamento e head

- **Skills:** `seo-audit`, `schema` (P, cache).
- **Passos:** implementar a §18 em `content/seo.ts` e no prerender; gerar OG; `robots.txt`/`sitemap.xml` condicionais; favicon.
- **Critério de aceite:** HTML final tem title, description, OG completos, robots `noindex` por padrão, JSON-LD válido (validar com um parser local no teste).
- **Testes:** `tests/unit/seo.test.ts` sobre `dist/index.html`.

### F13 — Copy: nove passadas

- **Objetivo:** copy final dentro da estratégia.
- **Skills:** `copywriting` (P, cache) → `copy-editing` (R obrigatória) → `humanizer:humanizer`.
- **Passadas (registrar antes/depois em `docs/41` só das strings que mudarem):**
  1. **Mensagem e estratégia:** cada seção entrega sua pergunta (§11) e a promessa única aparece em hero e fechamento.
  2. **Clareza:** cada frase entendida sozinha (teste de voz 1–2).
  3. **Concisão:** tamanhos da §9.3 (subtítulo ≤ 22 palavras; respostas da FAQ ≤ 35; corpos ≤ 40).
  4. **João:** "ele falaria/entenderia/se importaria?" (§26.5).
  5. **Diferenciação:** teste "poderia ser qualquer SaaS?" (§26.4) em todo título.
  6. **Naturalidade:** `humanizer` só nos corpos de 2+ frases (S-2, passos de S-3, S-5, S-7, respostas da FAQ), aplicando só os padrões estruturais §1–§5 da skill em pt-BR.
  7. **Guia do Foca:** dez proibições do `COPY.md` + §9.2 + glossário.
  8. **CRO:** `copy-editing` passadas "Prove It" e "Especificidade"; CTA e microcopy.
  9. **Revisão final:** leitura corrida da página no celular; teste de voz completo (`copy/02` §5).
- **Decisões já tomadas:** promessa, H1 (ou candidato), estrutura, afirmações possíveis.
- **Decisões permitidas:** palavras, ordem dentro da frase, cortes.
- **Critério de aceite:** `copy-rules.test.ts` verde; cada string com F-x da §9.4; zero travessão; teste de voz passa em todas.
- **Erros prováveis:** a skill `copywriting` puxar prova social, urgência ou benefício inflado — ignorar e registrar.

### F14 — Performance

- **Skills:** `agent-skills:performance-optimization` (P) · revisão pelo agente `web-performance-auditor`.
- **Passos:** medir build (`vite build` com relatório de tamanho), Lighthouse 3× mobile e 1× desktop, trace de performance durante S-3 com CPU 4×; corrigir até os alvos da §16.
- **Critério de aceite:** todos os alvos da §16 com número real em `docs/41`.

### F15 — Acessibilidade

- **Skills:** `web-design-guidelines` (R) · consulta `design:accessibility-review`.
- **Passos:** axe em claro e escuro (`a11y.spec.ts`); passagem de teclado completa; zoom 200%; leitor de tela se disponível (NVDA no Windows) — registrar se não foi possível; contraste de cada combinação usada.
- **Critério de aceite:** axe sem violações; itens da §17 conferidos um a um em `docs/41`.

### F16 — Revisão de CRO

- **Skills:** `cro` (P, cache).
- **Passos:** Revisão 7 da §24; para cada seção, "aumenta ou diminui a chance de o João começar?"; listar candidatos a corte **sem cortar**; checar mapa de CTA (§11).
- **Critério de aceite:** relatório de CRO em `docs/41` com recomendações classificadas (aplicar só as que não mudam estrutura/promessa; o resto vai para o usuário).

### F17 — Polimento, segurança, QA final e documentação

- **Skills:** `impeccable:impeccable` modo `critique` (R, relatório), pré-voo §14 da `design-taste-frontend`, `agent-skills:security-and-hardening`, agente `spec-verifier`.
- **Passos:** Revisão 8 (§24); segurança (§20); rodar tudo da §26; preencher a tabela G-1…G-24 com evidência; atualizar `docs/README.md` (status "IMPLEMENTADA, ISOLADA, NÃO PUBLICADA"), bloco da landing no `CLAUDE.md` (mesmo status), ponteiros em `docs/DESIGN.md` e `docs/copy/06` §2 (§15.9); `landing/README.md` final.
- **Critério de aceite:** todos os G com evidência ou marcados "não cumprido" com motivo; nenhuma mudança fora da whitelist; relatório final ao usuário listando o que depende dele (D-LP-*, DG-*).
- **Quando parar:** ao fim da F17. **Não** publicar no Vercel, **não** integrar, **não** commitar.

## 24. Revisões de design

| # | Revisão | Quando | Quem/skill | Pergunta | Saída |
|---|---|---|---|---|---|
| R1 | Arquitetura da informação | Fim da F7 | executor | A página lida só como texto conta a história da §8 na ordem? Alguma seção sem pergunta do João? | Nota em `docs/41` |
| R2 | Copy | Fim da F13 | `copy-editing` | Persona + guia + §9.4 | Tabela de passadas |
| R3 | Visual | Fim da F8 | pré-voo `design-taste-frontend` §14 + comparação com `foca-design-system-2026-09-28.html` | Parece o Foca? Parece template? Algum "AI tell"? | Lista de achados corrigidos |
| R4 | Motion | Fim da F10 | `motion-design` | Cada animação tem motivo? Algo cansa na 2ª visita? Algo esconde conteúdo? | Ajustes |
| R5 | Responsivo | Fim da F11 | executor com os 7 viewports | Mobile tem composição própria ou só empilhou? | Screenshots + notas |
| R6 | Performance | F14 | `web-performance-auditor` | Alvos da §16 | Números |
| R7 | CRO | F16 | `cro` | Cada seção aumenta a chance de começar? Ruído? | Recomendações |
| R8 | Polimento final | F17 | `impeccable critique` | Ritmo, alinhamentos, espaçamentos, transições, dark mode | Achados corrigidos/registrados |

## 25. Critérios de aceite globais

| ID | Critério | Como verificar |
|---|---|---|
| G-1 | Nenhum arquivo fora da whitelist (§15.9) foi alterado pelo executor | Comparação de `git status` com o snapshot da F0 + `check:isolation` |
| G-2 | Nenhum import de fora de `landing/` | `bun run check:isolation` |
| G-3 | Roda isoladamente: `bun install`, `dev`, `typecheck`, `build`, `preview` dentro de `landing/` | Saída real dos comandos |
| G-4 | HTML pré-renderizado com todo o conteúdo textual | `dist/index.html` contém H1, H2 e FAQ |
| G-5 | Toda afirmação visível mapeia para F-x (§9.4) | Tabela em `docs/41` |
| G-6 | Zero itens da lista proibida (§9.2) e zero travessão | `copy-rules.test.ts` |
| G-7 | Nenhuma prova social, número de pessoas, preço, duração ou aprovação | Idem + leitura |
| G-8 | Cores só com os tokens do app; reservas respeitadas (azul, marca-texto, verde/vermelho, grafite) | Revisão R3 + grep de hex em `landing/src` (só em `tokens.css`) |
| G-9 | Claro e escuro corretos, seguindo o sistema | E2E com `colorScheme` dark/light + axe nos dois |
| G-10 | Hero passa no teste de 5 segundos | §26.3 registrado |
| G-11 | CTA primário único ("Começar agora"), destinos via `appUrl('/quiz')`; ≤ 4 na página + nav + sticky | E2E conta os links e confere `href` |
| G-12 | Produto mostrado só por retratos reais e pela demo real; zero mockup de `<div>` | Revisão R3 |
| G-13 | Demo funciona com teclado e anuncia o resultado; conteúdo idêntico ao item original | E2E + diff |
| G-14 | Conteúdo visível sem JS e com reduced motion | `motion.spec.ts` |
| G-15 | Nenhum scroll listener, pin, snap, parallax, loop | grep + revisão R4 |
| G-16 | Sem rolagem horizontal em 320–1440 | `responsive.spec.ts` |
| G-17 | CTA do hero acima da dobra em 390×844 e 360×740 | E2E (`toBeInViewport`) |
| G-18 | Lighthouse mobile ≥ 90/100/100/100; CLS < 0,05; LCP < 2,5 s | Relatório em `docs/41` |
| G-19 | JS inicial ≤ 75 kB gz; movimento ≤ 45 kB gz; CSS ≤ 20 kB gz | Relatório de build |
| G-20 | axe sem violações (claro e escuro); teclado completo; foco visível | `a11y.spec.ts` + nota manual |
| G-21 | `noindex` por padrão; SEO completo quando indexável | `seo.test.ts` |
| G-22 | Nenhuma requisição a terceiros (fontes, analytics, CDN) | E2E observa `page.on('request')` e só aceita a origem da landing |
| G-23 | Skills usadas conforme §21 (registradas por fase) | `docs/41` |
| G-24 | Status documentado: `docs/README.md` e `CLAUDE.md` dizem "isolada, integração bloqueada" | Leitura |

## 26. Testes

### 26.1 Automáticos (em `landing/`)

- **Unitários (`bun test tests/unit`):** `copy-rules` (proibições, travessão, textos hardcoded em `.tsx` via regex de JSX text), `app-url`, `isolation`, `token-drift` (aviso), `seo` (sobre `dist/`).
- **E2E (`bunx playwright test`)** contra `bun run preview`: projetos `narrow` 320×700, `mobile` 390×844, `tablet` 768×1024, `desktop` 1280×800, `wide` 1440×900; `colorScheme` claro e escuro nos projetos `mobile` e `desktop`; `reducedMotion: 'reduce'` num projeto dedicado; um projeto com `javaScriptEnabled: false`.
  - `landing.spec.ts`: 1 `h1`; ordem das seções; âncoras; links para o app; FAQ abre com teclado; sticky CTA aparece/some; nenhuma requisição externa; nenhum erro no console.
  - `a11y.spec.ts`: `@axe-core/playwright` em claro e escuro.
  - `motion.spec.ts`: reduced motion e sem-JS → todo texto visível (`toBeVisible` + opacidade computada 1).
  - `responsive.spec.ts`: `scrollWidth <= innerWidth`; CTA do hero no viewport.
  - `demo.spec.ts`: estados da S-4.

### 26.2 Manuais (registrar em `docs/41`)

Teclado de ponta a ponta; zoom 200%; Chrome com CPU 4× em S-3; Safari (se disponível) ou WebKit do Playwright; celular físico **se o usuário puder** (DG-2) — caso contrário, registrar "não testado em aparelho físico", como os outros registros do projeto fazem.

### 26.3 Teste de 5 segundos

Screenshot do hero em 390×844 e 1280×800; mostrar por 5 s a um avaliador (ou, sem pessoa disponível, o executor descreve só o que está visível acima da dobra) e responder: categoria? benefício? público? ação? Passa se as quatro respostas estão explícitas no texto visível (eyebrow "Preparação para o ENEM", H1, subtítulo, botão).

### 26.4 Teste "poderia ser qualquer SaaS?"

Para cada H1/H2: trocar "Foca" (ou o sujeito implícito) por Notion, Quizlet, Khan Academy, Duolingo. Se a frase continuar verdadeira e natural para eles, reescrever com um fato do Foca (motivo à vista, faixas, "Não sei", congelamento, ENEM). Registrar o resultado por título.

### 26.5 Teste de persona

Para cada bloco: "o João falaria, entenderia ou se importaria?" Palavras que ele não usaria ("otimizar", "potencial", "jornada", "metodologia") saem.

## 27. Edge cases

- **JS bloqueado ou falhou:** página inteira legível; CTAs são `<a href>` normais; demo mostra enunciado e alternativas com um aviso "Para responder, abre no app" + CTA (string em `copy.ts`).
- **GSAP falhou ao carregar:** fallback IO; nada escondido.
- **Retrato não carregou:** `alt` + cor de fundo `cards` + borda; layout não pula (dimensões fixas).
- **Tema muda com a página aberta:** `matchMedia` troca `.dark`; `<picture>` troca sozinho.
- **Usuário que já usa o app:** "Entrar" → `{APP_URL}/`, que o leva à trilha naquele aparelho.
- **App fora do ar / `APP_URL` errado:** fora do controle da landing; registrar a URL de produção usada em `docs/41`. `APP_URL` vazio no build de produção → build falha (teste).
- **Viewport muito baixo (landscape no celular, 740×360):** hero sem `min-height` travado; sticky CTA some se a altura < 480.
- **Texto grande do sistema (acessibilidade do celular):** unidades `rem`; nada com altura fixa em px para texto.
- **Idioma:** só pt-BR.
- **Link compartilhado com âncora (`#duvidas`):** rolagem nativa, `scroll-margin-top` igual à altura da nav.

## 28. Riscos

| ID | Risco | Mitigação |
|---|---|---|
| R-1 | Copy promete além do produto | Lista fechada §9.4 + teste automático + `copy-editing` "Prove It" |
| R-2 | Retratos mostram strings antigas ou duração estimada | Lista de telas proibidas; recaptura com um comando depois do `36` F10 |
| R-3 | Página "parece template" | Assinatura rabisco (§12.5), famílias de layout distintas, pré-voo da `design-taste-frontend`, R3 e R8 |
| R-4 | Movimento pesado no celular | Sem pin; GSAP tardio; só transform/opacity; teste com CPU 4× |
| R-5 | `eslint .` da raiz enxerga `landing/` | Não roda no CI; a landing segue as mesmas regras de estilo; se o usuário quiser, uma linha em `eslint.config.js` resolve (decisão dele, fora deste plano) |
| R-6 | Tokens/arte do app mudam depois do snapshot | `check-token-drift` avisa; `sync:brand` recopia; decisão de sincronizar é explícita |
| R-7 | Trabalho paralelo não commitado confunde a verificação de isolamento | Snapshot de `git status` na F0 e comparação por fase; registrar mudanças externas |
| R-8 | Rabiscos mal desenhados parecem amadores | Poucos (5 tipos), traço consistente, revisados em R3/R8; se não ficarem bons, reduzir a 3 (marca-texto, seta, check) e registrar |
| R-9 | Tutor em produção sem chave | V-1: frase da foto sai; retrato usa fallback real |
| R-10 | Lovable reagir à pasta nova | Pasta fora de `src/`; Lovable não a constrói. Se reclamar, é decisão do usuário |
| R-11 | Supply chain nas dependências novas | `minimumReleaseAge`; lockfile próprio; `bun audit`; poucas dependências |
| R-12 | Público menor de idade e privacidade | Nada coletado; sem terceiros (G-22); FAQ de dados honesta |

## 29. Dependências e decisões pendentes

**Decisões do usuário (antes de publicar; não bloqueiam a implementação):**

| ID | Decisão | Padrão adotado até decidir |
|---|---|---|
| D-LP-1 | Pode dizer "Começar não custa nada" / "Hoje você usa sem pagar nada e sem cartão"? | Implementar as duas versões (`riscoComPreco`/`riscoSemPreco`); flag `LP_FALA_DE_PRECO = true` em dev; **publicação exige confirmação** |
| D-LP-2 | H1: "Você abre. O próximo passo já está escolhido." (ou H1-B/H1-C). Relaciona-se com D-1 (frase de posicionamento mantida no `08`) | Usar o H1 escolhido; a frase do `08` §1 não aparece na landing |
| D-LP-3 | Aprovar GSAP (`gsap`, `@gsap/react`) e as demais dependências da §15.2 **somente em `landing/`** | É a aprovação desta spec |
| D-LP-4 | Git: onde e quando commitar `landing/` (branch? worktree? junto do resto?) | Executor não faz nada de git |
| DG-1 | Criar o projeto Vercel `foca-landing` (Root Directory `landing`) e definir `VITE_APP_URL`/`VITE_SITE_URL` | Não publicado |
| DG-2 | Teste em celular físico | Registrado como não feito se não houver |

**Dependências externas a este plano:**

| ID | Dependência | Efeito |
|---|---|---|
| DEP-1 | `36` Fase 10 (migração de strings do app) | Recapturar retratos depois (`bun run shots`) |
| DEP-2 | Arte final das expressões da Foca | Nenhum efeito agora (A-7); quando existir, avaliar Foca "orgulhosa" no fechamento |
| DEP-3 | `copy/01` §4/§6 e `copy/06` §4 atualizados após o `36` T-03 | Até lá, manter a formulação conservadora do passo 2 de S-3 |
| DEP-4 | Domínio definitivo | `canonical` e `VITE_SITE_URL` |
| DEP-5 | Termos de uso e política de privacidade | Sem links no rodapé até existirem |
| DEP-6 | Animações Lottie da Foca | Decisão nova se o designer entregar |
| DEP-7 | Medição de conversão | Spec própria; hoje só barramento local |

**Verificações de produto antes de publicar:**

| ID | Verificar | Se falhar |
|---|---|---|
| V-1 | `OPENAI_API_KEY` configurada no Vercel do app (tutor e foto funcionam em produção) | Remover a frase da foto em S-7 |
| V-2 | Lições da trilha têm 4 a 8 questões em todas as matérias | Trocar para "lições curtas" |
| V-3 | Exercícios de redação acessíveis na trilha atual | Remover a FAQ 7 |
| V-4 | Regra do congelamento (1 a cada 7 dias, até 2) confere com `store.ts` | Ajustar o texto de S-5 |

---

## 30. SONNET 5.5 EXECUTION HANDOFF

> Para quando o usuário disser: **"Execute o plano da Landing Page usando Sonnet 5.5."**

**0. Pré-condição.** Abra este arquivo. O status no topo diz "aprovado em …"? Se não, **pare e pergunte ao usuário** se aprova (e registre a data). Se `landing/` já existir, pare e pergunte.

**1. Por onde começar.** Fase F0 (§23). Crie `docs/historico/iniciativas/40-41-42-43-landing/41-registro-execucao-landing-page.md`. Salve no scratchpad o `git status --porcelain` de tudo fora de `landing/`.

**2. O que ler.** A lista da F1, nesta ordem, e nada além do necessário por fase. Docs grandes: por seção (`grep -n "^## "`).

**3. Quais skills carregar.** Exatamente o mapa da §21, fase a fase. Marketing e GSAP: **ler o `SKILL.md` do cache**, sem ligar plugins. Nunca: `better-writing`, `frontend-design`, `impeccable init/document`, `ui-ux-pro-max --persist`, as cinco de design juntas.

**4. Quais arquivos tocar.** Só a whitelist da §15.9. Tudo o mais é leitura.

**5. Quais arquivos não tocar.** `src/**`, `public/**`, `tests/**`, `scripts/**`, `content-pipeline/**`, e todos os arquivos de config da raiz (lista "Nunca" da §15.9). Não rodar `bun install`/`bun add`/`bun run build` na raiz. Não commitar, não criar branch, não fazer push, não publicar.

**6. Ordem.** F0 → F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → F9 → F10 → F11 → F12 → F13 → F14 → F15 → F16 → F17. Não pular. Não reordenar sem registrar o motivo em `docs/41`.

**7. Como testar (ao fim de cada fase a partir da F4, dentro de `landing/`):**
```bash
bun run typecheck && bun test tests/unit && bun run build && bun run check:isolation
bunx playwright test            # a partir da F7
bun run lighthouse              # F14 e F17
```
Cole a saída real (resumo com números) em `docs/41`. Teste vermelho = a fase não terminou.

**8. Como validar antes de continuar.** Critério de aceite da fase cumprido com evidência; `git status` fora de `landing/` comparado com o snapshot (nenhuma diferença causada por você); nenhuma string nova fora de `copy.ts`; `docs/41` atualizado.

**9. O que decidir sozinho e o que não.** Sozinho: o que cada fase lista em "Decisões permitidas". Não: promessa, H1 fora dos candidatos, seção nova, cor nova, dependência nova além da §15.2, integração com o app, publicação, analytics. Na dúvida: seguir a intenção desta spec, registrar a divergência, e só perguntar se bloquear.

**10. Quando parar.** Ao fim da F17, com a tabela G-1…G-24 preenchida e o relatório final ao usuário contendo: o que foi feito, números de teste, o que não foi testado, e a lista de decisões pendentes dele (D-LP-1, D-LP-2, D-LP-4, DG-1, DG-2, V-1…V-4). **Não** integrar ao app, **não** publicar, **não** commitar. Integração só com o pedido explícito "Agora integre a Landing Page ao aplicativo." — e aí com uma spec nova (§22).
