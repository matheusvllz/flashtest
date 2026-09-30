---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [política de segurança, níveis de revisão]
substitui: [SDD-WORKFLOW §6 (níveis L1–L3, versão de 22/09/2026)]
substituido-por: null
---

# Segurança — política e níveis de revisão

> Segurança é critério de aceite, não etapa final. Nunca se declara "seguro": declara-se o que foi verificado, como e o que não pôde ser verificado. Modelo de ameaças: [modelo-de-ameacas.md](modelo-de-ameacas.md) (criado em 46 T-04.1). Dados pessoais, finalidades e retenção: [privacidade.md](privacidade.md) (46 T-04.1/T-11.1).

## 1. Regras duras (valem para toda tarefa)

1. **Segredos só no servidor.** Nunca em `VITE_*`, nunca no repositório, nunca em log. `.env` é ignorado pelo Git; `.env.example` só com nomes.
2. **Identidade vem da sessão, nunca do cliente.** Nenhuma função de servidor aceita id de usuário vindo do navegador.
3. **O cliente não é autoridade** sobre recompensas (XP, streak, conclusões), permissões, cotas ou aceite legal.
4. **Dado pessoal novo só com spec que o autorize** e com linha em `privacidade.md`. Público majoritariamente adolescente: minimização por padrão. Sem analytics externo sem spec própria.
5. **Nada de teste destrutivo ou de carga contra produção ou serviços de terceiros.**
6. **Dependência nova só com spec aprovada**; versão fixada; `bunfig.toml` mantém `minimumReleaseAge`.
7. **Git:** nunca reescrever histórico publicado; commit, push e deploy só com pedido do proprietário.

## 2. Níveis de revisão

| Nível | Quando | O que roda | Evidência |
|---|---|---|---|
| **L1** | Toda mudança de código | Checklist L1 (§3) | Uma linha no registro |
| **L2** | Autenticação, sessão, conta, dado pessoal, Foca IA (prompt, contexto, cota), upload, dependência nova, headers, deploy, variáveis de ambiente | L1 + checklist L2 (§4) + `agent-skills:security-and-hardening` quando disponível + `/security-review` (Claude) ou `review-agent` (Codex) sobre o diff | Achados classificados no registro |
| **L3** | Antes de abrir contas ao público, antes de vender, e periodicamente | `repo-security-review` completo (Claude; requer gitleaks, osv-scanner, semgrep) + `/security-review`; no Codex, as três ferramentas à mão + revisão manual | Relatório em [auditorias/](auditorias/) com data |

## 3. Checklist L1

- [ ] Nenhum segredo, token ou chave no diff; nenhum `VITE_` novo fora da lista permitida.
- [ ] Nenhum `dangerouslySetInnerHTML` com conteúdo de usuário ou da IA.
- [ ] Entrada do usuário com limite de tamanho antes de ir para prompt, banco ou log.
- [ ] Nenhum `console.log` com dado pessoal ou conteúdo de conversa.

## 4. Checklist L2

- [ ] Toda função de servidor nova começa por `requireSession()` (ou justifica por que é pública) e filtra por `userId` da sessão.
- [ ] Entrada validada com zod (tipos, tamanhos, enums); erro devolvido sem stack, SQL ou existência de recurso alheio.
- [ ] Mutação só por POST, com checagem de `Origin` (CSRF).
- [ ] Operação repetível (idempotência por id do cliente ou chave única) quando o cliente pode reenviar.
- [ ] Rate limit ou cota quando a operação custa dinheiro ou pode ser abusada.
- [ ] Teste com duas contas (A não lê nem altera B) para todo dado do aluno.
- [ ] Dado pessoal novo listado em `privacidade.md` (finalidade, base, retenção).
- [ ] Log sem e-mail, token, conteúdo de conversa ou foto.

## 5. Classificação de achados

| Classe | Significado | O que fazer |
|---|---|---|
| Vulnerabilidade confirmada | Reproduzida | Corrigir antes de concluir a tarefa (alta/crítica) ou registrar com prazo e dono |
| Suspeita | Não reproduzida | Investigar; registrar o que falta para confirmar |
| Risco aceito | Conhecido e mantido | Motivo e dono, aprovado pelo proprietário |
| Limitação de validação | Não deu para testar | O quê e por quê |

## 6. Onde ficam os relatórios

O relatório bruto do `repo-security-review` fica em `.security-review/` (ignorado pelo Git — pode conter achados sensíveis). O resumo que vale guardar vai para [auditorias/](auditorias/) como `AAAA-MM-DD-<escopo>.md`.
