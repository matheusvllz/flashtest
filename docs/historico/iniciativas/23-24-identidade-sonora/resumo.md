---
estado: arquivado
atualizado: 2026-09-29
iniciativa: [23, 24]
---
# 23–24 — Identidade sonora v2: resumo de encerramento

## O que mudou

- O `23` (21/09/2026) propôs a linguagem musical do Foca: um acorde só (tríade de Ré maior, motivo Ré5 → Lá5 → Fá#5 do `20` §6.3), camada física de "grafite e papel", regras de timbre e 12 eventos com prompt de geração cada.
- Os 12 candidatos foram sintetizados por script Python (`23` §5.1), primeiro em `docs/design/audio/candidatos/`, depois no conjunto aprovado de `docs/design/audio/v2/` (com `baseline-hashes.json` e relatórios).
- O `24` integrou os 12 WAVs aprovados sem alterar bytes em `public/sfx/v2/` (608.208 bytes no total).
- `src/lib/audio/identity.ts` mapeia evento → URL versionada; `src/lib/audio/engine.ts` troca osciladores por `fetch` + `decodeAudioData` com cache por evento, pré-carrega no primeiro gesto e toca `AudioBufferSourceNode`.
- Mute, aba oculta e `pagehide` cancelam com fade de 30 ms; expiração de 300/500 ms inclui carregamento e fila.
- Prioridade de fechamento: especial → nível → conquista → capítulo → meta → marco → streak diário → lição; corrigido o `indexOf = -1` que promovia streak diário.
- Cinco eventos ficaram preparados sem disparo: acerto-consecutivo, conquista, capítulo-desbloqueado, abertura-importante, recompensa-especial (`24`).

## Decisões relevantes

- Aprovação explícita do usuário em 21/09/2026: "gostei de todos, pode implementar no app" (`24`). Substitui a decisão D3 do `18` §10.2 (som só sintetizado).
- Nomes de arquivo = chave do `SoundEvent`, WAV 44,1 kHz/16 bits (`23` §5).
- Sem dependência nova e sem mudança de XP (`24`).
- Pelo `46` §C.5, esta decisão vira a ADR `docs/decisoes/0003-identidade-sonora-v2.md`.

## Evidência

- `24`: `bun test tests/unit` **137 passaram**; `bunx playwright test` **25 passaram** (Chromium); `bunx tsc --noEmit` e `bun run build` passaram; hashes dos 12 WAVs em `public/` e no build iguais aos aprovados; reprodução do QA com `py scripts/foca_sound/verify.py --integrated`.

## Limitações e o que não foi feito

- O piloto formal de escuta (8 participantes, `20` §6.4) e o teste informal cego de 3–5 pessoas do `23` §6 não aconteceram; a aprovação foi do proprietário.
- Nenhum teste em iOS/Android físico nem em deploy remoto (`24`).
- Os cinco eventos sem gatilho continuam sem uso no produto.

## Regras que continuam valendo

Extraídas no T-01.3: regras de som (unlock por gesto, expiração, cancelamento, um som por vez, raridade = riqueza) → `docs/design/gamificacao-e-som.md`; a escolha dos arquivos v2 → ADR `0003`. Os arquivos de áudio foram movidos no T-01.6 para `docs/design/audio/v2/` e `docs/design/audio/candidatos/`, com os caminhos atualizados em `tests/unit/audio.test.ts` e `scripts/foca_sound/`.

## Verificação de encerramento

- **(a) Registro × tarefas:** o `23` não tem lista de tarefas; os três passos do `23` §6 têm status: (1) gerar e ouvir em família — feito (`23` §5.1 e `audio-proposal-v2`); (2) teste informal cego — sem evidência, fica como pendência; (3) registrar a decisão com data — feito como `24` (não como §6.5 no `20`, que o `23` sugeria). O `24` é o próprio registro da integração. Cabeçalho do `23` segue "proposta, não decisão fechada"; está superado pelo `24`.
- **(b) Contratos no código:**
  1. `public/sfx/v2/`: 12 arquivos `.wav` com os nomes do `23` §5; `wc -c public/sfx/v2/*` → 608208 bytes, igual ao `24`.
  2. `src/lib/audio/identity.ts:2-7`: `export const SOUND_ASSETS = {` com `"resposta-correta": "/sfx/v2/resposta-correta.wav"` e os demais.
  3. `src/lib/audio/engine.ts:11` (`AudioBufferSourceNode`) e `:52` (`decodeAudioData`); `identity.ts:19`: `PRIORIDADE_FECHAMENTO`.
- **(c) Números de teste:** 137 unitários / 25 E2E, conforme o `24`.
- **(d) Pendências → backlog:** piloto de escuta (`20` §6.4) e teste cego (`23` §6); teste em aparelho físico (junto da Fase 1 do `31`, que nunca rodou — ver resumo 30–32); decidir se os 5 eventos sem gatilho ganham uso ou saem.

## Documentos originais

Nesta pasta, com o nome original (o ID do documento é permanente):

- [23-identidade-sonora-linguagem-musical.md](23-identidade-sonora-linguagem-musical.md)
- O `24` virou a decisão [../../../decisoes/0003-identidade-sonora-v2.md](../../../decisoes/0003-identidade-sonora-v2.md); os WAVs e auditorias estão em [../../../design/audio/v2/](../../../design/audio/v2/README.md).
