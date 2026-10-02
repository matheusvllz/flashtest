/**
 * Lembrete no aparelho (spec 50 §5.2.5, §0.3 C): detecção de suporte e assinatura de push pelo worker único `/sw.js`.
 * Só a interface usa isto; a regra de quando enviar mora no servidor.
 *
 * - Android (Chrome, Edge, Firefox) e computador: push no navegador.
 * - iPhone/iPad (iOS 16.4+): só com o Foca adicionado à Tela de Início (fora dele, o Safari não oferece push).
 * - Sem `PushManager`: sem suporte.
 */
import { modoOfflineLigado, registrarWorker, registroDoWorker } from "@/lib/offline/service-worker";
import { abertoComoApp, ehIOS } from "@/lib/plataforma";

export type SuporteDoLembrete = "ok" | "iphone-fora-do-app" | "sem-suporte";

export function suporteDoLembrete(): SuporteDoLembrete {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "sem-suporte";
  const temPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (ehIOS() && !abertoComoApp()) return "iphone-fora-do-app";
  return temPush ? "ok" : "sem-suporte";
}

export function permissaoDeNotificacao(): NotificationPermission | "indisponivel" {
  if (typeof Notification === "undefined") return "indisponivel";
  return Notification.permission;
}

/** Pede a permissão. Chamar direto no toque (o Safari só aceita o pedido dentro do gesto). */
export async function pedirPermissao(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export interface DadosDaAssinatura {
  endpoint: string;
  p256dh: string;
  auth: string;
}

function dados(s: PushSubscription): DadosDaAssinatura | null {
  const j = s.toJSON();
  if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) return null;
  return { endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth };
}

/** Assinatura que este aparelho já tem (sem pedir nada ao aluno). */
export async function assinaturaAtual(): Promise<DadosDaAssinatura | null> {
  const reg = await registroDoWorker();
  if (!reg || !("pushManager" in reg)) return null;
  const s = await reg.pushManager.getSubscription().catch(() => null);
  return s ? dados(s) : null;
}

function chaveEmBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const b64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bruto.length));
  for (let i = 0; i < bruto.length; i++) out[i] = bruto.charCodeAt(i);
  return out;
}

/** Registra o worker (se preciso) e assina o push com a chave pública do servidor. */
export async function assinar(chavePublica: string): Promise<DadosDaAssinatura | null> {
  const reg = await registrarWorker();
  if (!reg) return null;
  const chave = chaveEmBytes(chavePublica);
  const antiga = await reg.pushManager.getSubscription().catch(() => null);
  if (antiga) {
    // Assinatura feita com outra chave (chaves trocadas no servidor) não serve: cancela e assina de novo.
    const daAntiga = antiga.options.applicationServerKey ? new Uint8Array(antiga.options.applicationServerKey) : null;
    const mesma = !!daAntiga && daAntiga.length === chave.length && daAntiga.every((b, i) => b === chave[i]);
    if (mesma) return dados(antiga);
    await antiga.unsubscribe().catch(() => false);
  }
  return dados(await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chave }));
}

/** Cancela a assinatura deste aparelho; sem estudo offline ligado, o worker também sai. */
export async function cancelarAssinatura(): Promise<void> {
  const reg = await registroDoWorker();
  if (!reg) return;
  const s = await reg.pushManager?.getSubscription().catch(() => null);
  if (s) await s.unsubscribe().catch(() => false);
  if (!(await modoOfflineLigado())) await reg.unregister().catch(() => false);
}
