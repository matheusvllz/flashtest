import { SOUND_ASSETS, PRIORIDADE_FECHAMENTO, type SoundEvent } from "./identity";
export type { SoundEvent } from "./identity";

const FADE_S = 0.03;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let generation = 0;
let freeAt = 0;
const buffers = new Map<SoundEvent, Promise<AudioBuffer | null>>();
const active = new Set<{ source: AudioBufferSourceNode; gain: GainNode }>();

function visible(): boolean {
  return typeof document === "undefined" || !document.hidden;
}

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      const created = new Ctor();
      const gain = created.createGain();
      // Approved WAVs already carry their level hierarchy: unity master gain.
      gain.gain.value = 1;
      gain.connect(created.destination);
      ctx = created;
      master = gain;
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAllFeedbackSounds();
      });
      window.addEventListener("pagehide", stopAllFeedbackSounds);
    } catch {
      return null;
    }
  }
  return ctx;
}

function load(event: SoundEvent, c: AudioContext): Promise<AudioBuffer | null> {
  const cached = buffers.get(event);
  if (cached) return cached;
  const request = (async () => {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 8000);
    try {
      const response = await fetch(SOUND_ASSETS[event], { signal: abort.signal });
      if (!response.ok) throw new Error("Audio unavailable");
      return await c.decodeAudioData(await response.arrayBuffer());
    } catch {
      buffers.delete(event);
      return null;
    } finally {
      clearTimeout(timer);
    }
  })();
  buffers.set(event, request);
  return request;
}

async function within<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), Math.max(0, ms));
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Warm all approved assets on a gesture, without playing a preview. */
export function unlockAudioFromGesture(): void {
  if (!enabled || !visible()) return;
  const c = context();
  if (!c) return;
  if (c.state === "suspended") void c.resume().catch(() => {});
  for (const event of Object.keys(SOUND_ASSETS) as SoundEvent[]) void load(event, c);
}

async function play(event: SoundEvent, requestedAt: number, expiresMs: number): Promise<void> {
  if (!enabled || !visible() || Date.now() - requestedAt >= expiresMs) return;
  const c = context();
  if (!c) return;
  const requestGeneration = generation;
  try {
    const ready = await within(
      Promise.all([c.state === "suspended" ? c.resume() : Promise.resolve(), load(event, c)]),
      expiresMs - (Date.now() - requestedAt),
    );
    if (
      !ready ||
      !ready[1] ||
      !enabled ||
      !visible() ||
      generation !== requestGeneration ||
      c.state !== "running"
    )
      return;
    const start = Math.max(c.currentTime, freeAt);
    // Deadline includes fetch, decoding, resume AND queue wait.
    if (Date.now() - requestedAt + (start - c.currentTime) * 1000 >= expiresMs) return;
    const source = c.createBufferSource();
    const gain = c.createGain();
    source.buffer = ready[1];
    source.connect(gain).connect(master!);
    const entry = { source, gain };
    source.onended = () => {
      active.delete(entry);
      source.disconnect();
      gain.disconnect();
    };
    active.add(entry);
    source.start(start);
    freeAt = start + ready[1].duration;
  } catch {
    // Network/autoplay/decoding failures never interrupt a lesson.
  }
}

export function playFeedbackSound(event: SoundEvent, requestedAt = Date.now()): Promise<void> {
  return play(event, requestedAt, 300);
}

export function selectHighestPrioritySound(events: SoundEvent[]): SoundEvent | null {
  return PRIORIDADE_FECHAMENTO.find((event) => events.includes(event)) ?? events[0] ?? null;
}

export function playClosingSound(events: SoundEvent[], requestedAt = Date.now()): Promise<void> {
  const event = selectHighestPrioritySound(events);
  return event ? play(event, requestedAt, 500) : Promise.resolve();
}

/** Invalidates pending async playback as well as scheduled/running sources. */
export function stopAllFeedbackSounds(): void {
  generation++;
  if (!ctx) return;
  const now = ctx.currentTime;
  const hadActive = active.size > 0;
  for (const { source, gain } of active) {
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + FADE_S);
      source.stop(now + FADE_S);
    } catch {
      // Already ended.
    }
  }
  freeAt = now + (hadActive ? FADE_S : 0);
}

export function setAudioEnabled(value: boolean): void {
  enabled = value;
  if (!value) stopAllFeedbackSounds();
}
