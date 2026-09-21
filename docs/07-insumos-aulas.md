# Insumos das Aulas — Ferramentas e Frameworks (Ship-ready)

Status: 🟢 vivo — atualizar conforme mais aulas/slides forem chegando na pasta.

Este arquivo não é resumo de aula por aula. É a tradução do conteúdo das aulas em **ferramentas que o grupo usa direto no projeto** — cada seção termina com "aplicação direta" apontando pra onde isso entra no resto do SDD.

## 1. Engenharia de prompt — Método PACE

Fonte: palestra "Faculdades Mentais, IA Preditiva vs. Generativa, Engenharia de Prompts" (13/01) + trilha Tecnologia.

- **P**ersonagem — diga quem você quer que a IA seja ("você é um especialista em...").
- **A**ção — diga o que ela deve fazer.
- **C**ontexto — descreva a situação em que ela está inserida.
- **E**xpectativa — diga o formato/resultado que você espera.

Técnicas complementares:
- **Zero Shot** — pedido direto, sem exemplo. Ok para tarefas simples.
- **One Shot** — 1 exemplo no prompt pra fixar formato.
- **Few Shot** — vários exemplos; necessário quando precisa de padronização em escala (ex.: classificar sentimento de centenas de respostas em minutos).

Frase-chave da aula: "fazer a pergunta certa é o que vai gerar diferença" — contexto específico reduz alucinação; feedback vago piora a resposta.

**Aplicação direta:** qualquer demo de IA construída para o pitch deve usar prompts estruturados com PACE, não prompts genéricos — é o que separa "IA no centro" de "IA cosmética" (regra 2 da `00-constituicao.md`). A seção "Papel da IA" de `02-plano-solucao.md` deve conseguir ser descrita nesses termos.

## 2. Vibe Coding — construir o MVP sem escrever código do zero

Fonte: trilha Tecnologia.

Ferramentas apresentadas:
- No-code + IA: **Loveable.dev**, **V0.dev**
- IDEs inteligentes: **Replit + Ghostwriter**, **Cursor.ai**
- Design com IA: **Framer**, **Webflow**, **Bolt.new**

Fluxo recomendado: planejamento (requisitos claros, linguagem simples) → desenvolvimento (uma função por vez) → versionamento (salvar marcos) → iteração (testar e ajustar continuamente).

Riscos a vigiar (citados na própria aula): segurança/exposição de dados, alucinação (código com erro sutil), qualidade/manutenção difícil ("gambiarra"). Não é problema admitir pra banca "prototipamos com Loveable/Bolt" — desde que a lógica de negócio e a dor estejam bem defendidas.

**Aplicação direta:** usar esse fluxo ainda esta semana pra decidir qual ferramenta constrói o "wow de 30 segundos" do MVP (seção "MVP da semana" de `02-plano-solucao.md`).

## 3. Finanças — framework de DRE, Balanço e cenários

Fonte: aula de Finanças (Rodrigo Teixeira Bento).

Esqueleto de DRE (usar como modelo financeiro do plano de negócio):

```
Receita Bruta
(-) Deduções (impostos sobre venda, devoluções, descontos)
= Receita Líquida
(-) CPV/CMV (custo do produto/serviço vendido)
= Lucro Bruto        → Margem Bruta = Lucro Bruto / Receita Líquida
(-) Despesas Operacionais (vendas/marketing, administrativas, outras)
= Lucro Operacional  → Margem Operacional = Lucro Operacional / Receita Líquida
(+) Receitas Financeiras / (-) Despesas Financeiras
= Lucro Antes do IR
(-) IR e CSLL
= Lucro Líquido      → Margem Líquida = Lucro Líquido / Receita Líquida
```

Balanço Patrimonial (fotografia, não filme): Ativo = Passivo + Patrimônio Líquido. Ativo = tudo que a empresa possui; Passivo = como financiou; PL = capital dos sócios.

Métricas para defender viabilidade a investidores/banca:
- **Payback** — em quanto tempo o investimento inicial volta.
- **VPL** (Valor Presente Líquido) — quanto o projeto vale hoje.
- **TIR** (Taxa Interna de Retorno) — rentabilidade percentual do investimento.

Cenários — montar 3, nunca um número solto:

| Cenário | Premissa | O que testa |
|---|---|---|
| Otimista | + adesão, − custo | teto de retorno (maior VPL/TIR) |
| Realista | premissas-base | ponto de partida |
| Pessimista | − adesão, + custo | resiliência — "o projeto ainda é viável nesse cenário?" |

**Aplicação direta:** a seção "Modelo de negócio" de `02-plano-solucao.md` deve ter essa estrutura preenchida (DRE simplificado + 3 cenários), não só "vamos cobrar assinatura de R$X". A aula reforça: a forma de apresentar o número importa tanto quanto o número ("custo de aquisição R$50" vs. "cada cliente custa R$50 e gera R$200 no primeiro mês").

## 4. People Skills — storytelling, DISC e comunicação do pitch

Fonte: aula de People Skills (Pedro).

Storytelling para pitch — **não é**: inventar/exagerar fatos, enrolar antes do ponto, contar história só pra parecer interessante, trocar dado por emoção, falar de vocês em vez do público. **É**: estruturar a mensagem com intenção, colocar o público/a persona como protagonista, usar tensão pra manter atenção, combinar dado com narrativa, fazer o outro sentir antes de pensar.

Perfis DISC (útil pra dividir papéis no pitch):
- **Dominante** — foco em resultado, decisão rápida → bom pra abertura/fechamento de impacto.
- **Influente** — comunicativo, persuasivo → bom pra criar conexão com a banca.
- **Estável** — cooperativo, constante → bom pra costurar as transições da narrativa.
- **Cauteloso** — analítico, preciso → bom pra seção de dados/modelo financeiro.

Sistema de comunicação (7 pontos onde uma mensagem pode falhar): emissor, mensagem, código, canal, receptor, ruído, feedback. Útil como checklist rápido se o pitch "não está passando" no ensaio.

**Aplicação direta:** `04-especificacao-pitch.md` deve usar a persona (não o time) como protagonista da abertura, e a divisão de falas do pitch pode seguir o perfil DISC de cada integrante.

## 5. Estrutura geral da semana — referência de cronograma (cohort 26.1, jan/2026)

Fonte: `2026-1_Planejamento_Pre_College_v4.0_-_Alunos.pdf`. **Atenção:** esse arquivo documenta a semana de uma turma anterior (12–16/01/2026) — não é o nosso cronograma. `03-tarefas-semana.md` continua sendo a fonte oficial dos horários da nossa semana (20–24/07/2026). Uso aqui é só como referência estrutural, confirma que:
- Rotação por trilhas fixas da escola (Creating New Venture, People Skills, Tech, Finanças, Marketing) independe do trabalho de projeto do grupo.
- Formato de pitch em salas paralelas seguido de reagrupamento e pitch final do "melhor de cada grupo", com mentorias internas e premiação no mesmo dia — mesma lógica da nossa semana (qualificatória + final), com pequenas diferenças de número de salas.

## Fontes desta atualização (21/07/2026)

- `01-13_Aula_Fundamentos_de_IA_Técnicas_de_Prompting_PACE_e_Aplicações_Práticas_Multimodais-Resumo_de_aula.pdf`
- `Pre College 2026 - Tecnologia.pdf`
- `Pre College - Finanças.pdf`
- `Pre College 26.2 - People Skills.pdf`
- `2026-1_Planejamento_Pre_College_v4.0_-_Alunos.pdf` (referência estrutural, turma diferente)
