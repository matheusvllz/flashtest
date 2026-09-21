import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BrandMark, PhoneFrame } from "@/components/AppShell";

export const Route = createFileRoute("/forgot")({ component: Forgot, ssr: false });

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col bg-neve px-6 pt-10 pb-10">
        <Link to="/login" className="min-h-11 text-sm font-semibold text-nevoa">
          ← Voltar
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <BrandMark size={40} />
          <h1 className="font-display text-2xl font-bold text-abismo">Recuperar senha</h1>
        </div>
        <p className="mt-2 text-sm text-nevoa">
          Enviaremos um link de recuperação para seu e-mail.
        </p>

        {sent ? (
          <div className="card-soft mt-8 p-5 text-sm text-abismo">
            Se este e-mail estiver cadastrado, você receberá as instruções em instantes.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="mt-6 flex flex-col gap-4"
          >
            <label className="text-xs font-semibold text-abismo">
              E-mail
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="input-ds mt-1.5"
              />
            </label>
            <button className="btn-primary w-full">Enviar link</button>
          </form>
        )}
      </div>
    </PhoneFrame>
  );
}
