import { Check } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PhoneFrame } from "../components/PhoneFrame";
import { ProductShot } from "../components/ProductShot";
import { COMO_FUNCIONA } from "../content/copy";
import type { ShotId } from "../content/shots";

// S-3 Como funciona (a seção memorável). Base = passos empilhados, cada um com o seu retrato: funciona sem JS e
// com movimento reduzido. Com movimento ligado e >= 1024 px, o celular fica fixo (position: sticky nativo) e o
// retrato troca conforme o passo cruza o meio da tela. Sem pin, sem snap, sem sequestro de rolagem (docs/40 §13.1).
export function HowItWorks() {
  const passos = COMO_FUNCIONA.passos;
  // Um só estado: o atualizador é puro (nunca chama outro setState dentro dele; o StrictMode o executa duas vezes).
  const [{ ativo, anterior }, setPasso] = useState<{ ativo: number; anterior: number | null }>({ ativo: 0, anterior: null });
  const raiz = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const itens = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    // Faixa fina no meio da tela: o passo que a cruza é o ativo.
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.step);
          setPasso((atual) => (atual.ativo === i ? atual : { ativo: i, anterior: atual.ativo }));
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    itens.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  const progresso = (ativo + 1) / passos.length;

  return (
    <section id="como-funciona" data-section="como-funciona" aria-labelledby="como-titulo" className="py-[var(--lp-section-y)]">
      <div className="lp-container">
        <h2 id="como-titulo" className="lp-display-l max-w-[20ch]">
          {COMO_FUNCIONA.titulo}
        </h2>

        <div className="lp-scrolly-grid mt-[var(--lp-section-gap)]" data-scrolly-root style={{ ["--lp-progress" as string]: progresso } as CSSProperties}>
          <div className="relative pl-9">
            <div className="lp-margin hidden md:block" aria-hidden="true">
              <div className="lp-margin__fill" data-margin-fill />
            </div>
            <ol ref={raiz} className="lp-steps">
              {passos.map((p, i) => (
                <li key={p.id} id={`passo-${p.id}`} data-step={i} data-active={ativo === i} className="lp-step">
                  <div className="lp-step-body relative" {...(ativo === i ? { "aria-current": "step" as const } : {})}>
                    <span
                      className="lp-node absolute -left-9 top-1.5"
                      data-state={i < ativo ? "done" : i === ativo ? "on" : "off"}
                      aria-hidden="true"
                    >
                      {i <= ativo && <Check size={12} strokeWidth={3} />}
                    </span>
                    <h3 className="lp-title">{p.titulo}</h3>
                    <p className="lp-body mt-3 max-w-[42ch] text-foreground">{p.corpo}</p>
                  </div>
                  {/* Retrato do passo: aparece empilhado na base; some quando o celular fixo assume (desktop com movimento). */}
                  {/* O retrato do último passo repete a tela do hero e do passo 3: no mobile fica só o texto (crítica R8). */}
                  <div className={["lp-step-inline-shot mt-6 md:mt-0", i === passos.length - 1 ? "max-md:hidden" : ""].join(" ").trim()}>
                    <PhoneFrame cut="bottom" className="mx-auto max-h-[420px] w-full max-w-[320px]">
                      <ProductShot id={p.foto as ShotId} alt={p.alt} sizes="(min-width: 768px) 320px, 80vw" />
                    </PhoneFrame>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Celular fixo (só desktop com movimento; escondido por CSS caso contrário). */}
          <div className="lp-scrolly-phone" aria-hidden="true">
            <div className="sticky top-[calc(var(--lp-nav-h)+4vh)]">
              <PhoneFrame className="mx-auto w-full max-w-[340px]" style={{ aspectRatio: "390 / 760" }}>
                {passos.map((p, i) => (
                  <div key={p.id} className="lp-shot-layer" data-active={ativo === i} data-prev={anterior === i && ativo !== i}>
                    <ProductShot id={p.foto as ShotId} alt="" sizes="340px" />
                  </div>
                ))}
              </PhoneFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
