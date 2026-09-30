# Marketing: superfícies, promessas e energia

> Para quem é: quem escreve texto público do Foca (tela de boas-vindas, título e descrição do site, landing, loja de apps, redes, campanha). Entrada: [../COPY.md](../COPY.md). O que se pode prometer: [01-estrategia.md](01-estrategia.md) §4 e §6. Voz de base: [02-voz-e-tom.md](02-voz-e-tom.md).
>
> Estado conferido em 28/09/2026 (atualização de 29/09/2026: a landing pública é a rota `/` do app, **integrada** por pedido do proprietário, ver `docs/44` e `docs/45`; a história dela está em `docs/40`–`43`). **Não existe página de loja de apps, perfil de rede social nem campanha ativa** no repositório (o que há em `docs/design/brand/` é da marca anterior, Flash Test). O `36` T-08.7 (RU-20) troca a tagline e a descrição de `brand.ts`. **DEPENDÊNCIA DO PLANO PRINCIPAL.**

## 1. Marketing pode ser mais energético que a interface. Não pode prometer mais que o produto.

A interface é calma e direta. Marketing pode ter mais verbo, mais benefício e mais ritmo, com a mesma honestidade. O teste é o de sempre: o produto **demonstra** o que a frase afirma? Se não demonstra, a frase não sai.

**Energia permitida:** verbo de ação; benefício concreto; título que nomeia o público ("Para quem estuda no intervalo"); frase curta; uma linha de humor da Foca, com as regras de [04](04-foca-ia.md) §3.3.

**Energia proibida:** exclamação em série; emoji em título ou CTA; gíria forçada; tom de coach; "revolucionário", "incrível", "o melhor"; contagem regressiva falsa; comparação humilhante.

## 2. Superfícies

| Superfície | Onde está | Estado | Dono do texto |
|---|---|---|---|
| Tela de boas-vindas | `src/routes/welcome.tsx` | **Aposentada** (29/09/2026): redireciona para a landing em `/` (`44` §3) | — |
| Splash | `src/routes/app.tsx` (`/app`) | Só a Foca, sem texto (a porta do produto; `/` virou a landing) | — |
| Título e descrição do site, texto de compartilhamento | `src/lib/brand.ts`, `src/routes/__root.tsx` | Ativa; `BRAND.tagline`, `BRAND.description`, título `Foca — {tagline}` | **`36` T-08.7 (RU-20)** |
| Landing pública | rota `/`, `src/marketing/content/copy.ts` | v2 **integrada ao app** (29/09/2026, `44`/`45`); afirmações permitidas em `docs/40` §9.4 com as mudanças do `docs/42` §5 (CTA "Começar grátis" por decisão do usuário; sem "sem conta"; sem lista do que o Foca não faz) | `docs/42`, `docs/43` e este guia |
| Página `/premium` | `src/routes/premium.tsx` | Demonstrativa, sem plano real (regra de escopo do `CLAUDE.md`) | Não tratar como oferta |
| LP do link da bio | `docs/design/brand/Flash Test - LP Link da Bio v3.html` | **Histórico**, marca anterior | Só referência de estrutura |
| Copy da landing do Instagram | `docs/13` | **Histórico** (Flash Test), voz do João da época | Só referência |
| Loja de apps (App Store, Google Play) | — | Não existe | A criar; ver seção 6 |
| Instagram orgânico | `automacao-instagram/` (ferramenta independente, `/foca-social`) | Ferramenta pronta (29/09/2026); **nenhum post publicado**; 3 exemplos em `pronto` | Este guia; o agente segue `automacao-instagram/AGENTE.md` e o validador `ferramentas/validar/regras.json` |
| Campanha, outras redes | — | Não existem | A criar |

## 3. Promessas permitidas

Só as que a coluna "Resultado que a copy pode prometer" de [01](01-estrategia.md) §4 autoriza, e só no estado indicado lá:

- O próximo passo já vem escolhido, com o motivo à vista.
- Dá para fazer uma atividade no intervalo. Sem número de segundos ou minutos.
- Você vê onde a base está firme e onde ainda não.
- O que você estudou volta na hora de revisar.
- Errar mostra o que revisar.
- Parou uns dias? Continua de onde estava.
- Uma ordem para estudar, em vez de mais material.

Fato específico permitido: lições de **4 a 8 questões** (`25`).

## 4. Promessas proibidas

Ver a lista completa em [01](01-estrategia.md) §6. Resumo para conferir antes de publicar:

- Aprovação, vaga, nota prevista, "você vai passar".
- Ganho de desempenho ou velocidade em número ("estude X% mais rápido").
- Número de alunos, depoimento, "aprovado" (nada disso existe, e não pode ser inventado).
- Preço, plano pago, "grátis para sempre" (o modelo de negócio nunca foi fechado, `08` §11). **"Começar grátis" / "Comece grátis" é permitido** (decisão do usuário em 29/09/2026, `42` U-3): diz que começar não custa, sem prometer o que é gratuito para sempre.
- Duração em segundos ou minutos.
- "IA que aprende as suas lacunas" no sentido de descoberta por medição, enquanto o `/aha` for heurística.
- "O nivelamento muda a sua trilha", até o `36` T-03.
- Ranking real ou comparação com outros alunos (o ranking é mock).
- Retenção ou hábito garantido.

## 5. Achados na copy pública de hoje (só registrados, para a auditoria e a migração)

**Resolvido em 29/09/2026 (`44` §3):** as linhas de `welcome.tsx` e do splash de `index.tsx` saíram do ar junto com as telas (`/welcome` redireciona para a landing; o splash virou `/app`, sem texto). A tabela fica como registro histórico. Continua pendente o que é de `brand.ts` (RU-20, `36`).

| Onde | Texto | Problema |
|---|---|---|
| `welcome.tsx` | "Foca 60 segundos." · "Começar em 60 segundos" · "Você só precisa aparecer 60 segundos." · "Aulas de 60 segundos, não maratonas" | Duração não medida, repetida quatro vezes |
| `welcome.tsx` | "Passar não é sobre estudar mais. É estudar todo dia." | Padrão "Não é X. É Y." ([02](02-voz-e-tom.md) §4) e promessa implícita ("passar") |
| `welcome.tsx` | "A IA mapeia suas lacunas e monta o treino diário." | O mapeamento inicial é heurística de perfil; a montagem é real (planner) |
| `welcome.tsx` | "Diagnóstico das suas 3 maiores lacunas" | O `/aha` mostra 3 lacunas a partir do perfil declarado, não de questão respondida |
| `welcome.tsx` | "Uma IA que explica o seu erro, não o erro médio" | Verdade para o tutor com contexto (`32` Fase 7), mas usa "não X, Y" |
| `index.tsx` | "Foca 60 segundos." | Duração |
| `brand.ts` | "…Uma foca que aprende suas lacunas e te cobra todo dia." | Cobrança (`20` §7.1) e "aprende suas lacunas". **Já coberto pelo `36` RU-20** |
| `__root.tsx` | título `Foca — {tagline}` com travessão | Aceitável; o travessão é uso normal em título |

## 6. Pipeline de escrita

| Tarefa | Ler | Skills, em ordem | Fecha com |
|---|---|---|---|
| Posicionamento, proposta de valor | [01](01-estrategia.md) inteiro | `ogilvy-copywriting` → `copy-editing` (passadas "Prove It" e "Especificidade") | Aprovação do usuário (decisão D-1) |
| Landing, hero, descrição de loja, texto de OG | [01](01-estrategia.md), este arquivo, [02](02-voz-e-tom.md), `PRODUCT.md` → Evidence on Hand | `product-marketing` (contexto) → `ogilvy-copywriting` (estratégia) → `copywriting` (rascunho) → `copy-editing` (sete passadas) → `humanizer` | Teste de voz + checklist da seção 7 |
| Post, campanha | Idem, mais curto | `ogilvy-copywriting` (opcional) → `copywriting` → `copy-editing` | Checklist |
| Título e descrição do site | [01](01-estrategia.md) §5 | Nenhuma além de `copy-editing` | **`36` T-08.7 primeiro** |

Detalhes, níveis e o que **não** rodar: [SKILL-ROUTING.md](../ai/SKILL-ROUTING.md) §2.1. As skills do pacote Marketing podem ser lidas do cache sem ligar o pacote inteiro ([SKILLS.md](../ai/SKILLS.md) §K).

Lembretes de skill que valem sobre o que ela diz: a `ogilvy-copywriting` fala em depoimento e em texto longo; **no Foca não há depoimento a citar** e a UI não ganha texto longo. `analytics` e `ab-testing` do pacote Marketing não rodam sem spec (`20` §14 e §22).

## 7. Checklist antes de publicar

1. Cada afirmação tem lastro na tabela de [01](01-estrategia.md) §4, no estado indicado?
2. Sem número, depoimento, preço ou duração inventados?
3. Passa no teste de voz ([02](02-voz-e-tom.md) §5), sem "Não é X. É Y." e sem motivação genérica?
4. Não promete o que o `36` ainda corrige (nivelamento que muda a trilha, CTA "Continuar")?
5. O público está no título quando cabe ("Para quem estuda no intervalo")?
6. Foi revisado com `copy-editing` e, se tiver 2+ frases, com `humanizer`?
7. Público majoritariamente menor de idade: sem coleta de dados nem pixel sem spec.
