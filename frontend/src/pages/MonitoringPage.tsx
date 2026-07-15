import { useEffect, useState } from "react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import type { PlatformLog } from "../types";

/**
 * API状態、ログ、テスト結果、resource使用量を俯瞰する監視Page。
 * このsampleでは機密情報を含まないmock telemetryを使い、本番監視画面の情報設計を示す。
 */
export function MonitoringPage() {
  const [logs, setLogs] = useState<PlatformLog[]>([]);
  // 初回だけ構造化ログを取得する。継続pollingは本番の負荷・鮮度要件に合わせる拡張点とする。
  useEffect(() => { api.logs().then(setLogs); }, []);
  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">OBSERVABILITY CENTER</span><h1>ログ・監視ダッシュボード</h1><p>API、データストア、Agent execution の健全性を追跡します。</p></div><button className="secondary-button">↻ Refresh logs</button></div>
      <section className="monitor-stats"><article><i className="pulse" /><div><small>API STATUS</small><strong>Operational</strong></div><span>99.98%</span></article><article><i className="pulse" /><div><small>AVG LATENCY</small><strong>184 ms</strong></div><span>−12%</span></article><article><i className="warn-dot" /><div><small>RECENT ERRORS</small><strong>1 warning</strong></div><span>24 hours</span></article><article><i className="pulse" /><div><small>TEST RESULTS</small><strong>26 / 26 passed</strong></div><span>CI ready</span></article></section>
      <section className="monitor-grid">
        <article className="panel log-stream"><div className="panel-head"><div><h2>Live event stream</h2><p>機密情報をマスクしたアプリケーションログ</p></div><span className="live-indicator"><i /> LIVE</span></div><div className="log-toolbar"><button className="active">All events</button><button>Info</button><button>Warning</button><button>Error</button><input placeholder="ログを検索..." /></div><div className="log-table"><header><span>TIME</span><span>LEVEL</span><span>SOURCE</span><span>MESSAGE</span></header>{logs.map((log) => <div key={log.id}><time>{new Date(log.timestamp).toLocaleTimeString("ja-JP")}</time><StatusBadge tone={log.level === "WARN" ? "warning" : log.level === "ERROR" ? "neutral" : "success"}>{log.level}</StatusBadge><code>{log.source}</code><p>{log.message}</p></div>)}</div></article>
        <aside className="monitor-side">
          <article className="panel test-panel"><div className="panel-head"><div><h2>Test suites</h2><p>latest CI-style result</p></div><strong>100%</strong></div>{[["Backend unit",8],["API / Supertest",7],["Agent execution",6],["Frontend component",5]].map(([name,count]) => <div key={name}><span>✓</span><p><strong>{name}</strong><small>{count} tests passed</small></p><b>PASS</b></div>)}</article>
          <article className="panel resource-panel"><div className="panel-head"><div><h2>Resource usage</h2><p>mock telemetry</p></div></div><label>API compute <span>42%</span></label><div><i style={{ width: "42%" }} /></div><label>PostgreSQL pool <span>28%</span></label><div><i style={{ width: "28%" }} /></div><label>CosmosDB RU <span>61%</span></label><div><i style={{ width: "61%" }} /></div></article>
        </aside>
      </section>
    </>
  );
}
