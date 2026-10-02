/**
 * Avaliação técnica do corretor de redação antes da liberação (spec 50 §5.10.5, T-50.11.6, RF-25).
 *
 *   bun scripts/redacao/avaliar-corretor.ts --rodadas 3                 # com OPENAI_API_KEY no ambiente LOCAL
 *   bun scripts/redacao/avaliar-corretor.ts --pasta outra/pasta --rodadas 3
 *   bun scripts/redacao/avaliar-corretor.ts --seco                      # sem rede: IA simulada, só confere a ferramenta
 *
 * Lê os conjuntos A, B e C de uma pasta LOCAL ignorada pelo Git (padrão `.data/avaliacao-redacao/`, com as subpastas
 * `A/`, `B/` e `C/`), um JSON por texto:
 *
 *   A/a01.json  { "id": "a01", "tema": "…", "texto": "…" }                        redações nota 1000 das cartilhas
 *   B/b01.json  { "id": "b01", "tema": "…", "texto": "…", "caso": "sem-proposta" }  versões degradadas (CASOS_B)
 *   C/c01.json  { "id": "c01", "tema": "…", "texto": "…", "notasDoDono": [120, 120, 80, 120, 80] }
 *
 * Textos do INEP NUNCA entram no repositório nem no app: ficam só nessa pasta, para teste interno. Usa o mesmo caminho
 * do servidor (checagem local de 7 linhas, `SISTEMA_CORRETOR`, `lerCorrecao`, 1 nova tentativa), sem banco e sem
 * cota. Nunca roda contra produção: recusa `VERCEL_ENV=production` e `NODE_ENV=production`. Imprime o relatório das
 * metas de §5.10.5 para colar no registro da spec 50.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { lerCorrecao, mensagemDoCorretor, semEstimativaLocal, SISTEMA_CORRETOR, temTextoProibido, VERSAO_RUBRICA, type Correcao } from "@/lib/redacao-ia";
import { chamarIA, definirChamadaIA, TUTOR_MODELO } from "@/server/tutor/ia";
import { avaliarMetas, CASOS_B, relatorioEmTexto, type CasoB, type Conjunto, type Execucao, type TextoDeAvaliacao } from "./metricas";

const RAIZ = resolve(import.meta.dir, "..", "..");
const args = process.argv.slice(2);
const opcao = (nome: string) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const tem = (nome: string) => args.includes(`--${nome}`);

const pasta = resolve(RAIZ, opcao("pasta") ?? ".data/avaliacao-redacao");
const rodadas = Math.max(1, Math.min(5, Number(opcao("rodadas") ?? 1) || 1));
const seco = tem("seco");
const TENTATIVAS = 2;
const PRECO = { entrada: Number(process.env.AI_PRECO_ENTRADA_USD_MTOK ?? 1), saida: Number(process.env.AI_PRECO_SAIDA_USD_MTOK ?? 8) };

if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
  console.error("recusado: a avaliação do corretor nunca roda em produção (spec 50 §5.10.5)");
  process.exit(2);
}
if (!seco && !process.env.OPENAI_API_KEY?.trim()) {
  console.error("sem OPENAI_API_KEY no ambiente: rode com a chave local (nunca a de produção) ou use --seco para conferir a ferramenta");
  process.exit(2);
}

function lerConjunto(c: Conjunto): TextoDeAvaliacao[] {
  const dir = join(pasta, c);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".json"))
    .sort()
    .map((n) => {
      // Sem o BOM que editores do Windows põem no início do arquivo.
      const conteudo = readFileSync(join(dir, n), "utf8");
      const bruto = JSON.parse(conteudo.charCodeAt(0) === 0xfeff ? conteudo.slice(1) : conteudo) as Partial<TextoDeAvaliacao>;
      if (typeof bruto.texto !== "string" || typeof bruto.tema !== "string") throw new Error(`${c}/${n}: faltam "tema" e "texto"`);
      if (c === "B" && !(bruto.caso && bruto.caso in CASOS_B)) throw new Error(`${c}/${n}: "caso" fora de ${Object.keys(CASOS_B).join(", ")}`);
      if (c === "C" && !(Array.isArray(bruto.notasDoDono) && bruto.notasDoDono.length === 5)) throw new Error(`${c}/${n}: "notasDoDono" precisa de 5 notas`);
      return { conjunto: c, id: bruto.id ?? n.replace(/\.json$/, ""), tema: bruto.tema, texto: bruto.texto, caso: bruto.caso as CasoB | undefined, notasDoDono: bruto.notasDoDono };
    });
}

/** IA simulada do `--seco`: estima 160 em tudo; só serve para conferir leitura, métricas e relatório. */
function simular() {
  definirChamadaIA(async () => ({
    texto: JSON.stringify({
      situacao: "estimada",
      direitosHumanos: "respeitados",
      competencias: [1, 2, 3, 4, 5].map((c) => ({ c, nota: 160, justificativa: "Simulado.", trecho: null, paraSubir: "Simulado." })),
      comentario: "Simulado.",
    }),
    usage: { entrada: 3000, saida: 1500 },
  }));
}

async function corrigir(t: TextoDeAvaliacao, rodada: number): Promise<Execucao> {
  const base = { conjunto: t.conjunto, id: t.id, rodada, caso: t.caso, notasDoDono: t.notasDoDono };
  const inicio = performance.now();
  const local = semEstimativaLocal(t.texto);
  if (local) return { ...base, formatoPrimeira: true, formatoFinal: true, correcao: local, proibido: false, ms: performance.now() - inicio, custoUsd: 0 };
  let correcao: Correcao | null = null;
  let formatoPrimeira = false;
  let proibido = false;
  let micros = 0;
  for (let tentativa = 0; tentativa < TENTATIVAS && !correcao; tentativa++) {
    const ia = await chamarIA({
      sistema: SISTEMA_CORRETOR,
      mensagens: [{ role: "user", content: mensagemDoCorretor(t.tema, t.texto) }],
      foto: null,
      maxTokens: 1800,
      timeoutMs: 45_000,
    }).catch(() => null);
    if (ia?.usage) micros += ia.usage.entrada * PRECO.entrada + ia.usage.saida * PRECO.saida;
    if (ia?.texto && temTextoProibido(ia.texto)) proibido = true;
    correcao = ia?.texto ? lerCorrecao(ia.texto, t.texto) : null;
    if (tentativa === 0) formatoPrimeira = !!correcao;
  }
  return { ...base, formatoPrimeira, formatoFinal: !!correcao, correcao, proibido, ms: performance.now() - inicio, custoUsd: micros / 1_000_000 };
}

async function main() {
  if (seco) simular();
  const textos = (["A", "B", "C"] as const).flatMap(lerConjunto);
  if (!textos.length) {
    console.error(`nenhum texto em ${pasta} (subpastas A/, B/ e C/ com um JSON por texto; ver o cabeçalho deste script)`);
    process.exit(1);
  }
  const execs: Execucao[] = [];
  for (let r = 1; r <= rodadas; r++) {
    for (const t of textos) {
      const e = await corrigir(t, r);
      execs.push(e);
      const c = e.correcao;
      console.log(
        `[${r}/${rodadas}] ${t.conjunto}/${t.id}${t.caso ? ` (${t.caso})` : ""}: ${c ? (c.situacao === "estimada" ? `${c.total} [${c.competencias.map((x) => x.nota).join(", ")}]` : `sem estimativa (${c.motivo})`) : "FALHOU"} · ${(e.ms / 1000).toFixed(1)} s`,
      );
    }
  }
  const cabecalho = [
    `## Avaliação do corretor — rubrica v${VERSAO_RUBRICA}, modelo ${TUTOR_MODELO}${seco ? " (SIMULADA, --seco: não vale para liberação)" : ""}`,
    `${new Date().toISOString().slice(0, 10)} · ${textos.length} textos (A ${textos.filter((t) => t.conjunto === "A").length}, B ${textos.filter((t) => t.conjunto === "B").length}, C ${textos.filter((t) => t.conjunto === "C").length}) · ${rodadas} rodada(s)`,
  ].join("\n");
  console.log(`\n${relatorioEmTexto(avaliarMetas(execs), cabecalho)}`);
}

await main();
