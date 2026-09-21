# Plano da Solução (Plan)

Status: 🔴 **atualizado pós-pivô (23/07) · 🎯 afinado pelo counselor (23/07, tarde)** — solução redefinida em `08-produto-e-estrategia.md`: **um _counselor_ (orientador de admissão internacional) para cada aluno, potencializado por IA**, dentro de uma **plataforma que centraliza toda a jornada de estudar no exterior** para a persona **Liz** (`14-persona-liz.md`). A IA faz a **anamnese**, **pontua/ranqueia** o perfil (portfólio, documentação 0–10, prontidão de provas — TOEFL/SAT), aponta lacunas e monta o mapa; o **counselor humano** valida o diagnóstico, personaliza o caminho e acompanha — e, porque a IA fez o trabalho pesado, **um counselor atende ~30 alunos/dia**. Compõem a experiência: recomendação de universidades + comparação de custos/requisitos + orquestração das ~13 frentes + IA/co-piloto que diz o próximo passo, com itens críticos atrelados à fonte oficial datada. **Nome definido: Abroad (23/07)**; design system já entregue (`Abroad Design System.html`). **Pitch continua landing page de 3 min** (não slides) — ver `04`. Este arquivo mantém os templates de DRE/cenários/riscos; o conteúdo vivo da solução está no `08`.

> **Mudança-chave desta afinação (23/07, tarde):** a solução deixa de ser "a IA faz o papel do consultor que só a elite tinha" (IA **substitui** o humano) e passa a ser **"a IA amplia o counselor humano"** (IA **potencializa** o humano). É mais defensável (mata "isso é só ChatGPT?"), dá custo real pra DRE (custo do counselor ÷ alunos/dia) e cabe no que a marca já diz de si (`Abroad Design System.html`: "mentoria para estudar no exterior").

> Referências a **Flash Test / aulas de 60s / MEC / mapa de lacunas de ENEM** abaixo pertencem à fase anterior (arquivada). A solução viva é a plataforma de estudar fora.

## Proposta de valor

```
Para Liz — o jovem que quer estudar fora, tem os recursos, mas se afoga num processo opaco,
que sofre com não saber por onde começar (falta de mapa) e não conseguir segurar um
   projeto de 1-2 anos com ~13 frentes (falta de orquestração) — na raiz, porque a escola
   dela nunca ofereceu um counselor,
o Abroad dá um counselor (orientador de admissão internacional) para cada aluno,
   potencializado por IA, dentro de uma plataforma que centraliza toda a jornada
que faz a anamnese, pontua e ranqueia o perfil, aponta lacunas, recomenda universidades
   realistas e diz o próximo passo — da escolha da faculdade ao visto — com o counselor
   humano validando e segurando o processo até o fim,
diferente de consultorias de R$ 20-100 mil (inacessíveis) e da informação solta na
   internet (fragmentada, genérica e não confiável),
porque a IA amplia o counselor (faz o diagnóstico pesado pra um humano atender ~30 alunos/
   dia) e entrega, por uma fração do preço, o que só a elite tinha — com itens críticos
   (prazo/visto/requisito) sempre atrelados à fonte oficial datada, coisa que o ChatGPT
   genérico não faz.
```

## Papel da IA (obrigatório detalhar — a banca vai perguntar)

- O que a IA especificamente decide, prevê, gera, classifica ou detecta?
- Que dado ela usa como entrada?
- O que acontece se a IA errar (falso positivo/negativo)? Qual o plano B?
- Por que isso não poderia ser feito sem IA (ou seria pior/mais lento/mais caro)?

> Regra da constituição: "IA no centro, não cosmética." Se a resposta a "o que a IA faz" for vaga, é sinal de que a solução ainda está rasa.

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
23/07 — PIVÔ de dor/solução: de app de estudo ENEM (Flash Test) para plataforma de
   estudar fora (persona Liz). Solução redefinida no `08`.
23/07 — modelo de negócio invertido vs. fase João: agora PREMIUM (Liz paga por clareza),
   ancorado contra consultoria de R$ 20-100 mil, cobrando uma fração. Jornada longa
   (12-24 meses) favorece assinatura/LTV alto. Nicolas detalha DRE/cenários.
23/07 — risco #1 registrado: precisão de dado crítico (prazo/visto/requisito). Plano B da
   IA: fonte oficial datada + "confirme aqui" + humano no circuito nos itens de alto custo.
   (AFINADO 23/07 tarde: o "humano no circuito" é o COUNSELOR — a mitigação virou produto.)
23/07 (tarde) — AFINAÇÃO PELO COUNSELOR: a solução é um counselor humano POTENCIALIZADO por
   IA (não a IA substituindo o counselor). A IA faz anamnese + score/ranking + diagnóstico;
   o counselor valida e guia; 1 counselor atende ~30 alunos/dia. Muda a DRE: o custo de
   counselor vira driver central e a alavanca de IA (30/dia) é a tese econômica.
   AÇÃO Nicolas+Leonardo (juntos): levantar custo de um counselor, custo de plataforma/IA,
   montar DRE + 3 cenários, definir preço ancorado na consultoria. NÃO adotar "não importa
   o preço" no pitch — a banca vai perguntar; ter número defensável.
23/07 (tarde) — tiering proposto (best-of-both): camada FREE/entrada = counselor de IA puro
   (anamnese + score + primeiro mapa, escala infinita, custo baixo); camada PREMIUM = o
   counselor HUMANO (revisão, plano, acompanhamento), alto valor, throughput alavancado
   pela IA. Resolve a tensão margem-de-serviço vs. escala-de-software.
23/07 — pendência que muda o plano: confirmar objetivo (pitch de sexta vs. venture além do
   Pre College). Ver `08` Seção 9.
```
