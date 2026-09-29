import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FocaMark } from "@/components/brand/FocaMark";
import { BRAND } from "@/lib/brand";
import { COPY } from "@/lib/copy";

/**
 * Moldura das telas de entrada (onboarding, login, recuperar senha) no desktop (docs/44 §5): a partir de 1024 px, um
 * painel da marca à esquerda (a Foca acolhedora e a promessa do produto) e o formulário à direita. Abaixo disso,
 * só o conteúdo, igual ao celular de sempre. É a ponte visual entre a landing e o produto: mesma tipografia, mesma
 * Foca, mesmo papel pautado.
 *
 * O formulário vem PRIMEIRO no DOM (leitor de tela e teclado chegam direto nele); o painel é posto à esquerda por CSS.
 */
export function EntryShell({ children }: { children: ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="min-w-0 lg:col-start-2 lg:row-start-1">{children}</div>
      <aside
        aria-label={BRAND.name}
        className="surface-pauta sticky top-0 hidden h-screen flex-col justify-between border-r-2 border-gelo bg-cards px-12 py-10 lg:col-start-1 lg:row-start-1 lg:flex xl:px-16"
      >
        <Link to="/" className="flex min-h-11 items-center gap-2.5 self-start rounded-lg pr-2 transition-colors hover:bg-gelo/60">
          <FocaMark size={36} decorative />
          <span className="font-display text-xl font-bold text-abismo">{BRAND.name}</span>
        </Link>
        <div className="max-w-md">
          <FocaMark size={148} expression="acolhedora" motion="pop" decorative />
          <p className="mt-8 font-display text-4xl font-bold leading-tight tracking-tight text-abismo xl:text-5xl">
            {COPY.entrada.painelTitulo}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-nevoa">{COPY.entrada.painelCorpo}</p>
        </div>
        <p className="text-sm font-semibold text-nevoa">{BRAND.tagline}</p>
      </aside>
    </div>
  );
}
