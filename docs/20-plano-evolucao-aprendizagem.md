# Foca — especificação executável de correções e evolução do aprendizado

Auditoria e decisões: 20/09/2026. Registro no SDD: 21/09/2026. Versão da especificação: 1.0.

**Status: PLANEJADO, NÃO IMPLEMENTADO.** A autorização desta etapa cobre somente documentação. Este documento não declara bugs corrigidos, testes aprovados ou funcionalidades entregues. A implementação depende de autorização posterior do usuário.

Este é o plano completo de referência do SDD para transformar o fluxo em **aprender → praticar → entender o erro → revisar → avançar → perceber progresso**. É uma especificação para execução por outra IA, não apenas uma proposta conceitual.

## Como a próxima IA deve usar este documento

1. Ler este documento inteiro antes de alterar código; ler também `../AGENTS.md`, `../CLAUDE.md`, `14-persona-joao.md`, `brand/foca-rabisco-branding.md` e `18-plano-reestilizacao-rabisco.md`.
2. Confirmar qual fase foi autorizada. Não executar automaticamente o roadmap inteiro.
3. Conferir o estado real dos arquivos citados: o diagnóstico é de 20/09/2026, e o código pode mudar depois dele.
4. Preservar alterações preexistentes do usuário. Não reverter o rebranding nem reescrever histórico publicado no Lovable.
5. Executar a ordem numerada da fase, testar seus critérios e registrar evidências antes de avançar.
6. Não tratar exemplos de pseudocódigo como código pronto. Manter as decisões normativas deste documento; documentar divergências necessárias antes de implementá-las.
7. Todo caminho marcado **NOVO ARQUIVO** é uma proposta, não um arquivo existente na auditoria. A listagem de novos arquivos não autoriza criá-los nesta etapa documental.
8. Não editar `src/routeTree.gen.ts` manualmente. Não criar um segundo store, novo backend, nova biblioteca de áudio ou nova dependência de IA por conveniência.
9. Registrar por fase: arquivos alterados, testes executados, resultados, limitações, migrações e pendências. Checklist marcado exige evidência, não intenção.

### Precedência e conflitos com documentos antigos

Para os assuntos cobertos aqui, este documento prevalece sobre instruções incompatíveis em `08`, `10`, `11`, `12`, `15`, `16`, `18` e descrições históricas em `CLAUDE.md`.

| Instrução anterior | Decisão vigente para a implementação futura |
|---|---|
| Erro abre automaticamente o tutor e dispara explicação | Erro mostra feedback local; somente CTA explícito abre o tutor; abrir não envia mensagem |
| Chamar `fala(slot)` ao renderizar | Texto de interação é escolhido uma vez no evento e armazenado; render é puro |
| Sarcasmo/cobrança que constrange por erro ou ausência | Companhia direta e respeitosa; humor sobre a mascote, nunca humilhação do aluno |
| Tudo precisa caber em uma aula total de 60 segundos | Explicação de 30–90 segundos; tempo da prática informado separadamente |
| Percentual acumulado basta para declarar domínio | Evidência mínima, diversidade e recuperação posterior; não confundir conclusão com domínio |
| “Dopamina” explica ou justifica qualquer recompensa | Feedback informativo, competência percebida, progresso e autonomia; sem promessa neurocientífica |
| Diagnóstico inicial já mede conhecimento | O `/quiz` auditado coleta perfil; não anunciar diagnóstico cognitivo que não aconteceu |
| IA obrigatória em toda decisão do fluxo | Regras locais e conteúdo revisado no MVP; tutor sob demanda, sem custo por resposta |

O arquivo histórico não deve ser apagado. A aparência continua **Rabisco na Margem**; este plano não restaura Ártica/Flash Test nem copia o design de outro aplicativo.

## 1. Resumo executivo

Separar a entrega em duas frentes: estabilizar imediatamente o loop atual e, depois, acrescentar ensino explícito em um piloto pequeno. Não aguardar trilha, branding sonoro ou backend para corrigir os quatro bugs.

Decisões centrais:

- Feedback imutável por tentativa, avanço único e tutor inteiramente voluntário.
- Uma infraestrutura de feedback compartilhada pelos dois players, preservando os sete formatos de exercício.
- Sons como família curta e hierarquizada; silêncio na navegação comum; controle de som respeitado em todas as telas.
- Voz humana, específica e sem culpa; revisão de copy funcional separada da revisão pedagógica do conteúdo.
- Seis microlições piloto, com uma habilidade por lição, explicação curta, checkpoint, prática e recap.
- Store local existente ampliado com sessões, tentativas, evidências, revisões e ledger de recompensas; migração sem apagar histórico.
- Trilha apresenta posição e próximo passo; revisão não apaga conclusão e erro não bloqueia o aluno indefinidamente.
- Adaptatividade determinística e explicável no MVP; nenhum novo custo de IA no caminho obrigatório.

### Avaliação crítica das propostas

| Problema da proposta | Por que pode prejudicar | Implementação melhor |
|---|---|---|
| Prometer 60 segundos para ensino e várias questões | Pressiona leitura, produz conteúdo superficial e promessa falsa | Separar tempo de explicação e de prática; sem cronômetro punitivo |
| Dar som, animação e frase a cada pequena ação | Fadiga e perda de hierarquia | Quatro intensidades; escolher um som por grupo de recompensas |
| Exibir muitas dicas | Interrompe e aumenta carga cognitiva | No máximo uma dica espontânea por dia, dentro do recap |
| Trilhas com bloqueio rígido ou vidas | Quem já não sabe fica impedido de aprender | Introduções acessíveis, revisão sugerida e avanço por conclusão |
| “Boss” obrigatório | Ansiedade e infantilização | Desafio opcional de capítulo, sem perda de progresso |
| Domínio calculado por 1 acerto em 1 tentativa | Falsa confiança | Estado “pouca evidência” e limiar com recuperação após 24 horas |
| Gerar aula/questão com IA a cada uso | Custo, latência e erros pedagógicos | Conteúdo versionado e revisado; IA apenas sob demanda |
| Expandir todas as matérias de uma vez | Qualidade editorial e validação não escalam | Piloto de seis lições antes de ampliar |
| Dezenas de números no dashboard | Usuário não sabe qual métrica importa | Próximo passo, meta diária e evidência de aprendizado; XP secundário |
| Linguagem “jovem” performática ou sarcasmo no erro | Soa artificial e pode reforçar evitação | Informalidade natural, concreta e respeitosa |

## 2. Diagnóstico da arquitetura atual

### 2.1 Escopo e limite da auditoria

Auditoria estática da árvore do projeto, manifestos, configuração, rotas, store, componentes, motor, conteúdo e documentação. Inventário: 357 arquivos de projeto, desconsiderando dependências, Git e artefatos gerados de build. A inspeção estrutural dos builders de conteúdo foi feita em memória. **Não houve teste visual em navegador, teste de áudio em dispositivo ou revisão semântica individual dos 1.204 exercícios.** As causas abaixo distinguem evidência estática de validação de execução ainda necessária.

- `src/routes/`: 22 arquivos TSX incluindo raiz, além do README; rotas de perfil, estudo, redação, progresso, onboarding e telas auxiliares.
- `src/components/`: 67 arquivos; 46 componentes de UI genéricos. O fluxo auditado usa principalmente os componentes próprios de design system.
- `src/content/trilhas/`: 150 arquivos, sendo 134 lições, 15 manifests e índice.
- Conteúdo: 1.204 exercícios — 335 múltipla escolha, 247 verdadeiro/falso, 125 parear, 144 lacunas, 158 encontrar erro, 53 ordenar e 142 interpretação.
- Banco geral: 59 questões em `src/data/questions.ts`, cobrindo 11 matérias; `subjects.ts` tem 12, incluindo redação.
- Não foram encontrados testes automatizados do projeto nem scripts de teste no `package.json` auditado.

### 2.2 Mapa técnico real

| Camada | Arquivos existentes | Responsabilidade atual |
|---|---|---|
| Entrada/build | `package.json`, `vite.config.ts`, `src/server.ts`, `src/routes/__root.tsx` | React 19, TS, TanStack Start/Router, Vite 8, Tailwind 4; configuração real inclui Nitro/Netlify |
| Estado | `src/lib/store.ts` | `useSyncExternalStore`, preferências, progresso, tutor e persistência local |
| Estudo geral | `src/routes/study.tsx`, `src/data/questions.ts`, `src/data/subjects.ts` | Seleção de questões, relógio, validação, XP, feedback e conclusão |
| Redação | `src/routes/redacao.index.tsx`, `src/routes/redacao.$licaoId.tsx`, `src/components/lessons/LessonPlayer.tsx` | Mapa legado e execução das lições |
| Motor | `src/lib/lessons/types.ts`, `define.ts`, `registry.ts` | Union `Exercise`, correção `checkAnswer`, embaralhamento `shuffled`, registro `exerciseViewFor` |
| Exercícios | `src/components/lessons/exercises/MultipleChoice.tsx`, `TrueFalse.tsx`, `MatchPairs.tsx`, `FillBlank.tsx`, `FindError.tsx`, `Reorder.tsx`, `Interpret.tsx`, `shared.ts` | Sete apresentações e estilos compartilhados |
| Feedback | `src/components/lessons/FeedbackSheet.tsx`, `CelebracaoAula.tsx` | Feedback por resposta e resumo de conclusão |
| Voz/marca | `src/lib/voz.ts`, `src/lib/brand.ts`, `src/components/brand/FocaSays.tsx`, `FocaMark.tsx` | Mensagens por slot e mascote; expressões ainda usam fallback visual neutro |
| Som/háptico | `src/lib/sfx.ts`, `src/lib/haptics.ts` | Síntese Web Audio e vibração conforme preferências |
| Tutor | `src/components/TutorBubble.tsx`, `src/lib/tutor.ts`, `tutor-core.ts`, `tutor-prompt.ts`, `src/lib/lessons/tutor-focus.ts` | UI global, server function, transporte, prompt/fallback e adaptação do contexto |
| Navegação/DS | `src/components/AppShell.tsx`, `src/components/ds/BottomSheet.tsx`, `ProgressBar.tsx`, `XpChip.tsx`, `GoalRing.tsx`, `StatTile.tsx`, `EmptyState.tsx`, `src/styles.css` | Casca, componentes visuais e tokens light/dark |
| Recomendação/progresso | `src/lib/gaps.ts`, `src/routes/dashboard.tsx`, `progress.tsx`, `plan.tsx`, `topics.tsx` | Heurísticas locais, metas, tópicos e indicadores |
| Revisão | `src/routes/flashcards.tsx` | Revisões com intervalos fixos e `nextReview` no store |
| Perfil/entrada | `src/routes/quiz.tsx`, `aha.tsx`, `index.tsx`, `profile.tsx` | Perfil, lacunas inferidas e preferências; não há diagnóstico real de conhecimento no quiz atual |

`src/content/trilhas/` deve ser mantido: a evolução não é uma reescrita do motor nem a substituição das 134 lições. Shadcn disponível não significa que a opacidade atual venha dele; as alternativas auditadas são principalmente botões nativos.

### 2.3 Estado e persistência

Chave vigente: `foca.state.v3`; fallback legado: `flashtest.state.v2`. Não existe banco, autenticação real ou sincronização entre dispositivos. Login é flag local; ranking tem colegas fictícios; offline marca um estado, não equivale a download/SW funcional.

Grupos relevantes no store:

- `prefs`: nome, dados de perfil/vestibular, matérias difíceis, tópicos escolhidos, metas, `sound`, `haptics`, `theme`.
- `progress`: respostas, acertos, aulas, XP, streak, `bySubject`, `byTopic`, questões concluídas, flashcards/revisões, conquistas, `lessons`, `activityDays`, congelamentos e `today`.
- `quiz`: respostas/lacunas/conclusão do perfil.
- `tutor`: `open`, `messages`, `focus`, `autoPrompt`.
- `offline` e `premiumTrial`: funcionalidades demonstrativas locais.

`registrarResposta` concede 15 XP por acerto e 5 por erro em cada chamada. `completedQuestions` evita IDs repetidos, mas não torna a concessão de XP idempotente. `completeLesson` concede 10/20/30 XP por melhor faixa de desempenho, pagando só a diferença em replays. As faixas são 1 estrela abaixo de 70%, 2 a partir de 70%, 3 a partir de 90%. Repetir lição ainda registra atividade.

`registrarAtividade` administra dia/streak; `activityDays` é limitado a 60 registros, mas a reposição de congelamento usa o tamanho desse array: depois do limite, o contador deixa de representar dias novos. `nivelDeXp` usa limiares `[0,100,250,450,700,1000,1400,1900,2500,3200]`.

### 2.4 Fluxos atuais

**Geral:** `study.tsx` escolhe questões → seleção → `submit` → `registrarResposta` → som/háptico → `phase=result` → no erro também `askTutorAutomatically` → feedback → avanço → conclusão. `useLessonClock` continua atualizando a cada segundo enquanto a fase não é `done`.

**Redação:** rota resolve lição → `LessonPlayer` embaralha quando necessário → view do registry → `verify` chama `checkAnswer` → `checked`/`wasCorrect` → `FeedbackSheet` → `next` → `completeLesson` → `CelebracaoAula`. `verify` não reproduz som. `askTutor` existe como ação manual.

**Tutor:** atualização de `autoPrompt` → efeito em `TutorBubble` → envio real. A chamada usa servidor; há fallback local em erro/timeout. A validação de entrada da server function é nominal, não validação robusta em runtime.

### 2.5 Outros problemas relevantes, sem ampliar silenciosamente a fase de bugs

- `q2` em `questions.ts`: C = `1/4` e E contém `13/52 simplificado como 3/12`; ambas equivalem a 1/4, mas o gabarito aceita só C. Quarentenar/revisar/versionar antes de reutilizar.
- Tópicos do banco sem correspondência exata ao catálogo: Progressão Aritmética, Progressão Geométrica, Independência do Brasil, Clima, Sócrates e Geometria. Normalizar por IDs, não por comparações frágeis de rótulos.
- O dashboard pode anunciar uma lacuna e iniciar questões de outro tópico; a recomendação e o seletor devem ter fonte única.
- Meta atual considera aulas gerais; redação e outros estudos têm contadores separados. Um indicador de missão usa limiar fixo de uma atividade, mesmo com meta configurada maior.
- `/progress` pode anunciar domínio após 1/1; o denominador e o tipo de evidência precisam aparecer.
- Flashcards: memoização observa chaves, não necessariamente valores de revisão; remover um item devido e incrementar índice pode pular o próximo; filtro não reinicia índice; avaliação pode ocorrer antes de virar o card.
- `getState()` não hidrata sozinho; splash usa essa leitura. Inicialização explícita deve anteceder decisões de redirecionamento.
- Rota de lição verifica existência, mas não aplica todo o desbloqueio; mudança de parâmetro precisa reinicializar o player por identidade.
- `completeQuiz` pode conceder bônus novamente. Corrigir junto do ledger, não misturar a correção de texto com redesenho de XP.
- Não há prova semântica de que todo item marcado “ENEM” seja uma questão oficial; faltam metadados de procedência.

## 3. Diagnóstico dos bugs

### B1 — frase mudando a cada segundo

Evidência: `FeedbackSheet` executa `fala(correct ? "acertou" : "errou")` dentro do render. `fala` lê a última frase do `sessionStorage`, a exclui do sorteio, chama aleatoriedade e grava a nova. O relógio de `study.tsx` provoca renders a cada segundo. Mesmo sem relógio, abrir a resolução ou alterar outro estado pode trocar a frase.

Causa primária: efeito colateral e escolha aleatória no render, não a existência do relógio. `useMemo` não é contrato de persistência da interação e não é a solução de domínio. Também há usos em `FocaSays`, `CelebracaoAula`, `EmptyState` e tela 404 a revisar.

### B2 — IA abre ao errar

Evidência: no `submit` de `study.tsx`, a condição `!correct` chama `askTutorAutomatically`. A função do store define abertura, foco e `autoPrompt`; o efeito de `TutorBubble` envia a pergunta. No `LessonPlayer`, função de mesmo nome é chamada pelo botão manual, não pela validação.

Causa: correção de resposta acoplada à abertura e ao transporte de chat. Remover somente o efeito visual sem remover o envio não satisfaz o requisito.

### B3 — quiz de redação sem som

Evidência: estudo geral chama `sfx`/háptico na validação; `LessonPlayer.verify` apenas corrige e atualiza estados. `CelebracaoAula` toca no fechamento, o que não cobre feedback de cada resposta. O sistema atual sintetiza som por Web Audio: não há arquivo MP3 faltante para esses eventos.

Causa primária: ausência de chamada no fluxo de validação de redação. Autoplay, `AudioContext.resume()` e preferência também precisam de testes reais, mas não explicam a lacuna de integração encontrada.

### B4 — alternativas transparentes

Evidência: `choiceClasses` em `shared.ts` aplica `opacity-45` às alternativas neutras após verificar. Há tratamentos semelhantes em `FillBlank`, `TrueFalse` e `MatchPairs`; estilos `disabled` e utilitários de botão podem agravar. `FindError` usa tachado no erro, a revisar por legibilidade. `Reorder` e `FillBlank` têm `text-transparent` usado como placeholder: não remover indiscriminadamente.

Causa: bloqueio de interação confundido com redução da legibilidade. Animação inicial pode usar opacidade transitória, mas não deve manter conteúdo ilegível. É necessário conferir estilos computados em light/dark, não apenas classes.

### B5 — regressão adicional no mesmo fluxo

`FeedbackSheet.continuar` inicia timer de 700 ms quando mostra XP. Segundo clique pode avançar imediatamente e o timer avança de novo depois. Não há limpeza suficiente para garantir chamada única. Deve entrar na mesma correção crítica porque afeta resposta/XP/índice.

## 4. Correções propostas

### 4.1 Snapshot por interação

Escolher a frase dentro de `submit`/`verify` após validar a resposta e antes de publicar o feedback. Guardar texto e ID no estado da interação, não apenas o slot. Passar `message` ao `FeedbackSheet`; remover qualquer sorteio de dentro desse componente. A próxima resposta cria novo `interactionId` e novo snapshot. Nova frase pode coincidir; variar não é requisito de correção.

Pseudocódigo normativo:

```text
ao verificar:
  se fase != answering ou trava sincrona ativa: retornar
  se resposta incompleta: retornar
  ativar trava sincrona
  corrigir usando resposta + ordem apresentada
  escolher mensagem UMA vez
  capturar questao, resposta e contexto do tutor
  registrar tentativa/recompensa uma unica vez
  publicar snapshot e fase feedback
  emitir som/haptico uma unica vez

ao continuar:
  se fase != feedback ou avanco ja consumido: retornar
  consumir avanco sincronamente
  avancar exatamente uma vez; limpar snapshot apenas ao entrar na proxima questao
```

Na correção mínima, guarda síncrona local/ref evita cliques no mesmo frame; estado React sozinho não basta. Persistência/idempotência entre recargas entra na fase 5. Remover o atraso obrigatório de 700 ms: XP pode aparecer no feedback sem segurar o avanço. Guardas permanecem necessárias mesmo sem timer.

Para frases decorativas, usar seleção determinística por dia local + slot ou snapshot criado no evento de entrada; nenhuma escrita em storage durante render. Para conclusão, capturar a frase no fechamento da sessão. Não disparar recompensa por montar componente.

### 4.2 Tutor somente por ação explícita

1. Remover chamada automática do ramo de erro em `study.tsx`.
2. Adicionar/manter CTA “Perguntar à Foca” no feedback de erro; explicação resumida continua vindo do conteúdo local.
3. Criar ação com nome explícito `openTutorWithContext` no store existente. Ela abre e fixa o snapshot da questão; não chama a API.
4. Migrar os CTAs de ambos os players para essa ação.
5. Remover `autoPrompt`, o efeito de consumo/envio e `askTutorAutomatically` quando não houver mais referências.
6. O chat pode oferecer sugestão preenchida, mas só enviar após clique do usuário na sugestão ou no botão de envio.
7. Separar contexto corrente do estudo (`currentFocus`) do contexto fixado da conversa (`conversationFocus`). Navegar não deve mudar o contexto de uma requisição já iniciada.
8. `focusFromExercise` deve representar respostas de ordenar/parear em texto com a ordem apresentada; adicionar `answered` e `wasCorrect`. `chosen=null` não pode significar “não respondeu” se houve array respondido.
9. IDs do contexto devem usar ID estável da questão/ lição, nunca título editorial como identidade permanente.
10. Resposta assíncrona permanece vinculada à conversa/requisição original; não aparece como explicação de outra questão.

### 4.3 Som de resposta na redação

No gesto de verificar, executar o mesmo caminho de som/háptico do estudo geral, uma vez após correção válida. Cobrir acerto e erro nos sete tipos. Não tocar ao selecionar opção, abrir resolução, renderizar feedback ou recarregar feedback persistido. Não adicionar assets inexistentes. Fase 2 centraliza o disparo; fase 4 melhora o motor e a assinatura.

### 4.4 Contrato visual das alternativas

| Estado | Superfície/borda | Texto e marcador | Interação |
|---|---|---|---|
| Default | Card opaco neutro, borda visível | Texto principal, marcador neutro | Selecionável |
| Selecionada | Superfície opaca com indicação azul, borda azul | Texto principal; seleção também identificável sem cor | Pode trocar antes de verificar |
| Correta escolhida | Superfície semântica opaca de sucesso | Texto de alto contraste + check + “Correta” | Bloqueada após envio |
| Incorreta escolhida | Superfície semântica opaca de erro | Texto de alto contraste + ícone + “Sua resposta”/“Incorreta” | Bloqueada |
| Correta após erro | Sucesso opaco com borda e check | Rótulo “Resposta correta”; sem apagar a errada | Bloqueada |
| Outras após validação | Neutra opaca | Texto legível, sem `opacity` no card | Bloqueadas |
| Desabilitada antes de poder responder | Neutra, aparência inativa por borda/cursor | Texto continua legível; motivo acessível quando necessário | Sem ação |
| Pressionada | Deslocamento/aresta, sem apagar conteúdo | Mesma cor de texto | Não muda gabarito |
| Transição | Transformação curta, sem estado final transparente | Conteúdo legível ao terminar | `prefers-reduced-motion` elimina deslocamento |
| Foco de teclado | Outline visível e não recortado | Não depende de hover | Ordem de foco previsível |

Texto normal: contraste mínimo 4,5:1; componentes/indicadores visuais relevantes: 3:1. `opacity:1` para cards e textos de resposta após validação. Não sobrepor `disabled:opacity` a esse contrato. Não fazer override global em todos os botões; aplicar às alternativas e ao feedback.

A cor semântica não garante contraste: cálculos estáticos da paleta auditada indicaram branco/sucesso `#2e9e5b` ≈ 3,41:1, branco/azul dark `#5c8cff` ≈ 3,16:1 e texto claro `#f3f1ec`/recompensa `#e8b23d` ≈ 1,71:1. Usar texto escuro quando apropriado e conferir o resultado computado nos dois temas. O feedback deve ter fundo composto opaco, não competir entre `sheet` e `bg-success/10` com transparência herdada.

## 5. Novo sistema de feedback

Separar quatro responsabilidades:

1. **Correção pura:** `checkAnswer`/adaptadores calculam resultado sem som, storage, animação ou API.
2. **Transação de domínio:** store registra tentativa, progresso e recompensa; retorna eventos efetivamente novos.
3. **Coordenação:** cria snapshot de copy/contexto e despacha som/háptico para eventos novos.
4. **Apresentação:** player e `FeedbackSheet` renderizam o snapshot e aceitam ações explícitas.

Contrato proposto `AnswerFeedback`: `interactionId`, `exerciseId`, `correct`, `messageId`, `messageText`, `explanation`, `chosenAnswerSnapshot`, `tutorFocusSnapshot`, `xpAwarded`. IDs e texto ficam estáveis durante a interação.

Máquina de estados: `answering → feedback → advancing → answering | completed`. `advancing` não é tempo de espera imposto: representa a trava da transição. Resposta incompleta não sai de `answering`. Fechar/abrir chat não altera essa máquina.

**NOVOS ARQUIVOS:** `src/lib/feedback/types.ts`, `create-feedback.ts`, `dispatch-feedback.ts` e `src/hooks/useExerciseSession.ts`. O hook não cria store concorrente: concentra transições compartilhadas; estado persistente continua em `store.ts`.

### Intensidade de feedback

| Nível | Evento | Visual/copy | Som |
|---|---|---|---|
| 0 | Navegar, selecionar opção, abrir resolução | Resposta direta da interface | Silêncio |
| 1 | Acerto/erro | Alternativa + explicação + frase curta | Assinatura curta de acerto/erro |
| 2 | Terceiro acerto consecutivo | Microcelebração pequena, uma vez por sessão | Variação curta; sem multiplicador de XP |
| 3 | Concluir bloco/meta | Recap, progresso e mascote | Uma resolução musical média |
| 4 | Nível, capítulo ou conquista relevante | Celebração maior, não obrigatória para avançar | Um som especial, até 1 segundo |

Em conclusão com múltiplas recompensas, selecionar apenas o som de maior prioridade: especial → level up → capítulo → meta diária → marco de streak → lição. Mostrar os outros resultados sem fila de jingles. Som de XP não toca para cada alteração numérica.

Feedback educacional explica o detalhe da questão; microcopy não substitui explicação. Não atribuir a causa do erro a “desatenção”, “interpretação” ou “falta de esforço” sem evidência.

## 6. Identidade sonora do Foca

### 6.1 Fundamento e limites

Sons reconhecíveis combinam repetição consistente, timbre, contorno e associação estável a um evento. Não é uma receita de “três notas = marca”. Pesquisa sobre sonic logos distingue reconhecimento e reprodução de memória; complexidade pode afetar essas tarefas de maneiras diferentes. Referência primária: [The Recall and Recognition of Sonic Logos](https://www.repository.cam.ac.uk/items/903c50f3-6d66-4721-af94-7c037073b139). A apresentação de marca da [Netflix](https://about.netflix.com/en/news/your-new-netflix-ident-animation-cue-netflix-sound) serve como exemplo de associação audiovisual, não como som a copiar.

A hipótese do Foca será validada por escuta. Não declarar originalidade jurídica, reconhecimento de marca ou melhora de aprendizagem sem avaliação.

### 6.2 Diagnóstico sonoro atual

`sfx.ts` sintetiza notas com Web Audio, osciladores/envelopes e fila temporal. Eventos atuais: `acerto`, `acerto3`, `erro`, `xp`, `fim`, `streak`, `marco`, `desbloqueio`, `pop`. A família atual usa principalmente dó maior; o erro tem timbre triangular grave. Há um contexto/master e fila sem política suficiente de cancelamento/expiração. `resume` não é aguardado com tratamento completo. Grande parte dos eventos definidos não tem integração real.

### 6.3 Direção proposta: “rabisco que encaixa”

Protótipo musical, não asset aprovado: **Ré5 → Lá5 → Fá#5**, uma quinta ascendente seguida de terça menor descendente. Frequências aproximadas: 587,33 Hz, 880 Hz, 739,99 Hz. Inícios em 0/70/125 ms; durações 65/50/110 ms; cauda total de aproximadamente 235 ms.

Timbre: núcleo suave senoidal, poucos harmônicos e ataque curto com sensação leve de madeira/lápis; sem estridência, voz da mascote ou imitação dos sons de referência. Envelope anti-clique e headroom no master. Testar no alto-falante do celular e em fones, não apenas monitor de estúdio.

| Evento | Variação proposta | Duração-alvo | Regra |
|---|---|---|---|
| Resposta correta | Motivo de 3 notas | 235 ms | Uma por validação |
| Resposta incorreta | Dois pulsos suaves de Ré4, sem buzzer | 140–170 ms | Menor volume percebido; nunca humilhante |
| Acerto consecutivo | Motivo + Ré6 discreto | 300–350 ms | No terceiro, uma vez por sessão |
| Conclusão de lição | Motivo resolvido e acorde leve | 550–650 ms | Suprimido por evento maior simultâneo |
| Level up | Motivo expandido | 700–850 ms | Uma vez por transição real |
| Conquista | Variação mais aberta | 800–900 ms | Só conquista nova |
| Streak diário | Ré5–Fá#5 | 220–280 ms | Não em toda resposta |
| Marco de streak | Motivo expandido | 600–750 ms | Marcos definidos, não cada dia |
| Capítulo desbloqueado | Motivo com abertura final | 350–450 ms | Evento único |
| Meta diária | Motivo concluído | 450–550 ms | Uma vez por dia/meta |
| Abertura importante | Fragmento do motivo | Até 180 ms | Apenas ocasião relevante, iniciada pelo usuário |
| Recompensa especial | Versão completa | Até 1 s | Rara; não som padrão de toda conquista |

### 6.4 Contrato técnico de áudio

**NOVOS ARQUIVOS:** `src/lib/audio/identity.ts` e `engine.ts`. Manter `src/lib/sfx.ts` como fachada de compatibilidade até migrar todos os consumidores.

APIs propostas: `unlockAudioFromGesture`, `playFeedbackSound`, `stopAllFeedbackSounds`, `setAudioEnabled`, `selectHighestPrioritySound`.

- Um `AudioContext`; criação só em browser, desbloqueado por gesto.
- Aguardar/tratar `resume`; indisponibilidade é silenciosa, sem impedir a questão.
- Evento de resposta atrasado mais de 300 ms é descartado, não tocado sobre a próxima questão.
- Recompensa pode aguardar no máximo 500 ms; sem fila indefinida.
- Mute cancela fontes agendadas e faz fade de até 30 ms; teste admite cessação em até 50 ms.
- Ao ocultar aba/sair da sessão, cancelar sons pendentes; voltar não reproduz fila antiga.
- Preferências de som e háptico são independentes; ausência de vibração no dispositivo não é erro.
- Não tocar som de erro no lugar de erro de rede; não usar Web Audio como requisito de navegação.
- Nenhuma nova dependência ou amostra de áudio no MVP; considerar assets somente após escuta e decisão documentada.

Piloto exploratório com 8 participantes e sequência de 50 respostas: pelo menos 7/8 distinguem acerto/erro; incômodo mediano ≤ 2/5; pelo menos 6/8 identificam a família Foca entre quatro famílias após intervalo; sem distorção audível nos dispositivos testados. Esses limiares são gates internos, não validação estatística de marca.

Referência técnica: [MDN — boas práticas Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).

## 7. Brand Voice e revisão da copy

### 7.1 Diagnóstico e direção

Não existe lista de palavras que prove autoria por IA. Estudos de variação estilística de LLMs identificam padrões agregados; não autorizam tratar travessão, frase correta ou um emoji como detector. Referência: [Reinhart et al., Linguistic variation and large language models](https://arxiv.org/abs/2410.16107). Para o Foca, o problema é editorial: texto genérico, entusiasmo constante, repetição e explicações que não ajudam.

Personalidade: colega de estudo atento, direto, que entende a dificuldade sem dramatizar. Não é professor dando sermão, coach ou adolescente performático.

| Aspecto | Regra |
|---|---|
| Vocabulário | Palavras comuns, verbos concretos, termos técnicos explicados quando necessários |
| Informalidade | “Você”, “vamos”, frases naturais; sem gíria forçada |
| Humor | No máximo uma ocorrência por sessão; sobre a mascote/situação, nunca capacidade do aluno |
| Emoji | Não usar em controles, erros, explicações ou alertas; excepcional em celebração editorial |
| Exclamações | Sem sequência de exclamações; celebrar não exige exclamar |
| Correção | Dizer o que muda na resposta, não julgar o aluno |
| Acerto | Confirmar de modo curto; valorizar progresso específico quando houver dado |
| Retorno | Convidar a retomar sem culpa, ameaça ou cobrança pela ausência |
| Tutor | Resposta inicial de até quatro frases; detalhar se pedido; sem piada obrigatória |

Tamanhos-alvo: botão 1–4 palavras; feedback 2–7 palavras; fala decorativa até 14 palavras; explicação curta 25–55 palavras; card de ensino 15–35 palavras. São diretrizes de edição, não truncamento cego de conteúdo pedagógico.

Exemplos de direção: acerto “Isso. Resposta certa.” / “Boa. É por aí.” / “Essa fechou.”; erro “Vamos por partes.” / “O detalhe está aqui.”; retorno “Vamos de onde você parou?”; CTA “Perguntar à Foca”; recuperação de rede “Não consegui responder agora. Tente de novo.” Não usar “Você domina isso!” com uma resposta, “Foi só desatenção” sem evidência ou “Continue assim!” como biblioteca inteira.

### 7.2 Inventário obrigatório antes de substituir textos

**NOVO ARQUIVO:** `docs/21-brand-voice-e-inventario-copy.md`, a criar na fase 3. Colunas: ID, arquivo/componente, estado/gatilho, texto atual, texto proposto, limite, dado necessário, risco, revisão/aprovação. Centralização funcional em **NOVO ARQUIVO** `src/lib/copy.ts`; falas da mascote continuam no catálogo `voz.ts`, com seleção fora do render.

Cobrir todas as rotas, `AppShell`, tutor, feedback, celebração, estados vazios/erro/loading, perfil, notificações locais, acessibilidade, landing ativa em `docs/brand/`, prompt e fallback. Cobrir também enunciados/explicações do conteúdo, mas como revisão editorial separada: não fazer substituição global que mude gabarito ou significado. `docs/_arquivo-abroad/` permanece arquivo histórico, não produto ativo.

Revisar `docs/15-mascote-e-voz.md` para retirar prescrições incompatíveis e `docs/16-gamificacao-e-dopamina.md` para não justificar comportamento com “dopamina” genérica. Não mudar nomes de IDs, categorias ou código ao trocar rótulos visíveis.

## 8. Arquitetura das microlições

### 8.1 Unidade pedagógica

Uma microlição ensina uma habilidade explícita. Sequência padrão:

1. Conceito: explicação simples do que o aluno precisa entender.
2. Exemplo resolvido ou visual que materializa o conceito.
3. Checkpoint simples com explicação imediata, sem “domínio” ou XP por resposta.
4. Insight curto somente se necessário; contar dentro do limite de ensino.
5. Duas questões de prática, distintas do checkpoint.
6. Recap de uma ou duas frases e próximo passo.

Limite inicial: até três blocos explicativos e aproximadamente 100 palavras de ensino, excluindo texto necessário das questões. Explicação de 30–90 segundos; tempo de prática separado. Estimativas são metadados revisáveis, não contagem regressiva nem motivo para pular explicações. Se o objetivo não couber, dividir a lição; não comprimir até ficar incorreta.

### 8.2 Hierarquia

**Matéria → capítulo → microlição → blocos/checkpoint/prática/recap.** Habilidades são identificadores transversais; vestibular é perfil de curadoria, não raiz que duplica todo conteúdo. Não acrescentar “tema → unidade → nível” se os níveis não tiverem função concreta.

### 8.3 Modelo de conteúdo proposto

`MicroLesson`: `id`, `version`, `subjectId`, `chapterId`, `title`, `objective`, `skillIds`, `prerequisiteLessonIds`, `examProfileIds`, `status` (`draft|reviewed|published`), `estimatedTeachingSeconds`, `estimatedPracticeSeconds`, `blocks`, `checkpointExerciseId`, `practiceExerciseIds`, `reviewExerciseIds`, `recap`, `sources`, `reviewedAt`.

Blocos discriminados: `concept`, `worked-example`, `comparison`, `diagram`. Renderização por componentes controlados, sem HTML/JS arbitrário vindo do conteúdo. Diagramas com legenda, descrição acessível e alternativa textual. Conteúdo não pode executar ações do store.

**NOVOS ARQUIVOS de conteúdo:**

- `src/content/curriculum.ts`: matérias, capítulos, habilidades e ordem de lições.
- `src/content/microlicoes/index.ts`: catálogo publicado.
- `src/content/microlicoes/biologia/citologia.ts`: membrana plasmática e organelas.
- `src/content/microlicoes/matematica/porcentagem.ts`: valor percentual e aumento/desconto.
- `src/content/microlicoes/portugues/crase.ts`: fusão de preposição/artigo e casos proibidos.

Piloto: seis lições; cada uma com 1 checkpoint, 2 questões de prática e 2 itens de revisão, total de 30 posições de exercício. Reuso de questão existente exige revisão e adequação à habilidade; não reutilizar automaticamente o mesmo item como evidência de retenção após acabá-lo de mostrar.

### 8.4 Ilustrações e carga editorial

Usar SVG/HTML acessível e linguagem Rabisco, não apresentação escolar tradicional. Biologia: processo simplificado; geografia: mapa/gráfico com fonte; história: linha do tempo; química: estrutura/processo; física: esquema de forças; matemática: representação quantitativa; literatura: relação autor/obra/movimento. Só o piloto precisa de assets nesta fase. Não gerar uma ilustração decorativa por card nem exigir pipeline de imagem IA.

Um visual deve explicar uma relação que seria mais difícil em texto. Cor nunca é a única codificação. Movimento opcional, pausável quando necessário e removido por reduced motion. Fonte de conteúdo e direitos de uso devem ser registrados.

## 9. Sistema de questões

Manter `Exercise` e o registry; adaptar `Question` do banco geral ao contrato comum. Correção continua algorítmica e local.

| Papel | Funcionamento | Feedback/ajuda | Conta como evidência? |
|---|---|---|---|
| Diagnóstico | Poucos itens de dificuldade graduada antes de personalização | Resultado ao terminar; não ensinar antes de medir o mesmo item | Sim, se resposta independente; fase seguinte |
| Checkpoint | Verifica conceito recém-explicado | Imediato, com ajuda livre | Compreensão imediata, não retenção/domínio |
| Prática | Aplica a habilidade em item diferente | Imediato; tutor opcional | Sim se primeira resposta independente |
| Revisão | Recupera conteúdo após intervalo | Responder antes de ver explicação | Sim, elegível para retenção |
| Desafio | Integra habilidades em problema mais difícil | Explicação após envio; opcional | Separar dificuldade de erro básico |
| Simulado | Bloco próximo da experiência de prova | Sem ajuda durante; correção ao final | Separado de treino; futuro |

Metadados propostos por exercício: ID estável, versão, matéria/tópico/habilidades, formato, dificuldade editorial, papéis permitidos, fonte/autoria/ano quando conhecidos, estado de revisão, explicação, tags de erro somente quando justificadas pelos distratores. Ausência de fonte significa autoral/fonte não verificada, não “questão oficial”.

**NOVO ARQUIVO:** `src/content/exercise-ids.ts`: mapeamento explícito dos exercícios legados para IDs estáveis. Congelar relação ID da lição + posição original → ID do exercício; não recalcular identidade ao reordenar ou renomear. Duplicação intencional de um item deve apontar ao mesmo ID, não gerar evidências artificiais de diversidade.

`presentedOrder` deve ser salvo para ordenar/parear. Checagem, tutor e retomada usam a mesma ordem. Mudança editorial relevante incrementa versão; não reinterpretar tentativa antiga com novo gabarito. Validar índices, alternativas, lacunas, pares e referências antes de publicar.

## 10. Dicas de vestibular

**NOVOS ARQUIVOS:** `src/data/exams.ts`, `src/content/exam-tips.ts`, `src/lib/learning/tips.ts`, `src/components/learning/ExamTipCard.tsx`.

Modelo `ExamTip`: ID/versão, perfil de prova, etapa/ciclo quando necessário, habilidades/tags, categoria, texto, fonte, data de revisão, validade, prioridade. Categorias: estratégia, gestão de tempo, interpretação, eliminação, erro comum e características verificadas da prova.

Regras fechadas do MVP:

1. Aparecer somente inline no recap após concluir o bloco; nunca no meio da resposta, modal ou tela obrigatória.
2. Máximo de uma dica espontânea por dia local; não repetir o mesmo ID por 14 dias.
3. Botão dispensar e preferência global `showExamTips`; sem timer para avançar.
4. Filtrar por perfil explicitamente escolhido; nenhuma dica específica se o perfil não for conhecido.
5. Para PAS, etapa e ciclo devem corresponder. Não deduzir vestibular apenas da universidade-alvo.
6. Filtrar validade editorial antes de ranquear; nenhuma dica elegível significa mostrar nada.
7. Ordem determinística: relação com habilidade da lição, prioridade editorial, ID para desempate.
8. Dica solicitada pelo usuário pode ignorar limite diário, mas não validade/perfil.
9. Desempenho entra na fase seguinte: pelo menos dois erros em itens distintos com tag editorial compatível; não inferir “erro de interpretação” de qualquer erro.

Não transformar exemplos informais em alegações oficiais. Revisar referências do [Inep](https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem) e do [PAS/UnB — Cebraspe](https://www.cebraspe.org.br/pas-unb/) antes de publicar conteúdo específico; obras e regras de ciclos podem mudar.

## 11. Trilha de aprendizado

Princípio aproveitado: posição atual e próximo passo legíveis. O caminho do Duolingo documenta organização guiada e prática distribuída; isso não exige copiar curvas, personagens ou bloqueios. Referências primárias consultadas: [home/path](https://blog.duolingo.com/new-duolingo-home-screen-design/) e [mini-units](https://blog.duolingo.com/intermediate-mini-units/). Não tratar a UI de qualquer marca como especificação fixa do Foca.

Layout proposto: caderno vertical de capítulos, com poucos nós visíveis, resumo de capítulo e CTA para retomar. Capítulos colapsáveis evitam uma trilha infinita. XP fica secundário; a primeira informação é o que estudar agora.

Estados são dimensões independentes:

- Disponibilidade: `available|locked`.
- Conclusão: `not-started|in-progress|completed`.
- Evidência: `unmeasured|learning|consistent`.
- Revisão: `not-due|due`.

Uma lição pode estar concluída e precisar de revisão. Não apagar o check nem rotular “esquecido” apenas porque passou tempo. Na UI, “Revisão sugerida”, não “Você perdeu seu domínio”.

Regras de acesso: primeira lição de cada capítulo introdutório disponível; dentro do capítulo, conclusão desbloqueia a seguinte, sem exigir 100%. Revisão não relocka conteúdo. Capítulos avançados podem declarar pré-requisitos explícitos no currículo, sem ciclos. Desafio opcional de capítulo com três questões; sem vidas ou perda de XP. Atalho diagnóstico para quem já sabe fica para evolução.

**NOVOS ARQUIVOS:** `src/routes/trilha.tsx`, `src/components/learning/LearningPath.tsx`, `ChapterCard.tsx`, `LessonNode.tsx`. Preservar `/study`, `/redacao` e `/redacao/$licaoId`; quando habilitada, a entrada “Estudar” pode apontar à trilha, mantendo prática rápida acessível. `/learn/$lessonId` será a rota nova do player de microlição.

## 12. Progressão e gamificação

O usuário deve entender três coisas: o que concluiu, o que consegue fazer com evidência e o próximo passo útil. XP mede atividade/recompensa, não conhecimento nem nota prevista.

### Política de XP

Na fase 1 não alterar a economia: geral 15/5; redação por melhor faixa 10/20/30. Corrigir apenas duplicação acidental. Na fase 11:

- Nova microlição: 10/20/30 XP por conclusão, usando apenas prática para a faixa; checkpoint não dá XP. Mesmos limiares 70/90 do legado.
- Replay de microlição: somente diferença para melhor faixa; nunca XP integral repetido.
- Revisão devida: 5 XP por sessão/ocorrência de agendamento concluída, uma vez. Não por abrir card nem por criar sessões vazias.
- Desafio opcional: 10/20/30 pela melhor faixa, sem bônus duplicado de lição + desafio.
- Questão geral legada: teto vitalício de 15 por item; primeira errada concede 5, melhorar para correta concede diferença de 10. Repetições não concedem mais.
- Migração: XP total anterior é preservado; questões já concluídas recebem teto consumido no ledger, sem tentar reconstruir histórico inexistente ou retirar XP.
- Bônus de onboarding é único. Não conceder bônus novamente por reabrir/refazer `/quiz`.

### Meta, streak e níveis

Unidade diária: **blocos concluídos**, não apenas aulas gerais. Contam estudo geral concluído, redação, microlição ou sessão de revisão. Checkpoint, abrir tutor, assistir card sem concluir e abrir aplicativo não contam. Flashcards: sessão de até três itens devidos; se só houver um ou dois, concluir todos conta como um bloco. Sessão vazia não conta.

Novo usuário: meta inicial de um bloco; manter escolha explícita de usuários existentes. Mostrar “blocos” onde houver mistura de formatos. Contagem é única por `sessionId`; metas e streak usam a data local de conclusão. Streak avança no máximo uma vez por dia. Preservar política atual de congelamento (estoque inicial 1, máximo 2), mas trocar cálculo por contador explícito `activityDaysSinceFreezeAward`, independente do histórico limitado a 60 dias.

Preservar limiares atuais de nível no MVP. Não criar moedas, vidas, multiplicadores aleatórios, compras de progresso ou ranking competitivo real nesta entrega. Ranking demonstrativo continua identificado como tal.

## 13. Possibilidades de aprendizado adaptativo

### MVP: regras locais transparentes

Recomendação única usada tanto pelo dashboard quanto pelo início da sessão:

1. Retomar sessão válida não concluída.
2. Se houve pelo menos dois erros distintos na mesma habilidade, oferecer revisão explicativa curta (máximo uma sugestão de remediação por sessão; pode ignorar).
3. Revisão devida elegível.
4. Próxima lição disponível da trilha escolhida.
5. Introdução de dificuldade declarada pelo usuário, se houver conteúdo curado.
6. Introdução geral elegível; nunca prometer tópico diferente do realmente iniciado.

Guardar `reason` da recomendação para explicar “Por que esta lição?”. Não há chamada de IA para decidir a próxima questão. Repetir imediatamente o mesmo enunciado não conta como evidência nova.

### Evidência de consistência, não “domínio certificado”

Estado `consistent` exige: pelo menos cinco exercícios distintos elegíveis; pelo menos duas datas locais; acerto em pelo menos quatro dos últimos cinco itens elegíveis; ao menos uma revisão correta após intervalo ≥ 24 h. Tentativa com dica/tutor é assistida e não serve como evidência independente. Checkpoint não mede retenção. Sem esse conjunto, mostrar “Em prática” ou “Pouca evidência”, com denominador quando exibir percentual. Esses são critérios heurísticos do produto, não modelo psicométrico validado.

Revisão de habilidades: intervalos 1, 3, 7 e 14 dias; erro volta ao intervalo de 1 dia; explicação imediata é remediação, não revisão espaçada bem-sucedida. Aplicar essa agenda às novas revisões de habilidade; não sobrescrever silenciosamente os registros de flashcards legados, que têm agenda própria.

### Evolução e futuro

Evolução: diagnóstico real, pular fundamentos demonstrados, dicas por erro editorial, prova próxima com data informada/verificada e pesos curriculares revisados. Futuro: sincronização, modelos calibrados e experimentos controlados. Não prever nota, inferir estado emocional ou usar “conteúdo esquecido” como fato sem dados.

Fundamento pedagógico: recuperação ativa, espaçamento e exemplos resolvidos seguidos de prática são direções sustentadas por pesquisa; não garantem ganho para esta implementação sem medir. Referência: [IES — Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1).

## 14. Arquitetura técnica necessária

### 14.1 Arquivos novos planejados e responsabilidades

Todos os arquivos abaixo são **NOVOS ARQUIVOS de implementação futura**, salvo o documento presente:

| Caminho proposto | Papel |
|---|---|
| `src/lib/feedback/types.ts` | Contratos de feedback/eventos |
| `src/lib/feedback/create-feedback.ts` | Snapshot criado no evento; seleção injetável para teste |
| `src/lib/feedback/dispatch-feedback.ts` | Coordenação de som/háptico por evento único |
| `src/hooks/useExerciseSession.ts` | Transições de resposta compartilhadas |
| `src/lib/audio/identity.ts` | Motivos, envelopes e variantes |
| `src/lib/audio/engine.ts` | Contexto, fontes, mute, prioridades, expiração |
| `src/lib/copy.ts` | Copy funcional por IDs |
| `src/lib/learning/types.ts` | Currículo, sessão, tentativa, evidência, revisão, dica |
| `src/lib/learning/validate.ts` | Validação de conteúdo e referências |
| `src/lib/learning/adapters.ts` | Ponte banco geral/Exercise e IDs legados |
| `src/lib/learning/selectors.ts` | Progresso, acesso e contagens derivados |
| `src/lib/learning/recommend.ts` | Recomendação determinística e reason |
| `src/lib/learning/review.ts` | Agenda e elegibilidade de revisão |
| `src/lib/learning/tips.ts` | Elegibilidade, frequência e seleção de dicas |
| `src/lib/state-migrations.ts` | Leitura validada, defaults e migração preservadora |
| `src/lib/features.ts` | Flags locais de rollout; não novo serviço remoto |
| `src/hooks/useLearningSession.ts` | Orquestração persistente da microlição |
| `src/components/learning/MicroLessonPlayer.tsx` | Sequência ensino/checkpoint/prática/recap |
| `src/components/learning/LearningBlock.tsx` | Renderização discriminada de blocos |
| `src/components/learning/LearningDiagram.tsx` | Diagramas controlados e acessíveis |
| `src/components/learning/ExamTipCard.tsx` | Dica inline dispensável |
| `src/components/learning/LearningPath.tsx` | Mapa geral |
| `src/components/learning/ChapterCard.tsx` | Resumo expansível de capítulo |
| `src/components/learning/LessonNode.tsx` | Estados ortogonais da lição |
| `src/content/exercise-ids.ts` | Identidade congelada dos exercícios legados |
| `src/content/curriculum.ts` | Capítulos/habilidades/relações |
| `src/content/exam-tips.ts` | Dicas revisadas/versionadas |
| `src/content/microlicoes/index.ts` | Catálogo piloto publicado |
| `src/content/microlicoes/biologia/citologia.ts` | Duas lições piloto |
| `src/content/microlicoes/matematica/porcentagem.ts` | Duas lições piloto |
| `src/content/microlicoes/portugues/crase.ts` | Duas lições piloto |
| `src/data/exams.ts` | Perfis, etapas/ciclos, sem confundir instituição e exame |
| `src/routes/learn.$lessonId.tsx` | Rota do player novo |
| `src/routes/trilha.tsx` | Rota da trilha nova |
| `src/components/ds/SoundToggle.tsx` | Controle reutilizável, se o controle existente não for reaproveitável |
| `docs/21-brand-voice-e-inventario-copy.md` | Inventário editorial e decisões da fase 3 |
| `docs/22-validacao-piloto-aprendizagem.md` | Evidência de validação da fase 12 |

Reaproveitar `AppShell`, `PhoneFrame`, `FocaMark`, `BottomSheet`, `ProgressBar`, `XpChip`, `GoalRing`, `StatTile`, `FeedbackSheet`, `CelebracaoAula`, registry e views. Refatorar, não duplicar um segundo motor de questões. A rota nova não deve montar duas instâncias de `TutorBubble`.

### 14.2 Fronteiras e segurança

- Não colocar dados de sessão dentro dos arquivos de conteúdo; conteúdo é imutável/versionado.
- Não chamar áudio ou API em seletores, render ou funções de correção.
- Persistência no store existente; hooks controlam fluxo, não criam storage paralelo.
- Inicialização explícita antes do redirect de `index.tsx`; proteger acesso a browser no SSR.
- Tutor continua server-side; segredo nunca no bundle. Validar entrada com a infraestrutura disponível, limitar mensagens/contexto/anexos e tratar fallback como fallback, não resposta gerada.
- Definir limite de imagem no servidor e no cliente antes de habilitar envio ampliado; proposta inicial 5 MiB por arquivo, PNG/JPEG/WebP, verificação real de tipo e tamanho. Não persistir base64 no histórico de aprendizado.
- Requisições têm ID e snapshot próprio; cancelamento/descarte quando obsoletas. Conteúdo do usuário e enunciado são dados, não instruções privilegiadas para o tutor.
- Não acrescentar analytics externo ou coleta de dados de alunos sem escopo/autorização específicos.

## 15. Alterações de dados/backend

### 15.1 Backend do MVP

Nenhum banco novo. Única API externa continua sendo o tutor já existente; nenhuma chamada automática nova. A principal mudança de schema é local. Autenticação real, pagamento e sincronização são escopo futuro separado.

### 15.2 Schema local proposto

Manter a chave `foca.state.v3` para compatibilidade, adicionando `schemaVersion: 4` ao objeto. Não confundir nome da chave com versão interna. Antes da primeira migração, salvar cópia exata em `foca.state.backup.before-learning-v4`, apenas se ainda não existir.

Adicionar:

```text
prefs.examTargets[]: examId, stage?, cycle?, examDate?
prefs.showExamTips: boolean
learning.activeSession: LearningSession | null
learning.completedLessons: mapa por lessonId/version
learning.skillEvidence: mapa por skillId
learning.reviewSchedule: agenda por habilidade/conteudo
learning.recentAttempts: tentativas recentes limitadas
learning.rewardLedger: chaves de idempotencia e tetos pagos
learning.tipHistory: vistos/dispensados e data local
progress.activityDaysSinceFreezeAward: number
progress.today.completedBlockIds: string[]
```

`Attempt`: ID, sessionId, exerciseId/version, subjectId/topicId/skillIds, role, answer, presentedOrder, correct, hintUsed, tutorUsed, firstSubmission, submittedAt, localDate, durationMs. Não salvar imagens do tutor aqui. Não inventar duração/data de tentativa antiga.

`LearningSession`: ID, contentId/version, kind, phase, blockIndex, exerciseIndex, exerciseIds, answers, presentedOrders, feedbackSnapshot, startedAt, updatedAt, completedAt. Uma sessão ativa por dispositivo no MVP. Na retomada, restaurar ordem e feedback sem repetir efeitos/recompensas.

Limites iniciais: 500 tentativas recentes, 20 evidências recentes por habilidade, 100 entradas de dicas. Agregados e ledger de recompensa não podem depender da retenção desses arrays: podar histórico nunca libera XP de novo. Não eliminar IDs de conclusão nem melhor resultado para economizar espaço.

### 15.3 Ordem obrigatória da migração

1. Ler v3; se ausente, tentar fallback v2 existente.
2. Fazer parse protegido; validar tipos e estrutura básica sem confiar no cast TS.
3. Preservar XP, preferências, lições concluídas, flashcards, streak e histórico conhecidos.
4. Criar backup antes da escrita; não sobrescrever backup existente.
5. Aplicar defaults aditivos; mapear perfis conhecidos, sem inferir PAS/etapa/ciclo de faculdade.
6. Marcar questões legadas concluídas como teto já consumido; não recalcular XP passado.
7. Deixar evidência nova vazia quando não houver dados suficientes; conclusão legada não prova retenção.
8. Validar objeto migrado; gravar apenas versão válida.
9. Em quota/erro de escrita, preservar o estado anterior, permitir sessão em memória e informar que não foi possível salvar. Não anunciar persistência bem-sucedida.
10. Rodar migração duas vezes e comprovar resultado idempotente. Estado com versão futura desconhecida não deve ser sobrescrito por versão antiga.

Inicialização deve preceder splash/redirecionamento. Ao detectar mudança externa via evento `storage`, evitar duas sessões escrevendo simultaneamente: informar conflito e pedir retomada da versão mais recente; não prometer sincronização transacional entre abas. Rollback de flag não apaga campos nem backup.

### 15.4 Possível schema remoto futuro, não executar

Entidades candidatas: usuários/preferências, conteúdo versionado, sessões, tentativas, evidências por habilidade, agenda de revisão e recompensas com chave única de idempotência. O fornecedor de banco, autenticação e política de privacidade ainda precisa de decisão. Não criar SQL, Supabase ou endpoints de sincronização nesta entrega por inferência.

## 16. Plano por fases

As fases abaixo são tarefas futuras. Nenhum checkbox de execução está concluído por este documento ter sido escrito.

### Fase 0 — Baseline, reprodução e infraestrutura de teste

**Prioridade:** P0, habilitadora. **Impacto:** alto. **Complexidade:** média. **Risco:** baixo.

**Objetivo e motivo:** tornar os bugs reproduzíveis e separar defeitos existentes de regressões. Atual: auditoria estática e ausência de testes do app. Esperado: casos reproduzíveis, inventário confirmado e testes de regressão inicialmente falhando pelo motivo correto.

**Arquivos/componentes:** `package.json`, `bun.lock`, `eslint.config.js`, os dois players, `FeedbackSheet`, `TutorBubble`, `src/styles.css`. Confirmar o nome da configuração ESLint antes de editá-la; não inventar config alternativa. **NOVOS ARQUIVOS:** `playwright.config.ts`, testes da seção 19 e fixtures legadas. Reutilizar app e servidor existentes; nenhum componente de produto novo.

**Estados/funções:** `phase`, `checked`, `answer`, `tutor.open`, `autoPrompt`, preferências de som, `submit`, `verify`, `continuar`, `fala`, `registrarResposta`, `completeLesson`. **APIs:** mockar transporte do tutor e engine de áudio; sem chamada paga nos testes. **Banco/schema:** nenhum; fixtures isoladas de localStorage.

**Ordem exata:**

1. Registrar `git status` e arquivos já modificados; não limpar worktree.
2. Conferir scripts e runtime. Usar Bun conforme convenção do repo; não introduzir novo lockfile ou trocar Netlify/runtime nesta fase.
3. Executar build, verificação TS e lint como baseline, registrando erros anteriores. Não rodar formatter global para “consertar” o repo.
4. Configurar testes unitários com `bun:test` e E2E com Playwright; dependências de desenvolvimento propostas: `@playwright/test` e `@axe-core/playwright`. Não adicionar Vitest além de Bun sem necessidade documentada.
5. Criar fixtures isoladas de usuário novo, v2, v3 e dados inválidos; nunca usar dados pessoais reais.
6. Reproduzir frase instável após 10 segundos, erro abrindo IA, falta de som da redação, baixa opacidade e clique duplo no avanço.
7. Capturar screenshots light/dark dos sete formatos; registrar viewport e estado de resposta.
8. Confirmar `q2` e retirar de qualquer seleção piloto até revisão; revisão do banco acontece na fase 5, salvo hotfix autorizado.

**Dependências:** nenhuma fase anterior. **Conflitos/riscos:** CRLF/formatação pode gerar ruído; lint em artefatos gerados pode mascarar resultado; excluir artefatos pela configuração, não apagar pastas indiscriminadamente. **Edge cases:** sem chave de API, CI sem áudio, browser com storage bloqueado.

**Testes/aceite da fase:** cinco reproduções com passos e evidência; testes do tutor interceptam e contam requisições; caso sonoro observa evento lógico, com teste perceptivo reservado a dispositivo; comandos baseline e falhas preexistentes documentados. Não marcar os bugs corrigidos nesta fase.

### Fase 1 — Correção crítica sem redesenhar o produto

**Prioridade:** P0. **Impacto:** alto. **Complexidade:** média. **Risco:** médio.

**Objetivo/motivo:** tornar confiável responder, ler feedback e continuar. Atual: render sorteia texto, erro abre/envia chat, redação não toca resposta e alternativas esmaecem. Esperado: snapshot estável, tutor manual, som consistente e respostas legíveis.

**Arquivos/componentes existentes:** `src/routes/study.tsx`, `src/components/lessons/FeedbackSheet.tsx`, `LessonPlayer.tsx`, `CelebracaoAula.tsx`, `src/components/TutorBubble.tsx`, `src/lib/store.ts`, `voz.ts`, `sfx.ts`, `haptics.ts`, `tutor-prompt.ts`, `src/lib/lessons/tutor-focus.ts`, todas as sete views e `shared.ts`, `src/styles.css`, `FocaSays.tsx`, `EmptyState.tsx`, `src/routes/__root.tsx`. Não criar outro componente de feedback; reutilizar os existentes.

**Estados:** snapshot local, trava de validação/avanço, `phase`, `checked`, `answer`, `currentFocus`, `conversationFocus`, `open`; retirar `autoPrompt`. **Funções:** `submit`, `verify`, `next`, `continuar`, `fala`, ação proposta `openTutorWithContext`, `focusFromExercise`, envio explícito do tutor. **APIs:** tutor existente só após envio; som/háptico existentes. **Banco/schema:** nenhum banco; mudança aditiva do estado do tutor com defaults compatíveis e descarte do `autoPrompt` legado, sem apagar histórico.

**Ordem exata:**

1. Escrever guardas de envio e avanço com ref síncrona + fase; resetar somente ao entrar na próxima interação.
2. Criar snapshot da frase em `submit` e `verify`; mudar a prop de `FeedbackSheet` e eliminar `fala` do render.
3. Remover timer de 700 ms; exibir XP sem travar leitura/avanço. Garantir que desmontagem não dispara callback tardio.
4. Remover disparo automático no erro; adicionar abertura manual com contexto fixado. Migrar botão de redação para a mesma ação.
5. Eliminar efeito de autoenvio e todas as referências funcionais a `autoPrompt`/`askTutorAutomatically`; tolerar campo antigo ao carregar storage sem executá-lo.
6. Corrigir representação de respostas compostas no contexto. Fixar contexto por envio e evitar substituição por navegação.
7. Integrar acerto/erro e háptico ao gesto de verificar da redação, respeitando preferências.
8. Aplicar tabela visual da seção 4 aos sete formatos e estudo geral; manter placeholders intencionais.
9. Fazer frases de conclusão/decorativas estáveis sem efeitos colaterais no render.
10. Rodar regressões A1–A6 e conferir teclado/reduced motion. Confirmar que XP legado não mudou fora da eliminação de duplicação.

**Dependências:** fase 0. **Conflitos/riscos:** React Strict Mode, reutilização do componente entre exercícios, dados do tutor legados e estilos utilitários concorrentes. **Edge cases:** duplo clique/Enter, último item, abrir/fechar resolução, chat já aberto antes do erro, troca de rota, som desligado, requisição anterior em voo.

**Testes/aceite:** A1–A6 completos; 20 cliques rápidos não registram múltiplas respostas nem pulam item; feedback não abre chat fechado e não envia mensagem quando chat já estava aberto; sete formatos têm acerto/erro e texto legível em ambos os temas.

### Fase 2 — Centralização de feedback e efeitos

**Prioridade:** P1. **Impacto:** alto. **Complexidade:** média. **Risco:** médio.

**Objetivo/motivo:** evitar nova divergência entre players. Atual após fase 1: correções locais corretas, mas responsabilidades ainda duplicadas. Esperado: contratos compartilhados de tentativa, snapshot e evento; UI não decide concessão nem toca som ao montar.

**NOVOS ARQUIVOS:** os três módulos `src/lib/feedback/` e `src/hooks/useExerciseSession.ts` da seção 14. **Existentes/reutilizados:** players, `FeedbackSheet`, `CelebracaoAula`, `store.ts`, `sfx.ts`, `haptics.ts`, motor/registry. **Estados/funções:** máquina `answering/feedback/advancing/completed`, `interactionId`, eventos únicos, `createFeedback` e `dispatchFeedback` propostos. **APIs:** apenas fachadas locais e envio manual já existente. **Banco/schema:** nenhum novo banco; IDs transitórios nesta fase, persistência integral na fase 5.

**Ordem exata:**

1. Definir tipos e responsabilidades sem mudar comportamento aprovado na fase 1.
2. Extrair criação do snapshot com seletor de mensagem injetável nos testes.
3. Extrair transições e guardas, preservando regras de correção de cada formato.
4. Fazer store retornar eventos de recompensa realmente novos; não disparar efeitos dentro de cálculos puros.
5. Migrar primeiro estudo geral, rodar regressões, depois redação e rodar novamente.
6. Mover som de `CelebracaoAula` do efeito de montagem para o evento de conclusão. A tela final deve ser apresentação de resultado já calculado.
7. Aplicar prioridade de celebrações da seção 5; não tocar todos os eventos acumulados.
8. Remover caminhos antigos de disparo após busca por todas as chamadas.

**Dependências:** fase 1. **Conflitos/riscos:** som duplicado por coexistência temporária de paths; generalizar demais a lógica de pares/ordenação; contagem de acertos stale no último item. **Edge cases:** zero XP em replay, conclusão com meta e nível simultâneos, remontagem em Strict Mode.

**Testes/aceite:** acerto/erro em ambos os players produz exatamente um evento; função de correção não toca storage/áudio/API; remontar celebração não concede XP nem reproduz som; testes A1–A6 continuam aprovados. Guardas locais não devem ser anunciadas como idempotência entre recargas antes da fase 5.

### Fase 3 — Brand Voice e revisão editorial

**Prioridade:** P1. **Impacto:** alto. **Complexidade:** média. **Risco:** médio, sobretudo semântico.

**Objetivo/motivo:** eliminar artificialidade e inconsistência sem mudar o significado do conteúdo. Atual: biblioteca de falas repetitiva e documentos com direções conflitantes. Esperado: voz específica, curta, respeitosa e inventário de todas as superfícies.

**NOVOS ARQUIVOS:** `src/lib/copy.ts`, `docs/21-brand-voice-e-inventario-copy.md`. **Existentes:** `voz.ts`, `tutor-prompt.ts`, `TutorBubble`, todas as rotas/componentes com texto, `src/data/questions.ts`, `src/content/trilhas/`, `docs/15-mascote-e-voz.md`, `16-gamificacao-e-dopamina.md`, landing ativa em `docs/brand/`. Reutilizar componentes; não redesenhar telas como pretexto.

**Estados/funções:** texto por ID/slot/estado; nenhuma mudança de fluxo. Ajustar prompt e fallback com a mesma direção. **APIs:** transporte existente, sem novo provedor; testes de prompt/fallback podem ser locais. **Banco/schema:** nenhum; IDs de conteúdo preservados.

**Ordem exata:**

1. Inventariar textos por arquivo, estado e propósito; separar interface, mascote, conteúdo pedagógico e textos históricos.
2. Registrar regras da seção 7 e marcar proibições do guia antigo como substituídas.
3. Revisar primeiro erro/acerto/retorno/saída/tutor; depois onboarding, dashboard, progresso e telas auxiliares.
4. Centralizar copy funcional e ajustar falas, sem mover sorteio de volta ao render.
5. Revisar prompt/fallback; usar métricas reais e explicar indisponibilidade, sem inventar desempenho.
6. Revisar conteúdo pedagógico por lote; mudanças semânticas exigem versão/revisão e teste de gabarito, não replace global.
7. Conferir textos acessíveis, truncamento a 320 px, zoom 200% e quebra de linha dos CTAs.
8. Atualizar inventário com status aprovado/pendente e evidência; não declarar os 1.204 itens revisados sem revisão individual.

**Dependências:** fase 1 para estabilidade das mensagens; fase 2 para integração final. **Riscos/conflitos:** apagar especificidade das explicações ao encurtar, humor inadequado, alterar identidade de conteúdo por renomeação. **Edge cases:** zero progresso, retorno após ausência, muitas respostas erradas, fallback sem rede.

**Testes/aceite:** todas as superfícies funcionais inventariadas; nenhuma frase de erro culpa o usuário; nenhuma métrica sem dado; nenhum CTA truncado nos viewports-alvo; conteúdo não revisado explicitamente marcado como pendente; o guia antigo aponta à direção nova.

### Fase 4 — Motor e identidade sonora

**Prioridade:** P2 para nova assinatura; P1 para cancelamento/mute. **Impacto:** médio. **Complexidade:** média. **Risco:** médio.

**Objetivo/motivo:** uma família reconhecível e repetível sem fadiga. Atual: sons sintetizados genéricos e fila sem cancelamento robusto. Esperado: assinatura proposta, prioridades, unlock e silêncio confiáveis.

**NOVOS ARQUIVOS:** `src/lib/audio/identity.ts`, `engine.ts`; `src/components/ds/SoundToggle.tsx` somente se necessário. **Existentes:** `sfx.ts`, `haptics.ts`, `store.ts`, `profile.tsx`, dispatcher de feedback criado na fase 2, celebração/dashboard. **Estados/funções:** contexto único, fontes agendadas, timestamps, habilitação, prioridade; APIs da seção 6. **APIs externas/banco/schema:** nenhuma; reutilizar `prefs.sound`/`prefs.haptics`.

**Ordem exata:**

1. Isolar engine da partitura; preservar fachada `sfx` para migração gradual.
2. Implementar unlock, resume protegido, controle de fontes e expiração antes de trocar timbres.
3. Implementar mute/cancelamento em visibilidade e saída; separar háptico de áudio.
4. Prototipar motivo de três notas e erro; testar clipping/volume percebido em celular/fone.
5. Integrar primeiro resposta e conclusão; adicionar eventos raros somente quando o evento de domínio existir.
6. Aplicar prioridade única e limite de repetição da variação de sequência.
7. Rodar piloto sonoro; ajustar timbre/volume/duração, não a economia de XP.
8. Registrar resultado e parâmetros aprovados; se a assinatura falhar, manter áudio funcional anterior sem bloquear correções críticas.

**Dependências:** fase 2; copy visual alinhada à fase 3. **Riscos:** autoplay mobile, latência, várias instâncias de AudioContext, sons tardios, fadiga. **Edge cases:** aba oculta, mute durante som, fone desconectado, contexto suspenso, navegador sem vibração, evento de reward e acerto concorrentes.

**Testes/aceite:** A6; som mudo não agenda novas fontes; eventos expirados não tocam; um som de conclusão mesmo com vários marcos; teste real iOS e Android; gates exploratórios de escuta registrados. API indisponível não impede concluir lição.

### Fase 5 — Contratos de conteúdo, IDs e migração de estado

**Prioridade:** P1. **Impacto:** alto. **Complexidade:** alta. **Risco:** alto por persistência.

**Objetivo/motivo:** suportar ensino e revisão sem perder dados. Atual: dois modelos, IDs de exercícios implícitos e métricas insuficientes. Esperado: adapters, identidade/versionamento, sessões/tentativas e migração testada.

**NOVOS ARQUIVOS:** `src/lib/learning/types.ts`, `validate.ts`, `adapters.ts`, `selectors.ts`, `src/lib/state-migrations.ts`, `src/lib/features.ts`, `src/content/exercise-ids.ts`, `src/content/curriculum.ts`. **Existentes:** `store.ts`, `src/lib/lessons/types.ts`, `define.ts`, `registry.ts`, `tutor-focus.ts`, `questions.ts`, `subjects.ts`, `src/routes/index.tsx`, `__root.tsx`.

**Estados/funções:** schema da seção 15, inicialização explícita, migração, registro de tentativa/transação, ledger, validação de currículo. **APIs:** storage local e eventos do browser; tutor usa ID estável. **Banco/schema:** schemaVersion 4 aditivo na chave atual; nenhum SQL/backend.

**Ordem exata:**

1. Criar fixtures dos dados atuais e testes que preservam todos os campos históricos.
2. Definir tipos, limites, versionamento e chaves de idempotência antes de alterar leitores.
3. Congelar mapa dos exercícios legados; adaptar banco geral e motor sem editar os 1.204 exercícios em massa.
4. Corrigir/quarentenar `q2`; normalizar tópicos via mapeamento explícito; validar todos os índices e referências.
5. Implementar migração, backup e tratamento de versão futura/storage indisponível.
6. Hidratar store antes de redirect; manter proteção SSR e leitura de tema compatível.
7. Adicionar transação única de tentativa + progresso + ledger, com sessão/ocorrência estável.
8. Implementar seletores puros de acesso/conclusão/contagem; só publicar currículo validado.
9. Testar poda de histórico, quota, dois carregamentos consecutivos e rollback de flags sem perder dados.

**Dependências:** fases 1 e 2; metadados editoriais combinados com fase 3. **Conflitos:** `completedQuestions` não contém toda a história; jamais reconstruir tentativas falsas. Flags não podem migrar/zerar dados repetidamente. **Edge cases:** JSON inválido, campos faltantes, localStorage cheio, data antiga, IDs renomeados, conteúdo removido e múltiplas abas.

**Testes/aceite:** A8, A14 e A15 na parte de infraestrutura; duas migrações dão estado equivalente; XP e conclusões antigos preservados; nenhuma versão futura sobrescrita; nenhum currículo publicado tem referência quebrada ou pré-requisito cíclico.

### Fase 6 — Conteúdo piloto e tela de microlição

**Prioridade:** P1. **Impacto:** alto. **Complexidade:** alta. **Risco:** médio/alto editorial.

**Objetivo/motivo:** ensinar antes de cobrar desempenho. Atual: sequência quase exclusiva de questões, redação com 8–10 exercícios por lição. Esperado: seis microlições com conceito, exemplo, checkpoint, prática e recap.

**NOVOS ARQUIVOS:** `src/hooks/useLearningSession.ts`, `src/components/learning/MicroLessonPlayer.tsx`, `LearningBlock.tsx`, `LearningDiagram.tsx`, `src/routes/learn.$lessonId.tsx`, os quatro arquivos de catálogo/conteúdo em `src/content/microlicoes/` listados na seção 14. **Reutilizados:** registry/views, `FeedbackSheet`, DS, `FocaMark`, tutor e contratos compartilhados.

**Estados/funções:** `teaching|checkpoint|practice|recap|completed` como fases pedagógicas, integradas à máquina de resposta; `activeSession`, índices, ordem apresentada, snapshot, `start/resume/advance/complete` propostos. **APIs:** nenhuma obrigatória; tutor manual opcional. **Banco/schema:** schema da fase 5, sem novo backend.

**Ordem exata:**

1. Escrever objetivo e fontes das seis lições antes de montar cards.
2. Criar e revisar 30 posições de exercício; registrar quais itens são novos/reutilizados e por quê.
3. Validar dados; não expor `draft` no catálogo de produção.
4. Construir renderizadores de bloco e diagramas acessíveis com fallback textual.
5. Criar sessão persistente, ordem estável e retomada por versão.
6. Montar player com um fluxo claro e CTA de avanço; nenhum tempo mínimo artificial de leitura.
7. Integrar checkpoint sem XP/domínio, prática com feedback e recap com recompensa única.
8. Criar rota e acesso sob flag; deixar router gerar `routeTree.gen.ts`.
9. Conferir saída/retomada, item inexistente, conteúdo não publicado e mudança de parâmetro.
10. Testar estimativa de tempo com pessoas; dividir conteúdo que não caiba, em vez de reduzir legibilidade.

**Dependências:** fases 2 e 5; direção editorial da 3. Nova assinatura sonora não bloqueia. **Riscos:** conteúdo superficial, carga de texto, dois players divergirem, recompensar montagem. **Edge cases:** reload em feedback/checkpoint, navegar entre IDs sem unmount, versão do conteúdo alterada, reduzir movimento, imagem/diagrama indisponível.

**Testes/aceite:** A7 e A8; seis lições revisadas e navegáveis; 30–90 s refere-se à explicação e prática tem estimativa própria; uma sessão retomada mantém resposta/ordem/frase; zero requisição de IA no percurso obrigatório.

### Fase 7 — Papéis de questões, revisão e contexto do tutor

**Prioridade:** P1. **Impacto:** alto. **Complexidade:** alta. **Risco:** médio.

**Objetivo/motivo:** distinguir treino, ajuda e recuperação posterior. Atual: percentuais agregam coisas diferentes e flashcards têm risco de pular itens. Esperado: tentativas com papel, assistência e intervalo; revisão funcional sem duplicação de recompensa.

**NOVO ARQUIVO:** `src/lib/learning/review.ts`. **Existentes:** adapters/selectors/store criados ou ampliados, `src/routes/flashcards.tsx`, `study.tsx`, `LessonPlayer.tsx`, `MicroLessonPlayer.tsx`, `tutor-focus.ts`, `tutor-prompt.ts`, `tutor.ts`, `TutorBubble.tsx`.

**Estados/funções:** role, `hintUsed`, `tutorUsed`, `presentedOrder`, revisão devida, sessão de flashcards e grade; `scheduleReview`, elegibilidade e registro propostos. **APIs:** tutor existente, validação de runtime e captura de request/contexto; sem chamada automática. **Banco/schema:** agenda/evidências/attempts previstos na fase 5; registros de flashcards legados preservados.

**Ordem exata:**

1. Registrar papel e assistência de cada tentativa; tutor aberto/solicitado para o exercício marca assistência, sem fingir causalidade pedagógica exata.
2. Separar checkpoint de evidência independente e de XP por item.
3. Implementar agenda 1/3/7/14 dias para habilidades e elegibilidade de itens distintos.
4. Corrigir fila de flashcards por ID: capturar lote da sessão, remover consumido sem incrementar índice de lista já filtrada; reiniciar ao trocar filtro.
5. Impedir grade antes de virar card; atualizar memoização com valores reais e recalcular devidos ao retomar a tela.
6. Integrar revisão no player comum; explicação imediata após erro não conta como recuperação 24 h depois.
7. Completar contexto de todos os sete formatos e testar pedido sobre questão anterior com nova questão aberta.
8. Validar payload do tutor, tamanho/tipo de imagem, tratamento de timeout/fallback e resposta obsoleta.
9. Não implementar diagnóstico/simulado completo agora; deixar papéis no contrato, com UI apenas dos papéis efetivamente entregues.

**Dependências:** fases 5 e 6. **Riscos:** contagem artificial de evidência, punir quem pede ajuda, incompatibilidade com flashcards antigos. **Edge cases:** 0/1/2 itens devidos, dois itens iguais em conteúdos diferentes, relógio/fuso alterado, erro no último item, revisão repetida no mesmo dia.

**Testes/aceite:** A3, A9, A10 e A14; cada item devido aparece uma vez por lote; grade sem flip não avança; auxílio não bloqueia aprendizado nem XP de conclusão, mas exclui evidência independente; revisão não desaparece antes de ser concluída.

### Fase 8 — Dicas contextuais de vestibular

**Prioridade:** P2. **Impacto:** médio. **Complexidade:** média. **Risco:** médio editorial.

**Objetivo/motivo:** orientar prova sem interromper aprendizado. Atual: preferências de exames são strings, sem sistema editorial de dicas. Esperado: dicas válidas, raras, opcionais e coerentes com perfil.

**NOVOS ARQUIVOS:** `src/data/exams.ts`, `src/content/exam-tips.ts`, `src/lib/learning/tips.ts`, `src/components/learning/ExamTipCard.tsx`. **Existentes:** `profile.tsx`, `quiz.tsx`, store, recap/player e copy. **Estados/funções:** `examTargets`, `showExamTips`, histórico, `selectTip`, `dismissTip`, registro de exposição. **APIs/banco:** nenhum novo; pesquisa editorial de fontes não é chamada em runtime. **Schema:** campos previstos na fase 5; defaults não devem inventar etapa/ciclo.

**Ordem exata:**

1. Cadastrar perfis e dados mínimos de PAS/ENEM sem misturar instituição e prova.
2. Curar pequeno lote de dicas com fonte/revisão/validade.
3. Implementar filtros duros antes da pontuação: toggle, validade, perfil, etapa/ciclo, limite diário, repetição de 14 dias.
4. Renderizar inline apenas no recap, com dispensar; registrar exposição uma vez por evento, não por render.
5. Adicionar controle de preferência e seleção explícita de exame onde necessário.
6. Testar ausência de dica válida: não preencher com texto genérico aleatório.
7. Adiar personalização por desempenho até tags revisadas e amostra mínima existirem.

**Dependências:** fases 5 e 6; metadados da 7 para evolução por erro. **Riscos:** dica vencida, estereótipo sobre prova, interrupção excessiva. **Edge cases:** vários exames, troca de perfil, PAS sem ciclo, dica dispensada, virada do dia.

**Testes/aceite:** A11; cinco lições no mesmo dia geram no máximo uma dica espontânea; nenhuma dica sem perfil compatível; desligar preferência remove futuras exposições; avançar não depende de ler/dispensar.

### Fase 9 — Trilha e navegação de aprendizado

**Prioridade:** P2. **Impacto:** alto. **Complexidade:** alta. **Risco:** médio.

**Objetivo/motivo:** tornar posição/próximo passo legíveis. Atual: mapa de redação separado e estudo geral sem ensino sequencial. Esperado: trilha de capítulos, progresso e revisão em dimensões distintas.

**NOVOS ARQUIVOS:** `src/routes/trilha.tsx`, `src/components/learning/LearningPath.tsx`, `ChapterCard.tsx`, `LessonNode.tsx`. **Existentes:** currículo/selectors, `AppShell.tsx`, `dashboard.tsx`, `redacao.index.tsx`, `redacao.$licaoId.tsx`, rota/player novo. **Estados/funções:** disponibilidade, conclusão, evidência, revisão; seletores de capítulo/próxima lição/acesso. **APIs/banco/schema:** nenhum novo; derivar do schema existente, não salvar cópias divergentes de percentuais.

**Ordem exata:**

1. Validar grafo sem ciclos e definir disponibilidade conforme seção 11.
2. Construir nó acessível com rótulo textual dos estados, não só ícone/cor.
3. Construir capítulo colapsável com progresso calculado por conclusões válidas.
4. Construir rota sob flag, CTA de retomar e tratamento de catálogo vazio.
5. Integrar entrada Estudar, mantendo prática rápida e redação legada acessíveis.
6. Aplicar mesmas regras de acesso na rota e na UI; URL direta não pode ignorar regra por acidente.
7. Garantir que conteúdo concluído continue acessível após revisão ficar devida.
8. Só adicionar desafio opcional se houver itens revisados suficientes; não criar nó funcionalmente vazio.

**Dependências:** fases 5, 6 e 7; não depende da fase 8. **Riscos:** mapa extenso, bloqueio frustrante, duplicar rotas, perda de estado no parâmetro. **Edge cases:** todos concluídos, nenhum publicado, pré-requisito removido, deep link bloqueado, capítulos recolhidos com foco dentro.

**Testes/aceite:** A12; URL direta e nó concordam; concluir lição abre a seguinte sem exigir acerto total; revisão não remove check; leitores de tela distinguem atual/concluída/bloqueada; prática rápida continua alcançável.

### Fase 10 — Personalização determinística inicial

**Prioridade:** P2. **Impacto:** alto. **Complexidade:** média/alta. **Risco:** médio.

**Objetivo/motivo:** próximo passo útil sem custo/aleatoriedade opaca. Atual: heurísticas locais não compartilhadas entre anúncio e seleção. Esperado: seletor único, reason e remediação limitada.

**NOVO ARQUIVO:** `src/lib/learning/recommend.ts`. **Existentes:** `gaps.ts`, seletores/review, `dashboard.tsx`, trilha, `study.tsx`, perfil. **Estados/funções:** sessão ativa, evidência, revisão, escolhas, `recommendNext` proposto. **APIs:** nenhuma chamada de IA. **Banco/schema:** usar tentativas/evidências existentes; não adicionar perfil psicológico.

**Ordem exata:**

1. Implementar prioridades da seção 13 como função pura com relógio injetado.
2. Retornar conteúdo/role/reason e fallback explícito, não apenas título.
3. Usar o mesmo resultado para card do dashboard e início da sessão; revalidar disponibilidade ao clicar.
4. Implementar limiar de dois erros distintos e limite de uma sugestão de remediação por sessão.
5. Permitir ignorar sugestão e escolher a trilha; não aprisionar em revisão.
6. Implementar cálculo de evidência com cinco itens distintos/duas datas/revisão ≥24 h.
7. Mostrar explicação simples da recomendação; não anunciar “a IA descobriu” se foi regra.
8. Testar com cenários sintéticos de iniciante, consistente, ausente e prova sem data conhecida.

**Dependências:** fases 5–7; integração visual completa após 9. **Riscos:** looping de revisão, poucas questões elegíveis, evidência inflada por ajuda. **Edge cases:** nenhuma revisão válida, perfil sem conteúdo, todas as lições concluídas, recomendação antiga após troca de exame.

**Testes/aceite:** A10 e A13; mesmo estado/relógio produz mesma recomendação; card e sessão coincidem; nenhuma API paga; remediação pode ser ignorada; falta de dados não gera diagnóstico inventado.

### Fase 11 — Unificação de recompensas, meta e progresso

**Prioridade:** P1. **Impacto:** alto. **Complexidade:** alta. **Risco:** alto por economia/histórico.

**Objetivo/motivo:** progresso honesto e recompensas sem duplicação. Atual: aulas/redação/flashcards contam de formas diferentes, XP geral pode ser repetido e domínio é percentual frágil. Esperado: política da seção 12, ledger e meta por blocos.

**Arquivos/componentes:** `src/lib/store.ts`, seletores/migração/review, `src/routes/dashboard.tsx`, `progress.tsx`, `plan.tsx`, `quiz.tsx`, `flashcards.tsx`, players, `CelebracaoAula`, `GoalRing`, `StatTile`, `XpChip`. Nenhum componente novo obrigatório.

**Estados/funções:** ledger, teto por item, melhor faixa, `completedBlockIds`, contador de congelamento, `registrarResposta`, `completeLesson`, `registrarAulaConcluida`, `registrarAtividade`, `completeQuiz`, `nivelDeXp`, marcação da meta. **APIs/banco:** nenhum novo. **Schema:** campos previstos na fase 5; migração de tetos sem subtrair XP.

**Ordem exata:**

1. Fixar tabela de recompensas da seção 12 em testes unitários antes de alterar UI.
2. Implementar chaves únicas: conclusão por sessão, prêmio por melhor faixa/conteúdo, revisão por ocorrência agendada, meta por data, onboarding único.
3. Aplicar teto de questão geral a partir da migração; preservar XP passado.
4. Centralizar contagem de blocos em todas as modalidades; impedir dupla contagem pela chamada de duas funções legadas.
5. Corrigir meta visual para comparar com meta configurada, não limiar fixo de 1.
6. Corrigir reposição de congelamentos por contador explícito; testar mais de 60 dias.
7. Atualizar progresso para separar conclusão/evidência/revisão e mostrar denominadores honestos.
8. Fazer celebração consumir somente novos eventos; meta/nível simultâneos usam uma trilha sonora.
9. Testar replay, reload, clique duplo, meia-noite e migração completa.

**Dependências:** fases 2, 5, 6 e 7; regras de evidência da 10 podem ser implementadas antes da integração visual completa da trilha. **Riscos:** retirar prêmio ganho, recompensar duas vezes, comparar datas UTC com locais, congelamento infinito. **Edge cases:** meta alterada no meio do dia, XP legado alto, revisão vazia, completar sessão iniciada ontem.

**Testes/aceite:** A14 e A15; mesmas transações repetidas não mudam XP; nenhuma migração reduz saldo; meta 3 só completa em 3 blocos distintos; streak no máximo uma vez por data local; dias 61–75 não interrompem reposição prevista por truncamento de histórico.

### Fase 12 — Validação do piloto, rollout e registro

**Prioridade:** P1 para liberar aprendizado. **Impacto:** alto. **Complexidade:** média. **Risco:** baixo/médio.

**Objetivo/motivo:** provar confiabilidade e utilidade antes de escalar conteúdo. Atual ao entrar: funcionalidades integradas sob flags. Esperado: evidências de QA e uso, limitações documentadas e rollout reversível.

**NOVO ARQUIVO:** `docs/22-validacao-piloto-aprendizagem.md`. **Existentes:** `features.ts`, todo o caminho do piloto, testes, SDD. Nenhum novo componente de produto obrigatório. **Estados/funções:** flags e cenários de sessão/recompensa; sem lógica pedagógica nova nesta fase. **APIs/banco/schema:** nenhuma adição; medir localmente ou em pesquisa consentida, não instalar analytics por inferência.

**Ordem exata:**

1. Executar suíte unitária/E2E, build, TS e lint; registrar exceções preexistentes separadamente.
2. Rodar matriz de dispositivos/temas/acessibilidade da seção 19.
3. Fazer leitura editorial final das seis lições e teste de gabaritos/diagramas/fontes.
4. Observar participantes concluindo uma lição, pedindo ajuda e retomando sessão, sem explicar a UI antes.
5. Medir tempo da explicação separadamente de prática, entendimento do próximo passo e leitura do feedback; registrar amostra e limitações.
6. Fazer piloto sonoro se a assinatura nova for liberada; fallback para som anterior funcional é permitido.
7. Revisar critérios A1–A15 e pendências; não liberar funcionalidade que anuncia domínio sem evidência.
8. Habilitar flags do piloto gradualmente; preservar acesso legado e compatibilidade dos dados no rollback.
9. Registrar o que foi implementado e o que segue futuro; atualizar índice SDD sem marcar roadmap inteiro como pronto.

**Dependências:** fases essenciais 1, 2, 3, 5, 6, 7 e 11; 4, 8, 9 e 10 podem permanecer parcialmente desabilitadas. **Riscos:** confundir teste pequeno com prova de retenção, expandir sem curadoria. **Edge cases:** usuário fora do perfil piloto, falha de áudio, storage lotado, rollback após sessão nova.

**Testes/aceite:** todos os critérios obrigatórios do escopo liberado com evidências; nenhum P0 conhecido aberto; seis lições revisadas; rollback mantém XP/conclusões; relatório separa achado, hipótese e dado não medido. Ganho de aprendizagem/retensão não é declarado só porque a UI funcionou.

## 17. Dependências entre fases

| Fase | Pré-requisito obrigatório | Pode aguardar sem bloquear bugs? |
|---|---|---|
| 0 | Autorização de implementação e baseline | Não |
| 1 | 0 | Não |
| 2 | 1 | Sim, mas antes dos novos players |
| 3 | Estabilidade da 1; integração da 2 | Sim |
| 4 | 2 | Sim; manter som funcional da 1 |
| 5 | 1–2, IDs/editorial acordados | Sim; obrigatória antes de persistir aprendizado novo |
| 6 | 2, 5 e direção editorial da 3 | Sim |
| 7 | 5–6 | Sim; obrigatória antes de prometer revisão/evidência |
| 8 | 5–6; 7 para personalização por erro | Sim |
| 9 | 5–7 | Sim |
| 10 | 5–7; 9 só para integração da trilha completa | Sim |
| 11 | 2, 5–7; contrato de evidência da 10 | Sim; obrigatória para liberar novo progresso |
| 12 | Fases essenciais do escopo habilitado | Não para release do piloto |

Ordem recomendada de releases: **estabilidade (0–1)** → **fundação compartilhada (2–3–5)** → **piloto de ensino/revisão/progresso (6–7–11–12)** → **assinatura/trilha/dicas/adaptação (4–8–9–10, com nova validação)**. A numeração é organização temática; dependências acima governam execução. Não aguardar P2 para entregar P0.

Flags propostas em `features.ts`: microlições, trilha, dicas, recomendação adaptativa e nova identidade sonora. Correções críticas não devem depender de flag experimental permanentemente. Desativar flag oculta a entrada correspondente, não apaga dados.

## 18. Edge cases e decisões obrigatórias

| Caso | Comportamento definido |
|---|---|
| Clique duplo/Enter repetido | Uma tentativa e um avanço; ref síncrona + transação idempotente |
| Reload com feedback aberto | Restaurar texto, resultado e ordem; não tocar nem premiar novamente |
| Troca de lição por parâmetro | Identidade do player/sessão muda; estado anterior não vaza |
| Sair no meio | Salvar sessão nova e informar retomada; legado mantém regra antiga até ser migrado explicitamente |
| Conteúdo mudou de versão | Preservar histórico; oferecer reinício da versão nova sem reinterpretar respostas antigas |
| Conteúdo removido/não publicado | Mensagem útil e saída para trilha; não crash nem acesso a rascunho |
| Array de resposta incompleto | Verificar desabilitado/sem efeito; não premiar resposta parcial |
| Pares/blocos com texto repetido | Identidade por índice/ID, não só comparação textual; validar ambiguidade |
| Tutor aberto antes do erro | Não mandar mensagem nem trocar conversa sem ação explícita |
| Requisição antiga retorna depois | Resposta fica na conversa original ou é descartada por cancelamento |
| Tutor sem rede/chave | Fallback identificado e explicação estática continuam disponíveis |
| Som bloqueado/sem suporte | Questão funciona; nenhum erro bloqueante ou fila tardia |
| Mute durante jingle | Cancelar fontes/fade; nenhum novo evento sonoro |
| Aba oculta e depois visível | Não reproduzir celebrações acumuladas |
| Reduced motion | Sem shake/pop/deslocamento; resultado textual continua claro |
| Dark/light/zoom | Estados semânticos opacos e contrastados; botões sem corte de texto |
| Zero itens de revisão | Estado vazio honesto, sem concluir sessão vazia/gerar XP |
| Só um item devido | Sessão curta válida quando concluída; sem inventar outros itens |
| Mudar filtro de flashcard | Nova seleção reinicia fila/índice; não pula o primeiro |
| Duas abas | Detectar storage externo, avisar conflito e evitar sobrescrita silenciosa; não alegar consistência remota |
| Storage inválido/cheio | Não destruir backup; informar falha de salvamento e permitir uso em memória |
| Versão futura de schema | Não fazer downgrade destrutivo |
| Meia-noite durante sessão | Bloco conta no dia local da conclusão, uma vez |
| Alterar fuso/relógio | Agenda por timestamps; agrupamento diário por data local registrada; não retroconceder prêmios em cascata |
| Mudar meta no dia | Mostrar nova meta com blocos já feitos; prêmio diário não se repete |
| Streak com histórico >60 dias | Contador de reposição independente do array truncado |
| Perfil PAS incompleto | Não mostrar dica específica de etapa/ciclo |
| Todas as lições concluídas | Oferecer revisão/prática, sem chamar conteúdo inexistente de próxima lição |
| Pouca evidência de habilidade | Não usar rótulo dominado nem preencher percentual fictício |
| Usuário erra repetidamente | Oferecer ensino opcional, nunca abrir IA ou bloquear trilha automaticamente |
| Limpeza de tentativas recentes | Não limpa ledger, progresso concluído ou tetos de prêmio |
| Ranking/offline demo | Não transformar visual demonstrativo em promessa de serviço real |

## 19. Plano de testes

### 19.1 Arquivos de teste propostos

Todos são **NOVOS ARQUIVOS**, a criar somente na implementação:

| Arquivo | Casos mínimos |
|---|---|
| `playwright.config.ts` | Servidor local, projetos browser, fixtures isoladas e captura em falha |
| `tests/fixtures/legacy-state.ts` | Novo usuário, v2/v3 parcial/completo, inválido, versão futura, quota |
| `tests/unit/feedback.test.ts` | Snapshot estável, render puro, avanço único e prioridade de efeitos |
| `tests/unit/grading.test.ts` | Sete formatos, resposta incompleta, ordem apresentada e casos-limite |
| `tests/unit/state-migrations.test.ts` | Preservação, backup, dupla migração, versão futura, inicialização |
| `tests/unit/rewards.test.ts` | Teto, diferença de faixa, revisão, meta, streak e onboarding únicos |
| `tests/unit/recommendation.test.ts` | Prioridades, reason, amostra insuficiente, determinismo, ignorar remediação |
| `tests/unit/review.test.ts` | Intervalos, assistência, 24 h, fila 0/1/2/3 itens, reset por erro |
| `tests/unit/tips.test.ts` | Perfil, etapa/ciclo, validade, uma/dia, 14 dias, toggle |
| `tests/unit/content.test.ts` | IDs únicos, referências, índices, versões, status, pré-requisitos e metadados |
| `tests/unit/audio.test.ts` | Unlock, falha de resume, mute, expiração, cancelamento e prioridade |
| `tests/e2e/feedback.spec.ts` | Estabilidade 10 s, duplo clique, alternativas light/dark |
| `tests/e2e/tutor.spec.ts` | Zero autoenvio, CTA, envio manual, contexto composto e resposta atrasada |
| `tests/e2e/lessons.spec.ts` | Sete formatos, microlição, retomada, conclusão/recompensa |
| `tests/e2e/learning-path.spec.ts` | Acesso, progresso, revisão independente, deep links |
| `tests/e2e/accessibility.spec.ts` | Axe, teclado, foco, nomes acessíveis e reduced motion |

Usar relógio/aleatoriedade injetados nos testes unitários; fake timers para 10 segundos e intervalos. Testar um caso E2E com relógio real também. Mock de áudio comprova disparo/contrato, não qualidade perceptiva. Teste automatizado de contraste não substitui inspeção de estilos computados/estados/transições.

### 19.2 Matriz obrigatória

- Temas claro e escuro; largura 320, 390 e 440 px; zoom 200%.
- Chrome desktop, browser móvel Android e Safari iOS real. WebKit no Playwright não prova autoplay/háptico em iPhone.
- Teclado, leitor de tela em ao menos um fluxo completo e `prefers-reduced-motion`.
- Som ligado/desligado; háptico ligado/desligado; AudioContext suspenso/indisponível.
- Usuário novo, usuário migrado com muito histórico, sessão retomada e replay.
- Rede normal/lenta/indisponível para tutor; app carregado com conteúdo local não deve depender da IA.
- Nenhuma execução de teste usa chave de produção ou altera dados reais de aluno.

### 19.3 Comandos e evidências

Configurar scripts de teste na fase 0; proposta: unitários com `bun test tests/unit`, E2E com `bunx playwright test`, build com `bun run build`, lint com `bun run lint` e typecheck compatível com a configuração TS existente. Confirmar execução real antes de documentar sucesso. Não rodar `bun run format` globalmente para obter uma suíte verde.

Registrar comando, resultado, ambiente, data e falhas preexistentes. Screenshots e relatório de áudio/dispositivo devem identificar o estado testado. Referências de acessibilidade: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Referências React: [render puro](https://react.dev/learn/keeping-components-pure) e [quando efeitos não são necessários](https://react.dev/learn/you-might-not-need-an-effect).

## 20. Critérios objetivos de aceite

### A1 — Feedback imutável

PASSA SE: responder errado → capturar texto/ID → aguardar 10 s com relógio atualizando → texto/ID idênticos → abrir/fechar resolução e chat → continuam idênticos → continuar → responder novamente → novo interactionId permite nova escolha. Repetir para acerto e redação. Coincidência de texto entre duas respostas não é falha.

### A2 — Tutor estritamente manual

PASSA SE: com chat fechado, errar questão → feedback local visível → após 10 s `open=false` e zero requisições → clicar CTA → chat abre com questão correta, ainda zero requisições → clicar enviar/sugestão → exatamente uma requisição. Repetir na redação. Chat previamente aberto não recebe mensagem automática ao errar.

### A3 — Contexto correto

PASSA SE: responder cada um dos sete formatos → abrir tutor → payload contém ID, enunciado, resposta real, resultado e explicação da mesma interação. Em ordenar/parear, não anuncia “não respondeu”. Iniciar pedido de Q1, avançar para Q2 e devolver resposta de Q1 não associa a resposta a Q2.

### A4 — Consistência de som e envio

PASSA SE: acerto e erro em cada formato geram exatamente um evento sonoro correspondente com som ligado; zero com som desligado. Selecionar, rerenderizar e abrir resolução não tocam. Clique duplo/Enter repetido geram uma tentativa e um evento. Confirmar percepção em dispositivo, além do mock.

### A5 — Legibilidade e acessibilidade

PASSA SE: todos os estados da tabela da seção 4, nos dois temas, têm cards/textos de resposta com opacidade final 1, texto normal ≥4,5:1 e indicadores relevantes ≥3:1; resultado distinguível sem cor; teclado alcança ações; 320 px/zoom 200% não ocultam resposta/CTA; reduced motion não apaga feedback. Placeholders intencionalmente invisíveis continuam ocupando apenas seu papel estrutural.

### A6 — Áudio controlável

PASSA SE: desativar som durante reprodução cessa áudio em até 50 ms e cancela agendados; evento de resposta com atraso >300 ms é descartado; reward não aguarda >500 ms; esconder/retornar aba não toca sons antigos; falha de resume não produz rejeição não tratada nem impede o fluxo; conclusão com nível+meta toca apenas a maior prioridade.

### A7 — Microlição completa

PASSA SE: cada uma das seis lições publicadas possui objetivo, fonte/revisão, ensino, checkpoint, duas práticas e recap; percurso não exige IA; checkpoint não concede XP nem domínio; prática fornece explicação; conclusão registrada uma vez; estimativas distinguem ensino e prática; drafts não aparecem.

### A8 — Retomada sem duplicação

PASSA SE: iniciar ordenar/parear → responder → ficar no feedback → recarregar → manter ordem, resposta, frase, XP e índice; nenhum som de resposta repetido; continuar avança só um item. Repetir reload no recap/conclusão e trocar parâmetro de lição sem estado residual.

### A9 — Revisão e flashcards

PASSA SE: lote de três itens A/B/C apresenta os três uma vez sem pular B; não permite avaliar antes de virar; trocar filtro reinicia seleção corretamente; zero itens não dá bloco/XP; apenas um devido pode concluir lote válido; agenda nova segue 1/3/7/14 dias e erro reinicia em um dia; repetição imediata não conta como retenção de 24 h.

### A10 — Evidência honesta

PASSA SE: 1 acerto em 1 item não mostra consistente/dominado; cinco distintos em uma data ainda não bastam; cinco elegíveis em duas datas, quatro dos últimos cinco corretos e revisão correta ≥24 h permitem `consistent`; item assistido não preenche esse requisito; conclusão permanece mesmo com revisão devida.

### A11 — Dicas não intrusivas

PASSA SE: concluir cinco blocos no mesmo dia mostra no máximo uma dica espontânea; nenhum modal/timer interrompe; ID não se repete em 14 dias; toggle off impede exibição; perfil/etapa/ciclo incompatíveis nunca aparecem; sem dica válida, nada aparece; dispensar não altera XP/progresso.

### A12 — Trilha consistente

PASSA SE: usuário identifica concluída/atual/disponível/bloqueada por texto/ícone; primeira introdução elegível acessível; completar lição abre próxima mesmo sem 100%; revisão não relocka; rota direta respeita mesma regra do mapa; conteúdo inexistente tem saída segura; estudo geral e redação continuam acessíveis.

### A13 — Recomendação explicável

PASSA SE: mesmo estado/data produz mesmo resultado; sessão ativa tem prioridade; dois erros distintos podem oferecer remediação uma vez; ignorar permite continuar; dashboard e sessão usam o mesmo conteúdo/role; nenhuma requisição de IA para escolher; nenhum diagnóstico de erro sem tag/evidência adequada.

### A14 — XP e blocos idempotentes

PASSA SE: repetir mesma conclusão/transação 10 vezes não aumenta XP/blocos; primeira errada geral nova dá 5, acerto posterior +10, próximos +0; legado migrado preserva saldo e não paga de novo; microlição 1→2→3 estrelas paga 10+10+10, repetir faixa paga 0; revisão paga 5 uma vez por ocorrência; checkpoint paga 0; onboarding repetido não repaga.

### A15 — Migração, meta e streak

PASSA SE: v2/v3 migram preservando XP/preferências/conclusões/flashcards; segunda migração não altera saldo; backup não é sobrescrito; versão futura não é destruída; quota informa falha sem fingir salvamento. Meta 3 só completa após três sessões distintas; mesmo dia não incrementa streak duas vezes; sessão que cruza meia-noite conta no dia da conclusão; histórico com mais de 60 dias não quebra reposição de congelamento; estoque nunca excede 2.

## 21. Priorização

P0 = bug crítico; P1 = impacto alto; P2 = melhoria importante; P3 = evolução futura. A prioridade da funcionalidade não elimina a prioridade de sua dependência técnica.

| Mudança | Prioridade | Impacto | Complexidade | Risco | Dependência/razão |
|---|---|---|---|---|---|
| Frase estável por tentativa | P0 | Alto | Baixa | Baixo | Snapshot antes da refatoração ampla |
| Remover IA automática | P0 | Alto | Média | Médio | Remover abertura e autoenvio; preservar contexto |
| Som na redação | P0 | Médio | Baixa | Baixo | Integrar evento existente; assinatura pode esperar |
| Contraste/opacidade | P0 | Alto | Média | Médio | Sete formatos e dois temas, não override global |
| Avanço/validação duplicados | P0 | Alto | Média | Médio | Guardas antes de novos players |
| Questão com duas respostas equivalentes | P0 | Alto | Baixa | Médio | Quarentena/revisão; não ensinar gabarito incorreto |
| Contrato compartilhado de feedback | P1 | Alto | Média | Médio | Base para novos formatos/efeitos |
| Migração e IDs estáveis | P1 | Alto | Alta | Alto | Pré-requisito para persistência/XP/evidência |
| Voz e copy funcional | P1 | Alto | Média | Médio | Sem alterar significado pedagógico em massa |
| Seis microlições revisadas | P1 | Alto | Alta | Alto | Conteúdo é caminho crítico, não só UI |
| Revisão e fila de flashcards | P1 | Alto | Média/Alta | Médio | Agenda/identidade antes de medir retenção |
| Metas, ledger, streak e evidência | P1 | Alto | Alta | Alto | Preservar histórico e não prometer domínio falso |
| Validação do tutor/payload | P1 | Alto | Média | Médio | Antes de ampliar uso; sem novo fornecedor |
| Nova assinatura musical | P2 | Médio | Média | Médio | Não bloqueia correções sonoras atuais |
| Dicas de vestibular | P2 | Médio | Média | Médio | Perfil/curadoria antes de personalização |
| Trilha visual | P2 | Alto | Alta | Médio | Conteúdo e regras de progresso antes do mapa |
| Adaptatividade por regras | P2 | Alto | Média/Alta | Médio | Tentativas confiáveis e amostra mínima |
| Diagnóstico real e atalho de domínio | P2 | Alto | Alta | Alto | Itens calibrados/revisados, não perfil disfarçado |
| Backend/sincronização | P3 | Alto | Alta | Alto | Exige privacidade, autenticação e decisões próprias |
| Simulado completo/ML/predição | P3 | Incerto | Alta | Alto | Dados e validação; previsão de nota não está aprovada |

## 22. Roadmap MVP → evolução → futuro

### Release de estabilidade

Quatro bugs, avanço único, contexto manual, contraste e regressões. Sem trilha nova, sem mudar economia inteira, sem esperar conteúdo piloto.

### MVP de aprendizado

Contratos compartilhados, copy funcional revisada, schema migrado, seis microlições, prática/recap, retomada, revisão mínima, XP idempotente e progresso honesto. Tutor opcional; zero chamada de IA obrigatória. Trilha simples pode ser liberada se pronta, mas não é condição para testar se ensino antes da prática ajuda.

### Evolução

Assinatura sonora validada, mapa de capítulos, dicas editoriais por perfil, recomendação local, mais conteúdo após curadoria, diagnóstico real, desafios opcionais e prioridade por prova próxima informada/verificada. Avaliar repetição/retorno e compreensão com pesquisa; não otimizar somente cliques ou XP.

### Futuro condicionado a decisão específica

Backend e sincronização, autoria/curadoria assistida com revisão, simulado completo, experimentos de personalização e modelos calibrados. Não estão autorizados automaticamente: pagamento real, ranking real, analytics externo, coleta adicional de menores, notas previstas e geração livre de aulas em tempo real.

## 23. Checklist final de implementação

### Antes de codificar

- [ ] Fase/escopo autorizado pelo usuário.
- [ ] Documento inteiro e precedência lidos; nenhuma regra antiga de IA automática reaplicada.
- [ ] Worktree registrado e alterações preexistentes preservadas.
- [ ] Baseline de build/TS/lint e reproduções salvo.
- [ ] Caminhos atuais reconferidos; arquivos novos não confundidos com existentes.

### Loop de resposta

- [ ] Frase escolhida no evento, com snapshot estável.
- [ ] Render sem sorteio/storage/efeitos de recompensa.
- [ ] Guardas síncronas e transações únicas.
- [ ] Sem timer de avanço duplicado.
- [ ] Feedback local antes de qualquer tutor.
- [ ] CTA abre; envio explícito faz a chamada.
- [ ] Contexto estável inclusive para respostas compostas.
- [ ] Sete formatos com áudio e legibilidade em ambos os temas.
- [ ] Som/háptico obedecem preferências; cancelamento/expiração testados.

### Aprendizado e conteúdo

- [ ] Seis lições com objetivo, fontes, revisão e estimativas honestas.
- [ ] IDs/versões estáveis e metadados coerentes.
- [ ] Questão ambígua corrigida/quarentenada; nenhuma referência quebrada.
- [ ] Checkpoint/prática/revisão distinguíveis no dado e no fluxo.
- [ ] Diagramas acessíveis e funcionais, sem decoração obrigatória.
- [ ] Retomada preserva ordem/resposta/frase sem repetir recompensa.
- [ ] Ajuda não é penalizada, mas não vira evidência independente.

### Dados e progresso

- [ ] Migração v2/v3 testada duas vezes; backup preservado.
- [ ] XP histórico mantido; ledger independe de poda do histórico.
- [ ] Meta por blocos e streak por data local, sem duplicação.
- [ ] Congelamento funciona além de 60 dias de histórico.
- [ ] Conclusão, evidência e revisão são dimensões distintas.
- [ ] Recomendação anuncia o conteúdo que realmente abre.
- [ ] Dicas respeitam perfil, validade, frequência e toggle.
- [ ] Rollback de flag não remove dados nem acesso legado.

### Entrega e handoff

- [ ] A1–A15 pertinentes à release executados com evidências.
- [ ] Testes automáticos e dispositivos reais diferenciados no relatório.
- [ ] Copy funcional revisada; revisão pedagógica pendente explicitada por lote.
- [ ] Nenhum segredo/base64 pessoal incluído em fixtures ou logs.
- [ ] Nenhuma claim de domínio, retenção, offline ou IA além do que existe.
- [ ] SDD atualizado com realizado/pendente; sem marcar roadmap todo como concluído.
- [ ] Nenhum histórico publicado reescrito; push/commit somente no escopo autorizado.

**Condição de conclusão:** uma fase só está pronta quando seu comportamento esperado foi implementado e seus critérios objetivos foram demonstrados. A existência deste plano, de componentes novos ou de uma tela visualmente pronta não é evidência suficiente.
