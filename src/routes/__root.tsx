import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BRAND, PALETTE } from "../lib/brand";
import { FocaMark } from "../components/brand/FocaMark";
import { fala } from "../lib/voz";
import {
  setAudioEnabled,
  stopAllFeedbackSounds,
  unlockAudioFromGesture,
} from "../lib/audio/engine";

/**
 * A raiz é carregada por TODA rota, inclusive a landing (`/`). Por isso ela não importa o store, o AppShell nem nada
 * que puxe o conteúdo do produto (docs/44 §3, code splitting): o banner de persistência entra sob demanda e só fora
 * da landing, e as páginas de erro usam a coluna do app direto, sem o AppShell.
 */
const PersistenceBanner = lazy(() => import("../components/PersistenceBanner").then((m) => ({ default: m.PersistenceBanner })));

/** Coluna do app sem importar o AppShell (mesmas classes do PhoneFrame "app"). */
function ColunaSimples({ children }: { children: ReactNode }) {
  return <div className="frame-border mx-auto min-h-screen w-full max-w-[var(--app-col)] bg-neve [--frame-col:var(--app-col)]">{children}</div>;
}

/** Som ligado? Lido direto do estado salvo (a mesma chave do store), sem carregar o store na raiz. */
function somLigado(): boolean {
  try {
    const bruto = localStorage.getItem("foca.state.v3");
    const prefs = bruto ? (JSON.parse(bruto) as { prefs?: { sound?: boolean } }).prefs : undefined;
    return prefs?.sound !== false;
  } catch {
    return true;
  }
}

function NotFoundComponent() {
  // Uma vez por montagem, não a cada render (docs/20 §3 B1, §4.1).
  const [texto] = useState(() => fala("404"));
  return (
    <ColunaSimples>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neve px-6 text-center">
        <FocaMark expression="entediada" size={96} decorative />
        <div>
          <h1 className="font-display text-xl font-bold text-abismo">Essa página não existe.</h1>
          <p className="mt-2 text-sm text-nevoa">{texto}</p>
        </div>
        <Link to="/" className="btn-primary mt-2">
          Voltar ao início
        </Link>
      </div>
    </ColunaSimples>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <ColunaSimples>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neve px-6 text-center">
        <FocaMark expression="desapontada" size={96} decorative />
        <div>
          <h1 className="font-display text-xl font-bold text-abismo">Isso aqui não carregou.</h1>
          <p className="mt-2 text-sm text-nevoa">
            Deu ruim do nosso lado. Tenta de novo ou volta pro início.
          </p>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary w-full"
          >
            Tentar de novo
          </button>
          <a href="/" className="btn-ghost w-full">
            Voltar ao início
          </a>
        </div>
      </div>
    </ColunaSimples>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: PALETTE.neve, media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: PALETTE.neveDark, media: "(prefers-color-scheme: dark)" },
      { title: `${BRAND.name} — ${BRAND.tagline}` },
      {
        name: "description",
        content: BRAND.description,
      },
      // O produto não é indexável (docs/44 §7); a landing (`/`) sobrescreve com "index, follow".
      { name: "robots", content: "noindex, nofollow" },
      { name: "application-name", content: BRAND.name },
      { name: "apple-mobile-web-app-title", content: BRAND.name },
      { property: "og:title", content: BRAND.name },
      { property: "og:description", content: BRAND.tagline },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/branding/foca/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Fontes autohospedadas (docs/44 §4): só a de título tem preload (é o LCP da landing e os títulos do app).
      { rel: "preload", href: "/fonts/space-grotesk-latin-wght.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      // Ícone institucional = logo oficial sobre o azul --mar (regra I-4, docs/44 §1; gerado por scripts/gerar-marca.ts).
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/branding/foca/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/branding/foca/favicon-16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/branding/foca/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/branding/foca/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * Aplica `.dark` no <html> ANTES do primeiro paint, lendo `prefs.theme`
 * ("auto" | "light" | "dark") de `foca.state.v3` — sem isso, o app pisca
 * claro e depois escurece em quem usa o SO no escuro (docs/18 §12.4, D4).
 * `prefs.theme` só existe no store a partir da Fase 6; até lá o default é
 * "auto" e o script só respeita o sistema. Silencioso de propósito: um erro
 * aqui não pode impedir o app de renderizar.
 */
const DARK_MODE_SCRIPT = `(function(){try{
  var raw = localStorage.getItem("foca.state.v3");
  var theme = "auto";
  if (raw) {
    var parsed = JSON.parse(raw);
    if (parsed && parsed.prefs && parsed.prefs.theme) theme = parsed.prefs.theme;
  }
  var dark = theme === "dark" || (theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.documentElement.classList.add("dark");
}catch(e){}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: DARK_MODE_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const naLanding = useRouterState({ select: (s) => s.location.pathname === "/" });

  useEffect(() => {
    const unlock = () => {
      // A landing (`/`) não tem som: destravar o áudio ali baixaria os efeitos do produto para quem só está lendo
      // a página (docs/44 §9). O destravamento acontece no primeiro gesto dentro do produto.
      if (router.state.location.pathname === "/") return;
      const enabled = somLigado();
      setAudioEnabled(enabled);
      if (enabled) unlockAudioFromGesture();
    };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
    const unsubscribe = router.subscribe("onBeforeNavigate", stopAllFeedbackSounds);
    return () => {
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
      unsubscribe();
      stopAllFeedbackSounds();
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Aviso de persistência local (docs/36 T-05.1/T-05.3): acima de toda rota, inclusive as sem AppShell. */}
      {!naLanding && (
        <Suspense fallback={null}>
          <PersistenceBanner />
        </Suspense>
      )}
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
