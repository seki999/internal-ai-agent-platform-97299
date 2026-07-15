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
  // 保存結果を画面上で確認するためのインメモリ領域。本番では専用Repositoryへ置き換える。
  private readonly results: EvaluationResult[] = [];

  /**
   * 同一promptをprovider間で比較できる評価結果を生成・保存する。
   * mock値はproviderごとに固定し、テストやスクリーンショットの再現性を優先する。
   */
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

  /** Dashboard上で評価実施済みか判定するため、保存済み件数だけを公開する。 */
  count() {
    return this.results.length;
  }
}
