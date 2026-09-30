---
estado: aprovado
atualizado: 2026-09-29
decidido-por: proprietário (29/09/2026, D-07 e D-08 do 46); sujeito a revisão jurídica
substituido-por: null
---

# 0006 — Estudar exige conta; conta a partir de 17 anos; Foca IA aos 17 com consentimento do responsável

## Contexto

- Sem conta, não há como limitar abuso (proprietário, 29/09/2026).
- O ECA Digital (Lei 15.211/2025, em vigor desde 17/03/2026) exige, entre outras coisas, que contas de usuários "de até 16 anos" sejam vinculadas à conta de um responsável (art. 24); o alcance fora de redes sociais ainda não está claro nos guias da ANPD (consultas de 2026).
- O contrato de serviços da OpenAI (§3.3(c)) proíbe permitir que menores usem os serviços sem consentimento dos pais ou responsáveis.

## Opções consideradas

46 §H.3: A (conta 17+; IA 18+ direto e 17 com consentimento), B (13+ com painel de responsável — iniciativa própria), C (só 18+).

## Decisão

- **Não existe modo convidado.** O onboarding de perfil pode ser respondido antes do cadastro, mas estudar, nivelar e usar a Foca IA exige sessão.
- **Opção A.** Idade mínima para conta: 17 anos (`MIN_ACCOUNT_AGE`, configurável). Foca IA: 18+ direto; aos 17, só com consentimento do responsável registrado (`consent`).

## Consequências

- **Quem tem menos de 17 anos não usa o app.** A persona João vai de 16 a 19 anos (`docs/produto/persona-joao.md`), então parte dela fica de fora até uma decisão diferente (ex.: opção B como iniciativa própria).
- A idade mínima e o limite do consentimento são configuração, para que a revisão jurídica mude um valor e não a arquitetura.
- A idade é autodeclarada pelo ano de nascimento; a adequação dessa forma de verificação precisa de confirmação jurídica (46 §H.3).

## Origem

46 §0 (D-07, D-08), §H.3.
