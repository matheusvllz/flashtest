/**
 * Espelha as skills do projeto de `.agents/skills/` (fonte — é onde o Codex as
 * descobre) para `.claude/skills/` (onde o Claude Code as descobre).
 * docs/specs/46-producao/spec.md T-02.2.
 *
 *   bun scripts/agents/sincronizar-skills.ts           # copia
 *   bun scripts/agents/sincronizar-skills.ts --checar  # só confere; sai com 1 se divergir
 *
 * Cópia, não symlink: symlink no Windows exige modo desenvolvedor e o Git costuma
 * gravá-lo como arquivo de texto. Skills que só existem em `.claude/skills/`
 * (ex.: repo-security-review, que depende de ferramentas do Claude) não são tocadas.
 */
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const RAIZ = resolve(import.meta.dir, "..", "..");
const FONTE = join(RAIZ, ".agents", "skills");
const ESPELHO = join(RAIZ, ".claude", "skills");
const CHECAR = process.argv.includes("--checar");

function arquivos(dir: string): string[] {
  const out: string[] = [];
  const andar = (d: string) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) andar(p);
      else out.push(relative(dir, p).split("\\").join("/"));
    }
  };
  if (existsSync(dir)) andar(dir);
  return out.sort();
}

/** Conteúdo normalizado (CRLF → LF) para a comparação não depender do checkout no Windows. */
function conteudo(p: string): string {
  return readFileSync(p).toString("latin1").replace(/\r\n/g, "\n");
}

export function divergencias(): string[] {
  const problemas: string[] = [];
  if (!existsSync(FONTE)) return [".agents/skills não existe"];
  for (const skill of readdirSync(FONTE)) {
    const a = join(FONTE, skill);
    const b = join(ESPELHO, skill);
    if (!statSync(a).isDirectory()) continue;
    if (!existsSync(b)) {
      problemas.push(`${skill}: ausente em .claude/skills`);
      continue;
    }
    const fa = arquivos(a);
    const fb = arquivos(b);
    for (const f of fa) if (!fb.includes(f)) problemas.push(`${skill}/${f}: ausente no espelho`);
    for (const f of fb) if (!fa.includes(f)) problemas.push(`${skill}/${f}: sobra no espelho`);
    for (const f of fa)
      if (fb.includes(f) && conteudo(join(a, f)) !== conteudo(join(b, f)))
        problemas.push(`${skill}/${f}: conteúdo diferente da fonte`);
  }
  return problemas;
}

if (import.meta.main) {
  if (CHECAR) {
    const p = divergencias();
    if (p.length) {
      console.log(p.join("\n"));
      console.log(`\n${p.length} divergência(s). Edite em .agents/skills/ e rode: bun scripts/agents/sincronizar-skills.ts`);
      process.exit(1);
    }
    console.log("skills: .claude/skills espelha .agents/skills.");
    process.exit(0);
  }
  for (const skill of readdirSync(FONTE)) {
    const a = join(FONTE, skill);
    if (!statSync(a).isDirectory()) continue;
    const b = join(ESPELHO, skill);
    rmSync(b, { recursive: true, force: true });
    cpSync(a, b, { recursive: true });
    console.log(`espelhada: ${skill}`);
  }
}
