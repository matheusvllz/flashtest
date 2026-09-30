/**
 * Executor da fila. E o que o Agendador de Tarefas do Windows chama a cada 15 minutos.
 * Nao gera conteudo e nao chama IA: so publica o que ja foi aprovado e agendado.
 *
 *   bun run fila              publica de verdade o que venceu (exige .env)
 *   bun run fila --simular    percorre a fila com o cliente de simulacao (nada sai, nada muda)
 *
 * - so pega conteudo "agendado" (ou "falhou" com agendamento) cujo horario ja chegou, nao cancelado
 * - trava global: duas execucoes ao mesmo tempo nao rodam a fila em paralelo
 * - usa o MESMO publicarConteudo da publicacao manual (mesmas validacoes e deduplicacao)
 * - falha: ate 3 tentativas, com pelo menos 15 min entre elas; token expirado para a fila inteira
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { carregarEnv, lerConfig } from "../lib/config.ts";
import { P } from "../lib/paths.ts";
import { ler } from "../historico/db.ts";
import { montarCliente, publicarConteudo } from "../instagram/publicar.ts";

const MAX_TENTATIVAS = 3;
const INTERVALO_MIN = 15 * 60_000;

export function vencidos(agora = Date.now()) {
  return ler().registros.filter((r) => {
    if (!r.agendamento || r.agendamento.cancelado) return false;
    if (new Date(r.agendamento.quando).getTime() > agora) return false;
    if (r.estado === "agendado") return true;
    if (r.estado !== "falhou") return false;
    const erros = (r.publicacao?.tentativas ?? []).filter(
      (t) => t.resultado === "erro" && t.modo === "real",
    );
    const ultima = erros.at(-1);
    return (
      erros.length < MAX_TENTATIVAS &&
      (!ultima || agora - new Date(ultima.em).getTime() >= INTERVALO_MIN)
    );
  });
}

if (import.meta.main) {
  const simular = process.argv.includes("--simular");
  carregarEnv();
  mkdirSync(P.logs, { recursive: true });
  const trava = join(P.logs, "fila.lock");
  if (existsSync(trava) && Date.now() - Number(readFileSync(trava, "utf8")) < 30 * 60_000) {
    console.log("fila ja em execucao; saindo");
    process.exit(0);
  }
  writeFileSync(trava, String(Date.now()));
  try {
    const cfg = lerConfig();
    const fila = vencidos();
    console.log(
      `${new Date().toISOString()} · ${fila.length} item(ns) vencido(s)${simular ? " · SIMULACAO" : ""}`,
    );
    for (const r of fila) {
      try {
        const res = await publicarConteudo(r.id, {
          cliente: montarCliente(!simular),
          adaptador: simular ? "simulacao" : cfg.midia.adaptador,
          usuarioEsperado: process.env.IG_USERNAME || undefined,
          idEsperado: simular ? undefined : process.env.IG_USER_ID,
          dormir: simular ? () => Promise.resolve() : undefined,
        });
        console.log(`  ${r.id}: ${res.status}`);
      } catch (e) {
        const msg = (e as Error).message;
        console.log(`  ${r.id}: ERRO ${msg}`);
        if (/token do Instagram expirou/.test(msg)) {
          console.log("  token expirado: fila interrompida ate o token ser renovado");
          break;
        }
      }
    }
  } finally {
    rmSync(trava, { force: true });
  }
}
