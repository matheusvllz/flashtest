/**
 * Gera a tabela "skills por agente" do docs/ai/SKILLS.md a partir do catálogo
 * docs/ai/skills-registry.json (docs/specs/46-producao/spec.md T-02.3), para que o
 * catálogo humano e o de máquina não divirjam.
 *
 *   bun scripts/agents/tabela-skills.ts           # reescreve o trecho entre os marcadores
 *   bun scripts/agents/tabela-skills.ts --checar  # sai com 1 se o trecho estiver desatualizado
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const RAIZ = resolve(import.meta.dir, "..", "..");
const REGISTRY = join(RAIZ, "docs", "ai", "skills-registry.json");
const DOC = join(RAIZ, "docs", "ai", "SKILLS.md");
const INICIO = "<!-- tabela-skills:inicio (gerado por scripts/agents/tabela-skills.ts; não editar à mão) -->";
const FIM = "<!-- tabela-skills:fim -->";

interface Entrada {
  id: string;
  type: string;
  pluginId?: string;
  skills?: string[];
  agents?: string[];
  canonicalDir?: string;
  enabledByDefault?: boolean;
  availability?: string;
  codexAlternative?: string;
}

export function gerarTabela(): string {
  const reg = JSON.parse(readFileSync(REGISTRY, "utf8")) as {
    skills: Entrada[];
    localAgents?: Array<{ name?: string; path?: string; codexPath?: string; agents?: string[] }>;
  };
  const linhas = [
    "| Skill / pacote | Tipo | Claude Code | Codex | Onde | Sem ela |",
    "|---|---|---|---|---|---|",
  ];
  const sim = (a: string[] | undefined, x: string) => (a ?? ["claude"]).includes(x);
  for (const s of reg.skills) {
    const nome = s.type === "plugin" ? `${s.pluginId} (${(s.skills ?? []).length} skills)` : (s.skills?.length ? s.skills : [s.id]).join(", ");
    const claude = !sim(s.agents, "claude")
      ? "—"
      : s.type === "plugin"
        ? s.enabledByDefault === false
          ? "desligado por padrão"
          : "sim (depende do host)"
        : "sim";
    const codex = sim(s.agents, "codex") ? "sim" : "—";
    const onde =
      s.type === "plugin" ? "`.claude/settings.json` + cache do Claude" : s.type === "mcp-server" ? "`.mcp.json`" : `\`${s.canonicalDir ?? ".claude/skills"}\``;
    const alt = s.codexAlternative ?? (s.type === "plugin" ? "alternativa da matriz (SKILL-ROUTING §2)" : "—");
    linhas.push(`| ${nome} | ${s.type} | ${claude} | ${codex} | ${onde} | ${alt} |`);
  }
  for (const a of reg.localAgents ?? []) {
    const ag = a.agents ?? ["claude"];
    linhas.push(
      `| agente \`${a.name ?? a.path}\` | agente | ${ag.includes("claude") ? `sim (\`${a.path}\`)` : "—"} | ${ag.includes("codex") ? `sim (\`${a.codexPath}\`)` : "—"} | — | — |`,
    );
  }
  return linhas.join("\n");
}

function montar(doc: string): string {
  const i = doc.indexOf(INICIO);
  const f = doc.indexOf(FIM);
  if (i < 0 || f < 0) throw new Error("marcadores da tabela não encontrados em docs/ai/SKILLS.md");
  return `${doc.slice(0, i + INICIO.length)}\n${gerarTabela()}\n${doc.slice(f)}`;
}

if (import.meta.main) {
  const doc = readFileSync(DOC, "utf8");
  const novo = montar(doc);
  if (process.argv.includes("--checar")) {
    if (novo.replace(/\r\n/g, "\n") !== doc.replace(/\r\n/g, "\n")) {
      console.log("docs/ai/SKILLS.md: tabela de skills desatualizada. Rode: bun scripts/agents/tabela-skills.ts");
      process.exit(1);
    }
    console.log("docs/ai/SKILLS.md: tabela de skills em dia.");
  } else {
    writeFileSync(DOC, novo);
    console.log("tabela de skills atualizada.");
  }
}
