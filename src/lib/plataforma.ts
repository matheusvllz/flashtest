/** Detecção de plataforma só para ajustes de interface (som no iPhone, guia de instalação). Nunca decide acesso. */
export function ehIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  // iPadOS se apresenta como Mac com toque.
  return /Macintosh/.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
}

/** O app está aberto como app instalado (Tela de Início / PWA), não numa aba do navegador. */
export function abertoComoApp(): boolean {
  if (typeof window === "undefined") return false;
  const standalone = (navigator as { standalone?: boolean }).standalone === true;
  return standalone || window.matchMedia?.("(display-mode: standalone)").matches === true;
}
