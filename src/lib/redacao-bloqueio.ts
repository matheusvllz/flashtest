import { COPY } from "@/lib/copy";
import type { Bloqueio } from "@/server/redacao/redacao";

/** Texto de cada porta fechada do corretor e do treino (spec 49 §5.9). */
export function textoDoBloqueio(b: Bloqueio | "limite" | "limiteIa" | "recusado" | "falha"): string {
  const t = COPY.redacaoIa;
  switch (b) {
    case "fechado":
      return t.fechado;
    case "desligado-servidor":
      return t.desligado;
    case "consentimento":
      return t.consentimento;
    case "ia-desligada":
      return t.iaDesligada;
    case "indisponivel":
      return t.indisponivel;
    case "limite":
      return t.limiteMes;
    case "limiteIa":
      return t.limiteIa;
    case "recusado":
      return t.recusado;
    case "falha":
      return t.falha;
  }
}
