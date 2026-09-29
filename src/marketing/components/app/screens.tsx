// Telas do app refeitas em HTML (docs/42 §7). Espelham os retratos capturados do app (bun run marketing:shots) com o texto
// literal de content/app-screens.ts. Medidas em `em` sobre a largura da moldura (container query, ver app-screens.css):
// 1em equivale ao 1rem do app num celular de 390 px, então a tela escala inteira com a moldura.
// São ilustração: quem as usa marca o conjunto como aria-hidden ou role="img" com descrição (copy.ts).
import { ArrowLeft, ImagePlus, SendHorizontal, Sparkles, X, XCircle } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { focaExpressionSrc, focaLogoSrc, type FocaExpression } from "@/lib/brand/foca-expressions";
import { TELA_ATIVIDADE, TELA_NIVELAMENTO, TELA_PROVA, TELA_QUESTAO, TELA_TUTOR } from "../../content/app-screens";

type Atividade = { trilha: string; tipo: string; habilidade: string; motivo: string; botao: string };

/**
 * Cabeça da Foca dentro de uma tela (tamanho em em). Nunca girada nem esticada. A arte vem do registro oficial
 * (src/lib/brand/foca-expressions.ts) e usa a MESMA expressão que o app usa naquele lugar: motivo e tutor em
 * `neutra`, folha de erro em `acolhedora`; sem expressão = a logo (cabeçalho do onboarding).
 */
export function FocaHead({ className, eager = false, expression }: { className?: string; eager?: boolean; expression?: FocaExpression }) {
  return (
    <img
      src={(expression ? focaExpressionSrc(expression, 48) : focaLogoSrc(48)).webp} /* exibida a ~3,4em (até ~55 px): a arte de 96 cobre 2x */
      alt=""
      width={96}
      height={96}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      draggable={false}
      className={["app-foca", className ?? ""].join(" ").trim()}
    />
  );
}

/** Barra de cima de uma lição: fechar + progresso (+ contador opcional). */
function Topo({ progresso = 0, contador }: { progresso?: number; contador?: string }) {
  return (
    <div className="app-top">
      <X className="app-top__x" strokeWidth={2.25} aria-hidden="true" />
      <span className="app-bar">
        <span className="app-bar__fill" style={{ ["--p" as string]: progresso } as CSSProperties} />
      </span>
      {contador && <span className="app-top__count">{contador}</span>}
    </div>
  );
}

function Trilha({ t }: { t: { trilha: string; tipo: string; habilidade: string } }) {
  return (
    <p className="app-crumb">
      <span>{t.trilha}</span>
      <span className="app-crumb__sep" aria-hidden="true">
        {">"}
      </span>
      <span className="app-crumb__rest">
        {t.tipo} · {t.habilidade}
      </span>
    </p>
  );
}

/** Balão da Foca com o motivo da atividade (a frase do planner). */
export function Motivo({ texto, eager, className }: { texto: string; eager?: boolean; className?: string }) {
  return (
    <div className={["app-motivo", className ?? ""].join(" ").trim()}>
      <FocaHead eager={eager} expression="neutra" className="app-motivo__foca" />
      <p className="app-bubble app-motivo__txt">{texto}</p>
    </div>
  );
}

/** Tela de atividade da trilha: motivo, título e "Começar". */
export function TelaAtividade({ t = TELA_ATIVIDADE, eager = false, extra }: { t?: Atividade; eager?: boolean; extra?: ReactNode }) {
  return (
    <div className="app-scr">
      <Topo />
      <Trilha t={t} />
      <div className="app-body">
        <Motivo texto={t.motivo} eager={eager} />
        <p className="app-title app-atv__title">
          {t.tipo} · {t.habilidade}
        </p>
        <span className="app-btn app-atv__btn">{t.botao}</span>
        {extra}
      </div>
    </div>
  );
}

/** Onboarding: "Qual prova você está estudando pra fazer?" com ENEM marcado. */
export function TelaProva() {
  const t = TELA_PROVA;
  return (
    <div className="app-scr">
      <div className="app-steps" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="app-steps__seg" data-on={i < 2 ? "true" : i === 2 ? "half" : "false"} />
        ))}
      </div>
      <div className="app-prova__head">
        <span className="app-prova__voltar">
          <ArrowLeft strokeWidth={2.25} aria-hidden="true" />
          {t.voltar}
        </span>
        <span className="app-prova__marca">
          <FocaHead className="app-prova__foca" />
          {t.marca}
        </span>
      </div>
      <div className="app-body">
        <p className="app-kicker">{t.bloco}</p>
        <p className="app-title app-title--xl">{t.titulo}</p>
        <div className="app-opts">
          {t.opcoes.map((o, i) => (
            <span key={o} className="app-opt" data-sel={i === 0 ? "true" : undefined}>
              {i === 0 && <span className="app-opt__sel" />}
              <span className="app-opt__txt">{o}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Faixa de uma área: três segmentos, um aceso na posição da faixa (1 construção, 2 caminho, 3 firme). */
export function Faixa({ faixa, className }: { faixa: number; className?: string }) {
  return (
    <span className={["app-faixa", className ?? ""].join(" ").trim()} style={{ ["--f" as string]: faixa - 1 } as CSSProperties}>
      <span className="app-faixa__seg" />
      <span className="app-faixa__seg" />
      <span className="app-faixa__seg" />
      <span className="app-faixa__on" />
    </span>
  );
}

/** Cartão de área do resultado do nivelamento. */
export function CartaoArea({ nome, faixa, rotulo, precisao, className, children }: { nome: string; faixa: number; rotulo: ReactNode; precisao?: string; className?: string; children?: ReactNode }) {
  return (
    <div className={["app-area", className ?? ""].join(" ").trim()}>
      <p className="app-area__nome">{nome}</p>
      <div className="app-area__linha">
        <Faixa faixa={faixa} />
        <span className="app-area__faixa">{rotulo}</span>
      </div>
      {precisao && <p className="app-area__prec">{precisao}</p>}
      {children}
    </div>
  );
}

/** Resultado do nivelamento: quatro áreas em faixas e a primeira atividade. */
export function TelaNivelamento() {
  const t = TELA_NIVELAMENTO;
  return (
    <div className="app-scr">
      <div className="app-body app-body--top">
        <p className="app-title app-title--xl">{t.titulo}</p>
        <p className="app-sub">{t.corpo}</p>
        <div className="app-areas">
          {t.areas.map((a) => (
            <CartaoArea key={a.nome} nome={a.nome} faixa={a.faixa} rotulo={t.faixas[a.faixa - 1]} className="app-nv__area" />
          ))}
        </div>
        <div className="app-nv__primeira">
          <p className="app-kicker">{t.porOnde}</p>
          <p className="app-nv__atv">
            {t.primeiraPrefixo} {t.primeiraTipo} · {t.primeiraHabilidade}
          </p>
          <p className="app-sub app-sub--sm">{t.primeiraMotivo}</p>
        </div>
      </div>
    </div>
  );
}

/** Questão respondida errada com a folha de feedback aberta; opcionalmente com o balão da Foca por cima. */
export function TelaQuestao({ comTutor = false }: { comTutor?: boolean }) {
  const t = TELA_QUESTAO;
  return (
    <div className="app-scr">
      <Topo progresso={0.2} contador="1/5" />
      <Trilha t={t} />
      <div className="app-body app-body--q">
        <p className="app-kicker">{t.tipo}</p>
        <p className="app-title app-q__pergunta">{t.pergunta}</p>
        <div className="app-opts">
          {t.opcoes.map((o, i) => (
            <span key={o} className="app-opt" data-res={i === t.correta ? "certa" : i === t.escolhida ? "errada" : undefined}>
              <span className="app-opt__txt">{o}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="app-sheet app-sheet--erro">
        <div className="app-sheet__head">
          <FocaHead expression="acolhedora" className="app-sheet__foca" />
          <XCircle className="app-sheet__ico" strokeWidth={2} aria-hidden="true" />
          <p className="app-sheet__titulo">{t.fala}</p>
        </div>
        <p className="app-sheet__txt">{t.explicacao}</p>
        <div className="app-sheet__acoes">
          <span className="app-btn app-btn--ghost app-q__explicar">
            <Sparkles strokeWidth={2} aria-hidden="true" />
            {t.explicarMelhor}
          </span>
          <span className="app-btn">{t.continuar}</span>
        </div>
      </div>

      {comTutor && <Tutor />}
    </div>
  );
}

/** Balão da Foca (tutor) aberto por "Explicar melhor", com a resposta do app. */
function Tutor() {
  const t = TELA_TUTOR;
  return (
    <div className="app-tutor">
      <div className="app-tutor__head">
        <FocaHead expression="neutra" className="app-tutor__foca" />
        <span className="app-tutor__nome">{t.nome}</span>
        <X className="app-tutor__x" strokeWidth={2.25} aria-hidden="true" />
      </div>
      <div className="app-tutor__msgs">
        <p className="app-tutor__ctx">
          {t.falandoSobre} {t.contexto.join(" · ")}
        </p>
        <p className="app-tutor__eu">{t.pedido}</p>
        <div className="app-tutor__digitando" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="app-tutor__foca-msg">
          {t.respostaInicio} {TELA_QUESTAO.explicacao}
        </p>
      </div>
      <div className="app-tutor__sug">
        {t.sugestoes.map((s) => (
          <span key={s} className="app-chip">
            {s}
          </span>
        ))}
      </div>
      <div className="app-tutor__input">
        <span className="app-tutor__foto">
          <ImagePlus strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="app-tutor__campo">{t.placeholder}</span>
        <span className="app-tutor__enviar">
          <SendHorizontal strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

/** Tela "desligada" do começo da história: papel em branco com a Foca esperando. */
export function TelaEspera() {
  return (
    <div className="app-scr app-scr--espera">
      <FocaHead expression="neutra" className="app-espera__foca" />
    </div>
  );
}
