import axios from "axios";
import { Comment } from "src/utils/types";
import {
  FRAME_IO_ACCESS_TOKEN,
  FRAME_IO_READ_TOKEN,
} from "src/config/env-vars";

export const frameIoWriteClient = axios.create({
  baseURL: "https://api.frame.io/v2/",
  headers: {
    Authorization: `Bearer ${FRAME_IO_ACCESS_TOKEN}`,
  },
});

export const frameIoReadClient = axios.create({
  baseURL: "https://api.frame.io/v2/",
  headers: {
    Authorization: `Bearer ${FRAME_IO_READ_TOKEN}`,
  },
});

export const getComment = async (commentId: string) => {
  try {
    const response = await frameIoReadClient.get<Comment>(
      `/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get comment");
  }
};
