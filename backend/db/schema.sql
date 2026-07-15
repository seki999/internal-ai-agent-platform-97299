-- PostgreSQL は構造化されたマスタ・業務タスク・実行履歴を管理する。
-- IF NOT EXISTSを利用し、Docker初期化や手動検証で安全に再適用できるようにする。

-- 利用者マスタ。sampleのmock loginとは分離し、将来のEntra ID subject紐付け先を想定する。
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  display_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(40) NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent定義。Agentごとに異なる入力形式はJSONB、検索対象の状態は通常列で保持する。
CREATE TABLE IF NOT EXISTS agents (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(40) NOT NULL,
  input_schema JSONB NOT NULL DEFAULT '{}'::JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 実行監査履歴。入力・出力・処理ログを残し、障害調査と再現確認に利用する。
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY,
  agent_id VARCHAR(64) NOT NULL REFERENCES agents(id),
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  latency_ms INTEGER NOT NULL,
  logs JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 業務タスク整理Agentの結果を永続化するときの拡張先となるテーブル。
CREATE TABLE IF NOT EXISTS business_tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent詳細から新しい履歴を取得するqueryを高速化する複合index。
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_created ON agent_runs(agent_id, created_at DESC);
