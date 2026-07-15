import { FormEvent, useState } from "react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";

type Result = Awaited<ReturnType<typeof api.evaluate>>;

export function AiEvaluationPage() {
  const [prompt, setPrompt] = useState("社内問い合わせデータの傾向を3点に整理し、次の改善アクションを提案してください。");
  const [provider, setProvider] = useState("Azure OpenAI mock"); const [result, setResult] = useState<Result>();
  async function evaluate(event: FormEvent) { event.preventDefault(); setResult(await api.evaluate(prompt, provider)); }
  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">AI SERVICE WORKBENCH</span><h1>AIサービス調査・検証</h1><p>Providerごとの応答形式、速度、品質指標を比較して記録します。</p></div><StatusBadge tone="warning">SANDBOX / MOCK</StatusBadge></div>
      <section className="evaluation-grid">
        <form className="panel evaluation-form" onSubmit={evaluate}><div className="panel-head"><div><h2>Evaluation setup</h2><p>検証条件を入力</p></div><span>01</span></div><label>MODEL PROVIDER<select value={provider} onChange={(e) => setProvider(e.target.value)}><option>Azure OpenAI mock</option><option>Local mock</option></select></label><label>PROMPT<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} /></label><div className="option-row"><label>TEMPERATURE<input value="0.2" readOnly /></label><label>MAX TOKENS<input value="512" readOnly /></label></div><button className="primary-button full-button">▶ 評価を実行</button><div className="safe-note">🔒 実API keyは使用せず、すべてmock応答で検証します。</div></form>
        <div className="evaluation-results">
          <article className="panel response-card"><div className="panel-head"><div><h2>Model response</h2><p>{provider}</p></div>{result ? <StatusBadge>SAVED</StatusBadge> : <StatusBadge tone="neutral">NOT RUN</StatusBadge>}</div><div className="response-body">{result?.response ?? "評価を実行すると、モデル応答がここに表示されます。"}</div></article>
          <div className="score-grid"><article><small>LATENCY</small><strong>{result?.latencyMs ?? "—"}<em> ms</em></strong><span>response time</span></article><article><small>TOKEN USAGE</small><strong>{result ? result.tokenUsage.prompt + result.tokenUsage.completion : "—"}</strong><span>prompt + completion</span></article><article className="score-card"><small>EVALUATION SCORE</small><strong>{result?.score ?? "—"}<em> / 5.0</em></strong><div className="score-bar"><i style={{ width: `${(result?.score ?? 0) * 20}%` }} /></div></article></div>
          <article className="panel criteria"><div className="panel-head"><div><h2>Evaluation criteria</h2><p>mock scoring dimensions</p></div></div><div><span>Relevance</span><b>4.8</b></div><div><span>Clarity</span><b>4.6</b></div><div><span>Safety</span><b>4.9</b></div></article>
        </div>
      </section>
    </>
  );
}
