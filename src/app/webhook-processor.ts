import { getComment } from "src/utils/frame-io-client";
import { createSegment, deleteSegment } from "src/utils/iconik-client";
import { FrameIoWebhookPayload } from "src/utils/iconik-custom-action-payload-schema";
import { postsCollection } from "src/utils/mongo-db";

const addPost = async (payload: FrameIoWebhookPayload) => {
  const assetId = "5e2b5444-e395-11ef-9cf6-1214703ca5ea";
  const comment = await getComment(payload.resource.id);

  if (!comment) {
    console.error("Comment not found");
    return;
  }

  const response = await createSegment(assetId, {
    drawing: null,
    has_drawing: false,
    metadata: {},
    segment_color: "",
    segment_text: comment.text,
    segment_type: "COMMENT",
    time_end_milliseconds: 0,
    time_start_milliseconds: 0,
  });

  if (!response) {
    throw new Error("Failed to create segment");
  }

  await postsCollection.insertOne({
    frameIoCommentId: comment.id,
    iconikSegmentId: response.id,
  });
};

const removePost = async (payload: FrameIoWebhookPayload) => {
  const assetId = "5e2b5444-e395-11ef-9cf6-1214703ca5ea";

  const foundPair = await postsCollection.findOne({
    frameIoCommentId: payload.resource.id,
  });

  if (!foundPair) {
    console.error("Found no matching iconik segment, can't do anything");
    return;
  }

  await deleteSegment(assetId, foundPair.iconikSegmentId);
  await postsCollection.deleteOne({ frameIoCommentId: payload.resource.id });
};

export const processWebhook = async (payload: FrameIoWebhookPayload) => {
  const strategyMap = {
    "comment.created": addPost,
    "comment.deleted": removePost,
  };

  const strategy = strategyMap[payload.type];

  console.log(`Processing ${payload.type} webhook`);

  if (!strategy) {
    console.error("Unsupported action type");
    return;
  }

  await strategy(payload);
};
