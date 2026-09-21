# Foca — Rabisco na Margem

Direção cromática escolhida (14ª de vinte exploradas) para substituir a paleta Ártica documentada em `docs/09-branding.md`. Grafite de lápis, papel pautado e uma canetinha azul-elétrica de gel — a paleta de quem rabisca na margem do caderno em vez de copiar a matéria.

Os tokens correspondentes, prontos pra colar em `src/styles.css`, estão em `foca-rabisco-tokens.css` (mesmo arquivo entregue junto com este).

## Arquétipo e personalidade

**Bobo da Corte** com traços de **Criador/Rebelde** na comunicação. A Foca não segue o roteiro da aula — mas o toque de Criador está em transformar o tédio em alguma coisa (o rabisco), não em apenas reclamar dele. É irreverência com produto: a piada não é "a aula é chata", é "olha o que eu fiz enquanto todo mundo copiava".

## Posicionamento

Um app de preparação pro ENEM que se recusa a parecer conteúdo escolar. A metáfora visual inteira é literal: o **cinza-grafite** é o lápis, o **papel pautado** é o caderno, e o **azul-caneta** é o rabisco — a única cor da marca que se permite gritar, e só quando há uma ação ou uma conquista de verdade por trás dela.

## Persona

Fala com quem estuda sozinho, tarde da noite, sem vontade nenhuma — e precisa de algo que pareça mais parecido com o próprio caderno rabiscado do que com o material didático que ele está tentando evitar. A marca não finge que estudar é divertido; ela reconhece o tédio e propõe uma saída dentro da própria tarefa, não fora dela.

## Sensação que a paleta transmite

Tédio produtivo. A sensação de estar fazendo arte escondida dentro de uma aula chata — nem euforia de startup, nem seriedade de plataforma de curso. Um contentamento discreto, quase clandestino.

## Por que combina com a Foca

O grafite de lápis é a cor mais literal e direta de todas as vinte direções exploradas para o "cinza da logo" da Foca — é o mesmo material, só que puxado pro universo do papel escolar, em vez do cinza-azulado frio que o design system anterior (Ártica) documentava sem que a arte real do mascote correspondesse a ele.

## Relação com a logo/mascote

Direta: o grafite (`--color-abismo`) não é uma aproximação de cinza genérico, é a cor do material com que se desenha — o mesmo gesto do rabisco na margem. Nenhuma outra das vinte direções tem essa correspondência tão literal entre pigmento e objeto.

---

## Cor

| Papel | Variável CSS | Claro | Escuro |
|---|---|---|---|
| Grafite de Lápis (primária) | `--color-abismo` | `#3A3A3C` | `#F3F1EC` |
| Papel Pautado (secundária) | `--color-pelo` | `#D6D6D4` | `#55534E` |
| Azul Caneta (accent) | `--color-mar` / `--color-coral`* | `#2E6BFF` | `#5C8CFF` |
| Fundo de página | `--color-neve` | `#F6F5F1` | `#1C1B18` |
| Cards / superfícies | `--color-cards` | `#FFFFFF` | `#262523` |
| Texto principal | `--foreground` | `#26262A` | `#F3F1EC` |
| Texto secundário | `--color-nevoa` | `#737075` | `#A6A29A` |
| Bordas / divisores | `--color-gelo` | `#E1DFDA` | `#38352F` |
| Sucesso | `--color-success` | `#2E9E5B` | `#45B876` |
| Alerta | `--color-alert` | `#D9A017` | `#E8B23D` |
| Erro | `--color-error` | `#C23B3B` | `#D65B5B` |

\* No sistema anterior, Mar e Coral eram duas cores de marca distintas (progresso/seleção vs. CTA/recompensa). Nesta direção elas são a mesma cor — o azul-caneta é o único accent da marca, e cumpre as duas funções.

A cor primária **não domina fundos grandes** — ela é grafite, não tinta de parede. O fundo de página é papel, não branco puro nem preto puro. O accent (azul-caneta) é a única cor de marca que aparece com intenção de chamar atenção, e só em CTA, XP, streak, seleção e foco — nunca como decoração. Sucesso, alerta e erro só existem como feedback de resultado, nunca como cor de UI neutra, e o erro foi deliberadamente afastado em matiz do accent para que os dois nunca sejam confundidos num relance (um problema real que a paleta anterior da Foca tinha entre Coral e Erro).

### Limitações e cuidados

O azul-caneta como único accent pode competir visualmente com links ou estados de foco se o resto da interface usar azul pra outra coisa — deve ficar reservado exclusivamente pra CTA e XP. A estética "papel escolar" também tende a datar mais rápido do que direções mais neutras, e vale revisitar a cada ciclo de marca.

### O que a torna diferente

É a única das vinte direções exploradas com azul puro como accent — uma cor completamente ausente de todas as outras dezenove, o que a torna instantaneamente reconhecível ao lado das demais quando comparada lado a lado.

---

## Tipografia

Duas opções de par tipográfico, pensadas para o mesmo gesto: um lápis "arrumado" (estrutura, corpo de texto) e uma caneta que rabisca por cima (acento, dados, marginália). Nenhuma fonte de corpo de texto usa uma família manuscrita — legibilidade em textos longos de estudo vem antes de qualquer capricho estético.

### Opção A — "Grafite & Jakarta" (recomendada)

Mantém 100% de compatibilidade com o que já está implementado no app hoje.

- **Títulos/display:** Space Grotesk, 700 — já em uso no app; traços retos e técnicos, como se fossem feitos com régua e esquadro, em contraste proposital com o clima "rabiscado" do accent.
- **Corpo/UI:** Plus Jakarta Sans, 400–600 — já em uso no app; terminações arredondadas, alta legibilidade em textos longos de enunciado.
- **Dados/marginália técnica:** Space Mono, 700 — para XP, streak, contadores; a textura de máquina de escrever cita a ideia de "anotação na margem" sem recorrer a uma fonte manuscrita de verdade. É a única fonte nova a carregar — os tokens em `foca-rabisco-tokens.css` já declaram `--font-mono` pra ela.

### Opção B — "Caderno Vivo" (mais expressiva)

Rompe mais com o padrão visual atual — vale considerar se a marca quiser se afastar ainda mais da estética "produto de tecnologia" tradicional.

- **Títulos/display:** Archivo Expanded, 800 — mais gritante, clima de cartaz de sala de aula.
- **Corpo/UI:** Figtree, 400–600 — humanista, muito legível, neutra o bastante pra não competir com o azul-caneta.
- **Acento manuscrito (uso raríssimo):** Caveat, 600–700 — imita rabisco de caneta de verdade. Reservar para no máximo um ou dois elementos por tela: um balão de fala do mascote, uma "dica" na margem, um confete de acerto. Nunca em corpo de texto, botão ou qualquer lugar que precise ser lido rápido — é decoração de gesto, não informação.

---

## Arquivos desta entrega

- `foca-rabisco-tokens.css` — bloco `@theme inline` + `:root` + `.dark` prontos pra colar em `src/styles.css`, mantendo os nomes de variável já usados no projeto (nenhuma `@utility` precisa mudar de nome).
- `foca-rabisco-branding.md` — este arquivo, pra guardar em `docs/` como referência da direção escolhida.
