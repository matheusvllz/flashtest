/**
 * Caderno de erros (spec 49 §5.9 item 2, T-49.9.1): o que voltou para hoje, a explicação oficial de cada questão e,
 * só no toque, a Foca IA (regra dura 7). "Revisar agora" roda as questões do dia no player das lições.
 */
import { Link } from "@tanstack/react-router";
import { ChevronDown, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MicroLessonPlayer } from "@/components/learning/MicroLessonPlayer";
import { itemMetaOf } from "@/content/items";
import { resolveExercise } from "@/content/microlicoes";
import { SKILL_MAP } from "@/content/taxonomy";
import { SUBJECT_MAP } from "@/data/subjects";
import { meuCaderno } from "@/lib/api/funcoes";
import { itensRevisaveis, licaoDoCaderno } from "@/lib/caderno";
import { carregarPacotesPara } from "@/lib/content/preload";
import { COPY } from "@/lib/copy";
import { focusFromExercise } from "@/lib/lessons/tutor-focus";
import { openTutorWithContext, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ItemDoCaderno } from "@/server/estudo/caderno";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro" }
  | { tipo: "sem-conta" }
  | { tipo: "fechado"; itens: ItemDoCaderno[] }
  | { tipo: "pronto"; itens: ItemDoCaderno[]; hoje: string };

function dataCurta(dia: string): string {
  const [, m, d] = dia.split("-");
  return `${d}/${m}`;
}

export function TelaDoCaderno() {
  const temConta = !!useAppState().account?.userId;
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [revisando, setRevisando] = useState<string[] | null>(null);
  const t = COPY.caderno;

  const carregar = useCallback(async () => {
    if (!temConta) return setEstado({ tipo: "sem-conta" });
    try {
      const r = await meuCaderno();
      if (!r.ok) return setEstado({ tipo: "erro" });
      await carregarPacotesPara([], r.itens.map((i) => i.itemId));
      if (r.fechado) return setEstado({ tipo: "fechado", itens: r.itens });
      setEstado({ tipo: "pronto", itens: r.itens, hoje: r.hoje });
    } catch {
      setEstado({ tipo: "erro" });
    }
  }, [temConta]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const licao = useMemo(
    () => (revisando && estado.tipo === "pronto" ? licaoDoCaderno(revisando, estado.hoje) : null),
    [revisando, estado],
  );

  if (licao) {
    const voltar = () => {
      setRevisando(null);
      setEstado({ tipo: "carregando" });
      void carregar();
    };
    return (
      <MicroLessonPlayer
        lesson={licao}
        onComplete={() => ({ xpAwarded: 0, stars: null })}
        conclusao={() => <FimDaRevisao onVoltar={voltar} />}
      />
    );
  }

  const paraHoje =
    estado.tipo === "pronto" ? itensRevisaveis(estado.itens.filter((i) => i.paraHoje).map((i) => i.itemId)) : [];

  return (
    <AppShell title={t.titulo}>
      <div className="space-y-4 px-5 pt-4 pb-8" data-testid="tela-caderno">
        {estado.tipo === "carregando" && <p className="text-sm text-nevoa">{t.carregando}</p>}
        {estado.tipo === "erro" && <p className="card-soft p-4 text-sm">{t.erro}</p>}
        {estado.tipo === "sem-conta" && (
          <div className="card-soft space-y-3 p-5 text-sm">
            <p>{t.semConta}</p>
            <Link to="/login" className="btn-primary w-full">
              {t.entrar}
            </Link>
          </div>
        )}
        {estado.tipo === "fechado" && (
          <section className="card-soft space-y-3 p-5 text-sm text-abismo" data-testid="caderno-fechado">
            <h2 className="font-display text-lg font-bold">{t.fechadoTitulo}</h2>
            <p>{t.fechado}</p>
            <Link to="/planos" className="btn-primary w-full">
              {t.verPlanos}
            </Link>
          </section>
        )}
        {estado.tipo === "fechado" && estado.itens.length > 0 && (
          <ul className="space-y-2" data-testid="caderno-lista" aria-label={t.somenteLeitura}>
            {estado.itens.map((i) => (
              <ItemDoCadernoCard key={i.itemId} item={i} />
            ))}
          </ul>
        )}
        {estado.tipo === "pronto" && (
          <>
            <section className="card-soft border-mar p-5" aria-labelledby="caderno-hoje">
              <p className="ds-label" id="caderno-hoje">
                {t.hoje}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-abismo" data-testid="caderno-para-hoje">
                {t.paraHoje(paraHoje.length)}
              </p>
              <p className="mt-1 text-xs text-nevoa">{t.explica}</p>
              {paraHoje.length > 0 && (
                <button type="button" className="btn-primary mt-4 w-full" onClick={() => setRevisando(paraHoje)}>
                  {t.revisarAgora}
                </button>
              )}
            </section>
            {estado.itens.length === 0 ? (
              <p className="card-soft p-4 text-sm text-abismo">{t.vazio}</p>
            ) : (
              <ul className="space-y-2" data-testid="caderno-lista">
                {estado.itens.map((i) => (
                  <ItemDoCadernoCard key={i.itemId} item={i} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function ItemDoCadernoCard({ item }: { item: ItemDoCaderno }) {
  const t = COPY.caderno;
  const [aberto, setAberto] = useState(false);
  const exercicio = useMemo(() => {
    try {
      return resolveExercise(item.itemId);
    } catch {
      return null;
    }
  }, [item.itemId]);
  const skill = SKILL_MAP[itemMetaOf(item.itemId).skillIds[0] ?? ""];
  const materia = skill ? SUBJECT_MAP[skill.subjectId]?.name : undefined;

  /** Só no toque (regra dura 7); a explicação oficial continua a mesma (regra dura 8). */
  function reexplicar() {
    if (!exercicio) return;
    const base = focusFromExercise(exercicio, null, "caderno", t.titulo, t.titulo, 0, undefined, false);
    openTutorWithContext(
      { ...base, subjectName: materia ?? t.titulo, topic: skill?.name ?? t.titulo, questionId: item.itemId, itemId: item.itemId },
      { pedagogy: null, autoSend: t.pedidoReexplicar },
    );
  }

  return (
    <li className="card-soft p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-abismo">{skill?.name ?? materia ?? t.titulo}</p>
          {materia && <p className="text-xs text-nevoa">{materia}</p>}
        </div>
        <span className="chip shrink-0">{item.paraHoje ? t.hoje : t.proxima(dataCurta(item.proximaRevisao))}</span>
      </div>
      {exercicio ? (
        <>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="tap-area mt-2 flex items-center gap-1 text-xs font-bold text-nevoa"
            aria-expanded={aberto}
          >
            {aberto ? t.ocultarExplicacao : t.verExplicacao}
            <ChevronDown size={14} className={cn("transition-transform", aberto && "rotate-180")} />
          </button>
          {aberto && (
            <div className="mt-2 space-y-3">
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-abismo">{exercicio.explicacao}</p>
              <button type="button" onClick={reexplicar} className="btn-outline px-3 text-[13px]">
                <Sparkles size={15} /> {t.reexplicar}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="mt-2 text-xs text-nevoa">{t.indisponivel}</p>
      )}
    </li>
  );
}

function FimDaRevisao({ onVoltar }: { onVoltar: () => void }) {
  return (
    <div className="flex min-h-full flex-col justify-center gap-4 px-5 py-10 text-center" data-testid="caderno-revisao-feita">
      <p className="font-display text-xl font-bold text-abismo">{COPY.caderno.revisaoRecap}</p>
      <button type="button" className="btn-primary w-full" onClick={onVoltar}>
        {COPY.caderno.voltar}
      </button>
    </div>
  );
}
