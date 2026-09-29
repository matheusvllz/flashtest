import {
  dismissCorruptRecoveryNotice,
  retryPersist,
  useCorruptRecoveryNotice,
  usePersistStatus,
} from "@/lib/store";
import { COPY } from "@/lib/copy";

/**
 * Aviso persistente de persistência local (docs/36 T-05.1/T-05.3; RU-4, RU-5,
 * RU-6). Montado em `__root.tsx`, então vale para toda tela — inclusive quiz,
 * aula e nivelamento, que não usam `AppShell`.
 *
 * - Falha de gravação (`"falhou"`): `role="alert"` + "Tentar de novo". Some
 *   sozinho quando uma gravação seguinte (automática ou a do botão) funciona.
 * - Versão futura (`"versao-futura"`): `role="alert"`, sem botão — a saída é
 *   recarregar a página com o app novo.
 * - Storage ilegível recuperado (RU-5): informativo (`role="status"`), com
 *   "Ok"; aparece uma vez por carga.
 *
 * Só faixa de texto: sem cor de erro/sucesso (esses tokens são só de
 * feedback de resposta, `18` §6.1), sem número, sem "salvo".
 */
export function PersistenceBanner() {
  const status = usePersistStatus();
  const recuperou = useCorruptRecoveryNotice();

  let mensagem: string | null = null;
  let papel: "alert" | "status" = "alert";
  let acao: { rotulo: string; onClick: () => void } | null = null;

  if (status === "falhou") {
    mensagem = COPY.persistencia.falhaAoSalvar;
    acao = { rotulo: COPY.comum.tentarDeNovo, onClick: () => void retryPersist() };
  } else if (status === "versao-futura") {
    mensagem = COPY.persistencia.versaoFutura;
  } else if (recuperou) {
    mensagem = COPY.persistencia.storageRecuperado;
    papel = "status";
    acao = { rotulo: COPY.comum.ok, onClick: dismissCorruptRecoveryNotice };
  }

  if (!mensagem) return null;

  return (
    <div
      role={papel}
      data-testid="persistence-banner"
      className="sticky top-0 z-50 mx-auto w-full max-w-[var(--app-col)] border-b-2 border-abismo bg-cards px-4 py-3"
    >
      <p className="text-sm text-abismo">{mensagem}</p>
      {acao && (
        <button
          type="button"
          onClick={acao.onClick}
          className="btn-outline mt-2 min-h-11 w-full"
        >
          {acao.rotulo}
        </button>
      )}
    </div>
  );
}
