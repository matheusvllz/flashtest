/**
 * Fórmula química escrita com dígito comum ("SiO2", "CO2"). Alguns PDFs desenham o índice com deslocamento dentro
 * do mesmo item de texto, e o pdf.js entrega o dígito na linha: o impresso tem índice, o texto extraído não.
 * Quem acha uma dessas troca o trecho pelo recorte do original (ou deixa a questão de fora).
 */
const ELEMENTOS =
  "He|Li|Be|Ne|Na|Mg|Al|Si|Cl|Ar|Ca|Ti|Cr|Mn|Fe|Co|Ni|Cu|Zn|Br|Ag|Sn|Ba|Au|Hg|Pb|Pu|Ra|Rn|Se|As|Sr|H|B|C|N|O|F|P|S|K|I|U";
const RE_FORMULA = new RegExp(`^(?:(?:${ELEMENTOS})\\d*|\\(|\\))+$`);

/** Primeira palavra que parece fórmula química com dígito ASCII (ex.: "SiO2"), ou `null`. */
export function formulaSemIndice(texto: string): string | null {
  for (const palavra of texto.match(/[A-Za-z0-9()]+/g) ?? []) {
    if (palavra.length < 2 || !/\d/.test(palavra) || !/^[A-Z(]/.test(palavra)) continue;
    if (RE_FORMULA.test(palavra) && /[A-Za-z)]\d/.test(palavra)) return palavra;
  }
  return null;
}
