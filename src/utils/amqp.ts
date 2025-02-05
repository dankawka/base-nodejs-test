import amqplib from "amqplib";

import { AMQP_URL } from "src/config/env-vars.js";

export const TOPIC_NAME = "base-nodejs-test";

export const CUSTOM_ACTION_MESSAGE_TYPE = "custom-action";
export const CUSTOM_ACTION_QUEUE_NAME = "custom-action.queue";

const connection = await amqplib.connect(AMQP_URL);
export const amqpChannel = await connection.createChannel();
await amqpChannel.assertExchange(TOPIC_NAME, "topic");

await amqpChannel.assertQueue(CUSTOM_ACTION_QUEUE_NAME);

await amqpChannel.bindQueue(
  CUSTOM_ACTION_QUEUE_NAME,
  TOPIC_NAME,
  CUSTOM_ACTION_MESSAGE_TYPE
);
