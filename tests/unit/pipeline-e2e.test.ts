import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import {
  OrcamentoTokens,
  rodarCriticar,
  rodarGerar,
  rodarHumanizar,
  rodarResolver,
} from "../../scripts/content/run-stage";
import { lotePath, readJSONL } from "../../scripts/content/lote-io";
import type { BatchPlan, Candidate } from "../../scripts/content/pipeline-types";

/**
 * Integração ponta a ponta do Modo B (docs/30 §19.2/§19.3, Fase 9/11 do
 * docs/31) — fecha a lacuna registrada na Fase 9 (`docs/32`, AC-9.1: "não
 * existe um teste de INTEGRAÇÃO rodando os 8 estágios em sequência"). Um
 * servidor HTTP real (`Bun.serve`, mesmo padrão de `pipeline-run-stage.test.ts`)
 * simula os 5 estágios com LLM (gerar/criticar/resolver/escalar/humanizar),
 * distinguindo QUAL estágio pelo cabeçalho do prompt de sistema (o H1 de
 * cada `content-pipeline/prompts/*.md`) — robusto à ordem/concorrência das
 * chamadas, não depende de contador. Um dos 2 candidatos é construído pra
 * DISCORDAR de propósito (gerador × solucionador), exercitando o caminho de
 * escalonamento (estágio 4b) dentro do mesmo teste.
 *
 * Roda contra um loteId de teste real em `content-pipeline/lotes/` (gitignored)
 * — apagado no fim via `afterAll`.
 */

const LOTE_ID = `teste-e2e-${Date.now()}`;

const PERGUNTA_FACIL = "Quanto é 10% de 200 reais no total de uma compra?";
const PERGUNTA_DIFICIL =
  "Um estoque de 300 unidades caiu 20% em um mês; quantas unidades restaram?";

function fakeServer() {
  return Bun.serve({
    port: 0,
    async fetch(req) {
      const body = (await req.json()) as { messages: Array<{ role: string; content: string }> };
      const sistema = body.messages[0].content;
      const usuario = body.messages[1].content;

      if (sistema.includes("Estágio 1 — Gerar item")) {
        const entrada = JSON.parse(usuario) as { difficulty: number };
        const pergunta = entrada.difficulty === 1 ? PERGUNTA_FACIL : PERGUNTA_DIFICIL;
        const item = {
          type: "multipla-escolha",
          pergunta,
          opcoes: ["Dez", "Vinte", "Duzentos e quarenta", "Duzentos e quarenta reais no total"],
          correta: entrada.difficulty === 1 ? 1 : 2, // fácil: índice 1 ("Vinte"); difícil: índice 2.
          explicacao:
            "Explicação longa o bastante pra passar na validação de tamanho mínimo de vinte e cinco palavras no total, cobrindo o raciocínio da questão apresentada.",
        };
        return Response.json({
          choices: [{ message: { content: JSON.stringify(item) } }],
          usage: { prompt_tokens: 50, completion_tokens: 80 },
        });
      }

      if (sistema.includes("Estágio 2 — Criticar")) {
        return Response.json({
          choices: [{ message: { content: JSON.stringify({ verdict: "aprova", issues: [] }) } }],
        });
      }

      if (sistema.includes("Estágio 3 — Resolver")) {
        const entrada = JSON.parse(usuario) as { pergunta: string };
        // O item fácil, o solucionador concorda (índice 1). O difícil, ele
        // DISCORDA de propósito (responde 0 em vez de 2) — dispara o 4b.
        const resposta =
          entrada.pergunta === PERGUNTA_FACIL
            ? { answerIndex: 1, confidence: 0.95, reasoning: "10% de 200 é 20." }
            : {
                answerIndex: 0,
                confidence: 0.9,
                reasoning: "raciocínio deliberadamente diferente do gabarito",
              };
        return Response.json({ choices: [{ message: { content: JSON.stringify(resposta) } }] });
      }

      if (sistema.includes("Estágio 4b — Escalar")) {
        // O juiz confirma o gabarito do GERADOR (o solucionador que errou).
        return Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  veredito: "gerador",
                  note: "gabarito original está certo",
                }),
              },
            },
          ],
        });
      }

      if (sistema.includes("Estágio 5 — Humanizar")) {
        // Reescreve preservando todo invariante (mesmos números/unidades, sem negação nova) — a guarda deve aceitar.
        const reescrita = `Olha só — ${usuario}`;
        return Response.json({ choices: [{ message: { content: reescrita } }] });
      }

      return new Response("estágio desconhecido no fake server", { status: 500 });
    },
  });
}

afterAll(() => {
  if (existsSync(`content-pipeline/lotes/${LOTE_ID}`))
    rmSync(`content-pipeline/lotes/${LOTE_ID}`, { recursive: true, force: true });
});

describe("pipeline ponta a ponta (Modo B) — gerar → criticar → resolver(+verificar+escalar) → humanizar", () => {
  test("2 candidatos: 1 concorda direto, 1 discorda e escala — os dois terminam humanizados", async () => {
    const plano: BatchPlan = {
      loteId: LOTE_ID,
      createdAt: new Date().toISOString(),
      entries: [
        {
          skillId: "mat:porcentagem-valor",
          difficulty: 1,
          role: "pratica",
          kind: "item",
          quantity: 1,
        },
        {
          skillId: "mat:porcentagem-valor",
          difficulty: 4,
          role: "desafio",
          kind: "item",
          quantity: 1,
        },
      ],
      totalCandidates: 2,
    };
    mkdirSync(`content-pipeline/lotes/${LOTE_ID}`, { recursive: true });
    writeFileSync(lotePath(LOTE_ID, "01-plano.json"), JSON.stringify(plano, null, 2), "utf-8");

    const server = fakeServer();
    const baseUrl = `http://localhost:${server.port}`;
    try {
      const orc = new OrcamentoTokens(undefined);
      await rodarGerar(LOTE_ID, baseUrl, "chave-fake", "modelo-teste", 1, orc);
      const gerados = readJSONL<Candidate>(lotePath(LOTE_ID, "02-gerado.jsonl"));
      expect(gerados).toHaveLength(2);
      expect(gerados.every((c) => c.stages.generated)).toBe(true);

      await rodarCriticar(LOTE_ID, baseUrl, "chave-fake", "modelo-teste", 1, orc);
      const criticados = readJSONL<Candidate>(lotePath(LOTE_ID, "03-critica.jsonl"));
      expect(criticados).toHaveLength(2);
      expect(criticados.every((c) => c.stages.critique?.verdict === "aprova")).toBe(true);

      await rodarResolver(
        LOTE_ID,
        baseUrl,
        "chave-fake",
        { resolver: "modelo-teste", escalar: "modelo-teste" },
        1,
        orc,
      );
      const resolvidos = readJSONL<Candidate>(lotePath(LOTE_ID, "04-solucao.jsonl"));
      expect(resolvidos).toHaveLength(2);

      const facil = resolvidos.find(
        (c) => c.exercise?.type === "multipla-escolha" && c.exercise.pergunta === PERGUNTA_FACIL,
      )!;
      expect(facil.stages.verification?.agree).toBe(true);
      expect(facil.stages.verification?.escalated).toBe(false);

      const dificil = resolvidos.find(
        (c) => c.exercise?.type === "multipla-escolha" && c.exercise.pergunta === PERGUNTA_DIFICIL,
      )!;
      expect(dificil.stages.verification?.escalated).toBe(true);
      expect(
        dificil.stages.verification && "judge" in dificil.stages.verification
          ? dificil.stages.verification.judge
          : undefined,
      ).toBe("modelo-teste");
      // O juiz confirmou o GERADOR (índice 2, "Duzentos e quarenta") — não o solucionador (0).
      if (dificil.stages.verification && "finalAnswer" in dificil.stages.verification) {
        expect(dificil.stages.verification.finalAnswer).toBe(2);
      } else {
        throw new Error("esperava finalAnswer no candidato escalado e confirmado");
      }
      // Depois do rebalanceamento de posição, o gabarito publicado continua apontando pra mesma alternativa.
      if (dificil.exercise?.type === "multipla-escolha") {
        expect(dificil.exercise.opcoes[dificil.exercise.correta]).toBe("Duzentos e quarenta");
      }

      await rodarHumanizar(LOTE_ID, baseUrl, "chave-fake", "modelo-teste", 1, orc);
      const humanizados = readJSONL<Candidate>(lotePath(LOTE_ID, "06-humanizado.jsonl"));
      expect(humanizados).toHaveLength(2); // o escalado-mas-confirmado TAMBÉM passa (não foi rejeitado).
      for (const c of humanizados) {
        expect(c.stages.humanized?.accepted).toBe(true);
        expect(c.exercise?.explicacao).toContain("Olha só —");
      }

      expect(orc.total()).toBeGreaterThan(0); // token usage do estágio "gerar" (o único que devolveu `usage` no fake server).
    } finally {
      server.stop(true);
    }
  });
});
