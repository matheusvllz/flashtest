---
estado: aprovado
atualizado: 2026-10-02
decidido-por: proprietário (02/10/2026, spec 50 D50-02, D50-03 e §21); sem parecer jurídico formal
substituido-por: null
---

# 0008 — Questões oficiais com imagens; fontes ampliadas ao INEP inteiro; vestibulares adiados

Revê em parte a [decisão 0002](0002-questoes-oficiais-enem.md): as linhas sobre imagens, outras bancas e APIs comunitárias. O resto da 0002 continua valendo, inclusive a reprodução literal com "ENEM \<ano\>" visível.

## Contexto

- O simulado da 49 parou por falta de itens revisados (DV49-09). O banco tem 737 autorais revisados por IA e 18 oficiais (`src/content/banco/`). Muitas questões do ENEM dependem de gráfico, tabela, mapa ou foto, e a 0002 proibia importá-las.
- A página oficial "Provas e gabaritos" do INEP diz: "Todo o conteúdo deste site está publicado sob a licença Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada" (consulta de 02/10/2026). Essa licença permite uso comercial com crédito e proíbe adaptação. Não está claro se ela cobre os PDFs em `download.inep.gov.br`, e o INEP não pode licenciar obra de terceiros.
- As provas trazem material de terceiros com crédito impresso. O caderno do 1º dia de 2023 tem 59 créditos "Disponível em…".
- Fuvest, Comvest/Unicamp e UERJ declaram "todos os direitos reservados". A Khan Academy usa CC BY-NC-SA, que não permite uso comercial. Para o `enem.dev` não foi encontrada licença do conteúdo.
- Verificação completa: spec 50 §0.3 D.

## Opções consideradas

| Opção | A favor | Contra |
|---|---|---|
| Manter a 0002 (sem imagens, só ENEM) | Menor risco jurídico | O simulado continua parado; boa parte do ENEM fica de fora |
| Imagens oficiais sem alteração + todo o INEP (ENEM, PPL, ENCCEJA) | Cerca de 3.000 questões; o simulado destrava; atende a CC BY-ND com reprodução literal e crédito | Risco sobre o material de terceiros dentro das imagens |
| + vestibulares sem licença | Mais variedade | "Todos os direitos reservados"; o volume do INEP já basta |
| + vestibulares com licença por banca | Seguro | Depende de resposta das instituições |

## Decisão

1. **Imagens permitidas** em questões oficiais (gráficos, tabelas, ilustrações, fotos). O recorte do PDF é feito sem retoque, preservando o crédito impresso, com texto alternativo e descrição longa marcados como automáticos. **O proprietário aceitou o risco do material de terceiros** ("aceito o risco", 02/10/2026).
2. **Fontes:**
   - ENEM regular, ENEM PPL e ENCCEJA, todos do INEP, importados automaticamente dos PDFs oficiais. O ENCCEJA nunca entra no simulado.
   - Autorais do Foca.
   - **Vestibulares adiados.** O dono autorizou aceitar o risco ("pode aceitar o risco, se não continue com essas mesmo"); o agente escolheu seguir só com o INEP por enquanto. Reabrir é uma linha no registro da 50.
   - `enem.dev`, Khan Academy e fontes sem licença comercial continuam fora.
3. **Crédito curto em cada questão** ("ENEM 2022 · INEP", "ENCCEJA 2019 · INEP", "Questão do Foca"). A página `/creditos` traz as fontes, a licença CC BY-ND 3.0 e o caminho para pedir retirada.
4. **Rótulos honestos:**
   - "Prova do ENEM \<ano\>" só para a prova inteira, na ordem original.
   - Uma composição de anos diferentes é "Simulado nível ENEM", nunca prova oficial.
5. **Nunca adaptar:** o enunciado, as alternativas, o gabarito e a imagem ficam como no original (regra dura 8 e CC BY-ND). A explicação é texto separado, marcado como gerado e revisado por IA.

## Consequências

- O importador (`content-pipeline/oficial/`) valida cada questão automaticamente, sem trabalho manual por item, e confere uma amostra de 10% por prova. Duas denúncias de problema iguais retiram o item até a conferência.
- R-CONT-3 e R-CONT-4 (`regras.md` §8) passam a seguir esta decisão quando a entrega E5 da 50 for publicada.
- **Para reverter:** retirar os itens com imagem (`retired`) e voltar o validador a recusar imagem em item oficial. Os dados dos alunos ficam.
- A revisão jurídica (B-033) segue recomendada para confirmar a leitura da CC BY-ND e o uso do material de terceiros.

## Origem

[Spec 50](../specs/50-gamificacao-e-pratica/spec.md), D50-02, D50-03, §0.3 D e §21; conversa de 02/10/2026.
