import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/marketing/Landing";
import { landingJsonLd, landingLinks, landingMeta } from "@/marketing/content/seo";
import { LP_MOTION_SCRIPT } from "@/marketing/motion/boot";
import marketingCss from "@/marketing/styles/marketing.css?url";

/**
 * `/` = a landing do Foca (docs/44 §3). Renderizada no servidor (HTML completo para busca e primeira pintura) e
 * indexável; o resto do produto é `noindex` (head da raiz). O CSS de marketing entra só por esta rota, e o GSAP
 * chega em import dinâmico depois do `load` (src/marketing/motion/boot.ts): quem abre o produto não baixa nada disso.
 * A entrada do produto é `/app` (src/routes/app.tsx).
 */
export const Route = createFileRoute("/")({
  head: () => ({
    meta: landingMeta(),
    links: [{ rel: "stylesheet", href: marketingCss }, ...landingLinks()],
    scripts: [{ children: LP_MOTION_SCRIPT }, { type: "application/ld+json", children: landingJsonLd() }],
  }),
  component: Landing,
});
