import { SUBJECT_MAP } from "@/data/subjects";
import { SKILL_MAP } from "@/content/taxonomy";
import { activityTitle } from "@/lib/adaptive/activity-lesson";
import { hrefForActivity, iniciaAoNavegar } from "@/lib/adaptive/journey";
import type { PlannedActivity } from "@/lib/adaptive/types";
import { COPY } from "@/lib/copy";
import type { JourneyHistoryEntry } from "@/lib/learning/types";
import { startJourneyActivity } from "@/lib/store";
import { PathConnector } from "@/components/learning/path/PathConnector";
import { PathNode, rowStyle } from "@/components/learning/path/PathNode";

const MAX_HISTORY = 6;

function subjectLabelOf(subjectId: string): string {
  return SUBJECT_MAP[subjectId]?.name ?? subjectId;
}

/**
 * Título de uma entrada de HISTÓRICO (docs/30 §14.3) — `JourneyHistoryEntry`
 * não guarda `lessonId`/título original, só `kind`/`skillIds` (registro
 * enxuto de propósito, podado em 200). "{tipo} · {habilidade}" é suficiente
 * pro caminho compacto (não precisa recriar o título exato da sessão).
 */
function historyTitle(entry: JourneyHistoryEntry): string {
  const skillName = SKILL_MAP[entry.skillIds[0]]?.name ?? "";
  const kindLabel = COPY.jornada.kinds[entry.kind];
  return skillName ? `${kindLabel} · ${skillName}` : kindLabel;
}

/**
 * Caminho único da jornada (docs/30 §14.1 item 4, Fase 12 do docs/31 F12.4)
 * — histórico compacto (até 6) → nó atual (destacado) → comprometidas →
 * "a seguir". Reaproveita `PathNode`/`PathConnector`/as classes CSS
 * `.path-list`/`.path-row`/`.path-connector` da trilha por matéria (docs/27),
 * mas sempre com `k=0` (linha reta): a jornada mistura matérias, então o
 * zigue-zague (que existe pra dar ritmo dentro de UMA matéria) não se aplica
 * — matéria aparece em TEXTO (`subjectLabel`), nunca em posição ou cor.
 *
 * Achado real (F12.4): `--k`/`--k-abs`/`--node-half` não são props de
 * `PathNode` — são custom properties CSS que `ChapterSegment.tsx` grava no
 * PRÓPRIO `<li class="path-row">` via `rowStyle()` (`PathNode.tsx`). Sem
 * isso, `var(--k)`/`var(--k-abs)` ficam indefinidas e o `calc()` de
 * `.path-node-anchor`/`.path-caption` (`styles.css`) vira inválido — Chrome
 * cai pro valor inicial da propriedade (`transform: none`), o nó perde a
 * centralização (`translate(-50%,-50%)`) e a legenda extrapola a tela.
 * Confirmado visualmente: nó deslocado à direita e legenda cortada em
 * 320px, `document.documentElement.scrollWidth > innerWidth`. Cada `<li>`
 * aqui precisa do MESMO `style={rowStyle(0, isFocus)}`.
 */
export function JourneyPath({
  history,
  committed,
  upcoming,
}: {
  history: JourneyHistoryEntry[];
  committed: PlannedActivity[];
  upcoming: PlannedActivity[];
}) {
  const historyRows = history.slice(-MAX_HISTORY);
  const current = committed[0];
  const plannedRows = [...committed.slice(1), ...upcoming];

  // Nada comprometido: "jornada infinita" esgotada (docs/30 §14.5) — quem
  // monta a tela (`SessionCard`) já mostra o aviso; o caminho fica vazio.
  if (!current) return null;

  return (
    <ol className="path-list mx-auto max-w-[calc(var(--path-col)-2.5rem)]">
      {historyRows.map((entry, i) => (
        <li key={`h-${entry.activityId}-${i}`} className="path-row" style={rowStyle(0, false)}>
          <div className="path-row-node">
            {i > 0 && <PathConnector fromK={0} toK={0} traced />}
            <PathNode
              k={0}
              isFocus={false}
              interactive={false}
              subjectLabel={subjectLabelOf(entry.subjectId)}
              stateLabelOverride={COPY.trilha.estados.completed}
              node={{
                id: entry.activityId,
                kind: entry.kind,
                status: "completed",
                title: historyTitle(entry),
                href: { to: "/atividade/$activityId", params: { activityId: entry.activityId } },
              }}
            />
          </div>
        </li>
      ))}

      <li className="path-row" style={rowStyle(0, true)}>
        <div className="path-row-node">
          {historyRows.length > 0 && <PathConnector fromK={0} toK={0} traced />}
          <PathNode
            k={0}
            isFocus
            subjectLabel={subjectLabelOf(current.subjectId)}
            stateLabelOverride={COPY.jornada.atual}
            node={{
              id: current.id,
              kind: current.kind,
              status: "current",
              title: activityTitle(current),
              href: hrefForActivity(current),
            }}
            // Aula/legado (`/learn`, `/redacao`) terminam fora da jornada e só
            // avisam de volta via `syncJourneyWithCompletions` (docs/32 F15.3)
            // — sem marcar QUEM está em andamento antes de sair daqui, essa
            // sincronização nunca tinha o que comparar e a fila nunca avançava.
            // Dinâmica (`/atividade`) só navega: a rota inicia a tentativa com
            // os itens já escolhidos (docs/36 T-02.1).
            onClick={() => {
              if (iniciaAoNavegar(current)) startJourneyActivity(current);
            }}
          />
        </div>
      </li>

      {plannedRows.map((activity) => (
        <li key={`p-${activity.id}`} className="path-row" style={rowStyle(0, false)}>
          <div className="path-row-node">
            <PathConnector fromK={0} toK={0} traced={false} />
            <PathNode
              k={0}
              isFocus={false}
              planned
              subjectLabel={subjectLabelOf(activity.subjectId)}
              stateLabelOverride={COPY.jornada.aSeguir}
              node={{
                id: activity.id,
                kind: activity.kind,
                status: "available",
                title: activityTitle(activity),
                href: hrefForActivity(activity),
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
