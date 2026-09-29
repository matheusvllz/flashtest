import { SHOTS, type ShotId } from "../content/shots";

// Retrato REAL do app (docs/40 §14): <picture> com AVIF/WebP em duas larguras, claro e escuro pelo tema do sistema.
// Dimensões fixas = razão de aspecto travada, zero CLS.
type Props = {
  id: ShotId;
  alt: string;
  /** Atributo `sizes` do <img>: largura de exibição em CSS px conforme o layout. */
  sizes?: string;
  /** LCP: carrega já, com prioridade alta. */
  priority?: boolean;
  className?: string;
  /** Recorta pelo topo (mantém o começo da tela) quando a caixa é mais baixa que o retrato. */
  fit?: "natural" | "cover-top";
};

const src = (id: string, tema: "light" | "dark", w: number, ext: "avif" | "webp") => `/lp/shots/${id}-${tema}-${w}.${ext}`;
const srcset = (id: string, tema: "light" | "dark", ext: "avif" | "webp", widths: readonly number[]) => widths.map((w) => `${src(id, tema, w, ext)} ${w}w`).join(", ");

export function ProductShot({ id, alt, sizes = "(min-width: 1024px) 400px, 90vw", priority = false, className, fit = "natural" }: Props) {
  const m = SHOTS[id];
  const largura = m.widths[m.widths.length - 1];
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" type="image/avif" srcSet={srcset(id, "dark", "avif", m.widths)} sizes={sizes} />
      <source media="(prefers-color-scheme: dark)" type="image/webp" srcSet={srcset(id, "dark", "webp", m.widths)} sizes={sizes} />
      <source type="image/avif" srcSet={srcset(id, "light", "avif", m.widths)} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(id, "light", "webp", m.widths)} sizes={sizes} />
      <img
        src={src(id, "light", largura, "webp")}
        width={m.width}
        height={m.height}
        alt={alt}
        sizes={sizes}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        className={className}
        style={fit === "cover-top" ? { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" } : { width: "100%", height: "auto", aspectRatio: `${m.width} / ${m.height}` }}
      />
    </picture>
  );
}
