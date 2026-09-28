import { describe, expect, test } from "bun:test";
import { schemaFiles } from "../../scripts/content/schema-export";

/**
 * Schemas exportados (docs/30 §19.3, Fase 9 F9.2) — critério: "roda sem
 * diff quando nada muda" (determinístico/idempotente).
 */
describe("schemaFiles", () => {
  test("é determinístico — duas chamadas dão o mesmo conteúdo byte a byte", () => {
    expect(schemaFiles()).toEqual(schemaFiles());
  });

  test("cada schema é JSON válido", () => {
    for (const conteudo of Object.values(schemaFiles())) {
      expect(() => JSON.parse(conteudo)).not.toThrow();
    }
  });

  test("inclui item-meta.json e candidate.json", () => {
    const arquivos = schemaFiles();
    expect(Object.keys(arquivos)).toContain("item-meta.json");
    expect(Object.keys(arquivos)).toContain("candidate.json");
  });
});
