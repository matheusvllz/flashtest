import { Link } from "@tanstack/react-router";
import { COPY } from "@/lib/copy";
import { textoDoBloqueio } from "@/lib/redacao-bloqueio";
import type { Bloqueio } from "@/server/redacao/redacao";

export function CartaoBloqueio({ bloqueio }: { bloqueio: Bloqueio }) {
  return (
    <section className="card-soft space-y-3 p-5 text-sm text-abismo" data-testid="redacao-bloqueio" data-bloqueio={bloqueio}>
      <p>{textoDoBloqueio(bloqueio)}</p>
      {bloqueio === "fechado" && (
        <Link to="/planos" className="btn-primary w-full">
          {COPY.redacaoIa.verPlanos}
        </Link>
      )}
    </section>
  );
}
