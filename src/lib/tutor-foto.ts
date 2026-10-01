/**
 * Compressão da foto antes de enviar à Foca IA (spec 48 T-48.2.5; 46 §E.7.4, B-103): lado maior até 1.600 px,
 * JPEG ~0,8. A foto sai do aparelho só no pedido e nunca é guardada no servidor.
 */
import { TUTOR_FOTO_LADO_MAIOR, TUTOR_FOTO_MAX_BYTES, TUTOR_FOTO_QUALIDADE } from "@/lib/tutor-contrato";

/** Arquivo bruto aceito antes de comprimir (evita estourar a memória do celular). */
export const FOTO_BRUTA_MAX_BYTES = 15 * 1024 * 1024;

export type FotoComprimida = { ok: true; tipo: "image/jpeg"; base64: string; preview: string } | { ok: false; erro: "grande" | "ilegivel" };

/** Dimensões finais mantendo a proporção, com o lado maior no teto. */
export function dimensoesReduzidas(largura: number, altura: number, teto = TUTOR_FOTO_LADO_MAIOR): { largura: number; altura: number } {
  const maior = Math.max(largura, altura);
  if (maior <= teto) return { largura, altura };
  const f = teto / maior;
  return { largura: Math.round(largura * f), altura: Math.round(altura * f) };
}

async function decodificar(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  if (typeof createImageBitmap === "function") return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function paraDataUrl(blob: Blob): Promise<string> {
  return new Promise((ok, falha) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => falha(r.error);
    r.readAsDataURL(blob);
  });
}

export async function comprimirFoto(file: File): Promise<FotoComprimida> {
  if (file.size > FOTO_BRUTA_MAX_BYTES) return { ok: false, erro: "grande" };
  try {
    const img = await decodificar(file);
    const { largura, altura } = dimensoesReduzidas(img.width, img.height);
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { ok: false, erro: "ilegivel" };
    ctx.fillStyle = "#fff"; // PNG com transparência vira JPEG com fundo branco, não preto
    ctx.fillRect(0, 0, largura, altura);
    ctx.drawImage(img, 0, 0, largura, altura);
    for (const qualidade of [TUTOR_FOTO_QUALIDADE, 0.6, 0.45]) {
      const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", qualidade));
      if (!blob) return { ok: false, erro: "ilegivel" };
      if (blob.size <= TUTOR_FOTO_MAX_BYTES) {
        const preview = await paraDataUrl(blob);
        const base64 = preview.split(",")[1] ?? "";
        return base64 ? { ok: true, tipo: "image/jpeg", base64, preview } : { ok: false, erro: "ilegivel" };
      }
    }
    return { ok: false, erro: "grande" };
  } catch {
    return { ok: false, erro: "ilegivel" };
  }
}
