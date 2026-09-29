import { useId, useMemo, useState } from "react";
import { COURSE_GROUPS, coursesOfGroup, type CourseGroupId } from "@/data/courses";
import { buscarCursos } from "@/lib/courses-search";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

/** Valor literal lido por `tutor-prompt.ts` e `aha.tsx` — não mudar (docs/36 §F.7). */
export const CURSO_INDECISO = "Ainda não decidi";
/** Limite do texto livre gravado como curso (§F.7). */
const MAX_TEXTO_LIVRE = 60;

const NOME_DO_GRUPO: Record<string, string> = Object.fromEntries(COURSE_GROUPS.map((g) => [g.id, g.name]));

/**
 * Seleção de curso (docs/36 §F.7, RU-40, RA-5) — usada no passo "course" do `/quiz`
 * e numa `BottomSheet` do `/profile`.
 *
 * - Sem busca: 13 chips de área (`aria-pressed`); nenhuma área marcada = nenhuma lista
 *   (sem viés para o primeiro grupo); área marcada = todos os cursos dela.
 * - Com busca: nome ou sinônimo, sem acento nem caixa, sem limite de resultados.
 * - Nenhum resultado: "Não achei esse curso." + "Usar “texto”" (grava o texto, ≤ 60).
 * - Teclado: `<label>` visível "Curso"; resultados são `button type="button"`; Enter no
 *   campo com exatamente 1 resultado seleciona. A contagem é anunciada por `aria-live`.
 *
 * O componente não conhece o store: quem usa decide o que fazer no `onSelect` (avançar o
 * quiz, gravar e fechar a folha). `value` só serve para destacar a escolha atual.
 */
export function CourseStep({
  value,
  onSelect,
  showUndecided = true,
}: {
  value: string;
  onSelect: (curso: string) => void;
  showUndecided?: boolean;
}) {
  const inputId = useId();
  const [q, setQ] = useState("");
  const [grupo, setGrupo] = useState<CourseGroupId | null>(null);

  const busca = q.trim().length > 0;
  const resultados = useMemo(() => (busca ? buscarCursos(q) : []), [busca, q]);
  const doGrupo = useMemo(() => (grupo && !busca ? coursesOfGroup(grupo) : []), [grupo, busca]);
  const lista = busca ? resultados : doGrupo;
  const textoLivre = q.trim().slice(0, MAX_TEXTO_LIVRE);
  const semResultado = busca && resultados.length === 0;

  // Anúncio (RA-5): contagem quando há lista; "Não achei" quando a busca não casa.
  const anuncio = semResultado ? COPY.cursos.naoAchei : lista.length > 0 ? COPY.cursos.contagem(lista.length) : "";

  // Valor salvo (do catálogo, texto livre ou legado desconhecido) aparece como está; a busca abre vazia.
  const mostrarEscolhido = value !== "" && value !== CURSO_INDECISO;

  return (
    <div>
      <label htmlFor={inputId} className="ds-label">
        {COPY.cursos.rotuloBusca}
      </label>
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        maxLength={MAX_TEXTO_LIVRE}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && resultados.length === 1) {
            e.preventDefault();
            onSelect(resultados[0].name);
          }
        }}
        placeholder={COPY.cursos.placeholderBusca}
        className="input-ds mt-1.5"
      />

      <div role="group" aria-label={COPY.cursos.areasAriaLabel} className="mt-3 flex flex-wrap gap-2">
        {COURSE_GROUPS.map((g) => {
          const on = !busca && grupo === g.id;
          return (
            <button
              type="button"
              key={g.id}
              aria-pressed={on}
              onClick={() => {
                // Tocar numa área encerra a busca; tocar de novo na mesma área desmarca.
                setQ("");
                setGrupo(!busca && grupo === g.id ? null : g.id);
              }}
              className={cn("chip", on && "chip-on")}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {mostrarEscolhido && (
        <p className="mt-3 text-xs font-semibold text-abismo">{COPY.cursos.escolhido(value)}</p>
      )}

      {!busca && !grupo && (
        <p className="mt-4 text-sm text-nevoa">{COPY.cursos.escolhaUmaArea}</p>
      )}

      <p aria-live="polite" className={cn("text-xs font-semibold text-nevoa", anuncio && "mt-4")}>
        {anuncio}
      </p>

      {lista.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {lista.map((c) => (
            <button
              type="button"
              key={c.id}
              aria-pressed={value === c.name}
              onClick={() => onSelect(c.name)}
              className={cn(
                "card-press flex min-h-11 items-center justify-between gap-3 px-4 py-3 text-left",
                value === c.name && "border-mar bg-mar/8",
              )}
            >
              <span className="min-w-0 text-sm font-semibold text-abismo">{c.name}</span>
              {busca && (
                <span className="shrink-0 text-[11px] font-semibold text-nevoa">{NOME_DO_GRUPO[c.group]}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {semResultado && (
        <button type="button" onClick={() => onSelect(textoLivre)} className="btn-outline mt-2 w-full">
          {COPY.cursos.usarTexto(textoLivre)}
        </button>
      )}

      {showUndecided && (
        <button
          type="button"
          onClick={() => onSelect(CURSO_INDECISO)}
          className="mt-4 min-h-11 w-full rounded-lg border-2 border-dashed border-gelo py-3 text-sm font-semibold text-nevoa"
        >
          {COPY.cursos.aindaNaoDecidi}
        </button>
      )}
    </div>
  );
}
