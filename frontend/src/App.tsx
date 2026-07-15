import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AgentRunPage } from "./pages/AgentRunPage";
import { AgentsPage } from "./pages/AgentsPage";
import { AiEvaluationPage } from "./pages/AiEvaluationPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { MonitoringPage } from "./pages/MonitoringPage";

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("mock-auth") === "true");
  if (!authenticated) return <LoginPage onLogin={() => { sessionStorage.setItem("mock-auth", "true"); setAuthenticated(true); }} />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="agents/:id/run" element={<AgentRunPage />} />
        <Route path="evaluation" element={<AiEvaluationPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
