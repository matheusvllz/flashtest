import { expect, test } from "@playwright/test";
import { percorrerLicao } from "./helpers/licao";

/**
 * Critério A12 (docs/20 §20, Fase 9): a trilha mostra estado em texto (não só
 * ícone/cor), URL direta respeita a mesma regra de bloqueio que o nó, e
 * concluir uma lição desbloqueia a seguinte sem exigir acerto total.
 *
 * `FEATURES.trilhaComoHome` está `true` (docs/25 §18 T-22) — `/dashboard` não
 * é mais a home real: seu `beforeLoad` redireciona pra `/trilha` antes de
 * `dashboard.tsx` renderizar, então o texto "Trilha de aprendizado" (o
 * antigo card de atalho dentro do dashboard) nunca aparece. O teste abaixo
 * passou a verificar o comportamento correto pós-T-22: visitar `/dashboard`
 * aterrissa em `/trilha` com o conteúdo real da trilha visível.
 */
test("Fase 12/T-22 — /dashboard redireciona pra /trilha e mostra o conteúdo da trilha", async ({
  page,
}) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/trilha", { timeout: 15000 });
  await expect(page.getByText("Continuar").first()).toBeVisible({ timeout: 15000 });
});

/**
 * Achado da verificação da Fase 6 (docs/25 §18 T-27): trocar de matéria no
 * chip reordena a recomendação pra priorizar aquela matéria (`buildTrail`:
 * `phasesOrderedForSubject(prefs.trailSubjectId)`) — então, ao selecionar
 * "Português", a 1ª lição elegível de Português ("crase-quando-usar") vira o
 * nó atual da trilha inteira, e o capítulo "Crase" (que a contém) já abre
 * sozinho (`ChapterCard.defaultOpen`: `containsCurrent`). Isso só acontece
 * com lições MICRO (`fasesNaOrdemDaArvore` só itera capítulos sem
 * `trilhaId`) — um capítulo LEGADO nunca vira "o nó atual", então a 1ª lição
 * de "Crase sem medo" (a trilha legada de crase) fica "Disponível" de
 * verdade, sem depender de qual matéria está selecionada. Daí os 2 cliques:
 * chip "Português", depois o cabeçalho de "Crase sem medo" (que começa
 * colapsado — não contém o nó atual, então não abre sozinho).
 */
test("trilha mostra nós com rótulo textual de estado (disponível e bloqueada)", async ({ page }) => {
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /^Português/ }).waitFor({ timeout: 15000 });

  await page.getByRole("button", { name: /^Português/ }).click();
  await page.getByText("Crase sem medo", { exact: true }).click();

  // 1ª lição de "Crase sem medo" não tem pré-requisito (é sequencial, idx 0
  // sempre desbloqueado) -> Disponível; a 2ª depende da 1ª -> Bloqueada.
  await expect(page.getByText("Disponível").first()).toBeVisible();
  await expect(page.getByText("Bloqueada").first()).toBeVisible();
});

test("URL direta pra uma lição bloqueada respeita a mesma regra do nó (não pula o bloqueio)", async ({
  page,
}) => {
  // "citologia-organelas" depende de "citologia-membrana" — ainda não concluída.
  await page.goto("/learn/citologia-organelas", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/ainda está bloqueada/)).toBeVisible({ timeout: 15000 });
});

test("concluir a 1ª lição desbloqueia a 2ª — na trilha E por URL direta", async ({ page }) => {
  await page.goto("/learn/porcentagem-valor", { waitUntil: "domcontentloaded" });
  // Gabarito real de `porcentagem-valor` (docs/25 §18 T-13): checkpoint=1,
  // q10 (banco geral, gabarito D)=3, prática-2=2, prática-3=1, desafio=2.
  await percorrerLicao(page, { acertarIndices: [1, 3, 2, 1, 2] });
  // Título sorteado (`CelebracaoAula.tsx`) — "Você aprendeu" é o marcador estável.
  await expect(page.getByText("Você aprendeu")).toBeVisible();

  // Agora "porcentagem-aumento-desconto" deve estar acessível direto pela URL.
  await page.goto("/learn/porcentagem-aumento-desconto", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Começar" })).toBeVisible({
    timeout: 15000,
  });

  // E também deixar de estar bloqueada na trilha — com a 1ª lição concluída,
  // `recommendNext` recomenda esta como a próxima, então ela vira o nó
  // ATUAL ("Continuar daqui"), não um "Disponível" qualquer solto na lista
  // (`recommend.ts` passo 4 — próxima microlição disponível na ordem).
  await page.goto("/trilha", { waitUntil: "domcontentloaded" });
  // Agora que é a recomendação, o título "Aumento e desconto percentual"
  // aparece em 3 lugares (título do card, texto de explicação, nó da
  // trilha) — o `aria-label` do `<Link>` do nó é o único jeito inequívoco de
  // mirar SÓ o nó (`LessonNode.tsx`: `"{titulo} — {estado}"`).
  const node = page.getByRole("link", { name: /^Aumento e desconto percentual —/ });
  await node.waitFor({ timeout: 15000 });
  await expect(node).toContainText("Continuar daqui");
});
