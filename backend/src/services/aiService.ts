import { randomUUID } from "node:crypto";

export interface EvaluationResult {
  id: string;
  provider: string;
  response: string;
  latencyMs: number;
  tokenUsage: { prompt: number; completion: number };
  score: number;
  saved: true;
  createdAt: string;
}

/**
 * AIサービスの比較検証を模擬する。
 * latency・token・score はUI/保存契約を確認するための再現可能な mock 値である。
 */
export class AiService {
  private readonly results: EvaluationResult[] = [];

  evaluate(prompt: string, provider: string): EvaluationResult {
    const promptTokens = Math.max(8, Math.ceil(prompt.length / 2.4));
    const result: EvaluationResult = {
      id: randomUUID(),
      provider,
      response: `${provider} による検証用 mock 応答です。入力意図を保持し、社内利用を想定した簡潔な回答形式を確認しました。`,
      latencyMs: provider === "Azure OpenAI mock" ? 742 : 318,
      tokenUsage: { prompt: promptTokens, completion: 64 },
      score: provider === "Azure OpenAI mock" ? 4.7 : 4.2,
      saved: true,
      createdAt: new Date().toISOString(),
    };
    this.results.push(result);
    return result;
  }

  count() {
    return this.results.length;
  }
}
