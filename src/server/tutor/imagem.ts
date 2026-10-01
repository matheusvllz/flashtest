/**
 * Foto do tutor (spec 48 T-48.2.5; 46 §E.7.4, T-08.4). O tipo vale pelo **conteúdo** (bytes mágicos), não pelo
 * que o cliente declara; limite de 2 MiB depois de decodificar. A foto nunca é guardada.
 */
import { TUTOR_FOTO_MAX_BYTES, type PedidoTutor } from "@/lib/tutor-contrato";

type Tipo = NonNullable<PedidoTutor["foto"]>["tipo"];

/** Tipo real pelo início do arquivo, ou `null` se não for JPEG, PNG nem WebP. */
export function tipoPeloConteudo(b: Uint8Array): Tipo | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a)
    return "image/png";
  const ascii = (i: number, n: number) => String.fromCharCode(...b.subarray(i, i + n));
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  return null;
}

/** Foto aceita (tipo conferido) ou `null` se for inválida: tipo falso, grande demais ou base64 quebrado. */
export function validarFoto(foto: NonNullable<PedidoTutor["foto"]>): { tipo: Tipo; base64: string; bytes: number } | null {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(foto.base64)) return null;
  const bytes = Buffer.from(foto.base64, "base64");
  if (bytes.length === 0 || bytes.length > TUTOR_FOTO_MAX_BYTES) return null;
  const real = tipoPeloConteudo(bytes);
  if (!real || real !== foto.tipo) return null;
  return { tipo: real, base64: foto.base64, bytes: bytes.length };
}
