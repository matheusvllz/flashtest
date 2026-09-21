# 09 — Branding & Design System (Foca)

Status: 🟡 **marca nova em definição (20/09/2026)** — o projeto voltou ao nome **Foca**, com a foca como mascote da marca. Este arquivo é a fonte de verdade da marca. O mascote (personalidade, expressões, voz) tem documento próprio: `15-mascote-e-voz.md`. O sistema de recompensa (sons, animações, streak): `16-gamificacao-e-dopamina.md`.

> **✅ Aplicado no código em 20/09/2026 — ver `17-plano-migracao-visual-foca.md`.** A arte final da logo (cabeça em 3/4, 6 versões) substituiu o SVG de referência da §2; os originais estão em `src/assets/branding/foca/`.
>
> **🗄️ Paleta Ártica (§3 abaixo) substituída em 20/09/2026.** A direção de marca mudou para **Rabisco na Margem** (grafite + papel + caneta azul) — ver `brand/foca-rabisco-branding.md` e o design system completo em `18-plano-reestilizacao-rabisco.md`. A §3 deste arquivo fica como registro histórico da primeira paleta; não usar seus hex no código.

---

## 0. O que mudou, e por que isso não é capricho

| | Flash Test (22/07–20/09) | **Foca** (agora) |
|---|---|---|
| **Nome** | Flash Test | **Foca** |
| **Motivo assinatura** | Raio (capelo + borla virando relâmpago) | **A cabeça da foca** |
| **Mascote** | Nenhum (a foca tinha sido cortada em 22/07) | **A Foca** — personagem central, estilo Duo |
| **Paleta** | Navy `#02104E` + Gold `#FEB803` | **Ártica** — azul-gelo + coral (Seção 3) |
| **Promessa** | "Não é mais aula. É o hábito que te aprova." | Trocadilho com **focar** (Seção 6) |

**O argumento:** "Flash Test" descrevia a mecânica (rápido, teste). **"Foca" descreve o que o produto pede do usuário** — e o verbo já está no nome. Num produto cuja dor é *"não consigo focar porque o TikTok me sequestrou"*, um nome que é literalmente o imperativo do que falta vale mais que um nome que descreve o formato.

O mascote deixa de ser enfeite pelo mesmo motivo: a persona (`14-persona-joao.md`) não abandona apps de estudo por falta de conteúdo — abandona porque **não há ninguém do outro lado**. Um personagem com voz própria é o que transforma "abrir um app" em "voltar pra alguém". É a aposta do Duolingo, e é a única mecânica de retenção comprovada em massa nesse público.

> **Nota histórica.** "Foca" era o nome de trabalho original, trocado por "Flash Test" em 21/07 quando o design system foi entregue com aquela assinatura, e o mascote foi cortado em 22/07 (`12` §7). As duas decisões estão sendo revertidas de propósito. O design system antigo continua em `brand/Flash Test - design System.html` e os tokens antigos em `src/styles.css` até a migração.

---

## 1. A marca em uma frase

**Foca é o app que devolve o foco de quem perdeu pro feed — 60 segundos por dia, com uma foca cobrando.**

---

## 2. Logo

### O que é

A **cabeça da foca, de frente** — desenho simples, geométrico, sem corpo e sem cenário. Precisa funcionar como ícone de app em 48px, em monocromático, e tatuado numa camiseta.

### O problema de desenho a resolver

Cabeça de foca simplificada **vira cachorro, urso ou lontra** em 9 de cada 10 tentativas. Os quatro traços que salvam a leitura, em ordem de importância:

1. **Sem orelhas externas.** Foca verdadeira (*Phocidae*) não tem pavilhão auricular. É o traço que mais separa de cachorro/urso — e o mais fácil de errar por instinto.
2. **Olhos enormes, redondos e totalmente escuros**, sem esclera visível, afastados. Olho de foca não tem branco. Se você desenhar branco no olho, virou desenho de cachorro.
3. **Focinho largo e alto**, ocupando o terço inferior inteiro da cabeça — mais largo que a distância entre os olhos.
4. **Vibrissas (bigodes)** saindo do focinho, 2–3 de cada lado. É o que diz "animal marinho" sem precisar de água.

### Construção de referência

Grade de 64×64, cabeça ocupando 46×48 centralizada, focinho a partir de 62% da altura. SVG de referência (é ponto de partida para o designer, não arte final):

```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foca">
  <!-- cabeça: oval levemente achatada no topo -->
  <path d="M32 6 C46 6 55 16 55 29 C55 43 45 54 32 54 C19 54 9 43 9 29 C9 16 18 6 32 6 Z" fill="#CBD5E1"/>
  <!-- focinho: oval claro no terço inferior -->
  <ellipse cx="32" cy="40" rx="15" ry="11" fill="#E8F4FB"/>
  <!-- olhos: grandes, escuros, sem esclera -->
  <ellipse cx="22" cy="26" rx="4.5" ry="5.5" fill="#0B2545"/>
  <ellipse cx="42" cy="26" rx="4.5" ry="5.5" fill="#0B2545"/>
  <circle cx="23.5" cy="24" r="1.6" fill="#FFFFFF"/>
  <circle cx="43.5" cy="24" r="1.6" fill="#FFFFFF"/>
  <!-- nariz -->
  <path d="M32 34 c-3 0 -5 1.6 -5 3.2 0 1.6 2.2 2.8 5 2.8 s5 -1.2 5 -2.8 c0 -1.6 -2 -3.2 -5 -3.2 z" fill="#0B2545"/>
  <!-- boca -->
  <path d="M32 40 v2.6 M32 42.6 c-2.4 0 -3.9 -1.3 -4.5 -2.5 M32 42.6 c2.4 0 3.9 -1.3 4.5 -2.5"
        stroke="#0B2545" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <!-- vibrissas -->
  <g stroke="#0B2545" stroke-width="1.2" stroke-linecap="round" opacity="0.55">
    <path d="M17 37 h-6"/><path d="M17.5 41 l-5.5 2"/>
    <path d="M47 37 h6"/><path d="M46.5 41 l5.5 2"/>
  </g>
</svg>
```

### Versões obrigatórias

| Versão | Uso | Regra |
|---|---|---|
| **Cheia** | Ícone do app, splash, favicon | Pelo Foca `#CBD5E1` sobre Abismo `#0B2545` |
| **Invertida** | Sobre fundo claro | Pelo `#94A3B8`, traços em Abismo |
| **Mono 1 cor** | Marca d'água, bordado, impressão barata | Só silhueta + olhos + nariz; vibrissas somem |
| **Wordmark** | Header, LP, assinatura | Cabeça + "Foca" em Space Grotesk bold |

### O que nunca fazer

- ❌ Colocar orelhas. Não é cachorro.
- ❌ Branco no olho. Mata a leitura de foca instantaneamente.
- ❌ Esticar, rotacionar ou inclinar a cabeça (ela pode *mudar de expressão*, não de proporção — ver `15`).
- ❌ Usar a foca em vermelho ou verde. Essas duas cores pertencem ao feedback de resposta e a nada mais.
- ❌ Bolinha na ponta do nariz estilo urso de pelúcia. Rebaixa a marca para público infantil — o alvo tem 16–19 anos.

---

## 3. Paleta — Ártica

O habitat da foca: mar, gelo, sol baixo. Frio de base, calor só na recompensa.

| Token | Hex | Uso |
|---|---|---|
| **Abismo** (primária escura) | `#0B2545` | Fundo institucional, telas de marca, splash, texto forte |
| **Mar** (primária) | `#0EA5E9` | Elementos interativos, links, superfícies frias, barra de progresso |
| **Mar Fundo** | `#0369A1` | Mar sobre fundo claro, hover, texto azul legível |
| **Gelo** | `#E8F4FB` | Cards, superfícies claras frias |
| **Neve** | `#F1F5F9` | Fundo de página |
| **Coral** (acento/recompensa) | `#FF6B4A` | **CTA, XP, streak, recompensa.** É o antigo papel do gold |
| **Coral Claro** | `#FF9E85` | Brilho, badge, estados leves |
| **Pelo Foca** | `#CBD5E1` | O mascote e as ilustrações |
| **Pelo Sombra** | `#94A3B8` | Sombra do mascote, logo invertida |
| **Névoa** | `#64748B` | Texto secundário, legendas, placeholders |
| **Branco** | `#FFFFFF` | Texto sobre escuro, superfícies |
| **Sucesso (acerto)** | `#0AA35A` | **Só** feedback de resposta certa |
| **Erro (errou)** | `#A02540` | **Só** feedback de resposta errada |

**Proporção de uso:** Mar/Abismo **65%** · Coral **10%** · Neutros frios **25%**.

### A regra dura do coral vs. o vermelho de erro

Coral `#FF6B4A` e o vermelho de erro são da mesma família quente. Isso é um risco real de leitura na aula de 60s, onde o aluno lê a cor antes de ler a palavra. Três defesas, todas obrigatórias:

1. **O erro foi afastado para vinho profundo `#A02540`** — muda em luminosidade (L~35 vs. L~65) e em saturação, não só em matiz. Confunde muito menos que o `#C0392B` original.
2. **Coral é proibido dentro da superfície de feedback.** Na tela de questão, entre o momento de responder e o de avançar, não existe coral: nem no botão, nem no XP, nem no ícone. O XP em coral aparece **depois** da transição.
3. **Cor nunca é o único sinal.** Acerto e erro sempre carregam ícone (✓ / ✕) + palavra. Isso é requisito de acessibilidade para daltonismo (protanopia/deuteranopia colapsam verde-vermelho), não refinamento opcional.

> **Se na prática o par ainda brigar**, o plano B é mover o acento de `#FF6B4A` para âmbar `#FFB703` — mais distante do vermelho, e mais perto do que o gold já fazia bem. Não fiz isso de saída porque descaracterizaria a escolha da paleta Ártica.

---

## 4. Tipografia

Mantida do design system anterior por ora — decisão pendente.

- **Títulos / display:** **Space Grotesk** (700/bold) — números grandes (XP, streak, "60 segundos").
- **Texto corrido / UI:** **Plus Jakarta Sans** — questões, explicações, corpo.
- Fallback: `-apple-system, BlinkMacSystemFont, sans-serif`.

> **🔲 Pendência.** Space Grotesk é geométrica e "tech" — combinava com o raio, combina menos com um mascote. Uma display mais arredondada (Baloo 2, Fredoka, Nunito) empurraria a marca para o território lúdico do Duolingo e casaria melhor com a Foca. **Contra:** o público tem 16–19 anos, e arredondado demais infantiliza um produto que precisa ser levado a sério como preparação para o ENEM. Decidir junto com a arte final do mascote, não antes.

---

## 5. Aplicação no produto

- **Splash / onboarding:** fundo Abismo, a cabeça da Foca grande e centralizada, wordmark abaixo.
- **Quiz de entrada:** telas Abismo, uma pergunta por tela, progresso em Mar.
- **Transição para o produto:** entra fundo Neve quando começa a estudar — reforça "abriu a marca → entrou pra focar".
- **Aula de 60s:** fundo Neve, questão em Plus Jakarta Sans, feedback verde/vinho com ícone + palavra, **sem coral na superfície de feedback**.
- **XP / streak:** Coral, Space Grotesk, número grande. O coral é a cor da dopamina — usar com parcimônia é o que o faz funcionar.
- **A Foca nas telas:** presença definida em `15-mascote-e-voz.md` §4. Regra de ouro: ela aparece nos momentos de **transição emocional** (aha, erro, fim de aula, streak em risco), nunca como decoração permanente de header.
- **Tutor de IA:** deixa de ser "o tutor" genérico e passa a ser **a própria Foca falando** (`15` §6).

---

## 6. Slogan e assinatura — opções

Pedido: mais opções de trocadilho com *focar / foco / foca*. Abaixo, organizadas por onde cada uma aguenta viver. **Nenhuma escolhida ainda.**

### A. Assinatura de logo (curtas, 2–4 palavras)

| Slogan | Leitura |
|---|---|
| **Foca 60 segundos.** | Imperativo + mecânica. A mais completa em menos palavras. |
| **Foca aí.** | Coloquial, brasileiro, soa como amigo cutucando. Muito memável. |
| **Desfoca do feed.** | Nomeia o inimigo. Agressiva, mas não explica o produto sozinha. |
| **Bora focar.** | Convite, sem cobrança. Combina menos com o mascote cobrador. |
| **Foca. Todo dia.** | Ritmo de manifesto. Enfatiza constância, que é a tese do produto. |
| **O foco é o app.** | Inteligente, mas exige duas leituras — ruim para assinatura. |

### B. Headline de anúncio / LP (longas, carregam o argumento)

| Slogan | Leitura |
|---|---|
| **Você não tem falta de foco. Tem falta de Foca.** | A mais forte do lote. Vira a auto-acusação do avessso: a culpa não é dele, é de não ter ferramenta. Nomeia o produto no fim, que é onde a piada fecha. |
| **O feed te desfoca em 3 segundos. A Foca te foca em 60.** | Confronto direto com o TikTok, com número dos dois lados. |
| **Todo mundo tem conteúdo. Quase ninguém tem foco.** | Herda a estrutura que já funcionava no Flash Test (`13`), agora com o verbo do nome. |
| **Estudar 60 segundos parece pouco. É mais do que você fez ontem.** | Cobrança cômica pura — a voz do mascote virando headline. |
| **Sua próxima hora de TikTok cabe 60 aulas aqui dentro.** | Matemática que dói. Usa o dado das 9h13 de tela (`01`). |
| **Não é força de vontade. É uma foca te enchendo o saco todo dia.** | Honestidade escancarada sobre a mecânica. Alto risco, alto retorno. |

### C. Microcopy / notificação (a voz do mascote, ver `15`)

- **"Foca aí."** — notificação padrão, 2 palavras, 60s antes de perder o streak.
- **"Cadê o foco?"** — cutucada leve.
- **"Tô focando sozinha aqui."** — abandono de 2+ dias.
- **"Você focou 4 dias seguidos. Não estraga agora."** — streak em risco.
- **"Desfocou ontem. Acontece. Foca hoje."** — recomeço, **sem culpa** (regra do `15` §3).

> **Recomendação de sócio:** a combinação mais forte é **"Foca 60 segundos."** como assinatura de logo + **"Você não tem falta de foco. Tem falta de Foca."** como headline de campanha. Uma explica o produto; a outra vende a ideia. Não use a longa embaixo da logo — trocadilho longo em assinatura cansa na terceira exposição.

---

## 7. Pendências de marca

- [ ] **Escolher slogan** — assinatura + headline (Seção 6).
- [ ] **Arte final do mascote** — a partir do SVG de referência (Seção 2) e das expressões de `15` §5.
- [ ] **Decidir tipografia display** — manter Space Grotesk ou migrar para arredondada (Seção 4).
- [ ] **Validar o par coral/vinho em tela real**, inclusive em simulação de daltonismo (Seção 3).
- [ ] **Nome de domínio / handle** — `flashtest-enem.netlify.app` e o repo `flashtest` ficam desalinhados com a marca nova.
- [ ] Exportar assets: PNG/SVG da logo em fundo claro e escuro, ícone do app, favicon, OG image.

---

## 8. Checklist de migração no código (executado — ver 17)

Levantamento real feito no código em 20/09/2026. **Nada disto foi aplicado** — o app segue Flash Test.

### Marca e nome

| Onde | O que muda |
|---|---|
| `src/components/AppShell.tsx:9-20` | `BrandMark` — troca `/flashtest-logo.png` pelo SVG da cabeça da Foca (inline, não PNG: escala melhor e aceita troca de cor por token) |
| `src/components/AppShell.tsx:25` | **`Bolt` (o raio) morre.** É o motivo assinatura antigo, usado como bullet, selo e indicador de streak. Precisa de substituto — provavelmente o próprio ícone da Foca em versão mono |
| `src/routes/index.tsx:30` | Splash: título "Flash Test" → "Foca" + slogan escolhido |
| `src/routes/welcome.tsx:20`, `src/routes/quiz.tsx:74` | Nome nas telas de entrada |
| `src/routes/__root.tsx:81,87` | `<title>` e `og:title` |
| `src/components/TutorBubble.tsx:219` | "Tutor Flash Test" → a Foca (ver `15` §6) |
| `public/flashtest-logo.png` | Substituir / remover |

### Estado persistido — atenção

| Onde | O que muda |
|---|---|
| `src/lib/store.ts:88` | Chave `"flashtest.state.v2"`. **Trocar o nome da chave apaga o progresso de quem já usou.** Duas saídas: manter a chave antiga (invisível ao usuário, zero risco) ou migrar para `"foca.state.v3"` lendo a v2 uma vez e reescrevendo. **Recomendo migrar com leitura da anterior** — deixar "flashtest" no storage vira dívida confusa. |

### Voz e IA

| Onde | O que muda |
|---|---|
| `src/lib/tutor-prompt.ts:52` | A persona do prompt deixa de ser "tutor motivador" e passa a ser a Foca cobradora (`15` §6). **A regra anti-LaTeX e o fallback local continuam** — são independentes da marca |
| `src/lib/lessons/types.ts:9-11` | Comentários citando "o tutor do Flash Test (identidade do raio)" |
| `src/components/lessons/exercises/shared.ts:23` | Comentário citando o design system antigo |

### Tokens

| Onde | O que muda |
|---|---|
| `src/styles.css:7-24` | Bloco `@theme inline` inteiro: navy/royal/yellow/gold-dark/glow → Abismo/Mar/Coral/etc. **`--color-error` sai de `#c0392b` para `#a02540`** (Seção 3). As classes Tailwind (`bg-navy`, `text-yellow`…) estão espalhadas por todas as rotas — ou se renomeiam os tokens e se atualiza tudo, ou se mantêm os *nomes* das variáveis e se trocam só os *valores*. **A segunda opção é muito mais barata e igualmente correta**, ao custo de ter uma variável chamada `--color-navy` valendo azul-gelo. Recomendo renomear de verdade: o custo é um find-and-replace, e nome mentiroso em design system envenena tudo que vier depois. |

### Fora do código

- `netlify.toml` / nome do site (`flashtest-enem`), repo `github.com/matheusvllz/flashtest`, e o projeto no Lovable.
- ⚠️ Renomear o repositório **não** quebra o Lovable (a conexão é por remote, e o GitHub redireciona), mas o remote local precisa ser atualizado. Isso **não** é reescrita de histórico — segue seguro.
