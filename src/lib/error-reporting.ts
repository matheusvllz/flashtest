/**
 * Relato de erro capturado por um error boundary (docs/specs/46-producao T-03.2).
 *
 * Substitui o `lovable-error-reporting.ts`, que só falava com o editor da Lovable e não fazia
 * nada fora dele. Hoje o destino é o console, numa linha estruturada e sem dado pessoal (só a
 * rota, o boundary e a mensagem). É o ponto único para ligar um serviço de observabilidade no
 * futuro — o que depende de decisão própria, por envolver dados de adolescentes
 * (docs/seguranca/privacidade.md).
 */
export function reportarErro(error: unknown, contexto: { boundary: string }): void {
  if (typeof window === "undefined") return;
  // Loaders e server functions costumam lançar um `Response` cru; `String(Response)` é opaco.
  const mensagem =
    error instanceof Response
      ? `Response ${error.status}`
      : error instanceof Error
        ? error.message
        : String(error);
  console.error("[foca:erro]", {
    boundary: contexto.boundary,
    rota: window.location.pathname,
    mensagem: mensagem.slice(0, 300),
  });
}
