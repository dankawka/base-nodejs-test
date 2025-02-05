import { getComment } from "src/utils/frame-io-client";
import {
  createSegment,
  deleteSegment,
  updateSegment,
} from "src/utils/iconik-client";
import { FrameIoWebhookPayload } from "src/utils/iconik-custom-action-payload-schema";
import { assetCollection, postsCollection } from "src/utils/mongo-db";
import { frameLimiter, iconikLimiter } from "./queues";

const addPost = async (
  payload: FrameIoWebhookPayload,
  timestamp: number
) => {
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
    lastUpdated: timestamp,
  });
};

const removePost = async (payload: FrameIoWebhookPayload) => {
  const foundPostsPair = await postsCollection.findOne({
    frameIoCommentId: payload.resource.id,
  });

  if (!foundPostsPair) {
    console.error("Found no matching iconik segment, can't do anything");
    return;
  }

  await iconikLimiter.schedule(() =>
    deleteSegment(
      foundPostsPair.iconikAssetId,
      foundPostsPair.iconikSegmentId
    )
  );
  await postsCollection.deleteOne({ frameIoCommentId: payload.resource.id });
};

const updatePost = async (
  payload: FrameIoWebhookPayload,
  timestamp: number
) => {
  const postsPair = await postsCollection.findOne({
    frameIoCommentId: payload.resource.id,
  });

  if (!postsPair) {
    console.error("Found no matching iconik segment, can't do anything");
    return;
  }

  if (postsPair.lastUpdated > timestamp) {
    console.log("Comment is outdated, skipping");
    return;
  }

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
    updateSegment(foundPair.iconikAssetId, postsPair.iconikSegmentId, {
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

  await postsCollection.updateOne(
    {
      _id: postsPair._id,
    },
    {
      $set: {
        lastUpdated: timestamp,
      },
    }
  );
};

export const processWebhook = async (
  payload: FrameIoWebhookPayload,
  timestamp: number
) => {
  const strategyMap = {
    "comment.created": addPost,
    "comment.deleted": removePost,
    "comment.updated": updatePost,
  };

  const strategy = strategyMap[payload.type];

  console.log(`Processing ${payload.type} webhook`);

  if (!strategy) {
    console.error("Unsupported action type");
    return;
  }

  await strategy(payload, timestamp);
};
