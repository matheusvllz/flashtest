---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [40, 41, 42, 43]
---
# 40–43 — Landing page de marketing (v1 e v2): resumo de encerramento

## O que mudou

- v1 (`40`/`41`, 28–29/09/2026): landing isolada em `landing/` (Vite próprio, pré-render, CSP `default-src 'self'`, fontes locais, eventos só locais), fases F0–F17, com demo interativa usando um item literal do banco (`content/demo-item.json`), 7 retratos de telas reais, SEO com `noindex` por padrão e ilhas de hidratação.
- v2 (`42`/`43`, 29/09/2026): segunda direção criativa. Saíram "O que o Foca não faz" e "sem conta / sem e-mail / sem senha"; CTA "Começar grátis"; telas do app refeitas em HTML (`content/app-screens.ts`, testadas contra o app) no lugar de capturas; seções novas `Story` e `Errou`; uma cena presa com `position: sticky` nativo e scrub do GSAP.
- JS inicial da v2 caiu de 74,2 para 2,8 kB gz; LCP mobile de 2,27 s para 1,67 s (43 §7).
- Estado atual: a pasta `landing/` não existe mais; tudo foi incorporado em `src/marketing/` e virou a rota `/` pelo `44`/`45` (resumo 44–45).

## Decisões relevantes

- `40` §22: isolamento até pedido explícito do proprietário. **Revogado em 29/09/2026** (`44` I-1; `45`, cabeçalho).
- `42` §1: U-1 (sem seção de negativas), U-2 (a página representa o produto final; F-4 e F-15 deixam de ser usadas), U-3 ("Comece grátis"; resolve a D-LP-1; preço, plano e "grátis para sempre" continuam proibidos), U-4 (uma cena presa com sticky, muda o "sem pin" do `40` §13.1), U-5 (skills de movimento da pasta `edição Videos`).
- Orçamento do chunk de movimento aceito em 45,2 kB gz, acima do teto de 45 (43 §5).
- Onde o `40` e o `copy/01` divergem sobre promessa, o `copy/01` vence (`40`, cabeçalho).

## Evidência

- 41 §7 (v1 isolada): `bun test tests/unit` **75 passando**; `bunx playwright test` **187 passando, 43 puladas por desenho** (5 projetos); Lighthouse mobile 98/100/100, LCP 2,27 s; JS de entrada 74,2 kB gz; `spec-verifier` 20 cumpridos / 4 parciais antes das correções; G-1…G-24 com 23 cumpridos e 1 parcial (G-23).
- 43 §7 (v2 isolada): **86 unitários**, **202 E2E passando, 43 puladas, 0 falhando**; Lighthouse mobile 97/100/100, LCP 1,67 s, TBT 167 ms.
- Depois da integração, a performance mobile caiu para 81 (45 §8–§9); ver resumo 44–45.

## Limitações e o que não foi feito

- Sem celular físico, leitor de tela real nem Safari/WebKit real (41 §7; 43 §9).
- G-23 parcial: agente `web-performance-auditor` inexistente; `humanizer` e `impeccable` lidos do cache (41 §8).
- As 8 expressões ainda não existiam na época; resolvido no `44`.

## Regras que continuam valendo

Extraídas no T-01.3 (`46` §D.4, grupo Marketing): `40` §9.2/§9.4 e `42` U-1…U-5 (afirmações permitidas) → `docs/copy/06-marketing.md` e `docs/produto/regras.md`. O texto vivo está em `src/marketing/content/copy.ts`, com o F-x de cada bloco.

## Verificação de encerramento

- **(a) Registro × tarefas:** o `41` cobre F0–F17 (F9, a demo, está dentro da seção F7/F8) e um bloco pós-F17. O `43` segue a ordem de 15 passos do `42` §8 (§2–§7) e fecha os critérios em §8. Nenhuma fase sem status. Divergência documental: o `42` §9 diz que "os 37 itens do pedido" foram verificados "um a um no `43` §9", mas o `43` §8 tem 14 critérios e o §9 é de pendências.
- **(b) Contratos no código:**
  1. `landing/` ausente (`test -d landing` falso); `src/marketing/` presente com `Landing.tsx`, `content/`, `sections/`, `motion/`, `styles/`.
  2. `src/routes/index.tsx:2`: `import { Landing } from "@/marketing/Landing";` e `src/marketing/content/app-screens.ts` (telas refeitas), testado em `tests/unit/marketing/app-screens.test.ts`.
  3. `src/marketing/content/copy.ts:31`: `cta: "Começar grátis", // F-22`; `src/marketing/sections/Errou.tsx:7`: `const TEXTO_COM_FOTO = true;`.
- **(c) Números de teste:** v1 75 unitários / 187 E2E (41 §7); v2 86 unitários / 202 E2E (43 §7).
- **(d) Pendências → backlog:** domínio e `VITE_SITE_URL`; `OPENAI_API_KEY` no app ou `TEXTO_COM_FOTO = false`; teste em celular físico de gama média e leitor de tela; `LP_FALA_DE_PRECO` sem efeito (limpeza); termos de uso e política de privacidade no rodapé (DEP-5); medição de conversão (DEP-7); atrito de 9 passos do `/quiz` (41 §9); scripts de marketing com caminhos quebrados depois da integração (`46` §C.6).

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [40-plano-landing-page-marketing.md](40-plano-landing-page-marketing.md)
- [41-registro-execucao-landing-page.md](41-registro-execucao-landing-page.md)
- [42-plano-landing-v2-direcao-criativa.md](42-plano-landing-v2-direcao-criativa.md)
- [43-registro-execucao-landing-v2.md](43-registro-execucao-landing-v2.md)
