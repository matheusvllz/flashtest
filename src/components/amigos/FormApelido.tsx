/**
 * Apelido social para os amigos (spec 50 §5.6.1): o mesmo da liga, com a validação da 49. Não entra na liga.
 * No ano em que o aluno faz 18, pede dia e mês (não guardados).
 */
import { useState } from "react";
import { definirApelidoSocial } from "@/lib/api/amigos";
import { COPY } from "@/lib/copy";

export function FormApelido({ confirmar, onPronto }: { confirmar: boolean; onPronto: () => void }) {
  const t = COPY.ranking;
  const a = COPY.amigos;
  const [apelido, setApelido] = useState("");
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [indo, setIndo] = useState(false);

  async function salvar() {
    setErro(null);
    setIndo(true);
    try {
      const r = await definirApelidoSocial({
        data: {
          apelido,
          ...(confirmar ? { nascimento: { dia: Number(dia) || 0, mes: Number(mes) || 0 } } : {}),
        },
      });
      if ("problema" in r) setErro(t.problemas[r.problema as keyof typeof t.problemas] ?? a.erro);
      else if (!r.ok) setErro(r.codigo === "MENOR_DE_IDADE" ? a.menor : a.erro);
      else onPronto();
    } catch {
      setErro(a.erro);
    }
    setIndo(false);
  }

  return (
    <section
      className="card-soft space-y-3 p-5 text-sm text-abismo"
      aria-labelledby="amigos-apelido-titulo"
    >
      <h2 id="amigos-apelido-titulo" className="font-display text-lg font-bold">
        {a.apelidoTitulo}
      </h2>
      <p>{a.apelidoExplica}</p>
      <label className="block font-semibold" htmlFor="amigos-apelido">
        {t.apelido}
      </label>
      <input
        id="amigos-apelido"
        className="input-ds"
        maxLength={20}
        value={apelido}
        onChange={(e) => setApelido(e.target.value)}
        aria-describedby="amigos-apelido-ajuda"
      />
      <p id="amigos-apelido-ajuda" className="text-xs text-nevoa">
        {t.apelidoAjuda}
      </p>
      {confirmar && (
        <fieldset className="space-y-2">
          <legend className="text-sm">{t.nascimento}</legend>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="text-xs font-semibold">{t.dia}</span>
              <input
                className="input-ds"
                inputMode="numeric"
                maxLength={2}
                value={dia}
                onChange={(e) => setDia(e.target.value.replace(/\D/g, ""))}
              />
            </label>
            <label className="flex-1">
              <span className="text-xs font-semibold">{t.mes}</span>
              <input
                className="input-ds"
                inputMode="numeric"
                maxLength={2}
                value={mes}
                onChange={(e) => setMes(e.target.value.replace(/\D/g, ""))}
              />
            </label>
          </div>
        </fieldset>
      )}
      {erro && (
        <p role="alert" className="text-error">
          {erro}
        </p>
      )}
      <button
        type="button"
        disabled={indo}
        onClick={() => void salvar()}
        className="btn-primary w-full"
      >
        {a.salvarApelido}
      </button>
    </section>
  );
}
