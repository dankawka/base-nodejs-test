import { FrameClient } from "../utils/frame-io-client";
import { IconikClient } from "../utils/iconik-client";
import { FrameIoWebhookPayload } from "../utils/iconik-custom-action-payload-schema";
import { getAssetCollection, getPostsCollection } from "../utils/mongo-db";
import { frameLimiter, iconikLimiter } from "./queues";

export const StrategiesFactory = (
  frameClient = FrameClient,
  iconikClient = IconikClient,
  assetsDb = getAssetCollection(),
  postsDb = getPostsCollection(),
) => {
  const addPost = async (payload: FrameIoWebhookPayload, timestamp: number) => {
    const comment = await frameLimiter.schedule(() =>
      frameClient.getComment(payload.resource.id),
    );

    if (!comment) {
      console.error("Comment not found");
      return;
    }

    const foundPair = await assetsDb.findOne({
      frameIoAssetId: comment.asset_id,
    });

    if (!foundPair) {
      console.error("Found no matching iconik segment, can't do anything");
      return;
    }

    const response = await iconikLimiter.schedule(() =>
      iconikClient.createSegment(foundPair.iconikAssetId, {
        drawing: null,
        has_drawing: false,
        metadata: {},
        segment_color: "",
        segment_text: comment.text,
        segment_type: "COMMENT",
        time_end_milliseconds: 0,
        time_start_milliseconds: 0,
      }),
    );

    if (!response) {
      throw new Error("Failed to create segment");
    }

    await postsDb.insertOne({
      frameIoCommentId: comment.id,
      iconikAssetId: foundPair.iconikAssetId,
      iconikSegmentId: response.id,
      lastUpdated: timestamp,
    });
  };

  const removePost = async (payload: FrameIoWebhookPayload) => {
    const foundPostsPair = await postsDb.findOne({
      frameIoCommentId: payload.resource.id,
    });

    if (!foundPostsPair) {
      console.error("Found no matching iconik segment, can't do anything");
      return;
    }

    await iconikLimiter.schedule(() =>
      iconikClient.deleteSegment(
        foundPostsPair.iconikAssetId,
        foundPostsPair.iconikSegmentId,
      ),
    );
    await postsDb.deleteOne({ frameIoCommentId: payload.resource.id });
  };

  const updatePost = async (
    payload: FrameIoWebhookPayload,
    timestamp: number,
  ) => {
    const postsPair = await postsDb.findOne({
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
      frameClient.getComment(payload.resource.id),
    );

    if (!comment) {
      console.error("Comment not found");
      return;
    }

    const foundPair = await assetsDb.findOne({
      frameIoAssetId: comment.asset_id,
    });

    if (!foundPair) {
      console.error("Found no matching iconik segment, can't do anything");
      return;
    }

    const response = await iconikLimiter.schedule(() =>
      iconikClient.updateSegment(
        foundPair.iconikAssetId,
        postsPair.iconikSegmentId,
        {
          drawing: null,
          has_drawing: false,
          metadata: {},
          segment_color: "",
          segment_text: comment.text,
          segment_type: "COMMENT",
          time_end_milliseconds: 0,
          time_start_milliseconds: 0,
        },
      ),
    );

    if (!response) {
      throw new Error("Failed to create segment");
    }

    await postsDb.updateOne(
      {
        _id: postsPair._id,
      },
      {
        $set: {
          lastUpdated: timestamp,
        },
      },
    );
  };

  return {
    addPost,
    removePost,
    updatePost,
  };
};

export const processWebhook = async (
  payload: FrameIoWebhookPayload,
  timestamp: number,
) => {
  const { addPost, removePost, updatePost } = StrategiesFactory();

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
