import { randomUUID } from "node:crypto";
import { ChatMessage, ChatSession } from "../types/domain";

const createdAt = new Date().toISOString();

/**
 * CosmosDB の用途を抽象化した Repository。
 * Azure SDK への依存を閉じ込め、ローカルでは memory/http mock を利用する。
 */
export class CosmosRepository {
  private readonly sessions: ChatSession[] = [
    {
      id: "session-welcome",
      title: "プラットフォーム利用ガイド",
      userId: "mock-user",
      createdAt,
      updatedAt: createdAt,
    },
  ];
  private readonly messages: ChatMessage[] = [
    {
      id: "message-welcome",
      sessionId: "session-welcome",
      role: "assistant",
      content: "こんにちは。社内AIエージェント基盤の操作についてご案内します。",
      createdAt,
    },
  ];

  constructor(
    private readonly mode = "memory",
    private readonly baseUrl = "http://localhost:8090",
  ) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!response.ok) throw new Error(`CosmosDB mock error: ${response.status}`);
    return response.json() as Promise<T>;
  }

  async listSessions(): Promise<ChatSession[]> {
    if (this.mode === "http") return this.request<ChatSession[]>("/sessions");
    return [...this.sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async createSession(title: string): Promise<ChatSession> {
    if (this.mode === "http") {
      return this.request<ChatSession>("/sessions", {
        method: "POST",
        body: JSON.stringify({ title, userId: "mock-user" }),
      });
    }
    const session: ChatSession = {
      id: randomUUID(),
      title,
      userId: "mock-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.push(session);
    return session;
  }

  async listMessages(sessionId: string): Promise<ChatMessage[]> {
    if (this.mode === "http") return this.request<ChatMessage[]>(`/sessions/${sessionId}/messages`);
    return this.messages.filter((message) => message.sessionId === sessionId);
  }

  async addMessage(sessionId: string, role: ChatMessage["role"], content: string): Promise<ChatMessage> {
    if (this.mode === "http") {
      return this.request<ChatMessage>(`/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ role, content }),
      });
    }
    const message: ChatMessage = {
      id: randomUUID(),
      sessionId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(message);
    const session = this.sessions.find((item) => item.id === sessionId);
    if (session) session.updatedAt = message.createdAt;
    return message;
  }
}
