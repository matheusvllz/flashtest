# Auditoria de copy — 28/09/2026

> **Só leitura.** Nenhuma string foi alterada, nenhum status do inventário [`21`](../21-brand-voice-e-inventario-copy.md) mudou. Aplicar as propostas é trabalho de um plano de migração, depois do plano técnico `36` (Fase 10) e com aprovação do usuário. Origem: [38](../38-plano-sistema-copy-e-skills.md) §U. Guia usado: [COPY.md](../COPY.md).

## Como foi feita

- **Base:** `76a7b70` com as alterações em andamento do `36` (`src/lib/copy.ts` já com 13 linhas novas). Números de linha podem deslocar.
- **Extração:** `copy.ts` e `voz.ts` lidos inteiros; para as telas, um extrator descartável (fora do repo) listou nós de texto JSX, atributos e literais com 2+ palavras. Ele **não pega tudo** (texto montado em template, literal de uma palavra, texto em `docs/brand/*.html`). Onde faltou, li o trecho em contexto. Cobertura é a das 12 áreas do plano; as demais telas do `21` §3 ficam na seção 4.
- **Critérios:** teste de voz ([02](02-voz-e-tom.md) §5), padrões por componente e glossário ([03](03-ux-writing.md)), matriz de tom, promessas de [01](01-estrategia.md) §6.
- **Skill:** `better-writing`, em modo revisão, aplicada por área (a skill já estava carregada na sessão; não houve chamada separada por área). `humanizer` não foi necessária: nenhuma string de 2+ frases ficou marcada só como "artificial".
- **Rótulos:** `excelente` · `manter` · `ajustar` · `reescrever` · `consolidar` · `remover`. **Marcadores:** `inconsistente` · `artificial` · `longa` · `confusa` · `infantil` · `cobrança` · `promessa-sem-lastro` · `termo-fora-do-glossário`.
- **Sev.** (severidade, para triagem): **A** = afirma o que o produto não faz ou contradiz a norma do `20` · **M** = piora clareza ou consistência · **B** = polimento.
- **Dono:** `livre` (nenhum arquivo do `36` envolvido), `DEP 36 T-xx` (**DEPENDÊNCIA DO PLANO PRINCIPAL**: reauditar depois), `D-n` (decisão do usuário), `L2` (prompt do tutor: revisão de segurança).
- "Proposta" é sugestão, não texto aprovado.

## 1. Áreas

### 1. Onboarding (`welcome`, `index`, `quiz`, `aha`, `COPY.onboarding`)

| ID | Local | Texto atual | Rótulo | Marcadores | Sev. | Regra violada | Proposta | Dono |
|---|---|---|---|---|---|---|---|---|
| A1-01 | `welcome.tsx:20`, `index.tsx` splash | "Foca 60 segundos." | reescrever | promessa-sem-lastro | A | [01](01-estrategia.md) §6 (duração), P5 | Tagline final da D-1 (RU-20 do `36` já usa "Estudo curto, todo dia.") | D-1, DEP 36 T-08.7 |
| A1-02 | `welcome.tsx:22` | "Passar não é sobre estudar mais. É estudar todo dia." | reescrever | artificial, promessa-sem-lastro | A | [02](02-voz-e-tom.md) §4 ("Não é X. É Y."); promete "passar" | "Uma atividade curta por dia, escolhida pra você." | D-1 |
| A1-03 | `welcome.tsx:25` | "A IA mapeia suas lacunas e monta o treino diário. Você só precisa aparecer 60 segundos." | reescrever | promessa-sem-lastro | A | Duração; "mapeia" (o mapa inicial é heurística) | "O Foca escolhe a próxima atividade e mostra por quê. Você só precisa de um intervalo." | D-1 |
| A1-04 | `welcome.tsx:31` | "Aulas de 60 segundos, não maratonas" | reescrever | promessa-sem-lastro, artificial, termo-fora-do-glossário | A | Duração; "não X, Y"; "aula" | "Lições de 4 a 8 questões" (fato do `25`) | D-1, D-4 |
| A1-05 | `welcome.tsx:32` | "Diagnóstico das suas 3 maiores lacunas" | ajustar | promessa-sem-lastro, termo-fora-do-glossário | A | O `/aha` usa heurística de perfil, não questão respondida | "Um ponto de partida a partir do seu perfil" | livre |
| A1-06 | `welcome.tsx:33` | "Uma IA que explica o seu erro, não o erro médio" | ajustar | artificial | B | [02](02-voz-e-tom.md) §4 ("não X, Y"). A afirmação é verdadeira com o contexto do tutor | "Uma IA que explica o seu erro, com base no que você respondeu" | livre |
| A1-07 | `welcome.tsx:46` | "Começar em 60 segundos" | reescrever | promessa-sem-lastro | A | Duração; CTA deve ser verbo + objeto | "Começar" | D-1 |
| A1-08 | `welcome.tsx:49` | "Já tenho uma conta" | manter | — | — | — | — | — |
| A1-09 | `quiz.tsx:128` | "Ver meu diagnóstico" | ajustar | termo-fora-do-glossário, promessa-sem-lastro | M | O quiz só coleta perfil; não há diagnóstico por questão (`gaps.ts`) | "Ver meu resultado" | DEP 36 T-09.* |
| A1-10 | `quiz.tsx:163` | "Como devemos te chamar?" | ajustar | inconsistente | B | Mistura "devemos" (nós) com o resto em "você" | "Qual é o seu nome?" | livre |
| A1-11 | `quiz.tsx:164` | "Sem e-mail, sem senha. Só o seu nome." | excelente | 12 |
| manter | 21 |
| ajustar | 40 |
| reescrever | 25 |
| consolidar | 6 |
| remover | 1 |
| sem rótulo (A12-02, remissão) | 1 |
| **Total** | **106** |

Severidade dos 72 itens que precisam de ação (ajustar, reescrever, consolidar, remover): **A** 20 · **M** 28 · **B** 24. Números conferidos por script sobre a própria tabela.

**Marcadores mais frequentes:** `promessa-sem-lastro` (27) · `termo-fora-do-glossário` (20) · `inconsistente` (17) · `cobrança` (11) · `artificial` (4) · `confusa` (4) · `infantil` (4).

## 3. Decisões e testes que a migração vai exigir

**Decisões tomadas em 28/09/2026** (detalhe em [COPY.md](../COPY.md)):

- **D-1 (usuário):** frase de posicionamento **mantida por enquanto**. As linhas A1-01 a A1-07 seguem como achado aberto, para o usuário reabrir com uma das opções de [01](01-estrategia.md) §5.4.
- **D-2 (IA, por delegação):** imperativo **informal**. Afeta A5-05 (agora sem achado), A7-07 (`voz.naosei`: "Olha como resolve"), A10-01 (`falhaResposta`: "Tenta de novo") e A11-01.
- **D-3 (IA):** "sequência" na interface (A4-14, A9-04).
- **D-4 (IA):** "aula" e "checkpoint" saem da interface: A1-04, A3-06, A4-05, A4-07, A4-12, A5-03, A6-06, A8-02, A11-08.
- **D-5 (IA):** o humor da foca na pedra continua.
- **P-1 (usuário):** telas `offline` e `premium` **marcadas como demonstração** (A11-03, A11-04, A11-09).
- **P-2 (usuário):** fim de aula com **duas famílias, ambas sem julgamento**; limiar de 70% mantido e slot `fimruim` renomeado (A8-03, A8-04).

**Nada disso foi aplicado no código.** É trabalho do plano de migração.

**Dependências do `36`** (reauditar depois): A1-01, A1-09, A1-15 a A1-18 (`T-09.*`, `T-08.7`); A2-02, A2-03, A3-01 (`T-06.1`); A4-01 a A4-03, A4-06 (`T-06.2`); A11-01, A11-05 (`T-05.*`); A12-01 (`T-08.7`). **A migração começa só depois da Fase 10 do `36`.**

**Achados que a `Sev. A` deixa em destaque**, em ordem de risco: (1) `offline.tsx` afirma sincronização que não existe (A11-03, A11-04); (2) `voz.vazio[1]` cobra ausência (A11-06); (3) "60 segundos" e "lacunas medidas" na tela de boas-vindas, no `/aha` e nas falas (A1-01 a A1-07, A1-20, A1-24, A8-01); (4) falas de acerto, erro, fim e marco que julgam ou diminuem (A7-03, A7-05, A8-03, A9-02); (5) `motivos.revisao-devida` com habilidade e prazo digitados (A4-02); (6) "dá pra mudar depois" no curso, antes de o perfil permitir (A1-16).

**Testes a acrescentar em `tests/unit/brand-voice.test.ts`** (só os nomes; o código é do plano de migração):
- nenhuma fala de `voz.ts` menciona ausência do aluno em `vazio`, `retorno`, `bomdia`;
- nenhuma fala de `voz.ts` julga o desempenho (`fimruim`, `acertou`, `errou`, `marco`);
- nenhuma string de `copy.ts`, `voz.ts` nem `brand.ts` contém "60 segundos" ou "60s";
- nenhuma string visível usa "jornada" ou "Recap";
- `COPY.trilha.questoes(1)` e `fechouLicoes(1)` no singular;
- nenhuma string de `copy.ts` com "cerca de N minutos";
- nenhum número digitado em `COPY.jornada.motivos` (exceto templates).

## 4. Fora desta passada

Telas do `21` §3 que **não** estão nas 12 áreas e não foram auditadas: `dashboard.tsx` (só rollback), `plan.tsx`, `topics.tsx`, `flashcards.tsx`, `redacao.index.tsx`, `profile.tsx`, `login.tsx`, `forgot.tsx`, `video.$id.tsx`, `debug.tsx`, `AppShell` (rótulos de nav: "Aprender", "Praticar", "Progresso", "Perfil" foram lidos e estão coerentes com o glossário), notificações locais (nenhuma encontrada), `aria-label`s espalhados, o texto de `docs/brand/*.html` linha a linha, e o **conteúdo pedagógico** (proibido para copy, ver [05](05-conteudo-pedagogico.md)). `ranking.tsx` foi lido só no aviso de demonstração; o mecanismo de "sobe de liga / cai de liga" e "Segure a liderança até domingo" fica para uma auditoria de gamificação contra `16` §9.
