/**
 * Le as FONTES REAIS da marca no repo do Foca e grava marca/snapshot.json.
 * A automacao nunca guarda uma copia do design system: guarda os valores extraidos
 * mais o hash de cada fonte, para que todo conteudo registre contra qual versao foi feito.
 *
 * Uso: bun run marca:sync   (ou bun ferramentas/marca/sincronizar.ts)
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { P } from "../lib/paths.ts";

const EXPRESSOES = [
  "neutra",
  "cobrando",
  "orgulhosa",
  "desapontada",
  "empolgada",
  "acolhedora",
  "surpresa",
  "entediada",
] as const;

export type Snapshot = ReturnType<typeof montarSnapshot>;

function hash(arquivo: string) {
  if (!existsSync(arquivo)) return null;
  return createHash("sha256").update(readFileSync(arquivo)).digest("hex").slice(0, 16);
}

/** Extrai as variaveis base do bloco :root de src/styles.css (nao os alias --color-*). */
function tokensDoStylesCss() {
  const css = readFileSync(P.stylesCss, "utf8");
  const bloco = /:root\s*\{([\s\S]*?)\n\}/.exec(css);
  if (!bloco) throw new Error("bloco :root nao encontrado em src/styles.css");
  const cores: Record<string, string> = {};
  const outros: Record<string, string> = {};
  for (const m of bloco[1].matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gim)) {
    const nome = m[1];
    const valor = m[2].trim();
    if (nome.startsWith("color-")) continue; // alias do @theme inline
    if (/^#[0-9a-f]{3,8}$/i.test(valor)) cores[nome] = valor.toLowerCase();
    else outros[nome] = valor;
  }
  return { cores, outros };
}

function taglineDoBrandTs() {
  const ts = readFileSync(P.brandTs, "utf8");
  const tag = /tagline:\s*"([^"]+)"/.exec(ts)?.[1] ?? null;
  const desc = /description:\s*\n?\s*"([^"]+)"/.exec(ts)?.[1] ?? null;
  return { tagline: tag, descricao: desc };
}

function montarSnapshot() {
  const { cores, outros } = tokensDoStylesCss();
  const fontes = [
    "space-grotesk-latin-wght.woff2",
    "plus-jakarta-sans-latin-wght.woff2",
    "space-mono-latin-700.woff2",
    "caveat-latin-600.woff2",
  ];
  const expressoes: Record<string, { arquivo: string | null; hash: string | null }> = {};
  for (const e of EXPRESSOES) {
    const a = join(P.logos, "expressoes", `${e}-320.png`);
    expressoes[e] = { arquivo: existsSync(a) ? a : null, hash: hash(a) };
  }
  const logos = {
    oficialColorida: join(P.logos, "foca-color-320.png"),
    iconeAzul512: join(P.logos, "icon-512.png"),
    contornoEscuro: join(P.logos, "foca-line-dark-720.png"),
    contornoClaro: join(P.logos, "foca-line-light-720.png"),
  };
  const telas: string[] = existsSync(P.telas)
    ? readdirSync(P.telas).filter((f) => f.endsWith(".png"))
    : [];
  return {
    geradoEm: new Date().toISOString(),
    aviso:
      "Arquivo GERADO por ferramentas/marca/sincronizar.ts. Nao editar a mao. Se um valor aqui divergir de src/styles.css, styles.css vence — rode o sync de novo.",
    marca: taglineDoBrandTs(),
    cores,
    layout: outros,
    tipografia: {
      display: "Space Grotesk",
      corpo: "Plus Jakarta Sans",
      dados: "Space Mono",
      manuscrito: "Caveat (so em superficie de marketing; no app nao existe)",
    },
    raios: { marcador: 6, botao: 16, card: 20, folha: 28, pilula: 999 },
    fontesArquivos: fontes.map((f) => ({
      arquivo: join(P.fontes, f),
      hash: hash(join(P.fontes, f)),
    })),
    logos: Object.fromEntries(
      Object.entries(logos).map(([k, v]) => [k, { arquivo: v, hash: hash(v) }]),
    ),
    expressoes,
    telasReais: telas.map((f) => ({
      arquivo: join(P.telas, f),
      nome: basename(f, ".png"),
      hash: hash(join(P.telas, f)),
    })),
    fontesDocumentais: [
      P.stylesCss,
      P.designMd,
      P.brandTs,
      join(P.repo, "docs", "COPY.md"),
      join(P.repo, "docs", "PRODUCT.md"),
    ].map((f) => ({
      arquivo: f,
      hash: hash(f),
    })),
  };
}

if (import.meta.main) {
  const s = montarSnapshot();
  writeFileSync(P.snapshot, JSON.stringify(s, null, 2) + "\n");
  const faltando = Object.entries(s.expressoes)
    .filter(([, v]) => !v.arquivo)
    .map(([k]) => k);
  console.log(
    `marca/snapshot.json atualizado (${Object.keys(s.cores).length} cores, ${s.telasReais.length} telas reais)`,
  );
  console.log(
    faltando.length
      ? `AUSENTES: expressoes sem arte -> ${faltando.join(", ")}`
      : "8/8 expressoes com arte real.",
  );
}

export { montarSnapshot, EXPRESSOES };
