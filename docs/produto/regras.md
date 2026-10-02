---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [regras de produto]
substitui: []
substituido-por: null
---

# Regras de produto vigentes

> **Como usar.** Esta é a fonte canônica das regras de produto, voz, pedagogia, gamificação, conteúdo, uso da mascote, afirmações públicas e privacidade. Cada regra cita a origem como `(NN §x)`, onde `NN` é o ID permanente do documento; o mapa `docs/historico/README.md` resolve cada ID para o caminho atual.
> Se uma regra daqui conflitar com um plano arquivado, **vale esta**. Se conflitar com o código, registre a divergência (seção 11 e o registro da iniciativa ativa) e não mude nenhum dos dois em silêncio.
> Contratos de código (feedback, tutor, XP, estado, motor, nivelamento, rotas) estão em [arquitetura/contratos.md](../arquitetura/contratos.md). Design (paleta, geometria, tema) fica em `design/`; aqui só há remissão.

Convenções: "substituída pela 46 §x" marca uma regra antiga que o plano 46 trocou; o texto novo vale a partir da aprovação do 46 (29/09/2026), e o estado de implementação está em `docs/ESTADO.md` e no registro da 46.

## 1. Princípios de produto

- **R-PROD-1: IA no centro, não cosmética.** A IA precisa ser estrutural, não "um app com um chatbot decorativo". Toda feature de IA responde: o que ela decide ou gera, com que dado, e o que acontece se errar. Números são regra de negócio; só a frase é IA; nunca vender heurística como inteligência. (00 "Regras não negociáveis" item 2; 08 §6 via PRODUCT "Product Principles" 4)
- **R-PROD-2: IA com rede de segurança.** A IA gera conteúdo offline com verificação e explica com contexto; a decisão pedagógica em tempo real é regra transparente e testável, nunca "a IA descobriu". (30 §6 itens 4 e 7)
- **R-PROD-3: Persona única.** Toda feature, frase e tela passa pelo teste: "isso resolve o João, ou um estudante genérico?". Três perguntas dele guiam a UX: "Eu toco em Continuar e começo a estudar?", "O que eu fiz mudou alguma coisa?", "Posso confiar que o que eu fiz ficou salvo?". (14 §0; 36 §F.1)
- **R-PROD-4: Constância e direção, não conteúdo.** O conteúdo cresce para abastecer a jornada, não para virar biblioteca. Proposta que compete em "mais conteúdo" perde por padrão. (08 §0 via PRODUCT; 30 §6 item 2)
- **R-PROD-5: Custo de começar quase zero.** Uma unidade curta e um CTA; o app decide o próximo passo. Sessões de 5 a 15 min. (14 §8; 30 §6 item 1)
- **R-PROD-6: Honestidade de medida.** Número só aparece com evidência mínima; "Ainda medindo" é resposta válida. (30 §6 item 3)
- **R-PROD-7: Conservador por padrão.** Na dúvida, consolidar antes de avançar. Fundamento nunca é pulado sem confirmação. (30 §6 item 5)
- **R-PROD-8: Sem culpa.** Errar e dizer "não sei" são dados, não falhas. (30 §6 item 6; 15 §3.3)
- **R-PROD-9: Incremental.** Cada entrega é testável atrás de flag, sem reescrever o que funciona. Desligar uma flag nunca apaga dado. (30 §6 item 8; 22 §5)
- **R-PROD-10: Unidade curta sem promessa de duração.** O produto se descreve como "aulas curtas" (a lição da trilha tem 4 a 8 questões, o `/study` tem 2). "60 segundos" sai da marca: tagline "Estudo curto, todo dia."; descrição "Preparação para o ENEM em aulas curtas. A Foca acompanha o que você já sabe e escolhe o próximo passo." (36 K2, RU-20)
- **R-PROD-11: Sem previsão de nota e sem TRI oficial.** Proibido prever nota do ENEM ou converter θ para a escala do ENEM. O modelo é "inspirado em TRI"; em nenhum lugar (UI, docs, pitch) se afirma "TRI validada": os parâmetros são estimativas editoriais e nenhum item foi calibrado por dados de resposta. (20 §13; 30 §5, §12.4; 36 §G.2)
- **R-PROD-12: Sem geração em tempo de uso.** Em tempo de uso, "dinâmico" é seleção e sequência, não texto novo. A IA gera conteúdo só no pipeline offline, com portões. (30 §5; 25 §4)
- **R-PROD-13: Curso não prevê nada.** O curso pretendido nunca é usado para prever nota de corte ou inferir área de prova. (36 §F.7)

## 2. Escopo: o que está autorizado e o que não está

- **R-ESC-1: Backend, banco, autenticação e sincronização.** Regra antiga: "sem backend, sem banco, sem autenticação real; cadastro e login são mock intencional; backend e sincronização não autorizados". (20 §15.1, §15.4, §22; PRODUCT; CLAUDE "Stack real") **(substituída pela 46 §B.4):** contas reais, dados de estudo no servidor e sincronização estão autorizados nos limites da 46 §E. Um só store no cliente continua valendo; a sincronização é extensão dele. (46 §B.2)
- **R-ESC-2: Estudo exige conta; não há modo convidado.** O onboarding de perfil pode ser respondido antes do cadastro, mas estudar, nivelar e usar a Foca IA só com conta. (46 §0 D-07) Nota de precedência: a 46 §E.3 ("modo convidado, recomendado") e a linha 1 da 46 §B.4 ("o modo convidado continua local") foram escritas antes da decisão; pelo cabeçalho do §0, vale a D-07.
- **R-ESC-3: Pagamento.** Fora do escopo; o campo `plano` existe no perfil só para o futuro, e todo aluno começa no plano grátis. (20 §22; 46 §B.3, §0 D-12) **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2.
- **R-ESC-4: Ranking.** Ranking real entre alunos está fora. O ranking demonstrativo é identificado como tal na tela e sai dos fluxos de produção (fica como fixture). (20 §12, §22; 46 §B.3, §C.6) **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2.
- **R-ESC-5: Analytics externo.** Proibido sem spec própria. Eventos de aprendizagem ficam locais (limite 300), sem envio. (20 §14.2, §22; 30 §21.4, §21.5; 46 §B.3)
- **R-ESC-6: Não autorizados sem decisão específica:** notas previstas, geração livre de aulas em tempo real, correção de redação por IA, simulado completo, painel de responsáveis, notificações. (20 §22; 30 §5; 46 §B.3) **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** notificações deixam de ser proibidas: há um lembrete diário **opt-in** (08h–21h, no máximo 1 por dia, pausa automática; R-GAM-2 item 6); o simulado completo existe no Pro (só itens oficiais do INEP com gabarito oficial); a estimativa de redação por IA só liga depois da validação de §5.10.5. Continuam fora: notas previstas, aulas geradas em tempo real e painel de responsáveis.
- **R-ESC-7: Sem economia de jogo.** Sem moedas, gemas, vidas, energia, baú, multiplicadores aleatórios ou compra de progresso. (20 §12; 30 §5; 27 §15 D-2; 16 §7) **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2. **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** **permitidas** as Pérolas (moeda ganha só aprendendo, nunca vendida por dinheiro) e o baú **de conteúdo conhecido** nos marcos de ofensiva. **Continuam proibidos:** vender moeda, energia, recompensa aleatória, multiplicador, comprar XP, dias de ofensiva, posição na liga ou pular conteúdo.
- **R-ESC-8: Dependências.** Sem nova biblioteca de UI, nova dependência de IA ou nova biblioteca de áudio sem decisão registrada em spec. (20 "Como usar" item 8; 25 "Como usar" item 4)
- **R-ESC-9: Tipos de exercício.** Os 7 tipos atuais bastam; tipo novo exige spec. (30 §5) **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** tipo novo **`escrita`** (resposta aberta, sem gabarito, sem nota automática) para as tarefas "Escreva" da redação. Fica fora da união `Exercise` (o player corrige por gabarito): as tarefas são nós próprios do hub de Redação (`src/content/tarefas-escrita/`, `src/lib/escrita.ts`).

## 3. Privacidade e menores

- **R-PRIV-1: Coleta de dados de menores.** Regra antiga: "coleta adicional de dados de menores não está autorizada". (20 §22; PRODUCT "Users") **(substituída pela 46 §B.4):** autorizada **somente** a coleta listada na 46 §E.2/§H.2 (e-mail, faixa etária, consentimentos, dados de estudo). Qualquer outra coleta continua proibida sem spec. O perfil não guarda data completa de nascimento, escola, cidade nem telefone. (46 §E.2)
- **R-PRIV-2: Idade.** Conta a partir de 17 anos. Foca IA aos 17 com consentimento do responsável; 18+ direto. Com a R-ESC-2, quem tem menos de 17 anos não usa o app. A idade mínima é configurável (`MIN_ACCOUNT_AGE`) para a revisão jurídica mudar um valor, não o código. (46 §0 D-08, §H.3)
- **R-PRIV-3: O que sai do aparelho.** Regra antiga: "nada novo sai do aparelho além do que o tutor já envia". (30 §21.5) **(substituída pela 46 §E.4):** os dados de estudo passam a ir para o servidor nos termos da 46. Continua valendo: o tutor recebe só o contexto pedagógico limitado; não há analytics nem publicidade. (30 §21.5; 46 §H.2) **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2.
- **R-PRIV-4: Imagens e conversa do tutor.** Não persistir imagem nem base64 no histórico de aprendizagem. (20 §14.2, §15.2) Na produção, a foto e o conteúdo do chat não são guardados. (46 §E.7, §0 D-13)
- **R-PRIV-5: Nada de inferência sensível.** Não inferir estado emocional nem afirmar "conteúdo esquecido" como fato sem dados. (20 §13)
- **R-PRIV-6: Dados do Inep.** Usar só o arquivo de itens/parâmetros dos microdados; nunca baixar nem versionar o arquivo de respostas de participantes. (34 "Rastreabilidade")

## 4. Voz e copy

Norma de origem: 20 §7.1. Guia operacional: [COPY.md](../COPY.md) e `docs/copy/` (dez proibições, glossário, matriz de tom). As regras abaixo são a norma; o guia detalha.

- **R-VOZ-1: Personalidade.** "Colega de estudo atento, direto, que entende a dificuldade sem dramatizar. Não é professor dando sermão, coach ou adolescente performático." (20 §7.1)
- **R-VOZ-2: Regras por aspecto.** Palavras comuns e verbos concretos; termo técnico explicado. "Você", "vamos", sem gíria forçada. Humor no máximo uma vez por sessão, sobre a mascote ou a situação, nunca sobre a capacidade do aluno. Sem emoji em controles, erros, explicações ou alertas. Sem sequência de exclamações. Na correção, dizer o que muda na resposta, sem julgar. No acerto, confirmar curto. No retorno, convidar sem culpa, ameaça ou cobrança pela ausência. Tutor: resposta inicial de até quatro frases. (20 §7.1)
- **R-VOZ-3: Tamanhos-alvo.** "botão 1–4 palavras; feedback 2–7 palavras; fala decorativa até 14 palavras; explicação curta 25–55 palavras; card de ensino 15–35 palavras." São diretrizes de edição, não truncamento cego de conteúdo pedagógico. (20 §7.1)
- **R-VOZ-4: Cobra comportamento, nunca a pessoa.** Nunca julgar identidade ("você é ruim em X"). A porta de volta nunca tem cobrança. Errar não gera cobrança nenhuma. (15 §3.1–§3.3) A parte "sarcasmo no dia a dia" e a cobrança por ausência do 15 §3.2 estão **superadas** pelo 20 §7.1: não se cobra ausência. (20 "Precedência"; COPY proibição 1)
- **R-VOZ-5: Causa do erro.** Não atribuir o erro a "desatenção", "interpretação" ou "falta de esforço" sem evidência. Microcopy não substitui explicação. (20 §5)
- **R-VOZ-6: Promessas.** Nenhuma copy promete o que o produto não demonstra: aprovação, nota, retenção, número de alunos, preço, duração. Não inventar depoimento nem afirmar que o aluno volta. (CLAUDE "Copy e escrita"; PRODUCT "Evidence on Hand"; COPY proibição 3)
- **R-VOZ-7: Medição na linguagem.** "Domina", "dominado", nota, porcentagem ou "nível N" não aparecem como resultado de medição. Na revisão devida, "Revisão sugerida", nunca "Você perdeu seu domínio". (COPY proibição 6; 20 §11) Esta regra de texto (28/09/2026) prevalece sobre o rótulo "Dominado" previsto em 30 §10.4; ver divergência DV-2.
- **R-VOZ-8: Glossário.** trilha (não "jornada" para o aluno), lição (não "aula"; "videoaula" fica), atividade, capítulo, seção, revisão, checagem (não "checkpoint"), nivelamento, faixa (Base em construção, No caminho, Base firme), sequência ("streak" só no código), Foca. (COPY D-3, D-4; copy/03 §3) Ver divergência DV-3.
- **R-VOZ-9: Onde a string mora.** Funcional em `src/lib/copy.ts` com linha no inventário `21`; fala da mascote em `src/lib/voz.ts`, escolhida no evento e armazenada; persona do tutor em `src/lib/tutor-prompt.ts` (mudança é revisão L2); título e descrição em `src/lib/brand.ts`. Nunca texto fixo na tela. (20 §7.2; COPY "Onde a string mora")
- **R-VOZ-10: Conteúdo pedagógico intocável por copy.** Nenhuma skill de copy altera enunciado, alternativa, gabarito, fórmula, dado, citação ou texto de questão oficial. Trocar rótulo visível não muda ID, categoria nem código. (copy/05; 20 §7.2)
- **R-VOZ-11: Sem "dopamina".** Recompensa se justifica por feedback informativo, competência percebida, progresso e autonomia, sem promessa neurocientífica. (20 "Precedência")
- **R-VOZ-12: Posicionamento.** A frase de posicionamento atual está mantida por decisão do proprietário (D-1, 28/09/2026) e só muda com nova aprovação. (COPY D-1; copy/01 §5.4)
- **R-VOZ-13: "Salvo" só quando salvou.** Texto que diz que o progresso foi salvo só aparece quando a gravação deu certo; senão, a variante neutra. (36 RF-14; 37 D-77) Mecanismo em contratos C-PERS-1.

## 5. Pedagogia

- **R-PED-1: Consistência, não domínio certificado.** O selo "consistente" exige: "pelo menos cinco exercícios distintos elegíveis; pelo menos duas datas locais; acerto em pelo menos quatro dos últimos cinco itens elegíveis; ao menos uma revisão correta após intervalo ≥ 24 h". Sem isso, "Em prática" ou "Pouca evidência", com denominador quando houver percentual. São critérios heurísticos, não psicometria. (20 §13)
- **R-PED-2: Ajuda não é evidência independente.** Tentativa com dica ou tutor antes de responder é assistida. A checagem dentro da lição mede compreensão imediata, não retenção nem domínio, e não dá XP. Repetir o mesmo enunciado em seguida não é evidência nova. (20 §9, §13; 30 §7.3) **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** mantida e aplicada: a revisão de erros no fim da lição não atualiza o domínio, não dá XP e não conta para combo nem para estrelas.
- **R-PED-3: Tempo sem estudar não é esquecimento.** O tempo reduz a confiança da medida, nunca a estimativa de acerto; a UI não diz "você esqueceu". Esquecimento só aparece quando o aluno erra uma revisão ou checagem. (30 §9.4; 36 §G.1)
- **R-PED-4: Ensino antes da prática.** Explicação curta precede a prática. Explicação de 30 a 90 segundos, tempo de prática informado à parte. Se o objetivo não cabe, dividir a lição; não comprimir até ficar incorreta. Estimativas são metadado, não contagem regressiva. (20 §8.1, "Precedência")
- **R-PED-5: Trilha nunca pune.** Concluir não exige 100 %. Revisão não bloqueia de novo conteúdo concluído. Uma lição pode estar concluída e precisar de revisão, sem apagar o check. (20 §11; 25 §6.6)
- **R-PED-6: Erro repetido.** Quem erra repetidamente recebe ensino opcional; nunca a IA abre sozinha nem a trilha bloqueia. (20 §18)
- **R-PED-7: Nivelamento é opcional e não é nota.** Oferecido depois do perfil, dispensável, disponível depois no Perfil e na home. O resultado mostra só o que foi medido: faixa por área e precisão, nunca nota, porcentagem, ranking ou "nível N". (30 §12.1, §12.5; 36 RP-6) Contrato de tela em C-NIV-8.
- **R-PED-8: Modo foco.** Preferência permanente filtra a jornada às matérias escolhidas; revisões fora do foco não aparecem. A sessão "Só hoje" sobrepõe a permanente até o fim do dia; depois de 3 dias, uma revisão fora do foco pode entrar com motivo explícito. Nada é apagado; fora do foco, a confiança só envelhece. (30 §15)
- **R-PED-9: Motivo sempre visível.** Toda atividade da jornada mostra o motivo em uma frase, gerado por regra. Número no motivo só vem do estado. (30 §6 item 4, §14.2)
- **R-PED-10: Jornada contínua, atividade com fim.** A jornada não termina enquanto houver conteúdo elegível; cada atividade e cada lição têm fim. Sem conteúdo elegível, o card diz isso com honestidade e oferece o mapa das matérias. (30 §14.5; 16 §9 item 1)
- **R-PED-11: Dicas de vestibular.** Aparecem só inline no recap depois de concluir o bloco, nunca no meio da resposta, em modal ou tela obrigatória. No máximo uma espontânea por dia local; o mesmo ID não se repete em 14 dias. Botão de dispensar e preferência `showExamTips`. Só para perfil de prova escolhido explicitamente; no PAS, etapa e ciclo têm de bater; vestibular nunca é deduzido da universidade. Dica fora da validade não aparece; sem dica elegível, nada aparece. Dica pedida pode ignorar o limite diário, não a validade nem o perfil. Não transformar exemplo informal em alegação oficial. (20 §10)
- **R-PED-12: Honestidade sobre o método.** Recuperação ativa, espaçamento e exemplo resolvido são direções sustentadas por pesquisa, mas não garantem ganho nesta implementação sem medir. (20 §13; 30 §7.5)

## 6. Gamificação e recompensa

Números de XP, faixas e ledger estão em contratos C-XP. Aqui ficam as regras de produto.

- **R-GAM-1: O que o XP mede.** XP mede atividade e recompensa, não conhecimento nem nota prevista. O aluno precisa entender o que concluiu, o que consegue fazer com evidência e o próximo passo útil. (20 §12)
- **R-GAM-2: Linhas que não se cruzam.** (16 §9) **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2. **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** item 2 continua e vale para baú (conteúdo mostrado antes de abrir), missões e loja; item 5: ligas 18+ com divisões, grupos de até 20, sobe e desce **sem destaque para quem desce**, convite só na ofensiva com amigos (18+); item 6: o lembrete diário é opt-in dentro dessa janela e desse limite, com pausa automática.
  1. "Nada de rolagem infinita." Aula tem fim.
  2. "Nada de recompensa aleatória" (loot box, baú surpresa, XP variável).
  3. "Nada de bloquear estudo como punição" (vidas).
  4. "Nada de ansiedade monetizada": não se vende recuperação de sequência.
  5. "Nada de comparação humilhante." Ranking mostra a turma, nunca "você é o pior".
  6. "Nada de notificação fora de hora." Janela 08h–21h, no máximo 1 por dia.
  7. "Nada de esconder o botão de sair."
- **R-GAM-3: Sequência (streak).** Incrementa com qualquer atividade concluída no dia, no máximo uma vez por dia, pela data local da conclusão. Congelamento automático: +1 a cada 7 dias de atividade, máximo 2 guardados, cada um cobre um dia parado; o aluno descobre depois, sem gerenciar. Ao quebrar, volta a zero sem drama visual nem som de derrota; ao voltar, o recorde anterior aparece como meta. Nunca bloqueia conteúdo, nunca custa dinheiro, nunca é chantagem. (16 §6; 20 §12; 41 V-4) **Apresentação (48 D48-14):** o topo da trilha mostra a chama com o número de dias dentro — laranja se já houve estudo hoje, cinza se ainda não (48 D48-18) — e as proteções guardadas; ao tocar, explica a regra, mostra o dia coberto por proteção nos últimos 7 dias, o recorde como meta depois de uma pausa e de onde vêm os números (confirmado pela conta, atualizando, ou deste aparelho). "Descobre depois, sem gerenciar" continua: nada a acionar. Código: `src/lib/recompensas.ts#avancarSequencia` (fonte única, com `diaProtegido`), `src/lib/store.ts#registrarAtividade`, `src/components/learning/IndicadorSequencia.tsx`. **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2.
- **R-GAM-4: Meta diária.** A unidade é o bloco concluído (lição, atividade, redação ou sessão de revisão); checagem, abrir o tutor, abrir o app ou card sem concluir não contam. Meta de novo usuário: um bloco; escolha explícita de usuário existente é mantida. Passar da meta não dá recompensa extra escalonada. (20 §12; 16 §8) Ver divergência DV-1.
- **R-GAM-5: Mecânicas recusadas.** Vidas/corações, gemas/moeda, recompensa variável e notificação com culpa. Conquistas ficam para depois. (16 §7) **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2. **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** Pérolas e conquistas aceitas; recompensa variável continua recusada; notificação com culpa continua recusada.
- **R-GAM-6: Celebração não prende.** Celebração maior nunca é obrigatória para avançar; várias recompensas juntas tocam só o som de maior prioridade, sem fila de jingles. (20 §5)
- **R-GAM-7: Movimento reduzido.** Com `prefers-reduced-motion`, a recompensa continua (cor, som, número), sem movimento. Recompensa não depende de animação. (16 §5)

## 7. Mascote (uso da Foca)

Tabela completa de expressões, assets e movimento: `design/mascote.md` (origem 15 §5, 44 §6).

- **R-MASC-1: Onde aparece.** Em transições emocionais, não como decoração: splash/primeiro acesso, aha, erro (pequena, no tutor), fim de lição, retorno depois de sumir, estados vazios. **Ausente** no cabeçalho de tela comum, durante a questão e durante o checkpoint da trilha. (15 §4; 30 §22) A linha "streak em risco / notificação: a cobrança clássica" do 15 §4 está superada (R-VOZ-4). **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** a Foca continua ausente durante a questão **antes** da resposta; **depois** da resposta aparece só na folha de feedback, `empolgada`, nos marcos de combo 5 e 10.
- **R-MASC-2: Erro nunca é punição.** Depois de errar, a Foca nunca aparece decepcionada, brava ou cobrando: erro → `acolhedora`; "Não sei" → `neutra`. `desapontada` só quando a falha é do app. `cobrando` não é usada em nenhum fluxo do aluno. (44 §1 I-5, §6; 15 §5)
- **R-MASC-3: Um ponto de logo.** A Foca aparece sempre via `<FocaMark />`, nunca esticada nem rotacionada. Sem `expression`, é a logo oficial (Foca de frente colorida). Expressão desconhecida cai em `neutra`. (15 §5; 44 §6; CLAUDE "Design system") Código: `src/components/brand/FocaMark.tsx`, `src/lib/brand/foca-expressions.ts`. **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** a Foca inteira continua sem esticar nem rotacionar; **partes articuladas** do corpo (nadadeiras, cauda) giram até 25° em torno da articulação. O corpo inteiro entra pelo próprio `FocaMark` (`forma="corpo"`), que continua o único ponto de desenho.
- **R-MASC-4: Ícone de marca.** Quando a marca aparece só como ícone (favicon, ícone de app/PWA, atalho, apple-touch, og do produto), é a logo oficial sobre o azul oficial `--mar`. Expressões nunca substituem esse ícone. (44 §1 I-4, §7)
- **R-MASC-5: Troca de expressão.** "Piscar" (achata no eixo Y, troca no fundo do movimento, volta com `--ease-bounce`); nunca crossfade nem rotação; com movimento reduzido, troca direta. (44 §6; 15 §5)
- **R-MASC-6: Falas.** Falas da Foca vêm de `src/lib/voz.ts` (`fala(slot)`), nunca escritas na tela. (CLAUDE "Design system")
- **R-MASC-7: Humor fora da explicação.** No tutor, humor só antes ou depois da explicação, nunca dentro do raciocínio. (15 §6; CLAUDE "Copy")

## 8. Conteúdo

Metadados, proveniência, `retired`, validadores e pipeline estão em contratos C-ITEM e C-PIPE.

- **R-CONT-1: Questões oficiais do ENEM.** Autorizado reproduzir o texto de questões do ENEM de qualquer edição, **sempre** com o ano e "ENEM" visíveis junto ao enunciado, sem exceção. Decisão de negócio do proprietário (23/09/2026), sem parecer jurídico formal: risco aceito. (34 "A decisão"; 30 §18.4; 32 "Decisões do usuário" 2) A atribuição também aparece na folha de feedback. (36 RP-10)
- **R-CONT-2: Texto de terceiros dentro da questão.** Aprovado como citação, com a fonte original quando o Inep a informa. (34 "O que a decisão cobre")
- **R-CONT-3: Imagens.** Nenhuma imagem, charge, gráfico ou mapa de terceiros, nem em item oficial. Item cuja resolução dependa disso não é importado ("requer imagem — não importado"). Toda imagem de item é autoral (SVG controlado ou diagrama do catálogo). (34; 30 §18.4) **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** imagens do item oficial do INEP entram **sem alteração**, com crédito, alt e descrição longa; o risco de direitos de terceiros foi aceito pelo dono na aprovação ([decisão 0008](../decisoes/0008-questoes-com-imagem-e-fontes.md)). Imagem de item autoral continua autoral.
- **R-CONT-4: Outras bancas e fontes.** Provas de outros vestibulares (Fuvest, Unicamp, Cebraspe/PAS) não são reproduzidas; itens "no estilo" são autorais e não alegam origem. APIs comunitárias de questões não são fonte. (34; 30 §18.4) **Em vigor pela 50 (publicada em 02/10/2026; [spec 50](../specs/50-gamificacao-e-pratica/spec.md) §0.2):** provas do INEP (ENEM, PPL, ENCCEJA) entram como itens oficiais; outros vestibulares só com licença por banca (por enquanto nenhum); APIs comunitárias continuam fora.
- **R-CONT-5: Oficial é intocável no texto.** Nunca alterar enunciado nem alternativas de item oficial; só metadados. Se o texto precisar mudar, o item é retirado. (36 §G.6)
- **R-CONT-6: Origem honesta.** Ausência de fonte significa autoral ou fonte não verificada, nunca "questão oficial". (20 §9)
- **R-CONT-7: Proveniência da revisão.** Cada item diz como foi revisado. Revisão delegada a IA (`ia-delegada`) não é revisão humana e nunca é apresentada como tal. (36 §G.5, RP-9; PRODUCT "Evidence on Hand")
- **R-CONT-8: Curadoria antes de escalar.** Conteúdo só cresce depois de curadoria e revisão; reuso de questão existente exige revisão e adequação à habilidade. (20 §8.3, §9; 22 §6)

## 9. Marketing e afirmações públicas

Vale para landing, loja, redes e pitch. Guia operacional: `docs/copy/06-marketing.md`.

- **R-MKT-1: Lista fechada de afirmações.** Toda afirmação pública precisa estar nesta lista. (40 §9.4; 42 §5)

  | # | Afirmação | Estado |
  |---|---|---|
  | F-1 | O próximo passo vem escolhido, com o motivo à vista | vale |
  | F-2 | Atividades curtas, que cabem no intervalo (sem duração) | vale |
  | F-3 | Lição de 4 a 8 questões | vale (41 V-2) |
  | F-5 | Começar não custa nada / sem cartão | vale, via F-22 (42 U-3) |
  | F-6 | Nivelamento opcional, com "Não sei", resultado em faixas, ponto de partida | vale |
  | F-7 | "Não sei" em toda questão | vale |
  | F-8 | Explicação na hora; "Ver resolução"; "Explicar melhor" chama a Foca | vale |
  | F-9 | A Foca não abre sozinha quando você erra | vale |
  | F-10 | Pode mandar foto de questão para a Foca | só com a chave de IA em produção (41 V-1) |
  | F-11 | O que você estudou volta na hora de revisar | vale |
  | F-12 | Faixas: Base em construção, No caminho, Base firme | vale |
  | F-13 | Sequência com congelamento: 1 a cada 7 dias de atividade, até 2 guardados, cada um cobre um dia parado | vale (41 V-4) |
  | F-14 | Ao voltar, o app vai direto ao próximo passo | vale |
  | F-16 | Não compara com outros alunos | sem uso (41 §5 item 7) |
  | F-17 | Exercícios de redação no mesmo formato curto | vale como "lições curtas" (41 V-3) |
  | F-18 | Sem vínculo com INEP/MEC | vale |
  | F-22 | Começar é grátis | vale (42 U-3) |
  | F-23 | A Foca sabe de qual questão você está falando quando você pede ajuda | vale |
  | F-24 | As telas mostradas são as do app (texto literal) | vale |

  Fora da lista: F-4 "sem e-mail e sem senha" e F-15 "progresso fica no aparelho" (42 U-2), e as negativas F-19, F-20, F-21 (42 U-1). Com a 46, F-10, F-14 e F-17 continuam dependendo do que estiver implementado; revisar a lista quando a F10 da 46 mudar o produto.
- **R-MKT-2: Nunca dizer que não precisa de conta.** A landing representa o produto final. (42 U-2; coerente com 46 §0 D-07)
- **R-MKT-3: Nada de lista do que o Foca não faz.** Nenhuma seção "o que o Foca não faz" nem frases negativas equivalentes. (42 U-1)
- **R-MKT-4: Grátis sem promessa de preço.** "Comece grátis" é permitido. Proibidos: preço, "grátis para sempre", "100% grátis", plano pago, Premium, "sem anúncios". (42 U-3; 40 §10) **Revista pela 49 (aprovada em 02/10/2026):** o texto novo entra em vigor quando a entrega da [spec 49](../specs/49-planos-e-monetizacao/spec.md) que a implementa for publicada; ver 49 §5.11 e T-49.0.2.
- **R-MKT-5: Regras de texto da landing.** Zero travessão (— e –) em texto visível, `alt` e `aria-label`. Proibidos: "60 segundos" e qualquer duração, "aprova", "aprovação", "vaga", "nota", "%", "domina", "Mastery", "IA que descobre suas lacunas", "revolucion", "incrível", "transforme", "potencialize", "desbloqueie", "jornada", "grátis para sempre", "garantido", "milhares", "Duolingo". Proibido o padrão "Não é X. É Y." e variações. No máximo 3 eyebrows na página. Números só de fatos da R-MKT-1, nunca número de pessoas. Sem nome de concorrente ("videoaula", "apostila", "app oficial"). Termos do glossário (R-VOZ-8). (40 §9.2)
- **R-MKT-6: Onde mora o texto da landing.** Todo texto em `src/marketing/content/copy.ts`; telas do app refeitas em `src/marketing/content/app-screens.ts`, com texto literal do app e teste contra `src/`. (40 §9.2 item 6; 42 §5; 45 §2)
- **R-MKT-7: Humor na landing.** Uma só linha de humor da Foca na página inteira, sobre ela viver numa pedra. (40 §9.1)
- **R-MKT-8: Publicação nas redes.** Publicar ou agendar conteúdo exige pedido explícito do proprietário para um conteúdo identificado. (CLAUDE "Automação de Instagram")

## 10. Design (remissão)

Não há regra de design neste documento. Fontes: `src/styles.css` e `design/sistema-rabisco.md` (origem 18 §6 paleta e papéis de cor, §8.5 o que a Foca nunca faz na interface, §12.4 dark mode), resumo em [DESIGN.md](../DESIGN.md). Regras de marca da mascote estão na seção 7 (44 I-4/I-5).

## 11. Divergências conhecidas (regra × código)

Registradas, não corrigidas por este documento.

| ID | Regra | Código | Situação |
|---|---|---|---|
| DV-1 | R-GAM-4: meta de novo usuário é 1 bloco (20 §12; 16 §8) | `src/lib/store.ts:238` cria `dailyLessons: 3`; a meta é lida em `src/components/learning/TrailHeader.tsx:18,26` | Novo usuário começa com meta 3. O Perfil ainda mostra "aulas de 60s" (`src/routes/profile.tsx:277`; pendência do 45 §10) |
| DV-2 | R-VOZ-7 e 30 §10.4 ("Dominado" só com M ≥ 80, C ≥ 75 e consistência) | `src/routes/progress.tsx:55-61` mostra "Dominado" por porcentagem de acerto por matéria com 5 ou mais respostas | Rótulo legado fora das duas regras |
| DV-3 | R-VOZ-8: "checkpoint" sai da interface (COPY D-4) | `src/lib/copy.ts:195,208-209,310-311` ainda exibe "Checkpoint" para o checkpoint da trilha (a checagem dentro da lição já é "Checagem rápida", `:88`) | A migração de strings é outro plano (COPY "Manutenção") |
| DV-4 | R-VOZ-6/R-PROD-10: sem "60 segundos" | Falas com "60 segundos" em `voz.ts`, "Sem e-mail, sem senha" no onboarding (45 §10) | Pendente de migração de copy |

## 12. Regras antigas substituídas pela 46 (resumo)

| Regra antiga | Origem | Agora |
|---|---|---|
| Cadastro e login são mock intencional | CLAUDE "Stack real"; PRODUCT | Contas reais (46 §E.3); R-ESC-1 |
| Sem autenticação real, sem pagamento | CLAUDE "Regras de escopo"; PRODUCT | Autenticação no escopo; pagamento fora (R-ESC-3) |
| Backend e sincronização não autorizados | 20 §15.1, §15.4, §22 | Autorizados nos limites da 46 §E (R-ESC-1) |
| Coleta adicional de dados de menores não autorizada | 20 §22; PRODUCT | Só a coleta da 46 §E.2/§H.2 (R-PRIV-1) |
| Estudo sem conta, dados só no aparelho | 42 F-15; 30 §5 | Estudo exige conta (R-ESC-2) |
| Quiz de entrada sem e-mail e sem senha | 14 §8; 40 F-4 | O perfil pode ser respondido antes do cadastro; estudar exige conta (46 §0 D-07) |
| Repo conectado ao Lovable | CLAUDE "Git/Lovable" | Regra geral de Git sem Lovable (46 §D.1.6, §0 D-04) |

A 46 não substitui nenhuma regra pedagógica, de voz, de marca ou de acessibilidade. (46 §0 "Prevalece sobre", §B.2)
