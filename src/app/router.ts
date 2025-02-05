import express from "express";
import { WEBHOOK_ROUTE_POSTS } from "../config/config";
import {
  FRAME_IO_WEBHOOK_SECRET,
  ICONIK_ALLOWED_SOURCE,
} from "../config/env-vars";
import { ICONIK_CUSTOM_ACTION_URL_PATH } from "../config/iconik-custom-action.js";
import {
  amqpChannel,
  CUSTOM_ACTION_MESSAGE_TYPE,
  TOPIC_NAME,
} from "../utils/amqp.js";
import {
  frameIoWebhookHeadersSchema,
  frameIoWebhookSchema,
  iconikCustomActionPayloadSchema,
} from "../utils/iconik-custom-action-payload-schema.js";
import { isSignatureValid } from "../utils/signature";
import { ValidationError } from "yup";
import { processWebhook } from "./webhook-processor";

export const apiRouter = express.Router();

apiRouter.post(ICONIK_CUSTOM_ACTION_URL_PATH, async (req, res) => {
  try {
    console.log("Received custom action request");
    if (req.headers["source"] !== ICONIK_ALLOWED_SOURCE) {
      console.error("Invalid source");
      res.status(401).json({ status: "Unauthorized" });
      return;
    }

    const payload = await iconikCustomActionPayloadSchema.validate(req.body);
    amqpChannel.publish(
      TOPIC_NAME,
      CUSTOM_ACTION_MESSAGE_TYPE,
      Buffer.from(JSON.stringify(payload)),
    );
    res.status(202).json({ status: "Accepted" });
  } catch (error) {
    console.error(error);
    if (error instanceof ValidationError) {
      res.status(400).json({ status: "Bad Request", error: error.message });
      return;
    }
    res.status(500).json({ status: "Internal Server Error" });
  }
});

apiRouter.post(WEBHOOK_ROUTE_POSTS, async (req, res) => {
  console.log("Received webhook");
  try {
    const payload = await frameIoWebhookSchema.validate(req.body);

    const validHeaders = await frameIoWebhookHeadersSchema.validate(
      req.headers,
    );

    const signature = validHeaders["x-frameio-signature"];
    const timestamp = parseInt(validHeaders["x-frameio-request-timestamp"]);

    const isValid = await isSignatureValid(
      signature,
      timestamp,
      FRAME_IO_WEBHOOK_SECRET,
      payload,
    );

    if (!isValid) {
      console.error("Invalid signature");
      res.status(401).json({ status: "Unauthorized" });
      return;
    }

    console.log("Webhook is valid, signature is valid");
    await processWebhook(payload, timestamp);
    res.status(202).json({ status: "Accepted" });
  } catch (error) {
    console.error(error);
    if (error instanceof ValidationError) {
      res.status(400).json({ status: "Bad Request", error: error.message });
      return;
    }
    res.status(500).json({ status: "Internal Server Error" });
  }
});
