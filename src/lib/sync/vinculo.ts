/**
 * Conta neste aparelho, do lado das telas (docs/specs/46-producao T-06.4/T-07.2): liga o motor de sincronização e,
 * se houver estudo de antes da conta ainda sem decisão, leva o aluno à tela de importação. "Decidir depois" adia a
 * pergunta por um dia; enquanto isso o estudo segue só neste aparelho.
 */
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { iniciarSincronizacao } from "@/lib/sync/motor";
import { hydrate, precisaDecidirImportacao } from "@/lib/store";

/** Até quando (ms) a pergunta da importação fica adiada. */
export const CHAVE_IMPORTACAO_ADIADA = "foca.importacao.adiadaAte";
const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function adiarImportacao(): void {
  try {
    localStorage.setItem(CHAVE_IMPORTACAO_ADIADA, String(Date.now() + UM_DIA_MS));
  } catch {
    /* sem storage: a tela volta a perguntar na próxima navegação */
  }
}

function importacaoAdiada(): boolean {
  try {
    return Number(localStorage.getItem(CHAVE_IMPORTACAO_ADIADA)) > Date.now();
  } catch {
    return false;
  }
}

/** Montado pelo AppShell (telas do produto). */
export function useContaNoAparelho(): void {
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    hydrate();
    iniciarSincronizacao();
  }, []);

  useEffect(() => {
    hydrate();
    if (precisaDecidirImportacao() && !importacaoAdiada()) {
      navigate({ to: "/importar-progresso", search: { volta: href }, replace: true });
    }
  }, [href, navigate]);
}
