import { z } from "zod";

export interface AgentDefinition {
  type: string;
  inputSchema: z.ZodTypeAny;
  execute(input: unknown): Promise<Record<string, unknown>>;
}
