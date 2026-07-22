import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * O onboarding de 7 passos foi absorvido pelo quiz unificado (SDD 12, Development 1):
 * uma coisa só, sem e-mail/senha e com questões de conteúdo real. Mantido como redirect
 * para links antigos não caírem em 404 durante a demo.
 */
export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/quiz" });
  },
});
