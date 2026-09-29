import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import * as TELAS from "../../../src/marketing/content/app-screens";

// As telas do app refeitas em HTML (docs/42 §5, F-24) não podem inventar nada: cada string tem de existir no código do
// app (../src). O teste só LÊ o app; a landing continua sem importar nada de lá (check:isolation).
const APP = resolve(import.meta.dir, "../../../src");

function arquivos(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) arquivos(f, out);
    else if (/\.(tsx?|json)$/.test(f)) out.push(f);
  }
  return out;
}

const CODIGO_APP = arquivos(APP)
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

function strings(o: unknown, caminho: string): { caminho: string; texto: string }[] {
  if (typeof o === "string") return [{ caminho, texto: o }];
  if (Array.isArray(o)) return o.flatMap((v, i) => strings(v, `${caminho}[${i}]`));
  if (o && typeof o === "object") return Object.entries(o).flatMap(([k, v]) => strings(v, `${caminho}.${k}`));
  return [];
}

// A única frase montada por template no app: a resposta local da Foca ("Você marcou X, mas o certo é Y. {explicação}").
const MONTADAS = new Set(["TELA_TUTOR.respostaInicio"]);

describe("telas do app na landing (docs/42 §5, F-24)", () => {
  const todas = Object.entries(TELAS).flatMap(([nome, v]) => strings(v, nome));

  test("há strings para conferir", () => {
    expect(todas.length).toBeGreaterThan(40);
  });

  test("cada string existe literalmente no código do app", () => {
    const faltando = todas.filter((s) => !MONTADAS.has(s.caminho) && !CODIGO_APP.includes(s.texto)).map((s) => `${s.caminho}: ${s.texto}`);
    expect(faltando).toEqual([]);
  });

  test("a resposta da Foca segue o template do app (tutor-prompt.ts, localFallback)", () => {
    expect(CODIGO_APP).toContain("`Você marcou ${focus.chosen ?? \"outra alternativa\"}, mas o certo é ${focus.correct}. ${focus.explanation}`");
    const { opcoes, escolhida, correta } = TELAS.TELA_QUESTAO;
    const letra = (i: number) => "ABCDE"[i];
    expect(opcoes.length).toBe(4);
    expect(TELAS.TELA_TUTOR.respostaInicio as string).toBe(`Você marcou ${letra(escolhida)}, mas o certo é ${letra(correta)}.`);
  });

  test("a questão é a do banco, com as mesmas alternativas e o mesmo gabarito", () => {
    const banco = JSON.parse(readFileSync(resolve(APP, "content/banco/mat/mat-porcentagem-conceito.json"), "utf8")) as {
      items: { exercise: { pergunta: string; opcoes: string[]; correta: number; explicacao: string } }[];
    };
    const q = banco.items.map((i) => i.exercise).find((e) => e.pergunta === TELAS.TELA_QUESTAO.pergunta);
    expect(q).toBeDefined();
    expect(q!.opcoes).toEqual([...TELAS.TELA_QUESTAO.opcoes]);
    expect(q!.correta).toBe(TELAS.TELA_QUESTAO.correta);
    expect(q!.explicacao).toBe(TELAS.TELA_QUESTAO.explicacao);
  });
});
