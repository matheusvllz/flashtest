/**
 * Renderizador de motion design — determinista, quadro a quadro.
 *
 *   bun run motion <cena> [--previa] [--fps 30] [--escala 0.5]
 *
 * Uma CENA e um HTML que expoe `window.seek(t)`: dado o tempo em segundos, ele posiciona
 * tudo. Nao ha animacao CSS rodando nem nada dependente do relogio — por isso o render e
 * reproduzivel e da para gerar so um trecho (`--previa`) sem regerar o filme inteiro.
 *
 * Saida em conteudos/<id>/: export/<cena>.mp4 (H.264 + AAC, moov no inicio) e
 * fonte/<cena>.html (a fonte editavel). Os quadros ficam em fonte/quadros/ (gitignorado).
 *
 * Por que nao Remotion: a pasta "edição Videos" tem as skills Remotion instaladas e continua
 * sendo o caminho para um projeto de video maior. Aqui o renderizador de HTML ja existe
 * (e o mesmo dos posts 4:5) e a cena e um arquivo so, sem projeto npm por video.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright-core";
import { acharChromium } from "../lib/chromium.ts";
import { pastaConteudo } from "../lib/paths.ts";

export type Cena = {
  id: string;
  nome: string;
  largura: number;
  altura: number;
  fps: number;
  duracao: number;
  html: () => string;
  /** Trilhas de audio: arquivo local + instante de inicio, em segundos. */
  audio?: { arquivo: string; em: number; ganho?: number }[];
  /** Origem e licenca de cada faixa. Sem isso o audio nao entra. */
  licencaAudio?: string;
};

function ffmpeg(args: string[]) {
  const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffmpeg falhou:\n${r.stderr?.slice(-2000)}`);
  return r;
}

export async function renderizarCena(
  cena: Cena,
  opcoes: { previa?: boolean; escala?: number } = {},
) {
  const pasta = pastaConteudo(cena.id);
  const quadros = join(pasta.fonte, "quadros");
  for (const d of [pasta.fonte, pasta.export]) mkdirSync(d, { recursive: true });
  if (existsSync(quadros)) rmSync(quadros, { recursive: true });
  mkdirSync(quadros, { recursive: true });

  const arquivoHtml = join(pasta.fonte, `${cena.nome}.html`);
  writeFileSync(arquivoHtml, cena.html());

  const escala = opcoes.escala ?? (opcoes.previa ? 0.5 : 1);
  const fps = opcoes.previa ? Math.min(cena.fps, 15) : cena.fps;
  const duracao = opcoes.previa ? Math.min(cena.duracao, 4) : cena.duracao;
  const total = Math.round(duracao * fps);

  const navegador = await chromium.launch({ executablePath: acharChromium() });
  const pagina = await navegador.newPage({
    viewport: { width: cena.largura, height: cena.altura },
    deviceScaleFactor: escala,
  });
  await pagina.goto(pathToFileURL(arquivoHtml).href, { waitUntil: "load" });
  await pagina.evaluate(() => (document as unknown as { fonts: FontFaceSet }).fonts.ready);

  for (let i = 0; i < total; i++) {
    const t = i / fps;
    await pagina.evaluate((tt) => (window as unknown as { seek: (n: number) => void }).seek(tt), t);
    await pagina.screenshot({
      path: join(quadros, `q${String(i).padStart(5, "0")}.png`),
      scale: "css",
    });
  }
  await navegador.close();

  const saida = join(pasta.export, `${cena.nome}${opcoes.previa ? "-previa" : ""}.mp4`);
  const comAudio = !opcoes.previa && cena.audio?.length;

  if (!comAudio) {
    ffmpeg([
      "-y",
      "-framerate",
      String(fps),
      "-i",
      join(quadros, "q%05d.png"),
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-profile:v",
      "high",
      "-r",
      String(fps),
      "-movflags",
      "+faststart",
      saida,
    ]);
  } else {
    if (!cena.licencaAudio)
      throw new Error("cena com audio precisa declarar licencaAudio (origem e permissao de uso)");
    const entradas: string[] = ["-framerate", String(fps), "-i", join(quadros, "q%05d.png")];
    const filtros: string[] = [];
    cena.audio!.forEach((a, k) => {
      entradas.push("-i", a.arquivo);
      filtros.push(
        `[${k + 1}:a]adelay=${Math.round(a.em * 1000)}|${Math.round(a.em * 1000)},volume=${a.ganho ?? 1}[a${k}]`,
      );
    });
    const mistura = `${cena.audio!.map((_, k) => `[a${k}]`).join("")}amix=inputs=${cena.audio!.length}:duration=longest:normalize=0[mix]`;
    ffmpeg([
      "-y",
      ...entradas,
      "-filter_complex",
      `${filtros.join(";")};${mistura}`,
      "-map",
      "0:v",
      "-map",
      "[mix]",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-profile:v",
      "high",
      "-r",
      String(fps),
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-t",
      String(duracao),
      "-movflags",
      "+faststart",
      saida,
    ]);
  }
  const nQuadros = readdirSync(quadros).length;
  // Os quadros sao regeneraveis (a cena e determinista) e pesam dezenas de MB: apaga depois de codificar.
  if (!process.argv.includes("--manter-quadros")) rmSync(quadros, { recursive: true, force: true });
  return { mp4: saida, html: arquivoHtml, quadros: nQuadros, fps, duracao };
}

/** Le com ffprobe o que realmente saiu no arquivo. Nao confiar no que se pediu. */
export function conferirVideo(arquivo: string) {
  const r = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_name,codec_type,width,height,r_frame_rate,pix_fmt,sample_rate,channels",
      "-show_entries",
      "format=duration,size,format_name",
      "-of",
      "json",
      arquivo,
    ],
    { encoding: "utf8" },
  );
  if (r.status !== 0) throw new Error(`ffprobe falhou: ${r.stderr}`);
  return JSON.parse(r.stdout) as {
    streams: {
      codec_name: string;
      codec_type: string;
      width?: number;
      height?: number;
      r_frame_rate?: string;
      pix_fmt?: string;
      sample_rate?: string;
      channels?: number;
    }[];
    format: { duration: string; size: string; format_name: string };
  };
}

/** Extrai quadros representativos para revisao visual (o render sozinho nao prova nada). */
export function quadrosDeRevisao(mp4: string, destino: string, quantos = 5) {
  mkdirSync(destino, { recursive: true });
  const { format } = conferirVideo(mp4);
  const dur = Number(format.duration);
  const saidas: string[] = [];
  for (let i = 0; i < quantos; i++) {
    const t = (dur / (quantos + 1)) * (i + 1);
    const out = join(destino, `frame-${String(i + 1).padStart(2, "0")}.png`);
    ffmpeg(["-y", "-ss", t.toFixed(2), "-i", mp4, "-frames:v", "1", out]);
    saidas.push(out);
  }
  return saidas;
}

if (import.meta.main) {
  const [nome, ...flags] = process.argv.slice(2);
  if (!nome) throw new Error("uso: bun run motion <cena> [--previa]");
  const mod = (await import(`./cenas/${nome}.ts`)) as { cena: Cena };
  const previa = flags.includes("--previa");
  const r = await renderizarCena(mod.cena, { previa });
  const info = conferirVideo(r.mp4);
  const v = info.streams.find((s) => s.codec_type === "video");
  const a = info.streams.find((s) => s.codec_type === "audio");
  console.log(`${r.mp4}
  ${r.quadros} quadros a ${r.fps} fps
  video: ${v?.codec_name} ${v?.width}x${v?.height} ${v?.r_frame_rate} ${v?.pix_fmt}
  audio: ${a ? `${a.codec_name} ${a.sample_rate} Hz ${a.channels} canal(is)` : "nenhum (mudo)"}
  duracao: ${Number(info.format.duration).toFixed(2)} s · ${(Number(info.format.size) / 1048576).toFixed(2)} MB`);
  if (!previa) {
    const fr = quadrosDeRevisao(r.mp4, join(pastaConteudo(mod.cena.id).preview, "frames"));
    console.log(`  quadros de revisao: ${fr.length} em preview/frames/`);
  }
}
