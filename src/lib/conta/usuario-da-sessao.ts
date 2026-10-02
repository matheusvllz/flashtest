/**
 * De quem é a sessão aberta neste navegador (docs/specs/46-producao T-07.2). Módulo mínimo (só o removedor do cache offline, sem dependências): a raiz
 * do app o alimenta (guarda das rotas) sem importar o store — regra de code splitting —, e o store o assina para
 * nunca mostrar o estado local de OUTRA conta (aparelho compartilhado).
 */
import { removerOffline } from "@/lib/offline/service-worker";

type Ouvinte = (userId: string) => void;

let atual: string | null = null;
/** Depois de sair: o que a raiz ainda tiver em mãos (dado da carga anterior) não vale até a guarda confirmar de novo. */
let esquecido = false;
const ouvintes = new Set<Ouvinte>();

/** Conta da sessão confirmada pelo servidor, ou `null` se ainda não se sabe (rota pública, SSR). */
export function usuarioDaSessao(): string | null {
  return atual;
}

/**
 * Sessão confirmada pela guarda das rotas (navegação no cliente, fora da renderização). Avisa o store quando a conta
 * muda, para ele reconciliar o estado local antes da próxima tela.
 */
export function definirUsuarioDaSessao(userId: string | null | undefined): void {
  if (!userId) return;
  esquecido = false;
  if (userId === atual) return;
  // Troca de conta no mesmo aparelho: as páginas guardadas para estudar sem internet levam a conta anterior (spec 49 T-49.9.3).
  if (atual !== null) void removerOffline();
  atual = userId;
  ouvintes.forEach((o) => o(userId));
}

/**
 * Primeira carga (a guarda rodou no servidor): a raiz informa a conta DURANTE a renderização, antes de qualquer tela
 * hidratar o store — sem avisar ninguém (nada de atualização de estado no meio da renderização). O store lê o valor ao
 * hidratar.
 */
export function informarUsuarioDaPrimeiraCarga(userId: string | null | undefined): void {
  if (!userId || esquecido || atual !== null) return;
  atual = userId;
}

/** Depois de sair da conta: nenhuma sessão conhecida até a próxima confirmação. */
export function esquecerUsuarioDaSessao(): void {
  atual = null;
  esquecido = true;
  // Sair da conta apaga o que foi baixado para estudar sem internet (as páginas guardadas levam a conta).
  void removerOffline();
}

export function aoMudarUsuarioDaSessao(o: Ouvinte): () => void {
  ouvintes.add(o);
  return () => void ouvintes.delete(o);
}

/** Só para testes: cada teste cria um store novo, e os ouvintes dos stores anteriores não podem reagir. */
export function reiniciarParaTestes(): void {
  atual = null;
  esquecido = false;
  ouvintes.clear();
}
