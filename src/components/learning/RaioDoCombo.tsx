import type { MarcoDoCombo } from "@/lib/combo";

/**
 * Raio do combo sobre a barra de progresso (spec 50 §5.1.2). Traço desenhado (stroke-dash) em 400–600 ms conforme o
 * marco; só `opacity` e o traço animam. Decorativo: o anúncio acessível é o selo "N seguidas" na folha de feedback.
 * Com movimento reduzido, não aparece (o selo e o som seguem).
 */
const DURACAO: Record<MarcoDoCombo, number> = { 3: 400, 5: 500, 10: 600 };

export function RaioDoCombo({ marco, chave }: { marco: MarcoDoCombo; chave: string | number }) {
  const duplo = marco === 10;
  return (
    <svg
      key={chave}
      aria-hidden
      viewBox="0 0 120 24"
      preserveAspectRatio="none"
      className="anim-raio pointer-events-none absolute inset-x-0 -top-2 h-7 w-full text-recompensa"
      style={{ ["--raio-ms" as string]: `${DURACAO[marco]}ms` }}
      data-testid="raio-combo"
      data-marco={marco}
    >
      <path
        d="M2 12 L30 6 L44 16 L64 4 L80 14 L98 6 L118 12"
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={marco === 3 ? 2.5 : 3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {duplo && (
        <path
          d="M2 16 L28 10 L46 20 L62 8 L82 18 L100 10 L118 16"
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animationDelay: "90ms" }}
        />
      )}
    </svg>
  );
}
