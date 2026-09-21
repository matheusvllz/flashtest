import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, Home, BookOpen, PenLine, TrendingUp, User } from "lucide-react";
import type { ReactNode } from "react";
import { TutorBubble } from "@/components/TutorBubble";
import { FocaMark } from "@/components/brand/FocaMark";

/** Logo da marca nos headers e telas de entrada. Delegada ao FocaMark para haver um único ponto de verdade. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return <FocaMark size={size} />;
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[440px] bg-neve md:border-x md:border-gelo">
      {children}
    </div>
  );
}

// Os DOIS pilares do produto (aula de 60s e redação) ficam no nav; plano,
// flashcards e ranking são alcançados pelo dashboard para não estourar
// a barra em 6+ itens.
const NAV_ITEMS = [
  { to: "/dashboard", label: "Início", icon: Home },
  { to: "/study", label: "Estudar", icon: BookOpen },
  { to: "/redacao", label: "Redação", icon: PenLine },
  { to: "/progress", label: "Progresso", icon: TrendingUp },
  { to: "/profile", label: "Perfil", icon: User },
];

function isNavActive(pathname: string, to: string) {
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
    else navigate({ to: "/dashboard" });
  }

  return (
    <PhoneFrame>
      {title && (
        <header className="sticky top-0 z-20 flex items-center gap-2 bg-neve/90 px-3 py-3 backdrop-blur">
          {!isNavRoute && (
            <button
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
      <main className="pb-32">{children}</main>
      {/* O balão do tutor vive aqui: toda tela que usa AppShell é pós-quiz,
          então ele fica presente no app inteiro sem precisar ser remontado. */}
      <TutorBubble />
      <BottomNav />
    </PhoneFrame>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2 border-t-2 border-gelo bg-cards/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
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
