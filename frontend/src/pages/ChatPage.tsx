import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import type { ChatMessage, ChatSession } from "../types";

/**
 * CosmosDBのdocument構造を想定した生成AIチャットPage。
 * session選択とmessage表示を分け、会話を切り替えても同じ入力componentを再利用する。
 */
export function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // 初回にsession一覧を取得し、最新sessionを自動選択して空画面を避ける。
  useEffect(() => {
    api.sessions().then((items) => { setSessions(items); if (items[0]) setActiveId(items[0].id); });
  }, []);
  // 選択中IDが変わったときだけ該当partitionのmessageを再取得する。
  useEffect(() => { if (activeId) api.messages(activeId).then(setMessages); }, [activeId]);

  /** 新規sessionを一覧先頭へ追加し、作成直後から入力可能な状態へ切り替える。 */
  async function createSession() {
    const session = await api.createSession("新しい業務相談");
    setSessions((current) => [session, ...current]); setActiveId(session.id); setMessages([]);
  }

  /**
   * 空文字と二重送信を防ぎ、user/assistantの2messageをAPI結果から一度に反映する。
   * 先に入力欄を空にすることで、network待機中も送信済みであることが利用者へ伝わる。
   */
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!text.trim() || !activeId) return;
    setSending(true);
    const value = text; setText("");
    const result = await api.sendMessage(activeId, value);
    setMessages((current) => [...current, result.user, result.assistant]); setSending(false);
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">GENERATIVE AI CHAT</span><h1>生成AIチャット</h1><p>業務相談をAgent orchestrationへ安全に接続します。</p></div><button className="primary-button" onClick={createSession}>＋ 新規セッション</button></div>
      <section className="chat-shell panel">
        <aside className="session-list"><div className="session-head">CHAT SESSIONS <span>{sessions.length}</span></div>
          {sessions.map((session) => <button className={session.id === activeId ? "active" : ""} onClick={() => setActiveId(session.id)} key={session.id}><i>✦</i><span><strong>{session.title}</strong><small>{new Date(session.updatedAt).toLocaleDateString("ja-JP")} · CosmosDB mock</small></span></button>)}
          <div className="storage-note"><strong>◈ Storage connected</strong><span>CosmosDB compatible adapter</span></div>
        </aside>
        <div className="conversation">
          <div className="conversation-head"><span className="agent-avatar">AI</span><div><strong>Platform Assistant</strong><small><i /> Azure AI Service mock · online</small></div><button>···</button></div>
          <div className="message-list">
            <div className="date-divider">TODAY</div>
            {messages.map((message) => <div className={`message ${message.role}`} key={message.id}>{message.role === "assistant" && <span className="mini-avatar">AI</span>}<div><small>{message.role === "assistant" ? "Platform Assistant" : "You"}</small><p>{message.content}</p><time>{new Date(message.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</time></div></div>)}
            {sending && <div className="typing">AI が応答を生成しています <span>•••</span></div>}
          </div>
          <form className="chat-composer" onSubmit={submit}><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="業務上の質問を入力してください..." /><div><span>入力内容は mock storage に保存されます</span><button className="primary-button" disabled={sending}>送信 ↗</button></div></form>
        </div>
      </section>
    </>
  );
}
