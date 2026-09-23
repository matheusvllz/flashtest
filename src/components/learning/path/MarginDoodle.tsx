/** Rabisco de margem (docs/27 §11.4). Decorativo: fora da árvore de acessibilidade. */
export function MarginDoodle({ glyph }: { glyph: string }) {
  return (
    <span className="path-doodle" aria-hidden="true">
      {glyph}
    </span>
  );
}
