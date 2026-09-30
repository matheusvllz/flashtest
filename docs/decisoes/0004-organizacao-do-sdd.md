---
estado: aprovado
atualizado: 2026-09-29
decidido-por: proprietário (29/09/2026, D-01 do 46)
substituido-por: null
---

# 0004 — Nova organização do SDD: canônicos por assunto, iniciativas em pastas, histórico com resumo

## Contexto

Em 29/09/2026 o `docs/` tinha 46 documentos numerados soltos na raiz, sete blocos "plano vigente" sobrepostos no índice, cabeçalhos desatualizados (planos implementados marcados como "rascunho" ou "não implementado") e cerca de 63 regras em vigor espalhadas dentro de planos concluídos. O Codex só recebia um `AGENTS.md` de 641 bytes e não via nenhuma skill do projeto (46 §A.5, §A.6).

## Opções consideradas

| Opção | A favor | Contra |
|---|---|---|
| Manter `docs/NN-plano-*.md` na raiz | Nenhuma migração | Leitura obrigatória cresce a cada plano; regras vigentes presas em planos concluídos |
| Pastas por área + iniciativas em `specs/` + `historico/` (escolhida) | Uma fonte por assunto; plano concluído deixa de ser leitura obrigatória; retomada em ≤ 4 leituras | Migração de caminhos e links (feita com script e verificador) |
| Renumerar tudo | Nomes "limpos" | Quebraria ~290 citações `docs/NN §x` no código |

## Decisão

A árvore e as regras de 46 §C e §D: `AGENTS.md` como entrada única (o `CLAUDE.md` o importa); `docs/ESTADO.md` como painel de retomada; canônicos em `produto/`, `arquitetura/`, `design/`, `copy/`, `seguranca/`, `operacao/`, `legal/`; decisões em `decisoes/`; iniciativas ativas em `specs/NN-tema/`; concluídas em `historico/` com resumo. **O número de um documento é permanente**; o mapa ID → caminho fica em `docs/historico/README.md`. Os caminhos lidos por ferramentas (`docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/COPY.md`, `docs/copy/`) não mudam.

## Consequências

- Citações `docs/NN §x` no código continuam válidas pelo ID.
- Arquivos arquivados mantêm o nome original dentro da pasta da iniciativa (continuam encontráveis por nome).
- `bun run docs:check` verifica links e caminhos em todo o repo.

## Origem

46 §C, §D; decisão D-01.
