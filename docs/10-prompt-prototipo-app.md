# 10 — Prompt mestre para gerar o protótipo do app (Flash Test)

Status: **v2 — corrigido e expandido para o MVP completo** · v1 gerada em 21/07/2026, corrigida em 21/07/2026 (mesma noite) · para Vellozo/Leonardo colarem direto na ferramenta de vibe coding (Claude, Lovable, v0, Bolt etc.)

**Correções desta versão (por pedido de Vellozo, depois de ver a v1 rodando "simples demais"):**
1. Quiz caiu de 10 para **5 perguntas** (o app entregue estava com 10 — Vellozo pediu para reduzir).
2. A pergunta de localização precisa oferecer **todos os estados do Brasil** como opção real de seleção (não campo de texto livre).
3. A pergunta de faculdade precisa de uma **lista ampla e realista de faculdades brasileiras** (não 2–3 opções de exemplo).
4. O **balão do tutor de IA agora é persistente em TODO o app** (não só durante a aula) — disponível para mandar foto de questão OU perguntar sobre o próprio progresso, em qualquer tela.
5. Escopo mudou de "5 telas mínimas" para **o MVP completo**: inclui também as telas que antes eram só "se sobrar tempo" (micro-treino de redação deixou de ser opcional — é núcleo) e as telas mock que dão sensação de produto pronto (ranking/turma, plano de estudos). Pedido explícito: "o aplicativo mais top", com acabamento de produto de verdade, não protótipo simples.
6. Todas as questões (aula de 60s e redação) precisam vir de **bancos de questões de vestibular reais** (ENEM, FUVEST, UNICAMP etc.) — nada de enunciado inventado.

Este arquivo contém UM prompt único e completo (bloco abaixo). Cole o bloco inteiro como está — não precisa editar nada, só anexar o arquivo `Flash Test - design System.html` junto quando a ferramenta permitir anexo.

---

## PROMPT (copiar tudo abaixo desta linha)

Você é meu(minha) engenheiro(a) de produto e front-end sênior. Já construímos uma primeira versão simples do protótipo do **Flash Test** — agora quero o **aplicativo completo do MVP**, com acabamento de produto real (não de protótipo básico), seguindo o design system à risca. Isto é para um pitch de faculdade/aceleradora em poucos dias — precisa impressionar uma banca.

### 1. O produto, em uma frase

Flash Test é um app de preparação para o ENEM/vestibular baseado em **aulas de 60 segundos**: 1–2 questões por vez, feedback imediato, e uma IA que aprende o que cada aluno erra para decidir a próxima questão. O diferencial **não é conteúdo** (isso todo mundo já tem de graça, inclusive o governo) — **é constância e personalização**. Frase de posicionamento: **"Não é mais aula. É o hábito que te aprova. 60 segundos por dia."**

### 2. Para quem é

Estudante de ensino médio/pré-vestibular, 16–19 anos, nativo de TikTok/Reels. Tem acesso a conteúdo de sobra (YouTube, cursinho, app do MEC) mas não consegue manter constância de estudo sozinho. Ele não precisa de mais aula — precisa de um empurrão diário e saber exatamente o que estudar hoje.

### 3. Por que isso importa (não é feature gratuita)

Todo concorrente (cursinhos, banco de questões, até o app gratuito do governo) resolve "falta de conteúdo". Ninguém resolve "não consigo manter o ritmo e não sei onde estou fraco". Cada tela precisa deixar isso óbvio: o app parece saber exatamente quem é aquele aluno e o que ele precisa fazer agora — não entregar mais um menu de conteúdo.

### 4. Design system — siga estritamente (não improvise cores/fontes)

Vou anexar o arquivo `Flash Test - design System.html` com a marca completa. Resumo dos tokens não-negociáveis:

**Cores:**
- Flash Navy (primária) `#02104E` — fundo da marca, superfícies escuras, telas de onboarding.
- Flash Gold (destaque) `#FEB803` — CTA principal, XP, streak, o raio do logo. Usar com parcimônia: só em ação/destaque.
- Gold escuro `#B57F00` — gold sobre fundo claro, hover, texto dourado legível.
- Gold claro `#FFD466` — estados leves, brilho, badges.
- Navy médio `#17297A` / Navy mais escuro `#141C44` — variações e profundidade sobre navy.
- Periwinkle/lavanda `#AEB8E8` — texto secundário sobre navy.
- Slate `#3A4066` — texto forte sobre fundo claro.
- Cinza neutro `#8B91A8` — texto secundário, legendas, placeholders.
- Off-white `#F7F6F9` — fundo das telas claras (aula de 60s, progresso).
- Surface clara `#F0EFF5` / `#ECECF3` — cards e superfícies.
- Borda `#E6E5EE`.
- Branco `#FFFFFF` — texto sobre navy.
- **Sucesso (acerto)** `#0AA35A` — **só** para feedback de resposta certa.
- **Erro (errou)** `#C0392B` — **só** para feedback de resposta errada.
- Regra dura: verde/vermelho nunca decorativo — só significam certo/errado, em qualquer lugar do app.

**Tipografia:**
- Títulos/display: **Space Grotesk**, 700/bold (Google Fonts). Usar em números grandes (XP, streak, "60 segundos").
- Texto corrido/UI: **Plus Jakarta Sans** (Google Fonts). Usar em questões, explicações, corpo de texto.
- Fallback: `-apple-system, BlinkMacSystemFont, sans-serif`.

**Logo:** capelo de formatura branco com a borla virando um raio dourado (educação + velocidade). Vive sobre fundo navy. Use o símbolo isolado como ícone/favicon e a versão com wordmark "Flash Test" (Space Grotesk bold, branco) nas telas de onboarding.

**Padrão de aplicação:**
- Telas de onboarding/quiz: fundo navy escuro, logo em destaque.
- Transição para fundo claro (`#F7F6F9`) quando entra no "produto" (aula, home, progresso) — reforça "abriu a marca → entrou pra estudar".
- Balão do tutor de IA: bolha navy com detalhe gold e ícone do raio, sempre com bom contraste, flutuando sobre qualquer fundo (claro ou escuro).
- Botões de ação principal: sempre Flash Gold, texto navy ou branco (o que der mais contraste).
- Capriche no acabamento: micro-animações de transição entre telas, animação de XP subindo, confete/brilho sutil no acerto, skeleton/loading states elegantes (nunca tela branca crua), estados vazios desenhados (não só texto "sem dados"). Isto é o "aplicativo mais top" — trate como produto final, não wireframe.

### 5. O balão do tutor de IA — agora GLOBAL e persistente

Esta é uma correção importante da versão anterior: o balão **não pertence só à tela de aula**. Ele é um elemento flutuante fixo no canto inferior direito, **presente em todas as telas do app depois do onboarding** (aula, home, progresso, redação, ranking, plano de estudos — em todas). Ao tocar, abre um painel/chat leve com duas capacidades sempre disponíveis, em qualquer tela:
1. **Perguntar sobre o próprio progresso** — o aluno pode digitar algo como "como estou indo em Matemática?" ou "qual minha maior lacuna essa semana?" e a IA responde em linguagem natural puxando os dados mockados de desempenho (pode ser resposta simulada/roteirizada, mas tem que parecer contextual à pergunta).
2. **Enviar foto de uma questão** — botão de câmera/anexo dentro do painel, o aluno "manda" uma imagem (pode ser mock: qualquer imagem anexada dispara uma resposta pré-pronta convincente da IA "lendo e resolvendo" a questão).
Além disso, sempre que o aluno responde errado uma questão na aula de 60s, o balão automaticamente puxa a atenção (badge/animação) e oferece a micro-explicação do erro — isso continua igual à v1, só que agora é uma das entradas do mesmo balão global, não uma feature isolada da tela de aula.

### 6. As telas do MVP completo

Construa **todas** as telas abaixo — não é mais um recorte mínimo, é o MVP inteiro:

**Tela 1 — Quiz de primeiro acesso (disfarçado de "criar conta"), agora com 5 perguntas**
- Fluxo de **5 perguntas**, uma por tela, formato vertical com swipe/avançar (como um Stories/Reels de perguntas, não formulário longo).
- Pergunta 1 — **Estado onde mora:** seletor com **todos os 26 estados + Distrito Federal**, em formato de lista/grid tocável (pode ter busca/filtro no topo se a lista for longa) — não campo de texto livre.
- Pergunta 2 — **Qual faculdade/curso quer fazer:** lista ampla e realista de faculdades brasileiras (com busca/filtro), cobrindo pelo menos: federais (USP, UNICAMP, UNESP, UFRJ, UFMG, UFBA, UFPE, UFC, UFRGS, UFSC, UnB, UFPR, UFES, UFRN, UFPB, UFAM e outras relevantes), estaduais, e privadas de peso (PUC-SP, PUC-RJ, PUC-MG, PUC-RS, Mackenzie, FGV, Insper, ESPM, Anhembi Morumbi, UNIP, Estácio, UNINOVE), além de opção "outra". Isso alimenta o mapa de lacunas ("pra Medicina na USP, suas lacunas são...").
- Perguntas 3, 4 e 5 — conteúdo (Matemática, Linguagens, História ou similares), usando questões **reais de vestibular** (bancos de questões de ENEM/FUVEST/UNICAMP e similares, não inventadas) para calibrar nível e gerar as primeiras lacunas.
- Visual: fundo navy, uma pergunta grande por tela, opções em cards, barra de progresso do quiz no topo (5 passos).
- Não peça e-mail/senha de verdade — é decorativo, é "criar conta" fake.
- Ao fim, transição para a Tela 2 (aha moment).

**Tela 2 — Aha moment**
- Mensagem tipo: "Já entendi você. Pra [faculdade escolhida], suas 3 maiores lacunas agora: Funções (Mat), Uso da vírgula (Ling), Revolução Industrial (Hist). Bora fechar essas?"
- Mostrar XP inicial + "streak dia 1" começando.
- CTA gold para seguir para a primeira aula.

**Tela 3 — Aula de 60 segundos (o núcleo do produto)**
- Feed vertical, 1–2 questões por "aula" (não uma lista longa — literalmente 1 ou 2 questões e acaba, com barra de progresso da aula visível).
- Uma questão por tela: enunciado (Plus Jakarta Sans), alternativas em cards, resposta com feedback IMEDIATO visual: verde `#0AA35A` se certo, vermelho `#C0392B` se errado, com micro-explicação de 2 linhas embaixo.
- +XP visível a cada acerto (Space Grotesk, cor gold), com animação.
- Precisa dar pra errar de propósito para testar o fluxo do balão global (Seção 5).
- Ao terminar a aula (1-2 questões), tela de fechamento rápida ("aula concluída! +XP, streak mantida") com botão para ir para Home.

**Tela 4 — Micro-treino de redação (agora núcleo do MVP, não extra)**
- Mesma lógica de interação da aula de 60s: uma habilidade por vez, feedback imediato.
- Formato principal: "escolha a melhor tese" (múltipla escolha) — pode incluir também "conserte a conclusão" se der tempo.
- Feedback verde/vermelho igual à Tela 3, com micro-explicação da IA.
- Organizado por competência do ENEM (pode mostrar 1 competência ativa: ex. "Argumentação").

**Tela 5 — Home / meta diária + streak**
- Fundo navy. Mostra: streak atual (número grande em Space Grotesk + gold), meta diária de aulas, botão CTA gold para "começar próxima aula de 60s".
- Espaço para simular notificação/lembrete (pode ser um card ou texto, não precisa ser push real).
- Balão global (Seção 5) presente.

**Tela 6 — Progresso / mapa de lacunas**
- Fundo claro. Visualização do "mapa de lacunas" encolhendo (lista de matérias com barra/%, ou visual tipo radar/heatmap — use bom senso de design, mas tem que comunicar "suas fraquezas estão diminuindo").
- Mostrar XP total, nível, streak, e algo relacionando o progresso à faculdade/curso escolhido no quiz (ex.: "você está X% mais perto de dominar o que [faculdade] cobra").
- Precisa *parecer* que atualizou depois da aula da Tela 3 (mesmo que os dados sejam pré-semeados/mock).
- Balão global (Seção 5) presente.

**Tela 7 — Ranking / turma (mock, mas convincente)**
- Lista de colegas (nomes/avatares fictícios) ranqueados por XP da semana, com o aluno destacado na posição dele.
- Não precisa de backend real — dados mockados bem feitos, com visual à altura do resto do app (gold para destaque do próprio aluno, por exemplo).

**Tela 8 — Plano de estudos (mock, saída da IA)**
- Tela mostrando uma "rota" sugerida pela IA até a data da prova (lista/timeline de tópicos e datas, com as lacunas atuais priorizadas no topo).
- Pode ser estático/mockado, mas precisa parecer gerado especificamente para aquele aluno (referenciar a faculdade e as lacunas do quiz).

### 7. Regras de escopo — ainda não construa isto

Sem autenticação real, sem pagamento, sem perfil/conquistas separado, sem múltiplas matérias completas além do necessário para as telas acima, sem versão web, sem biblioteca de conteúdo extensa. O ranking e o plano de estudos (Telas 7 e 8) são mock — não precisam de lógica real por trás, só parecer produto de verdade na tela.

### 8. Dados de exemplo

Use ~15-20 questões **reais de vestibular** (retiradas de bancos de questões de vestibular de verdade — ENEM, FUVEST, UNICAMP/Comvest, UERJ, UFRGS e similares; não invente enunciados), cobrindo Matemática, Linguagens, História — as mesmas citadas nas lacunas do aha moment — como conteúdo mockado, hardcoded no código, cada uma com gabarito e micro-explicação de verdade. Mais 3-4 exercícios de redação (tipo "escolha a melhor tese"), também baseados em critérios reais de correção de vestibular/ENEM (as 5 competências oficiais), não inventados do zero. Não precisa banco de dados real nem API externa — tudo pode rodar em estado local/mock, exceto se você tiver como simular uma chamada de IA de verdade para a micro-explicação do erro e para as respostas do balão global (isso é um diferencial forte se der tempo, mas não é obrigatório).

### 9. O que entregar

O **aplicativo completo do MVP**, mobile-first (pensado para tela de celular, mesmo se rodar no navegador), com as 8 telas acima navegáveis e o balão do tutor de IA global presente em todas elas. Acabamento de produto real — não protótipo simples: transições suaves, microinterações, estados vazios/loading bem desenhados, fidelidade total ao design system (cores, tipografia, logo). Este é o "aplicativo mais top" que vai para o pitch — trate cada tela com o cuidado de um produto pronto para a loja, não de um rascunho.

---

## Fim do prompt

**Nota de sócio:** Antes de rodar isso, decida com o time se o mascote "foca" (guilt-tripper) entra ou não no protótipo — o prompt acima não menciona ele de propósito porque essa decisão está pendente (`09-branding.md`). Se decidirem incluir, adicione uma seção "Mascote" ao prompt antes de colar. Também vale conferir com quem está na Curadoria de Conteúdo se as 15-20 questões e os 3-4 exercícios de redação já estão prontos antes de rodar o prompt — sem isso, quem constrói fica preso a inventar conteúdo na hora.
