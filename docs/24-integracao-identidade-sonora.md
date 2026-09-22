# 24 — Identidade sonora v2 integrada

21/09/2026. Aprovação explícita do usuário: “gostei de todos, pode implementar no app”. Substitui a síntese de osciladores da proposta 20/23 pelo conjunto Python aprovado em `audio-proposal-v2`. Os 12 WAVs foram copiados sem qualquer alteração de bytes para `public/sfx/v2/` (608.208 bytes ao todo).

`src/lib/audio/identity.ts` mapeia evento para URL versionada. `engine.ts` carrega/decodifica com cache por evento, pré-carrega no primeiro gesto e toca AudioBufferSourceNode. Ganho mestre 1 preserva os níveis aprovados. Erros de rede/decodificação/autoplay ficam silenciosos; carregamento pode tentar novamente num gesto posterior. Sem dependências novas, sem mudança nos arquivos aprovados e sem alteração em XP.

O componente raiz sincroniza a preferência de som antes de desbloquear em pointerdown/keydown e cancela áudio ao navegar. Mute, aba oculta e pagehide cancelam fontes com fade de 30 ms e invalidam pedidos assíncronos pendentes. Expiração de 300/500 ms inclui carregamento, decode, resume e espera em fila. Pré-carregamento não reproduz sons. Os toggles habilitam a engine antes de solicitar unlock.

Prioridades: especial → nível → conquista → capítulo → meta → marco → streak diário → lição. Corrigido o indexOf = −1 que promovia streak diário. Meta em study exige cruzar o alvo, e marco em study/LessonPlayer exige mudança de streak; conclusões posteriores no mesmo estado não repetem esses marcos.

Eventos já presentes nos players passam a usar os novos arquivos. Cinco chaves continuam preparadas sem disparo: acerto-consecutivo, conquista, capítulo-desbloqueado, abertura-importante e recompensa-especial. Aprovar sons não cria automaticamente conquistas ou eventos de domínio novos; a integração mantém essa distinção auditada. Todos os 12 arquivos estão disponíveis na engine.

Validação executada: `bun test tests/unit` — **137 passaram**; `bunx playwright test` — **25 passaram** em Chromium; `bunx tsc --noEmit` e `bun run build` passaram. ESLint dos arquivos tocados: zero erros, um aviso preexistente sobre replayKey no LessonPlayer. Testes cobrem reprodução real, cache, prioridade, mute, prazo incluindo fila, cancelamento de pedido pendente, carregamento tardio, navegação e falha de rede. Hashes dos 12 WAVs em public e no build dist são iguais aos aprovados. Não houve teste em aparelho iOS/Android físico nem deploy remoto.

Reprodução do QA de sinal e igualdade produção/aprovados: `py scripts/foca_sound/verify.py --integrated`. O baseline e o relatório da proposta continuam preservados; o verificador grava `production-quality-review.json` separadamente, pois mudanças no código após aprovação são esperadas.
