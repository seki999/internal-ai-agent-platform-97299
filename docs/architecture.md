# アーキテクチャ設計

## 1. システム構成

```mermaid
flowchart LR
    User["社内利用者"] --> React["React / Vite Frontend"]
    React --> API["Node.js / Express REST API"]
    API --> Agent["Agent Service"]
    API --> Chat["Chat Service"]
    API --> Eval["AI Evaluation Service"]
    Agent --> PG["PostgreSQL\nagents / runs / tasks"]
    Chat --> Cosmos["CosmosDB adapter\nlocal compatible mock"]
    Agent --> AI["Azure AI Service mock"]
    Eval --> AI
    API --> Logs["Logging / Monitoring mock"]
```

Frontend は表示とユーザー操作、Express は入力検証とユースケース調整、Service は業務処理、Repository は保存先差異を担当します。外部AIやAzure Cosmos DBへの接続を境界に閉じ込め、ローカルでも同じ API 契約を検証できます。

## 2. Azure 想定アーキテクチャ

```mermaid
flowchart TB
    Internet["Corporate network / Private access"] --> FrontDoor["Azure Front Door + WAF"]
    FrontDoor --> Web["Azure App Service\nReact frontend"]
    Web --> Api["Azure App Service\nNode.js API"]
    Api --> Identity["Managed Identity"]
    Identity --> KeyVault["Azure Key Vault"]
    Api --> OpenAI["Azure OpenAI Service"]
    Api --> Cosmos["Azure Cosmos DB for NoSQL"]
    Api --> PostgreSQL["Azure Database for PostgreSQL"]
    Api --> Monitor["Application Insights"]
    Monitor --> LogAnalytics["Log Analytics workspace"]
```

本番では private endpoint、VNet integration、Managed Identity、Key Vault、WAF を組み合わせる想定です。本リポジトリはクラウド費用と秘密情報を必要とせず確認できるよう、外部サービスを mock 化しています。

## 3. データフロー

1. React がユーザー入力を受け、API client が JSON へ変換します。
2. Express route が Zod schema で入力を検証します。
3. Controller が対応 Service を呼び、Service が Agent definition または Repository を調整します。
4. 構造化データは PostgreSQL、会話系 document は CosmosDB adapter へ保存します。
5. レスポンスは機密情報を除いた JSON として UI へ返ります。

## 4. API の流れ

```mermaid
sequenceDiagram
    participant UI as React UI
    participant Route as Express Route
    participant Service as Application Service
    participant Repo as Repository
    UI->>Route: REST request / JSON
    Route->>Route: Zod input validation
    Route->>Service: validated command
    Service->>Repo: query / persist
    Repo-->>Service: domain data
    Service-->>UI: typed JSON response
```

## 5. Agent 実行フロー

```mermaid
sequenceDiagram
    participant User as 利用者
    participant API as Agent API
    participant Agent as Agent Service
    participant AI as AI Service mock
    participant PG as PostgreSQL
    User->>API: POST /agents/:id/run
    API->>Agent: schema 検証済み input
    Agent->>Agent: Agent definition 選択
    Agent->>AI: mock execution
    AI-->>Agent: structured response
    Agent->>PG: agent_runs 保存
    Agent-->>User: result / latency / logs
```

各 Agent は入力 schema、実行ロジック、mock 応答を持ちます。入力違反は 400、未登録 Agent は 404、予期しない例外は詳細を隠した 500 とします。

## 6. 認証フロー

認証方式は案件中未明記のため、この sample では簡易 mock login として実装しています。画面上の mock login は `sessionStorage` だけを使い、本人確認や認可を提供しません。

本番想定では、React → Microsoft Entra ID → OIDC token → Express middleware → RBAC 判定という流れへ置換します。mock login は UI 導線確認だけのため、業務利用できません。
