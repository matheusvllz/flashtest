import { describe, expect, test } from "bun:test";
import { estadoDeSalvamento, type AppState } from "@/lib/store";

/** Estados de salvamento (spec 48 T-48.8.2, D48-15, RF-18): "sincronizado" só com confirmação do servidor. */
const base = (account?: Partial<NonNullable<AppState["account"]>>, confirmadaEm?: string) =>
  ({ account: account ? { userId: "u1", outbox: [], ...account } : undefined, progress: { sequenciaConfirmadaEm: confirmadaEm } }) as unknown as AppState;
const r = (sync: "ocioso" | "enviando" | "falhou" = "ocioso", syncConfirmadoEm = 0) => ({ sync, syncConfirmadoEm });
const fila = [{} as never];

describe("estadoDeSalvamento", () => {
  test("sem conta (ou modo de demonstração): salvo neste aparelho", () => {
    expect(estadoDeSalvamento(base(), r(), true)).toBe("aparelho");
  });
  test("fila com falha na última tentativa: falhou", () => {
    expect(estadoDeSalvamento(base({ outbox: fila }), r("falhou"), true)).toBe("falhou");
  });
  test("fila sem rede: sem conexão", () => {
    expect(estadoDeSalvamento(base({ outbox: fila }), r(), false)).toBe("sem-conexao");
  });
  test("fila esperando o envio: aguardando", () => {
    expect(estadoDeSalvamento(base({ outbox: fila }), r("enviando", 123), true)).toBe("aguardando");
  });
  test("fila vazia mas nunca confirmada: aguardando (não afirma 'na conta')", () => {
    expect(estadoDeSalvamento(base({}), r(), true)).toBe("aguardando");
  });
  test("fila vazia e confirmada pelo servidor nesta página: sincronizado", () => {
    expect(estadoDeSalvamento(base({}), r("ocioso", Date.now()), true)).toBe("sincronizado");
  });
  test("confirmação guardada de antes (depois de recarregar) não basta: aguardando até o servidor responder", () => {
    expect(estadoDeSalvamento(base({}, "2026-09-30T10:00:00Z"), r(), true)).toBe("aguardando");
  });
  test("falha ao salvar o documento (fila de eventos vazia) aparece como falha", () => {
    expect(estadoDeSalvamento(base({}), r("falhou", Date.now()), true)).toBe("falhou");
  });
});
