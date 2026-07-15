import { randomUUID } from "node:crypto";
import { ChatMessage, ChatSession } from "../types/domain";

/** mock seed内の作成・更新時刻を同一にし、初期表示の並び順を安定させる。 */
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

  /**
   * HTTP mockとの通信を一か所へ集約する。
   * 非2xxを必ず例外へ変換し、Serviceが不完全なJSONを正常結果として扱わないようにする。
   */
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!response.ok) throw new Error(`CosmosDB mock error: ${response.status}`);
    return response.json() as Promise<T>;
  }

  /** 更新時刻の降順でチャットセッションを取得する。 */
  async listSessions(): Promise<ChatSession[]> {
    if (this.mode === "http") return this.request<ChatSession[]>("/sessions");
    return [...this.sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  /** 新しいセッションへUUIDと監査時刻を付与し、選択中ユーザーに紐付ける。 */
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

  /** sessionIdをCosmosDBのpartition key候補として、会話単位のmessageを取得する。 */
  async listMessages(sessionId: string): Promise<ChatMessage[]> {
    if (this.mode === "http") return this.request<ChatMessage[]>(`/sessions/${sessionId}/messages`);
    return this.messages.filter((message) => message.sessionId === sessionId);
  }

  /**
   * user/assistant messageを共通形式で追加する。
   * message追加時にsessionのupdatedAtも更新し、一覧の最近利用順へ反映する。
   */
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
