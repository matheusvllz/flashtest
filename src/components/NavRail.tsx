import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export interface NavRailItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Navegação lateral para telas largas (docs/36 §F.6, RU-30, T-08.2): a
 * `BottomNav` some em ≥ 1024 px (`lg:hidden`) e este trilho fixo aparece à
 * esquerda, com os MESMOS itens (`AppShell` passa `NAV_ITEMS`, então a flag
 * `trilhaComoHome` desligada continua trazendo os 5 itens da v1). A largura
 * é o token `--nav-rail`; a coluna de conteúdo se centraliza no espaço à
 * direita dele (`lg:pl-[var(--nav-rail)]` no wrapper do `AppShell`).
 *
 * `:hover` só troca o fundo (`bg-gelo/60`) — nunca muda o layout. O foco
 * visível vem do `:focus-visible` global.
 *
 * Recebe `items`/`isActive` por props (e não importa o `AppShell`) para não
 * criar um ciclo de módulos com ele.
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
      className="fixed inset-y-0 left-0 z-30 hidden w-[var(--nav-rail)] flex-col items-stretch gap-1 border-r-2 border-gelo bg-cards px-2 py-6 lg:flex"
    >
      <ul className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition-colors hover:bg-gelo/60"
              >
                <span
                  className={`grid h-7 w-10 place-items-center rounded-full ${active ? "bg-mar/12" : ""}`}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.8}
                    className={active ? "text-mar-fundo" : "text-nevoa"}
                    aria-hidden="true"
                  />
                </span>
                <span className={active ? "text-mar-fundo" : "text-nevoa"}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
