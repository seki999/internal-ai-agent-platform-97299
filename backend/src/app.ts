import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import { BusinessRepository } from "./repositories/businessRepository";
import { CosmosRepository } from "./repositories/cosmosRepository";
import { createApiRouter } from "./routes";
import { AgentService } from "./services/agentService";
import { AiService } from "./services/aiService";
import { ChatService } from "./services/chatService";
import { LogService } from "./services/logService";
import { PlatformService } from "./services/platformService";

/**
 * Express アプリを組み立てる factory。
 * テストから server を起動せず呼べるよう、listen 処理と分離している。
 */
export const createApp = () => {
  const app = express();

  // 環境変数に応じてRepositoryだけを差し替え、Service/Controllerの処理は共通化する。
  const business = new BusinessRepository(env.postgresMode, env.databaseUrl);
  const cosmos = new CosmosRepository(env.cosmosMode, env.cosmosMockUrl);
  const agents = new AgentService(business);
  const chat = new ChatService(cosmos);
  const ai = new AiService();
  const logs = new LogService();
  const platform = new PlatformService(agents, chat, ai);

  // 許可originをFrontendに限定し、想定外サイトからのブラウザ呼び出しを拒否する。
  app.use(cors({ origin: env.frontendOrigin }));
  // JSONサイズを制限し、過大requestによるメモリ消費を抑える。
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", createApiRouter({ agents, chat, ai, logs, platform }));
  // 未定義routeはHTMLではなく統一JSON形式で404を返す。
  app.use((_request, response) => response.status(404).json({ error: "API endpoint が見つかりません" }));
  app.use((error: Error & { statusCode?: number }, _request: Request, response: Response, _next: NextFunction) => {
    // stack や入力全文を返さず、機密情報がログ/レスポンスへ漏れないようにする。
    response.status(error.statusCode ?? 500).json({
      error: error.statusCode ? error.message : "サーバー処理でエラーが発生しました",
    });
  });
  return app;
};
