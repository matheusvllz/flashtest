---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [índice de decisões]
substitui: []
substituido-por: null
---

# Decisões (ADR)

Uma decisão por arquivo: contexto, opções, escolha, consequências. Modelo: [../ai/templates/adr.md](../ai/templates/adr.md). Decisão técnica reversível e de baixo risco pode ser tomada por agente e registrada aqui; produto, marca, gasto, dado pessoal, fornecedor e texto legal são do proprietário.

| ID | Decisão | Estado | Data |
|---|---|---|---|
| [0001](0001-hospedagem-vercel.md) | Hospedagem na Vercel (plano Hobby por enquanto), um build, um deploy | aprovado | 23/09/2026 · 29/09/2026 |
| [0002](0002-questoes-oficiais-enem.md) | Reprodução de questões oficiais do ENEM com atribuição (antigo `34`) | aprovado; imagens e fontes revistas pela [0008](0008-questoes-com-imagem-e-fontes.md) | 23/09/2026 |
| [0003](0003-identidade-sonora-v2.md) | Identidade sonora v2: 12 WAVs aprovados em `public/sfx/v2/` (antigo `24`) | aprovado | 21/09/2026 |
| [0004](0004-organizacao-do-sdd.md) | Nova organização do SDD | aprovado | 29/09/2026 |
| [0005](0005-stack-de-backend.md) | Backend: Neon + Drizzle + Better Auth + Resend | aprovado | 29/09/2026 |
| [0006](0006-conta-obrigatoria-e-idade.md) | Estudar exige conta; conta 17+; Foca IA aos 17 com consentimento | aprovado (sujeito a revisão jurídica) | 29/09/2026 |
| [0007](0007-integracao-neon.md) | Neon só como Postgres; Better Auth próprio continua (sem Neon Auth, sem `neon.ts`); branches `production`/`dev` | aprovado | 30/09/2026 |
| [0008](0008-questoes-com-imagem-e-fontes.md) | Questões oficiais com imagens; INEP inteiro (ENEM, PPL, ENCCEJA); vestibulares adiados; revê parte da 0002 | aprovado (risco aceito pelo proprietário) | 02/10/2026 |

Decisões anteriores a 29/09/2026 que ainda não viraram ADR continuam registradas nos planos e registros de origem (mapa em [../historico/README.md](../historico/README.md)); as que seguem valendo foram extraídas para [../produto/regras.md](../produto/regras.md) e [../arquitetura/contratos.md](../arquitetura/contratos.md).
