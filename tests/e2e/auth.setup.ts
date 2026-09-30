/**
 * Projeto de preparação dos E2E (docs/specs/46-producao T-04.6): cria uma conta real e verificada e guarda a sessão
 * em `tests/e2e/.auth/aluno.json`, usada pelos projetos que visitam rotas de estudo (estudar exige conta).
 *
 * Também "aquece" o servidor de desenvolvimento: a primeira renderização SSR de `/trilha` num servidor frio quebra o
 * streaming do React (backlog B-022, preexistente e só do servidor de desenvolvimento — o build de produção responde
 * normal). Pedir cada rota de estudo uma vez aqui evita que o primeiro teste a abrir a rota falhe por isso.
 */
import { test as setup } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { criarContaVerificada, entrarPelaApi, ORIGEM } from "./helpers/conta";

export const SESSAO_ALUNO = "tests/e2e/.auth/aluno.json";
const ROTAS_PARA_AQUECER = ["/trilha", "/study", "/progress", "/profile", "/flashcards", "/redacao", "/nivelamento", "/aha", "/plan"];

setup("conta de teste com sessão", async ({ request }) => {
  setup.setTimeout(120_000);
  const email = await criarContaVerificada(request);
  await entrarPelaApi(request, email);
  await request.storageState({ path: SESSAO_ALUNO });
  // Os E2E que usam esta conta testam o estudo NESTE aparelho e semeiam progresso local sem conta. Para eles, a
  // pergunta da importação fica adiada (como no "Decidir depois") e o motor de sincronização fica pausado (chave só
  // de desenvolvimento), senão o XP e o documento de um teste entrariam no outro. A sincronização e a importação têm
  // E2E próprios, com contas separadas e o motor ligado (sync.spec.ts).
  const sessao = JSON.parse(readFileSync(SESSAO_ALUNO, "utf8")) as { cookies: unknown[]; origins: unknown[] };
  sessao.origins = [
    {
      origin: ORIGEM,
      localStorage: [
        { name: "foca.importacao.adiadaAte", value: "99999999999999" },
        { name: "foca.sync.pausadaDev", value: "1" },
      ],
    },
  ];
  writeFileSync(SESSAO_ALUNO, JSON.stringify(sessao, null, 2));
  for (const rota of ROTAS_PARA_AQUECER) {
    for (let tentativa = 0; tentativa < 2; tentativa++) {
      const r = await request.get(`${ORIGEM}${rota}`, { timeout: 30_000 }).catch(() => null);
      if (r?.ok()) break;
    }
  }
});
