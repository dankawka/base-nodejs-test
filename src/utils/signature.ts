import crypto, { sign } from "crypto";
import { IncomingHttpHeaders } from "http";
import { frameIoWebhookHeadersSchema } from "./iconik-custom-action-payload-schema";

// Define types for the payload structure
interface WebhookPayload {
  project: { id: string };
  resource: { id: string; type: string };
  team: { id: string };
  type: string;
  user: { id: string };
}

export const isSignatureValid = async (
  signature: string,
  timestamp: number,
  secret: string,
  body: WebhookPayload
): Promise<boolean> => {
  

  const currentTimeUTC: number = new Date().getTime();
  const currentTimestamp: number = currentTimeUTC / 1000;
  const minutes: number = 5;
  const expired: boolean = currentTimestamp - timestamp > minutes * 60;

  if (expired) {
    return false;
  }

  const stringBody = JSON.stringify(body);
  const hmac = crypto.createHmac("sha256", secret);
  const generateSignature: string = hmac
    .update(`v0:${timestamp}:${stringBody}`)
    .digest("hex");

  return signature === `v0=${generateSignature}`;
};
