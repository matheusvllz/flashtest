import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, Home, BookOpen, PenLine, TrendingUp, User, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { NavRail } from "@/components/NavRail";
import { TutorBubble } from "@/components/TutorBubble";
import { FocaMark } from "@/components/brand/FocaMark";
import { FEATURES, HOME_ROUTE } from "@/lib/features";
import { cn } from "@/lib/utils";

/** Logo da marca nos headers e telas de entrada. Delegada ao FocaMark para haver um único ponto de verdade. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return <FocaMark size={size} />;
}

/**
 * Coluna central do app (docs/36 §F.6, RU-30). Largura = token de layout de
 * `styles.css`: `--app-col` (telas com AppShell) ou `--reading-col` (players
 * imersivos, `variant="reading"`). Abaixo de 768 px os tokens têm o valor de sempre (a coluna mobile).
 *
 * `--frame-col` é a largura EFETIVA da coluna, herdada pelos elementos fixos que
 * moram dentro do frame (FAB do tutor, folhas, rodapés) — assim eles se ancoram à
 * coluna em que estão, seja `app` ou `reading`, sem repetir número nenhum.
 * A borda lateral (≥ 768 px) é o utilitário `frame-border` (media query no CSS,
 * não classe condicional: o mesmo HTML no servidor e no cliente).
 */
export function PhoneFrame({
  children,
  variant = "app",
}: {
  children: ReactNode;
  variant?: "app" | "reading";
}) {
  return (
    <div
      className={cn(
        "frame-border mx-auto min-h-screen w-full bg-neve",
        variant === "reading"
          ? "max-w-[var(--reading-col)] [--frame-col:var(--reading-col)]"
          : "max-w-[var(--app-col)] [--frame-col:var(--app-col)]",
      )}
    >
      {children}
    </div>
  );
}

// Os DOIS pilares do produto (aula de 60s e redação) ficam no nav; plano,
// flashcards e ranking são alcançados pelo dashboard para não estourar
// a barra em 6+ itens.
export const NAV_ITEMS_V1 = [
  { to: "/dashboard", label: "Início", icon: Home },
  { to: "/study", label: "Estudar", icon: BookOpen },
  { to: "/redacao", label: "Redação", icon: PenLine },
  { to: "/progress", label: "Progresso", icon: TrendingUp },
  { to: "/profile", label: "Perfil", icon: User },
];

// Nav v2 (docs/25 §12.5/§18 T-21) — a trilha vira a home e absorve a
// redação como parte de "Aprender"; ranking/flashcards migram pra
// `/progress` (§12.6), então a barra cabe em 4 itens.
export const NAV_ITEMS_V2 = [
  { to: "/trilha", label: "Aprender", icon: BookOpen },
  { to: "/study", label: "Praticar", icon: Zap },
  { to: "/progress", label: "Progresso", icon: TrendingUp },
  { to: "/profile", label: "Perfil", icon: User },
];

const NAV_ITEMS = FEATURES.trilhaComoHome ? NAV_ITEMS_V2 : NAV_ITEMS_V1;

function isNavActive(pathname: string, to: string) {
  // Caso especial só sob nav v2: redação é o mesmo pilar de "Aprender"
  // (a trilha), então `/redacao` e `/redacao/*` acendem "/trilha" — não
  // altera o comportamento da nav v1, que não tem esse item.
  if (FEATURES.trilhaComoHome && to === "/trilha" && pathname.startsWith("/redacao")) return true;
  return pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
}

/**
 * A Foca fica ausente do header de tela comum (docs/15-mascote-e-voz.md §4:
 * "presença constante mata o impacto") — no lugar entra um botão de voltar
 * quando a tela não é um destino direto do bottom nav.
 */
export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const navigate = useNavigate();
  const isNavRoute = NAV_ITEMS.some((item) => isNavActive(pathname, item.to));

  function voltar() {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: HOME_ROUTE });
  }

  return (
    // Wrapper do trilho (docs/36 §F.6): em ≥ 1024 px reserva a largura do NavRail à
    // esquerda (`--nav-rail` é 0px abaixo disso) e repassa o valor aos elementos
    // fixos ancorados à coluna (`--frame-rail`, lido por `anchor-col-*`).
    <div className="[--frame-rail:var(--nav-rail)] lg:pl-[var(--nav-rail)]">
    <PhoneFrame>
      {title && (
        <header className="sticky top-0 z-20 flex items-center gap-2 bg-neve/90 px-3 py-3 backdrop-blur">
          {!isNavRoute && (
            <button
              type="button"
              onClick={voltar}
              aria-label="Voltar"
              className="grid h-11 w-11 shrink-0 place-items-center text-abismo"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <h1 className="font-display text-xl font-bold text-abismo">{title}</h1>
        </header>
      )}
      <main className="pb-32 lg:pb-12">{children}</main>
      {/* O balão do tutor vive aqui: toda tela que usa AppShell é pós-quiz,
          então ele fica presente no app inteiro sem precisar ser remontado. */}
      <TutorBubble />
      <BottomNav />
    </PhoneFrame>
    <NavRail
      items={NAV_ITEMS}
      isActive={(to) => isNavActive(pathname, to)}
    />
    </div>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Principal"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[var(--app-col)] -translate-x-1/2 border-t-2 border-gelo bg-cards/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className={`grid ${NAV_ITEMS.length === 4 ? "grid-cols-4" : "grid-cols-5"}`}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isNavActive(pathname, to);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className="flex min-h-16 flex-col items-center justify-center gap-1 py-2 text-xs font-bold"
              >
                <span
                  className={`grid h-7 w-10 place-items-center rounded-full ${active ? "anim-pop-in bg-mar/12" : ""}`}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.8}
                    className={active ? "text-mar-fundo" : "text-nevoa"}
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
