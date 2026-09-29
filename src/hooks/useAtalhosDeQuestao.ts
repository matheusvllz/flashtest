import { useEffect } from "react";

/**
 * Atalhos de teclado das telas de questão (docs/44 §5, desktop de primeira classe):
 *  - `1`…`5` ou `A`…`E` escolhem a alternativa na ordem em que aparece;
 *  - `Enter` aciona a ação principal da tela (Verificar, Continuar, Responder), marcada com `data-acao-principal`;
 *  - `Esc` continua com os diálogos (useDialogA11y), não aqui.
 *
 * Opções reconhecidas: `[role="radiogroup"] [role="radio"]` (exercícios) e `[data-opcao]` (Praticar). Um lugar só,
 * sem lógica de teclado espalhada pelos players. Nunca age com o foco num campo de texto, com modificador, nem com a
 * Foca IA aberta (o teclado é da conversa). Enter com o foco num botão comum deixa o comportamento nativo; com o
 * foco numa alternativa, confirma em vez de desmarcá-la.
 */
export function useAtalhosDeQuestao(ativo = true): void {
  useEffect(() => {
    if (!ativo) return;
    const visivel = (el: HTMLElement) => el.getClientRects().length > 0 && !el.closest("[inert], [aria-hidden='true']");
    const habilitado = (el: HTMLElement) => !(el as HTMLButtonElement).disabled && el.getAttribute("aria-disabled") !== "true";

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
      const alvo = e.target as HTMLElement | null;
      if (alvo && (alvo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName))) return;
      if (document.querySelector("[data-tutor-painel]")) return;

      const tecla = e.key.toLowerCase();
      const idx = tecla.length === 1 ? Math.max("12345".indexOf(tecla), "abcde".indexOf(tecla)) : -1;
      if (idx >= 0) {
        const opcoes = Array.from(document.querySelectorAll<HTMLElement>("[role='radiogroup'] [role='radio'], [data-opcao]")).filter(
          (el) => visivel(el) && habilitado(el),
        );
        const opcao = opcoes[idx];
        if (!opcao) return;
        e.preventDefault();
        if (opcao.getAttribute("aria-checked") !== "true") opcao.click();
        opcao.focus({ preventScroll: true });
        return;
      }

      if (e.key === "Enter") {
        const naOpcao = !!alvo?.closest("[role='radio'], [data-opcao]");
        if (!naOpcao && alvo?.closest("button, a, summary, [role='button']")) return;
        const acoes = Array.from(document.querySelectorAll<HTMLElement>("[data-acao-principal]")).filter((el) => visivel(el) && habilitado(el));
        const acao = acoes.at(-1);
        if (!acao) return;
        e.preventDefault();
        acao.click();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [ativo]);
}
