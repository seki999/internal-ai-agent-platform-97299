import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { faqAgent } from "../agents/faqAgent";
import { summarizerAgent } from "../agents/summarizerAgent";
import { taskOrganizerAgent } from "../agents/taskOrganizerAgent";
import { AgentDefinition } from "../agents/types";
import { BusinessRepository } from "../repositories/businessRepository";
import { AgentRun } from "../types/domain";

// Agent種別から実装を引くregistry。新規Agentはここへ追加するだけで共通実行フローを再利用できる。
const definitions = new Map<string, AgentDefinition>([
  [faqAgent.type, faqAgent],
  [taskOrganizerAgent.type, taskOrganizerAgent],
  [summarizerAgent.type, summarizerAgent],
]);

/**
 * AIエージェントの検索・作成・実行と履歴保存を一つの業務フローとして管理する。
 * 個別Agentの実装詳細とHTTP層を分離し、Agent追加や外部AI接続時の変更範囲を限定する。
 */
export class AgentService {
  constructor(private readonly repository: BusinessRepository) {}

  /** 管理画面へAgent catalogを返す。 */
  list() {
    return this.repository.listAgents();
  }

  /** 実行対象または詳細表示対象のAgentを取得する。 */
  get(id: string) {
    return this.repository.getAgent(id);
  }

  /** 新規Agentをdraft状態で作成し、後続の詳細設計・有効化へつなぐ。 */
  create(input: { name: string; description: string }) {
    return this.repository.createAgent(input);
  }

  /** Dashboardと監視画面で共有する実行履歴を取得する。 */
  listRuns() {
    return this.repository.listRuns();
  }

  /**
   * Agentの存在確認、入力検証、mock実行、履歴保存を一つのトランザクション境界として扱う。
   * このsampleでは外部AIを呼ばないが、runの構造は実サービス接続後も変えない想定である。
   */
  async run(agentId: string, input: Record<string, unknown>): Promise<AgentRun> {
    const agent = await this.repository.getAgent(agentId);
    if (!agent) throw Object.assign(new Error("エージェントが見つかりません"), { statusCode: 404 });
    const started = Date.now();
    const logs = ["入力を受信", "入力スキーマ検証を開始"];
    try {
      // 登録済み3種は固有ロジック、UIから作ったcustom Agentは安全な汎用mockを実行する。
      const definition = definitions.get(agent.type);
      const output = definition
        ? await definition.execute(input)
        : { message: "カスタムエージェントの mock 実行が完了しました。", input };
      logs.push("mock AI Service 応答を受信", "実行履歴を保存");
      // latencyに最低値を設け、画面上で実サービスを想定した指標表示を確認できるようにする。
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
      // Zodの内部構造は公開せず、利用者が修正できる最初の検証メッセージだけを返す。
      const message = error instanceof ZodError ? error.issues[0]?.message : "エージェント実行に失敗しました";
      throw Object.assign(new Error(message), { statusCode: 400 });
    }
  }
}
