import { MarginNote } from "../components/MarginNote";
import { MockPhone } from "../components/MockPhone";
import { TelaQuestao } from "../components/app/screens";
import { ERROU } from "../content/copy";

// Sem chave de IA em produção (V-1), a frase da foto sai do texto; a sequência continua sendo a do app.
const TEXTO_COM_FOTO = true;

// S-5 "Errou? Entende antes de seguir." (substitui "A Foca, e o que a gente não promete": decisão U-1, docs/42 §1).
// Continua a demo de cima: a questão errada, a explicação na folha, "Explicar melhor", a Foca respondendo ali mesmo.
// HM-3 (scroll.ts): a sequência toca quando o celular entra na tela e recomeça se o leitor voltar para cima.
// Sem movimento: a tela já mostra a conversa aberta, com a resposta.
export function Errou() {
  return (
    <section id="errou" data-section="errou" aria-labelledby="errou-titulo" className="py-[var(--lp-section-y)]">
      <div className="lp-container grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-5">
          <h2 id="errou-titulo" className="lp-display-l max-w-[14ch]">
            {ERROU.titulo}
          </h2>
          <p className="lp-lead mt-6 max-w-[44ch] text-foreground">{ERROU.corpo}</p>
          {TEXTO_COM_FOTO && <p className="lp-body mt-4 max-w-[44ch] text-foreground">{ERROU.corpoFoto}</p>}
          <p className="lp-title mt-8 max-w-[26ch] text-foreground" data-reveal>
            {ERROU.fechamento}
          </p>
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7">
          <div className="lp-desk lp-pauta relative mx-auto max-w-lg overflow-hidden rounded-[var(--radius-3xl)] px-6 pt-10 sm:px-12 lg:max-w-none">
            <MockPhone cut="bottom" className="lp-errou-phone relative mx-auto w-full max-w-[320px]">
              <div role="img" aria-label={ERROU.telaAria} className="absolute inset-0">
                <TelaQuestao comTutor />
              </div>
            </MockPhone>
            <MarginNote className="lp-errou-nota absolute hidden sm:block" arrowClassName="lp-errou-nota__seta" modo="none">
              {ERROU.anotacao}
            </MarginNote>
          </div>
        </div>
      </div>
    </section>
  );
}
