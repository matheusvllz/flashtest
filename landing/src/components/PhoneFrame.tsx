import type { CSSProperties, ReactNode } from "react";

// Moldura de celular só de borda (sem sombra difusa). O conteúdo é sempre um retrato REAL do app.
export function PhoneFrame({
  children,
  cut,
  className,
  style,
}: {
  children: ReactNode;
  /** "bottom" = celular subindo do rodapé da folha (sem borda embaixo). */
  cut?: "bottom";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={["lp-phone", className ?? ""].join(" ").trim()} data-cut={cut} style={style}>
      {children}
    </div>
  );
}
