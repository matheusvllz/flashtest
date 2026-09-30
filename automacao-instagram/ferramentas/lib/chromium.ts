/**
 * Acha o Chromium que o Playwright ja instalou na maquina (cache do usuario) em vez de
 * baixar outro dentro desta pasta. Se nao houver nenhum, diz o comando exato para instalar.
 */
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CACHES = [
  process.env.PLAYWRIGHT_BROWSERS_PATH,
  join(homedir(), "AppData", "Local", "ms-playwright"),
  join(homedir(), ".cache", "ms-playwright"),
  join(homedir(), "Library", "Caches", "ms-playwright"),
].filter(Boolean) as string[];

export function acharChromium(): string {
  for (const cache of CACHES) {
    if (!existsSync(cache)) continue;
    const dirs = readdirSync(cache)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const d of dirs) {
      for (const rel of [
        ["chrome-win64", "chrome.exe"],
        ["chrome-win", "chrome.exe"],
        ["chrome-linux", "chrome"],
        ["chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"],
      ]) {
        const exe = join(cache, d, ...rel);
        if (existsSync(exe)) return exe;
      }
    }
  }
  throw new Error(
    "Chromium do Playwright nao encontrado. Instale uma vez com:\n  npx playwright install chromium\n(ou defina PLAYWRIGHT_BROWSERS_PATH para o cache existente)",
  );
}
