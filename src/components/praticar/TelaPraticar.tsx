/**
 * Aba Praticar (spec 50 §5.7.2): um hub com os jeitos de praticar fora da trilha. Funções pagas aparecem com o
 * convite do plano (o portão continua no servidor de cada tela).
 */
import { Link } from "@tanstack/react-router";
import { BookOpenCheck, ChevronRight, ClipboardList, Layers, ListChecks, NotebookPen, RotateCcw, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { COPY } from "@/lib/copy";
import { useMinhasFuncoes } from "@/hooks/useMinhasFuncoes";
import { useAppState } from "@/lib/store";

export function TelaPraticar() {
  const s = useAppState();
  const funcoes = useMinhasFuncoes(!!s.account?.userId);
  const t = COPY.praticar;
  return (
    <AppShell title={t.titulo}>
      <ul className="space-y-2 px-5 pt-2 pb-10" data-testid="tela-praticar">
        <Cartao to="/study" icone={<Zap size={22} className="text-mar" />} titulo={t.revisaoRapida.titulo} texto={t.revisaoRapida.texto} id="revisao-rapida" />
        <Cartao to="/praticar/erros" icone={<RotateCcw size={22} className="text-mar" />} titulo={t.errosRecentes.titulo} texto={t.errosRecentes.texto} id="erros-recentes" />
        <Cartao
          to="/caderno"
          icone={<NotebookPen size={22} className="text-mar" />}
          titulo={t.caderno.titulo}
          texto={t.caderno.texto}
          selo={funcoes.has("cadernoDeErros") ? undefined : t.noPlano("Basic")}
          id="caderno"
        />
        <Cartao to="/flashcards" icone={<Layers size={22} className="text-mar" />} titulo={t.flashcards.titulo} texto={t.flashcards.texto} id="flashcards" />
        <Cartao to="/simulado" icone={<ClipboardList size={22} className="text-mar" />} titulo={t.mini.titulo} texto={t.mini.texto} id="mini-simulado" />
        <Cartao
          to="/simulado"
          icone={<ListChecks size={22} className="text-mar" />}
          titulo={t.simulados.titulo}
          texto={t.simulados.texto}
          selo={funcoes.has("simulado") ? undefined : t.noPlano("Pro")}
          id="simulados"
        />
        <Cartao to="/topics" icone={<BookOpenCheck size={22} className="text-mar" />} titulo={t.materias.titulo} texto={t.materias.texto} id="materias" />
      </ul>
    </AppShell>
  );
}

function Cartao({ to, icone, titulo, texto, selo, id }: { to: string; icone: ReactNode; titulo: string; texto: string; selo?: string; id: string }) {
  return (
    <li>
      <Link to={to} className="card-soft flex items-center gap-3 p-4" data-testid={`praticar-${id}`}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gelo/60" aria-hidden>
          {icone}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 font-semibold text-abismo">
            {titulo}
            {selo && <span className="chip px-1.5 py-0 text-[11px]">{selo}</span>}
          </span>
          <span className="mt-0.5 block text-xs text-nevoa">{texto}</span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-nevoa" aria-hidden />
      </Link>
    </li>
  );
}
