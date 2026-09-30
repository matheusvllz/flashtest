/**
 * Cliente de autenticação do navegador (Better Auth; docs/specs/46-producao T-05.4).
 * Fala com `/api/auth/*` na mesma origem; o cookie de sessão é `HttpOnly` (o JavaScript da página
 * nunca o lê). Não importar na raiz (`__root.tsx`) — regra de code splitting.
 */
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        birthYear: { type: "number", required: false },
        termsVersion: { type: "string", required: false },
        privacyVersion: { type: "string", required: false },
      },
    }),
  ],
});
