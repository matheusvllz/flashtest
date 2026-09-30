/**
 * Verificador de links e caminhos da documentação (docs/specs/46-producao, T-01.8).
 *
 *   bun run docs:check
 *
 * Confere, em todos os .md do repositório (menos dependências e artefatos):
 * 1. links Markdown relativos apontam para um arquivo ou pasta que existe;
 * 2. âncoras `#secao` de links para .md existem no destino (fora de docs/historico);
 * 3. caminhos citados entre crases que começam numa pasta do repo
 *    (`docs/…`, `src/…`, `scripts/…`, `tests/…`, `public/…`, `.claude/…`, `.agents/…`)
 *    existem — só nos documentos vivos (fora de docs/historico, onde o texto é registro
 *    do passado e pode citar caminhos que já não existem);
 * 4. os `contextFiles` do catálogo de skills existem.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  RAIZ,
  ancorasDe,
  dentroDeBloco,
  ehRelativo,
  existe,
  extrairLinks,
  listarArquivos,
  mapaDeBlocosDeCodigo,
  resolverRelativo,
  separarAncora,
} from "./lib";

export interface Problema {
  arquivo: string;
  linha: number;
  tipo: "link" | "ancora" | "caminho" | "catalogo";
  detalhe: string;
}

const PREFIXOS_DE_CAMINHO = /^(docs|src|scripts|tests|public|\.claude|\.agents|\.codex|content-pipeline|automacao-instagram)\//;
const REGISTRY = ["docs/ai/skills-registry.json", ".claude/skills-registry.json"];

function linhaDe(texto: string, i: number): number {
  return texto.slice(0, i).split("\n").length;
}

function historico(arquivo: string): boolean {
  return arquivo.startsWith("docs/historico/");
}

/** Caminhos citados justamente porque não devem existir (convenções proibidas, arquivos pessoais). */
const INEXISTENTES_DE_PROPOSITO = new Set([
  "docs/superpowers/",
  ".claude/settings.local.json",
  ".agents/context/",
]);

/** A linha avisa que o arquivo ainda não existe ou deixou de existir. */
const MENCAO_DE_FUTURO_OU_AUSENCIA = /\(a criar\)|\bNOVO\b|planejad|não existe|inexistente|ausente|removid|46 T-\d/i;

/**
 * Onde a checagem de caminhos entre crases vale. Fica de fora: histórico (registro do
 * passado), specs e modelos (citam arquivos que a tarefa vai criar), skills (exemplos
 * genéricos de outros projetos) e arquivos com o marcador `<!-- docs:check ignorar-caminhos -->`.
 */
function checarCaminhos(arquivo: string, texto: string): boolean {
  if (historico(arquivo)) return false;
  if (arquivo.startsWith("docs/specs/") || arquivo.startsWith("docs/ai/templates/")) return false;
  if (arquivo.startsWith(".agents/skills/") || arquivo.startsWith(".claude/skills/")) return false;
  if (texto.includes("<!-- docs:check ignorar-caminhos -->")) return false;
  return true;
}

export function verificar(): Problema[] {
  const problemas: Problema[] = [];
  const cacheAncoras = new Map<string, Set<string>>();
  const ancoras = (caminho: string) => {
    if (!cacheAncoras.has(caminho)) cacheAncoras.set(caminho, ancorasDe(readFileSync(join(RAIZ, caminho), "utf8")));
    return cacheAncoras.get(caminho)!;
  };

  for (const arquivo of listarArquivos([".md"])) {
    // Skills têm validador próprio (scripts/validate-skills.mjs) e as de terceiros não são editadas aqui.
    if (arquivo.startsWith(".agents/skills/") || arquivo.startsWith(".claude/skills/")) continue;
    // Ferramentas independentes com node_modules próprios já foram excluídas por listarArquivos.
    const texto = readFileSync(join(RAIZ, arquivo), "utf8");

    for (const l of extrairLinks(texto)) {
      if (!ehRelativo(l.alvo)) {
        if (l.alvo.startsWith("#") && !historico(arquivo) && l.alvo.length > 1) {
          if (!ancoras(arquivo).has(decodeURIComponent(l.alvo.slice(1)))) {
            problemas.push({ arquivo, linha: linhaDe(texto, l.inicio), tipo: "ancora", detalhe: l.alvo });
          }
        }
        continue;
      }
      const { caminho, ancora } = separarAncora(l.alvo);
      if (!caminho) continue;
      const alvo = resolverRelativo(arquivo, caminho);
      if (!existe(alvo)) {
        problemas.push({ arquivo, linha: linhaDe(texto, l.inicio), tipo: "link", detalhe: l.alvo });
        continue;
      }
      if (ancora.length > 1 && alvo.endsWith(".md") && !historico(arquivo)) {
        const nome = decodeURIComponent(ancora.slice(1));
        if (!ancoras(alvo).has(nome)) {
          problemas.push({ arquivo, linha: linhaDe(texto, l.inicio), tipo: "ancora", detalhe: l.alvo });
        }
      }
    }

    if (!checarCaminhos(arquivo, texto)) continue;
    const blocos = mapaDeBlocosDeCodigo(texto);
    const linhas = texto.split("\n");
    for (const m of texto.matchAll(/`([^`\n]+)`/g)) {
      if (dentroDeBloco(blocos, m.index!)) continue;
      let c = m[1].trim();
      if (!PREFIXOS_DE_CAMINHO.test(c)) continue;
      // Tira ":linha", "#L10", "§x", sufixos entre parênteses e espaços.
      c = c.replace(/(:\d+(-\d+)?|#L\d+.*)$/, "").split(/\s/)[0];
      if (/[*{}<>$…]|\.\.|\bNN\b|NNNN|AAAA/.test(c)) continue; // padrão/glob/placeholder/intervalo
      if (!/\.[a-z0-9]+$/i.test(c) && !c.endsWith("/")) continue; // só arquivo com extensão ou pasta com "/"
      if (INEXISTENTES_DE_PROPOSITO.has(c)) continue;
      const n = linhaDe(texto, m.index!);
      if (MENCAO_DE_FUTURO_OU_AUSENCIA.test(linhas[n - 1] ?? "")) continue;
      if (!existe(c.replace(/\/$/, ""))) {
        problemas.push({ arquivo, linha: n, tipo: "caminho", detalhe: c });
      }
    }
  }

  for (const reg of REGISTRY) {
    if (!existe(reg)) continue;
    const json = JSON.parse(readFileSync(join(RAIZ, reg), "utf8")) as { contextFiles?: Record<string, string> };
    for (const p of Object.values(json.contextFiles ?? {})) {
      if (p && !existe(p)) problemas.push({ arquivo: reg, linha: 0, tipo: "catalogo", detalhe: p });
    }
  }
  return problemas;
}

if (import.meta.main) {
  const problemas = verificar();
  if (problemas.length === 0) {
    console.log("docs:check — nenhum link ou caminho quebrado.");
    process.exit(0);
  }
  for (const p of problemas) console.log(`${p.arquivo}:${p.linha}  [${p.tipo}]  ${p.detalhe}`);
  console.log(`\ndocs:check — ${problemas.length} problema(s).`);
  process.exit(1);
}
