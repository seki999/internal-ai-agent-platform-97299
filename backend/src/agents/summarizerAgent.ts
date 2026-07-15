import { z } from "zod";
import { AgentDefinition } from "./types";

/**
 * データ要約エージェント。
 * 外部AIを呼ばずに、要点・示唆・次のアクションという出力契約を検証する。
 */
export const summarizerAgent: AgentDefinition = {
  type: "summarizer",
  inputSchema: z.object({
    content: z.string().min(10, "要約対象は10文字以上で入力してください"),
    maxPoints: z.number().int().min(1).max(5).optional(),
  }),
  async execute(input) {
    const value = this.inputSchema.parse(input);
    return {
      headline: "入力データの主要ポイントを抽出しました",
      keyPoints: [
        "業務上の重要事項を整理",
        "継続確認が必要な論点を特定",
        "次回アクションを明確化",
      ].slice(0, value.maxPoints ?? 3),
      insight: `全${value.content.length}文字を分析した mock 結果です。`,
      nextAction: "担当者による原文との照合を実施してください。",
    };
  },
};
