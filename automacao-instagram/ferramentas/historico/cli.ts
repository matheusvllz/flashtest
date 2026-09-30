/**
 * CLI do historico editorial.
 *
 *   bun run hist listar [estado]            lista registros (mais novos primeiro)
 *   bun run hist ver <id>                   mostra um registro
 *   bun run hist estado <id> <novo-estado>  muda o estado
 *   bun run hist checar "<gancho>" "<argumento>" "<tema>"   procura repeticao
 *   bun run hist resumo                     contagem por estado e por pilar
 *   bun run hist ganchos                    todos os ganchos ja usados (para nao repetir)
 *   bun run hist ideias <arquivo.json>      registra ideias (estado "ideia"), recusando repeticao
 *   bun run hist registrar <id> [estado]    le conteudos/<id>/ e grava no banco + brief.md e meta.json
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { P, pastaConteudo } from "../lib/paths.ts";
import {
  ESTADOS,
  checarRepeticao,
  criar,
  ler,
  mudarEstado,
  novoId,
  obter,
  salvar,
  type Estado,
  type Registro,
} from "./db.ts";

/** Le conteudos/<id>/ e escreve (ou atualiza) o registro no banco, sem perder versao nem estado. */
function registrar(id: string, estado: Estado = "em_revisao") {
  const pasta = pastaConteudo(id);
  const c = JSON.parse(readFileSync(pasta.conteudo, "utf8"));
  const ordemArq = join(pasta.export, "ordem.json");
  const ordem = existsSync(ordemArq) ? JSON.parse(readFileSync(ordemArq, "utf8")) : null;
  const val = existsSync(pasta.validacao)
    ? JSON.parse(readFileSync(pasta.validacao, "utf8"))
    : null;
  const video = c.video ? join(pasta.base, c.video.arquivo) : null;
  const exportados: string[] = video
    ? [video]
    : (ordem?.paginas?.map((x: { jpg?: string }) => x.jpg).filter(Boolean) ?? []);
  const snap = JSON.parse(readFileSync(P.snapshot, "utf8"));
  const refs = ordem?.referenciasMarca ?? {
    snapshotEm: snap.geradoEm,
    stylesCss:
      snap.fontesDocumentais.find((f: { arquivo: string }) => f.arquivo.endsWith("styles.css"))
        ?.hash ?? null,
    logoOficial: snap.logos.oficialColorida.hash,
  };
  const campos = {
    id,
    estado,
    formato: c.formato,
    pilar: c.pilar,
    tema: c.tema,
    gancho: c.gancho,
    argumento: c.argumento,
    publico: c.publico,
    objetivo: c.objetivo,
    conceitoVisual: c.conceitoVisual,
    cta: c.cta,
    legenda: c.legenda,
    assets: [
      ...(ordem?.paginas?.map((x: { png: string }) => x.png) ?? []),
      ...(c.paginas ?? [])
        .filter((p: { modelo: string }) => p.modelo === "tela")
        .map((p: { tela: string }) => `assets-src/marketing/shots/${p.tela}.png`),
      ...(c.video?.audio?.faixas ?? []).map((f: string) => `public/sfx/v2/${f.split(" ")[0]}`),
    ],
    referenciasMarca: refs,
    revisita: c.revisita,
    arquivos: { pasta: pasta.base, export: exportados, preview: join(pasta.preview, "index.html") },
    notas: val ? `validacao: ${val.erros} erro(s), ${val.alertas} alerta(s)` : undefined,
  } as Omit<Registro, "criadoEm" | "atualizadoEm" | "versao" | "historicoEstados">;
  const hashConteudo = createHash("sha256")
    .update(readFileSync(pasta.conteudo))
    .digest("hex")
    .slice(0, 16);
  const antigo = obter(id) as (Registro & { hashConteudo?: string }) | null;
  // Revisao: mesmo ID; a versao so sobe quando o conteudo.json mudou. Estado publicado nunca regride.
  const mudou = !!antigo?.hashConteudo && antigo.hashConteudo !== hashConteudo;
  const reg = !antigo
    ? criar({ ...campos, hashConteudo } as typeof campos)
    : salvar({
        ...antigo,
        ...campos,
        hashConteudo,
        estado: antigo.estado === "publicado" ? antigo.estado : estado,
        versao: antigo.versao + (mudou ? 1 : 0),
      } as Registro);
  escreverBriefEMeta(id, c, reg, val);
  return reg;
}

/** brief.md (para humanos) e meta.json (para maquina) dentro da pasta do conteudo. */
function escreverBriefEMeta(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- conteudo.json varia por formato (feed, video)
  c: Record<string, any>,
  reg: Registro,
  val: { erros: number; alertas: number } | null,
) {
  const pasta = pastaConteudo(id);
  const paginas = (c.paginas ?? [])
    .map((p: Record<string, unknown>, i: number) => {
      const textos = Object.entries(p)
        .filter(
          ([k, v]) =>
            k !== "modelo" &&
            typeof v === "string" &&
            !["expressao", "escala", "rabisco", "tela"].includes(k),
        )
        .map(([k, v]) => `   - ${k}: ${String(v).replace(/\n/g, " / ")}`);
      const listas = Object.entries(p)
        .filter(([, v]) => Array.isArray(v) || (v && typeof v === "object" && !Array.isArray(v)))
        .map(([k, v]) => `   - ${k}: ${JSON.stringify(v)}`);
      return `${i + 1}. **${p.modelo}**${p.expressao ? ` · Foca ${p.expressao}` : ""}${p.tela ? ` · tela real \`${p.tela}\`` : ""}\n${[...textos, ...listas].join("\n")}`;
    })
    .join("\n");
  const brief = `# ${c.gancho}

| Campo | Valor |
|---|---|
| ID | \`${id}\` (versão ${reg.versao}) |
| Estado | ${reg.estado} |
| Formato | ${c.formato} |
| Pilar | ${c.pilar} |
| Tema | ${c.tema} |
| Público | ${c.publico ?? "—"} |
| Objetivo | ${c.objetivo ?? "—"} |
| CTA | ${c.cta ?? "nenhum"} |

**Argumento.** ${c.argumento}

**Conceito visual.** ${c.conceitoVisual ?? "—"}
${c.revisita ? `\n**Revisita** \`${c.revisita.de}\`: ${c.revisita.diferenca}\n` : ""}
## Copy por página
${paginas || (c.video?.textosNaTela ? c.video.textosNaTela.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n") : "—")}

## Legenda
${c.legenda}

## Fatos externos
${(c.fontesFato ?? []).length ? c.fontesFato.map((f: { afirmacao: string; fonte: string }) => `- ${f.afirmacao} — ${f.fonte}`).join("\n") : "Nenhum. O conteúdo só afirma o que o produto demonstra."}

## Validação
${val ? `${val.erros} erro(s), ${val.alertas} alerta(s) — \`validacao.json\`` : "não validado"}

_Gerado por \`bun run hist registrar\` a partir de \`conteudo.json\`. Para mudar, edite o \`conteudo.json\`._
`;
  writeFileSync(pasta.brief, brief);
  writeFileSync(
    pasta.meta,
    JSON.stringify(
      {
        id,
        versao: reg.versao,
        estado: reg.estado,
        formato: c.formato,
        criadoEm: reg.criadoEm,
        atualizadoEm: reg.atualizadoEm,
        referenciasMarca: reg.referenciasMarca,
        arquivos: reg.arquivos,
        assets: reg.assets,
      },
      null,
      2,
    ) + "\n",
  );
}

const [cmd, ...args] = process.argv.slice(2);

function listar(filtro?: string) {
  const rs = ler()
    .registros.filter((r) => !filtro || r.estado === filtro)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  if (!rs.length) return console.log("(nenhum registro)");
  for (const r of rs)
    console.log(
      `${r.estado.padEnd(12)} ${r.formato.padEnd(14)} v${r.versao}  ${r.id}\n             ${r.gancho}`,
    );
  console.log(`\n${rs.length} registro(s).`);
}

switch (cmd) {
  case "listar":
    listar(args[0]);
    break;
  case "ver": {
    const r = obter(args[0]);
    console.log(r ? JSON.stringify(r, null, 2) : `nao achei ${args[0]}`);
    break;
  }
  case "estado": {
    if (!ESTADOS.includes(args[1] as Estado))
      throw new Error(`estado invalido. use: ${ESTADOS.join(" | ")}`);
    const r = mudarEstado(args[0], args[1] as Estado);
    console.log(`${r.id}: ${r.estado}`);
    break;
  }
  case "checar": {
    const [gancho = "", argumento = "", tema = ""] = args;
    const achados = checarRepeticao({ gancho, argumento, tema });
    if (!achados.length)
      console.log("Nada parecido no historico. Proposta inedita pelos critérios atuais.");
    else
      for (const a of achados)
        console.log(
          `${a.score.toFixed(3)}  ${a.motivo.padEnd(20)} ${a.id}  [${a.estado}]\n       ${a.gancho}`,
        );
    break;
  }
  case "ideias": {
    // Recebe um JSON com uma lista de ideias e grava cada uma como estado "ideia", depois de checar
    // repeticao contra TODO o historico. Repeticao provavel (>= 0,55) e recusada, a menos que a
    // ideia declare "revisita": { "de": "<id>", "diferenca": "..." }.
    const arq = args[0];
    type Ideia = {
      formato: Registro["formato"];
      pilar: string;
      tema: string;
      gancho: string;
      argumento: string;
      publico?: string;
      objetivo?: string;
      conceitoVisual?: string;
      cta?: string;
      revisita?: { de: string; diferenca: string };
      notas?: string;
    };
    const lista = JSON.parse(readFileSync(arq, "utf8")) as Ideia[];
    const criadas: string[] = [];
    for (const ideia of lista) {
      const achados = checarRepeticao(ideia);
      const forte = achados.find((a) => a.score >= 0.55);
      if (forte && !ideia.revisita) {
        console.log(
          `RECUSADA  "${ideia.gancho}"\n          repete ${forte.id} (${forte.score}): "${forte.gancho}". Declare "revisita" com a diferenca, ou mude o argumento.`,
        );
        continue;
      }
      const id = novoId(ideia.formato, ideia.tema);
      criar({ ...ideia, id, estado: "ideia" });
      criadas.push(id);
      const aviso = achados.length
        ? `  (mesmo terreno que ${achados[0].id}, ${achados[0].score})`
        : "";
      console.log(`ideia     ${id}${aviso}\n          ${ideia.gancho}`);
    }
    console.log(`\n${criadas.length}/${lista.length} ideia(s) registrada(s).`);
    break;
  }
  case "registrar": {
    const r = registrar(args[0], (args[1] as Estado) ?? "em_revisao");
    console.log(`${r.id}: v${r.versao}, estado ${r.estado}`);
    break;
  }
  case "resumo": {
    const rs = ler().registros;
    const por = (f: (r: (typeof rs)[number]) => string) =>
      Object.entries(
        rs.reduce<Record<string, number>>(
          (acc, r) => ((acc[f(r)] = (acc[f(r)] ?? 0) + 1), acc),
          {},
        ),
      )
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n");
    console.log(
      `${rs.length} registro(s)\n\nPor estado:\n${por((r) => r.estado)}\n\nPor pilar:\n${por((r) => r.pilar)}\n\nPor formato:\n${por((r) => r.formato)}`,
    );
    break;
  }
  case "ganchos":
    for (const r of ler().registros) console.log(`[${r.estado}] ${r.gancho}  (${r.id})`);
    break;
  default:
    console.log(
      `comandos: listar [estado] | ver <id> | ideias <arquivo.json> | registrar <id> [estado] | estado <id> <${ESTADOS.join("|")}> | checar "<gancho>" "<argumento>" "<tema>" | resumo | ganchos`,
    );
}
