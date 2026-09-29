/**
 * Extrator estático de `<button>` em JSX (usado por `a11y-static.test.ts`, docs/36 T-08.8).
 * Lê o texto e extrai a tag de abertura respeitando `{…}` e strings — um `>` dentro de
 * `onClick={() => a > b}` não fecha a tag.
 */
export type TagBotao = { texto: string; corpo: string; linha: number; arquivo: string; indice: number };

export function botoesDe(src: string, arquivo: string): TagBotao[] {
  const achados: TagBotao[] = [];
  const re = /<button(?=[\s>/])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    let i = m.index + "<button".length;
    let chaves = 0;
    let aspas: string | null = null;
    for (; i < src.length; i++) {
      const c = src[i];
      if (aspas) {
        if (c === aspas && src[i - 1] !== "\\") aspas = null;
        continue;
      }
      if (chaves > 0) {
        if (c === "{") chaves++;
        else if (c === "}") chaves--;
        else if (c === '"' || c === "'" || c === "`") aspas = c;
        continue;
      }
      if (c === "{") chaves++;
      else if (c === '"' || c === "'") aspas = c;
      else if (c === ">") break;
    }
    const abertura = src.slice(m.index, i + 1);
    const autoFechada = abertura.endsWith("/>");
    const fim = autoFechada ? i + 1 : src.indexOf("</button>", i);
    const corpo = autoFechada ? "" : src.slice(i + 1, fim === -1 ? undefined : fim);
    achados.push({
      texto: abertura,
      corpo,
      linha: src.slice(0, m.index).split("\n").length,
      arquivo,
      indice: m.index,
    });
  }
  return achados;
}
