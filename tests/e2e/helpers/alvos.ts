import type { Page } from "@playwright/test";

/**
 * Alvos de toque (docs/36 RA-2, T-08.8): todo controle visível e clicável precisa de uma área
 * de acerto de pelo menos 44×44 px. O visual pode ser menor (o `chip` tem 36 px) se um
 * `::after` amplia a área — por isso a medida não é só `getBoundingClientRect`: para o que
 * fica abaixo de 44 no retângulo, o teste faz `elementFromPoint` nos cantos e no meio dos
 * lados de uma caixa 44×44 centrada no controle; se todos os pontos acertam o próprio controle
 * (ou um descendente), a área expandida existe DE VERDADE (e não é engolida por um vizinho).
 */
export const ALVO_MIN = 44;

export type AlvoPequeno = {
  descricao: string;
  largura: number;
  altura: number;
  /** pontos da caixa 44×44 que NÃO acertam o controle (só para o que passou do retângulo cru) */
  pontosFora: number;
};

const SELETOR = 'button, a[href], [role="button"], [role="radio"], [role="tab"], select, input:not([type="hidden"]), textarea, summary';

/**
 * Lista controles visíveis com área de acerto efetiva < 44 px em algum eixo.
 * `escopo` (seletor CSS) limita a busca (ex.: um diálogo). `ignorar` descarta por seletor.
 */
export async function alvosPequenos(page: Page, opts: { escopo?: string; ignorar?: string[] } = {}): Promise<AlvoPequeno[]> {
  return page.evaluate(
    ({ SELETOR, ALVO_MIN, escopo, ignorar }) => {
      const raiz: ParentNode = escopo ? (document.querySelector(escopo) ?? document) : document;
      const nomeDe = (el: Element) => {
        const h = el as HTMLElement;
        const rotulo = h.getAttribute("aria-label") || (h.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
        const cls = (h.getAttribute("class") ?? "").split(/\s+/).slice(0, 3).join(".");
        return `<${el.tagName.toLowerCase()}${cls ? "." + cls : ""}> "${rotulo}"`;
      };
      const resultado: { descricao: string; largura: number; altura: number; pontosFora: number }[] = [];
      for (const el of Array.from(raiz.querySelectorAll<HTMLElement>(SELETOR))) {
        if (ignorar.some((s) => el.matches(s) || el.closest(s))) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.pointerEvents === "none") continue;
        if ((el as HTMLInputElement).disabled) continue;
        if (el.closest("[inert]") || el.closest("[hidden]")) continue;
        // `<input type=radio|checkbox>` escondido dentro de <label> grande: mede o <label>.
        let r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.width >= ALVO_MIN && r.height >= ALVO_MIN) continue;
        // Retângulo cru < 44: traz o controle para o meio da janela (como o dedo faria rolando) e confere a área expandida.
        el.scrollIntoView({ block: "center", inline: "nearest" });
        r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const m = ALVO_MIN / 2 - 1;
        const pontos: [number, number][] = [
          [cx - m, cy - m],
          [cx + m, cy - m],
          [cx - m, cy + m],
          [cx + m, cy + m],
          [cx, cy - m],
          [cx, cy + m],
          [cx - m, cy],
          [cx + m, cy],
        ];
        // Ainda fora da janela depois de rolar (ex.: preso num contêiner que não rola): não dá para tocar, não entra na conta.
        if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
        let fora = 0;
        for (const [x, y] of pontos) {
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
          const alvo = document.elementFromPoint(x, y);
          if (!alvo || !(alvo === el || el.contains(alvo))) fora++;
        }
        // Um <label> envolvendo o controle também conta como área de toque.
        const rotuloEnvolvente = el.closest("label");
        if (rotuloEnvolvente) {
          const lr = rotuloEnvolvente.getBoundingClientRect();
          if (lr.width >= ALVO_MIN && lr.height >= ALVO_MIN) continue;
        }
        if (fora === 0) continue;
        resultado.push({ descricao: nomeDe(el), largura: Math.round(r.width * 10) / 10, altura: Math.round(r.height * 10) / 10, pontosFora: fora });
      }
      return resultado;
    },
    { SELETOR, ALVO_MIN, escopo: opts.escopo ?? null, ignorar: opts.ignorar ?? [] },
  );
}

export function formatarAlvos(lista: AlvoPequeno[]): string {
  return lista.map((a) => `${a.descricao} ${a.largura}×${a.altura} (${a.pontosFora}/8 pontos fora)`).join("\n");
}
