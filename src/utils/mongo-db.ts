import { MongoClient } from "mongodb";
import { MONGO_URI } from "src/config/env-vars";

export const mongoDb = await MongoClient.connect(MONGO_URI);
export const db = mongoDb.db("base-nodejs-test");

export const assetCollection = db.collection("assets");
export const postsCollection = db.collection<{
  frameIoCommentId: string;
  iconikSegmentId: string;
}>("posts");
