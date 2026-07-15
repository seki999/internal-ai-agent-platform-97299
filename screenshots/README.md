# スクリーンショット

このディレクトリの PNG は、実装済み React 画面を Playwright で撮影した成果物です。静的なプレースホルダーではありません。

```bash
npm install
npx playwright install chromium
npm run screenshots
```

`npm run screenshots` は backend（3001）と frontend（5173）を起動し、mock login 後に次の画面を巡回します。

- `dashboard.png`: 利用状況とサービスヘルス
- `chat.png`: セッション一覧と生成AIチャット
- `agents.png`: Agent catalog と detail
- `agent-run.png`: JSON入力、実行結果、trace
- `ai-evaluation.png`: provider比較と評価指標
- `monitoring.png`: ログ、テスト結果、リソース監視

既に開発サーバーが動作している場合は、そのプロセスを再利用します。
