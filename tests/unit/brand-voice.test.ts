import { describe, expect, test } from "bun:test";
import { buildSystemPrompt, type TutorContext } from "@/lib/tutor-prompt";
import { COPY } from "@/lib/copy";
import { VOZ } from "@/lib/voz";
import { BRAND } from "@/lib/brand";

/**
 * Fase 3 (docs/20 §7, precedência): sarcasmo/cobrança que constrange por erro
 * ou ausência saiu da voz do produto — companhia direta e respeitosa entrou
 * no lugar. Regressão pra não deixar a cobrança voltar silenciosamente.
 */
describe("persona do tutor — sem sarcasmo/cobrança (docs/20 §7)", () => {
  const ctx: TutorContext = {
    firstName: "Ana",
    targetInstitution: "",
    targetCourse: "",
    level: "",
    gaps: [],
    performance: [],
    focus: null,
  };

  test("prompt não descreve a Foca como sarcástica nem cobradora de disciplina", () => {
    const prompt = buildSystemPrompt(ctx).toLowerCase();
    expect(prompt).not.toContain("sarcástic");
    expect(prompt).not.toContain("cobra disciplina");
  });

  test("prompt não autoriza cobrança por ausência", () => {
    const prompt = buildSystemPrompt(ctx).toLowerCase();
    expect(prompt).not.toContain("implica com ausência");
  });
});

describe("voz.ts — slot 'errou' sem cobrança sobre resultado", () => {
  test("nenhuma fala de erro ameaça cobrança futura", () => {
    for (const fala of VOZ.errou) {
      expect(fala.toLowerCase()).not.toContain("cobrar");
    }
  });
});

describe("voz.ts — slot 'naosei' (docs/30 §16.1, Fase 6)", () => {
  test("nenhuma fala cobra nem julga o aluno por não saber", () => {
    for (const fala of VOZ.naosei) {
      const minuscula = fala.toLowerCase();
      expect(minuscula).not.toContain("cobrar");
      expect(minuscula).not.toContain("errou");
      expect(minuscula).not.toContain("errado");
    }
  });
});

describe("COPY.jornada.motivos — sem 'domina', sem cobrança (docs/30 §14.2, Fase 12)", () => {
  test("nenhum motivo de card usa 'domina' nem cobra o aluno", () => {
    for (const texto of Object.values(COPY.jornada.motivos)) {
      const minuscula = texto.toLowerCase();
      expect(minuscula).not.toContain("domina");
      expect(minuscula).not.toContain("cobrar");
      expect(minuscula).not.toContain("você precisa");
      expect(minuscula).not.toContain("você deveria");
    }
  });

  test("humor no máximo implícito — nenhum motivo usa exclamação dupla (docs/20 §7.1)", () => {
    for (const texto of Object.values(COPY.jornada.motivos)) {
      expect(texto).not.toContain("!!");
    }
  });
});

describe("COPY.onboarding / COPY.nivelamento — sem nota, sem 'nível N', sem cobrança (docs/30 §12.2/§12.5, Fase 13)", () => {
  function textosDe(bloco: Record<string, unknown>): string[] {
    return Object.values(bloco).filter((v): v is string => typeof v === "string");
  }

  test("nenhum texto manda o aluno fazer algo ('você precisa/deveria' + verbo) nem usa exclamação dupla", () => {
    // Checa o padrão de COBRANÇA ("você precisa estudar"), não a palavra
    // "precisa" sozinha — "mais perto do que você precisa" (oferta de
    // nivelamento, `30` §12.2, copy já aprovada) usa "precisar" no sentido
    // comum, não manda o aluno fazer nada.
    const cobranca = /voc[eê] (precisa|deveria) (estudar|fazer|responder|treinar|praticar|acertar)/i;
    for (const texto of [...textosDe(COPY.onboarding), ...textosDe(COPY.nivelamento)]) {
      expect(cobranca.test(texto)).toBe(false);
      expect(texto).not.toContain("!!");
    }
  });

  test("resultado do nivelamento não apresenta nota nem 'nível N' (docs/30 §12.5; docs/36 RP-6)", () => {
    // A copy exata do plano (docs/36 §F.5) NEGA a nota: "…um ponto de partida, não uma nota." — a
    // palavra aparece só nessa frase de negação, que é a própria garantia do RP-6. Fora dela, nenhum
    // texto do bloco pode falar em nota.
    for (const texto of textosDe(COPY.nivelamento)) {
      const semNegacao = texto.replace("não uma nota", "");
      expect(semNegacao.toLowerCase()).not.toContain("nota");
      expect(/nível \d/i.test(texto)).toBe(false);
      expect(/\d+ ?%/.test(texto)).toBe(false);
    }
  });

  test("resultado: textos exatos do plano (docs/36 §F.5, RU-10)", () => {
    expect(COPY.nivelamento.resultadoTitulo).toBe("Pronto. Sua trilha foi ajustada.");
    expect(COPY.nivelamento.resultadoCorpo).toBe("Isso é um ponto de partida, não uma nota. Muda conforme você estuda.");
    expect(COPY.nivelamento.resultadoSemDados).toBe(
      "Não tivemos questões suficientes para medir agora. Sua trilha começa pelo básico e se ajusta enquanto você estuda.",
    );
    expect(COPY.nivelamento.faixaBaseConstrucao).toBe("Base em construção");
    expect(COPY.nivelamento.faixaNoCaminho).toBe("No caminho");
    expect(COPY.nivelamento.faixaBaseFirme).toBe("Base firme");
    expect(COPY.nivelamento.precisaoFirme).toBe("Estimativa firme");
    expect(COPY.nivelamento.precisaoInicial).toBe("Estimativa inicial");
    expect(COPY.nivelamento.precisaoPoucas).toBe("Poucas questões. Vamos confirmar estudando.");
    expect(COPY.nivelamento.porOndeComecamos).toBe("Por onde começamos");
    expect(COPY.nivelamento.primeiraAtividade("Porcentagem")).toBe("Sua primeira atividade: Porcentagem");
    expect(COPY.nivelamento.questoesRespondidas(1)).toBe("1 questão");
    expect(COPY.nivelamento.questoesRespondidas(3)).toBe("3 questões");
    expect(COPY.nivelamento.faixaAriaLabel("Matemática", "No caminho", "Estimativa inicial")).toBe(
      "Matemática: No caminho. Estimativa inicial.",
    );
    expect(COPY.nivelamento.faixaAriaLabel("Matemática", "No caminho", COPY.nivelamento.precisaoPoucas)).toBe(
      "Matemática: No caminho. Poucas questões. Vamos confirmar estudando.",
    );
  });
});

describe("COPY — avisos e erros da jornada (docs/36 RU-1, RU-2, RU-3; voz de docs/20 §7.1)", () => {
  test("textos exatos do plano", () => {
    expect(COPY.jornada.puladaSemItens).toBe("Essa atividade ficou sem questões agora. Segui com a próxima.");
    expect(COPY.jornada.carregando).toBe("Separando suas questões…");
    expect(COPY.jornada.erroPacoteTitulo).toBe("Não deu pra carregar agora.");
    expect(COPY.jornada.erroPacoteCorpo).toBe("Confere a internet e tenta de novo.");
    expect(COPY.comum.tentarDeNovo).toBe("Tentar de novo");
    expect(COPY.jornada.voltarTrilha).toBe("Voltar à trilha");
  });

  test("sem exclamação, sem cobrança, botões de 1 a 4 palavras", () => {
    const textos = [
      COPY.jornada.puladaSemItens,
      COPY.jornada.carregando,
      COPY.jornada.erroPacoteTitulo,
      COPY.jornada.erroPacoteCorpo,
    ];
    for (const t of textos) {
      expect(t).not.toContain("!");
      expect(t.toLowerCase()).not.toContain("você precisa");
    }
    for (const botao of [COPY.comum.tentarDeNovo, COPY.jornada.voltarTrilha, COPY.comum.fecharAviso]) {
      const palavras = botao.trim().split(/\s+/).length;
      expect(palavras).toBeGreaterThanOrEqual(1);
      expect(palavras).toBeLessThanOrEqual(4);
    }
  });
});

describe("COPY — avisos de persistência local (docs/36 RU-4, RU-5, RU-6; voz de docs/20 §7.1)", () => {
  test("textos exatos do plano", () => {
    expect(COPY.persistencia.falhaAoSalvar).toBe(
      "Não consegui salvar neste aparelho. O que você fez agora pode se perder se fechar o app.",
    );
    expect(COPY.persistencia.storageRecuperado).toBe(
      "Não consegui ler seu progresso salvo. Guardei uma cópia e comecei do zero neste aparelho.",
    );
    expect(COPY.persistencia.versaoFutura).toBe(
      "Seus dados são de uma versão mais nova do app. Recarregue a página para atualizar. Até lá, nada do que você fizer aqui fica salvo.",
    );
    expect(COPY.comum.ok).toBe("Ok");
  });

  test("sem exclamação, sem cobrança e sem prometer sincronização entre aparelhos", () => {
    for (const t of Object.values(COPY.persistencia)) {
      expect(t).not.toContain("!");
      expect(t.toLowerCase()).not.toContain("você precisa");
      expect(/nuvem|sincroniz|conta/i.test(t)).toBe(false);
    }
    for (const botao of [COPY.comum.ok, COPY.comum.tentarDeNovo]) {
      const palavras = botao.trim().split(/\s+/).length;
      expect(palavras).toBeGreaterThanOrEqual(1);
      expect(palavras).toBeLessThanOrEqual(4);
    }
  });
});

/**
 * docs/36 RU-20 (T-08.7): título/descrição do site e texto de compartilhamento não prometem
 * duração ("60 segundos", que o produto não mede) nem cobram o aluno ("te cobra", `20` §7.1).
 * O texto é o literal do plano (§F.4).
 */
describe("BRAND — sem duração prometida, sem cobrança (docs/36 RU-20)", () => {
  test("tagline e descrição são o texto literal do plano", () => {
    expect(BRAND.tagline).toBe("Estudo curto, todo dia.");
    expect(BRAND.description).toBe(
      "Preparação para o ENEM em aulas curtas. A Foca acompanha o que você já sabe e escolhe o próximo passo.",
    );
  });

  test("nenhum campo de BRAND cita '60 segundos'/'60s' nem cobra", () => {
    for (const texto of Object.values(BRAND)) {
      const minuscula = texto.toLowerCase();
      expect(minuscula).not.toContain("60 segundos");
      expect(/\b60 ?s\b/.test(minuscula)).toBe(false);
      expect(minuscula).not.toContain("cobra");
      expect(texto).not.toContain("!");
    }
  });

  test("nome da marca inalterado", () => {
    expect(BRAND.name).toBe("Foca");
  });
});
