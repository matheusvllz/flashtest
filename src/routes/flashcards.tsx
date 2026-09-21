import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/ds/EmptyState";
import { useAppState, setState, registrarRevisaoFlashcard } from "@/lib/store";
import { QUESTIONS } from "@/data/questions";
import { RotateCw, Check, CheckCheck, Minus, X, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/flashcards")({ component: Flashcards, ssr: false });

function Flashcards() {
  const s = useAppState();
  const savedKey = (s.progress.savedFlashcards ?? []).join(",");
  const reviewsKey = Object.keys(s.progress.flashcardReviews ?? {}).join(",");
  const now = Date.now();
  const cards = useMemo(
    () =>
      QUESTIONS.map((q) => {
        const rev = s.progress.flashcardReviews?.[q.id];
        return {
          id: q.id,
          subject: q.subjectName,
          topic: q.topic,
          front: q.flashcardSuggestion.front,
          back: q.flashcardSuggestion.back,
          saved: (s.progress.savedFlashcards ?? []).includes(q.id),
          due: !rev || new Date(rev.nextReview).getTime() <= now,
        };
      }),
    [savedKey, reviewsKey],
  );

  const [filter, setFilter] = useState<"all" | "saved">("all");
  const [subject, setSubject] = useState<string>("Todas");
  const subjects = ["Todas", ...Array.from(new Set(cards.map((c) => c.subject)))];
  const filtered = cards.filter(
    (c) => (filter === "saved" ? c.saved : c.due) && (subject === "Todas" || c.subject === subject),
  );

  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const card = filtered[i];

  function grade(g: "again" | "hard" | "good" | "easy") {
    if (!card) return;
    setState((st) => {
      st.progress.flashcardReviews[card.id] = {
        ease: g === "again" ? 1 : g === "hard" ? 2 : g === "good" ? 3 : 4,
        nextReview: new Date(
          Date.now() + (g === "easy" ? 7 : g === "good" ? 3 : g === "hard" ? 1 : 0.5) * 86400000,
        ).toISOString(),
      };
      return st;
    });
    // Revisar um flashcard conta como atividade do dia (docs/16 §6) — não dá XP,
    // flashcard nunca deu XP nesse app e não é o caso de começar agora.
    registrarRevisaoFlashcard();
    setFlip(false);
    setI((v) => (v + 1) % Math.max(1, filtered.length));
  }

  return (
    <AppShell title="Flashcards">
      <div className="px-5 pt-4 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn("chip", filter === "all" && "chip-on")}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("saved")}
            className={cn("chip", filter === "saved" && "chip-on")}
          >
            Salvos ({s.progress.savedFlashcards.length})
          </button>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input-ds ml-auto w-auto min-h-9 py-1.5 text-xs font-semibold"
          >
            {subjects.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>

        {!card ? (
          <EmptyState text="Nenhum flashcard nessa seleção." />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-nevoa">
                Cartão {i + 1} de {filtered.length}
              </div>
              <button
                onClick={() =>
                  setState((st) => {
                    const list = st.progress.savedFlashcards ?? (st.progress.savedFlashcards = []);
                    const has = list.includes(card.id);
                    st.progress.savedFlashcards = has
                      ? list.filter((x) => x !== card.id)
                      : [...list, card.id];
                    return st;
                  })
                }
                className="chip"
              >
                {card.saved ? (
                  <>
                    <BookmarkCheck size={14} /> Salvo
                  </>
                ) : (
                  <>
                    <Bookmark size={14} /> Salvar
                  </>
                )}
              </button>
            </div>

            <div className="[perspective:1000px]">
              <button
                onClick={() => setFlip((f) => !f)}
                aria-label="Virar cartão"
                className="relative block min-h-[260px] w-full text-left"
                style={{
                  transformStyle: "preserve-3d",
                  transition: "transform 200ms",
                  transform: flip ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="card-soft absolute inset-0 flex flex-col justify-between p-6"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <p className="ds-label">
                    {card.subject} · {card.topic}
                  </p>
                  <p className="my-6 font-display text-xl font-bold text-abismo">{card.front}</p>
                  <p className="flex items-center gap-2 text-xs font-semibold text-nevoa">
                    <RotateCw size={12} /> Toque para virar
                  </p>
                </div>
                <div
                  className="card-soft absolute inset-0 flex flex-col justify-between p-6"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <p className="ds-label">
                    {card.subject} · {card.topic}
                  </p>
                  <p className="my-6 font-display text-xl font-bold text-abismo">{card.back}</p>
                  <p className="flex items-center gap-2 text-xs font-semibold text-nevoa">
                    <RotateCw size={12} /> Toque para virar
                  </p>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => grade("hard")} className="btn-outline">
                <Minus size={14} /> Difícil
              </button>
              <button onClick={() => grade("easy")} className="btn-outline">
                <CheckCheck size={14} /> Fácil
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => grade("again")} className="btn-outline">
                <X size={14} /> Não lembrei
              </button>
              <button onClick={() => grade("good")} className="btn-outline">
                <Check size={14} /> Lembrei
              </button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
