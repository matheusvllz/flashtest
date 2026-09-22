import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Image as ImageIcon, Send, X } from "lucide-react";
import { FocaMark } from "@/components/brand/FocaMark";
import { COPY } from "@/lib/copy";
import { closeTutor, openTutor, performanceFacts, pushTutorMessage, useAppState } from "@/lib/store";
import { askTutor, type TutorImage } from "@/lib/tutor";
import type { TutorContext } from "@/lib/tutor-prompt";

/** Ritmo da revelação. Palavra a palavra, com respiro depois de pontuação forte. */
const MS_POR_PALAVRA = 22;
const MS_APOS_PONTUACAO = 150;

/**
 * Mesmo limite do servidor (`tutor-core.ts#validateTutorRequest`, docs/20
 * §14.2) — checado aqui ANTES de ler o arquivo, pra não gastar FileReader
 * nem rodada de rede com algo que o servidor rejeitaria de qualquer jeito.
 * Duplicado, não importado de `tutor-core.ts`: aquele módulo é server-only
 * por design (CLAUDE.md) e não deve ser puxado pro bundle do cliente.
 */
const TIPOS_IMAGEM_PERMITIDOS = new Set(["image/png", "image/jpeg", "image/webp"]);
const IMAGEM_MAX_BYTES = 5 * 1024 * 1024;

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
  const { open, messages, focus } = s.tutor;
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [image, setImage] = useState<{ preview: string; payload: TutorImage } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  /**
   * Índice da mensagem que está sendo revelada agora. Só a resposta recém-chegada
   * anima: ao reabrir o balão, o histórico aparece pronto (ninguém quer ver a
   * conversa inteira ser redigitada).
   */
  const [revelando, setRevelando] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function send(text: string) {
    if (pending) return;
    const attached = image;
    // Só a foto, sem texto, já é um pedido válido — é o "1 toque de wow" do SDD.
    const prompt = text.trim() || (attached ? COPY.tutor.fotoSemTexto : "");
    if (!prompt) return;

    setDraft("");
    setImage(null);
    pushTutorMessage({ role: "user", content: prompt, hasImage: !!attached });
    setPending(true);

    const context: TutorContext = {
      firstName: (s.prefs.name || "estudante").split(" ")[0],
      targetInstitution: s.prefs.targetInstitution,
      targetCourse: s.prefs.targetCourse,
      level: s.prefs.level,
      gaps: s.quiz.gaps.map((g) => ({ subjectName: g.subjectName, topic: g.topic })),
      performance: performanceFacts(s),
      focus,
    };

    // A resposta entra logo depois da pergunta que acabamos de empilhar.
    const indiceDaResposta = messages.length + 1;

    try {
      const reply = await askTutor({
        data: {
          messages: [...messages, { role: "user", content: prompt }],
          context,
          image: attached?.payload ?? null,
        },
      });
      pushTutorMessage({ role: "assistant", content: reply.text });
    } catch {
      pushTutorMessage({
        role: "assistant",
        content: COPY.tutor.falhaResposta,
      });
    } finally {
      setPending(false);
      setRevelando(indiceDaResposta);
    }
  }

  function attach(file: File) {
    setImageError(null);
    // Checa ANTES de ler o arquivo — mesmos limites do servidor (docs/20
    // §14.2, Fase 7 item 8), pra não gastar FileReader com algo que a
    // validação de runtime do servidor rejeitaria de qualquer forma.
    if (!TIPOS_IMAGEM_PERMITIDOS.has(file.type)) {
      setImageError("Formato não suportado. Envie PNG, JPEG ou WebP.");
      return;
    }
    if (file.size > IMAGEM_MAX_BYTES) {
      setImageError("Imagem maior que 5 MiB. Tente uma foto menor.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const base64 = url.split(",")[1];
      if (!base64) return;
      setImage({ preview: url, payload: { mediaType: file.type, data: base64 } });
    };
    reader.readAsDataURL(file);
  }

  // Sugestões mudam conforme o aluno está numa questão ou não. `answered`/
  // `wasCorrect` são a fonte da verdade — não `chosen`, que pode ser um texto
  // preenchido mesmo em resposta composta ainda não avaliada (docs/20 §4.2.8).
  const suggestions = focus
    ? focus.answered && !focus.wasCorrect
      ? COPY.tutor.sugestoesErro
      : COPY.tutor.sugestoesAjuda
    : COPY.tutor.sugestoesGeral;

  if (!open) {
    return (
      <button
        onClick={() => openTutor()}
        aria-label={COPY.tutor.abrirAriaLabel}
        className="fixed bottom-24 right-[max(1rem,calc(50%-13.75rem+1rem))] z-40 grid h-14 w-14 place-items-center rounded-full border-2 border-gelo bg-cards shadow-[0_3px_0_var(--color-gelo)] transition active:translate-y-[3px] active:shadow-none"
      >
        <FocaMark size={40} decorative motion="none" />
      </button>
    );
  }

  return (
    <div className="sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[80vh] w-full max-w-[440px] flex-col">
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <FocaMark size={28} decorative />
          <span className="font-display text-base font-bold text-abismo">{COPY.tutor.nome}</span>
        </div>
        <button
          onClick={closeTutor}
          aria-label={COPY.tutor.fecharAriaLabel}
          className="grid h-11 w-11 place-items-center text-nevoa"
        >
          <X size={20} />
        </button>
      </header>

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
              className="ml-auto max-w-[85%] rounded-lg rounded-br-md bg-mar px-4 py-2.5 text-sm font-medium text-white"
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
          <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((sug) => (
              <button key={sug} onClick={() => send(sug)} className="chip shrink-0">
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
              onClick={() => setImage(null)}
              aria-label={COPY.tutor.removerFotoAriaLabel}
              className="text-nevoa"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) attach(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            aria-label={COPY.tutor.anexarAriaLabel}
            className="btn-outline h-11 w-11 shrink-0 p-0"
          >
            <ImagePlus size={18} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(draft);
            }}
            placeholder={COPY.tutor.placeholder}
            className="input-ds min-w-0 flex-1 text-base"
          />
          <button
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
