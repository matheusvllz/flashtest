# Plano da Solução (Plan)

Status: ✅ **fechado na fase Flash Test (22/07) · linha restaurada (20/09/2026)** — a solução é o **Flash Test**: app mobile-first de preparação para o ENEM em **aulas de 60 segundos** (1–2 questões por vez, feedback imediato) com uma **IA que aprende a lacuna de cada aluno e decide a próxima questão**. Detalhamento do produto em `08-produto-e-estrategia.md`; especificação tela-a-tela em `10`; estado real do código em `11`/`12`. **Pitch é landing page de 3 min** (não slides) terminando em "ver demonstração" — ver `04`.

> **Nota de histórico (20/09/2026).** Em 23/07/2026 este arquivo foi reescrito para o **Abroad** (counselor humano + IA para estudar no exterior, persona Liz). O pivô foi **revertido**. A versão Abroad está preservada em `_arquivo-abroad/02-plano-solucao-abroad.md`.

## Proposta de valor

```
Para João — o estudante de ensino médio/pré-vestibular que tem conteúdo de sobra
   (YouTube, cursinho, apostila, MEC Enem de graça) e mesmo assim não estuda,
que sofre com não conseguir manter constância (começa na segunda, larga na quarta)
   e com não saber em que ele está fraco de verdade,
o Flash Test transforma o estudo numa aula de 60 segundos por dia — 1 a 2 questões,
   feedback na hora, e uma IA que escolhe a próxima questão a partir do que ele errou,
que cabe num intervalo de aula ou numa fila de ônibus, mostra a lacuna encolhendo
   e amarra cada questão à faculdade que ele quer,
diferente do MEC Enem e dos cursinhos (que entregam MAIS conteúdo, o recurso que ele
   já tem sobrando) e dos bancos de questões (que entregam volume, não direção),
porque o gargalo nunca foi conteúdo — é constância e personalização, e é exatamente
   aí que a IA entra: ela decide o que ele treina no minuto seguinte e explica o erro
   na hora, coisa que nenhuma biblioteca de videoaula faz.
```

**Frase de posicionamento:** *"Não é mais aula. É o hábito que te aprova. 60 segundos por dia."*

## Papel da IA (obrigatório detalhar — a banca vai perguntar)

> Regra da constituição: "IA no centro, não cosmética." Se a resposta a "o que a IA faz" for vaga, é sinal de que a solução ainda está rasa. Abaixo, respondido para o Flash Test.

- **O que a IA decide/gera:** (a) **qual é a próxima questão** — roteamento a partir do mapa de lacunas do aluno, não ordem fixa de apostila; (b) **a micro-explicação do erro**, gerada ao vivo e personalizada para o que aquele aluno especificamente errou; (c) as **respostas do balão do tutor** sobre o próprio progresso ("como estou em Matemática?"); (d) a **leitura de uma foto de questão** que o aluno manda (multimodal).
- **Que dado ela usa como entrada:** as respostas do quiz de calibração (5 perguntas, 3 delas de conteúdo real), o histórico de acertos/erros por matéria e tópico guardado no app, e a faculdade-alvo escolhida no primeiro acesso.
- **O que acontece se a IA errar:** errar aqui **não machuca ninguém** — no pior caso o aluno recebe uma explicação fraca ou uma questão fácil demais. Ainda assim, há plano B: se a chamada falhar ou estourar o tempo, o app cai numa explicação local pré-escrita (nunca tela quebrada). O número de desempenho é **regra**, não IA — a frase é que é gerada (ser honesto com a banca sobre isso).
- **Por que não dá pra fazer sem IA:** um roteamento fixo não distingue "errou por não saber a fórmula" de "errou por interpretação", e uma explicação pré-escrita por questão não cobre o que **aquele** aluno entendeu errado. Escalar tutoria 1-a-1 humana para milhões de alunos de ENEM é economicamente impossível — é exatamente o que a IA torna viável.

## Modelo de negócio

- Segmento pagador: B2C / B2B / B2G / híbrido — e por quê.
- Como monetiza: assinatura, comissão, licenciamento, freemium, contrato institucional etc.
- Quem são os concorrentes/alternativas diretas e indiretas hoje?
- Tamanho da dor em número (usar os dados de `01-especificacao-problema.md` como base, não inventar TAM/SAM/SOM sem lastro).

### Modelo financeiro (framework da aula de Finanças — ver `07-insumos-aulas.md`)

DRE simplificado a preencher (não apresentar só um número de receita solto):

```
Receita Bruta
(-) Deduções
= Receita Líquida
(-) CPV/CMV
= Lucro Bruto        → Margem Bruta
(-) Despesas Operacionais
= Lucro Operacional  → Margem Operacional
(+/-) Resultado Financeiro
= Lucro Antes do IR
(-) IR e CSLL
= Lucro Líquido      → Margem Líquida
```

3 cenários (preencher com números, não só qualitativo):

| Cenário | Premissa | Receita | Custos | Resultado |
|---|---|---|---|---|
| Otimista | +adesão, −custo | | | |
| Realista | premissas-base | | | |
| Pessimista | −adesão, +custo | | | |

- Payback: em quanto tempo o investimento inicial volta?
- VPL/TIR: se der pra estimar, mostra rigor — mas só incluir se o número tiver lastro (evitar decorar fórmula sem sentido de negócio).

## MVP da semana

Dado que só há até quinta à noite pra chegar em algo defensável sexta:

- O que dá pra **mostrar** (protótipo, mockup, fluxo, wireframe, demo de IA rodando de verdade)?
- O que fica **só no discurso** (roadmap, visão de longo prazo) — e isso precisa estar claramente separado do que já existe.
- Qual é o "wow" de 30 segundos que abre o pitch?

### Ferramentas sugeridas para construir (Vibe Coding — ver `07-insumos-aulas.md`)

- No-code + IA: Loveable.dev, V0.dev
- IDEs inteligentes: Replit + Ghostwriter, Cursor.ai
- Design com IA: Framer, Webflow, Bolt.new
- Fluxo: planejamento (requisito claro) → uma função por vez → salvar marcos → iterar testando com alguém de fora do time.
- Qualquer prompt usado pra gerar a demo deve seguir o método PACE (Personagem/Ação/Contexto/Expectativa) — é evidência de que a IA está sendo usada com intenção, não só "pedimos pro ChatGPT".

## Riscos e perguntas que a banca provavelmente vai fazer

- [ ] "Isso não é só um chatbot com casca nova?"
- [ ] "Como vocês validaram que essa dor é real, além do guia?"
- [ ] "Quem paga por isso e por que pagaria?"
- [ ] "Qual o risco de a IA errar aqui e machucar alguém (financeiro, emocional, de aprendizado)?"
- [ ] "O que vocês fariam com mais tempo/dinheiro que não conseguem mostrar hoje?"

## Registro de decisões

```
21/07 — produto definido: app de estudo para ENEM em aulas de 60s, persona João.
21/07 — posicionamento: NÃO competir em conteúdo. O app grátis do governo (MEC Enem) já
   cobre conteúdo + correção de redação. O diferencial é constância + personalização.
22/07 — persona nichada em UMA só (João) — disciplina de foco, não "estudante em geral".
22/07 — unidade de estudo: "sessão de N minutos" → "aula de 60s" (1-2 questões fixas),
   para a mecânica do app bater com a promessa do pitch.
22/07 — mascote: a foca foi CORTADA. A identidade é o raio/Flash Test, sem personagem.
22/07 — modelo de negócio: B2C low ticket / freemium — João não tem dinheiro, tem tempo.
   O free precisa ser bom o bastante pra competir com um app do governo que é grátis.
22/07 — IA real no protótipo via server function (chave no servidor, nunca no client).
22/07 (tarde) — provedor: OpenAI `gpt-5.4-mini` (a escolha anterior pela Claude API foi
   revertida por causa do crédito já comprado). Medido contra 4 modelos com o prompt real.
22/07 — redação entra como 2º pilar do produto (não extra): motor de lições + conteúdo
   portados do app do Vitor, reconstruídos no design system do Flash Test.
20/09/2026 — PIVÔ ABROAD REVERTIDO. A linha viva do projeto volta a ser o Flash Test.
   Os arquivos da fase Abroad ficam preservados em `_arquivo-abroad/` como registro.
```

## Pendências do modelo de negócio (abertas)

A DRE, os 3 cenários e o preço nunca foram fechados na fase Flash Test — a semana acabou antes. Continuam em aberto:

- [ ] Preencher a DRE simplificada acima com números com lastro (não TAM/SAM/SOM inventado).
- [ ] Definir o corte free vs. pago: o que exatamente o free entrega, dado que o MEC Enem é grátis e completo.
- [ ] Custo de IA por aluno/mês no uso real (hoje só se sabe o custo por chamada do `gpt-5.4-mini`).
- [ ] Custo de curadoria de conteúdo (as questões reais de vestibular) — foi o caminho crítico que nunca ganhou dono.
