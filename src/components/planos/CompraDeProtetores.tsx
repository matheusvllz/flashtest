/**
 * Compra avulsa de protetores (spec 49 D49-05, §5.5, T-49.7.3). Pacote que passaria do teto do plano aparece
 * desativado (o servidor também recusa antes do pagamento). Mesmas garantias do checkout dos planos: declaração de
 * maioridade, pagamento no Asaas, nenhum dado de cartão no Foca.
 */
import { useEffect, useState } from "react";
import { iniciarCheckout, meuPlano } from "@/lib/api/planos";
import { COPY } from "@/lib/copy";
import { PRODUTOS, formatarReais, type CodigoProduto, type ProdutoProtetor } from "@/lib/planos";

const PACOTES = ["protetor_1", "protetor_3", "protetor_7"] as const;

export function CompraDeProtetores({ estoque, maximo }: { estoque: number; maximo: number }) {
  const [vendaLigada, setVendaLigada] = useState<boolean | null>(null);
  const [escolhido, setEscolhido] = useState<CodigoProduto | null>(null);
  const [metodo, setMetodo] = useState<"pix" | "cartao">("pix");
  const [declarou, setDeclarou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [indo, setIndo] = useState(false);

  useEffect(() => {
    meuPlano().then(
      (r) => setVendaLigada(r.ok ? r.vendaLigada : false),
      () => setVendaLigada(false),
    );
  }, []);

  if (vendaLigada === false) return <p className="text-sm text-nevoa">{COPY.protetores.vendaDesligada}</p>;
  if (estoque >= maximo) return <p className="text-sm text-nevoa">{COPY.protetores.estoqueCheio}</p>;

  async function pagar() {
    if (!escolhido) return;
    if (!declarou) {
      setErro(COPY.planos.declaracaoFalta);
      return;
    }
    setErro(null);
    setIndo(true);
    try {
      const r = await iniciarCheckout({ data: { produto: escolhido, metodo, declaroMaioridade: true } });
      if (!r.ok) {
        setErro(r.codigo === "ESTOQUE_CHEIO" ? COPY.protetores.naoCabe : r.codigo === "LIMITE_MENOR" ? COPY.protetores.limiteMenor : COPY.planos.erroCheckout);
        setIndo(false);
        return;
      }
      window.location.assign(r.link);
    } catch {
      setErro(COPY.planos.erroCheckout);
      setIndo(false);
    }
  }

  return (
    <div className="space-y-3 text-sm text-abismo" data-testid="compra-protetores">
      <p className="text-nevoa">{COPY.protetores.explica(maximo)}</p>
      <div className="space-y-2" role="radiogroup" aria-label={COPY.protetores.titulo}>
        {PACOTES.map((c) => {
          const p = PRODUTOS[c] as ProdutoProtetor;
          const cabe = estoque + p.quantidade <= maximo;
          return (
            <label key={c} className="flex min-h-11 items-center gap-2" aria-disabled={!cabe}>
              <input type="radio" name="pacote" disabled={!cabe} checked={escolhido === c} onChange={() => setEscolhido(c)} />
              <span className={cabe ? "" : "text-nevoa"}>
                {COPY.protetores.pacote(p.quantidade, formatarReais(p.centavos))}
                {!cabe && ` · ${COPY.protetores.naoCabe}`}
              </span>
            </label>
          );
        })}
      </div>
      {escolhido && (
        <>
          <fieldset className="space-y-1">
            <legend className="font-bold">{COPY.planos.metodo}</legend>
            {(["pix", "cartao"] as const).map((m) => (
              <label key={m} className="flex min-h-11 items-center gap-2">
                <input type="radio" name="metodo-protetor" checked={metodo === m} onChange={() => setMetodo(m)} />
                {m === "pix" ? "Pix" : "Cartão"}
              </label>
            ))}
          </fieldset>
          <p className="text-nevoa">{COPY.planos.quemPaga}</p>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" checked={declarou} onChange={(e) => setDeclarou(e.target.checked)} />
            <span>{COPY.planos.declaracao}</span>
          </label>
          {erro && (
            <p role="alert" className="text-error">
              {erro}
            </p>
          )}
          <button type="button" className="btn-primary w-full" disabled={indo} onClick={() => void pagar()}>
            {indo ? COPY.planos.indo : COPY.planos.irAoPagamento}
          </button>
          <p className="text-xs text-nevoa">{COPY.planos.pagamentoNoAsaas}</p>
        </>
      )}
    </div>
  );
}
