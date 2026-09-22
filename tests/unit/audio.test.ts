import { describe, expect, test } from "bun:test";
import {
  playClosingSound,
  playFeedbackSound,
  selectHighestPrioritySound,
  setAudioEnabled,
  stopAllFeedbackSounds,
  unlockAudioFromGesture,
} from "@/lib/audio/engine";
import { SOUND_ASSETS, PRIORIDADE_FECHAMENTO, type SoundEvent } from "@/lib/audio/identity";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const TODOS_OS_EVENTOS = Object.keys(SOUND_ASSETS) as SoundEvent[];

describe("identity — assets aprovados", () => {
  test("12 WAVs de produção são idênticos aos aprovados", () => {
    expect(TODOS_OS_EVENTOS).toHaveLength(12);
    for (const evento of TODOS_OS_EVENTOS) {
      const production = readFileSync(`public${SOUND_ASSETS[evento]}`);
      const approved = readFileSync(`docs/audio-proposal-v2/wav/${evento}.wav`);
      expect(createHash("sha256").update(production).digest("hex")).toBe(
        createHash("sha256").update(approved).digest("hex"),
      );
      expect(production.toString("ascii", 0, 4)).toBe("RIFF");
      expect(production.readUInt32LE(24)).toBe(48000);
    }
  });

  test("prioridade de fechamento só referencia eventos que existem na partitura", () => {
    for (const evento of PRIORIDADE_FECHAMENTO) {
      expect(TODOS_OS_EVENTOS).toContain(evento);
    }
  });
});

describe("selectHighestPrioritySound — docs/20 §5, regra 5", () => {
  test("escolhe o mais alto da hierarquia entre vários eventos coincidentes", () => {
    // Ordem exata do docs/20 §5: "especial → level up → capítulo → meta diária → marco de streak → lição".
    const escolhido = selectHighestPrioritySound([
      "conclusao-licao",
      "marco-streak",
      "meta-diaria",
    ]);
    expect(escolhido).toBe("meta-diaria");
  });

  test("level-up bate meta-diaria (nível > meta na hierarquia)", () => {
    expect(selectHighestPrioritySound(["meta-diaria", "level-up"])).toBe("level-up");
  });

  test("streak diário não rouba prioridade de nível ou marco", () => {
    expect(selectHighestPrioritySound(["streak-diario", "level-up", "conclusao-licao"])).toBe(
      "level-up",
    );
    expect(selectHighestPrioritySound(["streak-diario", "marco-streak"])).toBe("marco-streak");
    expect(selectHighestPrioritySound(["conclusao-licao", "streak-diario"])).toBe("streak-diario");
  });

  test("lista vazia não escolhe nada", () => {
    expect(selectHighestPrioritySound([])).toBeNull();
  });

  test("evento único sempre vence, mesmo sozinho", () => {
    expect(selectHighestPrioritySound(["conclusao-licao"])).toBe("conclusao-licao");
  });
});

describe("engine — seguro fora do navegador (SSR/teste)", () => {
  test("nenhuma função lança sem `window`/`AudioContext` disponível", async () => {
    expect(() => unlockAudioFromGesture()).not.toThrow();
    expect(() => setAudioEnabled(false)).not.toThrow();
    expect(() => setAudioEnabled(true)).not.toThrow();
    expect(() => stopAllFeedbackSounds()).not.toThrow();
    await expect(playFeedbackSound("resposta-correta")).resolves.toBeUndefined();
    await expect(playClosingSound(["conclusao-licao"])).resolves.toBeUndefined();
  });

  test("evento de resposta com timestamp expirado (>300ms) é descartado sem lançar", async () => {
    const antigo = Date.now() - 1000;
    await expect(playFeedbackSound("resposta-correta", antigo)).resolves.toBeUndefined();
  });
});
