/**
 * Peças das telas de conta (docs/specs/46-producao T-05.4): mesma moldura de entrada do onboarding
 * (`EntryShell` + coluna do app), campos com rótulo visível e erro ligado por `aria-describedby`,
 * alvos de toque ≥ 44 px, e avisos anunciados por leitor de tela.
 */
import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { BrandMark, PhoneFrame } from "@/components/AppShell";
import { EntryShell } from "@/components/EntryShell";
import { COPY } from "@/lib/copy";

export function TelaDeAcesso({
  titulo,
  subtitulo,
  voltarPara,
  children,
}: {
  titulo: string;
  subtitulo?: ReactNode;
  voltarPara?: string;
  children: ReactNode;
}) {
  return (
    <EntryShell>
      <PhoneFrame>
        <main className="flex min-h-screen flex-col bg-neve px-6 pt-10 pb-8">
          {voltarPara && (
            <Link to={voltarPara} className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-nevoa">
              ← {COPY.conta.voltar}
            </Link>
          )}
          <div className="mt-6 flex items-center gap-3">
            <BrandMark size={40} />
            <h1 className="font-display text-2xl font-bold text-abismo">{titulo}</h1>
          </div>
          {subtitulo && <p className="mt-2 text-sm text-nevoa">{subtitulo}</p>}
          {children}
        </main>
      </PhoneFrame>
    </EntryShell>
  );
}

export function Campo({
  rotulo,
  erro,
  dica,
  ...input
}: { rotulo: string; erro?: string; dica?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const idAjuda = `${id}-ajuda`;
  const ehSenha = input.type === "password";
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-abismo">
        {rotulo}
      </label>
      <div className="relative">
        <input
          id={id}
          {...input}
          type={ehSenha && visivel ? "text" : input.type}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro || dica ? idAjuda : undefined}
          className={`input-ds w-full ${ehSenha ? "pr-12" : ""}`}
        />
        {ehSenha && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? COPY.conta.ocultarSenha : COPY.conta.mostrarSenha}
            className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 items-center justify-center text-nevoa"
          >
            {visivel ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        )}
      </div>
      {(erro || dica) && (
        <p id={idAjuda} className={`text-xs ${erro ? "font-semibold text-error" : "text-nevoa"}`}>
          {erro ?? dica}
        </p>
      )}
    </div>
  );
}

/** Aviso de erro do formulário (anunciado na hora). */
export function AvisoErro({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold text-error">
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden /> <span>{children}</span>
    </p>
  );
}

/** Aviso de sucesso ou informação (anunciado sem interromper). */
export function AvisoInfo({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="card-soft flex items-start gap-2 p-4 text-sm text-abismo">
      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success-texto" aria-hidden /> <span>{children}</span>
    </p>
  );
}

export function Separador() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-nevoa" aria-hidden>
      <div className="h-px flex-1 bg-gelo" /> {COPY.conta.ou} <div className="h-px flex-1 bg-gelo" />
    </div>
  );
}

function LogoGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z" />
    </svg>
  );
}

export function BotaoGoogle({ onClick, desabilitado }: { onClick: () => void; desabilitado?: boolean }) {
  return (
    <button type="button" className="btn-outline w-full" onClick={onClick} disabled={desabilitado}>
      <LogoGoogle />
      {COPY.conta.google}
    </button>
  );
}

/** Aceite dos termos e da política. Os links abrem numa aba nova para não perder o que foi digitado. */
export function AceiteLegal({ marcado, onMudar, erro }: { marcado: boolean; onMudar: (v: boolean) => void; erro?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={marcado}
          onChange={(e) => onMudar(e.target.checked)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--mar)]"
        />
        <label htmlFor={id} className="text-sm text-abismo">
          {COPY.conta.aceiteAntes}{" "}
          <a href="/termos" target="_blank" rel="noopener" className="font-semibold text-mar-fundo underline">
            {COPY.conta.termos}
          </a>{" "}
          {COPY.conta.aceiteMeio}{" "}
          <a href="/privacidade" target="_blank" rel="noopener" className="font-semibold text-mar-fundo underline">
            {COPY.conta.privacidade}
          </a>
          .
        </label>
      </div>
      {erro && (
        <p id={`${id}-erro`} className="text-xs font-semibold text-error">
          {erro}
        </p>
      )}
    </div>
  );
}
