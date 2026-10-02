/**
 * Níveis por XP (docs/18 §9; C-XP): fonte única, pura — usada pelo app (`store.ts` reexporta) e pelo servidor
 * (Pérolas por nível, spec 50 §5.1.8). Não confundir com `prefs.level` (nível escolar).
 */
/** 10 patamares fixos, derivados de XP (docs/18 §9). Não confundir com `prefs.level` (nível escolar). */
export const NIVEL_TABELA = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

export function nivelDeXp(xp: number): {
  nivel: number;
  atual: number;
  proximo: number;
  pct: number;
} {
  let nivel = 1;
  for (let i = 1; i < NIVEL_TABELA.length; i++) {
    if (xp >= NIVEL_TABELA[i]) nivel = i + 1;
  }
  const base = NIVEL_TABELA[nivel - 1];
  const proximoBase = NIVEL_TABELA[nivel];
  if (proximoBase === undefined) return { nivel, atual: xp - base, proximo: 0, pct: 100 };
  const atual = xp - base;
  const proximo = proximoBase - base;
  return { nivel, atual, proximo, pct: Math.min(100, Math.round((atual / proximo) * 100)) };
}
