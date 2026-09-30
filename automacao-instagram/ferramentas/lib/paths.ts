/**
 * Caminhos da automacao. Unico lugar que sabe onde fica a raiz do repo do Foca.
 * A automacao LE do repo (marca, assets, docs) e nunca escreve fora desta pasta.
 */
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
/** automacao-instagram/ */
export const RAIZ = resolve(aqui, "..", "..");
/** raiz do repo do Foca (pai desta pasta) */
export const REPO = resolve(RAIZ, "..");

export const P = {
  raiz: RAIZ,
  repo: REPO,
  config: join(RAIZ, "config", "config.json"),
  marca: join(RAIZ, "marca"),
  snapshot: join(RAIZ, "marca", "snapshot.json"),
  estrategia: join(RAIZ, "estrategia"),
  historico: join(RAIZ, "historico"),
  /** FOCA_SOCIAL_BANCO permite apontar para um banco descartavel (testes). */
  banco: process.env.FOCA_SOCIAL_BANCO ?? join(RAIZ, "historico", "banco.json"),
  conteudos: join(RAIZ, "conteudos"),
  previews: join(RAIZ, "previews"),
  logs: join(RAIZ, "logs"),
  // Fontes no repo do Foca (somente leitura)
  fontes: join(REPO, "public", "fonts"),
  logos: join(REPO, "public", "branding", "foca"),
  logosOrigem: join(REPO, "src", "assets", "branding", "foca"),
  telas: join(REPO, "assets-src", "marketing", "shots"),
  stylesCss: join(REPO, "src", "styles.css"),
  designMd: join(REPO, "docs", "DESIGN.md"),
  brandTs: join(REPO, "src", "lib", "brand.ts"),
} as const;

export function pastaConteudo(id: string) {
  const base = join(P.conteudos, id);
  return {
    base,
    brief: join(base, "brief.md"),
    conteudo: join(base, "conteudo.json"),
    legenda: join(base, "legenda.txt"),
    fonte: join(base, "fonte"),
    export: join(base, "export"),
    preview: join(base, "preview"),
    versoes: join(base, "versoes"),
    meta: join(base, "meta.json"),
    validacao: join(base, "validacao.json"),
  };
}
