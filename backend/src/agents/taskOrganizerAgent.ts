import { z } from "zod";
import { AgentDefinition } from "./types";

/**
 * 業務タスク整理エージェント。
 * 曖昧な依頼文を、実務で確認しやすい優先度付きタスクへ分解する。
 */
export const taskOrganizerAgent: AgentDefinition = {
  type: "task-organizer",
  inputSchema: z.object({
    text: z.string().min(5, "整理対象は5文字以上で入力してください"),
    dueDate: z.string().optional(),
  }),
  async execute(input) {
    const value = this.inputSchema.parse(input);
    return {
      summary: "依頼内容を3つの実行単位に整理しました。",
      tasks: [
        { title: "前提条件と関係者を確認", priority: "high", dueDate: value.dueDate ?? "未設定" },
        { title: "実施内容をレビュー", priority: "medium", dueDate: value.dueDate ?? "未設定" },
        { title: "結果を共有して記録", priority: "medium", dueDate: value.dueDate ?? "未設定" },
      ],
      originalText: value.text,
    };
  },
};
