import { z } from "zod";
import { AgentDefinition } from "./types";

/**
 * FAQ回答エージェント。
 * 本番の検索拡張生成を模擬し、参照元と確信度を含む安全な固定応答を返す。
 */
export const faqAgent: AgentDefinition = {
  type: "faq",
  inputSchema: z.object({
    question: z.string().min(3, "質問は3文字以上で入力してください"),
    category: z.string().optional(),
  }),
  async execute(input) {
    const value = this.inputSchema.parse(input);
    return {
      answer: `「${value.question}」について、社内ナレッジを確認した想定の mock 回答です。担当部門の最新手順も併せて確認してください。`,
      sources: ["社内手続きガイド / 第3章", "FAQナレッジ / 更新版"],
      confidence: 0.91,
    };
  },
};
