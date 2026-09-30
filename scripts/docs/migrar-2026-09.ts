/**
 * Migração única da documentação para a nova organização do SDD
 * (docs/specs/46-producao/spec.md §C.5, decisão 0004). Guardado para rastreabilidade.
 *
 *   bun scripts/docs/migrar-2026-09.ts          # simula e mostra o que mudaria
 *   bun scripts/docs/migrar-2026-09.ts --aplicar
 *
 * 1. Lê todos os arquivos de texto do repositório no layout ANTIGO.
 * 2. Recalcula cada link Markdown relativo a partir da posição nova do arquivo e da
 *    posição nova do alvo; links para arquivos removidos (D-02) viram texto simples.
 * 3. Troca menções literais de caminho (`docs/08-produto-e-estrategia.md`, também com
 *    barra invertida, como nas chaves JSON dos hashes de áudio) pelo caminho novo.
 * 4. Faz `git mv` de cada arquivo e grava o conteúdo reescrito no lugar novo.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  RAIZ,
  ehRelativo,
  extrairLinks,
  listarArquivos,
  relativoDe,
  resolverRelativo,
  separarAncora,
} from "./lib";

const APLICAR = process.argv.includes("--aplicar");

const H = "docs/historico";
const F = `${H}/fundacao`;
const I = `${H}/iniciativas`;

/** Arquivo → destino. */
const ARQUIVOS: Record<string, string> = {
  "docs/00-README.md": `${H}/00-README-2026-09.md`,
  "docs/00-constituicao.md": `${F}/00-constituicao.md`,
  "docs/01-especificacao-problema.md": `${F}/01-especificacao-problema.md`,
  "docs/02-plano-solucao.md": `${F}/02-plano-solucao.md`,
  "docs/03-tarefas-semana.md": `${F}/03-tarefas-semana.md`,
  "docs/04-especificacao-pitch.md": `${F}/04-especificacao-pitch.md`,
  "docs/07-insumos-aulas.md": `${F}/07-insumos-aulas.md`,
  "docs/08-produto-e-estrategia.md": "docs/produto/estrategia.md",
  "docs/09-branding.md": `${F}/09-branding.md`,
  "docs/10-prompt-prototipo-app.md": `${F}/10-prompt-prototipo-app.md`,
  "docs/11-estado-prototipo-handoff-claude-code.md": `${F}/11-estado-prototipo-handoff-claude-code.md`,
  "docs/12-plano-development.md": `${F}/12-plano-development.md`,
  "docs/13-prompt-landing-instagram.md": `${F}/13-prompt-landing-instagram.md`,
  "docs/14-persona-joao.md": "docs/produto/persona-joao.md",
  "docs/15-mascote-e-voz.md": `${F}/15-mascote-e-voz.md`,
  "docs/16-gamificacao-e-dopamina.md": `${F}/16-gamificacao-e-dopamina.md`,
  "docs/17-plano-migracao-visual-foca.md": `${I}/17-18-19-rabisco/17-plano-migracao-visual-foca.md`,
  "docs/18-plano-reestilizacao-rabisco.md": "docs/design/sistema-rabisco.md",
  "docs/19-registro-execucao-rabisco.md": `${I}/17-18-19-rabisco/19-registro-execucao-rabisco.md`,
  "docs/20-plano-evolucao-aprendizagem.md": `${I}/20-22-aprendizagem/20-plano-evolucao-aprendizagem.md`,
  "docs/21-brand-voice-e-inventario-copy.md": "docs/copy/inventario.md",
  "docs/22-validacao-piloto-aprendizagem.md": `${I}/20-22-aprendizagem/22-validacao-piloto-aprendizagem.md`,
  "docs/23-identidade-sonora-linguagem-musical.md": `${I}/23-24-identidade-sonora/23-identidade-sonora-linguagem-musical.md`,
  "docs/24-integracao-identidade-sonora.md": "docs/decisoes/0003-identidade-sonora-v2.md",
  "docs/25-plano-jornada-aprendizado-v2.md": `${I}/25-26-jornada-v2/25-plano-jornada-aprendizado-v2.md`,
  "docs/26-registro-execucao-jornada-v2.md": `${I}/25-26-jornada-v2/26-registro-execucao-jornada-v2.md`,
  "docs/27-plano-home-trilha-visual.md": `${I}/27-28-29-home-trilha/27-plano-home-trilha-visual.md`,
  "docs/28-plano-execucao-home-trilha.md": `${I}/27-28-29-home-trilha/28-plano-execucao-home-trilha.md`,
  "docs/29-registro-execucao-home-trilha.md": `${I}/27-28-29-home-trilha/29-registro-execucao-home-trilha.md`,
  "docs/30-plano-aprendizagem-adaptativa.md": `${I}/30-31-32-aprendizagem-adaptativa/30-plano-aprendizagem-adaptativa.md`,
  "docs/31-plano-execucao-aprendizagem-adaptativa.md": `${I}/30-31-32-aprendizagem-adaptativa/31-plano-execucao-aprendizagem-adaptativa.md`,
  "docs/32-registro-execucao-aprendizagem-adaptativa.md": `${I}/30-31-32-aprendizagem-adaptativa/32-registro-execucao-aprendizagem-adaptativa.md`,
  "docs/33-taxonomia-habilidades.md": "docs/arquitetura/taxonomia-habilidades.md",
  "docs/34-decisao-questoes-oficiais.md": "docs/decisoes/0002-questoes-oficiais-enem.md",
  "docs/35-prompt-claude-code-atualizacao-qualidade.md": `${I}/35-36-37-qualidade/35-prompt-claude-code-atualizacao-qualidade.md`,
  "docs/36-plano-qualidade-pedagogica-ux-confiabilidade.md": `${I}/35-36-37-qualidade/36-plano-qualidade-pedagogica-ux-confiabilidade.md`,
  "docs/37-registro-execucao-qualidade.md": `${I}/35-36-37-qualidade/37-registro-execucao-qualidade.md`,
  "docs/38-plano-sistema-copy-e-skills.md": `${I}/38-39-copy/38-plano-sistema-copy-e-skills.md`,
  "docs/39-registro-execucao-copy.md": `${I}/38-39-copy/39-registro-execucao-copy.md`,
  "docs/40-plano-landing-page-marketing.md": `${I}/40-41-42-43-landing/40-plano-landing-page-marketing.md`,
  "docs/41-registro-execucao-landing-page.md": `${I}/40-41-42-43-landing/41-registro-execucao-landing-page.md`,
  "docs/42-plano-landing-v2-direcao-criativa.md": `${I}/40-41-42-43-landing/42-plano-landing-v2-direcao-criativa.md`,
  "docs/43-registro-execucao-landing-v2.md": `${I}/40-41-42-43-landing/43-registro-execucao-landing-v2.md`,
  "docs/44-plano-integracao-produto-web.md": `${I}/44-45-integracao-web/44-plano-integracao-produto-web.md`,
  "docs/45-registro-execucao-integracao.md": `${I}/44-45-integracao-web/45-registro-execucao-integracao.md`,
  "docs/46-plano-producao-sdd-backend-seguranca.md": "docs/specs/46-producao/spec.md",
  "docs/47-registro-execucao-producao.md": "docs/specs/46-producao/registro.md",
  "docs/ai/SPEC-TEMPLATE.md": "docs/ai/templates/spec.md",
};

/** Pasta → destino (todos os arquivos dentro dela vão junto). */
const PASTAS: Record<string, string> = {
  "docs/brand": "docs/design/brand",
  "docs/audio-proposal-v2": "docs/design/audio/v2",
  "docs/audio-candidates": "docs/design/audio/candidatos",
};

/**
 * Quem apontava para o índice antigo passa a apontar para o novo mapa
 * (o índice antigo em si vai para o histórico, preservado).
 */
const REDIRECIONAR_LINK: Record<string, string> = {
  "docs/00-README.md": "docs/README.md",
};

/** Removidos por decisão do proprietário (D-02): links viram texto simples. */
const REMOVIDOS = ["docs/_arquivo-abroad", "docs/brand/Flash Test - design System.html", "docs/brand/Flash Test - LP Link da Bio v3.html"];

function destinoDe(caminho: string): string | null {
  if (ARQUIVOS[caminho]) return ARQUIVOS[caminho];
  for (const [de, para] of Object.entries(PASTAS)) {
    if (caminho === de) return para;
    if (caminho.startsWith(`${de}/`)) return para + caminho.slice(de.length);
  }
  return null;
}

function alvoDeLink(caminho: string): string {
  return REDIRECIONAR_LINK[caminho] ?? destinoDe(caminho) ?? caminho;
}

function removido(caminho: string): boolean {
  return REMOVIDOS.some((r) => caminho === r || caminho.startsWith(`${r}/`));
}

function rastreados(): Set<string> {
  const out = execFileSync("git", ["ls-files", "-z"], { cwd: RAIZ, encoding: "utf8" });
  return new Set(out.split("\0").filter(Boolean));
}

// --- 1) quais arquivos se movem -------------------------------------------------------
const git = rastreados();
const movimentos = new Map<string, string>();
for (const [de, para] of Object.entries(ARQUIVOS)) if (existsSync(join(RAIZ, de))) movimentos.set(de, para);
for (const f of git) {
  const d = destinoDe(f);
  if (d && !movimentos.has(f)) movimentos.set(f, d);
}

// --- 2) reescrever conteúdo ------------------------------------------------------------
/** Menções literais (raiz do repo) em qualquer texto, com as variantes de separador. */
const literais: Array<[string, string]> = [];
const addLiteral = (de: string, para: string) => {
  for (const sep of ["/", "\\", "\\\\"]) literais.push([de.split("/").join(sep), para.split("/").join(sep)]);
};
for (const [de, para] of Object.entries(ARQUIVOS)) addLiteral(de, REDIRECIONAR_LINK[de] ?? para);
for (const [de, para] of Object.entries(PASTAS)) addLiteral(de, para);
literais.sort((a, b) => b[0].length - a[0].length);
const reLiteral = new RegExp(literais.map(([de]) => de.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
const mapaLiteral = new Map(literais);

const novoConteudo = new Map<string, string>(); // chave = caminho NOVO
let linksReescritos = 0;
let linksRemovidos = 0;
let literaisTrocados = 0;

for (const arquivo of listarArquivos()) {
  const destino = movimentos.get(arquivo) ?? arquivo;
  // A automação do Instagram é independente: só a documentação dela é atualizada.
  if (arquivo.startsWith("automacao-instagram/") && !arquivo.endsWith(".md")) continue;
  // Os scripts de migração citam os caminhos antigos de propósito.
  if (arquivo.startsWith("scripts/docs/")) continue;
  const texto = readFileSync(join(RAIZ, arquivo), "utf8");
  let saida = texto;

  if (arquivo.endsWith(".md")) {
    const links = extrairLinks(texto).filter((l) => ehRelativo(l.alvo));
    // de trás pra frente, para não invalidar os índices
    for (const l of links.reverse()) {
      const { caminho, ancora } = separarAncora(l.alvo);
      if (!caminho) continue;
      const antigo = resolverRelativo(arquivo, caminho);
      if (removido(antigo)) {
        // [texto](alvo) → texto
        const abre = saida.lastIndexOf("[", l.inicio - 2);
        const textoLink = saida.slice(abre + 1, l.inicio - 2);
        const fecha = saida.indexOf(")", l.fim);
        saida = saida.slice(0, abre) + textoLink + saida.slice(fecha + 1);
        linksRemovidos++;
        continue;
      }
      const novoAlvo = alvoDeLink(antigo);
      let novoRel = relativoDe(destino, novoAlvo);
      if (caminho.endsWith("/") && !novoRel.endsWith("/")) novoRel += "/";
      const escrito = novoRel.includes(" ") ? `<${novoRel}${ancora}>` : `${novoRel}${ancora}`;
      const original = l.angular ? `<${l.alvo}>` : l.alvo;
      if (escrito !== original) {
        saida = saida.slice(0, l.inicio) + escrito + saida.slice(l.fim);
        linksReescritos++;
      }
    }
  }

  saida = saida.replace(reLiteral, (m) => {
    literaisTrocados++;
    return mapaLiteral.get(m) ?? m;
  });

  if (saida !== texto || destino !== arquivo) novoConteudo.set(destino, saida);
}

console.log(`movimentos: ${movimentos.size}`);
console.log(`arquivos com conteúdo alterado: ${[...novoConteudo.keys()].length}`);
console.log(`links recalculados: ${linksReescritos} · links para removidos: ${linksRemovidos} · menções literais: ${literaisTrocados}`);

if (!APLICAR) {
  for (const [de, para] of movimentos) console.log(`  ${de} → ${para}`);
  console.log("\n(simulação — rode com --aplicar)");
  process.exit(0);
}

// --- 3) mover e gravar -----------------------------------------------------------------
for (const [de, para] of movimentos) {
  mkdirSync(join(RAIZ, dirname(para)), { recursive: true });
  if (git.has(de)) execFileSync("git", ["mv", de, para], { cwd: RAIZ });
  else {
    execFileSync("git", ["add", de], { cwd: RAIZ });
    execFileSync("git", ["mv", de, para], { cwd: RAIZ });
  }
}
for (const [caminho, conteudo] of novoConteudo) writeFileSync(join(RAIZ, caminho), conteudo);
console.log("aplicado.");
