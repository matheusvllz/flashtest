import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { FocaMark } from "@/components/brand/FocaMark";
import { BRAND } from "@/lib/brand";

export interface NavRailItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Navegação lateral para telas largas (docs/36 §F.6, RU-30; desktop de primeira classe, docs/44 §5). A
 * `BottomNav` some em ≥ 1024 px e este trilho fixo aparece à esquerda, com os MESMOS itens (o `AppShell` passa
 * `NAV_ITEMS`). Largura = token `--nav-rail`:
 *  - 1024–1279 px: trilho de 96 px, ícone sobre rótulo;
 *  - ≥ 1280 px: barra lateral de 232 px com a logo oficial no topo e ícone ao lado do rótulo.
 *
 * `:hover` só troca o fundo, nunca o layout. O foco visível vem do `:focus-visible` global.
 * Recebe `items`/`isActive` por props (e não importa o `AppShell`) para não criar ciclo de módulos com ele.
 */
export function NavRail({
  items,
  isActive,
}: {
  items: NavRailItem[];
  isActive: (to: string) => boolean;
}) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-y-0 left-0 z-30 hidden w-[var(--nav-rail)] flex-col items-stretch gap-1 border-r-2 border-gelo bg-cards px-2 py-6 lg:flex xl:px-4"
    >
      <Link
        to="/app"
        aria-label={`${BRAND.name}, início`}
        className="mb-4 flex min-h-12 items-center justify-center gap-2.5 rounded-lg transition-colors hover:bg-gelo/60 xl:justify-start xl:px-3"
      >
        <FocaMark size={36} decorative />
        <span className="hidden font-display text-xl font-bold text-abismo xl:inline">{BRAND.name}</span>
      </Link>
      <ul className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition-colors hover:bg-gelo/60 xl:min-h-12 xl:flex-row xl:justify-start xl:gap-3 xl:px-3 xl:text-[0.9375rem] ${active ? "xl:bg-mar/10" : ""}`}
              >
                <span className={`grid h-7 w-10 place-items-center rounded-full ${active ? "bg-mar/12 xl:bg-transparent" : ""} xl:w-7`}>
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.8}
                    className={active ? "text-mar-fundo" : "text-nevoa"}
                    aria-hidden="true"
                  />
                </span>
                <span className={active ? "text-mar-fundo" : "text-nevoa xl:text-abismo"}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
