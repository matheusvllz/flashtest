import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { EmptyState } from "@/components/ds/EmptyState";
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
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neve px-8">
          <EmptyState
            text="Esse link não aponta para nenhuma lição da trilha de redação."
            cta={{ label: "Voltar à trilha", to: "/trilha" }}
          />
        </div>
      </PhoneFrame>
    );
  }

  return <LessonPlayer trilha={found.trilha} lesson={found.lesson} />;
}
