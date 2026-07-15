import { describe, expect, it } from "vitest";
import { BusinessRepository } from "../repositories/businessRepository";
import { AgentService } from "../services/agentService";

/** Agent固有ロジックと共通履歴保存をRepository境界から検証するunit test。 */
describe("AgentService", () => {
  it("FAQ agent を実行して履歴を保存する", async () => {
    const service = new AgentService(new BusinessRepository());
    const run = await service.run("agent-faq", { question: "申請フローを教えてください" });
    expect(run.status).toBe("completed");
    expect(run.output.sources).toHaveLength(2);
    expect(await service.listRuns()).toContainEqual(run);
  });

  it("入力 schema 違反を業務エラーとして返す", async () => {
    // ZodErrorがそのまま漏れず、HTTP層で扱えるstatusCodeへ変換されることを保証する。
    const service = new AgentService(new BusinessRepository());
    await expect(service.run("agent-summary", { content: "短い" })).rejects.toMatchObject({ statusCode: 400 });
  });
});
