import type { ComponentType } from "react";
import type { IslandName } from "./components/Island";
import { HowItWorks } from "./sections/HowItWorks";

/** Hidratada já: o passo ativo do "Como funciona" acompanha a rolagem desde o começo. */
export const ILHAS_AGORA: Partial<Record<IslandName, ComponentType>> = {
  "como-funciona": HowItWorks,
};

/**
 * Hidratadas sob demanda (chunk próprio, fora do JS inicial, docs/40 §16): quando a ilha chega perto da tela ou no
 * primeiro toque/tecla nela. O React reencena o clique que chegou antes de a hidratação terminar.
 */
export const ILHAS_DEPOIS: Partial<Record<IslandName, () => Promise<ComponentType>>> = {
  "tenta-uma": () => import("./sections/TryOne").then((m) => m.TryOne),
  duvidas: () => import("./sections/Faq").then((m) => m.Faq),
};
