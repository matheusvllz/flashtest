import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { LP } from "../../../src/marketing/content/copy";
import item from "../../../src/marketing/content/demo-item.json";

// Regras de copy da landing (docs/40 §9.2, §26.1). Cada violação é uma promessa que o produto não sustenta
// ou um tique de texto artificial. As exceções são listas fechadas e comentadas.

/** Todas as strings de um objeto, com o caminho (para a mensagem de erro). */
function strings(o: unknown, caminho = "LP"): { caminho: string; texto: string }[] {
  if (typeof o === "string") return [{ caminho, texto: o }];
  if (Array.isArray(o)) return o.flatMap((v, i) => strings(v, `${caminho}[${i}]`));
  if (o && typeof o === "object") return Object.entries(o).flatMap(([k, v]) => strings(v, `${caminho}.${k}`));
  return [];
}

const TODAS = strings(LP);

const PROIBIDAS: [RegExp, string][] = [
  // docs/42 §1: U-1 (nada de lista do que o Foca não faz) e U-2 (a landing é do produto final: nada de "sem conta").
  [/\bsem (e-?mail|senha|conta|cadastro)\b|criar conta|preciso de conta|cadastr/i, 'promessa de "sem conta" (U-2)'],
  [/\bnão (promete|corrige|cobra|compara|substitui)\b/i, "limitação como mensagem (U-1)"],
  [/o que o foca não faz/i, 'seção "O que o Foca não faz" (U-1)'],
  [/neste aparelho|no navegador|trocar de celular/i, "limite do protótipo (U-2)"],
  [/60\s*segundos/i, '"60 segundos" (duração não medida)'],
  [/\b(segundos?|minutos?)\b|\b\d+\s*horas?\b/i, "duração em tempo (docs/40 §9.2)"],
  [/aprova(ç|c)|aprovad|aprovar|\bvagas?\b|\bnotas?\b/i, "promessa de aprovação, vaga ou nota"],
  [/%/, "porcentagem"],
  [/dominad|\bdomina\b|domínio|mastery/i, '"domina/domínio/Mastery"'],
  [/jornada/i, '"jornada" (glossário: trilha)'],
  [/garant/i, "garantia"],
  [/revolucion|incrível|transforme|potencializ|desbloque|seamless/i, "palavra de anúncio"],
  [/grátis para sempre|100% grátis|premium|plano pago|\bR\$/i, "preço ou plano (docs/40 §10)"],
  [/duolingo/i, "concorrente por nome"],
  [/milhares|milhões|\bmil\b|alunos aprovados/i, "número de pessoas"],
  [/checkpoint|streak/i, "termo fora do glossário"],
  [/[—–]/, "travessão"],
  [/(?![©®™])\p{Extended_Pictographic}/u, "emoji"],
  [/não é [^.!?]+[.!?]\s*é /i, 'padrão "Não é X. É Y."'],
  [/mais do que [^.]+,\s/i, 'padrão "Mais do que X, Y"'],
];

describe("copy da landing (docs/40 §9.2)", () => {
  test("há strings para testar", () => {
    expect(TODAS.length).toBeGreaterThan(60);
  });

  for (const [re, motivo] of PROIBIDAS) {
    test(`nenhuma string tem ${motivo}`, () => {
      const ruins = TODAS.filter((s) => re.test(s.texto));
      expect(ruins.map((s) => `${s.caminho}: ${s.texto}`)).toEqual([]);
    });
  }

  test("números só os permitidos: 4 a 8 questões, 7 dias, até 2 congelamentos, ano do rodapé", () => {
    const permitidas = [/\b4 a 8\b/, /\b7\sdias\b/, /\baté 2\b/, /©\s2026/];
    const ruins = TODAS.filter((s) => /\d/.test(s.texto)).filter((s) => !permitidas.some((p) => p.test(s.texto)));
    expect(ruins.map((s) => `${s.caminho}: ${s.texto}`)).toEqual([]);
  });

  test("H1: a pergunta do João e a resposta com a marca, o destaque na promessa (docs/42 §5)", () => {
    expect(LP.hero.pergunta).toBe("Por onde eu começo?");
    expect(LP.hero.respostaAntes + LP.hero.respostaDestaque).toBe("O Foca já escolheu.");
    // Rima com o fechamento: a mesma promessa, com a mesma marca-texto.
    expect(LP.fechamento.tituloAntes + LP.fechamento.tituloDestaque).toContain("próximo passo já está escolhido");
  });

  test('"grátis" só como começar grátis (U-3), nunca plano, preço ou "para sempre"', () => {
    const comGratis = TODAS.filter((s) => /grátis|de graça|sem pagar/i.test(s.texto));
    for (const s of comGratis) expect(s.texto, s.caminho).toMatch(/^é grátis\?$|começar grátis|comece grátis|começar é\. você faz as lições da trilha e acompanha o seu progresso sem pagar nada|app oficial de graça/i);
  });

  test("subtítulo do hero cabe em 22 palavras", () => {
    expect(LP.hero.subtitulo.split(/\s+/).length).toBeLessThanOrEqual(22);
  });

  test("respostas do FAQ têm até 35 palavras", () => {
    for (const q of LP.faq.itens) expect(q.r.split(/\s+/).length).toBeLessThanOrEqual(35);
  });

  test("um só rótulo para a ação principal em toda a página", () => {
    const rotulos = new Set([LP.nav.cta, LP.hero.cta, LP.tentaUma.cta, LP.fechamento.cta, LP.sticky.cta]);
    expect([...rotulos]).toEqual(["Começar grátis"]);
  });

  test("o item da demo é o do app: sem travessão e é múltipla escolha", () => {
    expect(item.tipo).toBe("multipla-escolha");
    expect(JSON.stringify(item)).not.toMatch(/[—–]/);
  });
});

/* ---------------------------------------------------------------- nada de texto visível no JSX */

function arquivos(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) arquivos(f, out);
    else if (f.endsWith(".tsx")) out.push(f);
  }
  return out;
}

const SRC = resolve(import.meta.dir, "../../../src/marketing");

describe("texto visível fica em copy.ts, não no JSX (docs/40 §15.5)", () => {
  test("nenhum .tsx tem texto literal entre tags", () => {
    const achados: string[] = [];
    for (const f of arquivos(SRC)) {
      const t = readFileSync(f, "utf8");
      // Texto de JSX: entre ">" e "<", sem chaves, com pelo menos 2 letras seguidas.
      for (const m of t.matchAll(/>\s*([^<>{}\n;=()]*[A-Za-zÀ-ÿ]{2}[^<>{}\n;=()]*)\s*</g)) {
        const trecho = m[1].trim();
        // Comentários e generics de TypeScript (Array<string>, useRef<HTMLDivElement>) não são texto.
        if (!trecho || /^[A-Za-z0-9_.,\s|[\]]+$/.test(trecho) && /^[A-Z]/.test(trecho) && /Element|Ref|State|Props|null|undefined|number|string|boolean|Promise|Record|Partial|Component/.test(trecho)) continue;
        achados.push(`${f.replace(SRC, "src")}: "${trecho}"`);
      }
    }
    expect(achados).toEqual([]);
  });

  test("nenhum atributo visível (alt, aria-label, title) é literal", () => {
    const achados: string[] = [];
    for (const f of arquivos(SRC)) {
      const t = readFileSync(f, "utf8");
      for (const m of t.matchAll(/\b(alt|aria-label|title)="([^"]+)"/g)) {
        if (m[2]) achados.push(`${f.replace(SRC, "src")}: ${m[1]}="${m[2]}"`);
      }
    }
    expect(achados).toEqual([]);
  });

  test("eyebrows: no máximo 3 usos de lp-label (docs/40 §9.2 regra 4)", () => {
    let n = 0;
    for (const f of arquivos(resolve(SRC, "sections"))) n += (readFileSync(f, "utf8").match(/\blp-label\b/g) ?? []).length;
    expect(n).toBeLessThanOrEqual(3);
  });
});
