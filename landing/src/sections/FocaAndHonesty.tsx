import { X } from "lucide-react";
import { PhoneFrame } from "../components/PhoneFrame";
import { ProductShot } from "../components/ProductShot";
import { PencilStrike } from "../components/doodles";
import { LP } from "../content/copy";

// S-7 A Foca, e o que a gente não promete. Pergunta do João: "Qual é a pegadinha?". O retrato é o balão real
// aberto por "Explicar melhor". Sem chave de IA em produção (V-1), a foto sai do texto e o retrato segue real.
const TEXTO_COM_FOTO = true;

export function FocaAndHonesty() {
  return (
    <section data-section="foca" aria-labelledby="foca-titulo" className="py-[var(--lp-section-y)]">
      <div className="lp-container grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="order-2 lg:order-1 lg:col-span-5" data-reveal>
          <PhoneFrame cut="bottom" className="mx-auto w-full max-w-[300px]" style={{ maxHeight: 600 }}>
            <ProductShot id="tutor-balao" alt={LP.foca.fotoAlt} sizes="(min-width: 1024px) 300px, 80vw" />
          </PhoneFrame>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
          <h2 id="foca-titulo" className="lp-display-l max-w-[18ch]">
            {LP.foca.titulo}
          </h2>
          <p className="lp-lead mt-5 max-w-[46ch] text-foreground">{TEXTO_COM_FOTO ? LP.foca.corpo : LP.foca.corpoSemFoto}</p>

          <div className="mt-9" data-reveal>
            <h3 className="lp-title inline-block">
              {LP.foca.naoFazTitulo}
              <PencilStrike className="mt-1 h-3 w-full" />
            </h3>
            <ul className="mt-5 space-y-3">
              {LP.foca.naoFaz.map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-abismo" aria-hidden="true">
                    <X size={14} strokeWidth={2.5} className="text-abismo" />
                  </span>
                  <span className="lp-body text-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
