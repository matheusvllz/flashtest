/**
 * Edicao de video gravado (Reels) com ffmpeg.
 *
 *   bun run editar-video analisar <video>
 *       duracao, resolucao, codec e os trechos de silencio detectados
 *
 *   bun run editar-video cortar-silencios <entrada> <saida.mp4> [--limiar -35] [--min 0.45] [--folga 0.12]
 *       remove silencios (pausas, respiros longos) mantendo uma folga antes/depois da fala
 *
 *   bun run editar-video montar <conteudos/<id>/roteiro.json>
 *       monta o Reels na ordem do roteiro: takes com entrada/saida, reenquadramento 9:16,
 *       textos na tela e legendas renderizados na tipografia da marca (PNG por cima),
 *       trilha opcional com licenca registrada. Sai em conteudos/<id>/export/reels.mp4
 *
 * Os textos e legendas NAO usam o drawtext/libass do ffmpeg: as fontes da marca sao woff2
 * e o ffmpeg nao as le. Cada texto vira um PNG transparente renderizado pelo mesmo Chromium
 * dos posts, com as mesmas fontes e cores — e entra por overlay com enable=between(t,a,b).
 *
 * Transcricao: a skill faster-whisper (pasta "edição Videos") exige Python e declara
 * linux/macos/wsl2; nesta maquina nao ha Python. O .srt pode vir do WSL, de outra ferramenta
 * ou ser escrito a mao a partir do roteiro. Este script so CONSOME o .srt.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright-core";
import { acharChromium } from "../lib/chromium.ts";
import { css, lerSnapshot } from "../render/base.ts";
import { conferirVideo } from "./motion.ts";

const REELS = { largura: 1080, altura: 1920, fps: 30 };

function rodar(bin: string, args: string[]) {
  const r = spawnSync(bin, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${bin} falhou:\n${(r.stderr ?? "").slice(-2500)}`);
  return r;
}

// ---------------------------------------------------------------------------
// Silencio
// ---------------------------------------------------------------------------

export function detectarSilencios(arquivo: string, limiarDb = -35, minimo = 0.45) {
  const r = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-i",
      arquivo,
      "-af",
      `silencedetect=noise=${limiarDb}dB:d=${minimo}`,
      "-f",
      "null",
      "-",
    ],
    {
      encoding: "utf8",
    },
  );
  const log = r.stderr ?? "";
  const silencios: { inicio: number; fim: number }[] = [];
  let aberto: number | null = null;
  for (const linha of log.split(/\r?\n/)) {
    const i = /silence_start:\s*(-?[\d.]+)/.exec(linha);
    const f = /silence_end:\s*([\d.]+)/.exec(linha);
    if (i) aberto = Math.max(0, Number(i[1]));
    if (f && aberto !== null) {
      silencios.push({ inicio: aberto, fim: Number(f[1]) });
      aberto = null;
    }
  }
  const dur = Number(conferirVideo(arquivo).format.duration);
  if (aberto !== null) silencios.push({ inicio: aberto, fim: dur });
  return { silencios, duracao: dur };
}

/** Trechos a manter = complemento dos silencios, com folga para nao comer o comeco/fim da fala. */
export function trechosComFala(
  silencios: { inicio: number; fim: number }[],
  duracao: number,
  folga = 0.12,
) {
  const manter: { de: number; ate: number }[] = [];
  let cursor = 0;
  for (const s of silencios) {
    const de = cursor;
    const ate = Math.min(duracao, s.inicio + folga);
    if (ate - de > 0.05) manter.push({ de: Math.max(0, de), ate });
    cursor = Math.max(0, s.fim - folga);
  }
  if (duracao - cursor > 0.05) manter.push({ de: cursor, ate: duracao });
  // junta trechos que se tocam por causa da folga
  const juntos: typeof manter = [];
  for (const t of manter) {
    const u = juntos[juntos.length - 1];
    if (u && t.de <= u.ate) u.ate = Math.max(u.ate, t.ate);
    else juntos.push({ ...t });
  }
  return juntos;
}

function temAudio(arquivo: string) {
  return conferirVideo(arquivo).streams.some((s) => s.codec_type === "audio");
}

/** Filtro de video que leva qualquer entrada para 1080x1920 sem distorcer (recorta o excesso). */
function filtroEnquadrar(modo: "preencher" | "caber" = "preencher") {
  const { largura: L, altura: A, fps } = REELS;
  return modo === "preencher"
    ? `scale=${L}:${A}:force_original_aspect_ratio=increase,crop=${L}:${A},setsar=1,fps=${fps}`
    : `scale=${L}:${A}:force_original_aspect_ratio=decrease,pad=${L}:${A}:(ow-iw)/2:(oh-ih)/2:color=0xF6F5F1,setsar=1,fps=${fps}`;
}

export function cortarSilencios(
  entrada: string,
  saida: string,
  o: { limiar?: number; minimo?: number; folga?: number } = {},
) {
  const { silencios, duracao } = detectarSilencios(entrada, o.limiar ?? -35, o.minimo ?? 0.45);
  const manter = trechosComFala(silencios, duracao, o.folga ?? 0.12);
  if (!manter.length) throw new Error("nenhum trecho com som acima do limiar; ajuste --limiar");
  const audio = temAudio(entrada);
  const partes: string[] = [];
  manter.forEach((t, i) => {
    partes.push(
      `[0:v]trim=start=${t.de.toFixed(3)}:end=${t.ate.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`,
    );
    if (audio)
      partes.push(
        `[0:a]atrim=start=${t.de.toFixed(3)}:end=${t.ate.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, t.ate - t.de - 0.02).toFixed(3)}:d=0.02[a${i}]`,
      );
  });
  const juncao = manter.map((_, i) => (audio ? `[v${i}][a${i}]` : `[v${i}]`)).join("");
  partes.push(
    `${juncao}concat=n=${manter.length}:v=1:a=${audio ? 1 : 0}${audio ? "[vc][ac]" : "[vc]"}`,
  );
  partes.push(`[vc]${filtroEnquadrar()}[vout]`);
  mkdirSync(dirname(saida), { recursive: true });
  rodar("ffmpeg", [
    "-y",
    "-i",
    entrada,
    "-filter_complex",
    partes.join(";"),
    "-map",
    "[vout]",
    ...(audio ? ["-map", "[ac]", "-c:a", "aac", "-b:a", "128k", "-ar", "48000"] : []),
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "19",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    saida,
  ]);
  const depois = Number(conferirVideo(saida).format.duration);
  return { antes: duracao, depois, removido: duracao - depois, trechos: manter, silencios };
}

// ---------------------------------------------------------------------------
// Textos e legendas na tipografia da marca (PNG transparente 1080x1920)
// ---------------------------------------------------------------------------

type Texto = {
  texto: string;
  de: number;
  ate: number;
  posicao?: "topo" | "meio" | "legenda";
  estilo?: "titulo" | "legenda" | "mao";
};

async function renderizarTextos(textos: Texto[], pasta: string) {
  const s = lerSnapshot();
  mkdirSync(pasta, { recursive: true });
  const navegador = await chromium.launch({ executablePath: acharChromium() });
  const pagina = await navegador.newPage({
    viewport: { width: REELS.largura, height: REELS.altura },
    deviceScaleFactor: 1,
  });
  const saidas: string[] = [];
  for (let i = 0; i < textos.length; i++) {
    const t = textos[i];
    // Area segura do Reels: 300 px no topo, 420 px embaixo (interface do Instagram).
    const top = t.posicao === "topo" ? 320 : t.posicao === "meio" ? 820 : 1260;
    const estilo =
      t.estilo === "mao"
        ? `font-family:Caveat;font-weight:600;font-size:84px;color:var(--mar)`
        : t.estilo === "titulo"
          ? `font-family:'Space Grotesk';font-weight:700;font-size:86px;line-height:1.02;letter-spacing:-.02em;color:var(--abismo);background:var(--neve);padding:18px 26px;border-radius:20px;box-shadow:0 6px 0 var(--gelo)`
          : `font-family:'Plus Jakarta Sans';font-weight:700;font-size:54px;line-height:1.22;color:var(--abismo);background:var(--cards);padding:14px 24px;border-radius:16px;box-shadow:0 5px 0 var(--gelo)`;
    const esc = t.texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css(s)}html,body{background:transparent!important}</style></head>
<body><div style="position:absolute;left:80px;right:80px;top:${top}px;display:flex;justify-content:center;text-align:center">
<span style="${estilo};display:inline-block;max-width:920px">${esc}</span></div></body></html>`;
    const arq = join(pasta, `texto-${String(i + 1).padStart(3, "0")}.html`);
    writeFileSync(arq, html);
    await pagina.goto(pathToFileURL(arq).href);
    await pagina.evaluate(() => (document as unknown as { fonts: FontFaceSet }).fonts.ready);
    const png = arq.replace(/\.html$/, ".png");
    await pagina.screenshot({ path: png, omitBackground: true });
    saidas.push(png);
  }
  await navegador.close();
  return saidas;
}

/** Le um .srt simples. */
export function lerSrt(srt: string): Texto[] {
  const hms = (x: string) => {
    const [h, m, r] = x.trim().replace(",", ".").split(":");
    return Number(h) * 3600 + Number(m) * 60 + Number(r);
  };
  return srt
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .map((bloco) => bloco.split("\n").filter(Boolean))
    .filter((l) => l.length >= 3 && l[1].includes("-->"))
    .map((l) => {
      const [a, b] = l[1].split("-->");
      return {
        texto: l.slice(2).join("\n"),
        de: hms(a),
        ate: hms(b),
        posicao: "legenda" as const,
        estilo: "legenda" as const,
      };
    });
}

// ---------------------------------------------------------------------------
// Montagem por roteiro
// ---------------------------------------------------------------------------

export type Roteiro = {
  id: string;
  /** Takes na ordem do roteiro. Caminhos relativos a pasta do roteiro. */
  takes: {
    arquivo: string;
    de?: number;
    ate?: number;
    cortarSilencios?: boolean;
    enquadrar?: "preencher" | "caber";
  }[];
  textos?: Texto[];
  legendas?: string; // .srt ja alinhado ao video MONTADO
  musica?: { arquivo: string; volume?: number; licenca: string };
};

export async function montar(caminhoRoteiro: string) {
  const base = dirname(resolve(caminhoRoteiro));
  const r = JSON.parse(readFileSync(caminhoRoteiro, "utf8")) as Roteiro;
  const tmp = join(base, "tmp");
  const exp = join(base, "export");
  mkdirSync(tmp, { recursive: true });
  mkdirSync(exp, { recursive: true });

  // 1. Normaliza cada take (trecho, silencios, 9:16, 30 fps, AAC 48 kHz)
  const normais: string[] = [];
  for (let i = 0; i < r.takes.length; i++) {
    const t = r.takes[i];
    const orig = resolve(base, t.arquivo);
    if (!existsSync(orig)) throw new Error(`take nao encontrado: ${orig}`);
    let atual = orig;
    if (t.de !== undefined || t.ate !== undefined) {
      const recorte = join(tmp, `take-${i + 1}-trecho.mp4`);
      rodar("ffmpeg", [
        "-y",
        ...(t.de ? ["-ss", String(t.de)] : []),
        ...(t.ate ? ["-to", String(t.ate)] : []),
        "-i",
        orig,
        "-c:v",
        "libx264",
        "-crf",
        "18",
        "-c:a",
        "aac",
        recorte,
      ]);
      atual = recorte;
    }
    if (t.cortarSilencios) {
      const sem = join(tmp, `take-${i + 1}-sem-silencio.mp4`);
      cortarSilencios(atual, sem);
      atual = sem;
    }
    const norm = join(tmp, `take-${i + 1}.mp4`);
    const audio = temAudio(atual);
    rodar("ffmpeg", [
      "-y",
      "-i",
      atual,
      ...(audio ? [] : ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]),
      "-vf",
      filtroEnquadrar(t.enquadrar ?? "preencher"),
      ...(audio ? [] : ["-shortest"]),
      "-c:v",
      "libx264",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-ar",
      "48000",
      "-ac",
      "2",
      norm,
    ]);
    normais.push(norm);
  }

  // 2. Concatena na ordem do roteiro
  const lista = join(tmp, "lista.txt");
  writeFileSync(
    lista,
    normais.map((n) => `file '${n.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"),
  );
  const juntado = join(tmp, "juntado.mp4");
  rodar("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", juntado]);

  // 3. Textos + legendas como PNG por cima
  const textos: Texto[] = [
    ...(r.textos ?? []),
    ...(r.legendas ? lerSrt(readFileSync(resolve(base, r.legendas), "utf8")) : []),
  ];
  const pngs = textos.length ? await renderizarTextos(textos, join(tmp, "textos")) : [];

  // 4. Trilha (so com licenca) e saida final
  const entradas = ["-i", juntado, ...pngs.flatMap((p) => ["-i", p])];
  let filtro = "";
  let ultimo = "0:v";
  pngs.forEach((_, k) => {
    const t = textos[k];
    const saidaK = `v${k + 1}`;
    filtro += `${filtro ? ";" : ""}[${ultimo}][${k + 1}:v]overlay=0:0:enable='between(t,${t.de},${t.ate})'[${saidaK}]`;
    ultimo = saidaK;
  });
  const mapasVideo = pngs.length ? ["-map", `[${ultimo}]`] : ["-map", "0:v"];
  let mapasAudio = ["-map", "0:a"];
  if (r.musica) {
    if (!r.musica.licenca)
      throw new Error("musica sem licenca registrada no roteiro; nao entra no MP4");
    const idx = pngs.length + 1;
    entradas.push("-i", resolve(base, r.musica.arquivo));
    filtro += `${filtro ? ";" : ""}[${idx}:a]volume=${r.musica.volume ?? 0.18}[mus];[0:a][mus]amix=inputs=2:duration=first:normalize=0[aout]`;
    mapasAudio = ["-map", "[aout]"];
  }
  const final = join(exp, "reels.mp4");
  rodar("ffmpeg", [
    "-y",
    ...entradas,
    ...(filtro ? ["-filter_complex", filtro] : []),
    ...mapasVideo,
    ...mapasAudio,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-r",
    String(REELS.fps),
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "48000",
    "-movflags",
    "+faststart",
    final,
  ]);
  return { final, takes: normais.length, textos: pngs.length, info: conferirVideo(final) };
}

// ---------------------------------------------------------------------------

if (import.meta.main) {
  const [cmd, ...args] = process.argv.slice(2);
  const flag = (n: string, d: number) => {
    const i = args.indexOf(`--${n}`);
    return i >= 0 ? Number(args[i + 1]) : d;
  };
  if (cmd === "analisar") {
    const info = conferirVideo(args[0]);
    const { silencios, duracao } = detectarSilencios(
      args[0],
      flag("limiar", -35),
      flag("min", 0.45),
    );
    const v = info.streams.find((s) => s.codec_type === "video");
    console.log(
      `${args[0]}\n  ${v?.codec_name} ${v?.width}x${v?.height} ${v?.r_frame_rate} · ${duracao.toFixed(2)} s`,
    );
    console.log(
      `  ${silencios.length} silencio(s) >= ${flag("min", 0.45)} s abaixo de ${flag("limiar", -35)} dB:`,
    );
    for (const s of silencios)
      console.log(
        `    ${s.inicio.toFixed(2)} → ${s.fim.toFixed(2)}  (${(s.fim - s.inicio).toFixed(2)} s)`,
      );
  } else if (cmd === "cortar-silencios") {
    const r = cortarSilencios(args[0], args[1], {
      limiar: flag("limiar", -35),
      minimo: flag("min", 0.45),
      folga: flag("folga", 0.12),
    });
    console.log(
      `${args[1]}\n  ${r.antes.toFixed(2)} s → ${r.depois.toFixed(2)} s (removidos ${r.removido.toFixed(2)} s em ${r.silencios.length} pausa(s))`,
    );
  } else if (cmd === "montar") {
    const r = await montar(args[0]);
    const v = r.info.streams.find((s) => s.codec_type === "video");
    console.log(
      `${r.final}\n  ${r.takes} take(s), ${r.textos} texto(s)/legenda(s) · ${v?.width}x${v?.height} · ${Number(r.info.format.duration).toFixed(2)} s`,
    );
  } else {
    console.log(
      "comandos: analisar <video> | cortar-silencios <entrada> <saida> [--limiar -35 --min 0.45 --folga 0.12] | montar <roteiro.json>",
    );
  }
}
