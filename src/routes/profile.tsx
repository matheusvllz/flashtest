import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, logout, reset } from "@/lib/store";
import { ChevronRight, LogOut, RotateCcw, Download, Sparkles } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: Profile, ssr: false });

function Profile() {
  const s = useAppState();
  const nav = useNavigate();
  const p = s.prefs;
  const initials = (p.name || "F T")
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppShell title="Perfil">
      <div className="px-5 pt-4 space-y-4">
        <div className="card-soft flex items-center gap-4 p-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-navy font-display text-lg font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-navy truncate">{p.name || "Sem nome"}</p>
            <p className="truncate text-xs text-navy-2">{p.email || "—"}</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 text-navy"
          style={{ background: "linear-gradient(135deg,#FEB803,#FFD466)" }}
        >
          <p className="ds-label" style={{ color: "#02104E" }}>
            Plano atual
          </p>
          <p className="mt-1 font-display text-lg font-bold">
            {s.premiumTrial.active ? "Premium (teste)" : "Gratuito"}
          </p>
          <Link to="/premium" className="btn-navy mt-3 inline-flex">
            <Sparkles size={14} /> Conhecer premium
          </Link>
        </div>

        <div className="card-soft divide-y divide-mist">
          <Row label="Refazer meu diagnóstico" onClick={() => nav({ to: "/quiz" })} />
          <Row label="Meta diária" value={`${p.dailyLessons} aulas de 60s`} />
          <Row label="Faculdade-alvo" value={p.targetInstitution || "—"} />
          <Row label="Estado" value={p.residenceState || "—"} />
          <Row label="Nível" value={p.level || "—"} />
          <Row label="Dificuldades" value={(p.difficultSubjects ?? []).join(", ") || "—"} />
          <Row label="Assuntos por matéria" onClick={() => nav({ to: "/topics" })} />
        </div>

        <div className="card-soft divide-y divide-mist">
          <Row
            label="Conteúdo offline"
            value={s.offline.downloaded ? "Baixado" : "Não baixado"}
            onClick={() => nav({ to: "/offline" })}
            icon={<Download size={16} />}
          />
          <Row label="Termos de uso" />
          <Row label="Política de privacidade" />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              reset();
              nav({ to: "/welcome" });
            }}
            className="btn-ghost w-full text-sm"
          >
            <RotateCcw size={14} /> Resetar demonstração
          </button>
          <button
            onClick={() => {
              logout();
              nav({ to: "/welcome" });
            }}
            className="btn-ghost w-full text-sm"
            style={{ color: "#C0392B", borderColor: "#F3D2CE" }}
          >
            <LogOut size={14} /> Sair da conta
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-3 text-left"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-navy">
        {icon}
        {label}
      </span>
      <span className="flex items-center gap-1 text-xs text-navy-2">
        {value}
        <ChevronRight size={14} />
      </span>
    </button>
  );
}
