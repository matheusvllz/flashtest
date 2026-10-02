/**
 * Créditos e fontes das questões (spec 50 §5.9.2 "Créditos", decisão 0008, T-50.9.7). Mesmo layout das
 * páginas legais (`PaginaLegal`): leitura simples, pública, sem conta nem store. Textos em `COPY.creditos`.
 */
import { Link } from "@tanstack/react-router";
import { COPY } from "@/lib/copy";

const C = COPY.creditos;

function LinkExterno({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center font-semibold text-mar-fundo underline underline-offset-2"
    >
      {children}
      <span className="sr-only"> {C.novaAba}</span>
    </a>
  );
}

export function PaginaCreditos() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[var(--reading-col)] bg-neve px-6 pt-10 pb-16">
      <Link to="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-nevoa">
        {C.voltar}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-abismo">{C.titulo}</h1>
      <p className="mt-6 text-base leading-relaxed text-abismo">{C.resumo}</p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-abismo">{C.inep.titulo}</h2>
        <p className="mt-3 text-base leading-relaxed text-abismo">{C.inep.origem}</p>
        <p className="mt-3 text-base leading-relaxed text-abismo">{C.inep.credito}</p>
        <p className="mt-3 text-base leading-relaxed text-abismo">{C.inep.licencaAntes}</p>
        <blockquote
          cite={C.inep.urlProvas}
          className="mt-3 border-l-4 border-gelo pl-4 text-base leading-relaxed text-abismo italic"
        >
          {"“"}
          {C.inep.licencaCitacao}
          {"”"}
        </blockquote>
        <p className="mt-3 text-base leading-relaxed text-abismo">{C.inep.licencaDepois}</p>
        <p className="mt-3 text-base leading-relaxed text-abismo">{C.inep.terceiros}</p>
        <ul className="mt-3 space-y-1 text-base">
          <li>
            <LinkExterno href={C.inep.urlProvas}>{C.inep.linkProvas}</LinkExterno>
          </li>
          <li>
            <LinkExterno href={C.inep.urlLicenca}>{C.inep.linkLicenca}</LinkExterno>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-abismo">{C.foca.titulo}</h2>
        <p className="mt-3 text-base leading-relaxed text-abismo">{C.foca.texto}</p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-abismo">{C.retirada.titulo}</h2>
        <p className="mt-3 text-base leading-relaxed text-abismo">{C.retirada.texto}</p>
        <p className="mt-3 text-base leading-relaxed text-abismo">{C.retirada.emBreve}</p>
      </section>
    </main>
  );
}
