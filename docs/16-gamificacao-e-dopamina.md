# 16 — Gamificação e sistema de dopamina

> **Especificação vigente — 21/09/2026:** [20-plano-evolucao-aprendizagem.md](20-plano-evolucao-aprendizagem.md), seções 5, 6 e 12, define a evolução de feedback, identidade sonora e progresso. Ela prevalece em conflitos: hierarquia de intensidade, efeitos únicos, silêncio quando apropriado, recompensas idempotentes e nenhuma justificativa genérica por “dopamina”. O status histórico abaixo não comprova integração de todos os sons nem ausência de bugs; consultar o diagnóstico do `20`. A nova implementação ainda não começou.

Status: ✅ **implementado em 20/09/2026** (`18-plano-reestilizacao-rabisco.md`, Fases 5–9) — som (9 eventos via WebAudio, `src/lib/sfx.ts`), háptico (`src/lib/haptics.ts`), streak com congelamento automático, meta diária e calendário semanal reais (`activityDays`/`today` em `store.ts`), nível de jogo derivado de XP (`nivelDeXp`). Ver `19-registro-execucao-rabisco.md` para o registro da execução. Pendente: conquistas/badges (§7, deliberadamente adiado) e produção de dados de retenção real (§11, sem dono). Marca: `brand/foca-rabisco-branding.md` (a paleta Ártica deste histórico foi substituída). Voz do mascote: `15-mascote-e-voz.md`.

---

## 0. A tese — e o paradoxo que ela carrega

**A tese:** o João não procrastina por preguiça. Ele procrastina porque o TikTok entrega recompensa em 3 segundos e o caderno entrega em 3 meses. Nenhum discurso sobre disciplina vence essa diferença de latência. **O que vence é encurtar a latência do lado certo** — e é exatamente isso que gamificação é: recompensa imediata para um comportamento de retorno lento.

**O paradoxo, dito de frente:** o produto existe para resgatar adolescentes de um loop de dopamina, e a solução proposta é… construir um loop de dopamina. Se isso não for resolvido explicitamente, o Foca vira o problema que diz combater, e qualquer banca minimamente atenta vai apontar isso.

### A resposta (e ela é estrutural, não retórica)

| | TikTok | **Foca** |
|---|---|---|
| **A sessão termina?** | Não. Não existe fim. | **Sim.** 60 segundos e acabou. O app te empurra pra fora. |
| **Quem escolheu o comportamento?** | O algoritmo | **O usuário**, no quiz de entrada |
| **O que fica depois** | Nada | Conhecimento verificável |
| **Recompensa é variável (caça-níquel)?** | Sim, por design | **Não.** Recompensa previsível e proporcional |
| **O app quer mais tempo seu?** | É a métrica dele | **Não.** A métrica é *dias seguidos*, não *minutos por dia* |

**A linha que separa os dois é essa:** o Foca otimiza **frequência**, o TikTok otimiza **duração**. Uma ferramenta que te pede 60 segundos por dia e depois te manda embora não é vício — é hábito. É defensável em qualquer palco, e é o que a Seção 9 protege.

---

## 1. O que já existe no código

Levantado em `src/lib/store.ts`:

| Mecânica | Estado | Onde |
|---|---|---|
| **XP** | ✅ existe | `progress.xp`, +50 no quiz, `XP_BY_STARS` nas lições |
| **Streak** | ✅ existe | `progress.streak`, incrementa em `completeLesson` |
| **Estrelas (1–3)** | ✅ existe | `starsForPct()` por percentual de acerto |
| **XP incremental** | ✅ existe | Refazer lição só dá o *delta* de XP — não farma repetindo |
| **Desbloqueio sequencial** | ✅ existe | `isLessonUnlocked()` nas trilhas de redação |
| **Nível** | 🟡 parcial | `prefs.level` existe mas é nível escolar, não nível de jogo |
| **Som** | ❌ **nenhum** | Não há um `Audio` no projeto inteiro |
| **Háptico** | ❌ nenhum | — |
| **Meta diária** | 🟡 parcial | Existe na tela, não é mecânica com estado |

**Leitura:** a espinha está de pé. O que falta é quase todo **sensorial** — som, vibração, movimento. É a camada mais barata de construir e a que mais muda a percepção de "produto gamificado".

---

## 2. O loop de recompensa

```
   abriu  →  60s de questão  →  respondeu  →  FEEDBACK IMEDIATO  →  XP  →  streak  →  saiu
     ↑                                         (som+cor+háptico)                        │
     └──────────────────  notificação da Foca no dia seguinte  ←──────────────────────┘
```

Três exigências, em ordem:

1. **O feedback tem que ser IMEDIATO.** Latência acima de ~100ms entre o toque e o retorno sensorial quebra a associação. É requisito técnico, não estético.
2. **A recompensa tem que ser PROPORCIONAL.** Acertar uma questão fácil e uma difícil com a mesma fanfarra desvaloriza as duas.
3. **A saída tem que ser LIMPA.** O app termina a aula e não oferece "mais uma". Isso é contraintuitivo e é o ponto inteiro (§0).

---

## 3. Sistema de som

O item mais pedido e o mais fácil de errar. Referência: Duolingo acerta porque os sons são **curtos, musicais e na mesma tonalidade** — nunca "efeitos sonoros".

### Princípios

- **Tudo na mesma escala.** Dó maior. Sons da mesma família harmônica soam como *um sistema*; sons avulsos soam como um site de 2009.
- **Curto.** Nada acima de 400ms, exceto a fanfarra de fim de aula (até 900ms).
- **Timbre suave.** Marimba, pluck sintético, sino curto. **Nunca** buzzer, nunca voz, nunca som "de videogame".
- **O erro não pune.** Som de erro grave e curto, informativo, sem dissonância agressiva. Punição sonora ensina a evitar o app.

### Tabela de eventos

| Evento | Som | Duração | Notas |
|---|---|---|---|
| **Acerto** | 2 notas ascendentes, marimba | ~180ms | C5 → E5. O som mais ouvido do app: tem que aguentar 50 repetições sem irritar |
| **Acerto difícil / streak de acertos** | 3 notas ascendentes | ~260ms | C5 → E5 → G5. Recompensa proporcional (§2) |
| **Erro** | 1 nota grave, pluck abafado | ~150ms | A3. Neutro. Não é buzina |
| **XP subindo** | Tick sutil por incremento | ~40ms cada | Máx. 6 ticks, depois silencia — contador grande não vira metralhadora |
| **Fim de aula** | Fanfarra curta, 4 notas | ~900ms | Único som "grande" do app. Raro = especial |
| **Streak mantido** | Sino claro | ~300ms | Toca **depois** da fanfarra, não junto |
| **Streak novo recorde** | Sino + brilho, oitava acima | ~450ms | Reservado para marcos (7, 30, 100) |
| **Lição desbloqueada** | Clique de destrave | ~200ms | |
| **Abertura do balão da Foca** | Pop curtíssimo | ~80ms | Sem melodia — é UI, não recompensa |

### Regras de uso

1. **Mudo é sagrado e persiste.** Toggle acessível em 1 toque, guardado no store. Se o usuário desligou, nunca mais toca — nem em "momento especial".
2. **Respeitar o silencioso do sistema.** iOS em modo silencioso não toca som de app. Ignorar isso é o caminho mais rápido para a desinstalação (som no meio da aula de escola).
3. **Primeiro uso começa com som LIGADO**, mas com aviso visível de como desligar. Descobrir o som é parte do produto; ser emboscado por ele não é.
4. **Nunca dois sons simultâneos.** Fila, não mistura.
5. **Teto de densidade:** no máximo **1 som de recompensa por resposta**. XP + streak + level up na mesma resposta = toca só o mais alto da hierarquia.
6. **Precarregar tudo** no primeiro toque do usuário. Áudio que chega atrasado é pior que áudio nenhum (§2, regra dos 100ms).
7. **Sem autoplay antes do primeiro gesto** — navegador bloqueia, e o bloqueio silencioso deixa o app parecendo quebrado.

---

## 4. Háptico

Reforça o som e funciona com o celular no silencioso — onde o público-alvo passa metade do dia.

| Evento | Padrão | API |
|---|---|---|
| Acerto | 1 pulso curto | `navigator.vibrate(30)` |
| Erro | 2 pulsos curtos | `navigator.vibrate([25, 40, 25])` |
| Fim de aula | 1 pulso médio | `navigator.vibrate(60)` |
| Streak marco | 3 pulsos crescentes | `navigator.vibrate([30,50,40,50,60])` |

**Regras:** `navigator.vibrate` não existe no iOS Safari — o código precisa degradar em silêncio, sem try/catch barulhento. Háptico segue o mesmo toggle do som? **Não** — toggle próprio: tem gente que quer vibração sem som exatamente por estar em aula.

---

## 5. Movimento

- **Acerto:** alternativa pulsa e ganha borda verde. ~200ms, `ease-out`.
- **Erro:** *shake* horizontal de baixa amplitude (~4px, 2 ciclos, 180ms). Curto — shake longo humilha.
- **XP:** número sobe contando, com o "+12" flutuando para cima e sumindo. É a animação mais importante do app: é a materialização visual da recompensa.
- **Streak:** ícone da Foca com um "respiro" de escala ao incrementar.
- **Fim de aula:** a Foca entra por baixo com a expressão correspondente ao desempenho (`15` §5).
- **Transições de tela:** deslize horizontal, ~250ms. Nada acima de 300ms — o app promete 60 segundos e não pode gastar 4 em animação.

> **`prefers-reduced-motion` obrigatório.** Quem ativou isso no sistema recebe as mesmas recompensas sem movimento: a cor, o som e o número continuam. Recompensa não pode depender de animação.

---

## 6. Streak — a mecânica mais delicada

O streak é o motor de retorno **e** o maior risco do produto (`15` §3.2). Desenho:

- **Incrementa** com qualquer atividade completada no dia — uma aula de 60s ou uma lição de redação. O critério é presença, não volume.
- **Não incrementa duas vezes** no mesmo dia. Nada de farmar.
- **Congelamento automático:** o usuário tem **1 freeze acumulável até 2**, gasto automaticamente ao perder um dia. Ele descobre depois ("usei um congelamento por você"), sem precisar gerenciar nada.
- **Ao quebrar de verdade:** o número volta a zero **sem drama visual**. Sem animação de vidro quebrando, sem som de derrota. A Foca comenta com a voz da §3.2 de `15` — acolhedora, nunca cobradora.
- **Recuperação:** voltar depois de quebrar mostra o **recorde anterior** como meta ("seu recorde foi 12"), transformando a perda em alvo em vez de luto.

> **A regra que não se quebra:** o streak nunca bloqueia conteúdo, nunca custa dinheiro para recuperar, e nunca é usado como chantagem na notificação ("você vai perder TUDO"). No segundo em que o streak vira ameaça financeira ou emocional, o produto virou cassino.

---

## 7. Mecânicas do Duolingo: o que adotar e o que recusar

| Mecânica | Decisão | Por quê |
|---|---|---|
| **Sons de acerto/erro** | ✅ Adotar | O núcleo do pedido. §3 |
| **Streak + freeze** | ✅ Adotar | Motor de retorno comprovado. §6 |
| **XP + níveis** | ✅ Adotar | Já existe pela metade. Falta o nível de jogo |
| **Ligas / ranking semanal** | ✅ Adotar (mock já existe) | `/ranking` já está lá. Comparação com a turma, não com o Brasil |
| **Trilha com desbloqueio** | ✅ Já existe | Nas 15 trilhas de redação |
| **Conquistas / badges** | 🟡 Depois | Barato e eficaz, mas fora do escopo atual (`08` §"Regras de escopo") |
| **❤️ Vidas / corações** | ❌ **Recusar** | **Bloqueia o aluno de estudar depois de errar.** Contradiz frontalmente a regra "errar é o app funcionando" (`15` §3.3) e existe no Duolingo para vender assinatura, não para ensinar. Num app de ENEM, impedir alguém de praticar o que ele erra é o oposto do produto |
| **Gemas / moeda** | ❌ Recusar agora | Economia interna sem loja é enfeite; com loja é monetização, e monetização está fora de escopo |
| **Recompensa variável (caça-níquel)** | ❌ **Recusar** | Baú aleatório é a mecânica que mais se aproxima de jogo de azar. É a linha que separa hábito de vício (§0) |
| **Notificação com culpa pesada** | ❌ Recusar | `15` §3. O Duo faz; para esta persona, é contraproducente |

---

## 8. Meta diária

- Padrão: **1 aula de 60s.** Baixa de propósito — a meta existe para ser batida, não para desafiar.
- O usuário pode subir para 3 ou 5, nunca abaixo de 1.
- Bater a meta fecha o anel do dia (som de streak + a Foca).
- **Passar da meta não dá recompensa extra escalonada.** Quem quiser fazer 20 questões, ótimo — mas o app não incentiva sessão longa. Isso é a §0 aplicada: a métrica é frequência, não duração.

---

## 9. As linhas que não se cruzam

Lista curta e inegociável. Cada item aqui é uma mecânica que funciona (aumenta engajamento) e que **mesmo assim** não entra:

1. **Nada de rolagem infinita.** Aula tem fim. Sempre.
2. **Nada de recompensa aleatória** (loot box, baú surpresa, XP variável).
3. **Nada de bloquear estudo** como punição (é o caso das vidas, §7).
4. **Nada de ansiedade monetizada** — não se vende recuperação de streak.
5. **Nada de comparação humilhante.** Ranking mostra a turma, nunca "você é o pior".
6. **Nada de notificação fora de hora.** Janela 08h–21h, no máximo 1 por dia.
7. **Nada de esconder o botão de sair.** O app termina a aula e te deixa ir.

> Isto não é um anexo de compliance. É o que permite olhar para uma banca — ou para um pai — e dizer que o produto usa as ferramentas do TikTok **contra** o TikTok, sem virar ele.

---

## 10. O que a implementação exige

Resumo técnico, para quando a direção for aprovada. **Nada disto foi feito.**

| Peça | Onde | Nota |
|---|---|---|
| Módulo de áudio | novo, ex. `src/lib/sfx.ts` | Precarrega, enfileira, respeita mudo. **Sem biblioteca externa** — são 9 sons, `Audio` puro resolve; o alvo do build é worker e cada dependência pesa (mesma lógica de `CLAUDE.md` para o cliente de IA) |
| Assets de som | `public/sfx/` | 9 arquivos. `.webm` com fallback `.mp3`. Alvo: < 8KB cada |
| Toggles no store | `src/lib/store.ts` | `prefs.sound` e `prefs.haptics`. **Estende o store existente** — não criar mecanismo paralelo (regra do `CLAUDE.md`) |
| Streak freeze | `src/lib/store.ts` | Campos `streakFreezes` e `lastActiveDay`, consumo automático (§6) |
| Háptico | `src/lib/haptics.ts` | Degrada em silêncio onde não existe |
| Nível de jogo | `src/lib/store.ts` | Derivar de XP. **Não** confundir com `prefs.level` (nível escolar), que já existe e significa outra coisa |
| Animações | `src/routes/study.tsx`, componentes de lição | `prefers-reduced-motion` obrigatório |

---

## 11. Pendências

- [ ] Produzir ou licenciar os 9 sons (§3) na mesma tonalidade — o "mesma escala" é o que faz virar sistema.
- [ ] Testar o som de acerto em **50 repetições seguidas** antes de aprovar. É o teste que separa som bom de tortura.
- [ ] Decidir se ligas/ranking saem do mock (`08` §3 marca como mock consciente).
- [ ] Medir se o streak realmente traz de volta — hoje não há **nenhum** dado de retenção (`08` §10, `14` §10). É a hipótese central do produto e segue não medida.
- [ ] Revisar a §9 com alguém de fora antes de qualquer mecânica nova entrar.
