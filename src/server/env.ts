/**
 * Variáveis de ambiente do servidor (docs/specs/46-producao T-04.4; lista em
 * docs/operacao/ambientes-e-deploy.md §3). Só o servidor importa este módulo — `src/server/**`
 * é bloqueado no bundle do navegador pelo `importProtection` do `vite.config.ts`.
 *
 * Regras: nada secreto com prefixo `VITE_`; em desenvolvimento e teste há padrões seguros (banco PGlite local,
 * segredo de desenvolvimento, e-mail em caixa de saída local).
 *
 * Num ambiente implantado (build de produção ou Vercel) a leitura **nunca derruba o app** (spec 48 D48-08): valor
 * vazio conta como ausente; variável opcional inválida é ignorada com aviso (só o nome, nunca o valor); variável de
 * conta ausente ou inválida desliga as contas (modo de demonstração, D-15). Em desenvolvimento, inválida é erro.
 */
import { z } from "zod";

/** Caminho de bloco do Ad Manager: `/<rede>/<bloco>`. */
const UNIDADE_GAM = /^\/\d+\/[\w./-]+$/;

const booleano = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");

const esquema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** "production" | "preview" | "development" — a Vercel define VERCEL_ENV. */
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),

  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),

  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET precisa de pelo menos 32 caracteres").optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  /** Origens extras aceitas (separadas por vírgula), ex.: o alias de staging na Vercel. */
  AUTH_TRUSTED_ORIGINS: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  /** Liga o login por e-mail e senha. Desligado em produção até existir domínio para e-mail (D-10). */
  AUTH_EMAIL_HABILITADO: booleano.optional(),
  /**
   * Desliga o rate limit do login (só fora de produção; em produção é ignorado). Usado pelos E2E, em que todos os
   * testes saem do mesmo IP. O rate limit é coberto pelos testes de integração (tests/unit/servidor/auth.test.ts).
   */
  AUTH_RATE_LIMIT_DESLIGADO: booleano.optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(3).optional(),

  MIN_ACCOUNT_AGE: z.coerce.number().int().min(13).max(21).default(17),
  /** Idade a partir da qual a Foca IA dispensa o consentimento do responsável (OpenAI OSA §3.3(c)). */
  TUTOR_IDADE_SEM_CONSENTIMENTO: z.coerce.number().int().min(13).max(21).default(18),

  OPENAI_API_KEY: z.string().min(1).optional(),
  AI_COTA_GRATIS_MENSAGENS: z.coerce.number().int().min(0).max(100).default(3),
  AI_TETO_DIARIO_USD: z.coerce.number().min(0).max(1000).default(1),
  /** Teto diário de quem paga (spec 49 D49-10), separado do Free. As cotas do Basic e do Pro vêm do catálogo (`src/lib/planos.ts`). */
  AI_TETO_DIARIO_PAGOS_USD: z.coerce.number().min(0).max(5000).default(5),
  /**
   * Preço do modelo em US$ por milhão de tokens, para o teto de custo (spec 48 T-48.2.4). Os padrões são
   * **conservadores e provisórios** (acima do esperado para um modelo "mini", para o disjuntor desarmar cedo, nunca
   * tarde); o proprietário confirma na página de preços da OpenAI antes de ligar a chave.
   */
  AI_PRECO_ENTRADA_USD_MTOK: z.coerce.number().min(0).max(1000).default(1),
  AI_PRECO_SAIDA_USD_MTOK: z.coerce.number().min(0).max(1000).default(8),

  /**
   * Venda (spec 49 D49-08, §13): desligada por padrão. Em produção só liga com pedido explícito do proprietário;
   * no preview, com o sandbox do Asaas. Assinaturas que já existem continuam valendo com a venda desligada.
   */
  PAGAMENTOS_HABILITADO: booleano.optional(),
  /** `https://api-sandbox.asaas.com/v3` no teste; `https://api.asaas.com/v3` na produção. */
  ASAAS_API_URL: z.string().url().optional(),
  /** Chave de API do Asaas (segredo; nunca em log nem em `VITE_*`). */
  ASAAS_API_KEY: z.string().min(1).optional(),
  /** Token que o Asaas manda no cabeçalho `asaas-access-token` do webhook (segredo). */
  ASAAS_WEBHOOK_TOKEN: z.string().min(16).optional(),
  /** Vidas do Free (spec 49 D49-03), desligadas por padrão; ligam junto com a venda (E2). */
  VIDAS_HABILITADO: booleano.optional(),
  /** Anúncios do Free (spec 49 D49-02), desligados por padrão; `falso` em desenvolvimento e E2E. */
  ANUNCIOS_HABILITADO: booleano.optional(),
  ANUNCIOS_PROVEDOR: z.enum(["falso", "gam"]).optional(),
  /** Blocos do Google Ad Manager (públicos por natureza; vêm do servidor para não espalhar `VITE_*`). */
  GAM_UNIDADE_RECOMPENSADO: z.string().regex(UNIDADE_GAM).optional(),
  GAM_UNIDADE_RETANGULO: z.string().regex(UNIDADE_GAM).optional(),
  /** Ranking semanal de maiores de 18 (spec 49 D49-06), desligado por padrão (E3). */
  RANKING_HABILITADO: booleano.optional(),
  /**
   * Funções pagas (spec 49 §5.9, RF-12): cada uma pode ser desligada sem deploy, separadas por vírgula
   * (`caderno,cronograma,explica,offline,treino`). Vazio = todas seguem o plano do aluno.
   */
  FUNCOES_DESLIGADAS: z.string().max(200).optional(),
  /**
   * Corretor de redação (spec 49 §5.9). Spec 50 D50-04: liga depois da validação técnica e da leitura do dono
   * (§5.10.5), não mais depois de professor externo obrigatório.
   */
  CORRETOR_HABILITADO: booleano.optional(),
  /** Spec 50: `FUNCOES_DESLIGADAS` também aceita `perolas,missoes,miniSimulado,escrita,retrospectiva,pulo` (ligados por padrão). */
  /** Primeiro dia da retrospectiva do ano (AAAA-MM-DD; spec 50 §5.7.3). Ausente = segundo domingo de novembro. */
  RETROSPECTIVA_INICIO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  /** Ligas 18+ com divisões (spec 50 §5.5); sem ela, o ranking semanal da 49. Precisa de `RANKING_HABILITADO`. */
  LIGAS_HABILITADO: booleano.optional(),
  /** Ofensiva com amigos 18+ (spec 50 §5.6). */
  AMIGOS_HABILITADO: booleano.optional(),
  /** Lembrete diário por push (spec 50 §5.2.5); precisa das chaves VAPID. */
  LEMBRETES_HABILITADO: booleano.optional(),
  VAPID_PUBLIC_KEY: z.string().min(40).max(200).optional(),
  VAPID_PRIVATE_KEY: z.string().min(20).max(200).optional(),
  /** Contato do remetente das notificações (URL do site; nada de e-mail inventado). */
  VAPID_SUBJECT: z.string().url().optional(),

  /** Segredo das rotinas agendadas (Vercel Cron manda `Authorization: Bearer <CRON_SECRET>`). */
  CRON_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof esquema> & {
  producao: boolean;
  teste: boolean;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  AUTH_EMAIL_HABILITADO: boolean;
  /**
   * Contas reais ligadas. Em produção, só com banco, segredo e URL configurados; sem eles o app roda em modo de
   * demonstração (entrada local, progresso só no aparelho, sem sincronização) — decisão D-15, temporária.
   */
  contasAtivas: boolean;
  /** Venda ligada de fato: contas ativas, `PAGAMENTOS_HABILITADO` e as três variáveis do Asaas (spec 49 §13). */
  pagamentosAtivos: boolean;
  /** O que falta em produção para ligar as contas (nomes das variáveis, nunca valores). */
  faltandoParaContas: string[];
  /** Variáveis presentes mas inválidas, ignoradas num ambiente implantado (nomes, nunca valores). */
  variaveisInvalidas: string[];
};

const CONTA = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"] as const;

/** Entrada do esquema: só as chaves dele, com espaços removidos e vazio como ausente. */
function entrada(fonte: NodeJS.ProcessEnv): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const k of Object.keys(esquema.shape)) {
    const v = fonte[k]?.trim();
    out[k] = v ? v : undefined;
  }
  return out;
}

let cache: Env | undefined;

/** Lê e valida o ambiente uma vez por processo. Em teste, `redefinirEnv()` limpa o cache. */
export function env(): Env {
  if (cache) return cache;
  const bruto = entrada(process.env);
  // Implantado = build de produção ou qualquer ambiente da Vercel (inclusive preview): aí não há PGlite em disco nem
  // segredo de desenvolvimento.
  const implantado = bruto.NODE_ENV === "production" || bruto.VERCEL_ENV !== undefined;
  const invalidas: string[] = [];
  let lido = esquema.safeParse(bruto);
  if (!lido.success) {
    if (!implantado) {
      const detalhe = lido.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`[env] variáveis de ambiente inválidas — ${detalhe}`);
    }
    // Implantado: descarta só o que é inválido e segue. Uma variável de conta descartada desliga as contas abaixo.
    const campos = new Set(lido.error.issues.map((i) => String(i.path[0])));
    for (const k of Object.keys(esquema.shape)) {
      if (!campos.has(k)) continue;
      invalidas.push(k);
      bruto[k] = undefined;
    }
    console.warn(`[env] variáveis inválidas ignoradas: ${invalidas.join(", ")}`);
    lido = esquema.safeParse(bruto);
    if (!lido.success) throw new Error("[env] ambiente ilegível"); // inalcançável: todo campo é opcional ou tem padrão
  }
  const e = lido.data;
  // Produção = build de produção fora de preview, ou a Vercel dizendo "production" (mesmo com NODE_ENV inválido e
  // descartado acima — revisão L2: senão rate limit e checagem de origem afrouxariam em silêncio).
  const producao = (e.NODE_ENV === "production" || e.VERCEL_ENV === "production") && e.VERCEL_ENV !== "preview" && e.VERCEL_ENV !== "development";
  const teste = e.NODE_ENV === "test";

  // Sem as três variáveis de conta (ou com alguma inválida), as contas ficam desligadas (modo de demonstração, D-15).
  const faltando: string[] = implantado ? CONTA.filter((k) => !e[k]) : [];
  const contasAtivas = faltando.length === 0;
  if (!contasAtivas) {
    console.warn(`[env] contas desligadas (modo de demonstração): faltam ${faltando.join(", ")}`);
  }

  cache = {
    ...e,
    producao,
    teste,
    contasAtivas,
    pagamentosAtivos: contasAtivas && e.PAGAMENTOS_HABILITADO === true && !!e.ASAAS_API_URL && !!e.ASAAS_API_KEY && !!e.ASAAS_WEBHOOK_TOKEN,
    faltandoParaContas: faltando,
    variaveisInvalidas: invalidas,
    // Desenvolvimento e teste: banco PGlite local (arquivo em .data/, ou memória nos testes). Produção sem banco:
    // nenhum (as contas ficam desligadas e `banco()` recusa).
    DATABASE_URL: e.DATABASE_URL ?? (implantado ? "desligado:" : teste ? "pglite:memoria" : "pglite:.data/pglite"),
    // Segredo fixo só fora de produção (produção exige o seu, acima).
    BETTER_AUTH_SECRET: e.BETTER_AUTH_SECRET ?? "segredo-de-desenvolvimento-nao-usar-em-producao-0000",
    BETTER_AUTH_URL: (e.BETTER_AUTH_URL ?? "http://localhost:8080").replace(/\/+$/, ""),
    // Sem domínio não há e-mail em produção (D-10): desligado por padrão lá, ligado no resto.
    AUTH_EMAIL_HABILITADO: e.AUTH_EMAIL_HABILITADO ?? !producao,
  };
  return cache;
}

/** Só para testes: força reler `process.env`. */
export function redefinirEnv(): void {
  cache = undefined;
}

/**
 * Origens aceitas pela autenticação (spec 48 D48-05): a de `BETTER_AUTH_URL`, a mesma com ou sem `www.` (o domínio
 * é um só; a Vercel redireciona um para o outro) e as de `AUTH_TRUSTED_ORIGINS`. Valor inválido na lista é ignorado.
 */
export function origensConfiaveis(e: Pick<Env, "BETTER_AUTH_URL" | "AUTH_TRUSTED_ORIGINS">): string[] {
  const origens = new Set<string>();
  const base = new URL(e.BETTER_AUTH_URL);
  origens.add(base.origin);
  if (base.protocol === "https:" && base.hostname.split(".").length >= 2) {
    const irma = new URL(base.origin);
    irma.hostname = base.hostname.startsWith("www.") ? base.hostname.slice(4) : `www.${base.hostname}`;
    if (irma.hostname.includes(".")) origens.add(irma.origin);
  }
  for (const o of (e.AUTH_TRUSTED_ORIGINS ?? "").split(",")) {
    try {
      if (o.trim()) origens.add(new URL(o.trim()).origin);
    } catch {
      /* origem malformada: ignorada */
    }
  }
  return [...origens];
}
