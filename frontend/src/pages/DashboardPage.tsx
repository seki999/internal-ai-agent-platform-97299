import { useEffect, useState } from "react";
import { api } from "../api/client";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import type { Dashboard } from "../types";

export function DashboardPage() {
  const [data, setData] = useState<Dashboard>();

  useEffect(() => { api.dashboard().then(setData); }, []);

  if (!data) return <div className="loading">プラットフォーム状態を読み込み中...</div>;
  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">OPERATIONS OVERVIEW</span><h1>ダッシュボード</h1><p>AIエージェント基盤の利用状況とサービス状態を確認します。</p></div>
        <button className="secondary-button">↻ データ更新</button>
      </div>
      <section className="stats-grid">
        <StatCard label="稼働エージェント" value={data.metrics.agentCount} meta="3 active / 0 alert" icon="◇" tone="violet" />
        <StatCard label="本日の実行回数" value={data.metrics.todayRuns} meta="前日比 +18.4%" icon="↗" tone="cyan" />
        <StatCard label="Chat sessions" value={data.metrics.chatSessions} meta="平均応答 0.74 sec" icon="✦" tone="blue" />
        <StatCard label="AI Service評価" value={data.metrics.evaluationStatus} meta="直近スコア 4.7 / 5" icon="◎" tone="green" />
      </section>
      <section className="dashboard-grid">
        <article className="panel wide-panel">
          <div className="panel-head"><div><h2>Agent executions</h2><p>直近24時間の実行ボリューム</p></div><span className="legend"><i />Completed <b />Error</span></div>
          <div className="chart">
            {[38,55,44,72,61,83,68,91,79,66,88,96].map((height, index) => <div key={index}><span style={{ height: `${height}%` }} /><small>{`${index + 8}:00`}</small></div>)}
          </div>
        </article>
        <article className="panel health-panel">
          <div className="panel-head"><div><h2>Service health</h2><p>接続先の稼働状態</p></div><StatusBadge>ALL HEALTHY</StatusBadge></div>
          <div className="health-list">
            {data.serviceHealth.map((service) => <div key={service.name}><i /><span><strong>{service.name}</strong><small>Operational</small></span><b>{service.latencyMs} ms</b></div>)}
          </div>
        </article>
        <article className="panel full-panel">
          <div className="panel-head"><div><h2>最近の実行履歴</h2><p>監査可能なAgent run trail</p></div><a href="/monitoring">すべて表示 →</a></div>
          <table><thead><tr><th>AGENT</th><th>STATUS</th><th>LATENCY</th><th>EXECUTED AT</th><th>RUN ID</th></tr></thead>
            <tbody>{data.recentRuns.map((run) => <tr key={run.id}><td><strong>{run.agentName}</strong></td><td><StatusBadge>✓ {run.status}</StatusBadge></td><td>{run.latencyMs} ms</td><td>{new Date(run.createdAt).toLocaleString("ja-JP")}</td><td><code>{run.id.slice(0, 12)}</code></td></tr>)}</tbody>
          </table>
        </article>
      </section>
    </>
  );
}
