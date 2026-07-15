import { AgentService } from "./agentService";
import { AiService } from "./aiService";
import { ChatService } from "./chatService";

/**
 * ダッシュボード用に複数Serviceの指標を集約するFacade。
 * FrontendがAgent・Chat・AI評価へ個別アクセスせず、一回のAPI呼び出しで初期表示できるようにする。
 */
export class PlatformService {
  constructor(
    private readonly agents: AgentService,
    private readonly chat: ChatService,
    private readonly ai: AiService,
  ) {}

  /** 独立した取得処理を並列実行し、Dashboard APIの待ち時間を抑える。 */
  async dashboard() {
    const [agents, runs, sessions] = await Promise.all([
      this.agents.list(),
      this.agents.listRuns(),
      this.chat.listSessions(),
    ]);
    // memory seedが少ない場合でも運用画面の情報設計を確認できるよう、表示用mock下限を設ける。
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
