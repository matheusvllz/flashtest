/**
 * Lembrete diário por push no servidor (spec 50 §5.2.5, T-50.15.3/15.4; RF-12 com relógio falso). O envio real
 * (`web-push`) é trocado por um falso: nenhuma chamada de rede e nenhuma chave real (as chaves abaixo são texto de
 * enchimento, só para ligar a função).
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { endpointDePushValido } from "../../../src/lib/lembretes/regras";
import { exportarDadosDoAluno } from "../../../src/server/conta/dados";
import { aplicarRetencao } from "../../../src/server/conta/retencao";
import { profile, pushAssinatura, studyDay } from "../../../src/server/db/schema";
import { redefinirEnv } from "../../../src/server/env";
import {
  chavePublica,
  definirEnvioDePush,
  enviarJanela,
  estadoDoLembrete,
  PAUSA_DEPOIS_DE,
  removerAssinatura,
  salvarAssinatura,
  type AssinaturaPush,
} from "../../../src/server/lembretes/push";
import { ambiente, alunoVerificado, type Ambiente } from "./ajuda";

/** 18h em São Paulo (janela "fim-de-tarde", cron 21:00 UTC). */
const AGORA = new Date("2026-10-15T21:00:00Z");
const HOJE = "2026-10-15";
const DIA = 86_400_000;
const P256DH = "B".repeat(87);
const AUTH = "a".repeat(22);
const ep = (n: string) => `https://fcm.googleapis.com/fcm/send/teste-${n}`;
const VARIAVEIS = ["LEMBRETES_HABILITADO", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"] as const;

function ligarVariaveis() {
  process.env.LEMBRETES_HABILITADO = "true";
  process.env.VAPID_PUBLIC_KEY = "P".repeat(87); // enchimento, não é chave
  process.env.VAPID_PRIVATE_KEY = "S".repeat(43); // enchimento, não é chave
}

let amb: Ambiente;
let enviados: { endpoint: string; corpo: string }[];
let resposta: (a: AssinaturaPush) => Promise<void>;

beforeEach(async () => {
  ligarVariaveis();
  amb = await ambiente();
  enviados = [];
  resposta = async () => undefined;
  definirEnvioDePush(async (a, corpo) => {
    enviados.push({ endpoint: a.endpoint, corpo });
    await resposta(a);
  });
});

afterEach(() => {
  definirEnvioDePush(null);
  for (const v of VARIAVEIS) delete process.env[v];
  redefinirEnv();
});

async function aluno(email: string, janela: "manha" | "tarde" | "fim-de-tarde" | "noite" = "fim-de-tarde", endpoint = ep(email)) {
  const { userId } = await alunoVerificado(amb, email);
  await salvarAssinatura(amb.db, userId, { endpoint, p256dh: P256DH, auth: AUTH, janela }, AGORA);
  return { userId, endpoint };
}

const linha = async (endpoint: string) => (await amb.db.select().from(pushAssinatura).where(eq(pushAssinatura.endpoint, endpoint)))[0];
const estudou = (userId: string, dia: string) => amb.db.insert(studyDay).values({ userId, localDate: dia, blocks: 1 });

describe("chaves e variáveis", () => {
  test("sem as chaves VAPID: função desligada, sem erro e sem envio", async () => {
    const { endpoint } = await aluno("sem-chave@foca.dev");
    delete process.env.VAPID_PRIVATE_KEY;
    redefinirEnv();
    expect(chavePublica()).toBeNull();
    const r = await enviarJanela(amb.db, "fim-de-tarde", AGORA);
    expect(r.ligado).toBe(false);
    expect(enviados).toEqual([]);
    expect(await linha(endpoint)).toBeDefined();
  });

  test("sem LEMBRETES_HABILITADO: desligado mesmo com as chaves", async () => {
    await aluno("sem-flag@foca.dev");
    delete process.env.LEMBRETES_HABILITADO;
    redefinirEnv();
    expect(chavePublica()).toBeNull();
    expect((await enviarJanela(amb.db, "fim-de-tarde", AGORA)).ligado).toBe(false);
    expect(enviados).toEqual([]);
  });

  test("com tudo ligado, a chave pública vai para o navegador (a privada nunca)", () => {
    expect(chavePublica()).toBe("P".repeat(87));
  });
});

describe("regras de envio (relógio falso)", () => {
  test("envia 1 lembrete com texto neutro de voz.ts; o segundo envio no mesmo dia não sai", async () => {
    const { endpoint } = await aluno("um-por-dia@foca.dev");
    const r1 = await enviarJanela(amb.db, "fim-de-tarde", AGORA);
    expect(r1.enviados).toBe(1);
    expect(enviados[0].corpo.length).toBeGreaterThan(10);
    expect((await linha(endpoint)).ultimoEnvioDia).toBe(HOJE);
    const r2 = await enviarJanela(amb.db, "fim-de-tarde", new Date(AGORA.getTime() + 30 * 60_000));
    expect(r2.enviados).toBe(0);
    expect(r2.jaEnviados).toBe(1);
    expect(enviados.length).toBe(1);
  });

  test("só a janela pedida: quem escolheu a manhã não recebe no cron do fim de tarde", async () => {
    await aluno("manha@foca.dev", "manha");
    expect((await enviarJanela(amb.db, "fim-de-tarde", AGORA)).candidatas).toBe(0);
    expect(enviados).toEqual([]);
  });

  test("estudou hoje (bloco concluído no fuso do perfil): não envia", async () => {
    const { userId } = await aluno("estudou@foca.dev");
    await estudou(userId, HOJE);
    const r = await enviarJanela(amb.db, "fim-de-tarde", AGORA);
    expect(r.estudaram).toBe(1);
    expect(enviados).toEqual([]);
  });

  test("o dia é o do fuso do perfil: 00:30 UTC ainda é ontem em São Paulo", async () => {
    const { userId } = await aluno("fuso@foca.dev", "noite");
    await estudou(userId, "2026-10-15");
    // 20h30 em São Paulo do dia 15 = 23:30 UTC; o aluno estudou no dia 15 local.
    const r = await enviarJanela(amb.db, "noite", new Date("2026-10-15T23:30:00Z"));
    expect(r.estudaram).toBe(1);
  });

  test("fora das 08h–21h no fuso do aluno: não envia", async () => {
    const { userId } = await aluno("toquio@foca.dev");
    await amb.db.update(profile).set({ timezone: "Asia/Tokyo" }).where(eq(profile.userId, userId));
    const r = await enviarJanela(amb.db, "fim-de-tarde", AGORA); // 06h em Tóquio
    expect(r.foraDoHorario).toBe(1);
    expect(enviados).toEqual([]);
  });

  test(`${PAUSA_DEPOIS_DE} lembretes seguidos sem estudo: pausa e não envia mais até o aluno religar`, async () => {
    const { userId, endpoint } = await aluno("pausa@foca.dev");
    for (let d = 0; d < PAUSA_DEPOIS_DE; d++) await enviarJanela(amb.db, "fim-de-tarde", new Date(AGORA.getTime() + d * DIA));
    expect(enviados.length).toBe(PAUSA_DEPOIS_DE);
    expect((await estadoDoLembrete(amb.db, userId, endpoint)).pausado).toBe(false);

    const oitavo = await enviarJanela(amb.db, "fim-de-tarde", new Date(AGORA.getTime() + PAUSA_DEPOIS_DE * DIA));
    expect(oitavo.pausadas).toBe(1);
    expect(enviados.length).toBe(PAUSA_DEPOIS_DE);
    expect((await estadoDoLembrete(amb.db, userId, endpoint)).pausado).toBe(true);

    const nono = await enviarJanela(amb.db, "fim-de-tarde", new Date(AGORA.getTime() + (PAUSA_DEPOIS_DE + 1) * DIA));
    expect(nono.candidatas).toBe(0);
    expect(enviados.length).toBe(PAUSA_DEPOIS_DE);

    // Religar (salvar de novo) tira a pausa e zera a contagem.
    await salvarAssinatura(amb.db, userId, { endpoint, p256dh: P256DH, auth: AUTH, janela: "fim-de-tarde" }, AGORA);
    expect((await estadoDoLembrete(amb.db, userId, endpoint)).pausado).toBe(false);
    await enviarJanela(amb.db, "fim-de-tarde", new Date(AGORA.getTime() + (PAUSA_DEPOIS_DE + 2) * DIA));
    expect(enviados.length).toBe(PAUSA_DEPOIS_DE + 1);
    expect((await linha(endpoint)).semEstudoSeguidos).toBe(1);
  });

  test("estudar depois de um lembrete recomeça a contagem", async () => {
    const { userId, endpoint } = await aluno("recomeca@foca.dev");
    for (let d = 0; d < 5; d++) await enviarJanela(amb.db, "fim-de-tarde", new Date(AGORA.getTime() + d * DIA));
    expect((await linha(endpoint)).semEstudoSeguidos).toBe(5);
    await estudou(userId, "2026-10-19"); // dia do 5º lembrete, depois dele
    await enviarJanela(amb.db, "fim-de-tarde", new Date(AGORA.getTime() + 5 * DIA));
    expect((await linha(endpoint)).semEstudoSeguidos).toBe(1);
  });

  test("410 do serviço de push apaga a assinatura; 404 também", async () => {
    const a = await aluno("gone@foca.dev");
    const b = await aluno("notfound@foca.dev");
    resposta = async (x) => {
      throw Object.assign(new Error("push"), { statusCode: x.endpoint === a.endpoint ? 410 : 404 });
    };
    const r = await enviarJanela(amb.db, "fim-de-tarde", AGORA);
    expect(r.apagadas).toBe(2);
    expect(await linha(a.endpoint)).toBeUndefined();
    expect(await linha(b.endpoint)).toBeUndefined();
  });

  test("outros erros contam em falhas e, na 5ª seguida, apagam; sucesso zera", async () => {
    const { endpoint } = await aluno("falha@foca.dev");
    resposta = async () => {
      throw Object.assign(new Error("push"), { statusCode: 500 });
    };
    for (let d = 0; d < 4; d++) await enviarJanela(amb.db, "fim-de-tarde", new Date(AGORA.getTime() + d * DIA));
    expect((await linha(endpoint)).falhas).toBe(4);
    expect((await linha(endpoint)).ultimoEnvioDia).toBeNull();
    const r = await enviarJanela(amb.db, "fim-de-tarde", new Date(AGORA.getTime() + 4 * DIA));
    expect(r.apagadas).toBe(1);
    expect(await linha(endpoint)).toBeUndefined();
  });

  test("lotes e concorrência: todas as assinaturas recebem exatamente uma vez", async () => {
    const enderecos: string[] = [];
    for (let i = 0; i < 5; i++) enderecos.push((await aluno(`lote-${i}@foca.dev`)).endpoint);
    const r = await enviarJanela(amb.db, "fim-de-tarde", AGORA, { lote: 2, concorrencia: 2 });
    expect(r.candidatas).toBe(5);
    expect(enviados.map((e) => e.endpoint).sort()).toEqual(enderecos.sort());
  });
});

describe("assinatura e preferência", () => {
  test("endereço de push só dos serviços conhecidos e só HTTPS (sem SSRF)", () => {
    expect(endpointDePushValido("https://fcm.googleapis.com/fcm/send/abc")).toBe(true);
    expect(endpointDePushValido("https://updates.push.services.mozilla.com/wpush/v2/abc")).toBe(true);
    expect(endpointDePushValido("https://web.push.apple.com/abc")).toBe(true);
    expect(endpointDePushValido("https://wns2-bn3p.notify.windows.com/w/?token=abc")).toBe(true);
    expect(endpointDePushValido("http://fcm.googleapis.com/fcm/send/abc")).toBe(false);
    expect(endpointDePushValido("https://169.254.169.254/latest")).toBe(false);
    expect(endpointDePushValido("https://localhost/abc")).toBe(false);
    expect(endpointDePushValido("https://fcm.googleapis.com.evil.com/abc")).toBe(false);
    expect(endpointDePushValido("https://fcm.googleapis.com:8443/abc")).toBe(false);
    expect(endpointDePushValido("https://user:x@fcm.googleapis.com/abc")).toBe(false);
  });

  test("a janela vale para todos os aparelhos do aluno; teto de 10 aparelhos", async () => {
    const { userId } = await alunoVerificado(amb, "aparelhos@foca.dev");
    for (let i = 0; i < 12; i++) {
      await salvarAssinatura(amb.db, userId, { endpoint: ep(`ap-${i}`), p256dh: P256DH, auth: AUTH, janela: "manha" }, new Date(AGORA.getTime() + i * 1000));
    }
    await salvarAssinatura(amb.db, userId, { endpoint: ep("ap-11"), p256dh: P256DH, auth: AUTH, janela: "noite" }, new Date(AGORA.getTime() + 60_000));
    const linhas = await amb.db.select().from(pushAssinatura).where(eq(pushAssinatura.userId, userId));
    expect(linhas.length).toBe(10);
    expect(new Set(linhas.map((l) => l.janela))).toEqual(new Set(["noite"]));
    expect(linhas.some((l) => l.endpoint === ep("ap-0"))).toBe(false);
  });

  test("desligar sem endereço (o aparelho perdeu a assinatura) tira todos os aparelhos do aluno", async () => {
    const { userId } = await aluno("desligar@foca.dev");
    await salvarAssinatura(amb.db, userId, { endpoint: ep("outro"), p256dh: P256DH, auth: AUTH, janela: "fim-de-tarde" }, AGORA);
    await removerAssinatura(amb.db, userId, null);
    expect(await amb.db.select().from(pushAssinatura).where(eq(pushAssinatura.userId, userId))).toEqual([]);
  });

  test("exportação: ligado e janela, nunca o endereço nem as chaves", async () => {
    const { userId, endpoint } = await aluno("exporta@foca.dev");
    const exp = await exportarDadosDoAluno(amb.db, userId, AGORA);
    expect(exp.lembrete).toMatchObject({ ligado: true, janela: "fim-de-tarde", pausado: false });
    const texto = JSON.stringify(exp);
    expect(texto).not.toContain(endpoint);
    expect(texto).not.toContain(P256DH);
    expect(texto).not.toContain(AUTH);
  });

  test("retenção: pausada há mais de 30 dias e com falha sem entrega há 30 dias saem; a de quem estuda todo dia fica", async () => {
    const pausada = await aluno("ret-pausada@foca.dev");
    const falhando = await aluno("ret-falha@foca.dev");
    const estudiosa = await aluno("ret-estuda@foca.dev");
    const antes = new Date(AGORA.getTime() - 31 * DIA);
    await amb.db.update(pushAssinatura).set({ pausadaEm: antes }).where(eq(pushAssinatura.endpoint, pausada.endpoint));
    await amb.db.update(pushAssinatura).set({ falhas: 2, criadaEm: antes }).where(eq(pushAssinatura.endpoint, falhando.endpoint));
    await amb.db.update(pushAssinatura).set({ criadaEm: antes }).where(eq(pushAssinatura.endpoint, estudiosa.endpoint));
    const r = await aplicarRetencao(amb.db, AGORA);
    expect(r.lembretes).toBe(2);
    expect(await linha(pausada.endpoint)).toBeUndefined();
    expect(await linha(falhando.endpoint)).toBeUndefined();
    expect(await linha(estudiosa.endpoint)).toBeDefined();
  });
});

describe("duas contas (isolamento)", () => {
  test("B não vê, não apaga e não muda a assinatura de A", async () => {
    const a = await aluno("lembrete-ana@foca.dev", "manha");
    const b = await aluno("lembrete-bia@foca.dev", "noite");
    // B pergunta pelo endereço de A: não aparece ligado para B, e a janela é a de B.
    expect(await estadoDoLembrete(amb.db, b.userId, a.endpoint)).toMatchObject({ ligado: false, janela: "noite" });
    await removerAssinatura(amb.db, b.userId, a.endpoint);
    expect(await linha(a.endpoint)).toBeDefined();
    await removerAssinatura(amb.db, b.userId, null);
    expect(await linha(a.endpoint)).toBeDefined();
    expect(await linha(b.endpoint)).toBeUndefined();
    await salvarAssinatura(amb.db, b.userId, { endpoint: ep("bia-2"), p256dh: P256DH, auth: AUTH, janela: "tarde" }, AGORA);
    expect((await linha(a.endpoint)).janela).toBe("manha");
    expect((await exportarDadosDoAluno(amb.db, a.userId, AGORA)).lembrete).toMatchObject({ ligado: true, janela: "manha", aparelhos: 1 });
  });

  test("o estudo de B não segura o lembrete de A", async () => {
    const a = await aluno("lembrete-a2@foca.dev");
    const b = await aluno("lembrete-b2@foca.dev");
    await estudou(b.userId, HOJE);
    await enviarJanela(amb.db, "fim-de-tarde", AGORA);
    expect(enviados.map((e) => e.endpoint)).toEqual([a.endpoint]);
  });

  test("mesmo aparelho, outra conta sem sair da primeira: a assinatura passa para quem está no aparelho", async () => {
    const a = await aluno("compartilhado-a@foca.dev", "manha", ep("compartilhado"));
    const { userId: bId } = await alunoVerificado(amb, "compartilhado-b@foca.dev");
    await salvarAssinatura(amb.db, bId, { endpoint: a.endpoint, p256dh: P256DH, auth: AUTH, janela: "noite" }, AGORA);
    expect((await linha(a.endpoint)).userId).toBe(bId);
    expect((await estadoDoLembrete(amb.db, a.userId, a.endpoint)).ligado).toBe(false);
  });
});
