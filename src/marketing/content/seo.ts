import { INDEXABLE, SITE_URL } from "../config";
import { LP } from "./copy";

// Head da landing (rota `/`, docs/40 §18, docs/44 §7): título, descrição, robots, canonical, Open Graph, Twitter e
// JSON-LD, a partir das MESMAS strings de copy.ts. Ícones, manifest, theme-color e o preload da fonte de título são
// do app inteiro e moram no head da raiz (src/routes/__root.tsx). Sem preço, nota, avaliação nem FAQPage no JSON-LD.

export interface HeadOptions {
  siteUrl?: string;
  indexable?: boolean;
}

/** Imagem de compartilhamento da landing (gerada por scripts/marketing/og-image.ts). */
export const OG_IMAGE_PATH = "/og/og-landing.png";

export function jsonLd(siteUrl: string) {
  const abs = (p: string) => (siteUrl ? `${siteUrl}${p}` : p);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: LP.marca, ...(siteUrl ? { url: `${siteUrl}/` } : {}), inLanguage: LP.meta.lang },
      { "@type": "Organization", name: LP.marca, ...(siteUrl ? { url: `${siteUrl}/` } : {}), logo: abs("/branding/foca/icon-512.png") },
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

type Meta = { title?: string; name?: string; property?: string; content?: string };

/** Meta tags da landing no formato do `head()` do TanStack Router. */
export function landingMeta({ siteUrl = SITE_URL, indexable = INDEXABLE }: HeadOptions = {}): Meta[] {
  const { title, description, ogAlt } = LP.meta;
  const abs = (p: string) => (siteUrl ? `${siteUrl}${p}` : p);
  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: indexable ? "index, follow" : "noindex, nofollow" },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "pt_BR" },
    { property: "og:site_name", content: LP.marca },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(siteUrl ? [{ property: "og:url", content: `${siteUrl}/` }] : []),
    { property: "og:image", content: abs(OG_IMAGE_PATH) },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: ogAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: abs(OG_IMAGE_PATH) },
    { name: "twitter:image:alt", content: ogAlt },
  ];
}

/** Canonical só com domínio definido. */
export function landingLinks({ siteUrl = SITE_URL }: HeadOptions = {}): { rel: string; href: string }[] {
  return siteUrl ? [{ rel: "canonical", href: `${siteUrl}/` }] : [];
}

/** JSON-LD serializado com `<` escapado (nunca fecha o script por acidente). */
export function landingJsonLd(siteUrl = SITE_URL): string {
  return JSON.stringify(jsonLd(siteUrl)).replace(/</g, "\\u003c");
}
