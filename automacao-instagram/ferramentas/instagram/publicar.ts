/**
 * Publicador. O MESMO codigo serve a publicacao manual e o agendador.
 *
 *   bun run publicar <id>                          SIMULACAO (padrao): percorre o fluxo inteiro sem rede
 *   bun run publicar <id> --real                   publica de verdade (exige .env e adaptador de midia)
 *   bun run publicar <id> --simular-falha <tipo>   simulacao com falha injetada (criar | status-erro |
 *                                                  publicar-timeout-apos-publicar | publicar-erro | token-expirado)
 *   bun run publicar --conta                       confere a conta (mostra o IG_USER_ID) e o limite (real)
 *   bun run publicar --renovar-token               renova o token de longa duracao por mais 60 dias
 *
 * Garantias:
 *  - so publica conteudo em estado pronto, agendado ou falhou; nunca ideia/em_producao/em_revisao
 *  - valida (dimensao, JPEG, ordem, emendas, copy) antes; com erro, nao publica
 *  - confere a conta de destino (IG_USERNAME) antes de qualquer POST
 *  - chave de idempotencia por id+versao+hash dos arquivos; conteudo ja publicado nao publica de novo
 *  - registra a tentativa ANTES do media_publish; se a resposta nao voltar (timeout), confere o
 *    status do container e a midia recente da conta antes de qualquer repeticao
 *  - trava de arquivo: duas execucoes simultaneas nao publicam o mesmo conteudo
 *  - em simulacao, o estado do conteudo NAO muda: fica so o registro "simulado"
 */
import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { carregarEnv, lerConfig } from "../lib/config.ts";
import { P, pastaConteudo } from "../lib/paths.ts";
import { mudarEstado, obter, salvar, type Registro } from "../historico/db.ts";
import { validar } from "../validar/validar.ts";
import {
  ErroApi,
  clienteReal,
  clienteSimulado,
  renovarToken,
  type ClienteInstagram,
  type Falha,
} from "./api.ts";
import { disponibilizar, type Adaptador } from "./armazenamento.ts";

type Tentativa = NonNullable<Registro["publicacao"]>["tentativas"][number];

export type Resultado =
  | {
      status: "publicado";
      mediaId: string;
      permalink?: string;
      via: "publicacao" | "conferencia-apos-timeout";
    }
  | { status: "ja-publicado"; mediaId?: string }
  | { status: "simulado"; mediaId: string; passos: string[] }
  | { status: "incerto"; creationId: string; mensagem: string };

const dormirPadrao = (ms: number) => new Promise((r) => setTimeout(r, ms));

function log(evento: Record<string, unknown>) {
  mkdirSync(P.logs, { recursive: true });
  appendFileSync(
    join(P.logs, "publicacoes.jsonl"),
    JSON.stringify({ em: new Date().toISOString(), ...evento }) + "\n",
  );
}

function hashArquivos(arquivos: string[]) {
  const h = createHash("sha256");
  for (const a of arquivos) h.update(readFileSync(a));
  return h.digest("hex").slice(0, 16);
}

/** Arquivos de publicacao, na ordem explicita (ordem.json para imagens; o MP4 para video). */
export function arquivosDePublicacao(id: string) {
  const pasta = pastaConteudo(id);
  const c = JSON.parse(readFileSync(pasta.conteudo, "utf8")) as {
    formato: string;
    legenda: string;
    video?: { arquivo: string };
    altTexts?: string[];
  };
  if (c.formato === "motion" || c.formato === "reels") {
    return {
      formato: "reels" as const,
      arquivos: [join(pasta.base, c.video!.arquivo)],
      legenda: c.legenda,
      alt: [] as string[],
    };
  }
  const ordem = JSON.parse(readFileSync(join(pasta.export, "ordem.json"), "utf8")) as {
    paginas: { pagina: number; jpg?: string }[];
  };
  const pags = [...ordem.paginas].sort((a, b) => a.pagina - b.pagina);
  if (pags.some((p) => !p.jpg))
    throw new Error("faltam os JPEG de publicacao; renderize sem --so-png");
  return {
    formato: pags.length > 1 ? ("carrossel" as const) : ("imagem" as const),
    arquivos: pags.map((p) => p.jpg!),
    legenda: c.legenda,
    alt: c.altTexts ?? [],
  };
}

function travar(id: string) {
  mkdirSync(P.logs, { recursive: true });
  const trava = join(P.logs, `publicar-${id}.lock`);
  if (existsSync(trava)) {
    const idade = Date.now() - Number(readFileSync(trava, "utf8"));
    if (idade < 15 * 60_000)
      throw new Error(
        `outra publicacao de ${id} esta em andamento (trava de ${Math.round(idade / 1000)} s). Se nao estiver, apague ${trava}`,
      );
  }
  writeFileSync(trava, String(Date.now()));
  return () => rmSync(trava, { force: true });
}

async function esperarPronto(
  cliente: ClienteInstagram,
  container: string,
  dormir: (ms: number) => Promise<unknown>,
  maxTentativas = 60,
  intervaloMs = 5000,
) {
  for (let i = 0; i < maxTentativas; i++) {
    const s = await cliente.status(container);
    if (s === "FINISHED" || s === "PUBLISHED") return s;
    if (s === "ERROR" || s === "EXPIRED")
      throw new ErroApi(`container ${container} ficou ${s}`, undefined, undefined, "midia");
    await dormir(intervaloMs);
  }
  throw new ErroApi(
    `container ${container} nao terminou de processar`,
    undefined,
    undefined,
    "timeout",
  );
}

/** Procura na conta uma midia com a mesma legenda publicada depois de `desde`. */
async function procurarPublicada(cliente: ClienteInstagram, legenda: string, desde: string) {
  const recentes = await cliente.midiaRecente(15);
  const alvo = legenda.trim();
  return recentes.find(
    (m) => (m.caption ?? "").trim() === alvo && m.timestamp >= desde.slice(0, 19),
  );
}

function registrarTentativa(
  id: string,
  t: Tentativa,
  extra: Partial<NonNullable<Registro["publicacao"]>> = {},
) {
  const r = obter(id)!;
  r.publicacao = {
    ...(r.publicacao ?? { tentativas: [] }),
    ...extra,
    tentativas: [...(r.publicacao?.tentativas ?? []), t],
  };
  salvar(r);
}

export async function publicarConteudo(
  id: string,
  o: {
    cliente: ClienteInstagram;
    adaptador: Adaptador;
    usuarioEsperado?: string;
    /** IG_USER_ID: o token tem que pertencer a esta conta. */
    idEsperado?: string;
    dormir?: (ms: number) => Promise<unknown>;
    /** Em simulacao, false: o estado do conteudo nao muda. Nos testes (banco descartavel), true. */
    persistirEstado?: boolean;
    pularValidacao?: boolean;
  },
): Promise<Resultado> {
  const dormir = o.dormir ?? dormirPadrao;
  const persistir = o.persistirEstado ?? o.cliente.modo === "real";
  const passos: string[] = [];
  const reg = obter(id);
  if (!reg) throw new Error(`${id} nao esta no historico. Rode: bun run hist registrar ${id}`);

  if (reg.estado === "publicado")
    return { status: "ja-publicado", mediaId: reg.publicacao?.mediaId };
  if (!["pronto", "agendado", "falhou"].includes(reg.estado))
    throw new Error(
      `${id} esta em "${reg.estado}". So pronto, agendado ou falhou autorizam publicar.`,
    );

  if (!o.pularValidacao) {
    const v = await validar(id);
    if (v.erros)
      throw new Error(`validacao com ${v.erros} erro(s); veja conteudos/${id}/validacao.json`);
    passos.push("validacao ok");
  }

  const { formato, arquivos, legenda, alt } = arquivosDePublicacao(id);
  const chave = `${id}@v${reg.versao}#${hashArquivos(arquivos)}`;
  const soltar = travar(id);
  try {
    // 1. Tentativa anterior ficou incerta? Confere ANTES de repetir qualquer POST.
    // Vale a ULTIMA tentativa desta mesma chave e modo: se ela ficou pendurada, confere.
    const ultima = [...(reg.publicacao?.tentativas ?? [])]
      .reverse()
      .find((t) => t.chave === chave && t.modo === o.cliente.modo);
    const incerta =
      ultima && (ultima.resultado === "incerto" || ultima.resultado === "em-andamento")
        ? ultima
        : undefined;
    if (incerta) {
      const statusC = incerta.creationId
        ? await o.cliente.status(incerta.creationId).catch(() => null)
        : null;
      const achada = await procurarPublicada(o.cliente, legenda, incerta.em);
      if (statusC === "PUBLISHED" || achada) {
        const mediaId = achada?.id ?? "desconhecido";
        const permalink =
          achada?.permalink ?? (achada ? await o.cliente.permalink(achada.id) : undefined);
        registrarTentativa(
          id,
          {
            em: new Date().toISOString(),
            resultado: "ok",
            chave,
            modo: o.cliente.modo,
            mediaId,
            creationId: incerta.creationId,
          },
          { mediaId, permalink, idempotencia: chave },
        );
        if (persistir) mudarEstado(id, "publicado");
        log({ id, evento: "conferido-apos-incerteza", mediaId, modo: o.cliente.modo });
        return { status: "publicado", mediaId, permalink, via: "conferencia-apos-timeout" };
      }
      passos.push("tentativa anterior incerta conferida: nao publicou; seguindo");
    }

    // 2. Conta de destino
    const conta = await o.cliente.conta();
    if (
      o.usuarioEsperado &&
      conta.username.toLowerCase() !== o.usuarioEsperado.replace(/^@/, "").toLowerCase()
    )
      throw new Error(
        `conta conectada e @${conta.username}, mas IG_USERNAME pede @${o.usuarioEsperado}. Nada foi publicado.`,
      );
    if (o.idEsperado && conta.id !== o.idEsperado)
      throw new Error(
        `o token pertence a conta ${conta.id}, mas IG_USER_ID e ${o.idEsperado}. Nada foi publicado.`,
      );
    passos.push(`conta @${conta.username}`);
    const lim = await o.cliente.limite();
    if (lim.usados >= lim.total)
      throw new ErroApi(
        `limite de publicacao atingido (${lim.usados}/${lim.total} em 24 h)`,
        4,
        undefined,
        "limite",
      );
    passos.push(`limite ${lim.usados}/${lim.total}`);

    // 3. Midia em URL publica, na ordem
    const urls = await disponibilizar(id, arquivos, o.adaptador);
    passos.push(`${urls.length} arquivo(s) disponivel(is) por URL`);

    // 4. Containers
    let creationId: string;
    const filhos: string[] = [];
    if (formato === "carrossel") {
      for (let i = 0; i < urls.length; i++) {
        const c = await o.cliente.containerImagem({
          image_url: urls[i],
          is_carousel_item: true,
          alt_text: alt[i],
        });
        await esperarPronto(o.cliente, c, dormir, 60, 2000);
        filhos.push(c);
      }
      passos.push(`${filhos.length} itens de carrossel prontos, na ordem`);
      creationId = await o.cliente.containerCarrossel({ children: filhos, caption: legenda });
    } else if (formato === "imagem") {
      creationId = await o.cliente.containerImagem({
        image_url: urls[0],
        caption: legenda,
        alt_text: alt[0],
      });
    } else {
      creationId = await o.cliente.containerReels({
        video_url: urls[0],
        caption: legenda,
        share_to_feed: true,
      });
    }
    await esperarPronto(o.cliente, creationId, dormir, formato === "reels" ? 120 : 60, 5000);
    passos.push(`container ${creationId} FINISHED`);

    // 5. Registra ANTES de publicar: se o processo morrer aqui, a proxima execucao confere primeiro.
    const inicio = new Date().toISOString();
    registrarTentativa(id, {
      em: inicio,
      resultado: "em-andamento",
      chave,
      modo: o.cliente.modo,
      creationId,
      containerIds: filhos,
    });

    try {
      const mediaId = await o.cliente.publicar(creationId);
      const permalink = await o.cliente.permalink(mediaId).catch(() => undefined);
      if (o.cliente.modo === "simulacao" && !persistir) {
        registrarTentativa(id, {
          em: new Date().toISOString(),
          resultado: "simulado",
          chave,
          modo: "simulacao",
          mediaId,
          creationId,
          containerIds: filhos,
        });
        log({ id, evento: "simulado", mediaId, passos });
        return {
          status: "simulado",
          mediaId,
          passos: [...passos, `publicado (simulado) ${mediaId}`],
        };
      }
      registrarTentativa(
        id,
        {
          em: new Date().toISOString(),
          resultado: "ok",
          chave,
          modo: o.cliente.modo,
          mediaId,
          creationId,
          containerIds: filhos,
        },
        { mediaId, permalink, idempotencia: chave },
      );
      if (persistir) mudarEstado(id, "publicado");
      log({ id, evento: "publicado", mediaId, permalink, modo: o.cliente.modo });
      return { status: "publicado", mediaId, permalink, via: "publicacao" };
    } catch (e) {
      const err = e as ErroApi;
      if (err.tipo === "timeout" || err.tipo === "rede") {
        // A resposta nao voltou. Pode ter publicado. Confere antes de qualquer outra coisa.
        await dormir(3000);
        const s = await o.cliente.status(creationId).catch(() => null);
        const achada = await procurarPublicada(o.cliente, legenda, inicio).catch(() => undefined);
        if (s === "PUBLISHED" || achada) {
          const mediaId = achada?.id ?? "desconhecido";
          const permalink = achada?.permalink;
          registrarTentativa(
            id,
            {
              em: new Date().toISOString(),
              resultado: "ok",
              chave,
              modo: o.cliente.modo,
              mediaId,
              creationId,
            },
            { mediaId, permalink, idempotencia: chave },
          );
          if (persistir) mudarEstado(id, "publicado");
          log({ id, evento: "publicado-confirmado-apos-timeout", mediaId, modo: o.cliente.modo });
          return { status: "publicado", mediaId, permalink, via: "conferencia-apos-timeout" };
        }
        registrarTentativa(id, {
          em: new Date().toISOString(),
          resultado: "incerto",
          chave,
          modo: o.cliente.modo,
          creationId,
          erro: err.message,
        });
        log({ id, evento: "incerto", creationId, erro: err.message });
        return {
          status: "incerto",
          creationId,
          mensagem:
            "A resposta nao voltou e a conferencia nao encontrou o post. Rode de novo: a proxima execucao confere de novo antes de repetir.",
        };
      }
      throw err;
    }
  } catch (e) {
    const err = e as ErroApi;
    registrarTentativa(id, {
      em: new Date().toISOString(),
      resultado: "erro",
      chave,
      modo: o.cliente.modo,
      erro: err.message,
    });
    if (persistir) mudarEstado(id, "falhou");
    log({ id, evento: "erro", tipo: err.tipo, erro: err.message, modo: o.cliente.modo });
    if (err.tipo === "token-expirado")
      throw new Error(
        `O token do Instagram expirou ou foi revogado. Gere um novo (README → "Conectar o Instagram") e atualize IG_ACCESS_TOKEN no .env. Nada foi publicado.`,
      );
    throw err;
  } finally {
    soltar();
  }
}

export function montarCliente(
  real: boolean,
  falhas: Falha[] = [],
  exigirId = true,
): ClienteInstagram {
  const cfg = lerConfig();
  if (!real) return clienteSimulado({ falhas, username: process.env.IG_USERNAME || undefined });
  carregarEnv();
  const token = process.env.IG_ACCESS_TOKEN;
  const igUserId = process.env.IG_USER_ID ?? "";
  if (!token || (exigirId && !igUserId))
    throw new Error(
      "publicacao real precisa de IG_ACCESS_TOKEN e IG_USER_ID no .env (veja .env.example)",
    );
  return clienteReal({ host: cfg.instagram.host, versao: cfg.instagram.versao, token, igUserId });
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const real = args.includes("--real");
  carregarEnv();
  if (args[0] === "--conta") {
    // Funciona sem IG_USER_ID no Instagram Login: e assim que se descobre o ID para o .env.
    const c = montarCliente(true, [], false);
    const conta = await c.conta();
    console.log(`conta @${conta.username} · IG_USER_ID=${conta.id}`);
    if (process.env.IG_USER_ID) {
      const lim = await c.limite();
      console.log(`limite de publicacao: ${lim.usados}/${lim.total} nas ultimas 24 h`);
    } else console.log("Copie o IG_USER_ID acima para o .env.");
    process.exit(0);
  }
  if (args[0] === "--renovar-token") {
    const atual = process.env.IG_ACCESS_TOKEN;
    if (!atual) throw new Error("sem IG_ACCESS_TOKEN no .env");
    const r = await renovarToken(atual);
    const envArq = join(P.raiz, ".env");
    const txt = readFileSync(envArq, "utf8");
    writeFileSync(envArq, txt.replace(/^IG_ACCESS_TOKEN=.*$/m, `IG_ACCESS_TOKEN=${r.token}`));
    console.log(
      `token renovado e gravado no .env (valido por ~${r.expiraEmDias} dias). O valor nao e exibido.`,
    );
    process.exit(0);
  }
  const id = args[0];
  if (!id) throw new Error("uso: bun run publicar <id> [--real] [--simular-falha <tipo>]");
  const i = args.indexOf("--simular-falha");
  const falhas = i >= 0 ? [args[i + 1] as Falha] : [];
  const cfg = lerConfig();
  const cliente = montarCliente(real, falhas);
  if (real && !process.env.IG_USERNAME)
    throw new Error(
      "defina IG_USERNAME no .env: a publicacao real confere a conta de destino antes de publicar",
    );
  const r = await publicarConteudo(id, {
    cliente,
    adaptador: real ? cfg.midia.adaptador : "simulacao",
    usuarioEsperado: process.env.IG_USERNAME || undefined,
    idEsperado: real ? process.env.IG_USER_ID : undefined,
    dormir: real ? undefined : () => Promise.resolve(),
  });
  console.log(`[${cliente.modo}] ${JSON.stringify(r, null, 2)}`);
  if (!real) console.log("\nSIMULACAO: nada saiu desta maquina e o estado do conteudo nao mudou.");
}
