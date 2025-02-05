import axios from "axios";
import { ICONIK_APP_ID, ICONIK_AUTH_TOKEN } from "../config/env-vars";
import { IconikPostPayload, IconikSegment } from "./types";

export const iconikClient = axios.create({
  baseURL: "https://app.iconik.io/API/",
  headers: {
    "App-Id": ICONIK_APP_ID,
    "Auth-Token": ICONIK_AUTH_TOKEN,
  },
});

const createSegment = async (assetId: string, payload: IconikPostPayload) => {
  try {
    const url = `assets/v1/assets/${assetId}/segments/`;
    const response = await iconikClient.post<IconikSegment>(url, payload);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create segment");
  }
};

const deleteSegment = async (assetId: string, segmentId: string) => {
  try {
    const url = `assets/v1/assets/${assetId}/segments/${segmentId}?index_immediately=true`;
    const response = await iconikClient.patch(url, { status: "DELETED" });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete segment");
  }
};

const updateSegment = async (
  assetId: string,
  segmentId: string,
  payload: IconikPostPayload,
) => {
  try {
    const url = `assets/v1/assets/${assetId}/segments/${segmentId}?index_immediately=true`;
    const response = await iconikClient.patch<IconikSegment>(url, payload);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create segment");
  }
};

export const IconikClient = {
  createSegment,
  deleteSegment,
  updateSegment,
};
