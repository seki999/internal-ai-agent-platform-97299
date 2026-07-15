import { describe, expect, it } from "vitest";
import { AiService } from "../services/aiService";

describe("AiService", () => {
  it("評価結果に latency・token・score と保存状態を含める", () => {
    const result = new AiService().evaluate("会議内容を要約してください", "Azure OpenAI mock");
    expect(result.saved).toBe(true);
    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.tokenUsage.prompt).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThanOrEqual(1);
  });
});
