# Azure 構成例

このディレクトリは、Azure 上へ移行するときの設定境界を示すための構成例です。JSON はそのままデプロイする ARM template ではなく、App Service、Cosmos DB、Azure OpenAI Service に渡す主要設定の設計サンプルです。

## 想定配置

- React build: Azure App Service または Static Web Apps
- Express API: Azure App Service for Linux
- PostgreSQL: Azure Database for PostgreSQL Flexible Server
- Document store: Azure Cosmos DB for NoSQL
- AI: Azure OpenAI Service / Azure AI Foundry で管理する deployment
- Secrets: Key Vault と Managed Identity
- Monitoring: Application Insights / Log Analytics

実接続時は `backend/src/repositories/cosmosRepository.ts` と `backend/src/services/aiService.ts` の mock 実装を Azure SDK adapter に置き換えます。接続文字列やAPI keyはリポジトリへ保存せず、Managed Identity と Key Vault を優先します。
