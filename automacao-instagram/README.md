# automacao-instagram — foca-social

Agente de conteúdo orgânico do Instagram do Foca: ideias, posts 4:5, carrosséis contínuos, Reels, motion, histórico editorial, publicação pela API oficial da Meta e agendamento. **Isolado do app e da landing**: dependências, scripts e arquivos próprios; só lê do resto do repositório.

```bash
cd automacao-instagram
bun install        # playwright-core + sharp (usa o Chromium que o Playwright já instalou na máquina)
bun test testes    # 20 testes: recorte, emendas, histórico, repetição, publicação simulada, agendador
```

Pré-requisitos na máquina: `bun`, `ffmpeg`/`ffprobe` no PATH, e um Chromium do Playwright (`npx playwright install chromium` se não houver).

## Como chamar

| Jeito | Quando | Exemplo |
|---|---|---|
| **Skill `/foca-social`** (sessão principal) | Conversa com escolha: ideias → você escolhe → produção | `/foca-social me dê 10 ideias de posts` |
| Em linguagem natural | A skill é carregada sozinha quando o pedido é sobre o Instagram do Foca | "Crie três posts inéditos para o Foca." |
| **Agente `foca-social`** | Produção delegada, sem conversa no meio | `@agent-foca-social produza as ideias 2, 5 e 8` |

Não precisa reiniciar o Claude Code: skills em `.claude/skills/` são detectadas na hora, e a pasta `.claude/agents/` já existia (a documentação oficial só pede reinício quando essa pasta é criada durante a sessão).

As instruções completas do agente estão em **[AGENTE.md](AGENTE.md)**.

### Pedidos de exemplo

- "Me dê 10 ideias de posts para o Foca." → ideias gravadas no histórico, lista numerada, nada renderizado.
- "Gostei das ideias 2, 5 e 8. Crie esses três posts." → produz, renderiza, olha, valida, registra. Não publica.
- "Faça um carrossel contínuo sobre dificuldade de manter uma rotina de estudos."
- "Esse post ficou genérico. Melhore o conceito e o design." → mesmo ID, versão anterior guardada em `versoes/`.
- "Me dê ideias de Reels para eu gravar." → roteiro falável, plano de gravação, textos na tela.
- "Edite os vídeos da pasta conteudos/<id>/brutos seguindo o roteiro aprovado."
- "Crie um motion de 12 segundos divulgando o Foca."
- "Publique o carrossel 20260929-carrossel-cronograma-fez-marco." → publica de verdade (se o Instagram estiver conectado).
- "Agende esses dois para quinta às 19h."

## O que roda onde (e o que não roda sozinho)

| Peça | Onde roda | Precisa de |
|---|---|---|
| **Agente / skill** | Dentro de uma sessão do Claude Code, quando você pede | Você na conversa. **Não fica trabalhando com o Claude Code fechado** |
| **Scripts de produção** (`render`, `validar`, `motion`, `editar-video`…) | Nesta máquina, quando alguém roda o comando | bun, ffmpeg, Chromium |
| **Publicador** (`publicar`) | Nesta máquina; fala com a API da Meta | `.env` com token + mídia em URL pública HTTPS |
| **Agendamento** (`agendar` + `fila`) | Agendador de Tarefas do Windows, a cada 15 min | Tarefa instalada, **computador ligado, logado e online**. Não gera conteúdo nem chama IA |

## Comandos

| Ação | Comando |
|---|---|
| Atualizar fontes da marca | `bun run marca:sync` |
| Histórico | `bun run hist resumo` · `listar [estado]` · `ver <id>` · `ganchos` |
| Checar repetição | `bun run hist checar "<gancho>" "<argumento>" "<tema>"` |
| Registrar ideias | `bun run hist ideias <arquivo.json>` |
| Registrar conteúdo produzido | `bun run hist registrar <id> [estado]` |
| Mudar estado | `bun run hist estado <id> <estado>` |
| Renderizar post/carrossel | `bun run render <id>` |
| Validar (feed e vídeo) | `bun run validar <id>` |
| Prévia | `bun run preview <id>` · `bun run preview --galeria` |
| Motion | `bun run motion <cena> --previa` · `bun run motion <cena>` |
| Editar vídeo gravado | `bun run editar-video analisar <video>` · `cortar-silencios <in> <out>` · `montar <roteiro.json>` |
| Publicar | `bun run publicar <id>` (simulação) · `bun run publicar <id> --real` |
| Conta e token | `bun run publicar --conta` · `bun run publicar --renovar-token` |
| Agendar | `bun run agendar <id> "AAAA-MM-DD HH:MM"` · `listar` · `cancelar <id>` |
| Rodar a fila | `bun run fila` · `bun run fila --simular` |

## Estrutura

```
AGENTE.md                     instruções persistentes do agente
marca/                        INDICE-REFERENCIAS.md (fontes reais e prioridade) + snapshot.json (gerado, com hashes)
estrategia/                   ESTRATEGIA-EDITORIAL.md, MODELO-ROTEIRO-REELS.md
historico/                    banco.json (ideias e conteúdos) + README.md (estados e esquema)
ferramentas/
  marca/                      sincronizar.ts
  historico/                  db.ts (banco + repetição), cli.ts
  render/                     base.ts, templates.ts (9 modelos), compor.ts, renderizar.ts, preview.ts
  validar/                    validar.ts, regras.json (promessas proibidas pelo guia de copy)
  video/                      motion.ts, editar.ts, cenas/*.ts
  instagram/                  api.ts (real + simulação), armazenamento.ts, publicar.ts
  agendador/                  agendar.ts, executar-fila.ts, instalar-tarefa.ps1
conteudos/<id>/               um conteúdo por pasta, ID estável
  conteudo.json               brief + copy + estrutura (a fonte de tudo)
  brief.md · meta.json        gerados por `hist registrar`
  legenda.txt                 legenda separada
  fonte/                      HTML editável (post) ou cena (motion)
  export/                     p01..pNN.png (arquivo) + .jpg (publicação) + panoramica.png + ordem.json · ou .mp4
  preview/                    index.html (revisão página a página em 390 px), contato.png, frames/
  validacao.json              relatório técnico e de copy
  versoes/vN/                 versões anteriores preservadas
previews/                     galeria de todos os conteúdos
testes/                       automacao.test.ts
logs/                         publicacoes.jsonl, fila.log
```

## Conectar o Instagram

Conferido na documentação oficial em 29/09/2026 ([publicação de conteúdo](https://developers.facebook.com/docs/instagram-platform/content-publishing), [primeiros passos](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started), [renovar token](https://developers.facebook.com/docs/instagram-platform/reference/refresh_access_token/)).

1. **Conta profissional** no Instagram (Empresa ou Criador de conteúdo).
2. Em [developers.facebook.com/apps](https://developers.facebook.com/apps), crie um app do tipo **Business** e adicione o produto **Instagram**.
3. Em **Instagram → API setup with Instagram business login**, clique **Generate token** ao lado da conta e autentique. O token do painel vale **60 dias**. Permissões usadas: `instagram_business_basic` e `instagram_business_content_publish`.
4. Copie `.env.example` para `.env` (gitignorado) e preencha `IG_ACCESS_TOKEN` e `IG_USERNAME` (o @, para conferência).
5. Rode `bun run publicar --conta`: ele mostra o `IG_USER_ID`. Copie para o `.env` e rode de novo (mostra o limite de 100 publicações em 24 h).
6. **Mídia em URL pública.** A API baixa cada imagem/vídeo por HTTPS; caminho de disco não funciona. Escolha em `config/config.json → midia.adaptador`:
   - `manual` (padrão): na 1ª tentativa o publicador cria `conteudos/<id>/urls.json`; você sobe os arquivos onde quiser e cola as URLs.
   - `pasta-publica`: uma pasta que **você já** serve publicamente (`MIDIA_PASTA_PUBLICA` + `MIDIA_BASE_URL`); o publicador copia os arquivos para lá.
   - `base-url`: os arquivos já estão em `MIDIA_BASE_URL/<id>/<arquivo>`.
   Todos conferem a URL (HTTP 200 + `image/jpeg` ou `video/mp4`) antes de mandar para a Meta. Nenhum serviço pago foi contratado nem configurado: escolher e pagar um host é decisão sua.
7. Teste com `bun run publicar <id>` (simulação) e depois `bun run publicar <id> --real`.
8. Antes de 60 dias: `bun run publicar --renovar-token` (grava o novo token no `.env`, sem exibir).

Se a conta não estiver com papel no app em modo de desenvolvimento, ou se a Meta exigir revisão do app para a permissão, a publicação falha com erro de permissão — o publicador mostra a mensagem da Meta e marca o conteúdo como `falhou`.

**Estado hoje: a publicação real nunca foi executada** (não há credenciais nesta máquina). O fluxo foi testado só em simulação e em testes automatizados com falhas injetadas.

## Agendamento

```bash
bun run agendar <id> "2026-10-02 19:00"      # America/Sao_Paulo; janela 08h–21h (config/config.json)
powershell -ExecutionPolicy Bypass -File ferramentas\agendador\instalar-tarefa.ps1            # instala a tarefa (1x)
powershell -ExecutionPolicy Bypass -File ferramentas\agendador\instalar-tarefa.ps1 -Remover   # remove
```

A tarefa roda `bun run fila` a cada 15 minutos enquanto você estiver logado. Ela publica só o que está `agendado` e já venceu, com o mesmo publicador da publicação manual; falha tenta de novo até 3 vezes com 15 min de intervalo; token expirado para a fila. Computador desligado ou suspenso = nada sai até ele voltar (a tarefa roda assim que possível, e o horário atrasa).

## Áudio

Música de terceiros não entra no MP4 sem licença registrada no `conteudo.json`. O motion de exemplo usa a identidade sonora do próprio Foca (`public/sfx/v2/`, aprovada em 21/09/2026). Música do acervo do Instagram é adicionada **no app**, publicando manualmente a versão muda.

## Limites conhecidos

- Detecção de repetição é lexical (palavras + trigramas), não semântica.
- Transcrição automática (`faster-whisper`) exige Python/WSL, ausente nesta máquina: legendas precisam de um `.srt`.
- A revisão visual é feita pelo agente olhando PNGs e quadros extraídos; ninguém **ouviu** o áudio nem viu o post dentro do app do Instagram.
- Publicação real, token e hospedagem de mídia dependem de configuração sua (acima).
