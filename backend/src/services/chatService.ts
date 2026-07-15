import { CosmosRepository } from "../repositories/cosmosRepository";

/**
 * チャット入力とmock AI応答を同じセッションへ保存するService。
 * Controllerから保存方式を隠し、memory・HTTP mock・将来のAzure CosmosDBで同じ流れを再利用する。
 */
export class ChatService {
  constructor(private readonly repository: CosmosRepository) {}

  /** 左ペインへ表示するセッション一覧を取得する。 */
  listSessions() {
    return this.repository.listSessions();
  }

  /** 利用者が開始した新規業務相談のセッションを作成する。 */
  createSession(title: string) {
    return this.repository.createSession(title);
  }

  /** 選択中セッションの会話を時系列で取得する。 */
  listMessages(sessionId: string) {
    return this.repository.listMessages(sessionId);
  }

  /**
   * user messageを先に保存し、その後にassistant mock応答を保存する。
   * 両messageを返すことで、Frontendは追加の再取得なしに会話へ反映できる。
   */
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
