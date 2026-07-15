import { z } from "zod";

/**
 * 個別エージェントが満たす共通契約。
 * 入力検証と実行処理を同じ定義に持たせることで、AgentService は種類ごとの
 * 分岐詳細を知らずにエージェントを選択・実行できる。
 */
export interface AgentDefinition {
  type: string;
  inputSchema: z.ZodTypeAny;
  execute(input: unknown): Promise<Record<string, unknown>>;
}
