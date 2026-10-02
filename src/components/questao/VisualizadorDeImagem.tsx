import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { COPY } from "@/lib/copy";
import type { ExerciseImage } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";
import {
  distancia,
  formatarZoom,
  limitarDeslocamento,
  passoDeZoom,
  pontoMedio,
  ZOOM_ATALHOS,
  ZOOM_INICIAL,
  ZOOM_MAX,
  ZOOM_MIN,
  zoomEmTorno,
  type EstadoZoom,
  type Ponto,
} from "./zoom";

/**
 * Visualizador de imagem da questão em tela cheia (spec 50 §5.9.3, §8): diálogo acessível com pinça
 * (Pointer Events, dois ponteiros), arrastar para mover quando ampliado, botões −/+ e 1×/2×/3×, roda do
 * mouse, duplo toque e teclado (+/= amplia, − reduz, 0 volta a 1×, setas movem). Sem dependência nova.
 *
 * Carregado sob demanda (`VisualizadorSobDemanda`): não entra no chunk do player. Diálogo pelo mesmo
 * `useDialogA11y` das folhas do app (foco no título, Tab preso, Esc fecha, foco volta ao botão da imagem,
 * fundo `inert`). Vai por portal no `<body>` porque o player anima com `transform`, que prenderia o
 * `position: fixed` dentro dele.
 */
export function VisualizadorDeImagem({
  imagem,
  titulo = COPY.questao.visualizadorTitulo,
  onClose,
  devolverFocoPara,
}: {
  imagem: ExerciseImage;
  titulo?: string;
  onClose: () => void;
  /** Onde devolver o foco se o disparador não ficou focado ao abrir (Safari não foca botão no clique). */
  devolverFocoPara?: () => HTMLElement | null;
}) {
  const tituloId = useId();
  const dicaId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [estado, setEstado] = useState<EstadoZoom>(ZOOM_INICIAL);
  const [emGesto, setEmGesto] = useState(false);

  useDialogA11y({
    open: true,
    onClose,
    dialogRef,
    rootRef,
    initialFocusRef: tituloRef,
    restoreFocusFallback: devolverFocoPara,
  });

  /** Aplica um novo estado já limitado à área visível (mede a tela na hora: a área muda ao girar o celular). */
  const aplicar = useCallback((proximo: EstadoZoom | ((atual: EstadoZoom) => EstadoZoom)) => {
    setEstado((atual) => {
      const bruto = typeof proximo === "function" ? proximo(atual) : proximo;
      const area = areaRef.current;
      const img = imgRef.current;
      if (!area || !img) return bruto;
      return limitarDeslocamento(
        bruto,
        { w: img.offsetWidth, h: img.offsetHeight },
        { w: area.clientWidth, h: area.clientHeight },
      );
    });
  }, []);

  // Girar o celular ou redimensionar a janela: refaz o limite do deslocamento.
  useEffect(() => {
    const aoRedimensionar = () => aplicar((atual) => atual);
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, [aplicar]);

  /** Ponto da tela → coordenadas a partir do centro da área. */
  const doCentro = useCallback((clienteX: number, clienteY: number): Ponto => {
    const r = areaRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clienteX - (r.left + r.width / 2), y: clienteY - (r.top + r.height / 2) };
  }, []);

  /* ---------------- ponteiros: arrastar (1) e pinça (2) ---------------- */
  const ponteiros = useRef(new Map<number, Ponto>());
  const gesto = useRef<
    | { tipo: "arrastar"; inicio: Ponto; base: EstadoZoom }
    | { tipo: "pinca"; distInicial: number; meioInicial: Ponto; base: EstadoZoom }
    | null
  >(null);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  function iniciarGesto() {
    const lista = [...ponteiros.current.values()];
    if (lista.length >= 2) {
      const [a, b] = lista;
      gesto.current = {
        tipo: "pinca",
        distInicial: Math.max(1, distancia(a, b)),
        meioInicial: pontoMedio(a, b),
        base: estadoRef.current,
      };
    } else if (lista.length === 1) {
      gesto.current = { tipo: "arrastar", inicio: lista[0], base: estadoRef.current };
    } else {
      gesto.current = null;
    }
    setEmGesto(gesto.current !== null);
  }

  function aoApertar(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      // Segue o dedo mesmo se ele sair da área. Ponteiro que o navegador não reconhece lança: o gesto segue sem a captura.
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* sem captura */
    }
    ponteiros.current.set(e.pointerId, doCentro(e.clientX, e.clientY));
    iniciarGesto();
  }

  function aoMover(e: PointerEvent<HTMLDivElement>) {
    if (!ponteiros.current.has(e.pointerId)) return;
    ponteiros.current.set(e.pointerId, doCentro(e.clientX, e.clientY));
    const g = gesto.current;
    if (!g) return;
    if (g.tipo === "pinca") {
      const [a, b] = [...ponteiros.current.values()];
      if (!a || !b) return;
      const meio = pontoMedio(a, b);
      const ampliado = zoomEmTorno(
        g.base,
        g.base.zoom * (distancia(a, b) / g.distInicial),
        g.meioInicial,
      );
      aplicar({
        zoom: ampliado.zoom,
        x: ampliado.x + (meio.x - g.meioInicial.x),
        y: ampliado.y + (meio.y - g.meioInicial.y),
      });
    } else if (g.base.zoom > ZOOM_MIN) {
      const atual = ponteiros.current.get(e.pointerId)!;
      aplicar({
        zoom: g.base.zoom,
        x: g.base.x + (atual.x - g.inicio.x),
        y: g.base.y + (atual.y - g.inicio.y),
      });
    }
  }

  function aoSoltar(e: PointerEvent<HTMLDivElement>) {
    if (!ponteiros.current.delete(e.pointerId)) return;
    // De dois para um dedo: o que ficou passa a arrastar a partir de onde está, sem salto.
    iniciarGesto();
  }

  function aoRolar(e: WheelEvent<HTMLDivElement>) {
    if (e.deltaY === 0) return;
    const foco = doCentro(e.clientX, e.clientY);
    // Fator suave por evento; roda de mouse comum dá ~100 por clique.
    const fator = Math.exp(-e.deltaY / 400);
    aplicar((atual) => {
      const novo = zoomEmTorno(atual, atual.zoom * fator, foco);
      return novo.zoom === ZOOM_MIN ? ZOOM_INICIAL : novo;
    });
  }

  function aoDuploClique(e: MouseEvent<HTMLDivElement>) {
    const foco = doCentro(e.clientX, e.clientY);
    aplicar((atual) => (atual.zoom > ZOOM_MIN ? ZOOM_INICIAL : zoomEmTorno(atual, 2, foco)));
  }

  /* ---------------- teclado ---------------- */
  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey) return; // não briga com o zoom do navegador
    const passoTela = Math.round((areaRef.current?.clientWidth ?? 320) * 0.1);
    switch (e.key) {
      case "+":
      case "=":
        e.preventDefault();
        aplicar((atual) => passoDeZoom(atual, 1));
        return;
      case "-":
      case "_":
        e.preventDefault();
        aplicar((atual) => passoDeZoom(atual, -1));
        return;
      case "0":
        e.preventDefault();
        aplicar(ZOOM_INICIAL);
        return;
      case "ArrowLeft":
      case "ArrowRight":
      case "ArrowUp":
      case "ArrowDown": {
        e.preventDefault();
        // A seta leva a vista para aquele lado: a imagem anda ao contrário.
        const dx = e.key === "ArrowLeft" ? passoTela : e.key === "ArrowRight" ? -passoTela : 0;
        const dy = e.key === "ArrowUp" ? passoTela : e.key === "ArrowDown" ? -passoTela : 0;
        aplicar((atual) => ({ ...atual, x: atual.x + dx, y: atual.y + dy }));
        return;
      }
    }
  }

  const ampliado = estado.zoom > ZOOM_MIN;
  const rotulo = formatarZoom(estado.zoom);

  const botao =
    "grid h-11 min-w-11 place-items-center rounded-lg border-2 border-gelo bg-cards px-2 font-display text-sm font-bold text-abismo disabled:opacity-40";

  return createPortal(
    <div ref={rootRef} className="fixed inset-0 z-[60]">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={dicaId}
        onKeyDown={aoTeclar}
        className="flex h-full w-full flex-col bg-neve outline-none"
      >
        <div className="flex items-center gap-2 border-b-2 border-gelo px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <h2
            id={tituloId}
            ref={tituloRef}
            tabIndex={-1}
            className="min-w-0 flex-1 truncate font-display text-base font-bold text-abismo outline-none"
          >
            {titulo}
          </h2>
          <p
            aria-live="polite"
            className="shrink-0 font-mono text-sm font-bold tabular-nums text-nevoa"
          >
            {COPY.questao.zoomAtual(rotulo)}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={COPY.questao.fechar}
            className={cn(botao, "w-11 px-0")}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p id={dicaId} className="sr-only">
          {COPY.questao.visualizadorDica}
        </p>

        <div
          ref={areaRef}
          onPointerDown={aoApertar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          onWheel={aoRolar}
          onDoubleClick={aoDuploClique}
          data-testid="visualizador-area"
          className={cn(
            "relative flex-1 touch-none select-none overflow-hidden",
            ampliado && (emGesto ? "cursor-grabbing" : "cursor-grab"),
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              ref={imgRef}
              src={imagem.url}
              alt={imagem.alt}
              width={imagem.largura}
              height={imagem.altura}
              draggable={false}
              decoding="async"
              data-zoom={estado.zoom}
              style={{
                transform: `translate3d(${estado.x}px, ${estado.y}px, 0) scale(${estado.zoom})`,
              }}
              className={cn(
                "h-auto max-h-full w-auto max-w-full rounded-lg border-2 border-gelo bg-papel-figura object-contain",
                // Botões e teclado animam; o gesto acompanha o dedo sem atraso. Sem animação com movimento reduzido.
                !emGesto &&
                  "motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out",
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t-2 border-gelo px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            className={cn(botao, "w-11 px-0")}
            aria-label={COPY.questao.diminuirZoom}
            disabled={estado.zoom <= ZOOM_MIN}
            onClick={() => aplicar((atual) => passoDeZoom(atual, -1))}
          >
            <Minus size={20} aria-hidden="true" />
          </button>
          {ZOOM_ATALHOS.map((nivel) => (
            <button
              key={nivel}
              type="button"
              aria-pressed={estado.zoom === nivel}
              className={cn(botao, estado.zoom === nivel && "border-mar bg-mar text-on-mar")}
              onClick={() =>
                aplicar((atual) => (nivel === ZOOM_MIN ? ZOOM_INICIAL : zoomEmTorno(atual, nivel)))
              }
            >
              {formatarZoom(nivel)}
            </button>
          ))}
          <button
            type="button"
            className={cn(botao, "w-11 px-0")}
            aria-label={COPY.questao.aumentarZoom}
            disabled={estado.zoom >= ZOOM_MAX}
            onClick={() => aplicar((atual) => passoDeZoom(atual, 1))}
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default VisualizadorDeImagem;
