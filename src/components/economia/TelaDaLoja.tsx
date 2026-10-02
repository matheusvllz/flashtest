/**
 * Loja das Pérolas (spec 50 §5.3.3, T-50.4.7). Proteção, vidas e estilo — nada de aprendizagem à venda, nada
 * pré-selecionado, sem urgência. O servidor decide saldo, preço, estoque e limite; a tela só mostra e pede.
 */
import { Link } from "@tanstack/react-router";
import { Heart, Palette, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import type { FocaRoupaId } from "@/lib/brand/foca-corpo";
import { IconePerola } from "@/components/economia/IconePerola";
import { comprarNaLoja, equiparCosmetico, minhaEconomia, type MinhaEconomia } from "@/lib/api/economia";
import { COPY } from "@/lib/copy";
import { LOJA, type ItemDaLoja } from "@/lib/perolas";
import { aplicarCompraConfirmada, aplicarSaldoDePerolas, useAppState, vidasAgora } from "@/lib/store";
import { cn } from "@/lib/utils";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "sem-conta" } | ({ tipo: "pronto" } & MinhaEconomia);

function novoPedido(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16));
}

export function TelaDaLoja() {
  const s = useAppState();
  const temConta = !!s.account?.userId;
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const t = COPY.loja;

  const carregar = useCallback(async () => {
    if (!temConta) return setEstado({ tipo: "sem-conta" });
    try {
      const r = await minhaEconomia();
      if (!r.ok) return setEstado({ tipo: "erro" });
      aplicarSaldoDePerolas(r.saldo);
      setEstado({ tipo: "pronto", ...r });
    } catch {
      setEstado({ tipo: "erro" });
    }
  }, [temConta]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function comprar(item: ItemDaLoja) {
    if (ocupado) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return setAviso(t.offline);
    setOcupado(item.id);
    setAviso(null);
    try {
      const r = await comprarNaLoja({ data: { itemId: item.id, pedidoId: novoPedido() } });
      if (r.ok) {
        aplicarCompraConfirmada(item.id, r.saldo);
        setAviso(t.pronto);
        await carregar();
      } else {
        const motivo = "motivo" in r ? r.motivo : r.codigo;
        setAviso((t.recusas as Record<string, string>)[motivo] ?? t.recusas.erro);
      }
    } catch {
      setAviso(t.recusas.erro);
    } finally {
      setOcupado(null);
    }
  }

  async function equipar(tipo: "roupa" | "tema", itemId: string | null) {
    if (ocupado) return;
    setOcupado(itemId ?? "tirar");
    try {
      await equiparCosmetico({ data: { tipo, itemId } });
      await carregar();
    } finally {
      setOcupado(null);
    }
  }

  const vidas = vidasAgora(s);
  const pronto = estado.tipo === "pronto" ? estado : null;
  const itens = (tipo: ItemDaLoja["tipo"][]) =>
    LOJA.filter((i) => tipo.includes(i.tipo) && (i.tipo !== "recarga" || vidas !== null));

  return (
    <AppShell title={t.titulo}>
      <div className="space-y-5 px-5 pt-2 pb-10" data-testid="tela-loja">
        {estado.tipo === "carregando" && <p className="text-sm text-nevoa">{COPY.perolas.carregando}</p>}
        {estado.tipo === "erro" && <p className="card-soft p-4 text-sm">{COPY.perolas.erro}</p>}
        {estado.tipo === "sem-conta" && (
          <div className="card-soft space-y-3 p-5 text-sm">
            <p>{t.semConta}</p>
            <Link to="/login" className="btn-primary w-full">
              {COPY.caderno.entrar}
            </Link>
          </div>
        )}
        {pronto && (
          <>
            <section className="card-soft flex items-center gap-3 p-4">
              <IconePerola size={40} decorative />
              <div>
                <p className="font-display text-2xl font-bold text-abismo" data-testid="saldo-loja">
                  {COPY.perolas.saldoAria(pronto.saldo)}
                </p>
                <p className="text-xs text-nevoa">{t.explica}</p>
              </div>
            </section>
            {aviso && (
              <p role="status" className="text-sm font-semibold text-abismo" data-testid="aviso-loja">
                {aviso}
              </p>
            )}

            <Secao titulo={t.secoes.protecao}>
              {itens(["protetor", "recarga"]).map((item) => (
                <Cartao
                  key={item.id}
                  item={item}
                  icone={item.tipo === "protetor" ? <Shield size={28} className="text-nevoa" /> : <Heart size={28} className="text-error" fill="currentColor" />}
                  saldo={pronto.saldo}
                  ocupado={ocupado === item.id}
                  onComprar={() => comprar(item)}
                  extra={item.tipo === "protetor" ? `${pronto.ofensiva.protetores}/${pronto.ofensiva.protetoresMax}` : undefined}
                />
              ))}
            </Secao>

            <Secao titulo={t.secoes.roupas}>
              {itens(["roupa"]).map((item) => {
                const tem = pronto.itens.includes(item.id);
                const roupa = item.id.replace("roupa:", "");
                return (
                  <Cartao
                    key={item.id}
                    item={item}
                    icone={<FocaMark forma="corpo" roupa={roupa as FocaRoupaId} size={56} decorative pose="parada" />}
                    saldo={pronto.saldo}
                    ocupado={ocupado === item.id}
                    onComprar={() => comprar(item)}
                    tem={tem}
                    emUso={pronto.roupa === item.id}
                    onEquipar={() => equipar("roupa", pronto.roupa === item.id ? null : item.id)}
                  />
                );
              })}
            </Secao>

            <Secao titulo={t.secoes.temas}>
              {itens(["tema"]).map((item) => (
                <Cartao
                  key={item.id}
                  item={item}
                  icone={<Palette size={28} className="text-mar" />}
                  saldo={pronto.saldo}
                  ocupado={ocupado === item.id}
                  onComprar={() => comprar(item)}
                  tem={pronto.itens.includes(item.id)}
                  emUso={pronto.tema === item.id}
                  onEquipar={() => equipar("tema", pronto.tema === item.id ? null : item.id)}
                />
              ))}
            </Secao>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="ds-label">{titulo}</h2>
      <ul className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">{children}</ul>
    </section>
  );
}

function Cartao({
  item,
  icone,
  saldo,
  ocupado,
  onComprar,
  tem = false,
  emUso = false,
  onEquipar,
  extra,
}: {
  item: ItemDaLoja;
  icone: React.ReactNode;
  saldo: number;
  ocupado: boolean;
  onComprar: () => void;
  tem?: boolean;
  emUso?: boolean;
  onEquipar?: () => void;
  extra?: string;
}) {
  const t = COPY.loja;
  const nome = t.itens[item.id];
  const falta = saldo < item.preco;
  return (
    <li className="card-soft flex items-center gap-3 p-3" data-testid={`item-${item.id}`}>
      <span className="grid h-14 w-14 shrink-0 place-items-center">{icone}</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-abismo">{nome.nome}</p>
        {nome.desc && <p className="text-xs text-nevoa">{nome.desc}</p>}
        {extra && <p className="text-xs text-nevoa">{extra}</p>}
        {!tem && (
          <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-abismo">
            <IconePerola size={14} decorative /> {t.preco(item.preco)}
          </p>
        )}
      </div>
      {tem ? (
        <button
          type="button"
          onClick={onEquipar}
          className={cn("chip tap-area shrink-0", emUso && "chip-on")}
          aria-pressed={emUso}
        >
          {emUso ? t.equipado : t.equipar}
        </button>
      ) : (
        <button type="button" onClick={onComprar} disabled={ocupado || falta} className="btn-outline shrink-0 px-3 text-[13px]">
          {ocupado ? t.comprando : t.comprar}
        </button>
      )}
    </li>
  );
}
