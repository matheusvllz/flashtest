import { Link } from "@tanstack/react-router";
import { FocaMark } from "@/components/brand/FocaMark";
import { CtaButton } from "../components/CtaButton";
import { A11Y, MARCA, NAV } from "../content/copy";
import { APP_DESTINOS } from "../lib/app-url";

// S-0 Navbar: uma linha, 56 px no mobile e 72 no desktop. Logo = a oficial (Foca de frente colorida). Sem menu
// hambúrguer (só dois links de âncora). O fundo ao rolar vem de lib/chrome-dom.ts (sentinela + IntersectionObserver).
// "Entrar" leva ao login; a ação principal começa pelo quiz (docs/specs/46-producao D-20).
export function Navbar() {
  return (
    <>
      <div id="lp-sentinela" aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-2 w-px" />
      <header className="lp-nav" data-scrolled="false">
        <nav aria-label={A11Y.navPrincipal} className="lp-container flex min-h-[var(--lp-nav-h)] flex-wrap items-center justify-between gap-x-2 gap-y-1 py-1">
          <a href="#topo" aria-label={A11Y.logoLink} className="flex min-h-11 items-center gap-2">
            <FocaMark size={30} decorative />
            <span className="font-display text-xl font-bold text-abismo">{MARCA}</span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            <li>
              <a href="#como-funciona" className="lp-small lp-nav__link inline-flex min-h-11 items-center px-1 font-display font-bold text-abismo" data-track="nav_anchor_click" data-track-target="como-funciona">
                {NAV.comoFunciona}
              </a>
            </li>
            <li>
              <a href="#duvidas" className="lp-small lp-nav__link inline-flex min-h-11 items-center px-1 font-display font-bold text-abismo" data-track="nav_anchor_click" data-track-target="duvidas">
                {NAV.duvidas}
              </a>
            </li>
          </ul>

          <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-3">
            <Link to={APP_DESTINOS.entrar} preload="intent" className="btn-ghost !px-3 max-[359px]:hidden" data-track="nav_login_click">
              {NAV.entrar}
            </Link>
            <CtaButton label={NAV.cta} evento="nav_cta_click" cta="nav" size="compact" />
          </div>
        </nav>
      </header>
    </>
  );
}
