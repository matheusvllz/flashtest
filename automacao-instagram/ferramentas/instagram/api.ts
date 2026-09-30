/**
 * Cliente minimo da API de publicacao de conteudo do Instagram (Instagram Platform).
 * Conferido na documentacao oficial em 29/09/2026:
 *   https://developers.facebook.com/docs/instagram-platform/content-publishing
 *   https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media
 *
 *   POST /<IG_ID>/media               cria container (IMAGE via image_url, REELS via video_url, CAROUSEL via children)
 *   GET  /<CONTAINER_ID>?fields=status_code   EXPIRED | ERROR | FINISHED | IN_PROGRESS | PUBLISHED
 *   POST /<IG_ID>/media_publish       publica (creation_id)
 *   GET  /<IG_ID>/content_publishing_limit    uso na janela de 24 h (limite: 100 posts)
 *
 * Host: graph.instagram.com (Instagram Login) ou graph.facebook.com (Facebook Login). Versao em config.
 * Imagem: so JPEG, ate 8 MB, proporcao 4:5 a 1.91:1. Carrossel: ate 10 itens. Midia por URL publica.
 *
 * Dois clientes com a mesma interface: o REAL (fetch) e o de SIMULACAO (memoria), que imita o
 * ciclo de vida dos containers e aceita falhas injetadas para testar retry e deduplicacao.
 */

export class ErroApi extends Error {
  constructor(
    msg: string,
    public codigo?: number,
    public subcodigo?: number,
    public tipo?:
      | "token-expirado"
      | "permissao"
      | "limite"
      | "midia"
      | "rede"
      | "timeout"
      | "outro",
  ) {
    super(msg);
  }
}

export type StatusContainer = "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";

export interface ClienteInstagram {
  modo: "real" | "simulacao";
  conta(): Promise<{ id: string; username: string }>;
  limite(): Promise<{ usados: number; total: number }>;
  containerImagem(p: {
    image_url: string;
    is_carousel_item?: boolean;
    caption?: string;
    alt_text?: string;
  }): Promise<string>;
  containerCarrossel(p: { children: string[]; caption: string }): Promise<string>;
  containerReels(p: {
    video_url: string;
    caption: string;
    share_to_feed?: boolean;
  }): Promise<string>;
  status(containerId: string): Promise<StatusContainer>;
  publicar(creationId: string): Promise<string>;
  midiaRecente(
    limite?: number,
  ): Promise<{ id: string; caption?: string; timestamp: string; permalink?: string }[]>;
  permalink(mediaId: string): Promise<string | undefined>;
}

// ---------------------------------------------------------------------------
// Cliente real
// ---------------------------------------------------------------------------

export function clienteReal(o: {
  host: string;
  versao: string;
  token: string;
  igUserId: string;
  timeoutMs?: number;
}): ClienteInstagram {
  const base = `https://${o.host}/${o.versao}`;

  async function chamar(
    metodo: "GET" | "POST",
    caminho: string,
    params: Record<string, string> = {},
  ) {
    const corpo = new URLSearchParams({ ...params, access_token: o.token });
    const url = metodo === "GET" ? `${base}${caminho}?${corpo}` : `${base}${caminho}`;
    const ctrl = new AbortController();
    const relogio = setTimeout(() => ctrl.abort(), o.timeoutMs ?? 30_000);
    let resp: Response;
    try {
      resp = await fetch(url, {
        method: metodo,
        body: metodo === "POST" ? corpo : undefined,
        headers:
          metodo === "POST" ? { "content-type": "application/x-www-form-urlencoded" } : undefined,
        signal: ctrl.signal,
      });
    } catch (e) {
      const abortado = (e as Error).name === "AbortError";
      throw new ErroApi(
        abortado ? `timeout em ${metodo} ${caminho}` : `falha de rede: ${(e as Error).message}`,
        undefined,
        undefined,
        abortado ? "timeout" : "rede",
      );
    } finally {
      clearTimeout(relogio);
    }
    const json = (await resp.json().catch(() => ({}))) as {
      error?: { message: string; code?: number; error_subcode?: number; type?: string };
    } & Record<string, unknown>;
    if (!resp.ok || json.error) {
      const e = json.error ?? { message: `HTTP ${resp.status}` };
      const tipo =
        e.code === 190
          ? "token-expirado"
          : e.code === 10 || e.code === 200
            ? "permissao"
            : e.code === 4 || e.code === 9 || e.code === 32
              ? "limite"
              : e.code === 9004 || e.code === 36003
                ? "midia"
                : "outro";
      // Nunca repassar o token na mensagem de erro.
      throw new ErroApi(`${e.message}`.replace(o.token, "***"), e.code, e.error_subcode, tipo);
    }
    return json;
  }

  return {
    modo: "real",
    async conta() {
      // Instagram Login: GET /me?fields=user_id,username (doc "Get started"). Facebook Login: no no IG User.
      if (o.host === "graph.instagram.com") {
        const r = (await chamar("GET", "/me", { fields: "user_id,username" })) as {
          user_id?: string;
          id?: string;
          username: string;
          data?: { user_id: string; username: string }[];
        };
        const d = r.data?.[0] ?? r;
        return { id: String(d.user_id ?? r.id), username: d.username };
      }
      const r = (await chamar("GET", `/${o.igUserId}`, { fields: "id,username" })) as {
        id: string;
        username: string;
      };
      return { id: r.id, username: r.username };
    },
    async limite() {
      const r = (await chamar("GET", `/${o.igUserId}/content_publishing_limit`, {
        fields: "quota_usage,config",
      })) as {
        data?: { quota_usage: number; config?: { quota_total: number } }[];
      };
      const d = r.data?.[0];
      return { usados: d?.quota_usage ?? 0, total: d?.config?.quota_total ?? 100 };
    },
    async containerImagem(p) {
      const params: Record<string, string> = { image_url: p.image_url };
      if (p.is_carousel_item) params.is_carousel_item = "true";
      if (p.caption) params.caption = p.caption;
      if (p.alt_text) params.alt_text = p.alt_text;
      return ((await chamar("POST", `/${o.igUserId}/media`, params)) as { id: string }).id;
    },
    async containerCarrossel(p) {
      return (
        (await chamar("POST", `/${o.igUserId}/media`, {
          media_type: "CAROUSEL",
          children: p.children.join(","),
          caption: p.caption,
        })) as { id: string }
      ).id;
    },
    async containerReels(p) {
      return (
        (await chamar("POST", `/${o.igUserId}/media`, {
          media_type: "REELS",
          video_url: p.video_url,
          caption: p.caption,
          share_to_feed: String(p.share_to_feed ?? true),
        })) as { id: string }
      ).id;
    },
    async status(id) {
      return (
        (await chamar("GET", `/${id}`, { fields: "status_code" })) as {
          status_code: StatusContainer;
        }
      ).status_code;
    },
    async publicar(creationId) {
      return (
        (await chamar("POST", `/${o.igUserId}/media_publish`, { creation_id: creationId })) as {
          id: string;
        }
      ).id;
    },
    async midiaRecente(limite = 10) {
      const r = (await chamar("GET", `/${o.igUserId}/media`, {
        fields: "id,caption,timestamp,permalink",
        limit: String(limite),
      })) as {
        data: { id: string; caption?: string; timestamp: string; permalink?: string }[];
      };
      return r.data ?? [];
    },
    async permalink(mediaId) {
      return (
        (await chamar("GET", `/${mediaId}`, { fields: "permalink" })) as { permalink?: string }
      ).permalink;
    },
  };
}

/**
 * Renova um token de longa duracao do Instagram Login por mais 60 dias.
 * GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=...
 * Condicoes (doc oficial): token com 24 h ou mais, ainda valido, com instagram_business_basic.
 */
export async function renovarToken(token: string) {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`;
  const r = await fetch(url);
  const j = (await r.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: { message: string; code?: number };
  };
  if (!r.ok || !j.access_token) {
    const e = j.error ?? { message: `HTTP ${r.status}` };
    throw new ErroApi(
      e.message.replace(token, "***"),
      e.code,
      undefined,
      e.code === 190 ? "token-expirado" : "outro",
    );
  }
  return { token: j.access_token, expiraEmDias: Math.round((j.expires_in ?? 0) / 86400) };
}

// ---------------------------------------------------------------------------
// Cliente de simulacao
// ---------------------------------------------------------------------------

export type Falha =
  | "criar"
  | "status-erro"
  | "publicar-timeout-apos-publicar"
  | "publicar-erro"
  | "token-expirado";

export function clienteSimulado(
  o: { username?: string; falhas?: Falha[]; estadoCompartilhado?: EstadoSimulado } = {},
): ClienteInstagram {
  const st = o.estadoCompartilhado ?? novoEstadoSimulado();
  const falhas = new Set(o.falhas ?? []);
  const seq = () => String(++st.contador).padStart(6, "0");
  return {
    modo: "simulacao",
    async conta() {
      if (falhas.has("token-expirado"))
        throw new ErroApi(
          "Error validating access token: Session has expired",
          190,
          463,
          "token-expirado",
        );
      return { id: "17840000000000000", username: o.username ?? "foca.simulacao" };
    },
    async limite() {
      return { usados: st.publicados.length, total: 100 };
    },
    async containerImagem(p) {
      if (falhas.has("criar"))
        throw new ErroApi(
          "Media download has failed. The media URI doesn't meet our requirements.",
          9004,
          2207052,
          "midia",
        );
      if (!/^https:\/\//.test(p.image_url))
        throw new ErroApi("image_url precisa ser HTTPS publica", 100, undefined, "midia");
      const id = `c${seq()}`;
      st.containers.set(id, { status: "FINISHED", caption: p.caption });
      return id;
    },
    async containerCarrossel(p) {
      if (p.children.length < 2 || p.children.length > 10)
        throw new ErroApi("carrossel aceita de 2 a 10 itens", 100, undefined, "midia");
      for (const c of p.children)
        if (st.containers.get(c)?.status !== "FINISHED")
          throw new ErroApi(`item ${c} nao esta FINISHED`, 100, undefined, "midia");
      const id = `c${seq()}`;
      st.containers.set(id, {
        status: falhas.has("status-erro") ? "ERROR" : "IN_PROGRESS",
        caption: p.caption,
        filhos: p.children,
        consultas: 0,
      });
      return id;
    },
    async containerReels(p) {
      const id = `c${seq()}`;
      st.containers.set(id, { status: "IN_PROGRESS", caption: p.caption, consultas: 0 });
      return id;
    },
    async status(id) {
      const c = st.containers.get(id);
      if (!c) throw new ErroApi("container inexistente", 100, undefined, "outro");
      if (c.status === "IN_PROGRESS" && (c.consultas = (c.consultas ?? 0) + 1) >= 2)
        c.status = "FINISHED";
      return c.status;
    },
    async publicar(creationId) {
      const c = st.containers.get(creationId);
      if (!c || c.status !== "FINISHED")
        throw new ErroApi(
          `container ${creationId} nao esta pronto (${c?.status})`,
          9007,
          2207027,
          "midia",
        );
      if (falhas.has("publicar-erro"))
        throw new ErroApi("Erro interno ao publicar", 1, undefined, "outro");
      const mediaId = `m${seq()}`;
      c.status = "PUBLISHED";
      st.publicados.push({
        id: mediaId,
        caption: c.caption,
        timestamp: new Date().toISOString(),
        permalink: `https://www.instagram.com/p/SIMULADO${mediaId}/`,
      });
      // Simula o pior caso: a Meta publicou, mas a resposta nao chegou.
      if (falhas.has("publicar-timeout-apos-publicar")) {
        falhas.delete("publicar-timeout-apos-publicar");
        throw new ErroApi("timeout em POST /media_publish", undefined, undefined, "timeout");
      }
      return mediaId;
    },
    async midiaRecente(limite = 10) {
      return [...st.publicados].reverse().slice(0, limite);
    },
    async permalink(mediaId) {
      return st.publicados.find((p) => p.id === mediaId)?.permalink;
    },
  };
}

export type EstadoSimulado = {
  contador: number;
  containers: Map<
    string,
    { status: StatusContainer; caption?: string; filhos?: string[]; consultas?: number }
  >;
  publicados: { id: string; caption?: string; timestamp: string; permalink?: string }[];
};
export function novoEstadoSimulado(): EstadoSimulado {
  return { contador: 0, containers: new Map(), publicados: [] };
}
