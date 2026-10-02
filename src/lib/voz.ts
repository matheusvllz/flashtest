/**
 * Biblioteca de falas da Foca (docs/historico/fundacao/15-mascote-e-voz.md §7, docs/18-plano-
 * reestilizacao-rabisco.md Apêndice B; docs/historico/iniciativas/20-22-aprendizagem/20-plano-evolucao-aprendizagem.md
 * §7 prevalece em conflito de tom). Toda frase daqui passou pelo teste da `15`
 * §8 antes de entrar — não adicionar frase nova sem passar por ele.
 *
 * `retorno` é o slot mais frágil do produto (`15` §3.2): as três variações são
 * acolhedoras por construção, nenhuma delas cobra. Não misturar tons aqui.
 *
 * `errou` teve uma linha de cobrança sobre resultado removida na Fase 3 do
 * `20` (§7, precedência): errar nunca é motivo de cobrança, só ausência —
 * regra que já estava em `15` §3.3, mas essa linha específica a violava.
 */
export type VozSlot =
  | "bomdia"
  | "retorno"
  | "meta"
  | "aha"
  | "acertou"
  | "errou"
  | "naosei"
  | "fimbom"
  | "fimruim"
  | "marco"
  | "nivel"
  | "vazio"
  | "404"
  | "lembrete";

export const VOZ: Record<VozSlot, string[]> = {
  bomdia: [
    "Acordei antes de você. De novo.",
    "60 segundos. Depois você volta pro feed.",
    "Tô na pedra. Bora.",
  ],
  retorno: [
    "Desfocou uns dias. Acontece comigo direto. Bora de 60 segundos.",
    "Voltou. Não vou perguntar onde você tava.",
    "Sem sermão. Só 60 segundos.",
  ],
  meta: ["Meta fechada. Pode ir.", "Feito. Eu volto pra minha pedra.", "Hoje tá pago."],
  // Spec 48 D48-12 (B-068): a fala não afirma medição. Sem nivelamento, nada foi medido ainda.
  aha: [
    "Ponto de partida anotado. O resto eu aprendo com cada resposta sua.",
    "Ainda não medi nada. A gente descobre estudando.",
  ],
  acertou: [
    "Certa. Anotei aqui na pedra.",
    "Tá vendo? Não era tão difícil.",
    "Boa. Não se acostuma.",
    "Uma. Faltam só todas as outras.",
  ],
  errou: [
    "Errou. Respira, é pra isso que eu tô aqui.",
    "Essa aí pega muita gente. Inclusive você, agora.",
    "Errar é o app funcionando. Sério.",
    "Marquei aqui. Bora ver onde travou.",
  ],
  /**
   * Botão "Não sei" (docs/30 §16.1, Fase 6) — nem acerto nem erro: o aluno
   * optou por não chutar. Mesma regra de tom do `errou`: sem cobrança, sem
   * "tudo bem" performático — só segue pro caminho.
   */
  naosei: ["Tudo bem. Veja como resolve:", "Sem problema. Olha o caminho:", "Beleza. Vamos por partes:"],
  fimbom: [
    "60 segundos. Foi isso que você achava que não tinha.",
    "Aula fechada. Pode voltar pro feed, eu fico aqui.",
  ],
  fimruim: [
    "Foi mal hoje. Mas você apareceu, que é o que conta.",
    "Placar feio. Amanhã a gente arruma.",
  ],
  marco: [
    "7 dias. Eu não focaria 7 dias seguidos nem por peixe.",
    "30 dias. Sinceramente, não esperava.",
    "100 dias. Vou precisar de uma pedra maior.",
  ],
  nivel: ["Subiu de nível. Eu continuo no mesmo, deitada."],
  vazio: [
    "Nada aqui ainda. Igual à minha agenda.",
    "Vazio. Que nem sua sequência de ontem.",
    "Ainda não rabiscaram esta página.",
  ],
  "404": [
    "Essa página não existe. Eu também quase não existo, tô só deitada.",
    "Aqui não tem nada. Volta pro caderno.",
  ],
  /**
   * Lembrete diário por push (spec 50 §5.2.5; Decreto 12.880 art. 10: sem pressão emocional nem urgência fabricada).
   * Texto da notificação, escolhido no servidor: neutro, sem ofensiva em risco, sem culpa, sem "seu amigo", sem
   * urgência, sem emoji e sem o nome do aluno (a tela de bloqueio é vista por outras pessoas). Teste em
   * `tests/unit/lembretes.test.ts`.
   */
  lembrete: [
    "Sua lição de hoje está pronta.",
    "A lição do dia já está na trilha.",
    "Tem uma lição curta pronta para hoje.",
    "Quando der, a lição de hoje já está separada.",
    "A próxima lição da trilha já está pronta.",
    "Hoje tem lição nova na trilha.",
  ],
};

const CHAVE_SESSAO = (slot: VozSlot) => `foca.voz.${slot}`;

/**
 * Sorteia uma fala do slot, evitando repetir a última mostrada NESTA aba
 * (docs/15 §7: "repetição mata o personagem"). Guarda em sessionStorage —
 * é conveniência de sessão, não estado que precise sobreviver a um reload
 * ou ser lido de volta pelo store.
 */
export function fala(slot: VozSlot): string {
  const opcoes = VOZ[slot];
  if (opcoes.length === 1) return opcoes[0];

  let ultima: string | null = null;
  try {
    ultima = sessionStorage.getItem(CHAVE_SESSAO(slot));
  } catch {
    // sessionStorage indisponível (privado, bloqueado): sorteia sem memória.
  }

  const candidatas = ultima ? opcoes.filter((f) => f !== ultima) : opcoes;
  const escolhida = candidatas[Math.floor(Math.random() * candidatas.length)];

  try {
    sessionStorage.setItem(CHAVE_SESSAO(slot), escolhida);
  } catch {
    // idem — falha silenciosa, a fala já foi escolhida.
  }

  return escolhida;
}
