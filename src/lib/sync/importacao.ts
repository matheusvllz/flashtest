/**
 * Contrato da importação do progresso local para a conta (docs/specs/46-producao §G, T-07.1).
 *
 * O aparelho manda FATOS (respostas, lições e atividades concluídas, dias com estudo). O servidor recalcula a
 * correção pelo gabarito e o XP pelas regras vigentes, com teto: o XP importado nunca passa do XP que o aparelho
 * mostrava (`xpNoAparelho`) — assim um `localStorage` editado não vira recompensa. Idempotente por `importId`.
 */
import { z } from "zod";
import { FONTES_DE_RESPOSTA } from "./contrato";

const id = z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/);
const quando = z.string().datetime({ offset: true });
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const texto = z.string().min(1).max(200);
const pct = z.number().int().min(0).max(100);
const resposta = z.union([z.number().int().min(0).max(50), z.array(z.number().int().min(0).max(50)).max(20), z.null()]);

export const LIMITES_IMPORTACAO = { respostas: 500, licoes: 500, atividades: 300, dias: 60 } as const;

export const pedidoImportacao = z.object({
  importId: id,
  aparelhoId: id,
  schemaVersion: z.number().int().min(1).max(6),
  xpNoAparelho: z.number().int().min(0).max(1_000_000),
  respostas: z
    .array(
      z.object({
        id,
        itemId: texto,
        resposta,
        exibidos: z.array(z.string().max(500)).max(20).optional(),
        fonte: z.enum(FONTES_DE_RESPOSTA),
        attemptKey: z.string().min(1).max(200).optional(),
        ocorreuEm: quando,
        dataLocal: dia,
      }),
    )
    .max(LIMITES_IMPORTACAO.respostas),
  licoes: z
    .array(z.object({ licaoId: texto, tipoLicao: z.enum(["redacao", "micro"]), pct, concluidaEm: quando }))
    .max(LIMITES_IMPORTACAO.licoes),
  atividades: z
    .array(z.object({ attemptKey: z.string().min(1).max(200), atividadeId: texto, kind: z.string().min(1).max(40), pct: pct.nullable(), concluidaEm: quando }))
    .max(LIMITES_IMPORTACAO.atividades),
  diasComAtividade: z.array(dia).max(LIMITES_IMPORTACAO.dias),
  bonusDeEntrada: z.boolean(),
});
export type PedidoImportacao = z.infer<typeof pedidoImportacao>;

export interface ResumoImportacao {
  respostas: number;
  licoes: number;
  atividades: number;
  dias: number;
  xp: number;
  /** A importação já tinha sido feita antes (mesmo `importId`): nada foi aplicado de novo. */
  repetida: boolean;
}
