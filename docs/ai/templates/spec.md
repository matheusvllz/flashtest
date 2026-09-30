---
estado: rascunho          # rascunho | aguardando-aprovacao | aprovado | em-execucao | bloqueado | concluido | substituido | arquivado
atualizado: AAAA-MM-DD
iniciativa: NN
substitui: []             # documentos e assuntos sobre os quais esta spec prevalece
substituido-por: null
---

<!-- Modelo de spec. Copie para docs/specs/NN-tema/spec.md (NN = próximo número livre em docs/specs/README.md), apague as seções que não se aplicam e escreva "não se aplica — motivo" nas obrigatórias que não couberem. Uma spec só vira "aprovado" quando o proprietário diz; registre a data. Tarefas longas podem ir para tarefas.md (modelo ao lado); o registro de execução vai para registro.md. -->

# NN — <Título>

**Aprovação:** <data e escopo aprovado pelo proprietário, ou "aguardando">
**Prevalece sobre:** <documentos e assuntos específicos, ou "nada">

## Como a IA implementadora deve usar este documento

1. Ler `docs/ESTADO.md`, esta spec (a seção da tarefa) e o fim do `registro.md` desta pasta. Fluxo: [SDD-WORKFLOW.md](../SDD-WORKFLOW.md).
2. Executar as tarefas **na ordem numerada**. Cada tarefa deixa o projeto compilando (`bunx tsc --noEmit`) com `bun test tests/unit` verde e, se tocar UI, `bunx playwright test` verde.
3. Não tomar decisão de arquitetura por conta própria. Divergência entre spec e código → registrar no `registro.md` e seguir a intenção descrita.
4. Skills por tarefa: pela matriz de [SKILL-ROUTING.md](../SKILL-ROUTING.md); carregar só as indicadas.

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
<Fluxo, estados (vazio, carregando, erro, sucesso, retorno), copy (`docs/COPY.md`; strings novas em `src/lib/copy.ts` + `docs/copy/inventario.md`), onde a Foca aparece (`docs/design/mascote.md`), um CTA primário por tela (`18` §3). Referência visual: `docs/DESIGN.md`. Se houver movimento: intenção → quando → duração → easing → `prefers-reduced-motion`.>

## 7. Requisitos de performance
<Ex.: sem nova requisição no caminho da questão; animação ≤ 300ms em transição; sem aumento de bundle acima de X kB. Ou "não se aplica — motivo".>

## 8. Requisitos de acessibilidade
<Foco visível, alvo ≥ 44px, cor nunca é o único sinal, `aria-live` para feedback, reduced motion, 320px de largura. Ou "não se aplica — motivo".>

## 9. Analytics e dados
<O que se mede e onde. Lembrete: analytics externo e coleta adicional de dados de menores **não estão autorizados** sem decisão explícita aqui; dado pessoal novo exige linha em `docs/seguranca/privacidade.md`. Mudança de schema do store → migração e teste (`src/lib/state-migrations.ts`).>

## 10. Implicações de segurança
<Nível L1/L2/L3 ([../../seguranca/README.md](../../seguranca/README.md)). Toca IA/prompt, dados do aluno, upload, dependência nova, deploy? Como a entrada do usuário é limitada?>

## 11. Arquitetura proposta
<Arquivos novos (marcar **NOVO ARQUIVO**) e existentes, tipos, funções. Pseudocódigo é contrato de comportamento, não código pronto.>

## 12. Modelo de dados / migração
## 13. Compatibilidade e rollout
<Feature flag em `src/lib/features.ts`? Como desligar sem perder dado?>

## 14. Tarefas
### T-01.1 — <título>
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
- [ ] `bunx tsc --noEmit`, `bun test tests/unit`, `bunx playwright test`, `bun run build`, `bun run lint`, `bun run docs:check`
- [ ] `registro.md` escrito; `docs/ESTADO.md`, `docs/specs/README.md` e `docs/produto/backlog.md` atualizados
