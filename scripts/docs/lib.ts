/**
 * Utilitários compartilhados pelos scripts de documentação (docs/specs/46-producao,
 * T-01.7/T-01.8): lista de arquivos de texto do repo, extração de links Markdown
 * e resolução de caminhos relativos.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, posix, relative, resolve } from "node:path";

export const RAIZ = resolve(import.meta.dir, "..", "..");

/** Pastas que nunca são varridas: dependências, artefatos, ferramentas fora do Git. */
const IGNORAR = new Set([
  "node_modules",
  ".git",
  "dist",
  ".output",
  ".vercel",
  ".netlify",
  ".tanstack",
  ".nitro",
  "test-results",
  "playwright-report",
  "blob-report",
  ".security-review",
  "edição Videos",
  "Claude outputs",
  "worktrees",
  "lotes",
  "__pycache__",
]);

/** Arquivos gerados que não devem ser tocados. */
const IGNORAR_ARQUIVOS = new Set(["src/routeTree.gen.ts", "bun.lock"]);

export const EXT_TEXTO = [".md", ".ts", ".tsx", ".mjs", ".js", ".json", ".py", ".yml", ".yaml", ".css", ".toml", ".txt"];

/** Caminho relativo à raiz, sempre com "/". */
export function rel(abs: string): string {
  return relative(RAIZ, abs).split("\\").join("/");
}

export function listarArquivos(exts: string[] = EXT_TEXTO, base = RAIZ): string[] {
  const saida: string[] = [];
  const andar = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      if (IGNORAR.has(nome)) continue;
      const abs = join(dir, nome);
      const st = statSync(abs);
      if (st.isDirectory()) {
        // public/content é gerado (build-packs); não tem texto de documentação.
        if (rel(abs) === "public/content") continue;
        andar(abs);
      } else if (exts.some((e) => nome.endsWith(e))) {
        const r = rel(abs);
        if (!IGNORAR_ARQUIVOS.has(r)) saida.push(r);
      }
    }
  };
  andar(base);
  return saida.sort();
}

export interface LinkMd {
  /** Índice do início do alvo dentro do texto. */
  inicio: number;
  fim: number;
  alvo: string;
  /** O alvo estava entre < >. */
  angular: boolean;
}

/** Links Markdown `[texto](alvo)` e `[texto](<alvo com espaço>)`, fora de blocos de código. */
export function extrairLinks(texto: string): LinkMd[] {
  const links: LinkMd[] = [];
  const blocos = mapaDeBlocosDeCodigo(texto, true);
  const re = /\]\((<[^>\n]+>|[^)\s]+)(\s+"[^"\n]*")?\)/g;
  for (const m of texto.matchAll(re)) {
    const idx = m.index! + 2;
    if (dentroDeBloco(blocos, idx)) continue;
    const bruto = m[1];
    const angular = bruto.startsWith("<");
    links.push({ inicio: idx, fim: idx + bruto.length, alvo: angular ? bruto.slice(1, -1) : bruto, angular });
  }
  return links;
}

export function ehRelativo(alvo: string): boolean {
  return !/^(https?:|mailto:|tel:|data:|#|\/\/)/i.test(alvo) && !alvo.startsWith("/");
}

/** Separa "caminho#ancora" e decodifica %20. */
export function separarAncora(alvo: string): { caminho: string; ancora: string } {
  const i = alvo.indexOf("#");
  const caminho = i === -1 ? alvo : alvo.slice(0, i);
  const ancora = i === -1 ? "" : alvo.slice(i);
  let dec = caminho;
  try {
    dec = decodeURI(caminho);
  } catch {
    /* mantém */
  }
  return { caminho: dec, ancora };
}

/** Resolve um alvo relativo a partir do arquivo (ambos relativos à raiz, com "/"). */
export function resolverRelativo(arquivo: string, caminho: string): string {
  return posix.normalize(posix.join(posix.dirname(arquivo), caminho)).replace(/\/$/, "");
}

export function relativoDe(arquivo: string, destino: string): string {
  let r = posix.relative(posix.dirname(arquivo), destino);
  if (r === "") r = posix.basename(destino);
  return r;
}

export function existe(caminhoRel: string): boolean {
  return existsSync(join(RAIZ, caminhoRel));
}

export function dirDe(caminhoRel: string): string {
  return dirname(caminhoRel).split("\\").join("/");
}

/** Intervalos [ini, fim) de blocos ``` ``` (e, se pedido, de código inline `...`). */
export function mapaDeBlocosDeCodigo(texto: string, comInline = false): Array<[number, number]> {
  const faixas: Array<[number, number]> = [];
  const cerca = /^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm;
  for (const m of texto.matchAll(cerca)) faixas.push([m.index!, m.index! + m[0].length]);
  if (comInline) for (const m of texto.matchAll(/`[^`\n]+`/g)) faixas.push([m.index!, m.index! + m[0].length]);
  return faixas;
}

export function dentroDeBloco(faixas: Array<[number, number]>, i: number): boolean {
  return faixas.some(([a, b]) => i >= a && i < b);
}

/** Slug de título no estilo do GitHub (usado para conferir âncoras). */
export function slugGithub(titulo: string): string {
  return titulo
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}

export function ancorasDe(texto: string): Set<string> {
  const vistos = new Map<string, number>();
  const saida = new Set<string>();
  const blocos = mapaDeBlocosDeCodigo(texto);
  for (const m of texto.matchAll(/^(#{1,6})\s+(.+?)\s*#*\s*$/gm)) {
    if (dentroDeBloco(blocos, m.index!)) continue;
    const base = slugGithub(m[2]);
    const n = vistos.get(base) ?? 0;
    vistos.set(base, n + 1);
    saida.add(n === 0 ? base : `${base}-${n}`);
  }
  for (const m of texto.matchAll(/<a\s+(?:name|id)="([^"]+)"/g)) saida.add(m[1]);
  return saida;
}
