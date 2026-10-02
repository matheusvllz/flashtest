/**
 * Roupas da Foca de corpo inteiro (spec 50 §5.3.3, T-50.3.5): camadas SVG no mesmo sistema de coordenadas do
 * `FocaCorpo` (a arte original, 1254 px), ancoradas na cabeça ou no pescoço. Só o corpo veste roupa; a cabeça
 * do `FocaMark`, a logo e o ícone nunca (§5.8.2).
 *
 * Cada roupa tem até duas camadas: `atras` (desenhada antes do corpo, ex.: a bolsa da mochila) e `frente`
 * (depois da cabeça). Cores só por token (`--foca-roupa-*`, `--foca-tinta`, `--foca-branco`, `--perola*`).
 */
import type { CSSProperties, ReactNode } from "react";
import type { FocaRoupaId } from "@/lib/brand/foca-corpo";

const preenche = (token: string, opacidade?: number): CSSProperties => ({
  fill: `var(--${token})`,
  ...(opacidade === undefined ? {} : { fillOpacity: opacidade }),
});
const traco = (token: string, largura: number, opacidade?: number): CSSProperties => ({
  fill: "none",
  stroke: `var(--${token})`,
  strokeWidth: largura,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...(opacidade === undefined ? {} : { strokeOpacity: opacidade }),
});

/** Concha de vieira: leque com dobradiça embaixo, centrada em (0,0), altura ~1. */
function Concha({ x, y, escala, giro }: { x: number; y: number; escala: number; giro: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
      <path d="M -10 48 L -52 -6 A 56 56 0 0 1 52 -6 L 10 48 Z" style={preenche("perola")} />
      <path d="M -16 54 L 16 54 L 10 42 L -10 42 Z" style={preenche("perola")} />
      <path
        d="M 0 44 L 0 -36 M 0 44 L -28 -26 M 0 44 L 28 -26 M 0 44 L -46 -8 M 0 44 L 46 -8"
        style={traco("perola-brilho", 5, 0.75)}
      />
    </g>
  );
}

const ATRAS: Partial<Record<FocaRoupaId, ReactNode>> = {
  // A bolsa fica atrás do corpo: aparece acima dos ombros, ao lado do pescoço, e abaixo das nadadeiras.
  mochila: (
    <g>
      <rect x="290" y="640" width="660" height="430" rx="76" style={preenche("foca-roupa-ouro")} />
      <rect x="290" y="640" width="660" height="430" rx="76" style={preenche("foca-tinta", 0.12)} />
    </g>
  ),
};

/** Eixo da cabeça na arte: x = 622; topo da cabeça em y = 128; olhos em (470, 390) e (777, 390). */
const FRENTE: Record<FocaRoupaId, ReactNode> = {
  bone: (
    <g>
      <path
        d="M 356 262 C 360 164 472 108 622 108 C 772 108 884 164 888 262 Z"
        style={preenche("foca-roupa-azul")}
      />
      <path
        d="M 622 116 L 622 254 M 616 118 C 538 138 484 192 474 258 M 628 118 C 706 138 760 192 770 258"
        style={traco("foca-tinta", 8, 0.22)}
      />
      <circle cx="622" cy="192" r="30" style={preenche("perola")} />
      <circle cx="612" cy="182" r="10" style={preenche("perola-brilho")} />
      <path
        d="M 334 256 C 444 232 800 232 910 256 C 926 270 916 292 892 292 C 792 272 452 272 352 292 C 328 292 318 270 334 256 Z"
        style={preenche("foca-roupa-azul")}
      />
      <path
        d="M 334 256 C 444 232 800 232 910 256 C 926 270 916 292 892 292 C 792 272 452 272 352 292 C 328 292 318 270 334 256 Z"
        style={preenche("foca-tinta", 0.28)}
      />
      <circle cx="622" cy="110" r="17" style={preenche("foca-roupa-azul")} />
      <circle cx="622" cy="110" r="17" style={preenche("foca-tinta", 0.3)} />
    </g>
  ),
  oculos: (
    <g>
      <circle cx="470" cy="390" r="112" style={preenche("foca-branco", 0.16)} />
      <circle cx="777" cy="390" r="110" style={preenche("foca-branco", 0.16)} />
      <circle cx="470" cy="390" r="112" style={traco("foca-tinta", 22)} />
      <circle cx="777" cy="390" r="110" style={traco("foca-tinta", 22)} />
      <path d="M 582 380 Q 624 354 667 380" style={traco("foca-tinta", 18)} />
      <path d="M 358 374 L 300 354 M 887 374 L 945 354" style={traco("foca-tinta", 18)} />
      <path d="M 506 316 L 540 350 M 811 316 L 845 350" style={traco("foca-branco", 12, 0.85)} />
    </g>
  ),
  cachecol: (
    <g>
      <path
        d="M 340 672 C 448 716 792 716 900 672 L 912 736 C 792 786 448 786 328 736 Z"
        style={preenche("foca-roupa-ouro")}
      />
      <path
        d="M 440 698 L 428 762 M 536 712 L 528 776 M 704 712 L 712 776 M 800 698 L 812 762"
        style={traco("foca-roupa-azul", 22)}
      />
      <path d="M 760 738 L 830 734 L 862 904 L 788 914 Z" style={preenche("foca-roupa-ouro")} />
      <path d="M 770 788 L 840 780 M 780 842 L 850 834" style={traco("foca-roupa-azul", 22)} />
      <path
        d="M 796 914 L 792 950 M 820 911 L 818 947 M 844 908 L 846 944"
        style={traco("foca-roupa-ouro", 10)}
      />
    </g>
  ),
  fone: (
    <g>
      <path d="M 284 470 A 338 338 0 0 1 960 470" style={traco("foca-roupa-azul", 36)} />
      <rect x="230" y="430" width="92" height="172" rx="42" style={preenche("foca-tinta")} />
      <rect x="310" y="454" width="34" height="124" rx="16" style={preenche("foca-roupa-azul")} />
      <rect x="922" y="430" width="92" height="172" rx="42" style={preenche("foca-tinta")} />
      <rect x="900" y="454" width="34" height="124" rx="16" style={preenche("foca-roupa-azul")} />
    </g>
  ),
  mochila: (
    <g>
      <path d="M 398 694 C 412 780 430 880 442 984" style={traco("foca-roupa-ouro", 44)} />
      <path d="M 842 694 C 828 780 810 880 798 984" style={traco("foca-roupa-ouro", 44)} />
      <rect x="414" y="836" width="48" height="26" rx="8" style={preenche("foca-tinta", 0.55)} />
      <rect x="778" y="836" width="48" height="26" rx="8" style={preenche("foca-tinta", 0.55)} />
    </g>
  ),
  "coroa-conchas": (
    <g>
      <path d="M 424 214 Q 622 66 820 214" style={traco("foca-roupa-ouro", 34)} />
      <Concha x={492} y={122} escala={1.05} giro={-28} />
      <Concha x={752} y={122} escala={1.05} giro={28} />
      <Concha x={622} y={78} escala={1.35} giro={0} />
      <circle cx="552" cy="146" r="18" style={preenche("perola-brilho")} />
      <circle cx="692" cy="146" r="18" style={preenche("perola-brilho")} />
      <circle cx="552" cy="146" r="18" style={traco("perola", 5)} />
      <circle cx="692" cy="146" r="18" style={traco("perola", 5)} />
    </g>
  ),
};

/** Uma camada de uma roupa. Sem roupa ou sem essa camada, não desenha nada. */
export function RoupaFoca({
  id,
  camada,
}: {
  id: FocaRoupaId | undefined;
  camada: "atras" | "frente";
}) {
  if (!id) return null;
  const desenho = camada === "atras" ? ATRAS[id] : FRENTE[id];
  if (!desenho) return null;
  return (
    <g data-parte={`roupa-${camada}`} data-roupa={id}>
      {desenho}
    </g>
  );
}
