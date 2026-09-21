import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BRAND, PALETTE } from "../lib/brand";
import { PhoneFrame } from "../components/AppShell";
import { FocaMark } from "../components/brand/FocaMark";
import { fala } from "../lib/voz";

function NotFoundComponent() {
  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neve px-6 text-center">
        <FocaMark expression="entediada" size={96} decorative />
        <div>
          <h1 className="font-display text-xl font-bold text-abismo">Essa página não existe.</h1>
          <p className="mt-2 text-sm text-nevoa">{fala("404")}</p>
        </div>
        <Link to="/" className="btn-primary mt-2">
          Voltar ao início
        </Link>
      </div>
    </PhoneFrame>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neve px-6 text-center">
        <FocaMark expression="entediada" size={96} decorative />
        <div>
          <h1 className="font-display text-xl font-bold text-abismo">Isso aqui não carregou.</h1>
          <p className="mt-2 text-sm text-nevoa">
            Deu ruim do nosso lado. Tenta de novo ou volta pro início.
          </p>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2">
          <button
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
    </PhoneFrame>
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
      { property: "og:title", content: BRAND.name },
      { property: "og:description", content: BRAND.tagline },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/branding/foca/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/branding/foca/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/branding/foca/apple-touch-icon.png" },
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

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
