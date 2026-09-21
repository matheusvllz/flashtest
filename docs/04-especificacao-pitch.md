# Spec do Pitch (Ship)

Status: ✅ **fechado na fase Flash Test (22/07) · linha restaurada (20/09/2026)** — o pitch NÃO é slide: é uma **landing page** de 3 minutos que termina no botão **"ver demonstração"**, abrindo o protótipo do **Flash Test**. Dono na época: Matheus Mister (Líder), com copy/marketing da Duda e a LP construída por Vellozo usando o `Flash Test - design System.html` (em `brand/`). Especificação tela-a-tela do que o botão abre: `10`.

> **⚠️ Nota de contexto (20/09/2026).** Este arquivo foi escrito para o **Pitch Day do Pre College 26.2 da Link (24/07/2026)** — um evento que já aconteceu e um contexto que se encerrou. O formato, o cronograma e a divisão de falas por membro do time abaixo são **registro histórico**. O que continua valendo e vale reaproveitar: a **estrutura de argumento** (hero → problema nichado → solução → prova → modelo → demo), o **Golden Path da demo** e as **perguntas que qualquer banca ou investidor vai fazer**. Adaptar os nomes e o relógio ao novo contexto antes de usar.

> **Nota de histórico.** Em 23/07/2026 este arquivo foi reescrito para o **Abroad**. O pivô foi revertido; a versão Abroad está preservada em `_arquivo-abroad/04-especificacao-pitch-abroad.md`.

## Formato oficial (registro histórico — Pre College 26.2)

- Qualificatórias sexta 09h00–10h30, 5 salas simultâneas, times de 8 alunos.
- Banca apura e define finalistas (10h30–11h00).
- Final no Auditório, 11h00–13h00, com banca Link e convidados. Resultado, premiação e certificados no mesmo bloco.
- **Tempo do pitch: no MÁXIMO 3 minutos.** Precisa ser **repetível** duas vezes (qualificatória e, se classificar, final) e rodar sem depender do wi-fi da sala.

## O pitch é uma landing page (decisão mantida)

Nada de slides. A apresentação é uma **landing page** que se rola de cima a baixo enquanto se fala, e que no final tem um botão **"ver demonstração"** que abre o protótipo. A LP É a apresentação; o protótipo é o clímax.

**Por que isso é bom (e como defender):** o produto é digital — apresentar num artefato digital coeso (LP com a cara da marca → app) prova domínio de execução e marca, em vez de "mais um deck". **Risco a controlar:** a LP não pode virar enfeite que rouba tempo da mensagem — cada seção cabe no orçamento de 3 min. Se a LP ficar linda mas o conteúdo raso, a banca percebe.

### Estrutura da landing page (de cima pra baixo = ordem da fala)

Orçamento-alvo dentro dos 3 min: **~75s de narrativa na LP + ~90s de demo + ~15s de fecho.**

1. **Hero — o gancho (dor + número).** Primeira dobra: a frase de posicionamento (*"Não é mais aula. É o hábito que te aprova. 60 segundos por dia."*) + o número mais forte de `01` (**9h13** de tela por dia — "o Flash Test quer 60 segundos disso de volta"). Marca visível. João aparece como protagonista.
2. **O problema (nichado).** Uma pessoa concreta, uma dor específica: João tem YouTube, cursinho, apostila e o app do MEC de graça — e mesmo assim não estuda. Começa forte na segunda, sai da rotina na quarta. **Não é falta de conteúdo nem de vontade**: estudar virou uma tarefa grande demais pra caber no intervalo de aula. A persona é a protagonista, não o time.
3. **A solução — Flash Test.** O que é (aula de 60s → 1–2 questões → feedback imediato → a IA escolhe a próxima a partir do erro) e **onde a IA entra de verdade** (Seção 6 do `08`): roteamento da próxima questão, micro-explicação do erro gerada ao vivo, tutor no balão global, foto de questão. A linha do diferencial: "conteúdo todo mundo já tem de graça, inclusive o governo — o que ninguém resolve é constância e saber onde você está fraco".
4. **Prova / tração leve.** Falas reais de alunos de pré-vestibular (Pesquisa) + os números de `01` (68% dos jovens de 15–17 anos já usam IA pra estudar). Nada inflado.
5. **Modelo de negócio.** B2C freemium/low ticket, com a honestidade de que o incumbente é **grátis** (MEC Enem) e por isso o free precisa ser bom. Esqueleto de DRE e cenários em `02`. Curto — mas com número.
6. **CTA final: "ver demonstração".** Botão que salta, em Flash Gold. Clique → abre o **protótipo** (Golden Path abaixo) → o clímax de ~90s. Se a IA ao vivo cair, o mesmo botão abre o **vídeo backup** embutido.

## Golden Path da demo (o que o botão abre) — ≤ 90s

1. **Quiz de primeiro acesso** (`/quiz`) — 5 perguntas em formato Stories: estado, faculdade-alvo e 3 questões de conteúdo real. "Isso não é cadastro: é a IA te conhecendo." *(~20s)*
2. **Aha moment** (`/aha`) — "Já entendi você. Pra [faculdade], suas 3 maiores lacunas agora são…" + XP inicial + streak dia 1. É o momento que prova personalização no primeiro uso. *(~15s)*
3. **Aula de 60 segundos** (`/study`) — 1–2 questões, feedback verde/vermelho imediato, XP subindo. **Errar uma de propósito** para o balão do tutor abrir sozinho com a explicação gerada por IA ao vivo. É o "wow". *(~30s)*
4. **Micro-treino de redação** (`/redacao`) — o 2º pilar, mesma mecânica de micro-dose. Mostra que o produto não é um banco de questões com casca nova. *(~15s)*
5. **Progresso / mapa de lacunas** (`/progress`) — a lacuna encolhendo, amarrada à faculdade-alvo. Fecha o ciclo aberto no passo 2. *(~10s)*

Se estourar o tempo, a ordem de corte é: redação (4), depois progresso (5). **Nunca** cortar o aha (2) nem o erro que abre o balão (3) — são o coração do pitch.

## Storytelling e divisão de papéis (framework People Skills — `07`)

- Combinar dado com narrativa em cada seção da LP — nunca só dado (frio) ou só história (sem lastro).
- Usar a tensão real (o ciclo de começar e desistir, a culpa de ter largado de novo) pra segurar atenção nos 3 min, sem inventar fatos.
- Dividir as falas por perfil DISC: **Dominante/objetivo** abre o hero e fecha com o CTA; **Influente/comunicativo** conduz a persona e a demo; **Cauteloso/analítico** apresenta modelo de negócio e números; **Estável** costura as transições.

## As perguntas que a banca VAI fazer (ensaiar as respostas)

1. **"Isso não é só mais um app de questões com um chatbot?"** → o chatbot não é acessório: a IA **decide a próxima questão** a partir do que o aluno errou e **explica o erro daquele aluno** ao vivo. Um banco de questões entrega volume; o Flash Test entrega direção. Ver `08` Seção 10.
2. **"O MEC Enem é grátis e tem mais conteúdo que vocês. Por que alguém usaria isto?"** → é a pergunta mais perigosa, e a resposta é **não competir onde eles ganham**. Eles resolvem "falta de conteúdo", que não é a dor do João. O Flash Test resolve constância e personalização — o app do governo não sabe quem é o João nem o que ele errou ontem. Ver `08` Seção 10.
3. **(provável) "Adolescente larga app de estudo em duas semanas. Por que o de vocês gruda?"** → porque a unidade é 60 segundos, não 1 hora: o custo de começar é quase zero. E o streak é **recomeço sem culpa** — a mecânica não pune quem falhou um dia, porque punição reproduz exatamente o ciclo de desistência que o produto tenta quebrar (`14` Seção 8).

## Checklist pré-pitch

- [ ] Landing page construída com os tokens exatos da marca (`09` + `brand/Flash Test - design System.html`) e responsiva na tela da sala
- [ ] Botão **"ver demonstração"** testado: abre o protótipo (e, no fallback, o vídeo backup) sem depender de wi-fi
- [ ] Pitch inteiro cronometrado **≤ 3 min** em voz alta, com a demo cabendo em ~90s
- [ ] Cada membro sabe responder as perguntas críticas (só mais um app? / e o MEC grátis?) e os riscos de `02`
- [ ] As questões da demo são **reais de vestibular** (ENEM/FUVEST/UNICAMP), com gabarito conferido — nada de enunciado inventado
- [ ] Demo testada de ponta a ponta antes do congelamento
- [ ] Vídeo backup do Golden Path gravado e embutido na LP
- [ ] Transições e divisão de falas por DISC ensaiadas (quem fala cada seção)
- [ ] Cópia offline da LP + protótipo pronta (plano contra queda de rede)

## Registro pós-pitch

```
Nunca preenchido: o projeto pivotou para o Abroad na véspera (23/07) e o Pitch Day de
sexta foi feito com o outro produto. O registro daquela apresentação, se houver, está na
linha Abroad (`_arquivo-abroad/20-plano-mvp-pitch-abroad.md`).
```
