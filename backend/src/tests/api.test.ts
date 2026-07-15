import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

describe("REST API", () => {
  const app = createApp();

  it("health と dashboard を取得できる", async () => {
    await request(app).get("/api/health").expect(200).expect(({ body }) => {
      expect(body.status).toBe("ok");
    });
    await request(app).get("/api/dashboard").expect(200).expect(({ body }) => {
      expect(body.metrics.agentCount).toBeGreaterThanOrEqual(3);
    });
  });

  it("不正な agent 作成入力を 400 にする", async () => {
    await request(app).post("/api/agents").send({ name: "x", description: "短い" }).expect(400);
  });

  it("chat session と message を保存する", async () => {
    const session = await request(app).post("/api/chat/sessions").send({ title: "APIテスト" }).expect(201);
    const result = await request(app)
      .post(`/api/chat/sessions/${session.body.id}/messages`)
      .send({ content: "操作手順を教えてください" })
      .expect(201);
    expect(result.body.assistant.role).toBe("assistant");
  });
});
