import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BrandMark, PhoneFrame } from "@/components/AppShell";

export const Route = createFileRoute("/forgot")({ component: Forgot, ssr: false });

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <PhoneFrame>
      <div className="min-h-screen bg-white px-6 pt-10 pb-10 flex flex-col">
        <Link to="/login" className="text-sm font-semibold text-navy-2">
          ← Voltar
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <BrandMark size={40} />
          <h1 className="font-display text-2xl font-bold text-navy">Recuperar senha</h1>
        </div>
        <p className="mt-2 text-sm text-navy-2">
          Enviaremos um link de recuperação para seu e-mail.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl bg-[#FEF6E0] p-5 text-sm text-navy">
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
            <label className="text-xs font-semibold text-navy">
              E-mail
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-1.5 w-full rounded-2xl border border-mist bg-white px-4 py-3.5 text-base outline-none focus:border-navy"
              />
            </label>
            <button className="btn-primary w-full">Enviar link</button>
          </form>
        )}
      </div>
    </PhoneFrame>
  );
}
