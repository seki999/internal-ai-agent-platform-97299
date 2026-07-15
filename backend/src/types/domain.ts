export type AgentType = "faq" | "task-organizer" | "summarizer" | "custom";
export type RunStatus = "completed" | "failed";

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  inputSchema: Record<string, string>;
  status: "active" | "draft";
  createdAt: string;
}

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

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface PlatformLog {
  id: string;
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
  timestamp: string;
}
