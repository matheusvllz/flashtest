/**
 * Tipos mínimos da biblioteca `web-push` (spec 50 §5.2.5; dependência aprovada, versão fixada, só no servidor). Só o
 * que `push.ts` usa — sem `@types/web-push`, que seria outra dependência.
 */
declare module "web-push" {
  export interface PushSubscription {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }
  export interface RequestOptions {
    vapidDetails?: { subject: string; publicKey: string; privateKey: string };
    TTL?: number;
    urgency?: "very-low" | "low" | "normal" | "high";
    topic?: string;
    timeout?: number;
  }
  export interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }
  export class WebPushError extends Error {
    statusCode: number;
  }
  export function sendNotification(subscription: PushSubscription, payload?: string | Buffer | null, options?: RequestOptions): Promise<SendResult>;
  export function generateVAPIDKeys(): { publicKey: string; privateKey: string };
  const webpush: {
    sendNotification: typeof sendNotification;
    generateVAPIDKeys: typeof generateVAPIDKeys;
  };
  export default webpush;
}
