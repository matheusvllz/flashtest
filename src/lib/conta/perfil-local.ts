/**
 * O perfil respondido no onboarding (guardado no aparelho até a conta existir) no formato que o
 * servidor aceita (`esquemaPerfil`, src/lib/api/conta.ts). Só os campos de
 * docs/seguranca/privacidade.md — o e-mail do login antigo, por exemplo, não vai.
 */
import type { PerfilDoOnboarding } from "@/lib/api/conta";
import { getState } from "@/lib/store";

const UF = /^[A-Z]{2}$/;

export function perfilDoAparelho(): PerfilDoOnboarding {
  const p = getState().prefs;
  const nome = p.name?.trim().split(/\s+/)[0]?.slice(0, 40);
  return {
    ...(nome ? { primeiroNome: nome } : {}),
    ...(p.level ? { etapa: String(p.level).slice(0, 40) } : {}),
    ...(p.residenceState && UF.test(p.residenceState) ? { uf: p.residenceState } : {}),
    ...(p.targetCourse ? { cursoAlvo: p.targetCourse.slice(0, 80) } : {}),
    ...(p.targetInstitution ? { instituicaoAlvo: p.targetInstitution.slice(0, 120) } : {}),
    ...(p.examTargets?.length ? { provas: p.examTargets.slice(0, 10) } : {}),
    preferencias: {
      dailyMinutes: p.dailyMinutes,
      studyFocus: p.studyFocus,
      difficultSubjects: p.difficultSubjects,
      easySubjects: p.easySubjects,
    },
  };
}
