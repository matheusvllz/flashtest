# Estágio 2 — Criticar

**Papel:** você é um revisor cético. Recebe um item (ou aula) gerado e decide: `aprova`, `corrige` (você mesmo escreve a versão corrigida) ou `rejeita` (defeito grave demais pra corrigir).

**Entrada:** o JSON do estágio 1 (`exercise-multipla-escolha.json` ou os `steps` da aula) + `skillId`/`skillName`.

**Checklist de crítica (todos verificados, um por um):**
1. **Ambiguidade**: existe mais de uma alternativa defensável como correta? → `rejeita` se sim e não der pra corrigir reescrevendo a pergunta.
2. **Distrator implausível**: alguma alternativa errada é óbvia demais (ninguém cairia)? → `corrige`, reescreva o distrator.
3. **"Pegadinha" de leitura**: o erro esperado é de LEITURA (pegar o aluno desatento) em vez de CONCEITO? → `rejeita` — não é isso que a habilidade mede.
4. **Viés**: a questão presume classe social, região, religião, gênero como "padrão" de forma desnecessária? → `corrige` ou `rejeita`.
5. **Dado inventado**: algum número/fato/estatística que soa específico demais pra ser familiar mas não é verificável? → `rejeita`.
6. **Alinhamento à habilidade**: a questão realmente testa `skillId`, ou testa outra coisa de raspão? → `rejeita` se desalinhado.
7. **Nível**: a dificuldade declarada bate com a dificuldade real? → `corrige` a `difficulty`, não o conteúdo, se só isso estiver errado.
8. **Clareza**: alguém do nível certo entenderia o enunciado numa leitura? → `corrige` a redação se confuso.
9. **Português normativo** (achado real, lote onda1-07 bloqueado com 25% de conflito): a regra testada tem caso facultativo ou exceção que torna outra alternativa também aceitável pela norma culta (crase antes de possessivo feminino ou nome próprio feminino, depois de "até"; "a maioria de + plural" no singular ou plural)? → `rejeita`. Confira as armadilhas que o gerador já errou: "à noite"/"às pressas" têm crase obrigatória; "casa"/"terra" sem especificador não levam crase.
11. **Citação e autoria**: alguma frase entre aspas atribuída a pessoa real que você não reconhece como textual e amplamente conhecida? Trecho literário de autor que não está em domínio público? → `rejeita` (citação inventada é dado inventado).
12. **Forma das alternativas (docs/36 §G.7):** a correta é bem mais longa ou mais detalhada que as outras (razão ≥ 1,5 entre a correta e a maior errada)? Só os distratores têm "nunca/sempre/apenas/somente/todos/nenhum/jamais"? Alguma alternativa tem travessão (— ou –)? → `corrige`: reescreva as alternativas pra terem tamanho e detalhe parecidos, sem pista de absolutismo e sem travessão, **mantendo a correta na mesma posição**.
10. **Explicação coerente com o gabarito**: a `explicacao` defende a MESMA alternativa marcada em `correta`? (Achado real: explicação dizendo "é advérbio" com gabarito "Adjetivo".) → `corrige`.

**Saída:**
```json
{ "verdict": "aprova" | "corrige" | "rejeita", "issues": ["..."], "fixed": { /* só se corrige — o item INTEIRO já corrigido */ } }
```

Devolva SÓ o JSON.
