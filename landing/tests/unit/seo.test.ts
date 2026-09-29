import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LP } from "../../src/content/copy";
import { jsonLd, renderHead, renderRobots, renderSitemap } from "../../src/content/seo";

// SEO e compartilhamento (docs/40 §18, G-21).
const SITE = "https://foca.exemplo.com.br";

describe("head", () => {
  const padrao = renderHead({ siteUrl: "", indexable: false });

  test("título e descrição dentro dos limites", () => {
    expect(LP.meta.title.length).toBeLessThanOrEqual(60);
    expect(LP.meta.description.length).toBeLessThanOrEqual(160);
    expect(padrao).toContain(`<title>${LP.meta.title}</title>`);
    expect(padrao).toContain(`name="description"`);
  });

  test("noindex por padrão e index só quando liberado", () => {
    expect(padrao).toContain(`content="noindex, nofollow"`);
    expect(renderHead({ siteUrl: SITE, indexable: true })).toContain(`content="index, follow"`);
  });

  test("sem domínio: sem canonical nem og:url; com domínio: canonical, og:url e imagens absolutas", () => {
    expect(padrao).not.toContain("canonical");
    expect(padrao).not.toContain("og:url");
    const com = renderHead({ siteUrl: SITE, indexable: true });
    expect(com).toContain(`<link rel="canonical" href="${SITE}/" />`);
    expect(com).toContain(`property="og:url" content="${SITE}/"`);
    expect(com).toContain(`property="og:image" content="${SITE}/lp/og/og-landing.png"`);
    expect(com).toContain(`name="twitter:image" content="${SITE}/lp/og/og-landing.png"`);
  });

  test("Open Graph e Twitter completos, em pt_BR", () => {
    for (const t of [`og:type" content="website"`, `og:locale" content="pt_BR"`, `og:site_name" content="Foca"`, `og:title`, `og:description`, `og:image:width" content="1200"`, `og:image:height" content="630"`, `og:image:alt`, `twitter:card" content="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image:alt`]) {
      expect(padrao).toContain(t);
    }
  });

  test("ícones e preloads do que o primeiro pixel precisa", () => {
    expect(padrao).toContain(`rel="icon" href="/favicon.ico"`);
    expect(padrao).toContain(`rel="apple-touch-icon"`);
    expect(padrao).toContain(`space-grotesk-latin-wght.woff2`);
    expect(padrao).toContain(`hero-atividade-light-720.avif`);
    expect(padrao).toContain(`hero-atividade-dark-720.avif`);
    expect(padrao).toContain(`fetchpriority="high"`);
  });

  test("nenhum travessão no head", () => {
    expect(padrao).not.toMatch(/[—–]/);
  });
});

describe("JSON-LD", () => {
  const json = jsonLd(SITE);
  const tipos = json["@graph"].map((n) => n["@type"]);

  test("WebSite, Organization e WebApplication; nada de preço, nota nem FAQPage", () => {
    expect(tipos).toEqual(["WebSite", "Organization", "WebApplication"]);
    const texto = JSON.stringify(json);
    expect(texto).not.toMatch(/offers|price|aggregateRating|reviewRating|FAQPage|Question/i);
  });

  test("o script do head é JSON válido", () => {
    const head = renderHead({ siteUrl: SITE, indexable: true });
    const m = head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(m).not.toBeNull();
    expect(() => JSON.parse(m![1])).not.toThrow();
  });
});

describe("robots e sitemap", () => {
  test("robots fechado por padrão", () => {
    expect(renderRobots({ siteUrl: "", indexable: false })).toBe("User-agent: *\nDisallow: /\n");
  });
  test("robots aberto com sitemap quando liberado", () => {
    expect(renderRobots({ siteUrl: SITE, indexable: true })).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });
  test("sitemap só com a página indexável e o domínio definido", () => {
    expect(renderSitemap({ siteUrl: "", indexable: true })).toBeNull();
    expect(renderSitemap({ siteUrl: SITE, indexable: false })).toBeNull();
    expect(renderSitemap({ siteUrl: SITE, indexable: true })).toContain(`<loc>${SITE}/</loc>`);
  });
});

describe("build pré-renderizado (roda se dist/ existir)", () => {
  const dist = resolve(import.meta.dir, "../../dist");
  const pronto = existsSync(resolve(dist, "index.html"));
  const html = pronto ? readFileSync(resolve(dist, "index.html"), "utf8") : "";

  test.skipIf(!pronto)("um <title>, um <h1>, robots noindex e JSON-LD no HTML final", () => {
    expect((html.match(/<title>/g) ?? []).length).toBe(1);
    expect((html.match(/<h1[ >]/g) ?? []).length).toBe(1);
    expect(html).toContain(`content="noindex, nofollow"`);
    expect(html).toContain("application/ld+json");
    expect(html).not.toContain("<!--app-html-->");
    expect(html).not.toContain("Foca (dev)");
    expect(html).not.toMatch(/[—–]/);
  });

  test.skipIf(!pronto)("dist/robots.txt fecha o site e não há sitemap sem domínio", () => {
    expect(readFileSync(resolve(dist, "robots.txt"), "utf8")).toContain("Disallow: /");
    expect(existsSync(resolve(dist, "sitemap.xml"))).toBe(false);
  });

  test.skipIf(!pronto)("a imagem de compartilhamento e o favicon existem no build", () => {
    expect(existsSync(resolve(dist, "lp/og/og-landing.png"))).toBe(true);
    expect(existsSync(resolve(dist, "favicon.ico"))).toBe(true);
  });
});
