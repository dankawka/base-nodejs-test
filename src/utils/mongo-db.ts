import { MongoClient, Db, Collection } from "mongodb";
import { MONGO_URI } from "../config/env-vars";

let mongoDb: MongoClient;
let db: Db;
let assetCollection: Collection<{
  frameIoAssetId: string;
  iconikAssetId: string;
}>;
let postsCollection: Collection<{
  frameIoCommentId: string;
  iconikAssetId: string;
  iconikSegmentId: string;
  lastUpdated: number;
}>;

export const connectDB = async () => {
  if (!mongoDb) {
    mongoDb = await MongoClient.connect(MONGO_URI);
    db = mongoDb.db("base-nodejs-test");
    assetCollection = db.collection("assets");
    postsCollection = db.collection("posts");
  }
};

export const getDB = () => {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db;
};

export const getAssetCollection = () => {
  if (!assetCollection)
    throw new Error("Database not initialized. Call connectDB first.");
  return assetCollection;
};

export const getPostsCollection = () => {
  if (!postsCollection)
    throw new Error("Database not initialized. Call connectDB first.");
  return postsCollection;
};
