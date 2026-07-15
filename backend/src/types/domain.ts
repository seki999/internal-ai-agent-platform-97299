/**
 * Backend 全体で共有するドメイン型定義。
 * HTTP や PostgreSQL 固有の型をここへ持ち込まず、Service と Repository の間で
 * 同じ業務用語を使えるようにすることで、保存先を切り替えても上位層へ影響させない。
 */
export type AgentType = "faq" | "task-organizer" | "summarizer" | "custom";
export type RunStatus = "completed" | "failed";

/** 管理画面と実行Serviceが参照するAIエージェント定義。 */
export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  inputSchema: Record<string, string>;
  status: "active" | "draft";
  createdAt: string;
}

/** 監査・再現確認に必要な入力、出力、処理ログをまとめた実行履歴。 */
export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: RunStatus;
  latencyMs: number;
  logs: string[];
  createdAt: string;
}

/** CosmosDB の chat_sessions document を表す。 */
export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** CosmosDB の chat_messages document を表す。 */
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

/** 監視画面へ安全に公開できる最小限の構造化ログ。 */
export interface PlatformLog {
  id: string;
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
  timestamp: string;
}
