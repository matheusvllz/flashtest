/**
 * Meta de ofensiva e calendário dentro da folha da sequência (spec 50 §5.2.2–5.2.3). Só com conta: os números vêm do
 * servidor (meta, dias estudados, dias protegidos). Carregado sob demanda quando a folha abre.
 */
import { useCallback, useEffect, useState } from "react";
import { CalendarioOfensiva } from "@/components/ofensiva/CalendarioOfensiva";
import { MetaOfensiva } from "@/components/ofensiva/MetaOfensiva";
import { calendarioDaOfensiva, definirMetaOfensiva, encerrarMetaOfensiva, minhaEconomia } from "@/lib/api/economia";
import { COPY } from "@/lib/copy";
import type { MetaDeOfensiva } from "@/lib/perolas";
import { hojeISO } from "@/lib/store";

const MESES_PARA_TRAS = 12;

function mesesEntre(a: string, b: string): number {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

export function OfensivaNaFolha() {
  const hoje = hojeISO();
  const [mes, setMes] = useState(hoje.slice(0, 7));
  const [meta, setMeta] = useState<{ alvo: number; feitos: number } | null | undefined>(undefined);
  const [cal, setCal] = useState<{ estudados: string[]; protegidos: string[] } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState(false);

  const carregarMeta = useCallback(async () => {
    try {
      const r = await minhaEconomia();
      if (r.ok) setMeta(r.ofensiva.meta);
    } catch {
      /* sem rede: a folha mostra só o que o aparelho sabe */
    }
  }, []);

  useEffect(() => {
    void carregarMeta();
  }, [carregarMeta]);

  useEffect(() => {
    let vivo = true;
    setCal(null);
    calendarioDaOfensiva({ data: { mes } })
      .then((r) => vivo && r.ok && setCal({ estudados: r.estudados, protegidos: r.protegidos }))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [mes]);

  async function escolher(alvo: MetaDeOfensiva) {
    setOcupado(true);
    setErro(false);
    try {
      const r = await definirMetaOfensiva({ data: { alvo } });
      if (!("ok" in r) || !r.ok) setErro(true);
      await carregarMeta();
    } catch {
      setErro(true);
    } finally {
      setOcupado(false);
    }
  }

  async function desistir() {
    setOcupado(true);
    try {
      await encerrarMetaOfensiva();
      await carregarMeta();
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-4 border-t-2 border-gelo pt-3">
      {meta !== undefined && <MetaOfensiva meta={meta} ocupado={ocupado} onEscolher={escolher} onDesistir={desistir} />}
      {erro && <p className="text-xs text-error">{COPY.ofensiva.meta.erro}</p>}
      {cal ? (
        <CalendarioOfensiva
          mes={mes}
          hoje={hoje}
          estudados={cal.estudados}
          protegidos={cal.protegidos}
          podeVoltar={mesesEntre(mes, hoje.slice(0, 7)) < MESES_PARA_TRAS}
          onMes={setMes}
        />
      ) : (
        <p className="text-xs text-nevoa">{COPY.ofensiva.calendario.carregando}</p>
      )}
    </div>
  );
}
