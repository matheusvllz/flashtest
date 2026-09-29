import { FocaMark } from "../components/FocaMark";
import { LP } from "../content/copy";
import { APP_DESTINOS, appUrl } from "../lib/app-url";

// Rodapé: só links reais. Termos, privacidade, contato e redes ainda não existem (docs/40 DEP-5): sem link para página inexistente.
export function Footer() {
  return (
    <footer id="rodape" aria-label={LP.a11y.rodape} className="border-t-2 border-gelo pb-28 pt-10 md:pb-10">
      <div className="lp-container flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <FocaMark variant="line" size={32} />
          <div>
            <p className="font-display text-lg font-bold leading-none text-abismo">{LP.marca}</p>
            <p className="lp-small mt-1 text-nevoa">{LP.rodape.tagline}</p>
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          <li>
            <a href="#como-funciona" className="lp-small inline-flex min-h-11 min-w-11 items-center justify-center px-1 font-bold text-abismo hover:underline">
              {LP.nav.comoFunciona}
            </a>
          </li>
          <li>
            <a href="#duvidas" className="lp-small inline-flex min-h-11 min-w-11 items-center justify-center px-1 font-bold text-abismo hover:underline">
              {LP.nav.duvidas}
            </a>
          </li>
          <li>
            <a href={appUrl(APP_DESTINOS.entrar)} className="lp-small inline-flex min-h-11 min-w-11 items-center justify-center px-1 font-bold text-abismo hover:underline">
              {LP.nav.entrar}
            </a>
          </li>
        </ul>

        <div className="max-w-xs md:text-right">
          <p className="lp-small text-nevoa">{LP.rodape.aviso}</p>
          <p className="lp-small mt-2 text-nevoa">{LP.rodape.direitos}</p>
        </div>
      </div>
    </footer>
  );
}
