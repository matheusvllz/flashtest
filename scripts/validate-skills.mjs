#!/usr/bin/env node
// Valida a instalação de skills/plugins contra .claude/skills-registry.json.
// Uso: node scripts/validate-skills.mjs   (sai com código 1 se houver FAIL)
// Ver docs/ai/SKILLS.md. Não depende de nada além do Node.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const samePath = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
const home = os.homedir();
const expand = (p) => (p.startsWith("~") ? path.join(home, p.slice(1)) : path.resolve(root, p));
const exists = (p) => fs.existsSync(p);
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

let fails = 0;
let warns = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => (fails++, console.log(`  FAIL  ${m}`));
const warn = (m) => (warns++, console.log(`  warn  ${m}`));
const section = (t) => console.log(`\n## ${t}`);

function frontmatter(file) {
  const text = fs.readFileSync(file, "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { error: "sem frontmatter YAML" };
  const name = (m[1].match(/^name:\s*["']?([^"'\r\n]+?)["']?\s*$/m) || [])[1];
  const hasDesc = /^description:\s*\S/m.test(m[1]);
  if (!name) return { error: "frontmatter sem name" };
  if (!hasDesc) return { error: "frontmatter sem description", name };
  return { name, text };
}

// Links relativos de markdown dentro de um SKILL.md precisam existir.
function brokenLinks(file, text) {
  const dir = path.dirname(file);
  const broken = [];
  for (const [, target] of text.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
    if (/^(https?:|mailto:|\/|\$|\{)/.test(target) || target.includes("<")) continue;
    if (!exists(path.resolve(dir, decodeURI(target)))) broken.push(target);
  }
  return broken;
}

// Skills que um plugin realmente expõe: <cache>/<skillsDir>/<nome>/SKILL.md (ou SKILL.md na raiz).
function pluginSkills(cache, skillsDir) {
  const base = path.join(cache, skillsDir || "skills");
  const found = new Map();
  if (exists(path.join(base, "SKILL.md")) && (skillsDir === "." || skillsDir === "")) {
    const fm = frontmatter(path.join(base, "SKILL.md"));
    found.set(fm.name, { file: path.join(base, "SKILL.md"), fm });
  }
  if (exists(base))
    for (const d of fs.readdirSync(base, { withFileTypes: true })) {
      const f = path.join(base, d.name, "SKILL.md");
      if (d.isDirectory() && exists(f)) {
        const fm = frontmatter(f);
        found.set(fm.name || d.name, { file: f, fm, folder: d.name });
      }
    }
  return found;
}

const regPath = path.join(root, ".claude/skills-registry.json");
section("Registry");
let reg;
try {
  reg = readJson(regPath);
  ok(`${path.relative(root, regPath)} é JSON válido (${reg.skills.length} entradas)`);
} catch (e) {
  fail(`registry ilegível: ${e.message}`);
  process.exit(1);
}
for (const [k, p] of Object.entries(reg.contextFiles))
  exists(expand(p)) ? ok(`contexto ${k}: ${p}`) : fail(`contexto ${k} ausente: ${p}`);

section("Settings do projeto (.claude/settings.json)");
const settings = readJson(path.join(root, ".claude/settings.json"));
const markets = settings.extraKnownMarketplaces || {};
const enabled = settings.enabledPlugins || {};
const installedFile = path.join(home, ".claude/plugins/installed_plugins.json");
const installed = exists(installedFile) ? readJson(installedFile).plugins : null;
if (!installed)
  warn(
    "~/.claude/plugins/installed_plugins.json ausente — plugins ainda não instalados nesta máquina (confie na pasta e aceite a instalação)",
  );

const known = new Map(); // nome de skill -> origens
const addKnown = (name, origin) => known.set(name, [...(known.get(name) || []), origin]);
const pluginNamespaces = new Map(); // nome do plugin -> Set(skills)

for (const s of reg.skills.filter((s) => s.type === "plugin")) {
  const [pname, mname] = s.pluginId.split("@");
  if (s.scope === "project") {
    markets[mname]
      ? ok(`${s.pluginId}: marketplace declarado`)
      : fail(`${s.pluginId}: marketplace ${mname} não declarado`);
    enabled[s.pluginId] === s.enabledByDefault
      ? ok(`${s.pluginId}: enabled=${s.enabledByDefault} (esperado)`)
      : fail(
          `${s.pluginId}: enabledPlugins=${enabled[s.pluginId]} mas registry diz ${s.enabledByDefault}`,
        );
  }
  if (installed) {
    const entries = installed[s.pluginId] || [];
    const want =
      s.scope === "project"
        ? entries.find((e) => e.scope === "project" && samePath(e.projectPath || "", root))
        : entries.find((e) => e.scope === s.scope);
    if (!want) fail(`${s.pluginId}: não instalado no escopo ${s.scope}`);
    else {
      want.version === s.version
        ? ok(`${s.pluginId}: versão ${s.version}`)
        : warn(
            `${s.pluginId}: instalado ${want.version}, registry ${s.version} (atualize o registry)`,
          );
      if (s.commit && want.gitCommitSha && want.gitCommitSha !== s.commit)
        warn(
          `${s.pluginId}: commit instalado ${want.gitCommitSha.slice(0, 12)} ≠ registry ${s.commit.slice(0, 12)}`,
        );
    }
  }
  const cache = expand(s.cachePath);
  if (!exists(cache)) {
    (installed ? fail : warn)(`${s.pluginId}: cache ausente ${s.cachePath}`);
    continue;
  }
  const manifest = path.join(cache, ".claude-plugin/plugin.json");
  try {
    readJson(manifest);
    ok(`${s.pluginId}: plugin.json válido`);
  } catch (e) {
    fail(`${s.pluginId}: plugin.json inválido (${e.message})`);
  }
  const hooks = path.join(cache, "hooks/hooks.json");
  if (exists(hooks)) {
    try {
      readJson(hooks);
      ok(`${s.pluginId}: hooks.json válido`);
    } catch (e) {
      fail(`${s.pluginId}: hooks.json inválido`);
    }
  }
  const actual = pluginSkills(cache, s.skillsDir);
  pluginNamespaces.set(pname, new Set(actual.keys()));
  for (const [name, info] of actual) {
    if (info.fm.error) fail(`${pname}:${name}: ${info.fm.error}`);
    addKnown(name, `${pname} (plugin)`);
  }
  if (s.skills) {
    const missing = s.skills.filter((n) => !actual.has(n));
    const extra = [...actual.keys()].filter((n) => !s.skills.includes(n));
    missing.length
      ? fail(`${s.pluginId}: skills no registry mas não instaladas: ${missing.join(", ")}`)
      : ok(`${s.pluginId}: ${s.skills.length} skills conferem`);
    if (extra.length)
      warn(`${s.pluginId}: skills instaladas fora do registry: ${extra.join(", ")}`);
  }
}

section("Skills locais (.claude/skills)");
const localDir = path.join(root, ".claude/skills");
const localDirs = fs
  .readdirSync(localDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const registeredLocal = new Set(
  reg.skills.filter((s) => s.type === "local-skill").flatMap((s) => s.skills),
);
for (const d of localDirs) {
  const f = path.join(localDir, d, "SKILL.md");
  if (!exists(f)) {
    fail(`${d}: sem SKILL.md`);
    continue;
  }
  const fm = frontmatter(f);
  if (fm.error) {
    fail(`${d}: ${fm.error}`);
    continue;
  }
  fm.name === d ? ok(`${d}: frontmatter válido`) : fail(`${d}: pasta "${d}" mas name "${fm.name}"`);
  const broken = brokenLinks(f, fm.text);
  broken.length
    ? fail(`${d}: links quebrados: ${broken.join(", ")}`)
    : ok(`${d}: links internos resolvem`);
  registeredLocal.has(d) ? null : fail(`${d}: está em .claude/skills mas não no registry`);
  addKnown(d, "local");
}
for (const n of registeredLocal)
  if (!localDirs.includes(n)) fail(`${n}: no registry mas ausente em .claude/skills`);

const lockPath = path.join(root, "skills-lock.json");
if (exists(lockPath)) {
  const lock = readJson(lockPath).skills;
  for (const n of Object.keys(lock))
    localDirs.includes(n)
      ? ok(`skills-lock: ${n}`)
      : fail(`skills-lock lista ${n}, que não existe`);
  const viaCli = reg.skills
    .filter((s) => s.type === "local-skill" && /npx skills/.test(s.installMethod || ""))
    .flatMap((s) => s.skills);
  for (const n of viaCli)
    if (!lock[n]) fail(`${n} instalado via npx skills mas fora do skills-lock.json`);
}

section("Agents locais (.claude/agents)");
const agentsDir = path.join(root, ".claude/agents");
const localAgents = new Set();
if (exists(agentsDir))
  for (const f of fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md"))) {
    const fm = frontmatter(path.join(agentsDir, f));
    if (fm.error) fail(`agent ${f}: ${fm.error}`);
    else (localAgents.add(fm.name), ok(`agent ${fm.name}`));
  }

section("Colisões de nome");
const userSkillsDir = path.join(home, ".claude/skills");
const userSkills = exists(userSkillsDir) ? fs.readdirSync(userSkillsDir) : [];
for (const d of localDirs)
  if (userSkills.includes(d))
    warn(`skill local "${d}" tem o mesmo nome de uma skill de usuário em ~/.claude/skills`);
let dup = 0;
for (const [name, origins] of known)
  if (origins.length > 1) {
    dup++;
    const localClash = origins.filter((o) => o === "local").length > 1;
    (localClash ? fail : warn)(
      `"${name}" existe em: ${origins.join(", ")} (plugins têm namespace; rotear pelo nome completo)`,
    );
  }
if (!dup) ok("nenhum nome repetido");

section("Rotas");
const agentNames = new Set([
  ...localAgents,
  "web-performance-auditor",
  "code-reviewer",
  "security-auditor",
  "test-engineer",
]);
for (const r of reg.routes)
  for (const ref of [...(r.primary || []), ...(r.review || []), ...(r.reference || [])]) {
    const clean = ref.split(" ")[0];
    if (clean.includes("<")) continue;
    if (clean.startsWith("agent:")) {
      agentNames.has(clean.slice(6)) ? null : fail(`rota ${r.class}: agent desconhecido ${clean}`);
      continue;
    }
    const [ns, name] = clean.includes(":") ? clean.split(":") : [null, clean];
    const resolved = ns
      ? pluginNamespaces.get(ns)?.has(name)
      : known.has(name) || pluginNamespaces.has(name);
    resolved ? null : fail(`rota ${r.class}: "${ref}" não resolve para nenhuma skill instalada`);
  }
ok(`${reg.routes.length} classes de rota verificadas`);

console.log(`\n${fails ? "FALHOU" : "OK"} — ${fails} FAIL, ${warns} warn`);
process.exit(fails ? 1 : 0);
