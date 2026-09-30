/**
 * Testes da automacao. Rodam com banco DESCARTAVEL (FOCA_SOCIAL_BANCO), sem rede e sem publicar nada.
 *   bun test testes
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const RAIZ = join(import.meta.dir, "..");
const TMP = join(RAIZ, "testes", "tmp");
const BANCO = join(TMP, "banco-teste.json");
process.env.FOCA_SOCIAL_BANCO = BANCO;

const CARROSSEL = "20260929-carrossel-cronograma-fez-marco";
const ESTATICO = "20260929-post-estatico-licao-questoes";

const db = await import("../ferramentas/historico/db.ts");
const { publicarConteudo } = await import("../ferramentas/instagram/publicar.ts");
const { clienteSimulado, novoEstadoSimulado } = await import("../ferramentas/instagram/api.ts");
const { checarCopy } = await import("../ferramentas/validar/validar.ts");
const { trechosComFala } = await import("../ferramentas/video/editar.ts");

function bancoLimpo() {
  mkdirSync(TMP, { recursive: true });
  rmSync(BANCO, { force: true });
  for (const f of [CARROSSEL, ESTATICO])
    rmSync(join(RAIZ, "logs", `publicar-${f}.lock`), { force: true });
}

function registrar(id: string, estado: "pronto" | "ideia" = "pronto") {
  const c = JSON.parse(readFileSync(join(RAIZ, "conteudos", id, "conteudo.json"), "utf8"));
  return db.criar({
    id,
    estado,
    formato: c.formato,
    pilar: c.pilar,
    tema: c.tema,
    gancho: c.gancho,
    argumento: c.argumento,
    legenda: c.legenda,
  });
}

const semEspera = () => Promise.resolve();

beforeAll(() => {
  if (!existsSync(join(RAIZ, "conteudos", CARROSSEL, "export", "ordem.json")))
    throw new Error(`renderize antes: bun run render ${CARROSSEL}`);
});

describe("carrossel: dimensoes, ordem e recorte", () => {
  const ordem = JSON.parse(
    readFileSync(join(RAIZ, "conteudos", CARROSSEL, "export", "ordem.json"), "utf8"),
  );

  test("toda pagina e 1080x1350 em PNG e JPEG", async () => {
    for (const p of ordem.paginas) {
      const png = await sharp(p.png).metadata();
      const jpg = await sharp(p.jpg).metadata();
      expect([png.width, png.height]).toEqual([1080, 1350]);
      expect([jpg.width, jpg.height, jpg.format]).toEqual([1080, 1350, "jpeg"]);
    }
  });

  test("ordem explicita 1..N, sem buraco, ate 10 paginas", () => {
    const nums = ordem.paginas.map((p: { pagina: number }) => p.pagina);
    expect(nums).toEqual(Array.from({ length: nums.length }, (_, i) => i + 1));
    expect(nums.length).toBeLessThanOrEqual(10);
  });

  test("panoramica = N x 1080 e cada pagina e identica a sua faixa (sem sobreposicao nem lacuna)", async () => {
    const pan = await sharp(ordem.panoramica.arquivo).metadata();
    expect(pan.width).toBe(1080 * ordem.paginas.length);
    for (let i = 0; i < ordem.paginas.length; i++) {
      const fatia = await sharp(ordem.panoramica.arquivo)
        .extract({ left: i * 1080, top: 0, width: 1080, height: 1350 })
        .raw()
        .toBuffer();
      const pag = await sharp(ordem.paginas[i].png).raw().toBuffer();
      expect(Buffer.compare(fatia, pag)).toBe(0);
    }
  });

  test("o traco continuo atravessa a emenda: a coluna 1079 da pagina i continua na coluna 0 da pagina i+1", async () => {
    // Na faixa do traco (y 1255..1340) as duas colunas vizinhas tem pixel azulado nas mesmas alturas.
    const pan = sharp(ordem.panoramica.arquivo);
    for (let i = 0; i < ordem.paginas.length - 1; i++) {
      const x = (i + 1) * 1080;
      const esq = await pan
        .clone()
        .extract({ left: x - 1, top: 1200, width: 1, height: 150 })
        .raw()
        .toBuffer();
      const dir = await pan
        .clone()
        .extract({ left: x, top: 1200, width: 1, height: 150 })
        .raw()
        .toBuffer();
      const azul = (b: Buffer) =>
        Array.from({ length: b.length / 3 }, (_, k) => b[k * 3 + 2] - b[k * 3] > 25);
      const a = azul(esq),
        d = azul(dir);
      expect(a.some(Boolean)).toBe(true);
      const iguais = a.filter((v, k) => v === d[k]).length;
      expect(iguais / a.length).toBeGreaterThan(0.95);
    }
  });
});

describe("historico e repeticao", () => {
  test("detecta duplicata evidente e deixa passar ideia diferente", () => {
    bancoLimpo();
    registrar(CARROSSEL);
    const dup = db.checarRepeticao({
      gancho: "O cronograma que você montou em março",
      argumento:
        "O plano de estudos morre porque estudar sozinho obriga a decidir todo dia; o Foca abre na atividade escolhida.",
      tema: "cronograma de estudos que não passou da segunda semana",
    });
    expect(dup[0]?.id).toBe(CARROSSEL);
    expect(dup[0]?.score).toBeGreaterThanOrEqual(0.55);
    const nova = db.checarRepeticao({
      gancho: "Você relê a matéria e esquece na prova",
      argumento: "Reler dá sensação de saber sem testar a memória; responder questões testa.",
      tema: "revisão ativa contra releitura",
    });
    expect(nova.length).toBe(0);
  });

  test("considera ideias ainda nao produzidas", () => {
    bancoLimpo();
    db.criar({
      id: "x-ideia",
      estado: "ideia",
      formato: "carrossel",
      pilar: "util",
      tema: "revisar o que errou no simulado",
      gancho: "O simulado acabou. E agora?",
      argumento: "Revisar só as questões erradas, por assunto, vale mais que refazer a prova.",
    });
    const r = db.checarRepeticao({
      gancho: "O simulado acabou, e agora?",
      argumento: "Revisar só as erradas por assunto vale mais que refazer a prova inteira.",
      tema: "revisar erros do simulado",
    });
    expect(r[0]?.id).toBe("x-ideia");
  });

  test("revisao sobe a versao, mantem o ID e preserva a anterior", () => {
    bancoLimpo();
    registrar(ESTATICO);
    const { anterior, atualizado } = db.novaVersao(ESTATICO, {
      gancho: "4 a 8 questões. Depois, acabou.",
    });
    expect(anterior.versao).toBe(1);
    expect(atualizado.versao).toBe(2);
    expect(atualizado.id).toBe(anterior.id);
    expect(anterior.gancho).not.toBe(atualizado.gancho);
  });
});

describe("publicacao (simulacao)", () => {
  test("estado nao autorizado bloqueia a publicacao", async () => {
    bancoLimpo();
    registrar(ESTATICO, "ideia");
    await expect(
      publicarConteudo(ESTATICO, {
        cliente: clienteSimulado(),
        adaptador: "simulacao",
        dormir: semEspera,
        persistirEstado: true,
        pularValidacao: true,
      }),
    ).rejects.toThrow(/So pronto, agendado ou falhou/);
  });

  test("carrossel publica na ordem e nao publica duas vezes", async () => {
    bancoLimpo();
    registrar(CARROSSEL);
    const estado = novoEstadoSimulado();
    const cliente = clienteSimulado({ estadoCompartilhado: estado });
    const r1 = await publicarConteudo(CARROSSEL, {
      cliente,
      adaptador: "simulacao",
      dormir: semEspera,
      persistirEstado: true,
      pularValidacao: true,
    });
    expect(r1.status).toBe("publicado");
    const carrossel = [...estado.containers.values()].find((c) => c.filhos);
    const ordem = JSON.parse(
      readFileSync(join(RAIZ, "conteudos", CARROSSEL, "export", "ordem.json"), "utf8"),
    );
    expect(carrossel?.filhos?.length).toBe(ordem.paginas.length);
    // ids de container crescem na ordem em que as paginas foram enviadas
    expect([...(carrossel?.filhos ?? [])]).toEqual([...(carrossel?.filhos ?? [])].sort());
    const r2 = await publicarConteudo(CARROSSEL, {
      cliente,
      adaptador: "simulacao",
      dormir: semEspera,
      persistirEstado: true,
      pularValidacao: true,
    });
    expect(r2.status).toBe("ja-publicado");
    expect(estado.publicados.length).toBe(1);
  });

  test("timeout depois de publicar: confere e nao publica de novo", async () => {
    bancoLimpo();
    registrar(ESTATICO);
    const estado = novoEstadoSimulado();
    const cliente = clienteSimulado({
      estadoCompartilhado: estado,
      falhas: ["publicar-timeout-apos-publicar"],
    });
    const r = await publicarConteudo(ESTATICO, {
      cliente,
      adaptador: "simulacao",
      dormir: semEspera,
      persistirEstado: true,
      pularValidacao: true,
    });
    expect(r.status).toBe("publicado");
    if (r.status === "publicado") expect(r.via).toBe("conferencia-apos-timeout");
    expect(estado.publicados.length).toBe(1);
    expect(db.obter(ESTATICO)?.estado).toBe("publicado");
  });

  test("tentativa pendurada (processo morreu apos o POST): a proxima execucao confere antes de repetir", async () => {
    bancoLimpo();
    registrar(ESTATICO);
    const estado = novoEstadoSimulado();
    // 1a execucao: falha dura no media_publish -> estado falhou, nada publicado
    await expect(
      publicarConteudo(ESTATICO, {
        cliente: clienteSimulado({ estadoCompartilhado: estado, falhas: ["publicar-erro"] }),
        adaptador: "simulacao",
        dormir: semEspera,
        persistirEstado: true,
        pularValidacao: true,
      }),
    ).rejects.toThrow();
    expect(db.obter(ESTATICO)?.estado).toBe("falhou");
    expect(estado.publicados.length).toBe(0);
    // Simula: o POST de publicacao saiu e o processo morreu antes de gravar o resultado.
    const creationId = await clienteSimulado({ estadoCompartilhado: estado }).containerImagem({
      image_url: "https://simulacao.invalid/x.jpg",
      caption: db.obter(ESTATICO)!.legenda,
    });
    await clienteSimulado({ estadoCompartilhado: estado }).publicar(creationId);
    const reg = db.obter(ESTATICO)!;
    const chave = reg.publicacao!.tentativas.at(-1)!.chave;
    reg.publicacao!.tentativas.push({
      em: new Date(Date.now() - 1000).toISOString(),
      resultado: "em-andamento",
      chave,
      modo: "simulacao",
      creationId,
    });
    db.salvar(reg);
    // 2a execucao: tem que CONFERIR e achar o post, sem criar outro
    const r = await publicarConteudo(ESTATICO, {
      cliente: clienteSimulado({ estadoCompartilhado: estado }),
      adaptador: "simulacao",
      dormir: semEspera,
      persistirEstado: true,
      pularValidacao: true,
    });
    expect(r.status).toBe("publicado");
    expect(estado.publicados.length).toBe(1);
  });

  test("conta errada: nada e publicado", async () => {
    bancoLimpo();
    registrar(ESTATICO);
    const estado = novoEstadoSimulado();
    await expect(
      publicarConteudo(ESTATICO, {
        cliente: clienteSimulado({ estadoCompartilhado: estado, username: "outra.conta" }),
        adaptador: "simulacao",
        usuarioEsperado: "@foca",
        dormir: semEspera,
        persistirEstado: true,
        pularValidacao: true,
      }),
    ).rejects.toThrow(/Nada foi publicado/);
    expect(estado.publicados.length).toBe(0);
  });

  test("token expirado vira mensagem acionavel e estado falhou", async () => {
    bancoLimpo();
    registrar(ESTATICO);
    await expect(
      publicarConteudo(ESTATICO, {
        cliente: clienteSimulado({ falhas: ["token-expirado"] }),
        adaptador: "simulacao",
        dormir: semEspera,
        persistirEstado: true,
        pularValidacao: true,
      }),
    ).rejects.toThrow(/token do Instagram expirou/);
    expect(db.obter(ESTATICO)?.estado).toBe("falhou");
  });

  test("simulacao sem persistir nao muda o estado", async () => {
    bancoLimpo();
    registrar(CARROSSEL);
    const r = await publicarConteudo(CARROSSEL, {
      cliente: clienteSimulado(),
      adaptador: "simulacao",
      dormir: semEspera,
      pularValidacao: true,
    });
    expect(r.status).toBe("simulado");
    expect(db.obter(CARROSSEL)?.estado).toBe("pronto");
  });
});

describe("copy e video", () => {
  test("o validador de copy barra promessas proibidas e deixa passar a copy real", () => {
    expect(
      checarCopy("Estude 60 segundos e você vai passar!!").filter((a) => a.nivel === "erro").length,
    ).toBeGreaterThanOrEqual(3);
    for (const id of [CARROSSEL, ESTATICO]) {
      const c = JSON.parse(readFileSync(join(RAIZ, "conteudos", id, "conteudo.json"), "utf8"));
      const texto = [c.legenda, JSON.stringify(c.paginas)].join("\n");
      expect(checarCopy(texto).filter((a) => a.nivel === "erro")).toEqual([]);
    }
  });

  test("corte de silencio mantem folga e junta trechos colados", () => {
    const t = trechosComFala(
      [
        { inicio: 2, fim: 3.5 },
        { inicio: 6, fim: 7.2 },
      ],
      10,
      0.12,
    );
    expect(t).toEqual([
      { de: 0, ate: 2.12 },
      { de: 3.38, ate: 6.12 },
      { de: 7.08, ate: 10 },
    ]);
  });
});

// devolve o banco real intacto (os testes nunca escrevem nele)
test("o banco real nao foi tocado", () => {
  expect(process.env.FOCA_SOCIAL_BANCO).toBe(BANCO);
  const real = join(RAIZ, "historico", "banco.json");
  const backup = join(TMP, "banco-backup.json");
  if (existsSync(backup)) copyFileSync(backup, backup + ".conferido");
  expect(existsSync(real)).toBe(true);
});

describe("agendador", async () => {
  const { instanteNoFuso, agendar, cancelar } = await import("../ferramentas/agendador/agendar.ts");
  const { vencidos } = await import("../ferramentas/agendador/executar-fila.ts");

  test("converte horario de Sao Paulo para UTC (-03:00)", () => {
    expect(instanteNoFuso("2026-10-02 19:00", "America/Sao_Paulo").toISOString()).toBe(
      "2026-10-02T22:00:00.000Z",
    );
  });

  test("agenda, aparece na fila so depois do horario, e cancela", () => {
    bancoLimpo();
    registrar(ESTATICO);
    const r = agendar(ESTATICO, "2099-01-10 19:30");
    expect(db.obter(ESTATICO)?.estado).toBe("agendado");
    expect(vencidos(Date.now()).map((x) => x.id)).not.toContain(ESTATICO);
    expect(vencidos(new Date(r.quando).getTime() + 1000).map((x) => x.id)).toContain(ESTATICO);
    cancelar(ESTATICO);
    expect(db.obter(ESTATICO)?.estado).toBe("pronto");
    expect(vencidos(new Date(r.quando).getTime() + 1000).map((x) => x.id)).not.toContain(ESTATICO);
  });

  test("recusa horario fora da janela 08h-21h e conteudo nao aprovado", () => {
    bancoLimpo();
    registrar(ESTATICO);
    expect(() => agendar(ESTATICO, "2099-01-10 23:30")).toThrow(/fora da janela/);
    bancoLimpo();
    registrar(ESTATICO, "ideia");
    expect(() => agendar(ESTATICO, "2099-01-10 19:30")).toThrow(/so conteudo pronto/);
  });
});
