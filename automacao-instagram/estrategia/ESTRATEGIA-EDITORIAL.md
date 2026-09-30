# Estratégia editorial — Instagram do Foca

> Derivada de `docs/produto/persona-joao.md`, `docs/copy/01-estrategia.md`, `docs/copy/06-marketing.md` e `docs/PRODUCT.md`.
> Se uma dessas fontes mudar, este arquivo é que está desatualizado.

## 1. Para quem

**João**, 16 a 19 anos, ensino médio ou pré-vestibular. Estuda no celular, em tempo picado — intervalo, ônibus, fila, antes de dormir. Nativo de Reels: a atenção é curta e disputada.

- **Não falta conteúdo** a ele. Falta começar sem ter que decidir, e saber onde está fraco.
- **O objetivo real, não declarado:** parar de se sentir atrasado.
- **O gatilho é alívio, não ambição.** Culpa não traz o João de volta — ela o faz evitar.
- Público majoritariamente **menor de idade**: nada de pixel, coleta de dado ou campanha que dependa disso.

Um segundo leitor existe de fato no Instagram: **mãe, pai ou professor** que manda o app para o João. Não é o alvo da voz, mas um post por ciclo pode funcionar para os dois.

## 2. A promessa única

> **O próximo passo já está escolhido.**

Benefício, não recurso. É o que o produto entrega hoje (planner com motivo à vista). Aprovação, nota e constância **não entram**: nenhum dado sustenta.

**Big idea:** recomeçar custa quase nada, porque a decisão já vem tomada.

## 3. Pilares editoriais

Cinco pilares. **Sem percentual fixo** — não há histórico de desempenho para justificar um; a proporção se decide olhando o que já saiu (`bun run hist resumo`) e evitando três posts seguidos do mesmo pilar.

| Pilar | O que é | Formatos que funcionam | O que ele **não** é |
|---|---|---|---|
| `reconhecimento` | A situação real de estudar sozinho: travar, abrir o caderno e fechar, a aba do cronograma que nunca virou rotina | carrossel curto, post estático, Reels falado | Frase motivacional sobre superação |
| `util` | Uma orientação aplicável hoje, sem depender do app: como revisar o que errou, como usar 10 minutos parados | carrossel de lista, carrossel de passos | Aula. Não competimos em conteúdo (`08` §0) |
| `produto` | Como o Foca decide o próximo passo, com **tela real** | carrossel demo-walkthrough, motion, Reels de tela | Print inventado. Funcionalidade que não existe |
| `bastidor` | Decisão de produto explicada: por que não tem ranking real, por que a Foca não cobra | post estático, carrossel curto | Storytelling de fundador heroico |
| `personagem` | A Foca: uma foca numa pedra, que comenta a situação | post estático, fala, motion | Piada sobre o aluno, a prova ou a capacidade dele |

## 4. Formatos e quando usar cada um

| Formato | Dimensão | Quando |
|---|---|---|
| Carrossel contínuo | 1080×1350 por página, 4 a 10 páginas | Argumento com desenvolvimento; a continuidade visual é o motivo de deslizar |
| Post estático | 1080×1350 | Uma frase que se sustenta sozinha; fala da Foca; bastidor curto |
| Reels gravado | 1080×1920, 9:16 | Rosto e voz do dono do projeto; é o que o algoritmo do Instagram mais distribui hoje |
| Motion | 1080×1920 (ou 4:5 se pedido) | Demonstração curta, tipografia em movimento, assinatura de marca |

**Arquitetura de carrossel** (escolher antes de escrever as páginas — referência: skill `social`, `references/carousel-frameworks.md`):

- **Problema → prova** (`reconhecimento`, `produto`): capa com a situação, o problema real nomeado, o mecanismo, o recibo (tela real).
- **Lista de valor** (`util`): a capa promete uma contagem exata e cada página paga um item. Contagem prometida = contagem entregue, sem enchimento.
- **Lista de técnicas** (`util`): cada página é uma técnica nomeada, que se sustenta sozinha.
- **Demonstração** (`produto`): resultado primeiro, depois os passos, com tela real em cada um.

Duas regras que valem sempre: **a página 1 é a miniatura do feed** (tem que parar a rolagem sozinha) e **um modelo visual por carrossel** (a variação é do conteúdo, não da moldura).

## 5. Ganchos que servem (e os que não)

**Servem**, porque nomeiam a situação:
- "Por onde eu começo hoje?"
- "Você abre o caderno, olha três matérias e fecha."
- "Decidir cansa mais que estudar."
- "Para quem estuda no intervalo."

**Não servem:** qualquer gancho que prometa algo que o conteúdo não entrega, que prometa resultado, ou que fale *sobre* o aluno de longe ("muita gente trava aqui" como abertura de tudo).

## 6. O que nunca sai daqui

Lista fechada (`docs/copy/01` §6 e `06` §4). O validador (`bun run validar`) barra o que dá para detectar por padrão de texto; o resto é responsabilidade de quem escreve.

- Aprovação, vaga, nota prevista, "você vai passar".
- Duração em segundos ou minutos (**nunca foi medida**).
- Ganho de desempenho em número, número de alunos, depoimento, "aprovado".
- Preço, plano pago, "grátis para sempre". *(“Começar grátis” é permitido — decisão do usuário, 29/09/2026.)*
- "A IA descobre suas lacunas" no sentido de medição no onboarding (o `/aha` é heurística de perfil).
- Ranking real ou comparação com outros alunos (o ranking é mock, e a tela diz isso).
- Retenção: "você vai voltar amanhã", "crie o hábito em N dias".
- Print fictício apresentado como produto real; funcionalidade que ainda não existe.
- Emoji em título ou CTA; sequência de exclamações; "Não é X. É Y."; motivação genérica.
- Cobrança pela ausência, em qualquer forma.

**Fato externo** (aprendizagem, calendário do ENEM, data de prova) só entra com fonte verificada, registrada em `conteudo.json` → `fontesFato`. Sem fonte, o fato não entra.

## 7. O que o Foca **pode** afirmar

Cada linha tem lastro em `docs/copy/01` §4, conferido em 29/09/2026 (o plano `36`, que destravou o nivelamento, está implementado — `docs/37`).

- O próximo passo já vem escolhido, com o motivo à vista.
- Dá para fazer uma atividade no intervalo *(sem dizer quanto tempo)*.
- A lição tem de **4 a 8 questões** — o único número específico autorizado.
- Você vê onde a base já está firme e onde ainda não (por faixa, nunca por nota ou porcentagem).
- O que você estudou volta na hora de revisar.
- Errar mostra o que revisar. O tutor só abre quando você pede.
- Parou uns dias? Continua de onde estava, sem cobrança.
- Uma ordem para estudar, em vez de mais material.
- O nivelamento é opcional e dá um ponto de partida por faixa.

## 8. CTA

Um por conteúdo, nunca três. Alternar entre:

- **Nenhum.** Conteúdo `util` e `reconhecimento` funcionam sem CTA, e é isso que impede o perfil de virar propaganda.
- "Salva para quando travar." — quando o conteúdo é de consulta.
- "Marca quem some no domingo à noite." — quando é de reconhecimento.
- "Começar grátis" — só quando o post fala do produto.
- "Me conta por onde você trava." — quando a pergunta é honesta e vai ser respondida.

## 9. Ritmo

Sem calendário rígido enquanto não houver histórico. Diretriz de trabalho:

- Não repetir pilar em dois conteúdos seguidos.
- Cada bloco de cinco conteúdos tem pelo menos um `util` e no máximo um `produto` com CTA de produto.
- Publicar dentro da janela 08h–21h (`America/Sao_Paulo`), coerente com a regra do próprio produto (`16` §9).

## 10. Áudio

Não há trilha licenciada no repositório. Regra prática:

- **Motion exportado por aqui sai sem música** ou com áudio de autoria/licença registrada em `conteudo.json`.
- Não presuma que uma música popular pode ser embutida no MP4 e publicada pela API: pela API, o áudio vai embutido e **não** passa pelo licenciamento do Instagram.
- Quando a música precisar ser do acervo do Instagram, exporte o vídeo **mudo** e adicione a faixa no aplicativo, na publicação manual. O agente entrega a versão muda e a instrução.

## 11. Medição

Não há analytics e não haverá sem spec (`20` §14 e §22). O que existe é o histórico local: o que foi publicado, quando, e com qual gancho. Desempenho, quando houver, entra à mão no registro.
