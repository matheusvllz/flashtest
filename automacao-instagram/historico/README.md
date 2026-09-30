# Histórico editorial

`banco.json` é o banco: um JSON único, proporcional ao tamanho do projeto (centenas de registros, um processo por vez). Não edite à mão — use `bun run hist …` (`ferramentas/historico/cli.ts`).

## Estados

```
ideia → em_producao → em_revisao → pronto → agendado → publicado
                                      ↘ falhou ↗        (arquivado: tira da comparação de repetição)
```

| Estado | Quem põe | Significa |
|---|---|---|
| `ideia` | `hist ideias` | Proposta registrada, nada renderizado |
| `em_producao` | `hist estado` | Aprovada, sendo feita |
| `em_revisao` | `hist registrar` (padrão) | Renderizada e validada, esperando o usuário |
| `pronto` | usuário aprova → `hist registrar <id> pronto` | Pode ser publicada ou agendada |
| `agendado` | `bun run agendar` | Na fila; só sai se a tarefa do Windows rodar |
| `publicado` | publicador, com `mediaId` real | Nunca é republicado |
| `falhou` | publicador | A última tentativa deu erro; pode tentar de novo |
| `arquivado` | `hist estado` | Fora de uso; sai da checagem de repetição |

## Campos de cada registro

`id` (estável: `AAAAMMDD-formato-slug`) · `criadoEm` · `atualizadoEm` · `versao` (sobe só quando o `conteudo.json` muda) · `hashConteudo` · `estado` · `historicoEstados[]` · `formato` · `pilar` · `tema` · `gancho` · `argumento` · `publico` · `objetivo` · `conceitoVisual` · `cta` · `legenda` · `assets[]` · `referenciasMarca` (snapshot + hash do `styles.css` + hash do logo) · `revisita {de, diferenca}` · `arquivos {pasta, export[], preview}` · `publicacao {tentativas[], mediaId, permalink, idempotencia}` · `agendamento {quando, fuso, cancelado}` · `notas`.

## Repetição

`bun run hist checar "<gancho>" "<argumento>" "<tema>"` compara com **todo** o histórico (inclusive ideias não produzidas e conteúdo não publicado; só `arquivado` fica de fora). Pontuação 0–1: gancho 40 %, argumento 40 %, tema 20 %; cada campo mistura Jaccard de palavras (sem acento e sem palavras vazias) com trigramas de caracteres.

- **≥ 0,55** — repetição provável: `hist ideias` recusa, a menos que a ideia declare `revisita`.
- **0,35 a 0,55** — mesmo terreno: aceita, avisa; o ângulo novo precisa estar explícito.

É comparação lexical, não semântica: pega paráfrase curta e troca de palavra, **não** pega o mesmo argumento dito com vocabulário totalmente outro. Por isso o agente também lê `hist ganchos` antes de sugerir.

## Registros de publicação

`../logs/publicacoes.jsonl` guarda cada evento do publicador (simulado ou real), uma linha por evento, sem token.
