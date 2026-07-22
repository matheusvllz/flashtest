import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, setState } from "@/lib/store";
import { Wifi, WifiOff, Download, Check } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/offline")({ component: Offline, ssr: false });

function Offline() {
  const s = useAppState();
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);
    const on = () => setOnline(true),
      off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  function download() {
    setState((ss) => {
      ss.offline.downloaded = true;
      return ss;
    });
  }
  function sync() {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  }

  return (
    <AppShell title="Offline">
      <div className="px-5 pt-4 space-y-4">
        <div className="card-soft flex items-center gap-3 p-4">
          {online ? <Wifi className="text-green-600" /> : <WifiOff className="text-red-500" />}
          <div>
            <p className="font-display font-bold text-navy">
              {online ? "Você está online" : "Você está offline"}
            </p>
            <p className="text-xs text-navy-2">
              {online
                ? "Todos os recursos disponíveis."
                : "IA precisa de internet. Você ainda pode responder questões e revisar flashcards offline."}
            </p>
          </div>
        </div>

        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-navy">Conteúdo baixado</h3>
          <p className="mt-1 text-sm text-navy-2">10 questões · Flashcards · Explicações</p>
          {s.offline.downloaded ? (
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
              <Check size={16} /> Pronto para estudar offline
            </div>
          ) : (
            <button onClick={download} className="btn-primary mt-3 w-full">
              <Download size={16} /> Baixar para estudar offline
            </button>
          )}
        </div>

        <div className="card-soft p-4">
          <h3 className="font-display font-bold text-navy">Sincronização</h3>
          <p className="mt-1 text-sm text-navy-2">
            Suas respostas e progresso são sincronizados automaticamente quando você volta online.
          </p>
          <button onClick={sync} disabled={syncing} className="btn-outline mt-3 w-full">
            {syncing ? "Sincronizando..." : "Sincronizar agora"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
