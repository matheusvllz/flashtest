/**
 * Envio de e-mail transacional (docs/specs/46-producao T-05.3).
 *
 * - Teste: caixa de saída em memória (`caixaDeSaida()`), lida pelos testes.
 * - Desenvolvimento sem `RESEND_API_KEY`: grava um JSON por mensagem em `.data/emails/` (ignorado
 *   pelo Git), para abrir o link de verificação à mão ou pelo E2E.
 * - Com `RESEND_API_KEY`: API REST da Resend por `fetch` (sem SDK, como a Foca IA). Exige domínio
 *   verificado — sem domínio, o login por e-mail fica desligado em produção (D-10).
 *
 * Nunca registra o conteúdo nem o endereço em log.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../env";

export interface Mensagem {
  para: string;
  assunto: string;
  texto: string;
  html: string;
}

const emMemoria: Mensagem[] = [];

/** Só para testes: mensagens "enviadas" neste processo. */
export function caixaDeSaida(): readonly Mensagem[] {
  return emMemoria;
}
export function limparCaixaDeSaida(): void {
  emMemoria.length = 0;
}

export async function enviarEmail(m: Mensagem): Promise<void> {
  const e = env();
  if (e.teste) {
    emMemoria.push(m);
    return;
  }
  if (!e.RESEND_API_KEY) {
    if (e.producao) throw new Error("[email] RESEND_API_KEY ausente em produção");
    const pasta = join(process.cwd(), ".data", "emails");
    await mkdir(pasta, { recursive: true });
    const nome = `${new Date().toISOString().replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 8)}.json`;
    await writeFile(join(pasta, nome), JSON.stringify(m, null, 2));
    return;
  }
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${e.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: e.EMAIL_FROM, to: [m.para], subject: m.assunto, text: m.texto, html: m.html }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!resposta.ok) {
    // Só o status: o corpo pode ecoar o destinatário.
    throw new Error(`[email] envio falhou (HTTP ${resposta.status})`);
  }
}
