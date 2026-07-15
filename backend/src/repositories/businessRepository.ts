import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { Agent, AgentRun, AgentType } from "../types/domain";

/** DBとmemoryで日時表現を揃えるため、API境界ではISO-8601文字列を利用する。 */
const now = () => new Date().toISOString();

// 外部DBなしでも画面・API・テストを確認できる、中立的な初期Agentデータ。
const initialAgents: Agent[] = [
  {
    id: "agent-faq",
    name: "FAQ回答エージェント",
    description: "社内規程や手続きに関する質問へ、根拠付きの mock 回答を返します。",
    type: "faq",
    inputSchema: { question: "string", category: "string (optional)" },
    status: "active",
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "agent-task",
    name: "業務タスク整理エージェント",
    description: "自由記述の依頼を、優先度と期限を持つ実行可能なタスクへ整理します。",
    type: "task-organizer",
    inputSchema: { text: "string", dueDate: "string (optional)" },
    status: "active",
    createdAt: "2026-07-02T09:00:00.000Z",
  },
  {
    id: "agent-summary",
    name: "データ要約エージェント",
    description: "長文データを要点・示唆・次のアクションに分けて要約します。",
    type: "summarizer",
    inputSchema: { content: "string", maxPoints: "number (optional)" },
    status: "active",
    createdAt: "2026-07-03T09:00:00.000Z",
  },
];

// Dashboardと実行履歴画面が初回表示から確認できるようにするseed履歴。
const initialRuns: AgentRun[] = [
  {
    id: "run-seed-1",
    agentId: "agent-faq",
    agentName: "FAQ回答エージェント",
    input: { question: "申請フローを教えてください" },
    output: { answer: "申請ポータルから必要事項を入力し、承認者へ送信します。" },
    status: "completed",
    latencyMs: 428,
    logs: ["入力検証完了", "mock knowledge 検索完了", "回答生成完了"],
    createdAt: "2026-07-15T08:30:00.000Z",
  },
];

/**
 * Agent と実行履歴を扱う Repository。
 * ローカル単体実行はインメモリ、Docker では PostgreSQL を選択できる。
 */
export class BusinessRepository {
  private readonly agents = structuredClone(initialAgents);
  private readonly runs = structuredClone(initialRuns);
  private readonly pool?: Pool;

  /**
   * modeがpostgresのときだけconnection poolを生成する。
   * memoryモードで不要なDB接続を試みないため、ローカル検証とunit testを単独実行できる。
   */
  constructor(mode = "memory", databaseUrl = "") {
    if (mode === "postgres") {
      this.pool = new Pool({ connectionString: databaseUrl });
    }
  }

  /** Agent一覧を作成日時順で取得し、DBのsnake_caseをドメイン型へ変換する。 */
  async listAgents(): Promise<Agent[]> {
    if (!this.pool) return this.agents;
    const result = await this.pool.query(
      "SELECT id, name, description, type, input_schema, status, created_at FROM agents ORDER BY created_at",
    );
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      inputSchema: row.input_schema,
      status: row.status,
      createdAt: row.created_at.toISOString(),
    }));
  }

  /** 保存方式に依存せず、IDが一致するAgentを一件取得する。 */
  async getAgent(id: string): Promise<Agent | undefined> {
    return (await this.listAgents()).find((agent) => agent.id === id);
  }

  /**
   * UIから作成したAgentをdraftとして保存する。
   * custom Agentの実行ロジックは未設定のため、既定schemaを最小構成に限定している。
   */
  async createAgent(input: {
    name: string;
    description: string;
    type?: AgentType;
  }): Promise<Agent> {
    const agent: Agent = {
      id: randomUUID(),
      name: input.name,
      description: input.description,
      type: input.type ?? "custom",
      inputSchema: { text: "string" },
      status: "draft",
      createdAt: now(),
    };
    if (!this.pool) {
      this.agents.push(agent);
      return agent;
    }
    await this.pool.query(
      `INSERT INTO agents (id, name, description, type, input_schema, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [agent.id, agent.name, agent.description, agent.type, agent.inputSchema, agent.status, agent.createdAt],
    );
    return agent;
  }

  /** 監視・Dashboard用途のため、新しい実行履歴から最大50件を返す。 */
  async listRuns(): Promise<AgentRun[]> {
    if (!this.pool) return [...this.runs].reverse();
    const result = await this.pool.query(
      `SELECT r.id, r.agent_id, a.name AS agent_name, r.input, r.output,
              r.status, r.latency_ms, r.logs, r.created_at
         FROM agent_runs r JOIN agents a ON a.id = r.agent_id
        ORDER BY r.created_at DESC LIMIT 50`,
    );
    return result.rows.map((row) => ({
      id: row.id,
      agentId: row.agent_id,
      agentName: row.agent_name,
      input: row.input,
      output: row.output,
      status: row.status,
      latencyMs: row.latency_ms,
      logs: row.logs,
      createdAt: row.created_at.toISOString(),
    }));
  }

  /** 実行結果をinput/output/logsごと保存し、後から監査できる形を保つ。 */
  async saveRun(run: AgentRun): Promise<void> {
    if (!this.pool) {
      this.runs.push(run);
      return;
    }
    await this.pool.query(
      `INSERT INTO agent_runs
       (id, agent_id, input, output, status, latency_ms, logs, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [run.id, run.agentId, run.input, run.output, run.status, run.latencyMs, run.logs, run.createdAt],
    );
  }
}
