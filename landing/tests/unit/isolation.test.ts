import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { findIsolationViolations } from "../../scripts/check-isolation";

describe("isolamento da landing (docs/40 G-2)", () => {
  test("nenhum arquivo da landing importa código de fora dela", () => {
    const v = findIsolationViolations(resolve(import.meta.dir, "../.."));
    expect(v).toEqual([]);
  });

  test("o detector pega import relativo que escapa, alias @/ e require", () => {
    const dir = mkdtempSync(join(tmpdir(), "lp-iso-"));
    try {
      mkdirSync(join(dir, "src"));
      writeFileSync(join(dir, "src", "a.ts"), `import x from "../../src/lib/store";\nimport y from "@/lib/brand";\nconst z = require("../../../etc");\nimport ok from "./b";\n`);
      writeFileSync(join(dir, "src", "b.ts"), "export default 1;\n");
      const v = findIsolationViolations(dir);
      expect(v.map((x) => x.specifier).sort()).toEqual(["../../../etc", "../../src/lib/store", "@/lib/brand"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
