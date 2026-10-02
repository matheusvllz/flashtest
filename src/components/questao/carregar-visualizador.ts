/**
 * Download sob demanda do visualizador de imagem (spec 50 §7): o chunk só vem quando alguém toca, foca ou
 * passa o mouse num botão de ampliar. Separado de `VisualizadorSobDemanda.tsx` para aquele arquivo exportar
 * só componente (Fast Refresh).
 */
export const carregarVisualizador = () => import("./VisualizadorDeImagem");

let precarregado = false;

/** Adianta o download no primeiro sinal de interesse, para o diálogo abrir sem espera perceptível. */
export function precarregarVisualizador(): void {
  if (precarregado) return;
  precarregado = true;
  void carregarVisualizador().catch(() => {
    // Sem internet: o próximo pedido tenta de novo.
    precarregado = false;
  });
}
