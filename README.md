# internal-ai-agent-platform-97299

社内向け生成AIチャット、AIエージェント管理、AIサービス調査・検証、ログ監視を一つにまとめた「社内AIエージェント基盤ポータル」です。TypeScript / Node.js / React / Azure 想定構成 / CosmosDB / PostgreSQL を使い、基本設計からUI機能、API、保存層、テスト、運用設計までを確認できる GitHub portfolio sample として作成しています。

実在する顧客名、企業名、機関名、業務名、秘密情報は含みません。Azureサービスはローカルで費用やAPI keyを必要としない mock / adapter で表現しています。

## 実行画面

### Operations dashboard

![ダッシュボード](screenshots/dashboard.png)

### 生成AIチャット

![生成AIチャット](screenshots/chat.png)

### AIエージェント管理

![AIエージェント一覧](screenshots/agents.png)

### Agent run console

![AIエージェント実行結果](screenshots/agent-run.png)

### AIサービス調査・検証

![AIサービス検証](screenshots/ai-evaluation.png)

### ログ・監視

![監視ダッシュボード](screenshots/monitoring.png)

## 対応技術スタック

| 案件技術・担当領域 | 本プロジェクトでの実装 |
|---|---|
| TypeScript | Frontend / Backend 共通言語、型付きAPI契約 |
| Node.js | Express REST API、CosmosDB compatible mock server |
| React | Chat UI、Dashboard、Agent管理・実行、評価・監視画面 |
| Azure | App Service / Cosmos DB / Azure OpenAI / Monitoring の想定構成 |
| CosmosDB | chat_sessions / chat_messages / agent_memory のdocument設計とadapter |
| PostgreSQL | users / agents / agent_runs / business_tasks のschema・seed |
| 生成AIチャット | session、message保存、Azure AI Service mock応答 |
| 社内AIエージェント基盤 | Agent catalog、definition、execution、history、monitoring |
| 新規AIエージェント開発 | FAQ回答、業務タスク整理、データ要約の3実装 |
| AIサービス調査・検証 | provider、latency、token usage、score、保存結果の比較画面 |
| Web開発 / UI機能拡張 | React Routerによる6業務画面と共通operations console UI |
| 基本設計・詳細設計 | `docs/architecture.md` と `docs/technical-design.md` |

## システム構成

```mermaid
flowchart LR
    U["社内利用者"] --> F["React Frontend"]
    F --> B["Node.js / Express Backend"]
    B --> AS["Agent Service"]
    B --> CS["Chat Service"]
    B --> ES["AI Evaluation Service"]
    AS --> PG["PostgreSQL"]
    CS --> CD["CosmosDB mock adapter"]
    AS --> AI["Azure AI Service mock"]
    ES --> AI
    B --> LM["Logging / Monitoring mock"]
```

Azure 上の想定構成、データフロー、Agent実行 sequence は [docs/architecture.md](docs/architecture.md) を参照してください。

## 主要機能

- Dashboard: Agent数、本日実行回数、Chat session数、AI評価状態、直近履歴、service health
- 生成AIチャット: session作成、message送受信、CosmosDB adapter保存、mock AI応答
- Agent management: 一覧、詳細、input schema、新規Agent作成、実行導線
- Agent run: JSON入力、Zod検証、構造化結果、latency、status、trace、履歴保存
- AI Service Evaluation: prompt、provider、response、latency、token usage、score、保存状態
- Monitoring: API状態、recent warning、CI風test result、resource usage、マスク済みlogs

### 実装済み Agent

| Agent | Input schema | Execution logic / mock response |
|---|---|---|
| FAQ回答エージェント | question, category? | 根拠sourceとconfidenceを持つ回答 |
| 業務タスク整理エージェント | text, dueDate? | priority・期限付きのtaskへ分解 |
| データ要約エージェント | content, maxPoints? | key points・insight・next actionへ要約 |

各Agentは日本語コメント、Zod input schema、実行ロジック、mock応答、共通の実行履歴、400/404 error handling を持ちます。

## ディレクトリ構成

```text
├── frontend/          React / Vite UI、API client、component test
├── backend/           Express API、services、repositories、agents、DB SQL、tests
├── cosmosdb-mock/     JSON保存型のCosmosDB compatible HTTP adapter
├── azure/             App Service / Cosmos DB / AI Service 構成例
├── docs/              Architecture、technical design、structure、setup
├── e2e/               Playwright E2E / route-aware screenshot
├── screenshots/       実画面PNGと生成方法
├── .github/workflows/ install / lint / test / build / E2E
└── docker-compose.yml frontend / backend / postgres / cosmosdb-mock
```

ファイル単位の説明は [docs/project-structure.md](docs/project-structure.md) に記載しています。

## ローカル起動

前提は Node.js 20 以上です。最小構成では外部DBなしで動きます。

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

必要に応じて `.env.example` を `.env` へコピーします。既定値は `POSTGRES_REPOSITORY_MODE=memory`、`COSMOS_REPOSITORY_MODE=memory` です。個別起動は `npm run dev --workspace backend` と `npm run dev --workspace frontend` を使用します。

## Docker 起動

```bash
docker compose up --build
```

| Service | URL / Connection |
|---|---|
| frontend | http://localhost:5173 |
| backend | http://localhost:3001/api |
| PostgreSQL | `postgresql://platform:platform@localhost:5432/ai_platform` |
| CosmosDB compatible mock | http://localhost:8090 |

停止は `docker compose down`、DB volume も削除して初期化する場合は `docker compose down -v` です。Docker は backend を `postgres` mode、CosmosDB adapter を `http` mode で起動します。

## テスト・ビルド

```bash
npm run lint
npm test
npm run test:backend
npm run test:frontend
npm run build
npx playwright install chromium
npm run test:e2e
npm run screenshots
```

- Backend unit: Agent / AI評価ロジック
- API: Supertest による validation、chat、dashboard
- Frontend: React Testing Library component test
- E2E: mock login と主要route遷移
- Screenshots: 実装済み6画面を1440×950で撮影

## スクリーンショット生成

`npm run screenshots` は backend と frontend を自動起動し、mock login → 各route → Agent実行 → AI評価を行って `screenshots/*.png` を更新します。詳細は [screenshots/README.md](screenshots/README.md) を参照してください。

## 技術選定理由

- React + Vite: 多画面UIと状態更新を簡潔に実装し、高速にbuild/testできるため
- TypeScript: Frontend/Backend間のdata contractとAgent出力形式を明確にするため
- Node.js + Express: Chat/Agent向けJSON APIと非同期I/Oを小さなlayer構成で表現できるため
- PostgreSQL: Agent definition、業務task、実行監査履歴の整合性と検索性を確保するため
- CosmosDB mock adapter: 会話documentの柔軟なschemaとpartition設計をAzure費用なしで検証するため
- Docker Compose: frontend/backend/PostgreSQL/document mockを同じ手順で再現するため
- Playwright: route遷移を検証しながらREADME用の実画面を自動更新するため

## Local mock と Azure CosmosDB 実接続

Local memory mode は高速なunit/API test向けで、プロセス終了時に消去されます。Docker の HTTP mode は Git管理外の `cosmosdb-mock/database.local.json` に chat_sessions / chat_messages / agent_memory を保存し、初回だけ `database.json` のseed dataを読み込みます。

Azure実接続では `@azure/cosmos` を使うRepositoryを追加し、endpointは `AZURE_COSMOS_ENDPOINT`、credentialはManaged Identityから取得します。partition key は chat_sessions=`/userId`、chat_messages=`/sessionId`、agent_memory=`/agentId` を想定します。接続情報やkeyをGitへ登録しません。

## 認証について

> 認証方式は案件中未明記のため、この sample では簡易 mock login として実装しています。

mock login は `sessionStorage` に画面状態を保存するだけで、認証・認可機能ではありません。本番化では Microsoft Entra ID、OIDC、token検証、RBACへ置換します。

## セキュリティ考慮

- 実API key、connection string、tokenをリポジトリに保存しない
- `.env.example` は空値/開発用値だけを記載し、`.env` は `.gitignore` 対象
- mock login は検証専用であり、本番認証として使用しない
- Zodによる入力長・必須項目・provider値の検証
- 400 / 404 / 500 の統一error handlingとstack trace非公開
- ログ画面へAPI key、接続文字列、入力全文、個人情報を出力しない
- 実在する顧客・会社・機関・業務を示す名称やデータを含めない
- 本番想定はManaged Identity、Key Vault、private endpoint、WAF、RBAC

## 案件明記事項と sample 完整性のための追加

| 区分 | 内容 |
|---|---|
| 案件で明記 | TypeScript、Node.js、React、Azure基盤、CosmosDB、PostgreSQL、生成AIチャット、社内AIエージェント基盤、新規Agent開発、AIサービス調査・検証、Web開発、基本/詳細設計、UI機能拡張 |
| sample 完整性のために追加 | 簡易mock login、Docker / Docker Compose、GitHub Actions CI、Playwright E2E / screenshot、React Testing Library、Supertest |

案件未記載の追加技術を、案件の必須要件であるかのようには扱っていません。

## 今後の拡張

- Azure OpenAI Service / Azure AI Foundry の実deployment接続
- Azure Cosmos DB SDK とManaged Identityによる実接続
- Microsoft Entra ID SSO、RBAC、利用部門別tenant境界
- Agent workflow engine、tool calling、human-in-the-loop approval
- Retrieval Augmented Generation、vector index、引用根拠表示
- Application Insights、distributed tracing、alert rule
- Azure DevOps pipeline、blue/green deployment
- Bicep / Terraform によるIaCとprivate networking
- Prompt version管理、評価dataset、回帰評価gate

## 設計ドキュメント

- [Architecture](docs/architecture.md)
- [Technical design](docs/technical-design.md)
- [Project structure](docs/project-structure.md)
- [Setup guide](docs/setup.md)
- [Azure configuration](azure/README.md)

## License

Portfolio用途の中立的な実装例です。第三者の機密情報や実システム設定は含みません。
