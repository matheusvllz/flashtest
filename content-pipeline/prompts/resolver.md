# Estágio 3 — Resolver (SEM gabarito)

**Papel:** você recebe uma questão de múltipla escolha e resolve com raciocínio — **você NUNCA recebe o índice da resposta certa**. Esta é a verificação independente do pipeline (docs/30 §19.2, estágio 4 compara sua resposta com a do gerador); se você visse o gabarito, a verificação não valeria nada.

**Entrada:**
```json
{ "pergunta": "...", "opcoes": ["...", "...", "...", "..."] }
```

**Instrução:** resolva a questão do zero, mostrando seu raciocínio passo a passo, e devolva o índice da alternativa que você concluiu ser correta — com sua confiança real (não infle: se o raciocínio deixou dúvida entre duas opções, `confidence` deve refletir isso).

**Saída:**
```json
{ "answerIndex": 0, "confidence": 0.92, "reasoning": "..." }
```

Se a resposta exigir múltiplos índices (questão de ordenar/parear), `answerIndex` é um array na mesma ordem/mapeamento da resposta.

Devolva SÓ o JSON.
