/**
 * Diagnóstico de rolagem da landing (spec 49 T-49.1.1, §5.7): o "teleporte" ao inverter a rolagem só acontece no
 * navegador interno do Instagram, que não deixa inspecionar a página (WKWebView não inspecionável; WebView do Android
 * só se o app permitir). Este painel mostra e guarda o que muda durante a rolagem — altura da janela, `visualViewport`,
 * altura da história, `refresh` do ScrollTrigger, troca de modo — para confirmar ou descartar as hipóteses H1–H7.
 *
 * Só carrega com `?diagnostico-rolagem=1` (`src/marketing/motion/boot.ts`; vale também em produção, DV49-02). Fica fora
 * de `src/marketing` de propósito: ouvir a rolagem e ter estilo próprio é o que as regras da landing proíbem
 * (`motion-rules.test.ts`), e este módulo não é landing, é ferramenta de depuração. Sem dependência nova, sem rede:
 * o log fica na memória e sai pelo botão "Copiar diagnóstico".
 */

interface Registro {
  t: number;
  tipo: string;
  dados: Record<string, string | number | boolean | null>;
}

const MAX_REGISTROS = 600;
/**
 * Pulo suspeito: num único evento de rolagem, a posição andou meia tela ou mais (um arrasto ou um giro de dedo rápido
 * fica bem abaixo disso por quadro). Todo evento também vai para o log, para conferir depois.
 */
const PULO_FRACAO_DA_TELA = 0.5;
const PULO_JANELA_MS = 80;

export function iniciarDiagnostico(): () => void {
  const inicio = performance.now();
  const registros: Registro[] = [];
  const html = document.documentElement;
  const story = () => document.querySelector<HTMLElement>(".lp-story");

  const foto = () => ({
    y: Math.round(window.scrollY),
    ih: window.innerHeight,
    vv: window.visualViewport ? Math.round(window.visualViewport.height) : null,
    vvTop: window.visualViewport ? Math.round(window.visualViewport.offsetTop) : null,
    doc: document.documentElement.scrollHeight,
    story: story()?.offsetHeight ?? null,
    modo: html.classList.contains("lp-story-on"),
  });

  function registrar(tipo: string, extra: Registro["dados"] = {}) {
    registros.push({ t: Math.round(performance.now() - inicio), tipo, dados: { ...foto(), ...extra } });
    if (registros.length > MAX_REGISTROS) registros.shift();
    pintar();
  }

  // Painel: pequeno, no canto, sem cobrir o conteúdo do meio; só os botões recebem toque.
  const painel = document.createElement("div");
  painel.setAttribute("data-diagnostico-rolagem", "");
  painel.style.cssText =
    "position:fixed;left:8px;bottom:8px;z-index:2147483647;max-width:min(92vw,340px);font:11px/1.35 ui-monospace,monospace;" +
    "background:rgba(20,20,20,.86);color:#fff;border-radius:10px;padding:8px;pointer-events:none;white-space:pre-wrap";
  const texto = document.createElement("div");
  const botoes = document.createElement("div");
  botoes.style.cssText = "display:flex;gap:6px;margin-top:6px;pointer-events:auto";
  const copiar = document.createElement("button");
  copiar.type = "button";
  copiar.textContent = "Copiar diagnóstico";
  const minimizar = document.createElement("button");
  minimizar.type = "button";
  minimizar.textContent = "–";
  for (const b of [copiar, minimizar]) {
    b.style.cssText = "min-height:36px;padding:0 10px;border-radius:8px;border:0;background:#fff;color:#111;font:inherit;font-weight:700";
  }
  botoes.append(copiar, minimizar);
  painel.append(texto, botoes);
  document.body.append(painel);
  let minimizado = false;

  let pulos = 0;
  let refreshes = 0;
  function pintar() {
    if (minimizado) {
      texto.textContent = `diag · pulos ${pulos}`;
      return;
    }
    const f = foto();
    const ultimos = registros
      .filter((r) => r.tipo !== "scroll")
      .slice(-5)
      .map((r) => `${r.t}ms ${r.tipo}`)
      .join("\n");
    texto.textContent =
      `y ${f.y}  ih ${f.ih}  vv ${f.vv}\nstory ${f.story}  doc ${f.doc}  modo ${f.modo ? "história" : "empilhado"}\n` +
      `refresh ${refreshes}  pulos ${pulos}  registros ${registros.length}\n${ultimos}`;
  }

  // Rolagem: direção, inversões e pulos.
  let ultimoY = window.scrollY;
  let ultimoT = performance.now();
  let direcao: 1 | -1 | 0 = 0;
  const aoRolar = () => {
    const agora = performance.now();
    const y = window.scrollY;
    const dy = y - ultimoY;
    const novaDirecao: 1 | -1 | 0 = dy > 0 ? 1 : dy < 0 ? -1 : direcao;
    if (direcao !== 0 && novaDirecao !== direcao) registrar("inverteu", { de: direcao, para: novaDirecao });
    if (Math.abs(dy) >= window.innerHeight * PULO_FRACAO_DA_TELA && agora - ultimoT <= PULO_JANELA_MS) {
      pulos++;
      registrar("PULO", { dy: Math.round(dy), ms: Math.round(agora - ultimoT) });
    } else {
      registrar("scroll", { dy: Math.round(dy) });
    }
    direcao = novaDirecao;
    ultimoY = y;
    ultimoT = agora;
  };

  const aoRedimensionar = () => registrar("resize");
  const aoMudarViewport = () => registrar("visualViewport");
  const aoGirar = () => registrar("orientationchange");
  const aoRefresh = () => {
    refreshes++;
    registrar("ScrollTrigger.refresh");
  };
  const aoRefreshInit = () => registrar("ScrollTrigger.refreshInit");
  const classes = new MutationObserver(() => registrar("classe-html", { classes: html.className }));

  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener("resize", aoRedimensionar);
  window.visualViewport?.addEventListener("resize", aoMudarViewport);
  window.addEventListener("orientationchange", aoGirar);
  window.addEventListener("lp:st-refresh", aoRefresh);
  window.addEventListener("lp:st-refresh-init", aoRefreshInit);
  classes.observe(html, { attributes: true, attributeFilter: ["class"] });
  window.__lpDiagnostico = true;

  copiar.addEventListener("click", () => {
    const cabecalho = {
      ua: navigator.userAgent,
      instagram: /Instagram/i.test(navigator.userAgent),
      dpr: window.devicePixelRatio,
      largura: window.innerWidth,
      url: location.pathname + location.search,
      quando: new Date().toISOString(),
      pulos,
      refreshes,
    };
    const conteudo = JSON.stringify({ cabecalho, registros }, null, 0);
    const feito = () => {
      copiar.textContent = "Copiado";
      setTimeout(() => (copiar.textContent = "Copiar diagnóstico"), 1500);
    };
    // Clipboard API nem sempre existe em navegador interno de app: cai para seleção manual.
    if (navigator.clipboard) void navigator.clipboard.writeText(conteudo).then(feito, () => copiarPorSelecao(conteudo, feito));
    else copiarPorSelecao(conteudo, feito);
  });
  minimizar.addEventListener("click", () => {
    minimizado = !minimizado;
    minimizar.textContent = minimizado ? "+" : "–";
    pintar();
  });

  registrar("inicio", { ua: /Instagram/i.test(navigator.userAgent) ? "instagram" : "outro" });

  return () => {
    window.removeEventListener("scroll", aoRolar);
    window.removeEventListener("resize", aoRedimensionar);
    window.visualViewport?.removeEventListener("resize", aoMudarViewport);
    window.removeEventListener("orientationchange", aoGirar);
    window.removeEventListener("lp:st-refresh", aoRefresh);
    window.removeEventListener("lp:st-refresh-init", aoRefreshInit);
    classes.disconnect();
    painel.remove();
    window.__lpDiagnostico = false;
  };
}

function copiarPorSelecao(conteudo: string, feito: () => void) {
  const area = document.createElement("textarea");
  area.value = conteudo;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0";
  document.body.append(area);
  area.select();
  try {
    if (document.execCommand("copy")) feito();
  } finally {
    area.remove();
  }
}

declare global {
  interface Window {
    __lpDiagnostico?: boolean;
  }
}
