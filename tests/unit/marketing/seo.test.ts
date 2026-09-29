import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LP } from "../../../src/marketing/content/copy";
import { jsonLd, landingJsonLd, landingLinks, landingMeta, OG_IMAGE_PATH } from "../../../src/marketing/content/seo";

// SEO da landing integrada (docs/40 §18, docs/44 §7): o head vem do `head()` da rota `/`; ícones, manifest e
// theme-color são do app inteiro (head da raiz).
const SITE = "https://foca.exemplo.com.br";
const RAIZ = resolve(import.meta.dir, "../../..");
const conteudo = (m: ReturnType<typeof landingMeta>, chave: string) =>
  m.find((x) => x.name === chave || x.property === chave)?.content;

describe("head da landing", () => {
  const padrao = landingMeta({ siteUrl: "", indexable: true });

  test("título e descrição dentro dos limites", () => {
    expect(LP.meta.title.length).toBeLessThanOrEqual(60);
    expect(LP.meta.description.length).toBeLessThanOrEqual(160);
    expect(padrao.find((m) => m.title)?.title).toBe(LP.meta.title);
    expect(conteudo(padrao, "description")).toBe(LP.meta.description);
  });

  test("indexável por padrão (docs/44 §7); desligável para ambiente de teste público", () => {
    expect(conteudo(padrao, "robots")).toBe("index, follow");
    expect(conteudo(landingMeta({ siteUrl: "", indexable: false }), "robots")).toBe("noindex, nofollow");
  });

  test("sem domínio: sem canonical nem og:url; com domínio: canonical, og:url e imagens absolutas", () => {
    expect(landingLinks({ siteUrl: "" })).toEqual([]);
    expect(conteudo(padrao, "og:url")).toBeUndefined();
    const com = landingMeta({ siteUrl: SITE, indexable: true });
    expect(landingLinks({ siteUrl: SITE })).toEqual([{ rel: "canonical", href: `${SITE}/` }]);
    expect(conteudo(com, "og:url")).toBe(`${SITE}/`);
    expect(conteudo(com, "og:image")).toBe(`${SITE}${OG_IMAGE_PATH}`);
    expect(conteudo(com, "twitter:image")).toBe(`${SITE}${OG_IMAGE_PATH}`);
  });

  test("Open Graph e Twitter completos, em pt_BR", () => {
    for (const [k, v] of [["og:type", "website"], ["og:locale", "pt_BR"], ["og:site_name", "Foca"], ["og:image:width", "1200"], ["og:image:height", "630"], ["twitter:card", "summary_large_image"]]) {
      expect(conteudo(padrao, k)).toBe(v);
    }
    for (const k of ["og:title", "og:description", "og:image:alt", "twitter:title", "twitter:description", "twitter:image:alt"]) expect(conteudo(padrao, k)).toBeTruthy();
  });

  test("nenhum travessão no head", () => {
    expect(JSON.stringify(padrao)).not.toMatch(/[—–]/);
  });
});

describe("JSON-LD", () => {
  const json = jsonLd(SITE);
  test("WebSite, Organization e WebApplication; nada de preço, nota nem FAQPage", () => {
    expect(json["@graph"].map((n) => n["@type"])).toEqual(["WebSite", "Organization", "WebApplication"]);
    expect(JSON.stringify(json)).not.toMatch(/offers|price|aggregateRating|reviewRating|FAQPage|Question/i);
  });
  test("o script serializado é JSON válido e não fecha a tag por acidente", () => {
    const s = landingJsonLd(SITE);
    expect(s).not.toContain("<");
    expect(() => JSON.parse(s)).not.toThrow();
  });
});

describe("arquivos públicos", () => {
  test("robots.txt libera o site (o produto é noindex pela meta tag, não por bloqueio de rastreio)", () => {
    const robots = readFileSync(resolve(RAIZ, "public/robots.txt"), "utf8");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).not.toContain("Disallow: /\n");
  });
  test("a imagem de compartilhamento da landing existe", () => {
    expect(existsSync(resolve(RAIZ, "public", OG_IMAGE_PATH.slice(1)))).toBe(true);
  });
  test("o head da raiz marca o produto como noindex e a rota / sobrescreve", () => {
    const raiz = readFileSync(resolve(RAIZ, "src/routes/__root.tsx"), "utf8");
    expect(raiz).toContain(`{ name: "robots", content: "noindex, nofollow" }`);
    const index = readFileSync(resolve(RAIZ, "src/routes/index.tsx"), "utf8");
    expect(index).toContain("landingMeta()");
  });
});
