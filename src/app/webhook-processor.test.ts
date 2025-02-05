import { StrategiesFactory } from "./webhook-processor"; // Adjust import path

const mockFrameClient = {
  getComment: jest.fn(),
};

const mockIconikClient = {
  createSegment: jest.fn(),
  deleteSegment: jest.fn(),
  updateSegment: jest.fn(),
};

const assets = {
  findOne: jest.fn(),
};
const posts = {
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
};

describe("Webhook Handlers", () => {
  const timestamp = Date.now();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add a post when comment exists and matching asset is found", async () => {
    mockFrameClient.getComment.mockResolvedValue({
      id: "comment123",
      asset_id: "asset456",
      text: "Test comment",
    });
    mockIconikClient.createSegment.mockResolvedValue({ id: "segment789" });

    assets.findOne.mockResolvedValue({
      frameIoAssetId: "asset456",
      iconikAssetId: "asset123",
    });

    const { addPost } = StrategiesFactory(
      mockFrameClient,
      mockIconikClient,
      assets as unknown as any,
      posts as unknown as any,
    );

    await addPost(
      {
        project: {
          id: "a583dba7-47b8-45ec-9b5e-bee64e0f35e7",
        },
        resource: {
          id: "comment123",
          type: "comment",
        },
        team: {
          id: "4e1d5abe-59cf-4eb6-a36f-af8bebd60c01",
        },
        type: "comment.created",
        user: {
          id: "2dcee316-abb1-4d47-b2ba-aeed1f347990",
        },
      },
      timestamp,
    );

    expect(mockFrameClient.getComment).toHaveBeenCalledWith("comment123");
    expect(assets.findOne).toHaveBeenCalledWith({ frameIoAssetId: "asset456" });
    expect(mockIconikClient.createSegment).toHaveBeenCalledWith("asset123", {
      drawing: null,
      has_drawing: false,
      metadata: {},
      segment_color: "",
      segment_text: "Test comment",
      segment_type: "COMMENT",
      time_end_milliseconds: 0,
      time_start_milliseconds: 0,
    });
  });

  it("should remove a post when matching segment is found", async () => {
    mockIconikClient.deleteSegment.mockResolvedValue(true);

    const { removePost } = StrategiesFactory(
      mockFrameClient,
      mockIconikClient,
      assets as unknown as any,
      posts as unknown as any,
    );

    posts.findOne.mockResolvedValue({
      frameIoCommentId: "comment123",
      iconikAssetId: "asset123",
      iconikSegmentId: "segment789",
      lastUpdated: timestamp,
    });

    await removePost({
      project: {
        id: "a583dba7-47b8-45ec-9b5e-bee64e0f35e7",
      },
      resource: {
        id: "050cb887-caac-4aff-a2f2-1db0326e2e8d",
        type: "comment",
      },
      team: {
        id: "4e1d5abe-59cf-4eb6-a36f-af8bebd60c01",
      },
      type: "comment.deleted",
      user: {
        id: "2dcee316-abb1-4d47-b2ba-aeed1f347990",
      },
    });

    expect(mockIconikClient.deleteSegment).toHaveBeenCalledWith(
      "asset123",
      "segment789",
    );
  });

  it("should not call iconik if no pair is found", async () => {
    mockIconikClient.deleteSegment.mockResolvedValue(true);

    const { updatePost } = StrategiesFactory(
      mockFrameClient,
      mockIconikClient,
      assets as unknown as any,
      posts as unknown as any,
    );

    posts.findOne.mockResolvedValue(null);

    await updatePost(
      {
        project: {
          id: "a583dba7-47b8-45ec-9b5e-bee64e0f35e7",
        },
        resource: {
          id: "050cb887-caac-4aff-a2f2-1db0326e2e8d",
          type: "comment",
        },
        team: {
          id: "4e1d5abe-59cf-4eb6-a36f-af8bebd60c01",
        },
        type: "comment.deleted",
        user: {
          id: "2dcee316-abb1-4d47-b2ba-aeed1f347990",
        },
      },
      timestamp,
    );

    expect(mockIconikClient.deleteSegment).not.toHaveBeenCalled();
  });

  it("should not call iconik if last update time in database if > than webhook timestamp", async () => {
    mockIconikClient.deleteSegment.mockResolvedValue(true);

    const { updatePost } = StrategiesFactory(
      mockFrameClient,
      mockIconikClient,
      assets as unknown as any,
      posts as unknown as any,
    );

    posts.findOne.mockResolvedValue({
      frameIoCommentId: "comment123",
      iconikAssetId: "asset123",
      iconikSegmentId: "segment789",
      lastUpdated: timestamp + 1,
    });

    await updatePost(
      {
        project: {
          id: "a583dba7-47b8-45ec-9b5e-bee64e0f35e7",
        },
        resource: {
          id: "050cb887-caac-4aff-a2f2-1db0326e2e8d",
          type: "comment",
        },
        team: {
          id: "4e1d5abe-59cf-4eb6-a36f-af8bebd60c01",
        },
        type: "comment.deleted",
        user: {
          id: "2dcee316-abb1-4d47-b2ba-aeed1f347990",
        },
      },
      timestamp,
    );

    expect(mockIconikClient.deleteSegment).not.toHaveBeenCalled();
  });

  it("update should do nothing if no matching pair is found", async () => {
    mockFrameClient.getComment.mockResolvedValue({
      id: "comment123",
      asset_id: "asset456",
      text: "Updated comment",
    });

    const { updatePost } = StrategiesFactory(
      mockFrameClient,
      mockIconikClient,
      assets as unknown as any,
      posts as unknown as any,
    );

    posts.findOne.mockResolvedValue(null);

    await updatePost(
      {
        project: {
          id: "a583dba7-47b8-45ec-9b5e-bee64e0f35e7",
        },
        resource: {
          id: "20e1600f-8f4a-49db-8062-5a2a10c39ba5",
          type: "comment",
        },
        team: {
          id: "4e1d5abe-59cf-4eb6-a36f-af8bebd60c01",
        },
        type: "comment.updated",
        user: {
          id: "2dcee316-abb1-4d47-b2ba-aeed1f347990",
        },
      },
      timestamp,
    );

    expect(mockFrameClient.getComment).not.toHaveBeenCalled();
    expect(mockIconikClient.updateSegment).not.toHaveBeenCalled();
  });

  it("should update a post when matching segment is found", async () => {
    mockFrameClient.getComment.mockResolvedValue({
      id: "comment123",
      asset_id: "asset456",
      text: "Updated comment",
    });
    mockIconikClient.updateSegment.mockResolvedValue({});

    const { updatePost } = StrategiesFactory(
      mockFrameClient,
      mockIconikClient,
      assets as unknown as any,
      posts as unknown as any,
    );

    posts.findOne.mockResolvedValue({
      frameIoCommentId: "comment123",
      iconikAssetId: "asset123",
      iconikSegmentId: "segment789",
      lastUpdated: timestamp - 10,
      _id: "123",
    });

    await updatePost(
      {
        project: {
          id: "a583dba7-47b8-45ec-9b5e-bee64e0f35e7",
        },
        resource: {
          id: "20e1600f-8f4a-49db-8062-5a2a10c39ba5",
          type: "comment",
        },
        team: {
          id: "4e1d5abe-59cf-4eb6-a36f-af8bebd60c01",
        },
        type: "comment.updated",
        user: {
          id: "2dcee316-abb1-4d47-b2ba-aeed1f347990",
        },
      },
      timestamp,
    );

    expect(mockFrameClient.getComment).toHaveBeenCalled();
    expect(mockIconikClient.updateSegment).toHaveBeenCalled();
    expect(posts.updateOne).toHaveBeenCalledWith(
      { _id: "123" },
      {
        $set: { lastUpdated: timestamp },
      },
    );
  });
});
