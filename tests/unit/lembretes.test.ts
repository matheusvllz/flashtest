/**
 * Texto do lembrete e worker único (spec 50 §5.2.5; §0.3 A: sem pressão emocional nem urgência fabricada).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { VOZ } from "@/lib/voz";

const RAIZ = resolve(import.meta.dir, "..", "..");

describe("voz.ts — slot 'lembrete'", () => {
  test("6 frases neutras: sem ofensiva em risco, culpa, 'seu amigo', urgência, emoji ou nome do aluno", () => {
    expect(VOZ.lembrete.length).toBe(6);
    expect(new Set(VOZ.lembrete).size).toBe(6);
    const proibidas = /(ofensiva|sequ[eê]ncia|perder|perde|amig|esperando|sentimos|saudade|triste|urgente|agora|corra|[uú]ltima chance|n[aã]o esque[cç]a|{|nome)/i;
    for (const frase of VOZ.lembrete) {
      expect({ frase, ok: !proibidas.test(frase) }).toEqual({ frase, ok: true });
      expect(frase).not.toMatch(/!/);
      expect(frase).not.toMatch(/\p{Extended_Pictographic}/u);
      expect(frase.split(/\s+/).length).toBeLessThanOrEqual(14);
    }
  });
});

describe("worker único /sw.js", () => {
  const sw = readFileSync(resolve(RAIZ, "public/sw.js"), "utf8");
  const antigo = readFileSync(resolve(RAIZ, "public/sw-offline.js"), "utf8");

  test("push sempre: ícone institucional, título 'Foca' e toque abre a trilha", () => {
    expect(sw).toContain('addEventListener("push"');
    expect(sw).toContain('"/branding/foca/icon-192.png"');
    expect(sw).toContain('showNotification("Foca"');
    expect(sw).toContain('addEventListener("notificationclick"');
    expect(sw).toContain('const ABRIR = "/trilha"');
  });

  test("cache offline só com o modo ligado; nunca não-GET, outra origem, /api/ ou /_serverFn", () => {
    expect(sw).toMatch(/if \(modoOffline === false\) return;/);
    expect(sw).toContain('request.method !== "GET"');
    expect(sw).toContain("url.origin !== self.location.origin");
    expect(sw).toContain('url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn")');
  });

  test("o worker antigo só se desregistra e não intercepta nada", () => {
    expect(antigo).toContain("self.registration.unregister()");
    expect(antigo).not.toContain('addEventListener("fetch"');
  });

  test("vercel.json: /sw.js sem cache e 4 crons diários do lembrete (09h, 14h, 18h e 20h em Brasília)", () => {
    const v = JSON.parse(readFileSync(resolve(RAIZ, "vercel.json"), "utf8")) as {
      crons: { path: string; schedule: string }[];
      headers: { source: string; headers: { key: string; value: string }[] }[];
    };
    expect(v.headers.find((h) => h.source === "/sw.js")?.headers).toContainEqual({ key: "Cache-Control", value: "no-cache" });
    const lembretes = v.crons.filter((c) => c.path.startsWith("/api/cron/lembretes"));
    expect(lembretes).toEqual([
      { path: "/api/cron/lembretes?janela=manha", schedule: "0 12 * * *" },
      { path: "/api/cron/lembretes?janela=tarde", schedule: "0 17 * * *" },
      { path: "/api/cron/lembretes?janela=fim-de-tarde", schedule: "0 21 * * *" },
      { path: "/api/cron/lembretes?janela=noite", schedule: "0 23 * * *" },
    ]);
  });
});
