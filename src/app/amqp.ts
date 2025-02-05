import { iconikCustomActionUseCase } from "src/use-cases/iconik-custom-action-use-case.js";
import {
  amqpChannel,
  CUSTOM_ACTION_QUEUE_NAME,
} from "src/utils/amqp.js";
import {
  iconikCustomActionPayloadSchema,
} from "src/utils/iconik-custom-action-payload-schema.js";

await amqpChannel.consume(CUSTOM_ACTION_QUEUE_NAME, async (message) => {
  const payload = await iconikCustomActionPayloadSchema.validate(
    message!.content.toString()
  );
  await iconikCustomActionUseCase(payload);
});



