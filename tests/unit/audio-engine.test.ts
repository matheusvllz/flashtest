import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  __reiniciarMotorParaTestes,
  getAudioDiagnostics,
  playFeedbackSound,
  retomarAudioSeInterrompido,
  setSomNoSilencioso,
  unlockAudioFromGesture,
} from "@/lib/audio/engine";

/**
 * Motor de áudio com um AudioContext falso (spec 50 §5.12.1, T-50.1.3): o caminho do celular — contexto
 * `interrupted` (iOS), primeiro som lento e destravamento por gesto — sem navegador.
 */

type Estado = "suspended" | "running" | "interrupted" | "closed";

class ContextoFalso {
  static ultimo: ContextoFalso | null = null;
  static estadoInicial: Estado = "suspended";
  static atrasoResumeMs = 0;
  state: Estado = ContextoFalso.estadoInicial;
  sampleRate = 48000;
  currentTime = 0;
  destination = {};
  iniciados: number[] = [];
  resumes = 0;
  constructor() {
    ContextoFalso.ultimo = this;
  }
  addEventListener() {}
  createGain() {
    return {
      gain: { value: 1, cancelScheduledValues() {}, setValueAtTime() {}, linearRampToValueAtTime() {} },
      connect: (x: unknown) => x,
      disconnect() {},
    };
  }
  createBufferSource() {
    const ctx = this;
    return {
      buffer: null as unknown,
      onended: null as null | (() => void),
      connect: (x: { connect?: unknown }) => x,
      disconnect() {},
      start(t: number) {
        ctx.iniciados.push(t);
      },
      stop() {},
    };
  }
  resume() {
    this.resumes += 1;
    return new Promise<void>((ok) =>
      setTimeout(() => {
        this.state = "running";
        ok();
      }, ContextoFalso.atrasoResumeMs),
    );
  }
  decodeAudioData() {
    return Promise.resolve({ duration: 0.2 });
  }
}

const globalAny = globalThis as Record<string, unknown>;
const fetchOriginal = globalThis.fetch;
let atrasoFetchMs = 0;

beforeEach(() => {
  __reiniciarMotorParaTestes();
  ContextoFalso.estadoInicial = "suspended";
  ContextoFalso.atrasoResumeMs = 0;
  atrasoFetchMs = 0;
  globalAny.window = { AudioContext: ContextoFalso, addEventListener() {} };
  globalAny.document = { hidden: false, addEventListener() {} };
  globalAny.fetch = () =>
    new Promise((ok) => setTimeout(() => ok({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }), atrasoFetchMs));
});

afterEach(() => {
  delete globalAny.window;
  delete globalAny.document;
  globalThis.fetch = fetchOriginal;
  __reiniciarMotorParaTestes();
});

describe("motor de áudio no celular (spec 50 §5.12.1)", () => {
  test("contexto 'interrupted' (iOS) é retomado ao tocar e o som toca", async () => {
    ContextoFalso.estadoInicial = "interrupted";
    await playFeedbackSound("resposta-correta");
    expect(ContextoFalso.ultimo!.resumes).toBe(1);
    expect(ContextoFalso.ultimo!.iniciados.length).toBe(1);
    expect(getAudioDiagnostics().registros.some((r) => r.tipo === "tocou")).toBe(true);
  });

  test("primeiro som lento (≈ 600 ms) toca; o segundo som lento é descartado pelo prazo de 300 ms", async () => {
    atrasoFetchMs = 600;
    await playFeedbackSound("resposta-correta");
    expect(ContextoFalso.ultimo!.iniciados.length).toBe(1);
    // Segundo som: buffer novo e ainda lento → passa de 300 ms → descartado, com o motivo registrado.
    await playFeedbackSound("resposta-incorreta");
    expect(ContextoFalso.ultimo!.iniciados.length).toBe(1);
    const descartes = getAudioDiagnostics().registros.filter((r) => r.tipo === "descartado");
    expect(descartes.at(-1)?.dados?.motivo).toBe("prazo");
  });

  test("destravar num gesto retoma o contexto e pré-carrega os 12 sons sem tocar", async () => {
    unlockAudioFromGesture("touchend");
    await new Promise((r) => setTimeout(r, 10));
    const d = getAudioDiagnostics();
    expect(d.contexto).toBe("running");
    expect(d.carregados.length).toBe(12);
    expect(ContextoFalso.ultimo!.iniciados.length).toBe(0);
    expect(d.registros.find((r) => r.tipo === "resume")?.dados?.motivo).toBe("touchend");
  });

  test("ao voltar ao app, um contexto interrompido é retomado", async () => {
    unlockAudioFromGesture("click");
    await new Promise((r) => setTimeout(r, 5));
    ContextoFalso.ultimo!.state = "interrupted";
    retomarAudioSeInterrompido("visivel");
    await new Promise((r) => setTimeout(r, 5));
    expect(ContextoFalso.ultimo!.state).toBe("running");
  });

  test("preferência de som no silencioso fica no diagnóstico", () => {
    setSomNoSilencioso(true);
    expect(getAudioDiagnostics().somNoSilencioso).toBe(true);
  });
});
