/**
 * "Pular para cá" (spec 50 §5.7.1, T-50.12.3). Entrada (o que fica pulado, a regra e os limites do dia), o teste (uma
 * questão por vez, sem vida, sem dica, sem Foca IA, sem combo e sem mostrar certo/errado) e o resultado:
 * passou → "Capítulo liberado" com as lições "Puladas"; não passou → "Comece por <lição>" com "Vale revisar".
 * Nunca nota nem texto de fracasso. Quem decide tudo é o servidor; o aparelho só reflete (`aplicarPuloNoAparelho`).
 */
import { Link, useParams } from "@tanstack/react-router";
import { ArrowDownRight, FastForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell, PhoneFrame } from "@/components/AppShell";
import { FocaMark } from "@/components/brand/FocaMark";
import { QuestionStepView } from "@/components/learning/steps/QuestionStepView";
import { chapterById } from "@/content/curriculum-tree";
import { itemMetaOf } from "@/content/items";
import { phaseById, resolveExercise } from "@/content/microlicoes";
import { SKILL_MAP } from "@/content/taxonomy";
import { lessonById } from "@/content/trilhas";
import { useAtalhosDeQuestao } from "@/hooks/useAtalhosDeQuestao";
import { concluirPulo, iniciarPulo, previaDoPulo } from "@/lib/api/pulo";
import { carregarPacotesPara } from "@/lib/content/preload";
import { COPY } from "@/lib/copy";
import { PULO, type LicaoDoCaminho } from "@/lib/learning/pulo";
import { presentedOrderFor } from "@/lib/learning/session-logic";
import type { QuestionStep } from "@/lib/learning/types";
import type { Exercise, ExerciseAnswer } from "@/lib/lessons/types";
import { aplicarPuloNoAparelho, hojeISO, recordLearningAttempt } from "@/lib/store";
import { puxar, sincronizarAgora } from "@/lib/sync/motor";
import type { PreviaDoPulo, ResultadoDoPulo, TesteDoPulo } from "@/server/trilha/pulo";

type Tela =
  | { tipo: "carregando" }
  | { tipo: "erro" }
  | { tipo: "entrada"; previa: PreviaDoPulo }
  | { tipo: "teste"; teste: TesteDoPulo }
  | { tipo: "resultado"; resultado: ResultadoDoPulo };

type Resposta = { itemId: string; resposta: ExerciseAnswer | null; exibidos?: string[]; ms: number };

function exercicio(id: string): Exercise | null {
  try {
    return resolveExercise(id);
  } catch {
    return null;
  }
}

/** Título de uma lição do caminho; aula gerada ainda sem pacote cai no título do capítulo (que é o dela). */
function tituloDaLicao(l: LicaoDoCaminho): string {
  if (l.tipo === "redacao") return lessonById(l.id)?.lesson.titulo ?? chapterById(l.capituloId)?.title ?? l.id;
  return phaseById(l.id)?.title ?? chapterById(l.capituloId)?.title ?? l.id;
}

function hrefDaLicao(l: LicaoDoCaminho) {
  return l.tipo === "redacao"
    ? ({ to: "/redacao/$licaoId", params: { licaoId: l.id } } as const)
    : ({ to: "/learn/$lessonId", params: { lessonId: l.id } } as const);
}

/** Reflete no aparelho o que o servidor decidiu: lições puladas, revisão agendada, bloco, XP e as respostas no modelo. */
function aplicarResultado(r: ResultadoDoPulo, duracoes: Map<string, number>) {
  const hoje = hojeISO();
  const versoes = Object.fromEntries(r.licoesPuladas.filter((l) => l.tipo === "micro").map((l) => [l.id, phaseById(l.id)?.version ?? 1]));
  const novo = aplicarPuloNoAparelho({
    id: r.id,
    passou: r.passou,
    licoesPuladas: r.licoesPuladas,
    versoes,
    semQuestao: r.semQuestao,
    xp: r.xp,
    hoje,
    checarEmDias: PULO.DIAS_PARA_CHECAGEM,
  });
  if (!novo) return;
  const agora = new Date().toISOString();
  r.itens.forEach((i, n) => {
    const meta = itemMetaOf(i.itemId);
    recordLearningAttempt(
      {
        id: `${r.id}-${n}`,
        sessionId: `pulo:${r.id}`,
        exerciseId: i.itemId,
        exerciseVersion: meta.version,
        skillIds: meta.skillIds.length ? meta.skillIds : [i.skillId],
        role: "pratica",
        answer: null,
        correct: i.correta,
        hintUsed: false,
        tutorUsed: false,
        firstSubmission: true,
        submittedAt: agora,
        localDate: hoje,
        durationMs: duracoes.get(i.itemId) ?? 0,
        response: "answered",
        assisted: false,
        itemDifficulty: meta.difficulty,
        source: "pulo",
      },
      { irt: meta.irt, difficulty: meta.difficulty },
    );
  });
  void puxar().catch(() => undefined);
}

export function TelaDoPulo() {
  const { capituloId } = useParams({ from: "/pulo/$capituloId" });
  const capitulo = chapterById(capituloId);
  const titulo = capitulo?.title ?? "";
  const [tela, setTela] = useState<Tela>({ tipo: "carregando" });

  const carregar = useCallback(async () => {
    setTela({ tipo: "carregando" });
    try {
      // O servidor decide a posição pelas conclusões que ele tem: manda antes o que ainda está na fila.
      await sincronizarAgora().catch(() => 0);
      const r = await previaDoPulo({ data: { capituloId } });
      if (!r.ok) return setTela({ tipo: "erro" });
      // Teste terminado hoje cuja resposta não chegou a este aparelho: aplica agora (idempotente) e mostra o resultado.
      if (r.resultadoDeHoje) {
        aplicarResultado(r.resultadoDeHoje, new Map());
        return setTela({ tipo: "resultado", resultado: r.resultadoDeHoje });
      }
      setTela({ tipo: "entrada", previa: r });
    } catch {
      setTela({ tipo: "erro" });
    }
  }, [capituloId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const [comecando, setComecando] = useState(false);
  async function comecar() {
    setComecando(true);
    try {
      const r = await iniciarPulo({ data: { capituloId } });
      if (!r.ok) {
        setComecando(false);
        return void carregar();
      }
      await carregarPacotesPara([], r.itens).catch(() => {});
      setTela({ tipo: "teste", teste: r });
    } catch {
      setTela({ tipo: "erro" });
    }
    setComecando(false);
  }

  // Durante o teste, sem a Foca IA: a moldura sem o balão do tutor (como o nivelamento).
  if (tela.tipo === "teste") {
    return (
      <PhoneFrame variant="reading">
        <div className="min-h-screen bg-neve px-6 pb-8 pt-8" data-testid="tela-do-pulo">
          <Teste teste={tela.teste} aoTerminar={(resultado) => setTela({ tipo: "resultado", resultado })} />
        </div>
      </PhoneFrame>
    );
  }

  return (
    <AppShell title={COPY.pulo.rotulo}>
      <div className="px-5 pb-10 pt-2" data-testid="tela-do-pulo">
        {tela.tipo === "carregando" && (
          <p role="status" className="text-sm text-nevoa">
            {COPY.pulo.carregando}
          </p>
        )}
        {tela.tipo === "erro" && (
          <div className="card-soft space-y-3 p-4">
            <p className="text-sm text-abismo">{COPY.pulo.erro}</p>
            <button type="button" className="btn-outline w-full" onClick={() => void carregar()}>
              {COPY.pulo.tentarDeNovo}
            </button>
          </div>
        )}
        {tela.tipo === "entrada" && <Entrada previa={tela.previa} titulo={titulo} comecando={comecando} aoComecar={comecar} />}
        {tela.tipo === "resultado" && <Resultado r={tela.resultado} titulo={titulo} />}
      </div>
    </AppShell>
  );
}

function Entrada({ previa, titulo, comecando, aoComecar }: { previa: PreviaDoPulo; titulo: string; comecando: boolean; aoComecar: () => void }) {
  const t = COPY.pulo;
  return (
    <section data-testid="pulo-entrada" className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-abismo bg-neve text-abismo" aria-hidden>
          <FastForward size={18} />
        </span>
        <h1 className="font-display text-2xl font-bold text-abismo">{t.introTitulo(titulo)}</h1>
      </div>
      {previa.disponivel ? (
        <>
          <p className="text-sm leading-relaxed text-abismo">{t.introCorpo(previa.questoes)}</p>
          <p className="text-sm leading-relaxed text-abismo">{t.regra}</p>
          <p className="text-sm leading-relaxed text-nevoa">{t.semAjuda}</p>
          {previa.licoes.length > 0 && (
            <div className="card-soft p-4">
              <p className="text-sm font-semibold text-abismo">{t.ficamPuladas}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-abismo" data-testid="pulo-licoes">
                {previa.licoes.map((l) => (
                  <li key={l.id}>{tituloDaLicao(l)}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-nevoa">{t.depois}</p>
            </div>
          )}
        </>
      ) : (
        <p className="card-soft p-4 text-sm text-abismo" data-testid="pulo-motivo" data-motivo={previa.motivo ?? ""}>
          {t.motivos[previa.motivo ?? ""] ?? t.erro}
        </p>
      )}
      <p className="text-xs text-nevoa" data-testid="pulo-limites">
        {t.limites(previa.testesHoje, previa.testesPorDia)}
      </p>
      {previa.disponivel ? (
        <button type="button" className="btn-primary w-full" disabled={comecando} onClick={aoComecar}>
          {previa.emAndamento ? t.continuar : t.comecar}
        </button>
      ) : null}
      <Link to="/trilha" search={{ vista: "mapa" }} className={previa.disponivel ? "btn-ghost w-full" : "btn-primary w-full"}>
        {t.voltar}
      </Link>
    </section>
  );
}

function Teste({ teste, aoTerminar }: { teste: TesteDoPulo; aoTerminar: (r: ResultadoDoPulo) => void }) {
  useAtalhosDeQuestao();
  const t = COPY.pulo;
  const [indice, setIndice] = useState(0);
  const [answer, setAnswer] = useState<ExerciseAnswer | null>(null);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const inicio = useRef(Date.now());
  const itemId = teste.itens[indice];
  const ex = itemId ? exercicio(itemId) : null;
  const ordem = useRef<{ id: string; ordem: string[] | undefined } | null>(null);
  if (ex && ordem.current?.id !== itemId) ordem.current = { id: itemId, ordem: presentedOrderFor(ex) };

  async function enviar(lista: Resposta[]) {
    setEnviando(true);
    setFalhou(false);
    try {
      const r = await concluirPulo({
        data: {
          id: teste.id,
          respostas: lista.map((x) => ({ itemId: x.itemId, resposta: x.resposta, ...(x.exibidos ? { exibidos: x.exibidos } : {}) })),
        },
      });
      if (!r.ok) throw new Error(r.codigo);
      aplicarResultado(r.resultado, new Map(lista.map((x) => [x.itemId, x.ms])));
      aoTerminar(r.resultado);
    } catch {
      setFalhou(true);
      setEnviando(false);
    }
  }

  function responder(naoSei: boolean) {
    if (!itemId) return;
    const nova: Resposta = { itemId, resposta: naoSei ? null : answer, exibidos: ordem.current?.ordem, ms: Date.now() - inicio.current };
    const lista = [...respostas, nova];
    setRespostas(lista);
    setAnswer(null);
    inicio.current = Date.now();
    if (lista.length >= teste.itens.length) void enviar(lista);
    else setIndice(indice + 1);
  }

  if (enviando || falhou || respostas.length >= teste.itens.length) {
    return (
      <div className="space-y-3" data-testid="pulo-enviando">
        {falhou ? (
          <>
            <p className="card-soft p-4 text-sm text-abismo">{t.erroEnvio}</p>
            <button type="button" className="btn-primary w-full" onClick={() => void enviar(respostas)}>
              {t.tentarDeNovo}
            </button>
          </>
        ) : (
          <p role="status" className="text-sm font-semibold text-nevoa">
            {t.enviando}
          </p>
        )}
      </div>
    );
  }

  if (!ex) {
    // Questão que não carregou (pacote fora do ar): conta como "Não sei" em vez de travar o teste.
    return (
      <div className="space-y-3">
        <p className="card-soft p-4 text-sm text-abismo">{t.erro}</p>
        <button type="button" className="btn-primary w-full" onClick={() => responder(true)}>
          {COPY.feedback.continuar}
        </button>
      </div>
    );
  }

  const step: QuestionStep = { kind: "question", exerciseId: itemId, role: "pratica", difficulty: 2 };
  return (
    <section data-testid="pulo-teste" data-item-id={itemId}>
      <p className="ds-label">{t.rotulo}</p>
      <p className="mt-1 text-xs leading-relaxed text-nevoa">{t.duranteHint}</p>
      <div className="mt-4">
        <QuestionStepView
          key={itemId}
          step={step}
          exercise={ex}
          answer={answer}
          onAnswer={setAnswer}
          presentedOrder={ordem.current?.ordem}
          feedback={null}
          canVerify={answer !== null}
          onVerify={() => responder(false)}
          onContinue={() => undefined}
          onAskTutor={() => undefined}
          onDontKnow={() => responder(true)}
          isLast={indice === teste.itens.length - 1}
          questionNumber={indice + 1}
          questionTotal={teste.itens.length}
          rotulo={t.progresso(indice + 1, teste.itens.length)}
          silent
        />
      </div>
      <Link to="/trilha" search={{ vista: "mapa" }} className="tap-area mt-6 block w-full text-center text-xs font-semibold text-nevoa underline">
        {t.sair}
      </Link>
    </section>
  );
}

function Resultado({ r, titulo }: { r: ResultadoDoPulo; titulo: string }) {
  const t = COPY.pulo;
  if (r.passou) {
    return (
      <section data-testid="pulo-resultado" data-passou="true" className="space-y-4">
        <FocaMark expression="orgulhosa" size={56} decorative />
        <h1 className="font-display text-2xl font-bold text-abismo">{t.passouTitulo}</h1>
        <p className="text-sm text-abismo">{titulo}</p>
        <p className="text-sm text-abismo">{t.passouCorpo(r.licoesPuladas.length)}</p>
        {r.licoesPuladas.length > 0 && (
          <ul className="flex flex-col gap-2" data-testid="pulo-puladas">
            {r.licoesPuladas.map((l) => (
              <li key={l.id} className="card-soft flex items-center gap-3 px-4 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-gelo text-abismo" aria-hidden>
                  <FastForward size={14} />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-abismo">{tituloDaLicao(l)}</span>
                <span className="shrink-0 text-xs font-bold text-nevoa">{t.pulada}</span>
              </li>
            ))}
          </ul>
        )}
        {r.semQuestao.length > 0 && <p className="text-sm text-nevoa">{t.revisaoAgendada}</p>}
        {r.xp > 0 && <p className="font-mono text-sm font-bold text-mar-fundo">{t.xp(r.xp)}</p>}
        <Link to="/trilha" search={{ vista: "mapa" }} className="btn-primary w-full">
          {t.irParaTrilha}
        </Link>
      </section>
    );
  }
  const comece = r.comecePor;
  return (
    <section data-testid="pulo-resultado" data-passou="false" className="space-y-4">
      <FocaMark expression="acolhedora" size={56} decorative />
      <h1 className="font-display text-2xl font-bold text-abismo">{comece ? t.comecePor(tituloDaLicao(comece)) : t.voltar}</h1>
      <p className="text-sm text-abismo">{t.comecePorCorpo}</p>
      {r.valeRevisar.length > 0 && (
        <div>
          <p className="ds-label">{t.valeRevisar}</p>
          <ul className="mt-2 flex flex-col gap-2" data-testid="pulo-vale-revisar">
            {r.valeRevisar.map((h) => (
              <li key={h} className="card-soft flex items-center gap-3 px-4 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-gelo text-abismo" aria-hidden>
                  <ArrowDownRight size={16} strokeWidth={2.5} />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-abismo">{SKILL_MAP[h]?.name ?? h}</span>
                <span className="shrink-0 text-xs font-bold text-abismo">{t.valeRevisar}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-nevoa">{t.amanha}</p>
      {comece ? (
        <Link {...hrefDaLicao(comece)} className="btn-primary w-full">
          {t.abrirLicao}
        </Link>
      ) : null}
      <Link to="/trilha" search={{ vista: "mapa" }} className={comece ? "btn-ghost w-full" : "btn-primary w-full"}>
        {t.voltar}
      </Link>
    </section>
  );
}
