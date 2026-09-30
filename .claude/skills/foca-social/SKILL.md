---
name: foca-social
description: Conteúdo orgânico e automação do Instagram do Foca — ideias de posts, carrosséis contínuos 4:5, posts estáticos, Reels (roteiro para gravar e edição dos vídeos gravados), motion design, revisão de post que "ficou genérico", histórico editorial, publicação e agendamento pela API oficial da Meta. Use quando o usuário pedir "ideias de posts para o Foca", "crie esses posts", "faça um carrossel sobre…", "ideias de Reels", "edite os vídeos desta pasta", "crie um motion", "publique este carrossel", "agende estes conteúdos". Não serve para o app nem para a landing page.
argument-hint: "[pedido em linguagem natural]"
---

# foca-social

Tudo desta skill vive em `automacao-instagram/` (isolada do app, dependências próprias).

**Primeiro passo, sempre:** leia `automacao-instagram/AGENTE.md` e siga-o. Ele define as três ações separadas (sugerir ideias → produzir → publicar/agendar), as skills de cada etapa, os comandos e o checklist de entrega.

Resumo dos comandos (rodar dentro de `automacao-instagram/`):

| Ação | Comando |
|---|---|
| Atualizar fontes da marca | `bun run marca:sync` |
| Consultar histórico | `bun run hist resumo` · `bun run hist ganchos` · `bun run hist listar [estado]` · `bun run hist ver <id>` |
| Registrar ideias (recusa repetição) | `bun run hist ideias <arquivo.json>` |
| Checar repetição de uma proposta | `bun run hist checar "<gancho>" "<argumento>" "<tema>"` |
| Renderizar post/carrossel | `bun run render <id>` |
| Validar | `bun run validar <id>` |
| Prévia para revisão | `bun run preview <id>` · galeria: `bun run preview --galeria` |
| Registrar no histórico | `bun run hist registrar <id> [estado]` |
| Motion | `bun run motion <cena> --previa` e depois `bun run motion <cena>` |
| Editar vídeo gravado | `bun run editar-video analisar|cortar-silencios|montar …` |
| Publicar | `bun run publicar <id>` (simulação) · `--real` (de verdade) |
| Agendar | `bun run agendar <id> "AAAA-MM-DD HH:MM"` · `listar` · `cancelar <id>` |
| Testes | `bun test testes` |

Pedido do usuário: $ARGUMENTS
