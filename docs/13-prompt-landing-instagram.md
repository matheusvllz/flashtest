# 13 — Prompt para a Landing Page do Instagram

Status: 🟢 **copy fechada (22/07)** — essa página é diferente da LP do pitch (`04`). Aqui o público é duplo: avaliador do Link cotando familiaridade antes de sexta, e aluno do Pre College que a gente quer transformar em dado de pesquisa. Objetivo dela não é "ver demonstração", é deixar claro que o time tá levando isso a sério e coletar respostas reais pra pesquisa (gap ainda aberto em `02`/`08`, seção Pesquisa & Validação).

Como usar: cole o bloco do prompt abaixo no Claude, anexando junto o `Flash Test - design System.html`. A copy já está pronta, não deixe o Claude reescrever o texto, só montar o layout em cima dela.

---

## O prompt (copiar tudo daqui pra baixo)

```
Você vai montar uma landing page em HTML/CSS de página única, mobile-first, pra ser o link da bio do Instagram do Flash Test (produto do Pre College Link, problema "IA, educação e futuro do trabalho").

ANEXO: vou anexar o design system oficial da marca (Flash Test - design System.html). Use os componentes, cores e tipografia exatamente como estão lá. Se algo não estiver no anexo, usa este fallback:
- Navy (fundo/primária): #02104E
- Gold (ação/destaque): #FEB803, hover #B57F00, claro #FFD466
- Navy médio #17297A, navy escuro #141C44, periwinkle (texto sobre navy) #AEB8E8
- Slate (texto sobre claro) #3A4066, cinza neutro #8B91A8, off-white #F7F6F9
- Verde acerto #0AA35A e vermelho erro #C0392B ficam reservados só pra feedback de questão, não usar aqui
- Títulos em Space Grotesk (700/bold), texto corrido em Plus Jakarta Sans
- Logo: capelo branco com a borla virando raio dourado, sobre navy

OBJETIVO DA PÁGINA (dois públicos ao mesmo tempo, não escolha um só):
1. Avaliador do Link que vai ver o Instagram antes do pitch de sexta: precisa sair achando que esse time é sério, executa e tem marca coesa.
2. Aluno do Pre College que caiu na página pelo feed: precisa se identificar com a dor e preencher a pesquisa no final.

Não use a estética de "página de pitch pra banca". É uma página de Instagram: rápida de rolar, mobile, sem jargão de deck.

ESTRUTURA (nesta ordem, respeitando a copy abaixo palavra por palavra — só ajuste quebras de linha se precisar por espaço, não reescreva frases nem troque o tom):

--- SEÇÃO 1: HERO (fundo navy escuro, é a primeira dobra) ---
Kicker pequeno em gold: Pre College Link 2026
Headline grande (Space Grotesk, branco):
Todo mundo tem conteúdo de sobra. Quase ninguém tem constância.
Subheadline (periwinkle #AEB8E8):
O Flash Test transforma o estudo pro ENEM em 60 segundos por dia: uma pergunta, uma resposta, um hábito que gruda. Sem videoaula de uma hora, sem plano de estudo que ninguém segue depois da primeira semana.
Botão primário (gold, destaque máximo): Ajuda a gente a construir isso  [rola até a seção 5]
Link secundário discreto abaixo do botão: Ver o time por trás

--- SEÇÃO 2: O PROBLEMA (fundo claro F7F6F9) ---
Título (Space Grotesk, slate): O problema não é falta de conteúdo
Corpo (Plus Jakarta Sans):
Você já tem YouTube, cursinho, apostila, MEC Enem de graça e um feed inteiro de dica de estudo. O que falta não é material, é sentar todo dia e saber exatamente o que estudar naquele momento específico.
A gente ouviu isso de aluno de pré-vestibular de verdade: começa forte na segunda, sai da rotina na quarta, e na sexta já tá vendo outra coisa em vez de resolver questão. Não é falta de vontade. É que estudar virou uma tarefa grande demais pra caber num intervalo de aula ou numa fila de ônibus.
Card de destaque (número grande em gold, dentro de card claro):
9h13
é o tempo médio que a gente passa de olho na tela todo dia. O Flash Test quer 60 segundos disso de volta pro seu futuro.

--- SEÇÃO 3: A SOLUÇÃO (fundo navy médio #17297A, 4 cards) ---
Título (branco): Como o Flash Test resolve isso
Linha de apoio (periwinkle): Um app que aprende com cada erro seu e decide o que você treina no minuto seguinte.

Card 1 — Aula de 60 segundos
Uma questão, feedback na hora, ponto final. Cabe entre uma aula e outra.

Card 2 — Quiz que te calibra
No primeiro acesso a gente pergunta sua cidade e a faculdade que você quer. A partir daí cada questão é escolhida pra fechar as suas lacunas, não as de qualquer um.

Card 3 — Tutor de IA no bolso
Errou uma questão? Um tutor com IA explica onde você travou, na hora, do jeito que faz sentido pra você.

Card 4 — O Duolingo da redação
Ninguém treina redação em micro doses. A gente decompôs a redação do Enem em habilidades que dá pra praticar em 2 minutos: tese por tese, argumento por argumento.

--- SEÇÃO 4: BASTIDORES (fundo claro, prova de que é sério) ---
Título: Isso aqui não é slide
Corpo:
Esse projeto nasceu no Pre College Link, mas não vai parar quando o pitch acabar. Enquanto você lê isso, o time tá programando telas, testando IA de verdade e conversando com aluno real pra saber se a solução funciona fora do papel.
Se você é aluno do Pre College e chegou até aqui, faz parte da próxima etapa: responder algumas perguntas rápidas pra gente calibrar o produto com quem realmente vai usar.

--- SEÇÃO 5: CTA DE PESQUISA (fundo navy escuro, é o fechamento, id="pesquisa") ---
Título (branco): Ajuda a gente a acertar o produto
Corpo (periwinkle):
Leva menos de 3 minutos. Sem cadastro chato, sem spam depois. A gente só quer entender como você estuda hoje e o que faria você usar isso de verdade.
Botão gigante em gold: Responder a pesquisa   [link: {{LINK_DA_PESQUISA}}, deixar como placeholder editável]
Microcopy pequena abaixo do botão (periwinkle, menor): As respostas viram dado real pro nosso pitch e pro produto. Obrigado por fazer parte disso.

--- RODAPÉ ---
Logo (símbolo + wordmark Flash Test) centralizado
Linha pequena: Flash Test, feito por alunos do Pre College Link
Ícone/link de Instagram placeholder: {{HANDLE_INSTAGRAM}}

REQUISITOS TÉCNICOS:
- HTML + CSS num arquivo só, sem framework externo além de Google Fonts (Space Grotesk, Plus Jakarta Sans)
- Mobile-first de verdade: a maioria vai abrir isso no celular vindo do Instagram, teste a largura de 375px antes de qualquer coisa
- Transições de seção alternando navy escuro / claro / navy médio conforme marcado acima, do jeito que o `09-branding.md` pede pra reforçar a marca
- Botões gold precisam ter contraste alto e parecer clicáveis (sombra, leve elevação ou hover), são os únicos elementos gold da página fora do card de estatística, gold é herói e se usa com parcimônia
- Verde e vermelho da paleta não aparecem nessa página, são reservados pro feedback de questão dentro do app
- Página inteira precisa carregar rápido e rolar suave, sem popups nem formulário embutido (o botão da seção 5 só linka pra fora, pro link da pesquisa)
- Não inventar depoimento, número ou estatística que não esteja na copy acima
```

---

## Nota de sócio

Escrevi a copy pensando nos dois públicos ao mesmo tempo de propósito: se a página só falar com a banca fica "página de pitch", se só falar com aluno perde a chance de já plantar confiança antes de sexta. A seção 4 (bastidores) é a dobradiça entre os dois: mostra execução pro avaliador e serve de gancho natural pro CTA de pesquisa do aluno.

Falta você (ou a Duda) definir dois placeholders antes de publicar: `{{LINK_DA_PESQUISA}}` (o forms/typeform da pesquisa) e `{{HANDLE_INSTAGRAM}}`. Sem isso o botão principal da página não tem pra onde ir.

Se quiser, dá pra adicionar uma contagem regressiva até sexta (24/07) na seção 1 ou 4 pra reforçar urgência real, não coloquei porque não foi pedido, mas é fácil plugar depois.
