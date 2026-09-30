---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [mapa da documentação]
substitui: [00-README (índice antigo, em historico/00-README-2026-09.md)]
substituido-por: null
---

# Foca — mapa da documentação

**Para retomar o trabalho, leia [ESTADO.md](ESTADO.md).** Este arquivo diz onde está cada assunto e o que ler para cada tipo de tarefa. Regras duras para agentes: [../AGENTS.md](../AGENTS.md). Como trabalhamos (estados, retomada, checkpoints): [ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md).

O Foca é um app de preparação para o ENEM em aulas curtas, com um motor adaptativo que decide a próxima questão. O diferencial é constância e personalização, não mais conteúdo ([produto/estrategia.md](produto/estrategia.md) §0).

## Onde está cada assunto (uma fonte canônica por assunto)

| Assunto | Fonte canônica |
|---|---|
| Estado atual, próxima tarefa, bloqueios | [ESTADO.md](ESTADO.md) |
| O que é o produto, posicionamento, negócio | [produto/estrategia.md](produto/estrategia.md) · resumo para agentes: [PRODUCT.md](PRODUCT.md) |
| Persona (João) | [produto/persona-joao.md](produto/persona-joao.md) |
| Regras de produto em vigor | [produto/regras.md](produto/regras.md) |
| O que existe e em que estado (real, local, simulado…) | [produto/funcionalidades.md](produto/funcionalidades.md) |
| O que falta fazer | [produto/backlog.md](produto/backlog.md) |
| Checklist de lançamento | [produto/lancamento.md](produto/lancamento.md) |
| Arquitetura hoje | [arquitetura/visao-geral.md](arquitetura/visao-geral.md) |
| Contratos de código em vigor | [arquitetura/contratos.md](arquitetura/contratos.md) |
| Dados (estado local e servidor) | [arquitetura/dados.md](arquitetura/dados.md) (criado no 46 T-04.1) |
| Conteúdo pedagógico, pacotes, taxonomia | [arquitetura/conteudo.md](arquitetura/conteudo.md) · [arquitetura/taxonomia-habilidades.md](arquitetura/taxonomia-habilidades.md) |
| Design system | `src/styles.css` > [design/sistema-rabisco.md](design/sistema-rabisco.md) · resumo: [DESIGN.md](DESIGN.md) |
| Mascote (Foca) | [design/mascote.md](design/mascote.md) |
| Gamificação, som, háptico | [design/gamificacao-e-som.md](design/gamificacao-e-som.md) |
| Voz e texto (copy) | [COPY.md](COPY.md) e [copy/](copy/) · inventário: [copy/inventario.md](copy/inventario.md) |
| Segurança | [seguranca/README.md](seguranca/README.md) |
| Dados pessoais, retenção, menores | [seguranca/privacidade.md](seguranca/privacidade.md) (criado no 46 T-04.1) |
| Ambientes, deploy, variáveis | [operacao/ambientes-e-deploy.md](operacao/ambientes-e-deploy.md) (criado no 46 T-04.1) |
| Termos e privacidade (versões, pendências) | [legal/README.md](legal/README.md) (criado no 46 F11) |
| Por que decidimos X | [decisoes/](decisoes/README.md) |
| O que está aprovado para fazer agora | [specs/](specs/README.md) |
| Como chegamos aqui (planos e registros concluídos) | [historico/](historico/README.md) — mapa de IDs `NN` → caminho |
| Agentes e skills | [ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md) · [ai/SKILL-ROUTING.md](ai/SKILL-ROUTING.md) · [ai/SKILLS.md](ai/SKILLS.md) |

## Leitura mínima por tipo de tarefa

| Tarefa | Ler (nesta ordem, só a seção necessária) |
|---|---|
| Retomar / próxima tarefa | `ESTADO.md` → a tarefa na spec ativa → fim do registro |
| Decidir o que construir | `produto/estrategia.md` §0–§1 → `persona-joao.md` §0 → `regras.md` → `funcionalidades.md` |
| Mexer em jornada, nivelamento, lições, recompensa | `arquitetura/contratos.md` (seção) → código |
| Mexer em backend, conta, dados | `arquitetura/visao-geral.md` → `contratos.md` → `dados.md` → `seguranca/README.md` |
| Tela ou componente | `DESIGN.md` → `design/sistema-rabisco.md` (seção) → `design/mascote.md` se a Foca aparece |
| Texto que o aluno lê | `COPY.md` no nível do tamanho da tarefa → roteamento em `ai/SKILL-ROUTING.md` §2.1 |
| Conteúdo pedagógico | `copy/05-conteudo-pedagogico.md` → `arquitetura/conteudo.md` → `decisoes/0002` |
| Deploy, ambiente | `operacao/ambientes-e-deploy.md` → `decisoes/0001` |

## Convenções

- **IDs permanentes.** Todo documento numerado mantém o número para sempre, mesmo arquivado. Citações `docs/NN §x` no código continuam válidas; o caminho atual de cada ID está em [historico/README.md](historico/README.md).
- **Estados** (frontmatter `estado:`): `rascunho` · `aguardando-aprovacao` · `aprovado` · `em-execucao` · `bloqueado` · `concluido` · `substituido` · `arquivado` ([ai/SDD-WORKFLOW.md](ai/SDD-WORKFLOW.md) §3).
- **Toda decisão relevante é escrita aqui, com data** — não fica só no chat.
- **Verificação:** `bun run docs:check` confere links e caminhos em todo o repositório.
