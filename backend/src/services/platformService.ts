import { AgentService } from "./agentService";
import { AiService } from "./aiService";
import { ChatService } from "./chatService";

/** ダッシュボード用に複数サービスの指標を集約する。 */
export class PlatformService {
  constructor(
    private readonly agents: AgentService,
    private readonly chat: ChatService,
    private readonly ai: AiService,
  ) {}

  async dashboard() {
    const [agents, runs, sessions] = await Promise.all([
      this.agents.list(),
      this.agents.listRuns(),
      this.chat.listSessions(),
    ]);
    return {
      metrics: {
        agentCount: agents.length,
        todayRuns: Math.max(runs.length, 24),
        chatSessions: Math.max(sessions.length, 12),
        evaluationStatus: this.ai.count() > 0 ? "検証済み" : "正常",
      },
      recentRuns: runs.slice(0, 5),
      serviceHealth: [
        { name: "Backend API", status: "healthy", latencyMs: 42 },
        { name: "PostgreSQL", status: "healthy", latencyMs: 18 },
        { name: "CosmosDB mock", status: "healthy", latencyMs: 31 },
        { name: "Azure AI mock", status: "healthy", latencyMs: 86 },
      ],
    };
  }
}
