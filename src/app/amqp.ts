import { iconikCustomActionUseCase } from "src/use-cases/iconik-custom-action-use-case.js";
import { amqpChannel, CUSTOM_ACTION_QUEUE_NAME } from "src/utils/amqp.js";
import { iconikCustomActionPayloadSchema } from "src/utils/iconik-custom-action-payload-schema.js";

await amqpChannel.consume(CUSTOM_ACTION_QUEUE_NAME, async (message) => {
  if (message === null) {
    return;
  }

  console.log("Processing message from queue", CUSTOM_ACTION_QUEUE_NAME);
  const payload = await iconikCustomActionPayloadSchema.validate(
    message!.content.toString()
  );

  console.log(
    "Processing message from queue",
    CUSTOM_ACTION_QUEUE_NAME,
    " payload is valid"
  );
  await iconikCustomActionUseCase(payload);
  amqpChannel.ack(message);
  console.log("Message successfully processed and acknowledged");
});

setInterval(async () => {
  const queueStatus = await amqpChannel.checkQueue(CUSTOM_ACTION_QUEUE_NAME);
  console.log("Queue status", CUSTOM_ACTION_QUEUE_NAME, queueStatus);
}, 1000);
