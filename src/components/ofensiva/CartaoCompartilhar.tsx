/**
 * Cartão do marco para compartilhar (spec 50 §5.2.4): imagem feita no aparelho (canvas → PNG) com o número de dias, a
 * Foca e a marca. Sem nome, apelido, foto ou qualquer dado pessoal; nada vai ao servidor. "Compartilhar" usa a Web
 * Share API com arquivo; sem suporte, "Salvar imagem".
 */
import { Download, Share2 } from "lucide-react";
import { useState } from "react";
import { COPY } from "@/lib/copy";

const LADO = 1080;

function cor(nome: string, reserva: string): string {
  if (typeof document === "undefined") return reserva;
  const v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  return v || reserva;
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, falha) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = falha;
    img.src = src;
  });
}

/** Texto do cartão: só o número e a frase fixa (nunca dado pessoal). */
function textoDoCartao(dias: number): string[] {
  return [String(dias), COPY.ofensiva.marco.cartaoTexto(dias)];
}

async function gerarCartao(dias: number): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = LADO;
  canvas.height = LADO;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = cor("--mar", "#1f5eff");
  ctx.fillRect(0, 0, LADO, LADO);
  try {
    const foca = await carregarImagem("/branding/foca/expressoes/empolgada-320.png");
    ctx.drawImage(foca, LADO / 2 - 210, 120, 420, 420);
  } catch {
    /* sem a imagem, o cartão sai só com o texto */
  }
  const [numero, frase] = textoDoCartao(dias);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 220px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText(numero, LADO / 2, 760);
  ctx.font = "600 46px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(frase, LADO / 2, 850);
  ctx.font = "bold 40px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText("focaedu.com", LADO / 2, 980);
  return new Promise((ok) => canvas.toBlob((b) => ok(b), "image/png"));
}

export function CartaoCompartilhar({ dias }: { dias: number }) {
  const t = COPY.ofensiva.marco;
  const [ocupado, setOcupado] = useState(false);
  const podeCompartilhar = typeof navigator !== "undefined" && typeof navigator.canShare === "function";

  async function acao() {
    if (ocupado) return;
    setOcupado(true);
    try {
      const blob = await gerarCartao(dias);
      if (!blob) return;
      const arquivo = new File([blob], `foca-${dias}-dias.png`, { type: "image/png" });
      if (podeCompartilhar && navigator.canShare({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo] }).catch(() => {});
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = arquivo.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <button type="button" onClick={acao} disabled={ocupado} className="btn-outline px-3 text-[13px]" data-testid="compartilhar-marco">
      {podeCompartilhar ? <Share2 size={15} aria-hidden /> : <Download size={15} aria-hidden />}
      {podeCompartilhar ? t.compartilhar : t.salvarImagem}
    </button>
  );
}
