import { CosmosRepository } from "../repositories/cosmosRepository";

/** チャット入力と mock AI 応答を同じセッションへ保存する。 */
export class ChatService {
  constructor(private readonly repository: CosmosRepository) {}

  listSessions() {
    return this.repository.listSessions();
  }

  createSession(title: string) {
    return this.repository.createSession(title);
  }

  listMessages(sessionId: string) {
    return this.repository.listMessages(sessionId);
  }

  async sendMessage(sessionId: string, content: string) {
    const user = await this.repository.addMessage(sessionId, "user", content);
    const assistant = await this.repository.addMessage(
      sessionId,
      "assistant",
      `ご依頼「${content}」を確認しました。これは Azure AI Service 接続を想定した mock 応答です。必要に応じてFAQ回答・タスク整理・データ要約エージェントへ連携できます。`,
    );
    return { user, assistant };
  }
}
