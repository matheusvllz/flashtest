import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { BrandMark, PhoneFrame } from "@/components/AppShell";
import { login, getState } from "@/lib/store";
import { HOME_ROUTE } from "@/lib/features";

export const Route = createFileRoute("/login")({ component: Login, ssr: false });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    login(email, getState().prefs.name || email.split("@")[0]);
    // Sem diagnóstico feito não existe home útil — manda para o quiz.
    navigate({ to: getState().onboarded ? HOME_ROUTE : "/quiz" });
  }

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col bg-neve px-6 pt-10 pb-8">
        <Link to="/welcome" className="min-h-11 text-sm font-semibold text-nevoa">
          ← Voltar
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <BrandMark size={40} />
          <h1 className="font-display text-2xl font-bold text-abismo">Entrar</h1>
        </div>
        <p className="mt-2 text-sm text-nevoa">Bem-vindo de volta. Continue sua jornada.</p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
          <label className="text-xs font-semibold text-abismo">
            E-mail
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="voce@email.com"
              className="input-ds mt-1.5"
            />
          </label>
          <label className="text-xs font-semibold text-abismo">
            Senha
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="input-ds mt-1.5"
            />
          </label>
          {error && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-error">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <Link to="/forgot" className="self-end text-xs font-semibold text-mar-fundo underline">
            Esqueci minha senha
          </Link>
          <button type="submit" className="btn-primary mt-2 w-full">
            Entrar
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-nevoa">
          <div className="h-px flex-1 bg-gelo" /> ou <div className="h-px flex-1 bg-gelo" />
        </div>
        <button
          type="button"
          className="btn-outline w-full"
          onClick={() => alert("Login com Google em breve")}
        >
          <LogIn size={16} />
          Continuar com Google
        </button>

        <p className="mt-auto pt-8 text-center text-sm text-nevoa">
          Ainda não tem conta?{" "}
          <Link to="/quiz" className="font-bold text-mar-fundo underline">
            Começar em 60s
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
}
