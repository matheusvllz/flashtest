/**
 * Validacao tecnica e editorial de um conteudo ja renderizado.
 *
 *   bun run validar <id>
 *
 * Confere, com medicao real (nao com promessa):
 *  - dimensoes de cada pagina exportada: 1080x1350 exatos
 *  - formato e tamanho do JPEG de publicacao (a Meta so aceita JPEG, ate 8 MB)
 *  - numero de paginas dentro do limite de carrossel (10)
 *  - ordem de publicacao explicita e sem buraco
 *  - emendas: cada pagina bate pixel a pixel com a faixa correspondente da panoramica
 *    (prova de que o recorte nao sobrepos, nao deslocou e nao deixou lacuna)
 *  - copy: padroes proibidos pelo guia (docs/copy) no texto das paginas e na legenda
 *
 * Escreve conteudos/<id>/validacao.json e devolve exit 1 se houver ERRO.
 * IMPORTANTE: validacao de dimensao NAO substitui revisao visual. Olhe as imagens.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { lerConfig } from "../lib/config.ts";
import { pastaConteudo } from "../lib/paths.ts";
import { PAGINA } from "../render/base.ts";
import type { Conteudo } from "../render/compor.ts";
import { conferirVideo } from "../video/motion.ts";

type ConteudoVideo = Conteudo & {
  video?: {
    arquivo: string;
    largura: number;
    altura: number;
    duracao: number;
    textosNaTela?: string[];
    audio?: { licenca?: string };
  };
};

/**
 * Validacao de video (motion e Reels), pelas especificacoes publicadas da Meta para Reels:
 * MP4/MOV, H.264 ou HEVC, 4:2:0, 23-60 fps, AAC ate 48 kHz, 3 s a 15 min, ate 300 MB, lado maior ate 1920.
 */
async function validarVideo(id: string, c: ConteudoVideo): Promise<Achado[]> {
  const pasta = pastaConteudo(id);
  const achados: Achado[] = [];
  if (!c.video)
    return [{ nivel: "erro", item: "video", detalhe: "conteudo.json sem bloco 'video'" }];
  const arq = join(pasta.base, c.video.arquivo);
  if (!existsSync(arq))
    return [
      { nivel: "erro", item: "video", detalhe: `nao achei ${arq}; rode 'bun run motion <cena>'` },
    ];
  const info = conferirVideo(arq);
  const v = info.streams.find((x) => x.codec_type === "video");
  const a = info.streams.find((x) => x.codec_type === "audio");
  const dur = Number(info.format.duration);
  const mb = Number(info.format.size) / 1048576;
  const [num, den] = (v?.r_frame_rate ?? "0/1").split("/").map(Number);
  const fps = num / (den || 1);
  const ok = (cond: boolean, item: string, bom: string, ruim: string) =>
    achados.push(
      cond ? { nivel: "ok", item, detalhe: bom } : { nivel: "erro", item, detalhe: ruim },
    );
  ok(
    !!v && ["h264", "hevc"].includes(v.codec_name),
    "codec",
    `${v?.codec_name}`,
    `${v?.codec_name}; a Meta aceita H.264 ou HEVC`,
  );
  ok(v?.pix_fmt === "yuv420p", "croma", "yuv420p (4:2:0)", `${v?.pix_fmt}; precisa 4:2:0`);
  ok(
    v?.width === c.video.largura && v?.height === c.video.altura,
    "dimensao",
    `${v?.width}x${v?.height}`,
    `${v?.width}x${v?.height}, esperado ${c.video.largura}x${c.video.altura}`,
  );
  ok(
    Math.max(v?.width ?? 0, v?.height ?? 0) <= 1920,
    "lado maior",
    "<= 1920 px",
    "acima de 1920 px",
  );
  ok(fps >= 23 && fps <= 60, "fps", `${fps}`, `${fps} fps; a Meta pede 23 a 60`);
  ok(
    dur >= 3 && dur <= 900,
    "duracao",
    `${dur.toFixed(2)} s`,
    `${dur.toFixed(2)} s; Reels vai de 3 s a 15 min`,
  );
  ok(
    Math.abs(dur - c.video.duracao) < 0.1,
    "duracao pedida",
    `bate com ${c.video.duracao} s`,
    `saiu ${dur.toFixed(2)} s, pedido ${c.video.duracao} s`,
  );
  ok(mb <= 300, "tamanho", `${mb.toFixed(2)} MB`, `${mb.toFixed(2)} MB acima de 300 MB`);
  ok(
    /mp4|mov/.test(info.format.format_name),
    "conteiner",
    info.format.format_name,
    `${info.format.format_name}`,
  );
  if (a) {
    ok(
      a.codec_name === "aac" && Number(a.sample_rate) <= 48000,
      "audio",
      `${a.codec_name} ${a.sample_rate} Hz ${a.channels} canal(is)`,
      `${a.codec_name} ${a.sample_rate} Hz`,
    );
    ok(
      !!c.video.audio?.licenca,
      "licenca do audio",
      c.video.audio?.licenca?.slice(0, 70) ?? "",
      "audio sem licenca registrada em conteudo.json",
    );
  } else
    achados.push({
      nivel: "alerta",
      item: "audio",
      detalhe:
        "video mudo: se for Reels, adicione a musica no app ou registre uma faixa licenciada",
    });
  // moov no inicio (faststart): o atom 'moov' tem que vir antes do 'mdat'
  const cab = readFileSync(arq).subarray(0, 4096).toString("latin1");
  ok(
    cab.indexOf("moov") >= 0 &&
      (cab.indexOf("mdat") < 0 || cab.indexOf("moov") < cab.indexOf("mdat")),
    "moov no inicio",
    "faststart",
    "moov depois do mdat; refaca com -movflags +faststart",
  );
  return achados;
}

type Achado = { nivel: "erro" | "alerta" | "ok"; item: string; detalhe: string };

const regras = JSON.parse(readFileSync(new URL("./regras.json", import.meta.url), "utf8")) as {
  proibidos: { re: string; porque: string }[];
  alerta: { re: string; porque: string }[];
};

/** Todo texto que o leitor ve: paginas + legenda. */
export function textoDoConteudo(c: Conteudo) {
  const partes: string[] = [c.legenda ?? ""];
  const coletar = (v: unknown) => {
    if (typeof v === "string") partes.push(v);
    else if (Array.isArray(v)) v.forEach(coletar);
    else if (v && typeof v === "object")
      // chaves internas (nome de tela, alvo medido, modelo, expressao) nao sao texto que o leitor ve
      Object.entries(v).forEach(([k, x]) =>
        ["tela", "alvo", "modelo", "expressao", "caixa", "recorte"].includes(k) ? null : coletar(x),
      );
  };
  coletar(c.paginas);
  return partes.join("\n");
}

export function checarCopy(texto: string): Achado[] {
  const achados: Achado[] = [];
  for (const r of regras.proibidos) {
    const m = new RegExp(r.re, "giu").exec(texto);
    if (m) achados.push({ nivel: "erro", item: "copy", detalhe: `"${m[0].trim()}" — ${r.porque}` });
  }
  for (const r of regras.alerta) {
    const m = new RegExp(r.re, "giu").exec(texto);
    if (m)
      achados.push({ nivel: "alerta", item: "copy", detalhe: `"${m[0].trim()}" — ${r.porque}` });
  }
  return achados;
}

export async function validar(id: string) {
  const cfg = lerConfig();
  const pasta = pastaConteudo(id);
  const c = JSON.parse(readFileSync(pasta.conteudo, "utf8")) as Conteudo;
  if (c.formato === ("motion" as string) || c.formato === ("reels" as string)) {
    const cv = c as ConteudoVideo;
    const achadosV = await validarVideo(id, cv);
    achadosV.push(...checarCopy([c.legenda ?? "", ...(cv.video?.textosNaTela ?? [])].join("\n")));
    const errosV = achadosV.filter((a) => a.nivel === "erro");
    const relV = {
      id,
      validadoEm: new Date().toISOString(),
      erros: errosV.length,
      alertas: achadosV.filter((a) => a.nivel === "alerta").length,
      achados: achadosV,
    };
    writeFileSync(pasta.validacao, JSON.stringify(relV, null, 2) + "\n");
    return relV;
  }
  const ordemArq = join(pasta.export, "ordem.json");
  if (!existsSync(ordemArq)) throw new Error(`renderize antes: bun run render ${id}`);
  const ordem = JSON.parse(readFileSync(ordemArq, "utf8")) as {
    paginas: { pagina: number; png: string; jpg?: string; bytesJpg?: number }[];
    panoramica: { arquivo: string; largura: number; altura: number };
  };

  const achados: Achado[] = [];
  const n = ordem.paginas.length;

  // Destaque (stories 9:16 + capa 1:1): sem panoramica, dimensoes proprias.
  if ((c.formato as string) === "story") {
    const { STORY, CAPA } = await import("../render/stories.ts");
    const o = ordem as typeof ordem & { capa?: { png: string; jpg: string }; medicao?: string[] };
    const conferir = async (png: string, jpg: string | undefined, item: string, L: number, A: number) => {
      const m = await sharp(png).metadata();
      achados.push(
        m.width === L && m.height === A
          ? { nivel: "ok", item: `${item} dimensao`, detalhe: `${m.width}x${m.height}` }
          : { nivel: "erro", item: `${item} dimensao`, detalhe: `${m.width}x${m.height}, esperado ${L}x${A}` },
      );
      if (jpg) {
        const bytes = statSync(jpg).size;
        const mj = await sharp(jpg).metadata();
        achados.push(
          mj.format === "jpeg" && bytes <= cfg.formatos.maxBytesImagem
            ? { nivel: "ok", item: `${item} jpeg`, detalhe: `${(bytes / 1024).toFixed(0)} KB` }
            : { nivel: "erro", item: `${item} jpeg`, detalhe: `${mj.format}, ${(bytes / 1048576).toFixed(2)} MB` },
        );
      }
    };
    if (n < 1 || n > 100) achados.push({ nivel: "erro", item: "stories", detalhe: `${n} stories` });
    else if (n < 5 || n > 7) achados.push({ nivel: "alerta", item: "stories", detalhe: `${n} stories (o pedido foi 5 a 7)` });
    else achados.push({ nivel: "ok", item: "stories", detalhe: `${n} stories, ordem 1..${n}` });
    for (const p of ordem.paginas) await conferir(p.png, p.jpg, `s${p.pagina}`, STORY.largura, STORY.altura);
    if (o.capa) await conferir(o.capa.png, o.capa.jpg, "capa", CAPA.largura, CAPA.altura);
    else achados.push({ nivel: "erro", item: "capa", detalhe: "sem capa 1:1" });
    for (const pr of o.medicao ?? []) achados.push({ nivel: "erro", item: "medicao", detalhe: pr });
    if (!o.medicao?.length)
      achados.push({ nivel: "ok", item: "medicao", detalhe: "nada essencial nas areas seguras nem fora da margem" });
    achados.push(...checarCopy(textoDoConteudo(c)));
    const errosS = achados.filter((a) => a.nivel === "erro");
    const relS = {
      id,
      validadoEm: new Date().toISOString(),
      erros: errosS.length,
      alertas: achados.filter((a) => a.nivel === "alerta").length,
      achados,
    };
    writeFileSync(pasta.validacao, JSON.stringify(relS, null, 2) + "\n");
    return relS;
  }

  if (c.formato === "carrossel" && n > cfg.formatos.maxPaginasCarrossel)
    achados.push({
      nivel: "erro",
      item: "paginas",
      detalhe: `${n} paginas; o carrossel aceita no maximo ${cfg.formatos.maxPaginasCarrossel}`,
    });
  if (c.formato === "post-estatico" && n !== 1)
    achados.push({
      nivel: "erro",
      item: "paginas",
      detalhe: `post estatico deve ter 1 pagina, tem ${n}`,
    });

  const esperada = ordem.paginas.map((p) => p.pagina).join(",");
  const correta = Array.from({ length: n }, (_, i) => i + 1).join(",");
  achados.push(
    esperada === correta
      ? { nivel: "ok", item: "ordem", detalhe: `ordem de publicacao 1..${n}, sem buraco` }
      : { nivel: "erro", item: "ordem", detalhe: `ordem quebrada: ${esperada}` },
  );

  for (const p of ordem.paginas) {
    const m = await sharp(p.png).metadata();
    achados.push(
      m.width === PAGINA.largura && m.height === PAGINA.altura
        ? { nivel: "ok", item: `p${p.pagina} dimensao`, detalhe: `${m.width}x${m.height} (4:5)` }
        : {
            nivel: "erro",
            item: `p${p.pagina} dimensao`,
            detalhe: `${m.width}x${m.height}, esperado ${PAGINA.largura}x${PAGINA.altura}`,
          },
    );
    if (p.jpg) {
      const mj = await sharp(p.jpg).metadata();
      const bytes = statSync(p.jpg).size;
      if (mj.format !== "jpeg")
        achados.push({
          nivel: "erro",
          item: `p${p.pagina} formato`,
          detalhe: `${mj.format}; a API da Meta so aceita JPEG`,
        });
      else if (bytes > cfg.formatos.maxBytesImagem)
        achados.push({
          nivel: "erro",
          item: `p${p.pagina} tamanho`,
          detalhe: `${(bytes / 1048576).toFixed(2)} MB acima do limite de 8 MB`,
        });
      else
        achados.push({
          nivel: "ok",
          item: `p${p.pagina} jpeg`,
          detalhe: `${(bytes / 1024).toFixed(0)} KB, ${mj.width}x${mj.height}`,
        });
    }
  }

  // Emendas: recorta a panoramica de novo e compara byte a byte com a pagina exportada.
  if (existsSync(ordem.panoramica.arquivo) && n > 1) {
    let iguais = 0;
    for (let i = 0; i < n; i++) {
      const fatia = await sharp(ordem.panoramica.arquivo)
        .extract({ left: i * PAGINA.largura, top: 0, width: PAGINA.largura, height: PAGINA.altura })
        .raw()
        .toBuffer();
      const pag = await sharp(ordem.paginas[i].png).raw().toBuffer();
      if (Buffer.compare(fatia, pag) === 0) iguais++;
    }
    achados.push(
      iguais === n
        ? {
            nivel: "ok",
            item: "emendas",
            detalhe: `${n}/${n} paginas identicas a sua faixa na panoramica: sem sobreposicao, lacuna ou deslocamento`,
          }
        : {
            nivel: "erro",
            item: "emendas",
            detalhe: `${iguais}/${n} conferem; o recorte deslocou`,
          },
    );
  }

  achados.push(...checarCopy(textoDoConteudo(c)));

  const legenda = (c.legenda ?? "").length;
  achados.push(
    legenda > 2200
      ? {
          nivel: "erro",
          item: "legenda",
          detalhe: `${legenda} caracteres; o Instagram corta em 2.200`,
        }
      : { nivel: "ok", item: "legenda", detalhe: `${legenda} caracteres` },
  );
  if (!c.fontesFato?.length)
    achados.push({
      nivel: "ok",
      item: "fatos",
      detalhe: "nenhum fato externo declarado: o conteudo so afirma o que o produto demonstra",
    });
  else
    for (const f of c.fontesFato)
      achados.push({
        nivel: f.fonte ? "ok" : "erro",
        item: "fatos",
        detalhe: f.fonte
          ? `"${f.afirmacao.slice(0, 60)}" -> ${f.fonte}`
          : `sem fonte: "${f.afirmacao}"`,
      });

  const erros = achados.filter((a) => a.nivel === "erro");
  const relatorio = {
    id,
    validadoEm: new Date().toISOString(),
    erros: erros.length,
    alertas: achados.filter((a) => a.nivel === "alerta").length,
    achados,
  };
  writeFileSync(pasta.validacao, JSON.stringify(relatorio, null, 2) + "\n");
  return relatorio;
}

if (import.meta.main) {
  const id = process.argv[2];
  if (!id) throw new Error("uso: bun run validar <id>");
  const r = await validar(id);
  for (const a of r.achados)
    console.log(
      `${a.nivel === "ok" ? "  ok  " : a.nivel === "alerta" ? " AVISO" : " ERRO "} ${a.item.padEnd(18)} ${a.detalhe}`,
    );
  console.log(
    `\n${r.erros} erro(s), ${r.alertas} alerta(s). Relatorio: conteudos/${id}/validacao.json`,
  );
  console.log("Lembrete: isto nao substitui olhar as imagens em tamanho de celular.");
  if (r.erros) process.exit(1);
}
