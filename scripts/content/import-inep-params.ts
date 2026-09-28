#!/usr/bin/env bun
/**
 * Importa parâmetros TRI/habilidade/gabarito dos microdados abertos do
 * ENEM (docs/30 §12.4/§18.4, Fase 10 do docs/31 F10.2) — CSV
 * `ITENS_PROVA_<ano>.csv`, separador `;`, codificação latin-1 (edge case
 * documentado no `31`). Nomes de coluna variam entre edições — lidos pelo
 * CABEÇALHO, não por posição fixa (a própria spec avisa: "confirmar nomes
 * exatos no dicionário de dados do ano baixado").
 *
 * Nunca baixa nem versiona microdados de PARTICIPANTES — só este arquivo de
 * ITENS (sem dado pessoal), que o usuário fornece localmente via `--csv`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type EnemAreaCode = "LC" | "MT" | "CN" | "CH";

export interface InepItemParams {
  ano: number;
  area: EnemAreaCode;
  coItem: number;
  coPosicao: number;
  habilidade: number; // 1..30 (H<n> da Matriz de Referência)
  gabarito: string;
  a: number;
  b: number;
  c: number;
  adaptado: boolean;
  abandonado: boolean;
  /** Presente só quando o CSV tiver a coluna de língua estrangeira (Inglês/Espanhol) — dois itens legítimos, não duplicata. */
  linguaEstrangeira?: string;
}

/**
 * Nomes de coluna aceitos por campo — a Inep já usou variações entre
 * edições (ex.: `IN_ITEM_ABAN` em alguns anos, `IN_ABANDONO` em outros);
 * o importador aceita qualquer um dos aliases conhecidos e falha alto e
 * claro se NENHUM alias de um campo obrigatório existir no cabeçalho, em
 * vez de silenciosamente gerar `NaN`/`undefined`.
 */
const ALIASES: Record<string, string[]> = {
  area: ["SG_AREA"],
  coItem: ["CO_ITEM"],
  coPosicao: ["CO_POSICAO"],
  habilidade: ["CO_HABILIDADE"],
  gabarito: ["TX_GABARITO"],
  a: ["NU_PARAM_A"],
  b: ["NU_PARAM_B"],
  c: ["NU_PARAM_C"],
  abandonado: ["IN_ITEM_ABAN", "IN_ABANDONO"],
  adaptado: ["IN_ITEM_ADAPTADO", "IN_ADAPTADO"],
  linguaEstrangeira: ["TP_LINGUA"],
};

const CAMPOS_OBRIGATORIOS = [
  "area",
  "coItem",
  "coPosicao",
  "habilidade",
  "gabarito",
  "a",
  "b",
  "c",
] as const;

function parseCSVLine(linha: string, separador: string): string[] {
  // Sem aspas/escape no formato do Inep (campos são só número/código curto) — split direto é suficiente e testado contra o fixture real.
  return linha.split(separador).map((c) => c.trim());
}

/** Localiza, pra cada campo lógico, o índice da coluna no cabeçalho — usando os aliases conhecidos. */
export function resolverColunas(
  cabecalho: string[],
): Partial<Record<keyof typeof ALIASES, number>> {
  const indice: Partial<Record<keyof typeof ALIASES, number>> = {};
  for (const [campo, aliases] of Object.entries(ALIASES)) {
    for (const alias of aliases) {
      const i = cabecalho.indexOf(alias);
      if (i >= 0) {
        indice[campo as keyof typeof ALIASES] = i;
        break;
      }
    }
  }
  return indice;
}

/** Decodifica um CSV latin-1 (a codificação real dos microdados do Inep) em texto UTF-16 JS. */
export function decodeLatin1(bytes: Uint8Array): string {
  return new TextDecoder("iso-8859-1").decode(bytes);
}

export interface ParseResult {
  itens: InepItemParams[];
  /** Linhas puladas por ano-sem-parâmetro (`NU_PARAM_A/B/C` vazio) — registradas, não um erro (edge case do `31`). */
  puladas: number;
}

/** `parseInepCSV` é pura/testável — `main()` só resolve o arquivo real e chama isto. */
export function parseInepCSV(texto: string, ano: number, separador = ";"): ParseResult {
  const linhas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length === 0) return { itens: [], puladas: 0 };
  const cabecalho = parseCSVLine(linhas[0], separador);
  const colunas = resolverColunas(cabecalho);

  const faltando = CAMPOS_OBRIGATORIOS.filter((c) => colunas[c] === undefined);
  if (faltando.length > 0) {
    throw new Error(
      `[import-inep-params] coluna(s) obrigatória(s) não encontrada(s) no cabeçalho: ${faltando.join(", ")} (nenhum alias conhecido bateu — confirme o dicionário de dados deste ano)`,
    );
  }

  const itens: InepItemParams[] = [];
  let puladas = 0;

  for (const linha of linhas.slice(1)) {
    const campos = parseCSVLine(linha, separador);
    const get = (campo: keyof typeof ALIASES) =>
      colunas[campo] !== undefined ? campos[colunas[campo]!] : undefined;

    const brutoA = get("a");
    const brutoB = get("b");
    const brutoC = get("c");
    if (!brutoA?.trim() || !brutoB?.trim() || !brutoC?.trim()) {
      puladas++; // ano/item sem parâmetro publicado (edge case do `31`) — pula, não lança.
      continue;
    }
    const a = Number(brutoA);
    const b = Number(brutoB);
    const c = Number(brutoC);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
      puladas++; // valor presente mas não-numérico (CSV corrompido) — mesmo tratamento, nunca lança pra um lote inteiro.
      continue;
    }

    const area = get("area");
    if (area !== "LC" && area !== "MT" && area !== "CN" && area !== "CH") {
      puladas++;
      continue;
    }

    const abandonadoRaw = get("abandonado");
    itens.push({
      ano,
      area,
      coItem: Number(get("coItem")),
      coPosicao: Number(get("coPosicao")),
      habilidade: Number(get("habilidade")),
      gabarito: get("gabarito") ?? "",
      a,
      b,
      c,
      abandonado: abandonadoRaw === "1" || abandonadoRaw === "true",
      adaptado: get("adaptado") === "1" || get("adaptado") === "true",
      linguaEstrangeira: get("linguaEstrangeira") || undefined,
    });
  }

  return { itens, puladas };
}

/** Funde itens novos num arquivo existente — idempotente por `(ano, coItem)`, importar 2× não duplica. */
export function mergeInepParametros(
  existentes: InepItemParams[],
  novos: InepItemParams[],
): InepItemParams[] {
  const porChave = new Map(existentes.map((i) => [`${i.ano}:${i.coItem}`, i]));
  for (const item of novos) porChave.set(`${item.ano}:${item.coItem}`, item);
  return [...porChave.values()].sort((x, y) => x.ano - y.ano || x.coItem - y.coItem);
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag: string) =>
    args.find((a) => a.startsWith(`--${flag}=`) || a === `--${flag}`)?.split("=")[1];
  const csvPath = get("csv");
  const ano = get("ano") ? Number(get("ano")) : undefined;
  if (!csvPath || !ano) {
    console.error("Uso: bun scripts/content/import-inep-params.ts --csv=<caminho> --ano=<aaaa>");
    process.exit(1);
  }
  if (!existsSync(csvPath)) {
    console.error(`Arquivo não encontrado: ${csvPath}`);
    process.exit(1);
  }

  const bytes = readFileSync(csvPath);
  const texto = decodeLatin1(bytes);
  const { itens, puladas } = parseInepCSV(texto, ano);

  const destino = "src/content/oficial/inep-parametros.json";
  const existentes: InepItemParams[] = existsSync(destino)
    ? (JSON.parse(readFileSync(destino, "utf-8")) as InepItemParams[])
    : [];
  const combinados = mergeInepParametros(existentes, itens);

  if (!existsSync(dirname(destino))) mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, `${JSON.stringify(combinados, null, 2)}\n`, "utf-8");

  const readmePath = "src/content/oficial/README.md";
  const linhaFonte = `- ${ano}: ${itens.length} item(ns) importado(s), ${puladas} pulado(s) (sem parâmetro publicado) — de \`${csvPath}\`, em ${new Date().toISOString().slice(0, 10)}. Fonte: [microdados abertos do Inep](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem).\n`;
  const readmeAtual = existsSync(readmePath)
    ? readFileSync(readmePath, "utf-8")
    : "# Parâmetros oficiais do Inep (docs/30 §12.4, Fase 10)\n\nSó números/códigos — sem dado pessoal, sem reprodução de enunciado (isso é `src/content/banco/oficial/`, F10.5). Nunca versionar microdados de PARTICIPANTES, só o arquivo de itens.\n\n## Importações\n\n";
  writeFileSync(
    readmePath,
    readmeAtual.includes(`\`${csvPath}\`,`) ? readmeAtual : `${readmeAtual}${linhaFonte}`,
    "utf-8",
  );

  console.log(
    `[import-inep-params] ano=${ano}: ${itens.length} item(ns), ${puladas} pulado(s). Total combinado: ${combinados.length}.`,
  );
}

if (import.meta.main) {
  await main();
}
