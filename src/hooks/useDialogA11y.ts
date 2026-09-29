import { useEffect, useRef, type RefObject } from "react";

/**
 * Acessibilidade de diálogo modal (docs/36 T-08.5, RA-1, riscos B4/N5) — sem
 * biblioteca: as primitivas Radix de `components/ui/` não são usadas no app e
 * adotá-las mudaria o DOM/estilo das folhas; este hook é menor e mantém o visual.
 *
 * Enquanto `open`:
 *  - guarda o elemento que tinha o foco (o disparador) e leva o foco ao título
 *    (`initialFocusRef`) ou, na falta dele, ao próprio diálogo;
 *  - prende o Tab/Shift+Tab dentro do diálogo (o foco circula, nunca sai);
 *  - Escape chama `onClose`;
 *  - o resto da página fica `inert` (nem foco, nem clique, nem leitor de tela) —
 *    tudo que NÃO é ancestral do `rootRef`; o próprio `rootRef` fica ativo (é o
 *    lugar do scrim clicável);
 *  - o scroll do fundo é travado (`overflow: hidden` no `<body>`, com o vão da barra
 *    de rolagem compensado para o conteúdo não pular).
 * Ao fechar (ou desmontar) desfaz tudo e devolve o foco ao disparador se ele ainda
 * está no DOM — senão a `restoreFocusFallback` (ex.: o botão flutuante do tutor, que
 * é desmontado enquanto o painel está aberto e remontado ao fechar).
 *
 * Vários diálogos empilhados são suportados: `inert` e a trava de scroll são
 * contados, então fechar o de cima não solta o de baixo.
 */

const FOCAVEIS =
  'a[href], button, input, select, textarea, summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

function visivelEFocavel(el: HTMLElement): boolean {
  if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") return false;
  if (el instanceof HTMLInputElement && el.type === "hidden") return false;
  if (el.tabIndex < 0) return false;
  // `display: none` (ex.: o <input type=file class="hidden"> do tutor) não tem caixa.
  return el.getClientRects().length > 0;
}

function focaveisDe(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCAVEIS)).filter(visivelEFocavel);
}

/* ---- `inert` contado (um elemento pode ser tornado inerte por mais de um diálogo) ---- */
const inertContagem = new WeakMap<Element, number>();

function tornarInerte(el: Element) {
  const n = inertContagem.get(el) ?? 0;
  inertContagem.set(el, n + 1);
  if (n === 0) el.setAttribute("inert", "");
}
function soltarInerte(el: Element) {
  const n = (inertContagem.get(el) ?? 0) - 1;
  if (n > 0) {
    inertContagem.set(el, n);
    return;
  }
  inertContagem.delete(el);
  el.removeAttribute("inert");
}

/** Torna inerte tudo fora da cadeia de ancestrais de `root`. Devolve o desfazer. */
function isolar(root: HTMLElement): () => void {
  const afetados: Element[] = [];
  let atual: HTMLElement | null = root;
  while (atual && atual !== document.body) {
    const pai: HTMLElement | null = atual.parentElement;
    if (!pai) break;
    for (const irmao of Array.from(pai.children)) {
      if (irmao === atual) continue;
      // Não há o que focar/ler em <script>/<style>/<link>; e o <head> nunca entra (só subimos até o body).
      if (["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT"].includes(irmao.tagName)) continue;
      tornarInerte(irmao);
      afetados.push(irmao);
    }
    atual = pai;
  }
  return () => afetados.forEach(soltarInerte);
}

/* ---- trava de scroll contada ---- */
let travas = 0;
let anterior: { overflow: string; paddingRight: string } | null = null;

function travarScroll() {
  if (travas++ > 0) return;
  const body = document.body;
  anterior = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
  const vaoDaBarra = window.innerWidth - document.documentElement.clientWidth;
  if (vaoDaBarra > 0) {
    const atual = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${atual + vaoDaBarra}px`;
  }
  body.style.overflow = "hidden";
}
function soltarScroll() {
  if (--travas > 0) return;
  travas = 0;
  if (anterior) {
    document.body.style.overflow = anterior.overflow;
    document.body.style.paddingRight = anterior.paddingRight;
    anterior = null;
  }
}

export interface DialogA11yOptions {
  open: boolean;
  onClose: () => void;
  /** O painel do diálogo (`role="dialog"`): recebe o trap de Tab e é o fallback do foco inicial. */
  dialogRef: RefObject<HTMLElement | null>;
  /** Raiz de tudo o que é do diálogo (painel + scrim). Padrão: o próprio painel. Fica ativa; o resto da página vira `inert`. */
  rootRef?: RefObject<HTMLElement | null>;
  /** Quem recebe o foco ao abrir (tipicamente o título, `tabIndex={-1}`). Padrão: o painel. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Onde devolver o foco se o disparador saiu do DOM enquanto o diálogo estava aberto. */
  restoreFocusFallback?: () => HTMLElement | null;
}

export function useDialogA11y({
  open,
  onClose,
  dialogRef,
  rootRef,
  initialFocusRef,
  restoreFocusFallback,
}: DialogA11yOptions): void {
  // Sempre a versão mais recente, SEM entrar nas dependências do efeito: um `onClose`
  // inline mudaria a cada render do pai e o efeito (que devolve/rouba foco) rodaria de novo.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const fallbackRef = useRef(restoreFocusFallback);
  fallbackRef.current = restoreFocusFallback;

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const root = rootRef?.current ?? dialog;

    // `body` não é disparador: é o que `activeElement` devolve quando o botão que abriu o diálogo já foi
    // desmontado (o balão do tutor) ou quando o diálogo abre sozinho (`?capitulo=`).
    const ativoAoAbrir = document.activeElement;
    const disparador = ativoAoAbrir instanceof HTMLElement && ativoAoAbrir !== document.body ? ativoAoAbrir : null;
    const desisolar = isolar(root);
    travarScroll();

    // Foco inicial (depois do `inert`: o disparador já não é alcançável, então o foco não "volta" pra ele).
    const inicial = initialFocusRef?.current ?? dialog;
    if (!inicial.hasAttribute("tabindex") && inicial === dialog) dialog.setAttribute("tabindex", "-1");
    inicial.focus({ preventScroll: true });

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        // Só o diálogo do topo reage: com dois abertos, o de baixo está inert e sem foco dentro.
        if (dialog && !dialog.contains(document.activeElement) && document.activeElement !== document.body) return;
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const itens = focaveisDe(dialog);
      if (itens.length === 0) {
        e.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      const ativo = document.activeElement;
      if (!(ativo instanceof HTMLElement) || !itens.includes(ativo)) {
        // Foco fora do diálogo, no painel ou no título (`tabindex=-1`, fora da lista): entra pelo lado que o Tab pede.
        e.preventDefault();
        (e.shiftKey ? ultimo : primeiro).focus();
      } else if (e.shiftKey && ativo === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && ativo === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      desisolar();
      soltarScroll();
      // Devolve o foco ao disparador (ou ao fallback, se ele saiu do DOM). Só se o foco ainda está
      // dentro do diálogo que fecha ou perdido no <body> — se o usuário já foi para outro lugar, não rouba.
      const foco = document.activeElement;
      const perdido = !foco || foco === document.body || (dialog && dialog.contains(foco)) || (root && root.contains(foco));
      if (!perdido) return;
      const alvo = disparador?.isConnected ? disparador : (fallbackRef.current?.() ?? null);
      alvo?.focus({ preventScroll: true });
    };
  }, [open, dialogRef, rootRef, initialFocusRef]);
}
