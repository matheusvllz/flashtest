# Pedidos de lote: por, red, lit, ing

Origem: revisão da Fase 7 (docs/36 T-07.3 e T-07.4), lotes `lote-por-red-lit-ing-01` a `-10`. Revisor: ia-delegada:sonnet (não é revisão humana). São pedidos de item novo (ação `substituir`), fora do escopo do plano; o pipeline de geração decide se e quando atender.

| Item de origem | Situação do item | Habilidade | Pedido |
|---|---|---|---|
| `gen:lit:caracteristicas-escolas-literarias:2821d052` | mantido (diagnóstico); falha de R6, não de R1 a R3 | `lit:caracteristicas-escolas-literarias` | Item diagnóstico que peça reconhecer a escola (por exemplo Romantismo ou Arcadismo) a partir de um trecho com natureza idealizada, no lugar de pedir o tipo de ambientação. |
| `gen:por:pontuacao-virgula-regras:199c1dc3` | retirado (`retired: true`); gabarito contestável | `por:pontuacao-virgula-regras` | Item sobre vírgula entre sujeito e verbo ou vírgula de conjunção conclusiva, com enunciado coerente e gabarito que uma gramática de referência sustente sem discussão. |
| `gen:red:competencias-avaliacao-enem:a5d3abda` | retirado (`retired: true`); enunciado ambíguo | `red:competencias-avaliacao-enem` | Item que peça associar um trecho claramente marcado (por exemplo, proposta de intervenção com agente, ação e meio) a uma competência, sem depender de leitura de um único fragmento ambíguo. |
