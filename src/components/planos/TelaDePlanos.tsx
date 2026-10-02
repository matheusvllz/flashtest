/**
 * Tela de planos (spec 49 §6, T-49.3.4). Mostra Free, Basic e Pro com preços e benefícios do catálogo, a alternância
 * mensal/anual com o total e o equivalente mensal, e a folha "Antes de pagar" (renovação, cancelamento,
 * arrependimento, maioridade). Sem contagem regressiva, sem pré-seleção do anual, sem urgência.
 */
import { Check, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { iniciarCheckout, meuPlano } from "@/lib/api/planos";
import { COPY } from "@/lib/copy";
import {
  BENEFICIOS,
  ENTREGAS_PUBLICADAS,
  PRODUTOS,
  VIDAS_POR_DIA,
  formatarReais,
  resumoDoAnual,
  type CodigoProduto,
  type Entrega,
  type Plano,
} from "@/lib/planos";
import { cn } from "@/lib/utils";

const NOME: Record<Plano, string> = { gratis: "Free", basic: "Basic", pro: "Pro" };
type Periodo = "mensal" | "anual";

interface Linha {
  texto: string;
  entrega: Entrega;
}

function linhas(plano: Plano): Linha[] {
  const b = COPY.planos.beneficios;
  if (plano === "gratis") {
    return [
      { texto: b.essencial, entrega: "E1" },
      { texto: b.iaDia(BENEFICIOS.gratis.iaMensagensDia), entrega: "E1" },
      { texto: b.protetores(BENEFICIOS.gratis.protetoresEstoqueMax), entrega: "E1" },
      { texto: b.vidas(VIDAS_POR_DIA), entrega: "E2" },
      { texto: b.comAnuncios, entrega: "E2" },
    ];
  }
  if (plano === "basic") {
    return [
      { texto: b.tudoDoFree, entrega: "E1" },
      { texto: b.iaDiaFotos(BENEFICIOS.basic.iaMensagensDia, BENEFICIOS.basic.iaFotosDia), entrega: "E1" },
      { texto: b.semAnunciosVidas, entrega: "E2" },
      { texto: b.protetoresBonus(BENEFICIOS.basic.protetoresBonusMes, BENEFICIOS.basic.protetoresEstoqueMax), entrega: "E2" },
      { texto: b.funcoesBasic, entrega: "E3" },
    ];
  }
  return [
    { texto: b.tudoDoBasic, entrega: "E1" },
    { texto: b.iaDiaFotos(BENEFICIOS.pro.iaMensagensDia, BENEFICIOS.pro.iaFotosDia), entrega: "E1" },
    { texto: b.corretor(BENEFICIOS.pro.correcoesRedacaoMes), entrega: "E3" },
    { texto: b.funcoesPro, entrega: "E3" },
    { texto: b.protetoresBonus(BENEFICIOS.pro.protetoresBonusMes, BENEFICIOS.pro.protetoresEstoqueMax), entrega: "E2" },
  ];
}

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "pronto"; plano: Plano; vendaLigada: boolean };

export function TelaDePlanos() {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [escolhido, setEscolhido] = useState<Exclude<Plano, "gratis"> | null>(null);

  const carregar = () => {
    setEstado({ tipo: "carregando" });
    meuPlano().then(
      (r) => setEstado(r.ok ? { tipo: "pronto", plano: r.plano, vendaLigada: r.vendaLigada } : { tipo: "erro" }),
      () => setEstado({ tipo: "erro" }),
    );
  };
  useEffect(carregar, []);

  return (
    <AppShell title={COPY.planos.titulo} layout="wide">
      <div className="px-5 pt-4 pb-8 space-y-4 lg:px-8" data-testid="tela-planos">
        <div role="radiogroup" aria-label={COPY.planos.titulo} className="mx-auto flex w-full max-w-xs rounded-2xl bg-gelo p-1">
          {(["mensal", "anual"] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={periodo === p}
              onClick={() => setPeriodo(p)}
              className={cn("min-h-11 flex-1 rounded-xl text-sm font-bold", periodo === p ? "bg-cards text-abismo shadow-sm" : "text-nevoa")}
            >
              {p === "mensal" ? COPY.planos.mensal : COPY.planos.anual}
            </button>
          ))}
        </div>

        {estado.tipo === "erro" && (
          <div className="card-soft p-4 text-sm" role="alert">
            <p>{COPY.planos.erroCarregar}</p>
            <button type="button" onClick={carregar} className="btn-ghost mt-3 w-full">
              {COPY.planos.tentarDeNovo}
            </button>
          </div>
        )}
        {estado.tipo === "pronto" && !estado.vendaLigada && (
          <p className="card-soft p-4 text-sm text-abismo" data-testid="venda-desligada">
            {COPY.planos.vendaDesligada}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {(["gratis", "basic", "pro"] as const).map((plano) => {
            const atual = estado.tipo === "pronto" && estado.plano === plano;
            const pode = estado.tipo === "pronto" && estado.vendaLigada && plano !== "gratis" && !atual && !(estado.plano === "pro");
            return (
              <section
                key={plano}
                aria-labelledby={`plano-${plano}`}
                data-testid={`cartao-${plano}`}
                className={cn("card-soft flex flex-col p-5", plano === "basic" && "border-mar")}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 id={`plano-${plano}`} className="font-display text-xl font-bold text-abismo">
                    {NOME[plano]}
                  </h2>
                  {atual && <span className="rounded-full bg-gelo px-2 py-0.5 text-xs font-bold text-abismo">{COPY.planos.seuPlano}</span>}
                </div>
                <Preco plano={plano} periodo={periodo} />
                <ul className="mt-4 flex-1 space-y-2 text-sm text-abismo">
                  {linhas(plano).map((l) => {
                    const breve = !ENTREGAS_PUBLICADAS.has(l.entrega);
                    return (
                      <li key={l.texto} className={cn("flex gap-2", breve && "text-nevoa")}>
                        {breve ? <Clock size={16} className="mt-0.5 shrink-0" aria-hidden /> : <Check size={16} className="mt-0.5 shrink-0 text-success-texto" aria-hidden />}
                        <span>
                          {l.texto}
                          {breve && ` (${COPY.planos.emBreve})`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {plano !== "gratis" && (
                  <button
                    type="button"
                    disabled={!pode}
                    onClick={() => setEscolhido(plano)}
                    className={cn("mt-5 w-full", plano === "basic" ? "btn-primary" : "btn-outline")}
                  >
                    {COPY.planos.assinar(NOME[plano])}
                  </button>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <BottomSheet open={escolhido !== null} onClose={() => setEscolhido(null)} title={COPY.planos.antesDePagar}>
        {escolhido && <AntesDePagar plano={escolhido} periodo={periodo} />}
      </BottomSheet>
    </AppShell>
  );
}

function Preco({ plano, periodo }: { plano: Plano; periodo: Periodo }) {
  if (plano === "gratis") return <p className="mt-2 font-display text-2xl font-bold text-abismo">{COPY.planos.gratis}</p>;
  if (periodo === "mensal") {
    return <p className="mt-2 font-display text-2xl font-bold text-abismo">{COPY.planos.porMes(formatarReais(PRODUTOS[`${plano}_mensal`].centavos))}</p>;
  }
  const r = resumoDoAnual(plano);
  return (
    <div className="mt-2">
      <p className="font-display text-2xl font-bold text-abismo">{COPY.planos.porAno(formatarReais(r.totalCentavos))}</p>
      <p className="mt-1 text-sm text-nevoa">{COPY.planos.equivaleA(formatarReais(r.porMesCentavos), `${String(r.descontoPct).replace(".", ",")}%`)}</p>
    </div>
  );
}

function AntesDePagar({ plano, periodo }: { plano: Exclude<Plano, "gratis">; periodo: Periodo }) {
  const [metodo, setMetodo] = useState<"cartao" | "pix">("cartao");
  const [declarou, setDeclarou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [indo, setIndo] = useState(false);
  const codigo = `${plano}_${periodo}` as CodigoProduto;
  const preco = formatarReais(PRODUTOS[codigo].centavos);
  const resumo =
    periodo === "mensal"
      ? COPY.planos.resumoMensal(NOME[plano], preco)
      : metodo === "pix"
        ? COPY.planos.resumoAnualPix(NOME[plano], preco)
        : COPY.planos.resumoAnualCartao(NOME[plano], preco);

  async function pagar() {
    if (!declarou) {
      setErro(COPY.planos.declaracaoFalta);
      return;
    }
    setErro(null);
    setIndo(true);
    try {
      const r = await iniciarCheckout({ data: { produto: codigo, metodo: periodo === "anual" ? metodo : "cartao", declaroMaioridade: true } });
      if (!r.ok) {
        setErro(r.codigo === "JA_ASSINANTE" ? COPY.planos.jaAssinante : COPY.planos.erroCheckout);
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
    <div className="space-y-3 text-sm text-abismo" data-testid="antes-de-pagar">
      <p className="font-bold">{resumo}</p>
      <p>{COPY.planos.cancelarQuandoQuiser}</p>
      <p>{COPY.planos.arrependimento}</p>
      {periodo === "anual" && (
        <fieldset className="space-y-2">
          <legend className="font-bold">{COPY.planos.metodo}</legend>
          {(["cartao", "pix"] as const).map((m) => (
            <label key={m} className="flex min-h-11 items-center gap-2">
              <input type="radio" name="metodo" checked={metodo === m} onChange={() => setMetodo(m)} />
              {m === "cartao" ? COPY.planos.metodoCartao : COPY.planos.metodoPix}
            </label>
          ))}
        </fieldset>
      )}
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
      <button type="button" onClick={() => void pagar()} disabled={indo} className="btn-primary w-full">
        {indo ? COPY.planos.indo : COPY.planos.irAoPagamento}
      </button>
      <p className="text-xs text-nevoa">{COPY.planos.pagamentoNoAsaas}</p>
    </div>
  );
}
