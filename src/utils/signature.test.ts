import crypto from "crypto";
import { isSignatureValid } from "./signature"; // Adjust the import path as needed

describe("isSignatureValid", () => {
  const secret = "test_secret";
  const payload = {
    project: { id: "123" },
    resource: { id: "456", type: "example" },
    team: { id: "789" },
    type: "event_type",
    user: { id: "user_123" },
  };

  const generateValidSignature = (
    timestamp: number,
    body: object,
    secret: string,
  ): string => {
    const stringBody = JSON.stringify(body);
    const hmac = crypto.createHmac("sha256", secret);
    return `v0=${hmac.update(`v0:${timestamp}:${stringBody}`).digest("hex")}`;
  };

  it("should return true for a valid signature", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateValidSignature(timestamp, payload, secret);

    const isValid = await isSignatureValid(
      signature,
      timestamp,
      secret,
      payload,
    );
    expect(isValid).toBe(true);
  });

  it("should return false for an invalid signature", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const invalidSignature = "v0=invalid_signature";
    const isValid = await isSignatureValid(
      invalidSignature,
      timestamp,
      secret,
      payload,
    );
    expect(isValid).toBe(false);
  });

  it("should return false if the timestamp is expired", async () => {
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 6 * 60; // 6 minutes ago
    const signature = generateValidSignature(expiredTimestamp, payload, secret);
    const isValid = await isSignatureValid(
      signature,
      expiredTimestamp,
      secret,
      payload,
    );
    expect(isValid).toBe(false);
  });

  it("should return false if the secret is incorrect", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const wrongSecret = "wrong_secret";
    const signature = generateValidSignature(timestamp, payload, wrongSecret);
    const isValid = await isSignatureValid(
      signature,
      timestamp,
      secret,
      payload,
    );
    expect(isValid).toBe(false);
  });

  it("should return false if the payload is modified", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateValidSignature(timestamp, payload, secret);

    const modifiedPayload = { ...payload, user: { id: "modified_user" } };
    const isValid = await isSignatureValid(
      signature,
      timestamp,
      secret,
      modifiedPayload,
    );
    expect(isValid).toBe(false);
  });
});
