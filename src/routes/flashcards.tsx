import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState, setState } from "@/lib/store";
import { QUESTIONS } from "@/data/questions";
import { RotateCw, Check, X, Bookmark, BookmarkCheck } from "lucide-react";

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
    setFlip(false);
    setI((v) => (v + 1) % Math.max(1, filtered.length));
  }

  return (
    <AppShell title="Flashcards">
      <div className="px-5 pt-4 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`chip ${filter === "all" ? "" : ""}`}
            style={filter === "all" ? { background: "#02104E", color: "#fff" } : {}}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("saved")}
            className={`chip`}
            style={filter === "saved" ? { background: "#02104E", color: "#fff" } : {}}
          >
            Salvos ({s.progress.savedFlashcards.length})
          </button>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="ml-auto rounded-full border border-mist bg-white px-3 py-1.5 text-xs font-semibold text-navy"
          >
            {subjects.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>

        {!card ? (
          <div className="card-soft p-8 text-center text-sm text-navy-2">
            Nenhum flashcard nessa seleção.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-navy-2">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-mist bg-white px-3 py-1.5 text-xs font-bold text-navy"
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
            <button
              onClick={() => setFlip((f) => !f)}
              className="card-soft flex min-h-[240px] w-full flex-col justify-between p-6 text-left"
            >
              <div className="text-xs font-bold uppercase text-navy-2">
                {card.subject} · {card.topic}
              </div>
              <div className="my-6 font-display text-xl font-bold text-navy">
                {flip ? card.back : card.front}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-navy-2">
                <RotateCw size={12} /> Toque para virar
              </div>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => grade("hard")}
                className="rounded-2xl bg-amber-50 py-3 text-xs font-bold text-amber-700"
              >
                Difícil
              </button>
              <button
                onClick={() => grade("easy")}
                className="rounded-2xl bg-blue-50 py-3 text-xs font-bold text-blue-700"
              >
                Fácil
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => grade("again")}
                className="rounded-2xl bg-red-50 py-3 text-xs font-bold text-red-600"
              >
                <X size={14} className="mx-auto" /> Não lembrei
              </button>
              <button
                onClick={() => grade("good")}
                className="rounded-2xl bg-emerald-50 py-3 text-xs font-bold text-emerald-700"
              >
                <Check size={14} className="mx-auto" /> Lembrei
              </button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
