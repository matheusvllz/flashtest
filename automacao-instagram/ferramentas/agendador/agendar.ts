/**
 * Fila de agendamento. Um horario salvo aqui NAO publica nada sozinho: quem publica e o
 * executor da fila (executar-fila.ts), disparado pelo Agendador de Tarefas do Windows.
 * Sem a tarefa instalada, com o computador desligado ou sem internet, nada sai.
 *
 *   bun run agendar <id> "2026-10-02 19:00"     agenda (fuso da config, padrao America/Sao_Paulo)
 *   bun run agendar listar                       mostra a fila
 *   bun run agendar cancelar <id>                tira da fila (volta para "pronto")
 */
import { lerConfig } from "../lib/config.ts";
import { ler, mudarEstado, obter, salvar } from "../historico/db.ts";

/** Converte "AAAA-MM-DD HH:MM" no fuso dado para um instante UTC, sem biblioteca. */
export function instanteNoFuso(local: string, fuso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) throw new Error(`data invalida "${local}". Use AAAA-MM-DD HH:MM`);
  const [, a, mes, d, h, min] = m.map(Number) as unknown as number[];
  const palpite = Date.UTC(a, mes - 1, d, h, min);
  const offset = (t: number) => {
    const partes = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: fuso,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
        .formatToParts(new Date(t))
        .map((p) => [p.type, p.value]),
    );
    return Date.UTC(+partes.year, +partes.month - 1, +partes.day, +partes.hour, +partes.minute) - t;
  };
  // duas passadas cobrem mudanca de horario de verao, se o fuso tiver
  let t = palpite - offset(palpite);
  t = palpite - offset(t);
  return new Date(t);
}

export function horaLocal(iso: string, fuso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: fuso,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function agendar(id: string, local: string) {
  const cfg = lerConfig();
  const fuso = cfg.agendador.fuso;
  const r = obter(id);
  if (!r) throw new Error(`${id} nao esta no historico`);
  if (!["pronto", "agendado", "falhou"].includes(r.estado))
    throw new Error(`${id} esta em "${r.estado}"; so conteudo pronto pode ser agendado`);
  const hh = local.trim().slice(-5);
  if (hh < cfg.agendador.janela.inicio || hh > cfg.agendador.janela.fim)
    throw new Error(
      `${hh} fora da janela ${cfg.agendador.janela.inicio}–${cfg.agendador.janela.fim} (regra do produto: notificacao e publicacao em horario de estudo, docs/16 §9)`,
    );
  const quando = instanteNoFuso(local, fuso);
  if (quando.getTime() < Date.now()) throw new Error(`${local} (${fuso}) ja passou`);
  r.agendamento = { quando: quando.toISOString(), fuso };
  salvar(r);
  if (r.estado !== "agendado") mudarEstado(id, "agendado");
  return { id, quando: quando.toISOString(), local: horaLocal(quando.toISOString(), fuso), fuso };
}

export function cancelar(id: string) {
  const r = obter(id);
  if (!r?.agendamento) throw new Error(`${id} nao esta agendado`);
  r.agendamento.cancelado = true;
  salvar(r);
  if (r.estado === "agendado") mudarEstado(id, "pronto");
  return r;
}

if (import.meta.main) {
  const [a, b] = process.argv.slice(2);
  const fuso = lerConfig().agendador.fuso;
  if (a === "listar" || !a) {
    const fila = ler()
      .registros.filter(
        (r) =>
          r.agendamento && !r.agendamento.cancelado && ["agendado", "falhou"].includes(r.estado),
      )
      .sort((x, y) => x.agendamento!.quando.localeCompare(y.agendamento!.quando));
    if (!fila.length) console.log("fila vazia");
    for (const r of fila)
      console.log(`${horaLocal(r.agendamento!.quando, fuso)}  ${r.estado.padEnd(9)} ${r.id}`);
  } else if (a === "cancelar") {
    cancelar(b);
    console.log(`${b}: removido da fila, voltou para "pronto"`);
  } else {
    const r = agendar(a, b);
    console.log(`${r.id} agendado para ${r.local} (${r.fuso}) = ${r.quando} UTC`);
    console.log(
      "Lembrete: so publica se a tarefa do Windows estiver instalada e o computador ligado e online (README → Agendamento).",
    );
  }
}
