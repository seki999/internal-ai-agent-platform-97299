import type { Agent, AgentRun, ChatMessage, ChatSession, Dashboard, PlatformLog } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

/** APIエラーを画面へ統一形式で通知する共通 client。 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "APIリクエストに失敗しました");
  return body as T;
}

export const api = {
  dashboard: () => request<Dashboard>("/dashboard"),
  agents: () => request<Agent[]>("/agents"),
  agent: (id: string) => request<Agent>(`/agents/${id}`),
  createAgent: (input: { name: string; description: string }) =>
    request<Agent>("/agents", { method: "POST", body: JSON.stringify(input) }),
  runAgent: (id: string, input: Record<string, unknown>) =>
    request<AgentRun>(`/agents/${id}/run`, { method: "POST", body: JSON.stringify({ input }) }),
  runs: () => request<AgentRun[]>("/agent-runs"),
  sessions: () => request<ChatSession[]>("/chat/sessions"),
  createSession: (title: string) =>
    request<ChatSession>("/chat/sessions", { method: "POST", body: JSON.stringify({ title }) }),
  messages: (id: string) => request<ChatMessage[]>(`/chat/sessions/${id}/messages`),
  sendMessage: (id: string, content: string) =>
    request<{ user: ChatMessage; assistant: ChatMessage }>(`/chat/sessions/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  evaluate: (prompt: string, provider: string) =>
    request<{
      response: string;
      latencyMs: number;
      tokenUsage: { prompt: number; completion: number };
      score: number;
      saved: boolean;
    }>("/ai/evaluate", { method: "POST", body: JSON.stringify({ prompt, provider }) }),
  logs: () => request<PlatformLog[]>("/logs"),
};
