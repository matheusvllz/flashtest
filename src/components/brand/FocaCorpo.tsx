/**
 * Foca de corpo inteiro (spec 50 §5.8; T-50.3.1, T-50.3.3, T-50.3.5). SVG vetorial redesenhado a partir da arte
 * original (`src/assets/branding/foca/corpo/foca-corpo-original.jpg`), no MESMO sistema de coordenadas dela
 * (1254 px), em camadas nomeadas (`data-parte`) para o movimento articular cada parte.
 *
 * Não use direto: o ponto de entrada é `<FocaMark forma="corpo" />`, que carrega este módulo sob demanda
 * (`import()`), fora da landing e do caminho da questão (§5.8.2, regra dura 9).
 *
 * Movimento (§5.8.3) em `src/styles/foca-corpo.css`: só `transform`/`opacity`; a Foca inteira nunca gira, só as
 * partes (nadadeiras, cauda); laços pausam fora da tela e com a aba oculta; aparelho fraco e movimento reduzido
 * mostram só a pose final, parada. No máximo uma Foca animada por vez: a segunda que montar fica parada.
 *
 * "Direita" e "esquerda" das partes são do ponto de vista de quem olha a tela.
 */
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  aparelhoFraco,
  focaCorpoExpressao,
  focaCorpoRosto,
  focaCorpoTemOlhosAbertos,
  focaPose,
  focaRoupa,
  FOCA_MOVIMENTO_MS,
  FOCA_PISCAR_INTERVALO_MS,
  type FocaCorpoExpressao,
  type FocaPose,
  type FocaRoupaId,
} from "@/lib/brand/foca-corpo";
import { RoupaFoca } from "./roupas/RoupaFoca";

const preenche = (token: string, opacidade?: number): CSSProperties => ({
  fill: `var(--${token})`,
  ...(opacidade === undefined ? {} : { fillOpacity: opacidade }),
});
const traco = (token: string, largura: number): CSSProperties => ({
  fill: "none",
  stroke: `var(--${token})`,
  strokeWidth: largura,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

/**
 * Moldura: quadrada, centrada no eixo da Foca (x ≈ 620 na arte), com folga em cima para roupa e para o "z"
 * do sono. Todas as medidas abaixo foram tiradas da arte original (pixels de 1254 px).
 */
const VIEWBOX = "30 20 1180 1180";

/** Olhos na arte original: branco (cx, cy, rx, ry) e pupila (px, py). */
const OLHOS = {
  esq: { cx: 470, cy: 390, rx: 87, ry: 96, px: 474, py: 395 },
  dir: { cx: 777, cy: 390, rx: 86, ry: 96, px: 774, py: 395 },
} as const;

function Olho({ lado, rosto }: { lado: "esq" | "dir"; rosto: FocaCorpoExpressao }) {
  const o = OLHOS[lado];
  let desenho;
  if (rosto === "orgulhosa") {
    // Olho fechado de sorriso (arco para cima), como na cabeça `orgulhosa`.
    desenho = (
      <path
        d={`M ${o.cx - 64} ${o.cy + 16} Q ${o.cx} ${o.cy - 62} ${o.cx + 64} ${o.cy + 16}`}
        style={traco("foca-tinta", 24)}
      />
    );
  } else if (rosto === "dormindo") {
    // Pálpebra fechada (arco para baixo).
    desenho = (
      <path
        d={`M ${o.cx - 62} ${o.cy - 2} Q ${o.cx} ${o.cy + 50} ${o.cx + 62} ${o.cy - 2}`}
        style={traco("foca-tinta", 22)}
      />
    );
  } else if (rosto === "surpresa") {
    desenho = (
      <>
        <ellipse
          cx={o.cx}
          cy={o.cy - 4}
          rx={o.rx + 4}
          ry={o.ry + 10}
          style={preenche("foca-branco")}
        />
        <circle cx={o.cx + 4} cy={o.cy + 2} r="30" style={preenche("foca-tinta")} />
        <circle cx={o.cx - 6} cy={o.cy - 10} r="9" style={preenche("foca-branco")} />
      </>
    );
  } else if (rosto === "empolgada") {
    desenho = (
      <>
        <ellipse cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} style={preenche("foca-branco")} />
        <ellipse cx={o.px} cy={o.py} rx="50" ry="62" style={preenche("foca-tinta")} />
        <circle cx={o.px - 27} cy={o.py - 35} r="22" style={preenche("foca-branco")} />
        <circle cx={o.px + 20} cy={o.py + 26} r="10" style={preenche("foca-branco")} />
      </>
    );
  } else {
    // neutra e acolhedora: o olho da arte original (pupila oval, brilho em cima à esquerda).
    desenho = (
      <>
        <ellipse cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} style={preenche("foca-branco")} />
        <ellipse cx={o.px} cy={o.py} rx="48" ry="60" style={preenche("foca-tinta")} />
        <circle cx={o.px - 27} cy={o.py - 35} r="22" style={preenche("foca-branco")} />
      </>
    );
  }
  return <g data-parte={lado === "esq" ? "olho-esq" : "olho-dir"}>{desenho}</g>;
}

/** Contorno da boca aberta grande (a da arte original). */
const BOCA_GRANDE =
  "M 478 514 C 500 540 530 562 580 565 L 660 565 C 710 562 742 540 764 514 C 772 560 740 640 690 662 C 664 676 640 682 620 682 C 600 682 576 676 550 662 C 500 640 468 560 478 514 Z";
const BOCA_PEQUENA =
  "M 564 580 C 586 596 654 596 676 580 C 682 640 646 666 620 666 C 594 666 558 640 564 580 Z";

function Boca({ rosto, clipId }: { rosto: FocaCorpoExpressao; clipId: string }) {
  let desenho;
  if (rosto === "empolgada") {
    desenho = (
      <>
        <clipPath id={clipId}>
          <path d={BOCA_GRANDE} />
        </clipPath>
        <path d={BOCA_GRANDE} style={preenche("foca-tinta")} />
        <g data-parte="lingua" clipPath={`url(#${clipId})`}>
          <ellipse cx="620" cy="650" rx="94" ry="55" style={preenche("foca-lingua")} />
        </g>
      </>
    );
  } else if (rosto === "orgulhosa") {
    desenho = (
      <>
        <clipPath id={clipId}>
          <path d={BOCA_PEQUENA} />
        </clipPath>
        <path d={BOCA_PEQUENA} style={preenche("foca-tinta")} />
        <g data-parte="lingua" clipPath={`url(#${clipId})`}>
          <ellipse cx="620" cy="664" rx="50" ry="34" style={preenche("foca-lingua")} />
        </g>
      </>
    );
  } else if (rosto === "surpresa") {
    desenho = (
      <>
        <clipPath id={clipId}>
          <ellipse cx="620" cy="616" rx="34" ry="44" />
        </clipPath>
        <ellipse cx="620" cy="616" rx="34" ry="44" style={preenche("foca-tinta")} />
        <g data-parte="lingua" clipPath={`url(#${clipId})`}>
          <ellipse cx="620" cy="660" rx="28" ry="22" style={preenche("foca-lingua")} />
        </g>
      </>
    );
  } else if (rosto === "acolhedora") {
    // Sorriso fechado largo (meia-lua), como na cabeça `acolhedora`.
    desenho = (
      <path
        d="M 498 566 C 544 642 696 642 742 566 C 700 614 540 614 498 566 Z"
        style={{
          fill: "var(--foca-tinta)",
          stroke: "var(--foca-tinta)",
          strokeWidth: 12,
          strokeLinejoin: "round",
        }}
      />
    );
  } else if (rosto === "dormindo") {
    desenho = <path d="M 588 600 Q 620 616 652 600" style={traco("foca-tinta", 14)} />;
  } else {
    // neutra: linha calma, levemente curvada.
    desenho = <path d="M 548 600 Q 620 620 692 600" style={traco("foca-tinta", 16)} />;
  }
  return <g data-parte="boca">{desenho}</g>;
}

/** Mancha da bochecha esquerda (com a parte de baixo mais clara); a direita é o espelho (eixo x = 622). */
function Mancha() {
  return (
    <>
      <path
        d="M 336 444 C 350 452 361 478 361 500 C 361 508 360 512 358 514 C 372 518 386 528 384 540 C 382 556 356 570 322 570 C 296 570 280 556 277 534 C 275 500 296 462 336 444 Z"
        style={preenche("foca-pele-escura")}
      />
      <path
        d="M 358 514 C 330 524 306 542 290 562 C 300 568 310 570 322 570 C 356 570 382 556 384 540 C 386 528 372 518 358 514 Z"
        style={preenche("foca-pele", 0.45)}
      />
    </>
  );
}

/**
 * Nadadeira esquerda (a direita é o espelho no eixo x = 619). A base entra sob o corpo: girando no ombro
 * (≈ 372, 805), a raiz some dentro do corpo e só a ponta se mexe.
 */
function Nadadeira() {
  return (
    <>
      <path
        d="M 410 740 C 360 722 310 722 266 740 C 220 766 180 784 160 802 C 146 818 144 846 160 864 C 180 888 220 904 270 906 C 310 908 345 900 365 880 C 390 860 410 830 410 800 Z"
        style={preenche("foca-pele")}
      />
      <path
        d="M 348 748 C 300 760 230 790 205 815 C 192 832 198 858 222 866 C 262 878 310 852 335 820 C 352 798 356 770 348 748 Z"
        style={preenche("foca-pele-escura")}
      />
    </>
  );
}

/** Um "z" do sono, em traço de grafite (cor de interface, acompanha o tema). */
function Z({ x, y, escala, ordem }: { x: number; y: number; escala: number; ordem: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <g data-parte="z" data-ordem={ordem}>
        <path d="M 0 0 H 44 L 0 44 H 44" style={traco("abismo", 10)} />
      </g>
    </g>
  );
}

/** Só uma Foca anima por vez (§5.8.3): quem chegou primeiro fica com o movimento até desmontar. */
let donoDoMovimento: symbol | null = null;

function querMenosMovimento() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export interface FocaCorpoProps {
  /** Rosto. A pose `dormindo` fecha os olhos seja qual for. Valor fora do corpo vira `neutra`. */
  expressao?: FocaCorpoExpressao;
  pose?: FocaPose;
  roupa?: FocaRoupaId;
  /** Lado em px (a Foca é sempre quadrada). */
  size?: number;
  /** true = puramente visual: sai da árvore de acessibilidade. */
  decorative?: boolean;
  /** Nome acessível (padrão "Foca"). */
  title?: string;
  className?: string;
  /** false = nunca anima (pranchas, listas). */
  animar?: boolean;
}

export function FocaCorpo({
  expressao = "neutra",
  pose = "parada",
  roupa,
  size = 120,
  decorative = false,
  title,
  className,
  animar = true,
}: FocaCorpoProps) {
  const id = useId().replace(/:/g, "");
  const tituloId = `${id}-titulo`;
  const poseValida = focaPose(pose);
  const roupaValida = focaRoupa(roupa);
  const pedida = focaCorpoRosto(focaCorpoExpressao(expressao), poseValida);

  const caixa = useRef<HTMLSpanElement>(null);
  const [ativa, setAtiva] = useState(false);
  const [leve, setLeve] = useState(false);
  const [piscando, setPiscando] = useState(false);
  const [rosto, setRosto] = useState(pedida);

  // Troca de expressão com a Foca na tela: pisca e troca o rosto no fundo da piscada (como o FocaMark).
  useEffect(() => {
    if (pedida === rosto) return;
    if (!ativa) {
      setRosto(pedida);
      return;
    }
    setPiscando(true);
    const t1 = setTimeout(() => setRosto(pedida), FOCA_MOVIMENTO_MS.piscar / 2);
    const t2 = setTimeout(() => setPiscando(false), FOCA_MOVIMENTO_MS.piscar);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // `rosto` fora das dependências de propósito: o efeito reage só ao rosto PEDIDO.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedida]);

  // Liga o movimento só com a Foca visível, aba aberta, aparelho capaz e sem movimento reduzido.
  useEffect(() => {
    if (!animar) return;
    const el = caixa.current;
    if (!el) return;
    if (querMenosMovimento() || aparelhoFraco(navigator as Navigator & { deviceMemory?: number })) {
      setLeve(true);
      return;
    }
    if (donoDoMovimento) {
      setLeve(true);
      return;
    }
    const eu = Symbol("foca");
    donoDoMovimento = eu;
    let naTela = false;
    const atualizar = () => setAtiva(naTela && document.visibilityState === "visible");
    const observador =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entradas) => {
            naTela = entradas.some((e) => e.isIntersecting);
            atualizar();
          });
    if (observador) observador.observe(el);
    else naTela = true;
    atualizar();
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      observador?.disconnect();
      document.removeEventListener("visibilitychange", atualizar);
      if (donoDoMovimento === eu) donoDoMovimento = null;
    };
  }, [animar]);

  // Piscar com intervalo aleatório (4–7 s), só com olhos abertos e o movimento ligado.
  useEffect(() => {
    if (!ativa || !focaCorpoTemOlhosAbertos(rosto)) return;
    let fim: ReturnType<typeof setTimeout> | undefined;
    let proxima: ReturnType<typeof setTimeout>;
    const [min, max] = FOCA_PISCAR_INTERVALO_MS;
    const agendar = () => {
      proxima = setTimeout(
        () => {
          setPiscando(true);
          fim = setTimeout(() => {
            setPiscando(false);
            agendar();
          }, FOCA_MOVIMENTO_MS.piscar);
        },
        min + Math.random() * (max - min),
      );
    };
    agendar();
    return () => {
      clearTimeout(proxima);
      if (fim) clearTimeout(fim);
    };
  }, [ativa, rosto]);

  const rotulo = title ?? "Foca";
  return (
    <span
      ref={caixa}
      className={["foca-corpo", className].filter(Boolean).join(" ")}
      data-pose={poseValida}
      data-rosto={rosto}
      data-ativa={ativa ? "sim" : undefined}
      data-leve={leve ? "sim" : undefined}
      data-piscando={piscando ? "sim" : undefined}
      style={{ display: "inline-block", width: size, height: size, flexShrink: 0, lineHeight: 0 }}
    >
      <svg
        className="fc-svg"
        viewBox={VIEWBOX}
        width={size}
        height={size}
        role={decorative ? undefined : "img"}
        aria-hidden={decorative ? true : undefined}
        aria-labelledby={decorative ? undefined : tituloId}
        focusable="false"
        overflow="visible"
      >
        {decorative ? null : <title id={tituloId}>{rotulo}</title>}
        <g className="fc-respira" data-parte="figura">
          <RoupaFoca id={roupaValida} camada="atras" />
          <g data-parte="cauda">
            <path
              d="M 870 1040 C 880 1010 895 990 904 984 C 910 950 945 926 985 924 C 1020 924 1034 952 1031 975 C 1030 990 1026 998 1022 1003 C 1060 1006 1100 1022 1103 1052 C 1106 1084 1060 1104 1010 1107 C 970 1108 940 1098 928 1088 C 910 1084 890 1072 870 1040 Z"
              style={preenche("foca-pele")}
            />
          </g>
          <g data-parte="corpo">
            <path
              d="M 352 640 C 350 668 340 688 328 700 C 316 712 300 724 284 735 C 330 770 360 820 363 885 C 364 960 380 1020 420 1056 C 480 1110 580 1146 700 1147 C 800 1148 880 1120 915 1090 C 940 1060 900 1020 888 1000 C 874 975 868 940 868 885 C 870 820 900 770 954 735 C 938 724 922 712 910 700 C 898 688 888 668 886 640 Z"
              style={preenche("foca-pele")}
            />
          </g>
          <g data-parte="nadadeira-esq">
            <Nadadeira />
          </g>
          <g data-parte="nadadeira-dir">
            <g transform="matrix(-1 0 0 1 1238 0)">
              <Nadadeira />
            </g>
          </g>
          <g data-parte="barriga">
            <path
              d="M 616 745 C 680 744 740 736 760 740 C 790 760 803 820 802 890 C 800 960 770 1020 700 1052 C 670 1064 640 1068 616 1068 C 590 1068 560 1064 534 1052 C 466 1020 431 960 431 890 C 431 820 444 760 476 740 C 494 736 552 744 616 745 Z"
              style={preenche("foca-barriga")}
            />
          </g>
          <g data-parte="cabeca">
            <ellipse cx="622" cy="442" rx="318" ry="314" style={preenche("foca-pele")} />
            <circle cx="346" cy="525" r="110" style={preenche("foca-pele")} />
            <circle cx="898" cy="525" r="110" style={preenche("foca-pele")} />
            <path
              d="M 270 560 L 974 560 L 952 620 Q 914 638 888 676 L 356 676 Q 330 638 292 620 Z"
              style={preenche("foca-pele")}
            />
            <g data-parte="manchas">
              <Mancha />
              <g transform="matrix(-1 0 0 1 1244 0)">
                <Mancha />
              </g>
            </g>
            <Olho lado="esq" rosto={rosto} />
            <Olho lado="dir" rosto={rosto} />
            <g data-parte="focinho">
              <path
                d="M 623 446 C 680 446 712 462 710 484 C 708 508 660 546 621 547 C 584 546 536 508 536 484 C 534 462 566 446 623 446 Z"
                style={preenche("foca-tinta")}
              />
            </g>
            <Boca rosto={rosto} clipId={`${id}-boca`} />
          </g>
          <RoupaFoca id={roupaValida} camada="frente" />
          {rosto === "dormindo" ? (
            <g data-parte="sono">
              <Z x={930} y={250} escala={1} ordem={1} />
              <Z x={1000} y={160} escala={1.3} ordem={2} />
              <Z x={1080} y={60} escala={1.6} ordem={3} />
            </g>
          ) : null}
        </g>
      </svg>
    </span>
  );
}
