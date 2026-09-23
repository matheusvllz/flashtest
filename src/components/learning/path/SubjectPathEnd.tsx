import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FocaMark, type FocaExpression } from "@/components/brand/FocaMark";
import { COPY } from "@/lib/copy";
import { fala, type VozSlot } from "@/lib/voz";

/**
 * Fim da matéria: nada pendente para estudar (RF-12). Quando o retorno
 * (`greeting.slot === "retorno"`, `diasSemAtividade ≥ 2`) coincide com a
 * matéria selecionada estar toda concluída, a acolhida continua vencendo
 * (docs/15 §3.2: "acolhedora tem prioridade sobre tudo") — sem isso, sumir
 * e voltar bem-vindo a uma matéria já fechada mostraria só "fechei tudo",
 * silenciosamente perdendo a prioridade que o `TrailHeader` garantia
 * globalmente antes desta tela existir (achado da revisão de T-28).
 */
export function SubjectPathEnd({
  subjectName,
  greeting,
}: {
  subjectName: string;
  greeting: { slot: VozSlot; expression: FocaExpression };
}) {
  const acolhendo = greeting.slot === "retorno";
  // Uma vez por montagem, não a cada render (docs/20 §3 B1, §4.1).
  const [textoAcolhida] = useState(() => (acolhendo ? fala(greeting.slot) : ""));

  return (
    <div className="mt-8 flex flex-col items-center gap-3 px-4 text-center">
      <FocaMark expression={acolhendo ? greeting.expression : "orgulhosa"} size={72} decorative motion="pop" />
      {acolhendo && <p className="text-sm font-semibold leading-snug text-abismo">{textoAcolhida}</p>}
      <p className="font-display text-lg font-bold text-abismo">{COPY.trilha.fimDaMateria(subjectName)}</p>
      <Link to="/study" className="btn-outline">
        {COPY.trilha.praticar}
      </Link>
    </div>
  );
}
