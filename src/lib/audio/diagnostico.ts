/**
 * Diagnóstico do som (spec 50 T-50.1.1, §5.12.1): "no celular o som não toca". O painel mostra o estado do contexto
 * de áudio, cada destravamento, carga e som descartado (com o motivo), para confirmar a causa no aparelho do aluno sem
 * presumir. Só carrega com `?diagnostico-audio=1` (`src/routes/__root.tsx`); não envia nada pela rede — o texto sai
 * pelo botão "Copiar diagnóstico". Mesmo padrão do diagnóstico de rolagem da 49 (`src/lib/diagnostico-rolagem.ts`).
 */
import { getAudioDiagnostics, playFeedbackSound } from "./engine";

export function iniciarDiagnosticoDeAudio(): () => void {
  const painel = document.createElement("div");
  painel.setAttribute("data-diagnostico-audio", "");
  painel.style.cssText =
    "position:fixed;left:8px;top:8px;z-index:2147483647;max-width:min(92vw,360px);max-height:45vh;overflow:auto;" +
    "font:11px/1.35 ui-monospace,monospace;background:rgba(20,20,20,.88);color:#fff;border-radius:10px;padding:8px;" +
    "white-space:pre-wrap";
  const texto = document.createElement("div");
  const botoes = document.createElement("div");
  botoes.style.cssText = "display:flex;gap:6px;margin-top:6px;flex-wrap:wrap";

  function botao(rotulo: string, acao: () => void) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = rotulo;
    b.style.cssText = "background:#fff;color:#111;border-radius:6px;padding:4px 8px;font:inherit";
    b.addEventListener("click", acao);
    botoes.appendChild(b);
  }

  function relatorio(): string {
    const d = getAudioDiagnostics();
    const linhas = [
      `navegador: ${navigator.userAgent}`,
      `contexto: ${d.contexto} · taxa ${d.taxa ?? "-"} · habilitado ${d.habilitado} · visível ${d.visivel}`,
      `primeiro som tocado: ${d.primeiroSomTocado} · som no silencioso: ${d.somNoSilencioso} · audioSession: ${d.audioSession ?? "-"}`,
      `carregados: ${d.carregados.join(", ") || "-"}`,
      ...d.registros.slice(-40).map((r) => `${r.t}ms ${r.tipo} ${r.dados ? JSON.stringify(r.dados) : ""}`),
    ];
    return linhas.join("\n");
  }

  function pintar() {
    texto.textContent = relatorio();
  }

  botao("Testar som", () => {
    void playFeedbackSound("resposta-correta").then(pintar);
  });
  botao("Copiar diagnóstico", () => {
    void navigator.clipboard?.writeText(relatorio()).catch(() => {});
  });
  botao("Fechar", () => parar());

  painel.append(texto, botoes);
  document.body.appendChild(painel);
  pintar();
  const timer = window.setInterval(pintar, 1000);

  function parar() {
    window.clearInterval(timer);
    painel.remove();
  }
  return parar;
}
