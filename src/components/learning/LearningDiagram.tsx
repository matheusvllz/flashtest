import type { DiagramBlock } from "@/lib/learning/types";

/**
 * Diagramas controlados (docs/20 §8.3/§8.4) — SVG desenhado à mão pelo
 * design system, nunca HTML/JS vindo do conteúdo. `kind` é um union fechado:
 * conteúdo novo pede um `kind` novo aqui, não um `dangerouslySetInnerHTML`.
 * Cor nunca é a única codificação, e a descrição acessível é sempre visível
 * como texto — não é um `alt` escondido de um `<img>`.
 */
export function LearningDiagram({ block }: { block: DiagramBlock }) {
  return (
    <figure className="card-soft space-y-2 p-4">
      <div role="img" aria-label={block.accessibleDescription} className="flex justify-center">
        {block.kind === "membrana-celular" ? <MembranaCelularSvg /> : <FatorPercentualSvg />}
      </div>
      {block.caption && (
        <figcaption className="text-center text-xs font-semibold text-nevoa">
          {block.caption}
        </figcaption>
      )}
      <p className="text-[13px] leading-relaxed text-abismo">{block.accessibleDescription}</p>
    </figure>
  );
}

/** Corte transversal simplificado da bicamada de fosfolipídios com duas proteínas atravessando. */
function MembranaCelularSvg() {
  const cabecas = [20, 50, 80, 110, 140, 170, 200, 230, 260];
  return (
    <svg viewBox="0 0 280 120" width="260" height="112" aria-hidden focusable="false">
      {cabecas.map((x) => (
        <g key={`topo-${x}`}>
          <circle cx={x} cy={20} r={10} className="fill-mar/70" />
          <path d={`M${x} 30 L${x} 55`} className="stroke-abismo" strokeWidth={3} />
        </g>
      ))}
      {cabecas.map((x) => (
        <g key={`base-${x}`}>
          <circle cx={x} cy={100} r={10} className="fill-mar/70" />
          <path d={`M${x} 90 L${x} 65`} className="stroke-abismo" strokeWidth={3} />
        </g>
      ))}
      {/* Duas proteínas atravessando a bicamada. */}
      <rect x={65} y={35} width={18} height={50} rx={8} className="fill-recompensa" />
      <rect x={175} y={30} width={18} height={60} rx={8} className="fill-recompensa" />
    </svg>
  );
}

/** Reta numérica com o fator 1 ao centro, desconto à esquerda e aumento à direita. */
function FatorPercentualSvg() {
  return (
    <svg viewBox="0 0 280 90" width="260" height="84" aria-hidden focusable="false">
      <line x1={20} y1={45} x2={260} y2={45} className="stroke-gelo" strokeWidth={3} />
      <circle cx={140} cy={45} r={6} className="fill-abismo" />
      <text x={140} y={70} textAnchor="middle" className="fill-abismo text-[11px] font-bold">
        1 (sem mudança)
      </text>

      <circle cx={70} cy={45} r={6} className="fill-error" />
      <text x={70} y={25} textAnchor="middle" className="fill-error text-[11px] font-bold">
        0,80
      </text>
      <text x={70} y={70} textAnchor="middle" className="fill-nevoa text-[10px]">
        desconto 20%
      </text>

      <circle cx={220} cy={45} r={6} className="fill-success" />
      <text x={220} y={25} textAnchor="middle" className="fill-success text-[11px] font-bold">
        1,10
      </text>
      <text x={220} y={70} textAnchor="middle" className="fill-nevoa text-[10px]">
        aumento 10%
      </text>
    </svg>
  );
}
