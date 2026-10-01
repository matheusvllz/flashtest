import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ImagePlus, Image as ImageIcon, Send, X } from "lucide-react";
import { FocaMark } from "@/components/brand/FocaMark";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { COPY } from "@/lib/copy";
import { clearTutorAutoSend, closeTutor, openTutor, pushTutorMessage, useAppState } from "@/lib/store";
import { askTutor, type PedidoTutor, type RespostaTutor } from "@/lib/tutor";
import { mensagensParaEnviar } from "@/lib/tutor-contrato";
import { comprimirFoto } from "@/lib/tutor-foto";
import type { TutorMessage } from "@/lib/tutor-prompt";

/** Ritmo da revelação. Palavra a palavra, com respiro depois de pontuação forte. */
const MS_POR_PALAVRA = 22;
const MS_APOS_PONTUACAO = 150;

type Foto = NonNullable<PedidoTutor["foto"]>;
type Aviso = { tipo: Exclude<RespostaTutor, { ok: true }>["tipo"]; podeTentar: boolean };

/** Texto de cada estado que não é resposta (spec 48 T-48.2.7). */
function textoDoAviso(tipo: Aviso["tipo"]): string {
  switch (tipo) {
    case "limite":
      return COPY.tutor.limite;
    case "indisponivel":
      return COPY.tutor.indisponivel;
    case "consentimento":
      return COPY.tutor.consentimento;
    case "desligado":
      return COPY.tutor.desligado;
    case "recusado":
      return COPY.tutor.recusado;
    case "sem-sessao":
      return COPY.tutor.semSessao;
    case "foto-invalida":
      return COPY.tutor.fotoInvalida;
    default:
      return COPY.tutor.falhaResposta;
  }
}

/** O foco do balão vira o pedido: só id, resposta crua e ordem exibida (o servidor monta o resto). */
function focoDoPedido(focus: ReturnType<typeof useAppState>["tutor"]["focus"]): PedidoTutor["foco"] {
  const itemId = focus?.itemId ?? focus?.questionId;
  if (!focus || !itemId) return null;
  return {
    itemId,
    respondeu: focus.answered,
    resposta: focus.resposta ?? null,
    ...(focus.exibidos ? { exibidos: focus.exibidos.slice(0, 20) } : {}),
  };
}

/**
 * Quebra o texto em "palavra + espaço que a segue", e não em tokens soltos:
 * assim cada tique revela UMA palavra. Separar o espaço num token próprio
 * dobrava o número de tiques (e o tempo total) sem nada aparecer na tela.
 * O `join("")` dos pedaços reconstrói o texto original, quebras de linha
 * inclusive — o que importa porque o balão usa `whitespace-pre-line`.
 */
function emPalavras(texto: string): string[] {
  return texto.match(/\s*\S+\s*/g) ?? (texto ? [texto] : []);
}

function prefereMenosMovimento() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/**
 * Revela o texto palavra a palavra, com cursor piscando — a resposta "nasce"
 * na tela em vez de aparecer pronta.
 *
 * A resposta já chegou inteira do servidor; isto é ritmo de leitura, não
 * streaming. Foi a escolha deliberada: streaming real pelo RPC da server
 * function (que serializa com seroval) seria risco novo em cima do que já está
 * validado, e o ganho percebido é o mesmo. Tocar na mensagem completa na hora,
 * para quem não quer esperar.
 */
function TextoRevelado({
  text,
  onProgresso,
  onFim,
}: {
  text: string;
  onProgresso?: () => void;
  onFim?: () => void;
}) {
  const tokens = useMemo(() => emPalavras(text), [text]);
  const [visiveis, setVisiveis] = useState(() => (prefereMenosMovimento() ? tokens.length : 0));
  const terminou = visiveis >= tokens.length;

  useEffect(() => {
    if (terminou) return;
    const atual = tokens[visiveis]?.trim() ?? "";
    const espera = /[.!?…:]$/.test(atual) ? MS_APOS_PONTUACAO : MS_POR_PALAVRA;
    const id = setTimeout(() => setVisiveis((v) => v + 1), espera);
    return () => clearTimeout(id);
  }, [visiveis, tokens, terminou]);

  useEffect(() => {
    onProgresso?.();
    if (terminou) onFim?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiveis, terminou]);

  return (
    <span
      onClick={() => setVisiveis(tokens.length)}
      // O texto completo fica no rótulo desde o início: leitor de tela não
      // deve ouvir a resposta saindo aos pedaços.
      aria-label={text}
    >
      <span aria-hidden>{tokens.slice(0, visiveis).join("")}</span>
      {!terminou && <span className="caret-tutor" aria-hidden />}
    </span>
  );
}

/**
 * Balão global do tutor (SDD 12, Development 2, entregável 1).
 *
 * Fica fixo no canto inferior direito de todas as telas pós-quiz. É a única
 * interface de IA do app — o chat de tela cheia que existia dentro de /study foi
 * absorvido por aqui, para o aluno nunca perder a questão de vista ao perguntar.
 */
export function TutorBubble() {
  const s = useAppState();
  const { open, messages, focus, pedagogy, autoSend } = s.tutor;
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [image, setImage] = useState<{ preview: string; payload: Foto } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);
  /** Foto do último pedido, para "Tentar de novo" reenviar igual. */
  const ultimaFotoRef = useRef<Foto | null>(null);
  /**
   * Índice da mensagem que está sendo revelada agora. Só a resposta recém-chegada
   * anima: ao reabrir o balão, o histórico aparece pronto (ninguém quer ver a
   * conversa inteira ser redigitada).
   */
  const [revelando, setRevelando] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Painel = diálogo modal acessível (docs/36 T-08.5, RA-1): foco no título, Tab preso, Escape fecha,
  // fundo inert, scroll do fundo travado. Sem scrim novo — visualmente igual a antes. O botão flutuante é
  // desmontado enquanto o painel está aberto, então o foco volta ao NOVO botão (`data-tutor-fab`).
  const panelRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLSpanElement>(null);
  const tituloId = useId();
  useDialogA11y({
    open,
    onClose: closeTutor,
    dialogRef: panelRef,
    initialFocusRef: tituloRef,
    restoreFocusFallback: () => document.querySelector<HTMLElement>("[data-tutor-fab]"),
  });

  function rolarParaOFim(suave = true) {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: suave ? "smooth" : "auto",
    });
  }

  useEffect(() => {
    rolarParaOFim();
  }, [messages.length, pending, open]);

  // Fechar no meio da revelação não deixa a mensagem pendurada: ao reabrir, o
  // histórico já aparece completo.
  useEffect(() => {
    if (!open) setRevelando(null);
  }, [open]);

  /**
   * Nível 3 da explicação em camadas (docs/30 §17.2, Fase 7 F7.6): quando o
   * aluno pede "Me ensina do começo", `openTutorWithContext` já deixa
   * `s.tutor.autoSend` com a mensagem pronta — aqui só disparamos o envio
   * assim que o balão está aberto e consumimos o campo (`clearTutorAutoSend`)
   * pra não reenviar num re-render. `autoSendRef` é reforço contra o
   * StrictMode rodar o efeito 2x antes do `clearTutorAutoSend` propagar.
   */
  const autoSendRef = useRef<string | null>(null);
  useEffect(() => {
    if (!open || !autoSend || autoSendRef.current === autoSend) return;
    autoSendRef.current = autoSend;
    clearTutorAutoSend();
    void send(autoSend);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoSend]);

  /**
   * Pede a resposta para o histórico dado (que termina na pergunta do aluno). Só as últimas 20 mensagens vão no
   * pedido (B-102); o aparelho guarda 40. Estados que não são resposta aparecem num aviso, fora do histórico.
   */
  async function pedir(historico: TutorMessage[], foto: Foto | null) {
    setPending(true);
    setAviso(null);
    ultimaFotoRef.current = foto;
    const indiceDaResposta = historico.length;
    let r: RespostaTutor;
    try {
      r = await askTutor({
        data: {
          mensagens: mensagensParaEnviar(historico.map((m) => ({ role: m.role, content: m.content }))),
          foco: focoDoPedido(focus),
          modo: pedagogy?.mode ?? "duvida",
          foto,
        },
      });
    } catch {
      r = { ok: false, tipo: "erro" };
    }
    if (r.ok) {
      pushTutorMessage({ role: "assistant", content: r.texto });
      setRestantes(r.restantes);
      setRevelando(indiceDaResposta);
    } else if (r.tipo === "autocuidado") {
      // Protocolo de autocuidado: a mensagem fica visível no histórico, sem animação.
      pushTutorMessage({ role: "assistant", content: r.texto ?? COPY.tutor.autocuidado });
    } else {
      setAviso({ tipo: r.tipo, podeTentar: r.tipo === "erro" || r.tipo === "indisponivel" || r.tipo === "invalido" });
    }
    setPending(false);
  }

  async function send(text: string) {
    if (pending) return;
    const attached = image;
    // Só a foto, sem texto, já é um pedido válido — é o "1 toque de wow" do SDD.
    const prompt = (text.trim() || (attached ? COPY.tutor.fotoSemTexto : "")).slice(0, 4000);
    if (!prompt) return;

    setDraft("");
    setImage(null);
    const pergunta: TutorMessage = { role: "user", content: prompt, hasImage: !!attached };
    pushTutorMessage(pergunta);
    await pedir([...messages, pergunta], attached?.payload ?? null);
  }

  function tentarDeNovo() {
    if (pending || messages[messages.length - 1]?.role !== "user") return;
    void pedir(messages, ultimaFotoRef.current);
  }

  async function attach(file: File) {
    setImageError(null);
    const r = await comprimirFoto(file);
    if (!r.ok) {
      setImageError(r.erro === "grande" ? COPY.tutor.fotoGrande : COPY.tutor.fotoInvalida);
      return;
    }
    setImage({ preview: r.preview, payload: { tipo: r.tipo, base64: r.base64 } });
  }

  // Desktop (docs/44 §5): com o painel aberto, a coluna abre espaço à direita (CSS em styles.css, `html[data-tutor]`).
  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.tutor = "aberto";
    return () => {
      delete document.documentElement.dataset.tutor;
    };
  }, [open]);

  // Sugestões mudam conforme o aluno está numa questão ou não. `answered`/
  // `wasCorrect` são a fonte da verdade — não `chosen`, que pode ser um texto
  // preenchido mesmo em resposta composta ainda não avaliada (docs/20 §4.2.8).
  const suggestions = focus
    ? focus.answered && !focus.wasCorrect
      ? COPY.tutor.sugestoesErro
      : COPY.tutor.sugestoesAjuda
    : COPY.tutor.sugestoesGeral;

  // O aluno desligou a Foca IA no perfil (spec 48 T-48.2.6): sem botão. Se uma tela abrir o painel mesmo assim,
  // o servidor responde "desligado" e o aviso explica como ligar.
  if (!open && s.prefs.focaIADesligada) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => openTutor()}
        aria-label={COPY.tutor.abrirAriaLabel}
        data-tutor-fab
        className="anchor-col-right fixed bottom-24 z-40 grid h-14 w-14 place-items-center rounded-full border-2 border-gelo bg-cards shadow-[0_3px_0_var(--gelo)] transition active:translate-y-[3px] active:shadow-none lg:bottom-8"
      >
        <FocaMark size={40} expression="neutra" decorative motion="none" />
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      tabIndex={-1}
      data-tutor-painel
      className="sheet anchor-col-center col-max-w fixed bottom-0 z-50 flex max-h-[80vh] flex-col overscroll-contain outline-none lg:inset-y-0 lg:left-auto lg:right-0 lg:mx-0 lg:w-[var(--tutor-painel)] lg:max-w-none lg:max-h-none lg:rounded-none lg:rounded-l-[var(--radius-3xl)] lg:border-l-2 lg:border-gelo lg:shadow-none"
    >
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <FocaMark size={28} expression="neutra" decorative />
          <span
            id={tituloId}
            ref={tituloRef}
            tabIndex={-1}
            className="font-display text-base font-bold text-abismo outline-none"
          >
            {COPY.tutor.nome}
          </span>
        </div>
        <button
          type="button"
          onClick={closeTutor}
          aria-label={COPY.tutor.fecharAriaLabel}
          className="grid h-11 w-11 place-items-center text-nevoa"
        >
          <X size={20} />
        </button>
      </header>

      <p className="mx-5 mb-2 text-xs text-nevoa">{COPY.tutor.avisoIA}</p>

      {focus && (
        <p className="chip mx-5 mb-2 self-start">
          {COPY.tutor.falandoSobre(focus.topic, focus.subjectName)}
        </p>
      )}

      <div ref={scrollRef} className="surface-pauta flex-1 space-y-3 overflow-y-auto px-5 pb-3">
        {messages.length === 0 && (
          <div className="rounded-lg rounded-bl-md border-2 border-gelo bg-neve px-4 py-3 text-sm leading-relaxed text-abismo">
            {focus ? COPY.tutor.saudacaoComFoco(focus.topic) : COPY.tutor.saudacaoSemFoco}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div
              key={i}
              className="ml-auto max-w-[85%] rounded-lg rounded-br-md bg-mar px-4 py-2.5 text-sm font-medium text-on-mar"
            >
              {m.hasImage && (
                <ImageIcon size={13} className="mr-1.5 inline-block align-text-bottom opacity-80" />
              )}
              {m.content}
            </div>
          ) : (
            <div
              key={i}
              className="mr-auto max-w-[88%] whitespace-pre-line rounded-lg rounded-bl-md border-2 border-gelo bg-neve px-4 py-3 text-sm leading-relaxed text-abismo"
            >
              {i === revelando ? (
                <TextoRevelado
                  // `key` pelo conteúdo: se a mesma posição receber outra
                  // resposta, a revelação recomeça em vez de continuar no meio.
                  key={m.content}
                  text={m.content}
                  onProgresso={() => rolarParaOFim(false)}
                  onFim={() => setRevelando(null)}
                />
              ) : (
                m.content
              )}
            </div>
          ),
        )}

        {aviso && !pending && (
          <div
            role="status"
            data-tutor-aviso={aviso.tipo}
            className="rounded-lg border-2 border-gelo bg-cards px-4 py-3 text-sm leading-relaxed text-abismo"
          >
            <p>{textoDoAviso(aviso.tipo)}</p>
            {aviso.podeTentar && (
              <button type="button" onClick={tentarDeNovo} className="btn-outline mt-2 min-h-11 px-4 text-sm">
                {COPY.tutor.tentarDeNovo}
              </button>
            )}
          </div>
        )}

        {restantes !== null && restantes <= 1 && !pending && !aviso && (
          <p className="text-center text-xs text-nevoa" aria-live="polite">
            {COPY.tutor.restantes(restantes)}
          </p>
        )}

        {pending && (
          <div className="mr-auto flex gap-1.5 rounded-lg rounded-bl-md border-2 border-gelo bg-neve px-4 py-4">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-nevoa"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t-2 border-gelo bg-cards px-5 pt-3 pb-5">
        {!pending && (
          <div className="-mt-1 mb-2.5 flex gap-2 overflow-x-auto pt-1 pb-1">
            {suggestions.map((sug) => (
              <button type="button" key={sug} onClick={() => send(sug)} className="chip shrink-0">
                {sug}
              </button>
            ))}
          </div>
        )}

        {imageError && (
          <p role="alert" className="mb-2.5 text-xs font-semibold text-error">
            {imageError}
          </p>
        )}

        {image && (
          <div className="mb-2.5 flex items-center gap-2 rounded-lg border-2 border-gelo bg-neve p-2">
            <img src={image.preview} alt="" className="h-12 w-12 rounded object-cover" />
            <span className="flex-1 text-xs font-semibold text-nevoa">{COPY.tutor.fotoAnexada}</span>
            <button
              type="button"
              onClick={() => setImage(null)}
              aria-label={COPY.tutor.removerFotoAriaLabel}
              className="tap-area text-nevoa"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void attach(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label={COPY.tutor.anexarAriaLabel}
            className="btn-outline h-11 w-11 shrink-0 p-0"
          >
            <ImagePlus size={18} />
          </button>
          <input
            aria-label={COPY.tutor.placeholder}
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(draft);
            }}
            placeholder={COPY.tutor.placeholder}
            className="input-ds min-w-0 flex-1 text-base"
          />
          <button
            type="button"
            onClick={() => send(draft)}
            disabled={pending || (!draft.trim() && !image)}
            aria-label={COPY.tutor.enviarAriaLabel}
            className="btn-primary h-11 w-11 shrink-0 rounded-full p-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
