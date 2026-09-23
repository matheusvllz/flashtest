# Flash Test

Protótipo do **Flash Test**: um app mobile-first de preparação para o ENEM em **aulas de 60 segundos** (1–2 questões por vez), com uma IA que aprende a lacuna de cada aluno e decide o que vem a seguir.

O diferencial do produto é **constância e personalização**, não volume de conteúdo — conteúdo gratuito já existe de sobra. O app monta a próxima aula a partir do diagnóstico do aluno e explica o erro *dele*, não o erro médio.

> Primeira versão pública (v1), construída como protótipo de pitch.

## O que já funciona

**Dois pilares de estudo**

- **Aulas de 60s** — 59 questões de ENEM/vestibular cobrindo as 11 matérias, com explicação, passo a passo, flashcard sugerido e videoaula por tópico.
- **Micro-treino de redação** — 15 trilhas, 134 lições e 1.204 exercícios em 7 formatos interativos (múltipla escolha, encontre o erro, complete a lacuna, ordenar, interpretação, parear e verdadeiro/falso). Desbloqueio sequencial, com estrelas e XP por lição.

**Tutor de IA**

Balão global presente em todas as telas pós-quiz. Abre sozinho quando o aluno erra, aceita **foto de questão** (multimodal) e responde com o contexto real do aluno — faculdade-alvo, lacunas do diagnóstico e desempenho medido.

Regra de honestidade do projeto: **os números vêm do app, só a frase é gerada pela IA.** O prompt proíbe explicitamente inventar estatística. Sem chave de API configurada, o tutor cai num fallback local em vez de quebrar.

**Progresso e engajamento**

Mapa de lacunas por matéria, ranking semanal de turma, streak, XP e flashcards com repetição espaçada.

## Rodando localmente

Requer [bun](https://bun.sh) (gerenciador de pacotes do projeto — não usar npm/yarn/pnpm, que geram um lockfile paralelo).

```sh
git clone https://github.com/matheusvllz/flashtest.git
cd flashtest
bun install
cp .env.example .env   # preencha OPENAI_API_KEY (opcional)
bun run dev
```

Abre em `http://localhost:8080`.

O app é **mobile-first** e a interface é enquadrada num frame de 440px — no desktop, use o modo dispositivo do navegador (Ctrl+Shift+M) para ver como foi desenhado.

### Verificar

```sh
bunx tsc --noEmit      # checagem de tipos
bun test tests/unit    # testes unitários
bunx playwright install chromium   # só na primeira vez
bunx playwright test   # testes end-to-end
bun run build           # build de produção
```

## Deploy

Hospedagem: **Vercel**, conectado a este repositório no GitHub — cada push em `main` gera um deploy de produção automaticamente (ver `docs/27-plano-home-trilha-visual.md` §14 para o diagnóstico completo do que já foi tentado e por quê).

- O app é SSR (TanStack Start/Nitro) porque o balão do tutor de IA precisa de uma função de servidor real para chamar a OpenAI — não é publicável como site estático (GitHub Pages fica de fora por isso).
- `vite.config.ts` escolhe o preset do Nitro pelo ambiente: `vercel` quando a variável `VERCEL` está definida (o próprio Vercel define), `netlify` fora dele — o mesmo código builda para as duas plataformas sem alterações.
- `vercel.json` fixa o gerenciador de pacotes (`bun install --frozen-lockfile`) e o comando de build.
- Variável de ambiente a configurar no painel do Vercel (**Settings → Environment Variables**): `OPENAI_API_KEY` (Production e Preview). Sem ela o tutor cai no fallback local em vez de quebrar.
- **Proteção de deploy:** por padrão o Vercel protege a URL de produção atrás de login (SSO) — para abrir num celular sem estar logado no Vercel, desligue ou restrinja a "Vercel Authentication" a Preview Deployments em **Settings → Deployment Protection**.

### Chave de IA

A chave vive em `.env` (gitignorado) e é lida **somente no servidor**, numa server function do TanStack Start — nunca chega ao navegador. Não use o prefixo `VITE_`, que a colocaria no bundle do cliente.

```dotenv
OPENAI_API_KEY=sk-...
```

Sem a chave o app roda normalmente: o tutor responde pelo fallback local.

## Stack

- **TanStack Start** (React 19) + TanStack Router com rotas *file-based* — `src/routeTree.gen.ts` é autogerado, não editar à mão
- **Vite 8** + **Tailwind CSS v4** (tokens em `src/styles.css`) + shadcn/ui
- **Estado**: um único store em `src/lib/store.ts` (`useSyncExternalStore` + `localStorage`)
- **IA**: OpenAI via `fetch` numa server function (`src/lib/tutor-core.ts`)
- Sem backend e sem banco — o cadastro é mock por decisão de escopo do protótipo

## Estrutura

```text
src/
  routes/            # rotas file-based (quiz, aha, study, redacao, progress, ranking…)
  components/
    lessons/         # player da trilha de redação + os 7 tipos de exercício
    TutorBubble.tsx  # balão global do tutor de IA
  lib/
    lessons/         # motor de lições: tipos, builders e correção algorítmica
    store.ts         # estado único do app
    tutor-core.ts    # camada de IA (testável fora do transporte)
  content/trilhas/   # as 134 lições, declarativas
  data/              # questões, matérias, universidades, ranking
```

O motor de lições é declarativo: **lição é dado, motor é código**. Um tipo novo de exercício = um componente + uma linha no registry, sem `if/else` de tipo espalhado pelo app.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Notas

- `bun.lock` vem do template original; o caminho documentado e usado no projeto é o **npm** (`package-lock.json`).
- O projeto é conectado ao [Lovable](https://lovable.dev). Evite reescrever histórico já publicado (force push, rebase ou amend de commits enviados) — isso quebra a sincronia do editor.
