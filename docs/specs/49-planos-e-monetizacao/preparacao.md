---
estado: aprovado
atualizado: 2026-10-02
iniciativa: 49
substitui: []
substituido-por: null
---

# 49 — Tutoriais de preparação (antes da implementação)

Para o proprietário. Um tutorial por tarefa, na ordem em que vale fazer. Tudo aqui é **grátis ou em modo de teste**: nada cobra dinheiro e nada liga cobrança real. O que é pago está no fim, como pendente. Contexto técnico: [spec 49](spec.md).

A troca das chaves já expostas (Google, Resend) ficou de fora por decisão do proprietário em 01/10/2026.

## Ordem e dependências

| Passo | Tarefa | Depende de | Tempo |
|---|---|---|---|
| 0 | [Como guardar uma credencial](#passo-0--como-guardar-uma-credencial) | — | 2 min |
| 1 | [Conta de teste do Asaas, chave e token](#passo-1--asaas-sandbox-conta-chave-e-token) | — | 20 min |
| 2 | [Segredo de acesso ao preview na Vercel](#passo-2--segredo-de-acesso-ao-preview-na-vercel) | — | 5 min |
| 3 | [Pedir o preview ao agente](#passo-3--pedir-o-preview-ao-agente) | 1, 2 e a spec aprovada | 1 min (o agente faz o resto) |
| 4 | [Google: publicar o login e liberar o preview](#passo-4--google-publicar-o-login-e-liberar-o-preview) | o endereço do passo 3 | 10 min |
| 5 | [Webhook do Asaas](#passo-5--webhook-do-asaas) | 1, 2 e o endereço do passo 3 | 10 min |
| 6 | [Testes de pagamento no sandbox](#passo-6--testes-de-pagamento-no-sandbox) | 5 e o checkout pronto (F3) | 30 min, junto com o agente |
| 7 | [E-mail de suporte no domínio](#passo-7--e-mail-de-suporte-no-domínio) | — | 20 min |
| 8 | [Conta AdSense](#passo-8--conta-adsense) | — | 15 min + espera do Google |
| 9 | [Conta Ad Manager e blocos de anúncio](#passo-9--ad-manager-e-blocos-de-anúncio) | 8 | 20 min |
| 10 | [Teste da rolagem no Instagram](#passo-10--teste-da-rolagem-no-navegador-do-instagram) | o link de diagnóstico (F1) | 15 min por celular |
| 11 | [Aprovar a spec](#passo-11--aprovar-a-spec) | ler a spec | — |

Os passos 1, 2, 7 e 8 dá para fazer hoje. Os outros esperam algo do agente, e ele avisa quando for a hora.

---

## Passo 0 — Como guardar uma credencial

**Para que serve:** chave e token são senhas. Elas nunca vão para o chat; ficam num arquivo na pasta do projeto, que o Git ignora (todo arquivo que começa com `.env` é ignorado). O agente lê o arquivo sem mostrar o valor e cadastra na Vercel.

1. Abra o PowerShell na pasta do projeto: no Explorador de Arquivos, entre em `C:\Users\mathe\Documents\foca`, clique na barra de endereço, digite `powershell` e aperte Enter.
2. Digite `notepad .env.asaas-sandbox` e aperte Enter. O Bloco de Notas pergunta se quer criar o arquivo: **Sim**.
3. Escreva uma variável por linha, no formato `NOME=valor`, sem aspas e sem espaço em volta do `=`.
4. Salve com **Ctrl+S** e feche.

**Como saber que deu certo:** no PowerShell, `Test-Path .env.asaas-sandbox` responde `True`. (Não use `cat`: ele mostraria a chave na tela.)

---

## Passo 1 — Asaas sandbox: conta, chave e token

**Para que serve:** o Asaas é o gateway que vai cobrar cartão e Pix e criar as assinaturas. O **sandbox** é uma cópia de teste do Asaas, com dinheiro de mentira. O agente constrói e testa o checkout inteiro nele. Nada do sandbox vale na produção, e nada é cobrado.

### 1.1 Criar a conta
1. Acesse **https://sandbox.asaas.com** e clique em **Criar conta**.
2. Preencha nome, e-mail, CPF, celular e senha. Pode usar os seus dados: é um ambiente de teste e nada é cobrado.
3. Entre na conta e complete os **dados comerciais** que o painel pedir (endereço, faturamento estimado, área de atuação). Preencha tudo: dados incompletos podem desligar o Pix do sandbox.
4. A conta de sandbox é aprovada sozinha.

### 1.2 Gerar a chave de API
1. No canto superior direito, abra o menu do usuário e vá em **Integrações**.
2. Na aba **Chaves de API**, clique em **Gerar chave de API** (ou "Gerar nova chave").
3. Nome: `foca-sandbox`. Sem data de validade.
4. A chave aparece **uma vez só**. Copie e cole no arquivo do Passo 0:
   ```
   ASAAS_API_URL=https://api-sandbox.asaas.com/v3
   ASAAS_API_KEY=cole_a_chave_aqui
   ```
5. Se fechar a janela sem copiar, gere outra e apague a anterior.

### 1.3 Criar o token do webhook
O webhook é o Asaas avisando o Foca que um pagamento foi aprovado. O token prova que o aviso veio mesmo do Asaas.
1. No PowerShell, cole e aperte Enter (gera 48 caracteres aleatórios e já grava no arquivo, sem mostrar):
   ```powershell
   $b = New-Object byte[] 24; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); Add-Content -Path .env.asaas-sandbox -Value ("ASAAS_WEBHOOK_TOKEN=" + (($b | % { $_.ToString("x2") }) -join ""))
   ```
2. Você vai precisar desse token no Passo 5. Para vê-lo nessa hora: `notepad .env.asaas-sandbox`.
3. **Nunca use a chave de API como token.**

### 1.4 Criar uma chave Pix no sandbox
Sem uma chave Pix cadastrada, o Asaas recusa qualquer cobrança por Pix ("Para gerar cobranças com Pix é necessário criar uma chave Pix no Asaas", visto em 02/10/2026).
1. No sandbox, menu **Pix** → **Minhas chaves** (ou "Chaves Pix") → **Cadastrar chave**.
2. Escolha **Chave aleatória** (não expõe CPF, e-mail nem telefone) e confirme.
3. Pronto: não precisa entregar nada ao agente.

**O que entregar ao agente:** só a frase "arquivo do Asaas pronto" (e "chave Pix criada" depois do 1.4).
**Como saber que deu certo:** o arquivo tem três linhas: `ASAAS_API_URL`, `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN`.
**Se der errado:** se o cadastro pedir algo que você não tem (como CNPJ), pare e avise o agente; não invente dado.

---

## Passo 2 — Segredo de acesso ao preview na Vercel

**Para que serve:** o preview (endereço de teste de cada branch) fica protegido por login da Vercel, e o Asaas não consegue entrar para avisar dos pagamentos. O "Protection Bypass for Automation" cria um segredo que deixa só quem o conhece passar. Está disponível em todos os planos, inclusive no gratuito ([documentação da Vercel](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)).

1. Acesse **https://vercel.com**, entre e abra o projeto **foca** (time `foca3`).
2. **Settings** → **Deployment Protection**.
3. Gere o segredo, que **precisa ter exatamente 32 caracteres** (só o segredo: nada de `NOME=` e nada da chave do Asaas). No PowerShell, na pasta do projeto, este comando gera, grava no `.env.asaas-sandbox` e copia para a área de transferência sem mostrar na tela:
   ```powershell
   $b = New-Object byte[] 16; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); $s = ($b | % { $_.ToString("x2") }) -join ""; Add-Content .env.asaas-sandbox ("VERCEL_BYPASS_PREVIEW=" + $s); Set-Clipboard $s
   ```
4. Na seção **Protection Bypass for Automation** → **Add Bypass**: no primeiro campo, cole (**Ctrl+V**) o segredo; na nota, escreva `webhook-asaas`; clique em **Add Bypass**.
5. **Não mexa** nas outras opções de proteção (a produção continua pública e os previews continuam protegidos).

**O que entregar ao agente:** "segredo da Vercel no arquivo".
**Como saber que deu certo:** o segredo aparece listado na seção, com o nome `webhook-asaas`.
**Se der errado:** se a seção não aparecer, avise o agente. A alternativa é um túnel do seu computador (Cloudflare Quick Tunnel, sem conta), que ele explica na hora.

---

## Passo 3 — Pedir o preview ao agente

**Para que serve:** o preview é uma cópia do Foca com banco de teste (a branch `dev` do Neon) e o Asaas do sandbox, onde tudo é testado sem tocar na produção.

1. Depois de aprovar a spec (Passo 11) e terminar os Passos 1 e 2, diga ao agente: **"pode criar o preview da 49"**.
2. O agente cria a branch `spec-49`, envia ao GitHub, cadastra as variáveis **só no ambiente Preview** e te devolve o endereço fixo, algo como `https://foca-git-spec-49-foca3.vercel.app`.

**Como saber que deu certo:** o agente mostra o endereço e a resposta da saúde do preview (`banco: ok`).

---

## Passo 4 — Google: publicar o login e liberar o preview

**Para que serve:** (a) hoje só os "usuários de teste" que você cadastrou conseguem entrar com Google na produção; publicar libera para todo mundo. (b) O preview tem outro endereço, que o Google precisa conhecer para o login funcionar lá.

### 4.1 Publicar o login com Google (pode fazer hoje)
1. Acesse **https://console.cloud.google.com** e selecione o projeto do Foca no topo.
2. Menu → **Google Auth Platform** → **Público-alvo** (ou "Audience").
3. Em "Status da publicação", clique em **Publicar app** e confirme.
4. O Foca só pede nome, e-mail e foto de perfil, que não exigem verificação do Google; a publicação vale na hora.

**Como saber que deu certo:** o status muda para **Em produção**. Peça para alguém que não é usuário de teste entrar em focaedu.com com o Google.

### 4.2 Liberar o endereço do preview (depois do Passo 3)
1. **Google Auth Platform** → **Clientes** → clique no cliente "Aplicativo da Web" do Foca.
2. Em **URIs de redirecionamento autorizados**, clique em **Adicionar URI** e cole o endereço do preview seguido de `/api/auth/callback/google` (por exemplo `https://foca-git-spec-49-foca3.vercel.app/api/auth/callback/google`).
3. Não apague as URIs que já estão lá (a de produção, `https://www.focaedu.com/api/auth/callback/google`, é a que faz o login funcionar hoje).
4. **Salvar**. Pode levar alguns minutos para valer.
5. O painel pode não mostrar o campo **Origens JavaScript autorizadas**. Tudo bem: ele só serve para login feito direto no navegador, e o login do Foca passa pelo servidor (Better Auth), que só precisa da URI de redirecionamento.

**Como saber que deu certo:** "Continuar com o Google" no preview leva ao Google e volta logado.

---

## Passo 5 — Webhook do Asaas

**Para que serve:** é o canal pelo qual o Asaas avisa o Foca de cada pagamento aprovado, recusado, reembolsado ou cancelado. Sem ele, quem paga não vira Basic ou Pro.

1. No sandbox do Asaas: menu do usuário → **Integrações** → aba **Webhooks** → **Adicionar webhook** (ou "Criar webhook").
2. Preencha:
   - **Nome:** `foca-preview`
   - **URL:** o endereço do preview + `/api/pagamentos/webhook?x-vercel-protection-bypass=` + o segredo do Passo 2. Exemplo:
     `https://foca-git-spec-49-foca3.vercel.app/api/pagamentos/webhook?x-vercel-protection-bypass=SEU_SEGREDO`
     (para copiar o segredo: `notepad .env.asaas-sandbox`)
   - **E-mail para avisos de falha:** o seu.
   - **Versão da API:** v3.
   - **Token de autenticação:** o `ASAAS_WEBHOOK_TOKEN` do arquivo.
   - **Fila de sincronização / webhook ativo:** ligado.
   - **Tipo de envio:** sequencial.
   - **Eventos:** marque **todos** os de cobrança (`PAYMENT_…`), de assinatura (`SUBSCRIPTION_…`) e de checkout (`CHECKOUT_…`).
3. **Salvar**.

**O que entregar ao agente:** "webhook do Asaas configurado".
**Como saber que deu certo:** o agente cria uma cobrança de teste e o painel de webhooks do Asaas mostra o envio com status de sucesso.
**Se der errado:** se o Asaas mostrar a fila **pausada** (acontece depois de 15 falhas seguidas), avise o agente; os eventos ficam guardados por 14 dias e podem ser reenviados.

---

## Passo 6 — Testes de pagamento no sandbox

**Para que serve:** provar, antes de qualquer venda real, que comprar, recusar, cancelar e reembolsar funcionam. É feito junto com o agente quando o checkout estiver pronto (tarefa T-49.3.7).

| # | Teste | Como pagar no sandbox | Esperado |
|---|---|---|---|
| 1 | Basic mensal, cartão aprovado | Um número de cartão válido do gerador que o Asaas indica (4Devs), qualquer validade futura, CCV `123` | Plano Basic ativo em até 1 minuto; e-mail de recibo |
| 2 | Pro mensal, cartão recusado | Mastercard `5184 0197 4037 3151` ou Visa `4916 5613 5824 0741` | "O pagamento não foi aprovado"; o plano não muda |
| 3 | Pro anual com Pix | Gere o Pix; no painel do sandbox, abra a cobrança e clique em **Confirmar pagamento** | Plano Pro ativo ao confirmar |
| 4 | Pacote de 3 protetores com Pix | Igual ao 3 | O estoque de protetores sobe 3 |
| 5 | Cancelar | No preview: Conta → Assinatura → Cancelar | O plano vale até o fim do período |
| 6 | Reembolso nos 7 dias | Conta → Assinatura → Pedir reembolso | Volta ao Free; o reembolso aparece no Asaas |
| 7 | Aviso repetido | O agente reenvia um evento pelo painel do Asaas | Nada muda na segunda vez |

Os números de cartão de teste podem mudar: confira na página "Testando pagamento com cartão de crédito" da documentação do Asaas.

---

## Passo 7 — E-mail de suporte no domínio

**Para que serve:** a lei de comércio eletrônico (Decreto 7.962/2013) exige um canal de atendimento publicado. Um endereço `@focaedu.com` passa confiança e chega no seu Gmail. O endereço é escolha sua (por exemplo `suporte@focaedu.com`).

### 7.1 Receber (Cloudflare Email Routing, grátis)
1. Acesse **https://dash.cloudflare.com** e entre.
2. Menu lateral: **Compute** → **Email Service** → **Email Routing** → **Onboard Domain** (em versões antigas do painel: abrir `focaedu.com` → **Email** → **Email Routing** → **Get started**).
3. Escolha `focaedu.com`. O Cloudflare mostra os registros DNS que vai criar (MX e SPF). Confirme com **Done** / **Add records and enable**. Os registros da Resend ficam em `send.focaedu.com` e não conflitam.
4. **Destination Addresses** → adicione o seu Gmail → abra o e-mail que o Cloudflare manda e clique em **Verify email address**.
5. **Routing Rules** → **Create routing rule** (ou "Create address"):
   - **Email pattern / Custom address:** `suporte` (ou o nome que escolher)
   - **Action:** Send to an email
   - **Destination:** o seu Gmail
   - **Save**.

**Como saber que deu certo:** mande um e-mail de outra conta para `suporte@focaedu.com` e veja se chega no Gmail (olhe também o spam). Pode levar de 5 a 15 minutos.

### 7.2 Responder como suporte@focaedu.com pelo Gmail (opcional)
1. Gmail (no computador) → engrenagem → **Ver todas as configurações** → aba **Contas e importação** → **Enviar e-mail como** → **Adicionar outro endereço de e-mail**.
2. Nome: `Foca`. E-mail: `suporte@focaedu.com`. Desmarque "Tratar como alias" se quiser. **Próxima etapa**.
3. Servidor SMTP: `smtp.resend.com` · Porta: `465` · Usuário: `resend` · Senha: a sua chave da Resend (a mesma do arquivo `.env.resend`) · **Conexão segura usando SSL**.
4. O Gmail manda um código para `suporte@focaedu.com`, que chega no seu Gmail pelo 7.1. Cole o código e confirme.

**O que entregar ao agente:** o endereço escolhido (pode ser pelo chat, não é segredo).

---

## Passo 8 — Conta AdSense

**Para que serve:** o AdSense é a conta de anúncios do Google, gratuita. O Ad Manager (Passo 9) exige uma conta AdSense para ser criado, e o Google revisa o site antes de exibir anúncio real. **Enquanto isso, o agente desenvolve com os anúncios de exemplo do Google**: a conta não bloqueia a implementação, só o anúncio real.

1. Acesse **https://adsense.google.com** → **Começar**, com a conta Google que vai receber os pagamentos de anúncio.
2. Site: `focaedu.com`. País: Brasil. Aceite os termos.
3. Na etapa **Conectar seu site**, escolha o método **Snippet de meta tag** (ou `ads.txt`) e **copie o código**. **Não cole nada no site você mesmo**: mande o código ao agente pelo chat (é público, não é segredo). Ele publica numa entrega que você autorizar.
4. **Não peça a revisão do site ainda.** O Google exige uma política de privacidade que fale de anúncios e cookies, que só sai depois da tarefa T-49.3.8 e da revisão jurídica. O agente avisa quando puder.
5. Os dados de pagamento do AdSense (conta bancária, documentos) só são pedidos quando houver receita; pode deixar para depois.

**O que entregar ao agente:** o código da meta tag ou a linha do `ads.txt`.
**Como saber que deu certo:** o painel do AdSense mostra o site `focaedu.com` com status "Preparando" ou "Não verificado" (normal até o agente publicar o código).

---

## Passo 9 — Ad Manager e blocos de anúncio

**Para que serve:** o Ad Manager é onde ficam os formatos que o Foca usa (recompensado e intersticial na web), que o AdSense comum não tem. A versão para pequenas empresas é gratuita.

1. Acesse **https://admanager.google.com** com a mesma conta Google do AdSense e escolha criar uma conta (ligada ao AdSense do Passo 8). No questionário, marque só "A central place to monetize different channels or devices", AdSense "Yes" e região "South America". Na criação: fuso **(GMT-03:00) Brasília** e moeda **BRL** (os dois não mudam depois).
   - **O Ad Manager só abre depois que a conta do AdSense for aprovada.** Antes disso, ele mostra "Erro: O Google está analisando o seu pedido de conta do AdSense" (visto em 01/10/2026). É só esperar o e-mail de aprovação e voltar.
   - Se o AdSense recusar (por exemplo porque a política de privacidade ainda diz que não há publicidade), tente de novo depois que a política for atualizada na implementação da 49. Não há custo.
2. Anote o **código da rede** (Network code, um número, em **Admin** → **Configurações globais**).
3. Crie três blocos em **Inventário** → **Blocos de anúncios** (Inventory → Ad units) → **Novo bloco de anúncios**:

   | Código | Tamanho |
   |---|---|
   | `foca_recompensado` | qualquer (o Google ignora o tamanho no recompensado da web); use `1x1` |
   | `foca_intersticial` | `1x1` (fora da página) |
   | `foca_retangulo` | `300x250` |

4. **Proteções** (Protections): crie uma proteção para a rede que bloqueie as categorias sensíveis (namoro, emagrecimento, apostas, álcool, conteúdo adulto, conteúdo chocante). **Desligue "Block non-instream video ads"**: sem isso o recompensado não aparece.
5. Não ligue nenhuma opção de personalização, público ou remarketing. O código do Foca já pede anúncio não personalizado e marca quem tem menos de 18 anos.
6. Crie o arquivo `.env.anuncios` (como no Passo 0):
   ```
   GAM_REDE=codigo_da_rede
   GAM_UNIDADE_RECOMPENSADO=/codigo_da_rede/foca_recompensado
   GAM_UNIDADE_INTERSTICIAL=/codigo_da_rede/foca_intersticial
   GAM_UNIDADE_RETANGULO=/codigo_da_rede/foca_retangulo
   ```
   Esses valores não são segredo (aparecem no código da página), mas o arquivo deixa tudo num lugar só.

**O que entregar ao agente:** "arquivo de anúncios pronto".
**Como saber que deu certo:** os três blocos aparecem em Inventário com status ativo.

---

## Passo 10 — Teste da rolagem no navegador do Instagram

**Para que serve:** o pulo da rolagem só acontece dentro do Instagram, e o Instagram não deixa o agente inspecionar a página por dentro. Por isso, ele cria um painel de diagnóstico, e o teste é feito por você em celular real. É feito duas vezes: uma para descobrir a causa e outra para confirmar a correção.

**Precisa de:** um iPhone e um Android com o Instagram atualizado (pode ser de alguém da família).

1. O agente manda um link do preview terminado em `?diagnostico-rolagem=1`.
2. No Instagram, mande o link para você mesmo por **mensagem direta** e toque nele: ele abre no navegador do Instagram, que é o que importa (não abra no Safari nem no Chrome).
3. Ligue a **gravação de tela** do celular.
4. Role devagar até a seção **Como funciona** (a do celular que muda de tela). Em cada cena, **inverta a direção três vezes**: sobe um pouco, desce um pouco.
5. Continue até o fim da página e volte ao topo.
6. No painel de diagnóstico (canto da tela), toque em **Copiar diagnóstico** e cole num e-mail para você mesmo.
7. Repita no outro celular.
8. Entregue ao agente: os dois textos de diagnóstico (pode colar no chat, não tem dado pessoal) e as gravações, salvas na pasta `edição Videos/` do projeto (fica fora do Git).

**Como saber que deu certo (na segunda vez):** você rola, inverte várias vezes em cada cena e a página não pula.

---

## Passo 11 — Aprovar a spec

**Para que serve:** pelo fluxo do projeto, nenhuma linha de código da 49 começa sem o seu "aprovado".

1. Leia a [spec](spec.md), principalmente o §0 (decisões) e o §5.1 (tabela de planos).
2. Os valores marcados **[proposta]** são sugestões do agente: preços anuais, preços e quantidades dos protetores, 5 vidas, limites da Foca IA por plano, regras do ranking.
3. Responda ao agente, por exemplo: "aprovo a 49" ou "aprovo a 49 com estas mudanças: …".

---

## Pendências pagas (não fazer agora)

| Item | Para que | Custo estimado | Quando |
|---|---|---|---|
| CNPJ (MEI com CNAE 8599-6/05, se o contador aceitar, ou ME) | Vender com nota fiscal e Pix Automático; Asaas de produção como empresa | MEI: DAS de R$ 86,05/mês | Antes da primeira venda real |
| Contador | CNAE, MEI ou ME, ISS, reforma tributária de 2027 | consulta ou mensalidade | Antes do CNPJ |
| Conta Asaas de produção (envio de documentos) | Receber de verdade | taxas por venda | Depois do CNPJ e do pedido explícito de ligar a venda |
| Vercel Pro | O plano gratuito é só para uso não comercial | US$ 20/mês | Antes da primeira venda |
| Neon pago | Quando o uso passar do gratuito | por uso | Quando o painel mostrar |
| Créditos na OpenAI | Foca IA, corretor, "explica de outro jeito", treino de redação | por uso | Sem eles, essas funções são construídas e testadas com um provedor falso, mas não validadas com IA real |
| Advogado (termos, privacidade, ECA Digital) | Publicar venda, anúncio e ranking | honorários | Antes de ligar venda ou anúncio real |
| Professor de redação | Revisar a rubrica do corretor | honorários | Antes de ligar o corretor |
| Apple Developer e Google Play | Apps nas lojas (outra iniciativa) | US$ 99/ano e US$ 25 uma vez | Depois |
| Certificado digital (e-CNPJ) | NFS-e, se o município exigir | ~R$ 150–300/ano | Se precisar |

## Checklist

- [ ] Passo 1: `.env.asaas-sandbox` com `ASAAS_API_URL`, `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN`
- [ ] Passo 2: `VERCEL_BYPASS_PREVIEW` no mesmo arquivo
- [ ] Passo 4.1: login com Google publicado
- [ ] Passo 7: e-mail de suporte recebendo (e endereço informado ao agente)
- [ ] Passo 8: conta AdSense criada e código de verificação enviado ao agente
- [ ] Passo 9: Ad Manager, três blocos e `.env.anuncios`
- [ ] Passo 11: spec aprovada
- [ ] Depois do preview: Passos 4.2, 5, 6 e 10
