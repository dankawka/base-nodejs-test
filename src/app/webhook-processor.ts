import { getComment } from "src/utils/frame-io-client";
import { createSegment, deleteSegment } from "src/utils/iconik-client";
import { FrameIoWebhookPayload } from "src/utils/iconik-custom-action-payload-schema";
import { assetCollection, postsCollection } from "src/utils/mongo-db";
import { frameLimiter, iconikLimiter } from "./queues";

const addPost = async (payload: FrameIoWebhookPayload) => {
  const comment = await frameLimiter.schedule(() =>
    getComment(payload.resource.id)
  );

  if (!comment) {
    console.error("Comment not found");
    return;
  }

  const foundPair = await assetCollection.findOne({
    frameIoAssetId: comment.asset_id,
  });

  if (!foundPair) {
    console.error("Found no matching iconik segment, can't do anything");
    return;
  }

  const response = await iconikLimiter.schedule(() =>
    createSegment(foundPair.iconikAssetId, {
      drawing: null,
      has_drawing: false,
      metadata: {},
      segment_color: "",
      segment_text: comment.text,
      segment_type: "COMMENT",
      time_end_milliseconds: 0,
      time_start_milliseconds: 0,
    })
  );

  if (!response) {
    throw new Error("Failed to create segment");
  }

  await postsCollection.insertOne({
    frameIoCommentId: comment.id,
    iconikAssetId: foundPair.iconikAssetId,
    iconikSegmentId: response.id,
  });
};

const removePost = async (payload: FrameIoWebhookPayload) => {
  const foundCommentsPair = await postsCollection.findOne({
    frameIoCommentId: payload.resource.id,
  });

  if (!foundCommentsPair) {
    console.error("Found no matching iconik segment, can't do anything");
    return;
  }

  await iconikLimiter.schedule(() =>
    deleteSegment(
      foundCommentsPair.iconikAssetId,
      foundCommentsPair.iconikSegmentId
    )
  );
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
