---
estado: em-execucao
atualizado: 2026-09-29
canonico-de: [estado atual, próxima tarefa]
---

# Estado do projeto — painel de retomada

> **Atualizar ao fim de cada tarefa** (checkpoint). Uma página só. Se este painel divergir de `git status`/`git log`, **pare e registre** a divergência antes de continuar ([ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md) §4).

## Iniciativa ativa

**46 — Do protótipo ao produto** (SDD reorganizado, backend real, autenticação, segurança, documentos legais). Aprovada em 29/09/2026 com as decisões do §0.
- Spec: [specs/46-producao/spec.md](specs/46-producao/spec.md)
- Registro: [specs/46-producao/registro.md](specs/46-producao/registro.md)
- Branch: `producao-46` (commits locais autorizados; **sem push** sem pedido do proprietário)

## Onde estamos

- **Fase:** F03 — Build e repositório sem Lovable e Netlify.
- **Concluído:** F00 (preparação), F01 (reorganização do SDD), F02 (instruções e skills para Claude e Codex) — evidência no [registro](specs/46-producao/registro.md).
- **Próxima tarefa:** T-03.1 (`vite.config.ts` sem o wrapper da Lovable), junto da correção do teste de CSS compilado (DV-01).

## Último checkpoint verde

- Commit: ver `git log -1` na branch `producao-46` (F01 + F02).
- `bun run docs:check` ✅ · `bunx tsc --noEmit` ✅ · `bun test tests/unit` 1243 pass / 2 fail preexistentes (DV-01) · `NITRO_PRESET=node-server bun run build` ✅ · `node scripts/validate-skills.mjs` ✅.

## Verificações manuais pedidas ao proprietário

1. **Codex:** abrir uma sessão nova do Codex na pasta do repo e perguntar "quais skills do projeto você enxerga e qual é a regra dura 7 do AGENTS.md?". Esperado: lista com `foca-sdd` e as demais de `.agents/skills`; resposta sobre a Foca IA só sob demanda. E: "você tem um agente spec-verifier?".
2. **Claude Code:** abrir uma sessão nova e pedir "resuma as regras duras do AGENTS.md". Esperado: as 11 regras (o `CLAUDE.md` as importa com `@AGENTS.md`).

## Bloqueios e o que depende do proprietário

| Item | Bloqueia | Dono |
|---|---|---|
| Domínio (compra mais tarde) | E-mail em produção (verificação, recuperação), URLs finais dos textos legais, tela de consentimento do Google publicada | Proprietário |
| Conta Neon + integração na Vercel | Banco em preview/produção (46 T-04.7) | Proprietário |
| Projeto no Google Cloud (OAuth) | Login com Google validado em ambiente integrado (46 T-05.7) | Proprietário |
| Chave da OpenAI | Foca IA real (sem ela, fallback local) (46 T-08.6) | Proprietário |
| E-mail de contato de privacidade e encarregado | Textos legais finais (46 §H.5) | Proprietário |
| Revisão jurídica | Publicar termos e política; confirmar a política de idade | Proprietário (contratação) |

## Decisões pendentes do proprietário

Nenhuma bloqueando a fase atual. Pendências antigas (ex.: item oficial `oficial:2023:273a7d48`, iPhone no silencioso) estão no [backlog](produto/backlog.md), seção "Decisões do proprietário".
