# Foca — proposta de Sound Design System v2

> **Atualização: conjunto aprovado pelo usuário e integrado em 21/09/2026.** O texto abaixo preserva a auditoria anterior à integração. Produção em `public/sfx/v2`; motor agora reproduz AudioBuffers. Ver [registro da implementação](../24-integracao-identidade-sonora.md). Para verificar a cópia aprovada após integração: `py scripts/foca_sound/verify.py --integrated`.

21/09/2026. **Candidatos para aprovação, sem integração.** Pedido atual prevalece sobre os prompts e o motivo repetido do documento 23. Não houve IA generativa de áudio, download de samples, instalação de bibliotecas ou alteração em src/public/áudios anteriores.

Abra [a sala de escuta](index.html). Cada player contém um candidato e uma comparação com o WAV anterior. Os volumes antigos foram preservados; portanto o A/B não é nivelado. Prévia em grupos: [respostas](01-respostas.wav), [progresso](02-progresso.wav), [descobertas](03-descobertas.wav).

## Auditoria do projeto

SDD é o conjunto em `docs/`, conforme `00-README.md`, não um arquivo chamado SDD. Foram consultados o índice, constituição, README/CLAUDE/AGENTS, especificação vigente 20 (especialmente contratos de feedback e áudio), registro 22, proposta 23, direção Rabisco na Margem, persona João e regras sonoras do 16. Documentos históricos não foram tratados como comportamento executado.

Repositório React/TanStack Start/Vite; código em src, assets visuais em src/assets e public/branding, scripts em scripts. Arquivos de áudio encontrados fora de dependências/build/cache: **12 WAVs em docs/audio-candidates**. Nenhum em public ou src/assets. Nenhuma referência desses WAVs em código executável. Não foi encontrado script de geração do primeiro lote em scripts; o documento 23 descreve sua geração, mas o gerador não está presente ali.

### Três camadas distintas

1. **Motor ativo:** `src/lib/audio/identity.ts` define 12 partituras; `engine.ts` usa OscillatorNode seno/triângulo, ataque linear de 8 ms e decay exponencial, ganho mestre 0,5. Não há formato de arquivo, bit depth ou sample rate fixo nessa síntese: o AudioContext usa a taxa escolhida pelo navegador/dispositivo. Contexto único, unlock por gesto, expiração antes de agendar (300/500 ms), fila por livreEm, mute/aba oculta com fade. Dispatcher lê prefs.sound; háptico é separado.
2. **Legado sem consumidores:** `src/lib/sfx.ts` ainda contém um motor completo independente, e não apenas uma fachada. Não há imports ativos encontrados. Define nove eventos: acerto (C5/E5, 180 ms), acerto3 (C5/E5/G5, 260 ms), erro (A3 triangular, 150 ms), xp (C6, 40 ms), fim (C5/E5/G5/C6, 900 ms), streak (C6, 300 ms), marco (C6/E6, 450 ms), desbloqueio (E5/G5, 190 ms), pop (C6, 80 ms). Não há arquivos correspondentes. Não foram inventados novos assets de XP/pop para código morto.
3. **Candidatos anteriores:** 12 WAV PCM signed 16-bit, 44.100 Hz, mono. Todos com pico −1 dBFS; durações e hashes em [original-audit.json](original-audit.json). São propostas, não o som que toca no aplicativo.

### Arquivo, uso confirmado e disparo real

Todos os nomes abaixo terminam em `.wav` e existem tanto no lote anterior quanto na proposta, em pastas diferentes. A ligação com o evento é uma correspondência de inventário: **os arquivos ainda não são reproduzidos pelo aplicativo**.

| Nome | Duração anterior | Uso confirmado da chave no código |
|---|---:|---|
| resposta-correta | 293 ms | dispatchAnswerFeedback, ramo correct; submit de useExerciseSession (study e LessonPlayer) e useLearningSession (microlições). Uma validação nova. |
| resposta-incorreta | 200 ms | Mesmo caminho, ramo incorreto. Não abre tutor. |
| acerto-consecutivo | 388 ms | Partitura apenas; não existe disparo no terceiro acerto no código atual. |
| conclusao-licao | 638 ms | dispatchClosingFeedback adiciona como base; study.nextQ, LessonPlayer.continuar e useLearningSession.finish. Evento maior pode substituir. CelebracaoAula apenas apresenta. |
| level-up | 848 ms | study e LessonPlayer comparam nivelDeXp antes/depois da conclusão. Depende de nível realmente mudar nessa janela. |
| conquista | 948 ms | Partitura apenas; sem gatilho de conquista nova. |
| streak-diario | 270 ms | study e LessonPlayer adicionam quando progress.streak muda. |
| marco-streak | 738 ms | study e LessonPlayer testam isStreakMilestone no estado final. Não exigem transição nova do marco. |
| capitulo-desbloqueado | 488 ms | Partitura apenas; a existência da trilha não significa que esta chave seja disparada. |
| meta-diaria | 468 ms | study testa atividadeHoje(depois).lessons >= dailyLessons. Não testa cruzamento antes/depois. |
| abertura-importante | 175 ms | Partitura apenas; tutor e navegação não chamam essa chave. |
| recompensa-especial | 980 ms | Partitura/prioridade apenas; sem emissor de domínio. |

`useExerciseSession.ts:35` e `useLearningSession.ts:113` chamam resposta; `dispatch-feedback.ts:24/40` seleciona resposta/fechamento; `study.tsx:143–148`, `LessonPlayer.tsx:128–132`, `useLearningSession.ts:181` emitem fechamento. Flashcards e TutorBubble não têm efeito sonoro próprio ativo. `voz.ts` contém texto, não voz sintetizada.

### Problemas encontrados

- Zero WAVs com hash idêntico, mas reaproveitamento quase literal de frases: acerto-consecutivo/resposta-correta tem similaridade cosseno 0,99977 nos primeiros 200 ms; capítulo/conclusão 0,99976. A comparação ignora escala de amplitude. Não é uma prova de identidade perceptiva, mas é forte evidência de material inicial compartilhado.
- Na partitura, acerto, consecutivo, conclusão, capítulo e meta começam pelo mesmo MOTIVO. Level-up, marco e recompensa especial seguem D5–A5–F#5–D6 mudando essencialmente tempos/ganhos. A proposta 23 também pedia essas derivações.
- Acerto D5–A5–F#5 termina descendo após uma quinta. Isso não torna uma tríade maior um erro por definição, mas não atende à direção positiva inequívoca solicitada; a v2 muda contorno, envelope e timbre.
- Normalizar todos a −1 dBFS achatou a hierarquia de picos. Erro anterior tem RMS −10,28 dBFS e acerto −12,03 dBFS. RMS não equivale a loudness, mas o erro tem maior energia média apesar da intenção de ser mais discreto.
- `streak-diario` está ausente de PRIORIDADE_FECHAMENTO; indexOf retorna −1 e o sort promove esse evento sobre prioridades listadas, inclusive level-up.
- Meta e marco testam estado atingido, não transição. Podem repetir em conclusões posteriores no mesmo dia; não são eventos idempotentes por conquista.
- Expiração é verificada antes de agendar; a espera em livreEm pode exceder esse prazo. Cancelamento por aba oculta existe; não foi encontrado consumidor de stopAllFeedbackSounds para saída de rota. A descrição da engine é mais forte que o contrato comprovado pelo código.
- Microlições enviam fechamento vazio e recebem somente conclusão; não emitem todos os marcos do player antigo. Cinco chaves ficam sem gatilho.
- Testes atuais verificam partitura/prioridades básicas/SSR e ausência de erro no navegador; não comprovam percepção, conforto ou exclusividade de cada som.

Esses problemas foram documentados, **não corrigidos nesta proposta**, respeitando a aprovação prévia pedida pelo usuário.

## DNA definido antes da síntese

Nome de trabalho: **Pequenos encaixes**. Ré maior com vocabulário pentatônico D/E/F#/A/B, sem obrigação de usar todas as notas. A família compartilha materiais, não uma sequência: madeira arredondada, cerâmica curta, corda pinçada amortecida e ar filtrado discreto. Nada de samples de outros produtos, buzzer, onda quadrada crua, grave pesado ou cauda longa.

Assinatura principal reservada ao acerto: **F#5 → A5 → D6**, com chegadas em 0/67/142 ms. A última nota tem corpo discreto em D5, uma oitava abaixo. Terça menor e quarta justa ascendentes chegam à tônica; o contexto é Ré maior. Motivo não é copiado para os outros eventos. Os graus D/A aparecem em objetos, acordes e ritmos distintos para manter parentesco.

Frequências principais: D4 293,66; E4 329,63; F#4 369,99; A4 440; D5 587,33; E5 659,26; F#5 739,99; A5 880; D6 1174,66; E6 1318,51 Hz. Parciais adicionais constam no DSP; frequências exatas de cada partitura, no manifest.

## Fichas dos 12 novos efeitos

| Arquivo | Duração | Estrutura / notas | Timbres e camadas | Emoção / distinção |
|---|---:|---|---|---|
| [resposta-correta.wav](wav/resposta-correta.wav) | 0,36 s | F#5–A5–D6; D5 sob chegada | Dois mallets, bell harmônico e corpo felt | Acerto recompensador; único gesto de três notas inteiramente ascendente com essa assinatura. |
| [resposta-incorreta.wav](wav/resposta-incorreta.wav) | 0,23 s | E4–D4, dois ataques arredondados | Felt filtrado, sem brilho/papel/acorde | Correção gentil; descendente, fosco e 6 dB RMS abaixo do acerto. |
| [acerto-consecutivo.wav](wav/acerto-consecutivo.wav) | 0,40 s | A4 repetido em síncope → D5/F#5 simultâneos | Pluck de corda, ponto de cerâmica, bell discreto | Ritmo adquirido; repetição rítmica com díade, sem reciclar o acerto. |
| [conclusao-licao.wav](wav/conclusao-licao.wav) | 0,62 s | A4/E5 → acorde D4/F#4/A4 | Mallet aberto, pad quente, pluck | Repouso após trabalho; duas massas harmônicas, sem arpejo. |
| [level-up.wav](wav/level-up.wav) | 0,78 s | D4–E4–A4 → D5/F#5 | Três plucks, bell/pad final, ar breve | Novo patamar; escada com espaçamento crescente e chegada em acorde. |
| [conquista.wav](wav/conquista.wav) | 0,88 s | D5 inicial; D4/F#4/A4 sustentado; A5 sobreposto | Cerâmica, tríade macia e luz de bell | Reconhecimento raro; medalhão harmônico sustentado, não escada. |
| [streak-diario.wav](wav/streak-diario.wav) | 0,28 s | D5–D5; A4 discreto sob segundo toque | Cerâmica seca + felt | Presença de hoje; dois ataques na mesma altura, sem subida de recompensa. |
| [marco-streak.wav](wav/marco-streak.wav) | 0,70 s | D4–A4–D4 → F#4/A4/D5 | Passos de madeira + acorde de bells | Constância acumulada; três passos e carimbo final separado. |
| [capitulo-desbloqueado.wav](wav/capitulo-desbloqueado.wav) | 0,44 s | A4 seco → D5/A5 sustentados | Cerâmica, ar de página e pad em quinta | Abertura de caminho; transição de textura para espaço harmônico. |
| [meta-diaria.wav](wav/meta-diaria.wav) | 0,49 s | D5/F#5/A5 juntos → D5 | Acorde de mallets + cerâmica | Tarefa cumprida; acorde primeiro e confirmação depois. |
| [abertura-importante.wav](wav/abertura-importante.wav) | 0,17 s | A4 único, sem melodia | Ar filtrado e um ponto de cerâmica | Convite discreto; efeito de interface mais curto e quieto. |
| [recompensa-especial.wav](wav/recompensa-especial.wav) | 0,98 s | D4/A4 abre; F#5–E6–D6; F#4 sob final | Pad aberto, gotas de bell, papel | Surpresa rara; acorde antes das gotas, ritmo espaçado e final em tônica. |

Os cinco eventos sem gatilho estão incluídos como vocabulário preparado, sem inventar pontos de disparo no produto.

## Síntese, refinamento e revisão

Python 3.13, somente biblioteca padrão. `dsp.py` oferece oscilador harmônico, ADSR, bancos modais com decay por parcial, mallet/bell/felt/cerâmica, pluck Karplus–Strong com atraso fracionário, filtros, ar pseudoaleatório determinístico, camadas, delay, reflexões curtas, fades, remoção de DC, ganho por RMS limitado por teto de pico e exportação. `generate.py` contém composições independentes declarativas, não versões transformadas de um master.

Foi refinado o ataque do pluck: passa-baixas de 4,2 kHz e fade de 7 ms reduziram o caráter áspero da excitação de ruído. O alvo de RMS cede ao teto de pico; por isso consecutivo chega a −22,13 dBFS, não ao alvo nominal −19. A resposta comum é deliberadamente mais presente que esse detalhe de bônus. Não há compressor/clipper empurrando todos os arquivos para o mesmo pico.

Formato final: **WAV PCM 16-bit mono, 48 kHz**. Mono evita cancelamento de camadas em celular. Picos medidos de −13,68 a −4 dBFS; nenhuma amostra clipada; DC residual < 0,00001; primeira/última amostra zero; RMS nos últimos 10 ms abaixo de −76 dBFS. Pico entre amostras foi estimado por interpolação cúbica, não medição certificada de true peak. Os arquivos contêm fades de cauda; silêncios maiores existem apenas nas prévias para separar sons.

**66 pares comparados**, sem hashes duplicados ou partituras estruturalmente idênticas após normalizar transposição/tempo. Similaridade máxima de prefixo ficou em 0,57221 (conquista/meta), contra >0,999 em diversos pares anteriores. Esse par compartilha tônica inicial, mas conquista abre em acorde sustentado e meta é percussiva com segundo carimbo; não são a mesma amostra modificada. Também foi comparado envelope normalizado em duração; envelope parecido, isoladamente, não significa som duplicado.

Revisão por efeito: as intenções emocionais e as distinções estão explicitadas na tabela. Acerto/erro se separam por contorno, registro, brilho, número de camadas e ganho. Conclusão/conquista se separam por entrada, duração sustentada e textura; meta/streak separam acorde de nota repetida; level/marco separam escada de passos alternados; abertura/capítulo separam ponto curto de expansão. Memória e conforto repetido são hipóteses de design, não resultados comprovados.

**Limite honesto:** a revisão aqui é de composição e sinal, não escuta humana. Não alego ter ouvido os WAVs ou validado percepção em celular. A aprovação de qualidade profissional, identificação sem tela e conforto após repetições precisa da sua escuta. As prévias no chat e os players tornam essa decisão concreta. Nenhum resultado de piloto com participantes foi inventado.

## Reprodução e arquivos

Na raiz do repositório:

```powershell
py scripts/foca_sound/generate.py
py scripts/foca_sound/verify.py
```

`audit.py` é para capturar um novo baseline deliberadamente; não o rode antes de verificar preservação do baseline original. A geração é determinística. O verificador relê os WAVs exportados e compara hashes dos arquivos preexistentes em src/public/docs/audio-candidates.

Criados: 12 WAVs em `wav/`; três prévias WAV; `index.html`; este README; `manifest.json` (notas, frequência, duração, níveis e hashes); `original-audit.json`; `quality-review.json`; `baseline-hashes.json`; scripts `audit.py`, `dsp.py`, `generate.py`, `verify.py` em `scripts/foca_sound/`. Nenhuma dependência no package.json.

## Integração somente depois de aprovação

Não copiar os WAVs por cima dos candidatos antigos. A integração futura deverá mapear as chaves para AudioBuffer em uma pasta de produção, pré-carregar/decodificar após gesto, preservar prefs.sound, prioridade, cancelamento e expiração incluindo tempo em fila. Ganho mestre precisará de calibração: aplicar cegamente 0,5 aos novos níveis reduz mais 6 dB. Resolver os problemas de eventos identificados é trabalho posterior. Não ligar os cinco eventos reservados sem definir gatilho real. O pedido do usuário é a razão de aguardar aprovação; esta entrega não altera o runtime.
