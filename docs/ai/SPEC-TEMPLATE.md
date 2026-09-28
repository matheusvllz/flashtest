# Modelo de spec — `docs/NN-plano-<tema>.md`

> Derivado da estrutura dos planos que já funcionaram no Foca (`20`, `25`). Copie para `docs/NN-plano-<tema>.md` (NN = próximo número livre em `docs/00-README.md`), apague as seções que não se aplicam e **escreva "não se aplica — motivo"** nas obrigatórias que não couberem, em vez de deixá-las em branco. Uma spec só vira "aprovada" quando o usuário diz; registre a data no status.
>
> Não é para reescrever specs existentes neste formato.

---

# NN — <Título>: plano de implementação

**Status:** rascunho | aprovado em DD/MM/AAAA | implementado (ver `NN+1`)
**Prevalece sobre:** <documentos e assuntos específicos, ou "nada">

## Como a IA implementadora deve usar este documento

1. Ler este documento inteiro, depois `../CLAUDE.md`, `../AGENTS.md`, o registro de execução mais recente e [ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md).
2. Executar as tarefas **na ordem numerada**. Cada tarefa deixa o projeto compilando (`bunx tsc --noEmit`) com `bun test tests/unit` verde e, se tocar UI, `bunx playwright test` verde.
3. Não tomar decisão de arquitetura por conta própria. Divergência entre spec e código → registrar no registro de execução e seguir a intenção descrita.
4. Skills recomendadas por tarefa estão indicadas em cada `T-xx`; carregar só essas ([ai/SKILL-ROUTING.md](ai/SKILL-ROUTING.md)).

## 1. Contexto
<Por que agora. O que o código faz hoje (com arquivo:linha). Link para a spec anterior.>

## 2. Problema
<O que está errado, com evidência. Teste do João: isso resolve o João ou um estudante genérico? (`14` §0)>

## 3. Objetivos
## 4. Não objetivos
<O que parece parte disto e não é. Obrigatório.>

## 5. Requisitos funcionais
| ID | Requisito | Critério verificável |
|---|---|---|
| RF-1 | | |

## 6. Requisitos de UX
<Fluxo, estados (vazio, carregando, erro, sucesso, retorno), copy (voz de `20` §7.1; strings novas em `src/lib/copy.ts` + inventário `21`), onde a Foca aparece (`15` §4), um CTA primário por tela (`18` §3). Referência visual: `docs/DESIGN.md`. Se houver movimento: intenção → quando → duração → easing → `prefers-reduced-motion`.>

## 7. Requisitos de performance
<Ex.: sem nova requisição no caminho da questão; animação ≤ 300ms em transição; sem aumento de bundle acima de X kB. Ou "não se aplica — motivo".>

## 8. Requisitos de acessibilidade
<Foco visível, alvo ≥ 44px, cor nunca é o único sinal, `aria-live` para feedback, reduced motion, 320px de largura. Ou "não se aplica — motivo".>

## 9. Analytics e dados
<O que se mede e onde. Lembrete: analytics externo e coleta adicional de dados de menores **não estão autorizados** sem decisão explícita aqui (`20` §14, §22). Mudança de schema do store → migração e teste (`src/lib/state-migrations.ts`).>

## 10. Implicações de segurança
<Nível L1/L2/L3 ([ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md) §6). Toca IA/prompt, dados do aluno, upload, dependência nova, deploy? Como a entrada do usuário é limitada?>

## 11. Arquitetura proposta
<Arquivos novos (marcar **NOVO ARQUIVO**) e existentes, tipos, funções. Pseudocódigo é contrato de comportamento, não código pronto.>

## 12. Modelo de dados / migração
## 13. Compatibilidade e rollout
<Feature flag em `src/lib/features.ts`? Como desligar sem perder dado?>

## 14. Tarefas
### T-01 — <título>
- **Arquivos:**
- **Faz:**
- **Critério de aceite:**
- **Verificação:** <comando exato>
- **Skills:** <1–3, do roteamento>

## 15. Dependências entre tarefas
## 16. Critérios de aceite globais
| ID | Critério | Como verificar |
|---|---|---|
| G1 | | |

## 17. Testes
<Unitários, E2E (incluir projeto `narrow` 320×700 se tocar layout), manuais.>

## 18. Edge cases
## 19. Riscos
## 20. Checklist final
- [ ] Todos os `T-xx` com evidência
- [ ] Todos os `G*` com evidência
- [ ] `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`
- [ ] Registro de execução escrito; `docs/00-README.md` atualizado
