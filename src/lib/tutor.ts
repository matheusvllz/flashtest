/**
 * Transporte do balão do tutor (spec 48 F2; 46 T-08.1…T-08.5). A lógica vive em `src/server/tutor/responder.ts`,
 * exercitável sem o TanStack; aqui só a sessão, a origem, o limite por aluno e o contrato.
 *
 * O cliente manda o contrato de `tutor-contrato.ts` (mensagens, item em foco, modo, foto). Tudo o mais — perfil,
 * desempenho, enunciado, gabarito, contexto pedagógico — o servidor monta.
 */
import { createServerFn } from "@tanstack/react-start";
import { pedidoTutor, type RespostaTutor } from "@/lib/tutor-contrato";
import { banco } from "@/server/db/client";
import { env } from "@/server/env";
import { checarOrigem, ErroApp, log, sessaoAtual } from "@/server/http";
import { limitar } from "@/server/limite";
import { responderTutor } from "@/server/tutor/responder";

export const askTutor = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const r = pedidoTutor.safeParse(d);
    return r.success ? r.data : null;
  })
  .handler(async ({ data }): Promise<RespostaTutor> => {
    if (!data) return { ok: false, tipo: "invalido" };
    try {
      checarOrigem();
      const e = env();
      const sessao = await sessaoAtual();
      const db = e.contasAtivas ? await banco() : null;
      // Rajada: no máximo 10 pedidos por minuto por aluno, além da cota diária.
      if (db && sessao) await limitar(db, `tutor:${sessao.userId}`, 60, 10);
      return await responderTutor({ env: e, sessao, db, agora: new Date(), temChave: !!process.env.OPENAI_API_KEY?.trim() }, data);
    } catch (erro) {
      if (erro instanceof ErroApp && erro.status === 429) return { ok: false, tipo: "limite" };
      if (erro instanceof ErroApp && erro.status === 403) return { ok: false, tipo: "invalido" };
      log("erro", "tutor.erro", { tipo: erro instanceof Error ? erro.name : "desconhecido" });
      return { ok: false, tipo: "erro" };
    }
  });

export type { PedidoTutor, RespostaTutor } from "@/lib/tutor-contrato";
