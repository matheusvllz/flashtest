# src/content/banco/

Conteúdo em escala gerado pelo pipeline de IA (docs/30 §18–19, Fases 9 e 11 do `docs/31`). Vazia até a Fase 11 rodar de verdade — o repositório (`src/lib/content/repository.ts`) e o script de build (`scripts/content/build-packs.ts`) já sabem lidar com esta pasta vazia (manifest vazio, sem quebrar `bun run dev`/`bun run build`).

**Formato de cada arquivo** (`<materia>/<skillId>.json`), quando existir: `{ version, subjectId, items: [{ id, exercise, meta }], lessons: [MicroLessonV2] }`. Nunca editar `aulas-geradas.ts` à mão — ele é regenerado por `build-packs.ts` a partir do que estiver aqui.

Não versionar `public/content/v1/` (saída do build — `.gitignore`, docs/32 Fase 0).
