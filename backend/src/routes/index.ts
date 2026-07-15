import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import { createControllers, Services } from "../controllers/apiController";

const validate = (schema: z.ZodTypeAny) =>
  (request: Request, _response: Response, next: NextFunction) => {
    try {
      request.body = schema.parse(request.body);
      next();
    } catch (error) {
      next(Object.assign(error as Error, { statusCode: 400 }));
    }
  };

/** 必須 API を一つの Router に定義し、入力検証を controller より前で実施する。 */
export const createApiRouter = (services: Services) => {
  const router = Router();
  const controller = createControllers(services);
  router.get("/health", controller.health);
  router.get("/dashboard", controller.dashboard);
  router.get("/agents", controller.listAgents);
  router.post("/agents", validate(z.object({ name: z.string().min(2), description: z.string().min(5) })), controller.createAgent);
  router.get("/agents/:id", controller.getAgent);
  router.post("/agents/:id/run", validate(z.object({ input: z.record(z.unknown()) })), controller.runAgent);
  router.get("/agent-runs", controller.listRuns);
  router.get("/chat/sessions", controller.listSessions);
  router.post("/chat/sessions", validate(z.object({ title: z.string().min(1) })), controller.createSession);
  router.get("/chat/sessions/:id/messages", controller.listMessages);
  router.post("/chat/sessions/:id/messages", validate(z.object({ content: z.string().min(1).max(2000) })), controller.sendMessage);
  router.post("/ai/evaluate", validate(z.object({ prompt: z.string().min(3), provider: z.enum(["Azure OpenAI mock", "Local mock"]) })), controller.evaluate);
  router.get("/logs", controller.listLogs);
  return router;
};
