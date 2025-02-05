import { array, date, InferType, object, string } from "yup";

export const iconikCustomActionPayloadSchema = object({
  user_id: string().uuid().required(),
  system_domain_id: string().uuid(),
  context: string().oneOf(["ASSET"]),
  action_id: string(),
  asset_ids: array(string().uuid().required()).required(),
  collection_ids: array(string().uuid()),
  saved_search_ids: array(string().uuid()),
  date_created: date().required(),
  auth_token: string().strip(),
}).json();

export const frameIoWebhookSchema = object({
  project: object({
    id: string().uuid().required(),
  }).required(),
  resource: object({
    id: string().uuid().required(),
    type: string().oneOf(["comment"]).required(),
  }).required(),
  team: object({
    id: string().uuid().required(),
  }).required(),
  type: string().oneOf(["comment.created", "comment.deleted"]).required(),
  user: object({
    id: string().uuid().required(),
  }).required(),
});

export type FrameIoWebhookPayload = InferType<typeof frameIoWebhookSchema>;

export const frameIoWebhookHeadersSchema = object({
  "x-frameio-signature": string().required(),
  "x-frameio-request-timestamp": string().required(),
});

export type IconikCustomActionPayload = InferType<
  typeof iconikCustomActionPayloadSchema
>;
