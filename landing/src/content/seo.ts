import { INDEXABLE, SITE_URL } from "../config";
import { LP } from "./copy";

// Head da página (docs/40 §18): título, descrição, robots, canonical, Open Graph, Twitter, ícones, JSON-LD e
// preloads. Gerado no build (scripts/prerender.ts) a partir das MESMAS strings de copy.ts.
// Regras: noindex por padrão (só o proprietário libera a publicação, D-LP-5); sem preço, nota, avaliação nem
// FAQPage no JSON-LD (nada disso existe ou vale o risco de parecer spam).

export interface HeadOptions {
  siteUrl?: string;
  indexable?: boolean;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Caminho do arquivo da imagem de compartilhamento (gerado por scripts/make-og-image.ts). */
export const OG_IMAGE_PATH = "/lp/og/og-landing.png";

export function jsonLd(siteUrl: string) {
  const abs = (p: string) => (siteUrl ? `${siteUrl}${p}` : p);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: LP.marca, ...(siteUrl ? { url: `${siteUrl}/` } : {}), inLanguage: LP.meta.lang },
      { "@type": "Organization", name: LP.marca, ...(siteUrl ? { url: `${siteUrl}/` } : {}), logo: abs("/lp/brand/icon-512.png") },
      {
        "@type": "WebApplication",
        name: LP.marca,
        description: LP.meta.description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: LP.meta.lang,
      },
    ],
  };
}

export function renderHead({ siteUrl = SITE_URL, indexable = INDEXABLE }: HeadOptions = {}): string {
  const { title, description, ogAlt } = LP.meta;
  const robots = indexable ? "index, follow" : "noindex, nofollow";
  const abs = (p: string) => (siteUrl ? `${siteUrl}${p}` : p);
  const linhas: string[] = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta name="color-scheme" content="light dark" />`,
    `<meta name="theme-color" content="#f6f5f1" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#1c1b18" media="(prefers-color-scheme: dark)" />`,
    ...(siteUrl ? [`<link rel="canonical" href="${siteUrl}/" />`] : []),

    `<link rel="icon" href="/favicon.ico" sizes="any" />`,
    `<link rel="icon" href="/lp/brand/icon-192.png" type="image/png" sizes="192x192" />`,
    `<link rel="apple-touch-icon" href="/lp/brand/apple-touch-icon.png" />`,

    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:site_name" content="${esc(LP.marca)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    ...(siteUrl ? [`<meta property="og:url" content="${siteUrl}/" />`] : []),
    `<meta property="og:image" content="${abs(OG_IMAGE_PATH)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(ogAlt)}" />`,

    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${abs(OG_IMAGE_PATH)}" />`,
    `<meta name="twitter:image:alt" content="${esc(ogAlt)}" />`,

    // Só o que o primeiro pixel precisa: duas fontes de texto e o retrato do hero (claro ou escuro, AVIF).
    `<link rel="preload" href="/lp/fonts/space-grotesk-latin-wght.woff2" as="font" type="font/woff2" crossorigin />`,
    `<link rel="preload" as="image" type="image/avif" fetchpriority="high" media="(prefers-color-scheme: light)" imagesrcset="/lp/shots/hero-atividade-light-360.avif 360w, /lp/shots/hero-atividade-light-720.avif 720w" imagesizes="(min-width: 1024px) 300px, 80vw" />`,
    `<link rel="preload" as="image" type="image/avif" fetchpriority="high" media="(prefers-color-scheme: dark)" imagesrcset="/lp/shots/hero-atividade-dark-360.avif 360w, /lp/shots/hero-atividade-dark-720.avif 720w" imagesizes="(min-width: 1024px) 300px, 80vw" />`,

    // JSON-LD só com o que a página afirma. `<` escapado para nunca fechar o script por acidente.
    `<script type="application/ld+json">${JSON.stringify(jsonLd(siteUrl)).replace(/</g, "\\u003c")}</script>`,
  ];
  return linhas.join("\n    ");
}

/** robots.txt: fechado enquanto a publicação não for aprovada. */
export function renderRobots({ siteUrl = SITE_URL, indexable = INDEXABLE }: HeadOptions = {}): string {
  if (!indexable) return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ""}`;
}

/** sitemap.xml: só com a página indexável e o domínio definido. `null` = não gerar. */
export function renderSitemap({ siteUrl = SITE_URL, indexable = INDEXABLE }: HeadOptions = {}): string | null {
  if (!indexable || !siteUrl) return null;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n</urlset>\n`;
}
