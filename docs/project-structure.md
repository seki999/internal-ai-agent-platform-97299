# プロジェクト構成

```text
internal-ai-agent-platform-97299/
├── .github/workflows/ci.yml       # GitHub Actions
├── azure/                          # Azure移行時の設定境界
├── backend/
│   ├── db/                         # PostgreSQL schema / seed
│   └── src/
│       ├── agents/                 # 3種類のAgent definition
│       ├── config/                 # 環境変数
│       ├── controllers/            # HTTP controller
│       ├── repositories/           # PostgreSQL / CosmosDB adapter
│       ├── routes/                 # REST endpoint / validation
│       ├── services/               # ユースケース
│       ├── tests/                  # unit / API / Agent tests
│       └── types/                  # domain type
├── cosmosdb-mock/                  # JSON document compatible mock service
├── docs/                           # 設計・構築ドキュメント
├── e2e/                            # Playwright E2E / screenshot
├── frontend/
│   └── src/
│       ├── api/                    # typed API client
│       ├── components/             # 共通UI
│       ├── pages/                  # 6つの主要画面 + mock login
│       ├── styles/                 # portal theme
│       ├── tests/                  # component test
│       └── types/                  # frontend types
├── screenshots/                    # Playwrightで撮影したPNG
├── .env.example                    # 秘密値を含まない設定例
├── docker-compose.yml              # 4 service local stack
├── package.json                    # workspace scripts
└── README.md                        # Portfolio entry point
```

## 主要ファイル

| File | 役割 |
|---|---|
| `frontend/src/App.tsx` | mock login と route 定義 |
| `frontend/src/components/Layout.tsx` | sidebar/topbar 共通レイアウト |
| `frontend/src/pages/*` | Dashboard、Chat、Agents、Run、Evaluation、Monitoring |
| `backend/src/app.ts` | Express middleware と依存関係組立 |
| `backend/src/routes/index.ts` | 必須 REST API と input validation |
| `backend/src/services/agentService.ts` | Agent実行・例外変換・履歴保存 |
| `backend/src/repositories/businessRepository.ts` | memory/PostgreSQL切替 |
| `backend/src/repositories/cosmosRepository.ts` | memory/HTTP mock切替 |
| `backend/db/schema.sql` | users/agents/agent_runs/business_tasks |
| `cosmosdb-mock/server.mjs` | chat documentのJSON永続化mock |
| `e2e/screenshot.spec.ts` | route-awareな実画面撮影 |

`docs` は設計根拠、`azure` は実クラウド移行境界、`screenshots` は動作結果を説明します。生成物 `dist`、依存関係 `node_modules`、秘密値 `.env` は Git 管理対象外です。
