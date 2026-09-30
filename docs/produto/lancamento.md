---
estado: aprovado
atualizado: 2026-09-29
canonico-de: [checklist de lançamento]
substitui: []
substituido-por: null
---

# Checklist de lançamento

> **Documentação de preparação para vender — não autoriza implementar os itens.** Só os marcados **[impl]** fazem parte do plano em execução (46), e cada um aponta para a sua tarefa. Pagamentos, afiliados, APK, Play Store e marketing não entram automaticamente em nenhuma implementação.
>
> **Itens marcados [x] são declarações do proprietário.** A coluna "Verificação independente" diz o que foi possível conferir; o estado declarado nunca é alterado em silêncio.

**Tipo:** **[impl]** parte da implementação do 46 · **[dec]** decisão do proprietário · **[ext]** configuração externa · **[fut]** etapa futura.
**Classe:** 🟥 bloqueia lançar (contas abertas ao público) · 🟧 bloqueia vender · 🟩 melhoria posterior.

## 1. Site e produto

| Item (do proprietário) | Estado declarado | Tipo | Classe | Depende de | Critério de conclusão | Verificação independente |
|---|---|---|---|---|---|---|
| Terminar de fazer o aplicativo | [ ] | [impl] parcial (46) + [fut] | 🟥 | 46 F04–F14; `backlog.md` P0 | Critérios G-1…G-20 do 46 cumpridos; nenhum P0 aberto no backlog | — |
| Decidir planos | [ ] | [dec] | 🟧 | Custo de IA medido (46 T-08.6); modelo de negócio (`estrategia.md` §11) | Documento de planos aprovado. **Já decidido (29/09/2026):** grátis = até 3 mensagens/dia na Foca IA; pro = 20 mensagens + 5 fotos/dia | — |
| Conectar plataforma de pagamentos e checkout | [ ] | [fut] | 🟧 | Planos; controlador com CNPJ ou definição fiscal; termos de venda (CDC art. 49) | Spec própria aprovada e implementada | — |
| Fazer suporte para afiliados | [ ] | [fut] | 🟩 | Pagamentos | Spec própria | — |
| Criar área exclusiva para afiliados | [ ] | [fut] | 🟩 | Afiliados | Spec própria | — |
| Criar "Quer ser afiliado? Veja como funciona" | [ ] | [fut] | 🟩 | Afiliados | Página publicada | — |
| Indicação com recompensa por recomendar amigos | [ ] | [fut] | 🟩 | Contas reais (46), antifraude, avaliação ECA Digital (recompensa para adolescente) | Spec própria | — |
| Landing page | **[x]** | — | — | — | — | Implementada e testada no build local (registro `45`: E2E contra o build de produção, Lighthouse). Publicação em domínio próprio **não verificada**; `VITE_SITE_URL` e `VITE_LP_INDEXABLE` pendentes (dependem do domínio) |
| Suporte e contato por WhatsApp | [ ] | [dec] + [ext] | 🟧 | Número comercial; política de privacidade (o WhatsApp é outro operador) | Canal publicado e citado nos termos | — |
| Login com banco de dados e Google | [ ] | **[impl]** 46 F04–F07 + [ext] | 🟥 | Neon (conta), Google Cloud (projeto OAuth), domínio + Resend (para e-mail) | 46 T-05.x/T-06.x concluídos e validados em ambiente integrado | — |
| Domínio | [ ] | [dec] + [ext] | 🟥 | Compra pelo proprietário (**mais tarde**, D-10) | DNS apontado para a Vercel; SPF/DKIM do e-mail | — |
| Termos de uso e política de privacidade | [ ] | **[impl]** 46 F11 + [ext] revisão jurídica | 🟥 | Contato de privacidade (pendente), revisão jurídica, domínio (URLs) | Textos finais publicados em `/termos` e `/privacidade`, com versão e aceite | — |
| Suporte com tutoriais | [ ] | [fut] | 🟩 | Produto estável | Central de ajuda publicada | — |
| App APK | [ ] | [fut] | 🟩 | PWA com service worker (backlog) ou TWA | Spec própria | — |
| Publicar na Play Store | [ ] | [fut] + [ext] | 🟩 | APK; conta de desenvolvedor; formulário de segurança de dados | App aprovado na loja | — |

## 2. Instagram e distribuição

| Item | Estado declarado | Tipo | Classe | Critério | Verificação independente |
|---|---|---|---|---|---|
| Automação para criar publicações a partir do Claude | **[x]** | — | — | — | A ferramenta existe e está versionada em `automacao-instagram/` (commit `9109d8f`) |
| Destaques | **[x]** | — | — | — | Não verificável pelo repositório |
| Um post por dia | **[x]** | — | — | — | **Divergência a confirmar:** `docs/copy/06-marketing.md` (29/09/2026) registra "nenhum post publicado". Estado mantido como declarado |
| Um story por dia | **[x]** | — | — | — | Não verificável pelo repositório |
| Reels com participação do proprietário, editados com ajuda do Claude | [ ] | [dec] + [fut] | 🟩 | Reels publicados | `edição Videos/` existe localmente (fora do Git) |
| Post "Quem somos e o que fazemos" | [ ] | [fut] | 🟩 | Publicado, sem promessa fora de `PRODUCT.md` → Evidence on Hand | — |
| Posts fixados | [ ] | [fut] | 🟩 | 3 posts fixados | — |
| Distribuir os mesmos reels no TikTok e YouTube Shorts | [ ] | [fut] + [ext] | 🟩 | Contas criadas e rotina de publicação | — |

## 3. Itens adicionais — recomendações do agente (não pedidos pelo proprietário)

| Item | Tipo | Classe | Por quê |
|---|---|---|---|
| E-mail de contato de privacidade e encarregado publicados | [dec] + [ext] | 🟥 | Res. CD/ANPD 18/2024; dados de adolescentes tornam o tratamento de alto risco (Res. 2/2022 art. 4). Controlador já definido: Matheus Vellozo Freire |
| Vercel Pro | [ext] | 🟧 | Hobby é "non-commercial personal use only" (Vercel Fair Use, 14/09/2026). Decisão atual: Hobby por enquanto (ADR 0001) |
| Chave da OpenAI e teto de custo definidos | [dec] + [ext] | 🟥 | Sem chave, a Foca IA usa o fallback local; teto padrão conservador de US$ 1/dia até decisão |
| Neon com restauração de 7 dias (plano Launch) | [ext] | 🟥 | A restauração de 6 h do plano gratuito é curta para dados reais |
| Auditoria de segurança L3 sem vulnerabilidade confirmada alta/crítica aberta | [impl] 46 T-12.5 | 🟥 | — |
| Avaliação de conformidade com o ECA Digital (streak, XP, recomendação, IA) + revisão jurídica | [impl] 46 T-11.2 + [ext] | 🟥 | Lei em vigor desde 17/03/2026 |
| Teste em aparelho físico e com leitor de tela | [ext] (proprietário) | 🟥 | Pendente desde o `22` (registro `37` §5) |
| Revisitar a idade mínima (hoje 17+) | [dec] + [ext] jurídico | 🟧 | Exclui parte da persona (16–19 anos); ADR 0006 |
| Entrevistas ou teste com 5+ alunos reais | [dec] | 🟧 | Nenhuma validação com o aluno real (`estrategia.md` §8) |
| Medir retorno no dia seguinte (métrica da tese), com privacidade | [fut] | 🟧 | `PRODUCT.md` → Métricas |
| Definição fiscal (CPF/MEI/empresa) e nota fiscal | [dec] + [ext] | 🟧 | Vender |
| Revisão humana amostral do acervo de questões | [fut] | 🟧 | 755 itens revisados só por IA (registro `37`) |
| Service worker (offline real) | [fut] | 🟩 | Provável pré-requisito do APK/TWA |
