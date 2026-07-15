/**
 * Frontendで利用するAPIレスポンス型。
 * Backendのdomain型と同じ項目名を維持し、画面側で不要な変換処理を増やさない。
 * 実運用ではOpenAPI等からの自動生成へ置き換えることも想定できる。
 */
export interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  inputSchema: Record<string, string>;
  status: "active" | "draft";
  createdAt: string;
}

/** Agent実行コンソールと履歴テーブルで共有する実行結果。 */
export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "completed" | "failed";
  latencyMs: number;
  logs: string[];
  createdAt: string;
}

/** Dashboard APIが一回のrequestで返す集約データ。 */
export interface Dashboard {
  metrics: {
    agentCount: number;
    todayRuns: number;
    chatSessions: number;
    evaluationStatus: string;
  };
  recentRuns: AgentRun[];
  serviceHealth: { name: string; status: string; latencyMs: number }[];
}

/** 左側の会話一覧へ表示するchat session。 */
export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** user/assistantを区別して描画するchat message。 */
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

/** 監視画面へ表示可能な、機密情報を含まない構造化ログ。 */
export interface PlatformLog {
  id: string;
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
  timestamp: string;
}
