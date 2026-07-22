import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, PenLine, TrendingUp, User } from "lucide-react";
import type { ReactNode } from "react";
import { TutorBubble } from "@/components/TutorBubble";
/**
 * A logo vive em `public/` e não mais no asset store do Lovable: a URL antiga
 * (`/__l5e/assets-v1/...`) só resolve dentro do ambiente deles e dava 404 no dev local.
 */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/flashtest-logo.png"
      alt="Flash Test"
      width={size}
      height={size}
      style={{ borderRadius: size >= 120 ? 28 : size >= 80 ? 20 : 8, display: "block" }}
    />
  );
}

/**
 * Raio da marca — motivo assinatura do design system. Usado como bullet, selo de
 * energia e indicador de streak. Sempre em Flash Gold, nunca esticado.
 */
export function Bolt({ size = 20, color = "#FEB803" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M13 2 L4 14 h6 l-1 8 9-12 h-6 z" fill={color} />
    </svg>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[440px] bg-white shadow-[0_0_60px_-20px_rgba(2,16,78,0.18)]">
      {children}
    </div>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <PhoneFrame>
      {title && (
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-white/95 px-5 py-4 backdrop-blur border-b border-mist">
          <BrandMark size={28} />
          <h1 className="font-display text-lg font-bold text-navy">{title}</h1>
        </header>
      )}
      <main className="pb-28">{children}</main>
      {/* O balão do tutor vive aqui: toda tela que usa AppShell é pós-quiz,
          então ele fica presente no app inteiro sem precisar ser remontado. */}
      <TutorBubble />
      <BottomNav />
    </PhoneFrame>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Os DOIS pilares do produto (aula de 60s e redação) ficam no nav; plano,
  // flashcards e ranking são alcançados pelo dashboard para não estourar
  // a barra em 6+ itens.
  const items = [
    { to: "/dashboard", label: "Início", icon: Home },
    { to: "/study", label: "Estudar", icon: BookOpen },
    { to: "/redacao", label: "Redação", icon: PenLine },
    { to: "/progress", label: "Progresso", icon: TrendingUp },
    { to: "/profile", label: "Perfil", icon: User },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2 border-t border-mist bg-white/95 backdrop-blur">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active ? "text-navy" : "text-navy-2"}`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
