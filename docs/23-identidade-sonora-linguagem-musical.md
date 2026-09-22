# 23 — Identidade sonora: linguagem musical do Foca e prompts de geração

> **Status: proposta, não decisão fechada.** Estende `docs/20` §6.3/§6.4 e revisita a decisão **D3** do `docs/18` §10.2 ("sintetizar com WebAudio, sem arquivo, sem biblioteca... se um dia houver assets, `sfx.ts`/a engine trocam a implementação sem mudar a API"). O piloto de escuta de 8 participantes previsto no `20` §6.4 **ainda não rodou** (confirmado no `22`, linha 38). Este documento não substitui esse piloto — ele prepara os 12 candidatos sonoros pra gerar com IA, com uma justificativa de design, pra depois serem ouvidos, ajustados e só então virarem decisão registrada (ver §6).

## 0. Contexto

Data: 21/09/2026. Motivo: os efeitos sonoros atuais (`src/lib/audio/identity.ts` + `engine.ts`, "rabisco que encaixa", `docs/20` §6.3) funcionam tecnicamente — unlock por gesto, cancelamento, expiração, fila, tudo certo (`docs/22`) — mas soam genéricos, porque são osciladores `sine`/`triangle` puros, sem nenhuma textura própria. Este documento: (1) resume o que pesquisa em sonic branding diz sobre por que alguns sons grudam e outros não; (2) propõe uma linguagem musical coesa pro Foca, construída sobre o motivo que já existe; (3) entrega um prompt pronto por som, pra gerar com IA (ElevenLabs Sound Effects, Stable Audio e ferramentas equivalentes — todos escritos em inglês, que é o idioma em que esses modelos respondem com mais precisão); (4) especifica o formato técnico dos arquivos pra facilitar a implementação.

## 1. Por que o som atual soa "de interface genérica"

O motivo escolhido no `20` §6.3 — Ré5 → Lá5 → Fá#5 — é, musicalmente, ótimo: é a **tríade de Ré maior (D–F#–A)** arpejada como uma quinta ascendente seguida de uma terça menor descendente. Isso já cumpre o princípio mais importante de um sistema sonoro de marca (mantido do `docs/16` §3: "tudo na mesma escala"). O problema não é a melodia — é que ela está implementada como três osciladores senoidais/triangulares puros, sem nenhuma fonte, textura ou "sujeira" que sirva de impressão digital. Qualquer app pode gerar a mesma sequência de Hz com `OscillatorNode`. É correto, mas não é **do Foca** — é a diferença entre uma escala e uma voz.

## 2. O que a pesquisa em sonic branding diz

- **Brevidade é reconhecimento.** Reação a som leva ~0,146s — mais rápido que processar uma imagem. Os áudio-logos mais citados como eficazes (Intel, Netflix) são curtos de propósito; a era do streaming reforçou isso — o VP de Produto da Netflix disse que o "Tudum" precisava ser rápido porque "você chega, quer clicar, não tem paciência". O Foca já segue esse princípio (nada acima de 1s, a maioria abaixo de 400ms) — manter.
- **A impressão digital vem de fontes não óbvias, não de osciladores puros.** O "Tudum" da Netflix não é um sintetizador: é o anel de casamento do sound designer batendo num armário (o transiente percussivo), uma bigorna desacelerada (o grave) e um trecho de guitarra tocado ao contrário e processado (o "blossom" que fecha o som) — nada disso soa como um instrumento reconhecível, e é exatamente por isso que ninguém confunde com outra coisa. A lição pro Foca: a melodia certa não basta: falta uma **textura física real** por trás dela.
- **Uma família sonora se constrói variando um motivo, não inventando sons novos.** Isso é literalmente a definição de *earcon* (Blattner et al., 1985/89): um motivo curto e reconhecível, do qual variações — de ritmo, registro, timbre, densidade — derivam uma família inteira de sons relacionados, hierarquicamente ligados a eventos relacionados. É exatamente o que `identity.ts` já faz bem (todo evento deriva do `MOTIVO`) — a proposta abaixo reforça isso, não substitui.
- **Congruência emocional com a marca importa mais que originalidade pela originalidade.** A Netflix rejeitou explicitamente um som "eletrônico, tipo console de videogame" porque não combinava com "estamos no negócio de entretenimento". O Foca já proíbe buzzer/videogame/voz (`docs/16` §3, `docs/20` §6.3) — a proposta abaixo dá um destino concreto pra essa regra: a marca é papel, grafite e caneta azul (Rabisco na Margem), não vidro e neon.
- **Raridade é orçamento.** Sons ouvidos dezenas de vezes por sessão (resposta correta) precisam ser os mais econômicos da família; riqueza e duração maiores são reservadas pro raro — já é regra explícita do `docs/16` §3 regra 5 e da tabela do `docs/20` §6.3 ("raro = especial"). Mantida integralmente abaixo.

Fontes: [Twenty Thousand Hertz — a criação do "Tudum" da Netflix](https://www.20k.org/episodes/netflix) · [Ramotion — Sonic Branding: Definition & Examples](https://www.ramotion.com/blog/sonic-branding/) · [Wikipedia — Earcon](https://en.wikipedia.org/wiki/Earcon)

## 3. A linguagem musical do Foca

### 3.1 O vocabulário harmônico: um acorde só

O motivo já usa só três notas — Ré, Fá# e Lá — que formam a tríade de **Ré maior**. Proponho nomear isso e travar como regra de vocabulário: **nenhum evento novo introduz nota fora de {D, F#, A}** (mais as oitavas D4/D6/A4/F#4/A6 já em uso). Isso não é uma tonalidade nova — é reconhecer por escrito a que já existe, pra qualquer variação futura (inclusive as que a IA gerar) ser auditável contra uma regra simples, do jeito que o `docs/16` §3 já fazia com "tudo em dó maior".

### 3.2 A camada física: o "rabisco que encaixa" ganha uma textura literal

Cada som passa a ter duas camadas, não uma:

1. **Camada melódica** — o motivo, num timbre quente de mallet/kalimba abafada (poucos harmônicos, ataque rápido, decaimento curto), substituindo o seno puro atual.
2. **Camada de textura** — um toque sutil de **grafite/lápis sobre papel** no ataque da primeira nota, baixo na mixagem, quase subliminar. É o equivalente do anel de casamento do Tudum: o elemento que não é "música" nem "efeito de UI", mas transforma um acorde correto num som que só o Foca tem. Literalmente traduz "rabisco que encaixa" (o nome que o `20` §6.3 já deu à direção): o som de um traço de lápis pousando no lugar certo.

Nos eventos raros e grandes (abertura importante, level up, conquista, recompensa especial), essa camada de textura pode crescer para um sopro breve de papel — como uma página virando rápido — sem virar efeito de jogo. É o "blossom" do Foca.

### 3.3 Regras de timbre e envelope (mantidas do `docs/20` §6.3 e `docs/16` §3, reforçadas aqui)

Núcleo quente, poucos harmônicos, ataque curto (5–10ms), sem estridência, sem metal com ressonância longa, sem reverb grande (exceto um traço curtíssimo nos eventos raros). Erro nunca é punitivo: sem dissonância, sem buzzer, volume percebido menor que o acerto. Nunca imitar diretamente Duolingo, Netflix ou sons de console — usar os princípios de composição, não as amostras.

## 4. Os 12 sons atuais e os prompts de geração

Os 12 eventos abaixo são exatamente os `SoundEvent` de `src/lib/audio/identity.ts` (o `pop`/balão de `sfx.ts` é fachada morta, sem uso ativo — não entrou aqui). Cada prompt está pronto pra colar em ElevenLabs Sound Effects, Stable Audio ou equivalente. Peça a menor duração que a ferramenta permitir e apare o silêncio nas pontas depois — a maioria dessas ferramentas tem duração mínima maior que os alvos aqui.

### 4.1 `resposta-correta` — motivo puro, o som mais ouvido do app (~235ms, uma vez por validação)

```
A short, warm three-note ascending-then-falling chime: D5 → A5 → F#5 (a rising
perfect fifth followed by a falling minor third), played on a soft muted
mallet/kalimba-like tone — few harmonics, no metallic ring, no long resonance.
Underneath the attack of the first note, layer a very subtle, soft
pencil-tip-on-paper tap (like a light graphite mark landing on a notebook
page) — quiet, textural, not a distinct "knock", just enough grain to make
the tone feel handmade rather than digital. Total duration about 200-250ms,
fast attack (under 10ms), quick natural decay, no reverb tail, no vibrato.
Mood: light, precise, satisfying — like a pencil mark landing exactly where
it should. Avoid: bells or chimes with long ring, 8-bit/video-game tones,
marimba with heavy resonance, any vocal or "ta-da" fanfare quality. Mono,
clean, normalized, no clipping.
```

### 4.2 `resposta-incorreta` — dois pulsos suaves, nunca punitivo (~140-170ms)

```
Two soft, low, muted pulses on the same low pitch, D4, about 70-90ms apart,
each around 70ms long. Use a soft, damped wood/mallet tone — rounded, no
sharp attack transient, no metallic edge, and absolutely no dissonant
interval, no buzzer, no descending "wrong answer" trombone sound. The two
pulses should feel like a gentle, neutral tap-tap — informative, not
scolding, quieter than the correct-answer sound. Total duration under 170ms.
Keep it plain and calm, almost like a soft knuckle tapping wood twice — no
pencil-tap texture layer here. Mono, no reverb, gentle low-pass warmth,
normalized without harsh peaks.
```

### 4.3 `acerto-consecutivo` — motivo + nota extra discreta (~300-350ms, 3º acerto seguido, uma vez por sessão)

```
The same three-note motif as the "correct answer" chime (D5 to A5 to F#5,
warm muted mallet with a soft pencil-tap texture on the first attack),
followed after a short gap by one extra discreet high note, D6, quieter and
softer than the main motif — like a small extra sparkle added on top, not a
new fanfare. Total duration about 300-330ms. Should read as "the same idea
as usual, plus a small bonus note" rather than a completely different sound.
No cymbal shimmer, no long tail. Mono, normalized.
```

### 4.4 `conclusao-licao` — motivo resolvido com acorde leve por baixo (~550-650ms)

```
The core three-note motif (D5 to A5 to F#5, warm muted mallet with a light
pencil-tap texture) followed by a soft sustained low chord underneath — D5
and F#5 held together very quietly, like a gentle resolution or exhale,
fading out naturally over roughly 350ms. Total duration about 550-600ms.
Should feel like a small, satisfying close — a page finished, not a big
celebration. Warm, soft-edged, no shimmer or bright synth pad, no reverb
wash. Mono, normalized, smooth fade-out with no click.
```

### 4.5 `level-up` — motivo expandido, transição real de nível (~700-850ms)

```
An expanded version of the Foca motif: D5 to A5 to F#5 played slightly
slower and a touch louder than usual, followed by a longer sustained high
note, D6, that rings out warmly for about 400ms before fading. Same warm
muted mallet/kalimba timbre as the rest of the family, with a hint of the
pencil-tap texture at the very start. Total duration about 700-800ms. A
bigger, more open moment than the everyday correct-answer sound, but still
restrained — no orchestral hit, no synth brass, no "game achievement"
fanfare, no cymbal crash. Mono, gentle natural decay, normalized, no
clipping.
```

### 4.6 `conquista` — variação mais aberta, só conquista nova (~800-900ms; sem gatilho real ainda no código)

```
A wider, more open variation of the Foca motif: D5 to F#5 to A5 to D6, each
note slightly longer and more spaced than the everyday chime, same warm
muted mallet timbre, ending on a soft sustained high D6 that lingers gently
for about 500ms before fading naturally. Total duration about 800-900ms.
Special and a little more expansive than "level up", but still restrained,
precise, pencil-and-paper in character — not a synth fanfare, not a
coin/collectible game sound, no cymbal or brass. A very subtle soft
paper-rustle swell may be layered underneath the final note, barely
audible. Mono, normalized, smooth fade, no clipping.
```

### 4.7 `streak-diario` — Ré5-Fá#5, mais curto, não toca em toda resposta (~220-280ms)

```
A short two-note fragment of the Foca motif: D5 followed by F#5 (skip the A5
middle note), same warm muted mallet tone, quick and light. Total duration
about 220-260ms. A quick, friendly acknowledgment — brighter and a touch
more energetic than the everyday correct-answer sound, but still short and
non-intrusive since it can repeat daily. No pencil-tap texture needed here —
keep it clean and simple. Mono, fast decay, no reverb tail, normalized.
```

### 4.8 `marco-streak` — motivo expandido, marcos de 7/30/100 dias (~600-750ms)

```
An expanded version of the Foca motif for a milestone moment: D5 to A5 to
F#5 played with slightly more presence (a bit louder, a touch slower) than
the everyday chime, followed by a sustained high D6 that fades out over
about 300ms. Warm muted mallet/kalimba timbre, light pencil-tap texture on
the first attack. Total duration about 600-650ms. Clearly more significant
than the daily streak sound but not as large as "level up" — a milestone,
not a celebration. No fanfare, no bright synth pad, no game-achievement
chime. Mono, normalized, smooth natural fade.
```

### 4.9 `capitulo-desbloqueado` — motivo com abertura final, evento único (~350-450ms)

```
The core Foca motif (D5 to A5 to F#5, warm muted mallet, light pencil-tap
texture) followed by a soft, open high note, D6, that rings briefly and
fades — like something opening up or unlocking, but calm, not triumphant.
Total duration about 350-400ms. A small "door opening" moment: airy, a
touch of brightness at the end, no metallic lock/click sound, no
video-game "unlock" jingle, no long shimmer. Mono, normalized, gentle
fade, no clipping.
```

### 4.10 `meta-diaria` — motivo concluído, uma vez por dia/meta (~450-550ms)

```
The core Foca motif (D5 to A5 to F#5, warm muted mallet, light pencil-tap
texture) followed by one soft extra note, A5, slightly sustained, fading
gently over about 200ms — a small, warm sense of closure, modest and
satisfying rather than a big swell. Total duration about 400-450ms. Sits
between the everyday correct-answer sound and "conclusao-licao" in size —
just the motif plus a soft echo of one of its own notes, no chord. Mono,
normalized, smooth fade, no clipping.
```

### 4.11 `abertura-importante` — fragmento do motivo, até 180ms, iniciado pelo usuário

```
A very short two-note fragment of the Foca motif: just D5 into A5, quick
and light, warm muted mallet tone, almost like a soft "here we go" tap.
Total duration under 180ms. No pencil-tap layer, no reverb, no sustain —
a light UI cue for something the user themselves just opened, not a
reward. Calm and inviting, not exciting or celebratory. Mono, fast attack
and decay, normalized.
```

### 4.12 `recompensa-especial` — versão completa, rara, até 1s

```
The fullest, richest version of the Foca motif: D5 to A5 to F#5, each note
a little more present (louder, slightly slower) than the everyday chime,
resolving into a warm sustained high D6 that lingers and fades naturally
over close to 600ms. Same warm muted mallet/kalimba family timbre
throughout, with the pencil-tap texture clearly audible on the very first
attack, and a very soft, brief paper-rustle swell underneath the final
sustained note — like a page turning as the sound settles. Total duration
up to 1 second. The rarest, most special sound in the family — unmistakably
bigger and warmer than every other Foca sound, but still handmade and warm,
never a synth fanfare, never an orchestral hit, never a game "treasure"
jingle, no cymbal, no bright digital shimmer. Mono or subtle stereo width,
normalized, no clipping, smooth natural fade to silence.
```

## 5. Especificação técnica dos arquivos, pro handoff virar implementação direto

- **Formato:** WAV 44.1kHz, 16-bit, mono (ou estéreo bem discreto só no `recompensa-especial`, se a ferramenta gerar assim). Exportar também uma versão MP3/OGG ~128-192kbps se o tamanho de bundle importar — decisão de implementação, não deste documento.
- **Nomeação:** o nome do arquivo é a própria chave do `SoundEvent`, sem tradução — `resposta-correta.wav`, `resposta-incorreta.wav`, `acerto-consecutivo.wav`, `conclusao-licao.wav`, `level-up.wav`, `conquista.wav`, `streak-diario.wav`, `marco-streak.wav`, `capitulo-desbloqueado.wav`, `meta-diaria.wav`, `abertura-importante.wav`, `recompensa-especial.wav`. Isso deixa o mapa evento→arquivo trivial de escrever no código.
- **Pasta sugerida:** `public/sfx/` (pasta nova — ainda não existe no projeto).
- **Pós-processamento antes de entregar pro Claude Code:** aparar silêncio nas pontas, normalizar o pico pra cerca de -1dBFS (dá margem pro ganho mestre que a engine já aplica), conferir que a duração real bate com o alvo-tabela do `docs/20` §6.3 (tolerância de uns 20%), ouvir em alto-falante de celular além de fone (`docs/20` §6.3 já pede isso).
- **O que isso muda no código, pra avisar quem for implementar:** hoje `engine.ts` só agenda `OscillatorNode`s (zero rede, zero asset). Trocar por sample real introduz carregamento/decodificação de `AudioBuffer` (`fetch` + `decodeAudioData`, com cache em memória) e precisa continuar satisfazendo o contrato do `docs/20` §6.4 inteiro — unlock por gesto, expiração de 300ms/500ms, cancelamento com fade, nunca dois sons simultâneos. Isso é trabalho de implementação, não deste documento; só sinalizando que não é drop-in trivial.

## 5.1 Primeiro lote sintetizado (21/09/2026)

Os 12 sons descritos em §4 foram sintetizados diretamente por script Python (osciladores harmônicos com decaimento por partial + camada de ruído filtrado pro toque de grafite/sopro de papel — a mesma ideia dos prompts de §4, só que gerada por código em vez de por uma ferramenta de IA de terceiros, que na prática deu resultado pior que compensar a diferença). Arquivos em `docs/audio-candidates/*.wav`, 44.1kHz/16-bit/mono, já normalizados a -1dBFS, com nomes = chave do `SoundEvent`. **Ainda são candidatos**, não assets aprovados — seguem as mesmas perguntas do §6 antes de virar produção. Os prompts de §4 continuam valendo caso alguém prefira gerar com outra ferramenta de IA depois, ou pra pedir variações.

## 6. Isto ainda não é uma decisão — próximos passos

Gerar os 12 assets com os prompts acima não fecha a mudança sozinho. O `docs/20` §6.4 já previa esse momento ("considerar assets somente após escuta e decisão documentada") e definiu um piloto formal (8 participantes, 50 respostas) que **não rodou ainda** (`docs/22`, linha 38). Antes de trocar a engine inteira:

1. Gerar os 12 sons, ouvir a família inteira em sequência (não som a som) — confere se realmente soam como uma família e não como 12 efeitos soltos.
2. Um teste informal já ajuda: 3-5 pessoas, cego, "dá pra distinguir acerto de erro sem ver a tela?" e "depois de ouvir os 12, você reconhece um 13º som como sendo 'da mesma família'?" — não precisa ser o piloto formal de 8 participantes do `20` §6.4 pra já filtrar problema óbvio, mas o piloto formal continua sendo o gate real antes de produção.
3. Só depois de aprovado, registrar a decisão com data — como uma nova seção (`6.5`) no `docs/20`, ou como emenda formal à decisão **D3** do `docs/18` §10.2 — antes de pedir pro Claude Code trocar a engine de verdade.
