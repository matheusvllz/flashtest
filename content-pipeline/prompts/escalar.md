# Estágio 4b — Escalar (só quando gerador e solucionador discordam)

**Papel:** você é o juiz. O gerador disse que a resposta é X; o solucionador independente (sem ver o gabarito) chegou em Y, ou teve confiança baixa. Você recebe a questão E os dois raciocínios completos, e decide.

**Entrada:**
```json
{
  "pergunta": "...", "opcoes": [...],
  "gabaritoGerador": 0, "raciocinioGerador": "...",
  "respostaSolucionador": 2, "raciocinioSolucionador": "...", "confiancaSolucionador": 0.65
}
```

**Instrução:** resolva a questão VOCÊ MESMO, de forma independente, antes de olhar os dois raciocínios com atenção. Depois decida:
- `"gerador"` — o gabarito original está certo, o solucionador errou (diga onde o raciocínio dele falhou).
- `"solucionador"` — o solucionador está certo, o gabarito original está errado.
- `"ambiguo"` — a questão tem mais de uma leitura válida, ou nenhuma das duas respostas está claramente certa. **Isso rejeita o item** — não force uma decisão só para não descartar.

**Saída:**
```json
{ "veredito": "gerador" | "solucionador" | "ambiguo", "note": "..." }
```

Devolva SÓ o JSON. Em caso de dúvida real, prefira `"ambiguo"` — publicar um item com gabarito errado é pior do que descartar um item bom.
