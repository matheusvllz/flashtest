/**
 * Cronograma até o ENEM no /plan (spec 49 §5.9 item 3, T-49.9.2). Basic e Pro; o portão é o servidor. O aluno diz
 * dias por semana, minutos por dia e a data da prova; a divisão da semana vem de `planoDaSemana` com o domínio por
 * área do modelo local, e se refaz sozinha a cada bloco feito.
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AREA_NAMES } from "@/content/taxonomy/areas";
import { meuCronograma, salvarCronograma } from "@/lib/api/funcoes";
import { COPY } from "@/lib/copy";
import { dataProvaPadrao, planoDaSemana } from "@/lib/cronograma";
import { dominioPorArea } from "@/lib/dominio-por-area";
import { useAppState } from "@/lib/store";
import type { CronogramaSalvo } from "@/server/estudo/cronograma";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro" }
  | { tipo: "fechado" }
  | { tipo: "pronto"; cronograma: CronogramaSalvo | null };

export function SecaoCronograma({ hoje, feitosSemana }: { hoje: string; feitosSemana: number }) {
  const s = useAppState();
  const temConta = !!s.account?.userId;
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [editando, setEditando] = useState(false);
  const t = COPY.cronograma;

  useEffect(() => {
    if (!temConta) return;
    let vivo = true;
    meuCronograma().then(
      (r) => {
        if (!vivo) return;
        if (!r.ok) setEstado({ tipo: "erro" });
        else if (r.fechado) setEstado({ tipo: "fechado" });
        else setEstado({ tipo: "pronto", cronograma: r.cronograma });
      },
      () => vivo && setEstado({ tipo: "erro" }),
    );
    return () => {
      vivo = false;
    };
  }, [temConta]);

  // Sem conta (demonstração) não há plano pago: a seção não aparece.
  if (!temConta || estado.tipo === "carregando") return null;

  return (
    <section className="card-soft p-4" aria-labelledby="plano-cronograma" data-testid="secao-cronograma">
      <h3 id="plano-cronograma" className="font-display font-bold text-abismo">
        {t.titulo}
      </h3>
      {estado.tipo === "erro" && <p className="mt-2 text-sm text-nevoa">{t.erro}</p>}
      {estado.tipo === "fechado" && (
        <>
          <p className="mt-2 text-sm text-nevoa">{t.fechado}</p>
          <Link to="/planos" className="btn-outline mt-3 w-full">
            {t.verPlanos}
          </Link>
        </>
      )}
      {estado.tipo === "pronto" &&
        (editando || !estado.cronograma ? (
          estado.cronograma || editando ? (
            <Formulario
              inicial={estado.cronograma}
              hoje={hoje}
              onSalvo={(c) => {
                setEstado({ tipo: "pronto", cronograma: c });
                setEditando(false);
              }}
            />
          ) : (
            <button type="button" className="btn-primary mt-3 w-full" onClick={() => setEditando(true)}>
              {t.configurar}
            </button>
          )
        ) : (
          <Resumo
            c={estado.cronograma}
            hoje={hoje}
            feitosSemana={feitosSemana}
            dominio={dominioPorArea(s.learning.skillModel)}
            onEditar={() => setEditando(true)}
          />
        ))}
    </section>
  );
}

function Resumo({
  c,
  hoje,
  feitosSemana,
  dominio,
  onEditar,
}: {
  c: CronogramaSalvo;
  hoje: string;
  feitosSemana: number;
  dominio: ReturnType<typeof dominioPorArea>;
  onEditar: () => void;
}) {
  const t = COPY.cronograma;
  const p = planoDaSemana(c, dominio, feitosSemana, hoje);
  return (
    <div className="mt-2 space-y-2 text-sm text-abismo">
      <p className="font-semibold" data-testid="cronograma-faltam">
        {t.faltam(p.diasAteProva)}
      </p>
      {c.dataProva === dataProvaPadrao(hoje) && <p className="text-xs text-nevoa">{t.dataEstimada}</p>}
      <p className="text-xs text-nevoa" data-testid="cronograma-meta">
        {t.meta(Math.min(feitosSemana, p.metaSemana), p.metaSemana)}
      </p>
      {p.faltamSemana === 0 ? (
        <p>{t.semanaFeita}</p>
      ) : (
        <>
          <p className="pt-1 text-xs font-bold text-nevoa">{t.proximos}</p>
          <ul className="space-y-1" data-testid="cronograma-areas">
            {p.porArea.map((a) => (
              <li key={a.area} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate">{a.area === "RED" ? t.redacao : AREA_NAMES[a.area]}</span>
                <span className="shrink-0 font-mono text-xs text-nevoa">{t.blocos(a.blocos)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <button type="button" className="tap-area text-xs font-bold text-nevoa underline" onClick={onEditar}>
        {t.editar}
      </button>
    </div>
  );
}

function Formulario({
  inicial,
  hoje,
  onSalvo,
}: {
  inicial: CronogramaSalvo | null;
  hoje: string;
  onSalvo: (c: CronogramaSalvo) => void;
}) {
  const t = COPY.cronograma;
  const [dias, setDias] = useState(inicial?.diasSemana ?? 5);
  const [minutos, setMinutos] = useState(inicial?.minutosDia ?? 30);
  const [data, setData] = useState(inicial?.dataProva ?? dataProvaPadrao(hoje));
  const [erro, setErro] = useState(false);
  const [indo, setIndo] = useState(false);

  async function salvar() {
    setErro(false);
    setIndo(true);
    try {
      const r = await salvarCronograma({ data: { diasSemana: dias, minutosDia: minutos, dataProva: data } });
      if (r.ok) onSalvo(r.cronograma);
      else setErro(true);
    } catch {
      setErro(true);
    }
    setIndo(false);
  }

  return (
    <div className="mt-3 space-y-3 text-sm text-abismo">
      <fieldset>
        <legend className="font-semibold">{t.dias}</legend>
        <div className="mt-1.5 grid grid-cols-7 gap-1" role="radiogroup" aria-label={t.dias}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={dias === n}
              onClick={() => setDias(n)}
              className={dias === n ? "chip chip-on min-h-11 justify-center" : "chip min-h-11 justify-center"}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="font-semibold">{t.minutos}</legend>
        <div className="mt-1.5 grid grid-cols-4 gap-1" role="radiogroup" aria-label={t.minutos}>
          {[15, 30, 45, 60].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={minutos === n}
              onClick={() => setMinutos(n)}
              className={minutos === n ? "chip chip-on min-h-11 justify-center" : "chip min-h-11 justify-center"}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="font-semibold">{t.dataProva}</span>
        <input type="date" className="input-ds mt-1.5" value={data} min={hoje} onChange={(e) => setData(e.target.value)} />
      </label>
      {data === dataProvaPadrao(hoje) && <p className="text-xs text-nevoa">{t.dataEstimada}</p>}
      {erro && (
        <p role="alert" className="text-error">
          {t.erroSalvar}
        </p>
      )}
      <button type="button" disabled={indo || !/^\d{4}-\d{2}-\d{2}$/.test(data)} onClick={() => void salvar()} className="btn-primary w-full">
        {t.salvar}
      </button>
    </div>
  );
}
