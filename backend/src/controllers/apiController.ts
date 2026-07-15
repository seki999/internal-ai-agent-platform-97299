import { NextFunction, Request, Response } from "express";
import { AgentService } from "../services/agentService";
import { AiService } from "../services/aiService";
import { ChatService } from "../services/chatService";
import { LogService } from "../services/logService";
import { PlatformService } from "../services/platformService";

export interface Services {
  agents: AgentService;
  chat: ChatService;
  ai: AiService;
  logs: LogService;
  platform: PlatformService;
}

/** Express 5 の string|string[] parameter を本APIの単一IDへ正規化する。 */
const routeId = (value: string | string[]) => Array.isArray(value) ? value[0] : value;

/** 非同期 controller の例外を共通 error handler へ渡す。 */
export const handle =
  (fn: (request: Request, response: Response) => Promise<unknown> | unknown) =>
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      await fn(request, response);
    } catch (error) {
      next(error);
    }
  };

export const createControllers = (services: Services) => ({
  // healthは外部依存の詳細を返さず、load balancerが判定できる最小情報に限定する。
  health: handle((_request, response) => response.json({ status: "ok", timestamp: new Date().toISOString() })),
  // 以下のcontrollerはHTTP変換だけを担当し、業務判断はServiceへ委譲する。
  dashboard: handle(async (_request, response) => response.json(await services.platform.dashboard())),
  listAgents: handle(async (_request, response) => response.json(await services.agents.list())),
  getAgent: handle(async (request, response) => {
    const agent = await services.agents.get(routeId(request.params.id));
    if (!agent) throw Object.assign(new Error("エージェントが見つかりません"), { statusCode: 404 });
    response.json(agent);
  }),
  // 作成・実行・message送信・評価は新規resource生成として201を返す。
  createAgent: handle(async (request, response) => response.status(201).json(await services.agents.create(request.body))),
  runAgent: handle(async (request, response) => response.status(201).json(await services.agents.run(routeId(request.params.id), request.body.input))),
  listRuns: handle(async (_request, response) => response.json(await services.agents.listRuns())),
  listSessions: handle(async (_request, response) => response.json(await services.chat.listSessions())),
  createSession: handle(async (request, response) => response.status(201).json(await services.chat.createSession(request.body.title))),
  listMessages: handle(async (request, response) => response.json(await services.chat.listMessages(routeId(request.params.id)))),
  sendMessage: handle(async (request, response) => response.status(201).json(await services.chat.sendMessage(routeId(request.params.id), request.body.content))),
  evaluate: handle((request, response) => response.status(201).json(services.ai.evaluate(request.body.prompt, request.body.provider))),
  listLogs: handle((_request, response) => response.json(services.logs.list())),
});
