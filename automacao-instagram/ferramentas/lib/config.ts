import { readFileSync } from "node:fs";
import { P } from "./paths.ts";

export type Config = {
  conta: { usuario: string; fuso: string };
  instagram: {
    host: string;
    versao: string;
    tipoLogin: "instagram" | "facebook";
    simulacaoPadrao: boolean;
  };
  midia: { adaptador: "manual" | "pasta-publica" | "base-url"; adaptadoresDisponiveis: string[] };
  formatos: {
    feed: { largura: number; altura: number; proporcao: string };
    reels: { largura: number; altura: number; proporcao: string; fps: number };
    jpegQualidade: number;
    maxBytesImagem: number;
    maxPaginasCarrossel: number;
  };
  agendador: { fuso: string; janela: { inicio: string; fim: string } };
};

export function lerConfig(): Config {
  return JSON.parse(readFileSync(P.config, "utf8")) as Config;
}

/** Le .env sem dependencia externa. Nao sobrescreve variavel ja definida no ambiente. */
export function carregarEnv() {
  try {
    const txt = readFileSync(`${P.raiz}/.env`, "utf8");
    for (const linha of txt.split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linha);
      if (!m) continue;
      const [, k, v] = m;
      if (process.env[k] === undefined) process.env[k] = v.replace(/^["']|["']$/g, "");
    }
  } catch {
    /* sem .env: os comandos que exigem credencial avisam por conta propria */
  }
}
