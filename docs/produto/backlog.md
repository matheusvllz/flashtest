---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [backlog do produto]
substitui: []
substituido-por: null
---

# Backlog do produto

Pendências reais do Foca, consolidadas dos registros de execução e dos achados do plano `46` (T-01.4). Itens de venda e distribuição (pagamento, afiliados, APK, loja, WhatsApp, Instagram) ficam na [checklist de lançamento](lancamento.md) e só aparecem aqui quando algum registro os cita como pendência de produto.

## Como usar

- **Prioridade:** **P0** bloqueia lançar (contas abertas ao público) · **P1** bloqueia vender ou afeta a qualidade central · **P2** melhoria.
- **ID** `B-NNN` é estável: não se renumera nem se reaproveita. Item concluído vai para [Encerrados](#encerrados) com o mesmo ID.
- **Origem** cita o documento pelo número permanente (`37 §5` = registro `37`, seção 5). Vários números = o mesmo item aparecia em vários registros e foi fundido.
- **Tipo:** produto · conteúdo · técnico · segurança · verificação manual · decisão do proprietário · copy.
- **Dono:** proprietário · agente · revisão externa (professor, advogado, participante).
- **Estado:** aberto · planejado → 46 T-x (o plano `46` implementa; não abrir trabalho paralelo) · bloqueado (espera ação externa, dono indicado) · encerrado.
- Evidência de código (`arquivo:linha`) conferida em 29/09/2026 na branch `producao-46`.

## Verificação manual

| ID | Título | Origem | Prio. | Tipo | Dependência | Dono | Estado |
|---|---|---|---|---|---|---|---|
| B-001 | Teste em aparelho físico (Safari iOS e Chrome Android): checklist F15.3 de 11 itens × 2 aparelhos, sem nenhum marcado; folha de feedback de `/study` acima da `BottomNav`; alvos de toque; scrim; FPS da história da landing em aparelho de gama média; instalação do PWA num Android real | 22 §3; 26 §5, §8; 29 §8; 32 F15.3; 37 §5 (§L.4); 41 §9 DG-2; 43 §9; 45 §10; 46 §I.3 | P0 | verificação manual | — | proprietário | aberto |
| B-002 | Leitor de tela real (NVDA/VoiceOver) e zoom 200 %: diálogos, resultado do nivelamento, busca de curso, trilha, lição, folha de capítulo, landing | 22 §3; 26 §5; 29 §8; 37 §5 (G-11, G-18, G-19); 41 §9 DG-2; 43 §9; 45 §10; 46 §I.3 | P0 | verificação manual | — | proprietário | aberto |
| B-003 | Áudio e háptico: a Fase 1 do `31` nunca rodou (AC-1.1…AC-1.5, G11, G12 sem evidência). `getAudioDiagnostics()` não existe (`src/routes/debug.tsx:21`); `tests/unit/haptics.test.ts` não existe (conferido). Criar o diagnóstico e o teste; validar em aparelho | 32 F15.5, G11, G12, F8.9; 37 §5; 22 §3 | P1 | verificação manual | B-001; B-020 | agente (diagnóstico e teste) + proprietário (aparelho) | aberto |
| B-004 | Escuta humana da identidade sonora: piloto de 8 participantes (`20` §6.3) e teste do som de acerto em 50 repetições seguidas | 22 §3; 16 §11 | P2 | verificação manual | — | revisão externa | aberto |
| B-005 | Legibilidade subjetiva do desktop em 1280 e 1440 px | 37 §5 (G-17) | P2 | verificação manual | — | proprietário | aberto |
| B-006 | Teste com 5+ alunos reais: percorrer trilha e lição sem explicação prévia, pedir ajuda à Foca, medir tempo real de leitura, testar se o humor da Foca diverte ou irrita | 00-README "O que está em aberto" 1; 08 §8, §9; 15 §9; 22 §3; 26 §5, §8; 46 §I.3 | P1 | verificação manual | Contas reais (B-060) para recrutar fora do círculo próximo | proprietário | aberto |
| B-007 | Segunda passada do `spec-verifier` sobre o `36` depois dos ajustes A1/A2/G-1/G-2/G-3 (o 13/6/1 registrado é de antes deles) | 37 T-10.2, T-10.4 (parcial), G-20, §5 | P2 | verificação manual | Pode entrar na conferência do 46 T-01.2 | agente | aberto |
| B-008 | Revisão formal `web-design-guidelines` das telas novas do `30` (nivelamento, jornada, checkpoint) | 32 G16 | P2 | verificação manual | — | agente | aberto |

## Decisões do proprietário

| ID | Título | Origem | Prio. | Tipo | Dependência | Dono | Estado |
|---|---|---|---|---|---|---|---|
| B-020 | iPhone no silencioso: o som respeita a chave (padrão adotado hoje) ou toca mesmo assim | 32 decisão #3 (`30` §20.2 item 6) | P2 | decisão do proprietário | — | proprietário | aberto (padrão em vigor) |
| B-021 | Item oficial retirado `oficial:2023:273a7d48` (explicação com equação errada): autorizar editar só a explicação ou manter retirado | 37 §5, "Fase 7 — revisão editorial" | P2 | decisão do proprietário | — | proprietário | aberto |
| B-022 | Aviso de hidratação de `/trilha` (A3, D-56/D-81): alinhar o DOM do `TrailSkeleton` com o `AppShell` ou tirar o `pendingComponent` | 37 D-81, §5; 32 Fase 14 (achado à parte) | P2 | decisão do proprietário | — | proprietário decide; agente implementa | aberto |
| B-023 | Frase de posicionamento (D-1, mantida "por enquanto"): problemas P5–P7 de `copy/01` §5.4 abertos; H1 da landing (D-LP-2) diferente da frase do `08` §1 | 39 §4, §5; copy/auditoria §3; 41 §9 D-LP-2 | P1 | decisão do proprietário | — | proprietário | aberto |
| B-024 | Proporção 70/20/10 com muitas habilidades novas: numa janela de 20 saíram 100 % "atual" (G4). Confirmar se a cota mínima de revisão do `36` (G-8, janela de 10) basta ou se os pesos `necessidade`/`BONUS_DEFICIT` mudam | 32 G4, AC-8.2 | P2 | decisão do proprietário | — | proprietário decide; agente testa | aberto |
| B-025 | Camada 1 da explicação não recolhe no acerto (divergência da Fase 7, AC-7.1, G9 parcial): aceitar ou ajustar | 32 AC-7.1, G9 | P2 | decisão do proprietário | — | proprietário | aberto |
| B-026 | Números de negócio: preço do plano pro, DRE, custo de IA por aluno/mês (cotas por plano já decididas em D-12) | 00-README "O que está em aberto" 3; 08 §11; 46 §I.1 | P1 | decisão do proprietário | Custo medido no 46 T-08.6; ver [lançamento](lancamento.md) | proprietário | aberto |
| B-027 | Confirmar as frases de gratuidade da landing ("Começar grátis"; FAQ "É grátis? Começar é… sem pagar nada", `src/marketing/content/copy.ts:149`) antes de publicar e revê-las quando houver plano pago | 41 §9 D-LP-1 | P1 | decisão do proprietário | B-026 | proprietário | aberto |
| B-028 | Pose do ícone institucional: de frente (atual) ou de lado (como a arte de referência "Fundo Azul") | 45 §6, §10 | P2 | decisão do proprietário | — | proprietário | aberto |
| B-029 | Performance mobile da landing caiu de 98 para 81 com a integração: aceitar ou recuperar (CSS crítico inline em `/`, dividir o CSS global, ilhas) | 45 §9 | P2 | decisão do proprietário | — | proprietário decide; agente implementa | aberto |
| B-030 | Atrito da entrada: 9 passos do `/quiz` antes da primeira atividade; com a D-07 o cadastro entra nesse caminho. Definir a ordem perfil → cadastro → primeira atividade | 41 §9 (Produto, F16); 46 §0 D-07 | P1 | decisão do proprietário | 46 T-05.4 | proprietário | aberto |
| B-031 | Dados que faltam do controlador: e-mail de contato de privacidade e encarregado (D-09) e demais informações do `46` §H.5 | 46 §0 D-09, §H.5, §I.3 | P0 | decisão do proprietário | — | proprietário | bloqueado (aguarda proprietário) |
| B-032 | Domínio (D-10: "mais tarde"): sem ele não há e-mail em produção, tela de consentimento do Google com links legais, `VITE_SITE_URL` (canonical, sitemap) | 41 §9 DEP-4; 43 §9; 45 §6, §10; 46 §0 D-10, §I.1 | P0 | decisão do proprietário | — | proprietário | bloqueado (aguarda proprietário) |
| B-033 | Revisão jurídica dos termos, da política e da avaliação do ECA Digital | 46 §H.5, §I.1 | P0 | decisão do proprietário | B-115; B-031 | revisão externa (contratação do proprietário) | planejado → 46 T-11.5 |

## Conteúdo pedagógico

| ID | Título | Origem | Prio. | Tipo | Dependência | Dono | Estado |
|---|---|---|---|---|---|---|---|
| B-040 | Revisão humana do acervo: 755 itens de pacote com `reviewKind: ia-delegada` (amostral no mínimo) e revisão pedagógica externa do conteúdo autoral (6 microlições e 8 dicas do `20`; 12 exercícios e 6 dicas do `25`; 1.204 exercícios legados de redação) | 00-README "O que está em aberto" 2; 08 §8; 22 §3, §6; 26 §5, §8; 37 §5; 46 §I.3 | P1 | conteúdo | — | revisão externa | aberto |
| B-041 | Classificar item a item os 1.204 exercícios legados (hoje habilidade do capítulo, dificuldade 2 fixa, `reviewer: autoria-legada-nivel-capitulo`) antes de usá-los em checkpoint ou nivelamento | 32 Fase 3, divergência 2 (F3.5); 37 §5 | P2 | conteúdo | B-040 | agente (lote) + revisão externa | aberto |
| B-042 | Banco geral de 59 questões: 40 com habilidade `core` por fallback (F3.4) e `irt` default em `src/content/items/meta/banco-geral.ts` (D-25, fora do G-7) | 32 Fase 3, divergência 3; 37 D-25, G-7 | P2 | conteúdo | — | agente | aberto |
| B-043 | Preencher `enemSkills` (H1–H30 da Matriz de Referência do Inep) por habilidade; hoje 0 ocorrências em `src/content/taxonomy/skills/*.ts`. Exige a fonte primária, sem chute | 32 F2.7; 33 (abertura) | P2 | conteúdo | Matriz do Inep em mãos | agente | aberto |
| B-044 | Parâmetros do Inep de pelo menos 3 anos (só 2023 importado, 5.526 itens) | 32 AC-10.2, F15.5; 37 §5 | P2 | conteúdo | — | agente | aberto |
| B-045 | Ampliar a cobertura de conteúdo. Inclui a aula de `fis:cinematica-movimento-uniforme`, não publicada (menos de 6 itens depois de retirar 3 de MRUV), e a falta de habilidade de MRUV na taxonomia | 37 §5; 26 §8; 32 Fase 11 (achado 5) | P1 | conteúdo | B-040 para escalar | agente (pipeline) + revisão externa | aberto |
| B-046 | Auditar a ordem por dificuldade crescente em lições e nivelamento (`dificuldadeNaAula`, `aulas.ts`) | 32 F15.3 (recomendação) | P2 | conteúdo | — | agente | aberto |
| B-047 | Revisão pelo proprietário do conteúdo pedagógico das 65 habilidades da taxonomia (`docs/33`) | 32 AC-2.4 | P2 | conteúdo | — | proprietário ou revisão externa | aberto |

## Copy

| ID | Título | Origem | Prio. | Tipo | Dependência | Dono | Estado |
|---|---|---|---|---|---|---|---|
| B-050 | Plano de migração de strings da auditoria de 28/09 (106 linhas; 72 com ação: A 20, M 28, B 24), aplicando D-1…D-5, P-1 e P-2; reauditar as áreas que dependiam do `36` e as telas fora da passada (`plan`, `topics`, `flashcards`, `redacao`, `profile`, `login`, `forgot`, `video`, `ranking`); testes novos em `brand-voice.test.ts`; DEP-2…DEP-9 viram itens desse plano. Inclui "Domínio", "Dominado", "Lacuna", `%` e "~N min" em `/progress` e na trilha. As linhas A1-01…A1-07 de `welcome.tsx` perderam o objeto (a rota redireciona para `/`) | 39 §4, §5; copy/auditoria §1, §3, §4; 38 §V.3; 41 §9 (Produto) | P1 | copy | Plano próprio aprovado; a parte de promessas vai no B-051 | agente (proposta) + proprietário (aprovação) | aberto |
| B-051 | Frases que prometem o que não existe: "60 segundos"/"60s" (`src/lib/voz.ts:32,36,38,64`; `aha.tsx:72`; `plan.tsx:35,57,88`; `profile.tsx:277`; `progress.tsx:161`; `ranking.tsx:98`; `dashboard.tsx:116,122,133`), "Sem e-mail, sem senha" (`quiz.tsx:167`, falsa com a D-07) e "Meta diária … aulas de 60s" | 45 §10; 37 T-10.3; copy/auditoria A1-*, §3; 46 §J T-10.2 | P0 | copy | 46 T-05.4 (fluxo de conta) | agente | planejado → 46 T-10.2 |
| B-052 | Rótulos "Salvo!" e "Salvo" dos flashcards (`study.tsx:425`, `flashcards.tsx:154`), fora do RF-14 | 37 §5 (D-77) | P2 | copy | — | agente | aberto |
| B-053 | Biblioteca de falas da Foca: 5–8 variações por slot e revisão contra o teste de voz vigente (`copy/04`, que substituiu `15` §7–§8) | 15 §9 | P2 | copy | — | agente | aberto |
| B-054 | `copy/01` §4/§6 e `copy/06` §4 ainda proíbem "o nivelamento muda a sua trilha", verdade desde o `36` (T-03, recomposição da fila) | 41 §9 DEP-3; 38 §V.3 DEP-7 | P2 | copy | — | agente | aberto |
| B-055 | Landing e telas refeitas (`src/marketing/content/app-screens.ts`) coerentes com a D-07: o CTA leva ao `/quiz`, e o estudo passa a exigir conta | 46 §0 D-07; 44 §3 | P1 | copy | 46 T-05.4 | agente | aberto |
| B-056 | Recapturar os retratos da landing depois da migração de copy (`bun run shots` não existe no `package.json`) | 41 §9 DEP-1; 46 §C.6 | P2 | copy | B-050; B-083 | agente | aberto |

## Produto e UX

| ID | Título | Origem | Prio. | Tipo | Dependência | Dono | Estado |
|---|---|---|---|---|---|---|---|
| B-060 | Contas reais: hoje `/login` aceita qualquer e-mail e senha (`login.tsx:19-23`), Google é `alert` (`login.tsx:80`), `/forgot` não envia nada (`forgot.tsx:33`) | 46 §A.2, §0 D-06/D-10, §I.1; 08 §9 | P0 | produto | B-121 (produção) | agente | planejado → 46 T-05.1…T-05.8 |
| B-061 | Estudo exige conta (D-07): nenhuma rota tem guarda; só `/app` lê `authed` (`app.tsx:26`) | 46 §0 D-07, §A.2 | P0 | produto | B-060 | agente | planejado → 46 T-05.5, T-05.6, T-08.1 |
| B-062 | Progresso no servidor e sincronização entre aparelhos (hoje tudo no `localStorage`) | 22 §6; 26 §8; 46 §A.2, §E.4 | P0 | produto | B-060 | agente | planejado → 46 T-06.1…T-06.5 |
| B-063 | Importar o progresso local para a conta (só quem já tem progresso de antes da D-07) | 46 §G, §0 D-07 | P0 | produto | B-062 | agente | planejado → 46 T-07.1…T-07.4 |
| B-064 | Fluxos de demonstração fora de produção: ranking fictício (`src/data/ranking.ts:20`, D-15); `/premium` (trial de 24 h, `premium.tsx:14-19`); `/offline` (sincronizar é `setTimeout`, `offline.tsx:35`); "Resetar demonstração" (`profile.tsx:313`); `/debug` com `?debug=1` (`debug.tsx:29`); linhas mortas do perfil (Termos e Privacidade `profile.tsx:300-301`, Meta diária `:277`); fixtures fora do bundle | 46 §A.2, §C.6, §0 D-15; 39 §4 P-1; copy/auditoria A11-03, A11-04, A11-09; 16 §11 | P0 | produto | — | agente | planejado → 46 T-10.1, T-10.3 |
| B-065 | `/topics`: `selectedTopics` é gravado e só a própria tela o lê (`topics.tsx:94-124`, `store.ts:59`); não afeta o estudo | 46 §A.2 | P1 | produto | — | agente | planejado → 46 T-10.1 (corrigir ou ocultar) |
| B-066 | `/plan` em parte cosmético: tarefas fixas (2 lacunas + "5 flashcards" + "1 videoaula" com o título sempre do vídeo `v1`, `plan.tsx:32-39`), sem vínculo com a jornada adaptativa | 46 §A.2 | P1 | produto | — | agente | planejado → 46 T-10.1 (corrigir ou ocultar) |
| B-067 | Vídeos: 10 IDs do YouTube fixos em `VIDEO_MAP` (`video.$id.tsx:10-21`), sem curadoria nem checagem de disponibilidade; fora do mapa, cai numa busca do YouTube | 46 §A.2 | P2 | produto | — | agente + revisão externa (curadoria) | aberto |
| B-068 | As lacunas do `/aha` e do `/plan` vêm de heurística sobre o perfil (`quiz.tsx:55` → `computeGaps`, `src/lib/gaps.ts`), não do nivelamento nem do modelo de domínio que o motor adaptativo já usa | 00-README "O que está em aberto"; 08 §6 (horizonte 2) | P2 | produto | — | proprietário decide; agente implementa | aberto |
| B-069 | Tela de resultado do checkpoint ("Subiu", "Firme", "Vale revisar" por habilidade, `30` §13.5): não existe (`CheckpointResult.tsx` ausente; a conclusão usa a tela genérica do `MicroLessonPlayer`). O motivo do adiamento (recalibração não integrada) caiu com o `36` T-04.4 | 32 Fase 14, divergência 3; 37 §5 | P2 | produto | — | agente | aberto |
| B-070 | Resultado do nivelamento com indicador visual (hoje só texto de faixa) | 32 F15.3 (recomendação) | P2 | produto | Contrato de tela do `36` §F.5 (sem nota nem %) | agente | aberto |
| B-071 | Remover o caminho de rollback `dashboard.tsx` e `NAV_ITEMS_V1` depois que o backend estabilizar | 46 §C.6; 25 (rollback) | P2 | técnico | 46 F14 | agente | aberto |
| B-072 | Service worker (offline real): há `site.webmanifest`, não há service worker. Pré-requisito provável de APK/TWA | 45 §6; 46 §A.2, §I.3 | P2 | produto | — | agente | aberto |
| B-073 | Notificações (não existem): decidir se existem e se a Foca aparece com arte ou só texto | 15 §9; 46 §A.2, §B.3 | P2 | produto | Avaliação ECA Digital (46 T-11.2) | proprietário | aberto |
| B-074 | Telas de lista secundárias (redação, flashcards, plano, ranking, tópicos) sem grade própria no desktop (coluna de 680 px) | 45 §10 | P2 | produto | — | agente | aberto |
| B-075 | Conquistas/badges, desafio opcional de capítulo e simulado completo | 22 §6; 26 §8; 46 §B.3 | P2 | produto | Revisão de `16` §9 por alguém de fora (16 §11); ECA Digital | proprietário | aberto (fora do escopo do 46) |
| B-076 | Medir a tese: retorno no dia seguinte e conversão da landing, com privacidade. Analytics externo segue proibido sem spec própria (`20` §14, §22; público menor de idade) | 16 §11; 08 §10; 14 §10; 41 §9 DEP-7; 46 §I.3 | P1 | produto | Spec própria; contas (B-060) | proprietário | aberto |
| B-077 | Ranking real entre alunos (o fictício sai de produção no B-064) | 16 §11; 46 §B.3 | P2 | produto | B-062; ECA Digital | proprietário | aberto (fora do escopo do 46) |

## Técnico

| ID | Título | Origem | Prio. | Tipo | Dependência | Dono | Estado |
|---|---|---|---|---|---|---|---|
| B-080 | Reorganizar o SDD: cabeçalhos de status desatualizados (`20`, `25`, `27`/`28`, `17`, `30`/`31`/`36`, `40:8`), sete blocos "vigentes" no `00-README`, cerca de 63 regras vivas só dentro de planos concluídos, links para `_arquivo-abroad/` e HTML "Flash Test" removidos | 46 §A.5, §C | P1 | técnico | — | agente | planejado → 46 T-01.1…T-01.9 |
| B-081 | Codex sem contexto (só o `AGENTS.md` de 641 bytes), skills fora de `.agents/skills/`, catálogo só do Claude; conferir o carregamento das skills novas numa sessão nova | 46 §A.6; 39 §5 | P1 | técnico | B-080 | agente | planejado → 46 T-02.1…T-02.6 |
| B-082 | Build e repositório sem Lovable e Netlify: wrapper `@lovable.dev/vite-tanstack-config`, `lovable-error-reporting.ts`, `.lovable/`, exceções em `bunfig.toml:7`, `netlify.toml`, preset padrão `netlify`, artefatos locais | 46 §A.1, §C.6, §0 D-04 | P1 | técnico | — | agente | planejado → 46 T-03.1…T-03.4, T-03.7 |
| B-083 | Scripts de marketing quebrados depois da integração: `scripts/marketing/og-image.ts` (caminhos), `css-blocks.ts:6` (aponta para fora do repo), `capturar-telas.ts:16` (raiz errada); `bun run shots` citado e inexistente | 46 §C.6 | P2 | técnico | — | agente | planejado → 46 T-03.5 |
| B-084 | ESLint: `eslint.config.js:9` só ignora `dist`, `.output`, `.vinxi` (varre `automacao-instagram/` e `edição Videos/`); o CI não roda lint; cerca de 3.800 erros históricos de CRLF/LF; 1 aviso preexistente `react-hooks/exhaustive-deps` em `LessonPlayer.tsx` | 46 §A.1, §A.8; 27 §16; 29 §8; 37 T-10.1 | P2 | técnico | — | agente | planejado → 46 T-03.3, T-03.6 (escopo e CI); a limpeza de formatação fica aberta |
| B-085 | `README.md` desatualizado ("Flash Test", `npm`, Netlify) | 46 §C.5 | P2 | técnico | B-082 | agente | planejado → 46 T-03.6 |
| B-086 | Normalizar `progress.lessons` e `learning.completedLessons` no `montarEstado`: um JSON válido com esses campos nulos derruba a trilha inteira | 37 D-82 | P2 | técnico | — | agente | aberto |
| B-087 | Schema zod espelho dos tipos de item (`src/content/items/types.ts`) para validar JSON vindo de fora do TypeScript | 32 Fase 3, divergência 1 (F3.1) | P2 | técnico | — | agente | aberto |
| B-088 | Cláusula alternativa de R em `confidence()` (checkpoint ≥ 3 dias depois da 1ª evidência), adiada por falta de dado de checkpoint | 32 Fase 5, divergência 2 | P2 | técnico | — | agente | aberto |
| B-089 | Lacunas de teste: E2E do ramo "pool acaba antes do teto" (D-22, G-4); recarga no meio do CAT (G-5); nivelamento e checkpoint com item oficial (D-51, G-14); conclusão pela UI de aula de pacote, reforço e checkpoint (D-80, G-2); janela de falha entre as duas gravações (G-3); as 9 flags desligadas uma a uma (G15 do `31`); `planNext` com a fixture sintética de 500/6.000 (AC-8.5); `prerequisiteChapterIds` com conteúdo real (`26` §3.4); `buildTrail` medido no navegador | 37 §4 (G-2…G-5, G-14), D-22, D-51, D-80; 32 G15, AC-8.5; 26 §3.4, §5 | P2 | técnico | — | agente | aberto |
| B-090 | `learning.rewardLedger` sem limite de tamanho | 46 §A.3 | P2 | técnico | Autoridade do servidor (46 T-06.4) | agente | aberto |

## Segurança e IA

| ID | Título | Origem | Prio. | Tipo | Dependência | Dono | Estado |
|---|---|---|---|---|---|---|---|
| B-100 | IA-1: `askTutor` sem autenticação, cota nem teto de custo (`src/lib/tutor.ts:15-17`); qualquer POST gasta a chave | 46 §A.4 IA-1; 32 F15.4 O-001 | P0 | segurança | B-060 | agente | planejado → 46 T-08.1, T-08.3, T-12.2 |
| B-101 | IA-2: `context` do cliente entra no prompt de sistema sem validação de tipo e tamanho (`tutor-core.ts:162-203`); limite de 60 caracteres do curso só no cliente | 46 §A.4 IA-2; 37 §5 (D-002); 32 F15.4 O-002 | P0 | segurança | — | agente | planejado → 46 T-08.2 |
| B-102 | IA-3: o histórico não é aparado (`store.ts:1955`) e o balão envia tudo (`TutorBubble.tsx:198`); passado o limite de 40 mensagens (`tutor-core.ts:66`) toda requisição falha e o tutor quebra naquele aparelho. `tutor.messages` também cresce sem limite no `localStorage` | 46 §A.3, §A.4 IA-3 | P0 | segurança | — | agente | planejado → 46 T-08.2 |
| B-103 | IA-4: foto vai sem compressão, até 5 MiB em base64 (`TutorBubble.tsx:29,224`) | 46 §A.4 IA-4 | P1 | segurança | — | agente | planejado → 46 T-08.4 |
| B-104 | IA-5 e idade: o contrato da OpenAI (§3.3(c)) exige consentimento dos responsáveis para menores; D-08 (conta a partir de 17; Foca IA aos 17 com consentimento, 18+ direto; `MIN_ACCOUNT_AGE` configurável) | 46 §A.4 IA-5, §0 D-08, §H.3 | P0 | segurança | B-032 (e-mail ao responsável) | agente | planejado → 46 T-05.4, T-08.1, T-11.4 |
| B-105 | Dado pessoal e foto enviados à OpenAI sem aviso (A-003); primeiro nome deixa de ir (D-18); moderação da entrada (D-16); protocolo de autolesão; opção de desligar o tutor | 32 F15.4 A-003; 46 §0 D-16/D-18, §E.7 | P0 | segurança | — | agente | planejado → 46 T-08.2, T-08.5 |
| B-106 | Logout e "reset" deixam nome, e-mail e progresso no aparelho (`store.ts:1990-2000`), mais as cópias brutas `foca.state.backup.before-learning-v4` e `…before-v6` (`state-migrations.ts:25,27`), nunca apagadas | 32 F15.4 A-004; 46 §A.2, §A.3 | P0 | segurança | B-060 | agente | planejado → 46 T-05.5, T-07.2 |
| B-107 | Streak, XP e congelamentos adulteráveis (relógio do aparelho, `store.ts:676-730`) | 46 §A.2, §M G-8 | P1 | segurança | B-062 | agente | planejado → 46 T-06.2 |
| B-108 | Exportar dados, excluir conta e rotinas de retenção | 46 §E.6, §M G-12 | P0 | segurança | B-062 | agente | planejado → 46 T-09.1…T-09.3 |
| B-109 | Isolamento entre alunos, segredos fora do bundle, logs sem dado pessoal | 46 §F, §M G-7/G-16 | P0 | segurança | B-062 | agente | planejado → 46 T-04.4, T-06.6, T-12.4 |
| B-110 | Cabeçalhos de segurança do app SSR e CSP (o `vercel.json` só cobre parte) | 32 F15.4 A-005; 45 §6; 46 §A.1 | P1 | segurança | — | agente | planejado → 46 T-12.1 |
| B-111 | `.mcp.json` roda `npx -y omniroute` sem versão fixa | 32 F15.4 A-006; 46 §A.6, §0 D-17 | P2 | segurança | — | agente | planejado → 46 T-02.7 |
| B-112 | CI fixa GitHub Actions por tag mutável (`.github/workflows/ci.yml:16-20`: `checkout@v4`, `setup-node@v4`, `setup-bun@v2`), não por SHA | 32 F15.4 O-003 | P2 | segurança | — | agente | aberto (não coberto pelo 46) |
| B-113 | `minimumReleaseAge` de 24 h em `bunfig.toml:4`, abaixo dos 7 dias recomendados | 32 F15.4 O-004 | P2 | segurança | B-082 (as exceções `@lovable.dev` saem no 46 T-03.2) | agente | aberto (não coberto pelo 46) |
| B-114 | Ferramentas de auditoria (gitleaks, osv-scanner, semgrep) e auditoria L3 sem vulnerabilidade confirmada alta ou crítica antes de abrir contas | 46 §F.6, §I.3; 32 F15.4 (ressalva) | P0 | segurança | Fim das F04–F11 | agente | planejado → 46 T-12.3, T-12.5 |
| B-115 | Termos de uso, política de privacidade, inventário de dados, avaliação do ECA Digital, rotas `/termos` e `/privacidade` com aceite; links no rodapé da landing e no perfil | 46 §H, §I.1, §I.3; 41 §9 DEP-5 | P0 | segurança | B-031; B-033 | agente (rascunho) + revisão externa | planejado → 46 T-11.1…T-11.3 |

## Operação

| ID | Título | Origem | Prio. | Tipo | Dependência | Dono | Estado |
|---|---|---|---|---|---|---|---|
| B-120 | Deploy público: Deployment Protection da Vercel, variáveis por ambiente, região `gru1`, URL pública sem login e com refresh ok (DG3) | 29 §5 DG3, §8; 32 F15.4 (ressalva); 46 §0 D-11 | P0 | técnico | B-100 antes de abrir | proprietário (painel) + agente | planejado → 46 T-13.1 |
| B-121 | Provisionar Neon, Google Cloud (OAuth) e Resend | 46 §K.2, §0 D-06/D-10 | P0 | técnico | B-032 (Resend e consentimento do Google) | proprietário | bloqueado (aguarda proprietário) → 46 T-04.7, T-05.3, T-05.7 |
| B-122 | `OPENAI_API_KEY` por ambiente e teto de custo (D-12, padrão de US$ 1/dia); tutor em produção (DG4). Sem chave, tirar a frase da foto da landing (`TEXTO_COM_FOTO`, `src/marketing/sections/Errou.tsx:7`) | 29 §5 DG4; 41 §9 V-1; 43 §9; 45 §10; 46 §0 D-12 | P1 | técnico | B-100 | proprietário | bloqueado (aguarda proprietário) → 46 T-08.6 |
| B-123 | Vercel Pro antes de vender: o Hobby é só para uso não comercial (D-11) | 46 §0 D-11, §I.3, §K.3 | P1 | técnico | — | proprietário | bloqueado (aguarda proprietário) → 46 T-13.1 |
| B-124 | Migrações no deploy, backup e restauração ensaiados, runbooks, `/api/saude` | 46 §E.8, §I.3 | P0 | técnico | B-121 | agente + proprietário (conta Neon) | planejado → 46 T-13.2…T-13.5 |
| B-125 | Site antigo na Netlify que ainda serviria o Abroad (registrado só na memória do projeto; confirmar e desativar) | memória do projeto (`deploy-state-2026-09`), a confirmar | P2 | técnico | — | proprietário | aberto |

## Encerrados

| ID | Título | Origem | Como foi encerrado |
|---|---|---|---|
| B-150 | Arte final das 8 expressões da Foca | 15 §9; 29 §8; 37 §5; 43 §9 | Entregue em 29/09/2026: `src/lib/brand/foca-expressions.ts`, originais em `src/assets/branding/foca/expressoes/` (45 §5) |
| B-151 | Arte da logo em alta resolução | 37 §5 | Troca de 29/09/2026: originais de 1254 e 2000 px (37, "Troca do logo") |
| B-152 | A Foca da história da landing reagir por cena | 43 §9 | Feito com `FocaTroca` (45 §5) |
| B-153 | Checkpoints recalibram e antecipam revisão (G7, AC-14.3) | 32 Fase 14 divergência 1, G7 | `36` T-04.4; `checkpoint.spec.ts` (37 G-9) |
| B-154 | E2E do app sem IA (parte de G13) | 32 G13 | `tutor.spec.ts` sem rede (37 G-16) |
| B-155 | `finalAnswer` do Modo B não propagado | 32 Fase 11 | `run-stage.ts:531-538`; `rotulaAfirmacoes` na T-07.6 (37 D-46) |
| B-156 | Frases estáticas de "salvo" com a gravação falhando (D-34) | 37 T-10.3 | Corrigido em D-77 (`persist-copy.test.ts` + 4 E2E) |
| B-157 | Alternativas de tamanho desigual "chutáveis" | 32 F15.3 (recomendação) | `36` Fase 7: correta estritamente a mais longa de 52 % para 18,6 %; razão ≥ 2,0 = 0 (37 G-12) |
| B-158 | Pendências da landing isolada: commit de `landing/` (D-LP-4), projeto Vercel `foca-landing` e `VITE_APP_URL` (DG-1), indexação (D-LP-5), `sync:brand`, `LP_FALA_DE_PRECO` | 41 §9; 43 §9; 37 ("Troca do logo") | Obsoletas pelo `44`: landing em `/`, um build, pasta `landing/` removida, indexável por padrão (`src/marketing/config.ts:11`). O que sobrou foi para B-027, B-032 e B-122 |
| B-159 | Diagnóstico real de conhecimento no onboarding | 22 §6; 26 §8 | Nivelamento adaptativo opcional (`30` F13; `36` Fase 3) |
| B-160 | Revisão espaçada com UI própria | 22 §6; 26 §8 | Revisões entram na jornada adaptativa, com cota mínima (`30` F12; 37 G-8) |
| B-161 | Conteúdo além das 6 microlições piloto | 22 §6; 26 §8 | 48 aulas e 755 itens de pacote (`30` F11). A ampliação de cobertura segue em B-045 |
| B-162 | Ligas e ranking saem do mock? | 16 §11 | Decidido na D-15 do `46`: oculto em produção (B-064); ranking real em B-077 |
| B-163 | Conferências V-2 (4–8 questões), V-3 (redação na trilha), V-4 (regra do congelamento) | 41 §9 | Conferidas no próprio `41` |
| B-164 | "Foca 60 segundos" na tela `/welcome` | 37 T-10.3; copy/auditoria A1-01…A1-07 | `/welcome` redireciona para `/` (`welcome.tsx:7-9`). A frase de posicionamento segue em B-023 |
