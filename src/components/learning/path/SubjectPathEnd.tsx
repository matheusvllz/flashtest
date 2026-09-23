import { Link } from "@tanstack/react-router";
import { FocaMark } from "@/components/brand/FocaMark";
import { COPY } from "@/lib/copy";

/** Fim da matéria: nada pendente para estudar (RF-12). */
export function SubjectPathEnd({ subjectName }: { subjectName: string }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 px-4 text-center">
      <FocaMark expression="orgulhosa" size={72} decorative motion="pop" />
      <p className="font-display text-lg font-bold text-abismo">{COPY.trilha.fimDaMateria(subjectName)}</p>
      <Link to="/study" className="btn-outline">
        {COPY.trilha.praticar}
      </Link>
    </div>
  );
}
