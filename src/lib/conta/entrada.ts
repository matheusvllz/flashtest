/**
 * Primeiro passo de estudo depois do onboarding (docs/specs/46-producao §0, D-16): o perfil, o nivelamento e o
 * diagnóstico são abertos, sem conta; a conta é pedida só quando o aluno vai começar a estudar. Com sessão, segue
 * direto; sem, vai para o cadastro e volta para `destino` depois.
 */
import { sessao } from "@/lib/sessao";

type Navegar = (opts: { href: string; replace?: boolean }) => unknown;

export async function irParaEstudo(navegar: Navegar, destino: string, replace = false): Promise<void> {
  const atual = await sessao().catch(() => null);
  if (atual?.autenticado) navegar({ href: destino, replace });
  else navegar({ href: `/cadastro?volta=${encodeURIComponent(destino)}`, replace });
}
