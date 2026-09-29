import { FocaMark } from "../components/FocaMark";
import { CtaButton } from "../components/CtaButton";
import { A11Y, MARCA, NAV } from "../content/copy";
import { APP_DESTINOS, appUrl } from "../lib/app-url";

// S-0 Navbar: uma linha, 56 px no mobile e 72 no desktop. Sem menu hambúrguer (só dois links de âncora).
// Markup estático: o fundo ao rolar 8 px vem de lib/chrome-dom.ts (sentinela + IntersectionObserver, sem React).
export function Navbar() {
  return (
    <>
      <div id="lp-sentinela" aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-2 w-px" />
      <header className="lp-nav" data-scrolled="false">
        <nav aria-label={A11Y.navPrincipal} className="lp-container flex min-h-[var(--lp-nav-h)] flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1">
          <a href="#topo" aria-label={A11Y.logoLink} className="flex min-h-11 items-center gap-2">
            <FocaMark variant="line" size={30} eager />
            <span className="font-display text-xl font-bold text-abismo">{MARCA}</span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            <li>
              <a href="#como-funciona" className="lp-small inline-flex min-h-11 items-center px-1 font-display font-bold text-abismo hover:underline" data-track="nav_anchor_click" data-track-target="como-funciona">
                {NAV.comoFunciona}
              </a>
            </li>
            <li>
              <a href="#duvidas" className="lp-small inline-flex min-h-11 items-center px-1 font-display font-bold text-abismo hover:underline" data-track="nav_anchor_click" data-track-target="duvidas">
                {NAV.duvidas}
              </a>
            </li>
          </ul>

          <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-3">
            <a href={appUrl(APP_DESTINOS.entrar)} className="btn-ghost !px-3 max-[359px]:hidden" data-track="nav_login_click">
              {NAV.entrar}
            </a>
            <CtaButton label={NAV.cta} evento="nav_cta_click" cta="nav" size="compact" />
          </div>
        </nav>
      </header>
    </>
  );
}
