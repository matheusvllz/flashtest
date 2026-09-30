/**
 * Previa navegavel para revisao humana.
 *
 *   bun run preview <id>        gera conteudos/<id>/preview/index.html
 *   bun run preview --galeria   gera previews/index.html com todos os conteudos
 *
 * A previa mostra cada pagina em ~390 px de largura (tamanho real de celular) para
 * conferir legibilidade, e a panoramica inteira para conferir as emendas.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { P, pastaConteudo } from "../lib/paths.ts";
import type { Conteudo } from "./compor.ts";

const ESTILO = `
body{margin:0;background:#1c1b18;color:#f3f1ec;font:15px/1.5 system-ui,sans-serif;padding:32px}
h1{font-size:24px;margin:0 0 4px} h2{font-size:15px;font-weight:600;margin:38px 0 10px;color:#a6a29a;letter-spacing:.08em;text-transform:uppercase}
.meta{color:#a6a29a;margin-bottom:8px}
.fila{display:flex;gap:16px;overflow-x:auto;padding-bottom:14px;scroll-snap-type:x mandatory}
.fila figure{margin:0;scroll-snap-align:start;flex:0 0 auto}
.fila img{display:block;width:390px;height:auto;border-radius:10px;background:#f6f5f1}
figcaption{color:#a6a29a;font-size:13px;margin-top:6px}
.pan{width:100%;overflow-x:auto;border-radius:10px;background:#262523;padding:10px}
.pan img{display:block;height:300px;width:auto;image-rendering:auto}
.legenda{white-space:pre-wrap;background:#262523;border-radius:10px;padding:16px;max-width:760px}
a{color:#8fb0ff}
.aviso{border-left:3px solid #d9a017;padding:8px 14px;margin:18px 0;color:#e8d9a8}
`;

function u(caminho: string) {
  return pathToFileURL(caminho).href;
}

export function previewConteudo(id: string) {
  const pasta = pastaConteudo(id);
  const c = JSON.parse(readFileSync(pasta.conteudo, "utf8")) as Conteudo;
  const ordem = JSON.parse(readFileSync(join(pasta.export, "ordem.json"), "utf8")) as {
    paginas: { pagina: number; png: string }[];
    panoramica: { arquivo: string };
  };
  const val = existsSync(pasta.validacao)
    ? JSON.parse(readFileSync(pasta.validacao, "utf8"))
    : null;

  const html = `<!doctype html><meta charset="utf-8"><title>${id}</title><style>${ESTILO}</style>
<h1>${c.gancho}</h1>
<div class="meta">${id} · ${c.formato} · pilar: ${c.pilar} · ${ordem.paginas.length} pagina(s) 1080x1350</div>
<div class="aviso">Revisao visual: leia cada pagina nesta largura (390 px = celular). Confira ortografia, recortes, contraste, margens e as emendas na panoramica.</div>
<h2>Paginas, na ordem de publicacao</h2>
<div class="fila">${ordem.paginas.map((p) => `<figure><img src="${u(p.png)}" alt="pagina ${p.pagina}"><figcaption>${p.pagina}/${ordem.paginas.length}</figcaption></figure>`).join("")}</div>
<h2>Panoramica (emendas)</h2>
<div class="pan"><img src="${u(ordem.panoramica.arquivo)}" alt="panoramica"></div>
<h2>Legenda</h2>
<div class="legenda">${(c.legenda ?? "").replace(/</g, "&lt;")}</div>
${
  val
    ? `<h2>Validacao tecnica</h2><div class="legenda">${val.erros} erro(s), ${val.alertas} alerta(s)\n${
        val.achados
          .filter((a: { nivel: string }) => a.nivel !== "ok")
          .map(
            (a: { nivel: string; item: string; detalhe: string }) =>
              `${a.nivel.toUpperCase()} ${a.item}: ${a.detalhe}`,
          )
          .join("\n") || "nenhum achado alem dos ok"
      }</div>`
    : ""
}
<h2>Arquivos</h2>
<div class="legenda">fonte editavel: <a href="${u(join(pasta.fonte, "pagina.html"))}">fonte/pagina.html</a>
exportados: ${relative(P.raiz, pasta.export)}
</div>`;
  const saida = join(pasta.preview, "index.html");
  writeFileSync(saida, html);
  return saida;
}

export function galeria() {
  const ids = readdirSync(P.conteudos).filter(
    (d) => existsSync(join(P.conteudos, d, "conteudo.json")) && !d.startsWith("_"),
  );
  const cartoes = ids
    .map((id) => {
      const c = JSON.parse(
        readFileSync(join(P.conteudos, id, "conteudo.json"), "utf8"),
      ) as Conteudo;
      const contato = join(P.conteudos, id, "preview", "contato.png");
      return `<h2>${id} — ${c.gancho}</h2><div class="pan">${existsSync(contato) ? `<img src="${u(contato)}" style="height:220px">` : "(sem render)"}</div>
<div class="meta"><a href="${u(join(P.conteudos, id, "preview", "index.html"))}">abrir previa</a></div>`;
    })
    .join("\n");
  const saida = join(P.previews, "index.html");
  writeFileSync(
    saida,
    `<!doctype html><meta charset="utf-8"><title>Foca — conteudos</title><style>${ESTILO}</style><h1>Conteudos</h1>${cartoes || "<p>nenhum conteudo ainda</p>"}`,
  );
  return saida;
}

if (import.meta.main) {
  const arg = process.argv[2];
  console.log(arg === "--galeria" || !arg ? galeria() : previewConteudo(arg));
}
