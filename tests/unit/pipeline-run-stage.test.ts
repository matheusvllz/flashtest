import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { callStage, candidatosPendentes, idsJaProcessados } from "../../scripts/content/run-stage";

/**
 * Executor de estágio — Modo B (docs/30 §19.3/§19.5, Fase 9 F9.5). Testado
 * contra um servidor HTTP falso real (`Bun.serve`), não um mock de `fetch`
 * — cobre a integração de verdade (headers, corpo, retentativa).
 */

describe("callStage", () => {
  let server: ReturnType<typeof Bun.serve>;
  let requisicoes = 0;

  afterEach(() => {
    server?.stop(true);
    requisicoes = 0;
  });

  test("sucesso: devolve o JSON parseado e o uso de tokens", async () => {
    server = Bun.serve({
      port: 0,
      fetch() {
        requisicoes++;
        return Response.json({
          choices: [{ message: { content: JSON.stringify({ resposta: 42 }) } }],
          usage: { prompt_tokens: 10, completion_tokens: 5 },
        });
      },
    });
    const r = await callStage(`http://localhost:${server.port}`, "chave-fake", "modelo-x", "sistema", "usuario", (raw) => JSON.parse(raw));
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ resposta: 42 });
    expect(r.usage).toEqual({ promptTokens: 10, completionTokens: 5 });
    expect(requisicoes).toBe(1);
  });

  test("JSON inválido -> 1 retentativa -> ainda inválido -> falha reportada", async () => {
    server = Bun.serve({
      port: 0,
      fetch() {
        requisicoes++;
        return Response.json({ choices: [{ message: { content: "isto não é JSON" } }] });
      },
    });
    const r = await callStage(`http://localhost:${server.port}`, "chave-fake", "modelo-x", "sistema", "usuario", (raw) => JSON.parse(raw));
    expect(r.ok).toBe(false);
    expect(requisicoes).toBe(2); // 1 tentativa original + 1 retentativa
  });

  test("JSON inválido na 1ª tentativa, válido na retentativa -> sucesso", async () => {
    server = Bun.serve({
      port: 0,
      fetch() {
        requisicoes++;
        const content = requisicoes === 1 ? "não é json" : JSON.stringify({ ok: true });
        return Response.json({ choices: [{ message: { content } }] });
      },
    });
    const r = await callStage(`http://localhost:${server.port}`, "chave-fake", "modelo-x", "sistema", "usuario", (raw) => JSON.parse(raw));
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ ok: true });
    expect(requisicoes).toBe(2);
  });

  test("HTTP de erro (500) -> falha sem lançar", async () => {
    server = Bun.serve({ port: 0, fetch: () => new Response("erro interno", { status: 500 }) });
    const r = await callStage(`http://localhost:${server.port}`, "chave-fake", "modelo-x", "sistema", "usuario", (raw) => JSON.parse(raw));
    expect(r.ok).toBe(false);
  });

  test("resposta sem choices/content -> falha sem lançar", async () => {
    server = Bun.serve({ port: 0, fetch: () => Response.json({ choices: [] }) });
    const r = await callStage(`http://localhost:${server.port}`, "chave-fake", "modelo-x", "sistema", "usuario", (raw) => JSON.parse(raw));
    expect(r.ok).toBe(false);
  });

  test("nunca envia a chave no corpo — só no header Authorization", async () => {
    let corpoRecebido = "";
    let headerRecebido = "";
    server = Bun.serve({
      port: 0,
      async fetch(req) {
        headerRecebido = req.headers.get("authorization") ?? "";
        corpoRecebido = await req.text();
        return Response.json({ choices: [{ message: { content: "{}" } }] });
      },
    });
    await callStage(`http://localhost:${server.port}`, "chave-super-secreta", "modelo-x", "sistema", "usuario", (raw) => JSON.parse(raw));
    expect(headerRecebido).toBe("Bearer chave-super-secreta");
    expect(corpoRecebido).not.toContain("chave-super-secreta");
  });
});

describe("idsJaProcessados / candidatosPendentes — retomada idempotente", () => {
  test("linhas válidas de JSONL viram um Set de candidateId", () => {
    const linhas = [JSON.stringify({ candidateId: "lote-1-1" }), JSON.stringify({ candidateId: "lote-1-2" })];
    const ids = idsJaProcessados(linhas);
    expect(ids.has("lote-1-1")).toBe(true);
    expect(ids.has("lote-1-2")).toBe(true);
    expect(ids.size).toBe(2);
  });

  test("linha corrompida (interrupção no meio da escrita) é ignorada, sem lançar", () => {
    const linhas = [JSON.stringify({ candidateId: "lote-1-1" }), '{"candidateId": "lote-1-2", "incompl'];
    expect(() => idsJaProcessados(linhas)).not.toThrow();
    const ids = idsJaProcessados(linhas);
    expect(ids.has("lote-1-1")).toBe(true);
    expect(ids.has("lote-1-2")).toBe(false);
  });

  test("linhas vazias são ignoradas", () => {
    const ids = idsJaProcessados(["", "  ", JSON.stringify({ candidateId: "x" })]);
    expect(ids.size).toBe(1);
  });

  test("candidatosPendentes filtra o que já foi processado, retoma só o resto", () => {
    const candidatos = [{ candidateId: "a" }, { candidateId: "b" }, { candidateId: "c" }];
    const pendentes = candidatosPendentes(candidatos, new Set(["a", "c"]));
    expect(pendentes.map((c) => c.candidateId)).toEqual(["b"]);
  });

  test("nenhum processado ainda -> todos pendentes", () => {
    const candidatos = [{ candidateId: "a" }, { candidateId: "b" }];
    expect(candidatosPendentes(candidatos, new Set())).toEqual(candidatos);
  });
});
