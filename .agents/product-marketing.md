# Product Marketing Context

**Document version:** v1
**Last updated:** 22/09/2026

> **Leia primeiro [docs/PRODUCT.md](../docs/PRODUCT.md).** Ele é o resumo canônico do produto (persona, propósito, posicionamento, voz, evidências e restrições) e prevalece sobre este arquivo. Aqui ficam **só** os campos que as skills de marketing (`coreyhaines31/marketingskills`) pedem e que o `PRODUCT.md` não cobre. Tudo tem fonte no SDD (`docs/NN-*.md`); o que não tem está marcado **TODO/UNKNOWN** e não pode ser preenchido por inferência. Não copie conteúdo do `PRODUCT.md` para cá: atualize lá.
>
> **Voz, promessas permitidas e proibidas, e pipeline de skills de marketing:** [docs/COPY.md](../docs/COPY.md) e [docs/copy/06-marketing.md](../docs/copy/06-marketing.md).
>
> Regras que nenhuma skill de marketing sobrepõe: sem depoimento, número de retenção, preço ou "aluno aprovado" inventados (`PRODUCT.md` → Evidence on Hand); sem analytics externo nem coleta de dados de menores sem spec autorizando (`docs/20` §14, §22); toda copy passa pela voz de `docs/20` §7.1 e pelo inventário de `docs/21`.

## Product Overview

**One-liner:** ver `docs/PRODUCT.md` → Positioning.
**Product category:** app de estudo para ENEM/vestibular, mobile-first.
**Product type:** B2C, app web mobile-first (protótipo; sem backend).
**Business model:** freemium / low ticket — o loop inteiro (aula + progresso) precisa estar no gratuito; o pago, se existir, é "mais IA por aluno", nunca "mais conteúdo" (`docs/08` §11; `docs/14` §9). **Preço: TODO/UNKNOWN** (`08` §11).

## Target Audience

**Decision-maker:** o próprio aluno (João, 16–19 anos) — ver `docs/PRODUCT.md` → Users. Pais e escola como compradores: **TODO/UNKNOWN**, nunca discutido no SDD.
**Primary use case / JTBD:** ver `docs/PRODUCT.md` → Users.

## Competitive Landscape

Fonte: `docs/08` §10.

**Direct:** MEC Enem (grátis, oficial, conteúdo completo + correção de redação) — resolve escassez de conteúdo, que não é a dor; não sabe o que o aluno errou ontem; não tem loop de hábito.
**Secondary:** cursinho / videoaula — pede uma hora e disciplina, os dois recursos que o João não tem. Banco de questões — entrega volume, não direção.
**Indirect:** ChatGPT direto — não tem currículo, não guarda estado, não decide o que estudar amanhã. Duolingo é **referência** de mecânica, não concorrente.

## Objections

Fonte: `docs/14` §7 (objeções internas do João — **hipóteses do time, não falas coletadas em entrevista**).

| Objeção | Resposta do produto |
|---|---|
| "Depois eu vejo, agora não dá tempo de fazer direito." | "Direito" passa a caber em 60 segundos. |
| "Nem sei por onde começar." | O app decide o próximo passo. |
| "Já tentei, não funcionou." | Recomeçar custa quase zero; o streak não pune. |
| "Tem gente muito mais adiantada que eu." | Ranking mostra a turma, nunca "você é o pior" (hoje é mock). |
| "Isso aqui é só mais um app." | **TODO/UNKNOWN** — a resposta histórica era o "aha" do diagnóstico inicial, mas o `/quiz` coleta perfil e não mede conhecimento (`docs/20`, precedência). Não prometer diagnóstico. |

**Anti-persona:** quem busca "mais conteúdo" ou uma biblioteca completa (`docs/08` §0).

## Customer Language

**TODO/UNKNOWN — nenhuma fala verbatim de aluno foi coletada** (`docs/08` §8). As frases de `docs/13` e `docs/14` §2 são copy escrita pelo time na voz imaginada do João, não citação. Não apresentá-las como depoimento.
**Words to use / avoid:** ver `docs/20` §7.1 e `docs/15` §8 ("O que a Foca nunca faz"). Evitar "dopamina" como justificativa (`docs/20`, precedência).

## Brand Voice

Ver `docs/PRODUCT.md` → Brand Commitments (a voz vigente é a do `docs/20` §7.1).

## Proof Points

**Metrics / Customers / Testimonials:** nenhum. **TODO/UNKNOWN** (`docs/08` §10; `docs/26` §8).

## Goals

**Business goal / conversion action / current metrics:** **TODO/UNKNOWN** — nenhum registrado em spec. A pergunta que o `08` §9 deixa aberta ("isto é artefato de pitch ou produto?") não foi respondida.

## Changelog

- v1 — 22/09/2026: criado junto com a infraestrutura de skills ([docs/ai/SKILLS.md](../docs/ai/SKILLS.md)), só com dados do SDD.
