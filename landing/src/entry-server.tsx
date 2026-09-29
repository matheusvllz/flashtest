import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { Landing } from "./Landing";
import { renderHead, renderRobots, renderSitemap } from "./content/seo";

/** HTML do corpo da página (usado por scripts/prerender.ts). */
export function render(): string {
  return renderToString(
    <StrictMode>
      <Landing />
    </StrictMode>,
  );
}

/** Conteúdo do <head> (title, meta, OG, JSON-LD). */
export { renderHead, renderRobots, renderSitemap };
