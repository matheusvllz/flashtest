import { PhoneFrame } from "@/components/AppShell";
import { AREA_NAMES } from "@/content/taxonomy/areas";
import { activityReasonText, activityTitle } from "@/lib/adaptive/activity-lesson";
import { faixaDaAreaPlacement, precisaoDaArea, type FaixaPlacement, type PrecisaoArea } from "@/lib/adaptive/display";
import type { PlacementScope } from "@/lib/adaptive/placement";
import type { PlannedActivity } from "@/lib/adaptive/types";
import { COPY } from "@/lib/copy";
import type { PlacementState } from "@/lib/learning/types";

/**
 * Resultado do nivelamento (docs/36 §F.5, T-06.1; RU-10, RP-6). Uma coluna, um
 * CTA primário, só o que foi MEDIDO: faixa por área medida + precisão pela SE
 * da área, nunca porcentagem, θ, SE numérica, nota, ranking ou "nível N".
 *
 * O indicador é decorativo para leitor de tela (o `role="img"` carrega o
 * `aria-label` "{Área}: {faixa}. {precisão}.") e a cor nunca é o único sinal:
 * o rótulo da faixa aparece em texto ao lado dos 3 segmentos.
 *
 * Tokens do Rabisco só (`mar` = seleção/progresso, `gelo` = neutro de papel);
 * nada de verde/vermelho — esses são de resposta certa/errada.
 */

const FAIXAS: FaixaPlacement[] = ["construcao", "caminho", "firme"];

const ROTULO_FAIXA: Record<FaixaPlacement, string> = {
  construcao: COPY.nivelamento.faixaBaseConstrucao,
  caminho: COPY.nivelamento.faixaNoCaminho,
  firme: COPY.nivelamento.faixaBaseFirme,
};

const ROTULO_PRECISAO: Record<PrecisaoArea, string> = {
  firme: COPY.nivelamento.precisaoFirme,
  inicial: COPY.nivelamento.precisaoInicial,
  poucas: COPY.nivelamento.precisaoPoucas,
};

/** Listras na cor da marca: "evidência insuficiente" se distingue por FORMA, não só por cor (spec 48 T-48.5.2). */
const LISTRADO = { backgroundImage: "repeating-linear-gradient(135deg, var(--mar) 0 3px, transparent 3px 6px)" } as const;

/** Legenda das faixas, uma vez por tela: o indicador lê da esquerda (construção) para a direita (firme). */
export function LegendaDasFaixas() {
  return (
    <p className="text-xs text-nevoa" data-testid="placement-legenda">
      {COPY.nivelamento.legendaFaixas(FAIXAS.map((f) => ROTULO_FAIXA[f]))}
    </p>
  );
}

/**
 * Uma área do nivelamento (docs/36 §F.5; spec 48 T-48.5.2, RF-14; B-070). Três estados distintos por texto E forma:
 * medida (segmento cheio), medida com poucas questões (segmento listrado + "a confirmar") e não medida (contorno
 * tracejado, sem faixa). Nunca número, porcentagem nem nota.
 */
export function AreaCard({
  nome,
  faixa,
  precisao,
  respondidas,
}: {
  nome: string;
  faixa: FaixaPlacement | null;
  precisao: PrecisaoArea | null;
  respondidas: number;
}) {
  if (!faixa) {
    // Área não medida (pool insuficiente, fora do foco ou abandonada antes): sem faixa.
    return (
      <div className="card-soft px-4 py-3.5 text-left" data-testid="placement-area" data-estado="nao-medida">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-abismo">{nome}</p>
          <span className="shrink-0 whitespace-nowrap rounded-full border-2 border-dashed border-gelo px-2 py-0.5 text-[11px] font-bold text-nevoa">
            {COPY.nivelamento.naoMedida}
          </span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {FAIXAS.map((f) => (
            <div key={f} className="h-2 flex-1 rounded-[6px] border-2 border-dashed border-gelo" />
          ))}
        </div>
        <p className="mt-1.5 text-xs font-semibold text-nevoa">{COPY.nivelamento.areaNaoMedida(nome)}</p>
      </div>
    );
  }

  const rotuloFaixa = ROTULO_FAIXA[faixa];
  const rotuloPrecisao = ROTULO_PRECISAO[precisao ?? "poucas"];
  const ativo = FAIXAS.indexOf(faixa);
  const insuficiente = (precisao ?? "poucas") === "poucas";

  return (
    <div className="card-soft px-4 py-3.5 text-left" data-testid="placement-area" data-estado={insuficiente ? "insuficiente" : "medida"}>
      <p className="text-sm font-bold text-abismo">{nome}</p>
      <div
        role="img"
        aria-label={COPY.nivelamento.faixaAriaLabel(nome, rotuloFaixa, rotuloPrecisao)}
        className="mt-2 flex items-center gap-3"
      >
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {FAIXAS.map((f, i) => (
            <div
              key={f}
              className={`h-2 flex-1 rounded-[6px] ${i === ativo ? (insuficiente ? "border border-mar" : "bg-mar") : "bg-gelo"}`}
              style={i === ativo && insuficiente ? LISTRADO : undefined}
            />
          ))}
        </div>
        <span className="shrink-0 text-xs font-bold text-abismo" aria-hidden="true">
          {insuficiente ? COPY.nivelamento.faixaAConfirmar(rotuloFaixa) : rotuloFaixa}
        </span>
      </div>
      <p className="mt-1.5 text-xs font-semibold text-nevoa">
        {rotuloPrecisao}
        {insuficiente && ` (${COPY.nivelamento.questoesRespondidas(respondidas)})`}
      </p>
    </div>
  );
}

export function PlacementResult({
  placement,
  scope,
  primeira,
  onComecar,
}: {
  placement: PlacementState | undefined | null;
  scope: PlacementScope;
  /** `committed[0]` depois de a fila ser recomposta com o nivelamento aplicado; `null` com a jornada desligada ou fila vazia. */
  primeira: PlannedActivity | null;
  onComecar: () => void;
}) {
  const areas = scope.areas.map((area) => {
    const estado = placement?.areas[area];
    return {
      area,
      faixa: faixaDaAreaPlacement(estado?.theta ?? null),
      precisao: precisaoDaArea(estado?.se ?? null),
      respondidas: estado?.itemIds.length ?? 0,
    };
  });
  const algumaMedida = areas.some((a) => a.faixa !== null);

  return (
    <PhoneFrame variant="reading">
      <div className="flex min-h-screen flex-col justify-center bg-neve px-6 py-10">
        <h1 className="font-display text-2xl font-bold text-abismo">{COPY.nivelamento.resultadoTitulo}</h1>
        <p className="mt-2 text-sm leading-relaxed text-nevoa">
          {algumaMedida ? COPY.nivelamento.resultadoCorpo : COPY.nivelamento.resultadoSemDados}
        </p>

        {algumaMedida && (
          <div className="mt-4">
            <LegendaDasFaixas />
          </div>
        )}

        <div className="mt-3 flex flex-col gap-3">
          {areas.map((a) => (
            <AreaCard
              key={a.area}
              nome={AREA_NAMES[a.area]}
              faixa={a.faixa}
              precisao={a.precisao}
              respondidas={a.respondidas}
            />
          ))}
        </div>

        {primeira && (
          <section className="mt-6" aria-labelledby="por-onde-comecamos">
            <p id="por-onde-comecamos" className="ds-label">
              {COPY.nivelamento.porOndeComecamos}
            </p>
            <p className="mt-1 text-sm font-bold text-abismo">
              {COPY.nivelamento.primeiraAtividade(activityTitle(primeira))}
            </p>
            <p className="mt-1 text-xs text-nevoa">{activityReasonText(primeira)}</p>
          </section>
        )}

        <button type="button" onClick={onComecar} className="btn-primary mt-8 w-full">
          {primeira ? COPY.jornada.comecar : COPY.nivelamento.ctaIrParaTrilha}
        </button>
      </div>
    </PhoneFrame>
  );
}
