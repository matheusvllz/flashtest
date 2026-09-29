import type { CSSProperties, ReactNode } from "react";
import { FocaTroca } from "../components/FocaTroca";
import { MockPhone } from "../components/MockPhone";
import { CartaoArea, TelaAtividade, TelaEspera, TelaNivelamento, TelaProva } from "../components/app/screens";
import { PencilArrow } from "../components/doodles";
import { TELA_NIVELAMENTO, TELA_REVISAO } from "../content/app-screens";
import { HISTORIA } from "../content/copy";

/** Pouso dos bilhetes da primeira cena em volta do celular (% do palco). Os 3 primeiros ficam no celular. */
const BILHETES = [
  { x: "2%", y: "10%", r: "-8deg" },
  { x: "70%", y: "4%", r: "6deg" },
  { x: "4%", y: "62%", r: "5deg" },
  { x: "74%", y: "40%", r: "-6deg" },
  { x: "-6%", y: "36%", r: "-3deg" },
  { x: "68%", y: "74%", r: "4deg" },
];

const v = (o: Record<string, string | number>) => o as CSSProperties;

function Tela({ children }: { children: ReactNode }) {
  return (
    <MockPhone className="lp-scene__phone">
      {children}
    </MockPhone>
  );
}

/** Visual de cada cena. A primeira é a pilha de material; as outras, telas do app. */
function Visual({ id }: { id: string }) {
  if (id === "material")
    return (
      <div className="lp-pile">
        {HISTORIA.bilhetes.map((b, i) => (
          <span key={b} className={["lp-bilhete lp-pile__nota", i >= 3 ? "lp-pile__nota--extra" : ""].join(" ").trim()} style={v({ "--x": BILHETES[i].x, "--y": BILHETES[i].y, "--r": BILHETES[i].r })} data-nota={i}>
            {b}
          </span>
        ))}
        <span className="lp-pile__pilha" aria-hidden="true" />
      </div>
    );
  if (id === "prova")
    return (
      <Tela>
        <TelaProva />
      </Tela>
    );
  if (id === "nivelamento")
    return (
      <Tela>
        <TelaNivelamento />
      </Tela>
    );
  if (id === "proximo")
    return (
      <Tela>
        <TelaAtividade />
      </Tela>
    );
  const area = TELA_NIVELAMENTO.areas[1];
  return (
    <div className="lp-scene__rev">
      <Tela>
        <TelaAtividade t={TELA_REVISAO} />
      </Tela>
      {/* A faixa da área muda conforme ele estuda: o cartão é o mesmo componente do resultado do nivelamento. */}
      <CartaoArea
        nome={area.nome}
        faixa={2}
        className="lp-faixa-card"
        rotulo={
          <>
            <span className="lp-faixa-card__de">{TELA_NIVELAMENTO.faixas[0]}</span>
            <span className="lp-faixa-card__para">{TELA_NIVELAMENTO.faixas[1]}</span>
          </>
        }
      >
        {/* A Foca acompanha a faixa: neutra enquanto ela anda, orgulhosa quando ela chega (docs/44 §6). */}
        <FocaTroca de="neutra" para="orgulhosa" size={44} className="lp-faixa-card__foca" />
      </CartaoArea>
    </div>
  );
}

// S-3 A história (#como-funciona; HM-2, docs/42 §6.3). Um DOM só, dois layouts:
//  - Base (sem JS, JS falhou, movimento reduzido): cada cena é legenda + visual, uma embaixo da outra.
//  - html.lp-story-on (posto por scroll.ts quando o GSAP chega antes de o leitor alcançar a seção): a seção ganha altura,
//    a área de dentro fica presa (position: sticky nativo, sem sequestrar o scroll) e as cenas se sobrepõem num palco só.
//    O scroll avança e recua a timeline (scrub). As legendas são texto real e ficam no leitor de tela; o palco é ilustração.
export function Story() {
  const n = HISTORIA.cenas.length;
  return (
    <section id="como-funciona" data-section="como-funciona" aria-labelledby="historia-titulo" className="lp-story" style={v({ "--cenas": n })}>
      <div className="lp-story__pin">
        <div className="lp-container lp-story__grid">
          <div className="lp-story__head">
            <h2 id="historia-titulo" className="lp-display-l max-w-[18ch]">
              {HISTORIA.titulo}
            </h2>
            <ol className="lp-story__dots" aria-hidden="true">
              {HISTORIA.cenas.map((c, i) => (
                <li key={c.id} className="lp-story__dot" data-state={i === 0 ? "on" : "off"} />
              ))}
            </ol>
          </div>

          {/* Palco fixo (só no modo história): a moldura do celular, a tela de espera, o traço de caneta e as anotações. */}
          <div className="lp-story__stage" aria-hidden="true">
            <MockPhone className="lp-story__phone">
              <TelaEspera />
            </MockPhone>
            <svg className="lp-story__pen" viewBox="0 0 200 120" preserveAspectRatio="none" focusable="false">
              <path className="lp-stroke lp-stroke--mar" data-draw="none" pathLength={1} d="M4 110 C 40 104, 70 60, 110 58 S 170 30, 196 8" />
            </svg>
            <div className="lp-story__nota lp-story__nota--motivo">
              <p className="lp-hand">{HISTORIA.anotacaoMotivo}</p>
              <PencilArrow draw="none" className="h-20 w-14" />
            </div>
            <div className="lp-story__nota lp-story__nota--faixa">
              <p className="lp-hand">{HISTORIA.anotacaoFaixa}</p>
            </div>
          </div>

          {HISTORIA.cenas.map((c, i) => (
            <div key={c.id} className="lp-scene" data-cena={i} data-scene-id={c.id}>
              <div className="lp-scene__cap">
                <p className="lp-data lp-scene__n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="lp-title lp-scene__titulo">{c.titulo}</h3>
                <p className="lp-body lp-scene__corpo">{c.corpo}</p>
              </div>
              <div className="lp-scene__vis" aria-hidden="true">
                <Visual id={c.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
