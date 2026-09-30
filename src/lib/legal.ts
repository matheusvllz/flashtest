/**
 * Versões vigentes dos documentos legais (docs/legal/README.md; docs/specs/46-producao §H.4).
 * Mudança material no texto = nova versão aqui, e o aluno aceita de novo no próximo acesso.
 *
 * `FINAL = false` enquanto houver pendência jurídica (docs/legal/README.md): os textos aparecem
 * marcados como rascunho e o cadastro fica desligado em produção (`contasHabilitadas`).
 */
export const LEGAL = {
  termos: { versao: "2026-09-30-rascunho", final: false },
  privacidade: { versao: "2026-09-30-rascunho", final: false },
} as const;

export type DocumentoLegal = keyof typeof LEGAL;

/** Idade (em anos completos no ano corrente) a partir do ano de nascimento. */
export function idadePeloAno(anoNascimento: number, hoje: Date = new Date()): number {
  // Sem a data completa (minimização), usamos a idade que a pessoa completa no ano corrente.
  return hoje.getFullYear() - anoNascimento;
}
