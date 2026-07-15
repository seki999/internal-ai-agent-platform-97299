import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import type { Agent, AgentRun } from "../types";

// 各Agentのschemaに合う初期JSONを用意し、初回閲覧者がすぐ実行フローを確認できるようにする。
const defaults: Record<string, string> = {
  "agent-faq": '{\n  "question": "申請フローと必要な確認事項を教えてください",\n  "category": "社内手続き"\n}',
  "agent-task": '{\n  "text": "月次報告の準備、レビュー、関係者共有を整理してください",\n  "dueDate": "2026-07-18"\n}',
  "agent-summary": '{\n  "content": "今期は問い合わせ対応時間が改善しました。一方でデータ品質の継続確認が必要です。次回は監視指標を見直します。",\n  "maxPoints": 3\n}',
};

/**
 * Agentの入力schema、実行結果、latency、status、処理traceを同時に確認する実行Page。
 * JSONを直接編集できる形式にし、正常系だけでなくvalidation errorもPortfolio上で確認可能にする。
 */
export function AgentRunPage() {
  const { id = "agent-faq" } = useParams();
  const [agent, setAgent] = useState<Agent>();
  const [input, setInput] = useState(defaults[id] ?? '{\n  "text": "確認対象"\n}');
  const [run, setRun] = useState<AgentRun>(); const [error, setError] = useState("");
  // URL parameterが変わるたびにAgent definitionを取得し、schema表示を実行対象と同期する。
  useEffect(() => { api.agent(id).then(setAgent); }, [id]);

  /**
   * textareaのJSONを構造化し、Agent APIへ送信する。
   * JSON構文エラーとAPI validation errorを同じerror領域へ表示し、失敗理由を利用者へ残す。
   */
  async function execute(event: FormEvent) {
    event.preventDefault(); setError("");
    try { setRun(await api.runAgent(id, JSON.parse(input))); } catch (err) { setError(err instanceof Error ? err.message : "実行に失敗しました"); }
  }

  return (
    <>
      <div className="breadcrumb"><Link to="/agents">AIエージェント</Link><span>/</span>実行コンソール</div>
      <div className="page-heading"><div><span className="eyebrow">AGENT RUN CONSOLE</span><h1>{agent?.name ?? "Agent を読み込み中"}</h1><p>入力検証から実行履歴保存までの処理を確認します。</p></div>{run && <StatusBadge>✓ EXECUTION COMPLETED</StatusBadge>}</div>
      <section className="run-grid">
        <form className="panel run-input" onSubmit={execute}><div className="panel-head"><div><h2>Input payload</h2><p>JSON / schema validated</p></div><span className="code-tag">application/json</span></div><textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} /><div className="schema-hint"><strong>Required schema</strong><code>{JSON.stringify(agent?.inputSchema ?? {})}</code></div>{error && <div className="error-box">{error}</div>}<button className="primary-button full-button">▶ Agent を実行</button></form>
        <div className="run-results">
          <article className="panel result-panel"><div className="panel-head"><div><h2>Execution result</h2><p>Structured mock AI response</p></div>{run ? <StatusBadge>COMPLETED</StatusBadge> : <StatusBadge tone="neutral">READY</StatusBadge>}</div><pre>{run ? JSON.stringify(run.output, null, 2) : "// 実行ボタンを押すと、\n// ここに構造化された応答が表示されます。"}</pre></article>
          <div className="run-metrics"><div><small>LATENCY</small><strong>{run?.latencyMs ?? "—"}<em>{run ? " ms" : ""}</em></strong></div><div><small>STATUS</small><strong>{run?.status ?? "ready"}</strong></div><div><small>RUN ID</small><code>{run?.id.slice(0, 10) ?? "not-created"}</code></div></div>
          <article className="panel execution-log"><div className="panel-head"><div><h2>Execution logs</h2><p>機密情報を除外した処理記録</p></div><span>LIVE TRACE</span></div>{(run?.logs ?? ["入力待機中", "schema validation ready", "mock AI service ready"]).map((log, index) => <div key={log}><time>00:00:0{index}</time><i className={run ? "done" : ""} /><span>{log}</span></div>)}</article>
        </div>
      </section>
    </>
  );
}
