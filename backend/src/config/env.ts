import { existsSync } from "node:fs";
import path from "node:path";

// workspace root の .env が存在するときだけ読み込み、未作成でもmock既定値で起動できるようにする。
const envFile = path.resolve(process.cwd(), "..", ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

/**
 * 環境変数を一か所で解釈する。
 * 秘密情報をソースへ埋め込まず、ローカルでは mock を既定値にする。
 */
export const env = {
  port: Number(process.env.PORT ?? 3001),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  postgresMode: process.env.POSTGRES_REPOSITORY_MODE ?? "memory",
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://platform:platform@localhost:5432/ai_platform",
  cosmosMode: process.env.COSMOS_REPOSITORY_MODE ?? "memory",
  cosmosMockUrl: process.env.COSMOS_MOCK_URL ?? "http://localhost:8090",
};
