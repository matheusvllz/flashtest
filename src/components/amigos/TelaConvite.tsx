/**
 * Convite para ofensiva em dupla (spec 50 §5.6.2, T-50.14.4). Quem pode aceitar (18+, com apelido) vê só o apelido de
 * quem convidou e "Começar ofensiva em dupla?". Menor, sem conta, bloqueado, convite vencido ou usado: a mesma tela
 * genérica ("Convite indisponível."), sem nada de quem convidou.
 */
import { Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { abrirConvite, pedirDupla } from "@/lib/api/amigos";
import { COPY } from "@/lib/copy";
import type { AberturaDoConvite } from "@/server/social/amigos";
import { FormApelido } from "./FormApelido";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "indisponivel" }
  | { tipo: "sem-conta" }
  | { tipo: "pedido" }
  | ({ tipo: "pronto" } & AberturaDoConvite);

export function TelaConvite() {
  const { codigo } = useParams({ from: "/amigos_/convite/$codigo" });
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [erro, setErro] = useState<string | null>(null);
  const t = COPY.amigos.convite;

  const carregar = useCallback(
    () =>
      abrirConvite({ data: { codigo } }).then(
        // Qualquer recusa (inclusive MENOR_DE_IDADE) vira a mesma tela genérica; sem sessão, também (com "Entrar").
        (r) => setEstado(r.ok ? { tipo: "pronto", ...r } : r.codigo === "SEM_SESSAO" ? { tipo: "sem-conta" } : { tipo: "indisponivel" }),
        () => setEstado({ tipo: "indisponivel" }),
      ),
    [codigo],
  );
  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function pedir() {
    setErro(null);
    try {
      const r = await pedirDupla({ data: { codigo } });
      if (r.ok) setEstado({ tipo: "pedido" });
      else if (r.codigo === "LIMITE_DE_DUPLAS") setErro(COPY.amigos.limiteDuplas);
      else setEstado({ tipo: "indisponivel" });
    } catch {
      setEstado({ tipo: "indisponivel" });
    }
  }

  const indisponivel =
    estado.tipo === "indisponivel" ||
    estado.tipo === "sem-conta" ||
    (estado.tipo === "pronto" && estado.estado === "indisponivel");

  return (
    <AppShell title={t.titulo}>
      <div className="space-y-4 px-5 pt-4 pb-10" data-testid="tela-convite" data-estado={estado.tipo === "pronto" ? estado.estado : estado.tipo}>
        {estado.tipo === "carregando" && <p className="text-sm text-nevoa">…</p>}
        {indisponivel && (
          <div className="card-soft space-y-3 p-5 text-sm">
            <p data-testid="convite-indisponivel">{t.indisponivel}</p>
            {estado.tipo === "sem-conta" && (
              <Link to="/login" className="btn-primary w-full">
                {t.entrar}
              </Link>
            )}
          </div>
        )}
        {estado.tipo === "pronto" && estado.estado === "sem-apelido" && (
          <FormApelido confirmar={estado.confirmarNascimento} onPronto={() => void carregar()} />
        )}
        {estado.tipo === "pronto" && estado.estado === "limite" && (
          <p className="card-soft p-4 text-sm">{COPY.amigos.limiteDuplas}</p>
        )}
        {estado.tipo === "pronto" && estado.estado === "ja-em-dupla" && (
          <p className="card-soft p-4 text-sm">{t.jaEmDupla}</p>
        )}
        {estado.tipo === "pronto" && estado.estado === "disponivel" && (
          <section className="card-soft space-y-4 p-5 text-sm text-abismo">
            <p className="font-display text-lg font-bold" data-testid="convite-pergunta">
              {t.pergunta(estado.apelido)}
            </p>
            {erro && (
              <p role="alert" className="text-error">
                {erro}
              </p>
            )}
            <button type="button" className="btn-primary w-full" onClick={() => void pedir()}>
              {t.pedir}
            </button>
          </section>
        )}
        {estado.tipo === "pedido" && (
          <div className="card-soft space-y-3 p-5 text-sm">
            <p role="status">{t.pedido}</p>
            <Link to="/amigos" className="btn-ghost w-full">
              {t.verAmigos}
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
