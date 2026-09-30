/**
 * Perfil do onboarding no servidor (docs/specs/46-producao §E.2). Só os campos de
 * docs/seguranca/privacidade.md; só preenche o que veio, nunca apaga.
 */
import type { PerfilDoOnboarding } from "@/lib/api/conta";
import type { Json, JsonObjeto } from "@/lib/json";
import type { Banco } from "../db/client";
import { profile } from "../db/schema";

export async function gravarPerfil(db: Banco, userId: string, p: PerfilDoOnboarding): Promise<void> {
  await db
    .insert(profile)
    .values({
      userId,
      firstName: p.primeiroNome || null,
      level: p.etapa ?? null,
      residenceState: p.uf ?? null,
      targetCourse: p.cursoAlvo ?? null,
      targetInstitution: p.instituicaoAlvo ?? null,
      examTargets: (p.provas ?? []) as Json[],
      studyPrefs: (p.preferencias ?? {}) as JsonObjeto,
      onboardedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profile.userId,
      set: {
        ...(p.primeiroNome ? { firstName: p.primeiroNome } : {}),
        ...(p.etapa ? { level: p.etapa } : {}),
        ...(p.uf ? { residenceState: p.uf } : {}),
        ...(p.cursoAlvo ? { targetCourse: p.cursoAlvo } : {}),
        ...(p.instituicaoAlvo ? { targetInstitution: p.instituicaoAlvo } : {}),
        ...(p.provas ? { examTargets: p.provas as Json[] } : {}),
        ...(p.preferencias ? { studyPrefs: p.preferencias as JsonObjeto } : {}),
        onboardedAt: new Date(),
        updatedAt: new Date(),
      },
    });
}

