# 環境構築手順

## 1. 前提

- Node.js 20 以上
- npm 10 以上
- Docker Desktop / Docker Compose（コンテナ起動時）
- Git

## 2. npm によるローカル起動

```bash
cp .env.example .env
npm install
npm run dev
```

Windows PowerShell の場合は `Copy-Item .env.example .env` を使用します。ただし `.env` を作成しなくても mock 既定値で起動します。

- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api
- Health: http://localhost:3001/api/health

この方法は `POSTGRES_REPOSITORY_MODE=memory` と `COSMOS_REPOSITORY_MODE=memory` を使用するため、PostgreSQL や Azure アカウントは不要です。プロセス停止後にデータは初期化されます。

## 3. PostgreSQL の個別セットアップ

PostgreSQL 16 へ `backend/db/schema.sql`、続けて `backend/db/seed.sql` を適用します。

```bash
psql "$DATABASE_URL" -f backend/db/schema.sql
psql "$DATABASE_URL" -f backend/db/seed.sql
```

`.env` で次を設定します。

```dotenv
POSTGRES_REPOSITORY_MODE=postgres
DATABASE_URL=postgresql://platform:platform@localhost:5432/ai_platform
```

## 4. Docker Compose

```bash
docker compose up --build
```

停止は `docker compose down`、PostgreSQL volume も初期化する場合は `docker compose down -v` です。Compose は frontend / backend / postgres / cosmosdb-mock を起動し、healthcheck 完了後に依存サービスを開始します。

## 5. テストとスクリーンショット

```bash
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run screenshots
```

Playwright は localhost:3001 と localhost:5173 に既存 server があれば再利用し、なければ自動起動します。

## 6. Azure mock と実接続の違い

| 項目 | Local mock | Azure 実接続 |
|---|---|---|
| CosmosDB | memory または JSON HTTP service | `@azure/cosmos` と Managed Identity |
| AI Service | 固定の構造化応答 | Azure OpenAI deployment |
| PostgreSQL | memory または Docker Postgres | Azure Database for PostgreSQL |
| 認証 | sessionStorage mock login | Entra ID / OIDC / RBAC |
| 監視 | 固定ログ・指標 | Application Insights / Log Analytics |

## 7. よくある問題

### 5173 が開けない

`npm run dev` の frontend ログと、5173 が他プロセスで使用されていないか確認します。Docker 利用時は `docker compose ps` と frontend health を確認します。

### Backend が PostgreSQL 待機で停止する

`docker compose logs postgres` を確認し、既存 volume の schema が古い場合は `docker compose down -v` の後に再構築します。

### スクリーンショットで browser が見つからない

`npx playwright install chromium` を実行します。CI では `--with-deps` を使用しています。

### CosmosDB mock のデータを戻したい

Git管理外の `cosmosdb-mock/database.local.json` を削除すると、次回起動時に `database.json` の中立的なseed dataから再作成されます。実データや秘密情報は保存しないでください。
