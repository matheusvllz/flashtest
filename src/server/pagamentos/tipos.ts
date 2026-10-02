/**
 * Contrato do provedor de pagamento (spec 49 §11, T-49.3.1). O Asaas implementa por `fetch` (`asaas.ts`); o provedor
 * falso (`falso.ts`) serve a desenvolvimento local e testes, nunca a um ambiente implantado. Trocar de gateway é trocar
 * o adaptador, não o produto.
 */
import type { CodigoProduto } from "@/lib/planos";

export type StatusCobranca = "pendente" | "paga" | "atrasada" | "reembolsada" | "estornada" | "cancelada";

/** Cobrança como o provedor a confirma (consultada na API, nunca lida do corpo do webhook). */
export interface CobrancaExterna {
  id: string;
  status: StatusCobranca;
  valorCentavos: number;
  metodo: "cartao" | "pix" | "boleto" | null;
  /** Vencimento AAAA-MM-DD (base do período pago); nulo se o provedor não informar. */
  vencimento: string | null;
  pagaEm: Date | null;
  /** Assinatura de origem no provedor, se for uma mensalidade/anuidade recorrente. */
  assinaturaId: string | null;
  /** `externalReference` (o id interno da compra), se o provedor o propagar. */
  referencia: string | null;
  /** Checkout de origem, se o provedor o informar. */
  checkoutId: string | null;
}

export interface AssinaturaExterna {
  id: string;
  ativa: boolean;
  referencia: string | null;
  checkoutId: string | null;
}

export interface CheckoutExterno {
  id: string;
  referencia: string | null;
  status: "aberto" | "pago" | "expirado" | "cancelado";
}

export interface PedidoDeCheckout {
  compraId: string;
  produto: CodigoProduto;
  metodo: "cartao" | "pix";
  urls: { sucesso: string; cancelado: string; expirado: string };
}

export interface Provedor {
  nome: "asaas" | "teste";
  criarCheckout(p: PedidoDeCheckout): Promise<{ checkoutId: string; link: string }>;
  buscarCobranca(id: string): Promise<CobrancaExterna | null>;
  buscarAssinatura(id: string): Promise<AssinaturaExterna | null>;
  buscarCheckout(id: string): Promise<CheckoutExterno | null>;
  cancelarAssinatura(id: string): Promise<void>;
  reembolsarCobranca(id: string): Promise<void>;
}

/** Evento de webhook já normalizado: só ids e tipo (o corpo não é confiável nem guardado). */
export interface EventoDePagamento {
  id: string;
  tipo: string;
  cobrancaId: string | null;
  assinaturaId: string | null;
  checkoutId: string | null;
}
