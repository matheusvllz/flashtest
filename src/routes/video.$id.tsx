import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { QUESTIONS } from "@/data/questions";
import { ExternalLink, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/video/$id")({ component: Video, ssr: false });

// Vídeos reais do YouTube por tópico (canais educacionais brasileiros).
const VIDEO_MAP: Record<string, string> = {
  v1: "kO-1qBc7Nzg", // Função do 2º grau - vértice
  v2: "3ONLxseR3Wc", // Probabilidade básica
  v3: "JnJt-KOgWvE", // Expressões idiomáticas
  v4: "3rL2p5cEwEA", // MRU
  v5: "GK3XZpV6D8Y", // Tabela periódica
  v6: "URUJD5NEXC8", // Organelas
  v7: "yqzC4E4M4Ic", // Era Vargas
  v8: "vB8bkkULAT8", // Climas do Brasil
  v9: "eQXBJ5x8lgw", // Present Simple
  v10: "T3H0Vlq2Zpk", // Porcentagem
};

function Video() {
  const { id } = Route.useParams();
  const q = QUESTIONS.find((x) => x.videoSuggestion.id === id) ?? QUESTIONS[0];
  const videoId = VIDEO_MAP[q.videoSuggestion.id];
  const [playing, setPlaying] = useState(false);
  const searchQuery = encodeURIComponent(`${q.subjectName} ${q.topic} aula completa`);
  const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : searchUrl;
  const thumb = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`
    : null;

  return (
    <AppShell title="Videoaula">
      <div className="px-5 pt-4 space-y-4 pb-8">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy">
          {playing && embedUrl ? (
            <iframe
              src={embedUrl}
              title={q.videoSuggestion.title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : thumb ? (
            <button onClick={() => setPlaying(true)} className="group relative block h-full w-full">
              <img
                src={thumb}
                alt={q.videoSuggestion.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-lg">
                  <PlayCircle size={40} className="text-navy" />
                </div>
              </div>
            </button>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white text-sm">
              Vídeo indisponível
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-navy-2">
            {q.subjectName} · {q.topic}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-navy">
            {q.videoSuggestion.title}
          </h2>
          <p className="mt-2 text-sm text-navy-2">Nível {q.difficulty}</p>
        </div>

        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-navy">O que você vai aprender</h3>
          <p className="mt-2 text-sm text-navy">{q.explanation}</p>
        </div>

        <a href={watchUrl} target="_blank" rel="noreferrer" className="btn-primary w-full">
          <PlayCircle size={16} /> Assistir no YouTube
        </a>
        <a href={searchUrl} target="_blank" rel="noreferrer" className="btn-outline w-full">
          <ExternalLink size={14} /> Buscar mais aulas
        </a>
        <Link to="/study" className="btn-outline w-full">
          Voltar aos estudos
        </Link>
      </div>
    </AppShell>
  );
}
