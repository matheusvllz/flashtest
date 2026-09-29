// Barramento de eventos LOCAL (docs/40 §19). Nada é enviado para fora: sem rede, sem cookie, sem ID de pessoa.
// Um provedor futuro (decisão própria, público majoritariamente menor de idade, DEP-7) só precisa escutar
// window "foca-lp:track" sem tocar nas seções.

export type TrackName =
  | "landing_view"
  | "section_view"
  | "hero_cta_click"
  | "nav_cta_click"
  | "demo_cta_click"
  | "final_cta_click"
  | "sticky_cta_click"
  | "nav_login_click"
  | "nav_anchor_click"
  | "demo_answer"
  | "faq_open";

/** Só valores de rótulo curtos: seção, cta, resultado da demo, id de pergunta, faixa de viewport. */
export type TrackProps = Partial<{
  section: string;
  cta: string;
  target: string;
  resultado: "certa" | "errada" | "nao_sei";
  id: string;
  viewport: "mobile" | "tablet" | "desktop";
}>;

export interface TrackDetail {
  name: TrackName;
  props: TrackProps;
}

export const TRACK_EVENT = "foca-lp:track";

function viewportDe(): TrackProps["viewport"] {
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

export function track(name: TrackName, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;
  const detail: TrackDetail = { name, props: { viewport: viewportDe(), ...props } };
  window.dispatchEvent(new CustomEvent<TrackDetail>(TRACK_EVENT, { detail }));
  if (import.meta.env.DEV) console.debug("[foca-lp]", name, detail.props);
}
