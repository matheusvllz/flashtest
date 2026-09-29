# Copy do Foca — entrada e contexto rápido

> Para quem é: qualquer agente ou pessoa que vai escrever, mudar ou revisar **texto que o aluno lê** (botão, erro, fala da Foca, tutor, tela pública, marketing). Origem: [38-plano-sistema-copy-e-skills.md](38-plano-sistema-copy-e-skills.md). Registro: [39](39-registro-execucao-copy.md). Detalhe em [copy/](copy/).
>
> **Ordem de autoridade:** (1) pedido do usuário · (2) spec ou plano vigente que fixa um texto literal (ex.: `36` §F.4 RU-*) · (3) [`20` §7.1](20-plano-evolucao-aprendizagem.md), norma de voz de origem · (4) este guia · (5) inventário [`21`](21-brand-voice-e-inventario-copy.md) (string "revisada" só muda com o inventário) · (6) skills de escrita.

## Quick Context for AI Agents

Para uma mudança pequena, isto basta. Não leia mais que o necessário (seção "Quanto ler").

**Persona.** João, 16 a 19 anos, ensino médio ou pré-vestibular, estuda no celular em tempo picado. Não falta conteúdo: falta começar sem decidir e saber onde está fraco. A culpa o afasta, não o traz de volta. É hipótese sem entrevista, então nada de "os alunos dizem". → [copy/01](copy/01-estrategia.md) §1

**Voz.** Colega de estudo atento e direto. Cinco atributos: **direta**, **próxima**, **calma**, **honesta**, **leve**. O tom muda com o contexto; a voz não. → [copy/02](copy/02-voz-e-tom.md)

**Dez proibições.**
1. Cobrar ausência ou dizer "sentimos sua falta".
2. Julgar a pessoa ("você é ruim em X") ou ironizar o erro.
3. Prometer o que o produto não demonstra: aprovação, nota, retenção, número, preço, duração em minutos.
4. "Não é X. É Y." e motivação genérica ("cada passo conta", "continue assim").
5. Emoji em controle, erro, explicação ou alerta. Exclamação em série.
6. "Domina", "dominado", nota, porcentagem ou "nível N" como resultado de medição.
7. Humor em erro técnico, confirmação, explicação, frustração ou retorno.
8. Termo fora do glossário (abaixo). "Jornada" não vai para o aluno.
9. Número digitado no texto: número só vem do estado, por template com plural.
10. Skill de copy em conteúdo pedagógico.

**Tamanhos-alvo** (`20` §7.1): botão 1 a 4 palavras · feedback 2 a 7 · fala decorativa até 14 · explicação curta 25 a 55 · card de ensino 15 a 35 · primeira resposta do tutor até 4 frases.

**Glossário mínimo.** **trilha** (não "jornada") · **lição** (unidade autoral; "aula" sai da interface, D-4) · **atividade** (item do plano) · **capítulo**, **seção** · **revisão** · **checagem** (não "checkpoint", D-4) · **nivelamento** (ação opcional) · **faixa** (Base em construção, No caminho, Base firme; não "domínio") · **sequência** (dias seguidos; "streak" só em código, D-3) · **Foca** (personagem e tutor). Lista completa: [copy/03](copy/03-ux-writing.md) §3.

**Onde a string mora.** Funcional: `src/lib/copy.ts` + linha no inventário `21`. Fala da mascote: `src/lib/voz.ts`. Persona do tutor: `src/lib/tutor-prompt.ts` (mudar exige revisão L2). Título e descrição do site: `src/lib/brand.ts`. Nunca hardcoded na tela.

**Roteador de skills** (completo em [SKILL-ROUTING.md](ai/SKILL-ROUTING.md) §2.1). **Usar skill só quando ela traz algo que o guia não traz.**
- 1 rótulo, tooltip, aria-label → **nenhuma skill**; padrão em [copy/03](copy/03-ux-writing.md) §2.
- Erro, confirmação, estado vazio, tela ou fluxo novo, 2+ strings → `better-writing`; `humanizer` só em corpo de 2+ frases.
- Fala da Foca (`voz.ts`) ou tutor → nenhuma skill de escrita; [copy/04](copy/04-foca-ia.md). Prompt: L2.
- Landing, hero, loja, post → `ogilvy-copywriting` → `copywriting` → `copy-editing` (obrigatória) → `humanizer`.
- Posicionamento → `ogilvy-copywriting`; a frase atual foi mantida por decisão do usuário (D-1, 28/09/2026) e só muda com nova aprovação.
- **Conteúdo pedagógico → nenhuma skill de copy.** [copy/05](copy/05-conteudo-pedagogico.md).

## Quanto ler

| Tamanho da tarefa | Ler | Não ler |
|---|---|---|
| **Mudança mínima** (rótulo, tooltip, aria) | Este Quick Context + a linha do padrão em [copy/03](copy/03-ux-writing.md) §2 | O resto |
| **Erro, confirmação, estado vazio** | Quick Context → [copy/03](copy/03-ux-writing.md) §2 | `01`, `06` |
| **Tela ou fluxo novo** | Quick Context → [copy/01](copy/01-estrategia.md) §1–2 (persona, estados) → [02](copy/02-voz-e-tom.md) → [03](copy/03-ux-writing.md) → roteamento | `06` |
| **Landing, loja, marketing** | [copy/01](copy/01-estrategia.md) → [06](copy/06-marketing.md) → [02](copy/02-voz-e-tom.md) → `PRODUCT.md` (Evidence on Hand) → roteamento | `03` |
| **Foca IA ou fala da Foca** | [copy/01](copy/01-estrategia.md) §1 → [02](copy/02-voz-e-tom.md) → [04](copy/04-foca-ia.md) | `03`, `06` |
| **Conteúdo pedagógico** | [copy/05](copy/05-conteudo-pedagogico.md) | Todo o resto |

## Onde está cada resposta

| Pergunta | Onde |
|---|---|
| Para quem o Foca fala? Qual o problema? Qual a transformação? Como se diferencia? | [copy/01](copy/01-estrategia.md) §1, §4, §5 |
| Como deve falar? Como não deve? | [copy/02](copy/02-voz-e-tom.md) §1, §4 |
| Humor: quando usar, quando evitar? Emoji? Quanto texto? | [copy/02](copy/02-voz-e-tom.md) §2, §3 |
| Erros, CTAs, feedback, onboarding | [copy/03](copy/03-ux-writing.md) §2 · [02](copy/02-voz-e-tom.md) §2 |
| Marketing | [copy/06](copy/06-marketing.md) |
| A Foca IA | [copy/04](copy/04-foca-ia.md) |
| Qual skill usar? | Roteador acima → [SKILL-ROUTING.md](ai/SKILL-ROUTING.md) §2.1 |

## Índice de `docs/copy/`

| Arquivo | Conteúdo |
|---|---|
| [01-estrategia.md](copy/01-estrategia.md) | Persona, estados do aluno, JTBD, problema → mecanismo → resultado, posicionamento (3 opções, D-1), o que nunca prometer |
| [02-voz-e-tom.md](copy/02-voz-e-tom.md) | Cinco atributos com SIM/NÃO/limite, matriz de tom por contexto, regras de humor e emoji, padrões de texto artificial em pt-BR, teste de voz |
| [03-ux-writing.md](copy/03-ux-writing.md) | Prioridades, padrões por componente com chave real, revisão com `better-writing`, glossário de produto |
| [04-foca-ia.md](copy/04-foca-ia.md) | Três camadas (produto, falas, tutor), falas da mascote, personalidade do tutor, ajustes sugeridos ao prompt (não aplicados) |
| [05-conteudo-pedagogico.md](copy/05-conteudo-pedagogico.md) | O que nenhuma skill de copy pode alterar |
| [06-marketing.md](copy/06-marketing.md) | Superfícies, promessas permitidas e proibidas, pipeline, checklist |
| `copy/auditoria-AAAA-MM-DD.md` | Relatório da auditoria das strings atuais (só leitura) |

## Decisões (28/09/2026)

D-1, P-1 e P-2 foram do usuário. D-2 a D-5 o usuário delegou à IA, que decidiu; podem ser revistas a qualquer momento.

| ID | Decisão | Resultado | Onde |
|---|---|---|---|
| D-1 | Frase de posicionamento | **Mantida a atual por enquanto** (usuário). As 3 opções ficam como alternativa | [copy/01](copy/01-estrategia.md) §5.4 |
| D-2 | Imperativo no corpo | **Informal**: "Tenta", "Confere", "Olha". Botões no infinitivo | [copy/02](copy/02-voz-e-tom.md) §3.3 |
| D-3 | Palavra visível para streak | **"sequência"** na interface | [copy/03](copy/03-ux-writing.md) §3 |
| D-4 | "Aula" e "Checkpoint" na interface | **Saem**: "lição" e "checagem" ("Videoaula" fica) | [copy/03](copy/03-ux-writing.md) §3 |
| D-5 | Humor da foca na pedra | **Continua**, com as regras | [copy/04](copy/04-foca-ia.md) §3.3 |
| P-1 | Telas demonstrativas `offline` e `premium` | **Marcar como demonstração** (usuário) | [auditoria](copy/auditoria-2026-09-28.md) A11-03, A11-04, A11-09 |
| P-2 | Fim de aula (`fimbom`/`fimruim`, limiar de 70%) | **Duas famílias, ambas sem julgamento** (usuário) | [auditoria](copy/auditoria-2026-09-28.md) A8-03, A8-04 |

## Checklist antes de concluir qualquer tarefa de copy

1. Li o nível certo desta página para o tamanho da tarefa.
2. Passa no teste de voz ([copy/02](copy/02-voz-e-tom.md) §5).
3. Usa o termo do glossário.
4. Cabe no tamanho-alvo e em 320 px de largura.
5. Não promete o que o produto não demonstra.
6. Não toca conteúdo pedagógico.
7. Usei só as skills do roteamento, na ordem.
8. A string nova está em `copy.ts` (ou `voz.ts`) e no inventário `21`.

## Manutenção

Este guia é referência viva. Termo novo entra no glossário antes da string. Skill nova entra em [SKILLS.md](ai/SKILLS.md) e no roteamento antes de ser usada. Mudou o produto (mecanismo novo, promessa nova)? Atualize [copy/01](copy/01-estrategia.md) §4 com a evidência. **A auditoria e a migração das strings atuais são outro plano**, escrito depois do plano técnico `36` (Fase 10).
