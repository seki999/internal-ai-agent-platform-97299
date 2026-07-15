import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { faqAgent } from "../agents/faqAgent";
import { summarizerAgent } from "../agents/summarizerAgent";
import { taskOrganizerAgent } from "../agents/taskOrganizerAgent";
import { AgentDefinition } from "../agents/types";
import { BusinessRepository } from "../repositories/businessRepository";
import { AgentRun } from "../types/domain";

const definitions = new Map<string, AgentDefinition>([
  [faqAgent.type, faqAgent],
  [taskOrganizerAgent.type, taskOrganizerAgent],
  [summarizerAgent.type, summarizerAgent],
]);

/** AIエージェントの検索・作成・実行と履歴保存を一つの業務フローとして管理する。 */
export class AgentService {
  constructor(private readonly repository: BusinessRepository) {}

  list() {
    return this.repository.listAgents();
  }

  get(id: string) {
    return this.repository.getAgent(id);
  }

  create(input: { name: string; description: string }) {
    return this.repository.createAgent(input);
  }

  listRuns() {
    return this.repository.listRuns();
  }

  async run(agentId: string, input: Record<string, unknown>): Promise<AgentRun> {
    const agent = await this.repository.getAgent(agentId);
    if (!agent) throw Object.assign(new Error("エージェントが見つかりません"), { statusCode: 404 });
    const started = Date.now();
    const logs = ["入力を受信", "入力スキーマ検証を開始"];
    try {
      const definition = definitions.get(agent.type);
      const output = definition
        ? await definition.execute(input)
        : { message: "カスタムエージェントの mock 実行が完了しました。", input };
      logs.push("mock AI Service 応答を受信", "実行履歴を保存");
      const run: AgentRun = {
        id: randomUUID(),
        agentId,
        agentName: agent.name,
        input,
        output,
        status: "completed",
        latencyMs: Math.max(Date.now() - started, 186),
        logs,
        createdAt: new Date().toISOString(),
      };
      await this.repository.saveRun(run);
      return run;
    } catch (error) {
      const message = error instanceof ZodError ? error.issues[0]?.message : "エージェント実行に失敗しました";
      throw Object.assign(new Error(message), { statusCode: 400 });
    }
  }
}
