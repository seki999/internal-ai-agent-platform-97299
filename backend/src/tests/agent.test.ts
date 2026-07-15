import { describe, expect, it } from "vitest";
import { BusinessRepository } from "../repositories/businessRepository";
import { AgentService } from "../services/agentService";

describe("AgentService", () => {
  it("FAQ agent を実行して履歴を保存する", async () => {
    const service = new AgentService(new BusinessRepository());
    const run = await service.run("agent-faq", { question: "申請フローを教えてください" });
    expect(run.status).toBe("completed");
    expect(run.output.sources).toHaveLength(2);
    expect(await service.listRuns()).toContainEqual(run);
  });

  it("入力 schema 違反を業務エラーとして返す", async () => {
    const service = new AgentService(new BusinessRepository());
    await expect(service.run("agent-summary", { content: "短い" })).rejects.toMatchObject({ statusCode: 400 });
  });
});
