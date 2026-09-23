import { pathK } from "@/lib/learning/path-layout";
import { rowStyle } from "./PathNode";
import { PhoneFrame } from "@/components/AppShell";

/** Skeleton da rota `/trilha` (docs/27 §6.7, docs/28 T-16) — a própria forma da trilha, sem spinner. */
export function TrailSkeleton() {
  return (
    <PhoneFrame>
      <div data-trail-skeleton className="px-5 pt-6" aria-busy="true" aria-label="Carregando a trilha">
        <div className="flex items-center gap-3">
          <span className="skeleton h-5 w-16" />
          <span className="skeleton h-10 w-10 rounded-full" />
          <span className="skeleton h-3 flex-1" />
        </div>
        <div className="mt-5 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="skeleton h-9 w-24 rounded-full" />
          ))}
        </div>
        <span className="skeleton mt-6 block h-16 w-full" />
        <ol className="path-list" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="path-row" style={rowStyle(pathK(i), false)}>
              <div className="path-row-node">
                <span className="path-node-anchor">
                  <span className="skeleton block h-16 w-16 rounded-full" />
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PhoneFrame>
  );
}
