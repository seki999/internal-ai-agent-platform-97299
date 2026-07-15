import { PlatformLog } from "../types/domain";

/**
 * 機密値を含まない運用ログの表示用mockデータを提供する。
 * 実運用のApplication Insights接続を想定し、level/source/message/timestampの構造を維持する。
 */
export class LogService {
  /** 監視UIのlevel別表示を確認できるよう、INFOとWARNを混在させて返す。 */
  list(): PlatformLog[] {
    return [
      { id: "log-1", level: "INFO", source: "AgentService", message: "FAQ回答エージェントの実行が完了", timestamp: "2026-07-15T09:42:18.000Z" },
      { id: "log-2", level: "INFO", source: "ChatService", message: "chat_messages への保存が完了", timestamp: "2026-07-15T09:38:06.000Z" },
      { id: "log-3", level: "WARN", source: "AiEvaluation", message: "Local mock の応答時間が閾値へ接近", timestamp: "2026-07-15T09:31:44.000Z" },
      { id: "log-4", level: "INFO", source: "HealthCheck", message: "PostgreSQL / CosmosDB mock は正常", timestamp: "2026-07-15T09:30:00.000Z" },
    ];
  }
}
