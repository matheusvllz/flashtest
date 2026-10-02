import { Component, lazy, Suspense, type ReactNode } from "react";
import type { ExerciseImage } from "@/lib/lessons/types";
import { carregarVisualizador } from "./carregar-visualizador";

/**
 * Visualizador carregado só quando alguém pede para ampliar (spec 50 §7: componente preguiçoso, fora do
 * chunk do player). Se o download falhar (sem internet), o pedido só não abre: a questão continua de pé e
 * o próximo toque tenta de novo.
 */
let Visualizador = lazy(carregarVisualizador);

class SemVisualizador extends Component<
  { onFalha: () => void; children: ReactNode },
  { falhou: boolean }
> {
  state = { falhou: false };
  static getDerivedStateFromError() {
    return { falhou: true };
  }
  componentDidCatch() {
    // `lazy` guarda a promessa rejeitada: um componente novo permite tentar de novo.
    Visualizador = lazy(carregarVisualizador);
    this.props.onFalha();
  }
  render() {
    return this.state.falhou ? null : this.props.children;
  }
}

export function VisualizadorSobDemanda(props: {
  imagem: ExerciseImage;
  titulo?: string;
  onClose: () => void;
  devolverFocoPara?: () => HTMLElement | null;
}) {
  return (
    <SemVisualizador onFalha={props.onClose}>
      <Suspense fallback={null}>
        <Visualizador {...props} />
      </Suspense>
    </SemVisualizador>
  );
}
