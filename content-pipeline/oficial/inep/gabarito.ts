/**
 * Leitura do gabarito oficial (PDF "GB" do INEP): tabela "QUESTÃO | GABARITO", com duas colunas de resposta
 * (inglês, espanhol) nas questões 1–5 do 1º dia. Questão anulada aparece como "Anulado"/"Anulada"/"X".
 */
import type { GabaritoEntrada, ItemTexto, PaginaPdf } from "./tipos";

type Resposta = GabaritoEntrada["respostas"][number];

function respostaDe(str: string): Resposta | null {
  const s = str.trim().toUpperCase();
  if (/^[A-E]$/.test(s)) return s as Resposta;
  if (/^ANULAD[AO]S?$/.test(s) || s === "X" || s === "*") return "ANULADA";
  return null;
}

/** Agrupa itens em linhas pela linha de base (tolerância de 2 pt). */
function linhasPorBase(itens: ItemTexto[]): ItemTexto[][] {
  const ordenados = [...itens].sort((a, b) => a.base - b.base || a.x0 - b.x0);
  const linhas: ItemTexto[][] = [];
  for (const it of ordenados) {
    const ultima = linhas[linhas.length - 1];
    if (ultima && Math.abs(ultima[0].base - it.base) <= 2) ultima.push(it);
    else linhas.push([it]);
  }
  return linhas.map((l) => juntarDigitos(l.sort((a, b) => a.x0 - b.x0)));
}

/** O PDF às vezes parte um número em dois itens colados ("12" + "1"): junta dígitos com folga < 1,5 pt. */
function juntarDigitos(linha: ItemTexto[]): ItemTexto[] {
  const out: ItemTexto[] = [];
  for (const it of linha) {
    const ant = out[out.length - 1];
    if (
      ant &&
      /^\d+$/.test(ant.str.trim()) &&
      /^\d+$/.test(it.str.trim()) &&
      it.x0 - ant.x1 < 1.5
    ) {
      out[out.length - 1] = { ...ant, str: ant.str.trim() + it.str.trim(), x1: it.x1 };
    } else out.push(it);
  }
  return out;
}

export function lerGabarito(
  paginas: PaginaPdf[],
  faixa: { de: number; ate: number },
): Map<number, GabaritoEntrada> {
  const out = new Map<number, GabaritoEntrada>();
  for (const pagina of paginas) {
    const itens = pagina.itens.filter((i) => i.str.trim() && !i.girado);
    for (const linha of linhasPorBase(itens)) {
      let atual: GabaritoEntrada | null = null;
      const fechar = () => {
        if (atual && atual.respostas.length > 0 && !out.has(atual.numero))
          out.set(atual.numero, atual);
        atual = null;
      };
      for (const it of linha) {
        const s = it.str.trim();
        if (/^\d{1,3}$/.test(s)) {
          fechar();
          const n = Number(s);
          if (n >= faixa.de && n <= faixa.ate) atual = { numero: n, respostas: [] };
          continue;
        }
        const r = respostaDe(s);
        if (r && atual) (atual as GabaritoEntrada).respostas.push(r);
      }
      fechar();
    }
    // Nota de rodapé ("* Questão 135 Anulada"): o asterisco da tabela é desenho, não texto.
    const texto = pagina.itens
      .map((i) => i.str)
      .join(" ")
      .replace(/\s+/g, " ");
    for (const m of texto.matchAll(/Quest(?:ão|ões)\s+([\d,\se]+?)\s+Anulad[ao]s?/gi)) {
      for (const n of m[1].match(/\d{1,3}/g) ?? []) {
        const num = Number(n);
        if (num >= faixa.de && num <= faixa.ate)
          out.set(num, { numero: num, respostas: ["ANULADA"] });
      }
    }
  }
  return out;
}
