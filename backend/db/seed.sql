-- 個人・顧客を特定しない中立的な seed data のみを登録する。
-- ON CONFLICT DO NOTHINGにより、既存環境へ再投入しても利用データを上書きしない。

-- mock login後の管理者表示と将来のRBAC検証に使う中立的ユーザー。
INSERT INTO users (id, display_name, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'プラットフォーム管理者', 'admin@internal.local', 'admin')
ON CONFLICT DO NOTHING;

-- 主要3Agentを最初から一覧・実行画面で確認できるよう登録する。
INSERT INTO agents (id, name, description, type, input_schema, status) VALUES
  ('agent-faq', 'FAQ回答エージェント', '社内手続きの質問へ mock 回答を返します。', 'faq', '{"question":"string","category":"string (optional)"}', 'active'),
  ('agent-task', '業務タスク整理エージェント', '依頼文を実行可能なタスクへ整理します。', 'task-organizer', '{"text":"string","dueDate":"string (optional)"}', 'active'),
  ('agent-summary', 'データ要約エージェント', '長文を要点と次の行動へ要約します。', 'summarizer', '{"content":"string","maxPoints":"number (optional)"}', 'active')
ON CONFLICT DO NOTHING;

-- Dashboardの最近の実行履歴を初回起動時から表示するための監査データ。
INSERT INTO agent_runs (id, agent_id, input, output, status, latency_ms, logs, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'agent-faq', '{"question":"申請フローを教えてください"}', '{"answer":"申請ポータルから必要事項を入力します。"}', 'completed', 428, '["入力検証完了","回答生成完了"]', NOW())
ON CONFLICT DO NOTHING;

-- 業務タスクtableの構造と日付型を確認するための最小データ。
INSERT INTO business_tasks (id, title, priority, status, due_date) VALUES
  ('20000000-0000-0000-0000-000000000001', 'AIサービス評価結果を確認', 'high', 'open', CURRENT_DATE + 3)
ON CONFLICT DO NOTHING;
