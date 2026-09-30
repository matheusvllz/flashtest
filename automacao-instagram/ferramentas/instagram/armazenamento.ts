/**
 * Adaptadores de armazenamento: a API da Meta BAIXA a midia por URL publica HTTPS no momento da
 * publicacao. Caminho de disco nao funciona. Nenhum adaptador aqui expoe pastas do computador
 * nem contrata servico: cada um usa uma URL publica que VOCE ja controla.
 *
 *   manual         voce sobe os arquivos onde quiser e escreve as URLs em conteudos/<id>/urls.json
 *   pasta-publica  copia para MIDIA_PASTA_PUBLICA/<id>/ (uma pasta ja servida por MIDIA_BASE_URL)
 *   base-url       os arquivos ja estao em MIDIA_BASE_URL/<id>/<arquivo> (subidos por outro meio)
 *   simulacao      URLs ficticias https://simulacao.invalid/... (so no modo de simulacao)
 *
 * Todo adaptador real VERIFICA a URL (HEAD: 200 + content-type) antes de entregar a Meta.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pastaConteudo } from "../lib/paths.ts";

export type Adaptador = "manual" | "pasta-publica" | "base-url" | "simulacao";

export async function verificarUrl(url: string, tipoEsperado: "image/jpeg" | "video/mp4") {
  if (!/^https:\/\//.test(url)) throw new Error(`URL precisa ser HTTPS: ${url}`);
  const r = await fetch(url, { method: "HEAD" }).catch((e) => {
    throw new Error(`URL inacessivel (${(e as Error).message}): ${url}`);
  });
  if (!r.ok) throw new Error(`URL respondeu HTTP ${r.status}: ${url}`);
  const tipo = r.headers.get("content-type") ?? "";
  if (
    !tipo.startsWith(tipoEsperado) &&
    !(tipoEsperado === "video/mp4" && tipo.startsWith("video/quicktime"))
  )
    throw new Error(`content-type "${tipo}" em ${url}; esperado ${tipoEsperado}`);
}

export async function disponibilizar(
  id: string,
  arquivos: string[],
  adaptador: Adaptador,
): Promise<string[]> {
  const tipoDe = (a: string) =>
    (a.endsWith(".mp4") ? "video/mp4" : "image/jpeg") as "image/jpeg" | "video/mp4";

  if (adaptador === "simulacao")
    return arquivos.map((a) => `https://simulacao.invalid/foca-social/${id}/${basename(a)}`);

  if (adaptador === "manual") {
    const mapa = join(pastaConteudo(id).base, "urls.json");
    if (!existsSync(mapa)) {
      writeFileSync(
        mapa,
        JSON.stringify(Object.fromEntries(arquivos.map((a) => [basename(a), ""])), null, 2) + "\n",
      );
      throw new Error(
        `Adaptador "manual": suba estes arquivos para um endereco HTTPS publico e preencha as URLs em\n  ${mapa}\n(arquivos: ${arquivos.map((a) => basename(a)).join(", ")})`,
      );
    }
    const urls = JSON.parse(readFileSync(mapa, "utf8")) as Record<string, string>;
    const saida = arquivos.map((a) => {
      const u = urls[basename(a)];
      if (!u) throw new Error(`falta a URL de ${basename(a)} em ${mapa}`);
      return u;
    });
    for (let i = 0; i < saida.length; i++) await verificarUrl(saida[i], tipoDe(arquivos[i]));
    return saida;
  }

  const baseUrl = (process.env.MIDIA_BASE_URL ?? "").replace(/\/$/, "");
  if (!baseUrl) throw new Error(`adaptador "${adaptador}" precisa de MIDIA_BASE_URL no .env`);

  if (adaptador === "pasta-publica") {
    const pasta = process.env.MIDIA_PASTA_PUBLICA;
    if (!pasta) throw new Error('adaptador "pasta-publica" precisa de MIDIA_PASTA_PUBLICA no .env');
    const destino = join(pasta, id);
    mkdirSync(destino, { recursive: true });
    for (const a of arquivos) copyFileSync(a, join(destino, basename(a)));
  }
  const saida = arquivos.map((a) => `${baseUrl}/${id}/${basename(a)}`);
  for (let i = 0; i < saida.length; i++) await verificarUrl(saida[i], tipoDe(arquivos[i]));
  return saida;
}
