# 技術設計書

## 1. 技術方針

Frontend/Backend を TypeScript で統一し、型定義と JSON 契約の認識差を減らします。React Router で画面責務を分離し、Express は routes / controllers / services / repositories / agents に分けています。ローカル既定値は memory mock、Docker は PostgreSQL と HTTP CosmosDB compatible mock を使用します。

## 2. 主要モジュール

| Module | 責務 |
|---|---|
| `routes` | endpoint、HTTP method、Zod input validation |
| `controllers` | HTTP request/response と Service の変換 |
| `services` | Chat、Agent実行、AI評価、Dashboard集約 |
| `repositories` | PostgreSQL / memory、CosmosDB mock の切替 |
| `agents` | Agent別 input schema と execution logic |
| `config` | 環境変数の一元解釈 |
| Frontend `api` | typed REST client と API error 変換 |

## 3. PostgreSQL 設計

| Table | 主な列 | 用途 |
|---|---|---|
| `users` | id, display_name, email, role | 利用者の構造化マスタ |
| `agents` | id, name, type, input_schema, status | Agent definition |
| `agent_runs` | agent_id, input, output, latency_ms, logs | 実行監査履歴 |
| `business_tasks` | title, priority, status, due_date | 業務タスク整理結果の拡張先 |

Agent の input/output は Agent ごとに形が異なるため JSONB、検索・監査に使う状態と時刻は通常列に分けます。`agent_runs(agent_id, created_at)` に index を置き、Agent detail の履歴取得を想定します。

## 4. CosmosDB document 設計

### chat_sessions

```json
{
  "id": "uuid",
  "userId": "mock-user",
  "title": "業務相談",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

想定 partition key は `/userId` です。利用者単位の session 一覧を効率化します。

### chat_messages

```json
{
  "id": "uuid",
  "sessionId": "uuid",
  "role": "user | assistant",
  "content": "message",
  "createdAt": "ISO-8601"
}
```

想定 partition key は `/sessionId` です。会話単位の時系列取得を優先します。`agent_memory` は `/agentId` を候補とし、保持期限と個人情報分類を本番要件で決定します。

## 5. API 設計

| Method | Path | 入力/出力 |
|---|---|---|
| GET | `/api/health` | API health |
| GET | `/api/dashboard` | KPI、recent runs、service health |
| GET/POST | `/api/agents` | Agent一覧 / 作成 |
| GET | `/api/agents/:id` | Agent detail |
| POST | `/api/agents/:id/run` | `{ input }` → AgentRun |
| GET | `/api/agent-runs` | 実行履歴 |
| GET/POST | `/api/chat/sessions` | session一覧 / 作成 |
| GET/POST | `/api/chat/sessions/:id/messages` | message一覧 / 送受信 |
| POST | `/api/ai/evaluate` | prompt/provider → 評価結果 |
| GET | `/api/logs` | マスク済み運用ログ |

## 6. AI Agent 設計

- FAQ回答: `question` を検証し、参照元・confidence を含む応答を返します。
- 業務タスク整理: `text` を priority / dueDate 付き task に分解します。
- データ要約: `content` を key points / insight / next action に構造化します。

すべて外部AIを呼ばない mock ですが、Agent definition → input validation → execution → run history の処理契約は実接続と同じです。本番では `AgentDefinition.execute` の内部だけを Azure AI SDK/agent workflow 呼び出しへ変更します。

## 7. エラー・ログ設計

- Zod schema 違反: HTTP 400 と利用者向けメッセージ
- リソースなし: HTTP 404
- 外部サービス/予期しない例外: 詳細を隠した HTTP 500
- API key、接続文字列、入力全文、stack trace は client response と運用画面へ表示しません。
- correlation ID、構造化 JSON log、Application Insights 連携は本番拡張事項です。

## 8. テスト設計

- Backend unit: AI評価ロジック、Agent service
- API: Supertest による health/dashboard/validation/chat
- Frontend component: React Testing Library による KPI component
- E2E: Playwright による mock login と主要 route 遷移
- Screenshot: 同じ Playwright server 設定で6画面を実撮影
- CI: install → lint/typecheck → test → build → E2E
