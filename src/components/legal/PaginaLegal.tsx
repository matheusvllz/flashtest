/** Página de documento legal (docs/specs/46-producao T-11.3): leitura simples, sem depender de conta nem do store. */
import { Link } from "@tanstack/react-router";
import type { DocumentoLegal } from "@/content/legal/tipos";

export function PaginaLegal({ doc }: { doc: DocumentoLegal }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[var(--reading-col)] bg-neve px-6 pt-10 pb-16">
      <Link to="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-nevoa">
        ← Voltar
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-abismo">{doc.titulo}</h1>
      <p className="mt-2 text-sm text-nevoa">
        Versão {doc.versao}
        {doc.vigenteDesde ? ` · vigente desde ${doc.vigenteDesde.split("-").reverse().join("/")}` : ""}
      </p>
      {doc.rascunho && (
        <p role="note" className="mt-4 rounded-2xl border-2 border-alert bg-cards p-4 text-sm font-semibold text-abismo">
          Rascunho em revisão jurídica. Este texto ainda pode mudar antes de valer.
        </p>
      )}
      <p className="mt-6 text-base leading-relaxed text-abismo">{doc.resumo}</p>
      {doc.secoes.map((s) => (
        <section key={s.titulo} className="mt-8">
          <h2 className="font-display text-xl font-bold text-abismo">{s.titulo}</h2>
          {s.paragrafos?.map((p, i) => (
            <p key={i} className="mt-3 text-base leading-relaxed text-abismo">
              {p}
            </p>
          ))}
          {s.itens && (
            <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-relaxed text-abismo">
              {s.itens.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
