import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrandMark, PhoneFrame } from "@/components/AppShell";
import { login, getState } from "@/lib/store";

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
    // Sem diagnóstico feito não existe dashboard útil — manda para o quiz.
    navigate({ to: getState().onboarded ? "/dashboard" : "/quiz" });
  }

  return (
    <PhoneFrame>
      <div className="min-h-screen bg-white px-6 pt-10 pb-8 flex flex-col">
        <Link to="/welcome" className="text-sm font-semibold text-navy-2">
          ← Voltar
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <BrandMark size={40} />
          <h1 className="font-display text-2xl font-bold text-navy">Entrar</h1>
        </div>
        <p className="mt-2 text-sm text-navy-2">Bem-vindo de volta. Continue sua jornada.</p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
          <label className="text-xs font-semibold text-navy">
            E-mail
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="voce@email.com"
              className="mt-1.5 w-full rounded-2xl border border-mist bg-white px-4 py-3.5 text-base outline-none focus:border-navy"
            />
          </label>
          <label className="text-xs font-semibold text-navy">
            Senha
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-2xl border border-mist bg-white px-4 py-3.5 text-base outline-none focus:border-navy"
            />
          </label>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Link to="/forgot" className="self-end text-xs font-semibold text-navy-2">
            Esqueci minha senha
          </Link>
          <button type="submit" className="btn-primary mt-2 w-full">
            Entrar
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-navy-2">
          <div className="h-px flex-1 bg-mist" /> ou <div className="h-px flex-1 bg-mist" />
        </div>
        <button
          type="button"
          className="btn-outline w-full"
          onClick={() => alert("Login com Google em breve")}
        >
          <span className="inline-block h-4 w-4 rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500" />
          Continuar com Google
        </button>

        <p className="mt-auto pt-8 text-center text-sm text-navy-2">
          Ainda não tem conta?{" "}
          <Link to="/quiz" className="font-bold text-navy">
            Começar em 60s
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
}
