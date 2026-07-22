import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { LessonPlayer } from "@/components/lessons/LessonPlayer";
import { lessonById } from "@/content/trilhas";

export const Route = createFileRoute("/redacao/$licaoId")({ component: Licao, ssr: false });

function Licao() {
  const { licaoId } = Route.useParams();
  const found = lessonById(licaoId);

  // Link velho/errado não pode virar tela branca na demo.
  if (!found) {
    return (
      <PhoneFrame>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
          <h1 className="font-display text-xl font-bold text-navy">Lição não encontrada</h1>
          <p className="text-sm text-slate">
            Esse link não aponta para nenhuma lição da trilha de redação.
          </p>
          <Link to="/redacao" className="btn-primary">
            Voltar à trilha
          </Link>
        </div>
      </PhoneFrame>
    );
  }

  return <LessonPlayer trilha={found.trilha} lesson={found.lesson} />;
}
