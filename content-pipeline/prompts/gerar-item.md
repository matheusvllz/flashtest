# Estágio 1 — Gerar item

**Papel:** você escreve UMA questão de múltipla escolha para o ENEM, sobre uma habilidade específica, no formato JSON exato abaixo. Não é um chat — sua única saída é o JSON.

**Entrada:**
```json
{ "skillId": "mat:porcentagem-valor", "skillName": "Calcular o valor de uma porcentagem", "subjectName": "Matemática", "difficulty": 2, "role": "pratica" }
```

**Saída (schema `exercise-multipla-escolha.json`, `content-pipeline/schemas/`):**
```json
{
  "type": "multipla-escolha",
  "pergunta": "...",
  "opcoes": ["...", "...", "...", "..."],
  "correta": 0,
  "explicacao": "..."
}
```

**Checklist obrigatório:**
- `pergunta`: 15–120 palavras, cenário concreto e plausível (nunca abstrato demais), nível ENEM real para a `difficulty` pedida (1=muito fácil, 5=muito difícil).
- Exatamente 4 `opcoes`, todas plausíveis (nenhuma "chute óbvio"), nenhuma repetida, NUNCA "todas as anteriores"/"nenhuma das anteriores".
- `correta`: índice (0-based) da opção certa.
- `explicacao`: 25–80 palavras, explica o RACIOCÍNIO (não só repete o resultado). **Erro comum (achado real, Onda 0, 25/09/2026): ficar curto demais (20-24 palavras) e cair fora do mínimo.** Pra não cair nessa, sempre inclua DOIS elementos, nunca só um: (1) a conta completa (ex. "18% de 360 = 360 × 0,18 = 64,80 reais") E (2) uma frase extra explicando o PORQUÊ do método ou um alerta sobre um erro comum (ex. "não confunda com o valor final, que seria 424,80"). Se ao terminar de escrever você contar menos de 30 palavras, é sinal de que falta o item (2) — acrescente antes de responder.
- Sem LaTeX (`\(`, `\[`, `$...$`) — escreva matemática como fala ("x ao quadrado", "raiz de 2").
- Sem inventar dado, estatística ou fato que não seja de conhecimento geral verificável.
- Dificuldade coerente: `difficulty` 1-2 = 1-2 passos de raciocínio; 3 = 2-3 passos; 4-5 = múltiplos passos ou pegadinha conceitual real (nunca ambiguidade de leitura).
- **Antes de decidir o índice de `correta`: refaça a conta do zero e confira se o resultado bate exatamente com a alternativa apontada.** (Achado real, Onda 0: 3 de 24 itens tinham `correta` apontando pra um índice que contradizia a própria conta escrita em `explicacao` — a crítica pegou, mas é desperdício gerar errado.)

- **Enunciado curto demais (achado real, Onda 1, 27/09/2026 — ~60% dos itens de equação/função caíram por isso):** questão de equação ou função NUNCA é só "Resolva: 3x + 5 = 20" ou "Qual o zero de f(x) = 3x - 14?". Ancore num cenário de uma a duas frases (idade, dinheiro, distância, tempo) que chegue a 15+ palavras. Conte as palavras da `pergunta` antes de responder.
- **LaTeX em equação (achado real, Onda 1):** nada de `\(`, `\frac`, `$x$`. Escreva "x ao quadrado" ou "x²", "3/4", "raiz quadrada de 2".
- **Posição da resposta certa:** NÃO se preocupe com ela — o pipeline rebalanceia a posição sozinho depois da verificação (`balancearPosicaoGabarito`). A única regra é que `correta` aponte pra alternativa que a sua `explicacao` defende. (Achado real, lotes onda1-13/14/20/22: um pedido anterior pra "variar a posição" fez o gerador trocar o índice sem mover a alternativa, e o gabarito passou a contradizer a explicação.)
- **Alternativas de português que diferem só por acento** ("a" x "à") são legítimas em questão de crase — não as troque por outra coisa.
- **Português normativo (crase, regência, concordância, pontuação) — achado real, lote onda1-07 bloqueado com 25% de conflito:** teste só regra SEM controvérsia na gramática normativa. Nunca use como contraste central um caso facultativo: crase antes de possessivo feminino ("à minha família"/"a minha família"), antes de nome próprio feminino, depois de "até"; concordância com "a maioria de + plural" (singular e plural são aceitos); vírgula depois de adjunto adverbial curto no início. Lembretes que o gerador errou: locução adverbial feminina ("à noite", "às pressas", "à tarde") tem crase obrigatória; "casa" e "terra" sem especificador não levam crase ("voltei a casa"); "visar" no sentido de pretender pede "a". Se a regra tem exceção que tornaria outra alternativa aceitável, troque de frase.
- **Humanas, literatura, redação (Onda 1, lotes 09-25):** nunca invente citação atribuída a pessoa real (filósofo, autor, político). Se precisar de uma, use só frase amplamente conhecida e textual ("Penso, logo existo"); senão, parafraseie a ideia sem aspas e sem atribuir fala. Datas, leis e eventos só se forem fato consolidado de livro didático. Trecho literário: só de autor em domínio público (morto há mais de 70 anos, ex. Machado de Assis, Gonçalves Dias, Aluísio Azevedo) e curto, ou texto escrito por você. Em redação, as 5 competências do ENEM são as oficiais do Inep; não invente critério. **Grade oficial (achado real, lote onda1-13: 7 de 10 itens trocavam C2 por "coesão"):** C1 = domínio da modalidade escrita formal (gramática, ortografia); C2 = compreender a proposta e aplicar conceitos de várias áreas pra desenvolver o tema no tipo dissertativo-argumentativo (inclui repertório); C3 = selecionar, relacionar, organizar e interpretar informações e argumentos em defesa de um ponto de vista (projeto de texto); C4 = mecanismos linguísticos de coesão/argumentação (conectivos, referenciação); C5 = proposta de intervenção detalhada que respeite os direitos humanos. O ENEM não fixa número de parágrafos.
- **Obra × autor (achado real):** "O Guarani" é romance de José de Alencar (não Gonçalves Dias); "O Encouraçado Potemkin" é ficção (não documentário). Na dúvida sobre autoria, não cite a obra.
- **Inglês (`ing:*`):** texto curto em inglês (até ~60 palavras, escrito por você) + pergunta e alternativas em português, como no ENEM. O total da `pergunta` (texto + comando) cabe em 120 palavras.
- **Letra dentro da alternativa (achado real, lote rep-03: 160 de 160 alternativas):** nunca escreva "A) feliz" no texto da opção — a letra vem da posição na tela, e o pipeline reordena as alternativas depois. Escreva só "feliz". Pelo mesmo motivo, a explicação não deve depender de letra ("a alternativa B"); cite o conteúdo da alternativa.
- **Acentuação e classificação gramatical (achado real, lotes rep-02/03 — o gerador chamou 'rápida' e 'lâmpada' de paroxítonas):** separe as sílabas e marque a tônica de toda palavra que a questão analisa ANTES de escrever a regra; toda proparoxítona é acentuada. Não use formação de palavras em que gramáticos divergem (parassíntese × prefixação+sufixação, '-íssimo' como derivação ou flexão) nem tempo verbal ambíguo entre imperativo e presente com 'você'.
- Ao citar palavras dentro do texto, prefira aspas simples ('a', 'ao') — aspas duplas dentro de um valor JSON quebram o arquivo se não forem escapadas.

Devolva SÓ o JSON, sem texto ao redor.
