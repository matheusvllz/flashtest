import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { CtaButton } from "../components/CtaButton";
import { FocaMark } from "../components/FocaMark";
import { TENTA_UMA } from "../content/copy";
import item from "../content/demo-item.json";
import { track } from "../lib/track";

// S-4 Tenta uma: uma questão REAL do banco do app, copiada literal (content/demo-item.source.md), com os
// rótulos e falas reais do app. Estados: inicial, selecionada, certa, errada, "Não sei" (neutro, sem vermelho).
// Verde e vermelho só aparecem aqui, porque são feedback de resposta (docs/40 §12.4). Sem rede, sem som.
type Estado = "idle" | "certa" | "errada" | "naosei";

export function TryOne() {
  const [escolha, setEscolha] = useState<number | null>(null);
  const [estado, setEstado] = useState<Estado>("idle");
  const feedback = useRef<HTMLDivElement>(null);
  const respondido = estado !== "idle";

  function verificar() {
    if (escolha === null) return;
    const novo: Estado = escolha === item.correta ? "certa" : "errada";
    setEstado(novo);
    track("demo_answer", { resultado: novo === "certa" ? "certa" : "errada" });
    requestAnimationFrame(() => feedback.current?.focus());
  }

  function naoSei() {
    setEscolha(null);
    setEstado("naosei");
    track("demo_answer", { resultado: "nao_sei" });
    requestAnimationFrame(() => feedback.current?.focus());
  }

  function reiniciar() {
    setEscolha(null);
    setEstado("idle");
  }

  // Setas movem a seleção (padrão de radiogroup); Tab sai do grupo.
  function aoTeclar(e: React.KeyboardEvent, i: number) {
    if (respondido) return;
    const n = item.opcoes.length;
    let alvo = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") alvo = (i + 1) % n;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") alvo = (i - 1 + n) % n;
    if (alvo >= 0) {
      e.preventDefault();
      setEscolha(alvo);
      (e.currentTarget.parentElement?.children[alvo] as HTMLElement | undefined)?.focus();
    }
  }

  const titulo = estado === "certa" ? TENTA_UMA.resultadoCerta : estado === "errada" ? TENTA_UMA.resultadoErrada : TENTA_UMA.resultadoNaoSei;
  const tom = estado === "certa" ? "certa" : estado === "errada" ? "errada" : "neutro";

  return (
    <section id="tenta-uma" data-section="tenta-uma" aria-labelledby="tenta-titulo" className="lp-pauta py-[var(--lp-section-y)]">
      <div className="lp-container">
        <div className="mx-auto max-w-[36rem]">
          <h2 id="tenta-titulo" className="lp-display-l text-center">
            {TENTA_UMA.titulo}
          </h2>
          <p className="lp-lead mt-3 text-center text-foreground">{TENTA_UMA.subtitulo}</p>

          <div className="card-soft mt-[var(--lp-section-gap)] rounded-3xl p-5 sm:p-7">
            <p className="font-display text-xl font-bold leading-snug text-foreground sm:text-[1.375rem]">{item.pergunta}</p>

            <div role="radiogroup" aria-label={TENTA_UMA.alternativasAria} className="mt-5 grid gap-3">
              {item.opcoes.map((op, i) => {
                const resultado = respondido && i === item.correta ? "certa" : estado === "errada" && i === escolha ? "errada" : undefined;
                return (
                  <button
                    key={op}
                    type="button"
                    role="radio"
                    aria-checked={escolha === i}
                    tabIndex={escolha === null ? (i === 0 ? 0 : -1) : escolha === i ? 0 : -1}
                    disabled={respondido}
                    data-resultado={resultado}
                    className="lp-choice"
                    onClick={() => setEscolha(i)}
                    onKeyDown={(e) => aoTeclar(e, i)}
                  >
                    {op}
                  </button>
                );
              })}
            </div>

            {!respondido && (
              <div className="mt-5 grid gap-3">
                <button type="button" className="btn-primary w-full" disabled={escolha === null} aria-describedby={escolha === null ? "dica-verificar" : undefined} onClick={verificar}>
                  {TENTA_UMA.verificar}
                </button>
                {escolha === null && (
                  <span id="dica-verificar" className="sr-only">
                    {TENTA_UMA.desabilitadoDica}
                  </span>
                )}
                <button type="button" className="btn-ghost w-full" aria-label={TENTA_UMA.naoSeiAria} onClick={naoSei}>
                  {TENTA_UMA.naoSei}
                </button>
              </div>
            )}

            <div aria-live="polite" className="min-h-0">
              {respondido && (
                <div
                  ref={feedback}
                  tabIndex={-1}
                  role="status"
                  data-tom={tom}
                  className="anim-slide-up mt-5 rounded-[var(--radius-card)] p-4 outline-offset-4 sm:p-5"
                  style={{
                    background:
                      tom === "certa"
                        ? "color-mix(in srgb, var(--color-success) 10%, var(--color-cards))"
                        : tom === "errada"
                          ? "color-mix(in srgb, var(--color-error) 10%, var(--color-cards))"
                          : "var(--color-gelo)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <FocaMark size={40} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-display text-lg font-bold leading-snug text-foreground">
                        {tom === "certa" && <CheckCircle2 size={22} strokeWidth={2} className="shrink-0 text-success-texto" aria-hidden="true" />}
                        {tom === "errada" && <XCircle size={22} strokeWidth={2} className="shrink-0 text-error" aria-hidden="true" />}
                        {tom === "neutro" && <CircleHelp size={22} strokeWidth={2} className="shrink-0 text-nevoa" aria-hidden="true" />}
                        <span>{titulo}</span>
                      </p>
                      <p className="lp-body mt-2 text-foreground">{item.explicacao}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {respondido && (
              <div className="anim-slide-up mt-5 grid gap-3">
                <p className="lp-body text-center font-semibold text-foreground">{TENTA_UMA.depois}</p>
                <CtaButton label={TENTA_UMA.cta} evento="demo_cta_click" cta="demo" block />
                <button type="button" className="btn-ghost w-full" onClick={reiniciar}>
                  {TENTA_UMA.outraVez}
                </button>
              </div>
            )}
          </div>

          <noscript>
            <p className="lp-small mt-4 text-center text-nevoa">{TENTA_UMA.semJs}</p>
            <div className="mt-3">
              <CtaButton label={TENTA_UMA.cta} evento="demo_cta_click" cta="demo" block />
            </div>
          </noscript>
        </div>
      </div>
    </section>
  );
}
