import express from "express";
import { WEBHOOK_ROUTE_POSTS } from "src/config/config";
import { FRAME_IO_WEBHOOK_SECRET } from "src/config/env-vars";
import { ICONIK_CUSTOM_ACTION_URL_PATH } from "src/config/iconik-custom-action.js";
import {
  amqpChannel,
  CUSTOM_ACTION_MESSAGE_TYPE,
  TOPIC_NAME,
} from "src/utils/amqp.js";
import {
  frameIoWebhookSchema,
  iconikCustomActionPayloadSchema,
} from "src/utils/iconik-custom-action-payload-schema.js";
import { isSignatureValid } from "src/utils/signature";
import { ValidationError } from "yup";
import { iconikLimiter } from "./queues";
import { processWebhook } from "./webhook-processor";

export const apiRouter = express.Router();

apiRouter.post(ICONIK_CUSTOM_ACTION_URL_PATH, async (req, res) => {
  console.log("Received custom action request");
  const payload = await iconikCustomActionPayloadSchema.validate(req.body);
  amqpChannel.publish(
    TOPIC_NAME,
    CUSTOM_ACTION_MESSAGE_TYPE,
    Buffer.from(JSON.stringify(payload))
  );
  res.status(202).json({ status: "Accepted" });
});

apiRouter.post(WEBHOOK_ROUTE_POSTS, async (req, res) => {
  console.log("Received webhook");
  try {
    const payload = await frameIoWebhookSchema.validate(req.body);
    const isValid = await isSignatureValid(
      req.headers,
      FRAME_IO_WEBHOOK_SECRET,
      payload
    );

    if (!isValid) {
      console.error("Invalid signature");
      res.status(401).json({ status: "Unauthorized" });
      return;
    }

    console.log("Webhook is valid, signature is valid");

    iconikLimiter.schedule(async () => {
      await processWebhook(payload);
    });

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
