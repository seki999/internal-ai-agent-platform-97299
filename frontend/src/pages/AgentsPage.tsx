import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import type { Agent } from "../types";

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<Agent>();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const navigate = useNavigate();
  useEffect(() => { api.agents().then((items) => { setAgents(items); setSelected(items[0]); }); }, []);

  async function create(event: FormEvent) {
    event.preventDefault(); const agent = await api.createAgent({ name, description });
    setAgents((items) => [...items, agent]); setSelected(agent); setShowForm(false); setName(""); setDescription("");
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">AGENT CATALOG</span><h1>AIエージェント管理</h1><p>Agent definition、入力schema、実行状態を一元管理します。</p></div><button className="primary-button" onClick={() => setShowForm(!showForm)}>＋ 新規AIエージェント</button></div>
      {showForm && <form className="create-form panel" onSubmit={create}><label>Agent name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：文書分類エージェント" required minLength={2} /></label><label>Description<input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="エージェントの目的と処理内容" required minLength={5} /></label><button className="primary-button">下書きを作成</button></form>}
      <section className="agent-layout">
        <div className="agent-cards">
          <div className="section-caption"><strong>AGENTS</strong><span>{agents.length} definitions</span></div>
          {agents.map((agent, index) => <button className={`agent-card ${selected?.id === agent.id ? "selected" : ""}`} key={agent.id} onClick={() => setSelected(agent)}><div className={`agent-symbol color-${index % 3}`}>{index === 0 ? "?" : index === 1 ? "✓" : "≡"}</div><div className="agent-card-body"><span><StatusBadge tone={agent.status === "active" ? "success" : "neutral"}>{agent.status}</StatusBadge><small>TYPE / {agent.type}</small></span><h2>{agent.name}</h2><p>{agent.description}</p><footer><span>Runs today <strong>{18 - index * 4}</strong></span><span>Success <strong>{99 - index}.2%</strong></span><b>→</b></footer></div></button>)}
        </div>
        {selected && <aside className="agent-detail panel"><div className="detail-head"><span className="agent-symbol color-0">✦</span><div><small>AGENT DETAIL</small><h2>{selected.name}</h2></div></div><p>{selected.description}</p><div className="detail-section"><label>EXECUTION STATUS</label><div className="status-row"><StatusBadge>{selected.status.toUpperCase()}</StatusBadge><span>Last run 12 min ago</span></div></div><div className="detail-section"><label>INPUT SCHEMA</label><pre>{JSON.stringify(selected.inputSchema, null, 2)}</pre></div><div className="detail-section"><label>PIPELINE</label><div className="pipeline"><span>Validate</span><i>→</i><span>Agent</span><i>→</i><span>Persist</span></div></div><button className="primary-button full-button" onClick={() => navigate(`/agents/${selected.id}/run`)}>このAgentを実行 ↗</button></aside>}
      </section>
    </>
  );
}
